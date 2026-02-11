"use client";

import { lazy, Suspense, useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Blocks, Play, Copy, Check, GripVertical } from "lucide-react";
import { browserUseCases } from "@/lib/content";
import SectionShell from "@/components/section-shell";
import FrankenEye from "@/components/franken-eye";
import FrankenGlitch from "@/components/franken-glitch";
import { cn } from "@/lib/utils";

const FrankenTerminal = lazy(() => import("@/components/franken-terminal"));

// ── Preset sizes ──────────────────────────────────────────────────────────
const presets = [
  { label: "Compact", desc: "60\u00d720", w: 60 * 8 + 24, h: 20 * 16 + 24 },
  { label: "Standard", desc: "80\u00d724", w: 80 * 8 + 24, h: 24 * 16 + 24 },
  { label: "Wide", desc: "120\u00d730", w: 120 * 8 + 24, h: 30 * 16 + 24 },
  { label: "Full width", desc: "auto", w: 0, h: 500 },
] as const;

// ── Integration code snippet ──────────────────────────────────────────────
const codeSnippet = `import FrankenTerminal from "@/components/franken-terminal";

<FrankenTerminal
  width="100%"
  height={400}
  captureKeys={false}
  showStatus
/>`;

// ── Props reference ───────────────────────────────────────────────────────
const propsRef = [
  { prop: "width", type: "number | string", default: '"100%"', desc: "CSS width of the container" },
  { prop: "height", type: "number | string", default: '"400px"', desc: "CSS height of the container" },
  { prop: "captureKeys", type: "boolean", default: "true", desc: "Capture keyboard events when focused" },
  { prop: "showStatus", type: "boolean", default: "true", desc: "Show cols\u00d7rows overlay" },
  { prop: "loadTextAssets", type: "boolean", default: "true", desc: "Load 14MB text assets (Shakespeare, SQLite)" },
  { prop: "autoFocus", type: "boolean", default: "false", desc: "Focus the canvas on mount" },
  { prop: "zoom", type: "number", default: "1.0", desc: "Initial zoom level" },
  { prop: "onReady", type: "() => void", default: "\u2014", desc: "Fired when WASM loads and first frame renders" },
  { prop: "onResize", type: "(cols, rows) => void", default: "\u2014", desc: "Fired when terminal grid resizes" },
  { prop: "onError", type: "(error) => void", default: "\u2014", desc: "Fired on WASM load failure" },
];

// ── Resize handle hook ────────────────────────────────────────────────────
function useResize(
  containerRef: React.RefObject<HTMLDivElement | null>,
  initial: { w: number; h: number },
) {
  const [size, setSize] = useState(initial);
  const dragging = useRef<"x" | "y" | "xy" | null>(null);
  const start = useRef({ mx: 0, my: 0, w: 0, h: 0 });

  const onPointerDown = useCallback(
    (axis: "x" | "y" | "xy") => (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = axis;
      start.current = { mx: e.clientX, my: e.clientY, w: size.w, h: size.h };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [size],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - start.current.mx;
    const dy = e.clientY - start.current.my;
    const maxW = containerRef.current?.parentElement?.clientWidth ?? 1200;
    setSize((prev) => ({
      w: dragging.current === "y" ? prev.w : Math.max(320, Math.min(start.current.w + dx, maxW)),
      h: dragging.current === "x" ? prev.h : Math.max(200, Math.min(start.current.h + dy, 900)),
    }));
  }, [containerRef]);

  const onPointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  return { size, setSize, onPointerDown, onPointerMove, onPointerUp, isDragging: dragging };
}

// ── Copyable code block ───────────────────────────────────────────────────
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 overflow-x-auto text-sm text-slate-300 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
      >
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ── Lazy terminal loader ──────────────────────────────────────────────────
function LazyTerminal({
  width,
  height,
}: {
  width: number | string;
  height: number | string;
}) {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sentinelRef} style={{ width: typeof width === "number" ? width : width, height: typeof height === "number" ? height : height }}>
      {visible ? (
        <Suspense
          fallback={
            <div className="w-full h-full rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-slate-500 font-mono text-sm">
              Loading interactive demo...
            </div>
          }
        >
          <FrankenTerminal
            width="100%"
            height="100%"
            className="rounded-2xl border border-white/5 overflow-hidden"
            captureKeys={false}
            showStatus
            loadTextAssets={false}
          />
        </Suspense>
      ) : (
        <div className="w-full h-full rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-slate-500 font-mono text-sm">
          <Play className="h-5 w-5 mr-2" />
          Scroll down to load interactive demo
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function WebReactPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultW = typeof window !== "undefined" ? Math.min(80 * 8 + 24, window.innerWidth - 80) : 80 * 8 + 24;
  const { size, setSize, onPointerDown, onPointerMove, onPointerUp } = useResize(containerRef, {
    w: defaultW,
    h: 24 * 16 + 24,
  });

  // Full-width mode
  const [fullWidth, setFullWidth] = useState(false);

  return (
    <main id="main-content" className="relative min-h-screen bg-black overflow-x-hidden">
      {/* ── CINEMATIC HEADER ─────────────────────────────────── */}
      <header className="relative pt-44 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-[5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[60px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-8"
            >
              <Blocks className="h-3 w-3" />
              React Component
            </motion.div>

            <FrankenGlitch trigger="random" intensity="low">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8">
                React <br />
                <span className="text-animate-green">Widget.</span>
              </h1>
            </FrankenGlitch>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl leading-relaxed text-left"
            >
              Embed a live FrankenTUI terminal in any React page. Three lines
              of code, full GPU-accelerated rendering, automatic resize handling.
            </motion.p>
          </div>
        </div>

        <div className="absolute top-24 right-4 md:top-48 md:right-[12%] opacity-35 hover:opacity-100 transition-opacity">
          <FrankenEye className="scale-[1.2] md:scale-[1.8] rotate-[-10deg]" />
        </div>
      </header>

      {/* ── RESIZABLE DEMO ─────────────────────────────────── */}
      <SectionShell
        id="resizable-demo"
        icon="terminal"
        title="Resizable Widget"
        kicker="Drag the handles to resize. The terminal automatically refits its grid to the new container dimensions."
      >
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                if (p.w === 0) {
                  setFullWidth(true);
                  setSize({ w: containerRef.current?.parentElement?.clientWidth ?? 1200, h: p.h });
                } else {
                  setFullWidth(false);
                  setSize({ w: Math.min(p.w, containerRef.current?.parentElement?.clientWidth ?? 1200), h: p.h });
                }
              }}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition-all",
                !fullWidth && size.w === Math.min(p.w, 1200) && size.h === p.h
                  ? "border-green-500/40 bg-green-500/10 text-green-400"
                  : fullWidth && p.w === 0
                    ? "border-green-500/40 bg-green-500/10 text-green-400"
                    : "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20",
              )}
            >
              {p.label} <span className="text-slate-600 ml-1">{p.desc}</span>
            </button>
          ))}
        </div>

        {/* Terminal container with resize handles */}
        <div className="mx-auto flex justify-center">
          <div
            ref={containerRef}
            className="relative select-none"
            style={{ width: fullWidth ? "100%" : size.w, height: size.h }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <LazyTerminal
              width="100%"
              height="100%"
            />

            {/* Right drag handle */}
            {!fullWidth && (
              <div
                onPointerDown={onPointerDown("x")}
                className="absolute top-0 -right-4 w-8 h-full flex items-center justify-center cursor-col-resize group z-20"
              >
                <div className="w-1 h-12 rounded-full bg-white/10 group-hover:bg-green-500/40 group-active:bg-green-500 transition-colors">
                  <GripVertical className="h-4 w-4 text-transparent group-hover:text-green-500/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* Bottom drag handle */}
            <div
              onPointerDown={onPointerDown("y")}
              className="absolute -bottom-4 left-0 h-8 w-full flex items-center justify-center cursor-row-resize group z-20"
            >
              <div className="h-1 w-12 rounded-full bg-white/10 group-hover:bg-green-500/40 group-active:bg-green-500 transition-colors" />
            </div>

            {/* Corner drag handle */}
            {!fullWidth && (
              <div
                onPointerDown={onPointerDown("xy")}
                className="absolute -bottom-4 -right-4 w-8 h-8 flex items-center justify-center cursor-nwse-resize group z-20"
              >
                <div className="w-3 h-3 rounded-sm bg-white/10 group-hover:bg-green-500/40 group-active:bg-green-500 transition-colors" />
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          The full WASM kernel runs in your browser at 60fps. Works in Chrome, Edge, Safari, and Firefox.
        </p>
      </SectionShell>

      {/* ── USE CASES ──────────────────────────────────────── */}
      <SectionShell
        id="use-cases"
        icon="globe"
        title="Use Cases"
        kicker="Anywhere you'd embed a code editor, you can now embed a full terminal UI."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {browserUseCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-green-500/20 hover:bg-green-500/[0.02] transition-all"
            >
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                {uc.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{uc.description}</p>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      {/* ── INTEGRATION CODE ───────────────────────────────── */}
      <SectionShell
        id="integration"
        icon="fileText"
        title="3-Line Integration"
        kicker="Import the component, set your dimensions, and you're done. FrankenTerminal handles WASM loading, GPU setup, and resize events internally."
      >
        <div className="mx-auto max-w-2xl">
          <CodeBlock code={codeSnippet} />
        </div>
      </SectionShell>

      {/* ── PROPS REFERENCE ────────────────────────────────── */}
      <SectionShell
        id="props"
        icon="layers"
        title="Props Reference"
        kicker="Key props for sizing, behavior, and callbacks."
      >
        <div className="mx-auto max-w-4xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4 text-[10px] font-black uppercase tracking-widest text-green-500">Prop</th>
                <th className="py-3 pr-4 text-[10px] font-black uppercase tracking-widest text-green-500">Type</th>
                <th className="py-3 pr-4 text-[10px] font-black uppercase tracking-widest text-green-500">Default</th>
                <th className="py-3 text-[10px] font-black uppercase tracking-widest text-green-500">Description</th>
              </tr>
            </thead>
            <tbody>
              {propsRef.map((row) => (
                <tr key={row.prop} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 pr-4 font-mono text-green-400">{row.prop}</td>
                  <td className="py-3 pr-4 font-mono text-slate-500">{row.type}</td>
                  <td className="py-3 pr-4 font-mono text-slate-600">{row.default}</td>
                  <td className="py-3 text-slate-400">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>

      {/* Bottom spacer for mobile nav */}
      <div className="h-32" />
    </main>
  );
}
