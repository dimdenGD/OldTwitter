const linkRegex = /(\s|^)(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,60}\.(삼성|닷컴|닷넷|香格里拉|餐厅|食品|飞利浦|電訊盈科|集团|通販|购物|谷歌|诺基亚|联通|网络|网站|网店|网址|组织机构|移动|珠宝|点看|游戏|淡马锡|机构|書籍|时尚|新闻|政府|政务|招聘|手表|手机|我爱你|慈善|微博|广东|工行|家電|娱乐|天主教|大拿|大众汽车|在线|嘉里大酒店|嘉里|商标|商店|商城|公益|公司|八卦|健康|信息|佛山|企业|亚马逊|中文网|中信|世界|ポイント|ファッション|セール|ストア|コム|グーグル|クラウド|アマゾン|みんな|คอม|संगठन|नेट|कॉम|همراه|موقع|موبايلي|كوم|كاثوليك|عرب|شبكة|بيتك|بازار|العليان|ارامكو|اتصالات|ابوظبي|קום|сайт|рус|орг|онлайн|москва|ком|католик|дети|zuerich|zone|zippo|zip|zero|zara|zappos|yun|youtube|you|yokohama|yoga|yodobashi|yandex|yamaxun|yahoo|yachts|xyz|xxx|xperia|xin|xihuan|xfinity|xerox|xbox|wtf|wtc|wow|world|works|work|woodside|wolterskluwer|wme|winners|wine|windows|win|williamhill|wiki|wien|whoswho|weir|weibo|wedding|wed|website|weber|webcam|weatherchannel|weather|watches|watch|warman|wanggou|wang|walter|walmart|wales|vuelos|voyage|voto|voting|vote|volvo|volkswagen|vodka|vlaanderen|vivo|viva|vistaprint|vista|vision|visa|virgin|vip|vin|villas|viking|vig|video|viajes|vet|versicherung|vermögensberatung|vermögensberater|verisign|ventures|vegas|vanguard|vana|vacations|ups|uol|uno|university|unicom|uconnect|ubs|ubank|tvs|tushu|tunes|tui|tube|trv|trust|travelersinsurance|travelers|travelchannel|travel|training|trading|trade|toys|toyota|town|tours|total|toshiba|toray|top|tools|tokyo|today|tmall|tkmaxx|tjx|tjmaxx|tirol|tires|tips|tiffany|tienda|tickets|tiaa|theatre|theater|thd|teva|tennis|temasek|telefonica|telecity|tel|technology|tech|team|tdk|tci|taxi|tax|tattoo|tatar|tatamotors|target|taobao|talk|taipei|tab|systems|symantec|sydney|swiss|swiftcover|swatch|suzuki|surgery|surf|support|supply|supplies|sucks|style|study|studio|stream|store|storage|stockholm|stcgroup|stc|statoil|statefarm|statebank|starhub|star|staples|stada|srt|srl|spreadbetting|spot|sport|spiegel|space|soy|sony|song|solutions|solar|sohu|software|softbank|social|soccer|sncf|smile|smart|sling|skype|sky|skin|ski|site|singles|sina|silk|shriram|showtime|show|shouji|shopping|shop|shoes|shiksha|shia|shell|shaw|sharp|shangrila|sfr|sexy|sex|sew|seven|ses|services|sener|select|seek|security|secure|seat|search|scot|scor|scjohnson|science|schwarz|schule|school|scholarships|schmidt|schaeffler|scb|sca|sbs|sbi|saxo|save|sas|sarl|sapo|sap|sanofi|sandvikcoromant|sandvik|samsung|samsclub|salon|sale|sakura|safety|safe|saarland|ryukyu|rwe|run|ruhr|rugby|rsvp|room|rogers|rodeo|rocks|rocher|rmit|rip|rio|ril|rightathome|ricoh|richardli|rich|rexroth|reviews|review|restaurant|rest|republican|report|repair|rentals|rent|ren|reliance|reit|reisen|reise|rehab|redumbrella|redstone|red|recipes|realty|realtor|realestate|read|raid|radio|racing|qvc|quest|quebec|qpon|pwc|pub|prudential|pru|protection|property|properties|promo|progressive|prof|productions|prod|pro|prime|press|praxi|pramerica|post|porn|politie|poker|pohl|pnc|plus|plumbing|playstation|play|place|pizza|pioneer|pink|ping|pin|pid|pictures|pictet|pics|piaget|physio|photos|photography|photo|phone|philips|phd|pharmacy|pfizer|pet|pccw|pay|passagens|party|parts|partners|pars|paris|panerai|panasonic|pamperedchef|page|ovh|ott|otsuka|osaka|origins|orientexpress|organic|org|orange|oracle|open|ooo|onyourside|online|onl|ong|one|omega|ollo|oldnavy|olayangroup|olayan|okinawa|office|off|observer|obi|nyc|ntt|nrw|nra|nowtv|nowruz|now|norton|northwesternmutual|nokia|nissay|nissan|ninja|nikon|nike|nico|nhk|ngo|nfl|nexus|nextdirect|next|news|newholland|new|neustar|network|netflix|netbank|net|nec|nba|navy|natura|nationwide|name|nagoya|nadex|nab|mutuelle|mutual|museum|mtr|mtpc|mtn|msd|movistar|movie|mov|motorcycles|moto|moscow|mortgage|mormon|mopar|montblanc|monster|money|monash|mom|moi|moe|moda|mobily|mobile|mobi|mma|mls|mlb|mitsubishi|mit|mint|mini|mil|microsoft|miami|metlife|merckmsd|meo|menu|men|memorial|meme|melbourne|meet|media|med|mckinsey|mcdonalds|mcd|mba|mattel|maserati|marshalls|marriott|markets|marketing|market|map|mango|management|man|makeup|maison|maif|madrid|macys|luxury|luxe|lupin|lundbeck|ltda|ltd|lplfinancial|lpl|love|lotto|lotte|london|lol|loft|locus|locker|loans|loan|llp|llc|lixil|living|live|lipsy|link|linde|lincoln|limo|limited|lilly|like|lighting|lifestyle|lifeinsurance|life|lidl|liaison|lgbt|lexus|lego|legal|lefrak|leclerc|lease|lds|lawyer|law|latrobe|latino|lat|lasalle|lanxess|landrover|land|lancome|lancia|lancaster|lamer|lamborghini|ladbrokes|lacaixa|kyoto|kuokgroup|kred|krd|kpn|kpmg|kosher|komatsu|koeln|kiwi|kitchen|kindle|kinder|kim|kia|kfh|kerryproperties|kerrylogistics|kerryhotels|kddi|kaufen|juniper|juegos|jprs|jpmorgan|joy|jot|joburg|jobs|jnj|jmp|jll|jlc|jio|jewelry|jetzt|jeep|jcp|jcb|java|jaguar|iwc|iveco|itv|itau|istanbul|ist|ismaili|iselect|irish|ipiranga|investments|intuit|international|intel|int|insure|insurance|institute|ink|ing|info|infiniti|industries|inc|immobilien|immo|imdb|imamat|ikano|iinet|ifm|ieee|icu|ice|icbc|ibm|hyundai|hyatt|hughes|htc|hsbc|how|house|hotmail|hotels|hoteles|hot|hosting|host|hospital|horse|honeywell|honda|homesense|homes|homegoods|homedepot|holiday|holdings|hockey|hkt|hiv|hitachi|hisamitsu|hiphop|hgtv|hermes|here|helsinki|help|healthcare|health|hdfcbank|hdfc|hbo|haus|hangout|hamburg|hair|guru|guitars|guide|guge|gucci|guardian|group|grocery|gripe|green|gratis|graphics|grainger|gov|got|gop|google|goog|goodyear|goodhands|goo|golf|goldpoint|gold|godaddy|gmx|gmo|gmbh|gmail|globo|global|gle|glass|glade|giving|gives|gifts|gift|ggee|george|genting|gent|gea|gdn|gbiz|gay|garden|gap|games|game|gallup|gallo|gallery|gal|fyi|futbol|furniture|fund|fun|fujixerox|fujitsu|ftr|frontier|frontdoor|frogans|frl|fresenius|free|fox|foundation|forum|forsale|forex|ford|football|foodnetwork|food|foo|fly|flsmidth|flowers|florist|flir|flights|flickr|fitness|fit|fishing|fish|firmdale|firestone|fire|financial|finance|final|film|fido|fidelity|fiat|ferrero|ferrari|feedback|fedex|fast|fashion|farmers|farm|fans|fan|family|faith|fairwinds|fail|fage|extraspace|express|exposed|expert|exchange|everbank|events|eus|eurovision|etisalat|esurance|estate|esq|erni|ericsson|equipment|epson|epost|enterprises|engineering|engineer|energy|emerck|email|education|edu|edeka|eco|eat|earth|dvr|dvag|durban|dupont|duns|dunlop|duck|dubai|dtv|drive|download|dot|doosan|domains|doha|dog|dodge|doctor|docs|dnp|diy|dish|discover|discount|directory|direct|digital|diet|diamonds|dhl|dev|design|desi|dentist|dental|democrat|delta|deloitte|dell|delivery|degree|deals|dealer|deal|dds|dclk|day|datsun|dating|date|data|dance|dad|dabur|cyou|cymru|cuisinella|csc|cruises|cruise|crs|crown|cricket|creditunion|creditcard|credit|cpa|courses|coupons|coupon|country|corsica|coop|cool|cookingchannel|cooking|contractors|contact|consulting|construction|condos|comsec|computer|compare|company|community|commbank|comcast|com|cologne|college|coffee|codes|coach|clubmed|club|cloud|clothing|clinique|clinic|click|cleaning|claims|cityeats|city|citic|citi|citadel|cisco|circle|cipriani|church|chrysler|chrome|christmas|chloe|chintai|cheap|chat|chase|charity|channel|chanel|cfd|cfa|cern|ceo|center|ceb|cbs|cbre|cbn|cba|catholic|catering|cat|casino|cash|caseih|case|casa|cartier|cars|careers|career|care|cards|caravan|car|capitalone|capital|capetown|canon|cancerresearch|camp|camera|cam|calvinklein|call|cal|cafe|cab|bzh|buzz|buy|business|builders|build|bugatti|budapest|brussels|brother|broker|broadway|bridgestone|bradesco|box|boutique|bot|boston|bostik|bosch|boots|booking|book|boo|bond|bom|bofa|boehringer|boats|bnpparibas|bnl|bmw|bms|blue|bloomberg|blog|blockbuster|blanco|blackfriday|black|biz|bio|bingo|bing|bike|bid|bible|bharti|bet|bestbuy|best|berlin|bentley|beer|beauty|beats|bcn|bcg|bbva|bbt|bbc|bayern|bauhaus|basketball|baseball|bargains|barefoot|barclays|barclaycard|barcelona|bar|bank|band|bananarepublic|banamex|baidu|baby|azure|axa|aws|avianca|autos|auto|author|auspost|audio|audible|audi|auction|attorney|athleta|associates|asia|asda|arte|art|arpa|army|archi|aramco|arab|aquarelle|apple|app|apartments|aol|anz|anquan|android|analytics|amsterdam|amica|amfam|amex|americanfamily|americanexpress|amazon|alstom|alsace|ally|allstate|allfinanz|alipay|alibaba|alfaromeo|akdn|airtel|airforce|airbus|aigo|aig|agency|agakhan|africa|afl|afamilycompany|aetna|aero|aeg|adult|ads|adac|actor|active|aco|accountants|accountant|accenture|academy|abudhabi|abogado|able|abc|abbvie|abbott|abb|abarth|aarp|aaa|onion)\b([-a-zA-Z0-9@:%_\+.~#?&/=]*)/gi;
const hashtagRegex = /(#|＃)([a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*[a-z_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f][a-z0-9_\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u024f\u0253-\u0254\u0256-\u0257\u0300-\u036f\u1e00-\u1eff\u0400-\u04ff\u0500-\u0527\u2de0-\u2dff\ua640-\ua69f\u0591-\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05d0-\u05ea\u05f0-\u05f4\ufb12-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4f\u0610-\u061a\u0620-\u065f\u066e-\u06d3\u06d5-\u06dc\u06de-\u06e8\u06ea-\u06ef\u06fa-\u06fc\u0750-\u077f\u08a2-\u08ac\u08e4-\u08fe\ufb50-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\u200c-\u200c\u0e01-\u0e3a\u0e40-\u0e4e\u1100-\u11ff\u3130-\u3185\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff\uffa1-\uffdc\u30a1-\u30fa\u30fc-\u30fe\uff66-\uff9f\uff10-\uff19\uff21-\uff3a\uff41-\uff5a\u3041-\u3096\u3099-\u309e\u3400-\u4dbf\u4e00-\u9fff\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2f800-\u2fa1f]*)/gi;

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function createModal(html, className, onclose) {
    let modal = document.createElement('div');
    modal.classList.add('modal');
    let modal_content = document.createElement('div');
    modal_content.classList.add('modal-content');
    if(className) modal_content.classList.add(className);
    modal_content.innerHTML = html;
    modal.appendChild(modal_content);
    let close = document.createElement('span');
    close.classList.add('modal-close');
    close.innerHTML = '&times;';
    document.body.style.overflowY = 'hidden';
    function removeModal() {
        modal.remove();
        let event = new Event('findActiveTweet');
        document.dispatchEvent(event);
        document.removeEventListener('keydown', escapeEvent);
        if(onclose) onclose();
        let modals = document.getElementsByClassName('modal');
        if(modals.length === 0) {
            document.body.style.overflowY = 'auto';
        }
    }
    modal.removeModal = removeModal;
    function escapeEvent(e) {
        if(document.querySelector('.viewer-in')) return;
        if(e.key === 'Escape' || (e.altKey && e.keyCode === 78)) {
            removeModal();
        }
    }
    close.addEventListener('click', removeModal);
    modal.addEventListener('click', e => {
        if(e.target === modal) {
            removeModal();
        }
    });
    document.addEventListener('keydown', escapeEvent);
    modal_content.appendChild(close);
    document.body.appendChild(modal);
    return modal;
}
function handleFiles(files, mediaArray, mediaContainer) {
    let images = [];
    let videos = [];
    let gifs = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.type.includes('gif')) {
            // max 15 mb
            if (file.size > 15000000) {
                return alert(LOC.gifs_max.message);
            }
            gifs.push(file);
        } else if (file.type.includes('video')) {
            // max 500 mb
            if (file.size > 500000000) {
                return alert(LOC.videos_max.message);
            }
            videos.push(file);
        } else if (file.type.includes('image')) {
            // max 5 mb
            if (file.size > 5000000) {
                return alert(LOC.images_max.message);
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
                base64Data.forEach(data => {
                    let div = document.createElement('div');
                    let img = document.createElement('img');
                    div.title = file.name;
                    div.id = `new-tweet-media-img-${Date.now()}${Math.random()}`.replace('.', '-');
                    div.className = "new-tweet-media-img-div";
                    img.className = "new-tweet-media-img";
                    let progress = document.createElement('span');
                    progress.hidden = true;
                    progress.className = "new-tweet-media-img-progress";
                    let remove = document.createElement('span');
                    remove.className = "new-tweet-media-img-remove";
                    let alt;
                    if (!file.type.includes('video')) {
                        alt = document.createElement('span');
                        alt.className = "new-tweet-media-img-alt";
                        alt.innerText = "ALT";
                        alt.addEventListener('click', () => {
                            mediaObject.alt = prompt(LOC.alt_text.message);
                        });
                    }
                    let dataBase64 = arrayBufferToBase64(data);
                    let mediaObject = {
                        div, img,
                        id: img.id,
                        data: data,
                        dataBase64: dataBase64,
                        type: file.type,
                        category: file.type.includes('gif') ? 'tweet_gif' : file.type.includes('video') ? 'tweet_video' : 'tweet_image'
                    };
                    mediaArray.push(mediaObject);
                    img.src = file.type.includes('video') ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAWUSURBVHhe7Z1pqG5THMbPNV1jul1TJEOZuqYMRZEpoRARvlw+uIjwASlRFIkMHwzJ8AVfZMhYOGRKESlDkciQyJhknj3PXu9b3nP2sPba9x3Wfp5f/dpr77p1zl7Ped+11l77f5fMz8/PGV3WGByNKA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOG3eC1gGl4ammXF+h9+HZj0xAdgC3gwPhw5AHjAAL8Kz4Re8UEVTANaCT8HDijOTGy9B9t1fxVkJTWOAneAhoWky5ADIPqykKQCbQA8U84V9xz6spKlzlwyOJl9q+9B/3eI4AOI0zQIOhs+H5iJeh3fBP4qzcjaDF8DNizPTls/gDfCH4qycDeBZcLfibDEcxL8QmotJDQA7fVf4QXFWz8nwvtA0LTkJPhCatewM34LrFGej1AYg9SvgF/hNaDby8eBo2vPp4NjEl5B90hqPAcRxAMRxAMRxAMRxAMRxAMRJDcCaA2NYe3A07Ym9d236Y4TUAGwET4VlCw//Z124MjRNAmfADUOzEnb8iZB90pouS8H/QC5A1C0FMwDcUWTS4YLbz6FZCgOwFaz6Yx7LUrDJh7EsBZue0KcA/Av/Dk0TS18CwIcm/KjbEV4Nf4Qmgr4E4ErIbdAfwUvhXvB+WLkb1gS6BICzAG5Y+KTG2EfGXVn42PRDeAo8AnLjSs5wplV2b4dy3z/7IokuATgHbtfg9vBuOA04JngOHgjPhJ/D3Lgdlt3XhV4Ek0gNAL9jH4RNg66f4J2hOTX4lgx/hj3gdbBuTj1r3At/C81KuA5zD0wa96QGgB0fO+L+c3CcNt/Bi+G+8BGYw4wh9t616Y8R+jIIbMN78AR4NHyTF5RRDADhoInvPO4Pz4NfQUlUAzCE36+3wN0h34D+FUqhHoAhX8Pz4X7wSZg8rcoNB2CUt+Ex8Hj4Li/0HQdgMRxNPwY5W+D8+lvYW1IDsD6Mfc6/zeCYG3zRgq9lcf3gDsj1hEnDRZ4YNoXsk9Z02Q/wDuRKVd3CysbwQrh1cTY+WL7m2dAcG/vAa+ChcFKvzXN2ciPkGKUK7spaBfmJVYbEhpBJBICwZA7HB1dBPnnMAW8IWY3w6SJf1twb3soLueMApMFnHJfBqFJss4wDkE4vyuc4AGlwqzafLLJ4ZtY4AO0Y7sF/A57OC7nTZRYwSyViJjEL4MDvWjjJaaBLxEQyzgBsCS+Hp8FJl8p1iZgpwpU1LmLxxnJL2TTqJLtEzBTg9/yx8DV4PayttJk7DsAo3BfwOHwYruCFvuMABDhYvQm+Co+CMvdFPQB8e/lcyH0A3Bq2HpRCNQD8vY+Er0BuBZOtZKoYgF3gQ/AJuCcvKJMaAI6UaQyzUiJmOeTyLRewjoOxP/80cYmY1QDn7yy1wvk8t3hx5SwXXCImkrKVQC7XchWMu3iqdsvkwFhLxHQZA/Dfcpl02xonVR9o4d65HSCXn5+GOXc+4X6/sns7lNvtkvuxSwBmiSsgV+/4QIQFIvi0juvo3MJlauhLAPhJ9CjkfP4SmPR9qEhfAmAScQDE6RKAWSoR02dcIkYYl4gRxyVixHGJGDNeHABxHABxHABxHABxHABxUgOgUCJmFuAiTwzyJWL6ikvEmM6MbUeQ6QEOgDhNAeB/umDyprYPmwLAKpkydXN7CPuuttJpUwDehy+HpskQDuDZh5U0zQIIN1zeBg+C0yiSYNrDsrbPQL7wyh1FlcQEYAgrYjkAecAARNUwbBMA00M8DRTHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHAZBmbu4/x6swK3hIFr4AAAAASUVORK5CYII=' : `data:${file.type};base64,${dataBase64}`;
                    remove.addEventListener('click', () => {
                        div.remove();
                        for (let i = mediaArray.length - 1; i >= 0; i--) {
                            let m = mediaArray[i];
                            if (m.id === img.id) mediaArray.splice(i, 1);
                        }
                    });
                    div.append(img, progress, remove);
                    if (!file.type.includes('video')) {
                        img.addEventListener('click', () => {
                            new Viewer(mediaContainer, {
                                transition: false
                            });
                        });
                        div.append(alt);
                    }
                    mediaContainer.append(div);
                });
            }
        }
    }
}
let isURL = (str) => {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}
function handleDrop(event, mediaArray, mediaContainer) {
    let text = event.dataTransfer.getData("Text").trim();
    if(text.length <= 1) {
        event.stopPropagation();
        event.preventDefault();
        let files = event.dataTransfer.files;
        handleFiles(files, mediaArray, mediaContainer);
    }
}
function getMedia(mediaArray, mediaContainer) {
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/png,image/jpeg,image/gif,video/mp4,video/mov';
    input.addEventListener('change', () => {
        handleFiles(input.files, mediaArray, mediaContainer);
    });
    input.click();
};
function getDMMedia(mediaArray, mediaContainer, modalElement) {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', async () => {
        let files = input.files;
        let images = [];
        let gifs = [];
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (file.type.includes('gif')) {
                // max 15 mb
                if (file.size > 15000000) {
                    return alert(LOC.gifs_max.message);
                }
                gifs.push(file);
            } else if (file.type.includes('image')) {
                // max 5 mb
                if (file.size > 5000000) {
                    return alert(LOC.images_max.message);
                }
                images.push(file);
            }
        }
        // get base64 data
        let media = [...images, ...gifs];
        let base64Data = [];
        for (let i = 0; i < media.length; i++) {
            let file = media[i];
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = () => {
                base64Data.push(reader.result);
                if (base64Data.length === media.length) {
                    mediaContainer.innerHTML = '';
                    while (mediaArray.length > 0) {
                        mediaArray.pop();
                    }
                    base64Data.forEach(data => {
                        let div = document.createElement('div');
                        let img = document.createElement('img');
                        div.title = file.name;
                        div.id = `new-tweet-media-img-${Date.now()}${Math.random()}`.replace('.', '-');
                        div.className = "new-tweet-media-img-div";
                        img.className = "new-tweet-media-img";
                        let progress = document.createElement('span');
                        progress.hidden = true;
                        progress.className = "new-tweet-media-img-progress";
                        let remove = document.createElement('span');
                        remove.className = "new-tweet-media-img-remove";
                        let dataBase64 = arrayBufferToBase64(data);
                        let mediaObject = {
                            div, img,
                            id: img.id,
                            data: data,
                            dataBase64: dataBase64,
                            type: file.type,
                            category: file.type.includes('gif') ? 'tweet_gif' : file.type.includes('video') ? 'tweet_video' : 'tweet_image'
                        };
                        mediaArray.push(mediaObject);
                        img.src = file.type.includes('video') ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAWUSURBVHhe7Z1pqG5THMbPNV1jul1TJEOZuqYMRZEpoRARvlw+uIjwASlRFIkMHwzJ8AVfZMhYOGRKESlDkciQyJhknj3PXu9b3nP2sPba9x3Wfp5f/dpr77p1zl7Ped+11l77f5fMz8/PGV3WGByNKA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOG3eC1gGl4ammXF+h9+HZj0xAdgC3gwPhw5AHjAAL8Kz4Re8UEVTANaCT8HDijOTGy9B9t1fxVkJTWOAneAhoWky5ADIPqykKQCbQA8U84V9xz6spKlzlwyOJl9q+9B/3eI4AOI0zQIOhs+H5iJeh3fBP4qzcjaDF8DNizPTls/gDfCH4qycDeBZcLfibDEcxL8QmotJDQA7fVf4QXFWz8nwvtA0LTkJPhCatewM34LrFGej1AYg9SvgF/hNaDby8eBo2vPp4NjEl5B90hqPAcRxAMRxAMRxAMRxAMRxAMRJDcCaA2NYe3A07Ym9d236Y4TUAGwET4VlCw//Z124MjRNAmfADUOzEnb8iZB90pouS8H/QC5A1C0FMwDcUWTS4YLbz6FZCgOwFaz6Yx7LUrDJh7EsBZue0KcA/Av/Dk0TS18CwIcm/KjbEV4Nf4Qmgr4E4ErIbdAfwUvhXvB+WLkb1gS6BICzAG5Y+KTG2EfGXVn42PRDeAo8AnLjSs5wplV2b4dy3z/7IokuATgHbtfg9vBuOA04JngOHgjPhJ/D3Lgdlt3XhV4Ek0gNAL9jH4RNg66f4J2hOTX4lgx/hj3gdbBuTj1r3At/C81KuA5zD0wa96QGgB0fO+L+c3CcNt/Bi+G+8BGYw4wh9t616Y8R+jIIbMN78AR4NHyTF5RRDADhoInvPO4Pz4NfQUlUAzCE36+3wN0h34D+FUqhHoAhX8Pz4X7wSZg8rcoNB2CUt+Ex8Hj4Li/0HQdgMRxNPwY5W+D8+lvYW1IDsD6Mfc6/zeCYG3zRgq9lcf3gDsj1hEnDRZ4YNoXsk9Z02Q/wDuRKVd3CysbwQrh1cTY+WL7m2dAcG/vAa+ChcFKvzXN2ciPkGKUK7spaBfmJVYbEhpBJBICwZA7HB1dBPnnMAW8IWY3w6SJf1twb3soLueMApMFnHJfBqFJss4wDkE4vyuc4AGlwqzafLLJ4ZtY4AO0Y7sF/A57OC7nTZRYwSyViJjEL4MDvWjjJaaBLxEQyzgBsCS+Hp8FJl8p1iZgpwpU1LmLxxnJL2TTqJLtEzBTg9/yx8DV4PayttJk7DsAo3BfwOHwYruCFvuMABDhYvQm+Co+CMvdFPQB8e/lcyH0A3Bq2HpRCNQD8vY+Er0BuBZOtZKoYgF3gQ/AJuCcvKJMaAI6UaQyzUiJmOeTyLRewjoOxP/80cYmY1QDn7yy1wvk8t3hx5SwXXCImkrKVQC7XchWMu3iqdsvkwFhLxHQZA/Dfcpl02xonVR9o4d65HSCXn5+GOXc+4X6/sns7lNvtkvuxSwBmiSsgV+/4QIQFIvi0juvo3MJlauhLAPhJ9CjkfP4SmPR9qEhfAmAScQDE6RKAWSoR02dcIkYYl4gRxyVixHGJGDNeHABxHABxHABxHABxHABxUgOgUCJmFuAiTwzyJWL6ikvEmM6MbUeQ6QEOgDhNAeB/umDyprYPmwLAKpkydXN7CPuuttJpUwDehy+HpskQDuDZh5U0zQIIN1zeBg+C0yiSYNrDsrbPQL7wyh1FlcQEYAgrYjkAecAARNUwbBMA00M8DRTHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHAZBmbu4/x6swK3hIFr4AAAAASUVORK5CYII=' : `data:${file.type};base64,${dataBase64}`;
                        remove.addEventListener('click', () => {
                            div.remove();
                            for (let i = mediaArray.length - 1; i >= 0; i--) {
                                let m = mediaArray[i];
                                if (m.id === img.id) mediaArray.splice(i, 1);
                            }
                        });
                        div.append(img, progress, remove);
                        if (!file.type.includes('video')) {
                            img.addEventListener('click', () => {
                                new Viewer(mediaContainer, {
                                    transition: false
                                });
                            });
                        }
                        mediaContainer.append(div);
                        setTimeout(() => modalElement.scrollTop = modalElement.scrollHeight, 50);
                    });
                }
            }
        }
    });
    input.click();
};
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
        LOC.december.message
    ];
    if (elapsed < 1) {
        return LOC.s.message.replace('$NUMBER$', 0);
    }
    if (elapsed < 60) { //< 60 sec
        return LOC.s.message.replace('$NUMBER$', elapsed);
    }
    if (elapsed < 3600) { //< 60 minutes
        return LOC.m.message.replace('$NUMBER$', Math.floor(elapsed / (60)));
    }
    if (elapsed < 86400) { //< 24 hours
        return LOC.h.message.replace('$NUMBER$', Math.floor(elapsed / (3600)));
    }
    if (elapsed < 604800) { //<7 days
        return LOC.d.message.replace('$NUMBER$', Math.floor(elapsed / (86400)));
    }
    if (elapsed < 2628000) { //<1 month
        return MonthNames[targetDate.getMonth()].replace('$NUMBER$', targetDate.getDate());
    }
    return `${MonthNames[targetDate.getMonth()].replace('$NUMBER$', targetDate.getDate())}, ${targetDate.getFullYear()}`; //more than a monh
}
function openInNewTab(href) {
    Object.assign(document.createElement('a'), {
        target: '_blank',
        rel: 'noopener noreferrer',
        href: href,
    }).click();
}
function onVisibilityChange(callback) {
    var visible = true;

    if (!callback) {
        throw new Error('no callback given');
    }

    function focused() {
        if (!visible) {
            callback(visible = true);
        }
    }

    function unfocused() {
        if (visible) {
            callback(visible = false);
        }
    }

    // Standards:
    if ('hidden' in document) {
        visible = !document.hidden;
        document.addEventListener('visibilitychange',
            function () { (document.hidden ? unfocused : focused)() });
    }
    if ('mozHidden' in document) {
        visible = !document.mozHidden;
        document.addEventListener('mozvisibilitychange',
            function () { (document.mozHidden ? unfocused : focused)() });
    }
    if ('webkitHidden' in document) {
        visible = !document.webkitHidden;
        document.addEventListener('webkitvisibilitychange',
            function () { (document.webkitHidden ? unfocused : focused)() });
    }
    if ('msHidden' in document) {
        visible = !document.msHidden;
        document.addEventListener('msvisibilitychange',
            function () { (document.msHidden ? unfocused : focused)() });
    }
    // IE 9 and lower:
    if ('onfocusin' in document) {
        document.onfocusin = focused;
        document.onfocusout = unfocused;
    }
    // All others:
    window.onpageshow = window.onfocus = focused;
    window.onpagehide = window.onblur = unfocused;
};
function isDark() {
    let date = new Date();
    let hours = date.getHours();
    return hours <= 9 || hours >= 19;
}
function escapeHTML(unsafe) {
    return unsafe
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "’");
 }
function stringInsert(string, index, value) {
    return string.substr(0, index) + value + string.substr(index);
}
function generatePoll(tweet, tweetElement, user) {
    let pollElement = tweetElement.getElementsByClassName('tweet-card')[0];
    pollElement.innerHTML = '';
    let poll = tweet.card.binding_values;
    let choices = Object.keys(poll).filter(key => key.endsWith('label')).map((key, i) => ({
        label: poll[key].string_value,
        count: poll[key.replace('label', 'count')] ? +poll[key.replace('label', 'count')].string_value : 0,
        id: i+1
    }));
    let voteCount = choices.reduce((acc, cur) => acc + cur.count, 0);
    if(poll.selected_choice || user.id_str === tweet.user.id_str || (poll.counts_are_final && poll.counts_are_final.boolean_value)) {
        for(let i in choices) {
            let choice = choices[i];
            if(user.id_str !== tweet.user.id_str && poll.selected_choice && choice.id === +poll.selected_choice.string_value) {
                choice.selected = true;
            }
            choice.percentage = Math.round(choice.count / voteCount * 100);
            let choiceElement = document.createElement('div');
            choiceElement.classList.add('choice');
            choiceElement.innerHTML = `
                <div class="choice-bg" style="width:${choice.percentage}%" data-percentage="${choice.percentage}"></div>
                <div class="choice-label">
                    <span>${escapeHTML(choice.label)}</span>
                    ${choice.selected ? `<span class="choice-selected"></span>` : ''}
                </div>
                ${isFinite(choice.percentage) ? `<div class="choice-count">${choice.count} (${choice.percentage}%)</div>` : '<div class="choice-count">0</div>'}
            `;
            pollElement.append(choiceElement);
        }
    } else {
        for(let i in choices) {
            let choice = choices[i];
            let choiceElement = document.createElement('div');
            choiceElement.classList.add('choice', 'choice-unselected');
            choiceElement.innerHTML = `
                <div class="choice-bg" style="width:100%"></div>
                <div class="choice-label">${escapeHTML(choice.label)}</div>
            `;
            choiceElement.addEventListener('click', async () => {
                let newCard = await API.pollVote(poll.api.string_value, tweet.id_str, tweet.card.url, tweet.card.name, choice.id);
                tweet.card = newCard.card;
                generateCard(tweet, tweetElement, user);
            });
            pollElement.append(choiceElement);
        }
    }
    if(tweet.card.url.startsWith('card://')) {
        let footer = document.createElement('span');
        footer.classList.add('poll-footer');
        footer.innerHTML = `${voteCount} ${voteCount === 1 ? LOC.vote.message : LOC.votes.message}${(!poll.counts_are_final || !poll.counts_are_final.boolean_value) && poll.end_datetime_utc ? ` ・ ${LOC.ends_at.message} ${new Date(poll.end_datetime_utc.string_value).toLocaleString()}` : ''}`;
        pollElement.append(footer);
    }
}
function generateCard(tweet, tweetElement, user) {
    if(!tweet.card) return;
    if(tweet.card.name === 'promo_image_convo' || tweet.card.name === 'promo_video_convo') {
        let vals = tweet.card.binding_values;
        let a = document.createElement('a');
        a.href = vals.thank_you_url ? vals.thank_you_url.string_value : "#";
        a.target = '_blank';
        a.title = vals.thank_you_text.string_value;
        let img = document.createElement('img');
        let imgValue = vals.promo_image;
        if(!imgValue) {
            imgValue = vals.cover_promo_image_original;
        }
        if(!imgValue) {
            imgValue = vals.cover_promo_image_large;
        }
        if(!imgValue) {
            return;
        }
        img.src = imgValue.image_value.url;
        img.width = sizeFunctions[1](imgValue.image_value.width, imgValue.image_value.height)[0];
        img.height = sizeFunctions[1](imgValue.image_value.width, imgValue.image_value.height)[1];
        img.className = 'tweet-media-element';
        a.append(img);
        tweetElement.getElementsByClassName('tweet-card')[0].append(a);
    } else if(tweet.card.name === "player") {
        let iframe = document.createElement('iframe');
        iframe.src = tweet.card.binding_values.player_url.string_value;
        iframe.classList.add('tweet-player');
        iframe.width = 450;
        iframe.height = 250;
        tweetElement.getElementsByClassName('tweet-card')[0].innerHTML = '';
        tweetElement.getElementsByClassName('tweet-card')[0].append(iframe);
    } else if(tweet.card.name === "unified_card") {
        let uc = JSON.parse(tweet.card.binding_values.unified_card.string_value);
        for(let cn of uc.components) {
            let co = uc.component_objects[cn];
            if(co.type === "media") {
                let media = uc.media_entities[co.data.id];
                let video = document.createElement('video');
                video.className = 'tweet-media-element tweet-media-element-one';
                let [w, h] = sizeFunctions[1](media.original_info.width, media.original_info.height);
                video.width = w;
                video.height = h;
                video.crossOrigin = 'anonymous';
                video.loading = 'lazy';
                video.controls = true;
                if(!media.video_info) {
                    console.log(`bug found in ${tweet.id_str}, please report this message to https://github.com/dimdenGD/OldTwitter/issues`, tweet);
                    continue;
                };
                let variants = media.video_info.variants.sort((a, b) => {
                    if(!b.bitrate) return -1;
                    return b.bitrate-a.bitrate;
                });
                if(typeof(vars.savePreferredQuality) !== 'boolean') {
                    chrome.storage.sync.set({
                        savePreferredQuality: true
                    }, () => {});
                    vars.savePreferredQuality = true;
                }
                if(localStorage.preferredQuality && vars.savePreferredQuality) {
                    let closestQuality = variants.filter(v => v.bitrate).reduce((prev, curr) => {
                        return (Math.abs(parseInt(curr.url.match(/\/(\d+)x/)[1]) - parseInt(localStorage.preferredQuality)) < Math.abs(parseInt(prev.url.match(/\/(\d+)x/)[1]) - parseInt(localStorage.preferredQuality)) ? curr : prev);
                    });
                    let preferredQualityVariantIndex = variants.findIndex(v => v.url === closestQuality.url);
                    if(preferredQualityVariantIndex !== -1) {
                        let preferredQualityVariant = variants[preferredQualityVariantIndex];
                        variants.splice(preferredQualityVariantIndex, 1);
                        variants.unshift(preferredQualityVariant);
                    }
                }
                for(let v in variants) {
                    let source = document.createElement('source');
                    source.src = variants[v].url;
                    source.type = variants[v].content_type;
                    video.append(source);
                }
                tweetElement.getElementsByClassName('tweet-card')[0].append(video, document.createElement('br'));
            } else if(co.type === "app_store_details") {
                let app = uc.app_store_data[uc.destination_objects[co.data.destination].data.app_id][0];
                let appElement = document.createElement('div');
                appElement.classList.add('tweet-app-info');
                appElement.innerHTML = `
                    <h3>${escapeHTML(app.title.content)}</h3>
                    <span>${escapeHTML(app.category.content)}</span>
                    <br><br>
                `;
                tweetElement.getElementsByClassName('tweet-card')[0].append(appElement);
            } else if(co.type === "button_group") {
                let buttonGroup = document.createElement('div');
                buttonGroup.classList.add('tweet-button-group');
                for(let b of co.data.buttons) {
                    let app = uc.app_store_data[uc.destination_objects[b.destination].data.app_id][0];
                    let button = document.createElement('a');
                    button.href = `http://play.google.com/store/apps/details?id=${app.id}`;
                    button.target = '_blank';
                    button.className = `nice-button tweet-app-button tweet-app-button-${b.style}`
                    button.innerText = b.action[0].toUpperCase() + b.action.slice(1);
                    buttonGroup.append(button);
                }
                tweetElement.getElementsByClassName('tweet-card')[0].append(buttonGroup);
            }
        }
    } else if(tweet.card.name === "summary" || tweet.card.name === "summary_large_image") {
        let vals = tweet.card.binding_values;
        let a = document.createElement('a');
        let url = vals.card_url.string_value;
        if(tweet.entities && tweet.entities.urls) {
            let urlEntity = tweet.entities.urls.find(u => u.url === url);
            if(urlEntity) {
                url = urlEntity.expanded_url;
            }
        }
        a.target = '_blank';
        a.href = url;
        a.className = 'tweet-card-link box';
        a.innerHTML = `
            ${vals.thumbnail_image ? `<img src="${vals.thumbnail_image.image_value.url}" class="tweet-card-link-thumbnail">` : ''}
            <div class="tweet-card-link-text">
                ${vals.vanity_url ? `<span class="tweet-card-link-vanity">${escapeHTML(vals.vanity_url.string_value)}</span><br>` : ''}
                ${vals.title ? `<h3 class="tweet-card-link-title">${escapeHTML(vals.title.string_value)}</h3>` : ''}
                ${vals.description ? `<span class="tweet-card-link-description">${escapeHTML(vals.description.string_value)}</span>` : ''}
            </div>
        `;
        tweetElement.getElementsByClassName('tweet-card')[0].append(a);
    } else if(tweet.card.url.startsWith('card://')) {
        generatePoll(tweet, tweetElement, user);
    }
}
let emojiCombination = /(\u00a9|\u00ae|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]{1,2}\u200D(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]{1,2}\u200D{0,1})+)/g;
function matchEmojiHelperCount(str) {
    let matches = str.matchAll(emojiCombination);
    let count = 0;
    for(let m of matches) count += m[2] ? m[2].length : 0;
    return count;
}

function createEmojiPicker(container, input, style = {}) {
    let picker = new EmojiPicker({
        i18n: {
            "categories": {
                "custom": LOC.custom.message,
                "smileys-emotion": LOC.smileys_emotion.message,
                "people-body": LOC.people_body.message,
                "animals-nature": LOC.animals_nature.message,
                "food-drink": LOC.food_drink.message,
                "travel-places": LOC.travel_places.message,
                "activities": LOC.activities.message,
                "objects": LOC.objects.message,
                "symbols": LOC.symbols.message,
                "flags": LOC.flags.message
            },
            "categoriesLabel": LOC.categories.message,
            "emojiUnsupportedMessage": LOC.unsupported_emoji.message,
            "favoritesLabel": LOC.favorites.message,
            "loadingMessage": LOC.loading.message,
            "networkErrorMessage": LOC.cant_load_emoji.message,
            "regionLabel": LOC.emoji_picker.message,
            "searchDescription": LOC.emoji_search_description.message,
            "searchLabel": LOC.search.message,
            "searchResultsLabel": LOC.search_results.message,
            "skinToneDescription": "When expanded, press up or down to select and enter to choose.",
            "skinToneLabel": LOC.skin_tone_label.message.replace("$SKIN_TONE$", "{skinTone}"),
            "skinTones": [
                "Default",
                "Light",
                "Medium-Light",
                "Medium",
                "Medium-Dark",
                "Dark"
            ],
            "skinTonesLabel": LOC.skin_tones_label.message
        }
    });
    for(let i in style) {
        picker.style[i] = style[i];
    }
    picker.className = isDarkModeEnabled ? 'dark' : 'light';
    picker.addEventListener('emoji-click', e => {
        let pos = input.selectionStart;
        let text = input.value;
        input.value = text.slice(0, pos) + e.detail.unicode + text.slice(pos);
        input.selectionStart = pos + e.detail.unicode.length;
    });
    container.append(picker);

    let observer;
    if(vars.enableTwemoji) {
        const style = document.createElement('style');
        style.textContent = `.twemoji {
            width: var(--emoji-size);
            height: var(--emoji-size);
            pointer-events: none;
        }`;
        picker.shadowRoot.appendChild(style);

        observer = new MutationObserver(() => {
            for (const emoji of picker.shadowRoot.querySelectorAll('.emoji')) {
                // Avoid infinite loops of MutationObserver
                if (!emoji.querySelector('.twemoji')) {
                    // Do not use default 'emoji' class name because it conflicts with emoji-picker-element's
                    twemoji.parse(emoji, { className: 'twemoji' })
                }
            }
        })
        observer.observe(picker.shadowRoot, {
            subtree: true,
            childList: true
        });
    }

    setTimeout(() => {
        function oc (e) {
            if (picker.contains(e.target)) return;
            if(observer) {
                observer.disconnect();
            }
            picker.remove();
            document.removeEventListener('click', oc);
        }
        document.addEventListener('click', oc);
    }, 100);

    return picker;
}

function luminance(r, g, b) {
    var a = [r, g, b].map(function(v) {
      v /= 255;
      return v <= 0.03928 ?
        v / 12.92 :
        Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function contrast(rgb1, rgb2) {
    var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
    var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) /
      (darkest + 0.05);
}
const hex2rgb = (hex) => {
      if(!hex.startsWith('#')) hex = `#${hex}`;
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      // return {r, g, b} // return an object
      return [ r, g, b ]
}
const colorShade = (col, amt) => {
    col = col.replace(/^#/, '')
    if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]
  
    let [r, g, b] = col.match(/.{2}/g);
    ([r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt])
  
    r = Math.max(Math.min(255, r), 0).toString(16)
    g = Math.max(Math.min(255, g), 0).toString(16)
    b = Math.max(Math.min(255, b), 0).toString(16)
  
    const rr = (r.length < 2 ? '0' : '') + r
    const gg = (g.length < 2 ? '0' : '') + g
    const bb = (b.length < 2 ? '0' : '') + b
  
    return `#${rr}${gg}${bb}`
}

function isProfilePath(path) {
    path = path.split('?')[0].split('#')[0];
    if(path.endsWith('/')) path = path.slice(0, -1);
    if(path.split('/').length > 2) return false;
    if(path.length <= 1) return false;
    if(['/home', '/notifications', '/messages', '/settings', '/explore', '/login', '/register', '/signin', '/signup', '/logout', '/i', '/old', '/search', '/donate'].includes(path)) return false;
    return /^\/[A-z-0-9-_]{1,15}$/.test(path);
}
function isSticky(el) {
    while(el !== document.body.parentElement) {
        let pos = getComputedStyle(el).position;
        if(pos === 'sticky' || pos === 'fixed') return true;
        el = el.parentElement;
    }
    return false;
}
function onVisible(element, callback) {
    new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if(entry.intersectionRatio > 0) {
          callback(element);
          observer.disconnect();
        }
      });
    }).observe(element);
}

const mediaClasses = [
    undefined,
    'tweet-media-element-one',
    'tweet-media-element-two',
    'tweet-media-element-three',
    'tweet-media-element-two',
];
const sizeFunctions = [
    undefined,
    (w, h) => [w > 450 ? 450 : w < 150 ? 150 : w, h > 500 ? 500 : h < 150 ? 150 : h],
    (w, h) => [w > 200 ? 200 : w < 150 ? 150 : w, h > 400 ? 400 : h < 150 ? 150 : h],
    (w, h) => [150, h > 250 ? 250 : h < 150 ? 150 : h],
    // (w, h) => [w > 100 ? 100 : w, h > 150 ? 150 : h],
    (w, h) => [w > 200 ? 200 : w < 150 ? 150 : w, h > 400 ? 400 : h < 150 ? 150 : h],
];
const quoteSizeFunctions = [
    undefined,
    (w, h) => [w > 400 ? 400 : w, h > 400 ? 400 : h],
    (w, h) => [w > 200 ? 200 : w, h > 400 ? 400 : h],
    (w, h) => [w > 125 ? 125 : w, h > 200 ? 200 : h],
    (w, h) => [w > 100 ? 100 : w, h > 150 ? 150 : h],
];

async function renderTrends(compact = false) {
    let [trendsData, hashflags] = await Promise.allSettled([API.getTrends(), API.getHashflags()]);
    let trends = trendsData.value.modules;
    hashflags = hashflags.value ? hashflags.value : [];
    let trendsContainer = document.getElementById('trends-list');
    trendsContainer.innerHTML = '';
    let max = 7;
    if(innerHeight < 650) max = 3;
    trends.slice(0, max).forEach(({ trend }) => {
        let hashflag = hashflags.find(h => h.hashtag.toLowerCase() === trend.name.slice(1).toLowerCase());
        let trendDiv = document.createElement('div');
        trendDiv.className = 'trend' + (compact ? ' compact-trend' : '');
        trendDiv.innerHTML = compact ? `<a href="https://twitter.com/search?q=${escapeHTML(trend.name)}" class="trend-name">${escapeHTML(trend.name)}</a>` : `
            <b>
                <a href="https://twitter.com/search?q=${escapeHTML(trend.name)}" class="trend-name">
                    ${escapeHTML(trend.name)}
                    ${hashflag ? `<img src="${hashflag.asset_url}" class="hashflag" width="16" height="16">` : ''}
                </a>
            </b><br>
            <span class="trend-description">${trend.meta_description ? escapeHTML(trend.meta_description) : ''}</span>
        `;
        trendsContainer.append(trendDiv);
        if(vars.enableTwemoji) twemoji.parse(trendDiv);
    });
}
async function renderDiscovery(cache = true) {
    let discover = await API.discoverPeople(cache);
    let discoverContainer = document.getElementById('wtf-list');
    discoverContainer.innerHTML = '';
    try {
        let usersData = discover.globalObjects.users;
        let max = 7;
        if(innerHeight < 700) max = 6;
        if(innerHeight < 650) max = 3;
        let usersSuggestions = discover.timeline.instructions[0].addEntries.entries[0].content.timelineModule.items.map(s => s.entryId.slice('user-'.length)).slice(0, max); // why is it so deep
        usersSuggestions.forEach(userId => {
            let userData = usersData[userId];
            if (!userData) return;
            let udiv = document.createElement('div');
            udiv.className = 'wtf-user';
            udiv.dataset.userId = userId;
            udiv.innerHTML = `
                <a class="tweet-avatar-link" href="https://twitter.com/${userData.screen_name}"><img src="${userData.profile_image_url_https.replace("_normal", "_bigger")}" alt="${escapeHTML(userData.name)}" class="tweet-avatar" width="48" height="48"></a>
                <div class="tweet-header wtf-header">
                    <a class="tweet-header-info wtf-user-link" href="https://twitter.com/${userData.screen_name}">
                        <b class="tweet-header-name wtf-user-name${userData.verified ? ' user-verified' : userData.id_str === '1123203847776763904' ? ' user-verified user-verified-dimden' : ''}">${escapeHTML(userData.name)}</b>
                        <span class="tweet-header-handle wtf-user-handle">@${userData.screen_name}</span>
                    </a>
                    <br>
                    <button class="nice-button discover-follow-btn ${userData.following ? 'following' : 'follow'}" style="position:relative;bottom: 1px;">${userData.following ? LOC.following_btn.message : LOC.follow.message}</button>
                </div>
            `;
            const followBtn = udiv.querySelector('.discover-follow-btn');
            followBtn.addEventListener('click', async () => {
                if (followBtn.className.includes('following')) {
                    try {
                        await API.unfollowUser(userData.screen_name);
                    } catch(e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    followBtn.classList.remove('following');
                    followBtn.classList.add('follow');
                    followBtn.innerText = LOC.follow.message;
                    userData.following = false;
                } else {
                    try {
                        await API.followUser(userData.screen_name);
                    } catch(e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    followBtn.classList.add('following');
                    followBtn.classList.remove('follow');
                    followBtn.innerText = LOC.following_btn.message;
                    userData.following = true;
                }
                chrome.storage.local.set({
                    discoverData: {
                        date: Date.now(),
                        data: discover
                    }
                }, () => { })
            });
            discoverContainer.append(udiv);
            if(vars.enableTwemoji) twemoji.parse(udiv);
        });
    } catch (e) {
        console.warn(e);
    }
}

async function appendUser(u, container) {
    let userElement = document.createElement('div');
    userElement.classList.add('user-item');
    userElement.innerHTML = `
        <div>
            <a href="https://twitter.com/${u.screen_name}" class="user-item-link">
                <img src="${u.profile_image_url_https}" alt="${u.screen_name}" class="user-item-avatar tweet-avatar" width="48" height="48">
                <div class="user-item-text">
                    <span${u.id_str === '1123203847776763904' ? ' title="Old Twitter Layout extension developer"' : ''} class="tweet-header-name user-item-name${u.protected ? ' user-protected' : ''}${u.verified ? ' user-verified' : u.id_str === '1123203847776763904' ? ' user-verified user-verified-dimden' : ''}">${escapeHTML(u.name)}</span><br>
                    <span class="tweet-header-handle">@${u.screen_name}</span>
                    ${u.followed_by ? `<span class="follows-you-label">${LOC.follows_you.message}</span>` : ''}
                </div>
            </a>
        </div>
        <div>
            <button class="user-item-btn nice-button ${u.following ? 'following' : 'follow'}">${u.following ? LOC.following_btn.message : LOC.follow.message}</button>
        </div>
    `;

    let followButton = userElement.querySelector('.user-item-btn');
    followButton.addEventListener('click', async () => {
        if (followButton.classList.contains('following')) {
            try {
                await API.unfollowUser(u.screen_name);
            } catch(e) {
                console.error(e);
                alert(e);
                return;
            }
            followButton.classList.remove('following');
            followButton.classList.add('follow');
            followButton.innerText = LOC.follow.message;
        } else {
            try {
                await API.followUser(u.screen_name);
            } catch(e) {
                console.error(e);
                alert(e);
                return;
            }
            followButton.classList.remove('follow');
            followButton.classList.add('following');
            followButton.innerText = LOC.following_btn.message;
        }
    });

    container.appendChild(userElement);
    if(vars.enableTwemoji) twemoji.parse(userElement);
}

let lastTweetErrorDate = 0;
async function appendTweet(t, timelineContainer, options = {}) {
    try {
        if(typeof seenReplies !== 'undefined') {
            if(seenReplies.includes(t.id_str)) return;
            seenReplies.push(t.id_str);
        }
        if(typeof seenThreads !== 'undefined') {
            if(seenThreads.includes(t.id_str)) return;
        }
        if(t.entities && t.entities.urls) {
            let webUrl = t.entities.urls.find(u => u.expanded_url.startsWith('https://twitter.com/i/web/status/'));
            if(webUrl) {
                try {
                    t = await API.tweetDetail(t.id_str);
                } catch(e) {}
            }
        }
        if(t.socialContext) {
            options.top = {};
            if(t.socialContext.description) {
                options.top.text = `<a target="_blank" href="https://twitter.com/i/topics/${t.socialContext.id}">${t.socialContext.name}</a>`;
                options.top.icon = "\uf008";
                options.top.color = isDarkModeEnabled ? "#7e5eff" : "#3300FF";
            } else if(t.socialContext.contextType === "Like") {
                options.top.text = `<${t.socialContext.landingUrl.url.split('=')[1] ? `a href="https://twitter.com/i/user/${t.socialContext.landingUrl.url.split('=')[1]}"` : 'span'}>${!vars.heartsNotStars ? t.socialContext.text.replace(' liked', ' favorited') : t.socialContext.text}</a>`;
                if(vars.heartsNotStars) {
                    options.top.icon = "\uf015";
                    options.top.color = "rgb(249, 24, 128)";
                } else {
                    options.top.icon = "\uf001";
                    options.top.color = "#ffac33";
                }
            } else if(t.socialContext.contextType === "Follow") {
                options.top.text = t.socialContext.text;
                options.top.icon = "\uf002";
                options.top.color = isDarkModeEnabled ? "#7e5eff" : "#3300FF";
            } else {
                console.log(t.socialContext);
            }
        }
        if(typeof tweets !== 'undefined') tweets.push(['tweet', t, options]);
        const tweet = document.createElement('div');
        t.element = tweet;
        t.options = options;

        if(!options.mainTweet && typeof mainTweetLikers !== 'undefined' && !location.pathname.includes("retweets/with_comments")) {
            tweet.addEventListener('click', async e => {
                if(e.target.className.startsWith('tweet tweet-id-') || e.target.classList.contains('tweet-body') || e.target.className === 'tweet-interact') {
                    document.getElementById('loading-box').hidden = false;
                    savePageData();
                    history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
                    updateSubpage();
                    mediaToUpload = [];
                    linkColors = {};
                    cursor = undefined;
                    seenReplies = [];
                    mainTweetLikers = [];
                    let restored = await restorePageData();
                    let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                    if(subpage === 'tweet' && !restored) {
                        updateReplies(id);
                    } else if(subpage === 'likes') {
                        updateLikes(id);
                    } else if(subpage === 'retweets') {
                        updateRetweets(id);
                    } else if(subpage === 'retweets_with_comments') {
                        updateRetweetsWithComments(id);
                    }
                    renderDiscovery();
                    renderTrends();
                    currentLocation = location.pathname;
                }
            });
            tweet.addEventListener('mousedown', e => {
                if(e.button === 1) {
                    e.preventDefault();
                    if(e.target.className.startsWith('tweet tweet-id-') || e.target.classList.contains('tweet-body') || e.target.className === 'tweet-interact') {
                        openInNewTab(`https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
                    }
                }
            });
        } else {
            if(!options.mainTweet) {
                tweet.addEventListener('click', e => {
                    if(e.target.className.startsWith('tweet tweet-id-') || e.target.classList.contains('tweet-body') || e.target.className === 'tweet-interact') {
                        let tweetData = t;
                        if(tweetData.retweeted_status) tweetData = tweetData.retweeted_status;
                        tweet.classList.add('tweet-preload');
                        new TweetViewer(user, tweetData);
                    }
                });
                tweet.addEventListener('mousedown', e => {
                    if(e.button === 1) {
                        e.preventDefault();
                        if(e.target.className.startsWith('tweet tweet-id-') || e.target.classList.contains('tweet-body') || e.target.className === 'tweet-interact') {
                            openInNewTab(`https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
                        }
                    }
                });
            }
        }
        tweet.tabIndex = -1;
        tweet.className = `tweet tweet-id-${t.id_str} ${options.mainTweet ? 'tweet-main' : location.pathname.includes('/status/') ? 'tweet-replying' : ''}`;
        tweet.dataset.tweetId = t.id_str;
        tweet.dataset.userId = t.user.id_str;
        try {
            if(!activeTweet) {
                tweet.classList.add('tweet-active');
                activeTweet = tweet;
            }
        } catch(e) {}
        if (options.threadContinuation) tweet.classList.add('tweet-self-thread-continuation');
        if (options.selfThreadContinuation) tweet.classList.add('tweet-self-thread-continuation');

        if (options.noTop) tweet.classList.add('tweet-no-top');
        if(vars.linkColorsInTL && typeof linkColors !== 'undefined') {
            if(linkColors[t.user.screen_name]) {
                let rgb = hex2rgb(linkColors[t.user.screen_name]);
                let ratio = contrast(rgb, [27, 40, 54]);
                if(ratio < 4 && isDarkModeEnabled && linkColors[t.user.screen_name] !== '000000') {
                    linkColors[t.user.screen_name] = colorShade(linkColors[t.user.screen_name], 80).slice(1);
                }
                tweet.style.setProperty('--link-color', '#'+linkColors[t.user.screen_name]);
            } else {
                if(t.user.profile_link_color && t.user.profile_link_color !== '1DA1F2') {
                    let rgb = hex2rgb(t.user.profile_link_color);
                    let ratio = contrast(rgb, [27, 40, 54]);
                    if(ratio < 4 && isDarkModeEnabled && linkColors[t.user.screen_name] !== '000000') {
                        t.user.profile_link_color = colorShade(t.user.profile_link_color, 80).slice(1);
                    }
                    tweet.style.setProperty('--link-color', '#'+t.user.profile_link_color);
                }
            }
        }
        let full_text = t.full_text ? t.full_text : '';
        if(location.pathname.includes('/status/')) full_text = full_text.replace(/^((?<!\w)@([\w+]{1,15})\s)+/, '')
        let textWithoutLinks = full_text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').replace(/(?<!\w)@([\w+]{1,15}\b)/g, '');
        let isEnglish
        try { 
            isEnglish = textWithoutLinks.length < 1 ? {languages:[{language:LANGUAGE, percentage:100}]} : await chrome.i18n.detectLanguage(textWithoutLinks);
        } catch(e) {
            isEnglish = {languages:[{language:LANGUAGE, percentage:100}]};
            console.error(e);
        }
        isEnglish = isEnglish.languages[0] && isEnglish.languages[0].percentage > 60 && isEnglish.languages[0].language.startsWith(LANGUAGE);
        let videos = t.extended_entities && t.extended_entities.media && t.extended_entities.media.filter(m => m.type === 'video');
        if(!videos || videos.length === 0) {
            videos = undefined;
        }
        if(videos) {
            for(let v of videos) {
                if(!v.video_info) continue;
                v.video_info.variants = v.video_info.variants.sort((a, b) => {
                    if(!b.bitrate) return -1;
                    return b.bitrate-a.bitrate;
                });
                if(typeof(vars.savePreferredQuality) !== 'boolean') {
                    chrome.storage.sync.set({
                        savePreferredQuality: true
                    }, () => {});
                    vars.savePreferredQuality = true;
                }
                if(localStorage.preferredQuality && vars.savePreferredQuality) {
                    let closestQuality = v.video_info.variants.filter(v => v.bitrate).reduce((prev, curr) => {
                        return (Math.abs(parseInt(curr.url.match(/\/(\d+)x/)[1]) - parseInt(localStorage.preferredQuality)) < Math.abs(parseInt(prev.url.match(/\/(\d+)x/)[1]) - parseInt(localStorage.preferredQuality)) ? curr : prev);
                    });
                    let preferredQualityVariantIndex = v.video_info.variants.findIndex(v => v.url === closestQuality.url);
                    if(preferredQualityVariantIndex !== -1) {
                        let preferredQualityVariant = v.video_info.variants[preferredQualityVariantIndex];
                        v.video_info.variants.splice(preferredQualityVariantIndex, 1);
                        v.video_info.variants.unshift(preferredQualityVariant);
                    }
                }
            }
        }
        if(full_text.includes("Learn more")) {
            console.log(t);
        }
        if(t.withheld_in_countries && (t.withheld_in_countries.includes("XX") || t.withheld_in_countries.includes("XY"))) {
            full_text = "";
        }
        tweet.innerHTML = /*html*/`
            <div class="tweet-top" hidden></div>
            <a class="tweet-avatar-link" href="https://twitter.com/${t.user.screen_name}"><img onerror="this.src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png'" src="${t.user.profile_image_url_https.replace("_normal.", "_bigger.")}" alt="${t.user.name}" class="tweet-avatar" width="48" height="48"></a>
            <div class="tweet-header ${options.mainTweet ? 'tweet-header-main' : ''}">
                <a class="tweet-header-info ${options.mainTweet ? 'tweet-header-info-main' : ''}" href="https://twitter.com/${t.user.screen_name}">
                    <b ${t.user.id_str === '1123203847776763904' ? 'title="Old Twitter Layout extension developer" ' : ''}class="tweet-header-name ${options.mainTweet ? 'tweet-header-name-main' : ''} ${t.user.verified ? 'user-verified' : t.user.id_str === '1123203847776763904' ? 'user-verified user-verified-dimden' : ''} ${t.user.protected ? 'user-protected' : ''}">${escapeHTML(t.user.name)}</b>
                    <span class="tweet-header-handle">@${t.user.screen_name}</span>
                </a>
                <a ${options.mainTweet ? 'hidden' : ''} class="tweet-time" data-timestamp="${new Date(t.created_at).getTime()}" title="${new Date(t.created_at).toLocaleString()}" href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}">${timeElapsed(new Date(t.created_at).getTime())}</a>
                ${location.pathname.split("?")[0].split("#")[0] === '/i/bookmarks' ? `<span class="tweet-delete-bookmark${!isEnglish ? ' tweet-delete-bookmark-lower' : ''}">&times;</span>` : ''}
                ${options.mainTweet && t.user.id_str !== user.id_str ? `<button class='nice-button tweet-header-follow ${t.user.following ? 'following' : 'follow'}'>${t.user.following ? LOC.following_btn.message : LOC.follow.message}</button>` : ''}
                ${!options.mainTweet && !isEnglish ? `<span class="tweet-translate-after">${`${t.user.name} ${t.user.screen_name} 1 Sept`.length < 40 ? LOC.view_translation.message : ''}</span>` : ''}
            </div>
            <div class="tweet-body ${options.mainTweet ? 'tweet-body-main' : ''}">
                <span class="tweet-body-text ${vars.noBigFont || !options.bigFont || (!options.mainTweet && location.pathname.includes('/status/')) ? 'tweet-body-text-long' : 'tweet-body-text-short'}">${full_text ? escapeHTML(full_text).replace(/((http|https):\/\/[\w?=.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`).replace(hashtagRegex, `<a href="https://twitter.com/hashtag/$2">#$2</a>`).replace(/\n/g, '<br>') : ''}</span>
                ${!isEnglish && options.mainTweet ? `
                <br>
                <span class="tweet-translate">${LOC.view_translation.message}</span>
                ` : ``}
                ${t.extended_entities && t.extended_entities.media ? `
                    <div class="tweet-media">
                        ${t.extended_entities.media.map((m, i) => `${i === 2 && t.extended_entities.media.length >= 4 ? '<br>' : ''}<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escapeHTML(m.ext_alt_text)}" title="${escapeHTML(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop autoplay muted' : ''} ${m.type === 'photo' ? `src="${m.media_url_https + (vars.showOriginalImages && m.media_url_https.endsWith('.jpg') ? '?name=orig' : '')}"` : ''} class="tweet-media-element${m.type === 'animated_gif' ? ' tweet-media-gif' : ''} ${mediaClasses[t.extended_entities.media.length]} ${!vars.displaySensitiveContent && t.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' || m.type === 'animated_gif' ? `
                            ${m.video_info.variants.map(v => `<source src="${v.url}" type="${v.content_type}">`).join('\n')}
                            ${LOC.unsupported_video.message}
                        </video>` : ''}`).join('\n')}
                    </div>
                    ${videos ? /*html*/`
                        <div class="tweet-media-controls">
                            ${videos[0].ext && videos[0].ext.mediaStats && videos[0].ext.mediaStats.r && videos[0].ext.mediaStats.r.ok ? `<span class="tweet-video-views">${Number(videos[0].ext.mediaStats.r.ok.viewCount).toLocaleString().replace(/\s/g, ',')} ${LOC.views.message}</span> • ` : ''}<span class="tweet-video-reload">${LOC.reload.message}</span> •
                            ${videos[0].video_info.variants.filter(v => v.bitrate).map(v => `<span class="tweet-video-quality" data-url="${v.url}">${v.url.match(/\/(\d+)x/)[1] + 'p'}</span> `).join(" / ")}
                        </div>
                    ` : ``}
                    <span class="tweet-media-data"></span>
                ` : ``}
                ${t.card ? `<div class="tweet-card"></div>` : ''}
                ${t.quoted_status ? `
                <a class="tweet-body-quote" target="_blank" href="https://twitter.com/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}">
                    <img src="${t.quoted_status.user.profile_image_url_https}" alt="${escapeHTML(t.quoted_status.user.name)}" class="tweet-avatar-quote" width="24" height="24">
                    <div class="tweet-header-quote">
                        <span class="tweet-header-info-quote">
                        <b class="tweet-header-name-quote ${t.quoted_status.user.verified ? 'user-verified' : t.quoted_status.user.id_str === '1123203847776763904' ? 'user-verified user-verified-dimden' : ''} ${t.quoted_status.user.protected ? 'user-protected' : ''}">${escapeHTML(t.quoted_status.user.name)}</b>
                        <span class="tweet-header-handle-quote">@${t.quoted_status.user.screen_name}</span>
                        </span>
                    </div>
                    <span class="tweet-time-quote" data-timestamp="${new Date(t.quoted_status.created_at).getTime()}" title="${new Date(t.quoted_status.created_at).toLocaleString()}">${timeElapsed(new Date(t.quoted_status.created_at).getTime())}</span>
                    <span class="tweet-body-text-quote tweet-body-text-long" style="color:var(--default-text-color)!important">${t.quoted_status.full_text ? escapeHTML(t.quoted_status.full_text).replace(/\n/g, '<br>') : ''}</span>
                    ${t.quoted_status.extended_entities && t.quoted_status.extended_entities.media ? `
                    <div class="tweet-media-quote">
                        ${t.quoted_status.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escapeHTML(m.ext_alt_text)}" title="${escapeHTML(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${quoteSizeFunctions[t.quoted_status.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${quoteSizeFunctions[t.quoted_status.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop autoplay muted' : ''} src="${m.type === 'photo' ? m.media_url_https : m.video_info.variants.find(v => v.content_type === 'video/mp4').url}" class="tweet-media-element tweet-media-element-quote ${mediaClasses[t.quoted_status.extended_entities.media.length]} ${!vars.displaySensitiveContent && t.quoted_status.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' ? '</video>' : ''}`).join('\n')}
                    </div>
                    ` : ''}
                </a>
                ` : ``}
                ${t.limited_actions === 'limit_trusted_friends_tweet' && (options.mainTweet || !location.pathname.includes('/status/')) ? `
                <div class="tweet-limited">
                    ${LOC.circle_limited_tweet.message}
                    <a href="https://help.twitter.com/en/using-twitter/twitter-circle" target="_blank">${LOC.learn_more.message}</a>
                </div>
                `.replace('$SCREEN_NAME$', t.user.screen_name) : ''}
                ${t.tombstone ? `<div class="tweet-warning">${t.tombstone}</div>` : ''}
                ${((t.withheld_in_countries && (t.withheld_in_countries.includes("XX") || t.withheld_in_countries.includes("XY"))) || t.withheld_scope) ? `<div class="tweet-warning">This Tweet has been withheld in response to a report from the copyright holder. <a href="https://help.twitter.com/en/rules-and-policies/copyright-policy" target="_blank">Learn more.</a></div>` : ''}
                ${t.conversation_control ? `<div class="tweet-warning">${LOC.limited_tweet.message}${t.conversation_control.policy && (t.user.id_str === user.id_str || (t.conversation_control.policy.toLowerCase() === 'community' && (t.user.followed_by || (full_text && full_text.includes(`@${user.screen_name}`)))) || (t.conversation_control.policy.toLowerCase() === 'by_invitation' && full_text && full_text.includes(`@${user.screen_name}`))) ? ' ' + LOC.you_can_reply.message : ''}.</div>` : ''}
                ${options.mainTweet ? /*html*/`
                <div class="tweet-footer">
                    <div class="tweet-footer-stats">
                        <a href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}" class="tweet-footer-stat tweet-footer-stat-o">
                            <span class="tweet-footer-stat-text">${LOC.replies.message}</span>
                            <b class="tweet-footer-stat-count tweet-footer-stat-replies">${Number(t.reply_count).toLocaleString().replace(/\s/g, ',')}</b>
                        </a>
                        <a href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}/retweets" class="tweet-footer-stat tweet-footer-stat-r">
                            <span class="tweet-footer-stat-text">${LOC.retweets.message}</span>
                            <b class="tweet-footer-stat-count tweet-footer-stat-retweets">${Number(t.retweet_count).toLocaleString().replace(/\s/g, ',')}</b>
                        </a>
                        <a href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}/likes" class="tweet-footer-stat tweet-footer-stat-f">
                            <span class="tweet-footer-stat-text">${vars.heartsNotStars ? LOC.likes.message : LOC.favorites.message}</span>
                            <b class="tweet-footer-stat-count tweet-footer-stat-favorites">${Number(t.favorite_count).toLocaleString().replace(/\s/g, ',')}</b>
                        </a>
                    </div>
                    <div class="tweet-footer-favorites"></div>
                </div>
                ` : ''}
                <a ${!options.mainTweet ? 'hidden' : ''} class="tweet-date" title="${new Date(t.created_at).toLocaleString()}" href="https://twitter.com/${t.user.screen_name}/status/${t.id_str}"><br>${new Date(t.created_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric' }).toLowerCase()} - ${new Date(t.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}  ・ ${t.source ? t.source.split('>')[1].split('<')[0] : 'Unknown'}</a>
                <div class="tweet-interact">
                    <span class="tweet-interact-reply" data-val="${t.reply_count}">${options.mainTweet ? '' : Number(t.reply_count).toLocaleString().replace(/\s/g, ',')}</span>
                    <span class="tweet-interact-retweet${t.retweeted ? ' tweet-interact-retweeted' : ''}${(t.user.protected || t.limited_actions === 'limit_trusted_friends_tweet') && t.user.id_str !== user.id_str ? ' tweet-interact-retweet-disabled' : ''}" data-val="${t.retweet_count}">${options.mainTweet ? '' : Number(t.retweet_count).toLocaleString().replace(/\s/g, ',')}</span>
                    <div class="tweet-interact-retweet-menu dropdown-menu" hidden>
                        <span class="tweet-interact-retweet-menu-retweet">${t.retweeted ? LOC.unretweet.message : LOC.retweet.message}</span>
                        <span class="tweet-interact-retweet-menu-quote">${LOC.quote_tweet.message}</span>
                        ${options.mainTweet ? `
                            <span class="tweet-interact-retweet-menu-quotes">${LOC.see_quotes_big.message}</span>
                            <span class="tweet-interact-retweet-menu-retweeters">${LOC.see_retweeters.message}</span>
                        ` : ''}
                    </div>
                    <span class="tweet-interact-favorite ${t.favorited ? 'tweet-interact-favorited' : ''}" data-val="${t.favorite_count}">${options.mainTweet ? '' : Number(t.favorite_count).toLocaleString().replace(/\s/g, ',')}</span>
                    ${vars.seeTweetViews && t.ext && t.ext.views && t.ext.views.r && t.ext.views.r.ok && t.ext.views.r.ok.count ? /*html*/`<span class="tweet-interact-views" data-val="${t.ext.views.r.ok.count}">${Number(t.ext.views.r.ok.count).toLocaleString().replace(/\s/g, ',')}</span>` : ''}
                    <span class="tweet-interact-more"></span>
                    <div class="tweet-interact-more-menu dropdown-menu" hidden>
                        <span class="tweet-interact-more-menu-copy">${LOC.copy_link.message}</span>
                        <span class="tweet-interact-more-menu-embed">${LOC.embed_tweet.message}</span>
                        <span class="tweet-interact-more-menu-share">${LOC.share_tweet.message}</span>
                        ${t.user.id_str === user.id_str ? /*html*/`
                        <hr>
                        <span class="tweet-interact-more-menu-analytics">${LOC.tweet_analytics.message}</span>
                        <span class="tweet-interact-more-menu-delete">${LOC.delete_tweet.message}</span>
                        ${typeof pageUser !== 'undefined' && pageUser.id_str === user.id_str ? /*html*/`<span class="tweet-interact-more-menu-pin">${pinnedTweet && pinnedTweet.id_str === t.id_str ? LOC.unpin_tweet.message :  LOC.pin_tweet.message}</span>` : ''}
                        ` : ''}
                        <hr>
                        ${t.user.id_str !== user.id_str && !options.mainTweet ? /*html*/`
                            <span class="tweet-interact-more-menu-follow"${t.user.blocking ? ' hidden' : ''}>${t.user.following ? LOC.unfollow_user.message : LOC.follow_user.message} @${t.user.screen_name}</span>
                        ` : ''}
                        ${t.user.id_str !== user.id_str ? /*html*/`
                            <span class="tweet-interact-more-menu-block">${t.user.blocking ? LOC.unblock_user.message : LOC.block_user.message} @${t.user.screen_name}</span>
                        ` : ''}
                        ${!location.pathname.startsWith('/i/bookmarks') ? /*html*/`<span class="tweet-interact-more-menu-bookmark">${LOC.bookmark_tweet.message}</span>` : ''}
                        <span class="tweet-interact-more-menu-mute">${t.conversation_muted ? LOC.unmute_convo.message : LOC.mute_convo.message}</span>
                        <hr>
                        ${t.feedback ? t.feedback.map((f, i) => /*html*/`<span class="tweet-interact-more-menu-feedback" data-index="${i}">${f.prompt ? f.prompt : LOC.topic_not_interested.message}</span>`).join("\n") : ''}
                        <span class="tweet-interact-more-menu-refresh">${LOC.refresh_tweet.message}</span>
                        ${t.extended_entities && t.extended_entities.media.length === 1 && t.extended_entities.media[0].type === 'animated_gif' ? /*html*/`<span class="tweet-interact-more-menu-download-gif" data-gifno="1">${LOC.download_gif.message}</span>` : ``}
                        ${t.extended_entities && t.extended_entities.media.length > 1 ? t.extended_entities.media.filter(m => m.type === 'animated_gif').map((m, i) => /*html*/`<span class="tweet-interact-more-menu-download-gif" data-gifno="${i+1}">${LOC.download_gif.message} (#${i+1})</span>`).join('\n') : ''}
                        ${t.extended_entities && t.extended_entities.media.length === 1 ? /*html*/`<span class="tweet-interact-more-menu-download">${LOC.download_media.message}</span>` : ``}
                    </div>
                    ${options.selfThreadButton && t.self_thread && t.self_thread.id_str && !options.threadContinuation && !location.pathname.includes('/status/') ? /*html*/`<a class="tweet-self-thread-button tweet-thread-right" target="_blank" href="https://twitter.com/${t.user.screen_name}/status/${t.self_thread.id_str}">${LOC.show_this_thread.message}</a>` : ``}
                    ${!options.noTop && !options.selfThreadButton && t.in_reply_to_status_id_str && !(options.threadContinuation || (options.selfThreadContinuation && t.self_thread && t.self_thread.id_str)) && !location.pathname.includes('/status/') ? `<a class="tweet-self-thread-button tweet-thread-right" target="_blank" href="https://twitter.com/${t.in_reply_to_screen_name}/status/${t.in_reply_to_status_id_str}">${LOC.show_this_thread.message}</a>` : ``}
                </div>
                <div class="tweet-reply" hidden>
                    <br>
                    <b style="font-size: 12px;display: block;margin-bottom: 5px;">${LOC.replying_to_tweet.message} <span class="tweet-reply-upload">${LOC.upload_media_btn.message}</span> <span class="tweet-reply-add-emoji">${LOC.emoji_btn.message}</span> <span class="tweet-reply-cancel">${LOC.cancel_btn.message}</span></b>
                    <span class="tweet-reply-error" style="color:red"></span>
                    <textarea maxlength="1000" class="tweet-reply-text" placeholder="${LOC.reply_example.message}"></textarea>
                    <button class="tweet-reply-button nice-button">${LOC.reply.message}</button><br>
                    <span class="tweet-reply-char">0/280</span><br>
                    <div class="tweet-reply-media" style="padding-bottom: 10px;"></div>
                </div>
                <div class="tweet-quote" hidden>
                    <br>
                    <b style="font-size: 12px;display: block;margin-bottom: 5px;">${LOC.quote_tweet.message} <span class="tweet-quote-upload">${LOC.upload_media_btn.message}</span> <span class="tweet-quote-add-emoji">${LOC.emoji_btn.message}</span> <span class="tweet-quote-cancel">${LOC.cancel_btn.message}</span></b>
                    <span class="tweet-quote-error" style="color:red"></span>
                    <textarea maxlength="1000" class="tweet-quote-text" placeholder="${LOC.quote_example.message}"></textarea>
                    <button class="tweet-quote-button nice-button">${LOC.quote.message}</button><br>
                    <span class="tweet-quote-char">0/280</span><br>
                    <div class="tweet-quote-media" style="padding-bottom: 10px;"></div>
                </div>
                <div class="tweet-self-thread-div" ${(options.threadContinuation || (options.selfThreadContinuation && t.self_thread && t.self_thread.id_str)) ? '' : 'hidden'}>
                    ${options.selfThreadContinuation && t.self_thread && t.self_thread.id_str && !location.pathname.includes('/status/') ? /*html*/`<br>
                        <a class="tweet-self-thread-button" target="_blank" href="https://twitter.com/${t.user.screen_name}/status/${t.self_thread.id_str}">
                            ${LOC.show_this_thread.message}
                        </a>
                        <span class="tweet-self-thread-line" style="margin-left: -108px;margin-top: -5px;"></span>
                        <div class="tweet-self-thread-line-dots" style="margin-left: -120px;margin-top: -3px;"></div>
                    ` : /*html*/`
                        ${location.pathname.includes('/status/') ? `<br><br>` : ''}
                        <span ${location.pathname.includes('/status/') ? `style="margin-top:-10px;" ` : ''}class="tweet-self-thread-line"></span>
                        <div ${location.pathname.includes('/status/') ? `style="margin-top:-8px;" ` : ''}class="tweet-self-thread-line-dots"></div>
                    `}
                </div>
            </div>
        `;
        // video
        if(videos) {
            let videoErrors = 0;
            let vids = Array.from(tweet.getElementsByClassName('tweet-media')[0].children).filter(e => e.tagName === 'VIDEO');
            vids[0].addEventListener('error', () => {
                if(videoErrors >= 3) return;
                videoErrors++;
                setTimeout(() => {
                    vids[0].load();
                }, 25);
            })
            vids[0].onloadstart = () => {
                let src = vids[0].currentSrc;
                Array.from(tweet.getElementsByClassName('tweet-video-quality')).forEach(el => {
                    if(el.dataset.url === src) el.classList.add('tweet-video-quality-current');
                });
                tweet.getElementsByClassName('tweet-video-reload')[0].addEventListener('click', () => {
                    let vid = Array.from(tweet.getElementsByClassName('tweet-media')[0].children).filter(e => e.tagName === 'VIDEO')[0];
                    let time = vid.currentTime;
                    let paused = vid.paused;
                    vid.load();
                    vid.onloadstart = () => {
                        let src = vid.currentSrc;
                        vid.currentTime = time;
                        if(!paused) vid.play();
                        Array.from(tweet.getElementsByClassName('tweet-video-quality')).forEach(el => {
                            if(el.dataset.url === src.split('&ttd=')[0]) el.classList.add('tweet-video-quality-current');
                            else el.classList.remove('tweet-video-quality-current');
                        });
                    }
                });
                Array.from(tweet.getElementsByClassName('tweet-video-quality')).forEach(el => el.addEventListener('click', () => {
                    if(el.className.includes('tweet-video-quality-current')) return;
                    localStorage.preferredQuality = parseInt(el.innerText);
                    let vid = Array.from(tweet.getElementsByClassName('tweet-media')[0].children).filter(e => e.tagName === 'VIDEO')[0];
                    let time = vid.currentTime;
                    let paused = vid.paused;
                    for(let v of videos) { 
                        let closestQuality = v.video_info.variants.filter(v => v.bitrate).reduce((prev, curr) => {
                            return (Math.abs(parseInt(curr.url.match(/\/(\d+)x/)[1]) - parseInt(localStorage.preferredQuality)) < Math.abs(parseInt(prev.url.match(/\/(\d+)x/)[1]) - parseInt(localStorage.preferredQuality)) ? curr : prev);
                        });
                        let preferredQualityVariantIndex = v.video_info.variants.findIndex(v => v.url === closestQuality.url);
                        if(preferredQualityVariantIndex !== -1) {
                            let preferredQualityVariant = v.video_info.variants[preferredQualityVariantIndex];
                            v.video_info.variants.splice(preferredQualityVariantIndex, 1);
                            v.video_info.variants.unshift(preferredQualityVariant);
                        }
                    }
                    tweet.getElementsByClassName('tweet-media')[0].innerHTML = /*html*/`
                        ${t.extended_entities.media.map(m => `<${m.type === 'photo' ? 'img' : 'video'} ${m.ext_alt_text ? `alt="${escapeHTML(m.ext_alt_text)}" title="${escapeHTML(m.ext_alt_text)}"` : ''} crossorigin="anonymous" width="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[0]}" height="${sizeFunctions[t.extended_entities.media.length](m.original_info.width, m.original_info.height)[1]}" loading="lazy" ${m.type === 'video' ? 'controls' : ''} ${m.type === 'animated_gif' ? 'loop autoplay muted' : ''} ${m.type === 'photo' ? `src="${m.media_url_https}"` : ''} class="tweet-media-element ${mediaClasses[t.extended_entities.media.length]} ${!vars.displaySensitiveContent && t.possibly_sensitive ? 'tweet-media-element-censor' : ''}">${m.type === 'video' || m.type === 'animated_gif' ? `
                            ${m.video_info.variants.map(v => `<source src="${v.url}&ttd=${Date.now()}" type="${v.content_type}">`).join('\n')}
                            ${LOC.unsupported_video.message}
                        </video>` : ''}`).join('\n')}
                    `;
                    vid = Array.from(tweet.getElementsByClassName('tweet-media')[0].children).filter(e => e.tagName === 'VIDEO')[0];
                    vid.onloadstart = () => {
                        let src = vid.currentSrc;
                        vid.currentTime = time;
                        if(!paused) vid.play();
                        Array.from(tweet.getElementsByClassName('tweet-video-quality')).forEach(el => {
                            if(el.dataset.url === src.split('&ttd=')[0]) el.classList.add('tweet-video-quality-current');
                            else el.classList.remove('tweet-video-quality-current');
                        });
                    }
                }));
            };
            for(let vid of vids) {
                if(typeof vars.volume === 'number') {
                    vid.volume = vars.volume;
                }
                vid.onvolumechange = () => {
                    chrome.storage.sync.set({
                        volume: vid.volume
                    }, () => { });
                    let allVids = document.getElementsByTagName('video');
                    for(let i = 0; i < allVids.length; i++) {
                        allVids[i].volume = vid.volume;
                    }
                };
                vid.addEventListener('mousedown', e => {
                    if(e.button === 1) {
                        e.preventDefault();
                        window.open(vid.currentSrc, '_blank');
                    }
                });
            }
        }

        let footerFavorites = tweet.getElementsByClassName('tweet-footer-favorites')[0];
        if(t.card) {
            generateCard(t, tweet, user);
        }
        if (options.top) {
            tweet.querySelector('.tweet-top').hidden = false;
            const icon = document.createElement('span');
            icon.innerText = options.top.icon;
            icon.classList.add('tweet-top-icon');
            icon.style.color = options.top.color;

            const span = document.createElement("span");
            span.classList.add("tweet-top-text");
            span.innerHTML = options.top.text;
            if(options.top.class) {
                span.classList.add(options.top.class);
                tweet.classList.add(`tweet-top-${options.top.class}`);
            }
            tweet.querySelector('.tweet-top').append(icon, span);
        }
        if(options.mainTweet) {
            let likers = mainTweetLikers.slice(0, 8);
            for(let i in likers) {
                let liker = likers[i];
                let a = document.createElement('a');
                a.href = `https://twitter.com/${liker.screen_name}`;
                let likerImg = document.createElement('img');
                likerImg.src = liker.profile_image_url_https;
                likerImg.classList.add('tweet-footer-favorites-img');
                likerImg.title = liker.name + ' (@' + liker.screen_name + ')';
                likerImg.width = 24;
                likerImg.height = 24;
                a.dataset.id = liker.id_str;
                a.appendChild(likerImg);
                footerFavorites.appendChild(a);
            }
            let likesLink = tweet.getElementsByClassName('tweet-footer-stat-f')[0];
            likesLink.addEventListener('click', e => {
                e.preventDefault();
                document.getElementById('loading-box').hidden = false;
                history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}/likes`);
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
            let retweetsLink = tweet.getElementsByClassName('tweet-footer-stat-r')[0];
            retweetsLink.addEventListener('click', e => {
                e.preventDefault();
                document.getElementById('loading-box').hidden = false;
                history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}/retweets`);
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
            let repliesLink = tweet.getElementsByClassName('tweet-footer-stat-o')[0];
            repliesLink.addEventListener('click', e => {
                e.preventDefault();
                if(location.href === `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`) return;
                document.getElementById('loading-box').hidden = false;
                history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
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
        if(options.mainTweet && t.user.id_str !== user.id_str) {
            const tweetFollow = tweet.getElementsByClassName('tweet-header-follow')[0];
            tweetFollow.addEventListener('click', async () => {
                if(t.user.following) {
                    try {
                        await API.unfollowUser(t.user.screen_name);
                    } catch(e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    tweetFollow.innerText = LOC.follow.message;
                    tweetFollow.classList.remove('following');
                    tweetFollow.classList.add('follow');
                    t.user.following = false;
                } else {
                    try {
                        await API.followUser(t.user.screen_name);
                    } catch(e) {
                        console.error(e);
                        alert(e);
                        return;
                    }
                    tweetFollow.innerText = LOC.unfollow.message;
                    tweetFollow.classList.remove('follow');
                    tweetFollow.classList.add('following');
                    t.user.following = true;
                }
            });
        }
        const tweetBodyText = tweet.getElementsByClassName('tweet-body-text')[0];
        const tweetTranslate = tweet.getElementsByClassName('tweet-translate')[0];
        const tweetTranslateAfter = tweet.getElementsByClassName('tweet-translate-after')[0];
        const tweetBodyQuote = tweet.getElementsByClassName('tweet-body-quote')[0];
        const tweetMediaQuote = tweet.getElementsByClassName('tweet-media-quote')[0];
        const tweetBodyQuoteText = tweet.getElementsByClassName('tweet-body-text-quote')[0];
        const tweetDeleteBookmark = tweet.getElementsByClassName('tweet-delete-bookmark')[0];

        const tweetReplyCancel = tweet.getElementsByClassName('tweet-reply-cancel')[0];
        const tweetReplyUpload = tweet.getElementsByClassName('tweet-reply-upload')[0];
        const tweetReplyAddEmoji = tweet.getElementsByClassName('tweet-reply-add-emoji')[0];
        const tweetReply = tweet.getElementsByClassName('tweet-reply')[0];
        const tweetReplyButton = tweet.getElementsByClassName('tweet-reply-button')[0];
        const tweetReplyError = tweet.getElementsByClassName('tweet-reply-error')[0];
        const tweetReplyText = tweet.getElementsByClassName('tweet-reply-text')[0];
        const tweetReplyChar = tweet.getElementsByClassName('tweet-reply-char')[0];
        const tweetReplyMedia = tweet.getElementsByClassName('tweet-reply-media')[0];

        const tweetInteractReply = tweet.getElementsByClassName('tweet-interact-reply')[0];
        const tweetInteractRetweet = tweet.getElementsByClassName('tweet-interact-retweet')[0];
        const tweetInteractFavorite = tweet.getElementsByClassName('tweet-interact-favorite')[0];
        const tweetInteractMore = tweet.getElementsByClassName('tweet-interact-more')[0];

        const tweetFooterReplies = tweet.getElementsByClassName('tweet-footer-stat-replies')[0];
        const tweetFooterRetweets = tweet.getElementsByClassName('tweet-footer-stat-retweets')[0];
        const tweetFooterFavorites = tweet.getElementsByClassName('tweet-footer-stat-favorites')[0];

        const tweetQuote = tweet.getElementsByClassName('tweet-quote')[0];
        const tweetQuoteCancel = tweet.getElementsByClassName('tweet-quote-cancel')[0];
        const tweetQuoteUpload = tweet.getElementsByClassName('tweet-quote-upload')[0];
        const tweetQuoteAddEmoji = tweet.getElementsByClassName('tweet-quote-add-emoji')[0];
        const tweetQuoteButton = tweet.getElementsByClassName('tweet-quote-button')[0];
        const tweetQuoteError = tweet.getElementsByClassName('tweet-quote-error')[0];
        const tweetQuoteText = tweet.getElementsByClassName('tweet-quote-text')[0];
        const tweetQuoteChar = tweet.getElementsByClassName('tweet-quote-char')[0];
        const tweetQuoteMedia = tweet.getElementsByClassName('tweet-quote-media')[0];

        const tweetInteractRetweetMenu = tweet.getElementsByClassName('tweet-interact-retweet-menu')[0];
        const tweetInteractRetweetMenuRetweet = tweet.getElementsByClassName('tweet-interact-retweet-menu-retweet')[0];
        const tweetInteractRetweetMenuQuote = tweet.getElementsByClassName('tweet-interact-retweet-menu-quote')[0];
        const tweetInteractRetweetMenuQuotes = tweet.getElementsByClassName('tweet-interact-retweet-menu-quotes')[0];
        const tweetInteractRetweetMenuRetweeters = tweet.getElementsByClassName('tweet-interact-retweet-menu-retweeters')[0];

        const tweetInteractMoreMenu = tweet.getElementsByClassName('tweet-interact-more-menu')[0];
        const tweetInteractMoreMenuCopy = tweet.getElementsByClassName('tweet-interact-more-menu-copy')[0];
        const tweetInteractMoreMenuEmbed = tweet.getElementsByClassName('tweet-interact-more-menu-embed')[0];
        const tweetInteractMoreMenuShare = tweet.getElementsByClassName('tweet-interact-more-menu-share')[0];
        const tweetInteractMoreMenuAnalytics = tweet.getElementsByClassName('tweet-interact-more-menu-analytics')[0];
        const tweetInteractMoreMenuRefresh = tweet.getElementsByClassName('tweet-interact-more-menu-refresh')[0];
        const tweetInteractMoreMenuMute = tweet.getElementsByClassName('tweet-interact-more-menu-mute')[0];
        const tweetInteractMoreMenuDownload = tweet.getElementsByClassName('tweet-interact-more-menu-download')[0];
        const tweetInteractMoreMenuDownloadGifs = Array.from(tweet.getElementsByClassName('tweet-interact-more-menu-download-gif'));
        const tweetInteractMoreMenuDelete = tweet.getElementsByClassName('tweet-interact-more-menu-delete')[0];
        const tweetInteractMoreMenuPin = tweet.getElementsByClassName('tweet-interact-more-menu-pin')[0];
        const tweetInteractMoreMenuFollow = tweet.getElementsByClassName('tweet-interact-more-menu-follow')[0];
        const tweetInteractMoreMenuBlock = tweet.getElementsByClassName('tweet-interact-more-menu-block')[0];
        const tweetInteractMoreMenuBookmark = tweet.getElementsByClassName('tweet-interact-more-menu-bookmark')[0];
        const tweetInteractMoreMenuFeedbacks = Array.from(tweet.getElementsByClassName('tweet-interact-more-menu-feedback'));

        // Quote body
        if(tweetMediaQuote) tweetMediaQuote.addEventListener('click', e => {
            if(e && e.target && e.target.tagName === "VIDEO") {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if(e.target.paused) {
                    e.target.play();
                } else {
                    e.target.pause();
                }
            }
        });
        if(t.quoted_status && t.quoted_status.entities && t.quoted_status.entities.urls) {
            for(let u of t.quoted_status.entities.urls) {
                tweetBodyQuoteText.innerHTML = tweetBodyQuoteText.innerHTML.replace(new RegExp(u.url, "g"), escapeHTML(u.display_url));
            }
        }
        if(tweetBodyQuote) {
            if(typeof mainTweetLikers !== 'undefined') {
                tweetBodyQuote.addEventListener('click', e => {
                    e.preventDefault();
                    document.getElementById('loading-box').hidden = false;
                    history.pushState({}, null, `https://twitter.com/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}`);
                    updateSubpage();
                    mediaToUpload = [];
                    linkColors = {};
                    cursor = undefined;
                    seenReplies = [];
                    mainTweetLikers = [];
                    let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                    if(subpage === 'tweet') {
                        updateReplies(id);
                    } else if(subpage === 'likes') {
                        updateLikes(id);
                    } else if(subpage === 'retweets') {
                        updateRetweets(id);
                    } else if(subpage === 'retweets_with_comments') {
                        updateRetweetsWithComments(id);
                    }
                    renderDiscovery();
                    renderTrends();
                    currentLocation = location.pathname;
                });
            } else {
                tweetBodyQuote.addEventListener('click', e => {
                    e.preventDefault();
                    new TweetViewer(user, t.quoted_status);
                });
            }
        }
        if(tweetTranslate || tweetTranslateAfter) if(options.translate || vars.autotranslateProfiles.includes(t.user.id_str) || (typeof toAutotranslate !== 'undefined' && toAutotranslate)) {
            onVisible(tweet, () => {
                if(!t.translated) {
                    if(tweetTranslate) tweetTranslate.click();
                    else if(tweetTranslateAfter) tweetTranslateAfter.click();
                }
            })
        }

        // Translate
        t.translated = false;
        if(tweetTranslate || tweetTranslateAfter) (tweetTranslate ? tweetTranslate : tweetTranslateAfter).addEventListener('click', async () => {
            if(t.translated) return;
            let translated = await API.translateTweet(t.id_str);
            t.translated = true;
            (tweetTranslate ? tweetTranslate : tweetTranslateAfter).hidden = true;
            tweetBodyText.innerHTML += `<br>
            <span style="font-size: 12px;color: var(--light-gray);">${LOC.translated_from.message} [${translated.translated_lang}]:</span>
            <br>
            <span class="tweet-translated-text">${escapeHTML(translated.text).replace(/((http|https|ftp):\/\/[\w?=.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a>').replace(/(?<!\w)@([\w+]{1,15}\b)/g, `<a href="https://twitter.com/$1">@$1</a>`).replace(hashtagRegex, `<a href="https://twitter.com/hashtag/$2">#$2</a>`).replace(/\n/g, '<br>')}</span>`;
            if(vars.enableTwemoji) twemoji.parse(tweetBodyText);
            let links = Array.from(tweetBodyText.getElementsByClassName('tweet-translated-text')[0].getElementsByTagName('a'));
            links.forEach(a => {
                let link = t.entities.urls && t.entities.urls.find(u => u.url === a.href.split('?')[0].split('#')[0]);
                if (link) {
                    a.innerText = link.display_url;
                    a.href = link.expanded_url;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                }
            });
        });

        // Bookmarks
        if(tweetInteractMoreMenuBookmark) tweetInteractMoreMenuBookmark.addEventListener('click', async () => {
            API.createBookmark(t.id_str);
        });
        if(tweetDeleteBookmark) tweetDeleteBookmark.addEventListener('click', async () => {
            await API.deleteBookmark(t.id_str);
            tweet.remove();
            if(timelineContainer.children.length === 0) {
                timelineContainer.innerHTML = `<div style="color:var(--light-gray)">${LOC.empty.message}</div>`;
                document.getElementById('delete-all').hidden = true;
            }
        });

        // Media
        if (t.extended_entities && t.extended_entities.media) {
            const tweetMedia = tweet.getElementsByClassName('tweet-media')[0];
            tweetMedia.addEventListener('click', e => {
                if (e.target.className.includes('tweet-media-element-censor')) {
                    return e.target.classList.remove('tweet-media-element-censor');
                }
                if (e.target.tagName === 'IMG') {
                    new Viewer(tweetMedia, {
                        transition: false
                    });
                    e.target.click();
                }
            });
            if(typeof pageUser !== 'undefined' && !location.pathname.includes("/likes")) {
                let profileMediaDiv = document.getElementById('profile-media-div');
                if(!options || !options.top || !options.top.text || !options.top.text.includes('retweeted')) t.extended_entities.media.forEach(m => {
                    if(profileMediaDiv.children.length >= 6) return;
                    let ch = Array.from(profileMediaDiv.children);
                    if(ch.find(c => c.src === m.media_url_https)) return;
                    const media = document.createElement('img');
                    media.classList.add('tweet-media-element', 'tweet-media-element-four', 'profile-media-preview');
                    media.src = m.media_url_https;
                    if(m.ext_alt_text) media.alt = m.ext_alt_text;
                    media.addEventListener('click', async () => {
                        if(subpage !== 'profile' && subpage !== 'media') {
                            document.getElementById('profile-stat-tweets-link').click();
                            while(!document.getElementsByClassName('tweet-id-' + t.id_str)[0]) await sleep(100);
                        }
                        document.getElementsByClassName('tweet-id-' + t.id_str)[0].scrollIntoView({behavior: 'smooth', block: 'center'});
                    });
                    profileMediaDiv.appendChild(media);
                });
            }
        }

        // Links
        if (tweetBodyText && tweetBodyText.lastChild && tweetBodyText.lastChild.href && tweetBodyText.lastChild.href.startsWith('https://t.co/')) {
            if (t.entities.urls && (t.entities.urls.length === 0 || !tweetBodyText.lastChild.href.includes(t.entities.urls[t.entities.urls.length - 1].url))) {
                tweetBodyText.lastChild.remove();
            }
        }
        let links = Array.from(tweetBodyText.getElementsByTagName('a')).filter(a => a.href.startsWith('https://t.co/'));
        links.forEach(a => {
            if(a.href.endsWith('.') || a.href.endsWith(';') || a.href.endsWith('?')) a.href = a.href.slice(0, -1);
            let link = t.entities.urls && t.entities.urls.find(u => u.url === a.href.split('?')[0].split('#')[0]);
            if (link) {
                a.innerText = link.display_url;
                a.href = link.expanded_url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            } else {
                a.remove();
            }
        });

        // Emojis
        [tweetReplyAddEmoji, tweetQuoteAddEmoji].forEach(e => {
            e.addEventListener('click', e => {
                let isReply = e.target.className === 'tweet-reply-add-emoji';
                createEmojiPicker(isReply ? tweetReply : tweetQuote, isReply ? tweetReplyText : tweetQuoteText, {});
            });
        });

        // Reply
        tweetReplyCancel.addEventListener('click', () => {
            tweetReply.hidden = true;
            tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
        });
        let replyMedia = [];
        tweetReply.addEventListener('drop', e => {
            handleDrop(e, replyMedia, tweetReplyMedia);
        });
        tweetReply.addEventListener('paste', event => {
            let items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (index in items) {
                let item = items[index];
                if (item.kind === 'file') {
                    let file = item.getAsFile();
                    handleFiles([file], replyMedia, tweetReplyMedia);
                }
            }
        });
        tweetReplyUpload.addEventListener('click', () => {
            getMedia(replyMedia, tweetReplyMedia);
            tweetReplyText.focus();
        });
        tweetInteractReply.addEventListener('click', () => {
            if(options.mainTweet) {
                document.getElementById('new-tweet').click();
                document.getElementById('new-tweet-text').focus();
                return;
            }
            if (!tweetQuote.hidden) tweetQuote.hidden = true;
            if (tweetReply.hidden) {
                tweetInteractReply.classList.add('tweet-interact-reply-clicked');
            } else {
                tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
            }
            tweetReply.hidden = !tweetReply.hidden;
            setTimeout(() => {
                tweetReplyText.focus();
            })
        });
        tweetReplyText.addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.ctrlKey) {
                tweetReplyButton.click();
            }
        });
        tweetReplyText.addEventListener('input', e => {
            let text = tweetReplyText.value.replace(linkRegex, ' https://t.co/xxxxxxxxxx').trim();
            tweetReplyChar.innerText = `${text.length}/280`;
            if(text.length > 265) {
                tweetReplyChar.style.color = "#c26363";
            } else {
                tweetReplyChar.style.color = "";
            }
            if (text.length > 280) {
                tweetReplyChar.style.color = "red";
                tweetReplyButton.disabled = true;
            } else {
                tweetReplyButton.disabled = false;
            }
        });
        tweetReplyButton.addEventListener('click', async () => {
            tweetReplyError.innerHTML = '';
            let text = tweetReplyText.value;
            if (text.length === 0 && replyMedia.length === 0) return;
            tweetReplyButton.disabled = true;
            let uploadedMedia = [];
            for (let i in replyMedia) {
                let media = replyMedia[i];
                try {
                    media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = false;
                    let mediaId = await API.uploadMedia({
                        media_type: media.type,
                        media_category: media.category,
                        media: media.data,
                        alt: media.alt,
                        loadCallback: data => {
                            media.div.getElementsByClassName('new-tweet-media-img-progress')[0].innerText = `${data.text} (${data.progress}%)`;
                        }
                    });
                    uploadedMedia.push(mediaId);
                } catch (e) {
                    media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = true;
                    console.error(e);
                    alert(e);
                }
            }
            let tweetObject = {
                status: text,
                in_reply_to_status_id: t.id_str,
                auto_populate_reply_metadata: true,
                batch_mode: 'off',
                exclude_reply_user_ids: '',
                cards_platform: 'Web-13',
                include_entities: 1,
                include_user_entities: 1,
                include_cards: 1,
                send_error_codes: 1,
                tweet_mode: 'extended',
                include_ext_alt_text: true,
                include_reply_count: true
            };
            if (uploadedMedia.length > 0) {
                tweetObject.media_ids = uploadedMedia.join(',');
            }
            let tweetData;
            try {
                tweetData = await API.postTweet(tweetObject)
            } catch (e) {
                tweetReplyError.innerHTML = (e && e.message ? e.message : e) + "<br>";
                tweetReplyButton.disabled = false;
                return;
            }
            if (!tweetData) {
                tweetReplyButton.disabled = false;
                tweetReplyError.innerHTML = `${LOC.error_sending_tweet.message}<br>`;
                return;
            }
            tweetReplyChar.innerText = '0/280';
            tweetReplyText.value = '';
            tweetReply.hidden = true;
            tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
            if(!options.mainTweet) {
                tweetInteractReply.dataset.val = parseInt(tweetInteractReply.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1;
                tweetInteractReply.innerText = Number(parseInt(tweetInteractReply.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).toLocaleString().replace(/\s/g, ',');
            } else {
                tweetFooterReplies.dataset.val = parseInt(tweetFooterReplies.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1;
                tweetFooterReplies.innerText = Number(parseInt(tweetFooterReplies.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).toLocaleString().replace(/\s/g, ',');
            }
            tweetData._ARTIFICIAL = true;
            if(typeof timeline !== 'undefined') {
                timeline.data.unshift(tweetData);
            }
            if(tweet.getElementsByClassName('tweet-self-thread-div')[0]) tweet.getElementsByClassName('tweet-self-thread-div')[0].hidden = false;
            tweetReplyButton.disabled = false;
            tweetReplyMedia.innerHTML = [];
            replyMedia = [];
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
            appendTweet(tweetData, document.getElementById('timeline'), {
                noTop: true,
                after: tweet
            });
        });

        // Retweet / Quote Tweet
        let retweetClicked = false;
        tweetQuoteCancel.addEventListener('click', () => {
            tweetQuote.hidden = true;
        });
        tweetInteractRetweet.addEventListener('click', async () => {
            if(tweetInteractRetweet.classList.contains('tweet-interact-retweet-disabled')) {
                return;
            }
            if (!tweetQuote.hidden) {
                tweetQuote.hidden = true;
                return;
            }
            if (tweetInteractRetweetMenu.hidden) {
                tweetInteractRetweetMenu.hidden = false;
            }
            if(retweetClicked) return;
            retweetClicked = true;
            setTimeout(() => {
                document.body.addEventListener('click', () => {
                    retweetClicked = false;
                    setTimeout(() => tweetInteractRetweetMenu.hidden = true, 50);
                }, { once: true });
            }, 50);
        });
        t.renderRetweetsUp = (tweetData) => {
            tweetInteractRetweetMenuRetweet.innerText = LOC.unretweet.message;
            tweetInteractRetweet.classList.add('tweet-interact-retweeted');
            t.retweeted = true;
            t.newTweetId = tweetData.id_str;
            if(!options.mainTweet) {
                tweetInteractRetweet.dataset.val = parseInt(tweetInteractRetweet.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1;
                tweetInteractRetweet.innerText = Number(parseInt(tweetInteractRetweet.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).toLocaleString().replace(/\s/g, ',');
            } else {
                tweetFooterRetweets.innerText = Number(parseInt(tweetFooterRetweets.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).toLocaleString().replace(/\s/g, ',');
            }
        }
        t.renderRetweetsDown = () => {
            tweetInteractRetweetMenuRetweet.innerText = LOC.retweet.message;
            tweetInteractRetweet.classList.remove('tweet-interact-retweeted');
            t.retweeted = false;
            if(!options.mainTweet) {
                tweetInteractRetweet.dataset.val = parseInt(tweetInteractRetweet.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1;
                tweetInteractRetweet.innerText = Number(parseInt(tweetInteractRetweet.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1).toLocaleString().replace(/\s/g, ',');
            } else {
                tweetFooterRetweets.innerText = Number(parseInt(tweetFooterRetweets.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1).toLocaleString().replace(/\s/g, ',');
            }
            delete t.newTweetId;
        }
        tweetInteractRetweetMenuRetweet.addEventListener('click', async () => {
            if (!t.retweeted) {
                let tweetData;
                try {
                    tweetData = await API.retweetTweet(t.id_str);
                } catch (e) {
                    console.error(e);
                    return;
                }
                if (!tweetData) {
                    return;
                }
                t.renderRetweetsUp(tweetData);
            } else {
                let tweetData;
                try {
                    tweetData = await API.deleteTweet(t.current_user_retweet ? t.current_user_retweet.id_str : t.newTweetId);
                } catch (e) {
                    console.error(e);
                    return;
                }
                if (!tweetData) {
                    return;
                }
                if(t.current_user_retweet) {
                    if(options.top && options.top.icon && options.top.icon === "\uf006") {
                        tweet.remove();
                        if(typeof timeline !== 'undefined') {
                            let index = timeline.data.findIndex((tweet) => tweet.retweeted_status && tweet.retweeted_status.id_str === t.id_str && !tweet.current_user_retweet);
                            if(index > -1) {
                                timeline.data.splice(index, 1);
                                let originalTweet = timeline.data.find((tweet) => tweet.id_str === t.id_str);
                                if(originalTweet) {
                                    delete originalTweet.current_user_retweet;
                                    originalTweet.renderRetweetsDown();
                                }
                            }
                        }
                    } else {
                        let retweetedElement = Array.from(document.getElementsByClassName('tweet')).find(te => te.dataset.tweetId === t.id_str && te.getElementsByClassName('retweet')[0]);
                        if(retweetedElement) {
                            retweetedElement.remove();
                        }
                        if(typeof timeline !== 'undefined') {
                            let index = timeline.data.findIndex((tweet) => tweet.retweeted_status && tweet.retweeted_status.id_str === t.id_str && !tweet.current_user_retweet);
                            if(index > -1) {
                                timeline.data.splice(index, 1);
                            }
                        }
                    }
                }
                t.renderRetweetsDown();
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
        if(options.mainTweet) {
            tweetInteractRetweetMenuQuotes.addEventListener('click', async () => {
                document.getElementById('loading-box').hidden = false;
                history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments`);
                updateSubpage();
                mediaToUpload = [];
                linkColors = {};
                cursor = undefined;
                seenReplies = [];
                mainTweetLikers = [];
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                if(subpage === 'tweet') {
                    updateReplies(id);
                } else if(subpage === 'likes') {
                    updateLikes(id);
                } else if(subpage === 'retweets') {
                    updateRetweets(id);
                } else if(subpage === 'retweets_with_comments') {
                    updateRetweetsWithComments(id);
                }
                renderDiscovery();
                renderTrends();
                currentLocation = location.pathname;
            });
            tweetInteractRetweetMenuRetweeters.addEventListener('click', async () => {
                document.getElementById('loading-box').hidden = false;
                history.pushState({}, null, `https://twitter.com/${t.user.screen_name}/status/${t.id_str}/retweets`);
                updateSubpage();
                mediaToUpload = [];
                linkColors = {};
                cursor = undefined;
                seenReplies = [];
                mainTweetLikers = [];
                let id = location.pathname.match(/status\/(\d{1,32})/)[1];
                if(subpage === 'tweet') {
                    updateReplies(id);
                } else if(subpage === 'likes') {
                    updateLikes(id);
                } else if(subpage === 'retweets') {
                    updateRetweets(id);
                } else if(subpage === 'retweets_with_comments') {
                    updateRetweetsWithComments(id);
                }
                renderDiscovery();
                renderTrends();
                currentLocation = location.pathname;
            });
        }
        tweetInteractRetweetMenuQuote.addEventListener('click', async () => {
            if (!tweetReply.hidden) {
                tweetInteractReply.classList.remove('tweet-interact-reply-clicked');
                tweetReply.hidden = true;
            }
            tweetQuote.hidden = false;
            setTimeout(() => {
                tweetQuoteText.focus();
            })
        });
        let quoteMedia = [];
        tweetQuote.addEventListener('drop', e => {
            handleDrop(e, quoteMedia, tweetQuoteMedia);
        });
        tweetQuote.addEventListener('paste', event => {
            let items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (index in items) {
                let item = items[index];
                if (item.kind === 'file') {
                    let file = item.getAsFile();
                    handleFiles([file], quoteMedia, tweetQuoteMedia);
                }
            }
        });
        tweetQuoteUpload.addEventListener('click', () => {
            getMedia(quoteMedia, tweetQuoteMedia);
        });
        tweetQuoteText.addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.ctrlKey) {
                tweetQuoteButton.click();
            }
        });
        tweetQuoteText.addEventListener('input', e => {
            let text = tweetQuoteText.value.replace(linkRegex, ' https://t.co/xxxxxxxxxx').trim();
            tweetQuoteChar.innerText = `${text.length}/280`;
            if(text.length > 265) {
                tweetQuoteChar.style.color = "#c26363";
            } else {
                tweetQuoteChar.style.color = "";
            }
            if (text.length > 280) {
                tweetQuoteChar.style.color = "red";
                tweetQuoteButton.disabled = true;
            } else {
                tweetQuoteButton.disabled = false;
            }
        });
        tweetQuoteButton.addEventListener('click', async () => {
            let text = tweetQuoteText.value;
            tweetQuoteError.innerHTML = '';
            if (text.length === 0 && quoteMedia.length === 0) return;
            tweetQuoteButton.disabled = true;
            let uploadedMedia = [];
            for (let i in quoteMedia) {
                let media = quoteMedia[i];
                try {
                    media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = false;
                    let mediaId = await API.uploadMedia({
                        media_type: media.type,
                        media_category: media.category,
                        media: media.data,
                        alt: media.alt,
                        loadCallback: data => {
                            media.div.getElementsByClassName('new-tweet-media-img-progress')[0].innerText = `${data.text} (${data.progress}%)`;
                        }
                    });
                    uploadedMedia.push(mediaId);
                } catch (e) {
                    media.div.getElementsByClassName('new-tweet-media-img-progress')[0].hidden = true;
                    console.error(e);
                    alert(e);
                }
            }
            let tweetObject = {
                status: text,
                attachment_url: `https://twitter.com/${t.user.screen_name}/status/${t.id_str}`,
                auto_populate_reply_metadata: true,
                batch_mode: 'off',
                exclude_reply_user_ids: '',
                cards_platform: 'Web-13',
                include_entities: 1,
                include_user_entities: 1,
                include_cards: 1,
                send_error_codes: 1,
                tweet_mode: 'extended',
                include_ext_alt_text: true,
                include_reply_count: true
            };
            if (uploadedMedia.length > 0) {
                tweetObject.media_ids = uploadedMedia.join(',');
            }
            let tweetData;
            try {
                tweetData = await API.postTweet(tweetObject)
            } catch (e) {
                tweetQuoteError.innerHTML = (e && e.message ? e.message : e) + "<br>";
                tweetQuoteButton.disabled = false;
                return;
            }
            if (!tweetData) {
                tweetQuoteError.innerHTML = `${LOC.error_sending_tweet}<br>`;
                tweetQuoteButton.disabled = false;
                return;
            }
            tweetQuoteText.value = '';
            tweetQuoteChar.innerText = '0/280';
            tweetQuote.hidden = true;
            tweetData._ARTIFICIAL = true;
            quoteMedia = [];
            tweetQuoteButton.disabled = false;
            tweetQuoteMedia.innerHTML = '';
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
            if(typeof timeline !== 'undefined') timeline.data.unshift(tweetData);
            else appendTweet(tweetData, timelineContainer, { prepend: true });
        });

        // Favorite
        t.renderFavoritesDown = () => {
            t.favorited = false;
            t.favorite_count--;
            if(!options.mainTweet) {
                tweetInteractFavorite.dataset.val = parseInt(tweetInteractFavorite.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1;
                tweetInteractFavorite.innerText = Number(parseInt(tweetInteractFavorite.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1).toLocaleString().replace(/\s/g, ',');;
            } else {
                if(mainTweetLikers.find(liker => liker.id_str === user.id_str)) {
                    mainTweetLikers.splice(mainTweetLikers.findIndex(liker => liker.id_str === user.id_str), 1);
                    let likerImg = footerFavorites.querySelector(`a[data-id="${user.id_str}"]`);
                    if(likerImg) likerImg.remove()
                }
                tweetFooterFavorites.innerText = Number(parseInt(tweetFooterFavorites.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) - 1).toLocaleString().replace(/\s/g, ',');
            }
            tweetInteractFavorite.classList.remove('tweet-interact-favorited');
        }
        t.renderFavoritesUp = () => {
            t.favorited = true;
            t.favorite_count++;
            if(!options.mainTweet) {
                tweetInteractFavorite.dataset.val = parseInt(tweetInteractFavorite.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1;
                tweetInteractFavorite.innerText = Number(parseInt(tweetInteractFavorite.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).toLocaleString().replace(/\s/g, ',');;
            } else {
                if(footerFavorites.children.length < 8 && !mainTweetLikers.find(liker => liker.id_str === user.id_str)) {
                    let a = document.createElement('a');
                    a.href = `https://twitter.com/${user.screen_name}`;
                    let likerImg = document.createElement('img');
                    likerImg.src = user.profile_image_url_https;
                    likerImg.classList.add('tweet-footer-favorites-img');
                    likerImg.title = user.name + ' (@' + user.screen_name + ')';
                    likerImg.width = 24;
                    likerImg.height = 24;
                    a.dataset.id = user.id_str;
                    a.appendChild(likerImg);
                    footerFavorites.appendChild(a);
                    mainTweetLikers.push(user);
                }
                tweetFooterFavorites.innerText = Number(parseInt(tweetFooterFavorites.innerText.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')) + 1).toLocaleString().replace(/\s/g, ',');
            }
            tweetInteractFavorite.classList.add('tweet-interact-favorited');
        }
        tweetInteractFavorite.addEventListener('click', () => {
            if (t.favorited) {
                API.unfavoriteTweet({
                    id: t.id_str
                }).catch(e => {
                    console.error(e);
                    alert(e);
                    t.renderFavoritesUp();
                });
                t.renderFavoritesDown();
            } else {
                API.favoriteTweet({
                    id: t.id_str
                }).catch(e => {
                    console.error(e);
                    alert(e);
                    t.renderFavoritesDown();
                });
                t.renderFavoritesUp();
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });

        // More
        let moreClicked = false;
        tweetInteractMore.addEventListener('click', () => {
            if (tweetInteractMoreMenu.hidden) {
                tweetInteractMoreMenu.hidden = false;
            }
            if(moreClicked) return;
            moreClicked = true;
            setTimeout(() => {
                document.body.addEventListener('click', () => {
                    moreClicked = false;
                    setTimeout(() => tweetInteractMoreMenu.hidden = true, 50);
                }, { once: true });
            }, 50);
        });
        if(tweetInteractMoreMenuFollow) tweetInteractMoreMenuFollow.addEventListener('click', async () => {
            if (t.user.following) {
                try {
                    await API.unfollowUser(t.user.screen_name);
                } catch(e) {
                    console.error(e);
                    alert(e);
                    return;
                }
                t.user.following = false;
                tweetInteractMoreMenuFollow.innerText = `${LOC.follow_user.message} @${t.user.screen_name}`;
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'unfollow',
                    tweet: t
                } });
                document.dispatchEvent(event);
            } else {
                try {
                    await API.followUser(t.user.screen_name);
                } catch(e) {
                    console.error(e);
                    alert(e);
                    return;
                }
                t.user.following = true;
                tweetInteractMoreMenuFollow.innerText = `${LOC.unfollow_user.message} @${t.user.screen_name}`;
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'follow',
                    tweet: t
                } });
                document.dispatchEvent(event);
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
        if(tweetInteractMoreMenuBlock) tweetInteractMoreMenuBlock.addEventListener('click', async () => {
            if (t.user.blocking) {
                await API.unblockUser(t.user.id_str);
                t.user.blocking = false;
                tweetInteractMoreMenuBlock.innerText = `${LOC.block_user.message} @${t.user.screen_name}`;
                tweetInteractMoreMenuFollow.hidden = false;
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'unblock',
                    tweet: t
                } });
                document.dispatchEvent(event);
            } else {
                let c = confirm(`${LOC.block_sure.message} @${t.user.screen_name}?`);
                if (!c) return;
                await API.blockUser(t.user.id_str);
                t.user.blocking = true;
                tweetInteractMoreMenuBlock.innerText = `${LOC.unblock_user.message} @${t.user.screen_name}`;
                tweetInteractMoreMenuFollow.hidden = true;
                t.user.following = false;
                tweetInteractMoreMenuFollow.innerText = `${LOC.follow_user.message} @${t.user.screen_name}`;
                let event = new CustomEvent('tweetAction', { detail: {
                    action: 'block',
                    tweet: t
                } });
                document.dispatchEvent(event);
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
        tweetInteractMoreMenuCopy.addEventListener('click', () => {
            navigator.clipboard.writeText(`https://twitter.com/${t.user.screen_name}/status/${t.id_str}`);
        });
        tweetInteractMoreMenuShare.addEventListener('click', () => {
            navigator.share({ url: `https://twitter.com/${t.user.screen_name}/status/${t.id_str}` });
        });
        tweetInteractMoreMenuEmbed.addEventListener('click', () => {
            openInNewTab(`https://publish.twitter.com/?query=https://twitter.com/${t.user.screen_name}/status/${t.id_str}&widget=Tweet`);
        });
        if (t.user.id_str === user.id_str) {
            tweetInteractMoreMenuAnalytics.addEventListener('click', () => {
                openInNewTab(`https://mobile.twitter.com/dimdenEFF/status/${t.id_str}/analytics`);
            });
            tweetInteractMoreMenuDelete.addEventListener('click', async () => {
                let sure = confirm(LOC.delete_sure.message);
                if (!sure) return;
                try {
                    await API.deleteTweet(t.id_str);
                } catch (e) {
                    alert(e);
                    console.error(e);
                    return;
                }
                chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
                Array.from(document.getElementsByClassName(`tweet-id-${t.id_str}`)).forEach(tweet => {
                    tweet.remove();
                });
                if(options.mainTweet) {
                    let tweets = Array.from(document.getElementsByClassName('tweet'));
                    if(tweets.length === 0) {
                        location.href = 'https://twitter.com/home';
                    } else {
                        location.href = tweets[0].getElementsByClassName('tweet-time')[0].href;
                    }
                }
                if(typeof timeline !== 'undefined') {
                    timeline.data = timeline.data.filter(tweet => tweet.id_str !== t.id_str);
                }
                if(options.after && !options.disableAfterReplyCounter) {
                    if(options.after.getElementsByClassName('tweet-self-thread-div')[0]) options.after.getElementsByClassName('tweet-self-thread-div')[0].hidden = true;
                    if(!options.after.classList.contains('tweet-main')) options.after.getElementsByClassName('tweet-interact-reply')[0].innerText = (+options.after.getElementsByClassName('tweet-interact-reply')[0].innerText - 1).toString();
                    else options.after.getElementsByClassName('tweet-footer-stat-replies')[0].innerText = (+options.after.getElementsByClassName('tweet-footer-stat-replies')[0].innerText - 1).toString();
                }
            });
            if(tweetInteractMoreMenuPin) tweetInteractMoreMenuPin.addEventListener('click', async () => {
                if(pinnedTweet && pinnedTweet.id_str === t.id_str) {
                    await API.unpinTweet(t.id_str);
                    pinnedTweet = null;
                    tweet.remove();
                    let tweetTime = new Date(t.created_at).getTime();
                    let beforeTweet = Array.from(document.getElementsByClassName('tweet')).find(i => {
                        let timestamp = +i.getElementsByClassName('tweet-time')[0].dataset.timestamp;
                        return timestamp < tweetTime;
                    });
                    if(beforeTweet) {
                        appendTweet(t, timelineContainer, { after: beforeTweet, disableAfterReplyCounter: true });
                    }
                    return;
                } else {
                    await API.pinTweet(t.id_str);
                    pinnedTweet = t;
                    let pinnedTweetElement = Array.from(document.getElementsByClassName('tweet')).find(i => {
                        let topText = i.getElementsByClassName('tweet-top-text')[0];
                        return (topText && topText.className.includes('pinned'));
                    });
                    if(pinnedTweetElement) {
                        pinnedTweetElement.remove();
                    }
                    tweet.remove();
                    appendTweet(t, timelineContainer, {
                        prepend: true,
                        top: {
                            text: LOC.pinned_tweet.message,
                            icon: "\uf003",
                            color: "var(--link-color)",
                            class: "pinned"
                        }
                    });
                    return;
                }
            });
        }
        tweetInteractMoreMenuRefresh.addEventListener('click', async () => {
            let tweetData;
            try {
                tweetData = await API.getTweet(t.id_str);
            } catch (e) {
                console.error(e);
                return;
            }
            if (!tweetData) {
                return;
            }
            if(typeof timeline !== 'undefined') {
                let tweetIndex = timeline.data.findIndex(tweet => tweet.id_str === t.id_str);
                if (tweetIndex !== -1) {
                    timeline.data[tweetIndex] = tweetData;
                }
            }
            if (tweetInteractFavorite.className.includes('tweet-interact-favorited') && !tweetData.favorited) {
                tweetInteractFavorite.classList.remove('tweet-interact-favorited');
            }
            if (tweetInteractRetweet.className.includes('tweet-interact-retweeted') && !tweetData.retweeted) {
                tweetInteractRetweet.classList.remove('tweet-interact-retweeted');
            }
            if (!tweetInteractFavorite.className.includes('tweet-interact-favorited') && tweetData.favorited) {
                tweetInteractFavorite.classList.add('tweet-interact-favorited');
            }
            if (!tweetInteractRetweet.className.includes('tweet-interact-retweeted') && tweetData.retweeted) {
                tweetInteractRetweet.classList.add('tweet-interact-retweeted');
            }
            if(!options.mainTweet) {
                tweetInteractFavorite.innerText = tweetData.favorite_count;
                tweetInteractRetweet.innerText = tweetData.retweet_count;
                tweetInteractReply.innerText = tweetData.reply_count;
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
        tweetInteractMoreMenuMute.addEventListener('click', async () => {
            if(t.conversation_muted) {
                await API.unmuteTweet(t.id_str);
                t.conversation_muted = false;
                tweetInteractMoreMenuMute.innerText = LOC.mute_convo.message;
            } else {
                await API.muteTweet(t.id_str);
                t.conversation_muted = true;
                tweetInteractMoreMenuMute.innerText = LOC.unmute_convo.message;
            }
            chrome.storage.local.set({tweetReplies: {}, tweetDetails: {}}, () => {});
        });
        let downloading = false;
        if (t.extended_entities && t.extended_entities.media.length === 1) {
            tweetInteractMoreMenuDownload.addEventListener('click', () => {
                if (downloading) return;
                downloading = true;
                let media = t.extended_entities.media[0];
                let url = media.type === 'photo' ? media.media_url_https : media.video_info.variants[0].url;
                fetch(url).then(res => res.blob()).then(blob => {
                    downloading = false;
                    let a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = media.type === 'photo' ? media.media_url_https.split('/').pop() : media.video_info.variants[0].url.split('/').pop();
                    a.download = a.download.split('?')[0];
                    a.click();
                    a.remove();
                }).catch(e => {
                    downloading = false;
                    console.error(e);
                });
            });
        }
        if (t.extended_entities && t.extended_entities.media.some(m => m.type === 'animated_gif')) {
            tweetInteractMoreMenuDownloadGifs.forEach(dgb => dgb.addEventListener('click', e => {
                if (downloading) return;
                downloading = true;
                let n = parseInt(e.target.dataset.gifno)-1;
                let videos = Array.from(tweet.getElementsByClassName('tweet-media-gif'));
                let video = videos[n];
                let canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                let ctx = canvas.getContext('2d');
                if (video.duration > 10 && !confirm(LOC.long_vid.message)) {
                    return downloading = false;
                }
                let mde = tweet.getElementsByClassName('tweet-media-data')[0];
                mde.innerText = LOC.initialization.message + '...';
                let gif = new GIF({
                    workers: 4,
                    quality: 15,
                    debug: true
                });
                video.currentTime = 0;
                video.loop = false;
                let isFirst = true;
                let interval = setInterval(async () => {
                    if(isFirst) {
                        video.currentTime = 0;
                        isFirst = false;
                        await sleep(5);
                    }
                    mde.innerText = `${LOC.initialization.message}... (${Math.round(video.currentTime/video.duration*100|0)}%)`;
                    if (video.currentTime+0.1 >= video.duration) {
                        clearInterval(interval);
                        gif.on('working', (frame, frames) => {
                            mde.innerText = `${LOC.converting.message}... (${frame}/${frames})`;
                        });
                        gif.on('finished', blob => {
                            mde.innerText = '';
                            let a = document.createElement('a');
                            a.href = URL.createObjectURL(blob);
                            a.download = `${t.id_str}.gif`;
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
                    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    gif.addFrame(imgData, { delay: 100 });
                }, 100);
            }));
        }
        if(tweetInteractMoreMenuFeedbacks) tweetInteractMoreMenuFeedbacks.forEach(feedbackButton => {
            let feedback = t.feedback[feedbackButton.dataset.index];
            if (!feedback) return;
            feedbackButton.addEventListener('click', () => {
                chrome.storage.local.remove(["algoTimeline"], () => {});
                if(feedback.richBehavior && feedback.richBehavior.markNotInterestedTopic) {
                    fetch(`https://twitter.com/i/api/graphql/OiKldXdrDrSjh36WO9_3Xw/TopicNotInterested`, {
                        method: 'post',
                        headers: {
                            'content-type': 'application/json',
                            'authorization': OLDTWITTER_CONFIG.public_token,
                            "x-twitter-active-user": 'yes',
                            "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                            "x-twitter-auth-type": 'OAuth2Session',
                        },
                        body: JSON.stringify({"variables":{"topicId": feedback.richBehavior.markNotInterestedTopic.topicId,"undo":false},"queryId":"OiKldXdrDrSjh36WO9_3Xw"}),
                        credentials: 'include'
                    }).then(i => i.json()).then(() => {});
                }
                fetch(`https://twitter.com/i/api/graphql/vfVbgvTPTQ-dF_PQ5lD1WQ/timelinesFeedback`, {
                    method: 'post',
                    headers: {
                        'content-type': 'application/json',
                        'authorization': OLDTWITTER_CONFIG.public_token,
                        "x-twitter-active-user": 'yes',
                        "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                        "x-twitter-auth-type": 'OAuth2Session',
                    },
                    body: JSON.stringify({"variables":{"encoded_feedback_request": feedback.encodedFeedbackRequest,"undo":false},"queryId":"vfVbgvTPTQ-dF_PQ5lD1WQ"}),
                    credentials: 'include'
                }).then(i => i.json()).then(i => {
                    alert(feedback.confirmation ? feedback.confirmation : LOC.feedback_thanks.message);
                    tweet.remove();
                });
            });
        });

        if(options.after) {
            options.after.after(tweet);
        } else if (options.before) {
            options.before.before(tweet);
        } else if (options.prepend) {
            timelineContainer.prepend(tweet);
        } else {
            timelineContainer.append(tweet);
        }
        if(vars.enableTwemoji) twemoji.parse(tweet);
        return tweet;
    } catch(e) {
        console.error(e);
        if(Date.now() - lastTweetErrorDate > 1000) {
            lastTweetErrorDate = Date.now();
            createModal(`
                <div style="max-width:700px">
                    <span style="font-size:14px;color:var(--default-text-color)">
                        <h2 style="margin-top: 0">${LOC.something_went_wrong.message}</h2>
                        ${LOC.tweet_error.message}<br>
                        ${LOC.error_instructions.message.replace('$AT1$', "<a target='_blank' href='https://github.com/dimdenGD/OldTwitter/issues'>").replace(/\$AT2\$/g, '</a>').replace("$AT3$", "<a target='_blank' href='mailto:admin@dimden.dev'>")}
                    </span>
                    <div class="box" style="font-family:monospace;line-break: anywhere;padding:5px;margin-top:5px;background:rgba(255, 0, 0, 0.1);color:#ff4545">
                        ${escapeHTML(e.stack ? e.stack : String(e))} at ${t.id_str} (OldTwitter v${chrome.runtime.getManifest().version})
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