import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import type { ProxyOptions } from 'vite';

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
    strictPort: true,  // Don't try other ports if 3000 is busy
    host: '0.0.0.0',  // Listen on all network interfaces
    open: true,  // Open browser automatically
    hmr: {
      host: 'localhost',
      port: 3000,
      protocol: 'ws',
      overlay: false,
      clientPort: 3000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', {
              method: req.method,
              url: req.url,
              headers: req.headers,
            });
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', {
              statusCode: proxyRes.statusCode,
              statusMessage: proxyRes.statusMessage,
              headers: proxyRes.headers,
            });
          });
        },
      } as ProxyOptions,
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