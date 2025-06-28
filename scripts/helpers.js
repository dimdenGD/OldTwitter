const linkRegex =
    /(\s|^)(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,60}\.(삼성|닷컴|닷넷|香格里拉|餐厅|食品|飞利浦|電訊盈科|集团|通販|购物|谷歌|诺基亚|联通|网络|网站|网店|网址|组织机构|移动|珠宝|点看|游戏|淡马锡|机构|書籍|时尚|新闻|政府|政务|招聘|手表|手机|我爱你|慈善|微博|广东|工行|家電|娱乐|天主教|大拿|大众汽车|在线|嘉里大酒店|嘉里|商标|商店|商城|公益|公司|八卦|健康|信息|佛山|企业|亚马逊|中文网|中信|世界|ポイント|ファッション|セール|ストア|コム|グーグル|クラウド|アマゾン|みんな|คอม|संगठन|नेट|कॉम|همراه|موقع|موبايلي|كوم|كاثوليك|عرب|شبكة|بيتك|بازار|العليان|ارامكو|اتصالات|ابوظبي|קום|сайт|рус|орг|онлайн|москва|ком|католик|дети|zuerich|zone|zippo|zip|zero|zara|zappos|yun|youtube|you|yokohama|yoga|yodobashi|yandex|yamaxun|yahoo|yachts|xyz|xxx|xperia|xin|xihuan|xfinity|xerox|xbox|wtf|wtc|wow|world|works|work|woodside|wolterskluwer|wme|winners|wine|windows|win|williamhill|wiki|wien|whoswho|weir|weibo|wedding|wed|website|weber|webcam|weatherchannel|weather|watches|watch|warman|wanggou|wang|walter|walmart|wales|vuelos|voyage|voto|voting|vote|volvo|volkswagen|vodka|vlaanderen|vivo|viva|vistaprint|vista|vision|visa|virgin|vip|vin|villas|viking|vig|video|viajes|vet|versicherung|vermögensberatung|vermögensberater|verisign|ventures|vegas|vanguard|vana|vacations|ups|uol|uno|university|unicom|uconnect|ubs|ubank|tvs|tushu|tunes|tui|tube|trv|trust|travelersinsurance|travelers|travelchannel|travel|training|trading|trade|toys|toyota|town|tours|total|toshiba|toray|top|tools|tokyo|today|tmall|tkmaxx|tjx|tjmaxx|tirol|tires|tips|tiffany|tienda|tickets|tiaa|theatre|theater|thd|teva|tennis|temasek|telefonica|telecity|tel|technology|tech|team|tdk|tci|taxi|tax|tattoo|tatar|tatamotors|target|taobao|talk|taipei|tab|systems|symantec|sydney|swiss|swiftcover|swatch|suzuki|surgery|surf|support|supply|supplies|sucks|style|study|studio|stream|store|storage|stockholm|stcgroup|stc|statoil|statefarm|statebank|starhub|star|staples|stada|srt|srl|spreadbetting|spot|sport|spiegel|space|soy|sony|song|solutions|solar|sohu|software|softbank|social|soccer|sncf|smile|smart|sling|skype|sky|skin|ski|site|singles|sina|silk|shriram|showtime|show|shouji|shopping|shop|shoes|shiksha|shia|shell|shaw|sharp|shangrila|sfr|sexy|sex|sew|seven|ses|services|sener|select|seek|security|secure|seat|search|scot|scor|scjohnson|science|schwarz|schule|school|scholarships|schmidt|schaeffler|scb|sca|sbs|sbi|saxo|save|sas|sarl|sapo|sap|sanofi|sandvikcoromant|sandvik|samsung|samsclub|salon|sale|sakura|safety|safe|saarland|ryukyu|rwe|run|ruhr|rugby|rsvp|room|rogers|rodeo|rocks|rocher|rmit|rip|rio|ril|rightathome|ricoh|richardli|rich|rexroth|reviews|review|restaurant|rest|republican|report|repair|rentals|rent|ren|reliance|reit|reisen|reise|rehab|redumbrella|redstone|red|recipes|realty|realtor|realestate|read|raid|radio|racing|qvc|quest|quebec|qpon|pwc|pub|prudential|pru|protection|property|properties|promo|progressive|prof|productions|prod|pro|prime|press|praxi|pramerica|post|porn|politie|poker|pohl|pnc|plus|plumbing|playstation|play|place|pizza|pioneer|pink|ping|pin|pid|pictures|pictet|pics|piaget|physio|photos|photography|photo|phone|philips|phd|pharmacy|pfizer|pet|pccw|pay|passagens|party|parts|partners|pars|paris|panerai|panasonic|pamperedchef|page|ovh|ott|otsuka|osaka|origins|orientexpress|organic|org|orange|oracle|open|ooo|onyourside|online|onl|ong|one|omega|ollo|oldnavy|olayangroup|olayan|okinawa|office|off|observer|obi|nyc|ntt|nrw|nra|nowtv|nowruz|now|norton|northwesternmutual|nokia|nissay|nissan|ninja|nikon|nike|nico|nhk|ngo|nfl|nexus|nextdirect|next|news|newholland|new|neustar|network|netflix|netbank|net|nec|nba|navy|natura|nationwide|name|nagoya|nadex|nab|mutuelle|mutual|museum|mtr|mtpc|mtn|msd|movistar|movie|mov|motorcycles|moto|moscow|mortgage|mormon|mopar|montblanc|monster|money|monash|mom|moi|moe|moda|mobily|mobile|mobi|mma|mls|mlb|mitsubishi|mit|mint|mini|mil|microsoft|miami|metlife|merckmsd|meo|menu|men|memorial|meme|melbourne|meet|media|med|mckinsey|mcdonalds|mcd|mba|mattel|maserati|marshalls|marriott|markets|marketing|market|map|mango|management|man|makeup|maison|maif|madrid|macys|luxury|luxe|lupin|lundbeck|ltda|ltd|lplfinancial|lpl|love|lotto|lotte|london|lol|loft|locus|locker|loans|loan|llp|llc|lixil|living|live|lipsy|link|linde|lincoln|limo|limited|lilly|like|lighting|lifestyle|lifeinsurance|life|lidl|liaison|lgbt|lexus|lego|legal|lefrak|leclerc|lease|lds|lawyer|law|latrobe|latino|lat|lasalle|lanxess|landrover|land|lancome|lancia|lancaster|lamer|lamborghini|ladbrokes|lacaixa|kyoto|kuokgroup|kred|krd|kpn|kpmg|kosher|komatsu|koeln|kiwi|kitchen|kindle|kinder|kim|kia|kfh|kerryproperties|kerrylogistics|kerryhotels|kddi|kaufen|juniper|juegos|jprs|jpmorgan|joy|jot|joburg|jobs|jnj|jmp|jll|jlc|jio|jewelry|jetzt|jeep|jcp|jcb|java|jaguar|iwc|iveco|itv|itau|istanbul|ist|ismaili|iselect|irish|ipiranga|investments|intuit|international|intel|int|insure|insurance|institute|ink|ing|info|infiniti|industries|inc|immobilien|immo|imdb|imamat|ikano|iinet|ifm|ieee|icu|ice|icbc|ibm|hyundai|hyatt|hughes|htc|hsbc|how|house|hotmail|hotels|hoteles|hot|hosting|host|hospital|horse|honeywell|honda|homesense|homes|homegoods|homedepot|holiday|holdings|hockey|hkt|hiv|hitachi|hisamitsu|hiphop|hgtv|hermes|here|helsinki|help|healthcare|health|hdfcbank|hdfc|hbo|haus|hangout|hamburg|hair|guru|guitars|guide|guge|gucci|guardian|group|grocery|gripe|green|gratis|graphics|grainger|gov|got|gop|google|goog|goodyear|goodhands|goo|golf|goldpoint|gold|godaddy|gmx|gmo|gmbh|gmail|globo|global|gle|glass|glade|giving|gives|gifts|gift|ggee|george|genting|gent|gea|gdn|gbiz|gay|garden|gap|games|game|gallup|gallo|gallery|gal|fyi|futbol|furniture|fund|fun|fujixerox|fujitsu|ftr|frontier|frontdoor|frogans|frl|fresenius|free|fox|foundation|forum|forsale|forex|ford|football|foodnetwork|food|foo|fly|flsmidth|flowers|florist|flir|flights|flickr|fitness|fit|fishing|fish|firmdale|firestone|fire|financial|finance|final|film|fido|fidelity|fiat|ferrero|ferrari|feedback|fedex|fast|fashion|farmers|farm|fans|fan|family|faith|fairwinds|fail|fage|extraspace|express|exposed|expert|exchange|everbank|events|eus|eurovision|etisalat|esurance|estate|esq|erni|ericsson|equipment|epson|epost|enterprises|engineering|engineer|energy|emerck|email|education|edu|edeka|eco|eat|earth|dvr|dvag|durban|dupont|duns|dunlop|duck|dubai|dtv|drive|download|dot|doosan|domains|doha|dog|dodge|doctor|docs|dnp|diy|dish|discover|discount|directory|direct|digital|diet|diamonds|dhl|dev|design|desi|dentist|dental|democrat|delta|deloitte|dell|delivery|degree|deals|dealer|deal|dds|dclk|day|datsun|dating|date|data|dance|dad|dabur|cyou|cymru|cuisinella|csc|cruises|cruise|crs|crown|cricket|creditunion|creditcard|credit|cpa|courses|coupons|coupon|country|corsica|coop|cool|cookingchannel|cooking|contractors|contact|consulting|construction|condos|comsec|computer|compare|company|community|commbank|comcast|com|cologne|college|coffee|codes|coach|clubmed|club|cloud|clothing|clinique|clinic|click|cleaning|claims|cityeats|city|citic|citi|citadel|cisco|circle|cipriani|church|chrysler|chrome|christmas|chloe|chintai|cheap|chat|chase|charity|channel|chanel|cfd|cfa|cern|ceo|center|ceb|cbs|cbre|cbn|cba|catholic|catering|cat|casino|cash|caseih|case|casa|cartier|cars|careers|career|care|cards|caravan|car|capitalone|capital|capetown|canon|cancerresearch|camp|camera|cam|calvinklein|call|cal|cafe|cab|bzh|buzz|buy|business|builders|build|bugatti|budapest|brussels|brother|broker|broadway|bridgestone|bradesco|box|boutique|bot|boston|bostik|bosch|boots|booking|book|boo|bond|bom|bofa|boehringer|boats|bnpparibas|bnl|bmw|bms|blue|bloomberg|blog|blockbuster|blanco|blackfriday|black|biz|bio|bingo|bing|bike|bid|bible|bharti|bet|bestbuy|best|berlin|bentley|beer|beauty|beats|bcn|bcg|bbva|bbt|bbc|bayern|bauhaus|basketball|baseball|bargains|barefoot|barclays|barclaycard|barcelona|bar|bank|band|bananarepublic|banamex|baidu|baby|azure|axa|aws|avianca|autos|auto|author|auspost|audio|audible|audi|auction|attorney|athleta|associates|asia|asda|arte|art|arpa|army|archi|aramco|arab|aquarelle|apple|app|apartments|aol|anz|anquan|android|analytics|amsterdam|amica|amfam|amex|americanfamily|americanexpress|amazon|alstom|alsace|ally|allstate|allfinanz|alipay|alibaba|alfaromeo|akdn|airtel|airforce|airbus|aigo|aig|agency|agakhan|africa|afl|afamilycompany|aetna|aero|aeg|adult|ads|adac|actor|active|aco|accountants|accountant|accenture|academy|abudhabi|abogado|able|abc|abbvie|abbott|abb|abarth|aarp|aaa|onion)\b([-a-zA-Z0-9@:%_\+.~#?&/=]*)/gi;
const hashtagRegex =
    /(#|＃)([a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*[a-z_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f][a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*)/gi;
const rtlLanguages = [
    "ar",
    "arc",
    "dv",
    "fa",
    "ha",
    "he",
    "khw",
    "ks",
    "ku",
    "ps",
    "ur",
    "yi",
];

function arrayBufferToBase64(buffer) {
    let binary = "";
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function createModal(html, className, onclose, canclose) {
    let modal = document.createElement("div");
    modal.classList.add("modal");
    let modal_content = document.createElement("div");
    modal_content.classList.add("modal-content");
    if (className) modal_content.classList.add(className);
    modal_content.innerHTML = html;
    modal.appendChild(modal_content);
    let close = document.createElement("span");
    close.classList.add("modal-close");
    close.title = "ESC";
    close.innerHTML = "&times;";
    document.body.style.overflowY = "hidden";
    function removeModal() {
        modal.remove();
        let event = new Event("findActiveTweet");
        document.dispatchEvent(event);
        document.removeEventListener("keydown", escapeEvent);
        if (onclose) onclose();
        let modals = document.getElementsByClassName("modal");
        if (modals.length === 0) {
            document.body.style.overflowY = "auto";
        }
    }
    modal.removeModal = removeModal;
    function escapeEvent(e) {
        if (document.querySelector(".viewer-in")) return;
        if (e.key === "Escape" || (e.altKey && e.keyCode === 78)) {
            if (!canclose || canclose()) removeModal();
        }
    }
    close.addEventListener("click", removeModal);
    let isHoldingMouseFromContent = false;
    modal_content.addEventListener("mousedown", () => {
        isHoldingMouseFromContent = true;
    });
    document.addEventListener("mouseup", () => {
        setTimeout(() => (isHoldingMouseFromContent = false), 10);
    });
    modal.addEventListener("click", (e) => {
        if (e.target === modal && !isHoldingMouseFromContent) {
            if (!canclose || canclose()) removeModal();
        }
    });
    document.addEventListener("keydown", escapeEvent);
    modal_content.appendChild(close);
    document.body.appendChild(modal);
    return modal;
}
async function handleFiles(files, mediaArray, mediaContainer, is_dm = false) {
    let images = [];
    let videos = [];
    let gifs = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.type.includes("gif")) {
            // max 15 mb
            if (file.size > 15000000) {
                return alert(LOC.gifs_max.message);
            }
            gifs.push(file);
        } else if (file.type.includes("video")) {
            // max 500 mb
            if (file.size > 500000000) {
                return alert(LOC.videos_max.message);
            }
            videos.push(file);
        } else if (file.type.includes("image")) {
            // max 5 mb
            if (
                file.size > 5000000 ||
                (window.navigator &&
                    navigator.connection &&
                    navigator.connection.type === "cellular" &&
                    !vars.disableDataSaver)
            ) {
                // convert png to jpeg
                let toBreak = false,
                    i = 0;
                while (file.size > 5000000) {
                    await new Promise((resolve) => {
                        let canvas = document.createElement("canvas");
                        let ctx = canvas.getContext("2d");
                        let img = new Image();
                        img.onload = function () {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx.drawImage(img, 0, 0);
                            let dataURL = canvas.toDataURL(
                                "image/jpeg",
                                window.navigator &&
                                    navigator.connection &&
                                    navigator.connection.type === "cellular" &&
                                    !vars.disableDataSaver
                                    ? 0.5 - i * 0.1
                                    : 0.9 - i * 0.1
                            );
                            let blobBin = atob(dataURL.split(",")[1]);
                            let array = [];
                            for (let i = 0; i < blobBin.length; i++) {
                                array.push(blobBin.charCodeAt(i));
                            }
                            let newFile = new Blob([new Uint8Array(array)], {
                                type: "image/jpeg",
                            });
                            if (newFile.size > file.size) {
                                toBreak = true;
                            } else {
                                file = newFile;
                            }
                            resolve();
                        };
                        img.src = URL.createObjectURL(file);
                    });
                    if (toBreak || i++ > 5) break;
                }
                if (file.size > 5000000) {
                    return alert(LOC.images_max.message);
                }
            }
            images.push(file);
        }
    }
    // either up to 4 images or 1 video or 1 gif
    if (images.length > 0) {
        if (images.length > 4) {
            images = images.slice(0, 4);
        }
        if (videos.length > 0 || gifs.length > 0) {
            return alert(LOC.max_count.message);
        }
    }
    if (videos.length > 0) {
        if (images.length > 0 || gifs.length > 0 || videos.length > 1) {
            return alert(LOC.max_count.message);
        }
    }
    if (gifs.length > 0) {
        if (images.length > 0 || videos.length > 0 || gifs.length > 1) {
            return alert(LOC.max_count.message);
        }
    }
    // get base64 data
    let media = [...images, ...videos, ...gifs];
    let base64Data = [];
    for (let i = 0; i < media.length; i++) {
        let file = media[i];
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            base64Data.push(reader.result);
            if (base64Data.length === media.length) {
                while (mediaArray.length >= 4) {
                    mediaArray.pop();
                    mediaContainer.lastChild.remove();
                }
                base64Data.forEach((data) => {
                    let div = document.createElement("div");
                    let img = document.createElement("img");
                    div.title = file.name;
                    div.id =
                        `new-tweet-media-img-${Date.now()}${Math.random()}`.replace(
                            ".",
                            "-"
                        );
                    div.className = "new-tweet-media-img-div";
                    img.className = "new-tweet-media-img";
                    let progress = document.createElement("span");
                    progress.hidden = true;
                    progress.className = "new-tweet-media-img-progress";
                    let remove = document.createElement("span");
                    remove.className = "new-tweet-media-img-remove";
                    let alt;
                    if (!file.type.includes("video")) {
                        alt = document.createElement("span");
                        alt.className = "new-tweet-media-img-alt";
                        alt.innerText = "ALT";
                        alt.addEventListener("click", () => {
                            mediaObject.alt = prompt(
                                LOC.alt_text.message,
                                mediaObject.alt || ""
                            );
                        });
                    }
                    let cw = document.createElement("span");
                    cw.className = "new-tweet-media-img-cw";
                    cw.innerText = "CW";
                    cw.addEventListener("click", () => {
                        createModal(`
                            <div class="cw-modal" style="color:var(--almost-black)">
                                <h2 class="nice-header">${
                                    LOC.content_warnings.message
                                }</h2>
                                <br>
                                <input type="checkbox" id="cw-modal-graphic_violence"${
                                    mediaObject.cw.includes("graphic_violence")
                                        ? " checked"
                                        : ""
                                }> <label for="cw-modal-graphic_violence">${
                            LOC.graphic_violence.message
                        }</label><br>
                                <input type="checkbox" id="cw-modal-adult_content"${
                                    mediaObject.cw.includes("adult_content")
                                        ? " checked"
                                        : ""
                                }> <label for="cw-modal-adult_content">${
                            LOC.adult_content.message
                        }</label><br>
                                <input type="checkbox" id="cw-modal-other"${
                                    mediaObject.cw.includes("other")
                                        ? " checked"
                                        : ""
                                }> <label for="cw-modal-other">${
                            LOC.sensitive_content.message
                        }</label><br>
                            </div>
                        `);
                        let graphic_violence = document.getElementById(
                            "cw-modal-graphic_violence"
                        );
                        let adult_content = document.getElementById(
                            "cw-modal-adult_content"
                        );
                        let sensitive_content =
                            document.getElementById("cw-modal-other");
                        [
                            graphic_violence,
                            adult_content,
                            sensitive_content,
                        ].forEach((checkbox) => {
                            checkbox.addEventListener("change", () => {
                                if (checkbox.checked) {
                                    mediaObject.cw.push(checkbox.id.slice(9));
                                } else {
                                    let index = mediaObject.cw.indexOf(
                                        checkbox.id.slice(9)
                                    );
                                    if (index > -1) {
                                        mediaObject.cw.splice(index, 1);
                                    }
                                }
                            });
                        });
                    });

                    let mediaObject = {
                        div,
                        img,
                        id: div.id,
                        data: data,
                        type: file.type,
                        cw: [],
                        category: file.type.includes("gif")
                            ? is_dm
                                ? "dm_gif"
                                : "tweet_gif"
                            : file.type.includes("video")
                            ? is_dm
                                ? "dm_video"
                                : "tweet_video"
                            : is_dm
                            ? "dm_image"
                            : "tweet_image",
                    };
                    mediaArray.push(mediaObject);
                    if (file.type.includes("video")) {
                        img.src =
                            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAWUSURBVHhe7Z1pqG5THMbPNV1jul1TJEOZuqYMRZEpoRARvlw+uIjwASlRFIkMHwzJ8AVfZMhYOGRKESlDkciQyJhknj3PXu9b3nP2sPba9x3Wfp5f/dpr77p1zl7Ped+11l77f5fMz8/PGV3WGByNKA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOG3eC1gGl4ammXF+h9+HZj0xAdgC3gwPhw5AHjAAL8Kz4Re8UEVTANaCT8HDijOTGy9B9t1fxVkJTWOAneAhoWky5ADIPqykKQCbQA8U84V9xz6spKlzlwyOJl9q+9B/3eI4AOI0zQIOhs+H5iJeh3fBP4qzcjaDF8DNizPTls/gDfCH4qycDeBZcLfibDEcxL8QmotJDQA7fVf4QXFWz8nwvtA0LTkJPhCatewM34LrFGej1AYg9SvgF/hNaDby8eBo2vPp4NjEl5B90hqPAcRxAMRxAMRxAMRxAMRxAMRJDcCaA2NYe3A07Ym9d236Y4TUAGwET4VlCw//Z124MjRNAmfADUOzEnb8iZB90pouS8H/QC5A1C0FMwDcUWTS4YLbz6FZCgOwFaz6Yx7LUrDJh7EsBZue0KcA/Av/Dk0TS18CwIcm/KjbEV4Nf4Qmgr4E4ErIbdAfwUvhXvB+WLkb1gS6BICzAG5Y+KTG2EfGXVn42PRDeAo8AnLjSs5wplV2b4dy3z/7IokuATgHbtfg9vBuOA04JngOHgjPhJ/D3Lgdlt3XhV4Ek0gNAL9jH4RNg66f4J2hOTX4lgx/hj3gdbBuTj1r3At/C81KuA5zD0wa96QGgB0fO+L+c3CcNt/Bi+G+8BGYw4wh9t616Y8R+jIIbMN78AR4NHyTF5RRDADhoInvPO4Pz4NfQUlUAzCE36+3wN0h34D+FUqhHoAhX8Pz4X7wSZg8rcoNB2CUt+Ex8Hj4Li/0HQdgMRxNPwY5W+D8+lvYW1IDsD6Mfc6/zeCYG3zRgq9lcf3gDsj1hEnDRZ4YNoXsk9Z02Q/wDuRKVd3CysbwQrh1cTY+WL7m2dAcG/vAa+ChcFKvzXN2ciPkGKUK7spaBfmJVYbEhpBJBICwZA7HB1dBPnnMAW8IWY3w6SJf1twb3soLueMApMFnHJfBqFJss4wDkE4vyuc4AGlwqzafLLJ4ZtY4AO0Y7sF/A57OC7nTZRYwSyViJjEL4MDvWjjJaaBLxEQyzgBsCS+Hp8FJl8p1iZgpwpU1LmLxxnJL2TTqJLtEzBTg9/yx8DV4PayttJk7DsAo3BfwOHwYruCFvuMABDhYvQm+Co+CMvdFPQB8e/lcyH0A3Bq2HpRCNQD8vY+Er0BuBZOtZKoYgF3gQ/AJuCcvKJMaAI6UaQyzUiJmOeTyLRewjoOxP/80cYmY1QDn7yy1wvk8t3hx5SwXXCImkrKVQC7XchWMu3iqdsvkwFhLxHQZA/Dfcpl02xonVR9o4d65HSCXn5+GOXc+4X6/sns7lNvtkvuxSwBmiSsgV+/4QIQFIvi0juvo3MJlauhLAPhJ9CjkfP4SmPR9qEhfAmAScQDE6RKAWSoR02dcIkYYl4gRxyVixHGJGDNeHABxHABxHABxHABxHABxUgOgUCJmFuAiTwzyJWL6ikvEmM6MbUeQ6QEOgDhNAeB/umDyprYPmwLAKpkydXN7CPuuttJpUwDehy+HpskQDuDZh5U0zQIIN1zeBg+C0yiSYNrDsrbPQL7wyh1FlcQEYAgrYjkAecAARNUwbBMA00M8DRTHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHAZBmbu4/x6swK3hIFr4AAAAASUVORK5CYII=";
                    } else {
                        let dataBase64 = arrayBufferToBase64(data);
                        img.src = `data:${file.type};base64,${dataBase64}`;
                    }
                    remove.addEventListener("click", () => {
                        div.remove();
                        for (let i = mediaArray.length - 1; i >= 0; i--) {
                            let m = mediaArray[i];
                            if (m.id === div.id) mediaArray.splice(i, 1);
                        }
                    });
                    div.append(img, progress, remove);
                    if (!file.type.includes("video")) {
                        img.addEventListener("click", () => {
                            new Viewer(mediaContainer, {
                                transition: false,
                                zoomRatio: 0.3,
                            });
                        });
                        div.append(alt);
                    } else {
                        cw.style.marginLeft = "-53px";
                    }
                    div.append(cw);
                    mediaContainer.append(div);
                });

                setTimeout(() => {
                    let messageModalElement =
                        document.getElementsByClassName(
                            "messages-container"
                        )[0];
                    let inboxModalElement =
                        document.getElementsByClassName("inbox-modal")[0];
                    if (messageModalElement)
                        inboxModalElement.scrollTop =
                            inboxModalElement.scrollHeight;
                }, 10);
            }
        };
    }
}
let isURL = (str) => {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
};
function handleDrop(event, mediaArray, mediaContainer) {
    let text = event.dataTransfer.getData("Text").trim();
    if (text.length <= 1) {
        event.stopPropagation();
        event.preventDefault();
        let files = event.dataTransfer.files;
        handleFiles(files, mediaArray, mediaContainer);
    }
}
function getMedia(mediaArray, mediaContainer, is_dm = false) {
    let input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    if (!vars.disableAcceptType) {
        input.accept =
            "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime";
    }
    input.addEventListener("change", () => {
        handleFiles(input.files, mediaArray, mediaContainer, is_dm);
    });
    input.click();
}
function timeElapsed(targetTimestamp) {
    let currentDate = new Date();
    let currentTimeInms = currentDate.getTime();
    let targetDate = new Date(targetTimestamp);
    let targetTimeInms = targetDate.getTime();
    let elapsed = Math.floor((currentTimeInms - targetTimeInms) / 1000);
    const MonthNames = [
        LOC.january.message,
        LOC.february.message,
        LOC.march.message,
        LOC.april.message,
        LOC.may.message,
        LOC.june.message,
        LOC.july.message,
        LOC.august.message,
        LOC.september.message,
        LOC.october.message,
        LOC.november.message,
        LOC.december.message,
    ];
    if (elapsed < 1) {
        return LOC.s.message.replace("$NUMBER$", 0);
    }
    if (elapsed < 60) {
        //< 60 sec
        return LOC.s.message.replace("$NUMBER$", elapsed);
    }
    if (elapsed < 3600) {
        //< 60 minutes
        return LOC.m.message.replace("$NUMBER$", Math.floor(elapsed / 60));
    }
    if (elapsed < 86400) {
        //< 24 hours
        return LOC.h.message.replace("$NUMBER$", Math.floor(elapsed / 3600));
    }
    if (elapsed < 604800) {
        //<7 days
        return LOC.d.message.replace("$NUMBER$", Math.floor(elapsed / 86400));
    }
    if (targetDate.getFullYear() == currentDate.getFullYear()) {
        // same years
        return LOC.mmdd.message
            .replace("$DATE$", targetDate.getDate())
            .replace("$MONTH$", MonthNames[targetDate.getMonth()]);
    }
    //more than last years
    return LOC.mmddyy.message
        .replace("$DATE$", targetDate.getDate())
        .replace("$MONTH$", MonthNames[targetDate.getMonth()])
        .replace("$YEAR$", targetDate.getFullYear());
}
function openInNewTab(href) {
    Object.assign(document.createElement("a"), {
        target: "_blank",
        rel: "noopener noreferrer",
        href: href,
    }).click();
}
function onVisibilityChange(callback) {
    var visible = true;

    if (!callback) {
        throw new Error("no callback given");
    }

    function focused() {
        if (!visible) {
            callback((visible = true));
        }
    }

    function unfocused() {
        if (visible) {
            callback((visible = false));
        }
    }

    // Standards:
    if ("hidden" in document) {
        visible = !document.hidden;
        document.addEventListener("visibilitychange", function () {
            (document.hidden ? unfocused : focused)();
        });
    }
    if ("mozHidden" in document) {
        visible = !document.mozHidden;
        document.addEventListener("mozvisibilitychange", function () {
            (document.mozHidden ? unfocused : focused)();
        });
    }
    if ("webkitHidden" in document) {
        visible = !document.webkitHidden;
        document.addEventListener("webkitvisibilitychange", function () {
            (document.webkitHidden ? unfocused : focused)();
        });
    }
    if ("msHidden" in document) {
        visible = !document.msHidden;
        document.addEventListener("msvisibilitychange", function () {
            (document.msHidden ? unfocused : focused)();
        });
    }
    // IE 9 and lower:
    if ("onfocusin" in document) {
        document.onfocusin = focused;
        document.onfocusout = unfocused;
    }
    // All others:
    window.onpageshow = window.onfocus = focused;
    window.onpagehide = window.onblur = unfocused;
}
function escapeHTML(unsafe) {
    if (typeof unsafe === "undefined" || unsafe === null) {
        return "";
    }

    //twitter returns already-escaped text in some scenarios, which can cause it to get double-escaped, so we're unescaping that to re-escape it...
    unsafe = unsafe
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&amp;", "&");

    return (unsafe = unsafe
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;"));
}

function html(strings, ...values) {
    let str = "";
    strings.forEach((string, i) => {
        let value;
        if (typeof values[i] === "undefined" || values[i] === null) {
            value = "";
        } else {
            value = String(values[i]);
        }

        str += string + DOMPurify.sanitize(value, { ADD_ATTR: ["target"] });
    });
    return str;
}

function replaceTemplates(string, replacements) {
    return string.replace(/\$[A-Z_]+\$/g, (match) => {
        if (match in replacements) return replacements[match];
        return match;
    });
}

async function renderTweetBodyHTML(t, is_quoted) {
    let result = "",
        last_pos = 0,
        index_map = {}; // {start_position: [end_position, replacer_func]}
    hashflags = [];

    if (vars.enableHashflags) {
        hashflags = await API.discover.getHashflagsV2();
    }

    if (is_quoted) t = t.quoted_status;

    full_text_array = Array.from(t.full_text);

    if (t.entities.richtext) {
        t.entities.richtext.forEach((snippet) => {
            //if i felt like it, id write a long-winded series of comments on how much i hate emojis. but i'll refrain
            //and this *still* doesnt work properly with flag emojis
            //im just glad it works at all

            let textBeforeSnippet = t.full_text.slice(0, snippet.from_index);
            let emojisBeforeSnippet = textBeforeSnippet.match(
                /\p{Extended_Pictographic}/gu
            );
            emojisBeforeSnippet = emojisBeforeSnippet
                ? emojisBeforeSnippet.length
                : 0;

            let fromIndex = snippet.from_index - emojisBeforeSnippet;
            let toIndex = snippet.to_index - emojisBeforeSnippet;

            index_map[fromIndex] = [
                toIndex,
                (text) => {
                    let snippetText = escapeHTML(
                        full_text_array.slice(fromIndex, toIndex).join("")
                    );
                    let startingTags = `${
                        snippet.richtext_types.includes("Bold") ? "<b>" : ""
                    }${snippet.richtext_types.includes("Italic") ? "<i>" : ""}`;
                    let endingTags = `${
                        snippet.richtext_types.includes("Bold") ? "</b>" : ""
                    }${
                        snippet.richtext_types.includes("Italic") ? "</i>" : ""
                    }`;

                    return `${startingTags}${snippetText}${endingTags}`;
                },
            ];
        });
    }

    if (is_quoted) {
        // for quoted tweet we need only hashflags and readable urls
        if (t.entities.hashtags) {
            t.entities.hashtags.forEach((hashtag) => {
                let hashflag = hashflags.find(
                    (h) =>
                        h.hashtag.toLowerCase() === hashtag.text.toLowerCase()
                );
                index_map[hashtag.indices[0]] = [
                    hashtag.indices[1],
                    (text) =>
                        `#${escapeHTML(hashtag.text)}` +
                        `${
                            hashflag
                                ? `<img src="${hashflag.asset_url}" class="hashflag">`
                                : ""
                        }`,
                ];
            });
        }

        if (t.entities.urls) {
            t.entities.urls.forEach((url) => {
                index_map[url.indices[0]] = [
                    url.indices[1],
                    (text) => `${escapeHTML(url.display_url)}`,
                ];
            });
        }
    } else {
        if (t.entities.hashtags) {
            t.entities.hashtags.forEach((hashtag) => {
                let hashflag = hashflags.find(
                    (h) =>
                        h.hashtag.toLowerCase() === hashtag.text.toLowerCase()
                );
                index_map[hashtag.indices[0]] = [
                    hashtag.indices[1],
                    (text) =>
                        `<a href="/hashtag/${escapeHTML(hashtag.text)}">` +
                        `#${escapeHTML(hashtag.text)}` +
                        `${
                            hashflag
                                ? `<img src="${hashflag.asset_url}" class="hashflag">`
                                : ""
                        }` +
                        `</a>`,
                ];
            });
        }

        if (t.entities.symbols) {
            t.entities.symbols.forEach((symbol) => {
                index_map[symbol.indices[0]] = [
                    symbol.indices[1],
                    (text) =>
                        `<a href="/search?q=%24${escapeHTML(symbol.text)}">` +
                        `$${escapeHTML(symbol.text)}` +
                        `</a>`,
                ];
            });
        }

        if (t.entities.urls) {
            t.entities.urls.forEach((url) => {
                index_map[url.indices[0]] = [
                    url.indices[1],
                    (text) =>
                        `<a href="${escapeHTML(
                            url.expanded_url
                        )}" title="${escapeHTML(
                            url.expanded_url
                        )}" target="_blank" rel="noopener noreferrer">` +
                        `${escapeHTML(url.display_url)}</a>`,
                ];
            });
        }

        if (t.entities.user_mentions) {
            t.entities.user_mentions.forEach((user) => {
                index_map[user.indices[0]] = [
                    user.indices[1],
                    (text) =>
                        `<a href="/${escapeHTML(
                            user.screen_name
                        )}">${escapeHTML(text)}</a>`,
                ];
            });
        }

        if (t.entities.media) {
            t.entities.media.forEach((media) => {
                index_map[media.indices[0]] = [media.indices[1], (text) => ``];
            });
        }
    }

    let display_start =
        t.display_text_range !== undefined ? t.display_text_range[0] : 0;
    let display_end =
        t.display_text_range !== undefined
            ? t.display_text_range[1]
            : full_text_array.length;
    for (let [current_pos, _] of full_text_array.entries()) {
        if (current_pos < display_start) {
            // do not render first part of message
            last_pos = current_pos + 1; // to start copy from next symbol
            continue;
        }
        if (
            current_pos == display_end || // reached the end of visible part
            current_pos == full_text_array.length - 1
        ) {
            // reached the end of tweet itself
            if (display_end == full_text_array.length) current_pos++; // dirty hack to include last element of slice
            result += escapeHTML(
                full_text_array.slice(last_pos, current_pos).join("")
            );
            break;
        }
        if (current_pos > display_end) {
            break; // do not render last part of message
        }

        if (current_pos in index_map) {
            let [end, func] = index_map[current_pos];

            if (current_pos > last_pos) {
                result += escapeHTML(
                    full_text_array.slice(last_pos, current_pos).join("")
                ); // store chunk of untouched text
            }
            result += func(full_text_array.slice(current_pos, end).join("")); // run replacer func on corresponding range
            last_pos = end;
        }
    }
    return result;
}
function arrayInsert(arr, index, value) {
    return [...arr.slice(0, index), value, ...arr.slice(index)];
}
function generatePoll(tweet, tweetElement, user) {
    let pollElement = tweetElement.getElementsByClassName("tweet-card")[0];
    pollElement.innerHTML = "";
    let poll = tweet.card.binding_values;
    let choices = Object.keys(poll)
        .filter((key) => key.endsWith("label"))
        .map((key, i) => ({
            label: poll[key].string_value,
            count: poll[key.replace("label", "count")]
                ? +poll[key.replace("label", "count")].string_value
                : 0,
            id: parseInt(key.replace(/[^0-9]/g, "")),
        }));
    choices.sort((a, b) => a.id - b.id);
    let voteCount = choices.reduce((acc, cur) => acc + cur.count, 0);
    if (
        poll.selected_choice ||
        user.id_str === tweet.user.id_str ||
        (poll.counts_are_final && poll.counts_are_final.boolean_value)
    ) {
        for (let i in choices) {
            let choice = choices[i];
            if (
                user.id_str !== tweet.user.id_str &&
                poll.selected_choice &&
                choice.id === +poll.selected_choice.string_value
            ) {
                choice.selected = true;
            }
            choice.percentage =
                Math.round((choice.count / voteCount) * 100) || 0;
            let choiceElement = document.createElement("div");
            choiceElement.classList.add("choice");
            choiceElement.innerHTML = html`
                <div
                    class="choice-bg"
                    style="width:${choice.percentage}%"
                    data-percentage="${choice.percentage}"
                ></div>
                <div class="choice-label">
                    <span>${escapeHTML(choice.label)}</span>
                    ${choice.selected
                        ? `<span class="choice-selected"></span>`
                        : ""}
                </div>
                ${isFinite(choice.percentage)
                    ? `<div class="choice-count">${choice.count} (${choice.percentage}%)</div>`
                    : '<div class="choice-count">0</div>'}
            `;
            pollElement.append(choiceElement);
        }
    } else {
        for (let i in choices) {
            let choice = choices[i];
            let choiceElement = document.createElement("div");
            choiceElement.classList.add("choice", "choice-unselected");
            choiceElement.classList.add("tweet-button");
            choiceElement.innerHTML = html`
                <div class="choice-bg" style="width:100%"></div>
                <div class="choice-label">${escapeHTML(choice.label)}</div>
            `;
            choiceElement.addEventListener("click", async () => {
                let newCard = await API.tweet.vote(
                    poll.api.string_value,
                    tweet.id_str,
                    tweet.card.url,
                    tweet.card.name,
                    choice.id
                );
                tweet.card = newCard.card;
                generateCard(tweet, tweetElement, user);
            });
            pollElement.append(choiceElement);
        }
    }
    if (tweet.card.url.startsWith("card://")) {
        let footer = document.createElement("span");
        footer.classList.add("poll-footer");
        let endsAtMessage;
        if (LOC.ends_at.message.includes("$DATE$")) {
            endsAtMessage = LOC.ends_at.message.replace(
                "$DATE$",
                new Date(poll.end_datetime_utc.string_value).toLocaleString()
            );
        } else {
            endsAtMessage = `${LOC.ends_at.message} ${new Date(
                poll.end_datetime_utc.string_value
            ).toLocaleString()}`;
        }
        footer.innerHTML = html`${voteCount}
        ${voteCount === 1
            ? LOC.vote.message
            : LOC.votes.message}${(!poll.counts_are_final ||
            !poll.counts_are_final.boolean_value) &&
        poll.end_datetime_utc
            ? ` ・ ${endsAtMessage}`
            : ""}`;
        pollElement.append(footer);
    }
}
function generateCard(tweet, tweetElement, user) {
    if (!tweet.card) return;
    if (
        tweet.card.name === "promo_image_convo" ||
        tweet.card.name === "promo_video_convo"
    ) {
        let vals = tweet.card.binding_values;
        let a = document.createElement("a");
        a.title = vals.thank_you_text.string_value;
        if (tweet.card.name === "promo_image_convo") {
            a.href = vals.thank_you_url ? vals.thank_you_url.string_value : "#";
            a.target = "_blank";
            let img = document.createElement("img");
            let imgValue = vals.promo_image;
            if (!imgValue) {
                imgValue = vals.cover_promo_image_original;
            }
            if (!imgValue) {
                imgValue = vals.cover_promo_image_large;
            }
            if (!imgValue) {
                return;
            }
            img.src = imgValue.image_value.url;
            let [w, h] = sizeFunctions[1](
                imgValue.image_value.width,
                imgValue.image_value.height
            );
            img.width = w;
            img.height = h;
            img.className = "tweet-media-element";
            a.append(img);
        } else {
            let overlay = document.createElement("div");
            overlay.innerHTML = html`
                <svg viewBox="0 0 24 24" class="tweet-media-video-overlay-play">
                    <g>
                        <path class="svg-play-path" d="M8 5v14l11-7z"></path>
                        <path d="M0 0h24v24H0z" fill="none"></path>
                    </g>
                </svg>
            `;
            overlay.className = "tweet-media-video-overlay";
            overlay.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                try {
                    let res = await fetch(vid.currentSrc); // weird problem with vids breaking cuz twitter sometimes doesnt send content-length
                    if (!res.headers.get("content-length")) await sleep(1000);
                } catch (e) {
                    console.error(e);
                }
                vid.play();
                vid.controls = true;
                vid.classList.remove("tweet-media-element-censor");
                overlay.style.display = "none";
            });
            let vid = document.createElement("video");
            let [w, h] = sizeFunctions[1](
                vals.player_image_original.image_value.width,
                vals.player_image_original.image_value.height
            );
            vid.width = w;
            vid.height = h;
            vid.preload = "none";
            vid.poster = vals.player_image_large.image_value.url;
            vid.className = "tweet-media-element";
            vid.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
            });
            fetch(vals.player_stream_url.string_value)
                .then((res) => res.text())
                .then((blob) => {
                    let xml = new DOMParser().parseFromString(blob, "text/xml");
                    let MediaFile = xml.getElementsByTagName("MediaFile")[0];
                    vid.src = MediaFile.textContent.trim();
                });
            let tweetMedia = document.createElement("div");
            tweetMedia.className = "tweet-media";
            tweetMedia.style.right = "unset";
            tweetMedia.append(overlay, vid);
            a.append(tweetMedia);
        }
        let ctas = [];
        if (vals.cta_one) {
            ctas.push([vals.cta_one, vals.cta_one_tweet]);
        }
        if (vals.cta_two) {
            ctas.push([vals.cta_two, vals.cta_two_tweet]);
        }
        if (vals.cta_three) {
            ctas.push([vals.cta_three, vals.cta_three_tweet]);
        }
        if (vals.cta_four) {
            ctas.push([vals.cta_four, vals.cta_four_tweet]);
        }
        let buttonGroup = document.createElement("div");
        buttonGroup.classList.add("tweet-button-group");
        for (let b of ctas) {
            let button = document.createElement("button");
            button.className = `nice-button tweet-app-button`;
            button.innerText = `${LOC.tweet_verb.message} ${b[0].string_value}`;
            button.addEventListener("click", async () => {
                let modal = createModal(`
                    <p style="color:var(--almost-black);margin-top:0">${LOC.do_you_want_to_tweet.message.replace(
                        "$TWEET_TEXT$",
                        b[1].string_value
                    )}</p>
                    <button class="nice-button">${
                        LOC.tweet_verb.message
                    }</button>
                `);
                modal
                    .getElementsByClassName("nice-button")[0]
                    .addEventListener("click", async () => {
                        modal.removeModal();
                        try {
                            await API.tweet.postV2({
                                text: b[1].string_value,
                                card_uri: tweet.card.url,
                            });
                        } catch (e) {
                            console.error(e);
                            alert(String(e));
                        }
                    });
            });
            buttonGroup.append(button);
        }
        tweetElement.getElementsByClassName("tweet-card")[0].append(a);
        tweetElement
            .getElementsByClassName("tweet-card")[0]
            .append(buttonGroup);
    } else if (tweet.card.name === "player") {
        let iframe = document.createElement("iframe");
        iframe.src = tweet.card.binding_values.player_url.string_value
            .replace("youtube.com", "youtube-nocookie.com")
            .replace("autoplay=true", "autoplay=false")
            .replace("autoplay=1", "autoplay=0");
        iframe.classList.add("tweet-player");
        let [w, h] = sizeFunctions[1](
            +tweet.card.binding_values.player_width.string_value,
            +tweet.card.binding_values.player_height.string_value
        );
        iframe.width = w;
        iframe.height = h;
        iframe.loading = "lazy";
        iframe.allowFullscreen = true;
        tweetElement.getElementsByClassName("tweet-card")[0].innerHTML = "";
        tweetElement.getElementsByClassName("tweet-card")[0].append(iframe);
    } else if (tweet.card.name === "unified_card") {
        let uc = JSON.parse(
            tweet.card.binding_values.unified_card.string_value
        );
        for (let cn of uc.components) {
            let co = uc.component_objects[cn];
            if (co.type === "media") {
                let media = uc.media_entities[co.data.id];

                if (media.type === "photo") {
                    let img = document.createElement("img");
                    img.className = "tweet-media-element";
                    let [w, h] = sizeFunctions[1](
                        media.original_info.width,
                        media.original_info.height
                    );
                    img.width = w;
                    img.height = h;
                    img.loading = "lazy";
                    img.src = media.media_url_https;
                    img.addEventListener("click", () => {
                        new Viewer(img, {
                            transition: false,
                            zoomRatio: 0.3,
                        });
                    });
                    tweetElement
                        .getElementsByClassName("tweet-card")[0]
                        .append(img, document.createElement("br"));
                } else if (
                    media.type === "animated_gif" ||
                    media.type === "video"
                ) {
                    let video = document.createElement("video");
                    video.className =
                        "tweet-media-element tweet-media-element-one";
                    let [w, h] = sizeFunctions[1](
                        media.original_info.width,
                        media.original_info.height
                    );
                    video.width = w;
                    video.height = h;
                    video.crossOrigin = "anonymous";
                    video.loading = "lazy";
                    video.controls = true;
                    if (!media.video_info) {
                        console.log(
                            `bug found in ${tweet.id_str}, please report this message to https://github.com/dimdenGD/OldTwitter/issues`,
                            tweet
                        );
                        continue;
                    }
                    let variants = media.video_info.variants.sort((a, b) => {
                        if (!b.bitrate) return -1;
                        return b.bitrate - a.bitrate;
                    });
                    if (typeof vars.savePreferredQuality !== "boolean") {
                        chrome.storage.sync.set(
                            {
                                savePreferredQuality: true,
                            },
                            () => {}
                        );
                        vars.savePreferredQuality = true;
                    }
                    if (
                        localStorage.preferredQuality &&
                        vars.savePreferredQuality
                    ) {
                        let closestQuality = variants
                            .filter((v) => v.bitrate)
                            .reduce((prev, curr) => {
                                return Math.abs(
                                    parseInt(curr.url.match(/\/(\d+)x/)[1]) -
                                        parseInt(localStorage.preferredQuality)
                                ) <
                                    Math.abs(
                                        parseInt(
                                            prev.url.match(/\/(\d+)x/)[1]
                                        ) -
                                            parseInt(
                                                localStorage.preferredQuality
                                            )
                                    )
                                    ? curr
                                    : prev;
                            });
                        let preferredQualityVariantIndex = variants.findIndex(
                            (v) => v.url === closestQuality.url
                        );
                        if (preferredQualityVariantIndex !== -1) {
                            let preferredQualityVariant =
                                variants[preferredQualityVariantIndex];
                            variants.splice(preferredQualityVariantIndex, 1);
                            variants.unshift(preferredQualityVariant);
                        }
                    }
                    for (let v in variants) {
                        let source = document.createElement("source");
                        source.src = variants[v].url;
                        source.type = variants[v].content_type;
                        video.append(source);
                    }
                    tweetElement
                        .getElementsByClassName("tweet-card")[0]
                        .append(video, document.createElement("br"));
                }
            } else if (co.type === "app_store_details") {
                let app =
                    uc.app_store_data[
                        uc.destination_objects[co.data.destination].data.app_id
                    ][0];
                let appElement = document.createElement("div");
                appElement.classList.add("tweet-app-info");
                appElement.innerHTML = html`
                    <h3>${escapeHTML(app.title.content)}</h3>
                    <span>${escapeHTML(app.category.content)}</span>
                    <br />
                `;
                tweetElement
                    .getElementsByClassName("tweet-card")[0]
                    .append(appElement);
            } else if (co.type === "button_group") {
                let buttonGroup = document.createElement("div");
                buttonGroup.classList.add("tweet-button-group");
                for (let b of co.data.buttons) {
                    let app =
                        uc.app_store_data[
                            uc.destination_objects[b.destination].data.app_id
                        ][0];
                    let button = document.createElement("a");
                    button.href = `http://play.google.com/store/apps/details?id=${app.id}`;
                    button.target = "_blank";
                    button.className = `nice-button tweet-app-button tweet-app-button-${b.style}`;
                    button.innerText =
                        b.action[0].toUpperCase() + b.action.slice(1);
                    buttonGroup.append(button);
                }
                tweetElement
                    .getElementsByClassName("tweet-card")[0]
                    .append(buttonGroup);
            }
        }
    } else if (
        tweet.card.name === "summary" ||
        tweet.card.name === "summary_large_image"
    ) {
        let vals = tweet.card.binding_values;
        let a = document.createElement("a");
        let url = vals.card_url.string_value;
        if (tweet.entities && tweet.entities.urls) {
            let urlEntity = tweet.entities.urls.find((u) => u.url === url);
            if (urlEntity) {
                url = urlEntity.expanded_url;
            }
        }
        a.target = "_blank";
        a.href = url;
        a.className = "tweet-card-link box";
        a.innerHTML = html`
            ${vals.thumbnail_image
                ? `<img src="${vals.thumbnail_image.image_value.url}" class="tweet-card-link-thumbnail">`
                : ""}
            <div class="tweet-card-link-text">
                ${vals.vanity_url
                    ? `<span class="tweet-card-link-vanity">${escapeHTML(
                          vals.vanity_url.string_value
                      )}</span><br>`
                    : ""}
                ${vals.title
                    ? `<h3 class="tweet-card-link-title">${escapeHTML(
                          vals.title.string_value
                      )}</h3>`
                    : ""}
                ${vals.description
                    ? `<span class="tweet-card-link-description">${escapeHTML(
                          vals.description.string_value
                      )}</span>`
                    : ""}
            </div>
        `;
        tweetElement.getElementsByClassName("tweet-card")[0].append(a);
    } else if (tweet.card.url.startsWith("card://")) {
        generatePoll(tweet, tweetElement, user);
    }
}
function createEmojiPicker(container, input, style = {}) {
    let picker = new EmojiPicker({
        i18n: {
            categories: {
                custom: LOC.custom.message,
                "smileys-emotion": LOC.smileys_emotion.message,
                "people-body": LOC.people_body.message,
                "animals-nature": LOC.animals_nature.message,
                "food-drink": LOC.food_drink.message,
                "travel-places": LOC.travel_places.message,
                activities: LOC.activities.message,
                objects: LOC.objects.message,
                symbols: LOC.symbols.message,
                flags: LOC.flags.message,
            },
            categoriesLabel: LOC.categories.message,
            emojiUnsupportedMessage: LOC.unsupported_emoji.message,
            favoritesLabel: LOC.favorites.message,
            loadingMessage: LOC.loading.message,
            networkErrorMessage: LOC.cant_load_emoji.message,
            regionLabel: LOC.emoji_picker.message,
            searchDescription: LOC.emoji_search_description.message,
            searchLabel: LOC.search.message,
            searchResultsLabel: LOC.search_results.message,
            skinToneDescription:
                "When expanded, press up or down to select and enter to choose.",
            skinToneLabel: LOC.skin_tone_label.message.replace(
                "$SKIN_TONE$",
                "{skinTone}"
            ),
            skinTones: [
                "Default",
                "Light",
                "Medium-Light",
                "Medium",
                "Medium-Dark",
                "Dark",
            ],
            skinTonesLabel: LOC.skin_tones_label.message,
        },
    });
    for (let i in style) {
        picker.style[i] = style[i];
    }
    picker.className = isDarkModeEnabled ? "dark" : "light";
    picker.addEventListener("emoji-click", (e) => {
        let pos = input.selectionStart;
        let text = input.value;
        input.value = text.slice(0, pos) + e.detail.unicode + text.slice(pos);
        input.selectionStart = pos + e.detail.unicode.length;
    });
    container.append(picker);

    let observer;
    if (vars.enableTwemoji) {
        const style = document.createElement("style");
        style.textContent = `.twemoji {
            width: var(--emoji-size);
            height: var(--emoji-size);
            pointer-events: none;
        }`;
        picker.shadowRoot.appendChild(style);

        observer = new MutationObserver(() => {
            for (const emoji of picker.shadowRoot.querySelectorAll(".emoji")) {
                // Avoid infinite loops of MutationObserver
                if (!emoji.querySelector(".twemoji")) {
                    // Do not use default 'emoji' class name because it conflicts with emoji-picker-element's
                    twemoji.parse(emoji, { className: "twemoji" });
                }
            }
        });
        observer.observe(picker.shadowRoot, {
            subtree: true,
            childList: true,
        });
    }

    setTimeout(() => {
        function oc(e) {
            if (picker.contains(e.target)) return;
            if (observer) {
                observer.disconnect();
            }
            picker.remove();
            document.removeEventListener("click", oc);
            picker.database.close();
        }
        document.addEventListener("click", oc);
        picker.shadowRoot.querySelector("input.search").focus();
    }, 100);

    return picker;
}
function isEmojiOnly(str) {
    const stringToTest = str.replace(/ /g, "");
    const emojiRegex =
        /^(?:(?:\p{RI}\p{RI}|\p{Emoji}(?:\p{Emoji_Modifier}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(?:\u{200D}\p{Emoji}(?:\p{Emoji_Modifier}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)*)|[\u{1f900}-\u{1f9ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}])+$/u;
    return emojiRegex.test(stringToTest) && Number.isNaN(Number(stringToTest));
}

const RED = 0.2126;
const GREEN = 0.7152;
const BLUE = 0.0722;

const GAMMA = 2.4;

function luminance(r, g, b) {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, GAMMA);
    });
    return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
}

function contrast(rgb1, rgb2) {
    const lum1 = luminance(...rgb1);
    const lum2 = luminance(...rgb2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}
function hex2rgb(hex) {
    if (!hex.startsWith("#")) hex = `#${hex}`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}
function rgb2hex(r, g, b) {
    return `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let d = max - min;
    let h;
    if (d === 0) h = 0;
    else if (max === r) h = ((((g - b) / d) % 6) + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else if (max === b) h = (r - g) / d + 4;
    let l = (min + max) / 2;
    let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return [h * 60, s, l];
}

function hslToRgb(h, s, l) {
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let hp = h / 60.0;
    let x = c * (1 - Math.abs((hp % 2) - 1));
    let rgb1;
    if (isNaN(h)) rgb1 = [0, 0, 0];
    else if (hp <= 1) rgb1 = [c, x, 0];
    else if (hp <= 2) rgb1 = [x, c, 0];
    else if (hp <= 3) rgb1 = [0, c, x];
    else if (hp <= 4) rgb1 = [0, x, c];
    else if (hp <= 5) rgb1 = [x, 0, c];
    else if (hp <= 6) rgb1 = [c, 0, x];
    let m = l - c * 0.5;
    return [
        Math.round(255 * (rgb1[0] + m)),
        Math.round(255 * (rgb1[1] + m)),
        Math.round(255 * (rgb1[2] + m)),
    ];
}
function getBackgroundColor() {
    let root = document.documentElement;
    let bg_color =
        getComputedStyle(root).getPropertyValue("--background-color");
    if (bg_color === "white") {
        bg_color = "#ffffff";
    } else if (bg_color === "black") {
        bg_color = "#000000";
    } else if (bg_color.startsWith("rgb(")) {
        let rgb = bg_color
            .slice(4, -1)
            .split(",")
            .map((v) => parseInt(v));
        bg_color = rgb2hex(...rgb);
    }
    if (!bg_color) bg_color = "#ffffff";
    return bg_color;
}
function makeSeeableColor(color, bg_color = getBackgroundColor()) {
    let bg_rgb = hex2rgb(bg_color);
    let rgb = hex2rgb(color);
    let c = contrast(bg_rgb, rgb);
    let hsl = rgbToHsl(...rgb);
    let bg_hsl = rgbToHsl(...bg_rgb);
    if (c < 4.5) {
        if (bg_hsl[2] > 0.7) {
            if (hsl[2] > 0.7) {
                hsl[2] = 0.4;
                if (hsl[1] >= 0.1) hsl[1] -= 0.1;
            }
        }
        if (bg_hsl[2] < 0.4) {
            if (c < 2.9) {
                if (hsl[2] <= 0.6) {
                    hsl[2] = 0.6;
                    if (hsl[1] >= 0.1) hsl[1] -= 0.1;
                }
            }
        }
    }
    return rgb2hex(...hslToRgb(...hsl));
}

async function getLinkColors(ids) {
    if (typeof ids === "string") ids = ids.split(",");
    ids = [...new Set(ids)];
    const colours = await Promise.all([
        new Promise(async (resolve, reject) => {
            chrome.storage.local.get(["linkColors"], async (data) => {
                // const oldUsers = await Promise.all(ids.filter(i => !data.linkColors[i] !== 0).map(i => API.user.get(i)));
                let linkColors = data.linkColors || {};
                let toFetch = [];
                // const colourUsers = oldUsers.filter(u => !!u.profile_link_color && u.profile_link_color !== "1DA1F2").map(u => ({id: u.id_str, color: u.profile_link_color}));
                // const nonColourUsers = oldUsers.filter(u => !u.profile_link_color || u.profile_link_color === "1DA1F2").map(u => u.id_str);
                let fetched = [];

                for (let id of ids) {
                    if (typeof linkColors[id] === "undefined") {
                        toFetch.push(id);
                    } else {
                        if (linkColors[id])
                            fetched.push({ id, color: linkColors[id] });
                    }
                }
                if (
                    toFetch.length === 0 ||
                    (window.navigator &&
                        navigator.connection &&
                        navigator.connection.type === "cellular" &&
                        !vars.disableDataSaver)
                ) {
                    return resolve(fetched);
                }

                try {
                    const controller = new AbortController();

                    let t = setTimeout(() => controller.abort(), 1000);
                    let res = await fetch(
                        "https://dimden.dev/services/twitter_link_colors/v2/get_multiple/" +
                            toFetch.join(","),
                        {
                            signal: controller.signal,
                        }
                    );
                    clearTimeout(t);
                    let json = await res.json();
                    for (let id in json) {
                        if (json[id] === "none" || json[id] === "4595b5") {
                            continue;
                        }
                        fetched.push({ id, color: json[id] });
                        linkColors[id] = json[id];
                    }
                    for (let id of ids) {
                        if (typeof linkColors[id] === "undefined") {
                            linkColors[id] = 0;
                        }
                    }
                    let keys = Object.keys(linkColors);
                    if (keys.length > 20000) {
                        chrome.storage.local.set({ linkColors: {} }, () => {});
                    } else {
                        chrome.storage.local.set({ linkColors }, () => {});
                    }
                    return resolve(fetched);
                } catch (e) {
                    return resolve(fetched);
                }
            });
        }),
        new Promise(async (resolve, reject) => {
            // firstly, get "legacyLinkColors" from storage
            chrome.storage.local.get(["legacyLinkColors"], async (data) => {
                let legacyLinkColors = data.legacyLinkColors || {};
                // each id will either have a hex colour or -1 if the user doesn't have a custom link colour
                let hasColourIds = ids.filter(
                    (id) => legacyLinkColors[id] && legacyLinkColors[id] !== -1
                );
                let noColourIds = ids.filter(
                    (id) => legacyLinkColors[id] && legacyLinkColors[id] === -1
                );
                let fetched = [];
                let toFetch = ids.filter(
                    (id) =>
                        !hasColourIds.includes(id) && !noColourIds.includes(id)
                );
                let users = [];
                if (toFetch.length > 0) {
                    try {
                        users = await API.user.lookup(toFetch);
                    } catch {
                        console.warn("Legacy user colours failed to fetch!");
                    }
                }
                for (let user of users) {
                    if (
                        user.profile_link_color &&
                        user.profile_link_color !== "1DA1F2"
                    ) {
                        fetched.push({
                            id: user.id_str,
                            color: user.profile_link_color,
                        });
                        legacyLinkColors[user.id_str] = user.profile_link_color;
                    } else {
                        legacyLinkColors[user.id_str] = -1;
                    }
                }
                // also push existing colours
                for (let id of hasColourIds) {
                    fetched.push({ id, color: legacyLinkColors[id] });
                }
                chrome.storage.local.set({ legacyLinkColors }, () => {});
                resolve(fetched);
            });
        }),
    ]);
    // we need to return { id: string, color: string }[]
    // clear duplicates; if there's two ids, prioritize the one in the first array
    let linkColors = [];
    for (let colour of colours[0]) {
        linkColors.push(colour);
    }
    for (let colour of colours[1]) {
        if (!linkColors.find((c) => c.id === colour.id)) {
            linkColors.push(colour);
        }
    }
    return linkColors;
}

function getOtAuthToken(cache = true) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["otPrivateTokens"], async (data) => {
            if (!data.otPrivateTokens) {
                data.otPrivateTokens = {};
            }
            if (data.otPrivateTokens[user.id_str] && cache) {
                resolve(data.otPrivateTokens[user.id_str]);
            } else {
                let tokens = await fetch(
                    `https://dimden.dev/services/twitter_link_colors/v2/request_token`,
                    { method: "post" }
                ).then((r) => r.json());
                let tweet;
                try {
                    tweet = await API.tweet.postV2({
                        status: `otauth=${tokens.public_token}`,
                    });
                    delete tweet.res;
                    let res = await fetch(
                        `https://dimden.dev/services/twitter_link_colors/v2/verify_token`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                tweet,
                                public_token: tokens.public_token,
                                private_token: tokens.private_token,
                            }),
                        }
                    ).then((i) => i.text());
                    if (res === "success") {
                        data.otPrivateTokens[user.id_str] =
                            tokens.private_token;
                        chrome.storage.local.set(
                            { otPrivateTokens: data.otPrivateTokens },
                            () => {
                                resolve(tokens.private_token);
                            }
                        );
                    } else {
                        console.error(res);
                        reject(res);
                        setTimeout(() => alert(res), 500);
                    }
                } catch (e) {
                    console.error(e);
                    alert(e);
                    reject(e);
                } finally {
                    API.tweet.delete(tweet.id_str).catch((e) => {
                        console.error(e);
                        setTimeout(() => {
                            API.tweet.delete(tweet.id_str);
                        }, 1000);
                    });
                }
            }
        });
    });
}

function isProfilePath(path) {
    path = path.split("?")[0].split("#")[0];
    if (path.endsWith("/")) path = path.slice(0, -1);
    if (path.split("/").length > 2) return false;
    if (path.length <= 1) return false;
    if (
        [
            "/home",
            "/notifications",
            "/messages",
            "/settings",
            "/explore",
            "/login",
            "/register",
            "/signin",
            "/signup",
            "/logout",
            "/i",
            "/old",
            "/search",
            "/donate",
        ].includes(path)
    )
        return false;
    return /^\/[A-z-0-9-_]{1,15}$/.test(path);
}
function isSticky(el) {
    while (el !== document.body.parentElement) {
        let pos = getComputedStyle(el).position;
        if (pos === "sticky" || pos === "fixed") return true;
        el = el.parentElement;
    }
    return false;
}
function onVisible(element, callback) {
    new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
                callback(element);
                observer.disconnect();
            }
        });
    }).observe(element);
}
function shuffleArray(t) {
    let last = t.length;
    let n;
    while (last > 0) {
        n = rand(last);
        swap(t, n, --last);
    }
}

const rand = (n) => 0 | (Math.random() * n);

function swap(t, i, j) {
    let q = t[i];
    t[i] = t[j];
    t[j] = q;
    return t;
}
function updateUnfollows(res) {
    return new Promise(async (resolve, reject) => {
        let data = res[user.id_str];
        let cursor = "-1";
        let followers = [],
            following = [];

        data.lastUpdate = Date.now();
        chrome.storage.local.set({ unfollows: res });

        while (cursor !== "0") {
            let data = await API.user.getFollowersIds(cursor);
            cursor = data.next_cursor_str;
            followers = followers.concat(data.ids);
        }
        cursor = "-1";
        while (cursor !== "0") {
            let data = await API.user.getFollowingIds(cursor);
            cursor = data.next_cursor_str;
            following = following.concat(data.ids);
        }

        let unfollowers = data.followers.filter((f) => !followers.includes(f));
        data.followers = followers;
        if (unfollowers.length > 0) {
            unfollowers = unfollowers.map((u) => [u, Date.now()]);
            data.unfollowers = data.unfollowers.concat(unfollowers);
        }
        let unfollowings = data.following.filter((f) => !following.includes(f));
        data.following = following;
        if (unfollowings.length > 0) {
            unfollowings = unfollowings.map((u) => [u, Date.now()]);
            data.unfollowings = data.unfollowings.concat(unfollowings);
        }
        chrome.storage.local.set({ unfollows: res }, () => resolve(res));
    });
}
function getTimeZone() {
    let offset = new Date().getTimezoneOffset(),
        o = Math.abs(offset);
    return (
        (offset < 0 ? "+" : "-") +
        ("00" + Math.floor(o / 60)).slice(-2) +
        ":" +
        ("00" + (o % 60)).slice(-2)
    );
}
function formatLargeNumber(n) {
    let option = {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
    };
    let specialLangs = ["zh_cn", "zh_tw", "ja", "ko"]; // these languages actually stay short
    if (n >= 1e4 && !vars.showExactValues) {
        if (vars.localizeDigit)
            return Number(n).toLocaleString(
                specialLangs.includes(LANGUAGE.toLowerCase())
                    ? LANGUAGE.replace("_", "-")
                    : "en-US",
                option
            );
        else return Number(n).toLocaleString("en-US", option);
    } else return Number(n).toLocaleString();
}
function languageMatches(tweetLanguage) {
    if (!tweetLanguage) return true;

    if (tweetLanguage.includes("-")) {
        let [lang, country] = tweetLanguage.split("-");
        tweetLanguage = `${lang}_${country.toUpperCase()}`;
    }
    let isMatchingLanguage = tweetLanguage === LANGUAGE;
    // https://twittercommunity.com/t/unkown-language-code-qht-returned-by-api/172819/3
    if (
        ["qam", "qct", "qht", "qme", "qst", "zxx", "und"].includes(
            tweetLanguage
        )
    ) {
        isMatchingLanguage = true;
    }

    return isMatchingLanguage;
}

async function renderTrends(compact = false, cache = true) {
    if (vars.hideTrends) return;
    let [trendsData, hashflags] = await Promise.allSettled([
        API.discover[
            vars.disablePersonalizedTrends ? "getTrends" : "getTrendsV2"
        ](cache),
        API.discover.getHashflags(),
    ]);
    let trends = trendsData.value.modules;
    hashflags = hashflags.value ? hashflags.value : [];
    let trendsContainer = document.getElementById("trends-list");
    trendsContainer.innerHTML = "";
    let max = 7;
    if (innerHeight < 650) max = 3;
    trends.slice(0, max).forEach(({ trend }) => {
        if (!compact && trend.meta_description) {
            LOC.replacer_post_to_tweet.message.split("|").forEach((el) => {
                trend.meta_description = trend.meta_description.replace(
                    new RegExp(el.split("->")[0], "g"),
                    el.split("->")[1]
                );
            });
        }
        let hashflag = hashflags.find(
            (h) => h.hashtag.toLowerCase() === trend.name.slice(1).toLowerCase()
        );
        let trendDiv = document.createElement("div");
        trendDiv.className = "trend" + (compact ? " compact-trend" : "");
        trendDiv.innerHTML = compact
            ? html`<a
                  href="/search?q=${escapeHTML(trend.name)}"
                  class="trend-name"
                  >${escapeHTML(trend.name)}</a
              >`
            : html`
                  <b>
                      <a
                          href="/search?q=${escapeHTML(trend.name)}"
                          class="trend-name"
                      >
                          ${escapeHTML(trend.name)}
                          ${hashflag
                              ? `<img src="${hashflag.asset_url}" class="hashflag" width="16" height="16">`
                              : ""}
                      </a> </b
                  ><br />
                  <span class="trend-description"
                      >${trend.meta_description
                          ? escapeHTML(trend.meta_description)
                          : ""}</span
                  >
              `;
        trendsContainer.append(trendDiv);
        if (vars.enableTwemoji) twemoji.parse(trendDiv);
    });
}
async function renderDiscovery(cache = true) {
    if (vars.hideWtf) return;
    let discover = await API.discover.getPeople(cache);
    let discoverContainer = document.getElementById("wtf-list");
    discoverContainer.innerHTML = "";
    try {
        let usersData = discover.globalObjects.users;
        let max = 6;
        if (innerHeight < 700) max = 5;
        if (innerHeight < 650) max = 3;
        let usersSuggestions =
            discover.timeline.instructions[0].addEntries.entries[0].content.timelineModule.items
                .map((s) => s.entryId.slice("user-".length))
                .slice(0, max); // why is it so deep
        usersSuggestions.forEach((userId) => {
            let userData = usersData[userId];
            if (!userData) return;
            if (
                vars.twitterBlueCheckmarks &&
                userData.ext &&
                userData.ext.isBlueVerified &&
                userData.ext.isBlueVerified.r &&
                userData.ext.isBlueVerified.r.ok
            ) {
                userData.verified_type = "Blue";
            }
            if (
                userData.ext &&
                userData.ext.verifiedType &&
                userData.ext.verifiedType.r &&
                userData.ext.verifiedType.r.ok
            ) {
                userData.verified_type = userData.ext.verifiedType.r.ok;
            }
            if (
                !vars.twitterBlueCheckmarks &&
                userData.verified_type === "Blue"
            ) {
                delete userData.verified_type;
                userData.verified = false;
            }
            let udiv = document.createElement("div");
            udiv.className = "wtf-user";
            udiv.dataset.userId = userId;
            udiv.innerHTML = html`
                <a class="tweet-avatar-link" href="/${userData.screen_name}"
                    ><img
                        src="${`${
                            userData.default_profile_image &&
                            vars.useOldDefaultProfileImage
                                ? chrome.runtime.getURL(
                                      `images/default_profile_images/default_profile_${
                                          Number(userData.id_str) % 7
                                      }_normal.png`
                                  )
                                : userData.profile_image_url_https
                        }`.replace("_normal", "_bigger")}"
                        alt="${escapeHTML(userData.name)}"
                        class="tweet-avatar"
                        width="48"
                        height="48"
                /></a>
                <div class="tweet-header wtf-header">
                    <a
                        class="tweet-header-info wtf-user-link"
                        href="/${userData.screen_name}"
                    >
                        <b
                            class="tweet-header-name wtf-user-name${userData.verified ||
                            userData.verified_type
                                ? " user-verified"
                                : userData.id_str === "1708130407663759360"
                                ? " user-verified user-verified-dimden"
                                : ""} ${userData.verified_type === "Government"
                                ? "user-verified-gray"
                                : userData.verified_type === "Business"
                                ? "user-verified-yellow"
                                : userData.verified_type === "Blue"
                                ? "user-verified-blue"
                                : ""}"
                            >${escapeHTML(userData.name)}</b
                        >
                        <span class="tweet-header-handle wtf-user-handle"
                            >@${userData.screen_name}</span
                        >
                    </a>
                    <br />
                    <button
                        class="nice-button discover-follow-btn ${userData.following
                            ? "following"
                            : "follow"}"
                        style="position:relative;bottom: 1px;"
                    >
                        ${userData.following
                            ? LOC.following_btn.message
                            : LOC.follow.message}
                    </button>
                </div>
            `;
            const followBtn = udiv.querySelector(".discover-follow-btn");
            followBtn.addEventListener("click", async () => {
                if (followBtn.className.includes("following")) {
                    try {
                        await API.user.unfollow(userData.screen_name);
                    } catch (e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    followBtn.classList.remove("following");
                    followBtn.classList.add("follow");
                    followBtn.innerText = LOC.follow.message;
                    userData.following = false;
                } else {
                    try {
                        await API.user.follow(userData.screen_name);
                    } catch (e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    followBtn.classList.add("following");
                    followBtn.classList.remove("follow");
                    followBtn.innerText = LOC.following_btn.message;
                    userData.following = true;
                }
                chrome.storage.local.set(
                    {
                        discoverData: {
                            date: Date.now(),
                            data: discover,
                        },
                    },
                    () => {}
                );
            });
            discoverContainer.append(udiv);
            if (vars.enableTwemoji) twemoji.parse(udiv);
        });
    } catch (e) {
        console.warn(e);
    }
}

const img_template = elNew("img", {
    crossOrigin: "anonymous",
    loading: "lazy",
    className: "tweet-media-element",
});

const animated_gif_template = elNew("video", {
    crossOrigin: "anonymous",
    loading: "lazy",
    className: "tweet-media-element tweet-media-gif",
});

const video_template = elNew("video", {
    crossOrigin: "anonymous",
    preload: "none",
    className: "tweet-media-element",
});

function renderMedia(t) {
    let _html = "";
    if (!t.extended_entities || !t.extended_entities.media) return "";

    let cws = [];

    for (let i = 0; i < t.extended_entities.media.length; i++) {
        let m = t.extended_entities.media[i];
        let toCensor = !vars.displaySensitiveContent && t.possibly_sensitive;
        if (m.sensitive_media_warning) {
            if (m.sensitive_media_warning.graphic_violence) {
                cws.push(LOC.graphic_violence.message);
                toCensor = !vars.uncensorGraphicViolenceAutomatically;
            }
            if (m.sensitive_media_warning.adult_content) {
                cws.push(LOC.adult_content.message);
                toCensor = !vars.uncensorAdultContentAutomatically;
            }
            if (m.sensitive_media_warning.other) {
                cws.push(LOC.sensitive_content.message);
                toCensor = !vars.uncensorSensitiveContentAutomatically;
            }
        }
        if (m.type === "photo") {
            let [w, h] = sizeFunctions[t.extended_entities.media.length](
                m.original_info.width,
                m.original_info.height
            );
            const newClone = img_template.cloneNode(true);
            const altText = m.ext_alt_text
                ? escapeHTML(m.ext_alt_text, true)
                : "";
            if (altText) {
                newClone.alt = newClone.title = altText;
            }
            newClone.width = w;
            newClone.height = h;
            newClone.src =
                m.media_url_https +
                (vars.showOriginalImages &&
                (m.media_url_https.endsWith(".jpg") ||
                    m.media_url_https.endsWith(".png"))
                    ? "?name=orig"
                    : window.navigator &&
                      navigator.connection &&
                      navigator.connection.type === "cellular" &&
                      !vars.disableDataSaver
                    ? "?name=small"
                    : "");
            var mediaClass = mediaClasses[t.extended_entities.media.length];
            if (mediaClass) newClone.classList.add(mediaClass);
            if (toCensor) newClone.classList.add("tweet-media-element-censor");
            _html += newClone.outerHTML;
        } else if (m.type === "animated_gif") {
            let [w, h] = sizeFunctions[t.extended_entities.media.length](
                m.original_info.width,
                m.original_info.height
            );
            let rid = m.id_str + m.media_key;

            const newClone = animated_gif_template.cloneNode(true);
            const altText = m.ext_alt_text
                ? escapeHTML(m.ext_alt_text, true)
                : "";
            if (altText) {
                newClone.alt = newClone.title = altText;
            }
            newClone.width = w;
            newClone.height = h;
            newClone.loop = true;

            newClone.defaultMuted = true;
            newClone.muted = true;
            newClone.disableRemotePlayback = true;
            if (!vars.disableGifAutoplay) newClone.autoplay = true;
            else newClone.autoplay = false;
            var mediaClass = mediaClasses[t.extended_entities.media.length];
            if (mediaClass) newClone.classList.add(mediaClass);
            if (toCensor) newClone.classList.add("tweet-media-element-censor");
            m.video_info.variants.forEach((variant) => {
                var source = document.createElement("source");
                source.src = variant.url;
                source.type = variant.content_type;
                newClone.appendChild(source);
            });
            newClone.appendChild(
                document.createTextNode(LOC.unsupported_video.message)
            );
            _html += newClone.outerHTML;
        } else if (m.type === "video") {
            if (m.mediaStats && m.mediaStats.viewCount) {
                m.ext = {
                    mediaStats: {
                        r: { ok: { viewCount: m.mediaStats.viewCount } },
                    },
                };
            }
            let [w, h] = sizeFunctions[t.extended_entities.media.length](
                m.original_info.width,
                m.original_info.height
            );
            const newClone = video_template.cloneNode(true);
            const altText = m.ext_alt_text
                ? escapeHTML(m.ext_alt_text, true)
                : "";
            if (altText) {
                newClone.alt = newClone.title = altText;
            }
            newClone.width = w;
            newClone.height = h;
            newClone.loop = true;

            newClone.disableRemotePlayback = true;
            if (vars.muteVideos) {
                newClone.defaultMuted = true;
                newClone.muted = true;
            } else {
                newClone.defaultMuted = false;
                newClone.muted = false;
            }
            var mediaClass = mediaClasses[t.extended_entities.media.length];
            if (mediaClass) newClone.classList.add(mediaClass);
            if (toCensor) newClone.classList.add("tweet-media-element-censor");
            newClone.poster = m.media_url_https;
            m.video_info.variants.forEach((variant) => {
                var source = document.createElement("source");
                source.src = variant.url;
                source.type = variant.content_type;
                newClone.appendChild(source);
            });
            newClone.appendChild(
                document.createTextNode(LOC.unsupported_video.message)
            );
            _html += newClone.outerHTML;
        }
        if (i === 1 && t.extended_entities.media.length > 3) {
            _html += "<br>";
        }
    }

    if (cws.length > 0) {
        cws = [...new Set(cws)];
        cws = LOC.content_warning.message.replace("$WARNINGS$", cws.join(", "));
        _html +=
            `<br>` +
            elNew("div", { className: "tweet-media-cws" }, [cws]).outerHTML;
    }
    return _html;
}

async function appendUser(u, container, label, usernameClass = "") {
    let userElement = document.createElement("div");
    userElement.classList.add("user-item");
    if (
        vars.twitterBlueCheckmarks &&
        u.ext &&
        u.ext.isBlueVerified &&
        u.ext.isBlueVerified.r &&
        u.ext.isBlueVerified.r.ok
    ) {
        u.verified_type = "Blue";
    }
    if (
        u.ext &&
        u.ext.verifiedType &&
        u.ext.verifiedType.r &&
        u.ext.verifiedType.r.ok
    ) {
        u.verified_type = u.ext.verifiedType.r.ok;
    }
    if (!vars.twitterBlueCheckmarks && u.verified_type === "Blue") {
        delete u.verified_type;
        u.verified = false;
    }
    userElement.innerHTML = html`
        <div${vars.extensionCompatibilityMode ? ' data-testid="UserCell"' : ""}>
            ${
                vars.extensionCompatibilityMode
                    ? `<a href="/${
                          u.screen_name
                      }" style="display: none;"></a><a style="display: none;">${escapeHTML(
                          u.name
                      )}</a>`
                    : ""
            }
            <a href="/${u.screen_name}" class="user-item-link">
                <img src="${
                    u.default_profile_image && vars.useOldDefaultProfileImage
                        ? chrome.runtime.getURL(
                              `images/default_profile_images/default_profile_${
                                  Number(u.id_str) % 7
                              }_normal.png`
                          )
                        : u.profile_image_url_https
                }" alt="${
        u.screen_name
    }" class="user-item-avatar tweet-avatar" width="48" height="48">
                <div class="user-item-text">
                    <span${
                        u.id_str === "1708130407663759360"
                            ? ' title="Old Twitter Layout extension developer"'
                            : ""
                    } class="tweet-header-name user-item-name ${usernameClass} ${
        u.protected ? " user-protected" : ""
    }${u.muting ? " user-muted" : ""}${
        u.verified || u.verified_type
            ? " user-verified"
            : u.id_str === "1708130407663759360"
            ? " user-verified user-verified-dimden"
            : ""
    } ${
        u.verified_type === "Government"
            ? "user-verified-gray"
            : u.verified_type === "Business"
            ? "user-verified-yellow"
            : u.verified_type === "Blue"
            ? "user-verified-blue"
            : ""
    }">${escapeHTML(u.name)}</span><br>
                    <span class="tweet-header-handle">@${u.screen_name}</span>
                    ${
                        u.followed_by
                            ? `<span class="follows-you-label">${LOC.follows_you.message}</span>`
                            : ""
                    }
                    ${
                        label
                            ? `<br><span class="user-item-additional">${escapeHTML(
                                  label
                              )}</span>`
                            : ""
                    }
                </div>
            </a>
        </div>
        <div${u.id_str === user.id_str ? " hidden" : ""}>
    <button class="user-item-btn nice-button ${
        u.blocking ? "blocked" : u.following ? "following" : "follow"
    }">
        ${
            u.blocking
                ? LOC.blocked.message
                : u.following
                ? LOC.following_btn.message
                : LOC.follow.message
        }
    </button>
</div>
    `;

    let followButton = userElement.querySelector(".user-item-btn");
    followButton.addEventListener("click", async () => {
        if (followButton.classList.contains("following")) {
            try {
                await API.user.unfollow(u.screen_name);
            } catch (e) {
                console.error(e);
                alert(e);
                return;
            }
            followButton.classList.remove("following");
            followButton.classList.add("follow");
            followButton.innerText = LOC.follow.message;
        } else {
            try {
                await API.user.follow(u.screen_name);
            } catch (e) {
                console.error(e);
                alert(e);
                return;
            }
            followButton.classList.remove("follow");
            followButton.classList.add("following");
            followButton.innerText = LOC.following_btn.message;
        }
    });

    container.appendChild(userElement);
    if (vars.enableTwemoji) twemoji.parse(userElement);
}
let lastTweetErrorDate = 0;
const mediaClasses = [
    undefined,
    "tweet-media-element-one",
    "tweet-media-element-two",
    "tweet-media-element-three",
    "tweet-media-element-two",
];

function calculateSize(x, y, max_x, max_y) {
    let ratio = x / y;
    let iw = innerWidth;
    if (iw < 590) max_x = iw - 120;
    if (x > max_x) {
        x = max_x;
        y = x / ratio;
    }
    if (y > max_y) {
        y = max_y;
        x = y * ratio;
    }
    return [parseInt(x), parseInt(y)];
}

const sizeFunctions = [
    undefined,
    (w, h) => calculateSize(w, h, 450, 500),
    (w, h) => calculateSize(w, h, 225, 400),
    (w, h) =>
        innerWidth < 590
            ? calculateSize(w, h, 225, 400)
            : calculateSize(w, h, 150, 250),
    (w, h) => calculateSize(w, h, 225, 400),
    (w, h) => calculateSize(w, h, 225, 400),
    (w, h) => calculateSize(w, h, 225, 400),
    (w, h) => calculateSize(w, h, 225, 400),
    (w, h) => calculateSize(w, h, 225, 400),
    (w, h) => calculateSize(w, h, 225, 400),
    (w, h) => calculateSize(w, h, 225, 400),
];

const quoteSizeFunctions = [
    undefined,
    (w, h) => calculateSize(w, h, 400, 400),
    (w, h) => calculateSize(w, h, 200, 400),
    (w, h) => calculateSize(w, h, 125, 200),
    (w, h) => calculateSize(w, h, 100, 150),
    (w, h) => calculateSize(w, h, 100, 150),
    (w, h) => calculateSize(w, h, 100, 150),
    (w, h) => calculateSize(w, h, 100, 150),
    (w, h) => calculateSize(w, h, 100, 150),
    (w, h) => calculateSize(w, h, 100, 150),
    (w, h) => calculateSize(w, h, 100, 150),
];
async function appendTweet(t, timelineContainer, options = {}) {
    if (typeof t !== "object") {
        console.error("Tweet is undefined", t, timelineContainer, options);
        return;
    }
    if (typeof t.user !== "object") {
        console.error("Tweet user is undefined", t, timelineContainer, options);
        return;
    }
    try {
        if (typeof seenReplies !== "undefined" && !options.ignoreSeen) {
            if (seenReplies.includes(t.id_str)) return;
            seenReplies.push(t.id_str);
        }
        if (typeof seenThreads !== "undefined" && !options.ignoreSeen) {
            if (seenThreads.includes(t.id_str)) return;
        }
        if (t.socialContext) {
            options.top = {};
            if (t.socialContext.contextType === "Like") {
                if (!vars.heartsNotStars) {
                    LOC.replacer_liked_to_favorited.message
                        .split("|")
                        .forEach((el) => {
                            t.socialContext.text = t.socialContext.text.replace(
                                new RegExp(el.split("->")[0], "g"),
                                el.split("->")[1]
                            );
                        });
                }
                options.top.text = `<${
                    t.socialContext.landingUrl.url.split("=")[1]
                        ? `a href="/i/user/${
                              t.socialContext.landingUrl.url.split("=")[1]
                          }"`
                        : "span"
                }>${t.socialContext.text}</a>`;
                if (vars.heartsNotStars) {
                    options.top.icon = "\uf015";
                    options.top.color = "rgb(249, 24, 128)";
                } else {
                    options.top.icon = "\uf001";
                    options.top.color = "#ffac33";
                }
            } else if (t.socialContext.contextType === "Follow") {
                options.top.text = t.socialContext.text;
                options.top.icon = "\uf002";
                options.top.color = isDarkModeEnabled ? "#7e5eff" : "#3300FF";
            } else if (t.socialContext.contextType === "Conversation") {
                options.top.text = t.socialContext.text;
                options.top.icon = "\uf005";
                options.top.color = isDarkModeEnabled ? "#7e5eff" : "#3300FF";
            } else if (t.socialContext.contextType === "Sparkle") {
                options.top.text = t.socialContext.text;
                options.top.icon = "\uf011";
                options.top.color = isDarkModeEnabled ? "#7e5eff" : "#3300FF";
            } else if (t.socialContext.topic_id) {
                options.top.text = `<a target="_blank" href="/i/topics/${t.socialContext.topic_id}">${t.socialContext.name}</a>`;
                options.top.icon = "\uf008";
                options.top.color = isDarkModeEnabled ? "#7e5eff" : "#3300FF";
            } else {
                options.top = null; //otherwise, undefined values in options.top
                console.log(t.socialContext);
            }
        }

        // verification
        if (t.user.ext_verified_type) {
            t.user.verified_type = t.user.ext_verified_type;
            t.user.verified = true;
        }
        if (
            vars.twitterBlueCheckmarks &&
            t.user.ext &&
            t.user.ext.isBlueVerified &&
            t.user.ext.isBlueVerified.r &&
            t.user.ext.isBlueVerified.r.ok
        ) {
            t.user.verified_type = "Blue";
            t.user.verified = true;
        }
        if (
            t.user &&
            t.user.ext &&
            t.user.ext.verifiedType &&
            t.user.ext.verifiedType.r &&
            t.user.ext.verifiedType.r.ok
        ) {
            t.user.verified_type = t.user.ext.verifiedType.r.ok;
            t.user.verified = true;
        }
        if (!vars.twitterBlueCheckmarks && t.user.verified_type === "Blue") {
            delete t.user.verified_type;
            t.user.verified = false;
        }
        if (
            !vars.twitterBlueCheckmarks &&
            t.quoted_status &&
            t.quoted_status.user.verified_type === "Blue"
        ) {
            delete t.quoted_status.user.verified_type;
            t.quoted_status.user.verified = false;
        }
        if (t.quoted_status) {
            if (
                t.quoted_status.user.verified_type === "Blue" &&
                !vars.twitterBlueCheckmarks
            ) {
                delete t.quoted_status.user.verified_type;
                t.quoted_status.user.verified = false;
            }
        }

        if (typeof tweets !== "undefined") tweets.push(["tweet", t, options]);
        const tweet = document.createElement("div");
        tweet.tweet = t;
        t.element = tweet;
        t.options = options;

        if (
            !options.mainTweet &&
            typeof mainTweetLikers !== "undefined" &&
            !location.pathname.includes("retweets/with_comments") &&
            !document.querySelector(".modal")
        ) {
            tweet.addEventListener("click", async (e) => {
                if (
                    !e.target.closest(".tweet-button") &&
                    !e.target.closest(".tweet-body-text-span") &&
                    !e.target.closest(".tweet-edit-section") &&
                    !e.target.closest(".dropdown-menu") &&
                    !e.target.closest(".tweet-media-element") &&
                    !e.target.closest("a") &&
                    !e.target.closest("button")
                ) {
                    document.getElementById("loading-box").hidden = false;
                    savePageData();
                    history.pushState(
                        {},
                        null,
                        `/${t.user.screen_name}/status/${t.id_str}`
                    );
                    updateSubpage();
                    mediaToUpload = [];
                    linkColors = {};
                    cursor = undefined;
                    seenReplies = [];
                    mainTweetLikers = [];
                    let restored = await restorePageData();
                    let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                    if (subpage === "tweet" && !restored) {
                        updateReplies(id);
                    } else if (subpage === "likes") {
                        updateLikes(id);
                    } else if (subpage === "retweets") {
                        updateRetweets(id);
                    } else if (subpage === "retweets_with_comments") {
                        updateRetweetsWithComments(id);
                    }
                    renderDiscovery();
                    renderTrends();
                    currentLocation = location.pathname;
                }
            });
        } else {
            if (!options.mainTweet) {
                tweet.addEventListener("click", (e) => {
                    if (
                        !e.target.closest(".tweet-button") &&
                        !e.target.closest(".tweet-body-text-span") &&
                        !e.target.closest(".tweet-edit-section") &&
                        !e.target.closest(".dropdown-menu") &&
                        !e.target.closest(".tweet-media-element") &&
                        !e.target.closest("a") &&
                        !e.target.closest("button")
                    ) {
                        let tweetData = t;
                        if (tweetData.retweeted_status)
                            tweetData = tweetData.retweeted_status;
                        tweet.classList.add("tweet-preload");
                        let selection = window.getSelection();
                        if (
                            selection.toString().length > 0 &&
                            selection.focusNode &&
                            selection.focusNode.closest(
                                `div.tweet[data-tweet-id="${tweetData.id_str}"]`
                            )
                        ) {
                            return;
                        }
                        new TweetViewer(user, tweetData);
                    }
                });
            }
        }
        tweet.addEventListener("mousedown", (e) => {
            if (e.button === 1) {
                // tweet-media-element is clickable, since it should open the tweet in a new tab.
                if (
                    !e.target.closest(".tweet-button") &&
                    !e.target.closest(".tweet-edit-section") &&
                    !e.target.closest(".dropdown-menu") &&
                    !e.target.closest("a") &&
                    !e.target.closest("button")
                ) {
                    e.preventDefault();
                    openInNewTab(`/${t.user.screen_name}/status/${t.id_str}`);
                }
            }
        });
        tweet.tabIndex = -1;
        tweet.className = `tweet ${
            options.mainTweet
                ? "tweet-main"
                : location.pathname.includes("/status/")
                ? "tweet-replying"
                : ""
        }`.trim();
        tweet.dataset.tweetId = t.id_str;
        tweet.dataset.userId = t.user.id_str;
        try {
            if (!activeTweet) {
                tweet.classList.add("tweet-active");
                activeTweet = tweet;
            }
        } catch (e) {}

        if (t.nonReply) {
            tweet.classList.add("tweet-non-reply");
        }

        if (t.threadContinuation) {
            options.threadContinuation = true;
        }
        if (t.noTop) {
            options.noTop = true;
        }
        if (options.threadContinuation)
            tweet.classList.add("tweet-self-thread-continuation");
        if (options.selfThreadContinuation)
            tweet.classList.add("tweet-self-thread-continuation");

        if (options.noTop) tweet.classList.add("tweet-no-top");
        if (vars.slowLinkColorsInTL && typeof linkColors !== "undefined") {
            if (linkColors[t.user.id_str]) {
                let sc = makeSeeableColor(linkColors[t.user.id_str]);
                tweet.style.setProperty("--link-color", sc);
                if (vars.alwaysShowLinkColor) tweet.classList.add("colour");
            } else {
                if (
                    t.user.profile_link_color &&
                    t.user.profile_link_color !== "1DA1F2"
                ) {
                    let sc = makeSeeableColor(t.user.profile_link_color);
                    tweet.style.setProperty("--link-color", sc);
                    if (vars.alwaysShowLinkColor) tweet.classList.add("colour");
                }
            }
        }
        let full_text = t.full_text ? t.full_text : "";
        let tweetLanguage = t.lang; // originally i used i18n api to detect languages simply because i didn't know of t.lang existence
        if (!tweetLanguage) {
            tweetLanguage = "und";
        }
        if (tweetLanguage.includes("-")) {
            let [lang, country] = tweetLanguage.split("-");
            tweetLanguage = `${lang}_${country.toUpperCase()}`;
        }
        let isMatchingLanguage = languageMatches(t.lang);
        let isQuoteMatchingLanguage =
            !!t.quoted_status && languageMatches(t.quoted_status.lang);
        let videos =
            t.extended_entities &&
            t.extended_entities.media &&
            t.extended_entities.media.filter((m) => m.type === "video");
        if (!videos || videos.length === 0) {
            videos = undefined;
        }
        if (videos) {
            for (let v of videos) {
                if (!v.video_info) continue;
                v.video_info.variants = v.video_info.variants.sort((a, b) => {
                    if (!b.bitrate) return -1;
                    return b.bitrate - a.bitrate;
                });
                if (typeof vars.savePreferredQuality !== "boolean") {
                    chrome.storage.sync.set(
                        {
                            savePreferredQuality: true,
                        },
                        () => {}
                    );
                    vars.savePreferredQuality = true;
                }
                if (
                    localStorage.preferredQuality &&
                    vars.savePreferredQuality
                ) {
                    let closestQuality = v.video_info.variants
                        .filter((v) => v.bitrate)
                        .reduce((prev, curr) => {
                            return Math.abs(
                                parseInt(curr.url.match(/\/(\d+)x/)[1]) -
                                    parseInt(localStorage.preferredQuality)
                            ) <
                                Math.abs(
                                    parseInt(prev.url.match(/\/(\d+)x/)[1]) -
                                        parseInt(localStorage.preferredQuality)
                                )
                                ? curr
                                : prev;
                        });
                    let preferredQualityVariantIndex =
                        v.video_info.variants.findIndex(
                            (v) => v.url === closestQuality.url
                        );
                    if (preferredQualityVariantIndex !== -1) {
                        let preferredQualityVariant =
                            v.video_info.variants[preferredQualityVariantIndex];
                        v.video_info.variants.splice(
                            preferredQualityVariantIndex,
                            1
                        );
                        v.video_info.variants.unshift(preferredQualityVariant);
                    }
                } else if (
                    window.navigator &&
                    navigator.connection &&
                    navigator.connection.type === "cellular" &&
                    !vars.disableDataSaver
                ) {
                    let lowestQuality = v.video_info.variants
                        .filter((v) => v.bitrate)
                        .reduce((prev, curr) => {
                            return parseInt(curr.bitrate) <
                                parseInt(prev.bitrate)
                                ? curr
                                : prev;
                        });
                    let lowestQualityVariantIndex =
                        v.video_info.variants.findIndex(
                            (v) => v.url === lowestQuality.url
                        );
                    if (lowestQualityVariantIndex !== -1) {
                        let lowestQualityVariant =
                            v.video_info.variants[lowestQualityVariantIndex];
                        v.video_info.variants.splice(
                            lowestQualityVariantIndex,
                            1
                        );
                        v.video_info.variants.unshift(lowestQualityVariant);
                    }
                }
            }
        }
        if (full_text.includes("Learn more")) {
            console.log(t);
        }
        if (
            t.withheld_in_countries &&
            (t.withheld_in_countries.includes("XX") ||
                t.withheld_in_countries.includes("XY"))
        ) {
            full_text = "";
        }
        if (!t.quoted_status) {
            //t.quoted_status is undefined if the user blocked the quoter (this also applies to deleted/private tweets too, but it just results in original behavior then)
            try {
                if (
                    t.quoted_status_result &&
                    t.quoted_status_result.result.tweet
                ) {
                    t.quoted_status =
                        t.quoted_status_result.result.tweet.legacy;
                    t.quoted_status.user =
                        t.quoted_status_result.result.tweet.core.user_results.result.legacy;
                } /* else if(t.quoted_status_id_str) {
                    t.quoted_status = await API.tweet.getV2(t.quoted_status_id_str);
                    console.log(t.quoted_status);
                }*/
            } catch {
                t.quoted_status = undefined;
            }
        }
        let followUserText, unfollowUserText, blockUserText, unblockUserText;
        let mentionedUserArray = [];
        let _newQuoteMentionedUserText = [];
        let quoteMentionedUserText = ``;
        if (
            LOC.follow_user.message.includes("$SCREEN_NAME$") &&
            LOC.unfollow_user.message.includes("$SCREEN_NAME$") &&
            LOC.block_user.message.includes("$SCREEN_NAME$") &&
            LOC.unblock_user.message.includes("$SCREEN_NAME$")
        ) {
            followUserText = `${LOC.follow_user.message.replace(
                "$SCREEN_NAME$",
                t.user.screen_name
            )}`;
            unfollowUserText = `${LOC.unfollow_user.message.replace(
                "$SCREEN_NAME$",
                t.user.screen_name
            )}`;
            blockUserText = `${LOC.block_user.message.replace(
                "$SCREEN_NAME$",
                t.user.screen_name
            )}`;
            unblockUserText = `${LOC.unblock_user.message.replace(
                "$SCREEN_NAME$",
                t.user.screen_name
            )}`;
        } else {
            followUserText = `${LOC.follow_user.message} @${t.user.screen_name}`;
            unfollowUserText = `${LOC.unfollow_user.message} @${t.user.screen_name}`;
            blockUserText = `${LOC.block_user.message} @${t.user.screen_name}`;
            unblockUserText = `${LOC.unblock_user.message} @${t.user.screen_name}`;
        }
        if (t.in_reply_to_screen_name && t.display_text_range) {
            t.entities.user_mentions.forEach((user_mention) => {
                if (user_mention.indices[0] < t.display_text_range[0]) {
                    mentionedUserArray.push(
                        elNew("a", { href: `/${user_mention.screen_name}` }, [
                            `@${user_mention.screen_name}`,
                        ])
                    );
                }
            });
        }
        if (
            t.quoted_status &&
            t.quoted_status.in_reply_to_screen_name &&
            t.display_text_range
        ) {
            t.quoted_status.entities.user_mentions.forEach((user_mention) => {
                if (user_mention.indices[0] < t.display_text_range[0]) {
                    _newQuoteMentionedUserText.push(
                        `@${user_mention.screen_name}`
                    );
                    // quoteMentionedUserText += `@${user_mention.screen_name}`;
                }
            });
        }
        // construct the markup for the tweet.
        const [topNodes, actualContent] = await constructTweet(
            t,
            {
                videos: videos,
                isMatchingLanguage: isMatchingLanguage,
                mentionedUserTextArray: mentionedUserArray,
                full_text: full_text,
                isQuoteMatchingLanguage: isQuoteMatchingLanguage,
                newQuoteMentionedUserText: _newQuoteMentionedUserText,
                // quoteMentionedUserText: quoteMentionedUserText,
                followUserText: followUserText,
                unfollowUserText: unfollowUserText,
                blockUserText: blockUserText,
                unblockUserText: unblockUserText,
            },
            options
        );
        // XXX: Seems ugly!
        Array(...topNodes).forEach((m) => {
            tweet.appendChild(m);
        });
        var tweetClasses = ["tweet-body"];
        if (options.mainTweet) tweetClasses.push("tweet-body-main");
        tweet.appendChild(
            elNew("article", { class: tweetClasses }, actualContent)
        );

        // tweet.innerHTML = `
        //         ${topNodes}
        //         <article class="tweet-body ${
        //           options.mainTweet ? "tweet-body-main" : ""
        //         }">
        //             ${actualContent}
        //         </article>
        //     `;
        // gifs
        let gifs = Array.from(
            tweet.querySelectorAll(
                ".tweet-media-gif, .tweet-media-element-quote-gif"
            )
        );
        if (gifs.length) {
            gifs.forEach((gif) => {
                gif.addEventListener("click", () => {
                    if (gif.paused) gif.play();
                    else gif.pause();
                });
            });
        }
        // video
        let vidOverlay = tweet.getElementsByClassName(
            "tweet-media-video-overlay"
        )[0];
        if (vidOverlay) {
            vidOverlay.addEventListener("click", async () => {
                let vid = Array.from(
                    tweet.getElementsByClassName("tweet-media")[0].children
                ).filter((e) => e.tagName === "VIDEO")[0];
                try {
                    let res = await fetch(vid.currentSrc); // weird problem with vids breaking cuz twitter sometimes doesnt send content-length
                    if (!res.headers.get("content-length")) await sleep(1000);
                } catch (e) {
                    console.error(e);
                }
                vid.play();
                vid.controls = true;
                vid.classList.remove("tweet-media-element-censor");
                vidOverlay.style.display = "none";
            });
        }
        if (videos) {
            let videoErrors = 0;
            let vids = Array.from(
                tweet.getElementsByClassName("tweet-media")[0].children
            ).filter((e) => e.tagName === "VIDEO");
            vids[0].addEventListener("error", () => {
                if (videoErrors >= 3) return;
                videoErrors++;
                setTimeout(() => {
                    vids[0].load();
                }, 25);
            });
            vids[0].onloadstart = () => {
                let src = vids[0].currentSrc;
                Array.from(
                    tweet.getElementsByClassName("tweet-video-quality")
                ).forEach((el) => {
                    if (el.dataset.url === src)
                        el.classList.add("tweet-video-quality-current");
                });
                tweet
                    .getElementsByClassName("tweet-video-reload")[0]
                    .addEventListener("click", () => {
                        let vid = Array.from(
                            tweet.getElementsByClassName("tweet-media")[0]
                                .children
                        ).filter((e) => e.tagName === "VIDEO")[0];
                        let time = vid.currentTime;
                        let paused = vid.paused;
                        vid.load();
                        vid.onloadstart = () => {
                            let src = vid.currentSrc;
                            vid.currentTime = time;
                            if (!paused) vid.play();
                            Array.from(
                                tweet.getElementsByClassName(
                                    "tweet-video-quality"
                                )
                            ).forEach((el) => {
                                if (el.dataset.url === src)
                                    el.classList.add(
                                        "tweet-video-quality-current"
                                    );
                                else
                                    el.classList.remove(
                                        "tweet-video-quality-current"
                                    );
                            });
                        };
                    });
                Array.from(
                    tweet.getElementsByClassName("tweet-video-quality")
                ).forEach((el) =>
                    el.addEventListener("click", () => {
                        console.log("Reshuffling", el);
                        if (
                            el.className.includes("tweet-video-quality-current")
                        )
                            return;
                        localStorage.preferredQuality = parseInt(el.innerText);
                        let vid = Array.from(
                            tweet.getElementsByClassName("tweet-media")[0]
                                .children
                        ).filter((e) => e.tagName === "VIDEO")[0];
                        let time = vid.currentTime;
                        let paused = vid.paused;
                        for (let v of videos) {
                            let closestQuality = v.video_info.variants
                                .filter((v) => v.bitrate)
                                .reduce((prev, curr) => {
                                    return Math.abs(
                                        parseInt(
                                            curr.url.match(/\/(\d+)x/)[1]
                                        ) -
                                            parseInt(
                                                localStorage.preferredQuality
                                            )
                                    ) <
                                        Math.abs(
                                            parseInt(
                                                prev.url.match(/\/(\d+)x/)[1]
                                            ) -
                                                parseInt(
                                                    localStorage.preferredQuality
                                                )
                                        )
                                        ? curr
                                        : prev;
                                });
                            let preferredQualityVariantIndex =
                                v.video_info.variants.findIndex(
                                    (v) => v.url === closestQuality.url
                                );
                            if (preferredQualityVariantIndex !== -1) {
                                let preferredQualityVariant =
                                    v.video_info.variants[
                                        preferredQualityVariantIndex
                                    ];
                                v.video_info.variants.splice(
                                    preferredQualityVariantIndex,
                                    1
                                );
                                v.video_info.variants.unshift(
                                    preferredQualityVariant
                                );
                            }
                        }
                        tweet.getElementsByClassName(
                            "tweet-media"
                        )[0].innerHTML = html`
                            ${t.extended_entities.media
                                .map(
                                    (m) =>
                                        `<${
                                            m.type === "photo" ? "img" : "video"
                                        } ${
                                            m.ext_alt_text
                                                ? `alt="${escapeHTML(
                                                      m.ext_alt_text,
                                                      true
                                                  )}" title="${escapeHTML(
                                                      m.ext_alt_text,
                                                      true
                                                  )}"`
                                                : ""
                                        } crossorigin="anonymous" width="${
                                            sizeFunctions[
                                                t.extended_entities.media.length
                                            ](
                                                m.original_info.width,
                                                m.original_info.height
                                            )[0]
                                        }" height="${
                                            sizeFunctions[
                                                t.extended_entities.media.length
                                            ](
                                                m.original_info.width,
                                                m.original_info.height
                                            )[1]
                                        }" loading="lazy" ${
                                            m.type === "video" ? "controls" : ""
                                        } ${
                                            m.type === "animated_gif"
                                                ? 'loop muted onclick="if(this.paused) this.play(); else this.pause()"'
                                                : ""
                                        }${
                                            m.type === "animated_gif" &&
                                            !vars.disableGifAutoplay
                                                ? " autoplay"
                                                : ""
                                        } ${
                                            m.type === "photo"
                                                ? `src="${m.media_url_https}"`
                                                : ""
                                        } class="tweet-media-element ${
                                            mediaClasses[
                                                t.extended_entities.media.length
                                            ]
                                        } ${
                                            !vars.displaySensitiveContent &&
                                            t.possibly_sensitive
                                                ? "tweet-media-element-censor"
                                                : ""
                                        }">${
                                            m.type === "video" ||
                                            m.type === "animated_gif"
                                                ? `
                            ${m.video_info.variants
                                .map(
                                    (v) =>
                                        `<source src="${v.url}" type="${v.content_type}">`
                                )
                                .join("\n")}
                            ${LOC.unsupported_video.message}
                        </video>`
                                                : ""
                                        }`
                                )
                                .join("\n")}
                        `;
                        vid = Array.from(
                            tweet.getElementsByClassName("tweet-media")[0]
                                .children
                        ).filter((e) => e.tagName === "VIDEO")[0];
                        vid.onloadstart = () => {
                            let src = vid.currentSrc;
                            vid.currentTime = time;
                            if (!paused) vid.play();
                            Array.from(
                                tweet.getElementsByClassName(
                                    "tweet-video-quality"
                                )
                            ).forEach((el) => {
                                if (el.dataset.url === src)
                                    el.classList.add(
                                        "tweet-video-quality-current"
                                    );
                                else
                                    el.classList.remove(
                                        "tweet-video-quality-current"
                                    );
                            });
                        };
                        vid.addEventListener("mousedown", (e) => {
                            if (e.button === 1) {
                                e.preventDefault();
                                window.open(vid.currentSrc, "_blank");
                            }
                        });
                    })
                );
            };
            for (let vid of vids) {
                if (!vars.muteVideos && typeof vars.volume === "number") {
                    vid.volume = vars.volume;
                }
                vid.onvolumechange = () => {
                    chrome.storage.sync.set(
                        {
                            volume: vid.volume,
                        },
                        () => {}
                    );
                    if (vars.muteVideos) return;
                    let allVids = document.getElementsByTagName("video");
                    for (let i = 0; i < allVids.length; i++) {
                        allVids[i].volume = vid.volume;
                    }
                };
                vid.addEventListener("mousedown", (e) => {
                    if (e.button === 1) {
                        e.preventDefault();
                        window.open(vid.currentSrc, "_blank");
                    }
                });
            }
        }

        let footerFavorites = tweet.getElementsByClassName(
            "tweet-footer-favorites"
        )[0];
        if (t.card) {
            generateCard(t, tweet, user);
        }
        if (options.top) {
            tweet.querySelector(".tweet-top").hidden = false;
            const icon = document.createElement("span");
            icon.innerText = options.top.icon;
            icon.classList.add("tweet-top-icon");
            icon.style.color = options.top.color;

            const span = document.createElement("span");
            span.classList.add("tweet-top-text");
            span.innerHTML = options.top.text;
            if (options.top.class) {
                span.classList.add(options.top.class);
                tweet.classList.add(`tweet-top-${options.top.class}`);
            }
            tweet.querySelector(".tweet-top").append(icon, span);
        }
        if (options.mainTweet) {
            let likers =
                vars.showQuoteCount &&
                typeof t.quote_count !== "undefined" &&
                t.quote_count > 0
                    ? mainTweetLikers.slice(0, 6)
                    : mainTweetLikers.slice(0, 8);
            for (let i in likers) {
                let liker = likers[i];
                let a = document.createElement("a");
                a.href = `/${liker.screen_name}`;
                let likerImg = document.createElement("img");
                likerImg.src = `${
                    liker.default_profile_image &&
                    vars.useOldDefaultProfileImage
                        ? chrome.runtime.getURL(
                              `images/default_profile_images/default_profile_${
                                  Number(liker.id_str) % 7
                              }_normal.png`
                          )
                        : liker.profile_image_url_https
                }`;
                likerImg.classList.add("tweet-footer-favorites-img");
                likerImg.title = liker.name + " (@" + liker.screen_name + ")";
                likerImg.width = 24;
                likerImg.height = 24;
                a.dataset.id = liker.id_str;
                a.appendChild(likerImg);
                footerFavorites.appendChild(a);
            }
            let likesLink = tweet.getElementsByClassName(
                "tweet-footer-stat-f"
            )[0];
            likesLink.addEventListener("click", (e) => {
                e.preventDefault();
                document.getElementById("loading-box").hidden = false;
                history.pushState(
                    {},
                    null,
                    `/${t.user.screen_name}/status/${t.id_str}/likes`
                );
                updateSubpage();
                mediaToUpload = [];
                linkColors = {};
                cursor = undefined;
                seenReplies = [];
                mainTweetLikers = [];
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                updateLikes(id);
                renderDiscovery();
                renderTrends();
                currentLocation = location.pathname;
            });
            let retweetsLink = tweet.getElementsByClassName(
                "tweet-footer-stat-r"
            )[0];
            retweetsLink.addEventListener("click", (e) => {
                e.preventDefault();
                document.getElementById("loading-box").hidden = false;
                history.pushState(
                    {},
                    null,
                    `/${t.user.screen_name}/status/${t.id_str}/retweets`
                );
                updateSubpage();
                mediaToUpload = [];
                linkColors = {};
                cursor = undefined;
                seenReplies = [];
                mainTweetLikers = [];
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                updateRetweets(id);
                renderDiscovery();
                renderTrends();
                currentLocation = location.pathname;
            });
            if (
                vars.showQuoteCount &&
                typeof t.quote_count !== "undefined" &&
                t.quote_count > 0
            ) {
                let quotesLink = tweet.getElementsByClassName(
                    "tweet-footer-stat-q"
                )[0];
                quotesLink.addEventListener("click", (e) => {
                    e.preventDefault();
                    document.getElementById("loading-box").hidden = false;
                    history.pushState(
                        {},
                        null,
                        `/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments`
                    );
                    updateSubpage();
                    mediaToUpload = [];
                    linkColors = {};
                    cursor = undefined;
                    seenReplies = [];
                    mainTweetLikers = [];
                    let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                    updateRetweetsWithComments(id);
                    renderDiscovery();
                    renderTrends();
                    currentLocation = location.pathname;
                });
            }
            let repliesLink = tweet.getElementsByClassName(
                "tweet-footer-stat-o"
            )[0];
            repliesLink.addEventListener("click", (e) => {
                e.preventDefault();
                if (
                    location.href ===
                    `/${t.user.screen_name}/status/${t.id_str}`
                )
                    return;
                document.getElementById("loading-box").hidden = false;
                history.pushState(
                    {},
                    null,
                    `/${t.user.screen_name}/status/${t.id_str}`
                );
                updateSubpage();
                mediaToUpload = [];
                linkColors = {};
                cursor = undefined;
                seenReplies = [];
                mainTweetLikers = [];
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                updateReplies(id);
                renderDiscovery();
                renderTrends();
                currentLocation = location.pathname;
            });
        }
        if (options.mainTweet && t.user.id_str !== user.id_str) {
            const tweetFollow = tweet.getElementsByClassName(
                "tweet-header-follow"
            )[0];
            tweetFollow.addEventListener("click", async () => {
                if (t.user.following) {
                    try {
                        await API.user.unfollow(t.user.screen_name);
                    } catch (e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    tweetFollow.innerText = LOC.follow.message;
                    tweetFollow.classList.remove("following");
                    tweetFollow.classList.add("follow");
                    t.user.following = false;
                } else {
                    try {
                        await API.user.follow(t.user.screen_name);
                    } catch (e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    tweetFollow.innerText = LOC.unfollow.message;
                    tweetFollow.classList.remove("follow");
                    tweetFollow.classList.add("following");
                    t.user.following = true;
                }
            });
        }
        const tweetBody = tweet.getElementsByClassName("tweet-body")[0];
        const tweetBodyText =
            tweet.getElementsByClassName("tweet-body-text")[0];
        const tweetTranslate =
            tweet.getElementsByClassName("tweet-translate")[0];
        const tweetTranslateAfter = tweet.getElementsByClassName(
            "tweet-translate-after"
        )[0];
        const tweetQuoteTranslate = tweet.getElementsByClassName(
            "tweet-quote-translate"
        )[0];
        const tweetBodyQuote =
            tweet.getElementsByClassName("tweet-body-quote")[0];
        const tweetMediaQuote =
            tweet.getElementsByClassName("tweet-media-quote")[0];
        const tweetBodyQuoteText = tweet.getElementsByClassName(
            "tweet-body-text-quote"
        )[0];
        const tweetDeleteBookmark = tweet.getElementsByClassName(
            "tweet-delete-bookmark"
        )[0];

        const tweetReplyCancel =
            tweet.getElementsByClassName("tweet-reply-cancel")[0];
        const tweetReplyUpload =
            tweet.getElementsByClassName("tweet-reply-upload")[0];
        const tweetReplyAddEmoji = tweet.getElementsByClassName(
            "tweet-reply-add-emoji"
        )[0];
        const tweetReply = tweet.getElementsByClassName("tweet-reply")[0];
        const tweetReplyButton =
            tweet.getElementsByClassName("tweet-reply-button")[0];
        const tweetReplyError =
            tweet.getElementsByClassName("tweet-reply-error")[0];
        const tweetReplyText =
            tweet.getElementsByClassName("tweet-reply-text")[0];
        const tweetReplyChar =
            tweet.getElementsByClassName("tweet-reply-char")[0];
        const tweetReplyMedia =
            tweet.getElementsByClassName("tweet-reply-media")[0];

        const tweetInteract = tweet.getElementsByClassName("tweet-interact")[0];
        const tweetInteractReply = tweet.getElementsByClassName(
            "tweet-interact-reply"
        )[0];
        const tweetInteractRetweet = tweet.getElementsByClassName(
            "tweet-interact-retweet"
        )[0];
        const tweetInteractFavorite = tweet.getElementsByClassName(
            "tweet-interact-favorite"
        )[0];
        const tweetInteractBookmark = tweet.getElementsByClassName(
            "tweet-interact-bookmark"
        )[0];
        const tweetInteractMore = tweet.getElementsByClassName(
            "tweet-interact-more"
        )[0];

        const tweetFooter = tweet.getElementsByClassName("tweet-footer")[0];
        const tweetFooterReplies = tweet.getElementsByClassName(
            "tweet-footer-stat-replies"
        )[0];
        const tweetFooterRetweets = tweet.getElementsByClassName(
            "tweet-footer-stat-retweets"
        )[0];
        const tweetFooterFavorites = tweet.getElementsByClassName(
            "tweet-footer-stat-favorites"
        )[0];

        const tweetQuote = tweet.getElementsByClassName("tweet-quote")[0];
        const tweetQuoteCancel =
            tweet.getElementsByClassName("tweet-quote-cancel")[0];
        const tweetQuoteUpload =
            tweet.getElementsByClassName("tweet-quote-upload")[0];
        const tweetQuoteAddEmoji = tweet.getElementsByClassName(
            "tweet-quote-add-emoji"
        )[0];
        const tweetQuoteButton =
            tweet.getElementsByClassName("tweet-quote-button")[0];
        const tweetQuoteError =
            tweet.getElementsByClassName("tweet-quote-error")[0];
        const tweetQuoteText =
            tweet.getElementsByClassName("tweet-quote-text")[0];
        const tweetQuoteChar =
            tweet.getElementsByClassName("tweet-quote-char")[0];
        const tweetQuoteMedia =
            tweet.getElementsByClassName("tweet-quote-media")[0];

        const tweetInteractRetweetMenu = tweet.getElementsByClassName(
            "tweet-interact-retweet-menu"
        )[0];
        const tweetInteractRetweetMenuRetweet = tweet.getElementsByClassName(
            "tweet-interact-retweet-menu-retweet"
        )[0];
        const tweetInteractRetweetMenuQuote = tweet.getElementsByClassName(
            "tweet-interact-retweet-menu-quote"
        )[0];
        const tweetInteractRetweetMenuQuotes = tweet.getElementsByClassName(
            "tweet-interact-retweet-menu-quotes"
        )[0];
        const tweetInteractRetweetMenuRetweeters = tweet.getElementsByClassName(
            "tweet-interact-retweet-menu-retweeters"
        )[0];

        const tweetInteractMoreMenu = tweet.getElementsByClassName(
            "tweet-interact-more-menu"
        )[0];
        const tweetInteractMoreMenuCopy = tweet.getElementsByClassName(
            "tweet-interact-more-menu-copy"
        )[0];
        const tweetInteractMoreMenuCopyTweetId = tweet.getElementsByClassName(
            "tweet-interact-more-menu-copy-tweet-id"
        )[0];
        const tweetInteractMoreMenuLog = tweet.getElementsByClassName(
            "tweet-interact-more-menu-log"
        )[0];
        const tweetInteractMoreMenuCopyUserId = tweet.getElementsByClassName(
            "tweet-interact-more-menu-copy-user-id"
        )[0];
        const tweetInteractMoreMenuEmbed = tweet.getElementsByClassName(
            "tweet-interact-more-menu-embed"
        )[0];
        const tweetInteractMoreMenuShare = tweet.getElementsByClassName(
            "tweet-interact-more-menu-share"
        )[0];
        const tweetInteractMoreMenuShareDMs = tweet.getElementsByClassName(
            "tweet-interact-more-menu-share-dms"
        )[0];
        const tweetInteractMoreMenuNewtwitter = tweet.getElementsByClassName(
            "tweet-interact-more-menu-newtwitter"
        )[0];
        const tweetInteractMoreMenuAnalytics = tweet.getElementsByClassName(
            "tweet-interact-more-menu-analytics"
        )[0];
        const tweetInteractMoreMenuRefresh = tweet.getElementsByClassName(
            "tweet-interact-more-menu-refresh"
        )[0];
        const tweetInteractMoreMenuMute = tweet.getElementsByClassName(
            "tweet-interact-more-menu-mute"
        )[0];
        const tweetInteractMoreMenuDownload = tweet.getElementsByClassName(
            "tweet-interact-more-menu-download"
        )[0];
        const tweetInteractMoreMenuDownloadGifs = Array.from(
            tweet.getElementsByClassName(
                "tweet-interact-more-menu-download-gif"
            )
        );
        const tweetInteractMoreMenuDelete = tweet.getElementsByClassName(
            "tweet-interact-more-menu-delete"
        )[0];
        const tweetInteractMoreMenuPin = tweet.getElementsByClassName(
            "tweet-interact-more-menu-pin"
        )[0];
        const tweetInteractMoreMenuFollow = tweet.getElementsByClassName(
            "tweet-interact-more-menu-follow"
        )[0];
        const tweetInteractMoreMenuBlock = tweet.getElementsByClassName(
            "tweet-interact-more-menu-block"
        )[0];
        const tweetInteractMoreMenuMuteUser = tweet.getElementsByClassName(
            "tweet-interact-more-menu-mute-user"
        )[0];
        const tweetInteractMoreMenuListsAction = tweet.getElementsByClassName(
            "tweet-interact-more-menu-lists-action"
        )[0];
        const tweetInteractMoreMenuBookmark = tweet.getElementsByClassName(
            "tweet-interact-more-menu-bookmark"
        )[0];
        const tweetInteractMoreMenuFeedbacks = Array.from(
            tweet.getElementsByClassName("tweet-interact-more-menu-feedback")
        );
        const tweetInteractMoreMenuHide = tweet.getElementsByClassName(
            "tweet-interact-more-menu-hide"
        )[0];
        const tweetInteractMoreMenuSeparate = tweet.getElementsByClassName(
            "tweet-interact-more-menu-separate"
        )[0];

        if (tweetInteractMoreMenuLog)
            tweetInteractMoreMenuLog.addEventListener("click", () => {
                console.log(t);
            });

        if (tweetInteractMoreMenuSeparate)
            tweetInteractMoreMenuSeparate.addEventListener("click", () => {
                tweetBodyText.style = `
                padding-top: 20px!important;
                display: block;
                font-size: 26px;
                line-height: unset;
                padding-bottom: 20px;
            `;
                tweetInteractMoreMenuSeparate.style.display = "none";
            });

        // Lists
        if (tweetInteractMoreMenuListsAction)
            tweetInteractMoreMenuListsAction.addEventListener(
                "click",
                async () => {
                    createModal(`
                <h1 class="cool-header">${LOC.from_list.message}</h1>
                <div id="modal-lists"></div>
            `);
                    let lists = await API.list.getOwnerships(
                        user.id_str,
                        t.user.id_str
                    );
                    let container = document.getElementById("modal-lists");
                    for (let i in lists) {
                        let l = lists[i];
                        let listElement = document.createElement("div");
                        listElement.classList.add("list-item");
                        listElement.innerHTML = html`
                            <div style="display:inline-block;">
                                <a
                                    href="/i/lists/${l.id_str}"
                                    class="following-item-link"
                                >
                                    <img
                                        style="object-fit: cover;"
                                        src="${l.custom_banner_media
                                            ? l.custom_banner_media.media_info
                                                  .original_img_url
                                            : l.default_banner_media.media_info
                                                  .original_img_url}"
                                        alt="${l.name}"
                                        class="following-item-avatar tweet-avatar"
                                        width="48"
                                        height="48"
                                    />
                                    <div
                                        class="following-item-text"
                                        style="position: relative;bottom: 12px;"
                                    >
                                        <span
                                            class="tweet-header-name following-item-name"
                                            style="font-size: 18px;"
                                            >${escapeHTML(l.name)}</span
                                        ><br />
                                        <span
                                            style="color:var(--darker-gray);font-size:14px;margin-top:2px"
                                            >${l.description
                                                ? escapeHTML(
                                                      l.description
                                                  ).slice(0, 52)
                                                : LOC.no_description
                                                      .message}</span
                                        >
                                    </div>
                                </a>
                            </div>
                            <div
                                style="display:inline-block;float: right;margin-top: 5px;"
                            >
                                <button class="nice-button">
                                    ${l.is_member
                                        ? LOC.remove.message
                                        : LOC.add.message}
                                </button>
                            </div>
                        `;
                        container.appendChild(listElement);
                        listElement
                            .getElementsByClassName("nice-button")[0]
                            .addEventListener("click", async () => {
                                if (l.is_member) {
                                    await API.list.removeMember(
                                        l.id_str,
                                        t.user.id_str
                                    );
                                    l.is_member = false;
                                    listElement.getElementsByClassName(
                                        "nice-button"
                                    )[0].innerText = LOC.add.message;
                                } else {
                                    await API.list.addMember(
                                        l.id_str,
                                        t.user.id_str
                                    );
                                    l.is_member = true;
                                    listElement.getElementsByClassName(
                                        "nice-button"
                                    )[0].innerText = LOC.remove.message;
                                }
                                l.is_member = !l.is_member;
                            });
                    }
                }
            );

        // moderating tweets
        if (tweetInteractMoreMenuHide)
            tweetInteractMoreMenuHide.addEventListener("click", async () => {
                if (t.moderated) {
                    try {
                        await API.tweet.unmoderate(t.id_str);
                    } catch (e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    tweetInteractMoreMenuHide.innerText =
                        LOC.hide_tweet.message;
                    t.moderated = false;
                } else {
                    let sure = confirm(LOC.hide_tweet_sure.message);
                    if (!sure) return;
                    try {
                        await API.tweet.moderate(t.id_str);
                    } catch (e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    tweetInteractMoreMenuHide.innerText =
                        LOC.unhide_tweet.message;
                    t.moderated = true;
                }
            });

        // community notes
        if (t.birdwatch && !vars.hideCommunityNotes) {
            if (t.birdwatch.subtitle) {
                let div = document.createElement("div");
                div.classList.add("tweet-birdwatch", "box");
                let text = Array.from(escapeHTML(t.birdwatch.subtitle.text));
                for (
                    let e = t.birdwatch.subtitle.entities.length - 1;
                    e >= 0;
                    e--
                ) {
                    let entity = t.birdwatch.subtitle.entities[e];
                    if (!entity.ref) continue;
                    text = arrayInsert(text, entity.toIndex, "</a>");
                    text = arrayInsert(
                        text,
                        entity.fromIndex,
                        `<a href="${entity.ref.url}" target="_blank">`
                    );
                }
                text = text.join("");

                div.innerHTML = html`
                    <div class="tweet-birdwatch-header">
                        <span class="tweet-birdwatch-title"
                            >${escapeHTML(t.birdwatch.title)}</span
                        >
                    </div>
                    <div class="tweet-birdwatch-body">
                        <span class="tweet-birdwatch-subtitle">${text}</span>
                    </div>
                `;

                if (tweetFooter) tweetFooter.before(div);
                else tweetInteract.before(div);
            }
        }

        // rtl languages
        if (rtlLanguages.includes(t.lang)) {
            tweetBody.classList.add("rtl");
        }

        // Quote body
        if (tweetMediaQuote)
            tweetMediaQuote.addEventListener("click", (e) => {
                if (e && e.target && e.target.tagName === "VIDEO") {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (e.target.paused) {
                        e.target.play();
                    } else {
                        e.target.pause();
                    }
                }
            });
        if (tweetBodyQuote) {
            if (typeof mainTweetLikers !== "undefined") {
                tweetBodyQuote.addEventListener("click", (e) => {
                    e.preventDefault();
                    document.getElementById("loading-box").hidden = false;
                    history.pushState(
                        {},
                        null,
                        `/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}`
                    );
                    updateSubpage();
                    mediaToUpload = [];
                    linkColors = {};
                    cursor = undefined;
                    seenReplies = [];
                    mainTweetLikers = [];
                    let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                    if (subpage === "tweet") {
                        updateReplies(id);
                    } else if (subpage === "likes") {
                        updateLikes(id);
                    } else if (subpage === "retweets") {
                        updateRetweets(id);
                    } else if (subpage === "retweets_with_comments") {
                        updateRetweetsWithComments(id);
                    }
                    renderDiscovery();
                    renderTrends();
                    currentLocation = location.pathname;
                });
            } else {
                tweetBodyQuote.addEventListener("click", (e) => {
                    e.preventDefault();
                    if (
                        e.target.className &&
                        e.target.className.includes("tweet-media-element")
                    ) {
                        if (
                            !e.target.src.includes("?name=") &&
                            !e.target.src.endsWith(":orig") &&
                            !e.target.src.startsWith("data:")
                        ) {
                            e.target.src += "?name=orig";
                        } else if (e.target.src.includes("?name=small")) {
                            e.target.src = e.target.src.replace(
                                "?name=small",
                                "?name=large"
                            );
                        }
                        new Viewer(e.target.parentElement, {
                            transition: false,
                            zoomRatio: 0.3,
                        });
                        e.target.click();
                        return;
                    }
                    new TweetViewer(user, t.quoted_status);
                });
            }
            if (rtlLanguages.includes(t.quoted_status.lang)) {
                tweetBodyQuoteText.classList.add("rtl");
            } else {
                tweetBodyQuoteText.classList.add("ltr");
            }
            if (tweetQuoteTranslate) {
                let quoteTranslating = false;
                tweetQuoteTranslate.addEventListener("click", async (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    if (t.quoted_status.translated || quoteTranslating) return;
                    quoteTranslating = true;
                    let translated = await API.tweet.translate(
                        t.quoted_status.id_str
                    );
                    quoteTranslating = false;
                    t.quoted_status.translated = true;
                    tweetQuoteTranslate.hidden = true;
                    if (!translated.translated_lang || !translated.text) return;
                    let tt = t.full_text
                        .replace(/^(@[a-zA-Z0-9_]{1,15}\s?)*/, "")
                        .replace(/\shttps:\/\/t.co\/[a-zA-Z0-9\-]{8,10}$/, "")
                        .trim();
                    if (translated.text.trim() === tt) return;
                    if (
                        translated.text.trim() ===
                        tt.replace(/(hihi)|(hehe)/g, "lol")
                    )
                        return; // lol
                    const { hideOriginalLanguages } =
                        await chrome.storage.sync.get("hideOriginalLanguages");
                    let translatedMessage;
                    if (LOC.translated_from.message.includes("$LANGUAGE$")) {
                        translatedMessage = LOC.translated_from.message.replace(
                            "$LANGUAGE$",
                            `[${translated.translated_lang}]`
                        );
                    } else {
                        translatedMessage = `${LOC.translated_from.message} [${translated.translated_lang}]`;
                    }
                    if (translated.text.length > 600) {
                        translated.text =
                            translated.text.substring(0, 600) + "...";
                    }
                    if (hideOriginalLanguages) {
                        translatedMessage = "";
                        tweetBodyQuoteText.innerHTML = "";
                    }
                    tweetBodyQuoteText.innerHTML +=
                        `<span class="translated-from" style="margin-bottom:3px">${translatedMessage}:</span>` +
                        `<span class="tweet-translated-text" style="color:var(--default-text-color)!important">${escapeHTML(
                            translated.text
                        )}</span>`;
                    if (vars.enableTwemoji) twemoji.parse(tweetBodyQuoteText);
                });
                if (
                    options.translate ||
                    vars.autotranslateProfiles.includes(
                        t.quoted_status.user.id_str
                    ) ||
                    (typeof toAutotranslate !== "undefined" &&
                        toAutotranslate) ||
                    (vars.autotranslateLanguages.includes(
                        t.quoted_status.lang
                    ) &&
                        vars.autotranslationMode === "whitelist") ||
                    (!vars.autotranslateLanguages.includes(
                        t.quoted_status.lang
                    ) &&
                        vars.autotranslationMode === "blacklist")
                ) {
                    onVisible(tweet, () => {
                        if (!t.quoted_status.translated) {
                            if (tweetQuoteTranslate)
                                tweetQuoteTranslate.click();
                        }
                    });
                }
            }
        }

        // Translate
        t.translated = false;
        let translating = false;
        if (tweetTranslate || tweetTranslateAfter) {
            (tweetTranslate
                ? tweetTranslate
                : tweetTranslateAfter
            ).addEventListener("click", async () => {
                if (t.translated || translating) return;
                translating = true;
                let translated = await API.tweet.translate(t.id_str);
                translating = false;
                t.translated = true;
                (tweetTranslate
                    ? tweetTranslate
                    : tweetTranslateAfter
                ).hidden = true;
                if (!translated.translated_lang || !translated.text) return;
                let tt = t.full_text
                    .replace(/^(@[a-zA-Z0-9_]{1,15}\s?)*/, "")
                    .replace(/\shttps:\/\/t.co\/[a-zA-Z0-9\-]{8,10}$/, "")
                    .trim();
                if (translated.text.trim() === tt) return;
                if (
                    translated.text.trim() ===
                    tt.replace(/(hihi)|(hehe)/g, "lol")
                )
                    return; // lol
                const { hideOriginalLanguages } = await chrome.storage.sync.get(
                    "hideOriginalLanguages"
                );

                let translatedMessage;
                if (LOC.translated_from.message.includes("$LANGUAGE$")) {
                    translatedMessage = LOC.translated_from.message.replace(
                        "$LANGUAGE$",
                        `[${translated.translated_lang}]`
                    );
                } else {
                    translatedMessage = `${LOC.translated_from.message} [${translated.translated_lang}]`;
                }
                let translatedT = {
                    full_text: translated.text,
                    entities: translated.entities,
                };
                let translatedFrom = document.createElement("span");
                translatedFrom.classList.add("translated-from");
                translatedFrom.innerText = translatedMessage;

                let translatedText = document.createElement("span");
                translatedText.classList.add("tweet-translated-text");
                translatedText.innerHTML = await renderTweetBodyHTML(
                    translatedT
                );
                if (hideOriginalLanguages) {
                    tweetBodyText.innerHTML = "";
                    tweetBodyText.append(translatedText);
                } else {
                    tweetBodyText.append(
                        document.createElement("br"),
                        translatedFrom,
                        translatedText
                    );
                }
                if (vars.enableTwemoji) twemoji.parse(tweetBodyText);
            });
            if (
                options.translate ||
                vars.autotranslateProfiles.includes(t.user.id_str) ||
                (typeof toAutotranslate !== "undefined" && toAutotranslate) ||
                (vars.autotranslateLanguages.includes(t.lang) &&
                    vars.autotranslationMode === "whitelist") ||
                (!vars.autotranslateLanguages.includes(t.lang) &&
                    vars.autotranslationMode === "blacklist")
            ) {
                onVisible(tweet, () => {
                    if (!t.translated) {
                        if (tweetTranslate) tweetTranslate.click();
                        else if (tweetTranslateAfter)
                            tweetTranslateAfter.click();
                    }
                });
            }
        }

        // Bookmarks
        let switchingBookmark = false;
        let switchBookmark = () => {
            if (switchingBookmark) return;
            switchingBookmark = true;
            chrome.storage.local.set(
                { tweetReplies: {}, tweetDetails: {} },
                () => {}
            );
            if (t.bookmarked) {
                API.bookmarks
                    .delete(t.id_str)
                    .then(() => {
                        toast.info(LOC.unbookmarked_tweet.message);
                        switchingBookmark = false;
                        if (tweetDeleteBookmark) {
                            tweet.remove();
                            if (timelineContainer.children.length === 0) {
                                timelineContainer.innerHTML = html`<div
                                    style="color:var(--light-gray)"
                                >
                                    ${LOC.empty.message}
                                </div>`;
                                document.getElementById(
                                    "delete-all"
                                ).hidden = true;
                            }
                            return;
                        }
                        t.bookmarked = false;
                        t.bookmark_count--;
                        tweetInteractMoreMenuBookmark.innerText =
                            LOC.bookmark_tweet.message;
                        if (tweetInteractBookmark) {
                            tweetInteractBookmark.classList.remove(
                                "tweet-interact-bookmarked"
                            );
                            tweetInteractBookmark.innerText = formatLargeNumber(
                                t.bookmark_count
                            ).replace(/\s/g, ",");
                            tweetInteractBookmark.dataset.val =
                                t.bookmark_count;
                        }
                    })
                    .catch((e) => {
                        switchingBookmark = false;
                        console.error(e);
                        alert(e);
                    });
            } else {
                API.bookmarks
                    .create(t.id_str)
                    .then(() => {
                        toast.info(LOC.bookmarked_tweet.message);
                        switchingBookmark = false;
                        t.bookmarked = true;
                        t.bookmark_count++;
                        tweetInteractMoreMenuBookmark.innerText =
                            LOC.remove_bookmark.message;
                        if (tweetInteractBookmark) {
                            tweetInteractBookmark.classList.add(
                                "tweet-interact-bookmarked"
                            );
                            tweetInteractBookmark.innerText = formatLargeNumber(
                                t.bookmark_count
                            ).replace(/\s/g, ",");
                            tweetInteractBookmark.dataset.val =
                                t.bookmark_count;
                        }
                    })
                    .catch((e) => {
                        switchingBookmark = false;
                        console.error(e);
                        alert(e);
                    });
            }
        };
        if (tweetInteractBookmark)
            tweetInteractBookmark.addEventListener("click", switchBookmark);
        if (tweetInteractMoreMenuBookmark)
            tweetInteractMoreMenuBookmark.addEventListener(
                "click",
                switchBookmark
            );
        if (tweetDeleteBookmark)
            tweetDeleteBookmark.addEventListener("click", async () => {
                await API.bookmarks.delete(t.id_str);
                tweet.remove();
                if (timelineContainer.children.length === 0) {
                    timelineContainer.innerHTML = html`<div
                        style="color:var(--light-gray)"
                    >
                        ${LOC.empty.message}
                    </div>`;
                    document.getElementById("delete-all").hidden = true;
                }
            });

        // Media
        if (t.extended_entities && t.extended_entities.media) {
            const tweetMedia = tweet.getElementsByClassName("tweet-media")[0];
            tweetMedia.addEventListener("click", (e) => {
                if (
                    e.target.className &&
                    e.target.className.includes("tweet-media-element-censor")
                ) {
                    return e.target.classList.remove(
                        "tweet-media-element-censor"
                    );
                }
                if (e.target.tagName === "IMG") {
                    if (
                        !e.target.src.includes("?name=") &&
                        !e.target.src.endsWith(":orig") &&
                        !e.target.src.startsWith("data:")
                    ) {
                        e.target.src += "?name=orig";
                    } else if (e.target.src.includes("?name=small")) {
                        e.target.src = e.target.src.replace(
                            "?name=small",
                            "?name=large"
                        );
                    }
                    new Viewer(tweetMedia, {
                        transition: false,
                        zoomRatio: 0.3,
                    });
                    e.target.click();
                }
            });
            if (
                typeof pageUser !== "undefined" &&
                pageUser.id_str === t.user.id_str
            ) {
                let profileMediaDiv =
                    document.getElementById("profile-media-div");
                if (!options || !options.top || !options.top.text)
                    t.extended_entities.media.forEach((m) => {
                        if (profileMediaDiv.children.length >= 6) return;
                        let ch = Array.from(profileMediaDiv.children);
                        if (ch.find((c) => c.src === m.media_url_https)) return;
                        const media = document.createElement("img");
                        media.classList.add(
                            "tweet-media-element",
                            "tweet-media-element-four",
                            "profile-media-preview"
                        );
                        if (
                            !vars.displaySensitiveContent &&
                            t.possibly_sensitive
                        )
                            media.classList.add("tweet-media-element-censor");
                        media.src = m.media_url_https;
                        if (m.ext_alt_text) media.alt = m.ext_alt_text;
                        media.addEventListener("click", async () => {
                            new TweetViewer(user, t);
                        });
                        profileMediaDiv.appendChild(media);
                    });
            }
        }

        // Emojis
        [tweetReplyAddEmoji, tweetQuoteAddEmoji].forEach((e) => {
            e.addEventListener("click", (e) => {
                let isReply = e.target.className === "tweet-reply-add-emoji";
                createEmojiPicker(
                    isReply ? tweetReply : tweetQuote,
                    isReply ? tweetReplyText : tweetQuoteText,
                    {}
                );
            });
        });

        // Reply
        tweetReplyCancel.addEventListener("click", () => {
            tweetReply.hidden = true;
            tweetInteractReply.classList.remove("tweet-interact-reply-clicked");
        });
        let replyMedia = [];
        tweetReply.addEventListener("drop", (e) => {
            handleDrop(e, replyMedia, tweetReplyMedia);
        });
        tweetReply.addEventListener("paste", (event) => {
            let items = (
                event.clipboardData || event.originalEvent.clipboardData
            ).items;
            for (let index in items) {
                let item = items[index];
                if (item.kind === "file") {
                    let file = item.getAsFile();
                    handleFiles([file], replyMedia, tweetReplyMedia);
                }
            }
        });
        tweetReplyUpload.addEventListener("click", () => {
            getMedia(replyMedia, tweetReplyMedia);
            tweetReplyText.focus();
        });
        tweetInteractReply.addEventListener("click", () => {
            if (options.mainTweet) {
                document.getElementById("new-tweet").click();
                document.getElementById("new-tweet-text").focus();
                return;
            }
            if (!tweetQuote.hidden) tweetQuote.hidden = true;
            if (tweetReply.hidden) {
                tweetInteractReply.classList.add(
                    "tweet-interact-reply-clicked"
                );
            } else {
                tweetInteractReply.classList.remove(
                    "tweet-interact-reply-clicked"
                );
            }
            tweetReply.hidden = !tweetReply.hidden;
            setTimeout(() => {
                tweetReplyText.focus();
            });
        });
        tweetReplyText.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && e.ctrlKey) {
                tweetReplyButton.click();
            }
        });
        tweetReplyText.addEventListener("input", (e) => {
            let tweet = twttr.txt.parseTweet(tweetReplyText.value);
            if (localStorage.OTisBlueVerified) {
                return (tweetReplyChar.innerText = `${tweet.weightedLength}/25000`);
            }
            tweetReplyChar.innerText = `${tweet.weightedLength}/280`;
            if (tweet.weightedLength > 265) {
                tweetReplyChar.style.color = "#c26363";
            } else {
                tweetReplyChar.style.color = "";
            }
            if (tweet.weightedLength > 280) {
                tweetReplyChar.style.color = "red";
                tweetReplyButton.disabled = true;
            } else {
                tweetReplyChar.style.color = "";
                tweetReplyButton.disabled = false;
            }
        });
        tweetReplyButton.addEventListener("click", async () => {
            tweetReplyError.innerHTML = "";
            let text = tweetReplyText.value;
            if (text.length === 0 && replyMedia.length === 0) return;
            tweetReplyButton.disabled = true;
            let uploadedMedia = [];
            for (let i in replyMedia) {
                let media = replyMedia[i];
                try {
                    media.div.getElementsByClassName(
                        "new-tweet-media-img-progress"
                    )[0].hidden = false;
                    let mediaId;
                    if (!media.div.dataset.mediaId) {
                        mediaId = await API.uploadMedia({
                            media_type: media.type,
                            media_category: media.category,
                            media: media.data,
                            alt: media.alt,
                            cw: media.cw,
                            loadCallback: (data) => {
                                media.div.getElementsByClassName(
                                    "new-tweet-media-img-progress"
                                )[0].innerText = `${data.text} (${data.progress}%)`;
                            },
                        });
                    } else {
                        mediaId = media.div.dataset.mediaId;
                    }
                    uploadedMedia.push(mediaId);
                    media.div.getElementsByClassName(
                        "new-tweet-media-img-progress"
                    )[0].innerText = LOC.uploaded.message;
                    media.div.dataset.mediaId = mediaId;
                } catch (e) {
                    console.error(e);
                    alert(e);
                    for (let j in replyMedia) {
                        let media = replyMedia[j];
                        media.div.getElementsByClassName(
                            "new-tweet-media-img-progress"
                        )[0].hidden = true;
                        media.div.getElementsByClassName(
                            "new-tweet-media-img-progress"
                        )[0].innerText = "";
                    }
                    tweetReplyButton.disabled = false;
                    return; // cancel tweeting
                }
            }
            let tweetObject = {
                status: text,
                in_reply_to_status_id: t.id_str,
            };
            if (uploadedMedia.length > 0) {
                tweetObject.media_ids = uploadedMedia.join(",");
            }
            let tweetData;
            try {
                tweetData = await API.tweet.postV2(tweetObject);
            } catch (e) {
                tweetReplyError.innerHTML =
                    (e && e.message ? e.message : e) + "<br>";
                tweetReplyButton.disabled = false;
                return;
            }
            if (!tweetData) {
                tweetReplyButton.disabled = false;
                tweetReplyError.innerHTML = html`${LOC.error_sending_tweet
                        .message}<br />`;
                return;
            }
            tweetReplyChar.innerText = localStorage.OTisBlueVerified
                ? "0/25000"
                : "0/280";
            tweetReplyText.value = "";
            tweetReply.hidden = true;
            tweetInteractReply.classList.remove("tweet-interact-reply-clicked");
            if (!options.mainTweet) {
                tweetInteractReply.dataset.val =
                    parseInt(tweetInteractReply.dataset.val) + 1;
                if (vars.showExactValues || t.reply_count < 10000)
                    tweetInteractReply.innerText = formatLargeNumber(
                        parseInt(
                            tweetInteractReply.innerText
                                .replace(/\s/g, "")
                                .replace(/,/g, "")
                                .replace(/\./g, "")
                        ) + 1
                    ).replace(/\s/g, ",");
            } else {
                tweetFooterReplies.dataset.val =
                    parseInt(tweetFooterReplies.dataset.val) + 1;
                if (vars.showExactValues || t.reply_count < 10000)
                    tweetFooterReplies.innerText = formatLargeNumber(
                        parseInt(
                            tweetFooterReplies.innerText
                                .replace(/\s/g, "")
                                .replace(/,/g, "")
                                .replace(/\./g, "")
                        ) + 1
                    ).replace(/\s/g, ",");
            }
            if (typeof repliesToIgnore !== "undefined") {
                repliesToIgnore.push(tweetData.id_str);
            }
            tweetData._ARTIFICIAL = true;
            if (tweet.getElementsByClassName("tweet-self-thread-div")[0])
                tweet.getElementsByClassName(
                    "tweet-self-thread-div"
                )[0].hidden = false;
            tweetReplyButton.disabled = false;
            tweetReplyMedia.innerHTML = [];
            replyMedia = [];
            chrome.storage.local.set(
                { tweetReplies: {}, tweetDetails: {} },
                () => {}
            );
            appendTweet(tweetData, document.getElementById("timeline"), {
                noTop: true,
                after: tweet,
            });
        });

        // Retweet / Quote Tweet
        let retweetClicked = false;
        tweetQuoteCancel.addEventListener("click", () => {
            tweetQuote.hidden = true;
        });
        tweetInteractRetweet.addEventListener("click", async () => {
            if (
                tweetInteractRetweet.classList.contains(
                    "tweet-interact-retweet-disabled"
                )
            ) {
                return;
            }
            if (!tweetQuote.hidden) {
                tweetQuote.hidden = true;
                return;
            }
            if (tweetInteractRetweetMenu.hidden) {
                tweetInteractRetweetMenu.hidden = false;
                tweetInteractRetweetMenu.style.marginTop = "-35px";
            }
            if (retweetClicked) return;
            retweetClicked = true;
            setTimeout(() => {
                document.body.addEventListener(
                    "click",
                    () => {
                        retweetClicked = false;
                        setTimeout(
                            () => (tweetInteractRetweetMenu.hidden = true),
                            50
                        );
                    },
                    { once: true }
                );
            }, 50);
        });
        t.renderRetweetsUp = (tweetData) => {
            tweetInteractRetweetMenuRetweet.innerText = LOC.unretweet.message;
            tweetInteractRetweet.classList.add("tweet-interact-retweeted");
            t.retweeted = true;
            t.retweet_count++;
            t.newTweetId = tweetData.id_str;
            if (!options.mainTweet) {
                tweetInteractRetweet.dataset.val =
                    parseInt(tweetInteractRetweet.dataset.val) + 1;
                if (vars.showExactValues || t.retweet_count < 10000)
                    tweetInteractRetweet.innerText = formatLargeNumber(
                        parseInt(
                            tweetInteractRetweet.innerText
                                .replace(/\s/g, "")
                                .replace(/,/g, "")
                                .replace(/\./g, "")
                        ) + 1
                    ).replace(/\s/g, ",");
            } else {
                if (vars.showExactValues || t.retweet_count < 10000)
                    tweetFooterRetweets.innerText = formatLargeNumber(
                        parseInt(
                            tweetFooterRetweets.innerText
                                .replace(/\s/g, "")
                                .replace(/,/g, "")
                                .replace(/\./g, "")
                        ) + 1
                    ).replace(/\s/g, ",");
            }
        };
        t.renderRetweetsDown = () => {
            tweetInteractRetweetMenuRetweet.innerText = LOC.retweet.message;
            tweetInteractRetweet.classList.remove("tweet-interact-retweeted");
            t.retweeted = false;
            t.retweet_count--;
            if (!options.mainTweet) {
                tweetInteractRetweet.dataset.val =
                    parseInt(tweetInteractRetweet.dataset.val) - 1;
                if (vars.showExactValues || t.retweet_count < 10000)
                    tweetInteractRetweet.innerText = formatLargeNumber(
                        parseInt(
                            tweetInteractRetweet.innerText
                                .replace(/\s/g, "")
                                .replace(/,/g, "")
                                .replace(/\./g, "")
                        ) - 1
                    ).replace(/\s/g, ",");
            } else {
                if (vars.showExactValues || t.retweet_count < 10000)
                    tweetFooterRetweets.innerText = formatLargeNumber(
                        parseInt(
                            tweetFooterRetweets.innerText
                                .replace(/\s/g, "")
                                .replace(/,/g, "")
                                .replace(/\./g, "")
                        ) - 1
                    ).replace(/\s/g, ",");
            }
            delete t.newTweetId;
        };
        tweetInteractRetweetMenuRetweet.addEventListener("click", async () => {
            if (!t.retweeted) {
                let tweetData;
                try {
                    tweetData = await API.tweet.retweet(t.id_str);
                } catch (e) {
                    console.error(e);
                    alert(e);
                    return;
                }
                if (!tweetData) {
                    return;
                }
                t.renderRetweetsUp(tweetData);
            } else {
                let tweetData;
                try {
                    tweetData = await API.tweet.unretweet(
                        t.retweeted_status
                            ? t.retweeted_status.id_str
                            : t.id_str
                    );
                } catch (e) {
                    console.error(e);
                    return;
                }
                if (!tweetData) {
                    return;
                }
                if (t.current_user_retweet) {
                    if (
                        options.top &&
                        options.top.icon &&
                        options.top.icon === "\uf006"
                    ) {
                        tweet.remove();
                        if (typeof timeline !== "undefined") {
                            let index = timeline.data.findIndex(
                                (tweet) =>
                                    tweet.retweeted_status &&
                                    tweet.retweeted_status.id_str ===
                                        t.id_str &&
                                    !tweet.current_user_retweet
                            );
                            if (index > -1) {
                                timeline.data.splice(index, 1);
                                let originalTweet = timeline.data.find(
                                    (tweet) => tweet.id_str === t.id_str
                                );
                                if (originalTweet) {
                                    delete originalTweet.current_user_retweet;
                                    originalTweet.renderRetweetsDown();
                                }
                            }
                        }
                    } else {
                        let retweetedElement = Array.from(
                            document.getElementsByClassName("tweet")
                        ).find(
                            (te) =>
                                te.dataset.tweetId === t.id_str &&
                                te.getElementsByClassName("retweet-label")[0]
                        );
                        if (retweetedElement) {
                            retweetedElement.remove();
                        }
                        if (typeof timeline !== "undefined") {
                            let index = timeline.data.findIndex(
                                (tweet) =>
                                    tweet.retweeted_status &&
                                    tweet.retweeted_status.id_str ===
                                        t.id_str &&
                                    !tweet.current_user_retweet
                            );
                            if (index > -1) {
                                timeline.data.splice(index, 1);
                            }
                        }
                    }
                }
                t.renderRetweetsDown();
            }
            chrome.storage.local.set(
                { tweetReplies: {}, tweetDetails: {} },
                () => {}
            );
        });
        if (options.mainTweet) {
            tweetInteractRetweetMenuQuotes.addEventListener(
                "click",
                async () => {
                    document.getElementById("loading-box").hidden = false;
                    history.pushState(
                        {},
                        null,
                        `/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments`
                    );
                    updateSubpage();
                    mediaToUpload = [];
                    linkColors = {};
                    cursor = undefined;
                    seenReplies = [];
                    mainTweetLikers = [];
                    let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                    if (subpage === "tweet") {
                        updateReplies(id);
                    } else if (subpage === "likes") {
                        updateLikes(id);
                    } else if (subpage === "retweets") {
                        updateRetweets(id);
                    } else if (subpage === "retweets_with_comments") {
                        updateRetweetsWithComments(id);
                    }
                    renderDiscovery();
                    renderTrends();
                    currentLocation = location.pathname;
                }
            );
            tweetInteractRetweetMenuRetweeters.addEventListener(
                "click",
                async () => {
                    document.getElementById("loading-box").hidden = false;
                    history.pushState(
                        {},
                        null,
                        `/${t.user.screen_name}/status/${t.id_str}/retweets`
                    );
                    updateSubpage();
                    mediaToUpload = [];
                    linkColors = {};
                    cursor = undefined;
                    seenReplies = [];
                    mainTweetLikers = [];
                    let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                    if (subpage === "tweet") {
                        updateReplies(id);
                    } else if (subpage === "likes") {
                        updateLikes(id);
                    } else if (subpage === "retweets") {
                        updateRetweets(id);
                    } else if (subpage === "retweets_with_comments") {
                        updateRetweetsWithComments(id);
                    }
                    renderDiscovery();
                    renderTrends();
                    currentLocation = location.pathname;
                }
            );
        }
        tweetInteractRetweetMenuQuote.addEventListener("click", async () => {
            if (!tweetReply.hidden) {
                tweetInteractReply.classList.remove(
                    "tweet-interact-reply-clicked"
                );
                tweetReply.hidden = true;
            }
            tweetQuote.hidden = false;
            setTimeout(() => {
                tweetQuoteText.focus();
            });
        });
        let quoteMedia = [];
        tweetQuote.addEventListener("drop", (e) => {
            handleDrop(e, quoteMedia, tweetQuoteMedia);
        });
        tweetQuote.addEventListener("paste", (event) => {
            let items = (
                event.clipboardData || event.originalEvent.clipboardData
            ).items;
            for (let index in items) {
                let item = items[index];
                if (item.kind === "file") {
                    let file = item.getAsFile();
                    handleFiles([file], quoteMedia, tweetQuoteMedia);
                }
            }
        });
        tweetQuoteUpload.addEventListener("click", () => {
            getMedia(quoteMedia, tweetQuoteMedia);
        });
        tweetQuoteText.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && e.ctrlKey) {
                tweetQuoteButton.click();
            }
        });
        tweetQuoteText.addEventListener("input", (e) => {
            let tweet = twttr.txt.parseTweet(tweetQuoteText.value);

            if (localStorage.OTisBlueVerified) {
                return (tweetQuoteChar.innerText = `${tweet.weightedLength}/25000`);
            }
            tweetQuoteChar.innerText = `${tweet.weightedLength}/280`;
            if (tweet.weightedLength > 265) {
                tweetQuoteChar.style.color = "#c26363";
            } else {
                tweetQuoteChar.style.color = "";
            }
            if (tweet.weightedLength > 280) {
                tweetQuoteChar.style.color = "red";
                tweetQuoteButton.disabled = true;
            } else {
                tweetQuoteButton.disabled = false;
            }
        });
        tweetQuoteButton.addEventListener("click", async () => {
            let text = tweetQuoteText.value;
            tweetQuoteError.innerHTML = "";
            if (text.length === 0 && quoteMedia.length === 0) return;
            tweetQuoteButton.disabled = true;
            let uploadedMedia = [];
            for (let i in quoteMedia) {
                let media = quoteMedia[i];
                try {
                    media.div.getElementsByClassName(
                        "new-tweet-media-img-progress"
                    )[0].hidden = false;
                    let mediaId;
                    if (!media.div.dataset.mediaId) {
                        mediaId = await API.uploadMedia({
                            media_type: media.type,
                            media_category: media.category,
                            media: media.data,
                            alt: media.alt,
                            cw: media.cw,
                            loadCallback: (data) => {
                                media.div.getElementsByClassName(
                                    "new-tweet-media-img-progress"
                                )[0].innerText = `${data.text} (${data.progress}%)`;
                            },
                        });
                    } else {
                        mediaId = media.div.dataset.mediaId;
                    }
                    uploadedMedia.push(mediaId);
                    media.div.getElementsByClassName(
                        "new-tweet-media-img-progress"
                    )[0].innerText = LOC.uploaded.message;
                    media.div.dataset.mediaId = mediaId;
                } catch (e) {
                    console.error(e);
                    alert(e);
                    for (let j in quoteMedia) {
                        let media = quoteMedia[j];
                        media.div.getElementsByClassName(
                            "new-tweet-media-img-progress"
                        )[0].hidden = true;
                        media.div.getElementsByClassName(
                            "new-tweet-media-img-progress"
                        )[0].innerText = "";
                    }
                    tweetQuoteButton.disabled = false;
                    return; // cancel tweeting
                }
            }
            let tweetObject = {
                status: text,
                attachment_url: `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`,
            };
            if (uploadedMedia.length > 0) {
                tweetObject.media_ids = uploadedMedia.join(",");
            }
            let tweetData;
            try {
                tweetData = await API.tweet.postV2(tweetObject);
            } catch (e) {
                tweetQuoteError.innerHTML =
                    (e && e.message ? e.message : e) + "<br>";
                tweetQuoteButton.disabled = false;
                return;
            }
            if (!tweetData) {
                tweetQuoteError.innerHTML = html`${LOC.error_sending_tweet}<br />`;
                tweetQuoteButton.disabled = false;
                return;
            }
            tweetQuoteText.value = "";
            tweetQuoteChar.innerText = localStorage.OTisBlueVerified
                ? "0/25000"
                : "0/280";
            tweetQuote.hidden = true;
            tweetData._ARTIFICIAL = true;
            quoteMedia = [];
            tweetQuoteButton.disabled = false;
            tweetQuoteMedia.innerHTML = "";
            chrome.storage.local.set(
                { tweetReplies: {}, tweetDetails: {} },
                () => {}
            );
            if (typeof timeline !== "undefined")
                timeline.data.unshift(tweetData);
            else appendTweet(tweetData, timelineContainer, { prepend: true });
        });

        // Favorite
        t.renderFavoritesDown = () => {
            t.favorited = false;
            t.favorite_count--;
            if (!options.mainTweet) {
                tweetInteractFavorite.dataset.val =
                    parseInt(tweetInteractFavorite.dataset.val) - 1;
                if (vars.showExactValues || t.favorite_count < 10000)
                    tweetInteractFavorite.innerText = formatLargeNumber(
                        parseInt(
                            tweetInteractFavorite.innerText
                                .replace(/\s/g, "")
                                .replace(/,/g, "")
                                .replace(/\./g, "")
                        ) - 1
                    ).replace(/\s/g, ",");
            } else {
                if (
                    mainTweetLikers.find(
                        (liker) => liker.id_str === user.id_str
                    )
                ) {
                    mainTweetLikers.splice(
                        mainTweetLikers.findIndex(
                            (liker) => liker.id_str === user.id_str
                        ),
                        1
                    );
                    let likerImg = footerFavorites.querySelector(
                        `a[data-id="${user.id_str}"]`
                    );
                    if (likerImg) likerImg.remove();
                }
                tweetInteractFavorite.dataset.val =
                    parseInt(tweetInteractFavorite.dataset.val) - 1;
                if (vars.showExactValues || t.favorite_count < 10000)
                    tweetFooterFavorites.innerText = formatLargeNumber(
                        parseInt(
                            tweetFooterFavorites.innerText
                                .replace(/\s/g, "")
                                .replace(/,/g, "")
                                .replace(/\./g, "")
                        ) - 1
                    ).replace(/\s/g, ",");
            }
            tweetInteractFavorite.classList.remove("tweet-interact-favorited");
        };
        t.renderFavoritesUp = () => {
            t.favorited = true;
            t.favorite_count++;
            if (!options.mainTweet) {
                tweetInteractFavorite.dataset.val =
                    parseInt(tweetInteractFavorite.dataset.val) + 1;
                if (vars.showExactValues || t.favorite_count < 10000)
                    tweetInteractFavorite.innerText = formatLargeNumber(
                        parseInt(
                            tweetInteractFavorite.innerText
                                .replace(/\s/g, "")
                                .replace(/,/g, "")
                                .replace(/\./g, "")
                        ) + 1
                    ).replace(/\s/g, ",");
            } else {
                if (
                    footerFavorites.children.length < 8 &&
                    !mainTweetLikers.find(
                        (liker) => liker.id_str === user.id_str
                    )
                ) {
                    let a = document.createElement("a");
                    a.href = `/${user.screen_name}`;
                    let likerImg = document.createElement("img");
                    likerImg.src = `${
                        user.default_profile_image &&
                        vars.useOldDefaultProfileImage
                            ? chrome.runtime.getURL(
                                  `images/default_profile_images/default_profile_${
                                      Number(user.id_str) % 7
                                  }_normal.png`
                              )
                            : user.profile_image_url_https
                    }`;
                    likerImg.classList.add("tweet-footer-favorites-img");
                    likerImg.title = user.name + " (@" + user.screen_name + ")";
                    likerImg.width = 24;
                    likerImg.height = 24;
                    a.dataset.id = user.id_str;
                    a.appendChild(likerImg);
                    footerFavorites.appendChild(a);
                    mainTweetLikers.push(user);
                }
                tweetInteractFavorite.dataset.val =
                    parseInt(tweetInteractFavorite.dataset.val) + 1;
                if (vars.showExactValues || t.favorite_count < 10000)
                    tweetFooterFavorites.innerText = formatLargeNumber(
                        parseInt(
                            tweetFooterFavorites.innerText
                                .replace(/\s/g, "")
                                .replace(/,/g, "")
                                .replace(/\./g, "")
                        ) + 1
                    ).replace(/\s/g, ",");
            }
            tweetInteractFavorite.classList.add("tweet-interact-favorited");
        };
        tweetInteractFavorite.addEventListener("click", () => {
            if (t.favorited) {
                t.renderFavoritesDown();
                API.tweet.unfavorite(t.id_str).catch((e) => {
                    console.error(e);
                    alert(e);
                    t.renderFavoritesUp();
                });
            } else {
                t.renderFavoritesUp();
                API.tweet.favorite(t.id_str).catch((e) => {
                    console.error(e);
                    if (
                        e &&
                        e.errors &&
                        e.errors[0] &&
                        e.errors[0].code === 139
                    ) {
                        return;
                    }
                    alert(e);
                    t.renderFavoritesDown();
                });
            }
            chrome.storage.local.set(
                { tweetReplies: {}, tweetDetails: {} },
                () => {}
            );
        });

        // More
        let moreClicked = false;
        tweetInteractMore.addEventListener("click", () => {
            if (tweetInteractMoreMenu.hidden) {
                tweetInteractMoreMenu.hidden = false;
            }
            if (moreClicked) return;
            moreClicked = true;
            setTimeout(() => {
                document.body.addEventListener(
                    "click",
                    () => {
                        moreClicked = false;
                        setTimeout(
                            () => (tweetInteractMoreMenu.hidden = true),
                            50
                        );
                    },
                    { once: true }
                );
            }, 50);
        });
        if (tweetInteractMoreMenuFollow)
            tweetInteractMoreMenuFollow.addEventListener("click", async () => {
                if (t.user.following) {
                    try {
                        await API.user.unfollow(t.user.screen_name);
                    } catch (e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    t.user.following = false;
                    tweetInteractMoreMenuFollow.innerText = followUserText;
                    let event = new CustomEvent("tweetAction", {
                        detail: {
                            action: "unfollow",
                            tweet: t,
                        },
                    });
                    document.dispatchEvent(event);
                } else {
                    try {
                        await API.user.follow(t.user.screen_name);
                    } catch (e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    t.user.following = true;
                    tweetInteractMoreMenuFollow.innerText = unfollowUserText;
                    let event = new CustomEvent("tweetAction", {
                        detail: {
                            action: "follow",
                            tweet: t,
                        },
                    });
                    document.dispatchEvent(event);
                }
                chrome.storage.local.set(
                    { tweetReplies: {}, tweetDetails: {} },
                    () => {}
                );
            });
        if (tweetInteractMoreMenuBlock)
            tweetInteractMoreMenuBlock.addEventListener("click", async () => {
                if (t.user.blocking) {
                    await API.user.unblock(t.user.id_str);
                    t.user.blocking = false;
                    if (LOC.block_user.message.includes("$SCREEN_NAME$")) {
                        tweetInteractMoreMenuBlock.innerText =
                            LOC.block_user.message.replace(
                                "$SCREEN_NAME$",
                                t.user.screen_name
                            );
                    } else {
                        tweetInteractMoreMenuBlock.innerText = `${LOC.block_user.message} @${t.user.screen_name}`;
                    }
                    tweetInteractMoreMenuFollow.hidden = false;
                    let event = new CustomEvent("tweetAction", {
                        detail: {
                            action: "unblock",
                            tweet: t,
                        },
                    });
                    document.dispatchEvent(event);
                } else {
                    let blockMessage;
                    if (LOC.block_sure.message.includes("$SCREEN_NAME$")) {
                        blockMessage = LOC.block_sure.message.replace(
                            "$SCREEN_NAME$",
                            t.user.screen_name
                        );
                    } else {
                        blockMessage = `${LOC.block_sure.message} @${t.user.screen_name}?`;
                    }
                    let c = confirm(blockMessage);
                    if (!c) return;
                    await API.user.block(t.user.id_str);
                    t.user.blocking = true;
                    if (LOC.unblock_user.message.includes("$SCREEN_NAME$")) {
                        tweetInteractMoreMenuBlock.innerText =
                            LOC.unblock_user.message.replace(
                                "$SCREEN_NAME$",
                                t.user.screen_name
                            );
                    } else {
                        tweetInteractMoreMenuBlock.innerText = `${LOC.unblock_user.message} @${t.user.screen_name}`;
                    }
                    tweetInteractMoreMenuFollow.hidden = true;
                    t.user.following = false;
                    tweetInteractMoreMenuFollow.innerText = followUserText;
                    let event = new CustomEvent("tweetAction", {
                        detail: {
                            action: "block",
                            tweet: t,
                        },
                    });
                    document.dispatchEvent(event);
                }
                chrome.storage.local.set(
                    { tweetReplies: {}, tweetDetails: {} },
                    () => {}
                );
            });
        if (tweetInteractMoreMenuMuteUser)
            tweetInteractMoreMenuMuteUser.addEventListener(
                "click",
                async () => {
                    if (t.user.muting) {
                        await API.user.unmute(t.user.id_str);
                        t.user.muting = false;
                        tweetInteractMoreMenuMuteUser.innerText =
                            LOC.mute_user.message.replace(
                                "$SCREEN_NAME$",
                                t.user.screen_name
                            );

                        toast.info(
                            LOC.unmuted_user.message.replace(
                                "$SCREEN_NAME$",
                                t.user.screen_name
                            )
                        );
                    } else {
                        await API.user.mute(t.user.id_str);
                        t.user.muting = true;
                        tweetInteractMoreMenuMuteUser.innerText =
                            LOC.unmute_user.message.replace(
                                "$SCREEN_NAME$",
                                t.user.screen_name
                            );

                        toast.info(
                            LOC.muted_user.message.replace(
                                "$SCREEN_NAME$",
                                t.user.screen_name
                            )
                        );
                    }
                    chrome.storage.local.set(
                        { tweetReplies: {}, tweetDetails: {} },
                        () => {}
                    );
                }
            );
        tweetInteractMoreMenuCopy.addEventListener("click", () => {
            navigator.clipboard.writeText(
                `https://${vars.copyLinksAs}/${t.user.screen_name}/status/${t.id_str}`
            );
        });
        if (tweetInteractMoreMenuCopyTweetId)
            tweetInteractMoreMenuCopyTweetId.addEventListener("click", () => {
                navigator.clipboard.writeText(t.id_str);
            });
        if (tweetInteractMoreMenuCopyUserId)
            tweetInteractMoreMenuCopyUserId.addEventListener("click", () => {
                navigator.clipboard.writeText(t.user.id_str);
            });
        if (tweetInteractMoreMenuShare)
            tweetInteractMoreMenuShare.addEventListener("click", () => {
                navigator.share({
                    url: `https://${location.hostname}/${t.user.screen_name}/status/${t.id_str}`,
                });
            });
        tweetInteractMoreMenuShareDMs.addEventListener("click", () => {
            tweetUrlToShareInDMs = `https://${location.hostname}/${t.user.screen_name}/status/${t.id_str}`;
            document.getElementById("messages").click();
            setTimeout(() => {
                let title = document.querySelector(
                    "div.inbox h1.nice-header.larger"
                );
                title.innerText = LOC.share_tweet_to.message;
            });
        });
        tweetInteractMoreMenuNewtwitter.addEventListener("click", () => {
            openInNewTab(
                `/${t.user.screen_name}/status/${t.id_str}?newtwitter=true`
            );
        });
        tweetInteractMoreMenuEmbed.addEventListener("click", () => {
            openInNewTab(
                `https://publish.${location.hostname}/?query=https://${location.hostname}/${t.user.screen_name}/status/${t.id_str}&widget=tweet`
            );
        });
        if (t.user.id_str === user.id_str) {
            tweetInteractMoreMenuAnalytics.addEventListener("click", () => {
                openInNewTab(
                    `https://${location.hostname}/${t.user.screen_name}/status/${t.id_str}/analytics?newtwitter=true`
                );
            });
            tweetInteractMoreMenuDelete.addEventListener("click", async () => {
                let sure = confirm(LOC.delete_sure.message);
                if (!sure) return;
                try {
                    await API.tweet.delete(t.id_str);
                } catch (e) {
                    alert(e);
                    console.error(e);
                    return;
                }
                chrome.storage.local.set(
                    { tweetReplies: {}, tweetDetails: {} },
                    () => {}
                );
                Array.from(
                    document.querySelectorAll(
                        `div.tweet[data-tweet-id="${t.id_str}"]`
                    )
                ).forEach((tweet) => {
                    tweet.remove();
                });
                if (options.mainTweet) {
                    let tweets = Array.from(
                        document.getElementsByClassName("tweet")
                    );
                    if (tweets.length === 0) {
                        location.href = "/home";
                    } else {
                        location.href =
                            tweets[0].getElementsByClassName(
                                "tweet-time"
                            )[0].href;
                    }
                }
                if (typeof timeline !== "undefined") {
                    timeline.data = timeline.data.filter(
                        (tweet) => tweet.id_str !== t.id_str
                    );
                }
                if (options.after && !options.disableAfterReplyCounter) {
                    if (
                        options.after.getElementsByClassName(
                            "tweet-self-thread-div"
                        )[0]
                    )
                        options.after.getElementsByClassName(
                            "tweet-self-thread-div"
                        )[0].hidden = true;
                    if (!options.after.classList.contains("tweet-main"))
                        options.after.getElementsByClassName(
                            "tweet-interact-reply"
                        )[0].innerText = (
                            +options.after.getElementsByClassName(
                                "tweet-interact-reply"
                            )[0].innerText - 1
                        ).toString();
                    else
                        options.after.getElementsByClassName(
                            "tweet-footer-stat-replies"
                        )[0].innerText = (
                            +options.after.getElementsByClassName(
                                "tweet-footer-stat-replies"
                            )[0].innerText - 1
                        ).toString();
                }
                if (typeof fixTweetThreadLine !== "undefined")
                    setTimeout(fixTweetThreadLine, 100);
            });
            if (tweetInteractMoreMenuPin)
                tweetInteractMoreMenuPin.addEventListener("click", async () => {
                    if (pinnedTweet && pinnedTweet.id_str === t.id_str) {
                        await API.tweet.unpin(t.id_str);
                        pinnedTweet = null;
                        tweet.remove();
                        let tweetTime = new Date(t.created_at).getTime();
                        let beforeTweet = Array.from(
                            document.getElementsByClassName("tweet")
                        ).find((i) => {
                            let timestamp =
                                +i.getElementsByClassName("tweet-time")[0]
                                    .dataset.timestamp;
                            return timestamp < tweetTime;
                        });
                        if (beforeTweet) {
                            appendTweet(t, timelineContainer, {
                                after: beforeTweet,
                                disableAfterReplyCounter: true,
                            });
                        }
                        return;
                    } else {
                        await API.tweet.pin(t.id_str);
                        pinnedTweet = t;
                        let pinnedTweetElement = Array.from(
                            document.getElementsByClassName("tweet")
                        ).find((i) => {
                            let topText =
                                i.getElementsByClassName("tweet-top-text")[0];
                            return (
                                topText && topText.className.includes("pinned")
                            );
                        });
                        if (pinnedTweetElement) {
                            pinnedTweetElement.remove();
                        }
                        tweet.remove();
                        appendTweet(t, timelineContainer, {
                            prepend: true,
                            top: {
                                text: LOC.pinned_tweet.message,
                                icon: "\uf003",
                                color: "var(--link-color)",
                                class: "pinned",
                            },
                        });
                        return;
                    }
                });
        }
        tweetInteractMoreMenuRefresh.addEventListener("click", async () => {
            let tweetData;
            try {
                tweetData = await API.tweet.getV2(t.id_str);
            } catch (e) {
                console.error(e);
                return;
            }
            if (!tweetData) {
                return;
            }
            if (typeof timeline !== "undefined") {
                let tweetIndex = timeline.data.findIndex(
                    (tweet) => tweet.id_str === t.id_str
                );
                if (tweetIndex !== -1) {
                    timeline.data[tweetIndex] = tweetData;
                }
            }
            if (
                tweetInteractFavorite.className.includes(
                    "tweet-interact-favorited"
                ) &&
                !tweetData.favorited
            ) {
                tweetInteractFavorite.classList.remove(
                    "tweet-interact-favorited"
                );
            }
            if (
                tweetInteractRetweet.className.includes(
                    "tweet-interact-retweeted"
                ) &&
                !tweetData.retweeted
            ) {
                tweetInteractRetweet.classList.remove(
                    "tweet-interact-retweeted"
                );
            }
            if (
                !tweetInteractFavorite.className.includes(
                    "tweet-interact-favorited"
                ) &&
                tweetData.favorited
            ) {
                tweetInteractFavorite.classList.add("tweet-interact-favorited");
            }
            if (
                !tweetInteractRetweet.className.includes(
                    "tweet-interact-retweeted"
                ) &&
                tweetData.retweeted
            ) {
                tweetInteractRetweet.classList.add("tweet-interact-retweeted");
            }
            if (!options.mainTweet) {
                tweetInteractFavorite.innerText = tweetData.favorite_count;
                tweetInteractRetweet.innerText = tweetData.retweet_count;
                tweetInteractReply.innerText = tweetData.reply_count;
            }
            chrome.storage.local.set(
                { tweetReplies: {}, tweetDetails: {} },
                () => {}
            );
        });
        tweetInteractMoreMenuMute.addEventListener("click", async () => {
            if (t.conversation_muted) {
                await API.tweet.unmute(t.id_str);
                toast.info(LOC.unmuted_convo.message);
                t.conversation_muted = false;
                tweetInteractMoreMenuMute.innerText = LOC.mute_convo.message;
            } else {
                await API.tweet.mute(t.id_str);
                toast.info(LOC.muted_convo.message);
                t.conversation_muted = true;
                tweetInteractMoreMenuMute.innerText = LOC.unmute_convo.message;
            }
            chrome.storage.local.set(
                { tweetReplies: {}, tweetDetails: {} },
                () => {}
            );
        });
        let downloading = false;
        if (t.extended_entities && t.extended_entities.media.length > 0) {
            tweetInteractMoreMenuDownload.addEventListener("click", () => {
                if (downloading) return;
                downloading = true;
                t.extended_entities.media.forEach((item, index) => {
                    let url =
                        item.type === "photo"
                            ? item.media_url_https
                            : item.video_info.variants[0].url;
                    url = new URL(url);
                    if (item.type === "photo") {
                        url.searchParams.set("name", "orig"); // force original resolution
                    }
                    _fetch(url)
                        .then((res) => res.blob())
                        .then((blob) => {
                            downloading = false;
                            let a = document.createElement("a");
                            a.href = URL.createObjectURL(blob);

                            let ts = new Date(t.created_at)
                                .toISOString()
                                .split("T")[0];
                            let extension = url.pathname.split(".").pop();
                            let _index =
                                t.extended_entities.media.length > 1
                                    ? "_" + (index + 1)
                                    : "";
                            let filename = `${t.user.screen_name}_${ts}_${t.id_str}${_index}.${extension}`;
                            let filename_template = vars.customDownloadTemplate;

                            // use the filename from the user's custom download template, if any
                            if (
                                filename_template &&
                                filename_template.length > 0
                            ) {
                                const filesave_map = {
                                    user_screen_name: t.user.screen_name,
                                    user_name: t.user.name,
                                    extension: extension,
                                    timestamp: ts,
                                    id: t.id_str,
                                    index: _index,
                                    filename: url.pathname.substring(
                                        url.pathname.lastIndexOf("/") + 1,
                                        url.pathname.lastIndexOf(".")
                                    ),
                                };
                                filename = filename_template.replace(
                                    /\{([\w]+)\}/g,
                                    (_, key) => filesave_map[key]
                                );
                            }

                            a.download = filename;
                            a.click();
                            a.remove();
                        })
                        .catch((e) => {
                            downloading = false;
                            console.error(e);
                        });
                });
            });
        }
        if (
            t.extended_entities &&
            t.extended_entities.media.some((m) => m.type === "animated_gif")
        ) {
            tweetInteractMoreMenuDownloadGifs.forEach((dgb) =>
                dgb.addEventListener("click", (e) => {
                    if (downloading) return;
                    downloading = true;
                    let n = parseInt(e.target.dataset.gifno) - 1;
                    let videos = Array.from(
                        tweet.getElementsByClassName("tweet-media-gif")
                    );
                    let video = videos[n];
                    let canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    let ctx = canvas.getContext("2d");
                    if (video.duration > 10 && !confirm(LOC.long_vid.message)) {
                        return (downloading = false);
                    }
                    let mde =
                        tweet.getElementsByClassName("tweet-media-data")[0];
                    mde.innerText = LOC.initialization.message + "...";
                    let gif = new GIF({
                        workers: 4,
                        quality: 15,
                        debug: true,
                        workerScript: window.gifWorkerUrl,
                    });
                    video.currentTime = 0;
                    video.loop = false;
                    let isFirst = true;
                    let step = 50;
                    let interval = setInterval(async () => {
                        if (isFirst) {
                            video.currentTime = 0;
                            isFirst = false;
                            await sleep(5);
                        }
                        mde.innerText = `${
                            LOC.initialization.message
                        }... (${Math.round(
                            ((video.currentTime / video.duration) * 100) | 0
                        )}%)`;
                        if (video.currentTime + step / 1000 >= video.duration) {
                            clearInterval(interval);
                            gif.on("working", (frame, frames) => {
                                mde.innerText = `${LOC.converting.message}... (${frame}/${frames})`;
                            });
                            gif.on("finished", (blob) => {
                                mde.innerText = "";
                                let a = document.createElement("a");
                                a.href = URL.createObjectURL(blob);

                                let ts = new Date(t.created_at)
                                    .toISOString()
                                    .split("T")[0];
                                let extension = "gif";
                                let _index =
                                    t.extended_entities.media.length > 1
                                        ? "_" + (index + 1)
                                        : "";
                                let filename = `${t.user.screen_name}_${ts}_${t.id_str}${_index}.${extension}`;
                                let filename_template =
                                    vars.customDownloadTemplate;

                                // use the filename from the user's custom download template, if any
                                if (
                                    filename_template &&
                                    filename_template.length > 0
                                ) {
                                    const filesave_map = {
                                        user_screen_name: t.user.screen_name,
                                        user_name: t.user.name,
                                        extension: extension,
                                        timestamp: ts,
                                        id: t.id_str,
                                        index: _index,
                                        filename: url.pathname.substring(
                                            url.pathname.lastIndexOf("/") + 1,
                                            url.pathname.lastIndexOf(".")
                                        ),
                                    };
                                    filename = filename_template.replace(
                                        /\{([\w]+)\}/g,
                                        (_, key) => filesave_map[key]
                                    );
                                }
                                a.download = filename;

                                document.body.append(a);
                                a.click();
                                a.remove();
                                downloading = false;
                                video.loop = true;
                                video.play();
                            });
                            gif.render();
                            return;
                        }
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        let imgData = ctx.getImageData(
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );
                        gif.addFrame(imgData, { delay: step });
                    }, step);
                })
            );
        }
        if (tweetInteractMoreMenuFeedbacks)
            tweetInteractMoreMenuFeedbacks.forEach((feedbackButton) => {
                let feedback = t.feedback[feedbackButton.dataset.index];
                if (!feedback) return;
                feedbackButton.addEventListener("click", () => {
                    chrome.storage.local.remove(["algoTimeline"], () => {});
                    if (
                        feedback.richBehavior &&
                        feedback.richBehavior.markNotInterestedTopic
                    ) {
                        fetch(
                            `/i/api/graphql/OiKldXdrDrSjh36WO9_3Xw/TopicNotInterested`,
                            {
                                method: "post",
                                headers: {
                                    "content-type": "application/json",
                                    authorization:
                                        OLDTWITTER_CONFIG.public_token,
                                    "x-twitter-active-user": "yes",
                                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                                    "x-twitter-auth-type": "OAuth2Session",
                                },
                                body: JSON.stringify({
                                    variables: {
                                        topicId:
                                            feedback.richBehavior
                                                .markNotInterestedTopic.topicId,
                                        undo: false,
                                    },
                                    queryId: "OiKldXdrDrSjh36WO9_3Xw",
                                }),
                                credentials: "include",
                            }
                        )
                            .then((i) => i.json())
                            .then(() => {});
                    }
                    fetch(`/i/api${feedback.feedbackUrl}`, {
                        method: "post",
                        headers: {
                            "content-type": "application/x-www-form-urlencoded",
                            authorization: OLDTWITTER_CONFIG.public_token,
                            "x-twitter-active-user": "yes",
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": "OAuth2Session",
                        },
                        body: `feedback_type=${feedback.feedbackType}&feedback_metadata=${t.feedbackMetadata}&undo=false`,
                        credentials: "include",
                    })
                        .then((i) => i.json())
                        .then((i) => {
                            alert(
                                feedback.confirmation
                                    ? feedback.confirmation
                                    : LOC.feedback_thanks.message
                            );
                            tweet.remove();
                        });
                });
            });

        if (options.noInsert) {
            return tweet;
        }

        if (options.after) {
            options.after.after(tweet);
        } else if (options.before) {
            options.before.before(tweet);
        } else if (options.prepend) {
            timelineContainer.prepend(tweet);
        } else {
            timelineContainer.append(tweet);
        }
        if (vars.enableTwemoji) twemoji.parse(tweet);
        return tweet;
    } catch (e) {
        console.error(e);
        if (Date.now() - lastTweetErrorDate > 1000) {
            lastTweetErrorDate = Date.now();
            createModal(`
                <div style="max-width:700px">
                    <span style="font-size:14px;color:var(--default-text-color)">
                        <h2 style="margin-top: 0">${
                            LOC.something_went_wrong.message
                        }</h2>
                        ${LOC.tweet_error.message}<br>
                        ${LOC.error_instructions.message
                            .replace(
                                "$AT1$",
                                "<a target='_blank' href='https://github.com/dimdenGD/OldTwitter/issues'>"
                            )
                            .replace(/\$AT2\$/g, "</a>")
                            .replace(
                                "$AT3$",
                                "<a target='_blank' href='mailto:admin@dimden.dev'>"
                            )}
                    </span>
                    <div class="box" style="font-family:monospace;line-break: anywhere;padding:5px;margin-top:5px;background:rgba(255, 0, 0, 0.1);color:#ff4545">
                        ${escapeHTML(e.stack ? e.stack : String(e))} at ${
                t.id_str
            } (OldTwitter v${chrome.runtime.getManifest().version})
                    </div>
                </div>
            `);
        }
        return null;
    }
}
let lastNotificationErrorDate = 0;
const iconClasses = {
    heart_icon: "ni-favorite",
    person_icon: "ni-follow",
    retweet_icon: "ni-retweet",
    recommendation_icon: "ni-recommend",
    lightning_bolt_icon: "ni-bolt",
    bird_icon: "ni-twitter",
    security_alert_icon: "ni-alert",
    bell_icon: "ni-bell",
    list_icon: "ni-list",
    milestone_icon: "ni-milestone",
};
let aRegex = /<a[^>]*>([\s\S]*?)<\/a>/g;
let replacerLocs;
function renderNotification(n, options = {}) {
    if (typeof n !== "object") {
        console.error("Notification is undefined", t);
        return;
    }

    try {
        let notification = document.createElement("div");
        notification.className = "notification";
        notification.dataset.notificationId = n.id;

        if (options.unread) {
            notification.classList.add("notification-unread");
        }

        let notificationHeader = n.message.text;
        if (n.message.entities) {
            let additionalLength = 0;
            let matches = 0;
            n.message.entities.forEach((e) => {
                if (!e.ref || !e.ref.user) return;
                let user = n.users[e.ref.user.id];
                notificationHeader = Array.from(notificationHeader);
                notificationHeader = arrayInsert(
                    notificationHeader,
                    e.toIndex + additionalLength,
                    "</a>"
                );
                notificationHeader = arrayInsert(
                    notificationHeader,
                    e.fromIndex + additionalLength,
                    `<a href="/dimden">`
                );
                notificationHeader = notificationHeader.join("");
                additionalLength += `<a href="/dimden"></a>`.length;
                let mi = 0;
                let newText = notificationHeader.replace(aRegex, (_, m) => {
                    if (mi++ !== matches) return _;
                    return `<a href="/${escapeHTML(user.screen_name)}"${
                        user.verified ? 'class="user-verified"' : ""
                    }>${escapeHTML(m)}</a>`;
                });
                additionalLength += newText.length - notificationHeader.length;
                notificationHeader = newText;
                matches++;
            });
        }

        notification.addEventListener("click", (e) => {
            if (
                e.target.closest(".notification") &&
                e.target.tagName !== "IMG" &&
                e.target.tagName !== "A" &&
                e.target.className !== "notification-feedback"
            ) {
                if (n.icon.id === "bell_icon") {
                    let a = document.createElement("a");
                    a.href = `/i/timeline?page=device_follow&nid=${n.id}`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else if (n.icon.id === "heart_icon") {
                    if (
                        n.entry.clientEventInfo.element ===
                        "user_liked_multiple_tweets"
                    ) {
                        let a = document.createElement("a");
                        a.href = `/i/timeline?page=likes&nid=${n.id}`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                    } else {
                        new TweetViewer(
                            user,
                            n.tweet.retweeted_status
                                ? n.tweet.retweeted_status
                                : n.tweet
                        );
                    }
                } else if (
                    n.entry.clientEventInfo.element ===
                    "users_added_you_to_lists"
                ) {
                    let a = document.createElement("a");
                    a.href = `/i/timeline?page=lists&nid=${n.id}`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else if (n.icon.id === "list_icon") {
                    let a = document.createElement("a");
                    a.href = n.entry.content.notification.url.url;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else if (
                    n.entry.clientEventInfo.element === "users_followed_you" ||
                    n.entry.clientEventInfo.element ===
                        "follow_from_recommended_user"
                ) {
                    let a = document.createElement("a");
                    a.href = `/${user.screen_name}/followers`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else if (n.icon.id === "milestone_icon") {
                    //this is such a stupid way to implement it but it works
                    document.getElementById("navbar-tweet-button").click();
                    setTimeout(async () => {
                        document.getElementsByClassName(
                            "navbar-new-tweet-text"
                        )[0].value = LOC.anniversary_tweet.message;

                        let userJoinYear = new Date(
                            user.created_at
                        ).getFullYear();
                        let currentYear = new Date().getFullYear();
                        let yearsSinceJoin = currentYear - userJoinYear;
                        let anniversaryPicUrl = `https://ton.twimg.com/ntab_public/twitterversary/year${yearsSinceJoin}.jpg`;
                        let anniversaryPicBlob = await (
                            await fetch(anniversaryPicUrl)
                        ).blob();
                        let anniversaryPicFile = new File(
                            [anniversaryPicBlob],
                            `year${yearsSinceJoin}.jpg`,
                            { type: "image/jpeg" }
                        );

                        mediaToUpload = [];
                        handleFiles(
                            [anniversaryPicFile],
                            mediaToUpload,
                            document.getElementsByClassName(
                                "navbar-new-tweet-media-c"
                            )[0]
                        );
                    }, 10);
                } else if (n.tweet && n.tweet.user) {
                    new TweetViewer(
                        user,
                        n.tweet.retweeted_status
                            ? n.tweet.retweeted_status
                            : n.tweet
                    );
                } else if (n.entry.content.notification.url) {
                    //this should always be last because most (if not all) notifications have a url for good measure
                    let url = new URL(n.entry.content.notification.url.url);
                    url.searchParams.append("newtwitter", true);

                    openInNewTab(url.href);
                }
            }
        });
        notification.addEventListener("mousedown", (e) => {
            if (
                e.target.tagName === "A" ||
                e.target.className === "notification-avatar-img"
            ) {
                let url = new URL(e.target.href);
                if (isProfilePath(url.pathname)) {
                    return;
                }
            }
            if (e.button === 1) {
                e.preventDefault();
                if (n.icon.id === "bell_icon") {
                    openInNewTab(`/i/timeline?page=device_follow&nid=${n.id}`);
                } else if (n.icon.id === "heart_icon") {
                    openInNewTab(`/i/timeline?page=likes&nid=${n.id}`);
                } else if (
                    n.entry.clientEventInfo.element ===
                    "users_added_you_to_lists"
                ) {
                    openInNewTab(`/i/timeline?page=lists&nid=${n.id}`);
                } else if (n.icon.id === "list_icon") {
                    openInNewTab(n.entry.content.notification.url.url);
                } else if (
                    n.entry.clientEventInfo.element === "users_followed_you"
                ) {
                    openInNewTab(`/${user.screen_name}/followers`);
                } else if (
                    e.target.closest(".notification") &&
                    e.target.tagName !== "IMG"
                ) {
                    if (n.tweet.retweeted_status) {
                        openInNewTab(
                            `/${n.tweet.retweeted_status.user.screen_name}/status/${n.tweet.retweeted_status.id_str}`
                        );
                    } else {
                        openInNewTab(
                            `/${n.tweet.user.screen_name}/status/${n.tweet.id_str}`
                        );
                    }
                }
            }
        });
        for (let i in n.users) {
            if (!userStorage[i]) userStorage[i] = n.users[i];
        }

        let users = n.template.aggregateUserActionsV1.fromUsers.map(
            (u) => n.users[u.user.id]
        );
        if (n.icon.id === "recommendation_icon") {
            notificationHeader = `<b><a href="/${
                users[0] ? users[0].screen_name : "#"
            }">${escapeHTML(notificationHeader)}</a></b>`;
        }
        if (!iconClasses[n.icon.id]) {
            console.log(
                `Unsupported icon: "${n.icon.id}". Report it to https://github.com/dimdenGD/OldTwitter/issues`
            );
        }
        if (n.icon.id === "heart_icon" && !vars.heartsNotStars) {
            LOC.replacer_liked_to_favorited.message.split("|").forEach((el) => {
                notificationHeader = notificationHeader.replace(
                    new RegExp(el.split("->")[0], "g"),
                    el.split("->")[1]
                );
            });
        }
        if (n.icon.id === "milestone_icon") {
            notificationHeader = notificationHeader.replace(
                "X anniversary",
                "Twitter anniversary"
            );
        }
        LOC.replacer_repost_to_retweet.message.split("|").forEach((el) => {
            notificationHeader = notificationHeader.replace(
                new RegExp(el.split("->")[0], "g"),
                el.split("->")[1]
            );
        });
        LOC.replacer_post_to_tweet.message.split("|").forEach((el) => {
            notificationHeader = notificationHeader.replace(
                new RegExp(el.split("->")[0], "g"),
                el.split("->")[1]
            );
        });
        notification.innerHTML = html`
            <div class="notification-icon ${iconClasses[n.icon.id]}"></div>
            <div class="notification-header">
                ${notificationHeader}
                ${n.feedback
                    ? `<span class="notification-feedback">[${n.feedback.prompt}]</span>`
                    : ""}
            </div>
            <div class="notification-text">
                ${escapeHTML(
                    n.tweet.full_text.replace(
                        /^(@[\w+]{1,15}\b\s)((@[\w+]{1,15}\b\s)+)/g,
                        "$1"
                    )
                )}
            </div>
            <div class="notification-avatars">
                ${users
                    .map(
                        (u) =>
                            `<a class="notification-avatar" href="/${
                                u.screen_name
                            }"><img class="notification-avatar-img" src="${`${
                                !u.profile_image_url_https &&
                                vars.useOldDefaultProfileImage
                                    ? chrome.runtime.getURL(
                                          `images/default_profile_images/default_profile_${
                                              Number(u.id_str) % 7
                                          }_normal.png`
                                      )
                                    : u.profile_image_url_https
                            }`.replace(
                                "_normal",
                                "_bigger"
                            )}" alt="${escapeHTML(
                                u.name
                            )}" width="32" height="32"></a>`
                    )
                    .join("")}
            </div>
        `;
        let notifText = notification.querySelector(".notification-text");
        if (n.tweet.entities && n.tweet.entities.urls) {
            for (let url of n.tweet.entities.urls) {
                notifText.innerText = notifText.innerText.replace(
                    new RegExp(url.url, "g"),
                    url.display_url
                );
            }
        }

        if (n.feedback) {
            let feedbackBtn = notification.querySelector(
                ".notification-feedback"
            );
            feedbackBtn.addEventListener("click", () => {
                fetch(
                    "/i/api/2/notifications/feedback.json?" +
                        n.feedback.feedbackUrl.split("?").slice(1).join("?"),
                    {
                        headers: {
                            authorization: OLDTWITTER_CONFIG.public_token,
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "content-type": "application/x-www-form-urlencoded",
                            "x-twitter-auth-type": "OAuth2Session",
                            "x-twitter-client-language":
                                LANGUAGE || navigator.language,
                            "x-twitter-active-user": "yes",
                        },
                        method: "post",
                        credentials: "include",
                        body: `feedback_type=${n.feedback.feedbackType}&feedback_metadata=${n.feedback.metadata}&undo=false`,
                    }
                )
                    .then((i) => i.text())
                    .then((i) => {
                        notification.remove();
                        let confirmation = n.feedback.confirmation;
                        confirmation = confirmation.replace(
                            /\bX\b/g,
                            LOC.twitter.message
                        ); //replace X (by itself) in a string with Twitter (wont replace X in a word but that wouldnt happen anyways)
                        alert(confirmation);
                    });
            });
        }

        if (vars.enableTwemoji) twemoji.parse(notification);

        return notification;
    } catch (e) {
        console.error(e);
        if (Date.now() - lastNotificationErrorDate > 1000) {
            lastNotificationErrorDate = Date.now();
            createModal(`
                <div style="max-width:700px">
                    <span style="font-size:14px;color:var(--default-text-color)">
                        <h2 style="margin-top: 0">${
                            LOC.something_went_wrong.message
                        }</h2>
                        ${LOC.notifications_error.message}<br>
                        ${LOC.error_instructions.message
                            .replace(
                                "$AT1$",
                                "<a target='_blank' href='https://github.com/dimdenGD/OldTwitter/issues'>"
                            )
                            .replace(/\$AT2\$/g, "</a>")
                            .replace(
                                "$AT3$",
                                "<a target='_blank' href='mailto:admin@dimden.dev'>"
                            )}
                    </span>
                    <div class="box" style="font-family:monospace;line-break: anywhere;padding:5px;margin-top:5px;background:rgba(255, 0, 0, 0.1);color:#ff4545">
                        ${escapeHTML(
                            e.stack ? e.stack : String(e)
                        )} (OldTwitter v${chrome.runtime.getManifest().version})
                    </div>
                </div>
            `);
        }
        return null;
    }
}

function replaceAll(str, find, replace) {
    return str.split(find).join(replace);
}
