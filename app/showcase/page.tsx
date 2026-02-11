"use client";

import Link from "next/link";
import { ArrowRight, Eye, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { screenshots, videos } from "@/lib/content";
import type { Video } from "@/lib/content";
import SectionShell from "@/components/section-shell";
import ScreenshotGallery from "@/components/screenshot-gallery";
import VideoPlayer from "@/components/video-player";
import FrankenEye from "@/components/franken-eye";
import FrankenGlitch from "@/components/franken-glitch";

const FrankenTerminal = lazy(() => import("@/components/franken-terminal"));

/** Lazy-loads the interactive terminal only when scrolled into view. */
function LazyTerminalSection() {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={sentinelRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
    >
      <SectionShell
        id="interactive-demo"
        icon="terminal"
        title="Interactive Demo"
        kicker="Don't just look at screenshots — try FrankenTUI live. Use Tab to switch screens, number keys for direct navigation, and arrow keys to scroll."
      >
        <div className="mx-auto max-w-5xl">
          {visible ? (
            <Suspense fallback={
              <div className="w-full h-[500px] rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-slate-500 font-mono text-sm">
                Loading interactive demo...
              </div>
            }>
              <FrankenTerminal
                width="100%"
                height={500}
                className="rounded-2xl border border-white/5 overflow-hidden"
                showStatus
                captureKeys
                loadTextAssets
              />
            </Suspense>
          ) : (
            <div className="w-full h-[500px] rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-slate-500 font-mono text-sm">
              <Play className="h-5 w-5 mr-2" />
              Scroll down to load interactive demo
            </div>
          )}
          <p className="mt-4 text-center text-xs text-slate-600">
            The full WASM kernel runs in your browser at 60fps. Works in Chrome, Edge, Safari, and Firefox.
          </p>
        </div>
      </SectionShell>
    </motion.div>
  );
}

export default function ShowcasePage() {
  return (
    <main id="main-content" className="relative min-h-screen bg-black overflow-x-hidden">
      {/* ── CINEMATIC HEADER ─────────────────────────────────── */}
      <header className="relative pt-44 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[80px]" />
           <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[60px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-start text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-8"
            >
              <Eye className="h-3 w-3" />
              Visual Gallery
            </motion.div>
            
            <FrankenGlitch trigger="random" intensity="low">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8">
                The <br />
                <span className="text-animate-green">
                  Showcase.
                </span>
              </h1>
            </FrankenGlitch>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl leading-relaxed"
            >
              Explore dashboards, data visualizations, 
              and complex visual effects rendered entirely 
              within the terminal grid.
            </motion.p>
          </div>
        </div>

        {/* Floating Peeking Eye - Now visible on mobile */}
        <div className="absolute top-24 right-4 md:top-48 md:right-[15%] opacity-30 hover:opacity-100 transition-opacity">
          <FrankenEye className="scale-[1.3] md:scale-[2] rotate-12" />
        </div>
      </header>

      {/* ── Screenshot gallery section ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <SectionShell
          id="screenshots"
          icon="eye"
          title="Screenshots"
          kicker="All ten showcase views — dashboards, widgets, visual effects, data visualization, and more. Click any image to enlarge."
        >
          <ScreenshotGallery screenshots={screenshots} columns={2} />
        </SectionShell>
      </motion.div>

      {/* ── Try Live Demo CTA ───────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-lg text-slate-400 mb-6">
          Screenshots are nice, but why not try it yourself?
        </p>
        <Link
          href="/web"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-green-500 text-black font-black text-lg hover:bg-white transition-all shadow-[0_0_30px_rgba(34,197,94,0.2)] active:scale-95"
        >
          <Play className="h-5 w-5" />
          Try the Live Demo
          <ArrowRight className="h-5 w-5" />
        </Link>
        <p className="mt-3 text-xs text-slate-600">Works in Chrome, Edge, Safari, and Firefox</p>
      </div>

      {/* ── Interactive WASM Demo ───────────────────────────── */}
      <LazyTerminalSection />

      {/* ── Video demos section ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <SectionShell
          id="video-demos"
          icon="play"
          title="Video Demos"
          kicker="Watch FrankenTUI running live in real terminal emulators with resize handling, CRT effects, and full interactivity."
        >
          <div className="mx-auto max-w-4xl space-y-8">
            {videos.map((video: Video, i: number) => (
              <motion.div
                key={video.title}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <VideoPlayer video={video} />
              </motion.div>
            ))}
          </div>
        </SectionShell>
      </motion.div>

      {/* ── CTA section ──────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-green-900/40 bg-gradient-to-br from-green-950/50 via-emerald-950/30 to-black p-10 md:p-16"
        >
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
        </motion.div>
      </section>
    </main>
  );
}
