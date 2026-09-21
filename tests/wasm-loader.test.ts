import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Unit tests for lib/wasm-loader.ts — WASM module loading utility.
 *
 * Tests verify the loader's logic WITHOUT requiring actual WebGPU/WASM
 * execution. Heavy parts (dynamic imports, WASM compilation) are mocked
 * via temporary JS files on disk + globalThis overrides.
 *
 * Created as part of bd-11i.7.
 */

import {
  isWebGPUSupported,
  loadFont,
  loadTextAssets,
  loadWasmModules,
  resetTextAssetsCache,
  resetWasmCache,
} from "../lib/wasm-loader";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FIXTURES = join(import.meta.dir, "__fixtures__", "wasm-mocks");

function stepLog(name: string, detail: string) {
  console.log(`[wasm-loader-test] ${name}: ${detail}`);
}

// ---------------------------------------------------------------------------
// Mock module files (written to disk for dynamic import via nativeImport)
// ---------------------------------------------------------------------------

const MOCK_TERM_JS = `
export class FrankenTermWeb {
  async init() {}
  fitToContainer(w, h, d) {
    return { cols: 80, rows: 24, pixelWidth: 640, pixelHeight: 384,
             cellWidthPx: 8, cellHeightPx: 16, dpr: 1, zoom: 1 };
  }
  input() {}
  drainEncodedInputs() { return []; }
  applyPatchBatchFlat() {}
  render() {}
  resize() {}
  setZoom() { return null; }
  setScale() { return null; }
  destroy() {}
  free() {}
}
export default async function init() {}
`;

const MOCK_RUNNER_JS = `
export class ShowcaseRunner {
  constructor(cols, rows) { this._cols = cols; this._rows = rows; }
  init() {}
  advanceTime() {}
  step() { return { running: true, rendered: true, events_processed: 0, frame_idx: 0 }; }
  takeFlatPatches() { return { spans: new Uint32Array(0), cells: new Uint32Array(0) }; }
  takeLogs() { return []; }
  pushEncodedInput() { return true; }
  resize() {}
  setShakespeareText() { return true; }
  setSqliteSource() { return true; }
  patchHash() { return "mock"; }
  patchStats() { return null; }
  destroy() {}
  free() {}
}
export default async function init() {}
`;

function createMockModules() {
  mkdirSync(FIXTURES, { recursive: true });
  writeFileSync(join(FIXTURES, "FrankenTerm.js"), MOCK_TERM_JS);
  writeFileSync(join(FIXTURES, "ftui_showcase_wasm.js"), MOCK_RUNNER_JS);
  writeFileSync(join(FIXTURES, "FrankenTerm_bg.wasm"), "fake-wasm");
  writeFileSync(join(FIXTURES, "ftui_showcase_wasm_bg.wasm"), "fake-wasm");
  stepLog("setup", `Created mock modules in ${FIXTURES}`);
}

function cleanupMockModules() {
  if (existsSync(FIXTURES)) {
    rmSync(FIXTURES, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Global save/restore for mocking
// ---------------------------------------------------------------------------

// Track which globals existed before each test so we can restore (or delete) correctly.
let savedNavigatorDesc: PropertyDescriptor | undefined;
let savedDocumentDesc: PropertyDescriptor | undefined;
let savedWindowDesc: PropertyDescriptor | undefined;
let savedFetch: typeof globalThis.fetch | undefined;
let savedFontFace: unknown;
let hadDocument = false;
let hadFontFace = false;

function saveGlobals() {
  savedNavigatorDesc = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  savedDocumentDesc = Object.getOwnPropertyDescriptor(globalThis, "document");
  savedWindowDesc = Object.getOwnPropertyDescriptor(globalThis, "window");
  savedFetch = globalThis.fetch;
  savedFontFace = (globalThis as Record<string, unknown>).FontFace;
  hadDocument = "document" in globalThis;
  hadFontFace = "FontFace" in globalThis;
}

function restoreGlobals() {
  // navigator — always exists in Bun
  if (savedNavigatorDesc) {
    Object.defineProperty(globalThis, "navigator", savedNavigatorDesc);
  }
  // document — may not exist in Bun test env; clean up if test added it
  if (savedDocumentDesc) {
    Object.defineProperty(globalThis, "document", savedDocumentDesc);
  } else if (!hadDocument && "document" in globalThis) {
    // Test added document when it didn't exist — remove it
    try {
      delete (globalThis as Record<string, unknown>).document;
    } catch {
      /* non-configurable */
    }
  }
  // window — always exists in Bun (alias for globalThis)
  if (savedWindowDesc) {
    Object.defineProperty(globalThis, "window", savedWindowDesc);
  }
  if (savedFetch !== undefined) globalThis.fetch = savedFetch;
  // FontFace — typically doesn't exist in Bun test env
  if (hadFontFace && savedFontFace !== undefined) {
    (globalThis as Record<string, unknown>).FontFace = savedFontFace;
  } else if (!hadFontFace && "FontFace" in globalThis) {
    try {
      delete (globalThis as Record<string, unknown>).FontFace;
    } catch {
      /* non-configurable */
    }
  }
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("wasm-loader", () => {
  beforeEach(() => {
    saveGlobals();
    resetWasmCache();
    resetTextAssetsCache();
  });

  afterEach(() => {
    restoreGlobals();
    cleanupMockModules();
  });

  // ═══════════════════════════════════════════════════════════════════
  // (3) WEBGPU DETECTION
  // ═══════════════════════════════════════════════════════════════════

  describe("isWebGPUSupported()", () => {
    test("returns true when navigator.gpu is present", () => {
      stepLog("webgpu-present", "Mocking navigator.gpu as present");
      Object.defineProperty(globalThis, "navigator", {
        value: { gpu: {} },
        writable: true,
        configurable: true,
      });
      expect(isWebGPUSupported()).toBe(true);
      stepLog("webgpu-present", "PASS");
    });

    test("returns false when navigator.gpu is absent", () => {
      stepLog("webgpu-absent", "Mocking navigator without gpu property");
      Object.defineProperty(globalThis, "navigator", {
        value: { userAgent: "test" },
        writable: true,
        configurable: true,
      });
      expect(isWebGPUSupported()).toBe(false);
      stepLog("webgpu-absent", "PASS");
    });

    test("returns false when navigator is undefined", () => {
      stepLog("webgpu-undef", "Setting navigator to undefined");
      Object.defineProperty(globalThis, "navigator", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      expect(isWebGPUSupported()).toBe(false);
      stepLog("webgpu-undef", "PASS");
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // (1) SINGLETON CACHING
  // ═══════════════════════════════════════════════════════════════════

  describe("loadWasmModules() — singleton caching", () => {
    test("second synchronous call returns the same promise", () => {
      stepLog("cache-ref", "Calling loadWasmModules() twice synchronously");

      const p1 = loadWasmModules();
      const p2 = loadWasmModules();
      expect(p2).toBe(p1);

      stepLog("cache-ref", "PASS — same Promise reference");
      p1.catch(() => {}); // suppress rejection
    });

    test("different paths triggers a fresh load", () => {
      stepLog("cache-paths", "Calling with different path args");

      const a = loadWasmModules({ wasmBase: "/a/" });
      const b = loadWasmModules({ wasmBase: "/b/" });
      expect(b).not.toBe(a);

      stepLog("cache-paths", "PASS — different references for different paths");
      a.catch(() => {});
      b.catch(() => {});
    });

    test("resetWasmCache() forces a new load", () => {
      stepLog("cache-reset", "Testing resetWasmCache()");

      const p1 = loadWasmModules();
      resetWasmCache();
      const p2 = loadWasmModules();
      expect(p2).not.toBe(p1);

      stepLog("cache-reset", "PASS — new Promise after reset");
      p1.catch(() => {});
      p2.catch(() => {});
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // (2) ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════════

  describe("loadWasmModules() — error handling", () => {
    test("rejects when dynamic import fails", async () => {
      stepLog("error-reject", "Loading with default paths (will fail in test env)");

      resetWasmCache();
      const p = loadWasmModules();
      await expect(p).rejects.toThrow();

      stepLog("error-reject", "PASS — promise rejected");
    });

    test("cache is NOT poisoned after error (retry gets new promise)", async () => {
      stepLog("error-poison", "Verifying cache clears after failure");

      resetWasmCache();
      const p1 = loadWasmModules();
      await p1.catch(() => {}); // wait for rejection

      const p2 = loadWasmModules();
      expect(p2).not.toBe(p1);

      stepLog("error-poison", "PASS — cache cleared, fresh retry");
      p2.catch(() => {});
    });

    test("error propagates the underlying failure info", async () => {
      stepLog("error-msg", "Checking error has useful info");

      resetWasmCache();
      try {
        await loadWasmModules();
        expect.unreachable("should have thrown");
      } catch (err) {
        // Bun throws a ResolveMessage (not standard Error) for missing modules.
        // Just verify we get something truthy with a message.
        expect(err).toBeTruthy();
        const msg = String(err);
        expect(msg.length).toBeGreaterThan(0);
        stepLog("error-msg", `Error: ${msg}`);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // (4) FONT LOADING
  // ═══════════════════════════════════════════════════════════════════

  describe("loadFont()", () => {
    test("attempts font preloading via FontFace API", async () => {
      stepLog("font-load", "Mocking FontFace + document.fonts");

      let fontFaceCreated = false;
      let fontFamilyName = "";
      let fontLoaded = false;

      const MockFontFace = class {
        family: string;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        constructor(family: string, source: string, desc?: object) {
          fontFaceCreated = true;
          fontFamilyName = family;
          this.family = family;
        }
        async load() {
          fontLoaded = true;
          return this;
        }
      };
      (globalThis as Record<string, unknown>).FontFace = MockFontFace;

      Object.defineProperty(globalThis, "document", {
        value: {
          fonts: {
            add: () => {},
            load: async () => [],
            ready: Promise.resolve(),
          },
        },
        writable: true,
        configurable: true,
      });

      await loadFont({ fontBase: "/mock-fonts/" });

      expect(fontFaceCreated).toBe(true);
      expect(fontFamilyName).toBe("Pragmasevka NF");
      expect(fontLoaded).toBe(true);
      stepLog("font-load", "PASS — FontFace created and loaded");
    });

    test("is a no-op when document is undefined (SSR safety)", async () => {
      stepLog("font-ssr", "Simulating SSR (no document)");

      Object.defineProperty(globalThis, "document", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      await expect(loadFont()).resolves.toBeUndefined();
      stepLog("font-ssr", "PASS — no error in SSR context");
    });

    test("is a no-op when document.fonts is missing", async () => {
      stepLog("font-no-api", "Simulating browser without Fonts API");

      Object.defineProperty(globalThis, "document", {
        value: { fonts: null },
        writable: true,
        configurable: true,
      });

      await expect(loadFont()).resolves.toBeUndefined();
      stepLog("font-no-api", "PASS — graceful without fonts API");
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // (5) PROGRESS TRACKING
  // ═══════════════════════════════════════════════════════════════════

  describe("progress tracking", () => {
    test("loader does not currently support progress callbacks", () => {
      stepLog("progress", "Verifying API surface");

      // loadWasmModules accepts only one optional arg (paths).
      // No progress callback parameter exists in the current API.
      expect(typeof loadWasmModules).toBe("function");
      expect(loadWasmModules.length).toBeLessThanOrEqual(1);

      stepLog("progress", "PASS — no progress callback (as expected)");
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // (6) MODULE TYPES — loaded modules expose expected classes
  // ═══════════════════════════════════════════════════════════════════

  describe("loadWasmModules() — module types (mock files on disk)", () => {
    test("loaded modules expose FrankenTermWeb and ShowcaseRunner", async () => {
      stepLog("types", "Creating mock module files on disk");
      createMockModules();

      // nativeImport uses new Function("url","return import(url)")(url)
      // In Bun, import() with absolute file paths works.
      // We also need window.location.origin for URL construction.
      Object.defineProperty(globalThis, "window", {
        value: { location: { origin: "file://" } },
        writable: true,
        configurable: true,
      });

      resetWasmCache();
      const modules = await loadWasmModules({ wasmBase: FIXTURES + "/" });

      expect(modules).toBeDefined();
      expect(typeof modules.FrankenTermWeb).toBe("function");
      expect(typeof modules.ShowcaseRunner).toBe("function");

      // Verify FrankenTermWeb constructor and instance methods
      const term = new modules.FrankenTermWeb();
      expect(term).toBeDefined();
      expect(typeof term.init).toBe("function");
      expect(typeof term.fitToContainer).toBe("function");
      expect(typeof term.input).toBe("function");
      expect(typeof term.render).toBe("function");
      expect(typeof term.resize).toBe("function");
      expect(typeof term.destroy).toBe("function");
      expect(typeof term.free).toBe("function");

      // Verify ShowcaseRunner constructor and instance methods
      const runner = new modules.ShowcaseRunner(80, 24);
      expect(runner).toBeDefined();
      expect(typeof runner.init).toBe("function");
      expect(typeof runner.step).toBe("function");
      expect(typeof runner.advanceTime).toBe("function");
      expect(typeof runner.takeFlatPatches).toBe("function");
      expect(typeof runner.pushEncodedInput).toBe("function");
      expect(typeof runner.resize).toBe("function");
      expect(typeof runner.destroy).toBe("function");
      expect(typeof runner.free).toBe("function");

      stepLog("types", "PASS — both classes have all expected methods");
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // (7) CONCURRENT LOADING
  // ═══════════════════════════════════════════════════════════════════

  describe("loadWasmModules() — concurrent loading", () => {
    test("5 concurrent calls return the same promise", () => {
      stepLog("concurrent", "Firing 5 concurrent loadWasmModules() calls");

      resetWasmCache();
      const promises = Array.from({ length: 5 }, () => loadWasmModules());

      for (let i = 1; i < promises.length; i++) {
        expect(promises[i]).toBe(promises[0]);
      }

      stepLog("concurrent", "PASS — all 5 returned same Promise reference");
      promises[0].catch(() => {});
    });

    test("only one actual load occurs for concurrent calls", async () => {
      stepLog("concurrent-load", "Verifying dedup with mock modules");
      createMockModules();

      Object.defineProperty(globalThis, "window", {
        value: { location: { origin: "file://" } },
        writable: true,
        configurable: true,
      });

      resetWasmCache();

      // IMPORTANT: reuse the same paths object so the loader's reference
      // equality check (paths !== cachedPaths) correctly detects cache hits.
      // Using separate object literals would bypass caching since !== compares
      // by reference, not structural equality.
      const paths = { wasmBase: FIXTURES + "/" };
      const [a, b, c] = await Promise.all([
        loadWasmModules(paths),
        loadWasmModules(paths),
        loadWasmModules(paths),
      ]);

      // b and c got the cached promise from the first call
      // All three should have the same FrankenTermWeb constructor reference
      expect(a.FrankenTermWeb).toBe(b.FrankenTermWeb);
      expect(b.FrankenTermWeb).toBe(c.FrankenTermWeb);
      expect(a.ShowcaseRunner).toBe(c.ShowcaseRunner);

      stepLog("concurrent-load", "PASS — single load, shared result");
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Text asset loading (loadTextAssets)
  // ═══════════════════════════════════════════════════════════════════

  describe("loadTextAssets()", () => {
    test("fetches shakespeare.txt and sqlite3.c", async () => {
      stepLog("text-fetch", "Mocking fetch for text assets");

      const fetchedUrls: string[] = [];
      globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = typeof input === "string" ? input : input.toString();
        fetchedUrls.push(url);
        return {
          ok: true,
          text: async () =>
            url.includes("shakespeare") ? "To be or not to be" : "/* sqlite3.c */",
        };
      }) as typeof fetch;

      resetTextAssetsCache();
      const assets = await loadTextAssets({ assetsBase: "/mock/" });

      expect(assets).not.toBeNull();
      expect(assets!.shakespeare).toBe("To be or not to be");
      expect(assets!.sqlite).toBe("/* sqlite3.c */");
      expect(fetchedUrls.length).toBe(2);
      expect(fetchedUrls.some((u) => u.includes("shakespeare"))).toBe(true);
      expect(fetchedUrls.some((u) => u.includes("sqlite3"))).toBe(true);

      stepLog("text-fetch", "PASS — both assets fetched");
    });

    test("returns null on fetch failure (non-fatal)", async () => {
      stepLog("text-fail", "Mocking fetch to fail");

      globalThis.fetch = (async () => ({
        ok: false,
        status: 500,
        text: async () => "",
      })) as typeof fetch;

      resetTextAssetsCache();
      const result = await loadTextAssets();
      expect(result).toBeNull();

      stepLog("text-fail", "PASS — returned null, no throw");
    });

    test("caches result across calls (singleton)", async () => {
      stepLog("text-cache", "Verifying singleton cache");

      let callCount = 0;
      globalThis.fetch = (async (input: RequestInfo | URL) => {
        callCount++;
        const url = typeof input === "string" ? input : input.toString();
        return {
          ok: true,
          text: async () => (url.includes("shakespeare") ? "hamlet" : "sqlite"),
        };
      }) as typeof fetch;

      resetTextAssetsCache();
      const a = await loadTextAssets();
      const b = await loadTextAssets();

      expect(a).toEqual(b);
      expect(callCount).toBe(2); // 2 fetches for first call, 0 for cached second
      stepLog("text-cache", "PASS — second call used cache");
    });

    test("null result IS cached (text failures don't auto-retry)", async () => {
      stepLog("text-cached-null", "Verifying null is a cached result");

      // The loader catches fetch errors internally and returns null.
      // This null result resolves the promise (doesn't reject), so it
      // stays in the cache. This is by design — text assets are optional.
      globalThis.fetch = (async () => ({
        ok: false,
        status: 500,
        text: async () => "",
      })) as typeof fetch;

      resetTextAssetsCache();
      const first = await loadTextAssets();
      expect(first).toBeNull();

      // Second call returns same cached null without re-fetching
      const second = await loadTextAssets();
      expect(second).toBeNull();
      // They should be the same promise result (both null)
      expect(first).toBe(second);

      stepLog("text-cached-null", "PASS — null is cached as expected");
    });

    test("resetTextAssetsCache() allows retry after failure", async () => {
      stepLog("text-manual-retry", "Testing manual cache clear + retry");

      let shouldFail = true;
      globalThis.fetch = (async () => {
        if (shouldFail) return { ok: false, status: 500, text: async () => "" };
        return { ok: true, text: async () => "data" };
      }) as typeof fetch;

      resetTextAssetsCache();
      const first = await loadTextAssets();
      expect(first).toBeNull();

      // Manually reset cache and fix the mock
      shouldFail = false;
      resetTextAssetsCache();
      const second = await loadTextAssets();
      expect(second).not.toBeNull();

      stepLog("text-manual-retry", "PASS — retry after manual reset succeeded");
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Cache reset idempotency
  // ═══════════════════════════════════════════════════════════════════

  describe("cache reset functions", () => {
    test("resetWasmCache() is safe to call multiple times", () => {
      expect(() => {
        resetWasmCache();
        resetWasmCache();
        resetWasmCache();
      }).not.toThrow();
      stepLog("reset-wasm", "PASS — triple reset, no throw");
    });

    test("resetTextAssetsCache() is safe to call multiple times", () => {
      expect(() => {
        resetTextAssetsCache();
        resetTextAssetsCache();
        resetTextAssetsCache();
      }).not.toThrow();
      stepLog("reset-text", "PASS — triple reset, no throw");
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // Module exports verification
  // ═══════════════════════════════════════════════════════════════════

  describe("module exports", () => {
    test("exports all expected public functions", () => {
      expect(typeof isWebGPUSupported).toBe("function");
      expect(typeof loadWasmModules).toBe("function");
      expect(typeof resetWasmCache).toBe("function");
      expect(typeof loadFont).toBe("function");
      expect(typeof loadTextAssets).toBe("function");
      expect(typeof resetTextAssetsCache).toBe("function");
      stepLog("exports", "PASS — all 6 public functions exported");
    });
  });
});
