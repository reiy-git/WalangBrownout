import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' 
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      // When running inside Docker, the frontend dev server is in a container.
      // Use the nginx service hostname so /api requests go to the backend proxy.
      '/api': {
        target: 'http://nginx',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})