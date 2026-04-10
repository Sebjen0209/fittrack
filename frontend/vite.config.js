import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/workouts': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
