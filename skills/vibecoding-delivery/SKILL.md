---
name: vibecoding-delivery
description: 从零交付一个项目的完整流程（需求采集 → 可测 PRD → 架构与接口契约 → 质量门槛与 CI → 单步实施 → 部署与运维文档 → 交付），带 6 个可验证的 Gate 判定清单和一套可直接复制的项目骨架（29 个文件）。Use when the user wants to start a new project from scratch with a coding agent and asks for enterprise-grade delivery, mentions vibecoding / 从零做个项目 / 客户需求模版 / PRD / 项目骨架 / 质量门槛 / 部署文档 / 运维文档, or when an idea needs to become a real, maintainable project rather than a demo.
---

# Vibecoding 项目交付流程

把一个模糊想法，按 6 个 Gate 推进到"能跑、能测、能部署、能维护"的项目。
**产出物是文件，不是对话。** 对话里说完的东西不算完成。

## 什么时候用

- 从零开始一个项目（"我想做个 X"、"帮我搭一个 Y 系统"）
- 用户要求企业级交付：可验收、可部署、可维护、能长期改
- 手上有一堆散乱想法，需要变成需求 → 架构 → 计划 → 代码

**不用**：一次性脚本、临时数据清洗（只走"底线"即可，见下）、已有项目的局部改动（直接改 + 补测试）。

## 硬规则（不可协商）

1. **用户只回答两件事**：业务事实，以及需要他拍板的技术选择。技术方案由你决定，并给默认值。
2. **一次只推进一步**，每步的产出落到文件并回报路径。
3. **Gate 未过不进下一阶段**；判定必须能拿出证据（命令输出 / 文件 / 数字），"我觉得可以了"无效。
4. **门槛只许收紧**：`docs/CONSTRAINTS.md` 的阈值可以调高，调低必须登记到期日。
5. **没有回滚方案的变更不上线**；不可逆改动先写 ADR 再动手。
6. **不要造人事流程**：没有审批链、没有评审签字、没有部门对接。这是一个人用 Agent 做项目。

## Step 0：需求采集（第一次对话就做）

1. 把 `references/客户需求模版.md` 复制到项目根目录，交给用户填。
2. 只要求**最少 8 项**就能开工：痛点与耗时基线、谁用怎么用、成功标准与优先级、三个核心场景、敏感数据与存放限制、合规勾选、期望时间、第二部分 A–G 扫一眼。
3. 用户不想开文件就让他在对话里讲，你按模版结构落成文件，让他改。
4. **缺项不要停下干等**：给「推荐默认值 + 不问会怎样」，让用户只需回"同意"。只有真正阻塞的（例如数据能不能出境）才停下来问。
5. **不要一次抛 20 个问题**，那等于把工作推回给用户。

## 脚手架

把 `references/project-skeleton/` 全部内容复制到项目根目录（含 `.github/`、`.gitignore`、`.env.example` 隐藏文件）：

```powershell
Copy-Item -Recurse -Force "<skill>\references\project-skeleton\*" "<项目根>"
# 打包分发的副本会丢掉 .gitignore 这个文件名（npm 打包、Release tarball、乃至从
# git 安装时的打包步骤都会剥离它），骨架里留了一份同内容副本 gitignore，用它补上：
if (-not (Test-Path "<项目根>\.gitignore")) { Copy-Item "<skill>\references\project-skeleton\gitignore" "<项目根>\.gitignore" }
```

复制后立刻做三件事：把 `docs/` 里的 `<占位符>` 按项目替换；先写 `docs/PRD.md`；把 `客户需求模版.md` 和骨架一起提交。

## 六个 Gate

| Gate | 通过条件（必须可验证） | 主要产出 |
| --- | --- | --- |
| 1 需求冻结 | 验收标准可写成测试；NFR 有数字；与需求模版逐条对齐、无自造需求 | `docs/PRD.md`、`docs/risks.md` |
| 2 架构与计划冻结 | 依赖规则**跑过一次能判红**；迁移与回滚本地跑通；契约过 lint | `docs/architecture.md`、`docs/api/openapi.yaml`、`docs/decisions/` |
| 3 工程线就绪 | **故意制造类型错误 / 假密钥 / 高危依赖，流水线三次都红**；`check:fast` < 5s | `docs/CONSTRAINTS.md`、`.github/workflows/ci.yml` |
| 4 功能完成 | 全部验收标准有对应测试；改坏一处业务逻辑必须有测试变红；**收敛检查**：逐条对照 PRD 与需求模版，没有"做了没人要的"也没有"少做了说好的" | 代码 + 测试 |
| 5 能部署能运维 | 照 `docs/DEPLOYMENT.md` 在干净环境跑通一次；**回滚实测一次** | `docs/DEPLOYMENT.md`、`docs/OPERATIONS.md` |
| 6 交付 | README 能照着跑起来；遗留项全部登记；无密钥入库、无未实现桩 | `README.md` |

完整判定清单：`references/project-skeleton/docs/GATES.md`。

## 步骤 → 产出 → 加载哪个技能

**不要用本技能重复已有的专业能力，到点加载对应技能。**

| 步骤 | 产出 | 加载技能 |
| --- | --- | --- |
| Step 2–3 PRD 与 NFR | `docs/PRD.md` | — |
| Step 6 技术选型 | `docs/tech-stack.md` + ADR | `documentation-and-adrs` |
| Step 7 架构与分层 | `docs/architecture.md`、`.dependency-cruiser.cjs` | `codebase-design` |
| Step 8 数据模型 | `docs/data-model.md` | `supabase-postgres-best-practices`（用 Postgres 时） |
| Step 9 接口契约 | `docs/api/openapi.yaml` | `api-and-interface-design` |
| Step 14 质量门槛 | `docs/CONSTRAINTS.md` | `constraint-driven-development` |
| Step 15 测试策略 | `docs/testing.md` | `tdd`、`playwright-best-practices` |
| Step 16 安全 | `docs/security.md` | `security-and-hardening` |
| Step 17 可观测 | `docs/observability.md` | `observability-and-instrumentation` |
| Step 19 实施 | 代码 + 测试 | `tdd` |
| Step 20 提交前自查 | diff 检查 | `code-review`、`code-simplification` |
| Step 21 提交 | 原子提交 | `git-workflow-and-versioning` |
| 修 bug | — | `diagnosing-bugs` |
| 性能问题 | — | `performance-optimization` |
| 界面与交互 | — | `frontend-design`、`impeccable` |

## 五类"假完成"，每次提交前自己查

1. **阈值被下调**：预算变小、检查从快速阶段移到 CI
2. **测试被弱化**：新增 `.skip`、删测试文件、断言被抽走
3. **检查器被静音**：新增 `@ts-ignore` / `eslint-disable` / `# noqa` / `nosemgrep`
4. **活儿没干完**：抛异常的桩、空 catch、TODO 顶替实现
5. **凭空出现例外**：`CONSTRAINTS.md` 例外表多了一行没人讨论过

**收紧门槛应当无声，放宽门槛必须大声。**

## 常见坑

- 一次性生成整个项目 → 无法验证、无法定位。**按 `implementation-plan.md` 一次一个 Step，单步 diff ≤ 400 行。**
- 需求没基线就开工 → 最后无法验收，只能凭感觉争论。
- 只写正常路径 → 上线后全是异常分支的 bug。每条功能至少一条异常路径验收标准。
- 文档写得很全但没人看 → 每份文档都要有明确的**读者**（三个月后的自己 / 下一个会话 / 部署的人）。
- 部署与运维文档留到最后补 → 到那时已经忘了。Step 23–24 就是写它们，写完照着跑一遍。

## 参考文件

| 文件 | 用途 |
| --- | --- |
| `references/客户需求模版.md` | 交给用户填（需求 + 技术确认，都给默认值） |
| `references/project-skeleton/` | 复制到项目根目录的骨架（29 个文件） |
| `references/工作流全文.md` | 28 步全文，需要细节时读 |

## 完成判定

- [ ] 需求模版已填，PRD 与它逐条对齐
- [ ] 六个 Gate 都有证据（不是勾选，是命令输出 / 演练记录）
- [ ] `docs/CONSTRAINTS.md` 每条数字都有对应命令
- [ ] 部署文档照着跑通过一次，回滚实测过一次
- [ ] 运维文档能回答："日志在哪、坏了怎么办、数据怎么恢复"
- [ ] 无密钥入库、无未实现桩、无静音检查器
