// block all twitters scripts
function blockScriptElements(element) {
    if (element.tagName === "SCRIPT") {
        element.type = "javascript/blocked";
        const beforeScriptExecuteListener = function (event) {
            if (element.getAttribute("type") === "javascript/blocked") {
                event.preventDefault();
            }
            element.removeEventListener(
                "beforescriptexecute",
                beforeScriptExecuteListener
            );
        };
        element.addEventListener(
            "beforescriptexecute",
            beforeScriptExecuteListener
        );
        element.remove();
    }
}

const blockingObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    blockScriptElements(node);
                    node.querySelectorAll("script").forEach(
                        blockScriptElements
                    );
                    if (node.tagName === "SVG") {
                        node.remove();
                    }
                    if (node.id === "placeholder") {
                        node.remove();
                    }
                    node.querySelectorAll("svg").forEach((i) => i.remove());
                    if (document.getElementById("placeholder"))
                        document.getElementById("placeholder").remove();
                }
            });
        }
    });
});

// Start observing the page for changes
blockingObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
});
