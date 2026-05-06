# 快速开始

5 分钟拿到第一个可用 API key，调通一次模型请求。

## 你需要

- 一个邮箱（用来收验证码）
- 一张能跨境的信用卡 / Apple Pay / Google Pay / 微信 / 加密货币（任选一）
- 5 分钟

## 步骤

### 1. 注册并登录

打开市场首页，点"登录"。

填邮箱，收一条 6 位验证码，输回去。市场不存密码，每次登录都用邮箱验证码。

登录成功后会跳到 `/dashboard`。

### 2. 充值

点"充值"，选一个金额（最低看市场设置，通常 1 USD 起）。市场会跳到 [Dodo Payments](https://dodopayments.com/) 的支付页。

支付方式：信用卡、借记卡、Apple Pay、Google Pay、微信支付、加密货币。

支付完成后 Dodo 会通知市场，余额几秒内到账。在 dashboard 上能看到。

### 3. 创建 API key

dashboard 里点"新建 API key"。

填一个名字（自己识别用），保存。

⚠️ key 只完整显示一次，关掉对话框就只剩前几位脱敏。**当场复制保存。**

### 4. 调一次试试

挑一个支持 OpenAI 兼容接口的模型，比如 `gpt-4o-mini`：

```bash
curl https://market.tokenswitch.cc/v1/chat/completions \
  -H "Authorization: Bearer sk-你的key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

返回正常 JSON 就成功了。dashboard 几秒后能看到这次请求的用量和扣费。

## 然后呢

- 把 key 接到你的项目里：[OpenAI 兼容调用](/market/using-openai) 或 [Anthropic 兼容调用](/market/using-anthropic)
- 想看每次请求扣了多少钱：[用量与账单](/market/usage-billing)
- 想看哪些模型多少钱：[模型与计费](/market/models-pricing)
