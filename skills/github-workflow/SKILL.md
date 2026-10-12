---
name: github-workflow
description: GitHub 作业流程：① 项目开始前先检索 GitHub 上是否已有满足需求的开源项目/脚本/插件，评估许可证、活跃度与复用方式，再决定"直接用 / fork 改造 / 自研"；② 日常托管——建仓、克隆、拉取、提交、推送、分支、PR、issue、release、Actions 排错、给上游官方项目贡献；③ 把自研技能与插件发布到 DSH 生态（npm publish + awesome-dsh-plugin 上架）。Use when the user wants to check GitHub for existing open-source projects before building, or to create/clone/pull/push repositories, open or review PRs, cut releases, debug Actions, or publish skills and plugins to DeepSeek Harness. 触发词：查 GitHub、有没有现成的、找轮子、开源项目、别人怎么做的、建仓库、上传代码、拉取代码、提交推送、开 PR、提 issue、fork、发版、发布插件、上架、awesome-dsh-plugin。
---

# GitHub Workflow

三件事：**找轮子**（项目前）、**管仓库**（日常）、**发东西**（技能与插件上架）。

## 开工自检（每次都做，不要凭记忆）

```powershell
# 1) gh 在哪：桌面应用/IDE 启动的进程常拿不到新装的 PATH
$gh = (Get-Command gh -ErrorAction SilentlyContinue).Source
if (-not $gh) { $gh = 'C:\Program Files\GitHub CLI\gh.exe' }   # Windows 默认安装位置
& $gh --version

# 2) 登录了吗、是什么身份
& $gh auth status

# 3) 提交身份对不对（错身份 = 贡献不计入账号）
git config user.name; git config user.email
```

| 项 | 期望状态 |
| --- | --- |
| `gh` | 装好且 `gh auth status` 显示已登录（scope 至少含 `repo`） |
| git 凭据 | `gh auth setup-git` 之后，github.com 走 `gh auth git-credential`；不需要长期 PAT |
| git 邮箱 | 建议用 GitHub 的 **noreply 形式**：`<账号ID>+<用户名>@users.noreply.github.com`（账号 ID 从 `gh api user --jq .id` 取）。这样既不暴露真实邮箱，又能保证提交归属到你的账号 |
| git 用户名 | 每个仓库可以用自己的名字；改之前先 `git config --local user.name` 看有没有 local 覆盖 |
| 多仓库项目 | 注意 **local 覆盖会盖掉全局**：`git config --show-origin user.email` 能看出这个值来自哪个文件 |

> 换机器时按上面四步走一遍即可；本技能不假设任何特定账号或路径。

**不要装 GitHub MCP。** `gh` CLI 已覆盖全部 REST/GraphQL（`gh api` 直通），MCP 只会多存一份 token、多一个泄漏面。用户已明确采用此方案。

## 场景 A：先找轮子，再决定要不要自己写

**硬规则：用户提一个新项目/新工具/新脚本需求时，先搜一遍 GitHub，再谈实现。** 没有搜就说"我来写"是失职；搜了并说清"有什么、为什么不合适"才算尽职。

1. **拆需求成检索词**：领域 + 动作 + 技术栈 + 约束（例如"WPF 热更新 框架"、"pdf 表格 抽取 python"、"dsh 插件 主题"）。准备 2–3 组同义词，中文无结果就换英文。
2. **按顺序检索**（配方见 `references/find-existing-projects.md`）：
   - `gh search repos`（按 star/更新时间/语言/是否归档筛）
   - `gh search code`（找现成脚本片段，需要 `repo:`/`language:` 限定）
   - GitHub Topics 与 awesome 列表
   - `web_search` 补充（中文社区评测、选型对比文）
3. **每个候选按五维评估**：许可证（能否商用、是否 copyleft）、活跃度（最近提交 / issue 响应）、匹配度（覆盖需求的百分之多少、缺什么）、接入成本（语言运行时、依赖体积、文档与示例）、风险（单人维护？已被弃用？供应链可疑？）。
4. **动手验证，不停留在 README**：克隆到临时目录、跑通最小示例，再下结论。
5. **给结论，三选一并说理由**：
   - **直接用**：作为依赖接入（附安装命令与版本）
   - **fork 改造**：说明要改哪几处、上游是否值得回贡献
   - **自研**：列出搜过的关键词与仓库、以及它们为什么不够——这是"自研"这个结论的证据
6. **合规**：用别人的代码要保留 `LICENSE` / `NOTICE` / 署名；GPL/AGPL 代码不要粘进闭源项目；不确定许可证就标红并让用户拍板。

## 场景 B：日常托管

提交规范（原子提交、message 写法、分支策略、版本与 changelog）**交给 `git-workflow-and-versioning` 技能**，本技能只管 GitHub 侧的远端操作。

**建仓**（默认**私有**；要公开必须用户明确同意）：
```powershell
& $gh repo create <你的账号>/<name> --private --source=. --remote=origin --push
& $gh repo create <你的账号>/<name> --private            # 空仓库
git remote add origin https://github.com/<你的账号>/<name>.git   # 已有提交、只接远端
```
**首次推送前必查**（`.gitignore` 覆盖 `node_modules/ dist/ .env* *.pem`；对 staged diff 扫密钥）：
```powershell
git status --short; git diff --staged | Select-String -Pattern 'password|secret|api[_-]?key|token|BEGIN .*PRIVATE KEY'
git ls-files | ForEach-Object { $f = Get-Item $_ -ErrorAction SilentlyContinue; if ($f.Length -gt 50MB) { "大文件: $_ ($([math]::Round($f.Length/1MB)) MB)" } }
```
**PR**：`gh pr create --fill`（或 `--draft`）→ body 写"改了什么 / 怎么验证 / 风险" → `gh pr checks` 看 CI → `gh pr view --web` 给用户链接。
**排错**：`gh run list --limit 10` → `gh run view <id> --log-failed`；`gh issue list --state open`。
**发版**：`gh release create v1.2.0 --generate-notes`（tag 用 annotated，版本号从 tag 推导）。
**给上游官方项目贡献**：先读 `CONTRIBUTING.md` → fork → 特性分支 → 小步原子提交 → PR；**不动无关文件**，不夹带格式化改动。

## 场景 C：把自研技能 / 插件发出去

完整清单见 `references/publish-to-dsh.md`，要点：

- **技能（Skill）**：仓库里放 `skills/<技能名>/SKILL.md`（frontmatter 必须有 `name` + `description`，目录名与 `name` 一致），别人就能 `npx skills add <你的账号>/<repo>@<技能名> -g` 安装。
- **插件（Plugin）**：是 npm 包，`package.json` 必须有 `dsh` 清单（`dsh.bundle` 等），硬门槛是**能用 `dsh plugin --profile desktop add <包名>` 装上**。
- **上架官方源**：`npm publish` 之后，去 **`awesome-dsh-plugin/awesome-dsh-plugin`** 提 PR，在对应分类加一行（格式：`- [owner/repo](链接) - 一句话描述`）。CI 每日刷新 `plugins.json`，站点与 dsh-market 自动收录，通常一天内生效。
- **审核口径**：能装、描述与实际一致（"描述说 46 个工具，会有人去数"）、分类正确、有人维护；不排名、不背书。
- **别往 `dsh-market/dsh-market` 提条目**——那是市场应用本身，不是目录。dsh-market 只允许安装精选列表内的来源。

## 硬规则（不可协商）

1. **不可逆操作先问**：删/改名仓库、改可见性、`push --force`、删分支或 tag、`gh auth logout`、清凭据——先说清后果再动手。
2. **公开即发布**：新建仓库默认私有；任何 public 化前确认没有密钥、内部地址、客户数据、个人信息。
3. **密钥一旦推上去就等于已泄露**：先**轮换**密钥，再清历史（`git filter-repo` / BFG），顺序反了等于没做。
4. **不把 token 写进文件、命令历史或对话**；优先用 `gh` 的 OAuth，需要 PAT 就选 fine-grained 并限定仓库与期限。
5. **报告要可验证**：给用户仓库链接、commit hash、PR 号、CI 结论，而不是"已经推好了"。

## 完成判定

- [ ] 场景 A：给出了候选对比表 + 三选一结论 + 搜过的关键词（自研时必须有）
- [ ] 场景 B：远端已接且 `git push` 实测通过；PR/issue/release 有链接与编号
- [ ] 场景 C：`dsh plugin add` 装得上、npm 版本可见、上架 PR 已提
- [ ] 全程无密钥入库；不可逆动作都经过用户确认
