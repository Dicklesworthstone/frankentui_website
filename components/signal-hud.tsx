"use client";

import { motion } from "framer-motion";
import { Activity, Cpu, Database, Shield, Wifi } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * A persistent HUD that displays "forensic" telemetry in the corners
 * Reactive to page changes and user presence
 */
export default function SignalHUD() {
  const pathname = usePathname();
  const [latency, setLatency] = useState(1.2);
  const [entropy, setEntropy] = useState(0.42);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(1.0 + Math.random() * 0.5);
      setEntropy(Math.random());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const pageSlug =
    pathname === "/" ? "ROOT_NODE" : pathname.split("/").pop()?.toUpperCase() || "UNKNOWN";

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none p-4 md:p-8 hidden sm:block">
      {/* Top Left: Node Info */}
      <div className="absolute top-8 left-8 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 opacity-40">
          <Database className="h-3 w-3 text-green-500" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
            Node_ID:
          </span>
          <span className="text-[8px] font-mono text-green-400 font-bold">{pageSlug}</span>
        </div>
        <div className="h-0.5 w-12 bg-gradient-to-r from-green-500/20 to-transparent" />
      </div>

      {/* Top Right: System Health */}
      <div className="absolute top-8 right-8 flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2 opacity-40">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
            Stability:
          </span>
          <span className="text-[8px] font-mono text-green-400 font-bold">NOMINAL</span>
          <Shield className="h-3 w-3 text-green-500" />
        </div>
        <div className="h-0.5 w-12 bg-gradient-to-l from-green-500/20 to-transparent" />
      </div>

      {/* Bottom Left: Telemetry */}
      <div className="absolute bottom-32 left-8 flex flex-col gap-2">
        <div className="flex items-center gap-3 opacity-30">
          <Activity className="h-3 w-3 text-green-500" />
          <div className="flex flex-col">
            <span className="text-[7px] font-black uppercase tracking-widest text-slate-500">
              Latency
            </span>
            <span className="text-[9px] font-mono text-green-400">{latency.toFixed(2)}ms</span>
          </div>
        </div>
        <div className="flex items-center gap-3 opacity-30">
          <Cpu className="h-3 w-3 text-emerald-500" />
          <div className="flex flex-col">
            <span className="text-[7px] font-black uppercase tracking-widest text-slate-500">
              Entropy
            </span>
            <span className="text-[9px] font-mono text-emerald-400">{entropy.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Right: Connection */}
      <div className="absolute bottom-32 right-8 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 opacity-30">
          <span className="text-[7px] font-black uppercase tracking-widest text-slate-500">
            Signal_Lock
          </span>
          <div className="flex gap-0.5">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                className="h-2 w-0.5 bg-green-500"
              />
            ))}
          </div>
          <Wifi className="h-3 w-3 text-green-500" />
        </div>
      </div>

      {/* Subtle Frame Corners */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-white/10" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-white/10" />
      <div className="absolute bottom-24 left-4 w-6 h-6 border-b border-l border-white/10" />
      <div className="absolute bottom-24 right-4 w-6 h-6 border-b border-r border-white/10" />
    </div>
  );
}
