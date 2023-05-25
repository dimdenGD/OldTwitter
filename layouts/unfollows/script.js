let user = {};
let bookmarkCursor = null;
let end = false;
let linkColors = {};
let activeTweet;
let unfollowersPage = location.pathname.includes('/followers');

function updateUserData() {
    API.verifyCredentials().then(async u => {
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
    document.getElementById('user-tweets-div').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('user-following-div').href = `https://twitter.com/${user.screen_name}/following`;
    document.getElementById('user-followers-div').href = `https://twitter.com/${user.screen_name}/followers`;
    document.getElementById('user-banner').src = user.profile_banner_url ? user.profile_banner_url : 'https://abs.twimg.com/images/themes/theme1/bg.png';
    document.getElementById('user-avatar').src = user.profile_image_url_https.replace("_normal", "_400x400");
    document.getElementById('wtf-viewall').href = `https://twitter.com/i/connect_people?newtwitter=true&user_id=${user.id_str}`;
    document.getElementById('user-avatar-link').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('user-info').href = `https://twitter.com/${user.screen_name}`;

    if(vars.enableTwemoji) twemoji.parse(document.getElementById('user-name'));

    document.getElementById('loading-box').hidden = true;
}
function renderUnfollows() {
    chrome.storage.local.get(['unfollows'], async d => {
        let res = d.unfollows;
        if(!res) res = {};
        if(!res[user.id_str]) res[user.id_str] = {
            followers: [],
            following: [],
            unfollowers: [],
            unfollowings: [],
            lastUpdate: 0
        };
        if(res[user.id_str].lastUpdate > Date.now() - 60000 * 15) {
            document.getElementById('update-btn').disabled = true;
            document.getElementById('update-btn').title = LOC.recent_unfollow_update.message;
        } else {
            document.getElementById('update-btn').disabled = false;
            document.getElementById('update-btn').title = '';
        }

        let unfollows = res[user.id_str][unfollowersPage ? 'unfollowers' : 'unfollowings'].sort((a, b) => b[1] - a[1]);
        let timeline = document.getElementById('timeline');
        timeline.innerHTML = '';

        if(unfollows.length === 0) {
            return timeline.innerHTML = `<span style="color:var(--light-gray)">${unfollowersPage ? LOC.no_unfollowers.message : LOC.no_unfollowings.message}</span>`;
        }

        let userData;
        try {
            userData = await API.lookupUsers(unfollows.map(u => u[0]));
        } catch(e) {
            console.error(e);
            if(String(e).includes('No user matches for specified terms.')) {
                return timeline.innerHTML = `<span style="color:var(--light-gray)">${LOC.deleted_accounts.message}</span>`;
            } else {
                return timeline.innerHTML = `<span style="color:#ff4545">${escapeHTML(String(e))}</span>`;
            }
        }

        for(let i = 0; i < unfollows.length; i++) {
            let user = userData.find(u => u.id_str === unfollows[i][0]);
            if(!user) continue;
            
            appendUser(user, timeline, new Date(unfollows[i][1]).toLocaleString());
        }
    });
}

setTimeout(async () => {
    if(!vars) {
        await loadVars();
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

    document.getElementById('utitle').innerText = unfollowersPage ? LOC.unfollowers.message : LOC.unfollowings.message;
    document.getElementById('update-btn').addEventListener('click', async () => {
        chrome.storage.local.get(['unfollows'], async d => {
            let res = d.unfollows;
            if(!res) res = {};
            if(!res[user.id_str]) res[user.id_str] = {
                followers: [],
                following: [],
                unfollowers: [],
                unfollowings: [],
                lastUpdate: 0
            };
            await updateUnfollows(res);
            renderUnfollows();
        });
    });

    // Run
    updateUserData();
    renderUnfollows();
    renderDiscovery();
    renderTrends();
    document.getElementById('loading-box').hidden = true;
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 15);
    setInterval(renderTrends, 60000 * 5);
}, 50);