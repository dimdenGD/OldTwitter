let user = {};
let bookmarkCursor = null;
let end = false;
let linkColors = {};
let unfollowersPage = location.pathname.includes('/followers');
let lastPage = 0, loading = true;

function updateUserData() {
    API.account.verifyCredentials().then(async u => {
        user = u;
        userDataFunction(u);
        renderUserData();
        renderUnfollows();
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
    document.getElementById('user-tweets-div').href = `/${user.screen_name}`;
    document.getElementById('user-following-div').href = `/${user.screen_name}/following`;
    document.getElementById('user-followers-div').href = `/${user.screen_name}/followers`;
    document.getElementById('user-banner').src = user.profile_banner_url ? user.profile_banner_url : 'https://abs.twimg.com/images/themes/theme1/bg.png';
    document.getElementById('user-avatar').src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`.replace("_normal", "_400x400");
    document.getElementById('wtf-viewall').href = `/i/connect_people?newtwitter=true&user_id=${user.id_str}`;
    document.getElementById('user-avatar-link').href = `/${user.screen_name}`;
    document.getElementById('user-info').href = `/${user.screen_name}`;

    if(user.followers_count > 50000 || user.friends_count > 50000) {
        document.getElementById('timeline').innerHTML = html`<span style="color:var(--light-gray)">${LOC.not_possible_to_see_unfollowers.message}</span>`;
    }

    if(vars.enableTwemoji) twemoji.parse(document.getElementById('user-name'));

    document.getElementById('loading-box').hidden = true;

    if(document.getElementById('user-stats').clientWidth > 300) {
        let style = document.createElement('style');
        style.innerHTML = html`.user-stat-div > h2 { font-size: 10px !important }`;
        document.head.appendChild(style);
    }
}
function renderUnfollows(page = 0) {
    chrome.storage.local.get(['unfollows'], async d => {
        loading = true;
        if(user.followers_count && (user.followers_count > 50000 || user.friends_count > 50000)) {
            return;
        }

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

        let raw = res[user.id_str][unfollowersPage ? 'unfollowers' : 'unfollowings'].sort((a, b) => b[1] - a[1]);
        let unfollows = raw.slice(page * 100, page * 100 + 100);
        let timeline = document.getElementById('timeline');
        if(page === 0) timeline.innerHTML = '';

        if(unfollows.length === 0) {
            return timeline.innerHTML = html`<span style="color:var(--light-gray)">${unfollowersPage ? LOC.no_unfollowers.message : LOC.no_unfollowings.message}</span>`;
        }

        let userData;
        try {
            userData = await API.user.lookupV2(unfollows.map(u => u[0]));
        } catch(e) {
            console.error(e);
            if(String(e).includes('No user matches for specified terms.')) {
                return timeline.innerHTML = html`<span style="color:var(--light-gray)">${LOC.deleted_accounts.message}</span>`;
            } else {
                return timeline.innerHTML = html`<span style="color:#ff4545">${escapeHTML(String(e))}</span>`;
            }
        }
        document.getElementById('load-more').hidden = raw.length < page * 100 + 100;
        document.getElementById('load-more').innerText = LOC.load_more.message;
        lastPage = page;

        for(let i = 0; i < unfollows.length; i++) {
            let user = userData.find(u => u.id_str === unfollows[i][0]);
            if(!user) continue;
            if(unfollowersPage) {
                if(user.followed_by) continue;
            } else {
                if(user.following) continue;
            }
            if(unfollowersPage && user.id_str === '1708130407663759360') continue; // dimden
            
            appendUser(user, timeline, new Date(unfollows[i][1]).toLocaleString());
        }
        loading = false;
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
        setTimeout(() => location.reload(), 2500);
        console.error(e);
        return;
    }

    document.getElementById('utitle').innerText = unfollowersPage ? LOC.unfollowers.message : LOC.unfollowings.message;
    document.getElementsByTagName('title')[0].innerText = unfollowersPage ? LOC.unfollowers.message : LOC.unfollowings.message;
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
            lastPage = 0;
            renderUnfollows();
        });
    });
    document.getElementById('load-more').addEventListener('click', () => {
        if(loading) return;
        document.getElementById('load-more').innerText = LOC.loading.message;
        renderUnfollows(lastPage + 1)
    });

    // Run
    updateUserData();
    renderDiscovery();
    renderTrends();
    document.getElementById('loading-box').hidden = true;
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 15);
    setInterval(renderTrends, 60000 * 5);
}, 50);