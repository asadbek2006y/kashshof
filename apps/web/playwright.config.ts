import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3100';

/**
 * End-to-end flows against the real web app + API + seeded Postgres. Start the database and
 * API first (see the repository README); the web dev server is started here if not running.
 * flows.spec.ts runs conversations in private guided mode (never a model), so any API config works;
 * gemini.spec.ts is the live-model flow (E2E_GEMINI=1, normal API).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL: BASE_URL, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : { command: 'pnpm dev', url: BASE_URL, reuseExistingServer: true, timeout: 120_000 },
});
