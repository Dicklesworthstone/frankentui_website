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

test.describe("spec evolution lab: timeline mini-map + playback", () => {
  test.setTimeout(60_000);

  test("timeline mini-map is visible", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    const timeline = page.getByTestId("timeline-minimap");
    await expect(timeline).toBeVisible({ timeout: 5_000 });

    // Should show the TIMELINE_MAP label
    await expect(timeline).toContainText("TIMELINE_MAP");

    // Should show legend items
    await expect(timeline).toContainText("unreviewed");
    await expect(timeline).toContainText("reviewed");
    await expect(timeline).toContainText("selected");

    expect(pageErrors).toEqual([]);
  });

  test("play/pause button toggles playback state", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    const playBtn = page.getByTestId("playback-toggle");
    await expect(playBtn).toBeVisible({ timeout: 5_000 });

    // Initially should show Play icon (not paused)
    await expect(playBtn).toHaveAttribute("title", "Play through commits");

    // Click to start playback
    await playBtn.click();
    await expect(playBtn).toHaveAttribute("title", "Pause playback");

    // Click to pause
    await playBtn.click();
    await expect(playBtn).toHaveAttribute("title", "Play through commits");

    expect(pageErrors).toEqual([]);
  });

  test("playback advances commit index", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    // Read initial commit counter (should be "1 / N")
    const counter = page.locator(".font-mono.text-green-400").filter({ hasText: "/" }).first();
    const initialText = await counter.textContent();
    expect(initialText).toBeTruthy();
    const initialNum = parseInt(initialText!.split("/")[0].trim(), 10);

    // Start playback at 2x speed for faster test
    const speedBtn = page.getByTestId("playback-speed");
    // Cycle to 2x: default is 1x -> click once for 2x
    await speedBtn.click();
    await expect(speedBtn).toHaveText("2x");

    // Start playback
    const playBtn = page.getByTestId("playback-toggle");
    await playBtn.click();

    // Wait for at least one commit advance (300ms at 2x)
    await page.waitForTimeout(1000);

    // Pause
    await playBtn.click();

    // Read new commit counter
    const newText = await counter.textContent();
    const newNum = parseInt(newText!.split("/")[0].trim(), 10);

    // Should have advanced at least one commit
    expect(newNum).toBeGreaterThan(initialNum);

    expect(pageErrors).toEqual([]);
  });

  test("speed button cycles through speeds", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    const speedBtn = page.getByTestId("playback-speed");
    await expect(speedBtn).toBeVisible({ timeout: 5_000 });

    // Default is 1x
    await expect(speedBtn).toHaveText("1x");

    // Click to cycle: 1x -> 2x
    await speedBtn.click();
    await expect(speedBtn).toHaveText("2x");

    // 2x -> 0.25x
    await speedBtn.click();
    await expect(speedBtn).toHaveText("0.25x");

    // 0.25x -> 0.5x
    await speedBtn.click();
    await expect(speedBtn).toHaveText("0.5x");

    // 0.5x -> 1x (full cycle)
    await speedBtn.click();
    await expect(speedBtn).toHaveText("1x");

    expect(pageErrors).toEqual([]);
  });

  test("clicking timeline bar navigates to commit", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await loadLabAndWaitForData(page);

    const timeline = page.getByTestId("timeline-minimap");
    await expect(timeline).toBeVisible({ timeout: 5_000 });

    // Get the slider area (the one with role="slider")
    const slider = timeline.getByRole("slider");
    await expect(slider).toBeVisible();

    // Read initial index
    const counter = page.locator(".font-mono.text-green-400").filter({ hasText: "/" }).first();
    const initialText = await counter.textContent();
    const initialNum = parseInt(initialText!.split("/")[0].trim(), 10);

    // Click near the end of the slider (80% position)
    const box = await slider.boundingBox();
    expect(box).toBeTruthy();
    await slider.click({ position: { x: box!.width * 0.8, y: box!.height / 2 } });

    // Counter should change
    await page.waitForTimeout(200);
    const newText = await counter.textContent();
    const newNum = parseInt(newText!.split("/")[0].trim(), 10);

    // Clicking near 80% of the timeline should give a commit index > 1
    expect(newNum).toBeGreaterThan(1);

    expect(pageErrors).toEqual([]);
  });
});
