chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.setUninstallURL('https://dimden.dev/ot/uninstall.html');
});

const redirectUrls = [
    ['abs.twimg.com/favicons/twitter.3.ico', 'images/logo32_new.png'],
    ['abs.twimg.com/favicons/twitter-pip.3.ico', 'images/logo32_new_notification.png'],
    ['abs.twimg.com/responsive-web/client-web/icon-default.', 'images/logo512.png'],
    ['abs.twimg.com/responsive-web/client-web/icon-default-maskable.', 'images/logo192.png'],
    ['abs.twimg.com/responsive-web/client-web/icon-default-large.', 'images/logo512.png'],
    ['abs.twimg.com/responsive-web/client-web/icon-default-maskable-large.', 'images/logo512.png'],
    ['abs.twimg.com/responsive-web/client-web/icon-ios.', 'images/logo32_new_notification.png'],
]

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        for(let i = 0; i < redirectUrls.length; i++) {
            if(details.url.includes(redirectUrls[i][0])) {
                return {
                    redirectUrl: chrome.runtime.getURL(redirectUrls[i][1])
                };
            }
        }
        if(details.url.includes("/sw.js")) {
            return { cancel: true };
        }
        return {
            cancel:
                ( // excludes
                    details.originUrl &&
                    !details.originUrl.includes("newtwitter=true") &&
                    !details.originUrl.includes("/i/flow/login") &&
                    !details.originUrl.includes("/settings/download_your_data") &&
                    !details.originUrl.includes("tweetdeck.twitter.com")
                ) && 
                ( // includes
                    details.url.includes("abs.twimg.com/responsive-web/client-web")
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
                details.responseHeaders[i].name.toLowerCase() === 'access-control-allow-origin'
            ) {
                details.responseHeaders.splice(i, 1);
            }
        }
        let origin = new URL(details.originUrl ? details.originUrl : details.url ? details.url : 'https://twitter.com').origin;
        if(!details.responseHeaders.find(h => h.name.toLowerCase() === 'access-control-allow-origin')) details.responseHeaders.push({
            name: "access-control-allow-origin",
            value: origin
        });
        return {
            responseHeaders: details.responseHeaders
        };
    }, {
        urls: ["*://twitter.com/*", "*://*.twitter.com/*", "*://*.twimg.com/*", "*://twimg.com/*"]
    },
    ["blocking", "responseHeaders"]
);