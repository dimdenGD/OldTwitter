# OldTwitter (2022)
Chrome extension to return old Twitter layout from 2015.  
This extension doesn't add any CSS on top of original Twitter. It's fully original client making it much faster than alternatives.  
  
## Installation
**Chrome, Edge, Opera, Brave & Chromium browsers:** [Chrome Web Store](https://chrome.google.com/webstore/detail/old-twitter-layout-2022/jgejdcdoeeabklepnkdbglgccjpdgpmf)  
**Firefox:** [Addons For Firefox](https://addons.mozilla.org/en-US/firefox/addon/old-twitter-layout-2022/)  
  
## Screenshots  
![Profile](https://lune.dimden.dev/7b17cad5cd.png)  
![Profile 2](https://lune.dimden.dev/e073d858d4.png)  
![Profile dark mode](https://lune.dimden.dev/8e7afd71fe.png)  
![Tweet](https://lune.dimden.dev/2381fb0adb.png)  
![Notifications](https://lune.dimden.dev/079d8c046c.png)  
![Search](https://lune.dimden.dev/575b9d30f1.png)  
  
## Manual installation
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
![Install Firefox](https://lune.dimden.dev/f1bbe6dd0c.png)  
  
**Installing this way on Firefox will remove it after closing browser.**
  
## FAQ
#### Is this extension safe?
The code is open source (duh) so you can check everything yourself. It never sends any of your personal info anywhere.  

#### [insert thing] doesn't look like it was in 2015 Twitter!
Extension won't be pixel perfect copy of old Twitter. I just took general look and feel of it.

#### I installed extension and my timeline is feels kinda unusual
You had algorithmical timeline enabled. By default OldTwitter turns on chronological timeline. If you really want your stinky algo timeline back go to [extension settings](https://twitter.com/old/settings).  
*Fun fact: algo timeline is around 5 times slower than chronological one*  

#### How do I visit original Twitter client after installing extension?
Go to [mobile.twitter.com](https://mobile.twitter.com).

## Features
- Basically almost all of Twitter functionality is implemented
- Custom profile links supported
- You can also change custom profile link and it'll appear for other extension users (priority: oldtwitter color db -> twitter color db -> default color)
- Ability to change default link color and font, enable/disable Twemoji, disable stars (favorites) back to likes (hearts)
- Ability to show custom user link colors in timeline
- Dark mode support
- Easy download of videos and GIFs
- Lot of hotkeys
- Custom CSS support
  
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
  
Active tweet hotkeys. On bottom-right of tweet element there's blue dot showing tweet is active.  
`S` - move to next tweet.  
`W` - move to previous tweet.  
`L` - (un)favorite/like tweet.  
`T` - (un)retweet tweet.  
`R` - open reply box.  
`Q` - open quote box.  
`C` - copy tweet image.  
`D` - download tweet media.  
`SPACE` - open full image / pause or resume video.  
`ENTER` - open tweet in new tab.  
  
These hotkeys work only when reply/quote box is opened.  
`ALT+R` - close reply box.  
`ALT+Q` - close quote box.  
  
These will work when reply/quote/new tweet modal is focused.  
`ALT+M` - upload media.  
`ALT+F` - remove first uploaded media.   