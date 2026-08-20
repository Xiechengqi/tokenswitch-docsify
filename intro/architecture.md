# 架构

TokenSwitch 有**三个角色**，但只有**两个运行时组件**：Client（`cc-switch-server`）和 Router（`cc-switch-router`）。Router 进程同时承担 Router 与 Client / Share Market 两个角色。

## 组件

### cc-switch-server（Client）

Rust 单二进制，内嵌 Web 管理界面，无桌面依赖。跑在 Share Owner 自己的机器上（VPS、NAS、家用电脑都行）。

它负责：

- 管理 Claude / Codex / Gemini 三类 app 的**供应商（Provider）**配置与**账号（Account）**凭据
- Server-native OAuth：设备流、CLI PKCE、刷新、profile 与配额查询，全部在 Server 侧完成
- 创建 **Share**，把账号绑定到 Share 上
- 向 Router 注册 installation、申请子域名、建立 SSH 反向隧道
- 反代转发：Claude Messages、Codex Chat Completions / Responses、Gemini `/v1beta/*`、OpenAI 兼容 `/v1/models`
- 记录 usage（token 数、状态、延迟），**不计算成本或金额**

默认监听 `15721`。这个端口只承载管理 UI、控制面和健康检查，**不对外提供推理 API**。

### cc-switch-router（Router + Market）

Rust 单二进制，部署在公网。单进程三个职责：

1. **HTTP 服务**：API 端点 + 基于 Host 子域名的反向代理 + 内嵌前端（Next.js 静态导出，编译进二进制），共用 `:80`
2. **SSH 服务**：基于 `russh` 的反向端口转发，一次性密码认证，`:2222`
3. **数据存储**：业务库用本地 libSQL 或 Turso Cloud Embedded Replica；metrics 用独立本地库

Router **不存任何上游 API key 明文**。

内建两个市场，共用同一套隧道、Share descriptor、准入与账务机制：

- **Share Market** —— 固定拼车位租用
- **Client Market** —— 主机供给

## 数据面链路

```text
Claude Code / Codex CLI / Gemini CLI
   │  标准协议请求 → Router 的 Share URL
   ▼
cc-switch-router
   │  ① 按 Host 子域名定位 Share
   │  ② 校验准入，注入签名的 ingress context
   │  ③ 经 SSH 反向隧道下发
   ▼
cc-switch-server
   │  ① 验证 ingress 签名与新鲜度
   │  ② 按 Share binding 选中绑定账号
   │  ③ 本地解密取出凭据
   ▼
上游模型服务
```

Client 侧验签有一个**非对称新鲜度窗口**：最多接受 30 秒前签发、最多接受未来 5 秒签发的上下文。验签失败返回空正文 `401`，诊断信息只通过内部响应头回传给 Router，不会外泄给调用方。

## 管理面链路

```text
浏览器
   ▼
cc-switch-server :15721
   ▼
Web UI / 控制面 / 健康检查
```

Router 的 Clients 页可以用 iframe 弹窗打开某个 Client 自己的 Web 界面（「控制台」和「终端」两个入口），请求经 client tunnel 转发，登录态由 Client 自己管理。

## Share Market：拼车位

Share Owner 在 Router 的 Share Market 页面通过「添加 Share」选择自己当前 active、尚未挂售的 Share，创建最多 **20 个拼车位**。每个拼车位独立配置：

- 用户 Token 限额与并发限额
- 每日价格（留空 = 免费位）
- 服务期限（1–365 天固定期限，或无固定期限）

Token 限额留空表示不限额；设置限额后才能选择重置周期（累计不重置 / 每天 / 自然周 / 每 7 天 / 自然月 / 每 30 天）。Token 重置周期与服务期限相互独立。

固定期限从**买家确认租用成功时**开始，绝对到期时间同时冻结到 Router 的 Subscription 和 Client 的 grant policy。授权延迟或账单暂停**不会顺延**，到期后不恢复服务。

租用成功后，Router 通过 **pending share edit** 在 Client 上创建由 `routerShareMarket` 管理的授权条目。普通 Share 编辑不能修改或删除这类条目。

## Client Market：主机供给

Host Provider 贡献一台 Linux 服务器，Router 用**专用外发 Ed25519 provision key**（与入站 SSH host key 相互独立）登录，安装依赖并部署 `cc-switch-server`，使这台机器成为供给节点。

主机状态机：

```text
idle ──► locked ──► allocated ──► draining ──► idle

异常态：unreachable / abnormal / disabled / reserved
```

`reserved` 用于报价锁定期。

**重要边界**：首次开通完成后，Router **不会**因为 tunnel 离线而通过 SSH 启动或重启远端 Client。安装的 systemd unit 使用 `Restart=no` 且不开机自启，OpenRC 服务不配置 respawn。Router 只记录 `online` / `reconnecting` / `offline` / `disabled` 状态并告警。**Client 进程生命周期由 Client owner 负责。**

## 账务

付费 Share 与付费 Client Host **共用**按「买家 + 供应商」聚合的 USD 赊账账户：

```text
授权服务 → 前 12 小时健康时长不计费
        → 按 Router 观测到的健康服务区间累计，未知或不可用时间不计费
        → 有限额度用到 80% 时双方预警
        → 用满 / 主动清账 / 最后一个服务结束 → 合并账单，暂停相关服务
        → 线下付款 + 买家声明 → 供应商确认到账 → 恢复服务
```

无限额度只接受主动清账。出账时会把供应商当时的收款方式和联系方式**冻结到该账单**，避免后续修改资料改变付款依据。供应商可随时永久关闭对某个买方的赊账关系，清账或作废后也不恢复。

Provider 租用自己的付费 Host 时按免费处理，不会形成自债务。

## Gateway：未来的容量适配层

`/v1/gateways/register`、`/v1/gateway/*` 与 `/_gateway/proxy/*` 是为未来跨 Router 容量消费者预留的**中性适配层**，使用 Ed25519 签名 + timestamp + nonce + body SHA-256 + scope。

当前 tenant/seat/grant 契约尚未形成，**普通 Share 的 Gateway inventory / proxy 整体 fail-closed**。它不是第三个交易面，也不能被描述为已完成的 Token Market。

## 多区域与联邦

仓库根部的 `regions` 文件声明区域到域名的映射，当前为 `japan` / `singapore` / `hongkong` / `usa`，经 `GET /v1/regions` 暴露。每个区域独立部署一套 Router，各自的用户、Share 和账务互不相通。

## 部署形态

最小部署：一台公网服务器跑 Router，若干台机器跑 `cc-switch-server`。Router 需要 wildcard DNS 接管整个域。

## 延伸阅读

- [关键概念](/intro/concepts) — installation、share、lease、拼车位这些词的准确含义
- [角色与入门路径](/intro/roles) — 你是哪一类用户，从哪开始
- [安全与边界](/reference/security) — 谁能看到什么，什么绝不出本地
