let loadingDetails = {};
let loadingReplies = {};
let loadingLikers = {};
let tweetStorage = {};
let userStorage = {};
let hashflagStorage = {};
let translateLimit = 0;
let loadingNotifs;

setInterval(() => {
    // clearing cache
    chrome.storage.local.set({userUpdates: {}}, () => {});
    chrome.storage.local.set({peopleRecommendations: {}}, () => {});
    chrome.storage.local.set({tweetReplies: {}}, () => {});
    chrome.storage.local.set({tweetDetails: {}}, () => {});
    chrome.storage.local.set({tweetLikers: {}}, () => {});
    chrome.storage.local.set({listData: {}}, () => {});
    chrome.storage.local.set({myLists: {}}, () => {});
    chrome.storage.local.set({trends: {}}, () => {});
    chrome.storage.local.set({trendsv2: {}}, () => {});

    for(let i in tweetStorage) {
        if(tweetStorage[i].cacheDate && Date.now() - tweetStorage[i].cacheDate > 60000*15) {
            delete tweetStorage[i];
        }
    }
    for(let i in userStorage) {
        if(userStorage[i].cacheDate && Date.now() - userStorage[i].cacheDate > 60000*15) {
            delete userStorage[i];
        }
    }
}, 60000*10);

setInterval(() => {
    // on first minute of hour
    if(new Date().getMinutes() !== 0) return;
    chrome.storage.local.set({translations: {}}, () => {});
    chrome.storage.local.set({hashflags: {}}, () => {});
    hashflagStorage = {};
}, 60000);

function debugLog(...args) {
    if(typeof vars === "object" && vars.developerMode) {
        if(args[0] === 'notifications.get' && !document.querySelector('.notifications-modal') && !location.pathname.startsWith('/notifications')) return; 
        if(vars.extensiveLogging) {
            console.trace(...args);
        } else {
            console.log(...args, new Error().stack.split("\n")[2].trim()); // genius
        }
    }
}

// extract full text and url entities from "note_tweet"
function parseNoteTweet(result) {
    let text, entities;
    if(result.note_tweet.note_tweet_results.result) {
        text = result.note_tweet.note_tweet_results.result.text;
        entities = result.note_tweet.note_tweet_results.result.entity_set;
        if(result.note_tweet.note_tweet_results.result.richtext?.richtext_tags.length) {
            entities.richtext = result.note_tweet.note_tweet_results.result.richtext.richtext_tags // logically, richtext is an entity, right?
        }
    } else {
        text = result.note_tweet.note_tweet_results.text;
        entities = result.note_tweet.note_tweet_results.entity_set;
    }
    return {text, entities};
}

function updateElementsStats(tweet) {
    let tr = tweet;
    if(tweet.retweeted_status) {
        tr = tweet.retweeted_status;
    }
    let renderedTweets = Array.from(document.querySelectorAll(`div.tweet[data-tweet-id="${tr.id_str}"]:not(.tweet-main)`));
    for(let t of renderedTweets) {
        if(t.tweet) {
            if(typeof tr.favorite_count === 'number') t.tweet.favorite_count = tr.favorite_count;
            if(typeof tr.retweet_count === 'number') t.tweet.retweet_count = tr.retweet_count;
            if(typeof tr.reply_count === 'number') t.tweet.reply_count = tr.reply_count;
            if(typeof tr.bookmark_count === 'number') t.tweet.bookmark_count = tr.bookmark_count;
        }
        let interactFavorite = t.querySelector('span.tweet-interact-favorite');
        if(interactFavorite && typeof tr.favorite_count === 'number') {
            interactFavorite.dataset.val = tr.favorite_count;
            interactFavorite.innerText = formatLargeNumber(tr.favorite_count);
        }
        let interactRetweet = t.querySelector('span.tweet-interact-retweet');
        if(interactRetweet && typeof tr.retweet_count === 'number') {
            interactRetweet.dataset.val = tr.retweet_count;
            interactRetweet.innerText = formatLargeNumber(tr.retweet_count);
        }
        let interactReply = t.querySelector('span.tweet-interact-reply');
        if(interactReply && typeof tr.reply_count === 'number') {
            interactReply.dataset.val = tr.reply_count;
            interactReply.innerText = formatLargeNumber(tr.reply_count);
        }
        let interactBookmark = t.querySelector('span.tweet-interact-bookmark');
        if(interactBookmark && typeof tr.bookmark_count === 'number') {
            interactBookmark.dataset.val = tr.bookmark_count;
            interactBookmark.innerText = formatLargeNumber(tr.bookmark_count);
        }
        let interactViews = t.querySelector('span.tweet-interact-views');
        if(interactViews && tr.ext && tr.ext.views && tr.ext.views.r && tr.ext.views.r.ok) {
            interactViews.dataset.val = tr.ext.views.r.ok.count;
            interactViews.innerText = formatLargeNumber(tr.ext.views.r.ok.count);
        }
    }
}


// Added this function to support Blue Blocker specifically.
// When a request is made, forward the request body to the window event listener
// so that other extensions can listen to it.
function sendRequestToEventListeners(url, body) {
    window.postMessage({ type: "OLDTWITTER_REQUEST_LOAD", url, body, headers: {
        "authorization": OLDTWITTER_CONFIG.public_token,
        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-active-user": "yes",
        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
    }});
}

// transform ugly useless twitter api reply to usable legacy tweet
function parseTweet(res) {
    if(typeof res !== "object") return;
    if(res.limitedActionResults) {
        let limitation = res.limitedActionResults.limited_actions.find(l => l.action === "Reply");
        if(limitation) {
            res.tweet.legacy.limited_actions_text = limitation.prompt ? limitation.prompt.subtext.text : LOC.limited_tweet.message;
        }
        res = res.tweet;
    }
    if(!res.legacy && res.tweet) res = res.tweet;
    let tweet = res.legacy;
    if(!res.core) return;
    tweet.user = res.core.user_results.result.legacy;
    tweet.user.id_str = tweet.user_id_str;
    if(res.core.user_results.result.is_blue_verified && !res.core.user_results.result.legacy.verified_type) {
        tweet.user.verified = true;
        tweet.user.verified_type = "Blue";
    }
    if(tweet.retweeted_status_result) {
        let result = tweet.retweeted_status_result.result;
        if(result.limitedActionResults && result.tweet && result.tweet.legacy) {
            let limitation = result.limitedActionResults.limited_actions.find(l => l.action === "Reply");
            if(limitation) {
                result.tweet.legacy.limited_actions_text = limitation.prompt ? limitation.prompt.subtext.text : LOC.limited_tweet.message;
            }
        }
        if(result.tweet) result = result.tweet;
        if(
            result.quoted_status_result && 
            result.quoted_status_result.result && 
            result.quoted_status_result.result.legacy &&
            result.quoted_status_result.result.core &&
            result.quoted_status_result.result.core.user_results.result.legacy    
        ) {
            result.legacy.quoted_status = result.quoted_status_result.result.legacy;
            if(result.legacy.quoted_status) {
                result.legacy.quoted_status.user = result.quoted_status_result.result.core.user_results.result.legacy;
                result.legacy.quoted_status.user.id_str = result.legacy.quoted_status.user_id_str;
                if(result.quoted_status_result.result.core.user_results.result.is_blue_verified && !result.quoted_status_result.result.core.user_results.result.legacy.verified_type) {
                    result.legacy.quoted_status.user.verified = true;
                    result.legacy.quoted_status.user.verified_type = "Blue";
                }
                tweetStorage[result.legacy.quoted_status.id_str] = result.legacy.quoted_status;
                tweetStorage[result.legacy.quoted_status.id_str].cacheDate = Date.now();
                userStorage[result.legacy.quoted_status.user.id_str] = result.legacy.quoted_status.user;
                userStorage[result.legacy.quoted_status.user.id_str].cacheDate = Date.now();
            } else {
                console.warn("No retweeted quoted status", result);
            }
        } else if(
            result.quoted_status_result &&
            result.quoted_status_result.result &&  
            result.quoted_status_result.result.tweet && 
            result.quoted_status_result.result.tweet.legacy &&
            result.quoted_status_result.result.tweet.core &&
            result.quoted_status_result.result.tweet.core.user_results.result.legacy    
        ) {
            result.legacy.quoted_status = result.quoted_status_result.result.tweet.legacy;
            if(result.legacy.quoted_status) {
                result.legacy.quoted_status.user = result.quoted_status_result.result.tweet.core.user_results.result.legacy;
                result.legacy.quoted_status.user.id_str = result.legacy.quoted_status.user_id_str;
                if(result.quoted_status_result.result.tweet.core.user_results.result.is_blue_verified && !result.core.user_results.result.verified_type) {
                    result.legacy.quoted_status.user.verified = true;
                    result.legacy.quoted_status.user.verified_type = "Blue";
                }
                tweetStorage[result.legacy.quoted_status.id_str] = result.legacy.quoted_status;
                tweetStorage[result.legacy.quoted_status.id_str].cacheDate = Date.now();
                userStorage[result.legacy.quoted_status.user.id_str] = result.legacy.quoted_status.user;
                userStorage[result.legacy.quoted_status.user.id_str].cacheDate = Date.now();
            } else {
                console.warn("No retweeted quoted status", result);
            }
        }
        tweet.retweeted_status = result.legacy;
        if(tweet.retweeted_status && result.core.user_results.result.legacy) {
            tweet.retweeted_status.user = result.core.user_results.result.legacy;
            tweet.retweeted_status.user.id_str = tweet.retweeted_status.user_id_str;
            if(result.core.user_results.result.is_blue_verified && !result.core.user_results.result.legacy.verified_type) {
                tweet.retweeted_status.user.verified = true;
                tweet.retweeted_status.user.verified_type = "Blue";
            }
            tweet.retweeted_status.ext = {};
            if(result.views) {
                tweet.retweeted_status.ext.views = {r: {ok: {count: +result.views.count}}};
            }
            tweet.retweeted_status.res = res;
            if(res.card && res.card.legacy && res.card.legacy.binding_values) {
                tweet.retweeted_status.card = res.card.legacy;
            }
            tweetStorage[tweet.retweeted_status.id_str] = tweet.retweeted_status;
            tweetStorage[tweet.retweeted_status.id_str].cacheDate = Date.now();
            userStorage[tweet.retweeted_status.user.id_str] = tweet.retweeted_status.user;
            userStorage[tweet.retweeted_status.user.id_str].cacheDate = Date.now();
        } else {
            console.warn("No retweeted status", result);
        }
        if(result.note_tweet && result.note_tweet.note_tweet_results) {
            let note = parseNoteTweet(result);
            tweet.retweeted_status.full_text = note.text;
            tweet.retweeted_status.entities = note.entities;
            tweet.retweeted_status.display_text_range = undefined; // no text range for long tweets
        }
    }

    if(res.quoted_status_result) {
        tweet.quoted_status_result = res.quoted_status_result;
    }
    if(res.note_tweet && res.note_tweet.note_tweet_results) {
        let note = parseNoteTweet(res);
        tweet.full_text = note.text;
        tweet.entities = note.entities;
        tweet.display_text_range = undefined; // no text range for long tweets
    }
    if(tweet.quoted_status_result && tweet.quoted_status_result.result) {
        let result = tweet.quoted_status_result.result;
        if(!result.core && result.tweet) result = result.tweet;
        if(result.limitedActionResults) {
            let limitation = result.limitedActionResults.limited_actions.find(l => l.action === "Reply");
            if(limitation) {
                result.tweet.legacy.limited_actions_text = limitation.prompt ? limitation.prompt.subtext.text : LOC.limited_tweet.message;
            }
            result = result.tweet;
        }
        tweet.quoted_status = result.legacy;
        if(tweet.quoted_status) {
            tweet.quoted_status.user = result.core.user_results.result.legacy;
            if(!tweet.quoted_status.user) {
                delete tweet.quoted_status;
            } else {
                tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                if(result.core.user_results.result.is_blue_verified && !result.core.user_results.result.legacy.verified_type) {
                    tweet.quoted_status.user.verified = true;
                    tweet.quoted_status.user.verified_type = "Blue";
                }
                tweet.quoted_status.ext = {};
                if(result.views) {
                    tweet.quoted_status.ext.views = {r: {ok: {count: +result.views.count}}};
                }
                tweetStorage[tweet.quoted_status.id_str] = tweet.quoted_status;
                tweetStorage[tweet.quoted_status.id_str].cacheDate = Date.now();
                userStorage[tweet.quoted_status.user.id_str] = tweet.quoted_status.user;
                userStorage[tweet.quoted_status.user.id_str].cacheDate = Date.now();
            }
        } else {
            console.warn("No quoted status", result);
        }
    }
    if(res.card && res.card.legacy) {
        tweet.card = res.card.legacy;
        let bvo = {};
        for(let i = 0; i < tweet.card.binding_values.length; i++) {
            let bv = tweet.card.binding_values[i];
            bvo[bv.key] = bv.value;
        }
        tweet.card.binding_values = bvo;
    }
    if(res.views) {
        if(!tweet.ext) tweet.ext = {};
        tweet.ext.views = {r: {ok: {count: +res.views.count}}};
    }
    if(res.source) {
        tweet.source = res.source;
    }
    if(res.birdwatch_pivot) { // community notes
        tweet.birdwatch = res.birdwatch_pivot;
    }
    if(res.trusted_friends_info_result && res.trusted_friends_info_result.owner_results && res.trusted_friends_info_result.owner_results.result && res.trusted_friends_info_result.owner_results.result.legacy) {
        tweet.trusted_circle_owner = res.trusted_friends_info_result.owner_results.result.legacy.screen_name;
    }

    if(tweet.favorited && tweet.favorite_count === 0) {
        tweet.favorite_count = 1;
    }
    if(tweet.retweeted && tweet.retweet_count === 0) {
        tweet.retweet_count = 1;
    }

    tweet.res = res;

    updateElementsStats(tweet);
    tweetStorage[tweet.id_str] = tweet;
    tweetStorage[tweet.id_str].cacheDate = Date.now();
    userStorage[tweet.user.id_str] = tweet.user;
    userStorage[tweet.user.id_str].cacheDate = Date.now();
    return tweet;
}

function parseHomeTimeline(entries, data) {
    let tweets = [];
    for(let e of entries) {
        // thats a lot of trash https://lune.dimden.dev/0bf524e52eb.png
        if(e.entryId.startsWith('tweet-')) {
            let res = e.content.itemContent.tweet_results.result;
            let tweet = parseTweet(res);
            if(!tweet) continue;
            if(
                tweet.source && 
                (tweet.source.includes('Twitter for Advertisers') || tweet.source.includes('advertiser-interface'))
            ) continue;
            if(tweet.user.blocking || tweet.user.muting) continue;

            if(e.content.feedbackInfo) {
                tweet.feedback = e.content.feedbackInfo.feedbackKeys.map(f => data.data.home.home_timeline_urt.responseObjects.feedbackActions.find(a => a.key === f).value).filter(f => f);
                if(tweet.feedback) {
                    tweet.feedbackMetadata = e.content.feedbackInfo.feedbackMetadata;
                }
            }
            if(e.content.itemContent.socialContext) {
                if(e.content.itemContent.socialContext.topic) {
                    tweet.socialContext = e.content.itemContent.socialContext.topic;
                } else {
                    tweet.socialContext = e.content.itemContent.socialContext;
                }
            }
            tweet.hasModeratedReplies = e.content.itemContent.hasModeratedReplies;
            tweets.push(tweet);
        } else if(e.entryId.startsWith('home-conversation-')) {
            let items = e.content.items;
            let ignore = false;
            if(typeof repliesToIgnore !== 'undefined') {
                for(let i = 0; i < items.length; i++) {
                    let item = items[i];
                    if(item.entryId.includes('-tweet-')) {
                        let res = item.item.itemContent.tweet_results.result;
                        if(res && res.legacy && repliesToIgnore.includes(res.legacy.id_str)) {
                            ignore = true;
                            repliesToIgnore = repliesToIgnore.filter(r => r !== res.legacy.id_str);
                            break;
                        }
                    }
                }
            }
            if(ignore) continue;

            let pushedTweets = [];
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                if(item.entryId.includes('-tweet-') && !item.entryId.includes('promoted')) {
                    let res = item.item.itemContent.tweet_results.result;
                    let tweet = parseTweet(res);
                    if(!tweet) continue;
                    if(
                        tweet.source && 
                        (tweet.source.includes('Twitter for Advertisers') || tweet.source.includes('advertiser-interface'))
                    ) continue;
                    if(tweet.user.blocking || tweet.user.muting) break;
                    if(item.item.feedbackInfo) {
                        tweet.feedback = item.item.feedbackInfo.feedbackKeys.map(f => data.data.home.home_timeline_urt.responseObjects.feedbackActions.find(a => a.key === f).value).filter(f => f);
                        if(tweet.feedback) {
                            tweet.feedbackMetadata = item.item.feedbackInfo.feedbackMetadata;
                        }
                    }
                    if(item.item.itemContent.socialContext) {
                        if(item.item.itemContent.socialContext.topic) {
                            tweet.socialContext = item.item.itemContent.socialContext.topic;
                        } else {
                            tweet.socialContext = item.item.itemContent.socialContext;
                        }
                    }
                    if(i !== items.length - 1) tweet.threadContinuation = true;
                    if(i !== 0) tweet.noTop = true;
                    tweet.hasModeratedReplies = item.item.itemContent.hasModeratedReplies;
                    tweets.push(tweet);
                    pushedTweets.push(tweet);
                }
            }
            // possible weird bug fix?
            if(pushedTweets.length === 1) {
                delete pushedTweets[0].threadContinuation;
            }
        }
    }

    return tweets;
}

const API = {
    account: {
        verifyCredentials: () => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['credentials'], d => {
                    if(d.credentials && Date.now() - d.credentials.date < 15000) {
                        return resolve(d.credentials.data);
                    }
                    fetch(`https://api.${location.hostname}/1.1/account/verify_credentials.json`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.oauth_key,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session"
                        },
                        credentials: "include"
                    }).then(response => response.json()).then(data => {
                        if (data.errors && data.errors[0].code === 32) {
                            chrome.storage.local.remove(["lastUserId", "credentials", "inboxData", "tweetDetails", "savedSearches", "discoverData", "userUpdates", "peopleRecommendations", "tweetReplies", "tweetLikers", "listData", "twitterSettings", "algoTimeline"], () => {});
                            return reject("Not logged in");
                        }
                        if (data.errors && data.errors[0]) {
                            return reject(data.errors[0].message);
                        }
                        resolve(data);
                        chrome.storage.local.set({credentials: {
                            date: Date.now(),
                            data
                        }}, () => {});
                        chrome.storage.local.get(['lastUserId'], d => {
                            if(typeof d.lastUserId === 'string') {
                                if(d.lastUserId !== data.id_str) {
                                    chrome.storage.local.remove(["credentials", "inboxData", "tweetDetails", "savedSearches", "discoverData", "userUpdates", "peopleRecommendations", "tweetReplies", "tweetLikers", "listData", "twitterSettings", "algoTimeline"], () => {
                                        chrome.storage.local.set({lastUserId: data.id_str}, () => {
                                            location.reload();
                                        });
                                    });
                                }
                            } else {
                                chrome.storage.local.set({lastUserId: data.id_str}, () => {});
                            }
                        });
                    }).catch(e => {
                        reject(e);
                    });
                });
            })
        },
        logout: () => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/account/logout.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session"
                    },
                    credentials: "include",
                    method: 'post',
                    body: 'redirectAfterLogout=https%3A%2F%2Ftwitter.com%2Faccount%2Fswitch'
                }).then(i => i.json()).then(data => {
                    chrome.storage.local.remove(["myLists", "notifications", "unreadCount", "credentials", "inboxData", "tweetDetails", "savedSearches", "discoverData", "userUpdates", "peopleRecommendations", "tweetReplies", "tweetLikers", "listData", "twitterSettings", "algoTimeline"], () => {
                        if (data.errors && data.errors[0].code === 32) {
                            return reject("Not logged in");
                        }
                        if (data.errors && data.errors[0]) {
                            return reject(data.errors[0].message);
                        }
                        resolve(data);
                    });
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getAccounts: (cache = true) => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['accountsList'], d => {
                    if(cache && d.accountsList && Date.now() - d.accountsList.date < 60000*5) {
                        return resolve(d.accountsList.data);
                    }
                    fetch(`/i/api/1.1/account/multi/list.json`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "x-twitter-active-user": "yes",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
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
        },
        switch: id => {
            return new Promise((resolve, reject) => {
                let status;
                fetch(`/i/api/1.1/account/multi/switch.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-active-user": "yes",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `user_id=${id}`
                }).then(i => {
                    status = i.status;
                    return i.text();
                }).then(data => {
                    chrome.storage.local.remove(["myLists", "notifications", "unreadCount", "credentials", "inboxData", "tweetDetails", "savedSearches", "discoverData", "userUpdates", "peopleRecommendations", "tweetReplies", "tweetLikers", "listData", "twitterSettings", "algoTimeline"], () => {
                        chrome.storage.local.set({lastUserId: id}, () => {
                            if(String(status).startsWith("2")) {
                                resolve(data);
                            } else {
                                reject(data);
                            }
                        });
                    });
                }).catch(e => {
                    reject(e);
                });
            });
        },
        updateProfile: (data) => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/account/update_profile.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session"
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
        },
        getSettings: () => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['twitterSettings'], d => {
                    if(d.twitterSettings && Date.now() - d.twitterSettings.date < 60000*10) {
                        return resolve(d.twitterSettings.data);
                    }
                    fetch(`https://api.${location.hostname}/1.1/account/settings.json`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.oauth_key,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                        },
                        credentials: "include"
                    }).then(i => i.json()).then(data => {
                        if (data.errors && data.errors[0].code === 32) {
                            setTimeout(() => {
                                location.href = "/i/flow/login?newtwitter=true";
                            }, 1000);
                            return reject("Not logged in");
                        }
                        if (data.errors && data.errors[0]) {
                            return reject(data.errors[0].message);
                        }
                        resolve(data);
                        chrome.storage.local.set({twitterSettings: {
                            date: Date.now(),
                            data
                        }}, () => {});
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        }
    },
    timeline: {
        getChronological: (max_id) => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/statuses/home_timeline.json?count=40&include_my_retweet=1&cards_platform=Web-12&include_cards=1&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified&include_reply_count=true${max_id ? `&max_id=${max_id}` : ''}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(response => response.json()).then(data => {
                    debugLog('timeline.getChronological', {max_id, data});
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getChronologicalV2: (cursor, count = 40, useDiffKey) => {
            return new Promise((resolve, reject) => {
                if(typeof useDiffKey === 'undefined' && isFinite(+localStorage.hitRateLimit) && +localStorage.hitRateLimit > Date.now()) {
                    useDiffKey = true;
                }
                let variables = {
                    count,
                    includePromotedContent: true,
                    latestControlAvailable: true,
                    requestContext: "launch"
                };
                if(cursor) {
                    variables.cursor = cursor;
                }
                fetch(`/i/api/graphql/U0cdisy7QFIoTfu3-Okw0A/HomeLatestTimeline`, {
                    headers: {
                        "authorization": useDiffKey ? OLDTWITTER_CONFIG.oauth_key : OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en",
                        "content-type": "application/json"
                    },
                    credentials: "include",
                    method: 'post',
                    body: JSON.stringify({
                        variables,
                        features: {"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"c9s_tweet_anatomy_moderator_badge_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"rweb_video_timestamps_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_enhance_cards_enabled":false},
                        queryId: "U0cdisy7QFIoTfu3-Okw0A"
                    })
                }).then(response => response.json()).then(async data => {
                    debugLog('timeline.getChronologicalV2', 'start', {cursor, count, data});
                    let instructions = data.data.home.home_timeline_urt.instructions;
                    let entries = instructions.find(i => i.type === 'TimelineAddEntries');
                    if(!entries) {
                        debugLog('timeline.getChronologicalV2', 'end', {list: [], cursor: undefined});
                        return resolve({
                            list: [],
                            cursor: undefined
                        });
                    }
                    entries = entries.entries;

                    sendRequestToEventListeners('HomeLatestTimeline', data);

                    let tweets = parseHomeTimeline(entries, data);
                    if (data.errors && data.errors[0]) {
                        if(tweets.length === 0) return reject(data.errors[0].message);
                        console.log(`Server errors`, data.errors);
                    }
                    let cb = entries.find(e => e.entryId.startsWith('cursor-bottom-'));
                    let ct = entries.find(e => e.entryId.startsWith('cursor-top-'));
                    let messagePromptIndex = entries.findIndex(e => e.entryId.startsWith('messageprompt-'));
                    if(tweets.length === 0 && messagePromptIndex === 0 && !cursor) {
                        let messagePrompt = entries[messagePromptIndex].content.itemContent.content;
                        if(messagePrompt.primaryButtonAction && messagePrompt.primaryButtonAction.action && messagePrompt.primaryButtonAction.action.url === "/i/twitter_blue_sign_up") {
                            localStorage.hitRateLimit = Date.now() + 1000 * 60 * 10;
                            return API.timeline.getChronologicalV2(cursor, count, true).then(resolve).catch(reject);
                        }
                    }
                    let out = {
                        list: tweets,
                        cursorBottom: cb ? cb.content.value : undefined,
                        cursorTop: ct ? ct.content.value : undefined,
                        suspended: entries.find(e => e.entryId === 'messageprompt-suspended-prompt')
                    }
                    debugLog('timeline.getChronologicalV2', 'end', {cursor, count, out});
                    return resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getAlgorithmical: (cursor, count = 40) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/2/timeline/home.json?${cursor ? `cursor=${cursor.replace(/\+/g, '%2B')}&` : ''}include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&earned=1&count=${count}&lca=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified&browserNotificationPermission=default`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(response => response.json()).then(data => {
                    debugLog('timeline.getAlgorithmical', 'start', {cursor, count, data});
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let tweets = data.globalObjects.tweets;
                    let users = data.globalObjects.users;
                    let entries = data.timeline.instructions.find(i => i.addEntries);
                    if(!entries) { 
                        return reject({
                            list: [],
                            cursor: undefined
                        });
                    }
                    entries = entries.addEntries.entries;

                    sendRequestToEventListeners('timeline/home.json', data);

                    let list = [];
                    for (let i = 0; i < entries.length; i++) {
                        let e = entries[i].content.item;
                        if(!e || !e.content || !e.content.tweet) continue;
                        if(e.content.tweet.promotedMetadata && !vars.enableAd) continue;
                        let tweet = tweets[e.content.tweet.id];
                        if(!tweet) continue;
                        let user = users[tweet.user_id_str];
                        if(user.blocking || user.muting) continue;
                        tweet.user = user;
                        tweet.id_str = e.content.tweet.id;
                        if(
                            tweet.source && 
                            (tweet.source.includes('Twitter for Advertisers') || tweet.source.includes('advertiser-interface')) &&
                            !vars.enableAd
                        ) continue;
                        if(e.feedbackInfo) {
                            tweet.feedback = e.feedbackInfo.feedbackKeys.map(f => data.timeline.responseObjects.feedbackActions[f]);
                            if(tweet.feedback) tweet.feedbackMetadata = e.feedbackInfo.feedbackMetadata;
                        }
                        if(tweet.retweeted_status_id_str) {
                            tweet.retweeted_status = tweets[tweet.retweeted_status_id_str];
                            if(tweet.retweeted_status) {
                                tweet.retweeted_status.user = users[tweet.retweeted_status.user_id_str];
                                tweet.retweeted_status.user.id_str = tweet.retweeted_status.user_id_str;
                                tweet.retweeted_status.id_str = tweet.retweeted_status_id_str;
                            }
                        }
                        if(tweet.quoted_status_id_str) {
                            tweet.quoted_status = tweets[tweet.quoted_status_id_str];
                            if(tweet.quoted_status) {
                                tweet.quoted_status.user = users[tweet.quoted_status.user_id_str];
                                tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                                tweet.quoted_status.id_str = tweet.quoted_status_id_str;
                            }
                        }
                        if(e.content.tweet.socialContext) {
                            if(e.content.tweet.socialContext.topicContext) {
                                tweet.socialContext = data.globalObjects.topics[e.content.tweet.socialContext.topicContext.topicId];
                            } else {
                                tweet.socialContext = e.content.tweet.socialContext.generalContext;
                            }
                        }
                        list.push(tweet);
                    }
        
                    let cb = entries.find(e => e.entryId.startsWith('cursor-bottom-'));
                    let ct = entries.find(e => e.entryId.startsWith('cursor-top-'));

                    let out = {
                        list,
                        cursorBottom: cb ? cb.content.operation.cursor.value : undefined,
                        cursorTop: ct ? ct.content.operation.cursor.value : undefined,
                        suspended: entries.find(e => e.entryId === 'messageprompt-suspended-prompt')
                    }
                    debugLog('timeline.getAlgorithmical', 'end', {cursor, count, out});
                    return resolve(out)
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getAlgorithmicalV2: (cursor, count = 40, seenTweetIds = [], useDiffKey) => {
            return new Promise((resolve, reject) => {
                if(typeof useDiffKey === 'undefined' && isFinite(+localStorage.hitRateLimit) && +localStorage.hitRateLimit > Date.now()) {
                    useDiffKey = true;
                }
                let variables = {"count":count,"includePromotedContent":true,"latestControlAvailable":true,"requestContext":"launch","withCommunity":true,"seenTweetIds":seenTweetIds}
                if(cursor) {
                    variables.cursor = cursor;
                }
                fetch(`/i/api/graphql/k3YiLNE_MAy5J-NANLERdg/HomeTimeline`, {
                    headers: {
                        "authorization": useDiffKey ? OLDTWITTER_CONFIG.oauth_key : OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en",
                        "content-type": "application/json"
                    },
                    method: 'post',
                    credentials: "include",
                    body: JSON.stringify({
                        variables,
                        features: {"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"c9s_tweet_anatomy_moderator_badge_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"rweb_video_timestamps_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_enhance_cards_enabled":false},
                        queryId: "k3YiLNE_MAy5J-NANLERdg"
                    })
                }).then(response => response.json()).then(data => {
                    debugLog('timeline.getAlgorithmicalV2', 'start', {cursor, count, data});
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let instructions = data.data.home.home_timeline_urt.instructions;
                    let entries = instructions.find(i => i.type === 'TimelineAddEntries');
                    if(!entries) {
                        debugLog('timeline.getAlgorithmicalV2', 'end', {list: [], cursor: undefined});
                        return resolve({
                            list: [],
                            cursor: undefined
                        });
                    }
                    entries = entries.entries;

                    sendRequestToEventListeners('HomeTimeline', data);

                    let tweets = parseHomeTimeline(entries, data);
                    let cb = entries.find(e => e.entryId.startsWith('cursor-bottom-'));
                    let ct = entries.find(e => e.entryId.startsWith('cursor-top-'));

                    let messagePromptIndex = entries.findIndex(e => e.entryId.startsWith('messageprompt-'));
                    if(tweets.length === 0 && messagePromptIndex === 0 && !cursor) {
                        let messagePrompt = entries[messagePromptIndex].content.itemContent.content;
                        if(messagePrompt.primaryButtonAction && messagePrompt.primaryButtonAction.action && messagePrompt.primaryButtonAction.action.url === "/i/twitter_blue_sign_up") {
                            localStorage.hitRateLimit = Date.now() + 1000 * 60 * 10;
                            return API.timeline.getAlgorithmicalV2(cursor, count, seenTweetIds, true).then(resolve).catch(reject);
                        }
                    }

                    let out = {
                        list: tweets,
                        cursorBottom: cb ? cb.content.value : undefined,
                        cursorTop: ct ? ct.content.value : undefined,
                        suspended: entries.find(e => e.entryId === 'messageprompt-suspended-prompt')
                    }
                    for(let tweet of out.list) {
                        tweet.algo = true;
                    }
                    debugLog('timeline.getAlgorithmicalV2', 'end', {cursor, count, out});
                    return resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getAlgorithmicalV2WithCache: (seenTweetIds = []) => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['algoTimeline'], d => {
                    if(d.algoTimeline && Date.now() - d.algoTimeline.date < 60000*3) {
                        if(d.algoTimeline.data && d.algoTimeline.data.list) {
                            d.algoTimeline.data.list = d.algoTimeline.data.list.filter(t => !seenTweetIds.includes(t.id_str));
                            if(d.algoTimeline.data.list.length > 5) {
                                debugLog('timeline.getAlgorithmicalV2WithCache', 'cache', d.algoTimeline.data, seenTweetIds);
                                return resolve(d.algoTimeline.data);
                            }
                        }
                    }
                    API.timeline.getAlgorithmicalV2(undefined, 40, seenTweetIds).then(data => {
                        chrome.storage.local.set({
                            algoTimeline: {
                                date: Date.now(),
                                data
                            }
                        });
                        resolve(data);
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
        getMixed: async (seenTweetIds = []) => {
            let [chrono, algo] = await Promise.allSettled([API.timeline.getChronologicalV2(), API.timeline.getAlgorithmicalV2WithCache(seenTweetIds)]);
            debugLog('timeline.getMixed', 'start', {chrono, algo});
            if(chrono.reason) {
                throw chrono.reason;
            }
            chrono = chrono.value;
            if(algo.reason) {
                algo = [];
            } else {
                algo = algo.value.list;
            }
            let social = algo.filter(t => t.socialContext && (t.socialContext.contextType === 'Like' || t.socialContext.contextType === 'Follow'));
            for(let i = chrono.list.length-1; i >= 0; i--) {
                if(social.length === 0) break;
                if(i % 7 === 0) {
                    if(
                        chrono.list.map(t => t.id_str).includes(social[social.length-1].id_str)
                    ) {
                        social.pop();
                        continue;
                    }
                    if(chrono.list[chrono.list.length-i-1] && chrono.list[chrono.list.length-i-1].threadContinuation) {
                        continue;
                    }
                    chrono.list.splice(chrono.list.length-i, 0, social.pop());
                }
            }
            debugLog('timeline.getMixed', 'end', chrono);
            return chrono;
        }
    },
    discover: {
        getPeople: (cache = true) => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['discoverData'], d => {
                    if(cache && d.discoverData && Date.now() - d.discoverData.date < 60000*10) {
                        debugLog('discover.getPeople', 'cache', d.discoverData.data)
                        return resolve(d.discoverData.data);
                    }
                    fetch(`/i/api/2/people_discovery/modules_urt.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&display_location=connect&client_type=rweb&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerifiedhighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "x-twitter-active-user": "yes",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                        },
                        credentials: "include"
                    }).then(i => i.json()).then(data => {
                        debugLog('discover.getPeople', {cache, data});
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
        },
        getSimilarPeople: (id, cache = true, by_screen_name = false) => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get([`peopleRecommendations`], d => {
                    if(!d.peopleRecommendations) d.peopleRecommendations = {};
                    if(cache && d.peopleRecommendations[`${id}${by_screen_name}`] && Date.now() - d.peopleRecommendations[`${id}${by_screen_name}`].date < 60000*7) {
                        debugLog('discover.getSimilarPeople', 'cache', d.peopleRecommendations[`${id}${by_screen_name}`].data);
                        return resolve(d.peopleRecommendations[`${id}${by_screen_name}`].data);
                    }
                    fetch(`/i/api/1.1/users/recommendations.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&&pc=true&display_location=profile_accounts_sidebar&limit=4&${by_screen_name ? 'screen_name' : 'user_id'}=${id}&ext=mediaStats%2CverifiedType%2CisBlueVerified%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "x-twitter-active-user": "yes",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                        },
                        credentials: "include"
                    }).then(i => i.json()).then(data => {
                        debugLog('discover.getSimilarPeople', {id, cache, by_screen_name, data});
                        if (data.errors && data.errors[0].code === 32) {
                            return reject("Not logged in");
                        }
                        if (data.errors && data.errors[0]) {
                            return reject(data.errors[0].message);
                        }
                        resolve(data);
                        d.peopleRecommendations[`${id}${by_screen_name}`] = {
                            date: Date.now(),
                            data
                        };
                        chrome.storage.local.set({peopleRecommendations: d.peopleRecommendations}, () => {});
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
        getTrends: () => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['trends'], d => {
                    if(d.trends && Date.now() - d.trends.date < 60000*5) {
                        debugLog('discover.getTrends', 'cache', d.trends.data);
                        return resolve(d.trends.data);
                    }
                    fetch(`https://api.${location.hostname}/1.1/trends/plus.json?max_trends=8`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                        },
                        credentials: "include",
                    }).then(i => i.json()).then(data => {
                        debugLog('discover.getTrends', data);
                        if (data.errors && data.errors[0]) {
                            return reject(data.errors[0].message);
                        }
                        resolve(data);
                        chrome.storage.local.set({trends: {
                            date: Date.now(),
                            data
                        }}, () => {});
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
        getTrendsV2: (cache) => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['trendsv2'], d => {
                    if(d.trendsv2 && Date.now() - d.trendsv2.date < 60000*5 && cache) {
                        debugLog('discover.getTrendsV2', 'cache', d.trendsv2.data);
                        return resolve(d.trendsv2.data);
                    }
                    fetch(`/i/api/2/guide.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&include_ext_is_blue_verified=1&include_ext_verified_type=1&include_ext_profile_image_shape=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_ext_limited_action_results=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_views=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&requestContext=launch&candidate_source=trends&include_page_configuration=false&entity_tokens=false&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2CbirdwatchPivot%2CsuperFollowMetadata%2CunmentionInfo%2CeditControl`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en",
                            "X-Twitter-Utcoffset": getTimeZone().replace(":", ""),
                        },
                        credentials: "include",
                    }).then(i => i.json()).then(d => {
                        debugLog('discover.getTrendsV2', 'start', {cache, data: d});
                        if (d.errors && d.errors[0]) {
                            return reject(d.errors[0].message);
                        }
                        let data = [];
                        let instructions = d.timeline.instructions;
                        let ae = instructions.find(i => i.addEntries);
                        if(!ae) return resolve([]);
                        let entries = ae.addEntries.entries;
                        let trends = entries.find(i => i.entryId === 'trends');
                        if(!trends) return resolve([]);
                        trends = trends.content.timelineModule.items;
                        trends.forEach(trend => {
                            if(!trend.item || !trend.item.content || !trend.item.content.trend) return;
                            let desc = trend.item.content.trend.trendMetadata.domainContext;
                            if(String(desc).includes("undefined")) {//maybe promoted trends?
                                desc = ``;
                                if(trend.item.content.trend.trendMetadata.metaDescription) {
                                    desc += trend.item.content.trend.trendMetadata.metaDescription;
                                }
                            } else {
                                if(trend.item.content.trend.trendMetadata.metaDescription) {
                                    desc += ` · ${trend.item.content.trend.trendMetadata.metaDescription}`;
                                }
                            }
                            //remove promoted trends
                            if((desc.startsWith('Promoted by') || /*en*/
                            desc.startsWith('Promocionado por') || /*es*/
                            desc.startsWith('Gesponsert von') || /*de*/
                            desc.startsWith('Реклама от') || /*ru*/
                            desc.endsWith('によるプロモーション') || /*jp*/
                            desc.endsWith('님이 프로모션함')||/*ko*/
                            desc.startsWith('Sponsorisé par') || /*fr*/
                            desc.endsWith('sponsorluğunda') || /*tr*/
                            desc.endsWith('مُروَّج بواسطة') || /*ar*/
                            desc.startsWith('Promowane przez') || /*pl*/
                            desc.startsWith('Реклама від') || /*uk*/
                            desc.startsWith('Sponsorizzato da') || /*it*/
                            desc.startsWith('Promovat de') || /*ro*/
                            desc.startsWith('โฆษณาโดย') || /*th*/
                            desc.startsWith('Được quảng bá bởi') || /*vi*/
                            desc.startsWith('Sponzoruje') || /*cs*/
                            desc.startsWith('Προώθηση από') || /*el*/
                            desc.startsWith('Promoted door') || /*nl*/
                            desc.startsWith('Promoted ni') || /*tl*/
                            desc.startsWith('מקודם על-ידי') || /*he*/
                            desc.startsWith('Patrocinat per') /*ca*/
                            ) && !vars.enableAd) {
                                return;
                            }
                            //fix posts to tweets
                            //If you update Twitter to use translation for that part, you should delete this part.
                            if(desc.endsWith(' Posts')) {
                                desc = desc.replace(` Posts`, ` ${LOC.tweets.message}`)
                            }
                            if(desc.endsWith(' posts')) {//why they changed to lower-case
                                desc = desc.replace(` posts`, ` ${LOC.tweets.message}`)
                            }
                            if(desc.includes('Only on X')) {
                                desc = desc.replace(`Only on X`, `Only on ${LOC.twitter.message}`)
                            }
                            data.push({trend:{
                                name: trend.item.content.trend.name,
                                meta_description: desc,
                            }})
                        });
                        debugLog('discover.getTrendsV2', 'end', {cache, data: {modules: data}});
                        resolve({modules: data});
                        chrome.storage.local.set({trendsv2: {
                            date: Date.now(),
                            data: {modules: data}
                        }}, () => {});
                    }).catch(e => {
                        console.error(e);
                        reject(e);
                    });
                });
            });
        },
        getHashflags: () => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['hashflags'], d => {
                    if(d.hashflags && Date.now() - d.hashflags.date < 60000*60*4) {
                        return resolve(d.hashflags.data);
                    }
                    fetch(`/i/api/1.1/hashflags.json`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        credentials: "include",
                    }).then(i => i.json()).then(data => {
                        if (data.errors && data.errors[0]) {
                            return reject(data.errors[0].message);
                        }
                        resolve(data);
                        chrome.storage.local.set({hashflags: {
                            date: Date.now(),
                            data
                        }}, () => {});
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
        getHashflagsV2: () => { // uses memory-caching for better performance
            return new Promise((resolve, reject) => {
                // check in memory first
                if(hashflagStorage && Date.now() - hashflagStorage.date < 60000*60*4) {
                    return resolve(hashflagStorage.data);
                }
                // then in local storage
                chrome.storage.local.get(['hashflags'], d => {
                    if(d.hashflags && Date.now() - d.hashflags.date < 60000*60*4) {
                        // copy to memory 
                        hashflagStorage = d.hashflags;
                        return resolve(d.hashflags.data);
                    }
                    fetch(`/i/api/1.1/hashflags.json`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        credentials: "include",
                    }).then(i => i.json()).then(data => {
                        if (data.errors && data.errors[0]) {
                            return reject(data.errors[0].message);
                        }
                        resolve(data);
                        // save to both local storage and memory
                        chrome.storage.local.set({hashflags: {
                            date: Date.now(),
                            data
                        }}, () => {});
                        hashflagStorage = {
                            date: Date.now(),
                            data
                        };
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
    },
    notifications: {
        getUnreadCount: (cache = true, userId = '') => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['unreadCount'], d => {
                    if(cache && d.unreadCount && Date.now() - d.unreadCount.date < 30000 && d.unreadCount.userId == userId) {
                        return resolve(d.unreadCount.data);
                    }
                    if(userId == user.id_str) userId = '';
                    let multiAuthHeader = userId ? { "x-web-auth-multi-user-id": userId } : {};
                    fetch(`/i/api/2/badge_count/badge_count.json?supports_ntab_urt=1`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "x-twitter-active-user": userId ? "no" : "yes",
                            ...multiAuthHeader
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
                        chrome.storage.local.set({unreadCount: {
                            date: Date.now(),
                            data,
                            userId
                        }}, () => {});
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
        get: (cursor, onlyMentions = false, cache = true, prependToCache = false) => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['notifications'], d => {
                    if(cache) {
                        if(d.notifications && Date.now() - d.notifications.date < 60000 && !cursor && !onlyMentions) {
                            debugLog('notifications.get', 'cache', d.notifications.data);
                            return resolve(d.notifications.data);
                        }
                    } else {
                        if(d.notifications && Date.now() - d.notifications.date < 15000 && !cursor && !onlyMentions) {
                            debugLog('notifications.get', 'cache', d.notifications.data);
                            return resolve(d.notifications.data);
                        }
                    }
                    if(!cursor && !onlyMentions) {
                        if(loadingNotifs) {
                            return loadingNotifs.listeners.push([resolve, reject]);
                        } else {
                            loadingNotifs = {
                                listeners: []
                            };
                        }
                    }
                    fetch(`/i/api/2/notifications/${onlyMentions ? 'mentions' : 'all'}.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&include_ext_is_blue_verified=1&include_ext_verified_type=1&include_ext_profile_image_shape=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_ext_limited_action_results=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_views=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&requestContext=launch&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2CbirdwatchPivot%2CsuperFollowMetadata%2CunmentionInfo%2CeditControl${cursor ? `&cursor=${cursor}` : ''}`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                        },
                        credentials: "include",
                    }).then(i => i.json()).then(data => {
                        debugLog('notifications.get', 'start', {cursor, onlyMentions, data});
                        if (data.errors && data.errors[0].code === 32) {
                            if(!cursor && !onlyMentions) {
                                loadingNotifs.listeners.forEach(l => l[1]("Not logged in"));
                                loadingNotifs = undefined;
                            }
                            return reject("Not logged in");
                        }
                        if (data.errors && data.errors[0]) {
                            if(!cursor && !onlyMentions) {
                                loadingNotifs.listeners.forEach(l => l[1]("Not logged in"));
                                loadingNotifs = undefined;
                            }
                            return reject(data.errors[0].message);
                        }

                        let entries = data.timeline.instructions.find(i => i.addEntries).addEntries.entries;
                        let cursorTop = entries.find(e => e.entryId.startsWith('cursor-top-')).content.operation.cursor.value;
                        let cursorBottom = entries.find(e => e.entryId.startsWith('cursor-bottom-'))?.content.operation.cursor.value;
                        let unreadBefore = +data.timeline.instructions.find(i => i.markEntriesUnreadGreaterThanSortIndex).markEntriesUnreadGreaterThanSortIndex.sortIndex;
                        let unreadNotifications = 0;
                        let res = [];
                        for(let i in entries) {
                            if(!entries[i].entryId.startsWith('notification-')) continue;
                            let e = entries[i].content.item;

                            if(e.content.notification) {
                                let n = data.globalObjects.notifications[e.content.notification.id];
                                if(!n) continue;
                                if(e.feedbackInfo) {
                                    n.feedback = data.timeline.responseObjects.feedbackActions[e.feedbackInfo.feedbackKeys[0]];
                                    if(n.feedback) n.feedback.metadata = e.feedbackInfo.feedbackMetadata;
                                }
                                let tweet = n.template.aggregateUserActionsV1.targetObjects[0] ? data.globalObjects.tweets[n.template.aggregateUserActionsV1.targetObjects[0].tweet.id] : { full_text: '' };
                                if(tweet && tweet.user_id_str) {;
                                    if(tweet.quoted_status_id_str) {
                                        tweet.quoted_status = data.globalObjects.tweets[tweet.quoted_status_id_str];
                                        if(tweet.quoted_status) {
                                            tweet.quoted_status.user = data.globalObjects.users[tweet.quoted_status.user_id_str];
                                            tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                                        }
                                    }
                                    if(tweet.retweeted_status_id_str) {
                                        tweet.retweeted_status = data.globalObjects.tweets[tweet.retweeted_status_id_str];
                                        if(tweet.retweeted_status) {
                                            tweet.retweeted_status.user = data.globalObjects.users[tweet.retweeted_status.user_id_str];
                                            tweet.retweeted_status.user.id_str = tweet.retweeted_status.user_id_str;
                                        }
                                    }
                                    let user = tweet ? data.globalObjects.users[tweet.user_id_str] : undefined;
                                    user.id_str = tweet.user_id_str;
                                    tweet.user = user;
                                    updateElementsStats(tweet);
                                }

                                n.entry = e;
                                n.tweet = tweet;
                                n.users = data.globalObjects.users;
                                n.type = 'notification';
                                if(+entries[i].sortIndex > unreadBefore) {
                                    unreadNotifications++;
                                    n.unread = true;
                                }

                                res.push(n);
                            } else if(e.content.tweet) {
                                let t = data.globalObjects.tweets[e.content.tweet.id];
                                if(!t) continue;

                                t.user = data.globalObjects.users[t.user_id_str];
                                if(t.quoted_status_id_str) {
                                    t.quoted_status = data.globalObjects.tweets[t.quoted_status_id_str];
                                    if(t.quoted_status) t.quoted_status.user = data.globalObjects.users[t.quoted_status.user_id_str];
                                }
                                updateElementsStats(t);

                                t.type = 'tweet';
                                if(+entries[i].sortIndex > unreadBefore) {
                                    unreadNotifications++;
                                    t.unread = true;
                                }

                                res.push(t);
                            }
                        }

                        let out = {
                            list: res,
                            cursorTop,
                            cursorBottom,
                            unreadBefore,
                            unreadNotifications
                        };
                        debugLog('notifications.get', 'end', out);
                        resolve(out);

                        if(!cursor && !onlyMentions) {
                            loadingNotifs.listeners.forEach(l => l[0](out));
                            loadingNotifs = undefined;
                            chrome.storage.local.set({notifications: {
                                date: Date.now(),
                                data: out
                            }}, () => {});
                        }
                        if(prependToCache) {
                            chrome.storage.local.get(['notifications'], d => {
                                if(d.notifications && d.notifications.data && d.notifications.data.list) {
                                    d.notifications.data.list = d.notifications.data.list.filter(n => !res.find(r => r.type === 'notification' && r.id === n.id));
                                    d.notifications.data.list = res.concat(d.notifications.data.list);
                                    d.notifications.data.cursorTop = cursorTop;
                                    chrome.storage.local.set({notifications: d.notifications}, () => {});
                                }
                            });
                        }
                    }).catch(e => {
                        if(!cursor && !onlyMentions) {
                            loadingNotifs.listeners.forEach(l => l[1](e));
                            loadingNotifs = undefined;
                        }
                        reject(e);
                    });
                });
            });
        },
        markAsRead: cursor => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/2/notifications/all/last_seen_cursor.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
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
        },
        getDeviceFollowTweets: (cursor) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/2/notifications/device_follow.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_ext_limited_action_results=false&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&ext=mediaStats%2CverifiedType%2CisBlueVerified%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2CeditControl%2Ccollab_control%2Cvibe${cursor ? `&cursor=${cursor}` : ''}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                }).then(i => i.json()).then(data => {
                    debugLog('notifications.getDeviceFollowTweets', 'start', {cursor, data});
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let entries = data.timeline.instructions.find(i => i.addEntries).addEntries.entries;
                    let tweets = entries.filter(i => i.entryId.startsWith('tweet-')).map(i => data.globalObjects.tweets[i.content.item.content.tweet.id]);
                    for(let i in tweets) {
                        tweets[i].user = data.globalObjects.users[tweets[i].user_id_str];
                        if(tweets[i].quoted_status_id_str) {
                            tweets[i].quoted_status = data.globalObjects.tweets[tweets[i].quoted_status_id_str];
                            if(tweets[i].quoted_status) tweets[i].quoted_status.user = data.globalObjects.users[tweets[i].quoted_status.user_id_str];
                        }
                        if(tweets[i].retweeted_status_id_str) {
                            tweets[i].retweeted_status = data.globalObjects.tweets[tweets[i].retweeted_status_id_str];
                            if(tweets[i].retweeted_status) tweets[i].retweeted_status.user = data.globalObjects.users[tweets[i].retweeted_status.user_id_str];
                        }
                    }
                    let newCursor = entries.find(e => e.entryId.startsWith('cursor-bottom-'));
                    if(newCursor) {
                        newCursor = newCursor.content.operation.cursor.value;
                    }
                    let out = {
                        list: tweets,
                        cursor: newCursor
                    };
                    debugLog('notifications.getDeviceFollowTweets', 'end', out);
                    resolve(out)
                }).catch(e => {
                    reject(e);
                });
            });
        },
        view: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/2/notifications/view/${id}.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_ext_limited_action_results=false&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2CeditControl%2Ccollab_control%2Cvibe`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                }).then(i => i.json()).then(data => {
                    debugLog('notifications.view', 'start', {id, data});
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let entries = data.timeline.instructions.find(i => i.addEntries).addEntries.entries;
                    let tl = [];
                    for(let i in entries) {
                        let e = entries[i];
                        if(e.entryId.startsWith('tweet-')) {
                            let tweet = data.globalObjects.tweets[e.content.item.content.tweet.id];
                            tweet.user = data.globalObjects.users[tweet.user_id_str];
                            if(tweet.quoted_status_id_str) {
                                tweet.quoted_status = data.globalObjects.tweets[tweet.quoted_status_id_str];
                                if(tweet.quoted_status) {
                                    tweet.quoted_status.user = data.globalObjects.users[tweet.quoted_status.user_id_str];
                                }
                            }
                            if(tweet.retweeted_status_id_str) {
                                tweet.retweeted_status = data.globalObjects.tweets[tweet.retweeted_status_id_str];
                                if(tweet.retweeted_status) {
                                    tweet.retweeted_status.user = data.globalObjects.users[tweet.retweeted_status.user_id_str];
                                }
                            }
                            tl.push({data: tweet, type: 'tweet'});
                        } else if(e.entryId.startsWith('main-tweet-')) {
                            let id = e.content.timelineModule.items[0].item.content.tweet.id;
                            let tweet = data.globalObjects.tweets[id];
                            tweet.user = data.globalObjects.users[tweet.user_id_str];
                            if(tweet.quoted_status_id_str) {
                                tweet.quoted_status = data.globalObjects.tweets[tweet.quoted_status_id_str];
                                if(tweet.quoted_status) {
                                    tweet.quoted_status.user = data.globalObjects.users[tweet.quoted_status.user_id_str];
                                }
                            }
                            if(tweet.retweeted_status_id_str) {
                                tweet.retweeted_status = data.globalObjects.tweets[tweet.retweeted_status_id_str];
                                if(tweet.retweeted_status) {
                                    tweet.retweeted_status.user = data.globalObjects.users[tweet.retweeted_status.user_id_str];
                                }
                            }
                            tl.push({data: tweet, type: 'tweet'});
                        } else if(e.entryId.startsWith('user-')) {
                            let id = e.content.item.content.user.id;
                            let user = data.globalObjects.users[id];
                            tl.push({data: user, type: 'user'});
                        } else if(e.entryId.startsWith('main-user-')) {
                            let id = e.content.timelineModule.items[0].item.content.user.id;
                            let user = data.globalObjects.users[id];
                            tl.push({data: user, type: 'user'});
                        } else if(e.entryId.startsWith('list-')) {
                            let id = e.content.item.content.twitterList.id;
                            let list = data.globalObjects.lists[id];
                            tl.push({data: list, type: 'list'});
                        }
                    }
                    debugLog('notifications.view', 'end', tl);
                    resolve(tl);
                }).catch(e => {
                    reject(e);
                });
            });
        }
    },
    user: {
        get: (val, byId = true) => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/users/show.json?${byId ? `user_id=${val}` : `screen_name=${val}`}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.oauth_key,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": window.LANGUAGE ? window.LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => {
                    if(i.status === 401) {
                        setTimeout(() => {
                            location.href = `/i/flow/login?newtwitter=true`;
                        }, 50);
                    }
                    return i.json();
                }).then(data => {
                    debugLog('user.get', {val, byId, data});
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getV2: name => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/sLVLhk0bGj3MVFEKTdax1w/UserByScreenName?variables=%7B%22screen_name%22%3A%22${name}%22%2C%22withSafetyModeUserFields%22%3Atrue%2C%22withSuperFollowsUserFields%22%3Atrue%7D&features=${encodeURIComponent(JSON.stringify({"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true}))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('user.getV2', 'start', {name, data});
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    if(data.data.user.result.unavailable_message) {
                        return reject(data.data.user.result.unavailable_message.text);
                    }

                    let result = data.data.user.result;
                    result.legacy.id_str = result.rest_id;
                    if(result.legacy_extended_profile.birthdate) {
                        result.legacy.birthdate = result.legacy_extended_profile.birthdate;
                    }
                    if(result.professional) {
                        result.legacy.professional = result.professional;
                    }
                    if(result.affiliates_highlighted_label && result.affiliates_highlighted_label.label) {
                        result.legacy.affiliates_highlighted_label = result.affiliates_highlighted_label.label;
                    }
                    if(result.is_blue_verified && !result.legacy.verified_type) {
                        result.legacy.verified_type = "Blue";
                    }
        
                    debugLog('user.getV2', 'end', result.legacy);
                    resolve(result.legacy);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        follow: screen_name => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/friendships/create.json`, {
                    method: 'POST',
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    credentials: "include",
                    body: `screen_name=${screen_name}`
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                    if(screen_name === 'dimden') {
                        chrome.storage.local.set({'followingDeveloper': true}, () => {});
                    }
                    chrome.storage.local.get(['sortedFollowers'], async d => {
                        let sortedFollowers = d.sortedFollowers;
                        if(!sortedFollowers) return;
                        if(!sortedFollowers[user.id_str]) return;
                        if(!sortedFollowers[user.id_str].followers) return;
                        if(sortedFollowers[user.id_str].followers.length === 0) return;

                        let index = sortedFollowers[user.id_str].followers.findIndex(f => f[2] === screen_name);
                        if(index === -1) return;
                        sortedFollowers[user.id_str].followers[index][7] = 1;
                        sortedFollowers[user.id_str].followers[index][1]++;
                        chrome.storage.local.set({sortedFollowers}, () => {});
                    });
                    let cachedUser = Object.values(userStorage).find(u => u.screen_name.toLowerCase() === screen_name.toLowerCase());
                    if(cachedUser) {
                        cachedUser.following = true;
                        cachedUser.following_count++;
                    }
                }).catch(e => {
                    reject(e);
                });
            });
        },
        unfollow: screen_name => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/friendships/destroy.json`, {
                    method: 'POST',
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    credentials: "include",
                    body: `screen_name=${screen_name}`
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                    if(screen_name === 'dimden') {
                        chrome.storage.local.set({'followingDeveloper': false}, () => {});
                    }
                    chrome.storage.local.get(['sortedFollowers'], async d => {
                        let sortedFollowers = d.sortedFollowers;
                        if(!sortedFollowers) return;
                        if(!sortedFollowers[user.id_str]) return;
                        if(!sortedFollowers[user.id_str].followers) return;
                        if(sortedFollowers[user.id_str].followers.length === 0) return;

                        let index = sortedFollowers[user.id_str].followers.findIndex(f => f[2] === screen_name);
                        if(index === -1) return;
                        sortedFollowers[user.id_str].followers[index][7] = 1;
                        sortedFollowers[user.id_str].followers[index][1]--;
                        chrome.storage.local.set({sortedFollowers}, () => {});
                    });
                    let cachedUser = Object.values(userStorage).find(u => u.screen_name.toLowerCase() === screen_name.toLowerCase());
                    if(cachedUser) {
                        cachedUser.following = false;
                        cachedUser.following_count--;
                    }
                }).catch(e => {
                    reject(e);
                });
            });
        },
        cancelFollowRequest: screen_name => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/friendships/cancel.json`, {
                    method: 'POST',
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
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
        },
        getTweets: (id, max_id, replies = false) => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/statuses/user_timeline.json?count=100&exclude_replies=${!replies}&include_my_retweet=1&include_rts=1&user_id=${id}${max_id ? `&max_id=${max_id}` : ''}&cards_platform=Web-12&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session"
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
        },
        getTweetsV2: (id, cursor, replies = false, useDiffKey) => {
            return new Promise((resolve, reject) => {
                if(typeof useDiffKey === 'undefined' && isFinite(+localStorage.hitRateLimit) && +localStorage.hitRateLimit > Date.now()) {
                    useDiffKey = true;
                }
                let variables = {"userId":id,"count":100,"includePromotedContent":false,"withQuickPromoteEligibilityTweetFields":false,"withVoice":true,"withV2Timeline":true};
                let features = {"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_home_pinned_timelines_enabled":true,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"c9s_tweet_anatomy_moderator_badge_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":false,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_media_download_video_enabled":false,"responsive_web_enhance_cards_enabled":false};
                if(cursor) {
                    variables.cursor = cursor;
                }
                let api = "VgitpdpNZ-RUIp5D1Z_D-A/UserTweets";
                if(replies) {
                    api = "YlkSUg0mRBx7-EkxCvc-bw/UserTweetsAndReplies";
                }
                
                fetch(`/i/api/graphql/${api}?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(features))}`, {
                    headers: {
                        "authorization": useDiffKey ? OLDTWITTER_CONFIG.oauth_key : OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(r => {
                    r.text().then(data => {
                        try {
                            data = JSON.parse(data);
                        } catch(e) {
                            console.error(e, data);
                            if(String(e).includes("SyntaxError")) {
                                if(String(e).includes('Rate limit exceeded')) {
                                    let rateLimitReset = r.headers.get('x-rate-limit-reset');
                                    if(rateLimitReset) {
                                        let date = new Date(+rateLimitReset * 1000);
                                        let minutesLeft = Math.floor((date - Date.now()) / 1000 / 60);
                                        return reject(`Rate limit exceeded, try again in ${minutesLeft} minutes.`);
                                    }
                                }
                                return reject(data);
                            } else {
                                return reject(e);
                            }
                        }
                        debugLog('user.getTweetsV2', 'start', data);
                        if (data.errors && data.errors[0].code === 32) {
                            return reject("Not logged in");
                        }
                        if (data.errors && data.errors[0] && !data.data?.user?.result?.timeline_v2?.timeline?.instructions) {
                            if(data.errors[0].code === 88 && typeof useDiffKey === 'undefined') {
                                localStorage.hitRateLimit = Date.now() + 1000 * 60 * 10;
                                return API.user.getTweetsV2(id, cursor, replies, true).then(resolve).catch(reject);
                            }
                            return reject(data.errors[0].message);
                        }
                        let instructions = data.data.user.result.timeline_v2.timeline.instructions;
                        let entries = instructions.find(e => e.type === "TimelineAddEntries");
                        if(!entries) {
                            return reject("Nothing here");
                        }
                        entries = entries.entries;

                        sendRequestToEventListeners('UserTweets', data);

                        let tweets = [];
                        for(let entry of entries) {
                            if(entry.entryId.startsWith("tweet-")) {
                                let result = entry.content.itemContent.tweet_results.result;
                                let tweet = parseTweet(result);
                                if(tweet) {
                                    tweet.hasModeratedReplies = entry.content.itemContent.hasModeratedReplies;
                                    if(replies) {
                                        tweet.nonReply = true;
                                    }
                                    tweets.push(tweet);
                                }
                            } else if(entry.entryId.startsWith("profile-conversation-")) {
                                let items = entry.content.items;
                                for(let i = 0; i < items.length; i++) {
                                    let item = items[i];
                                    let result = item.item.itemContent.tweet_results.result;
                                    if(item.entryId.includes("-tweet-")) {
                                        let tweet = parseTweet(result);
                                        if(!tweet) continue;
            
                                        if(i !== items.length - 1) tweet.threadContinuation = true;
                                        if(i !== 0) tweet.noTop = true;

                                        tweet.hasModeratedReplies = item.item.itemContent.hasModeratedReplies;
                                        tweets.push(tweet);
                                    }
                                }
                            }
                        }
                        let pinEntry = instructions.find(e => e.type === "TimelinePinEntry");
                        let pinnedTweet;
                        if(pinEntry && pinEntry.entry && pinEntry.entry.content && pinEntry.entry.content.itemContent) {
                            let result = pinEntry.entry.content.itemContent.tweet_results.result;
                            pinnedTweet = parseTweet(result);
                            if(pinnedTweet) {
                                pinnedTweet.hasModeratedReplies = pinEntry.entry.content.itemContent.hasModeratedReplies;
                            }
                        } else if(pinEntry) {
                            console.error("Weird bug, pinEntry is there but no entry or content", pinEntry);
                        }
            
                        const out = {
                            tweets,
                            pinnedTweet,
                            cursor: entries.find(e => e.entryId.startsWith("sq-cursor-bottom-") || e.entryId.startsWith("cursor-bottom-")).content.value
                        };
                        debugLog('user.getTweetsV2', 'end', out);
                        resolve(out);
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
        getMediaTweets: (id, cursor) => {
            return new Promise((resolve, reject) => {
                let variables = {"userId":id,"count":20,"cursor":cursor,"includePromotedContent":false,"withClientEventToken":false,"withBirdwatchNotes":false,"withVoice":true,"withV2Timeline":true};
                let features = {"rweb_tipjar_consumption_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"communities_web_enable_tweet_community_results_fetch":true,"c9s_tweet_anatomy_moderator_badge_enabled":true,"articles_preview_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"creator_subscriptions_quote_tweet_preview_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"rweb_video_timestamps_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_enhance_cards_enabled":false};
                let fieldToggles = {"withArticlePlainText":false};
                if(cursor) {
                    variables.cursor = cursor;
                }
                fetch(`/i/api/graphql/1dmA2m-qIsGm2XfqQtcD3A/UserMedia?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(features))}&fieldToggles=${encodeURIComponent(JSON.stringify(fieldToggles))}`, {
                    headers: {
                        "authorization": isFinite(+localStorage.hitRateLimit) && +localStorage.hitRateLimit > Date.now() ? OLDTWITTER_CONFIG.oauth_key : OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('user.getMediaTweets', 'start', {id, cursor, data});
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let entries = data.data.user.result.timeline_v2.timeline.instructions.find(i => i.type === 'TimelineAddEntries').entries;
                    let isGrid = !!entries.find(e => e.entryId === 'profile-grid-0') || data.data.user.result.timeline_v2.timeline.instructions.find(i => i.type === 'TimelineAddToModule');
                    let tweets;
                    if (isGrid) {
                        let items;
                        if (cursor) {
                            items = data.data.user.result.timeline_v2.timeline.instructions.find(i => i.type === 'TimelineAddToModule').moduleItems;
                        } else {
                            items = entries.find(e => e.entryId === 'profile-grid-0')?.content?.items || [];
                        }
                        tweets = items.filter(e => e.entryId.startsWith('profile-grid-0-tweet-')).map(t => {
                            let tweet = parseTweet(t.item.itemContent.tweet_results.result);
                            if(tweet) {
                                tweet.hasModeratedReplies = t.item.itemContent.hasModeratedReplies;
                            }
                            return tweet;
                        }).filter(i => i);
                    } else {
                        tweets = entries.filter(e => e.entryId.startsWith('tweet-')).map(t => {
                            let tweet = parseTweet(t.content.itemContent.tweet_results.result);
                            if(tweet) {
                                tweet.hasModeratedReplies = t.content.itemContent.hasModeratedReplies;
                            }
                            return tweet;
                        }).filter(i => i);
                    }

                    let newCursor = entries.find(e => e.entryId.startsWith('cursor-bottom-'));
                    if(newCursor) {
                        newCursor = newCursor.content.value;
                    }
        
                    let out = {
                        tweets,
                        cursor: newCursor
                    };
                    debugLog('user.getMediaTweets', 'end', out);
                    resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        friendsFollowing: (val, by_id = true) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/friends/following/list.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cursor=-1&${by_id ? `user_id=${val}` : `screen_name=${val}`}&count=10&with_total_count=true`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session"
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
        },
        getRelationship: id => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/friendships/show.json?source_id=${id}&target_screen_name=JinjersTemple&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session"
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
        },
        receiveNotifications: (id, receive = false) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/friendships/update.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cursor=-1&id=${id}&device=${receive}`
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
        },
        block: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/blocks/create.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `user_id=${id}`
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
        },
        unblock: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/blocks/destroy.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `user_id=${id}`
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }

                    sendRequestToEventListeners('blocks/destroy.json', data);

                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        mute: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/mutes/users/create.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `user_id=${id}`
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
        },
        unmute: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/mutes/users/destroy.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `user_id=${id}`
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }

                    sendRequestToEventListeners('mutes/users/destroy.json', data);

                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        removeFollower: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/QpNfg0kpPRfjROQ_9eOLXA/RemoveFollower`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    credentials: "include",
                    method: 'post',
                    body: JSON.stringify({"variables":{"target_user_id":id},"queryId":"QpNfg0kpPRfjROQ_9eOLXA"})
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
        },
        getFavorites: (id, cursor) => {
            return new Promise((resolve, reject) => {
                let obj = {
                    "userId": id,
                    "count": 50,
                    "includePromotedContent": false,
                    "withSuperFollowsUserFields": true,
                    "withDownvotePerspective": false,
                    "withReactionsMetadata": false,
                    "withReactionsPerspective": false,
                    "withSuperFollowsTweetFields": true,
                    "withClientEventToken": false,
                    "withBirdwatchNotes": false,
                    "withVoice": true,
                    "withV2Timeline": true
                };
                if(cursor) obj.cursor = cursor;
                fetch(`/i/api/graphql/vni8vUvtZvJoIsl49VPudg/Likes?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
                    "dont_mention_me_view_api_enabled": true,
                    "interactive_text_enabled": true,
                    "responsive_web_uc_gql_enabled": false,
                    "vibe_tweet_context_enabled": false,
                    "responsive_web_edit_tweet_api_enabled": false,
                    "standardized_nudges_misinfo": false,
                    "responsive_web_enhance_cards_enabled": false
                }))}`, {
                    headers: {
                        "authorization": isFinite(+localStorage.hitRateLimit) && +localStorage.hitRateLimit > Date.now() ? OLDTWITTER_CONFIG.oauth_key : OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('user.getFavorites', 'start', {id, cursor, data});
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    if(!data.data.user.result.timeline_v2.timeline.instructions[0]) {
                        return resolve({
                            tl: [],
                            cursor: null
                        })
                    }
                    let out = {
                        tl: data.data.user.result.timeline_v2.timeline.instructions[0].entries
                            .filter(e => e.entryId.startsWith('tweet-') && e.content.itemContent.tweet_results.result)
                            .map(e => parseTweet(e.content.itemContent.tweet_results.result))
                            .filter(e => e),
                        cursor: data.data.user.result.timeline_v2.timeline.instructions[0].entries.find(e => e.entryId.startsWith('cursor-bottom')).content.value
                    };
                    debugLog('user.getFavorites', 'end', out);
                    resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getFollowing: (id, cursor) => {
            return new Promise((resolve, reject) => {
                fetch(`https://${location.hostname}/i/api/1.1/friends/list.json?include_followed_by=1&user_id=${id}&count=100${cursor ? `&cursor=${cursor}` : ""}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.oauth_key,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve({
                        list: data.users,
                        cursor: data.next_cursor_str !== "0" ? data.next_cursor_str : null
                    });
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getFollowers: (id, cursor, count = 100) => {
            return new Promise((resolve, reject) => {
                fetch(`https://${location.hostname}/i/api/1.1/followers/list.json?include_followed_by=1&user_id=${id}&count=${count}${cursor ? `&cursor=${cursor}` : ""}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.oauth_key,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve({
                        list: data.users,
                        cursor: data.next_cursor_str !== "0" ? data.next_cursor_str : null
                    });
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getFollowingV2: (id, cursor) => {
            return new Promise((resolve, reject) => {
                let obj = {
                    "userId": id,
                    "count": 100,
                    "includePromotedContent": false
                };
                if(cursor) obj.cursor = cursor;
                fetch(`/i/api/graphql/t-BPOrMIduGUJWO_LxcvNQ/Following?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"rweb_lists_timeline_redesign_enabled":false,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":false,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_media_download_video_enabled":false,"responsive_web_enhance_cards_enabled":false}))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('user.getFollowingV2', 'start', {id, cursor, data});
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let list = data.data.user.result.timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries').entries;
                    const out = {
                        list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                            let user = e.content.itemContent.user_results.result;
                            if(!user) return;
                            user.legacy.id_str = user.rest_id;
                            if(user.is_blue_verified && !user.legacy.verified_type) {
                                user.legacy.verified = true;
                                user.legacy.verified_type = "Blue";
                            }
                            return user.legacy;
                        }).filter(e => e),
                        cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
                    }
                    debugLog('user.getFollowingV2', 'end', out);
                    resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getFollowersV2: (id, cursor, count = 100) => {
            return new Promise((resolve, reject) => {
                let obj = {
                    "userId": id,
                    "count": count,
                    "includePromotedContent": false,
                    "withSuperFollowsUserFields": true,
                    "withDownvotePerspective": false,
                    "withReactionsMetadata": false,
                    "withReactionsPerspective": false,
                    "withSuperFollowsTweetFields": true,
                    "withClientEventToken": false,
                    "withBirdwatchNotes": false,
                    "withVoice": true,
                    "withV2Timeline": true
                };
                if(cursor) obj.cursor = cursor;
                fetch(`/i/api/graphql/fJSopkDA3UP9priyce4RgQ/Followers?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
                    "dont_mention_me_view_api_enabled": true,
                    "interactive_text_enabled": true,
                    "responsive_web_uc_gql_enabled": false,
                    "vibe_tweet_context_enabled": false,
                    "responsive_web_edit_tweet_api_enabled": false,
                    "standardized_nudges_misinfo": false,
                    "responsive_web_enhance_cards_enabled": false
                }))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('user.getFollowersV2', 'start', {id, cursor, data});
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let list = data.data.user.result.timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries').entries;
                    const out = {
                        list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                            let user = e.content.itemContent.user_results.result;
                            user.legacy.id_str = user.rest_id;
                            if(user.is_blue_verified && !user.legacy.verified_type) {
                                user.legacy.verified = true;
                                user.legacy.verified_type = "Blue";
                            }
                            return user.legacy;
                        }),
                        cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
                    };
                    debugLog('user.getFollowersV2', 'end', out);
                    resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getFollowingIds: (cursor = -1, count = 5000) => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/friends/ids.json?cursor=${cursor}&stringify_ids=true&count=${count}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
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
        },
        getFollowersIds: (cursor = -1, count = 5000) => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/followers/ids.json?cursor=${cursor}&stringify_ids=true&count=${count}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
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
        },
        lookup: ids => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/users/lookup.json?user_id=${ids.join(",")}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.oauth_key,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
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
        },
        getFollowersYouFollow: (id, cursor) => {
            return new Promise((resolve, reject) => {
                let obj = {
                    "userId": id,
                    "count": 50,
                    "includePromotedContent": false
                };
                if(cursor) obj.cursor = cursor;
                fetch(`/i/api/graphql/m8AXvuS9H0aAI09J3ISOrw/FollowersYouKnow?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"rweb_lists_timeline_redesign_enabled":false,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":false,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_media_download_video_enabled":false,"responsive_web_enhance_cards_enabled":false}))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('user.getFollowersYouFollow', 'start', {id, cursor, data});
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let list = data.data.user.result.timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries').entries;
                    const out = {
                        list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                            let user = e.content.itemContent.user_results.result;
                            user.legacy.id_str = user.rest_id;
                            if(user.is_blue_verified && !user.legacy.verified_type) {
                                user.legacy.verified = true;
                                user.legacy.verified_type = "Blue";
                            }
                            return user.legacy;
                        }),
                        cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
                    };
                    debugLog('user.getFollowersYouFollow', 'end', out);
                    resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        switchRetweetsVisibility: (user_id, see) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/friendships/update.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `id=${user_id}&retweets=${see}`
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
        },
        getFollowRequests: (cursor = -1) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/friendships/incoming.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cursor=${cursor}&stringify_ids=true&count=100`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session"
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
        },
        acceptFollowRequest: user_id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/friendships/accept.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `user_id=${user_id}`
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
        },
        declineFollowRequest: user_id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/friendships/deny.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `user_id=${user_id}`
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
        },
        translateBio: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/strato/column/None/profileUserId=${id},destinationLanguage=None,translationSource=Some(Google)/translation/service/translateProfile`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('user.translateBio', id, data);
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data.profileTranslation);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getLists: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/mLKOzzVOWUycBiExBT1gjg/CombinedLists?variables=${encodeURIComponent(JSON.stringify({"userId":id,"count":100,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true}))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
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
                    chrome.storage.local.set({listData: {}}, () => {});
                    resolve(
                        data.data.user.result.timeline.timeline.instructions.find(i => i.entries).entries.filter(e => e.entryId.startsWith('list-')).map(e => e.content.itemContent.list)
                    );
                }).catch(e => {
                    reject(e);
                });
            });
        }
    },
    tweet: {
        post: data => { // deprecated
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/statuses/update.json`, {
                    method: 'POST',
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
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
        },
        /* 
            text | tweet_text | status - tweet text
            media | media_ids - media ids
            card_uri - card uri
            sensitive - sensitive media
            in_reply_to_status_id | in_reply_to_tweet_id - reply to tweet id
            exclude_reply_user_ids - exclude mentions
            attachment_url - quote tweet url
            circle - circle id
            conversation_control - conversation control (follows | mentions)
        */
        postV2: tweet => {
            return new Promise((resolve, reject) => {
                let text;
                if(tweet.text) {
                    text = tweet.text;
                } else if(tweet.tweet_text) {
                    text = tweet.tweet_text;
                } else if(tweet.status) {
                    text = tweet.status;
                } else {
                    text = "";
                }
                let variables = {
                    "tweet_text": text,
                    "media": {
                        "media_entities": [],
                        "possibly_sensitive": false
                    },
                    "semantic_annotation_ids": [],
                    "dark_request": false
                };
                if(tweet.card_uri) {
                    variables.card_uri = tweet.card_uri;
                }
                if(tweet.media_ids) {
                    if(typeof tweet.media_ids === "string") {
                        tweet.media = tweet.media_ids.split(",");
                    } else {
                        tweet.media = tweet.media_ids;
                    }
                }
                if(tweet.media) {
                    variables.media.media_entities = tweet.media.map(i => ({media_id: i, tagged_users: []}));
                    if(tweet.sensitive) {
                        variables.media.possibly_sensitive = true;
                    }
                }
                if(tweet.conversation_control === 'follows') {
                    variables.conversation_control = { mode: 'Community' };
                } else if(tweet.conversation_control === 'mentions') {
                    variables.conversation_control = { mode: 'ByInvitation' };
                }
                if(tweet.circle) {
                    variables.trusted_friends_control_options = { "trusted_friends_list_id": tweet.circle };
                }
                if(tweet.in_reply_to_status_id) {
                    tweet.in_reply_to_tweet_id = tweet.in_reply_to_status_id;
                    delete tweet.in_reply_to_status_id;
                }
                if(tweet.in_reply_to_tweet_id) {
                    variables.reply = {
                        in_reply_to_tweet_id: tweet.in_reply_to_tweet_id,
                        exclude_reply_user_ids: []
                    }
                    if(tweet.exclude_reply_user_ids) {
                        if(typeof tweet.exclude_reply_user_ids === "string") {
                            tweet.exclude_reply_user_ids = tweet.exclude_reply_user_ids.split(",");
                        }
                        variables.reply.exclude_reply_user_ids = tweet.exclude_reply_user_ids;
                    }
                }
                if(tweet.attachment_url) {
                    variables.attachment_url = tweet.attachment_url;
                }
                debugLog('tweet.postV2', 'init', {tweet, variables});
                let parsedTweet = twttr.txt.parseTweet(text);
                fetch(`/i/api/graphql/${parsedTweet.weightedLength > 280 ? 'cuvrhmg0s4pGaLWV68NNnQ/CreateNoteTweet' : 'I_J3_LvnnihD0Gjbq5pD2g/CreateTweet'}`, {
                    method: 'POST',
                    headers: {
                        "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAAPYXBAAAAAAACLXUNDekMxqa8h%2F40K4moUkGsoc%3DTYfbDKbT3jJPCEVnMYqilB28NHfOPqkca3qaAxGfsyKCs0wRbw",
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json; charset=utf-8",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        variables,
                        "features": {"c9s_tweet_anatomy_moderator_badge_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":false,"tweet_awards_web_tipping_enabled":false,"responsive_web_home_pinned_timelines_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"responsive_web_media_download_video_enabled":false,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_enhance_cards_enabled":false},
                        "queryId": parsedTweet.weightedLength > 280 ? 'cuvrhmg0s4pGaLWV68NNnQ' : 'I_J3_LvnnihD0Gjbq5pD2g'
                    })
                }).then(i => i.json()).then(data => {
                    debugLog('tweet.postV2', 'start', data);
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let ct = data.data.create_tweet ? data.data.create_tweet : data.data.notetweet_create;
                    let result = ct.tweet_results.result;
                    let tweet = parseTweet(result);
                    if(result.trusted_friends_info_result && !tweet.limited_actions) {
                        tweet.limited_actions = 'limit_trusted_friends_tweet';
                    }
                    debugLog('tweet.postV2', 'end', tweet);
                    resolve(tweet);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        postScheduled: data => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/LCVzRQGxOaGnOnYH01NQXg/CreateScheduledTweet`, {
                    method: 'POST',
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json; charset=utf-8",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                    body: JSON.stringify(data)
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        favorite: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/lI07N6Otwv1PhnEgXILM7A/FavoriteTweet`, {
                    method: 'POST',
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json; charset=utf-8"
                    },
                    credentials: "include",
                    body: JSON.stringify({"variables":{"tweet_id":id},"queryId":"lI07N6Otwv1PhnEgXILM7A"})
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        unfavorite: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/ZYKSe-w7KEslx3JhSIk5LA/UnfavoriteTweet`, {
                    method: 'POST',
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json; charset=utf-8"
                    },
                    credentials: "include",
                    body: JSON.stringify({"variables":{"tweet_id":id},"queryId":"ZYKSe-w7KEslx3JhSIk5LA"})
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        retweet: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/ojPdsZsimiJrUGLR1sjUtA/CreateRetweet`, {
                    method: 'POST',
                    headers: {
                        "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAAFQODgEAAAAAVHTp76lzh3rFzcHbmHVvQxYYpTw%3DckAlMINMjmCwxUcaXbAN4XqJVdgMJaHqNOFgPMK0zN1qLqLQCF",
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                    body: JSON.stringify({"variables":{"tweet_id":id,"dark_request":false},"queryId":"ojPdsZsimiJrUGLR1sjUtA"})
                }).then(i => i.json()).then(data => {
                    debugLog('tweet.retweet', id, data);
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        unretweet: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/iQtK4dl5hBmXewYZuEOKVw/DeleteRetweet`, {
                    method: 'POST',
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json; charset=utf-8"
                    },
                    credentials: "include",
                    body: JSON.stringify({"variables":{"source_tweet_id":id,"dark_request":false},"queryId":"iQtK4dl5hBmXewYZuEOKVw"})
                }).then(i => i.json()).then(data => {
                    debugLog('tweet.unretweet', id, data);
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        delete: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/VaenaVgh5q5ih7kvyVjgtg/DeleteTweet`, {
                    method: 'POST',
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json; charset=utf-8"
                    },
                    credentials: "include",
                    body: JSON.stringify({"variables":{"tweet_id":id,"dark_request":false},"queryId":"VaenaVgh5q5ih7kvyVjgtg"})
                }).then(i => i.json()).then(data => {
                    debugLog('tweet.delete', id, data);
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        get: id => { // deprecated
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/statuses/show.json?id=${id}&include_my_retweet=1&cards_platform=Web13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
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
        },
        getV2: (id, useDiffKey) => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['tweetDetails'], d => {
                    if(!d.tweetDetails) d.tweetDetails = {};
                    if(d.tweetDetails[id] && Date.now() - d.tweetDetails[id].date < 60000*3) {
                        debugLog('tweet.getV2', 'cache', id, d.tweetDetails[id].data);
                        return resolve(d.tweetDetails[id].data);
                    }
                    if(loadingDetails[id]) {
                        if(!useDiffKey) return loadingDetails[id].listeners.push([resolve, reject]);
                    } else {
                        loadingDetails[id] = {
                            listeners: []
                        };
                    }
                    if(typeof useDiffKey === 'undefined' && isFinite(+localStorage.hitRateLimit) && +localStorage.hitRateLimit > Date.now()) {
                        useDiffKey = true;
                    }
                    fetch(`/i/api/graphql/KwGBbJZc6DBx8EKmyQSP7g/TweetDetail?variables=${encodeURIComponent(JSON.stringify({
                        "focalTweetId":id,
                        "with_rux_injections":false,
                        "includePromotedContent":false,
                        "withCommunity":true,
                        "withQuickPromoteEligibilityTweetFields":true,
                        "withBirdwatchNotes":true,
                        "withVoice":true,
                        "withV2Timeline":true
                    }))}&features=${encodeURIComponent(JSON.stringify({"rweb_lists_timeline_redesign_enabled":false,"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":false,"responsive_web_enhance_cards_enabled":false}))}`, {
                        headers: {
                            "authorization": useDiffKey ? OLDTWITTER_CONFIG.oauth_key : OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                        },
                        credentials: "include"
                    }).then(i => i.json()).then(data => {
                        debugLog('tweet.getV2', 'start', id, data);
                        if (data.errors && data.errors[0]) {
                            if(data.errors[0].code === 88 && !useDiffKey) {
                                localStorage.hitRateLimit = Date.now() + 600000;
                                API.tweet.getV2(id, true).then(t => {
                                    resolve(t);
                                    if(loadingDetails[id]) loadingDetails[id].listeners.forEach(l => l[0](t));
                                    delete loadingDetails[id];
                                }).catch(e => {
                                    reject(e);
                                    if(loadingDetails[id]) loadingDetails[id].listeners.forEach(l => l[1](e));
                                    delete loadingDetails[id];
                                });
                                return;
                            }
                            if(loadingDetails[id]) loadingDetails[id].listeners.forEach(l => l[1](data.errors[0].message));
                            delete loadingDetails[id];
                            return reject(data.errors[0].message);
                        }

                        sendRequestToEventListeners('TweetDetail', data);

                        let ic = data.data.threaded_conversation_with_injections_v2.instructions.find(i => i.type === "TimelineAddEntries").entries.find(e => e.entryId === `tweet-${id}`).content.itemContent;
                        let res = ic.tweet_results.result;
                        let tweet = parseTweet(res);
                        if(tweet) {
                            tweet.hasModeratedReplies = ic.hasModeratedReplies;
                        }
                        debugLog('tweet.getV2', 'end', id, tweet);
                        resolve(tweet);
                        if(loadingDetails[id]) loadingDetails[id].listeners.forEach(l => l[0](tweet));
                        delete loadingDetails[id];
        
                        chrome.storage.local.get(['tweetDetails'], d => {
                            if(!d.tweetDetails) d.tweetDetails = {};
                            d.tweetDetails[id] = {
                                date: Date.now(),
                                data: tweet
                            };
                            chrome.storage.local.set({tweetDetails: d.tweetDetails}, () => {});
                        });
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
        vote: (api, tweet_id, card_uri, card_name, selected_choice) => {
            return new Promise((resolve, reject) => {
                fetch(`https://caps.${location.hostname}/v2/capi/${api.split('//')[1]}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `twitter%3Astring%3Acard_uri=${encodeURIComponent(card_uri)}&twitter%3Along%3Aoriginal_tweet_id=${tweet_id}&twitter%3Astring%3Aresponse_card_name=${card_name}&twitter%3Astring%3Acards_platform=Web-12&twitter%3Astring%3Aselected_choice=${selected_choice}`
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
        },
        createCard: card_data => {
            return new Promise((resolve, reject) => {
                fetch(`https://caps.${location.hostname}/v2/cards/create.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `card_data=${encodeURIComponent(JSON.stringify(card_data))}`
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
        },
        getReplies: (id, cursor) => { // deprecated
            return new Promise((resolve, reject) => {
                if(cursor) {
                    cursor = cursor.replace(/\+/g, '%2B');
                }
                chrome.storage.local.get(['tweetReplies'], async d => {
                    if(!d.tweetReplies) d.tweetReplies = {};
                    if(!cursor) {
                        if(d.tweetReplies[id] && Date.now() - d.tweetReplies[id].date < 60000) {
                            return resolve(d.tweetReplies[id].data);
                        }
                        if(loadingReplies[id]) {
                            return loadingReplies[id].listeners.push([resolve, reject]);
                        } else {
                            loadingReplies[id] = {
                                listeners: []
                            };
                        }
                    }
                    fetch(`https://api.${location.hostname}/2/timeline/conversation/${id}.json?${cursor ? `cursor=${cursor}`: ''}&count=30&include_reply_count=true&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified%2CnoteTweet`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "content-type": "application/x-www-form-urlencoded",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                        },
                        credentials: "include"
                    }).then(i => i.text()).then(data => {
                        try {
                            data = JSON.parse(data);
                        } catch(e) {
                            if(String(e).includes("SyntaxError")) {
                                return reject(data);
                            } else {
                                return reject(e);
                            }
                        }
                        if (data.errors && data.errors[0].code === 32) {
                            if(!cursor) {
                                loadingReplies[id].listeners.forEach(l => l[1]('Not logged in'));
                                delete loadingReplies[id];
                            }
                            return reject("Not logged in");
                        }
                        if (data.errors && data.errors[0]) {
                            if(!cursor) {
                                loadingReplies[id].listeners.forEach(l => l[1](data.errors[0].message));
                                delete loadingReplies[id];
                            }
                            return reject(data.errors[0].message);
                        }
                        let tweetData = data.globalObjects.tweets;
                        let userData = data.globalObjects.users;
                        let ae = data.timeline.instructions.find(i => i.addEntries);
                        if(!ae) {
                            let out = {
                                list: [],
                                cursor: null,
                                users: userData
                            };
                            if(!cursor) {
                                loadingReplies[id].listeners.forEach(l => l[0](out));
                                delete loadingReplies[id];
                            }
                            return resolve(out);
                        }
                        let entries = ae.addEntries.entries;

                        let newCursor;
                        try {
                            newCursor = entries.find(e => e.entryId.startsWith('cursor-bottom-')).content.operation.cursor.value;
                        } catch(e) {}

                        let list = [];
                        for (let i = 0; i < entries.length; i++) {
                            let e = entries[i];
                            if (e.entryId.startsWith('tweet-')) {
                                let tweet = tweetData[e.content.item.content.tweet.id];
                                if(!tweet) continue;
                                let user = userData[tweet.user_id_str];
                                tweet.id_str = e.content.item.content.tweet.id;
                                tweet.user = user;
                                if(tweet.quoted_status_id_str) {
                                    tweet.quoted_status = tweetData[tweet.quoted_status_id_str];
                                    if(tweet.quoted_status) {
                                        tweet.quoted_status.user = userData[tweet.quoted_status.user_id_str];
                                        tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                                        tweet.quoted_status.id_str = tweet.quoted_status_id_str;
                                    }
                                }
                                list.push({
                                    type: tweet.id_str === id ? 'mainTweet' : 'tweet',
                                    data: tweet
                                });
                            } else if (e.entryId.startsWith('tombstone-')) {
                                if(e.content.item.content.tombstone.tweet) {
                                    let tweet = tweetData[e.content.item.content.tombstone.tweet.id];
                                    let user = userData[tweet.user_id_str];
                                    tweet.id_str = e.content.item.content.tombstone.tweet.id;
                                    tweet.user = user;
                                    if(tweet.quoted_status_id_str) {
                                        tweet.quoted_status = tweetData[tweet.quoted_status_id_str];
                                        if(tweet.quoted_status) {
                                            tweet.quoted_status.user = userData[tweet.quoted_status.user_id_str];
                                            tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                                            tweet.quoted_status.id_str = tweet.quoted_status_id_str;
                                        }
                                    }
                                    tweet.tombstone = e.content.item.content.tombstone.tombstoneInfo.text;
                                    list.push({
                                        type: tweet.id_str === id ? 'mainTweet' : 'tweet',
                                        data: tweet
                                    });
                                } else {
                                    list.push({
                                        type: 'tombstone',
                                        data: e.content.item.content.tombstone.tombstoneInfo.text
                                    });
                                }
                            } else if(e.entryId.startsWith('conversationThread-')) {
                                let thread = e.content.item.content.conversationThread.conversationComponents.filter(c => c.conversationTweetComponent);
                                let threadList = [];
                                for (let j = 0; j < thread.length; j++) {
                                    let t = thread[j];
                                    let tweet = tweetData[t.conversationTweetComponent.tweet.id];
                                    if(!tweet) continue;
                                    let user = userData[tweet.user_id_str];
                                    tweet.id_str = t.conversationTweetComponent.tweet.id;
                                    if(tweet.quoted_status_id_str) {
                                        tweet.quoted_status = tweetData[tweet.quoted_status_id_str];
                                        if(tweet.quoted_status) {
                                            tweet.quoted_status.user = userData[tweet.quoted_status.user_id_str];
                                            tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                                            tweet.quoted_status.id_str = tweet.quoted_status_id_str;
                                        }
                                    }
                                    tweet.user = user;
                                    threadList.push(tweet);
                                }
                                if(threadList.length === 1) {
                                    list.push({
                                        type: threadList[0].id_str === id ? 'mainTweet' : 'tweet',
                                        data: threadList[0]
                                    });
                                } else {
                                    list.push({
                                        type: 'conversation',
                                        data: threadList
                                    });
                                }
                            } else if(e.entryId.startsWith('cursor-showmorethreadsprompt')) {
                                if(newCursor === e.content.itemContent.value) {
                                    continue;
                                }
                                list.push({
                                    type: 'showMore',
                                    data: {
                                        cursor: e.content.itemContent.value,
                                        labelText: e.content.itemContent.displayTreatment.labelText,
                                        actionText: e.content.itemContent.displayTreatment.actionText
                                    }
                                });
                            }
                        }
                        resolve({
                            list,
                            cursor: newCursor,
                            users: userData
                        });
                        if(!cursor) {
                            loadingReplies[id].listeners.forEach(l => l[0]({
                                list,
                                cursor: newCursor,
                                users: userData
                            }));
                            delete loadingReplies[id];
                            chrome.storage.local.get(['tweetReplies'], d => {
                                if(!d.tweetReplies) d.tweetReplies = {};
                                d.tweetReplies[id] = {
                                    date: Date.now(),
                                    data: {
                                        list,
                                        cursor: newCursor,
                                        users: userData
                                    }
                                };
                                chrome.storage.local.set({tweetReplies: d.tweetReplies}, () => {});
                            });
                        }
                    }).catch(e => {
                        if(!cursor) {
                            loadingReplies[id].listeners.forEach(l => l[1](e));
                            delete loadingReplies[id];
                        }
                        reject(e);
                    });
                });
            });
        },
        getRepliesV2: (id, cursor, useDiffKey) => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['tweetReplies'], d => {
                    if(!d.tweetReplies) d.tweetReplies = {};
                    if(!cursor) {
                        if(d.tweetReplies[id] && Date.now() - d.tweetReplies[id].date < 60000) {
                            debugLog('tweet.getRepliesV2', 'cache', d.tweetReplies[id].data);
                            return resolve(d.tweetReplies[id].data);
                        }
                        if(loadingReplies[id]) {
                            if(!useDiffKey) return loadingReplies[id].listeners.push([resolve, reject]);
                        } else {
                            loadingReplies[id] = {
                                listeners: []
                            };
                        }
                    }
                    if(typeof useDiffKey === 'undefined' && isFinite(+localStorage.hitRateLimit) && +localStorage.hitRateLimit > Date.now()) {
                        useDiffKey = true;
                    }
                    fetch(`/i/api/graphql/KwGBbJZc6DBx8EKmyQSP7g/TweetDetail?variables=${encodeURIComponent(JSON.stringify({
                        "focalTweetId":id,
                        "with_rux_injections":false,
                        "includePromotedContent":false,
                        "withCommunity":true,
                        "withQuickPromoteEligibilityTweetFields":true,
                        "withBirdwatchNotes":true,
                        "withVoice":true,
                        "withV2Timeline":true,
                        "cursor":cursor
                    }))}&features=${encodeURIComponent(JSON.stringify({"rweb_lists_timeline_redesign_enabled":false,"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":false,"responsive_web_enhance_cards_enabled":false}))}`, {
                        headers: {
                            "authorization": useDiffKey ? OLDTWITTER_CONFIG.oauth_key : OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                        },
                        credentials: "include"
                    }).then(i => i.json()).then(data => {
                        debugLog('tweet.getRepliesV2', 'start', {cursor, data});
                        if (data.errors && data.errors[0]) {
                            if(data.errors[0].code === 88 && !useDiffKey) {
                                localStorage.hitRateLimit = Date.now() + 600000;
                                API.tweet.getRepliesV2(id, cursor, true).then(t => {
                                    resolve(t);
                                    if(loadingReplies[id]) loadingReplies[id].listeners.forEach(l => l[0](t));
                                    delete loadingReplies[id];
                                }).catch(e => {
                                    reject(e);
                                    if(loadingReplies[id]) loadingReplies[id].listeners.forEach(l => l[1](e));
                                    delete loadingReplies[id];
                                });
                                return;
                            }
                            if(loadingReplies[id]) loadingReplies[id].listeners.forEach(l => l[1](data.errors[0].message));
                            delete loadingReplies[id];
                            return reject(data.errors[0].message);
                        }
                        let ae = data.data.threaded_conversation_with_injections_v2.instructions.find(i => i.entries);
                        if(!ae) {
                            let out = {
                                list: [],
                                cursor: null,
                                users: {}
                            };
                            if(!cursor) {
                                if(loadingReplies[id]) loadingReplies[id].listeners.forEach(l => l[0](out));
                                delete loadingReplies[id];
                            }
                            debugLog('tweet.getRepliesV2', 'end', {cursor, out, data});
                            return resolve(out);
                        }
                        let entries = ae.entries;

                        sendRequestToEventListeners('TweetDetail', data);

                        let list = [];
                        let users = {};

                        let newCursor;
                        try {
                            newCursor = entries.find(e => e.entryId.startsWith('cursor-bottom-')).content.itemContent.value;
                        } catch(e) {};

                        for (let i = 0; i < entries.length; i++) {
                            let e = entries[i];
                            if (e.entryId.startsWith('tweet-')) {
                                if(e.content && e.content.itemContent && e.content.itemContent.promotedMetadata) continue;
                                let tweetData = e.content.itemContent.tweet_results.result;
                                if(!tweetData) continue;
                                if(tweetData.tombstone) {
                                    let text = tweetData.tombstone.text.text;
                                    if(tweetData.tombstone.text.entities && tweetData.tombstone.text.entities.length > 0) {
                                        let en = tweetData.tombstone.text.entities[0];
                                        text = text.slice(0, en.fromIndex) + `<a href="${en.ref.url}" target="_blank">` + text.slice(en.fromIndex, en.toIndex) + "</a>" + text.slice(en.toIndex);
                                    }
                                    let tombstoneTweetId = e.entryId.slice(6);
                                    let replyTweet = entries.find(i => 
                                        i && i.content && i.content.itemContent &&
                                        i.content.itemContent.tweet_results && 
                                        i.content.itemContent.tweet_results.result && 
                                        i.content.itemContent.tweet_results.result.legacy &&
                                        i.content.itemContent.tweet_results.result.legacy.in_reply_to_status_id_str == tombstoneTweetId
                                    );
                                    list.push({
                                        type: 'tombstone',
                                        data: text,
                                        replyTweet
                                    });
                                    continue;
                                }
                                let tweet = parseTweet(tweetData);
        
                                if(tweet) {
                                    if(!tweet.id_str === id && (tweet.user.blocking || tweet.user.muting)) continue;
                                    tweet.hasModeratedReplies = e.content.itemContent.hasModeratedReplies;
                                    list.push({
                                        type: tweet.id_str === id ? 'mainTweet' : 'tweet',
                                        data: tweet
                                    });
                                }
                            } else if (e.entryId.startsWith('tombstone-')) {
                                if(e.content.item && e.content.item.content.tombstone.tweet) {
                                    let tweet = tweetData[e.content.item.content.tombstone.tweet.id];
                                    let user = userData[tweet.user_id_str];
                                    if(user.blocking || user.muting) continue;
                                    tweet.id_str = e.content.item.content.tombstone.tweet.id;
                                    tweet.user = user;
                                    if(tweet.quoted_status_id_str) {
                                        tweet.quoted_status = tweetData[tweet.quoted_status_id_str];
                                        if(tweet.quoted_status) {
                                            tweet.quoted_status.user = userData[tweet.quoted_status.user_id_str];
                                            tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                                            tweet.quoted_status.id_str = tweet.quoted_status_id_str;
                                        }
                                    }
                                    tweet.tombstone = e.content.item.content.tombstone.tombstoneInfo.text;
                                    list.push({
                                        type: tweet.id_str === id ? 'mainTweet' : 'tweet',
                                        data: tweet
                                    });
                                } else if(e.content.itemContent && e.content.itemContent.tombstoneInfo) {
                                    let richText = e.content.itemContent.tombstoneInfo.richText;
                                    let text = richText.text;
                                    if(richText.entities && richText.entities.length > 0) {
                                        let en = richText.entities[0];
                                        text = text.slice(0, en.fromIndex) + `<a href="${en.ref.url}" target="_blank">` + text.slice(en.fromIndex, en.toIndex) + "</a>" + text.slice(en.toIndex);
                                    }
                                    list.push({
                                        type: 'tombstone',
                                        data: text
                                    });
                                } else {
                                    list.push({
                                        type: 'tombstone',
                                        data: 'This Tweet is unavailable.'
                                    });
                                }
                            } else if(e.entryId.startsWith('conversationthread-')) {
                                let thread = e.content.items;
                                let threadList = [];
                                for (let j = 0; j < thread.length; j++) {
                                    if(thread[j].entryId.includes("-tweetcomposer-")) {
                                        continue;
                                    }
                                    if(thread[j].entryId.includes("cursor-showmore")) {
                                        list.push({
                                            type: 'showMoreMiddle',
                                            data: {
                                                cursor: thread[j].item.itemContent.value,
                                                labelText: thread[j].item.itemContent.displayTreatment.labelText,
                                                actionText: thread[j].item.itemContent.displayTreatment.actionText
                                            }
                                        });
                                        continue;
                                    }
                                    let ic = thread[j].item.itemContent;
                                    if(ic.promotedMetadata) continue;
                                    if(ic.tombstoneInfo) {
                                        let richText = ic.tombstoneInfo.richText;
                                        let text = richText.text;
                                        if(richText.entities && richText.entities.length > 0) {
                                            let en = richText.entities[0];
                                            text = text.slice(0, en.fromIndex) + `<a href="${en.ref.url}" target="_blank">` + text.slice(en.fromIndex, en.toIndex) + "</a>" + text.slice(en.toIndex);
                                        }
                                        list.push({
                                            type: 'tombstone',
                                            data: text
                                        });
                                        continue;
                                    }
                                    let tweetData = ic.tweet_results.result;
                                    if(!tweetData) continue;
                                    if(tweetData.tombstone) {
                                        let text = tweetData.tombstone.text.text;
                                        if(tweetData.tombstone.text.entities && tweetData.tombstone.text.entities.length > 0) {
                                            let en = tweetData.tombstone.text.entities[0];
                                            text = text.slice(0, en.fromIndex) + `<a href="${en.ref.url}" target="_blank">` + text.slice(en.fromIndex, en.toIndex) + "</a>" + text.slice(en.toIndex);
                                        }
                                        list.push({
                                            type: 'tombstone',
                                            data: text
                                        });
                                        continue;
                                    }
                                    let tweet = parseTweet(tweetData);
                                    
                                    if(tweet) {
                                        if(tweet.id_str !== id && (tweet.user.blocking || tweet.user.muting)) continue;
                                        tweet.hasModeratedReplies = ic.hasModeratedReplies;
                                        threadList.push(tweet);
                                    }
                                }
                                if(threadList.length === 1) {
                                    list.push({
                                        type: threadList[0].id_str === id ? 'mainTweet' : 'tweet',
                                        data: threadList[0]
                                    });
                                } else {
                                    list.push({
                                        type: 'conversation',
                                        data: threadList
                                    });
                                }
                            } else if(e.entryId.startsWith('cursor-showmorethreadsprompt') || e.entryId.startsWith('cursor-showmorethreads-')) {
                                if(newCursor === e.content.itemContent.value) {
                                    continue;
                                }
                                list.push({
                                    type: 'showMore',
                                    data: {
                                        cursor: e.content.itemContent.value,
                                        labelText: e.content.itemContent.displayTreatment.labelText,
                                        actionText: e.content.itemContent.displayTreatment.actionText
                                    }
                                });
                            }
                        }
        
                        const out = {
                            list,
                            cursor: newCursor,
                            users
                        };
                        debugLog('tweet.getRepliesV2', 'end', out);
        
                        resolve(out);
        
                        if(!cursor) {
                            loadingReplies[id].listeners.forEach(l => l[0]({
                                list,
                                cursor: newCursor,
                                users
                            }));
                            delete loadingReplies[id];
                            chrome.storage.local.get(['tweetReplies'], d => {
                                if(!d.tweetReplies) d.tweetReplies = {};
                                d.tweetReplies[id] = {
                                    date: Date.now(),
                                    data: {
                                        list,
                                        cursor: newCursor,
                                        users
                                    }
                                };
                                chrome.storage.local.set({tweetReplies: d.tweetReplies}, () => {});
                            });
                        }
                    }).catch(e => {
                        if(loadingReplies[id]) loadingReplies[id].listeners.forEach(l => l[1](e));
                        delete loadingReplies[id];
                        reject(e);
                    });
                });
            });
        },
        getLikers: (id, cursor, count = 10) => {
            return new Promise((resolve, reject) => {
                let obj = {
                    "tweetId": id,
                    "count": count,
                    "includePromotedContent": false,
                    "withSuperFollowsUserFields": true,
                    "withDownvotePerspective": false,
                    "withReactionsMetadata": false,
                    "withReactionsPerspective": false,
                    "withSuperFollowsTweetFields": true,
                    "withClientEventToken": false,
                    "withBirdwatchNotes": false,
                    "withVoice": true,
                    "withV2Timeline": true
                };
                if(cursor) obj.cursor = cursor;
                chrome.storage.local.get(['tweetLikers'], d => {
                    if(!cursor) cursor = '';
                    if(!d.tweetLikers) d.tweetLikers = {};
                    if(!cursor) {
                        if(d.tweetLikers[id] && Date.now() - d.tweetLikers[id].date < 60000) {
                            debugLog('tweet.getLikers', 'cache', d.tweetLikers[id].data);
                            return resolve(d.tweetLikers[id].data);
                        }
                        if(loadingLikers[id]) {
                            return loadingLikers[id].listeners.push([resolve, reject]);
                        } else {
                            loadingLikers[id] = {
                                listeners: []
                            };
                        }
                    }
                    fetch(`/i/api/graphql/RMoTahkos95Jcdw-UWlZog/Favoriters?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
                        "dont_mention_me_view_api_enabled": true,
                        "interactive_text_enabled": true,
                        "responsive_web_uc_gql_enabled": false,
                        "vibe_tweet_context_enabled": false,
                        "responsive_web_edit_tweet_api_enabled": false,
                        "standardized_nudges_misinfo": false,
                        "responsive_web_enhance_cards_enabled": false
                    }))}`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "content-type": "application/json"
                        },
                        credentials: "include"
                    }).then(i => i.json()).then(data => {
                        debugLog('tweet.getLikers', 'start', { id, cursor, data });
                        if (data.errors && data.errors[0].code === 32) {
                            if(!cursor) {
                                loadingLikers[id].listeners.forEach(l => l[1]('Not logged in'));
                                delete loadingLikers[id];
                            }
                            return reject("Not logged in");
                        }
                        if (data.errors && data.errors[0]) {
                            if(!cursor) {
                                loadingLikers[id].listeners.forEach(l => l[1](data.errors[0].message));
                                delete loadingLikers[id];
                            }
                            return reject(data.errors[0].message);
                        }
                        let list = data.data.favoriters_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
                        if(!list) {
                            if(!cursor) {
                                loadingLikers[id].listeners.forEach(l => l[0]({ list: [], cursor: undefined }));
                                delete loadingLikers[id];
                            }
                            debugLog('tweet.getLikers', 'end', id, { list: [], cursor: undefined, data });
                            return resolve({ list: [], cursor: undefined });
                        }
                        list = list.entries;
                        let rdata = {
                            list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                                if(
                                    !e.content.itemContent.user_results.result ||
                                    e.content.itemContent.user_results.result.__typename === "UserUnavailable"
                                ) return;
                                let user = e.content.itemContent.user_results.result;
                                user.legacy.id_str = user.rest_id;
                                return user.legacy;
                            }).filter(u => u),
                            cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
                        };
                        debugLog('tweet.getLikers', 'end', id, rdata);
                        resolve(rdata);
                        if(!cursor) {
                            loadingLikers[id].listeners.forEach(l => l[0](rdata));
                            delete loadingLikers[id];
                            d.tweetLikers[id] = {
                                date: Date.now(),
                                data: rdata
                            };
                            chrome.storage.local.set({tweetLikers: d.tweetLikers}, () => {});
                        }
                    }).catch(e => {
                        if(!cursor) {
                            loadingLikers[id].listeners.forEach(l => l[1](e));
                            delete loadingLikers[id];
                        }
                        reject(e);
                    });
                });
            });
        },
        getRetweeters: (id, cursor) => {
            return new Promise((resolve, reject) => {
                let obj = {
                    "tweetId": id,
                    "count": 50,
                    "includePromotedContent": false,
                    "withSuperFollowsUserFields": true,
                    "withDownvotePerspective": false,
                    "withReactionsMetadata": false,
                    "withReactionsPerspective": false,
                    "withSuperFollowsTweetFields": true,
                    "withClientEventToken": false,
                    "withBirdwatchNotes": false,
                    "withVoice": true,
                    "withV2Timeline": true
                };
                if(cursor) obj.cursor = cursor;
                fetch(`/i/api/graphql/qVWT1Tn1FiklyVDqYiOhLg/Retweeters?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
                    "dont_mention_me_view_api_enabled": true,
                    "interactive_text_enabled": true,
                    "responsive_web_uc_gql_enabled": false,
                    "vibe_tweet_context_enabled": false,
                    "responsive_web_edit_tweet_api_enabled": false,
                    "standardized_nudges_misinfo": false,
                    "responsive_web_enhance_cards_enabled": false
                }))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('tweet.getRetweeters', 'start', { id, cursor, data });
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let list = data.data.retweeters_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
                    if(!list) return resolve({ list: [], cursor: undefined });
                    list = list.entries;
                    let out = {
                        list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                            if(
                                !e.content.itemContent.user_results.result ||
                                e.content.itemContent.user_results.result.__typename === "UserUnavailable"
                            ) return;
                            let user = e.content.itemContent.user_results.result;
                            user.legacy.id_str = user.rest_id;
                            return user.legacy;
                        }).filter(u => u),
                        cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
                    };
                    debugLog('tweet.getRetweeters', 'end', id, out);
                    resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getQuotes: (id, cursor) => {
            return new Promise((resolve, reject) => {
                let variables = {"rawQuery":`quoted_tweet_id:${id}`,"count":20,"querySource":"tdqt","product":"Top"};
                if(cursor) variables.cursor = cursor;
                fetch(`/i/api/graphql/flaR-PUMshxFWZWPNpq4zA/SearchTimeline?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"c9s_tweet_anatomy_moderator_badge_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"rweb_video_timestamps_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_enhance_cards_enabled":false}))}`, {
                    headers: {
                        "authorization": isFinite(+localStorage.hitRateLimit) && +localStorage.hitRateLimit > Date.now() ? OLDTWITTER_CONFIG.oauth_key : OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                }).then(i => i.json()).then(data => {
                    debugLog('tweet.getQuotes', 'start', { id, cursor, data });
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let entries = data.data.search_by_raw_query.search_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
                    if(!entries) return resolve({ list: [], cursor: undefined });
                    entries = entries.entries;

                    sendRequestToEventListeners('SearchTimeline', data);

                    let list = entries.filter(e => e.entryId.startsWith('tweet-')).map(e => {
                        let tweetData = e.content.itemContent.tweet_results.result;
                        if(!tweetData) return;
                        
                        return parseTweet(tweetData);
                    }).filter(t => t);
                    let newCursor = entries.find(e => e.entryId.startsWith('cursor-bottom-'));
                    if(!newCursor) {
                        let replacerEntry = data.data.search_by_raw_query.search_timeline.timeline.instructions.find(i => i.entry_id_to_replace && i.entry_id_to_replace.startsWith('cursor-bottom-'));
                        if(replacerEntry) {
                            newCursor = replacerEntry.entry.content.value;
                        }
                    } else {
                        newCursor = newCursor.content.value;
                    }
                    let out = {
                        list,
                        cursor: newCursor
                    };
                    debugLog('tweet.getQuotes', 'end', id, out);
                    resolve(out);
                    return resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        mute: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/mutes/conversations/create.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `tweet_id=${id}`
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
        },
        unmute: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/mutes/conversations/destroy.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `tweet_id=${id}`
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
        },
        lookup: ids => { // deprecated
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/statuses/lookup.json?id=${ids.join(',')}&include_entities=true&include_ext_alt_text=true&include_card_uri=true&tweet_mode=extended&include_reply_count=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
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
        },
        translate: id => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get([`translations`],async  d => {
                    if(!d.translations) d.translations = {};
                    if(d.translations[id] && Date.now() - d.translations[id].date < 60000*60*4) {
                        // debugLog('tweet.translate', 'cache', d.translations[id].data);
                        return resolve(d.translations[id].data);
                    }
                    // Translate by Google
                    let res = translateLimit > Date.now() ? { ok: false } : await fetch(`/i/api/1.1/strato/column/None/tweetId=${id},destinationLanguage=None,translationSource=Some(Google),feature=None,timeout=None,onlyCached=None/translation/service/translateTweet`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                        },
                        credentials: "include"
                    });
                    if(!res.ok) {
                        console.log(res);
                        if(res.headers) {
                            let resetTime = res.headers.get('x-rate-limit-reset');
                            let limitRemaining = res.headers.get('x-rate-limit-remaining');
                            if(resetTime && limitRemaining && parseInt(limitRemaining) === 0) {
                                translateLimit = parseInt(resetTime) * 1000;
                            } else {
                                translateLimit = 0;
                            }
                        }
                        // Translate by Microsoft
                        let l = LANGUAGE;
                        if(l.includes('_')) l = l.split('_')[0];
                        res = await fetch(`https://api.${location.hostname}/1.1/translations/show.json?id=${id}&dest=${l}&use_display_text=true&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
                            headers: {
                                "authorization": OLDTWITTER_CONFIG.public_token,
                                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                                "x-twitter-auth-type": "OAuth2Session",
                                "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                            },
                            credentials: "include"
                        });
                    }
                    let data = await res.json();
                    // debugLog('tweet.translate', 'start', id, data);
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let out = {
                        translated_lang: data.localizedSourceLanguage ? data.localizedSourceLanguage : data.translated_lang,
                        lang_code: data.sourceLanguage ? data.sourceLanguage : data.translated_lang,
                        text: data.translation ? data.translation : data.text,
                        entities: data.entities
                    };
                    // debugLog('tweet.translate', 'end', id, out);
                    resolve(out);
                    d.translations[id] = {
                        date: Date.now(),
                        data: out
                    };
                    chrome.storage.local.set({translations: d.translations}, () => {});
                });
            });
        },
        pin: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/account/pin_tweet.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `id=${id}`
                }).then(i => i.text()).then(data => {
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        unpin: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/account/unpin_tweet.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `id=${id}`
                }).then(i => i.text()).then(data => {
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        moderate: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/pjFnHGVqCjTcZol0xcBJjw/ModerateTweet`, {
                    method: 'POST',
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json; charset=utf-8"
                    },
                    credentials: "include",
                    body: JSON.stringify({"variables":{"tweetId":id},"queryId":"pjFnHGVqCjTcZol0xcBJjw"})
                }).then(i => i.json()).then(data => {
                    debugLog('tweet.moderate', id, data);
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        unmoderate: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/pVSyu6PA57TLvIE4nN2tsA/UnmoderateTweet`, {
                    method: 'POST',
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json; charset=utf-8"
                    },
                    credentials: "include",
                    body: JSON.stringify({"variables":{"tweetId":"1683331680751308802"},"queryId":"pVSyu6PA57TLvIE4nN2tsA"})
                }).then(i => i.json()).then(data => {
                    debugLog('tweet.unmoderate', id, data);
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getModeratedReplies: (id, cursor) => {
            return new Promise((resolve, reject) => {
                let variables = {"rootTweetId":id,"count":20,"includePromotedContent":false};
                if(cursor) variables.cursor = cursor;
                fetch(`/i/api/graphql/SiKS1_3937rb72ytFnDHmA/ModeratedTimeline?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify({"rweb_lists_timeline_redesign_enabled":false,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":false,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_media_download_video_enabled":false,"responsive_web_enhance_cards_enabled":false}))}`, {
                    method: 'POST',
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('tweet.getModeratedReplies', 'start', id, data);
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let entries = data.data.tweet.result.timeline_response.timeline.instructions.find(i => i.entries);
                    if(!entries) return resolve({
                        list: [],
                        cursor: undefined
                    });
                    entries = entries.entries;
                    let list = entries.filter(e => e.entryId.startsWith('tweet-'));
                    let cursor = entries.find(e => e.entryId.startsWith('cursor-bottom'));
                    if(!cursor) {
                        let entries = data.data.tweet.result.timeline_response.timeline.instructions.find(i => i.replaceEntry && i.replaceEntry.entryIdToReplace.includes('cursor-bottom'));
                        if(entries) {
                            cursor = entries.replaceEntry.entry.content.operation.cursor.value;
                        }
                    } else {
                        cursor = cursor.content.operation.cursor.value;
                    }
                    let out = {
                        list: list.map(e => {
                            let tweet = parseTweet(e.content.itemContent.tweet_results.result);
                            if(!tweet) return;
                            tweet.moderated = true;
                            return tweet;
                        }).filter(e => e),
                        cursor
                    };
                    debugLog('tweet.getModeratedReplies', 'end', id, out);
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        }
    },
    search: {
        typeahead: query => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/search/typeahead.json?q=${encodeURIComponent(query)}&include_can_dm=1&count=5&prefetch=false&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }

                    sendRequestToEventListeners('search/typeahead.json', data);

                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        adaptive: (obj, cursor) => { // deprecated
            return new Promise((resolve, reject) => {
                fetch(`/i/api/2/search/adaptive.json?${cursor ? `cursor=${cursor}&` : ''}${obj.tweet_search_mode ? `tweet_search_mode=${obj.tweet_search_mode}&` : ''}include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&q=${obj.q}${obj.social_filter ? `&social_filter=${obj.social_filter}`:''}${obj.result_filter ? `&result_filter=${obj.result_filter}`:''}&count=50&query_source=typed_query&pc=1&spelling_corrections=1&include_ext_edit_control=false&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let tweets = data.globalObjects.tweets;
                    let users = data.globalObjects.users;
                    let entries = data.timeline.instructions.find(i => i.addEntries);
                    if(!entries) return resolve({
                        list: [],
                        cursor: undefined
                    });
                    entries = entries.addEntries.entries;

                    sendRequestToEventListeners('search/adaptive.json', data);

                    let list = entries.filter(e => e.entryId.startsWith('sq-I-t-') || e.entryId.startsWith('user-') || e.entryId.startsWith('tweet-'));
                    let cursor = entries.find(e => e.entryId.startsWith('sq-cursor-bottom') || e.entryId.startsWith('cursor-bottom'));
                    if(!cursor) {
                        let entries = data.timeline.instructions.find(i => i.replaceEntry && (i.replaceEntry.entryIdToReplace.includes('sq-cursor-bottom') || i.replaceEntry.entryIdToReplace.includes('cursor-bottom')));
                        if(entries) {
                            cursor = entries.replaceEntry.entry.content.operation.cursor.value;
                        }
                    } else {
                        cursor = cursor.content.operation.cursor.value;
                    }
                    return resolve({
                        list: list.map(e => {
                            if(e.entryId.startsWith('sq-I-t-') || e.entryId.startsWith('tweet-')) {
                                let tweet = tweets[e.content.item.content.tweet.id];
                                let user = users[tweet.user_id_str];
                                user.id_str = tweet.user_id_str;
                                if(
                                    tweet && tweet.source && 
                                    (tweet.source.includes('Twitter for Advertisers') || tweet.source.includes('advertiser-interface'))
                                ) return;
                                if(tweet.quoted_status_id_str) {
                                    tweet.quoted_status = tweets[tweet.quoted_status_id_str];
                                    if(tweet.quoted_status) {
                                        tweet.quoted_status.user = users[tweet.quoted_status.user_id_str];
                                        tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                                    }
                                }
                                if(tweet.retweeted_status_id_str) {
                                    tweet.retweeted_status = tweets[tweet.retweeted_status_id_str];
                                    tweet.retweeted_status.user = users[tweet.retweeted_status.user_id_str];
                                    tweet.retweeted_status.user.id_str = tweet.retweeted_status.user_id_str;
                                    tweet.retweeted_status.id_str = tweet.retweeted_status_id_str;
                                }
                                tweet.user = user;
                                tweet.type = 'tweet';
                                return tweet;
                            } else if(e.entryId.startsWith('user-')) {
                                let user = users[e.content.item.content.user.id];
                                user.id_str = e.content.item.content.user.id;
                                user.type = 'user';
                                return user;
                            } else {
                                return e;
                            }
                        }).filter(e => e),
                        cursor
                    });
                }).catch(e => {
                    reject(e);
                });
            });
        },
        adaptiveV2: (obj, cursor) => {
            return new Promise((resolve, reject) => {
                if(cursor) obj.cursor = cursor;
                fetch(`/i/api/graphql/TQmyZ_haUqANuyBcFBLkUw/SearchTimeline?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"rweb_tipjar_consumption_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"communities_web_enable_tweet_community_results_fetch":true,"c9s_tweet_anatomy_moderator_badge_enabled":true,"articles_preview_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"creator_subscriptions_quote_tweet_preview_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"rweb_video_timestamps_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_enhance_cards_enabled":false}))}`, {
                    headers: {
                        "authorization": isFinite(+localStorage.hitRateLimit) && +localStorage.hitRateLimit > Date.now() ? OLDTWITTER_CONFIG.oauth_key : OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('search.adaptiveV2', 'start', { obj, data });
                    if (data.errors && data.errors[0]) {
                        if(data.errors[0].code === 88) {
                            localStorage.hitRateLimit = Date.now() + 1000 * 60 * 10;
                            return API.search.adaptiveV2(obj, cursor).then(resolve).catch(reject);
                        }
                        return reject(data.errors[0].message);
                    }
        
                    let instructions = data.data.search_by_raw_query.search_timeline.timeline.instructions;
                    let entries = instructions.find(i => i.entries);
                    if(!entries) {
                        return resolve({
                            list: [],
                            cursorBottom: undefined,
                            cursorTop: undefined
                        });
                    }
                    entries = entries.entries;

                    sendRequestToEventListeners('SearchTimeline', data);

                    let res = [];
                    for(let entry of entries) {
                        if(entry.entryId.startsWith('sq-I-t-') || entry.entryId.startsWith('tweet-')) {
                            let result = entry.content.itemContent.tweet_results.result;
        
                            if(entry.content.itemContent.promotedMetadata) {
                                continue;
                            }
                            let tweet = parseTweet(result);
                            if(!tweet) {
                                continue;
                            }
                            tweet.type = 'tweet';
                            res.push(tweet);
                        } else if(entry.entryId.startsWith('sq-I-u-') || entry.entryId.startsWith("user-")) {
                            let result = entry.content.itemContent.user_results.result;
                            if(!result || !result.legacy) {
                                console.log("Bug: no user", entry);
                                continue;
                            }
                            let user = result.legacy;
                            user.id_str = result.rest_id;
                            user.type = 'user';
                            user.socialContext = entry.content.itemContent.socialContext;
                            res.push(user);
                        }
                    }
                    let cursorBottom = entries.find(e => e.entryId.startsWith('sq-cursor-bottom-') || e.entryId.startsWith('cursor-bottom-'));
                    if(cursorBottom) {
                        cursorBottom = cursorBottom.content.value;
                    } else {
                        cursorBottom = instructions.find(e => e.entry_id_to_replace && (e.entry_id_to_replace.startsWith('sq-cursor-bottom-') || e.entry_id_to_replace.startsWith('cursor-bottom-')));
                        if(cursorBottom) {
                            cursorBottom = cursorBottom.entry.content.value;
                        } else {
                            cursorBottom = null;
                        }
                    }
                    let cursorTop = entries.find(e => e.entryId.startsWith('sq-cursor-top-') || e.entryId.startsWith('cursor-top-'));
                    if(cursorTop) {
                        cursorTop = cursorTop.content.value;
                    } else {
                        cursorTop = instructions.find(e => e.entry_id_to_replace && (e.entry_id_to_replace.startsWith('sq-cursor-top-') || e.entry_id_to_replace.startsWith('cursor-top-')));
                        if(cursorTop) {
                            cursorTop = cursorTop.entry.content.value;
                        } else {
                            cursorTop = null;
                        }
                    }
        
                    debugLog('search.adaptiveV2', 'end', { obj, cursor, res, cursorBottom, cursorTop });
                    resolve({list: res, cursorBottom, cursorTop});
                });
            });
        },
        getSaved: (cache = true) => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['savedSearches'], d => {
                    if(cache && d.savedSearches && Date.now() - d.savedSearches.date < 60000) {
                        return resolve(d.savedSearches.data);
                    }
                    fetch(`/i/api/1.1/saved_searches/list.json`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
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
                        chrome.storage.local.set({savedSearches: {
                            date: Date.now(),
                            data
                        }}, () => {});
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
        deleteSaved: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/saved_searches/destroy/${id}.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: "post",
                    body: "id=" + id
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
        },
        save: q => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/saved_searches/create.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    credentials: "include",
                    method: "post",
                    body: "q=" + encodeURIComponent(q)
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
        },
        trustedFriendsTypeahead: (circle_id, query) => {
            return new Promise((resolve, reject) => {
                let variables = {"trustedFriendsId": circle_id, "prefix": query};
                fetch(`/i/api/graphql/4lk-D0Y8kfimSyPJjEocsA/TrustedFriendsTypeahead?variables=${encodeURIComponent(JSON.stringify(variables))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data.data.trusted_friends_list_by_rest_id.recommended_members_typeahead_results.map(i => i.result));
                }).catch(e => {
                    reject(e);
                });
            });
        }
    },
    inbox: {
        get: max_id => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['inboxData'], d => {
                    if(!max_id && d.inboxData && Date.now() - d.inboxData.date < 18000) {
                        return resolve(d.inboxData.data);
                    }
                    fetch(`https://api.${location.hostname}/1.1/dm/user_inbox.json?max_conv_count=20&include_groups=true${max_id ? `&max_id=${max_id}` : ''}&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                        },
                        credentials: "include"
                    }).then(i => i.json()).then(data => {
                        if (data.errors && data.errors[0]) {
                            return reject(data.errors[0].message);
                        }
                        resolve(data.user_inbox);
                        if(!max_id) chrome.storage.local.set({inboxData: {
                            date: Date.now(),
                            data: data.user_inbox
                        }}, () => {});
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
        markRead: eventId => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/dm/conversation/mark_read.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `last_read_event_id=${eventId}`
                }).then(i => i.text()).then(data => {
                    resolve(1);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getConversation: (id, max_id) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/dm/conversation/${id}.json?${max_id ? `max_id=${max_id}&` : ''}count=50&context=FETCH_DM_CONVERSATION_HISTORY&include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&include_ext_is_blue_verified=1&include_ext_verified_type=1&include_ext_profile_image_shape=1&skip_status=1&dm_secret_conversations_enabled=false&krs_registration_enabled=true&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_ext_limited_action_results=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_views=true&dm_users=false&include_groups=true&include_inbox_timelines=true&include_ext_media_color=true&supports_reactions=true&include_conversation_info=true&ext=mediaColor%2CaltText%2CmediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2CbirdwatchPivot%2CsuperFollowMetadata%2CunmentionInfo%2CeditControl`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data.conversation_timeline);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        send: obj => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/dm/new.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    credentials: "include",
                    method: 'post',
                    body: new URLSearchParams(obj).toString()
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getUpdates: cursor => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['userUpdates'], d => {
                    if(!cursor) cursor = '';
                    if(!d.userUpdates) d.userUpdates = {};
                    if(d.userUpdates[cursor] && Date.now() - d.userUpdates[cursor].date < 4000) {
                        return resolve(d.userUpdates[cursor].data);
                    }
                    fetch(`/i/api/1.1/dm/user_updates.json?${cursor ? `cursor=${cursor}&` : ''}cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&dm_users=false&include_groups=true&include_inbox_timelines=true&include_ext_media_color=true&supports_reactions=true&nsfw_filtering_enabled=false&cursor=GRwmiICwidfJnf8qFozAuPGoksj_KiUkAAA&filter_low_quality=false&include_quality=all&include_ext_edit_control=false&ext=mediaColor%2CaltText%2CmediaStats%2CverifiedType%2CisBlueVerified%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                        },
                        credentials: "include",
                    }).then(i => i.json()).then(data => {
                        if (data.errors && data.errors[0]) {
                            return reject(data.errors[0].message);
                        }
                        resolve(data);
                        d.userUpdates[cursor] = {
                            date: Date.now(),
                            data: data
                        };
                        chrome.storage.local.set({userUpdates: d.userUpdates}, () => {});
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
        deleteMessage: id => {
            return new Promise((resolve, reject) => {
                fetch(`https://api.${location.hostname}/1.1/dm/destroy.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `dm_id=${id}`
                }).then(i => i.text()).then(data => {
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        deleteConversation: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/1.1/dm/conversation/${id}/delete.json`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    credentials: "include",
                    method: 'post',
                }).then(i => i.text()).then(data => {
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        }
    },
    bookmarks: {
        get: (cursor) => {
            return new Promise((resolve, reject) => {
                let obj = {"count":50,"includePromotedContent":false};
                if(cursor) obj.cursor = cursor;
                fetch(`/i/api/graphql/3OjEFzT2VjX-X7w4KYBJRg/Bookmarks?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"graphql_timeline_v2_bookmark_timeline":true,"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"responsive_web_enhance_cards_enabled":false}))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('bookmarks.get', 'start', {cursor, data});
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let list = data.data.bookmark_timeline_v2.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
                    if(!list) return resolve({ list: [], cursor: undefined });
                    list = list.entries;
                    let out = {
                        list: list.filter(e => e.entryId.startsWith('tweet-')).map(e => {
                            let res = e.content.itemContent.tweet_results.result;
                            return parseTweet(res);
                        }).filter(i => !!i),
                        cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
                    };
                    debugLog('bookmarks.get', 'end', out);
                    resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        deleteAll: () => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/skiACZKC1GDYli-M8RzEPQ/BookmarksAllDelete`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    credentials: "include",
                    method: 'post',
                    body: `{"variables":{},"queryId":"skiACZKC1GDYli-M8RzEPQ"}`
                }).then(i => i.text()).then(() => {
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        create: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/aoDbu3RHznuiSkQ9aNM67Q/CreateBookmark`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                    method: 'post',
                    body: JSON.stringify({"variables":{"tweet_id":id},"queryId":"aoDbu3RHznuiSkQ9aNM67Q"})
                }).then(i => i.text()).then(() => {
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        delete: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/Wlmlj2-xzyS1GN3a6cj-mQ/DeleteBookmark`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    credentials: "include",
                    method: 'post',
                    body: JSON.stringify({"variables":{"tweet_id":id},"queryId":"Wlmlj2-xzyS1GN3a6cj-mQ"})
                }).then(i => i.text()).then(() => {
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        }
    },
    list: {
        getTweets: (id, cursor) => {
            return new Promise((resolve, reject) => {
                let obj = {"listId":id,"count":40};
                if(cursor) obj.cursor = cursor;
                fetch(`/i/api/graphql/2Vjeyo_L0nizAUhHe3fKyA/ListLatestTweetsTimeline?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"rweb_lists_timeline_redesign_enabled":false,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":false,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_media_download_video_enabled":false,"responsive_web_enhance_cards_enabled":false}))}`, {
                    headers: {
                        "authorization": isFinite(+localStorage.hitRateLimit) && +localStorage.hitRateLimit > Date.now() ? OLDTWITTER_CONFIG.oauth_key : OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('list.getTweets', 'start', id, cursor, data);
                    if (data.errors && data.errors[0]) {
                        if(data.errors[0].code === 88) {
                            localStorage.hitRateLimit = Date.now() + 1000 * 60 * 10;
                            return API.list.getTweets(id, cursor).then(resolve).catch(reject);
                        }
                        return reject(data.errors[0].message);
                    }
                    let list = data.data.list.tweets_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
                    if(!list) return resolve({ list: [], cursor: undefined });
                    list = list.entries;
                    let tweets = [];
                    for(let e of list) {
                        if(e.entryId.startsWith('tweet-')) {
                            let res = e.content.itemContent.tweet_results.result;
                            let tweet = parseTweet(res);
                            if(tweet) {
                                if(tweet.user.blocking || tweet.user.muting) continue;
                                tweet.hasModeratedReplies = e.content.itemContent.hasModeratedReplies;
                                tweets.push(tweet);
                            }
                        } else if(e.entryId.startsWith('list-conversation-')) {
                            let lt = e.content.items;
                            for(let i = 0; i < lt.length; i++) {
                                let t = lt[i];
                                if(t.entryId.includes('-tweet-')) {
                                    let res = t.item.itemContent.tweet_results.result;
                                    let tweet = parseTweet(res);
                                    if(!tweet) continue;
                                    if(i !== lt.length - 1) {
                                        tweet.threadContinuation = true;
                                    }
                                    if(i !== 0) {
                                        tweet.noTop = true;
                                    }
                                    if(tweet.user.blocking || tweet.user.muting) continue;
                                    tweet.hasModeratedReplies = t.item.itemContent.hasModeratedReplies;
                                    tweets.push(tweet);
                                }
                            }
                        }
                    }

                    let cb = list.find(e => e.entryId.startsWith('cursor-bottom-'));
                    let ct = list.find(e => e.entryId.startsWith('cursor-top-'));

                    let out = {
                        list: tweets,
                        cursorBottom: cb ? cb.content.value : undefined,
                        cursorTop: ct ? ct.content.value : undefined
                    };
                    debugLog('list.getTweets', 'end', id, cursor, out);
                    resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getMembers: (id, cursor) => {
            return new Promise((resolve, reject) => {
                let obj = {"listId":id,"count":20,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true,"withSafetyModeUserFields":true};
                if(cursor) obj.cursor = cursor;
                fetch(`/i/api/graphql/sXFXEmtFr3nLyG1dmS81jw/ListMembers?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('list.getMembers', 'start', {id, cursor, data})
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let list = data.data.list.members_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
                    if(!list) return resolve({ list: [], cursor: undefined });
                    list = list.entries;
                    let out = {
                        list: list.filter(e => e.entryId.startsWith('user-')).map(u => {
                            let res = u.content.itemContent.user_results.result;
                            res.legacy.id_str = res.rest_id;
                            return res.legacy;
                        }),
                        cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
                    };
                    debugLog('list.getMembers', 'end', id, out);
                    resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getFollowers: (id, cursor) => {
            return new Promise((resolve, reject) => {
                let obj = {"listId":id,"count":20,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true,"withSafetyModeUserFields":true};
                if(cursor) obj.cursor = cursor;
                fetch(`/i/api/graphql/LxXoouvfd5E8PXsdrQ0iMg/ListSubscribers?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    debugLog('list.getFollowers', 'start', {id, cursor, data})
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    let list = data.data.list.subscribers_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
                    if(!list) return resolve({ list: [], cursor: undefined });
                    list = list.entries;
                    let out = {
                        list: list.filter(e => e.entryId.startsWith('user-')).map(u => {
                            let res = u.content.itemContent.user_results.result;
                            res.legacy.id_str = res.rest_id;
                            return res.legacy;
                        }),
                        cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
                    };
                    debugLog('list.getFollowers', 'end', id, out);
                    resolve(out);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        get: id => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['listData'], d => {
                    if(!d.listData) d.listData = {};
                    if(d.listData[id] && Date.now() - d.listData[id].date < 60000) {
                        debugLog('list.get', 'cache', id, d.listData[id].data);
                        return resolve(d.listData[id].data);
                    }
                    fetch(`/i/api/graphql/vxx-Y8zadpAP64HHiw4hMQ/ListByRestId?variables=${encodeURIComponent(JSON.stringify({"listId":id,"withSuperFollowsUserFields":true}))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false}))}`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                            "content-type": "application/json",
                            "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                        },
                        credentials: "include"
                    }).then(i => i.json()).then(data => {
                        debugLog('list.get', id, data);
                        if (data.errors && data.errors[0].code === 32) {
                            return reject("Not logged in");
                        }
                        if (data.errors && data.errors[0]) {
                            return reject(data.errors[0].message);
                        }
                        resolve(data.data.list);
                        d.listData[id] = {
                            date: Date.now(),
                            data: data.data.list
                        };
                        chrome.storage.local.set({listData: d.listData}, () => {});
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
        subscribe: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/nymTz5ek0FQPC3kh63Tp1w/ListSubscribe`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({"variables":{"listId":id,"withSuperFollowsUserFields":true},"features":{"responsive_web_graphql_timeline_navigation_enabled":false},"queryId":"nymTz5ek0FQPC3kh63Tp1w"}),
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    chrome.storage.local.set({listData: {}}, () => {});
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        unsubscribe: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/Wi5-aG4bvTmdjyRyRGkyhA/ListUnsubscribe`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({"variables":{"listId":id,"withSuperFollowsUserFields":true},"features":{"responsive_web_graphql_timeline_navigation_enabled":false},"queryId":"Wi5-aG4bvTmdjyRyRGkyhA"}),
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    chrome.storage.local.set({listData: {}}, () => {});
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        update: (id, name, description, isPrivate) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/P9YDuvCt6ogRf-kyr5E5xw/UpdateList`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({
                        "variables": {
                            "listId": id,
                            "isPrivate": isPrivate,
                            "description": description,
                            "name": name,
                            "withSuperFollowsUserFields": true
                        },
                        "features": {
                            "responsive_web_graphql_timeline_navigation_enabled": false
                        },
                        "queryId": "P9YDuvCt6ogRf-kyr5E5xw"
                    }),
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    chrome.storage.local.set({listData: {}}, () => {});
                    chrome.storage.local.remove(['myLists'], () => {});
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        delete: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/UnN9Th1BDbeLjpgjGSpL3Q/DeleteList`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({"variables":{"listId":id},"queryId":"UnN9Th1BDbeLjpgjGSpL3Q"}),
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    chrome.storage.local.set({listData: {}}, () => {});
                    chrome.storage.local.remove(['myLists'], () => {});
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        addMember: (listId, userId) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/RKtQuzpcy2gym71UorWg6g/ListAddMember`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({"variables":{"listId":listId,"userId":userId,"withSuperFollowsUserFields":true},"features":{"responsive_web_graphql_timeline_navigation_enabled":false},"queryId":"RKtQuzpcy2gym71UorWg6g"}),
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    chrome.storage.local.set({listData: {}}, () => {});
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        removeMember: (listId, userId) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/mDlp1UvnnALC_EzybKAMtA/ListRemoveMember`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({"variables":{"listId":listId,"userId":userId,"withSuperFollowsUserFields":true},"features":{"responsive_web_graphql_timeline_navigation_enabled":false},"queryId":"mDlp1UvnnALC_EzybKAMtA"}),
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    chrome.storage.local.set({listData: {}}, () => {});
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getMyLists: () => {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(['myLists'], d => {
                    if(d.myLists && Date.now() - d.myLists.date < 60000 * 10) {
                        return resolve(d.myLists.data);
                    }
                    fetch(`/i/api/graphql/cl2dF-zeGiLvZDsMGZhL4g/ListsManagementPageTimeline?variables=${encodeURIComponent(JSON.stringify({"count":100,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true}))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
                        headers: {
                            "authorization": OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
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
                        chrome.storage.local.set({listData: {}}, () => {});
                        let out = data.data.viewer.list_management_timeline
                            .timeline.instructions.find(i => i.entries)
                            .entries.find(i => i.entryId.startsWith('owned-subscribed-list-module'))
                            .content.items.map(i => i.item.itemContent.list)
                            .filter(i => i);
                        resolve(out);
                        chrome.storage.local.set({myLists: {date: Date.now(), data: out}}, () => {});
                    }).catch(e => {
                        reject(e);
                    });
                });
            });
        },
        create: (name, description, isPrivate) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/x5aSMDodNU02VT1VRyW48A/CreateList`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({"variables":{"isPrivate":isPrivate,"name":name,"description":description,"withSuperFollowsUserFields":true},"features":{"responsive_web_graphql_timeline_navigation_enabled":false},"queryId":"x5aSMDodNU02VT1VRyW48A"}),
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    chrome.storage.local.set({listData: {}}, () => {});
                    resolve(data.data.list);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getOwnerships: (myId, userId) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/6E69fsenLDPDcprqtogzdw/ListOwnerships?variables=${encodeURIComponent(JSON.stringify({"userId":myId,"isListMemberTargetUserId":userId,"count":100,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true}))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
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
                    chrome.storage.local.set({listData: {}}, () => {});
                    resolve(
                        data.data.user.result.timeline.timeline.instructions.find(i => i.entries).entries.filter(e => e.entryId.startsWith('list-')).map(e => e.content.itemContent.list)
                    );
                }).catch(e => {
                    reject(e);
                });
            });
        }
    },
    circle: {
        getCircles: () => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/QjN8ZdavFDqxUjNn3r9cig/AuthenticatedUserTFLists?variables=%7B%7D`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data.data.authenticated_user_trusted_friends_lists);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        getMembers: (id, cursor = null) => {
            return new Promise((resolve, reject) => {
                let variables = {"trustedFriendsId":id,"cursor":cursor, count: 150};
                let features = {"responsive_web_graphql_timeline_navigation_enabled":false};
                fetch(`/i/api/graphql/i3_opgZeSaeWbfyFQjZ5Sw/TrustedFriendsMembersQuery?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(features))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data.data.trusted_friends_list_by_rest_id.members_slice.items_results.filter(u => u.result && u.result.is_trusted_friends_list_member).map(u => u.result));
                }).catch(e => {
                    reject(e);
                });
            });
        },
        removeUser: (circle_id, circle_rest_id, item_id, user_id) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/fl9NbcQB1UE5uiYvEHfHGA/TrustedFriendsAddRemoveButtonRemoveMutation`, {
                    method: "POST",
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        variables: {
                            trustedFriendsId: circle_rest_id,
                            userId: user_id,
                            slices: [
                                `client:${circle_id}=:__TrustedFriendsMembers_slice_result_slice`
                            ],
                            itemID: item_id
                        },
                        features: {"responsive_web_graphql_timeline_navigation_enabled":false},
                        queryId: "fl9NbcQB1UE5uiYvEHfHGA"
                    })
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        addUser: (circle_id, circle_rest_id, user_id) => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/QFcDZhljP_e9bzeT8saZ3A/TrustedFriendsAddRemoveButtonAddMutation`, {
                    method: "POST",
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        variables: {
                            trustedFriendsId: circle_rest_id,
                            userId: user_id,
                            slices: [
                                `client:${circle_id}=:__TrustedFriendsMembers_slice_result_slice`
                            ],
                        },
                        features: {"responsive_web_graphql_timeline_navigation_enabled":false},
                        queryId: "QFcDZhljP_e9bzeT8saZ3A"
                    })
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        }
    },
    topic: {
        landingPage: (id, cursor) => {
            return new Promise((resolve, reject) => {
                let variables = {"rest_id": id,"context":"{}","withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true};
                if(cursor) variables.cursor = cursor;
                fetch(`/i/api/graphql/4exqISyA1-LejxLHY4RqJA/TopicLandingPage?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":true,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include"
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(data.data.topic_by_rest_id.topic_page);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        notInterested: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/cPCFdDAaqRjlMRYInZzoDA/TopicNotInterested`, {
                    method: "POST",
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                    body: JSON.stringify({"variables":{"topicId":id},"queryId":"cPCFdDAaqRjlMRYInZzoDA"})
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        undoNotInterested: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/4tVnt6FoSxaX8L-mDDJo4Q/TopicUndoNotInterested`, {
                    method: "POST",
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                    body: JSON.stringify({"variables":{"topicId":id},"queryId":"4tVnt6FoSxaX8L-mDDJo4Q"})
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        follow: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/ElqSLWFmsPL4NlZI5e1Grg/TopicFollow`, {
                    method: "POST",
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                    body: JSON.stringify({"variables":{"topicId":id},"queryId":"ElqSLWFmsPL4NlZI5e1Grg"})
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        },
        unfollow: id => {
            return new Promise((resolve, reject) => {
                fetch(`/i/api/graphql/srwjU6JM_ZKTj_QMfUGNcw/TopicUnfollow`, {
                    method: "POST",
                    headers: {
                        "authorization": OLDTWITTER_CONFIG.public_token,
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": "OAuth2Session",
                        "content-type": "application/json",
                        "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                    },
                    credentials: "include",
                    body: JSON.stringify({"variables":{"topicId":id},"queryId":"srwjU6JM_ZKTj_QMfUGNcw"})
                }).then(i => i.json()).then(data => {
                    if (data.errors && data.errors[0].code === 32) {
                        return reject("Not logged in");
                    }
                    if (data.errors && data.errors[0]) {
                        return reject(data.errors[0].message);
                    }
                    resolve(true);
                }).catch(e => {
                    reject(e);
                });
            });
        }
    },
    /*
        media_type: "video/mp4",
        media_category: "tweet_video" | "tweet_image" | "tweet_gif",
        media: ArrayBuffer,
        loadCallback: function,
        alt: "alt text"
    */
    uploadMedia: (data) => {
        return new Promise(async (resolve, reject) => {
            let obj = {
                command: "INIT",
                total_bytes: data.media.byteLength,
                media_type: data.media_type
            };
            if(data.media_category) obj.media_category = data.media_category;
            let initUpload, initAttempts = 0;
            if(data.loadCallback) data.loadCallback({
                text: LOC.initialization.message,
                progress: 0
            });
            async function tryInitializing() {
                if(data.loadCallback) data.loadCallback({
                    text: LOC.initialization.message + ".".repeat(initAttempts),
                    progress: 0
                });
                if(initAttempts++ > 7) return reject("Failed to initialize media upload");
                try {
                    initUpload = await fetch(`https://upload.${location.hostname}/1.1/media/upload.json`, {
                        headers: { "authorization": OLDTWITTER_CONFIG.public_token, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                        credentials: "include",
                        method: "post",
                        body: new URLSearchParams(obj).toString()
                    }).then(i => i.json());
                } catch(e) {
                    console.error(e);
                    await sleep(1500 * initAttempts);
                    return tryInitializing();
                }
            }
            await tryInitializing();
            if (initUpload.errors && initUpload.errors[0]) {
                return reject(initUpload.errors[0].message);
            }
            let mediaId = initUpload.media_id_string;
            let segments = [];
            let segmentSize = (window.navigator && navigator.connection && navigator.connection.type === 'cellular' && !vars.disableDataSaver) ? 1084576 / 2 : 1084576; // smaller chunks for cellular data
            let segmentCount = Math.ceil(data.media.byteLength / segmentSize);
            for (let i = 0; i < segmentCount; i++) {
                let segmentData = data.media.slice(i * segmentSize, (i + 1) * segmentSize);
                segments.push(segmentData);
            }
            for(let i in segments) {
                let segment = segments[i];
                let attempts = 0;
                async function tryUploadingChunk() {
                    if(data.loadCallback) {
                        data.loadCallback({
                            text: LOC.uploading.message + ".".repeat(attempts),
                            progress: Math.round(((+i + 1) / segments.length)*100)
                        });
                    }
                    if(attempts++ > 7) return reject("Failed to upload chunk");
                    let fd = new FormData();
                    fd.append("media", new Blob([segment], { type: data.media_type }));
                    try {
                        await fetch(`https://upload.${location.hostname}/1.1/media/upload.json?command=APPEND&media_id=${mediaId}&segment_index=${i}`, {
                            headers: {
                                "authorization": OLDTWITTER_CONFIG.public_token, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session",
                            },
                            credentials: "include",
                            method: "post",
                            body: fd
                        }).then(i => i.text());
                    } catch(e) {
                        console.error(e);
                        await sleep(2000 * attempts);
                        return tryUploadingChunk();
                    }
                }
                await tryUploadingChunk();
            }
            if(data.loadCallback) data.loadCallback({
                text: LOC.finalization.message,
                progress: 100
            });
            let finalData, finalAttempts = 0;
            async function tryFinalizing() {
                if(data.loadCallback) data.loadCallback({
                    text: LOC.finalization.message + ".".repeat(finalAttempts),
                    progress: 100
                });
                if(finalAttempts++ > 7) return reject("Failed to finalize media upload");
                try {
                    finalData = await fetch(`https://upload.${location.hostname}/1.1/media/upload.json`, {
                        headers: { "authorization": OLDTWITTER_CONFIG.public_token, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                        credentials: "include",
                        method: "post",
                        body: new URLSearchParams({
                            command: "FINALIZE",
                            media_id: mediaId
                        }).toString()
                    }).then(i => i.json());
                } catch(e) {
                    console.error(e);
                    await sleep(2000 * finalAttempts);
                    return tryFinalizing();
                }
            }
            await tryFinalizing();
            if (finalData.errors && finalData.errors[0]) {
                return reject(finalData.errors[0].message);
            }
            if((typeof data.alt === 'string' && data.alt.length > 0) || data.cw.length > 0) {
                try {
                    let obj = {
                        media_id: mediaId
                    };
                    if(data.alt) {
                        obj.alt_text = {
                            text: data.alt
                        };
                    }
                    if(data.cw.length > 0) {
                        obj.sensitive_media_warning = data.cw;
                    }
                    await fetch(`https://upload.${location.hostname}/1.1/media/metadata/create.json`, {
                        headers: { "authorization": OLDTWITTER_CONFIG.public_token, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session" },
                        credentials: "include",
                        method: "post",
                        body: JSON.stringify(obj)
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
                await fetch(`https://upload.${location.hostname}/1.1/media/upload.json?${new URLSearchParams({ command: "STATUS", media_id: mediaId }).toString()}`, {
                    headers: { "authorization": OLDTWITTER_CONFIG.public_token, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    credentials: "include",
                }).then(i => i.json()).then(i => {
                    if (i.processing_info.state === "succeeded") {
                        resolve(i.media_id_string);
                    }
                    if (i.processing_info.state === "failed") {
                        if(i.processing_info.error.message) {
                            reject(i.processing_info.error.message);
                        } else {
                            reject(`Twitter API rejected your media with code ${i.processing_info.error.code} (${i.processing_info.error.name})`);
                        }
                    }
                    if(i.processing_info.state === "in_progress") {
                        if(!i.processing_info.check_after_secs && i.processing_info.error) {
                            if(i.processing_info.error.message) {
                                return reject(i.processing_info.error.message);
                            } else {
                                return reject(`Twitter API rejected your media with code ${i.processing_info.error.code} (${i.processing_info.error.name})`);
                            }
                        }
                        setTimeout(checkStatus, i.processing_info.check_after_secs*1000);
                        if(data.loadCallback) {
                            data.loadCallback({
                                text: LOC.processing.message,
                                progress: i.processing_info.progress_percent
                            });
                        }
                    }
                });
            };
            setTimeout(checkStatus, 500);
        });
    }
};