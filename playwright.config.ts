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
    // 3100, not Next's default 3000: fifteen references across the specs
    // already hard-code `BASE_URL ?? "http://localhost:3100"`, so a config
    // default of 3000 meant no single local server could satisfy the suite.
    // Specs that navigate to relative paths through this baseURL went to 3000
    // while the rest went to 3100, and whichever server you started, the other
    // half failed with ERR_CONNECTION_REFUSED - which reads as a broken build
    // rather than a missing server.
    baseURL: process.env.BASE_URL || "http://localhost:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      // If `browserType.launch` says the executable is missing and
      // `playwright install chromium` never finishes: on some machines the
      // download completes and Playwright's own extractor then stalls mid-write
      // - open write handle, no bytes landing, ~0% CPU - leaving a skeleton
      // browser directory that looks installed. Waiting does not help and bunx
      // and npx stall alike. Only the extraction is broken, so do it by hand:
      //
      //   bunx playwright install --dry-run chromium   # prints url + location
      //   curl -fsSL -o /tmp/b.zip <download url>
      //   ditto -x -k /tmp/b.zip <install location>
      //   touch <install location>/INSTALLATION_COMPLETE
      //   touch <install location>/DEPENDENCIES_VALIDATED
      //
      // ditto unpacks the same archive in under a second. Repeat for the
      // headless shell, which is what a headless run actually launches.
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
