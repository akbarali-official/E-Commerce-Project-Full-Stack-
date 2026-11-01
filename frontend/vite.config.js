import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev me /api ki requests backend (port 5000) ko forward hoti hain
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' },
  },
})
