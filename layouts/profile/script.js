let user = {};
let pageUser = {};
let timeline = {
    data: [],
    dataToUpdate: [],
    toBeUpdated: 0
}
let seenThreads = [];
let averageLikeCount = 1;
let pinnedTweet, followersYouFollow;
let previousLastTweet, stopLoad = false;
let tweetsCursor, favoritesCursor, followingCursor, followersCursor, followersYouKnowCursor, mediaCursor;
let cssEligibleAuto = false, cssEligible = false;

// Util

let subpage;
let user_handle = location.pathname.slice(1).split("?")[0].split('#')[0];
user_handle = user_handle.split('/')[0];
let user_protected = false;
let user_blocked_by = false;
let user_blocking = false;
function updateSubpage() {
    previousLastTweet = undefined; stopLoad = false;
    averageLikeCount = 1;
    user_handle = location.pathname.slice(1).split("?")[0].split('#')[0];
    if(user_handle.split('/').length === 1) {
        subpage = 'profile';
    } else {
        if(user_handle.endsWith('/with_replies')) {
            subpage = 'replies';
        } else if(user_handle.endsWith('/media')) {
            subpage = 'media';
        } else if(user_handle.endsWith('/likes')) {
            subpage = 'likes';
        } else if(user_handle.endsWith('/following')) {
            subpage = 'following';
        } else if(user_handle.endsWith('/followers')) {
            subpage = 'followers';
        } else if(user_handle.endsWith('/followers_you_follow')) {
            subpage = 'followers_you_follow';
        } else if(user_handle.endsWith('/lists')) {
            subpage = 'lists';
        }
    }
    user_handle = user_handle.split('/')[0];
}

function updateSelection() {
    document.getElementById('style-hide-retweets').innerHTML = '';
    document.getElementById('tweet-nav-more-menu-hr').checked = false;
    document.getElementById('tweet-nav-more-menu-hnr').checked = false;
    
    let activeStats = Array.from(document.getElementsByClassName('profile-stat-active'));
    for(let i in activeStats) {
        if(activeStats[i].classList.contains('profile-stat-active')) {
            activeStats[i].classList.remove('profile-stat-active');
        }
    }
    let activeNavs = Array.from(document.getElementsByClassName('tweet-nav-active'));
    for(let i in activeNavs) {
        if(activeNavs[i].classList.contains('tweet-nav-active')) {
            activeNavs[i].classList.remove('tweet-nav-active');
        }
    }

    if(subpage === "profile") {
        document.getElementById('tweet-nav').hidden = false;
        document.getElementById('timeline').hidden = false;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-tweets-link').classList.add('profile-stat-active');
        document.getElementById('tweet-nav-tweets').classList.add('tweet-nav-active');
    } else if(subpage === "likes") {
        document.getElementById('tweet-nav').hidden = false;
        document.getElementById('timeline').hidden = false;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-favorites-link').classList.add('profile-stat-active');
    } else if(subpage === "replies") {
        document.getElementById('tweet-nav').hidden = false;
        document.getElementById('timeline').hidden = false;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-tweets-link').classList.add('profile-stat-active');
        document.getElementById('tweet-nav-replies').classList.add('tweet-nav-active');
    } else if(subpage === "media") {
        document.getElementById('tweet-nav').hidden = false;
        document.getElementById('timeline').hidden = false;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-media-link').classList.add('profile-stat-active');
        document.getElementById('tweet-nav-media').classList.add('tweet-nav-active');
    } else if(subpage === "following") {
        document.getElementById('tweet-nav').hidden = true;
        document.getElementById('timeline').hidden = true;
        document.getElementById('following-list').hidden = false;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = false;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-following-link').classList.add('profile-stat-active');
    } else if(subpage === "followers") {
        document.getElementById('tweet-nav').hidden = true;
        document.getElementById('timeline').hidden = true;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = false;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = false;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-followers-link').classList.add('profile-stat-active');
    } else if(subpage === "followers_you_follow") {
        document.getElementById('tweet-nav').hidden = true;
        document.getElementById('timeline').hidden = true;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = false;
        document.getElementById('followers_you_follow-more').hidden = false;
        document.getElementById('lists-list').hidden = true;

        document.getElementById('profile-stat-followers-link').classList.add('profile-stat-active');
    } else if(subpage === "lists") {
        document.getElementById('tweet-nav').hidden = true;
        document.getElementById('timeline').hidden = true;
        document.getElementById('following-list').hidden = true;
        document.getElementById('followers-list').hidden = true;
        document.getElementById('following-more').hidden = true;
        document.getElementById('followers-more').hidden = true;
        document.getElementById('followers_you_follow-list').hidden = true;
        document.getElementById('followers_you_follow-more').hidden = true;
        document.getElementById('lists-list').hidden = false;
    } 
    document.getElementById('profile-stat-tweets-link').href = `https://twitter.com/${pageUser.screen_name}`;
    document.getElementById('profile-stat-following-link').href = `https://twitter.com/${pageUser.screen_name}/following`;
    document.getElementById('profile-stat-followers-link').href = `https://twitter.com/${pageUser.screen_name}/followers`;
    document.getElementById('profile-stat-favorites-link').href = `https://twitter.com/${pageUser.screen_name}/likes`;
    document.getElementById('profile-stat-media-link').href = `https://twitter.com/${pageUser.screen_name}/media`;
    document.getElementById('tweet-nav-tweets').href = `https://twitter.com/${pageUser.screen_name}`;
    document.getElementById('tweet-nav-replies').href = `https://twitter.com/${pageUser.screen_name}/with_replies`;
    document.getElementById('tweet-nav-media').href = `https://twitter.com/${pageUser.screen_name}/media`;
    document.getElementById('profile-stat-following-mobile').href = `https://twitter.com/${pageUser.screen_name}/following`;
    document.getElementById('profile-stat-followers-mobile').href = `https://twitter.com/${pageUser.screen_name}/followers`;

    if(pageUser.statuses_count === 0 && !( pageUser.blocked_by || pageUser.blocking || pageUser.protected ) && (subpage === 'profile' || subpage === 'replies')) {
        document.getElementById('trends').hidden = true;
        document.getElementById('no-tweets').hidden = false;
        document.getElementById('no-tweets').innerHTML = `
            <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
            <p>${LOC.when_theyll_tweet.message}</p>
        `;
    } else {
        document.getElementById('trends').hidden = false;
        document.getElementById('no-tweets').hidden = true;
        document.getElementById('no-tweets').innerHTML = ``;
    }
}

function updateUserData() {
    return new Promise(async (resolve, reject) => {
        document.getElementsByTagName('title')[0].innerText = `${user_handle} - ` + LOC.twitter.message;
        let [pageUserData, followersYouFollowData, oldUser, u] = await Promise.allSettled([
            API.user.getV2(user_handle),
            API.user.friendsFollowing(user_handle, false),
            API.user.get(user_handle, false),
            API.account.verifyCredentials()
        ]).catch(e => {
            document.getElementById('loading-box').hidden = false;
            if(String(e).includes('User has been suspended.')) {
                return document.getElementById('loading-box-error').innerHTML = `${LOC.user_was_suspended.message}<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
            }
            if(String(e).includes("reading 'result'")) {
                return document.getElementById('loading-box-error').innerHTML = `${LOC.user_was_not_found.message}<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
            }
            return document.getElementById('loading-box-error').innerHTML = `${String(e)}.<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
        });
        if(oldUser.reason) {
            let e = oldUser.reason;
            if(String(e).includes('User has been suspended.')) {
                document.getElementById('loading-box').hidden = false;
                return document.getElementById('loading-box-error').innerHTML = `${LOC.user_was_suspended.message}<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
            }
        }
        if(pageUserData.reason) {
            let e = pageUserData.reason;
            document.getElementById('loading-box').hidden = false;
            if(String(e).includes("reading 'result'")) {
                return document.getElementById('loading-box-error').innerHTML = `${LOC.user_was_not_found.message}<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
            }
            return document.getElementById('loading-box-error').innerHTML = `${String(e)}.<br><a href="https://twitter.com/home">${LOC.go_homepage.message}</a>`;
        }
        followersYouFollowData = followersYouFollowData.value;
        oldUser = oldUser.value;
        u = u.value;
        user = u;
        pageUserData = pageUserData.value;
        //default value
        user_blocked_by = false;
        user_blocking = false;
        user_protected = false;
        if (pageUserData.blocked_by) {
            user_blocked_by = true;
        }
        if (pageUserData.blocking) {
            user_blocking = true;
        }
        if (pageUserData.protected && !pageUserData.following && pageUserData.id_str !== user.id_str) {
            user_protected = true;
        }
        userDataFunction(u);
        const event2 = new CustomEvent('updatePageUserData', { detail: oldUser });
        document.dispatchEvent(event2);
        pageUser = pageUserData;
        pageUser.protected = oldUser.protected;
        let r = document.querySelector(':root');
        let usedProfileColor = vars && vars.linkColor ? vars.linkColor : '#4595B5';
        r.style.setProperty('--link-color', usedProfileColor);
        let sc = makeSeeableColor(oldUser.profile_link_color);
        if(oldUser.profile_link_color && oldUser.profile_link_color !== '1DA1F2') {
            customSet = true;
            r.style.setProperty('--link-color', sc);
            usedProfileColor = oldUser.profile_link_color;
            document.getElementById('color-years-ago').hidden = false;
        } else {
            document.getElementById('color-years-ago').hidden = true;
        }

        const profileLinkColor = document.getElementById('profile-link-color');
        const colorPreviewLight = document.getElementById('color-preview-light');
        const colorPreviewDark = document.getElementById('color-preview-dark');
        const colorPreviewBlack = document.getElementById('color-preview-black');
        const darkModeVars = document.getElementById('dark-mode-vars');
        const lightModeVars = document.getElementById('light-mode-vars');
        const cssTextArea = document.getElementById('profile-css-textarea');

        profileLinkColor.value = `#${usedProfileColor}`;
        profileLinkColor.addEventListener('input', () => {
            let color = profileLinkColor.value;
            if(color.startsWith('#')) color = color.slice(1);
            let sc = makeSeeableColor(color);
            customSet = true;
            r.style.setProperty('--link-color', sc);
            
            colorPreviewLight.style.color = makeSeeableColor(`#${color}`, "#ffffff");
            colorPreviewDark.style.color = makeSeeableColor(`#${color}`, "#1b2836");
            colorPreviewBlack.style.color = makeSeeableColor(`#${color}`, "#000000");
        });

        colorPreviewLight.style.color = makeSeeableColor(`#${usedProfileColor}`, "#ffffff");
        colorPreviewDark.style.color = makeSeeableColor(`#${usedProfileColor}`, "#1b2836");
        colorPreviewBlack.style.color = makeSeeableColor(`#${usedProfileColor}`, "#000000");

        let profileCustomCSSData = {};
        let pccss = await new Promise(resolve => {
            chrome.storage.local.get(["profileCustomCSS"], async data => {
                if(!data.profileCustomCSS) {
                    data.profileCustomCSS = {};
                }
                profileCustomCSSData = data.profileCustomCSS;
                if(data.profileCustomCSS[pageUser.id_str]) {
                    resolve(data.profileCustomCSS[pageUser.id_str]);
                } else {
                    resolve({});
                }
            });
        });
        if(pccss.darkModeVars && isDarkModeEnabled) {
            let vars = parseVariables(pccss.darkModeVars);
            for(let i in vars) {
                r.style.setProperty(i, vars[i]);
            }
        } else if(pccss.lightModeVars && !isDarkModeEnabled) {
            let vars = parseVariables(pccss.lightModeVars);
            for(let i in vars) {
                r.style.setProperty(i, vars[i]);
            }
        } else {
            await switchDarkMode(isDarkModeEnabled);
        }
        if(pccss.css) {
            if(!customCSS) {
                customCSS = document.createElement('style');
                customCSS.id = 'oldtwitter-custom-css';
                document.head.appendChild(customCSS);
            }
            customCSS.innerHTML = pccss.css;
        } else {
            updateCustomCSS();
        }

        getLinkColors(pageUserData.id_str).then(data => {
            let color = data[0];
            if(color) color = color.color;

            if(color && color !== 'none') {
                let sc = makeSeeableColor(color);
                customSet = true;
                r.style.setProperty('--link-color', sc);
                usedProfileColor = color;
            }
            fetch("https://dimden.dev/services/twitter_link_colors/v2/get_data/"+pageUserData.id_str).then(r => r.json()).then(async data => {
                if(data.color !== 'none' && data.color !== '4595b5') {
                    if(data.color !== color) {
                        chrome.storage.local.get(["linkColors"], async lc => {
                            let linkColors = lc.linkColors || {};
                            linkColors[pageUserData.id_str] = data.color;
                            chrome.storage.local.set({ linkColors });
                        });
                        let sc = makeSeeableColor(data.color);
                        customSet = true;
                        usedProfileColor = data.color;
                        r.style.setProperty('--link-color', sc);
                    }
                    let pc = `#${data.color}`;

                    profileLinkColor.value = pc;

                    colorPreviewLight.style.color = makeSeeableColor(pc, "#ffffff");
                    colorPreviewDark.style.color = makeSeeableColor(pc, "#1b2836");
                    colorPreviewBlack.style.color = makeSeeableColor(pc, "#000000");
                }
                chrome.storage.local.get(["adminpass"], async a => {
                    if(a.adminpass) {
                        let adminControls = document.getElementById('admin-controls');
                        if(adminControls) adminControls.remove();
                        adminControls = document.createElement('div');
                        adminControls.id = 'admin-controls';
                        console.log(data.css_eligible);
                        adminControls.innerHTML = `
                            <br>
                            Eligible for custom profile CSS: <span id="admin-css-eligible">${data.css_eligible ? 'yes' : 'no'}</span><br>
                            Can get access automatically: <span id="admin-css-eligible-auto">${data.css_eligible_auto ? 'yes' : 'no'}</span><br>
                            Has custom profile CSS: ${data.css || data.css_vars_dark || data.css_vars_light ? 'yes' : 'no'}<br>
                            Has custom color: ${data.color !== 'none' ? 'yes' : 'no'}<br><br>
                            <button id="admin-controls-switch" style="background-color: var(--menu-bg);border: 1px solid var(--border);color: var(--almost-black);cursor: pointer;">Switch</button>
                            <br><br>
                        `;
                        document.getElementById('about-right').appendChild(adminControls);
                        document.getElementById('admin-controls-switch').addEventListener('click', () => {
                            fetch(`https://dimden.dev/services/twitter_link_colors/v2/admin/switch_access`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    password: a.adminpass,
                                    user: pageUserData.id_str
                                })
                            }).then(r => r.json()).then(data => {
                                if(data.error) {
                                    return alert(data.error);
                                }
                                if(data.eligible) {
                                    document.getElementById('admin-css-eligible').innerText = 'yes';
                                    document.getElementById('admin-css-eligible-auto').innerText = 'no';
                                } else {
                                    document.getElementById('admin-css-eligible').innerText = 'no';
                                    document.getElementById('admin-css-eligible-auto').innerText = 'no';
                                }
                            });
                        });
                    } 
                });
                if(data.css_eligible && !vars.disableProfileCustomizations) {
                    if(pccss.css !== data.css || pccss.darkModeVars !== data.css_vars_dark || pccss.lightModeVars !== data.css_vars_light) {
                        pccss.css = data.css;
                        pccss.darkModeVars = data.css_vars_dark;
                        pccss.lightModeVars = data.css_vars_light;
                        profileCustomCSSData[pageUser.id_str] = pccss;
                        chrome.storage.local.set({ profileCustomCSS: profileCustomCSSData });
                    }
                    let styled = false;
                    if(data.css) {
                        styled = true;
                        profileCSS = true;
                        if(!customCSS) {
                            customCSS = document.createElement('style');
                            customCSS.id = 'oldtwitter-custom-css';
                            document.head.appendChild(customCSS);
                        }
                        customCSS.innerHTML = data.css;
                    } else {
                        profileCSS = false;
                        updateCustomCSS();
                    }
                    if(data.css_vars_dark && isDarkModeEnabled) {
                        styled = true;
                        let vars = parseVariables(data.css_vars_dark);
                        for(let i in vars) {
                            r.style.setProperty(i, vars[i]);
                        }
                    } else if(data.css_vars_light && !isDarkModeEnabled) {
                        styled = true;
                        let vars = parseVariables(data.css_vars_light);
                        for(let i in vars) {
                            r.style.setProperty(i, vars[i]);
                        }
                    } else {
                        await switchDarkMode(isDarkModeEnabled);
                    }
                    if(pageUser.id_str !== user.id_str && styled) {
                        let additionalThing = document.createElement("span");
                        additionalThing.innerHTML = `<a href="https://dimden.dev/ot/custom-css/" target="_blank">${LOC.styled_profile.message}</a>`;
                        additionalThing.className = "profile-additional-thing profile-additional-styled";
                        document.getElementById("profile-additional").appendChild(additionalThing);
                    }
                } else {
                    profileCSS = false;
                    if(profileCustomCSSData[pageUser.id_str]) {
                        delete profileCustomCSSData[pageUser.id_str];
                        chrome.storage.local.set({ profileCustomCSS: profileCustomCSSData });
                    }
                    updateCustomCSS();
                    await switchDarkMode(isDarkModeEnabled);
                }
                if(pageUserData.id_str === user.id_str) {
                    darkModeVars.value = data.css_vars_dark || '';
                    lightModeVars.value = data.css_vars_light || '';
                    cssTextArea.value = data.css || '';
                    cssEligibleAuto = data.css_eligible_auto;
                    cssEligible = data.css_eligible;
                    
                    if(innerWidth > 800 && !vars.acknowledgedCustomizationButton && !data.css && !data.css_vars_dark && !data.css_vars_light) {
                        let profileStyle = document.getElementById('profile-style');
                        if(profileStyle) {
                            let span = document.createElement('span');
                            span.innerText = LOC.style_your_profile.message;
                            span.className = 'style-your-profile';
                            profileStyle.appendChild(span);
                        }
                    }

                    if(data.css_eligible || (data.css_eligible_auto && user.followers_count >= data.auto_requirement)) {
                        document.getElementById('custom-css-eligible').hidden = false;
                        document.getElementById('custom-css-not-eligible').hidden = true;
                        if(!vars.acknowledgedCssAccess && !data.css && !data.css_vars_dark && !data.css_vars_light) {
                            let modal = createModal(`
                                <div style="color:var(--almost-black);max-width:500px">
                                    <h2 class="nice-header">${LOC.profile_custom_css.message}</h2><br>
                                    <span>${LOC.pccss_congrats.message}</span>
                                    <br><br>
                                    <div style="display:inline-block;float: right;">
                                        <button class="nice-button">${LOC.yay.message}</button>
                                    </div>
                                </div>
                            `, 'css-congrats-modal', () => {
                                chrome.storage.sync.set({ acknowledgedCssAccess: true });
                            }, () => false);
                            modal.querySelector('button').addEventListener('click', () => {
                                modal.removeModal();
                            });
                        }
                    } else {
                        document.getElementById('custom-css-eligible').hidden = true;
                        document.getElementById('custom-css-not-eligible').hidden = false;
                    }
                } else {
                    document.getElementById('custom-css-eligible').hidden = true;
                    document.getElementById('custom-css-not-eligible').hidden = true;
                }
            });
        });

        if(pageUser.id_str !== user.id_str) {
            followersYouFollow = followersYouFollowData;
            document.getElementById('profile-friends-text').style.display = 'unset';
        } else {
            followersYouFollow = undefined;
            document.getElementById('profile-friends-text').style.display = 'none';
        }
        renderProfile();
        resolve(u);
    }).catch(e => {
        if (e === "Not logged in") {
            window.location.href = "https://twitter.com/i/flow/login?newtwitter=true";
        }
        console.error(e);
        reject(e);
    });
}

async function updateTimeline() {
    seenThreads = [];
    if (timeline.data.length === 0) document.getElementById('timeline').innerHTML = `
    <div class="loading-data" id="tweets-loader">
        <img src="${chrome.runtime.getURL(`images/loading.svg`)}" width="64" height="64">
    </div>`;
    let tl;
    if(subpage === "likes") {
        let data = await API.user.getFavorites(pageUser.id_str);
        tl = data.tl;
        favoritesCursor = data.cursor;
    } else {
        try {
            if (!user_protected && !user_blocked_by) {
                if (subpage === "media") {
                    tl = await API.user.getMediaTweets(pageUser.id_str);
                    mediaCursor = tl.cursor;
                    tl = tl.tweets;
                } else {
                    tl = await API.user.getTweetsV2(
                        pageUser.id_str,
                        undefined,
                        subpage !== "profile"
                    );
                    pinnedTweet = tl.pinnedTweet;
                    tweetsCursor = tl.cursor;
                    tl = tl.tweets;
                }
            } else if(user_blocked_by) {
                document.getElementById("timeline").innerHTML = `<div dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.blocked_by_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</h2><p style="font-size: 15px;" href="https://twitter.com/${pageUser.screen_name}">${LOC.why_you_cant_see_block_user.message.replaceAll("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                return;
            }else if(user_protected) {
                document.getElementById("timeline").innerHTML = `<div dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.user_protected.message}</h2><p style="font-size: 15px;" href="https://twitter.com/${pageUser.screen_name}">${LOC.follow_to_see.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                return;
            }/*else if(user_blocking) {
                document.getElementById("timeline").innerHTML = `<div dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.you_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</h2><p style="font-size: 15px;" href="https://twitter.com/${pageUser.screen_name}">${LOC.do_you_want_see_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</p><button class="nice-button" id="see-tweet-btn">${LOC.I_want_see_blocked_user.message}</button> </div>`;
                return;
            }*/
        } catch(e) {
            console.error(e);
            document.getElementById('timeline').innerHTML = `<div style="padding: 100px;color: var(--darker-gray);">${escapeHTML(String(e))}</div>`;
            return;
        }
        // if(subpage === 'media') {
        //     tl = tl.filter(t => t.extended_entities && t.extended_entities.media && t.extended_entities.media.length > 0 && !t.retweeted_status);
        // }
    }
    if(tl.error === "Not authorized.") {
        document.getElementById('tweet-nav').hidden = true;
        document.getElementById('loading-box').hidden = true;
        document.getElementById('timeline').innerHTML = pageUser.statuses_count === 0 ? '' : `<div style="padding: 100px;color: var(--darker-gray);">${LOC.timeline_not_authorized.message}</div>`;
        return;
    }
    tl.forEach(t => {
        let oldTweet = timeline.data.find(tweet => tweet.id_str === t.id_str);
        let tweetElement = document.getElementById(`tweet-${t.id_str}`);
        if (oldTweet) {
            oldTweet.favorite_count = t.favorite_count;
            oldTweet.retweet_count = t.retweet_count;
            oldTweet.reply_count = t.reply_count;
            oldTweet.favorited = t.favorited;
            oldTweet.retweeted = t.retweeted;
        }
        if (tweetElement) {
            tweetElement.querySelector('.tweet-interact-favorite ').innerText = formatLargeNumber(t.favorite_count);
            tweetElement.querySelector('.tweet-interact-retweet').innerText = formatLargeNumber(t.retweet_count);
            tweetElement.querySelector('.tweet-interact-reply').innerText = formatLargeNumber(t.reply_count);
            tweetElement.querySelector('.tweet-interact-favorite').classList.toggle('tweet-interact-favorited', t.favorited);
            tweetElement.querySelector('.tweet-interact-retweet').classList.toggle('tweet-interact-retweeted', t.retweeted);
        }
    });
    // first update
    timeline.data = tl;
    averageLikeCount = timeline.data.filter(t => !t.retweeted_status).map(t => t.favorite_count).sort((a, b) => a - b)[Math.floor(timeline.data.length/2)];
    renderTimeline();
    previousLastTweet = timeline.data[timeline.data.length - 1];
}

async function renderFollowing(clear = true, cursor) {
    loadingFollowing = true;
    let userList = document.getElementById('following-list');
    if(clear) {
        if(pageUser.id_str === user.id_str) {
            userList.innerHTML = `
                <h1 class="nice-header">${LOC.following.message}</h1>
                <a href="/old/unfollows/following" style="float: right;font-size: 14px;">${LOC.unfollowings.message}</a>
            `;
        } else {
            userList.innerHTML = `<h1 class="nice-header">${LOC.following.message}</h1>`;
        }
    }
    let following;
    try {
        following = await API.user.getFollowing(pageUser.id_str, cursor);
    } catch(e) {
        loadingFollowing = false;
        followingMoreBtn.innerText = LOC.load_more.message;
        console.error(e);
        return;
    }
    followingCursor = following.cursor;
    following = following.list;
    if(following.length === 0) {
        followingMoreBtn.hidden = true;
    } else {
        followingMoreBtn.hidden = false;
    }
    following.forEach(u => {
        appendUser(u, userList);
    });
    document.getElementById('loading-box').hidden = true;
    loadingFollowing = false;
    followingMoreBtn.innerText = LOC.load_more.message;
}
async function renderFollowers(clear = true, cursor) {
    loadingFollowers = true;
    let userList = document.getElementById('followers-list');
    if(clear) {
        if(pageUser.id_str === user.id_str) {
            userList.innerHTML = `
                <h1 class="nice-header">${LOC.followers.message}</h1>
                <a href="/old/unfollows/followers" style="float: right;font-size: 14px;">${LOC.unfollowers.message}</a>
            `;
        } else {
            userList.innerHTML = `<h1 class="nice-header">${LOC.followers.message}</h1>`;
        }
    }
    let following;
    try {
        following = await API.user.getFollowers(pageUser.id_str, cursor)
    } catch(e) {
        loadingFollowers = false;
        followersMoreBtn.innerText = LOC.load_more.message;
        console.error(e);
        return;
    }
    followersCursor = following.cursor;
    following = following.list;
    if(following.length === 0) {
        followersMoreBtn.hidden = true;
    } else {
        followersMoreBtn.hidden = false;
    }
    following.forEach(u => {
        appendUser(u, userList);
    });
    document.getElementById('loading-box').hidden = true;
    loadingFollowers = false;
    followersMoreBtn.innerText = LOC.load_more.message;
}
async function renderFollowersYouFollow(clear = true, cursor) {
    loadingFollowersYouKnow = true;
    let userList = document.getElementById('followers_you_follow-list');
    if(clear) {
        if(LOC.followers_you_know.message.includes("$NUMBER$")) {
            userList.innerHTML = `<h1 class="nice-header">${LOC.followers_you_know.message.replace("$NUMBER$", followersYouFollow.total_count)}</h1>`;
        } else {
            userList.innerHTML = `<h1 class="nice-header">${followersYouFollow.total_count} ${LOC.followers_you_know.message}</h1>`;
        }
    }
    let following;
    try {
        following = await API.user.getFollowersYouFollow(pageUser.id_str, cursor);
    } catch(e) {
        console.error(e);
        loadingFollowersYouKnow = false;
        followersYouFollowMoreBtn.innerText = LOC.load_more.message;
        return;
    }
    followersYouKnowCursor = following.cursor;
    following = following.list;
    if(following.length === 0) {
        followersYouFollowMoreBtn.hidden = true;
    } else {
        followersYouFollowMoreBtn.hidden = false;
    }
    following.forEach(u => {
        appendUser(u, userList);
    });
    document.getElementById('loading-box').hidden = true;
    loadingFollowersYouKnow = false;
    followersYouFollowMoreBtn.innerText = LOC.load_more.message;
}
async function renderLists() {
    let lists = pageUser.id_str === user.id_str ? await API.list.getMyLists() : await API.user.getLists(pageUser.id_str);
    let listsList = document.getElementById('lists-list');
    listsList.innerHTML = `<h1 class="nice-header">${LOC.lists.message}</h1>`;
    if(pageUser.id_str === user.id_str) {
        listsList.innerHTML += `<h1 class="nice-header" style="float:right;cursor:pointer" id="create-list">${LOC.create_btn.message}</h1>`;
        document.getElementById('create-list').addEventListener('click', () => {
            let modal = createModal(`
                <div id="list-creator">
                    <h1 class="cool-header">${LOC.create_list.message}</h1><br>
                    <span id="list-editor-error" style="color:red"></span><br>
                    ${LOC.name.message}:<br><input maxlength="25" type="text" id="list-name-input"><br><br>
                    ${LOC.description.message}:<br><textarea maxlength="100" type="text" id="list-description-input"></textarea><br>
                    <br>
                    ${LOC.is_private.message}: <input type="checkbox" style="width: 15px;" id="list-private-input"><br>
                    <br>
                    <button class="nice-button" id="list-btn-create">${LOC.create.message}</button> 
                </div>
            `, 'list-creator-modal');
            document.getElementById('list-btn-create').addEventListener('click', async () => {
                let list;
                try {
                    list = await API.list.create(document.getElementById('list-name-input').value, document.getElementById('list-description-input').value, document.getElementById('list-private-input').checked);
                } catch(e) {
                    return document.getElementById('list-editor-error').innerText = e && e.message ? e.message : e;
                }
                location.href = `https://twitter.com/i/lists/${list.id_str}`;
            });
        });
    }
    for(let i in lists) {
        let l = lists[i];
        if(!l) continue;
        let listElement = document.createElement('div');
        listElement.classList.add('list-item');
        listElement.innerHTML = `
            <div>
                <a href="https://twitter.com/i/lists/${l.id_str}" class="following-item-link">
                    <img style="object-fit: cover;" src="${l.custom_banner_media ? l.custom_banner_media.media_info.original_img_url : l.default_banner_media.media_info.original_img_url}" alt="${l.name}" class="following-item-avatar tweet-avatar" width="48" height="48">
                    <div class="following-item-text" style="position: relative;bottom: 12px;">
                        <span class="tweet-header-name following-item-name${l.mode === 'Private' ? ' user-protected' : ''}" style="font-size: 18px;">${escapeHTML(l.name)}</span><br>
                        <span style="color:var(--darker-gray);font-size:14px;margin-top:2px">${l.description ? escapeHTML(l.description).slice(0, 52) : LOC.no_description.message}</span>
                    </div>
                </a>
            </div>
        `;
        listsList.appendChild(listElement);
    }
    document.getElementById('loading-box').hidden = true;
}

let months = [];
let everAddedAdditional = false;
let toAutotranslate = false;
async function renderProfile() {
    document.getElementById('profile-banner').src = pageUser.profile_banner_url ? pageUser.profile_banner_url : 'https://abs.twimg.com/images/themes/theme1/bg.png';
    let attempts = 0;
    document.getElementById('profile-avatar').addEventListener('click', e => {
        openInNewTab(pageUser.profile_image_url_https.replace('_normal.', '.'));
    });
    document.getElementById('profile-avatar').addEventListener('error', () => {
        if(attempts > 3) return document.getElementById('profile-avatar').src = `${vars.useOldDefaultProfileImage ? chrome.runtime.getURL(`images/default_profile_images/default_profile_400x400.png`) : 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'}`;
        attempts++;
        setTimeout(() => {
            document.getElementById('profile-avatar').src = `${(pageUser.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(pageUser.id_str) % 7}_normal.png`): pageUser.profile_image_url_https}`.replace('_normal.', '_400x400.');
        }, 500);
    });
    let autotranslateProfiles = await new Promise(resolve => {
        chrome.storage.sync.get(['autotranslateProfiles'], data => {
            resolve(data.autotranslateProfiles);
        });
    });
    if(!autotranslateProfiles) {
        autotranslateProfiles = [];
    }
    toAutotranslate = autotranslateProfiles.includes(pageUser.id_str);
    document.getElementById('profile-avatar').src = `${(pageUser.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(pageUser.id_str) % 7}_normal.png`): pageUser.profile_image_url_https}`.replace('_normal.', '_400x400.');
    document.getElementById('nav-profile-avatar').src = `${(pageUser.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(pageUser.id_str) % 7}_normal.png`): pageUser.profile_image_url_https}`.replace('_normal.', '_bigger.');
    document.getElementById('profile-name').innerText = pageUser.name.replace(/\n/g, ' ');
    document.getElementById('nav-profile-name').innerText = pageUser.name.replace(/\n/g, ' ');
    if(LOC.tweet_to.message.includes("$SCREEN_NAME$")) {
        document.getElementById('tweet-to').innerText = LOC.tweet_to.message.replace("$SCREEN_NAME$", pageUser.screen_name.replace(/\n/g, ' '));
    } else {
        document.getElementById('tweet-to').innerText = `${LOC.tweet_to.message} ${pageUser.name.replace(/\n/g, ' ')}`;
    }
    if(vars.heartsNotStars) {
        document.getElementById('profile-stat-text-favorites').innerText = LOC.likes.message;
    }
    let stats = Array.from(document.getElementsByClassName('profile-stat'));
    stats.forEach(s => {
        s.classList.toggle('profile-stat-disabled', (pageUser.protected && !pageUser.following) && pageUser.id_str !== user.id_str); //BUG:pageUser.blocked_by works strangly only here...
    });

    document.getElementById('profile-name').className = "";
    if(pageUser.verified || pageUser.verified_type || pageUser.id_str === '1123203847776763904') {
        if(!(!vars.twitterBlueCheckmarks && pageUser.verified_type === "Blue")) document.getElementById('profile-name').classList.add('user-verified');
        if(pageUser.id_str === '1123203847776763904') document.getElementById('profile-name').classList.add('user-verified-green');
        if(vars.twitterBlueCheckmarks && pageUser.verified_type === "Blue") document.getElementById('profile-name').classList.add('user-verified-blue');
        if(pageUser.verified_type === "Government") document.getElementById('profile-name').classList.add('user-verified-gray');
        if(pageUser.verified_type === "Business") document.getElementById('profile-name').classList.add('user-verified-yellow');
    }
    if(pageUser.protected) {
        document.getElementById('profile-name').classList.add('user-protected');
    }
    if(pageUser.muting) {
        document.getElementById('profile-name').classList.add('user-muted');
    }
    document.getElementById('profile-username').innerText = `@${pageUser.screen_name}`;
    document.getElementById('nav-profile-username').innerText = `@${pageUser.screen_name}`;
    document.getElementById('profile-media-text').href = `https://twitter.com/${pageUser.screen_name}/media`;

    updateSelection();

    document.getElementById('profile-bio').innerHTML = escapeHTML(pageUser.description).replace(/\n\n\n\n/g, "\n").replace(/((http|https|ftp):\/\/[\w?=.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`).replace(hashtagRegex, `<a href="https://twitter.com/hashtag/$2">#$2</a>`).replace(/\n/g, '<br>');
    let strippedDownText = pageUser.description
        .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') //links
        .replace(/(?<!\w)@([\w+]{1,15}\b)/g, '') //mentions
        .replace(/[\p{Extended_Pictographic}]/gu, '') //emojis (including ones that arent colored)
        .replace(/[\u200B-\u200D\uFE0E\uFE0F]/g, '') //sometimes emojis leave these behind
        .replace(/\d+/g, '') //numbers
        .trim();
    let detectedLanguage = strippedDownText.length < 1 ? {languages:[{language:LANGUAGE, percentage:100}]} : await chrome.i18n.detectLanguage(strippedDownText);
    if(!detectedLanguage.languages[0]) detectedLanguage = {languages:[{language:LANGUAGE, percentage:100}]};
    let isEnglish = detectedLanguage.languages[0] && detectedLanguage.languages[0].percentage > 60 && detectedLanguage.languages[0].language.startsWith(LANGUAGE);
    let at = false;
    if(!isEnglish) {
        let translateBtn = document.createElement('span');
        translateBtn.className = "translate-bio";
        translateBtn.addEventListener('click', async () => {
            if(at) return;
            at = true;
            let translated = await API.user.translateBio(pageUser.id_str);
            let span = document.createElement('span');
            let translatedMessage;
            if(LOC.translated_from.message.includes("$LANGUAGE$")) {
                translatedMessage = LOC.translated_from.message.replace("$LANGUAGE$", `[${translated.localizedSourceLanguage}]`);
            } else {
                translatedMessage = `${LOC.translated_from.message} [${translated.localizedSourceLanguage}]`;
            }
            span.innerHTML = `
                <br>
                <span class='piu-a'>${translatedMessage}:</span>
                <span>${escapeHTML(translated.translation).replace(/((http|https|ftp):\/\/[\w?=.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`).replace(hashtagRegex, `<a href="https://twitter.com/hashtag/$2">#$2</a>`).replace(/\n/g, '<br>')}</span>
            `;
            translateBtn.hidden = true;
            document.getElementById('profile-bio').append(span);
            let links = Array.from(span.getElementsByTagName('a'));
            links.forEach(link => {
                let realLink = pageUser.entities.description.urls.find(u => u.url === link.href);
                if (realLink) {
                    link.href = realLink.expanded_url;
                    if(!link.href.startsWith('https://twitter.com/')) link.target = '_blank';
                    link.innerText = realLink.display_url;
                }
            });
            if(vars.enableTwemoji) twemoji.parse(span);
        });
        translateBtn.innerText = LOC.translate_bio.message;
        document.getElementById('profile-bio').append(document.createElement('br'), translateBtn);
    }
    
    if(vars.enableTwemoji) twemoji.parse(document.getElementById('profile-name'));
    document.getElementById('profile-stat-tweets-value').innerText = formatLargeNumber(pageUser.statuses_count).replace(/\s/g, ',');
    document.getElementById('profile-stat-following-value').innerText = formatLargeNumber(pageUser.friends_count).replace(/\s/g, ',');
    document.getElementById('profile-stat-followers-value').innerText = formatLargeNumber(pageUser.followers_count).replace(/\s/g, ',');
    document.getElementById('profile-stat-favorites-value').innerText = formatLargeNumber(pageUser.favourites_count).replace(/\s/g, ',');
    document.getElementById('profile-stat-media-value').innerText = formatLargeNumber(pageUser.media_count).replace(/\s/g, ',');

    document.getElementById('profile-stat-following-mobile').innerText = formatLargeNumber(pageUser.friends_count).replace(/\s/g, ',');
    document.getElementById('profile-stat-followers-mobile').innerText = formatLargeNumber(pageUser.followers_count).replace(/\s/g, ',');

    document.getElementById('tweet-nav').hidden = pageUser.statuses_count === 0 || user_blocked_by || user_protected || !(subpage === 'profile' || subpage === 'replies' || subpage === 'media');
    document.getElementById('profile-stat-tweets-link').hidden = pageUser.statuses_count === 0;
    document.getElementById('profile-stat-following-link').hidden = pageUser.friends_count === 0;
    document.getElementById('profile-stat-followers-link').hidden = pageUser.followers_count === 0;
    document.getElementById('profile-stat-favorites-link').hidden = pageUser.favourites_count === 0;
    document.getElementById('profile-stat-media-link').hidden = pageUser.media_count === 0 || !vars.showMediaCount;

    if((pageUser.statuses_count === 0 && (subpage === 'profile' || subpage === 'replies' || subpage === 'media')) || ((pageUser.protected || pageUser.blocked_by)  && !pageUser.following && pageUser.id_str !== user.id_str)) {
        document.getElementById('trends').hidden = true;
        setTimeout(() => {
            let list = document.getElementById('wtf-list');
            while(list.childElementCount > 3) list.removeChild(list.lastChild);
        }, 500);
    } else {
        document.getElementById('trends').hidden = false;   
    }
    if(pageUser.statuses_count === 0 && !( pageUser.blocked_by || pageUser.blocking || pageUser.protected ) && (subpage === 'profile' || subpage === 'replies' || subpage === 'media')) {
        document.getElementById('no-tweets').hidden = false;
        document.getElementById('no-tweets').innerHTML = `
            <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
            <p>${LOC.when_theyll_tweet.message}</p>
        `;
    } else {
        document.getElementById('no-tweets').hidden = true;
        document.getElementById('no-tweets').innerHTML = ``;
    }
    if(pageUser.blocking && !pageUser.blocked_by)  {
        document.getElementById('no-tweets').hidden = false;
        document.getElementById('no-tweets').innerHTML = `<div dir="auto" style="color: var(--darker-gray); font-size: 20px;"><h2>${LOC.you_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</h2><p style="font-size: 15px;" href="https://twitter.com/${pageUser.screen_name}">${LOC.do_you_want_see_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</p><button class="nice-button" id="see-tweet-btn">${LOC.I_want_see_blocked_user.message}</button> </div>`;
        document.getElementById('timeline').hidden = true; 
        document.getElementById('tweet-nav').hidden = true; 
        document.getElementById('see-tweet-btn').addEventListener('click', async () => {
            if(pageUser.statuses_count === 0 && !( pageUser.blocked_by || pageUser.blocking || pageUser.protected ) && (subpage === 'profile' || subpage === 'replies' || subpage === 'media')) {
                document.getElementById('trends').hidden = true;
                document.getElementById('no-tweets').hidden = false;
                document.getElementById('no-tweets').innerHTML = `
                    <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
                    <p>${LOC.when_theyll_tweet.message}</p>
                        `;
            }
            else {
                document.getElementById('no-tweets').hidden = true;
                document.getElementById('no-tweets').innerHTML = ``;
                document.getElementById('timeline').hidden = false; 
                if(!pageUser.protected){
                        document.getElementById('trends').hidden = false;
                        document.getElementById('tweet-nav').hidden = false; 
                }
            }
            
        });
    }

    if(pageUser.followed_by) {
        document.getElementById('follows-you').hidden = false;
    } else {
        document.getElementById('follows-you').hidden = true;
    }

    if(followersYouFollow && followersYouFollow.total_count > 0) {
        let friendsFollowing = document.getElementById('profile-friends-following');
        let friendsFollowingList = document.getElementById('profile-friends-div');
        let friendsFollowingText = document.getElementById('profile-friends-text');
        if(LOC.followers_you_know.message.includes("$NUMBER$")) {
            friendsFollowingText.innerText = LOC.followers_you_know.message.replace("$NUMBER$", followersYouFollow.total_count);
        } else {
            friendsFollowingText.innerText = `${followersYouFollow.total_count} ${LOC.followers_you_know.message}`;
        }
        friendsFollowingText.href = `https://twitter.com/${pageUser.screen_name}/followers_you_follow`;
        friendsFollowingText
        followersYouFollow.users.forEach(u => {
            let a = document.createElement('a');
            a.href = `/${u.screen_name}`;
            let avatar = document.createElement('img');
            avatar.src = `${(u.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(u.id_str) % 7}_normal.png`): u.profile_image_url_https}`.replace('_normal', '_bigger');
            avatar.width = 45;
            avatar.height = 45;
            avatar.title = u.name + ' (@' + u.screen_name + ')';
            avatar.classList.add('profile-friends-avatar');
            a.append(avatar);
            friendsFollowingList.append(a);
        });
        friendsFollowing.hidden = false;
    } else {
        let friendsFollowing = document.getElementById('profile-friends-following');
        friendsFollowing.hidden = true;
    }

    let buttonsElement = document.getElementById('profile-nav-buttons');
    document.getElementById('pin-profile').classList.toggle('menu-active', pageUser.id_str === user.id_str && !location.pathname.includes('/lists'));
    document.getElementById('pin-lists').classList.toggle('menu-active', location.pathname.startsWith(`/${pageUser.screen_name}/lists`));
    let styling = document.getElementById('styling');
    if(pageUser.id_str === user.id_str) {
        buttonsElement.innerHTML = /*html*/`
            <a class="nice-button" id="edit-profile" target="_blank" href="https://twitter.com/settings/profile?newtwitter=true">${LOC.edit_profile.message}</a>
            <button class="profile-additional-thing nice-button" id="profile-style"></button>
        `;
        let profileStyleActive = false;
        let profileStyle = document.getElementById('profile-style');
        profileStyle.addEventListener('click', () => {
            profileStyle.classList.toggle('profile-style-active');
            if(!vars.acknowledgedCustomizationButton) {
                vars.acknowledgedCustomizationButton = true;
                chrome.storage.sync.set({acknowledgedCustomizationButton: true}, () => {});
                if(document.getElementsByClassName("style-your-profile")[0]) document.getElementsByClassName("style-your-profile")[0].hidden = true;
            }
            profileStyleActive = !profileStyleActive;
            styling.hidden = !profileStyleActive;
        });
        chrome.storage.local.get(['otPrivateTokens'], data => {
            document.getElementById('private-profile-warn').hidden = !user.protected || (data.otPrivateTokens && data.otPrivateTokens[user.id_str]);
        });
    } else {
        document.getElementById('private-profile-warn').hidden = true;
        styling.hidden = true;
        document.getElementById('tweet-to-bg').hidden = pageUser.blocked_by? true : false;
        buttonsElement.innerHTML = /*html*/`
            <button ${(pageUser.blocking || pageUser.blocked_by)  ? 'hidden' : ''} class="nice-button ${pageUser.following || pageUser.follow_request_sent ? 'following' : 'follow'} control-btn" id="control-follow">${pageUser.following || (pageUser.protected && pageUser.follow_request_sent) ? ((pageUser.protected && pageUser.follow_request_sent) ? LOC.follow_request_sent.message : LOC.following_btn.message) : LOC.follow.message}</button>
            <button class="nice-button control-btn" id="control-unblock" ${pageUser.blocking ? '' : 'hidden'}>${LOC.unblock.message}</button>
            <a ${pageUser.can_dm && !pageUser.blocking && !pageUser.blocked_by ? '' : 'hidden'} class="nice-button" id="message-user"></a>
        `;
        if(!pageUser.following) {
            pageUser.want_retweets = true;
        }
        let blockUserText, unblockUserText;
        if(LOC.block_user.message.includes('$SCREEN_NAME$') && LOC.unblock_user.message.includes('$SCREEN_NAME$')) {
            blockUserText = `${LOC.block_user.message.replace('$SCREEN_NAME$', pageUser.screen_name)}`;
            unblockUserText = `${LOC.unblock_user.message.replace('$SCREEN_NAME$', pageUser.screen_name)}`;
        } else {
            blockUserText = `${LOC.block_user.message} @${pageUser.screen_name}`;
            unblockUserText = `${LOC.unblock_user.message} @${pageUser.screen_name}`;
        }
        buttonsElement.innerHTML += /*html*/`
            <span class="profile-additional-thing" id="profile-settings"></span>
            <div id="profile-settings-div" class="dropdown-menu" hidden>
                <span ${!pageUser.following || pageUser.blocking ? 'hidden' : ''} id="profile-settings-notifications" class="${pageUser.notifications ? 'profile-settings-offnotifications' : 'profile-settings-notifications'}">${pageUser.notifications ? LOC.stop_notifications.message : LOC.receive_notifications.message}</span>
                <span id="profile-settings-block" class="${pageUser.blocking ? 'profile-settings-unblock' : 'profile-settings-block'}">${pageUser.blocking ? unblockUserText : blockUserText}</span>
                <span ${pageUser.blocking || ((pageUser.protected || pageUser.blocked_by)  && !pageUser.following) ? 'hidden' : ''} id="profile-settings-mute" class="${pageUser.muting ? 'profile-settings-unmute' : 'profile-settings-mute'}">${pageUser.muting ? LOC.unmute.message : LOC.mute.message}</span>
                ${pageUser.followed_by ? /*html*/`<span id="profile-settings-removefollowing">${LOC.remove_from_followers.message}</span>` : ''}
                <span id="profile-settings-lists-action" ${pageUser.blocking || ((pageUser.protected || pageUser.blocked_by)  && !pageUser.following) ? 'hidden' : ''}>${LOC.from_list.message}</span>
                <span id="profile-settings-autotranslate">${toAutotranslate ? LOC.dont_autotranslate.message : LOC.autotranslate_tweets.message}</span>
                <span id="profile-settings-retweets" ${pageUser.following ? '' : 'hidden'}>${pageUser.want_retweets ? LOC.turn_off_retweets.message : LOC.turn_on_retweets.message}</span>
                <hr>
                <span id="profile-settings-lists" ${(pageUser.protected || pageUser.blocked_by) && !pageUser.following ? 'hidden' : ''}>${LOC.see_lists.message}</span>
                <span id="profile-settings-share">${LOC.share_user.message}</span>
                <span id="profile-settings-copy">${LOC.copy_profile_link.message}</span>
                ${vars.developerMode ? /*html*/`<span id="profile-settings-copy-id">${LOC.copy_user_id.message}</span>` : ''}
            </div>
        `;
        let messageUser = document.getElementById('message-user');
        messageUser.addEventListener('click', () => {
            let event = new CustomEvent('messageUser', { detail: { id: `${user.id_str}-${pageUser.id_str}`, user: pageUser } });
            document.dispatchEvent(event);
        });
        let clicked = false;
        let controlFollow = document.getElementById('control-follow');
        controlFollow.addEventListener('click', async () => {
            if (controlFollow.className.includes('following')) {
                try {
                    pageUser.protected && pageUser.follow_request_sent ? await API.user.cancelFollowRequest(pageUser.screen_name) : await API.user.unfollow(pageUser.screen_name);
                } catch(e) {
                    console.error(e);
                    alert(e);
                    return;
                }
                controlFollow.classList.remove('following');
                controlFollow.classList.add('follow');
                controlFollow.innerText = LOC.follow.message;
                pageUser.following = false;
                document.getElementById("profile-settings-retweets").hidden = true;
                if(vars.showExactValues) document.getElementById('profile-stat-followers-value').innerText = Number(parseInt(document.getElementById('profile-stat-followers-value').innerText.replace(/\s/g, '').replace(/,/g, '')) - 1).toLocaleString().replace(/\s/g, ',');
                document.getElementById('profile-settings-notifications').hidden = true;
            } else {
                try {
                    await API.user.follow(pageUser.screen_name);
                } catch(e) {
                    console.error(e);
                    alert(e);
                    return;
                }
                controlFollow.classList.add('following');
                controlFollow.classList.remove('follow');
                controlFollow.innerText = pageUser.protected ? LOC.follow_request_sent.message : LOC.following_btn.message;
                pageUser.following = true;
                if(!pageUser.protected) {
                    document.getElementById('profile-settings-notifications').hidden = false;
                    document.getElementById("profile-settings-retweets").hidden = false;
                    if(vars.showExactValues) document.getElementById('profile-stat-followers-value').innerText = Number(parseInt(document.getElementById('profile-stat-followers-value').innerText.replace(/\s/g, '').replace(/,/g, '')) + 1).toLocaleString().replace(/\s/g, ',');
                }
            }
        });
        document.getElementById('profile-settings-retweets').addEventListener('click', async e => {
            if(pageUser.want_retweets) {
                await API.user.switchRetweetsVisibility(pageUser.id_str, false);
                pageUser.want_retweets = false;
                e.target.innerText = LOC.turn_on_retweets.message;
            } else {
                await API.user.switchRetweetsVisibility(pageUser.id_str, true);
                pageUser.want_retweets = true;
                e.target.innerText = LOC.turn_off_retweets.message;
            }
        });
        document.getElementById("profile-settings").classList.toggle('profile-settings-blocked', pageUser.blocked_by);
        document.getElementById("profile-settings-div").classList.toggle('profile-settings-div-blocked', pageUser.blocked_by);
        document.getElementById('profile-settings').addEventListener('click', () => {
            document.getElementById('profile-settings-div').hidden = false;
            setTimeout(() => {
                if(clicked) return;
                clicked = true;
                document.addEventListener('click', () => {
                    setTimeout(() => {
                        clicked = false;
                        document.getElementById('profile-settings-div').hidden = true;
                    }, 100);
                }, { once: true });
            }, 100);
        });
        document.getElementById('profile-settings-notifications').addEventListener('click', async () => {
            if(!pageUser.notifications) {
                await API.user.receiveNotifications(pageUser.id_str, true);
                pageUser.notifications = true;
                document.getElementById('profile-settings-notifications').classList.remove('profile-settings-notifications');
                document.getElementById('profile-settings-notifications').classList.add('profile-settings-offnotifications');
                document.getElementById('profile-settings-notifications').innerText = LOC.stop_notifications.message;
            } else {
                await API.user.receiveNotifications(pageUser.id_str, false);
                pageUser.notifications = false;
                document.getElementById('profile-settings-notifications').classList.remove('profile-settings-offnotifications');
                document.getElementById('profile-settings-notifications').classList.add('profile-settings-notifications');
                document.getElementById('profile-settings-notifications').innerText = LOC.stop_notifications.message;
            }
        });
        
        
        document.getElementById('profile-settings-block').addEventListener('click', async () => {
            if(pageUser.blocking) {
                await API.user.unblock(pageUser.id_str);
                pageUser.blocking = false;
                document.getElementById('profile-settings-block').classList.remove('profile-settings-unblock');
                document.getElementById('profile-settings-block').classList.add('profile-settings-block');
                if(LOC.block_user.message.includes("$SCREEN_NAME$")) {
                    document.getElementById('profile-settings-block').innerText = LOC.block_user.message.replace("$SCREEN_NAME$", pageUser.screen_name);
                } else {
                    document.getElementById('profile-settings-block').innerText = `${LOC.block_user.message} @${pageUser.screen_name}`;
                }
                document.getElementById('control-unblock').hidden = true;
                if(!pageUser.blocked_by) {
                    document.getElementById('control-follow').hidden = false;
                    document.getElementById("profile-settings-notifications").hidden = false;
                    document.getElementById("profile-settings-mute").hidden = false;
                    document.getElementById('message-user').hidden = !pageUser.can_dm;
                    //enable timeline
                    //recycle no-tweets
                    if(pageUser.statuses_count === 0 && !( pageUser.blocked_by || pageUser.blocking || pageUser.protected ) && (subpage === 'profile' || subpage === 'replies' || subpage === 'media')) {
                        document.getElementById('trends').hidden = true;
                        document.getElementById('no-tweets').hidden = false;
                        document.getElementById('no-tweets').innerHTML = `
                            <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
                            <p>${LOC.when_theyll_tweet.message}</p>
                            `;
                    }
                    else {
                        document.getElementById('trends').hidden = false;
                        document.getElementById('no-tweets').hidden = true;
                        document.getElementById('no-tweets').innerHTML = ``;
                        document.getElementById('timeline').hidden = false; 
                        if(!pageUser.protected)
                            document.getElementById('tweet-nav').hidden = false; 
                    }
                }
            } else {
                let blockMessage;
                if(LOC.block_sure.message.includes("$SCREEN_NAME$")) {
                    blockMessage = LOC.block_sure.message.replace("$SCREEN_NAME$", pageUser.screen_name);
                } else {
                    blockMessage = `${LOC.block_sure.message} @${pageUser.screen_name}?`;
                }
                let blockMessageDesc;
                if(LOC.block_sure_desc.message.includes("$SCREEN_NAME$")) {
                    blockMessageDesc = LOC.block_sure_desc.message.replace("$SCREEN_NAME$", pageUser.screen_name);
                } else {
                    blockMessageDesc = `${LOC.block_sure_desc.message} @${pageUser.screen_name}?`;
                }
                let modal = createModal(`
                <h1 class="cool-header">${blockMessage}</span>
                    <br><br>
                    <span style='font-size:14px;color:var(--almost-black)'>${blockMessageDesc}</h1>
                    <br>
                    <div style="display:inline-block;float: right;margin-top: 5px;">
                        <button class="nice-button nice-red-button">${LOC.block.message}</button>
                    </div>
                `)
                modal.getElementsByClassName('nice-button')[0].addEventListener('click', async () => {
                    await API.user.block(pageUser.id_str);
                    pageUser.blocking = true;
                    document.getElementById('profile-settings-block').classList.add('profile-settings-unblock');
                    document.getElementById('profile-settings-block').classList.remove('profile-settings-block');
                    if(LOC.unblock_user.message.includes("$SCREEN_NAME$")) {
                        document.getElementById('profile-settings-block').innerText = LOC.unblock_user.message.replace("$SCREEN_NAME$", pageUser.screen_name);
                    } else {
                        document.getElementById('profile-settings-block').innerText = `${LOC.unblock_user.message} @${pageUser.screen_name}`;
                    }
                    document.getElementById('control-unblock').hidden = false;
                    document.getElementById('control-follow').hidden = true;
                    document.getElementById('message-user').hidden = true;
                    document.getElementById("profile-settings-notifications").hidden = true;
                    document.getElementById("profile-settings-mute").hidden = true;
                    if(!pageUser.blocked_by) {
                        //disable timeline
                        //recycle no-tweets
                        document.getElementById('no-tweets').hidden = false;
                        document.getElementById('no-tweets').innerHTML = `<div dir="auto" style="color: var(--darker-gray); font-size: 20px;"><h2>${LOC.you_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</h2><p style="font-size: 15px;" href="https://twitter.com/${pageUser.screen_name}">${LOC.do_you_want_see_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</p><button class="nice-button" id="see-tweet-btn">${LOC.I_want_see_blocked_user.message}</button> </div>`;
                        document.getElementById('timeline').hidden = true; 
                        document.getElementById('tweet-nav').hidden = true; 
                        document.getElementById('see-tweet-btn').addEventListener('click', async () => {
                            if(pageUser.statuses_count === 0 && !( pageUser.blocked_by || pageUser.blocking || pageUser.protected ) && (subpage === 'profile' || subpage === 'replies' || subpage === 'media')) {
                                document.getElementById('trends').hidden = true;
                                document.getElementById('no-tweets').hidden = false;
                                document.getElementById('no-tweets').innerHTML = `
                                    <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
                                    <p>${LOC.when_theyll_tweet.message}</p>
                                        `;
                            }
                            else {
                                document.getElementById('no-tweets').hidden = true;
                                document.getElementById('no-tweets').innerHTML = ``;
                                document.getElementById('timeline').hidden = false; 
                                if(!pageUser.protected){
                                        document.getElementById('trends').hidden = false;
                                        document.getElementById('tweet-nav').hidden = false; 
                                }
                            }
                            
                        });
                    }
                    modal.removeModal();
                });
            }
        });
        document.getElementById('control-unblock').addEventListener('click', async () => {
            if(pageUser.blocking) {
                await API.user.unblock(pageUser.id_str);
                pageUser.blocking = false;
                document.getElementById('profile-settings-block').classList.remove('profile-settings-unblock');
                document.getElementById('profile-settings-block').classList.add('profile-settings-block');
                if(LOC.block_user.message.includes("$SCREEN_NAME$")) {
                    document.getElementById('profile-settings-block').innerText = LOC.block_user.message.replace("$SCREEN_NAME$", pageUser.screen_name);
                } else {
                    document.getElementById('profile-settings-block').innerText = `${LOC.block_user.message} @${pageUser.screen_name}`;
                }
                document.getElementById('control-unblock').hidden = true;
                if(!pageUser.blocked_by) {
                    document.getElementById('control-follow').hidden = false;
                    document.getElementById("profile-settings-notifications").hidden = false;
                    document.getElementById("profile-settings-mute").hidden = false;
                    document.getElementById('message-user').hidden = !pageUser.can_dm;
                    //enable timeline
                    //recycle no-tweets
                    if(pageUser.statuses_count === 0 && !( pageUser.blocked_by || pageUser.blocking || pageUser.protected ) && (subpage === 'profile' || subpage === 'replies' || subpage === 'media')) {
                        document.getElementById('trends').hidden = true;
                        document.getElementById('no-tweets').hidden = false;
                        document.getElementById('no-tweets').innerHTML = `
                            <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
                            <p>${LOC.when_theyll_tweet.message}</p>
                            `;
                    }
                    else {
                        document.getElementById('trends').hidden = false;
                        document.getElementById('no-tweets').hidden = true;
                        document.getElementById('no-tweets').innerHTML = ``;
                        document.getElementById('timeline').hidden = false; 
                        if(!pageUser.protected)
                            document.getElementById('tweet-nav').hidden = false; 
                    }
                }
            } else {
            }
           
           
        });
        document.getElementById('profile-settings-autotranslate').addEventListener('click', async () => {
            let autotranslateProfiles = await new Promise(resolve => {
                chrome.storage.sync.get(['autotranslateProfiles'], data => {
                    resolve(data.autotranslateProfiles);
                });
            });
            if(!autotranslateProfiles) {
                autotranslateProfiles = [];
            }
            if(autotranslateProfiles.includes(pageUser.id_str)) {
                autotranslateProfiles.splice(autotranslateProfiles.indexOf(pageUser.id_str), 1);
                document.getElementById('profile-settings-autotranslate').innerText = LOC.dont_autotranslate.message;
                toAutotranslate = false;
            } else {
                autotranslateProfiles.push(pageUser.id_str);
                document.getElementById('profile-settings-autotranslate').innerText = LOC.autotranslate_tweets.message;
                toAutotranslate = true;
            }
            chrome.storage.sync.set({ autotranslateProfiles });
            setTimeout(() => {
                location.reload();
            }, 100)
        });
        document.getElementById('profile-settings-mute').addEventListener('click', async () => {
            if(pageUser.muting) {
                await API.user.unmute(pageUser.id_str);
                pageUser.muting = false;
                document.getElementById('profile-settings-mute').classList.remove('profile-settings-unmute');
                document.getElementById('profile-settings-mute').classList.add('profile-settings-mute');
                document.getElementById('profile-settings-mute').innerText = LOC.mute.message;
                document.getElementById('profile-name').classList.remove('user-muted');
            } else {
                await API.user.mute(pageUser.id_str);
                pageUser.muting = true;
                document.getElementById('profile-settings-mute').classList.add('profile-settings-unmute');
                document.getElementById('profile-settings-mute').classList.remove('profile-settings-mute');
                document.getElementById('profile-settings-mute').innerText = LOC.unmute.message;
                document.getElementById('profile-name').classList.add('user-muted');
            }
        });
        if(document.getElementById('profile-settings-removefollowing')) document.getElementById('profile-settings-removefollowing').addEventListener('click', async () => {
            let modal = createModal(`
            <h1 class="cool-header">${LOC.remove_from_followers_sure.message}</h1><br>
            <span style='font-size:14px;color:var(--almost-black)'>
            ${LOC.able_in_future.message}
            <br><br>
            ${LOC.remove_from_followers_warn.message}
            </span>
                <br><br>
                <div style="display:inline-block;float: right;margin-top: 5px;">
                    <button class="nice-button nice-red-button">${LOC.remove_from_followers_button.message}</button>
                </div>
            `.replace('$SCREEN_NAME$', pageUser.screen_name));
            modal.getElementsByClassName('nice-button')[0].addEventListener('click', async () => {
                await API.user.removeFollower(pageUser.id_str);
                pageUser.followed_by = false;
                document.getElementById('profile-settings-removefollowing').hidden = true;
                document.getElementById('follows-you').hidden = true;
                modal.removeModal();
            });
        });
        document.getElementById('profile-settings-lists-action').addEventListener('click', async () => {
            let lists = await API.list.getOwnerships(user.id_str, pageUser.id_str);
            let modal = createModal(`
                <h1 class="cool-header">${LOC.from_list.message}</h1>
                <div id="modal-lists"></div>
            `);
            let container = document.getElementById('modal-lists');
            for(let i in lists) {
                let l = lists[i];
                let listElement = document.createElement('div');
                listElement.classList.add('list-item');
                listElement.innerHTML = `
                    <div style="display:inline-block;">
                        <a href="https://twitter.com/i/lists/${l.id_str}" class="following-item-link">
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
                        await API.list.removeMember(l.id_str, pageUser.id_str);
                        l.is_member = false;
                        listElement.getElementsByClassName('nice-button')[0].innerText = LOC.add.message;
                    } else {
                        await API.list.addMember(l.id_str, pageUser.id_str);
                        l.is_member = true;
                        listElement.getElementsByClassName('nice-button')[0].innerText = LOC.remove.message;
                    }
                    l.is_member = !l.is_member;
                });
            }
        });
        document.getElementById('profile-settings-lists').addEventListener('mousedown', e => {
            if(e.button === 1) {
                openInNewTab(`https://twitter.com/${pageUser.screen_name}/lists`);
            }
        });
        document.getElementById('profile-settings-lists').addEventListener('click', async () => {
            // document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `https://twitter.com/${pageUser.screen_name}/lists`);
            everAddedAdditional = false;
            mediaToUpload = [];
            document.getElementById('profile-media-div').innerHTML = '';
            document.getElementById('tweet-to-bg').hidden = true;
            document.getElementById('profile-additional').innerHTML = '';
            document.getElementById('profile-friends-div').innerHTML = '';
            updateSubpage();
            updateSelection();
            renderLists();
        });
        document.getElementById('profile-settings-share').addEventListener('click', async () => {
            navigator.share({ url: `https://twitter.com/${pageUser.screen_name}` });
        });
        document.getElementById('profile-settings-copy').addEventListener('click', async () => {
            navigator.clipboard.writeText(`https://twitter.com/${pageUser.screen_name}`);
        });
        if(document.getElementById('profile-settings-copy-id')) document.getElementById('profile-settings-copy-id').addEventListener('click', async () => {
            navigator.clipboard.writeText(pageUser.id_str);
        });
    }

    let links = Array.from(document.getElementById('profile-bio').getElementsByTagName('a'));
    links.forEach(link => {
        let realLink = pageUser.entities.description.urls.find(u => u.url === link.href);
        if (realLink) {
            link.href = realLink.expanded_url;
            if(!link.href.startsWith('https://twitter.com/')) link.target = '_blank';
            link.innerText = realLink.display_url;
        }
    });

    if(everAddedAdditional) return;
    everAddedAdditional = true;
    let additionalInfo = document.getElementById('profile-additional');
    if(pageUser.location) {
        let location = document.createElement('span');
        location.classList.add('profile-additional-thing', 'profile-additional-location');
        location.innerText = pageUser.location.replace(/\n\n\n\n/g, "\n");
        additionalInfo.appendChild(location);
        if(vars.enableTwemoji) twemoji.parse(location);
    }
    if(pageUser.affiliates_highlighted_label) {
        let aff = document.createElement('span');
        aff.classList.add('profile-additional-thing', 'profile-additional-affiliates');
        aff.innerHTML = `
            <img style="display: inline-block;vertical-align: top;image-rendering: pixelated;" src="${pageUser.affiliates_highlighted_label.badge.url}" width="20" height="20"> 
            <a style="color:var(--almost-black)!important" href="${pageUser.affiliates_highlighted_label.url ? pageUser.affiliates_highlighted_label.url.url : '#'}">${pageUser.affiliates_highlighted_label.description}</a>
        `;
        additionalInfo.appendChild(aff);
    }
    if(pageUser.url) {
        let url = document.createElement('a');
        url.classList.add('profile-additional-thing', 'profile-additional-url');
        let realUrl = pageUser.entities.url.urls[0];
        url.innerText = realUrl.display_url;
        url.href = realUrl.expanded_url;
        if(!url.href.startsWith('https://twitter.com/')) url.target = "_blank";
        additionalInfo.appendChild(url);
    }
    if(pageUser.professional && pageUser.professional.category && pageUser.professional.category[0]) {
        let prof = document.createElement('span');
        prof.classList.add('profile-additional-thing', 'profile-additional-professional');
        prof.innerText = pageUser.professional.category[0].name;
        additionalInfo.appendChild(prof);
        if(vars.enableTwemoji) twemoji.parse(prof);
    }
    let joined = document.createElement('span');
    joined.classList.add('profile-additional-thing', 'profile-additional-joined');
    joined.innerText = `${LOC.joined.message} ${new Date(pageUser.created_at).toLocaleDateString(LANGUAGE.replace("_", "-"), {month: 'long', year: 'numeric', day: 'numeric'})}`;
    additionalInfo.appendChild(joined);
    if(pageUser.birthdate) {
        let birth = document.createElement('span');
        birth.classList.add('profile-additional-thing', 'profile-additional-birth');
        if(user.id_str === pageUser.id_str) {
            birth.classList.add('profile-additional-birth-me');
        }
        if(pageUser.birthdate.year && typeof pageUser.birthdate.month === 'number') {
            birth.innerText = `${LOC.born.message} ${LOC.mmddyy.message.replace('$YEAR$',pageUser.birthdate.year).replace('$MONTH$',months[pageUser.birthdate.month-1]).replace("$DATE$", pageUser.birthdate.day)}`;
        } else if(typeof pageUser.birthdate.month === 'number') {
            birth.innerText = `${LOC.born.message}  ${LOC.ddyy.message.replace('$MONTH$',months[pageUser.birthdate.month-1]).replace("$DATE$", pageUser.birthdate.day)}`;
        } else if(pageUser.birthdate.year) {
            birth.innerText = `${LOC.born.message} ${LOC.yyyy.message.replace('$YEAR$',pageUser.birthdate.year)}`;
        }
        let date = new Date();
        if(pageUser.birthdate.month-1 === date.getMonth() && pageUser.birthdate.day === date.getDate()) {
            birth.innerText += ' ' + LOC.birthday_today.message;
            birth.classList.add('profile-additional-birth-today');
        }
        additionalInfo.appendChild(birth);
    }

    setTimeout(() => {
        document.getElementById('loading-box').hidden = true;
    }, 10);
};

async function renderTimeline(append = false, sliceAmount = 0) {
    let timelineContainer = document.getElementById('timeline');
    if(!append) timelineContainer.innerHTML = '';
    let data = timeline.data.slice(sliceAmount, timeline.data.length);;
    if(pinnedTweet && subpage === "profile" && !append) await appendTweet(pinnedTweet, timelineContainer, {
        top: {
            text: LOC.pinned_tweet.message,
            icon: "\uf003",
            color: "var(--link-color)",
            class: 'pinned'
        },
        bigFont: false
    })
    for(let i in data) {
        let t = data[i];
        if(!t) continue;
        if(pinnedTweet && t.id_str === pinnedTweet.id_str) continue;
        if (t.retweeted_status) {
            if(pageUser.id_str === user.id_str) t.retweeted_status.current_user_retweet = t;
            await appendTweet(t.retweeted_status, timelineContainer, {
                top: {
                    text: `<a href="https://twitter.com/${t.user.screen_name}">${escapeHTML(t.user.name)}</a> ${LOC.retweeted.message}`,
                    icon: "\uf006",
                    color: "#77b255",
                    class: 'retweet-label'
                }
            });
        } else {
            if (t.self_thread) {
                let selfThreadTweet = timeline.data.find(tweet => tweet.id_str === t.self_thread.id_str);
                if (selfThreadTweet && selfThreadTweet.id_str !== t.id_str && seenThreads.indexOf(selfThreadTweet.id_str) === -1) {
                    await appendTweet(selfThreadTweet, timelineContainer, {
                        selfThreadContinuation: true,
                        bigFont: selfThreadTweet.favorite_count > averageLikeCount*1.2 && selfThreadTweet.favorite_count > 3 && (!selfThreadTweet.full_text || selfThreadTweet.full_text.length < 250)
                    });
                    await appendTweet(t, timelineContainer, {
                        noTop: true,
                        bigFont: t.favorite_count > averageLikeCount*1.2 && t.favorite_count > 3 && (!t.full_text || t.full_text.length < 250)
                    });
                    seenThreads.push(selfThreadTweet.id_str);
                } else {
                    await appendTweet(t, timelineContainer, {
                        selfThreadButton: true,
                        bigFont: t.favorite_count > averageLikeCount*1.2 && t.favorite_count > 3 && (!t.full_text || t.full_text.length < 250)
                    });
                }
            } else {
                await appendTweet(t, timelineContainer, {
                    bigFont: t.favorite_count > averageLikeCount*1.2 && t.favorite_count > 3 && (!t.full_text || t.full_text.length < 250)
                });
            }
        }
    };
    document.getElementById('loading-box').hidden = true;
    loadingNewTweets = false;
    return true;
}
function renderNewTweetsButton() {
    if (timeline.toBeUpdated > 0) {
        document.getElementById('new-tweets').hidden = false;
        document.getElementById('new-tweets').innerText = LOC.see_new_tweets.message;
    } else {
        document.getElementById('new-tweets').hidden = true;
    }
}

document.addEventListener('clearActiveTweet', () => {
    if(activeTweet) {
        activeTweet.classList.remove('tweet-active');
    }
    activeTweet = undefined;
});
document.addEventListener('findActiveTweet', () => {
    let tweets = Array.from(document.getElementsByClassName('tweet'));
    if(activeTweet) {
        activeTweet.classList.remove('tweet-active');
    }
    let scrollPoint = scrollY + innerHeight/2;
    activeTweet = tweets.find(t => scrollPoint > t.offsetTop && scrollPoint < t.offsetTop + t.offsetHeight);
    if(activeTweet) {
        activeTweet.classList.add('tweet-active');
    }
});
let loadingNewTweets = true;
let tweetsToLoad = {};
let lastScroll = Date.now();
let loadingFollowing = false;
let loadingFollowers = false;
let loadingFollowersYouKnow = false;
let followingMoreBtn, followersMoreBtn, followersYouFollowMoreBtn;

setTimeout(async () => {
    if(!vars) {
        await loadVars();
    }
    while(!LOC || !LOC.january) {
        await sleep(10);
    }
    months = [LOC.january.message, LOC.february.message, LOC.march.message, LOC.april.message, LOC.may.message, LOC.june.message, LOC.july.message, LOC.august.message, LOC.september.message, LOC.october.message, LOC.november.message, LOC.december.message];

    // weird bug
    if(!document.getElementById('new-tweets')) {
        return setTimeout(() => location.reload(), 500);
    }
    try {
        document.getElementById('new-tweets').addEventListener('click', () => {
            timeline.toBeUpdated = 0;
            timeline.data = timeline.dataToUpdate;
            timeline.dataToUpdate = [];
            renderNewTweetsButton();
            renderTimeline();
        });
    } catch(e) {
        setTimeout(() => location.reload(), 500);
        console.error(e);
        return;
    }

    // mouse
    let banner = document.getElementById('profile-banner');
    let navProfileInfo = document.getElementById('nav-profile-info');
    let tweetsLink = document.getElementById('profile-stat-tweets-link');
    let lastScrollAmount = window.scrollY;
    if(innerWidth < 590) document.getElementById('nav-profile-name').addEventListener('click', e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        window.scrollTo(0, 0);
    })
    document.addEventListener('scroll', async () => {
        lastScroll = Date.now();

        // make user nav appear
        if(window.scrollY >= 600) {
            if(!navProfileInfo.style.opacity) {
                if(lastScrollAmount > window.scrollY) {
                    navProfileInfo.style.opacity = 1;
                    if(innerWidth < 360) tweetsLink.style.opacity = 1;
                } else {
                    navProfileInfo.style.opacity = '';
                    if(innerWidth < 360) tweetsLink.style.opacity = 0;
                }
            } else {
                if(lastScrollAmount > window.scrollY) {
                    navProfileInfo.style.opacity = 1;
                    if(innerWidth < 360) tweetsLink.style.opacity = 1;
                } else {
                    navProfileInfo.style.opacity = '';
                    if(innerWidth < 360) tweetsLink.style.opacity = 0;
                }
            }
        } else {
            if(navProfileInfo.style.opacity) {
                navProfileInfo.style.opacity = '';
                if(innerWidth < 360) tweetsLink.style.opacity = 1;
            }
        }
        lastScrollAmount = window.scrollY;
        
        // banner scroll
        banner.style.top = `${5+Math.min(window.scrollY/4, 470/4)}px`;
    
        // load more stuff
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            if(subpage === 'following') {
                if(!loadingFollowing) followingMoreBtn.click();
                return;
            }
            if(subpage === 'followers') {
                if(!loadingFollowers) followersMoreBtn.click();
                return;
            }
            if(subpage === 'followers_you_follow') {
                if(!loadingFollowersYouKnow) followersYouFollowMoreBtn.click();
                return;
            }
            if (loadingNewTweets || timeline.data.length === 0 || stopLoad) return;
            loadingNewTweets = true;
            let tl;
            try {
                if (!user_protected && !user_blocked_by) {
                    if(subpage === "likes") {
                        let data = await API.user.getFavorites(pageUser.id_str, favoritesCursor);
                        tl = data.tl;
                        favoritesCursor = data.cursor;
                    } else {
                        if(subpage === 'media') {
                            tl = await API.user.getMediaTweets(pageUser.id_str, mediaCursor);
                            mediaCursor = tl.cursor;
                            tl = tl.tweets;
                        } else {
                            tl = await API.user.getTweetsV2(pageUser.id_str, tweetsCursor, subpage !== 'profile');
                            tweetsCursor = tl.cursor;
                            tl = tl.tweets;
                        }
                    }
                } else if (user_blocked_by)  {
                    document.getElementById("timeline").innerHTML = `<div dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.blocked_by_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</h2><p style="font-size: 15px;" href="https://twitter.com/${pageUser.screen_name}">${LOC.why_you_cant_see_block_user.message.replaceAll("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                    return;
                } else if (user_protected) {
                    document.getElementById("timeline").innerHTML = `<div dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.user_protected.message}</h2><p style="font-size: 15px;" href="https://twitter.com/${pageUser.screen_name}">${LOC.follow_to_see.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                    return;
                } /*else if (user_blocking)  {
                  document.getElementById("timeline").innerHTML = `<div dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.you_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</h2><p style="font-size: 15px;" href="https://twitter.com/${pageUser.screen_name}">${LOC.do_you_want_see_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</p><button class="nice-button" id="see-tweet-btn">${LOC.I_want_see_blocked_user.message}</button> </div>`;
                
                    return;
                }*/
            } catch (e) {
                console.error(e);
                loadingNewTweets = false;
                return;
            }
            let originalLength = timeline.data.length;
            timeline.data = timeline.data.concat(tl);
            averageLikeCount = timeline.data.filter(t => !t.retweeted_status).map(t => t.favorite_count).sort((a, b) => a - b)[Math.floor(timeline.data.length/2)];
            if(subpage === 'profile') {
                if(!tweetsCursor) {
                    stopLoad = true;
                }
            } else {
                if(previousLastTweet && previousLastTweet.id_str === timeline.data[timeline.data.length - 1].id_str) return stopLoad = true;
            }
            previousLastTweet = timeline.data[timeline.data.length - 1];
            await renderTimeline(true, originalLength);
        }
    }, { passive: true });
    // document.addEventListener('mousemove', e => {
    //     if(Date.now() - lastScroll > 10) {
    //         let t = e.target;
    //         if(t.className.includes('tweet ') || t.className === 'tweet-interact' || t.className === 'tweet-body' || t.className === 'tweet-media') {
    //             if(t.className === 'tweet-interact' || t.className === 'tweet-media') t = t.parentElement.parentElement;
    //             else if(t.className === 'tweet-body') t = t.parentElement;
    //             let id = t.className.split('id-')[1];
    //             if(!id) return;
    //             id = id.split(' ')[0];
    //             if(!tweetsToLoad[id]) tweetsToLoad[id] = 1;
    //             else tweetsToLoad[id]++;
    //             if(tweetsToLoad[id] === 15) {
    //                 API.tweet.getRepliesV2(id);
    //                 API.tweet.getLikers(id);
    //                 t.classList.add('tweet-preload');
    //                 console.log(`Preloading ${id}`);
    //             }
    //         }
    //     }
    // });

    // buttons
    document.getElementById('tweet-to').addEventListener('click', () => {
        document.getElementById('navbar-tweet-button').click();
        setTimeout(() => {
            document.getElementsByClassName('navbar-new-tweet-text')[0].value = `@${pageUser.screen_name} `;
        }, 10);
    });
    let tweetNavMoreMenu = document.getElementById('tweet-nav-more-menu');
    let tweetNavClicked = false;
    let tweetNavMoreMenuHR = document.getElementById('tweet-nav-more-menu-hr');
    let tweetNavMoreMenuHNR = document.getElementById('tweet-nav-more-menu-hnr');
    document.getElementById('tweet-nav-more').addEventListener('click', () => {
        if (tweetNavMoreMenu.hidden) {
            tweetNavMoreMenu.hidden = false;
            if(subpage === 'replies') {
                tweetNavMoreMenu.style.height = '77px';
                tweetNavMoreMenuHNR.hidden = false;
                document.getElementById('tweet-nav-more-menu-hnr-label').hidden = false;
            }
        }
        if(tweetNavClicked) return;
        tweetNavClicked = true;
        setTimeout(() => {
            function closeMenu(e) {
                if(e.target.closest('#tweet-nav-more-menu')) {
                    return;
                }
                tweetNavClicked = false;
                setTimeout(() => {
                    tweetNavMoreMenu.hidden = true;
                    tweetNavMoreMenu.style.height = '';
                    tweetNavMoreMenuHNR.hidden = true;
                    document.getElementById('tweet-nav-more-menu-hnr-label').hidden = true;
                }, 50);
                document.body.removeEventListener('click', closeMenu);
            }
            document.body.addEventListener('click', closeMenu);
        }, 50);
    });
    function updateHideStyle() {
        let style = '';
        if(tweetNavMoreMenuHR.checked) {
            style += `.tweet-top-retweet-label { display: none !important; }`;
        }
        if(tweetNavMoreMenuHNR.checked) {
            style += `.tweet-non-reply { display: none !important; }`;
        }
        document.getElementById('style-hide-retweets').innerHTML = style;
    }
    tweetNavMoreMenuHR.addEventListener('change', updateHideStyle);
    tweetNavMoreMenuHNR.addEventListener('change', updateHideStyle);
    document.getElementById('wtf-refresh').addEventListener('click', async () => {
        renderDiscovery(false);
    });
    followingMoreBtn = document.getElementById('following-more');
    followingMoreBtn.addEventListener('click', async e => {
        if(!followingCursor || loadingFollowing) return;
        e.target.innerText = LOC.loading.message;
        renderFollowing(false, followingCursor);
    });
    followersMoreBtn = document.getElementById('followers-more');
    followersMoreBtn.addEventListener('click', async e => {
        if(!followersCursor || loadingFollowers) return;
        e.target.innerText = LOC.loading.message;
        renderFollowers(false, followersCursor);
    });
    followersYouFollowMoreBtn = document.getElementById('followers_you_follow-more');
    followersYouFollowMoreBtn.addEventListener('click', async e => {
        if(!followersYouKnowCursor || loadingFollowersYouKnow) return;
        e.target.innerText = LOC.loading.message;
        renderFollowersYouFollow(false, followersYouKnowCursor);
    });
    function updatePath(e) {
        if(e.target.closest('.tweet-nav-active') || e.target.classList.contains('profile-stat-active') || e.target.closest('.profile-stat-disabled')) {
            return e.preventDefault();
        }
        e.preventDefault();
        let el = e.target;
        if(!el) return;
        if(!el.href) el = el.parentElement;
        history.pushState({}, null, el.href);
        updateSubpage();
        updateSelection();
        timeline = {
            data: [],
            dataToUpdate: [],
            toBeUpdated: 0
        }
        seenThreads = [];
        pinnedTweet = undefined;
        tweetsCursor = undefined;
        favoritesCursor = undefined;
        followersCursor = undefined;
        followingCursor = undefined;
        followersYouKnowCursor = undefined;
        mediaCursor = undefined;
        if(window.scrollY > 400) window.scrollTo(0, 400);
        if(subpage === 'following') {
            renderFollowing();
        } else if(subpage === 'followers') {
            renderFollowers();
        } else if(subpage === 'followers_you_follow') {
            renderFollowersYouFollow();
        } else if(subpage === 'lists') {
            renderLists();
        } else {
            loadingNewTweets = true;
            updateTimeline();
        }
    }
    document.getElementById('tweet-nav-tweets').addEventListener('click', updatePath);
    document.getElementById('tweet-nav-replies').addEventListener('click', updatePath);
    document.getElementById('tweet-nav-media').addEventListener('click', updatePath);
    if(document.getElementById('profile-media-text')) document.getElementById('profile-media-text').addEventListener('click', updatePath);
    document.getElementById('profile-stat-tweets-link').addEventListener('click', updatePath);
    document.getElementById('profile-stat-following-link').addEventListener('click', updatePath);
    document.getElementById('profile-stat-followers-link').addEventListener('click', updatePath);
    document.getElementById('profile-stat-favorites-link').addEventListener('click', updatePath);
    document.getElementById('profile-stat-media-link').addEventListener('click', updatePath);
    document.getElementById('profile-friends-text').addEventListener('click', updatePath);
    document.addEventListener('click', async e => {
        let el = e.target;
        if(!el) return;
        if(el.tagName !== 'A') el = el.closest('a');
        if(!el) return;
        if(el.tagName === "A") {
            let path;
            try {
                let url = new URL(el.href);
                path = url.pathname;
                if(url.hostname !== 'twitter.com') return;
            } catch(e) {
                return;
            }
            if(/^\/[A-z-0-9-_]{1,15}$/.test(path) && ["/home", "/", "/notifications", "/messages", "/settings", "/search", "/explore", "/login", "/register", "/logout"].indexOf(path) === -1) {
                if(document.querySelector(".modal")) return;
                e.preventDefault();
                window.scrollTo(0, 0);
                mediaToUpload = [];
                loadingNewTweets = true;
                document.getElementById('loading-box').hidden = false;
                everAddedAdditional = false;
                document.getElementById('timeline').innerHTML = `
                <div class="loading-data" id="tweets-loader">
                    <img src="${chrome.runtime.getURL(`images/loading.svg`)}" width="64" height="64">
                </div>`;
                document.getElementById('profile-media-div').innerHTML = '';
                document.getElementById('tweet-to-bg').hidden = true;
                document.getElementById('profile-additional').innerHTML = '';
                document.getElementById('profile-friends-div').innerHTML = '';
                history.pushState({}, null, `https://twitter.com/${path.substring(1)}`);
                updateSubpage();
                updateSelection();
                await updateUserData();
                updateTimeline();
                renderDiscovery();
            }
        }
    });
    window.addEventListener("popstate", async () => {
        if(document.querySelector('.tweet-viewer')) return;
        if(notificationsOpened) return;
        
        let path = location.pathname;
        if(path.endsWith("/")) path = path.substring(0, path.length - 1);
        if(isProfilePath(path) || (path.split('/').length === 3 && location.pathname.endsWith('/following') || location.pathname.endsWith('/followers') || location.pathname.endsWith('/followers_you_follow') || location.pathname.endsWith('/lists') || location.pathname.endsWith('/media') || location.pathname.endsWith('/likes') || location.pathname.endsWith('/with_replies'))) {
            document.getElementById('loading-box').hidden = false;
            everAddedAdditional = false;
            loadingNewTweets = true;
            mediaToUpload = [];
            document.getElementById('profile-media-div').innerHTML = '';
            document.getElementById('tweet-to-bg').hidden = true;
            document.getElementById('profile-additional').innerHTML = '';
            document.getElementById('profile-friends-div').innerHTML = '';
            updateSubpage();
            updateSelection();
            document.getElementById('timeline').innerHTML = '';
            await updateUserData();
            updateTimeline();
            renderDiscovery();
        }
    });

    document.getElementById('user-search-input').addEventListener('keydown', e => {
        if(e.key === 'Enter') {
            document.getElementById('user-search-icon').click();
        }
    });
    document.getElementById('user-search-icon').addEventListener("click", () => {
        document.getElementById('search-input').value = document.getElementById('user-search-input').value + ` from:${pageUser.screen_name}`;
        document.getElementById('search-icon').click();
    })

    let mediaDiv = document.getElementById('profile-media-div');
    let mediaText = document.getElementById('profile-media-text');
    let mediaObserver = new MutationObserver(() => {
        mediaText.hidden = mediaDiv.childElementCount === 0;
    })
    mediaObserver.observe(mediaDiv, {
        childList: true
    });
    
    // Update dates every minute
    setInterval(() => {
        let tweetDates = Array.from(document.getElementsByClassName('tweet-time'));
        let tweetQuoteDates = Array.from(document.getElementsByClassName('tweet-time-quote'));
        let all = [...tweetDates, ...tweetQuoteDates];
        all.forEach(date => {
            date.innerText = timeElapsed(+date.dataset.timestamp);
        });
    }, 60000);
    
    // Custom events
    document.addEventListener('newTweet', e => {
        if(pageUser.id_str === user.id_str) {
            let tweet = e.detail;
            if(pinnedTweet) {
                let firstTweet = document.getElementById('timeline').firstChild;
                appendTweet(tweet, document.getElementById('timeline'), { after: firstTweet, disableAfterReplyCounter: true, bigFont: tweet.favorite_count > averageLikeCount*1.2 && tweet.favorite_count > 3 });
            } else {
                appendTweet(tweet, document.getElementById('timeline'), { prepend: true, bigFont: tweet.favorite_count > averageLikeCount*1.2 && tweet.favorite_count > 3 });
            }
        }
    });

    // Customization
    let r = document.querySelector(':root');
    let profileLinkColor = document.getElementById('profile-link-color');
    let colorSyncButton = document.getElementById('color-sync-button');
    let cssSyncButton = document.getElementById('css-sync-button');
    let cssLoadButton = document.getElementById('css-load-button');
    let darkModeVars = document.getElementById('dark-mode-vars');
    let lightModeVars = document.getElementById('light-mode-vars');
    let cssTextArea = document.getElementById('profile-css-textarea');
    let saveDraft = document.getElementById('save-draft');
    let loadDraft = document.getElementById('load-draft');

    darkModeVars.addEventListener('change', async () => {
        if(isDarkModeEnabled) {
            await switchDarkMode(true);
            let vars = parseVariables(darkModeVars.value);
            for(let i in vars) {
                if(r.style.getPropertyValue(i)) r.style.setProperty(i, vars[i]);
            }
        }
    });
    lightModeVars.addEventListener('change', async () => {
        if(!isDarkModeEnabled) {
            await switchDarkMode(false);
            let vars = parseVariables(lightModeVars.value);
            for(let i in vars) {
                if(r.style.getPropertyValue(i)) r.style.setProperty(i, vars[i]);
            }
        }
    });
    cssTextArea.addEventListener('change', () => {
        if(!customCSS) {
            customCSS = document.createElement('style');
            customCSS.id = 'oldtwitter-custom-css';
            document.head.appendChild(customCSS);
        }
        customCSS.innerHTML = cssTextArea.value;
    });
    darkModeVars.addEventListener('keydown', async e => {
         if(e.keyCode === 83 && e.ctrlKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if(isDarkModeEnabled) {
                await switchDarkMode(true);
                let vars = parseVariables(darkModeVars.value);
                for(let i in vars) {
                    if(r.style.getPropertyValue(i)) r.style.setProperty(i, vars[i]);
                }
            }
         }
    });
    lightModeVars.addEventListener('keydown', async e => {
        if(e.keyCode === 83 && e.ctrlKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if(!isDarkModeEnabled) {
                await switchDarkMode(false);
                let vars = parseVariables(lightModeVars.value);
                for(let i in vars) {
                    if(r.style.getPropertyValue(i)) r.style.setProperty(i, vars[i]);
                }
            }
        }
    });
    cssTextArea.addEventListener('keydown', e => {
        if(e.key === "Tab") {
            e.preventDefault();
            e.stopImmediatePropagation();
            let pos = cssTextArea.selectionStart;
            cssTextArea.value = cssTextArea.value.slice(0, pos) + "  " + cssTextArea.value.slice(pos);
            cssTextArea.selectionStart = cssTextArea.selectionEnd = pos + 2;
        } else if(e.keyCode === 83 && e.ctrlKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if(!customCSS) {
                customCSS = document.createElement('style');
                customCSS.id = 'oldtwitter-custom-css';
                document.head.appendChild(customCSS);
            }
            customCSS.innerHTML = cssTextArea.value;
        }
    });
    saveDraft.addEventListener('click', () => {
        chrome.storage.local.set({
            cssDraft: {
                darkVars: darkModeVars.value,
                lightVars: lightModeVars.value,
                css: cssTextArea.value
            }
        });
        toast.info(LOC.draft_saved.message);
    });
    loadDraft.addEventListener('click', () => {
        chrome.storage.local.get(['cssDraft'], async d => {
            if(d.cssDraft) {
                if(!d.cssDraft.darkVars && !d.cssDraft.lightVars && !d.cssDraft.css) return toast.error(LOC.no_draft.message);
                darkModeVars.value = d.cssDraft.darkVars;
                lightModeVars.value = d.cssDraft.lightVars;
                cssTextArea.value = d.cssDraft.css;
                toast.info(LOC.draft_loaded.message);

                if(!customCSS) {
                    customCSS = document.createElement('style');
                    customCSS.id = 'oldtwitter-custom-css';
                    document.head.appendChild(customCSS);
                }
                customCSS.innerHTML = cssTextArea.value;

                if(isDarkModeEnabled) {
                    await switchDarkMode(true);
                    let vars = parseVariables(darkModeVars.value);
                    for(let i in vars) {
                        if(r.style.getPropertyValue(i)) r.style.setProperty(i, vars[i]);
                    }
                } else {
                    await switchDarkMode(false);
                    let vars = parseVariables(lightModeVars.value);
                    for(let i in vars) {
                        if(r.style.getPropertyValue(i)) r.style.setProperty(i, vars[i]);
                    }
                }
            } else {
                toast.error(LOC.no_draft.message);
            }
        });
    });
    cssSyncButton.addEventListener('click', async () => {
        cssSyncButton.disabled = true;
        try {
            let res = await fetch(`https://dimden.dev/services/twitter_link_colors/v2/setcss`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    css: cssTextArea.value,
                    dark_mode_vars: darkModeVars.value,
                    light_mode_vars: lightModeVars.value,
                    private_token: await getOtAuthToken(!(user.followers_count >= 5000 && cssEligibleAuto && !cssEligible))
                })
            }).then(i => i.text());
            if(res === 'auth_error') {
                chrome.storage.local.get(["otPrivateTokens"], data => {
                    delete data.otPrivateTokens[pageUser.id_str];
                    chrome.storage.local.set({ otPrivateTokens: data.otPrivateTokens });
                    cssSyncButton.disabled = false;
                    alert(LOC.invalid_auth_token.message);
                });
            } else if(res === 'set') {
                chrome.storage.local.get(["profileCustomCSS"], async data => {
                    if(!data.profileCustomCSS) {
                        data.profileCustomCSS = {};
                    }
                    data.profileCustomCSS[pageUser.id_str] = {
                        css: cssTextArea.value,
                        darkModeVars: darkModeVars.value,
                        lightModeVars: lightModeVars.value
                    };
                    chrome.storage.local.set({ profileCustomCSS: data.profileCustomCSS });
                });
                alert(LOC.css_set.message);
            } else {
                alert(res);
            }
        } catch(e) {
            console.error(e);
            alert(LOC.error_setting_css.message);
        } finally {
            cssSyncButton.disabled = false;
        }
    });
    cssLoadButton.addEventListener('click', async () => {
        fetch(`https://dimden.dev/services/twitter_link_colors/v2/get_data/${pageUser.id_str}`).then(r => r.json()).then(data => {
            cssTextArea.value = data.css;
            darkModeVars.value = data.css_vars_dark;
            lightModeVars.value = data.css_vars_light;

            if(data.css) {
                if(!customCSS) {
                    customCSS = document.createElement('style');
                    customCSS.id = 'oldtwitter-custom-css';
                    document.head.appendChild(customCSS);
                }
                customCSS.innerHTML = data.css;
            }
            if(data.css_vars_dark && isDarkModeEnabled) {
                let vars = parseVariables(data.css_vars_dark);
                for(let i in vars) {
                    r.style.setProperty(i, vars[i]);
                }
            } else if(data.css_vars_light && !isDarkModeEnabled) {
                let vars = parseVariables(data.css_vars_light);
                for(let i in vars) {
                    r.style.setProperty(i, vars[i]);
                }
            } else {
                switchDarkMode(isDarkModeEnabled);
            }
        });
    });
    colorSyncButton.addEventListener('click', async () => {
        colorSyncButton.disabled = true;
        let color = profileLinkColor.value;
        if(color.startsWith('#')) color = color.slice(1);
        try {
            let res = await fetch(`https://dimden.dev/services/twitter_link_colors/v2/setcolor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    color,
                    private_token: await getOtAuthToken()
                })
            }).then(i => i.text());
            if(res === 'auth_error') {
                chrome.storage.local.get(["otPrivateTokens"], data => {
                    delete data.otPrivateTokens[pageUser.id_str];
                    chrome.storage.local.set({ otPrivateTokens: data.otPrivateTokens });
                    colorSyncButton.disabled = false;
                    alert(LOC.invalid_auth_token.message);
                });
            } else if(res === 'error') {
                alert(LOC.error_setting_color.message);
            } else {
                alert(LOC.link_color_set.message);
                chrome.storage.local.get(["linkColors"], async lc => {
                    let linkColors = lc.linkColors || {};
                    linkColors[user.id_str] = color;
                    chrome.storage.local.set({ linkColors });
                });
            }
        } catch(e) {
            console.error(e);
            alert(LOC.error_setting_color.message);
        } finally {
            colorSyncButton.disabled = false;
        }
    });

    // Run
    updateSubpage();
    await updateUserData();
    if(subpage !== 'following' && subpage !== 'followers' && subpage !== 'followers_you_follow' && subpage !== 'lists') updateTimeline();
    else if(subpage === 'following') {
        renderFollowing();
    } else if(subpage === 'followers') {
        renderFollowers();
    } else  if(subpage === 'followers_you_follow') {
        renderFollowersYouFollow();
    } else  if(subpage === 'lists') {
        renderLists();
    }
    if(location.hash === "#dm") {
        setTimeout(() => {
            let event = new CustomEvent('messageUser', { detail: { id: `${user.id_str}-${pageUser.id_str}`, user: pageUser } });
            document.dispatchEvent(event);
            location.hash = "";
        }, 1000);
    }
    renderDiscovery();
    renderTrends(true);
    setInterval(() => renderDiscovery(false), 60000 * 5);
    setInterval(() => renderTrends(true), 60000 * 5);
}, 50);