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
    const drops = useRef<number[]>([]);
    const columns = useRef<number>(0);

    const initDrops = (cols: number) => {
      const newDrops = [...drops.current];
      for (let i = 0; i < cols; i++) {
        if (newDrops[i] === undefined) {
          newDrops[i] = Math.random() * -100;
        }
      }
      drops.current = newDrops.slice(0, cols);
      columns.current = cols;
    };

    const newColumns = Math.floor(width / fontSize);
    initDrops(newColumns);

    let animationFrameId: number;

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(34, 197, 94, 0.12)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.current.length; i++) {
        const text = hexChars[Math.floor(Math.random() * hexChars.length)];
        ctx.fillText(text, i * fontSize, drops.current[i] * fontSize);

        if (drops.current[i] * fontSize > height && Math.random() > 0.975) {
          drops.current[i] = 0;
        }
        drops.current[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const nextCols = Math.floor(width / fontSize);
      if (nextCols !== columns.current) {
        initDrops(nextCols);
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
