import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { test, expect, type Page, type TestInfo } from "@playwright/test";

function getDiagnosticsLogPath() {
  const diagnosticsDir = path.join(process.cwd(), "test-results", "logs");
  mkdirSync(diagnosticsDir, { recursive: true });
  return path.join(diagnosticsDir, "spec-evolution-perf.jsonl");
}

function appendDiagnosticsRecord(record: Record<string, unknown>) {
  appendFileSync(getDiagnosticsLogPath(), `${JSON.stringify(record)}\n`, "utf8");
}

async function loadLabAndWaitForData(page: Page) {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3100";
  await page.goto(`${baseUrl}/how-it-was-built/spec-evolution-lab`, {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByRole("heading", { name: /Scrub_Node_Selector/i })
  ).toBeVisible({ timeout: 30_000 });
}

test.describe("spec evolution lab: performance", () => {
  test.setTimeout(90_000);

  test("scrubbing commits stays responsive (no >2s long tasks)", async ({ page }, testInfo) => {
    const startedAt = Date.now();
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    // Measure long tasks during rapid scrubbing
    const longTaskDurations: number[] = await page.evaluate(() => {
      return new Promise<number[]>((resolve) => {
        const durations: number[] = [];
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            durations.push(entry.duration);
          }
        });
        observer.observe({ type: "longtask", buffered: true });

        // Store for later retrieval
        (window as Record<string, unknown>).__perfLongTasks = durations;
        (window as Record<string, unknown>).__perfObserver = observer;

        // Resolve immediately; we'll collect after scrubbing
        resolve(durations);
      });
    });

    // Rapidly scrub through 10 commits using Next Node button
    const nextBtn = page.getByTitle("Next Node");
    const scrubStart = Date.now();

    for (let i = 0; i < 10; i++) {
      await nextBtn.click();
      // Small pause to allow rendering
      await page.waitForTimeout(100);
    }

    const scrubDurationMs = Date.now() - scrubStart;

    // Collect long task data
    const taskData = await page.evaluate(() => {
      const durations = (window as Record<string, unknown>).__perfLongTasks as number[];
      const observer = (window as Record<string, unknown>).__perfObserver as PerformanceObserver;
      observer?.disconnect();
      return {
        count: durations.length,
        maxMs: durations.length > 0 ? Math.max(...durations) : 0,
        totalMs: durations.reduce((sum, d) => sum + d, 0),
        durations: durations.slice(0, 20), // keep first 20 for diagnostics
      };
    });

    // Also measure tab switching performance
    const tabSwitchTimings: { tab: string; ms: number }[] = [];

    for (const tabName of ["MD_Snapshot", "Raw_Archive", "Evidence_Ledger", "Changed_Nodes", "Diff_Stream"]) {
      const tab = page.getByRole("button", { name: new RegExp(tabName, "i") }).first();
      const t0 = Date.now();
      await tab.click();
      // Wait for content to appear
      await page.waitForTimeout(300);
      tabSwitchTimings.push({ tab: tabName, ms: Date.now() - t0 });
    }

    // Assertions
    // No individual long task should exceed 2000ms
    expect(taskData.maxMs).toBeLessThan(2000);

    // Scrubbing 10 commits should complete within 8 seconds
    expect(scrubDurationMs).toBeLessThan(8000);

    // No page errors
    expect(pageErrors).toEqual([]);

    // Diagnostics
    appendDiagnosticsRecord({
      run_id: `perf-scrubbing-retry${testInfo.retry}`,
      timestamp: new Date().toISOString(),
      test_title: testInfo.title,
      timings_ms: {
        total: Date.now() - startedAt,
        scrub_10_commits: scrubDurationMs,
      },
      long_tasks: taskData,
      tab_switch_timings: tabSwitchTimings,
      env: {
        base_url: process.env.BASE_URL ?? "http://localhost:3100",
        ci: process.env.CI ?? null,
        node: process.version,
      },
      status: "passed",
    });
  });

  test("tab lazy rendering: snapshot tab does not pre-compute markdown", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    // On the diff tab (default), check that no markdown-rendered content is visible.
    // The MarkdownView component renders inside a container with dangerouslySetInnerHTML
    // that has a max-h-[72vh] class. We look for the rendered markdown heading pattern.
    const snapshotHeading = page.locator("h1:has-text('FrankenTUI Spec Corpus')");
    await expect(snapshotHeading).not.toBeVisible();

    // Switch to snapshot tab
    await page.getByRole("button", { name: /MD_Snapshot/i }).first().click();

    // Now the snapshot markdown should render (heading visible once marked parses)
    await expect(snapshotHeading.first()).toBeVisible({ timeout: 15_000 });

    // Switch back to diff tab
    await page.getByRole("button", { name: /Diff_Stream/i }).first().click();
    await page.waitForTimeout(500);

    // Snapshot heading should be gone (lazy rendering removes it)
    await expect(snapshotHeading).not.toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test("mobile viewport: commit list renders without jank", async ({ page }, testInfo) => {
    const startedAt = Date.now();
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.setViewportSize({ width: 390, height: 844 });
    await loadLabAndWaitForData(page);

    // Rapid scrubbing on mobile
    const nextBtn = page.getByTitle("Next Node");
    const scrubStart = Date.now();

    for (let i = 0; i < 5; i++) {
      await nextBtn.click();
      await page.waitForTimeout(150);
    }

    const scrubDurationMs = Date.now() - scrubStart;

    // Mobile scrubbing should also be responsive
    expect(scrubDurationMs).toBeLessThan(6000);
    expect(pageErrors).toEqual([]);

    appendDiagnosticsRecord({
      run_id: `perf-mobile-scrub-retry${testInfo.retry}`,
      timestamp: new Date().toISOString(),
      test_title: testInfo.title,
      timings_ms: {
        total: Date.now() - startedAt,
        scrub_5_commits_mobile: scrubDurationMs,
      },
      viewport: { width: 390, height: 844 },
      env: {
        base_url: process.env.BASE_URL ?? "http://localhost:3100",
        ci: process.env.CI ?? null,
        node: process.version,
      },
      status: "passed",
    });
  });
});
