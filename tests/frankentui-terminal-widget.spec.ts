import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

/* ─── Types ─────────────────────────────────────────────────────── */

type ConsoleEvent = {
  ts: string;
  type: string;
  text: string;
  location: { url?: string; lineNumber?: number; columnNumber?: number };
};

type DiagnosticRecord = Record<string, unknown>;

/* ─── Diagnostics helpers ───────────────────────────────────────── */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

function diagnosticsLogPath() {
  const dir = path.join(process.cwd(), "test-results", "logs");
  mkdirSync(dir, { recursive: true });
  return path.join(dir, "terminal-widget-e2e.jsonl");
}

function logDiag(record: DiagnosticRecord) {
  appendFileSync(diagnosticsLogPath(), `${JSON.stringify(record)}\n`, "utf8");
}

function elapsed(startMs: number) {
  return Date.now() - startMs;
}

function stepLog(step: string, startMs: number, result: "pass" | "fail" = "pass") {
  const msg = `[terminal-widget] step: ${step}, elapsed: ${elapsed(startMs)}ms, result: ${result}`;
  console.log(msg);
  return msg;
}

/**
 * True for the one console error the homepage is expected to produce.
 *
 * `react-tweet` iterates `tweet.entities.*` unguarded, and the X syndication
 * payload sometimes omits an entity array, so the embed throws during render
 * (frankentui#82). components/tweet-wall.tsx already handles that: each embed
 * sits in its own ErrorBoundary and degrades to a fallback card. React logs
 * every error a boundary catches, and the boundary logs its own line, so a
 * page with eleven embeds reports twenty-two console errors while behaving
 * exactly as designed.
 *
 * These tests are about the terminal widget's mount and unmount, so a
 * contained throw from an unrelated third-party embed is not their signal. Any
 * other console error still fails them.
 */
function isContainedTweetEmbedError(text: string) {
  return /is not iterable/.test(text);
}

/* ─── Console capture ───────────────────────────────────────────── */

function setupConsoleCapture(page: Page) {
  const consoleEvents: ConsoleEvent[] = [];

  page.on("console", (msg) => {
    consoleEvents.push({
      ts: new Date().toISOString(),
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
    });
  });

  return consoleEvents;
}

/* ─── Selectors ─────────────────────────────────────────────────── */

/** The #interactive-demo section on /showcase that hosts the widget. */
const WIDGET_SECTION = "#interactive-demo";

/** The canvas element rendered by FrankenTerminal. */
const WIDGET_CANVAS = `${WIDGET_SECTION} canvas`;

/* ─── Helper: scroll widget into view and wait for WASM load ───── */

async function scrollToWidgetAndWait(page: Page, opts?: { timeout?: number }) {
  const timeout = opts?.timeout ?? 25_000;

  // Scroll #interactive-demo into view so IntersectionObserver triggers
  await page.locator(WIDGET_SECTION).scrollIntoViewIfNeeded();

  // Wait for FrankenTerminal's canvas to become *visible* (display: block).
  // The canvas is always in the DOM once the component mounts, but with
  // display: none until state === "running". Using toBeVisible ensures the
  // WASM module has loaded and the terminal is actively rendering.
  await expect(page.locator(WIDGET_CANVAS).first()).toBeVisible({ timeout });
}

/* ═══════════════════════════════════════════════════════════════════
   A. WIDGET RENDERING TESTS
   ═══════════════════════════════════════════════════════════════════ */

test.describe("A. Widget rendering", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "FrankenTerminal widget requires WebGPU (Chromium)"
  );

  test("A1: Widget container renders with correct dimensions", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();
    const consoleEvents = setupConsoleCapture(page);

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);

    // The widget is configured with width="100%" height={500}
    const containerBox = await page.locator(WIDGET_SECTION).first().boundingBox();
    expect(containerBox).toBeTruthy();
    expect(containerBox!.width).toBeGreaterThan(100);
    expect(containerBox!.height).toBeGreaterThan(100);

    stepLog(`container dims: ${containerBox!.width.toFixed(0)}x${containerBox!.height.toFixed(0)}`, start);

    logDiag({
      test: "A1",
      timestamp: new Date().toISOString(),
      container: containerBox,
      elapsed_ms: elapsed(start),
      console_errors: consoleEvents.filter((e) => e.type === "error"),
    });
  });

  test("A2: Canvas element exists inside the widget", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);

    const canvas = page.locator(WIDGET_CANVAS).first();
    await expect(canvas).toBeAttached();

    // Canvas should have tabIndex=0 for focus management
    const tabIndex = await canvas.getAttribute("tabindex");
    expect(tabIndex).toBe("0");

    stepLog("canvas found with tabIndex=0", start);
  });

  test("A3: Loading state shows during WASM initialization", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });

    // Scroll to trigger lazy load
    await page.locator(WIDGET_SECTION).scrollIntoViewIfNeeded();

    // Helper to classify the current loading phase.
    // The pre-scroll placeholder says "Scroll down to load interactive demo" —
    // we specifically look for the Suspense fallback ("Loading interactive demo")
    // or FrankenTerminal's own loading states ("Checking WebGPU", "Loading fonts",
    // "Loading WASM", "Initializing").
    function classifyState() {
      return page.evaluate((sel) => {
        const section = document.querySelector(sel);
        if (!section) return "no-section";
        const text = section.textContent ?? "";
        if (text.includes("Loading interactive demo")) return "suspense-fallback";
        if (text.includes("Checking WebGPU")) return "checking-webgpu";
        if (text.includes("Loading fonts")) return "loading-font";
        if (text.includes("Loading WASM")) return "loading-wasm";
        if (text.includes("Initializing")) return "initializing";
        const canvas = section.querySelector("canvas");
        if (canvas && window.getComputedStyle(canvas).display !== "none") return "running";
        return "unknown";
      }, WIDGET_SECTION);
    }

    // Poll until we leave the initial "no-section" / pre-scroll state
    await expect.poll(classifyState, { timeout: 20_000 }).not.toBe("no-section");

    // Capture the observed state for diagnostics
    const observedState = await classifyState();

    stepLog(`loading state: ${observedState}`, start);

    logDiag({
      test: "A3",
      timestamp: new Date().toISOString(),
      observed_state: observedState,
      elapsed_ms: elapsed(start),
    });
  });

  test("A4: Widget transitions to running state", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);

    // When running, the canvas should be displayed (display: block)
    await expect
      .poll(
        async () => {
          return page.evaluate((sel) => {
            const canvas = document.querySelector(sel);
            if (!canvas) return "not-found";
            const style = window.getComputedStyle(canvas);
            return style.display;
          }, WIDGET_CANVAS);
        },
        { timeout: 20_000 }
      )
      .toBe("block");

    stepLog("canvas display: block (running)", start);
  });

  test("A5: No JavaScript errors during widget lifecycle", async ({ page }) => {
    test.setTimeout(35_000);
    const start = Date.now();
    const consoleEvents = setupConsoleCapture(page);

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);

    // Let the widget run for a few seconds to catch runtime errors
    await page.waitForTimeout(3_000);

    const errors = consoleEvents.filter(
      (e) =>
        e.type === "error" &&
        // Ignore known non-critical messages
        !e.text.includes("favicon") &&
        !e.text.includes("404")
    );

    stepLog(`console errors: ${errors.length}`, start, errors.length === 0 ? "pass" : "fail");

    logDiag({
      test: "A5",
      timestamp: new Date().toISOString(),
      console_errors: errors,
      total_console_events: consoleEvents.length,
      elapsed_ms: elapsed(start),
    });

    expect(errors).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════
   B. INTERACTION TESTS
   ═══════════════════════════════════════════════════════════════════ */

test.describe("B. Interaction", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Interaction tests require WebGPU (Chromium)"
  );

  test("B1: Click on widget focuses the canvas", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);

    // Click the canvas
    await page.locator(WIDGET_CANVAS).first().click();

    // Verify canvas has focus
    const hasFocus = await page.evaluate((sel) => {
      const canvas = document.querySelector(sel);
      return document.activeElement === canvas;
    }, WIDGET_CANVAS);

    expect(hasFocus).toBe(true);
    stepLog("canvas focused on click", start);
  });

  test("B2: Keyboard input when focused is captured (not propagated)", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);

    // Focus the canvas
    await page.locator(WIDGET_CANVAS).first().click();

    // Record the scroll position before sending keys
    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Press keys that would normally scroll the page
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    await page.waitForTimeout(500);

    // Check scroll position — should not have changed since canvas captures keys
    const scrollAfter = await page.evaluate(() => window.scrollY);

    stepLog(`scroll: before=${scrollBefore} after=${scrollAfter}`, start);

    logDiag({
      test: "B2",
      timestamp: new Date().toISOString(),
      scroll_before: scrollBefore,
      scroll_after: scrollAfter,
      elapsed_ms: elapsed(start),
    });

    // The scroll position should be the same (canvas captured the keys)
    expect(scrollAfter).toBe(scrollBefore);
  });

  test("B3: Mouse click on canvas sends input", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);

    // Click the canvas — this should focus it and send mouse input to the terminal
    const canvas = page.locator(WIDGET_CANVAS).first();
    await canvas.click();

    // Verify focus (proves the click event was processed)
    const hasFocus = await page.evaluate((sel) => {
      return document.activeElement === document.querySelector(sel);
    }, WIDGET_CANVAS);

    expect(hasFocus).toBe(true);
    stepLog("mouse click processed (canvas focused)", start);
  });

  test("B4: Scroll wheel inside widget does not scroll the page", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);

    // Get the canvas position
    const canvasBox = await page.locator(WIDGET_CANVAS).first().boundingBox();
    expect(canvasBox).toBeTruthy();

    // Move mouse to canvas center and click to focus
    const cx = canvasBox!.x + canvasBox!.width / 2;
    const cy = canvasBox!.y + canvasBox!.height / 2;
    await page.mouse.click(cx, cy);

    // Record scroll before
    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Ensure mouse is still centered on the canvas, then dispatch wheel
    await page.mouse.move(cx, cy);
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(300);

    const scrollAfter = await page.evaluate(() => window.scrollY);

    stepLog(`wheel: scrollBefore=${scrollBefore} scrollAfter=${scrollAfter}`, start);

    logDiag({
      test: "B4",
      timestamp: new Date().toISOString(),
      scroll_before: scrollBefore,
      scroll_after: scrollAfter,
      canvas_box: canvasBox,
      elapsed_ms: elapsed(start),
    });

    // Wheel events on the canvas should be captured (preventDefault)
    // The canvas registers a wheel listener with { passive: false } and calls
    // preventDefault, so page scroll should not change when mouse is over canvas.
    expect(scrollAfter).toBe(scrollBefore);
  });

  test("B5: Keyboard input when NOT focused propagates to page", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);

    // Blur the canvas — focus something else
    await page.evaluate(() => {
      (document.activeElement as HTMLElement)?.blur?.();
      document.body.focus();
    });
    await page.waitForTimeout(200);

    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Press Page Down which should scroll the page when canvas is not focused
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(500);

    const scrollAfter = await page.evaluate(() => window.scrollY);

    stepLog(`unfocused scroll: before=${scrollBefore} after=${scrollAfter}`, start);

    logDiag({
      test: "B5",
      timestamp: new Date().toISOString(),
      scroll_before: scrollBefore,
      scroll_after: scrollAfter,
      elapsed_ms: elapsed(start),
    });

    // Page should have scrolled because the canvas is not focused
    expect(scrollAfter).toBeGreaterThan(scrollBefore);
  });
});

/* ═══════════════════════════════════════════════════════════════════
   C. SIZING TESTS
   ═══════════════════════════════════════════════════════════════════ */

test.describe("C. Sizing", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Sizing tests require WebGPU (Chromium)"
  );

  test("C1: Widget fills its container at specified dimensions", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);

    // The widget is set to height={500} — verify the container height
    const dims = await page.evaluate((sel) => {
      const container = document.querySelector(sel);
      if (!container) return null;
      // Find the FrankenTerminal container (div with position: relative)
      const termContainer = container.querySelector<HTMLElement>('div[style*="position"]');
      if (!termContainer) return null;
      return {
        width: termContainer.offsetWidth,
        height: termContainer.offsetHeight,
      };
    }, WIDGET_SECTION);

    expect(dims).toBeTruthy();
    expect(dims!.width).toBeGreaterThan(200);
    // Height should be 500px as configured
    expect(dims!.height).toBeGreaterThanOrEqual(490);
    expect(dims!.height).toBeLessThanOrEqual(510);

    stepLog(`widget dims: ${dims!.width}x${dims!.height}`, start);
  });

  test("C2: Resizing the viewport resizes the widget", async ({ page }) => {
    test.setTimeout(35_000);
    const start = Date.now();

    // Start with a large viewport
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);
    await page.waitForTimeout(2_000); // Let it fully initialize

    // Measure initial canvas width
    const widthBefore = await page.evaluate((sel) => {
      const canvas = document.querySelector(sel);
      return canvas ? (canvas as HTMLCanvasElement).width : 0;
    }, WIDGET_CANVAS);

    // Resize viewport smaller
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(1_500); // Allow ResizeObserver to fire

    // Scroll back to widget since viewport change may shift it
    await page.locator(WIDGET_SECTION).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const widthAfter = await page.evaluate((sel) => {
      const canvas = document.querySelector(sel);
      return canvas ? (canvas as HTMLCanvasElement).width : 0;
    }, WIDGET_CANVAS);

    stepLog(`canvas width: ${widthBefore} → ${widthAfter}`, start);

    logDiag({
      test: "C2",
      timestamp: new Date().toISOString(),
      width_before: widthBefore,
      width_after: widthAfter,
      elapsed_ms: elapsed(start),
    });

    // Both dimensions must be valid
    expect(widthBefore).toBeGreaterThan(0);
    expect(widthAfter).toBeGreaterThan(0);
    // After shrinking from 1400→800, the canvas width should decrease
    // (widget uses width="100%" so it tracks the container)
    expect(widthAfter).toBeLessThan(widthBefore);
  });

  test("C3: Widget at minimum viewport shows graceful degradation", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();
    const consoleEvents = setupConsoleCapture(page);

    await page.setViewportSize({ width: 320, height: 480 });
    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);
    await page.waitForTimeout(2_000);

    // No crashes at small size
    const errors = consoleEvents.filter(
      (e) =>
        e.type === "error" &&
        !e.text.includes("favicon") &&
        !e.text.includes("404")
    );

    stepLog(`small viewport errors: ${errors.length}`, start, errors.length === 0 ? "pass" : "fail");

    logDiag({
      test: "C3",
      timestamp: new Date().toISOString(),
      viewport: { width: 320, height: 480 },
      console_errors: errors,
      elapsed_ms: elapsed(start),
    });

    expect(errors).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════
   D. LIFECYCLE TESTS
   ═══════════════════════════════════════════════════════════════════ */

test.describe("D. Lifecycle", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Lifecycle tests require WebGPU (Chromium)"
  );

  test("D1: Navigate away — no memory leaks or console errors", async ({ page }) => {
    test.setTimeout(40_000);
    const start = Date.now();
    const consoleEvents = setupConsoleCapture(page);

    // Load showcase and let widget initialize
    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);
    await page.waitForTimeout(2_000);

    stepLog("widget running, navigating away...", start);

    // Navigate to a different page (React unmount)
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2_000);

    // Check for errors that occurred during unmount
    const errors = consoleEvents.filter(
      (e) =>
        e.type === "error" &&
        !e.text.includes("favicon") &&
        !e.text.includes("404") &&
        // Ignore generic navigation errors
        !e.text.includes("net::ERR_ABORTED") &&
        !isContainedTweetEmbedError(e.text)
    );

    stepLog(`unmount errors: ${errors.length}`, start, errors.length === 0 ? "pass" : "fail");

    logDiag({
      test: "D1",
      timestamp: new Date().toISOString(),
      console_errors: errors,
      elapsed_ms: elapsed(start),
    });

    expect(errors).toEqual([]);
  });

  test("D2: Navigate back — widget re-initializes cleanly", async ({ page }) => {
    test.setTimeout(50_000);
    const start = Date.now();
    const consoleEvents = setupConsoleCapture(page);

    // Load showcase, init widget
    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);
    await page.waitForTimeout(2_000);

    // Navigate away
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1_000);

    stepLog("navigated away, going back...", start);

    // Navigate back to showcase
    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page, { timeout: 25_000 });
    await page.waitForTimeout(2_000);

    // Canvas should be visible and running again
    const canvasDisplay = await page.evaluate((sel) => {
      const canvas = document.querySelector(sel);
      return canvas ? window.getComputedStyle(canvas).display : "not-found";
    }, WIDGET_CANVAS);

    const errors = consoleEvents.filter(
      (e) =>
        e.type === "error" &&
        !e.text.includes("favicon") &&
        !e.text.includes("404") &&
        !e.text.includes("net::ERR_ABORTED") &&
        !isContainedTweetEmbedError(e.text)
    );

    stepLog(`re-init: canvas display=${canvasDisplay}, errors=${errors.length}`, start);

    logDiag({
      test: "D2",
      timestamp: new Date().toISOString(),
      canvas_display: canvasDisplay,
      console_errors: errors,
      elapsed_ms: elapsed(start),
    });

    expect(canvasDisplay).toBe("block");
    expect(errors).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════
   E. COEXISTENCE TESTS
   ═══════════════════════════════════════════════════════════════════ */

test.describe("E. Coexistence", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Coexistence tests require WebGPU (Chromium)"
  );

  test("E1: Page content outside the widget is still interactive", async ({ page }) => {
    test.setTimeout(35_000);
    const start = Date.now();

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await scrollToWidgetAndWait(page);

    // Scroll back to the top where the header/nav is
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // The site header should still be interactive — find a nav link
    const navLink = page.locator("header a").first();
    await expect(navLink).toBeAttached();

    // Verify the link is clickable (pointer-events not blocked)
    const isClickable = await navLink.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.pointerEvents !== "none" && style.visibility !== "hidden";
    });

    expect(isClickable).toBe(true);
    stepLog("page content interactive outside widget", start);
  });

  test("E2: Page scrolling works when widget is NOT focused", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });

    // Ensure we're at the top and the widget is NOT focused
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Focus something other than the canvas (e.g., the body)
    await page.evaluate(() => {
      (document.activeElement as HTMLElement)?.blur?.();
      document.body.focus();
    });

    // Use keyboard to scroll the page
    await page.keyboard.press("End");
    await page.waitForTimeout(1_000);

    const scrollAfter = await page.evaluate(() => window.scrollY);

    stepLog(`scroll: before=${scrollBefore} after=${scrollAfter}`, start);

    logDiag({
      test: "E2",
      timestamp: new Date().toISOString(),
      scroll_before: scrollBefore,
      scroll_after: scrollAfter,
      elapsed_ms: elapsed(start),
    });

    // Page should have scrolled when widget is not focused
    expect(scrollAfter).toBeGreaterThan(scrollBefore);
  });
});

/* ═══════════════════════════════════════════════════════════════════
   F. NON-WEBGPU BROWSER FALLBACK
   ═══════════════════════════════════════════════════════════════════ */

test.describe("F. Non-WebGPU fallback", () => {
  test.skip(
    ({ browserName }) => browserName === "chromium",
    "Fallback tests for browsers without WebGPU"
  );

  test("F1: Widget shows fallback in Firefox/WebKit", async ({ page }) => {
    test.setTimeout(30_000);
    const start = Date.now();

    await page.goto(`${BASE_URL}/showcase`, { waitUntil: "domcontentloaded" });
    await page.locator(WIDGET_SECTION).scrollIntoViewIfNeeded();
    await page.waitForTimeout(5_000);

    // Without WebGPU, FrankenTerminal should show the DefaultFallback component.
    // We check for text UNIQUE to DefaultFallback (not the static paragraph below
    // the widget which always says "Requires Chrome or Edge with WebGPU support").
    // DefaultFallback renders: "not available in your browser" and "Chrome 113+"
    const fallbackState = await page.evaluate((sel) => {
      const section = document.querySelector(sel);
      if (!section) return { found: false, text: "" };
      const text = section.textContent ?? "";
      return {
        found: true,
        // These strings are unique to DefaultFallback, not in the static page text
        hasFallbackMessage: text.includes("not available in your browser"),
        hasSupportedBrowsers: text.includes("Chrome 113+") || text.includes("Edge 113+"),
        text: text.substring(0, 500),
      };
    }, WIDGET_SECTION);

    stepLog(`fallback: ${JSON.stringify(fallbackState)}`, start);

    logDiag({
      test: "F1",
      timestamp: new Date().toISOString(),
      fallback_state: fallbackState,
      elapsed_ms: elapsed(start),
    });

    // The section must exist and display the DefaultFallback component
    expect(fallbackState.found).toBe(true);
    // "This demo requires WebGPU, which is not available in your browser."
    expect(fallbackState.hasFallbackMessage).toBe(true);
    // "Supported: Chrome 113+, Edge 113+, Opera 99+"
    expect(fallbackState.hasSupportedBrowsers).toBe(true);
  });
});
