"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export default function MemoryDump() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const hexChars = "0123456789ABCDEF";
    const fontSize = 14;
    const colors = ["#22c55e", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e"];
    let columns = Math.floor(width / fontSize);
    let drops: number[] = [];
    let columnColors: string[] = [];
    let columnSpeeds: number[] = [];

    const initDrops = (cols: number, existingDrops: number[] = []) => {
      const newDrops = [...existingDrops];
      const newColors = [...columnColors];
      const newSpeeds = [...columnSpeeds];
      
      for (let i = 0; i < cols; i++) {
        if (newDrops[i] === undefined) {
          newDrops[i] = Math.random() * -100;
          newColors[i] = colors[Math.floor(Math.random() * colors.length)];
          newSpeeds[i] = 0.5 + Math.random() * 1.5;
        }
      }
      
      columnColors = newColors.slice(0, cols);
      columnSpeeds = newSpeeds.slice(0, cols);
      return newDrops.slice(0, cols);
    };

    drops = initDrops(columns);

    let animationFrameId: number;

    const draw = () => {
      // Very faint trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = hexChars[Math.floor(Math.random() * hexChars.length)];
        
        // Stutter/Glitch effect: occasionally change color or speed
        if (Math.random() > 0.99) {
          columnColors[i] = colors[Math.floor(Math.random() * colors.length)];
        }
        
        // Draw the character
        ctx.fillStyle = columnColors[i] + "33"; // 20% opacity
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Leading character is brighter
        ctx.fillStyle = columnColors[i] + "aa"; // 66% opacity
        ctx.fillText(text, i * fontSize, (drops[i] - 1) * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.985) {
          drops[i] = 0;
          columnSpeeds[i] = 0.5 + Math.random() * 1.5;
        }
        
        // Apply speed with occasional small jumps (glitches)
        const glitch = Math.random() > 0.999 ? 5 : 0;
        drops[i] += columnSpeeds[i] + glitch;
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const newColumns = Math.floor(width / fontSize);
      if (newColumns !== columns) {
        drops = initDrops(newColumns, drops);
        columns = newColumns;
      }
    };

    window.addEventListener("resize", handleResize);
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-20 pointer-events-none opacity-30"
    />
  );
}
