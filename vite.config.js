import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress warnings from @microsoft/signalr
        if (
          warning.code === 'INVALID_ANNOTATION' &&
          warning.id?.includes('@microsoft/signalr')
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
});
