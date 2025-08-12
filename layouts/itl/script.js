let user = {};
let tlCursor = null;
let end = false;
let linkColors = {};
let subpage = new URLSearchParams(location.search).get('page');
let nid = new URLSearchParams(location.search).get('nid');

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

    document.getElementById('loading-box').hidden = true;
    if(vars.enableTwemoji) twemoji.parse(document.getElementById('user-name'));

    if(document.getElementById('user-stats').clientWidth > 300) {
        let style = document.createElement('style');
        style.innerHTML = html`.user-stat-div > h2 { font-size: 10px !important }`;
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
                    text: html`<a href="/${t.user.screen_name}">${t.user.name}</a> ${LOC.retweeted.message}`,
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
    document.getElementById("itl-header").innerText = vars.heartsNotStars? LOC.likes.message : LOC.favorites.message;
    document.getElementsByTagName('title')[0].innerText = vars.heartsNotStars? LOC.likes.message : LOC.favorites.message + ` - ` + LOC.twitter.message;
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
                        text: html`<a href="/${d.data.user.screen_name}">${d.data.user.name}</a> ${LOC.retweeted.message}`,
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
async function renderListsTimeline() {
    document.getElementById("itl-header").innerText = LOC.lists.message;
    document.getElementsByTagName('title')[0].innerText = LOC.lists.message + ` - ` + LOC.twitter.message;
    let lists = await API.notifications.view(nid);
    let container = document.getElementById('timeline');
    let userContainer = document.getElementById('user-list');
    userContainer.hidden = true;
    container.classList.add('box');
    container.style.padding = '10px';
    
    for(let i in lists) {
        let l = lists[i];
        if(!l || l.type !== 'list') continue;
        l = l.data;
        let listElement = document.createElement('div');
        listElement.classList.add('list-item');
        listElement.innerHTML = html`
            <div>
                <a href="/i/lists/${l.id_str}" class="following-item-link">
                    <img style="object-fit: cover;" src="${l.custom_banner_media ? l.custom_banner_media.media_info.original_img_url : l.default_banner_media.media_info.original_img_url}" alt="${l.name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                    <div class="following-item-text" style="position: relative;bottom: 12px;">
                        <span class="tweet-header-name following-item-name${l.mode === 'Private' ? ' user-protected' : ''}" style="font-size: 18px;">${escapeHTML(l.name)}</span><br>
                        <span style="color:var(--darker-gray);font-size:14px;margin-top:2px">${l.description ? escapeHTML(l.description).slice(0, 52) : LOC.no_description.message}</span>
                    </div>
                </a>
            </div>
        `;
        container.appendChild(listElement);
    }
}

let loadingNewTweets = false;

setTimeout(async () => {
    if(!vars) {
        await loadVars();
    }

    if(!subpage || !['likes', 'device_follow', 'lists'].includes(subpage) || (subpage === 'likes' && !nid)) {
        location.href = '/home';
    }

    // weird bug
    try {
        document.getElementById('wtf-refresh').addEventListener('click', async () => {
            renderDiscovery(false);
        });
    } catch(e) {
        setTimeout(() => location.reload(), 2500);
        console.error(e);
        return;
    }
    document.addEventListener('scroll', async () => {
        // loading new tweets
        if (subpage === 'device_follow' && (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 500 && !end) {
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
    else if(subpage === 'lists') renderListsTimeline(nid);
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 15);
    setInterval(renderTrends, 60000 * 5);
}, 50);