# 邮箱登录

router 用 Resend 发邮箱验证码登录。这套登录跟市场登录是 **同一套**（市场就是用 router 的邮箱验证码登录的），但 token 互相隔离：你登 router dashboard 看到的 share API key 信息，不会带回 market。

## 谁需要登录

- **share owner**：登录后能看到自己 share 的 API key 明文
- **被 owner 加进 `shared_with_emails` 的人**：同上
- **Provider 自己（cc-switch 客户端）**：第一次启用 share 时强制走一遍登录，把客户端跟 owner_email 绑定

普通访客不用登录，公开 dashboard 已经够看了。

## 怎么登

router 首页 → 右上角 "登录"。

1. 填邮箱
2. 收 6 位验证码（用 Resend 发）
3. 输回去
4. router 签发一个 access token（默认 30 分钟）+ refresh token（默认 30 天），存 HttpOnly cookie

之后浏览器自动带 cookie，刷新页面就是登录态。

## 验证码限流

router 防止滥用，做了几层限流（默认值，可配置）：

| 维度 | 默认上限 |
|---|---|
| 单邮箱每小时 | 30 次 |
| 单 IP 每小时 | 20 次 |
| 单 installation 每小时 | 10 次 |
| 同邮箱 / 同设备发码冷却 | 60 秒 |
| 单挑战最多输错 | 5 次 |

触发限流会返回 429，等冷却时间过了再来。

## session 管理

- access token 30 分钟过期
- refresh token 30 天过期
- 刷新接口：`POST /v1/auth/session/refresh`
- 查询当前会话：`GET /v1/auth/session/me`

cookie 是 HttpOnly + Secure（生产环境），JS 拿不到。

## 退出

dashboard 顶部 → 头像菜单 → "退出"。

router 会立即作废当前 session。

## 这个登录和市场登录的关系

它们 **是同一套身份**：

- market 用户 / Provider 都用同一个 router 邮箱认证
- Web session 互相 **不共用 cookie**（域名不同，token 不同）
- 但 owner 邮箱判定是一致的：你在 market 看到 `/claim` 余额，跟在 router dashboard 看到自己 share API key，用的是同一个 owner_email

## 这个登录不能调 API

router 的 web session 只是 Web 登录态，**不能用来调模型 API**。模型 API 走 market，需要 market 签发的 sk- 开头 API key。

具体边界见 [安全与边界](/reference/security)。

## 延伸阅读

- [Dashboard](/router/dashboard) — 登录后能看什么
- [share 共享与脱敏](/router/share-acl) — 怎么把 API key 给朋友看
