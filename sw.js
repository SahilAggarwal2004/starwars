/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, setDefaultHandler } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { offlineFallback } from 'workbox-recipes'

clientsClaim() // This should be at the top of the service worker
self.skipWaiting()

const urlsToCache = self.__WB_MANIFEST.filter(({ url }) => !url.includes('middleware'))
precacheAndRoute(urlsToCache)

setDefaultHandler(new StaleWhileRevalidate())
offlineFallback({ pageFallback: '/_offline' });

registerRoute(({ request }) => request.destination === 'image', new CacheFirst({
    cacheName: 'images',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })]
}))