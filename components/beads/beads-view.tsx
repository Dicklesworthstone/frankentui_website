"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Binary, 
  Activity, 
  Cpu, 
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
  ExternalLink
} from "lucide-react";
import { FrankenContainer, NeuralPulse } from "@/components/franken-elements";
import FrankenGlitch from "@/components/franken-glitch";
import { cn, formatDate } from "@/lib/utils";
import Script from "next/script";
import BeadHUD from "@/components/bead-hud";

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

// --- Main Component ---

export default function BeadsView() {
  const [db, setDb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Initializing System...");
  
  // Data State
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  // Script Loading State
  const [sqlLoaded, setSqlLoaded] = useState(false);
  const [d3Loaded, setD3Loaded] = useState(false);
  const [forceGraphLoaded, setForceGraphLoaded] = useState(false);
  
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reassemble database chunks
  const loadDatabase = useCallback(async () => {
    if (!sqlLoaded || db) return;

    try {
      setLoading(true);
      setError(null);
      setLoadingMessage("Fetching Core Data...");
      
      const configResp = await fetch("/beads-viewer/beads.sqlite3.config.json");
      if (!configResp.ok) throw new Error("Database configuration not found.");
      const config = await configResp.json();
      
      const chunks = [];
      for (let i = 0; i < config.chunk_count; i++) {
        setLoadingMessage(`Downloading Neural Chunk ${i+1}/${config.chunk_count}...`);
        const chunkPath = `/beads-viewer/chunks/${String(i).padStart(5, '0')}.bin`;
        const response = await fetch(chunkPath);
        if (!response.ok) throw new Error(`Neural Chunk ${i} extraction failed.`);
        const buffer = await response.arrayBuffer();
        chunks.push(new Uint8Array(buffer));
      }

      setLoadingMessage("Stitching Synapses...");
      const totalSize = chunks.reduce((sum, c) => sum + c.length, 0);
      const combined = new Uint8Array(totalSize);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      // @ts-ignore
      if (typeof window.initSqlJs !== "function") {
        throw new Error("SQL Engine not found in namespace.");
      }

      // @ts-ignore
      const SQL = await window.initSqlJs({
        locateFile: (file: string) => `/beads-viewer/vendor/${file}`
      });

      const database = new SQL.Database(combined);
      setDb(database);
      setLoading(false);
    } catch (err: any) {
      console.error("Failed to load database:", err);
      setError(err.message || "Unknown system failure.");
      setLoadingMessage("CRITICAL_FAILURE: System corruption detected.");
      setLoading(false);
    }
  }, [sqlLoaded, db]);

  // Initial load check
  useEffect(() => {
    // @ts-ignore
    if (window.initSqlJs && !sqlLoaded) {
      setSqlLoaded(true);
    }
  }, []);

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
        const statusCounts = db.exec(`SELECT status, COUNT(*) as count FROM issues GROUP BY status`);
        const statsObj: any = { total: 0 };
        if (statusCounts.length) {
          statusCounts[0].values.forEach((row: any) => {
            statsObj[row[0]] = row[1];
            statsObj.total += row[1];
          });
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
        
        if (issuesResult.length) {
          const columns = issuesResult[0].columns;
          const rows = issuesResult[0].values.map((row: any) => {
            const obj: any = {};
            columns.forEach((col: string, i: number) => obj[col] = row[i]);
            return obj;
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
    // @ts-ignore
    if (!db || !containerRef.current || !forceGraphLoaded || !window.ForceGraph) return;

    try {
      containerRef.current.innerHTML = "";

      // Fetch graph data
      const nodesRes = db.exec(`SELECT id, title, status, priority FROM issues`);
      const linksRes = db.exec(`SELECT issue_id, depends_on_id FROM dependencies WHERE type = 'blocks'`);

      if (!nodesRes.length) return;

      const nodes = nodesRes[0].values.map((row: any) => ({
        id: row[0],
        title: row[1],
        status: row[2],
        priority: row[3],
        val: 5 - row[3]
      }));

      const links = linksRes[0].values.map((row: any) => ({
        source: row[0],
        target: row[1]
      }));

      // @ts-ignore
      const Graph = window.ForceGraph()(containerRef.current)
        .graphData({ nodes, links })
        .nodeColor((node: any) => STATUS_COLORS[node.status] || THEME.green)
        .nodeLabel((node: any) => `${node.id}: ${node.title}`)
        .linkColor(() => "rgba(34, 197, 94, 0.15)")
        .linkDirectionalParticles(2)
        .linkDirectionalParticleSpeed(0.005)
        .linkDirectionalParticleColor(() => THEME.green)
        .linkDirectionalParticleWidth(2)
        .backgroundColor("rgba(0,0,0,0)")
        .width(containerRef.current.clientWidth)
        .height(containerRef.current.clientHeight)
        .nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const size = (5 - node.priority) * 2 + 4;
          
          // Glow
          ctx.shadowColor = STATUS_COLORS[node.status] || THEME.green;
          ctx.shadowBlur = 10 / globalScale;
          
          ctx.fillStyle = STATUS_COLORS[node.status] || THEME.green;
          ctx.beginPath(); 
          ctx.arc(node.x, node.y, size / globalScale, 0, 2 * Math.PI, false); 
          ctx.fill();
          
          ctx.shadowBlur = 0;

          if (globalScale > 1.5) {
            const label = node.id;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px JetBrains Mono`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            ctx.fillText(label, node.x, node.y + (size + 5) / globalScale);
          }
        })
        .onNodeClick((node: any) => {
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
              const obj: any = {};
              columns.forEach((col: string, i: number) => obj[col] = row[i]);
              setSelectedIssue(obj);
            }
          } catch (err) {
            console.error("Failed to fetch issue details:", err);
          }
        });

      graphRef.current = Graph;
    } catch (err) {
      console.error("Graph render error:", err);
    }
  }, [db, forceGraphLoaded]);

  useEffect(() => {
    if (!loading && db && forceGraphLoaded) {
      const timer = setTimeout(renderGraph, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, db, forceGraphLoaded, renderGraph]);

  const filteredIssues = useMemo(() => {
    if (!searchQuery) return issues;
    const q = searchQuery.toLowerCase();
    return issues.filter(i => 
      i.id.toLowerCase().includes(q) || 
      i.title.toLowerCase().includes(q) || 
      i.description?.toLowerCase().includes(q)
    );
  }, [issues, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] w-full bg-black/40 rounded-3xl border border-green-500/10 backdrop-blur-xl overflow-hidden relative">
        <Script 
          src="/beads-viewer/vendor/sql-wasm.js" 
          onLoad={() => setSqlLoaded(true)}
        />
        <Script 
          src="/beads-viewer/vendor/d3.v7.min.js" 
          onLoad={() => setD3Loaded(true)}
        />
        <Script 
          src="/beads-viewer/vendor/force-graph.min.js" 
          onLoad={() => setForceGraphLoaded(true)}
        />
        <NeuralPulse />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative h-24 w-24 mb-8"
        >
          <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
          <div className="absolute inset-0 border-t-4 border-green-500 rounded-full animate-spin" />
          <Binary className="absolute inset-0 m-auto h-8 w-8 text-green-500" />
        </motion.div>
        <p className={cn("text-sm font-black uppercase tracking-[0.4em]", error ? "text-red-500" : "text-green-500 animate-pulse")}>
          {loadingMessage}
        </p>
        {error && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-xs text-red-400 font-mono max-w-md text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Retry_System_Load</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 w-full">
      <Script 
        src="/beads-viewer/vendor/sql-wasm.js" 
        onLoad={() => setSqlLoaded(true)}
      />
      <Script 
        src="/beads-viewer/vendor/d3.v7.min.js" 
        onLoad={() => setD3Loaded(true)}
      />
      <Script 
        src="/beads-viewer/vendor/force-graph.min.js" 
        onLoad={() => setForceGraphLoaded(true)}
      />

      {/* --- 1. GLOBAL TELEMETRY --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "OPEN", key: "open", color: THEME.green, icon: Activity },
          { label: "ACTIVE", key: "in_progress", color: THEME.amber, icon: Zap },
          { label: "BLOCKED", key: "blocked", color: THEME.red, icon: AlertTriangle },
          { label: "RESOLVED", key: "closed", color: THEME.slate, icon: Shield }
        ].map((stat) => (
          <FrankenContainer key={stat.key} withPulse={true} className="p-6 bg-black/40 border-white/5 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-white transition-colors">{stat.label}</span>
              <stat.icon className="h-3 w-3" style={{ color: stat.color }} />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white tabular-nums">{stats?.[stat.key] || 0}</p>
              <span className="text-[10px] font-bold text-slate-700">/ {stats?.total || 0}</span>
            </div>
            <div className="mt-6 h-1 w-full rounded-full overflow-hidden bg-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((stats?.[stat.key] || 0) / (stats?.total || 1)) * 100}%` }}
                className="h-full shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: stat.color, color: stat.color }}
              />
            </div>
          </FrankenContainer>
        ))}
      </div>

      {/* --- 2. MAIN VISTA (GRAPH + LOG) --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch">
        <div className="xl:col-span-2 min-h-[600px] relative rounded-[2.5rem] border border-green-500/10 overflow-hidden bg-[#010501] shadow-2xl">
          <NeuralPulse className="opacity-20" />
          <div ref={containerRef} className="w-full h-full" />
          
          <BeadHUD />

          {/* Graph Controls */}
          <div className="absolute top-8 right-8 flex flex-col gap-3 pointer-events-auto">
            <button 
              onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 400)}
              className="h-12 w-12 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-slate-400 flex items-center justify-center hover:bg-green-500 hover:text-black hover:border-green-400 transition-all shadow-2xl group"
              title="Zoom In"
            >
              <Maximize2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => graphRef.current?.zoomToFit(600, 80)}
              className="h-12 w-12 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-slate-400 flex items-center justify-center hover:bg-green-500 hover:text-black hover:border-green-400 transition-all shadow-2xl group"
              title="Reset View"
            >
              <Network className="h-5 w-5 group-hover:rotate-180 transition-transform duration-700" />
            </button>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-4 rounded-full bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-3 text-white">
                <div className="h-2 w-2 rounded-full shadow-[0_0_10px_currentColor] animate-pulse" style={{ backgroundColor: color, color }} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Synaptic Activity Log */}
        <div className="space-y-6 flex flex-col h-full">
          <div className="flex items-center gap-3 text-slate-500 px-2">
            <Clock className="h-5 w-5" />
            <h3 className="text-lg font-black text-white uppercase tracking-widest">Neural_Activity</h3>
          </div>
          <div className="flex-1 rounded-[2.5rem] border border-white/5 bg-black/40 relative overflow-hidden group p-8">
            <NeuralPulse className="opacity-0 group-hover:opacity-20 transition-opacity" />
            <div className="space-y-8 relative z-10">
              {issues.slice(0, 8).map((issue) => (
                <div 
                  key={issue.id} 
                  className="relative pl-8 border-l border-white/10 group/item cursor-pointer"
                  onClick={() => setSelectedIssue(issue)}
                >
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
          <div className="flex items-center gap-3">
            <ListIcon className="h-5 w-5 text-green-500" />
            <FrankenGlitch trigger="hover" intensity="low">
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Priority_Ledger</h3>
            </FrankenGlitch>
          </div>

          <div className="relative group w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-green-500 transition-colors" />
            <input 
              type="text"
              placeholder="SCAN_ARCHIVE_DATA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 bg-black/60 border border-white/10 rounded-2xl text-[11px] font-black text-white placeholder-slate-700 focus:outline-none focus:border-green-500/50 w-full transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIssues.map((issue) => (
            <button 
              key={issue.id}
              onClick={() => setSelectedIssue(issue)}
              className="w-full text-left group focus:outline-none"
            >
              <FrankenContainer withStitches={false} withPulse={true} className="p-6 bg-black/40 border-white/5 hover:border-green-500/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-8 relative z-10">
                  <span className="font-mono text-[11px] font-black text-slate-700 group-hover:text-green-500/60 transition-colors w-20 tracking-tighter">
                    {issue.id}
                  </span>
                  <div className="h-10 w-px bg-white/5 hidden sm:block" />
                  <div>
                    <h4 className="text-base font-black text-white group-hover:text-green-400 transition-colors leading-tight line-clamp-1">
                      {issue.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-2">
                      <StatusPill status={issue.status} />
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                         <Binary className="h-3 w-3" />
                         {issue.issue_type}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 relative z-10 sm:text-right">
                  <div className="flex flex-col sm:items-end">
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] mb-1">Assigned_To</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <User className="h-3.5 w-3.5 text-slate-600" />
                      {issue.assignee || "UNASSIGNED"}
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-slate-800 group-hover:text-green-500 transition-all group-hover:translate-x-1" />
                </div>
              </FrankenContainer>
            </button>
          ))}
          
          {filteredIssues.length === 0 && (
            <div className="col-span-full py-24 text-center opacity-30">
               <AlertTriangle className="h-16 w-16 mx-auto mb-6" />
               <p className="text-xl font-black uppercase tracking-widest">No matching synapses found</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Detailed Synapse Portal (Modal) --- */}
      <AnimatePresence>
        {selectedIssue && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIssue(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-full max-w-5xl max-h-full overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.15)]"
            >
              <FrankenContainer withPulse={true} className="bg-[#020a02] border-green-500/20 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Protocol Header */}
                <div className="p-10 border-b border-white/5 flex items-start justify-between bg-white/[0.02] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                     <Binary className="h-64 w-64 rotate-12" />
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-1.5 rounded-xl bg-green-500 text-black text-[11px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">{selectedIssue.id}</span>
                      <StatusPill status={selectedIssue.status} />
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest border-l border-white/10 pl-4 ml-2">
                         <Activity className="h-3 w-3" />
                         Priority_P{selectedIssue.priority}
                      </div>
                    </div>
                    <FrankenGlitch trigger="always" intensity="low">
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight max-w-3xl">{selectedIssue.title}</h2>
                    </FrankenGlitch>
                  </div>
                  <button 
                    onClick={() => setSelectedIssue(null)}
                    className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:bg-white/10 hover:text-white transition-all group"
                  >
                    <Binary className="h-7 w-7 rotate-45 group-hover:rotate-90 transition-transform duration-500" />
                  </button>
                </div>

                {/* Substrate Body */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
                    <div className="xl:col-span-2 space-y-12">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <Info className="h-4 w-4 text-green-500/60" />
                           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Synapse_Descriptor</h4>
                        </div>
                        <div className="text-slate-300 text-xl leading-relaxed font-medium">
                          {selectedIssue.description || "System log empty. Descriptor required for complete synchronization."}
                        </div>
                      </div>

                      {/* Technical Blueprint Table */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-[2rem] overflow-hidden border border-white/5">
                        <div className="p-6 bg-black/40">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Type</span>
                          <p className="text-sm font-bold text-white mt-2 capitalize">{selectedIssue.issue_type}</p>
                        </div>
                        <div className="p-6 bg-black/40">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Impact</span>
                          <p className="text-sm font-bold text-green-400 mt-2">+{selectedIssue.blocks_count || 0} Nodes</p>
                        </div>
                        <div className="p-6 bg-black/40">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Born</span>
                          <p className="text-sm font-bold text-slate-400 mt-2">{formatDate(selectedIssue.created_at)}</p>
                        </div>
                        <div className="p-6 bg-black/40">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Updated</span>
                          <p className="text-sm font-bold text-slate-400 mt-2">{formatDate(selectedIssue.updated_at)}</p>
                        </div>
                      </div>
                      
                      {/* Labels / Fragments */}
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
                      {/* Custodian Detail */}
                      <div className="space-y-8">
                        <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] group">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] block mb-6">Neural_Custodian</span>
                          <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-[1.25rem] bg-gradient-to-tr from-green-600 via-green-400 to-emerald-300 flex items-center justify-center text-black font-black text-xl uppercase shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                              {selectedIssue.assignee ? selectedIssue.assignee[0] : "?"}
                            </div>
                            <div>
                              <p className="text-lg font-black text-white">{selectedIssue.assignee || "UNASSIGNED"}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                 <p className="text-[9px] font-black text-green-500/60 uppercase tracking-widest uppercase">Validated_Engineer</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] block mb-6">Downstream_Cascade</span>
                          <div className="space-y-5">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                              <span className="text-xs font-bold text-slate-500">Unlocks</span>
                              <span className="text-sm font-mono font-black text-green-500">{selectedIssue.blocks_count || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                              <span className="text-xs font-bold text-slate-500">Blockers</span>
                              <span className="text-sm font-mono font-black text-red-500">{selectedIssue.blocked_by_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Protocol Footer */}
                <div className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-700 uppercase tracking-widest text-left">
                    <Shield className="h-4 w-4 text-green-500/40" />
                    <span>Integrity_Verified_v1.0.4 <br/> <span className="opacity-40">System_Secure</span></span>
                  </div>
                  <button 
                    onClick={() => setSelectedIssue(null)}
                    data-magnetic="true"
                    className="px-10 py-4 rounded-2xl bg-green-500 text-black text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_40px_rgba(34,197,94,0.3)] active:scale-95"
                  >
                    CLOSE_PORTAL
                  </button>
                </div>
              </FrankenContainer>
            </motion.div>
          </div>
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
