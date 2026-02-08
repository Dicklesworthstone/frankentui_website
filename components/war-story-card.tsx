"use client";

import { LucideIcon, Zap, Bug, TreeDeciduous, Trash2, ShieldAlert } from "lucide-react";
import type { WarStory } from "@/lib/content";
import { FrankenContainer } from "./franken-elements";

const icons: Record<string, LucideIcon> = {
  zap: Zap,
  bug: Bug,
  tree: TreeDeciduous,
  trash: Trash2,
  shield: ShieldAlert,
};

export default function WarStoryCard({ story }: { story: WarStory }) {
  const Icon = icons[story.icon] || Bug;

  return (
    <FrankenContainer className="group h-full bg-black/30 transition-all hover:border-red-500/20 hover:bg-black/40">
      <div className="flex h-full flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 group-hover:scale-110 transition-all">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-400">
            Bug Report
          </span>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
          {story.title}
        </h3>
        <p className="text-xs font-mono text-red-400/80 mb-3 uppercase tracking-wide">
          {story.subtitle}
        </p>

        <p className="text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
          {story.description}
        </p>

        <div className="mt-4 flex-1 rounded-lg bg-red-950/20 border border-red-500/10 px-3 py-3">
          <p className="text-[10px] font-bold uppercase text-red-400 mb-1">Technical Root Cause</p>
          <p className="text-xs leading-relaxed text-slate-400/90 font-mono">
            {story.technicalDetails}
          </p>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-red-500/20 to-transparent" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400/60">
            {story.impact}
          </p>
        </div>
      </div>
    </FrankenContainer>
  );
}
