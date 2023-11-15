import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            includeAssets: ['assets/*.png', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'favicon-16x16.png' ,'favicon-32x32.png'],
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true,
                type: 'module',
            },
            manifest: {
                name: 'Tetris Game',
                short_name: 'Tetris',
                theme_color: '#212538',
                start_url: '/',
                display: 'standalone',
                background_color: '#212538',
                icons: [
                    {
                        src: 'android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
        }),
    ],
})
