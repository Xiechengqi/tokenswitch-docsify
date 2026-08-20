# 租 Share 快速上手

目标：十分钟内让你的 Claude Code / Codex CLI / Gemini CLI 跑起来。

你不需要安装任何东西，只需要一个浏览器和已有的 CLI。

## 1. 选区域并登录

选一个离你近的区域站点：

| 区域 | 站点 |
| --- | --- |
| 日本 | https://jptokenswitch.cc |
| 新加坡 | https://sgptokenswitch.cc |
| 香港 | https://hktokenswitch.cc |
| 美国 | https://ustokenswitch.cc |

各区域**独立**：账号、Share、账单都不互通。选定后就一直用它。

登录用邮箱验证码，没有密码。填邮箱 → 收验证码 → 输入 → 进站。

## 2. 取你的 API Token

进 **账户 → API Keys**（`/account/api-keys`）。

这个 Token 是你调用**所有** Share 的唯一凭据。不是每租一个 Share 发一个 key —— 一个 Token 走遍全站。

> Token 明文保存在 Router，可以随时在这一页重复查看，也可以重置。重置后旧 Token 立即失效。

## 3. 挑一个拼车位

进 **Share Market**（`/share-market`）。列表里每个挂牌显示 Owner、绑定的 app（Claude / Codex / Gemini）、在线状态和各拼车位的报价。

看这几项：

- **每日价格**：留空的是免费位
- **服务期限**：1–365 天固定期限，或无固定期限
- **Token 限额 / 并发限额**：够不够你用
- **在线状态**：Owner 的机器现在通不通

## 4. 租下来

点「租用」，会弹出**交易确认**，固定展示：Owner、服务、在线状态、USD 日费（或「免费」）、服务期限，付费服务还会展示 12 小时健康时长试用和「按供应商聚合出账」的语义。

确认后提交。提交会带上你看到的那份报价的版本号，所以**不会出现确认完价格被换掉的情况**。

有两种可能：

- **直接成功** —— 免费位默认黑名单模式，没被拉黑就能直接租
- **需要 Owner 批准** —— 付费位默认白名单模式，需要 Owner 明确允许你并授予信用额度。这时会生成一条准入申请，等 Owner 处理

租用成功后，Router 会在 Owner 的机器上创建一条由市场托管的授权。**固定期限从这一刻开始计时。**

## 5. 拿到 Share URL

进 **账户 → 我的租用**（`/account/rentals`），能看到 Share URL，形如：

```text
https://<子域名>.jptokenswitch.cc
```

## 6. 配置你的 CLI

三个 CLI 都是「改 base URL + 填 Token」两件事。

**Claude Code：**

```bash
export ANTHROPIC_BASE_URL="https://<子域名>.jptokenswitch.cc"
export ANTHROPIC_AUTH_TOKEN="<你的 Router API Token>"
claude
```

**Codex CLI：**

```bash
export OPENAI_BASE_URL="https://<子域名>.jptokenswitch.cc/v1"
export OPENAI_API_KEY="<你的 Router API Token>"
codex
```

**Gemini CLI：**

```bash
export GOOGLE_GEMINI_BASE_URL="https://<子域名>.jptokenswitch.cc"
export GEMINI_API_KEY="<你的 Router API Token>"
gemini
```

Token 也可以放在 `Authorization: Bearer`、`x-api-key` 或 `x-goog-api-key` 任一请求头里，Router 都认。

详细说明和验证方式见 [用 CLI 调用](/share-market/using-cli)。

## 7. 先花掉试用时长

付费位的**前 12 小时健康服务时长不计费**。用这段时间确认：

- 模型和你要的一致
- 延迟可以接受
- Token 限额够用

不合适就在到期前释放，一分钱不欠。

## 接下来

- [挑位子和租用](/share-market/rent) — 准入、报价、期限的细节
- [用 CLI 调用](/share-market/using-cli) — 三个 CLI 的完整配置和排障
- [计费与付款](/share-market/billing) — 赊账、账单、线下付款怎么走
