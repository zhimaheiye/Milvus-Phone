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
assert.match(bellsSource, /ReactDOM\.createPortal/, "三千世界没有脱离聊天详情变换层");
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

assert.match(overlayCss, /position:\s*absolute/);
assert.match(overlayCss, /inset:\s*0/);
assert.match(overlayCss, /width:\s*100%/);
assert.match(overlayCss, /height:\s*100%/);
assert.doesNotMatch(overlayCss, /100vw/);
assert.doesNotMatch(spriteCss, /100vw/);

console.log("universe desktop layout contract: ok");
