"use client";

import { useMemo, useRef, useState } from "react";
import { Terminal, Cpu, Lock, Shield, Blocks, Sparkles } from "lucide-react";
import type { Feature } from "@/lib/content";
import { cn } from "@/lib/utils";
import { FrankenBolt, FrankenStitch } from "./franken-elements";

const iconMap: Record<string, React.ElementType> = {
  terminal: Terminal,
  cpu: Cpu,
  lock: Lock,
  shield: Shield,
  blocks: Blocks,
  sparkles: Sparkles,
};

export default function FeatureCard({ feature }: { feature: Feature }) {
  const divRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [opacity, setOpacity] = useState(0);
  const isTouchDevice = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches,
    []
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isTouchDevice || !rectRef.current) return;
    const rect = rectRef.current;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice && divRef.current) {
      setOpacity(1);
      rectRef.current = divRef.current.getBoundingClientRect();
    }
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const Icon = iconMap[feature.icon] || Sparkles;

  return (
    <article
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-black/20 p-6 md:p-8",
        "transition-all duration-300 ease-out",
        "hover:bg-black/40 hover:-translate-y-1 hover:scale-[1.015]",
        "hover:border-green-500/30",
        "will-change-transform"
      )}
    >
      <FrankenBolt className="absolute left-2 top-2 z-10 opacity-40 transition-opacity group-hover:opacity-100" />
      <FrankenBolt className="absolute right-2 top-2 z-10 opacity-40 transition-opacity group-hover:opacity-100" />
      <FrankenBolt className="absolute left-2 bottom-2 z-10 opacity-40 transition-opacity group-hover:opacity-100" />
      <FrankenBolt className="absolute right-2 bottom-2 z-10 opacity-40 transition-opacity group-hover:opacity-100" />

      <FrankenStitch className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 opacity-20 group-hover:opacity-40 transition-opacity" />

      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(34, 197, 94, 0.12), transparent 40%)`,
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-green-900/60 bg-gradient-to-br from-green-950/80 to-emerald-900/50 text-green-400 shadow-lg">
          <Icon className="h-5 w-5" />
        </div>

        <h3 className="mt-6 text-xl font-bold leading-tight text-white md:text-2xl">
          {feature.title}
        </h3>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">
          {feature.description}
        </p>
      </div>
    </article>
  );
}
