# 相关链接

## 项目仓库

| 项目 | 仓库 | 用途 |
|---|---|---|
| cc-switch | [Xiechengqi/cc-switch](https://github.com/Xiechengqi/cc-switch) | 桌面客户端 |
| cc-switch-router | [xiechengqi/cc-switch-router](https://github.com/xiechengqi/cc-switch-router) | 路由 |
| cc-switch-market | （待开源） | 市场 |
| 本文档 | [Xiechengqi/tokenswitch-docsify](https://github.com/Xiechengqi/tokenswitch-docsify) | 文档站源码 |

## 下载

- cc-switch 客户端：[GitHub Releases](https://github.com/Xiechengqi/cc-switch/releases)
- cc-switch 客户端 AUR：`paru -S cc-switch-bin`
- cc-switch-router：[最新二进制](https://github.com/xiechengqi/cc-switch-router/releases/download/latest/cc-switch-router-linux-amd64)

## 第三方依赖文档

部署 / 集成时可能需要：

- [Cloudflare](https://www.cloudflare.com/) — 推荐用作 router 域名 CDN + TLS
- [Resend](https://resend.com/) — 邮箱验证码发送
- [Dodo Payments](https://dodopayments.com/) — 跨境收款
- [Gate.io API V4](https://www.gate.io/docs/developers/apiv4/) — Provider 自动提现
- [Turso](https://turso.tech/) — libSQL 远程数据库（market 可选）
- [Tauri 2](https://tauri.app/) — cc-switch 客户端的桌面框架

## 协议规范

API 兼容协议参考：

- [OpenAI API reference](https://platform.openai.com/docs/api-reference) — `/v1/chat/completions` 等
- [Anthropic Messages API](https://docs.anthropic.com/en/api/messages) — `/v1/messages`
- [Model Context Protocol](https://modelcontextprotocol.io/) — MCP 规范

## 反馈渠道

- 文档错漏：直接点页面底部"编辑此页"提 PR
- 客户端 bug：去 [Xiechengqi/cc-switch issues](https://github.com/Xiechengqi/cc-switch/issues)
- router / market bug：去对应仓库 issues
- 使用问题：在市场里提 [工单](/market/support)

## 延伸阅读

- [更新历史](/reference/changelog)
