"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const GLYPHS = "0123456789ABCDEF$#@&*<>[]{}";

/**
 * A technical text component that "decodes" its content.
 * Features an intense neural reveal animation.
 */
export default function DecodingText({
  text,
  className,
  delay = 0,
  duration = 1000,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(text);
      return undefined;
    }

    const startAnimation = () => {
      setIsAnimating(true);
      startTimeRef.current = null;
      frameRef.current = requestAnimationFrame(animate);
    };

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const nextText = text
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";
          const revealThreshold = index / text.length;
          if (progress > revealThreshold) return char;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");

      setDisplayText(nextText);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    const timer = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, delay, duration, prefersReducedMotion]);

  return (
    <span 
      className={cn(
        "inline-block font-mono", 
        isAnimating ? "text-green-400/80" : className
      )}
    >
      {displayText}
    </span>
  );
}