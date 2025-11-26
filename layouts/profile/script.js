/*
/**
 * @typedef {Object} CSSVariable
 * @property {string} value - The value of the CSS variable.
 */

/**
 * CSSVariableManager class to manage CSS variables.
 */
class CSSVariableManager {
    /**
     * @type {Object.<string, CSSVariable>}
    */
    #vars; // this is unused rn but could be useful in the future
    /**
     * Creates an instance of CSSVariableManager.
    */
    constructor() {
        this.#vars = {};
    }

    /**
     * Updates a CSS variable.
     * @param {string} name - The name of the CSS variable.
     * @param {string} value - The value of the CSS variable.
    */
    updateVar(name, value) {
        this.#vars[name] = value;
    }

    getVar(name) {
        return this.#vars[name];
    }

    get vars() {
        return this.#vars;
    }

    runLoop() {
        const root = document.documentElement;
        for(let i in this.#vars) {
            if(root.style.getPropertyValue(i) !== this.#vars[i]) {
                root.style.setProperty(i, this.#vars[i]);
            }
        }
        requestAnimationFrame(() => this.runLoop());
    }
}

const manager = new CSSVariableManager();

let lastX = 0;
let lastY = 0;

manager.runLoop();

window.addEventListener('scroll', (e) => {
    manager.updateVar('--scroll-y', window.scrollY + 'px');
});

window.addEventListener('mousemove', (e) => {
    if(e.clientX !== lastX) {
        manager.updateVar('--mouse-x', e.clientX + 'px');
        lastX = e.clientX;
    }
    if(e.clientY !== lastY) {
        manager.updateVar('--mouse-y', e.clientY + 'px');
        lastY = e.clientY;
    }
});

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
    document.getElementById('profile-stat-tweets-link').href = `/${pageUser.screen_name}`;
    document.getElementById('profile-stat-following-link').href = `/${pageUser.screen_name}/following`;
    document.getElementById('profile-stat-followers-link').href = `/${pageUser.screen_name}/followers`;
    document.getElementById('profile-stat-favorites-link').href = `/${pageUser.screen_name}/likes`;
    document.getElementById('profile-stat-media-link').href = `/${pageUser.screen_name}/media`;
    document.getElementById('tweet-nav-tweets').href = `/${pageUser.screen_name}`;
    document.getElementById('tweet-nav-replies').href = `/${pageUser.screen_name}/with_replies`;
    document.getElementById('tweet-nav-media').href = `/${pageUser.screen_name}/media`;
    document.getElementById('profile-stat-following-mobile').href = `/${pageUser.screen_name}/following`;
    document.getElementById('profile-stat-followers-mobile').href = `/${pageUser.screen_name}/followers`;

    if(pageUser.statuses_count === 0 && !( pageUser.blocked_by || pageUser.blocking || pageUser.protected ) && (subpage === 'profile' || subpage === 'replies')) {
        document.getElementById('trends').hidden = true;
        document.getElementById('no-tweets').hidden = false;
        document.getElementById('no-tweets').innerHTML = html`
            <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
            <p>${LOC.when_theyll_tweet.message}</p>
        `;
    } else {
        document.getElementById('trends').hidden = false;
        document.getElementById('no-tweets').hidden = true;
        document.getElementById('no-tweets').innerHTML = html``;
    }
}

function updateUserData() {
    return new Promise(async (resolve, reject) => {
        document.getElementsByTagName('title')[0].innerText = `${user_handle} - ` + LOC.twitter.message;
        let [pageUserData, followersYouFollowData, oldUser, about, u] = await Promise.allSettled([
            API.user.getV2(user_handle),
            API.user.friendsFollowing(user_handle, false),
            API.user.get(user_handle, false),
            vars.showBasedIn ? API.user.getAbout(user_handle) : Promise.resolve(null),
            API.account.verifyCredentials()
        ]).catch(e => {
            if(String(e).includes("reading 'result'") || String(e).includes('property "result"')) {
                document.getElementById('loading-box').hidden = true;
                document.getElementById('profile-name').innerText = `@${user_handle}`;
                document.getElementById('timeline').innerHTML = html`<div class="unable_load_timeline" dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.nonexistent_user.message}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.nonexistent_user_desc.message.replaceAll("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                document.getElementById('trends').hidden = true;
                document.getElementById('profile-nav-center-cell').style.display = 'none'; // ???
                document.getElementById('profile-banner-sticky').style.backgroundColor = 'var(--background-color)';
                document.getElementById('wtf').hidden = true;
                document.getElementById('profile-nav').style.boxShadow = 'none';
                document.getElementById('profile-avatar').src = chrome.runtime.getURL(`images/default_profile_images/default_profile_0_normal.png`);
                return;
            }
            if(String(e).includes('User has been suspended') || String(e).includes('User is suspended')) {
                document.getElementById('loading-box').hidden = true;
                document.getElementById('profile-name').innerText = `@${user_handle}`;
                document.getElementById('timeline').innerHTML = html`<div class="unable_load_timeline" dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.suspended_user.message}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.suspended_user_desc.message.replaceAll("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                document.getElementById('trends').hidden = true;
                document.getElementById('profile-nav-center-cell').style.display = 'none'; // ???
                document.getElementById('profile-banner-sticky').style.backgroundColor = 'var(--background-color)';
                document.getElementById('wtf').hidden = true;
                document.getElementById('profile-nav').style.boxShadow = 'none';
                document.getElementById('profile-avatar').src = chrome.runtime.getURL(`images/default_profile_images/default_profile_0_normal.png`);
                return;
            }
            document.getElementById('loading-box').hidden = false;
            return document.getElementById('loading-box-error').innerHTML = html`${String(e)}.<br><a href="/home">${LOC.go_homepage.message}</a>`;
        });
        if(oldUser.reason) {
            let e = oldUser.reason;
            if(String(e).includes('User has been suspended.')) {
                document.getElementById('loading-box').hidden = true;
                document.getElementById('profile-name').innerText = `@${user_handle}`;
                document.getElementById('timeline').innerHTML = html`<div class="unable_load_timeline" dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.suspended_user.message}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.suspended_user_desc.message.replaceAll("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                document.getElementById('trends').hidden = true;
                document.getElementById('profile-nav-center-cell').style.display = 'none'; // ???
                document.getElementById('profile-banner-sticky').style.backgroundColor = 'var(--background-color)';
                document.getElementById('wtf').hidden = true;
                document.getElementById('profile-nav').style.boxShadow = 'none';
                document.getElementById('profile-avatar').src = chrome.runtime.getURL(`images/default_profile_images/default_profile_0_normal.png`);
                return;
            }
        }
        if(pageUserData.reason) {
            let e = pageUserData.reason;
            if(String(e).includes("reading 'result'") || String(e).includes('property "result"')) {
                document.getElementById('loading-box').hidden = true;
                document.getElementById('profile-name').innerText = `@${user_handle}`;
                document.getElementById('timeline').innerHTML = html`<div class="unable_load_timeline" dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.nonexistent_user.message}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.nonexistent_user_desc.message.replaceAll("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                document.getElementById('trends').hidden = true;
                document.getElementById('profile-nav-center-cell').style.display = 'none'; // ???
                document.getElementById('profile-banner-sticky').style.backgroundColor = 'var(--background-color)';
                document.getElementById('wtf').hidden = true;
                document.getElementById('profile-nav').style.boxShadow = 'none';
                document.getElementById('profile-avatar').src = chrome.runtime.getURL(`images/default_profile_images/default_profile_0_normal.png`);
                return;
            }
            if(String(e).includes('User is suspended')) {
                document.getElementById('loading-box').hidden = true;
                document.getElementById('profile-name').innerText = `@${user_handle}`;
                document.getElementById('timeline').innerHTML = html`<div class="unable_load_timeline" dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.suspended_user.message}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.suspended_user_desc.message.replaceAll("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                document.getElementById('trends').hidden = true;
                document.getElementById('profile-nav-center-cell').style.display = 'none'; // ???
                document.getElementById('profile-banner-sticky').style.backgroundColor = 'var(--background-color)';
                document.getElementById('wtf').hidden = true;
                document.getElementById('profile-nav').style.boxShadow = 'none';
                document.getElementById('profile-avatar').src = chrome.runtime.getURL(`images/default_profile_images/default_profile_0_normal.png`);
                return;
            }
            document.getElementById('loading-box').hidden = false;
            return document.getElementById('loading-box-error').innerHTML = html`${String(e)}.<br><a href="/home">${LOC.go_homepage.message}</a>`;
        }
        followersYouFollowData = followersYouFollowData.value;
        oldUser = oldUser.value; //can make it undefined, which is fine because it's subsequently always checked for
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
        const event2 = new CustomEvent('updatePageUserData', { detail: oldUser || pageUserData });
        document.dispatchEvent(event2);
        pageUser = pageUserData;
        pageUser.about = about.value || null;
        let r = document.querySelector(':root');
        let usedProfileColor = vars && vars.linkColor ? vars.linkColor : '#4595B5';
        r.style.setProperty('--link-color', usedProfileColor);
        if (oldUser) {
            let sc = makeSeeableColor(oldUser.profile_link_color);
            if(oldUser.profile_link_color && oldUser.profile_link_color !== '1DA1F2') {
                customSet = true;
                r.style.setProperty('--link-color', sc);
                usedProfileColor = oldUser.profile_link_color;
                document.getElementById('color-years-ago').hidden = false;
            } else {
                document.getElementById('color-years-ago').hidden = true;
            }
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

        profileLinkColor.value = `#${usedProfileColor.startsWith('#') ? usedProfileColor.slice(1) : usedProfileColor}`;
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

        colorPreviewLight.style.color = makeSeeableColor(`#${usedProfileColor.startsWith('#') ? usedProfileColor.slice(1) : usedProfileColor}`, "#ffffff");
        colorPreviewDark.style.color = makeSeeableColor(`#${usedProfileColor.startsWith('#') ? usedProfileColor.slice(1) : usedProfileColor}`, "#1b2836");
        colorPreviewBlack.style.color = makeSeeableColor(`#${usedProfileColor.startsWith('#') ? usedProfileColor.slice(1) : usedProfileColor}`, "#000000");

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
                        adminControls.innerHTML = html`
                            <br>
                            Eligible for custom profile CSS: <span id="admin-css-eligible">${data.css_eligible ? 'yes' : 'no'}</span><br>
                            Can get access automatically: <span id="admin-css-eligible-auto">${data.css_eligible_auto ? 'yes' : 'no'}</span><br>
                            Has custom profile CSS: ${data.css || data.css_vars_dark || data.css_vars_light ? 'yes' : 'no'}<br>
                            Has custom color: ${data.color !== 'none' ? 'yes' : 'no'}<br><br>
                            <button id="admin-controls-switch" class="tiny-button">Switch</button>
                            <br><br>
                        `;
                        document.getElementById('about-right').appendChild(adminControls);
                        // mozilla really rejected extension with "data collection" reason because of admin-only button that is only visible to me and doesnt send anything automatically ever lol
                        // please READ code of extension before rejecting it
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
                        additionalThing.innerHTML = html`<a href="https://dimden.dev/ot/custom-css/" target="_blank">${LOC.styled_profile.message}</a>`;
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
                            let modal = createModal(html`
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
            window.location.href = "/i/flow/login?newtwitter=true";
        }
        console.error(e);
        reject(e);
    });
}

async function updateTimeline() {
    seenThreads = [];
    if (timeline.data.length === 0) document.getElementById('timeline').innerHTML = html`
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
                document.getElementById("timeline").innerHTML = html`<div class="unable_load_timeline" dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.blocked_by_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.why_you_cant_see_block_user.message.replaceAll("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                return;
            }else if(user_protected) {
                document.getElementById("timeline").innerHTML = html`<div class="unable_load_timeline" dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.user_protected.message}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.follow_to_see.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                return;
            }/*else if(user_blocking) {
                document.getElementById("timeline").innerHTML = html`<div class="unable_load_timeline" dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.you_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.do_you_want_see_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</p><button class="nice-button" id="see-tweet-btn">${LOC.I_want_see_blocked_user.message}</button> </div>`;
                return;
            }*/
        } catch(e) {
            console.error(e);
            document.getElementById('timeline').innerHTML = html`<div style="padding: 100px;color: var(--darker-gray);">${escapeHTML(String(e))}</div>`;
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
    if (vars.extensionCompatibilityMode) userList.setAttribute('data-testid', 'primaryColumn')
    if(clear) {
        if(pageUser.id_str === user.id_str) {
            userList.innerHTML = html`
                <h1 class="nice-header">${LOC.following.message} (${pageUser.friends_count.toLocaleString('en-US')})</h1>
                <a href="/old/unfollows/following" style="float: right;font-size: 14px;">${LOC.unfollowings.message}</a>
            `;
        } else {
            userList.innerHTML = html`<h1 class="nice-header">${LOC.following.message} (${pageUser.friends_count.toLocaleString('en-US')})</h1>`;
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
        let label;
        if(vars.showUserFollowerCountsInLists) {
            label = `${formatLargeNumber(u.followers_count)} ${vars.modernUI ? LOC.followers.message : LOC.followers.message.toLowerCase()}`;
        }
        let usernameClass = '';
        if(vars.showBoringIndicators && !u.protected) {
            if(!u.status) {
                usernameClass = 'user-indicator-no-status';
            } else if(u.status) {
                if(u.status.retweeted_status) {
                    usernameClass = 'user-indicator-retweeted';
                } else if(u.status.quoted_status_id_str) {
                    usernameClass = 'user-indicator-quoted';
                } else if(Date.now() - new Date(u.status.created_at).getTime() > 1000 * 60 * 60 * 24 * 7) {
                    usernameClass = 'user-indicator-old';
                }
            }
        }
        appendUser(u, userList, label, usernameClass);
    });
    document.getElementById('loading-box').hidden = true;
    loadingFollowing = false;
    followingMoreBtn.innerText = LOC.load_more.message;
}
let unsaved = false;
async function renderFollowers(clear = true, cursor) {
    loadingFollowers = true;
    let userList = document.getElementById('followers-list');
    if (vars.extensionCompatibilityMode) userList.setAttribute('data-testid', 'primaryColumn')
    if(clear) {
        if(pageUser.id_str === user.id_str) {
            let unfollows = await new Promise(resolve => {
                chrome.storage.local.get(['unfollows'], async d => {
                    let res = d.unfollows;
                    if(!res) res = {};
                    if(!res[user.id_str]) res[user.id_str] = {
                        followers: [],
                        following: [],
                        unfollowers: [],
                        unfollowings: [],
                        lastUpdate: 0
                    };
                    resolve(res[user.id_str]);
                });
            });
            userList.innerHTML = html`
                <h1 class="nice-header">
                    ${LOC.followers.message} 
                    (${pageUser.followers_count.toLocaleString('en-US')})
                    ${unfollows.followers.length > 5 && unfollows.followers.length < 50000 ? html`
                        <button class="tiny-button" id="switch-filtering" style="vertical-align:text-bottom">${LOC.filter.message}</button>
                    ` : ''}
                </h1>
                <a href="/old/unfollows/followers" style="float: right;font-size: 14px;" class="unfollowers-link">${LOC.unfollowers.message}</a>
                <div id="follower-filtering-menu" hidden>
                    <div>
                        <select id="sort-followers">
                            <option value="follow_date">${LOC.sort_by_follow_date.message}</option>
                            <option value="followers">${LOC.sort_by_followers.message}</option>
                            <option value="following">${LOC.sort_by_following.message}</option>
                            <option value="name">${LOC.sort_by_name.message}</option>
                            <option value="username">${LOC.sort_by_username.message}</option>
                            <option value="tweet_count">${LOC.sort_by_tweets.message}</option>
                            <option value="created">${LOC.sort_by_created.message}</option>
                            <option value="random">${LOC.sort_by_random.message}</option>
                        </select>
                        <select id="sort-followers-order">
                            <option value="desc">${LOC.descending.message}</option>
                            <option value="asc">${LOC.ascending.message}</option>
                        </select>
                    </div>
                    <div>
                        <span>${LOC.search_by_name.message}:</span>
                        <input type="text" id="search-followers-name" placeholder="${LOC.name.message}">
                    </div>
                    <div>
                        <span>${LOC.search_by_description.message}:</span>
                        <input type="text" id="search-followers-description" placeholder="${LOC.description.message}">
                    </div>
                    <div>
                        ${LOC.only_show_people_with_followers.message.replace("$NUMBER$", `<input type="number" id="only-show-people-with-followers" style="width: 50px;" value="0" min="0">`)}
                    </div>
                    <div>
                        ${LOC.only_show_people_with_age.message.replace("$NUMBER$", `<input type="number" id="only-show-people-with-age" style="width: 50px;" value="0" min="0">`)}
                    </div>
                    <div>
                        <input type="checkbox" id="only-mutuals">
                        <label for="only-mutuals">${LOC.only_show_people_you_follow.message}</label>
                    </div>
                    <div>
                        <span>${LOC.page.message}:</span>
                        <input id="followers-filter-page" type="number" value="1" min="1" max="${Math.ceil(user.followers_count / 500)}">
                    </div>
                    <div id="loading-sorted-followers" hidden></div>
                    <button class="nice-button" id="apply-followers-filter">${LOC.apply.message}</button>
                </div>
            `;
            let sortFollowers = document.getElementById('sort-followers');
            let sortOrder = document.getElementById('sort-followers-order');
            let loadingSortedFollowers = document.getElementById('loading-sorted-followers');
            let applyFollowersFilter = document.getElementById('apply-followers-filter');
            let switchFiltering = document.getElementById('switch-filtering');
            let searchFollowersName = document.getElementById('search-followers-name');
            let searchFollowersDescription = document.getElementById('search-followers-description');
            let onlyMutuals = document.getElementById('only-mutuals');
            let onlyShowPeopleWithFollowers = document.getElementById('only-show-people-with-followers');
            let onlyShowPeopleWithAge = document.getElementById('only-show-people-with-age');
            let page = document.getElementById('followers-filter-page');

            switchFiltering.addEventListener('click', () => {
                document.getElementById('follower-filtering-menu').hidden = !document.getElementById('follower-filtering-menu').hidden;
            });

            applyFollowersFilter.addEventListener('click', async () => {
                chrome.storage.local.get(['sortedFollowers'], async d => {
                    let sortedFollowers = d.sortedFollowers;
                    if(!sortedFollowers) sortedFollowers = {};
                    if(!sortedFollowers[user.id_str]) sortedFollowers[user.id_str] = {
                        followers: [],
                        lastUpdate: Date.now()
                    };
                    loadingFollowers = true;
                    loadingSortedFollowers.hidden = false;
                    applyFollowersFilter.disabled = true;
                    unsaved = true;
                    Array.from(userList.getElementsByClassName('user-item')).forEach(u => u.remove());
                    document.getElementById('followers-more').hidden = true;
                    let fetchedUsers = [];
                    let userIds = unfollows.followers;
                    if(sortedFollowers[user.id_str].followers.length === 0 || Date.now() - sortedFollowers[user.id_str].lastUpdate > 60000 * 60 * 24) {
                        let i = 0;
                        while(i < userIds.length) {
                            let users1, users2, users3, users4, users5;
                            try {
                                [
                                    users1,
                                    users2,
                                    users3,
                                    users4,
                                    users5
                                ] = await Promise.all([
                                    API.user.lookupV2(userIds.slice(i, i+100)),
                                    i + 100 < userIds.length ? API.user.lookupV2(userIds.slice(i+100, i+200)) : [],
                                    i + 200 < userIds.length ? API.user.lookupV2(userIds.slice(i+200, i+300)) : [],
                                    i + 300 < userIds.length ? API.user.lookupV2(userIds.slice(i+300, i+400)) : [],
                                    i + 400 < userIds.length ? API.user.lookupV2(userIds.slice(i+400, i+500)) : []
                                ]);
                            } catch(e) {
                                console.error(e);
                                loadingSortedFollowers.innerText = `${e} (${i / 100} / ${Math.ceil(userIds.length / 100)})`;
                                await sleep(1000);
                                continue;
                            }
                            i += 500;
                            let users = users1.concat(users2, users3, users4, users5);
                            loadingSortedFollowers.innerText = `${LOC.loading_all_followers.message} (${i / 100} / ${Math.ceil(userIds.length / 100)})`;
                            fetchedUsers = fetchedUsers.concat(users.map(u => ([
                                u.id_str,
                                u.followers_count,
                                u.screen_name,
                                u.name,
                                u.profile_image_url_https,
                                u.protected ? 1 : 0,
                                u.verified ? 1 : 0,
                                u.following ? 1 : 0,
                                u.followed_by ? 1 : 0,
                                u.muting ? 1 : 0,
                                new Date(u.created_at).getTime(),
                                u.default_profile_image ? 1 : 0,
                                u.statuses_count,
                                u.friends_count,
                                u.description ? u.description.replace(/https:\/\/t\.co\/[a-zA-Z0-9]+/g, m => {
                                    if(!u.entities || !u.entities.description || !u.entities.description.urls) return m;
                                    let entity = u.entities.description.urls.find(e => e.url === m);
                                    if(entity) {
                                        return entity.expanded_url;
                                    } else {
                                        return m;
                                    }
                                }) : '',
                                u.url ? u.url.replace(/https:\/\/t\.co\/[a-zA-Z0-9]+/g, m => {
                                    if(!u.entities || !u.entities.url || !u.entities.url.urls) return m;
                                    let entity = u.entities.url.urls.find(e => e.url === m);
                                    if(entity) {
                                        return entity.expanded_url;
                                    } else {
                                        return m;
                                    }
                                }) : ''
                            ])));
                            if(i >= userIds.length) {
                                break;
                            }
                            let seconds = 60;
                            loadingSortedFollowers.innerText = loadingSortedFollowers.innerText + ` (${seconds}s)`;
                            let interval = setInterval(() => {
                                seconds--;
                                loadingSortedFollowers.innerText = loadingSortedFollowers.innerText.replace(/\(\d+s\)/, `(${seconds}s)`);
                                if (seconds === 0) {
                                    clearInterval(interval);
                                }
                            }, 1000);
                            await sleep(seconds * 1000);
                        }
                        sortedFollowers[user.id_str].followers = fetchedUsers;
                        sortedFollowers[user.id_str].lastUpdate = Date.now();
                        chrome.storage.local.set({ sortedFollowers }, () => {});
                    } else {
                        fetchedUsers = sortedFollowers[user.id_str].followers;
                    }
                    applyFollowersFilter.disabled = false;
                    unsaved = false;
                    loadingSortedFollowers.hidden = true;

                    if(onlyMutuals.checked) {
                        fetchedUsers = fetchedUsers.filter(u => u[7] === 1);
                    }
                    if(searchFollowersName.value) {
                        fetchedUsers = fetchedUsers.filter(u => u[3].toLowerCase().includes(searchFollowersName.value.toLowerCase()) || u[2].toLowerCase().includes(searchFollowersName.value.toLowerCase()));
                    }
                    if(searchFollowersDescription.value) {
                        fetchedUsers = fetchedUsers.filter(u => u[14].toLowerCase().includes(searchFollowersDescription.value.toLowerCase()) || u[15].toLowerCase().includes(searchFollowersDescription.value.toLowerCase()));
                    }
                    if(onlyShowPeopleWithFollowers.value !== '0') {
                        fetchedUsers = fetchedUsers.filter(u => u[1] >= Number(onlyShowPeopleWithFollowers.value));
                    }
                    if(onlyShowPeopleWithAge.value !== '0') {
                        fetchedUsers = fetchedUsers.filter(u => (Date.now() - u[10]) / 1000 / 60 / 60 / 24 >= Number(onlyShowPeopleWithAge.value));
                    }
                    switch(sortFollowers.value) {
                        case 'followers':
                            fetchedUsers.sort((a, b) => a[1] - b[1]);
                            break;
                        case 'following':
                            fetchedUsers.sort((a, b) => a[13] - b[13]);
                            break;
                        case 'name':
                            fetchedUsers.sort((a, b) => a[3].localeCompare(b[3]));
                            break;
                        case 'username':
                            fetchedUsers.sort((a, b) => a[2].localeCompare(b[2]));
                            break;
                        case 'tweet_count':
                            fetchedUsers.sort((a, b) => a[12] - b[12]);
                            break;
                        case 'created':
                            fetchedUsers.sort((a, b) => a[10] - b[10]);
                            break;
                        case 'random':
                            shuffleArray(fetchedUsers);
                            break;
                    }
                    if(sortOrder.value === 'desc') {
                        fetchedUsers.reverse();
                    }
                    fetchedUsers = fetchedUsers.slice((page.value - 1) * 500, (page.value - 1) * 500 + 500);

                    for(let u of fetchedUsers) {
                        appendUser({
                            id_str: u[0],
                            followers_count: u[1],
                            screen_name: u[2],
                            name: u[3],
                            profile_image_url_https: u[4],
                            protected: u[5] === 1,
                            verified: u[6] === 1,
                            following: u[7] === 1,
                            followed_by: u[8] === 1,
                            muting: u[9] === 1,
                            created_at: new Date(u[10]).toISOString(),
                            default_profile_image: u[11] === 1,
                            statuses_count: u[12],
                            friends_count: u[13]
                        }, userList, `${formatLargeNumber(u[1])} ${vars.modernUI ? LOC.followers.message : LOC.followers.message.toLowerCase()}`);
                    }
                });
            });
        } else {
            userList.innerHTML = html`<h1 class="nice-header">${LOC.followers.message} (${pageUser.followers_count.toLocaleString('en-US')})</h1>`;
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
        let label;
        if(vars.showUserFollowerCountsInLists) {
            label = `${formatLargeNumber(u.followers_count)} ${vars.modernUI ? LOC.followers.message : LOC.followers.message.toLowerCase()}`;
        }
        let usernameClass = '';
        if(vars.showBoringIndicators && !u.protected) {
            if(!u.status) {
                usernameClass = 'user-indicator-no-status';
            } else if(u.status) {
                if(u.status.retweeted_status) {
                    usernameClass = 'user-indicator-retweeted';
                } else if(u.status.quoted_status_id_str) {
                    usernameClass = 'user-indicator-quoted';
                } else if(Date.now() - new Date(u.status.created_at).getTime() > 1000 * 60 * 60 * 24 * 7) {
                    usernameClass = 'user-indicator-old';
                }
            }
        }
        appendUser(u, userList, label, usernameClass);
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
            userList.innerHTML = html`<h1 class="nice-header">${LOC.followers_you_know.message.replace("$NUMBER$", followersYouFollow.total_count)}</h1>`;
        } else {
            userList.innerHTML = html`<h1 class="nice-header">${followersYouFollow.total_count} ${LOC.followers_you_know.message}</h1>`;
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
        let label;
        if(vars.showUserFollowerCountsInLists) {
            label = `${formatLargeNumber(u.followers_count)} ${vars.modernUI ? LOC.followers.message : LOC.followers.message.toLowerCase()}`;
        }
        appendUser(u, userList, label);
    });
    document.getElementById('loading-box').hidden = true;
    loadingFollowersYouKnow = false;
    followersYouFollowMoreBtn.innerText = LOC.load_more.message;
}
async function renderLists() {
    let lists = pageUser.id_str === user.id_str ? await API.list.getMyLists() : await API.user.getLists(pageUser.id_str);
    let listsList = document.getElementById('lists-list');
    listsList.innerHTML = html`<h1 class="nice-header">${LOC.lists.message}</h1>`;
    if(pageUser.id_str === user.id_str) {
        listsList.innerHTML += html`<h1 class="nice-header" style="float:right;cursor:pointer" id="create-list">${LOC.create_btn.message}</h1>`;
        document.getElementById('create-list').addEventListener('click', () => {
            let modal = createModal(html`
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
                location.href = `/i/lists/${list.id_str}`;
            });
        });
    }
    for(let i in lists) {
        let l = lists[i];
        if(!l) continue;
        let listElement = document.createElement('div');
        listElement.classList.add('list-item');
        listElement.innerHTML = html`
            <div>
                <a href="/i/lists/${l.id_str}" class="following-item-link">
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
    let banner = document.getElementById('profile-banner');
    if(pageUser.profile_banner_url) {
        banner.onerror = () => {
            banner.onerror = null;
            banner.src += "/1500x500";
        }
        banner.src = pageUser.profile_banner_url;
    } else {
        banner.src = 'https://abs.twimg.com/images/themes/theme1/bg.png';
    }
    let attempts = 0;
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
    document.getElementById('profile-avatar').dataset.user_id = pageUser.id_str;
    document.getElementById('profile-avatar').src = `${(pageUser.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(pageUser.id_str) % 7}_normal.png`): pageUser.profile_image_url_https}`.replace('_normal.', '_400x400.');
    document.getElementById('nav-profile-avatar').src = `${(pageUser.default_profile_image && vars.useOldDefaultProfileImage) ? chrome.runtime.getURL(`images/default_profile_images/default_profile_${Number(pageUser.id_str) % 7}_normal.png`): pageUser.profile_image_url_https}`.replace('_normal.', '_bigger.');
    document.getElementById('profile-name').innerText = pageUser.name.replace(/\n/g, ' ');
    document.getElementById('nav-profile-name').innerText = pageUser.name.replace(/\n/g, ' ');
    if(LOC.tweet_to.message.includes("$SCREEN_NAME$")) {
        document.getElementById('tweet-to-inner').innerText = LOC.tweet_to.message.replace("$SCREEN_NAME$", pageUser.screen_name.replace(/\n/g, ' '));
    } else {
        document.getElementById('tweet-to-inner').innerText = `${LOC.tweet_to.message} ${pageUser.name.replace(/\n/g, ' ')}`;
    }
    if(vars.heartsNotStars) {
        document.getElementById('profile-stat-text-favorites').innerText = LOC.likes.message;
    }
    let stats = Array.from(document.getElementsByClassName('profile-stat'));
    stats.forEach(s => {
        s.classList.toggle('profile-stat-disabled', (pageUser.protected && !pageUser.following) && pageUser.id_str !== user.id_str); //BUG:pageUser.blocked_by works strangly only here...
    });

    document.getElementById('profile-name').className = "";
    if(pageUser.verified || pageUser.verified_type || pageUser.id_str === '1708130407663759360') {
        if(!(!vars.twitterBlueCheckmarks && pageUser.verified_type === "Blue")) document.getElementById('profile-name').classList.add('user-verified');
        if(pageUser.id_str === '1708130407663759360') document.getElementById('profile-name').classList.add('user-verified-green');
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
    document.getElementById('profile-media-text').href = `/${pageUser.screen_name}/media`;

    updateSelection();

    document.getElementById('profile-bio').innerHTML = escapeHTML(pageUser.description).replace(/\n\n\n\n/g, "\n").replace(/((http|https|ftp):\/\/[\w?=.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="/$1">@$1</a>`).replace(hashtagRegex, `<a href="/hashtag/$2">#$2</a>`).replace(/\n/g, '<br>');
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
            span.innerHTML = html`
                <br>
                <span class='piu-a'>${translatedMessage}:</span>
                <span>${escapeHTML(translated.translation).replace(/((http|https|ftp):\/\/[\w?=.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="/$1">@$1</a>`).replace(hashtagRegex, `<a href="/hashtag/$2">#$2</a>`).replace(/\n/g, '<br>')}</span>
            `;
            translateBtn.hidden = true;
            document.getElementById('profile-bio').append(span);
            let links = Array.from(span.getElementsByTagName('a'));
            links.forEach(link => {
                let realLink = pageUser.entities.description.urls.find(u => u.url === link.href);
                if (realLink) {
                    link.href = realLink.expanded_url;
                    if(!link.href.startsWith('/')) link.target = '_blank';
                    link.innerText = realLink.display_url;
                }
            });
            if(vars.enableTwemoji) twemoji.parse(span);
        });
        translateBtn.innerText = LOC.translate_bio.message;
        document.getElementById('profile-bio').append(document.createElement('br'), translateBtn);
    }
    
    if(vars.enableTwemoji) {
        twemoji.parse(document.getElementById('profile-name'));
        twemoji.parse(document.getElementById('profile-bio'));
    }
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
        document.getElementById('no-tweets').innerHTML = html`
            <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
            <p>${LOC.when_theyll_tweet.message}</p>
        `;
    } else {
        document.getElementById('no-tweets').hidden = true;
        document.getElementById('no-tweets').innerHTML = html``;
    }
    if(pageUser.blocking && !pageUser.blocked_by)  {
        document.getElementById('no-tweets').hidden = false;
        document.getElementById('no-tweets').innerHTML = html`<div dir="auto" style="color: var(--darker-gray); font-size: 20px;"><h2>${LOC.you_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.do_you_want_see_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</p><button class="nice-button" id="see-tweet-btn">${LOC.I_want_see_blocked_user.message}</button> </div>`;
        document.getElementById('timeline').hidden = true; 
        document.getElementById('tweet-nav').hidden = true; 
        document.getElementById('see-tweet-btn').addEventListener('click', async () => {
            if(pageUser.statuses_count === 0 && !( pageUser.blocked_by || pageUser.blocking || pageUser.protected ) && (subpage === 'profile' || subpage === 'replies' || subpage === 'media')) {
                document.getElementById('trends').hidden = true;
                document.getElementById('no-tweets').hidden = false;
                document.getElementById('no-tweets').innerHTML = html`
                    <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
                    <p>${LOC.when_theyll_tweet.message}</p>
                        `;
            }
            else {
                document.getElementById('no-tweets').hidden = true;
                document.getElementById('no-tweets').innerHTML = html``;
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
        friendsFollowingText.href = `/${pageUser.screen_name}/followers_you_follow`;
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
        if((pageUser.verified_type === "Blue" || pageUser.verified) && !localStorage.alwaysThinkUreNotBlueVerified) {
            localStorage.OTisBlueVerified = true;
        } else if(localStorage.OTisBlueVerified && localStorage.OTisBlueVerified !== "always") {
            delete localStorage.OTisBlueVerified;
        }
        buttonsElement.innerHTML = html`
            <a class="nice-button" id="edit-profile" target="_blank" href="/settings/profile?newtwitter=true">${LOC.edit_profile.message}</a>
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
        buttonsElement.innerHTML = html`
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
        buttonsElement.innerHTML += html`
            <span class="profile-additional-thing" id="profile-settings"></span>
            <div id="profile-settings-div" class="dropdown-menu" hidden>
                <span ${!pageUser.following || pageUser.blocking ? 'hidden' : ''} id="profile-settings-notifications" class="${pageUser.notifications ? 'profile-settings-offnotifications' : 'profile-settings-notifications'}">${pageUser.notifications ? LOC.stop_notifications.message : LOC.receive_notifications.message}</span>
                <span id="profile-settings-block" class="${pageUser.blocking ? 'profile-settings-unblock' : 'profile-settings-block'}">${pageUser.blocking ? unblockUserText : blockUserText}</span>
                <span ${pageUser.blocking || ((pageUser.protected || pageUser.blocked_by)  && !pageUser.following) ? 'hidden' : ''} id="profile-settings-mute" class="${pageUser.muting ? 'profile-settings-unmute' : 'profile-settings-mute'}">${pageUser.muting ? LOC.unmute.message : LOC.mute.message}</span>
                ${pageUser.followed_by ? html`<span id="profile-settings-removefollowing">${LOC.remove_from_followers.message}</span>` : ''}
                <span id="profile-settings-lists-action" ${pageUser.blocking || ((pageUser.protected || pageUser.blocked_by)  && !pageUser.following) ? 'hidden' : ''}>${LOC.from_list.message}</span>
                <span id="profile-settings-autotranslate">${toAutotranslate ? LOC.dont_autotranslate.message : LOC.autotranslate_tweets.message}</span>
                <span id="profile-settings-retweets" ${pageUser.following ? '' : 'hidden'}>${pageUser.want_retweets ? LOC.turn_off_retweets.message : LOC.turn_on_retweets.message}</span>
                <hr>
                <span id="profile-settings-lists" ${(pageUser.protected || pageUser.blocked_by) && !pageUser.following ? 'hidden' : ''}>${LOC.see_lists.message}</span>
                <span id="profile-settings-share">${LOC.share_user.message}</span>
                <span id="profile-settings-copy">${LOC.copy_profile_link.message}</span>
                ${vars.developerMode ? html`<span id="profile-settings-copy-id">${LOC.copy_user_id.message}</span>` : ''}
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
                        document.getElementById('no-tweets').innerHTML = html`
                            <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
                            <p>${LOC.when_theyll_tweet.message}</p>
                            `;
                    }
                    else {
                        document.getElementById('trends').hidden = false;
                        document.getElementById('no-tweets').hidden = true;
                        document.getElementById('no-tweets').innerHTML = html``;
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
                let modal = createModal(html`
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
                        document.getElementById('no-tweets').innerHTML = html`<div dir="auto" style="color: var(--darker-gray); font-size: 20px;"><h2>${LOC.you_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.do_you_want_see_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</p><button class="nice-button" id="see-tweet-btn">${LOC.I_want_see_blocked_user.message}</button> </div>`;
                        document.getElementById('timeline').hidden = true; 
                        document.getElementById('tweet-nav').hidden = true; 
                        document.getElementById('see-tweet-btn').addEventListener('click', async () => {
                            if(pageUser.statuses_count === 0 && !( pageUser.blocked_by || pageUser.blocking || pageUser.protected ) && (subpage === 'profile' || subpage === 'replies' || subpage === 'media')) {
                                document.getElementById('trends').hidden = true;
                                document.getElementById('no-tweets').hidden = false;
                                document.getElementById('no-tweets').innerHTML = html`
                                    <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
                                    <p>${LOC.when_theyll_tweet.message}</p>
                                        `;
                            }
                            else {
                                document.getElementById('no-tweets').hidden = true;
                                document.getElementById('no-tweets').innerHTML = html``;
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
                        document.getElementById('no-tweets').innerHTML = html`
                            <h3>${LOC.hasnt_tweeted.message.replace('$SCREEN_NAME$', `<span>${pageUser.screen_name}</span>`)}</h3>
                            <p>${LOC.when_theyll_tweet.message}</p>
                            `;
                    }
                    else {
                        document.getElementById('trends').hidden = false;
                        document.getElementById('no-tweets').hidden = true;
                        document.getElementById('no-tweets').innerHTML = html``;
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
            let modal = createModal(html`
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
            createModal(`
                <h1 class="cool-header">${LOC.from_list.message}</h1>
                <div id="modal-lists"></div>
            `);
            let container = document.getElementById('modal-lists');
            for(let i in lists) {
                let l = lists[i];
                let listElement = document.createElement('div');
                listElement.classList.add('list-item');
                listElement.innerHTML = html`
                    <div style="display:inline-block;">
                        <a href="/i/lists/${l.id_str}" class="following-item-link">
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
                openInNewTab(`/${pageUser.screen_name}/lists`);
            }
        });
        document.getElementById('profile-settings-lists').addEventListener('click', async () => {
            // document.getElementById('loading-box').hidden = false;
            history.pushState({}, null, `/${pageUser.screen_name}/lists`);
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
            navigator.share({ url: `https://${location.hostname}/${pageUser.screen_name}` });
        });
        document.getElementById('profile-settings-copy').addEventListener('click', async () => {
            navigator.clipboard.writeText(`https://${location.hostname}/${pageUser.screen_name}`);
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
            if(!link.href.startsWith('/')) link.target = '_blank';
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
        aff.innerHTML = html`
            <img style="display: inline-block;vertical-align: top;image-rendering: pixelated;" src="${pageUser.affiliates_highlighted_label.badge.url}" width="20" height="20"> 
            <a style="color:var(--almost-black)!important" href="${pageUser.affiliates_highlighted_label.url ? pageUser.affiliates_highlighted_label.url.url : '#'}">${pageUser.affiliates_highlighted_label.description}</a>
        `;
        additionalInfo.appendChild(aff);
    }
    if(pageUser.url) {
        let url = document.createElement('a');
        url.classList.add('profile-additional-thing', 'profile-additional-url');
        let realUrl = pageUser.entities.url.urls[0];
        url.innerText = realUrl.display_url || realUrl.url;
        url.href = realUrl.expanded_url || realUrl.url;
        if(!url.href.startsWith('/')) url.target = "_blank";
        additionalInfo.appendChild(url);
    }
    if(pageUser.professional && pageUser.professional.category && pageUser.professional.category[0]) {
        let prof = document.createElement('span');
        prof.classList.add('profile-additional-thing', 'profile-additional-professional');
        prof.innerText = pageUser.professional.category[0].name;
        additionalInfo.appendChild(prof);
        if(vars.enableTwemoji) twemoji.parse(prof);
    }
    if(pageUser.about?.account_based_in) {
        let country = pageUser.about.account_based_in;
        let flag = getCountryFlag(pageUser.about.account_based_in)
        let vpn = !pageUser.about.location_accurate;

        let countryDisplay = flag ? `${flag} ${country}` : country;
        if (vpn) countryDisplay += ` ${LOC.based_in_vpn.message}`

        let basedIn = document.createElement('span');
        basedIn.classList.add('profile-additional-thing', 'profile-additional-based-in');

        basedIn.innerText = `${LOC.based_in.message} ${countryDisplay}`;
        additionalInfo.appendChild(basedIn);
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
            birth.innerText = `${LOC.born.message}  ${LOC.mmdd.message.replace('$MONTH$',months[pageUser.birthdate.month-1]).replace("$DATE$", pageUser.birthdate.day)}`;
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
                    text: html`<a href="/${t.user.screen_name}">${t.user.name}</a> ${LOC.retweeted.message}`,
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

function getCountryFlag(country) {
    let map = [ //mostly accurate to internal twitter mapping
        {
            name: 'Andorra',
            code: 'AD',
            emoji: '🇦🇩'
        },
        {
            name: 'United Arab Emirates',
            code: 'AE',
            emoji: '🇦🇪'
        },
        {
            name: 'Afghanistan',
            code: 'AF',
            emoji: '🇦🇫'
        },
        {
            name: 'Antigua and Barbuda',
            code: 'AG',
            emoji: '🇦🇬'
        },
        {
            name: 'Anguilla',
            code: 'AI',
            emoji: '🇦🇮'
        },
        {
            name: 'Albania',
            code: 'AL',
            emoji: '🇦🇱'
        },
        {
            name: 'Armenia',
            code: 'AM',
            emoji: '🇦🇲'
        },
        {
            name: 'Angola',
            code: 'AO',
            emoji: '🇦🇴'
        },
        {
            name: 'Antarctica',
            code: 'AQ',
            emoji: '🇦🇶'
        },
        {
            name: 'Argentina',
            code: 'AR',
            emoji: '🇦🇷'
        },
        {
            name: 'American Samoa',
            code: 'AS',
            emoji: '🇦🇸'
        },
        {
            name: 'Austria',
            code: 'AT',
            emoji: '🇦🇹'
        },
        {
            name: 'Australia',
            code: 'AU',
            emoji: '🇦🇺'
        },
        {
            name: 'Aruba',
            code: 'AW',
            emoji: '🇦🇼'
        },
        {
            name: 'Åland Islands',
            code: 'AX',
            emoji: '🇦🇽'
        },
        {
            name: 'Azerbaijan',
            code: 'AZ',
            emoji: '🇦🇿'
        },
        {
            name: 'Bosnia and Herzegovina',
            code: 'BA',
            emoji: '🇧🇦'
        },
        {
            name: 'Barbados',
            code: 'BB',
            emoji: '🇧🇧'
        },
        {
            name: 'Bangladesh',
            code: 'BD',
            emoji: '🇧🇩'
        },
        {
            name: 'Belgium',
            code: 'BE',
            emoji: '🇧🇪'
        },
        {
            name: 'Burkina Faso',
            code: 'BF',
            emoji: '🇧🇫'
        },
        {
            name: 'Bulgaria',
            code: 'BG',
            emoji: '🇧🇬'
        },
        {
            name: 'Bahrain',
            code: 'BH',
            emoji: '🇧🇭'
        },
        {
            name: 'Burundi',
            code: 'BI',
            emoji: '🇧🇮'
        },
        {
            name: 'Benin',
            code: 'BJ',
            emoji: '🇧🇯'
        },
        {
            name: 'St. Barthélemy',
            code: 'BL',
            emoji: '🇧🇱'
        },
        {
            name: 'Bermuda',
            code: 'BM',
            emoji: '🇧🇲'
        },
        {
            name: 'Brunei',
            code: 'BN',
            emoji: '🇧🇳'
        },
        {
            name: 'Bolivia',
            code: 'BO',
            emoji: '🇧🇴'
        },
        {
            name: 'Brazil',
            code: 'BR',
            emoji: '🇧🇷'
        },
        {
            name: 'Bahamas',
            code: 'BS',
            emoji: '🇧🇸'
        },
        {
            name: 'Bhutan',
            code: 'BT',
            emoji: '🇧🇹'
        },
        {
            name: 'Botswana',
            code: 'BW',
            emoji: '🇧🇼'
        },
        {
            name: 'Belarus',
            code: 'BY',
            emoji: '🇧🇾'
        },
        {
            name: 'Belize',
            code: 'BZ',
            emoji: '🇧🇿'
        },
        {
            name: 'Canada',
            code: 'CA',
            emoji: '🇨🇦'
        },
        {
            name: 'Cocos (Keeling) Islands',
            code: 'CC',
            emoji: '🇨🇨'
        },
        {
            name: 'Congo - Kinshasa',
            code: 'CD',
            emoji: '🇨🇩'
        },
        {
            name: 'Central African Republic',
            code: 'CF',
            emoji: '🇨🇫'
        },
        {
            name: 'Congo - Brazzaville',
            code: 'CG',
            emoji: '🇨🇬'
        },
        {
            name: 'Switzerland',
            code: 'CH',
            emoji: '🇨🇭'
        },
        {
            name: 'Côte d’Ivoire',
            code: 'CI',
            emoji: '🇨🇮'
        },
        {
            name: 'Cook Islands',
            code: 'CK',
            emoji: '🇨🇰'
        },
        {
            name: 'Chile',
            code: 'CL',
            emoji: '🇨🇱'
        },
        {
            name: 'Cameroon',
            code: 'CM',
            emoji: '🇨🇲'
        },
        {
            name: 'China',
            code: 'CN',
            emoji: '🇨🇳'
        },
        {
            name: 'Colombia',
            code: 'CO',
            emoji: '🇨🇴'
        },
        {
            name: 'Costa Rica',
            code: 'CR',
            emoji: '🇨🇷'
        },
        {
            name: 'Cuba',
            code: 'CU',
            emoji: '🇨🇺'
        },
        {
            name: 'Cape Verde',
            code: 'CV',
            emoji: '🇨🇻'
        },
        {
            name: 'Christmas Island',
            code: 'CX',
            emoji: '🇨🇽'
        },
        {
            name: 'Cyprus',
            code: 'CY',
            emoji: '🇨🇾'
        },
        {
            name: 'Czech Republic',
            code: 'CZ',
            emoji: '🇨🇿'
        },
        {
            name: 'Germany',
            code: 'DE',
            emoji: '🇩🇪'
        },
        {
            name: 'Djibouti',
            code: 'DJ',
            emoji: '🇩🇯'
        },
        {
            name: 'Denmark',
            code: 'DK',
            emoji: '🇩🇰'
        },
        {
            name: 'Dominica',
            code: 'DM',
            emoji: '🇩🇲'
        },
        {
            name: 'Dominican Republic',
            code: 'DO',
            emoji: '🇩🇴'
        },
        {
            name: 'Algeria',
            code: 'DZ',
            emoji: '🇩🇿'
        },
        {
            name: 'Ecuador',
            code: 'EC',
            emoji: '🇪🇨'
        },
        {
            name: 'Estonia',
            code: 'EE',
            emoji: '🇪🇪'
        },
        {
            name: 'Egypt',
            code: 'EG',
            emoji: '🇪🇬'
        },
        {
            name: 'Eritrea',
            code: 'ER',
            emoji: '🇪🇷'
        },
        {
            name: 'Spain',
            code: 'ES',
            emoji: '🇪🇸'
        },
        {
            name: 'Ethiopia',
            code: 'ET',
            emoji: '🇪🇹'
        },
        {
            name: 'Finland',
            code: 'FI',
            emoji: '🇫🇮'
        },
        {
            name: 'Fiji',
            code: 'FJ',
            emoji: '🇫🇯'
        },
        {
            name: 'Falkland Islands',
            code: 'FK',
            emoji: '🇫🇰'
        },
        {
            name: 'Micronesia',
            code: 'FM',
            emoji: '🇫🇲'
        },
        {
            name: 'Faroe Islands',
            code: 'FO',
            emoji: '🇫🇴'
        },
        {
            name: 'France',
            code: 'FR',
            emoji: '🇫🇷'
        },
        {
            name: 'Gabon',
            code: 'GA',
            emoji: '🇬🇦'
        },
        {
            name: 'United Kingdom',
            code: 'GB',
            emoji: '🇬🇧'
        },
        {
            name: 'Grenada',
            code: 'GD',
            emoji: '🇬🇩'
        },
        {
            name: 'Georgia',
            code: 'GE',
            emoji: '🇬🇪'
        },
        {
            name: 'French Guiana',
            code: 'GF',
            emoji: '🇬🇫'
        },
        {
            name: 'Guernsey',
            code: 'GG',
            emoji: '🇬🇬'
        },
        {
            name: 'Ghana',
            code: 'GH',
            emoji: '🇬🇭'
        },
        {
            name: 'Gibraltar',
            code: 'GI',
            emoji: '🇬🇮'
        },
        {
            name: 'Greenland',
            code: 'GL',
            emoji: '🇬🇱'
        },
        {
            name: 'Gambia',
            code: 'GM',
            emoji: '🇬🇲'
        },
        {
            name: 'Guinea',
            code: 'GN',
            emoji: '🇬🇳'
        },
        {
            name: 'Guadeloupe',
            code: 'GP',
            emoji: '🇬🇵'
        },
        {
            name: 'Equatorial Guinea',
            code: 'GQ',
            emoji: '🇬🇶'
        },
        {
            name: 'Greece',
            code: 'GR',
            emoji: '🇬🇷'
        },
        {
            name: 'South Georgia and South Sandwich Islands',
            code: 'GS',
            emoji: '🇬🇸'
        },
        {
            name: 'Guatemala',
            code: 'GT',
            emoji: '🇬🇹'
        },
        {
            name: 'Guam',
            code: 'GU',
            emoji: '🇬🇺'
        },
        {
            name: 'Guinea-Bissau',
            code: 'GW',
            emoji: '🇬🇼'
        },
        {
            name: 'Guyana',
            code: 'GY',
            emoji: '🇬🇾'
        },
        {
            name: 'Hong Kong SAR China',
            code: 'HK',
            emoji: '🇭🇰'
        },
        {
            name: 'Honduras',
            code: 'HN',
            emoji: '🇭🇳'
        },
        {
            name: 'Croatia',
            code: 'HR',
            emoji: '🇭🇷'
        },
        {
            name: 'Haiti',
            code: 'HT',
            emoji: '🇭🇹'
        },
        {
            name: 'Hungary',
            code: 'HU',
            emoji: '🇭🇺'
        },
        {
            name: 'Indonesia',
            code: 'ID',
            emoji: '🇮🇩'
        },
        {
            name: 'Ireland',
            code: 'IE',
            emoji: '🇮🇪'
        },
        {
            name: 'Israel',
            code: 'IL',
            emoji: '🇮🇱'
        },
        {
            name: 'Isle of Man',
            code: 'IM',
            emoji: '🇮🇲'
        },
        {
            name: 'India',
            code: 'IN',
            emoji: '🇮🇳'
        },
        {
            name: 'British Indian Ocean Territory',
            code: 'IO',
            emoji: '🇮🇴'
        },
        {
            name: 'Iraq',
            code: 'IQ',
            emoji: '🇮🇶'
        },
        {
            name: 'Iran',
            code: 'IR',
            emoji: '🇮🇷'
        },
        {
            name: 'Iceland',
            code: 'IS',
            emoji: '🇮🇸'
        },
        {
            name: 'Italy',
            code: 'IT',
            emoji: '🇮🇹'
        },
        {
            name: 'Jersey',
            code: 'JE',
            emoji: '🇯🇪'
        },
        {
            name: 'Jamaica',
            code: 'JM',
            emoji: '🇯🇲'
        },
        {
            name: 'Jordan',
            code: 'JO',
            emoji: '🇯🇴'
        },
        {
            name: 'Japan',
            code: 'JP',
            emoji: '🇯🇵'
        },
        {
            name: 'Kenya',
            code: 'KE',
            emoji: '🇰🇪'
        },
        {
            name: 'Kyrgyzstan',
            code: 'KG',
            emoji: '🇰🇬'
        },
        {
            name: 'Cambodia',
            code: 'KH',
            emoji: '🇰🇭'
        },
        {
            name: 'Kiribati',
            code: 'KI',
            emoji: '🇰🇮'
        },
        {
            name: 'Comoros',
            code: 'KM',
            emoji: '🇰🇲'
        },
        {
            name: 'St. Kitts and Nevis',
            code: 'KN',
            emoji: '🇰🇳'
        },
        {
            name: 'Democratic People\'s Republic of Korea',
            code: 'KP',
            emoji: '🇰🇵'
        },
        {
            name: 'Korea',
            code: 'KR',
            emoji: '🇰🇷'
        },
        {
            name: 'Kuwait',
            code: 'KW',
            emoji: '🇰🇼'
        },
        {
            name: 'Cayman Islands',
            code: 'KY',
            emoji: '🇰🇾'
        },
        {
            name: 'Kazakhstan',
            code: 'KZ',
            emoji: '🇰🇿'
        },
        {
            name: 'Laos',
            code: 'LA',
            emoji: '🇱🇦'
        },
        {
            name: 'Lebanon',
            code: 'LB',
            emoji: '🇱🇧'
        },
        {
            name: 'St. Lucia',
            code: 'LC',
            emoji: '🇱🇨'
        },
        {
            name: 'Liechtenstein',
            code: 'LI',
            emoji: '🇱🇮'
        },
        {
            name: 'Sri Lanka',
            code: 'LK',
            emoji: '🇱🇰'
        },
        {
            name: 'Liberia',
            code: 'LR',
            emoji: '🇱🇷'
        },
        {
            name: 'Lesotho',
            code: 'LS',
            emoji: '🇱🇸'
        },
        {
            name: 'Lithuania',
            code: 'LT',
            emoji: '🇱🇹'
        },
        {
            name: 'Luxembourg',
            code: 'LU',
            emoji: '🇱🇺'
        },
        {
            name: 'Latvia',
            code: 'LV',
            emoji: '🇱🇻'
        },
        {
            name: 'Libya',
            code: 'LY',
            emoji: '🇱🇾'
        },
        {
            name: 'Morocco',
            code: 'MA',
            emoji: '🇲🇦'
        },
        {
            name: 'Monaco',
            code: 'MC',
            emoji: '🇲🇨'
        },
        {
            name: 'Moldova',
            code: 'MD',
            emoji: '🇲🇩'
        },
        {
            name: 'Montenegro',
            code: 'ME',
            emoji: '🇲🇪'
        },
        {
            name: 'St. Martin',
            code: 'MF',
            emoji: '🇲🇫'
        },
        {
            name: 'Madagascar',
            code: 'MG',
            emoji: '🇲🇬'
        },
        {
            name: 'Marshall Islands',
            code: 'MH',
            emoji: '🇲🇭'
        },
        {
            name: 'North Macedonia',
            code: 'MK',
            emoji: '🇲🇰'
        },
        {
            name: 'Mali',
            code: 'ML',
            emoji: '🇲🇱'
        },
        {
            name: 'Myanmar (Burma)',
            code: 'MM',
            emoji: '🇲🇲'
        },
        {
            name: 'Mongolia',
            code: 'MN',
            emoji: '🇲🇳'
        },
        {
            name: 'Macao SAR China',
            code: 'MO',
            emoji: '🇲🇴'
        },
        {
            name: 'Northern Mariana Islands',
            code: 'MP',
            emoji: '🇲🇵'
        },
        {
            name: 'Martinique',
            code: 'MQ',
            emoji: '🇲🇶'
        },
        {
            name: 'Mauritania',
            code: 'MR',
            emoji: '🇲🇷'
        },
        {
            name: 'Montserrat',
            code: 'MS',
            emoji: '🇲🇸'
        },
        {
            name: 'Malta',
            code: 'MT',
            emoji: '🇲🇹'
        },
        {
            name: 'Mauritius',
            code: 'MU',
            emoji: '🇲🇺'
        },
        {
            name: 'Maldives',
            code: 'MV',
            emoji: '🇲🇻'
        },
        {
            name: 'Malawi',
            code: 'MW',
            emoji: '🇲🇼'
        },
        {
            name: 'Mexico',
            code: 'MX',
            emoji: '🇲🇽'
        },
        {
            name: 'Malaysia',
            code: 'MY',
            emoji: '🇲🇾'
        },
        {
            name: 'Mozambique',
            code: 'MZ',
            emoji: '🇲🇿'
        },
        {
            name: 'Namibia',
            code: 'NA',
            emoji: '🇳🇦'
        },
        {
            name: 'New Caledonia',
            code: 'NC',
            emoji: '🇳🇨'
        },
        {
            name: 'Niger',
            code: 'NE',
            emoji: '🇳🇪'
        },
        {
            name: 'Norfolk Island',
            code: 'NF',
            emoji: '🇳🇫'
        },
        {
            name: 'Nigeria',
            code: 'NG',
            emoji: '🇳🇬'
        },
        {
            name: 'Nicaragua',
            code: 'NI',
            emoji: '🇳🇮'
        },
        {
            name: 'Netherlands',
            code: 'NL',
            emoji: '🇳🇱'
        },
        {
            name: 'Norway',
            code: 'NO',
            emoji: '🇳🇴'
        },
        {
            name: 'Nepal',
            code: 'NP',
            emoji: '🇳🇵'
        },
        {
            name: 'Nauru',
            code: 'NR',
            emoji: '🇳🇷'
        },
        {
            name: 'Niue',
            code: 'NU',
            emoji: '🇳🇺'
        },
        {
            name: 'New Zealand',
            code: 'NZ',
            emoji: '🇳🇿'
        },
        {
            name: 'Oman',
            code: 'OM',
            emoji: '🇴🇲'
        },
        {
            name: 'Panama',
            code: 'PA',
            emoji: '🇵🇦'
        },
        {
            name: 'Peru',
            code: 'PE',
            emoji: '🇵🇪'
        },
        {
            name: 'French Polynesia',
            code: 'PF',
            emoji: '🇵🇫'
        },
        {
            name: 'Papua New Guinea',
            code: 'PG',
            emoji: '🇵🇬'
        },
        {
            name: 'Philippines',
            code: 'PH',
            emoji: '🇵🇭'
        },
        {
            name: 'Pakistan',
            code: 'PK',
            emoji: '🇵🇰'
        },
        {
            name: 'Poland',
            code: 'PL',
            emoji: '🇵🇱'
        },
        {
            name: 'St. Pierre and Miquelon',
            code: 'PM',
            emoji: '🇵🇲'
        },
        {
            name: 'Pitcairn Islands',
            code: 'PN',
            emoji: '🇵🇳'
        },
        {
            name: 'Puerto Rico',
            code: 'PR',
            emoji: '🇵🇷'
        },
        {
            name: 'Palestine',
            code: 'PS',
            emoji: '🇵🇸'
        },
        {
            name: 'Portugal',
            code: 'PT',
            emoji: '🇵🇹'
        },
        {
            name: 'Palau',
            code: 'PW',
            emoji: '🇵🇼'
        },
        {
            name: 'Paraguay',
            code: 'PY',
            emoji: '🇵🇾'
        },
        {
            name: 'Qatar',
            code: 'QA',
            emoji: '🇶🇦'
        },
        {
            name: 'Réunion',
            code: 'RE',
            emoji: '🇷🇪'
        },
        {
            name: 'Romania',
            code: 'RO',
            emoji: '🇷🇴'
        },
        {
            name: 'Serbia',
            code: 'RS',
            emoji: '🇷🇸'
        },
        {
            name: 'Russian Federation',
            code: 'RU',
            emoji: '🇷🇺'
        },
        {
            name: 'Rwanda',
            code: 'RW',
            emoji: '🇷🇼'
        },
        {
            name: 'Saudi Arabia',
            code: 'SA',
            emoji: '🇸🇦'
        },
        {
            name: 'Solomon Islands',
            code: 'SB',
            emoji: '🇸🇧'
        },
        {
            name: 'Seychelles',
            code: 'SC',
            emoji: '🇸🇨'
        },
        {
            name: 'Sudan',
            code: 'SD',
            emoji: '🇸🇩'
        },
        {
            name: 'Sweden',
            code: 'SE',
            emoji: '🇸🇪'
        },
        {
            name: 'Singapore',
            code: 'SG',
            emoji: '🇸🇬'
        },
        {
            name: 'St. Helena',
            code: 'SH',
            emoji: '🇸🇭'
        },
        {
            name: 'Slovenia',
            code: 'SI',
            emoji: '🇸🇮'
        },
        {
            name: 'Svalbard and Jan Mayen',
            code: 'SJ',
            emoji: '🇸🇯'
        },
        {
            name: 'Slovakia',
            code: 'SK',
            emoji: '🇸🇰'
        },
        {
            name: 'Sierra Leone',
            code: 'SL',
            emoji: '🇸🇱'
        },
        {
            name: 'San Marino',
            code: 'SM',
            emoji: '🇸🇲'
        },
        {
            name: 'Senegal',
            code: 'SN',
            emoji: '🇸🇳'
        },
        {
            name: 'Somalia',
            code: 'SO',
            emoji: '🇸🇴'
        },
        {
            name: 'Suriname',
            code: 'SR',
            emoji: '🇸🇷'
        },
        {
            name: 'South Sudan',
            code: 'SS',
            emoji: '🇸🇸'
        },
        {
            name: 'São Tomé and Príncipe',
            code: 'ST',
            emoji: '🇸🇹'
        },
        {
            name: 'El Salvador',
            code: 'SV',
            emoji: '🇸🇻'
        },
        {
            name: 'Syria',
            code: 'SY',
            emoji: '🇸🇾'
        },
        {
            name: 'Eswatini',
            code: 'SZ',
            emoji: '🇸🇿'
        },
        {
            name: 'Turks and Caicos Islands',
            code: 'TC',
            emoji: '🇹🇨'
        },
        {
            name: 'Chad',
            code: 'TD',
            emoji: '🇹🇩'
        },
        {
            name: 'Togo',
            code: 'TG',
            emoji: '🇹🇬'
        },
        {
            name: 'Thailand',
            code: 'TH',
            emoji: '🇹🇭'
        },
        {
            name: 'Tajikistan',
            code: 'TJ',
            emoji: '🇹🇯'
        },
        {
            name: 'Tokelau',
            code: 'TK',
            emoji: '🇹🇰'
        },
        {
            name: 'Timor-Leste',
            code: 'TL',
            emoji: '🇹🇱'
        },
        {
            name: 'Turkmenistan',
            code: 'TM',
            emoji: '🇹🇲'
        },
        {
            name: 'Tunisia',
            code: 'TN',
            emoji: '🇹🇳'
        },
        {
            name: 'Tonga',
            code: 'TO',
            emoji: '🇹🇴'
        },
        {
            name: 'Turkey',
            code: 'TR',
            emoji: '🇹🇷'
        },
        {
            name: 'Trinidad and Tobago',
            code: 'TT',
            emoji: '🇹🇹'
        },
        {
            name: 'Tuvalu',
            code: 'TV',
            emoji: '🇹🇻'
        },
        {
            name: 'Taiwan',
            code: 'TW',
            emoji: '🇹🇼'
        },
        {
            name: 'Tanzania',
            code: 'TZ',
            emoji: '🇹🇿'
        },
        {
            name: 'Ukraine',
            code: 'UA',
            emoji: '🇺🇦'
        },
        {
            name: 'Uganda',
            code: 'UG',
            emoji: '🇺🇬'
        },
        {
            name: 'United States',
            code: 'US',
            emoji: '🇺🇸'
        },
        {
            name: 'Uruguay',
            code: 'UY',
            emoji: '🇺🇾'
        },
        {
            name: 'Uzbekistan',
            code: 'UZ',
            emoji: '🇺🇿'
        },
        {
            name: 'Vatican City',
            code: 'VA',
            emoji: '🇻🇦'
        },
        {
            name: 'St. Vincent and Grenadines',
            code: 'VC',
            emoji: '🇻🇨'
        },
        {
            name: 'Venezuela',
            code: 'VE',
            emoji: '🇻🇪'
        },
        {
            name: 'British Virgin Islands',
            code: 'VG',
            emoji: '🇻🇬'
        },
        {
            name: 'U.S. Virgin Islands',
            code: 'VI',
            emoji: '🇻🇮'
        },
        {
            name: 'Viet Nam',
            code: 'VN',
            emoji: '🇻🇳'
        },
        {
            name: 'Vanuatu',
            code: 'VU',
            emoji: '🇻🇺'
        },
        {
            name: 'Wallis and Futuna',
            code: 'WF',
            emoji: '🇼🇫'
        },
        {
            name: 'Samoa',
            code: 'WS',
            emoji: '🇼🇸'
        },
        {
            name: 'Yemen',
            code: 'YE',
            emoji: '🇾🇪'
        },
        {
            name: 'Mayotte',
            code: 'YT',
            emoji: '🇾🇹'
        },
        {
            name: 'South Africa',
            code: 'ZA',
            emoji: '🇿🇦'
        },
        {
            name: 'Zambia',
            code: 'ZM',
            emoji: '🇿🇲'
        },
        {
            name: 'Zimbabwe',
            code: 'ZW',
            emoji: '🇿🇼'
        }
    ]

    let lower = country.toLowerCase()
    let flag = map.find(c => c.name.toLowerCase() === lower || c.code.toLowerCase() === lower)?.emoji;

    return flag || null;
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
    activeTweet = tweets.find(t => scrollPoint > t.offsetTop && scrollPoint < t.offsetTop + t.scrollHeight);
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
    console.log(3, vars);
    try {
        if(!vars) {
            await loadVars();
        }
    } catch(e) {
        await loadVars();
    }
    while(!LOC || !LOC.january) {
        await sleep(10);
    }
    months = [LOC.january.message, LOC.february.message, LOC.march.message, LOC.april.message, LOC.may.message, LOC.june.message, LOC.july.message, LOC.august.message, LOC.september.message, LOC.october.message, LOC.november.message, LOC.december.message];

    // weird bug
    if(!document.getElementById('new-tweets')) {
        return setTimeout(() => location.reload(), 2500);
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
        setTimeout(() => location.reload(), 2500);
        console.error(e);
        return;
    }

    // mouse
    let banner = document.getElementById('profile-banner');
    let navProfileInfo = document.getElementById('nav-profile-info');
    let tweetsLink = document.getElementById('profile-stats');
    let lastScrollAmount = window.scrollY;
    if(innerWidth < 590) document.getElementById('nav-profile-name').addEventListener('click', e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        window.scrollTo(0, 0);
    })
    document.addEventListener('scroll', async () => {
        lastScroll = Date.now();

        // make user nav appear
        if(window.scrollY >= 110) {
            if(innerWidth < 590) tweetsLink.style.opacity = 1;
            else tweetsLink.style.opacity = 1;
        } else {
            if(innerWidth < 590) tweetsLink.style.opacity = 0;
            else tweetsLink.style.opacity = 1;
        }
        if (innerWidth <= 880) { //Mobile layout
            if(window.scrollY >= 600) {
                if(!navProfileInfo.style.opacity) {
                    if(lastScrollAmount > window.scrollY) {
                        navProfileInfo.style.opacity = 1;
                    } else {
                        navProfileInfo.style.opacity = '';
                    }
                } else {
                    if(lastScrollAmount > window.scrollY) {
                        navProfileInfo.style.opacity = 1;
                    } else {
                        navProfileInfo.style.opacity = '';
                    }
                }
            } else {
                if(navProfileInfo.style.opacity) {
                    navProfileInfo.style.opacity = '';
                }
            }
        } else {
            if(window.scrollY >= 600) {
                if(!navProfileInfo.style.opacity) {
                    navProfileInfo.style.opacity = 1;
                }
            } else {
                if(navProfileInfo.style.opacity) {
                    navProfileInfo.style.opacity = '';
                }
            }
        }
        
        lastScrollAmount = window.scrollY;
        
        // banner scroll
        banner.style.top = `${5+Math.min(window.scrollY/4, 470/4)}px`;
    
        // load more stuff
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 1000) {
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
                    document.getElementById("timeline").innerHTML = html`<div class="unable_load_timeline" dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.blocked_by_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.why_you_cant_see_block_user.message.replaceAll("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                    return;
                } else if (user_protected) {
                    document.getElementById("timeline").innerHTML = html`<div class="unable_load_timeline" dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.user_protected.message}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.follow_to_see.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</p></div>`;
                    return;
                } /*else if (user_blocking)  {
                  document.getElementById("timeline").innerHTML = html`<div class="unable_load_timeline" dir="auto" style="padding: 50px;color: var(--darker-gray); font-size: 20px;"><h2>${LOC.you_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</h2><p style="font-size: 15px;" href="/${pageUser.screen_name}">${LOC.do_you_want_see_blocked_user.message.replace("$SCREEN_NAME$",pageUser.screen_name)}</p><button class="nice-button" id="see-tweet-btn">${LOC.I_want_see_blocked_user.message}</button> </div>`;
                
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
    if(document.getElementById('profile-stat-followers-mobile')) {
        document.getElementById('profile-stat-followers-mobile').addEventListener('click', updatePath);
    }
    if(document.getElementById('profile-stat-following-mobile')) {
        document.getElementById('profile-stat-following-mobile').addEventListener('click', updatePath);
    }
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
            if(/^\/[A-z-0-9-_]{1,15}$/.test(path) && ["/home", "/", "/notifications", "/messages", "/settings", "/search", "/explore", "/login", "/register", "/logout", "/search-advanced"].indexOf(path) === -1) {
                if(document.querySelector(".modal")) return;
                e.preventDefault();
                window.scrollTo(0, 0);
                mediaToUpload = [];
                loadingNewTweets = true;
                document.getElementById('loading-box').hidden = false;
                everAddedAdditional = false;
                document.getElementById('timeline').innerHTML = html`
                <div class="loading-data" id="tweets-loader">
                    <img src="${chrome.runtime.getURL(`images/loading.svg`)}" width="64" height="64">
                </div>`;
                document.getElementById('profile-media-div').innerHTML = '';
                document.getElementById('tweet-to-bg').hidden = true;
                document.getElementById('profile-additional').innerHTML = '';
                document.getElementById('profile-friends-div').innerHTML = '';
                history.pushState({}, null, `/${path.substring(1)}`);
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
        if(notificationsOpened || inboxOpened) return;
        
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

    let imeTyping = false;
    document.getElementById('user-search-input').addEventListener('compositionstart', () => {
        imeTyping = true;
    });
    document.getElementById('user-search-input').addEventListener('compositionend', () => {
        setTimeout(() => {
            imeTyping = false;
        }, 50);
    });
    document.getElementById('user-search-input').addEventListener('keydown', e => {
        if(imeTyping) return;
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
    document.getElementById('profile-avatar').addEventListener('click', e => {
        openInNewTab(pageUser.profile_image_url_https.replace('_normal.', '.'));
    });
    window.onbeforeunload = function (e) {
        if(!unsaved) return;
        e = e || window.event;
    
        // For IE and Firefox prior to version 4
        if (e) {
            e.returnValue = 'Sure?';
        }
    
        // For Safari
        return 'Sure?';
    };

    if(vars.showUserFollowerCountsInLists) {
        let style = document.createElement('style');
        style.innerHTML = html`.user-item-text { bottom: -3px !important; }`;
        document.head.appendChild(style);
    }

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
