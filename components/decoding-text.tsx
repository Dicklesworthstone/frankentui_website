"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * A visceral "scramble" entrance effect that is rock-solid and layout-stable.
 * Ensures scrambled text length matches the original perfectly.
 */
export default function DecodingText({
  text,
  className,
  delay = 0,
  duration = 0.8,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const [displayText, setDisplayText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Numeric characters are more likely to be monospaced in variable fonts
  const characters = "0123456789";

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = (timestamp - startTimeRef.current) / (duration * 1000);

      if (progress >= 1) {
        setDisplayText(text);
        setIsDone(true);
        frameRef.current = null;
        return;
      }

      const iteration = Math.floor(progress * text.length);
      
      const scrambled = text
        .split("")
        .map((char, index) => {
          if (index < iteration) return char;
          if (char === " ") return " ";
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join("");

      setDisplayText(scrambled);
      frameRef.current = requestAnimationFrame(animate);
    },
    [text, duration],
  );

  useEffect(() => {
    // Initial placeholder to prevent layout jumps
    setDisplayText(text.replace(/[^ ]/g, "0"));

    const timeout = setTimeout(() => {
      startTimeRef.current = null;
      frameRef.current = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [delay, animate, text]);

  return (
    <span className={cn("relative inline-block whitespace-pre tabular-nums", className)}>
      {/* Invisible ghost reserves space */}
      <span className="invisible opacity-0 select-none" aria-hidden="true">
        {text}
      </span>

      {/* Visible animated text */}
      <span className="absolute inset-0">
        {displayText}
      </span>
    </span>
  );
}
