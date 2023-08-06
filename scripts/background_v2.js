chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.setUninstallURL('https://dimden.dev/ot/uninstall.html');
});
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if(details.url.includes('abs.twimg.com/favicons/twitter.3.ico')) {
            return {
                redirectUrl: chrome.runtime.getURL('images/logo32_new.png')
            };
        } else if(details.url.includes('abs.twimg.com/favicons/twitter-pip.3.ico')) {
            return {
                redirectUrl: chrome.runtime.getURL('images/logo32_new_notification.png')
            };
        }
        if(details.url.includes("twitter.com/manifest.json") || details.url.includes("/sw.js")) {
            return { cancel: true };
        }
        return {
            cancel:
                ( // excludes
                    details.originUrl &&
                    !details.originUrl.includes("newtwitter=true") &&
                    !details.originUrl.includes("/i/flow/login") &&
                    !details.originUrl.includes("/settings/download_your_data")
                ) && 
                ( // includes
                    details.url.includes("abs.twimg.com/responsive-web/client-web/")
                )
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
        for (let i = details.responseHeaders.length - 1; i >= 0; i--) {
            if (
                details.responseHeaders[i].name.toLowerCase() === 'content-security-policy' ||
                details.responseHeaders[i].name.toLowerCase() === 'x-frame-options' ||
                details.responseHeaders[i].name.toLowerCase() === 'access-control-allow-origin' ||
                details.responseHeaders[i].name.toLowerCase() === 'access-control-allow-headers' ||
                details.responseHeaders[i].name.toLowerCase() === 'access-control-allow-methods' ||
                details.responseHeaders[i].name.toLowerCase() === 'access-control-allow-credentials'
            ) {
                details.responseHeaders.splice(i, 1);
            }
        }
        if(!details.responseHeaders.find(h => h.name.toLowerCase() === 'access-control-allow-origin')) details.responseHeaders.push({
            name: "access-control-allow-origin",
            value: "https://twitter.com"
        });
        if(!details.responseHeaders.find(h => h.name.toLowerCase() === 'access-control-allow-headers')) details.responseHeaders.push({
            name: "access-control-allow-headers",
            value: "*"
        });
        if(!details.responseHeaders.find(h => h.name.toLowerCase() === 'access-control-allow-methods')) details.responseHeaders.push({
            name: "access-control-allow-methods",
            value: "*"
        });
        if(!details.responseHeaders.find(h => h.name.toLowerCase() === 'access-control-allow-credentials')) details.responseHeaders.push({
            name: "access-control-allow-credentials",
            value: "true"
        });
        return {
            responseHeaders: details.responseHeaders
        };
    }, {
        urls: ["*://twitter.com/*", "*://*.twitter.com/*", "*://*.twimg.com/*", "*://twimg.com/*"]
    },
    ["blocking", "responseHeaders"]
);