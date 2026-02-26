// Anki Cards Preload
// 预加载脚本，提供与 uTools 交互的能力

const https = require('https');
const http = require('http');

// 预设的 API 域名列表
const PRESET_DOMAINS = [
    { label: '本地开发', value: 'http://localhost:8080' },
    { label: '生产环境', value: 'https://47.121.183.235' }
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

// 暴露给渲染进程
window.ankiApi = {
    presetDomains: PRESET_DOMAINS,
    submitCard,
    submitCards
};

// 存储相关
window.ankiStorage = {
    getDomain: () => utools.dbStorage.getItem('anki_domain') || PRESET_DOMAINS[0].value,
    setDomain: (domain) => utools.dbStorage.setItem('anki_domain', domain),
    getDefaultDeck: () => utools.dbStorage.getItem('anki_default_deck') || '',
    setDefaultDeck: (deck) => utools.dbStorage.setItem('anki_default_deck', deck),
    getDefaultTags: () => utools.dbStorage.getItem('anki_default_tags') || '',
    setDefaultTags: (tags) => utools.dbStorage.setItem('anki_default_tags', tags)
};
