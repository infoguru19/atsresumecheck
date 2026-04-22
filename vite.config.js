import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // During local dev, forward /api/* to vercel dev (port 3000)
      // or run: vercel dev  (recommended for testing serverless functions)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: { outDir: 'dist' }
})
