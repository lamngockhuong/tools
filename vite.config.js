import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Set base URL for GitHub Pages deployment
  base: process.env.NODE_ENV === 'production' ? '/tools/' : '/',
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        'sql-param-replacer': resolve(__dirname, 'public/sql-param-replacer.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.js']
  },
  publicDir: '../static', // if you want to copy static assets
  server: {
    open: '/sql-param-replacer.html',
    port: 8080
  }
});
