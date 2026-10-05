import { defineConfig } from 'vitest/config';

// base './' makes the build work from any folder (itch.io zip, GitHub Pages sub-path, etc).
export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 1500,
  },
  test: { include: ['tests/**/*.test.ts'] },
});
