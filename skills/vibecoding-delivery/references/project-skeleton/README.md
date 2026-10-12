# 企业级项目骨架模板

这是《Vibecoding 企业级项目创建完整工作流》的可复制骨架。**它不是代码，是"约束与契约"的落点**——把这一步做完，AI 才有稳定的施工面。

## 用法

0. 先把交付指南目录里的 `客户需求模版.md` 复制到项目根目录，交客户填写（对应 Step 0）。**最少 8 项即可开工；客户没填，不要开工。**
1. 把本目录**全部内容**复制到新项目的仓库根目录（`docs/`、`memory-bank/`、`.github/` 一起复制）。
2. 按工作流的第零阶段→第六阶段顺序填充，**不要跳阶段**。
3. 每个阶段结束对照 `docs/GATES.md` 打勾，未过 Gate 不得进入下一阶段。
4. 首次提交后，先做 Gate 3 演练：故意制造一次类型错误 / 一次密钥 / 一次依赖漏洞，确认流水线三次都红且拦住合并。

## 文件与阶段对应

| 文件                                   | 对应 Step  | 谁填             | 备注                            |
| -------------------------------------- | ---------- | ---------------- | ------------------------------- |
| `docs/PRD.md`                          | Step 2 / 3 | 人 + AI          | 验收标准必须 Given/When/Then    |
| `docs/risks.md`                        | Step 5     | 人 + AI          | Top 5 风险必须有 owner          |
| `docs/tech-stack.md`                   | Step 6     | AI 提议 + 人拍板 | 版本必须锁定                    |
| `docs/decisions/ADR-001-tech-stack.md` | Step 6     | 人确认           | 不可逆决策必须留 ADR            |
| `docs/architecture.md`                 | Step 7     | AI               | L1，≤5KB，禁止单体巨文件        |
| `docs/modules/_TEMPLATE.md`            | Step 7     | AI               | L2，每个模块复制一份            |
| `docs/data-model.md`                   | Step 8     | AI + 人          | 含 PII 分级与保留期             |
| `docs/api/openapi.yaml`                | Step 9     | AI               | 接口唯一源，先改契约再改代码    |
| `memory-bank/implementation-plan.md`   | Step 10    | AI               | 每步含测试与回滚                |
| `memory-bank/*.md`                     | Step 11    | 人 + AI          | `activeContext.md` 每次会话必刷 |
| `AGENTS.md`                            | Step 12    | 人               | 含禁写清单与治理规则            |
| `docs/CONSTRAINTS.md`                  | Step 14    | 人               | **只许收紧，放宽需例外表**      |
| `docs/testing.md`                      | Step 15    | 人 + AI          | 覆盖率口径 = 变更行             |
| `.github/workflows/ci.yml`             | Step 18    | 人               | 门禁分级，红色必须拦住合并      |
| `docs/DEPLOYMENT.md`                   | Step 23    | 人               | 三种部署方式，照着能跑通        |
| `docs/OPERATIONS.md`                   | Step 24    | 人               | 日志/备份恢复/常见故障处置      |
| `docs/GATES.md`                        | 全程       | 人               | 六个 Gate 的判定清单            |

## 不可删除的文件

`docs/CONSTRAINTS.md`、`AGENTS.md`、`memory-bank/activeContext.md`、`.github/workflows/ci.yml`。
删掉它们，Harness 层就退化成"一份建议文档"，AI 会稳定地退回默认行为。

## 检查脚本（对应 CONSTRAINTS 的三档）

写进 `package.json`（TS/Node 项目，其他栈按同样语义替换命令）：

```json
{
  "scripts": {
    "check:fast": "tsc --noEmit && eslint . && gitleaks detect --redact --no-banner",
    "check:task": "npm run check:fast && vitest run --coverage",
    "check:full": "npm run check:task && semgrep scan --config p/default --config p/owasp-top-ten --error && osv-scanner scan source -r . && depcruise --validate src"
  }
}
```

- `check:fast`：每次编辑后跑，预算 < 5s，只查改动文件
- `check:task`：AI 认为任务完成时跑，预算 < 90s
- `check:full`：只在 CI 跑

## 注意

- 所有 `<尖括号>` 都是待填占位符，提交前必须清空。
- 本骨架默认 TS/Node/PostgreSQL + GitHub Actions。换栈时改的是**命令与工具名**，不是这些文件的结构。
- `ci.yml` 里用 `docker run` 而不是第三方 Action，是为了避免绑定到某个会变动的 Action 版本；**首次接入时请跑一次确认参数**（工具版本更新会改子命令，例如 osv-scanner 是 `scan source`）。
- 上线前把 `actions/*` 与 docker 镜像 tag 固定为具体版本或 commit SHA（供应链要求，见 `docs/security.md` 第四节）。
- `.dependency-cruiser.cjs` 里的路径正则是示例，必须先用 `pnpm exec depcruise src --output-type text` 确认真实输出后再定稿：**跑不起来的规则等于没有规则。**
