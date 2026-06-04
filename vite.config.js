import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react({ jsxImportSource: 'react' }), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  build: {
    modulePreload: { polyfill: true },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('@sentry')) return 'vendor-sentry'
          if (id.includes('maplibre-gl')) return 'vendor-maps'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('@stripe')) return 'vendor-stripe'
          if (id.includes('lucide-react')) return 'vendor-icons'
          if (id.includes('react-router') || id.includes('react-router-dom')) return 'vendor-router'
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.endsWith('/react-dom') ||
            id.endsWith('/react')
          ) {
            return 'vendor-react'
          }
          if (id.includes('react-markdown') || id.includes('remark-') || id.includes('rehype-')) {
            return 'vendor-markdown'
          }

          return undefined
        },
      },
    },
  },
})
