// This script generates Firefox version of the extension and packs Chrome and Firefox versions to zip files.

const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const args = process.argv.slice(2);

async function copyDir(src, dest) {
    const entries = await fsp.readdir(src, { withFileTypes: true });
    await fsp.mkdir(dest);
    for (let entry of entries) {
        if(entry.name === '.git' || entry.name === '.github' || entry.name === '_metadata' || entry.name === 'node_modules') continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fsp.copyFile(srcPath, destPath);
        }
    }
}

if(fs.existsSync('../OldTwitterTempChrome')) {
  fs.rmSync('../OldTwitterTempChrome', { recursive: true });
}
if(fs.existsSync('../OldTwitterFirefox')) {
  fs.rmSync('../OldTwitterFirefox', { recursive: true });
}

console.log("Copying...");
copyDir('./', '../OldTwitterFirefox').then(async () => {
    await copyDir('./', '../OldTwitterTempChrome');
    console.log("Copied!");
    console.log("Patching...");
    let manifest = JSON.parse(fs.readFileSync('../OldTwitterFirefox/manifest.json', 'utf8'));
    manifest.manifest_version = 2;
    manifest.background.scripts = ['scripts/background.js'];
    manifest.web_accessible_resources = manifest.web_accessible_resources[0].resources;
    manifest.permissions = manifest.permissions.filter(p => p !== 'declarativeNetRequest' && p !== 'contextMenus' && p !== 'scripting');
    manifest.permissions = [
        ...manifest.permissions,
        ...manifest.host_permissions,
        "https://dimden.dev/*",
        "https://raw.githubusercontent.com/*",
        "webRequest",
        "webRequestBlocking"
    ];
    delete manifest.host_permissions;
    delete manifest.declarative_net_request;
    delete manifest.background.service_worker;
    delete manifest.action;
    manifest.content_scripts = [
        {
          "matches": ["https://mobile.twitter.com/*", "https://twitter.com/*?*newtwitter=true*"],
          "js": ["scripts/xIconRemove.js"],
          "all_frames": true,
          "run_at": "document_start"
        },
        {
          "matches": ["https://mobile.twitter.com/*", "https://twitter.com/*?*newtwitter=true*"],
          "js": ["scripts/newtwitter.js"],
          "all_frames": true,
          "run_at": "document_end"
        },
        {
          "matches": ["https://twitter.com/*"],
          "exclude_matches": ["https://twitter.com/*?*newtwitter=true*", "https://twitter.com/settings/download_your_data", "https://twitter.com/i/flow/login*"],
          "js": ["scripts/config.js", "scripts/helpers.js", "scripts/apis.js", "scripts/injection.js", "libraries/parseCssColor.js", "libraries/twemoji.min.js", "libraries/custom-elements.min.js", "libraries/emojipicker.js", "libraries/tinytoast.js"],
          "all_frames": true,
          "run_at": "document_start"
        },
        {
          "matches": ["https://twitter.com/*"],
          "exclude_matches": ["https://twitter.com/*?*newtwitter=true*", "https://twitter.com/settings/download_your_data", "https://twitter.com/i/flow/login*"],
          "js": ["layouts/header/script.js", "scripts/tweetviewer.js", "libraries/gif.js", "libraries/viewer.min.js"],
          "css": ["libraries/viewer.min.css"],
          "all_frames": true,
          "run_at": "document_idle"
        },
        {
          "matches": ["https://twitter.com/home", "https://twitter.com/home?*", "https://twitter.com/", "https://twitter.com/?*", "https://twitter.com/home/", "https://twitter.com/home/?*"],
          "js": ["layouts/home/script.js"],
          "all_frames": true,
          "run_at": "document_idle"
        },
        {
          "matches": [
            "https://twitter.com/notifications", "https://twitter.com/notifications/", "https://twitter.com/notifications?*", "https://twitter.com/notifications/?*", 
            "https://twitter.com/notifications/mentions", "https://twitter.com/notifications/mentions?*", "https://twitter.com/notifications/mentions/", "https://twitter.com/notifications/mentions/?*"
          ],
          "js": ["layouts/notifications/script.js"],
          "all_frames": true,
          "run_at": "document_idle"
        },
        {
          "matches": ["https://twitter.com/old/settings", "https://twitter.com/old/settings/", "https://twitter.com/old/settings?*", "https://twitter.com/old/settings/?*"],
          "js": ["layouts/settings/script.js", "libraries/viewer.min.js"],
          "all_frames": true,
          "run_at": "document_idle"
        },
        {
          "matches": ["https://twitter.com/search", "https://twitter.com/search?*", "https://twitter.com/search/", "https://twitter.com/search/?*"],
          "js": ["layouts/search/script.js"],
          "run_at": "document_idle",
          "all_frames": true
        },
        {
          "matches": [
            "https://twitter.com/*/status/*", "https://twitter.com/*/status/*?*", "https://twitter.com/*/status/*/", "https://twitter.com/*/status/*/?*",
            "https://twitter.com/*/status/*/likes", "https://twitter.com/*/status/*/likes/", "https://twitter.com/*/status/*/likes?*", "https://twitter.com/*/status/*/likes/?*",
            "https://twitter.com/*/status/*/retweets", "https://twitter.com/*/status/*/retweets/", "https://twitter.com/*/status/*/retweets?*", "https://twitter.com/*/status/*/retweets/?*",
            "https://twitter.com/*/status/*/retweets/with_comments", "https://twitter.com/*/status/*/retweets/with_comments/", "https://twitter.com/*/status/*/retweets/with_comments?*", "https://twitter.com/*/status/*/retweets/with_comments/?*"
          ],
          "js": ["layouts/tweet/script.js"],
          "run_at": "document_idle",
          "all_frames": true
        },
        {
          "matches": [
            "https://twitter.com/i/lists/*", "https://twitter.com/i/lists/*/", "https://twitter.com/i/lists/*?*", "https://twitter.com/i/lists/*/?*",
            "https://twitter.com/i/lists/*/members", "https://twitter.com/i/lists/*/members/", "https://twitter.com/i/lists/*/members?*", "https://twitter.com/i/lists/*/members/?*",
            "https://twitter.com/i/lists/*/followers", "https://twitter.com/i/lists/*/followers/", "https://twitter.com/i/lists/*/followers?*", "https://twitter.com/i/lists/*/followers/?*"
          ],
          "js": ["layouts/lists/script.js"],
          "all_frames": true,
          "run_at": "document_idle"
        },
        {
          "matches": ["https://twitter.com/i/bookmarks", "https://twitter.com/i/bookmarks/", "https://twitter.com/i/bookmarks?*", "https://twitter.com/i/bookmarks/?*"],
          "js": ["layouts/bookmarks/script.js"],
          "all_frames": true,
          "run_at": "document_idle"
        },
        {
          "matches": ["https://twitter.com/i/topics/*", "https://twitter.com/i/topics/*/", "https://twitter.com/i/topics/*?*", "https://twitter.com/i/topics/*/?*"],
          "js": ["layouts/topics/script.js"],
          "all_frames": true,
          "run_at": "document_idle"
        },
        {
          "matches": ["https://twitter.com/old/history", "https://twitter.com/old/history/", "https://twitter.com/old/history?*", "https://twitter.com/old/history/?*"],
          "js": ["layouts/history/script.js"],
          "all_frames": true,
          "run_at": "document_idle"
        },
        {
          "matches": ["https://twitter.com/old/unfollows/*", "https://twitter.com/old/unfollows/*/", "https://twitter.com/old/unfollows/*?*", "https://twitter.com/old/unfollows/*/?*"],
          "js": ["layouts/unfollows/script.js"],
          "all_frames": true,
          "run_at": "document_idle"
        },
        {
          "matches": ["https://twitter.com/i/timeline", "https://twitter.com/i/timeline?*", "https://twitter.com/i/timeline/", "https://twitter.com/i/timeline/?*"],
          "js": ["layouts/itl/script.js"],
          "all_frames": true,
          "run_at": "document_idle"
        },
        {
          "matches": ["https://twitter.com/*", "https://twitter.com/*/", "https://twitter.com/*/with_replies", "https://twitter.com/*/with_replies/", "https://twitter.com/*/media", "https://twitter.com/*/likes", "https://twitter.com/*/following", "https://twitter.com/*/followers", "https://twitter.com/*/followers_you_follow", "https://twitter.com/*/followers_you_follow/", "https://twitter.com/*/media/", "https://twitter.com/*/likes/", "https://twitter.com/*/following/", "https://twitter.com/*/followers/"],
          "exclude_matches": [
            "https://twitter.com/",
            "https://twitter.com/home",
            "https://twitter.com/notifications",
            "https://twitter.com/notifications/",
            "https://twitter.com/messages",
            "https://twitter.com/messages/",
            "https://twitter.com/settings",
            "https://twitter.com/settings/",
            "https://twitter.com/explore",
            "https://twitter.com/explore/",
            "https://twitter.com/old/*",
            "https://twitter.com/login",
            "https://twitter.com/login/",
            "https://twitter.com/register",
            "https://twitter.com/register/",
            "https://twitter.com/signin",
            "https://twitter.com/signin/",
            "https://twitter.com/signup",
            "https://twitter.com/signup/",
            "https://twitter.com/logout",
            "https://twitter.com/logout/",
            "https://twitter.com/i/*",
            "https://twitter.com/*/status/*",
            "https://twitter.com/*/status/*/",
            "https://twitter.com/search?*",
            "https://twitter.com/search",
            "https://twitter.com/search/",
            "https://twitter.com/search/?*",
            "https://twitter.com/tos",
            "https://twitter.com/privacy",
            "https://twitter.com/*/tos",
            "https://twitter.com/*/privacy"
          ],
          "js": ["layouts/profile/script.js"],
          "run_at": "document_idle",
          "all_frames": true
        }
    ];

    let config = fs.readFileSync('../OldTwitterFirefox/scripts/config.js', 'utf8');
    config = config.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
    let helpers = fs.readFileSync('../OldTwitterFirefox/scripts/helpers.js', 'utf8');
    helpers = helpers.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
    let tweetviewer = fs.readFileSync('../OldTwitterFirefox/scripts/tweetviewer.js', 'utf8');
    tweetviewer = tweetviewer.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
    let content = fs.readFileSync('../OldTwitterFirefox/scripts/injection.js', 'utf8');
    content = content.replace(/chrome.runtime.sendMessage\(\{.+?\}\)/gs, "");
    content = content.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");

    let apis = fs.readFileSync('../OldTwitterFirefox/scripts/apis.js', 'utf8');
    apis = apis.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
    if(apis.includes("&& true") || apis.includes("&& false") || apis.includes("|| true") || apis.includes("|| false") || apis.includes("&&true") || apis.includes("&&false") || apis.includes("||true") || apis.includes("||false")) {
      if(args[0] === '-a') {
        let line = apis.split("\n").findIndex(l => l.includes("&& true") || l.includes("&& false") || l.includes("|| true") || l.includes("|| false") || l.includes("&&true") || l.includes("&&false") || l.includes("||true") || l.includes("||false"));
        console.warn("::warning file=scripts/api.js,line=" + (line+1) + "::Probably temporary boolean left in code.");
      } else {
        for(let i = 0; i < 3; i++) {
          console.warn("\x1b[33m", "Warning: probably temporary boolean left in code.", '\x1b[0m');
        }
      }
    }

    let background = fs.readFileSync('../OldTwitterFirefox/scripts/background_v2.js', 'utf8');
    
    fs.writeFileSync('../OldTwitterFirefox/manifest.json', JSON.stringify(manifest, null, 2));
    fs.writeFileSync('../OldTwitterFirefox/scripts/injection.js', content);
    fs.writeFileSync('../OldTwitterFirefox/scripts/helpers.js', helpers);
    fs.writeFileSync('../OldTwitterFirefox/scripts/tweetviewer.js', tweetviewer);
    fs.writeFileSync('../OldTwitterFirefox/scripts/config.js', config);
    fs.writeFileSync('../OldTwitterFirefox/scripts/background.js', background);
    fs.writeFileSync('../OldTwitterFirefox/scripts/apis.js', apis);
    fs.unlinkSync('../OldTwitterFirefox/ruleset.json');
    fs.unlinkSync('../OldTwitterFirefox/pack.js');
    fs.unlinkSync('../OldTwitterTempChrome/pack.js');
    fs.unlinkSync('../OldTwitterTempChrome/scripts/background_v2.js');
    fs.unlinkSync('../OldTwitterFirefox/scripts/background_v2.js');
    fs.unlinkSync('../OldTwitterFirefox/.gitignore');
    fs.unlinkSync('../OldTwitterTempChrome/.gitignore');
    fs.unlinkSync('../OldTwitterFirefox/test.js');
    fs.unlinkSync('../OldTwitterTempChrome/test.js');
    fs.unlinkSync('../OldTwitterFirefox/package.json');
    fs.unlinkSync('../OldTwitterTempChrome/package.json');
    fs.unlinkSync('../OldTwitterFirefox/package-lock.json');
    fs.unlinkSync('../OldTwitterTempChrome/package-lock.json');

    let layouts = fs.readdirSync('../OldTwitterFirefox/layouts');
    for (let layout of layouts) {
        let script = fs.readFileSync(`../OldTwitterFirefox/layouts/${layout}/script.js`, 'utf8');
        script = script.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
        script = script.replace("https://chrome.google.com/webstore/detail/old-twitter-layout-2022/jgejdcdoeeabklepnkdbglgccjpdgpmf", "https://addons.mozilla.org/en-US/firefox/addon/old-twitter-layout-2022/");
        fs.writeFileSync(`../OldTwitterFirefox/layouts/${layout}/script.js`, script);

        let style = fs.readFileSync(`../OldTwitterFirefox/layouts/${layout}/style.css`, 'utf8');
        style = style.replaceAll("chrome-extension://", "moz-extension://");
        fs.writeFileSync(`../OldTwitterFirefox/layouts/${layout}/style.css`, style);

        let html = fs.readFileSync(`../OldTwitterFirefox/layouts/${layout}/index.html`, 'utf8');
        html = html.replaceAll("chrome-extension://", "moz-extension://");
        fs.writeFileSync(`../OldTwitterFirefox/layouts/${layout}/index.html`, html);
    }

    console.log("Patched!");
    if (fs.existsSync('../OldTwitterFirefox.zip')) {
        console.log("Deleting old zip...");
        fs.unlinkSync('../OldTwitterFirefox.zip');
        console.log("Deleted old zip!");
    }
    console.log("Zipping Firefox version...");
    try {
        const zip = new AdmZip();
        const outputDir = "../OldTwitterFirefox.zip";
        zip.addLocalFolder("../OldTwitterFirefox");
        zip.writeZip(outputDir);
    } catch (e) {
        console.log(`Something went wrong ${e}`);
    }
    console.log(`Zipped Firefox version into ${path.resolve('../OldTwitterFirefox.zip')}!`);
    console.log("Zipping Chrome version...");
    try {
        const zip = new AdmZip();
        const outputDir = "../OldTwitterChrome.zip";
        zip.addLocalFolder("../OldTwitterTempChrome");
        zip.writeZip(outputDir);
    } catch (e) {
        console.log(`Something went wrong ${e}`);
    }
    console.log(`Zipped Chrome version into ${path.resolve('../OldTwitterChrome.zip')}!`);
    console.log("Deleting temporary folders...");
    fs.rmSync('../OldTwitterTempChrome', { recursive: true });
    fs.rmSync('../OldTwitterFirefox', { recursive: true });
    console.log("Deleted!");
});