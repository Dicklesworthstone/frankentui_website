"use client";

import { Gauge } from "lucide-react";
import type { Optimization } from "@/lib/content";
import { FrankenContainer } from "./franken-elements";

export default function OptimizationCard({ opt }: { opt: Optimization }) {
  return (
    <FrankenContainer className="group h-full bg-black/30 transition-all hover:border-green-500/20 hover:bg-black/40">
      <div className="flex h-full flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
            <Gauge className="h-4 w-4" />
          </div>
          <span className="font-mono text-xs font-bold text-green-500">
            {opt.metric}
          </span>
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-green-400 transition-colors">
          {opt.name}
        </h3>
        
        <p className="mt-2 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
          {opt.description}
        </p>
      </div>
    </FrankenContainer>
  );
}
