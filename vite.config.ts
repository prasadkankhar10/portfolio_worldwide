import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/portfolio_worldwide/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three') || id.includes('node_modules/three-stdlib')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/@react-three/fiber') || id.includes('node_modules/@react-three/drei')) {
            return 'vendor-fiber';
          }
          if (id.includes('node_modules/@react-three/rapier') || id.includes('node_modules/@dimforge/rapier3d-compat')) {
            return 'vendor-rapier';
          }
          if (id.includes('node_modules/@react-three/postprocessing') || id.includes('node_modules/postprocessing')) {
            return 'vendor-postprocessing';
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/zustand') || id.includes('node_modules/gsap') || id.includes('node_modules/leva')) {
            return 'vendor-ui';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500
  }
});
