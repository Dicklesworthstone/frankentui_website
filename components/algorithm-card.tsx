"use client";

import { useMemo } from "react";
import { Binary } from "lucide-react";
import type { Algorithm } from "@/lib/content";
import { FrankenContainer } from "./franken-elements";
import { motion } from "framer-motion";
import DecodingText from "./decoding-text";
import FrankenGlitch from "./franken-glitch";

export default function AlgorithmCard({ algorithm }: { algorithm: Algorithm }) {
  // Deterministic color based on name length
  const accentColor = useMemo(() => {
    const spectrum = ["#38bdf8", "#a78bfa", "#f472b6", "#ef4444", "#fb923c", "#fbbf24", "#34d399", "#22d3ee"];
    const hash = algorithm.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return spectrum[hash % spectrum.length];
  }, [algorithm.name]);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <FrankenContainer withStitches={false} withPulse={true} accentColor={accentColor} className="group h-full glass-modern transition-all duration-500 hover:bg-white/[0.03] border-white/5 group-hover:border-white/10">
        <div className="flex h-full flex-col p-8">
          <div className="mb-8 flex items-center justify-between">
            <span 
              className="inline-flex rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em]"
              style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30`, color: accentColor }}
            >
              {algorithm.category}
            </span>
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <Binary className="h-4 w-4 text-slate-700 transition-colors" style={{ ["--hover-color" as string]: accentColor }} />
            </motion.div>
          </div>

          <FrankenGlitch trigger="hover" intensity="low">
            <motion.h3 
              className="text-xl font-black text-white mb-3 transition-colors"
              whileHover={{ color: accentColor }}
            >
              {algorithm.name}
            </motion.h3>
          </FrankenGlitch>
          
          <p className="text-sm font-medium leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors mb-8 flex-1">
            {algorithm.description}
          </p>

          {algorithm.formula && (
            <div className="relative group/code mt-auto">
              <div className="absolute -inset-2 rounded-lg opacity-0 group-hover/code:opacity-100 transition-opacity" style={{ backgroundColor: `${accentColor}05` }} />
              <div className="relative font-mono text-[11px] font-bold transition-colors overflow-hidden" style={{ color: `${accentColor}aa` }}>
                <DecodingText text={algorithm.formula} duration={1.5} />
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Impact</span>
            <motion.span 
              className="text-[10px] font-bold uppercase tracking-tighter transition-colors"
              whileHover={{ color: accentColor }}
              style={{ color: `${accentColor}cc` }}
            >
              {algorithm.impact}
            </motion.span>
          </div>
        </div>
      </FrankenContainer>
    </motion.div>
  );
}
