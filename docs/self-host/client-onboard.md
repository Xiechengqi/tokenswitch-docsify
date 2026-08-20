# 接入 Client

把 `cc-switch-server` 接到你自部署的 Router 上。

流程和接公共 Router 完全一样，只是 Router URL 换成你自己的。

## 安装

```bash
curl -fsSL -o install-client.sh \
  https://raw.githubusercontent.com/Xiechengqi/cc-switch-router/master/install-client.sh

printf '%s\n' "Web密码" | bash install-client.sh \
  https://example.com \
  owner@example.com \
  --password-stdin \
  my-client
```

第四个参数是 Client 子域名，留空则自动生成一个可读的随机单词子域名，Server 会尽量在 Router 上验证可用性。

第五个可选参数 `disableWebTerminal` 关掉 Client 自带的 Web 终端。

## 手工接入

已经装好 Client 的话，直接初始化：

```bash
cc-switch-server init \
  --owner-email owner@example.com \
  --router-url https://example.com \
  --password 'Web密码'
```

或者通过 HTTP（首次 setup 前不需要鉴权）：

```bash
curl -fsS -X POST http://127.0.0.1:15721/api/setup/bootstrap \
  -H 'content-type: application/json' \
  -d '{
    "password": "Web密码",
    "ownerEmail": "owner@example.com",
    "routerUrl": "https://example.com",
    "clientTunnelSubdomain": "my-client"
  }'
```

响应里的 `sessionToken` 可以直接当 Bearer token 用。

## 接入时发生了什么

```text
register  ──►  Ed25519 身份注册到 Router
   ▼
owner bind ──►  绑定 owner 邮箱（需要邮箱验证）
   ▼
client tunnel claim ──►  申请 client 子域名并建立 SSH 反向隧道
```

之后每建一个 Share，Router 会再分配一个 Share 子域名。

## 验证

**Client 侧：**

```bash
curl -s http://127.0.0.1:15721/health
curl -s http://127.0.0.1:15721/version
cc-switch-server doctor
```

**Router 侧：** 登录你的 Router，进 `/clients`，应该能看到这个 Client 且状态 `online`。点「控制台」应该能在 iframe 里打开 Client 的 Web 界面 —— 这一步通了说明 client tunnel 正常。

**端到端：** 建一个 Share，绑账号，然后：

```bash
curl -s https://<share子域名>.example.com/v1/models \
  -H "Authorization: Bearer <你的 Router API Token>"
```

## 排障

| 现象 | 检查 |
| --- | --- |
| 注册失败 `429` | 撞到注册准入限流；响应带 `Retry-After` |
| 注册成功但隧道连不上 | `CC_SWITCH_ROUTER_SSH_PUBLIC_ADDR` 是否指向源站直连地址；2222 端口是否开放 |
| Client 显示 online 但 Share 打不开 | wildcard DNS 是否覆盖 Share 子域名 |
| 请求返回空正文 `401` | ingress 验签失败，八成是两端时钟偏差超窗口（30 秒前 / 5 秒未来） |
| Client 频繁 `reconnecting` | 网络抖动，或撞到 SSH keepalive 上限（默认 30 秒间隔、最多 3 次未响应） |
| Client 掉线不自动恢复 | **预期行为。** Router 不会替你重启 Client，见下 |

## 进程生命周期归你

再强调一次：**Router 不会启动或重启 Client 进程。**

`install-client.sh` 装的 systemd unit 是 `Restart=no` 且不 enable，OpenRC 不配 respawn 也不加默认 runlevel。首次开通只启动一次。

Router 只做四件事：记录 `online` / `reconnecting` / `offline` / `disabled`、发心跳、告警、在 UI 上提示。

自部署环境下这台机器是你自己的，可以放心改成自动重启：

```bash
sudo sed -i 's/^Restart=no$/Restart=always/' /etc/systemd/system/cc-switch-server.service
sudo systemctl daemon-reload
sudo systemctl enable --now cc-switch-server
```

## 离线判定的时间参数

| 参数 | 默认 | 含义 |
| --- | --- | --- |
| `CC_SWITCH_ROUTER_CLIENT_OFFLINE_ALERT_SECS` | 180 | 连续缺少可信签名心跳多久后确认离线（安全下限 180 秒） |
| `CC_SWITCH_ROUTER_CLIENT_RECOVERY_STABLE_SECS` | 120 | 心跳稳定多久后结束离线 episode |
| `CC_SWITCH_ROUTER_CLIENT_STALE_SECS` | 3600 | 超时未心跳则标记离线并清理其 Share、lease 与内存路由 |
| `CC_SWITCH_ROUTER_CLIENT_INSTALLATION_RETENTION_SECS` | 21600 | 离线 Client 的 installation 记录保留时长；必须 ≥ `CLIENT_STALE_SECS` |

## 接下来

Client 接进来之后就是标准的 Share Owner 流程：

- [添加 Provider 和账号](/provider/add-provider)
- [创建 Share](/provider/share)
- [挂到 Share Market](/provider/listing)

## 延伸阅读

- [安装 Client](/provider/install)
- [部署 Router](/self-host/router-deploy)
- [域名与 TLS](/self-host/dns-tls)
