# PRODUCT.md — 产品级长期约束

最后更新：2026-09-03

本文件只记录能从代码和已有实现中明确验证的产品原则。
无法证明的内容写"待从现有实现进一步归档"，不猜测。

---

## 数据存储原则

**Local-first**：所有用户数据优先存储在本地浏览器中，不依赖云端同步。

已确认使用 IndexedDB 的数据：
- 头像（`avatarStore`）
- 设置（`settingsStore`）
- 聊天人物（`chatCharacterStore`）
- 消息历史（`chatHistoryStore`）
- 用户自定义表情（`emojiStore` / `EMOJIS` store）
- 心纸居角色立绘（`USER_SETTINGS/mansion_character_sprites`）

已确认使用 localStorage 的数据：
- 部分 UI 配置
- 用户身份与激活状态
- 心纸居入驻角色列表（`t8_mansion_active_ids`）
- 头像 fallback（`t8_mansion_custom_avatars`）

**设备临时状态**（电量、网络状态等）不得写入 IndexedDB 或 localStorage，每次页面打开时重新读取。

---

## 数据兼容约束

- 不在没有明确需求时升级 IndexedDB 版本
- 不建立意义重复的并行字段
- 修改前追踪完整数据流：输入 → 状态 → 保存 → 重载 → 展示

---

## 模块边界

- 心纸居角色清单（`t8_mansion_active_ids`）在角色永久删除时同步清理
- 心纸居入驻角色和传讯群聊角色是两套独立功能，不混改

---

## 待从现有实现进一步归档

- AI 角色 / 消息数据的跨模块共享边界
- 页面模块间的全局状态约束完整清单
- 用户数据备份 / 恢复机制（如有）
