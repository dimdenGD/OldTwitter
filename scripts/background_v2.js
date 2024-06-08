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
                    !details.originUrl.includes("/i/broadcasts") &&
                    !details.originUrl.includes("/i/communitynotes") &&
                    !details.originUrl.includes("tweetdeck.twitter.com") &&
                    !details.url.includes("ondemand.s.")
                ) && 
                ( // includes
                    details.url.includes("abs.twimg.com/responsive-web/client-web")
                )
        };
    }, {
        urls: ["*://*.twitter.com/*", "*://*.x.com/*", "*://*.twimg.com/*"]
    },
    ["blocking"]
);
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        if(!details.requestHeaders.find(h => h.name.toLowerCase() === 'origin')) details.requestHeaders.push({
            name: "Origin",
            value: "https://x.com"
        });
        return {
            requestHeaders: details.requestHeaders
        };
    }, {
        urls: ["*://*.twimg.com/*", "*://twimg.com/*"]
    },
    ["blocking", "requestHeaders"]
);
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        for (let i = 0; i < details.requestHeaders.length; i++) {
            if (details.requestHeaders[i].name.toLowerCase() === 'user-agent') {
                if (details.requestHeaders[i].value.toLowerCase().includes('firefox')) {
                    let rvRegex = /rv:(\d+\.\d+)/;
                    let rvMatch = details.requestHeaders[i].value.match(rvRegex);
                    if (rvMatch) {
                        let rv = parseFloat(rvMatch[1]);
                        if (rv < 110) {
                            details.requestHeaders[i].value = details.requestHeaders[i].value.replace(rvRegex, 'rv:110.0'); //twitter serves client-web-legacy if rv is less than 110, which breaks request signing
                        }
                    }
                }
                break;
            }
        }
        return {
            requestHeaders: details.requestHeaders
        };
    }, {
        urls: ["*://x.com/", "*://twitter.com/"]
    },
    ["blocking", "requestHeaders"]
);
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if(request.action === "inject") {
        console.log(request, sender.tab.id);
        chrome.scripting.executeScript({
            target: {
                tabId: sender.tab.id,
                allFrames : true
            },
            injectImmediately: true,
            files: request.files
        }).then(res => {
            console.log('injected', res);
        }).catch(e => {
            console.log('error injecting', e);
        });
    }
});