let user = {};
let cursor = null;
let end = false;
let linkColors = {};
// /i/topics/1397001890898989057
let topicId = location.pathname.split('/')[3];

function updateUserData() {
    API.account.verifyCredentials().then(async u => {
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
    document.getElementById('user-banner').src = user.profile_banner_url ? user.profile_banner_url : 'https://abs.twimg.com/images/themes/theme1/bg.png';
    document.getElementById('user-avatar').src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`.replace("_normal", "_400x400");
    document.getElementById('wtf-viewall').href = `/i/connect_people?newtwitter=true&user_id=${user.id_str}`;
    document.getElementById('user-avatar-link').href = `/${user.screen_name}`;
    document.getElementById('user-info').href = `/${user.screen_name}`;

    if(vars.enableTwemoji) twemoji.parse(document.getElementById('user-name'));

    if(document.getElementById('user-stats').clientWidth > 300) {
        let style = document.createElement('style');
        style.innerHTML = html`.user-stat-div > h2 { font-size: 10px !important }`;
        document.head.appendChild(style);
    }
}
async function renderTopic(cursorRn) {
    let [topic] = await Promise.all([
        API.topic.landingPage(topicId, cursorRn)
    ]);

    document.getElementsByTagName('title')[0].innerText = `"${topic.header.topic.name}" ` + LOC.topic.message + ` - ` + LOC.twitter.message;
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

let loadingNewTweets = false;

setTimeout(async () => {
    if(!vars) {
        await loadVars();
    }
    document.addEventListener('scroll', async () => {
        // loading new tweets
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 500 && !end) {
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