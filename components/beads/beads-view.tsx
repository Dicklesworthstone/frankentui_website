"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { 
  Binary, 
  Activity, 
  Shield, 
  Zap, 
  Search, 
  Network, 
  List as ListIcon,
  Maximize2,
  ChevronRight,
  Clock,
  User,
  AlertTriangle,
  Info,
  X
} from "lucide-react";
import { FrankenContainer, NeuralPulse } from "@/components/franken-elements";
import FrankenGlitch from "@/components/franken-glitch";
import { cn, formatDate } from "@/lib/utils";
import Script from "next/script";
import BeadHUD from "@/components/bead-hud";
import Streamdown from "@/components/ui/streamdown";

// --- Minimal types for the embedded sql.js + force-graph viewer (loaded via <Script>) ---
type SqlExecResult = { columns: string[]; values: unknown[][] };

type SqlJsDatabase = {
  exec: (sql: string, params?: unknown[]) => SqlExecResult[];
};

type SqlJsStatic = {
  Database: new (data: Uint8Array) => SqlJsDatabase;
};

type ForceGraphNode = {
  id: string;
  title: string;
  status: string;
  priority: number;
  val: number;
  x?: number;
  y?: number;
};

type ForceGraphLink = { source: string; target: string };

interface ForceGraphInstance {
  graphData: (data: { nodes: ForceGraphNode[]; links: ForceGraphLink[] }) => ForceGraphInstance;
  nodeColor: (fn: (node: ForceGraphNode) => string) => ForceGraphInstance;
  nodeLabel: (fn: (node: ForceGraphNode) => string) => ForceGraphInstance;
  linkColor: (fn: () => string) => ForceGraphInstance;
  linkDirectionalParticles: (n: number) => ForceGraphInstance;
  linkDirectionalParticleSpeed: (s: number) => ForceGraphInstance;
  linkDirectionalParticleColor: (fn: () => string) => ForceGraphInstance;
  linkDirectionalParticleWidth: (w: number) => ForceGraphInstance;
  backgroundColor: (c: string) => ForceGraphInstance;
  width: (w: number) => ForceGraphInstance;
  height: (h: number) => ForceGraphInstance;
  nodeCanvasObject: (fn: (node: ForceGraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => void) => ForceGraphInstance;
  onNodeClick: (fn: (node: ForceGraphNode) => void) => ForceGraphInstance;
  zoom(): number;
  zoom(zoom: number, ms?: number): ForceGraphInstance;
  zoomToFit: (ms: number, padding?: number) => ForceGraphInstance;
}

type ForceGraphConstructor = () => (el: HTMLElement) => ForceGraphInstance;

declare global {
  interface Window {
    initSqlJs?: (config: { locateFile: (file: string) => string }) => Promise<SqlJsStatic>;
    d3?: unknown;
    ForceGraph?: ForceGraphConstructor;
  }
}

// --- Types ---
interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  issue_type: string;
  assignee: string;
  labels: string; // JSON string
  created_at: string;
  updated_at: string;
  blocks_count?: number;
  blocked_by_count?: number;
  triage_score?: number;
}

// --- Constants ---
const THEME = {
  bg: "#020a02",
  green: "#22c55e",
  emerald: "#10b981",
  slate: "#64748b",
  red: "#ef4444",
  amber: "#f59e0b",
  purple: "#a855f7"
};

const STATUS_COLORS: Record<string, string> = {
  open: THEME.green,
  in_progress: THEME.amber,
  blocked: THEME.red,
  closed: THEME.slate
};

// --- Helper Components ---

type StatusStats = Record<string, number> & { total: number };

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : String(value);
}

function asNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeIssueRow(row: Record<string, unknown>): Issue {
  return {
    id: asString(row.id),
    title: asString(row.title),
    description: asString(row.description),
    status: asString(row.status),
    priority: asNumber(row.priority),
    issue_type: asString(row.issue_type),
    assignee: asString(row.assignee),
    labels: asString(row.labels),
    created_at: asString(row.created_at),
    updated_at: asString(row.updated_at),
    blocks_count: row.blocks_count === null || row.blocks_count === undefined ? undefined : asNumber(row.blocks_count),
    blocked_by_count: row.blocked_by_count === null || row.blocked_by_count === undefined ? undefined : asNumber(row.blocked_by_count),
    triage_score: row.triage_score === null || row.triage_score === undefined ? undefined : asNumber(row.triage_score),
  };
}

function StatusPill({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || THEME.green;
  return (
    <span 
      className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0"
      style={{ 
        color, 
        borderColor: `${color}40`,
        backgroundColor: `${color}10`
      }}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(rafId);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// --- Main Component ---

export default function BeadsView() {
  const [db, setDb] = useState<SqlJsDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Initializing System...");
  
  // Data State
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<StatusStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  // Script Loading State
  const [sqlLoaded, setSqlLoaded] = useState(false);
  const [d3Loaded, setD3Loaded] = useState(false);
  const [forceGraphLoaded, setForceGraphLoaded] = useState(false);
  
  const graphRef = useRef<ForceGraphInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for already loaded scripts on mount
  useEffect(() => {
    const w = window as Window & { initSqlJs?: unknown; d3?: unknown; ForceGraph?: unknown };
    if (typeof w.initSqlJs === "function") setSqlLoaded(true);
    if (w.d3) setD3Loaded(true);
    if (typeof w.ForceGraph === "function") setForceGraphLoaded(true);
  }, []);

  // Reassemble database chunks
  const loadDatabase = useCallback(async () => {
    if (db) return;

    try {
      setLoading(true);
      setError(null);
      setLoadingMessage("Fetching Core Data...");
      
      const configResp = await fetch("/beads-viewer/beads.sqlite3.config.json");
      if (!configResp.ok) throw new Error("Database configuration not found.");
      const config = (await configResp.json()) as { chunk_count?: unknown };
      const chunkCount = asNumber(config.chunk_count);
      if (chunkCount <= 0) throw new Error("Invalid database configuration.");
      
      setLoadingMessage(`Downloading Neural Chunks (0/${chunkCount})...`);
      
      let downloadedCount = 0;
      // Fetch all chunks in parallel with progress tracking
      const chunkPromises = Array.from({ length: chunkCount }).map(async (_, i) => {
        const chunkPath = `/beads-viewer/chunks/${String(i).padStart(5, '0')}.bin`;
        const response = await fetch(chunkPath);
        if (!response.ok) throw new Error(`Neural Chunk ${i} extraction failed.`);
        const data = new Uint8Array(await response.arrayBuffer());
        
        downloadedCount += 1;
        setLoadingMessage(`Downloading Neural Chunks (${downloadedCount}/${chunkCount})...`);
        
        return data;
      });

      const chunks = await Promise.all(chunkPromises);

      setLoadingMessage("Stitching Synapses...");
      const totalSize = chunks.reduce((sum, c) => sum + c.length, 0);
      const combined = new Uint8Array(totalSize);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      if (typeof window.initSqlJs !== "function") {
        throw new Error("SQL Engine not found in namespace.");
      }

      const SQL = await window.initSqlJs({
        locateFile: (file: string) => `/beads-viewer/vendor/${file}`
      });

      const database = new SQL.Database(combined);
      setDb(database);
      setLoadingMessage("Synchronization Complete.");
      setLoading(false);
    } catch (err: unknown) {
      console.error("Failed to load database:", err);
      const message =
        err instanceof Error ? err.message : (typeof err === "string" ? err : "Unknown system failure.");
      setError(message);
      setLoadingMessage("CRITICAL_FAILURE: System corruption detected.");
      // Ensure we don't hang in a loading state if chunk fetching fails
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (sqlLoaded && !db) {
      loadDatabase();
    }
  }, [sqlLoaded, db, loadDatabase]);

  // Initialize data once DB is ready
  useEffect(() => {
    if (!db) return;

    const fetchInitialData = () => {
      try {
        // Stats
        const statusCounts = db.exec(
          `SELECT status, COUNT(*) as count FROM issues GROUP BY status`
        );
        const statsObj: StatusStats = { total: 0 };
        if (statusCounts.length > 0) {
          for (const row of statusCounts[0].values) {
            const status = asString(row[0]);
            const count = asNumber(row[1]);
            statsObj[status] = count;
            statsObj.total += count;
          }
        }
        setStats(statsObj);

        // Issues for list
        const issuesResult = db.exec(`
          SELECT i.*, 
          (SELECT COUNT(*) FROM dependencies WHERE depends_on_id = i.id) as blocks_count,
          (SELECT COUNT(*) FROM dependencies WHERE issue_id = i.id) as blocked_by_count
          FROM issues i 
          ORDER BY i.priority ASC, i.updated_at DESC 
          LIMIT 100
        `);
        
        if (issuesResult.length > 0) {
          const columns = issuesResult[0].columns;
          const rows: Issue[] = issuesResult[0].values.map((row) => {
            const obj: Record<string, unknown> = {};
            columns.forEach((col, i) => {
              obj[col] = row[i];
            });
            return normalizeIssueRow(obj);
          });
          setIssues(rows);
        }
      } catch (err) {
        console.error("Data fetch error:", err);
      }
    };

    fetchInitialData();
  }, [db]);

  const renderGraph = useCallback(() => {
    const container = containerRef.current;
    if (!db || !container || !forceGraphLoaded || !d3Loaded || !window.ForceGraph) return undefined;

    try {
      container.innerHTML = "";

      // Fetch graph data
      const nodesRes = db.exec(`SELECT id, title, status, priority FROM issues`);
      const linksRes = db.exec(`SELECT issue_id, depends_on_id FROM dependencies WHERE type = 'blocks'`);

      if (!nodesRes.length) return;

      const nodes: ForceGraphNode[] = nodesRes[0].values.map((row) => {
        const priority = asNumber(row[3]);
        return {
          id: asString(row[0]),
          title: asString(row[1]),
          status: asString(row[2]),
          priority,
          val: (5 - priority) * 2 + 2,
        };
      });

      const links: ForceGraphLink[] = linksRes.length
        ? linksRes[0].values.map((row) => ({
            source: asString(row[0]),
            target: asString(row[1]),
          }))
        : [];

      const Graph = window.ForceGraph()(container)
        .graphData({ nodes, links })
        .nodeColor((node) => STATUS_COLORS[node.status] || THEME.green)
        .nodeLabel((node) => `${node.id}: ${node.title}`)
        .linkColor(() => "rgba(34, 197, 94, 0.15)")
        .linkDirectionalParticles(2)
        .linkDirectionalParticleSpeed(0.005)
        .linkDirectionalParticleColor(() => THEME.green)
        .linkDirectionalParticleWidth(2)
        .backgroundColor("rgba(0,0,0,0)")
        .width(container.clientWidth)
        .height(container.clientHeight || 650)
        .nodeCanvasObject((node, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const size = (5 - node.priority) * 1.5 + 3;
          const x = typeof node.x === "number" ? node.x : 0;
          const y = typeof node.y === "number" ? node.y : 0;
          
          ctx.save();
          // Glow effect
          ctx.shadowColor = STATUS_COLORS[node.status] || THEME.green;
          ctx.shadowBlur = 15 / globalScale;
          
          ctx.beginPath(); 
          ctx.arc(x, y, size, 0, 2 * Math.PI, false); 
          ctx.fillStyle = STATUS_COLORS[node.status] || THEME.green;
          ctx.fill();
          
          ctx.shadowBlur = 0;

          if (globalScale > 1.2) {
            const label = node.id;
            const fontSize = 10 / globalScale;
            ctx.font = `${fontSize}px JetBrains Mono`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.fillText(label, x, y + size + (5 / globalScale));
          }
          ctx.restore();
        })
        .onNodeClick((node) => {
          try {
            const result = db.exec(`
              SELECT i.*, 
              (SELECT COUNT(*) FROM dependencies WHERE depends_on_id = i.id) as blocks_count,
              (SELECT COUNT(*) FROM dependencies WHERE issue_id = i.id) as blocked_by_count
              FROM issues i WHERE id = ?
            `, [node.id]);
            
            if (result && result.length > 0 && result[0].values.length > 0) {
              const columns = result[0].columns;
              const row = result[0].values[0];
              const obj: Record<string, unknown> = {};
              columns.forEach((col, i) => {
                obj[col] = row[i];
              });
              setSelectedIssue(normalizeIssueRow(obj));
            }
          } catch (err) {
            console.error("Failed to fetch issue details:", err);
          }
        });

      graphRef.current = Graph;

      const resizeObserver = new ResizeObserver(() => {
        if (container) {
          Graph.width(container.clientWidth);
          Graph.height(container.clientHeight || 650);
        }
      });
      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
        graphRef.current = null;
        // Best-effort teardown: remove canvas and let GC reclaim the instance.
        container.innerHTML = "";
      };
    } catch (err) {
      console.error("Graph render error:", err);
    }

    return undefined;
  }, [db, forceGraphLoaded, d3Loaded]);

  useEffect(() => {
    if (loading || !db || !forceGraphLoaded || !d3Loaded) return undefined;

    let cleanup: undefined | (() => void);
    const timer = window.setTimeout(() => {
      cleanup = renderGraph();
    }, 500);

    return () => {
      window.clearTimeout(timer);
      if (cleanup) cleanup();
    };
  }, [loading, db, forceGraphLoaded, d3Loaded, renderGraph]);

  const filteredIssues = useMemo(() => {
    if (!searchQuery) return issues;
    const q = searchQuery.toLowerCase();
    return issues.filter(i => 
      i.id.toLowerCase().includes(q) || 
      i.title.toLowerCase().includes(q) || 
      i.description?.toLowerCase().includes(q)
    );
  }, [issues, searchQuery]);

  return (
    <div className="flex flex-col gap-12 w-full min-h-[800px] relative">
      <Script 
        src="/beads-viewer/vendor/sql-wasm.js" 
        onLoad={() => setSqlLoaded(true)} 
        onError={() => { setError("SQL Engine Load Failure"); setLoading(false); }}
      />
      <Script 
        src="/beads-viewer/vendor/d3.v7.min.js" 
        onLoad={() => setD3Loaded(true)} 
        onError={() => { setError("D3 Visualization Library Load Failure"); setLoading(false); }}
      />
      <Script 
        src="/beads-viewer/vendor/force-graph.min.js" 
        onLoad={() => setForceGraphLoaded(true)} 
        onError={() => { setError("ForceGraph Renderer Load Failure"); setLoading(false); }}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[600px] w-full bg-black/40 rounded-3xl border border-green-500/10 backdrop-blur-xl overflow-hidden relative">
          <NeuralPulse />
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="relative h-24 w-24 mb-8">
            <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
            <div className="absolute inset-0 border-t-4 border-green-500 rounded-full animate-spin" />
            <Binary className="absolute inset-0 m-auto h-8 w-8 text-green-500" />
          </motion.div>
          <p className={cn("text-sm font-black uppercase tracking-[0.4em]", error ? "text-red-500" : "text-green-500 animate-pulse")}>{loadingMessage}</p>
          {error && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <p className="text-xs text-red-400 font-mono max-w-md text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>
              <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Retry_System_Load</button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* --- 1. GLOBAL TELEMETRY --- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "OPEN", key: "open", color: THEME.green, icon: Activity },
              { label: "ACTIVE", key: "in_progress", color: THEME.amber, icon: Zap },
              { label: "BLOCKED", key: "blocked", color: THEME.red, icon: AlertTriangle },
              { label: "RESOLVED", key: "closed", color: THEME.slate, icon: Shield }
            ].map((stat) => (
              <FrankenContainer key={stat.key} withPulse={true} className="p-6 bg-black/40 border-white/5 group">
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-white transition-colors">{stat.label}</span>
                  <stat.icon className="h-3 w-3" style={{ color: stat.color }} />
                </div>
                <div className="flex items-baseline gap-2 relative z-10 text-left">
                  <p className="text-4xl font-black text-white tabular-nums">{stats?.[stat.key] || 0}</p>
                  <span className="text-[10px] font-bold text-slate-700">/ {stats?.total || 0}</span>
                </div>
                <div className="mt-6 h-1 w-full rounded-full overflow-hidden bg-white/5 relative z-10">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${((stats?.[stat.key] || 0) / (stats?.total || 1)) * 100}%` }} className="h-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: stat.color, color: stat.color }} />
                </div>
              </FrankenContainer>
            ))}
          </div>

          {/* --- 2. MAIN VISTA --- */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch text-left">
            <div className="xl:col-span-2 min-h-[400px] md:min-h-[650px] relative rounded-[2.5rem] border border-green-500/10 overflow-hidden bg-[#010501] shadow-2xl">
              <NeuralPulse className="opacity-20" />
              <div ref={containerRef} className="w-full h-full min-h-[400px] md:min-h-[650px]" />
              <BeadHUD />
              <div className="absolute top-8 right-8 flex flex-col gap-3 pointer-events-auto">
                <button
                  onClick={() => {
                    const g = graphRef.current;
                    if (!g) return;
                    g.zoom(g.zoom() * 1.5, 400);
                  }}
                  className="h-12 w-12 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-slate-400 flex items-center justify-center hover:bg-green-500 hover:text-black hover:border-green-400 transition-all shadow-2xl group"
                >
                  <Maximize2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    const g = graphRef.current;
                    if (!g) return;
                    g.zoomToFit(600, 80);
                  }}
                  className="h-12 w-12 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-slate-400 flex items-center justify-center hover:bg-green-500 hover:text-black hover:border-green-400 transition-all shadow-2xl group"
                >
                  <Network className="h-5 w-5 group-hover:rotate-180 transition-transform duration-700" />
                </button>
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-4 rounded-full bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] scale-75 md:scale-100">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-3 text-white">
                    <div className="h-2 w-2 rounded-full shadow-[0_0_10px_currentColor] animate-pulse" style={{ backgroundColor: color, color }} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 flex flex-col h-full">
              <div className="flex items-center gap-3 text-slate-500 px-2 text-left">
                <Clock className="h-5 w-5" />
                <h3 className="text-lg font-black text-white uppercase tracking-widest">Neural_Activity</h3>
              </div>
              <div className="flex-1 rounded-[2.5rem] border border-white/5 bg-black/40 relative overflow-hidden group p-8">
                <NeuralPulse className="opacity-0 group-hover:opacity-20 transition-opacity" />
                <div className="space-y-8 relative z-10">
                  {issues.slice(0, 8).map((issue) => (
                    <div key={issue.id} className="relative pl-8 border-l border-white/10 group/item cursor-pointer text-left" onClick={() => setSelectedIssue(issue)}>
                      <div className="absolute left-[-4.5px] top-0 h-2 w-2 rounded-full bg-green-500/20 group-hover/item:bg-green-500 group-hover/item:shadow-[0_0_10px_#22c55e] transition-all" />
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 group-hover/item:text-green-500/60 transition-colors">{formatDate(issue.updated_at)}</p>
                      <h5 className="text-sm font-bold text-slate-400 group-hover/item:text-white transition-colors leading-relaxed line-clamp-2">{issue.title}</h5>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- 3. SEARCH & LEDGER --- */}
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
              <div className="flex items-center gap-3 text-left">
                <ListIcon className="h-5 w-5 text-green-500" />
                <FrankenGlitch trigger="hover" intensity="low">
                  <h3 className="text-xl font-black text-white uppercase tracking-widest">Priority_Ledger</h3>
                </FrankenGlitch>
              </div>
              <div className="relative group w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-green-500 transition-colors" />
                <input type="text" placeholder="SCAN_ARCHIVE_DATA..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 pr-6 py-4 bg-black/60 border border-white/10 rounded-2xl text-[11px] font-black text-white placeholder-slate-700 focus:outline-none focus:border-green-500/50 w-full transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIssues.map((issue) => (
                <button key={issue.id} onClick={() => setSelectedIssue(issue)} className="w-full text-left group focus:outline-none">
                  <FrankenContainer withStitches={false} withPulse={true} className="p-6 bg-black/40 border-white/5 hover:border-green-500/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-8 relative z-10 text-left">
                      <span className="font-mono text-[11px] font-black text-slate-700 group-hover:text-green-500/60 transition-colors w-20 tracking-tighter">{issue.id}</span>
                      <div className="h-10 w-px bg-white/5 hidden sm:block" />
                      <div>
                        <h4 className="text-base font-black text-white group-hover:text-green-400 transition-colors leading-tight line-clamp-1">{issue.title}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <StatusPill status={issue.status} />
                          <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest"><Binary className="h-3 w-3" />{issue.issue_type}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 relative z-10 sm:text-right">
                      <div className="flex flex-col sm:items-end text-left sm:text-right">
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] mb-1">Assigned_To</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><User className="h-3.5 w-3.5 text-slate-600" />{issue.assignee || "UNASSIGNED"}</div>
                      </div>
                      <div className="h-10 w-px bg-white/5 hidden sm:block" />
                      <ChevronRight className="h-6 w-6 text-slate-800 group-hover:text-green-500 transition-all group-hover:translate-x-1" />
                    </div>
                  </FrankenContainer>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* --- Detailed Synapse Portal (Modal) --- */}
      <AnimatePresence>
        {selectedIssue && (
          <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-12">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedIssue(null)} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 40 }} className="relative w-full max-w-5xl max-h-full overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.15)] text-left">
                <FrankenContainer withPulse={true} className="bg-[#020a02] border-green-500/20 overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-10 border-b border-white/5 flex items-start justify-between bg-white/[0.02] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none"><Binary className="h-64 w-64 rotate-12" /></div>
                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 rounded-xl bg-green-500 text-black text-[11px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">{selectedIssue.id}</span>
                        <StatusPill status={selectedIssue.status} />
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest border-l border-white/10 pl-4 ml-2"><Activity className="h-3 w-3" />Priority_P{selectedIssue.priority}</div>
                      </div>
                      <FrankenGlitch trigger="always" intensity="low"><h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight max-w-3xl">{selectedIssue.title}</h2></FrankenGlitch>
                    </div>
                    <button onClick={() => setSelectedIssue(null)} className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:bg-white/10 hover:text-white transition-all group"><X className="h-7 w-7 group-hover:rotate-90 transition-transform duration-500" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
                      <div className="xl:col-span-2 space-y-12">
                        <div className="space-y-6 text-left">
                          <div className="flex items-center gap-3"><Info className="h-4 w-4 text-green-500/60" /><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Synapse_Descriptor</h4></div>
                          <div className="text-slate-300 text-xl leading-relaxed font-medium">
                            <Streamdown content={selectedIssue.description || "System log empty. Descriptor required for complete synchronization."} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-[2rem] overflow-hidden border border-white/5">
                          <div className="p-6 bg-black/40"><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Type</span><p className="text-sm font-bold text-white mt-2 capitalize">{selectedIssue.issue_type}</p></div>
                          <div className="p-6 bg-black/40"><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Impact</span><p className="text-sm font-bold text-green-400 mt-2">+{selectedIssue.blocks_count || 0} Nodes</p></div>
                          <div className="p-6 bg-black/40"><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Born</span><p className="text-sm font-bold text-slate-400 mt-2">{formatDate(selectedIssue.created_at)}</p></div>
                          <div className="p-6 bg-black/40"><span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Updated</span><p className="text-sm font-bold text-slate-400 mt-2">{formatDate(selectedIssue.updated_at)}</p></div>
                        </div>
                        {selectedIssue.labels && (
                          <div className="space-y-4">
                             <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Neural_Fragments</h4>
                             <div className="flex flex-wrap gap-3">
                              {(() => {
                                try {
                                  const labels = JSON.parse(selectedIssue.labels);
                                  return Array.isArray(labels) ? labels.map((l: string) => (
                                    <span key={l} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-green-500/30 transition-colors cursor-default">{l}</span>
                                  )) : null;
                                } catch { return null; }
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-10">
                        <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] group text-left">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] block mb-6">Neural_Custodian</span>
                          <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-[1.25rem] bg-gradient-to-tr from-green-600 via-green-400 to-emerald-300 flex items-center justify-center text-black font-black text-xl uppercase shadow-[0_0_30px_rgba(34,197,94,0.3)]">{selectedIssue.assignee ? selectedIssue.assignee[0] : "?"}</div>
                            <div>
                              <p className="text-lg font-black text-white">{selectedIssue.assignee || "UNASSIGNED"}</p>
                              <div className="flex items-center gap-2 mt-1"><div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /><p className="text-[9px] font-black text-green-500/60 uppercase tracking-widest uppercase">Validated_Engineer</p></div>
                            </div>
                          </div>
                        </div>
                        <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] text-left">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] block mb-6">Downstream_Cascade</span>
                          <div className="space-y-5">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5"><span className="text-xs font-bold text-slate-500">Unlocks</span><span className="text-sm font-mono font-black text-green-500">{selectedIssue.blocks_count || 0}</span></div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5"><span className="text-xs font-bold text-slate-500">Blockers</span><span className="text-sm font-mono font-black text-red-500">{selectedIssue.blocked_by_count || 0}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-700 uppercase tracking-widest text-left">
                      <Shield className="h-4 w-4 text-green-500/40" />
                      <span>Integrity_Verified_v1.0.4 <br/> <span className="opacity-40">System_Secure</span></span>
                    </div>
                    <button onClick={() => setSelectedIssue(null)} data-magnetic="true" className="px-10 py-4 rounded-2xl bg-green-500 text-black text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_40px_rgba(34,197,94,0.3)] active:scale-95">CLOSE_PORTAL</button>
                  </div>
                </FrankenContainer>
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.4);
        }
      `}</style>
    </div>
  );
}
