# Anthropic 兼容调用

市场实现了 Anthropic 的 `/v1/messages` 协议，可以直接用 Anthropic 官方 SDK。

## 基础用法

```bash
curl https://market.tokenswitch.cc/v1/messages \
  -H "x-api-key: sk-你的key" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-opus-4",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "用一句话介绍 Rust"}
    ]
  }'
```

字段跟 Anthropic 官方一致。`anthropic-version` 头建议带上。

## Python

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="https://market.tokenswitch.cc",
    api_key="sk-你的key",
)

resp = client.messages.create(
    model="claude-opus-4",
    max_tokens=1024,
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.content[0].text)
```

注意 `base_url` 不带 `/v1`，Anthropic SDK 自己会拼。

## Node.js

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  baseURL: "https://market.tokenswitch.cc",
  apiKey: process.env.MARKET_API_KEY,
});

const resp = await client.messages.create({
  model: "claude-opus-4",
  max_tokens: 1024,
  messages: [{ role: "user", content: "你好" }],
});
console.log(resp.content[0].text);
```

## 流式（暂不支持）

当前版本 Anthropic 接口的 `stream=true` **会被显式拒绝**，返回 4xx。

原因是流式下解析 Anthropic 的 usage 还没完全跑通，上线会有资金风险。计划在后续版本开放。

如果你需要流式，临时用 OpenAI 兼容接口（`/v1/chat/completions`），市场上很多 Anthropic 模型也通过 OpenAI 协议暴露。

## 接到 Claude Code

Claude Code 支持自定义 endpoint，配置：

```bash
export ANTHROPIC_BASE_URL=https://market.tokenswitch.cc
export ANTHROPIC_AUTH_TOKEN=sk-你的key
```

然后正常用 `claude` 命令。

也可以用 cc-switch 客户端管理这套配置，一键切换：[添加供应商](/provider/add-provider)（视角是 cc-switch 用户）。

## cache 怎么算

Anthropic 的 prompt caching（`cache_control` 标记）会照常生效，不会被市场剥掉。计费时 `cache_read_input_tokens` 和 `cache_creation_input_tokens` 按官方区分价格记账，比普通 input tokens 便宜很多。

## 延伸阅读

- [OpenAI 兼容调用](/market/using-openai)
- [模型与计费](/market/models-pricing)
