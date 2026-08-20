# 关键概念

按你会遇到的顺序排列。

## Installation

一个 `cc-switch-server` 实例在 Router 上的注册身份。Client 首次启动并填入 Router API base 后完成 `register → owner bind → client tunnel claim`，此后这台机器就有了稳定的 installation 身份和一个可选的 client 子域名。

## Client tunnel / Share tunnel

Client 用 SSH 反向端口转发主动连出到 Router，Router 不需要能直接访问 Client。

- **client tunnel** 承载管理面：Router 的 Clients 页可以经它打开 Client 自己的 Web 界面
- **share tunnel** 承载数据面：买家的推理请求经它下发到 Client

## Provider（供应商）

一份上游接入配置：接口地址、协议类型、模型映射。分 Claude / Codex / Gemini 三类 app。Provider 本身不含可用凭据。

注意这个词有两个含义，文档里会区分：

- **Upstream Provider**：上游模型服务（Anthropic、OpenAI、Google 等）
- **Host Provider**：在 Client Market 里贡献服务器的人

## Account（账号）

绑在 Provider 上的一份具体凭据：API key，或一次 OAuth 登录得到的 token 组。账号凭据在 Client 本地用 XChaCha20-Poly1305 加密存储，**永远不会上传到 Router**。

## Share

一个可以被外部调用的入口。Share 绑定一个或多个账号，Router 给它分配一个子域名，构成 **Share URL**。

Share 的访问契约只有三件事：

- `freeAccess` —— 是否公开。**默认 false，即私有**
- `userGrants` —— 按用户的授权条目
- `tokenLimit` / `parallelLimit` —— 限额

早期版本的 `acl`、`forSale`、`sharedWithEmails`、`marketAccessMode` 等字段已全部废弃，出现即拒绝（fail-closed）。

## Share descriptor

Router 侧对某个 Share 的描述记录：子域名、状态、限额、准入策略。Router 靠它在收到请求时定位目标 Client 和目标 Share，但它不包含任何上游凭据。

## Pending share edit

Router 需要修改 Client 上的 Share 状态时（例如租用成功后新增一条授权），不会直接写 Client，而是挂一条待处理编辑，由 Client 拉取、应用、回执。

由 `routerShareMarket` 管理的授权条目对 Share Owner 是只读的：普通 Share 编辑不能修改或删除它们。

## Listing（挂售）与拼车位（Seat）

**Listing** 是一个 Share 在 Share Market 上的挂牌。一个挂牌下最多 **20 个拼车位**。

每个拼车位是独立售卖单元，各自有：

- Token 限额（留空 = 不限额）与并发限额
- 每日价格（留空 = 免费位，不计费）
- 服务期限：1–365 天固定期限，或无固定期限

一个 Share 要么开 `freeAccess` 公开，要么挂售，**两者互斥**。

## Subscription（租用关系）

买家占用某个拼车位后形成的关系。固定期限从**买家确认租用成功时**起算，绝对到期时间同时冻结到 Router 的 Subscription 和 Client 的授权条目。

授权延迟或账单暂停**不顺延**到期时间。到期即停，不自动恢复。

## Token 限额与重置周期

只有设置了 Token 限额才谈得上重置周期，可选：累计不重置 / 每天 / 自然周 / 每 7 天 / 自然月 / 每 30 天。

重置周期和服务期限是两件独立的事：一个 30 天期限的位子可以配「每天重置」，也可以配「累计不重置」。

## 赊账账户（Credit account）

按 **买家 × 供应商** 聚合的一本 USD 账。Share Market 和 Client Market 的付费服务共用同一本账。

- 每段授权服务的**前 12 小时健康时长不计费**（试用）
- 只按 Router 观测到的健康服务区间累计；不可用或状态未知的时间不计费
- 有限额度用到 **80%** 时双方预警
- 用满、主动清账、或最后一个服务结束 → 合并出账，暂停相关服务

出账时会把供应商当时的收款方式与联系方式**冻结进该账单**，之后改资料不影响已出账单。

## 线下付款与确认

平台不经手资金。买家线下付款后在系统里**声明已付**，供应商**确认到账**后服务恢复。整个过程没有抽成、没有托管、没有提现。

## 汇率

默认 1 USD : 7 CNY，仅作展示换算。出账时冻结进账单。**记账货币始终是 USD**，CNY 不参与账务计算。

## Ingress context

Router 下发请求给 Client 时随附的一段签名上下文，标明这是哪个 Share、哪个用户、哪次请求。Client 侧验签，并采用**非对称新鲜度窗口**：接受最多 30 秒前签发、最多 5 秒未来签发的上下文。

验签失败返回空正文 `401`，诊断只走内部响应头，不外泄给调用方。Router 必须在转发前剥离这些内部头，防止外部伪造。

## Host 状态机（Client Market）

```text
idle ──► locked ──► allocated ──► draining ──► idle
```

外加 `unreachable` / `abnormal` / `disabled` / `reserved` 四个异常或特殊态，`reserved` 用于报价锁定期。

## 区域（Region）

当前有 `japan` / `singapore` / `hongkong` / `usa` 四个区域，各自独立部署一套 Router。**用户、Share、账务不跨区域共享。**

## 延伸阅读

- [架构](/intro/architecture)
- [角色与入门路径](/intro/roles)
- [名词表](/reference/glossary)
- [已下线功能](/reference/retired) — 如果你在旧文档里见过本页没提到的词
