// Keeps FLAG on the phone so it opens with no signal. Only sealed files are cached; nothing readable.
const V = "snap-v19";
const FILES = ["./", "index.html", "app.enc", "key.enc", "docx.umd.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon.svg", "favicon.ico"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
// Network first so a new version arrives when there's signal; the saved copy when there isn't.
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  e.respondWith(fetch(r).then((res) => {
    if (res.ok && new URL(r.url).origin === location.origin) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then((m) => m || (r.mode === "navigate" ? caches.match("index.html") : undefined))));
});
