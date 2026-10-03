# 表情包批量图片导入

最后更新：2026-10-03

> **公共功能**：已通过上游 PR #2 合并到 `anima97833/Milvus-Phone`。

---

## 功能概述

将原先一次只能添加一张本地图片或一个网络链接的表情包导入入口，升级为统一的批量图片导入界面，同时保持原有数据结构和本地优先存储方式。

---

## 正式历史

| 项目 | Commit |
|------|--------|
| 功能提交 | `73ad961c2101ee38c4e485d99aee7d83650ee1f5` — `feat: 支持图片批量导入` |
| 上游合并 | `1fc74691aa3380ddabf49de7ba5020fb8af7aac2` — Merge PR #2 |

PR #2 于 2026-08-23 合并。当前 `personal` 分支仍保留该实现和回归测试。

---

## 本地图片导入

- 文件选择器使用 `accept="image/*"` 和 `multiple`。
- 支持桌面文件选择器以及 Android / iOS 系统相册提供的多选结果。
- 文件通过 `FileReader` 转成 Data URL 后继续保存到现有 `EMOJIS` store。
- 批次按顺序逐张读取，避免大量高清图片同时解码造成瞬时内存压力；`tests/batch-image-import.test.js` 锁定最大读取并发为 1。
- 单张读取或保存失败只计为该项失败，不中断后续图片。
- 文件选择处理完成后会重置 input，使用户可以连续选择同一个文件再次导入。

---

## 网络图片导入

支持一次粘贴多行内容。当前解析规则：

```text
https://example.com/image.jpg
描述文字 https://example.com/image.jpg
```

- 每一行取最后一个 HTTP(S) URL。
- URL 前面的文字作为表情名称保存。
- 没有合法 HTTP(S) URL 的行直接忽略。
- 网络图片保存原始 URL，不下载后转成 Base64。
- 批次逐项保存；某一条失败不会终止其他条目。
- 只有至少一条保存成功时才清空 URL 输入；如果整批全部失败，保留用户原输入，便于修改或重试。
- 2026-08-23 的实现审查曾将解析从 `matchAll` 改为 `match`，避免为这一功能额外依赖较新的字符串迭代 API；当前实现仍保持这一选择。

---

## 写入失败必须可观察

批量导入依赖每一项的真实成功 / 失败计数，因此 `emojiStore.save()` 对 IndexedDB `put` 失败必须 reject，而不能静默当作成功。

当前 `Milvus/db.js` 已在表情写入的 `request.onerror` 中 reject。不要把这里改回“失败也 resolve”，否则 UI 会把真实保存失败误计为成功。

---

## 状态反馈

- 导入时显示当前进度。
- 完成后显示成功数和失败数。
- 导入期间禁用相关提交入口，避免重复写入。
- 批次完成后重新读取表情列表，因此新导入内容无需刷新页面即可出现。

---

## 数据兼容边界

- 继续使用现有 `EMOJIS` IndexedDB store。
- 本地图片继续保存为 Data URL。
- 网络图片继续保存 HTTP(S) URL。
- 不新增数据库、对象仓库或云同步机制。
- 不新增平行表情数据结构。

---

## 验证

```bash
node --check Milvus/app.min.js
node --check Milvus/db.js
node --check tests/batch-image-import.test.js
node tests/batch-image-import.test.js
```

回归测试至少覆盖：
- 裸 URL 与“描述 + URL”两种输入；
- 无效行过滤；
- 网络批次部分失败后继续；
- 本地批次部分失败后继续；
- 本地图片顺序读取（最大并发 1）。
