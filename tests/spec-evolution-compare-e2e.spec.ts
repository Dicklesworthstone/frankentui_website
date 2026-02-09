import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

type ConsoleEvent = {
  ts: string;
  type: string;
  text: string;
};

function getDiagnosticsLogPath() {
  const diagnosticsDir = path.join(process.cwd(), "test-results", "logs");
  mkdirSync(diagnosticsDir, { recursive: true });
  return path.join(diagnosticsDir, "spec-evolution-compare-e2e.jsonl");
}

function appendDiagnosticsRecord(record: Record<string, unknown>) {
  appendFileSync(getDiagnosticsLogPath(), `${JSON.stringify(record)}\n`, "utf8");
}

async function loadLabAndWaitForData(page: Page) {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3100";
  await page.goto(`${baseUrl}/how-it-was-built/spec-evolution-lab`, {
    waitUntil: "domcontentloaded",
  });

  // Wait for an element that only appears once data is loaded and the main UI renders.
  // "Scrub_Node_Selector" h2 is only present after dataset + commits + selectedCommit are ready.
  await expect(
    page.getByRole("heading", { name: /Scrub_Node_Selector/i })
  ).toBeVisible({ timeout: 30_000 });
}

test.describe("spec evolution lab: compare mode", () => {
  test.setTimeout(60_000);

  test("pin A, scrub B, verify metrics panel, swap, clear", async ({ page }, testInfo) => {
    const startedAt = Date.now();
    const consoleEvents: ConsoleEvent[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      consoleEvents.push({
        ts: new Date().toISOString(),
        type: msg.type(),
        text: msg.text(),
      });
    });
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    // --- Step 1: Verify PIN_AS_A button is visible ---
    const pinABtn = page.getByTestId("compare-pin-a");
    await expect(pinABtn).toBeVisible();

    // Capture B badge text (current commit) before pinning
    const bBadge = page.getByTestId("compare-b-badge");
    const initialCommitSHA = await bBadge.textContent();
    expect(initialCommitSHA).toBeTruthy();

    // --- Step 2: Pin current commit as A ---
    await pinABtn.click();

    // PIN_AS_A should disappear, replaced by SWAP and CLEAR
    await expect(pinABtn).not.toBeVisible();
    await expect(page.getByTestId("compare-swap")).toBeVisible();
    await expect(page.getByTestId("compare-clear-a")).toBeVisible();

    // A badge should now show the pinned commit SHA
    const aBadge = page.getByTestId("compare-a-badge");
    await expect(aBadge).toBeVisible();
    const pinnedSHA = await aBadge.textContent();
    expect(pinnedSHA?.trim()).toBe(initialCommitSHA?.trim());

    // --- Step 3: Navigate to a different commit (scrub B) ---
    // Use the "Next Node" button (ArrowRight) to move forward
    const nextBtn = page.getByTitle("Next Node");
    await nextBtn.click();

    // Wait for the B badge to update to a different SHA
    await expect.poll(async () => {
      const text = await bBadge.textContent();
      return text?.trim() !== initialCommitSHA?.trim();
    }, { timeout: 5_000 }).toBe(true);

    const newBSHA = await bBadge.textContent();
    expect(newBSHA).toBeTruthy();
    expect(newBSHA?.trim()).not.toBe(pinnedSHA?.trim());

    // --- Step 4: Verify compare metrics panel appears ---
    const metricsPanel = page.getByTestId("compare-metrics");
    await expect(metricsPanel).toBeVisible({ timeout: 5_000 });

    // Verify metrics panel shows COMPARE_MODE text
    await expect(metricsPanel.getByText("COMPARE_MODE")).toBeVisible();

    // Verify A→B labels with correct SHAs
    await expect(metricsPanel.getByText(`A ${pinnedSHA?.trim()}`)).toBeVisible();
    await expect(metricsPanel.getByText(`B ${newBSHA?.trim()}`)).toBeVisible();

    // Verify delta metrics are present (Δ_LINES and Δ_BYTES)
    await expect(metricsPanel.getByText("Δ_LINES")).toBeVisible();
    await expect(metricsPanel.getByText("Δ_BYTES")).toBeVisible();

    // --- Step 5: Swap A↔B ---
    const swapBtn = page.getByTestId("compare-swap");
    await swapBtn.click();

    // After swap: old B becomes new A, old A becomes new B
    await expect.poll(async () => {
      const aText = await aBadge.textContent();
      return aText?.trim();
    }, { timeout: 5_000 }).toBe(newBSHA?.trim());

    // --- Step 6: Clear compare mode ---
    const clearBtn = page.getByTestId("compare-clear-a");
    await clearBtn.click();

    // Metrics panel should disappear
    await expect(metricsPanel).not.toBeVisible();

    // A badge should disappear
    await expect(aBadge).not.toBeVisible();

    // PIN_AS_A button should reappear
    await expect(pinABtn).toBeVisible();

    // --- Step 7: Verify no console errors ---
    const consoleErrors = consoleEvents.filter((e) => e.type === "error");
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);

    // --- Diagnostics ---
    appendDiagnosticsRecord({
      run_id: `compare-mode-e2e-retry${testInfo.retry}`,
      timestamp: new Date().toISOString(),
      test_title: testInfo.title,
      timings_ms: { total: Date.now() - startedAt },
      env: {
        base_url: process.env.BASE_URL ?? "http://localhost:3100",
        ci: process.env.CI ?? null,
        node: process.version,
      },
      console_events: consoleEvents,
      page_errors: pageErrors,
      status: "passed",
    });
  });

  test("compare mode shows file summary in files tab", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    // Pin current commit as A
    await page.getByTestId("compare-pin-a").click();

    // Navigate forward to get a different B
    await page.getByTitle("Next Node").click();
    await expect(page.getByTestId("compare-metrics")).toBeVisible({ timeout: 5_000 });

    // Switch to Files tab (labeled "Changed_Nodes" in the UI)
    const filesTab = page.getByRole("tab", { name: /Changed_Nodes/i }).first();
    await filesTab.click();

    // The compare file summary should appear
    const fileSummary = page.getByTestId("compare-file-summary");
    await expect(fileSummary).toBeVisible({ timeout: 10_000 });

    // Verify no page errors
    expect(pageErrors).toEqual([]);
  });
});

test.describe("spec evolution lab: deep-linkable state", () => {
  test.setTimeout(60_000);

  test("URL hash updates on state change and restores on reload", async ({ page }) => {
    const baseUrl = process.env.BASE_URL ?? "http://localhost:3100";
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto(`${baseUrl}/how-it-was-built/spec-evolution-lab`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", { name: /Scrub_Node_Selector/i })
    ).toBeVisible({ timeout: 30_000 });

    // Navigate to a different commit
    await page.getByTitle("Next Node").click();
    await page.waitForTimeout(500);

    // Switch to snapshot tab
    const snapshotTab = page.getByRole("tab", { name: /MD_Snapshot/i }).first();
    await snapshotTab.click();
    await page.waitForTimeout(500);

    // Read the current URL hash
    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).toContain("tab=snapshot");
    expect(hash).toContain("c=");

    // Extract the commit SHA from hash
    const commitSHA = new URLSearchParams(hash.slice(1)).get("c");
    expect(commitSHA).toBeTruthy();

    // Reload with the same hash - should restore state
    await page.goto(`${baseUrl}/how-it-was-built/spec-evolution-lab${hash}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", { name: /Scrub_Node_Selector/i })
    ).toBeVisible({ timeout: 30_000 });

    // Verify the commit SHA is restored in the B badge
    const bBadge = page.getByTestId("compare-b-badge");
    await expect(bBadge).toHaveText(commitSHA!, { timeout: 5_000 });

    // Verify no page errors
    expect(pageErrors).toEqual([]);
  });

  test("invalid hash does not crash the page", async ({ page }) => {
    const baseUrl = process.env.BASE_URL ?? "http://localhost:3100";
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    // Load with a completely invalid hash
    await page.goto(
      `${baseUrl}/how-it-was-built/spec-evolution-lab#c=INVALID&tab=nope&b=999&ro=banana`,
      { waitUntil: "domcontentloaded" }
    );

    // Should still load successfully (invalid values are ignored/clamped)
    await expect(
      page.getByRole("heading", { name: /Scrub_Node_Selector/i })
    ).toBeVisible({ timeout: 30_000 });

    expect(pageErrors).toEqual([]);
  });
});
