const isNewTwitterPage = location.search.includes("newtwitter=true");
if (isNewTwitterPage) {
    let injectNewTwitter = () => chrome.runtime.sendMessage({ action: "injectNewTwitter" });
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", injectNewTwitter);
    } else {
        injectNewTwitter();
    }
}

const iframeHostPath = "/i/release_notes";
if (window.top !== window && location.pathname === iframeHostPath) {
    let otPath = new URLSearchParams(location.search).get("ot_path");
    if (otPath && otPath.startsWith("/") && !otPath.startsWith("//")) {
        history.replaceState(null, "", otPath);
    }
    let hideStyle = document.createElement("style");
    hideStyle.textContent = "html { visibility: hidden !important; }";
    document.documentElement.appendChild(hideStyle);
}

let pageScriptNonce = "";
for (let script of document.getElementsByTagName("script")) {
    if (script.nonce) {
        pageScriptNonce = script.nonce;
        break;
    }
}

// block all twitters scripts
function blockScriptElements(element) {
    if (element.tagName === "SCRIPT") {
        if (!pageScriptNonce && element.nonce) pageScriptNonce = element.nonce;
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
if (!isNewTwitterPage) {
    blockingObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
}
