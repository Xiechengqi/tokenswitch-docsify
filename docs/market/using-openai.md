# OpenAI 兼容调用

市场实现了 OpenAI 的 `/v1/chat/completions` 协议，兼容大部分 OpenAI SDK 和 IDE 插件。

## 基础用法

```bash
curl https://market.tokenswitch.cc/v1/chat/completions \
  -H "Authorization: Bearer sk-你的key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "用一句话介绍 Rust"}
    ]
  }'
```

字段语义跟 OpenAI 官方一致。

## Python

用官方 `openai` SDK 即可，只改 `base_url` 和 `api_key`：

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://market.tokenswitch.cc/v1",
    api_key="sk-你的key",
)

resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
```

## Node.js

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://market.tokenswitch.cc/v1",
  apiKey: process.env.MARKET_API_KEY,
});

const resp = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "你好" }],
});
console.log(resp.choices[0].message.content);
```

## 流式

`stream=true` 是支持的，按 SSE 协议返回。市场会自动把 `stream_options.include_usage=true` 注入进去，所以最后一个 chunk 里能拿到 usage：

```python
stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[...],
    stream=True,
)
for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
    if chunk.usage:
        print("\n[usage]", chunk.usage)
```

## 接到 IDE 工具

很多 IDE 工具（Cursor、Continue、aider 等）都允许填自定义 OpenAI 兼容端点。填：

- Base URL: `https://market.tokenswitch.cc/v1`
- API Key: 市场创建的 key

模型名按 `/pricing` 页面列出的填。

## 常见错误

| 错误 | 含义 | 处理 |
|---|---|---|
| 401 Unauthorized | key 无效 / 已撤销 | 检查 key |
| 402 Payment Required | 余额不足或低于门槛 | 充值 |
| 404 Model Not Found | 该模型当前没有可用 share | 换一个模型，或晚点再试 |
| 429 Too Many Requests | 触发限流 | 退避重试 |
| 502 / 503 | 上游 / 隧道断开 | 自动重试，仍失败可换模型 |

## 延伸阅读

- [Anthropic 兼容调用](/market/using-anthropic) — 用 Claude 的话
- [模型与计费](/market/models-pricing) — 价格怎么算
- [用量与账单](/market/usage-billing) — 看每次请求扣了多少
