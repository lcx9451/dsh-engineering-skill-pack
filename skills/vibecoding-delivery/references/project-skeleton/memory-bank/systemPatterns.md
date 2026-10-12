# 架构规范与代码模板（systemPatterns.md）

> 回答"代码该长什么样"。**这是 AI 生成代码时的默认范式**：正例照抄，反例禁止。
> 架构分层见 `docs/architecture.md`（L1），模块细节见 `docs/modules/`（L2）。

## 一、通用模式

### 1. 依赖注入而非全局单例

```ts
// ✅ 依赖从外部传入，测试可替换
export function createResumeService(deps: {
  repo: ResumeRepository
  ocr: OcrClient
  clock: Clock
  logger: Logger
}): ResumeService { /* ... */ }

// ❌ 直接 import 单例 / 模块级可变状态
import { db } from '../infra/db'
let cache: Map<string, Resume> = new Map()
```

### 2. 错误处理：具体类型 + 上下文，不吞错

```ts
// ✅ 领域错误显式建模，携带可检索上下文
throw new OcrTimeoutError({ resumeId, timeoutMs, attempt })

// ❌ 裸 catch、吞异常、字符串化错误
try { await ocr.parse(f) } catch (e) { console.log(e) }
```

- 自定义错误类统一放 `<module>/errors.ts`，对外只暴露稳定错误码（见 `openapi.yaml` 的 `Error.code`）
- **禁止空 catch**；必须处理或显式上抛并保留 cause（`{ cause: e }`）
- 不可重试错误（校验失败、鉴权失败）立即失败；可重试错误（网络、5xx）按 `PRD.md` 第 7 节策略退避

### 3. 边界处校验，内部信任类型

- 所有外部输入（HTTP、队列消息、文件、第三方响应）在边界用 schema 校验并**窄化类型**
- 内部函数不再重复校验；但这要求类型系统开启 `strict`

### 4. 日志：结构化 + 可检索

```ts
logger.info({ funcName: 'createResume', traceId, resumeId, durationMs }, 'resume accepted')
```

- 必带：`funcName`、`traceId`、`durationMs`、`errorType`
- **禁止**：PII（姓名、手机、邮箱、身份证）、完整请求体、密钥
- 禁止 `console.log`；使用注入的 logger

### 5. 幂等与重试入口

- 所有会产生副作用的操作（计费、写外部系统、发通知）必须幂等，幂等键在边界生成并落库
- 重试只允许发生在明确的可重试点，禁止"整流程重试"

### 6. 配置与密钥

- 配置从环境变量读取并在启动时校验（缺失即启动失败，而不是运行时才炸）
- 禁止在代码中读写 `.env` 文件内容到日志

## 二、命名与目录约定

| 类型 | 约定 | 例 |
|---|---|---|
| 文件 | kebab-case | `resume-service.ts` |
| 类型 / 类 | PascalCase | `ResumeService` |
| 函数 / 变量 | camelCase | `createResume` |
| 常量 | SCREAMING_SNAKE | `MAX_FILE_BYTES` |
| 错误类 | `<Domain><Reason>Error` | `OcrTimeoutError` |
| 测试文件 | 与被测同名 + `.test.ts` | `resume-service.test.ts` |
| 时间字段 | 后缀 `At`，UTC | `createdAt` |
| 金额字段 | 后缀 `Cents`，整数 | `amountCents` |
| 布尔字段 | `is` / `has` / `can` 前缀 | `isDeleted` |

## 三、反模式清单（评审直接拒绝）

- 单体巨文件（>400 行）或"什么都干一点"的工具文件
- 跨层直接调用（路由层直连 DB）
- 模块级可变状态 / 全局缓存
- 字符串拼接 SQL；`any` 泛滥；非空断言 `!` 掩盖可能为空的真实情况
- 循环里发查询（N+1）；无限制的 `findAll`
- 用 `sleep` 等待异步；测试里依赖执行顺序
- 把重试、降级、超时写成"以后再加"
- 注释掉的旧代码；TODO 顶替实现

## 四、提交与 PR 约定

- 提交信息：`<type>(<scope>): <为什么这么改>`，正文写动机与影响面
- 一个提交只做一件事；功能改动与依赖升级、格式化分开提交
- PR 必须包含：验收标准对应关系、测试证据（命令 + 输出）、是否触碰 ADR 或 CONSTRAINTS
- 新增/变更依赖、schema、CI 配置必须有人工批准
