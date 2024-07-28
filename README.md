# OldTwitter (2024)
Browser extension to return old Twitter layout from 2015 (and option to use 2018 design).  
This extension doesn't add any CSS on top of original Twitter. It's fully original client that replaces Twitter, making it much faster than alternatives.

## Installation

**Chrome, Edge, Opera, Brave & Chromium browsers:** [Chrome Web Store](https://chrome.google.com/webstore/detail/old-twitter-layout-2022/jgejdcdoeeabklepnkdbglgccjpdgpmf)  
**Firefox:** ~~[Addons For Firefox](https://addons.mozilla.org/en-US/firefox/addon/old-twitter-layout-2022/)~~ was removed, install manually from Github

## Donate

If you like this extension please consider donating:

- https://dimden.dev/donate
- https://patreon.com/dimdendev

## Screenshots

![Profile](https://lune.dimden.dev/ab9304b8c5.png)  
![Profile 2](https://lune.dimden.dev/a198d81e47.png)  
![Profile dark mode](https://lune.dimden.dev/8e7afd71fe.png)  
![Tweet](https://lune.dimden.dev/9acc5de7ad.png)  
![Notifications](https://lune.dimden.dev/73938743da.png)  
![Search](https://lune.dimden.dev/575b9d30f1.png)  
![Modern home](https://lune.dimden.dev/e1cf7d3fa61.png)

## Features

- Almost all of Twitter functionality is implemented
- Both reverse chronological and algorithmical timelines support. And exclusive: Reverse chronological timeline with friends likes and follows (basically mix of both chrono and algo timelines)
- Custom profile link colors supported
- You can change custom profile link color and it'll appear for other extension users (priority: oldtwitter color db -> twitter color db -> default color)
- Removes all analytics and tracking from Twitter
- Track your unfollowers for free
- Search, sort and filter your followers
- Removes all ads
- Easy download of videos and GIFs
- Translate tweets without having to open them, also ability to set specific users/languages to autotranslate
- Shows why tweets were added to algorthimical timeline
- Dark mode support
- Ability to enable/disable Twemoji, disable stars (favorites) back to likes (hearts), change font, default link color and any other color in extension
- Lot of hotkeys
- Mobile support with Kiwi Browser or Firefox
- Custom CSS support

## Manual installation

For beta version:

- You need Github account, please register if you haven't first!
- Go to [Actions page](https://github.com/dimdenGD/OldTwitter/actions/workflows/pack.yml)
- Click on latest "Pack Extension" workflow run (first from top)
- Download `OldTwitterChrome` if you're on Chromium based browsers and `OldTwitterFirefox` if you're on Firefox

For stable version:

- Go to [Releases page](https://github.com/dimdenGD/OldTwitter/releases/)
- Download `OldTwitterChrome.zip` if you're on Chromium based browsers and `OldTwitterFirefox.zip` if you're on Firefox

#### Chromium

- Unpack file anywhere
- Go to `chrome://extensions`
- Turn on Developer mode
- Press "Load unpacked" and select folder with extension  
  ![Install Chrome](https://lune.dimden.dev/ef1ac2f9ef.png)

#### Firefox

- Go to `about:debugging#/runtime/this-firefox`
- Press "Load Temporary Add-on" and select zip file you downloaded

**Installing this way on Firefox will remove it after closing browser. You need to use [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/) instead for permament installation (see below).**

#### Firefox Developer Edition

- Go to `about:config`
- Set `xpinstall.signatures.required` to `false`
- Go to `about:addons`
- Press "Install Add-on From File" and select zip file you downloaded

*This reportedly works with [Firefox Extended Support Release](https://www.mozilla.org/en-US/firefox/enterprise/) and [Nightly](https://www.mozilla.org/en-US/firefox/channel/desktop/) as well.*

## FAQ

#### Can you use this extension on Android?

Yes, you can use Kiwi Browser to install it from [Chrome Web Store](https://chrome.google.com/webstore/detail/old-twitter-layout-2022/jgejdcdoeeabklepnkdbglgccjpdgpmf) or Firefox Beta/Nightly to install it from [Addons For Firefox](https://addons.mozilla.org/en-US/firefox/addon/old-twitter-layout-2022/) ([follow these steps for Firefox](https://www.androidpolice.com/install-add-on-extension-mozilla-firefox-android/)). Once installed you can press on "Add to Home screen" button in Kiwi Browser to have it as standalone app.

#### Is this extension safe?

[The source code is available at GitHub](https://github.com/dimdenGD/OldTwitter) so you can check everything yourself. It never sends any of your personal info anywhere.

#### [insert thing] doesn't look like it was in 2015 Twitter!

Extension won't be pixel perfect copy of old Twitter. I just took general look and feel of it.

#### I installed extension and my timeline feels kinda unusual

You had algorithmical timeline enabled. By default OldTwitter turns on reverse chronological timeline, you can switch it back to algorithmical timeline in settings or using the switch on the right side.

#### How do I visit original Twitter client after installing extension?

You need to add `?newtwitter=true` to end of your current URL. There's also a "Open this page in new Twitter" button on all pages on bottom right.

#### Where are the extension settings?

Click on your profile picture on top-right and then Settings button.

#### I don't like 2015 design, can I have something more modern

There's a setting to use design from 2018.

## Hotkeys

You can disable all hotkeys in settings.

General hotkeys.  
`F` - focus search bar.  
`ALT+F` - unfocus search bar (only when search bar is focused).  
`N` - open new tweet modal.  
`ALT+N` - close new tweet modal.  
`ESC` - close any modal.  
`M` - open/close user menu (use TAB to navigate).  
`CTRL+ENTER` - send tweet (when typing reply/quote/new tweet).

Navigation hotkeys.  
`CTRL+ALT+O` - switch between old and new Twitter.  
`G+H` - Home  
`G+N` - Notifications  
`G+M` - Mentions  
`G+P` - Profile  
`G+L` - Likes  
`G+I` - Lists  
`G+M` - Messages  
`G+S` - Settings  
`G+B` - Bookmarks

Active tweet hotkeys. On bottom-right of tweet element there's blue dot showing tweet is active.  
`S` - move to next tweet.  
`W` - move to previous tweet.  
`L` - (un)favorite/like tweet.  
`B` - (un)bookmark tweet.  
`T` - (un)retweet tweet.  
`R` - open reply box.  
`Q` - open quote box.  
`C` - copy tweet image.  
`D` - download first tweet media.  
`SPACE` - open full image / pause or resume video.  
`ENTER` - open tweet in new tab.

These hotkeys work only when reply/quote box is opened.  
`ALT+R` - close reply box.  
`ALT+Q` - close quote box.

These will work when reply/quote/new tweet modal is focused.  
`ALT+M` - upload media.  
`ALT+F` - remove first uploaded media.

## Translations

[Help to translate this extension to your language.](https://github.com/dimdenGD/OldTwitter/tree/master/_locales#readme)

English - [dimden](https://dimden.dev/)  
Russian - [dimden](https://dimden.dev/)  
Ukrainian - [dimden](https://dimden.dev/)  
French - [Aurore C.](https://asuure.com/), [zdimension](https://twitter.com/zdimension_), [Pikatchoum](https://twitter.com/applitom45), [adriend](https://twitter.com/_adriend_)  
Portuguese (Brazil) - [kigidere](https://twitter.com/kigidere), [guko](https://twitter.com/gukodev), [prophamoon](https://twitter.com/prophamoony)  
Spanish - [rogerpb98](https://twitter.com/anbulansia), [gaelcoral](https://twitter.com/gaelcoral), [hue](https://twitter.com/huey1116), Beelzenef, [elderreka](https://twitter.com/elderreka)  
Greek - [VasilisTheChu](https://pikachu.systems/)  
Romanian - [Skyrina](https://skyrina.dev/), [AlexSem](https://twitter.com/AlexSem5399)  
Tagalog - [Eurasian](https://twitter.com/NotPROxV), [@conc1erge](https://twitter.com/conc1erge), [@cheesee_its](https://twitter.com/cheesee_its)  
Latvian - [sophie](https://sad.ovh/)  
Hebrew - "ugh", qqqq, [kriterin](https://twitter.com/kriterin)  
Nepali - [DimeDead](https://dimedead.neocities.org/)  
Dutch - Puka1611  
Japanese - [Chazuru](https://twitter.com/AIWMD), [Nyankodasu](https://twitter.com/Nyankodasu1234), [kamokakesu](https://twitter.com/kamokakesu)  
Korean - [Nyankodasu](https://twitter.com/Nyankodasu1234), [han_eirin](https://twitter.com/han_eirin), [Sch](https://me.shtelo.org)  
Turkish - [KayrabCebll](https://steamcommunity.com/id/KayrabCebll), [YordemEren](https://twitter.com/YordemEren)  
Italian - [krek](https://twitter.com/CactusInc420), [Francesco](https://twitter.com/FrancescoRosi27)  
Arabic - [Yours Truly,](https://twitter.com/schrotheneko)  
Thai - [0.21%BloodAlcohol](https://github.com/Silberweich)  
Polish - lele, [nomi](https://twitter.com/youmaynomi)  
Vietnamese - [btmxh](https://github.com/btmxh)  
Traditional Chinese - [Oliver Tzeng（曾嘉禾）](https://github.com/olivertzeng), [cirx1e](https://github.com/cirx1e)  
Simplified Chinese - [am1006](https://github.com/am1006), [CarimoWuling](https://twitter.com/carimowuling)  
Czech - Menal  
German - [basti564](https://twitter.com/basti564)  
Catalan - [elmees21](https://twitter.com/elmees21)  
Swedish - [actuallyaridan](https://twitter.com/actuallyaridan)  
Bulgarian - [Scarlett7447](https://twitter.com/Scarlett7447)  
Norwegian - [twistquest](https://twitter.com/twistquest)  
Indonesian - [lorizade](https://twitter.com/lorizade), [Feerse_](https://twitter.com/Feerse_), [DaGamerFiles](https://twitter.com/DaGamerFiles), [KuchingNeko](https://twitter.com/KuchingNeko)  
