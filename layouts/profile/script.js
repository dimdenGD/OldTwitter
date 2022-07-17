let user = {};
let pageUser = {};
let timeline = {
    data: [],
    dataToUpdate: [],
    toBeUpdated: 0
}
let settings = {};
let seenThreads = [];
let pinnedTweet, followersYouFollow;
let favoritesCursor, followingCursor, followersCursor, followersYouKnowCursor;
let vars;
chrome.storage.sync.get(['linkColor', 'font', 'heartsNotStars', 'linkColorsInTL', 'enableTwemoji'], data => {
    vars = data;
});

// Util

let subpage;
let user_handle = location.pathname.slice(1).split("?")[0].split('#')[0];
user_handle = user_handle.split('/')[0];
function updateSubpage() {
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
        }
    }
    user_handle = user_handle.split('/')[0];
}

function updateSelection() {
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

        document.getElementById('profile-stat-followers-link').classList.add('profile-stat-active');
    }
    if(subpage !== 'profile') document.getElementById('profile-stat-tweets-link').href = `https://twitter.com/${pageUser.screen_name}`;
    document.getElementById('profile-stat-following-link').href = `https://twitter.com/${pageUser.screen_name}/following`;
    document.getElementById('profile-stat-followers-link').href = `https://twitter.com/${pageUser.screen_name}/followers`;
    if(subpage !== 'likes') document.getElementById('profile-stat-favorites-link').href = `https://twitter.com/${pageUser.screen_name}/likes`;
    if(subpage !== 'profile') document.getElementById('tweet-nav-tweets').href = `https://twitter.com/${pageUser.screen_name}`;
    if(subpage !== 'replies') document.getElementById('tweet-nav-replies').href = `https://twitter.com/${pageUser.screen_name}/with_replies`;
    if(subpage !== 'media') document.getElementById('tweet-nav-media').href = `https://twitter.com/${pageUser.screen_name}/media`;
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
            if(String(e).includes('User has been suspended.')) {
                return document.getElementById('loading-box-error').innerHTML = `User was suspended.<br><a href="https://twitter.com/home">Go to homepage</a>`;
            }
            if(String(e).includes("reading 'result'")) {
                return document.getElementById('loading-box-error').innerHTML = `User was not found.<br><a href="https://twitter.com/home">Go to homepage</a>`;
            }
            return document.getElementById('loading-box-error').innerHTML = `${String(e)}.<br><a href="https://twitter.com/home">Go to homepage</a>`;
        });
        pageUserData = pageUserData.value;
        customColor = customColor.value;
        followersYouFollowData = followersYouFollowData.value;
        oldUser = oldUser.value;
        u = u.value;
        user = u;
        if(customColor && customColor !== 'none') {
            user.profile_link_color = customColor;
        }

        const event = new CustomEvent('updateUserData', { detail: u });
        document.dispatchEvent(event);

        pageUser = pageUserData;
        if(customColor && customColor !== 'none') {
            let r = document.querySelector(':root');
            r.style.setProperty('--link-color', `#`+customColor);
        } else {
            let r = document.querySelector(':root');
            if(oldUser.profile_link_color && oldUser.profile_link_color !== '1DA1F2') r.style.setProperty('--link-color', `#`+oldUser.profile_link_color);
        }
        if(pageUser.id_str !== user.id_str) followersYouFollow = followersYouFollowData;
        else followersYouFollow = undefined;
        renderProfile();
        try {
            pinnedTweet = pageUser.pinned_tweet_ids_str;
            if(pinnedTweet && pinnedTweet.length > 0) pinnedTweet = await API.getTweet(pinnedTweet[0]);
            else pinnedTweet = undefined;
        } catch(e) {
            pinnedTweet = undefined;
            console.warn(e);
        }
        resolve(u);
    }).catch(e => {
        if (e === "Not logged in") {
            window.location.href = "https://twitter.com/login";
        }
        console.error(e);
        reject(e);
    });
}

async function updateTimeline() {
    seenThreads = [];
    if (timeline.data.length === 0) document.getElementById('timeline').innerHTML = 'Loading tweets...';
    let tl;
    if(subpage === "likes") {
        let data = await API.getFavorites(pageUser.id_str);
        tl = data.tl;
        favoritesCursor = data.cursor;
    } else {
        tl = await API.getUserTweets(pageUser.id_str, undefined, subpage !== 'profile');
        if(subpage === 'media') {
            tl = tl.filter(t => t.extended_entities && t.extended_entities.media && t.extended_entities.media.length > 0);
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
    // first update
    timeline.data = tl;
    renderTimeline();
}

async function renderFollowing(clear = true, cursor) {
    let followingList = document.getElementById('following-list');
    if(clear) followingList.innerHTML = '<h1 class="nice-header">Following</h1>';
    let following = await API.getFollowing(pageUser.id_str, cursor);
    followingCursor = following.cursor;
    following = following.list;
    following.forEach(u => {
        let followingElement = document.createElement('div');
        followingElement.classList.add('following-item');
        followingElement.innerHTML = `
        <div>
            <a href="https://twitter.com/${u.screen_name}" class="following-item-link">
                <img src="${u.profile_image_url_https}" alt="${u.screen_name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                <div class="following-item-text">
                    <span class="tweet-header-name following-item-name">${u.name}</span><br>
                    <span class="tweet-header-handle">@${u.screen_name}</span>
                </div>
            </a>
        </div>
        <div>
            <button class="following-item-btn nice-button ${u.following ? 'following' : 'follow'}">${u.following ? 'Following' : 'Follow'}</button>
        </div>`;

        let followButton = followingElement.querySelector('.following-item-btn');
        followButton.addEventListener('click', async () => {
            if (followButton.classList.contains('following')) {
                await API.unfollowUser(u.screen_name);
                followButton.classList.remove('following');
                followButton.classList.add('follow');
                followButton.innerText = 'Follow';
            } else {
                await API.followUser(u.screen_name);
                followButton.classList.remove('follow');
                followButton.classList.add('following');
                followButton.innerText = 'Following';
            }
        });

        followingList.appendChild(followingElement);
    });
    document.getElementById('loading-box').hidden = true;
}
async function renderFollowers(clear = true, cursor) {
    let followingList = document.getElementById('followers-list');
    if(clear) followingList.innerHTML = '<h1 class="nice-header">Followers</h1>';
    let following = await API.getFollowers(pageUser.id_str, cursor);
    followersCursor = following.cursor;
    following = following.list;
    following.forEach(u => {
        let followingElement = document.createElement('div');
        followingElement.classList.add('following-item');
        followingElement.innerHTML = `
        <div>
            <a href="https://twitter.com/${u.screen_name}" class="following-item-link">
                <img src="${u.profile_image_url_https}" alt="${u.screen_name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                <div class="following-item-text">
                    <span class="tweet-header-name following-item-name">${u.name}</span><br>
                    <span class="tweet-header-handle">@${u.screen_name}</span>
                </div>
            </a>
        </div>
        <div>
            <button class="following-item-btn nice-button ${u.following ? 'following' : 'follow'}">${u.following ? 'Following' : 'Follow'}</button>
        </div>`;

        let followButton = followingElement.querySelector('.following-item-btn');
        followButton.addEventListener('click', async () => {
            if (followButton.classList.contains('following')) {
                await API.unfollowUser(u.screen_name);
                followButton.classList.remove('following');
                followButton.classList.add('follow');
                followButton.innerText = 'Follow';
            } else {
                await API.followUser(u.screen_name);
                followButton.classList.remove('follow');
                followButton.classList.add('following');
                followButton.innerText = 'Following';
            }
        });

        followingList.appendChild(followingElement);
    });
    document.getElementById('loading-box').hidden = true;
}
async function renderFollowersYouFollow(clear = true, cursor) {
    let followingList = document.getElementById('followers_you_follow-list');
    if(clear) followingList.innerHTML = '<h1 class="nice-header">Followers you know</h1>';
    let following = await API.getFollowersYouFollow(pageUser.id_str, cursor);
    followersYouKnowCursor = following.cursor;
    following = following.list;
    following.forEach(u => {
        let followingElement = document.createElement('div');
        followingElement.classList.add('following-item');
        followingElement.innerHTML = `
        <div>
            <a href="https://twitter.com/${u.screen_name}" class="following-item-link">
                <img src="${u.profile_image_url_https}" alt="${u.screen_name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                <div class="following-item-text">
                    <span class="tweet-header-name following-item-name">${u.name}</span><br>
                    <span class="tweet-header-handle">@${u.screen_name}</span>
                </div>
            </a>
        </div>
        <div>
            <button class="following-item-btn nice-button ${u.following ? 'following' : 'follow'}">${u.following ? 'Following' : 'Follow'}</button>
        </div>`;

        let followButton = followingElement.querySelector('.following-item-btn');
        followButton.addEventListener('click', async () => {
            if (followButton.classList.contains('following')) {
                await API.unfollowUser(u.screen_name);
                followButton.classList.remove('following');
                followButton.classList.add('follow');
                followButton.innerText = 'Follow';
            } else {
                await API.followUser(u.screen_name);
                followButton.classList.remove('follow');
                followButton.classList.add('following');
                followButton.innerText = 'Following';
            }
        });

        followingList.appendChild(followingElement);
    });
    document.getElementById('loading-box').hidden = true;
}

let everAddedAdditional = false;
function renderProfile() {
    document.getElementById('profile-banner').src = pageUser.profile_banner_url ? pageUser.profile_banner_url : 'https://abs.twimg.com/images/themes/theme1/bg.png';
    document.getElementById('profile-avatar').addEventListener('error', () => {
        setTimeout(() => {
            document.getElementById('profile-avatar').src = pageUser.profile_image_url_https.replace('_normal', '_400x400');
        }, 500);
    });
    document.getElementById('profile-avatar').src = pageUser.profile_image_url_https.replace('_normal', '_400x400');
    document.getElementById('nav-profile-avatar').src = pageUser.profile_image_url_https.replace('_normal', '_bigger');
    document.getElementById('profile-name').innerText = pageUser.name;
    document.getElementById('nav-profile-name').innerText = pageUser.name;
    document.getElementById('profile-avatar-link').href = pageUser.profile_image_url_https.replace('_normal', '_400x400');;
    document.getElementById('tweet-to').innerText = `Tweet to ${pageUser.name}`;

    if(pageUser.verified || pageUser.id_str === '1123203847776763904') {
        document.getElementById('profile-name').classList.add('user-verified');
    }
    if(pageUser.protected) {
        document.getElementById('profile-name').classList.add('user-protected');
    }
    if(pageUser.muting) {
        document.getElementById('profile-name').classList.add('user-muted');
    }
    document.getElementById('profile-username').innerText = `@${pageUser.screen_name}`;
    document.getElementById('nav-profile-username').innerText = `@${pageUser.screen_name}`;
    document.getElementById('profile-media-text').href = `https://twitter.com/${pageUser.screen_name}/media`;

    updateSelection();


    document.getElementById('profile-bio').innerHTML = escape(pageUser.description).replace(/\n/g, '<br>').replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`).replace(/(?<!\w)#([\w+]+\b)/g, `<a href="https://twitter.com/hashtag/$1">#$1</a>`);
    if(vars.enableTwemoji) twemoji.parse(document.getElementById('profile-info'));

    document.getElementById('profile-stat-tweets-value').innerText = Number(pageUser.statuses_count).toLocaleString().replace(/\s/g, ',');
    document.getElementById('profile-stat-following-value').innerText = Number(pageUser.friends_count).toLocaleString().replace(/\s/g, ',');
    document.getElementById('profile-stat-followers-value').innerText = Number(pageUser.followers_count).toLocaleString().replace(/\s/g, ',');
    document.getElementById('profile-stat-favorites-value').innerText = Number(pageUser.favourites_count).toLocaleString().replace(/\s/g, ',');
    
    if(pageUser.followed_by) {
        document.getElementById('follows-you').hidden = false;
    } else {
        document.getElementById('follows-you').hidden = true;
    }
    document.getElementById('tweet-to').addEventListener('click', () => {
        let modal = createModal(/*html*/`
            <div class="navbar-new-tweet-container">
                <div class="navbar-new-tweet">
                    <img width="35" height="35" class="navbar-new-tweet-avatar">
                    <span class="navbar-new-tweet-char">0/280</span>
                    <textarea maxlength="280" class="navbar-new-tweet-text" placeholder="Tweet to @${pageUser.screen_name}">@${pageUser.screen_name} </textarea>
                    <div class="navbar-new-tweet-user-search" class="box" hidden></div>
                    <div class="navbar-new-tweet-media-div">
                        <span class="navbar-new-tweet-media"></span>
                    </div>
                    <div class="navbar-new-tweet-focused">
                        <div class="navbar-new-tweet-media-cc"><div class="navbar-new-tweet-media-c"></div></div>
                        <button class="navbar-new-tweet-button nice-button">Tweet</button>
                        <br><br>
                    </div>
                </div>
            </div>
        `);
        const newTweetText = modal.getElementsByClassName('navbar-new-tweet-text')[0];
        const newTweetChar = modal.getElementsByClassName('navbar-new-tweet-char')[0];
        const newTweetMedia = modal.getElementsByClassName('navbar-new-tweet-media')[0];
        const newTweetMediaDiv = modal.getElementsByClassName('navbar-new-tweet-media-c')[0];
        const newTweetButton = modal.getElementsByClassName('navbar-new-tweet-button')[0];
        const newTweetUserSearch = modal.getElementsByClassName('navbar-new-tweet-user-search')[0];

        let selectedIndex = 0;

        modal.getElementsByClassName('navbar-new-tweet-avatar')[0].src = user.profile_image_url_https.replace("_normal", "_bigger");
        function updateCharCount(e) {
            let char = e.target.value.length;
            let charElement = newTweetChar;
            charElement.innerText = `${char}/280`;
            if(char > 265) {
                charElement.style.color = "#c26363";
            } else {
                charElement.style.color = "";
            }
        }
        newTweetText.addEventListener('keyup', e => {
            if(!newTweetText.value.startsWith(`@${pageUser.screen_name} `)) {
                newTweetText.value = `@${pageUser.screen_name} ${newTweetText.value.split(' ').slice(1).join(' ')}`;
            }
            updateCharCount(e);
            if(e.key === "Enter" && e.ctrlKey) {
                newTweetButton.click();
            }
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
            updateCharCount(e);
        });
        let mediaToUpload = []; 
        newTweetMedia.addEventListener('click', () => {
            getMedia(mediaToUpload, newTweetMediaDiv); 
        });
        newTweetButton.addEventListener('click', async () => {
            let tweet = newTweetText.value;
            if (tweet.length === 0 && mediaToUpload.length === 0) return;
            newTweetButton.disabled = true;
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
            } catch (e) {
                document.getElementById('new-tweet-button').disabled = false;
                console.error(e);
            }
            modal.remove();
        });
    });

    if(followersYouFollow && followersYouFollow.total_count > 0) {
        let friendsFollowing = document.getElementById('profile-friends-following');
        let friendsFollowingList = document.getElementById('profile-friends-div');
        let friendsFollowingText = document.getElementById('profile-friends-text');
        friendsFollowingText.innerText = `${followersYouFollow.total_count} followers you know`;
        friendsFollowingText.href = `https://twitter.com/${pageUser.screen_name}/followers_you_follow`;
        followersYouFollow.users.forEach(u => {
            let a = document.createElement('a');
            a.href = `/${u.screen_name}`;
            let avatar = document.createElement('img');
            avatar.src = u.profile_image_url_https.replace('_normal', '_bigger');
            avatar.width = 48;
            avatar.height = 48;
            avatar.title = u.name + ' (@' + u.screen_name + ')';
            avatar.classList.add('profile-friends-avatar');
            a.append(avatar);
            friendsFollowingList.append(a);
        });
        friendsFollowing.hidden = false;
    }

    let buttonsElement = document.getElementById('profile-nav-buttons');
    if(pageUser.id_str === user.id_str) {
        buttonsElement.innerHTML = `<a class="nice-button" id="edit-profile" href="https://twitter.com/settings/profile">Edit Profile</a>`;
    } else {
        document.getElementById('tweet-to-bg').hidden = false;
        buttonsElement.innerHTML = /*html*/`
            <button ${pageUser.blocking ? 'hidden' : ''} class="nice-button ${pageUser.following ? 'following' : 'follow'} control-btn" id="control-follow">${pageUser.following ? 'Following' : 'Follow'}</button>
            <button class="nice-button control-btn" id="control-unblock" ${pageUser.blocking ? '' : 'hidden'}>Unblock</button>
            <a ${pageUser.can_dm && !pageUser.blocking ? '' : 'hidden'} class="nice-button" id="message-user" href="https://twitter.com/messages/${user.id_str}-${pageUser.id_str}"></a>
        `;
        buttonsElement.innerHTML += /*html*/`
            <span class="profile-additional-thing" id="profile-settings"></span>
            <div id="profile-settings-div" hidden>
                <span ${!pageUser.following || pageUser.blocking ? 'hidden' : ''} id="profile-settings-notifications" class="${pageUser.notifications ? 'profile-settings-offnotifications' : 'profile-settings-notifications'}">${pageUser.notifications? `Stop getting notifications` : `Receive notifications`}<br></span>
                <span id="profile-settings-block" class="${pageUser.blocking ? 'profile-settings-unblock' : 'profile-settings-block'}">${pageUser.blocking ? `Unblock @${pageUser.screen_name}` : `Block @${pageUser.screen_name}`}<br></span>
                <span ${pageUser.blocking ? 'hidden' : ''} id="profile-settings-mute" class="${pageUser.muting ? 'profile-settings-unmute' : 'profile-settings-mute'}">${pageUser.muting ? `Stop ignoring` : `Ignore`}<br></span>
                ${pageUser.followed_by ? `<span id="profile-settings-removefollowing">Remove from followers</span><br>` : ''}
                <hr>
                <span id="profile-settings-lists" style="width: 100%;">See lists<br></span>
                <span id="profile-settings-share" style="width: 100%;">Share user<br></span>
                <span id="profile-settings-copy" style="width: 100%;">Copy profile link<br></span>
            </div>
        `;
        let clicked = false;
        let controlFollow = document.getElementById('control-follow');
        controlFollow.addEventListener('click', async () => {
            if (controlFollow.className.includes('following')) {
                await API.unfollowUser(pageUser.screen_name);
                controlFollow.classList.remove('following');
                controlFollow.classList.add('follow');
                controlFollow.innerText = 'Follow';
                pageUser.following = false;
                document.getElementById('profile-stat-followers-value').innerText = Number(parseInt(document.getElementById('profile-stat-followers-value').innerText.replace(/\s/g, '').replace(/,/g, '')) - 1).toLocaleString().replace(/\s/g, ',');
                document.getElementById('profile-settings-notifications').hidden = true;
            } else {
                await API.followUser(pageUser.screen_name);
                controlFollow.classList.add('following');
                controlFollow.classList.remove('follow');
                controlFollow.innerText = 'Following';
                pageUser.following = true;
                document.getElementById('profile-stat-followers-value').innerText = Number(parseInt(document.getElementById('profile-stat-followers-value').innerText.replace(/\s/g, '').replace(/,/g, '')) + 1).toLocaleString().replace(/\s/g, ',');
                document.getElementById('profile-settings-notifications').hidden = false;
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
                document.getElementById('profile-settings-block').innerText = `Block @${pageUser.screen_name}`;
                document.getElementById('control-unblock').hidden = true;
                document.getElementById('control-follow').hidden = false;
                document.getElementById('message-user').hidden = !pageUser.can_dm;
                document.getElementById("profile-settings-notifications").hidden = false;
                document.getElementById("profile-settings-mute").hidden = false;
            } else {
                let modal = createModal(`
                <span style='font-size:14px'>Are you sure you want to block @${pageUser.screen_name}?</span>
                    <br><br>
                    <button class="nice-button">Block</button>
                `)
                modal.getElementsByClassName('nice-button')[0].addEventListener('click', async () => {
                    await API.blockUser(pageUser.id_str);
                    pageUser.blocking = true;
                    document.getElementById('profile-settings-block').classList.add('profile-settings-unblock');
                    document.getElementById('profile-settings-block').classList.remove('profile-settings-block');
                    document.getElementById('profile-settings-block').innerText = `Unblock @${pageUser.screen_name}`;
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
                document.getElementById('profile-settings-block').innerText = `Block @${pageUser.screen_name}`;
                document.getElementById('control-unblock').hidden = true;
                document.getElementById('control-follow').hidden = false;
                document.getElementById("profile-settings-notifications").hidden = false;
                document.getElementById("profile-settings-mute").hidden = false;
                document.getElementById('message-user').hidden = !pageUser.can_dm;
            }
        });
        document.getElementById('profile-settings-mute').addEventListener('click', async () => {
            if(pageUser.muting) {
                await API.unmuteUser(pageUser.id_str);
                pageUser.muting = false;
                document.getElementById('profile-settings-mute').classList.remove('profile-settings-unmute');
                document.getElementById('profile-settings-mute').classList.add('profile-settings-mute');
                document.getElementById('profile-settings-mute').innerText = `Ignore`;
                document.getElementById('profile-name').classList.remove('user-muted');
            } else {
                await API.muteUser(pageUser.id_str);
                pageUser.muting = true;
                document.getElementById('profile-settings-mute').classList.add('profile-settings-unmute');
                document.getElementById('profile-settings-mute').classList.remove('profile-settings-mute');
                document.getElementById('profile-settings-mute').innerText = `Stop ignoring`;
                document.getElementById('profile-name').classList.add('user-muted');
            }
        });
        if(document.getElementById('profile-settings-removefollowing')) document.getElementById('profile-settings-removefollowing').addEventListener('click', async () => {
            let modal = createModal(`
            <span style='font-size:14px'>
            Are you sure you want to remove @${pageUser.screen_name} from your followers?
            <br>They'll be able to follow you again in future.
            <br><br>
            THIS WILL REMOVE THEM FROM YOUR FOLLOWERS LIST, NOT FROM YOUR FOLLOWING LIST.
            </span>
                <br><br>
                <button class="nice-button">Unfollow them from me</button>
            `)
            modal.getElementsByClassName('nice-button')[0].addEventListener('click', async () => {
                await API.removeFollower(pageUser.id_str);
                pageUser.followed_by = false;
                document.getElementById('profile-settings-removefollowing').hidden = true;
                document.getElementById('follows-you').hidden = true;
                modal.remove();
            });
        });
        document.getElementById('profile-settings-lists').addEventListener('click', async () => {
            openInNewTab(`https://twitter.com/${pageUser.screen_name}/lists`);
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
        location.innerText = pageUser.location;
        additionalInfo.appendChild(location);
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
    let joined = document.createElement('span');
    joined.classList.add('profile-additional-thing', 'profile-additional-joined');
    joined.innerText = `Joined ${new Date(pageUser.created_at).toLocaleDateString('en', {month: 'long', year: 'numeric', day: 'numeric'})}`;
    additionalInfo.appendChild(joined);
};

async function appendTweet(t, timelineContainer, options = {}) {
    if(seenThreads.includes(t.id_str)) return false;
    const tweet = document.createElement('div');
    tweet.addEventListener('click', e => {
        if(e.target.className.startsWith('tweet tweet-id-') || e.target.className === 'tweet-body' || e.target.className === 'tweet-interact') {
            location.assign(`https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
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
                <b class="tweet-header-name ${t.user.verified || t.user.id_str === '1123203847776763904' ? 'user-verified' : ''} ${t.user.protected ? 'user-protected' : ''}">${escape(t.user.name)}</b>
                <span class="tweet-header-handle">@${t.user.screen_name}</span>
            </a>
        </div>
        <a class="tweet-time" data-timestamp="${new Date(t.created_at).getTime()}" title="${new Date(t.created_at).toLocaleString()}" href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}">${timeElapsed(new Date(t.created_at).getTime())}</a>
        <div class="tweet-body">
            <span class="tweet-body-text ${t.full_text && t.full_text.length > 100 ? 'tweet-body-text-long' : 'tweet-body-text-short'}">${t.full_text ? escape(t.full_text).replace(/\n/g, '<br>').replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`).replace(/(?<!\w)#([\w+]+\b)/g, `<a href="https://twitter.com/hashtag/$1">#$1</a>`) : ''}</span>
            ${!isEnglish ? `
            <br>
            <span class="tweet-translate">Translate tweet</span>
            ` : ``}
            ${t.extended_entities && t.extended_entities.media ? `
            <div class="tweet-media">
                ${t.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escape(m.ext_alt_text)}" title="${escape(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop autoplay muted' : ''} src="${m.type === 'photo' ? m.media_url_https : m.video_info.variants.find(v => v.content_type === 'video/mp4').url}" class="tweet-media-element ${mediaClasses[t.extended_entities.media.length]} ${!settings.display_sensitive_media && t.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' ? '</video>' : ''}`).join('\n')}
            </div>
            ` : ``}
            ${t.quoted_status ? `
            <a class="tweet-body-quote" href="https://twitter.com/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}">
                <img src="${t.quoted_status.user.profile_image_url_https}" alt="${escape(t.quoted_status.user.name)}" class="tweet-avatar-quote" width="24" height="24">
                <div class="tweet-header-quote">
                    <span class="tweet-header-info-quote">
                        <b class="tweet-header-name-quote">${escape(t.quoted_status.user.name)}</b>
                        <span class="tweet-header-handle-quote">@${t.quoted_status.user.screen_name}</span>
                    </span>
                </div>
                <span class="tweet-time-quote" data-timestamp="${new Date(t.quoted_status.created_at).getTime()}" title="${new Date(t.quoted_status.created_at).toLocaleString()}">${timeElapsed(new Date(t.quoted_status.created_at).getTime())}</span>
                <span class="tweet-body-text-quote tweet-body-text-long" style="color:black!important">${t.quoted_status.full_text ? escape(t.quoted_status.full_text).replace(/\n/g, '<br>') : ''}</span>
                ${t.quoted_status.extended_entities && t.quoted_status.extended_entities.media ? `
                <div class="tweet-media-quote">
                    ${t.quoted_status.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escape(m.ext_alt_text)}" title="${escape(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${quoteSizeFunctions[t.quoted_status.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${quoteSizeFunctions[t.quoted_status.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop autoplay muted' : ''} src="${m.type === 'photo' ? m.media_url_https : m.video_info.variants.find(v => v.content_type === 'video/mp4').url}" class="tweet-media-element tweet-media-element-quote ${mediaClasses[t.quoted_status.extended_entities.media.length]} ${!settings.display_sensitive_media && t.quoted_status.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' ? '</video>' : ''}`).join('\n')}
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
        <span style="font-size: 12px;color: #8899a6;">Translated from [${translated.translated_lang}]:</span>
        <br>
        <span>${translated.text}</span>`;
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
        let profileMediaDiv = document.getElementById('profile-media-div');
        if(!options || !options.top || !options.top.text || !options.top.text.includes('retweeted')) t.extended_entities.media.forEach(m => {
            if(profileMediaDiv.children.length >= 6) return;
            let ch = Array.from(profileMediaDiv.children);
            if(ch.find(c => c.src === m.media_url_https)) return;
            const media = document.createElement('img');
            media.classList.add('tweet-media-element', 'tweet-media-element-four', 'profile-media-preview');
            media.src = m.media_url_https;
            if(m.ext_alt_text) media.alt = m.ext_alt_text;
            media.addEventListener('click', () => {
                let tweet = document.getElementsByClassName('tweet-id-' + t.id_str)[0];
                tweet.scrollIntoView({behavior: 'smooth', block: 'center'});
            });
            profileMediaDiv.appendChild(media);
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
        appendTweet(tweetData, document.getElementById('timeline'), {
            noTop: true,
            after: tweet
        });
    });

    // Retweet / Quote Tweet
    tweetQuoteCancel.addEventListener('click', () => {
        tweetQuote.hidden = true;
    });
    let retweetClicked = false;
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
                setTimeout(() => tweetInteractRetweetMenu.hidden = true, 100);
            }, { once: true });
        }, 100);
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

async function renderTimeline() {
    let timelineContainer = document.getElementById('timeline');
    timelineContainer.innerHTML = '';
    if(pinnedTweet && subpage === "profile") await appendTweet(pinnedTweet, timelineContainer, {
        top: {
            text: "Pinned Tweet",
            icon: "\uf003",
            color: "var(--link-color)"
        }
    })
    for(let i in timeline.data) {
        let t = timeline.data[i];
        if(pinnedTweet && t.id_str === pinnedTweet.id_str) continue;
        if (t.retweeted_status) {
            await appendTweet(t.retweeted_status, timelineContainer, {
                top: {
                    text: `<a href="https://twitter.com/${t.user.screen_name}">${escape(t.user.name)}</a> retweeted`,
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
                await appendTweet(t, timelineContainer);
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
    let discover = await API.peopleRecommendations(pageUser.id_str, cache);
    let discoverContainer = document.getElementById('wtf-list');
    discoverContainer.innerHTML = '';
    try {
        document.getElementById('wtf-viewall').href = `https://twitter.com/i/connect_people?user_id=${pageUser.id_str}`;
        discover.forEach(userData => {
            userData = userData.user;
            if (!userData) return;
            let udiv = document.createElement('div');
            udiv.className = 'wtf-user';
            udiv.innerHTML = `
                <a class="tweet-avatar-link" href="https://twitter.com/${userData.screen_name}"><img src="${userData.profile_image_url_https.replace("_normal", "_bigger")}" alt="${userData.name}" class="tweet-avatar" width="48" height="48"></a>
                <div class="tweet-header wtf-header">
                    <a class="tweet-header-info wtf-user-link" href="https://twitter.com/${userData.screen_name}">
                        <b class="tweet-header-name wtf-user-name">${userData.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</b>
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
            <a href="https://twitter.com/search?q=${trend.name.replace(/</g, '')}" class="trend-name">${trend.name}</a>
        `;
        trendsContainer.append(trendDiv);
        if(vars.enableTwemoji) twemoji.parse(trendDiv);
    });
}

let banner = document.getElementById('profile-banner');
let loadingNewTweets = false;
window.addEventListener('scroll', async () => {
    // banner scroll
    banner.style.top = `${5+Math.min(window.scrollY/4, 470/4)}px`;
    // load more tweets
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
        if (loadingNewTweets || timeline.data.length === 0) return;
        loadingNewTweets = true;
        let tl;
        try {
            if(subpage === "likes") {
                let data = await API.getFavorites(pageUser.id_str, favoritesCursor);
                tl = data.tl;
                favoritesCursor = data.cursor;
            } else {
                tl = await API.getUserTweets(pageUser.id_str, timeline.data[timeline.data.length - 1].id_str, subpage !== 'profile');
                if(subpage === 'media') {
                    tl = tl.filter(t => t.extended_entities && t.extended_entities.media && t.extended_entities.media.length > 0);
                }
            }
        } catch (e) {
            console.error(e);
            loadingNewTweets = false;
            return;
        }
        timeline.data = timeline.data.concat(tl);
        let lastTweet = document.getElementById('timeline').lastChild;
        await renderTimeline();
        setTimeout(() => {
            lastTweet.scrollIntoView({
                behavior: 'smooth', block: 'center'
            });
            setTimeout(() => {
                loadingNewTweets = false;
            });
        }, 200);
    }
});

setTimeout(() => {
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
    document.getElementById('following-more').addEventListener('click', async () => {
        if(!followingCursor) return;
        renderFollowing(false, followingCursor);
    });
    document.getElementById('followers-more').addEventListener('click', async () => {
        if(!followersCursor) return;
        renderFollowers(false, followersCursor);
    });
    document.getElementById('followers_you_follow-more').addEventListener('click', async () => {
        if(!followersYouKnowCursor) return;
        renderFollowersYouFollow(false, followersYouKnowCursor);
    });
    function updatePath(e) {
        if(e.target.classList.contains('tweet-nav-active') || e.target.classList.contains('profile-stat-active')) {
            return;
        }
        e.preventDefault();
        let el = e.target;
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
        if(subpage !== 'following' && subpage !== 'followers' && subpage !== 'followers_you_follow') updateTimeline();
        else if(subpage === 'following') {
            renderFollowing();
        } else if(subpage === 'followers') {
            renderFollowers();
        } else if(subpage === 'followers_you_follow') {
            renderFollowersYouFollow();
        }
    }
    document.getElementById('tweet-nav-tweets').addEventListener('click', updatePath);
    document.getElementById('tweet-nav-replies').addEventListener('click', updatePath);
    document.getElementById('tweet-nav-media').addEventListener('click', updatePath);
    document.getElementById('profile-stat-tweets-link').addEventListener('click', updatePath);
    document.getElementById('profile-stat-following-link').addEventListener('click', updatePath);
    document.getElementById('profile-stat-followers-link').addEventListener('click', updatePath);
    document.getElementById('profile-stat-favorites-link').addEventListener('click', updatePath);
    document.getElementById('profile-friends-text').addEventListener('click', updatePath);
    document.addEventListener('click', async e => {
        let el = e.target;
        if(el.tagName !== 'A') el = el.parentElement;
        if(el.tagName === "A") {
            let path = new URL(el.href).pathname;
            if(/^\/[A-z-0-9-_]{1,15}$/.test(path) && ["/home", "/", "/notifications", "/messages", "/settings", "/explore", "/login", "/register", "/logout"].indexOf(path) === -1) {
                e.preventDefault();
                mediaToUpload = [];
                document.getElementById('loading-box').hidden = false;
                everAddedAdditional = false;
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
        let path = location.pathname;
        if(/^\/[A-z-0-9-_]{1,15}$/.test(path) && ["/home", "/", "/notifications", "/messages", "/settings", "/explore", "/login", "/register", "/logout"].indexOf(path) === -1) {
            document.getElementById('loading-box').hidden = false;
            everAddedAdditional = false;
            mediaToUpload = [];
            document.getElementById('profile-media-div').innerHTML = '';
            document.getElementById('tweet-to-bg').hidden = true;
            document.getElementById('profile-additional').innerHTML = '';
            document.getElementById('profile-friends-div').innerHTML = '';
            updateSubpage();
            updateSelection();
            await updateUserData();
            updateTimeline();
            renderDiscovery();
        }
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
    API.getSettings().then(async s => {
        settings = s;
        updateSubpage();
        await updateUserData();
        if(subpage !== 'following' && subpage !== 'followers' && subpage !== 'followers_you_follow') updateTimeline();
        else if(subpage === 'following') {
            renderFollowing();
        } else if(subpage === 'followers') {
            renderFollowers();
        } else  if(subpage === 'followers_you_follow') {
            renderFollowersYouFollow();
        }
        renderDiscovery();
        renderTrends();
        setInterval(() => renderDiscovery(false), 60000 * 5);
        setInterval(renderTrends, 60000 * 5);
    }).catch(e => {
        if (e === "Not logged in") {
            window.location.href = "https://twitter.com/login";
        }
        console.error(e);
    });
}, 250);