// Hält die App offline verfügbar. Bei Änderungen an der App die Versionsnummer erhöhen.
const CACHE = "stundenkonto-v1";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Nur eigene Dateien zwischenspeichern – Microsoft-Anmeldung und OneDrive laufen immer direkt
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Seite selbst: erst online versuchen (für Updates), sonst aus dem Speicher
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put("./", copy)); return r;
    }).catch(() => caches.match("./")));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
