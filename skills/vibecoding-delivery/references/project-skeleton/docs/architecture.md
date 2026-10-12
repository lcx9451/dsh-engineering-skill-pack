# 架构总览（L1）

> **L1 规则：≤ 5KB，只写"模块名 + 一句话职责"，每次定位默认加载。**
> 模块内部细节写在 `docs/modules/<module>.md`（L2），按需加载。
> 本文件是**架构唯一源**：新增模块必须先在这里注册。

| 项 | 值 |
|---|---|
| 版本 | v0.1 |
| 最后更新 | <YYYY-MM-DD> |

## 一、系统形态

- **形态**：<单体模块化 / 前后端分离 / 少量服务>
- **部署单元**：<一个容器 / 静态站点 + API>
- **同步 / 异步边界**：<哪些路径同步返回；哪些走队列异步处理>
- **事务边界**：<事务覆盖到哪一层；跨模块如何保证一致性（本地消息表 / 事件）>
- **幂等设计**：<幂等键取什么；重试入口在哪>

## 二、模块清单

| 模块 | 一句话职责 | L2 文档 | 依赖谁 | 被谁依赖 |
|---|---|---|---|---|
| `<core>` | <领域模型与业务规则，不含 IO> | `docs/modules/core.md` | 无 | 全部 |
| `<api>` | <HTTP 入口：鉴权、校验、编排> | `docs/modules/api.md` | core, infra | — |
| `<worker>` | <异步任务消费与重试> | `docs/modules/worker.md` | core, infra | — |
| `<infra>` | <数据库、缓存、外部服务适配器> | `docs/modules/infra.md` | 无 | core, api, worker |
| `<web>` | <前端界面> | `docs/modules/web.md` | api | — |

> 每个模块**只允许依赖"依赖谁"列出的模块**。禁止环形依赖。

## 三、分层与依赖方向（机械检查）

```
web ──▶ api ──▶ core ──▶ infra
                  ▲
       worker ────┘
```

**禁止的调用方向**（由 `dependency-cruiser` 检查，规则文件 `.dependency-cruiser.cjs`）：

- Controller / 路由层禁止直接访问数据库或 ORM（必须经 core）
- core 禁止 import web、api、worker
- infra 禁止 import core 之上的任何业务模块
- 禁止跨模块直接引用对方内部文件（只能走对方公开入口 `index.ts`）

登记在 `depcruise` 里的规则（与上表一致，改架构必须同步改规则）：

```js
// .dependency-cruiser.cjs 关键规则（示意）
forbidden: [
  { name: 'no-controller-to-db', severity: 'error',
    from: { path: '^src/api' }, to: { path: '^src/infra/(db|orm)' } },
  { name: 'core-is-pure', severity: 'error',
    from: { path: '^src/core' }, to: { path: '^src/(web|api|worker)' } },
  { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
]
```

## 四、外部依赖与边界

| 外部系统 | 用途 | 失败时的降级 | 超时 / 重试 | 契约位置 |
|---|---|---|---|---|
| <OCR 服务> | <简历解析> | <转本地解析 + 标记待人工> | <3s / 3 次指数退避> | `docs/api/openapi.yaml` |

## 五、关键流程（只写跨模块的那几条）

| 流程 | 入口 | 经过模块 | 失败点 | 用户可见行为 |
|---|---|---|---|---|
| <提交简历→解析→入库→通知> | `<api POST /resumes>` | api → core → infra → worker | <解析超时> | <标记"处理中"，超时后置失败并通知> |
