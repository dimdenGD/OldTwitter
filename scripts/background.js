chrome.runtime.onInstalled.addListener(async () => {
    let vars = await new Promise((resolve, reject) => {
        chrome.storage.sync.get(['linkColor', 'font', 'heartsNotStars', 'linkColorsInTL', 'enableTwemoji', 'chronologicalTL'], data => {
            resolve(data);
        });
    });
    if(typeof(vars.linkColorsInTL) !== 'boolean') {
        chrome.storage.sync.set({
            linkColorsInTL: true
        }, () => {});
    }
    if(typeof(vars.enableTwemoji) !== 'boolean') {
        chrome.storage.sync.set({
            enableTwemoji: true
        }, () => {});
    }
    if(typeof(vars.chronologicalTL) !== 'boolean') {
        chrome.storage.sync.set({
            chronologicalTL: true
        }, () => {});
    }
});  