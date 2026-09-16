import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { test, expect, type Page, type TestInfo } from "@playwright/test";

type TouchProbe = {
  cols: number;
  rows: number;
  cells: number[];
  inputs: { kind: string; phase?: string; dy?: number; dx?: number }[];
  trustedTouches: number;
};

// Observe the real WASM input and patch boundaries. Every call still runs the
// original implementation; no renderer, runner, input result, or patch is mocked.
async function observeTouchDemo(page: Page, screen = 2) {
  // The bundle is described by pkg/manifest.json (schema ftui-browser-package-v1),
  // which carries a SHA-256 per package file. That digest is the cache buster,
  // replacing the ASSET_VERSION constant the demo page used to define.
  const manifestResponse = await page.request.get(`${BASE_URL}/web/pkg/manifest.json`);
  expect(manifestResponse.ok()).toBe(true);
  const manifest = (await manifestResponse.json()) as {
    schema: string;
    files: Record<string, string>;
  };
  expect(manifest.schema).toBe("ftui-browser-package-v1");
  const termHash = manifest.files["FrankenTerm.js"];
  expect(termHash).toBeTruthy();
  const moduleUrl = new URL(
    `/web/pkg/FrankenTerm.js?sha256=${termHash}`,
    manifestResponse.url(),
  ).href;
  await page.addInitScript(({ moduleUrl }) => {
    const probe: TouchProbe = { cols: 0, rows: 0, cells: [], inputs: [], trustedTouches: 0 };
    (window as unknown as { ftuiTouchProbe: TouchProbe }).ftuiTouchProbe = probe;
    document.addEventListener("touchstart", (event) => {
      if (event.isTrusted) probe.trustedTouches++;
    }, { capture: true });
    void import(moduleUrl).then(({ FrankenTermWeb }) => {
      const proto = FrankenTermWeb.prototype;
      const fit = proto.fitToContainer;
      proto.fitToContainer = function (...args: unknown[]) {
        const geometry = fit.apply(this, args);
        if (probe.cols !== geometry.cols || probe.rows !== geometry.rows) probe.cells = [];
        probe.cols = geometry.cols;
        probe.rows = geometry.rows;
        return geometry;
      };
      const patch = proto.applyPatchBatchFlat;
      proto.applyPatchBatchFlat = function (spans: Uint32Array, cells: Uint32Array) {
        let cursor = 0;
        for (let i = 0; i < spans.length; i += 2) {
          for (let j = 0; j < spans[i + 1]; j++) {
            probe.cells[spans[i] + j] = cells[cursor * 4 + 2];
            cursor++;
          }
        }
        return patch.call(this, spans, cells);
      };
      const input = proto.input;
      proto.input = function (event: TouchProbe["inputs"][number]) {
        probe.inputs.push({ ...event });
        return input.call(this, event);
      };
    });
  }, { moduleUrl });
  await page.goto(`${BASE_URL}/web?zoom=1&screen=${screen}`);
  await expect.poll(() => touchDemoText(page)).toContain(screen === 3 ? "Shakespeare" : "Dashboard");
  if (screen === 3) {
    // The large text asset loads after the first frame. Wait for usable
    // content, not just the screen title, before measuring scroll position.
    await expect.poll(() => touchDemoText(page)).toMatch(/Line \d+\/[1-9]\d*/);
  }
}

async function touchDemoText(page: Page) {
  return page.evaluate(() => {
    const probe = (window as unknown as { ftuiTouchProbe: TouchProbe }).ftuiTouchProbe;
    return (probe?.cells ?? []).map((value) =>
      value > 0 && value <= 0x10ffff ? String.fromCodePoint(value) : " "
    ).join("");
  });
}

async function touchDemoCell(page: Page, x: number, y: number) {
  return page.evaluate(({ x, y }) => {
    const { cols, rows } = (window as unknown as { ftuiTouchProbe: TouchProbe }).ftuiTouchProbe;
    const rect = document.querySelector("canvas")!.getBoundingClientRect();
    return { x: rect.left + (x + 0.5) * rect.width / cols, y: rect.top + (y + 0.5) * rect.height / rows };
  }, { x, y });
}

test.describe("G. Touch navigation — real WASM", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Trusted multi-touch injection uses Chromium CDP");
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    test(`tap navigates and mouse still works at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await observeTouchDemo(page);
      const tour = await touchDemoCell(page, 5, 0);
      await page.touchscreen.tap(tour.x, tour.y);
      await expect.poll(() => touchDemoText(page)).toContain("Guided Tour");
      expect(await page.evaluate(() => (window as unknown as { ftuiTouchProbe: TouchProbe }).ftuiTouchProbe.trustedTouches)).toBe(1);
      const dashboard = await touchDemoCell(page, 15, 0);
      await page.mouse.click(dashboard.x, dashboard.y);
      await expect.poll(() => touchDemoText(page)).toContain("FRANKENTUI DASHBOARD");
      const events = await page.evaluate(() => (window as unknown as { ftuiTouchProbe: TouchProbe }).ftuiTouchProbe.inputs);
      expect(events.filter((e) => e.kind === "mouse" && e.phase === "down")).toHaveLength(2);
      expect(events.filter((e) => e.kind === "mouse" && e.phase === "up")).toHaveLength(2);
      await expect(page.locator("#error-overlay")).not.toHaveClass(/visible/);
    });
  }

  test("swipe scrolls; cancel and pinch do not click; touch recovers", async ({ page }) => {
    await observeTouchDemo(page, 3);
    const session = await page.context().newCDPSession(page);
    const start = await touchDemoCell(page, 12, 30);
    const before = await touchDemoText(page);
    const initialLine = Number(before.match(/Line (\d+)\//)?.[1]);
    expect(initialLine).toBeGreaterThan(0);
    const contact = (x: number, y: number, id = 1) => ({ x, y, id });
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [contact(start.x, start.y)] });
    for (let i = 1; i <= 6; i++) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [contact(start.x, start.y - i * 20)] });
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(async () => Number((await touchDemoText(page)).match(/Line (\d+)\//)?.[1])).toBeGreaterThan(initialLine);
    let events = await page.evaluate(() => (window as unknown as { ftuiTouchProbe: TouchProbe }).ftuiTouchProbe.inputs);
    expect(events.some((e) => e.kind === "wheel" && (e.dy ?? 0) > 0)).toBe(true);
    expect(events.some((e) => e.kind === "mouse" && e.phase === "down")).toBe(false);

    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [contact(100, 180)] });
    await session.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [contact(100, 180), contact(200, 180, 2)] });
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [contact(70, 180), contact(230, 180, 2)] });
    await expect.poll(() => new URL(page.url()).searchParams.get("zoom")).not.toBe("1");
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [contact(70, 180)] });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    events = await page.evaluate(() => (window as unknown as { ftuiTouchProbe: TouchProbe }).ftuiTouchProbe.inputs);
    expect(events.some((e) => e.kind === "mouse" && e.phase === "down")).toBe(false);

    const tour = await touchDemoCell(page, 5, 0);
    await page.touchscreen.tap(tour.x, tour.y);
    await expect.poll(() => touchDemoText(page)).toContain("Guided Tour");
    await expect(page.locator("#error-overlay")).not.toHaveClass(/visible/);
  });

  test("desktop hover, drag, and wheel still reach the running showcase", async ({ page }) => {
    await observeTouchDemo(page, 3);
    const point = await touchDemoCell(page, 12, 30);
    const initialLine = Number((await touchDemoText(page)).match(/Line (\d+)\//)?.[1]);
    expect(initialLine).toBeGreaterThan(0);
    await page.mouse.move(point.x, point.y);
    await page.mouse.wheel(0, 160);
    await expect.poll(async () => Number((await touchDemoText(page)).match(/Line (\d+)\//)?.[1])).toBeGreaterThan(initialLine);
    await page.mouse.down();
    await page.mouse.move(point.x + 24, point.y + 24, { steps: 3 });
    await page.mouse.up();
    const events = await page.evaluate(() => (window as unknown as { ftuiTouchProbe: TouchProbe }).ftuiTouchProbe.inputs);
    for (const phase of ["move", "down", "drag", "up"]) {
      expect(events.some((e) => e.kind === "mouse" && e.phase === phase)).toBe(true);
    }
    await expect(page.locator("#error-overlay")).not.toHaveClass(/visible/);
  });
});

/* ══════════════════════════════════════════════════════════════════
   H. Touch controls — the action bar, and dragging with a finger
   ══════════════════════════════════════════════════════════════════

   Two things a phone could not do before: press any of the letter keys
   the screens are driven by, and drag anything, because a finger that
   moves means scroll. The bar is built from each screen's own published
   keybindings, so these check the wiring rather than a fixed key list.

   These read the demo's own `?jsonl=1` diagnostics rather than patching
   the renderer: what is being tested is the host's gesture layer, and
   every input it admits is already reported there.                      */

type DemoLog = {
  event?: string;
  kind?: string;
  outcome?: string;
  key?: string;
  phase?: string;
  x?: number;
  y?: number;
};

/// Open the demo with its diagnostics on, collecting what it reports.
async function openTouchDemo(page: Page, screen = "dashboard") {
  const log: DemoLog[] = [];
  page.on("console", (message) => {
    const text = message.text();
    if (!text.startsWith("{")) return;
    try {
      log.push(JSON.parse(text) as DemoLog);
    } catch {
      // Not every console line is a diagnostic record.
    }
  });
  await page.goto(`${BASE_URL}/web?jsonl=1&zoom=1&screen=${screen}`);
  await expect(page.locator("canvas")).toBeVisible();
  // The status line carries the terminal geometry once the runner has drawn.
  await expect(page.locator("#status")).toContainText("×");
  return log;
}

/// Where a fraction of the way across the terminal lands, in page pixels.
async function canvasPoint(page: Page, fx: number, fy: number) {
  const box = await page.locator("canvas").boundingBox();
  if (!box) throw new Error("the terminal canvas has no box");
  return { x: box.x + box.width * fx, y: box.y + box.height * fy };
}

/// Terminal rows, read off the status line ("48×49 — panes 0/0 sel 0").
async function terminalRows(page: Page) {
  const status = (await page.locator("#status").textContent()) ?? "";
  return Number(status.match(/(\d+)×(\d+)/)?.[2] ?? 0);
}

test.describe("H. Touch controls — real WASM", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Trusted touch injection uses Chromium CDP");
  // isMobile, not just hasTouch: the bar is gated on (pointer: coarse), which
  // is exactly the question of whether this device is driven by a finger.
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("the bar offers this screen's keys, and tapping one presses it", async ({ page }) => {
    const log = await openTouchDemo(page);
    const buttons = page.locator("#touch-actions-list button");
    await expect(page.locator("#touch-actions")).toBeVisible();
    await expect.poll(() => buttons.count()).toBeGreaterThan(4);

    const keys = await buttons.evaluateAll((els) =>
      els.map((el) => (el as HTMLElement).dataset.key ?? ""),
    );
    // `g` cycles the dashboard's chart mode and is the screen's own; `?` opens
    // the help overlay and is on every screen. One of each proves the bar is
    // built from the screen plus the globals, not from a hard-coded strip.
    expect(keys).toContain("g");
    expect(keys).toContain("?");
    // Every button says what its key does, taken from the screen's own help.
    const labelled = await buttons.evaluateAll((els) =>
      els.every((el) => (el.getAttribute("aria-label") ?? "").includes(":")),
    );
    expect(labelled).toBe(true);

    const keysBefore = log.filter((r) => r.event === "input_admission" && r.kind === "key").length;
    await page.locator('#touch-actions-list button[data-key="g"]').tap();
    await expect.poll(() => log.filter((r) => r.event === "touch_action" && r.key === "g").length).toBe(1);
    // It has to arrive as a key the runner accepts - a button that only looks
    // pressed is the failure this is here to catch.
    await expect.poll(
      () => log.filter((r) => r.event === "input_admission" && r.kind === "key").length - keysBefore,
    ).toBe(2);
    const admitted = log.filter((r) => r.event === "input_admission" && r.kind === "key").slice(keysBefore);
    expect(admitted.every((r) => r.outcome === "accepted")).toBe(true);
    await expect(page.locator("#error-overlay")).not.toHaveClass(/visible/);
  });

  test("the bar follows the screen and gives the terminal back its rows when folded", async ({ page }) => {
    await openTouchDemo(page);
    const keysNow = () =>
      page.locator("#touch-actions-list button").evaluateAll((els) =>
        els.map((el) => (el as HTMLElement).dataset.key ?? "").join(","),
      );
    const onDashboard = await keysNow();
    expect(onDashboard).toContain("g");

    // Swiping in from a bezel is how a phone changes screens, and the next one
    // publishes different keys. The bar is polled rather than pushed, so this
    // also checks that it keeps up.
    const session = await page.context().newCDPSession(page);
    const box = (await page.locator("canvas").boundingBox())!;
    const y = box.y + box.height * 0.5;
    const from = box.x + box.width - 8;
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from, y, id: 1 }] });
    for (let step = 1; step <= 12; step++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: from - step * 12, y, id: 1 }],
      });
      await page.waitForTimeout(20);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(keysNow).not.toBe(onDashboard);

    // Folding the bar is worth rows, which is the whole reason it folds.
    const expanded = await terminalRows(page);
    expect(expanded).toBeGreaterThan(0);
    await page.locator("#touch-actions-toggle").tap();
    await expect(page.locator("#touch-actions-list")).toBeHidden();
    await expect.poll(() => terminalRows(page)).toBeGreaterThan(expanded);
  });

  test("a held finger drags; a quick swipe still scrolls", async ({ page }) => {
    const log = await openTouchDemo(page);
    const session = await page.context().newCDPSession(page);
    const start = await canvasPoint(page, 0.5, 0.5);
    const contact = (x: number, y: number) => ({ x, y, id: 1 });
    const drags = () => log.filter((r) => r.event === "touch_drag");

    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [contact(start.x, start.y)] });
    // Past the arm threshold, holding still. Moving before this is a scroll.
    await page.waitForTimeout(600);
    for (let step = 1; step <= 6; step++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [contact(start.x - step * 10, start.y)],
      });
      await page.waitForTimeout(30);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

    await expect.poll(() => drags().filter((r) => r.phase === "up").length).toBe(1);
    expect(drags().filter((r) => r.phase === "down")).toHaveLength(1);
    // It has to have actually moved: down and up in the same cell is a click.
    const [down] = drags().filter((r) => r.phase === "down");
    const [up] = drags().filter((r) => r.phase === "up");
    expect(up.x).not.toBe(down.x);
    // A drag owns the gesture: it must not also scroll what is under it.
    const wheelDuringDrag = log.filter((r) => r.event === "input_admission" && r.kind === "wheel").length;
    expect(wheelDuringDrag).toBe(0);

    // The same movement without the hold is still a scroll, not a drag.
    const dragsBefore = drags().length;
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [contact(start.x, start.y)] });
    for (let step = 1; step <= 8; step++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [contact(start.x, start.y - step * 16)],
      });
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(
      () => log.filter((r) => r.event === "input_admission" && r.kind === "wheel").length,
    ).toBeGreaterThan(0);
    expect(drags().length).toBe(dragsBefore);
    await expect(page.locator("#error-overlay")).not.toHaveClass(/visible/);
  });
});

test.describe("H2. The action bar stays out of a desktop's way", () => {
  test.use({ hasTouch: false, viewport: { width: 1280, height: 800 } });

  test("a mouse-driven browser gets no bar and loses no rows", async ({ page }) => {
    await openTouchDemo(page);
    await expect(page.locator("#touch-actions")).toBeHidden();
    const barHeight = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--touch-bar-h").trim(),
    );
    expect(barHeight).toBe("0px");
  });
});

/* ─── Types ─────────────────────────────────────────────────────── */

type ConsoleEvent = {
  ts: string;
  type: string;
  text: string;
  location: { url?: string; lineNumber?: number; columnNumber?: number };
};

type RequestEvent = {
  ts: string;
  url: string;
  method: string;
  status?: number;
  contentType?: string;
  errorText?: string | null;
};

type DiagnosticRecord = Record<string, unknown>;

/* ─── Diagnostics helpers ───────────────────────────────────────── */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";

function diagnosticsLogPath() {
  const dir = path.join(process.cwd(), "test-results", "logs");
  mkdirSync(dir, { recursive: true });
  return path.join(dir, "web-demo-e2e.jsonl");
}

function logDiag(record: DiagnosticRecord) {
  appendFileSync(diagnosticsLogPath(), `${JSON.stringify(record)}\n`, "utf8");
}

function elapsed(startMs: number) {
  return Date.now() - startMs;
}

function stepLog(step: string, startMs: number, result: "pass" | "fail" = "pass") {
  const msg = `[web-demo-test] step: ${step}, elapsed: ${elapsed(startMs)}ms, result: ${result}`;
  console.log(msg);
  return msg;
}

/* ─── Expected assets ───────────────────────────────────────────── */

const EXPECTED_WASM_ASSETS = [
  "/web/pkg/FrankenTerm.js",
  "/web/pkg/FrankenTerm_bg.wasm",
  "/web/pkg/ftui_showcase_wasm.js",
  "/web/pkg/ftui_showcase_wasm_bg.wasm",
];

const EXPECTED_FONT_ASSETS = ["/web/fonts/pragmasevka-nf-subset.woff2"];

const EXPECTED_DATA_ASSETS = [
  "/web/assets/shakespeare.txt",
  "/web/assets/sqlite3.c",
];

const ALL_EXPECTED_ASSETS = [
  ...EXPECTED_WASM_ASSETS,
  ...EXPECTED_FONT_ASSETS,
  ...EXPECTED_DATA_ASSETS,
];

/* ─── Shared test context ───────────────────────────────────────── */

function setupCapture(page: Page) {
  const consoleEvents: ConsoleEvent[] = [];
  const requestFailures: RequestEvent[] = [];
  const completedRequests: RequestEvent[] = [];

  page.on("console", (msg) => {
    consoleEvents.push({
      ts: new Date().toISOString(),
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
    });
  });

  page.on("requestfailed", (request) => {
    requestFailures.push({
      ts: new Date().toISOString(),
      url: request.url(),
      method: request.method(),
      errorText: request.failure()?.errorText ?? null,
    });
  });

  page.on("requestfinished", (request) => {
    completedRequests.push({
      ts: new Date().toISOString(),
      url: request.url(),
      method: request.method(),
    });
  });

  return { consoleEvents, requestFailures, completedRequests };
}

async function _captureFailure(page: Page, testInfo: TestInfo, label: string) {
  if (page.isClosed()) return null;
  try {
    const screenshotPath = testInfo.outputPath(`web-demo-${label}-failure.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  } catch {
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   A. PAGE LOAD TESTS (Chromium with WebGPU)
   ═══════════════════════════════════════════════════════════════════ */

test.describe("A. Page load — Chromium (WebGPU)", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "WebGPU tests require Chromium"
  );
  test.describe.configure({ mode: "serial" });

  test("A1: GET /web returns 200", async ({ page }) => {
    const start = Date.now();
    const response = await page.goto(`${BASE_URL}/web`, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);
    stepLog("GET /web → 200", start);
  });

  test("A2: HTML contains expected DOM elements", async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/web`, { waitUntil: "domcontentloaded" });

    // The WASM demo page should have these key elements
    for (const selector of ["canvas", "#error-overlay"]) {
      await expect(page.locator(selector).first()).toBeAttached();
      stepLog(`found ${selector}`, start);
    }

    // Verify WebGPU fallback div is present (injected by sync script)
    await expect(page.locator("#webgpu-fallback")).toBeAttached();
    stepLog("found #webgpu-fallback", start);
  });

  test("A3: Canvas has non-zero dimensions after load", async ({ page }) => {
    test.setTimeout(20_000);
    const start = Date.now();
    await page.goto(`${BASE_URL}/web`, { waitUntil: "load" });

    // Wait for canvas to be sized (WASM init may take a moment)
    await expect
      .poll(
        async () => {
          return page.evaluate(() => {
            const c = document.querySelector("canvas");
            return c ? c.width * c.height : 0;
          });
        },
        { timeout: 15_000 }
      )
      .toBeGreaterThan(0);

    const dims = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      return c ? { w: c.width, h: c.height } : null;
    });
    stepLog(`canvas dims: ${dims?.w}x${dims?.h}`, start);
  });

  test("A4: No JavaScript console errors during load", async ({ page }) => {
    const start = Date.now();
    const { consoleEvents } = setupCapture(page);
    await page.goto(`${BASE_URL}/web`, { waitUntil: "load" });
    // Allow some time for async errors
    await page.waitForTimeout(2_000);

    const errors = consoleEvents.filter((e) => e.type === "error");
    stepLog(`console errors: ${errors.length}`, start, errors.length === 0 ? "pass" : "fail");

    logDiag({
      test: "A4",
      timestamp: new Date().toISOString(),
      console_errors: errors,
      total_console_events: consoleEvents.length,
    });

    expect(errors).toEqual([]);
  });

  test("A5: No failed network requests during load", async ({ page }) => {
    const start = Date.now();
    const { requestFailures } = setupCapture(page);
    await page.goto(`${BASE_URL}/web`, { waitUntil: "load" });
    await page.waitForTimeout(2_000);

    stepLog(`request failures: ${requestFailures.length}`, start, requestFailures.length === 0 ? "pass" : "fail");

    logDiag({
      test: "A5",
      timestamp: new Date().toISOString(),
      request_failures: requestFailures,
    });

    expect(requestFailures).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════
   B. ASSET LOADING TESTS
   ═══════════════════════════════════════════════════════════════════ */

test.describe("B. Asset loading", () => {
  test("B1: All expected assets load successfully", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Asset loading test requires working WebGPU demo");
    test.setTimeout(20_000);
    const start = Date.now();
    const { completedRequests, requestFailures } = setupCapture(page);

    await page.goto(`${BASE_URL}/web`, { waitUntil: "load" });
    await page.waitForTimeout(3_000); // let lazy-loaded assets settle

    const loadedUrls = completedRequests.map((r) => new URL(r.url).pathname);

    const missing: string[] = [];
    for (const asset of ALL_EXPECTED_ASSETS) {
      if (!loadedUrls.includes(asset)) {
        missing.push(asset);
      }
    }

    logDiag({
      test: "B1",
      timestamp: new Date().toISOString(),
      expected: ALL_EXPECTED_ASSETS.length,
      loaded: loadedUrls.length,
      missing,
      failures: requestFailures,
    });

    stepLog(`assets: ${ALL_EXPECTED_ASSETS.length - missing.length}/${ALL_EXPECTED_ASSETS.length} loaded`, start, missing.length === 0 ? "pass" : "fail");

    // Some assets (shakespeare.txt, sqlite3.c) may be loaded on-demand by the demo,
    // so only fail on the critical WASM/JS/font assets
    const criticalMissing = missing.filter(
      (m) => m.includes("/pkg/") || m.includes("/fonts/")
    );
    expect(criticalMissing).toEqual([]);
  });

  test("B2: WASM files served with correct Content-Type", async ({ request }) => {
    const start = Date.now();
    const results: { url: string; contentType: string | null; status: number }[] = [];

    for (const wasmPath of EXPECTED_WASM_ASSETS.filter((p) => p.endsWith(".wasm"))) {
      const response = await request.get(`${BASE_URL}${wasmPath}`);
      results.push({
        url: wasmPath,
        contentType: response.headers()["content-type"] ?? null,
        status: response.status(),
      });
    }

    logDiag({ test: "B2", timestamp: new Date().toISOString(), results });

    for (const r of results) {
      expect(r.status).toBe(200);
      expect(r.contentType).toContain("application/wasm");
      stepLog(`${r.url} → ${r.contentType}`, start);
    }
  });

  test("B3: Font served with correct Content-Type", async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${BASE_URL}${EXPECTED_FONT_ASSETS[0]}`);
    const ct = response.headers()["content-type"] ?? null;
    expect(response.status()).toBe(200);
    // woff2 files can be served as font/woff2 or application/font-woff2
    expect(ct).toMatch(/woff2|font|octet-stream/);
    stepLog(`font content-type: ${ct}`, start);
  });

  test("B4: Static assets have cache headers", async ({ request }) => {
    const start = Date.now();
    const results: { url: string; cacheControl: string | null }[] = [];

    // Test a pkg file and a font file
    for (const assetPath of [EXPECTED_WASM_ASSETS[0], EXPECTED_FONT_ASSETS[0]]) {
      const response = await request.get(`${BASE_URL}${assetPath}`);
      results.push({ url: assetPath, cacheControl: response.headers()["cache-control"] ?? null });
    }

    logDiag({ test: "B4", timestamp: new Date().toISOString(), results });

    for (const r of results) {
      expect(r.cacheControl).toBeTruthy();
      expect(r.cacheControl).toContain("max-age=");
      stepLog(`${r.url} cache: ${r.cacheControl}`, start);
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════
   C. BROWSER COMPATIBILITY TESTS
   ═══════════════════════════════════════════════════════════════════ */

test.describe("C. Browser compatibility", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Only Chromium has WebGPU — skip in other browsers"
  );

  test("C1: Chromium (WebGPU) — fallback div stays hidden", async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/web`, { waitUntil: "load" });
    await page.waitForTimeout(1_000);

    // With WebGPU available (Chromium + flags), the fallback should not be visible
    const isVisible = await page.evaluate(() => {
      const fb = document.getElementById("webgpu-fallback");
      return fb?.classList.contains("visible") ?? false;
    });

    stepLog(`webgpu-fallback visible: ${isVisible}`, start, isVisible ? "fail" : "pass");
    expect(isVisible).toBe(false);
  });
});

// Firefox/WebKit-specific tests — only run in those browser projects
test.describe("C. Browser compat — no WebGPU", () => {
  test.skip(
    ({ browserName }) => browserName === "chromium",
    "Skipped in Chromium — WebGPU is available"
  );

  test("C2: Firefox/WebKit — fallback page shown", async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/web`, { waitUntil: "load" });
    await page.waitForTimeout(2_000);

    // Without WebGPU, the fallback div should become visible
    const fallbackState = await page.evaluate(() => {
      const fb = document.getElementById("webgpu-fallback");
      if (!fb) return { exists: false, visible: false, hasContent: false };
      return {
        exists: true,
        visible: fb.classList.contains("visible"),
        hasContent: fb.textContent?.includes("WebGPU") ?? false,
      };
    });

    stepLog(`fallback state: ${JSON.stringify(fallbackState)}`, start);

    logDiag({
      test: "C2",
      timestamp: new Date().toISOString(),
      fallbackState,
    });

    expect(fallbackState.exists).toBe(true);
    expect(fallbackState.visible).toBe(true);
    expect(fallbackState.hasContent).toBe(true);
  });

  test("C3: Firefox/WebKit — fallback has nav links", async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/web`, { waitUntil: "load" });
    await page.waitForTimeout(2_000);

    const links = await page.evaluate(() => {
      const fb = document.getElementById("webgpu-fallback");
      if (!fb) return [];
      return Array.from(fb.querySelectorAll("a")).map((a) => ({
        href: a.getAttribute("href"),
        text: a.textContent?.trim(),
      }));
    });

    stepLog(`fallback links: ${links.length}`, start);

    logDiag({ test: "C3", timestamp: new Date().toISOString(), links });

    // Should have "Back to FrankenTUI" and "View Screenshots" links
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(links.some((l) => l.href === "/")).toBe(true);
    expect(links.some((l) => l.href === "/showcase")).toBe(true);
  });
});

/* ═══════════════════════════════════════════════════════════════════
   D. RESPONSIVE TESTS
   ═══════════════════════════════════════════════════════════════════ */

test.describe("D. Responsive", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Responsive error checks require WebGPU (Chromium)"
  );

  test("D1: Small viewport — no crash", async ({ page }) => {
    const start = Date.now();
    const { consoleEvents } = setupCapture(page);

    await page.setViewportSize({ width: 320, height: 480 });
    await page.goto(`${BASE_URL}/web`, { waitUntil: "load" });
    await page.waitForTimeout(2_000);

    const pageErrors = consoleEvents.filter((e) => e.type === "error");
    stepLog(`small viewport errors: ${pageErrors.length}`, start, pageErrors.length === 0 ? "pass" : "fail");
    expect(pageErrors).toEqual([]);
  });

  test("D2: Large viewport — no crash", async ({ page }) => {
    const start = Date.now();
    const { consoleEvents } = setupCapture(page);

    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto(`${BASE_URL}/web`, { waitUntil: "load" });
    await page.waitForTimeout(2_000);

    const pageErrors = consoleEvents.filter((e) => e.type === "error");
    stepLog(`large viewport errors: ${pageErrors.length}`, start, pageErrors.length === 0 ? "pass" : "fail");
    expect(pageErrors).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════
   E. PERFORMANCE TESTS
   ═══════════════════════════════════════════════════════════════════ */

test.describe("E. Performance", () => {
  test("E1: Page loads within 15 seconds", async ({ page }) => {
    test.setTimeout(20_000);
    const start = Date.now();
    const { completedRequests } = setupCapture(page);

    await page.goto(`${BASE_URL}/web`, { waitUntil: "load" });
    const loadTime = elapsed(start);

    stepLog(`page load time: ${loadTime}ms`, start);

    logDiag({
      test: "E1",
      timestamp: new Date().toISOString(),
      load_time_ms: loadTime,
      request_count: completedRequests.length,
    });

    expect(loadTime).toBeLessThan(15_000);
  });

  test("E2: Page weight — log total transferred bytes", async ({ page }) => {
    test.setTimeout(20_000);
    const start = Date.now();
    const responseSizes: { url: string; size: number }[] = [];

    page.on("response", (response) => {
      void response.body().then(
        (buf) => {
          responseSizes.push({
            url: new URL(response.url()).pathname,
            size: buf.length,
          });
        },
        () => {
          /* response body not available for some requests */
        }
      );
    });

    await page.goto(`${BASE_URL}/web`, { waitUntil: "load" });
    await page.waitForTimeout(3_000);

    const totalBytes = responseSizes.reduce((sum, r) => sum + r.size, 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

    stepLog(`total page weight: ${totalMB}MB (${responseSizes.length} resources)`, start);

    logDiag({
      test: "E2",
      timestamp: new Date().toISOString(),
      total_bytes: totalBytes,
      total_mb: totalMB,
      resource_count: responseSizes.length,
      top_resources: responseSizes
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .map((r) => ({ path: r.url, size_kb: (r.size / 1024).toFixed(1) })),
    });

    // Just log — don't enforce a strict limit since WASM bundles are large
    test.info().annotations.push({
      type: "page_weight",
      description: `${totalMB}MB across ${responseSizes.length} resources`,
    });
  });
});

/* ═══════════════════════════════════════════════════════════════════
   F. INTEGRATION WITH MAIN SITE
   ═══════════════════════════════════════════════════════════════════ */

test.describe("F. Main site integration", () => {
  test("F1: /web link exists in site header nav", async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });

    const demoLink = page.locator('header a[href="/web"]');
    await expect(demoLink.first()).toBeAttached();
    stepLog("Live Demo nav link found", start);
  });

  test("F2: Navigating /web from main site works", async ({ page }) => {
    test.setTimeout(15_000);
    const start = Date.now();
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });

    // The /web link navigates to a static HTML page (full page nav, not SPA)
    // Use Promise.all to handle navigation + click together
    await Promise.all([
      page.waitForURL("**/web**", { timeout: 10_000 }),
      page.locator('header a[href="/web"]').first().click(),
    ]);

    expect(page.url()).toContain("/web");
    await expect(page.locator("canvas").first()).toBeAttached({ timeout: 10_000 });
    stepLog("navigation from main site to /web works", start);
  });

  test("F3: version.json is accessible", async ({ page }) => {
    const start = Date.now();
    const response = await page.goto(`${BASE_URL}/web/version.json`);
    expect(response?.status()).toBe(200);

    const json = await response?.json();
    expect(json).toHaveProperty("synced_at");
    expect(json).toHaveProperty("file_count");
    expect(json).toHaveProperty("files");
    stepLog(`version.json: ${json?.file_count} files, synced ${json?.synced_at}`, start);
  });
});
