let xi = setInterval(() => {
    let xIcon = document.querySelector('a[href^="https://twitter.com/home"] > div > svg');
    if(xIcon) {
        let parent = xIcon.parentElement;
        let img = document.createElement('img');
        img.src = chrome.runtime.getURL('images/logo32_new.png');
        img.style.cssText = 'width: 2em;height: 2em;image-rendering: -webkit-optimize-contrast;filter: brightness(99);';
        parent.appendChild(img);
        xIcon.remove();
        clearInterval(xi);
    };
});

function removeAndReplaceX(element) {
    if(element) {
        let parent = element.parentElement;
        let img = document.createElement('img');
        img.src = chrome.runtime.getURL('images/logo32_new.png');
        img.style.cssText = 'width: 2em;height: 2em;image-rendering: -webkit-optimize-contrast;filter: brightness(99);display: block;top: 50%;position: absolute;left: 50%;transform: translate(-50%, -50%);';
        parent.appendChild(img);
        element.remove();
        xObserver.disconnect();
    };
}

const xObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if(node.tagName === 'SVG') {
                        removeAndReplaceX(node);
                    }
                    node.querySelectorAll('svg').forEach(removeAndReplaceX);
                }
            });
        }
    });
});

// Start observing the page for changes
xObserver.observe(document.documentElement, { childList: true, subtree: true });