import Image from "next/image";
import Link from "next/link";
import {
  Github,
  ArrowRight,
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
import { FrankenContainer } from "@/components/franken-elements";
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
          1. LIVING HERO (Stripe-Grade Visuals)
          ================================================================ */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-20 overflow-hidden text-left">
        {/* Living Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px]" />
          <GlowOrbits />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 w-full mt-12 md:mt-0">
          <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
            
            {/* LEFT: Massive Typography & CTAs */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/5 text-[10px] font-black uppercase tracking-[0.2em] text-green-400 mb-8"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
                V0.1.1 Alive on Crates.io
              </div>

              <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-black tracking-tight leading-[0.85] text-white mb-10">
                The <span className="text-animate-green">Monster</span> <br /> 
                Terminal Kernel.
              </h1>

              <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mb-12">
                Stitched together from the finest Rust algorithms and 
                brought to life with deterministic math. Minimal, high-performance,
                and architecturally pure.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link
                  href="/getting-started"
                  className="px-10 py-5 rounded-2xl bg-green-500 text-black font-black text-lg hover:bg-white hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(34,197,94,0.3)] active:scale-95"
                >
                  <Rocket className="h-5 w-5" />
                  GET STARTED
                </Link>
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Github className="h-5 w-5" />
                  VIEW SOURCE
                </a>
              </div>
            </div>

            {/* RIGHT: High-Impact Visual */}
            <div className="hidden lg:flex lg:col-span-5 relative justify-end">
              {/* Floating Peeking Eye */}
              <div className="absolute top-[-100px] right-[20%] z-20">
                <FrankenEye className="scale-150 rotate-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <FrankenContainer className="relative glass-modern p-2 overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02] hover:-rotate-1">
                  <Image
                    src="/images/frankentui_illustration.webp"
                    alt="FrankenTUI Kernel"
                    width={600}
                    height={450}
                    className="rounded-2xl border border-white/10 shadow-2xl"
                    priority
                  />
                </FrankenContainer>
                
                {/* Embedded Stats Card */}
                <div className="absolute -bottom-12 -left-12 glass-modern p-8 rounded-[2rem] border border-green-500/20 shadow-2xl">
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-green-400 tabular-nums">100h</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Build Time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero stats (Repositioned for flow) */}
      <div className="max-w-7xl mx-auto px-6 mb-44">
        <StatsGrid stats={heroStats} />
      </div>

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
          <FrankenContainer className="bg-transparent border-none">
            <TweetWall tweets={tweets} limit={4} />
          </FrankenContainer>
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
