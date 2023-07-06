let user = {};
let subpage;

// Util

function updateSubpage() {
    lastData = undefined;
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
    document.getElementById('wtf-viewall').href = `https://twitter.com/i/connect_people?newtwitter=true&user_id=${user.id_str}`;
}

let lastFirstCursor = undefined;
let lastCursor = undefined;
let aRegex = /<a[^>]*>([\s\S]*?)<\/a>/g;
let firstRender = true;
async function renderNotifications(data, append = false) {
    let notificationsContainer = document.getElementById('notifications-div');
    let entries = data.timeline.instructions.find(i => i.addEntries).addEntries.entries;
    let cursor = entries[0].content.operation.cursor.value;
    if(lastFirstCursor === cursor) return;
    lastFirstCursor = cursor;
    if(!append) notificationsContainer.innerHTML = '';
    let unreadBefore = +data.timeline.instructions.find(i => i.markEntriesUnreadGreaterThanSortIndex).markEntriesUnreadGreaterThanSortIndex.sortIndex;
    let unreadNotifications = 0;
    let errorMsg = undefined;
    for(let i in entries) {
        if(i === 0) continue;
        let e = entries[i];
        e = e.content.item;
        if(!e) continue;
        try {
            if(e.content.notification) {
                let n = data.globalObjects.notifications[e.content.notification.id];
                if(!n) continue;
                if(e.feedbackInfo) {
                    n.feedback = data.timeline.responseObjects.feedbackActions[e.feedbackInfo.feedbackKeys[0]];
                    if(n.feedback) n.feedback.metadata = e.feedbackInfo.feedbackMetadata;
                }
                let notificationDiv = document.createElement('div');
                notificationDiv.className = 'notification';
                if(+entries[i].sortIndex > unreadBefore) {
                    notificationDiv.classList.add('notification-unread');
                    unreadNotifications++;
                }
                let replyTweet = n.template.aggregateUserActionsV1.targetObjects[0] ? data.globalObjects.tweets[n.template.aggregateUserActionsV1.targetObjects[0].tweet.id] : { full_text: '' };
                if(replyTweet && replyTweet.user_id_str) {;
                    if(replyTweet.quoted_status_id_str) {
                        replyTweet.quoted_status = data.globalObjects.tweets[replyTweet.quoted_status_id_str];
                        replyTweet.quoted_status.user = data.globalObjects.users[replyTweet.quoted_status.user_id_str];
                        replyTweet.quoted_status.user.id_str = replyTweet.quoted_status.user_id_str;
                    }
                    if(replyTweet.retweeted_status_id_str) {
                        replyTweet.retweeted_status = data.globalObjects.tweets[replyTweet.retweeted_status_id_str];
                        replyTweet.retweeted_status.user = data.globalObjects.users[replyTweet.retweeted_status.user_id_str];
                        replyTweet.retweeted_status.user.id_str = replyTweet.retweeted_status.user_id_str;
                    }
                    let replyUser = replyTweet ? data.globalObjects.users[replyTweet.user_id_str] : undefined;
                    replyUser.id_str = replyTweet.user_id_str;
                    replyTweet.user = replyUser;
                }
                let E = e;
                notificationDiv.addEventListener('click', e => {
                    if(e.target.closest('.notification') && e.target.tagName !== 'IMG' && e.target.tagName !== 'A' && e.target.className !== 'notification-feedback') {
                        if(n.icon.id === "bell_icon") {
                            location.href = `https://twitter.com/i/timeline?page=device_follow&nid=${n.id}`;
                        } else if(n.icon.id === "heart_icon") {
                            if(notificationHeader.includes('Tweets')) {
                                location.href = `https://twitter.com/i/timeline?page=likes&nid=${n.id}`;
                            } else {
                                new TweetViewer(user, replyTweet.retweeted_status ? replyTweet.retweeted_status : replyTweet);
                            }
                        } else if(n.icon.id === "list_icon") {
                            location.href = E.content.notification.url.url;
                        } else if(replyTweet && replyTweet.user) {
                            new TweetViewer(user, replyTweet.retweeted_status ? replyTweet.retweeted_status : replyTweet);
                        }
                    }
                });
                notificationDiv.addEventListener('mousedown', e => {
                    if(e.target.tagName === 'A' || e.target.className === 'notification-avatar-img') {
                        let url = new URL(e.target.href);
                        if(isProfilePath(url.pathname)) {
                            return;
                        }
                    };
                    if(e.button === 1) {
                        e.preventDefault();
                        if(n.icon.id === "bell_icon") {
                            openInNewTab(`https://twitter.com/i/timeline?page=device_follow&nid=${n.id}`);
                        } else if(n.icon.id === "heart_icon") {
                            openInNewTab(`https://twitter.com/i/timeline?page=likes&nid=${n.id}`);
                        } else if(n.icon.id === "list_icon") {
                            openInNewTab(E.content.notification.url.url);
                        } else if(e.target.closest('.notification') && e.target.tagName !== 'IMG') {
                            if(replyTweet.retweeted_status) {
                                openInNewTab(`https://twitter.com/${replyTweet.retweeted_status.user.screen_name}/status/${replyTweet.retweeted_status.id_str}`);
                            } else {
                                openInNewTab(`https://twitter.com/${replyTweet.user.screen_name}/status/${replyTweet.id_str}`);
                            }
                        }
                    }
                });
                let notificationHeader = n.message.text;
                if (n.message.entities) {
                    let additionalLength = 0;
                    let matches = 0;
                    n.message.entities.forEach(e => {
                        if(!e.ref || !e.ref.user) return;
                        let user = data.globalObjects.users[e.ref.user.id];
                        let emojiHelpers = matchEmojiHelperCount(notificationHeader);
                        notificationHeader = stringInsert(notificationHeader, additionalLength+e.toIndex+emojiHelpers, '</a>');
                        notificationHeader = stringInsert(notificationHeader, additionalLength+e.fromIndex, `<a href="/dimdenEFF">`);
                        additionalLength += `<a href="/dimdenEFF"></a>`.length;
                        let mi = 0;
                        let newText = notificationHeader.replace(aRegex, (_, m) => {
                            if(mi++ !== matches) return _;
                            return `<a href="/${user.screen_name}"${user.verified ? 'class="user-verified"' : ''}>${escapeHTML(m)}</a>`;
                        });
                        additionalLength += newText.length - notificationHeader.length + emojiHelpers;
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
                    'bell_icon': 'ni-bell',
                    'list_icon': 'ni-list'
                };
                if(!iconClasses[n.icon.id]) {
                    console.log(`Unsupported icon: "${n.icon.id}". Report it to https://github.com/dimdenGD/OldTwitter/issues`);
                }
                if(n.icon.id === 'heart_icon' && !vars.heartsNotStars) {
                    notificationHeader = notificationHeader.replace(' liked ', ' favorited ');
                }
                notificationDiv.innerHTML = /*html*/`
                    <div class="notification-icon ${iconClasses[n.icon.id]}"></div>
                    <div class="notification-header">
                        ${notificationHeader} ${n.feedback ? `<span class="notification-feedback">[${n.feedback.prompt}]</span>` : ''}
                    </div>
                    <div class="notification-text">${escapeHTML(replyTweet.full_text.replace(/^(@[\w+]{1,15}\b\s)((@[\w+]{1,15}\b\s)+)/g, '$1'))}</div>
                    <div class="notification-avatars">
                        ${users.map(u => `<a class="notification-avatar" href="/${u.screen_name}"><img class="notification-avatar-img" src="${u.profile_image_url_https.replace("_normal", "_bigger")}" alt="${escapeHTML(u.name)}" width="32" height="32"></a>`).join('')}
                    </div>
                `;
                let notifText = notificationDiv.querySelector('.notification-text');
                if(replyTweet.entities && replyTweet.entities.urls) {
                    for(let url of replyTweet.entities.urls) {
                        notifText.innerText = notifText.innerText.replace(new RegExp(url.url, "g"), url.display_url);
                    }
                }
                notificationDiv.dataset.notificationId = n.id;
                if(n.feedback) {
                    let feedbackBtn = notificationDiv.querySelector('.notification-feedback');
                    feedbackBtn.addEventListener('click', () => {
                        fetch('/i/api/2/notifications/feedback.json?' + n.feedback.feedbackUrl.split('?').slice(1).join('?'), {
                            headers: {
                                "authorization": OLDTWITTER_CONFIG.public_token,
                                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                                "content-type": "application/x-www-form-urlencoded",
                                "x-twitter-auth-type": "OAuth2Session",
                                "x-twitter-client-language": LANGUAGE || navigator.language,
                                "x-twitter-active-user": "yes"
                            },
                            method: 'post',
                            credentials: 'include',
                            body: `feedback_type=${n.feedback.feedbackType}&feedback_metadata=${n.feedback.metadata}&undo=false`
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
                if(t.quoted_status_id_str) {
                    t.quoted_status = data.globalObjects.tweets[t.quoted_status_id_str];
                    t.quoted_status.user = data.globalObjects.users[t.quoted_status.user_id_str];
                }
                if(!t) continue;
                let tweet = await appendTweet(t, notificationsContainer, {
                    bigFont: t.full_text.length < 75
                });
                if(+entries[i].sortIndex > unreadBefore) {
                    tweet.classList.add('notification-unread');
                    unreadNotifications++;
                }
            }
        } catch(e) {
            errorMsg = e;
            console.error(e);
        }
    }
    if(errorMsg) {
        createModal(`
            <div style="max-width:700px">
                <span style="font-size:14px;color:var(--default-text-color)">
                    <h2 style="margin-top: 0">${LOC.something_went_wrong.message}</h2>
                    ${LOC.notifications_error.message}<br>
                    ${LOC.error_instructions.message.replace('$AT1$', "<a target='_blank' href='https://github.com/dimdenGD/OldTwitter/issues'>").replace(/\$AT2\$/g, '</a>').replace("$AT3$", "<a target='_blank' href='mailto:admin@dimden.dev'>")}
                </span>
                <div class="box" style="font-family:monospace;line-break: anywhere;padding:5px;margin-top:5px;background:rgba(255, 0, 0, 0.2)">
                    ${escapeHTML(errorMsg.stack ? errorMsg.stack : String(errorMsg))} (OldTwitter v${chrome.runtime.getManifest().version})
                </div>
            </div>
        `)
    }
    if(unreadNotifications > 0) {
        setTimeout(() => {
            API.markAsReadNotifications(cursor);
            if(windowFocused) {
                firstRender = false;
                document.getElementById('site-icon').href = chrome.runtime.getURL(`images/logo32_notification.png`);
                let newTitle = document.title;
                if(document.title.startsWith('(')) {
                    newTitle = document.title.split(') ')[1];
                }
                newTitle = `(${unreadNotifications}) ${newTitle}`;
                if(document.title !== newTitle) {
                    document.title = newTitle;
                }
                notificationBus.postMessage({type: 'markAsRead', cursor});
            }
        }, 500);
    }
}
let lastData;
async function updateNotifications(append = false) {
    let data;

    try {
        data = await API.getNotifications(append ? lastCursor : undefined, subpage === 'mentions');
    } catch(e) {
        await sleep(2500);
        try {
            data = await API.getNotifications(append ? lastCursor : undefined, subpage === 'mentions');
        } catch(e) {
            console.error(e);
            return;
        }
    }
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

let windowFocused = document.hidden;

setTimeout(async () => {
    if(!vars) {
        await loadVars();
    }

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

    windowFocused = document.hidden;
    onVisibilityChange(vis => {
        windowFocused = vis;
        if(vis) {
            notificationBus.postMessage({type: 'markAsRead', cursor: undefined});
            document.getElementById('site-icon').href = chrome.runtime.getURL(`images/logo32.png`);
        }
    });

    // buttons
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

    // Run
    updateSubpage();
    updateUserData();
    renderDiscovery();
    renderTrends();
    updateNotifications();
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 5);
    setInterval(renderTrends, 60000 * 5);
    setInterval(() => {
        let modal = document.querySelector('.modal');
        if(!modal) {
            if(document.querySelector('.tweet-reply:not([hidden])') || document.querySelector('.tweet-quote:not([hidden])')) {
                return;
            }
        }
        updateNotifications();
    }, 20000);
}, 50);