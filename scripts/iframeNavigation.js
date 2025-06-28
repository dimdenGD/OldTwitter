// i don't understand how this file works anymore please send help

function getFrameDepth(winToID) {
    if (winToID === window.top) {
        return 0;
    } else if (winToID.parent === window.top) {
        return 1;
    }

    return 1 + getFrameDepth(winToID.parent);
}

if (!window.top.windows && window.top === window) {
    window.top.windows = [];
    window.top._title = document.title;
    setTimeout(() => {
        window.top._title = document.title;
    }, 1000);
    setInterval(() => {
        let iframe = document.getElementsByClassName("iframe-navigation")[0];
        if (
            window.top.windows
                .slice(1)
                .some((w) => w.location.pathname === "/home") ||
            (iframe && iframe.src === "/home")
        ) {
            document.body.style.overflowY =
                window.previousOverflow && window.previousOverflow !== "hidden"
                    ? window.previousOverflow
                    : "auto";
            window.top.windows = [window];
            iframe.remove();
            window.focus();

            window.top.document.title = window.top._title;
        }
        if (!iframe) {
            window.top._title = document.title;
        }
    }, 250);
}
if (!window.top.windows.includes(window)) window.top.windows.push(window);
if (!window._realPath) window._realPath = location.pathname;
if (window.top !== window && location.protocol == "https:") {
    setTimeout(() => {
        window.top.document.title = document.title;
    }, 1000);
}

window.addEventListener("unload", () => {
    window.top.windows = window.top.windows.filter((w) => w !== window);
});

let lastNavigation = 0;
function useIframeNavigation(e) {
    if (e.defaultPrevented) return;
    if (typeof vars === "undefined") return;
    if (!vars.enableIframeNavigation) return;
    // because of dumb mozilla's policies need to turn off this feature
    // (they don't allow changing security headers so cant modify x-frame-options)
    if (navigator.userAgent.toLowerCase().includes("firefox")) return;

    let a = e.target.closest("a");
    if (
        !a ||
        !a.href ||
        a.href.startsWith("#") ||
        a.href.startsWith("javascript:") ||
        a.href.startsWith("blob:")
    )
        return;
    if (a.href.startsWith("http") && !a.href.startsWith(location.origin))
        return;

    let depth = getFrameDepth(window);
    if (depth > 3) return;

    let parsedURL = new URL(a.href);
    let windowExists = window.top.windows.findIndex(
        (w) => w._realPath === parsedURL.pathname
    );

    if (windowExists !== -1) {
        let we = window.top.windows[windowExists];
        let iframe = we.document.getElementsByClassName("iframe-navigation")[0];
        window.top.windows = window.top.windows.slice(0, windowExists + 1);
        we.document.body.style.overflowY =
            we.previousOverflow && we.previousOverflow !== "hidden"
                ? we.previousOverflow
                : "auto";
        we.focus();

        window.top.document.title = we.document.title;
        if (window.top.windows.length === 1)
            window.top.document.title = window.top._title;

        if (location.href !== a.href)
            window.top.history.pushState(null, null, a.href);
        if (iframe) iframe.remove();
        return;
    }

    if (window.top._realPath === "/" || window.top._realPath === "/home") {
        e.preventDefault();
        e.stopImmediatePropagation();

        window.previousOverflow = document.body.style.overflowY;
        document.body.style.overflowY = "hidden";

        if (location.href !== a.href)
            window.top.history.pushState(null, null, a.href);

        let iframe = document.createElement("iframe");
        iframe.classList.add("iframe-navigation");
        iframe.src = a.href;
        iframe.style = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            border: none;
            z-index: 99999;
            background-color: var(--background-color);
        `;
        document.body.appendChild(iframe);
        iframe.focus();
    }

    window.addEventListener("popstate", () => {
        let windowExists = window.top.windows.findIndex(
            (w) => w._realPath === location.pathname
        );

        if (windowExists !== -1) {
            let we = window.top.windows[windowExists];
            let iframe =
                we.document.getElementsByClassName("iframe-navigation")[0];
            window.top.windows = window.top.windows.slice(0, windowExists + 1);
            we.document.body.style.overflowY =
                we.previousOverflow && we.previousOverflow !== "hidden"
                    ? we.previousOverflow
                    : "auto";
            we.focus();

            window.top.document.title = we.document.title;
            if (window.top.windows.length === 1)
                window.top.document.title = window.top._title;

            if (iframe) iframe.remove();
        } else {
            if (
                location.pathname === "/notifications" ||
                location.pathname.includes("/status/")
            ) {
                let we =
                    window.top.windows[
                        Math.max(window.top.windows.length - 2, 0)
                    ];
                let iframe =
                    we.document.getElementsByClassName("iframe-navigation")[0];
                window.top.windows = window.top.windows.slice(
                    0,
                    window.top.windows.length - 1
                );
                if (window.top.windows.length === 0)
                    window.top.windows = [window];
                we.document.body.style.overflowY =
                    we.previousOverflow && we.previousOverflow !== "hidden"
                        ? we.previousOverflow
                        : "auto";
                we.focus();

                window.top.document.title = we.document.title;
                if (window.top.windows.length === 1)
                    window.top.document.title = window.top._title;

                if (iframe) iframe.remove();
            } else {
                if (Date.now() - lastNavigation < 20) return;
                lastNavigation = Date.now();
                useIframeNavigation({
                    target: { closest: () => ({ href: location.href }) },
                    preventDefault: () => {},
                    stopImmediatePropagation: () => {},
                });
            }
        }
    });
}

document.addEventListener("click", useIframeNavigation);
