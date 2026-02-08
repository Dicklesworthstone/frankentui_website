"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function FrankenEye({ className }: { className?: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current) return;
      const rect = eyeRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const distance = Math.min(rect.width / 4, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 10);
      
      setMousePos({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={eyeRef}
      className={cn(
        "relative h-12 w-12 rounded-full bg-white border-2 border-slate-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] overflow-hidden flex items-center justify-center",
        className
      )}
    >
      {/* Sclera / Whites of the eye */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_#fff_0%,_#e2e8f0_100%)]" />
      
      {/* Iris + Pupil group */}
      <div 
        className="relative h-6 w-6 rounded-full bg-green-500 border border-green-700 flex items-center justify-center transition-transform duration-75 ease-out"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      >
        {/* Iris pattern */}
        <div className="absolute inset-0 bg-[repeating-conic-gradient(from_0deg,_transparent_0deg_10deg,_rgba(0,0,0,0.1)_10deg_20deg)] opacity-40 rounded-full" />
        
        {/* Pupil */}
        <div className="h-3 w-3 rounded-full bg-slate-950" />
        
        {/* Shine */}
        <div className="absolute top-1 left-1 h-1.5 w-1.5 rounded-full bg-white/60" />
      </div>
      
      {/* Eyelids / Shadow overlay */}
      <div className="absolute inset-0 shadow-[inset_0_4px_8px_rgba(0,0,0,0.2)] pointer-events-none rounded-full" />
    </div>
  );
}
