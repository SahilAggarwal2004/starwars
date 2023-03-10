/** @type {import('next').NextConfig} */

const revision = `${Date.now()}`

const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    additionalManifestEntries: [
        { url: '/team-selection', revision },
        { url: '/play', revision },
        { url: '/result', revision },
        { url: '/how-to-play', revision },
        { url: '/images/players/Bastila Shan.webp', revision },
        { url: '/images/players/Chewbecca.webp', revision },
        { url: '/images/players/Count Dooku.webp', revision },
        { url: '/images/players/Darth Nihilus.webp', revision },
        { url: '/images/players/Darth Revan.webp', revision },
        { url: '/images/players/Darth Vader.webp', revision },
        { url: '/images/players/Grand Master Yoda.webp', revision },
        { url: '/images/players/Jedi Consular.webp', revision },
        { url: '/images/players/Jedi Knight Revan.webp', revision },
        { url: '/images/players/Jolee Bindo.webp', revision },
        { url: '/images/players/Mother Talzin.webp', revision },
        { url: '/images/players/Old Daka.webp', revision },
        { url: '/images/effects/defense down.webp', revision },
        { url: '/images/effects/defense up.webp', revision },
        { url: '/images/effects/foresight.webp', revision },
        { url: '/images/effects/offense down.webp', revision },
        { url: '/images/effects/offense up.webp', revision },
        { url: '/images/effects/stealth.webp', revision },
        { url: '/images/effects/taunt.webp', revision },
        { url: '/images/effects/buff immunity.webp', revision },
        { url: '/images/effects/debuff immunity.webp', revision },
        { url: '/images/effects/stun.webp', revision },
        { url: '/images/effects/heal over turn.webp', revision },
        { url: '/images/effects/damage over turn.webp', revision }
    ],
    runtimeCaching: [
        {
            urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'static-font-assets' }
        },
        {
            urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'static-image-assets' }
        },
        {
            urlPattern: /\/_next\/image\?url=.+$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'next-image' }
        },
        {
            urlPattern: /\.(?:mp3|wav|ogg)$/i,
            handler: 'CacheFirst',
            options: {
                rangeRequests: true,
                cacheName: 'static-audio-assets'
            }
        },
        {
            urlPattern: /\.(?:mp4)$/i,
            handler: 'CacheFirst',
            options: {
                rangeRequests: true,
                cacheName: 'static-video-assets'
            }
        },
        {
            urlPattern: /\.(?:js)$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'static-js-assets' }
        },
        {
            urlPattern: /\.(?:css|less)$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'static-style-assets' }
        },
        {
            urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'next-data' }
        },
        {
            urlPattern: /\.(?:json|xml|csv)$/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'static-data-assets' }
        },
        {
            urlPattern: ({ url }) => {
                const isSameOrigin = self.origin === url.origin
                if (!isSameOrigin) return false
                const pathname = url.pathname
                if (pathname.startsWith('/api/')) return false
                return true
            },
            handler: 'CacheFirst',
            options: { cacheName: 'others' }
        },
        {
            urlPattern: ({ url }) => {
                const isSameOrigin = self.origin === url.origin
                return !isSameOrigin
            },
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'cross-origin' }
        }
    ]
})

const nextConfig = {
    experimental: { nextScriptWorkers: true }
}

module.exports = withPWA(nextConfig)
