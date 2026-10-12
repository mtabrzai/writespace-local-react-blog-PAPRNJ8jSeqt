import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/__tests__/**',
        '**/*.test.{js,jsx}',
        '**/node_modules/**',
        '**/dist/**',
        '**/vite.config.js',
        '**/vitest.config.js',
        '**/postcss.config.js',
        '**/tailwind.config.js',
        '**/src/main.jsx',
        '**/src/App.jsx',
        '**/src/constants.js',
        '**/src/types.js'
      ]
    }
  }
});