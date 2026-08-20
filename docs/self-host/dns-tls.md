# 域名与 TLS

## Wildcard DNS 是硬要求

Router 用 **Host 子域名**定位目标：每个 Share 一个子域名，每个 Client 一个子域名。所以整个域必须指向 Router。

```text
example.com        A     <Router IP>
*.example.com      A     <Router IP>
```

没有 wildcard，新建的 Share 就是不可达的 —— 你不可能每建一个 Share 就手动加一条 DNS。

对应配置：

```dotenv
CC_SWITCH_ROUTER_TUNNEL_DOMAIN=example.com
```

## 两条端口，两种性质

| 端口 | 用途 | 能不能过 CDN |
| --- | --- | --- |
| `80`（HTTP） | API + 子域名反代 + 前端 | ✅ 可以，也应该 |
| `2222`（SSH） | Client 反向隧道 | ❌ 不行，必须直连源站 |

这是自部署最容易搞错的地方。

## 方案 A：Cloudflare 代理（推荐）

Cloudflare 免费套餐就能给你 wildcard TLS。

**DNS 记录：**

| 记录 | 类型 | 值 | 代理状态 |
| --- | --- | --- | --- |
| `example.com` | A | `<Router IP>` | 🟠 已代理 |
| `*.example.com` | A | `<Router IP>` | 🟠 已代理 |
| `origin.example.com` | A | `<Router IP>` | ⚪ **仅 DNS** |

最后那条是给 SSH 用的 —— Cloudflare 不代理 2222，Client 必须能直接连到源站。

**Router 配置：**

```dotenv
CC_SWITCH_ROUTER_TUNNEL_DOMAIN=example.com
CC_SWITCH_ROUTER_SSH_PUBLIC_ADDR=origin.example.com:2222
CC_SWITCH_ROUTER_USE_LOCALHOST=false
```

`CC_SWITCH_ROUTER_SSH_PUBLIC_ADDR` 是**下发给 Client 的 SSH 地址**。填错了 Client 建不了隧道，Share 全部离线。也可以直接填 IP。

**Cloudflare 侧设置：**

- SSL/TLS 模式：至少 **Full**
- Wildcard 证书：Universal SSL 只覆盖一级子域名（`*.example.com`）。够用
- 如果你要更深的层级（`a.b.example.com`），需要 Advanced Certificate Manager

**真实客户端 IP：** Router 硬编码了 Cloudflare 的 IPv4/IPv6 网段（**不调用任何 Cloudflare API**）。TCP peer 是 CF 边缘时信任 `CF-Connecting-IP` / `CF-IPCountry` / `CF-ASN`，否则回退 socket peer IP。这防止伪造头绕过免费档的按 IP 限流。

**请求体大小：** Cloudflare 免费套餐有 100 MB 上传上限。你的媒体/图片档位（默认 32 / 48 MB）在这之下，没问题；但如果你把上限调到 100 MB 以上，会先被 Cloudflare 拦下。

## 方案 B：自己上证书

不想过 CDN 的话，前面放一个反代（Caddy 最省事，自动申请 wildcard 证书），或者自己用 certbot 的 DNS-01 challenge 签 wildcard 证书。

要点：

- wildcard 证书**必须用 DNS-01**，HTTP-01 签不出 `*.example.com`
- 反代要把 `X-Forwarded-For` 之类的头传对，否则 Router 拿不到真实 IP
- **2222 端口不要过反代**，直接暴露

Caddy 的话：

```caddyfile
*.example.com, example.com {
    tls {
        dns cloudflare {env.CF_API_TOKEN}
    }
    reverse_proxy 127.0.0.1:80
}
```

然后把 Router 的 HTTP 监听改到 `127.0.0.1:8080` 之类，SSH 保持 `0.0.0.0:2222`。

## 验证

```bash
# 主域
curl -sI https://example.com/v1/healthz

# 随便一个不存在的子域名，应该也能到 Router（而不是 DNS 失败）
curl -sI https://whatever.example.com/

# SSH 端口直连
nc -zv origin.example.com 2222
```

第二条特别重要 —— 它验证 wildcard 真的生效了。

## 常见问题

| 现象 | 原因 |
| --- | --- |
| 新建 Share 打不开，主站正常 | wildcard DNS 没配，或没走代理 |
| Client 注册成功但隧道连不上 | `CC_SWITCH_ROUTER_SSH_PUBLIC_ADDR` 指到了 Cloudflare 代理的地址 |
| 免费档限流失效，一个人能开无数并发 | 反代没传真实 IP，或 peer 不是 CF 网段却在信任 CF 头 |
| 大附件请求 `413` | 撞到 Router 的档位上限或 CDN 上限，看哪个更小 |
| 全站 `401` 空正文 | 时钟偏差超出 ingress 新鲜度窗口，检查 NTP |

## 延伸阅读

- [部署 Router](/self-host/router-deploy)
- [接入 Client](/self-host/client-onboard)
- [Share 访问与脱敏](/router/share-access)
