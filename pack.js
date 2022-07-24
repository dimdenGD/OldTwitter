const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

async function copyDir(src, dest) {
    const entries = await fsp.readdir(src, { withFileTypes: true });
    await fsp.mkdir(dest);
    for (let entry of entries) {
        if(entry.name === '.git') continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fsp.copyFile(srcPath, destPath);
        }
    }
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
    manifest.permissions = manifest.permissions.filter(p => p !== 'declarativeNetRequest');
    manifest.permissions = [
        ...manifest.permissions,
        "*://*.twitter.com/*",
        "*://twitter.com/*",
        "*://twimg.com/*",
        "*://*.twimg.com/*",
        "https://dimden.dev/*",
        "https://raw.githubusercontent.com/*",
        "webRequest",
        "webRequestBlocking"
    ];
    delete manifest.host_permissions;
    delete manifest.declarative_net_request;
    delete manifest.background.service_worker;
    delete manifest.action;

    let content = fs.readFileSync('../OldTwitterFirefox/scripts/content.js', 'utf8');
    content = content.replace("document.open();", "");
    content = content.replace("document.write(html);", `
    if(document.body) {
        document.body.remove();
    };
    setInterval(() => {
        let body = document.querySelector('body[style="background-color: #FFFFFF;"]');
        if(body) {
            body.remove();
        };
    }, 1000);
    document.documentElement.innerHTML = html;`);
    content = content.replace("document.close();", "");

    let background = fs.readFileSync('../OldTwitterFirefox/scripts/background.js', 'utf8');
    background = background.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
    background += `
    chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
            return {
                cancel: !details.url.includes("mobile.twitter.com") && (details.url.includes("twitter.com/manifest.json") || details.url.includes("abs.twimg.com/responsive-web/client-web/"))
            };
        }, {
            urls: ["*://twitter.com/*"]
        },
        ["blocking"]
    );
    chrome.webRequest.onBeforeSendHeaders.addListener(
        function(details) {
            if(!details.requestHeaders.find(h => h.name.toLowerCase() === 'origin')) details.requestHeaders.push({
                name: "Origin",
                value: "https://twitter.com"
            });
            return {
                requestHeaders: details.requestHeaders
            };
        }, {
            urls: ["*://*.twimg.com/*", "*://twimg.com/*"]
        },
        ["blocking", "requestHeaders"]
    );
    chrome.webRequest.onHeadersReceived.addListener(
        function(details) {
            for (let i = 0; i < details.responseHeaders.length; ++i) {
                if (details.responseHeaders[i].name.toLowerCase() === 'content-security-policy') {
                    details.responseHeaders.splice(i, 1);
                    break;
                }
            }
            if(!details.responseHeaders.find(h => h.name.toLowerCase() === 'access-control-allow-origin')) details.requestHeaders.push({
                name: "access-control-allow-origin",
                value: "*"
            });
            if(!details.responseHeaders.find(h => h.name.toLowerCase() === 'access-control-allow-headers')) details.requestHeaders.push({
                name: "access-control-allow-headers",
                value: "*"
            });
            return {
                responseHeaders: details.responseHeaders
            };
        }, {
            urls: ["*://twitter.com/*", "*://*.twitter.com/*", "*://*.twimg.com/*", "*://twimg.com/*"]
        },
        ["blocking", "responseHeaders"]
    );
    `;

    let headerStyle = fs.readFileSync('../OldTwitterFirefox/layouts/header/style.css', 'utf8');
    headerStyle = headerStyle.replace("chrome-extension", "moz-extension");

    fs.writeFileSync('../OldTwitterFirefox/manifest.json', JSON.stringify(manifest, null, 2));
    fs.writeFileSync('../OldTwitterFirefox/scripts/content.js', content);
    fs.writeFileSync('../OldTwitterFirefox/scripts/background.js', background);
    fs.writeFileSync('../OldTwitterFirefox/layouts/header/style.css', headerStyle);
    fs.unlinkSync('../OldTwitterFirefox/ruleset.json');
    fs.unlinkSync('../OldTwitterFirefox/pack.js');
    fs.unlinkSync('../OldTwitterTempChrome/pack.js');

    let layouts = fs.readdirSync('../OldTwitterFirefox/layouts');
    for (let layout of layouts) {
        let script = fs.readFileSync(`../OldTwitterFirefox/layouts/${layout}/script.js`, 'utf8');
        script = script.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
        fs.writeFileSync(`../OldTwitterFirefox/layouts/${layout}/script.js`, script);
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
    console.log("Zipping Chrome version...");
    try {
        const zip = new AdmZip();
        const outputDir = "../OldTwitterChrome.zip";
        zip.addLocalFolder("../OldTwitterTempChrome");
        zip.writeZip(outputDir);
    } catch (e) {
        console.log(`Something went wrong ${e}`);
    }
    console.log("Zipped!");
    console.log("Deleting temporary folders...");
    fs.rmdirSync('../OldTwitterTempChrome', { recursive: true });
    fs.rmdirSync('../OldTwitterFirefox', { recursive: true });
    console.log("Deleted!");
});