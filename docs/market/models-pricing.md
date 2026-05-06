# 模型与计费

## 模型从哪来

市场不直接对接 OpenAI / Anthropic / Google。所有模型都来自 Provider 上架的 share。Provider 在客户端把自己的 token 配置成"供应商"，启用 share，token 就出现在市场上。

market 的 `/pricing` 页会列出当前在线、可用的所有模型。同一个模型可能由多个 Provider 同时供货，市场会自动选一条可用线路。

## 计费规则

按 token 计费，分两种：

- **input tokens**：你发给模型的内容
- **output tokens**：模型返回的内容

不同模型的 input / output 单价不同。Anthropic 系还会区分 `cache_read_input_tokens` 和 `cache_creation_input_tokens`，市场会按官方价区分计费。

每个模型的当前价在 `/pricing` 页面查。

## 一笔请求扣多少

```text
费用 = input_tokens × input 单价
     + output_tokens × output 单价
     + （cache 部分按 cache 单价，如有）
```

请求一进来市场会做一次预授权（reserve），按估算金额从 `user_cash` 移到 `user_reserved`。请求完成后用真实 usage 结算：

- 实际花得少 → 退回差额
- 实际花得多 → 补扣差额（极端情况下可能透支，进入 `risk_loss`）

## 抽成

总价里包含两层抽成，对 API 用户透明（你付的钱不变），但影响 Provider 净收入：

| 项目 | 默认 | 谁拿 |
|---|---|---|
| Market 抽成 | 10% | 平台运营方 |
| Router 抽成 | 5% | 路由运营方 |
| Provider 净收入 | 85% | 出 token 的人 |

具体比例由部署方在 `MARKET_PLATFORM_COMMISSION_BPS` / `MARKET_ROUTER_COMMISSION_BPS` 设置。

## 流式调用

OpenAI `/v1/chat/completions` 的 `stream=true` 是支持的。市场会强制注入 `stream_options.include_usage=true`，边转发 SSE 边解析 usage。

特殊情况：

- 上游中断、客户端断开、上游不返回 usage：请求进入 `needs_review`，需要 admin 在 `/admin/charges` 手动结算或释放。资金会先停在 `user_reserved`，不会立即扣账。
- Anthropic `/v1/messages` 当前**不支持 streaming**，调了会被显式拒绝（避免在 usage 解析未完善前出现资金风险）。

## 价格快照

每笔成功的扣费都会绑定一份"价格快照"。这意味着：

- 即使后来调价，已经发生的请求也按当时价格记账
- 历史账单永远可复算

## 延伸阅读

- [用量与账单](/market/usage-billing) — 看每笔请求花了多少
- [OpenAI 兼容调用](/market/using-openai) / [Anthropic 兼容调用](/market/using-anthropic) — 实际怎么调
