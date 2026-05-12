# 更新历史

详细更新记录见各项目仓库 Releases：

- **cc-switch（客户端）**：[Releases](https://github.com/Xiechengqi/cc-switch/releases) · [CHANGELOG.md](https://github.com/Xiechengqi/cc-switch/blob/main/CHANGELOG.md)
- **cc-switch-router**：[Releases](https://github.com/xiechengqi/cc-switch-router/releases)
- **cc-switch-market**：Release 页（待建）

## 文档站本身

文档站的更新走 GitHub commits，在每篇文章底部"编辑此页"链接里能看到该页历史。

跨项目的重大改动会单独在这里记一笔。

## 重大变更

（此处记录会影响用户使用方式的破坏性变更）

- _暂无_

## 兼容性

- cc-switch 客户端：能向后兼容旧版 router（只用旧版接口的子集）
- router：版本之间 SQLite 自动迁移
- market：版本之间 SQLite/Turso 自动迁移
- API 用户：OpenAI / Anthropic 兼容协议保持稳定，模型可用性以 `/pricing` 页为准

## 延伸阅读

- [相关链接](/reference/links) — 三个项目的仓库地址
