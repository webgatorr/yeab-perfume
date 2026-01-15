import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Yeab',
        short_name: 'Yeab',
        description: 'Premium order tracking and financial management system',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        orientation: 'portrait',
        categories: ['business', 'finance', 'productivity'],
        icons: [
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    }
}
