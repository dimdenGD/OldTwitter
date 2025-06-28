let r = document.createElement("a");
let hrefUrl = new URL(location.href);
let searchParams = new URLSearchParams(hrefUrl.search);
searchParams.delete("newtwitter");
hrefUrl.search = searchParams.toString();
r.href = hrefUrl.toString();
setInterval(() => {
    let hrefUrl = new URL(location.href);
    let searchParams = new URLSearchParams(hrefUrl.search);
    searchParams.delete("newtwitter");
    hrefUrl.search = searchParams.toString();
    r.href = hrefUrl.toString();

    let realPath = location.pathname.split("?")[0].split("#")[0];
    if (realPath.endsWith("/")) {
        realPath = realPath.slice(0, -1);
    }
    if (
        /^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/analytics$/.test(realPath) ||
        (realPath.startsWith("/i/") &&
            realPath !== "/i/bookmarks" &&
            !realPath.startsWith("/i/lists/")) ||
        realPath === "/explore" ||
        realPath === "/login" ||
        realPath === "/register" ||
        realPath === "/logout" ||
        realPath === "/messages" ||
        realPath.endsWith("/tos") ||
        realPath.endsWith("/privacy") ||
        realPath.startsWith("/account/") ||
        realPath.endsWith("/lists") ||
        realPath.endsWith("/topics") ||
        realPath.startsWith("/settings/")
    ) {
        r.hidden = true;
    } else {
        r.hidden = false;
    }

    if (!location.search.includes("newtwitter=true")) {
        let url = new URL(location.href);
        url.searchParams.set("newtwitter", "true");
        history.replaceState(null, null, url.href);
    }
}, 500);
r.textContent = "Open this page in OldTwitter";
r.style.cssText =
    "position: fixed; top: 0; right: 10px; padding: 0.5em; background: #fff; color: #000; font-family: Arial, sans-serif;border-radius:3px;";
document.body.appendChild(r);

setTimeout(() => {
    let realPath = location.pathname.split("?")[0].split("#")[0];
    if (realPath.endsWith("/")) {
        realPath = realPath.slice(0, -1);
    }
    if (realPath === "/i/flow/login") {
        let i = setInterval(() => {
            let head = document.getElementById("modal-header");
            if (head) {
                clearInterval(i);
                let span = document.createElement("span");
                span.innerHTML = html`OldTwitter relies on internal APIs that
                    only work when you're logged in.<br />Please log in on this
                    page to see old Twitter layout.`;
                span.style.cssText = `display: block;margin: 0.5em 0px;color: #fbfeff;font-family: TwitterChirp;background: rgb(0 161 255 / 10%);padding: 8px;border-radius: 5px;`;
                head.after(span);
            }
        }, 500);
    }
}, 1000);

(() => {
    let keysHeld = {};
    function processHotkeys() {
        if (keysHeld["Alt"] && keysHeld["Control"] && keysHeld["KeyO"]) {
            let url = new URL(location.href);
            url.searchParams.delete("newtwitter");
            location.replace(url.href);
        }
    }
    window.addEventListener("keydown", (ev) => {
        let key = ev.code;
        if (key === "AltLeft" || key === "AltRight") key = "Alt";
        if (key === "ControlLeft" || key === "ControlRight") key = "Control";
        if (key === "ShiftLeft" || key === "ShiftRight") key = "Shift";
        keysHeld[key] = true;

        processHotkeys();
    });

    window.addEventListener("keyup", (ev) => {
        let key = ev.code;
        if (key === "AltLeft" || key === "AltRight") key = "Alt";
        if (key === "ControlLeft" || key === "ControlRight") key = "Control";
        if (key === "ShiftLeft" || key === "ShiftRight") key = "Shift";
        keysHeld[key] = true;
        processHotkeys();
        keysHeld[key] = false;
    });
})();

function modifyLink(a) {
    if (a.href && !a.href.includes("newtwitter=true")) {
        let url = new URL(a.href);
        url.searchParams.set("newtwitter", "true");
        a.href = url.href;
    }
}

const linkObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === "A") {
                        modifyLink(node);
                    }
                    node.querySelectorAll("a").forEach(modifyLink);
                }
            });
        }
    });
});

// Start observing the page for changes
linkObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
});
