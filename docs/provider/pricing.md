# share 定价

share 的定价模型很简单：要么免费分享，要么按市场标准价出售。**当前版本不支持 Provider 自己定单价。**

## free vs sale

| 维度 | free | sale |
|---|---|---|
| 价格 | 0 | 市场标准价（按模型） |
| 并发限制 | 强制 1 个并发 / 真实 IP | 无 |
| 收入 | 无 | 每次扣费净额进 `client_payable` |
| 适合 | 体验、demo、给朋友用 | 真要赚钱 |
| 在市场上的位置 | `/pricing` 页面里"免费"区 | "付费"区 |

## free 的限流细节

free share 共用一个全网限流池：

- 默认每个真实用户 IP 同时只能跑一个 free share 请求
- 用 `CF-Connecting-IP` 识别真实 IP（如果通过 Cloudflare 进来）
- 直连源站时回退到 socket peer IP，防伪头绕过

这个并发数由 router 部署方在 `CC_SWITCH_ROUTER_FREE_SHARE_IP_PARALLEL_LIMIT` 控制，默认 1。设为 0 关闭限流（不推荐）。

## sale 的价格怎么定

价格由 **市场**（不是 Provider）按模型设置。Provider 上架某个模型，自动按市场上该模型的价格收费。

也就是说：

- 你 share 上有 `claude-opus-4` → 别人调它，按市场上 `claude-opus-4` 的标价扣
- 标价是 input + output（+ cache）分别单价
- 抽成在标价里，对 API 用户透明

未来版本可能开放"Provider 自定义溢价 / 折扣"，目前还没有。

## 改 for_sale

在客户端供应商卡片上 → "编辑 share" → 切换 for_sale。

立即生效。已经在跑的请求按变更前的模式结算。

## 你的实际净收入

```text
净收入 = 计费金额 × (1 - market 抽成 - router 抽成)
```

默认是 1 - 10% - 5% = **85%**。

具体抽成由市场部署方在 `MARKET_PLATFORM_COMMISSION_BPS` / `MARKET_ROUTER_COMMISSION_BPS` 设置，可在 `/pricing` 页或 dashboard 顶部公示。

## 收益估算

举个例子：你挂一个 `claude-opus-4` share，市场标价是 input $15/M、output $75/M。

某用户跑了一次 1k input + 2k output：

```text
计费：1k × $15/M + 2k × $75/M = $0.015 + $0.15 = $0.165
抽成：$0.165 × 15% = $0.0248
你净收：$0.165 - $0.0248 = $0.1402
```

实际数字以市场页公示的最新标价和抽成为准。

## 延伸阅读

- [领取收益](/provider/claim) — 余额怎么看、怎么提
- [router 公开 dashboard](/router/dashboard) — share 在不在线、外面怎么看你
