# 安全与边界

这一页写明**凭据在哪里终止**、**什么是公开的**、**什么绝不公开**，以及各方各自负责什么。

## 凭据的三层终止

系统里有三类凭据，它们分别在不同的地方终止，互不透传。

```text
买家的 Router API Token
  └── 终止于 Router
        Router 校验 scope share:invoke，解析出用户主体
        Client 永远看不到这个 Token

Share 内部密钥
  └── 绑定在隧道路由上
        Client 只看到这个，用来确认「这是我的哪个 Share」

供应商凭据（Claude / Codex / Gemini API Key、OAuth token）
  └── 终止于 Client
        永不上行到 Router，永不出现在任何公开面
```

换句话说：**Router 不持有供应商凭据，Client 不持有买家凭据。**

## 边缘鉴权

买家用自己的 Router 用户 API Token 调用 Share URL。三种头都接受：

```text
Authorization: Bearer <token>
x-api-key: <token>
x-goog-api-key: <token>
```

失败返回：

| 情况 | 响应 |
| --- | --- |
| 一个头都没带 | `401 missing-router-api-token` |
| Token 无效 / 无 `share:invoke` scope | `401 invalid-router-api-token` |

## ⚠️ Router 用户 API Token 以明文存储

Router 把用户 API Token 存在明文列（`user_api_tokens.token_plaintext`）里，以支持在界面上重复显示。

**含义**：数据库泄露 == 活跃 Token 泄露。

对自部署运维方：数据库文件、备份和 Turso 凭据要按「等同于全量用户凭据」的级别保护。

## Ingress 上下文签名

Router 转发给 Client 时附带签名上下文。

- **非对称新鲜度窗口**：最多接受 30 秒之前签发、5 秒之内的未来
- 校验失败返回**空 body 的 401**，不泄露任何诊断信息；诊断只走回 Router 的内部响应头
- Router 必须剥掉调用方自带的 `x-user-email` / `x-user-country*`
- Client 的推理上下文**只接受**签名上下文重新注入的 `x-cc-switch-user-*`
- `is_internal_share_context_header()` 会剥掉来自公网来源的 `x-cc-switch-ingress-*`

因为窗口很窄，**Router 主机的时钟漂移会直接变成 401**。Router 内建时钟监控只观测和告警，不修改系统时间。

## 请求体上限协商

三档上限（普通 10 MB / 媒体 32 MB / 图片 48 MB，均可配置）。Router 在每个转发请求上写一个**未签名**的 `x-cc-switch-ingress-body-limit`（十进制字节），Client 取 `min(本地上限, 声明值)`。

**为什么未签名是安全的**：伪造这个头只能**降低**上限，不能提高。最坏结果是自己的请求被更早拒绝。

上限是**内存缓冲上限，不是限速**。请求体读取发生在 `try_acquire_share_permit` **之前**，所以超限返回 `413` 时**不消耗 Share 并发**。

## 公开数据边界

Router 的公开面**刻意**公开了不少东西。这不是疏忽，是产品设计 —— 一个不经手资金的市场必须让双方能自证。

公开可见：

- 完整邮箱地址
- 发票金额
- 收款方式与联系方式
- 付款凭证号 / 备注
- 凭证图片 URL
- 争议原因
- 安全的原始错误信息

**参与市场即意味着你的邮箱和收款信息会被交易对手看到。**如果这对你不可接受，不要挂售或租用。

## 唯一的保密例外

以下内容**绝不**出现在数据库、API、日志或界面中 —— 没有例外，没有「脱敏后可见」：

- API Key
- OAuth / Session token
- Cookie
- `Authorization` 头
- 密码
- secret
- 私钥
- SSH / lease 凭据

唯一的窄例外：`PaymentMethod.token` 在 `kind=crypto` 且值为 `USDT` / `USDC` 时允许出现 —— 因为那是币种标识，不是凭据。

**争议材料和公开事件数据里也不允许出现凭据。**提交争议时不要粘贴日志原文。

## Client 日志的可见性

| 查看者 | 上限 |
| --- | --- |
| 已验证的 Client Owner | 100 行 |
| 匿名访客 | 10 行 |
| 非 Owner 的登录用户 | 10 行 |
| 非 Owner 的管理员 | 10 行 |

匿名公开投影另外限制为**最近 5 分钟**（`SERVER_LOG_PUBLIC_ENABLED` 可关）。

Client 审计日志落在 Router 自有的 JSONL / gzip 文件里，不进业务数据库。

## 速率限制与滥用保护

登录：

| 维度 | 默认 |
| --- | --- |
| 验证码有效期 | 300 秒 |
| 发码冷却 | 60 秒（必须 < TTL） |
| 单挑战最大输错 | 5 次 |
| 单邮箱每小时 | 30 次 |
| 单 IP 每小时 | 20 次 |
| 单来源每小时 | 10 次 |

通用：10 分钟内 10 次失败 → 封禁 1 小时。

并发限流有 **6 个独立的 key**：`share_id`、`share_id:app`、`share_id:app:email`、用户 IP（免费档）、图片任务、市场邮箱。

Client 注册另有三层速率桶（来源 / 全局 / 公钥）、三层新身份持久化额度，以及一道未绑定 Owner installation 的总水位闸。

## 真实客户端 IP

`src/cf.rs` **硬编码** Cloudflare 的 IPv4 / IPv6 段，**不调用任何 Cloudflare API**。

- 对端在 CF 段内 → 信任 `CF-Connecting-IP` / `CF-IPCountry` / `CF-ASN`
- 否则 → 用 socket 对端 IP

这意味着换用其他 CDN 时需要改代码，不是改配置。

## 请求生命周期与兜底

六个独立阶段边界（请求体 / 响应头 / 首个业务事件 / 业务空闲 / 下游背压 / 绝对生存期）。后台 pump 会持续读取上游响应，所以**即使调用方停止消费，并发也会释放**。

10 秒周期的 watchdog 按唯一 lease 幂等回收漏网请求并告警，**从不重启 Router**。

管理员兜底：`POST /v1/admin/proxy/share-requests/force-release`，`requestId` 与 `shareId` 二选一（恰好一个）。

## 谁负责什么

| 角色 | 负责 |
| --- | --- |
| **买家** | 保管自己的 API Token；付款并声明；接受公开面会显示自己的邮箱 |
| **Share Owner** | 保管供应商凭据；Client 进程的存活；确认到账；接受公开面会显示自己的邮箱与收款方式 |
| **Host Provider** | 主机本身的安全；接受 Router 会用专用 provision key 登录并安装 Client |
| **Router 运维方** | 数据库与备份（内含明文 Token）；NTP；TLS；IP 情报端点的选择；告警渠道 |

⚠️ **Router 不负责保持 Client 存活。**见 [FAQ](/reference/faq)。

## 自部署运维方的检查清单

- [ ] `$HOME/.cc-switch-router/.env` 权限收紧（它会覆盖进程环境变量，且含 Turso token、Resend key、Telegram token）
- [ ] 数据库文件与备份按「全量用户凭据」级别保护
- [ ] NTP 已配置且被监控
- [ ] `CC_SWITCH_ROUTER_IP_INTEL_ENDPOINTS` 换成自建的 HTTPS 端点
- [ ] SSH 公开地址走 DNS-only 记录，不经 CDN 代理
- [ ] Router 的 systemd 配 `Restart=always`
- [ ] 备份策略覆盖 libSQL 业务库（metrics 库可丢）
- [ ] 用户通知 Bot 与运维告警 Bot 用两个不同的 Telegram Token

## Client 侧的数据文件

Client 数据目录下的这些文件可能包含 token、secret 或账号信息，**绝不能提交到 git**：

```text
accounts.json      accounts.key       providers.json
shares.json        tunnels.json       usage/
image-capabilities/
```

`cc-switch-server config print` 输出的是脱敏摘要，**不打印** password / API token hash、router private key / control secret、provider / account token。

## 延伸阅读

- [Share 访问与脱敏](/router/share-access)
- [Router 环境变量](/reference/router-env)
- [常见问题](/reference/faq)
