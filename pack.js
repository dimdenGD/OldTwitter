/*
This script generates Firefox version of the extension and packs Chrome and Firefox versions to zip files.
Node.js v16.6.1 recommended.
*/

const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

async function copyDir(src, dest) {
    const entries = await fsp.readdir(src, { withFileTypes: true });
    await fsp.mkdir(dest);
    for (let entry of entries) {
        if(entry.name === '.git' || entry.name === '.github' || entry.name === '_metadata') continue;
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
    manifest.permissions = manifest.permissions.filter(p => p !== 'declarativeNetRequest' && p !== 'contextMenus');
    manifest.permissions = [
        ...manifest.permissions,
        ...manifest.host_permissions,
        "https://dimden.dev/*",
        "https://raw.githubusercontent.com/*",
        "https://www.google-analytics.com/*",
        "webRequest",
        "webRequestBlocking"
    ];
    delete manifest.host_permissions;
    delete manifest.declarative_net_request;
    delete manifest.background.service_worker;
    delete manifest.action;

    let config = fs.readFileSync('../OldTwitterFirefox/scripts/config.js', 'utf8');
    config = config.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
    let helpers = fs.readFileSync('../OldTwitterFirefox/scripts/helpers.js', 'utf8');
    helpers = helpers.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
    let tweetviewer = fs.readFileSync('../OldTwitterFirefox/scripts/tweetviewer.js', 'utf8');
    tweetviewer = tweetviewer.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
    let content = fs.readFileSync('../OldTwitterFirefox/scripts/content.js', 'utf8');
    content = content.replace("document.open();", "");
    content = content.replace("document.write(html);", `
if(document.body) {
    document.body.remove();
} else {
    let removeInt = setInterval(() => {
        let body = document.querySelector('body[style^="background"]');
        if(body) {
            clearInterval(removeInt);
            body.remove();
        };
    }, 50);
};
document.documentElement.innerHTML = html;`);
    content = content.replace("document.close();", "");
    content = content.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");

    let background = fs.readFileSync('../OldTwitterFirefox/scripts/background_v2.js', 'utf8');
    
    let headerStyle = fs.readFileSync('../OldTwitterFirefox/layouts/header/style.css', 'utf8');
    headerStyle = headerStyle.replace("chrome-extension", "moz-extension");

    fs.writeFileSync('../OldTwitterFirefox/manifest.json', JSON.stringify(manifest, null, 2));
    fs.writeFileSync('../OldTwitterFirefox/scripts/content.js', content);
    fs.writeFileSync('../OldTwitterFirefox/scripts/helpers.js', helpers);
    fs.writeFileSync('../OldTwitterFirefox/scripts/tweetviewer.js', tweetviewer);
    fs.writeFileSync('../OldTwitterFirefox/scripts/config.js', config);
    fs.writeFileSync('../OldTwitterFirefox/scripts/background.js', background);
    fs.writeFileSync('../OldTwitterFirefox/layouts/header/style.css', headerStyle);
    fs.unlinkSync('../OldTwitterFirefox/ruleset.json');
    fs.unlinkSync('../OldTwitterFirefox/pack.js');
    fs.unlinkSync('../OldTwitterTempChrome/pack.js');
    fs.unlinkSync('../OldTwitterTempChrome/scripts/background_v2.js');
    fs.unlinkSync('../OldTwitterFirefox/scripts/background_v2.js');
    fs.unlinkSync('../OldTwitterFirefox/.gitignore');
    fs.unlinkSync('../OldTwitterTempChrome/.gitignore');

    let layouts = fs.readdirSync('../OldTwitterFirefox/layouts');
    for (let layout of layouts) {
        let script = fs.readFileSync(`../OldTwitterFirefox/layouts/${layout}/script.js`, 'utf8');
        script = script.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
        script = script.replace("https://chrome.google.com/webstore/detail/old-twitter-layout-2022/jgejdcdoeeabklepnkdbglgccjpdgpmf", "https://addons.mozilla.org/en-US/firefox/addon/old-twitter-layout-2022/");
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