import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '^/(usuarios|club|equipo)': { // Expresión regular para múltiples rutas
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
});