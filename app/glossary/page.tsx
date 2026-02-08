"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, BookOpen } from "lucide-react";
import { getAllJargon, searchJargon, type JargonTerm } from "@/lib/jargon";
import BottomSheet from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import FrankenEye from "@/components/franken-eye";
import { FrankenContainer } from "@/components/franken-elements";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Group an array of [key, term] entries by the uppercase first letter of the term name. */
function groupByLetter(
  entries: [string, JargonTerm][]
): Map<string, [string, JargonTerm][]> {
  const groups = new Map<string, [string, JargonTerm][]>();
  for (const entry of entries) {
    const letter = entry[1].term.charAt(0).toUpperCase();
    const bucket = letter.match(/[A-Z]/) ? letter : "#";
    if (!groups.has(bucket)) groups.set(bucket, []);
    groups.get(bucket)!.push(entry);
  }
  // Sort keys alphabetically, with "#" (non-alpha) at the end
  return new Map(
    [...groups.entries()].sort(([a], [b]) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b);
    })
  );
}

// ---------------------------------------------------------------------------
// Detail pane rendered inside the BottomSheet
// ---------------------------------------------------------------------------

function TermDetail({ entry }: { entry: JargonTerm }) {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-white/70">
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

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<
    [string, JargonTerm] | null
  >(null);

  // Compute matching entries (all when no query)
  const entries = useMemo(
    () => (query.trim() === "" ? getAllJargon() : searchJargon(query)),
    [query]
  );

  // Group by first letter for alphabet nav
  const grouped = useMemo(() => groupByLetter(entries), [entries]);

  const totalCount = useMemo(() => getAllJargon().length, []);

  const handleOpen = useCallback((entry: [string, JargonTerm]) => {
    setSelectedEntry(entry);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  return (
    <main id="main-content" className="relative min-h-screen bg-[#020a02]">
      {/* ------------------------------------------------------------------ */}
      {/* Background glow */}
      {/* ------------------------------------------------------------------ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-48 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-green-500/[0.04] blur-[120px]" />
        
        {/* Peeking eyes */}
        <div className="absolute top-28 left-1/4 hidden md:block opacity-20 hover:opacity-100 transition-opacity">
          <FrankenEye className="rotate-[-10deg] scale-75" />
        </div>
        <div className="absolute top-44 right-1/4 hidden md:block opacity-10 hover:opacity-100 transition-opacity">
          <FrankenEye className="rotate-[15deg] scale-90" />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <header className="relative mx-auto max-w-7xl px-4 pb-8 pt-28 sm:px-6 md:pt-36 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px w-6 bg-gradient-to-r from-green-500/80 to-transparent" />
          <p className="text-xs font-bold uppercase tracking-widest text-green-400/90">
            Reference
          </p>
        </div>

        <div className="flex items-start gap-5 md:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-green-900/60 bg-gradient-to-br from-green-950/80 to-emerald-900/50 text-green-400 shadow-lg shadow-green-900/10 backdrop-blur-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1
            className="font-bold tracking-tighter text-white"
            style={{ fontSize: "clamp(1.875rem, 5vw, 3.75rem)" }}
          >
            Glossary
          </h1>
        </div>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400/90 md:ml-1 md:text-xl md:leading-relaxed">
          {totalCount}+ terminal UI terms, demystified. Search by name,
          keyword, or concept.
        </p>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Search + count */}
      {/* ------------------------------------------------------------------ */}
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#020a02]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search terms..."
              aria-label="Search glossary terms"
              className={cn(
                "h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none",
                "transition-all duration-200",
                "focus:border-green-500/40 focus:ring-2 focus:ring-green-500/20 focus:bg-white/[0.05]"
              )}
            />
          </div>
          <span className="shrink-0 font-mono text-xs tabular-nums text-white/30">
            {entries.length}
            {entries.length !== totalCount && ` / ${totalCount}`}
            {entries.length === 1 ? " term" : " terms"}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Letter groups + term grid */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Search className="mb-4 h-10 w-10 text-white/10" aria-hidden />
            <p className="text-lg font-medium text-white/30">
              No terms match &ldquo;{query}&rdquo;
            </p>
            <p className="mt-1 text-sm text-white/20">
              Try a different search or browse all terms.
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            {[...grouped.entries()].map(([letter, items]) => (
              <section key={letter} aria-label={`Terms starting with ${letter}`}>
                {/* Letter header */}
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/5 font-mono text-sm font-bold text-green-400">
                    {letter}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-green-500/10 to-transparent" />
                  <span className="font-mono text-xs text-white/20">
                    {items.length}
                  </span>
                </div>

                {/* Card grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(([key, term]) => (
                    <button
                      key={key}
                      onClick={() => handleOpen([key, term])}
                      className="group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020a02]"
                      aria-label={`View details for ${term.term}`}
                    >
                      <FrankenContainer withStitches={false} className="h-full bg-white/[0.02] p-5 transition-all group-hover:border-green-500/20 group-hover:bg-green-500/[0.04] group-hover:shadow-lg group-hover:shadow-green-900/5">
                        <div className="flex flex-col h-full items-start gap-2">
                          <h3 className="font-mono text-sm font-bold text-green-400 transition-colors group-hover:text-green-300">
                            {term.term}
                          </h3>
                          <p className="line-clamp-2 text-sm leading-relaxed text-white/50 transition-colors group-hover:text-white/60">
                            {term.short}
                          </p>
                          {/* Subtle expand hint */}
                          <span
                            aria-hidden
                            className="mt-auto pt-1 font-mono text-[10px] uppercase tracking-widest text-white/15 transition-colors group-hover:text-green-500/40"
                          >
                            tap to expand
                          </span>
                        </div>
                      </FrankenContainer>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Detail BottomSheet */}
      {/* ------------------------------------------------------------------ */}
      <BottomSheet
        isOpen={selectedEntry !== null}
        onClose={handleClose}
        title={selectedEntry?.[1].term}
      >
        {selectedEntry && <TermDetail entry={selectedEntry[1]} />}
      </BottomSheet>
    </main>
  );
}
