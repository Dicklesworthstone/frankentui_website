"use client";

import { Binary } from "lucide-react";
import type { Algorithm } from "@/lib/content";
import { FrankenContainer } from "./franken-elements";
import { motion } from "framer-motion";
import DecodingText from "./decoding-text";
import FrankenGlitch from "./franken-glitch";

export default function AlgorithmCard({ algorithm }: { algorithm: Algorithm }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <FrankenContainer withStitches={false} withPulse={true} className="group h-full glass-modern transition-all duration-500 hover:bg-green-500/[0.02] border-white/5 hover:border-green-500/20">
        <div className="flex h-full flex-col p-8">
          <div className="mb-8 flex items-center justify-between">
            <span className="inline-flex rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-green-400">
              {algorithm.category}
            </span>
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <Binary className="h-4 w-4 text-slate-700 group-hover:text-green-500/40 transition-colors" />
            </motion.div>
          </div>

          <FrankenGlitch trigger="hover" intensity="low">
            <h3 className="text-xl font-black text-white mb-3 group-hover:text-green-400 transition-colors">
              {algorithm.name}
            </h3>
          </FrankenGlitch>
          
          <p className="text-sm font-medium leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors mb-8 flex-1">
            {algorithm.description}
          </p>

          {algorithm.formula && (
            <div className="relative group/code mt-auto">
              <div className="absolute -inset-2 bg-green-500/5 rounded-lg opacity-0 group-hover/code:opacity-100 transition-opacity" />
              <div className="relative font-mono text-[11px] font-bold text-green-300/70 group-hover:text-green-400 transition-colors overflow-hidden">
                <DecodingText text={algorithm.formula} duration={1.5} />
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Impact</span>
            <span className="text-[10px] font-bold text-green-500/80 uppercase tracking-tighter">{algorithm.impact}</span>
          </div>
        </div>
      </FrankenContainer>
    </motion.div>
  );
}
