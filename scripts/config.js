const OLDTWITTER_CONFIG = {
    oauth_key: `Bearer AAAAAAAAAAAAAAAAAAAAAF7aAAAAAAAASCiRjWvh7R5wxaKkFp7MM%2BhYBqM%3DbQ0JPmjU9F6ZoMhDfI4uTNAaQuTDm2uO9x3WFVr2xBZ2nhjdP0`,
    public_token: `Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA`,
    csrf: (() => {
        let csrf = document.cookie.match(/(?:^|;\s*)ct0=([0-9a-f]+)\s*(?:;|$)/);
        return csrf ? csrf[1] : "";
    })()
};

setInterval(() => {
    fetch(`https://twitter.com/`).then(response => response.text()).then(() => {
        OLDTWITTER_CONFIG.csrf = (() => {
            let csrf = document.cookie.match(/(?:^|;\s*)ct0=([0-9a-f]+)\s*(?:;|$)/);
            return csrf ? csrf[1] : "";
        })();
    });
}, 60000*5);