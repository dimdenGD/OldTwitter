const API = {};

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

API.getTimeline = (since_id) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/home_timeline.json?count=100&include_my_retweet=1&cards_platform=Web13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true${since_id ? `&since_id=${since_id}` : ''}`, {
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
            if(cache && Date.now() - d.discoverData.date < 60000*10) {
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