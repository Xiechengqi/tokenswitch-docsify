# router 环境变量

完整列表，按主题分组。配置文件位于 `~/.config/cc-switch-router/.env`。进程环境变量优先级高于 `.env`。

## 基础

| 变量 | 默认值 | 说明 |
|---|---|---|
| `CC_SWITCH_ROUTER_API_ADDR` | `0.0.0.0:8787` | HTTP 监听地址 |
| `CC_SWITCH_ROUTER_SSH_ADDR` | `0.0.0.0:2222` | SSH 监听地址 |
| `CC_SWITCH_ROUTER_TUNNEL_DOMAIN` | `0.0.0.0:8787` | 公共 tunnel 域名 |
| `CC_SWITCH_ROUTER_SSH_PUBLIC_ADDR` | `{TUNNEL_DOMAIN}:{SSH_PORT}` | 下发给客户端的 SSH 地址。Cloudflare 代理时填源站 IP:端口 |
| `CC_SWITCH_ROUTER_USE_LOCALHOST` | `true` | `false` 时 tunnel URL 用 `https://` |
| `RUST_LOG` | — | Rust 日志过滤规则（可选） |

## 数据存储

| 变量 | 默认值 | 说明 |
|---|---|---|
| `CC_SWITCH_ROUTER_DB_PATH` | `$HOME/.config/cc-switch-router/cc-switch-router.db` | SQLite 路径 |

## Lease / Share 清理

| 变量 | 默认值 | 说明 |
|---|---|---|
| `CC_SWITCH_ROUTER_LEASE_TTL_SECS` | `60` | tunnel lease 有效期（秒） |
| `CC_SWITCH_ROUTER_CLEANUP_INTERVAL_SECS` | `300` | 清理任务执行间隔（秒） |
| `CC_SWITCH_ROUTER_LEASE_RETENTION_SECS` | `604800` | 过期 lease 保留时长（秒） |
| `CC_SWITCH_ROUTER_CLIENT_STALE_SECS` | `3600` | client 超过该时间未上报时清理其 share、lease 和 client 记录 |

## Resend 邮件

| 变量 | 默认值 | 说明 |
|---|---|---|
| `CC_SWITCH_ROUTER_RESEND_API_KEY` | 空 | Resend API Key，用于邮箱验证码发送和 dashboard 用量读取 |
| `CC_SWITCH_ROUTER_RESEND_FROM` | 空 | 验证码邮件发件人 |
| `CC_SWITCH_ROUTER_RESEND_REPLY_TO` | 空 | 验证码邮件 Reply-To |

## 认证

| 变量 | 默认值 | 说明 |
|---|---|---|
| `CC_SWITCH_ROUTER_AUTH_CODE_TTL_SECS` | `300` | 邮件验证码有效期（秒） |
| `CC_SWITCH_ROUTER_AUTH_CODE_COOLDOWN_SECS` | `60` | 同邮箱 / 设备发验证码冷却（秒） |
| `CC_SWITCH_ROUTER_AUTH_SESSION_TTL_SECS` | `1800` | access token 有效期（秒） |
| `CC_SWITCH_ROUTER_AUTH_REFRESH_TTL_SECS` | `2592000` | refresh token 有效期（秒） |
| `CC_SWITCH_ROUTER_AUTH_MAX_VERIFY_ATTEMPTS` | `5` | 单挑战最大输错次数 |

## 限流

| 变量 | 默认值 | 说明 |
|---|---|---|
| `CC_SWITCH_ROUTER_AUTH_EMAIL_HOURLY_LIMIT` | `30` | 单邮箱每小时最大发送次数 |
| `CC_SWITCH_ROUTER_AUTH_IP_HOURLY_LIMIT` | `20` | 单 IP 每小时最大发送次数 |
| `CC_SWITCH_ROUTER_AUTH_INSTALLATION_HOURLY_LIMIT` | `10` | 单 installation 每小时最大发送次数 |
| `CC_SWITCH_ROUTER_FREE_SHARE_IP_PARALLEL_LIMIT` | `1` | free share 共用的单真实 IP 并发上限。设为 `0` 关闭限流 |

## 最小生产配置示例

```bash
CC_SWITCH_ROUTER_API_ADDR=0.0.0.0:80
CC_SWITCH_ROUTER_SSH_ADDR=0.0.0.0:2222
CC_SWITCH_ROUTER_TUNNEL_DOMAIN=tokenswitch.cc
CC_SWITCH_ROUTER_USE_LOCALHOST=false
CC_SWITCH_ROUTER_RESEND_API_KEY=re_xxx
CC_SWITCH_ROUTER_RESEND_FROM=TokenSwitch <noreply@tokenswitch.cc>
```

Cloudflare 代理 + 独立 SSH 子域时再加：

```bash
CC_SWITCH_ROUTER_SSH_PUBLIC_ADDR=ssh.tokenswitch.cc:2222
```

## 延伸阅读

- [部署 router](/self-host/router-deploy)
- [域名与 TLS](/self-host/dns-tls) — Cloudflare 的端口注意事项
