setInterval(() => {
    let xIcon = document.querySelector(
        'a[href^="https://twitter.com/home"] > div > svg, a[href^="https://x.com/home"] > div > svg'
    );
    if (xIcon) {
        let parent = xIcon.parentElement;
        let img = document.createElement("img");
        img.src = chrome.runtime.getURL("images/logo32_new.png");
        img.style.cssText =
            "width: 2em;height: 2em;image-rendering: -webkit-optimize-contrast;";
        parent.appendChild(img);
        xIcon.remove();
    }

    let title = document.querySelector("title");
    if (title) {
        if (title.innerText.endsWith(" / X")) {
            title.innerText = title.innerText.replace(" / X", " / Twitter");
        }
    }
}, 200);

function removeAndReplaceX(element) {
    if (element) {
        let parent = element.parentElement;
        let img = document.createElement("img");
        img.src = chrome.runtime.getURL("images/logo32_new.png");
        img.style.cssText =
            "width: 2em;height: 2em;image-rendering: -webkit-optimize-contrast;display: block;top: 50%;position: absolute;left: 50%;transform: translate(-50%, -50%);";
        parent.appendChild(img);
        element.remove();
        xObserver.disconnect();

        setTimeout(() => {
            img.remove();
        }, 500);
    }
}

const xObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === "SVG") {
                        removeAndReplaceX(node);
                    }
                    node.querySelectorAll("svg").forEach(removeAndReplaceX);
                }
            });
        }
    });
});

// Start observing the page for changes
xObserver.observe(document.documentElement, { childList: true, subtree: true });
