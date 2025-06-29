chrome.contextMenus.create({
    id: "open_settings",
    title: "Open settings",
    contexts: ["action"],
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.setUninstallURL("https://dimden.dev/ot/uninstall.html");
});

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "open_settings") {
        chrome.tabs.create({
            url: "https://twitter.com/old/settings",
        });
    }
});
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: "https://twitter.com/old/settings",
    });
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "inject") {
        console.log(request, sender.tab.id);
        chrome.scripting
            .executeScript({
                target: {
                    tabId: sender.tab.id,
                    allFrames: true,
                },
                injectImmediately: true,
                files: request.files,
            })
            .then((res) => {
                console.log("injected", res);
            })
            .catch((e) => {
                console.log("error injecting", e);
            });
    }
});
