# Phosphor 图标本地化

最后更新：2026-09-03

> **personal 专属**：不提交上游，不在无明确要求时混入其他 PR。

---

## 功能概述

将 Phosphor Icons 从外部 CDN 改为本地 vendor 文件，解决字体请求失败导致图标显示为方框的问题。

---

## 涉及文件

- `Milvus/vendor/phosphor-icons/bold/style.css`（及 woff2）
- `Milvus/vendor/phosphor-icons/fill/style.css`（及 woff2）
- `Milvus/vendor/phosphor-icons/duotone/style.css`（及 woff2）
- `Milvus/vendor/phosphor-icons/LICENSE`
- `index.html`（改用本地 CSS）
- `sw.js`（预缓存 CSS / WOFF2）
- `tests/phosphor-local-assets.test.js`

---

## 故障根因

```
原 index.html：
unpkg @phosphor-icons/web → 动态注入 jsDelivr CSS → 外部 Phosphor-Bold.woff2

字体请求失败：
document.fonts → Phosphor-Bold status: error

表现：聊天详情 Phosphor 图标出现缺字方框
```

---

## 修复

```
vendor 化 @phosphor-icons/web@2.1.2：
Milvus/vendor/phosphor-icons/{bold,fill,duotone}/

index.html 改为：
<link rel="stylesheet" href="Milvus/vendor/phosphor-icons/bold/style.css?v=2.1.2" />
<link rel="stylesheet" href="Milvus/vendor/phosphor-icons/fill/style.css?v=2.1.2" />
<link rel="stylesheet" href="Milvus/vendor/phosphor-icons/duotone/style.css?v=2.1.2" />

sw.js 预缓存以上 CSS 和 WOFF2 文件
```

---

## 验证

```bash
node tests/phosphor-local-assets.test.js   # ok
```

实机浏览器：`document.fonts` 中 `Phosphor-Bold` 状态为 `loaded`。

---

## 注意事项

这是 personal 基础设施修改，不要在没有明确要求时把它混入其他上游 PR。
