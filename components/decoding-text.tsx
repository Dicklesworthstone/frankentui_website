"use client";

import { cn } from "@/lib/utils";

/**
 * A standard, rock-solid text component.
 * No animations, no scrambling, just perfectly visible content.
 */
export default function DecodingText({
  text,
  className,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <span className={cn("inline-block", className)}>
      {text}
    </span>
  );
}