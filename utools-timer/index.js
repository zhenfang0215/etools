// uTools 定时器插件 - 主要业务逻辑文件

// 引入数据库操作模块和 i18n 配置
const DatabaseAPI = require('./database.js');
const { i18nMessages } = require('./i18n.js');

// i18n 翻译函数
function t(key, ...args) {
    // 从 utools 存储获取当前语言，默认为英文
    let currentLanguage = 'en';
    if (typeof utools !== 'undefined' && utools.dbStorage) {
        currentLanguage = utools.dbStorage.getItem('language') || 'en';
    }
    
    const messages = i18nMessages[currentLanguage] || i18nMessages['en'];
    let text = messages[key] || key;
    
    // 支持占位符替换 {0}, {1}, ...
    args.forEach((arg, index) => {
        text = text.replace(`{${index}}`, arg);
    });
    
    return text;
}

// 全局状态管理
let timerWindow = null;
let backgroundTimer = null;
let isTimerRunning = false;

// 动态更新相关变量
let currentCallbackSetList = null;
let currentSearchTerm = '';
let updateInterval = null;

// 状态管理变量
let currentState = 'normal'; // 'normal', 'message_input', 'custom_input'
let waitingTimerData = null;

// 🔥 后台监控窗口（用于持续检查定时器）
let backgroundMonitorWindow = null;

// 定时器预设选项（增加历史查看功能）
const timerPresets = {
    history: {
        name: 'Show activity timers',
        icon: './icons/logo.png',
        duration: 0,
        description: '',
        keywords: ['当前', '任务', 'current', 'task', '运行']
    },
    shortBreak: {
        name: 'Set timer for 5 minutes',
        icon: './icons/logo.png',
        duration: 5 * 60, // 5分钟
        description: '',
        keywords: ['短', '休息', 'short', 'break', '5']
    },
    longBreak: {
        name: 'Set timer for 10 minutes',
        icon: './icons/logo.png',
        duration: 15 * 60, // 15分钟
        description: '',
        keywords: ['长', '休息', 'long', 'break', '15']
    },
    custom: {
        name: 'Set timer',
        icon: './icons/logo.png',
        duration: 0,
        description: '', // 使用空字符串，在渲染时会使用 customDesc
        keywords: ['自定义', 'custom', '设置']
    }
};


// 解析时间输入
function parseTimeInput(input) {
    if (!input || typeof input !== 'string') return null;
    
    const text = input.toLowerCase().trim();
    
    // 匹配数字 + 时间单位的模式
    const timePatterns = [
        // 中文时间单位
        { regex: /(\d+)\s*秒/, unit: '秒', unitEn: 'second', multiplier: 1 },
        { regex: /(\d+)\s*分(?:钟)?/, unit: '分钟', unitEn: 'minute', multiplier: 60 },
        { regex: /(\d+)\s*小时/, unit: '小时', unitEn: 'hour', multiplier: 3600 },
        // 英文时间单位
        { regex: /(\d+)\s*s(?:ec|econds?)?$/, unit: '秒', unitEn: 'second', multiplier: 1 },
        { regex: /(\d+)\s*m(?:in|inutes?)?$/, unit: '分钟', unitEn: 'minute', multiplier: 60 },
        { regex: /(\d+)\s*h(?:our|ours?)?$/, unit: '小时', unitEn: 'hour', multiplier: 3600 },
        // 纯数字（默认为分钟）
        { regex: /^(\d+)$/, unit: '分钟', unitEn: 'minute', multiplier: 60 }
    ];
    
    for (const pattern of timePatterns) {
        const match = text.match(pattern.regex);
        if (match) {
            const number = parseInt(match[1]);
            if (number > 0 && number <= 999) { // 限制合理范围
                return {
                    number,
                    unit: pattern.unit,
                    unitEn: pattern.unitEn,
                    duration: number * pattern.multiplier,
                    displayText: `${number} ${pattern.unit}`
                };
            }
        }
    }
    
    return null;
}

// 计算结束时间点
function calculateEndTime(durationInSeconds) {
    const now = new Date();
    const endTime = new Date(now.getTime() + durationInSeconds * 1000);
    
    const hours = endTime.getHours().toString().padStart(2, '0');
    const minutes = endTime.getMinutes().toString().padStart(2, '0');
    const seconds = endTime.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
}

// 生成动态描述
function generateDynamicDescription(originalDesc, duration) {
    if (duration > 0) {
        const endTime = calculateEndTime(duration);
        return t('willFireAt', endTime);
    }
    return originalDesc;
}

// 启动实时更新
function startRealTimeUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(() => {
        if (currentCallbackSetList && !isTimerRunning) {
            // 重新生成列表并更新
            const items = generateListItemsWithDynamicTime(currentSearchTerm);
            currentCallbackSetList(items);
        }
    }, 1000); // 每秒更新
}

// 停止实时更新
function stopRealTimeUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// 创建动态时间选项（带实时结束时间）
function createTimeOptionWithDynamicTime(timeInfo) {
    const dynamicDesc = generateDynamicDescription(t('setTimerFor', timeInfo.displayText), timeInfo.duration);
    return {
        title: t('timerFor', timeInfo.displayText),
        description: dynamicDesc,
        icon: './icons/logo.png',
        type: 'custom_time',
        duration: timeInfo.duration,
        keywords: [timeInfo.number.toString(), timeInfo.unit, timeInfo.unitEn]
    };
}

// 搜索并筛选定时器（带动态时间显示）
function searchTimersWithDynamicTime(searchTerm) {
    const results = [];
    
    // 先检查是否是时间输入
    const timeInfo = parseTimeInput(searchTerm);
    if (timeInfo) {
        // 如果是时间输入，优先显示动态时间选项
        results.push(createTimeOptionWithDynamicTime(timeInfo));
    }
    
    if (!searchTerm || searchTerm.trim() === '') {
        // 没有输入时显示所有预设选项（带动态时间）
        const presetResults = Object.entries(timerPresets).map(([type, preset]) => {
            const dynamicDesc = generateDynamicDescription(preset.description, preset.duration);
            return {
                title: preset.name,
                description: dynamicDesc,
                icon: preset.icon,
                type: type,
                duration: preset.duration
            };
        });
        
        // 添加设置选项
        const settingsOption = {
            title: 'Settings',
            description: t('settingsDesc'),
            icon: './icons/logo.png',
            type: 'settings'
        };
        
        return results.concat(presetResults).concat([settingsOption]);
    }
    
    // 然后搜索预设选项（带动态时间）
    const term = searchTerm.toLowerCase().trim();
    const presetResults = Object.entries(timerPresets).filter(([type, preset]) => {
        const nameMatch = preset.name.toLowerCase().includes(term);
        const descMatch = preset.description.toLowerCase().includes(term);
        const keywordMatch = preset.keywords.some(keyword => 
            keyword.toLowerCase().includes(term) || 
            term.includes(keyword.toLowerCase())
        );
        
        return nameMatch || descMatch || keywordMatch;
    }).map(([type, preset]) => {
        const dynamicDesc = generateDynamicDescription(preset.description, preset.duration);
        return {
            title: preset.name,
            description: dynamicDesc,
            icon: preset.icon,
            type: type,
            duration: preset.duration
        };
    });
    
    // 搜索时也检查设置选项
    const settingsResults = [];
    if ('settings'.includes(term) || '设置'.includes(term) || 'config'.includes(term)) {
        settingsResults.push({
            title: 'Settings',
            description: t('settingsDesc'),
            icon: '⚙️',
            type: 'settings'
        });
    }
    
    return results.concat(presetResults).concat(settingsResults);
}

// 生成列表项数据（适配 utools 原生 list 模式，支持动态时间）
function generateListItemsWithDynamicTime(searchTerm = '') {
    const results = searchTimersWithDynamicTime(searchTerm);
    
    if (results.length === 0) {
        return [{
            title: '没有找到匹配的定时器',
            description: '请尝试其他关键词，如：休息、25分钟、自定义等',
            icon: './icons/logo.png'
        }];
    }
    
    return results;
}
// 处理定时器选择和消息输入
function handleTimerSelection(item, message = '') {
    const timerType = item.type;
    let duration = item.duration;
    let timerName = item.title;
    
    if (timerType === 'custom') {
        // 自定义时间，需要用户输入
        if (typeof utools !== 'undefined') {
            utools.setSubInput(({ text }) => {
                const timeInfo = parseTimeInput(text);
                if (timeInfo) {
                    utools.setSubInputValue('');
                    startTimer(timeInfo.duration, `自定义定时器 ${timeInfo.displayText}`, message);
                }
            }, '请输入自定义时间（如：25分钟、30秒等）...');
        }
        return;
    }
    
    if (timerType === 'custom_time') {
        // 动态解析的时间
        startTimer(duration, timerName, message);
        return;
    }
    
    
    // 普通定时器
    startTimer(duration, timerName, message);
}

// 开始定时器（改进的后台运行机制）
function startTimer(duration, timerName, message = '') {
    // 如果已经有计时器在运行，先停止
    if (backgroundTimer) {
        clearTimeout(backgroundTimer);
    }
    
    // 📝 创建定时器任务记录（包含绝对结束时间）
    const startTime = Date.now();
    const endTime = startTime + duration * 1000; // 绝对结束时间戳
    
    const createResult = DatabaseAPI.createTimerTask(
        timerName, 
        message, 
        duration, 
        DatabaseAPI.getTimerTypeFromName(timerName),
        { 
            endTime: endTime // 直接在创建时传递绝对结束时间
        }
    );
    
    let currentTaskId = null;
    if (createResult.success) {
        currentTaskId = createResult.taskId;
    } else {
        console.error('❌ 创建定时器任务记录失败:', createResult.error);
    }
    
    isTimerRunning = true;
    
    
    // 📝 更新任务状态为运行中
    if (currentTaskId) {
        DatabaseAPI.updateTimerTaskStatus(currentTaskId, 'running');
    }
    
    // 显示开始通知
    if (typeof utools !== 'undefined') {
        const timeText = `${Math.floor(duration/60)}分${duration%60}秒`;
        const endTimeStr = new Date(endTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    
    // 设置主要的后台定时器（作为主要机制）
    backgroundTimer = setTimeout(() => {
        isTimerRunning = false;
        
        // 📝 更新任务状态为已完成
        if (currentTaskId) {
            DatabaseAPI.updateTimerTaskStatus(currentTaskId, 'completed');
        }
        
        // 时间到了，打开悬浮窗口
        openTimerAlertWindow(timerName, duration, message, currentTaskId);
        
    }, duration * 1000);
    
    // 启动定期检查机制（作为备用机制）
    startPeriodicCheck();
    
    // 关闭主窗口
    if (typeof utools !== 'undefined') {
        utools.hideMainWindow();
    }
}

// 定期检查机制（作为 setTimeout 的备用方案）
let periodicChecker = null;

function startPeriodicCheck() {
    // 如果已经有检查器在运行，不重复启动
    if (periodicChecker) {
        return;
    }
    
    // 🔥 优化：根据最近的定时器动态调整检查频率
    const runningTasks = DatabaseAPI.getCurrentRunningTasks();
    let checkInterval = 10000; // 默认10秒
    
    if (runningTasks.success && runningTasks.tasks.length > 0) {
        const now = Date.now();
        const nearestEndTime = Math.min(...runningTasks.tasks.map(t => t.endTime || Infinity));
        const timeUntilNearest = nearestEndTime - now;
        
        // 如果最近的定时器在1分钟内到期，每5秒检查一次
        if (timeUntilNearest > 0 && timeUntilNearest < 60000) {
            checkInterval = 5000;
        }
    }
    
    periodicChecker = setInterval(() => {
        checkExpiredTimers();
    }, checkInterval);
}

function stopPeriodicCheck() {
    if (periodicChecker) {
        clearInterval(periodicChecker);
        periodicChecker = null;
    }
}

function checkExpiredTimers() {
    const currentTime = Date.now();
    
    // 获取所有运行中的任务
    const runningTasks = DatabaseAPI.getCurrentRunningTasks();
    
    if (!runningTasks.success) {
        return;
    }
    
    let hasExpired = false;
    const expiredTasks = [];
    
    runningTasks.tasks.forEach(task => {
        // 检查是否有绝对结束时间信息（存储在自定义字段中）
        if (task.endTime) {
            const endTime = task.endTime;
            
            // 🔥 优化：如果已经超过结束时间（允许1秒的容差）
            if (currentTime >= (endTime - 1000)) {
                hasExpired = true;
                expiredTasks.push(task);
                
                // 更新任务状态
                DatabaseAPI.updateTimerTaskStatus(task.taskId, 'completed');
                
                // 如果这是当前的主任务，清理状态
                if (isTimerRunning) {
                    isTimerRunning = false;
                    if (backgroundTimer) {
                        clearTimeout(backgroundTimer);
                        backgroundTimer = null;
                    }
                }
            }
        }
    });
    
    // 🔥 批量处理过期的定时器
    if (hasExpired && expiredTasks.length > 0) {
        handleExpiredTimers(expiredTasks);
    }
    
    // 如果没有运行中的任务，停止检查
    if (runningTasks.tasks.length === 0) {
        stopPeriodicCheck();
    }
}

// 🔥 新增：处理过期的定时器（支持批量处理）
function handleExpiredTimers(expiredTasks) {
    if (expiredTasks.length === 1) {
        // 单个定时器，直接触发
        const task = expiredTasks[0];
        openTimerAlertWindow(task.name, task.duration, task.message || '', task.taskId);
    } else {
        // 多个定时器同时到期，批量提醒
        expiredTasks.forEach((task, index) => {
            // 错开显示时间，避免窗口重叠
            setTimeout(() => {
                openTimerAlertWindow(task.name, task.duration, task.message || '', task.taskId);
            }, index * 500); // 每个窗口间隔500ms
        });
    }
}

// 打开警告悬浮窗口（支持传递任务ID）
function openTimerAlertWindow(timerName, originalDuration, message = '', taskId = null) {
    try {
        
        // 确保提示信息不为空
        const finalMessage = message && message.trim() ? message.trim() : t('timeUp');
        
        // 获取当前工作显示器信息
        let targetDisplay = null;
        let windowOptions = {
            maximized: true,
            frame: false,
            opacity: 0.8,
            resizable: true,
            minimizable: true,
            maximizable: true,
            alwaysOnTop: true,
            skipTaskbar: false,
            title: t('timerComplete', timerName),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
                preload: __dirname + '/timer-preload.js'
            },
            show: true
        };
        
        // 使用 utools 原生方法获取鼠标位置和显示器信息
        if (typeof utools !== 'undefined') {
            try {
                // 获取鼠标位置
                const mousePos = utools.getCursorScreenPoint();
                
                // 获取所有显示器
                const displays = utools.getAllDisplays();
                
                if (mousePos && displays && displays.length > 0) {
                    // 查找鼠标所在的显示器
                    for (const display of displays) {
                        const bounds = display.bounds;
                        if (mousePos.x >= bounds.x && 
                            mousePos.x < bounds.x + bounds.width &&
                            mousePos.y >= bounds.y && 
                            mousePos.y < bounds.y + bounds.height) {
                            targetDisplay = display;
                            break;
                        }
                    }
                    
                    // 如果找到了目标显示器，设置窗口位置
                    if (targetDisplay) {
                        const workArea = targetDisplay.workAreaSize;
                        const bounds = targetDisplay.bounds;
                        
                        // 设置窗口在指定显示器上最大化
                        windowOptions.x = bounds.x;
                        windowOptions.y = bounds.y;
                        windowOptions.width = workArea.width;
                        windowOptions.height = workArea.height;
                        // 在多显示器环境下禁用自动最大化，使用精确尺寸
                        windowOptions.maximized = false;
                        
                    } else {
                    }
                }
            } catch (error) {
                console.error('获取鼠标位置或显示器信息失败:', error);
            }
        }
        
        timerWindow = utools.createBrowserWindow('timer.html', windowOptions, () => {
            
            // 窗口创建成功后手动最大化
            if (timerWindow && timerWindow.maximize) {
                timerWindow.maximize();
            }
            
            // 向子窗口发送消息
            timerWindow.webContents.send('timer-config', {
                    timerName: timerName,
                    timerMessage: finalMessage,
                    originalDuration: originalDuration
                });
        });
        
        // 监听窗口关闭事件
        if (timerWindow) {
            timerWindow.setAlwaysOnTop(true, 'screen-saver');
            
            // 显示系统通知
            if (typeof utools !== 'undefined') {
                const notificationText = finalMessage ? 
                    t('timerNotification', timerName, finalMessage) :
                    t('timerNotificationSimple', timerName);
                utools.showNotification(notificationText);
            }
        }
        
    } catch (error) {
        console.error('创建警告窗口失败:', error);
        if (typeof utools !== 'undefined') {
            utools.showNotification(t('createWindowFailed'));
        }
    }
}


function openTimerWindow(timerType = '', preset = null) {
    // 如果窗口已经存在，直接显示
    if (timerWindow && !timerWindow.isDestroyed()) {
        timerWindow.show();
        timerWindow.focus();
        return;
    }
    
    // 创建新的定时器窗口
    try {
        timerWindow = utools.createBrowserWindow('timer.html', {
            // 窗口配置
            width: 350,
            height: 450,
            resizable: true,
            minimizable: true,
            maximizable: false,
            alwaysOnTop: true,  // 始终保持在最顶层
            skipTaskbar: false, // 在任务栏显示
            title: preset ? `桌面定时器 - ${preset.name}` : '桌面定时器',
            icon: './icons/logo.png',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
                additionalArguments: [`--timer-type=${timerType}`, `--timer-preset=${JSON.stringify(preset || {})}`]
            },
            // 确保窗口在屏幕内
            x: undefined, // 让系统自动定位
            y: undefined,
            show: true
        }, () => {
        });
        
        // 监听窗口关闭事件
        if (timerWindow) {
            timerWindow.on('closed', () => {
                timerWindow = null;
            });
            
            // 确保窗口始终在顶层
            timerWindow.setAlwaysOnTop(true, 'screen-saver');
            
        }
        
    } catch (error) {
        console.error('创建定时器窗口失败:', error);
        if (typeof utools !== 'undefined') {
            utools.showNotification('创建定时器窗口失败，请重试');
        }
    }
}

// ===========================================
// 历史记录和统计功能
// ===========================================

// 显示当前运行中的定时任务
function showCurrentRunningTasks(callbackSetList) {
    const tasksResult = DatabaseAPI.getCurrentRunningTasks();
    
    if (!tasksResult.success) {
        callbackSetList([{
            title: t('getTasksFailed'),
            description: t('cannotReadTasks'),
            icon: './icons/list.png'
        }]);
        return;
    }
    
    const items = [];
    
    // 添加当前运行中的任务
    if (tasksResult.tasks.length > 0) {
        tasksResult.tasks.forEach(task => {
            // 添加安全检查
            if (!task || !task.name || !task.duration) {
                console.warn('跳过无效的任务数据:', task);
                return;
            }
            
            // 计算预期完成时间（只显示时分秒）
            let expectedEndTime = '';
            if (task.startedAt) {
                const startTime = new Date(task.startedAt);
                const endTime = new Date(startTime.getTime() + task.duration * 1000);
                // 只显示时分秒，不显示月日
                expectedEndTime = endTime.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit'
                });
            } else {
                expectedEndTime = t('notStarted');
            }
            
            // 移除状态图标，因为列表中只显示未运行的任务
            // const statusIcon = getStatusIcon(task.status);
            // const durationText = `${Math.floor(task.duration/60)}分${task.duration%60}秒`;
            
            items.push({
                title: `${expectedEndTime}`, // title 显示预计完成时间（只显示时分秒）
                description: task.message || t('noDescription'), // description 显示设置的 message
                icon: './icons/list.png',
                type: 'current_task_item',
                taskData: task
            });
        });
    } 
    
    // 添加返回选项
    items.push({
        title: t('noActiveTimers'),
        description: '',
        icon: './icons/add.png',
        type: 'back_to_main'
    });
    
    callbackSetList(items);
}

// 取消定时任务
function cancelTimerTask(taskId, callbackSetList) {
    try {
        // 更新任务状态为已取消（这将导致任务被删除）
        const result = DatabaseAPI.updateTimerTaskStatus(taskId, 'cancelled');
        
        if (result.success) {
        } else {
            console.error('❌ 取消任务失败:', result.error);
        }
        
        // 直接返回任务列表，不显示任何提示
        showCurrentRunningTasks(callbackSetList);
    } catch (error) {
        console.error('❌ 取消任务异常:', error);
        // 即使出错也直接返回任务列表
        showCurrentRunningTasks(callbackSetList);
    }
}

// 修改定时任务时间
function modifyTimerTaskTime(taskId, newDuration, callbackSetList) {
    try {
        // 获取当前任务信息
        const tasksResult = DatabaseAPI.getAllTasks();
        if (!tasksResult.success) {
            // 直接返回任务列表，不显示错误提示
            showCurrentRunningTasks(callbackSetList);
            return;
        }
        
        const task = tasksResult.tasks.find(t => t.taskId === taskId);
        if (!task) {
            // 直接返回任务列表，不显示错误提示
            showCurrentRunningTasks(callbackSetList);
            return;
        }
        
        // 计算新的结束时间
        const newEndTime = Date.now() + newDuration * 1000;
        
        // 更新任务的持续时间和结束时间
        const updateResult = DatabaseAPI.updateTimerTaskStatus(taskId, task.status, {
            duration: newDuration,
            endTime: newEndTime
        });
        
        if (updateResult.success) {
        } else {
            console.error('❌ 修改时间失败:', updateResult.error);
        }
        
        // 直接返回任务列表，不显示任何提示
        showCurrentRunningTasks(callbackSetList);
    } catch (error) {
        console.error('❌ 修改时间异常:', error);
        // 即使出错也直接返回任务列表
        showCurrentRunningTasks(callbackSetList);
    }
}

// 初始化数据库维护函数
function initializeDatabaseMaintenance() {
    return DatabaseAPI.initializeDatabaseMaintenance();
}

// ===========================================
// 导出功能供 main-preload.js 使用
// ===========================================

// 在浏览器环境中导出功能
if (typeof window !== 'undefined') {
    window.TimerBusinessLogic = {
        // 状态管理
        getCurrentState: () => currentState,
        setCurrentState: (state) => { currentState = state; },
        getWaitingTimerData: () => waitingTimerData,
        setWaitingTimerData: (data) => { waitingTimerData = data; },
        
        // 动态更新
        setCurrentCallbackSetList: (callback) => { currentCallbackSetList = callback; },
        setCurrentSearchTerm: (term) => { currentSearchTerm = term; },
        startRealTimeUpdate,
        stopRealTimeUpdate,
        
        // 核心功能
        generateListItemsWithDynamicTime,
        handleTimerSelection,
        parseTimeInput,
        
        // 数据库操作
        DatabaseAPI,
        initializeDatabaseMaintenance,
        
        // 历史和统计
        showCurrentRunningTasks,
        cancelTimerTask,
        modifyTimerTaskTime,
        
        // 定旲器操作
        startTimer,
        openTimerAlertWindow,
        openTimerWindow,
        
        // 后台检查机制
        checkExpiredTimers,
        startPeriodicCheck,
        stopPeriodicCheck
    };
}

// Node.js 环境中的导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // 状态管理
        getCurrentState: () => currentState,
        setCurrentState: (state) => { currentState = state; },
        getWaitingTimerData: () => waitingTimerData,
        setWaitingTimerData: (data) => { waitingTimerData = data; },
        
        // 动态更新
        setCurrentCallbackSetList: (callback) => { currentCallbackSetList = callback; },
        setCurrentSearchTerm: (term) => { currentSearchTerm = term; },
        startRealTimeUpdate,
        stopRealTimeUpdate,
        
        // 核心功能
        generateListItemsWithDynamicTime,
        handleTimerSelection,
        parseTimeInput,
        
        // 数据库操作
        DatabaseAPI,
        initializeDatabaseMaintenance,
        
        // 历史和统计
        showCurrentRunningTasks,
        cancelTimerTask,
        modifyTimerTaskTime,
        
        // 定旲器操作
        startTimer,
        openTimerAlertWindow,
        openTimerWindow,
        
        // 后台检查机制
        checkExpiredTimers,
        startPeriodicCheck,
        stopPeriodicCheck
    };
}
