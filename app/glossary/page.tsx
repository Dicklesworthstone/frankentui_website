"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, Binary, ArrowRight, X } from "lucide-react";
import { motion } from "framer-motion";
import { getAllJargon, searchJargon, type JargonTerm } from "@/lib/jargon";
import BottomSheet from "@/components/ui/bottom-sheet";
import FrankenEye from "@/components/franken-eye";
import { FrankenContainer } from "@/components/franken-elements";
import FrankenGlitch from "@/components/franken-glitch";
import Streamdown from "@/components/ui/streamdown";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
    <div className="space-y-8 text-sm leading-relaxed text-slate-400">
      <div className="space-y-4 text-left">
        <p className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">{entry.short}</p>
        <div className="text-lg font-medium leading-relaxed">
          <Streamdown content={entry.long} />
        </div>
      </div>

      {entry.analogy && (
        <FrankenContainer withBolts={false} className="glass-modern p-8 bg-green-500/5 text-left border-green-500/20">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-green-400">
            Monster Analogy
          </p>
          <p className="text-slate-200 font-medium leading-relaxed italic text-lg">&ldquo;{entry.analogy}&rdquo;</p>
        </FrankenContainer>
      )}

      {entry.why && (
        <div className="space-y-3 text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            Technical Rationale
          </p>
          <p className="text-slate-300 leading-relaxed font-medium text-base">{entry.why}</p>
        </div>
      )}

      {entry.related && entry.related.length > 0 && (
        <div className="pt-8 border-t border-white/5 text-left">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            Connected Nodes
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.related.map((r) => (
              <span
                key={r}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]"
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
  const [selectedEntry, setSelectedEntry] = useState<[string, JargonTerm] | null>(null);

  const entries = useMemo(
    () => (query.trim() === "" ? getAllJargon() : searchJargon(query)),
    [query]
  );

  const grouped = useMemo(() => groupByLetter(entries), [entries]);
  const totalCount = useMemo(() => getAllJargon().length, []);

  const handleOpen = useCallback((entry: [string, JargonTerm]) => {
    setSelectedEntry(entry);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  return (
    <main id="main-content" className="relative min-h-screen bg-black overflow-x-hidden">
      {/* ── CINEMATIC HEADER ─────────────────────────────────── */}
      <header className="relative pt-44 pb-20 overflow-hidden border-b border-white/5 text-left">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[80px]" />
           <div className="absolute bottom-0 right-[5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[60px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-green-500 mb-8"
            >
              <Binary className="h-3 w-3" />
              Machine Lexicon
            </motion.div>
            
            <FrankenGlitch trigger="random" intensity="low">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8">
                The <br />
                <span className="text-animate-green">
                  Glossary.
                </span>
              </h1>
            </FrankenGlitch>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl leading-relaxed text-left"
            >
              {totalCount}+ technical terms, demystified. 
              The language of the FrankenTUI kernel.
            </motion.p>
          </div>
        </div>

        {/* Floating Peeking Eye */}
        <div className="absolute top-48 right-[10%] hidden lg:block opacity-40 hover:opacity-100 transition-opacity">
          <FrankenEye className="scale-150 rotate-12 shadow-2xl" />
        </div>
      </header>

      {/* ── SEARCH BAR (High-End Interaction) ────────────────── */}
      <div className="sticky top-[88px] z-30 py-6 glass-modern border-x-0 border-t-0 shadow-2xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-green-400 transition-colors" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the machine lexicon..."
              className="w-full h-16 pl-16 pr-8 bg-white/[0.03] border border-white/5 rounded-2xl text-xl font-medium text-white placeholder-slate-600 outline-none focus:border-green-500/30 focus:bg-white/[0.05] transition-all shadow-inner"
            />
            {query && (
              <button 
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-24 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{entries.length} Terms Found</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ALPHABETICAL GRID ────────────────────────────────── */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 text-left">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center opacity-40">
            <Binary className="h-16 w-16 mb-8 text-green-500 animate-pulse" />
            <p className="text-2xl font-black text-white uppercase tracking-widest">No Matches Found</p>
          </div>
        ) : (
          <div className="space-y-32">
            {[...grouped.entries()].map(([letter, items]) => (
              <motion.section 
                key={letter}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="grid lg:grid-cols-12 gap-12"
              >
                {/* Letter Header (Sidebar Style) */}
                <div className="lg:col-span-3">
                  <div className="sticky top-48">
                    <div className="flex items-center gap-4">
                      <span className="text-7xl font-black text-white/10 leading-none select-none tracking-tighter">{letter}</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-green-500/20 to-transparent" />
                    </div>
                    <p className="mt-2 text-[10px] font-black text-green-500 uppercase tracking-[0.4em]">{items.length} Definitions</p>
                  </div>
                </div>

                {/* Term Grid */}
                <div className="lg:col-span-9 grid gap-4 md:grid-cols-2">
                  {items.map(([key, term]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleOpen([key, term])}
                      data-magnetic="true"
                      className="group text-left focus:outline-none"
                    >
                      <FrankenContainer withStitches={false} withPulse={true} className="h-full glass-modern p-8 md:p-10 transition-all duration-500 group-hover:bg-white/[0.03] group-hover:border-green-500/30 group-hover:-translate-y-1 shadow-lg hover:shadow-green-500/5 border-white/5">
                        <div className="flex flex-col h-full items-start">
                          <FrankenGlitch trigger="hover" intensity="low">
                            <h3 className="text-2xl font-black text-white mb-4 group-hover:text-green-400 transition-colors tracking-tight">
                              {term.term}
                            </h3>
                          </FrankenGlitch>
                          <div className="text-base font-medium leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors line-clamp-3 mb-8 flex-1">
                            {term.short}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-green-500 transition-colors">
                            <span>Inspect Spec</span>
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </FrankenContainer>
                    </button>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>

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
