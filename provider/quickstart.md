# Share Owner 快速上手

你手上有 Claude / Codex / Gemini 的订阅或 API key，想把用不完的额度分给别人（或者收点钱）。

端到端大概 30 分钟。

## 前提

- 一台能长期开着的 Linux 服务器（VPS、NAS、家用机都行）
- 至少一份可用的上游凭据
- 一个邮箱

没有服务器？去 [Client Market 租一台](/client-market/rent-host)，Router 会帮你把 Client 装好，然后从第 3 步继续。

## 1. 装 Client

```bash
printf '%s\n' "你的Web密码" | bash install-client.sh \
  https://jptokenswitch.cc \
  you@example.com \
  --password-stdin
```

脚本会下载 `cc-switch-server` 二进制、初始化配置、注册到 Router 并启动一次。

详见 [安装 Client](/provider/install)。

## 2. 打开管理界面

```text
http://<你的服务器>:15721
```

用刚才设的密码登录。

也可以从 Router 的 **Clients** 页（`/clients`）点「控制台」，在弹窗里打开 —— 走的是 client tunnel，不需要暴露 15721 端口到公网。

## 3. 添加 Provider 和账号

**Provider** 是接入配置（接口地址、协议、模型映射），**账号** 是具体凭据（API key 或一次 OAuth 登录）。

在 Web 界面里选 app（Claude / Codex / Gemini）→ 选 Provider 预设 → 添加账号。

OAuth 类的登录全程在 Server 侧完成，不需要桌面应用。

详见 [添加 Provider](/provider/add-provider)。

> **你的凭据不会离开这台机器。** 本地用 XChaCha20-Poly1305 加密存储，Router 永远拿不到明文。

## 4. 创建 Share

Share 是对外的入口。绑定一个或多个账号，Router 给它分配子域名。

**默认是私有的**（`freeAccess = false`）。

详见 [创建 Share](/provider/share)。

## 5. 挂到 Share Market

回到 Router 的 **Share Market**（`/share-market`），点「添加 Share」，从你当前 active、尚未挂售的 Share 里选一个。

然后创建拼车位（最多 20 个），每个独立配置：

- Token 限额与重置周期
- 并发限额
- 每日 USD 价格（留空 = 免费位）
- 服务期限（1–365 天，或无固定期限）

详见 [挂到市场](/provider/listing)。

## 6. 配准入策略

付费位默认**白名单** —— 别人租之前要你批准并授予信用额度。

免费位默认**黑名单** —— 没被拉黑就能直接租。

在 `/account/market-access` 管理。详见 [准入策略](/provider/access)。

## 7. 填收款资料

收费之前**先把收款方式和联系方式填好**（`/account/payments`）。

出账时系统会把这份资料冻结进账单。

在 `/account/market-readiness` 看运营就绪度：收款资料齐不齐、有多少待准入、账务待办、四项准入策略状态。

## 8. 等人来租，然后收钱

- 前 12 小时健康时长不计费（买家试用）
- 之后按 Router 观测到的健康服务区间累计
- 有限额度用到 80% 双方预警
- 用满 / 主动清账 / 最后一个服务结束 → 合并出账
- 买家线下付款并声明 → **你确认到账** → 服务恢复

详见 [账务与收款](/provider/billing)。

## 关键取舍

| 你想要 | 怎么配 |
| --- | --- |
| 只给几个朋友用，不收钱 | 私有 Share + `userGrants` 逐个授权，不挂市场 |
| 公开免费给所有登录用户 | 开 `freeAccess`（**不能同时挂市场**） |
| 收钱 | 挂 Share Market，配拼车位价格 |

`freeAccess` 和市场挂牌**严格互斥**，系统在业务事务和数据库层双向阻止。

## 延伸阅读

- [安装 Client](/provider/install)
- [创建 Share](/provider/share)
- [挂到市场](/provider/listing)
- [看板与用量](/provider/dashboard)
