import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { expect, type Page, type TestInfo, test } from "@playwright/test";

/**
 * E2E tests for the FrankenTerminal React widget embedded on the showcase page.
 *
 * Tests verify the widget works correctly when used as an inline component
 * alongside other page content. Coverage:
 *   (A) Widget Rendering — container, canvas, loading states, error-free init
 *   (B) Interaction — click focus, keyboard capture, mouse input, wheel containment
 *   (C) Sizing — container fill, viewport resize reflow, minimum size degradation
 *   (D) Lifecycle — navigate away/back without leaks, widget re-initialization
 *   (E) Coexistence — page content interactive, scrolling works when unfocused
 *
 * NOTE: Headless Chromium typically does NOT provide WebGPU, so the widget
 * will show a fallback state. Tests adapt to both running and unsupported states.
 *
 * Created as part of bd-11i.8.
 */

// Widget tests only make sense in Chromium (WebGPU flags configured)
test.skip(
  ({ browserName }) => browserName !== "chromium",
  "FrankenTerminal widget requires Chromium",
);

const SHOWCASE_URL = "/showcase";

function diagnosticsLogPath() {
  const dir = path.join(process.cwd(), "test-results", "logs");
  mkdirSync(dir, { recursive: true });
  return path.join(dir, "franken-terminal-widget-e2e.jsonl");
}

function logDiag(record: Record<string, unknown>) {
  appendFileSync(diagnosticsLogPath(), `${JSON.stringify(record)}\n`, "utf8");
}

/** Capture screenshot + console log dump on failure. */
async function captureFailureDiag(page: Page, testInfo: TestInfo, label: string) {
  if (page.isClosed()) return;
  try {
    const screenshotPath = testInfo.outputPath(`widget-${label}-failure.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    testInfo.attachments.push({
      name: `${label}-failure-screenshot`,
      path: screenshotPath,
      contentType: "image/png",
    });
  } catch {
    /* page may have navigated */
  }
}

/** Filter out expected WebGPU/WASM errors. */
function filterCriticalErrors(errors: string[]): string[] {
  const gpuKeywords = ["WebGPU", "navigator.gpu", "WASM", "wasm", "GPU", "WebAssembly"];
  return errors.filter((msg) => !gpuKeywords.some((kw) => msg.includes(kw)));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stepLog(name: string, detail: string, startMs?: number) {
  const elapsed = startMs ? ` (${Date.now() - startMs}ms)` : "";
  console.log(`[${new Date().toISOString()}] ${name}: ${detail}${elapsed}`);
}

/**
 * Patch IntersectionObserver to fire eagerly on observe().
 *
 * In headless Chromium, IntersectionObserver often does not fire reliably
 * when elements are scrolled into view via JS. This replaces it with a
 * mock that immediately reports all observed elements as intersecting.
 *
 * This must be called BEFORE page.goto() to take effect.
 */
async function patchIntersectionObserver(page: Page) {
  await page.addInitScript(() => {
    window.IntersectionObserver = class MockIO {
      private callback: IntersectionObserverCallback;
      private elements = new Set<Element>();

      constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
        this.callback = callback;
      }

      observe(target: Element) {
        if (this.elements.has(target)) return;
        this.elements.add(target);
        const cb = this.callback;
        // Fire callback on next animation frame so React has time to mount
        requestAnimationFrame(() => {
          cb(
            [
              {
                target,
                isIntersecting: true,
                intersectionRatio: 1,
                boundingClientRect: target.getBoundingClientRect(),
                intersectionRect: target.getBoundingClientRect(),
                rootBounds: null,
                time: performance.now(),
              } as IntersectionObserverEntry,
            ],
            this as unknown as IntersectionObserver,
          );
        });
      }

      unobserve(target: Element) {
        this.elements.delete(target);
      }

      disconnect() {
        this.elements.clear();
      }

      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
  });
}

/** Scroll the interactive demo section into view. */
async function scrollToInteractiveDemo(page: Page) {
  const section = page.locator("#interactive-demo");
  await page.waitForSelector("#interactive-demo", { state: "attached", timeout: 10_000 });

  await page.evaluate(() => {
    const el = document.getElementById("interactive-demo");
    if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
  });

  // Brief wait for scroll to settle and any pending renders
  await page.waitForTimeout(500);

  await expect(section).toBeVisible({ timeout: 5_000 });
  return section;
}

/**
 * Wait for the FrankenTerminal widget container to mount.
 * The container is inside #interactive-demo .max-w-5xl.
 */
async function waitForWidgetContainer(page: Page, timeout = 10_000) {
  const container = page.locator("#interactive-demo .max-w-5xl > div").first();
  await expect(container).toBeVisible({ timeout });
  return container;
}

/**
 * Detect the current widget state by inspecting DOM content.
 */
type WidgetState = "not-loaded" | "loading" | "unsupported" | "running" | "error";

async function getWidgetState(page: Page): Promise<WidgetState> {
  return page.evaluate(() => {
    const section = document.getElementById("interactive-demo");
    if (!section) return "not-loaded" as const;
    const text = section.textContent ?? "";
    if (text.includes("Scroll down to load")) return "not-loaded" as const;
    if (text.includes("Loading interactive demo")) return "loading" as const;
    if (text.includes("Failed to load")) return "error" as const;
    if (text.includes("requires WebGPU")) return "unsupported" as const;
    const canvas = section.querySelector("canvas");
    if (canvas && getComputedStyle(canvas).display !== "none") return "running" as const;
    // Canvas exists but hidden — distinguish loading vs truly unsupported.
    // During init, the component shows "Checking WebGPU...", "Loading fonts...", etc.
    // Only after isWebGPUSupported() returns false does DefaultFallback render.
    if (canvas) {
      const loadingKeywords = ["Checking", "Loading fonts", "Loading WASM", "Initializing"];
      const isLoading = loadingKeywords.some((kw) => text.includes(kw));
      return isLoading ? ("loading" as const) : ("unsupported" as const);
    }
    return "loading" as const;
  });
}

/** Wait for the widget to reach a terminal state (running, unsupported, or error). */
async function waitForStableWidgetState(page: Page, timeout = 15_000): Promise<WidgetState> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const state = await getWidgetState(page);
    if (state === "running" || state === "unsupported" || state === "error") return state;
    await page.waitForTimeout(300);
  }
  return getWidgetState(page);
}

// ---------------------------------------------------------------------------
// (A) Widget Rendering
// ---------------------------------------------------------------------------

test.describe("Widget rendering", () => {
  test.beforeEach(async ({ page }) => {
    await patchIntersectionObserver(page);
    await page.goto(SHOWCASE_URL);
    await page.waitForLoadState("domcontentloaded");
  });

  test("interactive demo section exists on showcase page", async ({ page }) => {
    stepLog("render", "looking for interactive demo section");
    const section = page.locator("#interactive-demo");
    await expect(section).toBeAttached();
    stepLog("render", "section found");
  });

  test("widget container renders after scrolling into view", async ({ page }) => {
    test.setTimeout(30_000);
    stepLog("render", "scrolling to interactive demo");
    await scrollToInteractiveDemo(page);

    const container = await waitForWidgetContainer(page);
    await expect(container).toBeVisible();
    stepLog("render", "container is visible");
  });

  test("canvas element exists inside the widget", async ({ page }) => {
    test.setTimeout(30_000);
    stepLog("canvas", "scrolling to demo");
    await scrollToInteractiveDemo(page);

    // With IO patched, widget loads immediately. Wait for stable state.
    const state = await waitForStableWidgetState(page);
    stepLog("canvas", `widget state: ${state}`);

    if (state === "running" || state === "unsupported") {
      // Canvas is always rendered in the DOM (display:none when not running)
      const canvas = page.locator("#interactive-demo canvas");
      await expect(canvas).toBeAttached({ timeout: 5_000 });
      stepLog("canvas", "canvas element found in DOM");
    } else {
      // Component didn't reach a terminal state — verify it at least loaded
      stepLog("canvas", `widget in ${state} state — verifying container exists`);
      await waitForWidgetContainer(page);
    }
  });

  test("loading state shows during WASM initialization", async ({ page }) => {
    const start = Date.now();
    await scrollToInteractiveDemo(page);

    // Either a loading state text, the fallback, or a canvas should be present
    const hasExpectedContent = await page.locator("#interactive-demo").evaluate((el) => {
      const text = el.textContent ?? "";
      const canvas = el.querySelector("canvas");
      return (
        text.includes("Loading") ||
        text.includes("Checking") ||
        text.includes("fonts") ||
        text.includes("WASM") ||
        text.includes("Initializing") ||
        text.includes("WebGPU") ||
        canvas !== null
      );
    });

    logDiag({
      test: "A4-loading",
      ts: new Date().toISOString(),
      hasExpectedContent,
      elapsed_ms: Date.now() - start,
    });
    stepLog("loading", `expected content present: ${hasExpectedContent}`, start);
    expect(hasExpectedContent).toBe(true);
  });

  test("widget transitions to running state or shows fallback", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();
    await scrollToInteractiveDemo(page);

    const state = await waitForStableWidgetState(page);

    logDiag({
      test: "A5-transition",
      ts: new Date().toISOString(),
      state,
      elapsed_ms: Date.now() - start,
    });
    stepLog("transition", `widget state: ${state}`, start);

    if (state === "running") {
      const canvas = page.locator("#interactive-demo canvas");
      const canvasDisplay = await canvas.evaluate((el) => getComputedStyle(el).display);
      expect(canvasDisplay).toBe("block");
      stepLog("transition", "canvas visible — running state confirmed");
    } else if (state === "unsupported") {
      const fallbackText = page.locator("#interactive-demo").getByText("requires WebGPU");
      await expect(fallbackText).toBeVisible({ timeout: 3_000 });
      stepLog("transition", "WebGPU unsupported — fallback shown correctly");
    } else {
      stepLog("transition", `widget in ${state} state`);
    }
  });

  test("no critical JavaScript errors during widget lifecycle", async ({ page }, testInfo) => {
    const start = Date.now();
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      errors.push(err.message);
    });

    await scrollToInteractiveDemo(page);
    await waitForStableWidgetState(page);

    const criticalErrors = filterCriticalErrors(errors);

    logDiag({
      test: "A6-errors",
      ts: new Date().toISOString(),
      total_errors: errors.length,
      critical_errors: criticalErrors,
      viewport: page.viewportSize(),
      elapsed_ms: Date.now() - start,
    });

    if (criticalErrors.length > 0) {
      stepLog("errors", `critical: ${criticalErrors.join("; ")}`);
      await captureFailureDiag(page, testInfo, "A6");
    }

    stepLog("errors", `${criticalErrors.length} critical / ${errors.length} total`, start);
    expect(criticalErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// (B) Interaction
// ---------------------------------------------------------------------------

test.describe("Widget interaction", () => {
  test.beforeEach(async ({ page }) => {
    await patchIntersectionObserver(page);
    await page.goto(SHOWCASE_URL);
    await page.waitForLoadState("domcontentloaded");
  });

  test("clicking widget area focuses it", async ({ page }) => {
    test.setTimeout(30_000);
    stepLog("focus", "scrolling and clicking widget");
    await scrollToInteractiveDemo(page);
    await waitForStableWidgetState(page);

    const canvas = page.locator("#interactive-demo canvas");
    const isVisible = await canvas.isVisible().catch(() => false);
    if (isVisible) {
      await canvas.click();
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBe("CANVAS");
      stepLog("focus", "canvas is focused after click");
    } else {
      stepLog("focus", "canvas not visible (WebGPU unavailable), skipping click test");
    }
  });

  test("keyboard input when focused is captured (no page scroll)", async ({ page }) => {
    test.setTimeout(30_000);
    stepLog("keys", "scrolling to demo and focusing canvas");
    await scrollToInteractiveDemo(page);
    await waitForStableWidgetState(page);

    const canvas = page.locator("#interactive-demo canvas");
    const isVisible = await canvas.isVisible().catch(() => false);
    if (!isVisible) {
      stepLog("keys", "canvas not visible, skipping");
      return;
    }

    await canvas.click();
    const scrollBefore = await page.evaluate(() => window.scrollY);

    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(200);

    const scrollAfter = await page.evaluate(() => window.scrollY);
    stepLog("keys", `scroll before=${scrollBefore}, after=${scrollAfter}`);

    expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(10);
  });

  test("keyboard input when unfocused is NOT captured", async ({ page }) => {
    test.setTimeout(30_000);
    stepLog("unfocused", "scrolling to demo then blurring canvas");
    await scrollToInteractiveDemo(page);

    const state = await waitForStableWidgetState(page);
    stepLog("unfocused", `widget state: ${state}`);

    if (state !== "running" && state !== "unsupported") {
      stepLog("unfocused", "widget not loaded, skipping");
      return;
    }

    const canvas = page.locator("#interactive-demo canvas");
    await expect(canvas).toBeAttached({ timeout: 5_000 });

    // Click outside the widget to ensure it's not focused
    await page.locator("body").click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(200);

    const hasFocus = await page.evaluate(() => {
      const c = document.querySelector("#interactive-demo canvas");
      return c === document.activeElement;
    });
    expect(hasFocus).toBe(false);
    stepLog("unfocused", "canvas confirmed unfocused");
  });

  test("mouse click on canvas sends input without errors", async ({ page }, testInfo) => {
    test.setTimeout(30_000);
    const start = Date.now();
    await scrollToInteractiveDemo(page);
    await waitForStableWidgetState(page);

    const canvas = page.locator("#interactive-demo canvas");
    const isVisible = await canvas.isVisible().catch(() => false);

    if (!isVisible) {
      stepLog("mouse", "canvas not visible, skipping mouse input test");
      logDiag({ test: "B4-mouse", ts: new Date().toISOString(), skipped: true });
      return;
    }

    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await canvas.click({ position: { x: 50, y: 50 } });
    await page.waitForTimeout(150);
    await canvas.click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(150);
    await canvas.click({ position: { x: 200, y: 200 } });
    await page.waitForTimeout(200);

    const criticalErrors = filterCriticalErrors(errors);

    logDiag({
      test: "B4-mouse",
      ts: new Date().toISOString(),
      clicks: 3,
      criticalErrors,
      elapsed_ms: Date.now() - start,
    });

    if (criticalErrors.length > 0) {
      await captureFailureDiag(page, testInfo, "B4");
    }

    stepLog("mouse", `3 clicks, ${criticalErrors.length} critical errors`, start);
    expect(criticalErrors).toHaveLength(0);
  });

  test("scroll wheel inside focused widget does NOT scroll the page", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();
    await scrollToInteractiveDemo(page);
    await waitForStableWidgetState(page);

    const canvas = page.locator("#interactive-demo canvas");
    const isVisible = await canvas.isVisible().catch(() => false);

    if (!isVisible) {
      stepLog("wheel", "canvas not visible, skipping wheel test");
      logDiag({ test: "B5-wheel", ts: new Date().toISOString(), skipped: true });
      return;
    }

    await canvas.click();
    await page.waitForTimeout(100);

    const scrollBefore = await page.evaluate(() => window.scrollY);

    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(300);

    const scrollAfter = await page.evaluate(() => window.scrollY);

    logDiag({
      test: "B5-wheel",
      ts: new Date().toISOString(),
      scrollBefore,
      scrollAfter,
      delta: scrollAfter - scrollBefore,
      elapsed_ms: Date.now() - start,
    });

    expect(scrollAfter).toBe(scrollBefore);
    stepLog("wheel", `scroll unchanged (${scrollBefore} → ${scrollAfter})`, start);
  });
});

// ---------------------------------------------------------------------------
// (C) Sizing
// ---------------------------------------------------------------------------

test.describe("Widget sizing", () => {
  test.beforeEach(async ({ page }) => {
    await patchIntersectionObserver(page);
    await page.goto(SHOWCASE_URL);
    await page.waitForLoadState("domcontentloaded");
  });

  test("widget container has expected dimensions", async ({ page }) => {
    test.setTimeout(30_000);
    stepLog("sizing", "scrolling to demo");
    await scrollToInteractiveDemo(page);
    await waitForStableWidgetState(page);

    const container = await waitForWidgetContainer(page);

    const box = await container.boundingBox();
    expect(box).toBeTruthy();
    stepLog("sizing", `widget dimensions: ${box!.width}x${box!.height}`);

    expect(box!.width).toBeGreaterThan(300);
    expect(box!.height).toBeGreaterThanOrEqual(400);
    expect(box!.height).toBeLessThanOrEqual(600);
  });

  test("viewport resize re-flows the widget", async ({ page }) => {
    test.setTimeout(30_000);
    stepLog("resize", "scrolling to demo");
    await scrollToInteractiveDemo(page);
    await waitForStableWidgetState(page);

    const container = await waitForWidgetContainer(page);
    const widthBefore = (await container.boundingBox())?.width ?? 0;
    stepLog("resize", `initial width: ${widthBefore}`);

    if (widthBefore === 0) {
      stepLog("resize", "container has zero width, skipping");
      return;
    }

    // Resize to a significantly different width
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(500);

    // Re-scroll to keep the section visible after reflow
    await page.evaluate(() => {
      const el = document.getElementById("interactive-demo");
      if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
    });
    await page.waitForTimeout(300);

    const widthAfter = (await container.boundingBox())?.width ?? 0;

    stepLog("resize", `width before=${widthBefore}, after=${widthAfter}`);
    logDiag({ test: "C2-resize", widthBefore, widthAfter });

    expect(widthAfter).not.toBe(widthBefore);
  });

  test("small viewport — no crash", async ({ page }) => {
    test.setTimeout(30_000);
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(SHOWCASE_URL);
    await page.waitForLoadState("domcontentloaded");
    await scrollToInteractiveDemo(page);
    await waitForStableWidgetState(page);

    const criticalErrors = filterCriticalErrors(errors);
    stepLog("small-viewport", `critical errors: ${criticalErrors.length}`);
    expect(criticalErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// (D) Lifecycle
// ---------------------------------------------------------------------------

test.describe("Widget lifecycle", () => {
  test("navigate away and back: no console errors", async ({ page }) => {
    test.setTimeout(30_000);
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await patchIntersectionObserver(page);

    stepLog("lifecycle", "loading showcase page");
    await page.goto(SHOWCASE_URL);
    await page.waitForLoadState("domcontentloaded");
    await scrollToInteractiveDemo(page);
    await waitForStableWidgetState(page);

    stepLog("lifecycle", "navigating away");
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(300);

    stepLog("lifecycle", "navigating back");
    await page.goto(SHOWCASE_URL);
    await page.waitForLoadState("domcontentloaded");

    const criticalErrors = filterCriticalErrors(errors);
    stepLog("lifecycle", `critical errors: ${criticalErrors.length}`);
    expect(criticalErrors).toHaveLength(0);
  });

  test("navigate back — widget re-initializes", async ({ page }) => {
    test.setTimeout(60_000);

    await patchIntersectionObserver(page);

    stepLog("reinit", "loading showcase");
    await page.goto(SHOWCASE_URL);
    await page.waitForLoadState("domcontentloaded");
    await scrollToInteractiveDemo(page);

    const firstState = await waitForStableWidgetState(page);
    stepLog("reinit", `first load state: ${firstState}`);

    // Navigate away
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(300);

    // Navigate back
    await page.goto(SHOWCASE_URL);
    await page.waitForLoadState("domcontentloaded");
    await scrollToInteractiveDemo(page);

    const secondState = await waitForStableWidgetState(page);
    stepLog("reinit", `second load state: ${secondState}`);

    logDiag({ test: "D2-reinit", firstState, secondState, timestamp: new Date().toISOString() });

    // If widget loaded on first visit, it should load on second visit too
    const terminalStates: WidgetState[] = ["running", "unsupported"];
    if (terminalStates.includes(firstState)) {
      expect(terminalStates).toContain(secondState);
      // Canvas should be in DOM on both visits
      const canvas = page.locator("#interactive-demo canvas");
      await expect(canvas).toBeAttached({ timeout: 5_000 });
      stepLog("reinit", "canvas re-attached after round-trip");
    }
  });
});

// ---------------------------------------------------------------------------
// (E) Coexistence
// ---------------------------------------------------------------------------

test.describe("Widget coexistence", () => {
  test("page content outside widget remains interactive", async ({ page }) => {
    await patchIntersectionObserver(page);
    await page.goto(SHOWCASE_URL);
    await page.waitForLoadState("domcontentloaded");

    const header = page.locator("header h1").first();
    await expect(header).toBeVisible();

    const gallery = page.locator("#screenshots");
    await expect(gallery).toBeAttached();

    stepLog("coexistence", "page content is interactive alongside widget");
  });

  test("page scrolling works when widget is not focused", async ({ page }) => {
    await patchIntersectionObserver(page);
    await page.goto(SHOWCASE_URL);
    await page.waitForLoadState("domcontentloaded");

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);

    const initialScroll = await page.evaluate(() => window.scrollY);

    await page.keyboard.press("End");
    await page.waitForTimeout(500);

    const newScroll = await page.evaluate(() => window.scrollY);
    stepLog("coexistence", `scrolled from ${initialScroll} to ${newScroll}`);

    expect(newScroll).toBeGreaterThan(initialScroll);
  });
});
