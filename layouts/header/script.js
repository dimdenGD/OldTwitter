let headerGotUser = false;
let savedSearches = [], lastSearches = [];
let inboxData = [];
let followRequestsData = [];
let customSet = false;
let menuFn;
let notificationsOpened = false, inboxOpened = false;
let isDarkModeEnabled = typeof vars !== 'undefined' ? (vars.darkMode || (vars.timeMode && isDark())) : false;
let activeTweet;
let seenAlgoTweets = [], algoTweetsChanged = false;
let tweetUrlToShareInDMs = null;
let legacyReactionKeys = {
    'agree': '👍',
    'disagree': '👎',
    'funny': '😂',
    'sad': '😢',
    'surprised': '😲',
    'excited': '🔥',
    'like': '❤️'
}
setInterval(() => {
    if(!algoTweetsChanged) return;
    algoTweetsChanged = false;
    chrome.storage.local.set({seenAlgoTweets}, () => {});
}, 20000);

const keysHeld = {};
const notificationBus = new BroadcastChannel('notification_bus');
notificationBus.onmessage = function (e) {
    if(e.data.type === 'markAsRead') {
        let notifElement = document.getElementById('notifications-count');
        let icon = document.getElementById('site-icon');

        notifElement.hidden = true;
        icon.href = chrome.runtime.getURL(`images/logo32${vars.useNewIcon ? '_new' : ''}.png`);
        if(document.title.startsWith("(")) {
            document.title = document.title.split(') ').slice(1).join(') ');
        }
    }
};
const customCSSBus = new BroadcastChannel('custom_css_bus');
customCSSBus.onmessage = function (e) {
    if(e.data.type === 'vars') {
        switchDarkMode(isDarkModeEnabled);
    } else if(e.data.type === 'css') {
        updateCustomCSS();
    } else if(e.data.type === 'color') {
        if(typeof customSet === 'undefined' || !customSet) {
            document.querySelector(':root').style.setProperty('--link-color', e.data.color);
        }
    }
};

const themeBus = new BroadcastChannel('theme_bus');
themeBus.onmessage = function (e) {
    isDarkModeEnabled = e.data[0];
    vars.pitchBlack = e.data[1];
    switchDarkMode(isDarkModeEnabled);
}
const roundAvatarBus = new BroadcastChannel('round_avatar_bus');
roundAvatarBus.onmessage = function (e) {
    switchRoundAvatars(e.data);
}
const modernUIBus = new BroadcastChannel('modern_ui_bus');
modernUIBus.onmessage = function (e) {
    switchUIButtons(e.data);
}

let roundAvatarsEnabled = false;
function switchRoundAvatars(enabled) {
    roundAvatarsEnabled = enabled;
    if(enabled) {
        let style = document.createElement('style');
        style.id = 'round-avatars';
        style.innerHTML = html`
            .navbar-user-account-avatar,
            .search-result-item-avatar,
            .inbox-message-avatar,
            .message-header-avatar,
            #user-avatar,
            .tweet-avatar,
            .tweet-avatar-quote,
            #profile-avatar,
            #navbar-user-avatar,
            .tweet-footer-favorites-img,
            #list-avatar,
            .message-element > a > img,
            .notification-avatar-img,
            #nav-profile-avatar,
            .profile-friends-avatar,
            .message-avatar {
                border-radius: 50% !important;
            }
        `;
        document.head.appendChild(style);
    } else {
        let style = document.getElementById('round-avatars');
        if(style) style.remove();
    }
}


let modernUIEnabled = false;
function switchModernUI(enabled) {
    modernUIEnabled = enabled;
    if(enabled) {
        let style = document.createElement('style');
        style.id = 'modern-ui';
        style.innerHTML = /*css*/`
            /* buttons */
            .nice-button {
                border-radius: 999px !important;
                background-image: var(--link-color);
                background-color: var(--link-color);
                border: none;
                color: white;
            }
            .nice-button:hover:not([disabled]) {
                filter: brightness(0.9);
                background-image: var(--link-color);
                background-color: var(--link-color);
                color: white;
            }
            .nice-button:disabled {
                color: white !important;
                opacity:0.6;
            }
            .nice-button:disabled:before {
                color: white !important;
                opacity:0.6;
            }
            .nice-red-button {
                color: #white !important;
                background-image: #BA172C !important;
                background-color: #BA172C !important;
            }
            .nice-red-button:hover:not([disabled]) {
                color: white !important;
                background-image: #BA172C !important;
                background-color: #BA172C !important;
            }
            #navbar-tweet-button {
                border-radius: 999px !important;
                background-image: var(--link-color);
                background-color: var(--link-color);
                border: none !important;
                color: white;
                font-weight: bold;
            }
            .tweet-header-follow {
                padding: 7px 12px 11px 12px !important;
            }
            #tweet-to{
                border-radius: 999px !important;
                background-image: var(--link-color);
                background-color: var(--link-color);
                border: none;
                color: white !important;
                font-weight: bold;
                text-align: center;
            }
            #tweet-to:hover:not([disabled]){
                filter: brightness(0.9);
                background-image: var(--link-color);
                background-color: var(--link-color);
                color: white;
            }
            #tweet-to-div,
            #tweet-to-bg{
                padding: 0;
                border: 0;
                background-color: rgba(0,0,0,0);
            }
            /* Remove Icon */
            #navbar-tweet-button:before,
            .navbar-new-tweet-button:before,
            .new-tweet-button:before,
            #new-tweet-button:before,
            .tweet-reply-button:before,
            .tweet-quote-button:before,
            .follow:before,
            .following:before,
            #edit-profile:before,
            #control-unblock:before  {
                content: "";
                margin-right: 0;
            }
            /* some white button */
            .follow,
            #message-user,
            #edit-profile, 
            #profile-style, 
            #see-tweet-btn,
            .inbox-refresh,
            .inbox-readall
            {
                border: 1px solid var(--link-color); !important;
                color:var(--link-color);
                background-image: var(--background-color) !important;
                background-color: var(--background-color) !important;
            }
            .follow:hover:not([disabled]),
            #message-user:hover:not([disabled]),
            #edit-profile:hover:not([disabled]), 
            #profile-style:hover:not([disabled]), 
            #see-tweet-btn:hover:not([disabled]),
            .inbox-refresh:hover:not([disabled]),
            .inbox-readall:hover:not([disabled]) {
                filter: brightness(0.9);
                border: 1px solid var(--link-color); !important;
                color:var(--link-color);
                background-image: var(--background-color) !important;
                background-color: var(--background-color) !important;
            }
            #message-user:before,
            #message-user:hover:before,
            #profile-style:before,
            .inbox-refresh-icon:before,
            .inbox-readall-icon:before  {
                color:var(--link-color);
            } 
            #edit-profile:before  {
                width: auto;
            }
            /* DM message bubble */
            .message-element-self .message-body {
                border-radius: 15px 15px 0 15px;
            }
            .message-element-other .message-body {
                border-radius: 15px 15px 15px 0;
            }
            .message-element-self .message-body:after,
            .message-element-other .message-body:after  {
                margin-top: 0;
                margin-left: 0;
                margin-right: 0;
                border: 0;

            }
            .profile-block{
                width:calc(36px + 6px);
            }
            .profile-block>a>img{
                width:36px;
                height:36px;
            }
            .message-element-self.message-element-continue .message-body,
            .message-element-other.message-element-continue .message-body { 
                border-radius: 15px 15px 15px 15px;
            }
            /* Sidebar or else */
            #wtf h1,
            #trends h1,
            #settings h1,
            #bookmarks h1,
            #unfollows h1,
            #itl h1 {
                color: var(--almost-black);
                font-size: 18px;
                font-weight: 600;
            }
            #settings h2 {
                color: var(--almost-black);
                font-size: 16px;
                font-weight: 600;
            }
            .cool-header,
            .nice-header {
                color: var(--almost-black);
                font-size: 22px !important;
                font-weight: 600;
            }
            .tweet-interact span,
            .tweet-interact span:before {
                color: var(--darker-gray);

            }
            /* Bold Text */
            .user-stat-div > h2,
            .nav-text,
            #tweet-nav-tweets,
            #tweet-nav-replies,
            #tweet-nav-replies>span,
            #tweet-nav-media,
            #tweet-nav-media>span,
            .profile-stat-text {
                font-weight: 600;
            }
            
            .trend-description {
                font-size: 12px;
            }

            .tweet-top-icon  {
                color: var(--light-gray) !important;
            }
            #search-input, #user-search-input {
                background-color: var(--dark-background-color);
            }
            #wtf-refresh, #wtf-viewall, #trends-refresh, #trends-viewall {
                color: var(--link-color);
            }

            /* No round */
            .box,
            #user-banner,
            #timeline-type-center,
            #timeline-type-right,
            #notifications-div>:first-child,
            .tweet:first-child,
            #tweet-nav,
            #save-search-right,
            #save-search-left {
                border-radius: 0px;
            }
            .modal-content {
                border: none;
            }
            .profile-media-preview {
                border-radius: 5px !important;
            }
            /* More Round */
            #new-tweet-text,
            .message-new-input,
            #tweet-to,
            .new-tweet-text{
                border-radius: 8px;
            }
            .tweet-media-element,
            .tweet-body-quote,
            .tweet-media-video-overlay,
            .tweet-card-link.box {
                border-radius: 15px;
            }
            /* No UpperCase */
            .user-stat-div > h2,
            .profile-stat-text,
            #profile-following-follower-mobile   {
                text-transform: none;
            }
            /* Profile */
            .profile-stat-text {
                font-size: 12px;
            }
            .profile-stat-value {
                font-weight: bolder;
                color: var(--darker-gray);
            }
            .profile-stat-active > .profile-stat-value,
            .profile-stat:hover > .profile-stat-value {
                color: var(--link-color);
            }
            #profile-nav {
                box-shadow: 0 1px 3px 0 rgba(0,0,0,0.25);
                border-bottom: none;
            }
            .about,
            .about-links a,
            .about-links span,
            .open-new-twitter {
                color: var(--darker-gray)
            }
            /* Mobile UI */
            @media screen and (max-width: 590px) {
                #navbar-tweet-button:before  {
                    content: "\\f029" !important;
                    color: white;
                }
                #tweet-to-div,
                #tweet-to-bg{
                    border-radius: 999px !important;
                    background-color: rgba(0,0,0,0);
                }
                #tweet-to-div {
                    background-image: var(--link-color);
                    background-color: var(--link-color);
                    border: none !important;
                    color: white;
                    font-weight: bold;
                }
            }

        `;
        document.head.appendChild(style);
        document.body.classList.add('body-modern-ui');
        document.body.classList.remove('body-old-ui');
    } else {
        let style = document.getElementById('modern-ui');
        if(style) style.remove();
        document.body.classList.remove('body-modern-ui');
        document.body.classList.add('body-old-ui');
    }
}

function hideStuff() {
    let hs = document.getElementById('hide-style');
    if(hs) hs.remove();
    let hideStyle = document.createElement('style');
    hideStyle.id = 'hide-style';
    if(vars.hideTrends) {
        hideStyle.innerHTML += '#trends { display: none !important; }';
    }
    if(vars.hideWtf) {
        hideStyle.innerHTML += '#wtf { display: none !important; }';
    }
    if(vars.hideLikes) {
        hideStyle.innerHTML += html`
            .tweet-interact-favorite { color: var(--background-color) !important }
            .tweet-interact-retweet { color: var(--background-color) !important }
            .tweet-interact-reply { color: var(--background-color) !important }
            .tweet-interact-bookmark { color: var(--background-color) !important }
            .tweet:hover .tweet-interact-favorite { color: var(--dark-background-color) !important }
            .tweet:hover .tweet-interact-retweet { color: var(--dark-background-color) !important }
            .tweet:hover .tweet-interact-reply { color: var(--dark-background-color) !important }
            .tweet:hover .tweet-interact-bookmark { color: var(--dark-background-color) !important }
        `;
    }if(vars.hideTimelineTypes) {
        hideStyle.innerHTML += html`
            #timeline-type-center { display: none !important; }
            #timeline-type-right { display: none !important; }
        `;
    }
    if(vars.hideFollowers) {
        hideStyle.innerHTML += html`
            #user-followers-div { display: none !important; }
            #profile-stat-followers-link { display: none !important; }
            #profile-stat-follower-mobile-out { display: none !important; }
            #navbar-user-menu-unfollowers { display: none !important; }
        `;
    }
    if(vars.showBookmarkCount && vars.seeTweetViews) {
        hideStyle.innerHTML += html`
            .tweet-interact-more-menu { margin-left: 250px }
        `;
    }
    if(vars.hideUnfollowersPage) {
        hideStyle.innerHTML += html`
            #navbar-user-menu-unfollowers { display: none !important; }
            .unfollowers-link { display: none !important; }
        `;
    }
    if(hideStyle.innerHTML !== '') {
        document.head.appendChild(hideStyle);
    }
}

let userDataFunction = async user => {
    if(headerGotUser || Object.keys(user).length === 0) return;
    headerGotUser = true;
    let userAvatar = document.getElementById('navbar-user-avatar');
    userAvatar.src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`.replace('_normal.', '_bigger.');
    document.getElementById('navbar-user-menu-profile').href = `/${user.screen_name}`;
    document.getElementById('navbar-user-menu-lists').href = `/${user.screen_name}/lists`;
    let menuUserName = document.getElementById('navbar-user-menu-username');
    menuUserName.innerText = user.name;
    document.getElementById('pin-profile').hidden = !vars.pinProfileOnNavbar;
    document.getElementById('pin-bookmarks').hidden = !vars.pinBookmarksOnNavbar;
    document.getElementById('pin-lists').hidden = !vars.pinListsOnNavbar;
    document.getElementById('pin-profile').href = `/${user.screen_name}`;
    document.getElementById('pin-lists').href = `/${user.screen_name}/lists`;

    if(vars.enableTwemoji) twemoji.parse(menuUserName);

    let root = document.querySelector(":root");

    if(!customSet && vars.linkColor) {
        root.style.setProperty('--link-color', vars.linkColor);
    }
    if(vars.font) {
        root.style.setProperty('--font', `"${vars.font}"`);
    }
    if(vars.tweetFont) {
        root.style.setProperty('--tweet-font', `"${vars.tweetFont}"`);
    }
    if(vars.modernUI){
        root.style.setProperty('--icon-font', `"edgeicons", "RosettaIcons"`);
        root.style.setProperty('--home-icon-active', '"\\f553"');
        root.style.setProperty('--notification-icon-active', '"\\f019"');
        root.style.setProperty('--messages-icon-active', '"\\f554"');
        root.style.setProperty('--profile-icon-active', '"\\f002"');
        //root.style.setProperty('--bookmark-icon-active', '"\\f093"');/* Not exist */
        root.style.setProperty('--lists-icon-active', '"\\f012"');
        root.style.setProperty('--at-icon', '"\\f064"');
        root.style.setProperty('--add-media-icon', '"\\f027"');
        root.style.setProperty('--birthday-icon', '"\\f092"');
        root.style.setProperty('--joined-icon', '"\\f203"');
    }
    console.log(vars);
    if(vars.heartsNotStars) {
        root.style.setProperty('--favorite-icon-content', '"\\f148"');
        root.style.setProperty('--favorite-icon-content-notif', '"\\f015"');
        root.style.setProperty('--favorite-icon-color', 'rgb(249, 24, 128)');
        if(vars.modernUI){//Rosetta does not have
            root.style.setProperty('--favorite-icon-content-click', '"\\f015"');
        }
        else{
            root.style.setProperty('--favorite-icon-content-click', '"\\f148"');
        }
    }
    else{   
        //edgeIcon Font does not have this font
        //We need to make newone?
        if(vars.modernUI){
            root.style.setProperty('--favorite-icon-content-notif', '"\\f147"');
        }
    }

    if(vars.roundAvatars) {
        switchRoundAvatars(true);
    }
    if(vars.modernUI) {
        switchModernUI(true);
    }

    if(vars.disableHotkeys) {
        document.getElementById('navbar-tweet-button').title = '';
        document.getElementById('search').title = '';
    }

    // util
    let firstTime = false;
    async function updateUnread() {
        let unread;
        try {
            unread = await API.notifications.getUnreadCount(firstTime);
        } catch {
            unread = { dm_unread_count: 0, ntab_unread_count: 0, total_unread_count: 0 };
        }
        if(!firstTime) firstTime = true;
        let dms = unread.dm_unread_count;
        let notifs = unread.ntab_unread_count;
        let total = unread.total_unread_count;
        let dmsElement = document.getElementById('messages-count');
        let notifElement = document.getElementById('notifications-count');
        let icon = document.getElementById('site-icon');
        if(location.pathname.startsWith('/notifications')) {
            notifs = 0;
        }
        let inboxModal = document.getElementsByClassName('inbox-modal')[0];
        if(inboxModal) {
            dms = 0;
        }
        total = dms + notifs;
        if(dms > 0) {
            dmsElement.hidden = false;
            dmsElement.innerText = dms > 20 ? '20+' : dms;
        } else {
            dmsElement.hidden = true;
        }
        if(notifs > 0) {
            notifElement.hidden = false;
            notifElement.innerText = notifs > 20 ? '20+' : notifs;
        } else {
            notifElement.hidden = true;
        }
        icon.href = total > 0 ? chrome.runtime.getURL(`images/logo32${vars.useNewIcon ? '_new' : ''}_notification.png`) : chrome.runtime.getURL(`images/logo32${vars.useNewIcon ? '_new' : ''}.png`);
        if(total > 0) {
            let newTitle = document.title;
            if(document.title.startsWith('(')) {
                newTitle = document.title.split(') ')[1];
            }
            newTitle = `(${total > 40 ? '40+' : total}) ${newTitle}`;
            if(document.title !== newTitle) {
                document.title = newTitle;
            }
        } else {
            if(document.title.startsWith('(')) {
                document.title = document.title.split(') ').slice(1).join(') ');
            }
        }
    }
    async function updateAccounts() {
        let accounts = (await API.account.getAccounts()).users;
        let accountsElement = document.getElementById('navbar-user-accounts');
        accountsElement.innerHTML = '';
        accounts.forEach(async account => {
            let accountUnreads;
            try {
                accountUnreads = await API.notifications.getUnreadCount(true, user.id_str !== account.user_id ? account.user_id : undefined);
            } catch {
                accountUnreads = { total_unread_count: 0 };
            }
            let accountElement = document.createElement('div');
            accountElement.classList.add('navbar-user-account');
            accountElement.innerHTML = html`<img src="${account.avatar_image_url.replace("_normal", "_bigger")}" class="navbar-user-account-avatar" width="16" height="16"> ${account.screen_name}`;
            let unreadCount = accountUnreads.total_unread_count >= 21 ? '20+' : accountUnreads.total_unread_count;
            if (unreadCount != 0) {
                accountElement.innerHTML += html` <span class="navbar-user-account-notifications">${unreadCount}</span>`;
            }
            accountElement.addEventListener('click', async () => {
                if(account.screen_name === user.screen_name) return alert("You're already on this account!");
                try {
                    await API.account.switch(account.user_id);
                    window.location.reload();
                } catch(e) {
                    if((typeof(e) === 'string' && e.includes('User not found.')) || e.errors[0].code === 50) {
                        window.location = '/account/switch?newtwitter=true';
                    } else {
                        alert(e);
                    }
                    console.error(e);
                }
            });
            accountsElement.appendChild(accountElement, document.createElement('br'));
        });
        document.getElementById('navbar-user-menu-logout').addEventListener('click', async () => {
            let modal = createModal(html`
                <h1 class="cool-header">${LOC.logout_title.message}</h1><br>
                <span style="font-size:14px;color:var(--almost-black)">${LOC.logout_desc_1.message}<br>
                ${LOC.logout_desc_2.message}</span>
                <br><br>
                <div style="display:inline-block;float: right;margin-top: 5px;">
                    <button class="nice-button nice-red-button">${LOC.logout_button.message}</button>
                </div>
            `);
            let button = modal.querySelector('button');
            button.addEventListener('click', async () => {
                await API.account.logout();
                window.location.reload();
            });
        });
    }
    async function updateInboxData(conversationIds) {
        let inboxModal = document.getElementsByClassName('inbox-modal')[0];
        if(inboxModal && inboxModal.scrollTop > 600 && cursor && !update) return;
        inboxData = await API.inbox.get();
        if(inboxData.status === "HAS_MORE" && !cursor) {
            cursor = inboxData.min_entry_id;
        } else {
            cursor = undefined;
        };
        if(inboxModal && conversationIds) {
            let inboxList = inboxModal.querySelector('.inbox-list');
            renderInboxMessages(inboxData, inboxList, conversationIds);
        }

        return true;
    }

    // follow requests
    if(user.protected) {
        let followRequests = document.getElementById('navbar-user-menu-requests');
        let followRequestsCount = document.getElementById('follow-request-count');
        followRequests.style.display = 'flex';

        async function updateFollowRequests() {
            let list = document.querySelector('.follow-requests-list');
            let newUserData = await Promise.all(followRequestsData.ids.filter(i => typeof i === 'string').map(i => API.user.get(i)));
            for(let i = 0; i < newUserData.length; i++) {
                followRequestsData.ids[i] = newUserData[i];
            }
            for(let i in followRequestsData.ids) {
                let u = followRequestsData.ids[i];
                let userElement = document.createElement('div');
                userElement.classList.add('follow-requests-user');
                userElement.innerHTML = html`
                    <div>
                        <a href="/${u.screen_name}" class="following-item-link">
                            <img src="${`${(u.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(u.id_str) % 7}_normal.png`): u.profile_image_url_https}`}" alt="${u.screen_name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                            <div class="following-item-text">
                                <span class="tweet-header-name following-item-name ${u.verified || u.id_str === '1708130407663759360' ? 'user-verified' : ''} ${u.protected ? 'user-protected' : ''}">${escapeHTML(u.name)}</span><br>
                                <span class="tweet-header-handle">@${u.screen_name}</span>
                            </div>
                        </a>
                    </div>
                    <div>
                        <button class="request-item-btn nice-button accept">${LOC.accept.message}</button>
                        <button class="request-item-btn nice-button decline">${LOC.decline.message}</button>
                    </div>
                `;
                userElement.querySelector('.accept').addEventListener('click', async () => {
                    try {
                        await API.user.acceptFollowRequest(u.id_str);
                    } catch(e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    userElement.remove();
                    data.ids.splice(i, 1);
                    let count;
                    if(data.total_count) {
                        count = --data.total_count;
                    } else {
                        count = data.ids.length;
                    }
                    if(count > 0) {
                        followRequestsCount.hidden = false;
                        followRequestsCount.innerText = count;
                    } else {
                        followRequestsCount.hidden = true;
                    }
                });
                userElement.querySelector('.decline').addEventListener('click', async () => {
                    try {
                        await API.user.declineFollowRequest(u.id_str);
                    } catch(e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    userElement.remove();
                    data.ids.splice(i, 1);
                    let count;
                    if(data.total_count) {
                        count = --data.total_count;
                    } else {
                        count = data.ids.length;
                    }
                    if(count > 0) {
                        followRequestsCount.hidden = false;
                        followRequestsCount.innerText = count;
                    } else {
                        followRequestsCount.hidden = true;
                    }
                });
                list.appendChild(userElement);
            }
        }
        followRequests.addEventListener('click', async () => {
            let modal = createModal(html`
                <h1 class="larger nice-header">${LOC.follow_requests.message}</h1>
                <div class="follow-requests-list"></div>
                <div class="requests-load-more center-text">${LOC.load_more.message}</div>
            `, 'follow-requests-modal');
            let loadMoreBtn = modal.querySelector('.requests-load-more');

            if(followRequestsData.next_cursor_str !== '0') {
                loadMoreBtn.hidden = false;
                loadMoreBtn.addEventListener('click', async () => {
                    loadMoreBtn.innerText = LOC.loading.message;
                    loadMoreBtn.disabled = true;
                    API.user.getFollowRequests(followRequestsData.next_cursor_str).then(data => {
                        followRequestsData.ids = followRequestsData.ids.concat(data.ids);
                        followRequestsData.next_cursor_str = data.next_cursor_str;
                        updateFollowRequests();
                    });
                });
            } else {
                loadMoreBtn.hidden = true;
            }
            updateFollowRequests();
        });
        API.user.getFollowRequests().then(data => {
            followRequestsData = data;
            let count = data.total_count ? data.total_count : data.ids.length;
            if(count > 0) {
                followRequestsCount.hidden = false;
                followRequestsCount.innerText = count;
            } else {
                followRequestsCount.hidden = true;
            }
        });
    }

    // unfollows
    if(user.followers_count > 0 && user.followers_count < 50000 && user.friends_count < 50000) {
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

            if(Date.now() - res[user.id_str].lastUpdate > 1000 * 60 * 60) {
                updateUnfollows(res);
            }
            setInterval(() => {
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
                    if(Date.now() - res[user.id_str].lastUpdate > 1000 * 60 * 60) {
                        updateUnfollows(res);
                    }
                });
            }, 1000 * 60 * 10);
        });
    }
    
    // messages
    let cursor;
    let modal;
    let lastConvo;
    function compare(e, t) {
        var i = e.length - t.length;
        return i || (e > t ? i = 1 : e < t && (i = -1)), i;
    };
    async function renderConversation(convo, convoId, newMessages = true, updateConvo = true) {
        if(updateConvo) {
            lastConvo = convo;
            lastConvo.conversation_id = convoId;
        } else {
            if(!convo.users) convo.users = {};
            if(!lastConvo.users) lastConvo.users = {};
            lastConvo.users = Object.assign(lastConvo.users, convo.users);
            if(!lastConvo.entries) lastConvo.entries = []; // what the fuck all of this does
            if(!convo.entries) convo.entries = [];
            lastConvo.entries.forEach(e => {
                e.added = true;
            });
            lastConvo.entries = lastConvo.entries.concat(convo.entries);
            let seen = [];
            lastConvo.entries = lastConvo.entries.filter(entry => {
                let val = Object.values(entry)[0];
                if(seen.includes(val.id)) return false;
                seen.push(val.id);
                return true; 
            });
        }
        if(inboxData) {
            let conversations = Array.isArray(inboxData.conversations) ? inboxData.conversations : Object.values(inboxData.conversations);
            let realConvo = conversations.find(c => c.id_str === lastConvo.id_str);
            let lastEventId = lastConvo.conversations[lastConvo.conversation_id]?.sort_event_id; //reactions dont count towards max_entry_id, but they do towards sort_event_id so that conversations appear above others when theres a new reaction
            if(+lastEventId >= +realConvo.last_read_event_id) {
                API.inbox.markRead(lastEventId);
                realConvo.last_read_event_id = lastEventId;
            }
        }
        window.history.pushState(null, document.title, window.location.href)
        let messageBox = modal.querySelector('.messages-list');
        if(!lastConvo.entries) {
            modal.getElementsByClassName('messages-load-more')[0].hidden = true;
            return;
        }
        lastConvo.entries = lastConvo.entries.reverse();
        let messageElements = [];
        for(let i in lastConvo.entries) {
            if(lastConvo.entries[i].added) continue;

            let lastEntry;
            let e = lastConvo.entries[i];
            let keyName = Object.keys(e)[0];
            let key = e[keyName];
            lastEntry = {
                type: keyName,
                data: key
            };

            if(!lastEntry) {
                continue;
            };

            let m = lastEntry.data;

            if(lastEntry.type == 'message' || lastEntry.type == 'welcome_message_create') {
                let sender = lastConvo.users[m.message_data.sender_id];
                let clearText = m.message_data.text.replace(/(\s|\n)/g, '');
                let isOnlyEmojis = isEmojiOnly(clearText) && clearText.length > 0 && clearText.length <= 48;
    
                let messageElement = document.createElement('div');
                messageElement.classList.add('message-element');
                if(sender.id_str !== user.id_str) {
                    messageElement.classList.add('message-element-other');
                } else {
                    messageElement.classList.add('message-element-self');
                }
                if(isOnlyEmojis) {
                    messageElement.classList.add('message-element-emojis');
                }
                messageElement.dataset.messageId = m.id;
                messageElement.innerHTML = html`
                    ${sender.id_str !== user.id_str ? html`
                        <div class="profile-block" style="float:left">
                            <a class="sender-profile-url" href="/${sender.screen_name}">
                                <img src="${`${(sender.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(sender.id_str) % 7}_normal.png`): sender.profile_image_url_https}`.replace("_normal", "_bigger")}" class="message-avatar">
                            </a>
                        </div>
                        <div class="message-block" style="float:left">
                            <div class="message-block-inner">
                                <span class="message-body">${escapeHTML(m.message_data.text).replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="/$1">@$1</a>`)}</span>
                                <div class="message-attachments"></div>
                                <div class="message-reactions"></div>
                            </div>
                        </div>
                    ` : html`
                        <div class="message-block" style="margin-left: auto">
                            <div class="message-block-inner" style="margin-left: auto">
                                <span class="message-menu-open"></span>
                                <span class="message-body">${escapeHTML(m.message_data.text).replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="/$1">@$1</a>`)}</span>
                                <div class="message-menu" hidden>
                                    <span class="message-menu-delete">${LOC.delete_for_you.message}</span>
                                </div>
                                <div class="message-attachments"></div>
                                <div class="message-reactions"></div>
                            </div>
                        </div>
                        <div class="profile-block profile-block-me" style="float:right">
                            <a class="sender-profile-url" href="/${sender.screen_name}">
                                <img src="${`${(sender.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(sender.id_str) % 7}_normal.png`): sender.profile_image_url_https}`.replace("_normal", "_bigger")}" class="message-avatar">
                            </a>
                        </div>
                    `}
                `;
                let messageBlockInner = messageElement.querySelector('.message-block-inner');
                let messageBlock = messageElement.querySelector('.message-block');
                let menuOpen = messageBlockInner.querySelector('.message-menu-open');
                let messageAttachments = messageElement.querySelector('.message-attachments');
                let messageReactions = messageElement.querySelector('.message-reactions');
                
                if(menuOpen) {
                    let menu = messageBlockInner.querySelector('.message-menu');
                    let menuDelete = messageBlockInner.querySelector('.message-menu-delete');
    
                    menuDelete.addEventListener('click', () => {
                        API.inbox.deleteMessage(m.id);
                        messageBlockInner.remove();
                    });
    
                    let clicked;
                    menuOpen.addEventListener('click', () => {
                        if(clicked) return;
                        clicked = true;
                        menu.hidden = false;
                        setTimeout(() => {
                            menuFn = () => {
                                setTimeout(() => {
                                    clicked = false;
                                    menu.hidden = true;
                                }, 100);
                            };
                            document.addEventListener('click', menuFn, { once: true })
                        }, 100);
                    });
                }
                let as = Array.from(messageBlockInner.getElementsByTagName('a'));
                if(m.message_data.entities && m.message_data.entities.urls) {
                    m.message_data.entities.urls.forEach(url => {
                        let a = as.find(a => a.href === url.url);
                        if(!a) return;
                        let removed = false;
                        if(m.message_data.attachment) {
                            if(m.message_data.attachment.photo) {
                                if(a.href === m.message_data.attachment.photo.url) {
                                    removed = true;
                                    a.remove();
                                }
                            }
                            if(m.message_data.attachment.animated_gif) {
                                if(a.href === m.message_data.attachment.animated_gif.url) {
                                    removed = true;
                                    a.remove();
                                }
                            }
                        }
                        if(a && !removed) {
                            a.href = url.expanded_url;
                            a.innerText = url.display_url;
                            a.target = "_blank";
                        }
                    });
                }
                let span = messageBlockInner.getElementsByClassName('message-body')[0];
                if(m.message_data.attachment) {
                    let attachment = m.message_data.attachment;
                    if(attachment.photo) {
                        let photo = attachment.photo;
                        let photoElement = document.createElement('img');
                        let photoMediaUrl = new URL(photo.media_url_https)
                        photoMediaUrl.pathname = photoMediaUrl.pathname.replace('1.1', 'i') //https://ton.twitter.com/1.1/ton/ -> https://ton.twitter.com/i/ton/
                        if (photoMediaUrl.hostname === 'ton.twitter.com' && location.hostname === 'x.com') photoMediaUrl.hostname = 'ton.x.com'
                        photoElement.src = photoMediaUrl.href + (window.navigator && navigator.connection && navigator.connection.type === 'cellular' && !vars.disableDataSaver ? ':small' : '');
                        photoElement.classList.add('message-element-media');
                        let [w, h] = calculateSize(photo.original_info.width, photo.original_info.height, 400, 500);
                        photoElement.width = w;
                        photoElement.height = h;
                        photoElement.addEventListener('click', e => {
                            if(e.target.src.includes(':small')) {
                                e.target.src = e.target.src.replace(':small', '');
                            };
                            new Viewer(photoElement, {
                                transition: false,
                        zoomRatio: 0.3
                            });
                            e.target.click();
                        })
                        messageAttachments.append(photoElement);
                    }
                    if(attachment.animated_gif) {
                        let gif = attachment.animated_gif;
                        let gifElement = document.createElement('video');
                        gifElement.src = gif.video_info.variants[0].url;
                        gifElement.muted = true;
                        gifElement.loop = true;
                        gifElement.autoplay = true;
                        let [w, h] = calculateSize(gif.original_info.width, gif.original_info.height, 400, 500);
                        gifElement.width = w;
                        gifElement.height = h;
                        gifElement.classList.add('message-element-media');
                        messageAttachments.append(gifElement);
                    }
                    if(attachment.video) {
                        let video = attachment.video;
                        let videoElement = document.createElement('video');
                        videoElement.src = video.video_info.variants.find(v => v.content_type === 'video/mp4').url;
                        videoElement.controls = true;
                        let [w, h] = calculateSize(video.original_info.width, video.original_info.height, 400, 500);
                        videoElement.width = w;
                        videoElement.height = h;
                        videoElement.classList.add('message-element-media');
                        messageAttachments.append(videoElement);
                    }
                }
                if(m.message_reactions) {
                    for (let reaction of m.message_reactions) {
                        let reactionElement = document.createElement('span');
                        reactionElement.classList.add('message-reaction');
                        reactionElement.dataset.userId = reaction.sender_id;
                        let reactionEmoji = reaction.emoji_reaction //on updated twitter clients, this is just an emoji
                        if(reaction.reaction_key === 'emoji' && /\p{Extended_Pictographic}/u.test(reaction.emoji_reaction)) { //if its a custom reaction thats not not in the legacy keys, then reaction.emoji_reaction is the emoji and reaction_key is "emoji"
                            reactionEmoji = reaction.emoji_reaction;
                        } else if(reaction.reaction_key === 'emoji') { //if its an older message/client, then reaction.emoji_reaction is the reaction key and reaction_key is "emoji"
                            reactionEmoji = legacyReactionKeys[reaction.emoji_reaction.toLowerCase()];
                        } else if(reaction.reaction_key && reaction.reaction_key != 'emoji') { //if reaction_key is present and its not "emoji", its from an old messags/client, and the reaction_key is just meant to be put into a key-value map
                            reactionEmoji = legacyReactionKeys[reaction.reaction_key];
                        }
                        reactionElement.innerText = reactionEmoji || '';
                        if(vars.enableTwemoji) twemoji.parse(reactionElement);
                        messageReactions.append(reactionElement);
                    }
                }
                timestamp=document.createElement('span');
                timestamp.classList.add('message-time');
                timestamp.setAttribute("data-timestamp", m.time);
                timestamp.innerText = `${timeElapsed(new Date(+m.time))}`;
                messageBlock.append(timestamp);
                if(span.innerHTML === '' || span.innerHTML === ' ') {
                    span.remove();
                }
                if(vars.enableTwemoji) {
                    twemoji.parse(messageBlock);
                }
                messageElements.push(messageElement);
            } else if (lastEntry.type == 'participants_leave') {
                let leftUser = lastConvo.users[lastEntry.data.participants[0].user_id];
                let messageText = LOC.user_left.message
                .replace('$NAME$', escapeHTML(leftUser.name))
                .replace('$A_START$', `<a href="/${leftUser.screen_name}">`)
                .replace('$A_END$', '</a>');

                let messageElement = document.createElement('div');
                messageElement.classList.add('message-announcement');
                messageElement.dataset.messageId = m.id;

                if(vars.enableTwemoji) {
                    twemoji.parse(messageText);
                }

                messageElement.innerHTML = messageText;

                messageElements.push(messageElement);
            } else if (lastEntry.type == 'participants_join') {
                let joinedUser = lastConvo.users[lastEntry.data.participants[0].user_id];
                let userWhoAdded = lastConvo.users[lastEntry.data.sender_id];
                let messageText = LOC.user_added.message
                .replace('$USER_WHO_ADDED$', escapeHTML(userWhoAdded.name))
                .replace('$USER_WHO_JOINED$', escapeHTML(joinedUser.name))
                .replace('$A1$', `<a href="/${userWhoAdded.screen_name}">`)
                .replace('$A2$', `<a href="/${joinedUser.screen_name}">`)
                .replaceAll('$A_END$', '</a>');

                let messageElement = document.createElement('div');
                messageElement.classList.add('message-announcement');
                messageElement.dataset.messageId = m.id;

                if(vars.enableTwemoji) {
                    twemoji.parse(messageText);
                }

                messageElement.innerHTML = messageText;

                messageElements.push(messageElement);
            } else if (lastEntry.type == 'conversation_name_update') {
                let userWhoUpdated = lastConvo.users[lastEntry.data.by_user_id];
                let messageText = LOC.user_changed_group_name.message
                .replace('$NAME$', escapeHTML(userWhoUpdated.name))
                .replace('$GROUP_NAME$', escapeHTML(lastEntry.data.conversation_name))
                .replace('$A_START$', `<a href="/${userWhoUpdated.screen_name}">`)
                .replace('$A_END$', '</a>');

                let messageElement = document.createElement('div');
                messageElement.classList.add('message-announcement');
                messageElement.dataset.messageId = m.id;

                if(vars.enableTwemoji) {
                    twemoji.parse(messageText);
                }

                messageElement.innerHTML = messageText;

                messageElements.push(messageElement);
            } else if (lastEntry.type == 'conversation_avatar_update') {
                let userWhoUpdated = lastConvo.users[lastEntry.data.by_user_id];
                let messageText = `<img src="${lastEntry.data.conversation_avatar_image_https}" class="message-announcement-icon">` +
                LOC.user_changed_group_photo.message
                .replace('$NAME$', escapeHTML(userWhoUpdated.name))
                .replace('$A_START$', `<a href="/${userWhoUpdated.screen_name}">`)
                .replace('$A_END$', '</a>');

                let messageElement = document.createElement('div');
                messageElement.classList.add('message-announcement');
                messageElement.dataset.messageId = m.id;

                if(vars.enableTwemoji) {
                    twemoji.parse(messageText);
                }

                messageElement.innerHTML = messageText;

                messageElements.push(messageElement);
            } else if (lastEntry.type == 'join_conversation') { //only when YOU get added to a conversation
                let userWhoAdded = lastConvo.users[lastEntry.data.sender_id];
                let otherUsers = (lastConvo.conversations[lastConvo.conversation_id].participants.length - 1).toLocaleString();
                let messageText = LOC.user_added_you_msg.message
                .replace('$NAME$', escapeHTML(userWhoAdded.name))
                .replace('$NUMBER$', otherUsers)
                .replace('$A_START$', `<a href="/${userWhoAdded.screen_name}">`)
                .replace('$A_END$', `</a>`);

                let messageElement = document.createElement('div');
                messageElement.classList.add('message-announcement');
                messageElement.dataset.messageId = m.id;

                if(vars.enableTwemoji) {
                    twemoji.parse(messageText);
                }

                messageElement.innerHTML = messageText;

                messageElements.push(messageElement);
            } else {
                //console.log(lastEntry)
            }
        }
        if(!newMessages) {
            let savedScroll = messageBox.parentElement.scrollTop;
            let oldHeight = messageBox.parentElement.scrollHeight;
            messageElements = messageElements.reverse();
            for(let i in messageElements) {
                messageBox.prepend(messageElements[i], document.createElement('br'));
            }
            let newScroll = messageBox.scrollHeight - oldHeight + savedScroll;
            messageBox.parentElement.scrollTop = newScroll;
        } else {
            for(let i in messageElements) {
                messageBox.append(messageElements[i], document.createElement('br'));
            }
        }
        messageLists=document.getElementsByClassName("message-element");
        for(let i=0 ; i < messageLists.length - 1; i++) {
            current_timestamp = messageLists[i].getElementsByClassName('message-time')[0].getAttribute("data-timestamp");
            next_timestamp = messageLists[i + 1].getElementsByClassName('message-time')[0].getAttribute("data-timestamp");

            current_profile = messageLists[i].getElementsByClassName('sender-profile-url')[0].getAttribute("href");
            next_profile = messageLists[i + 1].getElementsByClassName('sender-profile-url')[0].getAttribute("href");
            //if(next_timestamp - current_timestamp <= 10000 && current_profile === next_profile){
            if(parseInt(current_timestamp/(60*1000)) === parseInt(next_timestamp/(60*1000)) && current_profile === next_profile){
                messageLists[i].getElementsByClassName('message-time')[0].hidden=true;
                messageLists[i].getElementsByClassName('message-avatar')[0].hidden=true;
                messageLists[i].className += ' message-element-continue';
            }
        }
        if(newMessages) {
            let modalElement = document.getElementsByClassName('messages-container')[0];
            modalElement.scrollTop = modalElement.scrollHeight;
        }

        const loadMoreMessages = modal.querySelector('.messages-load-more');
        if(lastConvo.status === "HAS_MORE") {
            loadMoreMessages.hidden = false;
        } else {
            loadMoreMessages.hidden = true;
        }
    }
    function renderInboxMessages(inbox, inboxList, conversationIds) {
        inbox.conversations = inbox.conversations ? Object.values(inbox.conversations).sort((a, b) => (+b.sort_timestamp)-(+a.sort_timestamp)) : [];
        for(let i in inbox.conversations) {
            let c = inbox.conversations[i];
            if(conversationIds && !conversationIds.includes(c.conversation_id)) continue;

            let lastEvent;
            let unseenEvents = [];
            let affectsSort = null;
            for (let i in inbox.entries) {
                let e = inbox.entries[i];
                let keyName = Object.keys(e)[0];
                let key = e[keyName];
                if(key.conversation_id !== c.conversation_id) continue;
                if(key && key.id === c.max_entry_id) {
                    lastEvent = {
                        type: keyName,
                        data: key
                    };

                    if(affectsSort === null) affectsSort = false;

                    break;
                }

                if(key && compare(key.id, c.last_read_event_id) >= 1) {
                    unseenEvents.push(key)
                    if(key.affects_sort === true && affectsSort === null) affectsSort = true;
                }
            }

            if(!lastEvent) {
                continue;
            };

            let lastMessage = lastEvent.data;
            if(lastMessage.message) {
                lastMessage = lastMessage.message;
            } else if(lastMessage.trust_conversation) {
                lastMessage = lastMessage.trust_conversation;
            }

            let messageElement;
            let messageExists = !!modal.querySelector(`div.inbox-message[data-conversation-id="${c.conversation_id}"]`);
            if(conversationIds && messageExists) {
                messageElement = modal.querySelector(`div.inbox-message[data-conversation-id="${c.conversation_id}"]`);
            } else {
                messageElement = document.createElement('div');
                messageElement.classList.add('inbox-message');
                messageElement.setAttribute('data-conversation-id', c.conversation_id);
            };

            let isUnread = false;
            if(compare(lastMessage.id, c.last_read_event_id) >= 1) { //adding "&& affectsSort" makes some things (like links) show as read, i dont know why, so im omitting it
                messageElement.classList.add('inbox-message-unread');
                isUnread = true;
            }

            let messageUsers = c.participants.filter(p => p.user_id !== user.id_str).map(p => inbox.users[p.user_id]);
            let messageEntry = {};
            if(c.type == 'ONE_TO_ONE' && messageUsers.length === 1) { //regular one to one dm (messageUsers.length is one because the messageUsers variable filters out yourself)
                if (messageUsers[0].default_profile_image && vars.useOldDefaultProfileImage) {
                    messageEntry.icon = chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(messageUsers[0].id_str) % 7}_normal.png`);
                } else {
                    messageEntry.icon = messageUsers[0].profile_image_url_https;
                }

                messageEntry.name = escapeHTML(messageUsers[0].name);
                messageEntry.screen_name = messageUsers[0].screen_name;
            } else if (c.type == 'GROUP_DM') { //groups
                messageEntry.icon = c.avatar_image_https || chrome.runtime.getURL('/images/group.jpg');
                messageEntry.name = c.name ? escapeHTML(c.name) : messageUsers.map(i => escapeHTML(i.name)).join(', ').slice(0, 128);
                messageEntry.screen_name = '';

                if(messageUsers.length === 1 && !c.name) { //when you have a three person group dm and one leaves, its just a one to one thats technically a group dm
                    messageEntry.name += ' and You';
                }
            } else if (c.type == 'ONE_TO_ONE' && messageUsers.length === 0) { //dming yourself (the length is zero because same reason as above)
                if (user.default_profile_image && vars.useOldDefaultProfileImage) {
                    messageEntry.icon = chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`);
                } else {
                    messageEntry.icon = user.profile_image_url_https;
                }

                messageEntry.name = user.name;
                messageEntry.screen_name = user.screen_name;
            }

            let lastSenderWasUser = lastMessage.message_data && lastMessage.message_data.sender_id === user.id_str

            if (lastMessage.reason) {
                messageEntry.preview = LOC.accepted_conversation.message;
            } else if (lastEvent.type == 'participants_leave') {
                let leftUser = inbox.users[lastMessage.participants[0].user_id];
                messageEntry.preview = LOC.user_left.message
                .replace('$NAME$', escapeHTML(leftUser.name))
                .replace('$A_START$', '')
                .replace('$A_END$', '');
            } else if (lastEvent.type == 'participants_join') {
                let joinedUser = inbox.users[lastMessage.participants[0].user_id];
                let userWhoAdded = inbox.users[lastMessage.sender_id];
                messageEntry.preview = LOC.user_added.message
                .replace('$USER_WHO_ADDED$', escapeHTML(userWhoAdded.name))
                .replace('$USER_WHO_JOINED$', escapeHTML(joinedUser.name))
                .replace('$A1$', '')
                .replace('$A2$', '')
                .replaceAll('$A_END$', '');
                messageEntry.preview = `${escapeHTML(userWhoAdded.name)} added ${escapeHTML(joinedUser.name)}`;
            } else if (lastEvent.type == 'conversation_name_update') {
                let userWhoUpdated = inbox.users[lastMessage.by_user_id];
                messageEntry.preview = LOC.user_changed_group_name.message
                .replace('$NAME$', escapeHTML(userWhoUpdated.name))
                .replace('$GROUP_NAME$', escapeHTML(lastMessage.conversation_name))
                .replace('$A_START$', '')
                .replace('$A_END$', '');
            } else if (lastEvent.type == 'conversation_avatar_update') {
                let userWhoUpdated = inbox.users[lastMessage.by_user_id];
                messageEntry.preview = LOC.user_changed_group_photo.message
                .replace('$NAME$', escapeHTML(userWhoUpdated.name))
                .replace('$A_START$', '')
                .replace('$A_END$', '');
            } else if (lastMessage.message_data) {
                let lastMessageUser = lastMessage.message_data ? messageUsers.find(user => user.id_str === lastMessage.message_data.sender_id) : messageUsers[0];
                if (lastMessage.message_data.text.startsWith('dmservice_reaction_')) {
                    messageEntry.preview = lastSenderWasUser ? LOC.you_reacted_message.message : LOC.user_reacted_message.message.replace('$NAME$', escapeHTML(lastMessageUser.name));
                } else if (lastMessage.message_data.attachment) {
                    if (lastMessage.message_data.attachment.video) {
                        messageEntry.preview = lastSenderWasUser ? LOC.you_sent_video.message : LOC.user_sent_video.message.replace('$NAME$', escapeHTML(lastMessageUser.name));
                    } else if (lastMessage.message_data.attachment.photo) {
                        messageEntry.preview = lastSenderWasUser ? LOC.you_sent_photo.message : LOC.user_sent_photo.message.replace('$NAME$', escapeHTML(lastMessageUser.name));
                    } else if (lastMessage.message_data.attachment.tweet) {
                        messageEntry.preview = lastSenderWasUser ? LOC.you_shared_tweet.message : LOC.user_shared_tweet.message.replace('$NAME$', escapeHTML(lastMessageUser.name));
                    } else if (c.type == 'GROUP_DM') { //other attachments like tweets, links, cards, etc (this should just end up being a t.co link) (same with the last else)
                        messageEntry.preview = escapeHTML(lastMessageUser.name) + ': ' + escapeHTML(lastMessage.message_data.text);
                    } else {
                        messageEntry.preview = escapeHTML(lastMessage.message_data.text);
                    }
                } else if (c.type == 'GROUP_DM') {
                    messageEntry.preview = lastSenderWasUser ? escapeHTML(lastMessage.message_data.text) : (escapeHTML(lastMessageUser.name) + ': ' + escapeHTML(lastMessage.message_data.text));
                } else {
                    messageEntry.preview = escapeHTML(lastMessage.message_data.text);
                }
            } else if (lastEvent.type == 'join_conversation') {
                let userWhoAdded = inbox.users[lastMessage.sender_id];
                messageEntry.preview = LOC.user_added_you_inbox.message.replace('$NAME$', escapeHTML(userWhoAdded.name));
            } else {
                //console.log(lastEvent)
            }
            messageElement.innerHTML = html`
                <img src="${messageEntry.icon}" width="48" height="48" class="inbox-message-avatar">
                <div class="inbox-text">
                    <b class="inbox-name">${messageEntry.name}</b>
                    <span class="inbox-screenname">${messageEntry.screen_name ? '@' + messageEntry.screen_name : ''}</span>
                    <span class="inbox-time" data-timestamp="${+lastMessage.time}">${timeElapsed(new Date(+lastMessage.time))}</span>
                    <br>
                    <span class="inbox-message-preview">${messageEntry.preview}</span>
                </div>
            `;
            if(vars.enableTwemoji) {
                twemoji.parse(messageElement);
            }
            let messageInIds = conversationIds && conversationIds.includes(c.conversation_id);
            const messageHeaderName = modal.querySelector('.message-header-name');
            const messageHeaderAvatar = modal.querySelector('.message-header-avatar');
            const messageHeaderLink = modal.querySelector('.message-header-link');
            if((!messageExists && messageInIds) || !conversationIds) messageElement.addEventListener('click', async () => {
                let messageData = await API.inbox.getConversation(c.conversation_id);
                modal.querySelector('.message-box').hidden = false;
                modal.querySelector('.home-top').hidden = true;
                modal.querySelector('.name-top').hidden = false;
                modal.querySelector('.inbox').hidden = true;
                modal.querySelector('.new-message-box').hidden = true;
                messageHeaderName.innerText = messageEntry.name;
                messageHeaderAvatar.src = messageEntry.icon;
                if(messageUsers.length <= 1) messageHeaderLink.href = `/${messageEntry.screen_name}`;
                setTimeout(() => {
                    modal.querySelector(".message-new-input").focus();
                    if(tweetUrlToShareInDMs) modal.querySelector(".message-new-input").value = tweetUrlToShareInDMs;
                });

                renderConversation(messageData, c.conversation_id);
            });
            if(isUnread) {
                inboxList.prepend(messageElement);
            } else {
                inboxList.append(messageElement);
            }
        }
        const messageHeaderBack = modal.querySelector('.message-header-back');
        if(!conversationIds) messageHeaderBack.addEventListener('click', e => { //same deal as last thing
            modal.removeModal();
            chrome.storage.local.remove(['inboxData'], () => {});
            setTimeout(() => {
                if(!document.querySelector('.inbox-modal')) {
                    document.getElementById('messages').click();
                }
            }, 20);
        });
    }
    document.getElementById('messages').addEventListener('click', async e => {
        e.preventDefault();
        inboxOpened = true;
        location.hash = '#dm';

        let inbox = inboxData;

        modal = createModal(html`
            <div class="inbox">
                <div class="inbox-top home-top">
                    <h1 class="larger nice-header">${LOC.direct_messages.message}</h1>
                    <div class="inbox-buttons">
                    <button class="nice-button inbox-refresh" title="${LOC.refresh.message}">
                            <span class="inbox-refresh-icon"></span>
                        </button>
                        <button class="nice-button inbox-readall" title="${LOC.mark_all_read.message}">
                            <span class="inbox-readall-icon"></span>
                        </button>
                        <button class="nice-button inbox-new" title="${LOC.new_message.message}">
                            <span class="inbox-new-icon"></span>
                        </button>
                    </div>
                    <hr>
                </div>
                <br><br><br>
                <div class="inbox-list"></div>
                <div class="center-text load-more" ${cursor ? '' : 'hidden'}>${LOC.load_more.message}</div>
            </div>
            <div class="message-box" hidden>
                <div class="inbox-top name-top">
                    <span class="message-header-back"></span>
                    <a class="message-header-link">
                        <img class="message-header-avatar" width="32" height="32">
                        <h1 class="larger message-header-name nice-header">${LOC.name.message}</h1>
                    </a>
                    <span class="message-leave"></span>
                </div>
                <div class="messages-container">
                    <br>
                    <div class="messages-load-more center-text" style="margin-top:-18px;">${LOC.load_more.message}</div>
                    <div class="messages-list"></div>
                </div>
                <div class="message-new-container">
                    <div class="message-new">
                        <div class="message-new-media"></div>
                        <span class="message-new-media-btn"></span>
                        <span class="message-emoji-btn"></span>
                        <textarea type="text" class="message-new-input" placeholder="${LOC.type_message.message}"></textarea>
                        <button class="nice-button message-new-send">${LOC.send.message}</button>
                    </div>
                </div>
            </div>
            <div class="new-message-box" hidden>
                <div class="inbox-top new-name-top">
                    <span class="message-header-back message-new-message-back"></span>
                    <h1 class="larger message-header-name nice-header" style="float: left;margin-left: 14px;">${LOC.new_message.message}</h1>
                    <button class="new-message-group nice-button" hidden>${LOC.create_new_group.message}</button>
                    <br>
                    <input type="text" class="new-message-user-search" placeholder="${LOC.search_people.message}" style="width:551px">
                    <hr>
                </div>
                <br><br><br><br><br>
                <div class="new-message-results"></div>
            </div>
        `, "inbox-modal", () => {
            if(location.hash === '#dm') {
                location.hash = "##";
            }
            tweetUrlToShareInDMs = null;
            setTimeout(() => inboxOpened = false, 100);
        });
        modal.querySelector('.modal-close').hidden = true;
        const inboxList = modal.querySelector('.inbox-list');
        const readAll = modal.querySelector('.inbox-readall');
        const refresh = modal.querySelector('.inbox-refresh');
        const newInbox = modal.querySelector('.inbox-new');
        const newMedia = modal.querySelector('.message-new-media');
        const newMediaButton = modal.querySelector('.message-new-media-btn');
        const newMediaInput = modal.querySelector('.message-new-input');
        const emojiButton = modal.querySelector('.message-emoji-btn');
        const newSend = modal.querySelector('.message-new-send');
        const newInput = modal.querySelector('.message-new-input');
        const loadMore = modal.querySelector('.load-more');
        const loadMoreMessages = modal.querySelector('.messages-load-more');
        const userSearch = modal.querySelector('.new-message-user-search');
        const newMessageResults = modal.querySelector('.new-message-results');
        const leaveConvo = modal.querySelector('.message-leave');
        const messagesContainer = modal.querySelector('.messages-container');

        messagesContainer.addEventListener('scroll', () => {
            if(messagesContainer.scrollTop <= 50 && lastConvo.status === "HAS_MORE") {
                loadMoreMessages.click();
            }
        }, { passive: true });

        newInbox.addEventListener('click', () => {
            modal.querySelector('.inbox').hidden = true;
            modal.querySelector('.new-message-box').hidden = false;
            modal.querySelector('.name-top').hidden = true;
            modal.querySelector('.home-top').hidden = true;
            modal.querySelector('.message-box').hidden = true;
        });
        modal.getElementsByClassName('message-new-message-back')[0].addEventListener('click', () => {
            modal.remove();
            document.getElementById('messages').click();
        });
        leaveConvo.addEventListener('click', async () => {
            if(!lastConvo || !lastConvo.conversation_id) return;
            let c = confirm(LOC.leave_conversation.message);
            if(c) {
                await API.inbox.deleteConversation(lastConvo.conversation_id);
                modal.remove();
                chrome.storage.local.remove(['inboxData'], () => {});
                await updateInboxData();
            }
        });
        userSearch.addEventListener('keyup', async () => {
            let q = userSearch.value;
            let res = await API.search.typeahead(q);
            newMessageResults.innerHTML = '';
            res.users.slice(0, 5).forEach(u => {
                let userElement = document.createElement('div');
                userElement.classList.add('new-message-user');
                userElement.innerHTML = html`
                    <img class="new-message-user-avatar" src="${`${(u.profile_image_url_https.includes('default_profile_images') && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(u.id_str) % 7}_normal.png`): u.profile_image_url_https}`.replace("_normal", "_bigger")}" width="48" height="48">
                    <div class="new-message-user-text">
                        <b class="new-message-user-name">${escapeHTML(u.name)}</b>
                        <span class="new-message-user-screenname">@${u.screen_name}</span>
                    </div>
                `;
                userElement.addEventListener('click', async () => {
                    const messageHeaderName = modal.querySelector('.message-header-name');
                    const messageHeaderAvatar = modal.querySelector('.message-header-avatar');
                    const messageHeaderLink = modal.querySelector('.message-header-link');
                    let messageData = await API.inbox.getConversation(`${user.id_str}-${u.id_str}`);
                    modal.querySelector('.message-box').hidden = false;
                    modal.querySelector('.home-top').hidden = true;
                    modal.querySelector('.name-top').hidden = false;
                    modal.querySelector('.inbox').hidden = true;
                    modal.querySelector('.new-message-box').hidden = true;
                    messageHeaderName.innerText = u.name;
                    messageHeaderAvatar.src = `${(u.profile_image_url_https.includes('default_profile_images') && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(u.id_str) % 7}_normal.png`): u.profile_image_url_https}`;
                    messageHeaderLink.href = `/${u.screen_name}`;
                    setTimeout(() => {
                        modal.querySelector(".message-new-input").focus();
                        if(tweetUrlToShareInDMs) modal.querySelector(".message-new-input").value = tweetUrlToShareInDMs;
                    });

                    renderConversation(messageData, `${user.id_str}-${u.id_str}`);
                });
                newMessageResults.appendChild(userElement);
            });
        });

        let mediaToUpload = []; 
        newMediaButton.addEventListener('click', () => {
            getMedia(mediaToUpload, newMedia, true); 
        });
        newInput.addEventListener('paste', event => {
            let items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (index in items) {
                let item = items[index];
                if (item.kind === 'file') {
                    let file = item.getAsFile();
                    handleFiles([file], mediaToUpload, newMedia, true);
                }
            }
        });
        newInput.addEventListener('keypress', e => {
            if(e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                newSend.click();
            }
        });
        newSend.addEventListener('click', async () => {
            let message = newMediaInput.value;
            if (message.length === 0 && mediaToUpload.length === 0) return;
            newSend.disabled = true;
            newInput.value = "";
            let uploadedMedia = [];
            for (let i in mediaToUpload) {
                let media = mediaToUpload[i];
                try {
                    media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = false;
                    let mediaId = await API.uploadMedia({
                        media_category: media.category,
                        media_type: media.type,
                        media: media.data,
                        cw: [],
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
            let obj = {
                text: message,
                conversation_id: lastConvo.conversation_id
            };
            if (uploadedMedia.length > 0) {
                obj.media_id = uploadedMedia[0];
            }
            try {
                let sentMessage = await API.inbox.send(obj);
                sentMessage.conversation_id = lastConvo.conversation_id;
                renderConversation(sentMessage, lastConvo.conversation_id, true, false);
            } catch (e) {
                console.error(e);
                if(String(e).includes('You cannot send messages to this user.')) {
                    let messageList = modal.querySelector('.messages-list');
                    messageList.innerHTML = LOC.cant_send.message;
                    return;
                }
                newSend.disabled = false;
            }
            if(uploadedMedia.length > 1) {
                for(let i = 1; i < uploadedMedia.length; i++) {
                    await API.inbox.send({
                        text: '',
                        conversation_id: lastConvo.conversation_id,
                        media_id: uploadedMedia[i]
                    }).catch(console.error);
                }
            }
            newSend.disabled = false;
            mediaToUpload = [];
            newMedia.innerHTML = "";
        });
        emojiButton.addEventListener('click', () => {
            let rect = emojiButton.getBoundingClientRect();
            createEmojiPicker(document.body, newInput, {
                left: rect.x + 'px',
                top: rect.y-300 + 'px'
            });
        });
        
        loadMore.addEventListener('click', async () => {
            let moreInbox = await API.inbox.get(cursor);
            if(moreInbox.status === "HAS_MORE") {
                cursor = moreInbox.min_entry_id;
            } else {
                cursor = moreInbox.max_entry_id; //prevent looping around when loading more
            }
            renderInboxMessages(moreInbox, inboxList);
        });
        let loadingMessages = false;
        loadMoreMessages.addEventListener('click', async () => {
            if(loadingMessages) return;
            loadingMessages = true;
            loadMoreMessages.innerText = LOC.loading.message;
            let moreMessages = await API.inbox.getConversation(lastConvo.conversation_id, lastConvo.min_entry_id);
            loadingMessages = false;
            renderConversation(moreMessages, lastConvo.conversation_id, false);
            loadMoreMessages.innerText = LOC.load_more.message;
        });

        readAll.addEventListener('click', async () => {
            await API.inbox.markRead(inbox.max_entry_id);
            let unreadMessages = Array.from(document.getElementsByClassName('inbox-message-unread'));
            unreadMessages.forEach(message => {
                message.classList.remove('inbox-message-unread');
            });
            chrome.storage.local.remove(['inboxData'], () => {});
            await updateInboxData();
            modal.remove();
            document.getElementById('messages').click();
        });
        refresh.addEventListener('click', async () => {
            chrome.storage.local.remove(['inboxData'], () => {});
            await updateInboxData();
            modal.remove();
            document.getElementById('messages').click();
        });

        renderInboxMessages(inbox, inboxList);
    });
    setInterval(() => { //for messages
        let times = Array.from(document.getElementsByClassName('message-time'));
        times.forEach(time => {
            time.innerText = timeElapsed(+time.dataset.timestamp);
        });
    }, 10000);
    setInterval(() => { //for inbox list
        let times = Array.from(document.getElementsByClassName('inbox-time'));
        times.forEach(time => {
            time.innerText = timeElapsed(+time.dataset.timestamp);
        });
    }, 10000);
    let updateCursor;
    setInterval(async () => {
        let updates = await API.inbox.getUpdates(updateCursor);
        updateCursor = Object.values(updates)[0].cursor;
        if(updates.user_events && updates.user_events.conversations && lastConvo) { //new messages in loaded convo
            for(let i in updates.user_events.conversations) {
                let c = updates.user_events.conversations[i];
                if(c.conversation_id === lastConvo.conversation_id) {
                    updates.user_events.entries.forEach(e => {
                        if(e.message_delete && e.message_delete.conversation_id === lastConvo.conversation_id) {
                            let messages = e.message_delete.messages;
                            for(let j in messages) {
                                let message = messages[j];
                                let messageElement = document.querySelector(`div.message-element[data-message-id="${message.message_id}"]`);
                                if(messageElement) {
                                    messageElement.remove();
                                }
                            }
                        }
                    });
                    for(let i in updates.user_events.entries) {
                        let e = updates.user_events.entries[i];
                        if(e.reaction_create) {
                            let reaction = e.reaction_create;
                            let messageElement = document.querySelector(`div.message-element[data-message-id="${reaction.message_id}"]`);
                            if(messageElement) {
                                let reactionElement = document.createElement('span');
                                reactionElement.classList.add('message-reaction');

                                let reactionEmoji = reaction.emoji_reaction //on updated twitter clients, this is just an emoji
                                if(reaction.reaction_key === 'emoji' && /\p{Extended_Pictographic}/u.test(reaction.emoji_reaction)) { //if its a custom reaction thats not not in the legacy keys, then reaction.emoji_reaction is the emoji and reaction_key is "emoji"
                                    reactionEmoji = reaction.emoji_reaction;
                                } else if(reaction.reaction_key === 'emoji') { //if its an older message/client, then reaction.emoji_reaction is the reaction key and reaction_key is "emoji"
                                    reactionEmoji = legacyReactionKeys[reaction.emoji_reaction.toLowerCase()];
                                } else if(reaction.reaction_key && reaction.reaction_key != 'emoji') { //if reaction_key is present and its not "emoji", its from an old messags/client, and the reaction_key is just meant to be put into a key-value map
                                    reactionEmoji = legacyReactionKeys[reaction.reaction_key];
                                }

                                reactionElement.innerText = reactionEmoji || '';
                                reactionElement.dataset.userId = reaction.sender_id;

                                if(vars.enableTwemoji) twemoji.parse(reactionElement);
                                let oldReaction = messageElement.querySelector(`span.message-reaction[data-user-id="${reaction.sender_id}"]`);
                                if(oldReaction) {
                                    oldReaction.remove();
                                }
                                messageElement.getElementsByClassName('message-reactions')[0].append(reactionElement);
                            }
                        } else if(e.reaction_delete) {
                            let reaction = e.reaction_delete;
                            let messageElement = document.querySelector(`div.message-element[data-message-id="${reaction.message_id}"]`);
                            if(messageElement) {
                                let reactionElement = messageElement.querySelector(`span.message-reaction[data-user-id="${reaction.sender_id}"]`);
                                if(reactionElement) {
                                    reactionElement.remove();
                                }
                            }
                        }
                    }
                    updates.user_events.entries = updates.user_events.entries.filter(m => m.message && m.message.conversation_id === lastConvo.conversation_id);
                    renderConversation(updates.user_events, lastConvo.conversation_id, true, false);
                }
            }
        }

        if(updates.user_events && updates.user_events.entries) { //new messages in inbox
            let conversationIds = updates.user_events.entries.map(m => m.message && m.message.conversation_id);
            await updateInboxData(conversationIds);
        }
    }, 5000);
    if(!INSIDE_IFRAME) {
        API.notifications.get();
        setInterval(() => {
            API.notifications.get(undefined, false, false);
        }, 30000);
    }
    
    // tweet
    document.getElementById('navbar-tweet-button').addEventListener('click', () => {
        let modal = createModal(html`
            <div class="navbar-new-tweet-container">
                <div class="navbar-new-tweet">
                    <img width="35" height="35" class="navbar-new-tweet-avatar">
                    <span class="navbar-new-tweet-char">${localStorage.OTisBlueVerified ? '0' : '0/280'}</span>
                    <textarea maxlength="25000" class="navbar-new-tweet-text" placeholder="${LOC.whats_happening.message}"></textarea>
                    <div class="navbar-new-tweet-user-search box" hidden></div>
                    <div class="navbar-new-tweet-media-div">
                        <span class="navbar-new-tweet-media"></span>
                    </div>
                    <div class="navbar-new-tweet-focused">
                        <span id="navbar-new-tweet-poll-btn"></span>
                        <span id="navbar-new-tweet-emoji-btn"></span>
                        <div id="navbar-new-tweet-poll" hidden></div>
                        <div class="navbar-new-tweet-media-cc"><div class="navbar-new-tweet-media-c"></div></div>
                        <button class="navbar-new-tweet-button nice-button">${LOC.tweet.message}</button>
                        <br><br>
                    </div>
                </div>
            </div>
        `, "navbar-new-tweet-modal");
        const newTweet = modal.getElementsByClassName('navbar-new-tweet-container')[0];
        const newTweetText = modal.getElementsByClassName('navbar-new-tweet-text')[0];
        const newTweetChar = modal.getElementsByClassName('navbar-new-tweet-char')[0];
        const newTweetMedia = modal.getElementsByClassName('navbar-new-tweet-media')[0];
        const newTweetMediaDiv = modal.getElementsByClassName('navbar-new-tweet-media-c')[0];
        const newTweetButton = modal.getElementsByClassName('navbar-new-tweet-button')[0];
        const newTweetUserSearch = modal.getElementsByClassName('navbar-new-tweet-user-search')[0];
        const newTweetPoll = document.getElementById('navbar-new-tweet-poll');
        const newTweetEmojiBtn = document.getElementById('navbar-new-tweet-emoji-btn');

        newTweetText.focus();

        newTweetEmojiBtn.addEventListener('click', () => {
            let rect = newTweetEmojiBtn.getBoundingClientRect();
            createEmojiPicker(document.body, newTweetText, {
                left: rect.x - 320 + 'px',
                top: rect.y + 'px'
            });
        });

        let selectedIndex = 0;
        let pollToUpload = undefined;

        document.getElementById('navbar-new-tweet-poll-btn').addEventListener('click', () => {
            if(newTweetPoll.hidden) {
                mediaToUpload = [];
                newTweetMediaDiv.innerHTML = '';
                newTweetPoll.hidden = false;
                newTweetPoll.style.width = "364px";
                document.getElementById('navbar-new-tweet-poll').innerHTML = html`
                    <input class="navbar-poll-question" data-variant="1" maxlength="25" placeholder="${LOC.variant.message} 1"><br>
                    <input class="navbar-poll-question" data-variant="2" maxlength="25" placeholder="${LOC.variant.message} 2"><br>
                    <input class="navbar-poll-question" data-variant="3" maxlength="25" placeholder="${LOC.variant.message} 3 ${LOC.optional.message}"><br>
                    <input class="navbar-poll-question" data-variant="4" maxlength="25" placeholder="${LOC.variant.message} 4 ${LOC.optional.message}"><br>
                    <hr>
                    ${LOC.days.message}: <input class="navbar-poll-date" id="navbar-poll-days" type="number" min="0" max="7" value="1">
                    ${LOC.hours.message}: <input class="navbar-poll-date" id="navbar-poll-hours" type="number" min="0" max="23" value="0">
                    ${LOC.minutes.message}: <input class="navbar-poll-date" id="navbar-poll-minutes" type="number" min="0" max="59" value="0">
                    <hr>
                    <button class="nice-button" id="navbar-poll-remove">${LOC.remove_poll.message}</button>
                `;
                let pollVariants = Array.from(document.getElementsByClassName('navbar-poll-question'));
                pollToUpload = {
                    duration_minutes: 1440,
                    variants: ['', '', '', '']
                }
                let pollDates = Array.from(document.getElementsByClassName('navbar-poll-date'));
                pollDates.forEach(pollDate => {
                    pollDate.addEventListener('change', () => {
                        let days = parseInt(document.getElementById('navbar-poll-days').value);
                        let hours = parseInt(document.getElementById('navbar-poll-hours').value);
                        let minutes = parseInt(document.getElementById('navbar-poll-minutes').value);
                        if(days === 0 && hours === 0 && minutes === 0) {
                            days = 1;
                            document.getElementById('navbar-poll-days').value = 1;
                        }
                        pollToUpload.duration_minutes = days * 1440 + hours * 60 + minutes;
                    }, { passive: true });
                });
                pollVariants.forEach(pollVariant => {
                    pollVariant.addEventListener('change', () => {
                        pollToUpload.variants[(+pollVariant.dataset.variant) - 1] = pollVariant.value;
                    }, { passive: true });
                });
                document.getElementById('navbar-poll-remove').addEventListener('click', () => {
                    newTweetPoll.hidden = true;
                    newTweetPoll.innerHTML = '';
                    newTweetPoll.style.width = "0";
                    pollToUpload = undefined;
                });
            } else {
                newTweetPoll.innerHTML = '';
                newTweetPoll.hidden = true;
                newTweetPoll.style.width = "0";
                pollToUpload = undefined;
            }
        });

        modal.getElementsByClassName('navbar-new-tweet-avatar')[0].src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`.replace("_normal", "_bigger");
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
        newTweetText.addEventListener('keydown', e => {
            if(e.key === "Enter" && e.ctrlKey) {
                newTweetButton.click();
            }
        });
        newTweetText.addEventListener('input', e => {
            let charElement = newTweetChar;
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
                newTweetButton.disabled = true;
            } else {
                charElement.style.color = "";
                newTweetButton.disabled = false;
            }
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
                        <img width="16" height="16" class="search-result-item-avatar" src="${`${(user.profile_image_url_https.includes('default_profile_images') && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`}">
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
        });
        let mediaToUpload = []; 
        newTweet.addEventListener('drop', e => {
            if(document.getElementById('new-tweet')) document.getElementById('new-tweet').click();
            newTweetPoll.innerHTML = '';
            newTweetPoll.hidden = true;
            newTweetPoll.style.width = "0";
            pollToUpload = undefined;
            handleDrop(e, mediaToUpload, newTweetMediaDiv);
        });
        newTweet.addEventListener('paste', event => {
            let items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (index in items) {
                let item = items[index];
                if (item.kind === 'file') {
                    let file = item.getAsFile();
                    handleFiles([file], mediaToUpload, newTweetMediaDiv);
                }
            }
        });
        newTweetMedia.addEventListener('click', () => {
            newTweetPoll.innerHTML = '';
            newTweetPoll.hidden = true;
            newTweetPoll.style.width = "0";
            pollToUpload = undefined;
            getMedia(mediaToUpload, newTweetMediaDiv);
            newTweetText.focus();
        });
        newTweetButton.addEventListener('click', async () => {
            let tweet = newTweetText.value;
            if (tweet.length === 0 && mediaToUpload.length === 0) return;
            newTweetButton.disabled = true;
            if(!pollToUpload) {
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
                        newTweetButton.disabled = false;
                        return; // cancel tweeting
                    }
                }
                try {
                    let tweetObject = await API.tweet.postV2({
                        text: tweet,
                        media: uploadedMedia
                    });
                    tweetObject._ARTIFICIAL = true;
                    const event = new CustomEvent('newTweet', { detail: tweetObject });
                    document.dispatchEvent(event);
                } catch (e) {
                    newTweetButton.disabled = false;
                    console.error(e);
                    alert(e);
                }
            } else {
                let pollVariants = pollToUpload.variants.filter(i => i);
                if(pollVariants.length < 2) {
                    newTweetButton.disabled = false;
                    return alert('You must have at least 2 poll variants');
                }
                let cardObject = {
                    "twitter:card": `poll${pollVariants.length}choice_text_only`,
                    "twitter:api:api:endpoint": "1",
                    "twitter:long:duration_minutes": pollToUpload.duration_minutes,
                    "twitter:string:choice1_label": pollVariants[0],
                    "twitter:string:choice2_label": pollVariants[1]
                }
                if(pollVariants[2]) {
                    cardObject["twitter:string:choice3_label"] = pollVariants[2];
                }
                if(pollVariants[3]) {
                    cardObject["twitter:string:choice4_label"] = pollVariants[3];
                }
                try {
                    let card = await API.tweet.createCard(cardObject);
                    let tweetObject = await API.tweet.postV2({
                        text: tweet,
                        card_uri: card.card_uri,
                    });
                    tweetObject._ARTIFICIAL = true;
                    const event = new CustomEvent('newTweet', { detail: tweetObject });
                    document.dispatchEvent(event);
                } catch (e) {
                    newTweetButton.disabled = false;
                    console.error(e);
                    alert(e);
                }
            }
            modal.remove();
            modal.removeModal();
        });
    });

    // search
    let searchInput = document.getElementById('search-input');
    let searchResults = document.getElementById('search-results');
    let searchIcon = document.getElementById('search-icon');

    let selectedIndex = -1;

    async function loadDefaultSearches() {
        searchResults.innerHTML = '';

        await new Promise(resolve => chrome.storage.local.get(['lastSearches'], data => {
            lastSearches = data.lastSearches;
            if(!lastSearches) lastSearches = [];
            else lastSearches = lastSearches.filter(i => i);
            resolve(1);
        }));
        if(savedSearches.length === 0) {
            try {
                savedSearches = await API.search.getSaved();
            } catch(e) {}
            let pinnedSearches = await new Promise(resolve => {
                chrome.storage.sync.get(['pinnedSearches'], data => {
                    if(!data.pinnedSearches) data.pinnedSearches = [];
                    resolve(data.pinnedSearches);
                });
            });
            savedSearches = savedSearches.concat(pinnedSearches.map(i => ({query: i, local: true})));
        }
        if(lastSearches.length > 0) {
            let span = document.createElement('span');
            span.innerText = LOC.last_searches.message;
            span.className = 'search-results-title';
            searchResults.append(span);
            for(let i in lastSearches) {
                let topic = lastSearches[i];
                let topicElement = document.createElement('a');
                topicElement.href = `/search?q=${topic}`;
                topicElement.className = 'search-result-item';
                topicElement.innerText = topic;
                if(location.pathname.startsWith('/search')) topicElement.addEventListener('click', e => {
                    e.preventDefault();
                    searchResults.hidden = true;
                    searchInput.value = topic;
                    let event = new Event('newSearch');
                    document.dispatchEvent(event);
                });
                let removeTopic = document.createElement('span');
                removeTopic.innerText = '×';
                removeTopic.className = 'search-result-item-remove';
                removeTopic.addEventListener('click', () => {
                    lastSearches.splice(i, 1);
                    chrome.storage.local.set({lastSearches: lastSearches});
                    topicElement.remove();
                    removeTopic.remove();
                });
                searchResults.append(topicElement, removeTopic);
            }
        }
        if(savedSearches.length > 0) {
            let span = document.createElement('span');
            span.innerText = LOC.saved_searches.message;
            span.className = 'search-results-title';
            searchResults.append(span);
            for(let i in savedSearches) {
                let topic = savedSearches[i].query;
                let topicId = savedSearches[i].id_str;
                let topicElement = document.createElement('a');
                topicElement.href = `/search?q=${topic}`;
                topicElement.className = 'search-result-item';
                topicElement.innerText = topic;
                if(location.pathname.startsWith('/search')) topicElement.addEventListener('click', e => {
                    e.preventDefault();
                    searchResults.hidden = true;
                    searchInput.value = topic;
                    let event = new Event('newSearch');
                    document.dispatchEvent(event);
                });
                let removeTopic = document.createElement('span');
                removeTopic.innerText = '×';
                removeTopic.className = 'search-result-item-remove';
                removeTopic.addEventListener('click',async () => {
                    if(savedSearches[i].local) {
                        let pinnedSearches = await new Promise(resolve => {
                            chrome.storage.sync.get(['pinnedSearches'], data => {
                                if(!data.pinnedSearches) data.pinnedSearches = [];
                                resolve(data.pinnedSearches);
                            });
                        });
                        pinnedSearches = pinnedSearches.filter(i => i !== topic);
                        chrome.storage.sync.set({pinnedSearches: pinnedSearches});
                        topicElement.remove();
                        removeTopic.remove();
                        savedSearches.splice(i, 1);
                        document.getElementById('timeline-type-right').querySelector(`option[value="search-${topic}"]`).remove();
                        document.getElementById('timeline-type-center').querySelector(`option[value="search-${topic}"]`).remove();
                        return;
                    }
                    await API.search.deleteSaved(topicId);
                    savedSearches.splice(i, 1);
                    topicElement.remove();
                    removeTopic.remove();
                });
                searchResults.append(topicElement, removeTopic);
            }
        }
    }

    searchInput.addEventListener('focus', () => {
        searchResults.hidden = false;
        if(searchInput.value.length === 0) {
            loadDefaultSearches();
        } 
    });
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            searchResults.hidden = true;
        }, 150);
    });
    let imeTyping = false;
    searchInput.addEventListener('compositionstart', () => {
        imeTyping = true;
    });
    searchInput.addEventListener('compositionend', () => {
        setTimeout(() => {
            imeTyping = false;
        }, 50);
    });
    searchInput.addEventListener('keydown', async e => {
        if(imeTyping) return;
        if(e.key === "Enter") {
            let searchElements = Array.from(searchResults.children).filter(e => e.tagName === "A");
            let activeSearch = searchElements[selectedIndex];
            if(activeSearch) {
                activeSearch.click();
            } else {
                searchIcon.click();
            }
            return;
        }
    });
    searchInput.addEventListener('keyup', async (e) => {
        if(imeTyping) return;
        let query = searchInput.value;
        let searchElements = Array.from(searchResults.children).filter(e => e.tagName === "A");
        let activeSearch = searchElements[selectedIndex];
        if(activeSearch) activeSearch.classList.remove('search-result-item-active');
        if(e.key === 'ArrowDown') {
            if(selectedIndex < searchElements.length - 1) {
                selectedIndex++;
                searchElements[selectedIndex].classList.add('search-result-item-active');
            } else {
                selectedIndex = -1;
            }
            return;
        }
        if(e.key === 'ArrowUp') {
            if(selectedIndex > -1) {
                selectedIndex--;
                if(searchElements[selectedIndex]) searchElements[selectedIndex].classList.add('search-result-item-active');
            } else {
                selectedIndex = searchElements.length - 1;
                searchElements[selectedIndex].classList.add('search-result-item-active');
            }
            return;
        }
        if(query.length === 0) {
            return loadDefaultSearches();
        }
        let search;

        if(isFinite(parseInt(query)) && query.length >= 5) {
            let user = await API.user.get(query);
            if(user) {
                search = {
                    topics: [],
                    users: [user]
                }
            } else {
                search = await API.search.typeahead(query);
            }
        } else if(query.startsWith('[') && query.endsWith(']')) {
            let ids = [];
            try {
                ids = JSON.parse(query);
            } catch(e) {
                return;
            }
            if(ids.length === 0) return;
            let users = await API.user.lookup(ids);
            search = {
                topics: [],
                users: users
            }
        } else {
            search = await API.search.typeahead(query);
        }
        searchResults.innerHTML = '';
        search.topics.forEach(({topic}) => {
            let topicElement = document.createElement('a');
            topicElement.href = `/search?q=${topic}`;
            topicElement.className = 'search-result-item';
            topicElement.innerText = topic;
            if(location.pathname.startsWith('/search')) topicElement.addEventListener('click', e => {
                e.preventDefault();
                searchResults.hidden = true;
                searchInput.value = topic;
                let event = new Event('newSearch');
                document.dispatchEvent(event);
            });
            searchResults.appendChild(topicElement);
        });
        search.users.forEach((user) => {
            let userElement = document.createElement('a');
            userElement.href = `/${user.screen_name}`;
            userElement.className = 'search-result-item';
            userElement.innerHTML = html`
                <img width="16" height="16" class="search-result-item-avatar" src="${`${(user.profile_image_url_https.includes('default_profile_images') && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`}">
                <span class="search-result-item-name ${user.verified || user.id_str === '1708130407663759360' ? 'search-result-item-verified' : ''}">${user.name}</span>
                <span class="search-result-item-screen-name">@${user.screen_name}</span>
            `;
            searchResults.appendChild(userElement);
        });
    });
    searchIcon.addEventListener('click', () => {
        let searchParams = new URLSearchParams(location.search);
        if(!searchInput.value || searchInput.value === 'undefined' || searchInput.value === searchParams.get('q') || (window.outerWidth <= 590 && searchInput.clientWidth<=100 && searchInput.value) ) {
            return searchInput.focus();
        }
        lastSearches.push(searchInput.value);
        if(lastSearches.length > 5) {
            lastSearches.shift();
        }
        lastSearches = [...new Set(lastSearches)];
        chrome.storage.local.set({
            lastSearches
        }, () => {
            if(location.pathname.startsWith('/search')) {
                searchResults.hidden = true;
                let event = new Event('newSearch');
                document.dispatchEvent(event);
            } else {
                let a = document.createElement('a');
                a.href = `/search?q=${encodeURIComponent(searchInput.value)}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        });
    });
    searchIcon.addEventListener('mousedown', e => {
        if(e.button === 1) {
            e.preventDefault();
            lastSearches.push(searchInput.value);
            if(lastSearches.length > 5) {
                lastSearches.shift();
            }
            lastSearches = [...new Set(lastSearches)];
            chrome.storage.local.set({
                lastSearches
            }, () => {
                openInNewTab(`/search?q=${encodeURIComponent(searchInput.value)}`);
            });
        }
    });

    // user previews
    let userPreviewTimeouts = [];
    let leavePreviewTimeout;
    document.addEventListener('mouseover', e => {
        if(innerWidth < 650 && !vars.showUserPreviewsOnMobile) return;
        for(let timeout of userPreviewTimeouts) {
            clearTimeout(timeout);
        }
        userPreviewTimeouts = [];
        let el = e.target;
        if(el.closest('.user-preview')) {
            clearTimeout(leavePreviewTimeout);
            leavePreviewTimeout = null;
        }
        el = el.closest('a');
        if(!el || !el.href) return;
        let url;
        try { url = new URL(el.href.split('?')[0].split('#')[0]) } catch(e) { return };
        if((!isProfilePath(url.pathname) && !url.pathname.startsWith('/i/user/')) || (url.host !== 'twitter.com' && url.host !== 'x.com')) return;
        let username, id;
        let path = url.pathname;
        if(path.endsWith('/')) path = path.slice(0, -1);

        if(url.pathname.startsWith('/i/user/')) {
            id = path.split('/').pop();
        } else {
            username = path.slice(1);
        };

        if(location.pathname.slice(1) === username) return;
        if(username === user.screen_name) return;
        if(typeof pageUser !== 'undefined') {
            if(username === pageUser.screen_name) return;
        }
        userPreviewTimeouts.push(setTimeout(async () => {
            if(!document.hasFocus()) return;
            let userPreview = document.createElement('div');
            let shadow = userPreview.attachShadow({mode: 'closed'});
            userPreview.className = 'user-preview';

            let stopLoad = false;

            let leaveFunction = () => {
                leavePreviewTimeout = setTimeout(() => {
                    stopLoad = true;
                    userPreview.remove();
                    el.removeEventListener('mouseleave', leaveFunction);
                }, 500);
            }
            el.addEventListener('mouseleave', leaveFunction);
            if(innerWidth < 650) {
                let mobileClickFunction = e => {
                    if(e.target.closest('.user-preview')) return;
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    stopLoad = true;
                    userPreview.remove();
                    document.removeEventListener('click', mobileClickFunction, true);
                }
                document.addEventListener('click', mobileClickFunction, true);
            }

            let cachedUser = Object.values(userStorage).find(i => i.screen_name.toLowerCase() === username.toLowerCase());
            let user = cachedUser ? cachedUser : await API.user.get(id ? id : username, !!id);
            if(stopLoad) return;
            let userPreviews = Array.from(document.getElementsByClassName('user-preview'));
            if(userPreviews.length > 0) {
                for(let userPreview of userPreviews) {
                    userPreview.remove();
                }
            };
            let div = document.createElement('div');
            div.innerHTML = html`
                <style>
                    :host{font-weight:initial;line-height:initial;text-align:initial;word-spacing:initial;white-space:initial}
                    .follows-you-label{font-size:11px;letter-spacing:.02em;text-transform:uppercase;color:var(--darker-gray);background:rgba(0,0,0,0.08);width:fit-content;padding:3px 7px;border-radius:5px;margin-bottom:5px;margin-top:5px;display:block}
                    .preview-user-banner {border-top-left-radius: 5px;border-top-right-radius: 5px;object-fit: cover;}
                    .preview-user-info {left: 10px;position: relative;text-decoration: none !important;}
                    .preview-user-stats {display: inline-flex;padding-bottom: 7px;}
                    .preview-user-avatar {border: 4px solid var(--background-color);border-radius: 7px;margin-left: 7px;margin-top: -32px;}
                    .preview-user-name {color: var(--almost-black);font-size: 20px;margin: 0;position: relative;width: 180px;overflow-x: hidden;}
                    .preview-user-handle {color: var(--lil-darker-gray);font-size: 14px;font-weight: 100;margin: 0;position: relative;width: fit-content;}
                    .preview-user-follow {float: right;bottom: 68px;position: relative;right: 7px;}
                    .preview-user-description {width: 280px;color: var(--darker-gray);font-size: 15px;left: 10px;position: relative;display: block;margin-top: 5px;overflow: hidden;}
                    .user-stat-div>h2 {color: var(--lil-darker-gray);font-size: 14px;font-weight: 100;margin: 0 10px;text-transform: uppercase;white-space: nowrap;}
                    .user-stat-div>h1 {color: var(--link-color);font-size: 20px;margin: 0 10px }
                    .user-stat-div {text-decoration: none !important;}
                    ${modernUIEnabled ? html`
                    .nice-button {color: var(--almost-black);background-color: var(--darker-background-color);background-image: var(--link-color);background-color: var(--link-color);background-repeat: no-repeat;border: none;border-radius: 999px;color: white;cursor: pointer;font-size: 14px;font-weight: bold;line-height: normal;padding: 8px 16px;}
                    .nice-button:hover:not([disabled]) {filter: brightness(0.9);}
                    .nice-button:disabled {opacity:0.6;}
                    .nice-button:disabled:before {opacity:0.6;}
                    .follow{border: 1px solid var(--link-color) !important;color:var(--link-color) !important;background-image: var(--background-color) !important;background-color: var(--background-color) !important;}`:html`
                    .nice-button {color: var(--almost-black);background-color: var(--darker-background-color);background-image: linear-gradient(var(--background-color),var(--darker-background-color));background-repeat: no-repeat;border: 1px solid var(--border);border-radius: 4px;color: var(--darker-gray);cursor: pointer;font-size: 14px;font-weight: bold;line-height: normal;padding: 8px 16px;}
                    .nice-button:hover:not([disabled]) {color: var(--almost-black);text-decoration: none;background-color: var(--border);background-image: linear-gradient(var(--background-color),var(--border));border-color: var(--border);}
                    .nice-button:disabled {color: lightgray !important;cursor: not-allowed;}
                    .nice-button:disabled:before {color: lightgray !important;}`}
                    .emoji {height: 16px;margin-left: 2px;margin-right: 2px;vertical-align: text-top;width: 16px;}
                    a {color: var(--link-color);text-decoration: none }
                    a:hover {text-decoration: underline;}
                    .profile-additional-thing{font-size:14px;color: var(--darker-gray);font-weight:400;line-height:20px;left: 10px;position: relative;display: block;overflow: hidden;}
                    .profile-additional-thing::before{margin-right:5px;vertical-align:sub;color:var(--light-gray);display:inline-block;width:20px;text-align:center;font: 18px var(--icon-font)}
                    .profile-additional-location::before{content:"\\f031"}
                    .profile-additional-joined::before{content:var(--joined-icon)}
                    .profile-additional-birth::before{content:var(--birthday-icon)}
                    .profile-additional-professional::before{content:"\\f204"}
                    .profile-additional-url::before{content:"\\f098"}
                    .preview-user-additional-info{margin-top:10px}
                    ${roundAvatarsEnabled ? '.preview-user-avatar {border-radius: 50%!important;}' : ''}
                </style>
                <img class="preview-user-banner" height="100" width="300" src="${user.profile_banner_url ? user.profile_banner_url : 'https://abs.twimg.com/images/themes/theme1/bg.png'}">
                <div class="preview-user-data">
                    <a class="preview-user-avatar-link" href="/${user.screen_name}">
                        <img class="preview-user-avatar" width="50" height="50" src="${`${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`.replace('_normal.', '_400x400.')}">
                    </a>
                    <br>
                    <a class="preview-user-info" href="/${user.screen_name}">
                        <h1 class="preview-user-name">${escapeHTML(user.name)}</h1>
                        <h2 class="preview-user-handle">@${user.screen_name}</h2>
                        ${user.followed_by ? html`<span class="follows-you-label">${LOC.follows_you.message}</span>` : ''}
                    </a>
                    <button class="nice-button preview-user-follow ${user.following ? 'following' : 'follow'}">${user.following ? LOC.following_btn.message : LOC.follow.message}</button>
                    <span class="preview-user-description">${escapeHTML(user.description).replace(/\n/g, '<br>').replace(/((http|https):\/\/[\w?=.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="/$1">@$1</a>`).replace(/(?<!\w)#([\w+]+\b)/g, `<a href="/hashtag/$1">#$1</a>`)}</span>
                    <div class="preview-user-additional-info">
                        <span class="profile-additional-thing profile-additional-joined">${LOC.joined.message} ${new Date(user.created_at).toLocaleDateString(LANGUAGE.replace("_", "-"), {month: 'long', year: 'numeric', day: 'numeric'})}</span>
                    </div>
                    <br>
                    <div class="preview-user-stats">
                        <a class="user-stat-div" href="/${user.screen_name}/following">
                            <h2>${LOC.following.message}</h2>
                            <h1 class="preview-user-following">${formatLargeNumber(user.friends_count).replace(/\s/g, ',')}</h1>
                        </a>
                        <a class="user-stat-div" href="/${user.screen_name}/followers">
                            <h2>${LOC.followers.message}</h2>
                            <h1 class="preview-user-followers">${formatLargeNumber(user.followers_count).replace(/\s/g, ',')}</h1>
                        </a>
                    </div>
                </div>
            `;
            let additionalInfoElement = div.querySelector('.preview-user-additional-info');
            if(user.location) {
                let location = document.createElement('span');
                location.classList.add('profile-additional-thing', 'profile-additional-location');
                location.innerText = user.location.replace(/\n\n\n\n/g, "\n");
                additionalInfoElement.prepend(location);
                if(vars.enableTwemoji) twemoji.parse(location);
            }
            if(user.professional && user.professional.category && user.professional.category[0]) {
                let prof = document.createElement('span');
                prof.classList.add('profile-additional-thing', 'profile-additional-professional');
                prof.innerText = user.professional.category[0].name;
                additionalInfoElement.prepend(prof);
                if(vars.enableTwemoji) twemoji.parse(prof);
            }
            if(user.url) {
                let url = document.createElement('a');
                url.classList.add('profile-additional-thing', 'profile-additional-url');
                let realUrl = user.entities.url.urls[0];
                url.innerText = realUrl.display_url;
                url.href = realUrl.expanded_url;
                if(!url.href.startsWith('/')) url.target = "_blank";
                additionalInfoElement.prepend(url);
            }
            div.addEventListener('mouseleave', leaveFunction);
            let links = Array.from(div.querySelector('.preview-user-description').querySelectorAll('a'));
            links.forEach(link => {
                let realLink = user.entities.description.urls.find(u => u.url === link.href);
                if (realLink) {
                    link.href = realLink.expanded_url;
                    if(!link.href.startsWith('/')) link.target = '_blank';
                    link.innerText = realLink.display_url;
                }
            });
            const followBtn = div.querySelector('.preview-user-follow');
            followBtn.addEventListener('click', async () => {
                if (followBtn.className.includes('following')) {
                    await API.user.unfollow(user.screen_name);
                    followBtn.classList.remove('following');
                    followBtn.classList.add('follow');
                    followBtn.innerText = LOC.follow.message;
                    user.following = false;
                    let wtfFollow = document.querySelector(`.wtf-user > .tweet-avatar-link[href="/${user.screen_name}"]`);
                    if(!wtfFollow) return;
                    wtfFollow = wtfFollow.parentElement.getElementsByClassName('discover-follow-btn')[0];
                    wtfFollow.classList.remove('following');
                    wtfFollow.classList.add('follow');
                    wtfFollow.innerText = LOC.follow.message;
                } else {
                    await API.user.follow(user.screen_name);
                    followBtn.classList.add('following');
                    followBtn.classList.remove('follow');
                    followBtn.innerText = LOC.following_btn.message;
                    user.following = true;
                    let wtfFollow = document.querySelector(`.wtf-user > .tweet-avatar-link[href="/${user.screen_name}"]`);
                    if(!wtfFollow) return;
                    wtfFollow = wtfFollow.parentElement.getElementsByClassName('discover-follow-btn')[0];
                    wtfFollow.classList.add('following');
                    wtfFollow.classList.remove('follow');
                    wtfFollow.innerText = LOC.following_btn.message;
                }
            });
            shadow.appendChild(div);

            if(isSticky(el)) {
                el.after(userPreview);
            } else {
                let rects = el.getBoundingClientRect();
                userPreview.style.top = `${rects.top + window.scrollY+ 20}px`;
                userPreview.style.left = `${rects.left + window.scrollX}px`;
                let closestTweet = el.closest('.tweet');
                if(closestTweet) {
                    let linkColor = closestTweet.style.getPropertyValue('--link-color');
                    if(linkColor) {
                        div.style.setProperty('--link-color', linkColor);
                    }
                }
                document.body.append(userPreview);
            }
            if(vars.enableTwemoji) twemoji.parse(shadow);
        }, 700));
    }, { passive: true });

    document.addEventListener('messageUser', e => {
        document.getElementById('messages').click();
        setTimeout(async () => {
            let convo_id = e.detail.id;
            let u = e.detail.user;
            const messageHeaderName = modal.querySelector('.message-header-name');
            const messageHeaderAvatar = modal.querySelector('.message-header-avatar');
            const messageHeaderLink = modal.querySelector('.message-header-link');
            let messageData = await API.inbox.getConversation(convo_id);
            modal.querySelector('.message-box').hidden = false;
            modal.querySelector('.home-top').hidden = true;
            modal.querySelector('.name-top').hidden = false;
            modal.querySelector('.inbox').hidden = true;
            modal.querySelector('.new-message-box').hidden = true;
            messageHeaderName.innerText = u.name;
            messageHeaderAvatar.src = `${(u.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(u.id_str) % 7}_normal.png`): u.profile_image_url_https}`;
            messageHeaderLink.href = `/${u.screen_name}`;
            setTimeout(() => {
                modal.querySelector(".message-new-input").focus();
                if(tweetUrlToShareInDMs) modal.querySelector(".message-new-input").value = tweetUrlToShareInDMs;
            });

            renderConversation(messageData, convo_id);
        }, 50);
    });
    document.addEventListener('tweetAction', e => {
        if(typeof timeline === 'undefined') return;
        let data = e.detail;
        let tweet = data.tweet;
        let tweetData = timeline.data.find(i => i.id_str === tweet.id_str);
        switch(data.action) {
            case 'favorite': {
                if(tweetData && tweetData.renderFavoritesUp) {
                    tweetData.renderFavoritesUp();
                }
                break;
            }
            case 'unfavorite': {
                if(tweetData && tweetData.renderFavoritesDown) {
                    tweetData.renderFavoritesDown();
                }
                break;
            }
            case 'retweet': {
                if(tweetData && tweetData.renderRetweetsUp) {
                    tweetData.renderRetweetsUp(data.tweetData);
                }
                break;
            }
            case 'unretweet': {
                if(tweetData && tweetData.renderRetweetsDown) {
                    tweetData.renderRetweetsDown();
                }
                break;
            }
            case 'follow': {
                let user = tweet.user.id_str;
                let tweetsDataByUser = timeline.data.filter(i => i.user.id_str === user);
                let tweetsElementsByUser = Array.from(document.getElementsByClassName('tweet')).filter(i => i.dataset.userId === user);
                let wtfElement = Array.from(document.getElementsByClassName('wtf-user')).filter(i => i.dataset.userId === user)[0];
                if(wtfElement) {
                    wtfElement.remove();
                }
                tweetsDataByUser.forEach(tweetData => {
                    tweetData.user.following = true;
                });
                tweetsElementsByUser.forEach(tweetElement => {
                    let followButton = tweetElement.getElementsByClassName('tweet-interact-more-menu-follow')[0];
                    if(followButton) {
                        if(LOC.unfollow_user.message.includes('$SCREEN_NAME$')) {
                            followButton.innerText = `${LOC.unfollow_user.message.replace('$SCREEN_NAME$', tweet.user.screen_name)}`;
                        } else {
                            followButton.innerText = `${LOC.unfollow_user.message} @${tweet.user.screen_name}`;
                        }
                    }
                });
                let controlFollow = document.getElementById('control-follow');
                if(controlFollow) {
                    controlFollow.classList.remove('follow');
                    controlFollow.classList.add('following');
                    controlFollow.innerText = LOC.following.message;
                    pageUser.following = true;
                }
                break;
            }
            case 'unfollow': {
                let user = tweet.user.id_str;
                let tweetsDataByUser = timeline.data.filter(i => i.user.id_str === user);
                let tweetsElementsByUser = Array.from(document.getElementsByClassName('tweet')).filter(i => i.dataset.userId === user);
                tweetsDataByUser.forEach(tweetData => {
                    tweetData.user.following = false;
                });
                let controlFollow = document.getElementById('control-follow');
                if(controlFollow) {
                    controlFollow.classList.remove('following');
                    controlFollow.classList.add('follow');
                    controlFollow.innerText = LOC.follow.message;
                    pageUser.following = false;
                }
                tweetsElementsByUser.forEach(tweetElement => {
                    let followButton = tweetElement.getElementsByClassName('tweet-interact-more-menu-follow')[0];
                    if(followButton) {
                        if(LOC.follow_user.message.includes('$SCREEN_NAME$')) {
                            followButton.innerText = `${LOC.follow_user.message.replace('$SCREEN_NAME$', tweet.user.screen_name)}`;
                        } else {
                            followButton.innerText = `${LOC.follow_user.message} @${tweet.user.screen_name}`;
                        }
                    }
                });
                break;
            }
            case 'block': {
                let user = tweet.user.id_str;
                let tweetsDataByUser = timeline.data.filter(i => i.user.id_str === user);
                let tweetsElementsByUser = Array.from(document.getElementsByClassName('tweet')).filter(i => i.dataset.userId === user);
                let wtfElement = Array.from(document.getElementsByClassName('wtf-user')).filter(i => i.dataset.userId === user)[0];
                if(wtfElement) {
                    wtfElement.remove();
                }
                tweetsDataByUser.forEach(tweetData => {
                    tweetData.user.blocking = true;
                });
                tweetsElementsByUser.forEach(tweetElement => {
                    let blockButton = tweetElement.getElementsByClassName('tweet-interact-more-menu-block')[0];
                    if(blockButton) {
                        if(LOC.unblock_user.message.includes('$SCREEN_NAME$')) {
                            blockButton.innerText = `${LOC.unblock_user.message.replace('$SCREEN_NAME$', tweet.user.screen_name)}`;
                        } else {
                            blockButton.innerText = `${LOC.unblock_user.message} @${tweet.user.screen_name}`;
                        }
                    }
                });
                break;
            }
            case 'unblock': {
                let user = tweet.user.id_str;
                let tweetsDataByUser = timeline.data.filter(i => i.user.id_str === user);
                let tweetsElementsByUser = Array.from(document.getElementsByClassName('tweet')).filter(i => i.dataset.userId === user);
                tweetsDataByUser.forEach(tweetData => {
                    tweetData.user.blocking = false;
                });
                tweetsElementsByUser.forEach(tweetElement => {
                    let blockButton = tweetElement.getElementsByClassName('tweet-interact-more-menu-block')[0];
                    if(blockButton) {
                        if(LOC.block_user.message.includes('$SCREEN_NAME$')) {
                            blockButton.innerText = `${LOC.block_user.message.replace('$SCREEN_NAME$', tweet.user.screen_name)}`;
                        } else {
                            blockButton.innerText = `${LOC.block_user.message} @${tweet.user.screen_name}`;
                        }
                    }
                });
                break;
            }
            case 'mute': {
                tweet.conversation_muted = true;
                let tweetElement = Array.from(document.getElementsByClassName('tweet')).filter(i => i.dataset.tweetId === tweet.id_str)[0];
                if(tweetElement) {
                    let muteButton = tweetElement.getElementsByClassName('tweet-interact-more-menu-mute')[0];
                    if(muteButton) muteButton.innerText = LOC.unmute_convo.message;
                }
                break;
            }
            case 'unmute': {
                tweet.conversation_muted = false;
                let tweetElement = Array.from(document.getElementsByClassName('tweet')).filter(i => i.dataset.tweetId === tweet.id_str)[0];
                if(tweetElement) {
                    let muteButton = tweetElement.getElementsByClassName('tweet-interact-more-menu-mute')[0];
                    if(muteButton) muteButton.innerText = LOC.mute_convo.message;
                }
                break;
            }
        }
    });
    let lastTweetScrollDate = 0;
    document.addEventListener('scroll', async () => {
        if(Date.now() - lastTweetScrollDate < 100) return;
        lastTweetScrollDate = Date.now();

        let tweets = Array.from(document.getElementsByClassName('tweet'));
        let scrollPoint = scrollY + innerHeight/2;
        let newActiveTweet = tweets.find(t => scrollPoint > t.offsetTop && scrollPoint < t.offsetTop + t.offsetHeight);
        if(!activeTweet || (newActiveTweet && activeTweet.dataset.tweetId !== newActiveTweet.dataset.tweetId)) {
            if(activeTweet) {
                activeTweet.classList.remove('tweet-active');
                let video = activeTweet.querySelector('.tweet-media > video[controls]');
                let qvideo = activeTweet.querySelector('.tweet-media-quote > video[controls]');
                if(!vars.dontPauseVideos) {
                    if(video) {
                        video.pause();
                    }
                    if(qvideo) {
                        qvideo.pause();
                    }
                }
                if(activeTweet.tweet && activeTweet.tweet.algo) {
                    if(!seenAlgoTweets.includes(activeTweet.tweet.id_str)) seenAlgoTweets.push(activeTweet.tweet.id_str);
                    if(seenAlgoTweets.length > 100) {
                        seenAlgoTweets.shift();
                    }
                    algoTweetsChanged = true;
                }
            }
            if(newActiveTweet) newActiveTweet.classList.add('tweet-active');
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
    }, { passive: true });

    // menu
    let userMenu = document.getElementById('navbar-user-menu');
    userAvatar.addEventListener('click', () => {
        if(!userMenu.hidden) {
            return userMenu.hidden = true;
        }
        userMenu.hidden = false;
        setTimeout(() => {
            document.body.addEventListener('click', e => {
                setTimeout(() => {
                    userMenu.hidden = true;
                }, 70);
            }, { once: true });
        }, 70);
    });

    // notifications
    document.getElementById('notifications').addEventListener('click', async e => {
        if(vars.openNotifsAsModal && location.pathname !== '/notifications' && location.pathname !== '/notifications/mentions') {
            e.preventDefault();
            e.stopImmediatePropagation();

            let previousLocation = location.href;
            let ui = setInterval(() => updateNotifications({ mode: 'prepend', quiet: true }), 20000);

            let modal = createModal(`
                <div class="nav-notifications-loading">
                    <img src="${chrome.runtime.getURL('images/loading.svg')}" width="64" height="64">
                </div>
                <div class="nav-notification-list"></div>
                <div class="nav-notification-more center-text" hidden>${LOC.load_more.message}</div>
            `, 'notifications-modal', () => {
                if(location.href !== previousLocation) history.pushState({}, null, previousLocation);
                setTimeout(() => notificationsOpened = false, 100);
                clearInterval(ui);
            }, () => {
                let tv = document.querySelector('.tweet-viewer');
                return !tv;
            });
            notificationsOpened = true;

            history.pushState({}, null, `/notifications`);

            let notifLoading = modal.getElementsByClassName('nav-notifications-loading')[0];
            let notifList = modal.getElementsByClassName('nav-notification-list')[0];
            let notifMore = modal.getElementsByClassName('nav-notification-more')[0];

            let cursorTop = undefined;
            let cursorBottom = undefined;
            let loadingMore = true;

            async function updateNotifications(options = { mode: 'rewrite', quiet: false }) {
                if(options.mode === 'rewrite' && !options.quiet) {
                    notifLoading.hidden = false;
                    notifMore.hidden = true;
                }
                let data;
                try {
                    data = await API.notifications.get(
                        options.mode === 'append' ? cursorBottom : options.mode === 'prepend' ? cursorTop : undefined, // cursor
                        false, // onlyMentions
                        options.mode === 'rewrite', // long lasting cache
                        options.mode === 'prepend' // prepend to cache
                    );
                } catch(e) {
                    await sleep(2500);
                    try {
                        data = await API.notifications.get(
                            options.mode === 'append' ? cursorBottom : options.mode === 'prepend' ? cursorTop : undefined,
                            false,
                            options.mode === 'rewrite',
                            options.mode === 'prepend'
                        );
                    } catch(e) {
                        notifLoading.hidden = true;
                        notifMore.hidden = false;
                        notifMore.innerText = LOC.load_more.message;
                        loadingMore = false;
                        console.error(e);
                        return;
                    }
                }
                const tlUsers = data.list.filter(i => i.type === 'tweet').map(i => i.user.id_str);
                if (typeof linkColors !== "undefined") {
                    let linkData = await getLinkColors(tlUsers);
                    if(linkData) for(let i in linkData) {
                        linkColors[linkData[i].id] = linkData[i].color;
                    }
                }
                if(options.mode === 'append' || options.mode === 'rewrite') {
                    cursorBottom = data.cursorBottom;
                }
                if(options.mode === 'prepend' || options.mode === 'rewrite') {
                    if(data.cursorTop !== cursorTop) {
                        setTimeout(() => {
                            if(document.hasFocus()) {
                                API.notifications.markAsRead(cursorTop);
                                chrome.storage.local.remove(['unreadCount'], () => {});

                                let notifElement = document.getElementById('notifications-count');
                                let icon = document.getElementById('site-icon');
                                notifElement.hidden = true;
                                icon.href = chrome.runtime.getURL(`images/logo32${vars.useNewIcon ? '_new' : ''}.png`);
                                let newTitle = document.title;
                                if(document.title.startsWith('(')) {
                                    newTitle = document.title.split(') ')[1];
                                }
                                if(document.title !== newTitle) {
                                    document.title = newTitle;
                                }
                                notificationBus.postMessage({type: 'markAsRead', cursor: cursorTop});
                            }
                        }, 500);
                    }

                    cursorTop = data.cursorTop;
                }

                if(options.mode === 'append' || options.mode === 'rewrite') {
                    if(options.mode === 'rewrite') {
                        notifList.innerHTML = '';
                    }

                    let notifs = data.list;
                    for(let n of notifs) {
                        if(n.type === 'notification') {
                            let nd = renderNotification(n, { unread: n.unread });
                            notifList.appendChild(nd);
                        } else if(n.type === 'tweet') {
                            let t = await appendTweet(n, notifList, { noInsert: true, ignoreSeen: true });
                            if(t) {
                                if(n.unread) {
                                    t.classList.add('notification-unread');
                                }
                                notifList.appendChild(t);
                                if(vars.enableTwemoji) {
                                    twemoji.parse(t);
                                }
                            }
                        }
                    }
                } else if(options.mode === 'prepend') {
                    let divs = [];
                    
                    let notifs = data.list;
                    for(let n of notifs) {
                        if(n.type === 'notification') {
                            let notificationsWithSameId = document.querySelectorAll(`div[data-notification-id="${n.id}"]`);
                            notificationsWithSameId.forEach(nd => nd.remove());
                            let nd = renderNotification(n, { unread: true });
                            divs.push(nd);
                        } else if(n.type === 'tweet') {
                            let t = await appendTweet(n, notifList, { noInsert: true });
                            t.classList.add('notification-unread');
                            divs.push(t);
                        }
                    }

                    notifList.prepend(...divs);
                    if(vars.enableTwemoji) {
                        for(let nd of divs) {
                            twemoji.parse(nd);
                        }
                    }
                }

                notifLoading.hidden = true;
                notifMore.hidden = false;
                notifMore.innerText = LOC.load_more.message;
                loadingMore = false;
            }

            await updateNotifications({ mode: 'rewrite', quiet: false });
            await updateNotifications({ mode: 'prepend', quiet: true });

            modal.addEventListener('scroll', () => {
                if(loadingMore) return;
                if(modal.scrollTop > modal.scrollHeight - modal.clientHeight - 300) {
                    notifMore.click();
                }
            }, { passive: true });
            
            notifMore.addEventListener('click', () => {
                if(loadingMore) return;
                loadingMore = true;
                notifMore.innerText = LOC.loading.message;
                updateNotifications({ mode: 'append', quiet: true });
            });
        }
    });

    updateUnread();
    updateAccounts();
    updateInboxData();
    setInterval(updateAccounts, 20000);
    setInterval(updateUnread, 20000);
    setInterval(updateInboxData, 20000);
}

setInterval(() => {
    if(!vars.timeMode) return;
    let dark = isDark();
    if(dark !== isDarkModeEnabled) {
        isDarkModeEnabled = dark;
        switchDarkMode(dark);
    }
}, 60000);

(async () => {
    if(!vars) {
        await varsPromise;
    }
    if(vars.darkMode || (vars.timeMode && isDark())) {
        let bg = getComputedStyle(document.querySelector(':root')).getPropertyValue('--background-color').trim();
        if(bg === '') {
            while(bg !== 'white' && bg !== '#1b2836') {
                await sleep(50);
                bg = getComputedStyle(document.querySelector(':root')).getPropertyValue('--background-color').trim();
                if(bg === 'white') {
                    isDarkModeEnabled = true;
                    switchDarkMode(true);
                }
            }
        }
    }

    setTimeout(() => {
        if(!headerGotUser) {
            API.account.verifyCredentials().then(async u => {
                userDataFunction(u);
            });
        }
    }, 0); // fixes a bug where user info doesn't load on the profile page occasionally
    setTimeout(() => {
        let version = document.getElementById('oldtwitter-version');
        let version2 = document.getElementById('oldtwitter-version-left');
        if(version) {
            fetch(`https://raw.githubusercontent.com/dimdenGD/OldTwitter/master/manifest.json?t=${Date.now()}`).then(res => res.json()).then(res => {
                version.innerHTML+= html` <div style="display:inline;white-space : nowrap;">(${LOC.last_version.message}: ${res.version})</div>`;
                version2.innerHTML +=  html` <div style="display:inline;white-space : nowrap;">(${LOC.last_version.message}: ${res.version})</div>`;
                if(TRANSLATORS[LANGUAGE]) {
                    let translated_by = document.createElement('span');
                    let translated_by_2 = document.createElement('span');
                    if(typeof TRANSLATORS[LANGUAGE][0] === 'object') {
                        let as = [];
                        for(let translator of TRANSLATORS[LANGUAGE]) {
                            as.push(`<a${translator[1] ? ` target="_blank" href="${translator[1]}"` : ''}>${translator[0]}</a>`);
                        }
                        translated_by.innerHTML = html` ${LOC.translated_by.message.replace("$TRANSLATOR$", as.join(', '))}<br>`;
                        translated_by_2.innerHTML = html` ${LOC.translated_by.message.replace("$TRANSLATOR$", as.join(', '))}<br>`;
                    } else {
                        translated_by.innerHTML = html` ${LOC.translated_by.message.replace("$TRANSLATOR$", `<a${TRANSLATORS[LANGUAGE][1] ? ` target="_blank" href="${TRANSLATORS[LANGUAGE][1]}"` : ''}>${TRANSLATORS[LANGUAGE][0]}</a>`)}<br>`;
                        translated_by_2.innerHTML = html` ${LOC.translated_by.message.replace("$TRANSLATOR$", `<a${TRANSLATORS[LANGUAGE][1] ? ` target="_blank" href="${TRANSLATORS[LANGUAGE][1]}"` : ''}>${TRANSLATORS[LANGUAGE][0]}</a>`)}<br>`;
                    }
                    document.getElementById('about-right').children[0].append(translated_by);
                    document.getElementById('about-left').children[0].append(translated_by_2);
                } else {
                    document.getElementById('about-right').children[0].append(document.createElement('br'));
                    document.getElementById('about-left').children[0].append(document.createElement('br'));
                }
                if(vars.modernUI){
                    document.getElementById('twitter-copyright-right').innerText = document.getElementById('twitter-copyright-right').innerText.replace('2015','2018');
                    document.getElementById('twitter-copyright-left').innerText = document.getElementById('twitter-copyright-left').innerText.replace('2015','2018');
                }
            });
        }
        let about_left = document.getElementById('about-left');
        let about_right = document.getElementById('about-right');
        if(about_left && about_right && !location.pathname.startsWith('/old/') && !location.pathname.startsWith('/i/timeline')) {
            let a = document.createElement('a');
            let a2 = document.createElement('a');
            let hrefUrl = new URL(location.href);
            let searchParams = new URLSearchParams(hrefUrl.search);
            searchParams.set('newtwitter', 'true');
            hrefUrl.search = searchParams.toString();
            a.href = hrefUrl.toString();
            a2.href = hrefUrl.toString();
            setInterval(() => {
                let hrefUrl = new URL(location.href);
                let searchParams = new URLSearchParams(hrefUrl.search);
                searchParams.set('newtwitter', 'true');
                hrefUrl.search = searchParams.toString();
                a.href = hrefUrl.toString();
                a2.href = hrefUrl.toString();
            }, 500);
            a.className = "open-new-twitter";
            a.innerText = `[${LOC.open_newtwitter.message}]`;
            a.addEventListener('click', e => {
                e.stopImmediatePropagation();
            });
            a2.className = "open-new-twitter";
            a2.innerText = `[${LOC.open_newtwitter.message}]`;
            a2.addEventListener('click', e => {
                e.stopImmediatePropagation();
            });
            about_left.appendChild(a);
            about_right.appendChild(a2);
        }
        if(Math.random() > 0.99) {
            document.getElementById('donate-button').innerHTML += ' <span style="vertical-align: middle;">🥺</span>';
        }
    }, 500);

    let root = document.querySelector(":root");
    document.addEventListener('updatePageUserData', e => {
        let pageUser = e.detail;
        if(pageUser.profile_link_color && pageUser.profile_link_color !== '1DA1F2') {
            customSet = true;
            root.style.setProperty('--link-color', pageUser.profile_link_color);
        }
    });

    hideStuff();
    setTimeout(hideStuff, 1000); // weird issue on firefox

    // custom css
    document.addEventListener('customCSS', updateCustomCSS);
    document.addEventListener('customCSSVariables', () => switchDarkMode(isDarkModeEnabled));
    document.addEventListener('roundAvatars', e => switchRoundAvatars(e.detail));
    document.addEventListener('modernUI', e => switchModernUI(e.detail));

    // hotkeys
    if(!vars.disableHotkeys) {
        function processHotkeys() {
            if (keysHeld['Alt'] && keysHeld['Control'] && keysHeld['KeyO']) {
                let url = new URL(location.href);
                url.searchParams.set('newtwitter', 'true');
                location.replace(url.href);
            } else if(keysHeld['Alt'] && keysHeld['Control'] && keysHeld['KeyD']) {
                if(vars.developerMode) chrome.storage.sync.get('extensiveLogging', res => {
                    chrome.storage.sync.set({ extensiveLogging: !res.extensiveLogging }, () => {
                        if(!res.extensiveLogging) {
                            toast.success('Extensive logging enabled', 3000);
                        } else {
                            toast.error('Extensive logging disabled', 3000);
                        }
                        vars.extensiveLogging = !res.extensiveLogging;
                    });
                });
            } else if(keysHeld['Alt'] && keysHeld['Control'] && keysHeld['KeyM']) {
                if(vars.developerMode) {
                    let pass = prompt('Enter password');
                    fetch(`https://dimden.dev/services/twitter_link_colors/v2/admin/verify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            password: pass
                        })
                    }).then(res => res.text()).then(res => {
                        if(res === "ok") {
                            chrome.storage.local.set({ adminpass: pass }, () => {
                                toast.success('Password set', 3000);
                            });
                        } else {
                            toast.error('Wrong password', 3000);
                        }
                    });
                }
            } else if(keysHeld['KeyG'] && keysHeld['KeyH']) {
                location.href = '/';
            } else if(keysHeld['KeyG'] && keysHeld['KeyN']) {
                location.href = '/notifications';
            } else if(keysHeld['KeyG'] && keysHeld['KeyR']) {
                location.href = '/notifications/mentions';
            } else if(keysHeld['KeyG'] && keysHeld['KeyP']) {
                location.href = `/${user.screen_name}`;
            } else if(keysHeld['KeyG'] && keysHeld['KeyL']) {
                location.href = `/${user.screen_name}/likes`;
            } else if(keysHeld['KeyG'] && keysHeld['KeyI']) {
                location.href = `/${user.screen_name}/lists`;
            } else if(keysHeld['KeyG'] && keysHeld['KeyM']) {
                document.getElementById("messages").click();
            } else if(keysHeld['KeyG'] && keysHeld['KeyS']) {
                location.href = `/old/settings`;
            } else if(keysHeld['KeyG'] && keysHeld['KeyB']) {
                location.href = `/i/bookmarks`;
            } else if(keysHeld['KeyG'] && keysHeld['KeyU']) {
                location.href = `/unfollows/followers`;
            }
        }
        window.addEventListener('keydown', (ev) => {
            let key = ev.code;
            if(key === 'AltLeft' || key === 'AltRight') key = 'Alt';
            if(key === 'ControlLeft' || key === 'ControlRight') key = 'Control';
            if(key === 'ShiftLeft' || key === 'ShiftRight') key = 'Shift';
            if(ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') {
                if(keysHeld['KeyG']) {
                    processHotkeys();
                }
            } else {
                keysHeld[key] = true;
                processHotkeys();
            }
        });

        window.addEventListener('keyup', (ev) => {
            let key = ev.code;
            if(key === 'AltLeft' || key === 'AltRight') key = 'Alt';
            if(key === 'ControlLeft' || key === 'ControlRight') key = 'Control';
            if(key === 'ShiftLeft' || key === 'ShiftRight') key = 'Shift';
            
            if(ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') {
                if(keysHeld['KeyG']) {
                    keysHeld[key] = true;
                    processHotkeys();
                }
            } else {
                delete keysHeld[key];
            }
        });

        let tle = document.getElementById('timeline');
        if(!tle) tle = document.getElementById('list-tweets');
        document.addEventListener('keydown', async e => {
            if(e.ctrlKey || keysHeld['KeyG']) return;
            // reply box
            if(e.target.className === 'tweet-reply-text') {
                if(e.altKey) {
                    if(e.keyCode === 82) { // ALT+R
                        // hide reply box
                        e.target.blur();
                        activeTweet.getElementsByClassName('tweet-interact-reply')[0].click();
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
                        activeTweet.getElementsByClassName('tweet-interact-retweet')[0].click();
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
                if(vars.disableLikeHotkey) return;
                let tweetFavoriteButton = activeTweet.querySelector('.tweet-interact-favorite');
                tweetFavoriteButton.click();
            } else if(e.keyCode === 66) { // B
                // bookmark tweet
                if(!activeTweet) return;
                let tweetFavoriteButton = activeTweet.querySelector('.tweet-interact-more-menu-bookmark');
                tweetFavoriteButton.click();
            } else if(e.keyCode === 84) { // T
                // retweet
                if(!activeTweet) return;
                if(vars.disableRetweetHotkey) return;
                let hasRetweetedWithHotkeyBefore = await new Promise(resolve => {
                    chrome.storage.local.get(['hasRetweetedWithHotkey'], data => {
                        resolve(data.hasRetweetedWithHotkey);
                    });
                });
                if(!hasRetweetedWithHotkeyBefore) {
                    let c = confirm(LOC.retweet_hotkey_warn.message);
                    if(c) {
                        chrome.storage.local.set({hasRetweetedWithHotkey: true}, () => {});
                    } else {
                        return;
                    }
                }
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
                if(e.target.classList.contains('tweet')) {
                    if(!activeTweet) return;
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    activeTweet.click();
                } else if(e.target.className === "tweet-interact-more") {
                    e.target.click();
                    activeTweet.getElementsByClassName('tweet-interact-more-menu-copy')[0].focus();
                }
            } else if(e.keyCode === 67 && !e.ctrlKey && !e.altKey) { // C
                // copy image
                if(e.target.classList.contains('tweet')) {
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
                let vin = document.querySelector('.viewer-in');
                if(vin) {
                    return vin.querySelector('.viewer-next').click();
                }
                // download media
                if(activeTweet.classList.contains('tweet')) {
                    activeTweet.getElementsByClassName('tweet-interact-more-menu-download')[0].click();
                }
            } else if(e.keyCode === 65 && !e.ctrlKey && !e.altKey) { // A
                let vin = document.querySelector('.viewer-in');
                if(vin) {
                    return vin.querySelector('.viewer-prev').click();
                }
            }
        });
        let searchInput = document.getElementById('search-input');
        let lastAltKeyPos = 1;
        document.addEventListener('keydown', e => {
            if(e.key === 'Alt') {
                lastAltKeyPos = e.location || e.keyLocation;
            }
            if(document.activeElement === searchInput && e.altKey && e.keyCode === 70) { // Alt+F
                // blur search bar
                e.preventDefault();
                e.stopImmediatePropagation();
                searchInput.blur();
            }
            if(e.target.className === 'navbar-new-tweet-text' && e.altKey) {
                let m = document.getElementsByClassName('navbar-new-tweet-container')[0];
                if(e.keyCode === 77) { // ALT+M
                    // upload media
                    let tweetUpload = m.getElementsByClassName('navbar-new-tweet-media')[0];
                    tweetUpload.click();
                } else if(e.keyCode === 70) { // ALT+F
                    // remove first media
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    let tweetMediaElement = m.getElementsByClassName('navbar-new-tweet-media-c')[0].children[0];
                    if(!tweetMediaElement) return;
                    let removeBtn = tweetMediaElement.getElementsByClassName('new-tweet-media-img-remove')[0];
                    removeBtn.click();
                }
            }
            if(e.target.id === 'new-tweet-text' && e.altKey && lastAltKeyPos === 1) {
                if(e.keyCode === 77) { // ALT+M
                    // upload media
                    let tweetUpload = document.getElementById('new-tweet-media');
                    tweetUpload.click();
                } else if(e.keyCode === 70) { // ALT+F
                    // remove first media
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    let tweetMediaElement = document.getElementById('new-tweet-media-c').children[0];
                    if(!tweetMediaElement) return;
                    let removeBtn = tweetMediaElement.getElementsByClassName('new-tweet-media-img-remove')[0];
                    removeBtn.click();
                } else if(e.keyCode === 78) { // ALT+N
                    // unfocus new tweet
                    e.target.blur();
                    let f = document.getElementById('timeline').firstChild;
                    f.scrollIntoView();
                    f.focus();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }

            if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'EMOJI-PICKER') return;

            if(!e.altKey && !e.ctrlKey && e.keyCode === 70) { // F
                if(vars.disableFindHotkey) return;

                // focus search bar
                searchInput.focus();
                e.preventDefault();
                e.stopImmediatePropagation();
            }
            if(!e.altKey && !e.ctrlKey && e.keyCode === 78) { // N
                // new tweet
                e.preventDefault();
                e.stopImmediatePropagation();
                let event = new CustomEvent('clearActiveTweet');
                document.dispatchEvent(event);
                if(scrollY < 400 && (location.pathname === '/' || location.pathname === '/home')) {
                    let newTweetText = document.getElementById('new-tweet-text');
                    document.getElementById('new-tweet').click();
                    newTweetText.focus();
                    document.scrollingElement.scrollTop = 0;
                } else {
                    document.getElementById('navbar-tweet-button').click();
                }
            }
            if(!e.altKey && !e.ctrlKey && e.keyCode === 77) { // M
                document.getElementById('navbar-user-avatar').click();
                if(!document.getElementById('navbar-user-menu').hidden) {
                    document.getElementById('navbar-user-menu-profile').focus();
                } else {
                    document.activeElement.blur();
                    document.removeEventListener('click', menuFn);
                    menuFn();
                    menuFn = undefined;
                }
            }
        });
    } else {
        let style = document.createElement('style');
        style.innerHTML = html`.tweet-interact::after { content: '' !important; }`;
        document.head.appendChild(style);
    }

    function fullscreenEvent(fullscreen) {
        if(fullscreen) {
            let style = document.createElement('style');
            style.innerHTML = html`.tweet-media-element-quote { object-fit: contain !important; }`;
            style.id = 'fullscreen-style';
            document.head.appendChild(style);
        } else {
            let style = document.getElementById('fullscreen-style');
            if(style) style.remove();
        }
    }
    window.addEventListener('popstate', e => {
        if(document.querySelector('iframe.iframe-navigation')) return;
        let tv = document.querySelector('.tweet-viewer');
        if(tv) return;
        let nm = document.querySelector('.notifications-modal');
        if(nm) {
            nm.parentElement.removeModal();
            return;
        }
        let messageBox = document.querySelector('.message-box');
        if(messageBox && !messageBox.hidden) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            document.querySelector(".message-header-back").click();
            return;
        }
        let im = document.querySelector('.inbox-modal');
        if(im) {
            im.parentElement.removeModal();
            return;
        }
    });

    switchDarkMode(vars.darkMode || (vars.timeMode && isDark()));
    updateCustomCSS();
    
    window.addEventListener('resize', () => {
        if (window.matchMedia('(display-mode: fullscreen)').matches || window.document.fullscreenElement) {
           fullscreenEvent(true);
        } else {
           fullscreenEvent(false);
        }
    }, { passive: true });
    setTimeout(() => {
        document.getElementById('navbar-user-avatar').addEventListener('click', () => {
            if(headerGotUser) return;
            API.account.verifyCredentials().then(async u => {
                userDataFunction({ detail: u });
            });
        });
    }, 1000);
})();