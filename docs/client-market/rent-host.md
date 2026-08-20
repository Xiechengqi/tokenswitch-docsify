# 租用主机

租一台已经装好 `cc-switch-server` 的机器。

## 什么情况下需要

你有 token 想分享出去（当 Share Owner），但没有一台能长期开着的机器。

租一台，Router 帮你把 Client 装好，你拿到手就能直接配 Provider 和 Share。

## 流程

1. 进 **Client Market**（`/client-market`），浏览可用主机
2. 看规格、区域、每日价格、服务期限
3. 发起报价（quote）—— 主机进入 `reserved` 状态锁定报价
4. 确认并提交（`quotes/:id/commit`）
5. Router 开通：SSH 登录目标机器 → 安装依赖 → 部署 `cc-switch-server` → 注册 → 启动
6. 开通成功后，**服务期限从这一刻开始计算**

付费主机默认白名单准入，可能需要 Host Provider 先批准你并授予信用额度。

## 拿到之后

在 `/account/client` 看你的 Client。接着就是标准的 Share Owner 流程：

1. [登录 Client 的 Web 界面](/provider/install)
2. [添加 Provider 和账号](/provider/add-provider)
3. [创建 Share](/provider/share)
4. [挂到 Share Market](/provider/listing)

## 进程要你自己管

**Router 不会替你重启 Client。**

开通脚本只启动一次，安装的服务不开机自启、不失败重启。机器重启或进程崩溃后，你需要自己拉起来。Router 只会把状态标成 `offline` 并告警。

如果你要长期跑，登进机器把它配成开机自启是值得的。

## 计费

- 固定 USD 每日价格
- **前 12 小时健康服务时长试用**，不计费
- 之后只按 Router 观测到的健康区间累计，不可用和状态未知的时间不计费
- 和你从**同一个供应商**租的 Share 共用一本 USD 账，合并出账

免费主机不进账务系统。

租自己的付费主机按免费处理，不会形成自债务。

出账、付款、确认的完整流程见 [计费与付款](/share-market/billing) —— Share 和主机走的是同一套。

## 期限

1–365 天固定期限，或永久。

固定期限从**开通成功**开始，不是从下单开始。到期走安全清理流程回收。

## 我不能做什么

- **不能开 Web 终端。** Router 的 Web 终端只对 Host Provider 本人开放
- 机器的物理和系统层面归 Host Provider

你拿到的是一台跑着 `cc-switch-server` 的机器的使用权，通过 Client 自己的 Web 界面管理它。

## 延伸阅读

- [Client Market 概览](/client-market/overview)
- [Share Owner 快速上手](/provider/quickstart)
- [计费与付款](/share-market/billing)
