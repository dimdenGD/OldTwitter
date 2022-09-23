let r = document.createElement('a');
r.href = location.href.replace('mobile.twitter.com', 'twitter.com');
setInterval(() => {
    r.href = location.href.replace('mobile.twitter.com', 'twitter.com');
    let realPath = location.pathname.split('?')[0].split('#')[0];
    if (realPath.endsWith("/")) {
        realPath = realPath.slice(0, -1);
    }
    if(
        /^\/[A-z-0-9-_]{1,15}\/status\/\d{5,32}\/analytics$/.test(realPath) ||
        (realPath.startsWith('/i/') && realPath !== "/i/bookmarks" && !realPath.startsWith('/i/lists/')) ||
        realPath === '/explore' ||
        realPath === '/login' ||
        realPath === '/register' ||
        realPath === '/logout' ||
        realPath === '/messages' ||
        realPath.endsWith('/tos') ||
        realPath.endsWith('/privacy') ||
        realPath.startsWith('/account/') ||
        realPath.endsWith('/lists') ||
        realPath.endsWith('/topics') ||
        realPath.startsWith('/settings/')
    ) {
        r.hidden = true;
    } else {
        r.hidden = false;
    }
}, 500);
r.textContent = 'Open this page in OldTwitter';
r.style.cssText = 'position: fixed; top: 0; right: 10px; padding: 0.5em; background: #fff; color: #000; font-family: Arial, sans-serif;border-radius:3px;';
document.body.appendChild(r);