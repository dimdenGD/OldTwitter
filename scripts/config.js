// Twitter config
const OLDTWITTER_CONFIG = {
    oauth_key: `Bearer AAAAAAAAAAAAAAAAAAAAAG5LOQEAAAAAbEKsIYYIhrfOQqm4H8u7xcahRkU%3Dz98HKmzbeXdKqBfUDmElcqYl0cmmKY9KdS2UoNIz3Phapgsowi`,
    public_token: `Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA`,
    get csrf() {
        let csrf = document.cookie.match(/(?:^|;\s*)ct0=([0-9a-f]+)\s*(?:;|$)/);
        return csrf ? csrf[1] : "";
    }
};

// https://developer.twitter.com/en/docs/twitter-for-websites/supported-languages
const TRANSLATION_SUPPORTED_LANGUAGES = ['en', 'ar', 'bn', 'cs', 'da', 'de', 'el', 'es', 'fa', 'fi', 'fil', 'fr', 'he', 'hi', 'hu', 'id', 'it', 'ja', 'ko', 'msa', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sv', 'th', 'tr', 'uk', 'ur', 'vi', 'zh', 'zh-cn', 'zh-tw', 'pt-BR', 'pt'];

const INSIDE_IFRAME = window !== window.top;

let LANGUAGE = navigator.language.replace("-", "_");

// variables
let vars;
let varsResolve, varsPromise = new Promise(resolve => varsResolve = resolve);
async function loadVars() { 
    vars = await new Promise(resolve => {
        chrome.storage.sync.get(['linkColor', 'font', 'heartsNotStars', 'linkColorsInTL', 'alwaysShowLinkColor', 'enableTwemoji', 'chronologicalTL', 
            'timelineType', 'showTopicTweets', 'darkMode', 'disableHotkeys', 'customCSS', 'customCSSVariables', 'savePreferredQuality',
            'noBigFont', 'language', 'autoplayVideos', 'displaySensitiveContent', 'displaySensitiveContentMoved', 'volume', 'timeMode',
            'showOriginalImages', 'pitchBlack', 'seeTweetViews', 'autotranslateProfiles', 'roundAvatars', 'twitterBlueCheckmarks',
            'developerMode', 'copyLinksAs', 'useNewIcon', 'updateTimelineAutomatically', 'hideTrends', 'hideWtf', 'hideLikes', 'hideFollowers',
            'extensiveLogging', 'disablePersonalizedTrends', 'showBookmarkCount', 'hideCommunityNotes', 'disableGifAutoplay', 'showMediaCount',
            'pinProfileOnNavbar', 'pinBookmarksOnNavbar', 'pinListsOnNavbar', 'tweetFont', 'useOldDefaultProfileImage', 'enableHashflags',
            'uncensorGraphicViolenceAutomatically', 'uncensorAdultContentAutomatically', 'uncensorSensitiveContentAutomatically', 'useOldStyleReply',
            'enableAd', 'acknowledgedCssAccess', 'disableProfileCustomizations', 'openNotifsAsModal', 'enableIframeNavigation',
            'acknowledgedCustomizationButton', 'modernUI', 'showExactValues', 'hideTimelineTypes', 'autotranslateLanguages', 
            'autotranslationMode', 'muteVideos', 'dontPauseVideos', 'showUserPreviewsOnMobile', 'systemDarkMode', 'localizeDigit',
            'disableRetweetHotkey', 'disableLikeHotkey', 'disableFindHotkey', 'extensionCompatibilityMode', 'disableDataSaver', 'disableAcceptType',
            'showUserFollowerCountsInLists', 'showQuoteCount', 'hideUnfollowersPage', 'transitionProfileBanner', 'customDownloadTemplate'
        ], data => {
            // default variables
            if(typeof(data.linkColorsInTL) !== 'boolean') {
                data.linkColorsInTL = true;
                chrome.storage.sync.set({
                    linkColorsInTL: true
                }, () => {});
            }
            if (typeof(data.alwaysShowLinkColor) !== 'boolean') {
                data.alwaysShowLinkColor = false;
                chrome.storage.sync.set({
                    alwaysShowLinkColor: false
                }, () => {});
            }
            if(typeof(data.enableTwemoji) !== 'boolean') {
                data.enableTwemoji = true;
                chrome.storage.sync.set({
                    enableTwemoji: true
                }, () => {});
            }
            if(typeof(data.enableHashflags) !== 'boolean') {
                data.enableHashflags = false;
                chrome.storage.sync.set({
                    enableHashflags: false
                }, () => {});
            }
            if(typeof(data.hideTimelineTypes) !== 'boolean') {
                data.hideTimelineTypes = false;
                chrome.storage.sync.set({
                    hideTimelineTypes: false
                }, () => {});
            }
            if(typeof(data.showExactValues) !== 'boolean') {
                data.showExactValues = window.innerWidth >= 590;
                chrome.storage.sync.set({
                    showExactValues: window.innerWidth >= 590
                }, () => {});
            }
            if(typeof(data.localizeDigit) !== 'boolean') {
                data.localizeDigit = false;
                chrome.storage.sync.set({
                    localizeDigit: false
                }, () => {});
            }
            if(typeof(data.customCSSVariables) !== 'string') {
                data.customCSSVariables = '';
                chrome.storage.sync.set({
                    customCSSVariables: ''
                }, () => {});
            }
            if(typeof(data.customDownloadTemplate) !== 'string') {
                data.customDownloadTemplate = '';
                chrome.storage.sync.set({
                    customDownloadTemplate: ''
                }, () => {});
            }
            if(typeof(data.copyLinksAs) !== 'string') {
                data.copyLinksAs = 'twitter.com';
                chrome.storage.sync.set({
                    copyLinksAs: 'twitter.com'
                }, () => {});
            }
            if(typeof(data.timelineType) !== 'string') {
                let type;
                if(typeof(data.chronologicalTL) === 'boolean') {
                    type = data.chronologicalTL ? 'chrono' : 'algo';
                } else {
                    type = 'chrono-social';
                }
                data.timelineType = type;
                chrome.storage.sync.set({
                    timelineType: type
                }, () => {});
            }
            if(data.timelineType === 'algov2') {
                data.timelineType = 'algo';
                chrome.storage.sync.set({
                    timelineType: 'algo'
                }, () => {});
            }
            if(typeof(data.showTopicTweets) !== 'boolean') {
                data.showTopicTweets = true;
                chrome.storage.sync.set({
                    showTopicTweets: true
                }, () => {});
            }
            if(typeof(data.savePreferredQuality) !== 'boolean') {
                data.savePreferredQuality = false;
                chrome.storage.sync.set({
                    savePreferredQuality: false
                }, () => {});
            }
            if(typeof(data.openNotifsAsModal) !== 'boolean') {
                data.openNotifsAsModal = true;
                chrome.storage.sync.set({
                    openNotifsAsModal: true
                }, () => {});
            }
            if(typeof(data.noBigFont) !== 'boolean') {
                data.noBigFont = window.innerWidth < 650;
                chrome.storage.sync.set({
                    noBigFont: window.innerWidth < 650
                }, () => {});
            }
            if(typeof(data.enableIframeNavigation) !== 'boolean') {
                data.enableIframeNavigation = window.innerWidth < 590;
                chrome.storage.sync.set({
                    enableIframeNavigation: window.innerWidth < 590
                }, () => {});
            }
            if(typeof(data.showMediaCount) !== 'boolean') {
                data.showMediaCount = window.innerWidth < 590;
                chrome.storage.sync.set({
                    showMediaCount: window.innerWidth < 590
                }, () => {});
            }
            if(typeof(data.font) !== 'string') {
                data.font = 'Arial';
                chrome.storage.sync.set({
                    font: 'Arial'
                }, () => {});
            }
            if(typeof(data.tweetFont) !== 'string') {
                data.tweetFont = 'Arial';
                chrome.storage.sync.set({
                    tweetFont: data.font
                }, () => {});
            }
            if(typeof(data.showOriginalImages) !== 'boolean') {
                data.showOriginalImages = false;
                chrome.storage.sync.set({
                    showOriginalImages: false
                }, () => {});
            }
            if(typeof(data.useOldStyleReply) !== 'boolean') {
                data.useOldStyleReply = false;
                chrome.storage.sync.set({
                    useOldStyleReply: false
                }, () => {});
            }
            if(typeof(data.enableAd) !== 'boolean') {
                data.enableAd = false;
                chrome.storage.sync.set({
                    enableAd: false
                }, () => {});
            }
            if(typeof(data.useOldDefaultProfileImage) !== 'boolean') {
                data.useOldDefaultProfileImage = true;
                chrome.storage.sync.set({
                    useOldDefaultProfileImage: true
                }, () => {});
            }
            if(typeof(data.pinProfileOnNavbar) !== 'boolean') {
                data.pinProfileOnNavbar = true;
                chrome.storage.sync.set({
                    pinProfileOnNavbar: true
                }, () => {});
            }
            if(typeof(data.roundAvatars) !== 'boolean') {
                data.roundAvatars = false;
                chrome.storage.sync.set({
                    roundAvatars: false
                }, () => {});
            }
            if(typeof(data.modernUI) !== 'boolean') {
                data.modernUI = false;
                chrome.storage.sync.set({
                    modernUI: false
                }, () => {});
            }
            if(typeof(data.disableAcceptType) !== 'boolean') {
                data.disableAcceptType = false;
                chrome.storage.sync.set({
                    disableAcceptType: false
                }, () => {});
            }
            if(typeof(data.autotranslateProfiles) !== 'object') {
                data.autotranslateProfiles = [];
                chrome.storage.sync.set({
                    autotranslateProfiles: []
                }, () => {});
            }
            if(typeof(data.autotranslateLanguages) !== 'object') {
                data.autotranslateLanguages = [];
                chrome.storage.sync.set({
                    autotranslateLanguages: []
                }, () => {});
            }
            if(typeof(data.autotranslationMode) !== 'string') {
                data.autotranslationMode = 'whitelist';
                chrome.storage.sync.set({
                    autotranslationMode: 'whitelist'
                }, () => {});
            }
            if(typeof(data.transitionProfileBanner) !== 'boolean') {
                console.log('transitionProfileBanner', data.transitionProfileBanner)
                data.transitionProfileBanner = false;
                chrome.storage.sync.set({
                    transitionProfileBanner: false
                }, () => {});
            }

            resolve(data);
            varsResolve(data);

            if(data.developerMode) {
                console.log(API);
            }
        });
    });
};

console.log(1, vars);
loadVars();
