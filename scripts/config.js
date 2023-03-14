// Twitter config
const OLDTWITTER_CONFIG = {
    oauth_key: `Bearer AAAAAAAAAAAAAAAAAAAAAF7aAAAAAAAASCiRjWvh7R5wxaKkFp7MM%2BhYBqM%3DbQ0JPmjU9F6ZoMhDfI4uTNAaQuTDm2uO9x3WFVr2xBZ2nhjdP0`,
    public_token: `Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA`,
    csrf: (() => {
        let csrf = document.cookie.match(/(?:^|;\s*)ct0=([0-9a-f]+)\s*(?:;|$)/);
        return csrf ? csrf[1] : "";
    })()
};

// variables
let vars;
async function loadVars() { 
    vars = await new Promise(resolve => {
        chrome.storage.sync.get(['linkColor', 'font', 'heartsNotStars', 'linkColorsInTL', 'enableTwemoji',
        'chronologicalTL', 'timelineType', 'showTopicTweets', 'darkMode', 'disableHotkeys', 'customCSS', 'customCSSVariables', 'savePreferredQuality',
        'noBigFont', 'language', 'autoplayVideos', 'displaySensitiveContent', 'displaySensitiveContentMoved', 'volume', 'disableAnalytics', 'timeMode',
        'showOriginalImages', 'pitchBlack', 'seeTweetViews', 'autotranslateProfiles', 'roundAvatars'], data => {
            resolve(data);
        });
    });
    if(!vars.disableAnalytics) {
        ga('send', 'pageview');
    }
};
loadVars();

// analytics
window.ga = window.ga || function () {
    (ga.q=ga.q||[]).push(arguments)
};
ga.l =+ new Date;
ga('create', 'UA-137155489-7', 'auto');
let ps = history.pushState;
history.pushState = (...args) => {
    if(!vars.disableAnalytics) {
        setTimeout(() => {
            ga('send', 'pageview');
        }, 10);
    }
    return ps.apply(history, args);
};
window.addEventListener('popstate', () => {
    if(!vars.disableAnalytics) {
        setTimeout(() => {
            ga('send', 'pageview');
        }, 10);
    }
});

// updating csrf
setInterval(() => {
    fetch(`https://twitter.com/`).then(response => response.text()).then(() => {
        OLDTWITTER_CONFIG.csrf = (() => {
            let csrf = document.cookie.match(/(?:^|;\s*)ct0=([0-9a-f]+)\s*(?:;|$)/);
            return csrf ? csrf[1] : "";
        })();
    });
}, 60000*5);
