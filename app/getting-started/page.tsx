import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  Terminal,
  Layers,
  ArrowRight,
  Github,
  BookOpen,
} from "lucide-react";
import {
  codeExample, dashboardExample, inlineModeExample, faq, siteConfig,
  widgets, featureFlags, screenModes, troubleshooting, envVars,
  glyphOverrides, visualFxExample, keybindingExample,
  type Widget, type FeatureFlag, type ScreenModeRow, type TroubleshootItem, type EnvVar,
  type GlyphOverride,
} from "@/lib/content";
import SectionShell from "@/components/section-shell";
import RustCodeBlock from "@/components/rust-code-block";
import CrateGrid from "@/components/crate-grid";
import FrankenEye from "@/components/franken-eye";
import { FrankenContainer } from "@/components/franken-elements";

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Install FrankenTUI and build your first terminal UI application in Rust",
};

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package,
  Terminal,
  Layers,
  ArrowRight,
  Github,
  BookOpen,
  Rocket,
  Shield,
  Binary,
  Activity,
  Box,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import {
  codeExample, dashboardExample, inlineModeExample, faq, siteConfig,
  widgets, featureFlags, screenModes, troubleshooting, envVars,
  glyphOverrides, visualFxExample, keybindingExample,
  type Widget, type FeatureFlag, type ScreenModeRow, type TroubleshootItem, type EnvVar,
  type GlyphOverride,
} from "@/lib/content";
import SectionShell from "@/components/section-shell";
import RustCodeBlock from "@/components/rust-code-block";
import CrateGrid from "@/components/crate-grid";
import FrankenEye from "@/components/franken-eye";
import { FrankenBolt, FrankenContainer } from "@/components/franken-elements";

export default function GettingStartedPage() {
  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    navigator.clipboard.writeText("cargo add ftui");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main id="main-content" className="relative min-h-screen bg-black overflow-x-hidden">
      {/* ── CINEMATIC HEADER ─────────────────────────────────── */}
      <header className="relative pt-44 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[80px]" />
           <div className="absolute bottom-0 left-[5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-8">
              <Rocket className="h-3 w-3" />
              Quick Start Protocol
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-none">
              Get <br /><span className="text-animate-green">Started.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl leading-relaxed text-left">
              Install the kernel, write your first model, 
              and breathe life into your terminal in under 
              five minutes.
            </p>
          </motion.div>
        </div>

        {/* Floating Peeking Eye */}
        <div className="absolute top-48 right-[10%] hidden lg:block opacity-30 hover:opacity-100 transition-opacity">
          <FrankenEye className="scale-[2.5] rotate-[-20deg]" />
        </div>
      </header>

      {/* ── INSTALLATION ─────────────────────────────────────── */}
      <SectionShell
        id="installation"
        eyebrow="Deployment"
        title="Installation"
        kicker="Add the monster to your Rust project with a single command."
      >
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <FrankenContainer withStitches={false} className="glass-modern overflow-hidden group/install">
              <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Terminal className="h-4 w-4 text-green-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Command Line</span>
                </div>
                <button 
                  onClick={copyInstall}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="p-10 bg-black/40">
                <code className="text-2xl md:text-3xl font-mono font-bold text-white group-hover/install:text-green-400 transition-colors">
                  <span className="text-green-500 mr-4 select-none">$</span>
                  cargo add ftui
                </code>
              </div>
            </FrankenContainer>
          </div>
          
          <div className="lg:col-span-5">
            <div className="space-y-6">
               <h3 className="text-xl font-black text-white uppercase tracking-tight">Manual Stitching</h3>
               <p className="text-slate-400 font-medium leading-relaxed">
                 Prefer fine-grained control? You can depend on individual crates 
                 to minimize your binary footprint.
               </p>
               <div className="flex flex-wrap gap-2">
                  {["ftui-core", "ftui-render", "ftui-runtime"].map(c => (
                    <span key={c} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c}</span>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* ── MINIMAL EXAMPLE ──────────────────────────────────── */}
      <SectionShell
        id="minimal-example"
        eyebrow="Hello Monster"
        title="Minimal App"
        kicker="A complete, runnable counter in under 50 lines."
      >
        <FrankenContainer className="glass-modern p-1 md:p-2 bg-black/40">
          <RustCodeBlock code={codeExample} title="src/main.rs" />
        </FrankenContainer>
      </SectionShell>

      {/* ── KEY CONCEPTS ─────────────────────────────────────── */}
      <SectionShell
        id="key-concepts"
        eyebrow="Architecture"
        title="The Three Pillars"
        kicker="The foundational invariants that set FrankenTUI apart."
      >
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
          <FrankenContainer withStitches={false} className="group glass-modern p-8 md:p-10 hover:bg-white/[0.03] transition-all">
            <div className="flex flex-col h-full">
              <div className="h-12 w-12 rounded-xl bg-green-500/5 flex items-center justify-center text-green-400 mb-8 group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 group-hover:text-green-400 transition-colors">Elm Model</h3>
              <p className="text-slate-400 font-medium leading-relaxed flex-1">
                Pure state transitions. No hidden I/O. Logic stays clean and testable.
              </p>
            </div>
          </FrankenContainer>

          <FrankenContainer withStitches={false} className="group glass-modern p-8 md:p-10 hover:bg-white/[0.03] transition-all">
            <div className="flex flex-col h-full">
              <div className="h-12 w-12 rounded-xl bg-green-500/5 flex items-center justify-center text-green-400 mb-8 group-hover:scale-110 transition-transform">
                <Terminal className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 group-hover:text-green-400 transition-colors">Inline First</h3>
              <p className="text-slate-400 font-medium leading-relaxed flex-1">
                Preserve terminal history while keeping UI chrome stable.
              </p>
            </div>
          </FrankenContainer>

          <FrankenContainer withStitches={false} className="group glass-modern p-8 md:p-10 hover:bg-white/[0.03] transition-all">
            <div className="flex flex-col h-full">
              <div className="h-12 w-12 rounded-xl bg-green-500/5 flex items-center justify-center text-green-400 mb-8 group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 group-hover:text-green-400 transition-colors">One-Writer</h3>
              <p className="text-slate-400 font-medium leading-relaxed flex-1">
                Zero race conditions. All output flows through a single serialized gate.
              </p>
            </div>
          </FrankenContainer>
        </div>
      </SectionShell>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <SectionShell
        id="faq"
        eyebrow="Intel"
        title="Common Queries"
        kicker="Clarifications on the monster protocol."
      >
        <div className="grid gap-4">
          {faq.map((item) => (
            <details key={item.question} className="group glass-modern overflow-hidden transition-all duration-500 open:bg-white/[0.03] open:border-green-500/30">
              <summary className="flex cursor-pointer items-center justify-between p-8 text-lg font-black text-white tracking-tight group-hover:text-green-400 transition-colors [&::-webkit-details-marker]:hidden">
                {item.question}
                <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 group-open:rotate-45 group-open:text-green-500 transition-all">
                   <ArrowRight className="h-4 w-4" />
                </div>
              </summary>
              <div className="px-8 pb-8 text-base font-medium leading-relaxed text-slate-400">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </SectionShell>

      {/* ── LINKS ──────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pb-40">
        <FrankenContainer className="glass-modern bg-green-500/5 p-12 md:p-20 text-center overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Keep exploring.</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/architecture" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black font-black text-lg">
                ARCHITECTURE
              </Link>
              <Link href="/glossary" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-lg">
                LEXICON
              </Link>
            </div>
          </div>
        </FrankenContainer>
      </section>
    </main>
  );
}
