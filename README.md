# TokenSwitch 是什么

TokenSwitch 是一组开源工具，让**手上有 AI 编程订阅额度的人**和**想用这些额度的人**直接连接。

它的形态很具体：Share Owner 把自己的订阅账号做成一个 **Share**，在上面开出最多 20 个**拼车位**；买家按天租一个位置，用自己的 Claude Code / Codex CLI / Gemini CLI 直连。没有代充、没有 API key 转卖、没有平台托管资金。

## 两个组件，三个角色

| 角色 | 由谁承载 | 干什么 |
| --- | --- | --- |
| **Client** | `cc-switch-server` | 跑在 Owner 自己的机器上，持有上游账号凭据，本地反代，通过隧道接入 Router |
| **Router** | `cc-switch-router` | 公网入口，子域名反代、SSH 反向隧道、签名校验与身份注入 |
| **Client / Share Market** | `cc-switch-router`（内建） | 拼车位挂售与租用（Share Market）、服务器供给与租用（Client Market） |

Router 与两个 Market 是**同一个进程**，不是三个服务。

**[cc-switch-server](https://github.com/xiechengqi/cc-switch-server)** — Client。Rust 单二进制 + 内嵌 Web 管理界面，无桌面依赖，可跑在 VPS、NAS 或自己的电脑上。它管理 Claude / Codex / Gemini 三类 app 的供应商与账号，创建 Share，并为本地 CLI 提供反代。

**[cc-switch-router](https://github.com/xiechengqi/cc-switch-router)** — Router。Rust 单二进制，部署在公网。HTTP API + 子域名反代 + 内嵌前端（`:80`），SSH 反向隧道服务端（`:2222`），libSQL 状态存储。它**不存任何上游 API key 明文**。

## 一次请求怎么走

```text
Claude Code / Codex CLI / Gemini CLI
   │  标准协议请求，指向 Router 的 Share URL
   ▼
cc-switch-router
   │  验签、注入签名身份上下文（ingress context）
   │  SSH 反向隧道
   ▼
cc-switch-server（跑在 Owner 的机器上）
   │  按 Share binding 选中绑定的账号，本地取出凭据
   ▼
上游模型服务（Claude / Codex / Gemini / ...）
```

两点要记住：

- Router 不知道上游凭据，它只按子域名把请求转给对应的 Client。
- Client 的管理端口（默认 `15721`）**不对外提供推理 API**，外部请求只能从 Router 的 Share URL 进来。

## 钱怎么走

**平台不经手资金。**

付费拼车位按 **USD 每日价格**计价。买家和供应商之间按「买家 × 供应商」聚合出一个**赊账账户**：

```text
租用 → 前 12 小时健康时长免费试用
     → 之后按 Router 观测到的健康服务区间累计费用
     → 用满额度 / 主动清账 / 最后一个服务结束 → 生成合并账单
     → 买家按供应商的收款资料线下付款并声明
     → 供应商确认到账 → 恢复服务
```

汇率由 Router 动态设置管理，默认 `1 USD : 7 CNY`；账单冻结出账时的汇率与人民币总额，CNY 不参与记账。争议由 Router 管理员裁决。

免费拼车位不要求信用额度，也不进入账务系统。

## 多区域

当前有四个公开区域，各自独立部署一套 Router：

| Region | 域名 |
| --- | --- |
| japan | https://jptokenswitch.cc |
| singapore | https://sgptokenswitch.cc |
| hongkong | https://hktokenswitch.cc |
| usa | https://ustokenswitch.cc |

## 我应该看哪一节

- **想用别人的额度** → [租 Share 快速开始](/share-market/quickstart)
- **手上有额度想共享出去** → [Share Owner 快速开始](/provider/quickstart)
- **有闲置服务器，或想租一台来跑 Client** → [Client Market 概览](/client-market/overview)
- **想看公开数据，或登录看自己的 Share** → [路由 Dashboard](/router/dashboard)
- **想自己搭一套** → [自部署概览](/self-host/overview)

不熟悉这套系统的话，先看 [架构](/intro/architecture) 和 [关键概念](/intro/concepts)，五分钟。

> 早期版本还有独立的 Token Market（`cc-switch-market`）和 Tauri 桌面客户端，二者都已下线。如果你看过旧文档，请读 [已下线功能](/reference/retired)。

## 许可证

各项目均为开源，许可证以各自仓库为准。
