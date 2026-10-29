import { defineConfig, devices } from "@playwright/test";

// Browser tests of the production build against real public nodes (mainnet, V3) and the real
// runs API. CI installs Chromium; locally PW_CHROMIUM may point at an existing Chrome binary.
const port = Number(process.env.E2E_PORT ?? 4890);
const executablePath = process.env.PW_CHROMIUM || undefined;

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  expect: { timeout: 60_000 },
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: { baseURL: `http://127.0.0.1:${port}`, trace: "retain-on-failure", launchOptions: { executablePath } },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions: { executablePath } } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions: { executablePath } } },
  ],
  webServer: { command: `bun run start -p ${port}`, url: `http://127.0.0.1:${port}/dashboard`, reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
