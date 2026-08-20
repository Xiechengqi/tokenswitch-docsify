# 安装 Client

Client 是 `cc-switch-server` —— 一个 Rust 单二进制，内嵌 Web 管理界面，没有桌面依赖。

> 早期版本用的是 Tauri 桌面应用 `cc-switch`。它**已经退役**，现在只作为 Provider 预设的审计基线保留。见 [已下线功能](/reference/retired)。

## 环境要求

- Linux（x86_64 或 aarch64）
- 能连出公网（Client 主动连出到 Router，不需要公网入站）
- root 或可 sudo

## 一行安装

```bash
curl -fsSL -o install-client.sh \
  https://raw.githubusercontent.com/Xiechengqi/cc-switch-router/master/install-client.sh

printf '%s\n' "你的Web密码" | bash install-client.sh \
  https://jptokenswitch.cc \
  you@example.com \
  --password-stdin
```

参数：

| 位置 | 含义 |
| --- | --- |
| 1 | Router URL（选你的区域站点） |
| 2 | Owner 邮箱 |
| 3 | `--password-stdin`，从标准输入读 Web 密码 |
| 4（可选） | Client 子域名；留空则自动生成一个可读的随机单词子域名 |
| 5（可选） | `disableWebTerminal`，关掉 Client 自带的 Web 终端 |

> 密码务必用 `--password-stdin`。脚本也支持把密码当第三个参数传，但那会把它留在进程参数和 shell 历史里。

脚本会：下载对应架构的二进制到 `/usr/local/bin/cc-switch-server` → 初始化配置 → 注册到 Router → 启动一次进程。

## 服务不会自动重启

安装的服务是**刻意**这么配的：

- systemd unit：`Restart=no`，且不 `enable`（不开机自启）
- OpenRC：不配 respawn，不加入默认 runlevel
- 没有受支持的服务管理器时：只跑一次 `nohup`

**Router 不会替你拉起进程。** 隧道断了 Router 只会记录 `offline` 并告警。

想要开机自启和崩溃重启，自己改：

```bash
sudo systemctl enable cc-switch-server
sudo sed -i 's/^Restart=no$/Restart=always/' /etc/systemd/system/cc-switch-server.service
sudo systemctl daemon-reload
sudo systemctl restart cc-switch-server
```

## 手工安装

不想用脚本：

```bash
# amd64
curl -fsSL -o /usr/local/bin/cc-switch-server \
  https://github.com/Xiechengqi/cc-switch-server/releases/download/latest/cc-switch-server-linux-amd64
# arm64 换成 cc-switch-server-linux-arm64
chmod +x /usr/local/bin/cc-switch-server

cc-switch-server init \
  --owner-email you@example.com \
  --router-url https://jptokenswitch.cc \
  --password '你的Web密码'

cc-switch-server --host 0.0.0.0 --port 15721
```

也可以完全通过 HTTP 初始化（首次 setup 前不需要鉴权）：

```bash
curl -fsS -X POST http://127.0.0.1:15721/api/setup/bootstrap \
  -H 'content-type: application/json' \
  -d '{
    "password": "你的Web密码",
    "ownerEmail": "you@example.com",
    "routerUrl": "https://jptokenswitch.cc",
    "clientTunnelSubdomain": ""
  }'
```

## 数据存哪

默认 `~/.cc-switch-server/`（可用 `--config-dir` 或 `CC_SWITCH_SERVER_CONFIG_DIR` 改）。

| 文件 | 内容 |
| --- | --- |
| `server.json` | 密码哈希、owner 邮箱、Router 配置、client tunnel 子域名、请求体上限 |
| `providers.json` | Provider 配置 |
| `accounts.json` | 账号凭据（加密） |
| `accounts.key` | 根密钥 |
| `shares.json` | Share 定义 |
| `tunnels.json` | 隧道状态 |
| `usage/` | 用量记录 |
| `backups/` | 自动备份 |

目录 `0700`、文件 `0600`，启动时加独占锁防止两个进程共用一个目录。

**这些文件里有 token 和 secret，绝对不要提交到 git、不要放进公开备份。**

## 打开管理界面

```text
http://<你的服务器>:15721
```

两个访问方式：

- **直连** —— 需要 15721 可达。放公网的话建议前面加 HTTPS 反代
- **经 Router** —— 在 Router 的 `/clients` 页点「控制台」，请求走 client tunnel，**不用暴露端口**

推荐第二种。

## 验证

```bash
curl -s http://127.0.0.1:15721/health
curl -s http://127.0.0.1:15721/version
```

诊断命令（只读本地配置，不启动 HTTP）：

```bash
cc-switch-server config validate
cc-switch-server doctor
cc-switch-server doctor --check-port
```

`config print` 输出脱敏摘要，**不会**打印密码哈希、Router 私钥 / control secret 或任何 provider / account token。

## 升级

Client 支持自升级；也可以手工换二进制：

```bash
sudo systemctl stop cc-switch-server
sudo curl -fsSL -o /usr/local/bin/cc-switch-server <release-url>
sudo chmod +x /usr/local/bin/cc-switch-server
sudo systemctl start cc-switch-server
```

数据目录不受影响。

## 延伸阅读

- [添加 Provider](/provider/add-provider) — 装完的下一步
- [自部署概览](/self-host/overview) — 想连自己的 Router
- [安全与边界](/reference/security)
