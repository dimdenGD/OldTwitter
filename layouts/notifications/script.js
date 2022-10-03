let user = {};
let subpage;

// Util

function updateSubpage() {
    if(location.pathname.includes('notifications/mentions')) {
        subpage = 'mentions';
        document.getElementById('ns-m').classList.add('notification-switch-active');
        document.getElementById('ns-n').classList.remove('notification-switch-active');
    } else {
        subpage = 'notifications';
        document.getElementById('ns-n').classList.add('notification-switch-active');
        document.getElementById('ns-m').classList.remove('notification-switch-active');
    };
}

function updateUserData() {
    API.verifyCredentials().then(u => {
        user = u;
        const event = new CustomEvent('updateUserData', { detail: u });
        document.dispatchEvent(event);
        renderUserData();
    }).catch(e => {
        if (e === "Not logged in") {
            window.location.href = "https://mobile.twitter.com/login";
        }
        console.error(e);
    });
}
// Render
function renderUserData() {
    document.getElementById('wtf-viewall').href = `https://mobile.twitter.com/i/connect_people?user_id=${user.id_str}`;
}

let lastFirstCursor = undefined;
let lastCursor = undefined;
let aRegex = /<a[^>]*>([\s\S]*?)<\/a>/g;
async function renderNotifications(data, append = false) {
    let notificationsContainer = document.getElementById('notifications-div');
    let entries = data.timeline.instructions.find(i => i.addEntries).addEntries.entries;
    let cursor = entries[0].content.operation.cursor.value;
    if(lastFirstCursor === cursor) return;
    lastFirstCursor = cursor;
    if(!append) notificationsContainer.innerHTML = '';
    let unreadBefore = +data.timeline.instructions.find(i => i.markEntriesUnreadGreaterThanSortIndex).markEntriesUnreadGreaterThanSortIndex.sortIndex;
    let unreadNotifications = 0;
    for(let i in entries) {
        if(i === 0) continue;
        let e = entries[i];
        e = e.content.item;
        if(!e) continue;
        if(e.content.notification) {
            let n = data.globalObjects.notifications[e.content.notification.id];
            if(!n) continue;
            if(e.feedbackInfo) n.feedback = data.timeline.responseObjects.feedbackActions[e.feedbackInfo.feedbackKeys[0]];
            let notificationDiv = document.createElement('div');
            notificationDiv.className = 'notification';
            if(+entries[i].sortIndex > unreadBefore) {
                notificationDiv.classList.add('notification-unread');
                unreadNotifications++;
            }
            let replyTweet = n.template.aggregateUserActionsV1.targetObjects[0] ? data.globalObjects.tweets[n.template.aggregateUserActionsV1.targetObjects[0].tweet.id] : {full_text: ''};
            let replyUser = replyTweet ? data.globalObjects.users[replyTweet.user_id_str] : undefined;
            notificationDiv.addEventListener('click', e => {
                if(e.target == notificationDiv || e.target.className === 'notification-avatars' && replyUser) {
                    openInNewTab(`https://twitter.com/${replyUser.screen_name}/status/${replyTweet.id_str}` + (n.icon.id === 'heart_icon' ? '/likes' : n.icon.id === 'retweet_icon' ? '/retweets' : ''));
                }
            });
            let notificationHeader = n.message.text;
            if (n.message.entities) {
                let additionalLength = 0;
                let matches = 0;
                n.message.entities.forEach(e => {
                    if(!e.ref || !e.ref.user) return;
                    let user = data.globalObjects.users[e.ref.user.id];
                    notificationHeader = stringInsert(notificationHeader, additionalLength+e.toIndex, '</a>');
                    notificationHeader = stringInsert(notificationHeader, additionalLength+e.fromIndex, `<a href="/dimdenEFF">`);
                    additionalLength += `<a href="/dimdenEFF"></a>`.length;
                    let mi = 0;
                    let newText = notificationHeader.replace(aRegex, (_, m) => {
                        if(mi++ !== matches) return _;
                        return `<a href="/${user.screen_name}">${escapeHTML(m)}</a>`;
                    });
                    additionalLength += newText.length - notificationHeader.length;
                    notificationHeader = newText;
                    matches++;
                });
            };
            let users = n.template.aggregateUserActionsV1.fromUsers.map(u => data.globalObjects.users[u.user.id]);

            if(n.icon.id === 'recommendation_icon') {
                notificationHeader = `<b><a href="https://twitter.com/${users[0].screen_name}">${escapeHTML(notificationHeader)}</a></b>`;
            }
            
            let iconClasses = {
                'heart_icon': 'ni-favorite',
                'person_icon': 'ni-follow',
                'retweet_icon': 'ni-retweet',
                'recommendation_icon': 'ni-recommend',
                'lightning_bolt_icon': 'ni-bolt',
                'bird_icon': 'ni-twitter',
                'security_alert_icon': 'ni-alert',
                'bell_icon': 'ni-bell'
            };
            if(n.icon.id === 'heart_icon' && !vars.heartsNotStars) {
                notificationHeader = notificationHeader.replace(' liked ', ' favorited ');
            }
            notificationDiv.innerHTML = /*html*/`
                <div class="notification-icon ${iconClasses[n.icon.id]}"></div>
                <div class="notification-header">
                    ${notificationHeader}
                </div>
                ${n.feedback ? `<span class="notification-feedback">[${n.feedback.prompt}]</span>` : ''}
                <div class="notification-text">${escapeHTML(replyTweet.full_text.replace(/^(@[\w+]{1,15}\b\s)((@[\w+]{1,15}\b\s)+)/g, '$1'))}</div>
                <div class="notification-avatars">
                    ${users.map(u => `<a class="notification-avatar" href="/${u.screen_name}"><img src="${u.profile_image_url_https.replace("_normal", "_bigger")}" alt="${escapeHTML(u.name)}" width="32" height="32"></a>`).join('')}
                </div>
            `;
            if(n.feedback) {
                let feedbackBtn = notificationDiv.querySelector('.notification-feedback');
                feedbackBtn.addEventListener('click', () => {
                    fetch(n.feedback.feedbackUrl, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "x-twitter-client-language": "en",
                            "x-twitter-active-user": "yes"
                        },
                        method: 'post',
                        credentials: 'include'
                    }).then(i => i.text()).then(i => {
                        notificationDiv.remove();
                        alert(n.feedback.confirmation);
                    });
                });
            }
            notificationsContainer.append(notificationDiv);
            if(vars.enableTwemoji) twemoji.parse(notificationDiv);
        } else if(e.content.tweet) {
            let t = data.globalObjects.tweets[e.content.tweet.id];
            t.user = data.globalObjects.users[t.user_id_str];
            if(!t) continue;
            let tweet = await appendTweet(t, notificationsContainer);
            if(+entries[i].sortIndex > unreadBefore) {
                tweet.classList.add('notification-unread');
                unreadNotifications++;
            }
        }
    }
    if(unreadNotifications > 0) {
        setTimeout(() => {
            API.markAsReadNotifications(cursor);
            notificationBus.postMessage({type: 'markAsRead', cursor});
        }, 1000);
    }
}
let lastData;
async function updateNotifications(append = false) {
    let data = await API.getNotifications(append ? lastCursor : undefined, subpage === 'mentions');
    if(append || !lastCursor) {
        let entries = data.timeline.instructions.find(i => i.addEntries).addEntries.entries;
        lastCursor = entries[entries.length-1].content.operation.cursor.value;
    }
    if(!append && lastData) {
        let lastCursorTop = lastData.timeline.instructions.find(i => i.addEntries).addEntries.entries[0].entryId;
        let cursorTop = data.timeline.instructions.find(i => i.addEntries).addEntries.entries[0].entryId;
        if(lastCursorTop === cursorTop) {
            return;
        }
    }
    lastData = data;
    await renderNotifications(data, append);
    document.getElementById('loading-box').hidden = true;
}

setTimeout(async () => {
    if(!vars) {
        await loadVars();
    }
    if(!document.getElementById('wtf-refresh')) {
        // weird bug
        location.reload();
    }
    document.getElementById('wtf-refresh').addEventListener('click', async () => {
        renderDiscovery(false);
    });
    document.getElementById('notifications-more').addEventListener('click', async () => {
        if(!lastCursor) return;
        updateNotifications(true);
    });
    document.getElementById('ns-m').addEventListener('click', async () => {
        lastCursor = undefined;
        history.pushState({}, null, '/notifications/mentions');
        updateSubpage();
        updateNotifications();
    });
    document.getElementById('ns-n').addEventListener('click', async () => {
        lastCursor = undefined;
        history.pushState({}, null, '/notifications');
        updateSubpage();
        updateNotifications();
    });
    window.addEventListener("popstate", async () => {
        lastCursor = undefined;
        updateSubpage();
        updateNotifications();
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
    document.addEventListener('userRequest', () => {
        if(!user) return;
        let event = new CustomEvent('updateUserData', { detail: user });
        document.dispatchEvent(event);
    })

    // Run
    updateSubpage();
    updateUserData();
    renderDiscovery();
    renderTrends();
    updateNotifications();
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 5);
    setInterval(renderTrends, 60000 * 5);
    setInterval(updateNotifications, 20000);
}, 250);