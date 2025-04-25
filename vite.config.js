import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Para login y registro se conserva el prefijo /api/auth
      '/api/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      // Para resto de endpoints (usuarios, etc.) se elimina el prefijo /api
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
});