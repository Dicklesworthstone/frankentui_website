import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { changelog, tweets, buildLogLines, devSessionInsights, devProcessStats } from "@/lib/content";
import SectionShell from "@/components/section-shell";
import Timeline from "@/components/timeline";
import TweetWall from "@/components/tweet-wall";
import FrankenEye from "@/components/franken-eye";
import { FrankenContainer } from "@/components/franken-elements";

export const metadata: Metadata = {
  title: "Built in 5 Days",
  description:
    "How FrankenTUI was built from scratch in 5 days — the full changelog and community reactions",
};

const keyStats = [
  {
    value: "100",
    unit: "hours",
    label: "of development",
    detail: "≈100.1h from sprint kickoff (2026-01-31) to publish (2026-02-05)",
  },
  {
    value: "12",
    unit: "crates",
    label: "in the workspace",
    detail: "Split into focused crates for strict layering and clean boundaries",
  },
  {
    value: "20+",
    unit: "algorithms",
    label: "implemented",
    detail: "BOCPD, conformal, VOI, CUSUM, fairness guards, and more",
  },
  {
    value: "v0.1.1",
    unit: "",
    label: "published to crates.io",
    detail: "Published 2026-02-05 (after the 100-hour sprint)",
  },
];

export default function HowItWasBuiltPage() {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-8">
              <Clock className="h-3 w-3" />
              100-Hour Sprint
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8">
              Built in <br /><span className="text-animate-green">5 Days.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl leading-relaxed text-left">
              From zero lines of code to a published Rust crate. 
              The granular story of how FrankenTUI was stitched 
              together in a single intense engineering cycle.
            </p>
          </div>
        </div>

        {/* Floating Peeking Eye */}
        <div className="absolute top-48 right-[12%] hidden lg:block opacity-35 hover:opacity-100 transition-opacity">
          <FrankenEye className="scale-[1.8] rotate-[-10deg]" />
        </div>
      </header>

      {/* ── Key Stats grid ────────────────────────────────────── */}
      <SectionShell
        id="key-stats"
        icon="barChart3"
        title="Key Stats"
        kicker="The numbers behind the sprint. Every hour counted."
      >
        <dl className="grid gap-px overflow-hidden rounded-2xl border border-green-900/40 bg-green-900/20 text-sm text-slate-200 shadow-xl shadow-green-950/20 sm:grid-cols-2 lg:grid-cols-4">
          {keyStats.map((stat) => (
            <div
              key={stat.label}
              className="group relative bg-[#020a02]/60 px-6 py-6 backdrop-blur transition-colors hover:bg-[#020a02]/40"
            >
              <div
                className="absolute inset-x-0 top-0 h-px origin-center scale-x-0 bg-gradient-to-r from-green-400 via-lime-400 to-green-400 transition-transform duration-500 group-hover:scale-x-100"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <dt className="text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-green-400/70">
                {stat.label}
              </dt>
              <dd className="mt-3 text-3xl font-bold tracking-tight text-slate-100 transition-[filter] duration-500 group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.3)] sm:text-4xl">
                {stat.value}
                {stat.unit && (
                  <span className="ml-1.5 text-base font-medium text-slate-500">
                    {stat.unit}
                  </span>
                )}
              </dd>
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-400/80">
                {stat.detail}
              </p>
            </div>
          ))}
        </dl>
      </SectionShell>

      {/* ── Full Timeline ─────────────────────────────────────── */}
      <SectionShell
        id="timeline"
        icon="clock"
        title="Full Timeline"
        kicker="Selected milestones timestamped from the real commit history (2026-01-31 → 2026-02-05)."
      >
        <Timeline items={changelog} />
      </SectionShell>

      {/* ── The Making Of (Grounded Highlights) ─────────────── */}
      <SectionShell
        id="making-of"
        icon="bug"
        title="The Making Of"
        kicker="Highlights reconstructed from real sprint artifacts: git history plus archived Claude Code + Codex CLI session logs (2026-01-31 → 2026-02-05)."
      >
        <div className="space-y-8">
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-green-900/40 bg-green-900/20 text-sm text-slate-200 shadow-xl shadow-green-950/20 sm:grid-cols-2 lg:grid-cols-3">
            {devProcessStats.map((stat) => (
              <div
                key={stat.label}
                className="group relative bg-[#020a02]/60 px-6 py-6 backdrop-blur transition-colors hover:bg-[#020a02]/40"
              >
                <dt className="text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-green-400/70">
                  {stat.label}
                </dt>
                <dd className="mt-3 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
                  {stat.value}
                </dd>
                <p className="mt-2 text-xs font-medium leading-relaxed text-slate-400/80">
                  {stat.detail}
                </p>
              </div>
            ))}
          </dl>

          <div className="space-y-4">
            {devSessionInsights.map((insight) => {
              const flavorStyles: Record<string, string> = {
                breakthrough: "border-green-500/30 bg-green-950/20",
                decision: "border-lime-500/30 bg-lime-950/15",
                crisis: "border-red-500/30 bg-red-950/20",
                grind: "border-yellow-500/30 bg-yellow-950/15",
                ship: "border-emerald-500/40 bg-emerald-950/30",
              };
              const flavorLabels: Record<string, string> = {
                breakthrough: "Breakthrough",
                decision: "Decision",
                crisis: "Crisis",
                grind: "Grind",
                ship: "Ship It",
              };
              const flavorColors: Record<string, string> = {
                breakthrough: "text-green-400",
                decision: "text-lime-400",
                crisis: "text-red-400",
                grind: "text-yellow-400",
                ship: "text-emerald-400",
              };

              return (
                <div
                  key={`${insight.date}-${insight.title}`}
                  className={`rounded-xl border p-5 transition-colors ${flavorStyles[insight.flavor]}`}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-500">
                      {insight.date}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {insight.phase}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${flavorColors[insight.flavor]}`}
                    >
                      {flavorLabels[insight.flavor]}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base font-bold text-white">
                    {insight.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {insight.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </SectionShell>

      {/* ── Sprint Git Log (Selected) ───────────────────────────── */}
      <SectionShell
        id="session-log"
        icon="activity"
        title="Sprint Git Log"
        kicker="Selected, timestamped commit messages from the sprint (local tz)."
      >
        <FrankenContainer className="bg-black/60 p-0 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-white/5 bg-white/5 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs font-mono text-slate-500">git log --oneline (selected)</span>
          </div>
          <div className="p-6 font-mono text-[13px] leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {buildLogLines.map((line, i) => {
                const isPublishLine =
                  /\bpublish\b/i.test(line) ||
                  /\bcrates\.io\b/i.test(line) ||
                  /\bchangelog\b/i.test(line);
                return (
                  <p
                    key={i}
                    className={
                      isPublishLine
                        ? "text-green-400 font-bold"
                        : "text-slate-400 hover:text-slate-200 transition-colors"
                    }
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </FrankenContainer>
      </SectionShell>

      {/* ── What People Said ──────────────────────────────────── */}
      <SectionShell
        id="reactions"
        icon="twitter"
        title="What People Said"
        kicker="Posts and commentary from the build — technical deep-dives, architectural rationale, and demo reveals."
      >
        <TweetWall tweets={tweets} />
      </SectionShell>

      {/* ── CTA section ──────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-green-900/40 bg-gradient-to-br from-green-950/50 via-emerald-950/30 to-black p-10 md:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-green-900/15 via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                See what 100 hours produced
              </h2>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-400/90 md:text-lg">
                Explore the screenshots and video demos, dive into the
                architecture, or add FrankenTUI to your own Rust project.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/showcase"
                className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-green-500/30 hover:bg-green-950/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                View Showcase
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/getting-started"
                className="group inline-flex items-center gap-2.5 rounded-full bg-green-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-green-900/30 transition-all hover:bg-green-500 hover:shadow-green-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
