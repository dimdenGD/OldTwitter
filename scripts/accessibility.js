// Accessibility helpers for screen reader and keyboard users.
// Adds roles, names and states to custom controls (spans/divs used as buttons),
// keeps them in sync when OldTwitter updates counts or classes,
// and provides one polite live region for short announcements.
(() => {
    if (window.oldTwitterA11yLoaded) return;
    window.oldTwitterA11yLoaded = true;

    // One polite live region for the whole page
    function getLiveRegion() {
        let region = document.getElementById("a11y-live-region");
        if (!region) {
            region = document.createElement("div");
            region.id = "a11y-live-region";
            region.setAttribute("aria-live", "polite");
            region.setAttribute("aria-atomic", "true");
            region.style.cssText =
                "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
            document.body.appendChild(region);
        }
        return region;
    }
    let announceTimeout;
    window.a11yAnnounce = function (text) {
        let region = getLiveRegion();
        region.textContent = "";
        clearTimeout(announceTimeout);
        // small delay so the same text twice in a row is still announced
        announceTimeout = setTimeout(() => (region.textContent = text), 100);
    };

    function loc(key, fallback) {
        return typeof LOC !== "undefined" && LOC[key] ? LOC[key].message : fallback;
    }

    // "Reply (R)" -> "Reply"
    function stripHotkey(title) {
        return (title || "").replace(/\s*\([^)]*\)\s*$/, "").trim();
    }

    function setAttr(el, name, value) {
        if (el.getAttribute(name) !== value) el.setAttribute(name, value);
    }

    function makeButton(el) {
        setAttr(el, "role", "button");
        if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
    }

    const pressedClasses = {
        "tweet-interact-retweet": "tweet-interact-retweeted",
        "tweet-interact-favorite": "tweet-interact-favorited",
        "tweet-interact-bookmark": "tweet-interact-bookmarked",
    };

    function enhanceTweetButton(el) {
        makeButton(el);
        let name = stripHotkey(el.title);
        if (el.classList.contains("tweet-interact-more")) {
            name = loc("more_actions", "More");
        } else if (el.classList.contains("tweet-delete-bookmark")) {
            name = loc("remove_bookmark", "Remove bookmark");
        }
        if (!name) return;
        let count = el.dataset.val;
        let label = name;
        if (typeof count !== "undefined" && count !== "" && !isNaN(+count)) {
            label += `, ${(+count).toLocaleString()}`;
        }
        setAttr(el, "aria-label", label);
        for (let cls in pressedClasses) {
            if (el.classList.contains(cls)) {
                setAttr(el, "aria-pressed", el.classList.contains(pressedClasses[cls]) ? "true" : "false");
            }
        }
        if (
            el.classList.contains("tweet-interact-retweet") ||
            el.classList.contains("tweet-interact-more")
        ) {
            setAttr(el, "aria-haspopup", "menu");
        }
        if (el.classList.contains("tweet-interact-retweet-disabled")) {
            setAttr(el, "aria-disabled", "true");
        } else if (el.hasAttribute("aria-disabled")) {
            el.removeAttribute("aria-disabled");
        }
    }

    function enhanceDropdownItems(menu) {
        // menu items are spans; a span that only wraps a link is left alone
        for (let item of menu.children) {
            if (item.tagName !== "SPAN" || item.hasAttribute("role")) continue;
            if (item.querySelector("a, button, input, span")) continue;
            makeButton(item);
        }
    }

    // Character counters show "used/limit"; announce only when a threshold is crossed
    const counterSelector =
        "#new-tweet-char, .new-tweet-char, .navbar-new-tweet-char, .tweet-reply-char, .tweet-quote-char";
    const counterState = new WeakMap();
    function checkCounter(el) {
        let m = (el.textContent || "").trim().match(/^(\d+)\s*\/\s*(\d+)$/);
        if (!m) return;
        let left = +m[2] - +m[1];
        let state = left < 0 ? "over" : left === 0 ? "zero" : left <= 20 ? "near" : "ok";
        let previous = counterState.get(el) || "ok";
        counterState.set(el, state);
        if (state === previous || state === "ok") return;
        if (state === "over") {
            a11yAnnounce(loc("chars_over_limit", "Over the character limit"));
        } else {
            a11yAnnounce(loc("chars_left", "$COUNT$ characters left").replace("$COUNT$", left));
        }
    }

    function enhance(el) {
        if (!(el instanceof Element)) return;
        let cl = el.classList;
        if (cl.contains("tweet-button")) {
            enhanceTweetButton(el);
        } else if (cl.contains("tweet-interact-retweet-menu") || cl.contains("tweet-interact-more-menu")) {
            enhanceDropdownItems(el);
        } else if (cl.contains("search-switch")) {
            makeButton(el);
            if (el.id !== "advanced") {
                setAttr(el, "aria-pressed", cl.contains("search-switch-active") ? "true" : "false");
            }
        } else if (el.parentElement && el.parentElement.id === "tweet-nav" && el.tagName === "A") {
            if (cl.contains("tweet-nav-active")) setAttr(el, "aria-current", "page");
            else if (el.hasAttribute("aria-current")) el.removeAttribute("aria-current");
        } else if (el.parentElement && el.parentElement.id === "navbar-links" && el.tagName === "A") {
            if (cl.contains("menu-active")) setAttr(el, "aria-current", "page");
            else if (el.hasAttribute("aria-current")) el.removeAttribute("aria-current");
        } else if (el.tagName === "A" && (cl.contains("tweet-time") || cl.contains("tweet-time-quote"))) {
            // relative time ("5m") is visible; give the full date to screen readers
            if (el.title) setAttr(el, "aria-label", el.title);
        } else if (el.id === "navbar-user-menu") {
            let avatar = document.getElementById("navbar-user-avatar");
            if (avatar) setAttr(avatar, "aria-expanded", el.hidden ? "false" : "true");
        } else if (el.matches(counterSelector)) {
            checkCounter(el);
        } else if (el.matches(extraButtonSelector)) {
            makeButton(el);
        } else if (el.id === "bulletpoint") {
            setAttr(el, "aria-hidden", "true");
        } else if (el.tagName === "TEXTAREA") {
            // the placeholder disappears once you type; keep it as the label
            if (!el.hasAttribute("aria-label") && !el.labels.length && el.placeholder) {
                setAttr(el, "aria-label", el.placeholder);
            }
        }
    }

    // other spans/divs that act as buttons
    const extraButtonSelector = "#wtf-refresh, #trends-refresh, #load-more";

    const scanSelector = [
        extraButtonSelector,
        "#bulletpoint",
        "textarea[placeholder]",
        ".tweet-button",
        ".tweet-interact-retweet-menu",
        ".tweet-interact-more-menu",
        ".search-switch",
        "#tweet-nav > a",
        "#navbar-links > a",
        "a.tweet-time",
        "a.tweet-time-quote",
        "#navbar-user-menu",
    ].join(",");

    function scan(root) {
        if (!(root instanceof Element)) return;
        if (root.matches(scanSelector)) enhance(root);
        root.querySelectorAll(scanSelector).forEach(enhance);
    }

    let observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === "attributes") {
                enhance(mutation.target);
            } else {
                let target = mutation.target;
                if (target instanceof Element) {
                    if (target.matches(counterSelector)) checkCounter(target);
                    else if (target.classList.contains("tweet-button")) enhanceTweetButton(target);
                }
                mutation.addedNodes.forEach(scan);
            }
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "data-val", "title", "hidden"],
    });
    scan(document.body);

    // Enter / Space activate custom buttons (spans and divs with role="button")
    document.addEventListener(
        "keydown",
        (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
            let target = e.target;
            if (!(target instanceof Element)) return;
            if (target.getAttribute("role") !== "button") return;
            if (["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            target.click();
        },
        true
    );
})();
