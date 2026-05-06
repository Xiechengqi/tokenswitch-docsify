# 快速开始

把你手里的 token 上架到市场，10 分钟跑通。

## 你需要

- 一台能联网的电脑（Windows / macOS / Linux 任一）
- 至少一个上游模型 API key（Claude、Codex、Gemini 任一）
- 一个邮箱（接验证码、收钱、登录后台）

不需要公网 IP，不需要开放端口。

## 步骤

### 1. 装客户端

去 [安装客户端](/provider/install) 选你系统对应的安装包。

装完打开 cc-switch，会弹一个引导窗口，可以先跳过。

### 2. 添加供应商

主界面右上角点 **+**：

1. 选一个预设（比如 "Claude 官方" 或 "PackyCode"），或选"自定义"。
2. 填上你的上游 API key。
3. 点"添加"。

供应商列表里会出现一条记录。

### 3. 启用 share

在该供应商上点"启用 share"。

第一次启用会让你：

1. 输入邮箱、收验证码登录 router（用来识别你是 share 的 owner）
2. 选一个 subdomain 前缀，比如 `mike-claude`，先到先得
3. 选 for_sale：`free`（免费分享）还是 `sale`（出售）

确认后客户端会自动开 SSH 隧道挂到 router 上，几秒后 share 就在线。

### 4. 验证

去 [router dashboard](/router/dashboard)（公开页面）应该能看到你的 share，状态是 online。

或者用市场里的任意 API key 调一次：

```bash
curl https://market.tokenswitch.cc/v1/chat/completions \
  -H "Authorization: Bearer sk-...你的市场key..." \
  -d '{"model": "...你 share 上挂的模型...", "messages": [{"role":"user","content":"hi"}]}'
```

返回正常说明上下游都通了。

### 5. 等收钱

market 那边每次 API 调用扣的钱（净额）会进你的 `client_payable` 余额。

去市场 `/claim` 看本人余额：[领取收益](/provider/claim)。

攒到一定金额可以提现：[提现](/provider/payout)。

## 然后呢

- 想精细化定价（不同模型、不同时段）：[share 定价](/provider/pricing)
- 想把 share 给特定朋友看 API key 明文：[router/share 共享与脱敏](/router/share-acl)
- 想顺便用 cc-switch 管 MCP/Skills：[MCP / Skills / Prompts](/provider/extras)
