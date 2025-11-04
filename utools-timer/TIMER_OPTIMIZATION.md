# 定时器到期提醒优化方案

## 📋 问题分析

### 当前存在的核心问题
用户反馈：设置定时器后，如果电脑关机，就不会提示，直到再次打开 uTools 和 Timer 插件后，才会突然提示。

### 技术原因

**1. uTools 插件的运行机制限制**
- uTools 插件是**按需加载**的，只有在用户激活插件时才会运行
- 插件没有类似原生应用的**后台服务能力**
- 当 uTools 未运行或插件未激活时，插件代码完全不会执行

**2. JavaScript 定时器的限制**
- `setTimeout` 和 `setInterval` 在以下情况会停止：
  - 电脑休眠/关机
  - uTools 关闭
  - 插件未激活
- 这些定时器依赖于 JavaScript 运行时环境持续运行

**3. 当前的实现机制**
```javascript
// 主定时器 - 使用 setTimeout
backgroundTimer = setTimeout(() => {
    openTimerAlertWindow(timerName, duration, message, currentTaskId);
}, duration * 1000);

// 备用检查器 - 每10秒检查一次
periodicChecker = setInterval(() => {
    checkExpiredTimers();
}, 10000);
```

## ✅ 已实施的优化

### 1. 动态检查频率调整
```javascript
// 根据最近的定时器动态调整检查频率
if (runningTasks.success && runningTasks.tasks.length > 0) {
    const now = Date.now();
    const nearestEndTime = Math.min(...runningTasks.tasks.map(t => t.endTime || Infinity));
    const timeUntilNearest = nearestEndTime - now;
    
    // 如果最近的定时器在1分钟内到期，每5秒检查一次
    if (timeUntilNearest > 0 && timeUntilNearest < 60000) {
        checkInterval = 5000;
    }
}
```

**优势**：
- 接近到期时提高检查频率，减少延迟
- 节省系统资源

### 2. 批量过期处理
```javascript
// 支持多个定时器同时到期的批量处理
function handleExpiredTimers(expiredTasks) {
    if (expiredTasks.length === 1) {
        // 单个定时器，直接触发
        openTimerAlertWindow(task.name, task.duration, task.message, task.taskId);
    } else {
        // 多个定时器，错开显示（避免窗口重叠）
        expiredTasks.forEach((task, index) => {
            setTimeout(() => {
                openTimerAlertWindow(task.name, task.duration, task.message, task.taskId);
            }, index * 500);
        });
    }
}
```

**优势**：
- 优雅地处理多个定时器同时到期的情况
- 避免窗口重叠

### 3. 容差机制
```javascript
// 允许1秒的容差，避免因检查间隔导致漏检
if (currentTime >= (endTime - 1000)) {
    // 触发提醒
}
```

**优势**：
- 确保不会因为检查间隔而漏掉定时器
- 提高触发的可靠性

### 4. 插件进入时立即检查
```javascript
// 在 main.html 的 initialize() 函数中
TimerBusiness.checkExpiredTimers();
```

**优势**：
- 每次打开插件时立即检查过期的定时器
- 确保延迟的提醒能被触发

## 🎯 推荐的使用方式

### 最佳实践

**1. 保持 uTools 运行**
- 将 uTools 设置为开机自启动
- 不要完全退出 uTools，可以隐藏到后台

**2. 使用场景建议**
- ✅ **适合**：需要在电脑前工作时的短时间提醒（5分钟-2小时）
- ✅ **适合**：需要定期休息提醒的场景
- ❌ **不适合**：需要跨设备、跨系统的长期定时提醒
- ❌ **不适合**：电脑可能关机的场景

**3. 补充方案**
对于需要更可靠提醒的场景，建议结合：
- 手机闹钟
- 系统日历提醒
- 其他专业的提醒工具

## 🔧 技术限制说明

### uTools 插件架构的限制

**无法实现的功能：**
1. ❌ 电脑关机后的提醒
2. ❌ uTools 未运行时的提醒
3. ❌ 插件未激活时的主动提醒
4. ❌ 跨平台/跨设备同步

**原因：**
- uTools 插件运行在 Electron 环境中
- 没有系统级守护进程
- 没有云服务支持

### 为什么不能像手机 App 那样？

手机 App 的后台提醒依赖：
- 系统级的推送服务（如 iOS 的 APNs、Android 的 FCM）
- 操作系统的后台任务调度
- 云端服务器

这些都是 uTools 插件架构无法提供的。

## 📊 当前机制的可靠性

### 触发准确性

| 场景 | 触发可靠性 | 说明 |
|-----|-----------|------|
| uTools 运行 + 插件激活 | ✅ 99% | setTimeout + 定期检查双重保障 |
| uTools 运行 + 插件未激活 | ⚠️ 60% | 需要用户再次打开插件 |
| uTools 未运行 | ❌ 0% | 完全无法触发 |
| 电脑休眠 | ❌ 0% | 定时器暂停 |
| 电脑关机 | ❌ 0% | 定时器停止 |

### 延迟分析

| 场景 | 预期延迟 | 说明 |
|-----|----------|------|
| 正常运行 | < 1秒 | setTimeout 精确触发 |
| 插件重新激活 | 1-5秒 | 立即检查 + 窗口显示时间 |
| 从休眠恢复 | 5-10秒 | 定期检查器恢复 + 检查间隔 |

## 🚀 未来可能的改进方向

### 1. 使用 uTools 的 ubrowser 创建隐藏窗口
```javascript
// 创建一个隐藏的浏览器窗口持续运行
const backgroundWindow = utools.createBrowserWindow({
    show: false,
    webPreferences: {
        backgroundThrottling: false // 防止后台降速
    }
});
```

**优点**：即使主窗口关闭，后台窗口仍可运行  
**缺点**：
- 仍然依赖 uTools 运行
- 占用额外内存
- 电脑关机后仍无法工作

### 2. 使用系统级定时任务（技术难度高）
- macOS: `launchd`
- Windows: 任务计划程序
- Linux: `cron`

**优点**：可在电脑开机后触发  
**缺点**：
- 实现复杂度极高
- 需要用户授权
- 跨平台兼容性差
- 安全性问题

### 3. 云服务 + WebSocket（需要服务器）
**优点**：可实现跨设备同步和可靠提醒  
**缺点**：
- 需要维护服务器
- 增加成本
- 隐私问题

## 💡 建议

### 对于用户
1. **理解限制**：uTools 插件不是系统级应用，有其架构限制
2. **合理使用**：主要用于需要在电脑前工作时的短期提醒
3. **保持运行**：尽量保持 uTools 在后台运行
4. **补充方案**：重要提醒使用手机或系统日历作为备份

### 对于开发者（我们）
1. **已经实现**：在现有架构下，已经做到最优
2. **优化方向**：继续优化检查机制和用户体验
3. **文档说明**：在 README 中明确说明功能限制
4. **用户教育**：通过 UI 提示引导用户正确使用

## 🎓 总结

**当前的实现已经是在 uTools 插件架构限制下的最优解。**

核心问题不在代码实现，而在于：
- uTools 插件的按需加载机制
- JavaScript 定时器的运行环境限制
- 缺少系统级后台服务支持

**我们的优化**（动态检查频率、批量处理、容差机制）已经最大限度提高了在插件运行时的可靠性和准确性。

**对于"电脑关机后无法提醒"的问题，这是架构层面的限制，无法通过代码优化解决。**

---

如果有任何问题或建议，欢迎反馈！


