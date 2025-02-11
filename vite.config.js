import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative paths in production builds
  server: {
    port: 3000, // Development server port
    open: true  // Automatically open the app in the browser
  },
  build: {
    outDir: 'dist', // Directory for production build files
  }
});
