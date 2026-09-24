/* @ts-self-types="./ftui_showcase_wasm.d.ts" */

/**
 * WASM showcase runner for the FrankenTUI demo application.
 *
 * Host-driven: JavaScript controls the event loop via `requestAnimationFrame`,
 * pushing input events and advancing time each frame.
 */
export class ShowcaseRunner {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ShowcaseRunnerFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_showcaserunner_free(ptr, 0);
    }
    /**
     * Advance deterministic clock by `dt_ms` milliseconds (real-time mode).
     * @param {number} dt_ms
     */
    advanceTime(dt_ms) {
        wasm.showcaserunner_advanceTime(this.__wbg_ptr, dt_ms);
    }
    /**
     * Release internal resources.
     */
    destroy() {
        wasm.showcaserunner_destroy(this.__wbg_ptr);
    }
    /**
     * True when terminal cell `(x, y)` is on something a pointer can drag.
     *
     * Out-of-range coordinates are not drag handles rather than an error: a
     * host asks this on every touch, including ones off the edge of a stale
     * canvas rect.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    dragHandleAt(x, y) {
        const ret = wasm.showcaserunner_dragHandleAt(this.__wbg_ptr, x, y);
        return ret !== 0;
    }
    /**
     * Length (in `u32` words) of the prepared flat cell payload.
     * @returns {number}
     */
    flatCellsLen() {
        const ret = wasm.showcaserunner_flatCellsLen(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Byte-offset pointer to the prepared flat cell payload (`u32` words).
     * @returns {number}
     */
    flatCellsPtr() {
        const ret = wasm.showcaserunner_flatCellsPtr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Length (in `u32` words) of the prepared flat span payload.
     * @returns {number}
     */
    flatSpansLen() {
        const ret = wasm.showcaserunner_flatSpansLen(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Byte-offset pointer to the prepared flat span payload (`u32` words).
     * @returns {number}
     */
    flatSpansPtr() {
        const ret = wasm.showcaserunner_flatSpansPtr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Current frame index (monotonic, 0-based).
     * @returns {bigint}
     */
    frameIdx() {
        const ret = wasm.showcaserunner_frameIdx(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Select an available screen by stable slug or one-based decimal position.
     * Returns false for unknown slugs, malformed positions, or unavailable screens.
     * @param {string} selector
     * @returns {boolean}
     */
    gotoScreenSelector(selector) {
        const ptr0 = passStringToWasm0(selector, wasm.__wbindgen_export2, wasm.__wbindgen_export3);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.showcaserunner_gotoScreenSelector(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * Select a screen by its zero-based index in the screen registry.
     *
     * Hosts previously deep-linked by synthesizing digit or Tab key presses,
     * which landed on the wrong screen because Tab advances relative to the
     * guided tour's active screen. Returns false if the index is out of range.
     * @param {number} index
     * @returns {boolean}
     */
    gotoScreen(index) {
        const ret = wasm.showcaserunner_gotoScreen(this.__wbg_ptr, index);
        return ret !== 0;
    }
    /**
     * Initialize the model and render the first frame. Call exactly once.
     */
    init() {
        wasm.showcaserunner_init(this.__wbg_ptr);
    }
    /**
     * Whether the program is still running.
     * @returns {boolean}
     */
    isRunning() {
        const ret = wasm.showcaserunner_isRunning(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Create a new runner with initial terminal dimensions (cols, rows).
     * @param {number} cols
     * @param {number} rows
     */
    constructor(cols, rows) {
        const ret = wasm.showcaserunner_new(cols, rows);
        this.__wbg_ptr = ret;
        ShowcaseRunnerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Active pane pointer id tracked by the adapter, or `null`.
     * @returns {number | undefined}
     */
    paneActivePointerId() {
        const ret = wasm.showcaserunner_paneActivePointerId(this.__wbg_ptr);
        return ret === Number.MAX_SAFE_INTEGER ? undefined : ret;
    }
    /**
     * Apply one adaptive pane layout intelligence mode.
     *
     * `mode`: `0=focus`, `1=compare`, `2=monitor`, `3=compact`.
     * `primary_pane_id`: pass `0` to use current selection anchor.
     * @param {number} mode
     * @param {bigint} primary_pane_id
     * @returns {boolean}
     */
    paneApplyLayoutMode(mode, primary_pane_id) {
        const ret = wasm.showcaserunner_paneApplyLayoutMode(this.__wbg_ptr, mode, primary_pane_id);
        return ret !== 0;
    }
    /**
     * Pane-specific blur path.
     * @returns {any}
     */
    paneBlur() {
        const ret = wasm.showcaserunner_paneBlur(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Pane-specific host context-loss path.
     * @returns {any}
     */
    paneContextLost() {
        const ret = wasm.showcaserunner_paneContextLost(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Serialize actual execution counters, retention, and maintenance diagnostics.
     * Counter values are JSON integers and can exceed JavaScript's safe integer range.
     * @returns {string}
     */
    paneExecutionStatusJson() {
        let deferred2_0;
        let deferred2_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.showcaserunner_paneExecutionStatusJson(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Actual history substrate: `checkpointed` or `persistent`.
     * Conservative execution uses the checkpointed substrate; see status JSON.
     * @returns {string}
     */
    paneExecutionStrategy() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.showcaserunner_paneExecutionStrategy(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Export current pane workspace snapshot JSON.
     * @returns {string | undefined}
     */
    paneExportWorkspaceSnapshot() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.showcaserunner_paneExportWorkspaceSnapshot(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Import pane workspace snapshot JSON.
     * @param {string} json
     * @returns {boolean}
     */
    paneImportWorkspaceSnapshot(json) {
        const ptr0 = passStringToWasm0(json, wasm.__wbindgen_export2, wasm.__wbindgen_export3);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.showcaserunner_paneImportWorkspaceSnapshot(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * Live pane layout state (ghost preview + timeline + selection).
     * @returns {any}
     */
    paneLayoutState() {
        const ret = wasm.showcaserunner_paneLayoutState(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Pane-specific lost pointer capture path.
     * @param {number} pointer_id
     * @returns {any}
     */
    paneLostPointerCapture(pointer_id) {
        const ret = wasm.showcaserunner_paneLostPointerCapture(this.__wbg_ptr, pointer_id);
        return takeObject(ret);
    }
    /**
     * Mark an exported pane workspace generation as durably saved.
     * @param {bigint} generation
     * @returns {boolean}
     */
    paneMarkWorkspaceSaved(generation) {
        const ret = wasm.showcaserunner_paneMarkWorkspaceSaved(this.__wbg_ptr, generation);
        return ret !== 0;
    }
    /**
     * Pane-specific pointer-cancel path.
     *
     * Pass `0` to represent an unspecified pointer id.
     * @param {number} pointer_id
     * @returns {any}
     */
    panePointerCancel(pointer_id) {
        const ret = wasm.showcaserunner_panePointerCancel(this.__wbg_ptr, pointer_id);
        return takeObject(ret);
    }
    /**
     * Pane-specific pointer capture acknowledgement path.
     * @param {number} pointer_id
     * @returns {any}
     */
    panePointerCaptureAcquired(pointer_id) {
        const ret = wasm.showcaserunner_panePointerCaptureAcquired(this.__wbg_ptr, pointer_id);
        return takeObject(ret);
    }
    /**
     * Pane pointer-down path that auto-detects pane/edge/corner from coordinates.
     * @param {number} pointer_id
     * @param {number} button
     * @param {number} x
     * @param {number} y
     * @param {number} mods
     * @returns {any}
     */
    panePointerDownAt(pointer_id, button, x, y, mods) {
        const ret = wasm.showcaserunner_panePointerDownAt(this.__wbg_ptr, pointer_id, button, x, y, mods);
        return takeObject(ret);
    }
    /**
     * Pane-specific pointer-down path with direct capture semantics.
     *
     * `axis`: `0` = horizontal, `1` = vertical.
     * `button`: DOM semantics (`0` = primary, `1` = middle, `2` = secondary).
     * `mods` bitmask: `1=shift`, `2=alt`, `4=ctrl`, `8=meta`.
     * @param {bigint} split_id
     * @param {number} axis
     * @param {number} pointer_id
     * @param {number} button
     * @param {number} x
     * @param {number} y
     * @param {number} mods
     * @returns {any}
     */
    panePointerDown(split_id, axis, pointer_id, button, x, y, mods) {
        const ret = wasm.showcaserunner_panePointerDown(this.__wbg_ptr, split_id, axis, pointer_id, button, x, y, mods);
        return takeObject(ret);
    }
    /**
     * Pane-specific pointer-leave path.
     * @param {number} pointer_id
     * @returns {any}
     */
    panePointerLeave(pointer_id) {
        const ret = wasm.showcaserunner_panePointerLeave(this.__wbg_ptr, pointer_id);
        return takeObject(ret);
    }
    /**
     * Auto-targeted pointer move path.
     * @param {number} pointer_id
     * @param {number} x
     * @param {number} y
     * @param {number} mods
     * @returns {any}
     */
    panePointerMoveAt(pointer_id, x, y, mods) {
        const ret = wasm.showcaserunner_panePointerMoveAt(this.__wbg_ptr, pointer_id, x, y, mods);
        return takeObject(ret);
    }
    /**
     * Pane-specific pointer-move path.
     * @param {number} pointer_id
     * @param {number} x
     * @param {number} y
     * @param {number} mods
     * @returns {any}
     */
    panePointerMove(pointer_id, x, y, mods) {
        const ret = wasm.showcaserunner_panePointerMove(this.__wbg_ptr, pointer_id, x, y, mods);
        return takeObject(ret);
    }
    /**
     * Auto-targeted pointer-up path.
     * @param {number} pointer_id
     * @param {number} button
     * @param {number} x
     * @param {number} y
     * @param {number} mods
     * @returns {any}
     */
    panePointerUpAt(pointer_id, button, x, y, mods) {
        const ret = wasm.showcaserunner_panePointerUpAt(this.__wbg_ptr, pointer_id, button, x, y, mods);
        return takeObject(ret);
    }
    /**
     * Pane-specific pointer-up path.
     *
     * `button`: DOM semantics (`0` = primary, `1` = middle, `2` = secondary).
     * `mods` bitmask: `1=shift`, `2=alt`, `4=ctrl`, `8=meta`.
     * @param {number} pointer_id
     * @param {number} button
     * @param {number} x
     * @param {number} y
     * @param {number} mods
     * @returns {any}
     */
    panePointerUp(pointer_id, button, x, y, mods) {
        const ret = wasm.showcaserunner_panePointerUp(this.__wbg_ptr, pointer_id, button, x, y, mods);
        return takeObject(ret);
    }
    /**
     * Redo one pane structural change.
     * @returns {boolean}
     */
    paneRedoLayout() {
        const ret = wasm.showcaserunner_paneRedoLayout(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Pane-specific host render-stall path.
     * @returns {any}
     */
    paneRenderStalled() {
        const ret = wasm.showcaserunner_paneRenderStalled(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Rebuild pane tree from timeline baseline and cursor.
     * @returns {boolean}
     */
    paneReplayLayout() {
        const ret = wasm.showcaserunner_paneReplayLayout(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Last pane workspace generation the host acknowledged as durably saved.
     * @returns {bigint}
     */
    paneSavedWorkspaceGeneration() {
        const ret = wasm.showcaserunner_paneSavedWorkspaceGeneration(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Change live execution policy when no pane pointer is active.
     *
     * `mode`: `0=checkpointed`, `1=persistent`, `2=conservative`, `3=adaptive`.
     * All arguments must be finite integer JavaScript numbers in the `u32` range.
     * Each retention ceiling uses `0` for unbounded. Retention counts edits.
     * Invalid arguments and active pointers throw without changing state. Finish
     * the gesture, or call `panePointerCancel` and handle its capture command,
     * before changing policy. Migration errors preserve the previous policy.
     * @param {any} mode
     * @param {any} max_retained_bytes
     * @param {any} max_retained_edits
     */
    paneSetExecutionPolicy(mode, max_retained_bytes, max_retained_edits) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.showcaserunner_paneSetExecutionPolicy(retptr, this.__wbg_ptr, addHeapObject(mode), addHeapObject(max_retained_bytes), addHeapObject(max_retained_edits));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Shared splitter/handle primitives for host-specific renderers.
     * @returns {any}
     */
    paneSplitterPrimitives() {
        const ret = wasm.showcaserunner_paneSplitterPrimitives(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Touch-specific pane pointer-down path that auto-detects pane/edge/corner.
     *
     * `active_touch_points` is the host's current touch count including this
     * pointer. Values above one yield pane capture to scroll/pinch handling.
     * @param {number} pointer_id
     * @param {number} x
     * @param {number} y
     * @param {number} active_touch_points
     * @param {number} mods
     * @returns {any}
     */
    paneTouchPointerDownAt(pointer_id, x, y, active_touch_points, mods) {
        const ret = wasm.showcaserunner_paneTouchPointerDownAt(this.__wbg_ptr, pointer_id, x, y, active_touch_points, mods);
        return takeObject(ret);
    }
    /**
     * Undo one pane structural change.
     * @returns {boolean}
     */
    paneUndoLayout() {
        const ret = wasm.showcaserunner_paneUndoLayout(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Pane-specific hidden visibility path.
     * @returns {any}
     */
    paneVisibilityHidden() {
        const ret = wasm.showcaserunner_paneVisibilityHidden(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Whether the pane workspace has unsaved changes.
     * @returns {boolean}
     */
    paneWorkspaceDirty() {
        const ret = wasm.showcaserunner_paneWorkspaceDirty(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Current pane workspace generation for host persistence.
     * @returns {bigint}
     */
    paneWorkspaceGeneration() {
        const ret = wasm.showcaserunner_paneWorkspaceGeneration(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * FNV-1a hash of the last patch batch, or `null`.
     * @returns {string | undefined}
     */
    patchHash() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.showcaserunner_patchHash(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1);
                wasm.__wbindgen_export4(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Patch upload stats: `{ dirty_cells, patch_count, bytes_uploaded }`, or `null`.
     * @returns {any}
     */
    patchStats() {
        const ret = wasm.showcaserunner_patchStats(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Prepare flat patch buffers in reusable Rust-owned storage.
     *
     * Pair this with `flatCellsPtr/flatCellsLen/flatSpansPtr/flatSpansLen`
     * for a zero-copy JS view over WASM memory.
     */
    prepareFlatPatches() {
        wasm.showcaserunner_prepareFlatPatches(this.__wbg_ptr);
    }
    /**
     * Parse a JSON-encoded input and push to the event queue.
     * Returns `true` if accepted, `false` if unsupported, malformed, or over
     * input capacity. After a capacity rejection, step before retrying.
     * @param {string} json
     * @returns {boolean}
     */
    pushEncodedInput(json) {
        const ptr0 = passStringToWasm0(json, wasm.__wbindgen_export2, wasm.__wbindgen_export3);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.showcaserunner_pushEncodedInput(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * Queue a resize for the next step. Returns false without changing size
     * when input capacity is exhausted; step before retrying.
     * @param {number} cols
     * @param {number} rows
     * @returns {boolean}
     */
    resize(cols, rows) {
        const ret = wasm.showcaserunner_resize(this.__wbg_ptr, cols, rows);
        return ret !== 0;
    }
    /**
     * Ordered stable slugs for screens enabled in this compiled module.
     * @returns {Array<any>}
     */
    screenSlugs() {
        const ret = wasm.showcaserunner_screenSlugs(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Enable or disable bounded accessibility collection for a host bridge.
     *
     * Enable before init for first-frame feedback. In the packaged browser
     * adapter an explicit call selects manual delivery and detaches automatic
     * DOM speech, preventing the callback and host from speaking twice.
     * @param {boolean} enabled
     */
    setAccessibilityEnabled(enabled) {
        wasm.showcaserunner_setAccessibilityEnabled(this.__wbg_ptr, enabled);
    }
    /**
     * Provide the evidence JSONL for the `ExplainabilityCockpit` screen.
     *
     * Native builds poll this log from a local path; a browser has no such
     * file, so the host supplies a complete snapshot and can replace it as new
     * rows arrive. Returns true when the stored text changes, false for an
     * identical snapshot. The cockpit observes replacements on refresh.
     * @param {string} text
     * @returns {boolean}
     */
    setEvidenceJsonl(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_export2, wasm.__wbindgen_export3);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.showcaserunner_setEvidenceJsonl(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * Provide the Shakespeare text blob for the `Shakespeare` screen.
     *
     * For WASM builds we avoid embedding multi-megabyte strings in the module.
     * The host should call this once during startup (or early in the session).
     * @param {string} text
     * @returns {boolean}
     */
    setShakespeareText(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_export2, wasm.__wbindgen_export3);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.showcaserunner_setShakespeareText(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * Provide the SQLite amalgamation source for the `CodeExplorer` screen.
     *
     * For WASM builds we avoid embedding multi-megabyte strings in the module.
     * The host should call this once during startup (or early in the session).
     * @param {string} text
     * @returns {boolean}
     */
    setSqliteSource(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_export2, wasm.__wbindgen_export3);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.showcaserunner_setSqliteSource(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * Set deterministic clock to absolute nanoseconds (replay mode).
     * @param {number} ts_ns
     */
    setTime(ts_ns) {
        wasm.showcaserunner_setTime(this.__wbg_ptr, ts_ns);
    }
    /**
     * Process pending events and render if dirty.
     * Returns `{ running, rendered, events_processed, events_pending, frame_idx }`.
     * @returns {any}
     */
    step() {
        const ret = wasm.showcaserunner_step(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Read the bounded mirror and drain the latest frame's announcements.
     *
     * Returns schema-v1 JSON with lossless string frame/node IDs. Read after
     * init and each rendered step; a second drain has no speech. This local
     * channel is independent of patch/log output and never logs its content.
     * @returns {string}
     */
    takeAccessibilityUpdateJson() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.showcaserunner_takeAccessibilityUpdateJson(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Take flat patch batch for GPU upload.
     * Returns `{ cells: Uint32Array, spans: Uint32Array }`.
     *
     * Uses reusable internal buffers to avoid per-frame Vec allocation.
     * @returns {any}
     */
    takeFlatPatches() {
        const ret = wasm.showcaserunner_takeFlatPatches(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Drain accumulated log lines. Returns `Array<string>`.
     * @returns {Array<any>}
     */
    takeLogs() {
        const ret = wasm.showcaserunner_takeLogs(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Recover unprocessed input as canonical golden-trace-v2 input JSONL.
     *
     * Events remain in FIFO order and are removed without executing effects.
     * Timestamps are zero because original admission timestamps are unavailable.
     * This is an input fragment, not a complete replay trace or encoded DOM input.
     * @returns {string}
     */
    takePendingInputTrace() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.showcaserunner_takePendingInputTrace(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The current screen's keys as JSON: `[{label, action, key, mods}]`.
     *
     * `key` and `mods` are what `pushEncodedInput` expects back in a key
     * record, so a host can turn each entry straight into a button. The list
     * tracks the screen - and its mode, and whether the tour is running - so
     * poll it rather than reading it once.
     * @returns {string}
     */
    touchActionsJson() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.showcaserunner_touchActionsJson(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) ShowcaseRunner.prototype[Symbol.dispose] = ShowcaseRunner.prototype.free;

export function wasm_start() {
    wasm.wasm_start();
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_is_function_fcda5e3902d732fe: function(arg0) {
            const ret = typeof(getObject(arg0)) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_undefined_8c687d0b90d5b524: function(arg0) {
            const ret = getObject(arg0) === undefined;
            return ret;
        },
        __wbg___wbindgen_number_get_1dc732b810cb937c: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_throw_5d9e815e6fdf150f: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_call_6bcf8d3e20937e46: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_getRandomValues_a608c4436c19407a: function() { return handleError(function (arg0, arg1) {
            globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
        }, arguments); },
        __wbg_get_989d0a1309644f2b: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_new_bebc3f4757acf305: function() {
            const ret = new Object();
            return addHeapObject(ret);
        },
        __wbg_new_ffa92086ea89f79c: function() {
            const ret = new Array();
            return addHeapObject(ret);
        },
        __wbg_new_from_slice_a500ec81601be48f: function(arg0, arg1) {
            const ret = new Uint32Array(getArrayU32FromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbg_now_d1fb6650485d7f3e: function() {
            const ret = Date.now();
            return ret;
        },
        __wbg_now_e7c6795a7f81e10f: function(arg0) {
            const ret = getObject(arg0).now();
            return ret;
        },
        __wbg_performance_3fcf6e32a7e1ed0a: function(arg0) {
            const ret = getObject(arg0).performance;
            return addHeapObject(ret);
        },
        __wbg_push_bfdf956ba476f65b: function(arg0, arg1) {
            const ret = getObject(arg0).push(getObject(arg1));
            return ret;
        },
        __wbg_set_a377297433dfea63: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
            return ret;
        }, arguments); },
        __wbg_static_accessor_GLOBAL_8eb4cd83130a11a0: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_1e7044f654e934db: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_SELF_d8b50611246a6d92: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_WINDOW_fd0bc376bf0f8b42: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbindgen_generic_0000000000000001: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return addHeapObject(ret);
        },
        __wbindgen_generic_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_object_clone_ref: function(arg0) {
            const ret = getObject(arg0);
            return addHeapObject(ret);
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject(arg0);
        },
    };
    return {
        __proto__: null,
        "./ftui_showcase_wasm_bg.js": import0,
    };
}

const ShowcaseRunnerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_showcaserunner_free(ptr, 1));

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function dropObject(idx) {
    if (idx < 1028) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export(addHeapObject(e));
    }
}

let heap = new Array(1024).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('ftui_showcase_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };

// Text-only canvas accessibility bridge. Bundled with the verified WASM glue.
// No fabricated DOM controls/focus: the mirror is browseable, speech has one path.
// WAI-ARIA log semantics: https://www.w3.org/TR/wai-aria-1.2/#log
const MAX_LINES = 128;
const MAX_ANNOUNCEMENTS = 8;
const MAX_TEXT_CHARS = 240;
const MAX_PENDING = 32;
const MAX_HISTORY = 16;
const MAX_JSON_CHARS = 250_000;
const owners = new WeakMap();
const reasons = new Set([
  "FocusChanged",
  "FocusedStateChanged",
  "LiveRegionAdded",
  "LiveContentChanged",
  "LiveRegionChanged",
]);
let showcaseReviewSequence = 0;

function validId(value) {
  return (
    value === null ||
    (typeof value === "string" &&
      /^(0|[1-9][0-9]{0,19})$/.test(value) &&
      BigInt(value) <= 18446744073709551615n)
  );
}

function validText(value) {
  return (
    typeof value === "string" &&
    value.length <= MAX_TEXT_CHARS * 2 &&
    Array.from(value).length <= MAX_TEXT_CHARS
  );
}

function validCount(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function decodeUpdate(json) {
  if (typeof json !== "string" || json.length > MAX_JSON_CHARS) return null;
  let value;
  try {
    value = JSON.parse(json);
  } catch {
    return null;
  }
  if (
    !value ||
    value.schema_version !== 1 ||
    typeof value.enabled !== "boolean" ||
    !validId(value.frame_id) ||
    !validId(value.focus_id) ||
    !validCount(value.omitted_nodes) ||
    !validCount(value.dropped_count) ||
    !Array.isArray(value.lines) ||
    value.lines.length > MAX_LINES ||
    !value.lines.every(validText) ||
    !Array.isArray(value.announcements) ||
    value.announcements.length > MAX_ANNOUNCEMENTS ||
    !value.announcements.every(
      (item) =>
        item &&
        validId(item.node_id) &&
        (item.urgency === "polite" || item.urgency === "assertive") &&
        reasons.has(item.reason) &&
        validText(item.text),
    )
  )
    return null;
  if (value.frame_id === null && (value.lines.length || value.announcements.length)) return null;
  return value;
}

/**
 * An actual native text control for reviewing/copying the bounded snapshot.
 * It is not a set of pretend controls for the canvas widgets. The non-modal
 * panel keeps browser Tab, selection, scrolling and clipboard defaults; Escape
 * returns to the terminal. A documented chord escapes the canvas's Tab routing.
 * See https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html .
 */
class TerminalContentReview {
  constructor(bridge, terminal, keyboardProxy) {
    this.bridge = bridge;
    this.document = bridge.document;
    this.window = bridge.window;
    this.terminal = terminal;
    this.keyboardProxy = keyboardProxy?.ownerDocument === this.document ? keyboardProxy : null;
    this.opened = false;
    this.latest = null;
    this.returnTarget = null;
    this.ownedKeys = new Set();
    let id;
    do {
      id = `ftui-content-review-${++showcaseReviewSequence}`;
    } while (this.document.getElementById(id) || this.document.getElementById(`${id}-hint`));

    this.controls = this.document.createElement("div");
    this.controls.setAttribute("data-ftui-review-controls", "");
    this.controls.style.cssText =
      "position:fixed;top:0.5rem;right:0.5rem;z-index:20;font:14px system-ui;";
    this.openButton = this.document.createElement("button");
    this.openButton.type = "button";
    this.openButton.textContent = "Read terminal";
    this.openButton.disabled = true;
    this.openButton.setAttribute("aria-keyshortcuts", "Alt+Shift+R");
    this.openButton.setAttribute("aria-controls", id);
    this.openButton.setAttribute("aria-expanded", "false");
    this.openButton.title = "Read or copy terminal content (Alt+Shift+R)";
    this.hint = this.document.createElement("span");
    this.hint.id = `${id}-hint`;
    this.hint.hidden = true;
    this.hint.textContent =
      "Press Alt+Shift+R to read or copy terminal content. In content review, Escape returns to the terminal and Tab moves between browser controls.";
    this.openButton.setAttribute("aria-describedby", this.hint.id);
    this.controls.append(this.openButton, this.hint);

    this.panel = this.document.createElement("section");
    this.panel.id = id;
    this.panel.hidden = true;
    this.panel.setAttribute("data-ftui-review", "");
    this.panel.setAttribute("role", "region");
    this.panel.setAttribute("aria-label", "Terminal content review");
    this.panel.setAttribute("aria-live", "off");
    this.panel.style.cssText =
      "position:fixed;inset:12vh 2vw auto;max-height:80vh;overflow:auto;z-index:1000;padding:1rem;border:2px solid currentColor;background:Canvas;color:CanvasText;font:16px system-ui;box-sizing:border-box;";
    const heading = this.document.createElement("h2");
    heading.textContent = "Terminal content review";
    const help = this.document.createElement("p");
    help.id = `${id}-help`;
    help.textContent =
      "This read-only snapshot stays fixed while you read. Select and copy normally. Refresh to read newer content. Escape or Return to terminal closes this panel; Tab can leave it.";
    this.text = this.document.createElement("textarea");
    this.text.readOnly = true;
    this.text.spellcheck = false;
    this.text.wrap = "off";
    this.text.setAttribute("aria-label", "Terminal content snapshot");
    this.text.setAttribute("aria-describedby", help.id);
    this.text.setAttribute("data-ftui-review-text", "");
    this.text.style.cssText =
      "box-sizing:border-box;width:100%;height:45vh;font:16px monospace;background:Canvas;color:CanvasText;";
    this.status = this.document.createElement("p");
    this.status.setAttribute("data-ftui-review-status", "");
    // Status is deliberately not live: changing frames must not interrupt reading.
    this.status.setAttribute("aria-live", "off");
    this.refreshButton = this.document.createElement("button");
    this.refreshButton.type = "button";
    this.refreshButton.textContent = "Refresh snapshot";
    this.closeButton = this.document.createElement("button");
    this.closeButton.type = "button";
    this.closeButton.textContent = "Return to terminal";
    this.closeButton.style.marginInlineStart = "0.5rem";
    this.panel.append(heading, help, this.text, this.status, this.refreshButton, this.closeButton);

    this.openButton.addEventListener("click", () => this.open());
    this.refreshButton.addEventListener("click", () => this.refresh());
    this.closeButton.addEventListener("click", () => this.close(true));
    this.onInput = (event) => this.routeInput(event);
    this.onBlur = () => this.ownedKeys.clear();
    this.onFocus = (event) => {
      if (this.opened && this.isTerminal(event.target)) this.close(false);
    };
    this.inputEvents = [
      "keydown",
      "keyup",
      "beforeinput",
      "input",
      "paste",
      "copy",
      "cut",
      "compositionstart",
      "compositionupdate",
      "compositionend",
    ];
    // Installed during runner init, before the showcase's window input handlers.
    // Do not cancel browser defaults, apart from the explicit open/close keys.
    for (const type of this.inputEvents) this.window.addEventListener(type, this.onInput, true);
    this.window.addEventListener("blur", this.onBlur);
    this.window.addEventListener("focusin", this.onFocus, true);
    bridge.root.after(this.controls, this.panel);
    const describedBy = (terminal.getAttribute("aria-describedby") || "")
      .split(/\s+/)
      .filter(Boolean);
    terminal.setAttribute("aria-describedby", [...describedBy, this.hint.id].join(" "));
  }

  owns(target) {
    return (
      target instanceof this.window.Node &&
      (this.controls.contains(target) || this.panel.contains(target))
    );
  }

  isTerminal(target) {
    return (
      target === this.terminal || (this.keyboardProxy !== null && target === this.keyboardProxy)
    );
  }

  routeInput(event) {
    const key = event.code || String(event.key || "").toLowerCase();
    if (event.type === "keyup" && this.ownedKeys.delete(key)) {
      event.stopImmediatePropagation();
      return;
    }
    const owned = this.owns(event.target);
    const shortcut =
      event.type === "keydown" &&
      !event.isComposing &&
      event.altKey &&
      event.shiftKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      (event.code === "KeyR" || String(event.key).toLowerCase() === "r") &&
      (owned || this.isTerminal(event.target));
    if (!owned && !shortcut) return;
    if (event.type === "keydown") {
      // Bound retained release identities even for synthetic/virtual keyboards.
      if (this.ownedKeys.size >= 64) this.ownedKeys.clear();
      this.ownedKeys.add(key);
    }
    event.stopImmediatePropagation();
    if (shortcut) {
      event.preventDefault();
      if (!event.repeat) this.open();
    } else if (
      event.type === "keydown" &&
      event.key === "Escape" &&
      !event.isComposing &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      this.close(true);
    }
  }

  update(value) {
    const omitted = value.omitted_nodes ? `\n${value.omitted_nodes} additional items omitted.` : "";
    this.latest = { frame: value.frame_id, text: value.lines.join("\n") + omitted };
    this.openButton.disabled = false;
    if (this.opened) this.updateStatus();
  }

  updateStatus() {
    const status =
      this.latest?.text === this.text.value
        ? "Snapshot is up to date."
        : "New terminal content is available. Refresh when ready.";
    if (this.status.textContent !== status) this.status.textContent = status;
  }

  open() {
    if (this.bridge.disposed || !this.bridge.enabled || !this.latest) return false;
    if (!this.opened) {
      const active = this.document.activeElement;
      this.returnTarget = this.isTerminal(active) ? active : this.terminal;
      this.opened = true;
      this.bridge.setLivePolicies();
      this.bridge.clearSpeech();
      this.panel.hidden = false;
      this.openButton.setAttribute("aria-expanded", "true");
      this.text.value = this.latest.text;
      this.text.setSelectionRange(0, 0);
      this.updateStatus();
    }
    this.text.focus({ preventScroll: true });
    return true;
  }

  refresh() {
    if (!this.opened || !this.latest) return false;
    if (this.text.value !== this.latest.text) {
      const { selectionStart, selectionEnd, selectionDirection, scrollTop, scrollLeft } = this.text;
      this.text.value = this.latest.text;
      this.text.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
      this.text.scrollTop = scrollTop;
      this.text.scrollLeft = scrollLeft;
    }
    this.updateStatus();
    this.text.focus({ preventScroll: true });
    return true;
  }

  close(restoreFocus) {
    if (!this.opened) return;
    const ownedFocus = this.owns(this.document.activeElement);
    this.opened = false;
    this.panel.hidden = true;
    this.openButton.setAttribute("aria-expanded", "false");
    this.text.value = "";
    this.status.textContent = "";
    this.bridge.setLivePolicies();
    const target = this.returnTarget?.isConnected ? this.returnTarget : this.terminal;
    this.returnTarget = null;
    if (
      restoreFocus &&
      ownedFocus &&
      !this.document.hidden &&
      target?.isConnected &&
      !target.disabled
    )
      target.focus({ preventScroll: true });
  }

  clear() {
    // Disabling a focused native button blurs it to body. Move focus first so
    // disabling/replacing a runner does not strand the reader outside the TUI.
    const openerFocused = this.document.activeElement === this.openButton;
    this.close(true);
    this.latest = null;
    this.text.value = "";
    this.status.textContent = "";
    if (
      openerFocused &&
      !this.document.hidden &&
      this.terminal.isConnected &&
      !this.terminal.disabled
    )
      this.terminal.focus({ preventScroll: true });
    this.openButton.disabled = true;
  }

  dispose() {
    this.clear();
    for (const type of this.inputEvents) this.window.removeEventListener(type, this.onInput, true);
    this.window.removeEventListener("blur", this.onBlur);
    this.window.removeEventListener("focusin", this.onFocus, true);
    this.ownedKeys.clear();
    // Remove only our description token, retaining concurrent host additions.
    const ids = (this.terminal.getAttribute("aria-describedby") || "")
      .split(/\s+/)
      .filter((id) => id && id !== this.hint.id);
    if (ids.length) this.terminal.setAttribute("aria-describedby", ids.join(" "));
    else this.terminal.removeAttribute("aria-describedby");
    this.controls.remove();
    this.panel.remove();
  }
}

/** Own one host-supplied proxy. All content is inserted with textContent. */
export class ShowcaseAccessibilityBridge {
  constructor(root, { terminal = null, keyboardProxy = null } = {}) {
    if (!root?.ownerDocument) throw new TypeError("An accessibility proxy element is required");
    owners.get(root)?.dispose();
    this.root = root;
    this.document = root.ownerDocument;
    this.window = this.document.defaultView;
    this.disposed = false;
    this.enabled = true;
    this.lastFrame = null;
    this.pending = [];
    this.timer = null;
    this.transportDropped = 0;
    this.review = null;
    owners.set(root, this);

    // The old static proxy was itself live. Turn that off BEFORE replacing it,
    // otherwise the mirror and dedicated logs could both speak the same update.
    root.setAttribute("role", "document");
    root.setAttribute("aria-live", "off");
    root.setAttribute("aria-atomic", "false");
    this.mirror = this.document.createElement("div");
    this.mirror.setAttribute("data-ftui-mirror", "");
    this.omitted = this.document.createElement("p");
    this.omitted.setAttribute("data-ftui-omitted", "");
    this.polite = this.makeLog("polite");
    this.assertive = this.makeLog("assertive");
    root.replaceChildren(this.mirror, this.omitted, this.polite, this.assertive);
    this.onVisibility = () => {
      if (this.document.hidden) this.clearSpeech();
      this.setLivePolicies();
    };
    this.document.addEventListener("visibilitychange", this.onVisibility);
    if (
      terminal?.ownerDocument === this.document &&
      terminal.isConnected &&
      typeof terminal.focus === "function" &&
      !root.contains(terminal)
    ) {
      this.review = new TerminalContentReview(this, terminal, keyboardProxy);
    }
    this.setLivePolicies();
  }

  makeLog(urgency) {
    const log = this.document.createElement("div");
    log.setAttribute("role", "log");
    log.setAttribute(
      "aria-label",
      `${urgency === "assertive" ? "Urgent" : "Polite"} terminal announcements`,
    );
    log.setAttribute("aria-live", urgency);
    log.setAttribute("aria-atomic", "false");
    log.setAttribute("aria-relevant", "additions");
    return log;
  }

  setLivePolicies() {
    const silent = !this.enabled || this.document.hidden || this.disposed || this.review?.opened;
    this.polite.setAttribute("aria-live", silent ? "off" : "polite");
    this.assertive.setAttribute("aria-live", silent ? "off" : "assertive");
  }

  clearSpeech() {
    if (this.timer !== null) this.window.clearTimeout(this.timer);
    this.timer = null;
    this.pending.length = 0;
    this.polite.replaceChildren();
    this.assertive.replaceChildren();
  }

  /** Returns false for malformed, replayed, stale, or no-longer-owned updates. */
  update(json) {
    if (this.disposed || owners.get(this.root) !== this) return false;
    const value = decodeUpdate(json);
    if (!value) return false; // Never log the rejected payload or exception.
    if (!value.enabled) {
      const frame = value.frame_id === null ? null : BigInt(value.frame_id);
      if (this.lastFrame !== null && (frame === null || frame < this.lastFrame)) return false;
      if (frame !== null) this.lastFrame = frame;
      this.enabled = false;
      this.setLivePolicies();
      this.clearSpeech();
      this.review?.clear();
      this.mirror.replaceChildren();
      this.omitted.textContent = "";
      this.root.removeAttribute("data-ftui-focus");
      return true;
    }
    if (value.frame_id === null) return false; // Collection enabled, no rendered frame yet.
    const frame = BigInt(value.frame_id);
    if (this.lastFrame !== null && frame <= this.lastFrame) return false;
    this.lastFrame = frame;
    this.enabled = true;
    this.setLivePolicies();
    this.root.setAttribute("data-ftui-frame", value.frame_id);
    if (value.focus_id === null) this.root.removeAttribute("data-ftui-focus");
    else this.root.setAttribute("data-ftui-focus", value.focus_id);

    // Preserve nodes and unchanged text so repeated frames do not reset a
    // screen reader's browse position or churn the browser accessibility tree.
    value.lines.forEach((text, index) => {
      let line = this.mirror.children[index];
      if (!line) {
        line = this.document.createElement("p");
        this.mirror.appendChild(line);
      }
      if (line.textContent !== text) line.textContent = text;
    });
    while (this.mirror.children.length > value.lines.length) this.mirror.lastChild.remove();
    const omitted = value.omitted_nodes ? `${value.omitted_nodes} additional items omitted.` : "";
    if (this.omitted.textContent !== omitted) this.omitted.textContent = omitted;
    this.root.setAttribute("data-ftui-policy-dropped", String(value.dropped_count));
    this.review?.update(value);

    // Background-tab updates refresh the mirror but never queue stale speech
    // to be replayed when the user returns to the tab. Review likewise pauses
    // synthetic speech while the user reads a deliberately frozen snapshot.
    if (!this.document.hidden && !this.review?.opened) {
      this.pending.push(...value.announcements.filter((item) => item.text.trim()));
      while (this.pending.length > MAX_PENDING) {
        const polite = this.pending.findIndex((item) => item.urgency === "polite");
        this.pending.splice(polite < 0 ? 0 : polite, 1);
        this.transportDropped += 1;
      }
      this.root.setAttribute("data-ftui-transport-dropped", String(this.transportDropped));
      if (this.pending.length && this.timer === null) {
        // Give the initially empty live regions a task boundary before their
        // first additions. A later quiet render must not erase queued speech.
        this.timer = this.window.setTimeout(() => this.flush(), 0);
      }
    }
    return true;
  }

  flush() {
    this.timer = null;
    if (
      this.disposed ||
      !this.enabled ||
      this.document.hidden ||
      this.review?.opened ||
      owners.get(this.root) !== this
    ) {
      this.clearSpeech();
      return;
    }
    for (const item of this.pending.splice(0)) {
      const log = item.urgency === "assertive" ? this.assertive : this.polite;
      const entry = this.document.createElement("p");
      entry.textContent = item.text;
      // Append a distinct node even when two legitimate transitions have the
      // same text. Frame identity, not text equality, suppresses replay.
      while (log.children.length >= MAX_HISTORY) log.firstChild.remove();
      log.appendChild(entry);
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.setLivePolicies();
    this.clearSpeech();
    this.review?.dispose();
    this.review = null;
    this.document.removeEventListener("visibilitychange", this.onVisibility);
    if (owners.get(this.root) === this) {
      this.root.replaceChildren();
      for (const attr of [
        "data-ftui-frame",
        "data-ftui-focus",
        "data-ftui-policy-dropped",
        "data-ftui-transport-dropped",
      ])
        this.root.removeAttribute(attr);
      owners.delete(this.root);
    }
  }
}

// No DOM access at module load: workers and native test imports remain usable.
// Only the showcase's existing reserved proxy is auto-bound; no body insertion.
export function attachShowcaseAccessibility() {
  const root = globalThis.document?.getElementById("a11y-proxy");
  return root
    ? new ShowcaseAccessibilityBridge(root, {
        terminal: root.ownerDocument.getElementById("terminal-canvas"),
        keyboardProxy: root.ownerDocument.getElementById("mobile-kb-proxy"),
      })
    : null;
}

export function publishShowcaseAccessibility(bridge, json) {
  return bridge instanceof ShowcaseAccessibilityBridge && bridge.update(json);
}

export function disposeShowcaseAccessibility(bridge) {
  if (bridge instanceof ShowcaseAccessibilityBridge) bridge.dispose();
}

/**
 * Adapt the generated wasm-bindgen class without editing its generated methods.
 * build-wasm.sh appends this import-free module to the verified runner glue and
 * replaces the live ShowcaseRunner export with this subclass. The manifest
 * therefore covers every executed bridge byte, even with the Blob-URL loader.
 */
export function withShowcaseAccessibility(Base) {
  for (const name of [
    "init",
    "step",
    "destroy",
    "free",
    "setAccessibilityEnabled",
    "takeAccessibilityUpdateJson",
  ]) {
    if (typeof Base?.prototype?.[name] !== "function") {
      throw new TypeError(`ShowcaseRunner is missing ${name}`);
    }
  }
  return class extends Base {
    #accessibilityBridge = null;
    #automaticAccessibility = true;
    #initializedAccessibility = false;

    #disposeAccessibility() {
      disposeShowcaseAccessibility(this.#accessibilityBridge);
      this.#accessibilityBridge = null;
    }

    #publishAccessibility() {
      if (!this.#accessibilityBridge) return;
      try {
        publishShowcaseAccessibility(
          this.#accessibilityBridge,
          super.takeAccessibilityUpdateJson(),
        );
      } catch {
        // A broken host DOM must not fail visual rendering or log private text.
        this.#disposeAccessibility();
      }
    }

    init() {
      if (this.#initializedAccessibility) return super.init();
      if (this.#automaticAccessibility) {
        try {
          this.#accessibilityBridge = attachShowcaseAccessibility();
          if (this.#accessibilityBridge) super.setAccessibilityEnabled(true);
        } catch {
          this.#disposeAccessibility();
        }
      }
      let result;
      try {
        result = super.init();
      } catch (error) {
        this.#disposeAccessibility();
        throw error;
      }
      this.#initializedAccessibility = true;
      // Drain BEFORE another step can replace the initial frame's speech.
      this.#publishAccessibility();
      return result;
    }

    step() {
      // RunnerCore permits step-before-init; preserve that contract while
      // delivering its initial frame before the first ordinary host step.
      if (!this.#initializedAccessibility) this.init();
      const result = super.step();
      if (result.rendered) this.#publishAccessibility();
      return result;
    }

    setAccessibilityEnabled(enabled) {
      // Explicit host configuration selects manual delivery, never two speech
      // paths at once. It also works before init to opt out of automatic DOM.
      this.#automaticAccessibility = false;
      this.#disposeAccessibility();
      return super.setAccessibilityEnabled(enabled);
    }

    destroy() {
      this.#automaticAccessibility = false;
      this.#disposeAccessibility();
      super.setAccessibilityEnabled(false);
      return super.destroy();
    }

    free() {
      this.#automaticAccessibility = false;
      this.#disposeAccessibility();
      return super.free();
    }
  };
}

ShowcaseRunner = withShowcaseAccessibility(ShowcaseRunner);
