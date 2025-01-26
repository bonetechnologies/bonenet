import { defineConfig } from 'vite';
export default defineConfig({
  base: './', // Ensures relative paths for assets
  plugins: [react()],
});