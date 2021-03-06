let user = {};
let settings = {};
let mediaToUpload = [];
let linkColors = {};
let cursor, likeCursor, retweetCursor, retweetCommentsCursor;
let seenReplies = [];
let mainTweetLikers = [];
let loadedData = {};

let vars;
chrome.storage.sync.get(['linkColor', 'font', 'heartsNotStars', 'linkColorsInTL', 'darkMode'], data => {
    vars = data;
});

// Util

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

    if(path.split('/').length === 3) {
        subpage = 'tweet';
        tlDiv.hidden = false;
    } else {
        if(path.endsWith('/retweets')) {
            subpage = 'retweets';
            rtDiv.hidden = false;
            rtMore.hidden = false;
        } else if(path.endsWith('/likes')) {
            subpage = 'likes';
            likesDiv.hidden = false;
            likesMore.hidden = false;
        } else if(path.endsWith('/retweets/with_comments')) {
            subpage = 'retweets_with_comments';
            rtwDiv.hidden = false;
            rtwMore.hidden = false;
        }
    }
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
async function updateReplies(id, c) {
    if(!c) document.getElementById('timeline').innerHTML = '';
    let tl;
    try {
        let [tlData, s] = await Promise.allSettled([API.getReplies(id, c), API.getSettings()]);
        if(!tlData.value) {
            cursor = undefined;
            return console.error(tlData.reason);
        }
        tl = tlData.value;
        settings = s.value;
    } catch(e) {
        return cursor = undefined;
    }

    if(vars.linkColorsInTL) {
        let tlUsers = [];
        for(let i in tl.list) {
            let t = tl.list[i];
            if(t.type === 'tweet' || t.type === 'mainTweet') { if(!tlUsers.includes(t.data.user.screen_name)) tlUsers.push(t.data.user.screen_name); }
            else {
                for(let j in t.data) {
                    tlUsers.push(t.data[j].user.screen_name);
                }
            }
        }
        tlUsers = tlUsers.filter(i => !linkColors[i]);
        let linkData = await fetch(`https://dimden.dev/services/twitter_link_colors/get_multiple/${tlUsers.join(',')}`).then(res => res.json()).catch(console.error);
        if(linkData) for(let i in linkData) {
            linkColors[linkData[i].username] = linkData[i].color;
        }
    }

    cursor = tl.cursor;
    let mainTweet;
    let mainTweetIndex = tl.list.findIndex(t => t.type === 'mainTweet');
    for(let i in tl.list) {
        let t = tl.list[i];
        if(t.type === 'mainTweet') {
            let tweetLikers = await API.getTweetLikers(t.data.id_str);
            mainTweetLikers = tweetLikers.list;
            likeCursor = tweetLikers.cursor;
            if(i === 0) {
                mainTweet = await appendTweet(t.data, document.getElementById('timeline'), {
                    mainTweet: true
                });
            } else {
                mainTweet = await appendTweet(t.data, document.getElementById('timeline'), {
                    noTop: true,
                    mainTweet: true
                });
            }
            appendComposeComponent(document.getElementById('timeline'), t.data);
        }
        if(t.type === 'tweet') {
            await appendTweet(t.data, document.getElementById('timeline'), {
                noTop: i !== 0 && i < mainTweetIndex,
                threadContinuation: i < mainTweetIndex
            });
        }
        if(t.type === 'conversation') {
            for(let i2 in t.data) {
                let t2 = t.data[i2];
                await appendTweet(t2, document.getElementById('timeline'), {
                    noTop: +i2 !== 0,
                    threadContinuation: +i2 !== t.data.length - 1,
                    threadButton: +i2 === t.data.length - 1,
                    threadId: t2.conversation_id_str
                });
            }
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
            tweetLikers = await API.getTweetLikers(id, c);
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
        let tweet = await appendTweet(await API.getTweet(id), likeDiv, {
            mainTweet: true
        });
        tweet.style.borderBottom = '1px solid var(--border)';
        tweet.style.marginBottom = '10px';
        tweet.style.borderRadius = '5px';
        let h1 = document.createElement('h1');
        h1.innerText = `Liked by`;
        h1.className = 'cool-header';
        likeDiv.appendChild(h1);
    }

    for(let i in tweetLikers) {
        let u = tweetLikers[i];
        let likeElement = document.createElement('div');
        likeElement.classList.add('following-item');
        likeElement.innerHTML = `
        <div>
            <a href="https://twitter.com/${u.screen_name}" class="following-item-link">
                <img src="${u.profile_image_url_https}" alt="${u.screen_name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                <div class="following-item-text">
                    <span class="tweet-header-name following-item-name">${escapeHTML(u.name)}</span><br>
                    <span class="tweet-header-handle">@${u.screen_name}</span>
                </div>
            </a>
        </div>
        <div>
            <button class="following-item-btn nice-button ${u.following ? 'following' : 'follow'}">${u.following ? 'Following' : 'Follow'}</button>
        </div>`;

        let followButton = likeElement.querySelector('.following-item-btn');
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

        likeDiv.appendChild(likeElement);
    }
    document.getElementById('loading-box').hidden = true;
}
async function updateRetweets(id, c) {
    let tweetRetweeters;
    try {
        tweetRetweeters = await API.getTweetRetweeters(id, c);
        retweetCursor = tweetRetweeters.cursor;
        tweetRetweeters = tweetRetweeters.list;
    } catch(e) {
        console.error(e);
        return retweetCursor = undefined;
    }
    let retweetDiv = document.getElementById('retweets');

    if(!c) {
        retweetDiv.innerHTML = '';
        let tweet = await appendTweet(await API.getTweet(id), retweetDiv, {
            mainTweet: true
        });
        tweet.style.borderBottom = '1px solid var(--border)';
        tweet.style.marginBottom = '10px';
        tweet.style.borderRadius = '5px';
        let h1 = document.createElement('h1');
        h1.innerText = `Retweeted by`;
        h1.className = 'cool-header';
        retweetDiv.appendChild(h1);
    }

    for(let i in tweetRetweeters) {
        let u = tweetRetweeters[i];
        let retweetElement = document.createElement('div');
        retweetElement.classList.add('following-item');
        retweetElement.innerHTML = `
        <div>
            <a href="https://twitter.com/${u.screen_name}" class="following-item-link">
                <img src="${u.profile_image_url_https}" alt="${u.screen_name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                <div class="following-item-text">
                    <span class="tweet-header-name following-item-name">${escapeHTML(u.name)}</span><br>
                    <span class="tweet-header-handle">@${u.screen_name}</span>
                </div>
            </a>
        </div>
        <div>
            <button class="following-item-btn nice-button ${u.following ? 'following' : 'follow'}">${u.following ? 'Following' : 'Follow'}</button>
        </div>`;

        let followButton = retweetElement.querySelector('.following-item-btn');
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

        retweetDiv.appendChild(retweetElement);
    }
    document.getElementById('loading-box').hidden = true;
}
async function updateRetweetsWithComments(id, c) {
    let tweetRetweeters;
    try {
        tweetRetweeters = await API.getTweetQuotes(id, c);
        retweetCommentsCursor = tweetRetweeters.cursor;
        tweetRetweeters = tweetRetweeters.list;
    } catch(e) {
        console.error(e);
        return retweetCommentsCursor = undefined;
    }
    let retweetDiv = document.getElementById('retweets_with_comments');

    if(!c) {
        retweetDiv.innerHTML = '';
        let h1 = document.createElement('h1');
        h1.innerText = `Quote tweets`;
        h1.className = 'cool-header';
        retweetDiv.appendChild(h1);
    }

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
    document.getElementById('user-tweets').innerText = user.statuses_count;
    document.getElementById('user-following').innerText = user.friends_count;
    document.getElementById('user-followers').innerText = user.followers_count;
    document.getElementById('user-banner').src = user.profile_banner_url;
    document.getElementById('user-avatar').src = user.profile_image_url_https.replace("_normal", "_400x400");
    document.getElementById('wtf-viewall').href = `https://mobile.twitter.com/i/connect_people?user_id=${user.id_str}`;
    document.getElementById('user-avatar-link').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('user-info').href = `https://twitter.com/${user.screen_name}`;

    twemoji.parse(document.getElementById('user-name'));
}
async function appendComposeComponent(container, replyTweet) {
    let el = document.createElement('div');
    el.id = 'new-tweet-container';
    el.innerHTML = /*html*/`
        <div id="new-tweet" class="box">
            <img width="35" height="35" class="tweet-avatar" id="new-tweet-avatar">
            <span id="new-tweet-char" hidden>0/280</span>
            <textarea id="new-tweet-text" placeholder="Reply to @${replyTweet.user.screen_name}" maxlength="280"></textarea>
            <div id="new-tweet-user-search" class="box" hidden></div>
            <div id="new-tweet-media-div">
                <span id="new-tweet-media"></span>
            </div>
            <div id="new-tweet-focused" hidden>
                <div id="new-tweet-media-cc"><div id="new-tweet-media-c"></div></div>
                <button id="new-tweet-button" class="nice-button">Tweet</button>
                <br><br>
            </div>
        </div>`;
    container.append(el);
    document.getElementById('new-tweet-avatar').src = user.profile_image_url_https.replace("_normal", "_bigger");
    document.getElementById('new-tweet').addEventListener('click', async () => {
        document.getElementById('new-tweet-focused').hidden = false;
        document.getElementById('new-tweet-char').hidden = false;
        document.getElementById('new-tweet-text').classList.add('new-tweet-text-focused');
        document.getElementById('new-tweet-media-div').classList.add('new-tweet-media-div-focused');
    });
    
    document.getElementById('new-tweet').addEventListener('drop', e => {
        handleDrop(e, mediaToUpload, document.getElementById('new-tweet-media-c'));
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
                    <span class="search-result-item-name ${user.verified ? 'search-result-item-verified' : ''}">${escapeHTML(user.name)}</span>
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
    document.getElementById('new-tweet-text').addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.ctrlKey) {
            document.getElementById('new-tweet-button').click();
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
            in_reply_to_status_id: replyTweet.id_str,
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
            tweet._ARTIFICIAL = true;
            appendTweet(tweet, document.getElementById('timeline'), {
                after: document.getElementById('new-tweet-container')
            });
        } catch (e) {
            document.getElementById('new-tweet-button').disabled = false;
            console.error(e);
        }
        document.getElementById('new-tweet-text').value = "";
        document.getElementById('new-tweet-media-c').innerHTML = "";
        mediaToUpload = [];
        document.getElementById('new-tweet-focused').hidden = true;
        document.getElementById('new-tweet-char').hidden = true;
        document.getElementById('new-tweet-text').classList.remove('new-tweet-text-focused');
        document.getElementById('new-tweet-media-div').classList.remove('new-tweet-media-div-focused');
        document.getElementById('new-tweet-button').disabled = false;
    });
}
function luminance(r, g, b) {
    var a = [r, g, b].map(function(v) {
      v /= 255;
      return v <= 0.03928 ?
        v / 12.92 :
        Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }
function contrast(rgb1, rgb2) {
    var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
    var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) /
      (darkest + 0.05);
  }
const hex2rgb = (hex) => {
      if(!hex.startsWith('#')) hex = `#${hex}`;
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      // return {r, g, b} // return an object
      return [ r, g, b ]
}
  
const colorShade = (col, amt) => {
    col = col.replace(/^#/, '')
    if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]
  
    let [r, g, b] = col.match(/.{2}/g);
    ([r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt])
  
    r = Math.max(Math.min(255, r), 0).toString(16)
    g = Math.max(Math.min(255, g), 0).toString(16)
    b = Math.max(Math.min(255, b), 0).toString(16)
  
    const rr = (r.length < 2 ? '0' : '') + r
    const gg = (g.length < 2 ? '0' : '') + g
    const bb = (b.length < 2 ? '0' : '') + b
  
    return `#${rr}${gg}${bb}`
}

async function appendTweet(t, timelineContainer, options = {}) {
    if(seenReplies.includes(t.id_str)) return;
    seenReplies.push(t.id_str);
    const tweet = document.createElement('div');
    if(!options.mainTweet) {
        tweet.addEventListener('click', e => {
            if(e.target.className.startsWith('tweet tweet-id-') || e.target.className === 'tweet-body' || e.target.className === 'tweet-interact') {
                document.getElementById('loading-box').hidden = false;
                history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
                updateSubpage();
                mediaToUpload = [];
                linkColors = {};
                cursor = undefined;
                seenReplies = [];
                mainTweetLikers = [];
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                if(subpage === 'tweet') {
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
    }
    tweet.className = `tweet tweet-id-${t.id_str} ${options.mainTweet ? 'tweet-main' : ''}`;
    if (options.threadContinuation) tweet.classList.add('tweet-self-thread-continuation');
    if (options.noTop) tweet.classList.add('tweet-no-top');
    if(vars.linkColorsInTL) {
        if(linkColors[t.user.screen_name]) {
            let rgb = hex2rgb(linkColors[t.user.screen_name]);
            let ratio = contrast(rgb, [27, 40, 54]);
            if(ratio < 4 && vars.darkMode) {
                linkColors[t.user.screen_name] = colorShade(linkColors[t.user.screen_name], 80).slice(1);
            }
            tweet.style.setProperty('--link-color', '#'+linkColors[t.user.screen_name]);
        } else {
            if(t.user.profile_link_color && t.user.profile_link_color !== '1DA1F2') {
                let rgb = hex2rgb(t.user.profile_link_color);
                let ratio = contrast(rgb, [27, 40, 54]);
                if(ratio < 4 && vars.darkMode) {
                    t.user.profile_link_color = colorShade(t.user.profile_link_color, 80).slice(1);
                }
                tweet.style.setProperty('--link-color', '#'+t.user.profile_link_color);
            }
        }
    }
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
    t.full_text = t.full_text.replace(/^((?<!\w)@([\w+]{1,15})\s)+/, '')
    let textWithoutLinks = t.full_text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').replace(/(?<!\w)@([\w+]{1,15}\b)/g, '');
    let isEnglish = textWithoutLinks.length < 1 ? {languages:[{language:'en', percentage:100}]} : await chrome.i18n.detectLanguage(textWithoutLinks);
    isEnglish = isEnglish.languages[0] && isEnglish.languages[0].percentage > 60 && isEnglish.languages[0].language.startsWith('en');
    tweet.innerHTML = /*html*/`
        <div class="tweet-top" hidden></div>
        <a class="tweet-avatar-link" href="https://twitter.com/${t.user.screen_name}"><img src="${t.user.profile_image_url_https.replace("_normal", "_bigger")}" alt="${t.user.name}" class="tweet-avatar" width="48" height="48"></a>
        <div class="tweet-header ${options.mainTweet ? 'tweet-header-main' : ''}">
            <a class="tweet-header-info ${options.mainTweet ? 'tweet-header-info-main' : ''}" href="https://twitter.com/${t.user.screen_name}">
                <b class="tweet-header-name ${options.mainTweet ? 'tweet-header-name-main' : ''} ${t.user.verified || t.user.id_str === '1123203847776763904' ? 'user-verified' : ''} ${t.user.protected ? 'user-protected' : ''}">${escapeHTML(t.user.name)}</b>
                <span class="tweet-header-handle">@${t.user.screen_name}</span>
            </a>
            ${options.mainTweet && t.user.id_str !== user.id_str ? `<button class='nice-button tweet-header-follow ${t.user.following ? 'following' : 'follow'}'>${t.user.following ? 'Following' : 'Follow'}</button>` : ''}
        </div>
        <a ${options.mainTweet ? 'hidden' : ''} class="tweet-time" data-timestamp="${new Date(t.created_at).getTime()}" title="${new Date(t.created_at).toLocaleString()}" href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}">${timeElapsed(new Date(t.created_at).getTime())}</a>
        <div class="tweet-body ${options.mainTweet ? 'tweet-body-main' : ''}">
            <span class="tweet-body-text ${t.full_text && t.full_text.length > 100 ? 'tweet-body-text-long' : 'tweet-body-text-short'}">${t.full_text ? escapeHTML(t.full_text).replace(/\n/g, '<br>').replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`).replace(/(?<!\w)#([\w+]+\b)/g, `<a href="https://twitter.com/hashtag/$1">#$1</a>`) : ''}</span>
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
            <a class="tweet-body-quote" href="https://twitter.com/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}">
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
            ${options.mainTweet ? /*html*/`
            <div class="tweet-footer">
                <div class="tweet-footer-stats">
                    <div class="tweet-footer-stat">
                        <span class="tweet-footer-stat-text">Replies</span>
                        <b class="tweet-footer-stat-count tweet-footer-stat-replies">${Number(t.reply_count).toLocaleString().replace(/\s/g, ',')}</b>
                    </div>
                    <a href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments" class="tweet-footer-stat tweet-footer-stat-r">
                        <span class="tweet-footer-stat-text">Retweets</span>
                        <b class="tweet-footer-stat-count tweet-footer-stat-retweets">${Number(t.retweet_count).toLocaleString().replace(/\s/g, ',')}</b>
                    </a>
                    <a href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}/likes" class="tweet-footer-stat tweet-footer-stat-f">
                        <span class="tweet-footer-stat-text">Favorites</span>
                        <b class="tweet-footer-stat-count tweet-footer-stat-favorites">${Number(t.favorite_count).toLocaleString().replace(/\s/g, ',')}</b>
                    </a>
                </div>
                <div class="tweet-footer-favorites"></div>
            </div>
            ` : ''}
            <a ${!options.mainTweet ? 'hidden' : ''} class="tweet-date" title="${new Date(t.created_at).toLocaleString()}" href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}"><br>${new Date(t.created_at).toLocaleString()} ??? ${t.source.split('>')[1].split('<')[0]}</a>
            <div class="tweet-interact">
                <span class="tweet-interact-reply">${options.mainTweet ? '' : t.reply_count}</span>
                <span class="tweet-interact-retweet ${t.retweeted ? 'tweet-interact-retweeted' : ''}">${options.mainTweet ? '' : t.retweet_count}</span>
                <div class="tweet-interact-retweet-menu" hidden>
                    <span class="tweet-interact-retweet-menu-retweet">${t.retweeted ? 'Unretweet' : 'Retweet'}</span><br>
                    <span class="tweet-interact-retweet-menu-quote">Quote tweet</span><br>
                    ${options.mainTweet ? `
                        <span class="tweet-interact-retweet-menu-quotes">See quotes</span><br>
                        <span class="tweet-interact-retweet-menu-retweeters">See retweeters</span><br>
                    ` : ''}
                </div>
                <span class="tweet-interact-favorite ${t.favorited ? 'tweet-interact-favorited' : ''}">${options.mainTweet ? '' : t.favorite_count}</span>
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
                    ${t.user.id_str !== user.id_str && !options.mainTweet ? `
                    <hr>
                    <span class="tweet-interact-more-menu-follow">${t.user.following ? 'Unfollow' : 'Follow'} @${t.user.screen_name}</span><br>
                    ` : ''}
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
            <div class="tweet-self-thread-div" ${options.threadContinuation ? '' : 'hidden'}>
                <span class="tweet-self-thread-line"></span>
                <div class="tweet-self-thread-line-dots"></div>
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
    if(options.mainTweet) {
        let footerFavorites = tweet.getElementsByClassName('tweet-footer-favorites')[0];
        let likers = mainTweetLikers.slice(0, 8);
        for(let i in likers) {
            let liker = likers[i];
            let a = document.createElement('a');
            a.href = `https://twitter.com/${liker.screen_name}`;
            let likerImg = document.createElement('img');
            likerImg.src = liker.profile_image_url_https;
            likerImg.classList.add('tweet-footer-favorites-img');
            likerImg.title = liker.name + ' (@' + liker.screen_name + ')';
            likerImg.width = 24;
            likerImg.height = 24;
            a.appendChild(likerImg);
            footerFavorites.appendChild(a);
        }
        let likesLink = tweet.getElementsByClassName('tweet-footer-stat-f')[0];
        likesLink.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}/likes`);
            updateSubpage();
            mediaToUpload = [];
            linkColors = {};
            cursor = undefined;
            seenReplies = [];
            mainTweetLikers = [];
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            updateLikes(id);
            renderDiscovery();
            renderTrends();
        });
        let retweetsLink = tweet.getElementsByClassName('tweet-footer-stat-r')[0];
        retweetsLink.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments`);
            updateSubpage();
            mediaToUpload = [];
            linkColors = {};
            cursor = undefined;
            seenReplies = [];
            mainTweetLikers = [];
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            updateRetweetsWithComments(id);
            renderDiscovery();
            renderTrends();
        });
    }
    if(options.mainTweet && t.user.id_str !== user.id_str) {
        const tweetFollow = tweet.getElementsByClassName('tweet-header-follow')[0];
        tweetFollow.addEventListener('click', async () => {
            if(t.user.following) {
                await API.unfollowUser(t.user.screen_name);
                tweetFollow.innerText = 'Follow';
                tweetFollow.classList.remove('following');
                tweetFollow.classList.add('follow');
                t.user.following = false;
            } else {
                await API.followUser(t.user.screen_name);
                tweetFollow.innerText = 'Unfollow';
                tweetFollow.classList.remove('follow');
                tweetFollow.classList.add('following');
                t.user.following = true;
            }
        });
    }
    const tweetBodyText = tweet.getElementsByClassName('tweet-body-text')[0];
    const tweetTranslate = tweet.getElementsByClassName('tweet-translate')[0];
    const tweetBodyQuote = tweet.getElementsByClassName('tweet-body-quote')[0];

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

    const tweetFooterReplies = tweet.getElementsByClassName('tweet-footer-stat-replies')[0];
    const tweetFooterRetweets = tweet.getElementsByClassName('tweet-footer-stat-retweets')[0];
    const tweetFooterFavorites = tweet.getElementsByClassName('tweet-footer-stat-favorites')[0];

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
    const tweetInteractRetweetMenuQuotes = tweet.getElementsByClassName('tweet-interact-retweet-menu-quotes')[0];
    const tweetInteractRetweetMenuRetweeters = tweet.getElementsByClassName('tweet-interact-retweet-menu-retweeters')[0];

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

    if(tweetBodyQuote) {
        tweetBodyQuote.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `https://twitter.com/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}`);
            updateSubpage();
            mediaToUpload = [];
            linkColors = {};
            cursor = undefined;
            seenReplies = [];
            mainTweetLikers = [];
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            if(subpage === 'tweet') {
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
        });
    }

    // Translate
    if(tweetTranslate) tweetTranslate.addEventListener('click', async () => {
        let translated = await API.translateTweet(t.id_str);
        tweetTranslate.hidden = true;
        tweetBodyText.innerHTML += `<br>
        <span style="font-size: 12px;color: var(--light-gray);">Translated from [${translated.translated_lang}]:</span>
        <br>
        <span>${escapeHTML(translated.text)}</span>`;
        twemoji.parse(tweetBodyText);
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
        if(options.mainTweet) {
            document.getElementById('new-tweet').click();
            document.getElementById('new-tweet-text').focus();
            return;
        }
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
        if(!options.mainTweet) tweetInteractReply.innerText = parseInt(tweetInteractReply.innerText) + 1;
        else tweetFooterReplies.innerText = parseInt(tweetFooterReplies.innerText) + 1;
        tweetData._ARTIFICIAL = true;
        if(tweet.getElementsByClassName('tweet-self-thread-div')[0]) tweet.getElementsByClassName('tweet-self-thread-div')[0].hidden = false;
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
            if(!options.mainTweet) tweetInteractRetweet.innerText = parseInt(tweetInteractRetweet.innerText) + 1;
            else tweetFooterRetweets.innerText = Number(parseInt(tweetFooterRetweets.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).toLocaleString().replace(/\s/g, ',');
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
            if(!options.mainTweet) tweetInteractRetweet.innerText = parseInt(tweetInteractRetweet.innerText) - 1;
            else tweetFooterRetweets.innerText = Number(parseInt(tweetFooterRetweets.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1).toLocaleString().replace(/\s/g, ',');
            delete t.newTweetId;
        }
    });
    if(options.mainTweet) {
        tweetInteractRetweetMenuQuotes.addEventListener('click', async () => {
            document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments`);
            updateSubpage();
            mediaToUpload = [];
            linkColors = {};
            cursor = undefined;
            seenReplies = [];
            mainTweetLikers = [];
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            if(subpage === 'tweet') {
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
        });
        tweetInteractRetweetMenuRetweeters.addEventListener('click', async () => {
            document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}/retweets`);
            updateSubpage();
            mediaToUpload = [];
            linkColors = {};
            cursor = undefined;
            seenReplies = [];
            mainTweetLikers = [];
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            if(subpage === 'tweet') {
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
        });
    }
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
            if(!options.mainTweet) tweetInteractFavorite.innerText = parseInt(tweetInteractFavorite.innerText) - 1;
            else tweetFooterFavorites.innerText = Number(parseInt(tweetFooterFavorites.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1).toLocaleString().replace(/\s/g, ',');
            tweetInteractFavorite.classList.remove('tweet-interact-favorited');
        } else {
            API.favoriteTweet({
                id: t.id_str
            });
            t.favorited = true;
            t.favorite_count++;
            if(!options.mainTweet) tweetInteractFavorite.innerText = parseInt(tweetInteractFavorite.innerText) + 1;
            else tweetFooterFavorites.innerText = Number(parseInt(tweetFooterFavorites.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).toLocaleString().replace(/\s/g, ',');
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
            Array.from(document.getElementById('timeline').getElementsByClassName(`tweet-id-${t.id_str}`)).forEach(tweet => {
                tweet.remove();
            });
            if(options.after) {
                if(options.after.getElementsByClassName('tweet-self-thread-div')[0]) options.after.getElementsByClassName('tweet-self-thread-div')[0].hidden = true;
                if(!options.after.classList.contains('tweet-main')) options.after.getElementsByClassName('tweet-interact-reply')[0].innerText = (+options.after.getElementsByClassName('tweet-interact-reply')[0].innerText - 1).toString();
                else options.after.getElementsByClassName('tweet-footer-stat-replies')[0].innerText = (+options.after.getElementsByClassName('tweet-footer-stat-replies')[0].innerText - 1).toString();
            }
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
        if(!options.mainTweet) {
            tweetInteractFavorite.innerText = tweetData.favorite_count;
            tweetInteractRetweet.innerText = tweetData.retweet_count;
            tweetInteractReply.innerText = tweetData.reply_count;
        }
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
    twemoji.parse(tweet);
    return tweet;
}

async function renderDiscovery(cache = true) {
    let screen_name = location.pathname.match(/\/([\w+]{1,15}\b)\/status/)[1];
    let discover = await API.peopleRecommendations(screen_name, cache, true);
    let discoverContainer = document.getElementById('wtf-list');
    discoverContainer.innerHTML = '';
    try {
        document.getElementById('wtf-viewall').href = `https://mobile.twitter.com/i/connect_people`;
        discover.forEach(userData => {
            userData = userData.user;
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
        twemoji.parse(trendDiv);
    });
}

// On scroll to end of timeline, load more tweets
let loadingNewTweets = false;
document.addEventListener('scroll', async () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 400) {
        if (!cursor || loadingNewTweets) return;
        loadingNewTweets = true;
        let path = location.pathname;
        if(path.endsWith('/')) path = path.slice(0, -1);
        updateReplies(path.split('/').slice(-1)[0], cursor);
        setTimeout(() => {
            setTimeout(() => {
                loadingNewTweets = false;
            });
        }, 200);
    }
}, { passive: true });

setTimeout(() => {
    // Buttons
    document.getElementById('wtf-refresh').addEventListener('click', async () => {
        renderDiscovery(false);
    });
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
        updateRetweetsWithComments(id, retweetCommentsCursor);
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

    window.addEventListener("popstate", async () => {
        document.getElementById('loading-box').hidden = false;
        updateSubpage();
        mediaToUpload = [];
        linkColors = {};
        cursor = undefined;
        seenReplies = [];
        mainTweetLikers = [];
        let id = location.pathname.match(/status\/(\d{1,32})/)[1];
        if(subpage === 'tweet') {
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
    });
    
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
    updateSubpage();
    let id = location.pathname.match(/status\/(\d{1,32})/)[1];
    if(subpage === 'tweet') {
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
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 10);
    setInterval(renderTrends, 60000 * 5);
}, 250);