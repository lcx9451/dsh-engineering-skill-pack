# 运维文档（OPERATIONS.md）

> **目标：日常怎么确认它还活着；坏了怎么第一时间定位；数据怎么备份和恢复。**
> 这份文档是给"三个月后的你自己"看的——那时你已经忘了所有细节。

| 项 | 值 |
| --- | --- |
| 项目 | <项目名称> |
| 部署方式 | 见 `docs/DEPLOYMENT.md` |
| 访问地址 | <https://域名> |
| 最后更新 | <YYYY-MM-DD> |

---

## 1. 日常检查（每次上线后一周内每天看，之后每周看）

```bash
# 1. 服务活着吗
curl -f https://<域名>/healthz

# 2. 容器状态（方式 A/C 用对应命令）
docker compose ps

# 3. 最近有没有报错
docker compose logs --since 24h app | grep -i error | tail -50

# 4. 磁盘和内存
df -h && free -h

# 5. 数据库连得上、大小正常
psql "$DATABASE_URL" -c "select pg_size_pretty(pg_database_size(current_database()));"
```

| 检查项 | 正常范围 | 异常时看哪 |
| --- | --- | --- |
| 健康检查 | 200 | 第 3 节"服务起不来" |
| 错误日志条数 | <每天 < 10 条> | 按 `errorType` 分类统计 |
| 接口 P95 | <≤ 500ms> | 第 3 节"变慢" |
| 磁盘使用 | <70% 以下> | 清日志、清旧备份 |
| 队列积压 | <0，峰值 < 100> | 第 3 节"任务堆积" |
| 备份任务 | 每天成功 | 第 4 节 |

## 2. 日志在哪、怎么看

| 内容 | 位置 |
| --- | --- |
| 应用日志 | `<docker compose logs app / /var/log/<app>/app.log / PaaS Logs 面板>` |
| 错误日志 | `<同上，grep error>` |
| 反向代理日志 | `</var/log/caddy/access.log>` |
| 数据库日志 | `<docker compose logs db>` |

**按请求追一次完整链路**：日志里每条都带 `traceId`。拿到用户报的错，先找 `traceId`：

```bash
docker compose logs app | grep "<traceId>"
```

关键词检索：按 `funcName` 找函数，按 `errorType` 找错误类型，按时间范围 `--since 1h`。
**日志里不应该出现**：密码、令牌、手机号、身份证、完整请求体。

## 3. 常见故障与处置

| 症状 | 先看什么 | 常见原因 | 处理 |
| --- | --- | --- | --- |
| 服务起不来 / 502 | `docker compose logs app` | 环境变量缺失、端口占用、迁移没跑、依赖服务没起 | 按日志报错修；确认迁移已应用 |
| 接口大量 500 | 错误日志按 `errorType` 分组 | 数据库连接池耗尽、第三方挂了、代码 bug | 先看是不是第三方；必要时按 DEPLOYMENT.md 回滚 |
| 变慢 | 数据库慢查询、连接池、CPU/内存 | 缺索引、N+1、数据量增长 | 查最慢的查询并加索引；临时扩容 |
| 任务堆积 | 队列深度、worker 是否在跑 | worker 挂了、第三方限流、死循环重试 | 重启 worker；查第三方配额；必要时暂停入队 |
| 磁盘满 | `df -h`、`du -sh /var/log/*` | 日志没轮转、备份没清理 | 清旧日志与旧备份，配置轮转 |
| 数据库连不上 | `psql "$DATABASE_URL"` | 密码改了、白名单、连接数满 | 核对连接串；杀空闲连接 |
| 证书过期 | 浏览器告警、`curl -vI` | 自动续期失败 | 手动续期并检查定时任务 |
| 定时任务没跑 | 任务日志、cron/systemd timer | 时区错、进程没起 | 手工触发一次确认逻辑，再修调度 |
| 数据看着不对 | 最近的迁移与导入记录 | 迁移错、重复提交、并发覆盖 | **先备份再排查，不要在线上直接改数据** |

## 4. 备份与恢复（最重要的一节）

**备份**

```bash
# 数据库
mkdir -p /opt/<app>/backup
pg_dump "$DATABASE_URL" | gzip > /opt/<app>/backup/db-$(date +%F-%H%M).sql.gz

# 上传的文件 / 数据卷
tar czf /opt/<app>/backup/data-$(date +%F).tar.gz -C /opt/<app> data/uploads
```

| 项 | 值 |
| --- | --- |
| 频率 | <每天凌晨自动一次> |
| 保留 | <本地 7 天 + 异地/对象存储 30 天> |
| 存放 | <本地目录 + 对象存储桶> |
| 自动化 | <cron 表达式 或 systemd timer> |

**恢复（照抄执行，先确认目标库是测试库！）**

```bash
# 1. 停应用，避免写入
docker compose stop app

# 2. 恢复数据库
gunzip -c /opt/<app>/backup/db-<日期>.sql.gz | psql "$DATABASE_URL"

# 3. 恢复文件
tar xzf /opt/<app>/backup/data-<日期>.tar.gz -C /opt/<app>

# 4. 起应用并验证核心流程
docker compose start app && curl -f https://<域名>/healthz
```

| 演练日期 | 恢复点 | 实际耗时 | 数据丢失 | 结论 |
| --- | --- | --- | --- | --- |
| | | | | |

> **每季度至少做一次真实恢复演练。** 没演练过的备份等于没有备份——你只是以为它有。

## 5. 数据维护

| 任务 | 频率 | 命令/位置 | 说明 |
| --- | --- | --- | --- |
| 清理过期数据 | <每天> | <定时任务名> | 按 `docs/data-model.md` 的保留期执行 |
| 归档历史数据 | <每月> | <脚本> | 归档后核对行数 |
| 数据库体积检查 | <每月> | 第 1 节的 `pg_size_pretty` | 异常增长要查原因 |
| 索引/慢查询复查 | <每月> | `pg_stat_statements` | 慢查询预算见 CONSTRAINTS.md |

## 6. 安全维护

| 任务 | 频率 | 怎么做 |
| --- | --- | --- |
| 依赖漏洞扫描 | 每次改动 / 每周 | `osv-scanner scan source -r .`（见 CONSTRAINTS.md） |
| 依赖升级 | 每月 | 单独提一次提交，跑完整测试 |
| 密钥轮换 | 每 90 天 | 生成新密钥 → 更新环境变量 → 重启 → 确认旧密钥失效 |
| 日志脱敏抽查 | 每月 | 随机抽 20 条日志，确认无手机号/令牌 |
| 证书检查 | 每月 | `curl -vI https://<域名> \| grep expire` |
| 备份可恢复性 | 每季度 | 第 4 节演练 |

## 7. 告警含义与第一个动作

| 告警 | 含义 | 第一个动作 |
| --- | --- | --- |
| 健康检查失败 | 服务不可用 | 看日志 → 起不来就按 DEPLOYMENT.md 回滚 |
| 5xx 比例升高 | 有请求在报错 | 按 `errorType` 分组，判断是自身还是第三方 |
| 响应变慢 | P95 超预算 | 看慢查询与资源占用 |
| 队列积压 | 任务处理不过来 | 看 worker 是否存活、第三方是否限流 |
| 磁盘 > 80% | 快写不进去了 | 清日志与旧备份 |
| 备份失败 | 出事就没得恢复 | 立即手工跑一次备份 |

## 8. 常用命令速查

```bash
# 状态与日志
docker compose ps
docker compose logs -f --tail=200 app
docker compose restart app

# 进数据库
psql "$DATABASE_URL"

# 手工备份
pg_dump "$DATABASE_URL" | gzip > backup/db-$(date +%F-%H%M).sql.gz

# 磁盘占用 TOP
du -sh /opt/<app>/* | sort -h

# 端口占用
ss -lntp
```

## 9. 变更记录

| 日期 | 变更 | 原因 | 回滚方式 |
| --- | --- | --- | --- |
| | | | |
