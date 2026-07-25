import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // The editor and charting stacks are large and only needed on a few
        // screens. Splitting them keeps the initial shell + landing page load
        // well under the single-bundle size this used to ship as.
        manualChunks: {
          codemirror: ['@uiw/react-codemirror', '@replit/codemirror-vim'],
          charts: ['chart.js'],
          vendor: ['react', 'react-dom', 'react-router-dom', '@auth0/auth0-react'],
        },
      },
    },
  },
});
