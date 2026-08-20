# 用 CLI 调用

租到位子后，你拿到的是一个 **Share URL**，形如 `https://<子域名>.jptokenswitch.cc`。

它就是一个标准协议端点。Claude Code、Codex CLI、Gemini CLI 直接指过去即可，不需要装插件、不需要改代码。

## 凭据

统一用你的 **Router API Token**（`/account/api-keys` 获取）。

三个请求头任选其一，Router 都接受：

```text
Authorization: Bearer <token>
x-api-key: <token>
x-goog-api-key: <token>
```

这正好覆盖三个 CLI 各自的习惯，所以直接设它们各自的环境变量就行。

## Claude Code

```bash
export ANTHROPIC_BASE_URL="https://<子域名>.jptokenswitch.cc"
export ANTHROPIC_AUTH_TOKEN="<你的 Router API Token>"
claude
```

走 `POST /v1/messages`。Anthropic Messages 原生协议，流式正常工作。

写进 shell 配置文件可以持久生效：

```bash
echo 'export ANTHROPIC_BASE_URL="https://<子域名>.jptokenswitch.cc"' >> ~/.bashrc
echo 'export ANTHROPIC_AUTH_TOKEN="<token>"' >> ~/.bashrc
```

## Codex CLI

```bash
export OPENAI_BASE_URL="https://<子域名>.jptokenswitch.cc/v1"
export OPENAI_API_KEY="<你的 Router API Token>"
codex
```

走 `POST /v1/responses` 与 `POST /v1/chat/completions`。两种协议在 Client 侧可以互转，所以上游是哪一种都能服务。

## Gemini CLI

```bash
export GOOGLE_GEMINI_BASE_URL="https://<子域名>.jptokenswitch.cc"
export GEMINI_API_KEY="<你的 Router API Token>"
gemini
```

走 `POST /v1beta/*`，Generative API 透传。

## 直接用 curl 验证

最省事的连通性检查：

```bash
curl -s https://<子域名>.jptokenswitch.cc/v1/models \
  -H "Authorization: Bearer <token>"
```

返回模型列表就说明链路通了：你的 Token 有效、准入通过、Owner 的机器在线、上游可达。

打一次真实推理：

```bash
curl -s https://<子域名>.jptokenswitch.cc/v1/messages \
  -H "Authorization: Bearer <token>" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 64,
    "messages": [{"role": "user", "content": "ping"}]
  }'
```

`model` 填 Owner 那边实际支持的模型 —— 用上面的 `/v1/models` 看有哪些。

## 可用入口

同一个 Share URL 下：

| 路径 | 用途 |
| --- | --- |
| `POST /v1/messages` | Anthropic Messages（Claude Code） |
| `POST /v1/chat/completions` | OpenAI Chat Completions |
| `POST /v1/responses` | OpenAI Responses（Codex CLI） |
| `GET /v1/responses` | Responses 的 WebSocket 通道 |
| `POST /v1beta/*` | Gemini Generative API |
| `GET /v1/models`、`GET /models` | 模型列表 |
| `POST /v1/images/generations`、`POST /v1/images/edits` | 图像生成与编辑 |

具体哪些能用，取决于 Owner 在这个 Share 上绑了什么账号。

## 接其他 OpenAI 兼容工具

任何允许自定义 OpenAI 端点的工具（aider、Continue 等）都可以：

- Base URL：`https://<子域名>.jptokenswitch.cc/v1`
- API Key：你的 Router API Token

## 请求体大小

Router 按三档限制请求体：普通 10 MB、视频 32 MB、图片 48 MB（Router 管理员可调）。超限返回 `413`，**且不消耗你的并发额度**。

Client 侧生效上限取 `min(Client 本地配置, Router 声明值)`，所以实际天花板可能比上面更低 —— Owner 可以主动收紧。

## 排障

| 现象 | 含义 | 怎么办 |
| --- | --- | --- |
| `401 missing-router-api-token` | 没带 Token | 检查环境变量是否真的导出到了 CLI 进程 |
| `401 invalid-router-api-token` | Token 无效或已重置 | 到 `/account/api-keys` 重新取 |
| `401` 空正文 | 上下文验签失败（时钟偏差等） | 校准本机时间；持续出现就联系 Owner |
| `403` | 准入不通过 | 到 `/account/rentals` 看租约是否还有效 |
| `413` | 请求体超限 | 减小上下文或附件 |
| `503 connection-lost-cached` | Owner 的机器离线 | 到市场页看在线状态，等或换位子 |
| 429 类错误 | 撞到并发或 Token 限额 | 看 `/account/consumer-usage` |

区分「你的问题」和「对面的问题」：`/v1/models` 通但推理不通，多半是 Owner 那边上游的事；`/v1/models` 就不通，先查自己的 Token 和租约。

## 延伸阅读

- [挑位子和租用](/share-market/rent)
- [计费与付款](/share-market/billing)
- [常见问题](/reference/faq)
