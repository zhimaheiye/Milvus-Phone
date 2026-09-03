const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.join(__dirname, '..');
const appJsx = fs.readFileSync(path.join(rootDir, 'Milvus', 'app.jsx'), 'utf8');
const appMin = fs.readFileSync(path.join(rootDir, 'Milvus', 'app.min.js'), 'utf8');

// 1. DEFAULT_BATTERY_LEVEL = 85
assert.match(appJsx, /const\s+DEFAULT_BATTERY_LEVEL\s*=\s*85;/, 'app.jsx 必须定义 DEFAULT_BATTERY_LEVEL = 85');
assert.match(appMin, /const\s+DEFAULT_BATTERY_LEVEL\s*=\s*85;/, 'app.min.js 必须定义 DEFAULT_BATTERY_LEVEL = 85');

// 2. batteryLevel 初始状态来自 DEFAULT_BATTERY_LEVEL
assert.match(appJsx, /const\s*\[batteryLevel,\s*setBatteryLevel\]\s*=\s*useState\(DEFAULT_BATTERY_LEVEL\);/, '初始状态必须使用 DEFAULT_BATTERY_LEVEL');
assert.match(appMin, /const\s*\[batteryLevel,\s*setBatteryLevel\]\s*=\s*useState\(DEFAULT_BATTERY_LEVEL\);/, 'app.min.js 初始状态必须使用 DEFAULT_BATTERY_LEVEL');

// 3. 使用 navigator.getBattery 特性检测与调用
assert.match(appJsx, /typeof\s+navigator\.getBattery\s*!==?\s*["']function["']/, '必须具备 navigator.getBattery 特性检测');
assert.match(appJsx, /navigator\.getBattery\(\)/, '必须调用 navigator.getBattery()');

// 4. 使用 Math.round(battery.level * 100) 并做有效性校验
assert.match(appJsx, /Math\.round\(\s*battery\.level\s*\*\s*100\s*\)/, '必须使用 Math.round(battery.level * 100)');
assert.match(appJsx, /Number\.isFinite\(level\)/, '必须检查 Number.isFinite(level)');

// 5. 注册 levelchange 事件并在 cleanup 时 removeEventListener
assert.match(appJsx, /battery\.addEventListener\(\s*["']levelchange["'],\s*updateBatteryLevel\s*\)/, '必须监听 levelchange 事件');
assert.match(appJsx, /battery\.removeEventListener\(\s*["']levelchange["'],\s*updateBatteryLevel\s*\)/, '必须在组件清理时移除监听');

// 6. getBattery 失败有 catch 处理，保留 fallback
assert.match(appJsx, /\.catch\(\s*\(error\)\s*=>/, '必须 catch getBattery 错误以保留 fallback');

// 7. UI 数字与 battery-level width 都来自同一 batteryLevel
assert.match(appJsx, /battery-container["']\s*\}\s*,\s*\/\*\s*@__PURE__\s*\*\/ React\.createElement\(\s*["']span["'],\s*null,\s*batteryLevel,\s*["']%["']/, '电量文字必须来自 batteryLevel');
assert.match(appJsx, /style:\s*\{\s*width:\s*`\$\{batteryLevel\}%`\s*\}/, '电池条填充宽度必须来自 batteryLevel');

// 8. 不得使用 setInterval 轮询电量
assert.doesNotMatch(appJsx, /setInterval\([^)]*getBattery/, '不得使用 setInterval 轮询电量');

console.log('device battery contract: ok');
