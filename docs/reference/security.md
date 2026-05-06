# 安全与边界

## 数据存哪

| 数据 | 存哪 | 谁能读 |
|---|---|---|
| 上游 API key | Provider 客户端 SQLite（`~/.cc-switch/cc-switch.db`） | 只有客户端所在设备 |
| share 的 API key 明文 | 同上（不出客户端） | owner / shared_with_emails 登录 router 后可见 |
| router 的 share 元数据 | router SQLite（`~/.config/cc-switch-router/cc-switch-router.db`） | router 部署方 |
| market 的资金 ledger | market SQLite 或 Turso | market 部署方 |
| API 用户请求原文 | **不保存** | 谁也读不到 |
| API 用户 usage 元数据 | market SQLite | market 部署方 |
| `needs_review` 请求调试包 | market 对象存储（本地或 R2） | admin，按保留期清理 |
| Web session token | HttpOnly cookie | 浏览器（JS 拿不到） |
| Resend / Gate.io / Dodo 凭证 | router/market 的 `.env` | 部署方运维 |

## 几种 key 互不能替代

| key 类型 | 用途 | 不能用来 |
|---|---|---|
| 市场签发的 sk-... | 调 OpenAI/Anthropic 兼容 API | 调 router 内部接口、登录任何 web |
| router web session cookie | router web 操作 | 调任何模型 API |
| market web session cookie | market web 操作（含 admin） | 调任何模型 API |
| Provider 的上游 API key | 在客户端本地用来调上游 | 上传到 router/market（永远不上传） |
| 设备私钥 (installation) | 跟 router 通信签名 | 提取出去也没用（绑设备） |

## 身份边界

- **router 邮箱登录** = router 上的身份
- **market 邮箱登录** = market 上的身份
- 两边邮箱一致 → 通过 owner_email 关联，但 cookie 互不共用

## market 不接受外部身份头

market 不信任任何 `x-clerk-*`、`x-user-*`、`x-admin` 头。任何身份都通过 router 邮箱验证码登录后，market 自己签发 HttpOnly session cookie 来识别。

这是为了避免反向代理或 CDN 误注入身份头导致权限提升。

## API key 边界

- API 用户的 sk-... 只在 market 有效
- Provider 的上游 API key 永远不上传
- share 的 API key（同上游 key）默认在 dashboard 脱敏，仅 owner / 白名单可见明文

## 资金边界

- admin 不能直接修改余额缓存
- 所有人工调整必须通过 ledger transaction
- 有审计痕迹（关联工单或 admin 备注）
- 多账户间的钱只能通过预定义路径流动（见 [关键概念](/intro/concepts) 的账务路径）

## 限流 / 风控

| 维度 | 默认上限 |
|---|---|
| 验证码 / 单邮箱小时上限 | 30 |
| 验证码 / 单 IP 小时上限 | 20 |
| 验证码 / 单 installation 小时上限 | 10 |
| free share 真实用户 IP 并发 | 1 |
| 验证码错误重试 | 5 次 |

可由部署方调整。

## 真实 IP 识别

经 Cloudflare 进入时，从 `CF-Connecting-IP` 读真实 IP（用于限流和地图）。直连源站时回退到 socket peer IP，防止伪造头绕过。

## 隐私

- 邮箱仅用作身份和验证码发送
- 不会被卖、不会发广告
- 充值用 Dodo，市场不接触卡号
- 提现用 Gate.io，市场不存交易所凭证
- 请求 prompt / 响应原文不保存

## 升级 / 备份

- cc-switch：每次启动前自动备份 SQLite 到 `~/.cc-switch/backups/`，保留 10 份
- router：建议把 `~/.config/cc-switch-router/` 整体加进定时备份
- market：用 Turso 时本地有定时 replica 备份；用本地 SQLite 时备份 `~/.config/cc-switch-market/`

## 灾难恢复

- 上游 API key 丢了 → Provider 在客户端重新填即可
- router SQLite 丢了 → share、lease 全部丢，所有 client 需要重新启用 share，不影响资金
- market SQLite 丢了 → 资金 ledger 丢，需要从对象存储里的 webhook 原文 / 提现凭证人工对账

定期备份 SQLite 是重要的。

## 延伸阅读

- [关键概念](/intro/concepts) — 账户类型和账务路径
- [router 环境变量](/reference/router-env) / [market 环境变量](/reference/market-env)
