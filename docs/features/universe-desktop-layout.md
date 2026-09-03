# 三千世界桌面布局适配

最后更新：2026-09-03

> **personal 专属**：不提交上游，不在无明确要求时混入其他 PR。

---

## 功能概述

解决三千世界（新宇宙页 `NewUniversePage`）在桌面宽屏下出现的内容裁切、主页图标无法点击等问题。

---

## 涉及文件

- `Milvus/app.jsx`
- `Milvus/app.min.js`
- `Milvus/style.css`
- `index.html`（cache-buster 更新）
- `tests/universe-desktop-layout.test.js`

---

## 分支与 Commit

| 环境 | 分支 | Commit |
|------|------|--------|
| 布局裁切修复 | `fix/universe-desktop-layout` | `d57ba3e` |
| 点击层级修复 | 同分支 | `ae7c266` |
| personal | `personal` | 以上两个 commit |

---

## 历史问题与修复

### 问题 1：桌面右侧内容裁切

**根因链**：
```
transform ancestor
+ Portal host 仍位于受 max-width: 428px 限制的 #app-root
→ 虽然 Portal 逃离 .chat-detail-overlay 的 transform 作用域
→ 仍没有逃离 428px 容器
```

**修复**：
- Portal host（`t8-fullscreen-overlay-root`）移至 `msg-overlay` shell，成为 `#app-root` 的 sibling
- Desktop media query 释放 `#app-root` 的 `max-width` 约束

### 问题 2：主页所有图标无法点击

**根因**：
```
关闭状态的 msg-overlay / fullscreen overlay 仍参与 hit-testing
高 z-index 子元素恢复 pointer-events
```

**修复**：
- 关闭状态的 overlay：`pointer-events: none`
- 打开时才恢复 pointer-events
- fullscreen host 在 open 时才允许子项 hit-test

### 问题 3：msg-nav 被遮挡

**修复**：msg-nav 56px 安全区，确保三千世界不遮挡导航栏。

---

## 排查工具提示

`document.elementsFromPoint(x, y)` 是排查点击层级问题的重要浏览器工具。
出现图标点击失效时，优先用此方法检查坐标上方的层叠元素。

---

## 验证

```bash
node tests/universe-desktop-layout.test.js   # ok
```

验证内容：
- 三千世界顶层 Portal 挂载点
- 容器相对尺寸（非 100vw）
- 关闭状态 overlay pointer-events: none
- 立绘防拖拽约束

---

## 注意事项

每次同步上游更新后，必须重新运行 `tests/universe-desktop-layout.test.js`，确认本机适配没有丢失。
这是 personal 专属修改，不要在没有明确要求时混入上游 PR。
