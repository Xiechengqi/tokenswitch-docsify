# market 环境变量

完整列表，按主题分组。配置文件位于 `~/.config/cc-switch-market/.env`。也可以用 `cc-switch-market config` 交互式修改。

## 基础

| 变量 | 默认值 | 说明 |
|---|---|---|
| `MARKET_HTTP_ADDR` | `0.0.0.0:8080` | market 本地 HTTP 监听地址 |
| `MARKET_TUNNEL_ENABLED` | `true` | 是否启动后向 router 申请 market tunnel lease |
| `RUST_LOG` | `cc_switch_market=debug,tower_http=info,axum=info` | Rust 日志过滤规则 |

## Session

| 变量 | 默认值 | 说明 |
|---|---|---|
| `MARKET_SESSION_COOKIE_NAME` | `cc_switch_market_session` | Web 登录 cookie 名 |
| `MARKET_SESSION_COOKIE_SECRET` | `change-me-...` | session token hash pepper。**生产必须改成高强度随机值** |
| `MARKET_SESSION_TTL_SECS` | `2592000` | session 有效期（默认 30 天） |
| `MARKET_ADMIN_EMAILS` | `admin@example.com` | admin 白名单，逗号分隔 |

## 计费

| 变量 | 默认值 | 说明 |
|---|---|---|
| `MARKET_MIN_REQUEST_BALANCE` | `1.00` | API 请求最低余额门槛（USD） |
| `MARKET_PLATFORM_COMMISSION_BPS` | `1000` | Market 抽成（万分点）。1000 = 10% |
| `MARKET_ROUTER_COMMISSION_BPS` | `500` | Router 抽成（万分点）。500 = 5% |

Market + Router 总抽成不能超过 10000（100%）。Router 抽成进 `router@[router_host]` 的 provider 余额。

## SQLite / Turso

| 变量 | 默认值 | 说明 |
|---|---|---|
| `MARKET_SQLITE_PATH` | 空 → `$HOME/.config/cc-switch-market/cc-switch-market.db` | 本地 SQLite 路径 |
| `TURSO_DATABASE_URL` | 空 | Turso URL，必须 `libsql://` 开头。配了就不用本地 SQLite |
| `TURSO_AUTH_TOKEN` | 空 | Turso 认证 token，配 URL 时必填 |
| `TURSO_REPLICA_PATH` | 空 → `$HOME/.config/cc-switch-market/turso-replica.db` | embedded replica 本地路径 |
| `TURSO_SYNC_INTERVAL_SECS` | `300` | replica 同步间隔（预留） |
| `TURSO_BACKUP_ENABLED` | `true` | 是否定时备份 replica |
| `TURSO_BACKUP_INTERVAL_SECS` | `3600` | 备份间隔（默认每小时） |
| `TURSO_BACKUP_RETENTION_DAYS` | `7` | 备份保留天数 |

## 对象存储

| 变量 | 默认值 | 说明 |
|---|---|---|
| `OBJECT_STORE_BACKEND` | `local` | `local` 或 `r2`（r2 当前预留） |
| `OBJECT_STORE_LOCAL_DIR` | 空 → `$HOME/.config/cc-switch-market/objects` | 本地对象存储目录 |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` / `R2_PUBLIC_BASE_URL` | 空 | Cloudflare R2 配置（预留） |

## Router 关联

| 变量 | 默认值 | 说明 |
|---|---|---|
| `ROUTER_BASE_DOMAIN` | `localhost:8081` | router 基础域名。只填域名或 `host:port`，不带协议 |
| `ROUTER_MARKET_SUBDOMAIN` | `market` | market 在 router 通配 tunnel 下的子域名前缀 |
| `MARKET_DISPLAY_NAME` | `Main Market` | router dashboard 上显示的 market 名称 |

`MARKET_PUBLIC_BASE_URL` 不需要手工配，由 `ROUTER_BASE_DOMAIN + ROUTER_MARKET_SUBDOMAIN` 推导。

## Dodo Payments

| 变量 | 默认值 | 说明 |
|---|---|---|
| `DODO_API_BASE` | `https://test.dodopayments.com` | Dodo API 地址 |
| `DODO_API_KEY` | 空 | API key。空则不调 Dodo（mock 模式） |
| `DODO_PRODUCT_ID` | 空 | top-up 产品 ID。建议配置为 0.01 USD 单价产品 |
| `DODO_ALLOWED_PAYMENT_METHOD_TYPES` | `credit,debit,apple_pay,google_pay,we_chat_pay,crypto_currency` | 支付方式（Dodo API 枚举值） |
| `DODO_WEBHOOK_SECRET` | `dev` | Dodo webhook 校验密钥。**生产必须改** |
| `DODO_MOCK_CHECKOUT_ENABLED` | `true` | Dodo 未配时是否允许 mock checkout。**生产建议 `false`** |

## Gate.io 提现

| 变量 | 默认值 | 说明 |
|---|---|---|
| `GATEIO_API_BASE` | `https://api.gateio.ws` | Gate.io API 地址 |
| `GATEIO_API_KEY` | 空 | API key |
| `GATEIO_API_SECRET` | 空 | API secret |
| `GATEIO_SETTLEMENT_CURRENCY` | `USDT` | 提现币种 |
| `GATEIO_USD_USDT_RATE` | `1.000000` | USD → USDT 换算率 |
| `GATEIO_AUTO_PAYOUT_ENABLED` | `false` | 启用自动提现 |
| `GATEIO_PAYOUT_WORKER_INTERVAL_SECS` | `60` | 提现 worker 扫描间隔 |

## 最小生产配置示例

```bash
MARKET_HTTP_ADDR=0.0.0.0:8080
ROUTER_BASE_DOMAIN=tokenswitch.cc
ROUTER_MARKET_SUBDOMAIN=market
MARKET_SESSION_COOKIE_SECRET=<openssl rand -hex 32>
MARKET_ADMIN_EMAILS=admin@tokenswitch.cc
DODO_MOCK_CHECKOUT_ENABLED=true   # 测试期；生产改 false 并填 Dodo 配置
```

## 延伸阅读

- [部署 market](/self-host/market-deploy)
- [router 环境变量](/reference/router-env)
