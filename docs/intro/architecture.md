# 架构

CC Switch 由三个项目组成：客户端（cc-switch）、路由（cc-switch-router）、市场（cc-switch-market）。三者各司其职，组合成一张去中介的 token 共享网络。

## 三件套各干什么

**cc-switch（客户端）**

跑在 Provider 自己的电脑或服务器上。它是一个桌面应用，统一管理 Claude Code、Codex、Gemini CLI、OpenCode、OpenClaw 五种 CLI 工具的供应商配置。Provider 在客户端把自己手上的 token 配置成"供应商"，再启用 share，token 就上架到了网络。

**cc-switch-router（路由）**

跑在公网服务器上。一个 Rust 单二进制，同时承担三件事：

1. HTTP 反向代理：按子域名（subdomain）找到对应的 share，转发请求。
2. SSH 反向隧道服务：让没有公网 IP 的 Provider 客户端也能挂到网络上。
3. SQLite 状态存储：记录 share、lease、邮箱登录会话等。

router 不存任何上游 API key 明文。

**cc-switch-market（市场）**

跑在公网服务器上，本身也通过 router 的隧道挂到一个子域名下。它面向 API 用户，提供充值、API key、模型计费、Provider 收益结算、提现、工单。

## 一次请求是怎么走的

```text
API 用户
   │  OpenAI/Anthropic 兼容请求 + market API key
   ▼
cc-switch-market（计费、扣款、解析 usage）
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

两点要注意：

- market 不知道 Provider 的上游 API key，它只跟 router 谈。
- router 也不知道上游 API key，它只把请求按子域名转给客户端，再由客户端自己去调上游。

## 钱是怎么走的

```text
API 用户付费
   │
   ▼
market 抽成（默认 10%）
router 抽成（默认 5%）
Provider 净收入（剩下的）
```

所有变动都写入 ledger（账本），三方都可以审计。Provider 攒够了，可以选 Gate.io 自动提现，或者人工工单提现。

## 部署形态

最小部署：一台公网服务器跑 router，一台公网服务器跑 market（或者同机），无数台 Provider 个人电脑跑 cc-switch 客户端。

router 和 market 也可以部署多套，用不同的域名互不干扰。比如一个面向中国用户，一个面向日本用户。

## 延伸阅读

- [关键概念](/intro/concepts) — installation、share、lease 这些词是什么意思
- [角色与入门路径](/intro/roles) — 你是哪一类用户，从哪开始
