# dsh-engineering-skill-pack

> 一个给 **DeepSeek Harness (dsh)** 用的技能包：**28 个技能装一次到位**，覆盖工程交付、技术栈专项、界面设计与内容写作。
> 以 DSH 插件形态分发（`dsh.bundle` 补丁层 + 随包 `skills/`），所以 `dsh plugin add` 一条命令就能装完，不用手工往技能目录拷文件。

**它是什么**：把一套相互衔接的技能一次装好——从「从零交付一个项目」的完整流程，到 Git/GitHub 作业、代码评审、测试、可观测性、安全、性能，再到界面设计与营销文案。

**它不是什么**：不是运行时、不是插件市场、不注册任何工具或命令，也不改 DSH 核心。它只做一件事：**把技能挂进 DSH 的技能源**。装完可随时卸载，零残留。

---

## 安装

```sh
# 方式一：npm（能一键升级，推荐）
dsh plugin --profile <你的 profile> add dsh-engineering-skill-pack

# 方式二：预构建 tarball（不走 npm，免构建授权）
dsh plugin --profile <你的 profile> add "https://github.com/lcx9451/dsh-engineering-skill-pack/releases/download/v0.1.0/dsh-engineering-skill-pack-0.1.0.tgz"

# 方式三：直接从 GitHub 源码安装
dsh plugin --profile <你的 profile> add github:lcx9451/dsh-engineering-skill-pack
```

装完**重启 dsh**（技能源在启动时挂载），然后随便开一个会话，问一句「有哪些技能可用」，或者在输入框敲 `/` 看技能列表。

**卸载**：`dsh plugin --profile <profile> remove dsh-engineering-skill-pack`

> `--profile` 用你实际在用的那个（桌面版通常是 `desktop`，Web 版通常是 `web`）。
>
> 若方式二/三报 `allowBuilds` 相关的错，按提示把 pnpm 打印的那个键加进 profile 的 `pnpm-workspace.yaml` 再重跑即可（这是 pnpm 对 git 来源依赖的构建授权，不是包本身的问题）；也可以直接改用方式一。

## 装完你会得到什么

- **28 个技能出现在技能源里**，模型按 `description` 里的触发词自动加载，你也可以用 `/技能名` 手动调用；
- 每个技能都是纯 Markdown（少数带 `references/` 附属文件），**没有后台进程、没有网络请求、不注册任何工具**；
- 不想全要：删掉 `skills/` 里用不上的目录即可（升级会覆盖回来，介意的话固定版本安装）。

> ⚠️ **别和手工安装的同名技能并存**。如果你已经在 `~/.agents/skills/`（或 `~/.dsh/skills/`）里手工放了一份同名技能，装本包会出现**同名重复**：技能目录里出现两条一样的条目。二选一——要么留着本包、删掉手装的那份，要么反过来。
>
> **怎么确认装好了**：重启后开个新会话问一句「列出你当前可用的技能」，看有没有 `vibecoding-delivery`、`github-workflow` 这些名字；没有的话回到安装那一步检查 `dsh plugin --profile <profile> list`。

## 技能目录

### 工程与交付（15 个）

| 技能 | 干什么 |
| --- | --- |
| `vibecoding-delivery` | 从零交付一个项目：需求采集 → 可测 PRD → 架构契约 → 质量门槛 → 实施 → 部署运维，**6 个可验证 Gate** + 29 文件项目骨架（自建） |
| `github-workflow` | GitHub 作业流程：项目前先查有没有现成的开源实现（五维评估）、建仓／提交／PR／发版、把技能与插件发布到 DSH 生态（自建） |
| `constraint-driven-development` | 把质量门槛写成 `CONSTRAINTS.md`：带数字、带检查命令、跨会话可执行，专防 agent 用 `@ts-ignore`／跳测试悄悄降标准 |
| `code-review` | 对固定基准点以来的改动做**双轴并行评审**：Standards（仓库规范 + 12 条 Fowler 坏味道）与 Spec（是否忠实实现来源 issue） |
| `code-simplification` | 行为完全不变的前提下降低复杂度：五原则 + 四步流程（Chesterton 围栏、Rule of 500、重构与功能分开提交） |
| `codebase-design` | 深模块词汇与判据：module／interface／seam／adapter、deletion test、依赖四分类、并行「设计两次」 |
| `tdd` | 测试先行（红-绿-重构）：只测公共接口上的行为、先商定接缝；点名三个反模式（与实现耦合／同义反复／横向切片） |
| `diagnosing-bugs` | 难 bug 与性能回归的诊断循环：先造出能变红的反馈回路（10 种构造法），再一次列 3–5 个可证伪假设 |
| `git-workflow-and-versioning` | Git 与版本：原子提交、短命分支、worktree 并行、提交前三查、语义化版本与给人看的 changelog |
| `api-and-interface-design` | 接口契约设计：Hyrum 定律、统一错误语义、只在边界校验，以及**幂等键的真正兑现**（四条硬规则） |
| `documentation-and-adrs` | 决策记录：ADR 模板与生命周期（不删旧 ADR）、注释写 why、README 结构、面向 agent 的文档、Prose Review 三步 |
| `observability-and-instrumentation` | 可观测性：先写 on-call 会问的 2–4 个问题，结构化日志 + correlation ID + RED/USE 指标 + 只对症状告警 |
| `performance-optimization` | 性能优化：先测量再优化，Keep/Revert 判定（落在噪声里的收益一律回退）+ 尝试账本 + CI 预算门 |
| `security-and-hardening` | 安全加固：先威胁建模，三档边界（Always Do／Ask First／Never Do），覆盖 OWASP Top 10、依赖供应链与 LLM 风险 |
| `playwright-best-practices` | Playwright 手册：按活动索引 58 个参考文件，覆盖 E2E／组件／视觉／a11y／安全测试、flaky 分流治理、CI 分片与 HAR 回放 |

### 技术栈专项（2 个）

| 技能 | 干什么 |
| --- | --- |
| `supabase-postgres-best-practices` | Postgres 规则库：动 schema／RLS／索引／查询**之前**先读，8 类优先级 + 31 个规则文件（错误写法 → 正确写法） |
| `vercel-react-best-practices` | React／Next.js 性能规则集：去请求瀑布、减包、少重渲染（70 条规则，`async-` 与 `bundle-` 为 CRITICAL） |

### 界面与交互设计（3 个）

| 技能 | 干什么 |
| --- | --- |
| `frontend-design` | 让界面不像 AI 默认模板：先锚定主题，再定 token 计划；含五条「AI 默认风格」反面对照（暖奶油底 + 陶土色那类） |
| `impeccable` | 完整的前端设计工程流：4 种模式（Persuade／Operate／Read／Experience）+ 24 个命令（critique／audit／polish／bolder／harden／live 等），产出 PRODUCT.md 与 DESIGN.md |
| `apple-design` | Apple 式流体交互：可中断性、spring 的 damping/response 与出货数值、velocity handoff、动量投射、材质与排版细则 |

### 元工具（1 个）

| 技能 | 干什么 |
| --- | --- |
| `find-skills` | 找并安装现成技能：先看 skills.sh 排行榜再搜，推荐前验安装量／来源／star，找不到就自建 |

### 内容与营销（7 个）

| 技能 | 干什么 |
| --- | --- |
| `product-marketing` | 营销上下文底座：生成 `.agents/product-marketing.md`（12 节 + 版本账），其余六个营销技能第一步都读它 |
| `content-strategy` | 决定该写什么：3–5 个内容支柱与主题簇、买家四阶段关键词、信息增益闸门、60/30/10 日历与 Create Once Distribute Twice |
| `copywriting` | 写会转化的页面文案：五原则 + 六风格，禁 6 类 AI 腔，含 headline 四公式、页面结构框架与 CTA 公式 |
| `copy-editing` | 改稿与内容刷新：七轮 sweep（清晰→语气→so what→证据→具体→情绪→零风险）+ 专家面板打分 + AI-Tell 检查 |
| `marketing-ideas` | 点子库：139 个已验证营销 idea，按阶段／预算／时间线筛出 3–5 个，每个给「为什么合适 + 前 2–3 步」 |
| `marketing-psychology` | 营销心理学：六个分组的模型库（偏误／说服／定价／增长等）+ 按症状反查（低转化、价格异议、信任不足、决策瘫痪） |
| `social` | 社媒运营：平台速查与频率、四类 Hook 公式、内容原子与复用流水线、监听分诊、短视频 3-Second Rule |

合计 **28** 个技能：前两组偏「怎么把工程做对」，后三组分别管技术栈细节、界面观感与内容写作。
其中 `vibecoding-delivery` 与 `github-workflow` 为本仓库自建，其余 26 个来自公开上游。

## 来源与许可

- **本包自有部分**（打包结构、`cordis.patch.yml`、`vibecoding-delivery`、`github-workflow`）：MIT，见 [`LICENSE`](LICENSE)。
- **26 个技能来自公开上游**，均为 MIT / Apache-2.0：逐条来源与许可证全文见 [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) 与 [`licenses/`](licenses/)。
- 收录 ≠ 背书；技能正文会指导模型如何做事，**装之前建议读一遍你打算依赖的那几个**。
- 如果你是某个上游技能的权利人，希望调整收录方式，开 issue 即可，会立即处理。

## 兼容性

- 依赖 DSH 内置的 `@deepseek-ai/dsh-skill-filesystem` 技能源（当前 0.1.x 系列已内置）。DSH 的启动是全有全无：若宿主过旧、该补丁层不存在，进程会启动失败——**升级宿主后重装即可**。
- 技能是纯文本，跨平台无差异；个别技能里的命令示例以 PowerShell / bash 为主，按需替换。

## 致谢

上游作者：addyosmani、coreyhaines31、Matt Pocock、Anthropic、Vercel Labs、Supabase、currents.dev、Emil Kowalski、Paul Bakaus。
本包只做打包与衔接，技能本身的功劳属于他们。

## 更新记录

见 [`CHANGELOG.md`](CHANGELOG.md)。
