"use client";

import { useCallback } from "react";
import { Terminal, Cpu, Lock, Shield, Blocks, Sparkles, Activity } from "lucide-react";
import type { Feature } from "@/lib/content";
import { FrankenBolt, FrankenContainer } from "./franken-elements";
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from "framer-motion";
import FrankenGlitch from "./franken-glitch";
import { useSite } from "@/lib/site-state";

const iconMap: Record<string, React.ElementType> = {
  terminal: Terminal,
  cpu: Cpu,
  lock: Lock,
  shield: Shield,
  blocks: Blocks,
  sparkles: Sparkles,
};

export default function FeatureCard({ feature }: { feature: Feature }) {
  const { isAnatomyMode } = useSite();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const background = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(34, 197, 94, 0.1), transparent 80%)`;

  const handleMouseMove = useCallback(({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }, [mouseX, mouseY]);

  const Icon = iconMap[feature.icon] || Sparkles;

  return (
    <article
      onMouseMove={handleMouseMove}
      className="group relative h-full rounded-[2rem] transition-all duration-500 hover:-translate-y-2 overflow-hidden kinetic-card"
    >
      <FrankenContainer withPulse={true} className="h-full border-none bg-white/[0.02] group-hover:bg-white/[0.04] transition-all duration-500 p-8 md:p-10 group-hover:border-green-500/20">
        {/* Monster-Tech Glow Overlay - Hardware Accelerated */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background }}
        />

      {/* Anatomy Mode Internals */}
      <AnimatePresence>
        {isAnatomyMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 p-8 pointer-events-none overflow-hidden"
          >
            <div className="w-full h-full font-mono text-[8px] text-green-500/20 whitespace-pre leading-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i}>
                  {Math.random().toString(16).substring(2, 40)}
                  {Math.random().toString(16).substring(2, 40)}
                </div>
              ))}
            </div>
            {/* SVG Wireframe */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
              <path d="M 10 10 L 90 10 L 90 90 L 10 90 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M 10 10 L 90 90 M 90 10 L 10 90" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon & Corner Detail */}
        <div className="flex items-center justify-between mb-10">
          <FrankenGlitch trigger="hover" intensity="medium">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
              <Icon className="h-6 w-6" />
            </div>
          </FrankenGlitch>
          <div className="h-px w-12 bg-gradient-to-r from-green-500/40 to-transparent" />
        </div>

        <h3 className="text-2xl font-black tracking-tight text-white mb-4 group-hover:text-green-400 transition-colors">
          {feature.title}
        </h3>

        <p className="text-slate-400 font-medium leading-relaxed mb-8 flex-1">
          {feature.description}
        </p>

        {/* Action Detail */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-green-500 transition-colors">
          <Activity className="h-3 w-3" />
          <span>Core System Protocol</span>
        </div>
      </div>

      {/* corner bolts */}
      <FrankenBolt className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity" />
      <FrankenBolt className="absolute bottom-4 left-4 opacity-20 group-hover:opacity-100 transition-opacity" />
      </FrankenContainer>
    </article>
  );
}
