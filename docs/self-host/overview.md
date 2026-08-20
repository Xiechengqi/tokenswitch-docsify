# 自部署概览

不用公共区域站点，在自己的域名下跑一整套 TokenSwitch。

## 你需要什么

| 项 | 要求 |
| --- | --- |
| Router 服务器 | 一台有公网 IP 的 Linux 机器，能开 80 和 2222 端口 |
| 域名 | 一个能配 **wildcard DNS** 的域名 —— 整个域会被 Router 接管 |
| Client 机器 | 至少一台，可以和 Router 同机，通常分开 |
| Resend 账号 | 用于发邮箱验证码；不配就没法登录 |

wildcard DNS 是硬要求：每个 Share 和每个 Client 都占一个子域名，必须 `*.example.com` 全部指向 Router。

## 部署顺序

```text
1. 域名与 DNS       ──►  wildcard A 记录指向 Router
2. 部署 Router      ──►  下载二进制、配 .env、起服务
3. 配 TLS           ──►  Cloudflare 代理，或自己上证书
4. 接入 Client      ──►  install-client.sh 指向你的 Router
5. 验证             ──►  建 Share，打通一次真实请求
```

## Router 是什么

`cc-switch-router` 是单个 Rust 二进制，一个进程三个职责：

- **HTTP**（默认 `0.0.0.0:80`）—— API + 基于 Host 子域名的反向代理 + 内嵌前端，共用同一端口
- **SSH**（默认 `0.0.0.0:2222`）—— 基于 `russh` 的反向端口转发，一次性密码认证
- **数据** —— 业务库用本地 libSQL 或 Turso Cloud Embedded Replica；metrics 用独立本地库；Server 审计日志写自有 JSONL / gzip 文件，不进业务库

前端在编译期由 `build.rs` 内嵌进二进制，**单文件部署，没有外部资源依赖**。

## 数据库选哪个

| 模式 | 适用 |
| --- | --- |
| `local`（默认） | 单机部署。libSQL 文件在 `$HOME/.cc-switch-router/cc-switch-router.db` |
| `turso` | 需要托管数据库或多实例读。用 Embedded Replica：读本地副本，写委派给 Turso primary |

Turso 模式**不启用 offline writes**：Turso 不可达时写操作返回 `503 DATABASE_UNAVAILABLE`，`/v1/healthz` 同时返回 `503`。远端恢复后自动恢复健康。

新手用 `local`。

## 单区域还是多区域

公共部署有四个区域，各自独立部署一套 Router，**用户、Share、账务完全不互通**。

自部署通常一个区域就够。仓库根部的 `regions` 文件声明区域到域名的映射，经 `GET /v1/regions` 暴露。

## 你要自己承担什么

自部署意味着你就是 Router 管理员：

- **邮件送达** —— 配 Resend、配 SPF/DKIM，验证码发不出去谁都登不进来
- **数据库备份** —— 业务库里有全部用户、Share、账务和准入数据
- **时钟准确** —— ingress context 有 ±30s/+5s 的新鲜度窗口，时钟飘了全站请求失败。Router 内建时钟监控（只观测和告警，**不会修改系统时间**）
- **市场争议裁决** —— 账单争议由 Router 管理员裁决，管理员可作废账单
- **汇率维护** —— `CC_SWITCH_ROUTER_MARKET_USD_CNY_RATE`，默认 7

## 管理入口

部署完成后，Router 管理员有两个页面：

- `/settings` —— 受管环境变量，按 7 个配置域组织（General & Display、Connectivity、Data & Lifecycle、Identity & Security、Notifications、Observability、Marketplace）
- `/operations` —— 版本与服务操作、Router 日志、通知投递历史、管理员审计

`.env` 是配置的唯一权威来源，**启动时会覆盖进程中预先存在的同名变量**。全部字段都能通过 Web 改。Secret 只返回「是否已配置」，API 从不返回明文。

## 延伸阅读

- [部署 Router](/self-host/router-deploy)
- [域名与 TLS](/self-host/dns-tls)
- [接入 Client](/self-host/client-onboard)
- [Router 环境变量](/reference/router-env)
