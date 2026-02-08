import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { changelog, tweets } from "@/lib/content";
import SectionShell from "@/components/section-shell";
import Timeline from "@/components/timeline";
import TweetWall from "@/components/tweet-wall";
import FrankenEye from "@/components/franken-eye";

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
    detail: "5 days of focused, continuous building",
  },
  {
    value: "12",
    unit: "crates",
    label: "in the workspace",
    detail: "Composable, focused modules with clear boundaries",
  },
  {
    value: "20+",
    unit: "algorithms",
    label: "implemented",
    detail: "Bayesian, statistical, and mathematical — not heuristics",
  },
  {
    value: "v0.1.1",
    unit: "",
    label: "published to crates.io",
    detail: "From zero to a real Rust crate in under a week",
  },
];

export default function HowItWasBuiltPage() {
  return (
    <main id="main-content" className="relative min-h-screen bg-black">
      {/* ── Page header ──────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/30 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-36 sm:px-6 md:pb-24 md:pt-44 lg:px-8">
          {/* Peeking eyes */}
          <div className="absolute top-28 right-16 hidden md:block opacity-35 hover:opacity-100 transition-opacity">
            <FrankenEye className="rotate-[10deg] scale-90" />
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-6 bg-gradient-to-r from-green-500/80 to-transparent" />
            <p className="text-xs font-bold uppercase tracking-widest text-green-400/90">
              The Build Story
            </p>
          </div>

          <h1
            className="font-bold tracking-tighter text-white"
            style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
          >
            Built in 5 Days
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400/90 md:text-xl md:leading-relaxed">
            From zero lines of code to a published Rust crate in 100 hours.
            This is the full story of how FrankenTUI went from architectural
            plan to{" "}
            <code className="rounded bg-green-950/50 px-1.5 py-0.5 font-mono text-sm text-green-400/90">
              crates.io v0.1.1
            </code>{" "}
            in a single intense sprint.
          </p>
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
        kicker="Every phase of the build, from the first architectural sketch to the published crate. Twenty milestones across five relentless days, in five-hour increments."
      >
        <Timeline items={changelog} />
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
