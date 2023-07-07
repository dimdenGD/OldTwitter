let user = {};
let cursor;
let linkColors = {};
let listId = location.pathname.split('/')[3];
let subpage;
// Util

function updateSubpage() {
    Array.from(document.getElementsByClassName('list-switch')).forEach(el => el.classList.remove('list-switch-active'));
    document.getElementById('list-members-container').hidden = true;
    document.getElementById('list-tweets-container').hidden = true;
    document.getElementById('list-followers-container').hidden = true;
    end = false;
    cursor = undefined;

    if(location.href.endsWith('/members')) {
        subpage = 'members';
        document.getElementById('list-members-container').hidden = false;
        document.getElementById('list-members').innerHTML = '';
        document.getElementById('ns-members').classList.add('list-switch-active');
    } else if(location.href.endsWith('/followers')) {
        subpage = 'followers';
        document.getElementById('list-followers-container').hidden = false;
        document.getElementById('list-followers').innerHTML = '';
        document.getElementById('ns-followers').classList.add('list-switch-active');
    } else {
        subpage = 'tweets';
        document.getElementById('list-tweets-container').hidden = false;
        document.getElementById('list-tweets').innerHTML = '';
        document.getElementById('ns-tweets').classList.add('list-switch-active');
    }
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

function renderListData(data) {
    if(data.custom_banner_media) {
        document.getElementById('list-banner').src = data.custom_banner_media.media_info.original_img_url;
    } else {
        document.getElementById('list-banner').src = data.default_banner_media.media_info.original_img_url;
    }

    document.getElementsByTagName('title')[0].innerText = `${data.name} List - OldTwitter`;
    document.getElementById('list-name').innerText = data.name;
    document.getElementById('list-name').classList.toggle('user-protected', data.mode === 'Private');
    document.getElementById('list-description').innerText = data.description;
    document.getElementById('list-members-count').innerText = data.member_count;
    document.getElementById('list-followers-count').innerText = data.subscriber_count;
    if(data.user_results && data.user_results.result) {
        document.getElementById('list-user').href = `https://twitter.com/${data.user_results.result.legacy.screen_name}/lists`;
        document.getElementById('list-avatar').src = data.user_results.result.legacy.profile_image_url_https.replace('_normal', '_bigger');
        let actions = document.getElementById('list-actions');
        actions.innerHTML = ``;
        if(data.user_results.result.rest_id === user.id_str) {
            actions.innerHTML = `
                <button class="nice-button" id="list-btn-edit">${LOC.edit.message}</button>
                <button class="nice-button" id="list-btn-delete">${LOC.delete.message}</button>
            `;
            document.getElementById('list-btn-edit').addEventListener('click', () => {
                let modal = createModal(`
                    <div id="list-editor">
                        <h1 class="cool-header">${LOC.edit_list.message}</h1><br>
                        <span id="list-editor-error" style="color:red"></span><br>
                        ${LOC.name.message}:<br><input maxlength="25" type="text" id="list-name-input" value="${escapeHTML(data.name)}"><br><br>
                        ${LOC.description.message}:<br><textarea maxlength="100" type="text" id="list-description-input">${escapeHTML(data.description)}</textarea><br>
                        <br>
                        ${LOC.is_private.message}: <input type="checkbox" style="width: 15px;" id="list-private-input" ${data.mode === 'Private' ? 'checked' : ''}><br>
                        <br>
                        <button class="nice-button" id="list-btn-save">${LOC.save.message}</button> 
                        <button class="nice-button" id="list-btn-members">${LOC.edit_members.message}</button>
                    </div>
                    <div id="list-editor-members" hidden>
                        <h1 class="cool-header">${LOC.edit_members.message}</h1>
                        <span id='list-editor-members-back'>${LOC.back.message}</span>
                        <br>
                        <div id="list-editor-members-container"></div>
                        <div class="box" style="border-bottom:none"></div>
                        <div id="list-editor-members-more" class="center-text" style="padding-left: 90px;">${LOC.load_more.message}</div>
                    </div>
                `, 'list-editor-modal');
                document.getElementById('list-btn-save').addEventListener('click', async () => {
                    document.getElementById('list-editor-error').innerText = '';
                    let name = document.getElementById('list-name-input').value;
                    let description = document.getElementById('list-description-input').value;
                    let isPrivate = document.getElementById('list-private-input').checked;
                    try {
                        await API.updateList(data.id_str, name, description, isPrivate);
                        document.getElementById('list-name').classList.toggle('user-protected', isPrivate);
                    } catch(e) {
                        return document.getElementById('list-editor-error').innerText = e && e.message ? e.message : e;
                    }
                    modal.remove();
                    renderListData(await API.getList(data.id_str));
                });
                let membersCursor;
                let membersContainer = document.getElementById('list-editor-members-container');
                async function getMembers() {
                    let listMembers = await API.getListMembers(data.id_str, membersCursor);
                    membersCursor = listMembers.cursor;
                    listMembers = listMembers.list;
                    if(!cursor || listMembers.length === 0) document.getElementById('list-editor-members-more').hidden = true;
                    for(let i in listMembers) {
                        let t = listMembers[i];
                        let followingElement = document.createElement('div');
                        followingElement.classList.add('following-item');
                        followingElement.innerHTML = `
                        <div style="height:48px">
                            <a href="https://twitter.com/${t.screen_name}" class="following-item-link">
                                <img src="${t.profile_image_url_https}" alt="${t.screen_name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                                <div class="following-item-text">
                                    <span class="tweet-header-name following-item-name">${escapeHTML(t.name)}</span><br>
                                    <span class="tweet-header-handle">@${t.screen_name}</span>
                                    ${t.followed_by ? `<span class="follows-you-label">${LOC.follows_you.message}</span>` : ''}
                                </div>
                            </a>
                        </div>
                        <div>
                            <button class="following-item-btn nice-button">${LOC.remove.message}</button>
                        </div>`;

                        let removeButton = followingElement.querySelector('.following-item-btn');
                        removeButton.addEventListener('click', async () => {
                            await API.listRemoveMember(listId, t.id_str);
                            document.getElementById('list-members-count').innerText = parseInt(document.getElementById('list-members-count').innerText) - 1;
                            followingElement.remove();
                        });

                        membersContainer.appendChild(followingElement);
                        if(vars.enableTwemoji) twemoji.parse(followingElement);
                    }
                }
                document.getElementById('list-btn-members').addEventListener('click', async () => {
                    document.getElementById('list-editor').hidden = true;
                    document.getElementById('list-editor-members').hidden = false;
                    getMembers();
                });
                document.getElementById('list-editor-members-more').addEventListener('click', getMembers);
                document.getElementById('list-editor-members-back').addEventListener('click', () => {
                    document.getElementById('list-editor').hidden = false;
                    document.getElementById('list-editor-members').hidden = true;
                });
            });
            document.getElementById('list-btn-delete').addEventListener('click', async () => {
                let modal = createModal(`
                    <h1 class="cool-header">${LOC.delete_list.message}</h1><br>
                    <span>${LOC.delete_list_sure.message}</span>
                    <br><br>
                    <button class="nice-button" id="list-btn-delete-confirm">${LOC.delete.message}</button>
                `, 'list-editor-modal');
                document.getElementById('list-btn-delete-confirm').addEventListener('click', async () => {
                    await API.deleteList(data.id_str);
                    modal.remove();
                    window.location.href = `https://twitter.com/${user.screen_name}/lists`;
                });
            });
        } else {
            actions.innerHTML = `<button class="nice-button" id="list-btn-subscribe">${data.following ? LOC.unsubscribe.message : LOC.subscribe.message}</button>`;
            document.getElementById('list-btn-subscribe').addEventListener('click', async () => {
                if(data.following) {
                    await API.unsubscribeList(data.id_str);
                    document.getElementById('list-followers-count').innerText = +document.getElementById('list-followers-count').innerText - 1;
                    data.following = false;
                    document.getElementById('list-btn-subscribe').innerText = LOC.subscribe.message;
                } else {
                    await API.subscribeList(data.id_str);
                    document.getElementById('list-followers-count').innerText = +document.getElementById('list-followers-count').innerText + 1;
                    data.following = true;
                    document.getElementById('list-btn-subscribe').innerText = LOC.unsubscribe.message;
                }
            });
        }
    }
}
async function renderListTweets(c) {
    let [listInfo, listTweets] = await Promise.allSettled([
        API.getList(listId),
        API.getListTweets(listId, c)
    ]).catch(e => {
        console.error(e);
    });
    if(listTweets.reason) {
        console.error(listTweets.reason);
        document.getElementById('loading-box').hidden = false;
        document.getElementById('loading-box-error').innerHTML = `${LOC.list_not_found.message}<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
        return false;
    }
    listInfo = listInfo.value;
    listTweets = listTweets.value;
    cursor = listTweets.cursor;
    listTweets = listTweets.list;
    if(!cursor || listTweets.length === 0) end = true;
    renderListData(listInfo);
    let container = document.getElementById('list-tweets');
    for(let i in listTweets) {
        let t = listTweets[i];
        if(t.retweeted_status) {
            await appendTweet(t.retweeted_status, container, {
                top: {
                    text: `<a href="https://twitter.com/${t.user.screen_name}">${escapeHTML(t.user.name)}</a> ${LOC.retweeted.message}`,
                    icon: "\uf006",
                    color: "#77b255",
                    class: 'retweet-label'
                },
                translate: vars.autotranslateProfiles.includes(t.user.id_str)
            });
        } else {
            await appendTweet(t, container, {
                bigFont: t.full_text.length < 75,
                translate: vars.autotranslateProfiles.includes(t.user.id_str)
            });
        }
    }
    return true;
}
async function renderListMembers(c) {
    let [listInfo, listMembers] = await Promise.allSettled([
        API.getList(listId),
        API.getListMembers(listId, c)
    ]).catch(e => {
        console.error(e);
    });
    if(listMembers.reason) {
        console.error(listTweets.reason);
        document.getElementById('loading-box').hidden = false;
        document.getElementById('loading-box-error').innerHTML = `${LOC.list_not_found.message}<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
        return false;
    }
    listInfo = listInfo.value;
    listMembers = listMembers.value;
    cursor = listMembers.cursor;
    listMembers = listMembers.list;
    if(!cursor || listMembers.length === 0) end = true;
    renderListData(listInfo);
    let container = document.getElementById('list-members');
    for(let i in listMembers) {
        let t = listMembers[i];
        appendUser(t, container);
    }
    return true;
}
async function renderListFollowers(c) {
    let [listInfo, listFollowers] = await Promise.allSettled([
        API.getList(listId),
        API.getListFollowers(listId, c)
    ]).catch(e => {
        console.error(e);
    });
    if(listFollowers.reason) {
        console.error(listTweets.reason);
        document.getElementById('loading-box').hidden = false;
        document.getElementById('loading-box-error').innerHTML = `${LOC.list_not_found.message}<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
        return false;
    }
    listInfo = listInfo.value;
    listFollowers = listFollowers.value;
    cursor = listFollowers.cursor;
    listFollowers = listFollowers.list;
    if(!cursor || listFollowers.length === 0) end = true;
    renderListData(listInfo);
    let container = document.getElementById('list-followers');
    for(let i in listFollowers) {
        let t = listFollowers[i];
        let followingElement = document.createElement('div');
        followingElement.classList.add('user-item');
        followingElement.innerHTML = `
        <div style="height:48px">
            <a href="https://twitter.com/${t.screen_name}" class="user-item-link">
                <img src="${t.profile_image_url_https}" alt="${t.screen_name}" class="user-item-avatar tweet-avatar" width="48" height="48">
                <div class="user-item-text">
                    <span class="tweet-header-name user-item-name">${escapeHTML(t.name)}</span><br>
                    <span class="tweet-header-handle">@${t.screen_name}</span>
                </div>
            </a>
        </div>
        <div>
            <button class="user-item-btn nice-button ${t.following ? 'following' : 'follow'}">${t.following ? LOC.following.message: LOC.follow.message}</button>
        </div>`;

        let followButton = followingElement.querySelector('.user-item-btn');
        followButton.addEventListener('click', async () => {
            if (followButton.classList.contains('following')) {
                await API.unfollowUser(t.screen_name);
                followButton.classList.remove('following');
                followButton.classList.add('follow');
                followButton.innerText = LOC.follow.message;
            } else {
                await API.followUser(t.screen_name);
                followButton.classList.remove('follow');
                followButton.classList.add('following');
                followButton.innerText = LOC.following.message;
            }
        });

        container.appendChild(followingElement);
    }
    return true;
}

async function renderList() {
    if(subpage === 'tweets') {
        if(!await renderListTweets(cursor)) return;
    } else if(subpage === 'members') {
        if(!await renderListMembers(cursor)) return;
    } else if(subpage === 'followers') {
        if(!await renderListFollowers(cursor)) return;
    }
    document.getElementById('loading-box').hidden = true;
    return true;
}

let lastTweetDate = 0;
let activeTweet;
let loadingNewTweets = false;
let end = false;

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
    window.addEventListener("popstate", async () => {
        cursor = undefined;
        updateSubpage();
        renderList();
    });
    document.addEventListener('scroll', async () => {
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
            await renderList();
            setTimeout(() => {
                loadingNewTweets = false;
            }, 250);
        }
    });
    
    // tweet hotkeys
    if(!vars.disableHotkeys) {
        let tle = document.getElementById('list-tweets');
        document.addEventListener('keydown', async e => {
            if(e.ctrlKey || keysHeld['KeyG']) return;
            // reply box
            if(e.target.className === 'tweet-reply-text') {
                if(e.altKey) {
                    if(e.keyCode === 82) { // ALT+R
                        // hide reply box
                        e.target.blur();
                        let tweetReply = activeTweet.getElementsByClassName('tweet-reply')[0];
                        tweetReply.hidden = true;
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
                        let tweetReply = activeTweet.getElementsByClassName('tweet-quote')[0];
                        tweetReply.hidden = true;
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
            } else if(e.keyCode === 84) { // T
                // retweet
                if(!activeTweet) return;
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
                if(!activeTweet) return;
                e.preventDefault();
                e.stopImmediatePropagation();
                activeTweet.click();
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
    }
    document.addEventListener('clearActiveTweet', () => {
        if(activeTweet) {
            activeTweet.classList.remove('tweet-active');
        }
        activeTweet = undefined;
    });
    document.addEventListener('findActiveTweet', () => {
        let tweets = Array.from(document.getElementsByClassName('tweet'));
        if(activeTweet) {
            activeTweet.classList.remove('tweet-active');
        }
        let scrollPoint = scrollY + innerHeight/2;
        activeTweet = tweets.find(t => scrollPoint > t.offsetTop && scrollPoint < t.offsetTop + t.offsetHeight);
        if(activeTweet) {
            activeTweet.classList.add('tweet-active');
        }
    });

    document.getElementById('list-members-div').addEventListener('click', () => {
        document.getElementById('ns-members').click();
    });
    document.getElementById('list-followers-div').addEventListener('click', () => {
        document.getElementById('ns-followers').click();
    });

    let listSwitches = Array.from(document.getElementsByClassName('list-switch'));
    listSwitches.forEach(s => {
        s.addEventListener('click', async () => {
            let id = s.id.split('-')[1];
            switch(id) {
                case 'tweets': history.pushState({}, null, `/i/lists/${listId}`); break;
                case 'members': history.pushState({}, null, `/i/lists/${listId}/members`); break;
                case 'followers': history.pushState({}, null, `/i/lists/${listId}/followers`); break;
            }
            // document.getElementById('loading-box').hidden = false;
            updateSubpage();
            cursor = undefined;
            renderList();
        });
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
    renderList();
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 5);
}, 50);