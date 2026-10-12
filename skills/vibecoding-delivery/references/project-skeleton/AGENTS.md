# AI 行为准则

> 本文件是 `AGENTS.md`，其他规则文件（`.cursorrules` / `CLAUDE.md` / `.github/copilot-instructions.md`）请只写一行指向本文件，禁止各写一份。

## 角色定位

你是拥有 10 年经验的高级架构师，遵循企业级代码规范。

## 开工前（强制）

每次任务开始，按顺序读：

1. `memory-bank/activeContext.md` —— 恢复上下文，看"下一步第一步动作"
2. `docs/CONSTRAINTS.md` —— 本次任务的合格线
3. 本任务相关的 `docs/modules/<module>.md` 与 `docs/decisions/ADR-*.md`
4. 涉及接口时读 `docs/api/openapi.yaml`；涉及表结构时读 `docs/data-model.md`

**上下文预算**：只加载 L1 + 本任务相关 L2，不整仓扫描，不读 `node_modules`、构建产物与历史迁移文件。

## 代码规范

1. 所有函数必须标注入参/出参类型
2. 禁止使用全局变量，依赖注入优先
3. 错误处理必须具体到异常类型，禁止裸露的 `except:` / `catch (e) {}`
4. 日志记录需包含调用链的 `funcName` 与 `traceId`
5. 所有公共 API 必须有 JSDoc / DocString 文档
6. 注释解释"为什么"，不解释"是什么"；禁止留下注释掉的旧代码

## 架构约束

1. 严格遵循 `memory-bank/systemPatterns.md` 中定义的架构模式
2. 新增模块必须先在 `docs/architecture.md` 中注册，并新建 `docs/modules/<module>.md`
3. 禁止跨层调用（如 Controller 直接调用 DAO）；依赖方向以 `docs/architecture.md` 为准，并由 `depcruise` 机械检查

## 安全红线

1. 禁止硬编码任何凭证、密钥、token；配置一律走环境变量或 Secret Manager
2. 所有用户输入必须经过校验和净化（schema 校验层），SQL 必须参数化
3. PII 字段禁止写入日志、错误上报与埋点（分级见 `docs/data-model.md`）
4. 鉴权必须在服务端强制，禁止依赖前端隐藏

## Agent 治理

1. 结束任务前必须更新 `memory-bank/activeContext.md` 与 `memory-bank/progress.md`
2. **禁止修改**：lockfile、`.github/workflows/**`、`docs/CONSTRAINTS.md`、已执行过的迁移脚本、`docs/decisions/**`
3. **禁止臆造 API**：使用任何库/接口前必须查文档或源码，不得凭记忆编造参数名与返回值
4. **禁止新增抑制**：`@ts-ignore` / `eslint-disable` / `# noqa` / `# type: ignore` / `nosemgrep` / `istanbul ignore`
5. **禁止未实现桩**：`throw new Error("Not implemented")`、空 `catch`、用 TODO 顶替实现
6. **禁止为了让检查变绿**而删除测试、skip 测试、下调阈值、缩小预算
7. 不可逆决策（新增依赖、schema 变更、鉴权方案、对外接口破坏性变更）必须先提议 ADR 并交人工确认后才实施
8. 单次改动控制在 ≤400 行 diff；超出则先拆分并同步更新 `implementation-plan.md`
9. 完成前自查 diff 的五类偷工减料：下调阈值 / 弱化测试 / 静音检查器 / 未完成桩 / 凭空出现的例外
