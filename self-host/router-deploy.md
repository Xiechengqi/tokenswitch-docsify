# 部署 Router

## 拿二进制

GitHub Actions 在 `master` 分支自动构建 Ubuntu AMD64 二进制并更新 `latest` Release：

```bash
wget https://github.com/xiechengqi/cc-switch-router/releases/download/latest/cc-switch-router-linux-amd64 \
  -O /usr/local/bin/cc-switch-router
chmod +x /usr/local/bin/cc-switch-router
```

自己编译的话，**必须先构建前端**（`build.rs` 会把 `frontend/out/` 内嵌进二进制）：

```bash
(cd frontend && npm ci && npm run build)
cargo build --release
```

## 配置文件

默认路径 `$HOME/.cc-switch-router/.env`。

**首次启动时如果文件不存在，Router 会自动生成一份默认 `.env`，然后按它加载配置。** 所以最省事的做法是先跑一次让它生成，再改。

`.env` 里的受管配置**优先于进程中预先存在的同名环境变量**。之后统一通过 Web Settings 修改。

## 最小配置

```dotenv
CC_SWITCH_ROUTER_API_ADDR=0.0.0.0:80
CC_SWITCH_ROUTER_SSH_ADDR=0.0.0.0:2222
CC_SWITCH_ROUTER_TUNNEL_DOMAIN=example.com
CC_SWITCH_ROUTER_USE_LOCALHOST=false
CC_SWITCH_ROUTER_OWNER_EMAIL=you@example.com
CC_SWITCH_ROUTER_RESEND_API_KEY=re_xxx
CC_SWITCH_ROUTER_RESEND_FROM=noreply@example.com
```

几个容易踩的：

- `CC_SWITCH_ROUTER_TUNNEL_DOMAIN` 是**公共 tunnel 域名**，所有 Share 和 Client 子域名挂在它下面
- `CC_SWITCH_ROUTER_USE_LOCALHOST=false` 时 tunnel URL 用 `https://`
- **走 Cloudflare 代理时**，`CC_SWITCH_ROUTER_SSH_PUBLIC_ADDR` 要填**源站 IP:端口** —— Cloudflare 不代理 2222，Client 必须直连源站建 SSH 隧道
- `CC_SWITCH_ROUTER_RESEND_API_KEY` 不配就发不出验证码，**没人能登录**
- `CC_SWITCH_ROUTER_RESEND_FROM` 留空时默认 `noreply@{TUNNEL_DOMAIN}`

完整变量表见 [Router 环境变量](/reference/router-env)。

## 起服务

```ini
# /etc/systemd/system/cc-switch-router.service
[Unit]
Description=cc-switch-router
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=root
Environment=HOME=/root
ExecStart=/usr/local/bin/cc-switch-router
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now cc-switch-router
```

> Router 和 Client 不一样：**Router 应该配 `Restart=always`**。Client 那边刻意不自动重启，是为了不让 Router 持有对别人机器的持续控制权；Router 是你自己的，正常配就行。

## 验证

```bash
curl -s http://127.0.0.1/v1/healthz
curl -s http://127.0.0.1/v1/regions
```

`/v1/healthz` 在 Turso 模式下数据库不可达时会返回 `503`。

## 数据库

### local 模式（默认）

```dotenv
CC_SWITCH_ROUTER_DB_MODE=local
CC_SWITCH_ROUTER_DB_PATH=/root/.cc-switch-router/cc-switch-router.db
```

### Turso 模式

```bash
turso db create cc-switch-router
turso db show cc-switch-router --url
turso db tokens create cc-switch-router
```

```dotenv
CC_SWITCH_ROUTER_DB_MODE=turso
CC_SWITCH_ROUTER_TURSO_URL=libsql://xxx.turso.io
CC_SWITCH_ROUTER_TURSO_AUTH_TOKEN=xxx
CC_SWITCH_ROUTER_DB_SYNC_INTERVAL_SECS=60
```

**必须用一个全新的空数据库。** URL 不能带凭据、query 或 fragment。

metrics 库始终是独立的本地文件，**不会同步到 Turso**。

## 时钟

Router 内建时钟监控，用 HTTPS `Date` 头三路仲裁（默认 Cloudflare、Apple、AWS），至少两路相符才形成可信偏差样本。

**它只观测和告警，不会修改系统时间。** 请自己配 NTP —— ingress context 的新鲜度窗口是 30 秒前 / 5 秒未来，时钟飘了会导致全站请求验签失败。

## 告警

Router 会持久化事故，可选投递到 Telegram：

```dotenv
CC_SWITCH_ROUTER_ALERTING_ENABLED=true
CC_SWITCH_ROUTER_ALERT_TELEGRAM_ENABLED=true
CC_SWITCH_ROUTER_ALERT_TELEGRAM_BOT_TOKEN=xxx
CC_SWITCH_ROUTER_ALERT_TELEGRAM_CHAT_ID=xxx
CC_SWITCH_ROUTER_ALERT_TELEGRAM_MIN_SEVERITY=warning
```

运维告警的 Telegram 配置和**用户通知**的 Telegram Bot（`CC_SWITCH_ROUTER_TELEGRAM_BOT_*`）是两套独立配置。

## 一个隐私提醒

`CC_SWITCH_ROUTER_IP_INTEL_ENDPOINTS` 用于 Client Market 的主机 IP 情报查询。**每台登记主机的 IP 都会发到这些端点。**

默认是三个内置 `http://` 源站。生产部署应该自建，或者换成你信任的、可以拿到你全量主机清单的一方。缺 scheme 时按 `https://` 处理；仍用 `http://` 时启动会打印告警。结果缓存 6 小时。

## 自升级

Router 支持进程自替换（`/operations` 页触发）：暂存临时文件 → 从 GitHub latest release 下载 → `chmod +x` → 用 `--help` 冒烟自检 → 用新二进制跑 `check-db` 确认能接受当前数据库 → SHA-256 比对 → 原子 `rename(2)` 交换（旧二进制留 `.bak`）→ 探测服务管理器 → `setsid -f` 延时重启。

**任一步失败都在交换二进制之前返回错误，进程继续跑旧版本。**

## 延伸阅读

- [域名与 TLS](/self-host/dns-tls)
- [接入 Client](/self-host/client-onboard)
- [Router 环境变量](/reference/router-env)
