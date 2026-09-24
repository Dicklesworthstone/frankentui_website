/**
 * Pane workspace persistence for the React terminal widget.
 *
 * The standalone /web page saves the showcase's pane layout (split ratios,
 * docking, undo history) to localStorage whenever it changes and restores it
 * on load; the React widget did neither, so a reload lost every layout change
 * (bd-ers). This mirrors /web's contract (public/web/index.html,
 * persistPaneWorkspace / restorePaneWorkspace):
 *
 * - save only while no pointer is dragging, and only when the runner reports
 *   the workspace dirty;
 * - write the exported snapshot, then acknowledge the generation it was
 *   exported at with paneMarkWorkspaceSaved, so a change made after the export
 *   stays dirty and is saved next time;
 * - after a failed save, wait before trying again rather than retrying on
 *   every frame.
 *
 * Every runner method is optional: bundles built before the pane workspace
 * existed simply never save or restore.
 */

import type { ShowcaseRunnerInstance } from "./wasm-loader";

export const SAVE_RETRY_MS = 2000;

/** The subset of Storage this needs, so tests can pass a plain object. */
export interface WorkspaceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

type Runner = Pick<
  ShowcaseRunnerInstance,
  | "paneExportWorkspaceSnapshot"
  | "paneImportWorkspaceSnapshot"
  | "paneWorkspaceDirty"
  | "paneWorkspaceGeneration"
  | "paneMarkWorkspaceSaved"
  | "paneActivePointerId"
>;

/** Import a saved workspace. Returns whether one was restored. */
export function restoreWorkspace(runner: Runner, storage: WorkspaceStorage | null, key: string): boolean {
  if (!storage || typeof runner.paneImportWorkspaceSnapshot !== "function") return false;
  let snapshot: string | null;
  try {
    snapshot = storage.getItem(key);
  } catch {
    return false;
  }
  if (!snapshot) return false;
  try {
    return runner.paneImportWorkspaceSnapshot(snapshot);
  } catch {
    // A snapshot from an incompatible bundle: start from the default layout.
    return false;
  }
}

/** Saves the workspace when it changed; call once per frame. */
export class WorkspaceSaver {
  private nextAttemptAt = 0;

  constructor(
    private readonly runner: Runner,
    private readonly storage: WorkspaceStorage | null,
    private readonly key: string,
  ) {}

  /** Returns true when a snapshot was written and acknowledged. */
  maybeSave(nowMs: number): boolean {
    const r = this.runner;
    if (
      !this.storage ||
      typeof r.paneExportWorkspaceSnapshot !== "function" ||
      typeof r.paneMarkWorkspaceSaved !== "function" ||
      typeof r.paneWorkspaceGeneration !== "function" ||
      typeof r.paneWorkspaceDirty !== "function"
    ) {
      return false;
    }
    if (nowMs < this.nextAttemptAt) return false;
    try {
      // Mid-drag the layout changes every frame; save the settled result.
      if (typeof r.paneActivePointerId === "function" && r.paneActivePointerId() !== undefined) {
        return false;
      }
      if (!r.paneWorkspaceDirty()) return false;
      // The generation is read before the export, so an edit that lands
      // between the two is acknowledged at the older generation and stays dirty.
      const generation = r.paneWorkspaceGeneration();
      const snapshot = r.paneExportWorkspaceSnapshot();
      if (!snapshot) return this.backOff(nowMs);
      this.storage.setItem(this.key, snapshot);
      if (!r.paneMarkWorkspaceSaved(generation)) return this.backOff(nowMs);
    } catch {
      // Storage full or disabled, or a runner error: try again later.
      return this.backOff(nowMs);
    }
    this.nextAttemptAt = 0;
    return true;
  }

  private backOff(nowMs: number): false {
    this.nextAttemptAt = nowMs + SAVE_RETRY_MS;
    return false;
  }
}

/**
 * Routes mouse drags through the runner's pane pointer API, as /web does.
 *
 * Terminal mouse events alone move a splitter too, but only the pane API
 * updates the pane *workspace* - the layout that has a generation, can be
 * exported, and is what WorkspaceSaver persists. Measured on 2026-09-24: the
 * same divider drag wrote a 3.3 KB snapshot on /web and nothing in the React
 * widget until drags went through here.
 *
 * Mouse only (one pointer, id 1); touch keeps the widget's own gestures. The
 * caller still sends the ordinary terminal mouse input, as /web does.
 */
export class PanePointerRouter {
  static readonly POINTER_ID = 1;
  private active = false;

  constructor(
    private readonly runner: Pick<
      ShowcaseRunnerInstance,
      | "panePointerDownAt"
      | "panePointerMoveAt"
      | "panePointerUpAt"
      | "panePointerCancel"
      | "panePointerCaptureAcquired"
    >,
  ) {}

  /** Whether a pane drag is in progress (the caller should track the mouse outside the canvas). */
  get isActive(): boolean {
    return this.active;
  }

  /** Returns true when the pane layer took the press (a splitter or pane edge). */
  down(button: number, x: number, y: number, mods: number): boolean {
    const r = this.runner;
    if (typeof r.panePointerDownAt !== "function") return false;
    try {
      const dispatch = r.panePointerDownAt(PanePointerRouter.POINTER_ID, button, x, y, mods);
      this.active = dispatch?.accepted === true;
      // The caller follows the mouse on window while active, which is the
      // capture the runner asks for; acknowledge it as /web does.
      if (
        this.active &&
        dispatch?.capture_command?.kind === "acquire" &&
        typeof r.panePointerCaptureAcquired === "function"
      ) {
        r.panePointerCaptureAcquired(PanePointerRouter.POINTER_ID);
      }
    } catch {
      this.active = false;
    }
    return this.active;
  }

  move(x: number, y: number, mods: number): void {
    if (!this.active || typeof this.runner.panePointerMoveAt !== "function") return;
    try {
      this.runner.panePointerMoveAt(PanePointerRouter.POINTER_ID, x, y, mods);
    } catch {
      this.cancel();
    }
  }

  up(button: number, x: number, y: number, mods: number): void {
    if (!this.active) return;
    this.active = false;
    try {
      this.runner.panePointerUpAt?.(PanePointerRouter.POINTER_ID, button, x, y, mods);
    } catch {
      // The gesture is over either way.
    }
  }

  cancel(): void {
    if (!this.active) return;
    this.active = false;
    try {
      this.runner.panePointerCancel?.(PanePointerRouter.POINTER_ID);
    } catch {
      // Nothing left to release.
    }
  }
}

/** window.localStorage, or null where it is unavailable (SSR, privacy modes). */
export function browserStorage(): WorkspaceStorage | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}
