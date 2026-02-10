"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * High-end visual interference layer
 * Adds grain, flickering scanlines, and subtle chromatic aberration vibes
 */
export default function SpectralBackground() {
  const isMounted = useSyncExternalStore(noop, () => true, () => false);
  const prefersReducedMotion = useReducedMotion();

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-[-5] pointer-events-none overflow-hidden select-none">
      {/* Film Grain / Static Noise */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.65" 
              numOctaves="3" 
              stitchTiles="stitch" 
            >
              <animate 
                attributeName="baseFrequency" 
                values="0.65;0.68;0.65" 
                dur="2s" 
                repeatCount="indefinite" 
              />
            </feTurbulence>
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Moving Vertical Scanlines */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={prefersReducedMotion ? { opacity: 0.05 } : { opacity: [0.05, 0.08, 0.04, 0.07] }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100%]"
      />

      {/* Horizontal Interference Line */}
      <motion.div
        animate={{
          // Animate with transforms (compositor) instead of `top` (layout).
          y: prefersReducedMotion ? 0 : ["-10vh", "110vh"],
          opacity: prefersReducedMotion ? 0 : [0, 0.3, 0],
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 8,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "linear",
          delay: prefersReducedMotion ? 0 : 2
        }}
        className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[1px]"
      />

      {/* Subtle Light Leak / Organic Glows */}
      <div className="absolute top-0 left-1/4 w-[50%] h-[50%] bg-green-500/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
}
