# 添加 Provider 和账号

两个概念要分清：

- **Provider（供应商）** —— 一份接入配置：接口地址、协议类型、模型映射。不含可用凭据
- **账号（Account）** —— 绑在 Provider 上的具体凭据：一个 API key，或一次 OAuth 登录拿到的 token 组

一个 Provider 下可以挂多个账号。

## 三类 app

Client 按 app 组织 Provider：**Claude**、**Codex**、**Gemini**。同一个上游可能同时出现在多类里（比如 Gemini 既能服务 Gemini CLI，也能通过协议转换服务 Claude Code）。

## 支持的类型

| 类型 | Claude | Codex | Gemini | 状态 |
| --- | :---: | :---: | :---: | --- |
| Claude API / Auth / OAuth | ✅ | — | — | Native |
| Codex / OpenAI OAuth | ✅ | ✅ | — | Native |
| Gemini / Gemini CLI OAuth | ✅ | ✅ | ✅ | Native |
| OpenRouter / Ollama / Nvidia / DeepSeek API | ✅ | ✅ | ✅ | Native |
| Antigravity / Agy OAuth | ✅ | — | ✅ | Native（经预设映射） |
| Cursor OAuth / API Key | 🧪 | 🧪 | 🧪 | Experimental |
| AWS Bedrock | ⚠️ | ⚠️ | ⚠️ | Planned |
| GitHub Copilot | ⚠️ | ⚠️ | ⚠️ | Fallback |
| Kiro OAuth | ⚠️ | — | — | Planned |
| DeepSeek Account | ⚠️ | — | — | Planned |

`✅ Native` = 已覆盖且属于主线验收对象。`🧪` / `⚠️` = 已接线但缺完整真实验收，能不能跑通取决于上游，别拿来做付费位。

运行时可以查 `GET /api/provider-matrix` 拿到当前实例的实际矩阵。

## API Key 类

最简单的一类。在 Web 界面：

1. 选 app
2. 选 Provider 预设（或自定义接口地址）
3. 填 API key
4. 保存

预设覆盖 OpenRouter、Ollama、Nvidia、DeepSeek、SubRouter、OpenCode Go 等常见上游。

## OAuth 类

Claude、Codex、Gemini、Antigravity、Cursor、Copilot、Kiro、Grok、Kimi、Qoder 的 OAuth 登录、刷新、profile 和配额查询**全部在 Server 侧完成**，不需要桌面应用。

界面上点登录 → 跳转授权 → 回调 → 完成。

### 远程管理时的 OpenAI CLI OAuth

有一个例外要注意：OpenAI 的 CLI OAuth 只接受官方回调地址 `http://localhost:1455/auth/callback`，Server **不会**伪造或替换 redirect URI。

如果你是从别的机器远程管理这台 Client（HTTPS 访问），流程是：

1. 在 Codex OAuth 账号区选 CLI OAuth，打开授权链接
2. 浏览器授权后会跳到 `localhost:1455` —— **页面打不开是正常的**，远程部署下本来就没有那个服务
3. 从地址栏复制**完整的** `http://localhost:1455/auth/callback?code=...&state=...`，粘回管理界面提交

Server 会校验 scheme / host / port / path、state、当前管理员主体和会话期限后再换 token。只接受完整 callback URL，不接受裸 code。

Device OAuth 路径不受这个限制，可以直接用。

## 凭据在哪

**只在你这台机器上。**

- 用 XChaCha20-Poly1305 加密后存在 `accounts.json`
- 根密钥在 `accounts.key`（也可以用环境变量 `CC_SWITCH_SERVER_ACCOUNTS_ENCRYPTION_KEY` 提供）
- Router **拿不到**明文，租客也拿不到
- 管理面 API（`GET /api/accounts` 等）只返回「凭据是否存在」和运行状态，**不返回**access / refresh / id token、API key、额外请求头、profile 或上游原始响应

## 绑定是显式的，不做故障转移

这一条很重要，容易踩坑：

**托管 OAuth Provider Bundle 必须显式绑定账号。** 请求**不会**按占用情况、配额、冷却、并发或错误自动切换账号。

唯一的例外：第一次收到 `401` 时，会对**原账号**强制刷新一次并重放该请求。仅此而已。

所以如果你想要「一个账号挂了自动切另一个」，现在没有。想要冗余就建多个 Share，或者在上游侧解决。

## 验证

加完之后打一次真实请求确认链路通。可以先在本地：

```bash
curl -s http://127.0.0.1:15721/health
```

然后建 Share，通过 Share URL 打一次 `/v1/models`（见 [用 CLI 调用](/share-market/using-cli)）。

## 延伸阅读

- [创建 Share](/provider/share) — 下一步
- [看板与用量](/provider/dashboard)
- [安全与边界](/reference/security)
