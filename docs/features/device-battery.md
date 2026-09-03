# 动态读取设备电量

最后更新：2026-09-03

## 功能概述

将首页顶部电量显示从固定占位符（85%）改为优先读取设备真实电量，读取失败时回退 85%。

---

## 涉及文件

- `Milvus/app.jsx`
- `Milvus/app.min.js`
- `index.html`（cache-buster 更新）
- `tests/device-battery.test.js`

---

## 分支与 Commit

| 环境 | 分支 | Commit |
|------|------|--------|
| 功能开发 | `feat/device-battery` | `24eb0fb` |
| personal | `personal` | `2f00086`（cherry-pick） |

---

## 架构设计

```javascript
const DEFAULT_BATTERY_LEVEL = 85;

// 初始状态使用 fallback，页面第一帧即可正常显示
const [batteryLevel, setBatteryLevel] = useState(DEFAULT_BATTERY_LEVEL);

useEffect(() => {
  // 特性检测，不判断 userAgent
  if (typeof navigator === 'undefined' || typeof navigator.getBattery !== 'function') return;

  let battery = null;
  let disposed = false;

  const updateBatteryLevel = () => {
    if (!battery || disposed) return;
    const level = Math.round(battery.level * 100);
    if (Number.isFinite(level) && level >= 0 && level <= 100) {
      setBatteryLevel(level);
    }
  };

  navigator.getBattery()
    .then((batteryManager) => {
      if (disposed) return;
      battery = batteryManager;
      updateBatteryLevel();
      battery.addEventListener('levelchange', updateBatteryLevel);  // 实时监听
    })
    .catch((error) => {
      console.warn('[Battery] Unable to read device battery level, using fallback:', error);
    });

  return () => {
    disposed = true;
    if (battery) battery.removeEventListener('levelchange', updateBatteryLevel);
  };
}, []);
```

---

## Fallback 触发条件

以下任何情况均保持 `DEFAULT_BATTERY_LEVEL = 85`：
1. `navigator.getBattery` 不存在
2. API Promise reject
3. 浏览器因安全上下文 / Permissions Policy 拒绝
4. `battery.level` 不存在或非数字
5. 换算结果不在 0–100 范围

---

## 禁止事项

- 不使用 `setInterval` 轮询
- 不将电量写入 `localStorage` 或 `IndexedDB`
- 不根据 `userAgent` 判断浏览器，只做特性检测
- API 失败不影响页面其他功能，不抛出未处理异常

---

## UI 同步要求

文字和电池条填充必须来自同一个 `batteryLevel` 变量：

```jsx
<span>{batteryLevel}%</span>
<div className="battery-level" style={{ width: `${batteryLevel}%` }} />
```

---

## 验证

```bash
node tests/device-battery.test.js   # ok
node --check Milvus/app.min.js      # syntax ok
```

实机浏览器（设备充电中，100%）：
- UI 显示 100%，电池填充 100%，文字与填充同步

---

## 上游 PR 状态

已开发并测试。暂缓创建上游 PR，等待日历 PR #4 状态明确后再决定。
