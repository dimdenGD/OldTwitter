let user = {};
let customVars = {};
let linkColor 

function getAllCSSVariables() {
    const vars = {};
    Array.from(document.styleSheets)
        .forEach(styleSheet => {
            if (!styleSheet.href && styleSheet.cssRules) {
                Array.from(styleSheet.cssRules).forEach(cssRule => {
                    if (cssRule.selectorText === ':root') {
                        const css = cssRule.cssText.split('{')[1].replace('}', '').split(';');
                        for (const cssProp of css) {
                            const [property, value] = cssProp.split(':');
                            if (property.trim().indexOf('--') === 0) {
                                vars[property.trim()] = value.trim();
                            }
                        }
                    }
                });
            }
        });
    return vars;
}
function initColors() {
    let root = document.querySelector(":root");
    let colorsDiv = document.getElementById('colors');
    let theme = getThemeVariables(isDarkModeEnabled);
    let defaultVars = parseVariables(theme);
    customVars = parseVariables(vars.customCSSVariables);

    colorsDiv.innerHTML = '';

    for(let v in defaultVars) {
        try {
            let color = parseCssColor(customVars[v] ? customVars[v] : defaultVars[v]);
            if(!color || v === '--link-color' || v === '--favorite-icon-color') continue;

            let div = document.createElement('div');
            div.classList.add('color-div');
            div.innerHTML = html`
                <input data-coloris class="color-value" type="text" data-var="${v}" value="${rgb2hex(...color.values)}${Math.round(color.alpha*255).toString(16).padStart(2, '0')}">
                <span class="color-name">${v[2].toUpperCase() + v.slice(3).replace(/-/g, ' ')}</span>
                <button class="color-reset nice-button"${!customVars[v] ? ' disabled' : ''}>${LOC.reset.message}</button>
            `;
            colorsDiv.append(div);
            function colorUpdate() {
                let colorValue = div.querySelector('.color-value');

                customVars[colorValue.dataset.var] = colorValue.value;
                let css = Object.entries(customVars).map(([k, v]) => `${k}: ${v};`).join('\n');
                chrome.storage.sync.set({
                    customCSSVariables: css
                }, () => {
                    vars.customCSSVariables = css;
                    root.style.setProperty(colorValue.dataset.var, customVars[colorValue.dataset.var]);
                    customCSSBus.postMessage({type: 'vars'});
                    div.querySelector('.color-reset').disabled = false;
                });
            }
            let colorValue = div.querySelector('.color-value');
            colorValue.style.color = colorValue.value;
            colorValue.style.backgroundColor = colorValue.value;
            colorValue.addEventListener('click', e => {
                Coloris({
                    alpha: true,
                    themeMode: isDarkModeEnabled ? 'dark' : 'light',
                    swatches: []
                });
            });
            colorValue.addEventListener('change', colorUpdate);
            colorValue.addEventListener('input', e => {
                colorValue.style.color = colorValue.value;
                colorValue.style.backgroundColor = colorValue.value;

                root.style.setProperty(colorValue.dataset.var, colorValue.value);
            });
            div.querySelector('.color-reset').addEventListener('click', () => {
                delete customVars[v];
                let css = Object.entries(customVars).map(([k, v]) => `${k}: ${v};`).join('\n');
                chrome.storage.sync.set({
                    customCSSVariables: css
                }, () => {
                    vars.customCSSVariables = css;
                    root.style.setProperty(v, defaultVars[v]);
                    customCSSBus.postMessage({type: 'vars'});
                    div.querySelector('.color-reset').disabled = true;
                    let defColor = parseCssColor(defaultVars[v]);
                    colorValue.value = rgb2hex(...defColor.values) + Math.round(defColor.alpha*255).toString(16).padStart(2, '0');
                    colorValue.style.color = colorValue.value;
                    colorValue.style.backgroundColor = colorValue.value;
                });
            });
    
        } catch(e) {
            console.error(e);
        }
    }
}

function updateUserData() {
    API.account.verifyCredentials().then(async u => {
        user = u;
        userDataFunction(u);
        renderUserData();
    }).catch(e => {
        if (e === "Not logged in") {
            window.location.href = "/i/flow/login?newtwitter=true";
        }
        console.error(e);
    });
}
function refreshFontSelectLabels(element, baselabel, fontname) {
	element.innerHTML = baselabel;
	if (fontname) {
		element.innerHTML += "<br>" + LOC.current_font.message.replace('$FONT$', fontname);
	}
}
// Render
function renderUserData() {
    document.getElementById('user-name').innerText = user.name;
    document.getElementById('user-name').classList.toggle('user-verified', user.verified);
    document.getElementById('user-name').classList.toggle('user-protected', user.protected);

    document.getElementById('user-handle').innerText = `@${user.screen_name}`;
    document.getElementById('user-tweets').innerText = formatLargeNumber(user.statuses_count).replace(/\s/g, ',');
    if(user.statuses_count >= 100000 && vars.showExactValues) {
        let style = document.createElement('style');
        style.innerText = `
            .user-stat-div > h1 { font-size: 18px !important }
            .user-stat-div > h2 { font-size: 13px !important }
        `;
        document.head.appendChild(style);
    }
    document.getElementById('user-following').innerText = formatLargeNumber(user.friends_count).replace(/\s/g, ',');
    document.getElementById('user-followers').innerText = formatLargeNumber(user.followers_count).replace(/\s/g, ',');
    document.getElementById('user-tweets-div').href = `/${user.screen_name}`;
    document.getElementById('user-following-div').href = `/${user.screen_name}/following`;
    document.getElementById('user-followers-div').href = `/${user.screen_name}/followers`;
    document.getElementById('user-banner').src = user.profile_banner_url ? user.profile_banner_url : 'https://abs.twimg.com/images/themes/theme1/bg.png';
    document.getElementById('user-avatar').src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`.replace("_normal", "_400x400");
    document.getElementById('wtf-viewall').href = `/i/connect_people?newtwitter=true&user_id=${user.id_str}`;
    document.getElementById('user-avatar-link').href = `/${user.screen_name}`;
    document.getElementById('user-info').href = `/${user.screen_name}`;

    if(vars.enableTwemoji) twemoji.parse(document.getElementById('user-name'));

    document.getElementById('loading-box').hidden = true;

    if(document.getElementById('user-stats').clientWidth > 300) {
        let style = document.createElement('style');
        style.innerHTML = html`.user-stat-div > h2 { font-size: 10px !important }`;
        document.head.appendChild(style);
    }

    let clearOtToken = document.getElementById('clear-ot-token');
    chrome.storage.local.get(['otPrivateTokens'], data => {
        if(!data.otPrivateTokens) {
            return clearOtToken.hidden = true;
        }
        if(data.otPrivateTokens[user.id_str]) {
            clearOtToken.hidden = false;
            clearOtToken.addEventListener('click', () => {
                delete data.otPrivateTokens[user.id_str];
                chrome.storage.local.set(data, () => {
                    location.reload();
                });
            });
        }
    });
}

async function writeCSSToDB(cssData) {
    let db = await openDatabase();
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(["cssStore"], "readwrite");
        let store = transaction.objectStore("cssStore");
        let request = store.put({ id: "customCSS", css: cssData });

        request.onerror = function(event) {
            reject("Error writing CSS to DB");
        };

        request.onsuccess = function(event) {
            resolve();
        };
    });
}

async function readCSSFromDB() {
    let db = await openDatabase();
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(["cssStore"]);
        let objectStore = transaction.objectStore("cssStore");
        let request = objectStore.get("customCSS");

        request.onerror = function(event) {
            reject("Error reading CSS");
        };

        request.onsuccess = function(event) {
            if (request.result) {
                resolve(request.result.css);
            } else {
                resolve('');
            }
        };
    });
}

setTimeout(async () => {
    if(!vars) {
        await loadVars();
    }
    // weird bug
    try {
        document.getElementById('wtf-refresh').addEventListener('click', async () => {
            renderDiscovery(false);
        });
    } catch(e) {
        setTimeout(() => location.reload(), 2500);
        console.error(e);
        return;
    }

    let colorisCss = await (await fetch(chrome.runtime.getURL('libraries/coloris.min.css'))).text();
    let colorisStyle = document.createElement('style');
    colorisStyle.innerHTML = colorisCss;
    colorisStyle.id = 'coloris-style';
    document.head.appendChild(colorisStyle);

    const fontCheck = new Set([
        // Windows 10
      'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MS UI Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
        // macOS
        'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
        // other
        'Terminus', 'Terminus (TTF)', 'Terminus (TTF) for Windows', 'Chirp'
    ].sort());
      
      let fonts = await (async() => {
        await document.fonts.ready;
      
        const fontAvailable = new Set();
      
        for (const font of fontCheck.values()) {
          if (document.fonts.check(`12px "${font}"`)) {
            fontAvailable.add(font);
          }
        }
      
        return [...fontAvailable.values()];
    })();
    let fontElement = document.getElementById('font');
	let fontElementLabel = [...document.getElementsByTagName('label')].filter((el) =>
		el.htmlFor == "font"
	);
    let tweetFontElement = document.getElementById('tweet-font');
    let tweetFontElementLabel = [...document.getElementsByTagName('label')].filter((el) =>
		el.htmlFor == "tweet-font"
	);
    let linkColor = document.getElementById('link-color');
    let heartsNotStars = document.getElementById('hearts-instead-stars');
    let slowLinkColorsInTL = document.getElementById('slow-link-colors-in-tl');
    let alwaysShowLinkColor = document.getElementById('always-show-link-color');
    let enableTwemoji = document.getElementById('enable-twemoji');
    let enableHashflags = document.getElementById('enable-hashflags');
    let timelineType = document.getElementById('tl-type');
    let darkMode = document.getElementById('dark-mode');
    let pitchBlackMode = document.getElementById('pitch-black-mode');
    let darkModeText = document.getElementById('dark-mode-text');
    let timeMode = document.getElementById('time-mode');
    let showTopicTweets = document.getElementById('show-topic-tweets');
    let newGallery = document.getElementById('new-gallery');
    let disableHotkeys = document.getElementById('disable-hotkeys');
    let disableRetweetHotkey = document.getElementById('disable-retweet-hotkey');
    let disableLikeHotkey = document.getElementById('disable-like-hotkey');
    let disableFindHotkey = document.getElementById('disable-find-hotkey');
    let customCSS = document.getElementById('custom-css');
    let customCSSSave = document.getElementById('custom-css-save');
    let customDownloadTemplate = document.getElementById('custom-download');
    let customDownloadTemplateSave = document.getElementById('custom-download-save');
    let savePreferredQuality = document.getElementById('save-preferred-quality');
    let roundAvatars = document.getElementById('round-avatars-switch');
    let modernUI = document.getElementById('modern-ui-switch');
    let showOriginalImages = document.getElementById('show-original-images');
    let noBigFont = document.getElementById('no-big-font');
    let language = document.getElementById('language');
    let autoplayVideos = document.getElementById('autoplay-videos');
    let displaySensitiveContent = document.getElementById('display-sensitive-content');
    let seeTweetViews = document.getElementById('see-tweet-views');
    let twitterBlueCheckmarks = document.getElementById('twitter-blue-checkmarks');
    let showBasedIn = document.getElementById('show-based-in');
    let developerMode = document.getElementById('developer-mode');
    let copyLinksAs = document.getElementById('copy-links-as');
    let useNewIcon = document.getElementById('use-new-icon');
    let updateTimelineAutomatically = document.getElementById('update-timeline-automatically');
    let hideTrends = document.getElementById('hide-trends');
    let hideWtf = document.getElementById('hide-wtf');
    let hideLikes = document.getElementById('hide-likes');
    let hideFollowers = document.getElementById('hide-followers');
    let disablePersonalizedTrends = document.getElementById('disable-personalized-trends');
    let showBookmarkCount = document.getElementById('show-bookmark-count');
    let showQuoteCount = document.getElementById('show-quote-count');
    let hideCommunityNotes = document.getElementById('hide-community-notes');
    let disableGifAutoplay = document.getElementById('disable-gif-autoplay');
    let showMediaCount = document.getElementById('show-media-count');
    let pinProfileOnNavbar = document.getElementById('pin-profile-on-navbar');
    let pinBookmarksOnNavbar = document.getElementById('pin-bookmarks-on-navbar');
    let pinListsOnNavbar = document.getElementById('pin-lists-on-navbar');
    let useOldDefaultProfileImage = document.getElementById('use-old-default-profile-navbar');
    let uncensorGraphicViolenceAutomatically = document.getElementById('uncensor-graphic-violence-automatically');
    let uncensorAdultContentAutomatically = document.getElementById('uncensor-adult-content-automatically');
    let uncensorSensitiveContentAutomatically = document.getElementById('uncensor-sensitive-content-automatically');
    let useOldStyleReply = document.getElementById('use-old-style-reply');
    let linkColorReset = document.getElementById('link-color-reset');
    let enableAd = document.getElementById('enable-promotion');
    let disableProfileCustomizations = document.getElementById('disable-profile-customizations');
    let openNotifsAsModal = document.getElementById('open-notifs-as-modal');
    let enableIframeNavigation = document.getElementById('enable-iframe-navigation');
    let showExactValues = document.getElementById('show-exact-values');
    let localizeDigit = document.getElementById('localize-digit');
    let hideTimelineTypes = document.getElementById('hide-timeline-types');
    let hideOriginalLanguages = document.getElementById('hide-original-languages');
    let autotranslationMode = document.getElementById('autotranslation-mode');
    let autotranslateLanguages = document.getElementById('autotranslate-languages');
    let autotranslateLanguageList = document.getElementById('autotranslate-language-list');
    let addAutotranslateLanguage = document.getElementById('add-autotranslate-language');
    let muteVideos = document.getElementById('mute-videos');
    let dontPauseVideos = document.getElementById('dont-pause-videos');
    let showUserPreviewsOnMobile = document.getElementById('show-user-previews-on-mobile');
    let systemDarkMode = document.getElementById('system-dark-mode');
    let extensionCompatibilityMode = document.getElementById('extension-compatibility-mode');
    let disableDataSaver = document.getElementById('disable-data-saver');
    let disableAcceptType = document.getElementById('disable-accept-type');
    let showUserFollowerCountsInLists = document.getElementById('show-user-follower-counts-in-lists');
    let hideUnfollowersPage = document.getElementById('hide-unfollowers-page');
    let transitionProfileBanner = document.getElementById('transition-profile-banner');
    let showBoringIndicators = document.getElementById('show-boring-indicators');
    let useRetweetedId = document.getElementById('use-retweeted-id');
    let useXChat = document.getElementById('use-x-chat');

    let root = document.querySelector(":root");
    {
        let option = document.createElement('option');
        option.value = "_custom";
        option.innerText = LOC.custom_font.message;
        fontElement.append(option);
        tweetFontElement.append(option.cloneNode(true));
    }
    for(let i in fonts) {
        let font = fonts[i];
        let option = document.createElement('option');
        option.value = font;
        option.innerText = font;
        option.style.fontFamily = `"${font}"`;
        fontElement.append(option);
        tweetFontElement.append(option.cloneNode(true));
    }
    fontElement.addEventListener('change', () => {
        let font = fontElement.value;
        if(font === '_custom') {
            font = prompt(LOC.enter_custom_font_name.message);
			refreshFontSelectLabels(fontElementLabel[0], LOC.font.message, font);
        } else {
			refreshFontSelectLabels(fontElementLabel[0], LOC.font.message);
		}
        root.style.setProperty('--font', `"${font}"`);
        chrome.storage.sync.set({
            font: font
        }, () => { });
    });
    tweetFontElement.addEventListener('change', () => {
        let font = tweetFontElement.value;
        if(font === '_custom') {
            font = prompt(LOC.enter_custom_font_name.message);
			refreshFontSelectLabels(tweetFontElementLabel[0], LOC.tweet_text_font.message, font);
        } else {
			refreshFontSelectLabels(tweetFontElementLabel[0], LOC.tweet_text_font.message);
		}
        root.style.setProperty('--tweet-font', `"${font}"`);
        chrome.storage.sync.set({
            tweetFont: font
        }, () => { });
    }); 
    modernUI.addEventListener('change', () => {
        vars.modernUI = !!modernUI.checked;
        chrome.storage.sync.set({
            modernUI: modernUI.checked
        }, () => {
            switchModernUI(modernUI.checked);
            modernUIBus.postMessage(modernUI.checked);
            themeBus.postMessage([darkMode.checked, pitchBlackMode.checked]);
            switchDarkMode(isDarkModeEnabled);
        });  
        if(vars.modernUI){
            root.style.setProperty('--icon-font', `"edgeicons", "RosettaIcons"`);
        }
        else{
            root.style.setProperty('--icon-font', `"RosettaIcons"`)
        }
    });
    useXChat.addEventListener('change', () => {
        chrome.storage.sync.set({
            useXChat: useXChat.checked
        }, () => {
            vars.useXChat = useXChat.checked;
        });
    });
    linkColor.addEventListener('click', e => {
        Coloris({
            alpha: false,
            themeMode: isDarkModeEnabled ? 'dark' : 'light'
        });
    });
    linkColor.addEventListener('input', () => {
        let color = linkColor.value;
        linkColor.style.color = color;
        linkColor.style.backgroundColor = color;
        root.style.setProperty('--link-color', color);
    });
    linkColor.addEventListener('change', () => {
        let color = linkColor.value;
        root.style.setProperty('--link-color', color);
        chrome.storage.sync.set({
            linkColor: color
        }, () => {
            customCSSBus.postMessage({type: 'color', color: color});
        });
    });
    linkColorReset.addEventListener('click', async () => {
        let color = vars.modernUI ? '#1DA1F3' : '#4BACD2';
        linkColor.value = color;
        linkColor.style.color = color;
        linkColor.style.backgroundColor = color;
        root.style.setProperty('--link-color', color);
        chrome.storage.sync.set({
            linkColor: color
        }, () => {
            customCSSBus.postMessage({type: 'color', color: color});
        });
    });
    showUserPreviewsOnMobile.addEventListener('change', () => {
        chrome.storage.sync.set({
            showUserPreviewsOnMobile: showUserPreviewsOnMobile.checked
        }, () => {
            vars.showUserPreviewsOnMobile = showUserPreviewsOnMobile.checked;
        });
    });
    pinProfileOnNavbar.addEventListener('change', () => {
        chrome.storage.sync.set({
            pinProfileOnNavbar: pinProfileOnNavbar.checked
        }, () => {
            document.getElementById('pin-profile').hidden = !pinProfileOnNavbar.checked;
        });
    });
    pinBookmarksOnNavbar.addEventListener('change', () => {
        chrome.storage.sync.set({
            pinBookmarksOnNavbar: pinBookmarksOnNavbar.checked
        }, () => {
            document.getElementById('pin-bookmarks').hidden = !pinBookmarksOnNavbar.checked;
        });
    });
    pinListsOnNavbar.addEventListener('change', () => {
        chrome.storage.sync.set({
            pinListsOnNavbar: pinListsOnNavbar.checked
        }, () => {
            document.getElementById('pin-lists').hidden = !pinListsOnNavbar.checked;
        });
    });
    openNotifsAsModal.addEventListener('change', () => {
        chrome.storage.sync.set({
            openNotifsAsModal: openNotifsAsModal.checked
        }, () => {
            vars.openNotifsAsModal = openNotifsAsModal.checked;
        });
    });
    autotranslationMode.addEventListener('change', () => {
        chrome.storage.sync.set({
            autotranslationMode: autotranslationMode.value
        }, () => {
            vars.autotranslationMode = autotranslationMode.value;
        });
    });
    showUserFollowerCountsInLists.addEventListener('change', () => {
        chrome.storage.sync.set({
            showUserFollowerCountsInLists: showUserFollowerCountsInLists.checked
        }, () => { });
    });
    enableIframeNavigation.addEventListener('change', () => {
        chrome.storage.sync.set({
            enableIframeNavigation: enableIframeNavigation.checked
        }, () => { });
    });
    heartsNotStars.addEventListener('change', () => {
        chrome.storage.sync.set({
            heartsNotStars: heartsNotStars.checked
        }, () => { });
    });
    muteVideos.addEventListener('change', () => {
        chrome.storage.sync.set({
            muteVideos: muteVideos.checked,
            volume: muteVideos.checked ? 0 : 1
        }, () => {
            vars.muteVideos = muteVideos.checked;
            vars.volume = muteVideos.checked ? 0 : 1;
        });
    });
    dontPauseVideos.addEventListener('change', () => {
        chrome.storage.sync.set({
            dontPauseVideos: dontPauseVideos.checked,
        }, () => {
            vars.dontPauseVideos = dontPauseVideos.checked;
        });
    });
    uncensorAdultContentAutomatically.addEventListener('change', () => {
        chrome.storage.sync.set({
            uncensorAdultContentAutomatically: uncensorAdultContentAutomatically.checked
        }, () => { });
    });
    uncensorGraphicViolenceAutomatically.addEventListener('change', () => {
        chrome.storage.sync.set({
            uncensorGraphicViolenceAutomatically: uncensorGraphicViolenceAutomatically.checked
        }, () => { });
    });
    uncensorSensitiveContentAutomatically.addEventListener('change', () => {
        chrome.storage.sync.set({
            uncensorSensitiveContentAutomatically: uncensorSensitiveContentAutomatically.checked
        }, () => { });
    });
    disableProfileCustomizations.addEventListener('change', () => {
        chrome.storage.sync.set({
            disableProfileCustomizations: disableProfileCustomizations.checked
        }, () => { });
    });
    slowLinkColorsInTL.addEventListener('change', () => {
        chrome.storage.sync.set({
            slowLinkColorsInTL: slowLinkColorsInTL.checked
        }, () => { });
    });
    alwaysShowLinkColor.addEventListener('change', () => {
        chrome.storage.sync.set({
            alwaysShowLinkColor: alwaysShowLinkColor.checked
        }, () => { });
    });
    enableTwemoji.addEventListener('change', () => {
        chrome.storage.sync.set({
            enableTwemoji: enableTwemoji.checked
        }, () => { });
    });
    enableHashflags.addEventListener('change', () => {
        chrome.storage.sync.set({
            enableHashflags: enableHashflags.checked
        }, () => { });
    });
    hideTimelineTypes.addEventListener('change', () => {
        chrome.storage.sync.set({
            hideTimelineTypes: hideTimelineTypes.checked
        }, () => { });
    });
    showExactValues.addEventListener('change', () => {
        vars.localizeDigit = !!localizeDigit.checked;
        vars.showExactValues = !!showExactValues.checked;
        chrome.storage.sync.set({
            showExactValues: showExactValues.checked
        }, () => { });
        document.getElementById('user-tweets').innerText = formatLargeNumber(user.statuses_count).replace(/\s/g, ',');
        if(user.statuses_count >= 100000 && vars.showExactValues) {
            let style = document.createElement('style');
            style.innerText = `
                .user-stat-div > h1 { font-size: 18px !important }
                .user-stat-div > h2 { font-size: 13px !important }
            `;
            document.head.appendChild(style);
        }
        document.getElementById('user-following').innerText = formatLargeNumber(user.friends_count).replace(/\s/g, ',');
        document.getElementById('user-followers').innerText = formatLargeNumber(user.followers_count).replace(/\s/g, ',');
    });
    localizeDigit.addEventListener('change', () => {
        vars.localizeDigit = !!localizeDigit.checked;
        vars.showExactValues = !!showExactValues.checked;
        chrome.storage.sync.set({
            localizeDigit: localizeDigit.checked
        }, () => { });
        document.getElementById('user-tweets').innerText = formatLargeNumber(user.statuses_count).replace(/\s/g, ',');
        if(user.statuses_count >= 100000 && vars.showExactValues) {
            let style = document.createElement('style');
            style.innerText = `
                .user-stat-div > h1 { font-size: 18px !important }
                .user-stat-div > h2 { font-size: 13px !important }
            `;
            document.head.appendChild(style);
        }
        document.getElementById('user-following').innerText = formatLargeNumber(user.friends_count).replace(/\s/g, ',');
        document.getElementById('user-followers').innerText = formatLargeNumber(user.followers_count).replace(/\s/g, ',');
    });
    timelineType.addEventListener('change', () => {
        document.getElementById('stt-div').hidden = timelineType.value !== 'algo' && timelineType.value !== 'algov2';
        chrome.storage.sync.set({
            timelineType: timelineType.value
        }, () => { });
    });
    showTopicTweets.addEventListener('change', () => {
        chrome.storage.sync.set({
            showTopicTweets: showTopicTweets.checked
        }, () => { });
    });
    newGallery.addEventListener('change', () => {
        chrome.storage.sync.set({
            newGallery: newGallery.checked
        }, () => { });
    });
    useNewIcon.addEventListener('change', () => {
        vars.useNewIcon = useNewIcon.checked;
        chrome.storage.sync.set({
            useNewIcon: useNewIcon.checked
        }, () => {
            let icon = document.getElementById('site-icon');
            icon.href = chrome.runtime.getURL(`images/logo32${vars.useNewIcon ? '_new' : ''}.png`);
        });
    });
    useOldStyleReply.addEventListener('change', () => {
        vars.useOldStyleReply = useOldStyleReply.checked;
        chrome.storage.sync.set({
            useOldStyleReply: useOldStyleReply.checked
        }, () => { });
    });
    hideUnfollowersPage.addEventListener('change', () => {
        vars.hideUnfollowersPage = hideUnfollowersPage.checked;
        chrome.storage.sync.set({
            hideUnfollowersPage: hideUnfollowersPage.checked
        }, () => {
            hideStuff();
        });
    });
    enableAd.addEventListener('change', () => {
        vars.enableAd = enableAd.checked;
        chrome.storage.sync.set({
            enableAd: enableAd.checked
        }, () => { });
    });
    useOldDefaultProfileImage.addEventListener('change', () => {
        vars.useOldDefaultProfileImage = useOldDefaultProfileImage.checked;
        chrome.storage.sync.set({
            useOldDefaultProfileImage: useOldDefaultProfileImage.checked
        }, () => { });
    });
    disableHotkeys.addEventListener('change', () => {
        chrome.storage.sync.set({
            disableHotkeys: disableHotkeys.checked
        }, () => { });
    });
    disableRetweetHotkey.addEventListener('change', () => {
        chrome.storage.sync.set({
            disableRetweetHotkey: disableRetweetHotkey.checked
        }, () => { });
    });
    disableLikeHotkey.addEventListener('change', () => {
        chrome.storage.sync.set({
            disableLikeHotkey: disableLikeHotkey.checked
        }, () => { });
    });
    disableFindHotkey.addEventListener('change', () => {
        chrome.storage.sync.set({
            disableFindHotkey: disableFindHotkey.checked
        }, () => { });
    });
    savePreferredQuality.addEventListener('change', () => {
        chrome.storage.sync.set({
            savePreferredQuality: savePreferredQuality.checked
        }, () => { });
    });
    transitionProfileBanner.addEventListener('change', () => {
        chrome.storage.sync.set({
            transitionProfileBanner: transitionProfileBanner.checked
        }, () => { console.log('set', transitionProfileBanner.checked) });
    });
    showOriginalImages.addEventListener('change', () => {
        chrome.storage.sync.set({
            showOriginalImages: showOriginalImages.checked
        }, () => { });
    });
    updateTimelineAutomatically.addEventListener('change', () => {
        chrome.storage.sync.set({
            updateTimelineAutomatically: updateTimelineAutomatically.checked
        }, () => { });
    });
    roundAvatars.addEventListener('change', () => {
        chrome.storage.sync.set({
            roundAvatars: roundAvatars.checked
        }, () => {
            switchRoundAvatars(roundAvatars.checked);
            roundAvatarBus.postMessage(roundAvatars.checked);
        });
    });
    noBigFont.addEventListener('change', () => {
        chrome.storage.sync.set({
            noBigFont: noBigFont.checked
        }, () => { });
    });
    autoplayVideos.addEventListener('change', () => {
        chrome.storage.sync.set({
            autoplayVideos: autoplayVideos.checked
        }, () => { });
    });
    displaySensitiveContent.addEventListener('change', () => {
        chrome.storage.sync.set({
            displaySensitiveContent: displaySensitiveContent.checked
        }, () => { });
    });
    seeTweetViews.addEventListener('change', () => {
        chrome.storage.sync.set({
            seeTweetViews: seeTweetViews.checked
        }, () => { });
    });
    twitterBlueCheckmarks.addEventListener('change', () => {
        chrome.storage.sync.set({
            twitterBlueCheckmarks: twitterBlueCheckmarks.checked
        }, () => { });
    });
    showBasedIn.addEventListener('change', () => {
        chrome.storage.sync.set({
            showBasedIn: showBasedIn.checked
        }, () => { });
    });
    developerMode.addEventListener('change', () => {
        chrome.storage.sync.set({
            developerMode: developerMode.checked
        }, () => { });
    });
    showBookmarkCount.addEventListener('change', () => {
        chrome.storage.sync.set({
            showBookmarkCount: showBookmarkCount.checked
        }, () => { });
    });
    showQuoteCount.addEventListener('change', () => {
        chrome.storage.sync.set({
            showQuoteCount: showQuoteCount.checked
        }, () => { });
    });
    hideCommunityNotes.addEventListener('change', () => {
        chrome.storage.sync.set({
            hideCommunityNotes: hideCommunityNotes.checked
        }, () => { });
    });
    disableGifAutoplay.addEventListener('change', () => {
        chrome.storage.sync.set({
            disableGifAutoplay: disableGifAutoplay.checked
        }, () => { });
    });
    disablePersonalizedTrends.addEventListener('change', () => {
        vars.disablePersonalizedTrends = disablePersonalizedTrends.checked;
        chrome.storage.sync.set({
            disablePersonalizedTrends: disablePersonalizedTrends.checked
        }, () => {
            renderTrends(false, false);
        });
    });
    showBoringIndicators.addEventListener('change', () => {
        vars.showBoringIndicators = showBoringIndicators.checked;
        chrome.storage.sync.set({
            showBoringIndicators: showBoringIndicators.checked
        }, () => { });
    });
    useRetweetedId.addEventListener('change', () => {
        vars.useRetweetedId = useRetweetedId.checked;
        chrome.storage.sync.set({
            useRetweetedId: useRetweetedId.checked
        }, () => { });
    });
    hideTrends.addEventListener('change', () => {
        vars.hideTrends = hideTrends.checked;
        hideStuff();
        chrome.storage.sync.set({
            hideTrends: hideTrends.checked
        }, () => {
            renderTrends();
        });
    });
    hideWtf.addEventListener('change', () => {
        vars.hideWtf = hideWtf.checked;
        hideStuff();
        chrome.storage.sync.set({
            hideWtf: hideWtf.checked
        }, () => {
            renderDiscovery();
        });
    });
    hideLikes.addEventListener('change', () => {
        vars.hideLikes = hideLikes.checked;
        hideStuff();
        chrome.storage.sync.set({
            hideLikes: hideLikes.checked
        }, () => { });
    });
    hideFollowers.addEventListener('change', () => {
        vars.hideFollowers = hideFollowers.checked;
        hideStuff();
        chrome.storage.sync.set({
            hideFollowers: hideFollowers.checked
        }, () => { });
    });
    language.addEventListener('change', () => {
        document.getElementById('loc-dig').hidden = language.value !== 'zh_TW' && language.value !== 'zh_CN' && language.value !== 'ja' && language.value !== 'ko';
        chrome.storage.sync.set({
            language: language.value
        }, () => {
            chrome.storage.local.remove(['notifications', 'trends', 'trendsv2'], () => {
                location.reload();
            })
        });
    });
    showMediaCount.addEventListener('change', () => {
        vars.showMediaCount = showMediaCount.checked;
        chrome.storage.sync.set({
            showMediaCount: showMediaCount.checked
        }, () => { });
    });
    disableDataSaver.addEventListener('change', () => {
        vars.disableDataSaver = disableDataSaver.checked;
        chrome.storage.sync.set({
            disableDataSaver: disableDataSaver.checked
        }, () => { });
    });
    disableAcceptType.addEventListener('change', () => {
        vars.disableAcceptType = disableAcceptType.checked;
        chrome.storage.sync.set({
            disableAcceptType: disableAcceptType.checked
        }, () => { });
    });
    extensionCompatibilityMode.addEventListener('change', () => {
        vars.extensionCompatibilityMode = extensionCompatibilityMode.checked;
        chrome.storage.sync.set({
            extensionCompatibilityMode: extensionCompatibilityMode.checked
        }, () => { });
    });
    darkMode.addEventListener('change', () => {
        themeBus.postMessage([darkMode.checked, pitchBlackMode.checked]);
        isDarkModeEnabled = darkMode.checked;
        switchDarkMode(isDarkModeEnabled);
        chrome.storage.sync.set({
            darkMode: isDarkModeEnabled
        }, () => {
            initColors();
        });
    });
    pitchBlackMode.addEventListener('change', () => {
        vars.pitchBlack = pitchBlackMode.checked;
        chrome.storage.sync.set({
            pitchBlack: pitchBlackMode.checked
        }, () => { });
        themeBus.postMessage([darkMode.checked, pitchBlackMode.checked]);
        switchDarkMode(isDarkModeEnabled);
        initColors();
    });
    timeMode.addEventListener('change', () => {
        if(timeMode.checked) {
            darkMode.disabled = true;
            chrome.storage.sync.set({
                darkMode: false
            }, () => { });
            vars.darkMode = false;
            darkModeText.style.color = 'var(--darker-gray)';
            let dark = isDark();
            darkMode.checked = dark;
            themeBus.postMessage([dark, pitchBlackMode.checked]);
            isDarkModeEnabled = dark;
            switchDarkMode(dark);
        } else {
            darkMode.checked = false;
            darkMode.disabled = false;
            darkModeText.style.color = 'unset';
            themeBus.postMessage([false, pitchBlackMode.checked]);
            isDarkModeEnabled = false;
            switchDarkMode(false);
        }
        vars.timeMode = timeMode.checked;
        vars.systemDarkMode = false;
        systemDarkMode.checked = false;
        chrome.storage.sync.set({
            timeMode: timeMode.checked,
            systemDarkMode: false
        }, () => {
            initColors();
        });
    });
    systemDarkMode.addEventListener('change', () => {
        chrome.storage.sync.set({
            systemDarkMode: systemDarkMode.checked,
            timeMode: systemDarkMode.checked
        }, () => {
            vars.systemDarkMode = systemDarkMode.checked;
            vars.timeMode = true;
            let isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            timeMode.checked = false;
            if(vars.systemDarkMode) {
                darkMode.disabled = true;
                darkModeText.style.color = 'var(--darker-gray)';
                darkMode.checked = isSystemDark;
                if(isSystemDark) {
                    themeBus.postMessage([true, pitchBlackMode.checked]);
                    isDarkModeEnabled = true;
                    switchDarkMode(true);
                } else {
                    themeBus.postMessage([false, pitchBlackMode.checked]);
                    isDarkModeEnabled = false;
                    switchDarkMode(false);
                }
            } else {
                darkMode.disabled = false;
                darkModeText.style.color = 'unset';
                darkMode.checked = false;
                themeBus.postMessage([false, pitchBlackMode.checked]);
                isDarkModeEnabled = false;
                switchDarkMode(false);
            }
            initColors();
        });
    });
    copyLinksAs.addEventListener('change', () => {
        let val = copyLinksAs.value;
        if(val === 'custom') {
            val = prompt(LOC.copy_tweet_links_as.message);
            if(!val) {
                return;
            }
        }
            
        chrome.storage.sync.set({
            copyLinksAs: val
        }, () => { });
    });
    customCSS.addEventListener('keydown', e => {
        if(e.key === "Tab") {
            e.preventDefault();
            e.stopImmediatePropagation();
            let pos = customCSS.selectionStart;
            customCSS.value = customCSS.value.slice(0, pos) + "    " + customCSS.value.slice(pos);
            customCSS.selectionStart = customCSS.selectionEnd = pos + 4;
        }
    });
    customCSSSave.addEventListener('click', () => {
        let cssValue = customCSS.value;
    
        writeCSSToDB(cssValue).then(() => {
            let event = new CustomEvent('customCSS', { detail: cssValue });
            customCSSBus.postMessage({ type: 'css' });
            document.dispatchEvent(event);
        }).catch(error => {
            console.error("Error saving CSS to DB:", error);
        });
    });
    customDownloadTemplateSave.addEventListener('click', () => {
        let val = customDownloadTemplate.value;
        
        vars.customDownloadTemplate = val;
        chrome.storage.sync.set({
            customDownloadTemplate: val
        }, () => { });
    });
    autotranslateLanguageList.addEventListener('change', () => {
        addAutotranslateLanguage.disabled = autotranslateLanguageList.value === 'select';
    });
    addAutotranslateLanguage.addEventListener('click', () => {
        let lang = autotranslateLanguageList.value;
        if(lang === 'select') {
            return;
        }
        if(vars.autotranslateLanguages.includes(lang)) {
            return;
        }
        vars.autotranslateLanguages.push(lang);
        chrome.storage.sync.set({
            autotranslateLanguages: vars.autotranslateLanguages
        }, () => {
            const langNames = new Intl.DisplayNames([LANGUAGE.replace('_', '-')], {type: 'language'})
            let ln = langNames.of(lang);
            let div = document.createElement('div');
            div.classList.add('autotranslate-language');
            div.dataset.lang = lang;
            div.innerHTML = html`<span>${ln}</span><button class="remove-autotranslate-language nice-button">${LOC.remove.message}</button>`;
            div.querySelector('button').addEventListener('click', () => {
                vars.autotranslateLanguages = vars.autotranslateLanguages.filter(l => l !== lang);
                chrome.storage.sync.set({
                    autotranslateLanguages: vars.autotranslateLanguages
                }, () => {
                    div.remove();
                });
            });
            autotranslateLanguages.appendChild(div);
        });
    });
    for(let lang of vars.autotranslateLanguages) {
        const langNames = new Intl.DisplayNames([LANGUAGE.replace('_', '-')], {type: 'language'})
        let ln = langNames.of(lang);
        let div = document.createElement('div');
        div.classList.add('autotranslate-language');
        div.dataset.lang = lang;
        div.innerHTML = html`<span>${ln}</span><button class="remove-autotranslate-language nice-button">${LOC.remove.message}</button>`;
        div.querySelector('button').addEventListener('click', () => {
            vars.autotranslateLanguages = vars.autotranslateLanguages.filter(l => l !== lang);
            chrome.storage.sync.set({
                autotranslateLanguages: vars.autotranslateLanguages
            }, () => {
                div.remove();
            });
        });
        autotranslateLanguages.appendChild(div);
    }

    hideOriginalLanguages.addEventListener('change', () => {
        chrome.storage.sync.set({
            hideOriginalLanguages: hideOriginalLanguages.checked
        }, () => { });
    });

    // Set values
    if(vars.linkColor) {
        linkColor.value = vars.linkColor;
        linkColor.style.color = vars.linkColor;
        linkColor.style.backgroundColor = vars.linkColor;
        root.style.setProperty('--link-color', vars.linkColor);
    } else {
        linkColor.value = '#4bacd2';
        linkColor.style.color = '#4bacd2';
        linkColor.style.backgroundColor = '#4bacd2';
    }
    if(vars.font) {
		fontElement.value = vars.font;
        root.style.setProperty('--font', `"${vars.font}"`);
		if (fontElement.selectedIndex==-1) {
			fontElement.value = "_custom";
			refreshFontSelectLabels(fontElementLabel[0], LOC.font.message, vars.font);
		}
    }
    if(vars.tweetFont) {
		tweetFontElement.value = vars.tweetFont;
        root.style.setProperty('--tweet-font', `"${vars.tweetFont}"`);
		if (tweetFontElement.selectedIndex==-1) {
			tweetFontElement.value = "_custom";
			refreshFontSelectLabels(tweetFontElementLabel[0], LOC.tweet_text_font.message, vars.tweetFont);
		}
    }
    if(vars.modernUI){
        root.style.setProperty('--icon-font', `"edgeicons", "RosettaIcons"`);
    }
    heartsNotStars.checked = !!vars.heartsNotStars;
    slowLinkColorsInTL.checked = !!vars.slowLinkColorsInTL;
    alwaysShowLinkColor.checked = !!vars.alwaysShowLinkColor;
    enableTwemoji.checked = !!vars.enableTwemoji;
    enableHashflags.checked = !!vars.enableHashflags;
    showExactValues.checked = !!vars.showExactValues;
    localizeDigit.checked = !!vars.localizeDigit;
    hideTimelineTypes.checked = !!vars.hideTimelineTypes;
    timelineType.value = vars.timelineType ? vars.timelineType : 'chrono';
    showTopicTweets.checked = !!vars.showTopicTweets;
    newGallery.checked = !!vars.newGallery;
    darkMode.checked = !!vars.darkMode;
    pitchBlackMode.checked = !!vars.pitchBlack;
    timeMode.checked = !!vars.timeMode && !vars.systemDarkMode;
    systemDarkMode.checked = !!vars.systemDarkMode;
    disableHotkeys.checked = !!vars.disableHotkeys;
    disableRetweetHotkey.checked = !!vars.disableRetweetHotkey;
    disableLikeHotkey.checked = !!vars.disableLikeHotkey;
    disableFindHotkey.checked = !!vars.disableFindHotkey;
    noBigFont.checked = !!vars.noBigFont;
    autoplayVideos.checked = !!vars.autoplayVideos;
    displaySensitiveContent.checked = !!vars.displaySensitiveContent;
    seeTweetViews.checked = !!vars.seeTweetViews;
    twitterBlueCheckmarks.checked = !!vars.twitterBlueCheckmarks;
    showBasedIn.checked = !!vars.showBasedIn;
    developerMode.checked = !!vars.developerMode;
    useNewIcon.checked = !!vars.useNewIcon;
    updateTimelineAutomatically.checked = !!vars.updateTimelineAutomatically;
    hideTrends.checked = !!vars.hideTrends;
    hideWtf.checked = !!vars.hideWtf;
    hideLikes.checked = !!vars.hideLikes;
    hideFollowers.checked = !!vars.hideFollowers;
    disablePersonalizedTrends.checked = !!vars.disablePersonalizedTrends;
    showBookmarkCount.checked = !!vars.showBookmarkCount;
    hideCommunityNotes.checked = !!vars.hideCommunityNotes;
    disableGifAutoplay.checked = !!vars.disableGifAutoplay;
    showMediaCount.checked = !!vars.showMediaCount;
    pinProfileOnNavbar.checked = !!vars.pinProfileOnNavbar;
    pinBookmarksOnNavbar.checked = !!vars.pinBookmarksOnNavbar;
    pinListsOnNavbar.checked = !!vars.pinListsOnNavbar;
    useOldDefaultProfileImage.checked = !!vars.useOldDefaultProfileImage;
    hideOriginalLanguages.checked = !!vars.hideOriginalLanguages;
    uncensorAdultContentAutomatically.checked = !!vars.uncensorAdultContentAutomatically;
    uncensorGraphicViolenceAutomatically.checked = !!vars.uncensorGraphicViolenceAutomatically;
    uncensorSensitiveContentAutomatically.checked = !!vars.uncensorSensitiveContentAutomatically;
    useOldStyleReply.checked = !!vars.useOldStyleReply;
    enableAd.checked = !!vars.enableAd;
    showUserPreviewsOnMobile.checked = !!vars.showUserPreviewsOnMobile;
    openNotifsAsModal.checked = !!vars.openNotifsAsModal;
    enableIframeNavigation.checked = !!vars.enableIframeNavigation;
    muteVideos.checked = !!vars.muteVideos;
    dontPauseVideos.checked = !!vars.dontPauseVideos;
    extensionCompatibilityMode.checked = !!vars.extensionCompatibilityMode;
    disableDataSaver.checked = !!vars.disableDataSaver;
    disableAcceptType.checked = !!vars.disableAcceptType;
    showUserFollowerCountsInLists.checked = !!vars.showUserFollowerCountsInLists;
    showQuoteCount.checked = !!vars.showQuoteCount;
    hideUnfollowersPage.checked = !!vars.hideUnfollowersPage;
    transitionProfileBanner.checked = !!vars.transitionProfileBanner;
    showBoringIndicators.checked = !!vars.showBoringIndicators;
    useRetweetedId.checked = !!vars.useRetweetedId;
    disableProfileCustomizations.checked = !!vars.disableProfileCustomizations;
    useXChat.checked = !!vars.useXChat;
    if(vars.customCSS) {
        writeCSSToDB(vars.customCSS)
    }
    customCSS.value = await readCSSFromDB();
    customDownloadTemplate.value = vars.customDownloadTemplate;
    document.getElementById('stt-div').hidden = vars.timelineType !== 'algo' && vars.timelineType !== 'algov2';
    savePreferredQuality.checked = !!vars.savePreferredQuality;
    showOriginalImages.checked = !!vars.showOriginalImages;
    roundAvatars.checked = !!vars.roundAvatars;
    modernUI.checked = !!vars.modernUI;
    language.value = vars.language ? vars.language : 'en';
    document.getElementById('loc-dig').hidden = language.value !== 'zh_TW' && language.value !== 'zh_CN' && language.value !== 'ja' && language.value !== 'ko';
    autotranslationMode.value = vars.autotranslationMode;
    copyLinksAs.value = ['twitter.com', 'fxtwitter.com', 'vxtwitter.com', 'nitter.net', 'fixupx.com', 'x.com'].includes(vars.copyLinksAs) ? vars.copyLinksAs : 'custom';
    if(vars.timeMode) {
        darkMode.disabled = true;
        darkMode.checked = isDark();
        darkModeText.style.color = 'var(--darker-gray)';
    }

    var isMobile = /Mobi/i.test(window.navigator.userAgent); 
    if(!isMobile){
        document.getElementById('mobile-setting').hidden = true;
    }

    document.getElementById('tl-help').addEventListener('click', () => {
        createModal(html`
            <div style="color:var(--almost-black);max-width:600px" class="help-modal">
                <h2 class="help-header larger" style="padding-top: 0;margin-bottom: 5px;">${LOC.timeline_type.message}</h2>
                <div><b>${LOC.chrono.message}</b> - ${LOC.chrono_help.message}</div>
                <div><b>${LOC.chrono_no_retweets.message}</b> - ${LOC.chrono_no_retweets_help.message}</div>
                <div><b>${LOC.chrono_retweets.message}</b> - ${LOC.chrono_retweets_help.message}</div>
                <div><b>${LOC.algov2.message}</b> - ${LOC.algov2_help.message}</div>
                <div><b>${LOC.popular_from_follows.message}</b> - ${LOC.popular_from_follows_help.message}</div>
            </div>
        `)
    });

	document.getElementById('autotl-help').addEventListener('click', () => {
        createModal(html`
            <div style="color:var(--almost-black);max-width:600px" class="help-modal">
                <h2 class="help-header larger" style="padding-top: 0;margin-bottom: 5px;">${LOC.autotranslation.message}</h2>
                <div>${LOC.autotranslation_help1.message}</div>
                <div>${LOC.autotranslation_help2.message}</div>
                <div>${LOC.autotranslation_help3.message}</div>
                <div><ul>
					<li>${LOC.autotranslation_help4.message}</li>
					<li>${LOC.autotranslation_help5.message}</li>
				</ul></div>
            </div>
        `)
    });

    if(navigator.userAgent.toLowerCase().includes('firefox')) {
        document.getElementById('enable-iframe-navigation-div').hidden = true;
    }

    // Language
    let [LOC_DATA, LOC_EN_DATA] = await Promise.all([
        fetch(chrome.runtime.getURL(`_locales/${LANGUAGE}/messages.json`)).then(response => response.json()),
        fetch(chrome.runtime.getURL(`_locales/en/messages.json`)).then(response => response.json())
    ]);
    LOC_DATA = Object.keys(LOC_DATA);
    LOC_EN_DATA = Object.keys(LOC_EN_DATA);
    let diff = LOC_EN_DATA.length - LOC_DATA.length;
    if(diff > 5) {
        document.getElementById('language-warning').hidden = false;
    } else {
        document.getElementById('language-warning').hidden = true;
    }
    document.getElementById('language-warning-button').addEventListener('click', () => {
        let lang = document.querySelector(`option[value="${LANGUAGE}"]`).innerText;
        if(!lang) lang = LANGUAGE.toUpperCase();
        // Don't translate this
        createModal(html`
        <div style="color:var(--almost-black);max-width:600px" class="help-modal">
            <h2 class="help-header larger" style="padding-top: 0;margin-bottom: 5px;">Do you know English?</h2>
            <div>Do you know English (at least B2) and ${lang}? If so, you can help translate this extension into your language!</div>
            <div>${lang} currently lacks ${diff} line translations. You can help translating the missing messages <a href="https://github.com/dimdenGD/OldTwitter/tree/master/_locales#readme" target="_blank">here</a>.</div>
            <div>Thank you for your help!</div>
        </div>
        `);
    });
    const langNames = new Intl.DisplayNames([LANGUAGE.replace('_', '-')], {type: 'language'})
    for(let l of TRANSLATION_SUPPORTED_LANGUAGES) {
        const langNames2 = new Intl.DisplayNames([l], {type: 'language'})
        let ln = langNames.of(l);
        let lne = langNames2.of(l);
        let opt = document.createElement('option');
        opt.value = l;
        if(LANGUAGE === l) {
            opt.innerText = ln;
        } else {
            opt.innerText = `${ln} (${lne})`;
        }
        autotranslateLanguageList.appendChild(opt);
    }

    // Import, export, reset
    document.getElementById('export-settings').addEventListener('click', () => {
        let varsObj = Object.assign({}, vars);
        delete varsObj.customCSSVariables;
        delete varsObj.customCSS;
        delete varsObj.autotranslateProfiles;
        delete varsObj.viewedtweets;
        delete varsObj.linkColor;
        delete varsObj.font;
        delete varsObj.tweetFont;
        delete varsObj.acknowledgedCssAccess;

        let a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(varsObj)], { type: 'application/json' }));
        a.download = 'oldtwitter_settings.json';

        a.click();
    });
    document.getElementById('import-settings').addEventListener('click', () => {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', () => {
            let file = input.files[0];
            if(!file) return;
            let reader = new FileReader();
            reader.onload = () => {
                let json = JSON.parse(reader.result);
                chrome.storage.sync.set(json, () => {
                    location.reload();
                });
            };
            reader.readAsText(file);
        });
        input.click();
    });
    document.getElementById('export-style').addEventListener('click', async () => {
        let customCssfromDb = await readCSSFromDB();
        let json = {
            customCSSVariables: vars.customCSSVariables,
            customCSS: customCssfromDb,
            font: vars.font,
            tweetFont: vars.tweetFont,
            linkColor: vars.linkColor
        }
        let a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(json)], { type: 'application/json' }));
        a.download = 'oldtwitter_style.json';

        a.click();
    });
    document.getElementById('import-style').addEventListener('click', () => {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', () => {
            let file = input.files[0];
            if(!file) return;
            let reader = new FileReader();
            reader.onload = () => {
                let json = JSON.parse(reader.result);
                chrome.storage.sync.set(json, () => {
                    location.reload();
                });
            };
            reader.readAsText(file);
        });
        input.click();
    });
    document.getElementById('reset-settings').addEventListener('click', () => {
        let sure = confirm(LOC.reset_settings_sure.message);
        if(!sure) return;
        chrome.storage.sync.clear(() => {
            location.reload();
        });
    });
    document.getElementById('clear-caches').addEventListener('click', () => {
        chrome.storage.local.get(['adminpass', 'cssDraft', 'otPrivateTokens', 'extensiveLogging', 'hasRetweetedWithHotkey', 'installed', 'lastSearches', 'lastUserId', 'lastVersion', 'nextPlug', 'unfollows'], async data => {
            chrome.storage.local.clear(() => {
                chrome.storage.local.set(data, () => {
                    location.reload();
                });
            });
        });
    });

    // Colors
    initColors();

    document.getElementById('reset-all-colors').addEventListener('click', () => {
        let sure = confirm(LOC.reset_colors_sure.message);
        if(!sure) return;
        chrome.storage.sync.set({
            customCSSVariables: ''
        }, () => {
            vars.customCSSVariables = '';
            customCSSBus.postMessage({type: 'vars'});
            let resetButtons = document.querySelectorAll('.color-reset');
            for(let i = 0; i < resetButtons.length; i++) {
                if(!resetButtons[i].disabled) {
                    resetButtons[i].click();
                }
            }
        });
    });
    document.getElementById('export-colors').addEventListener('click', () => {
        let a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([vars.customCSSVariables], { type: 'text/css' }));
        a.download = 'oldtwitter_colors.css';
        a.click();
    });
    document.getElementById('import-colors').addEventListener('click', () => {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.css';
        input.addEventListener('change', () => {
            let file = input.files[0];
            if(!file) return;
            let reader = new FileReader();
            reader.onload = () => {
                let css = reader.result;
                chrome.storage.sync.set({
                    customCSSVariables: css
                }, () => {
                    vars.customCSSVariables = css;
                    customCSSBus.postMessage({type: 'vars'});
                    location.reload();
                });
            };
            reader.readAsText(file);
        });
        input.click();
    });

    // Run
    updateUserData();
    renderDiscovery();
    renderTrends();
    document.getElementById('loading-box').hidden = true;
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 15);
    setInterval(renderTrends, 60000 * 5);
}, 50);
