(() => {
    if (window.__otPageSolver) return;
    window.__otPageSolver = true;
    let solver = null;
    let initError = null;
    let chain = Promise.resolve();
    let scriptNonce = "";
    let reply = (msg) =>
        window.postMessage(Object.assign({ otSolver: "reply" }, msg), location.origin);
    let loadScript = (src) =>
        new Promise((resolve, reject) => {
            let script = document.createElement("script");
            if (scriptNonce) script.nonce = scriptNonce;
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load " + src));
            document.head.appendChild(script);
        });
    async function loadWebpackSolver(vendorCode, challengeCode) {
        if (!/^\w+$/.test(vendorCode) || !/^\w+$/.test(challengeCode)) {
            throw new Error("Bad challenge code");
        }
        let base = "https://abs.twimg.com/responsive-web/client-web/";
        let challengeSrc = `${base}ondemand.s.${challengeCode}a.js`;
        window.__SCRIPTS_LOADED__ = { runtime: true };
        let challengeData = await fetch(challengeSrc).then((res) => res.text());
        await loadScript(`${base}vendor.${vendorCode}.js`);
        await loadScript(challengeSrc);
        let idMatch = challengeData.match(/\.push\(\[\[\d+\],\{(\d+)[:(]/);
        if (!idMatch) throw new Error("Module ID not found");

        let registry = {};
        for (let payload of self.webpackChunk_twitter_responsive_web || []) {
            if (payload && payload[1]) Object.assign(registry, payload[1]);
        }
        let cache = {};
        function wreq(id) {
            if (cache[id]) return cache[id].exports;
            let factory = registry[id];
            if (!factory) throw new Error("No module with id " + id);
            let module = { id, loaded: false, exports: {} };
            cache[id] = module;
            factory(module, module.exports, wreq);
            module.loaded = true;
            return module.exports;
        }
        wreq.d = (exports, definition) => {
            if (Array.isArray(definition)) {
                for (let i = 0; i < definition.length; i += 3) {
                    let [key, flag, value] = definition.slice(i, i + 3);
                    Object.defineProperty(exports, key, {
                        enumerable: true,
                        get: flag && typeof value === "function" ? value : () => value,
                    });
                }
                return;
            }
            for (let key in definition) {
                Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
            }
        };
        wreq.r = (exports) => {
            if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
                Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
            }
            Object.defineProperty(exports, "__esModule", { value: true });
        };
        wreq.n = (mod) => {
            let getter = mod && mod.__esModule ? () => mod.default : () => mod;
            wreq.d(getter, { a: getter });
            return getter;
        };
        wreq.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
        wreq.dn = (fn) => {
            try {
                if (typeof fn === "function" && !fn.name) {
                    Object.defineProperty(fn, "name", { value: "default", configurable: true });
                }
            } catch (e) {}
            return fn;
        };

        let exports = wreq(idMatch[1]);
        if (typeof exports.default !== "function") throw new Error("Default export not found");
        return await exports.default();
    }
    window.addEventListener("message", (e) => {
        let data = e.data;
        if (e.origin !== location.origin || !data || data.otSolver !== "request") return;
        if (data.action === "init") {
            chain = chain.then(async () => {
                solver = null;
                initError = null;
                scriptNonce = data.nonce || "";
                try {
                    if (data.challengeUrl) {
                        let url = new URL(data.challengeUrl);
                        if (url.protocol !== "https:" || url.hostname !== "abs.twimg.com") {
                            throw new Error("Bad challenge url");
                        }
                        let mod = await import(url.href);
                        solver = await mod.default();
                    } else {
                        solver = await loadWebpackSolver(data.vendorCode, data.challengeCode);
                    }
                    reply({ action: "ready" });
                } catch (err) {
                    initError = String(err);
                    reply({ action: "initError", error: initError });
                }
            });
        } else if (data.action === "solve") {
            chain = chain.then(async () => {
                if (!solver) {
                    reply({ action: "error", id: data.id, error: initError || "Solver not initialized" });
                    return;
                }
                try {
                    let result = await solver(data.path, data.method);
                    reply({ action: "solved", id: data.id, result });
                } catch (err) {
                    reply({ action: "error", id: data.id, error: `${err.message}\n${err.stack}` });
                }
            });
        }
    });
})();
