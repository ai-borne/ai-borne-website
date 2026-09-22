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
        main: resolve(import.meta.dirname, 'index.html'),
        appsindex: resolve(import.meta.dirname, 'apps/index.html'),
        payslipmax: resolve(import.meta.dirname, 'apps/payslipmax.html'),
        ssbmax: resolve(import.meta.dirname, 'apps/ssbmax.html'),
        yogaofeating: resolve(import.meta.dirname, 'apps/yoga-of-eating.html'),
        actionstation: resolve(import.meta.dirname, 'apps/action-station.html'),
        defencewire: resolve(import.meta.dirname, 'apps/defencewire.html'),
        securemax: resolve(import.meta.dirname, 'apps/securemax.html'),
        blog: resolve(import.meta.dirname, 'blog/index.html'),
        blogpost: resolve(import.meta.dirname, 'blog/post.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
        support: resolve(import.meta.dirname, 'support.html'),
        privacy: resolve(import.meta.dirname, 'privacy-policy.html'),
        terms: resolve(import.meta.dirname, 'terms.html'),
        datadeletion: resolve(import.meta.dirname, 'data-deletion.html'),
      },
    },
  },
});
