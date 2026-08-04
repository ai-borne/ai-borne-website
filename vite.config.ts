import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['favicon.ico', 'favicon.svg', 'icon.svg', 'assets/*'],
      manifest: {
        name: 'AI-Borne',
        short_name: 'AI-Borne',
        description: 'Engineering Intelligent Apps & Automation',
        theme_color: '#0B1340',
        background_color: '#0B1340',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        appsindex: resolve(__dirname, 'apps/index.html'),
        payslipmax: resolve(__dirname, 'apps/payslipmax.html'),
        ssbmax: resolve(__dirname, 'apps/ssbmax.html'),
        yogaofeating: resolve(__dirname, 'apps/yoga-of-eating.html'),
        actionstation: resolve(__dirname, 'apps/action-station.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        blogpost: resolve(__dirname, 'blog/post.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        support: resolve(__dirname, 'support.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        terms: resolve(__dirname, 'terms.html'),
        datadeletion: resolve(__dirname, 'data-deletion.html'),
      },
    },
  },
});
