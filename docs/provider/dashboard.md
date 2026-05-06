# 看用量

Provider 看用量有两个面板，各看一边。

## 客户端本地面板（cc-switch）

cc-switch 主界面会显示每个供应商的本地用量统计：

- 今日 / 本月 token 消耗
- 请求数
- 趋势图

数据来自 cc-switch 自己解析 CLI 工具产生的 session 文件。**这部分是你自己的设备级用量**，跟市场流量是两件事。

适合用来：

- 看自己家里 / 公司的 CLI 工具用得多不多
- 检查上游 token 余额是否要被你自己用完

## 市场用量面板（cc-switch-market）

市场 `/usage` 页面（用 share owner 邮箱登录后）会显示通过你 share 卖出去的流量：

- 每条 share 的请求数
- input / output token 累计
- 实际成交金额（已扣抽成的净额）
- 按时间、模型、subdomain 筛选

适合用来：

- 知道哪个 share 卖得好
- 知道某个时段流量高峰
- 对账：跟 `/claim` 的余额变化对得上

## router 公开 dashboard

router 的 `/v1/dashboard` 是公开页，匿名也能看：

- share 列表（subdomain、所有者邮箱可能脱敏、当前在线状态）
- 你自己的 share API key 默认脱敏，登录后才看明文（owner / `shared_with_emails` 才能看）
- 在线 client 数、世界地图

详情见 [路由 Dashboard](/router/dashboard)。

## 三者对账

理论上三者应该闭环：

```text
客户端本地用量
   ≥ 市场用量（部分本地用没卖出去）

市场用量 → 市场 /claim 余额（按抽成结算）
   = client_payable 累计变化
```

不一致最常见的原因：

- 你自己 CLI 用了一部分 token，但没经过市场
- 市场某些请求进入 `needs_review`，还没结算
- 时间窗对不齐（市场是事件驱动最终一致）

差异较大时再去查；小差异属于正常。

## 哪些数据私密

- 客户端本地用量：只在你设备上，谁也看不到
- 市场用量：只有你（owner 邮箱登录后）能看
- router dashboard 的 share API key：默认脱敏，配置过 `shared_with_emails` 的人登录可见

## 延伸阅读

- [领取收益](/provider/claim) — 用量 vs 余额对账
- [router Dashboard](/router/dashboard) — 公开页能看到什么
