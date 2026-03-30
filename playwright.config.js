import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

const dotenvPath = process.env.DOTENV_CONFIG_PATH || '.env';
dotenv.config(dotenvPath ? { path: dotenvPath } : undefined);
const defaultBaseUrl = process.env.UI_BASE_URL || 'http://localhost';
// DOTENV_CONFIG_PATH=.env.kube npx playwright test

const envs = [
  // { name: 'desktop', viewport: { width: 1920, height: 1080 }, baseURL: defaultBaseUrl },
  // { name: 'mobile', viewport: { width: 375, height: 667 }, baseURL: defaultBaseUrl },
  // { name: 'tablet',    viewport: { width: 768,  height: 1024 }, baseURL: defaultBaseUrl },
  // { name: 'ultrawide', viewport: { width: 2560, height: 1080 }, baseURL: defaultBaseUrl },
  { name: 'macbook', viewport: { width: 1440, height: 900 }, baseURL: defaultBaseUrl },
];

const browsers = [
  { name: 'chromium', use: devices['Desktop Chrome'] },
  // { name: 'firefox', use: devices['Desktop Firefox'] },
  // { name: 'webkit', use: devices['Desktop Safari'] },
];

const projects = browsers.flatMap(browser =>
  envs.map(env => ({
    name: `${browser.name}-${env.name}`,
    use: {
      ...browser.use,
      baseURL: env.baseURL,
      viewport: env.viewport,
    },
    metadata: { browser: browser.name, env: env.name },
  })),
);

export default defineConfig({
  testDir: './tests/ui/tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: 0,
  workers: undefined,
  reporter: [
    ['line'],
    ['allure-playwright', { resultsDir: 'allure-results', cleanResultsDir: false }],
  ],
  use: {
    headless: process.env.CI === 'true',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects,
});
