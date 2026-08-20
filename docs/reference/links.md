# 相关链接

## 项目仓库

| 项目 | 角色 | 仓库 |
| --- | --- | --- |
| **cc-switch-server** | Client（本体） | [Xiechengqi/cc-switch-server](https://github.com/Xiechengqi/cc-switch-server) |
| **cc-switch-router** | Router + Client / Share Market | [Xiechengqi/cc-switch-router](https://github.com/Xiechengqi/cc-switch-router) |
| **本文档站** | 系统文档 | [Xiechengqi/tokenswitch-docsify](https://github.com/Xiechengqi/tokenswitch-docsify) |
| cc-switch | Provider 预设审计基线（**不是客户端**） | [Xiechengqi/cc-switch](https://github.com/Xiechengqi/cc-switch) |

> 系统只有**两个运行时组件**：`cc-switch-server` 与 `cc-switch-router`。桌面版 `cc-switch` 与独立的 `cc-switch-market` 已不再是运行时角色，见 [已下线功能](/reference/retired)。

## 下载

Client（`cc-switch-server`）：

```bash
# amd64
wget https://github.com/Xiechengqi/cc-switch-server/releases/download/latest/cc-switch-server-linux-amd64
# arm64
wget https://github.com/Xiechengqi/cc-switch-server/releases/download/latest/cc-switch-server-linux-arm64
```

一键安装脚本（Router 仓库提供，也是 Client Market 自动开通时用的同一份）：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/Xiechengqi/cc-switch-router/main/install-client.sh)
```

Router：

```bash
wget https://github.com/Xiechengqi/cc-switch-router/releases/download/latest/cc-switch-router-linux-amd64 \
  -O /usr/local/bin/cc-switch-router && chmod +x /usr/local/bin/cc-switch-router
```

## 公开站点

四个**独立部署**的区域，各自独立域名、独立账号、独立账务：

| 区域 | 地址 |
| --- | --- |
| 日本 | <https://jptokenswitch.cc> |
| 新加坡 | <https://sgptokenswitch.cc> |
| 香港 | <https://hktokenswitch.cc> |
| 美国 | <https://ustokenswitch.cc> |

## 仓库内的权威文档

系统文档（本站）讲「怎么用」，仓库文档讲「怎么实现」。有冲突时以仓库文档为准。

Router：

- `ARCHITECTURE.md` — 架构真值来源
- `README.md` — 完整环境变量表、API 端点分组、部署
- `PROTOCOL.md` — 协议线格式的真值来源
- `regions` — 区域到域名的映射

Client：

- `docs/README.md` — 全部文档的唯一索引（带权威性标记）
- `docs/architecture/overview.md` — 架构叙述真值来源
- `docs/guide/getting-started.md` — 安装、初始化、远程 OAuth、本地验证
- `docs/guide/configuration.md` — 全部配置项
- `docs/share/access-policy.md` — Share Contract v2 与退役字段清单
- `docs/provider/coverage.md` — Provider 类型与 preset 覆盖
- `AGENTS.md` — 开发约定

## 第三方依赖

部署时可能需要：

| 服务 | 用途 | 必需？ |
| --- | --- | --- |
| [Resend](https://resend.com/) | 邮箱验证码、Client 生命周期邮件 | **是** —— 不配就没人能登录 |
| [Cloudflare](https://www.cloudflare.com/) | Router 域名 CDN + TLS | 推荐（注意 SSH 端口需 DNS-only） |
| [Turso](https://turso.tech/) | libSQL 远程数据库 | 否（默认 local 模式） |
| [Telegram Bot API](https://core.telegram.org/bots/api) | 用户通知 / 运维告警 | 否 |

## 协议规范

反代兼容的上游协议：

- [Anthropic Messages API](https://docs.anthropic.com/en/api/messages) — `/v1/messages`
- [OpenAI API reference](https://platform.openai.com/docs/api-reference) — `/v1/chat/completions`、`/v1/responses`、`/v1/models`
- [Gemini API](https://ai.google.dev/api) — `/v1beta/*`

## 反馈

| 问题类型 | 去哪 |
| --- | --- |
| 文档错漏 | [tokenswitch-docsify issues](https://github.com/Xiechengqi/tokenswitch-docsify/issues) |
| Client bug（安装、供应商、Share、用量） | [cc-switch-server issues](https://github.com/Xiechengqi/cc-switch-server/issues) |
| Router bug（市场、账务、隧道、公开面） | [cc-switch-router issues](https://github.com/Xiechengqi/cc-switch-router/issues) |
| 交易纠纷 | Router 的争议流程，见 [计费与结算](/share-market/billing) |

> 提 issue 时不要粘贴 Token、API Key、SSH 凭据或未脱敏的日志原文。

## 延伸阅读

- [更新历史](/reference/changelog)
- [已下线功能](/reference/retired)
