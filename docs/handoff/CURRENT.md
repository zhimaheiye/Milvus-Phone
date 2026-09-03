# CURRENT.md — 当前进行状态

> 此文件只记录"此刻"，任务结束后必须更新或清空。不承担长期 changelog。

最后更新：2026-09-03

---

## 当前日常分支

`personal`

HEAD：`2f00086f504e387aa1f47b16669410a567e879be`

---

## personal 当前包含的功能

| 功能 | 状态 |
|------|------|
| 三千世界桌面适配 | 已合入，personal 专属 |
| Phosphor 图标本地化 | 已合入，personal 专属 |
| 日历年份选择器优化 + 任务卡操作层修复 | 已合入 personal；PR #4 待上游 |
| 动态读取设备电量（fallback 85%） | 已合入 personal；上游 PR 待决定 |

---

## 上游 PR 状态

| PR | 功能 | 目标 | 状态 |
|----|------|------|------|
| PR #4 | fix(calendar): 优化年份选择交互并修复任务卡操作层显示 | anima97833/main | Open（上次确认 2026-09-03） |
| PR #3 | fix: 清理已删除角色的心纸居残留引用 | anima97833/main | Open（上次确认 2026-09-01） |

---

## 下一决策点

等待日历 PR #4 有结果（merged / changes requested / closed）：
- merged → 可以开始准备 device-battery 的上游 PR
- changes requested → 根据反馈决定是否修改
- closed → 重新评估策略

---

## 进行中的任务

暂无。当前文档整理已完成。
