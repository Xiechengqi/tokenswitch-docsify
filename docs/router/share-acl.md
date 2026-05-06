# share 共享与脱敏

router dashboard 上的 share API key 默认脱敏（如 `sk-***1234`）。但有时候 share owner 想给特定的人看到明文，比如借给朋友直接调（不经过市场）。这就是 ACL 机制要解决的事。

## 谁能看到 API key 明文

只有两种人，登录后能看到：

1. **share 的 owner**（创建 share 时填的 owner_email）
2. **owner 显式加进 `shared_with_emails` 白名单的人**

其他人，包括：

- 没登录的访客
- 登录了但邮箱不在白名单
- 甚至 router 部署方的 admin

都只能看到脱敏的形式。

## 配置白名单

目前 ACL 由 cc-switch 客户端推送，**不是在 router web 后台配的**。

在客户端：

1. 找到对应的供应商 → "编辑 share"
2. 找到 "共享给（shared_with_emails）" 字段
3. 填邮箱列表，每行一个（或逗号分隔）
4. 保存

客户端会把变更同步到 router（`POST /v1/shares/sync`），几秒内 router 上的 ACL 就更新。

## 白名单生效后

被加进白名单的人：

1. 用对应邮箱去 router 登录（[邮箱登录](/router/login)）
2. 在 dashboard 上找到该 share
3. 看到 API key 明文 + 复制按钮

被加进的人**不会自动收到通知**，需要 owner 自己告诉对方"我把 share 共享给你了，去 router dashboard 登录看"。

## 安全边界

ACL 是 share 粒度的，不是账户粒度的。

- owner 同一个 share 可以共享给多个邮箱
- 同一个邮箱可能被多个 share 加白名单（在多个 share 上都看到 API key）

被白名单的人 **只能看 / 复制 API key**，不能：

- 修改 share 配置
- 删除 share
- 看 share 的用量统计（这部分只有 owner 能看）
- 改 ACL 把别人加进来

## owner 是怎么判定的

router 用 share 表的 `owner_email` 字段。这个字段是 client 在创建 share 时上报的，由 cc-switch 客户端用当时登录 router 的邮箱填入。

如果 owner 想换邮箱（账号迁移），需要在客户端走"修改 owner_email"流程，会把同一个 installation 下的所有 share 一起改。

## ACL 不影响计费

market 计费完全不看 ACL。

举个例子：

- 你的 share 是 `sale` 模式（付费）
- 你把 API key 给了朋友 A
- A 直接拿这个 API key 调（绕过 market）

→ 这个调用 **直接打到上游**，市场不知道、不扣费、Provider 不收钱。这部分流量算在你（owner）的上游 token 配额里。

所以共享 API key 实际上是 **owner 自掏腰包请客**，对市场和其他 Provider 透明。

## 想完全私有怎么办

- for_sale 设 `sale` 但不要给任何人加白名单 → 只有市场（计费后）能用，外人调不了
- 想完全暂停 → 在客户端"停用 share"

## 延伸阅读

- [邮箱登录](/router/login) — 怎么登录 router
- [安全与边界](/reference/security) — 各种 key、session 的边界
