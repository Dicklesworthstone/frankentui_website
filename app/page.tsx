"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Github,
  ArrowRight,
  Rocket,
  Package,
  Terminal,
  Activity,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

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
import FrankenGlitch from "@/components/franken-glitch";
import { FrankenContainer } from "@/components/franken-elements";
import { Magnetic, BorderBeam } from "@/components/motion-wrapper";
import DecodingText from "@/components/decoding-text";
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
      <section className="relative flex flex-col items-center pt-24 pb-10 overflow-hidden text-left">
        {/* Living Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px]" />
          <GlowOrbits />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 w-full mt-12 md:mt-0">
          {/* Hero Text & CTAs */}
          <div className="flex flex-col items-start max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-8"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
              V0.1.1 Alive on Crates.io
            </motion.div>

            <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-black tracking-tight leading-[0.85] text-white mb-10 text-left">
              <DecodingText text="The" delay={0.2} /> <br />
              <FrankenGlitch trigger="random" intensity="low">
                <span className="text-red-500">
                  <DecodingText text="Monster" delay={0.6} />
                </span>
              </FrankenGlitch> <br />
              <DecodingText text="Terminal Kernel." delay={1} />
            </h1>

            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mb-12">
              Stitched together from the finest Rust algorithms and
              brought to life with deterministic math. Minimal, high-performance,
              and architecturally pure.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Magnetic strength={0.1}>
                <Link
                  href="/getting-started"
                  data-magnetic="true"
                  className="px-10 py-5 rounded-2xl bg-green-500 text-black font-black text-lg hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(34,197,94,0.3)] active:scale-95"
                >
                  <Rocket className="h-5 w-5" />
                  GET STARTED
                </Link>
              </Magnetic>
              <Magnetic strength={0.1}>
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-magnetic="true"
                  className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Github className="h-5 w-5" />
                  VIEW SOURCE
                </a>
              </Magnetic>
            </div>
          </div>


          {/* Full-Width Video — the centrepiece */}
          <div className="relative mt-16 w-full group">
            {/* Floating Peeking Eye */}
            <div className="absolute top-[-80px] right-[10%] z-20 hidden lg:block animate-bounce transition-all duration-1000">
              <FrankenEye className="scale-150 rotate-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
            </div>

            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <FrankenContainer withBolts={false} className="relative glass-modern p-2 md:p-3 overflow-hidden shadow-2xl w-full">
              <BorderBeam />

              {/* Auto-playing Rio Recording */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                 <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/screenshots/visual_effects_clifford_attractor.webp"
                  className="w-full h-full object-cover"
                 >
                  <source src="/videos/frankentui-rio-crt.webm" type="video/webm" />
                 </video>

                 {/* Console Metadata Overlay */}
                 <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Terminal className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Rio_CRT_Active</span>
                 </div>
              </div>
            </FrankenContainer>

            {/* Embedded Stats Card */}
            <div className="absolute -bottom-10 left-6 glass-modern p-6 rounded-2xl border border-green-500/20 shadow-2xl animate-float hidden md:flex">
              <div className="flex flex-col text-left">
                <span className="text-4xl font-black text-green-400 tabular-nums tracking-tighter">100h</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Build Time</span>
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
          <div className="mb-10 flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
              <Image
                src="/images/frankentui-alien-artifact.webp"
                alt="FrankenTUI"
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-400/90">
                From the Author
              </p>
              <p className="text-[10px] text-slate-600 font-bold mt-0.5">
                &ldquo;Hey, it fell off the back of a Spaceship.&rdquo;
              </p>
            </div>
          </div>
          <TweetWall tweets={tweets} />
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

          <FrankenGlitch trigger="hover" intensity="medium">
            <h2
              className="font-bold tracking-tighter text-white text-4xl md:text-6xl"
            >
              Ready to Build?
            </h2>
          </FrankenGlitch>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400 md:text-xl font-medium">
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
                <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">terminal</span>
              </div>

              {/* Command */}
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 font-mono text-sm">
                  <span className="select-none text-green-500 font-bold">$</span>
                  <code className="text-slate-200 font-bold tracking-tight">cargo add ftui</code>
                </div>
              </div>
            </div>
          </div>

          {/* MIT badge + CTA link */}
          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Package className="h-3 w-3 text-green-400" />
              MIT License &middot; Free &amp; Open Source
            </div>

            <Link
              href="/getting-started"
              data-magnetic="true"
              className="glow-green group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-green-900/30 transition-all hover:from-green-500 hover:to-emerald-500 hover:shadow-green-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020a02]"
            >
              <Rocket className="h-5 w-5" />
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          8. AUTHOR CREDIT (Agent Flywheel)
          ================================================================ */}
      <section className="relative py-32 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <FrankenContainer withPulse={true} className="glass-modern p-8 md:p-16 border-green-500/10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Text Side */}
              <div className="space-y-8 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-green-500">
                  <Activity className="h-3 w-3" />
                  Origin_Protocol
                </div>

                <FrankenGlitch trigger="always" intensity="low">
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                    Crafted by <br />
                    <span className="text-animate-green">Jeffrey Emanuel.</span>
                  </h2>
                </FrankenGlitch>

                <p className="text-xl text-slate-400 font-medium leading-relaxed">
                  This entire system was architected and built using 
                  <strong className="text-white"> Agent Flywheel</strong> — a high-velocity 
                  AI engineering ecosystem.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Magnetic strength={0.2}>
                    <a
                      href="https://agent-flywheel.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-magnetic="true"
                      className="px-8 py-4 rounded-2xl bg-green-500 text-black font-black text-sm hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                    >
                      EXPLORE FLYWHEEL
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Magnetic>
                  <Magnetic strength={0.1}>
                    <a
                      href={siteConfig.social.authorGithub}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-magnetic="true"
                      className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                    >
                      <Github className="h-4 w-4" />
                      AUTHOR_CORE
                    </a>
                  </Magnetic>
                </div>
              </div>

              {/* Visual Side - 3D Tilted OG Image */}
              <div className="relative group perspective-1000">
                <motion.div
                  whileHover={{ 
                    rotateY: -10, 
                    rotateX: 5, 
                    scale: 1.02,
                    boxShadow: "0 20px 80px -20px rgba(34, 197, 94, 0.3)"
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl transition-all"
                >
                  <Image 
                    src="/images/frankentui_illustration.webp" 
                    alt="FrankenTUI Origin" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay scanlines */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
                  
                  {/* HUD elements over image */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Flywheel_Generated</span>
                  </div>
                </motion.div>
                
                {/* Back decorative glow */}
                <div className="absolute -inset-4 bg-green-500/10 rounded-[2rem] blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </FrankenContainer>
        </div>
      </section>
    </main>
  );
}