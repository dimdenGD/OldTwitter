var EmojiPicker = (function () {
    'use strict';
  
    function assertNonEmptyString (str) {
      if (typeof str !== 'string' || !str) {
        throw new Error('expected a non-empty string, got: ' + str)
      }
    }
  
    function assertNumber (number) {
      if (typeof number !== 'number') {
        throw new Error('expected a number, got: ' + number)
      }
    }
  
    const DB_VERSION_CURRENT = 1;
    const DB_VERSION_INITIAL = 1;
    const STORE_EMOJI = 'emoji';
    const STORE_KEYVALUE = 'keyvalue';
    const STORE_FAVORITES = 'favorites';
    const FIELD_TOKENS = 'tokens';
    const INDEX_TOKENS = 'tokens';
    const FIELD_UNICODE = 'unicode';
    const INDEX_COUNT = 'count';
    const FIELD_GROUP = 'group';
    const FIELD_ORDER = 'order';
    const INDEX_GROUP_AND_ORDER = 'group-order';
    const KEY_ETAG = 'eTag';
    const KEY_URL = 'url';
    const KEY_PREFERRED_SKINTONE = 'skinTone';
    const MODE_READONLY = 'readonly';
    const MODE_READWRITE = 'readwrite';
    const INDEX_SKIN_UNICODE = 'skinUnicodes';
    const FIELD_SKIN_UNICODE = 'skinUnicodes';
  
    const DEFAULT_DATA_SOURCE$1 = 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/en/emojibase/data.json';
    const DEFAULT_LOCALE$1 = 'en';
  
    // like lodash's uniqBy but much smaller
    function uniqBy$1 (arr, func) {
      const set = new Set();
      const res = [];
      for (const item of arr) {
        const key = func(item);
        if (!set.has(key)) {
          set.add(key);
          res.push(item);
        }
      }
      return res
    }
  
    function uniqEmoji (emojis) {
      return uniqBy$1(emojis, _ => _.unicode)
    }
  
    function initialMigration (db) {
      function createObjectStore (name, keyPath, indexes) {
        const store = keyPath
          ? db.createObjectStore(name, { keyPath })
          : db.createObjectStore(name);
        if (indexes) {
          for (const [indexName, [keyPath, multiEntry]] of Object.entries(indexes)) {
            store.createIndex(indexName, keyPath, { multiEntry });
          }
        }
        return store
      }
  
      createObjectStore(STORE_KEYVALUE);
      createObjectStore(STORE_EMOJI, /* keyPath */ FIELD_UNICODE, {
        [INDEX_TOKENS]: [FIELD_TOKENS, /* multiEntry */ true],
        [INDEX_GROUP_AND_ORDER]: [[FIELD_GROUP, FIELD_ORDER]],
        [INDEX_SKIN_UNICODE]: [FIELD_SKIN_UNICODE, /* multiEntry */ true]
      });
      createObjectStore(STORE_FAVORITES, undefined, {
        [INDEX_COUNT]: ['']
      });
    }
  
    const openIndexedDBRequests = {};
    const databaseCache = {};
    const onCloseListeners = {};
  
    function handleOpenOrDeleteReq (resolve, reject, req) {
      // These things are almost impossible to test with fakeIndexedDB sadly
      /* istanbul ignore next */
      req.onerror = () => reject(req.error);
      /* istanbul ignore next */
      req.onblocked = () => reject(new Error('IDB blocked'));
      req.onsuccess = () => resolve(req.result);
    }
  
    async function createDatabase (dbName) {
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName, DB_VERSION_CURRENT);
        openIndexedDBRequests[dbName] = req;
        req.onupgradeneeded = e => {
          // Technically there is only one version, so we don't need this `if` check
          // But if an old version of the JS is in another browser tab
          // and it gets upgraded in the future and we have a new DB version, well...
          // better safe than sorry.
          /* istanbul ignore else */
          if (e.oldVersion < DB_VERSION_INITIAL) {
            initialMigration(req.result);
          }
        };
        handleOpenOrDeleteReq(resolve, reject, req);
      });
      // Handle abnormal closes, e.g. "delete database" in chrome dev tools.
      // No need for removeEventListener, because once the DB can no longer
      // fire "close" events, it will auto-GC.
      // Unfortunately cannot test in fakeIndexedDB: https://github.com/dumbmatter/fakeIndexedDB/issues/50
      /* istanbul ignore next */
      db.onclose = () => closeDatabase(dbName);
      return db
    }
  
    function openDatabase (dbName) {
      if (!databaseCache[dbName]) {
        databaseCache[dbName] = createDatabase(dbName);
      }
      return databaseCache[dbName]
    }
  
    function dbPromise (db, storeName, readOnlyOrReadWrite, cb) {
      return new Promise((resolve, reject) => {
        // Use relaxed durability because neither the emoji data nor the favorites/preferred skin tone
        // are really irreplaceable data. IndexedDB is just a cache in this case.
        const txn = db.transaction(storeName, readOnlyOrReadWrite, { durability: 'relaxed' });
        const store = typeof storeName === 'string'
          ? txn.objectStore(storeName)
          : storeName.map(name => txn.objectStore(name));
        let res;
        cb(store, txn, (result) => {
          res = result;
        });
  
        txn.oncomplete = () => resolve(res);
        /* istanbul ignore next */
        txn.onerror = () => reject(txn.error);
      })
    }
  
    function closeDatabase (dbName) {
      // close any open requests
      const req = openIndexedDBRequests[dbName];
      const db = req && req.result;
      if (db) {
        db.close();
        const listeners = onCloseListeners[dbName];
        /* istanbul ignore else */
        if (listeners) {
          for (const listener of listeners) {
            listener();
          }
        }
      }
      delete openIndexedDBRequests[dbName];
      delete databaseCache[dbName];
      delete onCloseListeners[dbName];
    }
  
    function deleteDatabase (dbName) {
      return new Promise((resolve, reject) => {
        // close any open requests
        closeDatabase(dbName);
        const req = indexedDB.deleteDatabase(dbName);
        handleOpenOrDeleteReq(resolve, reject, req);
      })
    }
  
    // The "close" event occurs during an abnormal shutdown, e.g. a user clearing their browser data.
    // However, it doesn't occur with the normal "close" event, so we handle that separately.
    // https://www.w3.org/TR/IndexedDB/#close-a-database-connection
    function addOnCloseListener (dbName, listener) {
      let listeners = onCloseListeners[dbName];
      if (!listeners) {
        listeners = onCloseListeners[dbName] = [];
      }
      listeners.push(listener);
    }
  
    // list of emoticons that don't match a simple \W+ regex
    // extracted using:
    // require('emoji-picker-element-data/en/emojibase/data.json').map(_ => _.emoticon).filter(Boolean).filter(_ => !/^\W+$/.test(_))
    const irregularEmoticons = new Set([
      ':D', 'XD', ":'D", 'O:)',
      ':X', ':P', ';P', 'XP',
      ':L', ':Z', ':j', '8D',
      'XO', '8)', ':B', ':O',
      ':S', ":'o", 'Dx', 'X(',
      'D:', ':C', '>0)', ':3',
      '</3', '<3', '\\M/', ':E',
      '8#'
    ]);
  
    function extractTokens (str) {
      return str
        .split(/[\s_]+/)
        .map(word => {
          if (!word.match(/\w/) || irregularEmoticons.has(word)) {
            // for pure emoticons like :) or :-), just leave them as-is
            return word.toLowerCase()
          }
  
          return word
            .replace(/[)(:,]/g, '')
            .replace(/’/g, "'")
            .toLowerCase()
        }).filter(Boolean)
    }
  
    const MIN_SEARCH_TEXT_LENGTH$1 = 2;
  
    // This is an extra step in addition to extractTokens(). The difference here is that we expect
    // the input to have already been run through extractTokens(). This is useful for cases like
    // emoticons, where we don't want to do any tokenization (because it makes no sense to split up
    // ">:)" by the colon) but we do want to lowercase it to have consistent search results, so that
    // the user can type ':P' or ':p' and still get the same result.
    function normalizeTokens (str) {
      return str
        .filter(Boolean)
        .map(_ => _.toLowerCase())
        .filter(_ => _.length >= MIN_SEARCH_TEXT_LENGTH$1)
    }
  
    // Transform emoji data for storage in IDB
    function transformEmojiData (emojiData) {
      const res = emojiData.map(({ annotation, emoticon, group, order, shortcodes, skins, tags, emoji, version }) => {
        const tokens = [...new Set(
          normalizeTokens([
            ...(shortcodes || []).map(extractTokens).flat(),
            ...tags.map(extractTokens).flat(),
            ...extractTokens(annotation),
            emoticon
          ])
        )].sort();
        const res = {
          annotation,
          group,
          order,
          tags,
          tokens,
          unicode: emoji,
          version
        };
        if (emoticon) {
          res.emoticon = emoticon;
        }
        if (shortcodes) {
          res.shortcodes = shortcodes;
        }
        if (skins) {
          res.skinTones = [];
          res.skinUnicodes = [];
          res.skinVersions = [];
          for (const { tone, emoji, version } of skins) {
            res.skinTones.push(tone);
            res.skinUnicodes.push(emoji);
            res.skinVersions.push(version);
          }
        }
        return res
      });
      return res
    }
  
    // helper functions that help compress the code better
  
    function callStore (store, method, key, cb) {
      store[method](key).onsuccess = e => (cb && cb(e.target.result));
    }
  
    function getIDB (store, key, cb) {
      callStore(store, 'get', key, cb);
    }
  
    function getAllIDB (store, key, cb) {
      callStore(store, 'getAll', key, cb);
    }
  
    function commit (txn) {
      /* istanbul ignore else */
      if (txn.commit) {
        txn.commit();
      }
    }
  
    // like lodash's minBy
    function minBy (array, func) {
      let minItem = array[0];
      for (let i = 1; i < array.length; i++) {
        const item = array[i];
        if (func(minItem) > func(item)) {
          minItem = item;
        }
      }
      return minItem
    }
  
    // return an array of results representing all items that are found in each one of the arrays
    //
  
    function findCommonMembers (arrays, uniqByFunc) {
      const shortestArray = minBy(arrays, _ => _.length);
      const results = [];
      for (const item of shortestArray) {
        // if this item is included in every array in the intermediate results, add it to the final results
        if (!arrays.some(array => array.findIndex(_ => uniqByFunc(_) === uniqByFunc(item)) === -1)) {
          results.push(item);
        }
      }
      return results
    }
  
    async function isEmpty (db) {
      return !(await get(db, STORE_KEYVALUE, KEY_URL))
    }
  
    async function hasData (db, url, eTag) {
      const [oldETag, oldUrl] = await Promise.all([KEY_ETAG, KEY_URL]
        .map(key => get(db, STORE_KEYVALUE, key)));
      return (oldETag === eTag && oldUrl === url)
    }
  
    async function doFullDatabaseScanForSingleResult (db, predicate) {
      // This batching algorithm is just a perf improvement over a basic
      // cursor. The BATCH_SIZE is an estimate of what would give the best
      // perf for doing a full DB scan (worst case).
      //
      // Mini-benchmark for determining the best batch size:
      //
      // PERF=1 pnpm build:rollup && pnpm test:adhoc
      //
      // (async () => {
      //   performance.mark('start')
      //   await $('emoji-picker').database.getEmojiByShortcode('doesnotexist')
      //   performance.measure('total', 'start')
      //   console.log(performance.getEntriesByName('total').slice(-1)[0].duration)
      // })()
      const BATCH_SIZE = 50; // Typically around 150ms for 6x slowdown in Chrome for above benchmark
      return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, txn, cb) => {
        let lastKey;
  
        const processNextBatch = () => {
          emojiStore.getAll(lastKey && IDBKeyRange.lowerBound(lastKey, true), BATCH_SIZE).onsuccess = e => {
            const results = e.target.result;
            for (const result of results) {
              lastKey = result.unicode;
              if (predicate(result)) {
                return cb(result)
              }
            }
            if (results.length < BATCH_SIZE) {
              return cb()
            }
            processNextBatch();
          };
        };
        processNextBatch();
      })
    }
  
    async function loadData (db, emojiData, url, eTag) {
      try {
        const transformedData = transformEmojiData(emojiData);
        await dbPromise(db, [STORE_EMOJI, STORE_KEYVALUE], MODE_READWRITE, ([emojiStore, metaStore], txn) => {
          let oldETag;
          let oldUrl;
          let todo = 0;
  
          function checkFetched () {
            if (++todo === 2) { // 2 requests made
              onFetched();
            }
          }
  
          function onFetched () {
            if (oldETag === eTag && oldUrl === url) {
              // check again within the transaction to guard against concurrency, e.g. multiple browser tabs
              return
            }
            // delete old data
            emojiStore.clear();
            // insert new data
            for (const data of transformedData) {
              emojiStore.put(data);
            }
            metaStore.put(eTag, KEY_ETAG);
            metaStore.put(url, KEY_URL);
            commit(txn);
          }
  
          getIDB(metaStore, KEY_ETAG, result => {
            oldETag = result;
            checkFetched();
          });
  
          getIDB(metaStore, KEY_URL, result => {
            oldUrl = result;
            checkFetched();
          });
        });
      } finally {
      }
    }
  
    async function getEmojiByGroup (db, group) {
      return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, txn, cb) => {
        const range = IDBKeyRange.bound([group, 0], [group + 1, 0], false, true);
        getAllIDB(emojiStore.index(INDEX_GROUP_AND_ORDER), range, cb);
      })
    }
  
    async function getEmojiBySearchQuery (db, query) {
      const tokens = normalizeTokens(extractTokens(query));
  
      if (!tokens.length) {
        return []
      }
  
      return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, txn, cb) => {
        // get all results that contain all tokens (i.e. an AND query)
        const intermediateResults = [];
  
        const checkDone = () => {
          if (intermediateResults.length === tokens.length) {
            onDone();
          }
        };
  
        const onDone = () => {
          const results = findCommonMembers(intermediateResults, _ => _.unicode);
          cb(results.sort((a, b) => a.order < b.order ? -1 : 1));
        };
  
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          const range = i === tokens.length - 1
            ? IDBKeyRange.bound(token, token + '\uffff', false, true) // treat last token as a prefix search
            : IDBKeyRange.only(token); // treat all other tokens as an exact match
          getAllIDB(emojiStore.index(INDEX_TOKENS), range, result => {
            intermediateResults.push(result);
            checkDone();
          });
        }
      })
    }
  
    // This could have been implemented as an IDB index on shortcodes, but it seemed wasteful to do that
    // when we can already query by tokens and this will give us what we're looking for 99.9% of the time
    async function getEmojiByShortcode (db, shortcode) {
      const emojis = await getEmojiBySearchQuery(db, shortcode);
  
      // In very rare cases (e.g. the shortcode "v" as in "v for victory"), we cannot search because
      // there are no usable tokens (too short in this case). In that case, we have to do an inefficient
      // full-database scan, which I believe is an acceptable tradeoff for not having to have an extra
      // index on shortcodes.
  
      if (!emojis.length) {
        const predicate = _ => ((_.shortcodes || []).includes(shortcode.toLowerCase()));
        return (await doFullDatabaseScanForSingleResult(db, predicate)) || null
      }
  
      return emojis.filter(_ => {
        const lowerShortcodes = (_.shortcodes || []).map(_ => _.toLowerCase());
        return lowerShortcodes.includes(shortcode.toLowerCase())
      })[0] || null
    }
  
    async function getEmojiByUnicode (db, unicode) {
      return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, txn, cb) => (
        getIDB(emojiStore, unicode, result => {
          if (result) {
            return cb(result)
          }
          getIDB(emojiStore.index(INDEX_SKIN_UNICODE), unicode, result => cb(result || null));
        })
      ))
    }
  
    function get (db, storeName, key) {
      return dbPromise(db, storeName, MODE_READONLY, (store, txn, cb) => (
        getIDB(store, key, cb)
      ))
    }
  
    function set (db, storeName, key, value) {
      return dbPromise(db, storeName, MODE_READWRITE, (store, txn) => {
        store.put(value, key);
        commit(txn);
      })
    }
  
    function incrementFavoriteEmojiCount (db, unicode) {
      return dbPromise(db, STORE_FAVORITES, MODE_READWRITE, (store, txn) => (
        getIDB(store, unicode, result => {
          store.put((result || 0) + 1, unicode);
          commit(txn);
        })
      ))
    }
  
    function getTopFavoriteEmoji (db, customEmojiIndex, limit) {
      if (limit === 0) {
        return []
      }
      return dbPromise(db, [STORE_FAVORITES, STORE_EMOJI], MODE_READONLY, ([favoritesStore, emojiStore], txn, cb) => {
        const results = [];
        favoritesStore.index(INDEX_COUNT).openCursor(undefined, 'prev').onsuccess = e => {
          const cursor = e.target.result;
          if (!cursor) { // no more results
            return cb(results)
          }
  
          function addResult (result) {
            results.push(result);
            if (results.length === limit) {
              return cb(results) // done, reached the limit
            }
            cursor.continue();
          }
  
          const unicodeOrName = cursor.primaryKey;
          const custom = customEmojiIndex.byName(unicodeOrName);
          if (custom) {
            return addResult(custom)
          }
          // This could be done in parallel (i.e. make the cursor and the get()s parallelized),
          // but my testing suggests it's not actually faster.
          getIDB(emojiStore, unicodeOrName, emoji => {
            if (emoji) {
              return addResult(emoji)
            }
            // emoji not found somehow, ignore (may happen if custom emoji change)
            cursor.continue();
          });
        };
      })
    }
  
    // trie data structure for prefix searches
    // loosely based on https://github.com/nolanlawson/substring-trie
  
    const CODA_MARKER = ''; // marks the end of the string
  
    function trie (arr, itemToTokens) {
      const map = new Map();
      for (const item of arr) {
        const tokens = itemToTokens(item);
        for (const token of tokens) {
          let currentMap = map;
          for (let i = 0; i < token.length; i++) {
            const char = token.charAt(i);
            let nextMap = currentMap.get(char);
            if (!nextMap) {
              nextMap = new Map();
              currentMap.set(char, nextMap);
            }
            currentMap = nextMap;
          }
          let valuesAtCoda = currentMap.get(CODA_MARKER);
          if (!valuesAtCoda) {
            valuesAtCoda = [];
            currentMap.set(CODA_MARKER, valuesAtCoda);
          }
          valuesAtCoda.push(item);
        }
      }
  
      const search = (query, exact) => {
        let currentMap = map;
        for (let i = 0; i < query.length; i++) {
          const char = query.charAt(i);
          const nextMap = currentMap.get(char);
          if (nextMap) {
            currentMap = nextMap;
          } else {
            return []
          }
        }
  
        if (exact) {
          const results = currentMap.get(CODA_MARKER);
          return results || []
        }
  
        const results = [];
        // traverse
        const queue = [currentMap];
        while (queue.length) {
          const currentMap = queue.shift();
          const entriesSortedByKey = [...currentMap.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1);
          for (const [key, value] of entriesSortedByKey) {
            if (key === CODA_MARKER) { // CODA_MARKER always comes first; it's the empty string
              results.push(...value);
            } else {
              queue.push(value);
            }
          }
        }
        return results
      };
  
      return search
    }
  
    const requiredKeys$1 = [
      'name',
      'url'
    ];
  
    function assertCustomEmojis (customEmojis) {
      const isArray = customEmojis && Array.isArray(customEmojis);
      const firstItemIsFaulty = isArray &&
        customEmojis.length &&
        (!customEmojis[0] || requiredKeys$1.some(key => !(key in customEmojis[0])));
      if (!isArray || firstItemIsFaulty) {
        throw new Error('Custom emojis are in the wrong format')
      }
    }
  
    function customEmojiIndex (customEmojis) {
      assertCustomEmojis(customEmojis);
  
      const sortByName = (a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
  
      //
      // all()
      //
      const all = customEmojis.sort(sortByName);
  
      //
      // search()
      //
      const emojiToTokens = emoji => (
        [...new Set((emoji.shortcodes || []).map(shortcode => extractTokens(shortcode)).flat())]
      );
      const searchTrie = trie(customEmojis, emojiToTokens);
      const searchByExactMatch = _ => searchTrie(_, true);
      const searchByPrefix = _ => searchTrie(_, false);
  
      // Search by query for custom emoji. Similar to how we do this in IDB, the last token
      // is treated as a prefix search, but every other one is treated as an exact match.
      // Then we AND the results together
      const search = query => {
        const tokens = extractTokens(query);
        const intermediateResults = tokens.map((token, i) => (
          (i < tokens.length - 1 ? searchByExactMatch : searchByPrefix)(token)
        ));
        return findCommonMembers(intermediateResults, _ => _.name).sort(sortByName)
      };
  
      //
      // byShortcode, byName
      //
      const shortcodeToEmoji = new Map();
      const nameToEmoji = new Map();
      for (const customEmoji of customEmojis) {
        nameToEmoji.set(customEmoji.name.toLowerCase(), customEmoji);
        for (const shortcode of (customEmoji.shortcodes || [])) {
          shortcodeToEmoji.set(shortcode.toLowerCase(), customEmoji);
        }
      }
  
      const byShortcode = shortcode => shortcodeToEmoji.get(shortcode.toLowerCase());
      const byName = name => nameToEmoji.get(name.toLowerCase());
  
      return {
        all,
        search,
        byShortcode,
        byName
      }
    }
  
    const isFirefoxContentScript = typeof wrappedJSObject !== 'undefined';
  
    // remove some internal implementation details, i.e. the "tokens" array on the emoji object
    // essentially, convert the emoji from the version stored in IDB to the version used in-memory
    function cleanEmoji (emoji) {
      if (!emoji) {
        return emoji
      }
      // if inside a Firefox content script, need to clone the emoji object to prevent Firefox from complaining about
      // cross-origin object. See: https://github.com/nolanlawson/emoji-picker-element/issues/356
      /* istanbul ignore if */
      if (isFirefoxContentScript) {
        emoji = structuredClone(emoji);
      }
      delete emoji.tokens;
      if (emoji.skinTones) {
        const len = emoji.skinTones.length;
        emoji.skins = Array(len);
        for (let i = 0; i < len; i++) {
          emoji.skins[i] = {
            tone: emoji.skinTones[i],
            unicode: emoji.skinUnicodes[i],
            version: emoji.skinVersions[i]
          };
        }
        delete emoji.skinTones;
        delete emoji.skinUnicodes;
        delete emoji.skinVersions;
      }
      return emoji
    }
  
    function warnETag (eTag) {
      if (!eTag) {
        console.warn('emoji-picker-element is more efficient if the dataSource server exposes an ETag header.');
      }
    }
  
    const requiredKeys = [
      'annotation',
      'emoji',
      'group',
      'order',
      'tags',
      'version'
    ];
  
    function assertEmojiData (emojiData) {
      if (!emojiData ||
        !Array.isArray(emojiData) ||
        !emojiData[0] ||
        (typeof emojiData[0] !== 'object') ||
        requiredKeys.some(key => (!(key in emojiData[0])))) {
        throw new Error('Emoji data is in the wrong format')
      }
    }
  
    function assertStatus (response, dataSource) {
      if (Math.floor(response.status / 100) !== 2) {
        throw new Error('Failed to fetch: ' + dataSource + ':  ' + response.status)
      }
    }
  
    async function getETag (dataSource) {
      const response = await fetch(dataSource, { method: 'HEAD' });
      assertStatus(response, dataSource);
      const eTag = response.headers.get('etag');
      warnETag(eTag);
      return eTag
    }
  
    async function getETagAndData (dataSource) {
      const response = await fetch(dataSource);
      assertStatus(response, dataSource);
      const eTag = response.headers.get('etag');
      warnETag(eTag);
      const emojiData = await response.json();
      assertEmojiData(emojiData);
      return [eTag, emojiData]
    }
  
    // TODO: including these in blob-util.ts causes typedoc to generate docs for them,
    // even with --excludePrivate ¯\_(ツ)_/¯
    /** @private */
    /**
     * Convert an `ArrayBuffer` to a binary string.
     *
     * Example:
     *
     * ```js
     * var myString = blobUtil.arrayBufferToBinaryString(arrayBuff)
     * ```
     *
     * @param buffer - array buffer
     * @returns binary string
     */
    function arrayBufferToBinaryString(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var length = bytes.byteLength;
        var i = -1;
        while (++i < length) {
            binary += String.fromCharCode(bytes[i]);
        }
        return binary;
    }
    /**
     * Convert a binary string to an `ArrayBuffer`.
     *
     * ```js
     * var myBuffer = blobUtil.binaryStringToArrayBuffer(binaryString)
     * ```
     *
     * @param binary - binary string
     * @returns array buffer
     */
    function binaryStringToArrayBuffer(binary) {
        var length = binary.length;
        var buf = new ArrayBuffer(length);
        var arr = new Uint8Array(buf);
        var i = -1;
        while (++i < length) {
            arr[i] = binary.charCodeAt(i);
        }
        return buf;
    }
  
    // generate a checksum based on the stringified JSON
    async function jsonChecksum (object) {
      const inString = JSON.stringify(object);
      let inBuffer = binaryStringToArrayBuffer(inString);
  
      // this does not need to be cryptographically secure, SHA-1 is fine
      const outBuffer = await crypto.subtle.digest('SHA-1', inBuffer);
      const outBinString = arrayBufferToBinaryString(outBuffer);
      const res = btoa(outBinString);
      return res
    }
  
    async function checkForUpdates (db, dataSource) {
      // just do a simple HEAD request first to see if the eTags match
      let emojiData;
      let eTag = await getETag(dataSource);
      if (!eTag) { // work around lack of ETag/Access-Control-Expose-Headers
        const eTagAndData = await getETagAndData(dataSource);
        eTag = eTagAndData[0];
        emojiData = eTagAndData[1];
        if (!eTag) {
          eTag = await jsonChecksum(emojiData);
        }
      }
      if (await hasData(db, dataSource, eTag)) ; else {
        if (!emojiData) {
          const eTagAndData = await getETagAndData(dataSource);
          emojiData = eTagAndData[1];
        }
        await loadData(db, emojiData, dataSource, eTag);
      }
    }
  
    async function loadDataForFirstTime (db, dataSource) {
      let [eTag, emojiData] = await getETagAndData(dataSource);
      if (!eTag) {
        // Handle lack of support for ETag or Access-Control-Expose-Headers
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers#Browser_compatibility
        eTag = await jsonChecksum(emojiData);
      }
  
      await loadData(db, emojiData, dataSource, eTag);
    }
  
    class Database {
      constructor ({ dataSource = DEFAULT_DATA_SOURCE$1, locale = DEFAULT_LOCALE$1, customEmoji = [] } = {}) {
        this.dataSource = dataSource;
        this.locale = locale;
        this._dbName = `emoji-picker-element-${this.locale}`;
        this._db = undefined;
        this._lazyUpdate = undefined;
        this._custom = customEmojiIndex(customEmoji);
  
        this._clear = this._clear.bind(this);
        this._ready = this._init();
      }
  
      async _init () {
        const db = this._db = await openDatabase(this._dbName);
  
        addOnCloseListener(this._dbName, this._clear);
        const dataSource = this.dataSource;
        const empty = await isEmpty(db);
  
        if (empty) {
          await loadDataForFirstTime(db, dataSource);
        } else { // offline-first - do an update asynchronously
          this._lazyUpdate = checkForUpdates(db, dataSource);
        }
      }
  
      async ready () {
        const checkReady = async () => {
          if (!this._ready) {
            this._ready = this._init();
          }
          return this._ready
        };
        await checkReady();
        // There's a possibility of a race condition where the element gets added, removed, and then added again
        // with a particular timing, which would set the _db to undefined.
        // We *could* do a while loop here, but that seems excessive and could lead to an infinite loop.
        if (!this._db) {
          await checkReady();
        }
      }
  
      async getEmojiByGroup (group) {
        assertNumber(group);
        await this.ready();
        return uniqEmoji(await getEmojiByGroup(this._db, group)).map(cleanEmoji)
      }
  
      async getEmojiBySearchQuery (query) {
        assertNonEmptyString(query);
        await this.ready();
        const customs = this._custom.search(query);
        const natives = uniqEmoji(await getEmojiBySearchQuery(this._db, query)).map(cleanEmoji);
        return [
          ...customs,
          ...natives
        ]
      }
  
      async getEmojiByShortcode (shortcode) {
        assertNonEmptyString(shortcode);
        await this.ready();
        const custom = this._custom.byShortcode(shortcode);
        if (custom) {
          return custom
        }
        return cleanEmoji(await getEmojiByShortcode(this._db, shortcode))
      }
  
      async getEmojiByUnicodeOrName (unicodeOrName) {
        assertNonEmptyString(unicodeOrName);
        await this.ready();
        const custom = this._custom.byName(unicodeOrName);
        if (custom) {
          return custom
        }
        return cleanEmoji(await getEmojiByUnicode(this._db, unicodeOrName))
      }
  
      async getPreferredSkinTone () {
        await this.ready();
        return (await get(this._db, STORE_KEYVALUE, KEY_PREFERRED_SKINTONE)) || 0
      }
  
      async setPreferredSkinTone (skinTone) {
        assertNumber(skinTone);
        await this.ready();
        return set(this._db, STORE_KEYVALUE, KEY_PREFERRED_SKINTONE, skinTone)
      }
  
      async incrementFavoriteEmojiCount (unicodeOrName) {
        assertNonEmptyString(unicodeOrName);
        await this.ready();
        return incrementFavoriteEmojiCount(this._db, unicodeOrName)
      }
  
      async getTopFavoriteEmoji (limit) {
        assertNumber(limit);
        await this.ready();
        return (await getTopFavoriteEmoji(this._db, this._custom, limit)).map(cleanEmoji)
      }
  
      set customEmoji (customEmojis) {
        this._custom = customEmojiIndex(customEmojis);
      }
  
      get customEmoji () {
        return this._custom.all
      }
  
      async _shutdown () {
        await this.ready(); // reopen if we've already been closed/deleted
        try {
          await this._lazyUpdate; // allow any lazy updates to process before closing/deleting
        } catch (err) { /* ignore network errors (offline-first) */ }
      }
  
      // clear references to IDB, e.g. during a close event
      _clear () {
        // We don't need to call removeEventListener or remove the manual "close" listeners.
        // The memory leak tests prove this is unnecessary. It's because:
        // 1) IDBDatabases that can no longer fire "close" automatically have listeners GCed
        // 2) we clear the manual close listeners in databaseLifecycle.js.
        this._db = this._ready = this._lazyUpdate = undefined;
      }
  
      async close () {
        await this._shutdown();
        await closeDatabase(this._dbName);
      }
  
      async delete () {
        await this._shutdown();
        await deleteDatabase(this._dbName);
      }
    }
  
    // via https://unpkg.com/browse/emojibase-data@6.0.0/meta/groups.json
    const allGroups = [
      [-1, '✨', 'custom'],
      [0, '😀', 'smileys-emotion'],
      [1, '👋', 'people-body'],
      [3, '🐱', 'animals-nature'],
      [4, '🍎', 'food-drink'],
      [5, '🏠️', 'travel-places'],
      [6, '⚽', 'activities'],
      [7, '📝', 'objects'],
      [8, '⛔️', 'symbols'],
      [9, '🏁', 'flags']
    ].map(([id, emoji, name]) => ({ id, emoji, name }));
  
    const groups = allGroups.slice(1);
  
    const MIN_SEARCH_TEXT_LENGTH = 2;
    const NUM_SKIN_TONES = 6;
  
    /* istanbul ignore next */
    const rIC = typeof requestIdleCallback === 'function' ? requestIdleCallback : setTimeout;
  
    // check for ZWJ (zero width joiner) character
    function hasZwj (emoji) {
      return emoji.unicode.includes('\u200d')
    }
  
    // Find one good representative emoji from each version to test by checking its color.
    // Ideally it should have color in the center. For some inspiration, see:
    // https://about.gitlab.com/blog/2018/05/30/journey-in-native-unicode-emoji/
    //
    // Note that for certain versions (12.1, 13.1), there is no point in testing them explicitly, because
    // all the emoji from this version are compound-emoji from previous versions. So they would pass a color
    // test, even in browsers that display them as double emoji. (E.g. "face in clouds" might render as
    // "face without mouth" plus "fog".) These emoji can only be filtered using the width test,
    // which happens in checkZwjSupport.js.
    const versionsAndTestEmoji = {
      '🫨': 15.1, // shaking head, technically from v15 but see note above
      '🫠': 14,
      '🥲': 13.1, // smiling face with tear, technically from v13 but see note above
      '🥻': 12.1, // sari, technically from v12 but see note above
      '🥰': 11,
      '🤩': 5,
      '👱‍♀️': 4,
      '🤣': 3,
      '👁️‍🗨️': 2,
      '😀': 1,
      '😐️': 0.7,
      '😃': 0.6
    };
  
    const TIMEOUT_BEFORE_LOADING_MESSAGE = 1000; // 1 second
    const DEFAULT_SKIN_TONE_EMOJI = '🖐️';
    const DEFAULT_NUM_COLUMNS = 8;
  
    // Based on https://fivethirtyeight.com/features/the-100-most-used-emojis/ and
    // https://blog.emojipedia.org/facebook-reveals-most-and-least-used-emojis/ with
    // a bit of my own curation. (E.g. avoid the "OK" gesture because of connotations:
    // https://emojipedia.org/ok-hand/)
    const MOST_COMMONLY_USED_EMOJI = [
      '😊',
      '😒',
      '❤️',
      '👍️',
      '😍',
      '😂',
      '😭',
      '☺️',
      '😔',
      '😩',
      '😏',
      '💕',
      '🙌',
      '😘'
    ];
  
    // It's important to list Twemoji Mozilla before everything else, because Mozilla bundles their
    // own font on some platforms (notably Windows and Linux as of this writing). Typically, Mozilla
    // updates faster than the underlying OS, and we don't want to render older emoji in one font and
    // newer emoji in another font:
    // https://github.com/nolanlawson/emoji-picker-element/pull/268#issuecomment-1073347283
    const FONT_FAMILY = '"Twemoji Mozilla","Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol",' +
      '"Noto Color Emoji","EmojiOne Color","Android Emoji",sans-serif';
  
    /* istanbul ignore next */
    const DEFAULT_CATEGORY_SORTING = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  
    // Test if an emoji is supported by rendering it to canvas and checking that the color is not black
    // See https://about.gitlab.com/blog/2018/05/30/journey-in-native-unicode-emoji/
    // and https://www.npmjs.com/package/if-emoji for inspiration
    // This implementation is largely borrowed from if-emoji, adding the font-family
  
  
    const getTextFeature = (text, color) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
  
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = `100px ${FONT_FAMILY}`;
      ctx.fillStyle = color;
      ctx.scale(0.01, 0.01);
      ctx.fillText(text, 0, 0);
  
      return ctx.getImageData(0, 0, 1, 1).data
    };
  
    const compareFeatures = (feature1, feature2) => {
      const feature1Str = [...feature1].join(',');
      const feature2Str = [...feature2].join(',');
      // This is RGBA, so for 0,0,0, we are checking that the first RGB is not all zeroes.
      // Most of the time when unsupported this is 0,0,0,0, but on Chrome on Mac it is
      // 0,0,0,61 - there is a transparency here.
      return feature1Str === feature2Str && !feature1Str.startsWith('0,0,0,')
    };
  
    function testColorEmojiSupported (text) {
      // Render white and black and then compare them to each other and ensure they're the same
      // color, and neither one is black. This shows that the emoji was rendered in color.
      const feature1 = getTextFeature(text, '#000');
      const feature2 = getTextFeature(text, '#fff');
      return feature1 && feature2 && compareFeatures(feature1, feature2)
    }
  
    // rather than check every emoji ever, which would be expensive, just check some representatives from the
    // different emoji releases to determine what the font supports
  
    function determineEmojiSupportLevel () {
      const entries = Object.entries(versionsAndTestEmoji);
      try {
        // start with latest emoji and work backwards
        for (const [emoji, version] of entries) {
          if (testColorEmojiSupported(emoji)) {
            return version
          }
        }
      } catch (e) { // canvas error
      } finally {
      }
      // In case of an error, be generous and just assume all emoji are supported (e.g. for canvas errors
      // due to anti-fingerprinting add-ons). Better to show some gray boxes than nothing at all.
      return entries[0][1] // first one in the list is the most recent version
    }
  
    // Check which emojis we know for sure aren't supported, based on Unicode version level
    let promise;
    const detectEmojiSupportLevel = () => {
      if (!promise) {
        // Delay so it can run while the IDB database is being created by the browser (on another thread).
        // This helps especially with first load – we want to start pre-populating the database on the main thread,
        // and then wait for IDB to commit everything, and while waiting we run this check.
        promise = new Promise(resolve => (
          rIC(() => (
            resolve(determineEmojiSupportLevel()) // delay so ideally this can run while IDB is first populating
          ))
        ));
      }
      return promise
    };
    // determine which emojis containing ZWJ (zero width joiner) characters
    // are supported (rendered as one glyph) rather than unsupported (rendered as two or more glyphs)
    const supportedZwjEmojis = new Map();
  
    const VARIATION_SELECTOR = '\ufe0f';
    const SKINTONE_MODIFIER = '\ud83c';
    const ZWJ = '\u200d';
    const LIGHT_SKIN_TONE = 0x1F3FB;
    const LIGHT_SKIN_TONE_MODIFIER = 0xdffb;
  
    // TODO: this is a naive implementation, we can improve it later
    // It's only used for the skintone picker, so as long as people don't customize with
    // really exotic emoji then it should work fine
    function applySkinTone (str, skinTone) {
      if (skinTone === 0) {
        return str
      }
      const zwjIndex = str.indexOf(ZWJ);
      if (zwjIndex !== -1) {
        return str.substring(0, zwjIndex) +
          String.fromCodePoint(LIGHT_SKIN_TONE + skinTone - 1) +
          str.substring(zwjIndex)
      }
      if (str.endsWith(VARIATION_SELECTOR)) {
        str = str.substring(0, str.length - 1);
      }
      return str + SKINTONE_MODIFIER + String.fromCodePoint(LIGHT_SKIN_TONE_MODIFIER + skinTone - 1)
    }
  
    function halt (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  
    // Implementation left/right or up/down navigation, circling back when you
    // reach the start/end of the list
    function incrementOrDecrement (decrement, val, arr) {
      val += (decrement ? -1 : 1);
      if (val < 0) {
        val = arr.length - 1;
      } else if (val >= arr.length) {
        val = 0;
      }
      return val
    }
  
    // like lodash's uniqBy but much smaller
    function uniqBy (arr, func) {
      const set = new Set();
      const res = [];
      for (const item of arr) {
        const key = func(item);
        if (!set.has(key)) {
          set.add(key);
          res.push(item);
        }
      }
      return res
    }
  
    // We don't need all the data on every emoji, and there are specific things we need
    // for the UI, so build a "view model" from the emoji object we got from the database
  
    function summarizeEmojisForUI (emojis, emojiSupportLevel) {
      const toSimpleSkinsMap = skins => {
        const res = {};
        for (const skin of skins) {
          // ignore arrays like [1, 2] with multiple skin tones
          // also ignore variants that are in an unsupported emoji version
          // (these do exist - variants from a different version than their base emoji)
          if (typeof skin.tone === 'number' && skin.version <= emojiSupportLevel) {
            res[skin.tone] = skin.unicode;
          }
        }
        return res
      };
  
      return emojis.map(({ unicode, skins, shortcodes, url, name, category, annotation }) => ({
        unicode,
        name,
        shortcodes,
        url,
        category,
        annotation,
        id: unicode || name,
        skins: skins && toSimpleSkinsMap(skins)
      }))
    }
  
    // import rAF from one place so that the bundle size is a bit smaller
    const rAF = requestAnimationFrame;
  
    // Svelte action to calculate the width of an element and auto-update
    // using ResizeObserver. If ResizeObserver is unsupported, we just use rAF once
    // and don't bother to update.
  
  
    let resizeObserverSupported = typeof ResizeObserver === 'function';
  
    function calculateWidth (node, abortSignal, onUpdate) {
      let resizeObserver;
      if (resizeObserverSupported) {
        resizeObserver = new ResizeObserver(entries => (
          onUpdate(entries[0].contentRect.width)
        ));
        resizeObserver.observe(node);
      } else { // just set the width once, don't bother trying to track it
        rAF(() => (
          onUpdate(node.getBoundingClientRect().width)
        ));
      }
  
      // cleanup function (called on destroy)
      abortSignal.addEventListener('abort', () => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      });
    }
  
    // get the width of the text inside of a DOM node, via https://stackoverflow.com/a/59525891/680742
    function calculateTextWidth (node) {
      // skip running this in jest/vitest because we don't need to check for emoji support in that environment
      /* istanbul ignore else */
      {
        const range = document.createRange();
        range.selectNode(node.firstChild);
        return range.getBoundingClientRect().width
      }
    }
  
    let baselineEmojiWidth;
  
    function checkZwjSupport (zwjEmojisToCheck, baselineEmoji, emojiToDomNode) {
      for (const emoji of zwjEmojisToCheck) {
        const domNode = emojiToDomNode(emoji);
        const emojiWidth = calculateTextWidth(domNode);
        if (typeof baselineEmojiWidth === 'undefined') { // calculate the baseline emoji width only once
          baselineEmojiWidth = calculateTextWidth(baselineEmoji);
        }
        // On Windows, some supported emoji are ~50% bigger than the baseline emoji, but what we really want to guard
        // against are the ones that are 2x the size, because those are truly broken (person with red hair = person with
        // floating red wig, black cat = cat with black square, polar bear = bear with snowflake, etc.)
        // So here we set the threshold at 1.8 times the size of the baseline emoji.
        const supported = emojiWidth / 1.8 < baselineEmojiWidth;
        supportedZwjEmojis.set(emoji.unicode, supported);
      }
    }
  
    // like lodash's uniq
  
    function uniq (arr) {
      return uniqBy(arr, _ => _)
    }
  
    // Note we put this in its own function outside Picker.js to avoid Svelte doing an invalidation on the "setter" here.
    // At best the invalidation is useless, at worst it can cause infinite loops:
    // https://github.com/nolanlawson/emoji-picker-element/pull/180
    // https://github.com/sveltejs/svelte/issues/6521
    // Also note tabpanelElement can be null if the element is disconnected immediately after connected
    function resetScrollTopIfPossible (element) {
      /* istanbul ignore else */
      if (element) { // Makes me nervous not to have this `if` guard
        element.scrollTop = 0;
      }
    }
  
    function getFromMap (cache, key, func) {
      let cached = cache.get(key);
      if (!cached) {
        cached = func();
        cache.set(key, cached);
      }
      return cached
    }
  
    function toString (value) {
      return '' + value
    }
  
    function parseTemplate (htmlString) {
      const template = document.createElement('template');
      template.innerHTML = htmlString;
      return template
    }
  
    const parseCache = new WeakMap();
    const domInstancesCache = new WeakMap();
    // This needs to be a symbol because it needs to be different from any possible output of a key function
    const unkeyedSymbol = Symbol('un-keyed');
  
    // Not supported in Safari <=13
    const hasReplaceChildren = 'replaceChildren' in Element.prototype;
    function replaceChildren (parentNode, newChildren) {
      /* istanbul ignore else */
      if (hasReplaceChildren) {
        parentNode.replaceChildren(...newChildren);
      } else { // minimal polyfill for Element.prototype.replaceChildren
        parentNode.innerHTML = '';
        parentNode.append(...newChildren);
      }
    }
  
    function doChildrenNeedRerender (parentNode, newChildren) {
      let oldChild = parentNode.firstChild;
      let oldChildrenCount = 0;
      // iterate using firstChild/nextSibling because browsers use a linked list under the hood
      while (oldChild) {
        const newChild = newChildren[oldChildrenCount];
        // check if the old child and new child are the same
        if (newChild !== oldChild) {
          return true
        }
        oldChild = oldChild.nextSibling;
        oldChildrenCount++;
      }
      // if new children length is different from old, we must re-render
      return oldChildrenCount !== newChildren.length
    }
  
    function patchChildren (newChildren, instanceBinding) {
      const { targetNode } = instanceBinding;
      let { targetParentNode } = instanceBinding;
  
      let needsRerender = false;
  
      if (targetParentNode) { // already rendered once
        needsRerender = doChildrenNeedRerender(targetParentNode, newChildren);
      } else { // first render of list
        needsRerender = true;
        instanceBinding.targetNode = undefined; // placeholder node not needed anymore, free memory
        instanceBinding.targetParentNode = targetParentNode = targetNode.parentNode;
      }
      // avoid re-rendering list if the dom nodes are exactly the same before and after
      if (needsRerender) {
        replaceChildren(targetParentNode, newChildren);
      }
    }
  
    function patch (expressions, instanceBindings) {
      for (const instanceBinding of instanceBindings) {
        const {
          targetNode,
          currentExpression,
          binding: {
            expressionIndex,
            attributeName,
            attributeValuePre,
            attributeValuePost
          }
        } = instanceBinding;
  
        const expression = expressions[expressionIndex];
  
        if (currentExpression === expression) {
          // no need to update, same as before
          continue
        }
  
        instanceBinding.currentExpression = expression;
  
        if (attributeName) { // attribute replacement
          targetNode.setAttribute(attributeName, attributeValuePre + toString(expression) + attributeValuePost);
        } else { // text node / child element / children replacement
          let newNode;
          if (Array.isArray(expression)) { // array of DOM elements produced by tag template literals
            patchChildren(expression, instanceBinding);
          } else if (expression instanceof Element) { // html tag template returning a DOM element
            newNode = expression;
            targetNode.replaceWith(newNode);
          } else { // primitive - string, number, etc
            // nodeValue is faster than textContent supposedly https://www.youtube.com/watch?v=LY6y3HbDVmg
            // note we may be replacing the value in a placeholder text node
            targetNode.nodeValue = toString(expression);
          }
          if (newNode) {
            instanceBinding.targetNode = newNode;
          }
        }
      }
    }
  
    function parse (tokens) {
      let htmlString = '';
  
      let withinTag = false;
      let withinAttribute = false;
      let elementIndexCounter = -1; // depth-first traversal order
  
      const elementsToBindings = new Map();
      const elementIndexes = [];
  
      for (let i = 0, len = tokens.length; i < len; i++) {
        const token = tokens[i];
        htmlString += token;
  
        if (i === len - 1) {
          break // no need to process characters - no more expressions to be found
        }
  
        for (let j = 0; j < token.length; j++) {
          const char = token.charAt(j);
          switch (char) {
            case '<': {
              const nextChar = token.charAt(j + 1);
              if (nextChar === '/') { // closing tag
                // leaving an element
                elementIndexes.pop();
              } else { // not a closing tag
                withinTag = true;
                elementIndexes.push(++elementIndexCounter);
              }
              break
            }
            case '>': {
              withinTag = false;
              withinAttribute = false;
              break
            }
            case '=': {
              withinAttribute = true;
              break
            }
          }
        }
  
        const elementIndex = elementIndexes[elementIndexes.length - 1];
        const bindings = getFromMap(elementsToBindings, elementIndex, () => []);
  
        let attributeName;
        let attributeValuePre;
        let attributeValuePost;
        if (withinAttribute) {
          // I never use single-quotes for attribute values in HTML, so just support double-quotes or no-quotes
          const match = /(\S+)="?([^"=]*)$/.exec(token);
          attributeName = match[1];
          attributeValuePre = match[2];
          attributeValuePost = /^[^">]*/.exec(tokens[i + 1])[0];
        }
  
        const binding = {
          attributeName,
          attributeValuePre,
          attributeValuePost,
          expressionIndex: i
        };
  
        bindings.push(binding);
  
        if (!withinTag && !withinAttribute) {
          // Add a placeholder text node, so we can find it later. Note we only support one dynamic child text node
          htmlString += ' ';
        }
      }
  
      const template = parseTemplate(htmlString);
  
      return {
        template,
        elementsToBindings
      }
    }
  
    function traverseAndSetupBindings (dom, elementsToBindings) {
      const instanceBindings = [];
      // traverse dom
      const treeWalker = document.createTreeWalker(dom, NodeFilter.SHOW_ELEMENT);
  
      let element = dom;
      let elementIndex = -1;
      do {
        const bindings = elementsToBindings.get(++elementIndex);
        if (bindings) {
          for (let i = 0; i < bindings.length; i++) {
            const binding = bindings[i];
  
            const targetNode = binding.attributeName
              ? element // attribute binding, just use the element itself
              : element.firstChild; // not an attribute binding, so has a placeholder text node
  
            const instanceBinding = {
              binding,
              targetNode,
              targetParentNode: undefined,
              currentExpression: undefined
            };
  
            instanceBindings.push(instanceBinding);
          }
        }
      } while ((element = treeWalker.nextNode()))
  
      return instanceBindings
    }
  
    function parseHtml (tokens) {
      // All templates and bound expressions are unique per tokens array
      const { template, elementsToBindings } = getFromMap(parseCache, tokens, () => parse(tokens));
  
      // When we parseHtml, we always return a fresh DOM instance ready to be updated
      const dom = template.cloneNode(true).content.firstElementChild;
      const instanceBindings = traverseAndSetupBindings(dom, elementsToBindings);
  
      return function updateDomInstance (expressions) {
        patch(expressions, instanceBindings);
        return dom
      }
    }
  
    function createFramework (state) {
      const domInstances = getFromMap(domInstancesCache, state, () => new Map());
      let domInstanceCacheKey = unkeyedSymbol;
  
      function html (tokens, ...expressions) {
        // Each unique lexical usage of map() is considered unique due to the html`` tagged template call it makes,
        // which has lexically unique tokens. The unkeyed symbol is just used for html`` usage outside of a map().
        const domInstancesForTokens = getFromMap(domInstances, tokens, () => new Map());
        const updateDomInstance = getFromMap(domInstancesForTokens, domInstanceCacheKey, () => parseHtml(tokens));
  
        return updateDomInstance(expressions) // update with expressions
      }
  
      function map (array, callback, keyFunction) {
        return array.map((item, index) => {
          const originalCacheKey = domInstanceCacheKey;
          domInstanceCacheKey = keyFunction(item);
          try {
            return callback(item, index)
          } finally {
            domInstanceCacheKey = originalCacheKey;
          }
        })
      }
  
      return { map, html }
    }
  
    function render (container, state, helpers, events, actions, refs, abortSignal, firstRender) {
      const { labelWithSkin, titleForEmoji, unicodeWithSkin } = helpers;
      const { html, map } = createFramework(state);
  
      function emojiList (emojis, searchMode, prefix) {
        return map(emojis, (emoji, i) => {
          return html`<button role="${searchMode ? 'option' : 'menuitem'}" aria-selected="${state.searchMode ? i === state.activeSearchItem : ''}" aria-label="${labelWithSkin(emoji, state.currentSkinTone)}" title="${titleForEmoji(emoji)}" class="emoji ${searchMode && i === state.activeSearchItem ? 'active' : ''}" id="${`${prefix}-${emoji.id}`}">${
          emoji.unicode
            ? unicodeWithSkin(emoji, state.currentSkinTone)
            : html`<img class="custom-emoji" src="${emoji.url}" alt="" loading="lazy">`
        }</button>`
          // It's important for the cache key to be unique based on the prefix, because the framework caches based on the
          // unique tokens + cache key, and the same emoji may be used in the tab as well as in the fav bar
        }, emoji => `${prefix}-${emoji.id}`)
      }
  
      const section = () => {
        return html`<section data-ref="rootElement" class="picker" aria-label="${state.i18n.regionLabel}" style="${state.pickerStyle}"><div class="pad-top"></div><div class="search-row"><div class="search-wrapper"><input id="search" class="search" type="search" role="combobox" enterkeyhint="search" placeholder="${state.i18n.searchLabel}" autocapitalize="none" autocomplete="off" spellcheck="true" aria-expanded="${!!(state.searchMode && state.currentEmojis.length)}" aria-controls="search-results" aria-describedby="search-description" aria-autocomplete="list" aria-activedescendant="${state.activeSearchItemId ? `emo-${state.activeSearchItemId}` : ''}" data-ref="searchElement" data-on-input="onSearchInput" data-on-keydown="onSearchKeydown"><label class="sr-only" for="search">${state.i18n.searchLabel}</label> <span id="search-description" class="sr-only">${state.i18n.searchDescription}</span></div><div class="skintone-button-wrapper ${state.skinTonePickerExpandedAfterAnimation ? 'expanded' : ''}"><button id="skintone-button" class="emoji ${state.skinTonePickerExpanded ? 'hide-focus' : ''}" aria-label="${state.skinToneButtonLabel}" title="${state.skinToneButtonLabel}" aria-describedby="skintone-description" aria-haspopup="listbox" aria-expanded="${state.skinTonePickerExpanded}" aria-controls="skintone-list" data-on-click="onClickSkinToneButton">${state.skinToneButtonText}</button></div><span id="skintone-description" class="sr-only">${state.i18n.skinToneDescription}</span><div data-ref="skinToneDropdown" id="skintone-list" class="skintone-list hide-focus ${state.skinTonePickerExpanded ? '' : 'hidden no-animate'}" style="transform:translateY(${state.skinTonePickerExpanded ? 0 : 'calc(-1 * var(--num-skintones) * var(--total-emoji-size))'})" role="listbox" aria-label="${state.i18n.skinTonesLabel}" aria-activedescendant="skintone-${state.activeSkinTone}" aria-hidden="${!state.skinTonePickerExpanded}" tabIndex="-1" data-on-focusout="onSkinToneOptionsFocusOut" data-on-click="onSkinToneOptionsClick" data-on-keydown="onSkinToneOptionsKeydown" data-on-keyup="onSkinToneOptionsKeyup">${
      map(state.skinTones, (skinTone, i) => {
      return html`<div id="skintone-${i}" class="emoji ${i === state.activeSkinTone ? 'active' : ''}" aria-selected="${i === state.activeSkinTone}" role="option" title="${state.i18n.skinTones[i]}" aria-label="${state.i18n.skinTones[i]}">${skinTone}</div>`
      }, skinTone => skinTone)
          }</div></div><div class="nav" role="tablist" style="grid-template-columns:repeat(${state.groups.length},1fr)" aria-label="${state.i18n.categoriesLabel}" data-on-keydown="onNavKeydown" data-on-click="onNavClick">${
              map(state.groups, (group) => {
                return html`<button role="tab" class="nav-button" aria-controls="tab-${group.id}" aria-label="${state.i18n.categories[group.name]}" aria-selected="${!state.searchMode && state.currentGroup.id === group.id}" title="${state.i18n.categories[group.name]}" data-group-id="${group.id}"><div class="nav-emoji emoji">${group.emoji}</div></button>`
              }, group => group.id)
            }</div><div class="indicator-wrapper"><div class="indicator" style="transform:translateX(${(/* istanbul ignore next */ (state.isRtl ? -1 : 1)) * state.currentGroupIndex * 100}%)"></div></div><div class="message ${state.message ? '' : 'gone'}" role="alert" aria-live="polite">${state.message}</div><div data-ref="tabpanelElement" class="tabpanel ${(!state.databaseLoaded || state.message) ? 'gone' : ''}" role="${state.searchMode ? 'region' : 'tabpanel'}" aria-label="${state.searchMode ? state.i18n.searchResultsLabel : state.i18n.categories[state.currentGroup.name]}" id="${state.searchMode ? '' : `tab-${state.currentGroup.id}`}" tabIndex="0" data-on-click="onEmojiClick"><div data-action="calculateEmojiGridStyle">${
                map(state.currentEmojisWithCategories, (emojiWithCategory, i) => {
                  return html`<div><div id="menu-label-${i}" class="category ${state.currentEmojisWithCategories.length === 1 && state.currentEmojisWithCategories[0].category === '' ? 'gone' : ''}" aria-hidden="true">${
                    state.searchMode
                      ? state.i18n.searchResultsLabel
                      : (
                        emojiWithCategory.category
                          ? emojiWithCategory.category
                          : (
                            state.currentEmojisWithCategories.length > 1
                              ? state.i18n.categories.custom
                              : state.i18n.categories[state.currentGroup.name]
                          )
                      )
                  }</div><div class="emoji-menu" role="${state.searchMode ? 'listbox' : 'menu'}" aria-labelledby="menu-label-${i}" id="${state.searchMode ? 'search-results' : ''}">${
                emojiList(emojiWithCategory.emojis, state.searchMode, /* prefix */ 'emo')
              }</div></div>`
                }, emojiWithCategory => emojiWithCategory.category)
              }</div></div><div class="favorites emoji-menu ${state.message ? 'gone' : ''}" role="menu" aria-label="${state.i18n.favoritesLabel}" style="padding-inline-end:${`${state.scrollbarWidth}px`}" data-on-click="onEmojiClick">${
              emojiList(state.currentFavorites, /* searchMode */ false, /* prefix */ 'fav')
            }</div><button data-ref="baselineEmoji" aria-hidden="true" tabindex="-1" class="abs-pos hidden emoji baseline-emoji">😀</button></section>`
      };
  
      const rootDom = section();
  
      if (firstRender) { // not a re-render
        container.appendChild(rootDom);
  
        // we only bind events/refs/actions once - there is no need to find them again given this component structure
  
        // helper for traversing the dom, finding elements by an attribute, and getting the attribute value
        const forElementWithAttribute = (attributeName, callback) => {
          for (const element of container.querySelectorAll(`[${attributeName}]`)) {
            callback(element, element.getAttribute(attributeName));
          }
        };
  
        // bind events
        for (const eventName of ['click', 'focusout', 'input', 'keydown', 'keyup']) {
          forElementWithAttribute(`data-on-${eventName}`, (element, listenerName) => {
            element.addEventListener(eventName, events[listenerName]);
          });
        }
  
        // find refs
        forElementWithAttribute('data-ref', (element, ref) => {
          refs[ref] = element;
        });
  
        // set up actions
        forElementWithAttribute('data-action', (element, action) => {
          actions[action](element);
        });
  
        // destroy/abort logic
        abortSignal.addEventListener('abort', () => {
          container.removeChild(rootDom);
        });
      }
    }
  
    /* istanbul ignore next */
    const qM = typeof queueMicrotask === 'function' ? queueMicrotask : callback => Promise.resolve().then(callback);
  
    function createState (abortSignal) {
      let destroyed = false;
      let currentObserver;
  
      const propsToObservers = new Map();
      const dirtyObservers = new Set();
  
      let queued;
  
      const flush = () => {
        if (destroyed) {
          return
        }
        const observersToRun = [...dirtyObservers];
        dirtyObservers.clear(); // clear before running to force any new updates to run in another tick of the loop
        try {
          for (const observer of observersToRun) {
            observer();
          }
        } finally {
          queued = false;
          if (dirtyObservers.size) { // new updates, queue another one
            queued = true;
            qM(flush);
          }
        }
      };
  
      const state = new Proxy({}, {
        get (target, prop) {
          if (currentObserver) {
            let observers = propsToObservers.get(prop);
            if (!observers) {
              observers = new Set();
              propsToObservers.set(prop, observers);
            }
            observers.add(currentObserver);
          }
          return target[prop]
        },
        set (target, prop, newValue) {
          target[prop] = newValue;
          const observers = propsToObservers.get(prop);
          if (observers) {
            for (const observer of observers) {
              dirtyObservers.add(observer);
            }
            if (!queued) {
              queued = true;
              qM(flush);
            }
          }
          return true
        }
      });
  
      const createEffect = (callback) => {
        const runnable = () => {
          const oldObserver = currentObserver;
          currentObserver = runnable;
          try {
            return callback()
          } finally {
            currentObserver = oldObserver;
          }
        };
        return runnable()
      };
  
      // destroy logic
      abortSignal.addEventListener('abort', () => {
        destroyed = true;
      });
  
      return {
        state,
        createEffect
      }
    }
  
    // Compare two arrays, with a function called on each item in the two arrays that returns true if the items are equal
    function arraysAreEqualByFunction (left, right, areEqualFunc) {
      if (left.length !== right.length) {
        return false
      }
      for (let i = 0; i < left.length; i++) {
        if (!areEqualFunc(left[i], right[i])) {
          return false
        }
      }
      return true
    }
  
    /* eslint-disable prefer-const,no-labels,no-inner-declarations */
  
    // constants
    const EMPTY_ARRAY = [];
  
    const { assign } = Object;
  
    function createRoot (shadowRoot, props) {
      const refs = {};
      const abortController = new AbortController();
      const abortSignal = abortController.signal;
      const { state, createEffect } = createState(abortSignal);
  
      // initial state
      assign(state, {
        skinToneEmoji: undefined,
        i18n: undefined,
        database: undefined,
        customEmoji: undefined,
        customCategorySorting: undefined,
        emojiVersion: undefined
      });
  
      // public props
      assign(state, props);
  
      // private props
      assign(state, {
        initialLoad: true,
        currentEmojis: [],
        currentEmojisWithCategories: [],
        rawSearchText: '',
        searchText: '',
        searchMode: false,
        activeSearchItem: -1,
        message: undefined,
        skinTonePickerExpanded: false,
        skinTonePickerExpandedAfterAnimation: false,
        currentSkinTone: 0,
        activeSkinTone: 0,
        skinToneButtonText: undefined,
        pickerStyle: undefined,
        skinToneButtonLabel: '',
        skinTones: [],
        currentFavorites: [],
        defaultFavoriteEmojis: undefined,
        numColumns: DEFAULT_NUM_COLUMNS,
        isRtl: false,
        scrollbarWidth: 0,
        currentGroupIndex: 0,
        groups: groups,
        databaseLoaded: false,
        activeSearchItemId: undefined
      });
  
      //
      // Update the current group based on the currentGroupIndex
      //
      createEffect(() => {
        if (state.currentGroup !== state.groups[state.currentGroupIndex]) {
          state.currentGroup = state.groups[state.currentGroupIndex];
        }
      });
  
      //
      // Utils/helpers
      //
  
      const focus = id => {
        shadowRoot.getElementById(id).focus();
      };
  
      const emojiToDomNode = emoji => shadowRoot.getElementById(`emo-${emoji.id}`);
  
      // fire a custom event that crosses the shadow boundary
      const fireEvent = (name, detail) => {
        refs.rootElement.dispatchEvent(new CustomEvent(name, {
          detail,
          bubbles: true,
          composed: true
        }));
      };
  
      //
      // Comparison utils
      //
  
      const compareEmojiArrays = (a, b) => a.id === b.id;
  
      const compareCurrentEmojisWithCategories = (a, b) => {
        const { category: aCategory, emojis: aEmojis } = a;
        const { category: bCategory, emojis: bEmojis } = b;
  
        if (aCategory !== bCategory) {
          return false
        }
  
        return arraysAreEqualByFunction(aEmojis, bEmojis, compareEmojiArrays)
      };
  
      //
      // Update utils to avoid excessive re-renders
      //
  
      // avoid excessive re-renders by checking the value before setting
      const updateCurrentEmojis = (newEmojis) => {
        if (!arraysAreEqualByFunction(state.currentEmojis, newEmojis, compareEmojiArrays)) {
          state.currentEmojis = newEmojis;
        }
      };
  
      // avoid excessive re-renders
      const updateSearchMode = (newSearchMode) => {
        if (state.searchMode !== newSearchMode) {
          state.searchMode = newSearchMode;
        }
      };
  
      // avoid excessive re-renders
      const updateCurrentEmojisWithCategories = (newEmojisWithCategories) => {
        if (!arraysAreEqualByFunction(state.currentEmojisWithCategories, newEmojisWithCategories, compareCurrentEmojisWithCategories)) {
          state.currentEmojisWithCategories = newEmojisWithCategories;
        }
      };
  
      // Helpers used by PickerTemplate
  
      const unicodeWithSkin = (emoji, currentSkinTone) => (
        (currentSkinTone && emoji.skins && emoji.skins[currentSkinTone]) || emoji.unicode
      );
  
      const labelWithSkin = (emoji, currentSkinTone) => (
        uniq([
          (emoji.name || unicodeWithSkin(emoji, currentSkinTone)),
          emoji.annotation,
          ...(emoji.shortcodes || EMPTY_ARRAY)
        ].filter(Boolean)).join(', ')
      );
  
      const titleForEmoji = (emoji) => (
        emoji.annotation || (emoji.shortcodes || EMPTY_ARRAY).join(', ')
      );
  
      const helpers = {
        labelWithSkin, titleForEmoji, unicodeWithSkin
      };
      const events = {
        onClickSkinToneButton,
        onEmojiClick,
        onNavClick,
        onNavKeydown,
        onSearchKeydown,
        onSkinToneOptionsClick,
        onSkinToneOptionsFocusOut,
        onSkinToneOptionsKeydown,
        onSkinToneOptionsKeyup,
        onSearchInput
      };
      const actions = {
        calculateEmojiGridStyle
      };
  
      let firstRender = true;
      createEffect(() => {
        render(shadowRoot, state, helpers, events, actions, refs, abortSignal, firstRender);
        firstRender = false;
      });
  
      //
      // Determine the emoji support level (in requestIdleCallback)
      //
  
      // mount logic
      if (!state.emojiVersion) {
        detectEmojiSupportLevel().then(level => {
          // Can't actually test emoji support in Jest/Vitest/JSDom, emoji never render in color in Cairo
          /* istanbul ignore next */
          if (!level) {
            state.message = state.i18n.emojiUnsupportedMessage;
          }
        });
      }
  
      //
      // Set or update the database object
      //
  
      createEffect(() => {
        // show a Loading message if it takes a long time, or show an error if there's a network/IDB error
        async function handleDatabaseLoading () {
          let showingLoadingMessage = false;
          const timeoutHandle = setTimeout(() => {
            showingLoadingMessage = true;
            state.message = state.i18n.loadingMessage;
          }, TIMEOUT_BEFORE_LOADING_MESSAGE);
          try {
            await state.database.ready();
            state.databaseLoaded = true; // eslint-disable-line no-unused-vars
          } catch (err) {
            console.error(err);
            state.message = state.i18n.networkErrorMessage;
          } finally {
            clearTimeout(timeoutHandle);
            if (showingLoadingMessage) { // Seems safer than checking the i18n string, which may change
              showingLoadingMessage = false;
              state.message = ''; // eslint-disable-line no-unused-vars
            }
          }
        }
  
        if (state.database) {
          /* no await */
          handleDatabaseLoading();
        }
      });
  
      //
      // Global styles for the entire picker
      //
  
      createEffect(() => {
        state.pickerStyle = `
        --num-groups: ${state.groups.length}; 
        --indicator-opacity: ${state.searchMode ? 0 : 1}; 
        --num-skintones: ${NUM_SKIN_TONES};`;
      });
  
      //
      // Set or update the customEmoji
      //
  
      createEffect(() => {
        if (state.customEmoji && state.database) {
          updateCustomEmoji(); // re-run whenever customEmoji change
        }
      });
  
      createEffect(() => {
        if (state.customEmoji && state.customEmoji.length) {
          if (state.groups !== allGroups) { // don't update unnecessarily
            state.groups = allGroups;
          }
        } else if (state.groups !== groups) {
          if (state.currentGroupIndex) {
            // If the current group is anything other than "custom" (which is first), decrement.
            // This fixes the odd case where you set customEmoji, then pick a category, then unset customEmoji
            state.currentGroupIndex--;
          }
          state.groups = groups;
        }
      });
  
      //
      // Set or update the preferred skin tone
      //
  
      createEffect(() => {
        async function updatePreferredSkinTone () {
          if (state.databaseLoaded) {
            state.currentSkinTone = await state.database.getPreferredSkinTone();
          }
        }
  
        /* no await */ updatePreferredSkinTone();
      });
  
      createEffect(() => {
        state.skinTones = Array(NUM_SKIN_TONES).fill().map((_, i) => applySkinTone(state.skinToneEmoji, i));
      });
  
      createEffect(() => {
        state.skinToneButtonText = state.skinTones[state.currentSkinTone];
      });
  
      createEffect(() => {
        state.skinToneButtonLabel = state.i18n.skinToneLabel.replace('{skinTone}', state.i18n.skinTones[state.currentSkinTone]);
      });
  
      //
      // Set or update the favorites emojis
      //
  
      createEffect(() => {
        async function updateDefaultFavoriteEmojis () {
          const { database } = state;
          const favs = (await Promise.all(MOST_COMMONLY_USED_EMOJI.map(unicode => (
            database.getEmojiByUnicodeOrName(unicode)
          )))).filter(Boolean); // filter because in Jest/Vitest tests we don't have all the emoji in the DB
          state.defaultFavoriteEmojis = favs;
        }
  
        if (state.databaseLoaded) {
          /* no await */ updateDefaultFavoriteEmojis();
        }
      });
  
      function updateCustomEmoji () {
        // Certain effects have an implicit dependency on customEmoji since it affects the database
        // Getting it here on the state ensures this effect re-runs when customEmoji change.
        // Setting it on the database is pointless but prevents this code from being removed by a minifier.
        state.database.customEmoji = state.customEmoji || EMPTY_ARRAY;
      }
  
      createEffect(() => {
        async function updateFavorites () {
          updateCustomEmoji(); // re-run whenever customEmoji change
          const { database, defaultFavoriteEmojis, numColumns } = state;
          const dbFavorites = await database.getTopFavoriteEmoji(numColumns);
          const favorites = await summarizeEmojis(uniqBy([
            ...dbFavorites,
            ...defaultFavoriteEmojis
          ], _ => (_.unicode || _.name)).slice(0, numColumns));
          state.currentFavorites = favorites;
        }
  
        if (state.databaseLoaded && state.defaultFavoriteEmojis) {
          /* no await */ updateFavorites();
        }
      });
  
      //
      // Calculate the width of the emoji grid. This serves two purposes:
      // 1) Re-calculate the --num-columns var because it may have changed
      // 2) Re-calculate the scrollbar width because it may have changed
      //   (i.e. because the number of items changed)
      // 3) Re-calculate whether we're in RTL mode or not.
      //
      // The benefit of doing this in one place is to align with rAF/ResizeObserver
      // and do all the calculations in one go. RTL vs LTR is not strictly width-related,
      // but since we're already reading the style here, and since it's already aligned with
      // the rAF loop, this is the most appropriate place to do it perf-wise.
      //
  
      function calculateEmojiGridStyle (node) {
        calculateWidth(node, abortSignal, width => {
          /* istanbul ignore next */
          { // jsdom throws errors for this kind of fancy stuff
            // read all the style/layout calculations we need to make
            const style = getComputedStyle(refs.rootElement);
            const newNumColumns = parseInt(style.getPropertyValue('--num-columns'), 10);
            const newIsRtl = style.getPropertyValue('direction') === 'rtl';
            const parentWidth = node.parentElement.getBoundingClientRect().width;
            const newScrollbarWidth = parentWidth - width;
  
            // write to state variables
            state.numColumns = newNumColumns;
            state.scrollbarWidth = newScrollbarWidth; // eslint-disable-line no-unused-vars
            state.isRtl = newIsRtl; // eslint-disable-line no-unused-vars
          }
        });
      }
  
      //
      // Set or update the currentEmojis. Check for invalid ZWJ renderings
      // (i.e. double emoji).
      //
  
      createEffect(() => {
        async function updateEmojis () {
          const { searchText, currentGroup, databaseLoaded, customEmoji } = state;
          if (!databaseLoaded) {
            state.currentEmojis = [];
            state.searchMode = false;
          } else if (searchText.length >= MIN_SEARCH_TEXT_LENGTH) {
            const newEmojis = await getEmojisBySearchQuery(searchText);
            if (state.searchText === searchText) { // if the situation changes asynchronously, do not update
              updateCurrentEmojis(newEmojis);
              updateSearchMode(true);
            }
          } else { // database is loaded and we're not in search mode, so we're in normal category mode
            const { id: currentGroupId } = currentGroup;
            // avoid race condition where currentGroupId is -1 and customEmoji is undefined/empty
            if (currentGroupId !== -1 || (customEmoji && customEmoji.length)) {
              const newEmojis = await getEmojisByGroup(currentGroupId);
              if (state.currentGroup.id === currentGroupId) { // if the situation changes asynchronously, do not update
                updateCurrentEmojis(newEmojis);
                updateSearchMode(false);
              }
            }
          }
        }
  
        /* no await */ updateEmojis();
      });
  
      // Some emojis have their ligatures rendered as two or more consecutive emojis
      // We want to treat these the same as unsupported emojis, so we compare their
      // widths against the baseline widths and remove them as necessary
      createEffect(() => {
        const { currentEmojis, emojiVersion } = state;
        const zwjEmojisToCheck = currentEmojis
          .filter(emoji => emoji.unicode) // filter custom emoji
          .filter(emoji => hasZwj(emoji) && !supportedZwjEmojis.has(emoji.unicode));
        if (!emojiVersion && zwjEmojisToCheck.length) {
          // render now, check their length later
          updateCurrentEmojis(currentEmojis);
          rAF(() => checkZwjSupportAndUpdate(zwjEmojisToCheck));
        } else {
          const newEmojis = emojiVersion ? currentEmojis : currentEmojis.filter(isZwjSupported);
          updateCurrentEmojis(newEmojis);
          // Reset scroll top to 0 when emojis change
          rAF(() => resetScrollTopIfPossible(refs.tabpanelElement));
        }
      });
  
      function checkZwjSupportAndUpdate (zwjEmojisToCheck) {
        checkZwjSupport(zwjEmojisToCheck, refs.baselineEmoji, emojiToDomNode);
        // force update
        // eslint-disable-next-line no-self-assign
        state.currentEmojis = state.currentEmojis;
      }
  
      function isZwjSupported (emoji) {
        return !emoji.unicode || !hasZwj(emoji) || supportedZwjEmojis.get(emoji.unicode)
      }
  
      async function filterEmojisByVersion (emojis) {
        const emojiSupportLevel = state.emojiVersion || await detectEmojiSupportLevel();
        // !version corresponds to custom emoji
        return emojis.filter(({ version }) => !version || version <= emojiSupportLevel)
      }
  
      async function summarizeEmojis (emojis) {
        return summarizeEmojisForUI(emojis, state.emojiVersion || await detectEmojiSupportLevel())
      }
  
      async function getEmojisByGroup (group) {
        // -1 is custom emoji
        const emoji = group === -1 ? state.customEmoji : await state.database.getEmojiByGroup(group);
        return summarizeEmojis(await filterEmojisByVersion(emoji))
      }
  
      async function getEmojisBySearchQuery (query) {
        return summarizeEmojis(await filterEmojisByVersion(await state.database.getEmojiBySearchQuery(query)))
      }
  
      createEffect(() => {
      });
  
      //
      // Derive currentEmojisWithCategories from currentEmojis. This is always done even if there
      // are no categories, because it's just easier to code the HTML this way.
      //
  
      createEffect(() => {
        function calculateCurrentEmojisWithCategories () {
          const { searchMode, currentEmojis } = state;
          if (searchMode) {
            return [
              {
                category: '',
                emojis: currentEmojis
              }
            ]
          }
          const categoriesToEmoji = new Map();
          for (const emoji of currentEmojis) {
            const category = emoji.category || '';
            let emojis = categoriesToEmoji.get(category);
            if (!emojis) {
              emojis = [];
              categoriesToEmoji.set(category, emojis);
            }
            emojis.push(emoji);
          }
          return [...categoriesToEmoji.entries()]
            .map(([category, emojis]) => ({ category, emojis }))
            .sort((a, b) => state.customCategorySorting(a.category, b.category))
        }
  
        const newEmojisWithCategories = calculateCurrentEmojisWithCategories();
        updateCurrentEmojisWithCategories(newEmojisWithCategories);
      });
  
      //
      // Handle active search item (i.e. pressing up or down while searching)
      //
  
      createEffect(() => {
        state.activeSearchItemId = state.activeSearchItem !== -1 && state.currentEmojis[state.activeSearchItem].id;
      });
  
      //
      // Handle user input on the search input
      //
  
      createEffect(() => {
        const { rawSearchText } = state;
        rIC(() => {
          state.searchText = (rawSearchText || '').trim(); // defer to avoid input delays, plus we can trim here
          state.activeSearchItem = -1;
        });
      });
  
      function onSearchKeydown (event) {
        if (!state.searchMode || !state.currentEmojis.length) {
          return
        }
  
        const goToNextOrPrevious = (previous) => {
          halt(event);
          state.activeSearchItem = incrementOrDecrement(previous, state.activeSearchItem, state.currentEmojis);
        };
  
        switch (event.key) {
          case 'ArrowDown':
            return goToNextOrPrevious(false)
          case 'ArrowUp':
            return goToNextOrPrevious(true)
          case 'Enter':
            if (state.activeSearchItem === -1) {
              // focus the first option in the list since the list must be non-empty at this point (it's verified above)
              state.activeSearchItem = 0;
            } else { // there is already an active search item
              halt(event);
              return clickEmoji(state.currentEmojis[state.activeSearchItem].id)
            }
        }
      }
  
      //
      // Handle user input on nav
      //
  
      function onNavClick (event) {
        const { target } = event;
        const closestTarget = target.closest('.nav-button');
        /* istanbul ignore if */
        if (!closestTarget) {
          return // This should never happen, but makes me nervous not to have it
        }
        const groupId = parseInt(closestTarget.dataset.groupId, 10);
        refs.searchElement.value = ''; // clear search box input
        state.rawSearchText = '';
        state.searchText = '';
        state.activeSearchItem = -1;
        state.currentGroupIndex = state.groups.findIndex(_ => _.id === groupId);
      }
  
      function onNavKeydown (event) {
        const { target, key } = event;
  
        const doFocus = el => {
          if (el) {
            halt(event);
            el.focus();
          }
        };
  
        switch (key) {
          case 'ArrowLeft':
            return doFocus(target.previousElementSibling)
          case 'ArrowRight':
            return doFocus(target.nextElementSibling)
          case 'Home':
            return doFocus(target.parentElement.firstElementChild)
          case 'End':
            return doFocus(target.parentElement.lastElementChild)
        }
      }
  
      //
      // Handle user input on an emoji
      //
  
      async function clickEmoji (unicodeOrName) {
        const emoji = await state.database.getEmojiByUnicodeOrName(unicodeOrName);
        const emojiSummary = [...state.currentEmojis, ...state.currentFavorites]
          .find(_ => (_.id === unicodeOrName));
        const skinTonedUnicode = emojiSummary.unicode && unicodeWithSkin(emojiSummary, state.currentSkinTone);
        await state.database.incrementFavoriteEmojiCount(unicodeOrName);
        fireEvent('emoji-click', {
          emoji,
          skinTone: state.currentSkinTone,
          ...(skinTonedUnicode && { unicode: skinTonedUnicode }),
          ...(emojiSummary.name && { name: emojiSummary.name })
        });
      }
  
      async function onEmojiClick (event) {
        const { target } = event;
        /* istanbul ignore if */
        if (!target.classList.contains('emoji')) {
          // This should never happen, but makes me nervous not to have it
          return
        }
        halt(event);
        const id = target.id.substring(4); // replace 'emo-' or 'fav-' prefix
  
        /* no await */ clickEmoji(id);
      }
  
      //
      // Handle user input on the skintone picker
      //
  
      function changeSkinTone (skinTone) {
        state.currentSkinTone = skinTone;
        state.skinTonePickerExpanded = false;
        focus('skintone-button');
        fireEvent('skin-tone-change', { skinTone });
        /* no await */ state.database.setPreferredSkinTone(skinTone);
      }
  
      function onSkinToneOptionsClick (event) {
        const { target: { id } } = event;
        const match = id && id.match(/^skintone-(\d)/); // skintone option format
        /* istanbul ignore if */
        if (!match) { // not a skintone option
          return // This should never happen, but makes me nervous not to have it
        }
        halt(event);
        const skinTone = parseInt(match[1], 10); // remove 'skintone-' prefix
        changeSkinTone(skinTone);
      }
  
      function onClickSkinToneButton (event) {
        state.skinTonePickerExpanded = !state.skinTonePickerExpanded;
        state.activeSkinTone = state.currentSkinTone;
        // this should always be true, since the button is obscured by the listbox, so this `if` is just to be sure
        if (state.skinTonePickerExpanded) {
          halt(event);
          rAF(() => focus('skintone-list'));
        }
      }
  
      // To make the animation nicer, change the z-index of the skintone picker button
      // *after* the animation has played. This makes it appear that the picker box
      // is expanding "below" the button
      createEffect(() => {
        if (state.skinTonePickerExpanded) {
          refs.skinToneDropdown.addEventListener('transitionend', () => {
            state.skinTonePickerExpandedAfterAnimation = true; // eslint-disable-line no-unused-vars
          }, { once: true });
        } else {
          state.skinTonePickerExpandedAfterAnimation = false; // eslint-disable-line no-unused-vars
        }
      });
  
      function onSkinToneOptionsKeydown (event) {
        // this should never happen, but makes me nervous not to have it
        /* istanbul ignore if */
        if (!state.skinTonePickerExpanded) {
          return
        }
        const changeActiveSkinTone = async nextSkinTone => {
          halt(event);
          state.activeSkinTone = nextSkinTone;
        };
  
        switch (event.key) {
          case 'ArrowUp':
            return changeActiveSkinTone(incrementOrDecrement(true, state.activeSkinTone, state.skinTones))
          case 'ArrowDown':
            return changeActiveSkinTone(incrementOrDecrement(false, state.activeSkinTone, state.skinTones))
          case 'Home':
            return changeActiveSkinTone(0)
          case 'End':
            return changeActiveSkinTone(state.skinTones.length - 1)
          case 'Enter':
            // enter on keydown, space on keyup. this is just how browsers work for buttons
            // https://lists.w3.org/Archives/Public/w3c-wai-ig/2019JanMar/0086.html
            halt(event);
            return changeSkinTone(state.activeSkinTone)
          case 'Escape':
            halt(event);
            state.skinTonePickerExpanded = false;
            return focus('skintone-button')
        }
      }
  
      function onSkinToneOptionsKeyup (event) {
        // this should never happen, but makes me nervous not to have it
        /* istanbul ignore if */
        if (!state.skinTonePickerExpanded) {
          return
        }
        switch (event.key) {
          case ' ':
            // enter on keydown, space on keyup. this is just how browsers work for buttons
            // https://lists.w3.org/Archives/Public/w3c-wai-ig/2019JanMar/0086.html
            halt(event);
            return changeSkinTone(state.activeSkinTone)
        }
      }
  
      async function onSkinToneOptionsFocusOut (event) {
        // On blur outside of the skintone listbox, collapse the skintone picker.
        const { relatedTarget } = event;
        // The `else` should never happen, but makes me nervous not to have it
        /* istanbul ignore else */
        if (!relatedTarget || relatedTarget.id !== 'skintone-list') {
          state.skinTonePickerExpanded = false;
        }
      }
  
      function onSearchInput (event) {
        state.rawSearchText = event.target.value;
      }
  
      return {
        $set (newState) {
          assign(state, newState);
        },
        $destroy () {
          abortController.abort();
        }
      }
    }
  
    const DEFAULT_DATA_SOURCE = 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/en/emojibase/data.json';
    const DEFAULT_LOCALE = 'en';
  
    var enI18n = {
      categoriesLabel: 'Categories',
      emojiUnsupportedMessage: 'Your browser does not support color emoji.',
      favoritesLabel: 'Favorites',
      loadingMessage: 'Loading…',
      networkErrorMessage: 'Could not load emoji.',
      regionLabel: 'Emoji picker',
      searchDescription: 'When search results are available, press up or down to select and enter to choose.',
      searchLabel: 'Search',
      searchResultsLabel: 'Search results',
      skinToneDescription: 'When expanded, press up or down to select and enter to choose.',
      skinToneLabel: 'Choose a skin tone (currently {skinTone})',
      skinTonesLabel: 'Skin tones',
      skinTones: [
        'Default',
        'Light',
        'Medium-Light',
        'Medium',
        'Medium-Dark',
        'Dark'
      ],
      categories: {
        custom: 'Custom',
        'smileys-emotion': 'Smileys and emoticons',
        'people-body': 'People and body',
        'animals-nature': 'Animals and nature',
        'food-drink': 'Food and drink',
        'travel-places': 'Travel and places',
        activities: 'Activities',
        objects: 'Objects',
        symbols: 'Symbols',
        flags: 'Flags'
      }
    };
  
    var baseStyles = ":host{--emoji-size:1.375rem;--emoji-padding:0.5rem;--category-emoji-size:var(--emoji-size);--category-emoji-padding:var(--emoji-padding);--indicator-height:3px;--input-border-radius:0.5rem;--input-border-size:1px;--input-font-size:1rem;--input-line-height:1.5;--input-padding:0.25rem;--num-columns:8;--outline-size:2px;--border-size:1px;--skintone-border-radius:1rem;--category-font-size:1rem;display:flex;width:min-content;height:400px}:host,:host(.light){color-scheme:light;--background:#fff;--border-color:#e0e0e0;--indicator-color:#385ac1;--input-border-color:#999;--input-font-color:#111;--input-placeholder-color:#999;--outline-color:#999;--category-font-color:#111;--button-active-background:#e6e6e6;--button-hover-background:#d9d9d9}:host(.dark){color-scheme:dark;--background:#222;--border-color:#444;--indicator-color:#5373ec;--input-border-color:#ccc;--input-font-color:#efefef;--input-placeholder-color:#ccc;--outline-color:#fff;--category-font-color:#efefef;--button-active-background:#555555;--button-hover-background:#484848}@media (prefers-color-scheme:dark){:host{color-scheme:dark;--background:#222;--border-color:#444;--indicator-color:#5373ec;--input-border-color:#ccc;--input-font-color:#efefef;--input-placeholder-color:#ccc;--outline-color:#fff;--category-font-color:#efefef;--button-active-background:#555555;--button-hover-background:#484848}}:host([hidden]){display:none}button{margin:0;padding:0;border:0;background:0 0;box-shadow:none;-webkit-tap-highlight-color:transparent}button::-moz-focus-inner{border:0}input{padding:0;margin:0;line-height:1.15;font-family:inherit}input[type=search]{-webkit-appearance:none}:focus{outline:var(--outline-color) solid var(--outline-size);outline-offset:calc(-1*var(--outline-size))}:host([data-js-focus-visible]) :focus:not([data-focus-visible-added]){outline:0}:focus:not(:focus-visible){outline:0}.hide-focus{outline:0}*{box-sizing:border-box}.picker{contain:content;display:flex;flex-direction:column;background:var(--background);border:var(--border-size) solid var(--border-color);width:100%;height:100%;overflow:hidden;--total-emoji-size:calc(var(--emoji-size) + (2 * var(--emoji-padding)));--total-category-emoji-size:calc(var(--category-emoji-size) + (2 * var(--category-emoji-padding)))}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.hidden{opacity:0;pointer-events:none}.abs-pos{position:absolute;left:0;top:0}.gone{display:none!important}.skintone-button-wrapper,.skintone-list{background:var(--background);z-index:3}.skintone-button-wrapper.expanded{z-index:1}.skintone-list{position:absolute;inset-inline-end:0;top:0;z-index:2;overflow:visible;border-bottom:var(--border-size) solid var(--border-color);border-radius:0 0 var(--skintone-border-radius) var(--skintone-border-radius);will-change:transform;transition:transform .2s ease-in-out;transform-origin:center 0}@media (prefers-reduced-motion:reduce){.skintone-list{transition-duration:.001s}}@supports not (inset-inline-end:0){.skintone-list{right:0}}.skintone-list.no-animate{transition:none}.tabpanel{overflow-y:auto;-webkit-overflow-scrolling:touch;will-change:transform;min-height:0;flex:1;contain:content}.emoji-menu{display:grid;grid-template-columns:repeat(var(--num-columns),var(--total-emoji-size));justify-content:space-around;align-items:flex-start;width:100%}.category{padding:var(--emoji-padding);font-size:var(--category-font-size);color:var(--category-font-color)}.custom-emoji,.emoji,button.emoji{height:var(--total-emoji-size);width:var(--total-emoji-size)}.emoji,button.emoji{font-size:var(--emoji-size);display:flex;align-items:center;justify-content:center;border-radius:100%;line-height:1;overflow:hidden;font-family:var(--emoji-font-family);cursor:pointer}@media (hover:hover) and (pointer:fine){.emoji:hover,button.emoji:hover{background:var(--button-hover-background)}}.emoji.active,.emoji:active,button.emoji.active,button.emoji:active{background:var(--button-active-background)}.custom-emoji{padding:var(--emoji-padding);object-fit:contain;pointer-events:none;background-repeat:no-repeat;background-position:center center;background-size:var(--emoji-size) var(--emoji-size)}.nav,.nav-button{align-items:center}.nav{display:grid;justify-content:space-between;contain:content}.nav-button{display:flex;justify-content:center}.nav-emoji{font-size:var(--category-emoji-size);width:var(--total-category-emoji-size);height:var(--total-category-emoji-size)}.indicator-wrapper{display:flex;border-bottom:1px solid var(--border-color)}.indicator{width:calc(100%/var(--num-groups));height:var(--indicator-height);opacity:var(--indicator-opacity);background-color:var(--indicator-color);will-change:transform,opacity;transition:opacity .1s linear,transform .25s ease-in-out}@media (prefers-reduced-motion:reduce){.indicator{will-change:opacity;transition:opacity .1s linear}}.pad-top,input.search{background:var(--background);width:100%}.pad-top{height:var(--emoji-padding);z-index:3}.search-row{display:flex;align-items:center;position:relative;padding-inline-start:var(--emoji-padding);padding-bottom:var(--emoji-padding)}.search-wrapper{flex:1;min-width:0}input.search{padding:var(--input-padding);border-radius:var(--input-border-radius);border:var(--input-border-size) solid var(--input-border-color);color:var(--input-font-color);font-size:var(--input-font-size);line-height:var(--input-line-height)}input.search::placeholder{color:var(--input-placeholder-color)}.favorites{display:flex;flex-direction:row;border-top:var(--border-size) solid var(--border-color);contain:content}.message{padding:var(--emoji-padding)}";
  
    const PROPS = [
      'customEmoji',
      'customCategorySorting',
      'database',
      'dataSource',
      'i18n',
      'locale',
      'skinToneEmoji',
      'emojiVersion'
    ];
  
    // Styles injected ourselves, so we can declare the FONT_FAMILY variable in one place
    const EXTRA_STYLES = `:host{--emoji-font-family:${FONT_FAMILY}}`;
  
    class PickerElement extends HTMLElement {
      constructor (props) {
        super();
        this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = baseStyles + EXTRA_STYLES;
        this.shadowRoot.appendChild(style);
        this._ctx = {
          // Set defaults
          locale: DEFAULT_LOCALE,
          dataSource: DEFAULT_DATA_SOURCE,
          skinToneEmoji: DEFAULT_SKIN_TONE_EMOJI,
          customCategorySorting: DEFAULT_CATEGORY_SORTING,
          customEmoji: null,
          i18n: enI18n,
          emojiVersion: null,
          ...props
        };
        // Handle properties set before the element was upgraded
        for (const prop of PROPS) {
          if (prop !== 'database' && Object.prototype.hasOwnProperty.call(this, prop)) {
            this._ctx[prop] = this[prop];
            delete this[prop];
          }
        }
        this._dbFlush(); // wait for a flush before creating the db, in case the user calls e.g. a setter or setAttribute
      }
  
      connectedCallback () {
        // The _cmp may be defined if the component was immediately disconnected and then reconnected. In that case,
        // do nothing (preserve the state)
        if (!this._cmp) {
          this._cmp = createRoot(this.shadowRoot, this._ctx);
        }
      }
  
      disconnectedCallback () {
        // Check in a microtask if the element is still connected. If so, treat this as a "move" rather than a disconnect
        // Inspired by Vue: https://vuejs.org/guide/extras/web-components.html#building-custom-elements-with-vue
        qM(() => {
          // this._cmp may be defined if connect-disconnect-connect-disconnect occurs synchronously
          if (!this.isConnected && this._cmp) {
            this._cmp.$destroy();
            this._cmp = undefined;
  
            const { database } = this._ctx;
            database.close()
              // only happens if the database failed to load in the first place, so we don't care
              .catch(err => console.error(err));
          }
        });
      }
  
      static get observedAttributes () {
        return ['locale', 'data-source', 'skin-tone-emoji', 'emoji-version'] // complex objects aren't supported, also use kebab-case
      }
  
      attributeChangedCallback (attrName, oldValue, newValue) {
        this._set(
          // convert from kebab-case to camelcase
          // see https://github.com/sveltejs/svelte/issues/3852#issuecomment-665037015
          attrName.replace(/-([a-z])/g, (_, up) => up.toUpperCase()),
          // convert string attribute to float if necessary
          attrName === 'emoji-version' ? parseFloat(newValue) : newValue
        );
      }
  
      _set (prop, newValue) {
        this._ctx[prop] = newValue;
        if (this._cmp) {
          this._cmp.$set({ [prop]: newValue });
        }
        if (['locale', 'dataSource'].includes(prop)) {
          this._dbFlush();
        }
      }
  
      _dbCreate () {
        const { locale, dataSource, database } = this._ctx;
        // only create a new database if we really need to
        if (!database || database.locale !== locale || database.dataSource !== dataSource) {
          this._set('database', new Database({ locale, dataSource }));
        }
      }
  
      // Update the Database in one microtask if the locale/dataSource change. We do one microtask
      // so we don't create two Databases if e.g. both the locale and the dataSource change
      _dbFlush () {
        qM(() => (
          this._dbCreate()
        ));
      }
    }
  
    const definitions = {};
  
    for (const prop of PROPS) {
      definitions[prop] = {
        get () {
          if (prop === 'database') {
            // in rare cases, the microtask may not be flushed yet, so we need to instantiate the DB
            // now if the user is asking for it
            this._dbCreate();
          }
          return this._ctx[prop]
        },
        set (val) {
          if (prop === 'database') {
            throw new Error('database is read-only')
          }
          this._set(prop, val);
        }
      };
    }
  
    Object.defineProperties(PickerElement.prototype, definitions);
  
    /* istanbul ignore else */
    if (!customElements.get('emoji-picker')) { // if already defined, do nothing (e.g. same script imported twice)
      customElements.define('emoji-picker', PickerElement);
    }
  
    return PickerElement;
  
  })();
  