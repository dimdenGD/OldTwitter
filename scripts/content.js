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
        name: "tweet",
        paths: [/^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/likes(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/retweets(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/retweets\/with_comments(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/retweets(|\/)$/]
    },
    {
        name: "profile",
        paths: [/^\/[A-z-0-9-_]{1,15}$/g, /^\/[A-z-0-9-_]{1,15}\/$/, /^\/[A-z-0-9-_]{1,15}\/with_replies(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/media(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/likes(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/following(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/followers(|\/)$/, /^\/[A-z-0-9-_]{1,15}\/followers_you_follow(|\/)$/],
        exclude: ["/home", "/notifications", "/messages", "/settings", "/explore", "/login", "/register", "/logout", "/search"],
    },
];

let realPath = window.location.pathname.split('?')[0].split('#')[0];
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
if(/^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/photo\/\d+(|\/)$/.test(realPath)) {
    let path = realPath.split("/photo/")[0];
    location.href = path;
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
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    return caches.delete(key);
                }),
            );
        });
    }

    // invalidate manifest cache by blocking it
    try {
        await fetch('/manifest.json').then(response => response.text()).catch(e => { });
    } catch (e) { }

    let html = await fetch(chrome.runtime.getURL(`layouts/${page.name}/index.html`)).then(response => response.text());
    let css = await fetch(chrome.runtime.getURL(`layouts/${page.name}/style.css`)).then(response => response.text());
    let header_html = await fetch(chrome.runtime.getURL(`layouts/header/index.html`)).then(response => response.text());
    let header_css = await fetch(chrome.runtime.getURL(`layouts/header/style.css`)).then(response => response.text());

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