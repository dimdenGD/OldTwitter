document.addEventListener('updateUserData', e => {
    let user = e.detail;
    document.getElementById('navbar-user-avatar').src = user.profile_image_url_https.replace("_normal", "_bigger");

    async function updateUnread() {
        let unread = await API.getUnreadCount();
        let dms = unread.dm_unread_count;
        let notifs = unread.ntab_unread_count;
        let total = unread.total_unread_count;
        let dmsElement = document.getElementById('messages-count');
        let notifElement = document.getElementById('notifications-count');
        let icon = document.getElementById('site-icon');

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
    updateUnread();
    setInterval(updateUnread, 20000);
});