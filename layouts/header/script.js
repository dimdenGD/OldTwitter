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
            <div id="navbar-new-tweet-container">
                <div id="navbar-new-tweet">
                    <img width="35" height="35" class="tweet-avatar" id="navbar-new-tweet-avatar">
                    <span id="new-tweet-char">0/280</span>
                    <textarea id="navbar-new-tweet-text" placeholder="What's happening?"></textarea>
                    <div id="navbar-new-tweet-media-div">
                        <span id="navbar-new-tweet-media"></span>
                    </div>
                    <div id="navbar-new-tweet-focused">
                        <div id="navbar-new-tweet-media-cc"><div id="navbar-new-tweet-media-c"></div></div>
                        <button id="navbar-new-tweet-button" class="nice-button">Tweet</button>
                        <br><br>
                    </div>
                </div>
            </div>
        `); 
    });
    updateUnread();
    setInterval(updateUnread, 20000);
});