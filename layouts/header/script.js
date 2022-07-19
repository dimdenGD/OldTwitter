let headerGotUser = false;
let savedSearches = [], lastSearches = [];
let inboxData = [];
let customSet = false;

setTimeout(() => {
    let userDataFunction = async e => {
        if(headerGotUser || Object.keys(e.detail).length === 0) return;
        headerGotUser = true;
        let user = e.detail;
        let userAvatar = document.getElementById('navbar-user-avatar');
        userAvatar.src = user.profile_image_url_https.replace("_normal", "_bigger");
        document.getElementById('navbar-user-menu-profile').href = `/${user.screen_name}`;

        let root = document.querySelector(":root");
        let vars = await new Promise((resolve) => {
            chrome.storage.sync.get(['linkColor', 'font', 'heartsNotStars', 'enableTwemoji'], data => {
                resolve(data);
            });
        });
        if(!customSet && vars.linkColor && (!user.profile_link_color || user.profile_link_color === '1DA1F2')) {
            root.style.setProperty('--link-color', vars.linkColor);
        }
        if(vars.font) {
            root.style.setProperty('--font', vars.font);
        }
        if(vars.heartsNotStars) {
            root.style.setProperty('--favorite-icon-content', '"\\f148"');
            root.style.setProperty('--favorite-icon-content-notif', '"\\f015"');
            root.style.setProperty('--favorite-icon-color', 'rgb(249, 24, 128)');
        }
    
        // util
        async function updateUnread() {
            let unread = await API.getUnreadCount();
            let dms = unread.dm_unread_count;
            let notifs = unread.ntab_unread_count;
            let total = unread.total_unread_count;
            let dmsElement = document.getElementById('messages-count');
            let notifElement = document.getElementById('notifications-count');
            let icon = document.getElementById('site-icon');
            if(location.pathname.startsWith('/notifications')) {
                notifs = 0;
            }
            let inboxModal = document.getElementsByClassName('inbox-modal')[0];
            if(inboxModal) {
                dms = 0;
            }
            total = dms + notifs;
    
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
                        if((typeof(e) === 'string' && e.includes('User not found.')) || e.errors[0].code === 50) {
                            window.location = 'https://mobile.twitter.com/account/switch';
                        } else {
                            alert(e);
                        }
                        console.error(e);
                    }
                });
                accountsElement.appendChild(accountElement, document.createElement('br'));
            });
            document.getElementById('navbar-user-menu-logout').addEventListener('click', async () => {
                let modal = createModal(/*html*/`
                    <span style="font-size:14px">OldTwitter only works when you're logged in.<br>
                    If you don't have any other accounts in list you'll be redirected to login page. Are you sure?</span>
                    <br><br>
                    <button class="nice-button">Log me out</button>
                `);
                let button = modal.querySelector('button');
                button.addEventListener('click', async () => {
                    await API.logout();
                    window.location.reload();
                });
            });
        }
        async function updateInboxData() {
            inboxData = await API.getInbox();
            if(inboxData.status === "HAS_MORE" && !cursor) {
                cursor = inboxData.min_entry_id;
            } else {
                cursor = undefined;
            };

            return true;
        }
        
        // messages
        let cursor;
        let modal;
        let lastConvo;
        function compare(e, t) {
            var i = e.length - t.length;
            return i || (e > t ? i = 1 : e < t && (i = -1)),
            i
        };
        function renderConversation(convo, convoId, newMessages = true, updateConvo = true) {
            if(updateConvo) {
                lastConvo = convo;
                lastConvo.conversation_id = convoId;
            } else {
                if(!convo.users) convo.users = {};
                if(!lastConvo.users) lastConvo.users = {};
                lastConvo.users = Object.assign(lastConvo.users, convo.users);
                lastConvo.entries.forEach(e => {
                    e.added = true;
                });
                lastConvo.entries = lastConvo.entries.concat(convo.entries);
                let seen = [];
                lastConvo.entries = lastConvo.entries.filter(entry => {
                    let val = Object.values(entry)[0];
                    if(seen.includes(val.id)) return false;
                    seen.push(val.id);
                    return true; 
                });
            }
            if(inboxData) {
                let conversations = Array.isArray(inboxData.conversations) ? inboxData.conversations : Object.values(inboxData.conversations);
                let realConvo = conversations.find(c => c.id_str === lastConvo.id_str);
                if(+lastConvo.max_entry_id >= +realConvo.last_read_event_id) {
                    API.markRead(lastConvo.max_entry_id);
                    realConvo.last_read_event_id = lastConvo.max_entry_id;
                }
            }
            let messageBox = modal.querySelector('.messages-list');
            if(!lastConvo.entries) {
                modal.getElementsByClassName('messages-load-more')[0].hidden = true;
                return;
            }
            lastConvo.entries = lastConvo.entries.reverse();
            let messageElements = [];
            for(let i in lastConvo.entries) {
                if(lastConvo.entries[i].added) continue;
                let m = lastConvo.entries[i].message;
                if(!m) continue;
                let sender = lastConvo.users[m.message_data.sender_id];

                let messageElement = document.createElement('div');
                messageElement.classList.add('message-element');
                if(sender.id_str !== user.id_str) {
                    messageElement.classList.add('message-element-other');
                }
                messageElement.id = `message-${m.id}`;
                messageElement.innerHTML = `
                    ${sender.id_str !== user.id_str ? `
                        <a href="https://twitter.com/${sender.screen_name}"><img src="${sender.profile_image_url_https.replace("_normal", "_bigger")}" width="32" height="32"></a>
                        <span class="message-body">${escape(m.message_data.text).replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>')}</span>
                        <span class="message-time" data-timestamp="${m.time}">${timeElapsed(new Date(+m.time))}</span>
                    ` : `
                        <span class="message-menu-open"></span>
                        <div class="message-menu" hidden>
                            <span class="message-menu-delete">Delete for you</span>
                        </div>
                        <span class="message-time" data-timestamp="${m.time}">${timeElapsed(new Date(+m.time))}</span>
                        <span class="message-body">${escape(m.message_data.text).replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>')}</span>
                    `}
                `;
                let menuOpen = messageElement.querySelector('.message-menu-open');
                if(menuOpen) {
                    let menu = messageElement.querySelector('.message-menu');
                    let menuDelete = messageElement.querySelector('.message-menu-delete');

                    menuDelete.addEventListener('click', () => {
                        API.deleteMessage(m.id);
                        messageElement.remove();
                    });

                    let clicked;
                    menuOpen.addEventListener('click', () => {
                        if(clicked) return;
                        clicked = true;
                        menu.hidden = false;
                        setTimeout(() => {
                            document.addEventListener('click', () => {
                                setTimeout(() => {
                                    clicked = false;
                                    menu.hidden = true;
                                }, 100);
                            }, { once: true })
                        }, 100);
                    });
                }
                let as = Array.from(messageElement.getElementsByTagName('a'));
                if(m.message_data.entities && m.message_data.entities.urls) {
                    m.message_data.entities.urls.forEach(url => {
                        let a = as.find(a => a.href === url.url);
                        if(!a) return;
                        let removed = false;
                        if(m.message_data.attachment) {
                            if(m.message_data.attachment.photo) {
                                if(a.href === m.message_data.attachment.photo.url) {
                                    removed = true;
                                    a.remove();
                                }
                            }
                            if(m.message_data.attachment.animated_gif) {
                                if(a.href === m.message_data.attachment.animated_gif.url) {
                                    removed = true;
                                    a.remove();
                                }
                            }
                        }
                        if(a && !removed) {
                            a.href = url.expanded_url;
                            a.innerText = url.display_url;
                            a.target = "_blank";
                        }
                    });
                }
                if(m.message_data.attachment) {
                    let attachment = m.message_data.attachment;
                    if(attachment.photo) {
                        let photo = attachment.photo;
                        let photoElement = document.createElement('img');
                        photoElement.src = photo.media_url_https;
                        photoElement.classList.add('message-element-media');
                        if(photo.original_info.width > 200) {
                            photoElement.width = 200;
                        } else {
                            photoElement.width = photo.original_info.width;
                        }
                        if(photo.original_info.height > 100) {
                            photoElement.height = 100;
                        } else {
                            photoElement.height = photo.original_info.height;
                        }
                        photoElement.addEventListener('click', () => {
                            new Viewer(photoElement);
                        })
                        messageElement.append(document.createElement('br'), photoElement);
                    }
                    if(attachment.animated_gif) {
                        let gif = attachment.animated_gif;
                        let gifElement = document.createElement('video');
                        gifElement.src = gif.video_info.variants[0].url;
                        gifElement.muted = true;
                        gifElement.loop = true;
                        gifElement.autoplay = true;
                        if(gif.original_info.width > 200) {
                            gifElement.width = 200;
                        } else {
                            gifElement.width = gif.original_info.width;
                        }
                        if(gif.original_info.height > 100) {
                            gifElement.height = 100;
                        } else {
                            gifElement.height = gif.original_info.height;
                        }
                        gifElement.classList.add('message-element-media');
                        messageElement.append(document.createElement('br'), gifElement);
                    }
                }
                let span = messageElement.getElementsByClassName('message-body')[0];
                if(span.innerHTML === '' || span.innerHTML === ' ') {
                    span.remove();
                }
                if(vars.enableTwemoji) {
                    twemoji.parse(messageElement);
                }
                messageElements.push(messageElement);
            }
            if(!newMessages) {
                messageElements = messageElements.reverse();
                for(let i in messageElements) {
                    messageBox.prepend(messageElements[i], document.createElement('br'));
                }
            } else {
                for(let i in messageElements) {
                    messageBox.append(messageElements[i], document.createElement('br'));
                }
            }
            if(newMessages) {
                let modalElement = document.getElementsByClassName('modal-content')[0];
                modalElement.scrollTop = modalElement.scrollHeight;
            }

            const loadMoreMessages = modal.querySelector('.messages-load-more');
            if(lastConvo.status === "HAS_MORE") {
                loadMoreMessages.hidden = false;
            } else {
                loadMoreMessages.hidden = true;
            }
        }
        function renderInboxMessages(inbox, inboxList) {
            inbox.conversations = Object.values(inbox.conversations).sort((a, b) => (+b.sort_timestamp)-(+a.sort_timestamp));
            for(let i in inbox.conversations) {
                let c = inbox.conversations[i];
                let lastMessage = inbox.entries.find(e => (e.message && e.message.id === c.max_entry_id) || (e.trust_conversation && e.trust_conversation.id === c.max_entry_id));
                if(!lastMessage) {
                    continue;
                };
                if(lastMessage.message) {
                    lastMessage = lastMessage.message;
                } else if(lastMessage.trust_conversation) {
                    lastMessage = lastMessage.trust_conversation;
                };
                let messageUsers = c.participants.filter(p => p.user_id !== user.id_str).map(p => inbox.users[p.user_id]);
                let messageElement = document.createElement('div');
                messageElement.classList.add('inbox-message');
                let isUnread = false;
                if(compare(lastMessage.id, c.last_read_event_id) < 1) {}
                else {
                    messageElement.classList.add('inbox-message-unread');
                    isUnread = true;
                }
                messageElement.innerHTML = /*html*/`
                    <img src="${messageUsers.length === 1 ? messageUsers[0].profile_image_url_https : chrome.runtime.getURL(`/images/group.jpg`)}" width="48" height="48" class="inbox-message-avatar">
                    <div class="inbox-text">
                        <b class="inbox-name">${messageUsers.length === 1 ? messageUsers[0].name : messageUsers.map(i => i.name).join(', ').slice(0, 128)}</b>
                        <span class="inbox-screenname">${messageUsers.length === 1 ? "@"+messageUsers[0].screen_name : ''}</span>
                        <span class="inbox-time">${timeElapsed(new Date(+lastMessage.time))}</span>
                        <br>
                        <span class="inbox-message-preview">${lastMessage.reason ? 'Accepted conversation' : lastMessage.message_data.text === 'dmservice_reaction_one_to_one_text' ? `${lastMessage.message_data.sender_id === user.id_str ? 'You reacted to message' : `${messageUsers[0].name} reacted to message`}` : escape(lastMessage.message_data.text)}</span>
                    </div>
                `;
                if(vars.enableTwemoji) {
                    twemoji.parse(messageElement);
                }
                const messageHeaderName = modal.querySelector('.message-header-name');
                const messageHeaderAvatar = modal.querySelector('.message-header-avatar');
                const messageHeaderLink = modal.querySelector('.message-header-link');
                const messageHeaderBack = modal.querySelector('.message-header-back');
                messageElement.addEventListener('click', async () => {
                    let messageData = await API.getConversation(c.conversation_id);
                    modal.querySelector('.message-box').hidden = false;
                    modal.querySelector('.home-top').hidden = true;
                    modal.querySelector('.name-top').hidden = false;
                    modal.querySelector('.inbox').hidden = true;
                    modal.querySelector('.new-message-box').hidden = true;
                    messageHeaderName.innerText = messageUsers.length === 1 ? messageUsers[0].name : messageUsers.map(i => i.name).join(', ').slice(0, 80);
                    messageHeaderAvatar.src = messageUsers.length === 1 ? messageUsers[0].profile_image_url_https : chrome.runtime.getURL(`/images/group.jpg`);
                    if(messageUsers.length === 1) messageHeaderLink.href = `https://twitter.com/${messageUsers[0].screen_name}`;

                    renderConversation(messageData, c.conversation_id);
                });
                messageHeaderBack.addEventListener('click', () => {
                    modal.remove();
                    document.getElementById('messages').click();
                });
                if(isUnread) {
                    inboxList.prepend(messageElement);
                } else {
                    inboxList.append(messageElement);
                }
            }
        }
        document.getElementById('messages').addEventListener('click', async e => {
            e.preventDefault();
            let inbox = inboxData;

            modal = createModal(/*html*/`
                <div class="inbox">
                    <div class="inbox-top home-top">
                        <h1 class="larger nice-header">Direct messages</h1>
                        <div class="inbox-buttons">
                        <button class="nice-button inbox-refresh" title="Refresh">
                                <span class="inbox-refresh-icon"></span>
                            </button>
                            <button class="nice-button inbox-readall" title="Mark all as read">
                                <span class="inbox-readall-icon"></span>
                            </button>
                            <button class="nice-button inbox-new" title="New message">
                                <span class="inbox-new-icon"></span>
                            </button>
                        </div>
                        <hr>
                    </div>
                    <br><br><br>
                    <div class="inbox-list"></div>
                    <div class="center-text load-more" ${cursor ? '' : 'hidden'}>Load more</div>
                </div>
                <div class="message-box" hidden>
                    <div class="inbox-top name-top">
                        <span class="message-header-back"></span>
                        <a class="message-header-link">
                            <img class="message-header-avatar" width="32" height="32">
                            <h1 class="larger message-header-name nice-header">Name</h1>
                        </a>
                        <span class="message-leave"></span>
                        <hr>
                    </div>
                    <br><br><br><br>
                    <div class="messages-load-more center-text" style="margin-top:-18px;">Load more messages</div>
                    <div class="messages-list"></div>
                    <div class="message-new">
                        <div class="message-new-media"></div>
                        <span class="message-new-media-btn"></span>
                        <textarea type="text" class="message-new-input" placeholder="Type your message"></textarea>
                        <button class="nice-button message-new-send">Send</button>
                    </div>
                </div>
                <div class="new-message-box" hidden>
                    <div class="inbox-top new-name-top">
                        <span class="message-header-back message-new-message-back"></span>
                        <h1 class="larger message-header-name nice-header" style="float: left;margin-left: 14px;">New message</h1>
                        <button class="new-message-group nice-button" hidden>Create new group</button>
                        <br>
                        <input type="text" class="new-message-user-search" placeholder="Search people" style="width:551px">
                        <hr>
                    </div>
                    <br><br><br><br><br>
                    <div class="new-message-results"></div>
                </div>
            `, "inbox-modal");
            const inboxList = modal.querySelector('.inbox-list');
            const readAll = modal.querySelector('.inbox-readall');
            const refresh = modal.querySelector('.inbox-refresh');
            const newInbox = modal.querySelector('.inbox-new');
            const newMedia = modal.querySelector('.message-new-media');
            const newMediaButton = modal.querySelector('.message-new-media-btn');
            const newMediaInput = modal.querySelector('.message-new-input');
            const newSend = modal.querySelector('.message-new-send');
            const newInput = modal.querySelector('.message-new-input');
            const loadMore = modal.querySelector('.load-more');
            const loadMoreMessages = modal.querySelector('.messages-load-more');
            const userSearch = modal.querySelector('.new-message-user-search');
            const newMessageResults = modal.querySelector('.new-message-results');
            const leaveConvo = modal.querySelector('.message-leave');

            newInbox.addEventListener('click', () => {
                modal.querySelector('.inbox').hidden = true;
                modal.querySelector('.new-message-box').hidden = false;
                modal.querySelector('.name-top').hidden = true;
                modal.querySelector('.home-top').hidden = true;
                modal.querySelector('.message-box').hidden = true;
            });
            modal.getElementsByClassName('message-new-message-back')[0].addEventListener('click', () => {
                modal.remove();
                document.getElementById('messages').click();
            });
            leaveConvo.addEventListener('click', async () => {
                if(!lastConvo || !lastConvo.conversation_id) return;
                let c = confirm('Are you sure you want to leave/remove this conversation?');
                if(c) {
                    await API.deleteConversation(lastConvo.conversation_id);
                    modal.remove();
                    await updateInboxData();
                }
            });
            userSearch.addEventListener('keyup', async () => {
                let q = userSearch.value;
                let res = await API.search(q);
                newMessageResults.innerHTML = '';
                res.users.slice(0, 5).forEach(u => {
                    let userElement = document.createElement('div');
                    userElement.classList.add('new-message-user');
                    userElement.innerHTML = `
                        <img class="new-message-user-avatar" src="${u.profile_image_url_https.replace("_normal", "_bigger")}" width="48" height="48">
                        <div class="new-message-user-text">
                            <b class="new-message-user-name">${escape(u.name)}</b>
                            <span class="new-message-user-screenname">@${u.screen_name}</span>
                        </div>
                    `;
                    userElement.addEventListener('click', async () => {
                        const messageHeaderName = modal.querySelector('.message-header-name');
                        const messageHeaderAvatar = modal.querySelector('.message-header-avatar');
                        const messageHeaderLink = modal.querySelector('.message-header-link');
                        let messageData = await API.getConversation(`${user.id_str}-${u.id_str}`);
                        modal.querySelector('.message-box').hidden = false;
                        modal.querySelector('.home-top').hidden = true;
                        modal.querySelector('.name-top').hidden = false;
                        modal.querySelector('.inbox').hidden = true;
                        modal.querySelector('.new-message-box').hidden = true;
                        messageHeaderName.innerText = u.name;
                        messageHeaderAvatar.src = u.profile_image_url_https;
                        messageHeaderLink.href = `https://twitter.com/${u.screen_name}`;

                        renderConversation(messageData, `${user.id_str}-${u.id_str}`);
                    });
                    newMessageResults.appendChild(userElement);
                });
            });

            let mediaToUpload = []; 
            newMediaButton.addEventListener('click', () => {
                getDMMedia(mediaToUpload, newMedia, document.querySelector('.modal-content')); 
            });
            newInput.addEventListener('keypress', e => {
                if(e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    newSend.click();
                }
            });
            newSend.addEventListener('click', async () => {
                let message = newMediaInput.value;
                if (message.length === 0 && mediaToUpload.length === 0) return;
                newSend.disabled = true;
                let uploadedMedia = [];
                for (let i in mediaToUpload) {
                    let media = mediaToUpload[i];
                    try {
                        media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = false;
                        let mediaId = await API.uploadMedia({
                            media_type: media.type,
                            media: media.data,
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
                let obj = {
                    text: message,
                    conversation_id: lastConvo.conversation_id
                };
                if (uploadedMedia.length > 0) {
                    obj.media_id = uploadedMedia.join(',');
                }
                try {
                    let sentMessage = await API.sendMessage(obj);
                    newSend.disabled = false;
                    newInput.value = "";
                    mediaToUpload = [];
                    newMedia.innerHTML = "";
                    sentMessage.conversation_id = lastConvo.conversation_id;
                    renderConversation(sentMessage, lastConvo.conversation_id, true, false);
                } catch (e) {
                    console.error(e);
                    if(String(e).includes('You cannot send messages to this user.')) {
                        let messageList = modal.querySelector('.messages-list');
                        messageList.innerHTML = 'You cannot send messages to this user.';
                        return;
                    }
                    newSend.disabled = false;
                }
            });
            

            loadMore.addEventListener('click', async () => {
                let moreInbox = await API.getInbox(cursor);
                if(moreInbox.status === "HAS_MORE") {
                    cursor = moreInbox.min_entry_id;
                } else {
                    cursor = undefined;
                }
                renderInboxMessages(moreInbox, inboxList);
            });
            loadMoreMessages.addEventListener('click', async () => {
                console.log(lastConvo);
                let moreMessages = await API.getConversation(lastConvo.conversation_id, lastConvo.min_entry_id);
                renderConversation(moreMessages, lastConvo.conversation_id, false);
            });

            readAll.addEventListener('click', async () => {
                await API.markRead(inbox.last_seen_event_id);
                let unreadMessages = Array.from(document.getElementsByClassName('inbox-message-unread'));
                unreadMessages.forEach(message => {
                    message.classList.remove('inbox-message-unread');
                });
                await updateInboxData();
                modal.remove();
                document.getElementById('messages').click();
            });
            refresh.addEventListener('click', async () => {
                await updateInboxData();
                modal.remove();
                document.getElementById('messages').click();
            });

            renderInboxMessages(inbox, inboxList);
        });
        setInterval(() => {
            let times = Array.from(document.getElementsByClassName('message-time'));
            times.forEach(time => {
                time.innerText = timeElapsed(+time.dataset.timestamp);
            });
        }, 10000);
        let updateCursor;
        setInterval(async () => {
            let updates = await API.getUserUpdates(updateCursor);
            updateCursor = Object.values(updates)[0].cursor;
            if(updates.user_events && updates.user_events.conversations && lastConvo) {
                for(let i in updates.user_events.conversations) {
                    let c = updates.user_events.conversations[i];
                    if(c.conversation_id === lastConvo.conversation_id) {
                        updates.user_events.entries.forEach(e => {
                            if(e.message_delete && e.message_delete.conversation_id === lastConvo.conversation_id) {
                                let messages = e.message_delete.messages;
                                for(let j in messages) {
                                    let message = messages[j];
                                    let messageElement = document.getElementById(`message-${message.message_id}`);
                                    if(messageElement) {
                                        messageElement.remove();
                                    }
                                }
                            }
                        });
                        updates.user_events.entries = updates.user_events.entries.filter(m => m.message && m.message.conversation_id === lastConvo.conversation_id);
                        renderConversation(updates.user_events, lastConvo.conversation_id, true, false);
                    }
                }
            }
        }, 5000);
        
        // tweet
        document.getElementById('navbar-tweet-button').addEventListener('click', () => {
            let modal = createModal(/*html*/`
                <div class="navbar-new-tweet-container">
                    <div class="navbar-new-tweet">
                        <img width="35" height="35" class="navbar-new-tweet-avatar">
                        <span class="navbar-new-tweet-char">0/280</span>
                        <textarea maxlength="280" class="navbar-new-tweet-text" placeholder="What's happening?"></textarea>
                        <div class="navbar-new-tweet-user-search" class="box" hidden></div>
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
            const newTweetUserSearch = modal.getElementsByClassName('navbar-new-tweet-user-search')[0];

            let selectedIndex = 0;
    
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
            newTweetText.addEventListener('keyup', e => {
                updateCharCount(e);
                if(e.key === "Enter" && e.ctrlKey) {
                    newTweetButton.click();
                }
            });
            newTweetText.addEventListener('keypress', async e => {
                if ((e.key === 'Enter' || e.key === 'Tab') && !newTweetUserSearch.hidden) {
                    let activeSearch = newTweetUserSearch.querySelector('.search-result-item-active');
                    if(!e.ctrlKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        newTweetText.value = newTweetText.value.split("@").slice(0, -1).join('@').split(" ").slice(0, -1).join(" ") + ` @${activeSearch.querySelector('.search-result-item-screen-name').innerText.slice(1)} `;
                        if(newTweetText.value.startsWith(" ")) newTweetText.value = newTweetText.value.slice(1);
                        if(newTweetText.value.length > 280) newTweetText.value = newTweetText.value.slice(0, 280);
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
                    let users = (await API.search(e.target.value.match(/@([\w+]{1,15}\b)$/)[1])).users;
                    newTweetUserSearch.innerHTML = '';
                    users.forEach((user, index) => {
                        let userElement = document.createElement('span');
                        userElement.className = 'search-result-item';
                        if(index === 0) userElement.classList.add('search-result-item-active');
                        userElement.innerHTML = `
                            <img width="16" height="16" class="search-result-item-avatar" src="${user.profile_image_url_https}">
                            <span class="search-result-item-name ${user.verified ? 'search-result-item-verified' : ''}">${user.name}</span>
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
                updateCharCount(e);
            });
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

        // search
        let searchInput = document.getElementById('search-input');
        let searchResults = document.getElementById('search-results');
        let searchIcon = document.getElementById('search-icon');

        let selectedIndex = -1;

        async function loadDefaultSearches() {
            searchResults.innerHTML = '';

            await new Promise(resolve => chrome.storage.local.get(['lastSearches'], data => {
                lastSearches = data.lastSearches;
                if(!lastSearches) lastSearches = [];
                resolve(1);
            }));
            if(savedSearches.length === 0) {
                try {
                    savedSearches = await API.getSavedSearches();
                } catch(e) {}
            }
            if(lastSearches.length > 0) {
                let span = document.createElement('span');
                span.innerText = "Last Searches";
                searchResults.append(span);
                for(let i in lastSearches) {
                    let topic = lastSearches[i];
                    let topicElement = document.createElement('a');
                    topicElement.href = `/search?q=${topic}`;
                    topicElement.className = 'search-result-item';
                    topicElement.innerText = topic;
                    if(location.pathname.startsWith('/search')) topicElement.addEventListener('click', e => {
                        e.preventDefault();
                        searchResults.hidden = true;
                        searchInput.value = topic;
                        let event = new Event('newSearch');
                        document.dispatchEvent(event);
                    });
                    let removeTopic = document.createElement('span');
                    removeTopic.innerText = '×';
                    removeTopic.className = 'search-result-item-remove';
                    removeTopic.addEventListener('click', () => {
                        lastSearches.splice(i, 1);
                        chrome.storage.local.set({lastSearches: lastSearches});
                        topicElement.remove();
                        removeTopic.remove();
                    });
                    searchResults.append(topicElement, removeTopic);
                }
            }
            if(savedSearches.length > 0) {
                let span = document.createElement('span');
                span.innerText = "Saved Searches";
                searchResults.append(span);
                for(let i in savedSearches) {
                    let topic = savedSearches[i].query;
                    let topicId = savedSearches[i].id_str;
                    let topicElement = document.createElement('a');
                    topicElement.href = `/search?q=${topic}`;
                    topicElement.className = 'search-result-item';
                    topicElement.innerText = topic;
                    if(location.pathname.startsWith('/search')) topicElement.addEventListener('click', e => {
                        e.preventDefault();
                        searchResults.hidden = true;
                        searchInput.value = topic;
                        let event = new Event('newSearch');
                        document.dispatchEvent(event);
                    });
                    let removeTopic = document.createElement('span');
                    removeTopic.innerText = '×';
                    removeTopic.className = 'search-result-item-remove';
                    removeTopic.addEventListener('click',async () => {
                        await API.deleteSavedSearch(topicId);
                        savedSearches.splice(i, 1);
                        topicElement.remove();
                        removeTopic.remove();
                    });
                    searchResults.append(topicElement, removeTopic);
                }
            }
        }

        searchInput.addEventListener('focus', () => {
            searchResults.hidden = false;
            if(searchInput.value.length === 0) {
                loadDefaultSearches();
            } 
        });
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                searchResults.hidden = true;
            }, 100);
        });
        searchInput.addEventListener('keyup', async (e) => {
            let query = searchInput.value;
            let searchElements = Array.from(searchResults.children).filter(e => e.tagName === "A");
            let activeSearch = searchElements[selectedIndex];
            if(e.key === "Enter") {
                if(activeSearch) {
                    activeSearch.click();
                } else {
                    searchIcon.click();
                }
                return;
            }
            if(activeSearch) activeSearch.classList.remove('search-result-item-active');
            if(e.key === 'ArrowDown') {
                if(selectedIndex < searchElements.length - 1) {
                    selectedIndex++;
                    searchElements[selectedIndex].classList.add('search-result-item-active');
                } else {
                    selectedIndex = -1;
                }
                return;
            }
            if(e.key === 'ArrowUp') {
                if(selectedIndex > -1) {
                    selectedIndex--;
                    if(searchElements[selectedIndex]) searchElements[selectedIndex].classList.add('search-result-item-active');
                } else {
                    selectedIndex = searchElements.length - 1;
                    searchElements[selectedIndex].classList.add('search-result-item-active');
                }
                return;
            }
            if(query.length === 0) {
                return loadDefaultSearches();
            }
            let search = await API.search(query);
            searchResults.innerHTML = '';
            search.topics.forEach(({topic}) => {
                let topicElement = document.createElement('a');
                topicElement.href = `/search?q=${topic}`;
                topicElement.className = 'search-result-item';
                topicElement.innerText = topic;
                if(location.pathname.startsWith('/search')) topicElement.addEventListener('click', e => {
                    e.preventDefault();
                    searchResults.hidden = true;
                    searchInput.value = topic;
                    let event = new Event('newSearch');
                    document.dispatchEvent(event);
                });
                searchResults.appendChild(topicElement);
            });
            search.users.forEach((user) => {
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
        searchIcon.addEventListener('click', () => {
            lastSearches.push(searchInput.value);
            if(lastSearches.length > 5) {
                lastSearches.shift();
            }
            lastSearches = [...new Set(lastSearches)];
            chrome.storage.local.set({
                lastSearches
            }, () => {
                if(location.pathname.startsWith('/search')) {
                    searchResults.hidden = true;
                    let event = new Event('newSearch');
                    document.dispatchEvent(event);
                } else {
                    location.href = `/search?q=${searchInput.value}`;
                }
            });
        });

        document.addEventListener('messageUser', e => {
            document.getElementById('messages').click();
            setTimeout(async () => {
                let convo_id = e.detail.id;
                let u = e.detail.user;
                const messageHeaderName = modal.querySelector('.message-header-name');
                const messageHeaderAvatar = modal.querySelector('.message-header-avatar');
                const messageHeaderLink = modal.querySelector('.message-header-link');
                let messageData = await API.getConversation(convo_id);
                modal.querySelector('.message-box').hidden = false;
                modal.querySelector('.home-top').hidden = true;
                modal.querySelector('.name-top').hidden = false;
                modal.querySelector('.inbox').hidden = true;
                modal.querySelector('.new-message-box').hidden = true;
                messageHeaderName.innerText = u.name;
                messageHeaderAvatar.src = u.profile_image_url_https;
                messageHeaderLink.href = `https://twitter.com/${u.screen_name}`;
    
                renderConversation(messageData, convo_id);
            }, 50);
        })

        // menu
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
        updateInboxData();
        setInterval(updateAccounts, 60000*5);
        setInterval(updateUnread, 20000);
        setInterval(updateInboxData, 20000);
    }
    setTimeout(() => {
        if(!headerGotUser) {
            API.verifyCredentials().then(async u => {
                userDataFunction({ detail: u });
            });
        }
        let version = document.getElementById('oldtwitter-version');
        if(version) {
            fetch(`https://raw.githubusercontent.com/dimdenGD/OldTwitter/master/manifest.json`).then(res => res.json()).then(res => {
                version.innerText += ` (last version: ${res.version})`;
            });
        }
    }, 5000);
    document.addEventListener('updateUserData', userDataFunction);

    document.addEventListener('updatePageUserData', e => {
        let pageUser = e.detail;
        if(pageUser.profile_link_color && pageUser.profile_link_color !== '1DA1F2') {
            let root = document.querySelector(":root");
            customSet = true;
            root.style.setProperty('--link-color', pageUser.profile_link_color);
        }
    });
    setTimeout(() => {
        document.getElementById('navbar-user-avatar').addEventListener('click', () => {
            if(headerGotUser) return;
            API.verifyCredentials().then(async u => {
                userDataFunction({ detail: u });
            });
        });
    }, 1000);
}, 50);