// Twitter config
const OLDTWITTER_CONFIG = {
    oauth_key: `Bearer AAAAAAAAAAAAAAAAAAAAAF7aAAAAAAAASCiRjWvh7R5wxaKkFp7MM%2BhYBqM%3DbQ0JPmjU9F6ZoMhDfI4uTNAaQuTDm2uO9x3WFVr2xBZ2nhjdP0`,
    public_token: `Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA`,
    get csrf() {
        let csrf = document.cookie.match(/(?:^|;\s*)ct0=([0-9a-f]+)\s*(?:;|$)/);
        return csrf ? csrf[1] : "";
    }
};

// variables
let vars;
let varsResolve, varsPromise = new Promise(resolve => varsResolve = resolve);
async function loadVars() { 
    vars = await new Promise(resolve => {
        chrome.storage.sync.get(['linkColor', 'font', 'heartsNotStars', 'linkColorsInTL', 'enableTwemoji',
            'chronologicalTL', 'timelineType', 'showTopicTweets', 'darkMode', 'disableHotkeys', 'customCSS', 'customCSSVariables', 'savePreferredQuality',
            'noBigFont', 'language', 'autoplayVideos', 'displaySensitiveContent', 'displaySensitiveContentMoved', 'volume', 'timeMode',
            'showOriginalImages', 'pitchBlack', 'seeTweetViews', 'autotranslateProfiles', 'roundAvatars', 'twitterBlueCheckmarks',
            'developerMode', 'copyLinksAs', 'useNewIcon', 'updateTimelineAutomatically', 'hideTrends', 'hideWtf', 'hideLikes', 'hideFollowers',
            'extensiveLogging', 'disablePersonalizedTrends', 'showBookmarkCount', 'hideCommunityNotes', 'disableGifAutoplay', 'showMediaCount',
            'pinProfileOnNavbar', 'pinBookmarksOnNavbar', 'pinListsOnNavbar', 'tweetFont', 'useOldDefaultProfileImage', 'enableHashflags',
            'uncensorGraphicViolenceAutomatically', 'uncensorAdultContentAutomatically', 'uncensorSensitiveContentAutomatically', 'useOldStyleReply',
            'enableAd'
        ], data => {
            resolve(data);
            varsResolve(data);

            if(data.developerMode) {
                console.log(API);
            }
        });
    });
};
loadVars();