# CC Switch 项目家族

CC Switch 是一组开源工具，让 **持有 AI 模型 token 的人** 和 **想用 token 的人** 直接连接，跳过中间商。

它由三个项目组成。

## 三件套

**[cc-switch](https://github.com/xiechengqi/cc-switch)** — 桌面客户端

跨平台桌面应用（Windows / macOS / Linux），统一管理 Claude Code、Codex、Gemini CLI、OpenCode、OpenClaw 五种 CLI 工具的供应商配置。Provider 用它把自己的 token 上架到市场。

**[cc-switch-router](https://github.com/xiechengqi/cc-switch-router)** — 路由

Rust 单二进制服务，部署在公网。同时承担三个角色：HTTP 反向代理（按子域名路由）、SSH 反向隧道服务（让客户端无公网 IP 也能接入）、SQLite 状态存储。它不存任何 API key 明文。

**cc-switch-market** — 市场

Rust + Next.js 一体化服务。负责 API 用户的充值、API key、模型计费、Provider 收益结算和提现、工单。市场也通过 router 隧道暴露给公网。

## 一次请求是怎么走的

```text
API 用户
   │  OpenAI/Anthropic 兼容请求 + market API key
   ▼
cc-switch-market（计费、扣款、注入用量）
   │  market proxy
   ▼
cc-switch-router（按子域名找到对应 share）
   │  SSH 反向隧道
   ▼
cc-switch（运行在 Provider 设备上）
   │  本地拿到上游 share token
   ▼
上游模型服务（Claude / Codex / Gemini ...）
```

钱的流向：API 用户付的钱 → market 抽成 + router 抽成 + Provider 净收入。所有变动写入 ledger，可审计。

## 我应该看哪一节

- **想买 token 用 API** → [市场快速开始](/market/quickstart)
- **手里有 token 想出售** → [Provider 快速开始](/provider/quickstart)
- **想看公开数据，或登录看自己的 share** → [路由 Dashboard](/router/dashboard)
- **想自己搭一套** → [自部署概览](/self-host/overview)

不熟悉这套系统的话，建议先看 [架构](/intro/architecture) 和 [关键概念](/intro/concepts)，五分钟。

## 许可证

三个项目都是开源的，许可证以各自仓库为准。
