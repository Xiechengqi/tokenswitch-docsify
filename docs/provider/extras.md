# MCP / Skills / Prompts

cc-switch 不只是出 token 的工具，它本身就是一个 CLI 工具的"配置中枢"。除了供应商管理，还顺带管 MCP、Skills、Prompts、Sessions。这些功能跟出不出 token 没关系，纯粹是用 CLI 的人自己用。

## MCP

MCP（Model Context Protocol）是 Claude / Codex / Gemini 等 CLI 工具调用外部能力的标准协议。比如让 Claude 能访问你的 Notion、Linear、Slack。

在 cc-switch 里：

- 一个 MCP 面板管 4 个应用（Claude Code、Codex、Gemini CLI、OpenClaw）的 MCP 服务器
- 双向同步：在 cc-switch 改了 → 推到 CLI 配置文件；CLI 配置文件改了 → 自动回填
- 支持 [Deep Link](#deep-link) 一键导入

操作：主界面顶部 "MCP" → "添加 MCP" → 用模板或自定义。

## Prompts

跨 CLI 的系统提示词（CLAUDE.md / AGENTS.md / GEMINI.md）的统一管理。

- Markdown 编辑器
- 创建多个预设
- 切换预设时同步到对应 CLI 工具
- 回填保护：本地文件改了不会被覆盖

适合做：项目模板、团队规范、个人偏好预设。

## Skills

Skills 是从 GitHub 仓库或 ZIP 文件一键安装的能力包。

- 浏览支持的仓库列表
- 一键安装到所有 CLI 工具
- 默认用 symlink，节省空间；也可改成文件复制
- 卸载前自动备份到 `~/.cc-switch/skill-backups/`

## Sessions

会话历史浏览器。

- 跨所有 CLI 工具（Claude Code、Codex、Gemini CLI 等）查看历史对话
- 全文搜索
- 恢复某次对话继续聊

数据来源是各 CLI 工具本地的 session 文件，cc-switch 只读不写。

## Workspace（OpenClaw 专用）

OpenClaw 用的 agent 文件（AGENTS.md、SOUL.md 等）的可视化编辑器，带 Markdown 预览。其他 CLI 用不到。

## Deep Link

cc-switch 注册了 `ccswitch://` 协议，可以通过 URL 直接导入：

- 供应商
- MCP 服务器
- Prompts
- Skills

你只要点一个 `ccswitch://...` 链接，cc-switch 自动弹窗确认导入。这是 Provider 之间分享配置的常见方式。

## 跟 share 的关系

这些功能都跟 share、router、market 没关系，纯粹是给 CLI 工具用户的本地工具。

但如果你既是 Provider 又是 API 用户（自己也用 CLI），这些功能能让你在切换"本地 CLI 用哪个供应商"时不用动 share 配置。

## 延伸阅读

cc-switch 主项目有更详细的[用户手册](https://github.com/farion1231/cc-switch/tree/main/docs/user-manual/zh)，特性更新比这里更频繁。本文档站只覆盖跟 share / market 相关的部分。
