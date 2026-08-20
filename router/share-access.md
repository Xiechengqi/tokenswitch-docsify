# Share 访问与脱敏

一个请求打到 Share URL 上之后发生了什么，以及哪些信息在哪一层是可见的。

## 请求路径

```text
CLI ──► https://<子域名>.<区域域名>
         │
         │ ① Router 按 Host 定位 Share
         │ ② Router 校验调用方 API Token（scope: share:invoke）
         │ ③ Router 检查准入与限额
         │ ④ Router 注入签名的 ingress context
         ▼
      SSH 反向隧道
         ▼
   cc-switch-server
         │ ⑤ 验签 + 新鲜度检查
         │ ⑥ 按 Share binding 选中账号
         │ ⑦ 本地解密取出凭据
         ▼
      上游模型服务
```

**用户凭据终止在 Router。** Client 只看到与该隧道路由绑定的内部 share secret，看不到调用方的 API Token。

## 认证

调用方必须带 Router 用户 API Token，三个头任选：

```text
Authorization: Bearer <token>
x-api-key: <token>
x-goog-api-key: <token>
```

缺失返回 `401 missing-router-api-token`，无效返回 `401 invalid-router-api-token`。

## Ingress context 与非对称新鲜度窗口

Router 转发时注入一段签名上下文，标明这是哪个 Share、哪个用户、哪次请求。Client 侧验签，时间窗口是**非对称**的：

- 最多接受 **30 秒前**签发
- 最多接受 **5 秒未来**签发

未来方向窗口小得多，因为正常时钟偏差不该让 Router 签出未来时间戳。

验签失败返回**空正文 `401`**，诊断信息只通过内部响应头回传给 Router，**不外泄给调用方**。

## 内部头必须被剥离

Router 必须剥掉调用方自带的 `x-user-email`、`x-user-country*` 等旧身份头。Client 的推理上下文**只接受**签名上下文重新注入的 `x-cc-switch-user-*` 头。

同理，来自公网的 `x-cc-switch-ingress-*` 同名头会被 `is_internal_share_context_header()` 剥离。

## 请求体上限

Router 分三档限制请求体，一次性读进内存：

| 档位 | 默认上限 | 环境变量 |
| --- | --- | --- |
| 普通 | 10 MB | `CC_SWITCH_ROUTER_PROXY_REQUEST_BODY_LIMIT_MB` |
| 视频 | 32 MB | `CC_SWITCH_ROUTER_PROXY_MEDIA_REQUEST_BODY_LIMIT_MB` |
| 图片 | 48 MB | `CC_SWITCH_ROUTER_PROXY_IMAGE_REQUEST_BODY_LIMIT_MB` |

这不是速率限制，是**内存缓冲天花板**：峰值内存 ≈ 单档上限 × 并发请求数。改了要重启。

读取发生在获取 Share 并发额度**之前**，所以超限返回 `413` 且**不消耗并发额度**。

Router 转发时会额外写一个**不参与签名**的 `x-cc-switch-ingress-body-limit`（十进制字节，值 = 本次命中的档位）。Client 取 `min(本地上限, 声明值)` 作为生效上限。

这个头不签名是安全的：伪造只能把上限**压低**（伪造者自伤），抬不高 Client 的本地配置。两端也因此可以独立升级 —— 旧 Client 忽略该头沿用自身值，旧 Router 不发该头时新 Client 回退到历史默认（普通 2 MiB / 视频 32 MiB / 图片 48 MiB）。

新版 Client 的本地上限默认取 Router 允许的最大档位（64 / 256 / 256 MB），所以实际天花板通常由 Router 决定。Share Owner 可以在 `server.json` 的 `requestBodyLimits` 或 `CC_SWITCH_{,MEDIA_,IMAGE_}REQUEST_BODY_LIMIT_MB` 里主动收紧。

## 并发限流

6 个并发限流器，键位：

- `share_id`
- `share_id:app`
- `share_id:app:email`
- 用户 IP（免费档）
- 图片任务
- 市场邮箱

免费档还有 `CC_SWITCH_ROUTER_FREE_SHARE_IP_PARALLEL_LIMIT`（默认 1）按 IP 限并发。

## 真实客户端 IP

Router 硬编码了 Cloudflare 的 IPv4 / IPv6 网段（**不调用任何 Cloudflare API**）：

- TCP peer 是 CF 边缘 → 信任 `CF-Connecting-IP` / `CF-IPCountry` / `CF-ASN`
- 不是 → 回退 socket peer IP

这防止伪造头绕过免费档的按 IP 限流。

## 请求生命周期边界

Share 请求在六个阶段各有独立超时边界：请求体、响应头、首个业务事件、业务空闲、下游背压、绝对生存时长。

响应由后台泵读取，所以调用方停止消费 body 时并发额度仍会释放。

10 秒周期的看门狗按唯一 lease 幂等回收异常残留并告警，**绝不重启 Router**。管理员兜底接口 `POST /v1/admin/proxy/share-requests/force-release` 只接受 `requestId` 或 `shareId` 其中一个。

## 谁能看到什么

| 数据 | Router | 调用方 | 公开 |
| --- | :---: | :---: | :---: |
| 上游 API key / OAuth token | ❌ 从不 | ❌ | ❌ |
| 调用方的 Router API Token | ✅ 校验用 | ✅ 自己的 | ❌ |
| Client 内部 share secret | ✅ | ❌ | ❌ |
| Share 子域名、在线状态 | ✅ | ✅ | ✅ |
| Owner 邮箱 | ✅ | ✅ | ✅ 完整邮箱 |
| 用量（token 数、状态、延迟、模型、地域） | ✅ 脱敏 observation | 自己的 | 部分 |
| 账单金额、收款方式、付款 reference | ✅ | 双方 | ✅ |

Router **不保存**下游用户的 API key、token 售价、余额或结算数据。

## 早期版本的 ACL

早期有一套 `acl` / `shared_with_emails` / `market_access_mode` 的访问控制模型，**已全部退役**，出现即拒绝。现在只有 `freeAccess` + `userGrants`。

见 [已下线功能](/reference/retired)。

## 延伸阅读

- [创建 Share](/provider/share)
- [用 CLI 调用](/share-market/using-cli)
- [安全与边界](/reference/security)
