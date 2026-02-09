"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Terminal, Activity } from "lucide-react";
import { useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TerminalLine {
  text: string;
  style: "command" | "dim" | "green" | "dashboard-border" | "dashboard-bar" | "dashboard-mixed";
  delay: number;
  speed: number;
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
  { text: "┌─ Metrics ──────┐ ┌─ Events ──────────┐", style: "dashboard-border", delay: 200, speed: 3, typed: false },
  { text: "│ CPU    ██▓░ 54%│ │ 14:32 task.done   │", style: "dashboard-mixed", delay: 100, speed: 3, typed: false },
  { text: "│ Memory ███░ 71%│ │ 14:31 deploy.ok   │", style: "dashboard-mixed", delay: 100, speed: 3, typed: false },
  { text: "│ Disk   █░░░ 22%│ │ 14:30 build.pass  │", style: "dashboard-mixed", delay: 100, speed: 3, typed: false },
  { text: "└────────────────┘ └───────────────────┘", style: "dashboard-border", delay: 100, speed: 3, typed: false },
];

const TYPING_SPEED_BASE = 30; // ms per char

/* ------------------------------------------------------------------ */
/*  Render helpers                                                     */
/* ------------------------------------------------------------------ */

function renderLine(line: TerminalLine, partial?: string) {
  const content = partial ?? line.text;

  switch (line.style) {
    case "command": {
      if (content.startsWith("$ ")) {
        return (
          <>
            <span className="text-green-500 select-none mr-2">$</span>
            <span className="text-white font-bold">{content.slice(2)}</span>
          </>
        );
      }
      return <span className="text-white">{content}</span>;
    }
    case "dim": return <span className="text-slate-600">{content}</span>;
    case "green": return <span className="text-green-400/80">{content}</span>;
    case "dashboard-border": return <span className="text-green-500/60">{content}</span>;
    case "dashboard-mixed": {
      // Batch consecutive characters with the same style into single spans
      const chars = [...content];
      const getClass = (ch: string) => {
        if ("│┌┐└┘├┤┬┴┼─".includes(ch)) return "text-green-500/60";
        if ("█▓▒░".includes(ch)) return "text-green-400";
        if (/\d/.test(ch) || ch === "%") return "text-white font-bold";
        return "text-slate-500";
      };
      const spans: { cls: string; text: string }[] = [];
      for (const ch of chars) {
        const cls = getClass(ch);
        if (spans.length > 0 && spans[spans.length - 1].cls === cls) {
          spans[spans.length - 1].text += ch;
        } else {
          spans.push({ cls, text: ch });
        }
      }
      return (
        <span>
          {spans.map((s, i) => (
            <span key={i} className={s.cls}>{s.text}</span>
          ))}
        </span>
      );
    }
    default: return <span className="text-slate-400">{content}</span>;
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
  const prefersReducedMotion = useReducedMotion();

  const [visibleLineIndex, setVisibleLineIndex] = useState(-1);
  const [currentLineChars, setCurrentLineChars] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const hasStarted = useRef(false);
  const timerRef = useRef<number | null>(null);

  const advanceLine = useCallback(function advanceLineFn(lineIdx: number) {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (lineIdx >= LINES.length) {
      setAnimationDone(true);
      return;
    }

    const line = LINES[lineIdx];

    timerRef.current = window.setTimeout(() => {
      setVisibleLineIndex(lineIdx);
      setCurrentLineChars(0);

      if (!line.typed || line.text.length === 0) {
        setCurrentLineChars(line.text.length);
        advanceLineFn(lineIdx + 1);
        return;
      }

      let charIdx = 0;
      const typeChar = () => {
        charIdx = Math.min(charIdx + line.speed, line.text.length);
        setCurrentLineChars(charIdx);

        if (charIdx < line.text.length) {
          timerRef.current = window.setTimeout(typeChar, TYPING_SPEED_BASE);
        } else {
          advanceLineFn(lineIdx + 1);
        }
      };
      timerRef.current = window.setTimeout(typeChar, TYPING_SPEED_BASE);
    }, line.delay);
  }, []);

  useEffect(() => {
    if (isIntersecting && !hasStarted.current) {
      hasStarted.current = true;
      if (prefersReducedMotion) {
        setVisibleLineIndex(LINES.length - 1);
        setCurrentLineChars(LINES[LINES.length - 1]?.text.length ?? 0);
        setAnimationDone(true);
        return;
      }
      advanceLine(0);
    }
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isIntersecting, advanceLine, prefersReducedMotion]);

  const renderedLines = useMemo(() => {
    const result: React.ReactNode[] = [];
    for (let i = 0; i <= visibleLineIndex && i < LINES.length; i++) {
      const line = LINES[i];
      const isCurrentLine = i === visibleLineIndex;
      const partial = isCurrentLine && line.typed ? line.text.slice(0, currentLineChars) : line.text;
      
      result.push(
        <div key={i} className="flex gap-2 min-h-[1.5em] items-center">
          <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {renderLine(line, partial)}
            {isCurrentLine && !animationDone && (
              <span className="inline-block w-1.5 h-4 bg-green-500 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      );
    }
    return result;
  }, [visibleLineIndex, currentLineChars, animationDone]);

  return (
    <div ref={ref} className="w-full max-w-3xl mx-auto group">
      <div className="relative glass-modern rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-black/60 transition-all duration-700 hover:scale-[1.01] hover:bg-black/80">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Terminal className="h-3 w-3 text-green-500/50" />
              <span className="text-[10px] font-black uppercase tracking-widest">ftui_kernel_stream</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">Live Session</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-8 font-mono text-sm leading-relaxed min-h-[300px] flex flex-col justify-start">
          {renderedLines}
          {visibleLineIndex === -1 && (
             <div className="flex items-center gap-2">
                <span className="text-green-500 select-none">$</span>
                <span className="inline-block w-1.5 h-4 bg-green-500 animate-pulse" />
             </div>
          )}
        </div>

        {/* Status Overlay */}
        <div className="absolute bottom-4 right-6 px-3 py-1 rounded-lg bg-green-500/5 border border-green-500/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
           <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-green-500" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Process Active</span>
           </div>
        </div>
      </div>
    </div>
  );
}
