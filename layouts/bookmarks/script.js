let user = {};
let bookmarkCursor = null;
let end = false;
let linkColors = {};
let activeTweet;

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
    document.getElementById('user-avatar').src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_normal.png`): user.profile_image_url_https}`.replace('_normal.', '_400x400.');
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

async function renderBookmarks(cursor) {
    let bookmarks;
    let bookmarksContainer = document.getElementById('timeline');
    try {
        bookmarks = await API.bookmarks.get(cursor);
    } catch(e) {
        console.error(e);
        bookmarksContainer.innerHTML = `<div style="color:var(--light-gray)">${e}</div>`;
        document.getElementById('loading-box').hidden = true;
        return;
    }
    
    if (bookmarks.cursor) {
        bookmarkCursor = bookmarks.cursor;
    } else {
        end = true;
    }
    bookmarks = bookmarks.list;
    if(bookmarks.length === 0 && !cursor) {
        bookmarksContainer.innerHTML = `<div style="color:var(--light-gray)">${LOC.empty.message}</div>`;
        document.getElementById('delete-all').hidden = true;
        return;
    }
    if(bookmarks.length === 0 && cursor) {
        end = true;
        return;
    }
    for (let i = 0; i < bookmarks.length; i++) {
        let b = bookmarks[i];
        await appendTweet(b, bookmarksContainer, {
            bigFont: b.full_text && b.full_text.length < 75
        });
    }
    document.getElementById('loading-box').hidden = true;

}
let lastScroll = Date.now();
let loadingNewTweets = false;
let lastTweetDate = 0;

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
            await renderBookmarks(bookmarkCursor);
            setTimeout(() => {
                loadingNewTweets = false;
            }, 250);
        }
    }, { passive: true });
    document.getElementById('delete-all').addEventListener('click', async () => {
        let modal = createModal(`
            <p style="color:var(--almost-black);margin-top:0">${LOC.delete_bookmarks.message}</p>
            <button class="nice-button" id="delete-all-confirm">${LOC.delete_all.message}</button>
        `);
        modal.getElementsByClassName('nice-button')[0].addEventListener('click', () => {
            API.bookmarks.deleteAll().then(() => {
                document.getElementById('timeline').innerHTML = `<div style="color:var(--light-gray)">${LOC.empty.message}</div>`;
                document.getElementById('delete-all').hidden = true;
                modal.remove();
            });
        });
    });

    
    // Run
    updateUserData();
    renderDiscovery();
    renderTrends();
    renderBookmarks();
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 15);
    setInterval(renderTrends, 60000 * 5);
}, 50);