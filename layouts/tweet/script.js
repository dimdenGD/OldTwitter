let user = {};
let mediaToUpload = [];
let linkColors = {};
let cursor, likeCursor, retweetCursor, retweetCommentsCursor;
let seenReplies = [];
let mainTweetLikers = [];
let pageData = {};
let tweets = [];
let currentLocation = location.pathname;
let users = {};
let excludeUserMentions = [];
let insertedMores = [];

// Util

function savePageData(path) {
    if(!path) {
        path = location.pathname.split('?')[0].split('#')[0];
        if(path.endsWith('/')) path = path.slice(0, -1);
    }
    pageData[path] = {
        linkColors, cursor, likeCursor, retweetCursor, retweetCommentsCursor, mainTweetLikers, seenReplies,
        tweets,
        scrollY
    }
    console.log(`Saving page: ${path}`, pageData[path]);
}
async function restorePageData() {
    let path = location.pathname.split('?')[0].split('#')[0];
    if(path.endsWith('/')) path = path.slice(0, -1);
    if(pageData[path]) {
        console.log(`Restoring page: ${path}`, pageData[path]);
        linkColors = pageData[path].linkColors;
        cursor = pageData[path].cursor;
        likeCursor = pageData[path].likeCursor;
        retweetCursor = pageData[path].retweetCursor;
        retweetCommentsCursor = pageData[path].retweetCommentsCursor;
        mainTweetLikers = pageData[path].mainTweetLikers;
        seenReplies = [];
        tweets = [];
        let tl = document.getElementById('timeline');
        tl.innerHTML = '';
        for(let i in pageData[path].tweets) {
            let t = pageData[path].tweets[i];
            if(t[0] === 'tweet') {
                await appendTweet(t[1], tl, t[2]);
            } else if(t[0] === 'compose') {
                await appendComposeComponent(tl, t[1]);
            } else if(t[0] === 'tombstone') {
                await appendTombstone(tl, t[1], t[2]);
            } else if(t[0] === 'showmore') {
                await appendShowMore(tl, t[1], t[2]);
            }
        }
        let id = currentLocation.match(/status\/(\d{1,32})/)[1];
        if(id) {
            setTimeout(() => {
                let tweet = document.querySelector(`div.tweet[data-tweet-id="${id}"]`)[0];
                if(tweet) {
                    tweet.scrollIntoView({ block: 'center' });
                }
                document.getElementById('loading-box').hidden = true;
            }, 100);
        } else {
            document.getElementById('loading-box').hidden = true;
        }
        loadingNewTweets = false;
        return true;
    } else {
        tweets = [];
        seenReplies = [];
    }
    loadingNewTweets = false;
    return false;
}

let subpage;
function updateSubpage() {
    let path = location.pathname.slice(1);
    if(path.endsWith('/')) path = path.slice(0, -1);

    let tlDiv = document.getElementById('timeline');
    let rtDiv = document.getElementById('retweets');
    let rtwDiv = document.getElementById('retweets_with_comments');
    let likesDiv = document.getElementById('likes');
    let rtMore = document.getElementById('retweets-more');
    let rtwMore = document.getElementById('retweets_with_comments-more');
    let likesMore = document.getElementById('likes-more');
    tlDiv.hidden = true; rtDiv.hidden = true; rtwDiv.hidden = true; likesDiv.hidden = true;
    rtMore.hidden = true; rtwMore.hidden = true; likesMore.hidden = true;
    mediaToUpload = [];
    insertedMores = [];

    if(path.split('/').length === 3) {
        subpage = 'tweet';
        tlDiv.hidden = false;
    } else {
        if(path.endsWith('/retweets')) {
            subpage = 'retweets';
            rtDiv.hidden = false;
        } else if(path.endsWith('/likes')) {
            subpage = 'likes';
            likesDiv.hidden = false;
        } else if(path.endsWith('/retweets/with_comments')) {
            subpage = 'retweets_with_comments';
            rtwDiv.hidden = false;
        }
    }
}

function updateUserData() {
    API.account.verifyCredentials().then(u => {
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
async function updateReplies(id, c) {
    if(!c) document.getElementById('timeline').innerHTML = '';
    let tl, tweetLikers;
    try {
        let [tlData, tweetLikersData] = await Promise.allSettled([API.tweet.getRepliesV2(id, c), API.tweet.getLikers(id)]);
        if(!tlData.value) {
            cursor = undefined;
            console.error(tlData.reason);
            appendTombstone(document.getElementById('timeline'), tlData.reason);
            document.getElementById('loading-box').hidden = true;
            return;
        }
        if(!tweetLikersData.value) {
            console.error(tweetLikersData.reason);
        }
        tl = tlData.value;
        if(tweetLikersData.value) tweetLikers = tweetLikersData.value;
        else tweetLikers = { list: [], cursor: undefined };
        loadingNewTweets = false;
    } catch(e) {
        loadingNewTweets = false;
        return cursor = undefined;
    }
    for(let u in tl.users) {
        users[u] = tl.users[u];
    };

    if(vars.slowLinkColorsInTL) {
        let tlUsers = [];
        for(let i in tl.list) {
            let t = tl.list[i];
            if(t.type === 'tweet' || t.type === 'mainTweet') { if(!tlUsers.includes(t.data.user.id_str)) tlUsers.push(t.data.user.id_str); }
            else if(t.type === 'conversation') {
                for(let j in t.data) {
                    tlUsers.push(t.data[j].user.id_str);
                }
            }
        }
        tlUsers = tlUsers.filter(i => !linkColors[i]);
        let linkData = await getLinkColors(tlUsers);
        if(linkData) for(let i in linkData) {
            linkColors[linkData[i].id] = linkData[i].color;
        }
    }

    cursor = tl.cursor;
    let mainTweet;
    let mainTweetIndex = tl.list.findIndex(t => t.type === 'mainTweet');
    let tlContainer = document.getElementById('timeline');
    for(let i in tl.list) {
        let t = tl.list[i];
        if(t.type === 'mainTweet') {
            mainTweetLikers = tweetLikers.list;
            likeCursor = tweetLikers.cursor;
            document.getElementsByTagName('title')[0].innerText = `${t.data.user.name} on Twitter: "${t.data.full_text.slice(0, 100)}"`;
            if(i === 0) {
                mainTweet = await appendTweet(t.data, tlContainer, {
                    mainTweet: true,
                    bigFont: true
                });
            } else {
                mainTweet = await appendTweet(t.data, tlContainer, {
                    noTop: true,
                    mainTweet: true,
                    bigFont: true
                });
            }
            if(t.data.limited_actions !== "non_compliant") appendComposeComponent(tlContainer, t.data);
        }
        if(t.type === 'tweet') {
            await appendTweet(t.data, tlContainer, {
                noTop: i !== 0 && i < mainTweetIndex,
                threadContinuation: i < mainTweetIndex
            });
        } else if(t.type === 'conversation') {
            for(let i2 in t.data) {
                let t2 = t.data[i2];
                await appendTweet(t2, tlContainer, {
                    noTop: +i2 !== 0,
                    threadContinuation: +i2 !== t.data.length - 1,
                    threadButton: +i2 === t.data.length - 1,
                    threadId: t2.conversation_id_str
                });
            }
        } else if(t.type === 'tombstone') {
            appendTombstone(tlContainer, t.data, t.replyTweet);
        } else if(t.type === 'showMore') {
            appendShowMore(tlContainer, t.data, id);
        }
    }
    if(mainTweet) mainTweet.scrollIntoView();
    document.getElementById('loading-box').hidden = true;
    return true;
}
async function updateLikes(id, c) {
    let tweetLikers;
    if(!c && mainTweetLikers.length > 0) {
        tweetLikers = mainTweetLikers;
    } else {
        try {
            tweetLikers = await API.tweet.getLikers(id, c);
            likeCursor = tweetLikers.cursor;
            tweetLikers = tweetLikers.list;
            if(!c) mainTweetLikers = tweetLikers;
        } catch(e) {
            console.error(e);
            return likeCursor = undefined;
        }
    }
    let likeDiv = document.getElementById('likes');

    if(!c) {
        likeDiv.innerHTML = '';
        let tweet = await appendTweet(await API.tweet.getV2(id), likeDiv, { //th line
            mainTweet: true
        });
        tweet.style.borderBottom = '1px solid var(--border)';
        tweet.style.marginBottom = '10px';
        tweet.style.borderRadius = '5px';
        let h1 = document.createElement('h1');
        h1.innerText = LOC.liked_by.message;
        h1.className = 'cool-header';
        likeDiv.appendChild(h1);
    }

    if(!likeCursor || tweetLikers.length === 0) {
        document.getElementById("likes-more").hidden = true;
    } else {
        document.getElementById("likes-more").hidden = false;
    }

    for(let i in tweetLikers) {
        appendUser(tweetLikers[i], likeDiv);
    }
    if(!likeCursor || tweetLikers.length === 0) {
        document.getElementById('likes-more').hidden = true;
    } else {
        document.getElementById('likes-more').hidden = false;
    }
    document.getElementById('loading-box').hidden = true;
    loadingNewTweets = false;
}
async function updateRetweets(id, c) {
    let tweetRetweeters;
    try {
        tweetRetweeters = await API.tweet.getRetweeters(id, c);
        retweetCursor = tweetRetweeters.cursor;
        tweetRetweeters = tweetRetweeters.list;
    } catch(e) {
        console.error(e);
        return retweetCursor = undefined;
    }
    let retweetDiv = document.getElementById('retweets');

    if(!c) {
        retweetDiv.innerHTML = '';
        let tweetData = await API.tweet.getV2(id);
        let tweet = await appendTweet(tweetData, retweetDiv, {
            mainTweet: true
        });
        tweet.style.borderBottom = '1px solid var(--border)';
        tweet.style.marginBottom = '10px';
        tweet.style.borderRadius = '5px';
        let h1 = document.createElement('h1');
        h1.innerHTML = html`${LOC.retweeted_by.message} (<a href="/aabehhh/status/${id}/retweets/with_comments">${LOC.see_quotes.message}</a>)`;
        h1.className = 'cool-header';
        retweetDiv.appendChild(h1);
    }
    if(!retweetCursor || tweetRetweeters.length === 0) {
        document.getElementById('retweets-more').hidden = true;
    } else {
        document.getElementById('retweets-more').hidden = false;
    }

    for(let i in tweetRetweeters) {
        let u = tweetRetweeters[i];
        let retweetElement = document.createElement('div');
        retweetElement.classList.add('following-item');
        retweetElement.innerHTML = html`
        <div>
            <a href="/${u.screen_name}" class="following-item-link">
                <img src="${(u.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(u.id_str) % 7}_normal.png`): u.profile_image_url_https}" alt="${u.screen_name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                <div class="following-item-text">
                    <span class="tweet-header-name following-item-name">${escapeHTML(u.name)}</span><br>
                    <span class="tweet-header-handle">@${u.screen_name}</span>
                    ${u.followed_by ? `<span class="follows-you-label">${LOC.follows_you.message}</span>` : ''}
                </div>
            </a>
        </div>
        <div>
            <button class="following-item-btn nice-button ${u.following ? 'following' : 'follow'}">${u.following ? LOC.following_btn.message : LOC.follow.message}</button>
        </div>`;

        let followButton = retweetElement.querySelector('.following-item-btn');
        followButton.addEventListener('click', async () => {
            if (followButton.classList.contains('following')) {
                await API.user.unfollow(u.screen_name);
                followButton.classList.remove('following');
                followButton.classList.add('follow');
                followButton.innerText = LOC.follow.message;
            } else {
                await API.user.follow(u.screen_name);
                followButton.classList.remove('follow');
                followButton.classList.add('following');
                followButton.innerText = LOC.following_btn.message;
            }
        });

        retweetDiv.appendChild(retweetElement);
    }
    document.getElementById('loading-box').hidden = true;
}
async function updateRetweetsWithComments(id, c) {
    let tweetRetweeters;
    try {
        tweetRetweeters = await API.tweet.getQuotes(id, c);
        retweetCommentsCursor = tweetRetweeters.cursor;
        tweetRetweeters = tweetRetweeters.list;
    } catch(e) {
        console.error(e);
        return retweetCommentsCursor = undefined;
    }
    let retweetDiv = document.getElementById('retweets_with_comments');

    if(!c) {
        let t = await API.tweet.getV2(id);
        retweetDiv.innerHTML = '';
        let h1 = document.createElement('h1');
        h1.innerHTML = html`${LOC.quote_tweets.message} (<a href="/aabehhh/status/${id}/retweets">${LOC.see_retweets.message}</a>)`;
        h1.className = 'cool-header';
        retweetDiv.appendChild(h1);
    }
    if(!retweetCommentsCursor || tweetRetweeters.length === 0) {
        document.getElementById('retweets_with_comments-more').hidden = true;
    } else {
        document.getElementById('retweets_with_comments-more').hidden = false;
    }
    document.getElementById('retweets_with_comments-more').innerText = LOC.load_more.message;

    for(let i in tweetRetweeters) {
        await appendTweet(tweetRetweeters[i], retweetDiv);
    }
    document.getElementById('loading-box').hidden = true;
}

// Render
function renderUserData() {
    document.getElementById('user-name').innerText = user.name;
    document.getElementById('user-name').classList.toggle('user-verified', user.verified);
    document.getElementById('user-name').classList.toggle('user-protected', user.protected);

    document.getElementById('user-handle').innerText = `@${user.screen_name}`;
    document.getElementById('user-tweets-div').href = `/${user.screen_name}`;
    document.getElementById('user-following-div').href = `/${user.screen_name}/following`;
    document.getElementById('user-followers-div').href = `/${user.screen_name}/followers`;
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
}

async function appendComposeComponent(container, replyTweet) {
    if(!replyTweet) return;
    if(!user || !user.screen_name) {
        while(!user || !user.screen_name) {
            await sleep(50);
        }
    }
    tweets.push(['compose', replyTweet]);
    let el = document.createElement('div');
    el.className = 'new-tweet-container';

    let mentions = replyTweet.full_text.match(/@([\w+]{1,15})/g);
    if(mentions) {
        mentions = mentions.map(m => m.slice(1).trim());
    } else {
        mentions = [];
    }

    let replyMessage;
    if(LOC.reply_to.message.includes("$SCREEN_NAME$")) {
        replyMessage = LOC.reply_to.message.replace("$SCREEN_NAME$", replyTweet.user.screen_name);
    } else {
        replyMessage = `${LOC.reply_to.message} @${replyTweet.user.screen_name}`;
    }

    el.innerHTML = html`
        <div id="new-tweet" class="box">
            <img width="35" height="35" class="tweet-avatar" id="new-tweet-avatar">
            <span id="new-tweet-char" hidden>${localStorage.OTisBlueVerified ? '0' : '0/280'}</span>
            <textarea id="new-tweet-text" placeholder="${replyMessage}" maxlength="25000"></textarea>
            <div id="new-tweet-user-search" class="box" hidden></div>
            <div id="new-tweet-media-div" title="${LOC.add_media.message}">
                <span id="new-tweet-media"></span>
            </div>
            <div id="new-tweet-focused" hidden>
                <span id="new-tweet-emojis" title="${LOC.emoji.message}"></span>
                ${mentions.length > 0 ? html`<span id="new-tweet-mentions" title="${LOC.mentions.message}"></span>` : ''}
                <div id="new-tweet-media-cc"><div id="new-tweet-media-c"></div></div>
                <button id="new-tweet-button" class="nice-button">${LOC.tweet.message}</button>
                <br><br>
            </div>
        </div>`;
    container.append(el);
    document.getElementById('new-tweet-avatar').src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`.replace("_normal", "_bigger");
    document.getElementById('new-tweet').addEventListener('click', async () => {
        document.getElementById('new-tweet-focused').hidden = false;
        document.getElementById('new-tweet-char').hidden = false;
        document.getElementById('new-tweet-text').classList.add('new-tweet-text-focused');
        document.getElementById('new-tweet-media-div').classList.add('new-tweet-media-div-focused');
    });
    if(mentions.length > 0) {
        document.getElementById('new-tweet-button').style = 'left: 53px';
        document.getElementById("new-tweet-mentions").addEventListener('click', async () => {
            for(let i = 0; i < mentions.length; i++) {
                let u = Object.values(users).find(u => u.screen_name === mentions[i]);
                if(!u) {
                    if(mentions[i] === user.screen_name) {
                        u = user;
                    } else {
                        try {
                            u = await API.user.get(mentions[i], false);
                        } catch(e) {
                            console.error(e);
                            continue;
                        }
                    }
                }
                if(!u) continue;
                users[u.id_str] = u;
            }
            let modal = createModal(html`
                <div id="new-tweet-mentions-modal" style="color:var(--almost-black)">
                    <h3 class="nice-header">${LOC.replying_to.message}</h3>
                    <div class="new-tweet-mentions-modal-item">
                        <input type="checkbox" id="new-tweet-mentions-modal-item-${replyTweet.user.screen_name}" checked disabled>
                        <label for="new-tweet-mentions-modal-item-${replyTweet.user.screen_name}">@${replyTweet.user.name} (${replyTweet.user.screen_name})</label>
                    </div>
                    ${mentions.map(m => {
                        let u = Object.values(users).find(u => u.screen_name === m);
                        if(!u) return '';
                        return html`
                        <div class="new-tweet-mentions-modal-item">
                            <input type="checkbox" data-user-id="${u.id_str}" id="new-tweet-mentions-modal-item-${m}"${excludeUserMentions.includes(u.id_str) ? '' : ' checked'}${user.screen_name === m ? ' hidden' : ''}>
                            <label for="new-tweet-mentions-modal-item-${m}"${user.screen_name === m ? ' hidden' : ''}>${u.name} (@${m})</label>
                        </div>
                    `}).join('\n')}
                    <br>
                    <div style="display:inline-block;float: right;">
                        <button class="nice-button" id="new-tweet-mentions-modal-button">${LOC.save.message}</button>
                    </div>
                </div>
            `);
            document.getElementById('new-tweet-mentions-modal-button').addEventListener('click', () => {
                let excluded = [];
                document.querySelectorAll('#new-tweet-mentions-modal input[type="checkbox"]').forEach(c => {
                    if(!c.checked) excluded.push(c.dataset.userId);
                });
                excludeUserMentions = excluded;
                modal.removeModal();
            });
        });
    }
    
    document.getElementById('new-tweet').addEventListener('drop', e => {
        handleDrop(e, mediaToUpload, document.getElementById('new-tweet-media-c'));
    });
    document.getElementById('new-tweet').addEventListener('paste', event => {
        let items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (index in items) {
            let item = items[index];
            if (item.kind === 'file') {
                let file = item.getAsFile();
                handleFiles([file], mediaToUpload, document.getElementById('new-tweet-media-c'));
            }
        }
    });
    document.getElementById('new-tweet-media-div').addEventListener('click', async () => {
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
            let users = (await API.search.typeahead(e.target.value.match(/@([\w+]{1,15}\b)$/)[1])).users;
            newTweetUserSearch.innerHTML = '';
            users.forEach((user, index) => {
                let userElement = document.createElement('span');
                userElement.className = 'search-result-item';
                if(index === 0) userElement.classList.add('search-result-item-active');
                userElement.innerHTML = html`
                    <img width="16" height="16" class="search-result-item-avatar" src="${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}">
                    <span class="search-result-item-name ${user.verified || user.id_str === '1708130407663759360' ? 'search-result-item-verified' : ''}">${escapeHTML(user.name)}</span>
                    <span class="search-result-item-screen-name">@${user.screen_name}</span>
                `;
                userElement.addEventListener('click', () => {
                    newTweetText.value = newTweetText.value.split("@").slice(0, -1).join('@').split(" ").slice(0, -1).join(" ") + ` @${user.screen_name} `;
                    if(newTweetText.value.startsWith(" ")) newTweetText.value = newTweetText.value.slice(1);
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
    });
    newTweetText.addEventListener('input', async e => {
        let charElement = document.getElementById('new-tweet-char');
        let tweet = twttr.txt.parseTweet(e.target.value);
        if(localStorage.OTisBlueVerified) {
            return charElement.innerText = `${tweet.weightedLength}`;
        }
        charElement.innerText = `${tweet.weightedLength}/280`;
        if (tweet.weightedLength > 265) {
            charElement.style.color = "#c26363";
        } else {
            charElement.style.color = "";
        }
        if (tweet.weightedLength > 280) {
            charElement.style.color = "red";
            document.getElementById('new-tweet-button').disabled = true;
        } else {
            charElement.style.color = "";
            document.getElementById('new-tweet-button').disabled = false;
        }
    });
    document.getElementById('new-tweet-button').addEventListener('click', async () => {
        let tweet = document.getElementById('new-tweet-text').value;
        if (tweet.length === 0 && mediaToUpload.length === 0) return;
        document.getElementById('new-tweet-button').disabled = true;
        let uploadedMedia = [];
        for (let i in mediaToUpload) {
            let media = mediaToUpload[i];
            try {
                media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = false;
                let mediaId;
                if(!media.div.dataset.mediaId) {
                    mediaId = await API.uploadMedia({
                        media_type: media.type,
                        media_category: media.category,
                        media: media.data,
                        alt: media.alt,
                        cw: media.cw,
                        loadCallback: data => {
                            media.div.getElementsByClassName('new-tweet-media-img-progress')[0].innerText = `${data.text} (${data.progress}%)`;
                        }
                    });
                } else {
                    mediaId = media.div.dataset.mediaId;
                }
                uploadedMedia.push(mediaId);
                media.div.getElementsByClassName('new-tweet-media-img-progress')[0].innerText = LOC.uploaded.message;
                media.div.dataset.mediaId = mediaId;
            } catch (e) {
                console.error(e);
                alert(e);
                for(let j in mediaToUpload) {
                    let media = mediaToUpload[j];
                    media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = true;
                    media.div.getElementsByClassName('new-tweet-media-img-progress')[0].innerText = '';
                }
                document.getElementById('new-tweet-button').disabled = false;
                return; // cancel tweeting
            }
        }
        let tweetObject = {
            status: tweet,
            in_reply_to_status_id: replyTweet.id_str
        };
        if(excludeUserMentions) {
            tweetObject.exclude_reply_user_ids = excludeUserMentions.join(',');
        }
        if (uploadedMedia.length > 0) {
            tweetObject.media_ids = uploadedMedia.join(',');
        }
        try {
            let tweet = await API.tweet.postV2(tweetObject);
            tweet._ARTIFICIAL = true;
            appendTweet(tweet, document.getElementById('timeline'), {
                after: document.getElementsByClassName('new-tweet-container')[0]
            });
        } catch (e) {
            document.getElementById('new-tweet-button').disabled = false;
            console.error(e);
        }
        document.getElementById('new-tweet-text').value = "";
        document.getElementById('new-tweet-media-c').innerHTML = "";
        mediaToUpload = [];
        excludeUserMentions = [];
        document.getElementById('new-tweet-focused').hidden = true;
        document.getElementById('new-tweet-char').hidden = true;
        document.getElementById('new-tweet-char').innerText = localStorage.OTisBlueVerified ? '0' : '0/280';
        document.getElementById('new-tweet-text').classList.remove('new-tweet-text-focused');
        document.getElementById('new-tweet-media-div').classList.remove('new-tweet-media-div-focused');
        document.getElementById('new-tweet-button').disabled = false;
    });
    document.getElementById('new-tweet-emojis').addEventListener('click', () => {
        createEmojiPicker(document.getElementById('new-tweet'), newTweetText, {
            marginLeft: '211px',
            marginTop: '-100px'
        });
    });
}
async function appendTombstone(timelineContainer, text, replyTweet) {
    try {
        if(typeof text === 'string') LOC.replacer_post_to_tweet.message.split('|').forEach(el => {
            let [or, nr] = el.split('->');
            or = or[0].toUpperCase() + or.slice(1);
            text = text.replace(new RegExp(or, "g"), nr);
        });
    } catch(e) {}
    tweets.push(['tombstone', text, replyTweet]);
    let tombstone = document.createElement('div');
    tombstone.className = 'tweet-tombstone';
    tombstone.innerHTML = text;
    timelineContainer.append(tombstone);
    if(replyTweet) {
        let threadDiv = document.createElement('div');
        threadDiv.className = "tweet-self-thread-div tombstone-thread";
        threadDiv.innerHTML = html`
            <span style="margin-left: 33px;margin-top: 8px;" class="tweet-self-thread-line"></span>
            <div style="margin-left: 29px;margin-top: 10px;" class="tweet-self-thread-line-dots"></div>
        `;
        tombstone.after(threadDiv);
    }
}
async function appendShowMore(container, data, id) {
    if(insertedMores.includes(data.cursor)) return;
    tweets.push(['showmore', data, id]);
    insertedMores.push(data.cursor);
    let div = document.createElement('div');
    div.className = 'show-more';
    div.innerHTML = html`
        <button class="show-more-button center-text">${data.labelText ? data.labelText : data.actionText}</button>
    `;
    let loading = false;
    div.querySelector('.show-more-button').addEventListener('click', async () => {
        if(loading) return;
        loading = true;
        div.children[0].innerText = LOC.loading_tweets.message;
        await updateReplies(id, data.cursor);
        div.remove();
        tweets = tweets.filter(t => t[0] !== 'showmore' || t[1].cursor !== data.cursor);
    });
    container.appendChild(div);
}

// On scroll to end of timeline, load more tweets
let loadingNewTweets = false;

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
    if(!vars) {
        await loadVars();
    }
    if(/^\/i\/web\/status\/(\d{5,32})(|\/)$/.test(realPath)) {
        let id = realPath.split("/i/web/status/")[1];
        if (id.endsWith("/")) id = id.slice(0, -1);
        let tweet = await API.tweet.getV2(id);
        location.replace(`/${tweet.user.screen_name}/status/${id}`);
        return;
    }
    // weird bug
    if(!document.getElementById('wtf-refresh')) {
        return setTimeout(() => location.reload(), 2500);
    }
    try {
        document.getElementById('wtf-refresh').addEventListener('click', async () => {
            renderDiscovery(false);
        });
    } catch(e) {
        setTimeout(() => location.reload(), 2500);
        console.error(e);
        return;
    }
    // Buttons
    document.getElementById('likes-more').addEventListener('click', async () => {
        if(!likeCursor) return;
        let id = location.pathname.match(/status\/(\d{1,32})/)[1];
        updateLikes(id, likeCursor);
    });
    document.getElementById('retweets-more').addEventListener('click', async () => {
        if(!retweetCursor) return;
        let id = location.pathname.match(/status\/(\d{1,32})/)[1];
        updateRetweets(id, retweetCursor);
    });
    document.getElementById('retweets_with_comments-more').addEventListener('click', async () => {
        if(!retweetCommentsCursor) return;
        let id = location.pathname.match(/status\/(\d{1,32})/)[1];
        document.getElementById('retweets_with_comments-more').innerText = LOC.loading_tweets.message;
        updateRetweetsWithComments(id, retweetCommentsCursor);
    });

    document.addEventListener('scroll', async () => {
        // loading new tweets
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 700) {
            if (loadingNewTweets) return;
            if(cursor) {
                loadingNewTweets = true;
                let path = location.pathname;
                if(path.endsWith('/')) path = path.slice(0, -1);
                updateReplies(path.split('/').slice(-1)[0], cursor);
            } else if(likeCursor) {
                loadingNewTweets = true;
                let likesMoreButton = document.getElementById('likes-more');
                if(likesMoreButton && !likesMoreButton.hidden) likesMoreButton.click();
            }
        }
    }, { passive: true });    
    
    // Update dates every minute
    setInterval(() => {
        let tweetDates = Array.from(document.getElementsByClassName('tweet-time'));
        let tweetQuoteDates = Array.from(document.getElementsByClassName('tweet-time-quote'));
        let all = [...tweetDates, ...tweetQuoteDates];
        all.forEach(date => {
            date.innerText = timeElapsed(+date.dataset.timestamp);
        });
    }, 60000);

    window.addEventListener("popstate", async () => {
        if(document.querySelector('.modal')) return;
        if(notificationsOpened) return;
        // document.getElementById('loading-box').hidden = false;
        savePageData(currentLocation);
        updateSubpage();
        mediaToUpload = [];
        excludeUserMentions = [];
        linkColors = {};
        cursor = undefined;
        seenReplies = [];
        mainTweetLikers = [];
        let id = location.pathname.match(/status\/(\d{1,32})/);
        if(!id) {
            setTimeout(() => {
                location.reload();
            }, 25);
            return;
        }
        id = id[1];
        let restored = await restorePageData();
        if(subpage === 'tweet' && !restored) {
            updateReplies(id);
        } else if(subpage === 'likes') {
            updateLikes(id);
        } else if(subpage === 'retweets') {
            updateRetweets(id);
        } else if(subpage === 'retweets_with_comments') {
            updateRetweetsWithComments(id);
        }
        renderDiscovery();
        renderTrends();
        currentLocation = location.pathname;
    });

    history.scrollRestoration = 'auto';

    // Run
    updateUserData();
    updateSubpage();
    let id = location.pathname.match(/status\/(\d{1,32})/)[1];
    chrome.storage.sync.get(['viewedtweets'], (result) => {
        if(!result.viewedtweets) result.viewedtweets = [];
        result.viewedtweets.unshift(id);
        result.viewedtweets = [...new Set(result.viewedtweets)];
        while(result.viewedtweets.length >= 100) {
            result.viewedtweets.pop();
        }
        chrome.storage.sync.set({ viewedtweets: result.viewedtweets });
    });
    if(subpage === 'tweet') {
        try {
            await updateReplies(id);
        } catch(e) {
            console.error(e);
            appendTombstone(document.getElementById('timeline'), LOC.error_loading_tweet.message);
            document.getElementById('loading-box').hidden = true;
        }
    } else if(subpage === 'likes') {
        updateLikes(id);
    } else if(subpage === 'retweets') {
        updateRetweets(id);
    } else if(subpage === 'retweets_with_comments') {
        updateRetweetsWithComments(id);
    }
    renderDiscovery();
    renderTrends();
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 10);
    setInterval(renderTrends, 60000 * 5);
}, 50);
