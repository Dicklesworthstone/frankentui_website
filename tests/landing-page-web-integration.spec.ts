import { expect, type Page, test } from "@playwright/test";

/**
 * E2E tests: Homepage /web live demo integration.
 *
 * Verifies the homepage correctly features the /web live demo
 * with hero CTA, browser section, comparison table, and navigation.
 *
 * Created as part of bd-2b4.5.
 */

test.describe("Homepage /web integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  // ── (A) Hero Section ─────────────────────────────────────────────

  test("hero has 'Try Live Demo' CTA linking to /web", async ({ page }) => {
    const cta = page.locator("header a[href='/web'], header a[href*='/web']").first();
    await expect(cta).toBeVisible();
    await expect(cta).toContainText(/try.*live.*demo|live.*demo/i);
  });

  test("hero CTA is above the fold on desktop", async ({ page }) => {
    const cta = page.locator("a[href='/web']").first();
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    expect(box).toBeTruthy();
    // Should be within the first viewport height (approx 900px)
    expect(box!.y).toBeLessThan(1000);
  });

  test("hero mentions browser rendering", async ({ page }) => {
    // There is no #hero on this page, so the old selector fell through to
    // <header> - the nav bar - which says none of these words. Look in the
    // first section of the page body, where the hero copy actually lives.
    const hero = page.locator("main section").first();
    const browserStat = hero.locator("text=/browser|60.*fps|wasm/i").first();
    await expect(browserStat).toBeVisible({ timeout: 5000 });
  });

  // ── (B) Browser Section ──────────────────────────────────────────

  // `[id*='browser']` also matches `feature-title-browser-native`, a feature
  // card that sorts earlier in the DOM, so `.first()` was picking a heading
  // instead of the section: "section exists" passed against the wrong element
  // while the two tests below failed on it. The section's id is `browser`.
  const browserSection = (page: Page) => page.locator("section#browser");

  test("'Works in Browser' section exists", async ({ page }) => {
    await expect(browserSection(page)).toBeVisible();
  });

  test("browser section contains WASM/WebGPU content", async ({ page }) => {
    const section = browserSection(page);
    const text = await section.textContent();
    expect(text).toBeTruthy();
    const content = text!.toLowerCase();
    // Should mention at least two of: wasm, webgpu, 60fps
    const mentions = [
      content.includes("wasm"),
      content.includes("webgpu"),
      content.includes("60"),
    ].filter(Boolean).length;
    expect(mentions).toBeGreaterThanOrEqual(2);
  });

  test("browser section has CTA linking to /web", async ({ page }) => {
    const cta = browserSection(page).locator("a[href='/web']");
    await expect(cta.first()).toBeVisible();
  });

  // ── (C) Comparison Content ───────────────────────────────────────

  test("comparison table includes FrankenTUI vs xterm.js", async ({ page }) => {
    // Look for a table or grid with comparison data
    const table = page.locator("table, [role='table']").first();
    await expect(table).toBeVisible({ timeout: 10000 });

    const tableText = await table.textContent();
    expect(tableText).toBeTruthy();
    const content = tableText!.toLowerCase();
    expect(content).toContain("frankentui");
    expect(content).toContain("xterm");
  });

  test("comparison data shows FrankenTUI advantages", async ({ page }) => {
    const table = page.locator("table, [role='table']").first();
    await expect(table).toBeVisible({ timeout: 10000 });

    // Should contain some metrics like rendering, GPU, etc.
    const tableText = await table.textContent();
    const content = tableText!.toLowerCase();
    const hasMetrics =
      content.includes("gpu") || content.includes("render") || content.includes("webgpu");
    expect(hasMetrics).toBeTruthy();
  });

  // ── (D) Feature Cards ───────────────────────────────────────────

  test("features include browser/WASM capability", async ({ page }) => {
    // Look for a feature card mentioning browser or WASM
    const featureCards = page.locator("[class*='glass'], [class*='card']");
    const allText = await featureCards.allTextContents();
    const combinedText = allText.join(" ").toLowerCase();
    const hasBrowserFeature = combinedText.includes("browser") || combinedText.includes("wasm");
    expect(hasBrowserFeature).toBeTruthy();
  });

  // ── (E) Navigation ──────────────────────────────────────────────

  test("nav has Live Demo link", async ({ page }) => {
    const nav = page.locator("nav, header");
    const demoLink = nav.locator("a[href='/web']").first();
    await expect(demoLink).toBeVisible();
  });

  test("clicking Live Demo nav link navigates to /web", async ({ page }) => {
    const nav = page.locator("nav, header");
    const demoLink = nav.locator("a[href='/web']").first();
    await expect(demoLink).toBeVisible();

    // Click and verify navigation
    await demoLink.click();
    await page.waitForURL("**/web**", { timeout: 10000 });
    expect(page.url()).toContain("/web");
  });
});
