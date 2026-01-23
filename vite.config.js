import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/SFEMS_Frontend/',
  build: {
    chunkSizeWarningLimit: 1000,
    copyPublicDir: true
  }
})