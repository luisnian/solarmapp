// ═══════════════════════════════════════════════════════
//  SolarMap — Service Worker
//  Estrategia: Cache-first para assets propios,
//              Network-first para tiles de mapa y CDN
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'solarmap-v1';
const CACHE_CDN   = 'solarmap-cdn-v1';

// Assets propios que se cachean al instalar (offline garantizado)
const STATIC_ASSETS = [
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// CDN externos que se cachean la primera vez que se usan
const CDN_PATTERNS = [
  'unpkg.com/leaflet',
  'cdnjs.cloudflare.com/ajax/libs/suncalc',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// Patrones que NUNCA se cachean (tiles de mapa, siempre frescos)
const NEVER_CACHE = [
  'tile.openstreetmap.org',
  'arcgisonline.com',
  'nominatim.openstreetmap.org'
];

// ── INSTALL: pre-cachear assets estáticos ────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: limpiar caches antiguas ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CACHE_CDN)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: estrategia por tipo de recurso ────────────────
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 1. Tiles de mapa y geocoding → siempre red, sin cache
  if (NEVER_CACHE.some(p => url.includes(p))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Assets propios → Cache-first, fallback red
  if (url.includes(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 3. CDN (Leaflet, SunCalc, fuentes) → Cache-first
  if (CDN_PATTERNS.some(p => url.includes(p))) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_CDN).then(c => c.put(event.request, clone));
          }
          return response;
        }).catch(() => cached); // si falla la red, devolver cache aunque sea vieja
      })
    );
    return;
  }

  // 4. Resto → red directa
  event.respondWith(fetch(event.request));
});
