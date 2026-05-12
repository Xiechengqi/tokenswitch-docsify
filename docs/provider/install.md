# 安装客户端

cc-switch 是一个跨平台桌面应用，用 Tauri 2 打的包。三大平台都有原生包。

## 系统要求

| 平台 | 最低版本 |
|---|---|
| Windows | Windows 10 |
| macOS | macOS 12（Monterey） |
| Linux | Ubuntu 22.04+ / Debian 11+ / Fedora 34+ 等主流发行版 |

## 下载

去 [GitHub Releases](https://github.com/Xiechengqi/cc-switch/releases) 找最新版本。

## Windows

下载 `CC-Switch-v{version}-Windows.msi`（推荐）或 `CC-Switch-v{version}-Windows-Portable.zip`（绿色版）。

msi 双击安装，portable 解压即用。

## macOS

**手动**：下载 `CC-Switch-v{version}-macOS.dmg`，拖到 Applications。

App 已 Apple 签名 + 公证，可以直接打开，不用绕过 Gatekeeper。

## Linux

按发行版选：

- `.deb`（Debian / Ubuntu）：`sudo dpkg -i CC-Switch-v{version}-Linux.deb`
- `.rpm`（Fedora / RHEL / openSUSE）：`sudo rpm -i CC-Switch-v{version}-Linux.rpm`
- `.AppImage`（通用）：`chmod +x CC-Switch-v{version}-Linux.AppImage && ./CC-Switch-v{version}-Linux.AppImage`

**Arch Linux**：

```bash
paru -S cc-switch-bin
```

**Flatpak**：官方 release 不带，按 [`flatpak/README.md`](https://github.com/Xiechengqi/cc-switch/tree/main/flatpak) 自己从 .deb 构。

## 数据存哪

```text
~/.cc-switch/
├── cc-switch.db          # SQLite，存所有供应商、MCP、prompts、skills
├── settings.json          # 设备级 UI 偏好
├── backups/               # 自动备份，保留最近 10 份
├── skills/                # Skills 安装目录
└── skill-backups/         # 卸载前自动备份的 skills，最近 20 份
```

卸载 cc-switch 不会删 `~/.cc-switch/`。CLI 工具的配置文件（如 `~/.claude.json`）也按 cc-switch 切换的最后状态保留，确保 CLI 还能正常用。

## 自动更新

启动后会检查更新，有新版本会提示。可以在设置里关掉。

## 升级风险

主要数据存在 SQLite，每次启动前自动备份到 `~/.cc-switch/backups/`。升级失败可以从备份恢复。

## 延伸阅读

- [添加供应商](/provider/add-provider) — 装完之后第一件事
- [快速开始](/provider/quickstart) — 端到端把 share 上架
