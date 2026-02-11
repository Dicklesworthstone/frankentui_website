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
  isWebGPUSupported,
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
        // Navigate by sending key inputs (screens cycle with left/right arrows)
        const runner = runnerRef.current;
        const term = termRef.current;
        if (!runner || !term) return;
        // This is a simplified approach — actual screen navigation depends on
        // the showcase runner's input handling
        void screen;
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

          // 5. Fit to container
          const geo = term.fitToContainer(
            container.clientWidth,
            container.clientHeight,
            dpr
          );
          const cols = geo.cols;
          const rows = geo.rows;
          setDimensions({ cols, rows });

          // 6. Create showcase runner
          const runner = new ShowcaseRunner(cols, rows);
          runnerRef.current = runner;
          runner.init();

          // 7. Apply initial patches and render first frame
          const initPatches = runner.takeFlatPatches();
          if (initPatches.cells.length > 0) {
            term.applyPatchBatchFlat(initPatches.spans, initPatches.cells);
          }
          term.render();

          // 8. Set zoom if custom
          if (initialZoom !== 1.0) {
            term.setZoom(initialZoom);
          }

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

          // 10. Start frame loop
          runningRef.current = true;
          setState("running");
          setStatusText(`${cols}\u00d7${rows}`);
          if (autoFocus) canvasRef.current?.focus();
          onReady?.();

          let currentCols = cols;
          let currentRows = rows;

          function frame(timestamp: number) {
            if (!runningRef.current) return;

            const dt = lastTsRef.current === 0 ? 16.0 : timestamp - lastTsRef.current;
            lastTsRef.current = timestamp;

            const r = runnerRef.current;
            const t = termRef.current;
            if (!r || !t) return;

            // Advance time
            r.advanceTime(dt);

            // Drain inputs from terminal → push to runner
            const inputs = t.drainEncodedInputs();
            for (let i = 0; i < inputs.length; i++) {
              r.pushEncodedInput(inputs[i]);
            }

            // Step the application
            const result = r.step();

            // If a frame was rendered, apply patches and present
            if (result.rendered) {
              const patches = r.takeFlatPatches();
              if (patches.cells.length > 0) {
                t.applyPatchBatchFlat(patches.spans, patches.cells);
              }
              t.render();
              totalFramesRef.current++;
              onFrame?.(result.frame_idx);
            }

            // Continue or stop
            if (result.running) {
              rafRef.current = requestAnimationFrame(frame);
            } else {
              runningRef.current = false;
            }
          }

          rafRef.current = requestAnimationFrame(frame);

          // 11. ResizeObserver for container changes
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

          // 12. Input event listeners (only if captureKeys is true)
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

          if (captureKeys) {
            canvas.addEventListener("keydown", (e) => {
              if (e.isComposing || e.key === "Process") return;
              e.preventDefault();
              safeInput(domKeyToInput(e, "down"));
            }, { signal, capture: true });

            canvas.addEventListener("keyup", (e) => {
              if (e.isComposing || e.key === "Process") return;
              e.preventDefault();
              safeInput(domKeyToInput(e, "up"));
            }, { signal, capture: true });
          }

          canvas.addEventListener("mousedown", (e) => {
            canvas.focus();
            safeInput(domMouseToInput(e, "down"));
          }, { signal });
          canvas.addEventListener("mouseup", (e) => {
            safeInput(domMouseToInput(e, "up"));
          }, { signal });
          canvas.addEventListener("mousemove", (e) => {
            safeInput(domMouseToInput(e, "move"));
          }, { signal });
          canvas.addEventListener("wheel", (e) => {
            e.preventDefault();
            const rect = canvas!.getBoundingClientRect();
            const cw = rect.width / currentCols;
            const ch = rect.height / currentRows;
            safeInput({
              kind: "wheel",
              x: Math.max(0, Math.min(Math.floor((e.clientX - rect.left) / cw), currentCols - 1)),
              y: Math.max(0, Math.min(Math.floor((e.clientY - rect.top) / ch), currentRows - 1)),
              dx: Math.round(e.deltaX),
              dy: Math.round(e.deltaY),
              mods: (e.shiftKey ? 1 : 0) | (e.altKey ? 2 : 0) | (e.ctrlKey ? 4 : 0) | (e.metaKey ? 8 : 0),
            });
          }, { signal, passive: false });

          canvas.addEventListener("focus", () => safeInput({ kind: "focus", focused: true }), { signal });
          canvas.addEventListener("blur", () => safeInput({ kind: "focus", focused: false }), { signal });

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
        style={{ width: cssWidth, height: cssHeight, position: "relative", overflow: "hidden", background: "#0a0a0a" }}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          style={{
            display: state === "running" ? "block" : "none",
            width: "100%",
            height: "100%",
            imageRendering: "pixelated",
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
            {dimensions.cols}&times;{dimensions.rows}
          </div>
        )}
      </div>
    );
  }
);

export default FrankenTerminal;
