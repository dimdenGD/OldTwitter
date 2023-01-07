let user = {};
let cursor = null;
let end = false;
let linkColors = {};
let activeTweet;
// /i/topics/1397001890898989057
let topicId = location.pathname.split('/')[3];

function updateUserData() {
    API.verifyCredentials().then(async u => {
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
    document.getElementById('user-avatar').src = user.profile_image_url_https.replace("_normal", "_400x400");
    document.getElementById('wtf-viewall').href = `https://mobile.twitter.com/i/connect_people?user_id=${user.id_str}`;
    document.getElementById('user-avatar-link').href = `https://twitter.com/${user.screen_name}`;
    document.getElementById('user-info').href = `https://twitter.com/${user.screen_name}`;

    if(vars.enableTwemoji) twemoji.parse(document.getElementById('user-name'));
}
async function renderTopic(cursorRn) {
    let [topic] = await Promise.all([
        API.topicLandingPage(topicId, cursorRn)
    ]);

    document.getElementsByTagName('title')[0].innerText = `"${topic.header.topic.name}" Topic - OldTwitter`;
    document.getElementById("topic-name").innerText = topic.header.topic.name;
    document.getElementById("topic-description").innerText = topic.header.topic.description;
    if(topic.header.topic.not_interested) {
        document.getElementById("topic-not-interested").hidden = false;
        document.getElementById("topic-interested").hidden = true;
    } else {
        document.getElementById("topic-not-interested").hidden = true;
        document.getElementById("topic-interested").hidden = false;
    }
    if(topic.header.topic.following) {
        document.getElementById('topic-not-interested-btn').hidden = true;
        document.getElementById('topic-follow-control').innerText = LOC.following.message;
        document.getElementById('topic-follow-control').classList.add("topic-following");
        document.getElementById('topic-follow-control').classList.remove("topic-follow");
    } else {
        document.getElementById('topic-not-interested-btn').hidden = false;
        document.getElementById('topic-follow-control').innerText = LOC.follow.message;
        document.getElementById('topic-follow-control').classList.add("topic-follow");
        document.getElementById('topic-follow-control').classList.remove("topic-following");
    }

    let entries = topic.body.timeline.instructions.find(i => i.type === "TimelineAddEntries").entries;
    cursor = entries.find(e => e.entryId.startsWith("cursor-bottom")).content.value;
    let tweets = entries.filter(e => e.entryId.startsWith('tweet-')).map(e => {
        let result = e.content.itemContent.tweet_results.result;
        if(!result || !result.legacy) return;
        result.legacy.id_str = result.rest_id;
        result.legacy.user = result.core.user_results.result;
        result.legacy.user.legacy.id_str = result.legacy.user.rest_id;
        result.legacy.user = result.legacy.user.legacy;
        return result.legacy;
    }).filter(i => !!i);

    let tl = document.getElementById("timeline");
    for(let i in tweets) {
        await appendTweet(tweets[i], tl, {
            bigFont: tweets[i].full_text.length < 75
        });
    }
}

let lastScroll = Date.now();
let loadingNewTweets = false;
let lastTweetDate = 0;

setTimeout(async () => {
    if(!vars) {
        await loadVars();
    }
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
                if(e.target.className.includes('tweet tweet-id-')) {
                    activeTweet.getElementsByClassName('tweet-interact-more-menu-download')[0].click();
                }
            }
        });
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
                        if(newVideo && !newVideo.ended) {
                            newVideo.play();
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
            await renderTopic(cursor);
            setTimeout(() => {
                loadingNewTweets = false;
            }, 250);
        }
    }, { passive: true });

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
    document.getElementById('topic-not-interested-btn').addEventListener('click', async () => {
        try {
            await API.topicNotInterested(topicId);
        } catch(e) {
            console.error(e);
            alert(e);
            return;
        }
        document.getElementById("topic-not-interested").hidden = false;
        document.getElementById("topic-interested").hidden = true;
    });
    document.getElementById('topic-not-interested-cancel').addEventListener('click', async () => {
        try {
            await API.topicUndoNotInterested(topicId);
        } catch(e) {
            console.error(e);
            alert(e);
            return;
        }
        document.getElementById("topic-not-interested").hidden = true;
        document.getElementById("topic-interested").hidden = false;
    });
    document.getElementById('topic-follow-control').addEventListener('click', async e => {
        if(e.target.className.includes('topic-following')) {
            try {
                await API.topicUnfollow(topicId);
            } catch(e) {
                console.error(e);
                alert(e);
                return;
            }
            document.getElementById('topic-follow-control').classList.remove('topic-following');
            document.getElementById('topic-follow-control').classList.add('topic-follow');
            document.getElementById('topic-follow-control').innerText = LOC.follow.message;
            document.getElementById('topic-not-interested-btn').hidden = false;
        } else {
            try {
                await API.topicFollow(topicId);
            } catch(e) {
                console.error(e);
                alert(e);
                return;
            }
            document.getElementById('topic-follow-control').classList.remove('topic-follow');
            document.getElementById('topic-follow-control').classList.add('topic-following');
            document.getElementById('topic-follow-control').innerText = LOC.following.message;
            document.getElementById('topic-not-interested-btn').hidden = true;
        }
    });
    
    // Run
    updateUserData();
    renderDiscovery();
    renderTrends();
    renderTopic();
    document.getElementById('loading-box').hidden = true;
    setInterval(updateUserData, 60000 * 3);
    setInterval(() => renderDiscovery(false), 60000 * 15);
    setInterval(renderTrends, 60000 * 5);
}, 50);