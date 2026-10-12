# 找现成的：检索与评估手册

用在**动手写代码之前**。目标不是"搜一下意思意思"，而是产出一张能让用户拍板的对比表。

## 1. 拆检索词

一组好的检索词 = 领域 + 动作 + 技术栈 + 约束。

| 需求 | 检索词（中 → 英） |
| --- | --- |
| WPF 应用的热更新 | `WPF 热更新` → `wpf hot reload`、`wpf plugin hot swap` |
| PDF 里抽表格 | `pdf 表格 抽取` → `pdf table extraction`、`camelot tabula` |
| DSH 主题插件 | `dsh plugin theme`、`deepseek harness 主题` |
| 定时任务面板 | `cron dashboard self-hosted`、`scheduled jobs ui` |

中文搜不到就换英文；英文也搜不到，再换"这东西的学名"（例：`hot reload` → `hot swap` → `assembly reload`）。

## 2. 检索配方（按顺序用）

**仓库检索（主力）** —— 以下命令均已实测可用：
```powershell
$gh = 'C:\Program Files\GitHub CLI\gh.exe'
# 关键词（不加引号！）+ 语言 + star 门槛：一次只加一个过滤器
& $gh search repos pdf table extraction --language=python --stars=">200" --limit 20 `
  --json fullName,description,stargazersCount,license,updatedAt,url | ConvertFrom-Json | Format-Table

# 按更新时间排，找"还很活跃"的
& $gh search repos pdf table extraction --language=python --sort=updated --limit 20 --json fullName,updatedAt

# 只在某个方向里找（topic 往往比关键词准）
& $gh search repos --topic=pdf --topic=table-extraction --limit 20 --json fullName,stargazersCount

# 找某个组织/作者的实现（不带关键词才稳）
& $gh search repos --owner=camelot-dev --limit 20 --json fullName,stargazersCount
& $gh repo list camelot-dev --limit 20 --json name,stargazerCount,updatedAt,pushedAt
```

**三个实测踩坑（照做能省半小时）**：
1. **别给关键词加引号**。`"pdf table extraction"` 是**短语匹配**，命中的全是没 star 的小仓库；去掉引号变成 AND 检索，立刻能搜到 3.7k star 的 `atlanhq/camelot`、899 star 的 `xavctn/img2table`。
2. **过滤器叠加在结果集上，条件越多越容易空集**。`关键词 + 语言 + star + 更新时间` 四个一起上返回 `[]` 是正常的——**一次只加一个，空了就减条件**，别以为"没搜到 = 没有"。
3. **字段名两个动词不一样**：`gh search repos` 用 `stargazersCount`，而 `gh repo list` 用 `stargazerCount`（单数）。写错会直接报 `Unknown JSON field` 并列出全部可用字段——把那个列表当参考。

**代码检索（找现成脚本/片段，注意 API 限流 10 次/分钟）**
```powershell
& $gh search code "setPointerCapture" --language=typescript --limit 20 --json repository,path,url
```

**看单个仓库的"体检数据"**
```powershell
& $gh repo view owner/repo
& $gh api repos/owner/repo --jq '{stars:.stargazers_count, pushed:.pushed_at, open_issues:.open_issues_count, license:.license.spdx_id, archived:.archived, size_kb:.size}'
& $gh api repos/owner/repo/commits --jq '.[0:5][] | "\(.commit.author.date)  \(.commit.message | split("\n")[0])"'
& $gh api repos/owner/repo/releases/latest --jq '{tag:.tag_name, published:.published_at}'   # 404 说明根本不发版
```

**找不到就换通道**：`web_search`（中文选型对比、知乎/掘金/V2EX 的踩坑帖）、GitHub Topics 页、awesome 列表、`gh search repos --topic=awesome`。

## 3. 五维评估表

每个候选填一行，最后推荐必须基于这张表：

| 维度 | 看什么 | 红线 |
| --- | --- | --- |
| **许可证** | `license.spdx_id` | 无许可证 = 保留一切权利，**不能合法复用**；GPL/AGPL 进闭源项目 = 直接排除或另找 |
| **活跃度** | `pushed_at`、最近 5 次提交、issue 是否有人回 | 一年无提交 + issue 无人回 = 弃用风险 |
| **匹配度** | 覆盖需求的百分之多少、缺哪一块 | 只沾边就别硬套，改造量常大于自研 |
| **接入成本** | 语言/运行时是否和项目一致、依赖数量、体积、有没有包管理器发布 | 引入 50 MB 依赖解决 200 行问题不值 |
| **风险** | 单人维护？`archived`？star 与下载量是否异常？有没有可疑安装脚本？ | 归档仓库只能当参考，不能当依赖 |

**别只看 README 就下结论**：`git clone --depth 1` 到临时目录，跑它文档里的最小示例。跑不起来就降级为"仅供参考"。

## 4. 许可证速查（决定"能不能用"）

| 类型 | 许可证 | 你可以 |
| --- | --- | --- |
| 宽松 | MIT、Apache-2.0、BSD-2/3、ISC | 商用、闭源、修改，保留版权声明与许可证全文（Apache-2.0 还要留 `NOTICE`） |
| 弱 copyleft | LGPL、MPL-2.0 | 可以链接/以文件为单位混用；改了它本身的那部分要开源 |
| 强 copyleft | GPL-2.0/3.0 | 衍生作品必须同样开源，闭源项目**别碰** |
| 网络 copyleft | AGPL-3.0 | 连"只在服务器上跑、不分发"也要开源，SaaS 项目**高危** |
| 公共领域 | Unlicense、CC0 | 随便用（但专利授权不明确，商业项目仍建议审计） |
| 无 | 没有 LICENSE 文件 | **默认保留一切权利**，法律上不能用；只能联系作者要授权 |

## 5. 结论输出（三选一，必须说理由）

```markdown
## 候选对比
| 仓库 | 许可证 | star | 最近提交 | 匹配度 | 接入成本 | 结论 |

## 建议
- ✅ 直接用：owner/repo@v1.2.3 —— 覆盖 X/Y/Z，缺的那点用 W 补
- 🔧 fork 改造：要改动 3 处（列表），上游值得回贡献
- 🛠 自研：搜过的关键词 = [...]，候选 = [...]，不够用的原因 = [...]（这是自研的证据）
```

**"自研"这个结论必须带搜索证据**——搜过的词、看过的仓库、为什么不合适，一条都不能省。
