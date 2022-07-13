let headerGotUser = false;
let headerUserInterval = setInterval(() => {
    if(!headerGotUser) {
        const event = new CustomEvent('userRequest', { detail: '1' });
        document.dispatchEvent(event);
    }
}, 2000);
setTimeout(() => {
    document.addEventListener('updateUserData', e => {
        if(headerGotUser) return;
        headerGotUser = true;
        let user = e.detail;
        let userAvatar = document.getElementById('navbar-user-avatar');
        userAvatar.src = user.profile_image_url_https.replace("_normal", "_bigger");
        document.getElementById('navbar-user-menu-profile').href = `/${user.screen_name}`;
    
        async function updateUnread() {
            let unread = await API.getUnreadCount();
            let dms = unread.dm_unread_count;
            let notifs = unread.ntab_unread_count;
            let total = unread.total_unread_count;
            let dmsElement = document.getElementById('messages-count');
            let notifElement = document.getElementById('notifications-count');
            let icon = document.getElementById('site-icon');
            if(location.pathname.startsWith('/old/notifications')) {
                notifs = 0;
            }
    
            if(dms > 0) {
                dmsElement.hidden = false;
                dmsElement.innerText = dms;
            } else {
                dmsElement.hidden = true;
            }
            if(notifs > 0) {
                notifElement.hidden = false;
                notifElement.innerText = notifs;
            } else {
                notifElement.hidden = true;
            }
            icon.href = total > 0 ? chrome.runtime.getURL(`images/logo32_notification.png`) : chrome.runtime.getURL(`images/logo32.png`);
        }
        async function updateAccounts() {
            let accounts = (await API.getAccounts()).users;
            let accountsElement = document.getElementById('navbar-user-accounts');
            accountsElement.innerHTML = '';
            accounts.forEach(account => {
                let accountElement = document.createElement('div');
                accountElement.classList.add('navbar-user-account');
                accountElement.innerHTML = `<img src="${account.avatar_image_url.replace("_normal", "_bigger")}" class="navbar-user-account-avatar" width="16" height="16"> ${account.screen_name}`;
                accountElement.addEventListener('click', async () => {
                    if(account.screen_name === user.screen_name) return alert("You're already on this account!");
                    try {
                        await API.switchAccount(account.user_id);
                        window.location.reload();
                    } catch(e) {
                        console.error(e);
                        alert(e);
                    }
                });
                accountsElement.appendChild(accountElement, document.createElement('br'));
            });
        }
        
        document.getElementById('navbar-tweet-button').addEventListener('click', () => {
            let modal = createModal(/*html*/`
                <div class="navbar-new-tweet-container">
                    <div class="navbar-new-tweet">
                        <img width="35" height="35" class="navbar-new-tweet-avatar">
                        <span class="navbar-new-tweet-char">0/280</span>
                        <textarea maxlength="280" class="navbar-new-tweet-text" placeholder="What's happening?"></textarea>
                        <div class="navbar-new-tweet-media-div">
                            <span class="navbar-new-tweet-media"></span>
                        </div>
                        <div class="navbar-new-tweet-focused">
                            <div class="navbar-new-tweet-media-cc"><div class="navbar-new-tweet-media-c"></div></div>
                            <button class="navbar-new-tweet-button nice-button">Tweet</button>
                            <br><br>
                        </div>
                    </div>
                </div>
            `);
            const newTweetText = modal.getElementsByClassName('navbar-new-tweet-text')[0];
            const newTweetChar = modal.getElementsByClassName('navbar-new-tweet-char')[0];
            const newTweetMedia = modal.getElementsByClassName('navbar-new-tweet-media')[0];
            const newTweetMediaDiv = modal.getElementsByClassName('navbar-new-tweet-media-c')[0];
            const newTweetButton = modal.getElementsByClassName('navbar-new-tweet-button')[0];
    
            modal.getElementsByClassName('navbar-new-tweet-avatar')[0].src = user.profile_image_url_https.replace("_normal", "_bigger");
            function updateCharCount(e) {
                let char = e.target.value.length;
                let charElement = newTweetChar;
                charElement.innerText = `${char}/280`;
                if(char > 265) {
                    charElement.style.color = "#c26363";
                } else {
                    charElement.style.color = "";
                }
            }
            newTweetText.addEventListener('keyup', updateCharCount);
            newTweetText.addEventListener('keydown', updateCharCount);
            let mediaToUpload = []; 
            newTweetMedia.addEventListener('click', () => {
                getMedia(mediaToUpload, newTweetMediaDiv); 
            });
            newTweetButton.addEventListener('click', async () => {
                let tweet = newTweetText.value;
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
                let tweetObject = {
                    status: tweet,
                    auto_populate_reply_metadata: true,
                    batch_mode: 'off',
                    exclude_reply_user_ids: '',
                    cards_platform: 'Web-13',
                    include_entities: 1,
                    include_user_entities: 1,
                    include_cards: 1,
                    send_error_codes: 1,
                    tweet_mode: 'extended',
                    include_ext_alt_text: true,
                    include_reply_count: true
                };
                if (uploadedMedia.length > 0) {
                    tweetObject.media_ids = uploadedMedia.join(',');
                }
                try {
                    let tweet = await API.postTweet(tweetObject);
                    tweet._ARTIFICIAL = true;
                    const event = new CustomEvent('newTweet', { detail: tweet });
                    document.dispatchEvent(event);
                } catch (e) {
                    document.getElementById('new-tweet-button').disabled = false;
                    console.error(e);
                }
                modal.remove();
            });
        });
    
        let searchInput = document.getElementById('search-input');
        let searchResults = document.getElementById('search-results');
        searchInput.addEventListener('focus', () => {
            if(searchInput.value.length > 0) searchResults.hidden = false;
        });
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                searchResults.hidden = true;
            }, 50);
        });
        searchInput.addEventListener('keyup', async (e) => {
            let query = searchInput.value;
            if(query.length > 0) {
                searchResults.hidden = false;
            } else {
                searchResults.hidden = true;
            }
            let search = await API.search(query);
            searchResults.innerHTML = '';
            search.topics.forEach(({topic}) => {
                let topicElement = document.createElement('a');
                topicElement.href = `/search?q=${topic}`;
                topicElement.className = 'search-result-item';
                topicElement.innerText = topic;
                searchResults.appendChild(topicElement);
            });
            search.users.forEach(user => {
                let userElement = document.createElement('a');
                userElement.href = `/${user.screen_name}`;
                userElement.className = 'search-result-item';
                userElement.innerHTML = `
                    <img width="16" height="16" class="search-result-item-avatar" src="${user.profile_image_url_https}">
                    <span class="search-result-item-name ${user.verified ? 'search-result-item-verified' : ''}">${user.name}</span>
                    <span class="search-result-item-screen-name">@${user.screen_name}</span>
                `;
                searchResults.appendChild(userElement);
            });
        });
    
        let userMenu = document.getElementById('navbar-user-menu');
        userAvatar.addEventListener('click', () => {
            userMenu.hidden = false;
            setTimeout(() => {
                document.body.addEventListener('click', e => {
                    setTimeout(() => {
                        userMenu.hidden = true;
                    }, 50);
                }, { once: true });
            }, 50);
        });
        updateUnread();
        updateAccounts();
        setInterval(updateAccounts, 60000*5);
        setInterval(updateUnread, 20000);
    });
}, 10);