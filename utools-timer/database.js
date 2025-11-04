// uTools 定时器插件 - 数据库操作封装

// 使用 uTools 官方的 dbStorage API
const dbStorage = utools.dbStorage;

// 数据库键名常量
const DB_KEYS = {
    TIMER_TASKS: 'utimer_tasks',
    LAST_CLEANUP: 'timer_last_cleanup',
    APP_SETTINGS: 'timer_app_settings'
};

// 定时器任务数据格式定义
const TimerTaskSchema = {
    taskId: '', // 任务唯一标识 (uuid)
    name: '', // 定时器名称
    message: '', // 提示信息
    duration: 0, // 持续时间（秒）
    status: 'pending', // 状态: pending, running, completed, cancelled
    createdAt: '', // 创建时间 ISO 字符串
    startedAt: '', // 开始时间 ISO 字符串
    completedAt: '', // 完成时间 ISO 字符串
    timerType: 'custom', // 定时器类型: custom, preset, custom_time, pomodoro 等
    settings: { // 扩展设置
        autoStart: true,
        notification: true,
        sound: true
    }
};

// ===========================================
// 基础数据库操作
// ===========================================

// 获取所有定时器任务
function getAllTasks() {
    try {
        const tasks = dbStorage.getItem(DB_KEYS.TIMER_TASKS) || [];
        return { success: true, tasks: tasks };
    } catch (error) {
        console.error('❌ 获取任务列表异常:', error);
        return { success: false, error: error, tasks: [] };
    }
}

// 保存所有定时器任务
function saveAllTasks(tasks) {
    try {
        dbStorage.setItem(DB_KEYS.TIMER_TASKS, tasks);
        return { success: true };
    } catch (error) {
        console.error('❌ 保存任务列表异常:', error);
        return { success: false, error: error };
    }
}

// 生成唯一任务ID
function generateTaskId() {
    return 'timer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===========================================
// 定时器任务操作
// ===========================================

// 创建定时器任务记录
function createTimerTask(name, message, duration, timerType = 'custom', additionalFields = {}) {
    const taskId = generateTaskId();
    const now = new Date().toISOString();
    
    const task = {
        taskId: taskId,
        name: name,
        message: message,
        duration: duration,
        status: 'pending',
        createdAt: now,
        startedAt: null,
        completedAt: null,
        timerType: timerType,
        // 移除 preset 字段，将绝对时间信息直接存储在任务对象中
        // 添加 endTime 字段用于存储绝对结束时间（如果需要）
        endTime: null, // 绝对结束时间戳
        settings: {
            autoStart: true,
            notification: true,
            sound: true
        },
        // 合并额外字段
        ...additionalFields
    };
    
    try {
        const tasksResult = getAllTasks();
        if (!tasksResult.success) {
            return tasksResult;
        }
        
        const tasks = tasksResult.tasks;
        tasks.push(task);
        
        const saveResult = saveAllTasks(tasks);
        if (saveResult.success) {
            return { success: true, taskId: taskId, task: task };
        } else {
            return saveResult;
        }
    } catch (error) {
        console.error('❌ 创建定时器任务异常:', error);
        return { success: false, error: error };
    }
}

// 更新定时器任务状态
function updateTimerTaskStatus(taskId, status, additionalData = {}) {
    try {
        const tasksResult = getAllTasks();
        if (!tasksResult.success) {
            return tasksResult;
        }
        
        const tasks = tasksResult.tasks;
        const taskIndex = tasks.findIndex(task => task.taskId === taskId);
        
        if (taskIndex === -1) {
            console.error('❌ 找不到任务:', taskId);
            return { success: false, error: 'Task not found' };
        }
        
        // 如果状态为 completed，直接删除任务而不是更新状态
        if (status === 'completed') {
            // 删除任务
            const deletedTask = tasks.splice(taskIndex, 1)[0];
            
            const saveResult = saveAllTasks(tasks);
            if (saveResult.success) {
                return { success: true, task: deletedTask, deleted: true };
            } else {
                return saveResult;
            }
        } else {
            // 更新任务数据（非 completed 状态）
            const updatedTask = {
                ...tasks[taskIndex],
                status: status,
                ...additionalData
            };
            
            // 根据状态设置时间戳
            const now = new Date().toISOString();
            if (status === 'running' && !updatedTask.startedAt) {
                updatedTask.startedAt = now;
            } else if (status === 'completed' && !updatedTask.completedAt) {
                updatedTask.completedAt = now;
            }
            
            tasks[taskIndex] = updatedTask;
            
            const saveResult = saveAllTasks(tasks);
            if (saveResult.success) {
                return { success: true, task: updatedTask };
            } else {
                return saveResult;
            }
        }
    } catch (error) {
        console.error('❌ 更新任务状态异常:', error);
        return { success: false, error: error };
    }
}

// 获取当前运行中的定时任务
function getCurrentRunningTasks() {
    try {
        const tasksResult = getAllTasks();
        if (!tasksResult.success) {
            return tasksResult;
        }
        
        const runningTasks = tasksResult.tasks
            .filter(task => task && task.status && (task.status === 'running' || task.status === 'pending'))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // 按创建时间排序
        
        return { success: true, tasks: runningTasks };
    } catch (error) {
        console.error('❌ 获取当前任务异常:', error);
        return { success: false, error: error };
    }
}

// 获取定时器任务统计信息
function getTimerTaskStats() {
    try {
        const tasksResult = getAllTasks();
        if (!tasksResult.success) {
            return tasksResult;
        }
        
        const tasks = tasksResult.tasks;
        const stats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            running: tasks.filter(t => t.status === 'running').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            cancelled: tasks.filter(t => t.status === 'cancelled').length,
            totalDuration: tasks.reduce((sum, t) => sum + (t.duration || 0), 0),
            averageDuration: tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + (t.duration || 0), 0) / tasks.length) : 0
        };
        
        return { success: true, stats: stats };
    } catch (error) {
        console.error('❌ 获取统计信息异常:', error);
        return { success: false, error: error };
    }
}

// 清理过期的定时器任务（保留最近30天）
function cleanupOldTimerTasks(daysToKeep = 30) {
    try {
        const tasksResult = getAllTasks();
        if (!tasksResult.success) {
            return tasksResult;
        }
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffISO = cutoffDate.toISOString();
        
        const tasks = tasksResult.tasks;
        const initialCount = tasks.length;
        
        // 过滤出需要保留的任务
        const filteredTasks = tasks.filter(task => {
            // 保留运行中或等待中的任务
            if (task.status === 'running' || task.status === 'pending') {
                return true;
            }
            // 保留最近创建的任务
            if (task.createdAt >= cutoffISO) {
                return true;
            }
            // 删除过期的已完成任务
            return false;
        });
        
        const deletedCount = initialCount - filteredTasks.length;
        
        if (deletedCount > 0) {
            const saveResult = saveAllTasks(filteredTasks);
            if (!saveResult.success) {
                return saveResult;
            }
        }
        
        return { success: true, deletedCount: deletedCount };
    } catch (error) {
        console.error('❌ 清理过期任务异常:', error);
        return { success: false, error: error };
    }
}

// ===========================================
// 应用设置相关
// ===========================================

// 获取上次清理时间
function getLastCleanupTime() {
    try {
        const lastCleanup = dbStorage.getItem(DB_KEYS.LAST_CLEANUP);
        return lastCleanup ? lastCleanup.timestamp : null;
    } catch (error) {
        console.error('❌ 获取上次清理时间异常:', error);
        return null;
    }
}

// 更新清理时间戳
function updateLastCleanupTime() {
    try {
        const cleanupRecord = {
            timestamp: Date.now(),
            type: 'maintenance'
        };
        dbStorage.setItem(DB_KEYS.LAST_CLEANUP, cleanupRecord);
        return { success: true };
    } catch (error) {
        console.error('❌ 更新清理时间异常:', error);
        return { success: false, error: error };
    }
}

// 插件初始化时执行数据库维护
function initializeDatabaseMaintenance() {
    try {
        const lastCleanup = getLastCleanupTime();
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000; // 一天的毫秒数
        
        // 如果超过一天没有清理，执行自动清理
        if (!lastCleanup || (now - lastCleanup) > oneDayMs) {
            const cleanupResult = cleanupOldTimerTasks(30);
            
            if (cleanupResult.success) {
                updateLastCleanupTime();
            }
        }
        
        return { success: true };
    } catch (error) {
        console.error('❌ 数据库维护失败:', error);
        return { success: false, error: error };
    }
}

// ===========================================
// 工具函数
// ===========================================

// 根据定时器名称推断类型
function getTimerTypeFromName(timerName) {
    if (timerName.includes('自定义')) {
        return 'custom';
    } else if (timerName.includes('5分钟') || timerName.includes('短')) {
        return 'short_break';
    } else if (timerName.includes('10分钟') || timerName.includes('长')) {
        return 'long_break';
    } else if (timerName.includes('整点')) {
        return 'hourly';
    } else {
        return 'preset';
    }
}

// ===========================================
// 导出功能
// ===========================================

// 导出所有数据库操作函数
const DatabaseAPI = {
    // 基础操作
    getAllTasks,
    saveAllTasks,
    generateTaskId,
    
    // 任务操作
    createTimerTask,
    updateTimerTaskStatus,
    getCurrentRunningTasks,
    getTimerTaskStats,
    cleanupOldTimerTasks,
    
    // 应用设置
    getLastCleanupTime,
    updateLastCleanupTime,
    initializeDatabaseMaintenance,
    
    // 工具函数
    getTimerTypeFromName,
    
    // 常量
    DB_KEYS,
    TimerTaskSchema
};

// 在浏览器环境中导出功能
if (typeof window !== 'undefined') {
    window.DatabaseAPI = DatabaseAPI;
}

// Node.js 环境中的导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseAPI;
}




