"use client";

import { 
  LucideIcon, 
  Zap, 
  Bug, 
  TreeDeciduous, 
  Trash2, 
  ShieldAlert, 
  Lock, 
  Ghost, 
  MousePointer2, 
  Infinity, 
  Search, 
  Monitor, 
  LayoutGrid, 
  Clock, 
  Minimize2 
} from "lucide-react";
import type { WarStory } from "@/lib/content";
import { FrankenContainer } from "./franken-elements";
import Streamdown from "./ui/streamdown";

const icons: Record<string, LucideIcon> = {
  zap: Zap,
  bug: Bug,
  tree: TreeDeciduous,
  trash: Trash2,
  shield: ShieldAlert,
  lock: Lock,
  ghost: Ghost,
  cursor: MousePointer2,
  infinity: Infinity,
  search: Search,
  monitor: Monitor,
  layout: LayoutGrid,
  clock: Clock,
  minimize: Minimize2,
};

import FrankenGlitch from "./franken-glitch";

export default function WarStoryCard({ story }: { story: WarStory }) {
  const Icon = icons[story.icon] || Bug;

  return (
    <FrankenContainer withStitches={false} withPulse={true} className="group h-full glass-modern transition-all duration-500 hover:bg-white/[0.03] hover:border-red-500/30 hover:-translate-y-1 border-white/5">
      <div className="flex h-full flex-col p-8 md:p-10 text-left">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-red-500/60 transition-colors">
            Bug Report
          </span>
        </div>

        <FrankenGlitch trigger="hover" intensity="low">
          <h3 className="text-2xl font-black text-white mb-2 group-hover:text-red-400 transition-colors tracking-tight">
            {story.title}
          </h3>
        </FrankenGlitch>
        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-6">
          {story.subtitle}
        </p>

        <div className="text-base font-medium leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors mb-10">
          <Streamdown content={story.description} />
        </div>

        <div className="mt-auto relative group/debug">
          <div className="absolute -inset-2 bg-red-500/5 rounded-xl opacity-0 group-hover/debug:opacity-100 transition-opacity" />
            <div className="relative rounded-xl bg-black/40 border border-white/5 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-3">Root Cause Analysis</p>
            <div className="text-xs leading-relaxed text-slate-500 font-mono group-hover:text-slate-400 transition-colors">
              <Streamdown content={story.technicalDetails} className="text-xs font-mono font-normal text-slate-500 leading-relaxed space-y-2" />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Resolution Impact</span>
          <span className="text-[10px] font-bold text-red-500/80 uppercase tracking-tighter">{story.impact}</span>
        </div>
      </div>
    </FrankenContainer>
  );
}
