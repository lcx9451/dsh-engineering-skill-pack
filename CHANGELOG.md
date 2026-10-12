# Changelog

本文件记录 `dsh-engineering-skill-pack` 的变更。版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [0.1.2] - 2026-10-13

**修正 0.1.1 里的一处错误说明**

0.1.1 写的是「`.gitignore` 由 git 源码安装保留、只有 npm / tarball 会缺」。**实测更正**：从 git 安装时同样会经过打包步骤，同样剥离 `.gitignore`——三条安装路径都缺它。

- 技能内的提示改为不区分安装方式：复制骨架后**只要 `.gitignore` 不存在**，就用同内容副本 `gitignore` 补上（命令本来就是条件判断，行为未变，只是说明改对了）。
- 修复方式本身不变：骨架同时携带 `.gitignore` 与 `gitignore`，任何路径下都能补齐。

## [0.1.1] - 2026-10-13

**修复**

- **打包分发的骨架缺少 `.gitignore`**。npm 打包时会剥离 `.gitignore` 这个文件名（已实测：tarball 里 `.gitignore` 条目数为 0，而 `.env.example`、`.dependency-cruiser.cjs` 正常保留）。现在 `vibecoding-delivery/references/project-skeleton/` 里同时保留：
  - `.gitignore`（源目录里保留原件）
  - `gitignore`（同内容副本，打包不会剥离它）
  并在该技能的「脚手架」步骤里给出补齐命令：若 `.gitignore` 不存在就用副本改名补上。
- 影响面说明：`0.1.0` **从未发布到 npm**，`v0.1.0` 的 Release 资产按原样保留但请改用最新版。

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

**已验证的安装路径**

三条都在干净的临时 `DSH_HOME` + 独立 profile 上实测过，装完均为 28 个技能目录、补丁层正常进入 profile 组合：

- `dsh plugin add github:lcx9451/dsh-engineering-skill-pack`
- `dsh plugin add "<…>/releases/download/v0.1.0/dsh-engineering-skill-pack-0.1.0.tgz"`（v0.1.0 Release 资产；**已被 0.1.1 取代**，见上）
- npm

**已知事项（已在 0.1.1 修复）**

- npm / tarball 安装缺骨架 `.gitignore`，详见 0.1.1。
