import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // Serve assets relative to the index.html
  plugins: [react()],
  build: {
    outDir: 'dist', // Output folder
    rollupOptions: {
      input: {
        main: './index.html', // Entry point
      },
    },
  },
});