/// <reference types="vitest" />
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TinyMDE',
      fileName: (format) => (format === 'es' ? 'tinymde.js' : 'tinymde.umd.cjs'),
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'styles.css';
          }
          return assetInfo.name || '[name][extname]';
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'node'
  }
});
