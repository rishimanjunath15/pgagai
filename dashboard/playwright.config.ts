// ============================================
// PLAYWRIGHT CONFIG
// ============================================
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Fail build on CI if test.only snapshot is left
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    // All E2E tests run against the running dev server
    baseURL: "http://localhost:3000",
    // Collect traces on first retry to help debug flakes
    trace: "on-first-retry",
    // Take screenshot on failure
    screenshot: "only-on-failure",
    // Generous timeout for slow CI machines
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Automatically start the dev server if it's not already running.
  // If port 3000 is already listening (local dev), Playwright reuses it.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },

  // Don't exceed 30s per test
  timeout: 30_000,
  expect: {
    // Give assertions 5s before failing
    timeout: 5_000,
  },
});
