#!/usr/bin/env python3
"""Builds the deployable app (index.html, sw.js, manifest.webmanifest) from src/."""
import hashlib, json, os, re, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
VERSION = "1.0.0"
def read(p): return open(os.path.join(ROOT, p), encoding="utf-8").read()
app = "\n".join(read(os.path.join("src/app", f)) for f in sorted(os.listdir(os.path.join(ROOT, "src/app"))) if f.endswith(".js"))
html = read("src/shell.html")
for k, v in {"{{CSS}}": read("src/app.css"), "{{CORE}}": read("src/core.js"), "{{DATA}}": read("src/data.js"), "{{APP}}": app, "{{VERSION}}": VERSION}.items():
    html = html.replace(k, v)
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(html)
manifest = {
  "name": "Personal Language Management", "short_name": "PLM", "description": "Flashcards für Englisch, Italienisch und mehr – mit Wiederholungsplan, Konjugation und Statistik.",
  "lang": "de", "start_url": "./", "scope": "./", "display": "standalone", "orientation": "any", "background_color": "#000000", "theme_color": "#000000",
  "icons": [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}],
  "shortcuts": [{"name": "Lernen", "url": "./#learn"}, {"name": "Neue Karte", "url": "./#add"}, {"name": "Suche", "url": "./#search"}]
}
open(os.path.join(ROOT, "manifest.webmanifest"), "w", encoding="utf-8").write(json.dumps(manifest, ensure_ascii=False, indent=2))
files = ["index.html", "manifest.webmanifest"] + sorted("icons/" + f for f in os.listdir(os.path.join(ROOT, "icons"))) + sorted("fonts/" + f for f in os.listdir(os.path.join(ROOT, "fonts")))
h = hashlib.sha256()
for f in files: h.update(open(os.path.join(ROOT, f), "rb").read())
cache = f"plm-{VERSION}-{h.hexdigest()[:8]}"
sw = f'''/* PLM offline cache. Changes to any file give a new cache name, so the app updates itself the next time it is online. */
const CACHE = "{cache}";
const FILES = {json.dumps(["./"] + files)};
self.addEventListener("install", (e) => {{ e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); }});
self.addEventListener("activate", (e) => {{ e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); }});
self.addEventListener("fetch", (e) => {{
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {{
    e.respondWith(fetch(req).then((res) => {{ const copy = res.clone(); caches.open(CACHE).then((c) => c.put("index.html", copy)); return res; }})
      .catch(() => caches.match("index.html", {{ ignoreSearch: true }})));
    return;
  }}
  e.respondWith(caches.match(req, {{ ignoreSearch: true }}).then((hit) => hit || fetch(req)));
}});
'''
open(os.path.join(ROOT, "sw.js"), "w", encoding="utf-8").write(sw)
print("built", cache, f"{len(html)//1024} KB")
