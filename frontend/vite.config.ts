/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  envPrefix: 'REACT_APP_',
  base: process.env.PUBLIC_URL,
  server: {
    port: 3000,
    proxy: {
      '/plugins': {
        target: 'http://localhost:4466',
        changeOrigin: true,
      },
    },
    cors: true,
  },
  plugins: [
    svgr({
      svgrOptions: {
        prettier: false,
        svgo: false,
        svgoConfig: {
          plugins: [{ removeViewBox: false }],
        },
        titleProp: true,
        ref: true,
      },
    }),
    react(),
    nodePolyfills({
      include: ['process', 'buffer', 'stream'],
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    env: {
      UNDER_TEST: 'true',
    },
    alias: [
      {
        find: /^monaco-editor$/,
        replacement: __dirname + '/node_modules/monaco-editor/esm/vs/editor/editor.api',
      },
    ],
    coverage: {
      reporter: ['text'],
    },
    restoreMocks: false,
    setupFiles: ['./src/setupTests.ts'],
  },
  build: {
    outDir: 'build',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Exclude @axe-core from production bundle
      external: ['@axe-core/react'],
      output: {
        manualChunks(id: string) {
          // Build smaller chunks for @mui, lodash, xterm, recharts
          if (id.includes('node_modules')) {
            if (id.includes('lodash')) {
              return 'vendor-lodash';
            }

            if (id.includes('@mui/material')) {
              return 'vendor-mui';
            }

            if (id.includes('xterm')) {
              return 'vendor-xterm';
            }

            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }
          }
        },
      },
    },
  },
});
