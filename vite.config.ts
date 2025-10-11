import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 3000,
    strictPort: false,  // Allow fallback to different port if 3000 is busy
    host: true,
    hmr: {
      overlay: false, // Disable error overlays that might cause reload loops
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        headers: {
          'X-Forwarded-Host': 'localhost:3000',
        },
      },
    },
    // Prevent infinite reload loops
    watch: {
      // Ignore build directory and node_modules
      ignored: ['**/build/**', '**/node_modules/**']
    }
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    chunkSizeWarningLimit: 1500, // Increase limit to 1000 kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-utils': ['axios', '@supabase/supabase-js'],
          'vendor-charts': ['recharts'],
        }
      }
    }
  },
  define: {
    global: 'globalThis',
  },
});