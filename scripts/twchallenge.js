let solveId = 0;
let solveCallbacks = {};
let solveQueue = []
let solverReady = false;
let solverErrored = false;

let solverIframe = document.createElement('iframe');
solverIframe.style.display = 'none';
solverIframe.src = chrome.runtime.getURL(`sandbox.html`);
let injectedBody = document.getElementById('injected-body');
if(injectedBody) {
    injectedBody.appendChild(solverIframe);
} else {
    let int = setInterval(() => {
        let injectedBody = document.getElementById('injected-body');
        if(injectedBody) {
            injectedBody.appendChild(solverIframe);
            clearInterval(int);
        }
    }, 30);
}

function solveChallenge(path, method) {
    return new Promise((resolve, reject) => {
        if(solverErrored) {
            reject('Solver errored during initialization');
            return;
        }
        let id = solveId++;
        solveCallbacks[id] = { resolve, reject, time: Date.now() };
        if(!solverIframe || !solverIframe.contentWindow || !solverReady) {
            solveQueue.push({ id, path, method })
        } else {
            solverIframe.contentWindow.postMessage({ action: 'solve', id, path, method }, '*');
            // setTimeout(() => {
            //     if(solveCallbacks[id]) {
            //         solveCallbacks[id].reject('Solver timed out');
            //         delete solveCallbacks[id];
            //     }
            // }, 1750);
        }
    });
}

window.addEventListener('message', e => {
    if(e.source !== solverIframe.contentWindow) return;
    let data = e.data;
    if(data.action === 'solved' && typeof data.id === 'number') {
        let { id, result } = data;
        if(solveCallbacks[id]) {
            solveCallbacks[id].resolve(result);
            delete solveCallbacks[id];
        }
    } else if(data.action === 'error' && typeof data.id === 'number') {
        let { id, error } = data;
        if(solveCallbacks[id]) {
            solveCallbacks[id].reject(error);
            delete solveCallbacks[id];
        }
    } else if(data.action === 'initError') {
        solverErrored = true;
        for(let id in solveCallbacks) {
            solveCallbacks[id].reject('Solver errored during initialization');
            delete solveCallbacks[id];
        }
        alert(`There was an error in initializing security header generator: ${data.error}. OldTwitter doesn't allow unsigned requests anymore for your account security.`);
        console.error('Error initializing solver:');
        console.error(data.error);
    } else if(data.action === 'ready') {
        solverReady = true;
        for (let task of solveQueue) {
            solverIframe.contentWindow.postMessage({ action: 'solve', id: task.id, path: task.path, method: task.method }, '*')
        }
    }
});

window._fetch = window.fetch;
fetch = async function(url, options) {
    if(!url.startsWith('/i/api') && !url.startsWith('https://api.twitter.com') && !url.startsWith('https://api.x.com')) return _fetch(url, options);
    if(!options) options = {};
    if(!options.headers) options.headers = {};
    if(!options.headers['x-twitter-auth-type']) {
        options.headers['x-twitter-auth-type'] = 'OAuth2Session';
    }
    if(!options.headers['x-twitter-active-user']) {
        options.headers['x-twitter-active-user'] = 'yes';
    }
    if(!options.headers['X-Client-UUID']) {
        options.headers['X-Client-UUID'] = OLDTWITTER_CONFIG.deviceId;
    }
    if(!url.startsWith('http:') && !url.startsWith('https:')) {
        url = `https://${location.host}${url}`;
    }
    let parsedUrl = new URL(url);
    // try {
        let solved = await solveChallenge(parsedUrl.pathname, options.method ? options.method.toUpperCase() : 'GET');
        options.headers['x-client-transaction-id'] = solved;
    // } catch (e) {
    //     console.error(`Error solving challenge for ${url}:`);
    //     console.error(e);
    // }
    if(options.method && options.method.toUpperCase() === 'POST' && typeof options.body === 'string') {
        options.headers['Content-Length'] = options.body.length;
    }

    return _fetch(url, options);
}

async function initChallenge() {
    try {
        let homepageData;
        let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
        try {
            homepageData = await _fetch(`https://${location.hostname}/`).then(res => res.text());
        } catch(e) {
            await sleep(500);
            try {
                homepageData = await _fetch(`https://${location.hostname}/`).then(res => res.text());
            } catch(e) {
                throw new Error('Failed to fetch homepage: ' + e);
            }
        }
        let dom = new DOMParser().parseFromString(homepageData, 'text/html');
        let verificationKey = dom.querySelector('meta[name="twitter-site-verification"]').content;
        let anims = Array.from(dom.querySelectorAll('svg[id^="loading-x"]')).map(svg => svg.outerHTML);

        let challengeCode = homepageData.match(/"ondemand.s":"(\w+)"/)[1];
        let challengeData;
        try {
            challengeData = await _fetch(`https://abs.twimg.com/responsive-web/client-web/ondemand.s.${challengeCode}a.js`).then(res => res.text());
        } catch(e) {
            await sleep(500);
            try {
                challengeData = await _fetch(`https://abs.twimg.com/responsive-web/client-web/ondemand.s.${challengeCode}a.js`).then(res => res.text());
            } catch(e) {
                await sleep(1000);
                try {
                    challengeData = await _fetch(`https://abs.twimg.com/responsive-web/client-web/ondemand.s.${challengeCode}a.js`).then(res => res.text());
                } catch(e) {
                    throw new Error('Failed to fetch challenge data: ' + e);
                }
            }
        }

        OLDTWITTER_CONFIG.verificationKey = verificationKey;

        function sendInit() {
            solverIframe.contentWindow.postMessage({
                action: 'init',
                code: challengeData,
                challengeCode,
                anims,
                verificationCode: OLDTWITTER_CONFIG.verificationKey
            }, '*');
        }
        if(solverIframe.contentWindow) {
            sendInit();
        } else {
            solverIframe.addEventListener('load', () => sendInit());
        }
        return true;
    } catch (e) {
        console.error(`Error during challenge init:`);
        console.error(e);
        if(location.hostname === 'twitter.com') {
            alert(`There was an error in initializing security header generator: ${e}. OldTwitter doesn't allow unsigned requests anymore for your account security. Currently the main reason for this happening is social network tracker protection blocking the script. Try disabling such settings in your browser and extensions that do that and refresh the page. Also using OldTwitter from twitter.com domain is not supported.`);
        } else {
            alert(`There was an error in initializing security header generator: ${e}. OldTwitter doesn't allow unsigned requests anymore for your account security. Currently the main reason for this happening is social network tracker protection blocking the script. Try disabling such settings in your browser and extensions that do that and refresh the page.`);
        }
        return false;
    }
};

initChallenge();