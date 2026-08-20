# 创建 Share

Share 是你对外的入口：绑定账号、分配子域名、设定谁能用、能用多少。

## 建一个

在 Client 的 Web 界面：

1. 新建 Share
2. 绑定账号（一个或多个）
3. 设 Share 级的 Token 限额与并发限额
4. 保存

Router 会给它分配子域名，构成 **Share URL**：

```text
https://<子域名>.jptokenswitch.cc
```

## 访问契约只有三件事

Share Contract v2，Owner 可编辑的就这些：

| 字段 | 含义 |
| --- | --- |
| `freeAccess` | 是否公开免费。**默认 `false`，即私有** |
| `userGrants` | 授权用户、来源和个人配额的**唯一真值** |
| `tokenLimit` / `parallelLimit` | Share 级总限额 |

没有别的了。早期版本的 `acl`、`forSale`、`officialPricePercent`、`sharedWithEmails`、`marketAccessMode`、`accessByApp`、`appSettings` **全部退役**，camelCase 和 snake_case 两套写法都会被拒绝（fail-closed），不是静默忽略。

## 两种访问状态

| `freeAccess` | 谁能调 |
| --- | --- |
| `false`（默认） | Owner、你手工授权的用户（`role=shareto`）、Router Share Market 管理的有效授权 |
| `true` | 任何持有效 Router 用户 API Token 的**已登录**用户。匿名仍拒绝 |

即使开了 `freeAccess`，某个调用者如果另有活动授权条目，他的个人 Token 限额、并发、周期和到期策略**仍然优先生效**。

## 手工授权用户

私有 Share 通过「授权用户与配额 / 添加授权用户」维护 `userGrants`。每条授权可以带独立的个人配额。

**没有单独的「授权邮箱」输入框** —— 授权和配额是同一件事，在同一个地方配。

## 市场托管的授权是只读的

Router Share Market 创建的授权条目带 `manager=routerShareMarket`，由 Router 独占管理。

- 前端对它们只读
- Server 和 Router 后端都拒绝 Owner 伪造、修改或删除
- 普通 Share 编辑只能**原样保留**它们

想收回市场租客，用市场页的「强制回收」，不要试图直接删授权条目。

## freeAccess 和挂市场互斥

一个 Share 要么公开免费，要么挂到市场卖，**不能同时**。

系统在两个层面强制：业务事务检查 + 数据库触发器双向阻止。而且：

- Share Market 的「添加 Share」候选列表**排除**已开 `freeAccess` 的 Share
- 一个还没应用的「开启 Free」控制面编辑，也会阻止新建或重新打开挂牌

## 限额与周期

Share 级 `tokenLimit` / `parallelLimit` 是总闸。每个授权条目里还可以有个人配额。

用户周期的重基线（`usageRebase`）由 **Client 保存**，通过 descriptor 下发给 Router。**Router 没有编辑权。**

## 三种典型配法

| 场景 | 配法 |
| --- | --- |
| 只给几个朋友 | 私有（默认）+ 手工 `userGrants` 逐个授权，不挂市场 |
| 公开免费给所有登录用户 | 开 `freeAccess`，不挂市场 |
| 收钱 | 保持私有，[挂到 Share Market](/provider/listing)，授权由市场托管 |

## 停用与删除

Share 停用后市场挂牌也随之失效。删 Share 前先确认没有活跃租约 —— 有租约时应该走市场的回收流程，而不是直接删。

## 延伸阅读

- [挂到市场](/provider/listing)
- [准入策略](/provider/access)
- [看板与用量](/provider/dashboard)
- [Router 上的 Share 访问](/router/share-access)
