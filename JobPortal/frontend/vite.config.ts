import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()], // No tailwindcss plugin needed for v3
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost/backend',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})