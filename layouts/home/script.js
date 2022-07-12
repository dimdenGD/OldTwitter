let user = {};
let timeline = {
    data: [],
    dataToUpdate: [],
    toBeUpdated: 0
}
let settings = {};
let seenThreads = [];

// Util
function updateUserData() {
    API.verifyCredentials().then(u => {
        console.log(u);
        user = u;
        renderUserData();
    }).catch(e => {
        if (e === "Not logged in") {
            window.location.href = "https://twitter.com/login";
        }
        console.error(e);
    });
}
async function updateTimeline() {
    seenThreads = [];
    let tl = await API.getTimeline();
    console.log(tl);
    tl.forEach(t => {
        let oldTweet = timeline.data.find(tweet => tweet.id_str === t.id_str);
        let tweetElement = document.getElementById(`tweet-${t.id_str}`);
        if(oldTweet) {
            oldTweet.favorite_count = t.favorite_count;
            oldTweet.retweet_count = t.retweet_count;
            oldTweet.reply_count = t.reply_count;
            oldTweet.favorited = t.favorited;
            oldTweet.retweeted = t.retweeted;
        }
        if(tweetElement) {
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
function timeElapsed(targetTimestamp) {
    let currentDate = new Date();
    let currentTimeInms = currentDate.getTime();
    let targetDate = new Date(targetTimestamp);
    let targetTimeInms = targetDate.getTime();
    let elapsed = Math.floor((currentTimeInms - targetTimeInms) / 1000);
    const MonthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    if (elapsed < 1) {
        return '0s';
    }
    if (elapsed < 60) { //< 60 sec
        return `${elapsed}s`;
    }
    if (elapsed < 3600) { //< 60 minutes
        return `${Math.floor(elapsed / (60))}m`;
    }
    if (elapsed < 86400) { //< 24 hours
        return `${Math.floor(elapsed / (3600))}h`;
    }
    if (elapsed < 604800) { //<7 days
        return `${Math.floor(elapsed / (86400))}d`;
    }
    if (elapsed < 2628000) { //<1 month
        return `${targetDate.getDate()} ${MonthNames[targetDate.getMonth()]}`;
    }
    return `${targetDate.getDate()} ${MonthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`; //more than a monh
}
function openInNewTab(href) {
    Object.assign(document.createElement('a'), {
      target: '_blank',
      rel: 'noopener noreferrer',
      href: href,
    }).click();
}
function escape(text) {
    if(typeof text !== "string") return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Render
function renderUserData() {
    document.getElementById('user-name').innerText = user.name;
    document.getElementById('user-name').classList.toggle('user-verified', user.verified);
    document.getElementById('user-name').classList.toggle('user-protected', user.protected);

    document.getElementById('user-handle').innerText = `@${user.screen_name}`;
    document.getElementById('user-tweets').innerText = user.statuses_count;
    document.getElementById('user-following').innerText = user.friends_count;
    document.getElementById('user-followers').innerText = user.followers_count;
    document.getElementById('user-banner').src = user.profile_banner_url;
    document.getElementById('user-avatar').src = user.profile_image_url_https.replace("_normal", "_400x400");
    document.getElementById('wtf-viewall').href = `https://twitter.com/i/connect_people?user_id=${user.id_str}`;
    document.getElementById('user-avatar-link').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('user-info').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('new-tweet-avatar').src = user.profile_image_url_https.replace("_normal", "_bigger");

    twemoji.parse(document.getElementById('user-name'));
}

function appendTweet(t, timelineContainer, options = {}) {
    const tweet = document.createElement('div');
    tweet.classList.add('tweet');
    tweet.id = `tweet-${t.id_str}`;
    if(options.selfThreadContinuation) tweet.classList.add('tweet-self-thread-continuation');
    if(options.noTop) tweet.classList.add('tweet-no-top');
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
    ]
    tweet.innerHTML = `
        <div class="tweet-top" hidden></div>
        <a class="tweet-avatar-link" href="https://twitter.com/${t.user.screen_name}"><img src="${t.user.profile_image_url_https.replace("_normal", "_bigger")}" alt="${t.user.name}" class="tweet-avatar" width="48" height="48"></a>
        <div class="tweet-header">
            <a class="tweet-header-info" href="https://twitter.com/${t.user.screen_name}">
                <strong class="tweet-header-name ${t.user.verified || t.user.id_str === '1123203847776763904' ? 'user-verified' : ''} ${t.user.protected ? 'user-protected' : ''}">${escape(t.user.name)}</strong>
                <span class="tweet-header-handle">@${t.user.screen_name}</span>
            </a>
        </div>
        <a class="tweet-time" data-timestamp="${new Date(t.created_at).getTime()}" title="${new Date(t.created_at).toLocaleString()}" href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}">${timeElapsed(new Date(t.created_at).getTime())}</a>
        <div class="tweet-body">
            <span class="tweet-body-text ${t.full_text && t.full_text.length > 100 ? 'tweet-body-text-long' : 'tweet-body-text-short'}">${t.full_text ? escape(t.full_text).replace(/\n/g, '<br>').replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1" target="_blank">@$1</a>`).replace(/(?<!\w)#([\w+]{1,15}\b)/g, `<a href="https://twitter.com/hashtag/$1">#$1</a>`) : ''}</span>
            ${t.extended_entities && t.extended_entities.media ? `
            <div class="tweet-media">
                ${t.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} width="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" controls src="${m.type === 'photo' ? m.media_url_https : m.video_info.variants.find(v => v.content_type === 'video/mp4').url}" class="tweet-media-element ${mediaClasses[t.extended_entities.media.length]} ${!settings.display_sensitive_media && t.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' ? '</video>' : ''}`).join('\n')}
            </div>
            ` : ``}
            ${t.quoted_status ? `
            <a class="tweet-body-quote" href="https://twitter.com/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}">
                <img src="${t.quoted_status.user.profile_image_url_https}" alt="${escape(t.quoted_status.user.name)}" class="tweet-avatar-quote" width="24" height="24">
                <div class="tweet-header-quote">
                    <span class="tweet-header-info-quote">
                        <strong class="tweet-header-name-quote">${escape(t.quoted_status.user.name)}</strong>
                        <span class="tweet-header-handle-quote">@${t.quoted_status.user.screen_name}</span>
                    </span>
                </div>
                <span class="tweet-time-quote" data-timestamp="${new Date(t.quoted_status.created_at).getTime()}" title="${new Date(t.quoted_status.created_at).toLocaleString()}">${timeElapsed(new Date(t.quoted_status.created_at).getTime())}</span>
                <span class="tweet-body-text-quote tweet-body-text-long" style="color:black!important">${t.quoted_status.full_text ? escape(t.quoted_status.full_text).replace(/\n/g, '<br>') : ''}</span>
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
                    ${t.user.id_str === user.id_str ? `<span class="tweet-interact-more-menu-analytics">Tweet analytics</span><br>` : ``}
                    ${t.user.id_str === user.id_str ? `<span class="tweet-interact-more-menu-delete">Delete tweet</span><br>` : ``}
                    <span class="tweet-interact-more-menu-refresh">Refresh tweet data</span><br>
                    ${t.extended_entities && t.extended_entities.media.length === 1 ? `<span class="tweet-interact-more-menu-download">Download media</span><br>` : ``}
                </div>
            </div>
            <div class="tweet-reply" hidden>
                <br>
                <b style="font-size: 12px;display: block;margin-bottom: 5px;">Replying to tweet <span class="tweet-reply-cancel">[cancel]</span></b>
                <span class="tweet-reply-error" style="color:red"></span>
                <textarea maxlength="280" class="tweet-reply-text" placeholder="Cool reply tweet"></textarea>
                <button class="tweet-reply-button nice-button">Reply</button>
            </div>
            <div class="tweet-quote" hidden>
                <br>
                <b style="font-size: 12px;display: block;margin-bottom: 5px;">Quote tweet <span class="tweet-quote-cancel">[cancel]</span></b>
                <span class="tweet-quote-error" style="color:red"></span>
                <textarea maxlength="280" class="tweet-quote-text" placeholder="Cool quote tweet"></textarea>
                <button class="tweet-quote-button nice-button">Quote</button>
            </div>
            ${options.selfThreadContinuation && t.self_thread.id_str ? `
            <span class="tweet-self-thread-line"></span>
            <div class="tweet-self-thread-line-dots"></div>
            <br><a class="tweet-self-thread-button" href="https://twitter.com/${t.user.screen_name}/status/${t.self_thread.id_str}">Show this thread</a>
            ` : ``}
        </div>
    `;
    if(options.top) {
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

    const tweetReplyCancel = tweet.getElementsByClassName('tweet-reply-cancel')[0];
    const tweetReply = tweet.getElementsByClassName('tweet-reply')[0];
    const tweetReplyButton = tweet.getElementsByClassName('tweet-reply-button')[0];
    const tweetReplyError = tweet.getElementsByClassName('tweet-reply-error')[0];
    const tweetReplyText = tweet.getElementsByClassName('tweet-reply-text')[0];

    const tweetInteractReply = tweet.getElementsByClassName('tweet-interact-reply')[0];
    const tweetInteractRetweet = tweet.getElementsByClassName('tweet-interact-retweet')[0];
    const tweetInteractFavorite = tweet.getElementsByClassName('tweet-interact-favorite')[0];
    const tweetInteractMore = tweet.getElementsByClassName('tweet-interact-more')[0];

    const tweetQuote = tweet.getElementsByClassName('tweet-quote')[0];
    const tweetQuoteCancel = tweet.getElementsByClassName('tweet-quote-cancel')[0];
    const tweetQuoteButton = tweet.getElementsByClassName('tweet-quote-button')[0];
    const tweetQuoteError = tweet.getElementsByClassName('tweet-quote-error')[0];
    const tweetQuoteText = tweet.getElementsByClassName('tweet-quote-text')[0];

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
    const tweetInteractMoreMenuDelete = tweet.getElementsByClassName('tweet-interact-more-menu-delete')[0];

    // Media
    if(t.extended_entities && t.extended_entities.media) {
        const tweetMedia = tweet.getElementsByClassName('tweet-media')[0];
        tweetMedia.addEventListener('click', e => {
            if(e.target.className.includes('tweet-media-element-censor')) {
                return e.target.classList.remove('tweet-media-element-censor');
            }
            if(e.target.tagName === 'IMG') {
                new Viewer(tweetMedia);
                e.target.click();
            }
        });
    }

    // Links
    if(tweetBodyText && tweetBodyText.lastChild && tweetBodyText.lastChild.href && tweetBodyText.lastChild.href.startsWith('https://t.co/')) {
        if(t.entities.urls.length === 0 || t.entities.urls[t.entities.urls.length-1].url !== tweetBodyText.lastChild.href) {
            tweetBodyText.lastChild.remove();
        }
    }
    let links = Array.from(tweetBodyText.getElementsByTagName('a')).filter(a => a.href.startsWith('https://t.co/'));
    links.forEach(a => {
        let link = t.entities.urls.find(u => u.url === a.href);
        if(link) {
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
    tweetInteractReply.addEventListener('click', () => {
        if(!tweetQuote.hidden) tweetQuote.hidden = true;
        if(tweetReply.hidden) {
            tweetInteractReply.classList.add('tweet-interact-reply-clicked');
        } else {
            tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
        }
        tweetReply.hidden = !tweetReply.hidden;
        setTimeout(() => {
            tweetReplyText.focus();
        })
    });
    tweetReplyButton.addEventListener('click', async () => {
        tweetReplyError.innerHTML = '';
        let text = tweetReplyText.value;
        if(text.length > 0) {
            let tweetData;
            try {
                tweetData = await API.postTweet({
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
                })
            } catch(e) {
                tweetReplyError.innerHTML = (e && e.message ? e.message : e) + "<br>";
                return;
            }
            if(!tweetData) {
                tweetReplyError.innerHTML = "Error sending tweet<br>";
                return;
            }
            tweetReplyText.value = '';
            tweetReply.hidden = true;
            tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
            tweetInteractReply.innerText = parseInt(tweetInteractReply.innerText) + 1;
            tweetData._ARTIFICIAL = true;
            timeline.data.unshift(tweetData);
            appendTweet(tweetData, timelineContainer, { prepend: true });
        }
    });

    // Retweet / Quote Tweet
    tweetQuoteCancel.addEventListener('click', () => {
        tweetQuote.hidden = true;
    });
    tweetInteractRetweet.addEventListener('click', async () => {
        if(!tweetQuote.hidden) {
            tweetQuote.hidden = true;
            return;
        }
        if(tweetInteractRetweetMenu.hidden) {
            tweetInteractRetweetMenu.hidden = false;
        }
        setTimeout(() => {
            document.body.addEventListener('click', () => {
                setTimeout(() => tweetInteractRetweetMenu.hidden = true, 50);
            }, { once: true });
        }, 50);
    });
    tweetInteractRetweetMenuRetweet.addEventListener('click', async () => {
        if(!t.retweeted) {
            let tweetData;
            try {
                tweetData = await API.retweetTweet(t.id_str);
            } catch(e) {
                console.error(e);
                return;
            }
            if(!tweetData) {
                return;
            }
            tweetInteractRetweetMenuRetweet.innerText = 'Unretweet';
            tweetInteractRetweet.classList.add('tweet-interact-retweeted');
            t.retweeted = true;
            t.newTweetId = tweetData.id_str;
        } else {
            let tweetData;
            try {
                tweetData = await API.deleteTweet(t.current_user_retweet ? t.current_user_retweet.id_str : t.newTweetId);
            } catch(e) {
                console.error(e);
                return;
            }
            if(!tweetData) {
                return;
            }
            tweetInteractRetweetMenuRetweet.innerText = 'Retweet';
            tweetInteractRetweet.classList.remove('tweet-interact-retweeted');
            t.retweeted = false;
            delete t.newTweetId;
        }
    });
    tweetInteractRetweetMenuQuote.addEventListener('click', async () => {
        if(!tweetReply.hidden) {
            tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
            tweetReply.hidden = true;
        }
        tweetQuote.hidden = false;
        setTimeout(() => {
            tweetQuoteText.focus();
        })
    });
    tweetQuoteButton.addEventListener('click', async () => {
        tweetQuoteError.innerHTML = '';
        let text = tweetQuoteText.value;
        if(text.length > 0) {
            let tweetData;
            try {
                tweetData = await API.postTweet({
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
                })
            } catch(e) {
                tweetQuoteError.innerHTML = (e && e.message ? e.message : e) + "<br>";
                return;
            }
            if(!tweetData) {
                tweetQuoteError.innerHTML = "Error sending tweet<br>";
                return;
            }
            tweetQuoteText.value = '';
            tweetQuote.hidden = true;
            tweetData._ARTIFICIAL = true;
            timeline.data.unshift(tweetData);
            appendTweet(tweetData, timelineContainer, { prepend: true });
        }
    });

    // Favorite
    tweetInteractFavorite.addEventListener('click', () => {
        if(t.favorited) {
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
    tweetInteractMore.addEventListener('click', () => {
        if(tweetInteractMoreMenu.hidden) {
            tweetInteractMoreMenu.hidden = false;
        }
        setTimeout(() => {
            document.body.addEventListener('click', () => {
                setTimeout(() => tweetInteractMoreMenu.hidden = true, 50);
            }, { once: true });
        }, 50);
    });
    tweetInteractMoreMenuCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(`https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
    });
    tweetInteractMoreMenuShare.addEventListener('click', () => {
        navigator.share({url: `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`});
    });
    tweetInteractMoreMenuEmbed.addEventListener('click', () => {
        openInNewTab(`https://publish.twitter.com/?query=https://twitter.com/${t.user.screen_name}/status/${t.id_str}&widget=Tweet`);
    });
    if(t.user.id_str === user.id_str) {
        tweetInteractMoreMenuAnalytics.addEventListener('click', () => {
            openInNewTab(`https://twitter.com/dimdenEFF/status/${t.id_str}/analytics`);
        });
        tweetInteractMoreMenuDelete.addEventListener('click', async () => {
            let sure = confirm("Are you sure you want to delete this tweet?");
            if(!sure) return;
            try {
                await API.deleteTweet(t.id_str);
            } catch(e) {
                console.error(e);
                return;
            }
            tweet.remove();
        });
    }
    tweetInteractMoreMenuRefresh.addEventListener('click', async () => {
        let tweetData;
        try {
            tweetData = await API.getTweet(t.id_str);
        } catch(e) {
            console.error(e);
            return;
        }
        if(!tweetData) {
            return;
        }
        let tweetIndex = timeline.data.findIndex(tweet => tweet.id_str === t.id_str);
        if(tweetIndex !== -1) {
            timeline.data[tweetIndex] = tweetData;
        }
        if(tweetInteractFavorite.className.includes('tweet-interact-favorited') && !tweetData.favorited) {
            tweetInteractFavorite.classList.remove('tweet-interact-favorited');
        }
        if(tweetInteractRetweet.className.includes('tweet-interact-retweeted') && !tweetData.retweeted) {
            tweetInteractRetweet.classList.remove('tweet-interact-retweeted');
        }
        if(!tweetInteractFavorite.className.includes('tweet-interact-favorited') && tweetData.favorited) {
            tweetInteractFavorite.classList.add('tweet-interact-favorited');
        }
        if(!tweetInteractRetweet.className.includes('tweet-interact-retweeted') && tweetData.retweeted) {
            tweetInteractRetweet.classList.add('tweet-interact-retweeted');
        }
        tweetInteractFavorite.innerText = tweetData.favorite_count;
        tweetInteractRetweet.innerText = tweetData.retweet_count;
        tweetInteractReply.innerText = tweetData.reply_count;
    });
    let downloading = false;
    if(t.extended_entities && t.extended_entities.media.length === 1) {
        tweetInteractMoreMenuDownload.addEventListener('click', () => {
            if(downloading) return;
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
    }

    if(options.prepend) {
        timelineContainer.prepend(tweet);
    } else {
        timelineContainer.append(tweet);
    }
    twemoji.parse(tweet);
}

function renderTimeline() {
    let timelineContainer = document.getElementById('timeline');
    timelineContainer.innerHTML = '';
    timeline.data.forEach(t => {
        if(t.retweeted_status) {
            appendTweet(t.retweeted_status, timelineContainer, {
                    top: {
                    text: `<a href="https://twitter.com/${t.user.screen_name}">${escape(t.user.name)}</a> retweeted`,
                    icon: "\uf006",
                    color: "#77b255"
                }
            });
        } else {
            if(t.self_thread) {
                let selfThreadTweet = timeline.data.find(tweet => tweet.id_str === t.self_thread.id_str);
                if(selfThreadTweet && selfThreadTweet.id_str !== t.id_str && seenThreads.indexOf(selfThreadTweet.id_str) === -1) {
                    appendTweet(selfThreadTweet, timelineContainer, {
                        selfThreadContinuation: true
                    });
                    appendTweet(t, timelineContainer, {
                        noTop: true
                    });
                    seenThreads.push(selfThreadTweet.id_str);
                } else {
                    appendTweet(t, timelineContainer, {
                        selfThreadButton: true
                    });
                }
            } else {
                appendTweet(t, timelineContainer);
            }
        }
    });
}
function renderNewTweetsButton() {
    if(timeline.toBeUpdated > 0) {
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
        let usersSuggestions = discover.timeline.instructions[0].addEntries.entries[0].content.timelineModule.items.map(s => s.entryId.slice('user-'.length)).slice(0, 5); // why is it so deep
        usersSuggestions.forEach(userId => {
            let userData = usersData[userId];
            if(!userData) return;
            let udiv = document.createElement('div');
            udiv.className = 'wtf-user';
            udiv.innerHTML = `
                <a class="tweet-avatar-link" href="https://twitter.com/${userData.screen_name}"><img src="${userData.profile_image_url_https.replace("_normal", "_bigger")}" alt="${userData.name}" class="tweet-avatar" width="48" height="48"></a>
                <div class="tweet-header">
                    <a class="tweet-header-info wtf-user-link" href="https://twitter.com/${userData.screen_name}">
                        <strong class="tweet-header-name wtf-user-name">${userData.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</strong>
                        <span class="tweet-header-handle wtf-user-handle">@${userData.screen_name}</span>
                    </a>
                    <br>
                    <button class="nice-button discover-follow-btn ${userData.following ? 'following' : 'follow'}" style="position:relative;bottom: 1px;">${userData.following ? 'Following' : 'Follow'}</button>
                </div>
            `;
            const followBtn = udiv.querySelector('.discover-follow-btn');
            followBtn.addEventListener('click', async () => {
                if(followBtn.className.includes('following')) {
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
                chrome.storage.local.set({discoverData: {
                    date: Date.now(),
                    data: discover
                }}, () => {})
            });
            discoverContainer.append(udiv);
            twemoji.parse(udiv);
        });
    } catch(e) {
        console.warn(e);
    }
}
async function renderTrends() {
    let trends = (await API.getTrends()).modules;
    console.log(trends);
    let trendsContainer = document.getElementById('trends-list');
    trendsContainer.innerHTML = '';
    trends.forEach(({trend}) => {
        let trendDiv = document.createElement('div');
        trendDiv.className = 'trend';
        trendDiv.innerHTML = `
            <b><a href="https://twitter.com/search?q=${trend.name.replace(/</g, '')}" class="trend-name">${trend.name}</a></b><br>
            <span class="trend-description">${trend.meta_description}</span>
        `;
        trendsContainer.append(trendDiv);
        twemoji.parse(trendDiv);
    });
}

// On scroll to end of timeline, load more tweets
let loadingNewTweets = false;
document.addEventListener('scroll', async () => {
    if((window.innerHeight + window.scrollY) >= document.body.offsetHeight-1000) {
        if(loadingNewTweets || timeline.data.length === 0) return;
        loadingNewTweets = true;
        let tl;
        try {
            tl = await API.getTimeline(timeline.data[timeline.data.length-1].id_str);
        } catch(e) {
            console.error(e);
            loadingNewTweets = false;
            return;
        }
        timeline.data = timeline.data.concat(tl);
        let lastTweet = document.getElementById('timeline').lastChild;
        renderTimeline();
        setTimeout(() => {
            lastTweet.scrollIntoView({
                behavior: 'smooth'
            });
            setTimeout(() => {
                loadingNewTweets = false;
            });
        }, 200);
    }
});

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
    document.getElementById('new-tweet-text').classList.add('new-tweet-text-focused');
    document.getElementById('new-tweet-media-div').classList.add('new-tweet-media-div-focused');
}, { once: true });

// Update dates every minute
setInterval(() => {
    let tweetDates = Array.from(document.getElementsByClassName('tweet-time'));
    let tweetQuoteDates = Array.from(document.getElementsByClassName('tweet-time-quote'));
    let all = [...tweetDates, ...tweetQuoteDates];
    all.forEach(date => {
        date.innerText = timeElapsed(+date.dataset.timestamp);
    });
}, 60000);

// Run
API.getSettings().then(s => {
    settings = s;
    updateUserData();
    updateTimeline();
    renderDiscovery();
    renderTrends();
    setInterval(updateUserData, 60000*3);
    setInterval(updateTimeline, 60000);
    setInterval(() => renderDiscovery(false), 60000*15);
    setInterval(renderTrends, 60000*5);
}).catch(e => {
    if (e === "Not logged in") {
        window.location.href = "https://twitter.com/login";
    }
    console.error(e);
})