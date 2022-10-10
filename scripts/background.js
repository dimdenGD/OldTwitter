chrome.contextMenus.create({
    id: 'open_settings',
    title: 'Open settings',
    contexts: ['action']
});

chrome.contextMenus.onClicked.addListener(info => {
    if (info.menuItemId === 'open_settings') {
        chrome.tabs.create({
            url: 'https://twitter.com/old/settings'
        });
    }
});
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: 'https://twitter.com/old/settings'
    });
});