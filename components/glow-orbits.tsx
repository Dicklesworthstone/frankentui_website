"use client";

import { useEffect, useRef } from "react";

export default function GlowOrbits() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const rings = rootRef.current.querySelectorAll<HTMLElement>(".glow-ring");
    if (rings.length === 0) return;

    const animations: Animation[] = [];

    rings.forEach((ring, i) => {
      const animation = ring.animate(
        [
          { transform: "rotate(0deg) scale(1)" },
          { transform: "rotate(180deg) scale(1.06)" },
          { transform: "rotate(360deg) scale(1)" },
        ],
        {
          duration: 48000 + i * 4000,
          iterations: Infinity,
          easing: "linear",
        }
      );
      animations.push(animation);
    });

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        animations.forEach(a => a.cancel());
      }
    };

    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      animations.forEach(a => a.cancel());
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="glow-ring absolute -top-32 -left-10 h-72 w-72 rounded-[999px] bg-gradient-to-tr from-green-500/40 via-emerald-500/20 to-transparent blur-2xl md:blur-3xl" />
      <div className="glow-ring absolute -bottom-40 -right-4 h-80 w-80 rounded-[999px] bg-gradient-to-tr from-lime-400/40 via-green-500/20 to-transparent blur-2xl md:blur-3xl" />
      <div className="glow-ring absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-[999px] bg-gradient-to-tr from-emerald-500/35 via-green-500/15 to-transparent blur-2xl md:blur-3xl" />
    </div>
  );
}
