// Anki Cards Preload
// 预加载脚本，提供与 uTools 交互的能力

const https = require('https');
const http = require('http');

//的 API 域名列表
const PRESET_DOMAINS = [
    { label: '生产环境', value: 'https://47.121.183.235' },
    { label: '本地开发', value: 'http://localhost:8080' }
];

//的牌组列表
const PRESET_DECKS = [
    { label: 'Default', value: 'Default' },
    { label: '微服务::微服务基础', value: '微服务::微服务基础' },
    { label: 'English', value: 'English' },
    { label: '学习::编程', value: '学习::编程' },
    { label: '学习::数学', value: '学习::数学' },
    { label: '工作::项目管理', value: '工作::项目管理' },
    { label: '生活::日常', value: '生活::日常' }
];

// 使用 Node.js 发送 HTTP 请求（绑过 CORS 限制）
function httpRequest(url, options, data) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const lib = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            // 忽略 SSL 证书验证（用于 IP 地址的 HTTPS）
            rejectUnauthorized: false
        };
        
        const req = lib.request(requestOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ ok: false, status: res.statusCode, data: { error: body || 'Parse error' } });
                }
            });
        });
        
        req.on('error', (e) => {
            reject(new Error(e.message));
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('请求超时'));
        });
        
        if (data) {
            req.write(data);
        }
        req.end();
    });
}

// 提交卡片到 Anki API
async function submitCard(domain, cardData) {
    const url = `${domain}/wx/api/v1/anki/cards`;
    
    try {
        const response = await httpRequest(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, JSON.stringify(cardData));
        
        if (!response.ok) {
            return { success: false, error: response.data?.error || `HTTP ${response.status}` };
        }
        
        return { success: true, id: response.data?.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 批量提交卡片
async function submitCards(domain, cards, onProgress) {
    const results = [];
    
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const result = await submitCard(domain, card);
        results.push({ index: i, ...result });
        
        if (onProgress) {
            onProgress(i, cards.length, result);
        }
    }
    
    return results;
}

// 获取所有可用的牌组（预设 + 用户自定义）
function getAllDecks() {
    const customDecks = utools.dbStorage.getItem('anki_custom_decks') || [];
    //预设牌组标记 isPreset=true
    const presetDecks = PRESET_DECKS.map(d => ({ ...d, isPreset: true }));
    const customDeckItems = customDecks.map(name => ({ label: name, value: name, isPreset: false }));
    return [...presetDecks, ...customDeckItems];
}

// 添加自定义牌组
function addCustomDeck(deckName) {
    if (!deckName.trim()) return false;
    
    const customDecks = utools.dbStorage.getItem('anki_custom_decks') || [];
    if (customDecks.includes(deckName.trim())) return false; //重复
    
    customDecks.push(deckName.trim());
    utools.dbStorage.setItem('anki_custom_decks', customDecks);
    return true;
}

// 删除自定义牌组
function removeCustomDeck(deckName) {
    const customDecks = utools.dbStorage.getItem('anki_custom_decks') || [];
    const newDecks = customDecks.filter(name => name !== deckName);
    utools.dbStorage.setItem('anki_custom_decks', newDecks);
    return newDecks.length < customDecks.length; //返回是否删除成功
}

// 获取自定义牌组列表（仅自定义的）
function getCustomDecks() {
    return utools.dbStorage.getItem('anki_custom_decks') || [];
}
window.ankiApi = {
    presetDomains: PRESET_DOMAINS,
    presetDecks: PRESET_DECKS,
    getAllDecks,
    addCustomDeck,
    removeCustomDeck,
    getCustomDecks,
    submitCard,
    submitCards
};

//存储相关
window.ankiStorage = {
    getDomain: () => utools.dbStorage.getItem('anki_domain') || PRESET_DOMAINS[0].value,
    setDomain: (domain) => utools.dbStorage.setItem('anki_domain', domain),
    getDefaultDeck: () => utools.dbStorage.getItem('anki_default_deck') || '',
    setDefaultDeck: (deck) => utools.dbStorage.setItem('anki_default_deck', deck),
    getDefaultTags: () => utools.dbStorage.getItem('anki_default_tags') || '',
    setDefaultTags: (tags) => utools.dbStorage.setItem('anki_default_tags', tags),
    //牌相关存储
    getCustomDecks: () => utools.dbStorage.getItem('anki_custom_decks') || [],
    setCustomDecks: (decks) => utools.dbStorage.setItem('anki_custom_decks', decks)
};
