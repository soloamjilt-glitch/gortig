/* ГОРТИГ — офлайн кэш */
const V = 'gortig-v4';
/* './index.html' ОРУУЛАХГҮЙ: Vercel-ийн cleanUrls нь түүнийг '/' руу чиглүүлдэг тул
   чиглүүлсэн хариуг кэшлэхэд addAll унаж, SW суулгагдахгүй. './' нь хуудсыг аль хэдийн хамарна. */
const FILES = ['./','./styles.css','./data.js','./draw.js','./app.js',
               './manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(V).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./')))
  );
});
