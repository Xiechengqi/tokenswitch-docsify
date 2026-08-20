# TokenSwitch 系统文档

TokenSwitch 的系统级文档站，发布在 **[docs.tokenswitch.org](https://docs.tokenswitch.org)**。

官网 **[tokenswitch.org](https://tokenswitch.org)** ·
Client **[cc-switch-server](https://github.com/Xiechengqi/cc-switch-server)** ·
Router **[cc-switch-router](https://github.com/Xiechengqi/cc-switch-router)**

TokenSwitch 是一组开源工具，让手上有 AI 编程订阅额度的人和想用这些额度的人直接连接：
Share Owner 把订阅账号做成一个 Share，在上面开出拼车位；买家按天租一个位置，用自己的
Claude Code / Codex CLI / Gemini CLI 直连。没有代充、没有 API key 转卖、没有平台托管资金。

## 内容在哪

所有文档都在 `docs/`，`docs/_sidebar.md` 是目录。

| 入口 | 路径 |
| --- | --- |
| 架构与概念 | `docs/intro/` |
| 想用 token | `docs/share-market/` |
| 想出 token | `docs/provider/` |
| 想出/租主机 | `docs/client-market/` |
| 想自部署 | `docs/self-host/` |
| Router 控制台 | `docs/router/` |
| 名词、FAQ、环境变量 | `docs/reference/` |

## 本地预览

```bash
npx serve docs      # 或任意静态服务器，需支持目录 index
```

站点用 [docsify](https://docsify.js.org) 渲染（本仓库 fork 自 docsify，运行时资产自托管在
`docs/vendor/`，见 `docs/vendor/VERSIONS.txt`）。路由是 history 模式，因此本地预览需要一个
会把未知路径回落到 `index.html` 的服务器；线上由 `tools/build-docs-site.mjs` 为每个页面生成
真实的目录 index，避免 GitHub Pages 用 404 状态码回落。

## 校验与发布

```bash
node tools/check-docs.mjs        # 侧边栏覆盖、死链、下线页引用
node tools/build-docs-site.mjs   # 生成 _site/（含 sitemap.xml、robots.txt）
```

push 到 `main` / `develop` 后由 `.github/workflows/deploy-docs.yml` 自动发布到 `gh-pages`。
