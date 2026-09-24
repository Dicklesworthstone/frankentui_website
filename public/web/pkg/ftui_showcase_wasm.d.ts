/* tslint:disable */
/* eslint-disable */

/**
 * WASM showcase runner for the FrankenTUI demo application.
 *
 * Host-driven: JavaScript controls the event loop via `requestAnimationFrame`,
 * pushing input events and advancing time each frame.
 */
export class ShowcaseRunner {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Advance deterministic clock by `dt_ms` milliseconds (real-time mode).
     */
    advanceTime(dt_ms: number): void;
    /**
     * Release internal resources.
     */
    destroy(): void;
    /**
     * True when terminal cell `(x, y)` is on something a pointer can drag.
     *
     * Out-of-range coordinates are not drag handles rather than an error: a
     * host asks this on every touch, including ones off the edge of a stale
     * canvas rect.
     */
    dragHandleAt(x: number, y: number): boolean;
    /**
     * Length (in `u32` words) of the prepared flat cell payload.
     */
    flatCellsLen(): number;
    /**
     * Byte-offset pointer to the prepared flat cell payload (`u32` words).
     */
    flatCellsPtr(): number;
    /**
     * Length (in `u32` words) of the prepared flat span payload.
     */
    flatSpansLen(): number;
    /**
     * Byte-offset pointer to the prepared flat span payload (`u32` words).
     */
    flatSpansPtr(): number;
    /**
     * Current frame index (monotonic, 0-based).
     */
    frameIdx(): bigint;
    /**
     * Select an available screen by stable slug or one-based decimal position.
     * Returns false for unknown slugs, malformed positions, or unavailable screens.
     */
    gotoScreenSelector(selector: string): boolean;
    /**
     * Select a screen by its zero-based index in the screen registry.
     *
     * Hosts previously deep-linked by synthesizing digit or Tab key presses,
     * which landed on the wrong screen because Tab advances relative to the
     * guided tour's active screen. Returns false if the index is out of range.
     */
    gotoScreen(index: number): boolean;
    /**
     * Initialize the model and render the first frame. Call exactly once.
     */
    init(): void;
    /**
     * Whether the program is still running.
     */
    isRunning(): boolean;
    /**
     * Create a new runner with initial terminal dimensions (cols, rows).
     */
    constructor(cols: number, rows: number);
    /**
     * Active pane pointer id tracked by the adapter, or `null`.
     */
    paneActivePointerId(): number | undefined;
    /**
     * Apply one adaptive pane layout intelligence mode.
     *
     * `mode`: `0=focus`, `1=compare`, `2=monitor`, `3=compact`.
     * `primary_pane_id`: pass `0` to use current selection anchor.
     */
    paneApplyLayoutMode(mode: number, primary_pane_id: bigint): boolean;
    /**
     * Pane-specific blur path.
     */
    paneBlur(): any;
    /**
     * Pane-specific host context-loss path.
     */
    paneContextLost(): any;
    /**
     * Serialize actual execution counters, retention, and maintenance diagnostics.
     * Counter values are JSON integers and can exceed JavaScript's safe integer range.
     */
    paneExecutionStatusJson(): string;
    /**
     * Actual history substrate: `checkpointed` or `persistent`.
     * Conservative execution uses the checkpointed substrate; see status JSON.
     */
    paneExecutionStrategy(): string;
    /**
     * Export current pane workspace snapshot JSON.
     */
    paneExportWorkspaceSnapshot(): string | undefined;
    /**
     * Import pane workspace snapshot JSON.
     */
    paneImportWorkspaceSnapshot(json: string): boolean;
    /**
     * Live pane layout state (ghost preview + timeline + selection).
     */
    paneLayoutState(): any;
    /**
     * Pane-specific lost pointer capture path.
     */
    paneLostPointerCapture(pointer_id: number): any;
    /**
     * Mark an exported pane workspace generation as durably saved.
     */
    paneMarkWorkspaceSaved(generation: bigint): boolean;
    /**
     * Pane-specific pointer-cancel path.
     *
     * Pass `0` to represent an unspecified pointer id.
     */
    panePointerCancel(pointer_id: number): any;
    /**
     * Pane-specific pointer capture acknowledgement path.
     */
    panePointerCaptureAcquired(pointer_id: number): any;
    /**
     * Pane pointer-down path that auto-detects pane/edge/corner from coordinates.
     */
    panePointerDownAt(pointer_id: number, button: number, x: number, y: number, mods: number): any;
    /**
     * Pane-specific pointer-down path with direct capture semantics.
     *
     * `axis`: `0` = horizontal, `1` = vertical.
     * `button`: DOM semantics (`0` = primary, `1` = middle, `2` = secondary).
     * `mods` bitmask: `1=shift`, `2=alt`, `4=ctrl`, `8=meta`.
     */
    panePointerDown(split_id: bigint, axis: number, pointer_id: number, button: number, x: number, y: number, mods: number): any;
    /**
     * Pane-specific pointer-leave path.
     */
    panePointerLeave(pointer_id: number): any;
    /**
     * Auto-targeted pointer move path.
     */
    panePointerMoveAt(pointer_id: number, x: number, y: number, mods: number): any;
    /**
     * Pane-specific pointer-move path.
     */
    panePointerMove(pointer_id: number, x: number, y: number, mods: number): any;
    /**
     * Auto-targeted pointer-up path.
     */
    panePointerUpAt(pointer_id: number, button: number, x: number, y: number, mods: number): any;
    /**
     * Pane-specific pointer-up path.
     *
     * `button`: DOM semantics (`0` = primary, `1` = middle, `2` = secondary).
     * `mods` bitmask: `1=shift`, `2=alt`, `4=ctrl`, `8=meta`.
     */
    panePointerUp(pointer_id: number, button: number, x: number, y: number, mods: number): any;
    /**
     * Redo one pane structural change.
     */
    paneRedoLayout(): boolean;
    /**
     * Pane-specific host render-stall path.
     */
    paneRenderStalled(): any;
    /**
     * Rebuild pane tree from timeline baseline and cursor.
     */
    paneReplayLayout(): boolean;
    /**
     * Last pane workspace generation the host acknowledged as durably saved.
     */
    paneSavedWorkspaceGeneration(): bigint;
    /**
     * Change live execution policy when no pane pointer is active.
     *
     * `mode`: `0=checkpointed`, `1=persistent`, `2=conservative`, `3=adaptive`.
     * All arguments must be finite integer JavaScript numbers in the `u32` range.
     * Each retention ceiling uses `0` for unbounded. Retention counts edits.
     * Invalid arguments and active pointers throw without changing state. Finish
     * the gesture, or call `panePointerCancel` and handle its capture command,
     * before changing policy. Migration errors preserve the previous policy.
     */
    paneSetExecutionPolicy(mode: any, max_retained_bytes: any, max_retained_edits: any): void;
    /**
     * Shared splitter/handle primitives for host-specific renderers.
     */
    paneSplitterPrimitives(): any;
    /**
     * Touch-specific pane pointer-down path that auto-detects pane/edge/corner.
     *
     * `active_touch_points` is the host's current touch count including this
     * pointer. Values above one yield pane capture to scroll/pinch handling.
     */
    paneTouchPointerDownAt(pointer_id: number, x: number, y: number, active_touch_points: number, mods: number): any;
    /**
     * Undo one pane structural change.
     */
    paneUndoLayout(): boolean;
    /**
     * Pane-specific hidden visibility path.
     */
    paneVisibilityHidden(): any;
    /**
     * Whether the pane workspace has unsaved changes.
     */
    paneWorkspaceDirty(): boolean;
    /**
     * Current pane workspace generation for host persistence.
     */
    paneWorkspaceGeneration(): bigint;
    /**
     * FNV-1a hash of the last patch batch, or `null`.
     */
    patchHash(): string | undefined;
    /**
     * Patch upload stats: `{ dirty_cells, patch_count, bytes_uploaded }`, or `null`.
     */
    patchStats(): any;
    /**
     * Prepare flat patch buffers in reusable Rust-owned storage.
     *
     * Pair this with `flatCellsPtr/flatCellsLen/flatSpansPtr/flatSpansLen`
     * for a zero-copy JS view over WASM memory.
     */
    prepareFlatPatches(): void;
    /**
     * Parse a JSON-encoded input and push to the event queue.
     * Returns `true` if accepted, `false` if unsupported, malformed, or over
     * input capacity. After a capacity rejection, step before retrying.
     */
    pushEncodedInput(json: string): boolean;
    /**
     * Queue a resize for the next step. Returns false without changing size
     * when input capacity is exhausted; step before retrying.
     */
    resize(cols: number, rows: number): boolean;
    /**
     * Ordered stable slugs for screens enabled in this compiled module.
     */
    screenSlugs(): Array<any>;
    /**
     * Enable or disable bounded accessibility collection for a host bridge.
     *
     * Enable before init for first-frame feedback. In the packaged browser
     * adapter an explicit call selects manual delivery and detaches automatic
     * DOM speech, preventing the callback and host from speaking twice.
     */
    setAccessibilityEnabled(enabled: boolean): void;
    /**
     * Provide the evidence JSONL for the `ExplainabilityCockpit` screen.
     *
     * Native builds poll this log from a local path; a browser has no such
     * file, so the host supplies a complete snapshot and can replace it as new
     * rows arrive. Returns true when the stored text changes, false for an
     * identical snapshot. The cockpit observes replacements on refresh.
     */
    setEvidenceJsonl(text: string): boolean;
    /**
     * Provide the Shakespeare text blob for the `Shakespeare` screen.
     *
     * For WASM builds we avoid embedding multi-megabyte strings in the module.
     * The host should call this once during startup (or early in the session).
     */
    setShakespeareText(text: string): boolean;
    /**
     * Provide the SQLite amalgamation source for the `CodeExplorer` screen.
     *
     * For WASM builds we avoid embedding multi-megabyte strings in the module.
     * The host should call this once during startup (or early in the session).
     */
    setSqliteSource(text: string): boolean;
    /**
     * Set deterministic clock to absolute nanoseconds (replay mode).
     */
    setTime(ts_ns: number): void;
    /**
     * Process pending events and render if dirty.
     * Returns `{ running, rendered, events_processed, events_pending, frame_idx }`.
     */
    step(): any;
    /**
     * Read the bounded mirror and drain the latest frame's announcements.
     *
     * Returns schema-v1 JSON with lossless string frame/node IDs. Read after
     * init and each rendered step; a second drain has no speech. This local
     * channel is independent of patch/log output and never logs its content.
     */
    takeAccessibilityUpdateJson(): string;
    /**
     * Take flat patch batch for GPU upload.
     * Returns `{ cells: Uint32Array, spans: Uint32Array }`.
     *
     * Uses reusable internal buffers to avoid per-frame Vec allocation.
     */
    takeFlatPatches(): any;
    /**
     * Drain accumulated log lines. Returns `Array<string>`.
     */
    takeLogs(): Array<any>;
    /**
     * Recover unprocessed input as canonical golden-trace-v2 input JSONL.
     *
     * Events remain in FIFO order and are removed without executing effects.
     * Timestamps are zero because original admission timestamps are unavailable.
     * This is an input fragment, not a complete replay trace or encoded DOM input.
     */
    takePendingInputTrace(): string;
    /**
     * The current screen's keys as JSON: `[{label, action, key, mods}]`.
     *
     * `key` and `mods` are what `pushEncodedInput` expects back in a key
     * record, so a host can turn each entry straight into a button. The list
     * tracks the screen - and its mode, and whether the tour is running - so
     * poll it rather than reading it once.
     */
    touchActionsJson(): string;
}

export function wasm_start(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_showcaserunner_free: (a: number, b: number) => void;
    readonly showcaserunner_advanceTime: (a: number, b: number) => void;
    readonly showcaserunner_destroy: (a: number) => void;
    readonly showcaserunner_dragHandleAt: (a: number, b: number, c: number) => number;
    readonly showcaserunner_flatCellsLen: (a: number) => number;
    readonly showcaserunner_flatCellsPtr: (a: number) => number;
    readonly showcaserunner_flatSpansLen: (a: number) => number;
    readonly showcaserunner_flatSpansPtr: (a: number) => number;
    readonly showcaserunner_frameIdx: (a: number) => bigint;
    readonly showcaserunner_gotoScreen: (a: number, b: number) => number;
    readonly showcaserunner_gotoScreenSelector: (a: number, b: number, c: number) => number;
    readonly showcaserunner_init: (a: number) => void;
    readonly showcaserunner_isRunning: (a: number) => number;
    readonly showcaserunner_new: (a: number, b: number) => number;
    readonly showcaserunner_paneActivePointerId: (a: number) => number;
    readonly showcaserunner_paneApplyLayoutMode: (a: number, b: number, c: bigint) => number;
    readonly showcaserunner_paneBlur: (a: number) => number;
    readonly showcaserunner_paneContextLost: (a: number) => number;
    readonly showcaserunner_paneExecutionStatusJson: (a: number, b: number) => void;
    readonly showcaserunner_paneExecutionStrategy: (a: number, b: number) => void;
    readonly showcaserunner_paneExportWorkspaceSnapshot: (a: number, b: number) => void;
    readonly showcaserunner_paneImportWorkspaceSnapshot: (a: number, b: number, c: number) => number;
    readonly showcaserunner_paneLayoutState: (a: number) => number;
    readonly showcaserunner_paneLostPointerCapture: (a: number, b: number) => number;
    readonly showcaserunner_paneMarkWorkspaceSaved: (a: number, b: bigint) => number;
    readonly showcaserunner_panePointerCancel: (a: number, b: number) => number;
    readonly showcaserunner_panePointerCaptureAcquired: (a: number, b: number) => number;
    readonly showcaserunner_panePointerDown: (a: number, b: bigint, c: number, d: number, e: number, f: number, g: number, h: number) => number;
    readonly showcaserunner_panePointerDownAt: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly showcaserunner_panePointerLeave: (a: number, b: number) => number;
    readonly showcaserunner_panePointerMove: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly showcaserunner_panePointerMoveAt: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly showcaserunner_panePointerUp: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly showcaserunner_panePointerUpAt: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly showcaserunner_paneRedoLayout: (a: number) => number;
    readonly showcaserunner_paneRenderStalled: (a: number) => number;
    readonly showcaserunner_paneReplayLayout: (a: number) => number;
    readonly showcaserunner_paneSavedWorkspaceGeneration: (a: number) => bigint;
    readonly showcaserunner_paneSetExecutionPolicy: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly showcaserunner_paneSplitterPrimitives: (a: number) => number;
    readonly showcaserunner_paneTouchPointerDownAt: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly showcaserunner_paneUndoLayout: (a: number) => number;
    readonly showcaserunner_paneVisibilityHidden: (a: number) => number;
    readonly showcaserunner_paneWorkspaceDirty: (a: number) => number;
    readonly showcaserunner_paneWorkspaceGeneration: (a: number) => bigint;
    readonly showcaserunner_patchHash: (a: number, b: number) => void;
    readonly showcaserunner_patchStats: (a: number) => number;
    readonly showcaserunner_prepareFlatPatches: (a: number) => void;
    readonly showcaserunner_pushEncodedInput: (a: number, b: number, c: number) => number;
    readonly showcaserunner_resize: (a: number, b: number, c: number) => number;
    readonly showcaserunner_screenSlugs: (a: number) => number;
    readonly showcaserunner_setAccessibilityEnabled: (a: number, b: number) => void;
    readonly showcaserunner_setEvidenceJsonl: (a: number, b: number, c: number) => number;
    readonly showcaserunner_setShakespeareText: (a: number, b: number, c: number) => number;
    readonly showcaserunner_setSqliteSource: (a: number, b: number, c: number) => number;
    readonly showcaserunner_setTime: (a: number, b: number) => void;
    readonly showcaserunner_step: (a: number) => number;
    readonly showcaserunner_takeAccessibilityUpdateJson: (a: number, b: number) => void;
    readonly showcaserunner_takeFlatPatches: (a: number) => number;
    readonly showcaserunner_takeLogs: (a: number) => number;
    readonly showcaserunner_takePendingInputTrace: (a: number, b: number) => void;
    readonly showcaserunner_touchActionsJson: (a: number, b: number) => void;
    readonly wasm_start: () => void;
    readonly __wbindgen_export: (a: number) => void;
    readonly __wbindgen_export2: (a: number, b: number) => number;
    readonly __wbindgen_export3: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_export4: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
