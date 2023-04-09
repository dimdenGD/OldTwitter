let user = {};
let pageUser = {};
let timeline = {
    data: [],
    dataToUpdate: [],
    toBeUpdated: 0
}
let seenThreads = [];
let averageLikeCount = 1;
let pinnedTweet, followersYouFollow;
let previousLastTweet, stopLoad = false;
let favoritesCursor, followingCursor, followersCursor, followersYouKnowCursor, mediaCursor;

// Util

let subpage;
let user_handle = location.pathname.slice(1).split("?")[0].split('#')[0];
user_handle = user_handle.split('/')[0];
function updateSubpage() {
    previousLastTweet = undefined; stopLoad = false;
    averageLikeCount = 1;
    user_handle = location.pathname.slice(1).split("?")[0].split('#')[0];
    if(user_handle.split('/').length === 1) {
        subpage = 'profile';
    } else {
        if(user_handle.endsWith('/with_replies')) {
            subpage = 'replies';
        } else if(user_handle.endsWith('/media')) {
            subpage = 'media';
        } else if(user_handle.endsWith('/likes')) {
            subpage = 'likes';
        } else if(user_handle.endsWith('/following')) {
            subpage = 'following';
        } else if(user_handle.endsWith('/followers')) {
            subpage = 'followers';
        } else if(user_handle.endsWith('/followers_you_follow')) {
            subpage = 'followers_you_follow';
        } else if(user_handle.endsWith('/lists')) {
            subpage = 'lists';
        }
    }
    user_handle = user_handle.split('/')[0];
}

function updateSelection() {
    document.getElementById('style-hide-retweets').innerHTML = '';
    document.getElementById('tweet-nav-more-menu-hr').checked = false;
    
    let activeStats = Array.from(document.getElementsByClassName('profile-stat-active'));
    for(let i in activeStats) {
        if(activeStats[i].classList.contains('profile-stat-active')) {
            activeStats[i].classList.remove('profile-stat-active');
        }
    }
    let activeNavs = Array.from(document.getElementsByClassName('tweet-nav-active'));
    for(let i in activeNavs) {
        if(activeNavs[i].classList.contains('tweet-nav-active')) {
            activeNavs[i].classList.remove('tweet-nav-active');
        }
    }

    if(subpage === "profile") {
        document.getElementById('tweet-nav').hidden = false;
        document.getElementById('timeline').hidden = false;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-tweets-link').classList.add('profile-stat-active');
        document.getElementById('tweet-nav-tweets').classList.add('tweet-nav-active');
    } else if(subpage === "likes") {
        document.getElementById('tweet-nav').hidden = false;
        document.getElementById('timeline').hidden = false;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-favorites-link').classList.add('profile-stat-active');
    } else if(subpage === "replies") {
        document.getElementById('tweet-nav').hidden = false;
        document.getElementById('timeline').hidden = false;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-tweets-link').classList.add('profile-stat-active');
        document.getElementById('tweet-nav-replies').classList.add('tweet-nav-active');
    } else if(subpage === "media") {
        document.getElementById('tweet-nav').hidden = false;
        document.getElementById('timeline').hidden = false;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-tweets-link').classList.add('profile-stat-active');
        document.getElementById('tweet-nav-media').classList.add('tweet-nav-active');
    } else if(subpage === "following") {
        document.getElementById('tweet-nav').hidden = true;
        document.getElementById('timeline').hidden = true;
        document.getElementById('following-list').hidden = false;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = false;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-following-link').classList.add('profile-stat-active');
    } else if(subpage === "followers") {
        document.getElementById('tweet-nav').hidden = true;
        document.getElementById('timeline').hidden = true;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = false;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = false;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-followers-link').classList.add('profile-stat-active');
    } else if(subpage === "followers_you_follow") {
        document.getElementById('tweet-nav').hidden = true;
        document.getElementById('timeline').hidden = true;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = false;
        document.getElementById('followers_you_follow-more').hidden = false;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-followers-link').classList.add('profile-stat-active');
    } else if(subpage === "lists") {
        document.getElementById('tweet-nav').hidden = true;
        document.getElementById('timeline').hidden = true;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = false;
    }
    document.getElementById('profile-stat-tweets-link').href = `https://twitter.com/${pageUser.screen_name}`;
    document.getElementById('profile-stat-following-link').href = `https://twitter.com/${pageUser.screen_name}/following`;
    document.getElementById('profile-stat-followers-link').href = `https://twitter.com/${pageUser.screen_name}/followers`;
    document.getElementById('profile-stat-favorites-link').href = `https://twitter.com/${pageUser.screen_name}/likes`;
    document.getElementById('tweet-nav-tweets').href = `https://twitter.com/${pageUser.screen_name}`;
    document.getElementById('tweet-nav-replies').href = `https://twitter.com/${pageUser.screen_name}/with_replies`;
    document.getElementById('tweet-nav-media').href = `https://twitter.com/${pageUser.screen_name}/media`;

    if(pageUser.statuses_count === 0 && (subpage === 'profile' || subpage === 'replies')) {
        document.getElementById('trends').hidden = true;
        document.getElementById('no-tweets').hidden = false;
        document.getElementById('no-tweets').innerHTML = `
            <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
            <p>${LOC.when_theyll_tweet.message}</p>
        `;
    } else {
        document.getElementById('trends').hidden = false;
        document.getElementById('no-tweets').hidden = true;
        document.getElementById('no-tweets').innerHTML = ``;
    }
}

function updateUserData() {
    return new Promise(async (resolve, reject) => {
        document.getElementsByTagName('title')[0].innerText = `${user_handle} - OldTwitter`;
        let [pageUserData, customColor, followersYouFollowData, oldUser, u] = await Promise.allSettled([
            API.getUserV2(user_handle),
            fetch(`https://dimden.dev/services/twitter_link_colors/get/${user_handle}`).then(res => res.text()),
            API.friendsFollowing(user_handle, false),
            API.getUser(user_handle, false),
            API.verifyCredentials()
        ]).catch(e => {
            document.getElementById('loading-box').hidden = false;
            if(String(e).includes('User has been suspended.')) {
                return document.getElementById('loading-box-error').innerHTML = `${LOC.user_was_suspended.message}<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
            }
            if(String(e).includes("reading 'result'")) {
                return document.getElementById('loading-box-error').innerHTML = `${LOC.user_was_not_found.message}<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
            }
            return document.getElementById('loading-box-error').innerHTML = `${String(e)}.<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
        });
        if(oldUser.reason) {
            let e = oldUser.reason;
            if(String(e).includes('User has been suspended.')) {
                document.getElementById('loading-box').hidden = false;
                return document.getElementById('loading-box-error').innerHTML = `${LOC.user_was_suspended.message}<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
            }
        }
        if(pageUserData.reason) {
            let e = pageUserData.reason;
            document.getElementById('loading-box').hidden = false;
            if(String(e).includes("reading 'result'")) {
                return document.getElementById('loading-box-error').innerHTML = `${LOC.user_was_not_found.message}<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
            }
            return document.getElementById('loading-box-error').innerHTML = `${String(e)}.<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
        }
        pageUserData = pageUserData.value;
        customColor = customColor.value;
        followersYouFollowData = followersYouFollowData.value;
        oldUser = oldUser.value;
        u = u.value;
        user = u;
        if(customColor && customColor !== 'none') {
            user.profile_link_color = customColor;
        }

        userDataFunction(u);
        const event2 = new CustomEvent('updatePageUserData', { detail: oldUser });
        document.dispatchEvent(event2);

        pageUser = pageUserData;
        let r = document.querySelector(':root');
        r.style.setProperty('--link-color', vars && vars.linkColor ? vars.linkColor : '#4595B5');
        if(customColor && customColor !== 'none') {
            let rgb = hex2rgb(customColor);
            let ratio = contrast(rgb, [27, 40, 54]);
            if(ratio < 4 && isDarkModeEnabled && customColor !== '000000') {
                customColor = colorShade(customColor, 80).slice(1);
            }
            r.style.setProperty('--link-color', `#`+customColor);
        } else {
            let rgb = hex2rgb(oldUser.profile_link_color);
            let ratio = contrast(rgb, [27, 40, 54]);
            if(ratio < 4 && isDarkModeEnabled && customColor !== '000000') {
                oldUser.profile_link_color = colorShade(oldUser.profile_link_color, 80).slice(1);
            }
            if(oldUser.profile_link_color && oldUser.profile_link_color !== '1DA1F2') r.style.setProperty('--link-color', `#`+oldUser.profile_link_color);
        }
        if(pageUser.id_str !== user.id_str) {
            followersYouFollow = followersYouFollowData;
            document.getElementById('profile-friends-text').style.display = 'unset';
        } else {
            followersYouFollow = undefined;
            document.getElementById('profile-friends-text').style.display = 'none';
        }
        renderProfile();
        try {
            pinnedTweet = pageUser.pinned_tweet_ids_str;
            if(pinnedTweet && pinnedTweet.length > 0) pinnedTweet = await API.tweetDetail(pinnedTweet[0]);
            else pinnedTweet = undefined;
        } catch(e) {
            pinnedTweet = undefined;
            console.warn(e);
        }
        resolve(u);
    }).catch(e => {
        if (e === "Not logged in") {
            window.location.href = "https://mobile.twitter.com/login";
        }
        console.error(e);
        reject(e);
    });
}

async function updateTimeline() {
    seenThreads = [];
    if (timeline.data.length === 0) document.getElementById('timeline').innerHTML = `<span style="color:var(--darker-gray);margin-top:10px;display:block">${LOC.loading_tweets.message}</span>`;
    let tl;
    if(subpage === "likes") {
        let data = await API.getFavorites(pageUser.id_str);
        tl = data.tl;
        favoritesCursor = data.cursor;
    } else {
        try {
            if(subpage === 'media') {
                tl = await API.getUserMediaTweets(pageUser.id_str);
                mediaCursor = tl.cursor;
                tl = tl.tweets;
            } else {
                tl = await API.getUserTweets(pageUser.id_str, undefined, subpage !== 'profile');
            }
        } catch(e) {
            document.getElementById('tweet-nav').hidden = true;
            document.getElementById('loading-box').hidden = true;
            document.getElementById('timeline').innerHTML = `<div style="padding: 100px;color: var(--darker-gray);">${escapeHTML(e)}</div>`;
            return;
        }
        // if(subpage === 'media') {
        //     tl = tl.filter(t => t.extended_entities && t.extended_entities.media && t.extended_entities.media.length > 0 && !t.retweeted_status);
        // }
    }
    if(tl.error === "Not authorized.") {
        document.getElementById('tweet-nav').hidden = true;
        document.getElementById('loading-box').hidden = true;
        document.getElementById('timeline').innerHTML = pageUser.statuses_count === 0 ? '' : `<div style="padding: 100px;color: var(--darker-gray);">${LOC.timeline_not_authorized.message}</div>`;
        return;
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
    // first update
    timeline.data = tl;
    averageLikeCount = timeline.data.filter(t => !t.retweeted_status).map(t => t.favorite_count).sort((a, b) => a - b)[Math.floor(timeline.data.length/2)];
    renderTimeline();
    previousLastTweet = timeline.data[timeline.data.length - 1];
}

async function renderFollowing(clear = true, cursor) {
    loadingFollowing = true;
    let userList = document.getElementById('following-list');
    if(clear) userList.innerHTML = `<h1 class="nice-header">${LOC.following.message}</h1>`;
    let following;
    try {
        following = await API.getFollowing(pageUser.id_str, cursor);
    } catch(e) {
        loadingFollowing = false;
        followingMoreBtn.innerText = LOC.load_more.message;
        console.error(e);
        return;
    }
    followingCursor = following.cursor;
    following = following.list;
    if(following.length === 0) {
        followingMoreBtn.hidden = true;
    } else {
        followingMoreBtn.hidden = false;
    }
    following.forEach(u => {
        appendUser(u, userList);
    });
    document.getElementById('loading-box').hidden = true;
    loadingFollowing = false;
    followingMoreBtn.innerText = LOC.load_more.message;
}
async function renderFollowers(clear = true, cursor) {
    loadingFollowers = true;
    let userList = document.getElementById('followers-list');
    if(clear) userList.innerHTML = '<h1 class="nice-header">Followers</h1>';
    let following;
    try {
        following = await API.getFollowers(pageUser.id_str, cursor)
    } catch(e) {
        loadingFollowers = false;
        followersMoreBtn.innerText = LOC.load_more.message;
        console.error(e);
        return;
    }
    followersCursor = following.cursor;
    following = following.list;
    if(following.length === 0) {
        followersMoreBtn.hidden = true;
    } else {
        followersMoreBtn.hidden = false;
    }
    following.forEach(u => {
        appendUser(u, userList);
    });
    document.getElementById('loading-box').hidden = true;
    loadingFollowers = false;
    followersMoreBtn.innerText = LOC.load_more.message;
}
async function renderFollowersYouFollow(clear = true, cursor) {
    loadingFollowersYouKnow = true;
    let userList = document.getElementById('followers_you_follow-list');
    if(clear) userList.innerHTML = `<h1 class="nice-header">${LOC.followers_you_know.message}</h1>`;
    let following;
    try {
        following = await API.getFollowersYouFollow(pageUser.id_str, cursor);
    } catch(e) {
        console.error(e);
        loadingFollowersYouKnow = false;
        followersYouFollowMoreBtn.innerText = LOC.load_more.message;
        return;
    }
    followersYouKnowCursor = following.cursor;
    following = following.list;
    if(following.length === 0) {
        followersYouFollowMoreBtn.hidden = true;
    } else {
        followersYouFollowMoreBtn.hidden = false;
    }
    following.forEach(u => {
        appendUser(u, userList);
    });
    document.getElementById('loading-box').hidden = true;
    loadingFollowersYouKnow = false;
    followersYouFollowMoreBtn.innerText = LOC.load_more.message;
}
async function renderLists() {
    let lists = pageUser.id_str === user.id_str ? await API.getMyLists() : await API.getUserLists(pageUser.id_str);
    let listsList = document.getElementById('lists-list');
    listsList.innerHTML = `<h1 class="nice-header">${LOC.lists.message}</h1>`;
    if(pageUser.id_str === user.id_str) {
        listsList.innerHTML += `<h1 class="nice-header" style="float:right;cursor:pointer" id="create-list">${LOC.create_btn.message}</h1>`;
        document.getElementById('create-list').addEventListener('click', () => {
            let modal = createModal(`
                <div id="list-creator">
                    <h1 class="cool-header">${LOC.create_list.message}</h1><br>
                    <span id="list-editor-error" style="color:red"></span><br>
                    ${LOC.name.message}:<br><input maxlength="25" type="text" id="list-name-input"><br><br>
                    ${LOC.description.message}:<br><textarea maxlength="100" type="text" id="list-description-input"></textarea><br>
                    <br>
                    Is private: <input type="checkbox" style="width: 15px;" id="list-private-input"><br>
                    <br>
                    <button class="nice-button" id="list-btn-create">${LOC.create.message}</button> 
                </div>
            `, 'list-creator-modal');
            document.getElementById('list-btn-create').addEventListener('click', async () => {
                let list;
                try {
                    list = await API.createList(document.getElementById('list-name-input').value, document.getElementById('list-description-input').value, document.getElementById('list-private-input').checked);
                } catch(e) {
                    return document.getElementById('list-editor-error').innerText = e && e.message ? e.message : e;
                }
                location.href = `https://twitter.com/i/lists/${list.id_str}`;
            });
        });
    }
    for(let i in lists) {
        let l = lists[i];
        if(!l) continue;
        let listElement = document.createElement('div');
        listElement.classList.add('list-item');
        listElement.innerHTML = `
            <div>
                <a href="https://twitter.com/i/lists/${l.id_str}" class="following-item-link">
                    <img style="object-fit: cover;" src="${l.custom_banner_media ? l.custom_banner_media.media_info.original_img_url : l.default_banner_media.media_info.original_img_url}" alt="${l.name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                    <div class="following-item-text" style="position: relative;bottom: 12px;">
                        <span class="tweet-header-name following-item-name${l.mode === 'Private' ? ' user-protected' : ''}" style="font-size: 18px;">${escapeHTML(l.name)}</span><br>
                        <span style="color:var(--darker-gray);font-size:14px;margin-top:2px">${l.description ? escapeHTML(l.description).slice(0, 52) : LOC.no_description.message}</span>
                    </div>
                </a>
            </div>
        `;
        listsList.appendChild(listElement);
    }
    document.getElementById('loading-box').hidden = true;
}

let months = [];
let everAddedAdditional = false;
let toAutotranslate = false;
async function renderProfile() {
    document.getElementById('profile-banner').src = pageUser.profile_banner_url ? pageUser.profile_banner_url : 'https://abs.twimg.com/images/themes/theme1/bg.png';
    let attempts = 0;
    document.getElementById('profile-avatar').addEventListener('error', () => {
        if(attempts > 3) return document.getElementById('profile-avatar').src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';
        attempts++;
        setTimeout(() => {
            document.getElementById('profile-avatar').src = pageUser.profile_image_url_https.replace('_normal.', '_400x400.');
        }, 500);
    });
    let autotranslateProfiles = await new Promise(resolve => {
        chrome.storage.sync.get(['autotranslateProfiles'], data => {
            resolve(data.autotranslateProfiles);
        });
    });
    if(!autotranslateProfiles) {
        autotranslateProfiles = [];
    }
    toAutotranslate = autotranslateProfiles.includes(pageUser.id_str);
    document.getElementById('profile-avatar').src = pageUser.profile_image_url_https.replace('_normal.', '_400x400.');
    document.getElementById('nav-profile-avatar').src = pageUser.profile_image_url_https.replace('_normal.', '_bigger.');
    document.getElementById('profile-name').innerText = pageUser.name;
    document.getElementById('nav-profile-name').innerText = pageUser.name;
    document.getElementById('profile-avatar-link').href = pageUser.profile_image_url_https.replace('_normal.', '_400x400.');;
    document.getElementById('tweet-to').innerText = `${LOC.tweet_to.message} ${pageUser.name}`;
    if(vars.heartsNotStars) {
        document.getElementById('profile-stat-text-favorites').innerText = LOC.likes.message;
    }
    let stats = Array.from(document.getElementsByClassName('profile-stat'));
    stats.forEach(s => {
        s.classList.toggle('profile-stat-disabled', pageUser.protected && !pageUser.following && pageUser.id_str !== user.id_str);
    });

    if(pageUser.verified || pageUser.id_str === '1123203847776763904') {
        document.getElementById('profile-name').classList.add('user-verified');
        document.getElementById('profile-name').classList.add('user-verified-green');
    } else {
        document.getElementById('profile-name').classList.remove('user-verified');
    }
    if(pageUser.protected) {
        document.getElementById('profile-name').classList.add('user-protected');
    } else {
        document.getElementById('profile-name').classList.remove('user-protected');
    }
    if(pageUser.muting) {
        document.getElementById('profile-name').classList.add('user-muted');
    } else {
        document.getElementById('profile-name').classList.remove('user-muted');
    }
    document.getElementById('profile-username').innerText = `@${pageUser.screen_name}`;
    document.getElementById('nav-profile-username').innerText = `@${pageUser.screen_name}`;
    document.getElementById('profile-media-text').href = `https://twitter.com/${pageUser.screen_name}/media`;

    updateSelection();

    document.getElementById('profile-bio').innerHTML = escapeHTML(pageUser.description).replace(/\n\n\n\n/g, "\n").replace(/((http|https|ftp):\/\/[\w?=.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`).replace(hashtagRegex, `<a href="https://twitter.com/hashtag/$2">#$2</a>`).replace(/\n/g, '<br>');
    let textWithoutLinks = pageUser.description.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').replace(/(?<!\w)@([\w+]{1,15}\b)/g, '');
    let isEnglish = textWithoutLinks.length < 1 ? {languages:[{language:LANGUAGE, percentage:100}]} : await chrome.i18n.detectLanguage(textWithoutLinks);
    isEnglish = isEnglish.languages[0] && isEnglish.languages[0].percentage > 60 && isEnglish.languages[0].language.startsWith(LANGUAGE);
    let at = false;
    if(!isEnglish) {
        let translateBtn = document.createElement('span');
        translateBtn.className = "translate-bio";
        translateBtn.addEventListener('click', async () => {
            if(at) return;
            at = true;
            let translated = await API.translateProfile(pageUser.id_str);
            let span = document.createElement('span');
            span.innerHTML = `
                <br>
                <span class='piu-a'>${LOC.translated_from.message} [${translated.localizedSourceLanguage}]</span>
                <span>${escapeHTML(translated.translation).replace(/((http|https|ftp):\/\/[\w?=.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`).replace(hashtagRegex, `<a href="https://twitter.com/hashtag/$2">#$2</a>`).replace(/\n/g, '<br>')}</span>
            `;
            translateBtn.hidden = true;
            document.getElementById('profile-bio').append(span);
            let links = Array.from(span.getElementsByTagName('a'));
            links.forEach(link => {
                let realLink = pageUser.entities.description.urls.find(u => u.url === link.href);
                if (realLink) {
                    link.href = realLink.expanded_url;
                    if(!link.href.startsWith('https://twitter.com/')) link.target = '_blank';
                    link.innerText = realLink.display_url;
                }
            });
            if(vars.enableTwemoji) twemoji.parse(span);
        });
        translateBtn.innerText = LOC.translate_bio.message;
        document.getElementById('profile-bio').append(document.createElement('br'), translateBtn);
    }
    
    if(vars.enableTwemoji) twemoji.parse(document.getElementById('profile-info'));

    document.getElementById('profile-stat-tweets-value').innerText = Number(pageUser.statuses_count).toLocaleString().replace(/\s/g, ',');
    document.getElementById('profile-stat-following-value').innerText = Number(pageUser.friends_count).toLocaleString().replace(/\s/g, ',');
    document.getElementById('profile-stat-followers-value').innerText = Number(pageUser.followers_count).toLocaleString().replace(/\s/g, ',');
    document.getElementById('profile-stat-favorites-value').innerText = Number(pageUser.favourites_count).toLocaleString().replace(/\s/g, ',');

    document.getElementById('tweet-nav').hidden = pageUser.statuses_count === 0 || !(subpage === 'profile' || subpage === 'replies' || subpage === 'media');
    document.getElementById('profile-stat-tweets-link').hidden = pageUser.statuses_count === 0;
    document.getElementById('profile-stat-following-link').hidden = pageUser.friends_count === 0;
    document.getElementById('profile-stat-followers-link').hidden = pageUser.followers_count === 0;
    document.getElementById('profile-stat-favorites-link').hidden = pageUser.favourites_count === 0;

    if((pageUser.statuses_count === 0 && (subpage === 'profile' || subpage === 'replies' || subpage === 'media')) || (pageUser.protected && !pageUser.following && pageUser.id_str !== user.id_str)) {
        document.getElementById('trends').hidden = true;
        setTimeout(() => {
            let list = document.getElementById('wtf-list');
            while(list.childElementCount > 3) list.removeChild(list.lastChild);
        }, 500);
    } else {
        document.getElementById('trends').hidden = false;   
    }
    if(pageUser.statuses_count === 0 && (subpage === 'profile' || subpage === 'replies' || subpage === 'media')) {
        document.getElementById('no-tweets').hidden = false;
        document.getElementById('no-tweets').innerHTML = `
            <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
            <p>${LOC.when_theyll_tweet.message}</p>
        `;
    } else {
        document.getElementById('no-tweets').hidden = true;
        document.getElementById('no-tweets').innerHTML = ``;
    }

    if(pageUser.followed_by) {
        document.getElementById('follows-you').hidden = false;
    } else {
        document.getElementById('follows-you').hidden = true;
    }

    if(followersYouFollow && followersYouFollow.total_count > 0) {
        let friendsFollowing = document.getElementById('profile-friends-following');
        let friendsFollowingList = document.getElementById('profile-friends-div');
        let friendsFollowingText = document.getElementById('profile-friends-text');
        friendsFollowingText.innerText = `${followersYouFollow.total_count} ${LOC.followers_you_know.message}`;
        friendsFollowingText.href = `https://twitter.com/${pageUser.screen_name}/followers_you_follow`;
        friendsFollowingText
        followersYouFollow.users.forEach(u => {
            let a = document.createElement('a');
            a.href = `/${u.screen_name}`;
            let avatar = document.createElement('img');
            avatar.src = u.profile_image_url_https.replace('_normal', '_bigger');
            avatar.width = 45;
            avatar.height = 45;
            avatar.title = u.name + ' (@' + u.screen_name + ')';
            avatar.classList.add('profile-friends-avatar');
            a.append(avatar);
            friendsFollowingList.append(a);
        });
        friendsFollowing.hidden = false;
    } else {
        let friendsFollowing = document.getElementById('profile-friends-following');
        friendsFollowing.hidden = true;
    }

    let buttonsElement = document.getElementById('profile-nav-buttons');
    if(pageUser.id_str === user.id_str) {
        buttonsElement.innerHTML = `<a class="nice-button" id="edit-profile" target="_blank" href="https://mobile.twitter.com/settings/profile">${LOC.edit_profile.message}</a>`;
    } else {
        document.getElementById('tweet-to-bg').hidden = false;
        buttonsElement.innerHTML = /*html*/`
            <button ${pageUser.blocking ? 'hidden' : ''} class="nice-button ${pageUser.following || pageUser.follow_request_sent ? 'following' : 'follow'} control-btn" id="control-follow">${pageUser.following || (pageUser.protected && pageUser.follow_request_sent) ? ((pageUser.protected && pageUser.follow_request_sent) ? LOC.follow_request_sent.message : LOC.following_btn.message) : LOC.follow.message}</button>
            <button class="nice-button control-btn" id="control-unblock" ${pageUser.blocking ? '' : 'hidden'}>${LOC.unblock.message}</button>
            <a ${pageUser.can_dm && !pageUser.blocking ? '' : 'hidden'} class="nice-button" id="message-user"></a>
        `;
        if(!pageUser.following) {
            pageUser.want_retweets = true;
        }
        buttonsElement.innerHTML += /*html*/`
            <span class="profile-additional-thing" id="profile-settings"></span>
            <div id="profile-settings-div" class="dropdown-menu" hidden>
                <span ${!pageUser.following || pageUser.blocking ? 'hidden' : ''} id="profile-settings-notifications" class="${pageUser.notifications ? 'profile-settings-offnotifications' : 'profile-settings-notifications'}">${pageUser.notifications ? LOC.stop_notifications.message : LOC.receive_notifications.message}</span>
                <span id="profile-settings-block" class="${pageUser.blocking ? 'profile-settings-unblock' : 'profile-settings-block'}">${pageUser.blocking ? `${LOC.unblock_user.message} @${pageUser.screen_name}` : `${LOC.block_user.message} @${pageUser.screen_name}`}</span>
                <span ${pageUser.blocking || (pageUser.protected && !pageUser.following) ? 'hidden' : ''} id="profile-settings-mute" class="${pageUser.muting ? 'profile-settings-unmute' : 'profile-settings-mute'}">${pageUser.muting ? LOC.unmute.message : LOC.mute.message}</span>
                ${pageUser.followed_by ? /*html*/`<span id="profile-settings-removefollowing">${LOC.remove_from_followers.message}</span>` : ''}
                <span id="profile-settings-lists-action" ${pageUser.blocking || (pageUser.protected && !pageUser.following) ? 'hidden' : ''}>${LOC.from_list.message}</span>
                <span id="profile-settings-autotranslate">${toAutotranslate ? LOC.dont_autotranslate.message : LOC.autotranslate_tweets.message}</span>
                <span id="profile-settings-retweets" ${pageUser.following ? '' : 'hidden'}>${pageUser.want_retweets ? LOC.turn_off_retweets.message : LOC.turn_on_retweets.message}</span>
                <hr>
                <span id="profile-settings-lists" ${pageUser.protected && !pageUser.following ? 'hidden' : ''}>${LOC.see_lists.message}</span>
                <span id="profile-settings-share">${LOC.share_user.message}</span>
                <span id="profile-settings-copy">${LOC.copy_profile_link.message}</span>
            </div>
        `;
        let messageUser = document.getElementById('message-user');
        messageUser.addEventListener('click', () => {
            let event = new CustomEvent('messageUser', { detail: { id: `${user.id_str}-${pageUser.id_str}`, user: pageUser } });
            document.dispatchEvent(event);
        });
        let clicked = false;
        let controlFollow = document.getElementById('control-follow');
        controlFollow.addEventListener('click', async () => {
            if (controlFollow.className.includes('following')) {
                try {
                    pageUser.protected && pageUser.follow_request_sent ? await API.cancelFollow(pageUser.screen_name) : await API.unfollowUser(pageUser.screen_name);
                } catch(e) {
                    console.error(e);
                    alert(e);
                    return;
                }
                controlFollow.classList.remove('following');
                controlFollow.classList.add('follow');
                controlFollow.innerText = LOC.follow.message;
                pageUser.following = false;
                document.getElementById("profile-settings-retweets").hidden = true;
                document.getElementById('profile-stat-followers-value').innerText = Number(parseInt(document.getElementById('profile-stat-followers-value').innerText.replace(/\s/g, '').replace(/,/g, '')) - 1).toLocaleString().replace(/\s/g, ',');
                document.getElementById('profile-settings-notifications').hidden = true;
            } else {
                try {
                    await API.followUser(pageUser.screen_name);
                } catch(e) {
                    console.error(e);
                    alert(e);
                    return;
                }
                controlFollow.classList.add('following');
                controlFollow.classList.remove('follow');
                controlFollow.innerText = pageUser.protected ? LOC.follow_request_sent.message : LOC.following_btn.message;
                pageUser.following = true;
                if(!pageUser.protected) {
                    document.getElementById('profile-settings-notifications').hidden = false;
                    document.getElementById("profile-settings-retweets").hidden = false;
                    document.getElementById('profile-stat-followers-value').innerText = Number(parseInt(document.getElementById('profile-stat-followers-value').innerText.replace(/\s/g, '').replace(/,/g, '')) + 1).toLocaleString().replace(/\s/g, ',');
                }
            }
        });
        document.getElementById('profile-settings-retweets').addEventListener('click', async e => {
            if(pageUser.want_retweets) {
                await API.switchRetweetsVisibility(pageUser.id_str, false);
                pageUser.want_retweets = false;
                e.target.innerText = LOC.turn_on_retweets.message;
            } else {
                await API.switchRetweetsVisibility(pageUser.id_str, true);
                pageUser.want_retweets = true;
                e.target.innerText = LOC.turn_off_retweets.message;
            }
        });
        document.getElementById('profile-settings').addEventListener('click', () => {
            document.getElementById('profile-settings-div').hidden = false;
            setTimeout(() => {
                if(clicked) return;
                clicked = true;
                document.addEventListener('click', () => {
                    setTimeout(() => {
                        clicked = false;
                        document.getElementById('profile-settings-div').hidden = true;
                    }, 100);
                }, { once: true });
            }, 100);
        });
        document.getElementById('profile-settings-notifications').addEventListener('click', async () => {
            if(!pageUser.notifications) {
                await API.receiveNotifications(pageUser.id_str, true);
                pageUser.notifications = true;
                document.getElementById('profile-settings-notifications').classList.remove('profile-settings-notifications');
                document.getElementById('profile-settings-notifications').classList.add('profile-settings-offnotifications');
                document.getElementById('profile-settings-notifications').innerText = `Stop getting notifications`;
            } else {
                await API.receiveNotifications(pageUser.id_str, false);
                pageUser.notifications = false;
                document.getElementById('profile-settings-notifications').classList.remove('profile-settings-offnotifications');
                document.getElementById('profile-settings-notifications').classList.add('profile-settings-notifications');
                document.getElementById('profile-settings-notifications').innerText = `Receive notifications`;
            }
        });
        document.getElementById('profile-settings-block').addEventListener('click', async () => {
            if(pageUser.blocking) {
                await API.unblockUser(pageUser.id_str);
                pageUser.blocking = false;
                document.getElementById('profile-settings-block').classList.remove('profile-settings-unblock');
                document.getElementById('profile-settings-block').classList.add('profile-settings-block');
                document.getElementById('profile-settings-block').innerText = `${LOC.block_user.message} @${pageUser.screen_name}`;
                document.getElementById('control-unblock').hidden = true;
                document.getElementById('control-follow').hidden = false;
                document.getElementById('message-user').hidden = !pageUser.can_dm;
                document.getElementById("profile-settings-notifications").hidden = false;
                document.getElementById("profile-settings-mute").hidden = false;
            } else {
                let modal = createModal(`
                <span style='font-size:14px'>${LOC.block_sure.message} @${pageUser.screen_name}?</span>
                    <br><br>
                    <button class="nice-button">${LOC.block.message}</button>
                `)
                modal.getElementsByClassName('nice-button')[0].addEventListener('click', async () => {
                    await API.blockUser(pageUser.id_str);
                    pageUser.blocking = true;
                    document.getElementById('profile-settings-block').classList.add('profile-settings-unblock');
                    document.getElementById('profile-settings-block').classList.remove('profile-settings-block');
                    document.getElementById('profile-settings-block').innerText = `${LOC.unblock_user.message} @${pageUser.screen_name}`;
                    document.getElementById('control-unblock').hidden = false;
                    document.getElementById('control-follow').hidden = true;
                    document.getElementById('message-user').hidden = true;
                    document.getElementById("profile-settings-notifications").hidden = true;
                    document.getElementById("profile-settings-mute").hidden = true;
                    modal.remove();
                });
            }
        });
        document.getElementById('control-unblock').addEventListener('click', async () => {
            if(pageUser.blocking) {
                await API.unblockUser(pageUser.id_str);
                pageUser.blocking = false;
                document.getElementById('profile-settings-block').classList.remove('profile-settings-unblock');
                document.getElementById('profile-settings-block').classList.add('profile-settings-block');
                document.getElementById('profile-settings-block').innerText = `${LOC.block_user.message} @${pageUser.screen_name}`;
                document.getElementById('control-unblock').hidden = true;
                document.getElementById('control-follow').hidden = false;
                document.getElementById("profile-settings-notifications").hidden = false;
                document.getElementById("profile-settings-mute").hidden = false;
                document.getElementById('message-user').hidden = !pageUser.can_dm;
            }
        });
        document.getElementById('profile-settings-autotranslate').addEventListener('click', async () => {
            let autotranslateProfiles = await new Promise(resolve => {
                chrome.storage.sync.get(['autotranslateProfiles'], data => {
                    resolve(data.autotranslateProfiles);
                });
            });
            if(!autotranslateProfiles) {
                autotranslateProfiles = [];
            }
            if(autotranslateProfiles.includes(pageUser.id_str)) {
                autotranslateProfiles.splice(autotranslateProfiles.indexOf(pageUser.id_str), 1);
                document.getElementById('profile-settings-autotranslate').innerText = LOC.dont_autotranslate.message;
                toAutotranslate = false;
            } else {
                autotranslateProfiles.push(pageUser.id_str);
                document.getElementById('profile-settings-autotranslate').innerText = LOC.autotranslate_tweets.message;
                toAutotranslate = true;
            }
            chrome.storage.sync.set({ autotranslateProfiles });
            setTimeout(() => {
                location.reload();
            }, 100)
        });
        document.getElementById('profile-settings-mute').addEventListener('click', async () => {
            if(pageUser.muting) {
                await API.unmuteUser(pageUser.id_str);
                pageUser.muting = false;
                document.getElementById('profile-settings-mute').classList.remove('profile-settings-unmute');
                document.getElementById('profile-settings-mute').classList.add('profile-settings-mute');
                document.getElementById('profile-settings-mute').innerText = LOC.mute.message;
                document.getElementById('profile-name').classList.remove('user-muted');
            } else {
                await API.muteUser(pageUser.id_str);
                pageUser.muting = true;
                document.getElementById('profile-settings-mute').classList.add('profile-settings-unmute');
                document.getElementById('profile-settings-mute').classList.remove('profile-settings-mute');
                document.getElementById('profile-settings-mute').innerText = LOC.unmute.message;
                document.getElementById('profile-name').classList.add('user-muted');
            }
        });
        if(document.getElementById('profile-settings-removefollowing')) document.getElementById('profile-settings-removefollowing').addEventListener('click', async () => {
            let modal = createModal(`
            <span style='font-size:14px'>
            ${LOC.remove_from_followers_sure.message}
            <br>${LOC.able_in_future.message}
            <br><br>
            ${LOC.remove_from_followers_warn.message}
            </span>
                <br><br>
                <button class="nice-button">${LOC.remove_from_followers_button.message}</button>
            `.replace('$SCREEN_NAME$', pageUser.screen_name));
            modal.getElementsByClassName('nice-button')[0].addEventListener('click', async () => {
                await API.removeFollower(pageUser.id_str);
                pageUser.followed_by = false;
                document.getElementById('profile-settings-removefollowing').hidden = true;
                document.getElementById('follows-you').hidden = true;
                modal.remove();
            });
        });
        document.getElementById('profile-settings-lists-action').addEventListener('click', async () => {
            let lists = await API.getListOwnerships(user.id_str, pageUser.id_str);
            let modal = createModal(`
                <h1 class="cool-header">${LOC.from_list.message}</h1>
                <div id="modal-lists"></div>
            `);
            let container = document.getElementById('modal-lists');
            for(let i in lists) {
                let l = lists[i];
                let listElement = document.createElement('div');
                listElement.classList.add('list-item');
                listElement.innerHTML = `
                    <div style="display:inline-block;">
                        <a href="https://twitter.com/i/lists/${l.id_str}" class="following-item-link">
                            <img style="object-fit: cover;" src="${l.custom_banner_media ? l.custom_banner_media.media_info.original_img_url : l.default_banner_media.media_info.original_img_url}" alt="${l.name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                            <div class="following-item-text" style="position: relative;bottom: 12px;">
                                <span class="tweet-header-name following-item-name" style="font-size: 18px;">${escapeHTML(l.name)}</span><br>
                                <span style="color:var(--darker-gray);font-size:14px;margin-top:2px">${l.description ? escapeHTML(l.description).slice(0, 52) : LOC.no_description.message}</span>
                            </div>
                        </a>
                    </div>
                    <div style="display:inline-block;float: right;margin-top: 5px;">
                        <button class="nice-button">${l.is_member ? LOC.remove.message : LOC.add.message}</button>
                    </div>
                `;
                container.appendChild(listElement);
                listElement.getElementsByClassName('nice-button')[0].addEventListener('click', async () => {
                    if(l.is_member) {
                        await API.listRemoveMember(l.id_str, pageUser.id_str);
                        l.is_member = false;
                        listElement.getElementsByClassName('nice-button')[0].innerText = LOC.add.message;
                    } else {
                        await API.listAddMember(l.id_str, pageUser.id_str);
                        l.is_member = true;
                        listElement.getElementsByClassName('nice-button')[0].innerText = LOC.remove.message;
                    }
                    l.is_member = !l.is_member;
                });
            }
        });
        document.getElementById('profile-settings-lists').addEventListener('mousedown', e => {
            if(e.button === 1) {
                openInNewTab(`https://twitter.com/${pageUser.screen_name}/lists`);
            }
        });
        document.getElementById('profile-settings-lists').addEventListener('click', async () => {
            // document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `https://twitter.com/${pageUser.screen_name}/lists`);
            everAddedAdditional = false;
            mediaToUpload = [];
            document.getElementById('profile-media-div').innerHTML = '';
            document.getElementById('tweet-to-bg').hidden = true;
            document.getElementById('profile-additional').innerHTML = '';
            document.getElementById('profile-friends-div').innerHTML = '';
            updateSubpage();
            updateSelection();
            renderLists();
        });
        document.getElementById('profile-settings-share').addEventListener('click', async () => {
            navigator.share({ url: `https://twitter.com/${pageUser.screen_name}` });
        });
        document.getElementById('profile-settings-copy').addEventListener('click', async () => {
            navigator.clipboard.writeText(`https://twitter.com/${pageUser.screen_name}`);
        });
    }

    let links = Array.from(document.getElementById('profile-bio').getElementsByTagName('a'));
    links.forEach(link => {
        let realLink = pageUser.entities.description.urls.find(u => u.url === link.href);
        if (realLink) {
            link.href = realLink.expanded_url;
            if(!link.href.startsWith('https://twitter.com/')) link.target = '_blank';
            link.innerText = realLink.display_url;
        }
    });

    if(everAddedAdditional) return;
    everAddedAdditional = true;
    let additionalInfo = document.getElementById('profile-additional');
    if(pageUser.location) {
        let location = document.createElement('span');
        location.classList.add('profile-additional-thing', 'profile-additional-location');
        location.innerText = pageUser.location.replace(/\n\n\n\n/g, "\n");
        additionalInfo.appendChild(location);
        if(vars.enableTwemoji) twemoji.parse(location);
    }
    if(pageUser.url) {
        let url = document.createElement('a');
        url.classList.add('profile-additional-thing', 'profile-additional-url');
        let realUrl = pageUser.entities.url.urls[0];
        url.innerText = realUrl.display_url;
        url.href = realUrl.expanded_url;
        if(!url.href.startsWith('https://twitter.com/')) url.target = "_blank";
        additionalInfo.appendChild(url);
    }
    if(pageUser.professional && pageUser.professional.category && pageUser.professional.category[0]) {
        let prof = document.createElement('span');
        prof.classList.add('profile-additional-thing', 'profile-additional-professional');
        prof.innerText = pageUser.professional.category[0].name;
        additionalInfo.appendChild(prof);
        if(vars.enableTwemoji) twemoji.parse(prof);
    }
    let joined = document.createElement('span');
    joined.classList.add('profile-additional-thing', 'profile-additional-joined');
    joined.innerText = `${LOC.joined.message} ${new Date(pageUser.created_at).toLocaleDateString(LANGUAGE, {month: 'long', year: 'numeric', day: 'numeric'})}`;
    additionalInfo.appendChild(joined);
    if(pageUser.birthdate) {
        let birth = document.createElement('span');
        birth.classList.add('profile-additional-thing', 'profile-additional-birth');
        if(user.id_str === pageUser.id_str) {
            birth.classList.add('profile-additional-birth-me');
        }
        if(pageUser.birthdate.year && typeof pageUser.birthdate.month === 'number') {
            birth.innerText = `${LOC.born.message} ${months[pageUser.birthdate.month-1].replace("$NUMBER$", pageUser.birthdate.day)}, ${pageUser.birthdate.year}`;
        } else if(typeof pageUser.birthdate.month === 'number') {
            birth.innerText = `${LOC.born.message} ${months[pageUser.birthdate.month-1].replace("$NUMBER$", pageUser.birthdate.day)}`;
        } else if(pageUser.birthdate.year) {
            birth.innerText = `${LOC.born.message} ${pageUser.birthdate.year}`;
        }
        let date = new Date();
        if(pageUser.birthdate.month-1 === date.getMonth() && pageUser.birthdate.day === date.getDate()) {
            birth.innerText += ' ' + LOC.birthday_today.message;
            birth.classList.add('profile-additional-birth-today');
        }
        additionalInfo.appendChild(birth);
    }

    document.getElementById('loading-box').hidden = true;
};

async function renderTimeline(append = false, sliceAmount = 0) {
    let timelineContainer = document.getElementById('timeline');
    if(!append) timelineContainer.innerHTML = '';
    let data = timeline.data.slice(sliceAmount, timeline.data.length);;
    if(pinnedTweet && subpage === "profile" && !append) await appendTweet(pinnedTweet, timelineContainer, {
        top: {
            text: LOC.pinned_tweet.message,
            icon: "\uf003",
            color: "var(--link-color)",
            class: 'pinned'
        },
        bigFont: false
    })
    for(let i in data) {
        let t = data[i];
        if(pinnedTweet && t.id_str === pinnedTweet.id_str) continue;
        if (t.retweeted_status) {
            if(pageUser.id_str === user.id_str) t.retweeted_status.current_user_retweet = t;
            await appendTweet(t.retweeted_status, timelineContainer, {
                top: {
                    text: `<a href="https://twitter.com/${t.user.screen_name}">${escapeHTML(t.user.name)}</a> ${LOC.retweeted.message}`,
                    icon: "\uf006",
                    color: "#77b255",
                    class: 'retweet'
                }
            });
        } else {
            if (t.self_thread) {
                let selfThreadTweet = timeline.data.find(tweet => tweet.id_str === t.self_thread.id_str);
                if (selfThreadTweet && selfThreadTweet.id_str !== t.id_str && seenThreads.indexOf(selfThreadTweet.id_str) === -1) {
                    await appendTweet(selfThreadTweet, timelineContainer, {
                        selfThreadContinuation: true,
                        bigFont: selfThreadTweet.favorite_count > averageLikeCount*1.2 && selfThreadTweet.favorite_count > 3
                    });
                    await appendTweet(t, timelineContainer, {
                        noTop: true,
                        bigFont: t.favorite_count > averageLikeCount*1.2 && t.favorite_count > 3
                    });
                    seenThreads.push(selfThreadTweet.id_str);
                } else {
                    await appendTweet(t, timelineContainer, {
                        selfThreadButton: true,
                        bigFont: t.favorite_count > averageLikeCount*1.2 && t.favorite_count > 3
                    });
                }
            } else {
                await appendTweet(t, timelineContainer, {
                    bigFont: t.favorite_count > averageLikeCount*1.2 && t.favorite_count > 3
                });
            }
        }
    };
    document.getElementById('loading-box').hidden = true;
    loadingNewTweets = false;
    return true;
}
function renderNewTweetsButton() {
    if (timeline.toBeUpdated > 0) {
        document.getElementById('new-tweets').hidden = false;
        document.getElementById('new-tweets').innerText = LOC.see_new_tweets.message;
    } else {
        document.getElementById('new-tweets').hidden = true;
    }
}

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
let loadingNewTweets = true;
let lastTweetDate = 0;
let activeTweet;
let tweetsToLoad = {};
let lastScroll = Date.now();
let loadingFollowing = false;
let loadingFollowers = false;
let loadingFollowersYouKnow = false;
let followingMoreBtn, followersMoreBtn, followersYouFollowMoreBtn;

setTimeout(async () => {
    if(!vars) {
        await loadVars();
    }
    while(!LOC || !LOC.january) {
        await sleep(10);
    }
    months = [LOC.january.message, LOC.february.message, LOC.march.message, LOC.april.message, LOC.may.message, LOC.june.message, LOC.july.message, LOC.august.message, LOC.september.message, LOC.october.message, LOC.november.message, LOC.december.message];
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
                        let tweetReply = activeTweet.getElementsByClassName('tweet-reply')[0];
                        tweetReply.hidden = true;
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
                        let tweetReply = activeTweet.getElementsByClassName('tweet-quote')[0];
                        tweetReply.hidden = true;
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
            if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'EMOJI-PICKER') return;
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
                if(!activeTweet) return;
                e.preventDefault();
                e.stopImmediatePropagation();
                activeTweet.click();
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

    // weird bug
    if(!document.getElementById('new-tweets')) {
        return setTimeout(() => location.reload(), 500);
    }
    try {
        document.getElementById('new-tweets').addEventListener('click', () => {
            timeline.toBeUpdated = 0;
            timeline.data = timeline.dataToUpdate;
            timeline.dataToUpdate = [];
            renderNewTweetsButton();
            renderTimeline();
        });
    } catch(e) {
        setTimeout(() => location.reload(), 500);
        console.error(e);
        return;
    }

    // mouse
    let banner = document.getElementById('profile-banner');
    let navProfileInfo = document.getElementById('nav-profile-info');
    document.addEventListener('scroll', async () => {
        lastScroll = Date.now();
        // find active tweet by scroll amount
        if(Date.now() - lastTweetDate > 50) {
            lastTweetDate = Date.now();
            let tweets = Array.from(document.getElementsByClassName('tweet'));

            let scrollPoint = scrollY + innerHeight/2;
            let newActiveTweet = tweets.find(t => scrollPoint > t.offsetTop && scrollPoint < t.offsetTop + t.offsetHeight);
            if(!activeTweet || (newActiveTweet && !activeTweet.className.startsWith(newActiveTweet.className))) {
                if(activeTweet) {
                    activeTweet.classList.remove('tweet-active');
                }
                if(newActiveTweet) newActiveTweet.classList.add('tweet-active');
                if(vars.autoplayVideos && !document.getElementsByClassName('modal')[0]) {
                    if(activeTweet) {
                        let video = activeTweet.querySelector('.tweet-media > video[controls]');
                        if(video) {
                            video.pause();
                        }
                    }
                    if(newActiveTweet) {
                        let newVideo = newActiveTweet.querySelector('.tweet-media > video[controls]');
                        if(newVideo && !newVideo.ended) {
                            newVideo.play();
                        }
                    }
                }
                activeTweet = newActiveTweet;
            }
        }

        // make user nav appear
        if(window.scrollY >= 600) {
            if(!navProfileInfo.style.opacity) {
                navProfileInfo.style.opacity = 1;
            }
        } else {
            if(navProfileInfo.style.opacity) {
                navProfileInfo.style.opacity = '';
            }
        }
        
        // banner scroll
        banner.style.top = `${5+Math.min(window.scrollY/4, 470/4)}px`;
    
        // load more stuff
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            if(subpage === 'following') {
                if(!loadingFollowing) followingMoreBtn.click();
                return;
            }
            if(subpage === 'followers') {
                if(!loadingFollowers) followersMoreBtn.click();
                return;
            }
            if(subpage === 'followers_you_follow') {
                if(!loadingFollowersYouKnow) followersYouFollowMoreBtn.click();
                return;
            }
            if (loadingNewTweets || timeline.data.length === 0 || stopLoad) return;
            loadingNewTweets = true;
            let tl;
            try {
                if(subpage === "likes") {
                    let data = await API.getFavorites(pageUser.id_str, favoritesCursor);
                    tl = data.tl;
                    favoritesCursor = data.cursor;
                } else {
                    if(subpage === 'media') {
                        tl = await API.getUserMediaTweets(pageUser.id_str, mediaCursor);
                        mediaCursor = tl.cursor;
                        tl = tl.tweets;
                    } else {
                        tl = await API.getUserTweets(pageUser.id_str, timeline.data[timeline.data.length - 1].id_str, subpage !== 'profile');
                        tl = tl.slice(1);
                    }
                }
            } catch (e) {
                console.error(e);
                loadingNewTweets = false;
                return;
            }
            let originalLength = timeline.data.length;
            timeline.data = timeline.data.concat(tl);
            averageLikeCount = timeline.data.filter(t => !t.retweeted_status).map(t => t.favorite_count).sort((a, b) => a - b)[Math.floor(timeline.data.length/2)];
            if(previousLastTweet && previousLastTweet.id_str === timeline.data[timeline.data.length - 1].id_str) return stopLoad = true;
            previousLastTweet = timeline.data[timeline.data.length - 1];
            await renderTimeline(true, originalLength);
        }
    }, { passive: true });
    document.addEventListener('mousemove', e => {
        if(Date.now() - lastScroll > 10) {
            let t = e.target;
            if(t.className.includes('tweet ') || t.className === 'tweet-interact' || t.className === 'tweet-body' || t.className === 'tweet-media') {
                if(t.className === 'tweet-interact' || t.className === 'tweet-media') t = t.parentElement.parentElement;
                else if(t.className === 'tweet-body') t = t.parentElement;
                let id = t.className.split('id-')[1];
                if(!id) return;
                id = id.split(' ')[0];
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

    // buttons
    document.getElementById('tweet-to').addEventListener('click', () => {
        document.getElementById('navbar-tweet-button').click();
        setTimeout(() => {
            document.getElementsByClassName('navbar-new-tweet-text')[0].value = `@${pageUser.screen_name} `;
        }, 10);
    });
    let tweetNavMoreMenu = document.getElementById('tweet-nav-more-menu');
    let tweetNavClicked = false;
    document.getElementById('tweet-nav-more').addEventListener('click', () => {
        if (tweetNavMoreMenu.hidden) {
            tweetNavMoreMenu.hidden = false;
        }
        if(tweetNavClicked) return;
        tweetNavClicked = true;
        setTimeout(() => {
            function closeMenu(e) {
                if(e.target.closest('#tweet-nav-more-menu')) {
                    return;
                }
                tweetNavClicked = false;
                setTimeout(() => tweetNavMoreMenu.hidden = true, 50);
                document.body.removeEventListener('click', closeMenu);
            }
            document.body.addEventListener('click', closeMenu);
        }, 50);
    });
    document.getElementById('tweet-nav-more-menu-hr').addEventListener('change', e => {
        if(e.target.checked) {
            document.getElementById('style-hide-retweets').innerHTML = `.tweet-top-retweet { display: none !important; }`;
        } else {
            document.getElementById('style-hide-retweets').innerHTML = '';
        }
    });
    document.getElementById('wtf-refresh').addEventListener('click', async () => {
        renderDiscovery(false);
    });
    followingMoreBtn = document.getElementById('following-more');
    followingMoreBtn.addEventListener('click', async e => {
        if(!followingCursor || loadingFollowing) return;
        e.target.innerText = LOC.loading.message;
        renderFollowing(false, followingCursor);
    });
    followersMoreBtn = document.getElementById('followers-more');
    followersMoreBtn.addEventListener('click', async e => {
        if(!followersCursor || loadingFollowers) return;
        e.target.innerText = LOC.loading.message;
        renderFollowers(false, followersCursor);
    });
    followersYouFollowMoreBtn = document.getElementById('followers_you_follow-more');
    followersYouFollowMoreBtn.addEventListener('click', async e => {
        if(!followersYouKnowCursor || loadingFollowersYouKnow) return;
        e.target.innerText = LOC.loading.message;
        renderFollowersYouFollow(false, followersYouKnowCursor);
    });
    function updatePath(e) {
        if(e.target.closest('.tweet-nav-active') || e.target.classList.contains('profile-stat-active') || e.target.closest('.profile-stat-disabled')) {
            return e.preventDefault();
        }
        e.preventDefault();
        let el = e.target;
        if(!el) return;
        if(!el.href) el = el.parentElement;
        history.pushState({}, null, el.href);
        updateSubpage();
        updateSelection();
        timeline = {
            data: [],
            dataToUpdate: [],
            toBeUpdated: 0
        }
        seenThreads = [];
        pinnedTweet = undefined;
        favoritesCursor = undefined;
        followersCursor = undefined;
        followingCursor = undefined;
        followersYouKnowCursor = undefined;
        mediaCursor = undefined;
        if(subpage === 'following') {
            renderFollowing();
        } else if(subpage === 'followers') {
            renderFollowers();
        } else if(subpage === 'followers_you_follow') {
            renderFollowersYouFollow();
        } else if(subpage === 'lists') {
            renderLists();
        } else {
            updateTimeline();
        }
    }
    document.getElementById('tweet-nav-tweets').addEventListener('click', updatePath);
    document.getElementById('tweet-nav-replies').addEventListener('click', updatePath);
    document.getElementById('tweet-nav-media').addEventListener('click', updatePath);
    if(document.getElementById('profile-media-text')) document.getElementById('profile-media-text').addEventListener('click', updatePath);
    document.getElementById('profile-stat-tweets-link').addEventListener('click', updatePath);
    document.getElementById('profile-stat-following-link').addEventListener('click', updatePath);
    document.getElementById('profile-stat-followers-link').addEventListener('click', updatePath);
    document.getElementById('profile-stat-favorites-link').addEventListener('click', updatePath);
    document.getElementById('profile-friends-text').addEventListener('click', updatePath);
    document.addEventListener('click', async e => {
        let el = e.target;
        if(!el) return;
        if(el.tagName !== 'A') el = el.closest('a');
        if(!el) return;
        if(el.tagName === "A") {
            let path;
            try {
                let url = new URL(el.href);
                path = url.pathname;
                if(url.hostname !== 'twitter.com') return;
            } catch(e) {
                return;
            }
            if(/^\/[A-z-0-9-_]{1,15}$/.test(path) && ["/home", "/", "/notifications", "/messages", "/settings", "/search", "/explore", "/login", "/register", "/logout"].indexOf(path) === -1) {
                if(document.querySelector(".modal")) return;
                e.preventDefault();
                window.scrollTo(0, 0);
                mediaToUpload = [];
                document.getElementById('loading-box').hidden = false;
                everAddedAdditional = false;
                document.getElementById('timeline').innerHTML = `<span style="color:var(--darker-gray);margin-top:10px;display:block">${LOC.loading_tweets.message}</span>`;
                document.getElementById('profile-media-div').innerHTML = '';
                document.getElementById('tweet-to-bg').hidden = true;
                document.getElementById('profile-additional').innerHTML = '';
                document.getElementById('profile-friends-div').innerHTML = '';
                history.pushState({}, null, `https://twitter.com/${path.substring(1)}`);
                updateSubpage();
                updateSelection();
                await updateUserData();
                updateTimeline();
                renderDiscovery();
            }
        }
    });
    window.addEventListener("popstate", async () => {
        if(document.querySelector('.tweet-viewer')) return;
        let path = location.pathname;
        if(path.endsWith("/")) path = path.substring(0, path.length - 1);
        if(isProfilePath(path) || (path.split('/').length === 3 && location.pathname.endsWith('/following') || location.pathname.endsWith('/followers') || location.pathname.endsWith('/followers_you_follow') || location.pathname.endsWith('/lists') || location.pathname.endsWith('/media') || location.pathname.endsWith('/likes') || location.pathname.endsWith('/with_replies'))) {
            document.getElementById('loading-box').hidden = false;
            everAddedAdditional = false;
            mediaToUpload = [];
            document.getElementById('profile-media-div').innerHTML = '';
            document.getElementById('tweet-to-bg').hidden = true;
            document.getElementById('profile-additional').innerHTML = '';
            document.getElementById('profile-friends-div').innerHTML = '';
            updateSubpage();
            updateSelection();
            document.getElementById('timeline').innerHTML = '';
            await updateUserData();
            updateTimeline();
            renderDiscovery();
        }
    });

    document.getElementById('user-search-input').addEventListener('keydown', e => {
        if(e.key === 'Enter') {
            document.getElementById('user-search-icon').click();
        }
    });
    document.getElementById('user-search-icon').addEventListener("click", () => {
        document.getElementById('search-input').value = document.getElementById('user-search-input').value + ` from:${pageUser.screen_name}`;
        document.getElementById('search-icon').click();
    })

    let mediaDiv = document.getElementById('profile-media-div');
    let mediaText = document.getElementById('profile-media-text');
    let mediaObserver = new MutationObserver(() => {
        mediaText.hidden = mediaDiv.childElementCount === 0;
    })
    mediaObserver.observe(mediaDiv, {
        childList: true
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
    
    // Custom events
    document.addEventListener('newTweet', e => {
        if(pageUser.id_str === user.id_str) {
            let tweet = e.detail;
            if(pinnedTweet) {
                let firstTweet = document.getElementById('timeline').firstChild;
                appendTweet(tweet, document.getElementById('timeline'), { after: firstTweet, disableAfterReplyCounter: true, bigFont: tweet.favorite_count > averageLikeCount*1.2 && tweet.favorite_count > 3 });
            } else {
                appendTweet(tweet, document.getElementById('timeline'), { prepend: true, bigFont: tweet.favorite_count > averageLikeCount*1.2 && tweet.favorite_count > 3 });
            }
        }
    });

    // Run
    updateSubpage();
    await updateUserData();
    if(subpage !== 'following' && subpage !== 'followers' && subpage !== 'followers_you_follow' && subpage !== 'lists') updateTimeline();
    else if(subpage === 'following') {
        renderFollowing();
    } else if(subpage === 'followers') {
        renderFollowers();
    } else  if(subpage === 'followers_you_follow') {
        renderFollowersYouFollow();
    } else  if(subpage === 'lists') {
        renderLists();
    }
    if(location.hash === "#dm") {
        setTimeout(() => {
            let event = new CustomEvent('messageUser', { detail: { id: `${user.id_str}-${pageUser.id_str}`, user: pageUser } });
            document.dispatchEvent(event);
            location.hash = "";
        }, 1000);
    }
    renderDiscovery();
    renderTrends(true);
    setInterval(() => renderDiscovery(false), 60000 * 5);
    setInterval(() => renderTrends(true), 60000 * 5);
}, 50);