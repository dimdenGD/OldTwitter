let user = {};
let timeline = {
    data: [],
    dataToUpdate: [],
    toBeUpdated: 0
}
let settings = {};
let seenThreads = [];
let seenTweets = [];
let mediaToUpload = [];
let pollToUpload = undefined;
let linkColors = {};
let vars;
let algoCursor;
chrome.storage.local.get(['installed'], async data => {
    if (!data.installed) {
        let dimden = await API.getUserV2('dimdenEFF');
        if(!dimden.following) {
            let modal = createModal(`
                <h2 style="margin:0;margin-bottom:10px;color:var(--darker-gray);font-weight:300">Shameless plug</h2>
                <span style="font-size:14px">
                    Thank you for installing OldTwitter!! I hope you'll like it.<br><br>
                    <a href="https://twitter.com/dimdenEFF">Follow me maybe? 👉👈</a><br><br>
                    <div class="dimden">
                        <img style="float:left" src="${dimden.profile_image_url_https.replace("_normal", "_bigger")}" width="48" height="48" alt="dimden" class="tweet-avatar">
                        <a class="dimden-text" href="https://twitter.com/dimdenEFF" style="vertical-align:top;margin-left:10px;">
                            <b class="tweet-header-name">${dimden.name}</b>
                            <span class="tweet-header-handle">${dimden.screen_name}</span>
                        </a><br>
                        <button class="nice-button follow" style="margin-left:10px;margin-top:5px;">Follow</button>
                    </div>
                </span>
            `);
            let followButton = modal.querySelector('.follow');
            followButton.addEventListener('click', () => {
                API.followUser('dimdenEFF').then(() => {
                    alert("Thank you for following me!!");
                    modal.remove();
                }).catch(e => {
                    console.error(e);
                    location.href = 'https://twitter.com/dimdenEFF';
                });
            });
            twemoji.parse(modal);
        }
        chrome.storage.local.set({installed: true});
    }
});

// Util
function updateUserData() {
    API.verifyCredentials().then(u => {
        user = u;
        const event = new CustomEvent('updateUserData', { detail: u });
        document.dispatchEvent(event);
        renderUserData();
    }).catch(e => {
        if (e === "Not logged in") {
            window.location.href = "https://mobile.twitter.com/login";
        }
        console.error(e);
    });
}
async function updateTimeline() {
    seenThreads = [];
    if (timeline.data.length === 0) document.getElementById('timeline').innerHTML = 'Loading tweets...';
    let fn = !vars.chronologicalTL ? API.getAlgoTimeline : API.getTimeline;
    let [tl, s] = await Promise.allSettled([fn(), API.getSettings()]);
    if(!tl.value) {
        console.error(tl.reason);
        return;
    }
    s = s.value; tl = tl.value;
    settings = s;
    if(!vars.chronologicalTL) {
        algoCursor = tl.cursor;
        tl = tl.list;
        for(let t of tl) {
            seenTweets.push(t.id_str);
        }
    }
    if(!vars.showTopicTweets) {
        tl = tl.filter(t => !t.socialContext || !t.socialContext.description);
    }

    if(vars.linkColorsInTL) {
        let tlUsers = tl.map(t => t.user.screen_name).filter(u => !linkColors[u]);
        let linkData = await fetch(`https://dimden.dev/services/twitter_link_colors/get_multiple/${tlUsers.join(',')}`).then(res => res.json()).catch(console.error);
        if(linkData) for(let i in linkData) {
            linkColors[linkData[i].username] = linkData[i].color;
        }
    }

    tl.forEach(t => {
        let oldTweet = timeline.data.find(tweet => tweet.id_str === t.id_str);
        let tweetElement = document.getElementById(`tweet-${t.id_str}`);
        if (oldTweet) {
            oldTweet.favorite_count = t.favorite_count;
            oldTweet.retweet_count = t.retweet_count;
            oldTweet.reply_count = t.reply_count;
            oldTweet.favorited = t.favorited;
            oldTweet.retweeted = t.retweeted;
        }
        if (tweetElement) {
            tweetElement.querySelector('.tweet-interact-favorite ').innerText = t.favorite_count;
            tweetElement.querySelector('.tweet-interact-retweet').innerText = t.retweet_count;
            tweetElement.querySelector('.tweet-interact-reply').innerText = t.reply_count;
            tweetElement.querySelector('.tweet-interact-favorite').classList.toggle('tweet-interact-favorited', t.favorited);
            tweetElement.querySelector('.tweet-interact-retweet').classList.toggle('tweet-interact-retweeted', t.retweeted);
        }
    });
    let firstTweetId = tl[0].id_str;
    // first update
    if (timeline.data.length === 0) {
        timeline.data = tl;
        renderTimeline();
    }
    // update
    else {
        let data = timeline.data.filter(t => !t._ARTIFICIAL);
        if (data[0].id_str !== firstTweetId) {
            timeline.toBeUpdated = data.findIndex(t => t.id_str === firstTweetId);
            if (timeline.toBeUpdated === -1) {
                timeline.toBeUpdated = data.length;
            }
            timeline.dataToUpdate = tl.slice(0, timeline.toBeUpdated);
            if (timeline.dataToUpdate.length !== data.length) {
                timeline.dataToUpdate = timeline.dataToUpdate.concat(data.slice(timeline.toBeUpdated));
            }
            renderNewTweetsButton();
        } else {
            timeline.toBeUpdated = 0;
            timeline.dataToUpdate = [];
        }
    }
}

// Render
function renderUserData() {
    document.getElementById('user-name').innerText = user.name;
    document.getElementById('user-name').classList.toggle('user-verified', user.verified);
    document.getElementById('user-name').classList.toggle('user-protected', user.protected);

    document.getElementById('user-handle').innerText = `@${user.screen_name}`;
    document.getElementById('user-tweets').innerText = user.statuses_count;
    document.getElementById('user-tweets-div').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('user-following-div').href = `https://twitter.com/${user.screen_name}/following`;
    document.getElementById('user-followers-div').href = `https://twitter.com/${user.screen_name}/followers`;
    document.getElementById('user-following').innerText = user.friends_count;
    document.getElementById('user-followers').innerText = user.followers_count;
    document.getElementById('user-banner').src = user.profile_banner_url ? user.profile_banner_url : 'https://abs.twimg.com/images/themes/theme1/bg.png';
    document.getElementById('user-avatar').src = user.profile_image_url_https.replace("_normal", "_400x400");
    document.getElementById('wtf-viewall').href = `https://mobile.twitter.com/i/connect_people?user_id=${user.id_str}`;
    document.getElementById('user-avatar-link').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('user-info').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('new-tweet-avatar').src = user.profile_image_url_https.replace("_normal", "_bigger");

    if(vars.enableTwemoji) twemoji.parse(document.getElementById('user-name'));
}

async function appendTweet(t, timelineContainer, options = {}) {
    if(seenThreads.includes(t.id_str)) return false;
    const tweet = document.createElement('div');
    tweet.addEventListener('click', e => {
        if(e.target.className.startsWith('tweet tweet-id-') || e.target.className === 'tweet-body' || e.target.className === 'tweet-interact') {
            let tweet = t;
            if(tweet.retweeted_status) tweet = tweet.retweeted_status;
            new TweetViewer(user, settings, tweet);
        }
    });
    tweet.addEventListener('mousedown', e => {
        if(e.button === 1) {
            e.preventDefault();
            if(e.target.className.startsWith('tweet tweet-id-') || e.target.className === 'tweet-body' || e.target.className === 'tweet-interact') {
                openInNewTab(`https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
            }
        }
    });
    tweet.tabIndex = -1;
    tweet.className = `tweet tweet-id-${t.id_str} ${!activeTweet ? 'tweet-active' : ''}`;
    if(!activeTweet) {
        activeTweet = tweet;
    }
    if (options.selfThreadContinuation) tweet.classList.add('tweet-self-thread-continuation');
    if (options.noTop) tweet.classList.add('tweet-no-top');
    if(vars.linkColorsInTL) {
        if(linkColors[t.user.screen_name]) {
            let rgb = hex2rgb(linkColors[t.user.screen_name]);
            let ratio = contrast(rgb, [27, 40, 54]);
            if(ratio < 4 && vars.darkMode && linkColors[t.user.screen_name] !== '000000') {
                linkColors[t.user.screen_name] = colorShade(linkColors[t.user.screen_name], 80).slice(1);
            }
            tweet.style.setProperty('--link-color', '#'+linkColors[t.user.screen_name]);
        } else {
            if(t.user.profile_link_color && t.user.profile_link_color !== '1DA1F2') {
                let rgb = hex2rgb(t.user.profile_link_color);
                let ratio = contrast(rgb, [27, 40, 54]);
                if(ratio < 4 && vars.darkMode && linkColors[t.user.screen_name] !== '000000') {
                    t.user.profile_link_color = colorShade(t.user.profile_link_color, 80).slice(1);
                }
                tweet.style.setProperty('--link-color', '#'+t.user.profile_link_color);
            }
        }
    }
    let textWithoutLinks = t.full_text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').replace(/(?<!\w)@([\w+]{1,15}\b)/g, '');
    let isEnglish = textWithoutLinks.length < 1 ? {languages:[{language:'en', percentage:100}]} : await chrome.i18n.detectLanguage(textWithoutLinks);
    isEnglish = isEnglish.languages[0] && isEnglish.languages[0].percentage > 60 && isEnglish.languages[0].language.startsWith('en');
    tweet.innerHTML = /*html*/`
        <div class="tweet-top" hidden></div>
        <a class="tweet-avatar-link" href="https://twitter.com/${t.user.screen_name}"><img onerror="this.src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png'" src="${t.user.profile_image_url_https.replace("_normal.", "_bigger.")}" alt="${t.user.name}" class="tweet-avatar" width="48" height="48"></a>
        <div class="tweet-header">
            <a class="tweet-header-info" href="https://twitter.com/${t.user.screen_name}">
                <b class="tweet-header-name ${t.user.verified || t.user.id_str === '1123203847776763904' ? 'user-verified' : ''} ${t.user.protected ? 'user-protected' : ''}">${escapeHTML(t.user.name)}</b>
                <span class="tweet-header-handle">@${t.user.screen_name}</span>
            </a>
        </div>
        <a class="tweet-time" data-timestamp="${new Date(t.created_at).getTime()}" title="${new Date(t.created_at).toLocaleString()}" href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}">${timeElapsed(new Date(t.created_at).getTime())}</a>
        <div class="tweet-body">
            <span class="tweet-body-text ${t.full_text && t.full_text.length > 100 ? 'tweet-body-text-long' : 'tweet-body-text-short'}">${t.full_text ? escapeHTML(t.full_text).replace(/\n/g, '<br>').replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`).replace(/(?<!\w)#([\w+]+\b)/g, `<a href="https://twitter.com/hashtag/$1">#$1</a>`) : ''}</span>
            ${!isEnglish ? `
            <br>
            <span class="tweet-translate">View translation</span>
            ` : ``}
            ${t.extended_entities && t.extended_entities.media ? `
            <div class="tweet-media">
                ${t.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escapeHTML(m.ext_alt_text)}" title="${escapeHTML(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop autoplay muted' : ''} ${m.type === 'photo' ? `src="${m.media_url_https}"` : ''} class="tweet-media-element ${mediaClasses[t.extended_entities.media.length]} ${!settings.display_sensitive_media && t.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' || m.type === 'animated_gif' ? `
                    ${m.video_info.variants.map(v => `<source src="${v.url}" type="${v.content_type}">`).join('\n')}
                    Your browser does not support this video.
                </video>` : ''}`).join('\n')}
            </div>
            ` : ``}
            ${t.card ? `<div class="tweet-poll"></div>` : ''}
            ${t.quoted_status ? `
            <a class="tweet-body-quote" target="_blank" href="https://twitter.com/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}">
                <img src="${t.quoted_status.user.profile_image_url_https}" alt="${escapeHTML(t.quoted_status.user.name)}" class="tweet-avatar-quote" width="24" height="24">
                <div class="tweet-header-quote">
                    <span class="tweet-header-info-quote">
                        <b class="tweet-header-name-quote ${t.quoted_status.user.verified || t.quoted_status.user.id_str === '1123203847776763904' ? 'user-verified' : ''} ${t.quoted_status.user.protected ? 'user-protected' : ''}">${escapeHTML(t.quoted_status.user.name)}</b>
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
            ${t.limited_actions === 'limit_trusted_friends_tweet' ? `
            <div class="tweet-limited">
                This tweet is visible only to people who are in @${t.user.screen_name}'s trusted friends circle. <a href="https://help.twitter.com/en/using-twitter/twitter-circle" target="_blank">Learn more.</a>
            </div>
            ` : ''}
            ${options.selfThreadButton && t.self_thread.id_str ? `<br><a class="tweet-self-thread-button" target="_blank" href="https://twitter.com/${t.user.screen_name}/status/${t.self_thread.id_str}">Show this thread</a>` : ``}
            <div class="tweet-interact">
                <span class="tweet-interact-reply" data-val="${t.reply_count}">${t.reply_count}</span>
                <span class="tweet-interact-retweet ${t.retweeted ? 'tweet-interact-retweeted' : ''}" data-val="${t.retweet_count}">${t.retweet_count}</span>
                <div class="tweet-interact-retweet-menu" hidden>
                    <span class="tweet-interact-retweet-menu-retweet">${t.retweeted ? 'Unretweet' : 'Retweet'}</span><br>
                    <span class="tweet-interact-retweet-menu-quote">Quote tweet</span>
                </div>
                <span class="tweet-interact-favorite ${t.favorited ? 'tweet-interact-favorited' : ''}" data-val="${t.favorite_count}">${t.favorite_count}</span>
                <span class="tweet-interact-more"></span>
                <div class="tweet-interact-more-menu" hidden>
                    <span class="tweet-interact-more-menu-copy">Copy link</span><br>
                    <span class="tweet-interact-more-menu-embed">Embed tweet</span><br>
                    <span class="tweet-interact-more-menu-share">Share tweet</span><br>
                    ${t.user.id_str === user.id_str ? `
                    <hr>
                    <span class="tweet-interact-more-menu-analytics">Tweet analytics</span><br>
                    <span class="tweet-interact-more-menu-delete">Delete tweet</span><br>
                    ` : `
                    <hr>
                    <span class="tweet-interact-more-menu-follow">${t.user.following ? 'Unfollow' : 'Follow'} @${t.user.screen_name}</span><br>
                    `}
                    <hr>
                    ${t.feedback ? t.feedback.map((f, i) => `<span class="tweet-interact-more-menu-feedback" data-index="${i}">${f.prompt ? f.prompt : "Not interested in topic"}</span><br>`).join("\n") : ''}
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
        generateCard(t, tweet, user);
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
    const tweetInteractMoreMenuFollow = tweet.getElementsByClassName('tweet-interact-more-menu-follow')[0];
    const tweetInteractMoreMenuFeedbacks = Array.from(tweet.getElementsByClassName('tweet-interact-more-menu-feedback'));

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
        if (t.entities.urls && (t.entities.urls.length === 0 || t.entities.urls[t.entities.urls.length - 1].url !== tweetBodyText.lastChild.href)) {
            tweetBodyText.lastChild.remove();
        }
    }
    let links = Array.from(tweetBodyText.getElementsByTagName('a')).filter(a => a.href.startsWith('https://t.co/'));
    links.forEach(a => {
        let link = t.entities.urls && t.entities.urls.find(u => u.url === a.href);
        if (link) {
            a.innerText = link.display_url;
            a.href = link.expanded_url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        } else {
            if(!vars.chronologicalTL) a.remove();
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
        tweetReplyText.focus();
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
        tweetInteractReply.dataset.val = parseInt(tweetInteractReply.innerText) + 1;
        tweetInteractReply.innerText = parseInt(tweetInteractReply.innerText) + 1;
        tweetData._ARTIFICIAL = true;
        timeline.data.unshift(tweetData);
        tweet.getElementsByClassName('tweet-self-thread-div')[0].hidden = false;
        tweetReplyButton.disabled = false;
        tweetReplyMedia.innerHTML = [];
        replyMedia = [];
        appendTweet(tweetData, document.getElementById('timeline'), {
            noTop: true,
            after: tweet
        });
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
            let c = confirm("Are you sure you want to retweet this tweet?");
            if (!c) return;
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
            t.retweeted = true;
            t.newTweetId = tweetData.id_str;
            tweetInteractRetweet.dataset.val = parseInt(tweetInteractRetweet.innerText) + 1;
            tweetInteractRetweet.innerText = parseInt(tweetInteractRetweet.innerText) + 1;
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
            t.retweeted = false;
            tweetInteractRetweet.dataset.val = parseInt(tweetInteractRetweet.innerText) - 1;
            tweetInteractRetweet.innerText = parseInt(tweetInteractRetweet.innerText) - 1;
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
        appendTweet(tweetData, timelineContainer, { prepend: true });
    });

    // Favorite
    tweetInteractFavorite.addEventListener('click', () => {
        if (t.favorited) {
            API.unfavoriteTweet({
                id: t.id_str
            });
            t.favorited = false;
            t.favorite_count--;
            tweetInteractFavorite.dataset.val = parseInt(tweetInteractFavorite.innerText) - 1;
            tweetInteractFavorite.innerText = parseInt(tweetInteractFavorite.innerText) - 1;
            tweetInteractFavorite.classList.remove('tweet-interact-favorited');
        } else {
            API.favoriteTweet({
                id: t.id_str
            });
            t.favorited = true;
            t.favorite_count++;
            tweetInteractFavorite.dataset.val = parseInt(tweetInteractFavorite.innerText) + 1;
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
    if(tweetInteractMoreMenuFollow) tweetInteractMoreMenuFollow.addEventListener('click', async () => {
        if (t.user.following) {
            await API.unfollowUser(t.user.screen_name);
            t.user.following = false;
            tweetInteractMoreMenuFollow.innerText = `Follow @${t.user.screen_name}`;
        } else {
            await API.followUser(t.user.screen_name);
            t.user.following = true;
            tweetInteractMoreMenuFollow.innerText = `Unfollow @${t.user.screen_name}`;
        }
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
            openInNewTab(`https://mobile.twitter.com/dimdenEFF/status/${t.id_str}/analytics`);
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
    tweetInteractMoreMenuFeedbacks.forEach(feedbackButton => {
        let feedback = t.feedback[feedbackButton.dataset.index];
        if (!feedback) return;
        feedbackButton.addEventListener('click', () => {
            if(feedback.richBehavior && feedback.richBehavior.markNotInterestedTopic) {
                fetch(`https://twitter.com/i/api/graphql/OiKldXdrDrSjh36WO9_3Xw/TopicNotInterested`, {
                    method: 'post',
                    headers: {
                        'content-type': 'application/json',
                        'authorization': OLDTWITTER_CONFIG.public_token,
                        "x-twitter-active-user": 'yes',
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": 'OAuth2Session',
                    },
                    body: JSON.stringify({"variables":{"topicId": feedback.richBehavior.markNotInterestedTopic.topicId,"undo":false},"queryId":"OiKldXdrDrSjh36WO9_3Xw"}),
                    credentials: 'include'
                }).then(i => i.json()).then(() => {});
            }
            fetch(`https://twitter.com/i/api/graphql/vfVbgvTPTQ-dF_PQ5lD1WQ/timelinesFeedback`, {
                method: 'post',
                headers: {
                    'content-type': 'application/json',
                    'authorization': OLDTWITTER_CONFIG.public_token,
                    "x-twitter-active-user": 'yes',
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": 'OAuth2Session',
                },
                body: JSON.stringify({"variables":{"encoded_feedback_request": feedback.encodedFeedbackRequest,"undo":false},"queryId":"vfVbgvTPTQ-dF_PQ5lD1WQ"}),
                credentials: 'include'
            }).then(i => i.json()).then(i => {
                alert(feedback.confirmation ? feedback.confirmation : 'Thanks for your feedback!');
                tweet.remove();
            });
        });
    });

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

async function renderTimeline(append = false, sliceAmount = 0) {
    let timelineContainer = document.getElementById('timeline');
    if(!append) timelineContainer.innerHTML = '';
    let data = timeline.data.slice(sliceAmount, timeline.data.length);
    for(let i in data) {
        let t = data[i];
        if (t.retweeted_status) {
            await appendTweet(t.retweeted_status, timelineContainer, {
                top: {
                    text: `<a href="https://twitter.com/${t.user.screen_name}">${escapeHTML(t.user.name)}</a> retweeted`,
                    icon: "\uf006",
                    color: "#77b255"
                }
            });
        } else {
            if (t.self_thread) {
                let selfThreadTweet = timeline.data.find(tweet => tweet.id_str === t.self_thread.id_str);
                if (selfThreadTweet && selfThreadTweet.id_str !== t.id_str && seenThreads.indexOf(selfThreadTweet.id_str) === -1) {
                    await appendTweet(selfThreadTweet, timelineContainer, {
                        selfThreadContinuation: true
                    });
                    await appendTweet(t, timelineContainer, {
                        noTop: true
                    });
                    seenThreads.push(selfThreadTweet.id_str);
                } else {
                    await appendTweet(t, timelineContainer, {
                        selfThreadButton: true
                    });
                }
            } else {
                let obj = {};
                if(t.socialContext) {
                    obj.top = {};
                    if(t.socialContext.description) {
                        obj.top.text = `<a target="_blank" href="https://mobile.twitter.com/i/topics/${t.socialContext.id}">${t.socialContext.name}</a>`;
                        obj.top.icon = "\uf008";
                        obj.top.color = "#3300FF";
                    } else if(t.socialContext.contextType === "Like") {
                        obj.top.text = `<a href="https://twitter.com/i/user/${t.socialContext.landingUrl.url.split('=')[1]}">${t.socialContext.text}</a>`;
                        if(vars.heartsNotStars) {
                            obj.top.icon = "\uf015";
                            obj.top.color = "rgb(249, 24, 128)";
                        } else {
                            obj.top.icon = "\uf001";
                            obj.top.color = "#ffac33";
                        }
                    } else if(t.socialContext.contextType === "Follow") {
                        obj.top.text = t.socialContext.text;
                        obj.top.icon = "\uf002";
                        obj.top.color = "#3300FF";
                    } else {
                        console.log(t.socialContext);
                    }
                }
                await appendTweet(t, timelineContainer, obj);
            }
        }
    };
    document.getElementById('loading-box').hidden = true;
    return true;
}
function renderNewTweetsButton() {
    if (timeline.toBeUpdated > 0) {
        document.getElementById('new-tweets').hidden = false;
        document.getElementById('new-tweets').innerText = `See new tweets`;
    } else {
        document.getElementById('new-tweets').hidden = true;
    }
}
async function renderDiscovery(cache = true) {
    let discover = await API.discoverPeople(cache);
    let discoverContainer = document.getElementById('wtf-list');
    discoverContainer.innerHTML = '';
    try {
        let usersData = discover.globalObjects.users;
        let usersSuggestions = discover.timeline.instructions[0].addEntries.entries[0].content.timelineModule.items.map(s => s.entryId.slice('user-'.length)).slice(0, 7); // why is it so deep
        usersSuggestions.forEach(userId => {
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
            if(vars.enableTwemoji) twemoji.parse(udiv);
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
            <b><a href="https://twitter.com/search?q=${escapeHTML(trend.name)}" class="trend-name">${escapeHTML(trend.name)}</a></b><br>
            <span class="trend-description">${trend.meta_description ? escapeHTML(trend.meta_description) : ''}</span>
        `;
        trendsContainer.append(trendDiv);
        if(vars.enableTwemoji) twemoji.parse(trendDiv);
    });
}

// On scroll to end of timeline, load more tweets
let loadingNewTweets = false;
let lastTweetDate = 0;
let activeTweet;
let tweetsToLoad = {};
let lastScroll = Date.now();
document.addEventListener('scroll', async () => {
    lastScroll = Date.now();
    // find active tweet by scroll amount
    if(Date.now() - lastTweetDate > 50) {
        lastTweetDate = Date.now();
        let tweets = Array.from(document.getElementsByClassName('tweet'));

        if(activeTweet) {
            activeTweet.classList.remove('tweet-active');
        }
        let scrollPoint = scrollY + innerHeight/2;
        activeTweet = tweets.find(t => scrollPoint > t.offsetTop && scrollPoint < t.offsetTop + t.offsetHeight);
        if(activeTweet) {
            activeTweet.classList.add('tweet-active');
        }
    }

    // loading new tweets
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
        if (loadingNewTweets || timeline.data.length === 0) return;
        loadingNewTweets = true;
        let tl;
        try {
            tl = !vars.chronologicalTL ? await API.getAlgoTimeline(algoCursor, 50) : await API.getTimeline(timeline.data[timeline.data.length - 1].id_str);
            if(!vars.chronologicalTL) {
                algoCursor = tl.cursor;
                tl = tl.list.filter(t => !seenTweets.includes(t.id_str));
                for(let t of tl) {
                    seenTweets.push(t.id_str);
                }
            } else {
                tl = tl.slice(1);
            }
        } catch (e) {
            console.error(e);
            loadingNewTweets = false;
            return;
        }
        let originalLength = timeline.data.length;
        timeline.data = timeline.data.concat(tl);
        try {
            await renderTimeline(true, originalLength);
        } catch(e) {
            loadingNewTweets = false;
        }
        setTimeout(() => {
            setTimeout(() => {
                loadingNewTweets = false;
            });
        }, 250);
    }
}, { passive: true });
document.addEventListener('mousemove', e => {
    if(Date.now() - lastScroll > 10) {
        let t = e.target;
        if(t.className.includes('tweet ') || t.className === 'tweet-interact' || t.className === 'tweet-body' || t.className === 'tweet-media') {
            if(t.className.includes('tweet-view')) return;
            if(t.className === 'tweet-interact' || t.className === 'tweet-media') t = t.parentElement.parentElement;
            else if(t.className === 'tweet-body') t = t.parentElement;
            let id;
            try { id = t.className.split('id-')[1].split(' ')[0] } catch(e) { return };
            if(!tweetsToLoad[id]) tweetsToLoad[id] = 1;
            else tweetsToLoad[id]++;
            if(tweetsToLoad[id] === 15) {
                API.getReplies(id);
                API.getTweetLikers(id);
                t.classList.add('tweet-preload');
                console.log(`Preloading ${id}`);
            }
        }
    }
});

document.addEventListener('clearActiveTweet', () => {
    if(activeTweet) {
        activeTweet.classList.remove('tweet-active');
    }
    activeTweet = undefined;
});
document.addEventListener('findActiveTweet', () => {
    let tweets = Array.from(document.getElementsByClassName('tweet'));
    if(activeTweet) {
        activeTweet.classList.remove('tweet-active');
    }
    let scrollPoint = scrollY + innerHeight/2;
    activeTweet = tweets.find(t => scrollPoint > t.offsetTop && scrollPoint < t.offsetTop + t.offsetHeight);
    if(activeTweet) {
        activeTweet.classList.add('tweet-active');
    }
});

setTimeout(async () => {
    vars = await new Promise(resolve => {
        chrome.storage.sync.get(['linkColor', 'font', 'heartsNotStars', 'linkColorsInTL', 'enableTwemoji', 'chronologicalTL', 'showTopicTweets', 'darkMode', 'disableHotkeys'], data => {
            resolve(data);
        });
    });
    // tweet hotkeys
    if(!vars.disableHotkeys) {
        let tle = document.getElementById('timeline');
        document.addEventListener('keydown', async e => {
            if(e.ctrlKey) return;
            // reply box
            if(e.target.className === 'tweet-reply-text') {
                if(e.altKey) {
                    if(e.keyCode === 82) { // ALT+R
                        // hide reply box
                        e.target.blur();
                        activeTweet.getElementsByClassName('tweet-interact-reply')[0].click();
                    } else if(e.keyCode === 77) { // ALT+M
                        // upload media
                        let tweetReplyUpload = activeTweet.getElementsByClassName('tweet-reply-upload')[0];
                        tweetReplyUpload.click();
                    } else if(e.keyCode === 70) { // ALT+F
                        // remove first media
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        let tweetReplyMediaElement = activeTweet.getElementsByClassName('tweet-reply-media')[0].children[0];
                        if(!tweetReplyMediaElement) return;
                        let removeBtn = tweetReplyMediaElement.getElementsByClassName('new-tweet-media-img-remove')[0];
                        removeBtn.click();
                    }
                }
            }
            if(e.target.className === 'tweet-quote-text') {
                if(e.altKey) {
                    if(e.keyCode === 81) { // ALT+Q
                        // hide quote box
                        e.target.blur();
                        activeTweet.getElementsByClassName('tweet-interact-retweet')[0].click();
                    } else if(e.keyCode === 77) { // ALT+M
                        // upload media
                        let tweetQuoteUpload = activeTweet.getElementsByClassName('tweet-quote-upload')[0];
                        tweetQuoteUpload.click();
                    } else if(e.keyCode === 70) { // ALT+F
                        // remove first media
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        let tweetQuoteMediaElement = activeTweet.getElementsByClassName('tweet-quote-media')[0].children[0];
                        if(!tweetQuoteMediaElement) return;
                        let removeBtn = tweetQuoteMediaElement.getElementsByClassName('new-tweet-media-img-remove')[0];
                        removeBtn.click();
                    }
                }
            }
            if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if(e.keyCode === 83) { // S
                // next tweet
                let index = [...tle.children].indexOf(activeTweet);
                if(index === -1) return;
                let nextTweet = tle.children[index + 1];
                if(!nextTweet) return;
                nextTweet.focus();
                nextTweet.scrollIntoView({ block: 'center' });
            } else if(e.keyCode === 87) { // W
                // previous tweet
                let index = [...tle.children].indexOf(activeTweet);
                if(index === -1) return;
                let nextTweet = tle.children[index - 1];
                if(!nextTweet) return;
                nextTweet.focus();
                nextTweet.scrollIntoView({ block: 'center' });
            } else if(e.keyCode === 76) { // L
                // like tweet
                if(!activeTweet) return;
                let tweetFavoriteButton = activeTweet.querySelector('.tweet-interact-favorite');
                tweetFavoriteButton.click();
            } else if(e.keyCode === 84) { // T
                // retweet
                if(!activeTweet) return;
                let tweetRetweetButton = activeTweet.querySelector('.tweet-interact-retweet-menu-retweet');
                tweetRetweetButton.click();
            } else if(e.keyCode === 82) { // R
                // open reply box
                if(!activeTweet) return;
                e.preventDefault();
                e.stopImmediatePropagation();
                let tweetReply = activeTweet.getElementsByClassName('tweet-reply')[0];
                let tweetQuote = activeTweet.getElementsByClassName('tweet-quote')[0];
                let tweetReplyText = activeTweet.getElementsByClassName('tweet-reply-text')[0];
                
                tweetReply.hidden = false;
                tweetQuote.hidden = true;
                tweetReplyText.focus();
            } else if(e.keyCode === 81) { // Q
                // open quote box
                if(!activeTweet) return;
                e.preventDefault();
                e.stopImmediatePropagation();
                let tweetReply = activeTweet.getElementsByClassName('tweet-reply')[0];
                let tweetQuote = activeTweet.getElementsByClassName('tweet-quote')[0];
                let tweetQuoteText = activeTweet.getElementsByClassName('tweet-quote-text')[0];
                
                tweetReply.hidden = true;
                tweetQuote.hidden = false;
                tweetQuoteText.focus();
            } else if(e.keyCode === 32) { // Space
                // toggle tweet media
                if(!activeTweet) return;
                e.preventDefault();
                e.stopImmediatePropagation();
                let tweetMedia = activeTweet.getElementsByClassName('tweet-media')[0].children[0];
                if(!tweetMedia) return;
                if(tweetMedia.tagName === "VIDEO") {
                    tweetMedia.paused ? tweetMedia.play() : tweetMedia.pause();
                } else {
                    tweetMedia.click();
                    tweetMedia.click();
                }
            } else if(e.keyCode === 13) { // Enter
                // open tweet
                if(e.target.className.includes('tweet tweet-id-')) {
                    if(!activeTweet) return;
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    activeTweet.click();
                } else if(e.target.className === "tweet-interact-more") {
                    e.target.click();
                    activeTweet.getElementsByClassName('tweet-interact-more-menu-copy')[0].focus();
                }
            } else if(e.keyCode === 67 && !e.ctrlKey && !e.altKey) { // C
                // copy image
                if(e.target.className.includes('tweet tweet-id-')) {
                    if(!activeTweet) return;
                    let media = activeTweet.getElementsByClassName('tweet-media')[0];
                    if(!media) return;
                    media = media.children[0];
                    if(!media) return;
                    if(media.tagName === "IMG") {
                        let img = media;
                        let canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        let ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, img.width, img.height);
                        canvas.toBlob((blob) => {
                            navigator.clipboard.write([
                                new ClipboardItem({ "image/png": blob })
                            ]);
                        }, "image/png");
                    }
                }
            } else if(e.keyCode === 68 && !e.ctrlKey && !e.altKey) { // D
                // download media
                if(e.target.className.includes('tweet tweet-id-')) {
                    activeTweet.getElementsByClassName('tweet-interact-more-menu-download')[0].click();
                }
            }
        });
    }
    // Buttons
    document.getElementById('new-tweets').addEventListener('click', () => {
        timeline.toBeUpdated = 0;
        timeline.data = timeline.dataToUpdate;
        timeline.dataToUpdate = [];
        renderNewTweetsButton();
        renderTimeline();
    });
    document.getElementById('wtf-refresh').addEventListener('click', async () => {
        renderDiscovery(false);
    });
    document.getElementById('new-tweet').addEventListener('click', async () => {
        document.getElementById('new-tweet-focused').hidden = false;
        document.getElementById('new-tweet-char').hidden = false;
        document.getElementById('new-tweet-text').classList.add('new-tweet-text-focused');
        document.getElementById('new-tweet-media-div').classList.add('new-tweet-media-div-focused');
    });
    document.getElementById('new-tweet').addEventListener('drop', e => {
        document.getElementById('new-tweet').click();
        document.getElementById('new-tweet-poll').innerHTML = '';
        document.getElementById('new-tweet-poll').hidden = true;
        document.getElementById('new-tweet-poll').style.width = '0';
        pollToUpload = undefined;
        handleDrop(e, mediaToUpload, document.getElementById('new-tweet-media-c'));
    });
    document.getElementById('new-tweet-poll-btn').addEventListener('click', () => {
        if(document.getElementById('new-tweet-poll').hidden) {
            mediaToUpload = [];
            document.getElementById('new-tweet-media-c').innerHTML = '';
            document.getElementById('new-tweet-poll').hidden = false;
            document.getElementById('new-tweet-poll').innerHTML = `
                <input class="poll-question" data-variant="1" placeholder="Variant 1"><br>
                <input class="poll-question" data-variant="2" placeholder="Variant 2"><br>
                <input class="poll-question" data-variant="3" placeholder="Variant 3 (optional)"><br>
                <input class="poll-question" data-variant="4" placeholder="Variant 4 (optional)"><br>
                <hr>
                Days: <input class="poll-date" id="poll-days" type="number" min="0" max="7" value="1"><br>
                Hours: <input class="poll-date" id="poll-hours" type="number" min="0" max="23" value="0"><br>
                Minutes: <input class="poll-date" id="poll-minutes" type="number" min="0" max="59" value="0"><br>
                <hr>
                <button class="nice-button" id="poll-remove">Remove poll</button>
            `;
            document.getElementById('new-tweet-poll').style.width = '400px';
            let pollVariants = Array.from(document.getElementsByClassName('poll-question'));
            pollToUpload = {
                duration_minutes: 1440,
                variants: ['', '', '', '']
            }
            let pollDates = Array.from(document.getElementsByClassName('poll-date'));
            pollDates.forEach(pollDate => {
                pollDate.addEventListener('change', () => {
                    let days = parseInt(document.getElementById('poll-days').value);
                    let hours = parseInt(document.getElementById('poll-hours').value);
                    let minutes = parseInt(document.getElementById('poll-minutes').value);
                    if(days === 0 && hours === 0 && minutes === 0) {
                        days = 1;
                        document.getElementById('poll-days').value = 1;
                    }
                    pollToUpload.duration_minutes = days * 1440 + hours * 60 + minutes;
                }, { passive: true });
            });
            pollVariants.forEach(pollVariant => {
                pollVariant.addEventListener('change', () => {
                    pollToUpload.variants[(+pollVariant.dataset.variant) - 1] = pollVariant.value;
                }, { passive: true });
            });
            document.getElementById('poll-remove').addEventListener('click', () => {
                document.getElementById('new-tweet-poll').hidden = true;
                document.getElementById('new-tweet-poll').innerHTML = '';
                document.getElementById('new-tweet-poll').style.width = '0';
                pollToUpload = undefined;
            });
        } else {
            document.getElementById('new-tweet-poll').innerHTML = '';
            document.getElementById('new-tweet-poll').hidden = true;
            document.getElementById('new-tweet-poll').style.width = '0';
            pollToUpload = undefined;
        }
    });
    document.getElementById('new-tweet-media-div').addEventListener('click', () => {
        document.getElementById('new-tweet-poll').innerHTML = '';
        document.getElementById('new-tweet-poll').hidden = true;
        document.getElementById('new-tweet-poll').style.width = '0';
        pollToUpload = undefined;
        getMedia(mediaToUpload, document.getElementById('new-tweet-media-c'));
    });
    let newTweetUserSearch = document.getElementById("new-tweet-user-search");
    let newTweetText = document.getElementById('new-tweet-text');
    let selectedIndex = 0;
    newTweetText.addEventListener('focus', async e => {
        setTimeout(() => {
            if(/(?<!\w)@([\w+]{1,15}\b)$/.test(e.target.value)) {
                newTweetUserSearch.hidden = false;
            } else {
                newTweetUserSearch.hidden = true;
                newTweetUserSearch.innerHTML = '';
            }
        }, 10);
    });
    newTweetText.addEventListener('blur', async e => {
        setTimeout(() => {
            newTweetUserSearch.hidden = true;
        }, 100);
    });
    newTweetText.addEventListener('keypress', async e => {
        if ((e.key === 'Enter' || e.key === 'Tab') && !newTweetUserSearch.hidden) {
            let activeSearch = newTweetUserSearch.querySelector('.search-result-item-active');
            if(!e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();
                newTweetText.value = newTweetText.value.split("@").slice(0, -1).join('@').split(" ").slice(0, -1).join(" ") + ` @${activeSearch.querySelector('.search-result-item-screen-name').innerText.slice(1)} `;
                if(newTweetText.value.startsWith(" ")) newTweetText.value = newTweetText.value.slice(1);
                if(newTweetText.value.length > 280) newTweetText.value = newTweetText.value.slice(0, 280);
                newTweetUserSearch.innerHTML = '';
                newTweetUserSearch.hidden = true;
            }
        }
    });
    newTweetText.addEventListener('keydown', async e => {
        if(e.key === 'ArrowDown') {
            if(selectedIndex < newTweetUserSearch.children.length - 1) {
                selectedIndex++;
                newTweetUserSearch.children[selectedIndex].classList.add('search-result-item-active');
                newTweetUserSearch.children[selectedIndex - 1].classList.remove('search-result-item-active');
            } else {
                selectedIndex = 0;
                newTweetUserSearch.children[selectedIndex].classList.add('search-result-item-active');
                newTweetUserSearch.children[newTweetUserSearch.children.length - 1].classList.remove('search-result-item-active');
            }
            return;
        }
        if(e.key === 'ArrowUp') {
            if(selectedIndex > 0) {
                selectedIndex--;
                newTweetUserSearch.children[selectedIndex].classList.add('search-result-item-active');
                newTweetUserSearch.children[selectedIndex + 1].classList.remove('search-result-item-active');
            } else {
                selectedIndex = newTweetUserSearch.children.length - 1;
                newTweetUserSearch.children[selectedIndex].classList.add('search-result-item-active');
                newTweetUserSearch.children[0].classList.remove('search-result-item-active');
            }
            return;
        }
        if(/(?<!\w)@([\w+]{1,15}\b)$/.test(e.target.value)) {
            newTweetUserSearch.hidden = false;
            selectedIndex = 0;
            let users = (await API.search(e.target.value.match(/@([\w+]{1,15}\b)$/)[1])).users;
            newTweetUserSearch.innerHTML = '';
            users.forEach((user, index) => {
                let userElement = document.createElement('span');
                userElement.className = 'search-result-item';
                if(index === 0) userElement.classList.add('search-result-item-active');
                userElement.innerHTML = `
                    <img width="16" height="16" class="search-result-item-avatar" src="${user.profile_image_url_https}">
                    <span class="search-result-item-name ${user.verified ? 'search-result-item-verified' : ''}">${user.name}</span>
                    <span class="search-result-item-screen-name">@${user.screen_name}</span>
                `;
                userElement.addEventListener('click', () => {
                    newTweetText.value = newTweetText.value.split("@").slice(0, -1).join('@').split(" ").slice(0, -1).join(" ") + ` @${user.screen_name} `;
                    if(newTweetText.value.startsWith(" ")) newTweetText.value = newTweetText.value.slice(1);
                    if(newTweetText.value.length > 280) newTweetText.value = newTweetText.value.slice(0, 280);
                    newTweetText.focus();
                    newTweetUserSearch.innerHTML = '';
                    newTweetUserSearch.hidden = true;
                });
                newTweetUserSearch.appendChild(userElement);
            });
        } else {
            newTweetUserSearch.innerHTML = '';
            newTweetUserSearch.hidden = true;
        }
        if (e.key === 'Enter') {
            if(e.ctrlKey) document.getElementById('new-tweet-button').click();
        }
        let charElement = document.getElementById('new-tweet-char');
        charElement.innerText = `${e.target.value.length}/280`;
        if (e.target.value.length > 265) {
            charElement.style.color = "#c26363";
        } else {
            charElement.style.color = "";
        }
    });
    document.getElementById('new-tweet-text').addEventListener('keyup', e => {
        let charElement = document.getElementById('new-tweet-char');
        charElement.innerText = `${e.target.value.length}/280`;
        charElement.innerText = `${e.target.value.length}/280`;
        if (e.target.value.length > 265) {
            charElement.style.color = "#c26363";
        } else {
            charElement.style.color = "";
        }
    });
    document.getElementById('new-tweet-button').addEventListener('click', async () => {
        let tweet = document.getElementById('new-tweet-text').value;
        if (tweet.length === 0 && mediaToUpload.length === 0) return;
        document.getElementById('new-tweet-button').disabled = true;
        if(!pollToUpload) {
            let uploadedMedia = [];
            for (let i in mediaToUpload) {
                let media = mediaToUpload[i];
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
                status: tweet,
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
            try {
                let tweet = await API.postTweet(tweetObject);
                appendTweet(tweet, document.getElementById('timeline'), {
                    prepend: true
                });
            } catch (e) {
                document.getElementById('new-tweet-button').disabled = false;
                console.error(e);
            }
        } else {
            let pollVariants = pollToUpload.variants.filter(i => i);
            if(pollVariants.length < 2) {
                document.getElementById('new-tweet-button').disabled = false;
                return alert('You must have at least 2 poll variants');
            }
            let cardObject = {
                "twitter:card": `poll${pollVariants.length}choice_text_only`,
                "twitter:api:api:endpoint": "1",
                "twitter:long:duration_minutes": pollToUpload.duration_minutes,
                "twitter:string:choice1_label": pollVariants[0],
                "twitter:string:choice2_label": pollVariants[1]
            }
            if(pollVariants[2]) {
                cardObject["twitter:string:choice3_label"] = pollVariants[2];
            }
            if(pollVariants[3]) {
                cardObject["twitter:string:choice4_label"] = pollVariants[3];
            }
            try {
                let card = await API.createCard(cardObject);
                let tweetObject = await API.postTweetV2({
                    "variables": {
                        "tweet_text": tweet,
                        "card_uri": card.card_uri,
                        "media": {
                            "media_entities": [],
                            "possibly_sensitive": false
                        },
                        "withDownvotePerspective": false,
                        "withReactionsMetadata": false,
                        "withReactionsPerspective": false,
                        "withSuperFollowsTweetFields": true,
                        "withSuperFollowsUserFields": true,
                        "semantic_annotation_ids": [],
                        "dark_request": false
                    },
                    "features": {
                        "dont_mention_me_view_api_enabled": true,
                        "interactive_text_enabled": true,
                        "responsive_web_uc_gql_enabled": false,
                        "vibe_api_enabled": false,
                        "responsive_web_edit_tweet_api_enabled": false,
                        "standardized_nudges_misinfo": true,
                        "responsive_web_enhance_cards_enabled": false
                    },
                    "queryId": "Mvpg1U7PrmuHeYdY_83kLw"
                });
                tweetObject._ARTIFICIAL = true;
                appendTweet(tweetObject, document.getElementById('timeline'), {
                    prepend: true
                });
            } catch (e) {
                console.error(e);
                alert(e);
            }
        }
        document.getElementById('new-tweet-text').value = "";
        document.getElementById('new-tweet-media-c').innerHTML = "";
        mediaToUpload = [];
        pollToUpload = undefined;
        document.getElementById('new-tweet-poll').innerHTML = '';
        document.getElementById('new-tweet-poll').style.width = '0';
        document.getElementById('new-tweet-poll').hidden = true;
        document.getElementById('new-tweet-focused').hidden = true;
        document.getElementById('new-tweet-char').hidden = true;
        document.getElementById('new-tweet-text').classList.remove('new-tweet-text-focused');
        document.getElementById('new-tweet-media-div').classList.remove('new-tweet-media-div-focused');
        document.getElementById('new-tweet-button').disabled = false;
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
    document.addEventListener('newTweet', e => {
        let tweet = e.detail;
        appendTweet(tweet, document.getElementById('timeline'), { prepend: true });
    });
    document.addEventListener('userRequest', e => {
        if(!user) return;
        let event = new CustomEvent('updateUserData', { detail: user });
        document.dispatchEvent(event);
    });

    // Run
    updateUserData();
    updateTimeline();
    renderDiscovery();
    renderTrends();
    setInterval(updateUserData, 60000 * 3);
    if(vars.chronologicalTL) setInterval(updateTimeline, 60000);
    setInterval(() => renderDiscovery(false), 60000 * 5);
    setInterval(renderTrends, 60000 * 5);
}, 250);