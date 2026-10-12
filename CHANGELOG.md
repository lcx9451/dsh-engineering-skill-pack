# Changelog

本文件记录 `dsh-engineering-skill-pack` 的变更。版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [0.1.0] - 2026-10-12

首个版本：把 28 个技能打包为一个可安装的 DSH 技能包。

**新增**

- 以 DSH 插件形态分发技能：`dsh.bundle` 补丁层 + 随包 `skills/` 目录，通过内置的 `@deepseek-ai/dsh-skill-filesystem` 技能源挂载（`includeDefaultRoots: false`，只服务本包目录）。
- 28 个技能：
  - 工程与交付 15 个（含自建 `vibecoding-delivery`、`github-workflow`）
  - 技术栈专项 2 个、界面与交互设计 3 个、元工具 1 个、内容与营销 7 个
- `THIRD-PARTY-NOTICES.md`：逐条记录 26 个上游技能的来源与许可。
- `licenses/`：9 份上游许可证全文（MIT / Apache-2.0）。
- 已在干净环境验证：`dsh plugin add` 安装后，本包技能出现在技能源中且不干扰其他技能。

**已知事项**

- `vercel-labs/agent-skills` 上游没有仓库级 LICENSE 文件，`vercel-react-best-practices` 的许可依据是该技能自身的 `license: MIT` 元数据声明，详见 `THIRD-PARTY-NOTICES.md`。
- 尚未发布到 npm（0.1.0 先走 GitHub 安装：`dsh plugin add github:lcx9451/dsh-engineering-skill-pack`）。
