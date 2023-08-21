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

async function createShamelessPlug(firstTime = true) {
    let dimden = await API.user.getV2('dimdenEFF');
    if(!dimden.following) {
        let opened = Date.now();
        let modal = createModal(/*html*/`
            <h2 style="margin:0;margin-bottom:10px;color:var(--darker-gray);font-weight:300">Shameless plug</h2>
            <span style="font-size:14px;color:var(--default-text-color)">
                ${firstTime ? LOC.thank_you.message.replace('$AT1$', "<a target=\"_blank\" href=\"https://twitter.com/old/settings\">").replace('$AT2$', "</a>") : LOC.thank_you2.message.replace('$AT1$', "<a target=\"_blank\" href=\"https://dimden.dev/donate/\">").replace('$AT2$', "</a>")}<br><br>
                <a href="https://twitter.com/dimdenEFF">${LOC.follow_mb.message} 👉👈</a><br><br>
                <div class="dimden">
                    <img style="float:left" src="${dimden.profile_image_url_https.replace("_normal", "_bigger")}" width="48" height="48" alt="dimden" class="tweet-avatar">
                    <a class="dimden-text" href="https://twitter.com/dimdenEFF" style="vertical-align:top;margin-left:10px;">
                        <b class="tweet-header-name">${dimden.name}</b>
                        <span class="tweet-header-handle">@${dimden.screen_name}</span>
                    </a><br>
                    <button class="nice-button follow" style="margin-left:10px;margin-top:5px;">${LOC.follow.message}</button>
                </div>
            </span>
        `, 'shameless-plug', () => {}, () => Date.now() - opened > 1750);
        let followButton = modal.querySelector('.follow');
        followButton.addEventListener('click', () => {
            API.user.follow('dimdenEFF').then(() => {
                alert(LOC.thank_you_follow.message);
                modal.removeModal();
            }).catch(e => {
                console.error(e);
                location.href = 'https://twitter.com/dimdenEFF';
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
                createModal(/*html*/`
                    <h2 style="margin:0;margin-bottom:10px;color:var(--darker-gray);font-weight:300">(OldTwitter) ${LOC.new_version.message} - ${chrome.runtime.getManifest().version}</h2>
                    <span id="changelog" style="font-size:14px;color:var(--default-text-color)">
                        <ul>
                            <li>Fixed tweet like/retweet/reply count not changing on action when 'Display the exact number of retweets, likes, followers, etc.' is disabled.</li>
                            <li>Improved "new tweets" button on homepage, it doesn't re-render entire page but only adds new tweets.</li>
                            <li>Replaced word 'post' with 'tweet'.</li>
                            <li>"Update timeline automatically on new tweets." option is no longer experimental due to 'new tweets' button improvement!</li>
                            <li>Fixed search input on mobile.</li>
                            <li>Fixed video view counts.</li>
                            <li>Made OldTwitter use low quality images when on mobile data (Chromium only).</li>
                            <li>Fixed Twitter embeds on other websites.</li>
                            <li>Made OldTwitter update tweet like/retweet/reply/view counts automatically.</li>
                            <li>Made tweet viewer use more space instead of wasting it.</li>
                            <li>Fixed username disappearing on scroll in profile.</li>
                            <li>Added quote translation length limit.</li>
                            <li>Fixed pressing enter with Japanese IME in search input initiating search.</li>
                            <li>Added Separate text button for tweet viewer too.</li>
                            <li>Fixed useless t.co links sometimes appearing.</li>
                        </ul>
                        <p style="margin-bottom:5px">
                            Want to support me? You can <a href="https://dimden.dev/donate" target="_blank">donate</a>, <a href="https://twitter.com/dimdenEFF" target="_blank">follow me</a> or <a href="https://chrome.google.com/webstore/detail/old-twitter-layout-2022/jgejdcdoeeabklepnkdbglgccjpdgpmf" target="_blank">leave a review</a>.<br>
                            Found some bug? Report it here: <a target="_blank" href="https://github.com/dimdenGD/OldTwitter/issues">https://github.com/dimdenGD/OldTwitter/issues</a>
                        </p>
                    </span>
                `, 'changelog-modal', () => {}, () => Date.now() - opened > 1250);
                let changelog = document.getElementById('changelog');
                let text = changelog.innerText;
                let lang = LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en";
                if(!lang.startsWith('en')) {
                    changelog.innerHTML += `<span class="tweet-translate">${LOC.view_translation.message}</span>`;
                    changelog.querySelector('.tweet-translate').addEventListener('click', () => {
                        openInNewTab('https://translate.google.com/?sl=en&tl=' + lang + '&text=' + encodeURIComponent(text) + '&op=translate');
                    });
                }
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
            window.location.href = "https://twitter.com/i/flow/login?newtwitter=true";
        }
        console.error(e);
    });
}
async function updateTimeline(mode = 'rewrite') {
    seenThreads = [];
    if (timeline.data.length === 0) {
        document.getElementById('timeline').innerHTML = ``;
        document.getElementById('tweets-loading').hidden = false;
        document.getElementById('load-more').hidden = true;
    }
    let fn, args = [];
    if(mode === 'prepend') {
        fn = API.timeline.getChronologicalV2;
        args.push(cursorTop);
    } else {
        switch(vars.timelineType) {
            case 'algo': fn = API.timeline.getAlgorithmicalV2; break;
            case 'chrono-retweets': fn = API.timeline.getChronologicalV2; break;
            case 'chrono-no-retweets': fn = API.timeline.getChronologicalV2; break;
            case 'chrono-social': fn = API.timeline.getMixed; args.push(seenAlgoTweets); break;
            default: fn = API.timeline.getChronologicalV2; break;
        }
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
    tl = tl.list;
    if(vars.timelineType === 'algo' || vars.timelineType === 'algov2') {
        for(let t of tl) {
            seenTweets.push(t.id_str);
        }
    } else if(vars.timelineType === 'chrono-retweets') {
        tl = tl.filter(t => t.retweeted_status);
    } else if(vars.timelineType === 'chrono-no-retweets') {
        tl = tl.filter(t => !t.retweeted_status);
    }
    if(!user.friends_count && tl.length === 0 && vars.timelineType.startsWith('chrono')) {
        document.getElementById('timeline').innerHTML = `<span style="color:var(--darker-gray);margin-top:10px;display:block">${LOC.no_tl_tweets.message}</span>`;
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
        renderTimeline({ mode: 'rewrite', data: tl });
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
    document.getElementById('user-tweets-div').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('user-following-div').href = `https://twitter.com/${user.screen_name}/following`;
    document.getElementById('user-followers-div').href = `https://twitter.com/${user.screen_name}/followers`;
    document.getElementById('user-banner').src = user.profile_banner_url ? user.profile_banner_url : 'https://abs.twimg.com/images/themes/theme1/bg.png';
    document.getElementById('user-avatar').src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`.replace("_normal", "_400x400");
    document.getElementById('wtf-viewall').href = `https://twitter.com/i/connect_people?newtwitter=true&user_id=${user.id_str}`;
    document.getElementById('user-avatar-link').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('user-info').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('new-tweet-avatar').src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`.replace("_normal", "_bigger");

    if(vars.enableTwemoji) twemoji.parse(document.getElementById('user-name'));

    document.getElementById('loading-box').hidden = true;

    if(document.getElementById('user-stats').clientWidth > 300) {
        let style = document.createElement('style');
        style.innerHTML = `.user-stat-div > h2 { font-size: 10px !important }`;
        document.head.appendChild(style);
    }
}

async function renderTimeline(options = {}) {
    if(!options.mode) options.mode = 'rewrite';
    if(!options.data) options.data = timeline.data;
    let timelineContainer = document.getElementById('timeline');
    if(options.mode === 'rewrite') timelineContainer.innerHTML = '';
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
                    text: `<a href="https://twitter.com/${t.user.screen_name}">${escapeHTML(t.user.name)}</a> ${LOC.retweeted.message}`,
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
    return true;
}
function renderNewTweetsButton() {
    if (timeline.toBeUpdated > 0) {
        document.getElementById("new-tweets-bug-fix").innerHTML = `
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
        document.getElementById("new-tweets-bug-fix").innerHTML = ``;
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
    let lastScroll = Date.now();
    document.addEventListener('scroll', async () => {
        lastScroll = Date.now();

        // loading new tweets
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            if (loadingNewTweets || timeline.data.length === 0) return;
            loadingNewTweets = true;
            document.getElementById('load-more').innerText = `${LOC.loading.message}...`;
            let tl;
            try {
                switch(vars.timelineType) {
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
        }
    }, { passive: true });

    // this isn't very useful with current rate limits
    // document.addEventListener('mousemove', e => {
    //     if(Date.now() - lastScroll > 10) {
    //         let t = e.target;
    //         let c = t.className;
    //         if(c.baseVal) return;
    //         if(t.className.includes('tweet ') || t.className === 'tweet-interact' || t.className === 'tweet-body' || t.className === 'tweet-media') {
    //             if(t.className.includes('tweet-view')) return;
    //             if(t.className === 'tweet-interact' || t.className === 'tweet-media') t = t.parentElement.parentElement;
    //             else if(t.className === 'tweet-body') t = t.parentElement;
    //             let id;
    //             try { id = t.className.split('id-')[1].split(' ')[0] } catch(e) { return };
    //             if(!tweetsToLoad[id]) tweetsToLoad[id] = 1;
    //             else tweetsToLoad[id]++;
    //             if(tweetsToLoad[id] === 10) {
    //                 API.tweet.getRepliesV2(id);
    //                 API.tweet.getLikers(id);
    //                 t.classList.add('tweet-preload');
    //                 console.log(`Preloading ${id}`);
    //             }
    //         }
    //     }
    // });

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
        return setTimeout(() => location.reload(), 500);
    }
    try {
        document.getElementById('new-tweets').addEventListener('click', () => {
            timeline.toBeUpdated = 0;
            timeline.data = [...timeline.dataToUpdate, ...timeline.data];
            renderNewTweetsButton();
            renderTimeline({mode: 'prepend', data: timeline.dataToUpdate });
            timeline.dataToUpdate = [];
        });
    } catch(e) {
        setTimeout(() => location.reload(), 500);
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
            tl = vars.timelineType === 'algo' ? await API.timeline.getAlgorithmical(cursorBottom, 50) : await API.timeline.getChronologicalV2(cursorBottom);
            cursorBottom = tl.cursorBottom;
            tl = tl.list.filter(t => !seenTweets.includes(t.id_str));
            for(let t of tl) {
                seenTweets.push(t.id_str);
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
            document.getElementById('new-tweet-poll').innerHTML = `
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
                userElement.innerHTML = `
                    <img width="16" height="16" class="search-result-item-avatar" src="${`${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`}">
                    <span class="search-result-item-name ${user.verified || user.id_str === '1123203847776763904' ? 'search-result-item-verified' : ''}">${user.name}</span>
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
    newTweetText.addEventListener('input', async e => {
        let charElement = document.getElementById('new-tweet-char');
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
        let modal = createModal(/*html*/`
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
                userElement.innerHTML = /*html*/`
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
                userElement.innerHTML = /*html*/`
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
                let mediaId = await API.uploadMedia({
                    media_type: media.type,
                    media_category: media.category,
                    media: media.data,
                    alt: media.alt,
                    cw: media.cw,
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
                    variables2.post_tweet_request.media_ids = uploadedMedia.map(i => i.media_id);
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
                createModal(`
                    <span style="color:var(--almost-black);font-size:14px">${LOC.scheduled_success.message}</span><br><br>
                    <a href="https://twitter.com/compose/tweet/unsent/scheduled?newtwitter=true" target="_blank"><button class="nice-button">${LOC.see_scheduled.message}</button></a>
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
        document.getElementById('new-tweet-char').innerText = '0/280';
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
    });
    newTweetText.addEventListener('blur', () => {
        newTweetText.dataset.blurSince = Date.now();
    });
    newTweetText.addEventListener('focus', () => {
        delete newTweetText.dataset.blurSince;
    });

    document.getElementById('timeline-type-right').value = vars.timelineType;
    document.getElementById('timeline-type-center').value = vars.timelineType;
    document.getElementById('timeline-type-right').addEventListener('change', e => {
        chrome.storage.sync.set({
            timelineType: e.target.value
        }, () => {
            vars.timelineType = e.target.value;
            document.getElementById('timeline-type-center').value = vars.timelineType;
            timeline.data = [];
            timeline.dataToUpdate = [];
            timeline.toBeUpdated = [];
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
        chrome.storage.sync.set({
            timelineType: e.target.value
        }, () => {
            vars.timelineType = e.target.value;
            document.getElementById('timeline-type-right').value = vars.timelineType;
            timeline.data = [];
            timeline.dataToUpdate = [];
            timeline.toBeUpdated = [];
            seenThreads = [];
            seenTweets = [];
            cursorBottom = undefined;
            cursorTop = undefined;

            window.scrollTo(0, 0);
            renderNewTweetsButton();
            updateTimeline();
        });
    })


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
    

    // Run
    updateUserData();
    updateCircles();
    updateTimeline();
    renderDiscovery();
    renderTrends();
    setInterval(updateUserData, 60000 * 3);
    if(vars.timelineType !== 'algo') setInterval(() => updateTimeline('prepend'), 30000);
    setInterval(() => renderDiscovery(false), 60000 * 5);
    setInterval(renderTrends, 60000 * 5);
}, 50);