# 关键概念

下面是文档里反复出现的几个词。看一遍，后面读起来会顺很多。

## installation（安装实例）

一台跑着 cc-switch 客户端或 cc-switch-market 的设备，在 router 上注册之后，叫做一个 installation。注册时会生成一对设备密钥，私钥留在本地，公钥上传给 router。后续所有跟 router 的通信都用这把私钥签名。

一台机器一个 installation。换电脑就要重新注册。

## share

Provider 在客户端创建的一个"对外出售的 token 通道"。每个 share 包含：

- 一个 subdomain（子域名前缀，比如 `mike-claude`）
- 一个 for_sale 标记（free 或 sale）
- 一个上游 API key（不离开 Provider 设备）
- 可选的 `shared_with_emails`（白名单，只让特定邮箱看到 API key 明文）

share 启用后会在 router dashboard 上出现，市场调用时通过 subdomain 找到它。

## lease（租约）

短期凭证，用来开 SSH 反向隧道。客户端启动 share 时跟 router 申请 lease，里面包含一次性 SSH 用户名密码。lease 默认 60 秒过期，过期后客户端会续期。

lease 的设计是为了避免长期共享密钥泄漏：哪怕被截获，也只能用一次、用一会儿。

## tunnel（隧道）

客户端通过 SSH 反向转发，把本地的一个端口（默认 `127.0.0.1:15721`）映射到 router 的子域名。请求进 router 后顺着这条隧道回到客户端。

不需要公网 IP，不需要开放路由器端口，能联网就能跑 share。

## API key（市场签发）

API 用户在 market 创建的密钥，用来调 OpenAI / Anthropic 兼容接口。它跟 Provider 的上游 API key 是两回事。

- API 用户拿到的是 market 签发的 key（`sk-...`），余额由 market 管理
- Provider 上传给 client 的是上游真实 key，永远不出本地

## ledger（账本）

market 内部的资金账本。每一次充值、扣费、抽成、提现，都是 ledger 上的一条 transaction。账户类型包括：

| 账户 | 含义 |
|---|---|
| `user_cash` | API 用户可用余额 |
| `user_reserved` | 请求预授权锁定 |
| `client_payable` | Provider 待提现余额 |
| `payout_reserved` | 已发起提现锁定 |
| `fee_revenue` | 平台手续费、抽成 |

admin 不能直接改余额缓存，所有人工调整都要走 ledger transaction，留下审计痕迹。

## subdomain（子域名）

router 用 wildcard DNS 接管整个域，比如 `*.tokenswitch.cc`。每个 share 占用一个子域名前缀。market 自己也占一个，比如 `market.tokenswitch.cc`。请求进入 router 时按 Host 头找到对应 share 或 market。

子域名是先到先得，由 Provider 在客户端 claim。

## for_sale（出售标记）

share 有两种状态：

- `free`：免费，但有并发限流（默认每个真实用户 IP 同时只能一个请求）
- `sale`：付费，由 market 计费扣款

free share 主要用于体验、demo。真要让别人用得舒服，建议设成 sale。

## 延伸阅读

- [架构](/intro/architecture) — 这些概念在请求链路里怎么串起来
- [术语表](/reference/glossary) — 更完整的词汇表
