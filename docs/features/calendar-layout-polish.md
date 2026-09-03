# 日历年份选择器优化与任务卡操作层修复

最后更新：2026-09-03

## 功能概述

将日历页面的年份/月份选择交互改为内嵌式选择器，修复任务卡操作层默认泄露问题，以及今日日期高亮消失问题。

---

## 涉及文件

- `Milvus/app.jsx`
- `Milvus/app.min.js`
- `Milvus/style.css`
- `index.html`（cache-buster 更新）
- `tests/calendar-layout-polish.test.js`

---

## 分支与 Commit

| 环境 | 分支 | Commit |
|------|------|--------|
| 功能开发 | `pr/calendar-layout-polish` | `9816c02`, `3f7cc53`（rebase 后） |
| 上游 PR | `pr/calendar-layout-polish` | PR #4 → `anima97833/Milvus-Phone` |
| personal | `personal` | cherry-pick 自 fix/calendar-layout-polish |

---

## 修复历史

### 问题 1：年份/月份选择器 UI 突兀

**根因**：原有设计展开时出现大型设置卡片，占用过多屏幕空间且视觉割裂。

**修复**：将选择器改为日历页内嵌式布局，与日历主体视觉统一。

### 问题 2：caret 箭头位移

**根因**：原先使用两个不同字符分别表示展开/收起（▶ 和 ▼），字符宽度差异导致相邻文字抖动。

**修复**：改为单一 caret（▶），收起时朝右，展开时通过 CSS `rotate(90deg)` 朝下，避免字符切换造成的位置变化。

### 问题 3：展开/收起时顶部区域轻微位移

**根因**：年份选择器高度变化通过 flex 传导，导致顶部月份、农历说明和头像行也随之位移。

**修复**：调整 flex 结构，只让选择器下方的日历内容区自然下推，顶部固定区域不参与高度计算。

### 问题 4：任务卡操作层默认泄露

**根因**：
```
.calendar-task-card actions height: 100%
白卡 margin 区透明 → 底层 actions 露出
```

**修复**：
- 间距只交给 wrapper；
- card `margin: 0`；
- card `width` / `flex` / `z-index` 完整遮罩底层 actions。

### 问题 5：切换分类/年份/月份时操作栏残留

**根因**：切换时未重置滑动状态，已展开的操作栏保持显示。

**修复**：在切换任务分类、年份、月份时重置任务卡滑动状态。

### 问题 6：今日日期高亮消失

**根因**：
```
inline backgroundColor: transparent
```
覆盖了 `.circle-today` 的样式规则。

**修复**：无自定义颜色时，不再注入该 inline background 属性。

---

## 验证

```bash
node tests/calendar-layout-polish.test.js   # ok
node --check Milvus/app.min.js              # syntax ok
```

实机浏览器验证：
- 年份/月选择器展开与切换正常
- 展开/收起时顶部区域保持静止
- caret 仅旋转、不改变字符
- 任务卡操作层默认完全隐藏，左滑后正常显示
- 今日日期高亮正常

---

## 上游 PR 状态

PR #4 → `anima97833/Milvus-Phone`，目标 `main`。
状态：Open（上次确认 2026-09-03，不实时联网验证）。
