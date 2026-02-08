"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Download,
  Filter,
  HelpCircle,
  Info,
  Link2,
  Pause,
  Play,
  Search,
  Terminal,
  X,
} from "lucide-react";

import styles from "./spec-evolution-lab.module.css";
import { FrankenBolt, FrankenStitch, NeuralPulse, FrankenContainer } from "./franken-elements";
import FrankenGlitch from "./franken-glitch";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  buildCorpusText,
  computeEditDistanceLines,
  computeFileChangeSummary,
  computePerFileContribution,
  computeTextStats,
  myersDiffTextLines,
  type DiffOp,
  type PerFileContribution,
} from "@/lib/spec-evolution-compare";
import { LRUCache } from "@/lib/lru-cache";
import {
  CorpusIndex,
  searchSingleCommit,
  type SearchHit,
  type SearchScope,
  type IndexProgress,
} from "@/lib/spec-evolution-search";
import {
  buildTimelineData,
  playbackIntervalMs,
  positionToCommitIndex,
  commitIndexToPosition,
  PLAYBACK_SPEEDS,
  type PlaybackSpeed,
} from "@/lib/spec-evolution-timeline";

type BucketKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type BucketMode = "day" | "hour" | "15m" | "5m";
type MetricKey = "groups" | "lines" | "patchBytes";
type TabKey = "diff" | "snapshot" | "raw" | "ledger" | "files";
type DiffFormat = "unified" | "sideBySide";
type DiffSource = "commitPatch" | "corpusAB";

type NumStat = { path: string; added: number; deleted: number };
type Author = { name: string; email: string };

type ReviewGroup = {
  title?: string;
  buckets?: number[];
  confidence?: number;
  rationale?: string;
  evidence?: string[];
};

type Review = {
  groups?: ReviewGroup[];
  notes?: string[];
};

type SnapshotMeta = { lines: number; words: number; bytes: number };

type Commit = {
  sha: string;
  short: string;
  epoch: number;
  date: string;
  subject?: string;
  author?: Author;
  numstat: NumStat[];
  totals: { added: number; deleted: number; files: number };
  patch: string;
  files: { path: string; content: string }[];
  snapshot?: SnapshotMeta;
  review?: Review | null;
};

type Dataset = {
  generated_at: string;
  scope_paths: string[];
  bucket_defs: Record<string, string>;
  commits: Commit[];
};

type CommitView = Commit & {
  idx: number;
  reviewed: boolean;
  dateShort: string;
  bucketMask: number; // bit i indicates bucket i is present
  magnitude: { groups: number; lines: number; patchBytes: number };
};

const BUCKET_KEYS: BucketKey[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const bucketColors: Record<BucketKey, string> = {
  0: "#64748b",
  1: "#fb7185",
  2: "#fbbf24",
  3: "#60a5fa",
  4: "#a78bfa",
  5: "#94a3b8",
  6: "#34d399",
  7: "#22c55e",
  8: "#06b6d4",
  9: "#cbd5e1",
  10: "#e2e8f0",
};

const bucketNames: Record<BucketKey, string> = {
  0: "Unreviewed",
  1: "Logic / Math Fixes",
  2: "FTUI Codebase Accuracy",
  3: "External Ecosystem Accuracy",
  4: "Concept / Architecture",
  5: "Scrivening / Ministerial",
  6: "Background / Context",
  7: "Engineering Improvements",
  8: "Alien Artifact",
  9: "Elaboration",
  10: "Other",
};

function clampInt(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/* ------------------------------------------------------------------ */
/*  Performance Hardening: caches + perf timing                       */
/* ------------------------------------------------------------------ */

// Module-level caches (survive re-renders, cleared on hot-reload)
const markdownHtmlCache = new LRUCache<string>(16);
const patchParseCache = new LRUCache<PatchFile[]>(32);
const snapshotMdCache = new LRUCache<string>(32);
const corpusIndex = new CorpusIndex();

type PerfEntry = { label: string; ms: number; ts: number };
const perfLog: PerfEntry[] = [];
const PERF_LOG_MAX = 200;

function perfTime<T>(label: string, fn: () => T): T {
  const t0 = performance.now();
  const result = fn();
  const ms = performance.now() - t0;
  perfLog.push({ label, ms, ts: Date.now() });
  if (perfLog.length > PERF_LOG_MAX) perfLog.splice(0, perfLog.length - PERF_LOG_MAX);
  return result;
}

/* ------------------------------------------------------------------ */
/*  Deep-Linkable State: URL Hash Encoding / Decoding                 */
/* ------------------------------------------------------------------ */

type HashState = {
  commitShort?: string;
  tab?: TabKey;
  file?: string;
  diffFmt?: DiffFormat;
  query?: string;
  reviewedOnly?: boolean;
  bucket?: BucketKey | null;
};

const VALID_TABS: readonly TabKey[] = ["diff", "snapshot", "raw", "ledger", "files"];
const VALID_DIFF_FMTS: readonly DiffFormat[] = ["unified", "sideBySide"];

function encodeHashState(state: HashState): string {
  const params = new URLSearchParams();
  if (state.commitShort) params.set("c", state.commitShort);
  if (state.tab && state.tab !== "diff") params.set("tab", state.tab);
  if (state.file && state.file !== "__ALL__") params.set("f", state.file);
  if (state.diffFmt && state.diffFmt !== "unified") params.set("d", state.diffFmt);
  if (state.query) params.set("q", state.query);
  if (state.reviewedOnly) params.set("ro", "1");
  if (state.bucket !== null && state.bucket !== undefined) params.set("b", String(state.bucket));
  const str = params.toString();
  return str ? `#${str}` : "";
}

function decodeHashState(hash: string): HashState {
  try {
    const raw = hash.startsWith("#") ? hash.slice(1) : hash;
    if (!raw) return {};
    const params = new URLSearchParams(raw);
    const state: HashState = {};

    const c = params.get("c");
    if (c) state.commitShort = c;

    const tab = params.get("tab");
    if (tab && (VALID_TABS as readonly string[]).includes(tab)) state.tab = tab as TabKey;

    const f = params.get("f");
    if (f) state.file = f;

    const d = params.get("d");
    if (d && (VALID_DIFF_FMTS as readonly string[]).includes(d)) state.diffFmt = d as DiffFormat;

    const q = params.get("q");
    if (q) state.query = q;

    const ro = params.get("ro");
    if (ro === "1") state.reviewedOnly = true;

    const b = params.get("b");
    if (b !== null) {
      const bNum = parseInt(b, 10);
      if (!isNaN(bNum) && bNum >= 0 && bNum <= 10) state.bucket = bNum as BucketKey;
    }

    return state;
  } catch {
    return {};
  }
}

function hasBucket(mask: number, b: BucketKey) {
  return (mask & (1 << b)) !== 0;
}

function computeCommitBucketMask(c: Commit): number {
  const groups = c.review?.groups || null;
  if (!groups) return 1 << 0;
  let mask = 0;
  for (const g of groups) {
    const buckets = g.buckets || [];
    if (!buckets.length) {
      mask |= 1 << 10;
      continue;
    }
    for (const b of buckets) {
      if (typeof b !== "number") continue;
      if (b < 0 || b > 10) continue;
      mask |= 1 << b;
    }
  }
  if (mask === 0) mask |= 1 << 10;
  return mask;
}

function bucketKey(commit: CommitView, mode: BucketMode) {
  // Uses commit's own ISO-with-offset string as stable wall-clock key.
  const iso = commit.date;
  const day = iso.slice(0, 10);
  const hour = iso.slice(11, 13);
  const minute = parseInt(iso.slice(14, 16), 10);

  if (mode === "day") return day;
  if (mode === "hour") return `${day} ${hour}:00`;
  if (mode === "15m") {
    const mm = String(Math.floor(minute / 15) * 15).padStart(2, "0");
    return `${day} ${hour}:${mm}`;
  }
  if (mode === "5m") {
    const mm = String(Math.floor(minute / 5) * 5).padStart(2, "0");
    return `${day} ${hour}:${mm}`;
  }
  return day;
}

function perCommitBucketWeights(commit: CommitView, softMode: boolean): Record<number, number> {
  // Metric: change-groups. Soft assignment spreads 1 group across its bucket labels.
  if (!commit.review) return { 0: 1 };
  const out: Record<number, number> = {};
  const groups = commit.review.groups || [];
  for (const g of groups) {
    const buckets = g.buckets || [];
    if (!buckets.length) {
      out[10] = (out[10] || 0) + 1;
      continue;
    }
    if (softMode) {
      const w = 1 / buckets.length;
      for (const b of buckets) out[b] = (out[b] || 0) + w;
    } else {
      for (const b of buckets) out[b] = (out[b] || 0) + 1;
    }
  }
  return out;
}

function perCommitBucketMagnitude(commit: CommitView, metric: MetricKey, softMode: boolean): Record<number, number> {
  // Metric: lines or patchBytes. Distribute per-commit magnitude across groups, then across bucket labels.
  const magnitude = commit.magnitude[metric] ?? 0;
  if (!commit.review) return { 0: magnitude };
  const groups = commit.review.groups || [];
  const groupsN = Math.max(1, groups.length);
  const perGroup = magnitude / groupsN;

  const out: Record<number, number> = {};
  for (const g of groups) {
    const buckets = g.buckets || [];
    if (!buckets.length) {
      out[10] = (out[10] || 0) + perGroup;
      continue;
    }
    if (softMode) {
      const w = perGroup / buckets.length;
      for (const b of buckets) out[b] = (out[b] || 0) + w;
    } else {
      for (const b of buckets) out[b] = (out[b] || 0) + perGroup;
    }
  }
  return out;
}

function buildSnapshotMarkdown(c: CommitView, fileChoice: string) {
  if (fileChoice && fileChoice !== "__ALL__") {
    const f = c.files.find((x) => x.path === fileChoice);
    if (!f) return "";
    return `# ${f.path}\n\n${f.content}`;
  }

  const parts: string[] = [];
  parts.push(`# FrankenTUI Spec Corpus (snapshot)\n`);
  for (const f of c.files) {
    parts.push(`\n---\n\n## ${f.path}\n\n${f.content}`);
  }
  return parts.join("\n");
}

type PatchLineKind = "meta" | "hunk" | "context" | "add" | "del";
type PatchLine = { kind: PatchLineKind; text: string };
type PatchHunk = { header: string; lines: PatchLine[] };
type PatchFile = { pathA: string; pathB: string; headerLines: PatchLine[]; hunks: PatchHunk[] };

function parseGitPatch(patch: string): PatchFile[] {
  const lines = patch.split("\n");
  const files: PatchFile[] = [];
  let currentFile: PatchFile | null = null;
  let currentHunk: PatchHunk | null = null;

  const flushFile = () => {
    if (!currentFile) return;
    files.push(currentFile);
    currentFile = null;
    currentHunk = null;
  };

  for (const line of lines) {
    if (line.startsWith("diff --git ")) {
      flushFile();
      const m = /^diff --git a\/(.+?) b\/(.+)$/.exec(line);
      const pathA = m?.[1] ?? "unknown";
      const pathB = m?.[2] ?? "unknown";
      currentFile = { pathA, pathB, headerLines: [{ kind: "meta", text: line }], hunks: [] };
      currentHunk = null;
      continue;
    }

    if (!currentFile) continue;

    if (line.startsWith("@@")) {
      currentHunk = { header: line, lines: [] };
      currentFile.hunks.push(currentHunk);
      continue;
    }

    const kind: PatchLineKind =
      line.startsWith("+") && !line.startsWith("+++")
        ? "add"
        : line.startsWith("-") && !line.startsWith("---")
          ? "del"
          : line.startsWith(" ")
            ? "context"
            : "meta";

    const pl: PatchLine = { kind, text: line };
    if (currentHunk) currentHunk.lines.push(pl);
    else currentFile.headerLines.push(pl);
  }

  flushFile();
  return files;
}

function parseHunkHeader(header: string): { oldStart: number; newStart: number } | null {
  const m = /@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(header);
  if (!m) return null;
  return { oldStart: parseInt(m[1], 10), newStart: parseInt(m[3], 10) };
}

type SideCell = { kind: "context" | "add" | "del" | "empty"; lineNo?: number; text?: string };
type SideRow = { left: SideCell; right: SideCell };

function hunkToSideBySideRows(hunk: PatchHunk): SideRow[] {
  const start = parseHunkHeader(hunk.header);
  let oldLine = start?.oldStart ?? 0;
  let newLine = start?.newStart ?? 0;

  const rows: SideRow[] = [];
  const dels: PatchLine[] = [];
  const adds: PatchLine[] = [];

  const flush = () => {
    while (dels.length || adds.length) {
      const dl = dels.shift() || null;
      const al = adds.shift() || null;

      const left: SideCell = dl
        ? { kind: "del", lineNo: oldLine++, text: dl.text.slice(1) }
        : { kind: "empty" };
      const right: SideCell = al
        ? { kind: "add", lineNo: newLine++, text: al.text.slice(1) }
        : { kind: "empty" };
      rows.push({ left, right });
    }
  };

  for (const l of hunk.lines) {
    if (l.kind === "del") {
      dels.push(l);
      continue;
    }
    if (l.kind === "add") {
      adds.push(l);
      continue;
    }
    flush();
    if (l.kind === "context") {
      const text = l.text.slice(1);
      rows.push({
        left: { kind: "context", lineNo: oldLine++, text },
        right: { kind: "context", lineNo: newLine++, text },
      });
      continue;
    }
    // meta inside hunk
    rows.push({
      left: { kind: "empty" },
      right: { kind: "empty" },
    });
  }
  flush();
  return rows;
}

function corpusOpsToSideBySideRows(ops: DiffOp[]): SideRow[] {
  let leftLine = 1;
  let rightLine = 1;
  return ops.map((op) => {
    if (op.kind === "equal") {
      const text = op.text;
      return {
        left: { kind: "context", lineNo: leftLine++, text },
        right: { kind: "context", lineNo: rightLine++, text },
      };
    }
    if (op.kind === "del") {
      const text = op.text;
      return {
        left: { kind: "del", lineNo: leftLine++, text },
        right: { kind: "empty" },
      };
    }
    // add
    return {
      left: { kind: "empty" },
      right: { kind: "add", lineNo: rightLine++, text: op.text },
    };
  });
}

function enhanceMarkdownTables(root: HTMLElement | null) {
  if (!root) return;
  const tables = root.querySelectorAll("table");
  tables.forEach((table) => {
    table.classList.add("responsiveTable");

    const headers: string[] = [];
    const thead = table.querySelectorAll("thead th");
    if (thead.length) {
      thead.forEach((th) => headers.push((th.textContent || "").trim()));
    } else {
      const firstRow = table.querySelector("tr");
      if (firstRow) {
        firstRow.querySelectorAll("th, td").forEach((cell) => headers.push((cell.textContent || "").trim()));
      }
    }
    if (!headers.length) return;

    table.querySelectorAll("tbody tr").forEach((tr) => {
      const cells = tr.querySelectorAll("th, td");
      cells.forEach((cell, idx) => {
        const label = headers[idx] || "";
        cell.setAttribute("data-label", label);
      });
    });
  });
}

function formatMetricLabel(metric: MetricKey) {
  if (metric === "groups") return "change-groups";
  if (metric === "lines") return "lines changed (+/-)";
  return "patch bytes";
}

function downloadObjectAsJson(obj: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function BucketChip({
  bucket,
  showLabel = true,
  onClick,
}: {
  bucket: BucketKey;
  showLabel?: boolean;
  onClick?: () => void;
}) {
  const name = bucketNames[bucket] || `Bucket ${bucket}`;
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-white/10 transition-colors hover:border-green-500/30"
      title={name}
      onClick={onClick}
    >
      <span className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: bucketColors[bucket], color: bucketColors[bucket] }} />
      <span className="font-mono">{bucket}</span>
      {showLabel ? <span className="hidden sm:inline text-slate-400 font-medium">{name}</span> : null}
    </button>
  );
}

function DialogShell({
  dialogRef,
  title,
  subtitle,
  children,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <dialog
      ref={dialogRef}
      className="w-[min(820px,92vw)] rounded-3xl border border-green-500/20 bg-[#020508] p-0 text-slate-100 shadow-[0_0_80px_-20px_rgba(34,197,94,0.3)] backdrop:bg-black/80 backdrop:backdrop-blur-sm overflow-hidden"
    >
      <div className="relative">
        <FrankenBolt className="absolute -left-1.5 -top-1.5 z-20 scale-75" />
        <FrankenBolt className="absolute -right-1.5 -top-1.5 z-20 scale-75" />
        <div className="flex items-start justify-between gap-3 border-b border-white/5 bg-white/5 p-6">
          <div className="min-w-0">
            <h3 className="text-xl font-black tracking-tight text-white">{title}</h3>
            {subtitle ? <p className="mt-1.5 text-xs font-medium text-slate-500 uppercase tracking-widest">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">{children}</div>
        <FrankenStitch className="absolute bottom-0 left-1/4 right-1/4 w-1/2 opacity-20" />
      </div>
    </dialog>
  );
}

function StackedBars({
  xKeys,
  seriesByBucket,
  focusBucket,
  onSelectKey,
}: {
  xKeys: string[];
  seriesByBucket: Record<BucketKey, number[]>;
  focusBucket: BucketKey | null;
  onSelectKey: (k: string) => void;
}) {
  // Pure SVG stacked bars (small n, avoids pulling in heavy chart libs).
  const height = 340;
  const barW = 28;
  const gap = 10;
  const margin = { top: 20, right: 20, bottom: 60, left: 40 };
  const innerH = height - margin.top - margin.bottom;
  const width = Math.max(720, margin.left + margin.right + xKeys.length * (barW + gap));

  const totals = xKeys.map((_, idx) => {
    let sum = 0;
    for (const b of BUCKET_KEYS) sum += seriesByBucket[b][idx] || 0;
    return sum;
  });
  const maxTotal = Math.max(1, ...totals);

  const yTicks = 5;
  const tickVals = new Array(yTicks + 1).fill(0).map((_, i) => (maxTotal * i) / yTicks);

  return (
    <div className="overflow-x-auto custom-scrollbar pb-4">
      <svg
        width={width}
        height={height}
        className="block"
        role="img"
        aria-label="Stacked bar chart of revision buckets over time"
      >
        <defs>
          <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Dynamic gradients for each bucket */}
          {BUCKET_KEYS.map((b) => (
            <linearGradient key={`grad-${b}`} id={`grad-${b}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={bucketColors[b]} stopOpacity="1" />
              <stop offset="100%" stopColor={bucketColors[b]} stopOpacity="0.6" />
            </linearGradient>
          ))}
        </defs>

        {/* grid + y axis */}
        {tickVals.map((v, i) => {
          const y = margin.top + innerH - (v / maxTotal) * innerH;
          return (
            <g key={i}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.04)"
                strokeDasharray="2 4"
              />
              <text
                x={margin.left - 12}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fontWeight="800"
                fontFamily="var(--font-mono)"
                fill="rgba(148,163,184,0.4)"
              >
                {Math.round(v * 10) / 10}
              </text>
            </g>
          );
        })}

        {/* bars */}
        {xKeys.map((k, idx) => {
          const x = margin.left + idx * (barW + gap);
          let y = margin.top + innerH;
          return (
            <g
              key={k}
              className="cursor-pointer group/bar outline-none"
              onClick={() => onSelectKey(k)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectKey(k);
              }}
              tabIndex={0}
              role="button"
              aria-label={`Select bucket ${k}`}
            >
              {BUCKET_KEYS.map((b) => {
                const v = seriesByBucket[b][idx] || 0;
                const h = (v / maxTotal) * innerH;
                y -= h;
                if (h <= 0.5) return null;
                const isFocused = focusBucket === null || b === focusBucket;
                
                return (
                  <motion.rect
                    key={b}
                    initial={{ height: 0, y: margin.top + innerH }}
                    animate={{ height: h, y: y }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: idx * 0.01 + b * 0.02 }}
                    x={x}
                    width={barW}
                    rx={2}
                    fill={`url(#grad-${b})`}
                    opacity={isFocused ? 0.8 : 0.1}
                    style={{ filter: isFocused ? "url(#barGlow)" : "none" }}
                    className="transition-opacity duration-500 group-hover/bar:opacity-100"
                  />
                );
              })}

              {/* x label */}
              <text
                x={x + barW / 2}
                y={height - 20}
                textAnchor="middle"
                fontSize={9}
                fontWeight="900"
                fontFamily="var(--font-mono)"
                fill="rgba(148,163,184,0.5)"
                className="group-hover/bar:fill-green-400 transition-colors tracking-tighter"
                transform={xKeys.length > 12 ? `rotate(35, ${x + barW / 2}, ${height - 20})` : undefined}
              >
                {k}
              </text>
              
              {/* Hover highlight overlay */}
              <rect
                x={x - 2}
                y={margin.top}
                width={barW + 4}
                height={innerH}
                fill="rgba(34,197,94,0.03)"
                className="opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none rounded-t-lg"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function MarkdownView({ markdown }: { markdown: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hljsRef = useRef<{ highlightElement: (el: HTMLElement) => void } | null>(null);
  const [html, setHtml] = useState<string>("");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setErr("");

    // Check LRU cache first to avoid re-parsing identical markdown
    const cacheKey = markdown;
    const cached = markdownHtmlCache.get(cacheKey);
    if (cached !== undefined) {
      setHtml(cached);
      return;
    }

    setHtml("");

    (async () => {
      try {
        const [{ marked }, { default: DOMPurify }, { default: hljs }] = await Promise.all([
          import("marked"),
          import("dompurify"),
          import("highlight.js"),
        ]);

        hljsRef.current = hljs;

        marked.setOptions({
          gfm: true,
          breaks: false,
        } as Parameters<typeof marked.setOptions>[0]);

        const rawHtml = await marked.parse(markdown);
        const safeHtml = DOMPurify.sanitize(String(rawHtml), { USE_PROFILES: { html: true } });
        if (!cancelled) {
          const result = String(safeHtml);
          markdownHtmlCache.set(cacheKey, result);
          setHtml(result);
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [markdown]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    enhanceMarkdownTables(root);

    const hljs = hljsRef.current;
    if (!hljs) return;

    // Best-effort syntax highlighting; never fail the render.
    root.querySelectorAll("pre code").forEach((el) => {
      const codeEl = el as HTMLElement;
      if (codeEl.dataset.hljsDone === "1") return;
      try {
        hljs.highlightElement(codeEl);
        codeEl.dataset.hljsDone = "1";
      } catch {
        // ignore
      }
    });
  }, [html]);

  if (err) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-200">
        Failed to render markdown: <span className="font-mono">{err}</span>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={clsx(
        "rounded-2xl border border-white/5 bg-black/40 p-6 md:p-8 overflow-auto max-h-[72vh] custom-scrollbar selection:bg-green-500/30",
        styles.mdProse
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function SpecEvolutionLab() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [commits, setCommits] = useState<CommitView[]>([]);
  const [loadError, setLoadError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<TabKey>("diff");
  const [diffFormat, setDiffFormat] = useState<DiffFormat>("unified");
  const [diffSource, setDiffSource] = useState<DiffSource>("commitPatch");

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [compareBaseIndex, setCompareBaseIndex] = useState<number | null>(null);
  const [fileChoice, setFileChoice] = useState<string>("__ALL__");

  const [showReviewedOnly, setShowReviewedOnly] = useState<boolean>(false);
  const [softMode, setSoftMode] = useState<boolean>(true);
  const [bucketMode, setBucketMode] = useState<BucketMode>("day");
  const [metric, setMetric] = useState<MetricKey>("groups");
  const [bucketFilter, setBucketFilter] = useState<BucketKey | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [distanceOut, setDistanceOut] = useState<string>("");

  // Full-text search state
  const [searchScope, setSearchScope] = useState<SearchScope>("thisCommit");
  const [searchResults, setSearchResults] = useState<SearchHit[]>([]);
  const [indexProgress, setIndexProgress] = useState<IndexProgress>({ indexed: 0, total: 0, done: false });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement | null>(null);

  // Timeline playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const prefersReducedMotion = useRef(false);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const legendDialogRef = useRef<HTMLDialogElement | null>(null);
  const bucketInfoDialogRef = useRef<HTMLDialogElement | null>(null);
  const controlsDialogRef = useRef<HTMLDialogElement | null>(null);
  const commitsDialogRef = useRef<HTMLDialogElement | null>(null);
  const helpDialogRef = useRef<HTMLDialogElement | null>(null);

  const [bucketInfo, setBucketInfo] = useState<BucketKey | null>(null);
  const [showPerfPanel, setShowPerfPanel] = useState(false);
  const perfTickRef = useRef(0);

  const hashAppliedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoadError("");
    (async () => {
      try {
        const res = await fetch("/how-it-was-built/frankentui_spec_evolution_dataset.json", {
          cache: "force-cache",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ds = (await res.json()) as Dataset;
        if (cancelled) return;

        const cv: CommitView[] = ds.commits.map((c, idx) => ({
          ...c,
          idx,
          reviewed: !!c.review,
          dateShort: c.date.replace("T", " ").slice(0, 19),
          bucketMask: computeCommitBucketMask(c),
          magnitude: {
            groups: c.review?.groups?.length ? c.review.groups.length : 1,
            lines: (c.totals?.added || 0) + (c.totals?.deleted || 0),
            patchBytes: new TextEncoder().encode(c.patch || "").length,
          },
        }));

        setDataset(ds);
        setCommits(cv);

        // Apply deep-link state from URL hash after data loads
        const hs = decodeHashState(window.location.hash);
        if (hs.commitShort) {
          const idx = cv.findIndex((c) => c.short === hs.commitShort);
          setSelectedIndex(idx >= 0 ? idx : 0);
        } else {
          setSelectedIndex(0);
        }
        if (hs.tab) setActiveTab(hs.tab);
        if (hs.file) setFileChoice(hs.file);
        else setFileChoice("__ALL__");
        if (hs.diffFmt) setDiffFormat(hs.diffFmt);
        if (hs.query) setSearchQuery(hs.query);
        if (hs.reviewedOnly) setShowReviewedOnly(true);
        if (hs.bucket !== undefined && hs.bucket !== null) setBucketFilter(hs.bucket);
        setCompareBaseIndex(null);
        setDiffSource("commitPatch");
        hashAppliedRef.current = true;
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync state → URL hash (replaceState to avoid history pollution)
  const selectedCommitShort = commits[selectedIndex]?.short;
  useEffect(() => {
    if (!hashAppliedRef.current || !selectedCommitShort) return;
    const hash = encodeHashState({
      commitShort: selectedCommitShort,
      tab: activeTab,
      file: fileChoice,
      diffFmt: diffFormat,
      query: searchQuery,
      reviewedOnly: showReviewedOnly,
      bucket: bucketFilter,
    });
    const newUrl = `${window.location.pathname}${window.location.search}${hash}`;
    window.history.replaceState(null, "", newUrl);
  }, [selectedCommitShort, activeTab, fileChoice, diffFormat, searchQuery, showReviewedOnly, bucketFilter]);

  const reviewedCount = useMemo(() => commits.filter((c) => c.reviewed).length, [commits]);

  const filteredCommits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return commits.filter((c) => {
      if (showReviewedOnly && !c.reviewed) return false;
      if (bucketFilter !== null && !hasBucket(c.bucketMask, bucketFilter)) return false;
      if (!q) return true;
      return (c.subject || "").toLowerCase().includes(q) || c.short.toLowerCase().includes(q);
    });
  }, [bucketFilter, commits, searchQuery, showReviewedOnly]);

  // Incremental corpus indexing for all-commits search
  useEffect(() => {
    if (commits.length === 0) return;
    corpusIndex.init(commits.map((c) => ({
      idx: c.idx,
      short: c.short,
      date: c.date,
      subject: c.subject || "",
      files: c.files,
    })));
    setIndexProgress(corpusIndex.progress);

    const BATCH_SIZE = 3;
    let cancelled = false;

    function indexNextBatch() {
      if (cancelled || corpusIndex.done) return;
      const hasMore = corpusIndex.indexBatch(BATCH_SIZE);
      setIndexProgress({ ...corpusIndex.progress });
      if (hasMore) {
        if ("requestIdleCallback" in window) {
          (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(indexNextBatch);
        } else {
          setTimeout(indexNextBatch, 16);
        }
      }
    }

    if ("requestIdleCallback" in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(indexNextBatch);
    } else {
      setTimeout(indexNextBatch, 16);
    }

    return () => { cancelled = true; };
  }, [commits]);

  const selectedCommit = commits[selectedIndex];

  // Execute search when query, scope, or selected commit changes
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    if (searchScope === "thisCommit") {
      if (!selectedCommit) {
        setSearchResults([]);
        return;
      }
      const hits = perfTime("searchSingleCommit", () =>
        searchSingleCommit({
          idx: selectedCommit.idx,
          short: selectedCommit.short,
          date: selectedCommit.date,
          subject: selectedCommit.subject || "",
          files: selectedCommit.files,
        }, q, 50)
      );
      setSearchResults(hits);
      setShowSearchResults(hits.length > 0);
    } else {
      const hits = perfTime("corpusSearch", () => corpusIndex.search(q, 100));
      setSearchResults(hits);
      setShowSearchResults(hits.length > 0);
    }
  }, [searchQuery, searchScope, selectedCommit, indexProgress.done]);
  const compareBaseCommit = compareBaseIndex !== null ? commits[compareBaseIndex] : null;

  useEffect(() => {
    setDistanceOut("");
  }, [selectedIndex, compareBaseIndex]);

  useEffect(() => {
    if (compareBaseIndex === null && diffSource !== "commitPatch") setDiffSource("commitPatch");
  }, [compareBaseIndex, diffSource]);

  const chartModel = useMemo(() => {
    const base = commits.filter((c) => (!showReviewedOnly ? true : c.reviewed));

    const buckets = new Map<string, CommitView[]>();
    for (const c of base) {
      if (bucketFilter !== null && !hasBucket(c.bucketMask, bucketFilter)) continue;
      const k = bucketKey(c, bucketMode);
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k)!.push(c);
    }

    const xKeys = Array.from(buckets.keys()).sort();

    const seriesByBucket: Record<BucketKey, number[]> = BUCKET_KEYS.reduce(
      (acc, b) => {
        acc[b] = new Array(xKeys.length).fill(0);
        return acc;
      },
      {} as Record<BucketKey, number[]>
    );

    xKeys.forEach((k, idx) => {
      const commitsIn = buckets.get(k) || [];
      for (const c of commitsIn) {
        const dist = metric === "groups" ? perCommitBucketWeights(c, softMode) : perCommitBucketMagnitude(c, metric, softMode);
        for (const [bk, val] of Object.entries(dist)) {
          const b = parseInt(bk, 10);
          if (b < 0 || b > 10) continue;
          seriesByBucket[b as BucketKey][idx] += val;
        }
      }
    });

    const firstCommitByKey = new Map<string, number>();
    for (const k of xKeys) {
      const list = buckets.get(k) || [];
      if (list.length) firstCommitByKey.set(k, list[0].idx);
    }

    return { xKeys, seriesByBucket, firstCommitByKey };
  }, [bucketFilter, bucketMode, commits, metric, showReviewedOnly, softMode]);

  const patchFiles = useMemo(() => {
    if (!selectedCommit) return [];
    if (activeTab !== "diff") return [];
    // Cache parsed patches per commit SHA to avoid re-parsing when toggling tabs
    const cacheKey = selectedCommit.sha;
    const cached = patchParseCache.get(cacheKey);
    if (cached !== undefined) return cached;
    const files = perfTime("parseGitPatch", () => parseGitPatch(selectedCommit.patch || ""));
    patchParseCache.set(cacheKey, files);
    return files;
  }, [activeTab, selectedCommit]);

  const snapshotMarkdown = useMemo(() => {
    if (!selectedCommit) return "";
    // Lazy: only compute when snapshot or raw tab is active
    if (activeTab !== "snapshot" && activeTab !== "raw") return "";
    const cacheKey = `${selectedCommit.sha}:${fileChoice}`;
    const cached = snapshotMdCache.get(cacheKey);
    if (cached !== undefined) return cached;
    const md = perfTime("buildSnapshotMarkdown", () => buildSnapshotMarkdown(selectedCommit, fileChoice));
    snapshotMdCache.set(cacheKey, md);
    return md;
  }, [activeTab, fileChoice, selectedCommit]);

  /* ------------------------------------------------------------------ */
  /*  Timeline Mini-map + Playback                                       */
  /* ------------------------------------------------------------------ */

  // Detect prefers-reduced-motion once on mount
  useEffect(() => {
    prefersReducedMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Timeline sparkline data (recomputed when metric or filter changes)
  const timelineData = useMemo(
    () => buildTimelineData(commits, metric, bucketFilter),
    [commits, metric, bucketFilter],
  );

  // Playback: advance commit at interval
  useEffect(() => {
    if (!isPlaying || commits.length <= 1) return;

    const ms = playbackIntervalMs(playbackSpeed);
    const id = setInterval(() => {
      setSelectedIndex((prev) => {
        // If we're filtering, walk through filtered commits only
        if (filteredCommits.length > 0) {
          const pos = filteredCommits.findIndex((c) => c.idx === prev);
          const next = pos + 1;
          if (next >= filteredCommits.length) {
            // Reached end — stop playback
            requestAnimationFrame(() => setIsPlaying(false));
            return prev;
          }
          return filteredCommits[next].idx;
        }
        // Unfiltered: simple increment
        if (prev >= commits.length - 1) {
          requestAnimationFrame(() => setIsPlaying(false));
          return prev;
        }
        return prev + 1;
      });
    }, ms);

    return () => clearInterval(id);
  }, [isPlaying, playbackSpeed, commits.length, filteredCommits]);

  // Stop playback when user manually changes commit
  const playbackStopOnManualRef = useRef(false);
  const togglePlayback = useCallback(() => {
    if (prefersReducedMotion.current) return; // respect a11y preference
    setIsPlaying((prev) => !prev);
  }, []);

  const cyclePlaybackSpeed = useCallback(() => {
    setPlaybackSpeed((prev) => {
      const idx = PLAYBACK_SPEEDS.indexOf(prev);
      return PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
    });
  }, []);

  const compareModel = useMemo(() => {
    if (!compareBaseCommit) return null;

    return perfTime("compareModel", () => {
      const fileSummary = computeFileChangeSummary(compareBaseCommit.files, selectedCommit.files);

      const baseStats =
        fileChoice === "__ALL__" && compareBaseCommit.snapshot
          ? { lines: compareBaseCommit.snapshot.lines, bytes: compareBaseCommit.snapshot.bytes, words: computeTextStats(buildCorpusText(compareBaseCommit.files, fileChoice)).words }
          : computeTextStats(buildCorpusText(compareBaseCommit.files, fileChoice));

      const targetStats =
        fileChoice === "__ALL__" && selectedCommit.snapshot
          ? { lines: selectedCommit.snapshot.lines, bytes: selectedCommit.snapshot.bytes, words: computeTextStats(buildCorpusText(selectedCommit.files, fileChoice)).words }
          : computeTextStats(buildCorpusText(selectedCommit.files, fileChoice));

      const perFile = fileChoice === "__ALL__"
        ? computePerFileContribution(compareBaseCommit.files, selectedCommit.files)
        : [];

      return {
        base: compareBaseCommit,
        target: selectedCommit,
        fileSummary,
        baseStats,
        targetStats,
        deltaLines: targetStats.lines - baseStats.lines,
        deltaBytes: targetStats.bytes - baseStats.bytes,
        deltaWords: targetStats.words - baseStats.words,
        perFile,
      };
    });
  }, [compareBaseCommit, fileChoice, selectedCommit]);

  const corpusDiff = useMemo(() => {
    if (!compareBaseCommit) return null;
    if (diffSource !== "corpusAB") return null;
    if (fileChoice === "__ALL__") {
      return { error: "Select a single file to compute a corpus diff (file dropdown)." } as const;
    }

    const aText = buildCorpusText(compareBaseCommit.files, fileChoice);
    const bText = buildCorpusText(selectedCommit.files, fileChoice);

    const aLines = aText ? aText.split(/\n/).length : 0;
    const bLines = bText ? bText.split(/\n/).length : 0;
    const MAX_LINES = 8000;
    if (aLines + bLines > MAX_LINES) {
      return { error: `Corpus diff too large (${aLines + bLines} lines). Pick a smaller file.` } as const;
    }

    const ops = perfTime("myersDiff", () => myersDiffTextLines(aText, bText));
    return { ops } as const;
  }, [compareBaseCommit, diffSource, fileChoice, selectedCommit]);

  // Auto-compute edit distance in compare mode (cached per A.short + B.short + fileChoice)
  const compareEditDistance = useMemo(() => {
    if (!compareBaseCommit) return null;

    return perfTime("editDistance", () => {
      const aText = buildCorpusText(compareBaseCommit.files, fileChoice);
      const bText = buildCorpusText(selectedCommit.files, fileChoice);
      if (!aText && !bText) return { distance: 0, timeMs: 0 };

      const aLines = aText ? aText.split(/\n/).length : 0;
      const bLines = bText ? bText.split(/\n/).length : 0;
      const ub = Math.abs(bLines - aLines) * 4 + 200;

      const t0 = performance.now();
      const dist = computeEditDistanceLines(aText, bText, ub);
      const timeMs = performance.now() - t0;

      return {
        distance: dist > ub ? null : dist,
        earlyExit: dist > ub,
        upperBound: ub,
        timeMs,
      };
    });
  }, [compareBaseCommit, fileChoice, selectedCommit]);

  const bucketInfoDesc = useMemo(() => {
    if (!dataset || bucketInfo === null) return "";
    return dataset.bucket_defs?.[String(bucketInfo)] || "";
  }, [bucketInfo, dataset]);

  function openLegend() {
    legendDialogRef.current?.showModal();
  }

  function openControls() {
    controlsDialogRef.current?.showModal();
  }

  function openCommits() {
    commitsDialogRef.current?.showModal();
  }

  function openBucketInfo(b: BucketKey) {
    setBucketInfo(b);
    bucketInfoDialogRef.current?.showModal();
  }

  function toggleBucketFilter(b: BucketKey) {
    setBucketFilter((prev) => (prev === b ? null : b));
  }

  const selectCommit = useCallback((idx: number) => {
    setSelectedIndex(clampInt(idx, 0, Math.max(0, commits.length - 1)));
    setDistanceOut("");
  }, [commits.length]);

  const handleSearchResultClick = useCallback((hit: SearchHit) => {
    selectCommit(hit.commitIdx);
    if (hit.filePath) setFileChoice(hit.filePath);
    setActiveTab("snapshot");
    setShowSearchResults(false);
  }, [selectCommit]);

  const navigateFiltered = useCallback((direction: 1 | -1) => {
    if (filteredCommits.length === 0) return;
    
    setSelectedIndex(prev => {
      const currentPos = filteredCommits.findIndex(c => c.idx === prev);
      let nextPos: number;
      if (currentPos === -1) {
        nextPos = direction === 1 ? 0 : filteredCommits.length - 1;
      } else {
        nextPos = (currentPos + direction + filteredCommits.length) % filteredCommits.length;
      }
      return filteredCommits[nextPos].idx;
    });
    setDistanceOut("");
  }, [filteredCommits]);

  function computeDistancePrevToCurrent() {
    if (!selectedCommit) return;

    const base =
      compareBaseCommit ??
      (selectedIndex > 0 ? commits[selectedIndex - 1] : null);
    if (!base) {
      setDistanceOut("Edit distance: (no previous commit / no baseline A)");
      return;
    }

    const aText = buildCorpusText(base.files, fileChoice);
    const bText = buildCorpusText(selectedCommit.files, fileChoice);

    const aLines = fileChoice === "__ALL__" && base.snapshot ? base.snapshot.lines : computeTextStats(aText).lines;
    const bLines = fileChoice === "__ALL__" && selectedCommit.snapshot ? selectedCommit.snapshot.lines : computeTextStats(bText).lines;
    const ub = Math.abs(bLines - aLines) * 4 + 200; // loose upper bound

    const t0 = performance.now();
    const dist = computeEditDistanceLines(aText, bText, ub);
    const t1 = performance.now();
    const label = dist > ub ? `>${ub} (early-exit)` : String(dist);

    const modeLabel = compareBaseCommit ? "A→B" : "prev→current";
    setDistanceOut(
      `Edit distance (lines, ${modeLabel}): ${label} · computed in ${(t1 - t0).toFixed(1)}ms · upper bound ${ub}`
    );
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        helpDialogRef.current?.showModal();
        e.preventDefault();
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        const input = document.getElementById("specLabSearch") as HTMLInputElement | null;
        input?.focus();
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowLeft") {
        navigateFiltered(-1);
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowRight") {
        navigateFiltered(1);
        e.preventDefault();
        return;
      }
      if (e.key === "Escape") {
        if (showSearchResults) {
          setShowSearchResults(false);
          return;
        }
        [legendDialogRef, bucketInfoDialogRef, controlsDialogRef, commitsDialogRef, helpDialogRef].forEach((r) => {
          if (r.current?.open) r.current.close();
        });
      }
      // Ctrl+Shift+P: toggle perf diagnostics panel (dev-only)
      if (e.key === "P" && e.ctrlKey && e.shiftKey) {
        setShowPerfPanel((v) => !v);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigateFiltered, showSearchResults]);

  if (loadError) {
    return (
      <main id="main-content" className="mx-auto max-w-5xl px-6 py-14 min-h-screen bg-black text-white">
        <FrankenContainer className="p-8">
          <h1 className="text-2xl font-black tracking-tight uppercase tracking-[0.2em] text-red-500">System Error</h1>
          <p className="mt-4 text-slate-400 font-medium">Failed to load forensic dataset archive.</p>
          <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-sm text-rose-200 font-mono shadow-2xl">
            {loadError}
          </div>
          <div className="mt-8">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-black text-xs tracking-widest hover:bg-white/10 transition-all"
            >
              RETRY_INITIALIZATION
            </button>
          </div>
        </FrankenContainer>
      </main>
    );
  }

  if (!dataset || !commits.length || !selectedCommit) {
    return (
      <main id="main-content" className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="relative h-20 w-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-green-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-green-500/40 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Terminal className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <h1 className="text-xl font-black tracking-[0.3em] text-white uppercase mb-2">Spec Lab</h1>
          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Loading Forensic Archive...</p>
        </div>
      </main>
    );
  }

  const metricLabel = formatMetricLabel(metric);
  return (
    <main
      id="main-content"
      className="min-h-screen pt-24 bg-[#020408] text-slate-100 selection:bg-green-500/30 overflow-x-hidden relative"
    >
      {/* Cinematic Background Infrastructure */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[150px]" />
        
        {/* Global Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] opacity-20" />
        
        {/* Occasional VHS glitch static */}
        <motion.div 
          animate={{ opacity: [0, 0.03, 0, 0.05, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.2, 0.3, 1] }}
          className="absolute inset-0 bg-white/[0.02] mix-blend-overlay"
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-2xl relative overflow-hidden">
        <NeuralPulse className="opacity-40" />
        {/* Header Telemetry Strip */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
        
        <div className="mx-auto max-w-[1600px] px-4 py-5 md:px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Link 
                href="/how-it-was-built"
                className="h-11 w-11 shrink-0 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 group relative overflow-hidden"
                title="Return to Build Log"
              >
                <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5 z-10" />
              </Link>
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-5">
                <div className="relative h-12 w-12 shrink-0 rounded-xl border border-green-500/20 bg-green-500/5 grid place-items-center shadow-[0_0_30px_rgba(34,197,94,0.15)] group overflow-hidden">
                  <FrankenBolt className="absolute -left-1 -top-1 z-20 scale-50" />
                  <FrankenBolt className="absolute -right-1 -bottom-1 z-20 scale-50" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-green-500/10 rounded-full scale-150 border-dashed" 
                  />
                  <span className="font-black text-sm text-green-400 group-hover:scale-110 transition-transform z-10">EVO</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                    <span className="text-[9px] font-black text-green-500/60 uppercase tracking-[0.3em]">System_Integrity_Green</span>
                  </div>
                  <FrankenGlitch trigger="hover" intensity="low">
                    <h1 className="text-xl md:text-2xl font-black tracking-tight truncate text-white uppercase tracking-[0.05em]">Spec Evolution Lab</h1>
                  </FrankenGlitch>
                </div>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-4">
              <div className="relative group" data-testid="search-container">
                <div className="absolute -inset-0.5 bg-green-500/20 rounded-full blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 group-focus-within:text-green-400 transition-colors z-10" />
                <input
                  id="specLabSearch"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
                  placeholder={searchScope === "allCommits" ? "SEARCH_ALL_NODES..." : "SEARCH_THIS_NODE..."}
                  className="relative w-[320px] rounded-full border border-white/10 bg-black/40 pl-10 pr-24 py-2.5 text-[11px] font-bold tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-green-500/40 transition-all z-10"
                />
                {/* Scope toggle inside search bar */}
                <button
                  type="button"
                  data-testid="search-scope-toggle"
                  onClick={() => setSearchScope((s) => s === "thisCommit" ? "allCommits" : "thisCommit")}
                  className={clsx(
                    "absolute right-2 top-1/2 -translate-y-1/2 z-20 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-wider transition-all border",
                    searchScope === "allCommits"
                      ? "bg-green-500/15 text-green-400 border-green-500/30"
                      : "bg-white/5 text-slate-500 border-white/10 hover:text-slate-300"
                  )}
                >
                  {searchScope === "allCommits" ? "ALL" : "THIS"}
                </button>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div
                    ref={searchResultsRef}
                    data-testid="search-results-tray"
                    className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl max-h-[400px] overflow-y-auto z-50"
                  >
                    <div className="sticky top-0 flex items-center justify-between px-4 py-2 bg-black/95 border-b border-white/5">
                      <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">
                        {searchResults.length} MATCH{searchResults.length !== 1 ? "ES" : ""}
                        {searchScope === "allCommits" && !indexProgress.done && (
                          <span className="ml-2 text-slate-600">
                            (indexing {indexProgress.indexed}/{indexProgress.total})
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSearchResults(false)}
                        className="text-slate-500 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    {searchResults.slice(0, 50).map((hit, i) => (
                      <button
                        key={`${hit.commitIdx}-${hit.filePath}-${hit.lineNo}-${i}`}
                        type="button"
                        data-testid="search-result-item"
                        onClick={() => handleSearchResultClick(hit)}
                        className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[9px] font-black text-green-500">{hit.commitShort}</span>
                          <span className="font-mono text-[9px] text-slate-600">{hit.commitDate.split("T")[0]}</span>
                          <span className="text-[9px] text-slate-700">·</span>
                          <span className="font-mono text-[9px] text-slate-500 truncate">{hit.filePath}</span>
                          <span className="text-[9px] text-slate-700">:{hit.lineNo}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate group-hover:text-slate-200">
                          {hit.snippet.slice(0, hit.matchOffset)}
                          <span className="text-green-400 bg-green-500/10 px-0.5 rounded font-bold">
                            {hit.snippet.slice(hit.matchOffset, hit.matchOffset + hit.matchLength)}
                          </span>
                          {hit.snippet.slice(hit.matchOffset + hit.matchLength)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-full border border-white/5">
                <select
                  value={bucketMode}
                  onChange={(e) => setBucketMode(e.target.value as BucketMode)}
                  className="rounded-full bg-transparent px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 focus:outline-none hover:text-white transition-colors cursor-pointer"
                >
                  <option value="day">Day</option>
                  <option value="hour">Hour</option>
                  <option value="15m">15m</option>
                  <option value="5m">5m</option>
                </select>
                <div className="w-px h-3 bg-white/10" />
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value as MetricKey)}
                  className="rounded-full bg-transparent px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 focus:outline-none hover:text-white transition-colors cursor-pointer"
                >
                  <option value="groups">Groups</option>
                  <option value="lines">Lines</option>
                  <option value="patchBytes">Bytes</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => downloadObjectAsJson(dataset, "frankentui_spec_evolution_dataset.json")}
                className="group relative h-11 w-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all overflow-hidden"
                title="Export JSON"
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Download className="h-4 w-4 relative z-10" />
              </button>
            </div>

            <div className="flex xl:hidden items-center gap-2">
              <button
                type="button"
                onClick={openControls}
                className="rounded-full border border-green-500/20 bg-green-500/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-green-400"
              >
                TOOLS
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em]">
            <div className="inline-flex items-center gap-3 rounded-md bg-white/[0.02] border border-white/5 px-3 py-1.5 text-slate-500 shadow-inner">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-green-500" />
                <span className="text-slate-300">{commits.length} NODES</span>
              </div>
              <div className="w-px h-2 bg-white/10" />
              <span className="tracking-normal opacity-60">SCOPE: {dataset.scope_paths.join(" + ")}</span>
            </div>
            
            <div className="inline-flex items-center gap-3 rounded-md bg-white/[0.02] border border-white/5 px-3 py-1.5 text-slate-500 shadow-inner">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                <span className="text-slate-300">VALIDATED: {reviewedCount}/{commits.length}</span>
              </div>
            </div>

            {bucketFilter !== null ? (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                type="button"
                title="Clear bucket filter"
                onClick={() => setBucketFilter(null)}
                className="inline-flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-green-400 hover:bg-green-500/20 transition-all group"
              >
                <div className="h-1 w-1 rounded-full shadow-[0_0_5px_currentColor]" style={{ background: bucketColors[bucketFilter], color: bucketColors[bucketFilter] }} />
                <span>FILTER: {bucketNames[bucketFilter]}</span>
                <X className="h-3 w-3 ml-1 opacity-60 group-hover:opacity-100" />
              </motion.button>
            ) : null}

            <span className="ml-auto hidden md:inline-flex items-center gap-4 text-slate-600">
              <div className="flex items-center gap-4 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded bg-black/40 px-1.5 py-0.5 text-[8px] border border-white/10">←→</kbd> SCRUB
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded bg-black/40 px-1.5 py-0.5 text-[8px] border border-white/10">/</kbd> SEARCH
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded bg-black/40 px-1.5 py-0.5 text-[8px] border border-white/10">?</kbd> HELP
                </span>
              </div>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[400px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-[180px]">
              <FrankenContainer withBolts={true} withStitches={false} className="bg-black/60 backdrop-blur-2xl border-white/10 shadow-3xl overflow-hidden flex flex-col h-[calc(100vh-240px)]">
                <div className="flex flex-col border-b border-white/5 bg-white/[0.02] px-6 py-5 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-black tracking-[0.3em] text-white uppercase italic">Archive_Nodes</h2>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-wider">Forensic Stream</p>
                    </div>
                    <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-slate-600">
                      <Terminal className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowReviewedOnly((v) => !v)}
                    className={clsx(
                      "w-full rounded-md border py-2.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden",
                      showReviewedOnly 
                        ? "border-green-500/30 bg-green-500/10 text-green-400" 
                        : "border-white/10 bg-black/40 text-slate-500 hover:border-white/20 hover:text-slate-300"
                    )}
                  >
                    {showReviewedOnly ? "Validated_Only_Mode" : "View_All_Revisions"}
                    {showReviewedOnly && <motion.div layoutId="active-mode" className="absolute inset-0 bg-green-500/5" />}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.03]">
                  {filteredCommits.map((c) => {
                    const isActive = c.idx === selectedIndex;
                    const weights = perCommitBucketWeights(c, softMode);
                    const bucketKeys = Object.keys(weights)
                      .map((x) => parseInt(x, 10))
                      .filter((b) => Number.isFinite(b) && b >= 0 && b <= 10) as BucketKey[];
                    const showBuckets = (c.reviewed ? bucketKeys.filter((b) => b !== 0) : bucketKeys).slice(0, 3);

                    return (
                      <button
                        key={c.sha}
                        type="button"
                        onClick={() => selectCommit(c.idx)}
                        className={clsx(
                          styles.commitRow,
                          "w-full text-left px-6 py-5 transition-all relative group hover:translate-x-1",
                          isActive ? "bg-green-500/[0.04]" : "hover:bg-white/[0.01]"
                        )}
                      >
                        {isActive && (
                          <>
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 shadow-[0_0_15px_#22c55e]" />
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/[0.05] to-transparent pointer-events-none" />
                          </>
                        )}

                        <div className="flex items-center justify-between mb-2">
                          <span className={clsx(
                            "font-mono text-[9px] font-black px-1.5 py-0.5 rounded border transition-colors",
                            isActive ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-slate-600 border-white/5 bg-white/5"
                          )}>
                            {c.short}
                          </span>
                          <span className="font-mono text-[9px] text-slate-700 font-bold">{c.dateShort.split(' ')[0]}</span>
                        </div>

                        <div className={clsx(
                          "text-[13px] font-bold leading-snug transition-colors line-clamp-2",
                          isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                        )}>
                          {c.subject || "Untitled Archive Node"}
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex -space-x-1.5">
                            {showBuckets.map((b) => (
                              <div
                                key={b}
                                className="h-3 w-3 rounded-full border border-[#020408] shadow-sm"
                                style={{ background: bucketColors[b] }}
                                title={bucketNames[b]}
                              />
                            ))}
                          </div>

                          <div className="flex-1 h-[1px] bg-white/5" />

                          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-tighter text-slate-700">
                            <span className="text-green-500/40">+{c.totals.added}</span>
                            <span className="text-red-500/40">-{c.totals.deleted}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="p-4 bg-black/40 border-t border-white/5">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Stream_Buffer_Capacity</span>
                    <span className="text-[8px] font-mono text-green-500/60">100%</span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-green-500/20" />
                  </div>
                </div>
              </FrankenContainer>
            </div>
          </aside>

          {/* Main content */}
          <section className="space-y-10">
            {/* Chart card */}
            <FrankenContainer withBolts={false} withPulse={true} className="bg-black/60 backdrop-blur-2xl border-white/10 shadow-3xl p-0 overflow-hidden relative group/chart">
              {/* Internal decorative elements */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(34,197,94,0.05),transparent)] pointer-events-none" />
              
              <div className="flex flex-col gap-4 border-b border-white/5 bg-white/[0.03] px-8 py-6 md:flex-row md:items-center md:justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                    <h2 className="text-base font-black tracking-[0.2em] text-white uppercase italic">
                      Revision_Temporal_Flow
                    </h2>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-5">
                    Forensic distribution analysis across temporal buckets
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-black/40 p-1 rounded-md border border-white/10">
                    <button
                      type="button"
                      onClick={() => setSoftMode((v) => !v)}
                      className={clsx(
                        "rounded px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all",
                        softMode ? "bg-green-500/20 text-green-400" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {softMode ? "Soft_Weights" : "Hard_Labels"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBucketFilter(null);
                      setShowReviewedOnly(false);
                    }}
                    className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-white/10 hover:text-white transition-all shadow-md active:scale-95"
                  >
                    RESET_PROBE
                  </button>
                </div>
              </div>

              <div className="p-10">
                <div className="relative">
                  {/* Chart Grid Decoration */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                  
                  <StackedBars
                    xKeys={chartModel.xKeys}
                    seriesByBucket={chartModel.seriesByBucket}
                    focusBucket={bucketFilter}
                    onSelectKey={(k) => {
                      const idx = chartModel.firstCommitByKey.get(k);
                      if (typeof idx === "number") selectCommit(idx);
                    }}
                  />
                </div>

                <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-t border-white/5 pt-8">
                  <div className="grid grid-cols-2 md:flex md:items-center gap-x-8 gap-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Analysis_Mode</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{softMode ? "Probabilistic" : "Deterministic"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Telemetry_Metric</span>
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">{metricLabel}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Bucket_Resolution</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{bucketMode}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={openLegend}
                      className="md:hidden rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 transition-all"
                    >
                      TAXONOMY
                    </button>
                    <button
                      type="button"
                      onClick={openCommits}
                      className="lg:hidden rounded-full border border-green-500/20 bg-green-500/10 px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-green-400 transition-all"
                    >
                      NODES
                    </button>
                  </div>
                </div>

                {/* Forensic Legend Bar — Desktop */}
                <div className="hidden md:flex flex-wrap items-center gap-x-2 gap-y-2 mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 mr-4">
                    <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                    <FrankenGlitch trigger="always" intensity="low">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                        Taxonomy_Ledger:
                      </span>
                    </FrankenGlitch>
                  </div>
                  
                  {BUCKET_KEYS.map((b) => {
                    const active = bucketFilter === b;
                    return (
                      <motion.button
                        key={b}
                        type="button"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleBucketFilter(b)}
                        title={dataset.bucket_defs?.[String(b)] || bucketNames[b]}
                        className={clsx(
                          "group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                          active
                            ? "bg-green-500/10 text-green-400 border border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                            : "text-slate-500 hover:text-slate-300 border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/5"
                        )}
                      >
                        {/* Power-on indicator */}
                        <div
                          className={clsx(
                            "h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-500",
                            active ? "shadow-[0_0_8px_currentColor]" : "opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                          )}
                          style={{ background: bucketColors[b], color: bucketColors[b] }}
                        />
                        {bucketNames[b]}
                        
                        {/* Subtle scanline on active chip */}
                        {active && (
                          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px] opacity-20 rounded-[inherit]" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </FrankenContainer>

            {/* Timeline scrubber */}
            <FrankenContainer withBolts={true} className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl p-0 overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-white/5 bg-white/5 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white uppercase tracking-widest">Scrub_Node_Selector</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Temporal Archive Traversal Interface</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigateFiltered(-1)}
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"
                    title="Previous Node"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/5 font-mono text-xs font-bold text-green-400 shadow-inner">
                    {selectedIndex + 1} <span className="text-slate-700 mx-1">/</span> {commits.length}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateFiltered(1)}
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"
                    title="Next Node"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between gap-3 text-[10px] font-black font-mono text-slate-600 uppercase tracking-widest mb-2">
                  <span>EPOCH_START: {commits[0]?.dateShort.split(' ')[0] || ""}</span>
                  <span>EPOCH_END: {commits[commits.length - 1]?.dateShort.split(' ')[0] || ""}</span>
                </div>
                  <div className="relative h-12 flex items-center group">
                  <div className="absolute inset-x-0 h-1 bg-white/5 rounded-full" />
                  <div 
                    className="absolute h-1 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e]" 
                    style={{ width: `${(selectedIndex / (commits.length - 1)) * 100}%` }}
                  />
                  {compareBaseIndex !== null && commits.length > 1 ? (
                    <div
                      className="absolute top-0 bottom-0 pointer-events-none"
                      style={{ 
                        left: `calc(${(compareBaseIndex / (commits.length - 1)) * 100}% - 1px)`,
                        opacity: compareBaseIndex === selectedIndex ? 0 : 1
                      }}
                      aria-hidden="true"
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 h-7 w-[2px] rounded-full bg-rose-400/80 shadow-[0_0_12px_rgba(251,113,133,0.6)]" />
                      <div className="absolute top-1/2 translate-y-[14px] -translate-x-3 text-[9px] font-black font-mono text-rose-300 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                        A
                      </div>
                    </div>
                  ) : null}
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, commits.length - 1)}
                    value={selectedIndex}
                    onChange={(e) => selectCommit(parseInt(e.target.value, 10))}
                    className="absolute inset-x-0 w-full h-1 opacity-0 cursor-pointer z-10"
                  />
                  <motion.div 
                    className="absolute h-4 w-4 bg-white rounded-full border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] pointer-events-none"
                    style={{ left: `calc(${(selectedIndex / (commits.length - 1)) * 100}% - 8px)` }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {compareBaseIndex === selectedIndex && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black font-mono text-rose-300 bg-rose-500/20 border border-rose-500/40 px-1 py-0.5 rounded">
                        A
                      </div>
                    )}
                  </motion.div>
                </div>
                
                <div className="mt-8 grid md:grid-cols-[1fr_auto] gap-6 items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {compareBaseCommit ? (
                        <span
                          data-testid="compare-a-badge"
                          className="font-mono text-[11px] font-black text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"
                        >
                          {compareBaseCommit.short}
                        </span>
                      ) : null}
                      <span
                        data-testid="compare-b-badge"
                        className="font-mono text-[11px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20"
                      >
                        {selectedCommit.short}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">{selectedCommit.date}</span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-white leading-tight">{selectedCommit.subject || "NO_SUBJECT_PROTOCOL"}</h3>
                    <div className="flex items-center gap-4 pt-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500/40" />
                        Added: <span className="text-green-400">+{selectedCommit.totals.added}</span>
                      </span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500/40" />
                        Deleted: <span className="text-red-400">-{selectedCommit.totals.deleted}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:flex-col lg:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(location.href);
                        } catch { /* ignore */ }
                      }}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-lg flex items-center gap-2"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      COPY_LINK
                    </button>
                    {compareBaseIndex === null ? (
                      <button
                        type="button"
                        data-testid="compare-pin-a"
                        onClick={() => {
                          setCompareBaseIndex(selectedIndex);
                          setDiffSource("commitPatch");
                          setDistanceOut("");
                        }}
                        className="rounded-full border border-rose-500/20 bg-rose-500/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-200 hover:bg-rose-500/20 transition-all shadow-lg flex items-center gap-2"
                        title="Pin baseline A for compare mode"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        PIN_AS_A
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          data-testid="compare-swap"
                          onClick={() => {
                            if (compareBaseIndex === null) return;
                            const aIdx = compareBaseIndex;
                            setCompareBaseIndex(selectedIndex);
                            selectCommit(aIdx);
                            setDistanceOut("");
                          }}
                          className="rounded-full border border-amber-500/20 bg-amber-500/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-amber-200 hover:bg-amber-500/20 transition-all shadow-lg flex items-center gap-2"
                          title="Swap A and B"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          SWAP_A_B
                        </button>
                        <button
                          type="button"
                          data-testid="compare-clear-a"
                          onClick={() => {
                            setCompareBaseIndex(null);
                            setDiffSource("commitPatch");
                            setDistanceOut("");
                          }}
                          className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-lg flex items-center gap-2"
                          title="Exit compare mode"
                        >
                          <X className="h-3.5 w-3.5" />
                          CLEAR_A
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={computeDistancePrevToCurrent}
                      className="rounded-full border border-green-500/20 bg-green-500/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-green-400 hover:bg-green-500/20 transition-all shadow-lg flex items-center gap-2"
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      {compareBaseCommit ? "EDIT_DISTANCE_A_B" : "EDIT_DISTANCE"}
                    </button>
                  </div>
                </div>
                
                {compareModel ? (
                  <div
                    data-testid="compare-metrics"
                    className="mt-8 rounded-2xl border border-rose-500/10 bg-gradient-to-br from-rose-500/[0.06] via-black/40 to-black/20 p-6 shadow-2xl"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-rose-400/70 shadow-[0_0_10px_rgba(251,113,133,0.45)]" />
                        COMPARE_MODE
                        <span className="text-slate-700">A→B</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          A {compareModel.base.short}
                        </span>
                        <span className="text-slate-700">→</span>
                        <span className="font-mono text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                          B {compareModel.target.short}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="compare-metrics-grid">
                      <div className="rounded-xl border border-white/5 bg-black/30 p-4 group/metric">
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                          Δ_LINES
                          <span className="opacity-0 group-hover/metric:opacity-100 transition-opacity text-slate-700" title="Net change in line count between snapshots A and B">
                            <HelpCircle className="h-2.5 w-2.5" />
                          </span>
                        </div>
                        <div className={clsx("mt-2 font-mono text-xl font-black", compareModel.deltaLines >= 0 ? "text-green-300" : "text-rose-300")}>
                          {compareModel.deltaLines >= 0 ? "+" : ""}{compareModel.deltaLines}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                          {compareModel.baseStats.lines} → {compareModel.targetStats.lines}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-black/30 p-4 group/metric">
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                          Δ_BYTES
                          <span className="opacity-0 group-hover/metric:opacity-100 transition-opacity text-slate-700" title="Net change in UTF-8 encoded byte size between A and B">
                            <HelpCircle className="h-2.5 w-2.5" />
                          </span>
                        </div>
                        <div className={clsx("mt-2 font-mono text-xl font-black", compareModel.deltaBytes >= 0 ? "text-green-300" : "text-rose-300")}>
                          {compareModel.deltaBytes >= 0 ? "+" : ""}{compareModel.deltaBytes}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                          {compareModel.baseStats.bytes} → {compareModel.targetStats.bytes}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-black/30 p-4 group/metric">
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                          Δ_WORDS
                          <span className="opacity-0 group-hover/metric:opacity-100 transition-opacity text-slate-700" title="Net change in whitespace-tokenized word count between A and B">
                            <HelpCircle className="h-2.5 w-2.5" />
                          </span>
                        </div>
                        <div className={clsx("mt-2 font-mono text-xl font-black", compareModel.deltaWords >= 0 ? "text-green-300" : "text-rose-300")}>
                          {compareModel.deltaWords >= 0 ? "+" : ""}{compareModel.deltaWords}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                          {compareModel.baseStats.words} → {compareModel.targetStats.words}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-black/30 p-4 group/metric">
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                          FILES
                          <span className="opacity-0 group-hover/metric:opacity-100 transition-opacity text-slate-700" title="File-level changes: added, removed, modified, unchanged">
                            <HelpCircle className="h-2.5 w-2.5" />
                          </span>
                        </div>
                        <div className="mt-2 font-mono text-[12px] font-black text-slate-300">
                          <span className="text-green-300">+{compareModel.fileSummary.added.length}</span>{" "}
                          <span className="text-rose-300">-{compareModel.fileSummary.removed.length}</span>{" "}
                          <span className="text-amber-200">~{compareModel.fileSummary.modified.length}</span>
                        </div>
                        <div className="mt-1 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                          {compareModel.fileSummary.unchanged.length} unchanged
                        </div>
                      </div>

                      {compareEditDistance ? (
                        <div className="rounded-xl border border-white/5 bg-black/30 p-4 group/metric">
                          <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                            EDIT_DIST
                            <span className="opacity-0 group-hover/metric:opacity-100 transition-opacity text-slate-700" title="Line-level Levenshtein edit distance: minimum line insertions, deletions, or substitutions to transform A into B">
                              <HelpCircle className="h-2.5 w-2.5" />
                            </span>
                          </div>
                          <div className="mt-2 font-mono text-xl font-black text-cyan-300">
                            {compareEditDistance.earlyExit ? `>${compareEditDistance.upperBound}` : compareEditDistance.distance}
                          </div>
                          <div className="mt-1 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                            {compareEditDistance.timeMs.toFixed(1)}ms
                          </div>
                        </div>
                      ) : null}

                      <div className="rounded-xl border border-white/5 bg-black/30 p-4 group/metric">
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                          SCOPE
                          <span className="opacity-0 group-hover/metric:opacity-100 transition-opacity text-slate-700" title="Which spec file(s) are being compared. Select a single file from the dropdown to narrow the scope.">
                            <HelpCircle className="h-2.5 w-2.5" />
                          </span>
                        </div>
                        <div className="mt-2 font-mono text-[11px] font-black text-slate-300 truncate">
                          {fileChoice === "__ALL__" ? "CORPUS" : fileChoice}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                          {fileChoice === "__ALL__" ? "all spec files" : "single file"}
                        </div>
                      </div>
                    </div>

                    {/* Per-file contribution breakdown (only in corpus/ALL mode) */}
                    {compareModel.perFile.length > 0 ? (
                      <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4">
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          PER_FILE_DELTA
                          <span className="text-slate-700" title="Shows which files contributed most to the overall byte delta between A and B">
                            <HelpCircle className="h-2.5 w-2.5" />
                          </span>
                        </div>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                          {compareModel.perFile.map((pf) => (
                            <div key={pf.path} className="flex items-center gap-3 text-[10px] font-mono">
                              <span className="text-slate-500 truncate min-w-0 flex-1">{pf.path}</span>
                              <span className={clsx("font-black tabular-nums shrink-0", pf.deltaLines >= 0 ? "text-green-400/70" : "text-rose-400/70")}>
                                {pf.deltaLines >= 0 ? "+" : ""}{pf.deltaLines}L
                              </span>
                              <span className={clsx("font-black tabular-nums shrink-0", pf.deltaBytes >= 0 ? "text-green-400/70" : "text-rose-400/70")}>
                                {pf.deltaBytes >= 0 ? "+" : ""}{pf.deltaBytes}B
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </FrankenContainer>

            {/* Timeline Mini-map + Playback */}
            {commits.length > 1 && (
              <div
                ref={timelineRef}
                data-testid="timeline-minimap"
                className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">TIMELINE_MAP</span>
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">
                      {metric === "groups" ? "Review Groups" : metric === "lines" ? "Lines Changed" : "Patch Bytes"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!prefersReducedMotion.current && (
                      <>
                        <button
                          type="button"
                          data-testid="playback-toggle"
                          onClick={togglePlayback}
                          className={clsx(
                            "rounded-lg border p-1.5 transition-all active:scale-90",
                            isPlaying
                              ? "border-green-500/40 bg-green-500/10 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                              : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white",
                          )}
                          title={isPlaying ? "Pause playback" : "Play through commits"}
                        >
                          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          data-testid="playback-speed"
                          onClick={cyclePlaybackSpeed}
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[9px] font-black font-mono text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                          title="Cycle playback speed"
                        >
                          {playbackSpeed}x
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sparkline heat strip */}
                <div
                  className="relative h-16 mx-4 my-3 cursor-pointer group/timeline"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const fraction = (e.clientX - rect.left) / rect.width;
                    const idx = positionToCommitIndex(fraction, commits.length);
                    selectCommit(idx);
                    setIsPlaying(false);
                  }}
                  role="slider"
                  aria-label="Timeline mini-map"
                  aria-valuemin={0}
                  aria-valuemax={commits.length - 1}
                  aria-valuenow={selectedIndex}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") { selectCommit(selectedIndex + 1); e.preventDefault(); }
                    if (e.key === "ArrowLeft") { selectCommit(selectedIndex - 1); e.preventDefault(); }
                    if (e.key === " ") { togglePlayback(); e.preventDefault(); }
                  }}
                >
                  {/* Background bars */}
                  <div className="absolute inset-0 flex items-end gap-px">
                    {timelineData.points.map((pt) => {
                      const isActive = pt.idx === selectedIndex;
                      const dimmed = !pt.matchesBucketFilter;
                      return (
                        <div
                          key={pt.idx}
                          className="flex-1 relative group/bar"
                          style={{ height: "100%" }}
                        >
                          <div
                            className={clsx(
                              "absolute bottom-0 w-full rounded-t-sm transition-all duration-75",
                              isActive && "ring-1 ring-green-400/60",
                              dimmed && "opacity-30",
                            )}
                            style={{
                              height: `${Math.max(4, pt.value * 100)}%`,
                              background: isActive
                                ? "rgba(34,197,94,0.7)"
                                : pt.reviewed
                                  ? "rgba(96,165,250,0.5)"
                                  : "rgba(148,163,184,0.25)",
                            }}
                          />
                          {/* Reviewed dot indicator */}
                          {pt.reviewed && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-blue-400/60" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Playhead indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)] pointer-events-none z-10 transition-[left] duration-75"
                    style={{ left: `${commitIndexToPosition(selectedIndex, commits.length) * 100}%` }}
                  />

                  {/* Compare base marker */}
                  {compareBaseIndex !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-rose-400/70 shadow-[0_0_6px_rgba(251,113,133,0.4)] pointer-events-none z-10"
                      style={{ left: `${commitIndexToPosition(compareBaseIndex, commits.length) * 100}%` }}
                    />
                  )}

                  {/* Hover hint */}
                  <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover/timeline:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Legend row */}
                <div className="flex items-center justify-between px-6 pb-3 text-[9px] font-bold text-slate-700 uppercase tracking-widest">
                  <span>{commits[0]?.dateShort.split(" ")[0] || ""}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <div className="h-1.5 w-3 rounded-sm bg-slate-500/25" /> unreviewed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="h-1.5 w-3 rounded-sm bg-blue-400/50" /> reviewed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="h-1.5 w-3 rounded-sm bg-green-500/70" /> selected
                    </span>
                  </div>
                  <span>{commits[commits.length - 1]?.dateShort.split(" ")[0] || ""}</span>
                </div>
              </div>
            )}

            {/* Inspector */}
            <FrankenContainer withBolts={true} withPulse={true} className="bg-black/60 backdrop-blur-2xl border-white/10 shadow-3xl p-0 overflow-hidden flex flex-col min-h-[600px] group/inspector">
              <div className="flex flex-col gap-4 border-b border-white/5 bg-white/[0.03] px-8 py-6 md:flex-row md:items-center md:justify-between relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Terminal className="h-4 w-4 text-green-500/60" />
                    <h2 className="text-base font-black tracking-[0.2em] text-white uppercase italic">Forensics_Inspector</h2>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-7">Deep Archive Data Extraction & Analysis</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative">
                    <select
                      value={fileChoice}
                      onChange={(e) => setFileChoice(e.target.value)}
                      className="appearance-none rounded-md border border-white/10 bg-black/60 pl-4 pr-10 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 focus:outline-none focus:border-green-500/40 hover:text-white transition-all cursor-pointer shadow-inner min-w-[180px]"
                    >
                      <option value="__ALL__">All_Corpus_Files</option>
                      {selectedCommit.files.map((f) => (
                        <option key={f.path} value={f.path}>{f.path.toUpperCase()}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">
                      <Filter className="h-3 w-3" />
                    </div>
                  </div>

                  <div className="flex items-center bg-black/40 p-1 rounded-md border border-white/10 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setDiffFormat("unified")}
                      className={clsx(
                        "rounded px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all",
                        diffFormat === "unified" ? "bg-green-500/20 text-green-400" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      Unified
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiffFormat("sideBySide")}
                      className={clsx(
                        "rounded px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all",
                        diffFormat === "sideBySide" ? "bg-green-500/20 text-green-400" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      Split
                    </button>
                  </div>
                </div>
              </div>

              {/* Forensic Tab Bar */}
              <div className="px-8 py-4 flex flex-wrap gap-3 border-b border-white/5 bg-white/[0.01]">
                {(
                  [
                    ["diff", "Diff_Stream", "terminal"],
                    ["snapshot", "MD_Snapshot", "file-text"],
                    ["raw", "Raw_Archive", "database"],
                    ["ledger", "Evidence_Ledger", "shield-check"],
                    ["files", "Changed_Nodes", "layers"],
                  ] as const
                ).map(([k, label]) => {
                  const isActive = activeTab === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setActiveTab(k)}
                      className={clsx(
                        "group relative flex items-center gap-2.5 px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden",
                        isActive
                          ? "text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                          : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {/* Chip Background */}
                      <div className={clsx(
                        "absolute inset-0 transition-all duration-500",
                        isActive ? "bg-green-500/[0.08] opacity-100" : "bg-white/[0.02] opacity-0 group-hover:opacity-100"
                      )} />
                      <div className={clsx(
                        "absolute inset-x-0 top-0 h-[1px] transition-all duration-500",
                        isActive ? "bg-green-500/40" : "bg-transparent group-hover:bg-white/10"
                      )} />
                      
                      <span className="relative z-10">{label}</span>
                      {isActive && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500 shadow-[0_0_10px_#22c55e]" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-8 md:p-10 relative flex-1">
                {/* Content Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.02)_50%)] bg-[length:100%_8px] opacity-20 z-10" />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab + selectedCommit.sha}
                    initial={{ opacity: 0, scale: 0.99, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.01, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-0"
                  >
	                    {activeTab === "diff" ? (
	                      <div className="space-y-8">
	                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/[0.02] border border-white/5 p-4 rounded-lg">
	                          <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  {compareBaseCommit && diffSource === "corpusAB"
                                    ? "Source_Corpus_Diff_A→B"
                                    : "Patch_Sequence_Stream"}
                                </span>
                              </div>
                              <div className="w-px h-3 bg-white/10" />
                              <span className="text-[10px] font-mono text-slate-600 font-bold">
                                {compareBaseCommit && diffSource === "corpusAB"
                                  ? `[BASE: ${compareBaseCommit.short}]`
                                  : `[NODES: ${patchFiles.length}]`}
                              </span>
	                          </div>
	                          <div className="flex flex-wrap items-center gap-3">
	                            {compareBaseCommit ? (
	                              <div className="flex items-center bg-black/60 p-1 rounded border border-white/10 shadow-inner">
	                                <button
	                                  type="button"
	                                  onClick={() => setDiffSource("commitPatch")}
	                                  className={clsx(
	                                    "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded",
	                                    diffSource === "commitPatch"
	                                      ? "bg-green-500/20 text-green-400"
	                                      : "text-slate-500 hover:text-slate-300"
	                                  )}
	                                >
	                                  Patch_B
	                                </button>
	                                <button
	                                  type="button"
	                                  onClick={() => setDiffSource("corpusAB")}
	                                  className={clsx(
	                                    "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded",
	                                    diffSource === "corpusAB"
	                                      ? "bg-rose-500/20 text-rose-200"
	                                      : "text-slate-500 hover:text-slate-300"
	                                  )}
	                                >
	                                  Corpus_A_B
	                                </button>
	                              </div>
	                            ) : null}

	                            <button
	                              type="button"
	                              onClick={() => downloadObjectAsJson(selectedCommit, `${selectedCommit.short}.json`)}
	                              className="rounded border border-white/10 bg-white/5 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
	                            >
	                              <Download className="h-3 w-3" />
	                              Extract
	                            </button>
	                          </div>
	                        </div>
	
	                        {!compareBaseCommit || diffSource === "commitPatch" ? (
	                          patchFiles.map((pf, idx) => (
	                            <div key={`${pf.pathA}-${pf.pathB}-${idx}`} className="rounded-2xl border border-white/5 bg-black/40 overflow-hidden shadow-xl">
	                              <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-white/5 px-5 py-3">
	                                <div className="min-w-0">
	                                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">DIFF_STREAM</div>
	                                  <div className="mt-1 font-mono text-[13px] text-green-400 font-bold truncate">
	                                    {pf.pathA} <span className="text-slate-700 mx-2">→</span> {pf.pathB}
	                                  </div>
	                                </div>
	                              </div>
	
	                              <div className="p-0">
	                                {pf.hunks.map((h, hi) => (
	                                  <div key={hi} className="border-b border-white/5 last:border-0">
	                                    <div className="px-5 py-2 text-[11px] font-mono font-bold text-slate-500 bg-white/[0.02] border-b border-white/5">
	                                      {h.header}
	                                    </div>
	
	                                    {diffFormat === "unified" ? (
	                                      <pre className="p-5 overflow-auto text-[12px] font-mono leading-relaxed custom-scrollbar max-h-[500px]">
	                                        {h.lines.map((l, li) => (
	                                          <div
	                                            key={li}
	                                            className={clsx(
	                                              "whitespace-pre rounded px-1",
	                                              l.kind === "add"
	                                                ? "bg-green-500/10 text-green-200"
	                                                : l.kind === "del"
	                                                  ? "bg-rose-500/10 text-rose-300"
	                                                  : l.kind === "meta"
	                                                    ? "text-slate-600 italic"
	                                                    : "text-slate-400"
	                                            )}
	                                          >
	                                            {l.text}
	                                          </div>
	                                        ))}
	                                      </pre>
	                                    ) : (
	                                      <div className="grid grid-cols-2 gap-px bg-white/5">
	                                        {hunkToSideBySideRows(h).map((row, ri) => {
	                                          const cellCls = (c: SideCell) =>
	                                            clsx(
	                                              "min-w-0 px-4 py-1.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words transition-colors",
	                                              c.kind === "add"
	                                                ? "bg-green-500/10 text-green-200"
	                                                : c.kind === "del"
	                                                  ? "bg-rose-500/10 text-rose-300"
	                                                  : c.kind === "context"
	                                                    ? "bg-black/20 text-slate-400"
	                                                    : "bg-black/40 text-slate-700"
	                                            );
	
	                                          const lnCls = "select-none text-slate-700 text-[9px] pr-3 font-black inline-block w-8 text-right";
	
	                                          return (
	                                            <React.Fragment key={ri}>
	                                              <div className={cellCls(row.left)}>
	                                                <span className={lnCls}>{row.left.lineNo ?? ""}</span>
	                                                {row.left.text ?? ""}
	                                              </div>
	                                              <div className={cellCls(row.right)}>
	                                                <span className={lnCls}>{row.right.lineNo ?? ""}</span>
	                                                {row.right.text ?? ""}
	                                              </div>
	                                            </React.Fragment>
	                                          );
	                                        })}
	                                      </div>
	                                    )}
	                                  </div>
	                                ))}
	                              </div>
	                            </div>
	                          ))
	                        ) : (
	                          <div className="rounded-2xl border border-white/5 bg-black/40 overflow-hidden shadow-xl">
	                            <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-white/5 px-5 py-3">
	                              <div className="min-w-0">
	                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">CORPUS_DIFF</div>
	                                <div className="mt-1 font-mono text-[13px] text-rose-200 font-bold truncate">
	                                  A {compareBaseCommit.short} <span className="text-slate-700 mx-2">→</span> B {selectedCommit.short}{" "}
	                                  <span className="text-slate-700 mx-2">·</span> {fileChoice}
	                                </div>
	                              </div>
	                            </div>
	
	                            {"error" in (corpusDiff || {}) ? (
	                              <div className="p-6 text-sm text-slate-300">
	                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-200">
	                                  {(corpusDiff as { error: string }).error}
	                                </div>
	                              </div>
	                            ) : corpusDiff && "ops" in corpusDiff ? (
	                              diffFormat === "unified" ? (
	                                <pre className="p-5 overflow-auto text-[12px] font-mono leading-relaxed custom-scrollbar max-h-[500px]">
	                                  {(corpusDiff.ops as DiffOp[]).slice(0, 2000).map((op, i) => {
	                                    const prefix = op.kind === "add" ? "+" : op.kind === "del" ? "-" : " ";
	                                    const cls =
	                                      op.kind === "add"
	                                        ? "bg-green-500/10 text-green-200"
	                                        : op.kind === "del"
	                                          ? "bg-rose-500/10 text-rose-300"
	                                          : "text-slate-400";
	                                    return (
	                                      <div key={i} className={clsx("whitespace-pre rounded px-1", cls)}>
	                                        {prefix}{op.text}
	                                      </div>
	                                    );
	                                  })}
	                                  {(corpusDiff.ops as DiffOp[]).length > 2000 ? (
	                                    <div className="mt-3 text-[10px] text-amber-300 uppercase tracking-widest font-black">
	                                      TRUNCATED: showing first 2000 lines
	                                    </div>
	                                  ) : null}
	                                </pre>
	                              ) : (
	                                <div className="grid grid-cols-2 gap-px bg-white/5">
	                                  {corpusOpsToSideBySideRows(corpusDiff.ops as DiffOp[]).slice(0, 2000).map((row, ri) => {
	                                    const cellCls = (c: SideCell) =>
	                                      clsx(
	                                        "min-w-0 px-4 py-1.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words transition-colors",
	                                        c.kind === "add"
	                                          ? "bg-green-500/10 text-green-200"
	                                          : c.kind === "del"
	                                            ? "bg-rose-500/10 text-rose-300"
	                                            : c.kind === "context"
	                                              ? "bg-black/20 text-slate-400"
	                                              : "bg-black/40 text-slate-700"
	                                      );
	
	                                    const lnCls = "select-none text-slate-700 text-[9px] pr-3 font-black inline-block w-8 text-right";
	
	                                    return (
	                                      <React.Fragment key={ri}>
	                                        <div className={cellCls(row.left)}>
	                                          <span className={lnCls}>{row.left.lineNo ?? ""}</span>
	                                          {row.left.text ?? ""}
	                                        </div>
	                                        <div className={cellCls(row.right)}>
	                                          <span className={lnCls}>{row.right.lineNo ?? ""}</span>
	                                          {row.right.text ?? ""}
	                                        </div>
	                                      </React.Fragment>
	                                    );
	                                  })}
	                                  {(corpusDiff.ops as DiffOp[]).length > 2000 ? (
	                                    <div className="col-span-2 px-5 py-3 text-[10px] text-amber-300 uppercase tracking-widest font-black bg-black/30">
	                                      TRUNCATED: showing first 2000 rows
	                                    </div>
	                                  ) : null}
	                                </div>
	                              )
	                            ) : (
	                              <div className="p-6 text-sm text-slate-400">Computing diff…</div>
	                            )}
	                          </div>
	                        )}
	                      </div>
	                    ) : null}

                    {activeTab === "snapshot" ? <MarkdownView markdown={snapshotMarkdown} /> : null}
                    {activeTab === "raw" ? (
                      <pre className="rounded-2xl border border-white/10 bg-black/40 p-8 overflow-auto max-h-[72vh] text-[12px] font-mono leading-relaxed text-slate-300 custom-scrollbar selection:bg-green-500/30 shadow-inner">
                        {snapshotMarkdown}
                      </pre>
                    ) : null}

                    {activeTab === "ledger" ? (
                      <div className="space-y-4">
                        {!selectedCommit.review ? (
                          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center border-dashed">
                            <HelpCircle className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                            <div className="text-base font-black tracking-widest text-slate-400 uppercase">UNREVIEWED_PROTOCOL_NODE</div>
                            <p className="mt-2 text-xs font-bold text-slate-600 uppercase tracking-widest">
                              No manual change-groups have been logged for this archive node yet.
                            </p>
                          </div>
                        ) : (
                          <>
                            {(selectedCommit.review.groups || []).map((g, gi) => {
                              const conf = typeof g.confidence === "number" ? Math.max(0, Math.min(1, g.confidence)) : 0;
                              const confPct = Math.round(conf * 100);
                              const buckets = (g.buckets || []).filter((b) => b >= 0 && b <= 10) as BucketKey[];
                              return (
                                <div key={gi} className="rounded-2xl border border-white/10 bg-black/40 p-6 md:p-8 shadow-xl relative group">
                                  <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-8 pb-8 border-b border-white/5">
                                    <div className="min-w-0">
                                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">GROUP_SEQUENCE_{String(gi + 1).padStart(2, '0')}</div>
                                      <div className="mt-2 text-xl md:text-2xl font-black tracking-tight text-white uppercase italic">
                                        {g.title || "Untitled_Sequence"}
                                      </div>
                                      <div className="mt-4 flex flex-wrap gap-2">
                                        {(buckets.length ? buckets : ([10] as BucketKey[])).map((b) => (
                                          <BucketChip key={b} bucket={b} onClick={() => openBucketInfo(b)} />
                                        ))}
                                      </div>
                                    </div>

                                    <div className="shrink-0 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4 min-w-[160px] shadow-inner">
                                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                                        CONFIDENCE
                                        <span className={clsx("font-mono text-xs", conf > 0.8 ? "text-green-400" : "text-amber-400")}>{confPct}%</span>
                                      </div>
                                      <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden border border-white/5">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${confPct}%` }}
                                          transition={{ duration: 1, ease: "easeOut" }}
                                          className="h-full rounded-full"
                                          style={{ background: conf > 0.8 ? "rgba(34,197,94,0.8)" : "rgba(251,191,36,0.8)", boxShadow: "0 0 10px currentColor" }}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Info className="h-3 w-3" />
                                        RATIONALE_LOG
                                      </div>
                                      <p className="text-[13px] leading-relaxed text-slate-300 font-medium">{g.rationale || "No rationale provided."}</p>
                                    </div>

                                    <div>
                                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Terminal className="h-3 w-3" />
                                        EVIDENCE_LEDGER
                                      </div>
                                      <ul className="space-y-3">
                                        {(g.evidence || []).length ? (
                                          (g.evidence || []).map((e, ei) => (
                                            <li key={ei} className="text-[12px] text-slate-400 flex gap-3 leading-relaxed">
                                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-green-500/40" />
                                              {e}
                                            </li>
                                          ))
                                        ) : (
                                          <li className="text-xs text-slate-700 italic font-bold uppercase tracking-tighter">_LEDGER_EMPTY</li>
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {(selectedCommit.review.notes || []).length ? (
                              <FrankenContainer withBolts={false} className="bg-white/[0.02] border-white/10 p-8 shadow-2xl">
                                <div className="text-sm font-black tracking-[0.2em] text-white uppercase mb-4 flex items-center gap-3">
                                  <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                                  OPEN_QUERIES_&_OBSERVATIONS
                                </div>
                                <ul className="grid gap-4">
                                  {(selectedCommit.review.notes || []).map((n, ni) => (
                                    <li key={ni} className="text-[13px] font-medium text-slate-400 bg-white/5 p-4 rounded-xl border border-white/5 flex gap-4 leading-relaxed">
                                      <span className="text-amber-500/60 font-mono text-[10px] font-black mt-0.5">[{String(ni + 1).padStart(2, '0')}]</span>
                                      {n}
                                    </li>
                                  ))}
                                </ul>
                              </FrankenContainer>
                            ) : null}
                          </>
                        )}
                      </div>
                    ) : null}

                    {activeTab === "files" ? (
                      compareModel ? (
                        <div className="space-y-6">
                          <div
                            data-testid="compare-file-summary"
                            className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                A→B_FILE_SUMMARY
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-black text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                  A {compareModel.base.short}
                                </span>
                                <span className="text-slate-700">→</span>
                                <span className="font-mono text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                  B {compareModel.target.short}
                                </span>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                              {(
                                [
                                  ["ADDED", compareModel.fileSummary.added, "text-green-300 border-green-500/20 bg-green-500/5"],
                                  ["REMOVED", compareModel.fileSummary.removed, "text-rose-300 border-rose-500/20 bg-rose-500/5"],
                                  ["MODIFIED", compareModel.fileSummary.modified, "text-amber-200 border-amber-500/20 bg-amber-500/5"],
                                ] as const
                              ).map(([label, list, cls]) => (
                                <div key={label} className={clsx("rounded-xl border p-4", cls)}>
                                  <div className="text-[9px] font-black uppercase tracking-widest opacity-80">
                                    {label} <span className="ml-2 font-mono">({list.length})</span>
                                  </div>
                                  {list.length ? (
                                    <ul className="mt-3 space-y-1">
                                      {list.slice(0, 12).map((p) => (
                                        <li key={p} className="font-mono text-[11px] text-slate-300 truncate">
                                          {p}
                                        </li>
                                      ))}
                                      {list.length > 12 ? (
                                        <li className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                                          +{list.length - 12} more
                                        </li>
                                      ) : null}
                                    </ul>
                                  ) : (
                                    <div className="mt-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                      NONE
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                            COMMIT_PATCH_NUMSTAT (prev→B)
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            {selectedCommit.numstat.map((ns) => (
                              <div key={ns.path} className="rounded-2xl border border-white/5 bg-black/40 p-6 shadow-xl hover:border-white/10 transition-colors group">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <div className="font-mono text-xs font-bold text-slate-500 uppercase tracking-tighter group-hover:text-slate-300 transition-colors">{ns.path}</div>
                                    <div className="mt-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                      <span className="text-green-400 bg-green-500/10 px-2 py-1 rounded">+{ns.added || 0}</span>
                                      <span className="text-rose-400 bg-rose-500/10 px-2 py-1 rounded">-{ns.deleted || 0}</span>
                                    </div>
                                  </div>
                                  <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] border-l border-white/5 pl-4 py-1">
                                    DELTA_Σ
                                    <div className="mt-1 text-base font-mono text-slate-500">{(ns.added || 0) + (ns.deleted || 0)}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                          {selectedCommit.numstat.map((ns) => (
                            <div key={ns.path} className="rounded-2xl border border-white/5 bg-black/40 p-6 shadow-xl hover:border-white/10 transition-colors group">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="font-mono text-xs font-bold text-slate-500 uppercase tracking-tighter group-hover:text-slate-300 transition-colors">{ns.path}</div>
                                  <div className="mt-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-green-400 bg-green-500/10 px-2 py-1 rounded">+{ns.added || 0}</span>
                                    <span className="text-rose-400 bg-rose-500/10 px-2 py-1 rounded">-{ns.deleted || 0}</span>
                                  </div>
                                </div>
                                <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] border-l border-white/5 pl-4 py-1">
                                  DELTA_Σ
                                  <div className="mt-1 text-base font-mono text-slate-500">{(ns.added || 0) + (ns.deleted || 0)}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : null}

                    {distanceOut ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 bg-green-500/[0.03] border border-green-500/10 rounded-xl p-4 text-[10px] font-black uppercase tracking-[0.2em] text-green-500/60 font-mono"
                      >
                        {distanceOut}
                      </motion.div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>
              <FrankenStitch className="absolute bottom-0 left-1/4 right-1/4 w-1/2 opacity-10" />
            </FrankenContainer>
          </section>
        </div>
      </div>

      {/* Legend */}
      <DialogShell
        dialogRef={legendDialogRef}
        title="Forensic Taxonomy Legend"
        subtitle="Manual change-group categorization buckets"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {BUCKET_KEYS.map((b) => {
            const active = bucketFilter === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => {
                  toggleBucketFilter(b);
                  legendDialogRef.current?.close();
                }}
                className={clsx(
                  "w-full text-left rounded-2xl border px-5 py-4 transition-all group relative overflow-hidden",
                  active 
                    ? "bg-green-500/10 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.1)]" 
                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                )}
              >
                {active && <NeuralPulse className="opacity-40" />}
                <div className="flex items-start gap-4 relative z-10">
                  <div className="mt-1 h-3 w-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ background: bucketColors[b], color: bucketColors[b] }} />
                  <div className="min-w-0">
                    <div className="text-sm font-black tracking-tight text-white uppercase tracking-wider">
                      {b}. {bucketNames[b]}
                    </div>
                    <div className="mt-1.5 text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-widest">{dataset.bucket_defs?.[String(b)] || "System default protocol."}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogShell>

      {/* Bucket info */}
      <DialogShell
        dialogRef={bucketInfoDialogRef}
        title={bucketInfo !== null ? `${bucketInfo}. ${bucketNames[bucketInfo].toUpperCase()}` : "BUCKET_NODE"}
        subtitle="Forensic category details"
      >
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 shadow-inner">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">SYSTEM_DEFINITION</div>
            <p className="text-sm font-medium text-slate-300 leading-relaxed italic">&ldquo;{bucketInfoDesc || "No manual definition provided for this node."}&rdquo;</p>
            <div className="mt-6 flex items-center gap-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">
              CURRENT_FILTER_STATUS: <span className={clsx(bucketFilter === bucketInfo ? "text-green-400" : "text-slate-400")}>{bucketFilter === bucketInfo ? "ACTIVE" : "INACTIVE"}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (bucketInfo === null) return;
                toggleBucketFilter(bucketInfo);
              }}
              className="flex-1 rounded-full border border-green-500/20 bg-green-500/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-green-400 hover:bg-green-500/20 transition-all active:scale-95 shadow-lg"
            >
              <span className="flex items-center justify-center gap-3">
                <Filter className="h-4 w-4" />
                {bucketInfo !== null && bucketFilter === bucketInfo ? "CLEAR_FILTER" : "FILTER_BY_NODE"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                bucketInfoDialogRef.current?.close();
                openLegend();
              }}
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 shadow-lg"
            >
              <span className="flex items-center justify-center gap-3">
                <Info className="h-4 w-4" />
                VIEW_ALL_TAXONOMY
              </span>
            </button>
          </div>
        </div>
      </DialogShell>

      {/* Controls (mobile) */}
      <DialogShell
        dialogRef={controlsDialogRef}
        title="Tools & Parameters"
        subtitle="Forensic traversal configuration"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">SEARCH_ARCHIVE</div>
              <button
                type="button"
                onClick={() => setSearchScope((s) => s === "thisCommit" ? "allCommits" : "thisCommit")}
                className={clsx(
                  "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider transition-all border",
                  searchScope === "allCommits"
                    ? "bg-green-500/15 text-green-400 border-green-500/30"
                    : "bg-white/5 text-slate-500 border-white/10"
                )}
              >
                {searchScope === "allCommits" ? "ALL_NODES" : "THIS_NODE"}
              </button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchScope === "allCommits" ? "SEARCH_ALL_NODES..." : "SEARCH_THIS_NODE..."}
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-4 text-xs font-bold tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">TEMPORAL_SCALE</div>
              <select
                value={bucketMode}
                onChange={(e) => setBucketMode(e.target.value as BucketMode)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none"
              >
                <option value="day">Day</option>
                <option value="hour">Hour</option>
                <option value="15m">15m</option>
                <option value="5m">5m</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">METRIC_DIMENSION</div>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value as MetricKey)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none"
              >
                <option value="groups">Groups</option>
                <option value="lines">Lines</option>
                <option value="patchBytes">Bytes</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                controlsDialogRef.current?.close();
                openLegend();
              }}
              className="w-full rounded-2xl border border-green-500/20 bg-green-500/10 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-green-400"
            >
              LEGEND
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => downloadObjectAsJson(dataset, "frankentui_spec_evolution_dataset.json")}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300"
              >
                EXPORT_JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  controlsDialogRef.current?.close();
                  openCommits();
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300"
              >
                COMMITS
              </button>
            </div>
          </div>
        </div>
      </DialogShell>

      {/* Commits (mobile) */}
      <DialogShell dialogRef={commitsDialogRef} title="Archive Nodes" subtitle="Historical snapshots traversal">
        <div className="max-h-[72vh] overflow-auto -mx-6">
          {filteredCommits.map((c) => {
            const weights = perCommitBucketWeights(c, softMode);
            const bucketKeys = Object.keys(weights)
              .map((x) => parseInt(x, 10))
              .filter((b) => Number.isFinite(b) && b >= 0 && b <= 10) as BucketKey[];
            const showBuckets = (c.reviewed ? bucketKeys.filter((b) => b !== 0) : bucketKeys).slice(0, 4);

            return (
              <button
                key={c.sha}
                type="button"
                onClick={() => {
                  selectCommit(c.idx);
                  commitsDialogRef.current?.close();
                }}
                className={clsx(styles.commitRow, "w-full text-left px-6 py-5 border-b border-white/5 hover:bg-white/5 transition-colors active:bg-green-500/5 group")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-mono text-[10px] font-black text-green-500">{c.short}</span>
                      <span className="font-mono text-[10px] text-slate-600 font-bold">{c.dateShort}</span>
                    </div>
                    <div className="text-sm font-black text-white leading-tight mb-3 group-active:text-green-400">{c.subject || "Untitled Archive Node"}</div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {showBuckets.length ? (
                        showBuckets.map((b) => (
                          <span
                            key={b}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.03] border border-white/5 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-500"
                          >
                            <span className="h-1.5 w-1.5 rounded-full shadow-[0_0_3px_currentColor]" style={{ background: bucketColors[b], color: bucketColors[b] }} />
                            {b}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-slate-700 font-black uppercase tracking-tighter italic">NULL_BUCKET</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {c.reviewed ? (
                      <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-green-400">
                        VALIDATED
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-slate-600">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogShell>

      {/* Help */}
      <DialogShell dialogRef={helpDialogRef} title="Traversal Protocols" subtitle="Archive node interface keybindings">
        <div className="grid gap-4">
          {[
            { key: "← / →", action: "Archive Node Traversal (Previous / Next)" },
            { key: "?", action: "Display Protocol Metadata" },
            { key: "/", action: "Focus Forensic Search Interface (Desktop)" },
            { key: "Esc", action: "Terminate Dialog Session" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-green-500/30 transition-all">
              <span className="font-mono text-xs font-black text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)] group-hover:scale-110 transition-transform">{item.key}</span>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">{item.action}</span>
            </div>
          ))}
        </div>
      </DialogShell>

      {/* Perf Diagnostics Panel (Ctrl+Shift+P to toggle) */}
      {showPerfPanel && (
        <div className={styles.perfPanel}>
          <div className="sticky top-0 flex items-center justify-between px-3 py-2 bg-black/95 border-b border-green-500/20">
            <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">PERF_DIAGNOSTICS</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { perfLog.length = 0; perfTickRef.current++; }}
                className="text-[8px] font-black text-slate-500 uppercase tracking-wider hover:text-white"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowPerfPanel(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="p-2 space-y-0.5">
            <div className="flex items-center gap-2 text-[9px] text-slate-600 font-bold px-1 pb-1 border-b border-white/5">
              <span className="w-[140px]">Operation</span>
              <span className="w-[60px] text-right">Time</span>
            </div>
            {perfLog.slice(-50).reverse().map((entry, i) => (
              <div key={`${entry.ts}-${i}`} className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-white/5">
                <span className="w-[140px] truncate text-slate-400">{entry.label}</span>
                <span className={clsx(
                  "w-[60px] text-right font-mono",
                  entry.ms > 100 ? "text-rose-400" : entry.ms > 16 ? "text-amber-400" : "text-green-400"
                )}>
                  {entry.ms < 1 ? `${(entry.ms * 1000).toFixed(0)}µs` : `${entry.ms.toFixed(1)}ms`}
                </span>
              </div>
            ))}
            {perfLog.length === 0 && (
              <div className="text-[9px] text-slate-700 px-1 py-2 italic">No perf entries yet. Interact with the lab to generate timings.</div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
