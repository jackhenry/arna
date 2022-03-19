import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import preprocess from 'svelte-preprocess';
import postcss from './postcss.config';

export default defineConfig({
  optimizeDeps: {
    include: [
      // 'chroma-js',
      // 'codemirror',
      // 'konva',
      // 'svelte',
      // 'svelte-preprocess',
      // '@sveltejs/vite-plugin-svelte',
      '@arna/core',
      '@arna/renderer'],
  },
  build: {
    commonjsOptions: {
      include: [/core/, /renderer/, /node_modules/],
    },
  },
  plugins: [
    svelte({ preprocess: preprocess() }),
  ],
  css: {
    postcss,
  },
  server: {
    cors: false,
  },
  preview: {
    cors: false,
  },
});
