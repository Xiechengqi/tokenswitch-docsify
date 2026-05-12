# 客户端接入

router 和 market 都跑起来之后，让 cc-switch 客户端连过来。

## 怎么换 router 地址

cc-switch 默认连官方 router。要换成你自己的：

1. 打开 cc-switch
2. 设置 → "高级" → "Tunnel 配置"（视客户端版本而定，可能在不同位置）
3. 改 `api_base` / `ssh_addr` / `tunnel_domain` 三项：

| 字段 | 填什么 |
|---|---|
| api_base | `https://tokenswitch.cc` |
| ssh_addr | `tokenswitch.cc:2222`（或你 router 的 SSH 端口） |
| tunnel_domain | `tokenswitch.cc` |

如果 router 走 Cloudflare 代理（默认），SSH 端口要填 **源站 IP** 而不是 Cloudflare 后的域名（CF 不代理 SSH），具体见 [域名与 TLS](/self-host/dns-tls)。

保存后客户端会重新跟你的 router 注册一个 installation。

## 跨 router 切换

cc-switch 不支持同时连多个 router，配置是单选。

如果你既想用官方 router 出 token，又想在自己 router 上测：

- 准备两份 `~/.cc-switch/` 目录（用 `XDG_CONFIG_HOME` 或不同用户切换）
- 或用两台机器分别跑

## 启用 share

跟用官方 router 完全一样：

1. 添加供应商
2. 启用 share
3. 邮箱登录、claim subdomain、选 for_sale

只是现在的 dashboard 在你自己的 router 域名下：`https://tokenswitch.cc/`。

## API 用户怎么用

API 用户的 base URL 改成你的 market 域名：

```bash
# 之前用别人的 market
curl https://other-market.example.com/v1/chat/completions ...

# 改用你自己的
curl https://market.tokenswitch.cc/v1/chat/completions ...
```

key、其他参数都一样。

## 给社群推广

如果你打算让别人也用你的 router 和 market，告诉他们：

- 客户端要改 router 配置（上面三项）
- API 用户改 market base URL

可以做一个一键导入：用 cc-switch 的 [Deep Link](https://github.com/Xiechengqi/cc-switch) 协议（`ccswitch://`）封装一个 URL，让别人点一下就导入你的 router 配置。具体格式看 cc-switch 文档。

## 把客户端跑在服务器上（headless）

cc-switch 是桌面应用，但 share 后端不需要 GUI。一台 Linux 小机（NAS、迷你主机）就够：

1. 装 cc-switch（用 .AppImage 或 .deb）
2. 配置好供应商、启用 share
3. 设置开机自启

需要 GUI 第一次配置。配完之后 X11 forwarding 或者 VNC 进去操作即可。

不要在多台机器上用同一个 owner_email + 同一个 subdomain，会冲突。每个 share 一个 subdomain。

## 延伸阅读

- [部署 router](/self-host/router-deploy)
- [部署 market](/self-host/market-deploy)
- [域名与 TLS](/self-host/dns-tls) — Cloudflare + SSH 怎么搭
