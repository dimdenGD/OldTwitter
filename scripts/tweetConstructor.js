// svgPlayIcon.

if (Intl && Intl.DateTimeFormat) {
    var tweetTimeFormatter = new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "numeric",
    });
    var tweetDateFormatter = new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    var tweetShortishTimeformatter = new Intl.DateTimeFormat(undefined, {
        dateStyle: "short",
        timeStyle: "medium",
    });
}

const svgPlayIcon = `<svg viewBox="0 0 24 24" class="tweet-media-video-overlay-play">
    <g>
        <path class="svg-play-path" d="M8 5v14l11-7z"></path>
        <path
            d="M0 0h24v24H0z"
            fill="none"
        ></path>
    </g>
</svg>`;

// === Static Nodes to be reused ===

/**
 *
 * @param {object} tweetObject The tweet object.
 * @returns {Element[]} an array of html elements
 */
function renderMultiMediaNodes(tweetObject) {
    // let _html = "";
    let htmlNodes = [];
    if (!tweetObject.extended_entities || !tweetObject.extended_entities.media)
        return htmlNodes;

    let cws = [];

    for (let i = 0; i < tweetObject.extended_entities.media.length; i++) {
        let m = tweetObject.extended_entities.media[i];
        let toCensor =
            !vars.displaySensitiveContent && tweetObject.possibly_sensitive;
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
            let [w, h] = sizeFunctions[
                tweetObject.extended_entities.media.length
            ](m.original_info.width, m.original_info.height);
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
            var mediaClass =
                mediaClasses[tweetObject.extended_entities.media.length];
            if (mediaClass) newClone.classList.add(mediaClass);
            if (toCensor) newClone.classList.add("tweet-media-element-censor");
            htmlNodes.push(newClone);
        } else if (m.type === "animated_gif") {
            let [w, h] = sizeFunctions[
                tweetObject.extended_entities.media.length
            ](m.original_info.width, m.original_info.height);
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
            var mediaClass =
                mediaClasses[tweetObject.extended_entities.media.length];
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
            htmlNodes.push(newClone);
        } else if (m.type === "video") {
            if (m.mediaStats && m.mediaStats.viewCount) {
                m.ext = {
                    mediaStats: {
                        r: { ok: { viewCount: m.mediaStats.viewCount } },
                    },
                };
            }
            let [w, h] = sizeFunctions[
                tweetObject.extended_entities.media.length
            ](m.original_info.width, m.original_info.height);
            const newClone = video_template.cloneNode(true);
            const altText = m.ext_alt_text
                ? escapeHTML(m.ext_alt_text, true)
                : "";
            if (altText) {
                newClone.alt = newClone.title = altText;
            }
            newClone.width = w;
            newClone.height = h;
            newClone.controls = true;

            newClone.disableRemotePlayback = true;
            if (vars.muteVideos) {
                newClone.defaultMuted = true;
                newClone.muted = true;
            } else {
                newClone.defaultMuted = false;
                newClone.muted = false;
            }
            var mediaClass =
                mediaClasses[tweetObject.extended_entities.media.length];
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
            htmlNodes.push(newClone);
        }
        if (i === 1 && tweetObject.extended_entities.media.length > 3) {
            htmlNodes.push(elNew("br"));
        }
    }

    if (cws.length > 0) {
        cws = [...new Set(cws)];
        cws = LOC.content_warning.message.replace("$WARNINGS$", cws.join(", "));
        htmlNodes.push(elNew("br"));
        htmlNodes.push(elNew("div", { className: "tweet-media-cws" }, [cws]));
    }
    return htmlNodes;
}

/**
 *
 * @param {object} t The base tweet object
 * @param {boolean} isQuoteMatchingLanguage Does the quote match the user's prefered language selection?
 * @param {string} quoteMentionedUserText html String containing a list of @ mentions
 * @returns
 */
async function constructQuotedTweet(
    t,
    isQuoteMatchingLanguage,
    quoteMentionedUserText,
    newQuoteMentionedUserText,
    asNode
) {
    asNode = asNode ? asNode : false;
    // === Profile Element ===
    const profileElement = elNew("img", {
        src:
            t.quoted_status.user.default_profile_image &&
            vars.useOldDefaultProfileImage
                ? chrome.runtime.getURL(
                      `images/default_profile_images/default_profile_${
                          Number(t.quoted_status.user.id_str) % 7
                      }_normal.png`
                  )
                : t.quoted_status.user.profile_image_url_https,
        alt: escapeHTML(t.quoted_status.user.name),
        className: "tweet-avatar-quote",
        width: "24",
        height: "24",
    });

    // === Name Element ===
    var userNameClass = ["tweet-header-name-quote"];

    if (t.quoted_status.user.verified) {
        userNameClass.push("user-verified");
    } else if (t.quoted_status.user.id_str === "1708130407663759360") {
        // Special case for dimden.
        userNameClass.push("user-verified", "user-verified-dimden"); // Push multiple classes
    } else if (t.quoted_status.user.protected) {
        userNameClass.push("user-protected");
    } else if (t.quoted_status.user.verified_type === "Government") {
        userNameClass.push("user-verified-gray");
    } else if (t.quoted_status.user.verified_type === "Business") {
        userNameClass.push("user-verified-yellow");
    } else if (t.quoted_status.user.verified_type === "Blue") {
        userNameClass.push("user-verified-blue");
    }

    // The name element + @ handle
    const nameElement = elNew("div", { className: "tweet-header-quote" }, [
        elNew("span", { className: "tweet-header-info-quote" }, [
            // User name
            elNew(
                "b",
                {
                    className: userNameClass,
                },
                [t.quoted_status.user.name]
            ),
            " ",
            // At handle
            elNew("span", { className: "tweet-header-handle-quote" }, [
                "@" + escapeHTML(t.quoted_status.user.screen_name),
            ]),
        ]),
    ]);
    // Time span
    const quotedDateObject = new Date(t.quoted_status.created_at);
    var titleTime = null;
    if (tweetShortishTimeformatter) {
        titleTime = tweetShortishTimeformatter.format(quotedDateObject);
    } else {
        titleTime = quotedDateObject.toLocaleString();
    }
    const tweetTimeElement = elNew(
        "span",
        {
            className: "tweet-time-quote",
            dataset: {
                timestamp: quotedDateObject.getTime(),
            },
            title: titleTime,
        },
        [timeElapsed(quotedDateObject)]
    );

    var oldStyleReplyTo = null;
    if (newQuoteMentionedUserText.length > 0 && !vars.useOldStyleReply) {
        newQuoteMentionedUserText = interleave(
            newQuoteMentionedUserText,
            LOC.replying_to_comma.message
        );

        if (newQuoteMentionedUserText.length >= 5) {
            const arrLength = newQuoteMentionedUserText.length;
            newQuoteMentionedUserText[arrLength - 2] =
                LOC.replying_to_and.message;
        }

        var textFragments = LOC.replying_to_user.message.split("$SCREEN_NAME$");
        textFragments = interleave(
            textFragments,
            newQuoteMentionedUserText
        ).flat(Infinity);

        oldStyleReplyTo = elNew(
            "span",
            { className: "tweet-reply-to tweet-quote-reply-to" },
            textFragments
        );
    }

    var textBodySpan = [vars.useOldStyleReply ? oldStyleReplyTo : ""];
    if (t.quoted_status.full_text) {
        // XXX: renderTweetBodyHTML returns html. To refactor later.
        textBodySpan.push(
            htmlToNodes(await renderTweetBodyHTML(t, true)).content
        );
    }
    const bodyElement = elNew(
        "span",
        {
            className:
                "tweet-body-text tweet-body-text-quote tweet-body-text-long",
            style: "color:var(--default-text-color)!important",
        },
        textBodySpan
    );

    // Solve for media contents
    var mediaElement = null;
    if (
        t.quoted_status.extended_entities &&
        t.quoted_status.extended_entities.media
    ) {
        const mediaMap = t.quoted_status.extended_entities.media.map((m) => {
            const [w, h] = quoteSizeFunctions[
                t.quoted_status.extended_entities.media.length
            ](m.original_info.width, m.original_info.height);
            const mediaElement = elNew(m.type === "photo" ? "img" : "video", {
                alt: escapeHTML(m.ext_alt_text, true),
                title: escapeHTML(m.ext_alt_text, true),
                crossorigin: "anonymous",
                width: w,
                height: h,
                loading: "lazy",
            });
            if (m.type == "video") {
                mediaElement.disableRemotePlayback = true;
                mediaElement.controls = true;
            }
            if (m.type == "animated_gif") {
                mediaElement.disableRemotePlayback = true;
                mediaElement.loop = true;
                mediaElement.defaultMuted = true;
                mediaElement.muted = true;
                // XXX: To check if this works.
                mediaElement.onclick =
                    "if(this.paused) this.play(); else this.pause()";
                if (!vars.disableGifAutoplay) mediaElement.autoplay = true;
            }
            if (m.type === "photo") {
                var base_url = m.media_url_https;
                if (
                    vars.showOriginalImages &&
                    (m.media_url_https.endsWith(".jpg") ||
                        m.media_url_https.endsWith(".png"))
                ) {
                    base_url += "?name=orig";
                } else if (
                    window.navigator &&
                    navigator.connection &&
                    navigator.connection.type === "cellular" &&
                    !vars.disableDataSaver
                ) {
                    base_url += "?name=small";
                }
                mediaElement.src = base_url;
            } else {
                mediaElement.src = m.video_info.variants.find(
                    (v) => v.content_type === "video/mp4"
                ).url;
            }
            mediaElement.classList.add(
                "tweet-media-element",
                "tweet-media-element-quote"
            );
            if (m.type === "animated_gif") {
                mediaElement.classList.add("tweet-media-element-quote-gif");
            }
            mediaElement.classList.add(
                mediaClasses[t.quoted_status.extended_entities.media.length]
            );
            if (
                !vars.displaySensitiveContent &&
                t.quoted_status.possibly_sensitive
            ) {
                mediaElement.classList.add("tweet-media-element-censor");
            }
            return mediaElement;
        });
        mediaElement = elNew(
            "div",
            { className: "tweet-media-quote" },
            mediaMap
        );
    }

    const rootAHref = elNew(
        "a",
        {
            className: "tweet-body-quote",
            target: "_blank",
            href: `/${t.quoted_status.user.screen_name}/status/${t.quoted_status.id_str}`,
        },
        [
            profileElement,
            // Header
            nameElement,
            // Tweet Time Quote
            tweetTimeElement,
            oldStyleReplyTo,
            bodyElement,
            mediaElement,
            !isQuoteMatchingLanguage
                ? elNew(
                      "span",
                      {
                          className:
                              "tweet-button tweet-quote-translate tweet-button",
                      },
                      [LOC.view_translation.message]
                  )
                : ``,
        ]
    );
    if (!asNode) return rootAHref.outerHTML;
    else {
        return rootAHref;
    }
}

/**
 * Constructs a full tweet markup.
 * NOTE: This function is very huge.
 * It should be possible to chunk and split up more functions but I'd rather get *something* up for testing than to do that. - Ristellise
 * @param {object} t Base Tweet content
 * @param {object} tweetConstructorArgs Additional parsed constructor arguments
 * @param {object} options oldTwitter specific arguments.
 * @returns
 */
async function constructTweet(t, tweetConstructorArgs, options = {}) {
    const _tweetTopConst = elNew("div", {
        className: "tweet-top",
        hidden: true,
    });

    const defaultProfilePicture = vars.useOldDefaultProfileImage
        ? chrome.runtime.getURL(
              `images/default_profile_images/default_profile_bigger.png`
          )
        : "https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png";

    const profilePicture = (
        t.user.default_profile_image && vars.useOldDefaultProfileImage
            ? chrome.runtime.getURL(
                  `images/default_profile_images/default_profile_${
                      Number(t.user.id_str) % 7
                  }_normal.png`
              )
            : t.user.profile_image_url_https
    ).replace("_normal.", "_bigger.");

    const tweetDateObject = new Date(t.created_at);
    const tweetTimestamp = tweetDateObject.getTime();

    const avatarImage = elNew(
        "a",
        { className: "tweet-avatar-link", href: `/${t.user.screen_name}` },
        [
            elNew("img", {
                onerror: `this.src = '${defaultProfilePicture}'`,
                src: profilePicture,
                alt: t.user.name,
                className: "tweet-avatar",
                width: 48,
                height: 48,
            }),
        ]
    );

    // tweetHeaderName
    let tweetHeaderClass = ["tweet-header-name"];

    if (options.mainTweet) {
        tweetHeaderClass.push("tweet-header-name-main");
    }

    if (t.user.verified || t.user.verified_type) {
        tweetHeaderClass.push("user-verified");
    } else if (t.user.id_str === "1708130407663759360") {
        tweetHeaderClass.push("user-verified", "user-verified-dimden"); // Add both classes
    }

    if (t.user.protected) {
        tweetHeaderClass.push("user-protected");
    }

    if (t.user.verified_type === "Government") {
        tweetHeaderClass.push("user-verified-gray");
    } else if (t.user.verified_type === "Business") {
        tweetHeaderClass.push("user-verified-yellow");
    } else if (t.user.verified_type === "Blue") {
        tweetHeaderClass.push("user-verified-blue");
    }

    const screenUsername = elNew(
        "a",
        {
            className: [
                "tweet-header-info",
                options.mainTweet ? "tweet-header-info-main" : "",
            ],
            href: `/${t.user.screen_name}`,
        },
        // The Screen / Display name
        [
            elNew(
                "b",
                {
                    title:
                        t.user.id_str === "1708130407663759360"
                            ? "Old Twitter Layout extension developer"
                            : "",
                    className: tweetHeaderClass,
                },
                [t.user.name]
            ),
            " ",
            // @Handle
            elNew("span", { className: "tweet-header-handle" }, [
                "@" + escapeHTML(t.user.screen_name),
            ]),
        ]
    );

    var titleTime = null;
    if (tweetShortishTimeformatter) {
        titleTime = tweetShortishTimeformatter.format(tweetDateObject);
    } else {
        titleTime = tweetDateObject.toLocaleString();
    }

    let tweetHeaderBlock = [
        // The Screen & username block.
        screenUsername,
        " ",
        // Tweet Time Element
        elNew(
            "a",
            {
                className: "tweet-time",
                hidden: options.mainTweet ? true : false,
                dataset: {
                    timestamp: tweetTimestamp,
                },
                title: titleTime,
                href: `/${t.user.screen_name}/status/${t.id_str}`,
            },
            [timeElapsed(tweetTimestamp)]
        ),
        location.pathname.split("?")[0].split("#")[0] === "/i/bookmarks"
            ? elNew(
                  "span",
                  {
                      className: [
                          "tweet-button",
                          "tweet-delete-bookmark",
                          !tweetConstructorArgs.isMatchingLanguage
                              ? " tweet-delete-bookmark-lower"
                              : "",
                      ],
                  },
                  ["×"]
              )
            : null,
    ];
    // If it's the main tweet, add a follow button.
    if (options.mainTweet && t.user.id_str !== user.id_str) {
        tweetHeaderBlock.push(
            elNew(
                "button",
                {
                    className: [
                        "tweet-button",
                        "nice-button",
                        "tweet-header-follow",
                        t.user.following ? "following" : "follow",
                    ],
                },
                [
                    t.user.following
                        ? LOC.following_btn.message
                        : LOC.follow.message,
                ]
            )
        );
    }
    // translate icon for timelines.
    if (!options.mainTweet && !tweetConstructorArgs.isMatchingLanguage) {
        tweetHeaderBlock.push(
            elNew(
                "span",
                { className: ["tweet-translate-after", "tweet-button"] },
                [
                    `${t.user.name} ${t.user.screen_name} 1 Sept`.length < 40 &&
                    innerWidth > 650
                        ? LOC.view_translation.message
                        : null,
                ]
            )
        );
    }

    const tweetTopConst = elNew("template", {}, [
        _tweetTopConst,
        avatarImage,
        elNew(
            "div",
            {
                className: [
                    "tweet-header",
                    options.mainTweet ? "tweet-header-main" : "",
                ],
            },
            tweetHeaderBlock
        ),
    ]);

    // mentionText
    const doMentionText =
        // tweetConstructorArgs.mentionedUserText !== `` &&
        tweetConstructorArgs.mentionedUserTextArray.length > 0 &&
        !options.threadContinuation &&
        !options.noTop &&
        !location.pathname.includes("/status/") &&
        !vars.useOldStyleReply;
    var mentioned_node = null;
    if (doMentionText) {
        // Taken from StackOverflow once again.
        tweetConstructorArgs.mentionedUserTextArray = interleave(
            tweetConstructorArgs.mentionedUserTextArray,
            LOC.replying_to_comma.message
        );

        // XXX: In theory, this should be the right order.
        // Previously it was [` and ` | `, ` | `, ` | ...]
        // but it should be: [`, ` | `, ` ... ` and `]
        // But I cannot be 100% sure about this. - Ristellise.
        if (tweetConstructorArgs.mentionedUserTextArray.length >= 5) {
            const arrLength =
                tweetConstructorArgs.mentionedUserTextArray.length;
            tweetConstructorArgs.mentionedUserTextArray[arrLength - 2] =
                LOC.replying_to_and.message;
        }
        // XXX: This is actually missing a `LOC.replying_to_user.message`.
        // Will need to figure out how to replace it.

        var textFragments = LOC.replying_to_user.message.split("$SCREEN_NAME$");
        textFragments = interleave(
            textFragments,
            tweetConstructorArgs.mentionedUserTextArray
        ).flat(Infinity);

        mentioned_node = elNew("div", { className: "tweet-reply-to" }, [
            elNew("span", {}, textFragments),
        ]);
    }

    // Main text content
    const longShortClass =
        vars.noBigFont ||
        t.full_text.length > 280 ||
        !options.bigFont ||
        (!options.mainTweet && location.pathname.includes("/status/"))
            ? "tweet-body-text-long"
            : "tweet-body-text-short";

    var bodyTextChildren = [];
    if (vars.useOldStyleReply) {
        bodyTextChildren.push(
            ...interleave(tweetConstructorArgs.mentionedUserTextArray, " ")
        );
    }
    if (tweetConstructorArgs.full_text) {
        if (bodyTextChildren.length > 0) {
            bodyTextChildren.push(" ");
        }
        // XXX: renderTweetBodyHTML returns html. To refactor later.
        bodyTextChildren.push(
            htmlToNodes(await renderTweetBodyHTML(t)).content
        );
    }

    const body_node = elNew(
        "div",
        {
            lang: t.lang,
            classList: ["tweet-body-text", longShortClass],
        },
        [elNew("span", { class: ["tweet-body-text-span"] }, bodyTextChildren)]
    );

    // render media content elements
    var extended_media_nodes = null;
    if (t.extended_entities && t.extended_entities.media) {
        // videoOverlay if it's only a single video.
        const isSingleVideo =
            t.extended_entities.media.length === 1 &&
            t.extended_entities.media[0].type === "video"
                ? true
                : false;
        var videoOverlay = null;
        if (isSingleVideo) {
            videoOverlay = elNew(
                "div",
                { class: ["tweet-media-video-overlay", "tweet-button"] },
                // XXX: htmlToNodes needs to always be called, else .content will be null/undefined.
                [htmlToNodes(svgPlayIcon).content]
            );
        }
        // Render media nodes
        var mediaNodes = renderMultiMediaNodes(t);

        // <div class="tweet-media-controls">GIF</div>
        var gifControl =
            t.extended_entities &&
            t.extended_entities.media &&
            t.extended_entities.media.some((m) => m.type === "animated_gif")
                ? elNew("div", { class: "tweet-media-controls" }, ["GIF"])
                : null;
        var videoControls = null;
        if (tweetConstructorArgs.videos) {
            var viewNode = null;
            if (
                tweetConstructorArgs.videos[0].ext &&
                tweetConstructorArgs.videos[0].ext.mediaStats &&
                tweetConstructorArgs.videos[0].ext.mediaStats.r &&
                tweetConstructorArgs.videos[0].ext.mediaStats.r.ok
            ) {
                viewNode = Number(
                    tweetConstructorArgs.videos[0].ext.mediaStats.r.ok.viewCount
                );
                viewNode = elNew(
                    "span",
                    { class: ["tweet-video-views", "tweet-button"] },
                    [
                        `${viewNode.toLocaleString().replace(/\s/g, ",")} ${
                            LOC.views.message
                        } • `,
                    ]
                );
            }

            const reloadNode = elNew(
                "span",
                { class: ["tweet-video-reload", "tweet-button"] },
                [LOC.reload.message]
            );
            var resolutionNodes =
                tweetConstructorArgs.videos[0].video_info.variants
                    .filter((v) => v.bitrate)
                    .map((v) =>
                        elNew(
                            "span",
                            {
                                class: ["tweet-video-quality", "tweet-button"],
                                dataset: { url: v.url },
                            },
                            [v.url.match(/\/(\d+)x/)[1] + "p"]
                        )
                    );
            videoControls = elNew("div", { class: "tweet-media-controls" }, [
                viewNode,
                reloadNode,
                " • ",
                ...interleave(resolutionNodes, " / "),
            ]);
        }
        // console.log([videoOverlay, ...mediaNodes]);
        extended_media_nodes = [
            elNew("div", { class: ["tweet-media"] }, [
                videoOverlay,
                ...mediaNodes,
            ]),
            gifControl,
            videoControls,
            elNew("span", { class: "tweet-media-data" }),
        ];
    }

    // var extended_media = "";
    // if (extended_node) {
    //   [].forEach.call(extended_node.children, function (el) {
    //     extended_media += el.outerHTML;
    //   });
    // }

    // card placeholder if there is a card to placeholder.
    // const card = t.card ? `<div class="tweet-card"></div>` : "";
    const card_node = t.card ? elNew("div", { class: ["tweet-card"] }) : null;
    // quoted tweet status.
    let quoted_node = "";
    if (t.quoted_status) {
        quoted_node = await constructQuotedTweet(
            t,
            tweetConstructorArgs.isQuoteMatchingLanguage,
            tweetConstructorArgs.quoteMentionedUserText,
            tweetConstructorArgs.newQuoteMentionedUserText,
            true
        );
    }

    // limited text
    var limited_node = null;
    if (
        t.limited_actions === "limit_trusted_friends_tweet" &&
        (options.mainTweet || !location.pathname.includes("/status/"))
    ) {
        let screen_name = null;
        if (tweet.trusted_circle_owner) {
            screen_name = tweet.trusted_circle_owner;
        } else if (tweetStorage[t.conversation_id_str]) {
            screen_name = tweetStorage[t.conversation_id_str].user.screen_name;
        } else if (t.in_reply_to_screen_name) {
            screen_name = t.in_reply_to_screen_name;
        } else {
            screen_name = t.user.screen_name;
        }
        limited_node = elNew("div", { class: ["tweet-limited"] }, [
            LOC.circle_limited_tweet.message.replace(
                "$SCREEN_NAME$",
                screen_name
            ),
            elNew(
                "a",
                {
                    href: "https://help.twitter.com/en/using-twitter/twitter-circle",
                    target: "blank",
                },
                [LOC.learn_more.message]
            ),
        ]);

        // limited = `
        //         <div class="tweet-limited">
        //             ${LOC.circle_limited_tweet.message}
        //             <a
        //                 href="https://help.twitter.com/en/using-twitter/twitter-circle"
        //                 target="_blank"
        //                 >${LOC.learn_more.message}</a
        //             >
        //         </div>
        //     `.replace(
        //   "$SCREEN_NAME$",
        //   screen_name
        // );
    }
    // tombstoned
    const tombstone_node = t.tombstone
        ? elNew("div", { class: ["tweet-warning"] }, [t.tombstone])
        : null;
    // country restricted text.
    var country_restrictions = null;
    if (
        (t.withheld_in_countries &&
            (t.withheld_in_countries.includes("XX") ||
                t.withheld_in_countries.includes("XY"))) ||
        t.withheld_scope
    ) {
        country_restrictions = country_restriction_node;
    }
    // const country_restrictions =
    //   (t.withheld_in_countries &&
    //     (t.withheld_in_countries.includes("XX") ||
    //       t.withheld_in_countries.includes("XY"))) ||
    //   t.withheld_scope
    //     ? `<div class="tweet-warning">
    //       This Tweet has been withheld in response to a report from the copyright holder. <a href="https://help.twitter.com/en/rules-and-policies/copyright-policy" target="_blank">Learn more.</a></div>`
    //     : "";

    var conversation_control_node = null;
    if (t.conversation_control) {
        const limitedActions = t.limited_actions_text
            ? t.limited_actions_text
            : LOC.limited_tweet.message;
        var replyText =
            t.conversation_control.policy &&
            (t.user.id_str === user.id_str ||
                (t.conversation_control.policy.toLowerCase() === "community" &&
                    (t.user.followed_by ||
                        (tweetConstructorArgs.full_text &&
                            tweetConstructorArgs.full_text.includes(
                                `@${user.screen_name}`
                            )))) ||
                (t.conversation_control.policy.toLowerCase() ===
                    "by_invitation" &&
                    tweetConstructorArgs.full_text &&
                    tweetConstructorArgs.full_text.includes(
                        `@${user.screen_name}`
                    )));
        if (replyText) {
            replyText = " " + LOC.you_can_reply.message;
        } else {
            replyText = "";
        }
        conversation_control_node = elNew("div", { class: "tweet-warning" }, [
            limitedActions,
            replyText,
        ]);
    }

    // const conversation_control = t.conversation_control
    //   ? `<div class="tweet-warning">${
    //       t.limited_actions_text
    //         ? t.limited_actions_text
    //         : LOC.limited_tweet.message
    //     }${
    //       t.conversation_control.policy &&
    //       (t.user.id_str === user.id_str ||
    //         (t.conversation_control.policy.toLowerCase() === "community" &&
    //           (t.user.followed_by ||
    //             (tweetConstructorArgs.full_text &&
    //               tweetConstructorArgs.full_text.includes(
    //                 `@${user.screen_name}`
    //               )))) ||
    //         (t.conversation_control.policy.toLowerCase() === "by_invitation" &&
    //           tweetConstructorArgs.full_text &&
    //           tweetConstructorArgs.full_text.includes(`@${user.screen_name}`)))
    //         ? " " + LOC.you_can_reply.message
    //         : ""
    //     }</div>`
    //   : "";

    var tweet_footer_node = "";
    if (options.mainTweet) {
        var statsArray = [];
        // Replies
        statsArray.push(
            elNew(
                "a",
                {
                    href: `/${t.user.screen_name}/status/${t.id_str}`,
                    class: ["tweet-footer-stat", "tweet-footer-stat-o"],
                },
                [
                    elNew("span", { class: "tweet-footer-stat-text" }, [
                        LOC.replies.message,
                    ]),
                    elNew(
                        "b",
                        {
                            class: [
                                "tweet-footer-stat-count",
                                "tweet-footer-stat-replies",
                            ],
                        },
                        [formatLargeNumber(t.reply_count).replace(/\s/g, ",")]
                    ),
                ]
            )
        );
        // Retweets
        statsArray.push(
            elNew(
                "a",
                {
                    href: `/${t.user.screen_name}/status/${t.id_str}/retweets`,
                    class: ["tweet-footer-stat", "tweet-footer-stat-o"],
                },
                [
                    elNew("span", { class: "tweet-footer-stat-text" }, [
                        LOC.retweets.message,
                    ]),
                    elNew(
                        "b",
                        {
                            class: [
                                "tweet-footer-stat-count",
                                "tweet-footer-stat-r",
                            ],
                        },
                        [formatLargeNumber(t.retweet_count).replace(/\s/g, ",")]
                    ),
                ]
            )
        );
        if (
            vars.showQuoteCount &&
            typeof t.quote_count !== "undefined" &&
            t.quote_count > 0
        ) {
            statsArray.push(
                elNew(
                    "a",
                    {
                        href: `/${t.user.screen_name}/status/${t.id_str}/retweets/with_comments`,
                        class: ["tweet-footer-stat", "tweet-footer-stat-q"],
                    },
                    [
                        elNew("span", { class: "tweet-footer-stat-text" }, [
                            LOC.quotes.message,
                        ]),
                        elNew(
                            "b",
                            {
                                class: [
                                    "tweet-footer-stat-count",
                                    "tweet-footer-stat-quotes",
                                ],
                            },
                            [
                                formatLargeNumber(t.quote_count).replace(
                                    /\s/g,
                                    ","
                                ),
                            ]
                        ),
                    ]
                )
            );
        }
        // Likes
        statsArray.push(
            elNew(
                "a",
                {
                    href: `/${t.user.screen_name}/status/${t.id_str}/likes`,
                    class: ["tweet-footer-stat", "tweet-footer-stat-f"],
                },
                [
                    elNew("span", { class: "tweet-footer-stat-text" }, [
                        vars.heartsNotStars
                            ? LOC.likes.message
                            : LOC.favorites.message,
                    ]),
                    elNew(
                        "b",
                        {
                            class: [
                                "tweet-footer-stat-count",
                                "tweet-footer-stat-favorites",
                            ],
                        },
                        [
                            formatLargeNumber(t.favorite_count).replace(
                                /\s/g,
                                ","
                            ),
                        ]
                    ),
                ]
            )
        );

        tweet_footer_node = elNew("div", { class: ["tweet-footer"] }, [
            elNew("div", { class: ["tweet-footer-stats"] }, statsArray),
            elNew("div", { class: ["tweet-footer-favorites"] }),
        ]);
    }
    var dt = [];
    if (tweetTimeFormatter && tweetDateFormatter) {
        dt = [
            tweetTimeFormatter.format(tweetDateObject),
            " - ",
            tweetDateFormatter.format(tweetDateObject),
        ];
    } else {
        dt = [
            tweetDateObject
                .toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "numeric",
                })
                .toLowerCase(),
            " - ",
            tweetDateObject.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
        ];
    }

    const tweet_date_node = elNew(
        "a",
        {
            hidden: !options.mainTweet ? true : false,
            class: ["tweet-date"],
            title: tweetDateObject.toLocaleString(),
            href: `/${t.user.screen_name}/status/${t.id_str}`,
        },
        [
            elNew("br"),
            ...dt,
            "  ・ ",
            t.source ? t.source.split(">")[1].split("<")[0] : "Unknown",
        ]
    );

    // solve additional classes
    var retweetClasses = ["tweet-button", "tweet-interact-retweet"];
    if (t.retweeted) {
        retweetClasses.push("tweet-interact-retweeted");
    }
    if (
        (t.user.protected ||
            t.limited_actions === "limit_trusted_friends_tweet") &&
        t.user.id_str !== user.id_str
    ) {
        retweetClasses.push("tweet-interact-retweet-disabled");
    }

    var likeClasses = ["tweet-button", "tweet-interact-favorite"];
    if (t.favorited) {
        likeClasses.push("tweet-interact-favorited");
    }

    var bookmarkClasses = ["tweet-button", "tweet-interact-bookmark"];
    if (t.bookmarked) {
        bookmarkClasses.push("tweet-interact-bookmarked");
    }

    const viewsClasses = ["tweet-button", "tweet-interact-views"];
    // dropdown for retweet actions
    var retweetDropdownArray = [
        elNew(
            "span",
            {
                class: ["tweet-interact-retweet-menu-retweet"],
            },
            [
                t.retweeted ? LOC.unretweet.message : LOC.retweet.message,
                !vars.disableHotkeys ? " (T)" : "",
            ]
        ),
        elNew(
            "span",
            {
                class: ["tweet-interact-retweet-menu-quote"],
            },
            [LOC.quote_tweet.message, !vars.disableHotkeys ? " (Q)" : ""]
        ),
    ];
    if (options.mainTweet) {
        // If it's the main tweet, add quotes and retweeters
        retweetDropdownArray.push(
            elNew(
                "span",
                {
                    class: ["tweet-interact-retweet-menu-quotes"],
                },
                [LOC.see_quotes_big.message]
            )
        );
        retweetDropdownArray.push(
            elNew(
                "span",
                {
                    class: ["tweet-interact-retweet-menu-retweeters"],
                },
                [LOC.see_retweeters.message]
            )
        );
    }

    var interactionArray = [
        // reply
        elNew(
            "span",
            {
                class: ["tweet-button", "tweet-interact-reply"],
                title: `${LOC.reply_btn.message}${
                    !vars.disableHotkeys ? " (R)" : ""
                }`,
                dataset: { val: t.reply_count },
            },
            [
                options.mainTweet
                    ? null
                    : formatLargeNumber(t.reply_count).replace(/\s/g, ","),
            ]
        ),
        // retweet
        elNew(
            "span",
            {
                class: retweetClasses,
                title: `${LOC.retweet_btn.message}${
                    !vars.disableHotkeys ? " (L)" : ""
                }`,
                dataset: { val: t.retweet_count },
            },
            [
                options.mainTweet
                    ? null
                    : formatLargeNumber(t.retweet_count).replace(/\s/g, ","),
            ]
        ),
        // Retweet dropdown box
        elNew(
            "div",
            {
                class: ["tweet-interact-retweet-menu", "dropdown-menu"],
                hidden: true,
            },
            retweetDropdownArray
        ),
        // Like actions
        elNew(
            "span",
            {
                class: likeClasses,
                title: `${
                    vars.heartsNotStars
                        ? LOC.like_btn.message
                        : LOC.favorite_btn.message
                }${!vars.disableHotkeys ? " (L)" : ""}`,
                dataset: { val: t.favorite_count },
            },
            [
                options.mainTweet
                    ? null
                    : formatLargeNumber(t.favorite_count).replace(/\s/g, ","),
            ]
        ),
    ];
    if (
        (vars.showBookmarkCount || options.mainTweet) &&
        typeof t.bookmark_count !== "undefined"
    ) {
        interactionArray.push(
            // bookmark actions
            elNew(
                "span",
                {
                    class: bookmarkClasses,
                    title: `${LOC.bookmarks_count.message}${
                        !vars.disableHotkeys ? " (B)" : ""
                    }`,
                    dataset: { val: t.bookmark_count },
                },
                [formatLargeNumber(t.bookmark_count).replace(/\s/g, ",")]
            )
        );
    }
    if (
        vars.seeTweetViews &&
        t.ext &&
        t.ext.views &&
        t.ext.views.r &&
        t.ext.views.r.ok &&
        t.ext.views.r.ok.count
    ) {
        interactionArray.push(
            // views
            elNew(
                "span",
                {
                    class: viewsClasses,
                    title: LOC.views_count.message,
                    dataset: { val: t.ext.views.r.ok.count },
                },
                [formatLargeNumber(t.ext.views.r.ok.count).replace(/\s/g, ",")]
            )
        );
    }
    interactionArray.push(
        elNew("span", { class: ["tweet-button", "tweet-interact-more"] })
    );
    // XXX: Figure out if we can/should use structuredClone
    var dropDownMoreInteractionsArray = [
        elNew(
            "span",
            { class: ["tweet-interact-more-menu-separate"] },
            LOC.separate_text.message
        ),
        elNew(
            "span",
            { class: ["tweet-interact-more-menu-copy"] },
            LOC.copy_link.message
        ),
        elNew(
            "span",
            { class: ["tweet-interact-more-menu-embed"] },
            LOC.embed_tweet.message
        ),
        navigator.canShare
            ? elNew(
                  "span",
                  { class: ["tweet-interact-more-menu-share"] },
                  LOC.share_tweet.message
              )
            : null,
        elNew(
            "span",
            { class: ["tweet-interact-more-menu-share-dms"] },
            LOC.share_tweet_in_dms.message
        ),
        elNew(
            "span",
            { class: ["tweet-interact-more-menu-newtwitter"] },
            LOC.open_tweet_newtwitter.message
        ),
    ];
    if (t.user.id_str === user.id_str) {
        dropDownMoreInteractionsArray.push(elNew("hr"));
        dropDownMoreInteractionsArray.push(
            elNew(
                "span",
                { class: ["tweet-interact-more-menu-analytics"] },
                LOC.tweet_analytics.message
            )
        );
        dropDownMoreInteractionsArray.push(
            elNew(
                "span",
                { class: ["tweet-interact-more-menu-delete"] },
                LOC.delete_tweet.message
            )
        );
        if (
            typeof pageUser !== "undefined" &&
            pageUser.id_str === user.id_str
        ) {
            dropDownMoreInteractionsArray.push(
                elNew(
                    "span",
                    { class: ["tweet-interact-more-menu-pin"] },
                    pinnedTweet && pinnedTweet.id_str === t.id_str
                        ? LOC.unpin_tweet.message
                        : LOC.pin_tweet.message
                )
            );
        }
    }
    if (
        t.conversation_id_str &&
        tweetStorage[t.conversation_id_str] &&
        tweetStorage[t.conversation_id_str].user.id_str === user.id_str &&
        t.user.id_str !== user.id_str
    ) {
        dropDownMoreInteractionsArray.push(
            elNew(
                "span",
                { class: ["tweet-interact-more-menu-hide"] },
                t.moderated ? LOC.unhide_tweet.message : LOC.hide_tweet.message
            )
        );
    }
    if (t.hasModeratedReplies) {
        dropDownMoreInteractionsArray.push(
            elNew("span", { class: ["tweet-interact-more-menu-hidden"] }, [
                elNew(
                    "a",
                    {
                        target: "_blank",
                        href: `/${t.user.screen_name}/status/${t.id_str}/hidden?newtwitter=true`,
                    },
                    LOC.see_hidden_replies.message
                ),
            ])
        );
    }
    dropDownMoreInteractionsArray.push(elNew("hr"));
    if (t.user.id_str !== user.id_str) {
        if (!options.mainTweet) {
            dropDownMoreInteractionsArray.push(
                elNew(
                    "span",
                    {
                        class: ["tweet-interact-more-menu-follow"],
                        hidden: t.user.blocking ? true : false,
                    },
                    [
                        t.user.following
                            ? tweetConstructorArgs.unfollowUserText
                            : tweetConstructorArgs.followUserText,
                    ]
                )
            );
        }
        dropDownMoreInteractionsArray.push(
            elNew(
                "span",
                {
                    class: ["tweet-interact-more-menu-block"],
                },
                [
                    t.user.blocking
                        ? tweetConstructorArgs.unblockUserText
                        : tweetConstructorArgs.blockUserText,
                ]
            )
        );
        dropDownMoreInteractionsArray.push(
            elNew(
                "span",
                {
                    class: ["tweet-interact-more-menu-mute-user"],
                },
                [
                    t.user.muting
                        ? LOC.unmute_user.message.replace(
                              "$SCREEN_NAME$",
                              t.user.screen_name
                          )
                        : LOC.mute_user.message.replace(
                              "$SCREEN_NAME$",
                              t.user.screen_name
                          ),
                ]
            )
        );
        dropDownMoreInteractionsArray.push(
            elNew(
                "span",
                {
                    class: ["tweet-interact-more-menu-lists-action"],
                },
                LOC.from_list.message
            )
        );
    }
    if (!location.pathname.startsWith("/i/bookmarks")) {
        dropDownMoreInteractionsArray.push(
            elNew(
                "span",
                {
                    class: ["tweet-interact-more-menu-bookmark"],
                },
                t.bookmarked
                    ? LOC.remove_bookmark.message
                    : LOC.bookmark_tweet.message
            )
        );
    }
    dropDownMoreInteractionsArray.push(
        elNew(
            "span",
            {
                class: ["tweet-interact-more-menu-mute"],
            },
            t.conversation_muted
                ? LOC.unmute_convo.message
                : LOC.mute_convo.message
        )
    );
    dropDownMoreInteractionsArray.push(elNew("hr"));
    if (t.feedback) {
        dropDownMoreInteractionsArray.push(
            ...t.feedback.map((f, i) => {
                return elNew(
                    "span",
                    {
                        class: ["tweet-interact-more-menu-feedback"],
                        dataset: { index: i },
                    },
                    [f.prompt ? f.prompt : LOC.topic_not_interested.message]
                );
            })
        );
    }
    dropDownMoreInteractionsArray.push(
        elNew(
            "span",
            {
                class: ["tweet-interact-more-menu-refresh"],
            },
            LOC.refresh_tweet.message
        )
    );
    if (
        t.extended_entities &&
        t.extended_entities.media.length === 1 &&
        t.extended_entities.media[0].type === "animated_gif"
    ) {
        dropDownMoreInteractionsArray.push(
            elNew(
                "span",
                {
                    class: ["tweet-interact-more-menu-download-gif"],
                    dataset: { gifno: "1" },
                },
                LOC.download_gif.message
            )
        );
    }
    if (t.extended_entities && t.extended_entities.media.length > 1) {
        dropDownMoreInteractionsArray.push(
            ...t.extended_entities.media
                .filter((m) => m.type === "animated_gif")
                .map((m, i) => {
                    elNew(
                        "span",
                        {
                            class: ["tweet-interact-more-menu-download-gif"],
                            dataset: { gifno: i + 1 },
                        },
                        `${LOC.download_gif.message} (#${i + 1})`
                    );
                })
        );
    }
    if (t.extended_entities && t.extended_entities.media.length > 0) {
        dropDownMoreInteractionsArray.push(
            elNew(
                "span",
                {
                    class: ["tweet-interact-more-menu-download"],
                },
                `${LOC.download_media.message}`
            )
        );
    }
    if (vars.developerMode) {
        dropDownMoreInteractionsArray.push(
            ...[
                elNew(
                    "span",
                    {
                        class: ["tweet-interact-more-menu-copy-user-id"],
                    },
                    LOC.copy_user_id.message
                ),
                elNew(
                    "span",
                    {
                        class: ["tweet-interact-more-menu-copy-tweet-id"],
                    },
                    LOC.copy_tweet_id.message
                ),
                elNew(
                    "span",
                    {
                        class: ["tweet-interact-more-menu-log"],
                    },
                    "Log tweet object"
                ),
            ]
        );
    }

    interactionArray.push(
        elNew(
            "div",
            {
                class: ["tweet-interact-more-menu", "dropdown-menu"],
                hidden: true,
            },
            dropDownMoreInteractionsArray
        )
    );
    if (
        options.selfThreadButton &&
        t.self_thread &&
        t.self_thread.id_str &&
        !options.threadContinuation &&
        !location.pathname.includes("/status/")
    ) {
        interactionArray.push(
            elNew(
                "a",
                {
                    class: ["tweet-self-thread-button", "tweet-thread-right"],
                    target: "_blank",
                    href: `/${t.user.screen_name}/status/${t.self_thread.id_str}`,
                },
                LOC.show_this_thread.message
            )
        );
    }
    if (
        !options.noTop &&
        !options.selfThreadButton &&
        t.in_reply_to_status_id_str &&
        !(
            options.threadContinuation ||
            (options.selfThreadContinuation &&
                t.self_thread &&
                t.self_thread.id_str)
        ) &&
        !location.pathname.includes("/status/")
    ) {
        elNew(
            "a",
            {
                class: ["tweet-self-thread-button", "tweet-thread-right"],
                target: "_blank",
                href: `/${t.in_reply_to_screen_name}/status/${t.in_reply_to_status_id_str}`,
            },
            LOC.show_this_thread.message
        );
    }

    // Tweet Interactions buttons
    const interactions_node = elNew(
        "div",
        { class: ["tweet-interact"] },
        interactionArray
    );

    // tweet_interact = ;

    const tweet_reply_node = elNew(
        "div",
        { class: ["tweet-edit-section", "tweet-reply"], hidden: true },
        [
            elNew("br"),
            elNew(
                "b",
                { style: "font-size: 12px;display: block;margin-bottom: 5px;" },
                [
                    `${LOC.replying_to_tweet.message} `,
                    elNew(
                        "span",
                        {
                            title: !vars.disableHotkeys ? "ALT+M" : "",
                            class: ["tweet-reply-upload"],
                        },
                        [LOC.upload_media_btn.message]
                    ),
                    " ",
                    elNew("span", { class: ["tweet-reply-add-emoji"] }, [
                        LOC.emoji_btn.message,
                    ]),
                    " ",
                    elNew(
                        "span",
                        {
                            title: !vars.disableHotkeys ? "ALT+R" : "",
                            class: ["tweet-reply-cancel"],
                        },
                        [LOC.cancel_btn.message]
                    ),
                ]
            ),
            elNew(
                "span",
                { style: "color:red", class: ["tweet-reply-error"] },
                []
            ),
            elNew("textarea", {
                maxlength: 25000,
                class: ["tweet-reply-text"],
                placeholder: LOC.reply_example.message,
            }),
            elNew(
                "button",
                {
                    title: "CTRL+ENTER",
                    class: ["tweet-reply-button", "nice-button"],
                },
                [LOC.reply.message]
            ),
            elNew("br"),
            elNew("span", { class: ["tweet-reply-char"] }, [
                localStorage.OTisBlueVerified ? "0/25000" : "0/280",
            ]),
            elNew("br"),
            elNew("div", {
                style: "padding-bottom: 10px;",
                class: ["tweet-reply-media"],
            }),
        ]
    );

    const tweet_quote_node = elNew(
        "div",
        { class: ["tweet-edit-section", "tweet-quote"], hidden: true },
        [
            elNew("br"),
            elNew(
                "b",
                { style: "font-size: 12px;display: block;margin-bottom: 5px;" },
                [
                    `${LOC.quote_tweet.message} `,
                    elNew(
                        "span",
                        {
                            title: !vars.disableHotkeys ? "ALT+M" : "",
                            class: ["tweet-quote-upload"],
                        },
                        [LOC.upload_media_btn.message]
                    ),
                    " ",
                    elNew("span", { class: ["tweet-quote-add-emoji"] }, [
                        LOC.emoji_btn.message,
                    ]),
                    " ",
                    elNew(
                        "span",
                        {
                            title: !vars.disableHotkeys ? "ALT+Q" : "",
                            class: ["tweet-quote-cancel"],
                        },
                        [LOC.cancel_btn.message]
                    ),
                ]
            ),
            elNew(
                "span",
                { style: "color:red", class: ["tweet-quote-error"] },
                []
            ),
            elNew("textarea", {
                maxlength: 25000,
                class: ["tweet-quote-text"],
                placeholder: LOC.quote_example.message,
            }),
            elNew(
                "button",
                {
                    title: "CTRL+ENTER",
                    class: ["tweet-quote-button", "nice-button"],
                },
                [LOC.quote.message]
            ),
            elNew("br"),
            elNew("span", { class: ["tweet-quote-char"] }, [
                localStorage.OTisBlueVerified ? "0/25000" : "0/280",
            ]),
            elNew("br"),
            elNew("div", {
                style: "padding-bottom: 10px;",
                class: ["tweet-quote-media"],
            }),
        ]
    );

    const hideThreadContinuation =
        options.threadContinuation ||
        (options.selfThreadContinuation &&
            t.self_thread &&
            t.self_thread.id_str)
            ? false
            : true;
    const uriHasStatus = location.pathname.includes("/status/");
    const isStandaloneTweet =
        options.selfThreadContinuation &&
        t.self_thread &&
        t.self_thread.id_str &&
        !uriHasStatus;
    var replyChildren = [];
    if (isStandaloneTweet) {
        replyChildren.push(elNew("br"));
        replyChildren.push(
            elNew(
                "a",
                {
                    class: ["tweet-self-thread-button"],
                    target: "_blank",
                    href: `/${t.user.screen_name}/status/${t.self_thread.id_str}`,
                },
                LOC.show_this_thread.message
            )
        );
        replyChildren.push(
            elNew("span", {
                class: ["tweet-self-thread-line"],
                style: `margin-left: -108px;margin-top: -5px;`,
            })
        );
        replyChildren.push(
            elNew("div", {
                class: ["tweet-self-thread-line-dots"],
                style: `margin-left: -120px;margin-top: -3px;`,
            })
        );
    } else {
        if (uriHasStatus) {
            replyChildren.push(elNew("br"));
            replyChildren.push(elNew("br"));
        }
        replyChildren.push(
            elNew("span", {
                class: ["tweet-self-thread-line"],
                style: uriHasStatus ? "margin-top:-10px;" : "",
            })
        );
        replyChildren.push(
            elNew("div", {
                style: uriHasStatus ? "margin-top:-8px;" : "",
                class: ["tweet-self-thread-line-dots"],
            })
        );
    }
    const reply_nodes = elNew(
        "div",
        {
            class: ["tweet-self-thread-div"],
            hidden: hideThreadContinuation,
        },
        replyChildren
    );

    const translate_node = [
        elNew("br"),
        elNew("span", { class: ["tweet-button", "tweet-translate"] }, [
            LOC.view_translation.message,
        ]),
    ];

    const country_restriction_node = elNew(
        "div",
        { class: ["tweet-warning"] },
        [
            "This Tweet has been withheld in response to a report from the copyright holder.",
            elNew(
                "a",
                {
                    href: "https://help.twitter.com/en/rules-and-policies/copyright-policy",
                    target: "_blank",
                },
                ["Learn more."]
            ),
        ]
    );

    return [
        tweetTopConst.children,
        [
            mentioned_node,
            body_node,
            !tweetConstructorArgs.isMatchingLanguage && options.mainTweet
                ? translate_node
                : null,
            extended_media_nodes,
            card_node,
            quoted_node,
            limited_node,
            tombstone_node,
            (t.withheld_in_countries &&
                (t.withheld_in_countries.includes("XX") ||
                    t.withheld_in_countries.includes("XY"))) ||
            t.withheld_scope
                ? country_restriction_node
                : null,
            conversation_control_node,
            tweet_footer_node,
            tweet_date_node,
            interactions_node,
            // tweet_edit
            tweet_reply_node,
            tweet_quote_node,
            reply_nodes,
        ].flat(1), // flat required due to `extended_media_nodes` being an array.
    ];
}
