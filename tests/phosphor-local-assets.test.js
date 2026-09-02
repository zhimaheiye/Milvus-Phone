const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.join(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const swJs = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');

const boldCssPath = path.join(rootDir, 'Milvus', 'vendor', 'phosphor-icons', 'bold', 'style.css');
const boldWoff2Path = path.join(rootDir, 'Milvus', 'vendor', 'phosphor-icons', 'bold', 'Phosphor-Bold.woff2');
const fillCssPath = path.join(rootDir, 'Milvus', 'vendor', 'phosphor-icons', 'fill', 'style.css');
const fillWoff2Path = path.join(rootDir, 'Milvus', 'vendor', 'phosphor-icons', 'fill', 'Phosphor-Fill.woff2');
const licensePath = path.join(rootDir, 'Milvus', 'vendor', 'phosphor-icons', 'LICENSE');

// 1. index.html 不再包含外部 Phosphor unpkg / jsdelivr
assert.doesNotMatch(indexHtml, /unpkg\.com\/@phosphor-icons\/web/i, 'index.html 不得包含外部 unpkg Phosphor 脚本');
assert.doesNotMatch(indexHtml, /jsdelivr\.net\/.*phosphor/i, 'index.html 不得直接引用外部 jsdelivr Phosphor 资源');

// 2. index.html 引入本地 vendor Phosphor 样式
assert.match(indexHtml, /href=[\"']Milvus\/vendor\/phosphor-icons\/bold\/style\.css/i, 'index.html 必须引入本地 bold style.css');
assert.match(indexHtml, /href=[\"']Milvus\/vendor\/phosphor-icons\/fill\/style\.css/i, 'index.html 必须引入本地 fill style.css');

// 3. 本地文件真实存在
assert.ok(fs.existsSync(boldCssPath), 'bold style.css 必须存在');
assert.ok(fs.existsSync(boldWoff2Path), 'Phosphor-Bold.woff2 必须存在');
assert.ok(fs.existsSync(fillCssPath), 'fill style.css 必须存在');
assert.ok(fs.existsSync(fillWoff2Path), 'Phosphor-Fill.woff2 必须存在');
assert.ok(fs.existsSync(licensePath), 'Phosphor LICENSE 文件必须存在');

const boldCss = fs.readFileSync(boldCssPath, 'utf8');

// 4. vendor style.css 中不得包含任何外部 url
assert.doesNotMatch(boldCss, /https?:\/\//i, 'vendor style.css 中不得包含任何 http/https 外链');
assert.doesNotMatch(boldCss, /cdn\.jsdelivr/i, 'vendor style.css 中不得包含 jsdelivr');
assert.doesNotMatch(boldCss, /unpkg/i, 'vendor style.css 中不得包含 unpkg');

// 5. @font-face 指向本地 woff2
assert.match(boldCss, /font-family:\s*[\"']Phosphor-Bold[\"']/, 'style.css 必须声明 Phosphor-Bold');
assert.match(boldCss, /src:\s*url\([\"']\.\/Phosphor-Bold\.woff2[\"']\)\s*format\([\"']woff2[\"']\)/, 'style.css 必须指向本地 Phosphor-Bold.woff2');

// 6. sw.js 预缓存列表包含本地 Phosphor 资源
assert.match(swJs, /Milvus\/vendor\/phosphor-icons\/bold\/style\.css/, 'sw.js 必须预缓存 bold style.css');
assert.match(swJs, /Milvus\/vendor\/phosphor-icons\/bold\/Phosphor-Bold\.woff2/, 'sw.js 必须预缓存 Phosphor-Bold.woff2');

console.log('phosphor local assets contract: ok');
