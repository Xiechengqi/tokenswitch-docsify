# Dashboard

router 自带一个公开 web 面板，访问 `https://tokenswitch.cc/`（或自部署的 router 域名）即可。**默认匿名可读**，不用登录。

## 上面有什么

页面分几块：

### share 列表

当前在线和最近活跃的 share 一览，每条显示：

- subdomain（子域名）
- owner email（脱敏，如 `m***@example.com`）
- for_sale 标记（free / sale）
- 当前是否在线
- 上游模型（如 `claude-opus-4`）
- API key（**默认脱敏**，如 `sk-***1234`）

### 在线 client / 世界地图

地图显示当前活跃的 client 大致地理位置（按 IP 推断的城市级别），按坐标聚合成点。每个点带 `count`（这个点有几个 client）。

底部 `clientCount` 是符合条件的真实活跃 client 总数，跟地图点数可能不等（聚合的关系）。

### 页脚状态

- `PAGE ONLINE` — router 正常
- 如果 router 用 Resend 免费 plan，会显示 `RESEND USAGE xx%`（验证码邮件用量），由 router 每 10 分钟主动查一次缓存

## 数据来源

- share 列表：来自 router 的 SQLite，由 client 通过 `/v1/shares/sync`、`/v1/shares/heartbeat` 等接口实时上报
- 地图点：来自 `/v1/public/map-points` 接口，按坐标聚合
- 在线状态：根据 share heartbeat 和 SSH 隧道实时连接状态判定

## 看 API key 明文

API key 默认脱敏。要看完整值需要登录，且：

- 你是这个 share 的 **owner**（创建时填的邮箱）
- 或者 owner 把你加进了 `shared_with_emails` 白名单

详细机制见 [share 共享与脱敏](/router/share-acl)。

## 公开数据怎么用

router 不限制公开 dashboard 的访问。可以：

- 路过看一眼这套网络有多少人在用
- 复制 `/v1/public/map-points` 的 JSON 做自己的可视化
- 监控某个 share 在不在线（虽然更推荐用 market 的 SLA）

## 自部署的 router 怎么找 dashboard

部署完 router 后，直接访问你的 `ROUTER_BASE_DOMAIN`（如 `https://your-router.example.com/`）就是。

[部署 router](/self-host/router-deploy) 里有完整流程。

## 延伸阅读

- [邮箱登录](/router/login) — 登录之后能多看什么
- [share 共享与脱敏](/router/share-acl) — owner / shared_with_emails 怎么配
