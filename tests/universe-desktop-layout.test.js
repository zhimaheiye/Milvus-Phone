const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const appSource = fs.readFileSync(
  path.join(__dirname, "..", "Milvus", "app.min.js"),
  "utf8",
);
const styleSource = fs.readFileSync(
  path.join(__dirname, "..", "Milvus", "style.css"),
  "utf8",
);

const universeStart = appSource.indexOf("const NewUniversePage =");
const universeEnd = appSource.indexOf("const BellsPage =", universeStart);
const universeSource = appSource.slice(universeStart, universeEnd);
const bellsEnd = appSource.indexOf("const ActivitySelectionPage =", universeEnd);
const bellsSource = appSource.slice(universeEnd, bellsEnd);
const overlayCss = styleSource.match(/\.vn-overlay\s*\{([^}]+)\}/)?.[1] || "";
const spriteCss = styleSource.match(/\.vn-sprite\s*\{([^}]+)\}/)?.[1] || "";

assert.ok(universeStart >= 0 && universeEnd > universeStart, "找不到三千世界组件");
assert.ok(
  /id:\s*"t8-fullscreen-overlay-root"/.test(appSource),
  "缺少顶层覆盖层挂载点",
);

// 1. T8Page 重新以 #app-root 为单根，不由 T8Page 创建 fullscreen host
const t8PageStart = appSource.indexOf("const T8Page =");
const t8PageEnd = appSource.indexOf("const APISettingsPage =", t8PageStart);
const t8PageSource = appSource.slice(t8PageStart, t8PageEnd);

assert.doesNotMatch(
  t8PageSource,
  /id:\s*"t8-fullscreen-overlay-root"/,
  "T8Page 内部不再创建 t8-fullscreen-overlay-root",
);
assert.match(
  t8PageSource,
  /return\s+\/\*.*?React\.createElement\(\s*["']div["'],\s*\{\s*id:\s*["']app-root["']/,
  "T8Page 重新恢复以 #app-root 为单根",
);

// 2. fullscreen host 在 MasterApp 的 .msg-overlay 中，与 #app-root 为兄弟节点
assert.match(
  appSource,
  /className:\s*`msg-overlay[\s\S]*?id:\s*"t8-fullscreen-overlay-root"[\s\S]*?React\.createElement\(T8Page/,
  "fullscreen overlay host 必须挂载在 MasterApp 的 .msg-overlay 壳层中，与 T8Page(#app-root) 保持平级",
);

// 3. 不允许再次把 t8-fullscreen-overlay-root 创建为 #app-root 的子节点
assert.doesNotMatch(
  t8PageSource,
  /id:\s*"app-root"[\s\S]*?id:\s*"t8-fullscreen-overlay-root"/,
  "不允许把 t8-fullscreen-overlay-root 创建为 #app-root 的子节点",
);

// 3. React Portal 挂载到独立 host
assert.match(bellsSource, /ReactDOM\.createPortal/, "三千世界没有脱离聊天详情变换层");

// 4. 现有事件隔离仍保留
assert.match(universeSource, /onPointerDown:\s*stopUniverseEvent/);
assert.match(universeSource, /onPointerMove:\s*stopUniverseEvent/);
assert.match(universeSource, /onPointerUp:\s*stopUniverseEvent/);
assert.match(universeSource, /onTouchStart:\s*stopUniverseEvent/);
assert.match(universeSource, /onTouchMove:\s*stopUniverseEvent/);
assert.match(
  universeSource,
  /const handleUniverseClick = \(e\) => \{\s*e\.stopPropagation\(\);\s*handleNextLine\(\);/,
  "点击推进剧情时必须先隔离聊天详情层事件",
);
assert.match(universeSource, /draggable:\s*false/);
assert.match(universeSource, /maxWidth:\s*"100%"/);

// 5. VN overlay 继续没有 100vw
assert.match(overlayCss, /position:\s*absolute/);
assert.match(overlayCss, /inset:\s*0/);
assert.match(overlayCss, /width:\s*100%/);
assert.match(overlayCss, /height:\s*100%/);
assert.doesNotMatch(overlayCss, /100vw/);
assert.doesNotMatch(spriteCss, /100vw/);

// 6. 默认规则保留 #app-root max-width: var(--max-width)，保证手机布局
assert.match(
  styleSource,
  /\.msg-overlay\s+#app-root\s*\{[^}]*max-width:\s*var\(--max-width\)/,
  "默认规则必须保留 #app-root max-width: var(--max-width) 保证手机端布局",
);

// 7. 存在桌面媒体查询，在 hover:hover + pointer:fine 环境下将 #app-root max-width 放开
assert.match(
  styleSource,
  /@media\s*\(\s*min-width:\s*429px\s*\)\s*and\s*\(\s*hover:\s*hover\s*\)\s*and\s*\(\s*pointer:\s*fine\s*\)\s*\{[\s\S]*?\.msg-overlay\s+#app-root\s*\{[\s\S]*?max-width:\s*none;[\s\S]*?width:\s*100%;/i,
  "必须包含桌面端媒体查询放开 .msg-overlay #app-root 宽度限制",
);

// 8. .msg-overlay 关闭时 pointer-events: none，打开时 pointer-events: auto
assert.match(
  styleSource,
  /\.msg-overlay\s*\{[\s\S]*?pointer-events:\s*none;/,
  ".msg-overlay 默认必须 pointer-events: none 防止桌面遮挡",
);
assert.match(
  styleSource,
  /\.msg-overlay\.open\s*\{[\s\S]*?pointer-events:\s*auto;/,
  ".msg-overlay.open 必须恢复 pointer-events: auto",
);

// 9. fullscreen root 及其子元素默认 pointer-events: none，仅在 .msg-overlay.open 时子元素允许 auto
assert.match(
  styleSource,
  /\.msg-overlay\s+#t8-fullscreen-overlay-root\s*>\s*\*\s*\{[\s\S]*?pointer-events:\s*none;/,
  "fullscreen root 子元素默认必须 pointer-events: none",
);
assert.match(
  styleSource,
  /\.msg-overlay\.open\s+#t8-fullscreen-overlay-root\s*>\s*\*\s*\{[\s\S]*?pointer-events:\s*auto;/,
  "只有在 .msg-overlay.open 时 fullscreen root 子元素才允许 pointer-events: auto",
);

// 10. 统一导航高度变量，fullscreen host 顶部留出导航栏高度
assert.match(
  styleSource,
  /--msg-nav-h:\s*56px;/,
  "必须定义统一导航高度变量 --msg-nav-h",
);
assert.match(
  styleSource,
  /\.msg-nav\s*\{[\s\S]*?height:\s*var\(--msg-nav-h/i,
  ".msg-nav 必须使用 --msg-nav-h 变量",
);
assert.match(
  styleSource,
  /\.msg-overlay\s+#t8-fullscreen-overlay-root\s*\{[\s\S]*?top:\s*var\(--msg-nav-h\);/,
  "fullscreen root 顶部必须避开标题栏 top: var(--msg-nav-h)",
);

console.log("universe desktop layout contract: ok");
