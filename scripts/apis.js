const API = {};

setInterval(() => {
    chrome.storage.local.set({userUpdates: {}}, () => {});
    chrome.storage.local.set({peopleRecommendations: {}}, () => {});
    chrome.storage.local.set({tweetReplies: {}}, () => {});
    chrome.storage.local.set({tweetDetails: {}}, () => {});
    chrome.storage.local.set({tweetLikers: {}}, () => {});
    chrome.storage.local.set({listData: {}}, () => {});
    chrome.storage.local.set({trends: {}}, () => {});
}, 60000*10);

setInterval(() => {
    // on first minute of hour
    if(new Date().getMinutes() !== 0) return;
    chrome.storage.local.set({translations: {}}, () => {});
    chrome.storage.local.set({hashflags: {}}, () => {});
}, 60000);

// Account
API.verifyCredentials = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['credentials'], d => {
            if(d.credentials && Date.now() - d.credentials.date < 60000*15) {
                return resolve(d.credentials.data);
            }
            fetch(`https://api.twitter.com/1.1/account/verify_credentials.json`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session"
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
                chrome.storage.local.set({credentials: {
                    date: Date.now(),
                    data
                }}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    })
}
API.logout = () => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/account/logout.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session"
            },
            credentials: "include",
            method: 'post',
            body: 'redirectAfterLogout=https%3A%2F%2Ftwitter.com%2Faccount%2Fswitch'
        }).then(i => i.json()).then(data => {
            chrome.storage.local.remove(["credentials", "inboxData", "tweetDetails", "savedSearches", "discoverData", "userUpdates", "peopleRecommendations", "tweetReplies", "tweetLikers", "listData", "twitterSettings", "algoTimeline"], () => {
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
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            method: 'post',
            body: `user_id=${id}`
        }).then(i => {
            status = i.status;
            return i.text();
        }).then(data => {
            chrome.storage.local.remove(["credentials", "inboxData", "tweetDetails", "savedSearches", "discoverData", "userUpdates", "peopleRecommendations", "tweetReplies", "tweetLikers", "listData", "twitterSettings", "algoTimeline"], () => {
                if(String(status).startsWith("2")) {
                    resolve(data);
                } else {
                    reject(data);
                }
            });
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
}
API.getSettings = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['twitterSettings'], d => {
            if(d.twitterSettings && Date.now() - d.twitterSettings.date < 60000*10) {
                return resolve(d.twitterSettings.data);
            }
            fetch(`https://api.twitter.com/1.1/account/settings.json`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    setTimeout(() => {
                        location.href = "https://twitter.com/i/flow/login?newtwitter=true";
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

// Timelines
API.getTimeline = (max_id) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/home_timeline.json?count=40&include_my_retweet=1&cards_platform=Web-12&include_cards=1&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified&include_reply_count=true${max_id ? `&max_id=${max_id}` : ''}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en",
                "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220811153004 web/"
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
API.getAlgoTimeline = (cursor, count = 25) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/timeline/home.json?${cursor ? `cursor=${cursor.replace(/\+/g, '%2B')}&` : ''}include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&earned=1&count=${count}&lca=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified&browserNotificationPermission=default`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
            },
            credentials: "include"
        }).then(response => response.json()).then(data => {
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
            let list = [];
            for (let i = 0; i < entries.length; i++) {
                let e = entries[i].content.item;
                if(!e || !e.content || !e.content.tweet) continue;
                if(e.content.tweet.promotedMetadata) continue;
                let tweet = tweets[e.content.tweet.id];
                if(!tweet) continue;
                let user = users[tweet.user_id_str];
                tweet.user = user;
                tweet.id_str = e.content.tweet.id;
                if(
                    tweet && tweet.source && 
                    (tweet.source.includes('Twitter for Advertisers') || tweet.source.includes('advertiser-interface'))
                ) continue;
                if(e.feedbackInfo) tweet.feedback = e.feedbackInfo.feedbackKeys.map(f => data.timeline.responseObjects.feedbackActions[f]);
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
            return resolve({
                list,
                cursor: entries.find(e => e.entryId.startsWith('cursor-bottom-')).content.operation.cursor.value
            })
        }).catch(e => {
            reject(e);
        });
    });
}
API.getAlgoTimelineWithCache = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['algoTimeline'], d => {
            if(d.algoTimeline && Date.now() - d.algoTimeline.date < 60000*10) {
                return resolve(d.algoTimeline.data);
            }
            API.getAlgoTimeline().then(data => {
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
}
API.getMixedTimeline = async () => {
    let [chrono, algo] = await Promise.allSettled([API.getTimeline(), API.getAlgoTimelineWithCache()]);
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
    for(let i = chrono.length-1; i >= 0; i--) {
        if(social.length === 0) break;
        if(i % 7 === 0) {
            if(chrono.map(t => t.id_str).includes(social[social.length-1].id_str)) {
                social.pop();
            } else {
                chrono.splice(chrono.length-i, 0, social.pop());
            }
        }
    }
    return chrono;
}

// Discovering
API.discoverPeople = (cache = true) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['discoverData'], d => {
            if(cache && d.discoverData && Date.now() - d.discoverData.date < 60000*10) {
                return resolve(d.discoverData.data);
            }
            fetch(`https://twitter.com/i/api/2/people_discovery/modules_urt.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&display_location=connect&client_type=rweb&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerifiedhighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.public_token,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
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
API.peopleRecommendations = (id, cache = true, by_screen_name = false) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([`peopleRecommendations`], d => {
            if(!d.peopleRecommendations) d.peopleRecommendations = {};
            if(cache && d.peopleRecommendations[`${id}${by_screen_name}`] && Date.now() - d.peopleRecommendations[`${id}${by_screen_name}`].date < 60000*7) {
                return resolve(d.peopleRecommendations[`${id}${by_screen_name}`].data);
            }
            fetch(`https://twitter.com/i/api/1.1/users/recommendations.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&&pc=true&display_location=profile_accounts_sidebar&limit=4&${by_screen_name ? 'screen_name' : 'user_id'}=${id}&ext=mediaStats%2CverifiedType%2CisBlueVerified%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.public_token,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
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
}
API.getTrends = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['trends'], d => {
            if(d.trends && Date.now() - d.trends.date < 60000*10) {
                return resolve(d.trends.data);
            }
            fetch(`https://api.twitter.com/1.1/trends/plus.json?max_trends=8`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
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
                chrome.storage.local.set({trends: {
                    date: Date.now(),
                    data
                }}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}
API.getHashflags = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['hashflags'], d => {
            if(d.hashflags && Date.now() - d.hashflags.date < 60000*60*4) {
                return resolve(d.hashflags.data);
            }
            fetch(`https://twitter.com/i/api/1.1/hashflags.json`, {
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
        let obj = {
            command: "INIT",
            total_bytes: data.media.byteLength,
            media_type: data.media_type
        };
        if(data.media_category) obj.media_category = data.media_category;
        let initUpload = await fetch(`https://upload.twitter.com/1.1/media/upload.json`, {
            headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
            credentials: "include",
            method: "post",
            body: new URLSearchParams(obj).toString()
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

// Translations
API.translateTweet = id => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([`translations`], d => {
            if(!d.translations) d.translations = {};
            if(d.translations[id] && Date.now() - d.translations[id].date < 60000*60*4) {
                return resolve(d.translations[id].data);
            }
            fetch(`https://twitter.com/i/api/1.1/strato/column/None/tweetId=${id},destinationLanguage=None,translationSource=Some(Google),feature=None,timeout=None,onlyCached=None/translation/service/translateTweet`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
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
                resolve({
                    translated_lang: data.localizedSourceLanguage,
                    text: data.translation
                });
                d.translations[id] = {
                    date: Date.now(),
                    data: {
                        translated_lang: data.localizedSourceLanguage,
                        text: data.translation
                    }
                };
                chrome.storage.local.set({translations: d.translations}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}
API.translateProfile = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/strato/column/None/profileUserId=${id},destinationLanguage=None,translationSource=Some(Google)/translation/service/translateProfile`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
            resolve(data.profileTranslation);
        }).catch(e => {
            reject(e);
        });
    });
}

// Notifications
API.getUnreadCount = (cache = true) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['unreadCount'], d => {
            if(cache && d.unreadCount && Date.now() - d.unreadCount.date < 18000) {
                return resolve(d.unreadCount.data);
            }
            fetch(`https://twitter.com/i/api/2/badge_count/badge_count.json?supports_ntab_urt=1`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
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
                chrome.storage.local.set({unreadCount: {
                    date: Date.now(),
                    data
                }}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}
API.getNotifications = (cursor, onlyMentions = false) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/notifications/${onlyMentions ? 'mentions' : 'all'}.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=50&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control${cursor ? `&cursor=${cursor}` : ''}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
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
API.getDeviceFollowTweets = (cursor) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/notifications/device_follow.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_ext_limited_action_results=false&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&ext=mediaStats%2CverifiedType%2CisBlueVerified%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2CeditControl%2Ccollab_control%2Cvibe${cursor ? `&cursor=${cursor}` : ''}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
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
            let cursor = entries.find(e => e.entryId.startsWith('cursor-bottom-'));
            if(cursor) {
                cursor = cursor.content.operation.cursor.value;
            }
            resolve({
                list: tweets,
                cursor
            })
        }).catch(e => {
            reject(e);
        });
    });
}
API.viewNotification = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/notifications/view/${id}.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_ext_limited_action_results=false&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2CeditControl%2Ccollab_control%2Cvibe`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
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
                    tl.push({data: tweet, type: 'tweet'});
                } else if(e.entryId.startsWith('user-')) {
                    let id = e.content.item.content.user.id;
                    let user = data.globalObjects.users[id];
                    tl.push({data: user, type: 'user'});
                } else if(e.entryId.startsWith('main-user-')) {
                    let id = e.content.timelineModule.items[0].item.content.user.id;
                    let user = data.globalObjects.users[id];
                    tl.push({data: user, type: 'user'});
                }
            }
            resolve(tl);
        }).catch(e => {
            reject(e);
        });
    });
}

// Profiles
API.getUser = (val, byId = true) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/users/show.json?${byId ? `user_id=${val}` : `screen_name=${val}`}`, {
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
                    location.href = `https://twitter.com/i/flow/login?newtwitter=true`;
                }, 50);
            }
            return i.json();
        }).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getUserV2 = name => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/sLVLhk0bGj3MVFEKTdax1w/UserByScreenName?variables=%7B%22screen_name%22%3A%22${name}%22%2C%22withSafetyModeUserFields%22%3Atrue%2C%22withSuperFollowsUserFields%22%3Atrue%7D&features=${encodeURIComponent(JSON.stringify({"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true}))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json",
                "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
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
            resolve(result.legacy);
        }).catch(e => {
            reject(e);
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
API.cancelFollow = screen_name => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/friendships/cancel.json`, {
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
}
API.getUserTweets = (id, max_id, replies = false) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/user_timeline.json?count=100&exclude_replies=${!replies}&include_my_retweet=1&include_rts=1&user_id=${id}${max_id ? `&max_id=${max_id}` : ''}&cards_platform=Web-12&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.getUserTweetsV2 = (id, cursor, replies = false) => {
    return new Promise((resolve, reject) => {
        let variables = {"userId":id,"count":100,"includePromotedContent":false,"withQuickPromoteEligibilityTweetFields":false,"withVoice":true,"withV2Timeline":true};
        let features = {"rweb_lists_timeline_redesign_enabled":false,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":false,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_media_download_video_enabled":false,"responsive_web_enhance_cards_enabled":false};
        let fieldToggles = {"withArticleRichContentState":false};
        if(cursor) {
            variables.cursor = cursor;
        }
        let api = "QqZBEqganhHwmU9QscmIug/UserTweets";
        if(replies) {
            api = "wxoVeDnl0mP7VLhe6mTOdg/UserTweetsAndReplies";
        }
        
        fetch(`https://twitter.com/i/api/graphql/${api}?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(features))}&fieldToggles=${encodeURIComponent(JSON.stringify(fieldToggles))}`, {
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
            let instructions = data.data.user.result.timeline_v2.timeline.instructions;
            let entries = instructions.find(e => e.type === "TimelineAddEntries");
            if(!entries) {
                return reject("Nothing here");
            }
            entries = entries.entries;
            let tweets = [];
            for(let entry of entries) {
                if(entry.entryId.startsWith("tweet-")) {
                    let result = entry.content.itemContent.tweet_results.result;
                    if(!result) {
                        continue;
                    }
                    console.log(result);
                    let tweet = result.legacy;
                    if(tweet.retweeted_status_result) {
                        let result = tweet.retweeted_status_result.result;
                        tweet.retweeted_status = result.legacy;
                        tweet.retweeted_status.user = result.core.user_results.result.legacy;
                        tweet.retweeted_status.user.id_str = tweet.retweeted_status.user_id_str;
                        tweet.retweeted_status.ext = {};
                        if(result.views) {
                            tweet.retweeted_status.ext.views = {r: {ok: true, count: +result.views.count}};
                        }
                    }
                    if(tweet.quoted_status_result) {
                        let result = tweet.quoted_status_result.result;
                        tweet.quoted_status = result.legacy;
                        tweet.quoted_status.user = result.core.user_results.result.legacy;
                        tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                        tweet.quoted_status.ext = {};
                        if(result.views) {
                            tweet.quoted_status.ext.views = {r: {ok: true, count: +result.views.count}};
                        }
                    }
                    tweet.user = result.core.user_results.result.legacy;
                    tweet.user.id_str = tweet.user_id_str;
                    tweet.ext = {};
                    if(result.views) {
                        tweet.ext.views = {r: {ok: true, count: +result.views.count}};
                    }
                } else if(entry.entryId.startsWith("profile-conversation-")) {
                    let items = entry.content.items;
                    for(let i = 0; i < items.length; i++) {
                        let item = items[i];
                        let result = item.item.itemContent.tweet_results.result;
                        if(item.entryId.includes("-tweet-")) {
                            let tweet = result.legacy;
                            tweet.user = result.core.user_results.result.legacy;
                            tweet.user.id_str = tweet.user_id_str;
                            if(tweet.retweeted_status_result) {
                                tweet.retweeted_status = tweet.retweeted_status_result.legacy;
                                tweet.retweeted_status.user = tweet.retweeted_status_result.core.user_results.result.legacy;
                                tweet.retweeted_status.user.id_str = tweet.retweeted_status.user_id_str;
                                tweet.retweeted_status.ext = {};
                                if(tweet.retweeted_status_result.views) {
                                    tweet.ext.views = {r: {ok: true, count: +tweet.retweeted_status_result.views.count}};
                                }
                            }
                            if(tweet.quoted_status_result) {
                                tweet.quoted_status = tweet.quoted_status_result.legacy;
                                tweet.quoted_status.user = tweet.quoted_status_result.core.user_results.result.legacy;
                                tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                                tweet.quoted_status.ext = {};
                                if(tweet.quoted_status_result.views) {
                                    tweet.ext.views = {r: {ok: true, count: +tweet.quoted_status_result.views.count}};
                                }
                            }
                            tweet.ext = {};
                            if(result.views) {
                                tweet.ext.views = {r: {ok: true, count: +result.views.count}};
                            }
                            if(i !== items.length - 1) tweet.threadContinuation = true;
                            if(i !== 0) tweet.noTop = true;
                            tweets.push(tweet);
                        }
                    }
                }
            }
            resolve({
                tweets,
                cursor: entries.find(e => e.entryId.startsWith("sq-cursor-bottom-") || e.entryId.startsWith("cursor-bottom-")).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getUserMediaTweets = (id, cursor) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/qJPOeW9Q8icdlpfnPhsqJQ/UserMedia?variables=${encodeURIComponent(JSON.stringify({"userId":id,"count":20,"cursor":cursor,"includePromotedContent":false,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withClientEventToken":false,"withBirdwatchNotes":false,"withVoice":true,"withV2Timeline":true}))}&features=${encodeURIComponent(JSON.stringify({"blue_business_profile_image_shape_enabled":false,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_richtext_consumption_enabled":false,"responsive_web_enhance_cards_enabled":false}))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
            let entries = data.data.user.result.timeline_v2.timeline.instructions.find(i => i.type === 'TimelineAddEntries').entries;
            let tweets = entries.filter(i => i.entryId.startsWith('tweet-')).map(t => {
                let o = t.content.itemContent.tweet_results.result;
                o.legacy.user = o.core.user_results.result.legacy;
                o.legacy.user.id_str = o.core.user_results.result.legacy.rest_id;
                if(o.views && o.views.count) {
                    if(!o.legacy.ext) o.legacy.ext = {};
                    if(!o.legacy.ext.views) o.legacy.ext.views = {
                        r: {
                            ok: {
                                count: +o.views.count
                            }
                        }
                    };
                }
                

                return o.legacy;
            });
            let cursor = entries.find(e => e.entryId.startsWith('cursor-bottom-'));
            if(cursor) {
                cursor = cursor.content.value;
            }

            resolve({
                tweets,
                cursor
            })
        }).catch(e => {
            reject(e);
        });
    });
}
API.friendsFollowing = (val, by_id = true) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/friends/following/list.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cursor=-1&${by_id ? `user_id=${val}` : `screen_name=${val}`}&count=10&with_total_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.getRelationship = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/friendships/show.json?source_id=${id}&target_screen_name=JinjersTemple&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.receiveNotifications = (id, receive = false) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/friendships/update.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.blockUser = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/blocks/create.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.unblockUser = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/blocks/destroy.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.muteUser = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/mutes/users/create.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.unmuteUser = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/mutes/users/destroy.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.removeFollower = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/QpNfg0kpPRfjROQ_9eOLXA/RemoveFollower`, {
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
}
API.getFavorites = (id, cursor) => {
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
        fetch(`https://twitter.com/i/api/graphql/vni8vUvtZvJoIsl49VPudg/Likes?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
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
            resolve({
                tl: data.data.user.result.timeline_v2.timeline.instructions[0].entries.filter(e => e.entryId.startsWith('tweet-') && e.content.itemContent.tweet_results.result).map(e => {
                    if(!e.content.itemContent.tweet_results.result.legacy) {
                        e.content.itemContent.tweet_results.result = e.content.itemContent.tweet_results.result.tweet;
                    }
                    if(!e.content.itemContent.tweet_results.result) {
                        return;
                    }
                    let tweet = e.content.itemContent.tweet_results.result.legacy;
                    let user = e.content.itemContent.tweet_results.result.core.user_results.result;
                    user.legacy.id_str = user.rest_id;
                    user = user.legacy;
                    tweet.user = user;
                    if(tweet.quoted_status_id_str) {
                        let qr = e.content.itemContent.tweet_results.result.quoted_status_result.result;
                        if(qr.legacy) { 
                            tweet.quoted_status = qr.legacy;
                            tweet.quoted_status.user = qr.core.user_results.result.legacy;
                            tweet.quoted_status.user.id_str = qr.core.user_results.result.rest_id;
                        }
                    }
                    return tweet;
                }).filter(e => e),
                cursor: data.data.user.result.timeline_v2.timeline.instructions[0].entries.find(e => e.entryId.startsWith('cursor-bottom')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getFollowing = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {
            "userId": id,
            "count": 100,
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
        fetch(`https://twitter.com/i/api/graphql/N4YSLBJm3XcABTeX3xLWbQ/Following?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
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
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let list = data.data.user.result.timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries').entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                    let user = e.content.itemContent.user_results.result;
                    user.legacy.id_str = user.rest_id;
                    return user.legacy;
                }),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getFollowingIds = (cursor = -1, count = 5000) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/friends/ids.json?cursor=${cursor}&stringify_ids=true&count=${count}`, {
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
}
API.getFollowersIds = (cursor = -1, count = 5000) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/followers/ids.json?cursor=${cursor}&stringify_ids=true&count=${count}`, {
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
}
API.lookupUsers = ids => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/users/lookup.json?user_id=${ids.join(",")}`, {
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
}
API.getFollowers = (id, cursor, count = 100) => {
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
        fetch(`https://twitter.com/i/api/graphql/fJSopkDA3UP9priyce4RgQ/Followers?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
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
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let list = data.data.user.result.timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries').entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                    let user = e.content.itemContent.user_results.result;
                    user.legacy.id_str = user.rest_id;
                    return user.legacy;
                }),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getFollowersYouFollow = (id, cursor) => {
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
        fetch(`https://twitter.com/i/api/graphql/Ta_Zd7mReCZVnThOABfNhA/FollowersYouKnow?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
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
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let list = data.data.user.result.timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries').entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                    let user = e.content.itemContent.user_results.result;
                    user.legacy.id_str = user.rest_id;
                    return user.legacy;
                }),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.switchRetweetsVisibility = (user_id, see) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/friendships/update.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.getFollowRequests = (cursor = -1) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/friendships/incoming.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cursor=${cursor}&stringify_ids=true&count=100`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.acceptFollowRequest = user_id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/friendships/accept.json`, {
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
}
API.declineFollowRequest = user_id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/friendships/deny.json`, {
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
}

// Tweets
API.postTweet = data => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/update.json`, {
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
}
API.postTweetV2 = data => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/Mvpg1U7PrmuHeYdY_83kLw/CreateTweet`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json; charset=utf-8"
            },
            credentials: "include",
            body: JSON.stringify(data)
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let result = data.data.create_tweet.tweet_results.result;
            let tweet = result.legacy;
            tweet.id_str = result.rest_id;
            tweet.user = result.core.user_results.result.legacy;
            tweet.user.id_str = result.core.user_results.result.rest_id;
            if(result.card) {
                tweet.card = result.card.legacy;
                tweet.card.id_str = result.card.rest_id;
                tweet.card.id = result.card.rest_id;
                let binding_values = {};
                for(let i in tweet.card.binding_values) {
                    let bv = tweet.card.binding_values[i];
                    binding_values[bv.key] = bv.value;
                }
                tweet.card.binding_values = binding_values;
            }
            resolve(tweet);
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
        fetch(`https://api.twitter.com/1.1/statuses/show.json?id=${id}&include_my_retweet=1&cards_platform=Web13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
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
API.createScheduledTweet = data => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/LCVzRQGxOaGnOnYH01NQXg/CreateScheduledTweet`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json; charset=utf-8"
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
}
let loadingDetails = {};
API.tweetDetail = id => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['tweetDetails'], d => {
            if(!d.tweetDetails) d.tweetDetails = {};
            if(d.tweetDetails[id] && Date.now() - d.tweetDetails[id].date < 60000*5) {
                return resolve(d.tweetDetails[id].data);
            }
            if(loadingDetails[id]) {
                return loadingDetails[id].listeners.push([resolve, reject]);
            } else {
                loadingDetails[id] = {
                    listeners: []
                };
            }
            fetch(`https://twitter.com/i/api/graphql/KwGBbJZc6DBx8EKmyQSP7g/TweetDetail?variables=${encodeURIComponent(JSON.stringify({
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
                    "authorization": OLDTWITTER_CONFIG.public_token,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0]) {
                    loadingDetails[id].listeners.forEach(l => l[1](data.errors[0].message));
                    delete loadingDetails[id];
                    return reject(data.errors[0].message);
                }
                let tweetData = data.data.threaded_conversation_with_injections_v2.instructions.find(i => i.type === "TimelineAddEntries").entries.find(e => e.entryId === `tweet-${id}`).content.itemContent.tweet_results.result;
                if(!tweetData.legacy) {
                    tweetData = tweetData.tweet;
                }
                let tweet = tweetData.legacy;
                if(tweetData.card) {
                    tweet.card = tweetData.card.legacy;
                    let newBindingValues = {};
                    for(let i of tweet.card.binding_values) {
                        newBindingValues[i.key] = i.value;
                    }
                    tweet.card.binding_values = newBindingValues;
                }
                if(tweet.quoted_status_id_str) {
                    tweet.quoted_status = tweetData.quoted_status_result.result;
                    if(!tweet.quoted_status.core) tweet.quoted_status = tweet.quoted_status.tweet;
                    let userData = tweet.quoted_status.core.user_results.result;
                    userData.legacy.id_str = userData.rest_id;
                    tweet.quoted_status.legacy.user = userData.legacy;
                    tweet.quoted_status = tweet.quoted_status.legacy;
                }
                if(tweetData.note_tweet && tweetData.note_tweet.note_tweet_results && tweetData.note_tweet.note_tweet_results.result) {
                    tweet.full_text = tweetData.note_tweet.note_tweet_results.result.text;
                }
                if(tweetData.views && tweetData.views.count) {
                    if(!tweet.ext) tweet.ext = {};
                    tweet.ext.views = {r:{ok:{count: tweetData.views.count}}};
                }
                tweet.user = tweetData.core.user_results.result;
                tweet.user.legacy.id_str = tweet.user.rest_id;
                tweet.user = tweet.user.legacy;
                resolve(tweet);
                loadingDetails[id].listeners.forEach(l => l[0](tweet));
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
}
API.pollVote = (api, tweet_id, card_uri, card_name, selected_choice) => {
    return new Promise((resolve, reject) => {
        fetch(`https://caps.twitter.com/v2/capi/${api.split('//')[1]}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.createCard = card_data => {
    return new Promise((resolve, reject) => {
        fetch(`https://caps.twitter.com/v2/cards/create.json`, {
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
}
let loadingReplies = {};
API.getReplies = (id, cursor) => {
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
            fetch(`https://api.twitter.com/2/timeline/conversation/${id}.json?${cursor ? `cursor=${cursor}`: ''}&count=30&include_reply_count=true&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified%2CnoteTweet`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "content-type": "application/x-www-form-urlencoded",
                    "x-twitter-client-language": LANGUAGE ? LANGUAGE : navigator.language ? navigator.language : "en"
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
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
                let newCursor;
                try {
                    newCursor = entries.find(e => e.entryId.startsWith('cursor-bottom-')).content.operation.cursor.value;
                } catch(e) {}
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
}
API.getRepliesV2 = (id, cursor) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['tweetReplies'], d => {
            if(!d.tweetReplies) d.tweetReplies = {};
            if(!cursor) {
                if(d.tweetReplies[id] && Date.now() - d.tweetReplies[id].date < 60000*5) {
                    return resolve(d.tweetReplies[id].data);
                }
                if(loadingDetails[id]) {
                    return loadingDetails[id].listeners.push([resolve, reject]);
                } else {
                    loadingDetails[id] = {
                        listeners: []
                    };
                }
            }
            fetch(`https://twitter.com/i/api/graphql/KwGBbJZc6DBx8EKmyQSP7g/TweetDetail?variables=${encodeURIComponent(JSON.stringify({
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
                    "authorization": OLDTWITTER_CONFIG.public_token,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0]) {
                    loadingDetails[id].listeners.forEach(l => l[1](data.errors[0].message));
                    delete loadingDetails[id];
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
                    return resolve(out);
                }
                let entries = ae.entries;
                let list = [];
                let users = {};
                for (let i = 0; i < entries.length; i++) {
                    let e = entries[i];
                    if (e.entryId.startsWith('tweet-')) {
                        let tweetData = e.content.itemContent.tweet_results.result;
                        if(!tweetData) continue;
                        let tweet = tweetData.legacy;
                        let user = tweetData.core.user_results.result.legacy;
                        tweet.user = user;
                        tweet.user.id_str = tweet.user_id_str;
                        users[tweet.user_id_str] = tweet.user;
                        if(tweetData.card) {
                            tweet.card = tweetData.card.legacy;
                            let newBindingValues = {};
                            for(let i of tweet.card.binding_values) {
                                newBindingValues[i.key] = i.value;
                            }
                            tweet.card.binding_values = newBindingValues;
                        }
                        if(tweet.quoted_status_id_str) {
                            tweet.quoted_status = tweetData.quoted_status_result.result;
                            if(!tweet.quoted_status.core) tweet.quoted_status = tweet.quoted_status.tweet;
                            let userData = tweet.quoted_status.core.user_results.result;
                            userData.legacy.id_str = userData.rest_id;
                            tweet.quoted_status.legacy.user = userData.legacy;
                            tweet.quoted_status = tweet.quoted_status.legacy;
                        }
                        if(tweetData.note_tweet && tweetData.note_tweet.note_tweet_results && tweetData.note_tweet.note_tweet_results.result) {
                            tweet.full_text = tweetData.note_tweet.note_tweet_results.result.text;
                        }
                        if(tweetData.views && tweetData.views.count) {
                            if(!tweet.ext) tweet.ext = {};
                            tweet.ext.views = {r:{ok:{count: tweetData.views.count}}};
                        }
                        tweet.user = tweetData.core.user_results.result;
                        tweet.user.legacy.id_str = tweet.user.rest_id;
                        tweet.user = tweet.user.legacy;

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
                    } else if(e.entryId.startsWith('conversationthread-')) {
                        let thread = e.content.items;
                        let threadList = [];
                        for (let j = 0; j < thread.length; j++) {
                            if(thread[j].entryId.includes("-tweetcomposer-")) {
                                continue;
                            }
                            if(thread[j].entryId.includes("cursor-showmore")) {
                                continue; // TODO: Implement
                            }
                            let tweetData = thread[j].item.itemContent.tweet_results.result;
                            if(!tweetData) continue;
                            let tweet = tweetData.legacy;
                            let user = tweetData.core.user_results.result.legacy;
                            tweet.user = user;
                            tweet.user.id_str = tweet.user_id_str;
                            users[tweet.user_id_str] = tweet.user;
                            if(tweetData.card) {
                                tweet.card = tweetData.card.legacy;
                                let newBindingValues = {};
                                for(let i of tweet.card.binding_values) {
                                    newBindingValues[i.key] = i.value;
                                }
                                tweet.card.binding_values = newBindingValues;
                            }
                            if(tweet.quoted_status_id_str) {
                                tweet.quoted_status = tweetData.quoted_status_result.result;
                                if(!tweet.quoted_status.core) tweet.quoted_status = tweet.quoted_status.tweet;
                                let userData = tweet.quoted_status.core.user_results.result;
                                userData.legacy.id_str = userData.rest_id;
                                tweet.quoted_status.legacy.user = userData.legacy;
                                tweet.quoted_status = tweet.quoted_status.legacy;
                            }
                            if(tweetData.note_tweet && tweetData.note_tweet.note_tweet_results && tweetData.note_tweet.note_tweet_results.result) {
                                tweet.full_text = tweetData.note_tweet.note_tweet_results.result.text;
                            }
                            if(tweetData.views && tweetData.views.count) {
                                if(!tweet.ext) tweet.ext = {};
                                tweet.ext.views = {r:{ok:{count: tweetData.views.count}}};
                            }
                            tweet.user = tweetData.core.user_results.result;
                            tweet.user.legacy.id_str = tweet.user.rest_id;
                            tweet.user = tweet.user.legacy;
                            
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
                let newCursor;
                try {
                    newCursor = entries.find(e => e.entryId.startsWith('cursor-bottom-')).content.itemContent.value;
                } catch(e) {}
                resolve({
                    list,
                    cursor: newCursor,
                    users
                });
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
                reject(e);
            });
        });
    });
}
let loadingLikers = {};
API.getTweetLikers = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {
            "tweetId": id,
            "count": 10,
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
            fetch(`https://twitter.com/i/api/graphql/RMoTahkos95Jcdw-UWlZog/Favoriters?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
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
                    return resolve({ list: [], cursor: undefined });
                }
                list = list.entries;
                let rdata = {
                    list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                        if(e.content.itemContent.user_results.result.__typename === "UserUnavailable") return;
                        let user = e.content.itemContent.user_results.result;
                        user.legacy.id_str = user.rest_id;
                        return user.legacy;
                    }).filter(u => u),
                    cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
                };
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
}
API.getTweetRetweeters = (id, cursor) => {
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
        fetch(`https://twitter.com/i/api/graphql/qVWT1Tn1FiklyVDqYiOhLg/Retweeters?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
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
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let list = data.data.retweeters_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
            if(!list) return resolve({ list: [], cursor: undefined });
            list = list.entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                    if(e.content.itemContent.user_results.result.__typename === "UserUnavailable") return;
                    let user = e.content.itemContent.user_results.result;
                    user.legacy.id_str = user.rest_id;
                    return user.legacy;
                }).filter(u => u),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getTweetQuotes = (id, cursor) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/search/adaptive.json?${cursor ? `cursor=${cursor}&` : ''}include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&q=quoted_tweet_id%3A${id}&vertical=tweet_detail_quote&count=40&pc=1&spelling_corrections=1&include_ext_edit_control=false&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded"
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
            let list = entries.filter(e => e.entryId.startsWith('sq-I-t-') || e.entryId.startsWith('tweet-'));
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
                    let tweet = tweets[e.content.item.content.tweet.id];
                    let user = users[tweet.user_id_str];
                    user.id_str = tweet.user_id_str;
                    tweet.quoted_status = tweets[tweet.quoted_status_id_str];
                    tweet.quoted_status.user = users[tweet.quoted_status.user_id_str];
                    tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                    tweet.user = user;
                    return tweet;
                }),
                cursor
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.muteTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/mutes/conversations/create.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.unmuteTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/mutes/conversations/destroy.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}

// Deprecated...
API.getTweets = ids => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/lookup.json?id=${ids.join(',')}&include_entities=true&include_ext_alt_text=true&include_card_uri=true&tweet_mode=extended&include_reply_count=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}

// Searches
API.search = query => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/search/typeahead.json?q=${encodeURIComponent(query)}&include_can_dm=1&count=5&prefetch=false&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.searchV2 = (obj, cursor) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/search/adaptive.json?${cursor ? `cursor=${cursor}&` : ''}${obj.tweet_search_mode ? `tweet_search_mode=${obj.tweet_search_mode}&` : ''}include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&q=${obj.q}${obj.social_filter ? `&social_filter=${obj.social_filter}`:''}${obj.result_filter ? `&result_filter=${obj.result_filter}`:''}&count=50&query_source=typed_query&pc=1&spelling_corrections=1&include_ext_edit_control=false&ext=views%2CmediaStats%2CverifiedType%2CisBlueVerified%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
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
}
API.getSavedSearches = (cache = true) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['savedSearches'], d => {
            if(cache && d.savedSearches && Date.now() - d.savedSearches.date < 60000) {
                return resolve(d.savedSearches.data);
            }
            fetch(`https://twitter.com/i/api/1.1/saved_searches/list.json`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.deleteSavedSearch = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/saved_searches/destroy/${id}.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.saveSearch = q => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/saved_searches/create.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}

// Conversations
API.getInbox = max_id => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['inboxData'], d => {
            if(!max_id && d.inboxData && Date.now() - d.inboxData.date < 18000) {
                return resolve(d.inboxData.data);
            }
            fetch(`https://api.twitter.com/1.1/dm/user_inbox.json?max_conv_count=20&include_groups=true${max_id ? `&max_id=${max_id}` : ''}&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session"
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
}
API.markRead = eventId => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/dm/conversation/mark_read.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.getConversation = (id, max_id) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/dm/conversation/${id}.json?ext=altText${max_id ? `&max_id=${max_id}` : ''}&count=100&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session"
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
}
API.sendMessage = obj => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/dm/new.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.getUserUpdates = cursor => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['userUpdates'], d => {
            if(!cursor) cursor = '';
            if(!d.userUpdates) d.userUpdates = {};
            if(d.userUpdates[cursor] && Date.now() - d.userUpdates[cursor].date < 4000) {
                return resolve(d.userUpdates[cursor].data);
            }
            fetch(`https://twitter.com/i/api/1.1/dm/user_updates.json?${cursor ? `cursor=${cursor}&` : ''}cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&dm_users=false&include_groups=true&include_inbox_timelines=true&include_ext_media_color=true&supports_reactions=true&nsfw_filtering_enabled=false&cursor=GRwmiICwidfJnf8qFozAuPGoksj_KiUkAAA&filter_low_quality=false&include_quality=all&include_ext_edit_control=false&ext=mediaColor%2CaltText%2CmediaStats%2CverifiedType%2CisBlueVerified%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220811153004 web/"
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
}
API.deleteMessage = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/dm/destroy.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
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
}
API.deleteConversation = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/dm/conversation/${id}/delete.json`, {
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

// Pins
API.unpinTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/account/unpin_tweet.json`, {
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
}
API.pinTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/account/pin_tweet.json`, {
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
}

// Bookmarks
API.getBookmarks = (cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {"count":50,"includePromotedContent":false};
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/3OjEFzT2VjX-X7w4KYBJRg/Bookmarks?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"graphql_timeline_v2_bookmark_timeline":true,"blue_business_profile_image_shape_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"responsive_web_enhance_cards_enabled":false}))}`, {
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
            let list = data.data.bookmark_timeline_v2.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
            if(!list) return resolve({ list: [], cursor: undefined });
            list = list.entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('tweet-')).map(e => {
                    let res = e.content.itemContent.tweet_results.result;
                    if(!res || !res.legacy) return;
                    let tweet = res.legacy;
                    tweet.user = res.core.user_results.result.legacy;
                    tweet.user.id_str = tweet.user_id_str;
                    return tweet;
                }).filter(i => !!i),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.deleteAllBookmarks = () => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/skiACZKC1GDYli-M8RzEPQ/BookmarksAllDelete`, {
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
}
API.createBookmark = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/aoDbu3RHznuiSkQ9aNM67Q/CreateBookmark`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
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
}
API.deleteBookmark = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/Wlmlj2-xzyS1GN3a6cj-mQ/DeleteBookmark`, {
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

// Lists
API.getListTweets = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {"listId":id,"count":20,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true};
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/smHg9uz3WcyX_meRwh4g7A/ListLatestTweetsTimeline?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
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
            let list = data.data.list.tweets_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
            if(!list) return resolve({ list: [], cursor: undefined });
            list = list.entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('tweet-')).map(e => {
                    let res = e.content.itemContent.tweet_results.result;
                    if(!res) return;
                    let tweet = res.legacy;
                    if(!res.core) return;
                    tweet.user = res.core.user_results.result.legacy;
                    tweet.user.id_str = tweet.user_id_str;
                    return tweet;
                }).filter(i => !!i),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getListMembers = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {"listId":id,"count":20,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true,"withSafetyModeUserFields":true};
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/sXFXEmtFr3nLyG1dmS81jw/ListMembers?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
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
            let list = data.data.list.members_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
            if(!list) return resolve({ list: [], cursor: undefined });
            list = list.entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('user-')).map(u => {
                    let res = u.content.itemContent.user_results.result;
                    res.legacy.id_str = res.rest_id;
                    return res.legacy;
                }),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getListFollowers = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {"listId":id,"count":20,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true,"withSafetyModeUserFields":true};
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/LxXoouvfd5E8PXsdrQ0iMg/ListSubscribers?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
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
            let list = data.data.list.subscribers_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
            if(!list) return resolve({ list: [], cursor: undefined });
            list = list.entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('user-')).map(u => {
                    let res = u.content.itemContent.user_results.result;
                    res.legacy.id_str = res.rest_id;
                    return res.legacy;
                }),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getList = id => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['listData'], d => {
            if(!d.listData) d.listData = {};
            if(d.listData[id] && Date.now() - d.listData[id].date < 60000) {
                return resolve(d.listData[id].data);
            }
            fetch(`https://twitter.com/i/api/graphql/vxx-Y8zadpAP64HHiw4hMQ/ListByRestId?variables=${encodeURIComponent(JSON.stringify({"listId":id,"withSuperFollowsUserFields":true}))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false}))}`, {
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
}
API.subscribeList = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/nymTz5ek0FQPC3kh63Tp1w/ListSubscribe`, {
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
}
API.unsubscribeList = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/Wi5-aG4bvTmdjyRyRGkyhA/ListUnsubscribe`, {
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
}
API.updateList = (id, name, description, isPrivate) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/P9YDuvCt6ogRf-kyr5E5xw/UpdateList`, {
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
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}
API.deleteList = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/UnN9Th1BDbeLjpgjGSpL3Q/DeleteList`, {
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
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}
API.listAddMember = (listId, userId) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/RKtQuzpcy2gym71UorWg6g/ListAddMember`, {
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
}
API.listRemoveMember = (listId, userId) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/mDlp1UvnnALC_EzybKAMtA/ListRemoveMember`, {
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
}
API.getMyLists = () => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/cl2dF-zeGiLvZDsMGZhL4g/ListsManagementPageTimeline?variables=${encodeURIComponent(JSON.stringify({"count":100,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true}))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
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
                data.data.viewer.list_management_timeline
                    .timeline.instructions.find(i => i.entries)
                    .entries.find(i => i.entryId === 'ownedSubscribedListModule')
                    .content.items.map(i => i.item.itemContent.list)
            );
        }).catch(e => {
            reject(e);
        });
    });
}
API.getUserLists = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/mLKOzzVOWUycBiExBT1gjg/CombinedLists?variables=${encodeURIComponent(JSON.stringify({"userId":id,"count":100,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true}))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
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
API.createList = (name, description, isPrivate) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/x5aSMDodNU02VT1VRyW48A/CreateList`, {
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
}
API.getListOwnerships = (myId, userId) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/6E69fsenLDPDcprqtogzdw/ListOwnerships?variables=${encodeURIComponent(JSON.stringify({"userId":myId,"isListMemberTargetUserId":userId,"count":100,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true}))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
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

// Circles
API.getCircles = () => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/QjN8ZdavFDqxUjNn3r9cig/AuthenticatedUserTFLists?variables=%7B%7D`, {
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
}
API.getCircleMembers = (id, cursor = null) => {
    return new Promise((resolve, reject) => {
        let variables = {"trustedFriendsId":id,"cursor":cursor, count: 150};
        let features = {"responsive_web_graphql_timeline_navigation_enabled":false};
        fetch(`https://twitter.com/i/api/graphql/i3_opgZeSaeWbfyFQjZ5Sw/TrustedFriendsMembersQuery?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(features))}`, {
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
};
API.trustedFriendsTypeahead = (circle_id, query) => {
    return new Promise((resolve, reject) => {
        let variables = {"trustedFriendsId": circle_id, "prefix": query};
        fetch(`https://twitter.com/i/api/graphql/4lk-D0Y8kfimSyPJjEocsA/TrustedFriendsTypeahead?variables=${encodeURIComponent(JSON.stringify(variables))}`, {
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
};
API.removeUserFromCircle = (circle_id, circle_rest_id, item_id, user_id) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/fl9NbcQB1UE5uiYvEHfHGA/TrustedFriendsAddRemoveButtonRemoveMutation`, {
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
};
API.addUserToCircle = (circle_id, circle_rest_id, user_id) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/QFcDZhljP_e9bzeT8saZ3A/TrustedFriendsAddRemoveButtonAddMutation`, {
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
};

// Topics
API.topicLandingPage = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let variables = {"rest_id": id,"context":"{}","withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true};
        if(cursor) variables.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/4exqISyA1-LejxLHY4RqJA/TopicLandingPage?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":true,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
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
}
API.topicNotInterested = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/cPCFdDAaqRjlMRYInZzoDA/TopicNotInterested`, {
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
};
API.topicUndoNotInterested = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/4tVnt6FoSxaX8L-mDDJo4Q/TopicUndoNotInterested`, {
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
};
API.topicFollow = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/ElqSLWFmsPL4NlZI5e1Grg/TopicFollow`, {
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
};
API.topicUnfollow = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/srwjU6JM_ZKTj_QMfUGNcw/TopicUnfollow`, {
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
};