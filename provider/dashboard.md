# 看用量

用量数据分散在两处：Client 上的详细记录，Router 上的市场与账务视图。

## Client 侧

打开 Client 的 Web 界面（直连 `http://<你的服务器>:15721`，或从 Router 的 `/clients` 点「控制台」）。

Usage 页记录完整的请求生命周期：

- Provider Bundle / Surface
- Share 与调用用户
- 实际命中的上游模型
- 重试次数
- 延迟
- Token 观测状态

支持聚合、筛选、明细和游标分页。

**Client 只统计 Token、状态和延迟，不计算成本或金额。** 它不保存任何市场用户、价格或账本 —— 那些在 Router 那边。

### 查询边界

- 时间范围是左闭右开 `[fromMs, toMs)`
- 明细最多查 **32 天**
- 趋势接口单次最多返回 **2,000 个时间桶**

明细保留 32 天，之后只留聚合。

### 实时事件

`GET /web-api/events` 是认证 SSE 流，推送 Usage、Share 和隧道事件。Web 界面用它做实时刷新。

### Prometheus

`GET /metrics` 暴露 Prometheus 指标，可以接自己的监控。

## Router 侧

| 页面 | 看什么 |
| --- | --- |
| `/account/provider-usage` | 你作为供应商被消费的用量 |
| `/account/consumer-usage` | 你作为买家消费的用量 |
| `/account/share` | 你的 Share 列表与状态 |
| `/account/rentals` | 你租的东西 |
| `/account/billing` | 赊账账户、账单、争议 |
| `/account/market-readiness` | 运营就绪摘要 |
| `/clients` | 你的 Client 在线状态，可开控制台和终端 |
| `/share-market` → Mine | 你的挂牌和拼车位状态 |

Router 只保存脱敏的 observation：Share、模型、状态、延迟、token 数、地域。**不保存**下游用户的 API key、价格明细或结算数据。

## 该盯什么

**在线率。** 计费只按健康服务区间累计，掉线时间不收钱。掉线 = 直接的收入损失，而且租客会跑。

`/clients` 页的状态是 `online` / `reconnecting` / `offline` / `disabled`。记住 **Router 不会替你重启进程**，`offline` 要你自己处理。

**额度水位。** 有限额度用到 80% 会预警，别等用满被动出账 —— 出账会暂停服务，而买家的固定期限不会因此顺延，容易产生争议。

**Token 限额触顶。** 租客频繁撞限额说明定价档位没配好，考虑调整。

## 日志

Client 的进程日志可以从 Router 拉：

- **Client owner**：最多 100 行
- **匿名、非 owner 用户、非 owner 管理员**：最多 10 行

日志是脱敏的。

## 延伸阅读

- [挂到市场](/provider/listing)
- [账务与收款](/provider/billing)
- [安全与边界](/reference/security)
