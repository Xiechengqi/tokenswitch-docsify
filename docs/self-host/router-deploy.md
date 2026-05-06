# 部署 router

cc-switch-router 是一个 Rust 单二进制，部署很简单：下载、放配置、起 systemd。

## 准备

- 一台 Linux 服务器（Ubuntu 22.04+ 推荐）
- 一个域名，DNS 指过来（推荐通过 Cloudflare）
- 已经配好 wildcard 子域，参考 [域名与 TLS](/self-host/dns-tls)
- 一个 Resend API key（发邮箱验证码用，没有也能跑但登录功能不可用）

## 1. 下载二进制

```bash
sudo wget \
  https://github.com/xiechengqi/cc-switch-router/releases/download/latest/cc-switch-router-linux-amd64 \
  -O /usr/local/bin/cc-switch-router
sudo chmod +x /usr/local/bin/cc-switch-router
```

## 2. 写配置

第一次启动会自动生成默认配置到 `~/.config/cc-switch-router/.env`。也可以提前写好：

```bash
mkdir -p ~/.config/cc-switch-router
cat > ~/.config/cc-switch-router/.env <<'EOF'
CC_SWITCH_ROUTER_API_ADDR=0.0.0.0:80
CC_SWITCH_ROUTER_SSH_ADDR=0.0.0.0:2222
CC_SWITCH_ROUTER_TUNNEL_DOMAIN=tokenswitch.cc
CC_SWITCH_ROUTER_USE_LOCALHOST=false
CC_SWITCH_ROUTER_RESEND_API_KEY=re_xxx
CC_SWITCH_ROUTER_RESEND_FROM=TokenSwitch <noreply@tokenswitch.cc>
EOF
```

把 `tokenswitch.cc` 换成你的域名，把 Resend key 填上。

> 完整环境变量列表见 [router 环境变量](/reference/router-env)。

## 3. 跑起来试试

先前台跑一下确认无报错：

```bash
cc-switch-router
```

新开一个终端验证：

```bash
curl http://127.0.0.1/v1/healthz
# {"ok":true}
```

OK 就 Ctrl-C 停掉，转 systemd。

## 4. systemd 部署

```bash
sudo mkdir -p /opt/cc-switch-router
sudo cp /usr/local/bin/cc-switch-router /opt/cc-switch-router/

sudo tee /etc/systemd/system/cc-switch-router.service > /dev/null <<'EOF'
[Unit]
Description=cc-switch-router
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/cc-switch-router
Environment=HOME=/root
EnvironmentFile=/root/.config/cc-switch-router/.env
ExecStart=/opt/cc-switch-router/cc-switch-router
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now cc-switch-router
sudo systemctl status cc-switch-router
```

绑 80 端口需要 root 或 cap_net_bind_service。

## 5. 验证

```bash
curl https://tokenswitch.cc/v1/healthz
```

返回 `{"ok":true}` 说明 HTTPS（Cloudflare）→ HTTP（router）链路通了。

浏览器打开 `https://tokenswitch.cc/`，看到 router dashboard，没有 share 是正常的。

## 6. 邮箱登录测试

如果配了 Resend：

1. dashboard 点登录
2. 填一个真实邮箱
3. 收到验证码 → 输回去 → 登录成功

收不到看 Resend 后台日志，多半是 from 域名没在 Resend 验证。

## 升级

GitHub Actions 每次 main 分支提交都会更新 `latest` Release。升级步骤：

```bash
sudo systemctl stop cc-switch-router
sudo wget \
  https://github.com/xiechengqi/cc-switch-router/releases/download/latest/cc-switch-router-linux-amd64 \
  -O /opt/cc-switch-router/cc-switch-router
sudo chmod +x /opt/cc-switch-router/cc-switch-router
sudo systemctl start cc-switch-router
```

SQLite 的 schema 是自动迁移的，不需要手动操作。

## 数据存哪

```text
~/.config/cc-switch-router/
├── .env                              # 配置
├── cc-switch-router.db               # SQLite，所有 share/lease/session
└── ssh_host_ed25519_key              # SSH host key
```

备份这一整个目录就够了。

## 调日志

```bash
sudo systemctl edit cc-switch-router
```

加：

```ini
[Service]
Environment="RUST_LOG=debug"
```

重启服务生效。

## 延伸阅读

- [部署 market](/self-host/market-deploy) — router 跑通后的下一步
- [router 环境变量](/reference/router-env) — 全量配置参考
- [域名与 TLS](/self-host/dns-tls) — wildcard 子域怎么配
