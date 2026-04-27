import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  },
  test: {
    globals: true,
    environment: 'jsdom', // required for JS component testing
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
