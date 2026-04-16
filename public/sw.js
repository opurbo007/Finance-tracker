// ─── Finance Tracker Service Worker ────────────────────────────────────────
// Strategy:
//   • App shell (HTML, JS, CSS, fonts, icons) → Cache-first, update in background
//   • API routes (/api/**)                    → Network-first, no caching
//   • Navigation requests                     → Network-first, fall back to cached /offline
//
// Cache versioning: bump CACHE_VERSION when you deploy breaking shell changes.

const CACHE_VERSION = 'v1'
const SHELL_CACHE   = `finance-shell-${CACHE_VERSION}`
const FONT_CACHE    = `finance-fonts-${CACHE_VERSION}`

// Resources to pre-cache on install
const SHELL_URLS = [
  '/',
  '/dashboard',
  '/expenses',
  '/wealth',
  '/analytics',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico',
]

// ── Install: pre-cache app shell ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // Use individual add() calls so one failure doesn't abort everything
      Promise.allSettled(SHELL_URLS.map((url) => cache.add(url)))
    ).then(() => self.skipWaiting())
  )
})

// ── Activate: delete old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const CURRENT = new Set([SHELL_CACHE, FONT_CACHE])
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !CURRENT.has(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: route-based strategies ───────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // 1. API routes → network-only (never cache auth/data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request))
    return
  }

  // 2. Next.js build assets (_next/static) → cache-first, immutable
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, SHELL_CACHE))
    return
  }

  // 3. Google Fonts → cache-first in font cache
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(cacheFirst(request, FONT_CACHE))
    return
  }

  // 4. Icons & images → cache-first
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(cacheFirst(request, SHELL_CACHE))
    return
  }

  // 5. HTML navigation → network-first, fall back to cached shell or /offline
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNav(request))
    return
  }

  // 6. Everything else → stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, SHELL_CACHE))
})

// ── Strategy helpers ─────────────────────────────────────────────────────────

/** Return cached response instantly; fetch & update cache in background. */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

/** Try network first; fall back to cache; last resort → /offline page. */
async function networkFirstNav(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    const offline = await caches.match('/offline')
    return offline ?? new Response('You are offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
  }
}

/** Return cache immediately; fetch in background and update. */
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName)
  const cached = await cache.match(request)
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone())
    return response
  }).catch(() => cached)
  return cached ?? fetchPromise
}

// ── Background sync placeholder ──────────────────────────────────────────────
// Extend here to queue failed mutations (add transaction while offline)
// and replay them when connectivity returns.
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    // Future: replay queued offline writes
    event.waitUntil(Promise.resolve())
  }
})

// ── Push notifications placeholder ───────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Finance', {
      body:  data.body ?? '',
      icon:  '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
    })
  )
})

// ── Skip waiting on demand (sent by PwaRegister on update detected) ──────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
