import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { lossless: true },
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    })
  ],
  optimizeDeps: {
    include: ['react-helmet-async'],
  },
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    }
  },
  build: {
    sourcemap: false, // Never expose source code in production
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kB
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          'vendor-ui': ['framer-motion', 'sonner', 'react-icons'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['axios', 'date-fns', 'canvas-confetti'],
        }
      }
    }
  },
  // Strip console.* calls from production builds
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
