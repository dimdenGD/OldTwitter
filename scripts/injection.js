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
        paths: ["/i/bookmarks"],
        activeMenu: "pin-bookmarks"
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
        exclude: ["/home", "/notifications", "/messages", "/settings", "/explore", "/login", "/register", "/logout", "/search"]
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
    API.user.get(id, true).then(user => {
        if (user.error) {
            return;
        }
        location.replace("/" + user.screen_name);
    });
}
if (realPath === '/intent/user') {
    let id = location.search.split('user_id=')[1];
    API.user.get(id, true).then(user => {
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
const LANGUAGES = ["en", "ru", "uk", "fr", "pt_BR", "es", "el", "ro", "tl", "lv", "he", "ne", "nl", "ja", "tr", "it", "ar", "th", "ko", "pl", "vi", "zh_CN", "cs"];
const TRANSLATORS = {
    "ru": ["dimden", "https://dimden.dev/"],
    "uk": ["dimden", "https://dimden.dev/"],
    "fr": [
        ["Aurore C.", "https://asuure.com/"],
        ["zdimension", "https://twitter.com/zdimension_"]
    ],
    "pt_BR": [
        ["dzshn", "https://dzshn.xyz/"],
        ["kigi", "https://twitter.com/kigidere"],
        ["umgustavo", "https://github.com/umgustavo"]
    ],
    "es": [
        ["Ruchi", "https://twitter.com/anbulansia"],
        ["gaelcoral", "https://twitter.com/gaelcoral"],
        ["hue", "https://twitter.com/huey1116"]
    ],
    "el": ["VasilisTheChu", "https://pikachu.systems/"],
    "ro": [
        ["Skyrina", "https://skyrina.dev/"],
        ["AlexSem", "https://twitter.com/AlexSem5399"]
    ],
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
    "ko": [
        ["Nyankodasu", "https://github.com/Nyankodasu"],
        ["han_eirin", "https://twitter.com/han_eirin"]
    ],
    "pl": ["lele"],
    "vi": ["btmxh", "https://github.com/btmxh"],
    "zh_CN": ["am1006", "https://github.com/am1006"],
    "cs": ["Menal"]
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
function isDark() {
    let date = new Date();
    let hours = date.getHours();
    return hours <= 9 || hours >= 19;
}
let customCSS;
async function updateCustomCSS() {
    let data = await new Promise(resolve => {
        chrome.storage.sync.get(['customCSS'], data => {
            resolve(data);
        });
    });
    if(!data.customCSS) data.customCSS = '';
    if(customCSS) customCSS.remove();
    customCSS = document.createElement('style');
    customCSS.id = 'oldtwitter-custom-css';
    customCSS.innerHTML = data.customCSS;
    if(document.head) document.head.appendChild(customCSS);
    else {
        let int = setInterval(() => {
            if(document.head) {
                clearInterval(int);
                document.head.appendChild(customCSS);
            }
        }, 100);
    }
}
async function updateCustomCSSVariables() {
    let root = document.querySelector(":root");
    let data = await new Promise(resolve => {
        chrome.storage.sync.get(['customCSSVariables'], data => {
            resolve(data);
        });
    });
    if(data.customCSSVariables) {
        let csv = data.customCSSVariables.split('\n');
        csv.forEach(line => {
            let [name, value] = line.split(':');
            value = value.trim();
            if(value.endsWith(';')) value = value.slice(0, -1);
            root.style.setProperty(name, value);
        });
    }
}
function switchDarkMode(enabled) {
    let root = document.querySelector(":root");
    let theme;
    if(enabled) {
        if(vars.pitchBlack) {
            // Pitch black theme
            theme = `
                --background-color: #000000;
                --dark-background-color: #000000;
                --darker-background-color: #000000;
                --almost-black: #d4e3ed;
                --border: #222222;
                --darker-gray: #c9c9c9;
                --lil-darker-gray: #8394a1;
                --light-gray: #8394a1;
                --default-text-color: white;
                --new-tweet-over: rgb(0 0 0 / 92%);
                --input-background: #090a0a;
                --active-message: #0c0d0e;
                --more-color: #a088ff;
                --choice-bg: rgb(25 28 30);
                --list-actions-bg: #19212b;
                --menu-bg: rgb(16 19 22 / 98%);
            `;
        } else {
            // Dark theme
            theme = `
                --background-color: #1b2836;
                --dark-background-color: #171f2a;
                --darker-background-color: #141d26;
                --almost-black: #d4e3ed;
                --border: #2c3c52;
                --darker-gray: #c9c9c9;
                --lil-darker-gray: #8394a1;
                --light-gray: #8394a1;
                --default-text-color: white;
                --new-tweet-over: rgba(27, 40, 54, 0.92);
                --input-background: #15202a;
                --active-message: #141d26;
                --more-color: #a088ff;
                --choice-bg: rgb(44 62 71);
                --list-actions-bg: #19212b;
                --menu-bg: rgba(34,46,60,0.98);
            `;
        }
    } else {
        // Light theme
        theme = `
            --background-color: white;
            --dark-background-color: #f5f8fa;
            --darker-background-color: #f5f8fa;
            --almost-black: #292f33;
            --border: #e1e8ed;
            --darker-gray: #66757f;
            --lil-darker-gray: #6a7d8c;
            --light-gray: #8899a6;
            --default-text-color: black;
            --new-tweet-over: rgba(255, 255, 255, 0.92);
            --input-background: white;
            --active-message: #eaf5fd;
            --more-color: #30F;
            --choice-bg: rgb(207, 217, 222);
            --list-actions-bg: #efefef;
            --menu-bg: rgba(255,255,255,0.98);
        `;
    }
    let styles = theme.split('\n').map(i => i.trim()).filter(i => i).map(i => i.split(':'));
    styles.forEach(style => {
        if(style[1].endsWith(";")) style[1] = style[1].slice(0, -1);
        root.style.setProperty(style[0], style[1]);
    });
    updateCustomCSSVariables();
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
                        if(node.tagName === 'svg') {
                            node.remove();
                        }
                        node.querySelectorAll('svg').forEach(i => i.remove());
                    }
                });
            }
        });
    });
    
    // Start observing the page for changes
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // wait for variables
    if(!vars) {
        await varsPromise;
    }
    if(vars.darkMode || (vars.timeMode && isDark())) {
        isDarkModeEnabled = true;
        switchDarkMode(true);
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
    if(typeof(vars.enableHashflags) !== 'boolean') {
        vars.enableHashflags = false;
        chrome.storage.sync.set({
            enableHashflags: false
        }, () => {});
    }
    if(typeof(vars.copyLinksAs) !== 'string') {
        vars.copyLinksAs = 'twitter.com';
        chrome.storage.sync.set({
            copyLinksAs: 'twitter.com'
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
    if(typeof(vars.tweetFont) !== 'string') {
        vars.tweetFont = 'Arial';
        chrome.storage.sync.set({
            tweetFont: 'Arial'
        }, () => {});
    }
    if(typeof(vars.showOriginalImages) !== 'boolean') {
        vars.showOriginalImages = false;
        chrome.storage.sync.set({
            showOriginalImages: false
        }, () => {});
    }
    if(typeof(vars.useOldDefaultProfileImage) !== 'boolean') {
        vars.useOldDefaultProfileImage = true;
        chrome.storage.sync.set({
            useOldDefaultProfileImage: true
        }, () => {});
    }
    if(typeof(vars.pinProfileOnNavbar) !== 'boolean') {
        vars.pinProfileOnNavbar = true;
        chrome.storage.sync.set({
            pinProfileOnNavbar: true
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
        API.account.getSettings().then(settings => {
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
    LOC_EN.extension_id = {message: chrome.runtime.id};

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
    icon.href = chrome.runtime.getURL(`images/logo32${vars.useNewIcon ? '_new' : ''}.png`);
    icon.rel = "icon";
    icon.id = "site-icon";
    document.head.appendChild(icon);

    chrome.runtime.sendMessage({
        action: "inject",
        data: [
            "libraries/twemoji.min.js",
            "layouts/header/script.js",
            `layouts/${page.name}/script.js`,
            "scripts/tweetviewer.js",
            "libraries/gif.js",
            "libraries/viewer.min.js",
            "libraries/custom-elements.min.js",
            "libraries/emojipicker.js",
            "libraries/tinytoast.js"
        ]
    });
})();