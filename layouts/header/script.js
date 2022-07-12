document.addEventListener('updateUserData', e => {
    let user = e.detail;

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
    updateUnread();
    setInterval(updateUnread, 20000);
});