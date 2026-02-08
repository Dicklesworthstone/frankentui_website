"use client";

import type { Algorithm } from "@/lib/content";
import { FrankenContainer } from "./franken-elements";

export default function AlgorithmCard({ algorithm }: { algorithm: Algorithm }) {
  return (
    <FrankenContainer className="group h-full bg-black/30 transition-all hover:border-green-500/20 hover:bg-black/40">
      <div className="flex h-full flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex rounded-full bg-green-500/10 border border-green-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-green-400">
            {algorithm.category}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
          {algorithm.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
          {algorithm.description}
        </p>

        {algorithm.formula && (
          <div className="mt-4 rounded-lg bg-green-500/5 border border-green-500/10 px-3 py-2 font-mono text-xs text-green-300/80">
            {algorithm.formula}
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-green-500/20 to-transparent" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-green-400/60">
            {algorithm.impact}
          </p>
        </div>
      </div>
    </FrankenContainer>
  );
}
