# Third-Party Notices · 第三方技能来源与许可

本仓库是一个**技能打包分发**（skill pack），其中 26 个技能来自公开的上游仓库，版权归各上游作者所有；
另 2 个技能（`vibecoding-delivery`、`github-workflow`）为本仓库作者自建，按本仓库的 MIT 许可发布。

打包时分文未改上游技能正文（仅 `github-workflow` 属自建，无上游）。**所有上游均为 MIT 或 Apache-2.0 等宽松许可**，
可再分发；下面是逐条来源与许可记录，许可证全文见 [`licenses/`](licenses/)。

## 来源清单

| 上游仓库 | 许可 | 收录技能 |
| --- | --- | --- |
| [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) | MIT | `api-and-interface-design`、`code-simplification`、`constraint-driven-development`、`documentation-and-adrs`、`git-workflow-and-versioning`、`observability-and-instrumentation`、`performance-optimization`、`security-and-hardening` |
| [`coreyhaines31/marketingskills`](https://github.com/coreyhaines31/marketingskills) | MIT | `content-strategy`、`copy-editing`、`copywriting`、`marketing-ideas`、`marketing-psychology`、`product-marketing`、`social` |
| [`mattpocock/skills`](https://github.com/mattpocock/skills) | MIT | `codebase-design`、`code-review`、`diagnosing-bugs`、`tdd` |
| [`anthropics/skills`](https://github.com/anthropics/skills) | Apache-2.0 | `frontend-design`（上游技能目录内自带 `LICENSE.txt`，已随包保留） |
| [`vercel-labs/skills`](https://github.com/vercel-labs/skills) | MIT | `find-skills` |
| [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills) | MIT（见下方说明） | `vercel-react-best-practices` |
| [`supabase/agent-skills`](https://github.com/supabase/agent-skills) | MIT | `supabase-postgres-best-practices` |
| [`currents-dev/playwright-best-practices-skill`](https://github.com/currents-dev/playwright-best-practices-skill) | MIT | `playwright-best-practices` |
| [`emilkowalski/skills`](https://github.com/emilkowalski/skills) | MIT | `apple-design` |
| [`pbakaus/impeccable`](https://github.com/pbakaus/impeccable) | Apache-2.0 | `impeccable` |

## 需要说明的一处

**`vercel-labs/agent-skills` 没有仓库级 LICENSE 文件**（已核对仓库根目录与全仓文件名搜索，均无）。
`vercel-react-best-practices` 的许可依据是该技能自身的元数据声明：

```yaml
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
```

因此本包按 MIT 转载它，并在此如实记录这一差异：**若上游后续补充仓库级许可证，以补的为准**。
如你是该内容的权利人并希望调整收录方式，开 issue 即可，会立即处理。

## 许可证全文

`licenses/` 下的文件按上游仓库命名（`<owner>-<repo>.LICENSE`），是从上游仓库获取的许可证原文：

```
licenses/addyosmani-agent-skills.LICENSE          MIT
licenses/anthropics-skills.LICENSE                Apache-2.0
licenses/coreyhaines31-marketingskills.LICENSE    MIT
licenses/currents-dev-playwright.LICENSE          MIT
licenses/emilkowalski-skills.LICENSE              MIT
licenses/mattpocock-skills.LICENSE                MIT
licenses/pbakaus-impeccable.LICENSE               Apache-2.0
licenses/supabase-agent-skills.LICENSE            MIT
licenses/vercel-labs-skills.LICENSE               MIT
```

（`vercel-labs/agent-skills` 无上游许可证文件，故此处无对应条目，理由见上一节。
`frontend-design` 的 Apache-2.0 全文同时保留在 `skills/frontend-design/LICENSE.txt`。）

## 自建部分

| 技能 | 作者 | 许可 |
| --- | --- | --- |
| `vibecoding-delivery` | 本仓库作者 | MIT |
| `github-workflow` | 本仓库作者 | MIT |
| 打包结构、`cordis.patch.yml`、README 等 | 本仓库作者 | MIT（见 [`LICENSE`](LICENSE)） |

> 仓库根的 `LICENSE` 是**纯 MIT 正文**，只覆盖本仓库自有部分（打包结构与上面两个自建技能）。
> 它**不覆盖**任何第三方技能——第三方的许可以上表与 `licenses/` 里的原文为准。
