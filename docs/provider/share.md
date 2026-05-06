# 启用 share

share 就是把你的供应商"挂出去"，让市场可以通过 router 调用它。

## 前提

- 已经在 cc-switch 里 [添加供应商](/provider/add-provider)
- 客户端能访问公网（能连上 router 即可，不需要公网 IP）
- 一个邮箱（router 用它识别你是 share 的 owner）

## 第一次启用

在供应商卡片上找"启用 share"按钮。

会弹一个引导：

### 1. 邮箱登录 router

填邮箱，收 6 位验证码，输回去。

router 会为你这台设备注册一个 installation（设备身份），私钥留在本地，不会泄露。

> 邮箱只是身份标识，不会被卖、不会发广告。

### 2. claim 一个 subdomain

每个 share 占一个 subdomain 前缀，比如 `mike-claude`、`alice-codex`。

- 只允许小写字母、数字、连字符
- 全网唯一，先到先得
- 一旦 claim，就和你的 owner_email 绑定，别人抢不走

如果你想要的名字被占了，换一个。

### 3. 选 for_sale

两种模式：

| 模式 | 含义 | 适合 |
|---|---|---|
| `free` | 免费分享 | 体验、demo、给朋友用 |
| `sale` | 付费出售 | 想从市场赚钱 |

free share 会强制限流（默认每个真实用户 IP 同时只能 1 个并发请求），防止被滥用。

sale share 由市场计费，无并发限制。

之后随时可以改。

### 4. 确认

点确认，客户端会：

1. 跟 router 申请一个 lease（短期凭证）
2. 用 lease 里的一次性 SSH 用户名密码登录 router
3. 申请 `tcpip_forward`，把你本地的某个端口映射到 router 的子域名
4. lease 快过期时自动续

share 上线后客户端右上角会显示绿点，router dashboard 上也能看到。

## 后续启用

之后每次启动 cc-switch，share 会自动恢复。不用再走一遍登录、claim 流程。

掉线了客户端会自动重连。重连失败会在 UI 上提示，看一眼网络。

## 暂停 / 关闭

- 临时暂停：在供应商卡片上点"停用 share"，share 会立即下线
- 彻底删除：点"删除 share"，subdomain 会释放（但通常 owner_email 仍能在一段时间内重新 claim）

## 多个 share

一个 cc-switch 实例可以同时跑多个 share，每个 share 用不同的 subdomain，对应不同的供应商。

适合：你买了 Claude 包月、Codex 包月、Gemini 包月，全部挂出去赚钱。

每个 share 独立计费、独立看用量。

## 客户端关掉后

cc-switch 关掉，share 也会下线。

如果你想 7×24 跑 share，建议把电脑配置成不休眠 + 自启动，或者干脆用一台小服务器（比如 NAS、迷你主机）专门跑 cc-switch。

router 端如果发现 share 长时间（默认 1 小时）没心跳，会清理掉 share、lease 和 client 记录。重新打开 cc-switch 会自动重新挂上。

## 延伸阅读

- [share 定价](/provider/pricing) — free / sale 之外的细节
- [领取收益](/provider/claim) — 钱在哪
- [router/share 共享与脱敏](/router/share-acl) — 给朋友看 API key 明文
