# Libraries used in the extension
All libraries are built with Ubuntu 22.04.3 LTS, Node.js v20.9.0, Rollup v4.17.2

### DOMPurify
File: `libraries/purify.min.js`  
Repo: https://github.com/cure53/DOMPurify/tree/3fe78d7501103832166613bb1452985dd4674008  
Direct URL: https://raw.githubusercontent.com/cure53/DOMPurify/3fe78d7501103832166613bb1452985dd4674008/dist/purify.min.js  
  
### Coloris
File: `libraries/coloris.min.js`  
Repo: https://github.com/mdbassit/Coloris/tree/ec2e67f35425a9765c42e1f50e24b177996556b3  
Direct URL: https://raw.githubusercontent.com/mdbassit/Coloris/ec2e67f35425a9765c42e1f50e24b177996556b3/dist/coloris.min.js  
  
### Custom Elements Polyfill  
File: `libraries/custom-elements.min.js`  
Repo: https://github.com/webcomponents/polyfills/tree/651e207e1865e0ac959070faaf8d2f3bd7710d34/packages/custom-elements  
Direct URL: *No official build provided, need to build it yourself*  
Build notes: I only managed to build it using `gulp`  
  
### Emoji picker
File: `libraries/emojipicker.js`  
Repo: https://github.com/nolanlawson/emoji-picker-element/tree/1cd4b9da68a54fabebf301950c0f07457f79a99f  
Direct URL: *No official build provided, need to build it yourself*  
Build notes: Building using `npm run build` produces 2 files: `picker.js` and `database.js`. To bundle them into 1 file use Rollup: `rollup picker.js --file emojipicker.js --format iife -n EmojiPicker`  

### GIF.js
Files: `libraries/gif.js`, `libraries/gif.worker.js`  
Repo: https://github.com/jnordberg/gif.js/tree/92d27a02841339e202c75150dcf6fe5f4fa42ec5  
Direct URLs: https://raw.githubusercontent.com/jnordberg/gif.js/92d27a02841339e202c75150dcf6fe5f4fa42ec5/dist/gif.js, https://raw.githubusercontent.com/jnordberg/gif.js/92d27a02841339e202c75150dcf6fe5f4fa42ec5/dist/gif.worker.js  

### parse-css-color
File: `libraries/parseCssColor.js`  
Repo: https://github.com/noeldelgado/parse-css-color/tree/3b1825a4c65eed06dcbcfa9976d9053466b9f5f5  
Direct URL: *No official build provided, need to build it yourself*  
Build notes: Build using Rollup: `rollup -c rollup.config.js  --bundleConfigAsCjs`, use `dist/index.umd.js` file  

### Tiny.toast
File: `libraries/tinytoast.js`  
Repo: https://github.com/catdad/tiny.toast/tree/4ec659d3444cd33cc1b0a8b6acb82a5d333e512a  
Direct URL: https://www.kirilv.com/tiny.cdn/lib/toast/1.0.0/toast.min.js  

### Twemoji
File: `libraries/twemoji.min.js`  
Repo: https://github.com/jdecked/twemoji/releases/tag/v16.0.1
Direct URL: https://cdn.jsdelivr.net/npm/@twemoji/api@16.0.1/dist/twemoji.min.js

### twitter-text-js
File: `libraries/twitter-text.js`  
Repo: https://github.com/twitter/twitter-text/tree/30e2430d90cff3b46393ea54caf511441983c260/js  
Direct URL: *No official build provided, need to build it yourself*  
Build notes: Build using Rollup: `rollup -c rollup.config.js --bundleConfigAsCjs`  

### Viewer.js
File: `libraries/viewer.min.js`  
Repo: https://github.com/fengyuanchen/viewerjs/tree/cf6fb29a6bef0577cecad18a25770403c89a579d  
Direct URL: https://raw.githubusercontent.com/fengyuanchen/viewerjs/cf6fb29a6bef0577cecad18a25770403c89a579d/dist/viewer.min.js  