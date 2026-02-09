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

test.describe("spec evolution lab: a11y + mobile polish", () => {
  test.setTimeout(60_000);

  test("tab bar has proper ARIA roles", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    // Tab list should have role="tablist"
    const tablist = page.getByRole("tablist", { name: /Inspector view tabs/i });
    await expect(tablist).toBeVisible({ timeout: 5_000 });

    // Tabs should have role="tab" and aria-selected
    const tabs = tablist.getByRole("tab");
    const tabCount = await tabs.count();
    expect(tabCount).toBe(5);

    // First tab (Diff_Stream) should be selected by default
    const firstTab = tabs.first();
    await expect(firstTab).toHaveAttribute("aria-selected", "true");

    // Other tabs should not be selected
    const secondTab = tabs.nth(1);
    await expect(secondTab).toHaveAttribute("aria-selected", "false");

    expect(pageErrors).toEqual([]);
  });

  test("clicking a tab updates aria-selected and panel", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    const tablist = page.getByRole("tablist", { name: /Inspector view tabs/i });
    const tabs = tablist.getByRole("tab");

    // Click the "MD_Snapshot" tab (second tab)
    const snapshotTab = tabs.nth(1);
    await snapshotTab.click();
    await expect(snapshotTab).toHaveAttribute("aria-selected", "true");

    // First tab should no longer be selected
    const firstTab = tabs.first();
    await expect(firstTab).toHaveAttribute("aria-selected", "false");

    // Tab panel should be present
    const panel = page.locator("[role='tabpanel']");
    await expect(panel).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test("dialog opens and closes with Esc", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    // Find the help/keyboard button and click it
    const helpBtn = page.getByRole("button", { name: /keyboard/i }).first();
    if (await helpBtn.isVisible()) {
      await helpBtn.click();

      // Dialog should be visible
      const dialog = page.locator("dialog[open]");
      await expect(dialog).toBeVisible({ timeout: 3_000 });

      // Dialog should have aria-label
      await expect(dialog).toHaveAttribute("aria-label");

      // Close button should have aria-label
      const closeBtn = dialog.getByRole("button", { name: /close/i });
      await expect(closeBtn).toBeVisible();

      // Pressing Escape should close dialog
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
    }

    expect(pageErrors).toEqual([]);
  });

  test("navigation buttons have accessible labels", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    // Previous/Next buttons should have aria-labels
    const prevBtn = page.getByRole("button", { name: /previous commit/i });
    await expect(prevBtn).toBeVisible({ timeout: 5_000 });

    const nextBtn = page.getByRole("button", { name: /next commit/i });
    await expect(nextBtn).toBeVisible();

    // Commit counter should have aria-live for screen reader updates
    const counter = page.locator("[aria-live='polite']").first();
    await expect(counter).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test("playback controls have accessible labels", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    // Play button should have aria-label
    const playBtn = page.getByTestId("playback-toggle");
    if (await playBtn.isVisible()) {
      await expect(playBtn).toHaveAttribute("aria-label", "Play through commits");

      // Start playback
      await playBtn.click();
      await expect(playBtn).toHaveAttribute("aria-label", "Pause playback");

      // Stop playback
      await playBtn.click();
    }

    // Speed button should have aria-label
    const speedBtn = page.getByTestId("playback-speed");
    if (await speedBtn.isVisible()) {
      const ariaLabel = await speedBtn.getAttribute("aria-label");
      expect(ariaLabel).toContain("Playback speed");
    }

    expect(pageErrors).toEqual([]);
  });

  test("timeline mini-map is keyboard navigable", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    const slider = page.getByRole("slider", { name: /Timeline mini-map/i });
    await expect(slider).toBeVisible({ timeout: 5_000 });

    // Should have proper ARIA attributes
    await expect(slider).toHaveAttribute("aria-valuemin", "0");
    const valueNow = await slider.getAttribute("aria-valuenow");
    expect(parseInt(valueNow || "0")).toBeGreaterThanOrEqual(0);

    // Focus the slider
    await slider.focus();

    // Press ArrowRight to advance
    const initialValue = parseInt((await slider.getAttribute("aria-valuenow")) || "0");
    await page.keyboard.press("ArrowRight");

    // Value should have increased
    await page.waitForTimeout(100);
    const newValue = parseInt((await slider.getAttribute("aria-valuenow")) || "0");
    expect(newValue).toBeGreaterThan(initialValue);

    expect(pageErrors).toEqual([]);
  });

  test("mobile: no horizontal scrollbar", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await loadLabAndWaitForData(page);

    // Check if the page has horizontal scrollbar
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);

    expect(pageErrors).toEqual([]);
  });

  test("touch targets are at least 44px", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await loadLabAndWaitForData(page);

    // Check the navigation buttons
    const prevBtn = page.getByRole("button", { name: /previous commit/i });
    if (await prevBtn.isVisible()) {
      const box = await prevBtn.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }

    const nextBtn = page.getByRole("button", { name: /next commit/i });
    if (await nextBtn.isVisible()) {
      const box = await nextBtn.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }

    expect(pageErrors).toEqual([]);
  });
});
