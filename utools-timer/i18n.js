// uTools Timer Plugin - 国际化（i18n）配置文件
// 添加新语言：复制现有语言对象，翻译所有文本，然后在 supportedLanguages 中添加语言选项

/**
 * 语言包配置
 * 支持占位符：{0}, {1}, {2}, ... 用于动态文本替换
 */
const i18nMessages = {
    /**
     * 英文（默认语言）
     */
    'en': {
        // 主列表输入提示
        inputPlaceholder: 'Enter timer type or custom time (e.g., 25 minutes, break, custom, etc.)',
        
        // 定时器预设
        pomodoro: 'Pomodoro',
        pomodoroDesc: 'Standard 25-minute work timer',
        shortBreak: 'Short Break',
        shortBreakDesc: 'Quick 5-minute rest',
        longBreak: 'Long Break',
        longBreakDesc: '15-minute relaxation time',
        custom: 'Custom',
        customDesc: 'Enter custom time',
        customHint: 'Hit ↩︎ to set to 1 minute or provide duration',
        history: 'Activity Timers',
        historyDesc: 'View all running timers',
        settings: 'Settings',
        settingsDesc: 'Configure app preferences',
        
        // 任务相关
        startTask: 'Start',
        cancelTask: 'Cancel',
        cancelTimer: 'Cancel timer',
        modifyTime: 'Modify Time',
        setNewTime: 'Set new time',
        backToTasks: 'Back to Tasks',
        backToTasksList: 'Return to task list',
        backToMain: 'Back to Main',
        noRunningTasks: 'No running timers',
        noRunningTasksDesc: 'Start a timer to see it here',
        noActiveTimers: 'No active timers. Create new one?',
        getTasksFailed: 'Failed to get current tasks',
        cannotReadTasks: 'Cannot read running tasks',
        notStarted: 'Not started',
        noDescription: 'No description',
        
        // 时间相关
        endTime: 'End Time',
        remaining: 'Remaining',
        willFireAt: 'Will fire at {0}',
        setTimerFor: 'Set timer for {0}',
        timerFor: 'Timer {0}',
        
        // 输入状态
        enterMessage: 'Please enter a message (required)',
        messageConfirm: 'Message: "{0}", press Enter to confirm',
        enterTimeFormat: 'Please enter correct time format (e.g., 30 minutes, 45 seconds, 2 hours)',
        modifyTimeTo: 'Modify to {0}',
        modifyTimeConfirm: 'Change timer to {0}, press Enter to confirm',
        customTimeTo: 'Custom {0}',
        customTimeConfirm: 'Set timer to {0}, press Enter to confirm',
        
        // 通知相关
        timeUp: "Time's up!",
        timerComplete: '{0} - Time\'s up!',
        timerNotification: '⏰ {0} Time\'s up! Message: {1}',
        timerNotificationSimple: '⏰ {0} Time\'s up!',
        createWindowFailed: 'Failed to create reminder window, please try again',
        
        // 搜索
        noResults: 'No results',
        noResultsDesc: 'Try different keywords',
        
        // 设置页面
        settingsTitle: 'Settings',
        settingsBack: 'Back',
        settingsSearch: 'Search settings...',
        noSettingsFound: 'No matching settings found',
        
        // 外观设置
        appearanceSettings: 'Appearance',
        appearanceDesc: 'Appearance related settings',
        theme: 'Theme',
        themeDesc: 'Choose app theme mode',
        themeSystem: 'Follow System',
        themeDark: 'Dark',
        themeLight: 'Light',
        language: 'Language',
        languageDesc: 'Choose interface language',
    },
    
    /**
     * 简体中文
     */
    'zh-CN': {
        // 主列表输入提示
        inputPlaceholder: '输入定时器类型或自定义时间（如：25分钟、休息、自定义等）',
        
        // 定时器预设
        pomodoro: '番茄专注',
        pomodoroDesc: '标准 25 分钟工作计时器',
        shortBreak: '5 分钟倒计时',
        shortBreakDesc: '快速 5 分钟休息',
        longBreak: '15 分钟倒计时',
        longBreakDesc: '15 分钟放松时间',
        custom: '自定义',
        customDesc: '输入自定义时间',
        customHint: '按回车设置为1分钟或自定义时长',
        history: '活动中的定时器',
        historyDesc: '查看所有正在运行的定时器',
        settings: '设置',
        settingsDesc: '配置应用偏好',
        
        // 任务相关
        startTask: '启动',
        cancelTask: '取消',
        cancelTimer: '取消定时器',
        modifyTime: '修改时间',
        setNewTime: '设置新时间',
        backToTasks: '返回任务列表',
        backToTasksList: '返回任务列表',
        backToMain: '返回主菜单',
        noRunningTasks: '暂无运行中的定时器',
        noRunningTasksDesc: '启动一个定时器后将在这里显示',
        noActiveTimers: '暂无活动定时器，创建新的？',
        getTasksFailed: '获取当前任务失败',
        cannotReadTasks: '无法读取当前运行中的任务',
        notStarted: '尚未开始',
        noDescription: '无描述信息',
        
        // 时间相关
        endTime: '结束时间',
        remaining: '剩余',
        willFireAt: '将于 {0} 结束',
        setTimerFor: '设置 {0} 的定时器',
        timerFor: '定时器 {0}',
        
        // 输入状态
        enterMessage: '请输入提示信息（必填）',
        messageConfirm: '提示信息: "{0}"，按回车确认',
        enterTimeFormat: '请输入正确的时间格式（如：30分钟、45秒、2小时）',
        modifyTimeTo: '修改为 {0}',
        modifyTimeConfirm: '将定时器时间修改为 {0}，按回车确认',
        customTimeTo: '自定义 {0}',
        customTimeConfirm: '设置定时器为 {0}，按回车确认',
        
        // 通知相关
        timeUp: '时间到了！',
        timerComplete: '{0} - 时间到！',
        timerNotification: '⏰ {0} 时间到！提示: {1}',
        timerNotificationSimple: '⏰ {0} 时间到！',
        createWindowFailed: '创建提醒窗口失败，请重试',
        
        // 搜索
        noResults: '无匹配结果',
        noResultsDesc: '尝试其他关键词',
        
        // 设置页面
        settingsTitle: '设置',
        settingsBack: '返回',
        settingsSearch: '搜索设置项...',
        noSettingsFound: '未找到匹配的设置',
        
        // 外观设置
        appearanceSettings: '外观设置',
        appearanceDesc: '外观设置相关配置',
        theme: '主题',
        themeDesc: '选择应用的主题模式',
        themeSystem: '跟随系统',
        themeDark: '深色',
        themeLight: '浅色',
        language: '语言',
        languageDesc: '选择界面语言',
    },
    
    /**
     * 繁体中文
     */
    'zh-TW': {
        // 主列表輸入提示
        inputPlaceholder: '輸入計時器類型或自訂時間（如：25分鐘、休息、自訂等）',
        
        // 計時器預設
        pomodoro: '番茄專注',
        pomodoroDesc: '標準 25 分鐘工作計時器',
        shortBreak: '短暫休息',
        shortBreakDesc: '快速 5 分鐘休息',
        longBreak: '長時休息',
        longBreakDesc: '15 分鐘放鬆時間',
        custom: '自訂',
        customDesc: '輸入自訂時間',
        customHint: '按 Enter 設定為1分鐘或自訂時長',
        history: '執行中的計時器',
        historyDesc: '檢視所有正在執行的計時器',
        settings: '設定',
        settingsDesc: '配置應用程式偏好',
        
        // 任務相關
        startTask: '啟動',
        cancelTask: '取消',
        cancelTimer: '取消計時器',
        modifyTime: '修改時間',
        setNewTime: '設定新時間',
        backToTasks: '返回任務列表',
        backToTasksList: '返回任務列表',
        backToMain: '返回主選單',
        noRunningTasks: '暫無執行中的計時器',
        noRunningTasksDesc: '啟動一個計時器後將在這裡顯示',
        noActiveTimers: '暫無活動計時器，建立新的？',
        getTasksFailed: '取得目前任務失敗',
        cannotReadTasks: '無法讀取目前執行中的任務',
        notStarted: '尚未開始',
        noDescription: '無描述資訊',
        
        // 時間相關
        endTime: '結束時間',
        remaining: '剩餘',
        willFireAt: '將於 {0} 結束',
        setTimerFor: '設定 {0} 的計時器',
        timerFor: '計時器 {0}',
        
        // 輸入狀態
        enterMessage: '請輸入提示資訊（必填）',
        messageConfirm: '提示資訊: "{0}"，按 Enter 確認',
        enterTimeFormat: '請輸入正確的時間格式（如：30分鐘、45秒、2小時）',
        modifyTimeTo: '修改為 {0}',
        modifyTimeConfirm: '將計時器時間修改為 {0}，按 Enter 確認',
        customTimeTo: '自訂 {0}',
        customTimeConfirm: '設定計時器為 {0}，按 Enter 確認',
        
        // 通知相關
        timeUp: '時間到了！',
        timerComplete: '{0} - 時間到！',
        timerNotification: '⏰ {0} 時間到！提示: {1}',
        timerNotificationSimple: '⏰ {0} 時間到！',
        createWindowFailed: '建立提醒視窗失敗，請重試',
        
        // 搜尋
        noResults: '無配對結果',
        noResultsDesc: '嘗試其他關鍵詞',
        
        // 設定頁面
        settingsTitle: '設定',
        settingsBack: '返回',
        settingsSearch: '搜尋設定項目...',
        noSettingsFound: '未找到配對的設定',
        
        // 外觀設定
        appearanceSettings: '外觀設定',
        appearanceDesc: '外觀設定相關配置',
        theme: '主題',
        themeDesc: '選擇應用程式的主題模式',
        themeSystem: '跟隨系統',
        themeDark: '深色',
        themeLight: '淺色',
        language: '語言',
        languageDesc: '選擇介面語言',
    },
    
    /**
     * 日本語
     */
    'ja': {
        // メインリストの入力プレースホルダー
        inputPlaceholder: 'タイマーの種類またはカスタム時間を入力（例：25分、休憩、カスタムなど）',
        
        // タイマープリセット
        pomodoro: 'ポモドーロ',
        pomodoroDesc: '標準25分作業タイマー',
        shortBreak: '短い休憩',
        shortBreakDesc: 'クイック5分休憩',
        longBreak: '長い休憩',
        longBreakDesc: '15分リラックスタイム',
        custom: 'カスタム',
        customDesc: 'カスタム時間を入力',
        customHint: 'Enterで1分に設定、または時間を入力',
        history: '実行中のタイマー',
        historyDesc: '実行中のすべてのタイマーを表示',
        settings: '設定',
        settingsDesc: 'アプリの設定を構成',
        
        // タスク関連
        startTask: '開始',
        cancelTask: 'キャンセル',
        cancelTimer: 'タイマーをキャンセル',
        modifyTime: '時間変更',
        setNewTime: '新しい時間を設定',
        backToTasks: 'タスクリストに戻る',
        backToTasksList: 'タスクリストに戻る',
        backToMain: 'メインメニューに戻る',
        noRunningTasks: '実行中のタイマーがありません',
        noRunningTasksDesc: 'タイマーを開始するとここに表示されます',
        noActiveTimers: 'アクティブなタイマーがありません。新規作成しますか？',
        getTasksFailed: '現在のタスクの取得に失敗しました',
        cannotReadTasks: '実行中のタスクを読み取れません',
        notStarted: '未開始',
        noDescription: '説明なし',
        
        // 時間関連
        endTime: '終了時刻',
        remaining: '残り',
        willFireAt: '{0} に終了します',
        setTimerFor: '{0} のタイマーを設定',
        timerFor: 'タイマー {0}',
        
        // 入力状態
        enterMessage: 'メッセージを入力してください（必須）',
        messageConfirm: 'メッセージ: "{0}"、Enterで確定',
        enterTimeFormat: '正しい時間形式を入力してください（例：30分、45秒、2時間）',
        modifyTimeTo: '{0} に変更',
        modifyTimeConfirm: 'タイマー時間を {0} に変更、Enterで確定',
        customTimeTo: 'カスタム {0}',
        customTimeConfirm: 'タイマーを {0} に設定、Enterで確定',
        
        // 通知関連
        timeUp: '時間です！',
        timerComplete: '{0} - 時間です！',
        timerNotification: '⏰ {0} 時間です！メッセージ: {1}',
        timerNotificationSimple: '⏰ {0} 時間です！',
        createWindowFailed: 'リマインダーウィンドウの作成に失敗しました。もう一度お試しください',
        
        // 検索
        noResults: '結果なし',
        noResultsDesc: '他のキーワードをお試しください',
        
        // 設定ページ
        settingsTitle: '設定',
        settingsBack: '戻る',
        settingsSearch: '設定を検索...',
        noSettingsFound: '一致する設定が見つかりません',
        
        // 外観設定
        appearanceSettings: '外観',
        appearanceDesc: '外観関連の設定',
        theme: 'テーマ',
        themeDesc: 'アプリのテーマモードを選択',
        themeSystem: 'システムに従う',
        themeDark: 'ダーク',
        themeLight: 'ライト',
        language: '言語',
        languageDesc: 'インターフェース言語を選択',
    }
};

/**
 * 支持的语言列表
 * 添加新语言时，在这里添加对应的选项
 */
const supportedLanguages = [
    { value: 'en', label: 'English' },
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'ja', label: '日本語' }
    // 添加更多语言示例:
    // { value: 'fr', label: 'Français' },
    // { value: 'es', label: 'Español' },
    // { value: 'de', label: 'Deutsch' },
];

// 导出配置（Node.js 环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        i18nMessages,
        supportedLanguages
    };
}

