# 充值

市场用 [Dodo Payments](https://dodopayments.com/) 收款。Dodo 是一家专门做跨境收款的支付服务商。

## 支付方式

默认支持以下几种：

- 信用卡 / 借记卡（Visa、Mastercard、AmericanExpress）
- Apple Pay
- Google Pay
- 微信支付
- 加密货币与稳定币（USDT、USDC 等）

不同自部署的市场可能开启不同的方式，以充值页实际显示为准。

## 步骤

### 1. 选金额

dashboard 上点"充值"。最低金额由市场设置（通常 1 USD），没有上限。

币种是 USD。所有计费、余额都用 USD 记账。

### 2. 跳转 Dodo

填好金额后点"去支付"，浏览器会跳到 Dodo 的 checkout 页。Dodo 是 PCI DSS 合规的，市场不接触你的卡号。

### 3. 完成支付

按 Dodo 的页面走完。完成后浏览器会自动跳回市场。

### 4. 等到账

通常 3 秒内到账。Dodo 通过 webhook 通知市场，市场校验签名后写 ledger。

如果 1 分钟还没到账，刷新 dashboard。再没有就提工单（[工单](/market/support)）。

## 手续费

市场会向充值金额收一笔手续费，比例由市场设置（默认看 dashboard 上的提示）。手续费记在 `fee_revenue` 账户里，不会进 Provider 的余额。

## 退款

支付完成后想退款：

- 24 小时内、未消费过：可以提工单走 Dodo 原路退回
- 已经有消费记录：只能退剩余部分

退款会经过人工审核，通常 1-3 个工作日处理。

## 测试模式

如果你打开充值页发现底部写着 "Mock Checkout"，说明这个市场实例运行在开发模式（`DODO_MOCK_CHECKOUT_ENABLED=true`），不会真的扣钱。生产部署不应该出现这个标志。

## 延伸阅读

- [API key](/market/api-keys) — 充完钱怎么生成 key
- [用量与账单](/market/usage-billing) — 余额怎么看、扣费明细在哪
