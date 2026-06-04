import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173'
const apiUrl = process.env.E2E_API_URL?.replace(/\/$/, '')

function previewWebServerCommand() {
  const buildEnv = apiUrl ? `VITE_API_URL=${apiUrl} ` : ''
  return `${buildEnv}npm run build && npm run preview -- --host 127.0.0.1 --port 4173`
}

/** @see https://playwright.dev/docs/test-configuration */
export default defineConfig({
  testDir: './e2e',
  // OTP login shares per-email state on the API — run serially when backend is wired.
  fullyParallel: !apiUrl,
  workers: apiUrl ? 1 : undefined,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: previewWebServerCommand(),
        url: baseURL,
        // Reuse mock preview only when API tests are off; API specs need VITE_API_URL baked in.
        reuseExistingServer: !process.env.CI && !apiUrl,
        timeout: 120_000,
      },
})
