# 术语表

按字母 / 拼音排。带 ⚠️ 的是最容易被旧文档误导的概念。

## A–Z

### Client

`cc-switch-server` 进程。Share Owner 自己的机器上跑的 Rust 单二进制（内嵌 Web 管理界面），持有真正的供应商凭据，通过 SSH 反向隧道接到 Router。

⚠️ 「Client」**不是**指调用方的 CLI。买家不安装任何东西。见 [角色与入门路径](/intro/roles)。

### Client Market

Router 内建的主机市场：Host Provider 出租一台 Linux 服务器，Router 自动装好 Client，租用方拿到一个已上线的 Client。见 [Client Market 概览](/client-market/overview)。

### Client tunnel

Client 的管理面隧道，把 Client 的 Web 管理界面暴露成一个 Router 子域。Share tunnel 走数据面，Client tunnel 走管理面，两者独立。

### freeAccess

Share Contract v2 的字段之一。`false`（默认）= 私有，只有 `userGrants` 里的人能用；`true` = 公开免费，任何登录用户都能用（黑名单模式）。

⚠️ 与市场挂售**严格互斥**，由业务事务和数据库触发器双向强制。

### Gateway

`/v1/gateways/register`、`/v1/gateway/*`、`/_gateway/proxy/*`。为未来跨 Router 容量消费者预留的中性适配层（Ed25519 + timestamp + nonce + body SHA-256 + scope）。

⚠️ 当前 tenant/seat/grant 契约尚未形成，**普通 Share 的 Gateway inventory / proxy 整体 fail-closed**。它不是第三个交易面，也不是重生的 Token Market。

### Host Provider

在 Client Market 里出租 Linux 主机的一方。

### Ingress context

Router 转发给 Client 时附带的签名上下文（用户邮箱、国家、Share 绑定等）。用**非对称新鲜度窗口**：最多接受 30 秒之前签发、5 秒之内的未来。校验失败返回**空 body 的 401**，诊断信息只走回 Router 的内部响应头。

### Installation

一个已注册到 Router 的 Client 实例记录。绑定 Owner 邮箱后才成为「你的」Client。

### Listing（挂售）

一个 Share 在 Share Market 上的售卖条目。一个 Listing 下最多 20 个拼车位。

### Provider

在 Client 里配置的上游供应商。注意有两个含义：

- **Upstream Provider** —— Claude / Codex / Gemini / OpenRouter 等模型供应商配置
- **Host Provider** —— Client Market 里出租主机的人

上下文不同，本文档尽量写全称。

### Router

`cc-switch-router` 进程。同时承担 **Router** 与 **Client / Share Market** 两个角色：`:80` HTTP + `:2222` SSH，libSQL 存储，内建交易、账务、公开面。

### Seat（拼车位）

Listing 下的一个可售单元。每个位独立配置 token 上限、重置周期、并发上限、每日 USD 价格、服务期限。见 [定价与服务期限](/provider/pricing)。

### Share

Client 上的一个对外服务单元，绑定一组供应商账号，有自己的访问策略和限额。租用方拿到的是一个 Share URL。

### Share Contract v2

当前的 Share 配置契约，只有四个字段：`freeAccess`、`userGrants`、`tokenLimit`、`parallelLimit`。v1 字段（`acl`、`forSale`、`officialPricePercent`、`sharedWithEmails`、`marketAccessMode`、`accessByApp`、`appSettings`）**出现即拒绝**。见 [创建 Share](/provider/share)。

### Share Market

Router 内建的 token 市场：Share Owner 挂售拼车位，买家租用。见 [挂售拼车位](/provider/listing)。

### Share tunnel

Share 的数据面隧道。Router 把推理请求经它转发到 Client 上对应的 Share 绑定。

### Subscription（订阅）

买家租下一个拼车位后形成的记录。同时冻结进 Router Subscription 和 Client 侧的授权策略。

### Token（两个含义）⚠️

- **模型 token** —— 计量单位，用于 `tokenLimit` 和用量统计
- **Router 用户 API Token** —— 你在 `/account/api-keys` 里签发的凭据，scope `share:invoke`，用来调用 Share URL

本文档中「拼车位的 token 上限」指前者，「API Token」指后者。

### usageRebase

Share 用量的基线偏移，由 **Client 存储**并通过 descriptor 下发。Router 没有编辑权。

### userGrants

Share Contract v2 里授权用户、来源和个人配额的**唯一真值**。`manager=routerShareMarket` 的授权由 Router 独占写入，前端只读，Server 与 Router 后端都拒绝 Owner 伪造 / 修改 / 删除。

## 中文条目

### 拼车位

见 [Seat](#seat拼车位)。

### 赊账账户

按「买家 × 供应商」聚合的 USD 额度账户，Share Market 与 Client Market **共用同一本**。见 [计费与结算](/share-market/billing)。

### 服务期限

拼车位的固定租期（1–365 天，或不设期限）。

⚠️ **从买家确认租用成功的那一刻起算**。授权延迟不延长，计费暂停不延长，到期不恢复服务。与重置周期是**两件独立的事**。

### 健康服务时长

计费的唯一依据 —— 只有 Router 观测到服务健康的时间段才计费。状态未知或不可用的时间不计费。前 **12 小时**健康时长免费。

### 重置周期

`tokenLimit` 的归零节奏：累计不重置 / 每天 / 自然周 / 每 7 天 / 自然月 / 每 30 天。留空上限（即不限量）时周期归一化为「累计」，UI 不再显示选择器。

### 区域

四个**独立域名**的独立部署：

| 区域 | 域名 |
| --- | --- |
| 日本 | `jptokenswitch.cc` |
| 新加坡 | `sgptokenswitch.cc` |
| 香港 | `hktokenswitch.cc` |
| 美国 | `ustokenswitch.cc` |

⚠️ 它们**不是** `tokenswitch.cc` 的子域名。用户、Share、账务都不跨区域。

### 主机状态机

Client Market 主机的生命周期：`idle → locked → allocated → draining → idle`，另有 `unreachable` / `abnormal` / `disabled` / `reserved`（报价锁定期）。见 [Client Market 概览](/client-market/overview)。

## 延伸阅读

- [关键概念](/intro/concepts) —— 同样的东西，带上下文的讲法
- [已下线功能](/reference/retired)
- [常见问题](/reference/faq)
