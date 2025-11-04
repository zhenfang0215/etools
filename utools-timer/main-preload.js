// 引入业务逻辑模块
const TimerBusiness = require('./index.js');
const DatabaseAPI = require('./database.js');
const { i18nMessages, supportedLanguages } = require('./i18n.js');

// 在 window 对象上注入业务逻辑，供主界面使用
if (typeof window !== 'undefined') {
    // 直接使用 index.js 中导出的模块
    window.TimerBusinessLogic = TimerBusiness;
    window.DatabaseAPI = DatabaseAPI;
    
    // 注入 i18n 配置
    window.i18nMessages = i18nMessages;
    window.supportedLanguages = supportedLanguages;
}


