import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    globals: true,
    browser: {
      enabled: false,
      instances: [{ browser: 'chromium' }],
      provider: playwright(),
      headless: false,
      screenshotFailures: true,
    },
    include: ['src/**/*.spec.ts'],
  },
});
