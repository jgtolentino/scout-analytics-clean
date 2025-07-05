import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }), 
    nodePolyfills({
      include: ['buffer', 'events', 'stream', 'util'],
      protocolImports: true,
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'node:buffer': 'buffer/',
      'buffer': 'buffer/',
      'node:events': 'events/',
      'events': 'events/',
      'stream': 'stream-browserify',
      'util': 'util/',
      'process': 'process',
    },
  },
  optimizeDeps: {
    include: ['buffer','process'],
    esbuildOptions: {
      define: { global: 'globalThis', 'process.env': '{}' },
      plugins: [
        NodeGlobalsPolyfillPlugin({ process: true, buffer: true }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      plugins: [
        nodePolyfills()
      ],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
          utils: ['date-fns', 'zustand', 'clsx']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true,
    host: true,
    hmr: {
      host: 'localhost',
      port: 5173
    }
  },
  preview: {
    port: 4173,
    open: true
  }
});