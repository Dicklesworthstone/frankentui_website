"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TerminalLine {
  /** The full text to display for this line */
  text: string;
  /** Style variant for rendering */
  style: "command" | "dim" | "green" | "dashboard-border" | "dashboard-bar" | "dashboard-mixed";
  /** Delay (ms) before this line starts typing */
  delay: number;
  /** Characters typed per interval tick (higher = faster) */
  speed: number;
  /** If true, the line is typed character-by-character; otherwise it appears instantly */
  typed: boolean;
}

/* ------------------------------------------------------------------ */
/*  Script                                                             */
/* ------------------------------------------------------------------ */

const LINES: TerminalLine[] = [
  { text: "$ cargo add ftui", style: "command", delay: 400, speed: 1, typed: true },
  { text: "    Updating crates.io index", style: "dim", delay: 600, speed: 2, typed: false },
  { text: "      Adding ftui v0.1.1 to dependencies", style: "green", delay: 400, speed: 2, typed: false },
  { text: "", style: "dim", delay: 300, speed: 1, typed: false },
  { text: "$ cargo run --example dashboard", style: "command", delay: 600, speed: 1, typed: true },
  { text: "    Compiling ftui v0.1.1", style: "dim", delay: 500, speed: 2, typed: false },
  { text: "     Running target/debug/examples/dashboard", style: "dim", delay: 400, speed: 2, typed: false },
  { text: "", style: "dim", delay: 300, speed: 1, typed: false },
  // ASCII dashboard -- each line appears as a block
  { text: "┌─ Metrics ──────┐┌─ Events ──────────┐", style: "dashboard-border", delay: 200, speed: 3, typed: false },
  { text: "│ CPU    ██▓░  54%││ 14:32 task.done   │", style: "dashboard-mixed", delay: 100, speed: 3, typed: false },
  { text: "│ Memory ███░  71%││ 14:31 deploy.ok   │", style: "dashboard-mixed", delay: 100, speed: 3, typed: false },
  { text: "│ Disk   █░░░  22%││ 14:30 build.pass  │", style: "dashboard-mixed", delay: 100, speed: 3, typed: false },
  { text: "└────────────────┘└───────────────────┘", style: "dashboard-border", delay: 100, speed: 3, typed: false },
];

const TYPING_INTERVAL = 45; // ms per character for typed lines

/* ------------------------------------------------------------------ */
/*  Render helpers                                                     */
/* ------------------------------------------------------------------ */

/** Render a fully-visible line with appropriate colours. */
function renderLine(line: TerminalLine, partial?: string) {
  const content = partial ?? line.text;

  switch (line.style) {
    case "command": {
      // "$ command" -- green prompt, white command text
      if (content.startsWith("$ ")) {
        return (
          <>
            <span className="text-green-400 select-none">$ </span>
            <span className="text-white">{content.slice(2)}</span>
          </>
        );
      }
      return <span className="text-white">{content}</span>;
    }
    case "dim":
      return <span className="text-slate-500">{content}</span>;
    case "green":
      return <span className="text-green-400">{content}</span>;
    case "dashboard-border":
      return <span className="text-green-400">{content}</span>;
    case "dashboard-bar":
      return <span className="text-lime-400">{content}</span>;
    case "dashboard-mixed": {
      // Colourize bar characters and box-drawing differently
      return (
        <span>
          {[...content].map((ch, i) => {
            if ("│┌┐└┘├┤┬┴┼─".includes(ch)) {
              return (
                <span key={i} className="text-green-400">
                  {ch}
                </span>
              );
            }
            if ("█▓▒░".includes(ch)) {
              return (
                <span key={i} className="text-lime-400">
                  {ch}
                </span>
              );
            }
            if (/\d/.test(ch) || ch === "%") {
              return (
                <span key={i} className="text-white">
                  {ch}
                </span>
              );
            }
            return (
              <span key={i} className="text-slate-400">
                {ch}
              </span>
            );
          })}
        </span>
      );
    }
    default:
      return <span className="text-slate-400">{content}</span>;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TerminalDemo() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.2,
    triggerOnce: true,
  });

  // Detect prefers-reduced-motion
  const prefersReducedMotion = usePrefersReducedMotion();

  // Animation state
  const [visibleLineIndex, setVisibleLineIndex] = useState(-1);
  const [currentLineChars, setCurrentLineChars] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);

  const hasStarted = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If reduced motion, skip to the end
  const showFinal = prefersReducedMotion || animationDone;

  // Store advanceLine in a ref to avoid recursive useCallback issues
  const advanceLineRef = useRef<(lineIdx: number) => void>(() => {});

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Keep advanceLine in sync via effect (not during render)
  useEffect(() => {
    advanceLineRef.current = (lineIdx: number) => {
      if (lineIdx >= LINES.length) {
        setAnimationDone(true);
        return;
      }

      const line = LINES[lineIdx];

      // Show this line (starts with 0 visible chars)
      setVisibleLineIndex(lineIdx);
      setCurrentLineChars(0);

      if (!line.typed || line.text.length === 0) {
        // Instant reveal -- show full line, then schedule next
        setCurrentLineChars(line.text.length);
        timerRef.current = setTimeout(() => advanceLineRef.current(lineIdx + 1), line.delay);
      } else {
        // Type character by character
        let charIdx = 0;
        const type = () => {
          charIdx += line.speed;
          if (charIdx >= line.text.length) {
            setCurrentLineChars(line.text.length);
            timerRef.current = setTimeout(() => advanceLineRef.current(lineIdx + 1), line.delay);
          } else {
            setCurrentLineChars(charIdx);
            timerRef.current = setTimeout(type, TYPING_INTERVAL);
          }
        };
        timerRef.current = setTimeout(type, TYPING_INTERVAL);
      }
    };
  });

  useEffect(() => {
    if (!isIntersecting || hasStarted.current) return;
    hasStarted.current = true;

    if (prefersReducedMotion) {
      // Defer state updates to avoid synchronous setState in effect body
      const raf = requestAnimationFrame(() => {
        setVisibleLineIndex(LINES.length - 1);
        setCurrentLineChars(LINES[LINES.length - 1].text.length);
        setAnimationDone(true);
      });
      return () => cancelAnimationFrame(raf);
    }

    // Kick off the sequence after a small initial delay
    timerRef.current = setTimeout(() => advanceLineRef.current(0), 300);
  }, [isIntersecting, prefersReducedMotion]);

  /* ---------------------------------------------------------------- */
  /*  Build rendered lines                                             */
  /* ---------------------------------------------------------------- */

  const renderedLines = useMemo(() => {
    if (showFinal) {
      // Show everything
      return LINES.map((line, i) => (
        <div key={i} className="leading-relaxed whitespace-pre">
          {renderLine(line)}
        </div>
      ));
    }

    const result: React.ReactNode[] = [];

    for (let i = 0; i <= visibleLineIndex && i < LINES.length; i++) {
      const line = LINES[i];
      const isCurrentLine = i === visibleLineIndex;

      if (isCurrentLine && line.typed && currentLineChars < line.text.length) {
        // Partially typed line
        const partial = line.text.slice(0, currentLineChars);
        result.push(
          <div key={i} className="leading-relaxed whitespace-pre">
            {renderLine(line, partial)}
            <span className="animate-pulse text-green-400">|</span>
          </div>
        );
      } else {
        // Fully revealed line
        result.push(
          <div key={i} className="leading-relaxed whitespace-pre">
            {renderLine(line)}
            {/* Show cursor on the current line if it is done but we haven't moved on yet */}
            {isCurrentLine && !animationDone && (
              <span className="animate-pulse text-green-400">|</span>
            )}
          </div>
        );
      }
    }

    // If nothing visible yet, show just a blinking cursor
    if (visibleLineIndex < 0 && !animationDone) {
      result.push(
        <div key="cursor" className="leading-relaxed whitespace-pre">
          <span className="animate-pulse text-green-400">|</span>
        </div>
      );
    }

    return result;
  }, [showFinal, visibleLineIndex, currentLineChars, animationDone]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div ref={ref} className="mx-auto w-full max-w-2xl">
      <div className="glow-green overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-green-950/30">
        {/* ---- Chrome bar ---- */}
        <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs text-slate-600">terminal</span>
        </div>

        {/* ---- Terminal body ---- */}
        <div className="px-5 py-4 font-mono text-xs sm:text-sm min-h-[220px]">
          {renderedLines}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook: prefers-reduced-motion                                       */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
