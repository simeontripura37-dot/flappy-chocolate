const CACHE_NAME = 'flappy-chocolate-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/sound.js',
  '/manifest.json',
  '/bird.png',
  '/pipe.png',
  '/chocolate.png', // Updated to chocolate
  '/sound.mp3',
  '/logo.png',
  '/bgm.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});