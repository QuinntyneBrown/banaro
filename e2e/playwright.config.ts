import { defineConfig, devices } from '@playwright/test';

// Chromium only (AGENTS.md). The backend runs in Docker Compose (ADR-0002); the Angular dev
// server proxies /api and /sanctum to it.
export default defineConfig({
  testDir: '.',
  testMatch: ['specs/**/*.spec.ts'],
  fullyParallel: true,
  workers: process.env.CI ? undefined : 2,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.BANARO_WEB_URL ?? 'http://localhost:4300',
    trace: 'retain-on-failure',
    locale: 'en-CA',
    timezoneId: 'America/Toronto',
  },
  projects: [
    {
      name: 'banaro',
      testIgnore: ['specs/admin/**'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'docker compose up -d --wait api',
      cwd: '..',
      url: 'http://localhost:8100/health/ready',
      reuseExistingServer: true,
      timeout: 300_000,
    },
    {
      // A production build behind the SSR server's own /api proxy, as in deployment.
      command: 'npm run serve:e2e',
      cwd: '../frontend',
      env: { PORT: '4300', BANARO_API_URL: 'http://localhost:8100' },
      url: 'http://localhost:4300',
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  ],
});
