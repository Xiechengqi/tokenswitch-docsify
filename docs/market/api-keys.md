# API key

API key 是你调用市场接口的凭证。所有 OpenAI / Anthropic 兼容请求都要带它。

## 跟其他 key 的区别

容易混淆，澄清一下：

| 名称 | 谁签发 | 给谁用 |
|---|---|---|
| **市场 API key** | 市场签发 | 你（API 用户）调市场接口 |
| 上游 API key | 模型厂商签发（OpenAI/Anthropic） | Provider 在客户端配置，不出本地 |
| router 邮箱登录 token | 路由签发 | 浏览器 dashboard 用，不能调 API |

本文只讲第一种。

## 创建

dashboard → "API keys" → "新建"。

填一个名字，比如 `local-dev` 或 `production`。

点保存，**完整 key 只显示一次**。关掉对话框只剩前几位（如 `sk-abcd...****`）脱敏，再也看不到完整值。

> 当场复制好。丢了只能删掉重建。

## 撤销

key 列表里点"删除"。立刻生效，正在用这把 key 的请求会立即失败。

撤销不可恢复。

## 用法

请求时放 `Authorization: Bearer` 头：

```bash
curl https://market.tokenswitch.cc/v1/chat/completions \
  -H "Authorization: Bearer sk-你的key" \
  ...
```

也可以放 `x-api-key` 头（Anthropic 风格）：

```bash
curl https://market.tokenswitch.cc/v1/messages \
  -H "x-api-key: sk-你的key" \
  ...
```

两种都识别。

## 多个 key 怎么管

建议按用途分：

- 本地开发一把
- 生产服务一把
- 给同事一把

任意一把出问题，单独撤销不影响其他。

所有 key 共用同一份余额，没有按 key 分配额度的机制（至少当前版本没有）。

## 请求门槛

每次请求市场会先检查你的余额是不是大于 `MARKET_MIN_REQUEST_BALANCE`（默认 1 USD）。低于这个数请求会被拒。

注意这只是入口门槛，**实际扣费按解析到的 usage 算**，可能远小于 1 USD。

## 延伸阅读

- [OpenAI 兼容调用](/market/using-openai)
- [Anthropic 兼容调用](/market/using-anthropic)
- [安全与边界](/reference/security) — key 是怎么存的，谁能看到
