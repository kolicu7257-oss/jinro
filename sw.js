/* 홈 화면 앱용 오프라인 저장. 한 번 열면 아래 파일을 기기에 저장해 두고, 인터넷이 없을 때 저장본으로 엽니다.
   인터넷이 될 때는 항상 최신 index.html을 먼저 받아 저장본을 갱신합니다. 기록·개인정보는 다루지 않습니다. */
const CACHE = "jinro-v1";
const FILES = ["./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    // 화면(index.html): 인터넷 먼저, 안 되면 저장본
    e.respondWith(fetch(req)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return res; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  // 아이콘 등: 저장본 먼저, 없으면 인터넷
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
