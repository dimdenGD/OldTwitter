let pages = [
    {
        name: "home",
        paths: ["/", "/home"]
    }
];

let page = pages.find(p => p.paths.includes(window.location.pathname) || p.paths.find(r => r instanceof RegExp && r.test(window.location.pathname)));

(async () => {
    if(!page) return;
    
    let html = await fetch(chrome.runtime.getURL(`layouts/${page.name}/index.html`)).then(response => response.text());
    let css = await fetch(chrome.runtime.getURL(`layouts/${page.name}/style.css`)).then(response => response.text());
    let header_html = await fetch(chrome.runtime.getURL(`layouts/header/index.html`)).then(response => response.text());
    let header_css = await fetch(chrome.runtime.getURL(`layouts/header/style.css`)).then(response => response.text());

    document.open();
    document.write(html);
    document.close();
    document.getElementsByTagName('header')[0].innerHTML = header_html;

    let style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
    let header_style = document.createElement("style");
    header_style.innerHTML = header_css;
    document.head.appendChild(header_style);

    let icon = document.createElement("link")
    icon.href = chrome.runtime.getURL(`images/logo32.png`);
    icon.rel = "icon";
    document.head.appendChild(icon);

    setInterval(() => {
        let donateButton = document.getElementById('donate-button');
        donateButton.style.color = "var(--link-color)";
        setTimeout(() => {
            donateButton.style.color = "";
        }, 2000);
    }, 60000);
})();