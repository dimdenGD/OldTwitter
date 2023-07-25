let user = {};
let cursor = null;
let end = false;
let linkColors = {};
let activeTweet;
// /i/topics/1397001890898989057
let topicId = location.pathname.split('/')[3];

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
    document.getElementById('user-tweets').innerText = Number(user.statuses_count).toLocaleString().replace(/\s/g, ',');
    if(user.statuses_count >= 100000) {
        let style = document.createElement('style');
        style.innerText = `
            .user-stat-div > h1 { font-size: 18px !important }
            .user-stat-div > h2 { font-size: 13px !important }
        `;
        document.head.appendChild(style);
    }
    document.getElementById('user-following').innerText = Number(user.friends_count).toLocaleString().replace(/\s/g, ',');
    document.getElementById('user-followers').innerText = Number(user.followers_count).toLocaleString().replace(/\s/g, ',');
    document.getElementById('user-banner').src = user.profile_banner_url;
    document.getElementById('user-avatar').src = `${(user.profile_image_url_https.includes('default_profile_images') && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_normal.png`): user.profile_image_url_https}`.replace("_normal", "_400x400");
    document.getElementById('wtf-viewall').href = `https://twitter.com/i/connect_people?newtwitter=true&user_id=${user.id_str}`;
    document.getElementById('user-avatar-link').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('user-info').href = `https://twitter.com/${user.screen_name}`;

    if(vars.enableTwemoji) twemoji.parse(document.getElementById('user-name'));

    if(document.getElementById('user-stats').clientWidth > 300) {
        let style = document.createElement('style');
        style.innerHTML = `.user-stat-div > h2 { font-size: 10px !important }`;
        document.head.appendChild(style);
    }
}
async function renderTopic(cursorRn) {
    let [topic] = await Promise.all([
        API.topic.landingPage(topicId, cursorRn)
    ]);

    document.getElementsByTagName('title')[0].innerText = `"${topic.header.topic.name}" Topic - OldTwitter`;
    document.getElementById("topic-name").innerText = topic.header.topic.name;
    document.getElementById("topic-description").innerText = topic.header.topic.description;
    if(topic.header.topic.not_interested) {
        document.getElementById("topic-not-interested").hidden = false;
        document.getElementById("topic-interested").hidden = true;
    } else {
        document.getElementById("topic-not-interested").hidden = true;
        document.getElementById("topic-interested").hidden = false;
    }
    if(topic.header.topic.following) {
        document.getElementById('topic-not-interested-btn').hidden = true;
        document.getElementById('topic-follow-control').innerText = LOC.following.message;
        document.getElementById('topic-follow-control').classList.add("topic-following");
        document.getElementById('topic-follow-control').classList.remove("topic-follow");
    } else {
        document.getElementById('topic-not-interested-btn').hidden = false;
        document.getElementById('topic-follow-control').innerText = LOC.follow.message;
        document.getElementById('topic-follow-control').classList.add("topic-follow");
        document.getElementById('topic-follow-control').classList.remove("topic-following");
    }

    let entries = topic.body.timeline.instructions.find(i => i.type === "TimelineAddEntries").entries;
    cursor = entries.find(e => e.entryId.startsWith("cursor-bottom")).content.value;
    let tweets = entries.filter(e => e.entryId.startsWith('tweet-')).map(e => {
        let result = e.content.itemContent.tweet_results.result;
        if(!result || !result.legacy) return;
        result.legacy.id_str = result.rest_id;
        result.legacy.user = result.core.user_results.result;
        result.legacy.user.legacy.id_str = result.legacy.user.rest_id;
        result.legacy.user = result.legacy.user.legacy;
        return result.legacy;
    }).filter(i => !!i);

    let tl = document.getElementById("timeline");
    for(let i in tweets) {
        await appendTweet(tweets[i], tl, {
            bigFont: tweets[i].full_text.length < 75
        });
    }
}

let lastScroll = Date.now();
let loadingNewTweets = false;
let lastTweetDate = 0;

setTimeout(async () => {
    if(!vars) {
        await loadVars();
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
                if(vars.autoplayVideos && !document.getElementsByClassName('modal')[0]) {
                    if(activeTweet) {
                        let video = activeTweet.querySelector('.tweet-media > video[controls]');
                        if(video) {
                            video.pause();
                        }
                    }
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
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500 && !end) {
            if (loadingNewTweets) return;
            loadingNewTweets = true;
            await renderTopic(cursor);
            setTimeout(() => {
                loadingNewTweets = false;
            }, 250);
        }
    }, { passive: true });

    // weird bug
    if(!document.getElementById('wtf-refresh')) {
        return setTimeout(() => location.reload(), 500);
    }
    try {
        document.getElementById('wtf-refresh').addEventListener('click', async () => {
            renderDiscovery(false);
        });
    } catch(e) {
        setTimeout(() => location.reload(), 500);
        console.error(e);
        return;
    }
    document.getElementById('topic-not-interested-btn').addEventListener('click', async () => {
        try {
            await API.topic.notInterested(topicId);
        } catch(e) {
            console.error(e);
            alert(e);
            return;
        }
        document.getElementById("topic-not-interested").hidden = false;
        document.getElementById("topic-interested").hidden = true;
    });
    document.getElementById('topic-not-interested-cancel').addEventListener('click', async () => {
        try {
            await API.topic.undoNotInterested(topicId);
        } catch(e) {
            console.error(e);
            alert(e);
            return;
        }
        document.getElementById("topic-not-interested").hidden = true;
        document.getElementById("topic-interested").hidden = false;
    });
    document.getElementById('topic-follow-control').addEventListener('click', async e => {
        if(e.target.className.includes('topic-following')) {
            try {
                await API.topic.unfollow(topicId);
            } catch(e) {
                console.error(e);
                alert(e);
                return;
            }
            document.getElementById('topic-follow-control').classList.remove('topic-following');
            document.getElementById('topic-follow-control').classList.add('topic-follow');
            document.getElementById('topic-follow-control').innerText = LOC.follow.message;
            document.getElementById('topic-not-interested-btn').hidden = false;
        } else {
            try {
                await API.topic.follow(topicId);
            } catch(e) {
                console.error(e);
                alert(e);
                return;
            }
            document.getElementById('topic-follow-control').classList.remove('topic-follow');
            document.getElementById('topic-follow-control').classList.add('topic-following');
            document.getElementById('topic-follow-control').innerText = LOC.following.message;
            document.getElementById('topic-not-interested-btn').hidden = true;
        }
    });
    
    // Run
    updateUserData();
    renderDiscovery();
    renderTrends();
    renderTopic();
    document.getElementById('loading-box').hidden = true;
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 15);
    setInterval(renderTrends, 60000 * 5);
}, 50);