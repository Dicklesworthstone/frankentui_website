"use client";

import { motion } from "framer-motion";
import { Activity, Cpu, Shield, Zap } from "lucide-react";

export default function BeadHUD() {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Neural Scanline Effect */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "100%" }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[100px] bg-gradient-to-b from-transparent via-green-500/[0.05] to-transparent z-10"
      />
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "100%" }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-px bg-green-400/20 shadow-[0_0_15px_rgba(34,197,94,0.5)] z-10"
      />

      {/* Corners / Brackets - More technical */}
      <div className="absolute top-2 left-2 h-12 w-12 border-t border-l border-green-500/30" />
      <div className="absolute top-2 right-2 h-12 w-12 border-t border-r border-green-500/30" />
      <div className="absolute bottom-2 left-2 h-12 w-12 border-b border-l border-green-500/30" />
      <div className="absolute bottom-2 right-2 h-12 w-12 border-b border-r border-green-500/30" />

      {/* Telemetry HUD - Compacted and moved to edges */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-4 left-6 flex items-center gap-4"
      >
        <div className="flex items-center gap-2 text-[8px] font-black text-green-500/40 uppercase tracking-[0.2em]">
          <Activity className="h-2.5 w-2.5 animate-pulse" />
          <span>FLUX_ACTIVE</span>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-black text-green-500/40 uppercase tracking-[0.2em]">
          <Cpu className="h-2.5 w-2.5" />
          <span>LOAD_0.02ms</span>
        </div>
      </motion.div>

      {/* Telemetry HUD - Bottom Right */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-4 right-6 flex items-center gap-4"
      >
        <div className="flex items-center gap-2 text-[8px] font-black text-green-500/40 uppercase tracking-[0.2em]">
          <span>INTEGRITY_100%</span>
          <Shield className="h-2.5 w-2.5" />
        </div>
        <div className="flex items-center gap-2 text-[8px] font-black text-green-500/40 uppercase tracking-[0.2em]">
          <span>SYNC_FIXED</span>
          <Zap className="h-2.5 w-2.5" />
        </div>
      </motion.div>

      {/* Static / Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27120%27%20height%3D%27120%27%3E%3Cfilter%20id%3D%27n%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.85%27%20numOctaves%3D%272%27%20stitchTiles%3D%27stitch%27%20seed%3D%272%27/%3E%3C/filter%3E%3Crect%20width%3D%27120%27%20height%3D%27120%27%20filter%3D%27url(%23n)%27/%3E%3C/svg%3E")` }} />
    </div>
  );
}
