"use client";

import Link from "next/link";
import { Skull } from "lucide-react";
import { motion } from "framer-motion";
import { optimizations, performanceSLAs } from "@/lib/content";
import SectionShell from "@/components/section-shell";
import OptimizationCard from "@/components/optimization-card";
import FrankenEye from "@/components/franken-eye";
import FrankenGlitch from "@/components/franken-glitch";
import WarStoriesMap from "@/components/war-stories-map";

/**
 * War Stories Page - High-octane battle reports from the engineering front.
 * Optimized for both technical depth and visceral visual impact.
 */
export default function WarStoriesPage() {
  return (
    <main id="main-content" className="relative min-h-screen bg-black overflow-x-hidden">
      {/* ── CINEMATIC HEADER ─────────────────────────────────── */}
      <header className="relative pt-32 pb-16 md:pt-44 md:pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[80px]" />
           <div className="absolute bottom-0 left-[5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[60px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-start text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-8">
              <Skull className="h-3 w-3" />
              Battle Reports
            </div>
            
            <FrankenGlitch trigger="random" intensity="low">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-none text-left">
                War <br /><span className="text-red-500">Stories.</span>
              </h1>
            </FrankenGlitch>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl leading-relaxed text-left"
            >
              Building a TUI kernel in 5 days meant fighting 
              synchronized output deadlocks, battling character 
              collisions, and optimizing allocations into oblivion.
            </motion.p>
          </motion.div>
        </div>

        {/* Floating Peeking Eye - Now visible on mobile */}
        <div className="absolute top-24 right-4 md:top-48 md:right-[12%] opacity-35 hover:opacity-100 transition-opacity">
          <FrankenEye className="scale-[1.2] md:scale-[1.8] rotate-[-10deg]" />
        </div>
      </header>

      {/* ── WAR STORIES TACTICAL MAP ────────────────────────── */}
      <SectionShell
        id="tactical-map"
        eyebrow="Visualized Intelligence"
        title="Tactical Map"
        kicker="Select an active conflict node to extract a detailed battle report from the core logs."
        forceReveal={true}
      >
        <div className="w-full relative group/map-container">
          <WarStoriesMap />
        </div>
      </SectionShell>

      {/* ── PERFORMANCE SLAs ───────────────────────────────────── */}
      <SectionShell
        id="slas"
        eyebrow="Runtime Invariants"
        title="Quality Guards"
        kicker="Hard performance targets enforced in CI. Violations are test failures, not warnings."
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="overflow-x-auto glass-modern rounded-3xl p-1 border-white/5 shadow-2xl"
        >
          <table className="w-full text-left text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-6 font-black text-white uppercase tracking-widest text-[10px]">Metric</th>
                <th className="p-6 font-black text-green-400 uppercase tracking-widest text-[10px]">Target</th>
                <th className="p-6 font-black text-yellow-400 uppercase tracking-widest text-[10px]">Hard Cap</th>
                <th className="p-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {performanceSLAs.map((sla) => (
                <tr key={sla.metric} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 font-black text-white text-base group-hover:text-green-400 transition-colors">{sla.metric}</td>
                  <td className="p-6 font-mono text-sm text-green-400">{sla.target}</td>
                  <td className="p-6 font-mono text-sm text-yellow-400">{sla.hardCap}</td>
                  <td className="p-6 text-sm text-slate-500 leading-relaxed max-w-xs">{sla.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </SectionShell>

      {/* ── EFFICIENCY GAINS ────────────────────────────────────── */}
      <SectionShell
        id="optimizations"
        eyebrow="Hardware Alignment"
        title="Efficiency Gains"
        kicker="Key architectural decisions that ensure FrankenTUI runs at 60 FPS even on legacy hardware."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {optimizations.map((opt, i) => (
            <motion.div
              key={opt.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <OptimizationCard opt={opt} />
            </motion.div>
          ))}
        </div>
      </SectionShell>

      {/* ── CTA SECTION ──────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pb-40">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3rem] border border-red-900/40 bg-gradient-to-br from-red-950/20 via-black to-black p-12 md:p-24 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05),transparent_70%)]" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Neutron-Grade Code.</h2>
            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
              Explore the repository to see the fixes and optimizations in their full technical context. 
              Built for correctness from the ground up.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="https://github.com/Dicklesworthstone/frankentui"
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic="true"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-black font-black text-sm hover:bg-green-500 transition-all shadow-xl active:scale-95 uppercase tracking-widest"
              >
                VIEW_ON_GITHUB
              </a>
              <Link
                href="/getting-started"
                data-magnetic="true"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm hover:bg-white/10 transition-all active:scale-95 uppercase tracking-widest"
              >
                GET_STARTED
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
