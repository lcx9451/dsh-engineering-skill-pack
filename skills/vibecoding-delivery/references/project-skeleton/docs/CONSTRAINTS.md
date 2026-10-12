# Constraints（质量门槛）

> 本文件是**质量唯一源**：什么算"可以合并"在这里定，不在 PR 里吵。
> **只许收紧，放宽必须走例外表**（有 owner、有到期日、默认 90 天）。
> 任何想让某个改动通过的阈值下调，都算一次"门槛削弱"，必须在下面的变更记录里显式登记。

Last reviewed: <YYYY-MM-DD> by <@owner>

## 一、底线（始终强制，无需额外工具）

- [ ] 禁止新增抑制注释：`@ts-ignore` / `eslint-disable` / `# noqa` / `# type: ignore` / `nosemgrep` / `istanbul ignore` / `Stryker disable`
- [ ] 禁止未实现桩：`throw new Error("Not implemented")`、空 `catch {}`、用 TODO 顶替实现
- [ ] 禁止无理由删除或 skip 测试（理由必须写在提交信息里）
- [ ] 禁止源码、配置、日志中出现密钥或凭证
- [ ] 本文件不得为了让某个改动通过而被放宽

## 二、带数字的强制项

> **每一行必须有能产出结论的命令。只有数字没有命令的条款叫愿望，不叫约束。**
> 至少保留一行**外部约束**（axe / osv-scanner / Lighthouse 之类）：全靠自己写的测试自证是循环论证。

| 维度 | 规则 | 检查命令 | 运行时机 | 失败处理 |
|---|---|---|---|---|
| 类型 | 0 错误（strict 模式） | `tsc --noEmit` | 每次编辑 | 阻断 |
| Lint | 0 error | `eslint .` | 每次编辑 | 阻断 |
| 格式 | 无 diff | `prettier --check .` | 每次编辑 | 阻断 |
| 密钥 | 0 命中（**必须带 `--redact`**） | `gitleaks detect --redact --no-banner` | 每次编辑 | 阻断 |
| 覆盖率 | **变更行** ≥ 80% | `vitest run --coverage` + `diff-cover coverage/lcov.info --compare-branch=origin/main --fail-under=80` | 任务结束 / CI | 阻断 |
| 单元+集成测试 | 0 失败，0 flaky | `vitest run` | 任务结束 / CI | 阻断 |
| 契约 | 契约与实现一致 | `spectral lint docs/api/openapi.yaml` + 契约测试 | CI | 阻断 |
| 代码安全 | 无 high 及以上 | `semgrep scan --config p/default --config p/owasp-top-ten --error` | CI | 阻断 |
| 依赖安全 | 无 high 及以上 | `osv-scanner scan source -r .` | CI | 阻断 |
| 架构边界 | 0 违规 | `depcruise --validate src` | CI | 阻断 |
| 性能（Web） | LCP ≤ 2500ms，CLS ≤ 0.1 | `lighthouse $PREVIEW_URL --output=json --quiet` | 预览部署 | 阻断 |
| 无障碍（Web） | 0 critical / serious | `axe $PREVIEW_URL --tags wcag2a,wcag2aa,wcag21aa` | 预览部署 | 阻断 |
| 包体积 | 单入口不超预算 | `size-limit --json` | CI | 阻断 |

**无 URL 的项目（CLI / 库 / 桌面端）**：删掉 Lighthouse 与 axe 两行，并用该栈的外部检查补位（如 `cargo-deny`、`pip-audit`、`govulncheck`），不要留一个跑不起来的检查。

## 三、只测量不拦截（棘轮）

> 没有把握的数字不要空想。**记下今天的值，然后拒绝变差。** 数字变好就更新它；变差就是发现。

| 指标 | 当前值 | 方向 | 记录日期 | 测量命令 |
|---|---|---|---|---|
| 项目整体覆盖率 | <62.4%> | 不得下降 | <YYYY-MM-DD> | `vitest run --coverage` |
| 主包体积 | <184 kB> | 不得增长 | <YYYY-MM-DD> | `size-limit --json` |
| 最慢接口 P95 | <420 ms> | 不得上升 | <YYYY-MM-DD> | 压测脚本 |
| Lint warning 数 | <17> | 不得增加 | <YYYY-MM-DD> | `eslint -f json` |

允许 ±0.5% 的漂移容忍（无关文件变动导致的自然抖动），超出即视为回归。

## 四、例外（必须有 owner 与到期日，默认 90 天）

| ID | 规则 | 路径/范围 | 原因 | Owner | 建立日期 | 到期 |
|---|---|---|---|---|---|---|
| W1 | `no-explicit-any` | `src/legacy/**` | <重写已排期 REQ-441> | <@name> | <YYYY-MM-DD> | <YYYY-MM-DD> |
| W2 | 覆盖率 80% | `src/pdf-parse/**` | <第三方解析代码难以单测，由 E2E 覆盖> | <@name> | <YYYY-MM-DD> | <YYYY-MM-DD> |

**没有 owner、或到期日超过一年的例外，一律视为无效例外**，CI 应报错。

## 五、运行方式（三档预算）

写进 `package.json`，让检查不依赖 AI 记忆：

```json
{
  "scripts": {
    "check:fast": "tsc --noEmit && eslint . && gitleaks detect --redact --no-banner",
    "check:task": "npm run check:fast && vitest run --coverage",
    "check:full": "npm run check:task && spectral lint docs/api/openapi.yaml && semgrep scan --config p/default --config p/owasp-top-ten --error && osv-scanner scan source -r . && depcruise --validate src"
  }
}
```

| 阶段 | 跑什么 | 预算 |
|---|---|---|
| 编辑循环 | `check:fast`（只查改动文件） | < 5s |
| 任务结束 | `check:task` | < 90s |
| CI / 评审 | `check:full` + 动态检查（Lighthouse / axe / E2E） | 分钟级 |

**超过几秒的检查一律移出编辑循环。** 让 AI 等 5 分钟的检查，最后一定会被 `--no-verify` 绕过。

## 六、门槛自身的守卫（评审时必查）

评审专门盯五类"把红变绿"的动作，`git diff` 就能看出来：

1. **阈值被下调**：预算变小、严重级别降低、检查从快速阶段移到全量阶段
2. **测试被弱化**：新增 `.skip` / `.only`、删除测试文件、断言被抽走
3. **检查器被静音**：新增抑制注释
4. **活儿没干完**：抛异常的桩、空 catch、TODO 顶替实现
5. **凭空出现例外**：本文件第四节多了一行而没人讨论过

原则：**收紧门槛应当无声，放宽门槛必须大声。**

## 七、变更记录（只记录"放宽"与"新增例外"）

| 日期 | 变更 | 类型 | 批准人 | 理由 |
|---|---|---|---|---|
| <YYYY-MM-DD> | <如：dev 分支覆盖率门槛 80% → 70%> | 放宽 | <@name> | <如：紧急修复窗口，7 天内恢复> |
