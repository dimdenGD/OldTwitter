let user = {};
let settings;
let vars;
chrome.storage.sync.get(['linkColor', 'font', 'heartsNotStars', 'linkColorsInTL', 'enableTwemoji'], data => {
    vars = data;
});
let cursor;
let searchParams = {}, searchSettings = {};
let saved;

// Util

function updateSubpage() {
    let params = Object.fromEntries(new URLSearchParams(location.search));
    searchParams = params || {};
    searchSettings = {};
    let activeParams = Array.from(document.getElementsByClassName('search-switch-active'));
    activeParams.forEach(a => a.classList.remove('search-switch-active'));
    if(params.f === 'live') {
        document.getElementById('ns-live').classList.add('search-switch-active');
        searchSettings.type = 'live';
    } else if(params.f === 'user') {
        document.getElementById('ns-people').classList.add('search-switch-active');
        searchSettings.type = 'user';
    } else if(params.f === 'image') {
        document.getElementById('ns-photos').classList.add('search-switch-active');
        searchSettings.type = 'image';
    } else if(params.f === 'video') {
        document.getElementById('ns-videos').classList.add('search-switch-active');
        searchSettings.type = 'video';
    } else {
        document.getElementById('ns-popular').classList.add('search-switch-active');
        searchSettings.type = 'popular';
    }

    if(params.pf === 'on') {
        document.getElementById('ns-followedpeople').classList.add('search-switch-active');
        searchSettings.followedPeople = true;
    } else {
        document.getElementById('ns-allpeople').classList.add('search-switch-active');
        searchSettings.followedPeople = false;
    }
    if(params.lf === 'on') {
        document.getElementById('ns-near').classList.add('search-switch-active');
        searchSettings.nearYou = true;
    } else {
        document.getElementById('ns-everywhere').classList.add('search-switch-active');
        searchSettings.nearYou = false;
    }
    document.getElementById('search-input').value = params.q;
}
function craftParams() {
    let params = new URLSearchParams();
    if(searchSettings.type !== 'popular') params.set('f', searchSettings.type);
    if(searchSettings.followedPeople) params.set('pf', 'on');
    if(searchSettings.nearYou) params.set('lf', 'on');
    if(searchParams.q) params.set('q', searchParams.q);
    else params.set('q', document.getElementById('search-input').value);
    return params.toString();
}

function updateUserData() {
    API.verifyCredentials().then(u => {
        user = u;
        const event = new CustomEvent('updateUserData', { detail: u });
        document.dispatchEvent(event);
        renderUserData();
    }).catch(e => {
        if (e === "Not logged in") {
            window.location.href = "https://twitter.com/login";
        }
        console.error(e);
    });
}
// Render
function renderUserData() {
    document.getElementById('wtf-viewall').href = `https://mobile.twitter.com/i/connect_people?user_id=${user.id_str}`;
}

async function appendTweet(t, timelineContainer, options = {}) {
    const tweet = document.createElement('div');
    tweet.addEventListener('click', e => {
        if(e.target.className.startsWith('tweet tweet-id-') || e.target.className === 'tweet-body' || e.target.className === 'tweet-interact') {
            openInNewTab(`https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
        }
    });
    tweet.className = `tweet tweet-id-${t.id_str}`;
    if (options.selfThreadContinuation) tweet.classList.add('tweet-self-thread-continuation');
    if (options.noTop) tweet.classList.add('tweet-no-top');
    const mediaClasses = [
        undefined,
        'tweet-media-element-one',
        'tweet-media-element-two',
        'tweet-media-element-three',
        'tweet-media-element-four',
    ];
    const sizeFunctions = [
        undefined,
        (w, h) => [w > 450 ? 450 : w, h > 500 ? 500 : h],
        (w, h) => [w > 200 ? 200 : w, h > 400 ? 400 : h],
        (w, h) => [w > 150 ? 150 : w, h > 250 ? 250 : h],
        (w, h) => [w > 100 ? 100 : w, h > 150 ? 150 : h],
    ];
    const quoteSizeFunctions = [
        undefined,
        (w, h) => [w > 400 ? 400 : w, h > 400 ? 400 : h],
        (w, h) => [w > 200 ? 200 : w, h > 400 ? 400 : h],
        (w, h) => [w > 125 ? 125 : w, h > 200 ? 200 : h],
        (w, h) => [w > 100 ? 100 : w, h > 150 ? 150 : h],
    ];
    let textWithoutLinks = t.full_text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').replace(/(?<!\w)@([\w+]{1,15}\b)/g, '');
    let isEnglish = textWithoutLinks.length < 1 ? {languages:[{language:'en', percentage:100}]} : await chrome.i18n.detectLanguage(textWithoutLinks);
    isEnglish = isEnglish.languages[0] && isEnglish.languages[0].percentage > 60 && isEnglish.languages[0].language.startsWith('en');
    tweet.innerHTML = /*html*/`
        <div class="tweet-top" hidden></div>
        <a class="tweet-avatar-link" href="https://twitter.com/${t.user.screen_name}"><img src="${t.user.profile_image_url_https.replace("_normal", "_bigger")}" alt="${t.user.name}" class="tweet-avatar" width="48" height="48"></a>
        <div class="tweet-header">
            <a class="tweet-header-info" href="https://twitter.com/${t.user.screen_name}">
                <b class="tweet-header-name ${t.user.verified || t.user.id_str === '1123203847776763904' ? 'user-verified' : ''} ${t.user.protected ? 'user-protected' : ''}">${escapeHTML(t.user.name)}</b>
                <span class="tweet-header-handle">@${t.user.screen_name}</span>
            </a>
        </div>
        <a class="tweet-time" data-timestamp="${new Date(t.created_at).getTime()}" title="${new Date(t.created_at).toLocaleString()}" href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}">${timeElapsed(new Date(t.created_at).getTime())}</a>
        <div class="tweet-body">
            <span class="tweet-body-text ${t.full_text && t.full_text.length > 100 ? 'tweet-body-text-long' : 'tweet-body-text-short'}">${t.full_text ? escapeHTML(t.full_text).replace(/\n/g, '<br>').replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1" target="_blank">@$1</a>`).replace(/(?<!\w)#([\w+]+\b)/g, `<a href="https://twitter.com/hashtag/$1">#$1</a>`) : ''}</span>
            ${!isEnglish ? `
            <br>
            <span class="tweet-translate">Translate tweet</span>
            ` : ``}
            ${t.extended_entities && t.extended_entities.media ? `
            <div class="tweet-media">
                ${t.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escapeHTML(m.ext_alt_text)}" title="${escapeHTML(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop autoplay muted' : ''} src="${m.type === 'photo' ? m.media_url_https : m.video_info.variants.find(v => v.content_type === 'video/mp4').url}" class="tweet-media-element ${mediaClasses[t.extended_entities.media.length]} ${!settings.display_sensitive_media && t.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' ? '</video>' : ''}`).join('\n')}
            </div>
            ` : ``}
            ${t.card ? `<div class="tweet-poll"></div>` : ''}
            ${t.quoted_status ? `
            <a class="tweet-body-quote" target="_blank" href="https://twitter.com/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}">
                <img src="${t.quoted_status.user.profile_image_url_https}" alt="${escapeHTML(t.quoted_status.user.name)}" class="tweet-avatar-quote" width="24" height="24">
                <div class="tweet-header-quote">
                    <span class="tweet-header-info-quote">
                        <b class="tweet-header-name-quote">${escapeHTML(t.quoted_status.user.name)}</b>
                        <span class="tweet-header-handle-quote">@${t.quoted_status.user.screen_name}</span>
                    </span>
                </div>
                <span class="tweet-time-quote" data-timestamp="${new Date(t.quoted_status.created_at).getTime()}" title="${new Date(t.quoted_status.created_at).toLocaleString()}">${timeElapsed(new Date(t.quoted_status.created_at).getTime())}</span>
                <span class="tweet-body-text-quote tweet-body-text-long" style="color:var(--default-text-color)!important">${t.quoted_status.full_text ? escapeHTML(t.quoted_status.full_text).replace(/\n/g, '<br>') : ''}</span>
                ${t.quoted_status.extended_entities && t.quoted_status.extended_entities.media ? `
                <div class="tweet-media-quote">
                    ${t.quoted_status.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escapeHTML(m.ext_alt_text)}" title="${escapeHTML(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${quoteSizeFunctions[t.quoted_status.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${quoteSizeFunctions[t.quoted_status.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop autoplay muted' : ''} src="${m.type === 'photo' ? m.media_url_https : m.video_info.variants.find(v => v.content_type === 'video/mp4').url}" class="tweet-media-element tweet-media-element-quote ${mediaClasses[t.quoted_status.extended_entities.media.length]} ${!settings.display_sensitive_media && t.quoted_status.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' ? '</video>' : ''}`).join('\n')}
                </div>
                ` : ''}
            </a>
            ` : ``}
            ${options.selfThreadButton && t.self_thread.id_str ? `<br><a class="tweet-self-thread-button" href="https://twitter.com/${t.user.screen_name}/status/${t.self_thread.id_str}">Show this thread</a>` : ``}
            <div class="tweet-interact">
                <span class="tweet-interact-reply">${t.reply_count}</span>
                <span class="tweet-interact-retweet ${t.retweeted ? 'tweet-interact-retweeted' : ''}">${t.retweet_count}</span>
                <div class="tweet-interact-retweet-menu" hidden>
                    <span class="tweet-interact-retweet-menu-retweet">${t.retweeted ? 'Unretweet' : 'Retweet'}</span><br>
                    <span class="tweet-interact-retweet-menu-quote">Quote tweet</span>
                </div>
                <span class="tweet-interact-favorite ${t.favorited ? 'tweet-interact-favorited' : ''}">${t.favorite_count}</span>
                <span class="tweet-interact-more"></span>
                <div class="tweet-interact-more-menu" hidden>
                    <span class="tweet-interact-more-menu-copy">Copy link</span><br>
                    <span class="tweet-interact-more-menu-embed">Embed tweet</span><br>
                    <span class="tweet-interact-more-menu-share">Share tweet</span><br>
                    ${t.user.id_str === user.id_str ? `
                    <hr>
                    <span class="tweet-interact-more-menu-analytics">Tweet analytics</span><br>
                    <span class="tweet-interact-more-menu-delete">Delete tweet</span><br>
                    ` : ``}
                    <hr>
                    <span class="tweet-interact-more-menu-refresh">Refresh tweet data</span><br>
                    ${t.extended_entities && t.extended_entities.media.length === 1 ? `<span class="tweet-interact-more-menu-download">Download media</span><br>` : ``}
                    ${t.extended_entities && t.extended_entities.media.length === 1 && t.extended_entities.media[0].type === 'animated_gif' ? `<span class="tweet-interact-more-menu-download-gif">Download as GIF</span><br>` : ``}
                </div>
            </div>
            <div class="tweet-reply" hidden>
                <br>
                <b style="font-size: 12px;display: block;margin-bottom: 5px;">Replying to tweet <span class="tweet-reply-upload">[upload media]</span> <span class="tweet-reply-cancel">[cancel]</span></b>
                <span class="tweet-reply-error" style="color:red"></span>
                <textarea maxlength="280" class="tweet-reply-text" placeholder="Cool reply tweet"></textarea>
                <button class="tweet-reply-button nice-button">Reply</button><br>
                <span class="tweet-reply-char">0/280</span><br>
                <div class="tweet-reply-media" style="padding-bottom: 10px;"></div>
            </div>
            <div class="tweet-quote" hidden>
                <br>
                <b style="font-size: 12px;display: block;margin-bottom: 5px;">Quote tweet <span class="tweet-quote-upload">[upload media]</span> <span class="tweet-quote-cancel">[cancel]</span></b>
                <span class="tweet-quote-error" style="color:red"></span>
                <textarea maxlength="280" class="tweet-quote-text" placeholder="Cool quote tweet"></textarea>
                <button class="tweet-quote-button nice-button">Quote</button><br>
                <span class="tweet-quote-char">0/280</span><br>
                <div class="tweet-quote-media" style="padding-bottom: 10px;"></div>
            </div>
            <div class="tweet-self-thread-div" ${options.selfThreadContinuation && t.self_thread.id_str ? '' : 'hidden'}>
                <span class="tweet-self-thread-line"></span>
                <div class="tweet-self-thread-line-dots"></div>
                <br>${options.selfThreadContinuation && t.self_thread.id_str ? `<a class="tweet-self-thread-button" href="https://twitter.com/${t.user.screen_name}/status/${t.self_thread.id_str}">Show this thread</a>` : `<br>`}
            </div>
        </div>
    `;
    if(t.card) {
        generatePollCode(t, tweet, user);
    }
    if (options.top) {
        tweet.querySelector('.tweet-top').hidden = false;
        const icon = document.createElement('span');
        icon.innerText = options.top.icon;
        icon.classList.add('tweet-top-icon');
        icon.style.color = options.top.color;

        const span = document.createElement("span");
        span.classList.add("tweet-top-text");
        span.innerHTML = options.top.text;
        tweet.querySelector('.tweet-top').append(icon, span);
    }
    const tweetBodyText = tweet.getElementsByClassName('tweet-body-text')[0];
    const tweetTranslate = tweet.getElementsByClassName('tweet-translate')[0];

    const tweetReplyCancel = tweet.getElementsByClassName('tweet-reply-cancel')[0];
    const tweetReplyUpload = tweet.getElementsByClassName('tweet-reply-upload')[0];
    const tweetReply = tweet.getElementsByClassName('tweet-reply')[0];
    const tweetReplyButton = tweet.getElementsByClassName('tweet-reply-button')[0];
    const tweetReplyError = tweet.getElementsByClassName('tweet-reply-error')[0];
    const tweetReplyText = tweet.getElementsByClassName('tweet-reply-text')[0];
    const tweetReplyChar = tweet.getElementsByClassName('tweet-reply-char')[0];
    const tweetReplyMedia = tweet.getElementsByClassName('tweet-reply-media')[0];

    const tweetInteractReply = tweet.getElementsByClassName('tweet-interact-reply')[0];
    const tweetInteractRetweet = tweet.getElementsByClassName('tweet-interact-retweet')[0];
    const tweetInteractFavorite = tweet.getElementsByClassName('tweet-interact-favorite')[0];
    const tweetInteractMore = tweet.getElementsByClassName('tweet-interact-more')[0];

    const tweetQuote = tweet.getElementsByClassName('tweet-quote')[0];
    const tweetQuoteCancel = tweet.getElementsByClassName('tweet-quote-cancel')[0];
    const tweetQuoteUpload = tweet.getElementsByClassName('tweet-quote-upload')[0];
    const tweetQuoteButton = tweet.getElementsByClassName('tweet-quote-button')[0];
    const tweetQuoteError = tweet.getElementsByClassName('tweet-quote-error')[0];
    const tweetQuoteText = tweet.getElementsByClassName('tweet-quote-text')[0];
    const tweetQuoteChar = tweet.getElementsByClassName('tweet-quote-char')[0];
    const tweetQuoteMedia = tweet.getElementsByClassName('tweet-quote-media')[0];

    const tweetInteractRetweetMenu = tweet.getElementsByClassName('tweet-interact-retweet-menu')[0];
    const tweetInteractRetweetMenuRetweet = tweet.getElementsByClassName('tweet-interact-retweet-menu-retweet')[0];
    const tweetInteractRetweetMenuQuote = tweet.getElementsByClassName('tweet-interact-retweet-menu-quote')[0];

    const tweetInteractMoreMenu = tweet.getElementsByClassName('tweet-interact-more-menu')[0];
    const tweetInteractMoreMenuCopy = tweet.getElementsByClassName('tweet-interact-more-menu-copy')[0];
    const tweetInteractMoreMenuEmbed = tweet.getElementsByClassName('tweet-interact-more-menu-embed')[0];
    const tweetInteractMoreMenuShare = tweet.getElementsByClassName('tweet-interact-more-menu-share')[0];
    const tweetInteractMoreMenuAnalytics = tweet.getElementsByClassName('tweet-interact-more-menu-analytics')[0];
    const tweetInteractMoreMenuRefresh = tweet.getElementsByClassName('tweet-interact-more-menu-refresh')[0];
    const tweetInteractMoreMenuDownload = tweet.getElementsByClassName('tweet-interact-more-menu-download')[0];
    const tweetInteractMoreMenuDownloadGif = tweet.getElementsByClassName('tweet-interact-more-menu-download-gif')[0];
    const tweetInteractMoreMenuDelete = tweet.getElementsByClassName('tweet-interact-more-menu-delete')[0];

    // Translate
    if(tweetTranslate) tweetTranslate.addEventListener('click', async () => {
        let translated = await API.translateTweet(t.id_str);
        tweetTranslate.hidden = true;
        tweetBodyText.innerHTML += `<br>
        <span style="font-size: 12px;color: var(--light-gray);">Translated from [${translated.translated_lang}]:</span>
        <br>
        <span>${escapeHTML(translated.text)}</span>`;
        if(vars.enableTwemoji) twemoji.parse(tweetBodyText);
    });

    // Media
    if (t.extended_entities && t.extended_entities.media) {
        const tweetMedia = tweet.getElementsByClassName('tweet-media')[0];
        tweetMedia.addEventListener('click', e => {
            if (e.target.className.includes('tweet-media-element-censor')) {
                return e.target.classList.remove('tweet-media-element-censor');
            }
            if (e.target.tagName === 'IMG') {
                new Viewer(tweetMedia);
                e.target.click();
            }
        });
    }

    // Links
    if (tweetBodyText && tweetBodyText.lastChild && tweetBodyText.lastChild.href && tweetBodyText.lastChild.href.startsWith('https://t.co/')) {
        if (t.entities.urls.length === 0 || t.entities.urls[t.entities.urls.length - 1].url !== tweetBodyText.lastChild.href) {
            tweetBodyText.lastChild.remove();
        }
    }
    let links = Array.from(tweetBodyText.getElementsByTagName('a')).filter(a => a.href.startsWith('https://t.co/'));
    links.forEach(a => {
        let link = t.entities.urls.find(u => u.url === a.href);
        if (link) {
            a.innerText = link.display_url;
            a.href = link.expanded_url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }
    });

    // Reply
    tweetReplyCancel.addEventListener('click', () => {
        tweetReply.hidden = true;
        tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
    });
    let replyMedia = [];
    tweetReply.addEventListener('drop', e => {
        handleDrop(e, replyMedia, tweetReplyMedia);
    });
    tweetReplyUpload.addEventListener('click', () => {
        getMedia(replyMedia, tweetReplyMedia);
    });
    tweetInteractReply.addEventListener('click', () => {
        if (!tweetQuote.hidden) tweetQuote.hidden = true;
        if (tweetReply.hidden) {
            tweetInteractReply.classList.add('tweet-interact-reply-clicked');
        } else {
            tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
        }
        tweetReply.hidden = !tweetReply.hidden;
        setTimeout(() => {
            tweetReplyText.focus();
        })
    });
    tweetReplyText.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.ctrlKey) {
            tweetReplyButton.click();
        }
        tweetReplyChar.innerText = `${tweetReplyText.value.length}/280`;
        if(tweetReplyText.value.length > 265) {
            tweetReplyChar.style.color = "#c26363";
        } else {
            tweetReplyChar.style.color = "";
        }
    });
    tweetReplyText.addEventListener('keyup', e => {
        tweetReplyChar.innerText = `${tweetReplyText.value.length}/280`;
        if(tweetReplyText.value.length > 265) {
            tweetReplyChar.style.color = "#c26363";
        } else {
            tweetReplyChar.style.color = "";
        }
    });
    tweetReplyButton.addEventListener('click', async () => {
        tweetReplyError.innerHTML = '';
        let text = tweetReplyText.value;
        if (text.length === 0 && replyMedia.length === 0) return;
        tweetReplyButton.disabled = true;
        let uploadedMedia = [];
        for (let i in replyMedia) {
            let media = replyMedia[i];
            try {
                media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = false;
                let mediaId = await API.uploadMedia({
                    media_type: media.type,
                    media_category: media.category,
                    media: media.data,
                    alt: media.alt,
                    loadCallback: data => {
                        media.div.getElementsByClassName('new-tweet-media-img-progress')[0].innerText = `${data.text} (${data.progress}%)`;
                    }
                });
                uploadedMedia.push(mediaId);
            } catch (e) {
                media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = true;
                console.error(e);
                alert(e);
            }
        }
        let tweetObject = {
            status: text,
            in_reply_to_status_id: t.id_str,
            auto_populate_reply_metadata: true,
            batch_mode: 'off',
            exclude_reply_user_ids: '',
            cards_platform: 'Web-13',
            include_entities: 1,
            include_user_entities: 1,
            include_cards: 1,
            send_error_codes: 1,
            tweet_mode: 'extended',
            include_ext_alt_text: true,
            include_reply_count: true
        };
        if (uploadedMedia.length > 0) {
            tweetObject.media_ids = uploadedMedia.join(',');
        }
        let tweetData;
        try {
            tweetData = await API.postTweet(tweetObject)
        } catch (e) {
            tweetReplyError.innerHTML = (e && e.message ? e.message : e) + "<br>";
            tweetReplyButton.disabled = false;
            return;
        }
        if (!tweetData) {
            tweetReplyButton.disabled = false;
            tweetReplyError.innerHTML = "Error sending tweet<br>";
            return;
        }
        tweetReplyText.value = '';
        tweetReply.hidden = true;
        tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
        tweetInteractReply.innerText = parseInt(tweetInteractReply.innerText) + 1;
        tweetData._ARTIFICIAL = true;
        timeline.data.unshift(tweetData);
        tweet.getElementsByClassName('tweet-self-thread-div')[0].hidden = false;
        tweetReplyButton.disabled = false;
        tweetReplyMedia.innerHTML = [];
        replyMedia = [];
    });

    // Retweet / Quote Tweet
    let retweetClicked = false;
    tweetQuoteCancel.addEventListener('click', () => {
        tweetQuote.hidden = true;
    });
    tweetInteractRetweet.addEventListener('click', async () => {
        if (!tweetQuote.hidden) {
            tweetQuote.hidden = true;
            return;
        }
        if (tweetInteractRetweetMenu.hidden) {
            tweetInteractRetweetMenu.hidden = false;
        }
        if(retweetClicked) return;
        retweetClicked = true;
        setTimeout(() => {
            document.body.addEventListener('click', () => {
                retweetClicked = false;
                setTimeout(() => tweetInteractRetweetMenu.hidden = true, 50);
            }, { once: true });
        }, 50);
    });
    tweetInteractRetweetMenuRetweet.addEventListener('click', async () => {
        if (!t.retweeted) {
            let tweetData;
            try {
                tweetData = await API.retweetTweet(t.id_str);
            } catch (e) {
                console.error(e);
                return;
            }
            if (!tweetData) {
                return;
            }
            tweetInteractRetweetMenuRetweet.innerText = 'Unretweet';
            tweetInteractRetweet.classList.add('tweet-interact-retweeted');
            tweetInteractRetweet.innerText = parseInt(tweetInteractRetweet.innerText) + 1;
            t.retweeted = true;
            t.newTweetId = tweetData.id_str;
        } else {
            let tweetData;
            try {
                tweetData = await API.deleteTweet(t.current_user_retweet ? t.current_user_retweet.id_str : t.newTweetId);
            } catch (e) {
                console.error(e);
                return;
            }
            if (!tweetData) {
                return;
            }
            tweetInteractRetweetMenuRetweet.innerText = 'Retweet';
            tweetInteractRetweet.classList.remove('tweet-interact-retweeted');
            tweetInteractRetweet.innerText = parseInt(tweetInteractRetweet.innerText) - 1;
            t.retweeted = false;
            delete t.newTweetId;
        }
    });
    tweetInteractRetweetMenuQuote.addEventListener('click', async () => {
        if (!tweetReply.hidden) {
            tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
            tweetReply.hidden = true;
        }
        tweetQuote.hidden = false;
        setTimeout(() => {
            tweetQuoteText.focus();
        })
    });
    let quoteMedia = [];
    tweetQuote.addEventListener('drop', e => {
        handleDrop(e, quoteMedia, tweetQuoteMedia);
    });
    tweetQuoteUpload.addEventListener('click', () => {
        getMedia(quoteMedia, tweetQuoteMedia);
    });
    tweetQuoteText.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.ctrlKey) {
            tweetQuoteButton.click();
        }
        tweetQuoteChar.innerText = `${tweetQuoteText.value.length}/280`;
        if(tweetQuoteText.value.length > 265) {
            tweetQuoteChar.style.color = "#c26363";
        } else {
            tweetQuoteChar.style.color = "";
        }
    });
    tweetQuoteText.addEventListener('keyup', e => {
        tweetQuoteChar.innerText = `${tweetQuoteText.value.length}/280`;
        if(tweetQuoteText.value.length > 265) {
            tweetQuoteChar.style.color = "#c26363";
        } else {
            tweetQuoteChar.style.color = "";
        }
    });
    tweetQuoteButton.addEventListener('click', async () => {
        let text = tweetQuoteText.value;
        tweetQuoteError.innerHTML = '';
        if (text.length === 0 && quoteMedia.length === 0) return;
        tweetQuoteButton.disabled = true;
        let uploadedMedia = [];
        for (let i in quoteMedia) {
            let media = quoteMedia[i];
            try {
                media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = false;
                let mediaId = await API.uploadMedia({
                    media_type: media.type,
                    media_category: media.category,
                    media: media.data,
                    alt: media.alt,
                    loadCallback: data => {
                        media.div.getElementsByClassName('new-tweet-media-img-progress')[0].innerText = `${data.text} (${data.progress}%)`;
                    }
                });
                uploadedMedia.push(mediaId);
            } catch (e) {
                media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = true;
                console.error(e);
                alert(e);
            }
        }
        let tweetObject = {
            status: text,
            attachment_url: `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`,
            auto_populate_reply_metadata: true,
            batch_mode: 'off',
            exclude_reply_user_ids: '',
            cards_platform: 'Web-13',
            include_entities: 1,
            include_user_entities: 1,
            include_cards: 1,
            send_error_codes: 1,
            tweet_mode: 'extended',
            include_ext_alt_text: true,
            include_reply_count: true
        };
        if (uploadedMedia.length > 0) {
            tweetObject.media_ids = uploadedMedia.join(',');
        }
        let tweetData;
        try {
            tweetData = await API.postTweet(tweetObject)
        } catch (e) {
            tweetQuoteError.innerHTML = (e && e.message ? e.message : e) + "<br>";
            tweetQuoteButton.disabled = false;
            return;
        }
        if (!tweetData) {
            tweetQuoteError.innerHTML = "Error sending tweet<br>";
            tweetQuoteButton.disabled = false;
            return;
        }
        tweetQuoteText.value = '';
        tweetQuote.hidden = true;
        tweetData._ARTIFICIAL = true;
        quoteMedia = [];
        tweetQuoteButton.disabled = false;
        tweetQuoteMedia.innerHTML = '';
        timeline.data.unshift(tweetData);
    });

    // Favorite
    tweetInteractFavorite.addEventListener('click', () => {
        if (t.favorited) {
            API.unfavoriteTweet({
                id: t.id_str
            });
            t.favorited = false;
            t.favorite_count--;
            tweetInteractFavorite.innerText = parseInt(tweetInteractFavorite.innerText) - 1;
            tweetInteractFavorite.classList.remove('tweet-interact-favorited');
        } else {
            API.favoriteTweet({
                id: t.id_str
            });
            t.favorited = true;
            t.favorite_count++;
            tweetInteractFavorite.innerText = parseInt(tweetInteractFavorite.innerText) + 1;
            tweetInteractFavorite.classList.add('tweet-interact-favorited');
        }
    });

    // More
    let moreClicked = false;
    tweetInteractMore.addEventListener('click', () => {
        if (tweetInteractMoreMenu.hidden) {
            tweetInteractMoreMenu.hidden = false;
        }
        if(moreClicked) return;
        moreClicked = true;
        setTimeout(() => {
            document.body.addEventListener('click', () => {
                moreClicked = false;
                setTimeout(() => tweetInteractMoreMenu.hidden = true, 50);
            }, { once: true });
        }, 50);
    });
    tweetInteractMoreMenuCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(`https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
    });
    tweetInteractMoreMenuShare.addEventListener('click', () => {
        navigator.share({ url: `https://twitter.com/${t.user.screen_name}/status/${t.id_str}` });
    });
    tweetInteractMoreMenuEmbed.addEventListener('click', () => {
        openInNewTab(`https://publish.twitter.com/?query=https://twitter.com/${t.user.screen_name}/status/${t.id_str}&widget=Tweet`);
    });
    if (t.user.id_str === user.id_str) {
        tweetInteractMoreMenuAnalytics.addEventListener('click', () => {
            openInNewTab(`https://twitter.com/dimdenEFF/status/${t.id_str}/analytics`);
        });
        tweetInteractMoreMenuDelete.addEventListener('click', async () => {
            let sure = confirm("Are you sure you want to delete this tweet?");
            if (!sure) return;
            try {
                await API.deleteTweet(t.id_str);
            } catch (e) {
                alert(e);
                console.error(e);
                return;
            }
            if(options.after) {
                options.after.getElementsByClassName('tweet-self-thread-div')[0].hidden = true;
                options.after.getElementsByClassName('tweet-interact-reply')[0].innerText = (+options.after.getElementsByClassName('tweet-interact-reply')[0].innerText - 1).toString();
            }
            Array.from(document.getElementById('timeline').getElementsByClassName(`tweet-id-${t.id_str}`)).forEach(tweet => {
                tweet.remove();
            });
        });
    }
    tweetInteractMoreMenuRefresh.addEventListener('click', async () => {
        let tweetData;
        try {
            tweetData = await API.getTweet(t.id_str);
        } catch (e) {
            console.error(e);
            return;
        }
        if (!tweetData) {
            return;
        }
        let tweetIndex = timeline.data.findIndex(tweet => tweet.id_str === t.id_str);
        if (tweetIndex !== -1) {
            timeline.data[tweetIndex] = tweetData;
        }
        if (tweetInteractFavorite.className.includes('tweet-interact-favorited') && !tweetData.favorited) {
            tweetInteractFavorite.classList.remove('tweet-interact-favorited');
        }
        if (tweetInteractRetweet.className.includes('tweet-interact-retweeted') && !tweetData.retweeted) {
            tweetInteractRetweet.classList.remove('tweet-interact-retweeted');
        }
        if (!tweetInteractFavorite.className.includes('tweet-interact-favorited') && tweetData.favorited) {
            tweetInteractFavorite.classList.add('tweet-interact-favorited');
        }
        if (!tweetInteractRetweet.className.includes('tweet-interact-retweeted') && tweetData.retweeted) {
            tweetInteractRetweet.classList.add('tweet-interact-retweeted');
        }
        tweetInteractFavorite.innerText = tweetData.favorite_count;
        tweetInteractRetweet.innerText = tweetData.retweet_count;
        tweetInteractReply.innerText = tweetData.reply_count;
    });
    let downloading = false;
    if (t.extended_entities && t.extended_entities.media.length === 1) {
        tweetInteractMoreMenuDownload.addEventListener('click', () => {
            if (downloading) return;
            downloading = true;
            let media = t.extended_entities.media[0];
            let url = media.type === 'photo' ? media.media_url_https : media.video_info.variants[0].url;
            fetch(url).then(res => res.blob()).then(blob => {
                downloading = false;
                let a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = media.type === 'photo' ? media.media_url_https.split('/').pop() : media.video_info.variants[0].url.split('/').pop();
                a.download = a.download.split('?')[0];
                a.click();
                a.remove();
            }).catch(e => {
                downloading = false;
                console.error(e);
            });
        });
        if (t.extended_entities.media[0].type === 'animated_gif') {
            tweetInteractMoreMenuDownloadGif.addEventListener('click', () => {
                if (downloading) return;
                downloading = true;
                let video = tweet.getElementsByClassName('tweet-media-element')[0];
                let canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                let ctx = canvas.getContext('2d');
                if (video.duration > 10 && !confirm('This video is longer than 10 seconds. Are you sure you want to convert it, might lag')) {
                    return downloading = false;
                }
                let gif = new GIF({
                    workers: 2,
                    quality: 10
                });
                video.currentTime = 0;
                video.loop = false;
                let isFirst = true;
                let interval = setInterval(async () => {
                    if(isFirst) {
                        video.currentTime = 0;
                        isFirst = false;
                        await sleep(5);
                    }
                    if (video.currentTime+0.1 >= video.duration) {
                        clearInterval(interval);
                        gif.on('finished', blob => {
                            let a = document.createElement('a');
                            a.href = URL.createObjectURL(blob);
                            a.download = `${t.id_str}.gif`;
                            document.body.append(a);
                            a.click();
                            a.remove();
                            downloading = false;
                            video.loop = true;
                            video.play();
                        });
                        gif.render();
                        return;
                    }
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    gif.addFrame(imgData, { delay: 100 });
                }, 100);
            });
        }
    }

    if(options.after) {
        options.after.after(tweet);
    } else if (options.prepend) {
        timelineContainer.prepend(tweet);
    } else {
        timelineContainer.append(tweet);
    }
    if(vars.enableTwemoji) twemoji.parse(tweet);
    return tweet;
}

async function renderDiscovery(cache = true) {
    let discover = await API.discoverPeople(cache);
    let discoverContainer = document.getElementById('wtf-list');
    discoverContainer.innerHTML = '';
    try {
        let usersData = discover.globalObjects.users;
        let usersSuggestions = discover.timeline.instructions[0].addEntries.entries[0].content.timelineModule.items.map(s => s.entryId.slice('user-'.length)).slice(0, 7); // why is it so deep
        usersSuggestions.slice(0, 5).forEach(userId => {
            let userData = usersData[userId];
            if (!userData) return;
            let udiv = document.createElement('div');
            udiv.className = 'wtf-user';
            udiv.innerHTML = `
                <a class="tweet-avatar-link" href="https://twitter.com/${userData.screen_name}"><img src="${userData.profile_image_url_https.replace("_normal", "_bigger")}" alt="${escapeHTML(userData.name)}" class="tweet-avatar" width="48" height="48"></a>
                <div class="tweet-header wtf-header">
                    <a class="tweet-header-info wtf-user-link" href="https://twitter.com/${userData.screen_name}">
                        <b class="tweet-header-name wtf-user-name">${escapeHTML(userData.name)}</b>
                        <span class="tweet-header-handle wtf-user-handle">@${userData.screen_name}</span>
                    </a>
                    <br>
                    <button class="nice-button discover-follow-btn ${userData.following ? 'following' : 'follow'}" style="position:relative;bottom: 1px;">${userData.following ? 'Following' : 'Follow'}</button>
                </div>
            `;
            const followBtn = udiv.querySelector('.discover-follow-btn');
            followBtn.addEventListener('click', async () => {
                if (followBtn.className.includes('following')) {
                    await API.unfollowUser(userData.screen_name);
                    followBtn.classList.remove('following');
                    followBtn.classList.add('follow');
                    followBtn.innerText = 'Follow';
                    userData.following = false;
                } else {
                    await API.followUser(userData.screen_name);
                    followBtn.classList.add('following');
                    followBtn.classList.remove('follow');
                    followBtn.innerText = 'Following';
                    userData.following = true;
                }
                chrome.storage.local.set({
                    discoverData: {
                        date: Date.now(),
                        data: discover
                    }
                }, () => { })
            });
            discoverContainer.append(udiv);
            twemoji.parse(udiv);
        });
    } catch (e) {
        console.warn(e);
    }
}
async function renderTrends() {
    let trends = (await API.getTrends()).modules;
    let trendsContainer = document.getElementById('trends-list');
    trendsContainer.innerHTML = '';
    trends.forEach(({ trend }) => {
        let trendDiv = document.createElement('div');
        trendDiv.className = 'trend';
        trendDiv.innerHTML = `
            <a href="https://twitter.com/search?q=${escapeHTML(trend.name)}" class="trend-name">${escapeHTML(trend.name)}</a>
        `;
        trendsContainer.append(trendDiv);
        if(vars.enableTwemoji) twemoji.parse(trendDiv);
    });
}
async function renderSearch(c) {
    updateSavedButton();
    let searchDiv = document.getElementById('search-div');
    let searchMore = document.getElementById('search-more');
    searchMore.hidden = false;
    let search;
    try {
        if(!settings) {
            let [searchData, s] = await Promise.allSettled([
                API.searchV2({
                    q: encodeURIComponent(searchParams.q) + (searchSettings.nearYou ? ' near:me' : ''),
                    tweet_search_mode: searchSettings.type === 'live' ? 'live' : '',
                    social_filter: searchSettings.followedPeople ? 'searcher_follows' : '',
                    result_filter: searchSettings.type === 'user' ? 'user' : searchSettings.type === 'image' ? 'image' : searchSettings.type === 'video' ? 'video' : '',
                }, cursor),
                API.getSettings()
            ]);
            search = searchData.value; settings = s.value;
        } else {
            search = await API.searchV2({
                q: encodeURIComponent(searchParams.q) + (searchSettings.nearYou ? ' near:me' : ''),
                tweet_search_mode: searchSettings.type === 'live' ? 'live' : '',
                social_filter: searchSettings.followedPeople ? 'searcher_follows' : '',
                result_filter: searchSettings.type === 'user' ? 'user' : searchSettings.type === 'image' ? 'image' : searchSettings.type === 'video' ? 'video' : '',
            }, cursor);
        }
        cursor = search.cursor;
        search = search.list;
    } catch(e) {
        console.error(e);
        cursor = undefined;
        searchMore.hidden = true;
        return document.getElementById('loading-box').hidden = true;
    }
    if(!c) {
        searchDiv.innerHTML = '';
    }
    if(search.length === 0) {
        searchDiv.innerHTML = `<div class="no-results">
            <br><br>
            No results found. Try changing something on left?<br><br>
            <button class="nice-button">Try again</button>
        </div>`;
        searchMore.hidden = true;
        cursor = undefined;
        let button = searchDiv.querySelector('button');
        button.addEventListener('click', () => {
            renderSearch();
        });
        return document.getElementById('loading-box').hidden = true;
    }
    for(let i = 0; i < search.length; i++) {
        let t = search[i];
        if(t.type === 'user') {
            let followingElement = document.createElement('div');
            followingElement.classList.add('following-item');
            followingElement.innerHTML = `
            <div style="height:48px">
                <a href="https://twitter.com/${t.screen_name}" class="following-item-link">
                    <img src="${t.profile_image_url_https}" alt="${t.screen_name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                    <div class="following-item-text">
                        <span class="tweet-header-name following-item-name">${escapeHTML(t.name)}</span><br>
                        <span class="tweet-header-handle">@${t.screen_name}</span>
                    </div>
                </a>
            </div>
            <div>
                <button class="following-item-btn nice-button ${t.following ? 'following' : 'follow'}">${t.following ? 'Following' : 'Follow'}</button>
            </div>`;

            let followButton = followingElement.querySelector('.following-item-btn');
            followButton.addEventListener('click', async () => {
                if (followButton.classList.contains('following')) {
                    await API.unfollowUser(t.screen_name);
                    followButton.classList.remove('following');
                    followButton.classList.add('follow');
                    followButton.innerText = 'Follow';
                } else {
                    await API.followUser(t.screen_name);
                    followButton.classList.remove('follow');
                    followButton.classList.add('following');
                    followButton.innerText = 'Following';
                }
            });

            searchDiv.appendChild(followingElement);
        } else {
            if (t.retweeted_status) {
                await appendTweet(t.retweeted_status, searchDiv, {
                    top: {
                        text: `<a href="https://twitter.com/${t.user.screen_name}">${escapeHTML(t.user.name)}</a> retweeted`,
                        icon: "\uf006",
                        color: "#77b255"
                    }
                });
            } else {
                await appendTweet(t, searchDiv);
            }
        }
    }
    document.getElementById('loading-box').hidden = true;
}
async function updateSavedButton() {
    API.getSavedSearches().then(savedSearches => {
        saved = savedSearches.find(s => s.query === searchParams.q);
        if(saved) {
            document.getElementById('save-search').innerText = "Remove from saved";
            document.getElementById('save-search').classList.add('saved');
        } else {
            document.getElementById('save-search').innerText = "Save search";
            document.getElementById('save-search').classList.remove('saved');
        }
        document.getElementById('save-search').addEventListener('click', async () => {
            if(saved) {
                await API.deleteSavedSearch(saved.id_str);
                document.getElementById('save-search').innerText = "Save search";
                document.getElementById('save-search').classList.remove('saved');
                savedSearches = savedSearches.filter(s => s.id_str !== saved.id_str);
                chrome.storage.local.set({savedSearches: {
                    date: Date.now(),
                    data: savedSearches
                }}, () => {});
                saved = undefined;
            } else {
                let saveData = await API.saveSearch(searchParams.q);
                savedSearches.push(saveData);
                chrome.storage.local.set({savedSearches: {
                    date: Date.now(),
                    data: savedSearches
                }}, () => {});
                saved = saveData;
                document.getElementById('save-search').innerText = "Remove from saved";
                document.getElementById('save-search').classList.add('saved');
            }
        });
    }).catch(() => {});
}


setTimeout(() => {
    document.getElementById('wtf-refresh').addEventListener('click', async () => {
        renderDiscovery(false);
    });
    document.getElementById('search-more').addEventListener('click', async () => {
        if(!cursor) return;
        renderSearch(cursor);
    });
    window.addEventListener("popstate", async () => {
        cursor = undefined;
        updateSubpage();
        renderSearch();
    });
    let searchSwitches = Array.from(document.getElementsByClassName('search-switch'));
    searchSwitches.forEach(s => {
        s.addEventListener('click', async () => {
            let id = s.id.split('-')[1];
            if(s.id === "advanced") {
                let modal = createModal(/*html*/`
                    <h1 class="nice-header">Advanced search</h1>
                    <div class="search-advanced-div">
                        <h3 class="nice-subheader">Words</h3><br>
                        <input type="text" id="sai-allthesewords" class="search-advanced-input" placeholder="All these words"><br>
                        <span class="example">Example: whats happening - includes "whats", "happening"</span>
                        <br><br>
                        <input type="text" id="sai-exactphrase" class="search-advanced-input" placeholder="Exact phrase"><br>
                        <span class="example">Example: happy time - includes "happy time"</span>
                        <br><br>
                        <input type="text" id="sai-anywords" class="search-advanced-input" placeholder="Any of these words"><br>
                        <span class="example">Example: cats dogs - includes either "cats" or "dogs"</span>
                        <br><br>
                        <input type="text" id="sai-notthesewords" class="search-advanced-input" placeholder="Not these words"><br>
                        <span class="example">Example: cats dogs - doesnt include "cats" and doesnt include "dogs"</span>
                        <br><br>
                        <h3 class="nice-subheader">Users</h3>
                        <input type="text" id="sai-fromuser" class="search-advanced-input" placeholder="From this user"><br>
                        <span class="example">Example: @dimdenEFF - from user dimdenEFF</span>
                        <br><br>
                        <input type="text" id="sai-mentionsuser" class="search-advanced-input" placeholder="Mentions this user"><br>
                        <span class="example">Example: @dimdenEFF - in reply to dimdenEFF</span>
                        <br><br>
                        <h3 class="nice-subheader">Interactions</h3>
                        <input type="number" id="sai-minreplies" class="search-advanced-input" placeholder="Minimal amount of replies"><br>
                        <span class="example">Example: 280 - tweets that have at least 280 replies</span>
                        <br><br>
                        <input type="number" id="sai-minlikes" class="search-advanced-input" placeholder="Minimal amount of favorites/likes"><br>
                        <span class="example">Example: 280 - tweets that have at least 280 favorites</span>
                        <br><br>
                        <input type="number" id="sai-minretweets" class="search-advanced-input" placeholder="Minimal amount of retweets"><br>
                        <span class="example">Example: 280 - tweets that have at least 280 retweets</span>
                        <br><br>
                        <h3 class="nice-subheader">Dates</h3><br>
                        Since:
                        <input type="date" id="sai-after" class="search-advanced-input"><br>
                        <br>
                        Until:
                        <input type="date" id="sai-before" class="search-advanced-input"><br>
                        <br>
                        <button class="nice-button">Search</button>
                    </div>
                `);
                modal.querySelector('.nice-button').addEventListener('click', async () => {
                    const allTheseWords = modal.querySelector('#sai-allthesewords').value;
                    const exactPhrase = modal.querySelector('#sai-exactphrase').value;
                    const anyWords = modal.querySelector('#sai-anywords').value;
                    const notTheseWords = modal.querySelector('#sai-notthesewords').value;
                    const fromUser = modal.querySelector('#sai-fromuser').value;
                    const mentionsUser = modal.querySelector('#sai-mentionsuser').value;
                    const minReplies = modal.querySelector('#sai-minreplies').value;
                    const minLikes = modal.querySelector('#sai-minlikes').value;
                    const minRetweets = modal.querySelector('#sai-minretweets').value;
                    const after = modal.querySelector('#sai-after').value;
                    const before = modal.querySelector('#sai-before').value;
                    let newQuery = "";
                    if(allTheseWords) newQuery = allTheseWords;
                    if(exactPhrase) newQuery += ` "${exactPhrase}"`;
                    if(anyWords) newQuery += ` (${anyWords.split(" ").join(' OR ')})`;
                    if(notTheseWords) newQuery += ` ${anyWords.split(" ").map(w => `-${w}`).join(' ')}`;
                    if(fromUser) newQuery += ` (from:${fromUser.startsWith('@') ? fromUser.slice(1) : fromUser})`;
                    if(mentionsUser) newQuery += ` (to:${mentionsUser.startsWith('@') ? mentionsUser.slice(1) : mentionsUser})`;
                    if(minReplies) newQuery += ` (min_replies:${minReplies})`;
                    if(minLikes) newQuery += ` (min_faves:${minLikes})`;
                    if(minRetweets) newQuery += ` (min_retweets:${minRetweets})`;
                    if(after) newQuery += ` since:${after}`;
                    if(before) newQuery += ` until:${before}`;
                    if(newQuery) {
                        searchParams.q = newQuery;
                        let params = craftParams();
                        history.pushState({}, null, `search?${params}`);
                        updateSubpage();
                        cursor = undefined;
                        renderSearch();
                        modal.remove();
                    }
                });
                return;
            }
            switch(id) {
                case 'popular': searchSettings.type = 'popular'; break;
                case 'live': searchSettings.type = 'live'; break;
                case 'people': searchSettings.type = 'user'; break;
                case 'photos': searchSettings.type = 'image'; break;
                case 'videos': searchSettings.type = 'video'; break;
                case 'followedpeople': searchSettings.followedPeople = true; break;
                case 'allpeople': searchSettings.followedPeople = false; break;
                case 'everywhere': searchSettings.nearYou = false; break;
                case 'near': searchSettings.nearYou = true; break;
            }
            document.getElementById('loading-box').hidden = false;
            let params = craftParams();
            history.pushState({}, null, `search?${params}`);
            updateSubpage();
            cursor = undefined;
            renderSearch();
        });
    });
    // Update dates every minute
    setInterval(() => {
        let tweetDates = Array.from(document.getElementsByClassName('tweet-time'));
        let tweetQuoteDates = Array.from(document.getElementsByClassName('tweet-time-quote'));
        let all = [...tweetDates, ...tweetQuoteDates];
        all.forEach(date => {
            date.innerText = timeElapsed(+date.dataset.timestamp);
        });
    }, 60000);
    
    // custom events
    document.addEventListener('userRequest', () => {
        if(!user) return;
        let event = new CustomEvent('updateUserData', { detail: user });
        document.dispatchEvent(event);
    });
    document.addEventListener('newSearch', () => {
        document.getElementById('loading-box').hidden = false;
        searchParams.q = document.getElementById('search-input').value;
        let params = craftParams();
        history.pushState({}, null, `search?${params}`);
        updateSubpage();
        cursor = undefined;
        renderSearch();
    });

    // Run
    updateSubpage();
    updateUserData();
    renderDiscovery();
    renderTrends();
    renderSearch();
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 5);
    setInterval(renderTrends, 60000 * 5);
}, 250);