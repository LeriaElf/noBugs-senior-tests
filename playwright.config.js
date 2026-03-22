import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './ui/tests',
  fullyParallel: true,
  retries: 0,
  workers: undefined,
  reporter: [
    ['line'],
    ['allure-playwright', { resultsDir: 'allure-results', cleanResultsDir: false }],
  ],
  use: {
    headless: process.env.CI === 'true',
    baseURL: process.env.UI_BASE_URL || 'http://localhost:3000',
    actionTimeout: 10_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1600, height: 1200 },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],
});
