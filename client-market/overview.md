# Client Market 概览

Share Market 交易的是 **token 额度**。Client Market 交易的是**机器**。

## 它解决什么

想当 Share Owner，你需要一台一直开着的 Linux 机器来跑 `cc-switch-server`。不是所有人都有。

反过来，很多人有闲置的 VPS 在那儿空转。

Client Market 把这两边接起来：**Host Provider** 提供机器，Router 自动在上面装好 Client，租用方拿到一台开箱可用的 `cc-switch-server`。

## 自动开通

Router 用一把**专用外发 Ed25519 provision key** 登录目标机器 —— 这把钥匙和 Router 自己接收 SSH 隧道用的 host key 完全独立，互不复用。

登录后 Router 安装依赖、部署 `cc-switch-server`、完成注册，让这台机器成为一个可用的供给节点。

## 主机状态

```text
idle ──► locked ──► allocated ──► draining ──► idle
```

| 状态 | 含义 |
| --- | --- |
| `idle` | 空闲可租 |
| `locked` | 交易中，短暂锁定 |
| `allocated` | 已分配给租用方 |
| `draining` | 归还中，正在清理 |
| `reserved` | 报价锁定期 |
| `unreachable` | Router 连不上 |
| `abnormal` | 异常 |
| `disabled` | 被 Provider 停用 |

自动对账规则：

- `draining` 卡住超 **10 分钟** → 自动派发清理任务
- `unreachable` 超 **5 分钟** → SSH 探测；确认没有安装痕迹就清除记录并复位为 `idle`
- Router 进程重启导致任务中断 → 启动时以最多 4 并发重跑

## 一条必须知道的边界

**Router 不会替你重启 Client 进程。**

首次开通脚本只启动一次 Client。安装的 systemd / OpenRC 服务：

- 不开机自启
- 不失败重启（`Restart=no`）
- 不 respawn

开通完成后，即使隧道断了，Router 也**不会**通过 provision SSH 去启动或重启 `cc-switch-server`。它只记录 `online` / `reconnecting` / `offline` / `disabled` 状态，发心跳、告警和 UI 提示。

**Client 进程的生命周期完全由 Client owner 负责。** 这是刻意的设计：Router 不持有对你机器的持续控制权。

## 准入与计费

和 Share Market **共用同一套机制**，只是作用域不同：

| 作用域 | 默认模式 |
| --- | --- |
| `client_host/free` | 黑名单 |
| `client_host/paid` | 白名单 + 需 USD 信用额度 |

付费主机：固定 USD 每日价格，**前 12 小时健康服务时长试用**，之后只按 Router 观测到的健康区间累计。

同一买家在同一供应商名下的**主机和 Share 共用一本 USD 账**，按买家额度合并出账。

Provider 租用自己的付费主机按免费处理，不会形成自债务。

期限：1–365 天固定期限或永久。**期限在 Client 开通成功后才开始计算**，到期复用安全清理流程。

## Web 终端

Router 提供一个基于 xterm.js 的 Web 终端，用一次性 ticket 授权，每用户最多 2 个会话，有空闲超时和硬超时。

**只有 Host Provider 本人能开。** 租用方不能，Router 管理员也不能。

这和 Client 自带的 Web 终端是两条不同的链路 —— 后者在 `cc-switch-server` 自己的界面里，由 Client 的登录态鉴权。

## 我是哪一边

- 我有闲置服务器，想租出去 → [提供主机](/client-market/host-provider)
- 我想租一台机器来跑 Client → [租用主机](/client-market/rent-host)

## 延伸阅读

- [架构](/intro/architecture)
- [Share Owner 快速上手](/provider/quickstart) — 拿到机器之后干什么
