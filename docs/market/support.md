# 工单

市场不开 IM 群、不靠邮件，所有售后走工单系统。这样可追溯、可审计。

## 工单类型

| 类型 | 用在什么场景 |
|---|---|
| `feedback` | 反馈、bug、建议、新需求 |
| `billing_issue` | 充值、扣费、退款争议 |
| `account_issue` | 账号、API key、风控、被封 |
| `payout_manual` | Provider 选了非 Gate.io 收款方式时，系统自动开 |

API 用户大部分时候只用前三种。`payout_manual` 是 Provider 提现走的，系统创建，不需要你手动建。

## 提交

dashboard 顶部 → "工单" → "新建"。

填三件事：

1. **类型**：选上面表里对应的一种。
2. **标题**：简短描述，比如"充值 5 USD 没到账"。
3. **正文**：详细描述。如果是 `billing_issue`，把请求 ID 贴上来；如果是 `account_issue`，附上你的 key 名（不是 key 值！）。

可以传附件（截图、日志），文件存到对象存储。

## 状态流转

```text
open → in_progress → resolved
                  ↘ rejected
```

- `open` — 等 admin 看到
- `in_progress` — admin 已经开始处理，可能会问问题
- `resolved` — 处理完了，看 admin 的最终回复
- `rejected` — 不予处理，会写明原因

admin 回复后你的工单会标"有新消息"，去看一下。

## 处理时效

没有承诺 SLA。一般 1-3 个工作日有回复，加急情况可在工单里说明。

人工提现工单（Provider 走的）通常按金额排队，admin 集中处理。

## 跟 Provider 的关系

工单是 **API 用户 ↔ admin** 的，不是 **API 用户 ↔ Provider** 的。

如果某个 share 老报错，你可以提工单反馈，admin 会通知 Provider 或下架该 share。但你不能直接联系 Provider，整套系统的设计就是中间人匿名。

## 延伸阅读

- [用量与账单](/market/usage-billing) — 提 `billing_issue` 前先看清扣费明细
- [API key](/market/api-keys) — 怀疑 key 泄漏立刻撤销，再开 `account_issue`
