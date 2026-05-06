# 提现

`client_payable` 攒够了就可以提到外部账户。市场支持两种方式：自动（Gate.io）和人工（工单）。

## 自动：Gate.io

如果市场部署方启用了 Gate.io 自动提现，这是最快的方式。

### 准备

- 一个 [Gate.io](https://www.gate.io/) 账号
- 在 Gate.io 创建一个 USDT 充值地址（推荐 TRC20，便宜）
- 完成 Gate.io 实名认证（KYC）

### 步骤

1. `/claim` 页面 → "提现"
2. 选"Gate.io 自动提现"
3. 填 USDT 收款地址、链类型
4. 输入金额，确认

market 会调 Gate.io API V4 的 `POST /api/v4/withdrawals/push`，请求和响应原文写到对象存储留底。

### 时效

正常情况下 5-30 分钟到账。

异常情况（API 返回未知状态、风控拦截）会自动转人工复核，进入工单流程。

### 手续费

提现手续费由市场设置（通常等于 Gate.io 实际收的费 + 一点点平台费）。会在确认提现前展示明细。

## 人工：工单

不用 Gate.io 的话，选"其他收款方式"。

### 步骤

1. `/claim` 页面 → "提现" → "其他方式"
2. 填收款信息（USDT 其他平台地址、银行卡、PayPal 等，按市场支持的方式列）
3. 提交

后台会：

1. 自动锁定 `client_payable` 到 `payout_reserved`
2. 自动开一个 `payout_manual` 工单
3. admin 收到工单 → 手动打款
4. admin 上传打款凭证 → 结算 → `payout_reserved` → `settlement_paid`

### 时效

按 admin 处理速度，一般 1-3 个工作日。大额可能更慢（需要二次审核）。

## 提现失败 / 取消

不论自动还是人工，提现失败时锁定的资金会自动退回 `client_payable`：

```text
payout_reserved → client_payable
```

你可以重新发起。

## 最低提现额

由市场设置（通常 5-10 USDT 起）。低于这个数攒着，攒够再提。

## 风控

异常账户、可疑提现可能被冻结进入人工复核。冻结期间余额仍在你账户里，只是不能动。被冻结会通过工单或邮件通知。

## 延伸阅读

- [领取收益](/provider/claim) — 提现前先看余额对不对
- [工单](/market/support) — 人工提现怎么沟通
