# 常见问题

## 通用

### 我是买家，需要装什么吗？

不需要。你只需要一个 Router 账号和一个 API Token，然后把 CLI 的 base URL 指向 Share URL。见 [租 Share 快速开始](/share-market/quickstart)。

### 四个区域有什么区别？

`jptokenswitch.cc`（日本）、`sgptokenswitch.cc`（新加坡）、`hktokenswitch.cc`（香港）、`ustokenswitch.cc`（美国）是四套**完全独立的部署**，各自独立的域名。

用户、Share、赊账账户、发票**都不跨区域**。在日本注册的账号在新加坡不存在。选离你和你想租的 Share 都近的那个。

### 平台抽成多少？

零。平台不经手资金。买家线下付给供应商，供应商确认到账。系统只负责记账和开票。

### 汇率是多少？

默认 1 USD : 7 CNY（`CC_SWITCH_ROUTER_MARKET_USD_CNY_RATE`，可由运维方调整），开票时冻结进发票。**CNY 只用于展示，不参与记账** —— 所有账目都是 USD。

## 买家

### 我的 API Token 能用于所有 Share 吗？

能。一个 Router 用户 API Token（scope `share:invoke`）走遍你有权访问的所有 Share。不需要为每个 Share 单独申请凭据。

### Token 怎么传？

三种都接受，用你 CLI 支持的那种：

```text
Authorization: Bearer <token>
x-api-key: <token>
x-goog-api-key: <token>
```

### 报 `401 missing-router-api-token` 怎么办？

请求里没带上面三个头中的任何一个。检查 CLI 的环境变量名是否写对。

### 报 `401 invalid-router-api-token` 怎么办？

Token 存在但无效：可能已被吊销、或者你用了另一个区域签发的 Token、或者 scope 不含 `share:invoke`。去 `/account/api-keys` 重新签一个。

### 报 403 / 被拒绝访问怎么办？

Token 有效但你没被授权访问这个 Share。可能是：租期已到、被 Owner 移出授权、赊账逾期被限制、或者供应商永久关闭了对你的授信关系。去 `/account/rentals` 看订阅状态。

### 报 413 怎么办？

请求体超过 Router 的上限档位（普通 API 默认 10 MB，视频 32 MB，图片 48 MB）。413 **不消耗 Share 并发**。如果是自部署，调 `CC_SWITCH_ROUTER_PROXY_*_BODY_LIMIT_MB`。

### 报 400 而不是 413？

multipart 形式的 `/v1/images/edits` 另受 Client 内容层限制：单张 20 MiB、合计 32 MiB、最多 16 张，超限返回 400。调 Router 的 image 档位对这条路径无效。

### 到期了但我一次都没用过，能退吗？

不能。服务期限从**确认租用成功**起算，到期即失效，不因未使用而顺延或退款。

### 服务中断了，租期会延长吗？

不会。授权延迟和计费暂停**都不延长**固定租期。这是设计如此，租之前请确认供应商的在线率。

### 前 12 小时免费是怎么算的？

按**健康服务时长**算 —— 只有 Router 观测到服务健康的时间才计入。累计满 12 小时后开始计费。

### 计费暂停的时间会被计费吗？

不会。只有 Router 观测到健康的时间段才产生费用；状态未知或不可用的时间不计费。

### 我租了好几个 Share，账单会分开吗？

按**买家 × 供应商**聚合。同一个供应商的多个 Share（以及 Client Market 的主机租用）共用一本赊账账户，一次开票。不同供应商各自独立。

### 怎么付款？

线下。发票里冻结了供应商在开票那一刻的收款方式和联系方式。付完在系统里声明，等供应商确认到账，仍在期限内的服务会恢复。

### 逾期了会怎样？

会限制你在市场上继续获得授信。只有供应商确认到账、或管理员作废发票才能解除。

## Share Owner

### Router 会帮我重启 Client 吗？

**不会。**这是最重要的一条边界。

`install-client.sh` 安装的 systemd unit 是 `Restart=no` 且**不 enable**；OpenRC 不配置 respawn 也不加默认运行级别；没有可用 service manager 时只跑一个 `nohup`。

首次开通之后 Router 只记录 `online` / `reconnecting` / `offline` / `disabled`，发心跳、告警和界面提示。**Client 进程的生命周期归 Client 所有者。**

想要自动重启，自己改：

```bash
sudo sed -i 's/^Restart=no$/Restart=always/' /etc/systemd/system/cc-switch-server.service
sudo systemctl daemon-reload
sudo systemctl enable --now cc-switch-server
```

### 为什么我的 Share 挂不上市场？

最常见的原因是它是**公开免费**的（`freeAccess = true`）。免费与挂售严格互斥，候选列表会直接过滤掉免费 Share。

还有一种情况：你在控制面把 Share 改成免费但**还没生效**（pending edit），这也会挡住创建或重开挂售。

### 我能同时开免费和挂售吗？

不能。业务事务和数据库触发器双向强制互斥。

### 一个 Share 最多能挂几个位？

20 个拼车位。每个位独立配置价格、限额、周期、并发和期限。

### token 上限留空是什么意思？

不限量。此时重置周期会被归一化成「累计不重置」，UI 不再显示周期选择器 —— 因为无限量的周期没有意义。

### 重置周期和服务期限是一回事吗？

**不是。**

- **重置周期**决定 token 计数什么时候归零（每天 / 每周 / 每月 …）
- **服务期限**决定这个位什么时候到期失效（1–365 天）

一个「每天重置、租 30 天」的位是完全合理的配置。

### 付费定期位到期后会怎样？

立即终结计费合同，并走安全吊销流程收回授权。

⚠️ **吊销失败时这个位不会提前回到可售状态** —— 系统宁可少卖也不会把还没真正收回的位再卖一次。

### 我改了价格，已经租出去的位会变吗？

不会。价格在成交时冻结进 Subscription。改价只影响之后的新租用。

### 市场发来的授权我能改吗？

不能。`manager=routerShareMarket` 的 grant 是 Router 独占写入的，前端只读，Server 与 Router 后端都会拒绝 Owner 伪造、修改或删除。

想终止某个买家的服务，走市场侧的吊销流程，不要直接改 `userGrants`。

### 我能永久关闭对某个买家的授信吗？

能。这是一个强动作：**立即锁定并终止服务，即使还有未结发票**；结清或作废之后**也不恢复**；两方之间未来的付费租用一律禁止。

### 我自己租自己的付费主机会被计费吗？

不会。视为免费，不产生自债。

### 用量统计里为什么没有金额？

Client 侧的用量只统计 **Token / 状态 / 延迟**，不计算成本或 USD。金额只在 Router 侧的市场账务里。

### 改了 provider 为什么 Claude Code 没生效？

Server **不提供 Claude Code 热切换**，需要重启 CLI 使变更生效。这是明确的产品边界。

### 为什么我的账号在报错时不会自动切到另一个账号？

设计如此：**显式绑定，不做故障转移**。Managed OAuth Provider Bundle 必须显式绑定账号；请求不按占用、quota、cooldown、并发或错误切换账号。首个 401 只在**原账号**强刷一次并重放。

## 自部署

### 编译 Router 前要做什么？

必须先构建前端 —— `build.rs` 会用 `include_bytes!` 把 `frontend/out/` 嵌进二进制：

```bash
cd frontend && npm ci && npm run build
cd .. && cargo build --release
```

### 我在环境变量里设了配置，为什么不生效？

`$HOME/.cc-switch-router/.env` **会覆盖进程已有的环境变量**，而且首次启动时若不存在会自动生成一份默认配置。检查那个文件里有没有同名项。

### 域名要怎么解析？

需要 `*.你的域名` 泛解析（Share 和 Client tunnel 都是子域）。SSH 端口（默认 2222）不能走 Cloudflare 代理，需要一条 DNS-only 记录（如 `origin.example.com`），并把 `CC_SWITCH_ROUTER_SSH_PUBLIC_ADDR` 指向它。见 [域名与 TLS](/self-host/dns-tls)。

### Router 的 systemd 也是 `Restart=no` 吗？

不是。**Router 应该配 `Restart=always`** —— 这条和 Client 相反。Client 的生命周期归它的所有者，Router 是你自己的基础设施。

### `503 DATABASE_UNAVAILABLE` 是什么？

turso 模式下数据库不可达。Embedded Replica **没有离线写能力**，此时写操作返回 503，`/v1/healthz` 也返回 503。

### 时间不同步会怎样？

签名 ingress 用非对称新鲜度窗口（最多 30 秒前、5 秒未来）。Router 主机时钟漂移会直接变成 401。Router 内建时钟监控（`CLOCK_MONITOR_ENABLED`）会持续观测并告警，但**不会修改系统时间** —— NTP 还是你自己的事。

### IP 情报服务有什么隐私影响？

`CC_SWITCH_ROUTER_IP_INTEL_ENDPOINTS` 会收到**每一台登记主机的 IP**。默认是三个内置 `http://` 源站。生产环境应当自建，或交给可信任全量主机清单的一方。

## 兼容与历史

### 我看到的文档提到 Token Market / 充值 / 抽成 / 提现？

那是旧系统，已完全下线。见 [已下线功能](/reference/retired)。

### `forSale` / `acl` / `sharedWithEmails` 还能用吗？

不能。这些 v1 字段**出现即拒绝**，camelCase 和 snake_case 两套写法都 fail-closed。

### 桌面版 `cc-switch` 还维护吗？

它现在只作为 **Provider 预设的审计基线**保留，不作为代码或界面同步源。客户端角色由 `cc-switch-server` 承担。

## 延伸阅读

- [术语表](/reference/glossary)
- [安全与边界](/reference/security)
- [已下线功能](/reference/retired)
