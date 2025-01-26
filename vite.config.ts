import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Import the Vite React plugin

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});