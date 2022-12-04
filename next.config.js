/** @type {import('next').NextConfig} */

const revision = `${Date.now()}`

const withPWA = require('next-pwa')({
    dest: 'public',
    additionalManifestEntries: [
        { url: '/how-to-play', revision },
        { url: '/team-selection?mode=computer', revision },
        { url: '/team-selection?mode=player', revision },
        { url: '/play?mode=computer', revision },
        { url: '/play?mode=player', revision },
        { url: '/result?mode=computer', revision },
        { url: '/result?mode=player', revision },
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
        { url: '/images/effects/taunt.webp', revision }
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
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'static-js-assets' }
        },
        {
            urlPattern: /\.(?:css|less)$/i,
            handler: 'StaleWhileRevalidate',
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
            handler: 'StaleWhileRevalidate',
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

const nextConfig = {}

module.exports = withPWA(nextConfig)