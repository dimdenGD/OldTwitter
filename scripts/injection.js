let pages = [
    {
        name: "home",
        paths: ["/", "/home"],
        activeMenu: "home"
    },
    {
        name: "notifications",
        paths: ["/notifications", "/notifications/mentions"],
        activeMenu: "notifications"
    },
    {
        name: "settings",
        paths: ["/old/settings"]
    },
    {
        name: "search",
        paths: ["/search"]
    },
    {
        name: "bookmarks",
        paths: ["/i/bookmarks"]
    },
    {
        name: "lists",
        paths: [/^\/i\/lists\/\d+(\/members|\/followers|)$/]
    },
    {
        name: "topics",
        paths: [/^\/i\/topics\/\d+$/]
    },
    {
        name: "history",
        paths: ["/old/history"]
    },
    {
        name: "itl",
        paths: ["/i/timeline"]
    },
    {
        name: "tweet",
        paths: [/^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}(|\/likes|\/retweets|\/retweets\/with_comments|)$/]
    },
    {
        name: "profile",
        paths: [/^\/[A-z-0-9-_]{1,15}(\/with_replies|\/media|\/likes|\/following|\/followers|\/followers_you_follow|\/lists|)$/g],
        exclude: ["/home", "/notifications", "/messages", "/settings", "/explore", "/login", "/register", "/logout", "/search"],
    },
    {
        name: "unfollows",
        paths: ["/old/unfollows/followers", "/old/unfollows/following"]
    }
];

let realPath = location.pathname.split('?')[0].split('#')[0];
if (realPath.endsWith("/") && realPath !== "/") {
    location.replace(realPath.slice(0, -1));
}

if (realPath.startsWith("/i/user/")) {
    let id = realPath.split("/i/user/")[1];
    if (id.endsWith("/")) id = id.slice(0, -1);
    API.getUser(id, true).then(user => {
        if (user.error) {
            return;
        }
        location.replace("/" + user.screen_name);
    });
}
if (realPath === '/intent/user') {
    let id = location.search.split('user_id=')[1];
    API.getUser(id, true).then(user => {
        if (user.error) {
            return;
        }
        location.replace("/" + user.screen_name);
    });
}
if(/^\/direct_messages\/create\/[A-z-0-9-_]{1,15}$/.test(realPath)) {
    location.href = `https://twitter.com/${realPath.split("/direct_messages/create/")[1]}#dm`;
}
if(/^\/hashtag\/(.*?)/.test(realPath)) {
    let hashtag = realPath.split("/hashtag/").slice(1).join("/hashtag/");
    location.replace(`https://twitter.com/search?q=%23${hashtag}`);
}
if(/^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/(photo|video)\/\d+$/.test(realPath)) {
    let path = realPath.split("/photo/")[0];
    location.replace(path);
}
if(realPath === '/messages') {
    location.replace('/home#dm');
}
if(realPath === '/intent/tweet' || realPath === '/share') {
    location.replace('/home#' + location.search);
}
if(realPath === '/intent/follow') {
    let screen_name = location.search.split('screen_name=')[1].split('&')[0];
    location.replace(`/${screen_name}`);
}
if(
    /^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/analytics$/.test(realPath) ||
    /^\/i\/events\/\d{5,32}$/.test(realPath) ||
    realPath.startsWith('/settings/') ||
    realPath.startsWith('/i/flow/')
) {
    location.replace(location.href.replace('twitter.com', 'mobile.twitter.com'));
}
const LANGUAGES = ["en", "ru", "uk", "fr", "pt_BR", "es", "el", "ro", "tl", "lv", "he", "ne", "nl", "ja", "tr", "it", "ar", "th", "ko", "pl"];
const TRANSLATORS = {
    "ru": ["dimden", "https://dimden.dev/"],
    "uk": ["dimden", "https://dimden.dev/"],
    "fr": ["Aurore C.", "https://asuure.com/"],
    "pt_BR": [
        ["dzshn", "https://dzshn.xyz/"],
        ["kigi", "https://twitter.com/kigidere"]
    ],
    "es": [
        ["rogerpb98", "https://twitter.com/anbulansia"],
        ["gaelcoral", "https://github.com/gaelcoral"]
    ],
    "el": ["VasilisTheChu", "https://pikachu.systems/"],
    "ro": ["Skyrina", "https://skyrina.dev/"],
    "tl": ["Eurasian", "https://twitter.com/NotPROxV"],
    "lv": ["yourfriend", "https://3.141.lv/"],
    "he": ["ugh"],
    "ne": ["DimeDead", "https://dimedead.neocities.org/"],
    "nl": ["Puka1611"],
    "ja": [
        ["Chazuru", "https://twitter.com/AIWMD"],
        ["Nyankodasu", "https://github.com/Nyankodasu"]
    ],
    "tr": ["KayrabCebll", "https://steamcommunity.com/id/KayrabCebll"],
    "it": ["krek", "https://twitter.com/CactusInc420"],
    "ar": ["Yours Truly,", "https://twitter.com/schrotheneko"],
    "th": ["0.21%BloodAlcohol", "https://github.com/Silberweich"],
    "ko": ["Nyankodasu", "https://github.com/Nyankodasu"],
    "pl": ["lele"]
};
let LOC = {};
let LOC_EN = {};
let LANGUAGE = navigator.language.replace("-", "_");
if(!LANGUAGES.includes(LANGUAGE)) {
    LANGUAGE = LANGUAGE.split("_")[0];
    if(!LANGUAGES.includes(LANGUAGE)) {
        LANGUAGE = "en";
    }
}
let page = realPath === "" ? pages[0] : pages.find(p => (!p.exclude || !p.exclude.includes(realPath)) && (p.paths.includes(realPath) || p.paths.find(r => r instanceof RegExp && r.test(realPath))));
(async () => {
    if (!page) return;

    // block all twitters scripts
    function blockScriptElements(element) {
        if (element.tagName === 'SCRIPT') {
            element.type = 'javascript/blocked';
            const beforeScriptExecuteListener = function (event) {
                if(element.getAttribute('type') === 'javascript/blocked') {
                    event.preventDefault();
                }
                element.removeEventListener('beforescriptexecute', beforeScriptExecuteListener);
            }
            element.addEventListener('beforescriptexecute', beforeScriptExecuteListener);
            element.remove();
        }
    }
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        blockScriptElements(node);
                        node.querySelectorAll('script').forEach(blockScriptElements);
                    }
                });
            }
        });
    });
    
    // Start observing the page for changes
    observer.observe(document.documentElement, { childList: true, subtree: true });

    while(!vars) {
        await new Promise(r => setTimeout(r, 10));
    }

    // disable twitters service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (const registration of registrations) {
                registration.unregister()
            }
        });
        // clear cache of service worker
        if(window.caches) window.caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    return window.caches.delete(key);
                }),
            );
        });
    }

    // invalidate manifest cache by blocking it
    try {
        fetch('/manifest.json').then(response => response.text()).catch(e => {});
    } catch (e) {}

    // default variables
    if(typeof(vars.linkColorsInTL) !== 'boolean') {
        vars.linkColorsInTL = true;
        chrome.storage.sync.set({
            linkColorsInTL: true
        }, () => {});
    }
    if(typeof(vars.enableTwemoji) !== 'boolean') {
        vars.enableTwemoji = true;
        chrome.storage.sync.set({
            enableTwemoji: true
        }, () => {});
    }
    if(typeof(vars.timelineType) !== 'string') {
        let type;
        if(typeof(vars.chronologicalTL) === 'boolean') {
            type = vars.chronologicalTL ? 'chrono' : 'algo';
        } else {
            type = 'chrono-social';
        }
        vars.timelineType = type;
        chrome.storage.sync.set({
            timelineType: type
        }, () => {});
    }
    if(typeof(vars.showTopicTweets) !== 'boolean') {
        vars.showTopicTweets = true;
        chrome.storage.sync.set({
            showTopicTweets: true
        }, () => {});
    }
    if(typeof(vars.savePreferredQuality) !== 'boolean') {
        vars.savePreferredQuality = false;
        chrome.storage.sync.set({
            savePreferredQuality: false
        }, () => {});
    }
    if(typeof(vars.font) !== 'string') {
        vars.font = 'Arial';
        chrome.storage.sync.set({
            font: 'Arial'
        }, () => {});
    }
    if(typeof(vars.showOriginalImages) !== 'boolean') {
        vars.showOriginalImages = false;
        chrome.storage.sync.set({
            showOriginalImages: false
        }, () => {});
    }
    if(typeof(vars.roundAvatars) !== 'boolean') {
        vars.roundAvatars = false;
        chrome.storage.sync.set({
            roundAvatars: false
        }, () => {});
    }
    
    if(typeof(vars.darkMode) !== 'boolean' && document.body) {
        let bg = document.body.style.backgroundColor;
        let isDark = bg === 'rgb(21, 32, 43)' || bg === 'rgb(0, 0, 0)';
        vars.darkMode = isDark;
        chrome.storage.sync.set({
            darkMode: isDark
        }, () => {});
        let pitchBlack = bg === 'rgb(0, 0, 0)';
        vars.pitchBlack = pitchBlack;
        chrome.storage.sync.set({
            pitchBlack: pitchBlack
        }, () => {});
    }

    if(typeof(vars.autotranslateProfiles) !== 'object') {
        vars.autotranslateProfiles = [];
        chrome.storage.sync.set({
            autotranslateProfiles: []
        }, () => {});
    }
    if(!vars.displaySensitiveContentMoved) {
        API.getSettings().then(settings => {
            vars.displaySensitiveContent = settings.display_sensitive_media;
            chrome.storage.sync.set({
                displaySensitiveContentMoved: true,
                displaySensitiveContent: settings.display_sensitive_media
            }, () => {});
        });
    }
    if(typeof(vars.language) !== 'string') {
        chrome.storage.sync.set({
            language: LANGUAGE
        }, () => {});
    } else {
        LANGUAGE = LANGUAGES.includes(vars.language) ? vars.language : "en";
    }

    let [LOC_DATA, LOC_EN_DATA, html, css, header_html, header_css] = await Promise.all([
        fetch(chrome.runtime.getURL(`_locales/${LANGUAGE}/messages.json`)).then(response => response.json()),
        fetch(chrome.runtime.getURL(`_locales/en/messages.json`)).then(response => response.json()),
        fetch(chrome.runtime.getURL(`layouts/${page.name}/index.html`)).then(response => response.text()),
        fetch(chrome.runtime.getURL(`layouts/${page.name}/style.css`)).then(response => response.text()),
        fetch(chrome.runtime.getURL(`layouts/header/index.html`)).then(response => response.text()),
        fetch(chrome.runtime.getURL(`layouts/header/style.css`)).then(response => response.text())
    ]);
    LOC = LOC_DATA; LOC_EN = LOC_EN_DATA;

    // internationalization
    for(let i in LOC_EN) {
        if(!LOC[i]) {
            LOC[i] = LOC_EN[i];
        }
    }
    let msgs = html.match(/__MSG_(\w+)__/g);
    if (msgs) {
        for (let i = 0; i < msgs.length; i++) {
            let m = msgs[i].slice(6, -2);
            if(LOC[m]) html = replaceAll(html, msgs[i], LOC[m].message);
        }
    }
    msgs = header_html.match(/__MSG_(\w+)__/g);
    if (msgs) {
        for (let i = 0; i < msgs.length; i++) {
            let m = msgs[i].slice(6, -2);
            if(LOC[m]) header_html = replaceAll(header_html, msgs[i], LOC[m].message);
        }
    }

    let body = document.querySelector('body[style^="background"]');
    if(body) {
        body.remove();
    } else {
        let cleared = false;
        let removeInt = setInterval(() => {
            let body = document.querySelector('body[style^="background"]');
            if(body) {
                clearInterval(removeInt);
                cleared = true;
                body.remove();
            };
        }, 25);
        setTimeout(() => {
            if(!cleared) clearInterval(removeInt);
        }, 5000);
    };

    document.documentElement.innerHTML = html;

    observer.disconnect();

    document.getElementsByTagName('header')[0].innerHTML = header_html;
    if (page.activeMenu) {
        let el = document.getElementById(page.activeMenu);
        el.classList.add("menu-active");
    }
    let version = document.getElementById('oldtwitter-version');
    if (version) {
        version.innerText = chrome.runtime.getManifest().version;
    }

    let style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
    let header_style = document.createElement("style");
    header_style.innerHTML = header_css;
    document.head.appendChild(header_style);

    let icon = document.createElement("link");
    icon.href = chrome.runtime.getURL(`images/logo32.png`);
    icon.rel = "icon";
    icon.id = "site-icon";
    document.head.appendChild(icon);

    chrome.runtime.sendMessage({
        action: "inject",
        data: [
            "libraries/twemoji.min.js",
            "libraries/custom-elements.min.js",
            "libraries/emojipicker.js",
            "layouts/header/script.js",
            `layouts/${page.name}/script.js`,
            "scripts/tweetviewer.js",
            "libraries/gif.js",
            "libraries/viewer.min.js"
        ]
    });
})();