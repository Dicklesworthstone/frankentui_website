/**
 * FrankenTerminal — React component API design document
 *
 * This file defines the public props interface, imperative handle,
 * and supporting types for the FrankenTerminal React component.
 *
 * The component wraps FrankenTermWeb (WebGPU terminal renderer) and
 * ShowcaseRunner (WASM showcase application) into a drop-in React widget.
 *
 * Created as part of bd-11i.1 (design task). Implementation in bd-11i.2+.
 */

import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Imperative handle (exposed via React.forwardRef + useImperativeHandle)
// ---------------------------------------------------------------------------

/** Imperative API exposed via ref for host-driven control. */
export interface FrankenTerminalHandle {
  /** Navigate to a specific demo screen (1-indexed). */
  goToScreen(screen: number): void;

  /** Send a raw input event to the WASM terminal. */
  sendInput(event: FrankenTerminalInputEvent): void;

  /** Get current terminal dimensions. */
  getGeometry(): { cols: number; rows: number };

  /** Get the underlying canvas element (for screenshots, etc.). */
  getCanvas(): HTMLCanvasElement | null;

  /** Programmatically set zoom level. */
  setZoom(zoom: number): void;

  /** Force a re-render of the terminal surface. */
  forceRender(): void;

  /** Destroy WASM instances and release GPU resources. */
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Input event types (mirrors the WASM input() API shape)
// ---------------------------------------------------------------------------

export type FrankenTerminalInputEvent =
  | {
      kind: "key";
      phase: "down" | "up";
      key: string;
      code: string;
      mods?: number;
      repeat?: boolean;
    }
  | {
      kind: "mouse";
      phase: "down" | "up" | "move";
      button: number;
      x: number;
      y: number;
      mods?: number;
    }
  | { kind: "wheel"; x: number; y: number; dx: number; dy: number; mods?: number }
  | { kind: "paste"; data: string }
  | { kind: "focus"; focused: boolean };

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface FrankenTerminalProps {
  // ── Sizing ──────────────────────────────────────────────────────────

  /** CSS width of the container. Default: "100%" */
  width?: number | string;

  /** CSS height of the container. Default: "400px" */
  height?: number | string;

  /** Additional CSS classes applied to the outer wrapper. */
  className?: string;

  // ── Terminal configuration ──────────────────────────────────────────

  /** Initial column count. Default: auto-fit to container. */
  initialCols?: number;

  /** Initial row count. Default: auto-fit to container. */
  initialRows?: number;

  /** Cell width in CSS pixels. Default: 8 */
  cellWidth?: number;

  /** Cell height in CSS pixels. Default: 16 */
  cellHeight?: number;

  /** Which demo screen to start on (1-indexed). Default: 1 */
  initialScreen?: number;

  /** Initial zoom level. Default: 1.0 */
  zoom?: number;

  // ── Behavior ───────────────────────────────────────────────────────

  /** Focus the canvas on mount. Default: false */
  autoFocus?: boolean;

  /**
   * Capture keyboard events when focused. Default: true.
   * Set to false for thumbnail/preview embeds where you don't want
   * the terminal to intercept page navigation keys.
   */
  captureKeys?: boolean;

  /** Show the cols×rows status bar overlay. Default: true */
  showStatus?: boolean;

  /**
   * Load large text assets (Shakespeare, SQLite source).
   * These are ~14MB total. Default: true.
   * Set to false for lightweight embeds where those demo screens
   * aren't needed (saves bandwidth).
   */
  loadTextAssets?: boolean;

  /**
   * localStorage key under which the pane workspace (split ratios, docking,
   * layout history) is saved as it changes and restored on load, as /web does.
   * Default: "ftui-pane-workspace-react-v1", separate from /web's key so an
   * embed does not overwrite the full demo's layout. `null` disables
   * persistence. Widgets that share a key share a layout.
   */
  workspaceStorageKey?: string | null;

  // ── Callbacks ──────────────────────────────────────────────────────

  /** Fired when WASM loads and the first frame renders. */
  onReady?: () => void;

  /** Fired on WASM load failure or runtime error. */
  onError?: (error: Error) => void;

  /** Fired when the terminal grid resizes (e.g. container resize). */
  onResize?: (cols: number, rows: number) => void;

  /** Fired on each rendered frame (useful for perf monitoring). */
  onFrame?: (frameIndex: number) => void;

  // ── Loading / Error UI ─────────────────────────────────────────────

  /** Custom loading UI. Default: built-in progress bar with status text. */
  loadingComponent?: ReactNode;

  /** Custom error UI. Default: built-in error message with browser compat info. */
  errorComponent?: ReactNode;

  /**
   * Custom "WebGPU not supported" fallback UI.
   * Default: built-in fallback with supported browser list and links.
   */
  fallbackComponent?: ReactNode;
}

// ---------------------------------------------------------------------------
// Internal state machine (for implementation reference)
// ---------------------------------------------------------------------------

/** Loading lifecycle states. */
export type FrankenTerminalState =
  | "checking-webgpu" // Detecting navigator.gpu
  | "loading-font" // Waiting for Pragmasevka NF font
  | "loading-wasm" // Fetching and instantiating WASM modules
  | "initializing" // FrankenTermWeb.init() + ShowcaseRunner.init()
  | "running" // Frame loop active
  | "error" // Unrecoverable error
  | "unsupported"; // WebGPU not available

// ---------------------------------------------------------------------------
// Asset paths (configurable for CDN / versioned deploys)
// ---------------------------------------------------------------------------

/** Override default asset paths for WASM modules and fonts. */
export interface FrankenTerminalAssetPaths {
  /** Base URL for WASM/JS modules. Default: "/web/pkg/" */
  wasmBase?: string;

  /** Base URL for font files. Default: "/web/fonts/" */
  fontBase?: string;

  /** Base URL for large text assets. Default: "/web/assets/" */
  assetsBase?: string;

  /** Cache-busting version string appended as ?v= query param. */
  version?: string;
}
