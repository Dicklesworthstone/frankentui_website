/* @ts-self-types="./FrankenTerm.d.ts" */

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
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    FrankenTermWebFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_frankentermweb_free(ptr, 0);
  }
  /**
   * Suggested host-side CSS classes for accessibility modes.
   * @returns {Array<any>}
   */
  accessibilityClassNames() {
    const ret = wasm.frankentermweb_accessibilityClassNames(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Expose a host-friendly DOM mirror snapshot for ARIA wiring.
   *
   * Shape:
   * `{ role, ariaMultiline, ariaLive, ariaAtomic, tabIndex, focused, focusVisible,
   *    screenReader, highContrast, reducedMotion, value, cursorOffset,
   *    selectionStart, selectionEnd }`
   * @returns {any}
   */
  accessibilityDomSnapshot() {
    const ret = wasm.frankentermweb_accessibilityDomSnapshot(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Return current accessibility preferences.
   *
   * Shape:
   * `{ screenReader, highContrast, reducedMotion, focused, pendingAnnouncements }`
   * @returns {any}
   */
  accessibilityState() {
    const ret = wasm.frankentermweb_accessibilityState(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Canonical API contract snapshot for deterministic host validation.
   *
   * Shape:
   * `{ apiLine, apiVersion, packageName, packageVersion, protocolVersion,
   *    methods, versioningPolicy, eventSchemaVersion, eventTypes,
   *    eventOrdering, eventBufferPolicy }`
   * @returns {any}
   */
  apiContract() {
    const ret = wasm.frankentermweb_apiContract(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Stable FrankenTermJS API semver for host-side compatibility checks.
   *
   * This is intentionally distinct from crate/package semver.
   * @returns {string}
   */
  apiVersion() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_apiVersion(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export5(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Apply multiple cell patches from flat payload arrays (ftui-web fast path).
   *
   * - `spans`: `Uint32Array` in `[offset, len, offset, len, ...]` order
   * - `cells`: `Uint32Array` in `[bg, fg, glyph, attrs, ...]` order
   *
   * `len` is measured in cells (not `u32` words).
   * @param {Uint32Array} spans
   * @param {Uint32Array} cells
   */
  applyPatchBatchFlat(spans, cells) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_applyPatchBatchFlat(
        retptr,
        this.__wbg_ptr,
        addHeapObject(spans),
        addHeapObject(cells),
      );
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
   * Apply multiple cell patches (ftui-web mode).
   *
   * Accepts a JS array:
   * `[{ offset: number, cells: [{bg, fg, glyph, attrs}] }, ...]`.
   *
   * This is optimized for `ftui-web` patch runs so hosts can forward a
   * complete present step with one JS→WASM call.
   * @param {any} patches
   */
  applyPatchBatch(patches) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_applyPatchBatch(retptr, this.__wbg_ptr, addHeapObject(patches));
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
   * Apply a cell patch (ftui-web mode).
   *
   * Accepts a JS object: `{ offset: number, cells: [{bg, fg, glyph, attrs}] }`.
   * When a renderer is initialized, only the patched cells are uploaded to
   * the GPU. Without a renderer, patches still update the in-memory shadow
   * state so host-side logic (search/link lookup/evidence) remains usable.
   * @param {any} patch
   */
  applyPatch(patch) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_applyPatch(retptr, this.__wbg_ptr, addHeapObject(patch));
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
   * Request graceful client-side session close.
   * @param {string} reason
   * @param {number} now_ms
   * @returns {any}
   */
  attachClose(reason, now_ms) {
    const ptr0 = passStringToWasm0(reason, wasm.__wbindgen_export, wasm.__wbindgen_export2);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frankentermweb_attachClose(this.__wbg_ptr, ptr0, len0, now_ms);
    return takeObject(ret);
  }
  /**
   * Start (or restart) a websocket attach lifecycle.
   *
   * Host is expected to open the websocket transport after this call reports
   * `open_transport` in `actions`.
   * @param {number} now_ms
   * @returns {any}
   */
  attachConnect(now_ms) {
    const ret = wasm.frankentermweb_attachConnect(this.__wbg_ptr, now_ms);
    return takeObject(ret);
  }
  /**
   * Inform state machine that handshake acknowledgement was received.
   * @param {string} session_id
   * @param {number} now_ms
   * @returns {any}
   */
  attachHandshakeAck(session_id, now_ms) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(session_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len0 = WASM_VECTOR_LEN;
      wasm.frankentermweb_attachHandshakeAck(retptr, this.__wbg_ptr, ptr0, len0, now_ms);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Inform state machine about protocol-level error.
   * @param {string} code
   * @param {boolean} fatal
   * @param {number} now_ms
   * @returns {any}
   */
  attachProtocolError(code, fatal, now_ms) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(code, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len0 = WASM_VECTOR_LEN;
      wasm.frankentermweb_attachProtocolError(retptr, this.__wbg_ptr, ptr0, len0, fatal, now_ms);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Reset attach lifecycle to detached baseline state.
   * @param {number} now_ms
   * @returns {any}
   */
  attachReset(now_ms) {
    const ret = wasm.frankentermweb_attachReset(this.__wbg_ptr, now_ms);
    return takeObject(ret);
  }
  /**
   * Inform state machine about server-initiated session end.
   * @param {string} reason
   * @param {number} now_ms
   * @returns {any}
   */
  attachSessionEnded(reason, now_ms) {
    const ptr0 = passStringToWasm0(reason, wasm.__wbindgen_export, wasm.__wbindgen_export2);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frankentermweb_attachSessionEnded(this.__wbg_ptr, ptr0, len0, now_ms);
    return takeObject(ret);
  }
  /**
   * Return websocket-attach lifecycle snapshot.
   *
   * Shape:
   * `{state, attempt, maxRetries, handshakeDeadlineMs, retryDeadlineMs,
   *   sessionId, closeReason, failureCode, closeCode, cleanClose, canRetry}`
   * @returns {any}
   */
  attachState() {
    const ret = wasm.frankentermweb_attachState(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Advance timer-driven attach transitions deterministically.
   * @param {number} now_ms
   * @returns {any}
   */
  attachTick(now_ms) {
    const ret = wasm.frankentermweb_attachTick(this.__wbg_ptr, now_ms);
    return takeObject(ret);
  }
  /**
   * Inform state machine that transport was closed.
   * @param {number} code
   * @param {boolean} clean
   * @param {string} reason
   * @param {number} now_ms
   * @returns {any}
   */
  attachTransportClosed(code, clean, reason, now_ms) {
    const ptr0 = passStringToWasm0(reason, wasm.__wbindgen_export, wasm.__wbindgen_export2);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.frankentermweb_attachTransportClosed(
      this.__wbg_ptr,
      code,
      clean,
      ptr0,
      len0,
      now_ms,
    );
    return takeObject(ret);
  }
  /**
   * Inform state machine that the transport opened successfully.
   *
   * Host should send handshake frame when transition actions include
   * `send_handshake`.
   * @param {number} now_ms
   * @returns {any}
   */
  attachTransportOpened(now_ms) {
    const ret = wasm.frankentermweb_attachTransportOpened(this.__wbg_ptr, now_ms);
    return takeObject(ret);
  }
  /**
   * Clear search query/results and remove search highlight.
   */
  clearSearch() {
    wasm.frankentermweb_clearSearch(this.__wbg_ptr);
  }
  clearSelection() {
    wasm.frankentermweb_clearSelection(this.__wbg_ptr);
  }
  /**
   * Return current clipboard policy snapshot.
   * @returns {any}
   */
  clipboardPolicy() {
    const ret = wasm.frankentermweb_clipboardPolicy(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Dispose an event subscription handle and release its queued records.
   * @param {number} subscription_id
   * @returns {boolean}
   */
  closeEventSubscription(subscription_id) {
    const ret = wasm.frankentermweb_closeEventSubscription(this.__wbg_ptr, subscription_id);
    return ret !== 0;
  }
  /**
   * Return selected text for host-managed clipboard writes.
   *
   * Returns `None` when there is no active non-empty selection.
   * @returns {string | undefined}
   */
  copySelection() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_copySelection(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1);
        wasm.__wbindgen_export5(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Create a decoration primitive anchored by marker ids.
   *
   * `kind` values:
   * - `"inline"`: range `[startCol, endCol)` on `startMarkerId` line
   * - `"line"`: full-line decoration at `startMarkerId`
   * - `"range"`: multiline range from `startMarkerId` to `endMarkerId`
   *
   * For non-range kinds pass `endMarkerId < 0`.
   * @param {string} kind
   * @param {number} start_marker_id
   * @param {number} end_marker_id
   * @param {number} start_col
   * @param {number} end_col
   * @returns {number}
   */
  createDecoration(kind, start_marker_id, end_marker_id, start_col, end_col) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(kind, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len0 = WASM_VECTOR_LEN;
      wasm.frankentermweb_createDecoration(
        retptr,
        this.__wbg_ptr,
        ptr0,
        len0,
        start_marker_id,
        end_marker_id,
        start_col,
        end_col,
      );
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return r0 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Register a typed host-event subscription with bounded buffering.
   *
   * `options` keys:
   * - `eventTypes` / `event_types`: string[] event taxonomy filter (defaults to all)
   * - `maxBuffered` / `max_buffered`: number in `1..=8192` (defaults to 512)
   * @param {any | null} [options]
   * @returns {any}
   */
  createEventSubscription(options) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_createEventSubscription(
        retptr,
        this.__wbg_ptr,
        isLikeNone(options) ? 0 : addHeapObject(options),
      );
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Create a marker anchored to a unified-history line index.
   *
   * - `line_idx`: `0 = oldest retained line`, must be in range of
   *   `viewportState().totalLines`.
   * - `column`: optional preferred column for inline/range decorations.
   *
   * Returns a deterministic marker id (`u32`).
   * @param {number} line_idx
   * @param {number} column
   * @returns {number}
   */
  createMarker(line_idx, column) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_createMarker(retptr, this.__wbg_ptr, line_idx, column);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return r0 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Return decoration snapshots resolved against the current viewport/history.
   * @returns {any}
   */
  decorationsState() {
    const ret = wasm.frankentermweb_decorationsState(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Explicit teardown for JS callers. Drops GPU resources and clears
   * internal references so the canvas can be reclaimed.
   */
  destroy() {
    wasm.frankentermweb_destroy(this.__wbg_ptr);
  }
  /**
   * Drain queued live-region announcements for host-side screen-reader wiring.
   * @returns {Array<any>}
   */
  drainAccessibilityAnnouncements() {
    const ret = wasm.frankentermweb_drainAccessibilityAnnouncements(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Drain structured attach transition logs as JSONL lines.
   * @param {string} run_id
   * @returns {Array<any>}
   */
  drainAttachTransitionsJsonl(run_id) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(run_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len0 = WASM_VECTOR_LEN;
      wasm.frankentermweb_drainAttachTransitionsJsonl(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Drain queued VT-compatible input byte chunks for remote PTY forwarding.
   * @returns {Array<any>}
   */
  drainEncodedInputBytes() {
    const ret = wasm.frankentermweb_drainEncodedInputBytes(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Drain queued, normalized input events as JSON strings.
   * @returns {Array<any>}
   */
  drainEncodedInputs() {
    const ret = wasm.frankentermweb_drainEncodedInputs(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Drain queued subscription events as deterministic JSONL records.
   * @param {number} subscription_id
   * @param {string} run_id
   * @param {bigint} seed
   * @param {string} timestamp
   * @returns {Array<any>}
   */
  drainEventSubscriptionJsonl(subscription_id, run_id, seed, timestamp) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(run_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passStringToWasm0(timestamp, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len1 = WASM_VECTOR_LEN;
      wasm.frankentermweb_drainEventSubscriptionJsonl(
        retptr,
        this.__wbg_ptr,
        subscription_id,
        ptr0,
        len0,
        seed,
        ptr1,
        len1,
      );
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Drain queued subscription events as structured JS objects.
   * @param {number} subscription_id
   * @returns {Array<any>}
   */
  drainEventSubscription(subscription_id) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_drainEventSubscription(retptr, this.__wbg_ptr, subscription_id);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Drain queued IME composition trace records as JSONL lines.
   *
   * Records are emitted in rewrite order and include post-rewrite composition
   * state snapshots for deterministic failure triage.
   * @param {string} run_id
   * @param {bigint} seed
   * @param {string} timestamp
   * @returns {Array<any>}
   */
  drainImeCompositionJsonl(run_id, seed, timestamp) {
    const ptr0 = passStringToWasm0(run_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(timestamp, wasm.__wbindgen_export, wasm.__wbindgen_export2);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.frankentermweb_drainImeCompositionJsonl(
      this.__wbg_ptr,
      ptr0,
      len0,
      seed,
      ptr1,
      len1,
    );
    return takeObject(ret);
  }
  /**
   * Drain queued link clicks into JSONL lines for deterministic E2E logs.
   *
   * Host code can persist the returned lines directly into an E2E JSONL log.
   * @param {string} run_id
   * @param {bigint} seed
   * @param {string} timestamp
   * @returns {Array<any>}
   */
  drainLinkClicksJsonl(run_id, seed, timestamp) {
    const ptr0 = passStringToWasm0(run_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(timestamp, wasm.__wbindgen_export, wasm.__wbindgen_export2);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.frankentermweb_drainLinkClicksJsonl(
      this.__wbg_ptr,
      ptr0,
      len0,
      seed,
      ptr1,
      len1,
    );
    return takeObject(ret);
  }
  /**
   * Drain queued hyperlink click events detected from normalized mouse input.
   *
   * Each entry has:
   * `{x, y, button, linkId, source, url, openAllowed, openReason}`.
   * @returns {Array<any>}
   */
  drainLinkClicks() {
    const ret = wasm.frankentermweb_drainLinkClicks(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Drain marker/decoration diagnostics as JSONL lines.
   *
   * Records are ordered by deterministic diagnostic sequence and include
   * stale/invalidation reasons for replay-grade troubleshooting.
   * @param {string} run_id
   * @param {number} seed
   * @param {string} timestamp
   * @returns {Array<any>}
   */
  drainMarkerDecorationJsonl(run_id, seed, timestamp) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(run_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passStringToWasm0(timestamp, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len1 = WASM_VECTOR_LEN;
      wasm.frankentermweb_drainMarkerDecorationJsonl(
        retptr,
        this.__wbg_ptr,
        ptr0,
        len0,
        seed,
        ptr1,
        len1,
      );
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Drain pending terminal reply bytes generated by VT query sequences.
   *
   * Returned as `Array<Uint8Array>` chunks in FIFO order.
   * @returns {Array<any>}
   */
  drainReplyBytes() {
    const ret = wasm.frankentermweb_drainReplyBytes(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Remove a decoration by id.
   *
   * Returns `true` when a decoration existed and was removed.
   * @param {number} decoration_id
   * @returns {boolean}
   */
  dropDecoration(decoration_id) {
    const ret = wasm.frankentermweb_dropDecoration(this.__wbg_ptr, decoration_id);
    return ret !== 0;
  }
  /**
   * Remove a marker by id.
   *
   * Returns `true` when a marker existed and was removed.
   * @param {number} marker_id
   * @returns {boolean}
   */
  dropMarker(marker_id) {
    const ret = wasm.frankentermweb_dropMarker(this.__wbg_ptr, marker_id);
    return ret !== 0;
  }
  /**
   * Snapshot subscription queue depth/drop counters for host observability.
   *
   * Returns `null` when the handle does not exist.
   * @param {number} subscription_id
   * @returns {any}
   */
  eventSubscriptionState(subscription_id) {
    const ret = wasm.frankentermweb_eventSubscriptionState(this.__wbg_ptr, subscription_id);
    return takeObject(ret);
  }
  /**
   * Extract selected text from current shadow cells (for copy workflows).
   * @returns {string}
   */
  extractSelectionText() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_extractSelectionText(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export5(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Feed a VT/ANSI byte stream (remote mode).
   * @param {Uint8Array} data
   */
  feed(data) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_export);
    const len0 = WASM_VECTOR_LEN;
    wasm.frankentermweb_feed(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Fit the grid to a CSS-pixel container using current font metrics.
   *
   * `container_width_css` and `container_height_css` are CSS pixels.
   * `dpr` lets callers pass the latest `window.devicePixelRatio`.
   * @param {number} container_width_css
   * @param {number} container_height_css
   * @param {number} dpr
   * @returns {any}
   */
  fitToContainer(container_width_css, container_height_css, dpr) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_fitToContainer(
        retptr,
        this.__wbg_ptr,
        container_width_css,
        container_height_css,
        dpr,
      );
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Return the current IME composition snapshot.
   *
   * Shape:
   * `{ active, preedit }` where `preedit` is `null` when no tracked preedit text exists.
   * @returns {any}
   */
  imeState() {
    const ret = wasm.frankentermweb_imeState(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Initialize the terminal surface with an existing `<canvas>`.
   *
   * Creates the WebGPU renderer, performing adapter/device negotiation.
   * Exported as an async JS function returning a Promise.
   * @param {HTMLCanvasElement} canvas
   * @param {any | null} [options]
   * @returns {Promise<void>}
   */
  init(canvas, options) {
    const ret = wasm.frankentermweb_init(
      this.__wbg_ptr,
      addHeapObject(canvas),
      isLikeNone(options) ? 0 : addHeapObject(options),
    );
    return takeObject(ret);
  }
  /**
   * Accepts DOM-derived keyboard/mouse/touch events.
   *
   * This method expects an `InputEvent`-shaped JS object (not a raw DOM event),
   * with a `kind` discriminator and normalized cell coordinates where relevant.
   *
   * The event is normalized to a stable JSON encoding suitable for record/replay,
   * then queued for downstream consumption (e.g. feeding `ftui-web`).
   * @param {any} event
   */
  input(event) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_input(retptr, this.__wbg_ptr, addHeapObject(event));
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
   * Return hyperlink ID at a given grid cell (0 if none / out of bounds).
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  linkAt(x, y) {
    const ret = wasm.frankentermweb_linkAt(this.__wbg_ptr, x, y);
    return ret >>> 0;
  }
  /**
   * Return current link open policy snapshot.
   * @returns {any}
   */
  linkOpenPolicy() {
    const ret = wasm.frankentermweb_linkOpenPolicy(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Return resolved hyperlink URL at a given cell, if present.
   *
   * Explicit OSC-8 links take precedence over auto-detected plaintext URLs.
   * @param {number} x
   * @param {number} y
   * @returns {string | undefined}
   */
  linkUrlAt(x, y) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_linkUrlAt(retptr, this.__wbg_ptr, x, y);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1);
        wasm.__wbindgen_export5(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Return marker snapshots with deterministic anchor-resolution metadata.
   * @returns {any}
   */
  markersState() {
    const ret = wasm.frankentermweb_markersState(this.__wbg_ptr);
    return takeObject(ret);
  }
  constructor() {
    const ret = wasm.frankentermweb_new();
    this.__wbg_ptr = ret;
    FrankenTermWebFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * Queue pasted text as terminal input bytes.
   *
   * Browser clipboard APIs require trusted user gestures; hosts should read
   * clipboard content in JS and pass the text here for deterministic VT encoding.
   * @param {string} text
   */
  pasteText(text) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(text, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len0 = WASM_VECTOR_LEN;
      wasm.frankentermweb_pasteText(retptr, this.__wbg_ptr, ptr0, len0);
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
   * Request a frame render. Encodes and submits a WebGPU draw pass.
   */
  render() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_render(retptr, this.__wbg_ptr);
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
   * Return the active renderer backend (`webgpu`, `canvas2d`, or `none` before init).
   * @returns {string}
   */
  rendererBackend() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_rendererBackend(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export5(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Resize the terminal in logical grid coordinates (cols/rows).
   * @param {number} cols
   * @param {number} rows
   */
  resize(cols, rows) {
    wasm.frankentermweb_resize(this.__wbg_ptr, cols, rows);
  }
  /**
   * Build plain-text viewport mirror for screen readers.
   * @returns {string}
   */
  screenReaderMirrorText() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_screenReaderMirrorText(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export5(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Scroll viewport by signed line count (positive = older, negative = newer).
   * @param {number} lines
   * @returns {any}
   */
  scrollLines(lines) {
    const ret = wasm.frankentermweb_scrollLines(this.__wbg_ptr, lines);
    return takeObject(ret);
  }
  /**
   * Scroll viewport by signed page count.
   *
   * One page equals current viewport row count.
   * @param {number} pages
   * @returns {any}
   */
  scrollPages(pages) {
    const ret = wasm.frankentermweb_scrollPages(this.__wbg_ptr, pages);
    return takeObject(ret);
  }
  /**
   * Jump viewport to newest output (follow-output position).
   * @returns {any}
   */
  scrollToBottom() {
    const ret = wasm.frankentermweb_scrollToBottom(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Jump viewport so target absolute history line is visible.
   *
   * `line_idx` uses unified history indexing (`0 = oldest retained line`).
   * @param {number} line_idx
   * @returns {any}
   */
  scrollToLine(line_idx) {
    const ret = wasm.frankentermweb_scrollToLine(this.__wbg_ptr, line_idx);
    return takeObject(ret);
  }
  /**
   * Jump viewport to oldest retained line.
   * @returns {any}
   */
  scrollToTop() {
    const ret = wasm.frankentermweb_scrollToTop(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Jump to the next search match (wrap at end) and update highlight overlay.
   *
   * Returns current search state.
   * @returns {any}
   */
  searchNext() {
    const ret = wasm.frankentermweb_searchNext(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Jump to the previous search match (wrap at beginning) and update highlight overlay.
   *
   * Returns current search state.
   * @returns {any}
   */
  searchPrev() {
    const ret = wasm.frankentermweb_searchPrev(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Return search state snapshot as a JS object.
   *
   * Shape:
   * `{ query, normalizedQuery, caseSensitive, normalizeUnicode, matchCount,
   *    activeMatchIndex, activeLine, activeStart, activeEnd }`
   * @returns {any}
   */
  searchState() {
    const ret = wasm.frankentermweb_searchState(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Update accessibility preferences from a JS object.
   *
   * Supported keys:
   * - `screenReader` / `screen_reader`: boolean
   * - `highContrast` / `high_contrast`: boolean
   * - `reducedMotion` / `reduced_motion`: boolean
   * - `announce`: string (optional live-region message)
   * @param {any} options
   */
  setAccessibility(options) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_setAccessibility(retptr, this.__wbg_ptr, addHeapObject(options));
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
   * Configure clipboard policy defaults.
   *
   * Supported keys:
   * - `copyEnabled` / `copy_enabled`: bool
   * - `pasteEnabled` / `paste_enabled`: bool
   * - `maxPasteBytes` / `max_paste_bytes`: number (1..=786432)
   * @param {any} options
   */
  setClipboardPolicy(options) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_setClipboardPolicy(retptr, this.__wbg_ptr, addHeapObject(options));
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
   * Configure cursor overlay.
   *
   * - `offset`: linear cell offset (`row * cols + col`), or `< 0` to clear.
   * - `style`: `0=none`, `1=block`, `2=bar`, `3=underline`.
   * @param {number} offset
   * @param {number} style
   */
  setCursor(offset, style) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_setCursor(retptr, this.__wbg_ptr, offset, style);
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
   * @param {number} link_id
   */
  setHoveredLinkId(link_id) {
    wasm.frankentermweb_setHoveredLinkId(this.__wbg_ptr, link_id);
  }
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
   * @param {any} options
   */
  setLinkOpenPolicy(options) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_setLinkOpenPolicy(retptr, this.__wbg_ptr, addHeapObject(options));
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
   * Update DPR + zoom scaling while preserving current grid size.
   *
   * Returns deterministic geometry snapshot:
   * `{ cols, rows, pixelWidth, pixelHeight, cellWidthPx, cellHeightPx, dpr, zoom }`.
   * @param {number} dpr
   * @param {number} zoom
   * @returns {any}
   */
  setScale(dpr, zoom) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_setScale(retptr, this.__wbg_ptr, dpr, zoom);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
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
   * @param {string} query
   * @param {any | null} [options]
   * @returns {any}
   */
  setSearchQuery(query, options) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(query, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len0 = WASM_VECTOR_LEN;
      wasm.frankentermweb_setSearchQuery(
        retptr,
        this.__wbg_ptr,
        ptr0,
        len0,
        isLikeNone(options) ? 0 : addHeapObject(options),
      );
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Configure selection overlay using a `[start, end)` cell-offset range.
   *
   * Pass negative values to clear selection.
   * @param {number} start
   * @param {number} end
   */
  setSelectionRange(start, end) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_setSelectionRange(retptr, this.__wbg_ptr, start, end);
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
   * Configure text shaping / ligature behavior.
   *
   * Supported keys:
   * - `enabled`: bool
   * - `shapingEnabled` / `shaping_enabled`: bool
   * - `textShaping` / `text_shaping`: bool
   *
   * Default behavior is disabled to preserve baseline perf characteristics.
   * @param {any} options
   */
  setTextShaping(options) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_setTextShaping(retptr, this.__wbg_ptr, addHeapObject(options));
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
   * Convenience wrapper for user-controlled zoom updates.
   * @param {number} zoom
   * @returns {any}
   */
  setZoom(zoom) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.frankentermweb_setZoom(retptr, this.__wbg_ptr, zoom);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * Emit one JSONL `frame` trace record for browser resize-storm E2E logs.
   *
   * The line includes both a deterministic frame hash and the current
   * geometry snapshot so test runners can diagnose resize/zoom/DPR mismatches.
   * @param {string} run_id
   * @param {number} seed
   * @param {string} timestamp
   * @param {number} frame_idx
   * @returns {string}
   */
  snapshotResizeStormFrameJsonl(run_id, seed, timestamp, frame_idx) {
    let deferred4_0;
    let deferred4_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(run_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passStringToWasm0(timestamp, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len1 = WASM_VECTOR_LEN;
      wasm.frankentermweb_snapshotResizeStormFrameJsonl(
        retptr,
        this.__wbg_ptr,
        ptr0,
        len0,
        seed,
        ptr1,
        len1,
        frame_idx,
      );
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
      var ptr3 = r0;
      var len3 = r1;
      if (r3) {
        ptr3 = 0;
        len3 = 0;
        throw takeObject(r2);
      }
      deferred4_0 = ptr3;
      deferred4_1 = len3;
      return getStringFromWasm0(ptr3, len3);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export5(deferred4_0, deferred4_1, 1);
    }
  }
  /**
   * Emit one JSONL `scrollback_frame` trace record for viewport telemetry.
   *
   * This mirrors `frame_harness::scrollback_virtualization_frame_jsonl` and
   * is intended for deterministic E2E/perf evidence collection.
   * @param {string} run_id
   * @param {string} timestamp
   * @param {number} frame_idx
   * @param {number} render_cost_us
   * @returns {string}
   */
  snapshotScrollbackFrameJsonl(run_id, timestamp, frame_idx, render_cost_us) {
    let deferred4_0;
    let deferred4_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(run_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passStringToWasm0(timestamp, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len1 = WASM_VECTOR_LEN;
      wasm.frankentermweb_snapshotScrollbackFrameJsonl(
        retptr,
        this.__wbg_ptr,
        ptr0,
        len0,
        ptr1,
        len1,
        frame_idx,
        render_cost_us,
      );
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
      var ptr3 = r0;
      var len3 = r1;
      if (r3) {
        ptr3 = 0;
        len3 = 0;
        throw takeObject(r2);
      }
      deferred4_0 = ptr3;
      deferred4_1 = len3;
      return getStringFromWasm0(ptr3, len3);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export5(deferred4_0, deferred4_1, 1);
    }
  }
  /**
   * Return current text shaping configuration.
   *
   * Shape: `{ enabled, engine, fallback }`
   * @returns {any}
   */
  textShapingState() {
    const ret = wasm.frankentermweb_textShapingState(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Return visible viewport text lines over unified history
   * (`scrollback + visible grid`).
   * @returns {Array<any>}
   */
  viewportLines() {
    const ret = wasm.frankentermweb_viewportLines(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
   * Return a deterministic viewport snapshot over unified history
   * (`scrollback + visible grid`).
   *
   * Shape:
   * `{ totalLines, scrollbackLines, gridRows, viewportStart, viewportEnd,
   *    renderStart, renderEnd, scrollOffsetFromBottom, maxScrollOffset,
   *    atBottom, followOutput, animating, subLineOffset }`
   * @returns {any}
   */
  viewportState() {
    const ret = wasm.frankentermweb_viewportState(this.__wbg_ptr);
    return takeObject(ret);
  }
}
if (Symbol.dispose) FrankenTermWeb.prototype[Symbol.dispose] = FrankenTermWeb.prototype.free;
function __wbg_get_imports() {
  const import0 = {
    __proto__: null,
    __wbg_Window_5bb26bc95d054384: (arg0) => {
      const ret = getObject(arg0).Window;
      return addHeapObject(ret);
    },
    __wbg_WorkerGlobalScope_866db36eb93893fe: (arg0) => {
      const ret = getObject(arg0).WorkerGlobalScope;
      return addHeapObject(ret);
    },
    __wbg___wbindgen_boolean_get_7a12af2b3f899c5a: (arg0) => {
      const v = getObject(arg0);
      const ret = typeof v === "boolean" ? v : undefined;
      return isLikeNone(ret) ? 0xffffff : ret ? 1 : 0;
    },
    __wbg___wbindgen_debug_string_0e68cf47c9cbd9b0: (arg0, arg1) => {
      const ret = debugString(getObject(arg1));
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_is_function_fcda5e3902d732fe: (arg0) => {
      const ret = typeof getObject(arg0) === "function";
      return ret;
    },
    __wbg___wbindgen_is_null_5160b3e381865372: (arg0) => {
      const ret = getObject(arg0) === null;
      return ret;
    },
    __wbg___wbindgen_is_object_edb6b15aa3afe12e: (arg0) => {
      const val = getObject(arg0);
      const ret = typeof val === "object" && val !== null;
      return ret;
    },
    __wbg___wbindgen_is_undefined_8c687d0b90d5b524: (arg0) => {
      const ret = getObject(arg0) === undefined;
      return ret;
    },
    __wbg___wbindgen_number_get_1dc732b810cb937c: (arg0, arg1) => {
      const obj = getObject(arg1);
      const ret = typeof obj === "number" ? obj : undefined;
      getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    },
    __wbg___wbindgen_string_get_92ab86bb19cbc12f: (arg0, arg1) => {
      const obj = getObject(arg1);
      const ret = typeof obj === "string" ? obj : undefined;
      var ptr1 = isLikeNone(ret)
        ? 0
        : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_throw_5d9e815e6fdf150f: (arg0, arg1) => {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbg__wbg_cb_unref_997e73d32238e655: (arg0) => {
      getObject(arg0)._wbg_cb_unref();
    },
    __wbg_beginRenderPass_b6be55dca13d3752: function () {
      return handleError((arg0, arg1) => {
        const ret = getObject(arg0).beginRenderPass(getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_buffer_4a989bded7035f57: (arg0) => {
      const ret = getObject(arg0).buffer;
      return addHeapObject(ret);
    },
    __wbg_call_6bcf8d3e20937e46: function () {
      return handleError((arg0, arg1, arg2) => {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_clearRect_60e914c5e35403c7: (arg0, arg1, arg2, arg3, arg4) => {
      getObject(arg0).clearRect(arg1, arg2, arg3, arg4);
    },
    __wbg_configure_3800e43cc1d4df6c: function () {
      return handleError((arg0, arg1) => {
        getObject(arg0).configure(getObject(arg1));
      }, arguments);
    },
    __wbg_createBindGroupLayout_38abd4e4c5dded7c: function () {
      return handleError((arg0, arg1) => {
        const ret = getObject(arg0).createBindGroupLayout(getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_createBindGroup_dd602247ba7de53f: (arg0, arg1) => {
      const ret = getObject(arg0).createBindGroup(getObject(arg1));
      return addHeapObject(ret);
    },
    __wbg_createBuffer_3fce72a987f07f6a: function () {
      return handleError((arg0, arg1) => {
        const ret = getObject(arg0).createBuffer(getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_createCommandEncoder_9b0d0f644b01b53d: (arg0, arg1) => {
      const ret = getObject(arg0).createCommandEncoder(getObject(arg1));
      return addHeapObject(ret);
    },
    __wbg_createElement_b9024dc5ba95ac27: function () {
      return handleError((arg0, arg1, arg2) => {
        const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_createPipelineLayout_10a02d78a5e801aa: (arg0, arg1) => {
      const ret = getObject(arg0).createPipelineLayout(getObject(arg1));
      return addHeapObject(ret);
    },
    __wbg_createRenderPipeline_f33944b9347badf7: function () {
      return handleError((arg0, arg1) => {
        const ret = getObject(arg0).createRenderPipeline(getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_createSampler_dfafeaada8a50f77: (arg0, arg1) => {
      const ret = getObject(arg0).createSampler(getObject(arg1));
      return addHeapObject(ret);
    },
    __wbg_createShaderModule_c951549f9d218b6a: (arg0, arg1) => {
      const ret = getObject(arg0).createShaderModule(getObject(arg1));
      return addHeapObject(ret);
    },
    __wbg_createTexture_7de0f1ac17578a0c: function () {
      return handleError((arg0, arg1) => {
        const ret = getObject(arg0).createTexture(getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_createView_ad451ea74ed4172f: function () {
      return handleError((arg0, arg1) => {
        const ret = getObject(arg0).createView(getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_data_efdd49457735dfbd: (arg0, arg1) => {
      const ret = getObject(arg1).data;
      const ptr1 = passArray8ToWasm0(ret, wasm.__wbindgen_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg_document_c7f486c52d63d24e: (arg0) => {
      const ret = getObject(arg0).document;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    },
    __wbg_draw_58cc6aabf299781c: (arg0, arg1, arg2, arg3, arg4) => {
      getObject(arg0).draw(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    },
    __wbg_end_39838302f918fcd7: (arg0) => {
      getObject(arg0).end();
    },
    __wbg_fillRect_ff9957352a08db2c: (arg0, arg1, arg2, arg3, arg4) => {
      getObject(arg0).fillRect(arg1, arg2, arg3, arg4);
    },
    __wbg_fillText_9b463cd65b9c1016: function () {
      return handleError((arg0, arg1, arg2, arg3, arg4) => {
        getObject(arg0).fillText(getStringFromWasm0(arg1, arg2), arg3, arg4);
      }, arguments);
    },
    __wbg_finish_1f441b2d9fcf60d0: (arg0, arg1) => {
      const ret = getObject(arg0).finish(getObject(arg1));
      return addHeapObject(ret);
    },
    __wbg_finish_d4f7f2d108f44fc0: (arg0) => {
      const ret = getObject(arg0).finish();
      return addHeapObject(ret);
    },
    __wbg_from_a39669ce566077da: (arg0) => {
      const ret = Array.from(getObject(arg0));
      return addHeapObject(ret);
    },
    __wbg_getContext_5ff6bd600503b094: function () {
      return handleError((arg0, arg1, arg2) => {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
      }, arguments);
    },
    __wbg_getContext_e0c05ffee530bdcf: function () {
      return handleError((arg0, arg1, arg2) => {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
      }, arguments);
    },
    __wbg_getCurrentTexture_66ae9639eac28f8b: function () {
      return handleError((arg0) => {
        const ret = getObject(arg0).getCurrentTexture();
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_getImageData_84189b35c8573758: function () {
      return handleError((arg0, arg1, arg2, arg3, arg4) => {
        const ret = getObject(arg0).getImageData(arg1, arg2, arg3, arg4);
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_getPreferredCanvasFormat_2a0a2628959bb15a: (arg0) => {
      const ret = getObject(arg0).getPreferredCanvasFormat();
      return (__wbindgen_enum_GpuTextureFormat.indexOf(ret) + 1 || 96) - 1;
    },
    __wbg_get_95e4d462165c92ae: (arg0, arg1) => {
      const ret = getObject(arg0)[arg1 >>> 0];
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    },
    __wbg_get_989d0a1309644f2b: function () {
      return handleError((arg0, arg1) => {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_get_unchecked_363572bdd397d473: (arg0, arg1) => {
      const ret = getObject(arg0)[arg1 >>> 0];
      return addHeapObject(ret);
    },
    __wbg_gpu_0d39e2c1a52c373e: (arg0) => {
      const ret = getObject(arg0).gpu;
      return addHeapObject(ret);
    },
    __wbg_height_c15ee46a1345e9af: (arg0) => {
      const ret = getObject(arg0).height;
      return ret;
    },
    __wbg_instanceof_CanvasRenderingContext2d_bde5245b14027f3f: (arg0) => {
      let result;
      try {
        result = getObject(arg0) instanceof CanvasRenderingContext2D;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_instanceof_GpuAdapter_b2c1300e425af95c: (arg0) => {
      let result;
      try {
        result = getObject(arg0) instanceof GPUAdapter;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_instanceof_GpuCanvasContext_c9b75b4b7dc7555e: (arg0) => {
      let result;
      try {
        result = getObject(arg0) instanceof GPUCanvasContext;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_instanceof_HtmlCanvasElement_4d7e131643d814c1: (arg0) => {
      let result;
      try {
        result = getObject(arg0) instanceof HTMLCanvasElement;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_instanceof_Window_a3b8566f0a9c5d1a: (arg0) => {
      let result;
      try {
        result = getObject(arg0) instanceof Window;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_isArray_5674713bb7b79043: (arg0) => {
      const ret = Array.isArray(getObject(arg0));
      return ret;
    },
    __wbg_label_dfb771c49b8a7920: (arg0, arg1) => {
      const ret = getObject(arg1).label;
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg_length_2ea75db9a3294a06: (arg0) => {
      const ret = getObject(arg0).length;
      return ret;
    },
    __wbg_length_4e1adc0d42e23620: (arg0) => {
      const ret = getObject(arg0).length;
      return ret;
    },
    __wbg_mapAsync_7767a9f33865861e: (arg0, arg1, arg2, arg3) => {
      const ret = getObject(arg0).mapAsync(arg1 >>> 0, arg2, arg3);
      return addHeapObject(ret);
    },
    __wbg_navigator_d217ca64c4bbff48: (arg0) => {
      const ret = getObject(arg0).navigator;
      return addHeapObject(ret);
    },
    __wbg_navigator_d25c0f071226f233: (arg0) => {
      const ret = getObject(arg0).navigator;
      return addHeapObject(ret);
    },
    __wbg_new_bebc3f4757acf305: () => {
      const ret = new Object();
      return addHeapObject(ret);
    },
    __wbg_new_ffa92086ea89f79c: () => {
      const ret = [];
      return addHeapObject(ret);
    },
    __wbg_new_from_slice_4ee02165f9de919e: (arg0, arg1) => {
      const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
      return addHeapObject(ret);
    },
    __wbg_new_typed_6f8b0d724fe26c07: (arg0, arg1) => {
      try {
        var state0 = { a: arg0, b: arg1 };
        var cb0 = (arg0, arg1) => {
          const a = state0.a;
          state0.a = 0;
          try {
            return __wasm_bindgen_func_elem_3007(a, state0.b, arg0, arg1);
          } finally {
            state0.a = a;
          }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
      } finally {
        state0.a = 0;
      }
    },
    __wbg_new_with_length_6a9fc3631737ef8c: (arg0) => {
      const ret = new Array(arg0 >>> 0);
      return addHeapObject(ret);
    },
    __wbg_onSubmittedWorkDone_a33e32762de21b3d: (arg0) => {
      const ret = getObject(arg0).onSubmittedWorkDone();
      return addHeapObject(ret);
    },
    __wbg_parse_6937a9050adfb0e1: function () {
      return handleError((arg0, arg1) => {
        const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_prototypesetcall_1629b854cfbe3b87: (arg0, arg1, arg2) => {
      Uint32Array.prototype.set.call(getArrayU32FromWasm0(arg0, arg1), getObject(arg2));
    },
    __wbg_push_bfdf956ba476f65b: (arg0, arg1) => {
      const ret = getObject(arg0).push(getObject(arg1));
      return ret;
    },
    __wbg_querySelectorAll_fdbf93e11103921d: function () {
      return handleError((arg0, arg1, arg2) => {
        const ret = getObject(arg0).querySelectorAll(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_queueMicrotask_85c90f6987555d65: (arg0) => {
      const ret = getObject(arg0).queueMicrotask;
      return addHeapObject(ret);
    },
    __wbg_queueMicrotask_f6a1fa10b81d1fc0: (arg0) => {
      queueMicrotask(getObject(arg0));
    },
    __wbg_queue_451a2aa83c786578: (arg0) => {
      const ret = getObject(arg0).queue;
      return addHeapObject(ret);
    },
    __wbg_requestAdapter_3cddf363b0bc9baf: (arg0, arg1) => {
      const ret = getObject(arg0).requestAdapter(getObject(arg1));
      return addHeapObject(ret);
    },
    __wbg_requestDevice_7dd355306bacbcd8: (arg0, arg1) => {
      const ret = getObject(arg0).requestDevice(getObject(arg1));
      return addHeapObject(ret);
    },
    __wbg_resolve_35ec7e0c6af4c82c: (arg0) => {
      const ret = Promise.resolve(getObject(arg0));
      return addHeapObject(ret);
    },
    __wbg_setBindGroup_24fcfe125e006dd4: function () {
      return handleError((arg0, arg1, arg2, arg3, arg4, arg5, arg6) => {
        getObject(arg0).setBindGroup(
          arg1 >>> 0,
          getObject(arg2),
          getArrayU32FromWasm0(arg3, arg4),
          arg5,
          arg6 >>> 0,
        );
      }, arguments);
    },
    __wbg_setBindGroup_3fecca142efa3bcf: (arg0, arg1, arg2) => {
      getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2));
    },
    __wbg_setPipeline_fb3b65583e919c05: (arg0, arg1) => {
      getObject(arg0).setPipeline(getObject(arg1));
    },
    __wbg_set_13d25b81ab403f5e: (arg0, arg1, arg2) => {
      getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    },
    __wbg_set_a377297433dfea63: function () {
      return handleError((arg0, arg1, arg2) => {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
      }, arguments);
    },
    __wbg_set_a_c6ed845ffb46afcc: (arg0, arg1) => {
      getObject(arg0).a = arg1;
    },
    __wbg_set_access_9d39f60326d67278: (arg0, arg1) => {
      getObject(arg0).access = __wbindgen_enum_GpuStorageTextureAccess[arg1];
    },
    __wbg_set_address_mode_u_8c8aaf2ccebb3e8d: (arg0, arg1) => {
      getObject(arg0).addressModeU = __wbindgen_enum_GpuAddressMode[arg1];
    },
    __wbg_set_address_mode_v_252818714ab5937f: (arg0, arg1) => {
      getObject(arg0).addressModeV = __wbindgen_enum_GpuAddressMode[arg1];
    },
    __wbg_set_address_mode_w_d617929f92a5b8cc: (arg0, arg1) => {
      getObject(arg0).addressModeW = __wbindgen_enum_GpuAddressMode[arg1];
    },
    __wbg_set_alpha_a3317d40d97c514e: (arg0, arg1) => {
      getObject(arg0).alpha = getObject(arg1);
    },
    __wbg_set_alpha_mode_1ae7e0aa38a8eba8: (arg0, arg1) => {
      getObject(arg0).alphaMode = __wbindgen_enum_GpuCanvasAlphaMode[arg1];
    },
    __wbg_set_alpha_to_coverage_enabled_0c11d91caea2b92d: (arg0, arg1) => {
      getObject(arg0).alphaToCoverageEnabled = arg1 !== 0;
    },
    __wbg_set_array_layer_count_83a40d42f8858bba: (arg0, arg1) => {
      getObject(arg0).arrayLayerCount = arg1 >>> 0;
    },
    __wbg_set_array_stride_34be696a5e66eb16: (arg0, arg1) => {
      getObject(arg0).arrayStride = arg1;
    },
    __wbg_set_aspect_9d30d9ca40403001: (arg0, arg1) => {
      getObject(arg0).aspect = __wbindgen_enum_GpuTextureAspect[arg1];
    },
    __wbg_set_aspect_f231ddb55e5c30eb: (arg0, arg1) => {
      getObject(arg0).aspect = __wbindgen_enum_GpuTextureAspect[arg1];
    },
    __wbg_set_attributes_02005a0f12df5908: (arg0, arg1) => {
      getObject(arg0).attributes = getObject(arg1);
    },
    __wbg_set_b_f55b6a25fa56cccd: (arg0, arg1) => {
      getObject(arg0).b = arg1;
    },
    __wbg_set_base_array_layer_f8f8eb2d7bd5eb65: (arg0, arg1) => {
      getObject(arg0).baseArrayLayer = arg1 >>> 0;
    },
    __wbg_set_base_mip_level_41735f9b982a26b8: (arg0, arg1) => {
      getObject(arg0).baseMipLevel = arg1 >>> 0;
    },
    __wbg_set_beginning_of_pass_write_index_ff16e69caf566bee: (arg0, arg1) => {
      getObject(arg0).beginningOfPassWriteIndex = arg1 >>> 0;
    },
    __wbg_set_bind_group_layouts_ddc70fed7170a2ee: (arg0, arg1) => {
      getObject(arg0).bindGroupLayouts = getObject(arg1);
    },
    __wbg_set_binding_53105cd45cae6a03: (arg0, arg1) => {
      getObject(arg0).binding = arg1 >>> 0;
    },
    __wbg_set_binding_d82fdc5364e5b0c5: (arg0, arg1) => {
      getObject(arg0).binding = arg1 >>> 0;
    },
    __wbg_set_blend_00219e805977440c: (arg0, arg1) => {
      getObject(arg0).blend = getObject(arg1);
    },
    __wbg_set_buffer_0c946e9b46823a5c: (arg0, arg1) => {
      getObject(arg0).buffer = getObject(arg1);
    },
    __wbg_set_buffer_21a336fe62828e11: (arg0, arg1) => {
      getObject(arg0).buffer = getObject(arg1);
    },
    __wbg_set_buffers_070770ce2c0d5522: (arg0, arg1) => {
      getObject(arg0).buffers = getObject(arg1);
    },
    __wbg_set_bytes_per_row_8e39002b1f627e4d: (arg0, arg1) => {
      getObject(arg0).bytesPerRow = arg1 >>> 0;
    },
    __wbg_set_clear_value_4ed990a8b197a59a: (arg0, arg1) => {
      getObject(arg0).clearValue = getObject(arg1);
    },
    __wbg_set_code_7a3890c4ffd4f7d4: (arg0, arg1, arg2) => {
      getObject(arg0).code = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_color_85a6e64ea881593f: (arg0, arg1) => {
      getObject(arg0).color = getObject(arg1);
    },
    __wbg_set_color_attachments_88b752139b2e1a01: (arg0, arg1) => {
      getObject(arg0).colorAttachments = getObject(arg1);
    },
    __wbg_set_compare_494fcab2dc5d7792: (arg0, arg1) => {
      getObject(arg0).compare = __wbindgen_enum_GpuCompareFunction[arg1];
    },
    __wbg_set_compare_71e8ea844225b7cb: (arg0, arg1) => {
      getObject(arg0).compare = __wbindgen_enum_GpuCompareFunction[arg1];
    },
    __wbg_set_count_036a202e127d1828: (arg0, arg1) => {
      getObject(arg0).count = arg1 >>> 0;
    },
    __wbg_set_cull_mode_8c42221bd938897d: (arg0, arg1) => {
      getObject(arg0).cullMode = __wbindgen_enum_GpuCullMode[arg1];
    },
    __wbg_set_depth_bias_8de79219aa9d3e44: (arg0, arg1) => {
      getObject(arg0).depthBias = arg1;
    },
    __wbg_set_depth_bias_clamp_930cad73d46884cf: (arg0, arg1) => {
      getObject(arg0).depthBiasClamp = arg1;
    },
    __wbg_set_depth_bias_slope_scale_85d4c3f48c50408b: (arg0, arg1) => {
      getObject(arg0).depthBiasSlopeScale = arg1;
    },
    __wbg_set_depth_clear_value_ef40fa181859a36f: (arg0, arg1) => {
      getObject(arg0).depthClearValue = arg1;
    },
    __wbg_set_depth_compare_1273836af777aaa4: (arg0, arg1) => {
      getObject(arg0).depthCompare = __wbindgen_enum_GpuCompareFunction[arg1];
    },
    __wbg_set_depth_fail_op_424b14249d8983bf: (arg0, arg1) => {
      getObject(arg0).depthFailOp = __wbindgen_enum_GpuStencilOperation[arg1];
    },
    __wbg_set_depth_load_op_57a7381c934d435e: (arg0, arg1) => {
      getObject(arg0).depthLoadOp = __wbindgen_enum_GpuLoadOp[arg1];
    },
    __wbg_set_depth_or_array_layers_3601a844f36fa25f: (arg0, arg1) => {
      getObject(arg0).depthOrArrayLayers = arg1 >>> 0;
    },
    __wbg_set_depth_read_only_44e6668e5d98f75f: (arg0, arg1) => {
      getObject(arg0).depthReadOnly = arg1 !== 0;
    },
    __wbg_set_depth_stencil_5abb374ddd7f3268: (arg0, arg1) => {
      getObject(arg0).depthStencil = getObject(arg1);
    },
    __wbg_set_depth_stencil_attachment_eb9d08fc6e7a8fda: (arg0, arg1) => {
      getObject(arg0).depthStencilAttachment = getObject(arg1);
    },
    __wbg_set_depth_store_op_124f84da3afff2bd: (arg0, arg1) => {
      getObject(arg0).depthStoreOp = __wbindgen_enum_GpuStoreOp[arg1];
    },
    __wbg_set_depth_write_enabled_93d4e872c40ad885: (arg0, arg1) => {
      getObject(arg0).depthWriteEnabled = arg1 !== 0;
    },
    __wbg_set_device_7a51a7721914c23c: (arg0, arg1) => {
      getObject(arg0).device = getObject(arg1);
    },
    __wbg_set_dimension_9cfe90d02f664a7a: (arg0, arg1) => {
      getObject(arg0).dimension = __wbindgen_enum_GpuTextureDimension[arg1];
    },
    __wbg_set_dimension_b61b3c48adf487c1: (arg0, arg1) => {
      getObject(arg0).dimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
    },
    __wbg_set_dst_factor_6cbfc3a6898cc9ce: (arg0, arg1) => {
      getObject(arg0).dstFactor = __wbindgen_enum_GpuBlendFactor[arg1];
    },
    __wbg_set_end_of_pass_write_index_41d72471cce1e061: (arg0, arg1) => {
      getObject(arg0).endOfPassWriteIndex = arg1 >>> 0;
    },
    __wbg_set_entries_0d3ea75764a89b83: (arg0, arg1) => {
      getObject(arg0).entries = getObject(arg1);
    },
    __wbg_set_entries_922ec6089646247e: (arg0, arg1) => {
      getObject(arg0).entries = getObject(arg1);
    },
    __wbg_set_entry_point_087ca8094ce666fd: (arg0, arg1, arg2) => {
      getObject(arg0).entryPoint = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_entry_point_d7efddda482bc7fe: (arg0, arg1, arg2) => {
      getObject(arg0).entryPoint = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_external_texture_41cadb0b9faf1919: (arg0, arg1) => {
      getObject(arg0).externalTexture = getObject(arg1);
    },
    __wbg_set_fail_op_9865183abff904e0: (arg0, arg1) => {
      getObject(arg0).failOp = __wbindgen_enum_GpuStencilOperation[arg1];
    },
    __wbg_set_fillStyle_59940a18480ccdf7: (arg0, arg1, arg2) => {
      getObject(arg0).fillStyle = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_font_50854c5bdd1ca607: (arg0, arg1, arg2) => {
      getObject(arg0).font = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_format_09f304cdbee40626: (arg0, arg1) => {
      getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
    },
    __wbg_set_format_90502561f5c3fe92: (arg0, arg1) => {
      getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
    },
    __wbg_set_format_98f7ca48143feacb: (arg0, arg1) => {
      getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
    },
    __wbg_set_format_b111ffed7e227fef: (arg0, arg1) => {
      getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
    },
    __wbg_set_format_b3f26219150f6fcf: (arg0, arg1) => {
      getObject(arg0).format = __wbindgen_enum_GpuVertexFormat[arg1];
    },
    __wbg_set_format_dbb02ef2a1b11c73: (arg0, arg1) => {
      getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
    },
    __wbg_set_format_fd82439cf1e1f024: (arg0, arg1) => {
      getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
    },
    __wbg_set_fragment_4026e84121693413: (arg0, arg1) => {
      getObject(arg0).fragment = getObject(arg1);
    },
    __wbg_set_front_face_abcfb70c2001a63b: (arg0, arg1) => {
      getObject(arg0).frontFace = __wbindgen_enum_GpuFrontFace[arg1];
    },
    __wbg_set_g_3e49035507785f14: (arg0, arg1) => {
      getObject(arg0).g = arg1;
    },
    __wbg_set_has_dynamic_offset_ebc87f184bf9b1b6: (arg0, arg1) => {
      getObject(arg0).hasDynamicOffset = arg1 !== 0;
    },
    __wbg_set_height_1202ad0eab43cbe0: (arg0, arg1) => {
      getObject(arg0).height = arg1 >>> 0;
    },
    __wbg_set_height_5dc3bf5fd05f449d: (arg0, arg1) => {
      getObject(arg0).height = arg1 >>> 0;
    },
    __wbg_set_height_698fb3b255bc1348: (arg0, arg1) => {
      getObject(arg0).height = arg1 >>> 0;
    },
    __wbg_set_imageSmoothingEnabled_0c6c182cfcdfe8d2: (arg0, arg1) => {
      getObject(arg0).imageSmoothingEnabled = arg1 !== 0;
    },
    __wbg_set_label_0ca1d80bd2825a5c: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_label_15aeeb29a6954be8: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_label_2f91d5326490d1cc: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_label_355fa56959229d47: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_label_565007795fa1b28b: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_label_6b0d6041cd54c099: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_label_76862276b026aadb: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_label_776849dd514350e6: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_label_7d273105ca29a945: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_label_889010e958e191c9: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_label_b80919003c66c761: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_label_cbbe51e986da3989: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_label_ccc4850f4197dc22: (arg0, arg1, arg2) => {
      getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_layout_464ae8395c01fe6e: (arg0, arg1) => {
      getObject(arg0).layout = getObject(arg1);
    },
    __wbg_set_layout_b990b908a7810b31: (arg0, arg1) => {
      getObject(arg0).layout = getObject(arg1);
    },
    __wbg_set_load_op_5d3a8abceb4a5269: (arg0, arg1) => {
      getObject(arg0).loadOp = __wbindgen_enum_GpuLoadOp[arg1];
    },
    __wbg_set_lod_max_clamp_bf825cfbdd106655: (arg0, arg1) => {
      getObject(arg0).lodMaxClamp = arg1;
    },
    __wbg_set_lod_min_clamp_35ccf45d8ee31c7e: (arg0, arg1) => {
      getObject(arg0).lodMinClamp = arg1;
    },
    __wbg_set_mag_filter_8f8d84435d8db92a: (arg0, arg1) => {
      getObject(arg0).magFilter = __wbindgen_enum_GpuFilterMode[arg1];
    },
    __wbg_set_mapped_at_creation_ff06f7ed93a315dd: (arg0, arg1) => {
      getObject(arg0).mappedAtCreation = arg1 !== 0;
    },
    __wbg_set_mask_ad9d29606115a472: (arg0, arg1) => {
      getObject(arg0).mask = arg1 >>> 0;
    },
    __wbg_set_max_anisotropy_c82fc429f1b1e064: (arg0, arg1) => {
      getObject(arg0).maxAnisotropy = arg1;
    },
    __wbg_set_min_binding_size_746ae443396eb1f4: (arg0, arg1) => {
      getObject(arg0).minBindingSize = arg1;
    },
    __wbg_set_min_filter_fb0add0b126873ab: (arg0, arg1) => {
      getObject(arg0).minFilter = __wbindgen_enum_GpuFilterMode[arg1];
    },
    __wbg_set_mip_level_count_1d3d8f433adfb7ae: (arg0, arg1) => {
      getObject(arg0).mipLevelCount = arg1 >>> 0;
    },
    __wbg_set_mip_level_count_e13846330ea5c4a2: (arg0, arg1) => {
      getObject(arg0).mipLevelCount = arg1 >>> 0;
    },
    __wbg_set_mip_level_f4e04afe7e030b52: (arg0, arg1) => {
      getObject(arg0).mipLevel = arg1 >>> 0;
    },
    __wbg_set_mipmap_filter_202e81e75b49e109: (arg0, arg1) => {
      getObject(arg0).mipmapFilter = __wbindgen_enum_GpuMipmapFilterMode[arg1];
    },
    __wbg_set_module_6d0431faccebdcc4: (arg0, arg1) => {
      getObject(arg0).module = getObject(arg1);
    },
    __wbg_set_module_701adba2958bd873: (arg0, arg1) => {
      getObject(arg0).module = getObject(arg1);
    },
    __wbg_set_multisample_e577402263e48ad4: (arg0, arg1) => {
      getObject(arg0).multisample = getObject(arg1);
    },
    __wbg_set_multisampled_2180d2b5d246ae13: (arg0, arg1) => {
      getObject(arg0).multisampled = arg1 !== 0;
    },
    __wbg_set_offset_2d6ab375385cd2ae: (arg0, arg1) => {
      getObject(arg0).offset = arg1;
    },
    __wbg_set_offset_3fadbb3d3dadd4ef: (arg0, arg1) => {
      getObject(arg0).offset = arg1;
    },
    __wbg_set_offset_fa633343238c309f: (arg0, arg1) => {
      getObject(arg0).offset = arg1;
    },
    __wbg_set_operation_3a748fcc4d122201: (arg0, arg1) => {
      getObject(arg0).operation = __wbindgen_enum_GpuBlendOperation[arg1];
    },
    __wbg_set_origin_5531aa268ce97d9d: (arg0, arg1) => {
      getObject(arg0).origin = getObject(arg1);
    },
    __wbg_set_pass_op_e82189d4f2d5c48d: (arg0, arg1) => {
      getObject(arg0).passOp = __wbindgen_enum_GpuStencilOperation[arg1];
    },
    __wbg_set_power_preference_f8956c3fea27c41d: (arg0, arg1) => {
      getObject(arg0).powerPreference = __wbindgen_enum_GpuPowerPreference[arg1];
    },
    __wbg_set_primitive_65a118359b90be29: (arg0, arg1) => {
      getObject(arg0).primitive = getObject(arg1);
    },
    __wbg_set_query_set_17c4bef32f23bd7e: (arg0, arg1) => {
      getObject(arg0).querySet = getObject(arg1);
    },
    __wbg_set_r_399b4e4373534d2d: (arg0, arg1) => {
      getObject(arg0).r = arg1;
    },
    __wbg_set_required_features_83604ede3c9e0352: (arg0, arg1) => {
      getObject(arg0).requiredFeatures = getObject(arg1);
    },
    __wbg_set_resolve_target_1a8386ab8943f477: (arg0, arg1) => {
      getObject(arg0).resolveTarget = getObject(arg1);
    },
    __wbg_set_resource_ec6d0e1222a3141f: (arg0, arg1) => {
      getObject(arg0).resource = getObject(arg1);
    },
    __wbg_set_rows_per_image_e38e907b075d42a7: (arg0, arg1) => {
      getObject(arg0).rowsPerImage = arg1 >>> 0;
    },
    __wbg_set_sample_count_eb36fa5f0a856200: (arg0, arg1) => {
      getObject(arg0).sampleCount = arg1 >>> 0;
    },
    __wbg_set_sample_type_fade9fb214ec1d74: (arg0, arg1) => {
      getObject(arg0).sampleType = __wbindgen_enum_GpuTextureSampleType[arg1];
    },
    __wbg_set_sampler_e11b32a88597fe6a: (arg0, arg1) => {
      getObject(arg0).sampler = getObject(arg1);
    },
    __wbg_set_shader_location_87fe60eb5cf2ef69: (arg0, arg1) => {
      getObject(arg0).shaderLocation = arg1 >>> 0;
    },
    __wbg_set_size_724b776b74138f07: (arg0, arg1) => {
      getObject(arg0).size = arg1;
    },
    __wbg_set_size_a15931d6b21f35f9: (arg0, arg1) => {
      getObject(arg0).size = arg1;
    },
    __wbg_set_size_e76794a3069a90d7: (arg0, arg1) => {
      getObject(arg0).size = getObject(arg1);
    },
    __wbg_set_src_factor_00c2d54742fd17a4: (arg0, arg1) => {
      getObject(arg0).srcFactor = __wbindgen_enum_GpuBlendFactor[arg1];
    },
    __wbg_set_stencil_back_9ee211b35e39be71: (arg0, arg1) => {
      getObject(arg0).stencilBack = getObject(arg1);
    },
    __wbg_set_stencil_clear_value_884e0e38f410ec12: (arg0, arg1) => {
      getObject(arg0).stencilClearValue = arg1 >>> 0;
    },
    __wbg_set_stencil_front_4fc7b9162e3cc71f: (arg0, arg1) => {
      getObject(arg0).stencilFront = getObject(arg1);
    },
    __wbg_set_stencil_load_op_eeb37a3ee387626f: (arg0, arg1) => {
      getObject(arg0).stencilLoadOp = __wbindgen_enum_GpuLoadOp[arg1];
    },
    __wbg_set_stencil_read_mask_52264a1876326ce1: (arg0, arg1) => {
      getObject(arg0).stencilReadMask = arg1 >>> 0;
    },
    __wbg_set_stencil_read_only_192e9b65a6822039: (arg0, arg1) => {
      getObject(arg0).stencilReadOnly = arg1 !== 0;
    },
    __wbg_set_stencil_store_op_c110d1172a277982: (arg0, arg1) => {
      getObject(arg0).stencilStoreOp = __wbindgen_enum_GpuStoreOp[arg1];
    },
    __wbg_set_stencil_write_mask_5e49d555c45a16fa: (arg0, arg1) => {
      getObject(arg0).stencilWriteMask = arg1 >>> 0;
    },
    __wbg_set_step_mode_80a80308a6783be4: (arg0, arg1) => {
      getObject(arg0).stepMode = __wbindgen_enum_GpuVertexStepMode[arg1];
    },
    __wbg_set_storage_texture_dab6c69662cecb15: (arg0, arg1) => {
      getObject(arg0).storageTexture = getObject(arg1);
    },
    __wbg_set_store_op_2bf481ef4a30f927: (arg0, arg1) => {
      getObject(arg0).storeOp = __wbindgen_enum_GpuStoreOp[arg1];
    },
    __wbg_set_strip_index_format_ab81420028504e38: (arg0, arg1) => {
      getObject(arg0).stripIndexFormat = __wbindgen_enum_GpuIndexFormat[arg1];
    },
    __wbg_set_targets_f00488491d26619c: (arg0, arg1) => {
      getObject(arg0).targets = getObject(arg1);
    },
    __wbg_set_textAlign_b3d2e546635621d4: (arg0, arg1, arg2) => {
      getObject(arg0).textAlign = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_textBaseline_41538118f83d0399: (arg0, arg1, arg2) => {
      getObject(arg0).textBaseline = getStringFromWasm0(arg1, arg2);
    },
    __wbg_set_texture_8732ea1b0f00cc28: (arg0, arg1) => {
      getObject(arg0).texture = getObject(arg1);
    },
    __wbg_set_texture_e3dad6e696ee0d00: (arg0, arg1) => {
      getObject(arg0).texture = getObject(arg1);
    },
    __wbg_set_timestamp_writes_0e233b1252b29a60: (arg0, arg1) => {
      getObject(arg0).timestampWrites = getObject(arg1);
    },
    __wbg_set_topology_774e967bf9bd3600: (arg0, arg1) => {
      getObject(arg0).topology = __wbindgen_enum_GpuPrimitiveTopology[arg1];
    },
    __wbg_set_type_3e89072317fa3a02: (arg0, arg1) => {
      getObject(arg0).type = __wbindgen_enum_GpuSamplerBindingType[arg1];
    },
    __wbg_set_type_fc5fb8ab00ac41ab: (arg0, arg1) => {
      getObject(arg0).type = __wbindgen_enum_GpuBufferBindingType[arg1];
    },
    __wbg_set_unclipped_depth_bbe4b97da619705e: (arg0, arg1) => {
      getObject(arg0).unclippedDepth = arg1 !== 0;
    },
    __wbg_set_usage_215da50f99ff465b: (arg0, arg1) => {
      getObject(arg0).usage = arg1 >>> 0;
    },
    __wbg_set_usage_5fcdce4860170c24: (arg0, arg1) => {
      getObject(arg0).usage = arg1 >>> 0;
    },
    __wbg_set_usage_e78977f1ef3c2dc4: (arg0, arg1) => {
      getObject(arg0).usage = arg1 >>> 0;
    },
    __wbg_set_usage_ece80ba45b896722: (arg0, arg1) => {
      getObject(arg0).usage = arg1 >>> 0;
    },
    __wbg_set_vertex_879729b1ef5390a2: (arg0, arg1) => {
      getObject(arg0).vertex = getObject(arg1);
    },
    __wbg_set_view_9850fe7aa8b4eae3: (arg0, arg1) => {
      getObject(arg0).view = getObject(arg1);
    },
    __wbg_set_view_b8a1c6698b913d81: (arg0, arg1) => {
      getObject(arg0).view = getObject(arg1);
    },
    __wbg_set_view_dimension_5c6c0dc0d28476c3: (arg0, arg1) => {
      getObject(arg0).viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
    },
    __wbg_set_view_dimension_67ac13d87840ccb1: (arg0, arg1) => {
      getObject(arg0).viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
    },
    __wbg_set_view_formats_2b4e75efe5453ad6: (arg0, arg1) => {
      getObject(arg0).viewFormats = getObject(arg1);
    },
    __wbg_set_view_formats_6c5369e801fa17b7: (arg0, arg1) => {
      getObject(arg0).viewFormats = getObject(arg1);
    },
    __wbg_set_visibility_22877d2819bea70b: (arg0, arg1) => {
      getObject(arg0).visibility = arg1 >>> 0;
    },
    __wbg_set_width_4c3a2252e0dea033: (arg0, arg1) => {
      getObject(arg0).width = arg1 >>> 0;
    },
    __wbg_set_width_a6d5409d7980ccca: (arg0, arg1) => {
      getObject(arg0).width = arg1 >>> 0;
    },
    __wbg_set_width_f52a20e39808b138: (arg0, arg1) => {
      getObject(arg0).width = arg1 >>> 0;
    },
    __wbg_set_write_mask_dceb6456d5310b39: (arg0, arg1) => {
      getObject(arg0).writeMask = arg1 >>> 0;
    },
    __wbg_set_x_40188fe21190a1a8: (arg0, arg1) => {
      getObject(arg0).x = arg1 >>> 0;
    },
    __wbg_set_y_8caca94aad6cb4e8: (arg0, arg1) => {
      getObject(arg0).y = arg1 >>> 0;
    },
    __wbg_set_z_bb89b8ff0b9f8f74: (arg0, arg1) => {
      getObject(arg0).z = arg1 >>> 0;
    },
    __wbg_static_accessor_GLOBAL_8eb4cd83130a11a0: () => {
      const ret = typeof global === "undefined" ? null : global;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    },
    __wbg_static_accessor_GLOBAL_THIS_1e7044f654e934db: () => {
      const ret = typeof globalThis === "undefined" ? null : globalThis;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    },
    __wbg_static_accessor_SELF_d8b50611246a6d92: () => {
      const ret = typeof self === "undefined" ? null : self;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    },
    __wbg_static_accessor_WINDOW_fd0bc376bf0f8b42: () => {
      const ret = typeof window === "undefined" ? null : window;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    },
    __wbg_submit_19b0e21319bc36d7: (arg0, arg1) => {
      getObject(arg0).submit(getObject(arg1));
    },
    __wbg_then_114b14e3854c2390: (arg0, arg1, arg2) => {
      const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    },
    __wbg_then_7a850dae4493f353: (arg0, arg1, arg2) => {
      const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    },
    __wbg_then_b830475380919203: (arg0, arg1) => {
      const ret = getObject(arg0).then(getObject(arg1));
      return addHeapObject(ret);
    },
    __wbg_width_b5e609025d3f7451: (arg0) => {
      const ret = getObject(arg0).width;
      return ret;
    },
    __wbg_writeBuffer_1fa3becf9f9f970e: function () {
      return handleError((arg0, arg1, arg2, arg3, arg4, arg5) => {
        getObject(arg0).writeBuffer(getObject(arg1), arg2, getObject(arg3), arg4, arg5);
      }, arguments);
    },
    __wbg_writeTexture_16d44079bcc6b839: function () {
      return handleError((arg0, arg1, arg2, arg3, arg4) => {
        getObject(arg0).writeTexture(
          getObject(arg1),
          getObject(arg2),
          getObject(arg3),
          getObject(arg4),
        );
      }, arguments);
    },
    __wbindgen_generic_0000000000000001: (arg0, arg1) => {
      // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 135, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
      const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_3005);
      return addHeapObject(ret);
    },
    __wbindgen_generic_0000000000000002: (arg0, arg1) => {
      // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 93, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
      const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_1604);
      return addHeapObject(ret);
    },
    __wbindgen_generic_0000000000000003: (arg0) => {
      // Cast intrinsic for `F64 -> Externref`.
      const ret = arg0;
      return addHeapObject(ret);
    },
    __wbindgen_generic_0000000000000004: (arg0, arg1) => {
      // Cast intrinsic for `Ref(String) -> Externref`.
      const ret = getStringFromWasm0(arg0, arg1);
      return addHeapObject(ret);
    },
    __wbindgen_object_clone_ref: (arg0) => {
      const ret = getObject(arg0);
      return addHeapObject(ret);
    },
    __wbindgen_object_drop_ref: (arg0) => {
      takeObject(arg0);
    },
  };
  return {
    __proto__: null,
    "./FrankenTerm_bg.js": import0,
  };
}

function __wasm_bindgen_func_elem_1604(arg0, arg1, arg2) {
  wasm.__wasm_bindgen_func_elem_1604(arg0, arg1, addHeapObject(arg2));
}

function __wasm_bindgen_func_elem_3007(arg0, arg1, arg2, arg3) {
  wasm.__wasm_bindgen_func_elem_3007(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

function __wasm_bindgen_func_elem_3005(arg0, arg1, arg2) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.__wasm_bindgen_func_elem_3005(retptr, arg0, arg1, addHeapObject(arg2));
    var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
    var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
    if (r1) {
      throw takeObject(r0);
    }
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

const __wbindgen_enum_GpuAddressMode = ["clamp-to-edge", "repeat", "mirror-repeat"];

const __wbindgen_enum_GpuBlendFactor = [
  "zero",
  "one",
  "src",
  "one-minus-src",
  "src-alpha",
  "one-minus-src-alpha",
  "dst",
  "one-minus-dst",
  "dst-alpha",
  "one-minus-dst-alpha",
  "src-alpha-saturated",
  "constant",
  "one-minus-constant",
  "src1",
  "one-minus-src1",
  "src1-alpha",
  "one-minus-src1-alpha",
];

const __wbindgen_enum_GpuBlendOperation = ["add", "subtract", "reverse-subtract", "min", "max"];

const __wbindgen_enum_GpuBufferBindingType = ["uniform", "storage", "read-only-storage"];

const __wbindgen_enum_GpuCanvasAlphaMode = ["opaque", "premultiplied"];

const __wbindgen_enum_GpuCompareFunction = [
  "never",
  "less",
  "equal",
  "less-equal",
  "greater",
  "not-equal",
  "greater-equal",
  "always",
];

const __wbindgen_enum_GpuCullMode = ["none", "front", "back"];

const __wbindgen_enum_GpuFilterMode = ["nearest", "linear"];

const __wbindgen_enum_GpuFrontFace = ["ccw", "cw"];

const __wbindgen_enum_GpuIndexFormat = ["uint16", "uint32"];

const __wbindgen_enum_GpuLoadOp = ["load", "clear"];

const __wbindgen_enum_GpuMipmapFilterMode = ["nearest", "linear"];

const __wbindgen_enum_GpuPowerPreference = ["low-power", "high-performance"];

const __wbindgen_enum_GpuPrimitiveTopology = [
  "point-list",
  "line-list",
  "line-strip",
  "triangle-list",
  "triangle-strip",
];

const __wbindgen_enum_GpuSamplerBindingType = ["filtering", "non-filtering", "comparison"];

const __wbindgen_enum_GpuStencilOperation = [
  "keep",
  "zero",
  "replace",
  "invert",
  "increment-clamp",
  "decrement-clamp",
  "increment-wrap",
  "decrement-wrap",
];

const __wbindgen_enum_GpuStorageTextureAccess = ["write-only", "read-only", "read-write"];

const __wbindgen_enum_GpuStoreOp = ["store", "discard"];

const __wbindgen_enum_GpuTextureAspect = ["all", "stencil-only", "depth-only"];

const __wbindgen_enum_GpuTextureDimension = ["1d", "2d", "3d"];

const __wbindgen_enum_GpuTextureFormat = [
  "r8unorm",
  "r8snorm",
  "r8uint",
  "r8sint",
  "r16uint",
  "r16sint",
  "r16float",
  "rg8unorm",
  "rg8snorm",
  "rg8uint",
  "rg8sint",
  "r32uint",
  "r32sint",
  "r32float",
  "rg16uint",
  "rg16sint",
  "rg16float",
  "rgba8unorm",
  "rgba8unorm-srgb",
  "rgba8snorm",
  "rgba8uint",
  "rgba8sint",
  "bgra8unorm",
  "bgra8unorm-srgb",
  "rgb9e5ufloat",
  "rgb10a2uint",
  "rgb10a2unorm",
  "rg11b10ufloat",
  "rg32uint",
  "rg32sint",
  "rg32float",
  "rgba16uint",
  "rgba16sint",
  "rgba16float",
  "rgba32uint",
  "rgba32sint",
  "rgba32float",
  "stencil8",
  "depth16unorm",
  "depth24plus",
  "depth24plus-stencil8",
  "depth32float",
  "depth32float-stencil8",
  "bc1-rgba-unorm",
  "bc1-rgba-unorm-srgb",
  "bc2-rgba-unorm",
  "bc2-rgba-unorm-srgb",
  "bc3-rgba-unorm",
  "bc3-rgba-unorm-srgb",
  "bc4-r-unorm",
  "bc4-r-snorm",
  "bc5-rg-unorm",
  "bc5-rg-snorm",
  "bc6h-rgb-ufloat",
  "bc6h-rgb-float",
  "bc7-rgba-unorm",
  "bc7-rgba-unorm-srgb",
  "etc2-rgb8unorm",
  "etc2-rgb8unorm-srgb",
  "etc2-rgb8a1unorm",
  "etc2-rgb8a1unorm-srgb",
  "etc2-rgba8unorm",
  "etc2-rgba8unorm-srgb",
  "eac-r11unorm",
  "eac-r11snorm",
  "eac-rg11unorm",
  "eac-rg11snorm",
  "astc-4x4-unorm",
  "astc-4x4-unorm-srgb",
  "astc-5x4-unorm",
  "astc-5x4-unorm-srgb",
  "astc-5x5-unorm",
  "astc-5x5-unorm-srgb",
  "astc-6x5-unorm",
  "astc-6x5-unorm-srgb",
  "astc-6x6-unorm",
  "astc-6x6-unorm-srgb",
  "astc-8x5-unorm",
  "astc-8x5-unorm-srgb",
  "astc-8x6-unorm",
  "astc-8x6-unorm-srgb",
  "astc-8x8-unorm",
  "astc-8x8-unorm-srgb",
  "astc-10x5-unorm",
  "astc-10x5-unorm-srgb",
  "astc-10x6-unorm",
  "astc-10x6-unorm-srgb",
  "astc-10x8-unorm",
  "astc-10x8-unorm-srgb",
  "astc-10x10-unorm",
  "astc-10x10-unorm-srgb",
  "astc-12x10-unorm",
  "astc-12x10-unorm-srgb",
  "astc-12x12-unorm",
  "astc-12x12-unorm-srgb",
];

const __wbindgen_enum_GpuTextureSampleType = [
  "float",
  "unfilterable-float",
  "depth",
  "sint",
  "uint",
];

const __wbindgen_enum_GpuTextureViewDimension = [
  "1d",
  "2d",
  "2d-array",
  "cube",
  "cube-array",
  "3d",
];

const __wbindgen_enum_GpuVertexFormat = [
  "uint8",
  "uint8x2",
  "uint8x4",
  "sint8",
  "sint8x2",
  "sint8x4",
  "unorm8",
  "unorm8x2",
  "unorm8x4",
  "snorm8",
  "snorm8x2",
  "snorm8x4",
  "uint16",
  "uint16x2",
  "uint16x4",
  "sint16",
  "sint16x2",
  "sint16x4",
  "unorm16",
  "unorm16x2",
  "unorm16x4",
  "snorm16",
  "snorm16x2",
  "snorm16x4",
  "float16",
  "float16x2",
  "float16x4",
  "float32",
  "float32x2",
  "float32x3",
  "float32x4",
  "uint32",
  "uint32x2",
  "uint32x3",
  "uint32x4",
  "sint32",
  "sint32x2",
  "sint32x3",
  "sint32x4",
  "unorm10-10-10-2",
  "unorm8x4-bgra",
];

const __wbindgen_enum_GpuVertexStepMode = ["vertex", "instance"];
const FrankenTermWebFinalization =
  typeof FinalizationRegistry === "undefined"
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry((ptr) => wasm.__wbg_frankentermweb_free(ptr, 1));

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

const CLOSURE_DTORS =
  typeof FinalizationRegistry === "undefined"
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry((state) => wasm.__wbindgen_export4(state.a, state.b));

function debugString(val) {
  // primitive types
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  // Test for built-in
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches && builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == "Object") {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
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
  if (
    cachedDataViewMemory0 === null ||
    cachedDataViewMemory0.buffer.detached === true ||
    (cachedDataViewMemory0.buffer.detached === undefined &&
      cachedDataViewMemory0.buffer !== wasm.memory.buffer)
  ) {
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

function getObject(idx) {
  return heap[idx];
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_export3(addHeapObject(e));
  }
}

const heap = new Array(1024).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
  return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, f) {
  const state = { a: arg0, b: arg1, cnt: 1 };
  const real = (...args) => {
    // First up with a closure we increment the internal reference
    // count. This ensures that the Rust closure environment won't
    // be deallocated while we're invoking it.
    state.cnt++;
    const a = state.a;
    state.a = 0;
    try {
      return f(a, state.b, ...args);
    } finally {
      state.a = a;
      real._wbg_cb_unref();
    }
  };
  real._wbg_cb_unref = () => {
    if (--state.cnt === 0) {
      wasm.__wbindgen_export4(state.a, state.b);
      state.a = 0;
      CLOSURE_DTORS.unregister(state);
    }
  };
  CLOSURE_DTORS.register(real, state, state);
  return real;
}

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;

  const mem = getUint8ArrayMemory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0;
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

let cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = (arg, view) => {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length,
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
  return wasm;
}

async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (!module.ok) {
      throw new Error(
        `failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`,
      );
    }

    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = expectedResponseType(module.type);

        if (validResponse && module.headers.get("Content-Type") !== "application/wasm") {
          console.warn(
            "`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
            e,
          );
        } else {
          throw e;
        }
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
      case "basic":
      case "cors":
      case "default":
        return true;
    }
    return false;
  }
}

function initSync(module) {
  if (wasm !== undefined) return wasm;

  if (module !== undefined) {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
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
      ({ module_or_path } = module_or_path);
    } else {
      console.warn(
        "using deprecated parameters for the initialization function; pass a single object instead",
      );
    }
  }

  if (module_or_path === undefined) {
    module_or_path = new URL("FrankenTerm_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();

  if (
    typeof module_or_path === "string" ||
    (typeof Request === "function" && module_or_path instanceof Request) ||
    (typeof URL === "function" && module_or_path instanceof URL)
  ) {
    module_or_path = fetch(module_or_path);
  }

  const { instance, module } = await __wbg_load(await module_or_path, imports);

  return __wbg_finalize_init(instance, module);
}

export { __wbg_init as default, initSync };
