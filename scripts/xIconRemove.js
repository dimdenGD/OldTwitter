let xi = setInterval(() => {
    let xIcon = document.querySelector('svg.r-13v1u17.r-4qtqp9.r-yyyyoo.r-16y2uox.r-8kz0gk.r-dnmrzs.r-bnwqim.r-1plcrui.r-lrvibr.r-lrsllp');
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
    if(element && element.className && element.className.baseVal === 'r-1p0dtai r-16ek5rh r-4qtqp9 r-yyyyoo r-wy61xf r-1d2f490 r-ywje51 r-dnmrzs r-u8s1d r-zchlnj r-1plcrui r-ipm5af r-lrvibr r-1blnp2b') {
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