# 已下线功能

如果你读过旧文档、旧 README 或旧的博客帖子，这一页告诉你哪些东西已经不存在了。

## 独立 Token Market（`cc-switch-market`）

**状态：完全下线。**

早期系统是四个组件：`cc-switch` 桌面客户端 + Router + Token Market + Share Market。Token Market 是一个独立服务，卖 API key、管理余额、按 token 计价结算。

现在：

- `/v1/markets*`、`/v1/market/*`、`/_market/proxy/*` 统一返回 **`410 Gone`**
- 不会创建旧 Market session、host 或 proxy
- Router migration 19 把旧表复制到临时只读 archive 并校验；migration 21 再次校验后**物理删除**全部旧 live/archive 表，只留一份不含身份信息的聚合 retirement receipt

**替代**：Router 内建的 [Share Market](/provider/listing)，卖固定拼车位而不是 token 计量。

## 抽成与提现

**状态：完全下线。**

旧模型：平台抽 10% + 5%，供应商通过 Gate.io 提现，系统维护一本 `ledger`（`user_cash` / `user_reserved` / `client_payable` / `payout_reserved` / `fee_revenue`）。

**替代**：按「买家 × 供应商」聚合的 [USD 赊账账户](/share-market/billing)。平台**不经手资金、不抽成**，买家线下付款并声明，供应商确认到账。

## 市场签发的 API Key

**状态：完全下线。**

旧模型：在 Token Market 充值，市场给你签一个 `sk-...` key，用它调用市场端点。

**替代**：Router 用户 API Token（`/account/api-keys`），一个 Token 走遍你有权访问的所有 Share，scope 是 `share:invoke`。

## Tauri 桌面客户端（`cc-switch`）

**状态：不再是客户端。**

`cc-switch` 是一个 Tauri 2 桌面应用，跨平台安装包，用 SQLite 存供应商配置，能一键切换 Claude Code 的 provider。

现在它**只作为 Provider 预设的审计基线**保留 —— 用来核对 Claude / Codex / Gemini 支持哪些供应商类型和协议行为，**不作为代码或界面的同步源**。

Router 侧的兼容代码已经移除。

**替代**：[`cc-switch-server`](/provider/install) —— 无桌面依赖的 Rust 单二进制，内嵌 Web 管理界面。

顺带说明产品边界的变化：Server **不提供 Claude Code 热切换**，改 provider 后需要重启 CLI 生效。换来的是 Server-native OAuth、隧道、Web 管理面和多租户 Share。

## 独立的 `cc-switch-share-market` 仓库

**状态：被内建实现取代。**

Share Market 现在**内建于 Router**，不注册为外部 `router_markets`，不依赖 bearer session。

## Share Contract v1 字段

**状态：全部退役，出现即拒绝。**

以下字段不再属于 active wire、REST、invoke 或 UI 契约：

```text
acl
forSale / for_sale
officialPricePercent / official_price_percent
forSaleOfficialPricePercentByApp / for_sale_official_price_percent_by_app
sharedWithEmails / shared_with_emails
marketAccessMode / market_access_mode
accessByApp / access_by_app
appSettings / app_settings
```

camelCase 和 snake_case 两套写法都 **fail-closed**。它们不会被静默忽略，也不会作为兼容投影输出。

**替代**：[Share Contract v2](/provider/share) —— 只有 `freeAccess` + `userGrants` + `tokenLimit` / `parallelLimit`。

### 一次性迁移

旧数据只在**持久化迁移边界**被识别一次，不是运行时兼容层：

- Client 加载旧 `shares.json` 时：canonical `userGrants` 缺失才从旧 ACL 收集 ShareTo 邮箱；`freeAccess` 缺失时旧 `forSale=Free` 迁为公开免费，**旧 `Yes` 一律收窄为私有**；删除全部退休字段后原子写回并重新解析验证，验证失败则启动失败
- Router migration 20：创建 `shares.free_access` 与 `share_access_policy_version`，安装 Free 与 Share Market entitlement 的双向互斥约束

## 官方价格比例

**状态：退役。**

旧模型：Share 可以按「官方价格的百分之多少」定价，还能按 app 分别设。

**替代**：报价只属于 [listing / seat](/provider/pricing)，每日 USD 价格由 Owner 自定，没有任何官方参考价。

## `shared_with_emails` 输入框

**状态：退役。**

旧 UI 有一个独立的「授权邮箱」输入框，和配额是分开的两件事。

**替代**：`userGrants` 是授权用户、来源和个人配额的唯一真值，通过「授权用户与配额 / 添加授权用户」统一维护。

## Gateway 不是它的替代

有一个容易混淆的地方：`/v1/gateways/register`、`/v1/gateway/*` 和 `/_gateway/proxy/*` **存在**，但它不是重生的 Token Market。

它是为未来跨 Router 容量消费者预留的**中性适配层**，用 Ed25519 签名 + timestamp + nonce + body SHA-256 + scope。当前 tenant/seat/grant 契约尚未形成，**普通 Share 的 Gateway inventory / proxy 整体 fail-closed**。

它不是第三个交易面，也不能被描述为已完成的 Token Market。

## 对照表

| 旧的 | 新的 |
| --- | --- |
| `cc-switch` 桌面应用 | `cc-switch-server`（Rust 单二进制 + Web UI） |
| `cc-switch-market` 独立服务 | Router 内建 Share Market |
| 市场签发的 `sk-...` key | Router 用户 API Token |
| 充值 + 余额 + 抽成 + 提现 | USD 赊账 + 线下付款 + 供应商确认 |
| 按 token 计量计费 | 按拼车位每日价格 + 健康服务时长 |
| `for_sale` / `shared_with_emails` / `acl` | `freeAccess` / `userGrants` |
| 官方价格百分比 | Owner 自定每日 USD 价格 |
| `ledger` 五个余额字段 | 按买家 × 供应商聚合的赊账账户 |

## 延伸阅读

- [架构](/intro/architecture) — 现在长什么样
- [关键概念](/intro/concepts)
- [更新历史](/reference/changelog)
