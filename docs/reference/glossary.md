# 术语表

按字母 / 拼音排，方便速查。详细解释见 [关键概念](/intro/concepts)。

## A

**access token** — router 邮箱登录后签发的短期访问令牌，默认 30 分钟过期。HttpOnly cookie 形式。

**ACL** — Access Control List，share 的访问控制白名单（`shared_with_emails`）。

**API key (market)** — 市场签发给 API 用户的密钥，`sk-...` 开头。调模型 API 用。

**API key (上游)** — Provider 在客户端配置的、上游模型厂商签发的真实密钥。永远不出本地。

## B

**BPS** — basis points，万分点。1000 BPS = 10%。市场抽成、router 抽成都用 BPS 表示。

## C

**Cloudflare** — 推荐用作 router 域名 CDN + TLS 终止 + DDoS 防护。免费 plan 够小规模用。

**client_payable** — Provider 待提现余额账户。

## D

**dashboard** — router 公开 web 面板，显示 share 列表、世界地图、在线 client 数。

**Dodo Payments** — market 默认的跨境收款服务商。

## F

**fee_revenue** — 平台手续费 + 抽成账户。

**for_sale** — share 的两种模式：`free`（免费 + 限流）或 `sale`（付费）。

## G

**Gate.io** — Provider 自动提现走的交易所，用 USDT 结算。

## I

**installation** — 一台跑 cc-switch 客户端 / market 服务的设备，在 router 注册得到的身份。一台设备一个 installation。

## L

**ledger** — market 的资金账本。所有充值、扣费、抽成、提现都是 ledger 上的 transaction。

**lease** — 短期 SSH 隧道凭证，默认 60 秒过期。client 启动 share 时跟 router 申请。

## M

**market** — cc-switch-market，token 交易市场。负责充值、计费、提现、工单。

**MCP** — Model Context Protocol，CLI 工具调用外部能力的标准协议。

## N

**needs_review** — 请求异常（上游断开、客户端断开、usage 解析失败）时进入的状态，等 admin 处理。

## O

**owner_email** — share 创建时填的所有者邮箱，决定谁能看 API key 明文、谁拿 `client_payable`。

## P

**payout_reserved** — Provider 已发起提现、待处理的锁定余额账户。

**Provider** — 持有 token 并把 token 上架到市场出售的人。

## R

**Resend** — router 邮箱验证码发送服务。

**router** — cc-switch-router，整个网络的中枢。HTTP 反代 + SSH 隧道 + SQLite 状态。

**refresh token** — router 邮箱登录后签发的长期刷新令牌，默认 30 天过期。

## S

**session** — Web 登录态，HttpOnly cookie 形式。

**share** — Provider 在客户端创建的"对外出售的 token 通道"，对应一个 subdomain。

**shared_with_emails** — share 的 ACL 白名单，里面的邮箱登录后可以看 API key 明文。

**SSE** — Server-Sent Events，OpenAI streaming 用的协议。

**subdomain** — 子域名前缀，每个 share 占一个。先到先得。

**system tray** — cc-switch 的系统托盘菜单，可以在不打开主界面的情况下切换供应商。

## T

**Turso** — libSQL 远程数据库服务，market 可选作为 SQLite 的远程替代。

**tunnel** — SSH 反向隧道。client 通过它把本地端口暴露给 router。

## U

**user_cash** — API 用户可用余额账户。

**user_reserved** — API 用户请求预授权锁定余额账户。

**usage** — 一次请求的 token 用量，包含 input、output、cache 等字段。

## W

**wildcard subdomain** — 通配子域，DNS 配 `*.tokenswitch.cc` 全部解析到 router。

## 延伸阅读

- [关键概念](/intro/concepts) — 这些词背后的故事
- [架构](/intro/architecture) — 它们怎么串起来
