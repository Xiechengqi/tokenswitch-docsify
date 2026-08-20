# 提供主机（Host Provider）

把一台闲置 Linux 服务器挂到 Client Market 上。

## 你要准备什么

- 一台 Linux 服务器，能被公网 SSH 访问
- root 或可 sudo 的账号
- 稳定的网络和电源

## Router 会对这台机器做什么

Router 用一把**专用外发 Ed25519 provision key** 通过 SSH 登录，然后：

1. 安装依赖
2. 部署 `cc-switch-server`
3. 完成向 Router 的注册
4. 启动一次进程

安装的服务**不开机自启、不失败重启**。Router **不会**在后续因为隧道离线而重新登录去拉起进程 —— 只会记录状态并告警。

这把 provision key 和 Router 接收 SSH 隧道用的 host key 是**两把独立的钥匙**，不复用。

## 挂上去

在 **Client Market**（`/client-market`）添加主机，填 SSH 连接信息，然后配置：

| 配置项 | 说明 |
| --- | --- |
| 计费方式 | 免费，或固定 USD 每日价格 |
| 服务期限 | 1–365 天固定期限，或永久 |
| 准入策略 | 免费主机走 `client_host/free`（默认黑名单）；付费主机走 `client_host/paid`（默认白名单） |

付费主机默认白名单，意味着**你要逐个批准租用方并授予 USD 信用额度**，或者把这个作用域切成黑名单模式并开放公共额度。

在 `/account/market-access` 管理准入，`/account/market-readiness` 看运营摘要（收款资料是否齐、有多少待准入、账务待办、四项准入策略状态）。

## 收款资料

付费主机之前**先把收款资料填好**：收款方式和联系方式。

出账时系统会把这份资料**冻结进账单**。之后你改资料，不影响已出账单 —— 买家付的是账单上那份。

在 `/account/payments` 维护。

## 状态与运维

| 状态 | 你要做什么 |
| --- | --- |
| `idle` | 空闲，等租 |
| `locked` / `reserved` | 交易或报价锁定中，别动 |
| `allocated` | 已租出，正在服务 |
| `draining` | 归还清理中；卡住超 10 分钟 Router 会自动派清理任务 |
| `unreachable` | Router 连不上；超 5 分钟会 SSH 探测，确认无安装痕迹则清记录复位 |
| `abnormal` | 需要你介入排查 |
| `disabled` | 你自己停用的 |

**进程离线要你自己处理。** Router 不会替你重启。想要开机自启或崩溃重启，自己在机器上配置。

## Web 终端

`/client-market` 上你自己的主机条目可以开 Web 终端：xterm.js 经 WebSocket 连到 Router 起的 `ssh` 子进程。

- 一次性 ticket 授权
- 每用户最多 2 个并发会话
- 有空闲超时和硬超时

**只有你本人能开。** 租用方不能，Router 管理员也不能。

## 收钱

按 [Share Market 的账务规则](/provider/billing) 走，同一本账：

- 前 12 小时健康时长试用，不计费
- 只按 Router 观测到的健康区间累计
- 同一买家名下你的主机和 Share **合并出账**
- 买家线下付款并声明后，**你确认到账**，服务恢复

你可以随时永久关闭对某个买家的赊账关系；关闭即时锁定并终止服务，清账后也不恢复。

## 延伸阅读

- [Client Market 概览](/client-market/overview)
- [准入策略](/provider/access)
- [账务与收款](/provider/billing)
