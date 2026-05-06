# 自部署概览

如果你不想用别人运行的 router 和 market，可以自己搭一套。两种典型场景：

- **公司内部**：内网用，所有 token 共享和计费在本地闭环
- **面向特定地区 / 群体**：搭一套独立网络，比如面向日本用户、面向某个 coding 社群

cc-switch 客户端（Provider 端）支持配置任意 router 地址，所以一套 router + market 可以服务任意多客户端。

## 你能拿到什么

完整一套独立网络：

- 一台公网服务器跑 router → 提供 SSH 隧道、HTTP 代理、邮箱登录
- 一台公网服务器跑 market（可以同机）→ 提供充值、API key、计费、提现
- 任意多 cc-switch 客户端连进来出 token
- 任意多 API 用户在 market 注册买 token

## 你需要什么

| 项 | 说明 |
|---|---|
| 一台 Linux 服务器 | Ubuntu 22.04+ / Debian 11+，配置 1C2G 起步够 |
| 一个域名 | router 用 wildcard 子域，所以你需要一个能配通配 DNS 的域名 |
| Cloudflare（推荐） | 用作 wildcard CDN + TLS，免费 |
| Resend 账号 | 发邮箱验证码，免费 plan 够小规模用 |
| Dodo Payments 账号（可选） | 跨境收款；不要钱跑 mock 模式即可 |
| Gate.io 账号（可选） | 自动提现给 Provider；不要可以纯人工 |

最小可跑（无收款、无自动提现）：服务器 + 域名 + Cloudflare + Resend，全部免费起步。

## 部署顺序

```text
1. 买服务器、域名
2. 配 Cloudflare wildcard DNS
3. 部署 router  → /self-host/router-deploy
4. 部署 market  → /self-host/market-deploy
5. cc-switch 客户端连进来 → /self-host/client-onboard
```

每一步都有验证命令，跑完确认 OK 再走下一步。

## 估算成本

最小规模：

| 项 | 估算 |
|---|---|
| 服务器（DigitalOcean 1C2G） | ~$6/月 |
| 域名 | ~$10/年 |
| Cloudflare | $0（免费 plan 够用） |
| Resend | $0（每月 3000 封免费） |
| Dodo Payments | 按交易抽成（不交易不收费） |
| **合计起步** | **~$6/月 + $10/年** |

跑大了再考虑：换 Turso 替换本地 SQLite、加 Cloudflare R2 做对象存储、上更大的服务器。

## 不打算开源运营

你也可以只跑 router 自用，不开市场。这样 cc-switch 客户端连你的 router，互相之间通过 share 传 token，不收钱不计费。适合家里 / 公司小圈子。

跳过 market 部分即可。

## 延伸阅读

- [域名与 TLS](/self-host/dns-tls) — 先把 DNS 和 wildcard 子域跑通
- [部署 router](/self-host/router-deploy) — 第一步
