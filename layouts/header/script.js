let headerGotUser = false;
let savedSearches = [], lastSearches = [];
let inboxData = [];
let followRequestsData = [];
let customSet = false;
let menuFn;
let isDarkModeEnabled = typeof vars !== 'undefined' ? (vars.darkMode || (vars.timeMode && isDark())) : false;
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

let roundAvatarsEnabled = false;
function switchRoundAvatars(enabled) {
    roundAvatarsEnabled = enabled;
    if(enabled) {
        let style = document.createElement('style');
        style.id = 'round-avatars';
        style.innerHTML = `
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
            #nav-profile-avatar {
                border-radius: 50% !important;
            }
        `;
        document.head.appendChild(style);
    } else {
        let style = document.getElementById('round-avatars');
        if(style) style.remove();
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
        hideStyle.innerHTML += `
            .tweet-interact-favorite { color: var(--background-color) !important }
            .tweet-interact-retweet { color: var(--background-color) !important }
            .tweet-interact-reply { color: var(--background-color) !important }
            .tweet:hover .tweet-interact-favorite { color: var(--dark-background-color) !important }
            .tweet:hover .tweet-interact-retweet { color: var(--dark-background-color) !important }
            .tweet:hover .tweet-interact-reply { color: var(--dark-background-color) !important }
        `;
    }
    if(vars.hideFollowers) {
        hideStyle.innerHTML += `
            #user-followers-div { display: none !important; }
            #profile-stat-followers-link { display: none !important; }
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
    userAvatar.src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_normal.png`): user.profile_image_url_https}`.replace('_normal.', '_bigger.');
    document.getElementById('navbar-user-menu-profile').href = `/${user.screen_name}`;
    document.getElementById('navbar-user-menu-lists').href = `/${user.screen_name}/lists`;
    document.getElementById('navbar-user-menu-username').innerText = user.name;
    document.getElementById('pin-profile').hidden = !vars.pinProfileOnNavbar;
    document.getElementById('pin-bookmarks').hidden = !vars.pinBookmarksOnNavbar;
    document.getElementById('pin-lists').hidden = !vars.pinListsOnNavbar;
    document.getElementById('pin-profile').href = `/${user.screen_name}`;
    document.getElementById('pin-lists').href = `/${user.screen_name}/lists`;

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
    if(vars.heartsNotStars) {
        root.style.setProperty('--favorite-icon-content', '"\\f148"');
        root.style.setProperty('--favorite-icon-content-notif', '"\\f015"');
        root.style.setProperty('--favorite-icon-color', 'rgb(249, 24, 128)');
    }

    if(vars.roundAvatars) {
        switchRoundAvatars(true);
    }

    if(vars.disableHotkeys) {
        document.getElementById('navbar-tweet-button').title = '';
        document.getElementById('search').title = '';
    }

    // util
    let firstTime = false;
    async function updateUnread() {
        let unread = await API.notifications.getUnreadCount(firstTime);
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
            dmsElement.innerText = dms;
        } else {
            dmsElement.hidden = true;
        }
        if(notifs > 0) {
            notifElement.hidden = false;
            notifElement.innerText = notifs;
        } else {
            notifElement.hidden = true;
        }
        icon.href = total > 0 ? chrome.runtime.getURL(`images/logo32${vars.useNewIcon ? '_new' : ''}_notification.png`) : chrome.runtime.getURL(`images/logo32${vars.useNewIcon ? '_new' : ''}.png`);
        if(total > 0) {
            let newTitle = document.title;
            if(document.title.startsWith('(')) {
                newTitle = document.title.split(') ')[1];
            }
            newTitle = `(${total}) ${newTitle}`;
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
        accounts.forEach(account => {
            let accountElement = document.createElement('div');
            accountElement.classList.add('navbar-user-account');
            accountElement.innerHTML = `<img src="${account.avatar_image_url.replace("_normal", "_bigger")}" class="navbar-user-account-avatar" width="16" height="16"> ${account.screen_name}`;
            accountElement.addEventListener('click', async () => {
                if(account.screen_name === user.screen_name) return alert("You're already on this account!");
                try {
                    await API.account.switch(account.user_id);
                    window.location.reload();
                } catch(e) {
                    if((typeof(e) === 'string' && e.includes('User not found.')) || e.errors[0].code === 50) {
                        window.location = 'https://twitter.com/account/switch?newtwitter=true';
                    } else {
                        alert(e);
                    }
                    console.error(e);
                }
            });
            accountsElement.appendChild(accountElement, document.createElement('br'));
        });
        document.getElementById('navbar-user-menu-logout').addEventListener('click', async () => {
            let modal = createModal(/*html*/`
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
    async function updateInboxData() {
        inboxData = await API.inbox.get();
        if(inboxData.status === "HAS_MORE" && !cursor) {
            cursor = inboxData.min_entry_id;
        } else {
            cursor = undefined;
        };

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
                userElement.innerHTML = /*html*/`
                    <div>
                        <a href="https://twitter.com/${u.screen_name}" class="following-item-link">
                            <img src="${`${(u.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_normal.png`): u.profile_image_url_https}`}" alt="${u.screen_name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                            <div class="following-item-text">
                                <span class="tweet-header-name following-item-name ${u.verified || u.id_str === '1123203847776763904' ? 'user-verified' : ''} ${u.protected ? 'user-protected' : ''}">${escapeHTML(u.name)}</span><br>
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
            let modal = createModal(/*html*/`
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
    if(user.followers_count > 0 && user.followers_count < 50000) {
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
            if(+lastConvo.max_entry_id >= +realConvo.last_read_event_id) {
                API.inbox.markRead(lastConvo.max_entry_id);
                realConvo.last_read_event_id = lastConvo.max_entry_id;
            }
        }
        window.history.pushState(null, document.title, window.location.href)
        let messageBox = modal.querySelector('.messages-list');
        if(!lastConvo.entries) {
            modal.getElementsByClassName('messages-load-more')[0].hidden = true;
            return;
        }
        let missingUserIds = [];
        for(let j in lastConvo.entries) {
            let m = lastConvo.entries[j].message;
            if(!m) continue;
            if(!lastConvo.users[m.message_data.sender_id] && !missingUserIds.includes(m.message_data.sender_id)) {
                missingUserIds.push(m.message_data.sender_id);
            }
        }
        if(missingUserIds.length > 0) {
            let foundUsers = await API.user.lookup(missingUserIds)
            foundUsers.forEach(user => {
                lastConvo.users[user.id_str] = user;
            });
        }
        lastConvo.entries = lastConvo.entries.reverse();
        let messageElements = [];
        for(let i in lastConvo.entries) {
            if(lastConvo.entries[i].added) continue;
            let m = lastConvo.entries[i].message;
            if(!m) continue;
            let sender = lastConvo.users[m.message_data.sender_id];

            let messageElement = document.createElement('div');
            messageElement.classList.add('message-element');
            if(sender.id_str !== user.id_str) {
                messageElement.classList.add('message-element-other');
            }
            messageElement.id = `message-${m.id}`;
            messageElement.innerHTML = `
                ${sender.id_str !== user.id_str ? `
                    <a href="https://twitter.com/${sender.screen_name}"><img src="${`${(sender.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_normal.png`): sender.profile_image_url_https}`.replace("_normal", "_bigger")}" width="26" height="26"></a>
                    <span class="message-body">${escapeHTML(m.message_data.text).replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`)}</span>
                    <span class="message-time" data-timestamp="${m.time}">${timeElapsed(new Date(+m.time))}</span>
                ` : `
                    <span class="message-menu-open"></span>
                    <div class="message-menu" hidden>
                        <span class="message-menu-delete">Delete for you</span>
                    </div>
                    <span class="message-time" data-timestamp="${m.time}">${timeElapsed(new Date(+m.time))}</span>
                    <span class="message-body">${escapeHTML(m.message_data.text).replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`)}</span>
                `}
            `;
            let menuOpen = messageElement.querySelector('.message-menu-open');
            if(menuOpen) {
                let menu = messageElement.querySelector('.message-menu');
                let menuDelete = messageElement.querySelector('.message-menu-delete');

                menuDelete.addEventListener('click', () => {
                    API.inbox.deleteMessage(m.id);
                    messageElement.remove();
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
            let as = Array.from(messageElement.getElementsByTagName('a'));
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
            if(m.message_data.attachment) {
                let attachment = m.message_data.attachment;
                if(attachment.photo) {
                    let photo = attachment.photo;
                    let photoElement = document.createElement('img');
                    photoElement.src = photo.media_url_https;
                    photoElement.classList.add('message-element-media');
                    if(photo.original_info.width > 200) {
                        photoElement.width = 200;
                    } else {
                        photoElement.width = photo.original_info.width;
                    }
                    if(photo.original_info.height > 100) {
                        photoElement.height = 100;
                    } else {
                        photoElement.height = photo.original_info.height;
                    }
                    photoElement.addEventListener('click', e => {
                        new Viewer(photoElement, {
                            transition: false
                        });
                        e.target.click();
                    })
                    messageElement.append(document.createElement('br'), photoElement);
                }
                if(attachment.animated_gif) {
                    let gif = attachment.animated_gif;
                    let gifElement = document.createElement('video');
                    gifElement.src = gif.video_info.variants[0].url;
                    gifElement.muted = true;
                    gifElement.loop = true;
                    gifElement.autoplay = true;
                    if(gif.original_info.width > 200) {
                        gifElement.width = 200;
                    } else {
                        gifElement.width = gif.original_info.width;
                    }
                    if(gif.original_info.height > 100) {
                        gifElement.height = 100;
                    } else {
                        gifElement.height = gif.original_info.height;
                    }
                    gifElement.classList.add('message-element-media');
                    messageElement.append(document.createElement('br'), gifElement);
                }
            }
            let span = messageElement.getElementsByClassName('message-body')[0];
            if(span.innerHTML === '' || span.innerHTML === ' ') {
                span.remove();
            }
            if(vars.enableTwemoji) {
                twemoji.parse(messageElement);
            }
            messageElements.push(messageElement);
        }
        if(!newMessages) {
            messageElements = messageElements.reverse();
            for(let i in messageElements) {
                messageBox.prepend(messageElements[i], document.createElement('br'));
            }
        } else {
            for(let i in messageElements) {
                messageBox.append(messageElements[i], document.createElement('br'));
            }
        }
        if(newMessages) {
            let modalElement = document.getElementsByClassName('modal-content')[0];
            modalElement.scrollTop = modalElement.scrollHeight;
        }

        const loadMoreMessages = modal.querySelector('.messages-load-more');
        if(lastConvo.status === "HAS_MORE") {
            loadMoreMessages.hidden = false;
        } else {
            loadMoreMessages.hidden = true;
        }
    }
    function renderInboxMessages(inbox, inboxList) {
        inbox.conversations = Object.values(inbox.conversations).sort((a, b) => (+b.sort_timestamp)-(+a.sort_timestamp));
        for(let i in inbox.conversations) {
            let c = inbox.conversations[i];
            let lastMessage = inbox.entries.find(e => (e.message && e.message.id === c.max_entry_id) || (e.trust_conversation && e.trust_conversation.id === c.max_entry_id));
            if(!lastMessage) {
                continue;
            };
            if(lastMessage.message) {
                lastMessage = lastMessage.message;
            } else if(lastMessage.trust_conversation) {
                lastMessage = lastMessage.trust_conversation;
            };
            let messageUsers = c.participants.filter(p => p.user_id !== user.id_str).map(p => inbox.users[p.user_id]);
            let messageElement = document.createElement('div');
            messageElement.classList.add('inbox-message');
            let isUnread = false;
            if(compare(lastMessage.id, c.last_read_event_id) < 1) {}
            else {
                messageElement.classList.add('inbox-message-unread');
                isUnread = true;
            }
            messageElement.innerHTML = /*html*/`
                <img src="${messageUsers.length === 1 ? `${(messageUsers[0].default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_normal.png`): messageUsers[0].profile_image_url_https}` : (c.avatar_image_https || chrome.runtime.getURL(`/images/group.jpg`))}" width="48" height="48" class="inbox-message-avatar">
                <div class="inbox-text">
                    <b class="inbox-name">${messageUsers.length === 1 ? escapeHTML(messageUsers[0].name) : (c.name ? escapeHTML(c.name) : messageUsers.map(i => escapeHTML(i.name)).join(', ').slice(0, 128))}</b>
                    <span class="inbox-screenname">${messageUsers.length === 1 ? "@"+messageUsers[0].screen_name : ''}</span>
                    <span class="inbox-time">${timeElapsed(new Date(+lastMessage.time))}</span>
                    <br>
                    <span class="inbox-message-preview">${lastMessage.reason ? 'Accepted conversation' : lastMessage.message_data.text.startsWith('dmservice_reaction_') ? `${lastMessage.message_data.sender_id === user.id_str ? 'You reacted to message' : `${escapeHTML(messageUsers[0].name)} reacted to message`}` : escapeHTML(lastMessage.message_data.text)}</span>
                </div>
            `;
            if(vars.enableTwemoji) {
                twemoji.parse(messageElement);
            }
            const messageHeaderName = modal.querySelector('.message-header-name');
            const messageHeaderAvatar = modal.querySelector('.message-header-avatar');
            const messageHeaderLink = modal.querySelector('.message-header-link');
            messageElement.addEventListener('click', async () => {
                let messageData = await API.inbox.getConversation(c.conversation_id);
                modal.querySelector('.message-box').hidden = false;
                modal.querySelector('.home-top').hidden = true;
                modal.querySelector('.name-top').hidden = false;
                modal.querySelector('.inbox').hidden = true;
                modal.querySelector('.new-message-box').hidden = true;
                messageHeaderName.innerText = messageUsers.length === 1 ? messageUsers[0].name : (c.name || messageUsers.map(i => i.name).join(', ').slice(0, 80));
                messageHeaderAvatar.src = messageUsers.length === 1 ? `${(messageUsers[0].default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_normal.png`): messageUsers[0].profile_image_url_https}` : (c.avatar_image_https || chrome.runtime.getURL(`/images/group.jpg`));
                if(messageUsers.length === 1) messageHeaderLink.href = `https://twitter.com/${messageUsers[0].screen_name}`;
                setTimeout(() => {
                    modal.querySelector(".message-new-input").focus();
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
        messageHeaderBack.addEventListener('click', e => {
            modal.remove();
            chrome.storage.local.remove(['inboxData'], () => {});
            setTimeout(() => {
                document.getElementById('messages').click();
            }, 20);
        });
    }
    document.getElementById('messages').addEventListener('click', async e => {
        e.preventDefault();
        let inbox = inboxData;

        modal = createModal(/*html*/`
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
                <div class="name-top-background"></div><!-- ugly bug fix -->
                <div class="inbox-top name-top">
                    <span class="message-header-back"></span>
                    <a class="message-header-link">
                        <img class="message-header-avatar" width="32" height="32">
                        <h1 class="larger message-header-name nice-header">${LOC.name.message}</h1>
                    </a>
                    <span class="message-leave"></span>
                    <hr>
                </div>
                <br><br><br><br>
                <div class="messages-load-more center-text" style="margin-top:-18px;">${LOC.load_more.message}</div>
                <div class="messages-list"></div>
                <div class="message-new">
                    <div class="message-new-media"></div>
                    <span class="message-new-media-btn"></span>
                    <span class="message-emoji-btn"></span>
                    <textarea type="text" class="message-new-input" placeholder="${LOC.type_message.message}"></textarea>
                    <button class="nice-button message-new-send">${LOC.send.message}</button>
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
                location.hash = "";
            }
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
            let c = confirm('Are you sure you want to leave/remove this conversation?');
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
                userElement.innerHTML = `
                    <img class="new-message-user-avatar" src="${`${(u.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_normal.png`): u.profile_image_url_https}`.replace("_normal", "_bigger")}" width="48" height="48">
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
                    messageHeaderAvatar.src = `${(u.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_normal.png`): u.profile_image_url_https}`;
                    messageHeaderLink.href = `https://twitter.com/${u.screen_name}`;
                    setTimeout(() => {
                        modal.querySelector(".message-new-input").focus();
                    });

                    renderConversation(messageData, `${user.id_str}-${u.id_str}`);
                });
                newMessageResults.appendChild(userElement);
            });
        });

        let mediaToUpload = []; 
        newMediaButton.addEventListener('click', () => {
            getDMMedia(mediaToUpload, newMedia, document.querySelector('.modal-content')); 
        });
        newInput.addEventListener('paste', event => {
            let items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (index in items) {
                let item = items[index];
                if (item.kind === 'file') {
                    let file = item.getAsFile();
                    handleFiles([file], mediaToUpload, newMedia);
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
            let uploadedMedia = [];
            for (let i in mediaToUpload) {
                let media = mediaToUpload[i];
                try {
                    media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = false;
                    let mediaId = await API.uploadMedia({
                        media_type: media.type,
                        media: media.data,
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
                obj.media_id = uploadedMedia.join(',');
            }
            try {
                let sentMessage = await API.inbox.send(obj);
                newSend.disabled = false;
                newInput.value = "";
                mediaToUpload = [];
                newMedia.innerHTML = "";
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
                cursor = undefined;
            }
            renderInboxMessages(moreInbox, inboxList);
        });
        loadMoreMessages.addEventListener('click', async () => {
            let moreMessages = await API.inbox.getConversation(lastConvo.conversation_id, lastConvo.min_entry_id);
            renderConversation(moreMessages, lastConvo.conversation_id, false);
        });

        readAll.addEventListener('click', async () => {
            await API.inbox.markRead(inbox.last_seen_event_id);
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
    setInterval(() => {
        let times = Array.from(document.getElementsByClassName('message-time'));
        times.forEach(time => {
            time.innerText = timeElapsed(+time.dataset.timestamp);
        });
    }, 10000);
    let updateCursor;
    setInterval(async () => {
        let updates = await API.inbox.getUpdates(updateCursor);
        updateCursor = Object.values(updates)[0].cursor;
        if(updates.user_events && updates.user_events.conversations && lastConvo) {
            for(let i in updates.user_events.conversations) {
                let c = updates.user_events.conversations[i];
                if(c.conversation_id === lastConvo.conversation_id) {
                    updates.user_events.entries.forEach(e => {
                        if(e.message_delete && e.message_delete.conversation_id === lastConvo.conversation_id) {
                            let messages = e.message_delete.messages;
                            for(let j in messages) {
                                let message = messages[j];
                                let messageElement = document.getElementById(`message-${message.message_id}`);
                                if(messageElement) {
                                    messageElement.remove();
                                }
                            }
                        }
                    });
                    updates.user_events.entries = updates.user_events.entries.filter(m => m.message && m.message.conversation_id === lastConvo.conversation_id);
                    renderConversation(updates.user_events, lastConvo.conversation_id, true, false);
                }
            }
        }
    }, 5000);
    
    // tweet
    document.getElementById('navbar-tweet-button').addEventListener('click', () => {
        let modal = createModal(/*html*/`
            <div class="navbar-new-tweet-container">
                <div class="navbar-new-tweet">
                    <img width="35" height="35" class="navbar-new-tweet-avatar">
                    <span class="navbar-new-tweet-char">0/280</span>
                    <textarea maxlength="1000" class="navbar-new-tweet-text" placeholder="${LOC.whats_happening.message}"></textarea>
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
        `);
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
                document.getElementById('navbar-new-tweet-poll').innerHTML = `
                    <input class="navbar-poll-question" data-variant="1" placeholder="${LOC.variant.message} 1"><br>
                    <input class="navbar-poll-question" data-variant="2" placeholder="${LOC.variant.message} 2"><br>
                    <input class="navbar-poll-question" data-variant="3" placeholder="${LOC.variant.message} 3 ${LOC.optional.message}"><br>
                    <input class="navbar-poll-question" data-variant="4" placeholder="${LOC.variant.message} 4 ${LOC.optional.message}"><br>
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

        modal.getElementsByClassName('navbar-new-tweet-avatar')[0].src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_normal.png`): user.profile_image_url_https}`.replace("_normal", "_bigger");
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
            let text = e.target.value.replace(linkRegex, ' https://t.co/xxxxxxxxxx').trim();
            charElement.innerText = `${text.length}/280`;
            if (text.length > 265) {
                charElement.style.color = "#c26363";
            } else {
                charElement.style.color = "";
            }
            if (text.length > 280) {
                charElement.style.color = "red";
                newTweetButton.disabled = true;
            } else {
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
                    userElement.innerHTML = `
                        <img width="16" height="16" class="search-result-item-avatar" src="${`${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_normal.png`): user.profile_image_url_https}`}">
                        <span class="search-result-item-name ${user.verified || user.id_str === '1123203847776763904' ? 'search-result-item-verified' : ''}">${escapeHTML(user.name)}</span>
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
            document.getElementById('new-tweet').click();
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
    searchInput.addEventListener('keyup', async (e) => {
        let query = searchInput.value;
        let searchElements = Array.from(searchResults.children).filter(e => e.tagName === "A");
        let activeSearch = searchElements[selectedIndex];
        if(e.key === "Enter") {
            if(activeSearch) {
                activeSearch.click();
            } else {
                searchIcon.click();
            }
            return;
        }
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
        let search = await API.search.typeahead(query);
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
            userElement.innerHTML = `
                <img width="16" height="16" class="search-result-item-avatar" src="${`${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_normal.png`): user.profile_image_url_https}`}">
                <span class="search-result-item-name ${user.verified || user.id_str === '1123203847776763904' ? 'search-result-item-verified' : ''}">${user.name}</span>
                <span class="search-result-item-screen-name">@${user.screen_name}</span>
            `;
            searchResults.appendChild(userElement);
        });
    });
    searchIcon.addEventListener('click', () => {
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
                location.href = `/search?q=${encodeURIComponent(searchInput.value)}`;
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
        for(let timeout of userPreviewTimeouts) {
            clearTimeout(timeout);
        }
        userPreviewTimeouts = [];
        let el = e.target;
        if(el.closest('.user-preview')) {
            clearTimeout(leavePreviewTimeout);
            leavePreviewTimeout = null;
        }
        if(document.getElementsByClassName('user-preview').length > 0) return;
        el = el.closest('a');
        if(!el || !el.href) return;
        let url;
        try { url = new URL(el.href.split('?')[0].split('#')[0]) } catch(e) { return };
        if((!isProfilePath(url.pathname) && !url.pathname.startsWith('/i/user/')) || url.host !== 'twitter.com') return;
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

            let user = await API.user.get(id ? id : username, !!id);
            if(stopLoad) return;
            let div = document.createElement('div');
            div.innerHTML = /*html*/`
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
                    .nice-button {color: var(--almost-black);background-color: var(--darker-background-color);background-image: linear-gradient(var(--background-color),var(--darker-background-color));background-repeat: no-repeat;border: 1px solid var(--border);border-radius: 4px;color: var(--darker-gray);cursor: pointer;font-size: 14px;font-weight: bold;line-height: normal;padding: 8px 16px;}
                    .nice-button:hover:not([disabled]) {color: var(--almost-black);text-decoration: none;background-color: var(--border);background-image: linear-gradient(var(--background-color),var(--border));border-color: var(--border);}
                    .nice-button:disabled {color: lightgray !important;cursor: not-allowed;}
                    .nice-button:disabled:before {color: lightgray !important;}
                    .emoji {height: 16px;margin-left: 2px;margin-right: 2px;vertical-align: bottom;width: 16px;}
                    a {color: var(--link-color);text-decoration: none }
                    a:hover {text-decoration: underline;}
                    .profile-additional-thing{font-size:14px;color: var(--darker-gray);font-weight:400;line-height:20px;left: 10px;position: relative;display: block;overflow: hidden;}
                    .profile-additional-thing::before{margin-right:5px;vertical-align:sub;color:var(--light-gray);display:inline-block;width:20px;text-align:center;font: 18px 'RosettaIcons'}
                    .profile-additional-location::before{content:"\\f031"}
                    .profile-additional-joined::before{content:"\\f177"}
                    .profile-additional-birth::before{content:"\\f033"}
                    .profile-additional-professional::before{content:"\\f204"}
                    .profile-additional-url::before{content:"\\f098"}
                    .preview-user-additional-info{margin-top:10px}
                    ${roundAvatarsEnabled ? '.preview-user-avatar {border-radius: 50%!important;}' : ''}
                </style>
                <img class="preview-user-banner" height="100" width="300" src="${user.profile_banner_url ? user.profile_banner_url : 'https://abs.twimg.com/images/themes/theme1/bg.png'}">
                <div class="preview-user-data">
                    <a class="preview-user-avatar-link" href="https://twitter.com/${user.screen_name}">
                        <img class="preview-user-avatar" width="50" height="50" src="${`${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_normal.png`): user.profile_image_url_https}`.replace('_normal.', '_400x400.')}">
                    </a>
                    <br>
                    <a class="preview-user-info" href="https://twitter.com/${user.screen_name}">
                        <h1 class="preview-user-name">${escapeHTML(user.name)}</h1>
                        <h2 class="preview-user-handle">@${user.screen_name}</h2>
                        ${user.followed_by ? /*html*/`<span class="follows-you-label">${LOC.follows_you.message}</span>` : ''}
                    </a>
                    <button class="nice-button preview-user-follow ${user.following ? 'following' : 'follow'}">${user.following ? LOC.following_btn.message : LOC.follow.message}</button>
                    <span class="preview-user-description">${escapeHTML(user.description).replace(/\n/g, '<br>').replace(/((http|https):\/\/[\w?=.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`).replace(/(?<!\w)#([\w+]+\b)/g, `<a href="https://twitter.com/hashtag/$1">#$1</a>`)}</span>
                    <div class="preview-user-additional-info">
                        <span class="profile-additional-thing profile-additional-joined">${LOC.joined.message} ${new Date(user.created_at).toLocaleDateString(LANGUAGE.replace("_", "-"), {month: 'long', year: 'numeric', day: 'numeric'})}</span>
                    </div>
                    <br>
                    <div class="preview-user-stats">
                        <a class="user-stat-div" href="https://twitter.com/${user.screen_name}/following">
                            <h2>${LOC.following.message}</h2>
                            <h1 class="preview-user-following">${Number(user.friends_count).toLocaleString().replace(/\s/g, ',')}</h1>
                        </a>
                        <a class="user-stat-div" href="https://twitter.com/${user.screen_name}/followers">
                            <h2>${LOC.followers.message}</h2>
                            <h1 class="preview-user-followers">${Number(user.followers_count).toLocaleString().replace(/\s/g, ',')}</h1>
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
                if(!url.href.startsWith('https://twitter.com/')) url.target = "_blank";
                additionalInfoElement.prepend(url);
            }
            div.addEventListener('mouseleave', leaveFunction);
            let links = Array.from(div.querySelector('.preview-user-description').querySelectorAll('a'));
            links.forEach(link => {
                let realLink = user.entities.description.urls.find(u => u.url === link.href);
                if (realLink) {
                    link.href = realLink.expanded_url;
                    if(!link.href.startsWith('https://twitter.com/')) link.target = '_blank';
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
                    let wtfFollow = document.querySelector(`.wtf-user > .tweet-avatar-link[href="https://twitter.com/${user.screen_name}"]`);
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
                    let wtfFollow = document.querySelector(`.wtf-user > .tweet-avatar-link[href="https://twitter.com/${user.screen_name}"]`);
                    if(!wtfFollow) return;
                    wtfFollow = wtfFollow.parentElement.getElementsByClassName('discover-follow-btn')[0];
                    wtfFollow.classList.add('following');
                    wtfFollow.classList.remove('follow');
                    wtfFollow.innerText = LOC.following_btn.message;
                }
            });
            shadow.appendChild(div);

            if(isSticky(el)) {
                el.parentElement.append(userPreview);
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
            messageHeaderAvatar.src = `${(u.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_normal.png`): u.profile_image_url_https}`;
            messageHeaderLink.href = `https://twitter.com/${u.screen_name}`;
            setTimeout(() => {
                modal.querySelector(".message-new-input").focus();
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
    window.addEventListener("popstate", e => {
        if(document.querySelector('.message-leave')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            document.querySelector(".message-header-back").click();
        }
    });

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
    updateUnread();
    updateAccounts();
    updateInboxData();
    setInterval(updateAccounts, 60000*5);
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
    }, 1750);
    setTimeout(() => {
        let version = document.getElementById('oldtwitter-version');
        if(version) {
            fetch(`https://raw.githubusercontent.com/dimdenGD/OldTwitter/master/manifest.json?t=${Date.now()}`).then(res => res.json()).then(res => {
                version.innerText += ` (${LOC.last_version.message}: ${res.version})`;
                if(TRANSLATORS[LANGUAGE]) {
                    let translated_by = document.createElement('span');
                    if(typeof TRANSLATORS[LANGUAGE][0] === 'object') {
                        let as = [];
                        for(let translator of TRANSLATORS[LANGUAGE]) {
                            as.push(`<a${translator[1] ? ` target="_blank" href="${translator[1]}"` : ''}>${translator[0]}</a>`);
                        }
                        translated_by.innerHTML = ` ${LOC.translated_by.message.replace("$TRANSLATOR$", as.join(', '))}<br>`;
                    } else {
                        translated_by.innerHTML = ` ${LOC.translated_by.message.replace("$TRANSLATOR$", `<a${TRANSLATORS[LANGUAGE][1] ? ` target="_blank" href="${TRANSLATORS[LANGUAGE][1]}"` : ''}>${TRANSLATORS[LANGUAGE][0]}</a>`)}<br>`;
                    }
                    document.getElementById('about').children[0].append(translated_by);
                } else {
                    document.getElementById('about').children[0].append(document.createElement('br'));
                }
            });
        }
        let about = document.getElementById('about');
        if(about && !location.pathname.startsWith('/old/') && !location.pathname.startsWith('/i/timeline')) {
            let a = document.createElement('a');
            let hrefUrl = new URL(location.href);
            let searchParams = new URLSearchParams(hrefUrl.search);
            searchParams.set('newtwitter', 'true');
            hrefUrl.search = searchParams.toString();
            a.href = hrefUrl.toString();
            setInterval(() => {
                let hrefUrl = new URL(location.href);
                let searchParams = new URLSearchParams(hrefUrl.search);
                searchParams.set('newtwitter', 'true');
                hrefUrl.search = searchParams.toString();
                a.href = hrefUrl.toString();
            }, 500);
            a.innerText = `[${LOC.open_newtwitter.message}]`;
            a.addEventListener('click', e => {
                e.stopImmediatePropagation();
            });
            a.style.color = 'var(--light-gray)';
            about.appendChild(a);
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

    // custom css
    document.addEventListener('customCSS', updateCustomCSS);
    document.addEventListener('customCSSVariables', () => switchDarkMode(isDarkModeEnabled));
    document.addEventListener('roundAvatars', e => switchRoundAvatars(e.detail));

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
                if(e.target.className.includes('tweet tweet-id-')) {
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
                if(e.target.className.includes('tweet tweet-id-')) {
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
                // download media
                if(activeTweet.className.includes('tweet tweet-id-')) {
                    activeTweet.getElementsByClassName('tweet-interact-more-menu-download')[0].click();
                }
            }
        });
        let searchInput = document.getElementById('search-input');
        document.addEventListener('keydown', e => {
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
            if(e.target.id === 'new-tweet-text' && e.altKey) {
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
        style.innerHTML = `.tweet-interact::after { content: '' !important; }`;
        document.head.appendChild(style);
    }

    function fullscreenEvent(fullscreen) {
        if(fullscreen) {
            let style = document.createElement('style');
            style.innerHTML = `.tweet-media-element-quote { object-fit: contain !important; }`;
            style.id = 'fullscreen-style';
            document.head.appendChild(style);
        } else {
            let style = document.getElementById('fullscreen-style');
            if(style) style.remove();
        }
    }

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