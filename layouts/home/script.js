let user = {};
let timeline = {
    data: [],
    dataToUpdate: [],
    toBeUpdated: 0
}

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
    });
}
async function updateTimeline() {
    let tl = await API.getTimeline();
    console.log(tl);
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
                data = timeline.dataToUpdate.concat(data.slice(timeline.toBeUpdated));
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

// Render
function renderUserData() {
    document.getElementById('user-name').innerText = user.name;
    document.getElementById('user-handle').innerText = `@${user.screen_name}`;
    document.getElementById('user-tweets').innerText = user.statuses_count;
    document.getElementById('user-following').innerText = user.friends_count;
    document.getElementById('user-followers').innerText = user.followers_count;
    document.getElementById('user-banner').src = user.profile_banner_url;
    document.getElementById('user-avatar').src = user.profile_image_url_https.replace("_normal", "_400x400");
}

function appendTweet(t, timelineContainer, top, prepend = false) {
    let tweet = document.createElement('div');
    tweet.classList.add('tweet');
    tweet.innerHTML = `
        <div class="tweet-top" hidden></div>
        <a class="tweet-avatar-link" href="https://twitter.com/${t.user.screen_name}"><img src="${t.user.profile_image_url_https.replace("_normal", "_bigger")}" alt="${t.user.name}" class="tweet-avatar" width="48" height="48"></a>
        <div class="tweet-header">
            <a class="tweet-header-info" href="https://twitter.com/${t.user.screen_name}">
                <strong class="tweet-header-name">${t.user.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</strong>
                <span class="tweet-header-handle">@${t.user.screen_name}</span>
            </a>
        </div>
        <a class="tweet-time" title="${new Date(t.created_at).toLocaleString()}" href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}">${timeElapsed(new Date(t.created_at).getTime())}</a>
        <div class="tweet-body">
            <span class="tweet-body-text ${t.full_text && t.full_text.length > 100 ? 'tweet-body-text-long' : 'tweet-body-text-short'}">${t.full_text ? t.full_text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>').replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1" target="_blank">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1" target="_blank">@$1</a>`) : ''}</span>
            ${t.quoted_status ? `
            <a class="tweet-body-quote" href="https://twitter.com/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}">
                <img src="${t.quoted_status.user.profile_image_url_https}" alt="${t.quoted_status.user.name}" class="tweet-avatar-quote" width="24" height="24">
                <div class="tweet-header-quote">
                    <span class="tweet-header-info-quote">
                        <strong class="tweet-header-name-quote">${t.quoted_status.user.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</strong>
                        <span class="tweet-header-handle-quote">@${t.quoted_status.user.screen_name}</span>
                    </span>
                </div>
                <span class="tweet-time-quote" title="${new Date(t.quoted_status.created_at).toLocaleString()}">${timeElapsed(new Date(t.quoted_status.created_at).getTime())}</span>
                <span class="tweet-body-text-quote tweet-body-text-long" style="color:black!important">${t.quoted_status.full_text ? t.quoted_status.full_text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>') : ''}</span>
            </a>
            ` : ``}
            <div class="tweet-interact">
                <span class="tweet-interact-reply">${t.reply_count}</span>
                <span class="tweet-interact-retweet ${t.retweeted ? 'tweet-interact-retweeted' : ''}">${t.retweet_count}</span>
                <div class="tweet-interact-retweet-menu" hidden>
                    <span class="tweet-interact-retweet-menu-retweet">${t.retweeted ? 'Unretweet' : 'Retweet'}</span><br>
                    <span class="tweet-interact-retweet-menu-quote">Quote tweet</span>
                </div>
                <span class="tweet-interact-favorite ${t.favorited ? 'tweet-interact-favorited' : ''}">${t.favorite_count}</span>
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
        </div>
    `;
    if(top) {
        tweet.querySelector('.tweet-top').hidden = false;
        let icon = document.createElement('span');
        icon.innerText = top.icon;
        icon.classList.add('tweet-top-icon');
        icon.style.color = top.color;

        let span = document.createElement("span");
        span.classList.add("tweet-top-text");
        span.innerHTML = top.text;
        tweet.querySelector('.tweet-top').append(icon, span);
    }
    // Reply
    tweet.getElementsByClassName('tweet-reply-cancel')[0].addEventListener('click', () => {
        tweet.querySelector('.tweet-reply').hidden = true;
        tweet.getElementsByClassName('tweet-interact-reply')[0].classList.remove('tweet-interact-reply-clicked');
    });
    tweet.getElementsByClassName('tweet-interact-reply')[0].addEventListener('click', () => {
        if(!tweet.getElementsByClassName('tweet-quote')[0].hidden) tweet.getElementsByClassName('tweet-quote')[0].hidden = true;
        if(tweet.getElementsByClassName('tweet-reply')[0].hidden) {
            tweet.getElementsByClassName('tweet-interact-reply')[0].classList.add('tweet-interact-reply-clicked');
        } else {
            tweet.getElementsByClassName('tweet-interact-reply')[0].classList.remove('tweet-interact-reply-clicked');
        }
        tweet.getElementsByClassName('tweet-reply')[0].hidden = !tweet.getElementsByClassName('tweet-reply')[0].hidden;
    });
    tweet.getElementsByClassName('tweet-reply-button')[0].addEventListener('click', async () => {
        tweet.getElementsByClassName('tweet-reply-error')[0].innerHTML = '';
        let text = tweet.getElementsByClassName('tweet-reply-text')[0].value;
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
                tweet.getElementsByClassName('tweet-reply-error')[0].innerHTML = (e && e.message ? e.message : e) + "<br>";
                return;
            }
            if(!tweetData) {
                tweet.getElementsByClassName('tweet-reply-error')[0].innerHTML = "Error sending tweet<br>";
                return;
            }
            tweet.getElementsByClassName('tweet-reply-text')[0].value = '';
            tweet.getElementsByClassName('tweet-reply')[0].hidden = true;
            tweet.getElementsByClassName('tweet-interact-reply')[0].classList.remove('tweet-interact-reply-clicked');
            tweetData._ARTIFICIAL = true;
            timeline.data.unshift(tweetData);
            appendTweet(tweetData, timelineContainer, undefined, true);
        }
    });

    // Retweet / Quote Tweet
    tweet.getElementsByClassName('tweet-quote-cancel')[0].addEventListener('click', () => {
        tweet.querySelector('.tweet-quote').hidden = true;
    });
    tweet.getElementsByClassName('tweet-interact-retweet')[0].addEventListener('click', async () => {
        if(!tweet.querySelector('.tweet-quote').hidden) {
            tweet.querySelector('.tweet-quote').hidden = true;
            return;
        }
        if(tweet.getElementsByClassName('tweet-interact-retweet-menu')[0].hidden) {
            tweet.getElementsByClassName('tweet-interact-retweet-menu')[0].hidden = false;
        }
        setTimeout(() => {
            document.body.addEventListener('click', () => {
                setTimeout(() => tweet.getElementsByClassName('tweet-interact-retweet-menu')[0].hidden = true, 50);
            }, { once: true });
        }, 50);
    });
    tweet.getElementsByClassName('tweet-interact-retweet-menu-retweet')[0].addEventListener('click', async () => {
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
            tweet.getElementsByClassName('tweet-interact-retweet-menu-retweet')[0].innerText = 'Unretweet';
            tweet.getElementsByClassName('tweet-interact-retweet')[0].classList.add('tweet-interact-retweeted');
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
            tweet.getElementsByClassName('tweet-interact-retweet-menu-retweet')[0].innerText = 'Retweet';
            tweet.getElementsByClassName('tweet-interact-retweet')[0].classList.remove('tweet-interact-retweeted');
            t.retweeted = false;
            delete t.newTweetId;
        }
    });
    tweet.getElementsByClassName('tweet-interact-retweet-menu-quote')[0].addEventListener('click', async () => {
        if(!tweet.getElementsByClassName('tweet-reply')[0].hidden) {
            tweet.getElementsByClassName('tweet-interact-reply')[0].classList.remove('tweet-interact-reply-clicked');
            tweet.getElementsByClassName('tweet-reply')[0].hidden = true;
        }
        tweet.getElementsByClassName('tweet-quote')[0].hidden = false;
    });
    tweet.getElementsByClassName('tweet-quote-button')[0].addEventListener('click', async () => {
        tweet.getElementsByClassName('tweet-quote-error')[0].innerHTML = '';
        let text = tweet.getElementsByClassName('tweet-quote-text')[0].value;
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
                tweet.getElementsByClassName('tweet-quote-error')[0].innerHTML = (e && e.message ? e.message : e) + "<br>";
                return;
            }
            if(!tweetData) {
                tweet.getElementsByClassName('tweet-quote-error')[0].innerHTML = "Error sending tweet<br>";
                return;
            }
            tweet.getElementsByClassName('tweet-quote-text')[0].value = '';
            tweet.getElementsByClassName('tweet-quote')[0].hidden = true;
            tweetData._ARTIFICIAL = true;
            timeline.data.unshift(tweetData);
            appendTweet(tweetData, timelineContainer, undefined, true);
        }
    });

    // Favorite
    tweet.getElementsByClassName('tweet-interact-favorite')[0].addEventListener('click', () => {
        if(t.favorited) {
            API.unfavoriteTweet({
                id: t.id_str
            });
            t.favorited = false;
            tweet.getElementsByClassName('tweet-interact-favorite')[0].classList.remove('tweet-interact-favorited');
        } else {
            API.favoriteTweet({
                id: t.id_str
            });
            t.favorited = true;
            tweet.getElementsByClassName('tweet-interact-favorite')[0].classList.add('tweet-interact-favorited');
        }
    });
    if(prepend) {
        timelineContainer.prepend(tweet);
    } else {
        timelineContainer.append(tweet);
    }
}

function renderTimeline() {
    let timelineContainer = document.getElementById('timeline');
    timelineContainer.innerHTML = '';
    timeline.data.forEach(t => {
        if(t.retweeted_status) {
            appendTweet(t.retweeted_status, timelineContainer, {
                text: `<a href="https://twitter.com/${t.user.screen_name}">${t.user.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</a> retweeted`,
                icon: "\uf006",
                color: "#77b255"
            });
        } else {
            appendTweet(t, timelineContainer);
        }
    });
}
function renderNewTweetsButton() {

}

// Run
updateUserData();
updateTimeline();
setInterval(updateUserData, 60000);
setInterval(updateTimeline, 60000);