// 引入 Electron 的 ipcRenderer
const { ipcRenderer } = require('electron');

// 窗口关闭函数
function closeWindow() {
    // 使用 utools API 隐藏主窗口
    if (typeof utools !== 'undefined') {
        utools.hideMainWindow();
    }
    // 尝试关闭窗口
    if (typeof window !== 'undefined' && window.close) {
        window.close();
    }
}

// 添加键盘事件监听器
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeWindow();
    }
});

// 监听来自父窗口的 timer-config 消息
ipcRenderer.on('timer-config', (event, data) => {
    // 获取消息元素（我们只使用这一个元素显示所有信息）
    const timerMessageElement = document.getElementById('timerMessage');
    
    if (!timerMessageElement) {
        console.error('[timer-preload] 找不到 timerMessage 元素！');
        return;
    }
    
    // 只显示提示信息，不显示定时器名称（根据用户要求简化显示）
    if (data.timerMessage) {
        timerMessageElement.textContent = data.timerMessage;
    } else if (data.timerName) {
        // 如果没有提示信息，至少显示定时器名称
        timerMessageElement.textContent = data.timerName;
    }
    
    // 向父窗口发送确认消息
    if (typeof utools !== 'undefined' && utools.sendToParent) {
        utools.sendToParent('timer-config-received', {
            success: true,
            timerName: data.timerName,
            timerMessage: data.timerMessage
        });
    }
});