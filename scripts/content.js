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
        name: "tweet",
        paths: [/^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/likes(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/retweets(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/retweets\/with_comments(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/retweets(|\/)$/]
    },
    {
        name: "profile",
        paths: [/^\/[A-z-0-9-_]{1,15}(\/with_replies|\/media|\/likes|\/following|\/followers|\/followers_you_follow|\/lists|)$/g],
        exclude: ["/home", "/notifications", "/messages", "/settings", "/explore", "/login", "/register", "/logout", "/search"],
    },
];

let realPath = location.pathname.split('?')[0].split('#')[0];
if (realPath.endsWith("/")) {
    realPath = realPath.slice(0, -1);
}

if (realPath.startsWith("/i/user/")) {
    let id = realPath.split("/i/user/")[1];
    if (id.endsWith("/")) id = id.slice(0, -1);
    API.getUser(id, true).then(user => {
        if (user.error) {
            return;
        }
        location.href = "/" + user.screen_name;
    });
}
if(/^\/direct_messages\/create\/[A-z-0-9-_]{1,15}$/.test(realPath)) {
    location.href = `https://twitter.com/${realPath.split("/direct_messages/create/")[1]}#dm`;
}
if(/^\/hashtag\/(.*?)/.test(realPath)) {
    location.href = `https://twitter.com/search?q=%23${encodeURIComponent(realPath.split("/hashtag/")[1])}`;
}
if(/^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/photo\/\d+(|\/)$/.test(realPath)) {
    let path = realPath.split("/photo/")[0];
    location.href = path;
}
if(/^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/video\/\d+(|\/)$/.test(realPath)) {
    let path = realPath.split("/video/")[0];
    location.href = path;
}
if(/^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/analytics(|\/)$/.test(realPath)) {
    location.href = location.href.replace('twitter.com', 'mobile.twitter.com');
}
const LANGUAGES = ["en", "ru", "uk", "fr", "pt_BR", "es", "gr", "ro", "tl", "lv"];
const TRANSLATORS = {
    "ru": ["dimden", "https://dimden.dev/"],
    "uk": ["dimden", "https://dimden.dev/"],
    "fr": ["Aurore C.", "https://asuure.com/"],
    "pt_BR": ["dzshn", "https://dzshn.xyz/"],
    "es": ["rogerpb98", "https://twitter.com/anbulansia"],
    "gr": ["VasilisTheChu", "https://pikachu.systems/"],
    "ro": ["Skylar", "https://143.dust.moe/"],
    "tl": ["Eurasian", "https://twitter.com/NotPROxV"],
    "lv": ["yourfriend", "https://3.141.lv/"]
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
        await fetch('/manifest.json').then(response => response.text()).catch(e => {});
    } catch (e) {}

    // default variables
    let vars = await new Promise(resolve => {
        chrome.storage.sync.get([
            'linkColor', 'font', 'heartsNotStars', 'linkColorsInTL', 'enableTwemoji',
            'chronologicalTL', 'timelineType', 'showTopicTweets', 'savePreferredQuality',
            'language'
        ], data => {
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
    if(typeof(vars.timelineType) !== 'string') {
        let type;
        if(typeof(vars.chronologicalTL) === 'boolean') {
            type = vars.chronologicalTL ? 'chrono' : 'algo';
        } else {
            type = 'chrono';
        }
        chrome.storage.sync.set({
            timelineType: type
        }, () => {});
    }
    if(typeof(vars.showTopicTweets) !== 'boolean') {
        chrome.storage.sync.set({
            showTopicTweets: true
        }, () => {});
    }
    if(typeof(vars.savePreferredQuality) !== 'boolean') {
        chrome.storage.sync.set({
            savePreferredQuality: true
        }, () => {});
    }
    if(typeof(vars.language) !== 'string') {
        chrome.storage.sync.set({
            language: LANGUAGE
        }, () => {});
    } else {
        LANGUAGE = LANGUAGES.includes(vars.language) ? vars.language : "en";
    }

    LOC = await fetch(chrome.runtime.getURL(`_locales/${LANGUAGE}/messages.json`)).then(response => response.json());
    LOC_EN = await fetch(chrome.runtime.getURL(`_locales/en/messages.json`)).then(response => response.json());
    let html = await fetch(chrome.runtime.getURL(`layouts/${page.name}/index.html`)).then(response => response.text());
    let css = await fetch(chrome.runtime.getURL(`layouts/${page.name}/style.css`)).then(response => response.text());
    let header_html = await fetch(chrome.runtime.getURL(`layouts/header/index.html`)).then(response => response.text());
    let header_css = await fetch(chrome.runtime.getURL(`layouts/header/style.css`)).then(response => response.text());

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

    document.open();
    document.write(html);
    document.close();
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

    setInterval(() => {
        let donateButton = document.getElementById('donate-button');
        donateButton.style.color = "var(--link-color)";
        setTimeout(() => {
            donateButton.style.color = "";
        }, 2000);
    }, 10000);
})();