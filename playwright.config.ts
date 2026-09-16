import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // tests/ holds two suites: Playwright specs and bun unit tests. Without
  // this, Playwright tries to load the bun ones, dies on `import "bun:test"`
  // while collecting, and reports "Total: 0 tests in 0 files" - which reads
  // like there is nothing to run rather than like a failure.
  testMatch: "**/*.spec.ts",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI
    ? [["list"], ["json", { outputFile: "test-results/results.json" }]]
    : "list",

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      // If `browserType.launch` reports the executable is missing and
      // `playwright install chromium` never finishes: on some machines the
      // download completes (170MB zip) and extraction then stalls mid-write -
      // open write handle, no bytes landing, ~0% CPU - leaving a skeleton
      // browser directory. It is not a lock and not slowness; waiting does not
      // help, and bunx and npx behave identically. To run the suite anyway,
      // add `channel: "chrome"` here and use the installed Google Chrome.
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--enable-unsafe-webgpu",
            "--enable-features=Vulkan",
          ],
        },
      },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
