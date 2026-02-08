import type { Metadata } from "next";
import Link from "next/link";
import {
  Cpu,
  Shield,
  Lock,
  Terminal,
  ArrowRight,
} from "lucide-react";
import { algorithms } from "@/lib/content";
import SectionShell from "@/components/section-shell";
import CrateGrid from "@/components/crate-grid";
import AlgorithmCard from "@/components/algorithm-card";
import FrankenEye from "@/components/franken-eye";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "Technical deep dive into FrankenTUI's rendering pipeline, crate structure, and algorithms",
};

/* ── Pipeline stage data ─────────────────────────────────── */

const pipelineStages = [
  { label: "Event", description: "Key, mouse, resize, tick" },
  { label: "Model.update()", description: "Pure state transition" },
  { label: "Model.view()", description: "Render to virtual buffer" },
  { label: "Buffer", description: "Cell grid snapshot" },
  { label: "Diff", description: "Bayesian strategy selection" },
  { label: "Presenter", description: "Geometry + drawing ops" },
  { label: "ANSI", description: "Escape sequence stream" },
] as const;

/* ── Design decision helpers ─────────────────────────────── */

function DecisionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-black/20 p-6 transition-all hover:border-green-500/20 hover:bg-black/30 md:p-8">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"
        aria-hidden="true"
      />

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-green-900/60 bg-gradient-to-br from-green-950/80 to-emerald-900/50 text-green-400 shadow-lg">
        {icon}
      </div>

      <h3 className="mt-6 text-lg font-bold leading-tight text-white md:text-xl">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </article>
  );
}

/* ── Page component ──────────────────────────────────────── */

export default function ArchitecturePage() {
  return (
    <main id="main-content" className="relative min-h-screen bg-black">
      {/* ── Page header ──────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/30 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-36 sm:px-6 md:pb-24 md:pt-44 lg:px-8">
          {/* Peeking eyes */}
          <div className="absolute top-32 right-12 hidden lg:block opacity-40 hover:opacity-100 transition-opacity">
            <FrankenEye className="rotate-[-15deg] scale-110" />
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-6 bg-gradient-to-r from-green-500/80 to-transparent" />
            <p className="text-xs font-bold uppercase tracking-widest text-green-400/90">
              Deep Dive
            </p>
          </div>

          <h1
            className="font-bold tracking-tighter text-white"
            style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
          >
            Architecture
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400/90 md:text-xl md:leading-relaxed">
            A technical deep dive into FrankenTUI&apos;s rendering pipeline,
            workspace crate structure, and the alien-artifact algorithms that
            power every frame.
          </p>
        </div>
      </header>

      {/* ── Rendering Pipeline ───────────────────────────── */}
      <SectionShell
        id="pipeline"
        icon="layers"
        title="Rendering Pipeline"
        kicker="Every frame follows a strict, deterministic path from input event to terminal output. No hidden I/O, no side effects in view(), no shared mutable state between stages."
      >
        {/* Horizontal flow - scrollable on small screens */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-stretch gap-0 overflow-x-auto pb-4 sm:pb-0">
            {pipelineStages.map((stage, i) => (
              <div key={stage.label} className="flex shrink-0 items-stretch">
                {/* Stage box */}
                <div className="group relative flex w-36 flex-col items-center justify-start rounded-xl border border-white/5 bg-black/30 px-3 py-5 transition-all hover:border-green-500/30 hover:bg-black/50 sm:w-40 md:w-44">
                  {/* Stage number */}
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-xs font-bold text-green-400">
                    {i + 1}
                  </div>

                  {/* Label */}
                  <h3 className="text-center font-mono text-xs font-bold leading-tight text-white sm:text-sm">
                    {stage.label}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-center text-[11px] leading-snug text-slate-500 sm:text-xs">
                    {stage.description}
                  </p>

                  {/* Top shine */}
                  <div
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>

                {/* Arrow between stages */}
                {i < pipelineStages.length - 1 && (
                  <div className="flex shrink-0 items-center px-1 sm:px-2">
                    <ArrowRight className="h-4 w-4 text-green-500/40" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Subtle gradient fade on the right for scroll hint on mobile */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent sm:hidden"
            aria-hidden="true"
          />
        </div>

        {/* Pipeline summary */}
        <div className="mt-10 rounded-2xl border border-green-900/30 bg-gradient-to-br from-green-950/20 via-black to-black p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Why this pipeline matters
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Each stage is a pure function of its inputs. The Buffer is an
                immutable snapshot, the Diff compares two Buffers without side
                effects, and the Presenter emits a minimal ANSI byte stream. This
                means every frame is snapshot-testable, time-travel debuggable,
                and bit-for-bit reproducible across runs.
              </p>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* ── Workspace Crates ─────────────────────────────── */}
      <SectionShell
        id="crates"
        icon="blocks"
        title="Workspace Crates"
        kicker="Twelve focused crates with clear dependency boundaries. Each crate has a single responsibility -- add only what you need, nothing more."
      >
        <CrateGrid />
      </SectionShell>

      {/* ── Alien Algorithms ─────────────────────────────── */}
      <SectionShell
        id="algorithms"
        icon="sparkles"
        title="Alien Algorithms"
        kicker="Not heuristics -- math. Every statistical decision records an evidence ledger so you can read exactly why the renderer chose a particular strategy."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {algorithms.map((algorithm) => (
            <AlgorithmCard key={algorithm.name} algorithm={algorithm} />
          ))}
        </div>
      </SectionShell>

      {/* ── Key Design Decisions ─────────────────────────── */}
      <SectionShell
        id="design-decisions"
        icon="shield"
        title="Key Design Decisions"
        kicker="Four invariants that hold across the entire codebase. These are not guidelines -- they are enforced at the type level and the crate level."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <DecisionCard
            icon={<Lock className="h-5 w-5" />}
            title="One-Writer Rule"
            description="All stdout goes through TerminalWriter. A single serialization point eliminates cursor corruption, race conditions, and interleaved output. No widget or subsystem writes directly to the terminal."
          />
          <DecisionCard
            icon={<Shield className="h-5 w-5" />}
            title="RAII Cleanup"
            description="TerminalSession restores terminal state on drop -- even on panic. Raw mode, alternate screen, mouse capture, and bracket paste are all unwound automatically. Your terminal is never left broken."
          />
          <DecisionCard
            icon={<Cpu className="h-5 w-5" />}
            title="Deterministic Rendering"
            description="No hidden I/O anywhere in the render path. Given the same Model state and terminal size, view() produces identical output. Every frame is reproducible, snapshot-testable, and diffable."
          />
          <DecisionCard
            icon={<Terminal className="h-5 w-5" />}
            title="Zero Unsafe in Render"
            description="#![forbid(unsafe_code)] at the crate level across ftui-render, ftui-runtime, and ftui-layout. The entire rendering pipeline, layout engine, and runtime are built on safe Rust. Correctness over cleverness."
          />
        </div>
      </SectionShell>

      {/* ── CTA section ──────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-green-900/40 bg-gradient-to-br from-green-950/50 via-emerald-950/30 to-black p-10 md:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-green-900/15 via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Ready to build with FrankenTUI?
              </h2>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-400/90 md:text-lg">
                Get started in minutes with our step-by-step guide. Add the
                crate, write your first Model, and see it render.
              </p>
            </div>

            <Link
              href="/getting-started"
              className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-green-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-900/30 transition-all hover:bg-green-500 hover:shadow-green-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
