# 用量与账单

## 在哪看

dashboard 主要有两个页面：

- `/dashboard` — 余额、最近请求、本月消费汇总
- `/usage` — 全部请求列表，可按时间、模型、key 筛选

每条请求都能展开，看到完整的 input/output token 数、单价、时间戳。

## 几个数字的含义

dashboard 顶部通常有这几个数：

| 字段 | 含义 |
|---|---|
| 可用余额 | 当前能花的钱（`user_cash`） |
| 锁定中 | 正在请求中、还没结算的预授权（`user_reserved`） |
| 本月消费 | 这个月已经结算的扣费总和 |
| 充值总额 | 历史充值（不含手续费） |

如果数字看起来不对，刷新一下。市场是事件驱动的最终一致，偶尔有 1-2 秒延迟。

## 一笔请求的生命周期

```text
1. 请求进来
2. 市场预授权一笔钱（user_cash → user_reserved）
3. 请求成功 → 按真实 usage 结算
   user_reserved → client_payable（Provider 收入）
   user_reserved → fee_revenue（抽成）
4. 请求失败 / 上游断开 → 视情况
   - 全额释放（user_reserved → user_cash）
   - 进入 needs_review（admin 处理）
```

进入 `needs_review` 的请求 admin 会在后台处理，完成后你这边会看到对应的扣费或释放。

## 退款 / 争议

如果发现某笔请求扣得不对，比如：

- 模型实际没返回内容但被扣了
- usage 异常巨大
- 被扣了但响应里没有 usage 字段

去 [工单](/market/support) 提一个 `billing_issue` 类型工单，附上请求 ID（usage 列表里能复制）。admin 核对后会用 ledger transaction 调整余额。

不要直接联系 Provider，市场层面统一处理。

## 导出账单

`/usage` 页面通常有导出 CSV 功能（按部署方的 UI 实现而定）。包含：

- 时间
- 模型
- input / output tokens
- 单价
- 实付金额
- 请求 ID

按月导出，可以拿去做财务对账。

## 隐私

市场只存 usage 元数据（token 数、模型、时间），**不存请求和响应的原文**。即使是 admin 也看不到你 prompt 里写了什么。

例外：进入 `needs_review` 的请求会保留一个调试包供排查，处理完会按保留期清理。

## 延伸阅读

- [模型与计费](/market/models-pricing) — 单价怎么定
- [工单](/market/support) — 怎么提争议
- [安全与边界](/reference/security) — 数据存哪里
