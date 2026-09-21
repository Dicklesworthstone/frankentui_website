/**
 * WASM loader utility for FrankenTerminal React component.
 *
 * Handles lazy-loading, initialization, and singleton caching of the
 * FrankenTermWeb and ShowcaseRunner WASM modules. Separated from the
 * React component to keep concerns clean and allow reuse.
 *
 * IMPORTANT: We bypass Next.js/Turbopack's import() interception by using
 * `new Function(...)` to invoke the browser's native ES module loader.
 * This is necessary because the WASM JS glue uses `import.meta.url` to
 * resolve .wasm file paths, which breaks under bundler-intercepted imports.
 *
 * Created as part of bd-11i.2.
 */

import type { FrankenTerminalAssetPaths } from "@/components/franken-terminal.types";

// ---------------------------------------------------------------------------
// Types for the WASM module exports
// ---------------------------------------------------------------------------

/** The FrankenTermWeb class constructor and init function from FrankenTerm.js */
export interface FrankenTermModule {
  FrankenTermWeb: new () => FrankenTermWebInstance;
  default: (input?: unknown) => Promise<unknown>;
}

/** Instance of FrankenTermWeb after construction */
export interface FrankenTermWebInstance {
  init(canvas: HTMLCanvasElement, options?: Record<string, unknown> | null): Promise<void>;
  fitToContainer(
    widthCss: number,
    heightCss: number,
    dpr: number,
  ): {
    cols: number;
    rows: number;
    pixelWidth: number;
    pixelHeight: number;
    cellWidthPx: number;
    cellHeightPx: number;
    dpr: number;
    zoom: number;
  };
  input(event: unknown): void;
  drainEncodedInputs(): string[];
  /** Half-open [start, end) range of cell offsets; negative values clear it. */
  setSelectionRange?(start: number, end: number): void;
  clearSelection?(): void;
  /** Selected text, or undefined when the selection is empty. */
  copySelection?(): string | undefined;
  applyPatchBatchFlat(spans: Uint32Array, cells: Uint32Array): void;
  render(): void;
  resize(cols: number, rows: number): void;
  setZoom(zoom: number): unknown;
  setScale(dpr: number, zoom: number): unknown;
  destroy(): void;
  free(): void;
}

/** The ShowcaseRunner class constructor and init function from ftui_showcase_wasm.js */
export interface ShowcaseRunnerModule {
  ShowcaseRunner: new (cols: number, rows: number) => ShowcaseRunnerInstance;
  default: (input?: unknown) => Promise<unknown>;
}

/** Instance of ShowcaseRunner after construction */
export interface ShowcaseRunnerInstance {
  init(): void;
  /** Select a screen by zero-based registry index. Absent in bundles built before this existed. */
  gotoScreen?(index: number): boolean;
  advanceTime(dtMs: number): void;
  step(): { running: boolean; rendered: boolean; events_processed: number; frame_idx: number };
  takeFlatPatches(): { spans: Uint32Array; cells: Uint32Array };
  takeLogs(): string[];
  pushEncodedInput(json: string): boolean;
  resize(cols: number, rows: number): void;
  setShakespeareText(text: string): boolean;
  setSqliteSource(text: string): boolean;
  patchHash(): string | undefined;
  patchStats(): { dirty_cells: number; patch_count: number; bytes_uploaded: number } | null;
  destroy(): void;
  free(): void;
}

/** pkg/manifest.json, emitted by frankentui's build-wasm.sh alongside the bundle */
export interface PackageManifest {
  schema: string;
  toolchain: string;
  /** Filename -> SHA-256 hex digest, for every .js and .wasm file in pkg/ */
  files: Record<string, string>;
}

/** Combined loaded modules ready for use */
export interface WasmModules {
  FrankenTermWeb: new () => FrankenTermWebInstance;
  ShowcaseRunner: new (cols: number, rows: number) => ShowcaseRunnerInstance;
}

/** Large text assets loaded from /web/assets/ */
export interface TextAssets {
  shakespeare: string;
  sqlite: string;
}

// ---------------------------------------------------------------------------
// Default asset paths
// ---------------------------------------------------------------------------

const DEFAULT_PATHS: Required<FrankenTerminalAssetPaths> = {
  wasmBase: "/web/pkg/",
  fontBase: "/web/fonts/",
  assetsBase: "/web/assets/",
  version: "",
};

function resolvePaths(custom?: FrankenTerminalAssetPaths): Required<FrankenTerminalAssetPaths> {
  return { ...DEFAULT_PATHS, ...custom };
}

function versionedUrl(base: string, file: string, version: string): string {
  const url = `${base}${file}`;
  return version ? `${url}?v=${version}` : url;
}

// ---------------------------------------------------------------------------
// WebGPU detection
// ---------------------------------------------------------------------------

/** Check if WebGPU is available in the current browser. */
export function isWebGPUSupported(): boolean {
  return typeof navigator !== "undefined" && navigator != null && "gpu" in navigator;
}

// ---------------------------------------------------------------------------
// Native ES module import (bypasses Next.js/Turbopack bundler)
// ---------------------------------------------------------------------------

/**
 * Dynamically import an ES module from a URL using the browser's native
 * module loader, bypassing any bundler interception.
 *
 * This is necessary because:
 * 1. Next.js/Turbopack intercepts import() calls and rewrites them
 * 2. The WASM JS glue uses import.meta.url to resolve .wasm file paths
 * 3. Bundler-intercepted imports break import.meta.url resolution
 */
async function nativeImport(url: string): Promise<unknown> {
  return new Function("url", "return import(url)")(url);
}

// ---------------------------------------------------------------------------
// Font loader
// ---------------------------------------------------------------------------

/** Preload the Pragmasevka NF font required for terminal rendering. */
export async function loadFont(paths?: FrankenTerminalAssetPaths): Promise<void> {
  if (typeof document === "undefined") return;
  if (!document.fonts?.load) return;

  const { fontBase, version } = resolvePaths(paths);
  const fontUrl = versionedUrl(fontBase, "pragmasevka-nf-subset.woff2", version);

  // Register the font face if not already registered
  const fontFace = new FontFace("Pragmasevka NF", `url("${fontUrl}")`, {
    weight: "400",
    style: "normal",
    display: "block",
  });

  document.fonts.add(fontFace);
  await fontFace.load();
  await document.fonts.ready;
}

// ---------------------------------------------------------------------------
// WASM module loader (singleton cache)
// ---------------------------------------------------------------------------

let cachedModules: Promise<WasmModules> | null = null;
let cachedPaths: FrankenTerminalAssetPaths | undefined;
let cachedManifest: Promise<PackageManifest | null> | null = null;
/** Which wasmBase `cachedManifest` was fetched from, so a different base refetches. */
let cachedManifestBase: string | null = null;

/**
 * Fetch the bundle's package manifest, or null if it is unavailable.
 *
 * /web/pkg/* is served `immutable, max-age=31536000`, so a bare URL pins a
 * returning visitor to whichever build their browser cached first. The manifest
 * carries a SHA-256 per file, which is used below as a cache-busting query so a
 * redeploy is picked up automatically without a version constant to bump.
 */
async function loadPackageManifest(wasmBase: string): Promise<PackageManifest | null> {
  if (!cachedManifest || cachedManifestBase !== wasmBase) {
    cachedManifestBase = wasmBase;
    cachedManifest = (async () => {
      try {
        const response = await fetch(`${wasmBase}manifest.json`, { cache: "no-store" });
        if (!response.ok) return null;
        const manifest = (await response.json()) as PackageManifest;
        return manifest?.schema === "ftui-browser-package-v1" ? manifest : null;
      } catch {
        return null;
      }
    })();
  }
  return cachedManifest;
}

/**
 * Load and initialize both WASM modules. First call triggers the download;
 * subsequent calls return the cached promise.
 *
 * Call `resetWasmCache()` if you need to force a reload (e.g. after error).
 */
export function loadWasmModules(paths?: FrankenTerminalAssetPaths): Promise<WasmModules> {
  if (!cachedModules || paths !== cachedPaths) {
    cachedPaths = paths;
    cachedModules = doLoadWasmModules(paths);
    // If loading fails, clear the cache so retry is possible
    cachedModules.catch(() => {
      cachedModules = null;
    });
  }
  return cachedModules;
}

/** Clear the cached WASM modules, forcing a fresh load on next call. */
export function resetWasmCache(): void {
  cachedModules = null;
  cachedPaths = undefined;
  cachedManifest = null;
  cachedManifestBase = null;
}

async function doLoadWasmModules(paths?: FrankenTerminalAssetPaths): Promise<WasmModules> {
  const { wasmBase, version } = resolvePaths(paths);

  // Prefer the manifest's content hash; fall back to the configured version so
  // the loader still works against a bundle built before manifests existed.
  const manifest = await loadPackageManifest(wasmBase);
  const packageUrl = (file: string): string => {
    const hash = manifest?.files?.[file];
    return hash ? `${wasmBase}${file}?sha256=${hash}` : versionedUrl(wasmBase, file, version);
  };

  const termJsUrl = packageUrl("FrankenTerm.js");
  const runnerJsUrl = packageUrl("ftui_showcase_wasm.js");
  const termWasmUrl = packageUrl("FrankenTerm_bg.wasm");
  const runnerWasmUrl = packageUrl("ftui_showcase_wasm_bg.wasm");

  // Load both JS glue modules in parallel via native import
  const [termMod, runnerMod] = await Promise.all([
    nativeImport(termJsUrl) as Promise<FrankenTermModule>,
    nativeImport(runnerJsUrl) as Promise<ShowcaseRunnerModule>,
  ]);

  // Initialize both WASM modules (fetches and compiles .wasm files)
  await Promise.all([
    termMod.default(new URL(termWasmUrl, window.location.origin)),
    runnerMod.default(new URL(runnerWasmUrl, window.location.origin)),
  ]);

  return {
    FrankenTermWeb: termMod.FrankenTermWeb,
    ShowcaseRunner: runnerMod.ShowcaseRunner,
  };
}

// ---------------------------------------------------------------------------
// Text asset loader (separate from WASM — optional, ~14MB total)
// ---------------------------------------------------------------------------

let cachedTextAssets: Promise<TextAssets | null> | null = null;
let cachedTextPaths: FrankenTerminalAssetPaths | undefined;

/**
 * Load the large text assets (Shakespeare corpus + SQLite source).
 * These are optional — only needed for specific demo screens.
 * Returns null if loading fails (non-fatal).
 */
export function loadTextAssets(paths?: FrankenTerminalAssetPaths): Promise<TextAssets | null> {
  if (!cachedTextAssets || paths !== cachedTextPaths) {
    cachedTextPaths = paths;
    cachedTextAssets = doLoadTextAssets(paths);
    cachedTextAssets.catch(() => {
      cachedTextAssets = null;
    });
  }
  return cachedTextAssets;
}

async function doLoadTextAssets(paths?: FrankenTerminalAssetPaths): Promise<TextAssets | null> {
  const { assetsBase, version } = resolvePaths(paths);

  try {
    const shakespeareUrl = versionedUrl(assetsBase, "shakespeare.txt", version);
    const sqliteUrl = versionedUrl(assetsBase, "sqlite3.c", version);

    const [shakespeare, sqlite] = await Promise.all([
      fetch(shakespeareUrl).then((r) => {
        if (!r.ok) throw new Error(`GET ${shakespeareUrl} → ${r.status}`);
        return r.text();
      }),
      fetch(sqliteUrl).then((r) => {
        if (!r.ok) throw new Error(`GET ${sqliteUrl} → ${r.status}`);
        return r.text();
      }),
    ]);

    return { shakespeare, sqlite };
  } catch (e) {
    console.warn(
      "[wasm-loader] Failed to fetch text assets; some demo screens may be unavailable.",
      e,
    );
    return null;
  }
}

/** Clear the cached text assets. */
export function resetTextAssetsCache(): void {
  cachedTextAssets = null;
  cachedTextPaths = undefined;
}
