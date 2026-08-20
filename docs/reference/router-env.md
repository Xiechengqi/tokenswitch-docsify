# Router 环境变量

> 这一页是**常用项速查**。完整清单以 `cc-switch-router` 仓库 `README.md` 的环境变量表为准 —— 那里是唯一真值来源，本页只做导读和取值建议。

配置文件位置：`$HOME/.cc-switch-router/.env`。

**重要**：Router 首次启动时若该文件不存在会自动生成一份带默认值的 `.env`；并且该文件中的值**会覆盖进程已有的环境变量**。想用外部环境变量注入配置，必须先确认 `.env` 里没有同名项。

前缀统一为 `CC_SWITCH_ROUTER_`。下表省略前缀。

## 必改项

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `TUNNEL_DOMAIN` | `0.0.0.0:8787` | 公共 tunnel 域名。必须改成你的真实域名，且该域名要有 `*.域名` 泛解析 |
| `SSH_PUBLIC_ADDR` | `{TUNNEL_DOMAIN}:{SSH_PORT}` | 下发给 Client 的 SSH 地址。**用 Cloudflare 代理时必须填源站 IP 或 DNS-only 子域 + 端口**，否则 Client 连不上 |
| `OWNER_EMAIL` | `router@{TUNNEL_DOMAIN}` | Client Market 默认选中的官方 Host Provider 邮箱 |
| `USE_LOCALHOST` | `false` | `false` 时 tunnel URL 用 `https://` |
| `RESEND_API_KEY` | 空 | 邮箱验证码、Client 生命周期邮件、聊天室邮件都靠它。**不配置就没人能登录** |
| `RESEND_FROM` | 空 | 发件人。可填裸邮箱或 `TokenSwitch <noreply@example.com>` |

## 监听

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `API_ADDR` | `0.0.0.0:80` | HTTP 监听 |
| `SSH_ADDR` | `0.0.0.0:2222` | SSH 反向隧道监听 |

## 数据库

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `DB_MODE` | `local` | `local`（本地 libSQL 文件）或 `turso`（Embedded Replica） |
| `DB_PATH` | `$HOME/.cc-switch-router/cc-switch-router.db` | local 模式的库文件，或 turso 模式的副本文件。**当前实例独占，不能多进程共享** |
| `TURSO_URL` | 空 | turso 模式必填。不得携带凭据、query 或 fragment |
| `TURSO_AUTH_TOKEN` | 空 | turso 模式必填。Settings API 只返回「是否已配置」，不回传明文 |
| `DB_SYNC_INTERVAL_SECS` | `60` | Embedded Replica 拉取周期，范围 1–3600 |
| `METRICS_DB_PATH` | `$HOME/.cc-switch-router/cc-switch-router-metrics.db` | 独立本地 metrics 库，**不会同步到 Turso** |
| `DATA_DIR` | `$HOME/.cc-switch-router` | Router 自有本地文件（图片结果、SSH known_hosts 等） |

> turso 模式没有离线写能力。数据库不可达时写操作返回 `503 DATABASE_UNAVAILABLE`，`/v1/healthz` 也返回 503。

## 请求体上限

三档，都会随每个转发请求声明给 Client（`x-cc-switch-ingress-body-limit`），Client 取 `min(本地上限, 声明值)`。新版 Client 本地默认已是范围上限，通常只调这里即可。

| 变量 | 默认 | 范围 | 覆盖端点 |
| --- | --- | --- | --- |
| `PROXY_REQUEST_BODY_LIMIT_MB` | `10` | 1–64 | `/v1/messages`、`/v1/responses` 等普通 API |
| `PROXY_MEDIA_REQUEST_BODY_LIMIT_MB` | `32` | 1–256 | `/v1/videos/generations` |
| `PROXY_IMAGE_REQUEST_BODY_LIMIT_MB` | `48` | 1–256 | `/v1/images/generations`、`/v1/images/edits` |

后两项不得小于普通 API 上限。

**这是内存缓冲上限，不是限速。**请求体整体驻留内存，峰值内存 ≈ 该值 × 并发请求数。超限在占用 Share 并发**之前**返回 `413`，不消耗任何配额。

multipart 形式的 `/v1/images/edits` 另受 Client 内容层限制（单张 20 MiB、合计 32 MiB、最多 16 张，超限返回 **400** 而非 413），把 image 档调到 32 MB 以上不会放宽这条路径。

## 请求生命周期超时

六个**互相独立**的阶段边界，任何一个都不是全局超时。

| 变量 | 默认 | 范围 | 阶段 |
| --- | --- | --- | --- |
| `PROXY_REQUEST_BODY_TIMEOUT_SECS` | `30` | 5–300 | 下游请求体读取 |
| `PROXY_RESPONSE_HEADER_TIMEOUT_SECS` | `120` | 5–600 | 上游响应头等待 |
| `PROXY_STREAM_FIRST_EVENT_TIMEOUT_SECS` | `120` | 5–600 | 流的首个协议业务事件 |
| `PROXY_STREAM_IDLE_TIMEOUT_SECS` | `900` | 30–3600 | 后续业务事件空闲 |
| `PROXY_DOWNSTREAM_STALL_TIMEOUT_SECS` | `120` | 5–600 | 下游停止消费缓冲区 |
| `PROXY_MAX_REQUEST_LIFETIME_SECS` | `7200` | 60–86400 | 绝对生存时长，**必须大于以上全部** |

> SSE 注释与 keepalive **不会**续期首事件/空闲超时 —— 只有真实协议业务事件会。

## SSH 隧道

| 变量 | 默认 | 范围 | 说明 |
| --- | --- | --- | --- |
| `SSH_INACTIVITY_TIMEOUT_SECS` | `300` | 30–3600 | 入站无流量超时，必须覆盖完整 keepalive 失败窗口 |
| `SSH_KEEPALIVE_INTERVAL_SECS` | `30` | 5–300 | keepalive 周期 |
| `SSH_KEEPALIVE_MAX` | `3` | 1–10 | 未响应 keepalive 上限 |
| `SSH_CHANNEL_OPEN_TIMEOUT_SECS` | `15` | 1–120 | 等待 Client 确认转发通道 |
| `SSH_BRIDGE_WRITE_STALL_TIMEOUT_SECS` | `300` | 30–3600 | 有待写数据但无进展；双向纯空闲不触发 |
| `SSH_BRIDGE_HALF_CLOSE_IDLE_TIMEOUT_SECS` | `300` | 30–3600 | 单向 EOF 后剩余方向无进展 |
| `SSH_MAX_FORWARD_CONNECTIONS` | `2048` | 1–65536 | 全局转发连接上限 |
| `SSH_MAX_FORWARD_CONNECTIONS_PER_TUNNEL` | `256` | 1–4096 | 单隧道上限，不得超过全局 |
| `LEASE_TTL_SECS` | `60` | — | Tunnel lease 有效期。已连接 Client 用签名续期 API 在**原连接**上续期，不按该周期重建 SSH |

## 登录与限流

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `AUTH_CODE_TTL_SECS` | `300` | 验证码有效期 |
| `AUTH_CODE_COOLDOWN_SECS` | `60` | 同邮箱/设备发码冷却。**必须小于 TTL**，Settings 会校验 |
| `AUTH_SESSION_TTL_SECS` | `1800` | Access token 有效期 |
| `AUTH_REFRESH_TTL_SECS` | `2592000` | Refresh token 有效期（30 天） |
| `AUTH_MAX_VERIFY_ATTEMPTS` | `5` | 单挑战最大输错次数 |
| `AUTH_EMAIL_HOURLY_LIMIT` | `30` | 单邮箱每小时发送上限 |
| `AUTH_IP_HOURLY_LIMIT` | `20` | 单 IP 每小时发送上限 |
| `AUTH_SOURCE_HOURLY_LIMIT` | `10` | 单认证来源每小时发送上限 |
| `FREE_SHARE_IP_PARALLEL_LIMIT` | `1` | 所有公开免费 Share 共用的单真实用户 IP 并发上限；`0` 关闭 |

另有通用滥用保护：10 分钟内 10 次失败 → 封禁 1 小时。

## 注册准入

Client 注册有三层速率桶（来源 / 全局 / 公钥）和三层新身份持久化额度（10 分钟 / 每小时 / 每日，各分来源与全局）。默认值见 Router README；除非遭遇实际滥用，一般不需要调。

`REGISTRATION_UNOWNED_INSTALLATION_WATERMARK`（默认 `50000`）是一道总闸：未绑定 Owner 的 installation 记录达到水位后暂停新身份准入。

## Client 在线判定

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `CLIENT_OFFLINE_ALERT_SECS` | `180` | 连续缺少可信签名心跳多久后确认离线。**安全下限 180 秒**，调不低 |
| `CLIENT_RECOVERY_STABLE_SECS` | `120` | 心跳稳定多久才结束离线 episode。**不会启动或重启进程** |
| `CLIENT_STALE_SECS` | `3600` | 超时未心跳则标记离线并清理其 share、lease 与内存路由 |
| `CLIENT_INSTALLATION_RETENTION_SECS` | `21600` | 离线 Client 的 installation 记录保留时长，**必须 ≥ `CLIENT_STALE_SECS`** |

## 通知

邮件（Resend）：`CLIENT_EMAIL_NOTIFICATIONS_ENABLED`、`CLIENT_ALERT_COOLDOWN_SECS`、`CLIENT_ALERT_BATCH_WINDOW_SECS`、风暴检测三项、以及 offline / registration 两条 lane 各自的收件人与全局每小时硬上限。

用户通知 Telegram Bot（`TELEGRAM_BOT_*`）与运维告警 Telegram（`ALERT_TELEGRAM_*`）**是两套独立配置**，不要混用同一个 Bot。

## 运维告警与 metrics

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `ALERTING_ENABLED` | `true` | 是否为新事故创建 IM 投递。事故本身始终持久化，可热更新 |
| `ALERT_REPEAT_INTERVAL_SECS` | `1800` | 未确认活跃事故的提醒间隔，60 秒至 7 天 |
| `ALERT_HISTORY_RETENTION_DAYS` | `90` | 已恢复事故与投递历史保留天数 |
| `METRICS_ENABLED` | `true` | 采集 Host / Router / Client / LLM metrics；**改后需重启** |
| `METRICS_RETENTION_DAYS` | `7` | 采样历史保留天数 |
| `METRICS_SAMPLE_INTERVAL_SECS` | `5` | 采样间隔；**改后需重启** |

## 时钟

签名 ingress 用非对称新鲜度窗口（最多 30 秒前、5 秒未来），所以 Router 主机时钟漂移会直接变成 401。

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `CLOCK_MONITOR_ENABLED` | `true` | 用 HTTPS Date 仲裁持续观测。**只观测和告警，不会修改系统时间** |
| `CLOCK_PROBE_INTERVAL_SECS` | `60` | 探测间隔，15–3600 |
| `CLOCK_PROBE_TIMEOUT_SECS` | `4` | 单源超时，1–15 |
| `CLOCK_SOURCES` | Cloudflare / Apple / AWS 三路 | 3–5 个不同 HTTPS host，至少两路相符才形成可信偏差样本 |

时间同步本身仍由你的系统 NTP 负责。

## 日志与保留

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `REQUEST_LOG_RETENTION_DAYS` | `30` | Share 请求记录与图片历史保留天数，1–365。**不影响累计 Token 用量** |
| `SERVER_LOG_INGEST_ENABLED` | `true` | 是否接收 Client 结构化审计日志；改后需重启 |
| `SERVER_LOG_DATA_DIR` | `$DATA_DIR/server-logs` | JSONL / gzip 段 / cursor / manifest 目录；改后需重启 |
| `SERVER_LOG_RETENTION_DAYS` | `7` | 1–90；改后需重启 |
| `SERVER_LOG_MAX_TOTAL_MIB` | `1024` | 总容量上限，至少保留逻辑最新的已接收事件文件；改后需重启 |
| `SERVER_LOG_PUBLIC_ENABLED` | `true` | 是否允许匿名查看**最近 5 分钟**的脱敏公开投影；可热更新 |
| `CLEANUP_INTERVAL_SECS` | `300` | 清理任务间隔 |
| `LEASE_RETENTION_SECS` | `86400` | 过期 lease 保留时长 |

Client 审计日志落在 Router 自有的 JSONL/gzip 文件里，**不进业务数据库**。

## 市场

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `MARKET_USD_CNY_RATE` | `7` | 1 USD 对应 CNY，范围 0.01–100，最多 6 位小数；可热更新。**汇率只用于展示，CNY 不参与记账**，开票时冻结进发票 |
| `IP_INTEL_ENDPOINTS` | 内置三个 `http://` 源站 | Client Market 主机 IP 情报服务 |

> ⚠️ **隐私警告**：`IP_INTEL_ENDPOINTS` 会收到**每一台登记主机的 IP**。应由 Router 运维方自建，或交给可信任全量主机清单的一方。缺少 scheme 时按 `https://` 处理；仍用 `http://` 时启动会打印告警。结果缓存 6 小时。

## 延伸阅读

- [部署 Router](/self-host/router-deploy)
- [域名与 TLS](/self-host/dns-tls)
- [Share 访问与脱敏](/router/share-access)
- [安全与边界](/reference/security)
