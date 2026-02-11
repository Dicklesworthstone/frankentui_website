"use client";

/**
 * FrankenTerminal — Embeddable React component wrapping the FrankenTUI
 * WASM terminal (WebGPU renderer + showcase runner).
 *
 * Usage:
 *   <FrankenTerminal height={500} initialScreen={3} />
 *   <FrankenTerminal width="100%" height="60vh" autoFocus />
 *   <FrankenTerminal width={400} height={300} captureKeys={false} showStatus={false} />
 *
 * Created as part of bd-11i.3.
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  FrankenTerminalProps,
  FrankenTerminalHandle,
  FrankenTerminalState,
} from "./franken-terminal.types";
import {
  loadWasmModules,
  loadFont,
  loadTextAssets,
  type FrankenTermWebInstance,
  type ShowcaseRunnerInstance,
} from "@/lib/wasm-loader";

// ---------------------------------------------------------------------------
// Default loading/error/fallback UI
// ---------------------------------------------------------------------------

function DefaultLoading({ status }: { status: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#0a0a0a] text-slate-400 font-mono text-sm gap-3">
      <div className="h-1 w-48 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full animate-pulse w-2/3" />
      </div>
      <span>{status}</span>
    </div>
  );
}

function DefaultError({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#0a0a0a] text-red-400 font-mono text-sm p-8 text-center gap-4">
      <div className="text-lg font-bold">Failed to load terminal</div>
      <div className="text-slate-500 max-w-md">{error.message}</div>
    </div>
  );
}

function DefaultFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#0a0a0a] text-slate-300 font-sans text-center p-8 gap-4">
      <div className="text-xl font-bold text-green-500">FrankenTUI Live Demo</div>
      <div className="text-slate-400">
        Unable to initialize the terminal renderer in this browser.
      </div>
      <div className="text-sm text-slate-500">
        Try Chrome, Edge, Safari, or Firefox on a recent OS version.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FrankenTerminal = forwardRef<FrankenTerminalHandle, FrankenTerminalProps>(
  function FrankenTerminal(props, ref) {
    const {
      width = "100%",
      height = "400px",
      className,
      initialCols,
      initialRows,
      cellWidth = 8,
      cellHeight = 16,
      zoom: initialZoom = 1.0,
      autoFocus = false,
      captureKeys = true,
      showStatus = true,
      loadTextAssets: shouldLoadTextAssets = true,
      onReady,
      onError,
      onResize,
      onFrame,
      loadingComponent,
      errorComponent,
      fallbackComponent,
    } = props;

    // ── State ──────────────────────────────────────────────────────────
    const [state, setState] = useState<FrankenTerminalState>("checking-webgpu");
    const [statusText, setStatusText] = useState("Checking WebGPU...");
    const [error, setError] = useState<Error | null>(null);
    const [dimensions, setDimensions] = useState<{ cols: number; rows: number } | null>(null);

    // ── Refs ───────────────────────────────────────────────────────────
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const termRef = useRef<FrankenTermWebInstance | null>(null);
    const runnerRef = useRef<ShowcaseRunnerInstance | null>(null);
    const rafRef = useRef<number>(0);
    const lastTsRef = useRef(0);
    const totalFramesRef = useRef(0);
    const runningRef = useRef(false);
    const mountedRef = useRef(false);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const userZoomRef = useRef(initialZoom);

    // ── Cleanup function ───────────────────────────────────────────────
    const cleanup = useCallback(() => {
      runningRef.current = false;
      lastTsRef.current = 0;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      try { runnerRef.current?.destroy(); } catch { /* already freed */ }
      try { termRef.current?.destroy(); } catch { /* already freed */ }
      runnerRef.current = null;
      termRef.current = null;
    }, []);

    // ── Imperative handle ──────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      goToScreen(screen: number) {
        const runner = runnerRef.current;
        if (!runner) return;
        const screenIdx = screen - 1;
        if (screenIdx < 10) {
          const key = screenIdx === 9 ? "0" : String(screenIdx + 1);
          runner.pushEncodedInput(JSON.stringify({ kind: "key", phase: "down", key, code: `Digit${key}`, mods: 0, repeat: false }));
        } else {
          for (let i = 0; i < screenIdx; i++) {
            runner.pushEncodedInput(JSON.stringify({ kind: "key", phase: "down", key: "Tab", code: "Tab", mods: 0, repeat: false }));
          }
        }
      },
      sendInput(event) {
        termRef.current?.input(event);
      },
      getGeometry() {
        return dimensions ?? { cols: 80, rows: 24 };
      },
      getCanvas() {
        return canvasRef.current;
      },
      setZoom(zoom: number) {
        userZoomRef.current = zoom;
        termRef.current?.setZoom(zoom);
      },
      forceRender() {
        termRef.current?.render();
      },
      destroy() {
        cleanup();
      },
    }), [dimensions, cleanup]);

    // ── Main initialization effect ─────────────────────────────────────
    useEffect(() => {
      // Strict mode guard: prevent double-init
      if (mountedRef.current) return;
      mountedRef.current = true;

      let cancelled = false;

      async function init() {
        // Note: WebGPU check removed — the WASM renderer has a WebGL/Canvas2D
        // fallback path and works on browsers without WebGPU (e.g. Safari/iOS).

        try {
          // 2. Load font
          setState("loading-font");
          setStatusText("Loading fonts...");
          await loadFont();
          if (cancelled) return;

          // 3. Load WASM modules
          setState("loading-wasm");
          setStatusText("Loading WASM modules...");
          const { FrankenTermWeb, ShowcaseRunner } = await loadWasmModules();
          if (cancelled) return;

          // 4. Initialize terminal
          setState("initializing");
          setStatusText("Initializing WebGPU terminal...");

          const canvas = canvasRef.current;
          const container = containerRef.current;
          if (!canvas || !container) {
            throw new Error("Canvas or container element not found");
          }

          const term = new FrankenTermWeb();
          termRef.current = term;

          const dpr = window.devicePixelRatio || 1.0;
          const initCols = initialCols ?? 80;
          const initRows = initialRows ?? 24;

          await term.init(canvas, {
            cols: initCols,
            rows: initRows,
            cellWidth,
            cellHeight,
            dpr,
            focused: autoFocus,
          });
          if (cancelled) return;

          // 5. Apply initial zoom before fitToContainer
          let userZoom = userZoomRef.current;
          if (userZoom !== 1.0 && typeof term.setZoom === "function") {
            term.setZoom(userZoom);
          }

          // 6. Fit to container
          const geo = term.fitToContainer(
            container.clientWidth,
            container.clientHeight,
            dpr
          );
          let currentCols = geo.cols;
          let currentRows = geo.rows;
          setDimensions({ cols: currentCols, rows: currentRows });

          // 7. Create showcase runner
          const runner = new ShowcaseRunner(currentCols, currentRows);
          runnerRef.current = runner;
          runner.init();

          // 8. Apply initial patches and render first frame
          const initPatches = runner.takeFlatPatches();
          if (initPatches.cells.length > 0) {
            term.applyPatchBatchFlat(initPatches.spans, initPatches.cells);
          }
          term.render();

          // 9. Load text assets in background (non-blocking)
          if (shouldLoadTextAssets) {
            loadTextAssets().then((assets) => {
              if (cancelled || !assets || !runnerRef.current) return;
              try {
                runnerRef.current.setShakespeareText(assets.shakespeare);
                runnerRef.current.setSqliteSource(assets.sqlite);
              } catch (e) {
                console.warn("[FrankenTerminal] Failed to inject text assets", e);
              }
            });
          }

          // 10. Helper: apply zoom with container refit
          function applyZoom() {
            const t = termRef.current;
            const r = runnerRef.current;
            const c = containerRef.current;
            if (!t || !r || !c) return;
            if (typeof t.setZoom === "function") {
              t.setZoom(userZoom);
            }
            const newDpr = window.devicePixelRatio || 1.0;
            const newGeo = t.fitToContainer(c.clientWidth, c.clientHeight, newDpr);
            if (newGeo.cols !== currentCols || newGeo.rows !== currentRows) {
              currentCols = newGeo.cols;
              currentRows = newGeo.rows;
              r.resize(currentCols, currentRows);
              setDimensions({ cols: currentCols, rows: currentRows });
              onResize?.(currentCols, currentRows);
            }
            if (Math.abs(userZoom - 1.0) > 0.01) {
              setStatusText(`${currentCols}\u00d7${currentRows} \u2014 zoom ${Math.round(userZoom * 100)}%`);
            } else {
              setStatusText(`${currentCols}\u00d7${currentRows}`);
            }
          }

          // 11. Start frame loop
          runningRef.current = true;
          setState("running");
          setStatusText(`${currentCols}\u00d7${currentRows}`);
          if (autoFocus) canvasRef.current?.focus();
          onReady?.();

          function frame(timestamp: number) {
            if (!runningRef.current) return;

            const dt = lastTsRef.current === 0 ? 16.0 : timestamp - lastTsRef.current;
            lastTsRef.current = timestamp;

            const r = runnerRef.current;
            const t = termRef.current;
            if (!r || !t) return;

            r.advanceTime(dt);

            const inputs = t.drainEncodedInputs();
            for (let i = 0; i < inputs.length; i++) {
              r.pushEncodedInput(inputs[i]);
            }

            const result = r.step();

            if (result.rendered) {
              const patches = r.takeFlatPatches();
              if (patches.cells.length > 0) {
                t.applyPatchBatchFlat(patches.spans, patches.cells);
              }
              t.render();
              totalFramesRef.current++;
              onFrame?.(result.frame_idx);
            }

            if (result.running) {
              rafRef.current = requestAnimationFrame(frame);
            } else {
              runningRef.current = false;
            }
          }

          rafRef.current = requestAnimationFrame(frame);

          // 12. ResizeObserver for container changes
          const resizeObserver = resizeObserverRef.current = new ResizeObserver(() => {
            const t = termRef.current;
            const r = runnerRef.current;
            const c = containerRef.current;
            if (!t || !r || !c) return;

            const newDpr = window.devicePixelRatio || 1.0;
            const newGeo = t.fitToContainer(c.clientWidth, c.clientHeight, newDpr);
            if (newGeo.cols !== currentCols || newGeo.rows !== currentRows) {
              currentCols = newGeo.cols;
              currentRows = newGeo.rows;
              r.resize(currentCols, currentRows);
              setDimensions({ cols: currentCols, rows: currentRows });
              setStatusText(`${currentCols}\u00d7${currentRows}`);
              onResize?.(currentCols, currentRows);
            }
          });
          resizeObserver.observe(container);

          // 13. Input event listeners
          const abortController = abortControllerRef.current = new AbortController();
          const signal = abortController.signal;

          function safeInput(ev: unknown) {
            try { termRef.current?.input(ev); } catch { /* ignore */ }
          }

          function domKeyToInput(e: KeyboardEvent, phase: string) {
            return {
              kind: "key",
              phase,
              key: typeof e.key === "string" ? e.key : "",
              code: typeof e.code === "string" ? e.code : "",
              mods: (e.shiftKey ? 1 : 0) | (e.altKey ? 2 : 0) | (e.ctrlKey ? 4 : 0) | (e.metaKey ? 8 : 0),
              repeat: e.repeat || false,
            };
          }

          function domMouseToInput(e: MouseEvent, phase: string) {
            const rect = canvas!.getBoundingClientRect();
            const cw = rect.width / currentCols;
            const ch = rect.height / currentRows;
            const x = Math.floor((e.clientX - rect.left) / cw);
            const y = Math.floor((e.clientY - rect.top) / ch);
            return {
              kind: "mouse",
              phase,
              button: e.button,
              x: Math.max(0, Math.min(x, currentCols - 1)),
              y: Math.max(0, Math.min(y, currentRows - 1)),
              mods: (e.shiftKey ? 1 : 0) | (e.altKey ? 2 : 0) | (e.ctrlKey ? 4 : 0) | (e.metaKey ? 8 : 0),
            };
          }

          function domWheelToInput(e: WheelEvent) {
            const rect = canvas!.getBoundingClientRect();
            const cw = rect.width / currentCols;
            const ch = rect.height / currentRows;
            return {
              kind: "wheel",
              x: Math.max(0, Math.min(Math.floor((e.clientX - rect.left) / cw), currentCols - 1)),
              y: Math.max(0, Math.min(Math.floor((e.clientY - rect.top) / ch), currentRows - 1)),
              dx: Math.round(e.deltaX),
              dy: Math.round(e.deltaY),
              mods: (e.shiftKey ? 1 : 0) | (e.altKey ? 2 : 0) | (e.ctrlKey ? 4 : 0) | (e.metaKey ? 8 : 0),
            };
          }

          // Keyboard events
          if (captureKeys) {
            canvas.addEventListener("keydown", (e) => {
              if (e.isComposing || e.key === "Process") return;

              // Zoom: Ctrl/Cmd +/-/0
              const zoomMod = e.ctrlKey || e.metaKey;
              if (zoomMod && (e.key === "+" || e.key === "=")) {
                e.preventDefault();
                userZoom = Math.min(3.0, userZoom * 1.1);
                userZoomRef.current = userZoom;
                applyZoom();
                return;
              }
              if (zoomMod && e.key === "-") {
                e.preventDefault();
                userZoom = Math.max(0.3, userZoom / 1.1);
                userZoomRef.current = userZoom;
                applyZoom();
                return;
              }
              if (zoomMod && e.key === "0") {
                e.preventDefault();
                userZoom = 1.0;
                userZoomRef.current = userZoom;
                applyZoom();
                return;
              }

              e.preventDefault();
              safeInput(domKeyToInput(e, "down"));
            }, { signal, capture: true });

            canvas.addEventListener("keyup", (e) => {
              if (e.isComposing || e.key === "Process") return;
              e.preventDefault();
              safeInput(domKeyToInput(e, "up"));
            }, { signal, capture: true });
          }

          // Mouse events with drag tracking
          let mouseButtonsDown = 0;
          let dragButton = 0;

          canvas.addEventListener("mousedown", (e) => {
            e.preventDefault();
            canvas.focus();
            mouseButtonsDown = e.buttons;
            dragButton = e.button;
            safeInput(domMouseToInput(e, "down"));
          }, { signal });
          canvas.addEventListener("mouseup", (e) => {
            e.preventDefault();
            mouseButtonsDown = e.buttons;
            safeInput(domMouseToInput(e, "up"));
          }, { signal });
          canvas.addEventListener("mousemove", (e) => {
            mouseButtonsDown = e.buttons;
            if (mouseButtonsDown) {
              const ev = domMouseToInput(e, "drag");
              ev.button = dragButton;
              safeInput(ev);
            } else {
              safeInput(domMouseToInput(e, "move"));
            }
          }, { signal });
          canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); }, { signal });

          canvas.addEventListener("wheel", (e) => {
            e.preventDefault();
            safeInput(domWheelToInput(e));
          }, { signal, passive: false });

          // Paste
          canvas.addEventListener("paste", ((e: ClipboardEvent) => {
            const text = e.clipboardData?.getData("text");
            if (text) safeInput({ kind: "paste", data: text });
          }) as EventListener, { signal });

          // Focus/blur
          canvas.addEventListener("focus", () => safeInput({ kind: "focus", focused: true }), { signal });
          canvas.addEventListener("blur", () => safeInput({ kind: "focus", focused: false }), { signal });

          // IME composition
          canvas.addEventListener("compositionstart", () => {
            safeInput({ kind: "composition", phase: "start" });
          }, { signal });
          canvas.addEventListener("compositionupdate", ((e: CompositionEvent) => {
            safeInput({ kind: "composition", phase: "update", data: e.data || "" });
          }) as EventListener, { signal });
          canvas.addEventListener("compositionend", ((e: CompositionEvent) => {
            safeInput({ kind: "composition", phase: "end", data: e.data || "" });
          }) as EventListener, { signal });

          // ── Touch state machine ───────────────────────────────────────
          const TOUCH_IDLE = 0, TOUCH_TRACKING = 1, TOUCH_SCROLLING = 2, TOUCH_PINCHING = 3;
          let touchState = TOUCH_IDLE;
          let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
          let touchLastX = 0, touchLastY = 0;
          let touchScrollAccX = 0, touchScrollAccY = 0;
          let pinchStartDist = 0, pinchStartZoom = 1.0;
          const TAP_MAX_DIST = 10;
          const TAP_MAX_TIME = 300;

          function touchScrollStepsPx() {
            const rect = canvas!.getBoundingClientRect();
            const rawX = currentCols > 0 ? rect.width / currentCols : cellWidth;
            const rawY = currentRows > 0 ? rect.height / currentRows : cellHeight;
            return {
              x: Math.max(4, Math.round(rawX || cellWidth)),
              y: Math.max(4, Math.round(rawY || cellHeight)),
            };
          }

          function touchCellCoords(clientX: number, clientY: number) {
            const rect = canvas!.getBoundingClientRect();
            const cw = rect.width / currentCols;
            const ch = rect.height / currentRows;
            return {
              x: Math.max(0, Math.min(Math.floor((clientX - rect.left) / cw), currentCols - 1)),
              y: Math.max(0, Math.min(Math.floor((clientY - rect.top) / ch), currentRows - 1)),
            };
          }

          function pinchDistance(t0: Touch, t1: Touch) {
            const dx = t1.clientX - t0.clientX;
            const dy = t1.clientY - t0.clientY;
            return Math.sqrt(dx * dx + dy * dy);
          }

          canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            canvas!.focus();
            const touches = e.touches;
            if (touches.length === 1) {
              touchState = TOUCH_TRACKING;
              touchStartX = touchLastX = touches[0].clientX;
              touchStartY = touchLastY = touches[0].clientY;
              touchStartTime = Date.now();
              touchScrollAccX = 0;
              touchScrollAccY = 0;
            } else if (touches.length === 2) {
              touchState = TOUCH_PINCHING;
              pinchStartDist = pinchDistance(touches[0], touches[1]);
              pinchStartZoom = userZoom;
            }
          }, { signal, passive: false });

          canvas.addEventListener("touchmove", (e) => {
            e.preventDefault();
            const touches = e.touches;

            if (touches.length === 2 && touchState !== TOUCH_IDLE) {
              if (touchState !== TOUCH_PINCHING) {
                touchState = TOUCH_PINCHING;
                pinchStartDist = pinchDistance(touches[0], touches[1]);
                pinchStartZoom = userZoom;
                return;
              }
              const dist = pinchDistance(touches[0], touches[1]);
              if (pinchStartDist > 0) {
                const scale = dist / pinchStartDist;
                userZoom = Math.max(0.3, Math.min(3.0, pinchStartZoom * scale));
                userZoomRef.current = userZoom;
                applyZoom();
              }
              return;
            }

            if (touches.length === 1 && (touchState === TOUCH_TRACKING || touchState === TOUCH_SCROLLING)) {
              const cx = touches[0].clientX;
              const cy = touches[0].clientY;
              const dx = cx - touchLastX;
              const dy = cy - touchLastY;
              touchLastX = cx;
              touchLastY = cy;

              if (touchState === TOUCH_TRACKING) {
                const totalDx = cx - touchStartX;
                const totalDy = cy - touchStartY;
                if (Math.abs(totalDx) > TAP_MAX_DIST || Math.abs(totalDy) > TAP_MAX_DIST) {
                  touchState = TOUCH_SCROLLING;
                } else {
                  return;
                }
              }

              touchScrollAccX += dx;
              touchScrollAccY += dy;
              const scrollStep = touchScrollStepsPx();
              const cell = touchCellCoords(cx, cy);
              while (Math.abs(touchScrollAccY) >= scrollStep.y) {
                const sign = touchScrollAccY > 0 ? -1 : 1;
                safeInput({ kind: "wheel", x: cell.x, y: cell.y, dx: 0, dy: sign, mods: 0 });
                touchScrollAccY -= (touchScrollAccY > 0 ? scrollStep.y : -scrollStep.y);
              }
              while (Math.abs(touchScrollAccX) >= scrollStep.x) {
                const sign = touchScrollAccX > 0 ? -1 : 1;
                safeInput({ kind: "wheel", x: cell.x, y: cell.y, dx: sign, dy: 0, mods: 0 });
                touchScrollAccX -= (touchScrollAccX > 0 ? scrollStep.x : -scrollStep.x);
              }
            }
          }, { signal, passive: false });

          canvas.addEventListener("touchend", (e) => {
            e.preventDefault();
            if (touchState === TOUCH_TRACKING && e.changedTouches.length > 0) {
              const elapsed = Date.now() - touchStartTime;
              const t = e.changedTouches[0];
              const dist = Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY);
              if (elapsed < TAP_MAX_TIME && dist < TAP_MAX_DIST) {
                const cell = touchCellCoords(t.clientX, t.clientY);
                safeInput({ kind: "mouse", phase: "down", button: 0, x: cell.x, y: cell.y, mods: 0 });
                safeInput({ kind: "mouse", phase: "up", button: 0, x: cell.x, y: cell.y, mods: 0 });
              }
            }
            if (e.touches.length === 0) {
              touchState = TOUCH_IDLE;
            } else if (e.touches.length === 1 && touchState === TOUCH_PINCHING) {
              touchState = TOUCH_TRACKING;
              touchStartX = touchLastX = e.touches[0].clientX;
              touchStartY = touchLastY = e.touches[0].clientY;
              touchStartTime = Date.now();
              touchScrollAccX = 0;
              touchScrollAccY = 0;
            }
          }, { signal, passive: false });

          canvas.addEventListener("touchcancel", (e) => {
            e.preventDefault();
            touchState = TOUCH_IDLE;
          }, { signal, passive: false });

        } catch (e) {
          if (cancelled) return;
          const err = e instanceof Error ? e : new Error(String(e));
          setState("error");
          setError(err);
          onError?.(err);
        }
      }

      init();

      return () => {
        cancelled = true;
        mountedRef.current = false;
        cleanup();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Mount-only effect — config is read from refs/props at init time

    // ── Render ─────────────────────────────────────────────────────────
    const cssWidth = typeof width === "number" ? `${width}px` : width;
    const cssHeight = typeof height === "number" ? `${height}px` : height;

    let content: ReactNode;

    if (state === "unsupported") {
      content = fallbackComponent ?? <DefaultFallback />;
    } else if (state === "error" && error) {
      content = errorComponent ?? <DefaultError error={error} />;
    } else if (state === "running") {
      content = null; // Canvas is visible
    } else {
      content = loadingComponent ?? <DefaultLoading status={statusText} />;
    }

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: cssWidth,
          height: cssHeight,
          position: "relative",
          overflow: "hidden",
          background: "#0a0a0a",
          overscrollBehavior: "none",
        }}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          style={{
            display: state === "running" ? "block" : "none",
            width: "100%",
            height: "100%",
            imageRendering: "pixelated",
            touchAction: "none",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
          }}
        />
        {content}
        {showStatus && state === "running" && dimensions && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 12,
              color: "#666",
              font: '12px/1 "Pragmasevka NF", monospace',
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {statusText}
          </div>
        )}
      </div>
    );
  }
);

export default FrankenTerminal;
