# Dashboard

Router 自带一个公开 Web 面板，访问区域站点根路径即可（如 `https://jptokenswitch.cc/`）。**默认匿名可读**，不用登录。

前端是 Next.js 静态导出，`build.rs` 把 `frontend/out/` 编译进二进制，由 catch-all 路由提供服务 —— 单文件部署，没有外部资源依赖。i18n 覆盖 `en` 和 `zh-CN`。

## 公开可看的

| 内容 | 来源 |
| --- | --- |
| 世界地图（活跃 Client 的大致位置，按坐标聚合成点） | `GET /v1/public/map-points` |
| 网络统计 | `GET /v1/public/network-stats` |
| 公告 | `GET /announcement` |
| 嵌入用徽章 | `GET /v1/public/embed/global.svg`、`/v1/public/embed/usage/:user_id` |
| Share Market 挂牌目录 | `GET /v1/share-market/listings` |
| Client 公开聊天室历史 | `GET /v1/chat/*` |
| Client 进程日志（最近 5 分钟公开投影，最多 10 行） | `GET /v1/server-logs/*` |

地图点是按 IP 推断的城市级坐标聚合，一个点可能对应多个 Client，所以点数和 Client 总数对不上是正常的。

## 登录后

登录用邮箱验证码，见 [邮箱登录](/router/login)。

| 页面 | 内容 |
| --- | --- |
| `/share-market` | Share Market：目录 + Mine（你的挂牌） |
| `/client-market` | Client Market：主机目录 + 你的主机 |
| `/clients` | 你的 Client 列表，可开控制台和终端 |
| `/account` | 账户首页 |
| `/account/api-keys` | 你的 API Token（调用所有 Share 用的那个） |
| `/account/share` | 你的 Share |
| `/account/rentals` | 你租的东西 |
| `/account/client` | 你的 Client |
| `/account/provider-usage` | 作为供应商的用量 |
| `/account/consumer-usage` | 作为买家的用量 |
| `/account/billing` | 赊账账户、账单、争议 |
| `/account/payments` | 收款资料与付款声明 |
| `/account/market-access` | 准入策略与授信 |
| `/account/market-readiness` | 供应商运营就绪摘要 |
| `/account/notifications` | 邮件与 Telegram 通知 |

## Client 控制台与终端

`/clients` 页每个条目有「控制台」和「终端」两个按钮，都在 iframe 弹窗里打开。

请求经 **client tunnel** 转发到你的 `cc-switch-server`，鉴权由 Client 自己的 Web 登录态负责 —— 所以你**不需要把 15721 端口暴露到公网**。

「终端」是把 Client 的 Web URL 加上 `?view=terminal&embed=1` 打开。`embed=1` 让 Client 前端隐藏自己的页头和状态条，只渲染终端画布，窗口标题栏由 Router 这侧提供。

> 这条链路和 Client Market 里 **Host Provider 的 Web 终端**是两回事。后者是 Router 起 `ssh` 子进程连到主机，只有 Host Provider 本人能开。

## 通知

`/account/notifications` 配邮件和 Telegram，两个开关独立，**至少启用一个**。

Telegram 未绑定或 Bot 未就绪时开不了，服务端执行相同约束。绑定完成发生在 Telegram 侧，页面会以 3 秒间隔轮询，5 分钟后自动停止。

## 公开数据的边界

Router 公开的事件数据包含完整邮箱、账单金额、收款方式与联系方式、付款 reference、凭证 URL、争议原因和安全的原始错误。

**唯一的保密例外**（绝不出现在数据库、API、日志或 UI 里）：API Key、OAuth / Session token、Cookie、Authorization、密码、secret、私钥、SSH / lease 凭据。

后端在写入前就拒绝敏感字段和带凭据的 URL，命中凭据片段的错误文本整体替换为占位符；Web UI 还会独立做一遍字段、文本和 URL 过滤。

加密货币收款地址是例外中的例外：`kind=crypto` 且值为 `USDT` / `USDC` 时作为公开资产符号放行。

## 管理员入口

Router 管理员另有两个入口：

- `/settings` —— 受管环境变量，按 7 个配置域组织
- `/operations` —— 版本与服务操作、Router 日志、通知投递历史、管理员审计

普通用户看不到。

## 延伸阅读

- [邮箱登录](/router/login)
- [Share 访问与脱敏](/router/share-access)
- [Router 环境变量](/reference/router-env)
