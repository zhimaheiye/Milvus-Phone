# AGENTS.md — Agent 上手指南与文档地图

最后更新：2026-10-03

## 你是谁，在做什么

你正在协助维护 **Milvus-Phone** 项目。这是一个以 React 为核心的手机界面模拟应用，没有构建工具，浏览器直接加载 `Milvus/app.min.js`。

这是一个个人 Fork（`zhimaheiye/Milvus-Phone`），上游为 `anima97833/Milvus-Phone`。
仓库同时维护：
- 向上游提交的公共功能（走 PR 流程）
- 仅属于个人日常使用的本地适配（不向上游提交）

---

## 长期分支约定

| 分支 | 用途 |
|------|------|
| `main` | 上游同步基线，保持与 `upstream/main` 一致，不混入个人专用修改 |
| `personal` | **日常运行主线**，包含所有已验证的公共功能 + 个人适配 |
| `work/xxx` | 从 `personal` 开出的开发工作区，完成后 cherry-pick 回 `personal` |
| `pr/xxx` | 从 `upstream/main` 开出，只含该功能的干净 commit，用于向上游 PR |

**本地开发时停留在 `personal`**。向上游提交 PR 时，单独开 `pr/xxx` 分支。

### 工作流示意

```
personal
   ↓  开 work/xxx 开发+测试
   ↓  cherry-pick 回 personal

        如果要给上游：
upstream/main → pr/xxx → 只有该功能 commit → PR
```

---

## 关键文件速查

| 文件 | 说明 |
|------|------|
| `index.html` | 页面入口，控制脚本加载顺序和 cache-buster |
| `Milvus/app.jsx` | 主要 React 源码（人类可读） |
| `Milvus/app.min.js` | **浏览器实际加载**，必须与 app.jsx 同步修改 |
| `Milvus/db.js` | IndexedDB 初始化与全局存储接口 |
| `Milvus/style.css` | 全局样式 |
| `Milvus/vendor/phosphor-icons/` | 本地 Phosphor 图标（personal 专属，不提交上游） |
| `sw.js` | Service Worker，含 Phosphor 字体预缓存 |
| `tests/*.test.js` | Node 静态契约测试，功能完成后必须全部通过 |

---

## 接手任务前必读顺序

1. `AGENTS.md`（本文件）：确认分支和协作边界
2. `docs/handoff/CURRENT.md`：了解**此刻**的进行状态
3. `PRODUCT.md`：产品级长期约束
4. `docs/features/<功能名>.md`：当前任务相关功能历史
5. `local-docs/PROJECT_STRUCTURE.md`：文件职责与数据流
6. `index.html`：确认资源入口和缓存版本
7. `Milvus/app.jsx`：用 rg 按关键词定位业务代码

---

## 功能文档索引

| 文档 | 功能 | 状态 |
|------|------|------|
| `docs/features/batch-image-import.md` | 表情包批量图片导入 | PR #2 已合并上游 |
| `docs/features/calendar-layout-polish.md` | 日历年份选择器 + 任务卡操作层 | 已合入 personal；PR #4 待上游合并 |
| `docs/features/device-battery.md` | 动态读取设备电量 | 已合入 personal；上游 PR 待 #4 结果后决定 |
| `docs/features/phosphor-local-assets.md` | Phosphor 图标本地化 | personal 专属；不提交上游 |
| `docs/features/universe-desktop-layout.md` | 三千世界桌面适配 | personal 专属；不提交上游 |

旧功能记录见 `local-docs/CHANGELOG.md`：
- 头像双来源 → PR #1（已合并上游）
- 心纸居角色清理 → PR #3（Open）

---

## 完成任务后必须做的事

1. 更新 `docs/features/<功能名>.md`（追加 Debug 日志、更新 commit SHA）
2. 更新 `docs/handoff/CURRENT.md`
3. 任务完全结束时，清空 CURRENT.md 的"进行中"部分
4. 新建 feature 文档时，更新本文件的"功能文档索引"

禁止命名：`docs/fix-xxx.md`、`docs/new-fix-final.md`、`docs/bug-note2.md`。
同一功能的所有历史永远回到同一个 feature 文件。

---

## 基本代码约束

- `app.jsx` 和 `app.min.js` 必须同步修改
- 修改 `app.min.js` 或 `style.css` 后必须更新 `index.html` 的 `?v=` cache-buster
- 设备临时状态（电量、网络）不得写入 IndexedDB 或 localStorage
- 不在没有明确需求时升级 IndexedDB 版本或建立并行字段

运行测试：
```
node tests/batch-image-import.test.js
node tests/device-battery.test.js
node tests/calendar-layout-polish.test.js
node tests/phosphor-local-assets.test.js
node tests/universe-desktop-layout.test.js
node --check Milvus/app.min.js
```

---

## 协作与本机操作边界

- 代码实现完成后，默认只做代码级验证（单元/契约测试、语法检查、lint、构建等）；除非用户在当前任务明确要求，否则不由 Agent 进行浏览器 UI、可视化或交互测试。功能体验由用户自行完成并反馈。
- 涉及 GitHub 登录、2FA、账号设置或必须由账号本人确认的网页操作时，Agent 只提供逐步指引；用户在自己已经登录的浏览器中操作。不要索取密码、验证码或恢复码。
- 面向 `anima97833/Milvus-Phone` 的 PR，标题和正文默认使用中文；公开创建前核对 base/head 仓库、分支与实际 diff。
- 创建 PR 用的 commit 在推送前要确认作者身份会映射到用户期望的 GitHub 账号；项目文档不要记录私人邮箱等账号标识。
- `run.bat`、`local-docs/` 等只属于本机的辅助文件或个人文档，优先通过本仓库的 `.git/info/exclude` 排除，不要仅为个人忽略需求修改会随 PR 提交的 `.gitignore`。只有确实应由所有贡献者共享的忽略规则才进入 `.gitignore`。
- 注册码、Token、Cookie、密码等凭据不得进入 commit、PR 描述或项目文档。

## 向上游提交 PR 前的检查清单

- PR 分支基于 upstream/main，不基于 personal
- `git diff --name-only upstream/main...HEAD` 只包含该功能文件
- diff 中没有 `vendor/phosphor-icons`、三千世界适配、个人 cache-buster 差异
- `node --check Milvus/app.min.js` 通过
- 所有相关契约测试通过
- 不 force push
