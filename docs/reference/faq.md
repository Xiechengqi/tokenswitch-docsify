# 常见问题

## API 用户

**Q：可以用 OpenAI 官方 SDK 吗？**

可以，把 `base_url` 改成市场地址（如 `https://market.tokenswitch.cc/v1`），key 换成市场签发的 sk-... 即可。详见 [OpenAI 兼容调用](/market/using-openai)。

**Q：Anthropic 的 streaming 为什么不能用？**

当前版本流式 usage 解析没完全跑通，开了会有资金风险，所以显式拒绝。OpenAI 兼容接口的 streaming 是支持的。

**Q：余额扣得对不对？怎么核对？**

`/usage` 页面看每条请求的 input / output token 数和单价，算一下应该和扣费一致。怀疑算错提 [工单](/market/support)。

**Q：API key 不小心提交到 GitHub 了**

立刻去 dashboard 撤销。撤销后这把 key 立即失效。

**Q：能给某个 key 设置消费上限吗？**

当前版本不支持按 key 限额，所有 key 共用账户余额。建议小额充值、按需补。

**Q：模型不在 `/pricing` 列表里**

说明当前没有 Provider 上架这个模型。换一个相近模型，或等等。

## Provider

**Q：必须 7×24 在线吗？**

最好。掉线期间 share 无法被市场使用，不收钱也不会被罚。但市场会把流量分给其他在线 share，你不在的时候没收入。

**Q：会不会被上游封号？**

理论上有可能：你的上游 token 被很多人通过市场调用，频次和 IP 不稳定，可能触发风控。

降低概率：

- 选支持高并发的上游
- 不要把同一个 token 同时挂在多个 share 上
- 如果上游有"按设备识别"机制，注意流量特征

**Q：怎么知道 share 在不在线？**

[router dashboard](/router/dashboard) 看，或在 cc-switch 客户端 UI 看绿点。

**Q：换电脑怎么搬 share？**

新电脑装 cc-switch → 用同一个 owner_email 登录 router → 重新 claim 同一个 subdomain（如果还在保留期内）→ 绑定上游 API key。`client_payable` 余额跟邮箱走，不会丢。

**Q：能不能 Provider 自己定价？**

当前不行，一律按市场标价。后续版本可能开放溢价 / 折扣。

## 通用

**Q：邮箱被别人注册了怎么办？**

邮箱是身份，不存在"被注册"。验证码每次都重新发，没人能在不收你邮件的情况下登录你账户。

担心邮件被劫持就启用邮箱二次验证（你邮箱服务商提供）。

**Q：忘记的不是密码，是邮箱怎么办？**

没有恢复机制。账户、余额、share 跟邮箱强绑定。换邮箱要：

- API 用户：旧邮箱有余额的话，提工单走人工迁移
- Provider：cc-switch 客户端走"修改 owner_email"流程

**Q：admin 能看到我的请求内容吗？**

不能。market 只存 usage 元数据（token 数、模型、时间），不存 prompt 和响应原文。

例外：进入 `needs_review` 的请求会保留一个调试包给 admin 排查，处理完按保留期清理。

**Q：开源吗？**

是。三个项目都是开源的：

- cc-switch（客户端）
- cc-switch-router（路由）
- cc-switch-market（市场）

具体仓库见 [相关链接](/reference/links)。

**Q：自部署有什么坑？**

DNS wildcard 必须配通、Cloudflare SSH 端口要绕过 CF、Resend from 域名要在 Resend 验证。其他参考 [自部署概览](/self-host/overview)。

## 延伸阅读

- [安全与边界](/reference/security) — 数据和身份的边界
- [术语表](/reference/glossary)
