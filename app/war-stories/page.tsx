import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Skull } from "lucide-react";
import { warStories, warStoriesExtended, optimizations, performanceSLAs } from "@/lib/content";
import SectionShell from "@/components/section-shell";
import WarStoryCard from "@/components/war-story-card";
import OptimizationCard from "@/components/optimization-card";
import { motion } from "framer-motion";
import FrankenEye from "@/components/franken-eye";

export const metadata: Metadata = {
  title: "War Stories & Optimizations",
  description:
    "Critical bugs fought and performance milestones achieved during the 5-day build of FrankenTUI.",
};

export default function WarStoriesPage() {
  return (
    <main id="main-content" className="relative min-h-screen bg-black overflow-x-hidden">
      {/* ── CINEMATIC HEADER ─────────────────────────────────── */}
      <header className="relative pt-44 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[80px]" />
           <div className="absolute bottom-0 left-[5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[60px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-8">
              <Skull className="h-3 w-3" />
              Battle Reports
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-none">
              War <br /><span className="text-animate-green">Stories.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl leading-relaxed">
              Building a TUI kernel in 5 days meant fighting 
              synchronized output deadlocks, battling character 
              collisions, and optimizing allocations into oblivion.
            </p>
          </div>
        </div>

        {/* Floating Peeking Eye */}
        <div className="absolute top-48 right-[12%] hidden lg:block opacity-35 hover:opacity-100 transition-opacity">
          <FrankenEye className="scale-[1.8] rotate-[-10deg]" />
        </div>
      </header>

      {/* ── War Stories ──────────────────────────────────────── */}
      <SectionShell
        id="bugs"
        eyebrow="Critical Defects"
        title="Battle Reports"
        kicker="The most dangerous defects encountered and neutralized during development."
      >
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {warStories.map((story) => (
            <WarStoryCard key={story.title} story={story} />
          ))}
        </div>
      </SectionShell>

      {/* ── Extended War Stories ──────────────────────────────── */}
      <SectionShell
        id="deep-fixes"
        eyebrow="Technical Debt"
        title="Deep Fixes"
        kicker="Subtle, multi-layered bugs that required understanding terminal internals and Unicode edge cases."
      >
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {warStoriesExtended.map((story) => (
            <WarStoryCard key={story.title} story={story} />
          ))}
        </div>
      </SectionShell>

      {/* ── Performance SLAs ───────────────────────────────────── */}
      <SectionShell
        id="slas"
        eyebrow="Runtime Invariants"
        title="Quality Guards"
        kicker="Hard performance targets enforced in CI. Violations are test failures, not warnings."
      >
        <div className="overflow-x-auto glass-modern rounded-3xl p-1">
          <table className="w-full text-left text-sm border-collapse">
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
                <tr key={sla.metric} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 font-bold text-white text-base">{sla.metric}</td>
                  <td className="p-6 font-mono text-sm text-green-400">{sla.target}</td>
                  <td className="p-6 font-mono text-sm text-yellow-400">{sla.hardCap}</td>
                  <td className="p-6 text-sm text-slate-500 leading-relaxed max-w-xs">{sla.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>

      {/* ── Optimizations ────────────────────────────────────── */}
      <SectionShell
        id="optimizations"
        eyebrow="Hardware Alignment"
        title="Efficiency Gains"
        kicker="Key architectural decisions that ensure FrankenTUI runs at 60 FPS even on legacy hardware."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {optimizations.map((opt) => (
            <OptimizationCard key={opt.name} opt={opt} />
          ))}
        </div>
      </SectionShell>

      {/* ── CTA section ──────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pb-40">
        <div className="relative overflow-hidden rounded-[3rem] border border-red-900/40 bg-gradient-to-br from-red-950/20 via-black to-black p-12 md:p-24 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05),transparent_70%)]" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Neutron-Grade Code.</h2>
            <p className="text-lg md:text-xl text-slate-400 font-medium mb-12 leading-relaxed">
              Explore the repository to see the fixes and optimizations in their full technical context. 
              Built for correctness from the ground up.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/Dicklesworthstone/frankentui"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-black font-black text-lg hover:bg-green-500 transition-all shadow-xl active:scale-95"
              >
                VIEW ON GITHUB
              </a>
              <Link
                href="/getting-started"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-lg hover:bg-white/10 transition-all active:scale-95"
              >
                GET STARTED
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}