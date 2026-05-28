import 'whatwg-fetch';
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  },
  test: {
    globals: true,
    environment: 'jsdom', // required for JS component testing
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: './src/test/setup.ts',
    reporters: ['default', 'html'],
    outputFile: './src/test/report/index.html',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './test/coverage'
    },
    server: {
      deps: {
        inline: [/msw/], // neeeds to enable global fetch
      },
    },

  },
});
