// public/sw.js
const CACHE_NAME = 'umemploy-cache-v1'
const OFFLINE_URL = '/offline'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Try to cache offline page, but don't fail if it doesn't exist
        return cache.add(OFFLINE_URL).catch((error) => {
          console.log('Offline page not found, skipping cache:', error)
          // Cache a simple offline response instead
          return cache.put(OFFLINE_URL, new Response(
            '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          ))
        })
      })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL).catch(() => {
            // If offline page is not cached, return a simple offline response
            return new Response(
              '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            )
          })
        })
    )
  }
})