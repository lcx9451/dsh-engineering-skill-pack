# 部署文档（DEPLOYMENT.md）

> **目标：拿这份文档，在一台干净的机器上能把系统跑起来；出问题能退回去。**
> 三种部署方式各自独立成节，你用哪种就看哪节。填掉所有 `<尖括号>` 占位符后再算完成。

| 项 | 值 |
| --- | --- |
| 项目 | <项目名称> |
| 采用方式 | <A 单机 Docker Compose / B 云托管 PaaS / C 云服务器手动> |
| 最后更新 | <YYYY-MM-DD> |

---

## 0. 部署前必须准备好的东西

- [ ] 一台机器（或一个 PaaS 账号）：<配置要求，如 2 核 4G、Ubuntu 22.04>
- [ ] 域名 + 能改 DNS 解析：<域名>
- [ ] 环境变量清单已填好（见第 1 节），密钥已生成
- [ ] 数据库：<自建 / 托管>，连接串已确认可连
- [ ] 代码已推到远端仓库，且有明确的版本号/tag
- [ ] 备份位置已确定（见 OPERATIONS.md 第 4 节）

## 1. 环境变量与密钥

> 配置与代码分离：**同一个镜像/同一份代码，靠环境变量区分环境，绝不为环境改代码。**

| 变量 | 用途 | 本地 | 生产 | 是否敏感 |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | 运行模式 | local | production | 否 |
| `PORT` | 服务端口 | 3000 | <8080> | 否 |
| `DATABASE_URL` | 数据库连接 | localhost | <生产连接串> | **是** |
| `AUTH_JWT_SECRET` | 签名密钥 | 随便填 | <随机生成 32 字节> | **是** |
| `LOG_LEVEL` | 日志级别 | debug | info | 否 |
| <其他> | | | | |

**密钥生成与保管**：
- 生成：`openssl rand -base64 32`（不要手打可猜的字符串）
- 保管：<PaaS 的环境变量面板 / 服务器的 `.env`（权限 600，属主非 root）/ 密钥管理服务>
- **任何密钥都不进代码库**；`.env` 必须在 `.gitignore` 里
- 轮换：<每 90 天>，轮换步骤见 OPERATIONS.md 第 6 节

## 2. 方式 A：单机 Docker Compose（推荐，最简单可控）

**目录结构（服务器上）**

```
/opt/<app>/
├── docker-compose.yml
├── .env                 # 权限 600，不入库
├── data/                # 数据库与上传文件的数据卷（重点备份对象）
└── backup/              # 备份落地目录
```

**docker-compose.yml 要点**（不用照抄，确认这几件事都有）：

```yaml
services:
  app:
    image: <registry>/<app>:<tag>     # 用固定 tag，不要用 latest
    env_file: .env
    restart: unless-stopped           # 开机/崩溃自动拉起
    ports: ["127.0.0.1:8080:8080"]    # 只监听本机，由反向代理对外
    healthcheck:                      # 健康检查，坏了自己重启
      test: ["CMD", "curl", "-f", "http://localhost:8080/healthz"]
      interval: 30s
      retries: 3
    volumes:
      - ./data/uploads:/app/uploads
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./data/pg:/var/lib/postgresql/data
```

**首次部署**

```bash
cd /opt/<app>
docker compose pull
docker compose up -d
docker compose ps                 # 确认 healthy
docker compose logs -f app        # 看启动日志有没有报错
```

**升级**

```bash
docker compose pull && docker compose up -d
docker compose ps                 # 确认新容器 healthy
```

**回滚**（把 `<旧tag>` 换成上一个可用版本）

```bash
sed -i 's|<app>:.*|<app>:<旧tag>|' docker-compose.yml
docker compose up -d
```

> **回滚命令必须在第一次上线前实测一遍。** 没试过的回滚等于没有回滚。

**反向代理与 HTTPS**（Caddy 最省事，自动签证书）

```
<你的域名> {
    reverse_proxy 127.0.0.1:8080
}
```

**日志位置**：`docker compose logs app`；若挂了日志驱动，落盘在 `<路径>`。
**数据卷**：`./data/` —— **这是唯一不能丢的东西**，备份策略见 OPERATIONS.md。

## 3. 方式 B：云托管 PaaS（Vercel / Railway / Render / 云函数）

**部署步骤**

1. 连接 Git 仓库，选分支（`main`）
2. 构建命令：`<pnpm install --frozen-lockfile && pnpm build>`
3. 启动命令：`<pnpm start>`
4. 在平台面板填环境变量（同第 1 节表格），密钥用平台的 Secret 功能
5. 数据库用平台托管或外部托管，连接串写进环境变量
6. 首次部署后跑一次迁移（见第 5 节）

**升级**：推到 `main` 自动构建部署。
**回滚**：平台面板 → Deployments → 选中上一个成功的部署 → Promote/Rollback。
**日志**：平台 Logs 面板；**注意平台日志有保留期**（通常 1–7 天），需要长期留存要另外落盘。
**注意**：无状态平台不要往本地磁盘写文件（文件会随实例重建消失），上传文件放对象存储。

## 4. 方式 C：云服务器手动部署（不用容器）

**systemd 单元**（`/etc/systemd/system/<app>.service`）

```ini
[Unit]
Description=<app>
After=network.target

[Service]
Type=simple
User=<appuser>
WorkingDirectory=/opt/<app>
EnvironmentFile=/opt/<app>/.env
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=5
StandardOutput=append:/var/log/<app>/app.log
StandardError=append:/var/log/<app>/error.log

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now <app>     # 开机自启
systemctl status <app>
journalctl -u <app> -f           # 看日志
```

**升级**：`git pull && pnpm install --frozen-lockfile && pnpm build && systemctl restart <app>`
**回滚**：`git checkout <上一个tag> && pnpm install && pnpm build && systemctl restart <app>`
**日志轮转**（避免磁盘被日志写满）：`/etc/logrotate.d/<app>`

```
/var/log/<app>/*.log {
    daily
    rotate 14
    compress
    missingok
    notifempty
}
```

## 5. 数据库迁移怎么跑（三种方式通用）

- [ ] 迁移文件随代码一起发布，**不在服务器上手工改表结构**
- [ ] 发布顺序：**先备份 → 再跑迁移 → 再切新版本代码**（迁移要向前兼容旧版本，见 expand-contract）
- [ ] 跑法：`<pnpm db:migrate>`（在应用启动前执行，或作为独立的发布步骤）
- [ ] 迁移前必备份：`<pg_dump ... > backup/pre-migrate-$(date +%F-%H%M).sql`
- [ ] 迁移失败处理：<恢复备份 → 修脚本 → 重跑>；**已执行过的迁移文件永不修改**
- [ ] 不可回滚的变更（删列、改字段类型）单独标注，回滚方案是"修好再往前推"，不是"退回去"

## 6. 首次部署后的验收（缺一不可）

- [ ] `curl -f https://<域名>/healthz` 返回 200
- [ ] 浏览器打开首页能正常加载，HTTPS 证书有效
- [ ] 日志里能看到这次请求的记录，且**没有密钥或个人信息**
- [ ] 迁移已应用：<查一张表的字段或版本表>
- [ ] 用真实账号走通一条核心流程（<哪一条>）
- [ ] 定时任务/队列真的在跑：<查看方式>
- [ ] 备份任务已就绪并**手动跑过一次**

## 7. 回滚步骤（必须实测过一次）

| 场景 | 动作 | 命令 | 实测日期 |
| --- | --- | --- | --- |
| 应用坏了 | 回到上一个镜像 tag | `docker compose` 改 tag 并 up -d | |
| 迁移出问题 | 恢复迁移前备份 | `psql < backup/pre-migrate-*.sql` | |
| 只改错一个配置 | 改回环境变量并重启 | | |

## 8. 常见部署失败与处理

| 症状 | 可能原因 | 处理 |
| --- | --- | --- |
| 容器起不来，日志空 | 启动命令错 / 端口被占 | `docker compose logs`；`ss -lntp` 查端口 |
| 报缺少环境变量 | `.env` 没加载或变量名拼错 | 对照第 1 节表格逐项核对 |
| 502 / Bad Gateway | 应用没起来，或反向代理指错端口 | 先 `curl localhost:<port>/healthz` |
| 数据库连不上 | 白名单、密码、SSL 模式 | `psql "<连接串>"` 手工试连 |
| 迁移报错 | 迁移与代码版本不匹配 | 停发布 → 查迁移顺序 → 必要时恢复备份 |
| 时间差 8 小时 | 容器时区或数据库时区不对 | 统一用 UTC 存储，展示层转时区 |
| 上传文件丢失 | 写到了容器内部路径 | 改为数据卷或对象存储 |
| 磁盘满 | 日志没轮转 | 见第 4 节日志轮转；清理旧备份 |

## 9. 部署记录

| 日期 | 版本/tag | 方式 | 结果 | 备注 |
| --- | --- | --- | --- | --- |
| | | | | |
