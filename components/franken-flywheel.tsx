"use client";

import React, { useState, useMemo, useCallback, useEffect, useId, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  LayoutGrid, GitBranch, Search, X, ExternalLink, Zap, Star, Play,
  ArrowRight, Check, Cog, Activity, Image as ImageIcon, Archive,
  FileCode, Sparkles, ShieldCheck, Mail, Bug, Brain, ShieldAlert,
  RefreshCw, Cpu, Fingerprint, Microscope, Radio, FlaskConical, Dna
} from "lucide-react";
import { flywheelTools, flywheelDescription, type FlywheelTool } from "@/lib/content";
import { cn, NOISE_SVG_DATA_URI } from "@/lib/utils";
import { getColorDefinition } from "@/lib/colors";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";
import BottomSheet from "@/components/ui/bottom-sheet";
import Magnetic from "@/components/motion/magnetic";
import { FrankenBolt, FrankenStitch, FrankenContainer, NeuralPulse } from "./franken-elements";
import FrankenGlitch from "./franken-glitch";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid, GitBranch, Search, Cog, Activity, Image: ImageIcon,
  Archive, FileCode, Sparkles, ShieldCheck, Mail, Bug, Brain, ShieldAlert, RefreshCw,
  Microscope, Radio, FlaskConical, Dna, Fingerprint
};

// --- CONSTANTS ---
const CONTAINER_SIZE = 600;
const RADIUS = 220;
const CENTER = CONTAINER_SIZE / 2;
const NODE_SIZE = 60;

// --- UTILS ---
function getNodePosition(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * RADIUS,
    y: CENTER + Math.sin(angle) * RADIUS,
  };
}

// Generate a high-jitter "lightning" path
function getLightningPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const segments = 4;
  const path = [`M ${from.x} ${from.y}`];
  const dx = (to.x - from.x) / segments;
  const dy = (to.y - from.y) / segments;

  for (let i = 1; i < segments; i++) {
    const jitter = 12;
    const midX = from.x + dx * i + (Math.random() - 0.5) * jitter;
    const midY = from.y + dy * i + (Math.random() - 0.5) * jitter;
    path.push(`L ${midX} ${midY}`);
  }

  path.push(`L ${to.x} ${to.y}`);
  return path.join(" ");
}

/**
 * High-frequency lightning arc
 */
function LightningArc({ from, to, color, active }: { from: any, to: any, color: string, active: boolean }) {
  const [path, setPath] = useState(() => getLightningPath(from, to));

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setPath(getLightningPath(from, to)), 60 + Math.random() * 60);
    return () => clearInterval(id);
  }, [from, to, active]);

  return (
    <motion.path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth={active ? 2 : 0.5}
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? [0.4, 1, 0.6, 1, 0.3] : 0.1 }}
      transition={active ? { repeat: Infinity, duration: 0.2 } : {}}
      style={{ filter: active ? `drop-shadow(0 0 8px ${color})` : "none" }}
    />
  );
}

/**
 * Floating neural "bits"
 */
function NeuralFragments() {
  const bits = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: Math.random() * CONTAINER_SIZE,
    y: Math.random() * CONTAINER_SIZE,
    size: 2 + Math.random() * 4,
    duration: 10 + Math.random() * 20,
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      {bits.map(bit => (
        <motion.div
          key={bit.id}
          className="absolute rounded-full bg-green-500/40"
          style={{ width: bit.size, height: bit.size, left: bit.x, top: bit.y }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: bit.duration, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function NodePulse({ active, color }: { active: boolean, color: string }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ scale: 0.8, opacity: 0, border: `2px solid ${color}` }}
          animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}

export default function FrankenFlywheel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isGlitching, setIsGlitching] = useState(false);
  const scopeId = useId();
  const { lightTap, mediumTap, errorTap } = useHapticFeedback();
  const prefersReducedMotion = useReducedMotion();

  const activeId = selectedId || hoveredId;
  const selectedTool = flywheelTools.find(t => t.id === selectedId) || null;

  // Trigger "Circuit Break" glitch when switching tools
  useEffect(() => {
    if (selectedId) {
      setIsGlitching(true);
      const id = setTimeout(() => setIsGlitching(false), 300);
      return () => clearTimeout(id);
    }
  }, [selectedId]);

  const handleSelect = useCallback((id: string | null) => {
    if (id === selectedId) {
      setSelectedId(null);
      lightTap();
    } else {
      setSelectedId(id);
      mediumTap();
      if (id) errorTap(); // More intense tap for selection
    }
  }, [selectedId, lightTap, mediumTap, errorTap]);

  const positions = useMemo(() => flywheelTools.reduce((acc, tool, index) => {
    acc[tool.id] = getNodePosition(index, flywheelTools.length);
    return acc;
  }, {} as Record<string, { x: number; y: number }>), []);

  const connections = useMemo(() => {
    const lines: { from: string; to: string }[] = [];
    const seen = new Set<string>();
    flywheelTools.forEach(tool => {
      tool.connectsTo.forEach(target => {
        const key = [tool.id, target].sort().join("-");
        if (!seen.has(key)) {
          seen.add(key);
          lines.push({ from: tool.id, to: target });
        }
      });
    });
    return lines;
  }, []);

  return (
    <div className="relative py-24 md:py-32">
      <AnimatePresence>
        {isGlitching && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0.05, 0.2, 0] }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-green-500/10 pointer-events-none mix-blend-overlay"
          />
        )}
      </AnimatePresence>

      {/* containment field header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20 w-full justify-center">
        <div className="h-px w-12 md:w-24 bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
        <div className="px-4 py-1 rounded-full border border-green-500/20 bg-green-500/5 backdrop-blur-md">
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-green-500/60 whitespace-nowrap">Neural_Containment_Field v4.2</span>
        </div>
        <div className="h-px w-12 md:w-24 bg-gradient-to-l from-transparent via-green-500/20 to-transparent" />
      </div>

      <FrankenContainer withPulse={true} className="max-w-[1400px] mx-auto bg-black/60 border-white/5 shadow-[0_0_150px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* background telemetry grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(34,197,94,0.2) 1px, transparent 0)`, backgroundSize: '40px 40px' }} 
        />

        <div className="grid lg:grid-cols-[1.3fr,1fr] gap-0 items-stretch">
          
          {/* THE REACTOR STAGE */}
          <div className="relative flex items-center justify-center p-6 md:p-24 border-r border-white/5 min-h-[500px] md:min-h-[600px] overflow-hidden">
            <NeuralFragments />
            
            <div className="relative scale-[var(--flywheel-scale)] md:scale-100" style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE, "--flywheel-scale": 0.55 } as any}>
              <svg className="absolute inset-0 overflow-visible" width={CONTAINER_SIZE} height={CONTAINER_SIZE}>
                {/* lightning field */}
                {connections.map(conn => {
                  const active = activeId === conn.from || activeId === conn.to;
                  return (
                    <LightningArc 
                      key={`${conn.from}-${conn.to}`}
                      from={positions[conn.from]}
                      to={positions[conn.to]}
                      color={active ? "#4ade80" : "#166534"}
                      active={active}
                    />
                  );
                })}
              </svg>

              {/* REACTOR CORE */}
              <div className="absolute" style={{ left: CENTER - 80, top: CENTER - 80, width: 160, height: 160 }}>
                {/* Layered spinning rings */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border border-green-500/10"
                    style={{ borderStyle: i === 1 ? 'dashed' : 'dotted', padding: i * 8 }}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                  />
                ))}
                
                <motion.div 
                  className="absolute inset-12 rounded-full bg-green-500/5 border border-green-500/40 flex items-center justify-center group cursor-pointer"
                  animate={{ 
                    boxShadow: ["0 0 20px rgba(34,197,94,0.2)", "0 0 60px rgba(34,197,94,0.4)", "0 0 20px rgba(34,197,94,0.2)"],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  onClick={() => handleSelect(null)}
                >
                  <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping opacity-20" />
                  <Zap className="h-10 w-10 text-green-400 z-10" />
                  <NeuralPulse className="opacity-40" />
                </motion.div>
              </div>

              {/* TOOL NODES */}
              {flywheelTools.map((tool, i) => {
                const isSelected = selectedId === tool.id;
                const isConnected = !!activeId && (tool.connectsTo.includes(activeId) || (flywheelTools.find(t => t.id === activeId)?.connectsTo.includes(tool.id) || false));
                const isDimmed = !!activeId && activeId !== tool.id && !isConnected;
                
                return (
                  <motion.div
                    key={tool.id}
                    className="absolute"
                    style={{ left: positions[tool.id].x - NODE_SIZE/2, top: positions[tool.id].y - NODE_SIZE/2, width: NODE_SIZE, height: NODE_SIZE, zIndex: isSelected ? 100 : 50 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, opacity: isDimmed ? 0.2 : 1 }}
                    transition={{ type: "spring", delay: i * 0.02 }}
                  >
                    <Magnetic strength={0.5}>
                      <button
                        onClick={() => handleSelect(tool.id)}
                        onMouseEnter={() => setHoveredId(tool.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(
                          "relative w-full h-full rounded-xl border flex flex-col items-center justify-center transition-all duration-500 overflow-hidden group",
                          isSelected ? "bg-green-500/30 border-green-400 shadow-[0_0_50px_rgba(34,197,94,0.5)]" : "bg-black/80 border-white/10 hover:border-green-500/40"
                        )}
                      >
                        <NodePulse active={isSelected} color="#22c55e" />
                        <div className={cn("relative z-10 transition-transform duration-500", isSelected && "scale-110")}>
                          {React.createElement(iconMap[tool.icon] || Zap, { className: cn("h-6 w-6 mb-1", isSelected ? "text-white" : "text-green-500/60") })}
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-green-400 transition-colors">{tool.shortName}</span>
                        <FrankenBolt className="absolute -left-1.5 -top-1.5 scale-[0.3] opacity-20" />
                        <FrankenBolt className="absolute -right-1.5 -bottom-1.5 scale-[0.3] opacity-20" />
                      </button>
                    </Magnetic>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* THE AUTOPSY / REPORT SIDE */}
          <div className="relative bg-white/[0.01] flex flex-col h-full min-h-[600px]">
            <div className="absolute top-0 left-0 right-0 h-px bg-white/5 lg:hidden" />
            
            <AnimatePresence mode="wait">
              {selectedTool ? (
                <motion.div 
                  key={selectedTool.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full"
                >
                  {/* Forensic Header */}
                  <div className="p-8 md:p-12 border-b border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 px-3 py-1 rounded-md bg-green-500/10 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        <Microscope className="h-3 w-3 text-green-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-400">Biological_Scan_Active</span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-600">ID: {selectedTool.id.toUpperCase()}</span>
                    </div>

                    <div className="space-y-2">
                      <FrankenGlitch trigger="always" intensity="low">
                        <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">{selectedTool.name}</h3>
                      </FrankenGlitch>
                      <p className="text-xs font-bold text-green-500/60 uppercase tracking-[0.3em]">{selectedTool.tagline}</p>
                    </div>
                  </div>

                  {/* Organ Details */}
                  <div className="flex-1 p-8 md:p-12 space-y-10 custom-scrollbar overflow-y-auto">
                    <div className="grid gap-4">
                      {selectedTool.features.map((f, fi) => (
                        <motion.div 
                          key={f}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: fi * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5 group/organ hover:border-green-500/20 transition-all"
                        >
                          <div className="h-2 w-2 rounded-full bg-green-500/20 group-hover/organ:bg-green-500 group-hover/organ:shadow-[0_0_8px_#22c55e] transition-all" />
                          <span className="text-sm font-medium text-slate-300">{f}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="pt-8 border-t border-white/5 space-y-6">
                      <div className="flex items-center gap-3">
                        <Radio className="h-4 w-4 text-green-500/40 animate-pulse" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Synaptic_Pathways</h4>
                      </div>
                      <div className="grid gap-3">
                        {selectedTool.connectsTo.map(tid => {
                          const target = flywheelTools.find(t => t.id === tid);
                          if (!target) return null;
                          return (
                            <div key={tid} className="flex items-center justify-between p-4 rounded-xl bg-green-500/[0.02] border border-white/5 hover:bg-green-500/[0.05] transition-colors group/path">
                              <span className="text-xs font-bold text-slate-400 group-hover/path:text-green-400 uppercase tracking-tighter">{target.name}</span>
                              <span className="text-[9px] font-mono text-slate-600 italic">{selectedTool.connectionDescriptions[tid]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Extraction Action */}
                  <div className="p-8 md:p-12 border-t border-white/5 bg-black/20">
                    <Magnetic strength={0.2}>
                      <a href={selectedTool.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4 w-full py-5 rounded-2xl bg-green-500 text-black font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:bg-white transition-all active:scale-95">
                        <FlaskConical className="h-4 w-4" />
                        EXTRACT_REPOSITORY_DATA
                      </a>
                    </Magnetic>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col h-full p-12 md:p-16 space-y-12"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Dna className="h-5 w-5 text-green-500 animate-spin-slow" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-green-500/40">Neural_Network_Idle</span>
                    </div>
                    <h3 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                      The AI <br /> <span className="text-animate-green">Flywheel.</span>
                    </h3>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-sm italic opacity-60">
                      &ldquo;{flywheelDescription.subtitle}&rdquo;
                    </p>
                  </div>

                  <div className="p-8 rounded-[2.5rem] border border-white/5 bg-black/40 relative overflow-hidden shadow-inner">
                    <NeuralPulse className="opacity-20" />
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium relative z-10">
                      {flywheelDescription.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-8">
                    <div className="space-y-2">
                      <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Active_Nodes</span>
                      <div className="text-2xl font-black text-white font-mono">{flywheelTools.length}</div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">System_Stability</span>
                      <div className="text-2xl font-black text-green-500 font-mono">NOMINAL</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Global Forensic Overlays */}
        <div className="absolute top-6 right-8 flex items-center gap-4 opacity-20 pointer-events-none">
          <Radio className="h-3 w-3 text-green-500" />
          <span className="text-[8px] font-mono text-green-500 tracking-[0.2em]">SIGNAL_LOCK_ACQUIRED</span>
        </div>
        <div className="absolute bottom-6 left-8 opacity-10 pointer-events-none">
          <FrankenStitch className="w-32" />
        </div>

      </FrankenContainer>

      <BottomSheet isOpen={!!selectedId} onClose={() => setSelectedId(null)} title={selectedTool?.name}>
        {selectedTool && (
          <div className="space-y-10 text-left pb-16">
            <div className="flex items-start gap-6">
              <div className={cn("h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-2xl bg-gradient-to-br", selectedTool.color)}>
                {React.createElement(iconMap[selectedTool.icon] || Zap, { className: "h-8 w-8" })}
              </div>
              <div className="pt-1">
                <h4 className="text-3xl font-black text-white uppercase tracking-tighter italic">{selectedTool.name}</h4>
                <p className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em] mt-2">{selectedTool.tagline}</p>
              </div>
            </div>

            <div className="grid gap-4">
              {selectedTool.features.map(f => (
                <div key={f} className="flex items-center gap-4 text-sm text-slate-300 bg-white/5 p-5 rounded-2xl border border-white/5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                  {f}
                </div>
              ))}
            </div>

            <a href={selectedTool.href} target="_blank" rel="noopener noreferrer" className={cn("flex items-center justify-center gap-4 w-full py-6 rounded-2xl text-black font-black text-sm uppercase tracking-[0.2em] bg-gradient-to-br shadow-2xl", selectedTool.color)}>
              <Radio className="h-4 w-4" /> REPOSITORY_LINK
            </a>
          </div>
        )}
      </BottomSheet>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}