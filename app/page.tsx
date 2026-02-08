import Image from "next/image";
import Link from "next/link";
import {
  Github,
  ArrowRight,
  Sparkles,
  Rocket,
  Package,
} from "lucide-react";

import SectionShell from "@/components/section-shell";
import StatsGrid from "@/components/stats-grid";
import GlowOrbits from "@/components/glow-orbits";
import FeatureCard from "@/components/feature-card";
import ScreenshotGallery from "@/components/screenshot-gallery";
import ComparisonTable from "@/components/comparison-table";
import RustCodeBlock from "@/components/rust-code-block";
import Timeline from "@/components/timeline";
import TweetWall from "@/components/tweet-wall";
import FrankenEye from "@/components/franken-eye";
import { FrankenBolt, FrankenContainer } from "@/components/franken-elements";
import {
  siteConfig,
  heroStats,
  features,
  screenshots,
  codeExample,
  changelog,
  tweets,
} from "@/lib/content";
import TerminalDemo from "@/components/terminal-demo";

export default function HomePage() {
  return (
    <main id="main-content">
      {/* ================================================================
          1. HERO
          ================================================================ */}
      <section className="bg-gradient-franken-hero relative isolate overflow-hidden pb-20 pt-32 md:pb-32 md:pt-44 lg:pt-52">
        <GlowOrbits />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Monster eyes peering from the top corner */}
          <div className="absolute -top-12 right-12 hidden lg:flex gap-4 opacity-40 hover:opacity-100 transition-opacity">
            <FrankenEye className="rotate-[-10deg] scale-75 md:scale-100" />
            <FrankenEye className="rotate-[5deg] scale-90 md:scale-110" />
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left column: copy + CTAs */}
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-400">
                <Sparkles className="h-3.5 w-3.5" />
                Open Source &middot; MIT License
              </p>

              <h1
                className="text-gradient-franken font-bold tracking-tighter"
                style={{ fontSize: "clamp(3rem, 8vw, 5rem)", lineHeight: 1.05 }}
              >
                FrankenTUI
              </h1>

              <p className="mt-4 text-xl font-semibold tracking-tight text-slate-200 md:text-2xl">
                Terminal UI Kernel for Rust
              </p>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 md:text-lg md:leading-relaxed">
                Stitched together from the finest algorithms and brought to life with deterministic math.
              </p>

              {/* CTA buttons */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glow-green inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition-all hover:from-green-500 hover:to-emerald-500 hover:shadow-green-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020a02]"
                >
                  <Github className="h-5 w-5" />
                  View on GitHub
                </a>

                <Link
                  href="/getting-started"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-bold text-slate-200 backdrop-blur-sm transition-all hover:border-green-500/30 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020a02]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Right column: illustration */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-xl group">
                {/* Bolts for the image frame */}
                <FrankenBolt className="absolute -left-1.5 -top-1.5 z-20 scale-125 md:scale-150" />
                <FrankenBolt className="absolute -right-1.5 -top-1.5 z-20 scale-125 md:scale-150" />
                <FrankenBolt className="absolute -left-1.5 -bottom-1.5 z-20 scale-125 md:scale-150" />
                <FrankenBolt className="absolute -right-1.5 -bottom-1.5 z-20 scale-125 md:scale-150" />

                <div
                  className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-lime-500/20 opacity-60 blur-2xl transition-all group-hover:opacity-80 group-hover:blur-3xl"
                  aria-hidden="true"
                />
                <Image
                  src="/images/frankentui_illustration.webp"
                  alt="FrankenTUI illustration showing a terminal UI brought to life"
                  width={800}
                  height={600}
                  className="relative rounded-2xl border border-white/10 shadow-2xl shadow-green-950/40 transition-transform duration-500 group-hover:scale-[1.02]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          {/* Hero stats */}
          <div className="mt-20 md:mt-28">
            <StatsGrid stats={heroStats} />
          </div>
        </div>
      </section>

      {/* ================================================================
          1b. TERMINAL DEMO
          ================================================================ */}
      <section className="relative -mt-10 pb-16 md:-mt-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TerminalDemo />
        </div>
      </section>

      {/* ================================================================
          2. WHY FRANKENTUI (Feature Cards)
          ================================================================ */}
      <SectionShell
        id="features"
        icon="sparkles"
        eyebrow="Why FrankenTUI"
        title="Built Different"
        kicker="Not another Ratatui wrapper. FrankenTUI is a ground-up TUI kernel with correctness guarantees, deterministic rendering, and algorithms borrowed from statistical machine learning."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </SectionShell>

      {/* ================================================================
          3. SEE IT IN ACTION (Screenshot Gallery)
          ================================================================ */}
      <SectionShell
        id="showcase"
        icon="eye"
        eyebrow="See It In Action"
        title="Screenshot Gallery"
        kicker="From dashboards to data visualization, file browsers to visual effects. Every screenshot is a real terminal render -- no mocked designs."
      >
        <ScreenshotGallery screenshots={screenshots.slice(0, 6)} columns={3} />

        <div className="mt-10 flex justify-center">
          <Link
            href="/showcase"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 transition-all hover:border-green-500/30 hover:bg-white/10 hover:text-white"
          >
            View Full Showcase
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </SectionShell>

      {/* ================================================================
          4. HOW IT COMPARES (Comparison Table)
          ================================================================ */}
      <SectionShell
        id="comparison"
        icon="gitCompare"
        eyebrow="How It Compares"
        title="Framework Comparison"
        kicker="FrankenTUI bakes correctness guarantees into the kernel layer. Features that require app-level discipline in other frameworks are enforced by the architecture."
      >
        <ComparisonTable />
      </SectionShell>

      {/* ================================================================
          5. THE CODE (Rust Code Block)
          ================================================================ */}
      <SectionShell
        id="code"
        icon="terminal"
        eyebrow="The Code"
        title="Minimal API, Maximum Power"
        kicker="A complete interactive app in under 40 lines. The Elm/Bubbletea-style architecture separates model, update, and view into clean, testable functions."
      >
        <FrankenContainer className="p-1 md:p-2 bg-black/40">
          <RustCodeBlock code={codeExample} title="examples/tick.rs" />
        </FrankenContainer>
      </SectionShell>

      {/* ================================================================
          6. BUILT IN 5 DAYS (Timeline + Tweets)
          ================================================================ */}
      <SectionShell
        id="built-in-5-days"
        icon="clock"
        eyebrow="Built in 5 Days"
        title="From Zero to crates.io"
        kicker="100 hours of focused engineering. Every decision documented, every algorithm justified. Here is how the first 3 milestones unfolded."
      >
        {/* Timeline teaser: first 3 entries */}
        <Timeline items={changelog.slice(0, 3)} />

        <div className="mt-10 flex justify-center">
          <Link
            href="/how-it-was-built"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 transition-all hover:border-green-500/30 hover:bg-white/10 hover:text-white"
          >
            Read the Full Build Log
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Tweet wall */}
        <div className="mt-20">
          <div className="mb-10 flex items-center gap-3">
            <div className="h-px w-6 bg-gradient-to-r from-green-500/80 to-transparent" />
            <p className="text-xs font-bold uppercase tracking-widest text-green-400/90">
              From the Author
            </p>
          </div>
          <TweetWall tweets={tweets} limit={4} />
        </div>
      </SectionShell>

      {/* ================================================================
          7. GET STARTED CTA
          ================================================================ */}
      <section className="relative overflow-hidden py-28 md:py-36 lg:py-44">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-green-950/20 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-green-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-green-900/60 bg-gradient-to-br from-green-950/80 to-emerald-900/50 text-green-400 shadow-lg shadow-green-900/10">
              <Rocket className="h-6 w-6" />
            </div>
          </div>

          <h2
            className="font-bold tracking-tighter text-white"
            style={{ fontSize: "clamp(1.875rem, 5vw, 3.75rem)" }}
          >
            Ready to Build?
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400 md:text-xl">
            Add FrankenTUI to your Rust project with a single command. Ship
            terminal interfaces with correctness guarantees from day one.
          </p>

          {/* Install command */}
          <div className="mx-auto mt-10 max-w-md">
            <div className="glow-green overflow-hidden rounded-2xl border border-green-500/20 bg-black/60 shadow-xl shadow-green-950/30">
              {/* Terminal chrome bar */}
              <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-slate-600">terminal</span>
              </div>

              {/* Command */}
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 font-mono text-sm">
                  <span className="select-none text-green-500">$</span>
                  <code className="text-slate-200">cargo add ftui</code>
                </div>
              </div>
            </div>
          </div>

          {/* MIT badge + CTA link */}
          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <Package className="h-3.5 w-3.5 text-green-400" />
              MIT License &middot; Free &amp; Open Source
            </div>

            <Link
              href="/getting-started"
              className="glow-green group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-green-900/30 transition-all hover:from-green-500 hover:to-emerald-500 hover:shadow-green-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020a02]"
            >
              <Rocket className="h-5 w-5" />
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
