/* tslint:disable */
/* eslint-disable */

/**
 * Web/WASM terminal surface.
 *
 * This is the minimal JS-facing API surface. Implementation will evolve to:
 * - own a WebGPU renderer (glyph atlas + instancing),
 * - own web input capture + IME/clipboard,
 * - accept either VT/ANSI byte streams (`feed`) or direct cell diffs
 *   (`applyPatch`) for ftui-web mode.
 */
export class FrankenTermWeb {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Suggested host-side CSS classes for accessibility modes.
   */
  accessibilityClassNames(): Array<any>;
  /**
   * Expose a host-friendly DOM mirror snapshot for ARIA wiring.
   *
   * Shape:
   * `{ role, ariaMultiline, ariaLive, ariaAtomic, tabIndex, focused, focusVisible,
   *    screenReader, highContrast, reducedMotion, value, cursorOffset,
   *    selectionStart, selectionEnd }`
   */
  accessibilityDomSnapshot(): any;
  /**
   * Return current accessibility preferences.
   *
   * Shape:
   * `{ screenReader, highContrast, reducedMotion, focused, pendingAnnouncements }`
   */
  accessibilityState(): any;
  /**
   * Canonical API contract snapshot for deterministic host validation.
   *
   * Shape:
   * `{ apiLine, apiVersion, packageName, packageVersion, protocolVersion,
   *    methods, versioningPolicy, eventSchemaVersion, eventTypes,
   *    eventOrdering, eventBufferPolicy }`
   */
  apiContract(): any;
  /**
   * Stable FrankenTermJS API semver for host-side compatibility checks.
   *
   * This is intentionally distinct from crate/package semver.
   */
  apiVersion(): string;
  /**
   * Apply multiple cell patches from flat payload arrays (ftui-web fast path).
   *
   * - `spans`: `Uint32Array` in `[offset, len, offset, len, ...]` order
   * - `cells`: `Uint32Array` in `[bg, fg, glyph, attrs, ...]` order
   *
   * `len` is measured in cells (not `u32` words).
   */
  applyPatchBatchFlat(spans: Uint32Array, cells: Uint32Array): void;
  /**
   * Apply multiple cell patches (ftui-web mode).
   *
   * Accepts a JS array:
   * `[{ offset: number, cells: [{bg, fg, glyph, attrs}] }, ...]`.
   *
   * This is optimized for `ftui-web` patch runs so hosts can forward a
   * complete present step with one JS→WASM call.
   */
  applyPatchBatch(patches: any): void;
  /**
   * Apply a cell patch (ftui-web mode).
   *
   * Accepts a JS object: `{ offset: number, cells: [{bg, fg, glyph, attrs}] }`.
   * When a renderer is initialized, only the patched cells are uploaded to
   * the GPU. Without a renderer, patches still update the in-memory shadow
   * state so host-side logic (search/link lookup/evidence) remains usable.
   */
  applyPatch(patch: any): void;
  /**
   * Request graceful client-side session close.
   */
  attachClose(reason: string, now_ms: number): any;
  /**
   * Start (or restart) a websocket attach lifecycle.
   *
   * Host is expected to open the websocket transport after this call reports
   * `open_transport` in `actions`.
   */
  attachConnect(now_ms: number): any;
  /**
   * Inform state machine that handshake acknowledgement was received.
   */
  attachHandshakeAck(session_id: string, now_ms: number): any;
  /**
   * Inform state machine about protocol-level error.
   */
  attachProtocolError(code: string, fatal: boolean, now_ms: number): any;
  /**
   * Reset attach lifecycle to detached baseline state.
   */
  attachReset(now_ms: number): any;
  /**
   * Inform state machine about server-initiated session end.
   */
  attachSessionEnded(reason: string, now_ms: number): any;
  /**
   * Return websocket-attach lifecycle snapshot.
   *
   * Shape:
   * `{state, attempt, maxRetries, handshakeDeadlineMs, retryDeadlineMs,
   *   sessionId, closeReason, failureCode, closeCode, cleanClose, canRetry}`
   */
  attachState(): any;
  /**
   * Advance timer-driven attach transitions deterministically.
   */
  attachTick(now_ms: number): any;
  /**
   * Inform state machine that transport was closed.
   */
  attachTransportClosed(code: number, clean: boolean, reason: string, now_ms: number): any;
  /**
   * Inform state machine that the transport opened successfully.
   *
   * Host should send handshake frame when transition actions include
   * `send_handshake`.
   */
  attachTransportOpened(now_ms: number): any;
  /**
   * Clear search query/results and remove search highlight.
   */
  clearSearch(): void;
  clearSelection(): void;
  /**
   * Return current clipboard policy snapshot.
   */
  clipboardPolicy(): any;
  /**
   * Dispose an event subscription handle and release its queued records.
   */
  closeEventSubscription(subscription_id: number): boolean;
  /**
   * Return selected text for host-managed clipboard writes.
   *
   * Returns `None` when there is no active non-empty selection.
   */
  copySelection(): string | undefined;
  /**
   * Create a decoration primitive anchored by marker ids.
   *
   * `kind` values:
   * - `"inline"`: range `[startCol, endCol)` on `startMarkerId` line
   * - `"line"`: full-line decoration at `startMarkerId`
   * - `"range"`: multiline range from `startMarkerId` to `endMarkerId`
   *
   * For non-range kinds pass `endMarkerId < 0`.
   */
  createDecoration(
    kind: string,
    start_marker_id: number,
    end_marker_id: number,
    start_col: number,
    end_col: number,
  ): number;
  /**
   * Register a typed host-event subscription with bounded buffering.
   *
   * `options` keys:
   * - `eventTypes` / `event_types`: string[] event taxonomy filter (defaults to all)
   * - `maxBuffered` / `max_buffered`: number in `1..=8192` (defaults to 512)
   */
  createEventSubscription(options?: any | null): any;
  /**
   * Create a marker anchored to a unified-history line index.
   *
   * - `line_idx`: `0 = oldest retained line`, must be in range of
   *   `viewportState().totalLines`.
   * - `column`: optional preferred column for inline/range decorations.
   *
   * Returns a deterministic marker id (`u32`).
   */
  createMarker(line_idx: number, column: number): number;
  /**
   * Return decoration snapshots resolved against the current viewport/history.
   */
  decorationsState(): any;
  /**
   * Explicit teardown for JS callers. Drops GPU resources and clears
   * internal references so the canvas can be reclaimed.
   */
  destroy(): void;
  /**
   * Drain queued live-region announcements for host-side screen-reader wiring.
   */
  drainAccessibilityAnnouncements(): Array<any>;
  /**
   * Drain structured attach transition logs as JSONL lines.
   */
  drainAttachTransitionsJsonl(run_id: string): Array<any>;
  /**
   * Drain queued VT-compatible input byte chunks for remote PTY forwarding.
   */
  drainEncodedInputBytes(): Array<any>;
  /**
   * Drain queued, normalized input events as JSON strings.
   */
  drainEncodedInputs(): Array<any>;
  /**
   * Drain queued subscription events as deterministic JSONL records.
   */
  drainEventSubscriptionJsonl(
    subscription_id: number,
    run_id: string,
    seed: bigint,
    timestamp: string,
  ): Array<any>;
  /**
   * Drain queued subscription events as structured JS objects.
   */
  drainEventSubscription(subscription_id: number): Array<any>;
  /**
   * Drain queued IME composition trace records as JSONL lines.
   *
   * Records are emitted in rewrite order and include post-rewrite composition
   * state snapshots for deterministic failure triage.
   */
  drainImeCompositionJsonl(run_id: string, seed: bigint, timestamp: string): Array<any>;
  /**
   * Drain queued link clicks into JSONL lines for deterministic E2E logs.
   *
   * Host code can persist the returned lines directly into an E2E JSONL log.
   */
  drainLinkClicksJsonl(run_id: string, seed: bigint, timestamp: string): Array<any>;
  /**
   * Drain queued hyperlink click events detected from normalized mouse input.
   *
   * Each entry has:
   * `{x, y, button, linkId, source, url, openAllowed, openReason}`.
   */
  drainLinkClicks(): Array<any>;
  /**
   * Drain marker/decoration diagnostics as JSONL lines.
   *
   * Records are ordered by deterministic diagnostic sequence and include
   * stale/invalidation reasons for replay-grade troubleshooting.
   */
  drainMarkerDecorationJsonl(run_id: string, seed: number, timestamp: string): Array<any>;
  /**
   * Drain pending terminal reply bytes generated by VT query sequences.
   *
   * Returned as `Array<Uint8Array>` chunks in FIFO order.
   */
  drainReplyBytes(): Array<any>;
  /**
   * Remove a decoration by id.
   *
   * Returns `true` when a decoration existed and was removed.
   */
  dropDecoration(decoration_id: number): boolean;
  /**
   * Remove a marker by id.
   *
   * Returns `true` when a marker existed and was removed.
   */
  dropMarker(marker_id: number): boolean;
  /**
   * Snapshot subscription queue depth/drop counters for host observability.
   *
   * Returns `null` when the handle does not exist.
   */
  eventSubscriptionState(subscription_id: number): any;
  /**
   * Extract selected text from current shadow cells (for copy workflows).
   */
  extractSelectionText(): string;
  /**
   * Feed a VT/ANSI byte stream (remote mode).
   */
  feed(data: Uint8Array): void;
  /**
   * Fit the grid to a CSS-pixel container using current font metrics.
   *
   * `container_width_css` and `container_height_css` are CSS pixels.
   * `dpr` lets callers pass the latest `window.devicePixelRatio`.
   */
  fitToContainer(container_width_css: number, container_height_css: number, dpr: number): any;
  /**
   * Return the current IME composition snapshot.
   *
   * Shape:
   * `{ active, preedit }` where `preedit` is `null` when no tracked preedit text exists.
   */
  imeState(): any;
  /**
   * Initialize the terminal surface with an existing `<canvas>`.
   *
   * Creates the WebGPU renderer, performing adapter/device negotiation.
   * Exported as an async JS function returning a Promise.
   */
  init(canvas: HTMLCanvasElement, options?: any | null): Promise<void>;
  /**
   * Accepts DOM-derived keyboard/mouse/touch events.
   *
   * This method expects an `InputEvent`-shaped JS object (not a raw DOM event),
   * with a `kind` discriminator and normalized cell coordinates where relevant.
   *
   * The event is normalized to a stable JSON encoding suitable for record/replay,
   * then queued for downstream consumption (e.g. feeding `ftui-web`).
   */
  input(event: any): void;
  /**
   * Return hyperlink ID at a given grid cell (0 if none / out of bounds).
   */
  linkAt(x: number, y: number): number;
  /**
   * Return current link open policy snapshot.
   */
  linkOpenPolicy(): any;
  /**
   * Return resolved hyperlink URL at a given cell, if present.
   *
   * Explicit OSC-8 links take precedence over auto-detected plaintext URLs.
   */
  linkUrlAt(x: number, y: number): string | undefined;
  /**
   * Return marker snapshots with deterministic anchor-resolution metadata.
   */
  markersState(): any;
  constructor();
  /**
   * Queue pasted text as terminal input bytes.
   *
   * Browser clipboard APIs require trusted user gestures; hosts should read
   * clipboard content in JS and pass the text here for deterministic VT encoding.
   */
  pasteText(text: string): void;
  /**
   * Request a frame render. Encodes and submits a WebGPU draw pass.
   */
  render(): void;
  /**
   * Return the active renderer backend (`webgpu`, `canvas2d`, or `none` before init).
   */
  rendererBackend(): string;
  /**
   * Resize the terminal in logical grid coordinates (cols/rows).
   */
  resize(cols: number, rows: number): void;
  /**
   * Build plain-text viewport mirror for screen readers.
   */
  screenReaderMirrorText(): string;
  /**
   * Scroll viewport by signed line count (positive = older, negative = newer).
   */
  scrollLines(lines: number): any;
  /**
   * Scroll viewport by signed page count.
   *
   * One page equals current viewport row count.
   */
  scrollPages(pages: number): any;
  /**
   * Jump viewport to newest output (follow-output position).
   */
  scrollToBottom(): any;
  /**
   * Jump viewport so target absolute history line is visible.
   *
   * `line_idx` uses unified history indexing (`0 = oldest retained line`).
   */
  scrollToLine(line_idx: number): any;
  /**
   * Jump viewport to oldest retained line.
   */
  scrollToTop(): any;
  /**
   * Jump to the next search match (wrap at end) and update highlight overlay.
   *
   * Returns current search state.
   */
  searchNext(): any;
  /**
   * Jump to the previous search match (wrap at beginning) and update highlight overlay.
   *
   * Returns current search state.
   */
  searchPrev(): any;
  /**
   * Return search state snapshot as a JS object.
   *
   * Shape:
   * `{ query, normalizedQuery, caseSensitive, normalizeUnicode, matchCount,
   *    activeMatchIndex, activeLine, activeStart, activeEnd }`
   */
  searchState(): any;
  /**
   * Update accessibility preferences from a JS object.
   *
   * Supported keys:
   * - `screenReader` / `screen_reader`: boolean
   * - `highContrast` / `high_contrast`: boolean
   * - `reducedMotion` / `reduced_motion`: boolean
   * - `announce`: string (optional live-region message)
   */
  setAccessibility(options: any): void;
  /**
   * Configure clipboard policy defaults.
   *
   * Supported keys:
   * - `copyEnabled` / `copy_enabled`: bool
   * - `pasteEnabled` / `paste_enabled`: bool
   * - `maxPasteBytes` / `max_paste_bytes`: number (1..=786432)
   */
  setClipboardPolicy(options: any): void;
  /**
   * Configure cursor overlay.
   *
   * - `offset`: linear cell offset (`row * cols + col`), or `< 0` to clear.
   * - `style`: `0=none`, `1=block`, `2=bar`, `3=underline`.
   */
  setCursor(offset: number, style: number): void;
  setHoveredLinkId(link_id: number): void;
  /**
   * Configure host-side link open policy.
   *
   * Supported keys:
   * - `allowHttp` / `allow_http`: bool
   * - `allowHttps` / `allow_https`: bool
   * - `allowedHosts` / `allowed_hosts`: string[]
   * - `blockedHosts` / `blocked_hosts`: string[]
   *
   * Defaults: `allowHttp=false`, `allowHttps=true`, empty allow/block host lists.
   */
  setLinkOpenPolicy(options: any): void;
  /**
   * Update DPR + zoom scaling while preserving current grid size.
   *
   * Returns deterministic geometry snapshot:
   * `{ cols, rows, pixelWidth, pixelHeight, cellWidthPx, cellHeightPx, dpr, zoom }`.
   */
  setScale(dpr: number, zoom: number): any;
  /**
   * Build or refresh search results over the current shadow grid.
   *
   * `options` keys:
   * - `caseSensitive` / `case_sensitive`: boolean (default false)
   * - `normalizeUnicode` / `normalize_unicode`: boolean (default true)
   *
   * Returns current search state:
   * `{query, normalizedQuery, caseSensitive, normalizeUnicode, matchCount,
   *   activeMatchIndex, activeLine, activeStart, activeEnd}`
   */
  setSearchQuery(query: string, options?: any | null): any;
  /**
   * Configure selection overlay using a `[start, end)` cell-offset range.
   *
   * Pass negative values to clear selection.
   */
  setSelectionRange(start: number, end: number): void;
  /**
   * Configure text shaping / ligature behavior.
   *
   * Supported keys:
   * - `enabled`: bool
   * - `shapingEnabled` / `shaping_enabled`: bool
   * - `textShaping` / `text_shaping`: bool
   *
   * Default behavior is disabled to preserve baseline perf characteristics.
   */
  setTextShaping(options: any): void;
  /**
   * Convenience wrapper for user-controlled zoom updates.
   */
  setZoom(zoom: number): any;
  /**
   * Emit one JSONL `frame` trace record for browser resize-storm E2E logs.
   *
   * The line includes both a deterministic frame hash and the current
   * geometry snapshot so test runners can diagnose resize/zoom/DPR mismatches.
   */
  snapshotResizeStormFrameJsonl(
    run_id: string,
    seed: number,
    timestamp: string,
    frame_idx: number,
  ): string;
  /**
   * Emit one JSONL `scrollback_frame` trace record for viewport telemetry.
   *
   * This mirrors `frame_harness::scrollback_virtualization_frame_jsonl` and
   * is intended for deterministic E2E/perf evidence collection.
   */
  snapshotScrollbackFrameJsonl(
    run_id: string,
    timestamp: string,
    frame_idx: number,
    render_cost_us: number,
  ): string;
  /**
   * Return current text shaping configuration.
   *
   * Shape: `{ enabled, engine, fallback }`
   */
  textShapingState(): any;
  /**
   * Return visible viewport text lines over unified history
   * (`scrollback + visible grid`).
   */
  viewportLines(): Array<any>;
  /**
   * Return a deterministic viewport snapshot over unified history
   * (`scrollback + visible grid`).
   *
   * Shape:
   * `{ totalLines, scrollbackLines, gridRows, viewportStart, viewportEnd,
   *    renderStart, renderEnd, scrollOffsetFromBottom, maxScrollOffset,
   *    atBottom, followOutput, animating, subLineOffset }`
   */
  viewportState(): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_frankentermweb_free: (a: number, b: number) => void;
  readonly frankentermweb_accessibilityClassNames: (a: number) => number;
  readonly frankentermweb_accessibilityDomSnapshot: (a: number) => number;
  readonly frankentermweb_accessibilityState: (a: number) => number;
  readonly frankentermweb_apiContract: (a: number) => number;
  readonly frankentermweb_apiVersion: (a: number, b: number) => void;
  readonly frankentermweb_applyPatch: (a: number, b: number, c: number) => void;
  readonly frankentermweb_applyPatchBatch: (a: number, b: number, c: number) => void;
  readonly frankentermweb_applyPatchBatchFlat: (a: number, b: number, c: number, d: number) => void;
  readonly frankentermweb_attachClose: (a: number, b: number, c: number, d: number) => number;
  readonly frankentermweb_attachConnect: (a: number, b: number) => number;
  readonly frankentermweb_attachHandshakeAck: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
  ) => void;
  readonly frankentermweb_attachProtocolError: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ) => void;
  readonly frankentermweb_attachReset: (a: number, b: number) => number;
  readonly frankentermweb_attachSessionEnded: (
    a: number,
    b: number,
    c: number,
    d: number,
  ) => number;
  readonly frankentermweb_attachState: (a: number) => number;
  readonly frankentermweb_attachTick: (a: number, b: number) => number;
  readonly frankentermweb_attachTransportClosed: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ) => number;
  readonly frankentermweb_attachTransportOpened: (a: number, b: number) => number;
  readonly frankentermweb_clearSearch: (a: number) => void;
  readonly frankentermweb_clearSelection: (a: number) => void;
  readonly frankentermweb_clipboardPolicy: (a: number) => number;
  readonly frankentermweb_closeEventSubscription: (a: number, b: number) => number;
  readonly frankentermweb_copySelection: (a: number, b: number) => void;
  readonly frankentermweb_createDecoration: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
  ) => void;
  readonly frankentermweb_createEventSubscription: (a: number, b: number, c: number) => void;
  readonly frankentermweb_createMarker: (a: number, b: number, c: number, d: number) => void;
  readonly frankentermweb_decorationsState: (a: number) => number;
  readonly frankentermweb_destroy: (a: number) => void;
  readonly frankentermweb_drainAccessibilityAnnouncements: (a: number) => number;
  readonly frankentermweb_drainAttachTransitionsJsonl: (
    a: number,
    b: number,
    c: number,
    d: number,
  ) => void;
  readonly frankentermweb_drainEncodedInputBytes: (a: number) => number;
  readonly frankentermweb_drainEncodedInputs: (a: number) => number;
  readonly frankentermweb_drainEventSubscription: (a: number, b: number, c: number) => void;
  readonly frankentermweb_drainEventSubscriptionJsonl: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: bigint,
    g: number,
    h: number,
  ) => void;
  readonly frankentermweb_drainImeCompositionJsonl: (
    a: number,
    b: number,
    c: number,
    d: bigint,
    e: number,
    f: number,
  ) => number;
  readonly frankentermweb_drainLinkClicks: (a: number) => number;
  readonly frankentermweb_drainLinkClicksJsonl: (
    a: number,
    b: number,
    c: number,
    d: bigint,
    e: number,
    f: number,
  ) => number;
  readonly frankentermweb_drainMarkerDecorationJsonl: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
  ) => void;
  readonly frankentermweb_drainReplyBytes: (a: number) => number;
  readonly frankentermweb_dropDecoration: (a: number, b: number) => number;
  readonly frankentermweb_dropMarker: (a: number, b: number) => number;
  readonly frankentermweb_eventSubscriptionState: (a: number, b: number) => number;
  readonly frankentermweb_extractSelectionText: (a: number, b: number) => void;
  readonly frankentermweb_feed: (a: number, b: number, c: number) => void;
  readonly frankentermweb_fitToContainer: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
  ) => void;
  readonly frankentermweb_imeState: (a: number) => number;
  readonly frankentermweb_init: (a: number, b: number, c: number) => number;
  readonly frankentermweb_input: (a: number, b: number, c: number) => void;
  readonly frankentermweb_linkAt: (a: number, b: number, c: number) => number;
  readonly frankentermweb_linkOpenPolicy: (a: number) => number;
  readonly frankentermweb_linkUrlAt: (a: number, b: number, c: number, d: number) => void;
  readonly frankentermweb_markersState: (a: number) => number;
  readonly frankentermweb_new: () => number;
  readonly frankentermweb_pasteText: (a: number, b: number, c: number, d: number) => void;
  readonly frankentermweb_render: (a: number, b: number) => void;
  readonly frankentermweb_rendererBackend: (a: number, b: number) => void;
  readonly frankentermweb_resize: (a: number, b: number, c: number) => void;
  readonly frankentermweb_screenReaderMirrorText: (a: number, b: number) => void;
  readonly frankentermweb_scrollLines: (a: number, b: number) => number;
  readonly frankentermweb_scrollPages: (a: number, b: number) => number;
  readonly frankentermweb_scrollToBottom: (a: number) => number;
  readonly frankentermweb_scrollToLine: (a: number, b: number) => number;
  readonly frankentermweb_scrollToTop: (a: number) => number;
  readonly frankentermweb_searchNext: (a: number) => number;
  readonly frankentermweb_searchPrev: (a: number) => number;
  readonly frankentermweb_searchState: (a: number) => number;
  readonly frankentermweb_setAccessibility: (a: number, b: number, c: number) => void;
  readonly frankentermweb_setClipboardPolicy: (a: number, b: number, c: number) => void;
  readonly frankentermweb_setCursor: (a: number, b: number, c: number, d: number) => void;
  readonly frankentermweb_setHoveredLinkId: (a: number, b: number) => void;
  readonly frankentermweb_setLinkOpenPolicy: (a: number, b: number, c: number) => void;
  readonly frankentermweb_setScale: (a: number, b: number, c: number, d: number) => void;
  readonly frankentermweb_setSearchQuery: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
  ) => void;
  readonly frankentermweb_setSelectionRange: (a: number, b: number, c: number, d: number) => void;
  readonly frankentermweb_setTextShaping: (a: number, b: number, c: number) => void;
  readonly frankentermweb_setZoom: (a: number, b: number, c: number) => void;
  readonly frankentermweb_snapshotResizeStormFrameJsonl: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
  ) => void;
  readonly frankentermweb_snapshotScrollbackFrameJsonl: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
  ) => void;
  readonly frankentermweb_textShapingState: (a: number) => number;
  readonly frankentermweb_viewportLines: (a: number) => number;
  readonly frankentermweb_viewportState: (a: number) => number;
  readonly __wasm_bindgen_func_elem_3005: (a: number, b: number, c: number, d: number) => void;
  readonly __wasm_bindgen_func_elem_3007: (a: number, b: number, c: number, d: number) => void;
  readonly __wasm_bindgen_func_elem_1604: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export: (a: number, b: number) => number;
  readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export3: (a: number) => void;
  readonly __wbindgen_export4: (a: number, b: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export5: (a: number, b: number, c: number) => void;
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
export default function __wbg_init(
  module_or_path?:
    | { module_or_path: InitInput | Promise<InitInput> }
    | InitInput
    | Promise<InitInput>,
): Promise<InitOutput>;
