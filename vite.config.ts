import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Calculadora Nobre',
        short_name: 'CalcNobre',
        description: 'Calculadoras financeiras: juros compostos, rentabilidade e financiamento imobiliário.',
        lang: 'pt-BR',
        start_url: '/calculadora-nobre/',
        scope: '/calculadora-nobre/',
        display: 'standalone',
        theme_color: '#2563eb',
        background_color: '#f9fafb',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/calculadora-nobre/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  base: '/calculadora-nobre/',
});