// ─── Finance Tracker Service Worker ─────────────────────────────────────────
// Strategies:
//   Shell/static (_next/static, icons, fonts) → Cache-first
//   API routes   (/api/**)                    → Network-only (never cache)
//   Navigation   (HTML pages)                 → Network-first + offline fallback
//   Everything else                           → Stale-while-revalidate

'use strict'

const CACHE_VER   = 'v2'
const SHELL_CACHE = `fin-shell-${CACHE_VER}`
const FONT_CACHE  = `fin-fonts-${CACHE_VER}`
const ALL_CACHES  = [SHELL_CACHE, FONT_CACHE]

// Pre-cache these on install
const PRECACHE = [
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico',
]

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(function (cache) {
        // allSettled so one 404 doesn't abort the whole install
        return Promise.allSettled(
          PRECACHE.map(function (url) { return cache.add(url) })
        )
      })
      .then(function () { return self.skipWaiting() })
  )
})

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) { return !ALL_CACHES.includes(k) })
            .map(function (k)   { return caches.delete(k) })
        )
      })
      .then(function () { return self.clients.claim() })
  )
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', function (event) {
  var req = event.request
  var url = new URL(req.url)

  // Ignore non-GET and cross-origin
  if (req.method !== 'GET' || url.origin !== self.location.origin) return

  // 1. API → network-only, no caching ever
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(req))
    return
  }

  // 2. Next.js build chunks → cache-first (they have content-hash in filename)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(req, SHELL_CACHE))
    return
  }

  // 3. Google Fonts → cache-first in dedicated font cache
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(cacheFirst(req, FONT_CACHE))
    return
  }

  // 4. Icons / images / favicon → cache-first
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.ico' ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp')
  ) {
    event.respondWith(cacheFirst(req, SHELL_CACHE))
    return
  }

  // 5. HTML navigation → network-first, fall back to /offline
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstNav(req))
    return
  }

  // 6. Everything else → stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req, SHELL_CACHE))
})

// ── Message: skip waiting on demand ─────────────────────────────────────────
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function cacheFirst(req, cacheName) {
  return caches.match(req).then(function (cached) {
    if (cached) return cached
    return fetch(req).then(function (response) {
      if (response.ok) {
        var clone = response.clone()
        caches.open(cacheName).then(function (c) { c.put(req, clone) })
      }
      return response
    }).catch(function () {
      return new Response('Offline', { status: 503 })
    })
  })
}

function networkFirstNav(req) {
  return fetch(req).then(function (response) {
    if (response.ok) {
      var clone = response.clone()
      caches.open(SHELL_CACHE).then(function (c) { c.put(req, clone) })
    }
    return response
  }).catch(function () {
    return caches.match(req).then(function (cached) {
      if (cached) return cached
      return caches.match('/offline').then(function (offlinePage) {
        return offlinePage || new Response('You are offline.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        })
      })
    })
  })
}

function staleWhileRevalidate(req, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(req).then(function (cached) {
      var fetchPromise = fetch(req).then(function (response) {
        if (response.ok) cache.put(req, response.clone())
        return response
      }).catch(function () { return cached })

      return cached || fetchPromise
    })
  })
}
