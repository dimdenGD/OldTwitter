let user = {};
let cursor, cursorTop;
let linkColors = {};
let searchParams = {}, searchSettings = {};
let saved;
let lastSearch = '';

// Util

function updateSubpage() {
    let params = Object.fromEntries(new URLSearchParams(location.search + location.hash));
    searchParams = params || {};
    searchSettings = {};
    linkColors = {};
    cursorTop = undefined;
    toRender = [];
    document.getElementById('new-tweets').hidden = true;
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

async function renderSearch(c, force = false) {
    let newSearch = searchParams.q+searchSettings.type+searchSettings.followedPeople+searchSettings.nearYou;
    if(newSearch === lastSearch && !force) return;
    lastSearch = newSearch;
    updateSavedButton();
    document.getElementsByTagName('title')[0].innerText = `"${searchParams.q}" ${LOC.twitter.message} ${LOC.search.message} - ${LOC.twitter.message}`;
    let searchDiv = document.getElementById('timeline');
    let search;
    let currentCursor = cursor;
    try {
        let searchData;
        const products = {
            popular: "Top",
            live: "Latest",
            user: "People",
            image: "Photos",
            video: "Videos"
        }
        try {
            searchData = await API.search.adaptiveV2({
                rawQuery: decodeURIComponent(searchParams.q) + (searchSettings.nearYou ? ' near:me' : '') + (searchSettings.followedPeople ? ' filter:follows' : ''),
                count: 50,
                // tweet_search_mode: searchSettings.type === 'live' ? 'live' : '',
                // social_filter: searchSettings.followedPeople ? 'searcher_follows' : '',
                querySource: 'typed_query',
                product: products[searchSettings.type],
                // result_filter: searchSettings.type === 'user' ? 'user' : searchSettings.type === 'image' ? 'image' : searchSettings.type === 'video' ? 'video' : '',
            }, cursor);
        } catch(e) {
            console.error(e);
            if(!c) {
                searchDiv.innerHTML = html`<div class="no-results">
                    <br><br>
                    <span style="color:var(--default-text-color)">${String(e)}</span><br><br>
                    <button class="nice-button">${LOC.try_again.message}</button>
                </div>`;
                let button = searchDiv.querySelector('button');
                button.addEventListener('click', () => {
                    renderSearch();
                });
            }
            document.getElementById('loading-box').hidden = true;
            return;
        }
        search = searchData;
        cursor = search.cursorBottom;
        if(searchSettings.type === 'live') {
            cursorTop = search.cursorTop;
        } else {
            cursorTop = undefined;
        }
        search = search.list;
    } catch(e) {
        console.error(e);
        return document.getElementById('loading-box').hidden = true;
    }
    if(!c) {
        window.scrollTo(0, 0);
        searchDiv.innerHTML = '';
    }
    if(vars.slowLinkColorsInTL) {
        let tlUsers = [];
        for(let i in search) {
            let t = search[i];
            if(t.type !== 'user') {
                if(!tlUsers.includes(t.user.screen_name)) tlUsers.push(t.user.screen_name); 
            }
        }
        tlUsers = tlUsers.filter(i => !linkColors[i]);
        let linkData = await getLinkColors(tlUsers);
        if(linkData) for(let i in linkData) {
            linkColors[linkData[i].id] = linkData[i].color;
        }
    }
    if(search.length === 0) {
        if(!currentCursor) {
            searchDiv.innerHTML = html`<div class="no-results">
                <br><br>
                <span style="color:var(--default-text-color)">${LOC.no_results.message}</span><br><br>
                <button class="nice-button">${LOC.try_again.message}</button>
            </div>`;
            cursor = undefined;
            let button = searchDiv.querySelector('button');
            button.addEventListener('click', () => {
                renderSearch();
            });
        } else {
            if(document.getElementById('search-more')) document.getElementById('search-more').hidden = true;
        }
        return document.getElementById('loading-box').hidden = true;
    }
    for(let i = 0; i < search.length; i++) {
        let t = search[i];
        if(t.type === 'user') {
            appendUser(t, searchDiv);
        } else {
            if (t.retweeted_status) {
                await appendTweet(t.retweeted_status, searchDiv, {
                    top: {
                        text: html`<a href="/${t.user.screen_name}">${t.user.name}</a> ${LOC.retweeted.message}`,
                        icon: "\uf006",
                        color: "#77b255"
                    },
                    translate: vars.autotranslateProfiles.includes(t.user.id_str),
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
    API.search.getSaved().then(savedSearches => {
        saved = savedSearches.find(s => s.query === searchParams.q);
        if(saved) {
            document.getElementById('save-search-right').innerText = LOC.remove_search.message;
            document.getElementById('save-search-right').classList.add('saved');
            document.getElementById('save-search-left').innerText = LOC.remove_search.message;
            document.getElementById('save-search-left').classList.add('saved');
        } else {
            document.getElementById('save-search-right').innerText = LOC.save_search.message;
            document.getElementById('save-search-right').classList.remove('saved');
            document.getElementById('save-search-left').innerText = LOC.save_search.message;
            document.getElementById('save-search-left').classList.remove('saved');
        }
        document.getElementById('save-search-right').addEventListener('click', async () => {
            if(saved) {
                await API.search.deleteSaved(saved.id_str);
                document.getElementById('save-search-right').innerText = LOC.save_search.message;
                document.getElementById('save-search-right').classList.remove('saved');
                document.getElementById('save-search-left').innerText = LOC.save_search.message;
                document.getElementById('save-search-left').classList.remove('saved');
                savedSearches = savedSearches.filter(s => s.id_str !== saved.id_str);
                chrome.storage.local.set({savedSearches: {
                    date: Date.now(),
                    data: savedSearches
                }}, () => {});
                saved = undefined;
            } else {
                let saveData = await API.search.save(searchParams.q);
                savedSearches.push(saveData);
                chrome.storage.local.set({savedSearches: {
                    date: Date.now(),
                    data: savedSearches
                }}, () => {});
                saved = saveData;
                document.getElementById('save-search-right').innerText = LOC.remove_search.message;
                document.getElementById('save-search-right').classList.add('saved');
                document.getElementById('save-search-left').innerText = LOC.remove_search.message;
                document.getElementById('save-search-left').classList.add('saved');
            }
        });
        document.getElementById('save-search-left').addEventListener('click', async () => {
            if(saved) {
                await API.search.deleteSaved(saved.id_str);
                document.getElementById('save-search-right').innerText = LOC.save_search.message;
                document.getElementById('save-search-right').classList.remove('saved');
                document.getElementById('save-search-left').innerText = LOC.save_search.message;
                document.getElementById('save-search-left').classList.remove('saved');
                savedSearches = savedSearches.filter(s => s.id_str !== saved.id_str);
                chrome.storage.local.set({savedSearches: {
                    date: Date.now(),
                    data: savedSearches
                }}, () => {});
                saved = undefined;
            } else {
                let saveData = await API.search.save(searchParams.q);
                savedSearches.push(saveData);
                chrome.storage.local.set({savedSearches: {
                    date: Date.now(),
                    data: savedSearches
                }}, () => {});
                saved = saveData;
                document.getElementById('save-search-right').innerText = LOC.remove_search.message;
                document.getElementById('save-search-right').classList.add('saved');
                document.getElementById('save-search-left').innerText = LOC.remove_search.message;
                document.getElementById('save-search-left').classList.add('saved');
            }
        });
    }).catch(() => {});
}

let loadingNewTweets = false;
let toRender = [];

setInterval(async () => {
    if(cursorTop) {
        let data = await API.search.adaptiveV2({
            rawQuery: decodeURIComponent(searchParams.q) + (searchSettings.nearYou ? ' near:me' : '') + (searchSettings.followedPeople ? ' filter:follows' : ''),
            count: 50,
            querySource: 'typed_query',
            product: "Latest",
        }, cursorTop);
        cursorTop = data.cursorTop;
        data = data.list;
        let newTweets = document.getElementById('new-tweets');

        if(data.length === 0) return;

        toRender = [...data, ...toRender];
        toRender = toRender.filter((t, i, self) => self.findIndex(t2 => t2.id_str === t.id_str) === i);
        newTweets.hidden = false;
        if(vars.updateTimelineAutomatically) {
            setTimeout(() => newTweets.click(), 10);
        }
    }
}, 60000 * 3);

setTimeout(async () => {
    if(!vars) {
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
    
    window.addEventListener("popstate", async () => {
        if(document.querySelector('.tweet-viewer')) return;
        cursor = undefined;
        updateSubpage();
        renderSearch();
    });
    document.addEventListener('scroll', async () => {
        // load more tweets
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 1000) {
            if (loadingNewTweets || !cursor) return;
            loadingNewTweets = true;
            await renderSearch(cursor, true);
            setTimeout(() => {
                setTimeout(() => {
                    loadingNewTweets = false;
                });
            }, 200);
        }
    });
    
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
        activeTweet = tweets.find(t => scrollPoint > t.offsetTop && scrollPoint < t.offsetTop + t.scrollHeight);
        if(activeTweet) {
            activeTweet.classList.add('tweet-active');
        }
    });
    document.getElementById('new-tweets').addEventListener('click', async () => {
        let container = document.getElementById('timeline');
        let toInsert = [];
        
        for(let i in toRender) {
            let t = toRender[i];
            if(t.retweeted_status) {
                toInsert.push(await appendTweet(t.retweeted_status, container, {
                    top: {
                        text: html`<a href="/${t.user.screen_name}">${t.user.name}</a> ${LOC.retweeted.message}`,
                        icon: "\uf006",
                        color: "#77b255",
                        class: 'retweet-label'
                    },
                    translate: vars.autotranslateProfiles.includes(t.user.id_str),
                    noInsert: true
                }));
            } else {
                toInsert.push(await appendTweet(t, container, {
                    bigFont: typeof t.full_text === 'string' && t.full_text.length < 75,
                    translate: vars.autotranslateProfiles.includes(t.user.id_str),
                    noInsert: true
                }));
            }
        }

        toRender = [];
        document.getElementById('new-tweets').hidden = true;
        container.prepend(...toInsert);
    });

    let searchSwitches = Array.from(document.getElementsByClassName('search-switch'));
    searchSwitches.forEach(s => {
        s.addEventListener('click', async () => {
            let id = s.id.split('-')[1];
            if(s.id === "advanced") {
                let modal = createModal(html`
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
                        <input type="number" id="sai-minreplies" class="search-advanced-input" min="0"  placeholder="${LOC.min_replies.message}"><br>
                        <span class="example">${LOC.min_replies_example.message}</span>
                        <br><br>
                        <input type="number" id="sai-minlikes" class="search-advanced-input" min="0"  placeholder="${LOC.min_favorites.message}"><br>
                        <span class="example">${LOC.min_favorites_example.message}</span>
                        <br><br>
                        <input type="number" id="sai-minretweets" class="search-advanced-input"  min="0" placeholder="${LOC.min_retweets.message}"><br>
                        <span class="example">${LOC.min_retweets_example.message}</span>
                        <br><br>
                        <h3 class="nice-subheader">${LOC.dates.message}</h3><br>
                        <span style="color:var(--almost-black)">${LOC.since.message}:</span>
                        <input type="date" id="sai-after" class="search-advanced-input"><br>
                        <br>
                        <span style="color:var(--almost-black)">${LOC.until.message}:</span>
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
                        modal.querySelector('.modal-close').click();
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
}, 50);