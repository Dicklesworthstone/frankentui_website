"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A reliable entrance component that replaces the brittle scrambling effect.
 * Ensures text is always legible and perfectly aligned.
 */
export default function DecodingText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: [0.215, 0.61, 0.355, 1.0] 
      }}
      className={cn("inline-block", className)}
    >
      {text}
    </motion.span>
  );
}