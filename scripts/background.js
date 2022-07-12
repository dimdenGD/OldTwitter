let isRunning = false;

let getCurrentTab = async () => {
    let queryOptions = { active: true, lastFocusedWindow: true }
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions)

    return tab
}

let isCSPDisabled = async () => {
    let rules = await chrome.declarativeNetRequest.getSessionRules(),
        urls = rules.map(rule => rule.condition.urlFilter),
        { url } = await getCurrentTab();

    return urls.some(item => item === url);
}

let disableCSP = async (id) => {
    let { url } = await getCurrentTab();
    if(!url || !id) return;
    isRunning = true;

    let addRules = [];
    let removeRuleIds = [];

    if (!await isCSPDisabled()) {
        addRules.push({
            id,
            action: {
                type: 'modifyHeaders',
                responseHeaders: [{ header: 'content-security-policy', operation: 'set', value: '' }]
            },
            condition: { urlFilter: url, resourceTypes: ['main_frame', 'sub_frame'] }
        });

        chrome.browsingData.remove({}, { serviceWorkers: true }, () => { });
    } else {
        let rules = await chrome.declarativeNetRequest.getSessionRules();
        rules.forEach(rule => {
            if (rule.condition.urlFilter === url) {
                removeRuleIds.push(rule.id)
            };
        });
    }

    await chrome.declarativeNetRequest.updateSessionRules({ addRules, removeRuleIds });

    isRunning = false;
}

chrome.tabs.onActivated.addListener((tab) => disableCSP(tab.tabId));
chrome.tabs.onUpdated.addListener((tab) => disableCSP(tab.tabId));