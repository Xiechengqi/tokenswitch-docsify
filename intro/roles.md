# 角色与入门路径

先确认你是哪一类人，再决定读哪一章。

## 我想用别人的 token

你有 Claude Code / Codex CLI / Gemini CLI，缺可用额度。

在 Share Market 上租一个拼车位，拿到一个 Share URL，填进 CLI 的环境变量就能用。付费位有 12 小时免费试用时长，试着不合适可以换。

→ [租 Share 快速上手](/share-market/quickstart)

## 我有 token，想分给别人用

你手上有 Claude / Codex / Gemini 的订阅或 API key，用不满。

在自己的机器上跑 `cc-switch-server`，把账号配好、建 Share、挂到 Share Market 上，设定拼车位价格和限额。**你的 API key 和 OAuth token 始终留在你自己的机器上，加密存储，不上传 Router。**

→ [Share Owner 快速上手](/provider/quickstart)

## 我有闲置服务器

你有一台闲置的 Linux 服务器，想租出去或者想租一台来跑 Client。

Client Market 撮合主机供给：Host Provider 提供机器，Router 自动装好 `cc-switch-server`，租用方拿到一台可直接用的 Client。

→ [Client Market 概览](/client-market/overview)

## 我要自己部署一整套

你不想用公共 Router，想在自己的域名下跑一套完整系统。

需要一台公网服务器（Router，要 wildcard DNS）加至少一台跑 Client 的机器。

→ [自部署概览](/self-host/overview)

## 我只是想搞清楚它是怎么工作的

→ [架构](/intro/architecture) → [关键概念](/intro/concepts) → [安全与边界](/reference/security)

## 角色和组件的对应关系

| 角色 | 谁来做 | 跑什么 |
| --- | --- | --- |
| 买家（租位/租机） | 用 Code Agent CLI 的人 | 只用 CLI，不装任何东西 |
| Share Owner | 有 token 的人 | `cc-switch-server` |
| Host Provider | 有服务器的人 | 由 Router 自动部署 `cc-switch-server` |
| Router / Market 运营方 | 站点运营者 | `cc-switch-router` |

买家不需要安装任何东西。Share Owner 和 Host Provider 跑的是同一个程序，区别只在于谁来装、谁来管。
