# 添加供应商

cc-switch 把"一个 token + 一个端点 + 一些可选配置"打包叫做"供应商"（provider）。先有供应商，才能启用 share。

## 两种供应商

**应用专属供应商**：只对一个 CLI 工具生效（Claude Code / Codex / Gemini CLI / OpenCode / OpenClaw 五选一）。

**统一供应商**：一份配置同步到多个应用。OpenCode 和 OpenClaw 共用一份配置时常见。

新手先选应用专属，简单。

## 用预设添加

预设是预先配置好的模板，只需要填 API key。

### 步骤

1. 主界面右上角点 **+**
2. 选一个预设：比如 "Claude 官方"、"PackyCode"、"DeepSeek" 等
3. 名称和端点自动填好
4. 填上你的 API key
5. （可选）填备注
6. 点"添加"

### 当前预设举例

cc-switch 内置 50+ 预设，覆盖：

- **Claude 系**：Claude 官方、DeepSeek、智谱 GLM、Kimi、ModelScope、PackyCode、AICodeMirror 等
- **Codex 系**：OpenAI 官方、各种中转
- **Gemini 系**：Gemini 官方、各种中转
- **聚合服务**：DMXAPI、SiliconFlow、AiHubMix 等

完整列表以客户端 UI 为准（会随版本更新）。

## 自定义供应商

预设里没有的，选"自定义"：

1. 自己填名称
2. 填上游 API base URL
3. 填 API key
4. （某些场景下）填模型映射、自定义 header

适合企业内部网关、自建中转服务。

## 切换

- **主界面**：选中某个供应商，点"启用"
- **系统托盘**：右键托盘图标，直接选供应商，立即生效

切换后大多数 CLI 需要重启终端。**Claude Code 例外**，支持热切换无需重启。

## 编辑 / 删除

供应商卡片右上角有齿轮图标，可以编辑或删除。

⚠️ 当前激活的供应商不能删除。先切到别的再删。这是为了保证 CLI 工具任何时候都有一份可用配置。

## 共享配置片段

不同供应商之间常有共同配置（代理设置、自定义 header、插件配置等）。cc-switch 提供"共享配置片段"机制：

1. 在某个供应商的"编辑"里 → "共享配置面板"
2. 点"从当前供应商提取"
3. 添加新供应商时勾选"写入共享配置"

这样切换供应商时插件配置不会丢。

## 排序 / 导入导出

- 拖拽排序
- 顶部菜单 → "导入" / "导出" 整套配置

适合换电脑或备份。

## 延伸阅读

- [启用 share](/provider/share) — 把供应商挂到市场
- [MCP / Skills / Prompts](/provider/extras) — cc-switch 的其他功能
