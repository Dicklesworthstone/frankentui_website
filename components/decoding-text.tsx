"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A rock-solid entrance component that ensures text is 100% visible and correctly aligned.
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
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={cn("inline-block", className)}
    >
      {text}
    </motion.span>
  );
}
