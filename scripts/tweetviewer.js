class TweetViewer {
    constructor(user, tweetData) {
        let previousLocation = location.pathname + location.search;

        this.container = createModal(html`
            <div class="tweet-viewer-loading">
                <img src="${chrome.runtime.getURL(`images/loading.svg`)}" width="64" height="64">
            </div>
            <div class="timeline" hidden></div>
            <div class="retweets" class="box" hidden></div>
            <div class="retweets_with_comments" hidden></div>
            <div class="likes" class="box" hidden></div>
            <div class="timeline-more center-text" hidden>${LOC.load_more.message}</div>
            <div class="retweets-more center-text" hidden>${LOC.load_more.message}</div>
            <div class="retweets_with_comments-more center-text" hidden>${LOC.load_more.message}</div>
            <div class="likes-more center-text" hidden>${LOC.load_more.message}</div>
        `, 'tweet-viewer', () => {
            this.close();
            if((location.pathname + location.search) !== previousLocation) history.pushState({}, null, previousLocation);
        });
        this.tweetData = tweetData;
        this.id = tweetData.id_str;
        history.pushState({}, null, `/${tweetData.user.screen_name}/status/${this.id}`);

        this.user = user;
        this.loadingNewTweets = false;
        this.lastTweetDate = 0;
        this.activeTweet;
        this.pageData = {};
        this.tweets = [];
        this.cursor = undefined;
        this.mediaToUpload = [];
        this.excludeUserMentions = [];
        this.users = {};
        this.linkColors = {};
        this.likeCursor = undefined;
        this.retweetCursor = undefined;
        this.retweetCommentsCursor = undefined;
        this.seenReplies = [];
        this.mainTweetLikers = [];
        this.insertedMores = [];
        this.currentLocation = location.pathname;
        this.subpage = undefined;
        this.popstateHelper = undefined;
        this.scrollHelper = undefined;
        this.timelineElement = this.container.getElementsByClassName('timeline')[0];
        this.moreBtn = this.container.getElementsByClassName('timeline-more')[0];

        let event = new CustomEvent('clearActiveTweet');
        document.dispatchEvent(event);

        chrome.storage.sync.get(['viewedtweets'], (result) => {
            if(!result.viewedtweets) result.viewedtweets = [];
            result.viewedtweets.unshift(this.id);
            result.viewedtweets = [...new Set(result.viewedtweets)];
            while(result.viewedtweets.length >= 100) {
                result.viewedtweets.pop();
            }
            chrome.storage.sync.set({ viewedtweets: result.viewedtweets });
        });

        this.init();
    }
    async savePageData(path) {
        if(!path) {
            path = location.pathname.split('?')[0].split('#')[0];
            if(path.endsWith('/')) path = path.slice(0, -1);
        }
        this.pageData[path] = {
            linkColors: this.linkColors,
            cursor: this.cursor,
            likeCursor: this.likeCursor,
            retweetCursor: this.retweetCursor,
            retweetCommentsCursor: this.retweetCommentsCursor,
            mainTweetLikers: this.mainTweetLikers,
            seenReplies: this.seenReplies,
            tweets: this.tweets,
            scrollY: this.container.scrollTop
        }
        console.log(`Saving page: ${path}`, this.pageData[path]);
    }
    async restorePageData() {
        let path = location.pathname.split('?')[0].split('#')[0];
        if(path.endsWith('/')) path = path.slice(0, -1);
        if(this.pageData[path]) {
            console.log(`Restoring page: ${path}`, this.pageData[path]);
            this.linkColors = this.pageData[path].linkColors;
            this.cursor = this.pageData[path].cursor;
            this.likeCursor = this.pageData[path].likeCursor;
            this.retweetCursor = this.pageData[path].retweetCursor;
            this.retweetCommentsCursor = this.pageData[path].retweetCommentsCursor;
            this.mainTweetLikers = this.pageData[path].mainTweetLikers;
            this.seenReplies = [];
            this.tweets = [];
            this.container.getElementsByClassName('timeline-more')[0].hidden = !this.cursor;
            let tl = document.getElementsByClassName('timeline')[0];
            tl.innerHTML = '';
            for(let i in this.pageData[path].tweets) {
                let t = this.pageData[path].tweets[i];
                if(t[0] === 'tweet') {
                    await this.appendTweet(t[1], tl, t[2]);
                } else if(t[0] === 'compose') {
                    await this.appendComposeComponent(tl, t[1]);
                } else if(t[0] === 'tombstone') {
                    await this.appendTombstone(tl, t[1]);
                } else if(t[0] === 'showmore') {
                    await this.appendShowMore(tl, t[1], t[2]);
                }
            }
            let id = this.currentLocation.match(/status\/(\d{1,32})/)[1];
            if(id) {
                setTimeout(() => {
                    let tweet = this.container.querySelector(`div.tweet[data-tweet-id="${id}"]`);
                    if(tweet) {
                        tweet.scrollIntoView({ block: 'center' });
                    }
                }, 100);
            }
            if(this.subpage === 'retweets_with_comments' && this.retweetCommentsCursor) {
                this.container.getElementsByClassName('retweets_with_comments-more')[0].hidden = false;
            }
            this.loadingNewTweets = false;
            return this.pageData[path];
        } else {
            this.tweets = [];
            this.seenReplies = [];
        }
        this.loadingNewTweets = false;
        return false;
    }
    updateSubpage() {
        let path = location.pathname.slice(1);
        if(path.endsWith('/')) path = path.slice(0, -1);

        let tlDiv = document.getElementsByClassName('timeline')[0];
        let rtDiv = document.getElementsByClassName('retweets')[0];
        let rtwDiv = document.getElementsByClassName('retweets_with_comments')[0];
        let likesDiv = document.getElementsByClassName('likes')[0];
        let tlMore = document.getElementsByClassName('timeline-more')[0];
        let rtMore = document.getElementsByClassName('retweets-more')[0];
        let rtwMore = document.getElementsByClassName('retweets_with_comments-more')[0];
        let likesMore = document.getElementsByClassName('likes-more')[0];
        tlDiv.hidden = true; rtDiv.hidden = true; rtwDiv.hidden = true; likesDiv.hidden = true;
        tlMore.hidden = true; rtMore.hidden = true; rtwMore.hidden = true; likesMore.hidden = true;

        if(path.split('/').length === 3) {
            this.subpage = 'tweet';
            tlDiv.hidden = false;
        } else {
            if(path.endsWith('/retweets')) {
                this.subpage = 'retweets';
                rtDiv.hidden = false;
            } else if(path.endsWith('/likes')) {
                this.subpage = 'likes';
                likesDiv.hidden = false;
            } else if(path.endsWith('/retweets/with_comments')) {
                this.subpage = 'retweets_with_comments';
                rtwDiv.hidden = false;
            }
        }
    }
    async updateReplies(id, c) {
        let tvl = this.container.getElementsByClassName('tweet-viewer-loading')[0];
        if(!c) {
            tvl.hidden = false;
            document.getElementsByClassName('timeline')[0].innerHTML = '';
        }
        let tl, tweetLikers;
        try {
            let [tlData, tweetLikersData] = await Promise.allSettled([API.tweet.getRepliesV2(id, c), API.tweet.getLikers(id, undefined, 40)]);
            if(!tlData.value) {
                if(!c) {
                    tvl.hidden = true;
                    document.getElementsByClassName('timeline')[0].innerHTML = html`<span style="color:var(--almost-black)">${tlData.reason}</span>`;
                }
                this.cursor = undefined;
                return console.error(tlData.reason);
            }
            if(!tweetLikersData.value) {
                console.error(tweetLikersData.reason);
            }
            tl = tlData.value;
            for(let u in tl.users) {
                this.users[u] = tl.users[u];
            }
            if(tweetLikersData.value) tweetLikers = tweetLikersData.value;
            else tweetLikers = { list: [], cursor: undefined };
            this.loadingNewTweets = false;
            document.getElementsByClassName('timeline-more')[0].innerText = LOC.load_more.message;
        } catch(e) {
            document.getElementsByClassName('timeline-more')[0].innerText = LOC.load_more.message;
            this.loadingNewTweets = false;
            tvl.hidden = true;
            return this.cursor = undefined;
        }
    
        if(vars.linkColorsInTL) {
            let tlUsers = [];
            for(let i in tl.list) {
                let t = tl.list[i];
                if(t.type === 'tweet' || t.type === 'mainTweet') { if(!tlUsers.includes(t.data.user.id_str)) tlUsers.push(t.data.user.id_str); }
                else if(t.type === 'conversation') {
                    for(let j in t.data) {
                        tlUsers.push(t.data[j].user.id_str);
                    }
                }
            }
            tlUsers = tlUsers.filter(i => !this.linkColors[i]);
            let linkData = await getLinkColors(tlUsers);
            if(linkData) for(let i in linkData) {
                this.linkColors[linkData[i].id] = linkData[i].color;
            }
        }
    
        this.cursor = tl.cursor;
        if(!this.cursor) {
            this.container.getElementsByClassName('timeline-more')[0].hidden = true;
        } else {
            this.container.getElementsByClassName('timeline-more')[0].hidden = false;
        }
        let mainTweet;
        let mainTweetIndex = tl.list.findIndex(t => t.type === 'mainTweet');
        let tlContainer = this.container.getElementsByClassName('timeline')[0];
        if(!tlContainer) return;
        for(let i in tl.list) {
            let t = tl.list[i];
            if(t.type === 'mainTweet') {
                this.mainTweetLikers = tweetLikers.list;
                this.likeCursor = tweetLikers.cursor;
                if(i === 0) {
                    mainTweet = await this.appendTweet(t.data, tlContainer, {
                        mainTweet: true
                    });
                } else {
                    mainTweet = await this.appendTweet(t.data, tlContainer, {
                        noTop: true,
                        mainTweet: true
                    });
                }
                if(t.data.limited_actions !== "non_compliant") this.appendComposeComponent(tlContainer, t.data);
            }
            if(t.type === 'tweet') {
                await this.appendTweet(t.data, tlContainer, {
                    noTop: i !== 0 && i < mainTweetIndex,
                    threadContinuation: i < mainTweetIndex
                });
            } else if(t.type === 'conversation') {
                for(let i2 in t.data) {
                    let t2 = t.data[i2];
                    await this.appendTweet(t2, tlContainer, {
                        noTop: +i2 !== 0,
                        threadContinuation: +i2 !== t.data.length - 1,
                        threadButton: +i2 === t.data.length - 1,
                        threadId: t2.conversation_id_str
                    });
                }
            } else if(t.type === 'tombstone') {
                this.appendTombstone(tlContainer, t.data);
            } else if(t.type === 'showMore') {
                this.appendShowMore(tlContainer, t.data, id);
            }
        }
        if(mainTweet) mainTweet.scrollIntoView();
        if(tvl) tvl.hidden = true;
        return true;
    }
    async updateLikes(id, c) {
        let tvl = this.container.getElementsByClassName('tweet-viewer-loading')[0];
        if(tvl) tvl.hidden = false;
        let tweetLikers;
        if(!c && this.mainTweetLikers.length > 0) {
            tweetLikers = this.mainTweetLikers;
        } else {
            try {
                tweetLikers = await API.tweet.getLikers(id, c, 40);
                this.likeCursor = tweetLikers.cursor;
                tweetLikers = tweetLikers.list;
                if(!c) this.mainTweetLikers = tweetLikers;
            } catch(e) {
                console.error(e);
                if(tvl) tvl.hidden = true;
                return this.likeCursor = undefined;
            }
        }
        let likeDiv = document.getElementsByClassName('likes')[0];
    
        if(!c) {
            likeDiv.innerHTML = '';
            let tweetData = await API.tweet.getV2(id);
            let tweet = await this.appendTweet(tweetData, likeDiv, {
                mainTweet: true
            });
            tweet.style.borderBottom = '1px solid var(--border)';
            tweet.style.marginBottom = '10px';
            tweet.style.borderRadius = '5px';
            let h1 = document.createElement('h1');
            h1.innerText = vars.heartsNotStars ? LOC.liked_by.message : LOC.favorited_by.message;
            h1.className = 'cool-header';
            likeDiv.appendChild(h1);
        }
        if(!this.likeCursor || tweetLikers.length === 0) {
            this.container.getElementsByClassName('likes-more')[0].hidden = true;
        } else {
            this.container.getElementsByClassName('likes-more')[0].hidden = false;
        }
    
        for(let i in tweetLikers) {
            appendUser(tweetLikers[i], likeDiv);
        }

        if(tvl) tvl.hidden = true;
    }
    async updateRetweets(id, c) {
        let tvl = this.container.getElementsByClassName('tweet-viewer-loading')[0];
        tvl.hidden = false;
        let tweetRetweeters;
        try {
            tweetRetweeters = await API.tweet.getRetweeters(id, c);
            this.retweetCursor = tweetRetweeters.cursor;
            tweetRetweeters = tweetRetweeters.list;
        } catch(e) {
            console.error(e);
            return this.retweetCursor = undefined;
        }
        let retweetDiv = document.getElementsByClassName('retweets')[0];
    
        if(!c) {
            retweetDiv.innerHTML = '';
            let tweetData = await API.tweet.getV2(id);
            let tweet = await this.appendTweet(tweetData, retweetDiv, {
                mainTweet: true
            });
            tweet.style.borderBottom = '1px solid var(--border)';
            tweet.style.marginBottom = '10px';
            tweet.style.borderRadius = '5px';
            let h1 = document.createElement('h1');
            h1.innerHTML = html`${LOC.retweeted_by.message} (<a href="/${tweetData.user.screen_name}/status/${id}/retweets/with_comments">${LOC.see_quotes.message}</a>)`;
            h1.className = 'cool-header';
            retweetDiv.appendChild(h1);
            h1.getElementsByTagName('a')[0].addEventListener('click', async e => {
                e.preventDefault();
                history.pushState({}, null, `/${tweetData.user.screen_name}/status/${id}/retweets/with_comments`);
                this.updateSubpage();
                this.mediaToUpload = [];
                this.excludeUserMentions = [];
                this.linkColors = {};
                this.cursor = undefined;
                this.seenReplies = [];
                this.mainTweetLikers = [];
                let tid = location.pathname.match(/status\/(\d{1,32})/)[1];
                this.updateRetweetsWithComments(tid);
                this.currentLocation = location.pathname;
            });
        }
        if(!this.retweetCursor) {
            this.container.getElementsByClassName('retweets-more')[0].hidden = true;
        } else {
            this.container.getElementsByClassName('retweets-more')[0].hidden = false;
        }
    
        for(let i in tweetRetweeters) {
            let u = tweetRetweeters[i];
            let retweetElement = document.createElement('div');
            retweetElement.classList.add('following-item');
            retweetElement.innerHTML = html`
            <div>
                <a href="/${u.screen_name}" class="following-item-link">
                    <img src="${(u.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(u.id_str) % 7}_normal.png`): u.profile_image_url_https}" alt="${u.screen_name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                    <div class="following-item-text">
                        <span class="tweet-header-name following-item-name">${escapeHTML(u.name)}</span><br>
                        <span class="tweet-header-handle">@${u.screen_name}</span>
                        ${u.followed_by ? `<span class="follows-you-label">${LOC.follows_you.message}</span>` : ''}
                    </div>
                </a>
            </div>
            <div>
                <button class="following-item-btn nice-button ${u.following ? 'following' : 'follow'}">${u.following ? LOC.following_btn.message : LOC.follow.message}</button>
            </div>`;
    
            let followButton = retweetElement.querySelector('.following-item-btn');
            followButton.addEventListener('click', async () => {
                if (followButton.classList.contains('following')) {
                    await API.user.unfollow(u.screen_name);
                    followButton.classList.remove('following');
                    followButton.classList.add('follow');
                    followButton.innerText = LOC.follow.message;
                } else {
                    await API.user.follow(u.screen_name);
                    followButton.classList.remove('follow');
                    followButton.classList.add('following');
                    followButton.innerText = LOC.following_btn.message;
                }
            });
    
            retweetDiv.appendChild(retweetElement);
        }

        tvl.hidden = true;
    }
    async updateRetweetsWithComments(id, c) {
        let tvl = this.container.getElementsByClassName('tweet-viewer-loading')[0];
        tvl.hidden = false;
        let tweetRetweeters;
        let tweetData = await API.tweet.getV2(id);
        try {
            tweetRetweeters = await API.tweet.getQuotes(id, c);
            this.retweetCommentsCursor = tweetRetweeters.cursor;
            tweetRetweeters = tweetRetweeters.list;
        } catch(e) {
            console.error(e);
            tvl.hidden = true;
            this.container.getElementsByClassName('retweets_with_comments-more')[0].innerText = LOC.load_more.message;
            return this.retweetCommentsCursor = undefined;
        }
        let retweetDiv = document.getElementsByClassName('retweets_with_comments')[0];
    
        if(!c) {
            retweetDiv.innerHTML = '';
            let h1 = document.createElement('h1');
            h1.innerHTML = html`${LOC.quote_tweets.message} (<a href="/${tweetData.user.screen_name}/status/${id}/retweets">${LOC.see_retweets.message}</a>)`;
            h1.className = 'cool-header';
            retweetDiv.appendChild(h1);
            h1.getElementsByTagName('a')[0].addEventListener('click', async e => {
                e.preventDefault();
                let t = await API.tweet.getV2(id);
                history.pushState({}, null, `/${tweetData.user.screen_name}/status/${id}/retweets`);
                this.updateSubpage();
                this.mediaToUpload = [];
                this.excludeUserMentions = [];
                this.linkColors = {};
                this.cursor = undefined;
                this.seenReplies = [];
                this.mainTweetLikers = [];
                let tid = location.pathname.match(/status\/(\d{1,32})/)[1];
                this.updateRetweets(tid);
                this.currentLocation = location.pathname;
            });
        }
        if(!this.retweetCommentsCursor || tweetRetweeters.length === 0) {
            this.container.getElementsByClassName('retweets_with_comments-more')[0].hidden = true;
        } else {
            this.container.getElementsByClassName('retweets_with_comments-more')[0].hidden = false;
        }
        this.container.getElementsByClassName('retweets_with_comments-more')[0].innerText = LOC.load_more.message;
    
        for(let i in tweetRetweeters) {
            await this.appendTweet(tweetRetweeters[i], retweetDiv);
        }

        tvl.hidden = true;
    }
    async appendComposeComponent(container, replyTweet) {
        if(!replyTweet) return;
        this.tweets.push(['compose', replyTweet]);

        let mentions = replyTweet.full_text.match(/@([\w+]{1,15})/g);
        if(mentions) {
            mentions = mentions.map(m => m.slice(1).trim());
        } else {
            mentions = [];
        }

        let replyMessage;
        if(LOC.reply_to.message.includes("$SCREEN_NAME$")) {
            replyMessage = LOC.reply_to.message.replace("$SCREEN_NAME$", replyTweet.user.screen_name);
        } else {
            replyMessage = `${LOC.reply_to.message} @${replyTweet.user.screen_name}`;
        }

        let el = document.createElement('div');
        el.className = 'new-tweet-container';
        el.innerHTML = html`
            <div class="new-tweet-view box">
                <img width="35" height="35" class="tweet-avatar new-tweet-avatar">
                <span class="new-tweet-char" hidden>${localStorage.OTisBlueVerified ? '0' : '0/280'}</span>
                <textarea class="new-tweet-text" placeholder="${replyMessage}" maxlength="25000"></textarea>
                <div class="new-tweet-user-search box" hidden></div>
                <div class="new-tweet-media-div" title="${LOC.add_media.message}">
                    <span class="new-tweet-media"></span>
                </div>
                <div class="new-tweet-focused" hidden>
                    <span class="new-tweet-emojis" title="${LOC.emoji.message}"></span>
                    ${mentions.length > 0 ? html`<span class="new-tweet-mentions" title="${LOC.mentions.message}"></span>` : ''}
                    <div class="new-tweet-media-cc"><div class="new-tweet-media-c"></div></div>
                    <button class="new-tweet-button nice-button" style="margin-right: -32px;">${LOC.tweet.message}</button>
                    <br><br>
                </div>
            </div>`;
        container.append(el);
        document.getElementsByClassName('new-tweet-avatar')[0].src = `${(this.user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(this.user.id_str) % 7}_normal.png`): this.user.profile_image_url_https}`.replace("_normal", "_bigger");
        document.getElementsByClassName('new-tweet-view')[0].addEventListener('click', async () => {
            document.getElementsByClassName('new-tweet-focused')[0].hidden = false;
            document.getElementsByClassName('new-tweet-char')[0].hidden = false;
            document.getElementsByClassName('new-tweet-text')[0].classList.add('new-tweet-text-focused');
            document.getElementsByClassName('new-tweet-media-div')[0].classList.add('new-tweet-media-div-focused');
        });
        if(mentions.length > 0) {
            for(let i = 0; i < mentions.length; i++) {
                let u = Object.values(this.users).find(u => u.screen_name === mentions[i]);
                if(!u) {
                    if(mentions[i] === this.user.screen_name) {
                        u = this.user;
                    } else if(typeof pageUser !== 'undefined' && mentions[i] === pageUser.screen_name) {
                        u = pageUser;
                    } else {
                        try {
                            u = await API.user.get(mentions[i], false);
                        } catch(e) {
                            console.error(e);
                            continue;
                        }
                    }
                }
                if(!u) continue;
                this.users[u.id_str] = u;
            }
            document.getElementsByClassName('new-tweet-button')[0].style = 'margin-right: -50px;';
            document.getElementsByClassName("new-tweet-mentions")[0].addEventListener('click', async () => {
                let modal = createModal(html`
                    <div id="new-tweet-mentions-modal" style="color:var(--almost-black)">
                        <h3 class="nice-header">${LOC.replying_to.message}</h3>
                        <div class="new-tweet-mentions-modal-item">
                            <input type="checkbox" id="new-tweet-mentions-modal-item-${replyTweet.user.screen_name}" checked disabled>
                            <label for="new-tweet-mentions-modal-item-${replyTweet.user.screen_name}">${replyTweet.user.name} (@${replyTweet.user.screen_name})</label>
                        </div>
                        ${mentions.map(m => {
                            let u = Object.values(this.users).find(u => u.screen_name === m);
                            if(!u) return '';
                            return html`
                            <div class="new-tweet-mentions-modal-item">
                                <input type="checkbox" data-user-id="${u.id_str}" id="new-tweet-mentions-modal-item-${m}"${this.excludeUserMentions.includes(u.id_str) ? '' : ' checked'}${this.user.screen_name === m ? ' hidden' : ''}>
                                <label for="new-tweet-mentions-modal-item-${m}"${this.user.screen_name === m ? ' hidden' : ''}>${u.name} (@${m})</label>
                            </div>
                        `}).join('\n')}
                        <br>
                        <div style="display:inline-block;float: right;">
                            <button class="nice-button" id="new-tweet-mentions-modal-button">${LOC.save.message}</button>
                        </div>
                    </div>
                `);
                document.getElementById('new-tweet-mentions-modal-button').addEventListener('click', () => {
                    let excluded = [];
                    document.querySelectorAll('#new-tweet-mentions-modal input[type="checkbox"]').forEach(c => {
                        if(!c.checked) excluded.push(c.dataset.userId);
                    });
                    this.excludeUserMentions = excluded;
                    console.log(this.excludeUserMentions);
                    modal.removeModal();
                });
            });
        }

        let mediaList = document.getElementsByClassName('new-tweet-media-c')[0];

        let mediaObserver = new MutationObserver(async () => {
            if(mediaList.children.length > 0) {
                newTweetButton.style.marginRight = '4px';
            } else {
                newTweetButton.style.marginRight = mentions.length > 0 ? '-50px' : '-32px';
            }
        });
        mediaObserver.observe(mediaList, {childList: true});
        
        document.getElementsByClassName('new-tweet-view')[0].addEventListener('drop', e => {
            handleDrop(e, this.mediaToUpload, mediaList);
        });
        document.getElementsByClassName('new-tweet-media-div')[0].addEventListener('click', async () => {
            getMedia(this.mediaToUpload, mediaList);
        });
        let newTweetUserSearch = document.getElementsByClassName("new-tweet-user-search")[0];
        let newTweetText = document.getElementsByClassName('new-tweet-text')[0];
        let newTweetButton = document.getElementsByClassName('new-tweet-button')[0];
        let selectedIndex = 0;
        newTweetText.addEventListener('paste', event => {
            let items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (let index in items) {
                let item = items[index];
                if (item.kind === 'file') {
                    let file = item.getAsFile();
                    handleFiles([file], this.mediaToUpload, document.getElementsByClassName('new-tweet-media-c')[0]);
                }
            }
        });
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
                if(selectedIndex < newTweetUserSearch.children.length - 1) {
                    selectedIndex++;
                    newTweetUserSearch.children[selectedIndex].classList.add('search-result-item-active');
                    newTweetUserSearch.children[selectedIndex - 1].classList.remove('search-result-item-active');
                } else {
                    selectedIndex = 0;
                    newTweetUserSearch.children[selectedIndex].classList.add('search-result-item-active');
                    newTweetUserSearch.children[newTweetUserSearch.children.length - 1].classList.remove('search-result-item-active');
                }
                return;
            }
            if(e.key === 'ArrowUp') {
                if(selectedIndex > 0) {
                    selectedIndex--;
                    newTweetUserSearch.children[selectedIndex].classList.add('search-result-item-active');
                    newTweetUserSearch.children[selectedIndex + 1].classList.remove('search-result-item-active');
                } else {
                    selectedIndex = newTweetUserSearch.children.length - 1;
                    newTweetUserSearch.children[selectedIndex].classList.add('search-result-item-active');
                    newTweetUserSearch.children[0].classList.remove('search-result-item-active');
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
                        <img width="16" height="16" class="search-result-item-avatar" src="${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}">
                        <span class="search-result-item-name ${user.verified ? 'search-result-item-verified' : ''}">${escapeHTML(user.name)}</span>
                        <span class="search-result-item-screen-name">@${user.screen_name}</span>
                    `;
                    userElement.addEventListener('click', () => {
                        newTweetText.value = newTweetText.value.split("@").slice(0, -1).join('@').split(" ").slice(0, -1).join(" ") + ` @${user.screen_name} `;
                        if(newTweetText.value.startsWith(" ")) newTweetText.value = newTweetText.value.slice(1);
                        if(newTweetText.value.length > 280) newTweetText.value = newTweetText.value.slice(0, 280);
                        newTweetText.focus();
                        newTweetUserSearch.innerHTML = '';
                        newTweetUserSearch.hidden = true;
                    });
                    newTweetUserSearch.appendChild(userElement);
                });
            } else {
                newTweetUserSearch.innerHTML = '';
                newTweetUserSearch.hidden = true;
            }
        });
        newTweetText.addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.ctrlKey) {
                document.getElementsByClassName('new-tweet-button')[0].click();
            }
        });
        newTweetText.addEventListener('input', e => {
            let charElement = document.getElementsByClassName('new-tweet-char')[0];
            let tweet = twttr.txt.parseTweet(e.target.value);
            if(localStorage.OTisBlueVerified) {
                return charElement.innerText = `${tweet.weightedLength}`;
            }
            charElement.innerText = `${tweet.weightedLength}/280`;
            if(tweet.weightedLength > 265) {
                charElement.style.color = "#c26363";
            } else {
                charElement.style.color = "";
            }
            if (tweet.weightedLength > 280) {
                charElement.style.color = "red";
                newTweetButton.disabled = true;
            } else {
                newTweetButton.disabled = false;
            }
        });
        document.getElementsByClassName('new-tweet-emojis')[0].addEventListener('click', () => {
            createEmojiPicker(document.getElementsByClassName('new-tweet-emojis')[0], newTweetText, {
                marginLeft: '-300px'
            });
        });
        newTweetButton.addEventListener('click', async () => {
            let tweet = document.getElementsByClassName('new-tweet-text')[0].value;
            if (tweet.length === 0 && this.mediaToUpload.length === 0) return;
            document.getElementsByClassName('new-tweet-button')[0].disabled = true;
            let uploadedMedia = [];
            for (let i in this.mediaToUpload) {
                let media = this.mediaToUpload[i];
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
                    for(let j in this.mediaToUpload) {
                        let media = this.mediaToUpload[j];
                        media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = true;
                        media.div.getElementsByClassName('new-tweet-media-img-progress')[0].innerText = '';
                    }
                    document.getElementsByClassName('new-tweet-button')[0].disabled = false;
                    return; // cancel tweeting
                }
            }
            let tweetObject = {
                status: tweet,
                in_reply_to_status_id: replyTweet.id_str,
            };
            if(this.excludeUserMentions.length > 0) tweetObject.exclude_reply_user_ids = this.excludeUserMentions.join(',');
            if (uploadedMedia.length > 0) {
                tweetObject.media_ids = uploadedMedia.join(',');
            }
            try {
                let tweet = await API.tweet.postV2(tweetObject);
                tweet._ARTIFICIAL = true;
                this.appendTweet(tweet, document.getElementsByClassName('timeline')[0], {
                    after: document.getElementsByClassName('new-tweet-view')[0].parentElement
                });
            } catch (e) {
                document.getElementsByClassName('new-tweet-button')[0].disabled = false;
                console.error(e);
            }
            document.getElementsByClassName('new-tweet-text')[0].value = "";
            document.getElementsByClassName('new-tweet-media-c')[0].innerHTML = "";
            this.mediaToUpload = [];
            this.excludeUserMentions = [];
            document.getElementsByClassName('new-tweet-focused')[0].hidden = true;
            document.getElementsByClassName('new-tweet-char')[0].hidden = true;
            document.getElementsByClassName('new-tweet-text')[0].classList.remove('new-tweet-text-focused');
            document.getElementsByClassName('new-tweet-media-div')[0].classList.remove('new-tweet-media-div-focused');
            document.getElementsByClassName('new-tweet-button')[0].disabled = false;
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
    }
    async appendShowMore(container, data, id) {
        if(this.insertedMores.includes(data.cursor)) return;
        this.tweets.push(['showmore', data, id]);
        this.insertedMores.push(data.cursor);
        let div = document.createElement('div');
        div.className = 'show-more';
        div.innerHTML = html`
            <button class="show-more-button center-text">${data.labelText ? data.labelText : data.actionText}</button>
        `;
        let loading = false;
        div.querySelector('.show-more-button').addEventListener('click', async () => {
            if(loading) return;
            loading = true;
            div.children[0].innerText = LOC.loading_tweets.message;
            await this.updateReplies(id, data.cursor);
            div.remove();
            this.tweets = this.tweets.filter(t => t[0] !== 'showmore' || t[1].cursor !== data.cursor);
        });
        container.appendChild(div);
    }
    // what dumbfuck thought having 2 almost identical functions was a good idea (me)
    async appendTweet(t, timelineContainer, options = {}) {
        if(this.seenReplies.includes(t.id_str)) return;

        // verification
        if(t.user.ext_verified_type) {
            t.user.verified_type = t.user.ext_verified_type;
            t.user.verified = true;
        }
        if(vars.twitterBlueCheckmarks && t.user.ext && t.user.ext.isBlueVerified && t.user.ext.isBlueVerified.r && t.user.ext.isBlueVerified.r.ok) {
            t.user.verified_type = "Blue";
            t.user.verified = true;
        }
        if(t.user.ext && t.user.ext.verifiedType && t.user.ext.verifiedType.r && t.user.ext.verifiedType.r.ok) {
            t.user.verified_type = t.user.ext.verifiedType.r.ok;
            t.user.verified = true;
        }
        if(!vars.twitterBlueCheckmarks && t.user.verified_type === "Blue") {
            delete t.user.verified_type;
            t.user.verified = false;
        }
        if(t.quoted_status) {
            if(t.quoted_status.user.verified_type === "Blue" && !vars.twitterBlueCheckmarks) {
                delete t.quoted_status.user.verified_type;
                t.quoted_status.user.verified = false;
            }
        }
        this.tweets.push(['tweet', t, options]);
        this.seenReplies.push(t.id_str);
        const tweet = document.createElement('div');
        tweet.tweet = t;
        t.options = options;
        t.element = tweet;
        if(!options.mainTweet) {
            tweet.addEventListener('click', async e => {
                let selection = window.getSelection();
                if(selection.toString().length > 0 && selection.focusNode && selection.focusNode.closest(`div.tweet[data-tweet-id="${t.id_str}"]`)) {
                    return;
                }
                if (!e.target.closest(".tweet-button") && !e.target.closest(".tweet-body-text-span") && !e.target.closest(".tweet-edit-section") && !e.target.closest(".dropdown-menu") && !e.target.closest(".tweet-media-element") && !e.target.closest("a") && !e.target.closest("button")) {
                    this.savePageData();
                    history.pushState({}, null, `/${t.user.screen_name}/status/${t.id_str}`);
                    this.updateSubpage();
                    this.mediaToUpload = [];
                    this.excludeUserMentions = [];
                    this.linkColors = {};
                    this.cursor = undefined;
                    this.seenReplies = [];
                    this.mainTweetLikers = [];
                    let restored = await this.restorePageData();
                    let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                    if(this.subpage === 'tweet' && !restored) {
                        this.updateReplies(id);
                    } else if(this.subpage === 'likes') {
                        this.updateLikes(id);
                    } else if(this.subpage === 'retweets') {
                        this.updateRetweets(id);
                    } else if(this.subpage === 'retweets_with_comments') {
                        this.updateRetweetsWithComments(id);
                    }
                    this.currentLocation = location.pathname;
                }
            });
            tweet.addEventListener('mousedown', e => {
                if(e.button === 1) {
                    // tweet-media-element is clickable, since it should open the tweet in a new tab.
                    if(!e.target.closest(".tweet-button") && !e.target.closest(".tweet-edit-section") && !e.target.closest(".dropdown-menu") && !e.target.closest("a") && !e.target.closest("button")) {
                        e.preventDefault();
                        openInNewTab(`/${t.user.screen_name}/status/${t.id_str}`);
                    }
                }
            });
        }
        tweet.tabIndex = -1;
        tweet.className = `tweet tweet-view ${options.mainTweet ? 'tweet-main' : 'tweet-replying'}`;
        if(!this.activeTweet) {
            tweet.classList.add('tweet-active');
            this.activeTweet = tweet;
        }
        if (options.threadContinuation) tweet.classList.add('tweet-self-thread-continuation');
        if (options.noTop) tweet.classList.add('tweet-no-top');
        if(vars.linkColorsInTL) {
            if(this.linkColors[t.user.id_str]) {
                let sc = makeSeeableColor(this.linkColors[t.user.id_str]);
                tweet.style.setProperty('--link-color', sc);
                if (vars.alwaysShowLinkColor) tweet.classList.add('colour');
            } else {
                if(t.user.profile_link_color && t.user.profile_link_color !== '1DA1F2') {
                    let sc = makeSeeableColor(t.user.profile_link_color);
                    tweet.style.setProperty('--link-color', sc);
                    if (vars.alwaysShowLinkColor) tweet.classList.add('colour');
                }
            }
        }
        let full_text = t.full_text ? t.full_text : '';
        let isMatchingLanguage = languageMatches(t.lang);
        let isQuoteMatchingLanguage = !!t.quoted_status && languageMatches(t.quoted_status.lang);
        let videos = t.extended_entities && t.extended_entities.media && t.extended_entities.media.filter(m => m.type === 'video');
        if(!videos || videos.length === 0) {
            videos = undefined;
        }
        if(videos) {
            for(let v of videos) {
                if(!v.video_info) continue;
                v.video_info.variants = v.video_info.variants.sort((a, b) => {
                    if(!b.bitrate) return -1;
                    return b.bitrate-a.bitrate;
                });
                if(typeof(vars.savePreferredQuality) !== 'boolean') {
                    chrome.storage.sync.set({
                        savePreferredQuality: true
                    }, () => {});
                    vars.savePreferredQuality = true;
                }
                if(localStorage.preferredQuality && vars.savePreferredQuality) {
                    let closestQuality = v.video_info.variants.filter(v => v.bitrate).reduce((prev, curr) => {
                        return (Math.abs(parseInt(curr.url.match(/\/(\d+)x/)[1]) - parseInt(localStorage.preferredQuality)) < Math.abs(parseInt(prev.url.match(/\/(\d+)x/)[1]) - parseInt(localStorage.preferredQuality)) ? curr : prev);
                    });
                    let preferredQualityVariantIndex = v.video_info.variants.findIndex(v => v.url === closestQuality.url);
                    if(preferredQualityVariantIndex !== -1) {
                        let preferredQualityVariant = v.video_info.variants[preferredQualityVariantIndex];
                        v.video_info.variants.splice(preferredQualityVariantIndex, 1);
                        v.video_info.variants.unshift(preferredQualityVariant);
                    }
                } else if(window.navigator && navigator.connection && navigator.connection.type === 'cellular' && !vars.disableDataSaver) {
                    let lowestQuality = v.video_info.variants.filter(v => v.bitrate).reduce((prev, curr) => {
                        return (parseInt(curr.bitrate) < parseInt(prev.bitrate) ? curr : prev);
                    });
                    let lowestQualityVariantIndex = v.video_info.variants.findIndex(v => v.url === lowestQuality.url);
                    if(lowestQualityVariantIndex !== -1) {
                        let lowestQualityVariant = v.video_info.variants[lowestQualityVariantIndex];
                        v.video_info.variants.splice(lowestQualityVariantIndex, 1);
                        v.video_info.variants.unshift(lowestQualityVariant);
                    }
                }
            }
        }
        if(t.withheld_in_countries && (t.withheld_in_countries.includes("XX") || t.withheld_in_countries.includes("XY"))) {
            full_text = "";
        }
        if(t.quoted_status_id_str && !t.quoted_status && options.mainTweet) { //t.quoted_status is undefined if the user blocked the quoter (this also applies to deleted/private tweets too, but it just results in original behavior then)
            try {
                if(t.quoted_status_result && t.quoted_status_result.result.tweet) {
                    t.quoted_status = t.quoted_status_result.result.tweet.legacy;
                    t.quoted_status.user = t.quoted_status_result.result.tweet.core.user_results.result.legacy;
                } else {
                    t.quoted_status = await API.tweet.getV2(t.quoted_status_id_str);
                }
            } catch {
                t.quoted_status = undefined;
            }
        }
        let followUserText, unfollowUserText, blockUserText, unblockUserText;
        let mentionedUserText = ``;
        let quoteMentionedUserText = ``;
        if(
            LOC.follow_user.message.includes('$SCREEN_NAME$') && LOC.unfollow_user.message.includes('$SCREEN_NAME$') &&
            LOC.block_user.message.includes('$SCREEN_NAME$') && LOC.unblock_user.message.includes('$SCREEN_NAME$')
        ) {
            followUserText = `${LOC.follow_user.message.replace('$SCREEN_NAME$', t.user.screen_name)}`;
            unfollowUserText = `${LOC.unfollow_user.message.replace('$SCREEN_NAME$', t.user.screen_name)}`;
            blockUserText = `${LOC.block_user.message.replace('$SCREEN_NAME$', t.user.screen_name)}`;
            unblockUserText = `${LOC.unblock_user.message.replace('$SCREEN_NAME$', t.user.screen_name)}`;
        } else {
            followUserText = `${LOC.follow_user.message} @${t.user.screen_name}`;
            unfollowUserText = `${LOC.unfollow_user.message} @${t.user.screen_name}`;
            blockUserText = `${LOC.block_user.message} @${t.user.screen_name}`;
            unblockUserText = `${LOC.unblock_user.message} @${t.user.screen_name}`;
        }
        if(t.in_reply_to_screen_name && t.display_text_range) {
            t.entities.user_mentions.forEach(user_mention => {
                if(user_mention.indices[0] < t.display_text_range[0]){
                    mentionedUserText += `<a href="/${user_mention.screen_name}">@${user_mention.screen_name}</a> `
                }
                 //else this is not reply but mention
            });
        }
        if(t.quoted_status && t.quoted_status.in_reply_to_screen_name && t.display_text_range) {
            t.quoted_status.entities.user_mentions.forEach(user_mention => {
                if(user_mention.indices[0] < t.display_text_range[0]){
                    quoteMentionedUserText += `@${user_mention.screen_name} `
                }
                //else this is not reply but mention
            });
        }
        console.log(t);
        tweet.innerHTML = html`
            <div class="tweet-top" hidden></div>
            <a class="tweet-avatar-link" href="/${t.user.screen_name}"><img onerror="this.src = '${`${vars.useOldDefaultProfileImage ? chrome.runtime.getURL(`images/default_profile_images/default_profile_bigger.png`) : 'https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png'}`}'" src="${`${(t.user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(t.user.id_str) % 7}_normal.png`): t.user.profile_image_url_https}`.replace("_normal.", "_bigger.")}" alt="${t.user.name}" class="tweet-avatar" width="48" height="48"></a>
            <div class="tweet-header ${options.mainTweet ? 'tweet-header-main' : ''}">
                <a class="tweet-header-info ${options.mainTweet ? 'tweet-header-info-main' : ''}" href="/${t.user.screen_name}">
                    <b ${t.user.id_str === '1708130407663759360' ? 'title="Old Twitter Layout extension developer" ' : ''}class="tweet-header-name ${options.mainTweet ? 'tweet-header-name-main' : ''} ${t.user.verified || t.user.verified_type ? 'user-verified' : t.user.id_str === '1708130407663759360' ? 'user-verified user-verified-dimden' : ''} ${t.user.protected ? 'user-protected' : ''} ${t.user.verified_type === 'Government' ? 'user-verified-gray' : t.user.verified_type === 'Business' ? 'user-verified-yellow' : t.user.verified_type === 'Blue' ? 'user-verified-blue' : ''}">${escapeHTML(t.user.name)}</b>
                    <span class="tweet-header-handle">@${t.user.screen_name}</span>
                </a>
                ${options.mainTweet && t.user.id_str !== user.id_str ? `<button class='nice-button tweet-header-follow ${t.user.following ? 'following' : 'follow'}'>${t.user.following ? LOC.following_btn.message : LOC.follow.message}</button>` : ''}
            </div>
            <a ${options.mainTweet ? 'hidden' : ''} class="tweet-time" data-timestamp="${new Date(t.created_at).getTime()}" title="${new Date(t.created_at).toLocaleString()}" href="/${t.user.screen_name}/status/${t.id_str}">${timeElapsed(new Date(t.created_at).getTime())}</a>
            <article class="tweet-body ${options.mainTweet ? 'tweet-body-main' : ''}">
                <div class="tweet-body-text ${vars.noBigFont || (full_text && full_text.length > 100) || !options.mainTweet ? 'tweet-body-text-long' : 'tweet-body-text-short'}">
                    <span class="tweet-body-text-span">${vars.useOldStyleReply ? /*html*/mentionedUserText: ''}${full_text ? await renderTweetBodyHTML(t) : ''}</span>
                </div>
                ${!isMatchingLanguage ? html`
                <br>
                <span class="tweet-button tweet-translate">${LOC.view_translation.message}</span>
                ` : ``}
                ${t.extended_entities && t.extended_entities.media ? html`
                    <div class="tweet-media">
                    ${t.extended_entities.media.length === 1 && t.extended_entities.media[0].type === 'video' ? html`
                            <div class="tweet-media-video-overlay tweet-button">
                                <svg viewBox="0 0 24 24" class="tweet-media-video-overlay-play">
                                    <g>
                                        <path class="svg-play-path" d="M8 5v14l11-7z"></path>
                                        <path d="M0 0h24v24H0z" fill="none"></path>
                                    </g>
                                </svg>
                            </div>
                        ` : ''}
                        ${renderMedia(t)}
                    </div>
                    ${t.extended_entities && t.extended_entities.media && t.extended_entities.media.some(m => m.type === 'animated_gif') ? `<div class="tweet-media-controls">GIF</div>` : ''}
                    ${videos ? html`
                        <div class="tweet-media-controls">
                            ${videos[0].ext && videos[0].ext.mediaStats && videos[0].ext.mediaStats.r && videos[0].ext.mediaStats.r.ok ? `<span class="tweet-video-views">${Number(videos[0].ext.mediaStats.r.ok.viewCount).toLocaleString().replace(/\s/g, ',')} ${LOC.views.message}</span> • ` : ''}<span class="tweet-video-reload tweet-button">${LOC.reload.message}</span> •
                            ${videos[0].video_info.variants.filter(v => v.bitrate).map(v => `<span class="tweet-video-quality tweet-button" data-url="${v.url}">${v.url.match(/\/(\d+)x/)[1] + 'p'}</span> `).join(" / ")}
                        </div>
                    ` : ``}
                    <span class="tweet-media-data"></span>
                ` : ``}
                ${t.card ? `<div class="tweet-card"></div>` : ''}
                ${t.quoted_status ? html`
                <a class="tweet-body-quote" href="/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}">
                    <img src="${(t.quoted_status.user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(t.quoted_status.user.id_str) % 7}_normal.png`): t.quoted_status.user.profile_image_url_https}" alt="${escapeHTML(t.quoted_status.user.name)}" class="tweet-avatar-quote" width="24" height="24">
                    <div class="tweet-header-quote">
                        <span class="tweet-header-info-quote">
                        <b class="tweet-header-name-quote ${t.quoted_status.user.verified || t.quoted_status.user.id_str === '1708130407663759360' ? 'user-verified' : ''} ${t.quoted_status.user.verified_type === 'Government' ? 'user-verified-gray' : t.quoted_status.user.verified_type === 'Business' ? 'user-verified-yellow' : t.quoted_status.user.verified_type === 'Blue' ? 'user-verified-blue' : ''} ${t.quoted_status.user.protected ? 'user-protected' : ''}">${escapeHTML(t.quoted_status.user.name)}</b>
                        <span class="tweet-header-handle-quote">@${t.quoted_status.user.screen_name}</span>
                        </span>
                    </div>
                    <span class="tweet-time-quote" data-timestamp="${new Date(t.quoted_status.created_at).getTime()}" title="${new Date(t.quoted_status.created_at).toLocaleString()}">${timeElapsed(new Date(t.quoted_status.created_at).getTime())}</span>
                    ${quoteMentionedUserText !== `` && !vars.useOldStyleReply ? html`
                    <span class="tweet-reply-to tweet-quote-reply-to">${LOC.replying_to_user.message.replace('$SCREEN_NAME$', quoteMentionedUserText.trim().replaceAll(` `, LOC.replying_to_comma.message).replace(LOC.replying_to_comma.message, LOC.replying_to_and.message))}</span>
                    ` : ''}
                    <span class="tweet-body-text tweet-body-text-quote tweet-body-text-long" style="color:var(--default-text-color)!important">${vars.useOldStyleReply? quoteMentionedUserText : ''}${t.quoted_status.full_text ? await renderTweetBodyHTML(t, true) : ''}</span>
                    ${t.quoted_status.extended_entities && t.quoted_status.extended_entities.media ? html`
                    <div class="tweet-media-quote">
                        ${t.quoted_status.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escapeHTML(m.ext_alt_text)}" title="${escapeHTML(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${quoteSizeFunctions[t.quoted_status.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${quoteSizeFunctions[t.quoted_status.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'disableRemotePlayback controls' : ''} ${m.type === 'animated_gif' ? 'disableRemotePlayback loop muted' : ''}${m.type === 'animated_gif' && !vars.disableGifAutoplay ? ' autoplay' : ''} src="${m.type === 'photo' ? m.media_url_https + (vars.showOriginalImages && (m.media_url_https.endsWith('.jpg') || m.media_url_https.endsWith('.png')) ? '?name=orig' : window.navigator && navigator.connection && navigator.connection.type === 'cellular' && !vars.disableDataSaver ? '?name=small' : '') : m.video_info.variants.find(v => v.content_type === 'video/mp4').url}" class="tweet-media-element tweet-media-element-quote ${m.type === 'animated_gif' ? 'tweet-media-element-quote-gif' : ''} ${mediaClasses[t.quoted_status.extended_entities.media.length]} ${!vars.displaySensitiveContent && t.quoted_status.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'photo' ? '' : '</video>'}`).join('\n')}
                    </div>
                    ` : ''}
                    ${!isQuoteMatchingLanguage ? html`
                    <span class="tweet-button tweet-quote-translate">${LOC.view_translation.message}</span>
                    ` : ``}
                </a>
                ` : ``}
                ${t.limited_actions === 'limit_trusted_friends_tweet' && options.mainTweet ? `
                <div class="tweet-limited">
                    ${LOC.circle_limited_tweet.message}
                    <a href="https://help.twitter.com/en/using-twitter/twitter-circle" target="_blank">${LOC.learn_more.message}</a>
                </div>
                `.replace('$SCREEN_NAME$', tweet.trusted_circle_owner ? tweet.trusted_circle_owner : tweetStorage[t.conversation_id_str] ? tweetStorage[t.conversation_id_str].user.screen_name : t.in_reply_to_screen_name ? t.in_reply_to_screen_name : t.user.screen_name) : ''}
                ${t.tombstone ? `<div class="tweet-warning">${t.tombstone}</div>` : ''}
                ${((t.withheld_in_countries && (t.withheld_in_countries.includes("XX") || t.withheld_in_countries.includes("XY"))) || t.withheld_scope) ? `<div class="tweet-warning">This Tweet has been withheld in response to a report from the copyright holder. <a href="https://help.twitter.com/en/rules-and-policies/copyright-policy" target="_blank">Learn more.</a></div>` : ''}
                ${t.conversation_control ? `<div class="tweet-warning">${t.limited_actions_text ? t.limited_actions_text : LOC.limited_tweet.message}${t.conversation_control.policy && (t.user.id_str === user.id_str || (t.conversation_control.policy.toLowerCase() === 'community' && (t.user.followed_by || (full_text && full_text.includes(`@${user.screen_name}`)))) || (t.conversation_control.policy.toLowerCase() === 'by_invitation' && full_text && full_text.includes(`@${user.screen_name}`))) ? ' ' + LOC.you_can_reply.message : ''}</div>` : ''}
                ${options.mainTweet ? html`
                <div class="tweet-footer">
                    <div class="tweet-footer-stats">
                        <a href="/${t.user.screen_name}/status/${t.id_str}" class="tweet-footer-stat tweet-footer-stat-o">
                            <span class="tweet-footer-stat-text">${LOC.replies.message}</span>
                            <b class="tweet-footer-stat-count tweet-footer-stat-replies">${formatLargeNumber(t.reply_count).replace(/\s/g, ',')}</b>
                        </a>
                        <a href="/${t.user.screen_name}/status/${t.id_str}/retweets" class="tweet-footer-stat tweet-footer-stat-r">
                            <span class="tweet-footer-stat-text">${LOC.retweets.message}</span>
                            <b class="tweet-footer-stat-count tweet-footer-stat-retweets">${formatLargeNumber(t.retweet_count).replace(/\s/g, ',')}</b>
                        </a>
                        ${vars.showQuoteCount && typeof t.quote_count !== 'undefined' && t.quote_count > 0 ? /*html*/
                        `<a href="/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments" class="tweet-footer-stat tweet-footer-stat-q">
                            <span class="tweet-footer-stat-text">${LOC.quotes.message}</span>
                            <b class="tweet-footer-stat-count tweet-footer-stat-quotes">${formatLargeNumber(t.quote_count).replace(/\s/g, ',')}</b>
                        </a>` :
                        ''}
                        <a href="/${t.user.screen_name}/status/${t.id_str}/likes" class="tweet-footer-stat tweet-footer-stat-f">
                            <span class="tweet-footer-stat-text">${vars.heartsNotStars ? LOC.likes.message : LOC.favorites.message}</span>
                            <b class="tweet-footer-stat-count tweet-footer-stat-favorites">${formatLargeNumber(t.favorite_count).replace(/\s/g, ',')}</b>
                        </a>
                    </div>
                    <div class="tweet-footer-favorites"></div>
                </div>
                ` : ''}
                <a ${!options.mainTweet ? 'hidden' : ''} class="tweet-date" title="${new Date(t.created_at).toLocaleString()}" href="/${t.user.screen_name}/status/${t.id_str}"><br>${new Date(t.created_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric' }).toLowerCase()} - ${new Date(t.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}  ・ ${t.source ? t.source.split('>')[1].split('<')[0] : 'Unknown'}</a>
                <div class="tweet-interact">
                    <span class="tweet-button tweet-interact-reply" title="${LOC.reply_btn.message}${!vars.disableHotkeys ? ' (R)' : ''}" data-val="${t.reply_count}">${options.mainTweet ? '' : formatLargeNumber(t.reply_count).replace(/\s/g, ',')}</span>
                    <span title="${LOC.retweet_btn.message}" class="tweet-button tweet-interact-retweet${t.retweeted ? ' tweet-interact-retweeted' : ''}${(t.user.protected || t.limited_actions === 'limit_trusted_friends_tweet') && t.user.id_str !== user.id_str ? ' tweet-interact-retweet-disabled' : ''}" data-val="${t.retweet_count}">${options.mainTweet ? '' : formatLargeNumber(t.retweet_count).replace(/\s/g, ',')}</span>
                    <div class="tweet-interact-retweet-menu dropdown-menu" hidden>
                        <span class="tweet-interact-retweet-menu-retweet">${t.retweeted ? LOC.unretweet.message : LOC.retweet.message}</span>
                        <span class="tweet-interact-retweet-menu-quote">${LOC.quote_tweet.message}</span>
                        ${options.mainTweet ? html`
                            <span class="tweet-interact-retweet-menu-quotes">${LOC.see_quotes_big.message}</span>
                            <span class="tweet-interact-retweet-menu-retweeters">${LOC.see_retweeters.message}</span>
                        ` : ''}
                    </div>
                    <span title="${vars.heartsNotStars ? LOC.like_btn.message : LOC.favorite_btn.message}${!vars.disableHotkeys ? ' (L)' : ''}" class="tweet-button tweet-interact-favorite ${t.favorited ? 'tweet-interact-favorited' : ''}" data-val="${t.favorite_count}">${options.mainTweet ? '' : formatLargeNumber(t.favorite_count).replace(/\s/g, ',')}</span>
                    ${(vars.showBookmarkCount || options.mainTweet) && typeof t.bookmark_count !== 'undefined' ? 
                        html`<span title="${LOC.bookmarks_count.message}" class="tweet-interact-bookmark${t.bookmarked ? ' tweet-interact-bookmarked' : ''}" data-val="${t.bookmark_count}">${formatLargeNumber(t.bookmark_count).replace(/\s/g, ',')}</span>` :
                    ''}
                    ${vars.seeTweetViews && t.ext && t.ext.views && t.ext.views.r && t.ext.views.r.ok && t.ext.views.r.ok.count ? html`<span title="${LOC.views_count.message}" class="tweet-interact-views" data-val="${t.ext.views.r.ok.count}">${formatLargeNumber(t.ext.views.r.ok.count).replace(/\s/g, ',')}</span>` : ''}
                    <span class="tweet-button tweet-interact-more"></span>
                    <div class="tweet-interact-more-menu dropdown-menu" hidden>
                        ${innerWidth < 590 ? html`
                        <span class="tweet-interact-more-menu-separate">${LOC.separate_text.message}</span>
                        ` : ''}
                        <span class="tweet-interact-more-menu-copy">${LOC.copy_link.message}</span>
                        <span class="tweet-interact-more-menu-embed">${LOC.embed_tweet.message}</span>
                        ${navigator.canShare ? `<span class="tweet-interact-more-menu-share">${LOC.share_tweet.message}</span>` : ''}
                        <span class="tweet-interact-more-menu-share-dms">${LOC.share_tweet_in_dms.message}</span>
                        <span class="tweet-interact-more-menu-newtwitter">${LOC.open_tweet_newtwitter.message}</span>
                        ${t.user.id_str === user.id_str ? html`
                        <hr>
                        <span class="tweet-interact-more-menu-analytics">${LOC.tweet_analytics.message}</span>
                        <span class="tweet-interact-more-menu-delete">${LOC.delete_tweet.message}</span>
                        ` : ``}
                        ${t.conversation_id_str && tweetStorage[t.conversation_id_str] && tweetStorage[t.conversation_id_str].user.id_str === user.id_str && t.user.id_str !== user.id_str ? html`
                            <span class="tweet-interact-more-menu-hide">${t.moderated ? LOC.unhide_tweet.message : LOC.hide_tweet.message}</span>
                        `: ''}
                        ${t.hasModeratedReplies ? html`
                            <span class="tweet-interact-more-menu-hidden"><a target="_blank" href="/${t.user.screen_name}/status/${t.id_str}/hidden?newtwitter=true">${LOC.see_hidden_replies.message}</a></span>
                        ` : ''}
                        <hr>
                        ${t.user.id_str !== user.id_str && !options.mainTweet ? html`
                        <span class="tweet-interact-more-menu-follow"${t.user.blocking ? ' hidden' : ''}>${t.user.following ? unfollowUserText : followUserText}</span>
                        ` : ''}
                        ${t.user.id_str !== user.id_str ? html`
                            <span class="tweet-interact-more-menu-block">${t.user.blocking ? unblockUserText : blockUserText}</span>
                            <span class="tweet-interact-more-menu-mute-user">${t.user.muting ? LOC.unmute_user.message.replace("$SCREEN_NAME$", t.user.screen_name) : LOC.mute_user.message.replace("$SCREEN_NAME$", t.user.screen_name)}</span>
                            <span class="tweet-interact-more-menu-lists-action">${LOC.from_list.message}</span>
                        ` : ''}
                        <span class="tweet-interact-more-menu-bookmark">${LOC.bookmark_tweet.message}</span>
                        <span class="tweet-interact-more-menu-mute">${t.conversation_muted ? LOC.unmute_convo.message : LOC.mute_convo.message}</span>
                        <hr>
                        <span class="tweet-interact-more-menu-refresh">${LOC.refresh_tweet.message}</span>
                        ${t.extended_entities && t.extended_entities.media.length === 1 && t.extended_entities.media[0].type === 'animated_gif' ? html`<span class="tweet-interact-more-menu-download-gif" data-gifno="1">${LOC.download_gif.message}</span>` : ``}
                        ${t.extended_entities && t.extended_entities.media.length > 1 ? t.extended_entities.media.filter(m => m.type === 'animated_gif').map((m, i) => html`<span class="tweet-interact-more-menu-download-gif" data-gifno="${i+1}">${LOC.download_gif.message} (#${i+1})</span>`).join('\n') : ''}
                        ${t.extended_entities && t.extended_entities.media.length === 1 ? `<span class="tweet-interact-more-menu-download">${LOC.download_media.message}</span>` : ``}
                        ${vars.developerMode ? html`
                        <hr>
                        <span class="tweet-interact-more-menu-copy-user-id">${LOC.copy_user_id.message}</span>
                        <span class="tweet-interact-more-menu-copy-tweet-id">${LOC.copy_tweet_id.message}</span>
                        <span class="tweet-interact-more-menu-log">Log tweet object</span>
                        ` : ''}
                    </div>
                </div>
                <div class="tweet-edit-section tweet-reply" hidden>
                    <br>
                    <b style="font-size: 12px;display: block;margin-bottom: 5px;">${LOC.replying_to_tweet.message} <span ${!vars.disableHotkeys ? 'title="ALT+M"' : ''} class="tweet-reply-upload">${LOC.upload_media_btn.message}</span> <span class="tweet-reply-add-emoji">${LOC.emoji_btn.message}</span> <span ${!vars.disableHotkeys ? 'title="ALT+R"' : ''} class="tweet-reply-cancel">${LOC.cancel_btn.message}</span></b>
                    <span class="tweet-reply-error" style="color:red"></span>
                    <textarea maxlength="25000" class="tweet-reply-text" placeholder="${LOC.reply_example.message}"></textarea>
                    <button title="CTRL+ENTER" class="tweet-reply-button nice-button">${LOC.reply.message}</button><br>
                    <span class="tweet-reply-char">${localStorage.OTisBlueVerified ? '0/25000' : '0/280'}</span><br>
                    <div class="tweet-reply-media" style="padding-bottom: 10px;"></div>
                </div>
                <div class="tweet-edit-section tweet-quote" hidden>
                    <br>
                    <b style="font-size: 12px;display: block;margin-bottom: 5px;">${LOC.quote_tweet.message} <span ${!vars.disableHotkeys ? 'title="ALT+M"' : ''} class="tweet-quote-upload">${LOC.upload_media_btn.message}</span> <span class="tweet-quote-add-emoji">${LOC.emoji_btn.message}</span> <span ${!vars.disableHotkeys ? 'title="ALT+Q"' : ''} class="tweet-quote-cancel">${LOC.cancel_btn.message}</span></b>
                    <span class="tweet-quote-error" style="color:red"></span>
                    <textarea maxlength="25000" class="tweet-quote-text" placeholder="${LOC.quote_example.message}"></textarea>
                    <button title="CTRL+ENTER" class="tweet-quote-button nice-button">${LOC.quote.message}</button><br>
                    <span class="tweet-quote-char">${localStorage.OTisBlueVerified ? '0/25000' : '0/280'}</span><br>
                    <div class="tweet-quote-media" style="padding-bottom: 10px;"></div>
                </div>
                <div class="tweet-view-self-thread-div" ${options.threadContinuation ? '' : 'hidden'}>
                    <span class="tweet-view-self-thread-line"></span>
                    <div class="tweet-view-self-thread-line-dots"></div>
                </div>
            </article>
        `;
        let gifs = Array.from(tweet.querySelectorAll('.tweet-media-gif, .tweet-media-element-quote-gif'));
        if(gifs.length) {
            gifs.forEach(gif => {
                gif.addEventListener('click', () => {
                    if(gif.paused) gif.play();
                    else gif.pause();
                });
            });
        }
        // video
        let vidOverlay = tweet.getElementsByClassName('tweet-media-video-overlay')[0];
        if(vidOverlay) {
            vidOverlay.addEventListener('click', async () => {
                let vid = Array.from(tweet.getElementsByClassName('tweet-media')[0].children).filter(e => e.tagName === 'VIDEO')[0];
                try {
                    let res = await fetch(vid.currentSrc);
                    if(!res.headers.get('content-length')) await sleep(1000);
                } catch(e) {
                    console.error(e);
                }
                vid.play();
                vid.controls = true;
                vid.classList.remove('tweet-media-element-censor');
                vidOverlay.style.display = 'none';
            });
        }
        if(videos) {
            let vids = Array.from(tweet.getElementsByClassName('tweet-media')[0].children).filter(e => e.tagName === 'VIDEO');
            vids[0].onloadstart = () => {
                let src = vids[0].currentSrc;
                Array.from(tweet.getElementsByClassName('tweet-video-quality')).forEach(el => {
                    if(el.dataset.url === src) el.classList.add('tweet-video-quality-current');
                });
                tweet.getElementsByClassName('tweet-video-reload')[0].addEventListener('click', () => {
                    let vid = Array.from(tweet.getElementsByClassName('tweet-media')[0].children).filter(e => e.tagName === 'VIDEO')[0];
                    let time = vid.currentTime;
                    let paused = vid.paused;
                    vid.load();
                    vid.onloadstart = () => {
                        let src = vid.currentSrc;
                        vid.currentTime = time;
                        if(!paused) vid.play();
                        Array.from(tweet.getElementsByClassName('tweet-video-quality')).forEach(el => {
                            if(el.dataset.url === src) el.classList.add('tweet-video-quality-current');
                            else el.classList.remove('tweet-video-quality-current');
                        });
                    }
                });
                Array.from(tweet.getElementsByClassName('tweet-video-quality')).forEach(el => el.addEventListener('click', () => {
                    if(el.className.includes('tweet-video-quality-current')) return;
                    localStorage.preferredQuality = parseInt(el.innerText);
                    let vid = Array.from(tweet.getElementsByClassName('tweet-media')[0].children).filter(e => e.tagName === 'VIDEO')[0];
                    let time = vid.currentTime;
                    let paused = vid.paused;
                    for(let v of videos) { 
                        let closestQuality = v.video_info.variants.filter(v => v.bitrate).reduce((prev, curr) => {
                            return (Math.abs(parseInt(curr.url.match(/\/(\d+)x/)[1]) - parseInt(localStorage.preferredQuality)) < Math.abs(parseInt(prev.url.match(/\/(\d+)x/)[1]) - parseInt(localStorage.preferredQuality)) ? curr : prev);
                        });
                        let preferredQualityVariantIndex = v.video_info.variants.findIndex(v => v.url === closestQuality.url);
                        if(preferredQualityVariantIndex !== -1) {
                            let preferredQualityVariant = v.video_info.variants[preferredQualityVariantIndex];
                            v.video_info.variants.splice(preferredQualityVariantIndex, 1);
                            v.video_info.variants.unshift(preferredQualityVariant);
                        }
                    }
                    tweet.getElementsByClassName('tweet-media')[0].innerHTML = html`
                        ${t.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escapeHTML(m.ext_alt_text)}" title="${escapeHTML(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop muted' : ''}${m.type === 'animated_gif' && !vars.disableGifAutoplay ? ' autoplay' : ''} ${m.type === 'photo' ? `src="${m.media_url_https}"` : ''} class="tweet-media-element ${mediaClasses[t.extended_entities.media.length]} ${!vars.displaySensitiveContent && t.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' || m.type === 'animated_gif' ? `
                            ${m.video_info.variants.map(v => `<source src="${v.url}" type="${v.content_type}">`).join('\n')}
                            ${LOC.unsupported_video.message}
                        </video>` : ''}`).join('\n')}
                    `;
                    vid = Array.from(tweet.getElementsByClassName('tweet-media')[0].children).filter(e => e.tagName === 'VIDEO')[0];
                    vid.onloadstart = () => {
                        let src = vid.currentSrc;
                        vid.currentTime = time;
                        if(!paused) vid.play();
                        Array.from(tweet.getElementsByClassName('tweet-video-quality')).forEach(el => {
                            if(el.dataset.url === src) el.classList.add('tweet-video-quality-current');
                            else el.classList.remove('tweet-video-quality-current');
                        });
                    }
                    vid.addEventListener('mousedown', e => {
                        if(e.button === 1) {
                            e.preventDefault();
                            window.open(vid.currentSrc, '_blank');
                        }
                    });
                }));
            };
            for(let vid of vids) {
                if(!vars.muteVideos && typeof vars.volume === 'number') {
                    vid.volume = vars.volume;
                }
                vid.onvolumechange = () => {
                    chrome.storage.sync.set({
                        volume: vid.volume
                    }, () => { });
                    if(vars.muteVideos) return;
                    let allVids = document.getElementsByTagName('video');
                    for(let i = 0; i < allVids.length; i++) {
                        allVids[i].volume = vid.volume;
                    }
                };
                vid.addEventListener('mousedown', e => {
                    if(e.button === 1) {
                        e.preventDefault();
                        window.open(vid.currentSrc, '_blank');
                    }
                });
            }
        }

        let footerFavorites = tweet.getElementsByClassName('tweet-footer-favorites')[0];
        if(t.card) {
            generateCard(t, tweet, user);
        }
        if (options.top) {
            tweet.querySelector('.tweet-top').hidden = false;
            const icon = document.createElement('span');
            icon.innerText = options.top.icon;
            icon.classList.add('tweet-top-icon');
            icon.style.color = options.top.color;
    
            const span = document.createElement("span");
            span.classList.add("tweet-top-text");
            span.innerHTML = options.top.text;
            tweet.querySelector('.tweet-top').append(icon, span);
        }
        if(options.mainTweet) {
            let likers = (vars.showQuoteCount && typeof t.quote_count !== 'undefined' && t.quote_count > 0 ) ? this.mainTweetLikers.slice(0, 6) : this.mainTweetLikers.slice(0, 8);
            for(let i in likers) {
                let liker = likers[i];
                let a = document.createElement('a');
                a.href = `/${liker.screen_name}`;
                let likerImg = document.createElement('img');
                likerImg.src = `${(liker.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(liker.id_str) % 7}_normal.png`): liker.profile_image_url_https}`;
                likerImg.classList.add('tweet-footer-favorites-img');
                likerImg.title = liker.name + ' (@' + liker.screen_name + ')';
                likerImg.width = 24;
                likerImg.height = 24;
                a.appendChild(likerImg);
                a.dataset.id = liker.id_str;
                footerFavorites.appendChild(a);
            }
            let likesLink = tweet.getElementsByClassName('tweet-footer-stat-f')[0];
            likesLink.addEventListener('click', e => {
                e.preventDefault();
                history.pushState({}, null, `/${t.user.screen_name}/status/${t.id_str}/likes`);
                this.updateSubpage();
                this.mediaToUpload = [];
                this.excludeUserMentions = [];
                this.linkColors = {};
                this.cursor = undefined;
                this.seenReplies = [];
                this.mainTweetLikers = [];
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                this.updateLikes(id);
                this.currentLocation = location.pathname;
            });
            let retweetsLink = tweet.getElementsByClassName('tweet-footer-stat-r')[0];
            retweetsLink.addEventListener('click', e => {
                e.preventDefault();
                history.pushState({}, null, `/${t.user.screen_name}/status/${t.id_str}/retweets`);
                this.updateSubpage();
                this.mediaToUpload = [];
                this.excludeUserMentions = [];
                this.linkColors = {};
                this.cursor = undefined;
                this.seenReplies = [];
                this.mainTweetLikers = [];
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                this.updateRetweets(id);
                this.currentLocation = location.pathname;
            });
            if(vars.showQuoteCount && typeof t.quote_count !== 'undefined' && t.quote_count > 0){
                let quotesLink = tweet.getElementsByClassName('tweet-footer-stat-q')[0];
                quotesLink.addEventListener('click', e => {
                    e.preventDefault();
                    history.pushState({}, null, `/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments`);
                    this.updateSubpage();
                    this.mediaToUpload = [];
                    this.excludeUserMentions = [];
                    this.linkColors = {};
                    this.cursor = undefined;
                    this.seenReplies = [];
                    this.mainTweetLikers = [];
                    let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                    this.updateRetweetsWithComments(id);
                    this.currentLocation = location.pathname;
                });
            }
            let repliesLink = tweet.getElementsByClassName('tweet-footer-stat-o')[0];
            repliesLink.addEventListener('click', e => {
                e.preventDefault();
                if(location.href === `/${t.user.screen_name}/status/${t.id_str}`) return;
                history.pushState({}, null, `/${t.user.screen_name}/status/${t.id_str}`);
                this.updateSubpage();
                this.mediaToUpload = [];
                this.excludeUserMentions = [];
                this.linkColors = {};
                this.cursor = undefined;
                this.seenReplies = [];
                this.mainTweetLikers = [];
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                this.updateReplies(id);
                this.currentLocation = location.pathname;
            });
        }
        if(options.mainTweet && t.user.id_str !== user.id_str) {
            const tweetFollow = tweet.getElementsByClassName('tweet-header-follow')[0];
            tweetFollow.addEventListener('click', async () => {
                if(t.user.following) {
                    await API.user.unfollow(t.user.screen_name);
                    tweetFollow.innerText = LOC.follow.message;
                    tweetFollow.classList.remove('following');
                    tweetFollow.classList.add('follow');
                    t.user.following = false;
                } else {
                    await API.user.follow(t.user.screen_name);
                    tweetFollow.innerText = LOC.unfollow.message;
                    tweetFollow.classList.remove('follow');
                    tweetFollow.classList.add('following');
                    t.user.following = true;
                }
            });
        }
        const tweetBody = tweet.getElementsByClassName('tweet-body')[0];
        const tweetBodyText = tweet.getElementsByClassName('tweet-body-text')[0];
        const tweetTranslate = tweet.getElementsByClassName('tweet-translate')[0];
        const tweetQuoteTranslate = tweet.getElementsByClassName('tweet-quote-translate')[0];
        const tweetBodyQuote = tweet.getElementsByClassName('tweet-body-quote')[0];
        const tweetBodyQuoteText = tweet.getElementsByClassName('tweet-body-text-quote')[0];
    
        const tweetReplyCancel = tweet.getElementsByClassName('tweet-reply-cancel')[0];
        const tweetReplyUpload = tweet.getElementsByClassName('tweet-reply-upload')[0];
        const tweetReplyAddEmoji = tweet.getElementsByClassName('tweet-reply-add-emoji')[0];
        const tweetReply = tweet.getElementsByClassName('tweet-reply')[0];
        const tweetReplyButton = tweet.getElementsByClassName('tweet-reply-button')[0];
        const tweetReplyError = tweet.getElementsByClassName('tweet-reply-error')[0];
        const tweetReplyText = tweet.getElementsByClassName('tweet-reply-text')[0];
        const tweetReplyChar = tweet.getElementsByClassName('tweet-reply-char')[0];
        const tweetReplyMedia = tweet.getElementsByClassName('tweet-reply-media')[0];
    
        const tweetInteract = tweet.getElementsByClassName('tweet-interact')[0];
        const tweetInteractReply = tweet.getElementsByClassName('tweet-interact-reply')[0];
        const tweetInteractRetweet = tweet.getElementsByClassName('tweet-interact-retweet')[0];
        const tweetInteractFavorite = tweet.getElementsByClassName('tweet-interact-favorite')[0];
        const tweetInteractBookmark = tweet.getElementsByClassName('tweet-interact-bookmark')[0];
        const tweetInteractMore = tweet.getElementsByClassName('tweet-interact-more')[0];

        const tweetFooter = tweet.getElementsByClassName('tweet-footer')[0];
        const tweetFooterReplies = tweet.getElementsByClassName('tweet-footer-stat-replies')[0];
        const tweetFooterRetweets = tweet.getElementsByClassName('tweet-footer-stat-retweets')[0];
        const tweetFooterFavorites = tweet.getElementsByClassName('tweet-footer-stat-favorites')[0];
    
        const tweetQuote = tweet.getElementsByClassName('tweet-quote')[0];
        const tweetQuoteCancel = tweet.getElementsByClassName('tweet-quote-cancel')[0];
        const tweetQuoteUpload = tweet.getElementsByClassName('tweet-quote-upload')[0];
        const tweetQuoteAddEmoji = tweet.getElementsByClassName('tweet-quote-add-emoji')[0];
        const tweetQuoteButton = tweet.getElementsByClassName('tweet-quote-button')[0];
        const tweetQuoteError = tweet.getElementsByClassName('tweet-quote-error')[0];
        const tweetQuoteText = tweet.getElementsByClassName('tweet-quote-text')[0];
        const tweetQuoteChar = tweet.getElementsByClassName('tweet-quote-char')[0];
        const tweetQuoteMedia = tweet.getElementsByClassName('tweet-quote-media')[0];
    
        const tweetInteractRetweetMenu = tweet.getElementsByClassName('tweet-interact-retweet-menu')[0];
        const tweetInteractRetweetMenuRetweet = tweet.getElementsByClassName('tweet-interact-retweet-menu-retweet')[0];
        const tweetInteractRetweetMenuQuote = tweet.getElementsByClassName('tweet-interact-retweet-menu-quote')[0];
        const tweetInteractRetweetMenuQuotes = tweet.getElementsByClassName('tweet-interact-retweet-menu-quotes')[0];
        const tweetInteractRetweetMenuRetweeters = tweet.getElementsByClassName('tweet-interact-retweet-menu-retweeters')[0];
    
        const tweetInteractMoreMenu = tweet.getElementsByClassName('tweet-interact-more-menu')[0];
        const tweetInteractMoreMenuCopy = tweet.getElementsByClassName('tweet-interact-more-menu-copy')[0];
        const tweetInteractMoreMenuCopyTweetId = tweet.getElementsByClassName('tweet-interact-more-menu-copy-tweet-id')[0];
        const tweetInteractMoreMenuCopyUserId = tweet.getElementsByClassName('tweet-interact-more-menu-copy-user-id')[0];
        const tweetInteractMoreMenuLog = tweet.getElementsByClassName('tweet-interact-more-menu-log')[0];
        const tweetInteractMoreMenuEmbed = tweet.getElementsByClassName('tweet-interact-more-menu-embed')[0];
        const tweetInteractMoreMenuShare = tweet.getElementsByClassName('tweet-interact-more-menu-share')[0];
        const tweetInteractMoreMenuShareDMs = tweet.getElementsByClassName('tweet-interact-more-menu-share-dms')[0];
        const tweetInteractMoreMenuNewtwitter = tweet.getElementsByClassName('tweet-interact-more-menu-newtwitter')[0];
        const tweetInteractMoreMenuAnalytics = tweet.getElementsByClassName('tweet-interact-more-menu-analytics')[0];
        const tweetInteractMoreMenuRefresh = tweet.getElementsByClassName('tweet-interact-more-menu-refresh')[0];
        const tweetInteractMoreMenuMute = tweet.getElementsByClassName('tweet-interact-more-menu-mute')[0];
        const tweetInteractMoreMenuDownload = tweet.getElementsByClassName('tweet-interact-more-menu-download')[0];
        const tweetInteractMoreMenuDownloadGifs = Array.from(tweet.getElementsByClassName('tweet-interact-more-menu-download-gif'));
        const tweetInteractMoreMenuDelete = tweet.getElementsByClassName('tweet-interact-more-menu-delete')[0];
        const tweetInteractMoreMenuFollow = tweet.getElementsByClassName('tweet-interact-more-menu-follow')[0];
        const tweetInteractMoreMenuBlock = tweet.getElementsByClassName('tweet-interact-more-menu-block')[0];
        const tweetInteractMoreMenuMuteUser = tweet.getElementsByClassName('tweet-interact-more-menu-mute-user')[0];
        const tweetInteractMoreMenuListsAction = tweet.getElementsByClassName('tweet-interact-more-menu-lists-action')[0];  
        const tweetInteractMoreMenuBookmark = tweet.getElementsByClassName('tweet-interact-more-menu-bookmark')[0];
        const tweetInteractMoreMenuHide = tweet.getElementsByClassName('tweet-interact-more-menu-hide')[0];
        const tweetInteractMoreMenuSeparate = tweet.getElementsByClassName('tweet-interact-more-menu-separate')[0];

        if(tweetInteractMoreMenuLog) tweetInteractMoreMenuLog.addEventListener('click', () => {
            console.log(t);
        });

        if(tweetInteractMoreMenuSeparate) tweetInteractMoreMenuSeparate.addEventListener('click', () => {
            tweetBodyText.style = `
                padding-top: 20px!important;
                display: block;
                font-size: 26px;
                line-height: unset;
                padding-bottom: 20px;
            `;
            tweetInteractMoreMenuSeparate.style.display = 'none';
        });

        // Lists
        if(tweetInteractMoreMenuListsAction) tweetInteractMoreMenuListsAction.addEventListener('click', async () => {
            createModal(`
                <h1 class="cool-header">${LOC.from_list.message}</h1>
                <div id="modal-lists"></div>
            `);
            let lists = await API.list.getOwnerships(user.id_str, t.user.id_str);
            let container = document.getElementById('modal-lists');
            for(let i in lists) {
                let l = lists[i];
                let listElement = document.createElement('div');
                listElement.classList.add('list-item');
                listElement.innerHTML = html`
                    <div style="display:inline-block;">
                        <a href="/i/lists/${l.id_str}" class="following-item-link">
                            <img style="object-fit: cover;" src="${l.custom_banner_media ? l.custom_banner_media.media_info.original_img_url : l.default_banner_media.media_info.original_img_url}" alt="${l.name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                            <div class="following-item-text" style="position: relative;bottom: 12px;">
                                <span class="tweet-header-name following-item-name" style="font-size: 18px;">${escapeHTML(l.name)}</span><br>
                                <span style="color:var(--darker-gray);font-size:14px;margin-top:2px">${l.description ? escapeHTML(l.description).slice(0, 52) : LOC.no_description.message}</span>
                            </div>
                        </a>
                    </div>
                    <div style="display:inline-block;float: right;margin-top: 5px;">
                        <button class="nice-button">${l.is_member ? LOC.remove.message : LOC.add.message}</button>
                    </div>
                `;
                container.appendChild(listElement);
                listElement.getElementsByClassName('nice-button')[0].addEventListener('click', async () => {
                    if(l.is_member) {
                        await API.list.removeMember(l.id_str, t.user.id_str);
                        l.is_member = false;
                        listElement.getElementsByClassName('nice-button')[0].innerText = LOC.add.message;
                    } else {
                        await API.list.addMember(l.id_str, t.user.id_str);
                        l.is_member = true;
                        listElement.getElementsByClassName('nice-button')[0].innerText = LOC.remove.message;
                    }
                    l.is_member = !l.is_member;
                });
            }
        });

        // moderating tweets
        if(tweetInteractMoreMenuHide) tweetInteractMoreMenuHide.addEventListener('click', async () => {
            if(t.moderated) {
                try {
                    await API.tweet.unmoderate(t.id_str);
                } catch(e) {
                    console.error(e);
                    alert(e);
                    return;
                }
                tweetInteractMoreMenuHide.innerText = LOC.hide_tweet.message;
                t.moderated = false;
            } else {
                let sure = confirm(LOC.hide_tweet_sure.message);
                if(!sure) return;
                try {
                    await API.tweet.moderate(t.id_str);
                } catch(e) {
                    console.error(e);
                    alert(e);
                    return;
                }
                tweetInteractMoreMenuHide.innerText = LOC.unhide_tweet.message;
                t.moderated = true;
            }
        });        

        // community notes
        if(t.birdwatch && t.birdwatch.subtitle && options.mainTweet && !vars.hideCommunityNotes) {
            let div = document.createElement('div');
            div.classList.add('tweet-birdwatch', 'box');
            let text = Array.from(escapeHTML(t.birdwatch.subtitle.text));
            for(let e = t.birdwatch.subtitle.entities.length - 1; e >= 0; e--) {
                let entity = t.birdwatch.subtitle.entities[e];
                if(!entity.ref) continue;
                text = arrayInsert(text, entity.toIndex, '</a>');
                text = arrayInsert(text, entity.fromIndex, `<a href="${entity.ref.url}" target="_blank">`);
            }
            text = text.join('');
            
            div.innerHTML = html`
                <div class="tweet-birdwatch-header">
                    <span class="tweet-birdwatch-title">${escapeHTML(t.birdwatch.title)}</span>
                </div>
                <div class="tweet-birdwatch-body">
                    <span class="tweet-birdwatch-subtitle">${text}</span>
                </div>
            `;

            if(tweetFooter) tweetFooter.before(div);
            else tweetInteract.before(div);
        }

        // rtl languages
        if(rtlLanguages.includes(t.lang)) {
            tweetBody.classList.add('rtl');
        }

        // Quote body
        if(tweetBodyQuote) {
            tweetBodyQuote.addEventListener('click', e => {
                e.preventDefault();
                history.pushState({}, null, `/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}`);
                this.updateSubpage();
                this.mediaToUpload = [];
                this.excludeUserMentions = [];
                this.linkColors = {};
                this.cursor = undefined;
                this.seenReplies = [];
                this.mainTweetLikers = [];
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                if(this.subpage === 'tweet') {
                    this.updateReplies(id);
                } else if(this.subpage === 'likes') {
                    this.updateLikes(id);
                } else if(this.subpage === 'retweets') {
                    this.updateRetweets(id);
                } else if(this.subpage === 'retweets_with_comments') {
                    this.updateRetweetsWithComments(id);
                }
                this.currentLocation = location.pathname;
            });
            if(rtlLanguages.includes(t.quoted_status.lang)) {
                tweetBodyQuoteText.classList.add('rtl');
            } else {
                tweetBodyQuoteText.classList.add('ltr');
            }
            if(tweetQuoteTranslate) {
                let quoteTranslating = false;
                tweetQuoteTranslate.addEventListener('click', async e => {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    if(t.quoted_status.translated || quoteTranslating) return;
                    quoteTranslating = true;
                    let translated = await API.tweet.translate(t.quoted_status.id_str);
                    quoteTranslating = false;
                    t.quoted_status.translated = true;
                    tweetQuoteTranslate.hidden = true;
                    if(!translated.translated_lang || !translated.text) return;
                    let tt = t.full_text.replace(/^(@[a-zA-Z0-9_]{1,15}\s?)*/, "").replace(/\shttps:\/\/t.co\/[a-zA-Z0-9\-]{8,10}$/, "").trim();
                    if(translated.text.trim() === tt) return;
                    if(translated.text.trim() === tt.replace(/(hihi)|(hehe)/g, 'lol')) return; // lol
                    const { hideOriginalLanguages } = await chrome.storage.sync.get('hideOriginalLanguages');
                    
                    let translatedMessage;
                    if(LOC.translated_from.message.includes("$LANGUAGE$")) {
                        translatedMessage = LOC.translated_from.message.replace("$LANGUAGE$", `[${translated.translated_lang}]`);
                    } else {
                        translatedMessage = `${LOC.translated_from.message} [${translated.translated_lang}]`;
                    }
                    if(translated.text.length > 600) {
                        translated.text = translated.text.substring(0, 600) + '...';
                    }
                    if (hideOriginalLanguages) {
                        translatedMessage = '';
                        tweetBodyQuoteText.innerHTML = '';
                    }
                    tweetBodyQuoteText.innerHTML += 
                    `<span class="translated-from" style="margin-bottom:3px">${translatedMessage}:</span>`+
                    `<span class="tweet-translated-text" style="color:var(--default-text-color)!important">${escapeHTML(translated.text)}</span>`;
                    if(vars.enableTwemoji) twemoji.parse(tweetBodyQuoteText);
                });
                if(options.translate || vars.autotranslateProfiles.includes(t.quoted_status.user.id_str) || (typeof toAutotranslate !== 'undefined' && toAutotranslate) || (vars.autotranslateLanguages.includes(t.quoted_status.lang) && vars.autotranslationMode === 'whitelist') || (!vars.autotranslateLanguages.includes(t.quoted_status.lang) && vars.autotranslationMode === 'blacklist')) {
                    onVisible(tweet, () => {
                        if(!t.quoted_status.translated) {
                            if(tweetQuoteTranslate) tweetQuoteTranslate.click();
                        }
                    })
                }
            }
        }
    
        // Translate
        t.translated = false;
        let translating = false;
        if(tweetTranslate) {
            tweetTranslate.addEventListener('click', async () => {
                if(t.translated || translating) return;
                translating = true;
                let translated = await API.tweet.translate(t.id_str);
                t.translated = true;
                translating = false;
                tweetTranslate.hidden = true;
                if(!translated.translated_lang || !translated.text) return;
                let tt = t.full_text.replace(/^(@[a-zA-Z0-9_]{1,15}\s?)*/, "").replace(/\shttps:\/\/t.co\/[a-zA-Z0-9\-]{8,10}$/, "").trim();
                if(translated.text.trim() === tt) return;
                if(translated.text.trim() === tt.replace(/(hihi)|(hehe)/g, 'lol')) return; // lol

                const { hideOriginalLanguages } = await chrome.storage.sync.get('hideOriginalLanguages');

                let translatedMessage;
                if(LOC.translated_from.message.includes("$LANGUAGE$")) {
                    translatedMessage = LOC.translated_from.message.replace("$LANGUAGE$", `[${translated.translated_lang}]`);
                } else {
                    translatedMessage = `${LOC.translated_from.message} [${translated.translated_lang}]`;
                }
                let translatedT = {
                    full_text: translated.text,
                    entities: translated.entities
                }
                let translatedFrom = document.createElement('span');
                translatedFrom.classList.add('translated-from');
                translatedFrom.innerText = translatedMessage;

             
                    
                let translatedText = document.createElement('span');
                translatedText.classList.add('tweet-translated-text');
                translatedText.innerHTML = await renderTweetBodyHTML(translatedT);
                if (hideOriginalLanguages) {
                    tweetBodyText.innerHTML = ''; 
                    tweetBodyText.append(translatedText); 
                } else {
                    tweetBodyText.append(document.createElement('br'), translatedFrom, translatedText);
                }
                if(vars.enableTwemoji) twemoji.parse(tweetBodyText);
            });
            if(options.translate || vars.autotranslateProfiles.includes(t.user.id_str) || (typeof toAutotranslate !== 'undefined' && toAutotranslate) || (vars.autotranslateLanguages.includes(t.lang) && vars.autotranslationMode === 'whitelist') || (!vars.autotranslateLanguages.includes(t.lang) && vars.autotranslationMode === 'blacklist')) {
                onVisible(tweet, () => {
                    if(!t.translated) {
                        if(tweetTranslate) tweetTranslate.click();
                    }
                });
            }
        }
        
        // Bookmarks
        let switchingBookmark = false;
        let switchBookmark = () => {
            if(switchingBookmark) return;
            switchingBookmark = true;
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
            if(t.bookmarked) {
                API.bookmarks.delete(t.id_str).then(() => {
                    toast.info(LOC.unbookmarked_tweet.message);
                    switchingBookmark = false;
                    t.bookmarked = false;
                    t.bookmark_count--;
                    tweetInteractMoreMenuBookmark.innerText = LOC.bookmark_tweet.message;
                    if(tweetInteractBookmark) {
                        tweetInteractBookmark.classList.remove('tweet-interact-bookmarked');
                        tweetInteractBookmark.innerText = formatLargeNumber(t.bookmark_count).replace(/\s/g, ',');
                        tweetInteractBookmark.dataset.val = t.bookmark_count;
                    }
                }).catch(e => {
                    switchingBookmark = false;
                    console.error(e);
                    alert(e);
                });
            } else {
                API.bookmarks.create(t.id_str).then(() => {
                    toast.info(LOC.bookmarked_tweet.message);
                    switchingBookmark = false;
                    t.bookmarked = true;
                    t.bookmark_count++;
                    tweetInteractMoreMenuBookmark.innerText = LOC.remove_bookmark.message;
                    if(tweetInteractBookmark) {
                        tweetInteractBookmark.classList.add('tweet-interact-bookmarked');
                        tweetInteractBookmark.innerText = formatLargeNumber(t.bookmark_count).replace(/\s/g, ',');
                        tweetInteractBookmark.dataset.val = t.bookmark_count;
                    }
                }).catch(e => {
                    switchingBookmark = false;
                    console.error(e);
                    alert(e);
                });
            }
        };
        if(tweetInteractBookmark) tweetInteractBookmark.addEventListener('click', switchBookmark);
        if(tweetInteractMoreMenuBookmark) tweetInteractMoreMenuBookmark.addEventListener('click', switchBookmark);
    
        // Media
        if (t.extended_entities && t.extended_entities.media) {
            const tweetMedia = tweet.getElementsByClassName('tweet-media')[0];
            tweetMedia.addEventListener('click', e => {
                if (e.target.className && e.target.className.includes('tweet-media-element-censor')) {
                    return e.target.classList.remove('tweet-media-element-censor');
                }
                if (e.target.tagName === 'IMG') {
                    if(!e.target.src.includes('?name=') && !e.target.src.endsWith(':orig') && !e.target.src.startsWith('data:')) {
                        e.target.src += '?name=orig';
                    } else if(e.target.src.includes('?name=small')) {
                        e.target.src = e.target.src.replace('?name=small', '?name=large');
                    }
                    new Viewer(tweetMedia, {
                        transition: false,
                        zoomRatio: 0.3
                    });
                    e.target.click();
                }
            });
        }

        // Emojis
        [tweetReplyAddEmoji, tweetQuoteAddEmoji].forEach(e => {
            e.addEventListener('click', e => {
                let isReply = e.target.className === 'tweet-reply-add-emoji';
                createEmojiPicker(isReply ? tweetReply : tweetQuote, isReply ? tweetReplyText : tweetQuoteText, {});
            });
        });
        
        // Reply
        tweetReplyCancel.addEventListener('click', () => {
            tweetReply.hidden = true;
            tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
        });
        let replyMedia = [];
        tweetReply.addEventListener('drop', e => {
            handleDrop(e, replyMedia, tweetReplyMedia);
        });
        tweetReply.addEventListener('paste', event => {
            let items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (let index in items) {
                let item = items[index];
                if (item.kind === 'file') {
                    let file = item.getAsFile();
                    handleFiles([file], replyMedia, tweetReplyMedia);
                }
            }
        });
        tweetReplyUpload.addEventListener('click', () => {
            getMedia(replyMedia, tweetReplyMedia);
        });
        tweetInteractReply.addEventListener('click', () => {
            if(options.mainTweet) {
                document.getElementsByClassName('new-tweet-view')[0].click();
                document.getElementsByClassName('new-tweet-text')[0].focus();
                return;
            }
            if (!tweetQuote.hidden) tweetQuote.hidden = true;
            if (tweetReply.hidden) {
                tweetInteractReply.classList.add('tweet-interact-reply-clicked');
            } else {
                tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
            }
            tweetReply.hidden = !tweetReply.hidden;
            setTimeout(() => {
                tweetReplyText.focus();
            })
        });
        tweetReplyText.addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.ctrlKey) {
                tweetReplyButton.click();
            }
        });
        tweetReplyText.addEventListener('input', e => {
            let tweet = twttr.txt.parseTweet(e.target.value);
            if(localStorage.OTisBlueVerified) {
                return tweetReplyChar.innerText = `${tweet.weightedLength}/25000`;
            }
            tweetReplyChar.innerText = `${tweet.weightedLength}/280`;
            if(tweet.weightedLength > 265) {
                tweetReplyChar.style.color = "#c26363";
            } else {
                tweetReplyChar.style.color = "";
            }
            if (tweet.weightedLength > 280) {
                tweetReplyChar.style.color = "red";
                tweetReplyButton.disabled = true;
            } else {
                tweetReplyButton.disabled = false;
            }
        });
        tweetReplyButton.addEventListener('click', async () => {
            tweetReplyError.innerHTML = '';
            let text = tweetReplyText.value;
            if (text.length === 0 && replyMedia.length === 0) return;
            tweetReplyButton.disabled = true;
            let uploadedMedia = [];
            for (let i in replyMedia) {
                let media = replyMedia[i];
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
                    for(let j in replyMedia) {
                        let media = replyMedia[j];
                        media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = true;
                        media.div.getElementsByClassName('new-tweet-media-img-progress')[0].innerText = '';
                    }
                    tweetReplyButton.disabled = false;
                    return; // cancel tweeting
                }
            }
            let tweetObject = {
                status: text,
                in_reply_to_status_id: t.id_str
            };
            if (uploadedMedia.length > 0) {
                tweetObject.media_ids = uploadedMedia.join(',');
            }
            let tweetData;
            try {
                tweetData = await API.tweet.postV2(tweetObject)
            } catch (e) {
                tweetReplyError.innerHTML = (e && e.message ? e.message : e) + "<br>";
                tweetReplyButton.disabled = false;
                return;
            }
            if (!tweetData) {
                tweetReplyButton.disabled = false;
                tweetReplyError.innerHTML = html`${LOC.error_sending_tweet.message}<br>`;
                return;
            }
            tweetReplyText.value = '';
            tweetReplyChar.innerText = localStorage.OTisBlueVerified ? '0/25000' : '0/280';
            tweetReply.hidden = true;
            tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
            if(!options.mainTweet) {
                tweetInteractReply.dataset.val = parseInt(tweetInteractReply.dataset.val) + 1;
                if(vars.showExactValues || t.reply_count < 10000)
                    tweetInteractReply.innerText = formatLargeNumber(parseInt(tweetInteractReply.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).replace(/\s/g, ',');
            } else {
                tweetFooterReplies.dataset.val = parseInt(tweetFooterReplies.dataset.val) + 1;
                if(vars.showExactValues || t.reply_count < 10000)
                    tweetFooterReplies.innerText = formatLargeNumber(parseInt(tweetFooterReplies.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).replace(/\s/g, ',');
            }
            if(typeof repliesToIgnore !== 'undefined') {
                repliesToIgnore.push(tweetData.id_str);
            }
            tweetData._ARTIFICIAL = true;
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
            if(tweet.getElementsByClassName('tweet-self-thread-div')[0]) tweet.getElementsByClassName('tweet-self-thread-div')[0].hidden = false;
            tweetReplyButton.disabled = false;
            tweetReplyMedia.innerHTML = [];
            replyMedia = [];
            this.appendTweet(tweetData, document.getElementsByClassName('timeline')[0], {
                noTop: true,
                after: tweet
            });
        });
    
        // Retweet / Quote Tweet
        let retweetClicked = false;
        tweetQuoteCancel.addEventListener('click', () => {
            tweetQuote.hidden = true;
        });
        tweetInteractRetweet.addEventListener('click', async () => {
            if(tweetInteractRetweet.classList.contains('tweet-interact-retweet-disabled')) {
                return;
            }
            if (!tweetQuote.hidden) {
                tweetQuote.hidden = true;
                return;
            }
            if (tweetInteractRetweetMenu.hidden) {
                tweetInteractRetweetMenu.hidden = false;
            }
            if(retweetClicked) return;
            retweetClicked = true;
            setTimeout(() => {
                document.body.addEventListener('click', () => {
                    retweetClicked = false;
                    setTimeout(() => tweetInteractRetweetMenu.hidden = true, 50);
                }, { once: true });
            }, 50);
        });

        tweetInteractRetweetMenuRetweet.addEventListener('click', async () => {
            if (!t.retweeted) {
                let tweetData;
                try {
                    tweetData = await API.tweet.retweet(t.id_str);
                } catch (e) {
                    console.error(e);
                    alert(e);
                    return;
                }
                if (!tweetData) {
                    return;
                }
                tweetInteractRetweetMenuRetweet.innerText = LOC.unretweet.message;
                tweetInteractRetweet.classList.add('tweet-interact-retweeted');
                t.retweeted = true;
                t.retweet_count++;
                t.newTweetId = tweetData.id_str;
                if(!options.mainTweet) {
                    tweetInteractRetweet.dataset.val = parseInt(tweetInteractRetweet.dataset.val) + 1;
                    if(vars.showExactValues || t.retweet_count < 10000)
                        tweetInteractRetweet.innerText = formatLargeNumber(parseInt(tweetInteractRetweet.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).replace(/\s/g, ',');
                } else {
                    if(vars.showExactValues || t.retweet_count < 10000)
                        tweetFooterRetweets.innerText = formatLargeNumber(parseInt(tweetFooterRetweets.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).replace(/\s/g, ',');
                }
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'retweet',
                    tweet: t,
                    tweetData
                } });
                document.dispatchEvent(event);
            } else {
                let tweetData;
                try {
                    tweetData = await API.tweet.unretweet(t.retweeted_status ? t.retweeted_status.id_str : t.id_str);
                } catch (e) {
                    console.error(e);
                    return;
                }
                if (!tweetData) {
                    return;
                }
                tweetInteractRetweetMenuRetweet.innerText = LOC.retweet.message;
                tweetInteractRetweet.classList.remove('tweet-interact-retweeted');
                t.retweet_count--;
                t.retweeted = false;
                if(!options.mainTweet) {
                    tweetInteractRetweet.dataset.val = parseInt(tweetInteractRetweet.dataset.val) - 1;
                    if(vars.showExactValues || t.retweet_count < 10000)
                        tweetInteractRetweet.innerText = formatLargeNumber(parseInt(tweetInteractRetweet.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1).replace(/\s/g, ',');
                } else {
                    if(vars.showExactValues || t.retweet_count < 10000)
                        tweetFooterRetweets.innerText = formatLargeNumber(parseInt(tweetFooterRetweets.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1).replace(/\s/g, ',');
                }
                delete t.newTweetId;
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'unretweet',
                    tweet: t,
                    tweetData
                } });
                document.dispatchEvent(event);
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
        if(options.mainTweet) {
            tweetInteractRetweetMenuQuotes.addEventListener('click', async () => {
                history.pushState({}, null, `/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments`);
                this.updateSubpage();
                this.mediaToUpload = [];
                this.excludeUserMentions = [];
                this.linkColors = {};
                this.cursor = undefined;
                this.seenReplies = [];
                this.mainTweetLikers = [];
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                if(this.subpage === 'tweet') {
                    this.updateReplies(id);
                } else if(this.subpage === 'likes') {
                    this.updateLikes(id);
                } else if(this.subpage === 'retweets') {
                    this.updateRetweets(id);
                } else if(this.subpage === 'retweets_with_comments') {
                    this.updateRetweetsWithComments(id);
                }
                this.currentLocation = location.pathname;
            });
            tweetInteractRetweetMenuRetweeters.addEventListener('click', async () => {
                history.pushState({}, null, `/${t.user.screen_name}/status/${t.id_str}/retweets`);
                this.updateSubpage();
                this.mediaToUpload = [];
                this.excludeUserMentions = [];
                this.linkColors = {};
                this.cursor = undefined;
                this.seenReplies = [];
                this.mainTweetLikers = [];
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                if(this.subpage === 'tweet') {
                    this.updateReplies(id);
                } else if(this.subpage === 'likes') {
                    this.updateLikes(id);
                } else if(this.subpage === 'retweets') {
                    this.updateRetweets(id);
                } else if(this.subpage === 'retweets_with_comments') {
                    this.updateRetweetsWithComments(id);
                }
                this.currentLocation = location.pathname;
            });
        }
        tweetInteractRetweetMenuQuote.addEventListener('click', async () => {
            if (!tweetReply.hidden) {
                tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
                tweetReply.hidden = true;
            }
            tweetQuote.hidden = false;
            setTimeout(() => {
                tweetQuoteText.focus();
            })
        });
        let quoteMedia = [];
        tweetQuote.addEventListener('drop', e => {
            handleDrop(e, quoteMedia, tweetQuoteMedia);
        });
        tweetQuote.addEventListener('paste', event => {
            let items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (let index in items) {
                let item = items[index];
                if (item.kind === 'file') {
                    let file = item.getAsFile();
                    handleFiles([file], quoteMedia, tweetQuoteMedia);
                }
            }
        });
        tweetQuoteUpload.addEventListener('click', () => {
            getMedia(quoteMedia, tweetQuoteMedia);
        });
        tweetQuoteText.addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.ctrlKey) {
                tweetQuoteButton.click();
            }
        });
        tweetQuoteText.addEventListener('input', e => {
            let tweet = twttr.txt.parseTweet(e.target.value);
            if(localStorage.OTisBlueVerified) {
                return tweetQuoteChar.innerText = `${tweet.weightedLength}/25000`;
            }
            tweetQuoteChar.innerText = `${tweet.weightedLength}/280`;
            if(tweet.weightedLength > 265) {
                tweetQuoteChar.style.color = "#c26363";
            } else {
                tweetQuoteChar.style.color = "";
            }
            if (tweet.weightedLength > 280) {
                tweetQuoteChar.style.color = "red";
                tweetQuoteButton.disabled = true;
            } else {
                tweetQuoteButton.disabled = false;
            }
        });
        tweetQuoteButton.addEventListener('click', async () => {
            let text = tweetQuoteText.value;
            tweetQuoteError.innerHTML = '';
            if (text.length === 0 && quoteMedia.length === 0) return;
            tweetQuoteButton.disabled = true;
            let uploadedMedia = [];
            for (let i in quoteMedia) {
                let media = quoteMedia[i];
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
                    for(let j in quoteMedia) {
                        let media = quoteMedia[j];
                        media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = true;
                        media.div.getElementsByClassName('new-tweet-media-img-progress')[0].innerText = '';
                    }
                    tweetQuoteButton.disabled = false;
                    return; // cancel tweeting
                }
            }
            let tweetObject = {
                status: text,
                attachment_url: `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`
            };
            if (uploadedMedia.length > 0) {
                tweetObject.media_ids = uploadedMedia.join(',');
            }
            let tweetData;
            try {
                tweetData = await API.tweet.postV2(tweetObject)
            } catch (e) {
                tweetQuoteError.innerHTML = (e && e.message ? e.message : e) + "<br>";
                tweetQuoteButton.disabled = false;
                return;
            }
            if (!tweetData) {
                tweetQuoteError.innerHTML = html`${LOC.error_sending_tweet.message}<br>`;
                tweetQuoteButton.disabled = false;
                return;
            }
            tweetQuoteText.value = '';
            tweetQuote.hidden = true;
            tweetData._ARTIFICIAL = true;
            quoteMedia = [];
            tweetQuoteChar.innerText = localStorage.OTisBlueVerified ? '0/25000' : '0/280';
            tweetQuoteButton.disabled = false;
            tweetQuoteMedia.innerHTML = '';
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
            this.appendTweet(tweetData, timelineContainer, { prepend: true });
        });
    
        // Favorite
        tweetInteractFavorite.addEventListener('click', () => {
            if (t.favorited) {
                API.tweet.unfavorite(t.id_str);
                t.favorited = false;
                t.favorite_count--;
                if(!options.mainTweet) {
                    tweetInteractFavorite.dataset.val = parseInt(tweetInteractFavorite.dataset.val) - 1;
                    if(vars.showExactValues || t.favorite_count < 10000)
                        tweetInteractFavorite.innerText = formatLargeNumber(parseInt(tweetInteractFavorite.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1).replace(/\s/g, ',');;
                } else {
                    if(this.mainTweetLikers.find(liker => liker.id_str === user.id_str)) {
                        this.mainTweetLikers.splice(this.mainTweetLikers.findIndex(liker => liker.id_str === user.id_str), 1);
                        let likerImg = footerFavorites.querySelector(`a[data-id="${user.id_str}"]`);
                        if(likerImg) likerImg.remove()
                    }
                    if(vars.showExactValues || t.favorite_count < 10000)
                        tweetFooterFavorites.innerText = formatLargeNumber(parseInt(tweetFooterFavorites.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1).replace(/\s/g, ',');
                }
                tweetInteractFavorite.classList.remove('tweet-interact-favorited');
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'unfavorite',
                    tweet: t
                } });
                document.dispatchEvent(event);
            } else {
                API.tweet.favorite(t.id_str);
                t.favorited = true;
                t.favorite_count++;
                if(!options.mainTweet) {
                    tweetInteractFavorite.dataset.val = parseInt(tweetInteractFavorite.dataset.val) + 1;
                    if(vars.showExactValues || t.favorite_count < 10000)
                        tweetInteractFavorite.innerText = formatLargeNumber(parseInt(tweetInteractFavorite.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).replace(/\s/g, ',');;
                } else {
                    if(footerFavorites.children.length < 8 && !this.mainTweetLikers.find(liker => liker.id_str === user.id_str)) {
                        let a = document.createElement('a');
                        a.href = `/${user.screen_name}`;
                        let likerImg = document.createElement('img');
                        likerImg.src = `${(user.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(user.id_str) % 7}_normal.png`): user.profile_image_url_https}`    ;
                        likerImg.classList.add('tweet-footer-favorites-img');
                        likerImg.title = user.name + ' (@' + user.screen_name + ')';
                        likerImg.width = 24;
                        likerImg.height = 24;
                        a.dataset.id = user.id_str;
                        a.appendChild(likerImg);
                        footerFavorites.appendChild(a);
                        this.mainTweetLikers.push(user);
                    }
                    if(vars.showExactValues || t.favorite_count < 10000)
                        tweetFooterFavorites.innerText = formatLargeNumber(parseInt(tweetFooterFavorites.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).replace(/\s/g, ',');
                }
                tweetInteractFavorite.classList.add('tweet-interact-favorited');
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'favorite',
                    tweet: t
                }});
                document.dispatchEvent(event);
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
    
        // More
        let moreClicked = false;
        tweetInteractMore.addEventListener('click', () => {
            if (tweetInteractMoreMenu.hidden) {
                tweetInteractMoreMenu.hidden = false;
            }
            if(moreClicked) return;
            moreClicked = true;
            setTimeout(() => {
                document.body.addEventListener('click', () => {
                    moreClicked = false;
                    setTimeout(() => tweetInteractMoreMenu.hidden = true, 50);
                }, { once: true });
            }, 50);
        });
        if(tweetInteractMoreMenuFollow) tweetInteractMoreMenuFollow.addEventListener('click', async () => {
            if (t.user.following) {
                await API.user.unfollow(t.user.screen_name);
                t.user.following = false;
                if(LOC.follow_user.message.includes("$SCREEN_NAME$")) {
                    tweetInteractMoreMenuFollow.innerText = LOC.follow_user.message.replace("$SCREEN_NAME$", t.user.screen_name);
                } else {
                    tweetInteractMoreMenuFollow.innerText = `${LOC.follow_user.message} @${t.user.screen_name}`;
                }
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'unfollow',
                    tweet: t
                } });
                document.dispatchEvent(event);
            } else {
                await API.user.follow(t.user.screen_name);
                t.user.following = true;
                if(LOC.unfollow_user.message.includes("$SCREEN_NAME$")) {
                    tweetInteractMoreMenuFollow.innerText = LOC.unfollow_user.message.replace("$SCREEN_NAME$", t.user.screen_name);
                } else {
                    tweetInteractMoreMenuFollow.innerText = `${LOC.unfollow_user.message} @${t.user.screen_name}`;
                }
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'follow',
                    tweet: t
                } });
                document.dispatchEvent(event);
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
        if(tweetInteractMoreMenuBlock) tweetInteractMoreMenuBlock.addEventListener('click', async () => {
            if (t.user.blocking) {
                await API.user.unblock(t.user.id_str);
                t.user.blocking = false;
                if(LOC.block_user.message.includes("$SCREEN_NAME$")) {
                    tweetInteractMoreMenuBlock.innerText = LOC.block_user.message.replace("$SCREEN_NAME$", t.user.screen_name);
                } else {
                    tweetInteractMoreMenuBlock.innerText = `${LOC.block_user.message} @${t.user.screen_name}`;
                }
                tweetInteractMoreMenuFollow.hidden = false;
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'unblock',
                    tweet: t
                } });
                document.dispatchEvent(event);
            } else {
                let blockMessage;
                if(LOC.block_sure.message.includes("$SCREEN_NAME$")) {
                    blockMessage = LOC.block_sure.message.replace("$SCREEN_NAME$", t.user.screen_name);
                } else {
                    blockMessage = `${LOC.block_sure.message} @${t.user.screen_name}?`;
                }
                let c = confirm(blockMessage);
                if (!c) return;
                await API.user.block(t.user.id_str);
                t.user.blocking = true;
                if(LOC.unblock_user.message.includes("$SCREEN_NAME$")) {
                    tweetInteractMoreMenuBlock.innerText = LOC.unblock_user.message.replace("$SCREEN_NAME$", t.user.screen_name);
                } else {
                    tweetInteractMoreMenuBlock.innerText = `${LOC.unblock_user.message} @${t.user.screen_name}`;
                }
                tweetInteractMoreMenuFollow.hidden = true;
                t.user.following = false;
                if(LOC.follow_user.message.includes("$SCREEN_NAME$")) {
                    tweetInteractMoreMenuFollow.innerText = LOC.follow_user.message.replace("$SCREEN_NAME$", t.user.screen_name);
                } else {
                    tweetInteractMoreMenuFollow.innerText = `${LOC.follow_user.message} @${t.user.screen_name}`;
                }
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'block',
                    tweet: t
                } });
                document.dispatchEvent(event);
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
        if(tweetInteractMoreMenuMuteUser) tweetInteractMoreMenuMuteUser.addEventListener('click', async () => {
            if (t.user.muting) {
                await API.user.unmute(t.user.id_str);
                t.user.muting = false;
                tweetInteractMoreMenuMuteUser.innerText = LOC.mute_user.message.replace("$SCREEN_NAME$", t.user.screen_name);

                toast.info(LOC.unmuted_user.message.replace("$SCREEN_NAME$", t.user.screen_name));
            } else {
                await API.user.mute(t.user.id_str);
                t.user.muting = true;
                tweetInteractMoreMenuMuteUser.innerText = LOC.unmute_user.message.replace("$SCREEN_NAME$", t.user.screen_name);

                toast.info(LOC.muted_user.message.replace("$SCREEN_NAME$", t.user.screen_name));
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
        tweetInteractMoreMenuCopy.addEventListener('click', () => {
            navigator.clipboard.writeText(`https://${vars.copyLinksAs}/${t.user.screen_name}/status/${t.id_str}`);
        });
        if(tweetInteractMoreMenuCopyTweetId) tweetInteractMoreMenuCopyTweetId.addEventListener('click', () => {
            navigator.clipboard.writeText(t.id_str);
        });
        if(tweetInteractMoreMenuCopyUserId) tweetInteractMoreMenuCopyUserId.addEventListener('click', () => {
            navigator.clipboard.writeText(t.user.id_str);
        });
        if(tweetInteractMoreMenuShare) tweetInteractMoreMenuShare.addEventListener('click', () => {
            navigator.share({ url: `https://${location.hostname}/${t.user.screen_name}/status/${t.id_str}` });
        });
        tweetInteractMoreMenuShareDMs.addEventListener('click', () => {
            tweetUrlToShareInDMs = `https://${location.hostname}/${t.user.screen_name}/status/${t.id_str}`;
            document.getElementById('messages').click();
            setTimeout(() => {
                let title = document.querySelector('div.inbox h1.nice-header.larger');
                title.innerText = LOC.share_tweet_to.message;
            });
        });
        tweetInteractMoreMenuNewtwitter.addEventListener('click', () => {
            openInNewTab(`https://${location.hostname}/${t.user.screen_name}/status/${t.id_str}?newtwitter=true`);
        });
        tweetInteractMoreMenuEmbed.addEventListener('click', () => {
            openInNewTab(`https://publish.${location.hostname}/?query=https://${location.hostname}/${t.user.screen_name}/status/${t.id_str}&widget=tweet`);
        });
        if (t.user.id_str === user.id_str) {
            tweetInteractMoreMenuAnalytics.addEventListener('click', () => {
                openInNewTab(`/${t.user.screen_name}/status/${t.id_str}/analytics?newtwitter=true`);
            });
            tweetInteractMoreMenuDelete.addEventListener('click', async () => {
                let sure = confirm(LOC.delete_sure.message);
                if (!sure) return;
                try {
                    await API.tweet.delete(t.id_str);
                } catch (e) {
                    alert(e);
                    console.error(e);
                    return;
                }
                Array.from(document.getElementsByClassName('timeline')[0].querySelectorAll(`div.tweet[data-tweet-id="${t.id_str}"]`)).forEach(tweet => {
                    tweet.remove();
                });
                if(document.getElementById('timeline')) Array.from(document.getElementById('timeline').querySelectorAll(`div.tweet[data-tweet-id="${t.id_str}"]`)).forEach(tweet => {
                    tweet.remove();
                });
                if(options.mainTweet) {
                    let tweets = Array.from(timelineContainer.getElementsByClassName('tweet'));
                    if(tweets.length === 0) {
                        document.getElementsByClassName('modal-close')[0].click();
                    } else {
                        tweets[0].click();
                    }
                }
                if(typeof timeline !== 'undefined') {
                    timeline.data = timeline.data.filter(tweet => tweet.id_str !== t.id_str);
                }
                if(options.after) {
                    if(options.after.getElementsByClassName('tweet-self-thread-div')[0]) options.after.getElementsByClassName('tweet-self-thread-div')[0].hidden = true;
                    if(!options.after.classList.contains('tweet-main')) options.after.getElementsByClassName('tweet-interact-reply')[0].innerText = (+options.after.getElementsByClassName('tweet-interact-reply')[0].innerText - 1).toString();
                    else options.after.getElementsByClassName('tweet-footer-stat-replies')[0].innerText = (+options.after.getElementsByClassName('tweet-footer-stat-replies')[0].innerText - 1).toString();
                }
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'delete',
                    tweet: t
                } });
                document.dispatchEvent(event);
                chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
            });
        }
        tweetInteractMoreMenuMute.addEventListener('click', async () => {
            if(t.conversation_muted) {
                await API.tweet.unmute(t.id_str);
                toast.info(LOC.unmuted_convo.message);
                t.conversation_muted = false;
                tweetInteractMoreMenuMute.innerText = LOC.mute_convo.message;
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'unmute',
                    tweet: t
                } });
                document.dispatchEvent(event);
            } else {
                await API.tweet.mute(t.id_str);
                toast.info(LOC.muted_convo.message);
                t.conversation_muted = true;
                tweetInteractMoreMenuMute.innerText = LOC.unmute_convo.message;
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'mute',
                    tweet: t
                } });
                document.dispatchEvent(event);
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
        tweetInteractMoreMenuRefresh.addEventListener('click', async () => {
            let tweetData;
            try {
                tweetData = await API.tweet.getV2(t.id_str);
            } catch (e) {
                console.error(e);
                return;
            }
            if (!tweetData) {
                return;
            }
            if (tweetInteractFavorite.className.includes('tweet-interact-favorited') && !tweetData.favorited) {
                tweetInteractFavorite.classList.remove('tweet-interact-favorited');
            }
            if (tweetInteractRetweet.className.includes('tweet-interact-retweeted') && !tweetData.retweeted) {
                tweetInteractRetweet.classList.remove('tweet-interact-retweeted');
            }
            if (!tweetInteractFavorite.className.includes('tweet-interact-favorited') && tweetData.favorited) {
                tweetInteractFavorite.classList.add('tweet-interact-favorited');
            }
            if (!tweetInteractRetweet.className.includes('tweet-interact-retweeted') && tweetData.retweeted) {
                tweetInteractRetweet.classList.add('tweet-interact-retweeted');
            }
            if(!options.mainTweet) {
                tweetInteractFavorite.innerText = tweetData.favorite_count;
                tweetInteractRetweet.innerText = tweetData.retweet_count;
                tweetInteractReply.innerText = tweetData.reply_count;
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
        let downloading = false;
        if (t.extended_entities && t.extended_entities.media.length === 1) {
            tweetInteractMoreMenuDownload.addEventListener('click', () => {
                if (downloading) return;
                downloading = true;
                let media = t.extended_entities.media[0];
                let url = media.type === 'photo' ? media.media_url_https : media.video_info.variants[0].url;
                _fetch(url).then(res => res.blob()).then(blob => {
                    downloading = false;
                    let a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    
                    let ts = new Date(t.created_at).toISOString().split("T")[0];
                    let extension = url.split('.').pop();
                    //let _index = t.extended_entities.media.length > 1 ? "_"+(index+1) : "";
                    let _index = "";
                    let filename = `${t.user.screen_name}_${ts}_${t.id_str}${_index}.${extension}`;
                    let filename_template = vars.customDownloadTemplate;

                    // use the filename from the user's custom download template, if any
                    if(filename_template && (filename_template.length > 0)) {
                        const filesave_map = {
                            "user_screen_name": t.user.screen_name,
                            "user_name": t.user.name,
                            "extension": extension,
                            "timestamp": ts,
                            "id": t.id_str,
                            "index": _index
                        };
                        filename = filename_template.replace(/\{([\w]+)\}/g, (_, key) => filesave_map[key]);
                    }

                    a.download = filename;
                    a.click();
                    a.remove();
                }).catch(e => {
                    downloading = false;
                    console.error(e);
                });
            });
        }
        if (t.extended_entities && t.extended_entities.media.some(m => m.type === 'animated_gif')) {
            tweetInteractMoreMenuDownloadGifs.forEach(dgb => dgb.addEventListener('click', e => {
                if (downloading) return;
                downloading = true;
                let n = parseInt(e.target.dataset.gifno)-1;
                let videos = Array.from(tweet.getElementsByClassName('tweet-media-gif'));
                let video = videos[n];
                let canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                let ctx = canvas.getContext('2d');
                if (video.duration > 10 && !confirm(LOC.long_vid.message)) {
                    return downloading = false;
                }
                let mde = tweet.getElementsByClassName('tweet-media-data')[0];
                mde.innerText = LOC.initialization.message + '...';
                let gif = new GIF({
                    workers: 4,
                    quality: 15,
                    debug: true,
                    workerScript: window.gifWorkerUrl
                });
                video.currentTime = 0;
                video.loop = false;
                let isFirst = true;
                let step = 50;
                let interval = setInterval(async () => {
                    if(isFirst) {
                        video.currentTime = 0;
                        isFirst = false;
                        await sleep(5);
                    }
                    mde.innerText = `${LOC.initialization.message}... (${Math.round(video.currentTime/video.duration*100|0)}%)`;
                    if (video.currentTime+(step/1000) >= video.duration) {
                        clearInterval(interval);
                        gif.on('working', (frame, frames) => {
                            mde.innerText = `${LOC.converting.message}... (${frame}/${frames})`;
                        });
                        gif.on('finished', blob => {
                            mde.innerText = '';
                            let a = document.createElement('a');
                            a.href = URL.createObjectURL(blob);
                            a.download = `${t.id_str}.gif`;
                            document.body.append(a);
                            a.click();
                            a.remove();
                            downloading = false;
                            video.loop = true;
                            video.play();
                        });
                        gif.render();
                        return;
                    }
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    gif.addFrame(imgData, { delay: step });
                }, step);
            }));
        }
    
        if(options.after) {
            options.after.after(tweet);
        } else if (options.before) {
            options.before.before(tweet);
        } else if (options.prepend) {
            timelineContainer.prepend(tweet);
        } else {
            timelineContainer.append(tweet);
        }
        if(vars.enableTwemoji) twemoji.parse(tweet);
        return tweet;
    }
    async popstateChange(that) {
        that.savePageData(that.currentLocation);
        that.updateSubpage();
        if(location.pathname.includes("retweets/with_comments") && that.subpage === 'retweets_with_comments' && document.getElementById("this-is-tweet-page")) {
            return document.querySelector('.modal-close').click();
        }
        that.mediaToUpload = [];
        that.excludeUserMentions = [];
        that.linkColors = {};
        that.cursor = undefined;
        that.seenReplies = [];
        that.insertedMores = [];
        that.mainTweetLikers = [];
        let id;
        try {
            id = location.pathname.match(/status\/(\d{1,32})/)[1];
        } catch(e) {
            return that.container.getElementsByClassName('modal-close')[0].click();
        }
        let restored = await that.restorePageData();
        if(!restored) {
            if(that.subpage === 'tweet') {
                that.updateReplies(id);
            } else if(that.subpage === 'likes') {
                that.updateLikes(id);
            } else if(that.subpage === 'retweets') {
                that.updateRetweets(id);
            } else if(that.subpage === 'retweets_with_comments') {
                that.updateRetweetsWithComments(id);
            }
        } else {
            this.container.scrollTop = restored.scrollY;
        }
        that.currentLocation = location.pathname;
    }
    async onScroll(that) {
        if(this.container.scrollTop + 300 > this.container.scrollHeight - this.container.clientHeight && !that.loadingNewTweets) {
            if(this.moreBtn && that.subpage === 'tweet' && !this.moreBtn.hidden) {
                this.moreBtn.click();
            }
        }
    }
    async appendTombstone(timelineContainer, text) {
        try {
            if(typeof text === 'string') LOC.replacer_post_to_tweet.message.split('|').forEach(el => {
                let [or, nr] = el.split('->');
                or = or[0].toUpperCase() + or.slice(1);
                text = text.replace(new RegExp(or, "g"), nr);
            });
        } catch(e) {
            console.error(e);
        }
        this.tweets.push(['tombstone', text]);
        let tombstone = document.createElement('div');
        tombstone.className = 'tweet-tombstone';
        tombstone.innerHTML = text;
        timelineContainer.append(tombstone);
    }
    init() {
        document.getElementsByClassName('timeline-more')[0].addEventListener('click', async e => {
            if (!this.cursor || this.loadingNewTweets) return;
            this.loadingNewTweets = true;
            e.target.innerText = LOC.loading_tweets.message;
            let path = location.pathname;
            if(path.endsWith('/')) path = path.slice(0, -1);
            this.updateReplies(path.split('/').slice(-1)[0], this.cursor);
        });
        document.getElementsByClassName('likes-more')[0].addEventListener('click', async () => {
            if(!this.likeCursor) return;
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            this.updateLikes(id, this.likeCursor);
        });
        document.getElementsByClassName('retweets-more')[0].addEventListener('click', async () => {
            if(!this.retweetCursor) return;
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            this.updateRetweets(id, this.retweetCursor);
        });
        document.getElementsByClassName('retweets_with_comments-more')[0].addEventListener('click', async e => {
            e.target.innerText = LOC.loading_tweets.message;
            if(!this.retweetCommentsCursor) return;
            let id = location.pathname.match(/status\/(\d{1,32})/)[1];
            this.updateRetweetsWithComments(id, this.retweetCommentsCursor);
        });

        this.updateSubpage();
        let id = location.pathname.match(/status\/(\d{1,32})/)[1];
        if(this.subpage === 'tweet') {
            this.updateReplies(id);
        } else if(this.subpage === 'likes') {
            this.updateLikes(id);
        } else if(this.subpage === 'retweets') {
            this.updateRetweets(id);
        } else if(this.subpage === 'retweets_with_comments') {
            this.updateRetweetsWithComments(id);
        }
        this.popstateHelper = () => this.popstateChange(this);
        this.scrollHelper = () => this.onScroll(this);
        window.addEventListener("popstate", this.popstateHelper);
        this.container.addEventListener("scroll", this.scrollHelper, { passive: true });
    }
    close() {
        document.removeEventListener('scroll', this.onscroll);
        window.removeEventListener("popstate", this.popstateHelper);
        this.container.removeEventListener("scroll", this.scrollHelper);
    }
}
