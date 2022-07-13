const API = {};

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function createModal(html) {
    let modal = document.createElement('div');
    modal.classList.add('modal');
    let modal_content = document.createElement('div');
    modal_content.classList.add('modal-content');
    modal_content.innerHTML = html;
    modal.appendChild(modal_content);
    let close = document.createElement('span');
    close.classList.add('modal-close');
    close.innerHTML = '&times;';
    close.addEventListener('click', () => {
        modal.remove();
    });
    modal.addEventListener('click', e => {
        if(e.target === modal) modal.remove();
    });
    modal_content.appendChild(close);
    document.body.appendChild(modal);
    return modal;
}
function getMedia(mediaArray, mediaContainer) {
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,image/gif';
    input.addEventListener('change', async () => {
        let files = input.files;
        let images = [];
        let videos = [];
        let gifs = [];
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (file.type.includes('gif')) {
                // max 15 mb
                if (file.size > 15000000) {
                    return alert('GIFs must be less than 15 MB');
                }
                gifs.push(file);
            } else if (file.type.includes('video')) {
                // max 500 mb
                if (file.size > 500000000) {
                    return alert('Videos must be less than 500 MB');
                }
                videos.push(file);
            } else if (file.type.includes('image')) {
                // max 5 mb
                if (file.size > 5000000) {
                    return alert('Images must be less than 5 MB');
                }
                images.push(file);
            }
        }
        // either up to 4 images or 1 video or 1 gif
        if (images.length > 0) {
            if (images.length > 4) {
                images = images.slice(0, 4);
            }
            if (videos.length > 0 || gifs.length > 0) {
                return alert('You can only upload up to 4 images or 1 video or 1 gif');
            }
        }
        if (videos.length > 0) {
            if (images.length > 0 || gifs.length > 0 || videos.length > 1) {
                return alert('You can only upload up to 4 images or 1 video or 1 gif');
            }
        }
        if (gifs.length > 0) {
            if (images.length > 0 || videos.length > 0 || gifs.length > 1) {
                return alert('You can only upload up to 4 images or 1 video or 1 gif');
            }
        }
        // get base64 data
        let media = [...images, ...videos, ...gifs];
        let base64Data = [];
        for (let i = 0; i < media.length; i++) {
            let file = media[i];
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = () => {
                base64Data.push(reader.result);
                if (base64Data.length === media.length) {
                    mediaContainer.innerHTML = '';
                    while (mediaArray.length > 0) {
                        mediaArray.pop();
                    }
                    base64Data.forEach(data => {
                        let div = document.createElement('div');
                        let img = document.createElement('img');
                        div.title = file.name;
                        div.id = `new-tweet-media-img-${Date.now()}${Math.random()}`.replace('.', '-');
                        div.className = "new-tweet-media-img-div";
                        img.className = "new-tweet-media-img";
                        let progress = document.createElement('span');
                        progress.hidden = true;
                        progress.className = "new-tweet-media-img-progress";
                        let remove = document.createElement('span');
                        remove.className = "new-tweet-media-img-remove";
                        let alt;
                        if (!file.type.includes('video')) {
                            alt = document.createElement('span');
                            alt.className = "new-tweet-media-img-alt";
                            alt.innerText = "ALT";
                            alt.addEventListener('click', () => {
                                mediaObject.alt = prompt('Enter alt text for image');
                            });
                        }
                        let dataBase64 = arrayBufferToBase64(data);
                        let mediaObject = {
                            div, img,
                            id: img.id,
                            data: data,
                            dataBase64: dataBase64,
                            type: file.type,
                            category: file.type.includes('gif') ? 'tweet_gif' : file.type.includes('video') ? 'tweet_video' : 'tweet_image'
                        };
                        mediaArray.push(mediaObject);
                        img.src = file.type.includes('video') ? 'data:image/png;base64,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' : `data:${file.type};base64,${dataBase64}`;
                        remove.addEventListener('click', () => {
                            div.remove();
                            for (let i = mediaToUpload.length - 1; i >= 0; i--) {
                                let m = mediaToUpload[i];
                                if (m.id !== img.id) mediaToUpload.splice(i, 1);
                            }
                        });
                        div.append(img, progress, remove);
                        if (!file.type.includes('video')) {
                            img.addEventListener('click', () => {
                                new Viewer(mediaContainer);
                            });
                            div.append(alt);
                        }
                        mediaContainer.append(div);
                    });
                }
            }
        }
    });
    input.click();
};
function timeElapsed(targetTimestamp) {
    let currentDate = new Date();
    let currentTimeInms = currentDate.getTime();
    let targetDate = new Date(targetTimestamp);
    let targetTimeInms = targetDate.getTime();
    let elapsed = Math.floor((currentTimeInms - targetTimeInms) / 1000);
    const MonthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    if (elapsed < 1) {
        return '0s';
    }
    if (elapsed < 60) { //< 60 sec
        return `${elapsed}s`;
    }
    if (elapsed < 3600) { //< 60 minutes
        return `${Math.floor(elapsed / (60))}m`;
    }
    if (elapsed < 86400) { //< 24 hours
        return `${Math.floor(elapsed / (3600))}h`;
    }
    if (elapsed < 604800) { //<7 days
        return `${Math.floor(elapsed / (86400))}d`;
    }
    if (elapsed < 2628000) { //<1 month
        return `${targetDate.getDate()} ${MonthNames[targetDate.getMonth()]}`;
    }
    return `${targetDate.getDate()} ${MonthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`; //more than a monh
}
function openInNewTab(href) {
    Object.assign(document.createElement('a'), {
        target: '_blank',
        rel: 'noopener noreferrer',
        href: href,
    }).click();
}
function escape(text) {
    if (typeof text !== "string") return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function stringInsert(string, index, value) {
    return string.substr(0, index) + value + string.substr(index);
}

API.verifyCredentials = () => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/account/verify_credentials.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/"
            },
            credentials: "include"
        }).then(response => response.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    })
}

API.getTimeline = (max_id) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/home_timeline.json?count=100&include_my_retweet=1&cards_platform=Web13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true${max_id ? `&max_id=${max_id}` : ''}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/"
            },
            credentials: "include"
        }).then(response => response.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

API.postTweet = data => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/update.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: new URLSearchParams(data).toString(),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

API.favoriteTweet = data => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/favorites/create.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: new URLSearchParams(data).toString(),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

API.unfavoriteTweet = data => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/favorites/destroy.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: new URLSearchParams(data).toString(),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

API.retweetTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/retweet/${id}.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

API.deleteTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/destroy/${id}.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

API.getTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/show.json?id=${id}&include_my_retweet=1&cards_platform=Web13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

API.getSettings = () => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/account/settings.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

API.discoverPeople = (cache = true) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['discoverData'], d => {
            if(cache && d.discoverData && Date.now() - d.discoverData.date < 60000*5) {
                return resolve(d.discoverData.data);
            }
            fetch(`https://twitter.com/i/api/2/people_discovery/modules_urt.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&display_location=connect&client_type=rweb&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.public_token,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                    "x-twitter-active-user": "yes",
                    "x-twitter-client-language": "en"
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data);
                chrome.storage.local.set({discoverData: {
                    date: Date.now(),
                    data
                }}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}
API.peopleRecommendations = (id, cache = true) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([`peopleRecommendations${id}`], d => {
            if(cache && d[`peopleRecommendations${id}`] && Date.now() - d[`peopleRecommendations${id}`].date < 60000*5) {
                return resolve(d[`peopleRecommendations${id}`].data);
            }
            fetch(`https://twitter.com/i/api/1.1/users/recommendations.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&&pc=true&display_location=profile_accounts_sidebar&limit=4&user_id=${id}&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.public_token,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                    "x-twitter-active-user": "yes",
                    "x-twitter-client-language": "en"
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data);
                let obj = {};
                obj[`peopleRecommendations${id}`] = {
                    date: Date.now(),
                    data
                };
                chrome.storage.local.set(obj, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}

API.followUser = screen_name => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/friendships/create.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            body: `screen_name=${screen_name}`
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.unfollowUser = screen_name => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/friendships/destroy.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            body: `screen_name=${screen_name}`
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getTrends = () => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/trends/plus.json?max_trends=10`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getUser = (val, byId = true) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/users/show.json?${byId ? `user_id=${val}` : `screen_name=${val}`}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.updateProfile = (data) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/account/update_profile.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/"
            },
            credentials: "include",
            method: "post",
            body: new URLSearchParams(data).toString()
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
/*
    media_type: "video/mp4",
    media_category: "tweet_video" | "tweet_image" | "tweet_gif",
    media: ArrayBuffer,
    loadCallback: function,
    alt: "alt text"
*/
API.uploadMedia = (data) => {
    return new Promise(async (resolve, reject) => {
        let initUpload = await fetch(`https://upload.twitter.com/1.1/media/upload.json`, {
            headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
            credentials: "include",
            method: "post",
            body: new URLSearchParams({
                command: "INIT",
                total_bytes: data.media.byteLength,
                media_type: data.media_type,
                media_category: data.media_category
            }).toString()
        }).then(i => i.json());
        if (initUpload.errors && initUpload.errors[0]) {
            return reject(initUpload.errors[0].message);
        }
        let mediaId = initUpload.media_id_string;
        let segments = [];
        let segmentSize = 1084576;
        let segmentCount = Math.ceil(data.media.byteLength / segmentSize);
        for (let i = 0; i < segmentCount; i++) {
            let segmentData = data.media.slice(i * segmentSize, (i + 1) * segmentSize);
            segments.push(segmentData);
        }
        for(let i in segments) {
            let segment = segments[i];
            try {
                await fetch(`https://upload.twitter.com/1.1/media/upload.json`, {
                    headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    credentials: "include",
                    method: "post",
                    body: new URLSearchParams({
                        command: "APPEND",
                        media_id: mediaId,
                        media_data: arrayBufferToBase64(segment),
                        segment_index: +i
                    }).toString()
                }).then(i => i.text());
            } catch (e) {
                await new Promise((resolve, reject) => {
                    console.error(e);
                    setTimeout(async () => {
                        await fetch(`https://upload.twitter.com/1.1/media/upload.json`, {
                            headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                            credentials: "include",
                            method: "post",
                            body: new URLSearchParams({
                                command: "APPEND",
                                media_id: mediaId,
                                media_data: arrayBufferToBase64(segment),
                                segment_index: +i
                            }).toString()
                        }).then(i => i.text()).catch(reject);
                        if(data.loadCallback) {
                            data.loadCallback({
                                text: `Uploading`,
                                progress: Math.round(((+i + 1) / segments.length)*100)
                            });
                        }
                        resolve(true);
                    }, 1000);
                });
            }
            if(data.loadCallback) {
                data.loadCallback({
                    text: `Uploading`,
                    progress: Math.round(((+i + 1) / segments.length)*100)
                });
            }
        }
        let finalData = await fetch(`https://upload.twitter.com/1.1/media/upload.json`, {
            headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
            credentials: "include",
            method: "post",
            body: new URLSearchParams({
                command: "FINALIZE",
                media_id: mediaId
            }).toString()
        }).then(i => i.json());
        if (finalData.errors && finalData.errors[0]) {
            return reject(finalData.errors[0].message);
        }
        if(data.alt) {
            try {
                await fetch(`https://upload.twitter.com/1.1/media/metadata/create.json`, {
                    headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/" },
                    credentials: "include",
                    method: "post",
                    body: JSON.stringify({
                        media_id: mediaId,
                        alt_text: {
                            text: data.alt
                        }
                    })
                }).then(i => i.json());
            } catch(e) {
                console.warn(e);
            }
        }
        if(!finalData.processing_info) {
            return resolve(mediaId);
        }
        let statusTries = 0;
        async function checkStatus() {
            if(statusTries++ > 60*20) return clearInterval(statusInterval);
            await fetch(`https://upload.twitter.com/1.1/media/upload.json?${new URLSearchParams({ command: "STATUS", media_id: mediaId }).toString()}`, {
                headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                credentials: "include",
            }).then(i => i.json()).then(i => {
                if (i.processing_info.state === "succeeded") {
                    resolve(i.media_id_string);
                }
                if (i.processing_info.state === "failed") {
                    reject(i.processing_info.error.message);
                }
                if(i.processing_info.state === "in_progress") {
                    setTimeout(checkStatus, i.processing_info.check_after_secs*1000);
                    if(data.loadCallback) {
                        data.loadCallback({
                            text: `Processing`,
                            progress: i.processing_info.progress_percent
                        });
                    }
                }
            });
        };
        setTimeout(checkStatus, 500);
    });
}

API.getUnreadCount = () => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/badge_count/badge_count.json?supports_ntab_urt=1`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

API.translateTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/translations/show.json?id=${id}&dest=en&use_display_text=true&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

API.getAccounts = (cache = true) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['accountsList'], d => {
            if(cache && d.accountsList && Date.now() - d.accountsList.date < 60000*5) {
                return resolve(d.accountsList.data);
            }
            fetch(`https://twitter.com/i/api/1.1/account/multi/list.json`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.public_token,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                    "x-twitter-active-user": "yes",
                    "x-twitter-client-language": "en"
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data);
                chrome.storage.local.set({accountsList: {
                    date: Date.now(),
                    data
                }}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}

API.switchAccount = id => {
    return new Promise((resolve, reject) => {
        let status;
        fetch(`https://twitter.com/i/api/1.1/account/multi/switch.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-active-user": "yes",
                "x-twitter-client-language": "en",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            method: 'post',
            body: `user_id=${id}`
        }).then(i => {
            status = i.status;
            return i.text();
        }).then(data => {
            if(String(status).startsWith("2")) {
                resolve(data);
            } else {
                reject(data);
            }
        }).catch(e => {
            reject(e);
        });
    });
}

API.getNotifications = cursor => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/notifications/all.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=50&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control${cursor ? `&cursor=${cursor}` : ''}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                "x-twitter-client-language": "en"
            },
            credentials: "include",
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.markAsReadNotifications = cursor => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/notifications/all/last_seen_cursor.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                "content-type": "application/x-www-form-urlencoded",
            },
            credentials: "include",
            method: 'post',
            body: `cursor=${cursor}`
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

API.search = query => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/search/typeahead.json?q=${encodeURIComponent(query)}&count=5&prefetch=false&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

API.getUserTweetsV2 = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/3ywp9kIIW-VQOssauKmLiQ/UserTweets?variables=%7B%22userId%22%3A%22${id}%22%2C%22count%22%3A1%2C%22includePromotedContent%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withSuperFollowsUserFields%22%3Atrue%2C%22withDownvotePerspective%22%3Afalse%2C%22withReactionsMetadata%22%3Afalse%2C%22withReactionsPerspective%22%3Afalse%2C%22withSuperFollowsTweetFields%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22dont_mention_me_view_api_enabled%22%3Atrue%2C%22interactive_text_enabled%22%3Atrue%2C%22responsive_web_uc_gql_enabled%22%3Afalse%2C%22vibe_tweet_context_enabled%22%3Afalse%2C%22responsive_web_edit_tweet_api_enabled%22%3Afalse%2C%22standardized_nudges_misinfo%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getUserTweets = (id, max_id, replies = false) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/user_timeline.json?count=100&exclude_replies=${!replies}&include_my_retweet=1&include_rts=1&user_id=${id}${max_id ? `&max_id=${max_id}` : ''}&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}