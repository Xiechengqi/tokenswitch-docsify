# 邮箱登录

Router 没有密码，只用邮箱验证码。邮件通过 Resend 发送。

## 登录流程

1. 站点右上角「登录」
2. 填邮箱
3. 收 6 位验证码
4. 输回去
5. Router 签发 access token + refresh token

## Token 有效期

| 项 | 默认值 | 环境变量 |
| --- | --- | --- |
| 验证码有效期 | 300 秒 | `CC_SWITCH_ROUTER_AUTH_CODE_TTL_SECS` |
| 发码冷却 | 60 秒 | `CC_SWITCH_ROUTER_AUTH_CODE_COOLDOWN_SECS` |
| Access token | 1800 秒（30 分钟） | `CC_SWITCH_ROUTER_AUTH_SESSION_TTL_SECS` |
| Refresh token | 2592000 秒（30 天） | `CC_SWITCH_ROUTER_AUTH_REFRESH_TTL_SECS` |

Access token 过期后用 refresh token 自动续，30 天内不用重新收验证码。

冷却必须小于验证码有效期，Settings 保存时会校验这条关系。

## 限流

| 维度 | 默认上限 | 环境变量 |
| --- | --- | --- |
| 单邮箱每小时发码 | 30 | `CC_SWITCH_ROUTER_AUTH_EMAIL_HOURLY_LIMIT` |
| 单 IP 每小时发码 | 20 | `CC_SWITCH_ROUTER_AUTH_IP_HOURLY_LIMIT` |
| 单来源每小时发码 | 10 | `CC_SWITCH_ROUTER_AUTH_SOURCE_HOURLY_LIMIT` |
| 单挑战最多输错 | 5 次 | `CC_SWITCH_ROUTER_AUTH_MAX_VERIFY_ATTEMPTS` |

另外还有一层通用的认证滥用防护：**10 分钟内 10 次失败 → 封禁 1 小时**。

触发限流返回 `429`，等冷却过去再来。

## 相关端点

| 端点 | 用途 |
| --- | --- |
| `POST /v1/auth/email/request-code` | 请求验证码 |
| `POST /v1/auth/email/verify-code` | 校验并换 session |
| `POST /v1/auth/session/refresh` | 续期 |
| `GET /v1/auth/session/me` | 当前身份 |
| `POST /v1/auth/session/logout` | 登出 |

## API Token 是另一回事

浏览器 Session 用于网页操作。**调用 Share 用的是 API Token**，在 `/account/api-keys` 获取，和 Session 是两套凭据。

一个 API Token 走遍全站所有你有权访问的 Share —— 不是每租一个 Share 发一个 key。

Token 在 Router 侧**以明文列存储**（为了支持在 UI 里重复展示）。这意味着数据库泄露等同于活跃 Token 泄露。所以：**别把 Token 放进公开仓库、日志或截图**，怀疑泄露就在同一页重置。

部分 API 支持带 scope 的 Token，例如市场准入接口的 `market:access:read` / `market:access:write`；Share 调用用的 scope 是 `share:invoke`。

## 各区域独立

四个区域站点各自独立部署，**账号不互通**。在日本区登录不等于在新加坡区有账号。

## 聊天室的额外限制

Client 公开聊天室的历史匿名可读，但**发送真人消息必须用 Router 登录 Session** —— 普通用户 API Token 不能发。

## 延伸阅读

- [Dashboard](/router/dashboard)
- [Share 访问与脱敏](/router/share-access)
- [Router 环境变量](/reference/router-env)
