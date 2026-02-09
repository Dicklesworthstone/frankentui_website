import { test, expect, type Page } from "@playwright/test";

async function loadLabAndWaitForData(page: Page) {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3100";
  await page.goto(`${baseUrl}/how-it-was-built/spec-evolution-lab`, {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByRole("heading", { name: /Scrub_Node_Selector/i })
  ).toBeVisible({ timeout: 30_000 });
}

test.describe("spec evolution lab: full-text search", () => {
  test.setTimeout(60_000);

  test("this-commit search finds text and shows results", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    // Type a search term in the search bar (desktop)
    const searchInput = page.locator("#specLabSearch");
    await searchInput.fill("FrankenTUI");

    // Wait for search results to appear
    const resultsTray = page.getByTestId("search-results-tray");
    await expect(resultsTray).toBeVisible({ timeout: 5_000 });

    // Should have at least one result
    const resultItems = page.getByTestId("search-result-item");
    await expect.poll(() => resultItems.count(), { timeout: 5_000 }).toBeGreaterThan(0);

    // Verify result item contains the search term
    const firstResult = resultItems.first();
    await expect(firstResult).toContainText("FrankenTUI");

    expect(pageErrors).toEqual([]);
  });

  test("clicking a search result navigates to commit and snapshot tab", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    // Search for a term
    const searchInput = page.locator("#specLabSearch");
    await searchInput.fill("FrankenTUI");

    const resultsTray = page.getByTestId("search-results-tray");
    await expect(resultsTray).toBeVisible({ timeout: 5_000 });

    // Get the commit SHA from the first result
    const firstResult = page.getByTestId("search-result-item").first();
    const resultText = await firstResult.textContent();
    expect(resultText).toBeTruthy();

    // Click the result
    await firstResult.click();

    // Results tray should close
    await expect(resultsTray).not.toBeVisible();

    // Should be on snapshot tab now
    const snapshotTab = page.getByRole("tab", { name: /MD_Snapshot/i }).first();
    // The active tab has a green glow styling
    await expect(snapshotTab).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test("scope toggle switches between THIS and ALL modes", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    const scopeToggle = page.getByTestId("search-scope-toggle");
    await expect(scopeToggle).toBeVisible();

    // Initially should say "THIS"
    await expect(scopeToggle).toHaveText("THIS");

    // Click to switch to ALL
    await scopeToggle.click();
    await expect(scopeToggle).toHaveText("ALL");

    // Click again to switch back
    await scopeToggle.click();
    await expect(scopeToggle).toHaveText("THIS");

    expect(pageErrors).toEqual([]);
  });

  test("all-commits search finds term across multiple commits", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    // Switch to all-commits mode
    const scopeToggle = page.getByTestId("search-scope-toggle");
    await scopeToggle.click();
    await expect(scopeToggle).toHaveText("ALL");

    // Wait for indexing to start (give it a moment)
    await page.waitForTimeout(2000);

    // Search for a term likely in many commits
    const searchInput = page.locator("#specLabSearch");
    await searchInput.fill("spec");

    const resultsTray = page.getByTestId("search-results-tray");
    await expect(resultsTray).toBeVisible({ timeout: 10_000 });

    // Should find results from multiple commits
    const resultItems = page.getByTestId("search-result-item");
    await expect.poll(() => resultItems.count(), { timeout: 5_000 }).toBeGreaterThan(1);

    expect(pageErrors).toEqual([]);
  });

  test("escape key closes search results", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    const searchInput = page.locator("#specLabSearch");
    await searchInput.fill("FrankenTUI");

    const resultsTray = page.getByTestId("search-results-tray");
    await expect(resultsTray).toBeVisible({ timeout: 5_000 });

    // Press Escape
    await page.keyboard.press("Escape");
    await expect(resultsTray).not.toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test("clearing search query hides results", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    const searchInput = page.locator("#specLabSearch");
    await searchInput.fill("FrankenTUI");

    const resultsTray = page.getByTestId("search-results-tray");
    await expect(resultsTray).toBeVisible({ timeout: 5_000 });

    // Clear the search
    await searchInput.fill("");
    await expect(resultsTray).not.toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});
