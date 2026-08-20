# 更新历史

各组件的详细版本记录见仓库 Releases：

- **cc-switch-server**（Client）：[Releases](https://github.com/Xiechengqi/cc-switch-server/releases)
- **cc-switch-router**（Router + 两个市场）：[Releases](https://github.com/Xiechengqi/cc-switch-router/releases)

本页只记录**会改变使用方式**的系统级变更。

## 重大变更

### 交易模型：从 token 计量改为拼车位

- 独立 Token Market（`cc-switch-market`）完全下线，`/v1/markets*`、`/v1/market/*`、`/_market/proxy/*` 统一返回 **`410 Gone`**
- 旧表经 migration 19 归档校验、migration 21 二次校验后**物理删除**，只留一份不含身份信息的聚合 retirement receipt
- 替代：Router 内建 Share Market，按**拼车位**售卖，每位一个每日 USD 价格

**影响**：市场签发的 `sk-...` key 全部失效。改用 Router 用户 API Token（`/account/api-keys`，scope `share:invoke`）。

### 账务：从抽成 + 提现改为线下结算

- 移除 10% + 5% 平台抽成、Gate.io 自动提现和 `ledger` 五个余额字段
- 替代：按「买家 × 供应商」聚合的 **USD 赊账账户**，Share Market 与 Client Market 共用一本
- 平台不经手资金：买家线下付款并声明，供应商确认到账
- 前 12 小时**健康服务时长**免费；只对 Router 观测到健康的时间段计费
- 默认汇率 1 USD : 7 CNY，开票时冻结进发票；**CNY 不参与记账**

**影响**：不再有充值和余额。租用前请确认自己接受线下结算。

### 客户端：从 Tauri 桌面应用改为 Rust 单二进制

- `cc-switch` 桌面应用不再是客户端角色，仅保留为 **Provider 预设的审计基线**
- 替代：`cc-switch-server` —— 无桌面依赖，单二进制 + 内嵌 Web 管理界面，默认 `:15721`
- 新增：Server-native OAuth、Share / Client 隧道、多租户 Share、远程用量同步

**影响**：不再提供 Claude Code 热切换，改 provider 后需重启 CLI。

### Share Contract v2

只保留四个字段：`freeAccess`、`userGrants`、`tokenLimit` / `parallelLimit`。

以下 v1 字段**出现即拒绝**（camelCase 与 snake_case 双向 fail-closed）：

```text
acl · forSale · officialPricePercent · forSaleOfficialPricePercentByApp
sharedWithEmails · marketAccessMode · accessByApp · appSettings
```

旧数据只在**持久化迁移边界**识别一次（Client 加载旧 `shares.json`、Router migration 20），不是运行时兼容层。迁移时旧 `forSale=Free` → 公开免费，旧 `forSale=Yes` **一律收窄为私有**。

**影响**：任何直接构造 Share 配置的脚本都需要改写。

### `freeAccess` 与市场挂售严格互斥

由业务事务 + 数据库触发器**双向**强制。候选列表过滤掉免费 Share；一个尚未生效的「改为免费」控制面编辑也会挡住创建或重开挂售。

### 服务期限的语义收紧

- 从**买家确认租用成功**的那一刻起算，冻结进 Router Subscription 与 Client 授权策略
- 授权延迟**不延长**，计费暂停**不延长**，到期**不恢复**服务
- 付费定期位到期立即终结计费合同并走安全吊销流程
- **吊销失败时该位不会提前回到可售状态**

### 请求体上限改为三档协商

普通 10 MB / 媒体 32 MB / 图片 48 MB（旧值：2 MiB / 32 MiB / 48 MiB）。Router 在每个请求上声明上限，Client 取 `min(本地, 声明)`。新版 Client 本地默认已是范围上限。

超限在占用 Share 并发**之前**返回 413。

### Router 不再管理 Client 进程生命周期

`install-client.sh` 安装的 systemd unit 是 `Restart=no` 且不 enable；OpenRC 不配 respawn；无 service manager 时只跑 `nohup`。

首次开通之后 Router 只记录状态、发心跳与告警。**Client 进程存活归 Client 所有者。**

### 用量口径

Client 侧用量只统计 **Token / 状态 / 延迟**，不计算成本或 USD 金额，也不保存市场用户、价格或账本。金额只在 Router 侧的市场账务中。

### 显式绑定，不做故障转移

Managed OAuth Provider Bundle 必须显式绑定账号。请求**不**按占用、quota、cooldown、并发或错误切换账号；首个 401 只在原账号强刷一次并重放。

## 兼容性

| 面 | 策略 |
| --- | --- |
| 数据库 | Router 版本间自动迁移（libSQL / Turso 同样适用） |
| Client 存储 | 启动时按持久化迁移边界一次性升级，失败则启动失败 |
| 反代协议 | Anthropic / OpenAI / Gemini 兼容协议保持稳定 |
| v1 Share 字段 | 不兼容，fail-closed |
| 旧 Market 端点 | 不兼容，`410 Gone` |

## 文档站本身

文档更新走 GitHub commits，每页底部「编辑此页」可看该页历史。

## 延伸阅读

- [已下线功能](/reference/retired) —— 每一项的完整前后对照
- [相关链接](/reference/links)
