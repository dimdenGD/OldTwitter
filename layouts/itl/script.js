let user = {};
let tlCursor = null;
let end = false;
let linkColors = {};
let activeTweet;
let subpage = new URLSearchParams(location.search).get('page');
let nid = new URLSearchParams(location.search).get('nid');

function updateUserData() {
    API.account.verifyCredentials().then(async u => {
        user = u;
        userDataFunction(u);
        renderUserData();
    }).catch(e => {
        if (e === "Not logged in") {
            window.location.href = "https://twitter.com/i/flow/login?newtwitter=true";
        }
        console.error(e);
    });
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
    document.getElementById('user-banner').src = user.profile_banner_url;
    document.getElementById('user-avatar').src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`.replace("_normal", "_400x400");
    document.getElementById('wtf-viewall').href = `https://twitter.com/i/connect_people?newtwitter=true&user_id=${user.id_str}`;
    document.getElementById('user-avatar-link').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('user-info').href = `https://twitter.com/${user.screen_name}`;

    document.getElementById('loading-box').hidden = true;
    if(vars.enableTwemoji) twemoji.parse(document.getElementById('user-name'));

    if(document.getElementById('user-stats').clientWidth > 300) {
        let style = document.createElement('style');
        style.innerHTML = `.user-stat-div > h2 { font-size: 10px !important }`;
        document.head.appendChild(style);
    }
}
async function renderDeviceNotificationTimeline(cursor) {
    let tl = await API.notifications.getDeviceFollowTweets(cursor);
    let container = document.getElementById('timeline');
    if (tl.cursor) {
        tlCursor = tl.cursor;
    } else {
        end = true;
    }
    tl = tl.list;
    if(tl.length === 0 && cursor) {
        end = true;
        return;
    }
    for (let i = 0; i < tl.length; i++) {
        let t = tl[i];
        if (t.retweeted_status) {
            await appendTweet(t.retweeted_status, container, {
                bigFont: false,
                top: {
                    text: `<a href="https://twitter.com/${t.user.screen_name}">${escapeHTML(t.user.name)}</a> ${LOC.retweeted.message}`,
                    icon: "\uf006",
                    color: "#77b255",
                    class: 'retweet-label'
                }
            });
        } else {
            await appendTweet(t, container, {
                bigFont: t.full_text.length < 75
            });
        }
    }
}
async function renderLikesTimeline() {
    document.getElementById("itl-header").innerText = LOC.likes.message;
    document.getElementsByTagName('title')[0].innerText = `${LOC.likes.message} - OldTwitter`;
    let tl = await API.notifications.view(nid);
    let tweetContainer = document.getElementById('timeline');
    let userContainer = document.getElementById('user-list');
    for(let i in tl) {
        let d = tl[i];
        if(d.type === 'tweet') {
            if (d.data.retweeted_status) {
                await appendTweet(d.data.retweeted_status, tweetContainer, {
                    bigFont: false,
                    top: {
                        text: `<a href="https://twitter.com/${d.data.user.screen_name}">${escapeHTML(d.data.user.name)}</a> ${LOC.retweeted.message}`,
                        icon: "\uf006",
                        color: "#77b255",
                        class: 'retweet-label'
                    }
                });
            } else {
                await appendTweet(d.data, tweetContainer, {
                    bigFont: d.data.full_text.length < 75
                });
            }
        } else if(d.type === 'user') {
            await appendUser(d.data, userContainer);
        }
    }
}

let lastScroll = Date.now();
let loadingNewTweets = false;
let lastTweetDate = 0;

setTimeout(async () => {
    if(!vars) {
        await loadVars();
    }

    if(!subpage || !['likes', 'device_follow'].includes(subpage) || (subpage === 'likes' && !nid)) {
        location.href = 'https://twitter.com/home';
    }

    // weird bug
    try {
        document.getElementById('wtf-refresh').addEventListener('click', async () => {
            renderDiscovery(false);
        });
    } catch(e) {
        setTimeout(() => location.reload(), 500);
        console.error(e);
        return;
    }
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
                if(activeTweet) {
                    let video = activeTweet.querySelector('.tweet-media > video[controls]');
                    if(video) {
                        video.pause();
                    }
                }
                if(vars.autoplayVideos && !document.getElementsByClassName('modal')[0]) {
                    if(newActiveTweet) {
                        let newVideo = newActiveTweet.querySelector('.tweet-media > video[controls]');
                        let newVideoOverlay = newActiveTweet.querySelector('.tweet-media > .tweet-media-video-overlay');
                        if(newVideo && !newVideo.ended) {
                            newVideo.play();
                        } else if(newVideoOverlay && !newVideoOverlay.style.display) {
                            newVideoOverlay.click();
                        }
                    }
                }
                activeTweet = newActiveTweet;
            }
        }

        // loading new tweets
        if (subpage === 'device_follow' && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500 && !end) {
            if (loadingNewTweets) return;
            loadingNewTweets = true;
            await renderDeviceNotificationTimeline(tlCursor);
            setTimeout(() => {
                loadingNewTweets = false;
            }, 250);
        }
    }, { passive: true });
    
    // Run
    updateUserData();
    renderDiscovery();
    renderTrends();
    if(subpage === 'device_follow') renderDeviceNotificationTimeline();
    else if(subpage === 'likes') renderLikesTimeline();
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 15);
    setInterval(renderTrends, 60000 * 5);
}, 50);