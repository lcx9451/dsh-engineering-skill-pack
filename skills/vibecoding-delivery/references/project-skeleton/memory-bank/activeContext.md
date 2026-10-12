# 运行内存（activeContext.md）

> **每次任务开始前必读，每次任务结束前必写。**
> 这是跨会话的唯一上下文载体：新会话只读本文件 + `docs/architecture.md`（L1）就能接着干，不需要翻聊天记录。
> 规则：保持短。写"当前状态"，不要把历史堆积在这里（历史进 `progress.md`）。

最后更新：<YYYY-MM-DD HH:mm> by <人 / Agent>

## 当前目标

<本次会话要达成的一件事。>

## 正在做的 Step

`implementation-plan.md` → **Step <N>：<目标>**

## 已确认的上下文（本次任务必需）

- 相关模块：`<module>`（L2：`docs/modules/<module>.md`）
- 相关 ADR：`ADR-00X <标题>`
- 相关验收标准：`AC<x.y>`
- 本次必须遵守的门槛：`docs/CONSTRAINTS.md` 第 <…> 节

## 已改动文件

| 文件 | 改了什么 | 状态 |
|---|---|---|
| `<path>` | <…> | 已提交 / 未提交 |

## 未决问题 / 阻塞

| # | 问题 | 阻塞什么 | 卡住什么 |
|---|---|---|---|
| 1 | <…> | <…> | <…> |

## 已知坑（踩过一次就别再踩）

- <如：`pnpm db:migrate` 在 Windows 下需先启动容器，否则报 ECONNREFUSED>

## 下一步的第一步动作

> 必须写得**具体到一个可立即执行的动作**，例如"打开 `src/core/resume-service.ts`，为 `extractFields` 补一个超长输入的空值分支测试"。

1. <…>
2. <…>
