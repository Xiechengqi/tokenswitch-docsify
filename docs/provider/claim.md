# 领取收益

每次 API 用户用了你的 share，市场会把净额（扣完抽成）记到你的 `client_payable` 账户。这部分钱叫"待领取"或"待提现"。

## 在哪看

打开市场 `/claim` 页面，用你 share 上注册的 **同一个邮箱** 登录。

页面上会显示：

| 字段 | 含义 |
|---|---|
| 待领取（client_payable） | 已经成交、可以提现的金额 |
| 锁定中（payout_reserved） | 已经发起提现、还没完成的部分 |
| 已提现（settlement_paid） | 历史提现累计 |
| 总收入 | 历史所有 share 的总成交额（含抽成前） |

也能看到每个 share 的明细：哪个 subdomain、卖了多少、分别在什么时间。

## 如何识别 owner

market 用 router 的邮箱验证码登录得到一个 session，session email 跟 share 的 `owner_email` / `installation_owner_email` 匹配的那些 share，就是你的。

只要：

- share 创建时填的 owner_email 跟你登录的邮箱一致
- 或者你是 share 的安装实例所有者（installation_owner_email）

就能在 `/claim` 看到对应的余额。

## 多设备 / 多 share

不同设备上跑的 cc-switch 用同一个邮箱注册时，所有 share 的余额会汇总到同一个 `client_payable` 余额。

举例：你家里有一台 Mac 跑 Claude share，公司有一台 Linux 跑 Codex share，两边都用 `mike@example.com` 注册。`/claim` 上看到的是两边收入的总和。

## 我同时也是 API 用户怎么办

完全可以。你在 dashboard 上看到的 `user_cash`（API 用户余额）和 `client_payable`（Provider 待领取）是 **两个独立账户**，邮箱相同但金额分开记。

互相不能直接划转。要把 `client_payable` 提到外部账户，走 [提现](/provider/payout)。

## 余额不动 / 不到账

- 看一下 share 是否在线（[router dashboard](/router/dashboard)）
- 确认登录的邮箱跟 share 创建时填的一致
- 检查最近请求是否进入了 `needs_review`（需要 admin 处理后才入账）
- 还有问题 → 提 [工单](/market/support)，类型选 `billing_issue`

## 延伸阅读

- [提现](/provider/payout) — 怎么把钱拿出来
- [看用量](/provider/dashboard) — 看每条 share 的用量明细
