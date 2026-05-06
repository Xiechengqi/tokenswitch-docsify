# 部署 market

cc-switch-market 是一个 Rust binary，前端（Next.js）已经嵌入到二进制里。部署只需要一个文件。

## 准备

- 已经部署并跑起来 router：[部署 router](/self-host/router-deploy)
- 决定 market 用哪个子域名，比如 `market.tokenswitch.cc`
- 一个能登 router 的邮箱（market 用它做身份）
- 可选：Dodo Payments 账号（收款）、Gate.io API key（自动提现）

## 1. 下载二进制

去 [cc-switch-market Release](https://github.com/xiechengqi/cc-switch-market/releases) 下最新版。或者从源码构建：

```bash
git clone https://github.com/xiechengqi/cc-switch-market.git
cd cc-switch-market
./build.sh   # 输出在 target/release/cc-switch-market
```

把 binary 放到服务器上：

```bash
sudo mv cc-switch-market /usr/local/bin/
sudo chmod +x /usr/local/bin/cc-switch-market
```

## 2. 第一次跑

```bash
cc-switch-market
```

会自动在 `~/.config/cc-switch-market/.env` 生成默认配置，然后启动。先 Ctrl-C 停掉，去改配置。

## 3. 改配置

编辑 `~/.config/cc-switch-market/.env`，最少改这几项：

```bash
# router 信息（要跟 router 部署一致）
ROUTER_BASE_DOMAIN=tokenswitch.cc
ROUTER_MARKET_SUBDOMAIN=market

# session 密钥（生产环境必须改）
MARKET_SESSION_COOKIE_SECRET=<openssl rand -hex 32>

# admin 邮箱（白名单）
MARKET_ADMIN_EMAILS=admin@example.com

# Resend 用 router 的，无需在 market 重复配
```

> 完整环境变量见 [market 环境变量](/reference/market-env)。

可选：

- `DODO_API_KEY` + `DODO_PRODUCT_ID` 启用真实充值
- `GATEIO_API_KEY` + `GATEIO_API_SECRET` + `GATEIO_AUTO_PAYOUT_ENABLED=true` 启用自动提现

不配 Dodo 会跑 mock checkout（不收钱），适合演示。

## 4. 登录 router

market 启动前要先用邮箱验证码登录 router：

```bash
cc-switch-market login
```

填邮箱 → 收验证码 → 输回去。成功后会保存 session 到：

```text
~/.config/cc-switch-market/router-session.json
```

之后 market 启动会自动用这个 session 调 router 接口、注册自己。

## 5. 跑起来

systemd unit：

```bash
sudo tee /etc/systemd/system/cc-switch-market.service > /dev/null <<'EOF'
[Unit]
Description=cc-switch-market
After=network.target cc-switch-router.service
Requires=cc-switch-router.service

[Service]
Type=simple
Environment=HOME=/root
EnvironmentFile=/root/.config/cc-switch-market/.env
ExecStart=/usr/local/bin/cc-switch-market
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now cc-switch-market
sudo systemctl status cc-switch-market
```

启动时如果 `MARKET_TUNNEL_ENABLED=true`（默认），market 会自动跟 router 申请 tunnel lease，挂到 `market.tokenswitch.cc`。

## 6. 验证

```bash
curl https://market.tokenswitch.cc/v1/healthz
# {"ok":true}
```

浏览器打开 `https://market.tokenswitch.cc/`，看到市场首页。

用刚才登录 router 的邮箱（`MARKET_ADMIN_EMAILS` 里的）登录 market：

- 顶部"登录" → 填邮箱 → 收验证码 → 进 dashboard
- dashboard 应该能看到 admin 入口（普通用户没有）

## 7. 收款 / 提现配置

启用 Dodo（真实充值）：

1. 注册 [Dodo Payments](https://dodopayments.com/)
2. 在 Dodo 后台创建一个 0.01 USD 单价的产品（market 用充值金额换算 quantity）
3. 拿到 API key、product ID、webhook secret
4. 写入 `.env`：

```bash
DODO_API_KEY=...
DODO_PRODUCT_ID=...
DODO_WEBHOOK_SECRET=...
DODO_MOCK_CHECKOUT_ENABLED=false
```

5. 在 Dodo 后台配 webhook URL：`https://market.tokenswitch.cc/v1/topups/webhook`

启用 Gate.io 自动提现：

1. Gate.io API key + secret
2. 写入 `.env`：

```bash
GATEIO_API_KEY=...
GATEIO_API_SECRET=...
GATEIO_AUTO_PAYOUT_ENABLED=true
```

3. 重启 market

## 数据存哪

```text
~/.config/cc-switch-market/
├── .env                          # 配置
├── cc-switch-market.db           # 默认 SQLite（除非配了 Turso）
├── objects/                      # 对象存储（webhook 原文、提现凭证、附件）
├── router-session.json           # 登 router 的 session
├── web-auth-identity.json        # Web 用户认证的 installation 私钥
└── turso-db-backup/              # 用 Turso 时的本地备份
```

备份整个目录即可。

## 升级

```bash
sudo systemctl stop cc-switch-market
sudo cp /path/to/new/cc-switch-market /usr/local/bin/
sudo systemctl start cc-switch-market
```

schema 自动迁移，前端跟着 binary 一起更新。

## 延伸阅读

- [客户端接入](/self-host/client-onboard) — 让 cc-switch 连过来
- [market 环境变量](/reference/market-env)
