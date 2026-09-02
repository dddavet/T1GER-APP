import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    // Never crawl generated Android/iOS HTML bundles as development entry points.
    optimizeDeps: { entries: ['index.html'] },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: true,
      port: 3000,
      strictPort: true,
      watch: { ignored: ['**/android/**', '**/ios/**', '**/functions/lib/**', '**/test-results/**'] },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/');
            if (normalizedId.includes('/node_modules/')) {
              if (normalizedId.includes('/node_modules/firebase/')) {
                return 'vendor-firebase';
              }
              if (normalizedId.includes('/node_modules/motion/') || normalizedId.includes('/node_modules/framer-motion/')) {
                return 'vendor-motion';
              }
              if (normalizedId.includes('/node_modules/lucide-react/')) {
                return 'vendor-icons';
              }
              if (normalizedId.includes('/node_modules/three/')) {
                return 'vendor-three';
              }
              if (normalizedId.includes('/node_modules/@react-three/')) {
                return 'vendor-react-three';
              }
              if (/\/node_modules\/(react|react-dom|scheduler)\//.test(normalizedId)) {
                return 'vendor-react-core';
              }
            }
          }
        }
      }
    }
  };
});
