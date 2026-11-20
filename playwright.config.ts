import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  // tests/local corre contra el stack local (playwright.local.config.ts), no contra el deploy.
  // tests/unit son tests de Vitest (*.test.ts): el testMatch por default de
  // Playwright también los toma, y al importar vitest se cae la suite entera.
  testIgnore: ['local/**', 'unit/**'],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  ...(process.env.PLAYWRIGHT_BASE_URL ? {} : {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  }),
})
