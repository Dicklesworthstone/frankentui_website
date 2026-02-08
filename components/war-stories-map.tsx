"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSite } from "@/lib/site-state";
import { warStories, warStoriesExtended } from "@/lib/content";
import type { WarStory } from "@/lib/content";
import WarStoryCard from "./war-story-card";
import { Skull, AlertCircle, ShieldAlert, X } from "lucide-react";
import { createPortal } from "react-dom";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

export default function WarStoriesMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { playSfx } = useSite();
  const allStories = [...warStories, ...warStoriesExtended];

  const handleSelect = (title: string) => {
    if (selectedId === title) {
      setSelectedId(null);
      playSfx("click");
    } else {
      setSelectedId(title);
      playSfx("zap");
    }
  };

  return (
    <div className="relative w-full aspect-[16/10] md:aspect-[21/9] bg-slate-950/50 rounded-[2rem] border border-red-900/20 overflow-hidden group/map">
      {/* Blueprint Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      
      {/* Map Nodes */}
      <div className="absolute inset-0 p-8 md:p-16 flex flex-wrap items-center justify-center gap-8 md:gap-16">
        {allStories.map((story, i) => {
          const isSelected = selectedId === story.title;
          const isCritical = i < warStories.length;
          
          return (
            <motion.div
              key={story.title}
              layoutId={`map-node-${story.title}`}
              className="relative"
            >
              <motion.button
                onClick={() => handleSelect(story.title)}
                className={`relative z-10 h-12 w-12 md:h-16 md:w-16 rounded-full flex items-center justify-center transition-all ${
                  isSelected 
                    ? "bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-110" 
                    : "bg-red-950/40 border border-red-500/30 text-red-500/60 hover:border-red-500/60 hover:text-red-500"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isCritical ? <ShieldAlert className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                
                {/* Pulse for critical nodes */}
                {isCritical && !isSelected && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-red-500/20 pointer-events-none" />
                )}
              </motion.button>
              
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-red-500/40 pointer-events-none">
                {story.title.split(" ").slice(0, 2).join("_")}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Overlay */}
      <Portal>
        <AnimatePresence>
          {selectedId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
              onClick={() => { setSelectedId(null); playSfx("click"); }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="max-w-3xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {allStories.find(s => s.title === selectedId) && (
                  <WarStoryCard story={allStories.find(s => s.title === selectedId)!} />
                )}
                <button 
                  onClick={() => { setSelectedId(null); playSfx("click"); }}
                  className="mt-8 mx-auto flex items-center gap-2 px-8 py-3 rounded-full bg-red-500 text-white font-black text-xs hover:bg-red-400 transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)] active:scale-95"
                >
                  <X className="h-4 w-4" /> CLOSE_BATTLE_REPORT
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>


      {/* Map Labels */}
      <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2 text-red-500/60">
          <Skull className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Operational_Theater_Alpha</span>
        </div>
        <div className="text-[10px] text-red-900 font-mono">COORD: 42.1N / 73.4W</div>
      </div>
      
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1 pointer-events-none">
        <div className="text-[10px] text-red-500/40 font-mono uppercase tracking-widest">Select node to extract data</div>
        <div className="h-1 w-32 bg-red-950/40 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-red-500/40"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}
