/* eslint-disable import/no-extraneous-dependencies */
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import preprocess from 'svelte-preprocess';
import bundleAnalyzer from 'rollup-plugin-analyzer';
import fs from 'fs';
import postcss from './postcss.config';

export default defineConfig({
  optimizeDeps: {
    include: [
      'codemirror',
      'chroma-js',
      'konva',
      '@arna/edge-bundler',
      '@arna/core',
      '@arna/renderer',
    ],
  },
  build: {
    commonjsOptions: {
      include: [/edge-bundler/, /core/, /renderer/, /node_modules/],
    },
    rollupOptions: {
      plugins: [bundleAnalyzer({
        showExports: true,
        writeTo: (analysisString: string) => {
          fs.writeFileSync('./bundle-analysis.txt', analysisString);
        },
      })],
      output: {
        manualChunks: {
          codemirror: ['codemirror'],
          'chroma-js': ['chroma-js'],
          konva: ['konva'],
        },
      },
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
