"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import type { SVGProps } from "react";
import {
  Cpu,
  Shield,
  Lock,
  Terminal,
  ArrowRight,
  Zap,
  Activity,
  Binary,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  algorithms,
  cellDiagram,
} from "@/lib/content";
import SectionShell from "@/components/section-shell";
import AlgorithmCard from "@/components/algorithm-card";
import FrankenEye from "@/components/franken-eye";
import { FrankenContainer, FrankenStitch } from "@/components/franken-elements";
import FrankenGlitch from "@/components/franken-glitch";

/* ── Pipeline stage data ─────────────────────────────────── */

const pipelineStages = [
  { label: "Event", description: "Input capture", icon: Zap },
  { label: "Update", description: "State transition", icon: Activity },
  { label: "View", description: "Virtual buffer", icon: Monitor },
  { label: "Diff", description: "Bayesian selection", icon: Binary },
  { label: "Present", description: "ANSI emission", icon: Terminal },
] as const;

function Monitor(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

/* ── Decision Card Component ─────────────────────────────── */

function DecisionCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <FrankenContainer withStitches={false} className="group glass-modern h-full p-6 md:p-10 transition-all hover:bg-white/[0.03]">
      <div className="flex flex-col h-full">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/5 border border-green-500/20 text-green-400 mb-8 group-hover:scale-110 transition-transform">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-black text-white mb-4 group-hover:text-green-400 transition-colors">
          {title}
        </h3>
        <p className="text-slate-400 font-medium leading-relaxed">
          {description}
        </p>
      </div>
    </FrankenContainer>
  );
}

/* ── Page component ──────────────────────────────────────── */

export default function ArchitecturePage() {
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <main id="main-content" className="relative min-h-screen bg-black overflow-x-hidden">
      {/* ── HIGH-END HEADER ───────────────────────────────── */}
      <header className="relative pt-32 pb-16 md:pt-44 md:pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[80px]" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[60px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-8"
            >
              <Binary className="h-3 w-3" />
              Technical Specification
            </motion.div>
            
            <FrankenGlitch trigger="random" intensity="low">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 text-left">
                Inside the <br />
                <span className="text-animate-green">
                  Machine.
                </span>
              </h1>
            </FrankenGlitch>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl leading-relaxed text-left"
            >
              A deep dive into the 16-byte cell architecture, 
              Bayesian rendering strategies, and the zero-unsafe kernel 
              that powers FrankenTUI.
            </motion.p>
          </div>
        </div>

        {/* Floating Eye Detail */}
        <div className="absolute top-48 right-[10%] hidden lg:block opacity-40 hover:opacity-100 transition-opacity">
          <FrankenEye className="scale-150 -rotate-12" />
        </div>
      </header>

      {/* ── KINETIC PIPELINE ─────────────────────────────── */}
      <SectionShell
        id="pipeline"
        eyebrow="Data Flow"
        title="The Render Cycle"
        kicker="Every frame follows a deterministic, 5-stage pipeline. Pure state transitions, no hidden I/O."
      >
        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-8">
          {pipelineStages.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                viewport={{ once: true }}
                className="relative group"
              >
                <FrankenContainer withBolts={false} withPulse={true} className="glass-modern p-6 md:p-8 text-center h-full flex flex-col items-center hover:bg-green-500/5 hover:border-green-500/30 transition-all overflow-hidden border-green-500/10">
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                    className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>
                  <FrankenGlitch trigger="hover" intensity="low">
                    <h3 className="text-lg font-black text-white mb-2 uppercase tracking-widest">{stage.label}</h3>
                  </FrankenGlitch>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">{stage.description}</p>
                  
                  {/* Step Number */}
                  <span className="absolute top-4 right-4 text-[10px] font-black text-white/10 group-hover:text-green-500/20 transition-colors">
                    0{i + 1}
                  </span>

                  {/* Pulsing Light Effect on Hover */}
                  <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-colors pointer-events-none" />
                </FrankenContainer>
                
                {/* Connecting Arrow (Desktop) with Data Packet */}
                {i < pipelineStages.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 lg:-right-6 z-20 items-center justify-center pointer-events-none w-8 lg:w-12">
                    <motion.div
                      animate={{ x: [0, 20, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.4 }}
                      className="h-1 w-1 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"
                    />
                    <ArrowRight className="absolute h-4 w-4 text-green-500/20" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </SectionShell>

      {/* ── BLUEPRINT: THE CELL ──────────────────────────── */}
      <SectionShell
        id="cell-struct"
        eyebrow="Binary Purity"
        title="16-Byte Cell Model"
        kicker="The atom of FrankenTUI. Cache-aligned, SIMD-ready, and designed for extreme performance."
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <FrankenContainer className="bg-black/60 p-0 overflow-hidden shadow-2xl border-white/10">
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">cell.rs</span>
              </div>
              <pre className="p-8 text-[11px] font-mono leading-relaxed text-green-400 overflow-x-auto selection:bg-green-500/30">
                {cellDiagram}
              </pre>
            </FrankenContainer>
          </motion.div>
          
          <div className="grid gap-6">
            {[
              { title: "Cache Optimal", desc: "4 cells fit perfectly in a 64-byte L1 cache line.", icon: Zap },
              { title: "SIMD Ready", desc: "Single 128-bit instruction for full cell equality.", icon: Cpu },
              { title: "Zero Leak", desc: "RAII-backed grapheme cleanup prevents memory growth.", icon: Shield },
            ].map((feature, i) => (
              <motion.div 
                key={feature.title} 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-6 items-start group"
              >
                <div className="h-10 w-10 shrink-0 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-white font-black uppercase tracking-widest text-sm mb-1 group-hover:text-green-400 transition-colors">{feature.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* ── ALIEN ALGORITHMS ─────────────────────────────── */}
      <SectionShell
        id="algorithms"
        eyebrow="Intelligence"
        title="Monster Math"
        kicker="Algorithms borrowed from statistical machine learning, not hand-tuned heuristics."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {algorithms.map((algorithm, i) => (
            <motion.div
              key={algorithm.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              <AlgorithmCard algorithm={algorithm} />
            </motion.div>
          ))}
        </div>
      </SectionShell>

      {/* ── DESIGN DECISIONS ─────────────────────────────── */}
      <SectionShell
        id="decisions"
        eyebrow="Invariants"
        title="Architecture Rules"
        kicker="Core principles enforced at the type and crate level."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { icon: Lock, title: "One-Writer Rule", desc: "All stdout goes through TerminalWriter. Single serialization point eliminates race conditions." },
            { icon: Shield, title: "RAII Cleanup", desc: "State restored on drop—even on panic. Your terminal never stays broken." },
            { icon: Activity, title: "Deterministic", desc: "Identical Model state + terminal size = bit-identical ANSI output. Always." },
            { icon: Zap, title: "Zero Unsafe", desc: "#![forbid(unsafe_code)] across all core rendering and layout crates." }
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <DecisionCard
                icon={item.icon}
                title={item.title}
                description={item.desc}
              />
            </motion.div>
          ))}
        </div>
      </SectionShell>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pb-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <FrankenContainer className="glass-modern bg-green-500/5 p-12 md:p-20 text-center overflow-hidden border-green-500/20">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to build?</h2>
              <p className="text-lg text-slate-400 font-medium mb-12">
                Add FrankenTUI to your project and start building interfaces with 
                correctness guarantees from day one.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/getting-started" 
                  data-magnetic="true"
                  className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-green-500 text-black font-black text-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-105 transition-transform"
                >
                  GET STARTED
                </Link>
                <Link 
                  href="/showcase" 
                  data-magnetic="true"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-lg hover:bg-white/10 transition-colors"
                >
                  VIEW SHOWCASE
                </Link>
              </div>
            </div>
            
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-0 opacity-10">
              <FrankenStitch orientation="vertical" className="h-64" />
            </div>
          </FrankenContainer>
        </motion.div>
      </section>
    </main>
  );
}
