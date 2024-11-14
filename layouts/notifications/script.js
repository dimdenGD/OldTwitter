let user = {};
let subpage;
let loadingMore = false;

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
    API.account.verifyCredentials().then(u => {
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
    document.getElementById('wtf-viewall').href = `/i/connect_people?newtwitter=true&user_id=${user.id_str}`;
}

let cursorTop = undefined;
let cursorBottom = undefined;

async function updateNotifications(options = { mode: 'rewrite', quiet: false }) {
    if(options.mode === 'rewrite' && !options.quiet) {
        document.getElementById('notifs-loading').hidden = false;
        document.getElementById('notifications-more').hidden = true;
    }
    let data;
    try {
        data = await API.notifications.get(options.mode === 'append' ? cursorBottom : options.mode === 'prepend' ? cursorTop : undefined, subpage === 'mentions');
    } catch(e) {
        await sleep(2500);
        try {
            data = await API.notifications.get(options.mode === 'append' ? cursorBottom : options.mode === 'prepend' ? cursorTop : undefined, subpage === 'mentions');
        } catch(e) {
            document.getElementById('notifs-loading').hidden = true;
            document.getElementById('notifications-more').hidden = false;
            document.getElementById('notifications-more').innerText = LOC.load_more.message;
            loadingMore = false;
            console.error(e);
            return;
        }
    }
    if(options.mode === 'append' || options.mode === 'rewrite') {
        cursorBottom = data.cursorBottom;
    }
    if(options.mode === 'prepend' || options.mode === 'rewrite') {
        if(data.cursorTop !== cursorTop) {
            setTimeout(() => {
                API.notifications.markAsRead(cursorTop);
                if(windowFocused) {
                    chrome.storage.local.remove(['unreadCount'], () => {});
                    if (data.unreadNotifications > 0) {
                        document.getElementById('site-icon').href = chrome.runtime.getURL(`images/logo32${vars.useNewIcon ? '_new' : ''}_notification.png`);
                        let newTitle = document.title;
                        if(document.title.startsWith('(')) {
                            newTitle = document.title.split(') ')[1];
                        }
                        newTitle = `(${data.unreadNotifications}) ${newTitle}`;
                        if(document.title !== newTitle) {
                            document.title = newTitle;
                        }
                    }
                    notificationBus.postMessage({type: 'markAsRead', cursor: cursorTop});
                }
            }, 500);
        }

        cursorTop = data.cursorTop;
    }

    let notificationsContainer = document.getElementById('notifications-div');

    if(options.mode === 'append' || options.mode === 'rewrite') {
        if(options.mode === 'rewrite') {
            notificationsContainer.innerHTML = '';
        }

        let notifs = data.list;
        for(let n of notifs) {
            if(n.type === 'notification') {
                let nd = renderNotification(n, { unread: n.unread });
                notificationsContainer.appendChild(nd);
            } else if(n.type === 'tweet') {
                let t = await appendTweet(n, notificationsContainer, { noInsert: true, ignoreSeen: true });
                if(t) {
                    if(n.unread) {
                        t.classList.add('notification-unread');
                    }
                    notificationsContainer.appendChild(t);
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
                let t = await appendTweet(n, notificationsContainer, { noInsert: true });
                t.classList.add('notification-unread');
                divs.push(t);
            }
        }

        notificationsContainer.prepend(...divs);
        if(vars.enableTwemoji) {
            for(let nd of divs) {
                twemoji.parse(nd);
            }
        }
    }

    document.getElementById('notifs-loading').hidden = true;
    document.getElementById('notifications-more').hidden = false;
    document.getElementById('notifications-more').innerText = LOC.load_more.message;
    loadingMore = false;
    document.getElementById('loading-box').hidden = true;
}

let windowFocused = document.hidden;

setTimeout(async () => {
    if(typeof vars === 'undefined') {
        await loadVars();
    }

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
    document.getElementById('notifs-loading').children[0].src = chrome.runtime.getURL(`images/loading.svg`);

    windowFocused = document.hidden;
    onVisibilityChange(vis => {
        windowFocused = vis;
        if(vis) {
            notificationBus.postMessage({type: 'markAsRead', cursor: undefined});
            document.getElementById('site-icon').href = chrome.runtime.getURL(`images/logo32${vars.useNewIcon ? '_new' : ''}.png`);
        }
    });

    // buttons
    document.getElementById('notifications-more').addEventListener('click', async () => {
        if(!cursorBottom) return;
        if(loadingMore) return;

        loadingMore = true;
        document.getElementById('notifications-more').innerText = LOC.loading.message;
        updateNotifications({
            mode: 'append',
            quiet: false
        });
    });
    document.getElementById('ns-m').addEventListener('click', async () => {
        cursorTop = undefined;
        cursorBottom = undefined;
        history.pushState({}, null, '/notifications/mentions');
        document.getElementById('notifs-loading').hidden = false;
        document.getElementById('notifications-more').hidden = true;
        document.getElementById('notifications-div').innerHTML = html``;
        updateSubpage();
        updateNotifications();
    });
    document.getElementById('ns-n').addEventListener('click', async () => {
        cursorTop = undefined;
        cursorBottom = undefined;
        history.pushState({}, null, '/notifications');
        document.getElementById('notifs-loading').hidden = false;
        document.getElementById('notifications-more').hidden = true;
        document.getElementById('notifications-div').innerHTML = html``;
        updateSubpage();
        updateNotifications();
    });
    window.addEventListener("popstate", async () => {
        updateSubpage();
        updateNotifications();
    });

    let search = new URLSearchParams(location.search);
    if(search.get('nonavbar') === '1') {
        document.getElementById('navbar').hidden = true;
        document.getElementById('navbar-line').hidden = true;
        document.getElementById('notification-switches').style.top = '5px';
        document.getElementById('notifications-div').style.marginTop = '16px';
        
        let root = document.querySelector(":root");
        let bg = root.style.getPropertyValue('--background-color');
        root.style.setProperty('--darker-background-color', bg);
    }

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

    await updateNotifications({ mode: 'rewrite', quiet: false });
    await updateNotifications({ mode: 'prepend', quiet: true });
    
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 5);
    setInterval(renderTrends, 60000 * 5);
    setInterval(() => {
        updateNotifications({
            mode: 'prepend',
            quiet: true
        });
    }, 20000);

    document.getElementById('loading-box').hidden = true;
}, 50);