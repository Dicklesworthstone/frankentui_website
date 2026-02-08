"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Network, Share2, Binary, GitBranch, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { FrankenContainer, NeuralPulse } from "@/components/franken-elements";
import FrankenEye from "@/components/franken-eye";
import dynamic from "next/dynamic";

const BeadsView = dynamic(() => import("@/components/beads/beads-view"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[600px] w-full bg-black/40 rounded-3xl border border-green-500/10 backdrop-blur-xl">
      <div className="h-12 w-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
    </div>
  )
});

const VIEWER_REPO = "https://github.com/Dicklesworthstone/beads-for-frankentui";

const graphStats = [
  { label: "Total Beads", value: "60+", icon: Binary },
  { label: "Epics", value: "8", icon: GitBranch },
  { label: "Completed", value: "95%", icon: CheckCircle2 },
  { label: "Sprint Duration", value: "5 Days", icon: Clock },
];

export default function BeadsPage() {
  return (
    <main id="main-content" className="relative min-h-screen bg-black overflow-x-hidden">
      {/* ── CINEMATIC HEADER ─────────────────────────────────── */}
      <header className="relative pt-44 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[80px]" />
           <div className="absolute bottom-0 right-[5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-8"
            >
              <Network className="h-3 w-3" />
              Infrastructure Visualization
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8">
              Project <br />
              <span className="text-animate-green">
                Graph.
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl leading-relaxed"
            >
              The entire FrankenTUI build was tracked as a directed acyclic graph
              of &ldquo;beads&rdquo;&mdash;interconnected tasks with explicit
              dependencies, priorities, and completion states.
            </motion.p>
          </div>
        </div>

        {/* Floating Peeking Eye */}
        <div className="absolute top-48 right-[15%] hidden lg:block opacity-30 hover:opacity-100 transition-opacity">
          <FrankenEye className="scale-[2.2] rotate-[15deg]" />
        </div>
      </header>

      {/* ── NATIVE VIEWER SECTION ───────────────────────────────── */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-8 py-16 md:py-24">
        <BeadsView />
      </section>

      {/* ── WHAT ARE BEADS ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 md:py-24 border-t border-white/5">
        <div className="max-w-3xl space-y-8 text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3"
          >
            <div className="h-px w-8 bg-green-500/40" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500/80">
              Methodology
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black tracking-tight text-white"
          >
            What are Beads?
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4 text-base text-slate-400 font-medium leading-relaxed"
          >
            <p>
              During the 5-day sprint that produced FrankenTUI, every unit of
              work was modeled as a <strong className="text-white">bead</strong>&mdash;a
              node in a directed acyclic graph (DAG) with typed dependency edges,
              priority scores, and completion criteria.
            </p>
            <p>
              The graph served as the single source of truth for what to build
              next. Critical path analysis determined the optimal build order,
              while blocker detection prevented wasted effort on tasks whose
              prerequisites were incomplete.
            </p>
            <p>
              This viewer reconstructs that execution graph from the project&apos;s
              SQLite database, letting you explore how a complex 12-crate Rust
              workspace was orchestrated from scratch in under a week.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
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
                See how it was built?
              </h2>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-400/90 md:text-lg">
                Dive into the full story of how FrankenTUI went from zero
                to a 12-crate workspace in five days.
              </p>
            </div>

            <Link
              href="/how-it-was-built"
              className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-green-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-900/30 transition-all hover:bg-green-500 hover:shadow-green-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Built in 5 Days
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
