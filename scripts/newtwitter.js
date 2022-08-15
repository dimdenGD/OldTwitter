let r = document.createElement('a');
r.href = location.href.replace('mobile.twitter.com', 'twitter.com');
setInterval(() => {
    r.href = location.href.replace('mobile.twitter.com', 'twitter.com');
}, 500);
r.textContent = 'Open this page in OldTwitter';
r.style.cssText = 'position: fixed; top: 0; right: 10px; padding: 0.5em; background: #fff; color: #000; font-family: Arial, sans-serif;border-radius:3px;';
document.body.appendChild(r);