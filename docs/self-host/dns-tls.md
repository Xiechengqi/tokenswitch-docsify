# 域名与 TLS

router 用 wildcard 子域接管整个域，每个 share 占一个前缀。所以 DNS 必须支持通配，TLS 证书必须覆盖通配。**强烈推荐 Cloudflare**，免费且全做好。

## 域名要求

- 你拥有一个域名（一年 ~$10）
- 域名 NS 指向 Cloudflare（在域名注册商后台改）
- 在 Cloudflare 控制台能管这个域

## DNS 配置

进 Cloudflare → 选你的域 → DNS。

加两条记录：

| 类型 | 名称 | 内容 | 代理状态 |
|---|---|---|---|
| A | `@` | `<router 服务器公网 IP>` | 已代理（橙云） |
| A | `*` | `<router 服务器公网 IP>` | 已代理（橙云） |

第一条让 `tokenswitch.cc` 解析到服务器，第二条让 `*.tokenswitch.cc`（任意子域）也解析过去。

## TLS

Cloudflare 自动给整个域颁发通配 TLS 证书。SSL/TLS 模式选 **Full** 或 **Full (strict)**：

- Full：CF 到源站走 HTTPS，源站证书自签也行
- Full (strict)：CF 到源站必须是 CA 签发的有效证书

router 监听的是 80（HTTP），CF 帮你做 HTTPS 终止 + 反代到源站 80。**如果源站要直接收 HTTPS**，自己装 caddy / nginx 转发即可，但通常不需要。

## SSH 端口的特殊处理

Cloudflare 不代理 SSH（不是 HTTP）。所以 SSH 那条要绕过 CF：

**方法 1：在 Cloudflare DNS 里再加一条仅解析（灰云）的子域**

| 类型 | 名称 | 内容 | 代理状态 |
|---|---|---|---|
| A | `ssh` | `<router 服务器公网 IP>` | 仅 DNS（灰云） |

然后在 router 的 `.env` 配置：

```bash
CC_SWITCH_ROUTER_SSH_PUBLIC_ADDR=ssh.tokenswitch.cc:2222
```

cc-switch 客户端会用 `ssh.tokenswitch.cc:2222` 直连源站 SSH。

**方法 2：直接用源站 IP**

```bash
CC_SWITCH_ROUTER_SSH_PUBLIC_ADDR=203.0.113.42:2222
```

简单，但 IP 换了要改配置。

## 防火墙 / 安全组

服务器要开放：

| 端口 | 用途 | 来源 |
|---|---|---|
| 80 | HTTP（CF 反代过来） | 仅 Cloudflare IP 段（推荐） |
| 443 | HTTPS（如果直接收） | 同上 |
| 2222 | SSH 反向隧道（client 接入） | 任意 |
| 22 | 管理 SSH | 限制源 IP |

Cloudflare IP 段：[https://www.cloudflare.com/ips/](https://www.cloudflare.com/ips/)

## 验证

DNS 生效后（最多 5 分钟）：

```bash
# router HTTP
curl https://tokenswitch.cc/v1/healthz

# 任意子域名应该都解析到 router
nslookup random-test.tokenswitch.cc

# SSH 端口可达
nc -zv ssh.tokenswitch.cc 2222
```

三个都通就 OK。

## CF Connecting IP

router 和 market 都会从 `CF-Connecting-IP` 头读真实客户端 IP（用于 free share 限流、地图打点等）。Cloudflare 默认会注入这个头，不用配。

如果你不用 CF，要自己在反代层注入这个头，或改 router 代码识别其他头。

## 多 router / 多区域

不同区域用不同域名（`jp.tokenswitch.cc`、`us.tokenswitch.cc`）独立部署，相互不感知。

cc-switch 客户端只能选一个 router 连，没有跨区域负载均衡。

## 不用 Cloudflare 行不行

可以，但要自己解决：

- 通配 TLS 证书（Let's Encrypt 通配证书需要 DNS-01 验证）
- 反代（caddy / nginx）
- IP 段防火墙
- 真实 IP 头注入

工作量大很多。除非有特殊需求（CF 在你国家被限速、合规要求），否则推荐 CF。

## 延伸阅读

- [部署 router](/self-host/router-deploy) — 配完 DNS 之后的下一步
