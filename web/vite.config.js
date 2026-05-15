import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 17777,
    proxy: {
      '/tshock': {
        target: 'http://localhost:7878',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tshock/, ''),
      },
    },
  },
  preview: {
    port: 17777,
    proxy: {
      '/tshock': {
        target: 'http://localhost:7878',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tshock/, ''),
      },
    },
  },
})
