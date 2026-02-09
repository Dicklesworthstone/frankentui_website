"use client";

import React from "react";
import { Gauge } from "lucide-react";
import type { Optimization } from "@/lib/content";
import { FrankenContainer } from "./franken-elements";
import { motion } from "framer-motion";
import FrankenGlitch from "./franken-glitch";

export default function OptimizationCard({ opt }: { opt: Optimization }) {
  // Deterministic color based on name length
  const accentColor = React.useMemo(() => {
    const spectrum = ["#38bdf8", "#a78bfa", "#f472b6", "#ef4444", "#fb923c", "#fbbf24", "#34d399", "#22d3ee"];
    const hash = opt.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return spectrum[hash % spectrum.length];
  }, [opt.name]);

  return (
    <FrankenContainer withPulse={true} accentColor={accentColor} className="group h-full bg-black/30 transition-all hover:bg-white/[0.02] border-white/5 group-hover:border-white/10">
      <div className="flex h-full flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm"
            style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30`, color: accentColor }}
          >
            <Gauge className="h-4 w-4" />
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
            {opt.metric}
          </span>
        </div>

        <FrankenGlitch trigger="hover" intensity="low">
          <motion.h3 
            className="text-base font-bold text-white transition-colors"
            whileHover={{ color: accentColor }}
          >
            {opt.name}
          </motion.h3>
        </FrankenGlitch>
        
        <p className="mt-2 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
          {opt.description}
        </p>
      </div>
    </FrankenContainer>
  );
}
