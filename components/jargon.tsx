"use client";

import { useState, useCallback, useMemo } from "react";
import { getJargon, type JargonTerm } from "@/lib/jargon";
import BottomSheet from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";

interface JargonProps {
  term: string;
  children?: React.ReactNode;
}

export default function Jargon({ term, children }: JargonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const entry = useMemo(() => getJargon(term), [term]);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  if (!entry) {
    return <span>{children ?? term}</span>;
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className={cn(
          "relative inline cursor-help border-b border-dashed border-green-500/40 text-green-400",
          "transition-colors hover:border-green-400 hover:text-green-300"
        )}
        title={entry.short}
        aria-label={`Learn more about ${entry.term}`}
      >
        {children ?? entry.term}
      </button>
      <BottomSheet isOpen={isOpen} onClose={handleClose} title={entry.term}>
        <JargonDetail entry={entry} />
      </BottomSheet>
    </>
  );
}

function JargonDetail({ entry }: { entry: JargonTerm }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-white/70">
      <p className="text-base text-white/90">{entry.short}</p>
      <p>{entry.long}</p>
      {entry.analogy && (
        <div className="rounded-lg border border-green-500/10 bg-green-500/5 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-green-400">
            Analogy
          </p>
          <p className="text-white/80">{entry.analogy}</p>
        </div>
      )}
      {entry.why && (
        <div className="rounded-lg border border-lime-500/10 bg-lime-500/5 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-lime-400">
            Why it matters
          </p>
          <p className="text-white/80">{entry.why}</p>
        </div>
      )}
      {entry.related && entry.related.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">
            Related
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.related.map((r) => (
              <span
                key={r}
                className="rounded-full bg-white/5 px-3 py-1 font-mono text-xs text-white/50"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
