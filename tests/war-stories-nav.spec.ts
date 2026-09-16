import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { withoutContainedErrors } from "./contained-errors";

type Viewport = { width: number; height: number };

type ConsoleEvent = {
  ts: string;
  type: string;
  text: string;
  location: {
    url?: string;
    lineNumber?: number;
    columnNumber?: number;
  };
};

type RequestFailureEvent = {
  ts: string;
  url: string;
  method: string;
  errorText: string | null;
};

const STATIC_SPEC_EVOLUTION_PATH =
  "/how-it-was-built/visualization_of_the_evolution_of_the_frankentui_specs_document_from_inception.html";

function getDiagnosticsLogPath() {
  const diagnosticsDir = path.join(process.cwd(), "test-results", "logs");
  mkdirSync(diagnosticsDir, { recursive: true });
  return path.join(diagnosticsDir, "spec-evolution-static-e2e.jsonl");
}

function appendDiagnosticsRecord(record: Record<string, unknown>) {
  appendFileSync(getDiagnosticsLogPath(), `${JSON.stringify(record)}\n`, "utf8");
}

async function runStaticSpecEvolutionSmoke(
  page: Page,
  testInfo: TestInfo,
  viewport: Viewport,
  viewportName: "desktop" | "mobile"
) {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3100";
  const url = `${baseUrl}${STATIC_SPEC_EVOLUTION_PATH}`;
  const runId = `spec-evolution-static-${viewportName}-retry${testInfo.retry}`;
  const startedAt = Date.now();

  let domContentLoadedMs: number | null = null;
  let loadMs: number | null = null;
  let bootstrapMs: number | null = null;

  const consoleEvents: ConsoleEvent[] = [];
  const pageErrors: string[] = [];
  const requestFailures: RequestFailureEvent[] = [];

  page.on("domcontentloaded", () => {
    if (domContentLoadedMs === null) {
      domContentLoadedMs = Date.now() - startedAt;
    }
  });

  page.on("load", () => {
    if (loadMs === null) {
      loadMs = Date.now() - startedAt;
    }
  });

  page.on("console", (msg) => {
    consoleEvents.push({
      ts: new Date().toISOString(),
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
    });
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  page.on("requestfailed", (request) => {
    requestFailures.push({
      ts: new Date().toISOString(),
      url: request.url(),
      method: request.method(),
      errorText: request.failure()?.errorText ?? null,
    });
  });

  let status: "passed" | "failed" = "passed";
  let failureReason: string | null = null;
  let failureScreenshotPath: string | null = null;

  await page.setViewportSize(viewport);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    await expect
      .poll(() => page.locator("#commitList [data-commit-idx]").count(), {
        timeout: 60_000,
      })
      .toBeGreaterThan(0);

    bootstrapMs = Date.now() - startedAt;

    const targetCommitIndex = await page.evaluate(() => {
      const datasetEl = document.getElementById("dataset");
      if (!datasetEl?.textContent) return null;

      const dataset = JSON.parse(datasetEl.textContent) as {
        commits: Array<{
          files?: Array<{ content?: string }>;
          review?: { groups?: Array<{ buckets?: number[] }> };
        }>;
      };

      const tableRegex = /\n\|.+\|\n\|[:\-\s|]+\|/;

      for (let idx = 0; idx < dataset.commits.length; idx++) {
        const commit = dataset.commits[idx];
        const hasMarkdownTable = (commit.files ?? []).some(
          (file) => typeof file.content === "string" && tableRegex.test(file.content)
        );
        const hasBucketReview = (commit.review?.groups ?? []).some(
          (group) => Array.isArray(group.buckets) && group.buckets.length > 0
        );

        if (hasMarkdownTable && hasBucketReview) {
          return idx;
        }
      }

      return null;
    });

    expect(targetCommitIndex).not.toBeNull();
    const commitIndex = targetCommitIndex as number;

    // Drive commit selection through the scrubber so behavior is consistent on
    // desktop and mobile layouts (where commit list visibility differs).
    await page.evaluate((idx) => {
      const scrubber = document.getElementById("scrubber") as HTMLInputElement | null;
      if (!scrubber) return;
      scrubber.value = String(idx);
      scrubber.dispatchEvent(new Event("input", { bubbles: true }));
      scrubber.dispatchEvent(new Event("change", { bubbles: true }));
    }, commitIndex);

    await page.locator('[data-tab="diff"]').click();
    await expect
      .poll(() => page.locator("#diffTarget .d2h-file-wrapper, #diffTarget .d2h-file-diff").count(), {
        timeout: 60_000,
      })
      .toBeGreaterThan(0);

    await page.locator('[data-tab="snapshot"]').click();
    await expect(page.locator("#snapshotTarget")).toBeVisible();
    await expect
      .poll(() => page.locator("#snapshotTarget table").count(), {
        timeout: 30_000,
      })
      .toBeGreaterThan(0);

    if (viewportName === "mobile") {
      const mobileSnapshotTableState = await page.evaluate(() => {
        const table = document.querySelector<HTMLTableElement>("#snapshotTarget table");
        const firstBodyCell = table?.querySelector("tbody td");
        return {
          hasTable: !!table,
          hasEnhancedClass: !!table?.classList.contains("bv-table"),
          hasDataLabel: !!firstBodyCell?.hasAttribute("data-label"),
        };
      });

      expect(mobileSnapshotTableState.hasTable).toBe(true);
      expect(
        mobileSnapshotTableState.hasDataLabel || mobileSnapshotTableState.hasEnhancedClass
      ).toBe(true);
    }

    await page.locator('[data-tab="ledger"]').click();
    await expect(page.locator("#ledgerTarget")).toBeVisible();
    await expect
      .poll(() => page.locator("#ledgerTarget .bucketChip").count(), {
        timeout: 30_000,
      })
      .toBeGreaterThan(0);

    await page.locator("#ledgerTarget .bucketChip").first().click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const dialog = document.getElementById("bucketInfoDialog") as HTMLDialogElement | null;
          return dialog?.open ?? false;
        })
      )
      .toBe(true);
    await page.locator('#bucketInfoDialog [data-close="bucketInfoDialog"]').click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const dialog = document.getElementById("bucketInfoDialog") as HTMLDialogElement | null;
          return dialog?.open ?? false;
        })
      )
      .toBe(false);

    await page.locator('[data-tab="files"]').click();
    await expect(page.locator("#filesTarget")).toBeVisible();
    await expect
      .poll(() => page.locator("#filesTarget > div").count(), {
        timeout: 30_000,
      })
      .toBeGreaterThan(0);

    const consoleErrors = consoleEvents.filter((event) => event.type === "error");

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(requestFailures).toEqual([]);
  } catch (error) {
    status = "failed";
    failureReason = error instanceof Error ? error.message : String(error);
    failureScreenshotPath = testInfo.outputPath(`spec-evolution-static-${viewportName}-failure.png`);
    if (!page.isClosed()) {
      try {
        await page.screenshot({ path: failureScreenshotPath, fullPage: true });
      } catch {
        failureScreenshotPath = null;
      }
    } else {
      failureScreenshotPath = null;
    }
    throw error;
  } finally {
    appendDiagnosticsRecord({
      run_id: runId,
      timestamp: new Date().toISOString(),
      test_title: testInfo.title,
      viewport: { name: viewportName, ...viewport },
      url,
      timings_ms: {
        domcontentloaded: domContentLoadedMs,
        load: loadMs,
        bootstrap: bootstrapMs,
        total: Date.now() - startedAt,
      },
      deterministic_mode: true,
      env: {
        base_url: baseUrl,
        ci: process.env.CI ?? null,
        node: process.version,
      },
      console_events: consoleEvents,
      page_errors: pageErrors,
      request_failures: requestFailures,
      status,
      failure_reason: failureReason,
      failure_screenshot: failureScreenshotPath,
    });
  }
}

test("navbar: /architecture -> /how-it-was-built renders without refresh", async ({ page }) => {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3100";

  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto(`${baseUrl}/architecture`, { waitUntil: "domcontentloaded" });
  // Historically this navigation failed when leaving the page while scrolled.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(250);

  await page.locator("header").first().getByRole("link", { name: "Built in 5 Days" }).click();

  await expect(page).toHaveURL(/\/how-it-was-built\/?$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /built\s+in/i }).first()
  ).toBeVisible();
  // Guard against the historical failure mode: URL changes but you're still scrolled to "nowhere",
  // making the page look blank until a refresh resets scroll.
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(200);

  // If navigation "silently fails" due to a runtime exception, this will catch
  // it. Errors an ErrorBoundary announced it had caught are not that: the
  // homepage's tweet embeds throw on a malformed syndication payload and are
  // contained by design, and the engines word that throw differently.
  expect(withoutContainedErrors(errors.map((text) => ({ text })))).toEqual([]);
});

test("spec evolution lab: loads and renders core UI without console errors", async ({ page }) => {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3100";

  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto(`${baseUrl}/how-it-was-built/spec-evolution-lab`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /spec evolution lab/i }).first()).toBeVisible();

  // This heading only appears after the dataset is loaded and the main UI is rendered.
  await expect(
    page.getByRole("heading", { name: /Scrub_Node_Selector/i })
  ).toBeVisible({ timeout: 20_000 });

  // Basic interaction: verify the forensic inspector section rendered.
  await expect(
    page.getByRole("heading", { name: /Forensics_Inspector/i })
  ).toBeVisible();

  expect(errors).toEqual([]);
});

test("spec evolution static html: desktop smoke + diagnostics logging", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await runStaticSpecEvolutionSmoke(page, testInfo, { width: 1440, height: 900 }, "desktop");
});

test("spec evolution static html: mobile smoke + diagnostics logging", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await runStaticSpecEvolutionSmoke(page, testInfo, { width: 390, height: 844 }, "mobile");
});
