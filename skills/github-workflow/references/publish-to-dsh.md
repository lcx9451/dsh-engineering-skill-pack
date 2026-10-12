# 发布到 DSH 生态：技能与插件

两条路：**技能（Skill）**轻，一个 Markdown 就能分发；**插件（Plugin）**重，是 npm 包 + 上架精选列表。

## A. 技能（Skill）

**形式**：仓库里放 `skills/<技能名>/SKILL.md`，frontmatter 必须有 `name` 与 `description`（`description` 决定什么时候被加载，要把触发词写进去），**目录名与 `name` 必须一致**。

```markdown
---
name: my-skill
description: 干什么 + 什么时候用（把用户可能说的原话与中英文关键词都写进来）。
---

# 标题
正文：硬规则、步骤、命令、完成判定。
```

**可选附属目录**（都是纯文件，不需要注册）：`references/`（按需查阅的细则）、`scripts/`（可直接跑的工具）、`templates/`、`agents/`（子代理配置）、`evals/`。

**分发**：
```powershell
npx skills add <你的账号>/<repo>@<技能名> -g    # 别人这样装；-g = 全局
npx skills update                            # 更新已装的
```
别人也能直接手动拷到 `C:\Users\<用户>\.agents\skills\<技能名>\` 使用（本机技能就是这么加载的，改完即时生效）。

**自检清单**：目录名 == `name`；`description` 里含触发词；正文里没有"以后可能要补"的空章节；有可验证的完成判定；附属文件用相对路径引用且真实存在。

## B. 插件（Plugin）

**形式**：npm 包，`package.json` 里必须有 `dsh` 清单。最小示例（照抄本机已装的 `dshmarket` 结构）：

```jsonc
{
  "name": "my-dsh-plugin",
  "version": "0.1.0",
  "type": "module",
  "main": "lib/index.js",
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },      // 作为插件束注入 profile
    "client": { "inject": ["@deepseek-ai/dsh-client-locale"], "platform": "web" }
  },
  "peerDependencies": { "@deepseek-ai/cordis": "^4.0.1" }
}
```

**硬门槛（上架前先自己验）**：
```powershell
dsh plugin --profile desktop add <包名或本地路径>   # 装得进 = 达标
dsh plugin --profile desktop remove <包名>          # 装完记得能卸
```
装不进去、或装上后 dsh 起不来（DSH 启动是全有全无：一个插件加载失败整个进程退出），都说明还没到能上架的状态。

**发布三步**：
1. `npm publish`（市场优先装"经仓库验证的 npm 包"，其次作者提供的 GitHub Release 预构建 tarball，最后才回退整仓源码下载——所以发 npm 的体验最好，也是唯一能一键升级的路径）
2. 到 **`awesome-dsh-plugin/awesome-dsh-plugin`** 提 PR，在对应分类加一行：
   ```markdown
   - [<你的账号>/my-dsh-plugin](https://github.com/<你的账号>/my-dsh-plugin) - 一句话说清它干什么、装完能看见什么。
   ```
3. 等 CI 刷新 `awesome-dsh-plugin.com/plugins.json`（每日刷新），站点与 dsh-market 自动收录，通常一天内生效。

**审核口径（官方 README 原文的意思）**：能被 `dsh plugin add` 装上、**描述与实际一致**（"描述说 46 个工具，会有人去数"）、分类正确、有人在维护。**不排名、不背书**；仓库消失或失修的条目会被移除。

**分类**（挑最贴切的一个）：AGI Architecture Exploration / UI Enhancements / Themes & Appearance / Models & Providers / Sessions & Messages / Memory / Tools & Capabilities / Browser & Web / Vision & Multimodal / Voice & Audio / Docs & Rendering / **Skills** / **Workflow & Automation** / **Git & Code Review** / Notifications & Integrations / Development & Runtime / Security & Permissions / Remote & Mobile / Plugin Markets & Managers / Just for Fun。

**踩坑提醒**：
- **别往 `dsh-market/dsh-market` 提插件条目**——那是市场应用本身，不是目录；提了会被要求挪走。
- dsh-market **只允许安装精选列表内的来源**，其它一律拒绝——所以不上架就等于没人能一键装。
- 收录 ≠ 安全背书。插件在你机器上以你的权限跑，能在描述里写清它读了什么、连了哪里，会显著降低被拒和被差评的概率。
- 版本号、`CHANGELOG`、`README`（含安装命令与截图）都是审核会看的料；截图能显著提升市场里的点击率（市场支持策展截图列表）。
