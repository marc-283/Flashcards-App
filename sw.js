/* PLM offline cache. Changes to any file give a new cache name, so the app updates itself the next time it is online. */
const CACHE = "plm-1.1.0-b501bd56";
const LIB = "plm-lib-9a3a2904";
const FILES = ["./", "index.html", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "fonts/barlow-condensed-latin-600-normal.woff2", "fonts/barlow-condensed-latin-700-normal.woff2", "fonts/barlow-condensed-latin-800-normal.woff2", "fonts/barlow-condensed-latin-ext-600-normal.woff2", "fonts/barlow-condensed-latin-ext-700-normal.woff2", "fonts/barlow-condensed-latin-ext-800-normal.woff2", "fonts/barlow-latin-400-normal.woff2", "fonts/barlow-latin-500-normal.woff2", "fonts/barlow-latin-600-normal.woff2", "fonts/barlow-latin-700-normal.woff2", "fonts/barlow-latin-ext-400-normal.woff2", "fonts/barlow-latin-ext-500-normal.woff2", "fonts/barlow-latin-ext-600-normal.woff2", "fonts/barlow-latin-ext-700-normal.woff2"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("plm-") && k !== CACHE && k !== LIB).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("index.html", copy)); return res; })
      .catch(() => caches.match("index.html", { ignoreSearch: true })));
    return;
  }
  if (/\/(ocr|lib)\//.test(url.pathname)) {
    e.respondWith(caches.open(LIB).then((c) => c.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});
