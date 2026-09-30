import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    cssMinify: 'esbuild',
    sourcemap: false,
  },
});
