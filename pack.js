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
        if(entry.name === '.git' || entry.name === '.github' || entry.name === '_metadata' || entry.name === 'node_modules' || entry.name === 'build') continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fsp.copyFile(srcPath, destPath);
        }
    }
}

if(!fs.existsSync("build")) {
  fs.mkdirSync("build");
}

if(fs.existsSync('./build/OldTwitterTempChrome')) {
  fs.rmSync('./build/OldTwitterTempChrome', { recursive: true });
}
if(fs.existsSync('./build/OldTwitterFirefox')) {
  fs.rmSync('./build/OldTwitterFirefox', { recursive: true });
}

console.log("Copying...");
copyDir('./', './build/OldTwitterFirefox').then(async () => {
    await copyDir('./', './build/OldTwitterTempChrome');
    console.log("Copied!");
    console.log("Patching...");
    let manifest = JSON.parse(fs.readFileSync('./build/OldTwitterFirefox/manifest.json', 'utf8'));
    manifest.manifest_version = 2;
    manifest.background.scripts = ['scripts/background.js'];
    manifest.web_accessible_resources = manifest.web_accessible_resources[0].resources;
    manifest.permissions = manifest.permissions.filter(p => p !== 'declarativeNetRequest' && p !== 'contextMenus');
    manifest.browser_specific_settings = {
        "gecko": {
            "strict_min_version": "78.0"
        },
        "gecko_android": {
            "strict_min_version": "78.0"
        }
    }
    if(args[0] === '-a') {
      manifest.browser_specific_settings.gecko.id = "oldtwitter@dimden.dev";
    } else {
      setTimeout(() => console.warn("Warning: Extension ID is not set."), 1500);
    }
    manifest.permissions = [
        ...manifest.permissions,
        ...manifest.host_permissions,
        "https://dimden.dev/*",
        "https://raw.githubusercontent.com/*",
        "webRequest",
        "webRequestBlocking"
    ];
    delete manifest.sandbox;
    delete manifest.host_permissions;
    delete manifest.declarative_net_request;
    delete manifest.background.service_worker;
    delete manifest.action;
    let config = fs.readFileSync('./build/OldTwitterFirefox/scripts/config.js', 'utf8');
    config = config.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
    let helpers = fs.readFileSync('./build/OldTwitterFirefox/scripts/helpers.js', 'utf8');
    helpers = helpers.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
    let tweetviewer = fs.readFileSync('./build/OldTwitterFirefox/scripts/tweetviewer.js', 'utf8');
    tweetviewer = tweetviewer.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
    let content = fs.readFileSync('./build/OldTwitterFirefox/scripts/injection.js', 'utf8');
    content = content.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");

    let apis = fs.readFileSync('./build/OldTwitterFirefox/scripts/apis.js', 'utf8');
    apis = apis.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
    if(apis.includes("&& true") || apis.includes("&& false") || apis.includes("|| true") || apis.includes("|| false") || apis.includes("&&true") || apis.includes("&&false") || apis.includes("||true") || apis.includes("||false")) {
      if(args[0] === '-a') {
        let line = apis.split("\n").findIndex(l => l.includes("&& true") || l.includes("&& false") || l.includes("|| true") || l.includes("|| false") || l.includes("&&true") || l.includes("&&false") || l.includes("||true") || l.includes("||false"));
        console.warn("::warning file=scripts/api.js,line=" + (line+1) + "::Probably temporary boolean left in code.");
      } else {
        for(let i = 0; i < 5; i++) {
          console.warn("\x1b[33m", "Warning: probably temporary boolean left in code.", '\x1b[0m');
        }
      }
    }
    if(args[0] !== '-a') {
      try {
        require('node-fetch')('https://twitter.com/manifest.json').then(res => res.text()).then(json => {
          if(json.includes("content_security_policy")) {
            for(let i = 0; i < 5; i++) {
              console.warn("\x1b[33m", "Warning: Twitter returned CSP in manifest.json!!!!", '\x1b[0m');
            }
          }
        });
      } catch(e) {}
    }

    let background = fs.readFileSync('./build/OldTwitterFirefox/scripts/background_v2.js', 'utf8');
    
    fs.writeFileSync('./build/OldTwitterFirefox/manifest.json', JSON.stringify(manifest, null, 2));
    fs.writeFileSync('./build/OldTwitterFirefox/scripts/injection.js', content);
    fs.writeFileSync('./build/OldTwitterFirefox/scripts/helpers.js', helpers);
    fs.writeFileSync('./build/OldTwitterFirefox/scripts/tweetviewer.js', tweetviewer);
    fs.writeFileSync('./build/OldTwitterFirefox/scripts/config.js', config);
    fs.writeFileSync('./build/OldTwitterFirefox/scripts/background.js', background);
    fs.writeFileSync('./build/OldTwitterFirefox/scripts/apis.js', apis);
    fs.unlinkSync('./build/OldTwitterFirefox/ruleset.json');
    fs.unlinkSync('./build/OldTwitterFirefox/pack.js');
    fs.unlinkSync('./build/OldTwitterTempChrome/pack.js');
    fs.unlinkSync('./build/OldTwitterTempChrome/scripts/background_v2.js');
    fs.unlinkSync('./build/OldTwitterFirefox/scripts/background_v2.js');
    fs.unlinkSync('./build/OldTwitterFirefox/.gitignore');
    fs.unlinkSync('./build/OldTwitterTempChrome/.gitignore');
    fs.unlinkSync('./build/OldTwitterFirefox/test.js');
    fs.unlinkSync('./build/OldTwitterTempChrome/test.js');
    fs.unlinkSync('./build/OldTwitterFirefox/package.json');
    fs.unlinkSync('./build/OldTwitterTempChrome/package.json');
    fs.unlinkSync('./build/OldTwitterFirefox/_locales/locales-support.html');
    fs.unlinkSync('./build/OldTwitterTempChrome/_locales/locales-support.html');
  
    if (fs.existsSync('./build/OldTwitterFirefox/package-lock.json')) // Delete NPM package-lock (if exists)
      fs.unlinkSync('./build/OldTwitterFirefox/package-lock.json');
    if (fs.existsSync('./build/OldTwitterTempChrome/package-lock.json'))
      fs.unlinkSync('./build/OldTwitterTempChrome/package-lock.json');
  
    if (fs.existsSync('./build/OldTwitterFirefox/yarn.lock')) // Delete yarn package-lock (if exists)
      fs.unlinkSync('./build/OldTwitterFirefox/yarn.lock');
    if (fs.existsSync('./build/OldTwitterTempChrome/yarn.lock'))
      fs.unlinkSync('./build/OldTwitterTempChrome/yarn.lock');

    let layouts = fs.readdirSync('./build/OldTwitterFirefox/layouts');
    for (let layout of layouts) {
        let script = fs.readFileSync(`./build/OldTwitterFirefox/layouts/${layout}/script.js`, 'utf8');
        script = script.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");
        script = script.replace("https://chrome.google.com/webstore/detail/old-twitter-layout-2022/jgejdcdoeeabklepnkdbglgccjpdgpmf", "https://addons.mozilla.org/en-US/firefox/addon/old-twitter-layout-2022/");
        fs.writeFileSync(`./build/OldTwitterFirefox/layouts/${layout}/script.js`, script);

        let style = fs.readFileSync(`./build/OldTwitterFirefox/layouts/${layout}/style.css`, 'utf8');
        style = style.replaceAll("chrome-extension://", "moz-extension://");
        fs.writeFileSync(`./build/OldTwitterFirefox/layouts/${layout}/style.css`, style);

        let html = fs.readFileSync(`./build/OldTwitterFirefox/layouts/${layout}/index.html`, 'utf8');
        html = html.replaceAll("chrome-extension://", "moz-extension://");
        fs.writeFileSync(`./build/OldTwitterFirefox/layouts/${layout}/index.html`, html);
    }

    console.log("Patched!");
    if (fs.existsSync('./build/OldTwitterFirefox.zip')) {
        console.log("Deleting old zip...");
        fs.unlinkSync('./build/OldTwitterFirefox.zip');
        console.log("Deleted old zip!");
    }
    console.log("Zipping Firefox version...");
    try {
        const zip = new AdmZip();
        const outputDir = "./build/OldTwitterFirefox.zip";
        zip.addLocalFolder("./build/OldTwitterFirefox");
        zip.writeZip(outputDir);
    } catch (e) {
        console.log(`Something went wrong ${e}`);
    }
    console.log(`Zipped Firefox version into ${path.resolve('./build/OldTwitterFirefox.zip')}!`);
    console.log("Zipping Chrome version...");
    try {
        const zip = new AdmZip();
        const outputDir = "./build/OldTwitterChrome.zip";
        zip.addLocalFolder("./build/OldTwitterTempChrome");
        zip.writeZip(outputDir);
    } catch (e) {
        console.log(`Something went wrong ${e}`);
    }
    console.log(`Zipped Chrome version into ${path.resolve('./build/OldTwitterChrome.zip')}!`);
    console.log("Deleting temporary folders...");
    fs.rmSync('./build/OldTwitterTempChrome', { recursive: true });
    fs.rmSync('./build/OldTwitterFirefox', { recursive: true });
    console.log("Deleted!");
});