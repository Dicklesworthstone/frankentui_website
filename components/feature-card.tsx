"use client";

import { Terminal, Cpu, Lock, Shield, Blocks, Sparkles, Activity } from "lucide-react";
import type { Feature } from "@/lib/content";
import { FrankenBolt } from "./franken-elements";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

const iconMap: Record<string, React.ElementType> = {
  terminal: Terminal,
  cpu: Cpu,
  lock: Lock,
  shield: Shield,
  blocks: Blocks,
  sparkles: Sparkles,
};

export default function FeatureCard({ feature }: { feature: Feature }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const Icon = iconMap[feature.icon] || Sparkles;

  return (
    <article
      onMouseMove={handleMouseMove}
      className="group relative h-full rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 md:p-10 transition-all duration-500 hover:bg-white/[0.04] hover:border-green-500/20 hover:-translate-y-2 overflow-hidden kinetic-card"
    >
      {/* Monster-Tech Glow Overlay - Hardware Accelerated */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(34, 197, 94, 0.1),
              transparent 80%
            )
          `,
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon & Corner Detail */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <Icon className="h-6 w-6" />
          </div>
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
    </article>
  );
}
