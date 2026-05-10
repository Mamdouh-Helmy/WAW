import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'vendor'
            if (id.includes('react-router-dom')) return 'router'
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'forms'
            return 'vendor'
          }
        },
      },
    },
  },
})