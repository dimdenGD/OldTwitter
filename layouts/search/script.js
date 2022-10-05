let user = {};
let cursor;
let linkColors = {};
let searchParams = {}, searchSettings = {};
let saved;

// Util

function updateSubpage() {
    let params = Object.fromEntries(new URLSearchParams(location.search + location.hash));
    searchParams = params || {};
    searchSettings = {};
    linkColors = {};
    let activeParams = Array.from(document.getElementsByClassName('search-switch-active'));
    activeParams.forEach(a => a.classList.remove('search-switch-active'));
    if(params.f === 'live') {
        document.getElementById('ns-live').classList.add('search-switch-active');
        searchSettings.type = 'live';
    } else if(params.f === 'user') {
        document.getElementById('ns-people').classList.add('search-switch-active');
        searchSettings.type = 'user';
    } else if(params.f === 'image') {
        document.getElementById('ns-photos').classList.add('search-switch-active');
        searchSettings.type = 'image';
    } else if(params.f === 'video') {
        document.getElementById('ns-videos').classList.add('search-switch-active');
        searchSettings.type = 'video';
    } else {
        document.getElementById('ns-popular').classList.add('search-switch-active');
        searchSettings.type = 'popular';
    }

    if(params.pf === 'on') {
        document.getElementById('ns-followedpeople').classList.add('search-switch-active');
        searchSettings.followedPeople = true;
    } else {
        document.getElementById('ns-allpeople').classList.add('search-switch-active');
        searchSettings.followedPeople = false;
    }
    if(params.lf === 'on') {
        document.getElementById('ns-near').classList.add('search-switch-active');
        searchSettings.nearYou = true;
    } else {
        document.getElementById('ns-everywhere').classList.add('search-switch-active');
        searchSettings.nearYou = false;
    }
    document.getElementById('search-input').value = params.q;
}
function craftParams() {
    let params = new URLSearchParams();
    if(searchSettings.type !== 'popular') params.set('f', searchSettings.type);
    if(searchSettings.followedPeople) params.set('pf', 'on');
    if(searchSettings.nearYou) params.set('lf', 'on');
    if(searchParams.q) params.set('q', searchParams.q);
    else params.set('q', document.getElementById('search-input').value);
    return params.toString();
}

function updateUserData() {
    API.verifyCredentials().then(u => {
        user = u;
        userDataFunction(u);
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

async function renderSearch(c) {
    updateSavedButton();
    let searchDiv = document.getElementById('timeline');
    let search;
    let currentCursor = cursor;
    try {
        let searchData;
        try {
            searchData = await API.searchV2({
                q: encodeURIComponent(searchParams.q) + (searchSettings.nearYou ? ' near:me' : ''),
                tweet_search_mode: searchSettings.type === 'live' ? 'live' : '',
                social_filter: searchSettings.followedPeople ? 'searcher_follows' : '',
                result_filter: searchSettings.type === 'user' ? 'user' : searchSettings.type === 'image' ? 'image' : searchSettings.type === 'video' ? 'video' : '',
            }, cursor);
        } catch(e) {
            console.error(e);
            searchDiv.innerHTML = `<div class="no-results">
                <br><br>
                <span style="color:var(--default-text-color)">${String(e)}</span><br><br>
                <button class="nice-button">${LOC.try_again.message}</button>
            </div>`;
            cursor = undefined;
            let button = searchDiv.querySelector('button');
            button.addEventListener('click', () => {
                renderSearch();
            });
            document.getElementById('loading-box').hidden = true;
            return;
        }
        search = searchData;
        cursor = search.cursor;
        search = search.list;
    } catch(e) {
        console.error(e);
        cursor = undefined;
        return document.getElementById('loading-box').hidden = true;
    }
    if(!c) {
        searchDiv.innerHTML = '';
    }
    if(vars.linkColorsInTL) {
        let tlUsers = [];
        for(let i in search) {
            let t = search[i];
            if(t.type !== 'user') {
                if(!tlUsers.includes(t.user.screen_name)) tlUsers.push(t.user.screen_name); 
            }
        }
        tlUsers = tlUsers.filter(i => !linkColors[i]);
        let linkData = await fetch(`https://dimden.dev/services/twitter_link_colors/get_multiple/${tlUsers.join(',')}`).then(res => res.json()).catch(console.error);
        if(linkData) for(let i in linkData) {
            linkColors[linkData[i].username] = linkData[i].color;
        }
    }
    if(search.length === 0) {
        if(!currentCursor) {
            searchDiv.innerHTML = `<div class="no-results">
                <br><br>
                ${LOC.no_results.message}<br><br>
                <button class="nice-button">${LOC.try_again.message}</button>
            </div>`;
            cursor = undefined;
            let button = searchDiv.querySelector('button');
            button.addEventListener('click', () => {
                renderSearch();
            });
        } else {
            document.getElementById('search-more').hidden = true;
        }
        return document.getElementById('loading-box').hidden = true;
    }
    for(let i = 0; i < search.length; i++) {
        let t = search[i];
        if(t.type === 'user') {
            let followingElement = document.createElement('div');
            followingElement.classList.add('following-item');
            followingElement.innerHTML = `
            <div style="height:48px">
                <a href="https://twitter.com/${t.screen_name}" class="following-item-link">
                    <img src="${t.profile_image_url_https}" alt="${t.screen_name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                    <div class="following-item-text">
                        <span class="tweet-header-name following-item-name">${escapeHTML(t.name)}</span><br>
                        <span class="tweet-header-handle">@${t.screen_name}</span>
                    </div>
                </a>
            </div>
            <div>
                <button class="following-item-btn nice-button ${t.following ? 'following' : 'follow'}">${t.following ? LOC.following_btn.message : LOC.follow.message}</button>
            </div>`;

            let followButton = followingElement.querySelector('.following-item-btn');
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
                    followButton.innerText = LOC.following_btn.message;
                }
            });

            searchDiv.appendChild(followingElement);
        } else {
            if (t.retweeted_status) {
                await appendTweet(t.retweeted_status, searchDiv, {
                    top: {
                        text: `<a href="https://twitter.com/${t.user.screen_name}">${escapeHTML(t.user.name)}</a> ${LOC.retweeted.message}`,
                        icon: "\uf006",
                        color: "#77b255"
                    },
                    bigFont: t.retweeted_status.full_text.length < 75
                });
            } else {
                await appendTweet(t, searchDiv, {
                    bigFont: t.full_text.length < 75
                });
            }
        }
    }
    document.getElementById('loading-box').hidden = true;
}
async function updateSavedButton() {
    API.getSavedSearches().then(savedSearches => {
        saved = savedSearches.find(s => s.query === searchParams.q);
        if(saved) {
            document.getElementById('save-search').innerText = LOC.remove_search.message;
            document.getElementById('save-search').classList.add('saved');
        } else {
            document.getElementById('save-search').innerText = LOC.save_search.message;
            document.getElementById('save-search').classList.remove('saved');
        }
        document.getElementById('save-search').addEventListener('click', async () => {
            if(saved) {
                await API.deleteSavedSearch(saved.id_str);
                document.getElementById('save-search').innerText = LOC.save_search.message;
                document.getElementById('save-search').classList.remove('saved');
                savedSearches = savedSearches.filter(s => s.id_str !== saved.id_str);
                chrome.storage.local.set({savedSearches: {
                    date: Date.now(),
                    data: savedSearches
                }}, () => {});
                saved = undefined;
            } else {
                let saveData = await API.saveSearch(searchParams.q);
                savedSearches.push(saveData);
                chrome.storage.local.set({savedSearches: {
                    date: Date.now(),
                    data: savedSearches
                }}, () => {});
                saved = saveData;
                document.getElementById('save-search').innerText = LOC.remove_search.message;
                document.getElementById('save-search').classList.add('saved');
            }
        });
    }).catch(() => {});
}
let lastTweetDate = 0;
let activeTweet;
let loadingNewTweets = false;

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
    window.addEventListener("popstate", async () => {
        cursor = undefined;
        updateSubpage();
        renderSearch();
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
                        if(newVideo && !newVideo.ended) {
                            newVideo.play();
                        }
                    }
                }
                activeTweet = newActiveTweet;
            }
        }
        // load more tweets
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            if (loadingNewTweets || !cursor) return;
            loadingNewTweets = true;
            await renderSearch(cursor);
            setTimeout(() => {
                setTimeout(() => {
                    loadingNewTweets = false;
                });
            }, 200);
        }
    });
    
    // tweet hotkeys
    if(!vars.disableHotkeys) {
        let tle = document.getElementById('timeline');
        document.addEventListener('keydown', async e => {
            if(e.ctrlKey) return;
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
            if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
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
                if(e.target.className.includes('tweet tweet-id-')) {
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

    let searchSwitches = Array.from(document.getElementsByClassName('search-switch'));
    searchSwitches.forEach(s => {
        s.addEventListener('click', async () => {
            let id = s.id.split('-')[1];
            if(s.id === "advanced") {
                let modal = createModal(/*html*/`
                    <h1 class="nice-header">${LOC.advanced_search.message}</h1>
                    <div class="search-advanced-div">
                        <h3 class="nice-subheader">${LOC.words.message}</h3><br>
                        <input type="text" id="sai-allthesewords" class="search-advanced-input" placeholder="${LOC.all_these_words.message}"><br>
                        <span class="example">${LOC.all_these_words_example.message}</span>
                        <br><br>
                        <input type="text" id="sai-exactphrase" class="search-advanced-input" placeholder="${LOC.exact_phrase.message}"><br>
                        <span class="example">${LOC.exact_phrase_example.message}</span>
                        <br><br>
                        <input type="text" id="sai-anywords" class="search-advanced-input" placeholder="${LOC.any_words.message}"><br>
                        <span class="example">${LOC.any_words_example.message}</span>
                        <br><br>
                        <input type="text" id="sai-notthesewords" class="search-advanced-input" placeholder="${LOC.not_these_words.message}"><br>
                        <span class="example">${LOC.not_these_words_example.message}</span>
                        <br><br>
                        <h3 class="nice-subheader">${LOC.user.message}</h3>
                        <input type="text" id="sai-fromuser" class="search-advanced-input" placeholder="${LOC.from_this_user.message}"><br>
                        <span class="example">${LOC.from_this_user_example.message}</span>
                        <br><br>
                        <input type="text" id="sai-mentionsuser" class="search-advanced-input" placeholder="${LOC.mentions_this_user.message}"><br>
                        <span class="example">${LOC.mentions_this_user_example.message}</span>
                        <br><br>
                        <h3 class="nice-subheader">${LOC.interactions.message}</h3>
                        <input type="number" id="sai-minreplies" class="search-advanced-input" placeholder="${LOC.min_replies.message}"><br>
                        <span class="example">${LOC.min_replies_example.message}</span>
                        <br><br>
                        <input type="number" id="sai-minlikes" class="search-advanced-input" placeholder="${LOC.min_favorites.message}"><br>
                        <span class="example">${LOC.min_favorites_example.message}</span>
                        <br><br>
                        <input type="number" id="sai-minretweets" class="search-advanced-input" placeholder="${LOC.min_retweets.message}"><br>
                        <span class="example">${LOC.min_retweets_example.message}</span>
                        <br><br>
                        <h3 class="nice-subheader">${LOC.dates.message}</h3><br>
                        ${LOC.since.message}:
                        <input type="date" id="sai-after" class="search-advanced-input"><br>
                        <br>
                        ${LOC.until.message}:
                        <input type="date" id="sai-before" class="search-advanced-input"><br>
                        <br>
                        <button class="nice-button">${LOC.search.message}</button>
                    </div>
                `);
                modal.querySelector('.nice-button').addEventListener('click', async () => {
                    const allTheseWords = modal.querySelector('#sai-allthesewords').value;
                    const exactPhrase = modal.querySelector('#sai-exactphrase').value;
                    const anyWords = modal.querySelector('#sai-anywords').value;
                    const notTheseWords = modal.querySelector('#sai-notthesewords').value;
                    const fromUser = modal.querySelector('#sai-fromuser').value;
                    const mentionsUser = modal.querySelector('#sai-mentionsuser').value;
                    const minReplies = modal.querySelector('#sai-minreplies').value;
                    const minLikes = modal.querySelector('#sai-minlikes').value;
                    const minRetweets = modal.querySelector('#sai-minretweets').value;
                    const after = modal.querySelector('#sai-after').value;
                    const before = modal.querySelector('#sai-before').value;
                    let newQuery = "";
                    if(allTheseWords) newQuery = allTheseWords;
                    if(exactPhrase) newQuery += ` "${exactPhrase}"`;
                    if(anyWords) newQuery += ` (${anyWords.split(" ").join(' OR ')})`;
                    if(notTheseWords) newQuery += ` ${anyWords.split(" ").map(w => `-${w}`).join(' ')}`;
                    if(fromUser) newQuery += ` (from:${fromUser.startsWith('@') ? fromUser.slice(1) : fromUser})`;
                    if(mentionsUser) newQuery += ` (to:${mentionsUser.startsWith('@') ? mentionsUser.slice(1) : mentionsUser})`;
                    if(minReplies) newQuery += ` (min_replies:${minReplies})`;
                    if(minLikes) newQuery += ` (min_faves:${minLikes})`;
                    if(minRetweets) newQuery += ` (min_retweets:${minRetweets})`;
                    if(after) newQuery += ` since:${after}`;
                    if(before) newQuery += ` until:${before}`;
                    if(newQuery) {
                        searchParams.q = newQuery;
                        let params = craftParams();
                        history.pushState({}, null, `search?${params}`);
                        updateSubpage();
                        cursor = undefined;
                        renderSearch();
                        modal.remove();
                    }
                });
                return;
            }
            switch(id) {
                case 'popular': searchSettings.type = 'popular'; break;
                case 'live': searchSettings.type = 'live'; break;
                case 'people': searchSettings.type = 'user'; break;
                case 'photos': searchSettings.type = 'image'; break;
                case 'videos': searchSettings.type = 'video'; break;
                case 'followedpeople': searchSettings.followedPeople = true; break;
                case 'allpeople': searchSettings.followedPeople = false; break;
                case 'everywhere': searchSettings.nearYou = false; break;
                case 'near': searchSettings.nearYou = true; break;
            }
            document.getElementById('loading-box').hidden = false;
            let params = craftParams();
            history.pushState({}, null, `search?${params}`);
            updateSubpage();
            cursor = undefined;
            renderSearch();
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

    document.addEventListener('newSearch', () => {
        document.getElementById('loading-box').hidden = false;
        searchParams.q = document.getElementById('search-input').value;
        let params = craftParams();
        history.pushState({}, null, `search?${params}`);
        updateSubpage();
        cursor = undefined;
        renderSearch();
    });

    // Run
    updateSubpage();
    updateUserData();
    renderDiscovery();
    renderTrends(true);
    renderSearch();
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 5);
    setInterval(() => renderTrends(true), 60000 * 5);
}, 250);