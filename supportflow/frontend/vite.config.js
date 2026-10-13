import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return undefined
          if (id.includes('/node_modules/xlsx/')) return 'spreadsheet-export'
          if (id.includes('/node_modules/jspdf/')) return 'pdf-export'
          if (id.includes('/node_modules/docx/')) return 'docx-export'
          if (id.includes('/node_modules/html2canvas/')) return 'canvas-export'
          if (id.includes('/node_modules/recharts/')) return 'charts-vendor'
          if (id.includes('/node_modules/lucide-react/')) return 'icons-vendor'
          if (id.includes('/node_modules/@stomp/') || id.includes('/node_modules/sockjs-client/')) return 'realtime-vendor'
          return undefined
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true
      }
    }
  }
})