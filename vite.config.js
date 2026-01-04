import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : '/Tableau-Blanc-Collab/',
  server: {
    proxy: {
      '/storage': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
