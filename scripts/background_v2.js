chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.setUninstallURL('https://dimden.dev/ot/uninstall.html');
});
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        return {
            cancel: (details.originUrl && !details.originUrl.includes("mobile.twitter.com")) && (details.url.includes("twitter.com/manifest.json") || details.url.includes("abs.twimg.com/responsive-web/client-web/"))
        };
    }, {
        urls: ["*://*.twitter.com/*", "*://*.twimg.com/*"]
    },
    ["blocking"]
);
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        if(!details.requestHeaders.find(h => h.name.toLowerCase() === 'origin')) details.requestHeaders.push({
            name: "Origin",
            value: "https://twitter.com"
        });
        return {
            requestHeaders: details.requestHeaders
        };
    }, {
        urls: ["*://*.twimg.com/*", "*://twimg.com/*"]
    },
    ["blocking", "requestHeaders"]
);
chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        for (let i = 0; i < details.responseHeaders.length; ++i) {
            if (details.responseHeaders[i].name.toLowerCase() === 'content-security-policy') {
                details.responseHeaders.splice(i, 1);
                break;
            }
        }
        if(!details.responseHeaders.find(h => h.name.toLowerCase() === 'access-control-allow-origin')) details.responseHeaders.push({
            name: "access-control-allow-origin",
            value: "*"
        });
        if(!details.responseHeaders.find(h => h.name.toLowerCase() === 'access-control-allow-headers')) details.responseHeaders.push({
            name: "access-control-allow-headers",
            value: "*"
        });
        return {
            responseHeaders: details.responseHeaders
        };
    }, {
        urls: ["*://twitter.com/*", "*://*.twitter.com/*", "*://*.twimg.com/*", "*://twimg.com/*"]
    },
    ["blocking", "responseHeaders"]
);