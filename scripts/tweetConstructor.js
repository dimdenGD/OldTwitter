// svgPlayIcon.
const svgPlayIcon = `<svg viewBox="0 0 24 24" class="tweet-media-video-overlay-play">
    <g>
        <path class="svg-play-path" d="M8 5v14l11-7z"></path>
        <path
            d="M0 0h24v24H0z"
            fill="none"
        ></path>
    </g>
</svg>`;

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
      let [w, h] = sizeFunctions[tweetObject.extended_entities.media.length](
        m.original_info.width,
        m.original_info.height
      );
      const newClone = img_template.cloneNode(true);
      const altText = m.ext_alt_text ? escapeHTML(m.ext_alt_text, true) : "";
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
      var mediaClass = mediaClasses[tweetObject.extended_entities.media.length];
      if (mediaClass) newClone.classList.add(mediaClass);
      if (toCensor) newClone.classList.add("tweet-media-element-censor");
      htmlNodes.push(newClone);
    } else if (m.type === "animated_gif") {
      let [w, h] = sizeFunctions[tweetObject.extended_entities.media.length](
        m.original_info.width,
        m.original_info.height
      );
      let rid = m.id_str + m.media_key;

      const newClone = animated_gif_template.cloneNode(true);
      const altText = m.ext_alt_text ? escapeHTML(m.ext_alt_text, true) : "";
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
      var mediaClass = mediaClasses[tweetObject.extended_entities.media.length];
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
          mediaStats: { r: { ok: { viewCount: m.mediaStats.viewCount } } },
        };
      }
      let [w, h] = sizeFunctions[tweetObject.extended_entities.media.length](
        m.original_info.width,
        m.original_info.height
      );
      const newClone = video_template.cloneNode(true);
      const altText = m.ext_alt_text ? escapeHTML(m.ext_alt_text, true) : "";
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
      var mediaClass = mediaClasses[tweetObject.extended_entities.media.length];
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
  newQuoteMentionedUserText
) {
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
        [escapeHTML(t.quoted_status.user.name)]
      ),
      " ",
      // At handle
      elNew("span", { className: "tweet-header-handle-quote" }, [
        "@" + escapeHTML(t.quoted_status.user.screen_name),
      ]),
    ]),
  ]);
  // Time span
  const tweetTimeElement = elNew(
    "span",
    {
      className: "tweet-time-quote",
      dataset: {
        timestamp: new Date(t.quoted_status.created_at).getTime(),
      },
      title: new Date(t.quoted_status.created_at).toLocaleString(),
    },
    [timeElapsed(new Date(t.quoted_status.created_at).getTime())]
  );

  var oldStyleReplyTo = null;
  if (!!newQuoteMentionedUserText && !vars.useOldStyleReply) {
    newQuoteMentionedUserText = interleave(
      newQuoteMentionedUserText,
      LOC.replying_to_comma.message
    );

    if (newQuoteMentionedUserText.length >= 5) {
      const arrLength = newQuoteMentionedUserText.length;
      newQuoteMentionedUserText[arrLength - 2] = LOC.replying_to_and.message;
    }

    var textFragments = LOC.replying_to_user.message.split("$SCREEN_NAME$");
    textFragments = interleave(
      textFragments,
      newQuoteMentionedUserText
    ).flat(Infinity);

    oldStyleReplyTo = elNew(
      "span",
      { className: "tweet-reply-to tweet-quote-reply-to" },
      textFragments,
      // [
      //   LOC.replying_to_user.message.replace(
      //     "$SCREEN_NAME$",
      //     quoteMentionedUserText
      //       .trim()
      //       .replaceAll(` `, LOC.replying_to_comma.message)
      //       .replace(LOC.replying_to_comma.message, LOC.replying_to_and.message)
      //   ),
      // ]
    );
  }

  var textBodySpan = [vars.useOldStyleReply ? quoteMentionedUserText : ""];
  if (t.quoted_status.full_text) {
    // XXX: renderTweetBodyHTML returns html. To refactor later.
    textBodySpan.push(htmlToNodes(await renderTweetBodyHTML(t, true)).content);
  }
  const bodyElement = elNew(
    "span",
    {
      className: "tweet-body-text tweet-body-text-quote tweet-body-text-long",
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
        mediaElement.onclick = "if(this.paused) this.play(); else this.pause()";
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
      if (!vars.displaySensitiveContent && t.quoted_status.possibly_sensitive) {
        mediaElement.classList.add("tweet-media-element-censor");
      }
      return mediaElement;
    });
    mediaElement = elNew("div", { className: "tweet-media-quote" }, mediaMap);
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
            { className: "tweet-button tweet-quote-translate tweet-button" },
            [LOC.view_translation.message]
          )
        : ``,
    ]
  );
  return rootAHref.outerHTML;
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
  const _tweetTopConst = elNew("div", { className: "tweet-top", hidden: true });

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
        [escapeHTML(t.user.name)]
      ),
      " ",
      // @Handle
      elNew("span", { className: "tweet-header-handle" }, [
        "@" + escapeHTML(t.user.screen_name),
      ]),
    ]
  );

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
        title: tweetDateObject.toLocaleString(),
        href: `/${t.user.screen_name}/status/${t.id_str}`,
      },
      [timeElapsed(tweetTimestamp)]
    ),
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
        [t.user.following ? LOC.following_btn.message : LOC.follow.message]
      )
    );
  }
  // translate icon for timelines.
  if (!options.mainTweet && !tweetConstructorArgs.isMatchingLanguage) {
    tweetHeaderBlock.push(
      elNew("span", { className: ["tweet-translate-after", "tweet-button"] }, [
        `${t.user.name} ${t.user.screen_name} 1 Sept`.length < 40 &&
        innerWidth > 650
          ? LOC.view_translation.message
          : null,
      ])
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

  var tweet_top = "";
  [].forEach.call(tweetTopConst.children, function (el) {
    tweet_top += el.outerHTML;
  });

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
      const arrLength = tweetConstructorArgs.mentionedUserTextArray.length;
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
    bodyTextChildren.push(htmlToNodes(await renderTweetBodyHTML(t)).content);
  }

  // const body_node = elNew(
  //   "div",
  //   {
  //     lang: t.lang,
  //     classList: ["tweet-body-text", longShortClass],
  //   },
  //   [
  //     elNew("span", { class: ["tweet-body-text-span"] }, [
  //       vars.useOldStyleReply
  //         ? htmlToNodes(tweetConstructorArgs.mentionedUserText).content
  //         : null,
  //       tweetConstructorArgs.full_text
  //         ? htmlToNodes(await renderTweetBodyHTML(t)).content
  //         : null,
  //     ]),
  //   ]
  // );

  const bodyNodeV2 = elNew(
    "div",
    {
      lang: t.lang,
      classList: ["tweet-body-text", longShortClass],
    },
    [elNew("span", { class: ["tweet-body-text-span"] }, bodyTextChildren)]
  );
  // if (body_node.outerHTML != bodyNodeV2.outerHTML) {
  //   console.log("nodeCompare", body_node, bodyNodeV2);
  // }

  // translate icon
  var translate_node = null;
  if (!tweetConstructorArgs.isMatchingLanguage && options.mainTweet) {
    translate_node = elNew("div", {}, [
      elNew("br"),
      elNew("span", { class: ["tweet-button", "tweet-translate"] }, [
        LOC.view_translation.message,
      ]),
    ]);
  }
  const body_text = bodyNodeV2.outerHTML;

  const translate_text = translate_node ? translate_node.outerHTML : "";

  // render media content elements
  var extended_node = null;
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
    if (mediaNodes.length == 0) {
      console.log("Cannot render mediaNodes?",t)
    }

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
      var resolutionNodes = tweetConstructorArgs.videos[0].video_info.variants
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
    extended_node = elNew("template", {}, [
      elNew("div", { class: ["tweet-media"] }, [videoOverlay, ...mediaNodes]),
      gifControl,
      videoControls,
      elNew("span", { class: "tweet-media-data" }),
    ]);
  }

  var extended_media = "";
  if (extended_node) {
    [].forEach.call(extended_node.children, function (el) {
      extended_media += el.outerHTML;
    });
  }

  // card placeholder if there is a card to placeholder.
  const card = t.card ? `<div class="tweet-card"></div>` : "";
  // quoted tweet status.
  let quoted_tweet = "";
  if (t.quoted_status) {
    quoted_tweet = await constructQuotedTweet(
      t,
      tweetConstructorArgs.isQuoteMatchingLanguage,
      tweetConstructorArgs.quoteMentionedUserText
    );
  }

  // limited text
  var limited = "";
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
    limited = elNew("div", { class: ["tweet-limited"] }, [
      LOC.circle_limited_tweet.message.replace("$SCREEN_NAME$", screen_name),
      elNew(
        "a",
        {
          href: "https://help.twitter.com/en/using-twitter/twitter-circle",
          target: "blank",
        },
        [LOC.learn_more.message]
      ),
    ]).outerHTML;

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
  const tomb_stone = t.tombstone
    ? elNew("div", { class: ["tweet-warning"] }, [t.tombstone]).outerHTML
    : "";
  // country restricted text.
  var country_restrictions = "";
  if (
    (t.withheld_in_countries &&
      (t.withheld_in_countries.includes("XX") ||
        t.withheld_in_countries.includes("XY"))) ||
    t.withheld_scope
  ) {
    country_restrictions = elNew("div", { class: ["tweet-warning"] }, [
      "This Tweet has been withheld in response to a report from the copyright holder.",
      elNew(
        "a",
        {
          href: "https://help.twitter.com/en/rules-and-policies/copyright-policy",
          target: "_blank",
        },
        ["Learn more."]
      ),
    ]);
  }
  // const country_restrictions =
  //   (t.withheld_in_countries &&
  //     (t.withheld_in_countries.includes("XX") ||
  //       t.withheld_in_countries.includes("XY"))) ||
  //   t.withheld_scope
  //     ? `<div class="tweet-warning">
  //       This Tweet has been withheld in response to a report from the copyright holder. <a href="https://help.twitter.com/en/rules-and-policies/copyright-policy" target="_blank">Learn more.</a></div>`
  //     : "";

  var conversation_control = "";
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
        (t.conversation_control.policy.toLowerCase() === "by_invitation" &&
          tweetConstructorArgs.full_text &&
          tweetConstructorArgs.full_text.includes(`@${user.screen_name}`)));
    if (replyText) {
      replyText = " " + LOC.you_can_reply.message;
    } else {
      replyText = "";
    }
    conversation_control = elNew("div", { class: "tweet-warning" }, [
      limitedActions,
      replyText,
    ]).outerHTML;
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

  var tweet_footer = "";
  if (options.mainTweet) {
    var statsArray = [];
    // Replies
    statsArray.push(
      elNew(
        "a",
        {
          href: `${t.user.screen_name}/status/${t.id_str}`,
          class: ["tweet-footer-stat", "tweet-footer-stat-o"],
        },
        [
          elNew("span", { class: "tweet-footer-stat-text" }, [
            LOC.replies.message,
          ]),
          elNew(
            "b",
            {
              class: ["tweet-footer-stat-count", "tweet-footer-stat-replies"],
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
          href: `${t.user.screen_name}/status/${t.id_str}/retweets`,
          class: ["tweet-footer-stat", "tweet-footer-stat-o"],
        },
        [
          elNew("span", { class: "tweet-footer-stat-text" }, [
            LOC.retweets.message,
          ]),
          elNew(
            "b",
            {
              class: ["tweet-footer-stat-count", "tweet-footer-stat-r"],
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
            href: `${t.user.screen_name}/status/${t.id_str}/retweets/with_comments`,
            class: ["tweet-footer-stat", "tweet-footer-stat-q"],
          },
          [
            elNew("span", { class: "tweet-footer-stat-text" }, [
              LOC.quotes.message,
            ]),
            elNew(
              "b",
              {
                class: ["tweet-footer-stat-count", "tweet-footer-stat-quotes"],
              },
              [formatLargeNumber(t.quote_count).replace(/\s/g, ",")]
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
          href: `${t.user.screen_name}/status/${t.id_str}/likes`,
          class: ["tweet-footer-stat", "tweet-footer-stat-f"],
        },
        [
          elNew("span", { class: "tweet-footer-stat-text" }, [
            vars.heartsNotStars ? LOC.likes.message : LOC.favorites.message,
          ]),
          elNew(
            "b",
            {
              class: ["tweet-footer-stat-count", "tweet-footer-stat-favorites"],
            },
            [formatLargeNumber(t.favorite_count).replace(/\s/g, ",")]
          ),
        ]
      )
    );

    tweet_footer = elNew("div", { class: ["tweet-footer"] }, [
      elNew("div", { class: ["tweet-footer-stats"] }, statsArray),
    ]).outerHTML;
  }
  const tweet_date = elNew(
    "a",
    {
      hidden: !options.mainTweet ? true : false,
      class: ["tweet-date"],
      title: new Date(t.created_at).toLocaleString(),
      href: `/${t.user.screen_name}/status/${t.id_str}`,
    },
    [
      elNew("br"),
      new Date(t.created_at)
        .toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" })
        .toLowerCase(),
      " - ",
      new Date(t.created_at).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      "  ・ ",
      t.source ? t.source.split(">")[1].split("<")[0] : "Unknown",
    ]
  ).outerHTML;

  // solve additional retweet actions
  var retweetClasses = ["tweet-button", "tweet-interact-retweet"];
  if (t.retweeted) {
    retweetClasses.push("tweet-interact-retweeted");
  }
  if (
    (t.user.protected || t.limited_actions === "limit_trusted_friends_tweet") &&
    t.user.id_str !== user.id_str
  ) {
    retweetClasses.push("tweet-interact-retweet-disabled");
  }

  var likeClasses = ["tweet-button", "tweet-interact-favorite"];
  if (t.favorited) {
    likeClasses.push("tweet-interact-favorited");
  }
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

  // Tweet Interactions buttons
  elNew("div", { class: ["tweet-interact"] }, [
    // reply
    elNew(
      "span",
      {
        class: ["tweet-button", "tweet-interact-reply"],
        title: `${LOC.reply_btn.message}${!vars.disableHotkeys ? " (R)" : ""}`,
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
        class: ["tweet-button", "tweet-interact-favorite"],
        title: `${LOC.reply_btn.message}${!vars.disableHotkeys ? " (L)" : ""}`,
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
          vars.heartsNotStars ? LOC.like_btn.message : LOC.favorite_btn.message
        }${!vars.disableHotkeys ? " (L)" : ""}`,
        dataset: { val: t.favorite_count },
      },
      [
        options.mainTweet
          ? null
          : formatLargeNumber(t.retweet_count).replace(/\s/g, ","),
      ]
    ),
  ]);

  const tweet_interact = `<div class="tweet-interact">
                    <span class="tweet-button tweet-interact-reply" title="${
                      LOC.reply_btn.message
                    }${!vars.disableHotkeys ? " (R)" : ""}" data-val="${
    t.reply_count
  }">${
    options.mainTweet
      ? ""
      : formatLargeNumber(t.reply_count).replace(/\s/g, ",")
  }</span>
                    <span title="${
                      LOC.retweet_btn.message
                    }" class="tweet-button tweet-interact-retweet${
    t.retweeted ? " tweet-interact-retweeted" : ""
  }${
    (t.user.protected || t.limited_actions === "limit_trusted_friends_tweet") &&
    t.user.id_str !== user.id_str
      ? " tweet-interact-retweet-disabled"
      : ""
  }" data-val="${t.retweet_count}">${
    options.mainTweet
      ? ""
      : formatLargeNumber(t.retweet_count).replace(/\s/g, ",")
  }</span>
                    <div class="tweet-interact-retweet-menu dropdown-menu" hidden>
                        <span class="tweet-interact-retweet-menu-retweet">${
                          t.retweeted
                            ? LOC.unretweet.message
                            : LOC.retweet.message
                        }${!vars.disableHotkeys ? " (T)" : ""}</span>
                        <span class="tweet-interact-retweet-menu-quote">${
                          LOC.quote_tweet.message
                        }${!vars.disableHotkeys ? " (Q)" : ""}</span>
                        ${
                          options.mainTweet
                            ? html`
                                <span class="tweet-interact-retweet-menu-quotes"
                                  >${LOC.see_quotes_big.message}</span
                                >
                                <span
                                  class="tweet-interact-retweet-menu-retweeters"
                                  >${LOC.see_retweeters.message}</span
                                >
                              `
                            : ""
                        }
                    </div>
                    <span title="${
                      vars.heartsNotStars
                        ? LOC.like_btn.message
                        : LOC.favorite_btn.message
                    }${
    !vars.disableHotkeys ? " (L)" : ""
  }" class="tweet-button tweet-interact-favorite ${
    t.favorited ? "tweet-interact-favorited" : ""
  }" data-val="${t.favorite_count}">${
    options.mainTweet
      ? ""
      : formatLargeNumber(t.favorite_count).replace(/\s/g, ",")
  }</span>
                    ${
                      (vars.showBookmarkCount || options.mainTweet) &&
                      typeof t.bookmark_count !== "undefined"
                        ? html`<span
                            title="${LOC.bookmarks_count
                              .message}${!vars.disableHotkeys ? " (B)" : ""}"
                            class="tweet-button tweet-interact-bookmark${t.bookmarked
                              ? " tweet-interact-bookmarked"
                              : ""}"
                            data-val="${t.bookmark_count}"
                            >${formatLargeNumber(t.bookmark_count).replace(
                              /\s/g,
                              ","
                            )}</span
                          >`
                        : ""
                    }
                    ${
                      vars.seeTweetViews &&
                      t.ext &&
                      t.ext.views &&
                      t.ext.views.r &&
                      t.ext.views.r.ok &&
                      t.ext.views.r.ok.count
                        ? html`<span
                            title="${LOC.views_count.message}"
                            class="tweet-interact-views tweet-button"
                            data-val="${t.ext.views.r.ok.count}"
                            >${formatLargeNumber(
                              t.ext.views.r.ok.count
                            ).replace(/\s/g, ",")}</span
                          >`
                        : ""
                    }
                    <span class="tweet-button tweet-interact-more"></span>
                    <div class="tweet-interact-more-menu dropdown-menu" hidden>
                        ${
                          innerWidth < 590
                            ? html`
                                <span class="tweet-interact-more-menu-separate"
                                  >${LOC.separate_text.message}</span
                                >
                              `
                            : ""
                        }
                        <span class="tweet-interact-more-menu-copy">${
                          LOC.copy_link.message
                        }</span>
                        <span class="tweet-interact-more-menu-embed">${
                          LOC.embed_tweet.message
                        }</span>
                        ${
                          navigator.canShare
                            ? `<span class="tweet-interact-more-menu-share">${LOC.share_tweet.message}</span>`
                            : ""
                        }
                        <span class="tweet-interact-more-menu-share-dms">${
                          LOC.share_tweet_in_dms.message
                        }</span>
                        <span class="tweet-interact-more-menu-newtwitter">${
                          LOC.open_tweet_newtwitter.message
                        }</span>
                        ${
                          t.user.id_str === user.id_str
                            ? `
                                      <hr />
                                      <span
                                          class="tweet-interact-more-menu-analytics"
                                          >${LOC.tweet_analytics.message}</span
                                      >
                                      <span
                                          class="tweet-interact-more-menu-delete"
                                          >${LOC.delete_tweet.message}</span
                                      >
                                      ${
                                        typeof pageUser !== "undefined" &&
                                        pageUser.id_str === user.id_str
                                          ? `<span
                                                class="tweet-interact-more-menu-pin"
                                                >${
                                                  pinnedTweet &&
                                                  pinnedTweet.id_str ===
                                                    t.id_str
                                                    ? LOC.unpin_tweet.message
                                                    : LOC.pin_tweet.message
                                                }</span
                                            >`
                                          : ""
                                      }
                                  `
                            : ""
                        }
                        ${
                          t.conversation_id_str &&
                          tweetStorage[t.conversation_id_str] &&
                          tweetStorage[t.conversation_id_str].user.id_str ===
                            user.id_str &&
                          t.user.id_str !== user.id_str
                            ? `
                                      <span
                                          class="tweet-interact-more-menu-hide"
                                          >${
                                            t.moderated
                                              ? LOC.unhide_tweet.message
                                              : LOC.hide_tweet.message
                                          }</span
                                      >
                                  `
                            : ""
                        }
                        ${
                          t.hasModeratedReplies
                            ? html`
                                <span class="tweet-interact-more-menu-hidden"
                                  ><a
                                    target="_blank"
                                    href="/${t.user
                                      .screen_name}/status/${t.id_str}/hidden?newtwitter=true"
                                    >${LOC.see_hidden_replies.message}</a
                                  ></span
                                >
                              `
                            : ""
                        }
                        <hr>
                        ${
                          t.user.id_str !== user.id_str && !options.mainTweet
                            ? `
                                      <span
                                          class="tweet-interact-more-menu-follow"
                                          ${t.user.blocking ? " hidden" : ""}
                                          >${
                                            t.user.following
                                              ? tweetConstructorArgs.unfollowUserText
                                              : tweetConstructorArgs.followUserText
                                          }</span
                                      >
                                  `
                            : ""
                        }
                        ${
                          t.user.id_str !== user.id_str
                            ? html`
                                <span class="tweet-interact-more-menu-block"
                                  >${t.user.blocking
                                    ? tweetConstructorArgs.unblockUserText
                                    : tweetConstructorArgs.blockUserText}</span
                                >
                                <span class="tweet-interact-more-menu-mute-user"
                                  >${t.user.muting
                                    ? LOC.unmute_user.message.replace(
                                        "$SCREEN_NAME$",
                                        t.user.screen_name
                                      )
                                    : LOC.mute_user.message.replace(
                                        "$SCREEN_NAME$",
                                        t.user.screen_name
                                      )}</span
                                >
                                <span
                                  class="tweet-interact-more-menu-lists-action"
                                  >${LOC.from_list.message}</span
                                >
                              `
                            : ""
                        }
                        ${
                          !location.pathname.startsWith("/i/bookmarks")
                            ? html`<span
                                class="tweet-interact-more-menu-bookmark"
                                >${t.bookmarked
                                  ? LOC.remove_bookmark.message
                                  : LOC.bookmark_tweet.message}</span
                              >`
                            : ""
                        }
                        <span class="tweet-interact-more-menu-mute">${
                          t.conversation_muted
                            ? LOC.unmute_convo.message
                            : LOC.mute_convo.message
                        }</span>
                        <hr>
                        ${
                          t.feedback
                            ? t.feedback
                                .map(
                                  (f, i) =>
                                    html`<span
                                      class="tweet-interact-more-menu-feedback"
                                      data-index="${i}"
                                      >${f.prompt
                                        ? f.prompt
                                        : LOC.topic_not_interested
                                            .message}</span
                                    >`
                                )
                                .join("\n")
                            : ""
                        }
                        <span class="tweet-interact-more-menu-refresh">${
                          LOC.refresh_tweet.message
                        }</span>
                        ${
                          t.extended_entities &&
                          t.extended_entities.media.length === 1 &&
                          t.extended_entities.media[0].type === "animated_gif"
                            ? html`<span
                                class="tweet-interact-more-menu-download-gif"
                                data-gifno="1"
                                >${LOC.download_gif.message}</span
                              >`
                            : ``
                        }
                        ${
                          t.extended_entities &&
                          t.extended_entities.media.length > 1
                            ? t.extended_entities.media
                                .filter((m) => m.type === "animated_gif")
                                .map(
                                  (m, i) =>
                                    `<span
                                                  class="tweet-interact-more-menu-download-gif"
                                                  data-gifno="${i + 1}"
                                                  >${LOC.download_gif.message}
                                                  (#${i + 1})</span
                                              >`
                                )
                                .join("\n")
                            : ""
                        }
                        ${
                          t.extended_entities &&
                          t.extended_entities.media.length > 0
                            ? `<span
                                      class="tweet-interact-more-menu-download"
                                      >${LOC.download_media.message}</span
                                  >`
                            : ``
                        }
                        ${
                          vars.developerMode
                            ? `
                                      <hr />
                                      <span
                                          class="tweet-interact-more-menu-copy-user-id"
                                          >${LOC.copy_user_id.message}</span
                                      >
                                      <span
                                          class="tweet-interact-more-menu-copy-tweet-id"
                                          >${LOC.copy_tweet_id.message}</span
                                      >
                                      <span class="tweet-interact-more-menu-log"
                                          >Log tweet object</span
                                      >
                                  `
                            : ""
                        }
                    </div>
                    ${
                      options.selfThreadButton &&
                      t.self_thread &&
                      t.self_thread.id_str &&
                      !options.threadContinuation &&
                      !location.pathname.includes("/status/")
                        ? `<a
                                  class="tweet-self-thread-button tweet-thread-right"
                                  target="_blank"
                                  href="/${t.user.screen_name}/status/${t.self_thread.id_str}"
                                  >${LOC.show_this_thread.message}</a
                              >`
                        : ``
                    }
                    ${
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
                        ? `<a class="tweet-self-thread-button tweet-thread-right" target="_blank" href="/${t.in_reply_to_screen_name}/status/${t.in_reply_to_status_id_str}">${LOC.show_this_thread.message}</a>`
                        : ``
                    }
                </div>`;

  const tweet_edit = `<div class="tweet-edit-section tweet-reply" hidden>
                    <br>
                    <b style="font-size: 12px;display: block;margin-bottom: 5px;">${
                      LOC.replying_to_tweet.message
                    } <span ${
    !vars.disableHotkeys ? 'title="ALT+M"' : ""
  } class="tweet-reply-upload">${
    LOC.upload_media_btn.message
  }</span> <span class="tweet-reply-add-emoji">${
    LOC.emoji_btn.message
  }</span> <span ${
    !vars.disableHotkeys ? 'title="ALT+R"' : ""
  } class="tweet-reply-cancel">${LOC.cancel_btn.message}</span></b>
                    <span class="tweet-reply-error" style="color:red"></span>
                    <textarea maxlength="25000" class="tweet-reply-text" placeholder="${
                      LOC.reply_example.message
                    }"></textarea>
                    <button title="CTRL+ENTER" class="tweet-reply-button nice-button">${
                      LOC.reply.message
                    }</button><br>
                    <span class="tweet-reply-char">${
                      localStorage.OTisBlueVerified ? "0/25000" : "0/280"
                    }</span><br>
                    <div class="tweet-reply-media" style="padding-bottom: 10px;"></div>
                </div>
                <div class="tweet-edit-section tweet-quote" hidden>
                    <br>
                    <b style="font-size: 12px;display: block;margin-bottom: 5px;">${
                      LOC.quote_tweet.message
                    } <span ${
    !vars.disableHotkeys ? 'title="ALT+M"' : ""
  } class="tweet-quote-upload">${
    LOC.upload_media_btn.message
  }</span> <span class="tweet-quote-add-emoji">${
    LOC.emoji_btn.message
  }</span> <span ${
    !vars.disableHotkeys ? 'title="ALT+Q"' : ""
  } class="tweet-quote-cancel">${LOC.cancel_btn.message}</span></b>
                    <span class="tweet-quote-error" style="color:red"></span>
                    <textarea maxlength="25000" class="tweet-quote-text" placeholder="${
                      LOC.quote_example.message
                    }"></textarea>
                    <button title="CTRL+ENTER" class="tweet-quote-button nice-button">${
                      LOC.quote.message
                    }</button><br>
                    <span class="tweet-quote-char">${
                      localStorage.OTisBlueVerified ? "0/25000" : "0/280"
                    }</span><br>
                    <div class="tweet-quote-media" style="padding-bottom: 10px;"></div>
                </div>`;

  const replies = `<div class="tweet-self-thread-div" ${
    options.threadContinuation ||
    (options.selfThreadContinuation && t.self_thread && t.self_thread.id_str)
      ? ""
      : "hidden"
  }>
                    ${
                      options.selfThreadContinuation &&
                      t.self_thread &&
                      t.self_thread.id_str &&
                      !location.pathname.includes("/status/")
                        ? `<br />
                                  <a
                                      class="tweet-self-thread-button"
                                      target="_blank"
                                      href="/${t.user.screen_name}/status/${t.self_thread.id_str}"
                                  >
                                      ${LOC.show_this_thread.message}
                                  </a>
                                  <span
                                      class="tweet-self-thread-line"
                                      style="margin-left: -108px;margin-top: -5px;"
                                  ></span>
                                  <div
                                      class="tweet-self-thread-line-dots"
                                      style="margin-left: -120px;margin-top: -3px;"
                                  ></div> `
                        : `
                                  ${
                                    location.pathname.includes("/status/")
                                      ? `<br><br>`
                                      : ""
                                  }
                                  <span
                                      ${
                                        location.pathname.includes("/status/")
                                          ? `style="margin-top:-10px;" `
                                          : ""
                                      }class="tweet-self-thread-line"
                                  ></span>
                                  <div
                                      ${
                                        location.pathname.includes("/status/")
                                          ? `style="margin-top:-8px;" `
                                          : ""
                                      }class="tweet-self-thread-line-dots"
                                  ></div>
                              `
                    }
                </div>`;

  return [
    tweet_top,
    mentioned_node
      ? mentioned_node.outerHTML
      : `` +
        body_text +
        translate_text +
        extended_media +
        card +
        quoted_tweet +
        limited +
        tomb_stone +
        country_restrictions +
        conversation_control +
        tweet_footer +
        tweet_date +
        tweet_interact +
        tweet_edit +
        replies,
  ];
}
