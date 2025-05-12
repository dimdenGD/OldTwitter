async function constructQuotedTweet(
    t,
    isQuoteMatchingLanguage,
    quoteMentionedUserText
) {
    return `${
        t.quoted_status
            ? html`
                  <a
                      class="tweet-body-quote"
                      target="_blank"
                      href="/${t.quoted_status.user.screen_name}/status/${t
                          .quoted_status.id_str}"
                  >
                      <img
                          src="${t.quoted_status.user.default_profile_image &&
                          vars.useOldDefaultProfileImage
                              ? chrome.runtime.getURL(
                                    `images/default_profile_images/default_profile_${
                                        Number(t.quoted_status.user.id_str) % 7
                                    }_normal.png`
                                )
                              : t.quoted_status.user.profile_image_url_https}"
                          alt="${escapeHTML(t.quoted_status.user.name)}"
                          class="tweet-avatar-quote"
                          width="24"
                          height="24"
                      />
                      <div class="tweet-header-quote">
                          <span class="tweet-header-info-quote">
                              <b
                                  class="tweet-header-name-quote ${t
                                      .quoted_status.user.verified
                                      ? "user-verified"
                                      : t.quoted_status.user.id_str ===
                                        "1708130407663759360"
                                      ? "user-verified user-verified-dimden"
                                      : ""} ${t.quoted_status.user.protected
                                      ? "user-protected"
                                      : ""} ${t.quoted_status.user
                                      .verified_type === "Government"
                                      ? "user-verified-gray"
                                      : t.quoted_status.user.verified_type ===
                                        "Business"
                                      ? "user-verified-yellow"
                                      : t.quoted_status.user.verified_type ===
                                        "Blue"
                                      ? "user-verified-blue"
                                      : ""}"
                                  >${escapeHTML(t.quoted_status.user.name)}</b
                              >
                              <span class="tweet-header-handle-quote"
                                  >@${t.quoted_status.user.screen_name}</span
                              >
                          </span>
                      </div>
                      <span
                          class="tweet-time-quote"
                          data-timestamp="${new Date(
                              t.quoted_status.created_at
                          ).getTime()}"
                          title="${new Date(
                              t.quoted_status.created_at
                          ).toLocaleString()}"
                          >${timeElapsed(
                              new Date(t.quoted_status.created_at).getTime()
                          )}</span
                      >
                      ${quoteMentionedUserText !== `` && !vars.useOldStyleReply
                          ? html`
                                <span
                                    class="tweet-reply-to tweet-quote-reply-to"
                                    >${LOC.replying_to_user.message.replace(
                                        "$SCREEN_NAME$",
                                        quoteMentionedUserText
                                            .trim()
                                            .replaceAll(
                                                ` `,
                                                LOC.replying_to_comma.message
                                            )
                                            .replace(
                                                LOC.replying_to_comma.message,
                                                LOC.replying_to_and.message
                                            )
                                    )}</span
                                >
                            `
                          : ""}
                      <span
                          class="tweet-body-text tweet-body-text-quote tweet-body-text-long"
                          style="color:var(--default-text-color)!important"
                          >${vars.useOldStyleReply
                              ? quoteMentionedUserText
                              : ""}${t.quoted_status.full_text
                              ? await renderTweetBodyHTML(t, true)
                              : ""}</span
                      >
                      ${t.quoted_status.extended_entities &&
                      t.quoted_status.extended_entities.media
                          ? html`
                                <div class="tweet-media-quote">
                                    ${t.quoted_status.extended_entities.media
                                        .map(
                                            (m) =>
                                                `<${
                                                    m.type === "photo"
                                                        ? "img"
                                                        : "video"
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
                                                    quoteSizeFunctions[
                                                        t.quoted_status
                                                            .extended_entities
                                                            .media.length
                                                    ](
                                                        m.original_info.width,
                                                        m.original_info.height
                                                    )[0]
                                                }" height="${
                                                    quoteSizeFunctions[
                                                        t.quoted_status
                                                            .extended_entities
                                                            .media.length
                                                    ](
                                                        m.original_info.width,
                                                        m.original_info.height
                                                    )[1]
                                                }" loading="lazy" ${
                                                    m.type === "video"
                                                        ? "disableRemotePlayback controls"
                                                        : ""
                                                } ${
                                                    m.type === "animated_gif"
                                                        ? 'disableRemotePlayback loop muted onclick="if(this.paused) this.play(); else this.pause()"'
                                                        : ""
                                                }${
                                                    m.type === "animated_gif" &&
                                                    !vars.disableGifAutoplay
                                                        ? " autoplay"
                                                        : ""
                                                } src="${
                                                    m.type === "photo"
                                                        ? m.media_url_https +
                                                          (vars.showOriginalImages &&
                                                          (m.media_url_https.endsWith(
                                                              ".jpg"
                                                          ) ||
                                                              m.media_url_https.endsWith(
                                                                  ".png"
                                                              ))
                                                              ? "?name=orig"
                                                              : window.navigator &&
                                                                navigator.connection &&
                                                                navigator
                                                                    .connection
                                                                    .type ===
                                                                    "cellular" &&
                                                                !vars.disableDataSaver
                                                              ? "?name=small"
                                                              : "")
                                                        : m.video_info.variants.find(
                                                              (v) =>
                                                                  v.content_type ===
                                                                  "video/mp4"
                                                          ).url
                                                }" class="tweet-media-element tweet-media-element-quote ${
                                                    m.type === "animated_gif"
                                                        ? "tweet-media-element-quote-gif"
                                                        : ""
                                                } ${
                                                    mediaClasses[
                                                        t.quoted_status
                                                            .extended_entities
                                                            .media.length
                                                    ]
                                                } ${
                                                    !vars.displaySensitiveContent &&
                                                    t.quoted_status
                                                        .possibly_sensitive
                                                        ? "tweet-media-element-censor"
                                                        : ""
                                                }">${
                                                    m.type === "photo"
                                                        ? ""
                                                        : "</video>"
                                                }`
                                        )
                                        .join("\n")}
                                </div>
                            `
                          : ""}
                      ${!isQuoteMatchingLanguage
                          ? html`
                                <span
                                    class="tweet-button tweet-quote-translate tweet-button"
                                    >${LOC.view_translation.message}</span
                                >
                            `
                          : ``}
                  </a>
              `
            : ``
    }`;
}

async function constructTweet(t, c_args, options = {}) {
    const tweet_top = `<div class="tweet-top" hidden></div><a class="tweet-avatar-link" href="/${
        t.user.screen_name
    }"><img onerror="this.src = '${
        vars.useOldDefaultProfileImage
            ? chrome.runtime.getURL(
                  `images/default_profile_images/default_profile_bigger.png`
              )
            : "https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png"
    }'" src="${`${
        t.user.default_profile_image && vars.useOldDefaultProfileImage
            ? chrome.runtime.getURL(
                  `images/default_profile_images/default_profile_${
                      Number(t.user.id_str) % 7
                  }_normal.png`
              )
            : t.user.profile_image_url_https
    }`.replace("_normal.", "_bigger.")}" alt="${
        t.user.name
    }" class="tweet-avatar" width="48" height="48"></a>`;

    const tweet_header = `<div class="tweet-header ${
        options.mainTweet ? "tweet-header-main" : ""
    }"><a class="tweet-header-info ${
        options.mainTweet ? "tweet-header-info-main" : ""
    }" href="/${t.user.screen_name}"><b ${
        t.user.id_str === "1708130407663759360"
            ? 'title="Old Twitter Layout extension developer" '
            : ""
    } class="tweet-header-name ${
        options.mainTweet ? "tweet-header-name-main" : ""
    } ${
        t.user.verified || t.user.verified_type
            ? "user-verified"
            : t.user.id_str === "1708130407663759360"
            ? "user-verified user-verified-dimden"
            : ""
    } ${t.user.protected ? "user-protected" : ""} ${
        t.user.verified_type === "Government"
            ? "user-verified-gray"
            : t.user.verified_type === "Business"
            ? "user-verified-yellow"
            : t.user.verified_type === "Blue"
            ? "user-verified-blue"
            : ""
    }">${escapeHTML(t.user.name)}</b><span class="tweet-header-handle">@${
        t.user.screen_name
    }</span></a><a ${
        options.mainTweet ? "hidden" : ""
    } class="tweet-time" data-timestamp="${new Date(
        t.created_at
    ).getTime()}" title="${new Date(t.created_at).toLocaleString()}" href="/${
        t.user.screen_name
    }/status/${t.id_str}">${timeElapsed(new Date(t.created_at).getTime())}</a>${
        location.pathname.split("?")[0].split("#")[0] === "/i/bookmarks"
            ? `<span class="tweet-button tweet-delete-bookmark${
                  !c_args.isMatchingLanguage
                      ? " tweet-delete-bookmark-lower"
                      : ""
              }">&times;</span>`
            : ""
    } ${
        options.mainTweet && t.user.id_str !== user.id_str
            ? `<button class='tweet-button nice-button tweet-header-follow ${
                  t.user.following ? "following" : "follow"
              }'>${
                  t.user.following
                      ? LOC.following_btn.message
                      : LOC.follow.message
              }</button>`
            : ""
    } ${
        !options.mainTweet && !c_args.isMatchingLanguage
            ? `<span class="tweet-translate-after tweet-button">${
                  `${t.user.name} ${t.user.screen_name} 1 Sept`.length < 40 &&
                  innerWidth > 650
                      ? LOC.view_translation.message
                      : ""
              }</span>`
            : ""
    }</div>`;

    // body
    var mentioned_text = "";
    if (
        c_args.mentionedUserText !== `` &&
        !options.threadContinuation &&
        !options.noTop &&
        !location.pathname.includes("/status/") &&
        !vars.useOldStyleReply
    ) {
        mentioned_text = `
            <div class="tweet-reply-to">
                <span>
                    ${LOC.replying_to_user.message.replace(
                        "$SCREEN_NAME$",
                        c_args.mentionedUserText
                            .trim()
                            .replaceAll(
                                `> <`,
                                `>${LOC.replying_to_comma.message}<`
                            )
                            .replace(
                                `>${LOC.replying_to_comma.message}<`,
                                `>${LOC.replying_to_and.message}<`
                            )
                    )}</span
                >
            </div>
        `;
    }

    const body_text = `<div lang="${t.lang}" class="tweet-body-text ${
        vars.noBigFont ||
        t.full_text.length > 280 ||
        !options.bigFont ||
        (!options.mainTweet && location.pathname.includes("/status/"))
            ? "tweet-body-text-long"
            : "tweet-body-text-short"
    }">
                    <span class="tweet-body-text-span">${
                        vars.useOldStyleReply
                            ? /*html*/ c_args.mentionedUserText
                            : ""
                    }${
        c_args.full_text ? await renderTweetBodyHTML(t) : ""
    }</span>
                </div>`;
    var translate_text = "";
    if (!c_args.isMatchingLanguage && options.mainTweet) {
        translate_text = `
            <br/>
            <span class="tweet-button tweet-translate"
                >${LOC.view_translation.message}</span
            >
        `;
    }

    var extended_media = "";
    if (t.extended_entities && t.extended_entities.media) {
        extended_media = `
            <div class="tweet-media">
                ${t.extended_entities.media.length === 1 &&
                t.extended_entities.media[0].type === "video"
                    ? `
                          <div class="tweet-media-video-overlay tweet-button">
                              <svg
                                  viewBox="0 0 24 24"
                                  class="tweet-media-video-overlay-play"
                              >
                                  <g>
                                      <path
                                          class="svg-play-path"
                                          d="M8 5v14l11-7z"
                                      ></path>
                                      <path
                                          d="M0 0h24v24H0z"
                                          fill="none"
                                      ></path>
                                  </g>
                              </svg>
                          </div>
                      `
                    : ""}
                ${renderMedia(t)}
            </div>
            ${t.extended_entities &&
            t.extended_entities.media &&
            t.extended_entities.media.some((m) => m.type === "animated_gif")
                ? `<div class="tweet-media-controls">GIF</div>`
                : ""}
            ${c_args.videos
                ? `
                      <div class="tweet-media-controls">
                          ${c_args.videos[0].ext &&
                          c_args.videos[0].ext.mediaStats &&
                          c_args.videos[0].ext.mediaStats.r &&
                          c_args.videos[0].ext.mediaStats.r.ok
                              ? `<span class="tweet-video-views tweet-button">${Number(
                                    c_args.videos[0].ext.mediaStats.r.ok
                                        .viewCount
                                )
                                    .toLocaleString()
                                    .replace(/\s/g, ",")} ${
                                    LOC.views.message
                                }</span> • `
                              : ""}<span class="tweet-video-reload tweet-button"
                              >${LOC.reload.message}</span
                          >
                          •
                          ${c_args.videos[0].video_info.variants
                              .filter((v) => v.bitrate)
                              .map(
                                  (v) =>
                                      `<span class="tweet-video-quality tweet-button" data-url="${
                                          v.url
                                      }">${
                                          v.url.match(/\/(\d+)x/)[1] + "p"
                                      }</span> `
                              )
                              .join(" / ")}
                      </div>
                  `
                : ``}
            <span class="tweet-media-data"></span>
        `;
    }

    const card = t.card ? `<div class="tweet-card"></div>` : "";
    const quoted_tweet = await constructQuotedTweet(
        t,
        c_args.isQuoteMatchingLanguage,
        c_args.quoteMentionedUserText
    );
    var limited = "";
    if (
        t.limited_actions === "limit_trusted_friends_tweet" &&
        (options.mainTweet || !location.pathname.includes("/status/"))
    ) {
        limited = `
            <div class="tweet-limited">
                ${LOC.circle_limited_tweet.message}
                <a
                    href="https://help.twitter.com/en/using-twitter/twitter-circle"
                    target="_blank"
                    >${LOC.learn_more.message}</a
                >
            </div>
        `.replace(
            "$SCREEN_NAME$",
            tweet.trusted_circle_owner
                ? tweet.trusted_circle_owner
                : tweetStorage[t.conversation_id_str]
                ? tweetStorage[t.conversation_id_str].user.screen_name
                : t.in_reply_to_screen_name
                ? t.in_reply_to_screen_name
                : t.user.screen_name
        );
    }
    var tomb_stone = t.tombstone
        ? `<div class="tweet-warning">${t.tombstone}</div>`
        : "";
    var country_restrictions =
        (t.withheld_in_countries &&
            (t.withheld_in_countries.includes("XX") ||
                t.withheld_in_countries.includes("XY"))) ||
        t.withheld_scope
            ? `<div class="tweet-warning">
        This Tweet has been withheld in response to a report from the copyright holder. <a href="https://help.twitter.com/en/rules-and-policies/copyright-policy" target="_blank">Learn more.</a></div>`
            : "";

    const conversation_control = t.conversation_control
        ? `<div class="tweet-warning">${
              t.limited_actions_text
                  ? t.limited_actions_text
                  : LOC.limited_tweet.message
          }${
              t.conversation_control.policy &&
              (t.user.id_str === user.id_str ||
                  (t.conversation_control.policy.toLowerCase() ===
                      "community" &&
                      (t.user.followed_by ||
                          (c_args.full_text &&
                              c_args.full_text.includes(
                                  `@${user.screen_name}`
                              )))) ||
                  (t.conversation_control.policy.toLowerCase() ===
                      "by_invitation" &&
                      c_args.full_text &&
                      c_args.full_text.includes(`@${user.screen_name}`)))
                  ? " " + LOC.you_can_reply.message
                  : ""
          }</div>`
        : "";

    const tweet_footer = options.mainTweet
        ? `
              <div class="tweet-footer">
                  <div class="tweet-footer-stats">
                      <a
                          href="/${t.user.screen_name}/status/${t.id_str}"
                          class="tweet-footer-stat tweet-footer-stat-o"
                      >
                          <span class="tweet-footer-stat-text"
                              >${LOC.replies.message}</span
                          >
                          <b
                              class="tweet-footer-stat-count tweet-footer-stat-replies"
                              >${formatLargeNumber(t.reply_count).replace(
                                  /\s/g,
                                  ","
                              )}</b
                          >
                      </a>
                      <a
                          href="/${t.user
                              .screen_name}/status/${t.id_str}/retweets"
                          class="tweet-footer-stat tweet-footer-stat-r"
                      >
                          <span class="tweet-footer-stat-text"
                              >${LOC.retweets.message}</span
                          >
                          <b
                              class="tweet-footer-stat-count tweet-footer-stat-retweets"
                              >${formatLargeNumber(t.retweet_count).replace(
                                  /\s/g,
                                  ","
                              )}</b
                          >
                      </a>
                      ${vars.showQuoteCount &&
                      typeof t.quote_count !== "undefined" &&
                      t.quote_count > 0
                          ? html`<a
                                href="/${t.user
                                    .screen_name}/status/${t.id_str}/retweets/with_comments"
                                class="tweet-footer-stat tweet-footer-stat-q"
                            >
                                <span class="tweet-footer-stat-text"
                                    >${LOC.quotes.message}</span
                                >
                                <b
                                    class="tweet-footer-stat-count tweet-footer-stat-quotes"
                                    >${formatLargeNumber(t.quote_count).replace(
                                        /\s/g,
                                        ","
                                    )}</b
                                >
                            </a>`
                          : ""}
                      <a
                          href="/${t.user.screen_name}/status/${t.id_str}/likes"
                          class="tweet-footer-stat tweet-footer-stat-f"
                      >
                          <span class="tweet-footer-stat-text"
                              >${vars.heartsNotStars
                                  ? LOC.likes.message
                                  : LOC.favorites.message}</span
                          >
                          <b
                              class="tweet-footer-stat-count tweet-footer-stat-favorites"
                              >${formatLargeNumber(t.favorite_count).replace(
                                  /\s/g,
                                  ","
                              )}</b
                          >
                      </a>
                  </div>
                  <div class="tweet-footer-favorites"></div>
              </div>
          `
        : "";

    const tweet_date = `<a ${
        !options.mainTweet ? "hidden" : ""
    } class="tweet-date" title="${new Date(
        t.created_at
    ).toLocaleString()}" href="/${t.user.screen_name}/status/${
        t.id_str
    }"><br>${new Date(t.created_at)
        .toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" })
        .toLowerCase()} - ${new Date(t.created_at).toLocaleDateString(
        undefined,
        { day: "numeric", month: "short", year: "numeric" }
    )}  ・ ${t.source ? t.source.split(">")[1].split("<")[0] : "Unknown"}</a>`;

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
        (t.user.protected ||
            t.limited_actions === "limit_trusted_friends_tweet") &&
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
                                      <span
                                          class="tweet-interact-retweet-menu-quotes"
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
                                      .message}${!vars.disableHotkeys
                                      ? " (B)"
                                      : ""}"
                                  class="tweet-button tweet-interact-bookmark${t.bookmarked
                                      ? " tweet-interact-bookmarked"
                                      : ""}"
                                  data-val="${t.bookmark_count}"
                                  >${formatLargeNumber(
                                      t.bookmark_count
                                  ).replace(/\s/g, ",")}</span
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
                                      <span
                                          class="tweet-interact-more-menu-separate"
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
                                      ${typeof pageUser !== "undefined" &&
                                      pageUser.id_str === user.id_str
                                          ? `<span
                                                class="tweet-interact-more-menu-pin"
                                                >${pinnedTweet &&
                                                pinnedTweet.id_str === t.id_str
                                                    ? LOC.unpin_tweet.message
                                                    : LOC.pin_tweet
                                                          .message}</span
                                            >`
                                          : ""}
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
                                          >${t.moderated
                                              ? LOC.unhide_tweet.message
                                              : LOC.hide_tweet.message}</span
                                      >
                                  `
                                : ""
                        }
                        ${
                            t.hasModeratedReplies
                                ? html`
                                      <span
                                          class="tweet-interact-more-menu-hidden"
                                          ><a
                                              target="_blank"
                                              href="/${t.user
                                                  .screen_name}/status/${t.id_str}/hidden?newtwitter=true"
                                              >${LOC.see_hidden_replies
                                                  .message}</a
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
                                          >${t.user.following
                                              ? c_args.unfollowUserText
                                              : c_args.followUserText}</span
                                      >
                                  `
                                : ""
                        }
                        ${
                            t.user.id_str !== user.id_str
                                ? html`
                                      <span
                                          class="tweet-interact-more-menu-block"
                                          >${t.user.blocking
                                              ? c_args.unblockUserText
                                              : c_args.blockUserText}</span
                                      >
                                      <span
                                          class="tweet-interact-more-menu-mute-user"
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
                                  href="/${t.user.screen_name}/status/${t
                                      .self_thread.id_str}"
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
        (options.selfThreadContinuation &&
            t.self_thread &&
            t.self_thread.id_str)
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
                                      href="/${t.user.screen_name}/status/${t
                                          .self_thread.id_str}"
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
                                  ${location.pathname.includes("/status/")
                                      ? `<br><br>`
                                      : ""}
                                  <span
                                      ${location.pathname.includes("/status/")
                                          ? `style="margin-top:-10px;" `
                                          : ""}class="tweet-self-thread-line"
                                  ></span>
                                  <div
                                      ${location.pathname.includes("/status/")
                                          ? `style="margin-top:-8px;" `
                                          : ""}class="tweet-self-thread-line-dots"
                                  ></div>
                              `
                    }
                </div>`;

    return [
        tweet_top + tweet_header,
        mentioned_text +
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
