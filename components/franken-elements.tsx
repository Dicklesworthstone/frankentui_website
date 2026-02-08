"use client";

import { cn } from "@/lib/utils";

/**
 * A small industrial bolt-like element for corners
 */
export function FrankenBolt({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-3.5 w-3.5 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden",
        className
      )}
    >
      <div className="h-full w-[1.5px] bg-slate-800/80 rotate-45 absolute" />
      <div className="h-full w-[1.5px] bg-slate-800/80 -rotate-45 absolute" />
    </div>
  );
}

/**
 * Hand-drawn style stitches
 */
export function FrankenStitch({
  className,
  orientation = "horizontal",
  color = "green",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
  color?: "green" | "slate";
}) {
  const strokeColor = color === "green" ? "stroke-green-500/40" : "stroke-slate-500/30";

  if (orientation === "horizontal") {
    return (
      <svg
        width="100%"
        height="12"
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        className={cn("pointer-events-none", className)}
        aria-hidden="true"
      >
        <path
          d="M5 6 L15 6 M10 1 L10 11 M25 6 L35 6 M30 1 L30 11 M45 6 L55 6 M50 1 L50 11 M65 6 L75 6 M70 1 L70 11 M85 6 L95 6 M90 1 L90 11"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={strokeColor}
        />
      </svg>
    );
  }

  return (
    <svg
      width="12"
      height="100%"
      viewBox="0 0 12 100"
      preserveAspectRatio="none"
      className={cn("pointer-events-none", className)}
      aria-hidden="true"
    >
      <path
        d="M6 5 L6 15 M1 10 L11 10 M6 25 L6 35 M1 30 L11 30 M6 45 L6 55 M1 50 L11 50 M6 65 L6 75 M1 70 L11 70 M6 85 L6 95 M1 90 L11 90"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        className={strokeColor}
      />
    </svg>
  );
}

/**
 * A container with bolts and stitches
 */
export function FrankenContainer({
  children,
  className,
  withBolts = true,
  withStitches = true,
}: {
  children: React.ReactNode;
  className?: string;
  withBolts?: boolean;
  withStitches?: boolean;
}) {
  return (
    <div className={cn("relative rounded-2xl border border-white/5 bg-black/20", className)}>
      {withBolts && (
        <>
          <FrankenBolt className="absolute -left-1.5 -top-1.5 z-10" />
          <FrankenBolt className="absolute -right-1.5 -top-1.5 z-10" />
          <FrankenBolt className="absolute -left-1.5 -bottom-1.5 z-10" />
          <FrankenBolt className="absolute -right-1.5 -bottom-1.5 z-10" />
        </>
      )}

      {withStitches && (
        <>
          <FrankenStitch className="absolute top-0 left-1/4 right-1/4 w-1/2" />
          <FrankenStitch className="absolute bottom-0 left-1/4 right-1/4 w-1/2 rotate-180" />
        </>
      )}

      {children}
    </div>
  );
}
