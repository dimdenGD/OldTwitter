// abandon hope all ye who enter here

let user = {};
let timeline = {
    data: [],
    dataToUpdate: [],
    toBeUpdated: 0
}
let seenThreads = [];
let seenTweets = [];
let mediaToUpload = [];
let pollToUpload = undefined;
let linkColors = {};
let circles = [];
let selectedCircle = undefined;
let cursorBottom, cursorTop;
let repliesToIgnore = [];

function fixTweetThreadLine() {
    let tweets = document.getElementsByClassName('tweet');
    for(let i = 0; i < tweets.length; i++) {
        let tweet = tweets[i];
        let tweet2 = tweets[i + 1];
        if(!tweet2) continue;
        if(tweet.classList.contains('tweet-self-thread-continuation') && !tweet2.classList.contains('tweet-no-top')) {
            tweet.getElementsByClassName('tweet-self-thread-div')[0].hidden = true;
            tweet.classList.remove('tweet-self-thread-continuation');
        }
    }
}

async function createShamelessPlug(firstTime = true) {
    let dimden = await API.user.getV2('d1mden');
    chrome.storage.local.set({'followingDeveloper': dimden.following}, () => {});

    if(!dimden.following) {
        let opened = Date.now();
        let modal = createModal(html`
            <h2 style="margin:0;margin-bottom:10px;color:var(--darker-gray);font-weight:300">Shameless plug</h2>
            <span style="font-size:14px;color:var(--default-text-color)">
                ${firstTime ? LOC.thank_you.message.replace('$AT1$', "<a target=\"_blank\" href=\"/old/settings\">").replace('$AT2$', "</a>") : LOC.thank_you2.message.replace('$AT1$', "<a target=\"_blank\" href=\"https://dimden.dev/donate/\">").replace('$AT2$', "</a>")}<br><br>
                <a href="/d1mden">${LOC.follow_mb.message} 👉👈</a><br><br>
                <div class="dimden">
                    <img style="float:left" src="${dimden.profile_image_url_https.replace("_normal", "_bigger")}" width="48" height="48" alt="dimden" class="tweet-avatar">
                    <a class="dimden-text" href="/d1mden" style="vertical-align:top;margin-left:10px;">
                        <b class="tweet-header-name">${dimden.name}</b>
                        <span class="tweet-header-handle">@${dimden.screen_name}</span>
                    </a><br>
                    <button class="nice-button follow" style="margin-left:10px;margin-top:5px;">${LOC.follow.message}</button>
                </div>
            </span>
        `, 'shameless-plug', () => {}, () => Date.now() - opened > 1750);
        let followButton = modal.querySelector('.follow');
        followButton.addEventListener('click', () => {
            API.user.follow('d1mden').then(() => {
                alert(LOC.thank_you_follow.message);
                modal.removeModal();
            }).catch(e => {
                console.error(e);
                location.href = '/d1mden';
            });
        });
        twemoji.parse(modal);
    }
}



setTimeout(() => {
    chrome.storage.local.get(['installed', 'lastVersion', 'nextPlug'], async data => {
        if (!data.installed) {
            createShamelessPlug(true);
            chrome.storage.local.set({installed: true, lastVersion: chrome.runtime.getManifest().version, nextPlug: Date.now() + 1000 * 60 * 60 * 24 * 20});
        } else {
            if (
                !data.lastVersion ||
                data.lastVersion.split('.').slice(0, data.lastVersion.split('.').length <= 3 ? 100 : -1).join('.') !== chrome.runtime.getManifest().version.split('.').slice(0, chrome.runtime.getManifest().version.split('.').length <= 3 ? 100 : -1).join('.')
            ) {
                let opened = Date.now();
                // createModal(html`
                //     <h2 style="margin:0;margin-bottom:10px;color:var(--darker-gray);font-weight:300">(OldTwitter) ${LOC.new_version.message} - ${chrome.runtime.getManifest().version}</h2>
                //     <span id="changelog" style="font-size:14px;color:var(--default-text-color)">
                //         <ul>
                //             <li>Added viewing likes bypass lol</li>
                //         </ul>
                //     </span>
                // `, 'changelog-modal', () => {}, () => Date.now() - opened > 1250);
                // let changelog = document.getElementById('changelog');
                // let text = changelog.innerText;
                // let lang = LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en";
                // if(!lang.startsWith('en')) {
                //     changelog.innerHTML += html`<span class="tweet-translate">${LOC.view_translation.message}</span>`;
                //     changelog.querySelector('.tweet-translate').addEventListener('click', () => {
                //         openInNewTab('https://translate.google.com/?sl=en&tl=' + lang + '&text=' + encodeURIComponent(text) + '&op=translate');
                //     });
                // }
                chrome.storage.local.set({lastVersion: chrome.runtime.getManifest().version});
            } else {
                if(!data.nextPlug) {
                    chrome.storage.local.set({nextPlug: Date.now() + 1000 * 60 * 60 * 24 * 20});
                } else {
                    if(data.nextPlug < Date.now()) {
                        createShamelessPlug(false);
                        chrome.storage.local.set({nextPlug: Date.now() + 1000 * 60 * 60 * 24 * 20});
                    }
                }
            }
        }
    });
}, 2000);

// Util
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
async function updateTimeline(mode = 'rewrite') {
    seenThreads = [];
    if (timeline.data.length === 0) {
        document.getElementById('timeline').innerHTML = html``;
        document.getElementById('tweets-loading').hidden = false;
        document.getElementById('load-more').hidden = true;
    }
    let fn, args = [];
    if(vars.timelineType.startsWith('list-')) {
        fn = API.list.getTweets;
        args.push(vars.timelineType.split('-')[1]);
    } else if(vars.timelineType.startsWith('search-')) {
        fn = API.search.adaptiveV2;
        args.push({
            rawQuery: decodeURIComponent(vars.timelineType.split('-').slice(1).join('-')),
            count: 50,
            querySource: 'typed_query',
            product: "Latest",
        });
    } else {
        switch(vars.timelineType) {
            case 'algo': fn = API.timeline.getAlgorithmicalV2; break;
            case 'chrono-retweets': fn = API.timeline.getChronologicalV2; break;
            case 'chrono-no-retweets': fn = API.timeline.getChronologicalV2; break;
            case 'chrono-social':
                if(mode === 'prepend') {
                    fn = API.timeline.getChronologicalV2;
                } else {
                    fn = API.timeline.getMixed;
                    args.push(seenAlgoTweets);
                }
                break;
            default: fn = API.timeline.getChronologicalV2; break;
        }
    }
    if(mode === 'prepend') {
        args.push(cursorTop);
    }

    let [tl, s] = await Promise.allSettled([fn(...args), API.account.getSettings()]);
    if(!tl.value) {
        console.error(tl.reason);
        document.getElementById('tweets-loading').hidden = true;
        return;
    }
    s = s.value; tl = tl.value;
    if(mode === 'rewrite' || mode === 'append') cursorBottom = tl.cursorBottom;
    if(mode === 'rewrite' || mode === 'prepend') cursorTop = tl.cursorTop;

    let suspended = tl.suspended;

    tl = tl.list;
    if(vars.timelineType === 'algo' || vars.timelineType === 'algov2') {
        tl = tl.filter(t => !seenTweets.includes(t.id_str));
        for(let t of tl) {
            seenTweets.push(t.id_str);
        }
    } else if(vars.timelineType === 'chrono-retweets') {
        tl = tl.filter(t => t.retweeted_status);
    } else if(vars.timelineType === 'chrono-no-retweets') {
        tl = tl.filter(t => !t.retweeted_status);
    }
    if(!user.friends_count && tl.length === 0 && vars.timelineType.startsWith('chrono') && !suspended && mode === 'rewrite') {
        document.getElementById('timeline').innerHTML = html`<span style="color:var(--darker-gray);margin-top:10px;display:block">${LOC.no_tl_tweets.message}</span>`;
        return;
    }
    if(!vars.showTopicTweets) {
        tl = tl.filter(t => !t.socialContext || !t.socialContext.description);
    }

    if(vars.linkColorsInTL) {
        let tlUsers = tl.map(t => t.user.id_str).filter(u => !linkColors[u]);
        let linkData = await getLinkColors(tlUsers);
        if(linkData) for(let i in linkData) {
            linkColors[linkData[i].id] = linkData[i].color;
        }
    }

    // first update
    if (timeline.data.length === 0) {
        timeline.data = tl;
        renderTimeline({ mode: 'rewrite', data: tl, suspended });
    }
    // update
    else {
        if(mode === 'prepend') {
            if(tl) {
                let dataIds = timeline.data.map(t => t.id_str);
                tl = tl.filter(t => !dataIds.includes(t.id_str) || t.threadContinuation);
                timeline.dataToUpdate = tl.concat(timeline.dataToUpdate);
                timeline.toBeUpdated += tl.length;
            }
            renderNewTweetsButton();
        }
    }
}
async function updateCircles() {
    let circlesList = document.getElementById('audience-group');
    circles = await API.circle.getCircles();
    for(let i in circles) {
        let option = document.createElement('option');
        option.value = circles[i].rest_id;
        option.innerText = circles[i].name;
        circlesList.appendChild(option);
    }
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
    document.getElementById('new-tweet-avatar').src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`.replace("_normal", "_bigger");

    if(vars.enableTwemoji) twemoji.parse(document.getElementById('user-name'));

    document.getElementById('loading-box').hidden = true;

    if(document.getElementById('user-stats').clientWidth > 300) {
        let style = document.createElement('style');
        style.innerHTML = html`.user-stat-div > h2 { font-size: 10px !important }`;
        document.head.appendChild(style);
    }
}

async function renderTimeline(options = {}) {
    if(!options.mode) options.mode = 'rewrite';
    if(!options.data) options.data = timeline.data;
    let timelineContainer = document.getElementById('timeline');
    if(options.mode === 'rewrite') {
        if(options.suspended) {
            try {
                timelineContainer.innerHTML = html`
                    <div style="color:var(--almost-black);padding:20px;word-break: break-word;" class="box">
                        <h2 class="nice-header" style="margin-bottom:0">${options.suspended.content.itemContent.content.headerText}</h2>
                        <p>${options.suspended.content.itemContent.content.bodyText.replace(/\sX\s/g, ' Twitter ')}</p>
                        <div>
                            ${options.suspended.content.itemContent.content.bodyRichText.entities.map(e => `<a href="${e.ref.url}" target="_blank">${e.ref.url}</a>`).join('<br>')}
                        </div>
                    </div>
                `;
                document.getElementById('tweets-loading').hidden = true;
                document.getElementById('load-more').hidden = true;
            } catch(e) {
                console.error(e);
            }
        } else timelineContainer.innerHTML = '';
    }
    let data = options.data;

    let toRender = [];
    for(let i in data) {
        let t = data[i];
        if(t.algo && t.favorited) {
            if(!seenAlgoTweets.includes(t.id_str)) {
                seenAlgoTweets.push(t.id_str);
                if(seenAlgoTweets.length > 100) {
                    seenAlgoTweets.shift();
                }
                algoTweetsChanged = true;
            }
            continue;
        }
        if (t.retweeted_status) {
            let o = {
                top: {
                    text: html`<a href="/${t.user.screen_name}">${t.user.name}</a> ${LOC.retweeted.message}`,
                    icon: "\uf006",
                    color: "#77b255",
                    class: 'retweet-label'
                },
                translate: vars.autotranslateProfiles.includes(t.user.id_str)
            };
            if(options.mode === 'prepend') {
                o.noInsert = true;
                toRender.push(await appendTweet(t.retweeted_status, timelineContainer, o));
            } else {
                await appendTweet(t.retweeted_status, timelineContainer, o);
            }
        } else {
            if(options.mode === 'prepend') {
                toRender.push(await appendTweet(t, timelineContainer, {
                    bigFont: t.full_text.length < 75,
                    noInsert: true
                }));
            } else {
                await appendTweet(t, timelineContainer, {
                    bigFont: t.full_text.length < 75
                });
            }
        }
    };
    if(options.mode === 'prepend' && toRender.length > 0) {
        timelineContainer.prepend(...toRender);
        if(vars.enableTwemoji) {
            for(let t in toRender) {
                twemoji.parse(toRender[t]);
            }
        }
    }
    document.getElementById('loading-box').hidden = true;
    document.getElementById('tweets-loading').hidden = true;
    document.getElementById('load-more').hidden = false;

    setTimeout(fixTweetThreadLine, 100);
    return true;
}
function renderNewTweetsButton() {
    if (timeline.toBeUpdated > 0) {
        document.getElementById("new-tweets-bug-fix").innerHTML = html`
            .tweet:first-child .tweet-translate-after {
                margin-right: 0 !important;
            }
        `;
        document.getElementById('new-tweets').hidden = false;
        document.getElementById('new-tweets').innerText = `${LOC.see_new_tweets.message}`;
        if(vars.updateTimelineAutomatically) {
            setTimeout(() => {
                document.getElementById('new-tweets').click();
            });
        }
    } else {
        document.getElementById("new-tweets-bug-fix").innerHTML = html``;
        document.getElementById('new-tweets').hidden = true;
    }
}

setTimeout(async () => {
    if(!vars) {
        await loadVars();
    }
    await new Promise(resolve => {
        chrome.storage.local.get(['seenAlgoTweets'], data => {
            if(data.seenAlgoTweets) {
                seenAlgoTweets = data.seenAlgoTweets;
            };
            resolve();
        });
    });

    // On scroll to end of timeline, load more tweets
    let loadingNewTweets = false;
    document.addEventListener('scroll', async () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            if (loadingNewTweets || timeline.data.length === 0) return;
            document.getElementById('load-more').click();
        }
    }, { passive: true });

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

    // weird bug
    if(!document.getElementById('new-tweets')) {
        return setTimeout(() => location.reload(), 2500);
    }
    try {
        let lastNewTweetPress = Date.now();
        document.getElementById('new-tweets').addEventListener('click', () => {
            if(Date.now() - lastNewTweetPress > 60000 * 60 * 4) { // 4 hours
                lastNewTweetPress = Date.now();
                timeline.toBeUpdated = 0;
                timeline.data = [];
                timeline.dataToUpdate = [];
                seenThreads = [];
                seenTweets = [];
                cursorBottom = undefined;
                cursorTop = undefined;
                renderNewTweetsButton();
                updateTimeline();
                return;
            }
            lastNewTweetPress = Date.now();
            timeline.toBeUpdated = 0;
            timeline.data = [...timeline.dataToUpdate, ...timeline.data];
            renderNewTweetsButton();
            renderTimeline({mode: 'prepend', data: timeline.dataToUpdate });
            timeline.dataToUpdate = [];
        });
    } catch(e) {
        setTimeout(() => location.reload(), 2500);
        console.error(e);
        return;
    }
    document.getElementById('tweets-loading').children[0].src = chrome.runtime.getURL(`images/loading.svg`);

    // Buttons
    document.getElementById('load-more').addEventListener('click', async () => {
        if (loadingNewTweets || timeline.data.length === 0) return;
        loadingNewTweets = true;
        document.getElementById('load-more').innerText = `${LOC.loading.message}...`;
        let tl;
        try {
            if(vars.timelineType.startsWith('list-')) tl = await API.list.getTweets(vars.timelineType.split('-')[1], cursorBottom, 50);
            else if(vars.timelineType.startsWith('search-')) tl = await API.search.adaptiveV2({
                rawQuery: decodeURIComponent(vars.timelineType.split('-').slice(1).join('-')),
                count: 50,
                querySource: 'typed_query',
                product: "Latest",
                cursor: cursorBottom
            });
            else switch(vars.timelineType) {
                case 'algo': tl = await API.timeline.getAlgorithmicalV2(cursorBottom, 50); break;
                default: tl = await API.timeline.getChronologicalV2(cursorBottom); break;
            }
            cursorBottom = tl.cursorBottom;
            tl = tl.list.filter(t => !seenTweets.includes(t.id_str));
            for(let t of tl) {
                seenTweets.push(t.id_str);
            }
            if(vars.timelineType === 'chrono-retweets') {
                tl = tl.filter(t => t.retweeted_status);
            } else if(vars.timelineType === 'chrono-no-retweets') {
                tl = tl.filter(t => !t.retweeted_status);
            }
        } catch (e) {
            console.error(e);
            document.getElementById('load-more').innerText = LOC.load_more.message;
            loadingNewTweets = false;
            return;
        }
        timeline.data = timeline.data.concat(tl);
        try {
            await renderTimeline({mode: 'append', data: tl });
        } catch(e) {
            document.getElementById('load-more').innerText = LOC.load_more.message;
            loadingNewTweets = false;
        }
        setTimeout(() => {
            document.getElementById('load-more').innerText = LOC.load_more.message;
            loadingNewTweets = false;
        }, 250);
    });
    document.getElementById('wtf-refresh').addEventListener('click', async () => {
        renderDiscovery(false);
    });
    document.getElementById('trends-refresh').addEventListener('click', async () => {
        renderTrends(false, false);
    });
    let newTweetUserSearch = document.getElementById("new-tweet-user-search");
    let newTweetText = document.getElementById('new-tweet-text');
    let newTweetButton = document.getElementById('new-tweet-button');
    document.getElementById('new-tweet').addEventListener('click', async e => {
        document.getElementById('new-tweet-focused').hidden = false;
        document.getElementById('new-tweet-audience').hidden = false;
        document.getElementById('new-tweet-char').hidden = false;
        document.getElementById('new-tweet-text').classList.add('new-tweet-text-focused');
        document.getElementById('new-tweet-media-div').classList.add('new-tweet-media-div-focused');
        if(e.target !== newTweetText) {
            newTweetText.dataset.blurSince = Date.now();
        }
        let firstTweet = document.getElementsByClassName('tweet')[0];
        if(firstTweet) {
            let ta = firstTweet.getElementsByClassName('tweet-translate-after')[0];
            if(ta) {
                ta.style.marginRight = '0px';
            }
        }
    });
    document.getElementById('new-tweet').addEventListener('drop', e => {
        document.getElementById('new-tweet').click();
        document.getElementById('new-tweet-poll').innerHTML = '';
        document.getElementById('new-tweet-poll').hidden = true;
        document.getElementById('new-tweet-poll').style.width = '0';
        pollToUpload = undefined;
        handleDrop(e, mediaToUpload, document.getElementById('new-tweet-media-c'));
    });
    document.getElementById('new-tweet-emoji-btn').addEventListener('click', () => {
        createEmojiPicker(document.getElementById('new-tweet'), document.getElementById('new-tweet-text'), {
            marginLeft: '211px',
            marginTop: '-100px'
        });
    });
    let scheduleInput = document.getElementById('new-tweet-schedule-input');
    let schedule = document.getElementById('new-tweet-schedule');
    let scheduleTime;
    document.getElementById('new-tweet-schedule-btn').addEventListener('click', () => {
        schedule.style.display = schedule.style.display === 'none' ? 'inline-block' : 'none';
        scheduleInput.value = '';
        scheduleInput.min = new Date(Date.now() + 60000).toISOString().split('.')[0].split(":").slice(0, -1).join(":");
        scheduleInput.max = new Date(Date.now() + 17 * 30 * 24 * 60 * 60 * 1000).toISOString().split('.')[0].split(":").slice(0, -1).join(":");
        if(schedule.style.display === 'inline-block') {
            newTweetButton.disabled = true;
            newTweetButton.innerText = LOC.schedule.message;
            scheduleTime = 'invalid';
            document.getElementById('new-tweet-audience-input').value = 'everyone';
            document.getElementById('new-tweet-wcr-input').value = 'everyone';
            selectedCircle = undefined;
            document.getElementById('new-tweet-poll').innerHTML = '';
            document.getElementById('new-tweet-poll').hidden = true;
            document.getElementById('new-tweet-poll').style.width = '0';
            pollToUpload = undefined;
            document.getElementById('new-tweet-audience-input').disabled = true;
            document.getElementById('new-tweet-wcr-input').disabled = true;
            document.getElementById('new-tweet-circle-people').hidden = true;
            document.getElementById('new-tweet-wcr-input').hidden = false;
            document.getElementById('new-tweet-poll-btn').classList.add('poll-disabled');
        } else {
            scheduleTime = undefined;
            newTweetButton.innerText = LOC.tweet.message;
            newTweetButton.disabled = false;
            document.getElementById('new-tweet-audience-input').disabled = false;
            document.getElementById('new-tweet-wcr-input').disabled = false;
            document.getElementById('new-tweet-poll-btn').classList.remove('poll-disabled');
        }
    });
    let tweetMediaList = document.getElementById('new-tweet-media-c');

    scheduleInput.addEventListener('input', () => {
        if(!scheduleInput.value) newTweetButton.disabled = true;
        let date;
        try {
            date = new Date(scheduleInput.value);
        } catch (e) {
            scheduleTime = 'invalid';
            newTweetButton.disabled = true;
        }
        let cd = Date.now();
        let time = date.getTime();
        if(cd > time || time - cd > 1000 * 60 * 60 * 24 * 30 * 17) { // 17 months
            scheduleTime = 'invalid';
            newTweetButton.disabled = true;
            return;
        }
        newTweetButton.disabled = false;
        scheduleTime = time;
    });
    document.getElementById('new-tweet-poll-btn').addEventListener('click', () => {
        if(schedule.style.display === 'inline-block') return;
        if(document.getElementById('new-tweet-poll').hidden) {
            mediaToUpload = [];
            document.getElementById('new-tweet-media-c').innerHTML = '';
            document.getElementById('new-tweet-poll').hidden = false;
            document.getElementById('new-tweet-poll').innerHTML = html`
                <input maxlength="25" class="poll-question" data-variant="1" placeholder="${LOC.variant.message} 1"><br>
                <input maxlength="25" class="poll-question" data-variant="2" placeholder="${LOC.variant.message} 2"><br>
                <input maxlength="25" class="poll-question" data-variant="3" placeholder="${LOC.variant.message} 3 ${LOC.optional.message}"><br>
                <input maxlength="25" class="poll-question" data-variant="4" placeholder="${LOC.variant.message} 4 ${LOC.optional.message}"><br>
                <hr>
                ${LOC.days.message}: <input class="poll-date" id="poll-days" type="number" min="0" max="7" value="1">
                ${LOC.hours.message}: <input class="poll-date" id="poll-hours" type="number" min="0" max="23" value="0">
                ${LOC.minutes.message}: <input class="poll-date" id="poll-minutes" type="number" min="0" max="59" value="0">
                <hr>
                <button class="nice-button" id="poll-remove">${LOC.remove_poll.message}</button>
                <br>
            `;
            document.getElementById('new-tweet-poll').style.width = '350px';
            let pollVariants = Array.from(document.getElementsByClassName('poll-question'));
            pollToUpload = {
                duration_minutes: 1440,
                variants: ['', '', '', '']
            }
            let pollDates = Array.from(document.getElementsByClassName('poll-date'));
            pollDates.forEach(pollDate => {
                pollDate.addEventListener('change', () => {
                    let days = parseInt(document.getElementById('poll-days').value);
                    let hours = parseInt(document.getElementById('poll-hours').value);
                    let minutes = parseInt(document.getElementById('poll-minutes').value);
                    if(days === 0 && hours === 0 && minutes === 0) {
                        days = 1;
                        document.getElementById('poll-days').value = 1;
                    }
                    pollToUpload.duration_minutes = days * 1440 + hours * 60 + minutes;
                }, { passive: true });
            });
            pollVariants.forEach(pollVariant => {
                pollVariant.addEventListener('change', () => {
                    pollToUpload.variants[(+pollVariant.dataset.variant) - 1] = pollVariant.value;
                }, { passive: true });
            });
            document.getElementById('poll-remove').addEventListener('click', () => {
                document.getElementById('new-tweet-poll').hidden = true;
                document.getElementById('new-tweet-poll').innerHTML = '';
                document.getElementById('new-tweet-poll').style.width = '0';
                pollToUpload = undefined;
            });
        } else {
            document.getElementById('new-tweet-poll').innerHTML = '';
            document.getElementById('new-tweet-poll').hidden = true;
            document.getElementById('new-tweet-poll').style.width = '0';
            pollToUpload = undefined;
        }
    });
    document.getElementById('new-tweet-media-div').addEventListener('click', () => {
        document.getElementById('new-tweet-poll').innerHTML = '';
        document.getElementById('new-tweet-poll').hidden = true;
        document.getElementById('new-tweet-poll').style.width = '0';
        pollToUpload = undefined;
        getMedia(mediaToUpload, tweetMediaList);
    });
    let selectedIndex = 0;
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
            if(newTweetUserSearch.children.length > 0) {
                if(selectedIndex < newTweetUserSearch.children.length - 1) {
                    selectedIndex++;
                    newTweetUserSearch.children[selectedIndex].classList.add('search-result-item-active');
                    newTweetUserSearch.children[selectedIndex - 1].classList.remove('search-result-item-active');
                } else {
                    selectedIndex = 0;
                    newTweetUserSearch.children[selectedIndex].classList.add('search-result-item-active');
                    newTweetUserSearch.children[newTweetUserSearch.children.length - 1].classList.remove('search-result-item-active');
                }
            }
            return;
        }
        if(e.key === 'ArrowUp') {
            if(newTweetUserSearch.children.length > 0) {
                if(selectedIndex > 0) {
                    selectedIndex--;
                    newTweetUserSearch.children[selectedIndex].classList.add('search-result-item-active');
                    newTweetUserSearch.children[selectedIndex + 1].classList.remove('search-result-item-active');
                } else {
                    selectedIndex = newTweetUserSearch.children.length - 1;
                    newTweetUserSearch.children[selectedIndex].classList.add('search-result-item-active');
                    newTweetUserSearch.children[0].classList.remove('search-result-item-active');
                }
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
                    <img width="16" height="16" class="search-result-item-avatar" src="${`${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`}">
                    <span class="search-result-item-name ${user.verified || user.id_str === '1708130407663759360' ? 'search-result-item-verified' : ''}">${user.name}</span>
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
                if(vars.enableTwemoji) twemoji.parse(newTweetUserSearch);
            });
        } else {
            newTweetUserSearch.innerHTML = '';
            newTweetUserSearch.hidden = true;
        }
        if (e.key === 'Enter') {
            if(e.ctrlKey) {
                document.getElementById('new-tweet-button').click();
            }
        }
    });
    if(localStorage.OTisBlueVerified) {
        document.getElementById('new-tweet-char').innerText = '0';
    }
    newTweetText.addEventListener('input', async e => {
        let charElement = document.getElementById('new-tweet-char');
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
    document.getElementById('new-tweet-text').addEventListener('paste', event => {
        let items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (index in items) {
            let item = items[index];
            if (item.kind === 'file') {
                let file = item.getAsFile();
                handleFiles([file], mediaToUpload, tweetMediaList);
            }
        }
    });
    document.getElementById('new-tweet-audience-input').addEventListener('change', e => {
        let val = e.target.value;
        if(val === 'everyone') {
            selectedCircle = undefined;
            document.getElementById('new-tweet-circle-people').hidden = true;
            document.getElementById('new-tweet-wcr-input').hidden = false;
        } else {
            let circle = circles.find(c => c.rest_id === val);
            selectedCircle = circle;
            document.getElementById('new-tweet-circle-people-count').innerText = circle.member_count;
            document.getElementById('new-tweet-circle-people').hidden = false;
            document.getElementById('new-tweet-wcr-input').hidden = true;
        }
    });
    document.getElementById('new-tweet-circle-edit').addEventListener('click', async () => {
        let modal = createModal(html`
            <div class="modal-top">
                <div class="circle-menu-selector">
                    <span class="larger nice-header circle-menu-selector-selected circle-menu-edit_members" style="float: left;margin-left: 14px;">${LOC.edit_members.message}</span>
                    <span class="larger nice-header circle-menu-search_people" style="float: left;margin-left: 14px;">${LOC.search_people.message}</span>
                </div>
                <br>
                <input type="text" class="circle-user-search" placeholder="${LOC.search_people.message}" style="width: 448px;margin-top:5px;display:none">
                <hr style="border-color:var(--border);border-bottom:none">
            </div>
            <br><br><br><br><br>
            <div class="circle-members" style="margin-top: -33px;"></div>
            <div class="circle-search" hidden></div>
        `);
        let circleMembers = modal.querySelector('.circle-members');
        let circleSearch = modal.querySelector('.circle-search');
        let userSearch = modal.querySelector('.circle-user-search');

        function renderMembers(members) {
            members.forEach(u => {
                let userElement = document.createElement('div');
                userElement.className = 'circle-user';
                userElement.innerHTML = html`
                    <a href="/${u.legacy.screen_name}" target="_blank" style="text-decoration:none!important">
                        <img class="new-message-user-avatar" src="${`${(u.legacy.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(u.legacy.id_str) % 7}_normal.png`): u.legacy.profile_image_url_https}`.replace("_normal", "_bigger")}" width="48" height="48">
                        <div class="new-message-user-text">
                            <b class="new-message-user-name">${escapeHTML(u.legacy.name)}</b>
                            <span class="new-message-user-screenname">@${u.legacy.screen_name}</span>
                            ${u.legacy.followed_by ? `<span class="follows-you-label">${LOC.follows_you.message}</span>` : ''}
                        </div>
                    </a>
                    <button class="nice-button circle-control-btn">${LOC.remove.message}</button>
                `;
                userElement.querySelector('.circle-control-btn').addEventListener('click', async () => {
                    await API.circle.removeUser(selectedCircle.id, selectedCircle.rest_id, u.id, u.legacy.id_str);
                    userElement.remove();
                    document.getElementById('new-tweet-circle-people-count').innerText = parseInt(document.getElementById('new-tweet-circle-people-count').innerText) - 1;
                });
                circleMembers.appendChild(userElement);
                if(vars.enableTwemoji) twemoji.parse(userElement);
            });
        }

        let members = await API.circle.getMembers(selectedCircle.rest_id);
        renderMembers(members);
        userSearch.addEventListener('keyup', async () => {
            let q = userSearch.value;
            let res = await API.search.trustedFriendsTypeahead(selectedCircle.rest_id, q);
            circleSearch.innerHTML = '';
            res.slice(0, 5).forEach(u => {
                let userElement = document.createElement('div');
                userElement.classList.add('circle-user');
                userElement.innerHTML = html`
                    <a href="/${u.legacy.screen_name}" target="_blank" style="text-decoration:none!important">
                        <img class="new-message-user-avatar" src="${`${(u.legacy.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(u.legacy.id_str) % 7}_normal.png`): u.legacy.profile_image_url_https}`.replace("_normal", "_bigger")}" width="48" height="48">
                        <div class="new-message-user-text">
                            <b class="new-message-user-name">${escapeHTML(u.legacy.name)}</b>
                            <span class="new-message-user-screenname">@${u.legacy.screen_name}</span>
                            ${u.legacy.followed_by ? `<span class="follows-you-label">${LOC.follows_you.message}</span>` : ''}
                        </div>
                    </a>
                    <button class="nice-button circle-control-btn">${u.is_trusted_friends_list_member ? LOC.remove.message : LOC.add.message}</button>
                `;
                userElement.querySelector('.circle-control-btn').addEventListener('click', async e => {
                    if(u.is_trusted_friends_list_member) {
                        await API.circle.removeUser(selectedCircle.id, selectedCircle.rest_id, u.id, u.rest_id);
                        e.target.innerText = LOC.add.message;
                        document.getElementById('new-tweet-circle-people-count').innerText = parseInt(document.getElementById('new-tweet-circle-people-count').innerText) - 1;
                    } else {
                        await API.circle.addUser(selectedCircle.id, selectedCircle.rest_id, u.rest_id);
                        e.target.innerText = LOC.remove.message;
                        document.getElementById('new-tweet-circle-people-count').innerText = parseInt(document.getElementById('new-tweet-circle-people-count').innerText) + 1;
                    }
                });
                circleSearch.appendChild(userElement);
                if(vars.enableTwemoji) twemoji.parse(userElement);
            });
        });

        modal.querySelector('.circle-menu-edit_members').addEventListener('click', async () => {
            modal.querySelector('.circle-menu-edit_members').classList.add('circle-menu-selector-selected');
            modal.querySelector('.circle-menu-search_people').classList.remove('circle-menu-selector-selected');
            modal.querySelector('.circle-search').hidden = true;
            circleMembers.innerHTML = '';
            circleMembers.hidden = false;
            userSearch.style.display = 'none';
            let members = await API.circle.getMembers(selectedCircle.rest_id);
            renderMembers(members);
        });
        modal.querySelector('.circle-menu-search_people').addEventListener('click', async () => {
            modal.querySelector('.circle-menu-search_people').classList.add('circle-menu-selector-selected');
            modal.querySelector('.circle-menu-edit_members').classList.remove('circle-menu-selector-selected');
            circleMembers.hidden = true;
            userSearch.style.display = 'block';
            modal.querySelector('.circle-search').hidden = false;
        });
    });
    newTweetButton.addEventListener('click', async () => {
        let tweet = document.getElementById('new-tweet-text').value;
        if (tweet.length === 0 && mediaToUpload.length === 0) return;
        newTweetButton.disabled = true;
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
        let card;
        if(pollToUpload) {
            let pollVariants = pollToUpload.variants.filter(i => i);
            if(pollVariants.length < 2) {
                document.getElementById('new-tweet-button').disabled = false;
                return alert(LOC.must2variants.message);
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
            card = await API.tweet.createCard(cardObject);
        }
        try {
            let variables = {
                "tweet_text": tweet,
                "media": {
                    "media_entities": [],
                    "possibly_sensitive": false
                },
                "withDownvotePerspective": false,
                "withReactionsMetadata": false,
                "withReactionsPerspective": false,
                "withSuperFollowsTweetFields": true,
                "withSuperFollowsUserFields": true,
                "semantic_annotation_ids": [],
                "dark_request": false
            };
            if(card) {
                variables.card_uri = card.card_uri;
            }
            if(selectedCircle) {
                variables.trusted_friends_control_options = { "trusted_friends_list_id": selectedCircle.rest_id };
            } else {
                let whoCanReply = document.getElementById('new-tweet-wcr-input').value;
                if(whoCanReply === 'follows') {
                    variables.conversation_control = { mode: 'Community' };
                } else if(whoCanReply === 'mentions') {
                    variables.conversation_control = { mode: 'ByInvitation' };
                }
            }
            if(uploadedMedia.length > 0) {
                variables.media.media_entities = uploadedMedia.map(i => ({media_id: i, tagged_users: []}));
            }
            if(typeof scheduleTime === 'number') {
                let variables2 = {
                    execute_at: +scheduleTime.toString().slice(0, -3),
                    post_tweet_request: {
                        auto_populate_reply_metadata: false,
                        exclude_reply_user_ids: [],
                        media_ids: [],
                        status: tweet
                    }
                };
                if(uploadedMedia.length > 0) {
                    variables2.post_tweet_request.media_ids = uploadedMedia;
                }
                await API.tweet.postScheduled({
                    variables: variables2,
                    queryId: "LCVzRQGxOaGnOnYH01NQXg"
                });
                scheduleTime = undefined;
                newTweetButton.innerText = LOC.tweet.message;
                newTweetButton.disabled = false;
                document.getElementById('new-tweet-audience-input').disabled = false;
                document.getElementById('new-tweet-wcr-input').disabled = false;
                document.getElementById('new-tweet-poll-btn').classList.remove('poll-disabled');
                schedule.style.display = 'none';
                scheduleInput.value = '';
                createModal(html`
                    <span style="color:var(--almost-black);font-size:14px">${LOC.scheduled_success.message}</span><br><br>
                    <a href="/compose/tweet/unsent/scheduled?newtwitter=true" target="_blank"><button class="nice-button">${LOC.see_scheduled.message}</button></a>
                `);
            } else {
                if(timeline.toBeUpdated > 0) {
                    let newTweetsButton = document.getElementById('new-tweets');
                    newTweetsButton.click();
                }
                let whoCanReply = document.getElementById('new-tweet-wcr-input').value;
                let tweetObject = await API.tweet.postV2({
                    text: tweet,
                    media: uploadedMedia,
                    circle: selectedCircle ? selectedCircle.rest_id : undefined,
                    conversation_control: whoCanReply,
                    card_uri: card ? card.card_uri : undefined
                });
                timeline.data.unshift(tweetObject);
                appendTweet(tweetObject, document.getElementById('timeline'), {
                    prepend: true,
                    bigFont: tweetObject.full_text.length < 75
                });
            }
        } catch (e) {
            console.error(e);
            alert(e);
        }
        document.getElementById('new-tweet-text').value = "";
        document.getElementById('new-tweet-char').innerText = localStorage.OTisBlueVerified ? '0' : '0/280';
        document.getElementById('new-tweet-media-c').innerHTML = "";
        mediaToUpload = [];
        pollToUpload = undefined;
        document.getElementById('new-tweet-poll').innerHTML = '';
        document.getElementById('new-tweet-poll').style.width = '0';
        document.getElementById('new-tweet-poll').hidden = true;
        document.getElementById('new-tweet-focused').hidden = true;
        let firstTweet = document.getElementsByClassName('tweet')[0];
        if(firstTweet) {
            let ta = firstTweet.getElementsByClassName('tweet-translate-after')[0];
            if(ta) {
                ta.style.marginRight = '-20px';
            }
        }
        document.getElementById('new-tweet-audience').hidden = true;
        document.getElementById('new-tweet-char').hidden = true;
        document.getElementById('new-tweet-text').classList.remove('new-tweet-text-focused');
        document.getElementById('new-tweet-media-div').classList.remove('new-tweet-media-div-focused');
        newTweetButton.disabled = false;
        setTimeout(fixTweetThreadLine, 100);
    });
    newTweetText.addEventListener('blur', () => {
        newTweetText.dataset.blurSince = Date.now();
    });
    newTweetText.addEventListener('focus', () => {
        delete newTweetText.dataset.blurSince;
    });

    function createManageSearchesModal() {
        let modal = createModal(html`
            <h3 class="nice-header">${LOC.manage_searches.message}</h3><br>
            <div class="manage-searches-list"></div>
            <h3 class="nice-header" style="margin-bottom:5px">${LOC.add_search.message}</h3><br>
            <input type="text" id="add-search-input" placeholder="${LOC.search.message}">
            <button class="nice-button" id="add-search-btn" style="padding: 4.5px 10px;vertical-align: middle;">${LOC.add.message}</button>
        `, 'manage-searches-modal');
        let list = modal.querySelector('.manage-searches-list');
        chrome.storage.sync.get(['pinnedSearches'], data => {
            if(!data.pinnedSearches) data.pinnedSearches = [];
            data.pinnedSearches.sort((a, b) => a.localeCompare(b));
            data.pinnedSearches.forEach(search => {
                let searchElement = document.createElement('div');
                searchElement.className = 'manage-searches-item';
                searchElement.innerHTML = html`
                    <span class="manage-searches-item-text">${escapeHTML(search)}</span>
                    <button class="nice-button manage-searches-item-remove">${LOC.remove.message}</button>
                `;
                searchElement.querySelector('.manage-searches-item-remove').addEventListener('click', async () => {
                    let pinnedSearches = await new Promise(resolve => {
                        chrome.storage.sync.get(['pinnedSearches'], data => {
                            if(!data.pinnedSearches) data.pinnedSearches = [];
                            resolve(data.pinnedSearches);
                        });
                    });
                    pinnedSearches.splice(pinnedSearches.indexOf(search), 1);
                    chrome.storage.sync.set({pinnedSearches});
                    searchElement.remove();
                    document.getElementById('timeline-type-right').querySelector(`option[value="search-${search}"]`).remove();
                    document.getElementById('timeline-type-center').querySelector(`option[value="search-${search}"]`).remove();
                });
                list.appendChild(searchElement);
            });
        });
        let input = modal.querySelector('#add-search-input');
        let button = modal.querySelector('#add-search-btn');
        button.disabled = true;
        input.addEventListener('keyup', e => {
            button.disabled = input.value.length === 0;
            if(e.key === 'Enter') {
                button.click();
            }
        });
        button.addEventListener('click', async () => {
            let search = input.value;
            let pinnedSearches = await new Promise(resolve => {
                chrome.storage.sync.get(['pinnedSearches'], data => {
                    if(!data.pinnedSearches) data.pinnedSearches = [];
                    resolve(data.pinnedSearches);
                });
            });
            if(pinnedSearches.includes(search)) {
                return;
            }
            pinnedSearches.push(search);
            chrome.storage.sync.set({pinnedSearches});
            let option = document.createElement('option');
            option.value = `search-${search}`;
            option.innerText = `${LOC.search.message} - ${search}`;
            input.value = '';
            button.disabled = true;
            document.getElementById('timeline-type-right').querySelector('option[value="manage-searches"]').before(option);
            document.getElementById('timeline-type-center').querySelector('option[value="manage-searches"]').before(option.cloneNode(true));
            chrome.storage.sync.set({
                timelineType: `search-${search}`
            }, () => {});
            let searchElement = document.createElement('div');
            searchElement.className = 'manage-searches-item';
            searchElement.innerHTML = html`
                <span class="manage-searches-item-text">${escapeHTML(search)}</span>
                <button class="nice-button manage-searches-item-remove">${LOC.remove.message}</button>
            `;
            searchElement.querySelector('.manage-searches-item-remove').addEventListener('click', async () => {
                let pinnedSearches = await new Promise(resolve => {
                    chrome.storage.sync.get(['pinnedSearches'], data => {
                        if(!data.pinnedSearches) data.pinnedSearches = [];
                        resolve(data.pinnedSearches);
                    });
                });
                pinnedSearches.splice(pinnedSearches.indexOf(search), 1);
                chrome.storage.sync.set({pinnedSearches});
                searchElement.remove();
                document.getElementById('timeline-type-right').querySelector(`option[value="search-${search}"]`).remove();
                document.getElementById('timeline-type-center').querySelector(`option[value="search-${search}"]`).remove();
            });
            list.appendChild(searchElement);
        });
    }

    document.getElementById('timeline-type-right').value = vars.timelineType;
    document.getElementById('timeline-type-center').value = vars.timelineType;
    document.getElementById('timeline-type-right').addEventListener('change', e => {
        if(e.target.value === 'manage-searches') {
            e.target.value = vars.timelineType;
            createManageSearchesModal();
            return;
        }
        chrome.storage.sync.set({
            timelineType: e.target.value
        }, () => {
            vars.timelineType = e.target.value;
            document.getElementById('timeline-type-center').value = vars.timelineType;
            timeline.data = [];
            timeline.dataToUpdate = [];
            timeline.toBeUpdated = 0;
            seenThreads = [];
            seenTweets = [];
            cursorBottom = undefined;
            cursorTop = undefined;

            window.scrollTo(0, 0);
            renderNewTweetsButton();
            updateTimeline();
        });
    })
    document.getElementById('timeline-type-center').addEventListener('change', e => {
        if(e.target.value === 'manage-searches') {
            e.target.value = vars.timelineType;
            createManageSearchesModal();
            return;
        }
        chrome.storage.sync.set({
            timelineType: e.target.value
        }, () => {
            vars.timelineType = e.target.value;
            document.getElementById('timeline-type-right').value = vars.timelineType;
            timeline.data = [];
            timeline.dataToUpdate = [];
            timeline.toBeUpdated = 0;
            seenThreads = [];
            seenTweets = [];
            cursorBottom = undefined;
            cursorTop = undefined;

            window.scrollTo(0, 0);
            renderNewTweetsButton();
            updateTimeline();
        });
    });
    API.list.getMyLists().then(lists => {
        let timelineTypeRight = document.getElementById('timeline-type-right');
        let timelineTypeCenter = document.getElementById('timeline-type-center');
        if(lists.length > 0) {
            let optgroup = document.createElement('optgroup');
            optgroup.label = LOC.lists.message;
            lists.sort((a, b) => a.name.localeCompare(b.name));
            for(let i in lists) {
                let option = document.createElement('option');
                option.value = `list-${lists[i].id_str}`;
                option.innerText = `${LOC.list.message} - ${lists[i].name}`;
                optgroup.appendChild(option);
            }
            timelineTypeRight.appendChild(optgroup);
            timelineTypeCenter.appendChild(optgroup.cloneNode(true));
    
            if(vars.timelineType.startsWith('list-')) {
                timelineTypeRight.value = vars.timelineType;
                timelineTypeCenter.value = vars.timelineType;
            }
        }
        let optgroup = document.createElement('optgroup');
        optgroup.label = LOC.search.message;
        chrome.storage.sync.get(['pinnedSearches'], data => {
            if(!data.pinnedSearches) data.pinnedSearches = [];
            data.pinnedSearches.sort((a, b) => a.localeCompare(b));
            for(let i in data.pinnedSearches) {
                let option = document.createElement('option');
                option.value = `search-${data.pinnedSearches[i]}`;
                option.innerText = `${LOC.search.message} - ${data.pinnedSearches[i].slice(0, 40)}${data.pinnedSearches[i].length > 40 ? '...' : ''}`;
                optgroup.appendChild(option);
            }
            let addOption = document.createElement('option');
            addOption.value = 'manage-searches';
            addOption.innerText = LOC.manage_searches.message + '...';
            optgroup.appendChild(addOption);

            timelineTypeRight.appendChild(optgroup);
            timelineTypeCenter.appendChild(optgroup.cloneNode(true));

            if(vars.timelineType.startsWith('search-')) {
                timelineTypeRight.value = vars.timelineType;
                timelineTypeCenter.value = vars.timelineType;
            }
        }); 
    });


    // Update dates every minute & unfocus tweet composer
    setInterval(() => {
        let newTweetText = document.getElementById('new-tweet-text');
        if(newTweetText && newTweetText.className && newTweetText.className.includes('new-tweet-text-focused') && newTweetText.dataset.blurSince && Date.now() - (+newTweetText.dataset.blurSince) > 55000) {
            document.getElementById('new-tweet-focused').hidden = true;
            let firstTweet = document.getElementsByClassName('tweet')[0];
            if(firstTweet) {
                let ta = firstTweet.getElementsByClassName('tweet-translate-after')[0];
                if(ta) {
                    ta.style.marginRight = '-20px';
                }
            }
            document.getElementById('new-tweet-audience').hidden = true;
            document.getElementById('new-tweet-char').hidden = true;
            document.getElementById('new-tweet-text').classList.remove('new-tweet-text-focused');
            document.getElementById('new-tweet-media-div').classList.remove('new-tweet-media-div-focused');
        }
        let tweetDates = Array.from(document.getElementsByClassName('tweet-time'));
        let tweetQuoteDates = Array.from(document.getElementsByClassName('tweet-time-quote'));
        let all = [...tweetDates, ...tweetQuoteDates];
        all.forEach(date => {
            date.innerText = timeElapsed(+date.dataset.timestamp);
        });
    }, 60000);
    
    // custom events
    document.addEventListener('newTweet', e => {
        let tweet = e.detail;
        appendTweet(tweet, document.getElementById('timeline'), { prepend: true, bigFont: tweet.full_text.length < 75 });
        setTimeout(fixTweetThreadLine, 100);
    });
    document.getElementById('home').addEventListener('click', e => {
        if(document.documentElement.scrollTop > 500) {
            e.preventDefault();
            window.scrollTo(0, 0);
        }
    });

    if(location.hash === "#dm") {
        setTimeout(() => {
            document.getElementById('messages').click();
        }, 1000);
    } else if(location.hash.startsWith("#?")) {
        try {
            let params = Object.fromEntries(new URLSearchParams(location.hash.slice(1)));
            if(params.text) setTimeout(() => {
                location.hash = '';
                document.getElementById('navbar-tweet-button').click();
                setTimeout(() => {
                    document.getElementsByClassName('navbar-new-tweet-text')[0].value = `${params.text}${params.url ? '\n\n' + params.url : ''}`.trim();
                }, 10);
            }, 1000);
        } catch(e) {
            console.error(e);
        }
    }
    let weirdFonts = ["Monaco", "Courier", "Courier New", "Segoe Print", "Segoe Script", "Consolas", "MV Boli", "MingLiU-ExtB"];
    if(weirdFonts.includes(vars.font)) {
        let style = document.createElement('style');
        style.innerText = /*css*/`
            @media screen and (max-width: 590px) {
                #new-tweet-text {
                    width: calc(100% - 94px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    

    // Run
    updateUserData();
    updateCircles();
    updateTimeline();
    renderDiscovery();
    renderTrends();
    setInterval(updateUserData, 60000 * 3);
    let timer = 0;
    setInterval(() => {
        if(!vars.timelineType.startsWith('chrono')) {
            // don't waste precious API calls
            if(timer === 0) {
                timer = 1;
            } else {
                timer = 0;
                updateTimeline('prepend');
            }
        } else {
            updateTimeline('prepend');
        }
    }, 80000);
    if(vars.timelineType.startsWith('chrono')) {
        setInterval(async () => {
            let tweets = (await API.timeline.getChronologicalV2()).list;
            for(let i = 0; i < timeline.dataToUpdate.length; i++) {
                let tweet = timeline.dataToUpdate[i];
                let newTweet = tweets.find(t => t.id_str === tweet.id_str);
                if(newTweet) {
                    timeline.dataToUpdate[i] = newTweet;
                }
            }
        }, 60000 * 3);
    }
    setInterval(() => renderDiscovery(false), 60000 * 5);
    setInterval(renderTrends, 60000 * 5);
}, 50);