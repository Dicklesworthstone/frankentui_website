// Site configuration
export const siteConfig = {
  name: "FrankenTUI",
  title: "FrankenTUI — The Monster Terminal UI Kernel for Rust",
  description: "Stitched together from the finest algorithms and brought to life with deterministic math. Minimal, high-performance terminal UI kernel focused on correctness and clean architecture.",
  url: "https://frankentui.com",
  github: "https://github.com/Dicklesworthstone/frankentui",
  social: {
    github: "https://github.com/Dicklesworthstone/frankentui",
    x: "https://x.com/jeffemanuel",
    authorGithub: "https://github.com/Dicklesworthstone",
  },
};

// Navigation items
export const navItems = [
  { href: "/", label: "Home" },
  { href: "/showcase", label: "Showcase" },
  { href: "/architecture", label: "Architecture" },
  { href: "/war-stories", label: "War Stories" },
  { href: "/beads", label: "Project Graph" },
  { href: "/how-it-was-built", label: "Built in 5 Days" },
  { href: "/glossary", label: "Glossary" },
  { href: "/getting-started", label: "Get Started" },
];

// Types
export interface Stat {
  label: string;
  value: string;
  helper?: string;
}

// Hero stats
export const heroStats: Stat[] = [
  { label: "Workspace Crates", value: "12", helper: "Composable, focused modules" },
  { label: "Built In", value: "5", helper: "Days from scratch" },
  { label: "Algorithms", value: "20+", helper: "Alien-artifact quality" },
  { label: "Glossary Terms", value: "60+", helper: "Searchable TUI dictionary" },
];

// Features for the homepage grid
export interface Feature {
  title: string;
  description: string;
  icon: string; // lucide icon name
}

export const features: Feature[] = [
  {
    title: "Inline Mode",
    description: "Stable UI at top/bottom while logs scroll above. Preserves scrollback history that other TUI frameworks destroy.",
    icon: "terminal",
  },
  {
    title: "Deterministic Rendering",
    description: "Buffer → Diff → Presenter → ANSI pipeline with no hidden I/O. Every frame is reproducible and testable.",
    icon: "cpu",
  },
  {
    title: "One-Writer Rule",
    description: "TerminalWriter serializes all stdout writes. No cursor corruption, no race conditions, no flicker.",
    icon: "lock",
  },
  {
    title: "RAII Cleanup",
    description: "TerminalSession restores terminal state even on panic. Your terminal is never left in a broken state.",
    icon: "shield",
  },
  {
    title: "Composable Crates",
    description: "12 focused crates: layout, text, style, runtime, widgets. Add only what you need, nothing more.",
    icon: "blocks",
  },
  {
    title: "Alien Algorithms",
    description: "Bayesian diff strategy, BOCPD resize coalescing, conformal prediction alerts, e-process monitoring. Not heuristics — math.",
    icon: "sparkles",
  },
];

// Crate data for the workspace overview
export interface Crate {
  name: string;
  purpose: string;
  status: "implemented" | "reserved";
}

export const crates: Crate[] = [
  { name: "ftui", purpose: "Public facade + prelude", status: "implemented" },
  { name: "ftui-core", purpose: "Terminal lifecycle, events, capabilities", status: "implemented" },
  { name: "ftui-render", purpose: "Buffer, diff, ANSI presenter", status: "implemented" },
  { name: "ftui-style", purpose: "Style + theme system", status: "implemented" },
  { name: "ftui-text", purpose: "Spans, segments, rope editor", status: "implemented" },
  { name: "ftui-layout", purpose: "Flex + Grid solvers", status: "implemented" },
  { name: "ftui-runtime", purpose: "Elm/Bubbletea runtime", status: "implemented" },
  { name: "ftui-widgets", purpose: "Core widget library", status: "implemented" },
  { name: "ftui-extras", purpose: "Feature-gated add-ons", status: "implemented" },
  { name: "ftui-harness", purpose: "Reference app + snapshots", status: "implemented" },
  { name: "ftui-pty", purpose: "PTY test utilities", status: "implemented" },
  { name: "ftui-simd", purpose: "Optional safe optimizations", status: "reserved" },
];

// Screenshot data
export interface Screenshot {
  src: string;
  alt: string;
  title: string;
}

export const screenshots: Screenshot[] = [
  { src: "/screenshots/dashboard_fullscreen_overview.webp", alt: "FrankenTUI dashboard fullscreen overview", title: "Dashboard Overview" },
  { src: "/screenshots/dashboard_compact_layout.webp", alt: "FrankenTUI dashboard compact layout", title: "Compact Layout" },
  { src: "/screenshots/code_explorer_syntax_highlighting.webp", alt: "Code explorer with syntax highlighting", title: "Code Explorer" },
  { src: "/screenshots/data_visualization_charts_and_heatmaps.webp", alt: "Data visualization charts and heatmaps", title: "Data Visualization" },
  { src: "/screenshots/file_browser_tree_and_preview.webp", alt: "File browser tree and preview", title: "File Browser" },
  { src: "/screenshots/markdown_rendering_with_mermaid_diagram.webp", alt: "Markdown rendering with Mermaid diagram", title: "Markdown Rendering" },
  { src: "/screenshots/mermaid_mindmap_project_diagram.webp", alt: "Mermaid mindmap project diagram", title: "Mermaid Mindmap" },
  { src: "/screenshots/table_theme_gallery_presets.webp", alt: "Table theme gallery presets", title: "Table Themes" },
  { src: "/screenshots/visual_effects_clifford_attractor.webp", alt: "Visual effects Clifford attractor", title: "Visual Effects" },
  { src: "/screenshots/widget_gallery_inputs_and_controls.webp", alt: "Widget gallery inputs and controls", title: "Widget Gallery" },
];

// Video data
// Note: This repo tracks the WebM sources in `public/videos/`. MP4 fallbacks are
// intentionally not committed (see .gitignore). If you need MP4 for Safari-only
// environments, host MP4s externally and add them as additional sources here.
export interface Video {
  title: string;
  description: string;
  poster: string;
  sources: { src: string; type: string }[];
}

export const videos: Video[] = [
  {
    title: "Ghostty Resize Demo",
    description: "Real-time resize handling with BOCPD coalescing in Ghostty terminal",
    poster: "/screenshots/dashboard_fullscreen_overview.webp",
    sources: [
      { src: "/videos/frankentui-ghostty-resize.webm", type: "video/webm" },
    ],
  },
  {
    title: "Rio CRT Demo",
    description: "Full demo showcase running in Rio terminal with CRT effects",
    poster: "/screenshots/visual_effects_clifford_attractor.webp",
    sources: [
      { src: "/videos/frankentui-rio-crt.webm", type: "video/webm" },
    ],
  },
];

// Comparison table data
export interface ComparisonRow {
  feature: string;
  frankentui: string;
  ratatui: string;
  tuiRs: string;
  rawCrossterm: string;
}

export const comparisonData: ComparisonRow[] = [
  { feature: "Inline mode w/ scrollback", frankentui: "First-class", ratatui: "App-specific", tuiRs: "App-specific", rawCrossterm: "Manual" },
  { feature: "Deterministic buffer diff", frankentui: "Kernel-level", ratatui: "Yes", tuiRs: "Yes", rawCrossterm: "No" },
  { feature: "One-writer rule", frankentui: "Enforced", ratatui: "App-specific", tuiRs: "App-specific", rawCrossterm: "No" },
  { feature: "RAII teardown", frankentui: "TerminalSession", ratatui: "App-specific", tuiRs: "App-specific", rawCrossterm: "No" },
  { feature: "Snapshot/time-travel harness", frankentui: "Built-in", ratatui: "No", tuiRs: "No", rawCrossterm: "No" },
  { feature: "Bayesian diff strategy", frankentui: "Built-in", ratatui: "No", tuiRs: "No", rawCrossterm: "No" },
  { feature: "Resize coalescing (BOCPD)", frankentui: "Built-in", ratatui: "No", tuiRs: "No", rawCrossterm: "No" },
  { feature: "Alpha blending / compositing", frankentui: "Porter-Duff", ratatui: "No", tuiRs: "No", rawCrossterm: "No" },
  { feature: "Elm architecture runtime", frankentui: "Built-in", ratatui: "App-specific", tuiRs: "App-specific", rawCrossterm: "No" },
  { feature: "Conformal prediction alerts", frankentui: "Built-in", ratatui: "No", tuiRs: "No", rawCrossterm: "No" },
  { feature: "Zero unsafe in render path", frankentui: "Enforced (#![forbid])", ratatui: "Minimized", tuiRs: "No", rawCrossterm: "No" },
];

// War Stories (Bug Fixes)
export interface WarStory {
  title: string;
  subtitle: string;
  description: string;
  technicalDetails: string;
  impact: string;
  icon: string;
}

export const warStories: WarStory[] = [
  {
    title: "Terminal Sync Freeze Safety",
    subtitle: "Crash During Render Frozen Terminal",
    description: "If an application panicked mid-render while the terminal was in DEC 2026 synchronized output mode, the terminal would remain frozen — requiring a manual `reset` command.",
    technicalDetails: "TerminalSession::cleanup (the RAII Drop impl) did not emit SYNC_END. The panic hook had this safety, but the destructor did not. Fixed by adding stdout.write_all(SYNC_END) to cleanup, guaranteeing unfreeze on every exit path.",
    impact: "Terminal never left frozen regardless of crash timing.",
    icon: "lock",
  },
  {
    title: "The SOH Collision",
    subtitle: "U+0001 vs Cell::CONTINUATION",
    description: "A collision between the SOH control character (U+0001) and the internal `Cell::CONTINUATION` marker (which was 1) in `ftui-render/src/cell.rs`.",
    technicalDetails: "The `CONTINUATION` constant was defined as `1`, which collided with the valid ASCII Start of Heading (SOH) character. This meant SOH characters were being interpreted as wide-char placeholders. Fixed by changing `CONTINUATION` to `0x7FFF_FFFF`.",
    impact: "Ensured correct rendering of binary-like or control-heavy output.",
    icon: "bug",
  },
  {
    title: "Recursive Tree Flattening",
    subtitle: "O(N) Allocation to Zero-Alloc",
    description: "Optimized Tree widget rendering by replacing the O(N) `flatten` implementation with a zero-allocation recursive visitor `render_node`.",
    technicalDetails: "The initial implementation allocated a vector of all visible nodes every frame. The fix replaced this with a recursive walker that renders directly to the buffer, respecting scissor rects and avoiding all intermediate allocations.",
    impact: "Significant performance boost for large trees (file explorers).",
    icon: "tree",
  },
  {
    title: "GraphemePool Optimization",
    subtitle: "Memory Leak in Text Interning",
    description: "Optimized `GraphemePool` garbage collection and intern logic to prevent unbounded growth.",
    technicalDetails: "The GraphemePool interns strings to `GraphemeId`s. Without proper GC or reference counting, long-running sessions would accumulate unused graphemes. The fix added a generational GC strategy to prune unused IDs.",
    impact: "Stable memory usage for long-running dashboards.",
    icon: "trash",
  },
];

// Optimization Highlights
export interface Optimization {
  name: string;
  description: string;
  metric: string;
}

export const optimizations: Optimization[] = [
  {
    name: "Zero-Alloc Diffing",
    description: "The diff algorithm compares buffers without allocating new vectors, reusing `ChangeRun` structs.",
    metric: "0 allocs/frame",
  },
  {
    name: "SIMD Cell Comparison",
    description: "Cells are exactly 16 bytes, allowing single 128-bit SIMD comparison for equality checks.",
    metric: "1 cycle/cell",
  },
  {
    name: "Cached Text Measurement",
    description: "WidthCache memoizes text measurements, skipping expensive grapheme segmentation on repeated frames.",
    metric: "O(1) layout",
  },
  {
    name: "Dirty Row Tracking",
    description: "Widgets mark specific rows as dirty, allowing the renderer to skip diffing static regions.",
    metric: "Sub-ms diffs",
  },
];

// Changelog timeline entries
export interface ChangelogEntry {
  period: string;
  title: string;
  items: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    period: "Day 1 — 2026-01-31 14:21",
    title: "Architecture Plan Locked",
    items: [
      "Initial commit: FrankenTUI plan documents.",
      "Upgraded plan to a hybrid architecture (V5.0 → V6.1).",
      "Expanded the bead graph to cover core components, dependencies, and acceptance tests.",
    ],
  },
  {
    period: "Day 1 — 2026-01-31 17:48",
    title: "Reference Library Sync",
    items: [
      "Added a reference library sync script + build infrastructure.",
      "Fixed idempotency and Makefile bugs in the sync tooling.",
      "Seeded beads for syntax highlighting, forms/pickers, and other showcase surfaces.",
    ],
  },
  {
    period: "Day 1 — 2026-01-31 23:23",
    title: "Workspace Born",
    items: [
      "Initialized the Rust workspace with the `ftui` crate structure.",
      "Added 15 comprehensive feature beads with 46 subtasks.",
      "Added a comprehensive test bead graph for 15 new feature areas.",
    ],
  },
  {
    period: "Day 2 — 2026-02-01 02:10",
    title: "Terminal Session + Core Data Types",
    items: [
      "Added terminal session lifecycle, color downgrade, style system, and a TerminalModel.",
      "Implemented the Buffer API and supporting infrastructure.",
      "Implemented GraphemePool with reference counting; reinforced the one-writer rule.",
    ],
  },
  {
    period: "Day 2 — 2026-02-01 12:57",
    title: "Render Kernel Online",
    items: [
      "Implemented BufferDiff and Presenter (state-tracked ANSI emission).",
      "Hardened inline mode safety and added comprehensive inline mode tests.",
      "Added geometry primitives and the Flex layout solver; fixed build issues across the workspace.",
    ],
  },
  {
    period: "Day 2 — 2026-02-01 22:03",
    title: "Showcase Expansion + Correctness Blitz",
    items: [
      "Major expansion: demo showcase, PTY improvements, and documentation.",
      "Broad correctness sweep: saturating arithmetic across widgets/drawing + overflow fixes.",
      "Added ftui-render coverage for wide glyph handling and diff engine edge cases.",
    ],
  },
  {
    period: "Day 3 — 2026-02-02 23:25",
    title: "Benchmarks + Validation",
    items: [
      "Added DoubleBuffer swap benchmarks and repaired E2E scripts.",
      "Introduced an async deadline controller (survival analysis) for budget enforcement.",
      "Expanded action-timeline and visual-fx tests; synced multi-agent workspace changes.",
    ],
  },
  {
    period: "Day 4 — 2026-02-03 21:36",
    title: "Evidence Telemetry + Policy Controls",
    items: [
      "Added evidence structs and optimized diff buffer reuse in the runtime.",
      "Added env-var controls for Bayesian diff, BOCPD, and conformal in the harness.",
      "Optimized ANSI emission and extracted diff helpers; updated BOCPD evidence field docs.",
    ],
  },
  {
    period: "Day 5 — 2026-02-04 16:35",
    title: "Crates.io Publish Prep",
    items: [
      "Crates.io publish prep + crate docs (bd-3lul4).",
      "Stabilized tests (flaky fixes, isolation, snapshot baselines).",
      "Kept the project graph and issue tracker synced as publish tasks closed out.",
    ],
  },
  {
    period: "Day 5 — 2026-02-05 01:25",
    title: "Publish: v0.1.1",
    items: [
      "Published v0.1.1 crates (bd-17unx publish 0.1.1 crates).",
      "Updated the changelog for the 0.1.1 publish.",
      "Captured and shipped the initial public announcement artifacts.",
    ],
  },
];

// Selected, timestamped commit messages from the original sprint.
// Times are from git commit metadata (local tz) in /data/projects/frankentui.
export const buildLogLines: string[] = [
  "[2026-01-31 14:21] 7a23b45a  Initial commit: FrankenTUI plan documents",
  "[2026-01-31 15:54] 40b720d4  Upgrade plan to V6.1: practice-proven hybrid architecture",
  "[2026-01-31 22:27] 6c9158cf  Add 15 comprehensive feature beads with 46 subtasks",
  "[2026-01-31 23:23] aadc5679  feat: initialize Rust workspace with ftui crate structure",
  "[2026-02-01 02:10] ced1e5e7  feat: Add terminal session, color downgrade, style system, and terminal model",
  "[2026-02-01 02:15] 0da0ba05  feat: Implement Buffer API and supporting infrastructure",
  "[2026-02-01 12:52] 9abb1bf9  feat(ftui-render): Implement BufferDiff with row-major scan",
  "[2026-02-01 12:57] aa58e858  feat: Implement Presenter with state-tracked ANSI emission",
  "[2026-02-01 13:07] 0baccfdd  feat(layout): Add Flex layout solver and terminal_writer fixes",
  "[2026-02-01 22:03] 0d03d898  feat: major expansion with demo showcase, PTY improvements, and documentation",
  "[2026-02-03 21:36] 02427dbf  feat(runtime): add evidence structs and optimize diff buffer reuse",
  "[2026-02-04 16:35] 2020c901  docs: crates.io publish prep + crate docs (bd-3lul4)",
  "[2026-02-05 01:25] b8f0d6d3  bd-17unx publish 0.1.1 crates",
  "[2026-02-05 02:34] 5383ae71  Update changelog for 0.1.1 publish",
];

// Build-process highlights reconstructed from sprint artifacts.
export interface DevSessionInsight {
  date: string; // YYYY-MM-DD
  phase: string;
  title: string;
  description: string;
  flavor: "breakthrough" | "decision" | "crisis" | "grind" | "ship";
}

export const devSessionInsights: DevSessionInsight[] = [
  {
    date: "2026-01-31",
    phase: "Day 1",
    title: "Workspace Born",
    description:
      "The sprint started by locking an architecture plan and scaffolding a multi-crate Rust workspace early, so every new capability had a clean home (core, render, runtime, widgets, harness).",
    flavor: "breakthrough",
  },
  {
    date: "2026-02-01",
    phase: "Day 2",
    title: "Render Kernel Online",
    description:
      "The deterministic render pipeline landed fast: BufferDiff + a state-tracked Presenter that emits ANSI deltas without hidden I/O or terminal desync.",
    flavor: "breakthrough",
  },
  {
    date: "2026-02-02",
    phase: "Day 3",
    title: "Benchmarks + Validation",
    description:
      "The focus shifted from raw feature throughput to budgets and verification: benchmarks, E2E scripts, and test expansions to keep high-velocity changes safe.",
    flavor: "decision",
  },
  {
    date: "2026-02-02",
    phase: "Day 3",
    title: "Beads Pages Export Debug",
    description:
      "A report claimed `bv -pages` had deployed only a few \"test\" beads. Checking the exported bundle and deployed SQLite confirmed 266 issues were present; the apparent mismatch came from local, uncommitted beads not included in the export snapshot.",
    flavor: "crisis",
  },
  {
    date: "2026-02-03",
    phase: "Day 4",
    title: "Evidence Telemetry + Policy Controls",
    description:
      "Probabilistic pieces were made auditable: evidence structs, docs, and environment-driven policy controls for Bayesian diff, BOCPD resize coalescing, and conformal alerts.",
    flavor: "breakthrough",
  },
  {
    date: "2026-02-04",
    phase: "Day 5",
    title: "Crates.io Publish Prep",
    description:
      "Docs, metadata, and tests were hardened for a real release artifact. Publish tasks closed out in dependency order while the project graph stayed synced.",
    flavor: "grind",
  },
  {
    date: "2026-02-05",
    phase: "Day 5",
    title: "Publish: v0.1.1",
    description:
      "The initial crate set shipped to crates.io and the changelog was updated immediately after publish, closing out the sprint with a concrete release.",
    flavor: "ship",
  },
];

export interface DevStat {
  value: string;
  label: string;
  detail: string;
}

export const devProcessStats: DevStat[] = [
  {
    value: "286",
    label: "Claude Code Sessions",
    detail: "Counted from archived session logs for /data/projects/frankentui (2026-01-31 → 2026-02-05)",
  },
  {
    value: "516",
    label: "Codex CLI Sessions",
    detail: "Session files with cwd=/data/projects/frankentui across the 5-day window (2026-01-31 → 2026-02-05)",
  },
  {
    value: "1001",
    label: "Git Commits",
    detail: "Commits in the FrankenTUI repo between 2026-01-31 and 2026-02-05 (inclusive)",
  },
];

// Tweet data for the tweet wall
export interface Tweet {
  author: string;
  handle: string;
  content: string;
  date: string;
  type: "quote" | "embed";
  tweetUrl?: string;
  hasVideo?: boolean;
}

export const tweets: Tweet[] = [
  {
    author: "Jeffrey Emanuel",
    handle: "@jeffemanuel",
    content: "I just built a complete TUI framework in Rust from scratch in 5 days. 12 crates, 20+ algorithms including Bayesian diff strategy selection, BOCPD resize coalescing, and conformal prediction alerts. Not heuristics — real math.",
    date: "2026-02-05",
    type: "quote",
  },
  {
    author: "Jeffrey Emanuel",
    handle: "@jeffemanuel",
    content: "The 'alien artifact' quality bar: every statistical decision in FrankenTUI records an evidence ledger. You can literally read WHY the renderer chose dirty-row diff over full diff. No black boxes.",
    date: "2026-02-04",
    type: "quote",
  },
  {
    author: "Jeffrey Emanuel",
    handle: "@jeffemanuel",
    content: "FrankenTUI's inline mode preserves your scrollback while keeping UI chrome stable. This is the thing that Ratatui and every other Rust TUI framework gets wrong — they destroy your terminal history.",
    date: "2026-02-03",
    type: "quote",
  },
  {
    author: "Jeffrey Emanuel",
    handle: "@jeffemanuel",
    content: "Zero unsafe code in the entire render pipeline, runtime, and layout engine. #![forbid(unsafe_code)] at the crate level. Correctness over cleverness.",
    date: "2026-02-03",
    type: "quote",
  },
  {
    author: "Jeffrey Emanuel",
    handle: "@jeffemanuel",
    content: "The Cell type in FrankenTUI is exactly 16 bytes — 4 cells per 64-byte cache line. Single 128-bit SIMD comparison for equality. This is what I mean by alien-artifact engineering.",
    date: "2026-02-02",
    type: "quote",
  },
  {
    author: "Jeffrey Emanuel",
    handle: "@jeffemanuel",
    content: "Resize coalescing uses Bayesian Online Change-Point Detection. It detects when you're dragging vs pausing and adapts the coalescing delay. No magic thresholds — the model learns.",
    date: "2026-02-02",
    type: "quote",
  },
  {
    author: "Jeffrey Emanuel",
    handle: "@jeffemanuel",
    content: "FrankenTUI demo running in Ghostty with real-time resize. Watch the BOCPD coalescer adapt between steady and burst regimes.",
    date: "2026-02-04",
    type: "quote",
    hasVideo: true,
  },
  {
    author: "Jeffrey Emanuel",
    handle: "@jeffemanuel",
    content: "Visual effects in FrankenTUI: metaballs, plasma, Gray-Scott reaction-diffusion, Clifford attractors, Mandelbrot — all deterministic math, not random shader noise.",
    date: "2026-02-03",
    type: "quote",
  },
  {
    author: "Jeffrey Emanuel",
    handle: "@jeffemanuel",
    content: "E-processes for anytime-valid monitoring: you can check after every frame without inflating false positive rates. P(∃t: W_t ≥ 1/α) ≤ α under null. No peeking penalty.",
    date: "2026-02-03",
    type: "quote",
  },
  {
    author: "Jeffrey Emanuel",
    handle: "@jeffemanuel",
    content: "Rio terminal CRT effect demo of FrankenTUI's demo showcase. Every effect is a concrete dynamical system or PDE with explicit time-stepping.",
    date: "2026-02-04",
    type: "quote",
    hasVideo: true,
  },
  {
    author: "Jeffrey Emanuel",
    handle: "@jeffemanuel",
    content: "The Elm Architecture in Rust: Model + update + view. Commands for side effects, subscriptions for event streams. Type-safe, composable, testable.",
    date: "2026-02-01",
    type: "quote",
  },
  {
    author: "Jeffrey Emanuel",
    handle: "@jeffemanuel",
    content: "Formal proof sketches in the codebase: sync bracket completeness, diff completeness, dirty tracking soundness. This isn't 'move fast and break things' — it's 'move fast and prove things.'",
    date: "2026-02-02",
    type: "quote",
  },
];

// Algorithm showcase data
export interface Algorithm {
  name: string;
  category: string;
  description: string;
  formula?: string;
  impact: string;
}

export const algorithms: Algorithm[] = [
  {
    name: "Bayesian Diff Strategy",
    category: "Rendering",
    description: "Beta posterior over change rates adaptively selects between full diff, dirty-row, and full redraw strategies.",
    formula: "p ~ Beta(α, β)",
    impact: "Avoids slow strategies as workload shifts",
  },
  {
    name: "BOCPD Resize Coalescing",
    category: "Runtime",
    description: "Bayesian Online Change-Point Detection detects regime transitions between steady typing and burst resizing.",
    formula: "P(r_t | x₁:t) with hazard H(r) = 1/λ",
    impact: "Fewer redundant renders during window drag",
  },
  {
    name: "E-Process Monitoring",
    category: "Budget Control",
    description: "Wealth-based sequential tests for anytime-valid statistical decisions. No peeking penalty.",
    formula: "W_t = W_{t-1}(1 + λ_t(X_t - μ₀))",
    impact: "Safe budget decisions at every frame",
  },
  {
    name: "Conformal Prediction",
    category: "Alerting",
    description: "Distribution-free risk bounds that learn 'normal' from recent residuals.",
    formula: "q = Quantile_{⌈(1-α)(n+1)⌉}(R₁,...,Rₙ)",
    impact: "Stable alert thresholds without tuning",
  },
  {
    name: "Fenwick Tree",
    category: "Data Structures",
    description: "Binary Indexed Tree for O(log n) prefix sums in virtualized lists.",
    formula: "update: j += j & -j | query: j -= j & -j",
    impact: "O(log n) scroll positioning",
  },
  {
    name: "CUSUM Hover Stabilizer",
    category: "Input",
    description: "Cumulative sum change-point detector suppresses mouse jitter at hover boundaries.",
    formula: "S_t = max(0, S_{t-1} + d_t - k)",
    impact: "Stable hover targets without lag",
  },
  {
    name: "Damped Spring Physics",
    category: "Animation",
    description: "Critically-damped harmonic oscillator for natural motion without overshoot.",
    formula: "x'' + c·x' + k(x - x*) = 0",
    impact: "Smooth, deterministic animation",
  },
  {
    name: "Jain's Fairness Index",
    category: "Input Guard",
    description: "Scale-independent fairness metric prevents rendering from starving input processing.",
    formula: "F = (Σxᵢ)² / (n·Σxᵢ²)",
    impact: "Responsive UI under heavy render load",
  },
  {
    name: "Porter-Duff Compositing",
    category: "Rendering",
    description: "Full alpha-blending pipeline with opacity stacks for translucent overlays and layered widgets.",
    formula: "C_out = C_src·α_src + C_dst·α_dst·(1-α_src)",
    impact: "True transparency without hacks",
  },
  {
    name: "VOI Telemetry",
    category: "Diagnostics",
    description: "Value-of-Information analysis that tracks which diagnostic measurements actually improve decisions.",
    formula: "VOI = E[max(a,b)|X] - max(E[a],E[b])",
    impact: "Self-tuning diagnostic overhead",
  },
  {
    name: "Exponential Moving Average",
    category: "Frame Timing",
    description: "Smoothed frame-time estimation for adaptive budget allocation across render cycles.",
    formula: "EMA_t = α·x_t + (1-α)·EMA_{t-1}",
    impact: "Stable frame budgets despite jitter",
  },
  {
    name: "Gray-Scott Reaction-Diffusion",
    category: "Visual Effects",
    description: "PDE-based pattern generator for organic visual effects rendered entirely in terminal cells.",
    formula: "∂u/∂t = Dᵤ∇²u - uv² + F(1-u)",
    impact: "Mathematical art in the terminal",
  },
];

// Minimal code example — counter app
export const codeExample = `use ftui_core::event::Event;
use ftui_core::geometry::Rect;
use ftui_render::frame::Frame;
use ftui_runtime::{App, Cmd, Model, ScreenMode};
use ftui_widgets::paragraph::Paragraph;

struct TickApp {
    ticks: u64,
}

#[derive(Debug, Clone)]
enum Msg {
    Tick,
    Quit,
}

impl From<Event> for Msg {
    fn from(e: Event) -> Self {
        match e {
            Event::Key(k) if k.is_char('q') => Msg::Quit,
            _ => Msg::Tick,
        }
    }
}

impl Model for TickApp {
    type Message = Msg;

    fn update(&mut self, msg: Msg) -> Cmd<Msg> {
        match msg {
            Msg::Tick => {
                self.ticks += 1;
                Cmd::none()
            }
            Msg::Quit => Cmd::quit(),
        }
    }

    fn view(&self, frame: &mut Frame) {
        let text = format!("Ticks: {}  (press 'q' to quit)", self.ticks);
        let area = Rect::new(0, 0, frame.width(), 1);
        Paragraph::new(text).render(area, frame);
    }
}

fn main() -> std::io::Result<()> {
    App::new(TickApp { ticks: 0 })
        .screen_mode(ScreenMode::Inline { ui_height: 1 })
        .run()
}`;

// Dashboard layout example — panels + status line
export const dashboardExample = `use ftui::prelude::*;
use ftui_widgets::{Panel, StatusLine, Table};

struct Dashboard {
    logs: Vec<String>,
    metrics: Vec<(String, f64)>,
    selected: usize,
}

impl Model for Dashboard {
    type Message = Msg;

    fn view(&self, frame: &mut Frame) {
        let [header, body, footer] = frame.area()
            .split_vertical([Fixed(1), Fill, Fixed(1)]);

        let [left, right] = body
            .split_horizontal([Ratio(1, 3), Fill]);

        // Left panel: live metrics
        Panel::new("Metrics")
            .border_style(Style::green())
            .render(left, frame);

        Table::new(&self.metrics)
            .highlight(self.selected)
            .render(left.inner(1), frame);

        // Right panel: scrolling log
        Panel::new("Logs")
            .border_style(Style::dim_green())
            .render(right, frame);

        for (i, log) in self.logs.iter().rev().take(right.height as usize).enumerate() {
            Paragraph::new(log)
                .style(Style::slate())
                .render(right.row(i), frame);
        }

        // Status bar
        StatusLine::new()
            .left(format!("{} metrics", self.metrics.len()))
            .right("q: quit | ↑↓: navigate")
            .render(footer, frame);
    }
}`;

// Inline mode example — progress bar that preserves scrollback
export const inlineModeExample = `use ftui::prelude::*;
use ftui_widgets::{Gauge, Paragraph};

struct ProgressApp {
    progress: f64,
    status: String,
}

impl Model for ProgressApp {
    type Message = Msg;

    fn update(&mut self, msg: Msg) -> Cmd<Msg> {
        match msg {
            Msg::Tick => {
                self.progress = (self.progress + 0.01).min(1.0);
                self.status = format!("Processing... {:.0}%", self.progress * 100.0);
                if self.progress >= 1.0 { Cmd::quit() } else { Cmd::none() }
            }
            _ => Cmd::none(),
        }
    }

    fn view(&self, frame: &mut Frame) {
        let [bar, label] = frame.area()
            .split_vertical([Fixed(1), Fixed(1)]);

        // Green progress gauge
        Gauge::new(self.progress)
            .style(Style::new().fg(Color::Green))
            .render(bar, frame);

        Paragraph::new(&self.status)
            .style(Style::dim())
            .render(label, frame);
    }
}

fn main() -> std::io::Result<()> {
    // Inline mode: 2 rows at the bottom, logs scroll above
    App::new(ProgressApp { progress: 0.0, status: String::new() })
        .screen_mode(ScreenMode::Inline { ui_height: 2 })
        .run()
}`;

// FAQ data for the getting-started page
export interface FaqItem {
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
  {
    question: "Why the name FrankenTUI?",
    answer: "Because it's stitched together from the best parts of modern software engineering (the Elm architecture, flexible layout solvers) but animated by a completely new heart: a deterministic, math-heavy rendering kernel that brings interfaces to life without the flicker or state-corruption of 'natural' TUI frameworks.",
  },
  {
    question: "Is it really built in 5 days?",
    answer: "Yes. 100 hours of focused engineering. Every algorithm was selected for its correctness and performance under pressure. The result is an 'alien artifact' quality codebase that moves fast without breaking things.",
  },
  {
    question: "Does it support my terminal?",
    answer: "If your terminal supports ANSI escape sequences, FrankenTUI will animate it. It detects capabilities at startup and downgrades gracefully: from true color to mono, from hyperlinks to plain text, and from synchronized output to safe-buffered writes.",
  },
  {
    question: "How does it compare to Ratatui?",
    answer: "Ratatui is the established giant, but it's a 'view-only' library that leaves architecture to the user. FrankenTUI is a complete kernel. It provides the runtime, the event loop, and the invariants (like the One-Writer Rule) that prevent bugs before they are even stitched into your code.",
  },
  {
    question: "What is the 'One-Writer Rule'?",
    answer: "It's the surgical discipline that ensures only one component ever writes to the terminal. By funneling all output through a single serialized gate, we eliminate cursor corruption and race conditions, ensuring the terminal display remains pristine even under heavy stress.",
  },
];

// Widget data
export interface Widget {
  name: string;
  description: string;
  keyFeature: string;
}

export const widgets: Widget[] = [
  { name: "Block", description: "Container with borders and title", keyFeature: "9 border styles, title alignment" },
  { name: "Paragraph", description: "Text display with wrapping", keyFeature: "Word/char wrap, scroll" },
  { name: "List", description: "Selectable item list", keyFeature: "Virtualized, custom highlight" },
  { name: "Table", description: "Columnar data display", keyFeature: "Column constraints, row selection" },
  { name: "Input", description: "Single-line text input", keyFeature: "Cursor, selection, history" },
  { name: "Textarea", description: "Multi-line text input", keyFeature: "Line numbers, syntax hooks" },
  { name: "Tabs", description: "Tab bar navigation", keyFeature: "Closeable, reorderable" },
  { name: "Progress", description: "Progress bar indicator", keyFeature: "Determinate + indeterminate" },
  { name: "Sparkline", description: "Inline chart visualization", keyFeature: "Min/max markers" },
  { name: "Tree", description: "Hierarchical data browser", keyFeature: "Expand/collapse, lazy loading" },
  { name: "CommandPalette", description: "Fuzzy-search command picker", keyFeature: "Bayesian scoring, <5ms" },
  { name: "StatusLine", description: "Bottom status bar", keyFeature: "Left/center/right zones" },
  { name: "Panel", description: "Titled container region", keyFeature: "Nesting, border styles" },
  { name: "LogViewer", description: "Scrolling log display", keyFeature: "Auto-tail, markup" },
  { name: "Help", description: "Keybinding overlay", keyFeature: "Auto-generated from model" },
];

// Feature flags by crate
export interface FeatureFlag {
  crate: string;
  flag: string;
  description: string;
}

export const featureFlags: FeatureFlag[] = [
  { crate: "ftui-core", flag: "tracing", description: "Structured spans for terminal lifecycle" },
  { crate: "ftui-core", flag: "tracing-json", description: "JSON output via tracing-subscriber" },
  { crate: "ftui-core", flag: "caps-probe", description: "Runtime terminal capability probing" },
  { crate: "ftui-render", flag: "tracing", description: "Performance spans for diff/presenter" },
  { crate: "ftui-runtime", flag: "tracing", description: "Runtime loop instrumentation" },
  { crate: "ftui-runtime", flag: "render-thread", description: "Dedicated render/output thread" },
  { crate: "ftui-runtime", flag: "stdio-capture", description: "Best-effort stdout/stderr capture" },
  { crate: "ftui-runtime", flag: "state-persistence", description: "Widget state persistence across restarts" },
  { crate: "ftui-runtime", flag: "telemetry", description: "OpenTelemetry export (OTLP)" },
  { crate: "ftui-extras", flag: "markdown", description: "GitHub-Flavored Markdown + LaTeX rendering" },
  { crate: "ftui-extras", flag: "visual-fx", description: "Metaballs, plasma, Clifford attractors" },
  { crate: "ftui-extras", flag: "canvas", description: "Braille/block sub-cell rendering" },
  { crate: "ftui-extras", flag: "fx-gpu", description: "Optional GPU acceleration (Vulkan, GLES, DX12)" },
  { crate: "ftui-extras", flag: "charts", description: "Chart widgets (bar, line, area)" },
  { crate: "ftui-extras", flag: "clipboard", description: "System clipboard integration" },
  { crate: "ftui-extras", flag: "forms", description: "Form builder with validation" },
  { crate: "ftui-extras", flag: "filepicker", description: "File/directory picker dialog" },
  { crate: "ftui-extras", flag: "help", description: "Auto-generated keybinding help" },
];

// Safety guarantees
export interface SafetyGuarantee {
  title: string;
  description: string;
  proof?: string;
}

export const safetyGuarantees: SafetyGuarantee[] = [
  {
    title: "Zero Unsafe in Render Path",
    description: "#![forbid(unsafe_code)] at the crate level across ftui-render, ftui-runtime, and ftui-layout. The entire rendering pipeline, layout engine, and runtime are built on safe Rust.",
  },
  {
    title: "Integer Overflow Protection",
    description: "Saturating arithmetic for cursor positioning, checked operations for bounds checking. Intentional wrapping only in PRNG. No silent overflow anywhere in geometry code.",
  },
  {
    title: "Sync Bracket Completeness",
    description: "Every byte emitted by Presenter is wrapped in DEC 2026 sync brackets, preventing partial frame display.",
    proof: "Theorem 1: All Presenter output is bracketed by DEC 2026 begin/end sequences.",
  },
  {
    title: "Diff Completeness",
    description: "BufferDiff::compute(old, new) produces exactly {(x,y) | old[x,y] ≠ new[x,y]} — no missed changes, no spurious writes.",
    proof: "Theorem 2: Diff output = set difference of old and new buffers.",
  },
  {
    title: "Dirty Tracking Soundness",
    description: "If any cell in row y was mutated, is_row_dirty(y) returns true. The dirty-row optimization never skips a changed row.",
    proof: "Theorem 3: Dirty bit is a superset of actual changes.",
  },
  {
    title: "Diff-Dirty Equivalence",
    description: "compute() and compute_dirty() produce identical output when dirty invariants hold, ensuring the optimization is indistinguishable from a full diff.",
    proof: "Theorem 4: Full diff and dirty-row diff are equivalent under invariant.",
  },
];

// Design philosophy
export interface DesignPrinciple {
  title: string;
  description: string;
}

export const designPhilosophy: DesignPrinciple[] = [
  {
    title: "Correctness over cleverness",
    description: "Predictable terminal state is non-negotiable. Every rendering decision prioritizes correctness. No shortcuts that sacrifice terminal integrity.",
  },
  {
    title: "Deterministic output",
    description: "Buffer diffs and explicit presentation over ad-hoc writes. Given the same Model state and terminal size, view() produces identical output. Every frame is reproducible.",
  },
  {
    title: "Inline first",
    description: "Preserve scrollback while keeping chrome stable. Other frameworks destroy your terminal history. FrankenTUI treats it as sacred.",
  },
  {
    title: "Layered architecture",
    description: "core → render → runtime → widgets, no cyclic dependencies. Each layer depends only on layers below it. Add only what you need.",
  },
  {
    title: "Zero-surprise teardown",
    description: "RAII cleanup, even when apps crash. TerminalSession restores terminal state on drop. Your terminal is never left in a broken state, period.",
  },
];

// Screen mode trade-off matrix
export interface ScreenModeRow {
  feature: string;
  inline: string;
  altScreen: string;
}

export const screenModes: ScreenModeRow[] = [
  { feature: "Scrollback preserved", inline: "Yes", altScreen: "No" },
  { feature: "Full-screen clear safe", inline: "No", altScreen: "Yes" },
  { feature: "Logs visible after exit", inline: "Yes", altScreen: "No" },
  { feature: "Cursor complexity", inline: "High", altScreen: "Medium" },
  { feature: "Classic TUI feel", inline: "No", altScreen: "Yes" },
  { feature: "Best for CLI tools", inline: "Yes", altScreen: "No" },
];

// Troubleshooting items
export interface TroubleshootItem {
  symptom: string;
  cause: string;
  fix: string;
}

export const troubleshooting: TroubleshootItem[] = [
  {
    symptom: "Terminal looks corrupted after a crash",
    cause: "Force-killed process before TerminalSession RAII cleanup could run.",
    fix: "Run `reset` in your terminal to restore state. FrankenTUI's RAII handles normal exits and panics, but SIGKILL cannot be intercepted.",
  },
  {
    symptom: "\"raw mode not restored\" error",
    cause: "Your app called process::exit() before TerminalSession dropped.",
    fix: "Let your app exit normally or panic. Never call process::exit() directly — it bypasses RAII destructors.",
  },
  {
    symptom: "No mouse events received",
    cause: "Mouse capture not enabled in session, or terminal doesn't support it.",
    fix: "Set FTUI_HARNESS_ENABLE_MOUSE=true or enable mouse in your ProgramConfig. Verify your terminal supports mouse events.",
  },
  {
    symptom: "Output flickers in tmux",
    cause: "Older tmux versions don't support DEC 2026 synchronized output.",
    fix: "Upgrade to tmux 3.3+ and set allow-passthrough in your tmux.conf. FrankenTUI auto-detects tmux and wraps escape sequences in DCS passthrough.",
  },
  {
    symptom: "Logs and UI overlap or mix",
    cause: "Violating the one-writer rule — writing directly to stdout instead of through LogSink.",
    fix: "Route all output through Cmd::log() or the LogSink. Never use println!() or write to stdout directly when FrankenTUI owns the terminal.",
  },
];

// Environment variables
export interface EnvVar {
  name: string;
  description: string;
  example: string;
}

export const envVars: EnvVar[] = [
  { name: "FTUI_HARNESS_SCREEN_MODE", description: "Screen mode for the harness app", example: "inline | alt" },
  { name: "FTUI_HARNESS_UI_HEIGHT", description: "Rows reserved for inline UI", example: "12" },
  { name: "FTUI_HARNESS_VIEW", description: "View selector for the harness", example: "layout-grid" },
  { name: "FTUI_HARNESS_ENABLE_MOUSE", description: "Enable mouse event capture", example: "true" },
  { name: "FTUI_HARNESS_ENABLE_FOCUS", description: "Enable focus tracking events", example: "true" },
  { name: "FTUI_HARNESS_LOG_LINES", description: "Number of log lines to display", example: "25" },
  { name: "FTUI_HARNESS_LOG_MARKUP", description: "Enable log markup rendering", example: "true" },
  { name: "FTUI_HARNESS_EXIT_AFTER_MS", description: "Auto-exit after N ms (0 = disabled)", example: "0" },
  { name: "NO_COLOR", description: "Disable color output (respects standard)", example: "1" },
  { name: "COLORTERM", description: "Terminal color capability hint", example: "truecolor" },
];

// Cell data structure diagram
export const cellDiagram = `┌─────────────────────────────────────────────────────────────────┐
│                        Cell (16 bytes)                          │
├─────────────┬─────────────┬─────────────┬─────────────┬────────┤
│ CellContent │     fg      │     bg      │   attrs     │ link_id│
│  (4 bytes)  │ PackedRgba  │ PackedRgba  │  CellAttrs  │  (2B)  │
│  char/gid   │  (4 bytes)  │  (4 bytes)  │  (2 bytes)  │        │
└─────────────┴─────────────┴─────────────┴─────────────┴────────┘`;

// Architecture pipeline diagram
export const pipelineDiagram = `┌──────────────────────────────────────────────────────┐
│                     INPUT LAYER                       │
├──────────────────────────────────────────────────────┤
│ TerminalSession (crossterm)                           │
│   └─ raw events → Event (ftui-core)                   │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│                    RUNTIME LOOP                       │
├──────────────────────────────────────────────────────┤
│ Program / Model (ftui-runtime)                        │
│   update(Event) → (Model', Cmd)                       │
│   Subscriptions → tick / io / resize / ...            │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│                   RENDER KERNEL                       │
├──────────────────────────────────────────────────────┤
│ view() → Frame → Buffer → Diff → Presenter → ANSI    │
│           (cell grid)  (minimal)    (encode bytes)    │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│                    OUTPUT LAYER                        │
├──────────────────────────────────────────────────────┤
│ TerminalWriter                                        │
│   inline (scrollback)  |  alt-screen (classic)        │
└──────────────────────────────────────────────────────┘`;

// ── Additional War Stories (from FIXES_SUMMARY) ─────────────────────

export const warStoriesExtended: WarStory[] = [
  {
    title: "The Inline Ghosting Trilogy",
    subtitle: "Three bugs, one symptom: ghost UI",
    description: "Inline mode kept leaving 'ghost' frames on screen. Fix #63 removed an unconditional clear that blanked unchanged rows. Fix #68 changed Buffer::new to initialize dirty_rows=true so fresh buffers trigger full diffs. Fix #70 invalidated prev_buffer after log writes so the renderer knew the screen had moved.",
    technicalDetails: "These three bugs interacted: #63 caused flicker by clearing too aggressively, #68 caused ghosting by not clearing enough, and #70 caused stale rendering when logs scrolled the screen. Each fix was correct individually but the full picture required all three working in concert.",
    impact: "Eliminated all ghosting and flicker in inline mode across terminals.",
    icon: "ghost",
  },
  {
    title: "Zero-Width Char Desync",
    subtitle: "Combining marks broke the cursor",
    description: "Standalone combining marks (zero-width characters) caused the Presenter's cursor position to desynchronize from the terminal's actual cursor. Characters after a zero-width mark rendered at the wrong position.",
    technicalDetails: "emit_cell wrote bytes for zero-width chars but CellContent::width() returned 0, so the internal cursor_x didn't advance while the terminal cursor did. Fixed by replacing zero-width content with U+FFFD (replacement character, width 1) to maintain grid alignment.",
    impact: "Correct rendering of Unicode combining marks and edge-case graphemes.",
    icon: "cursor",
  },
  {
    title: "The Infinite Wrap Loop",
    subtitle: "CJK characters wider than viewport",
    description: "When a single CJK character (width 2) was wider than the available wrap width (1 column), the word-wrap algorithm entered an infinite loop — no progress was ever made.",
    technicalDetails: "Both wrap_line_words and wrap_line_chars had the same vulnerability: they checked if the next grapheme fit, found it didn't, but had no fallback to force progress. Fixed by adding a forced-progress path that consumes the character even when it overflows.",
    impact: "Prevented hangs on narrow terminals and edge-case CJK input.",
    icon: "infinity",
  },
  {
    title: "Input Parser DoS Protection",
    subtitle: "Malformed escape sequences swallowed input",
    description: "The CSI/OSC ignore states used for DoS protection were too sticky — they continued ignoring bytes until a valid terminator appeared. A malformed sequence like `ESC [ ... 1GB of zeros` would swallow all subsequent valid input.",
    technicalDetails: "Updated process_csi_ignore, process_osc_content, and process_osc_ignore to abort on invalid control characters (bytes < 0x20). Now if a malicious sequence hits a control char like newline, the parser resets to ground state immediately.",
    impact: "Terminal remains responsive even when processing corrupted or adversarial input.",
    icon: "shield",
  },
  {
    title: "Terminal Sync Freeze Safety",
    subtitle: "Crash during render froze the terminal",
    description: "If an application panicked mid-render while the terminal was in DEC 2026 synchronized output mode, the terminal would remain frozen — requiring a manual `reset` command.",
    technicalDetails: "TerminalSession::cleanup (the RAII Drop impl) did not emit SYNC_END. The panic hook had this safety, but the destructor did not. Fixed by adding stdout.write_all(SYNC_END) to cleanup, guaranteeing unfreeze on every exit path.",
    impact: "Terminal never left frozen regardless of crash timing.",
    icon: "lock",
  },
  {
    title: "Shakespeare Search: 100K Allocations",
    subtitle: "O(N) allocs per keystroke",
    description: "The Shakespeare text search allocated a new String (via to_ascii_lowercase) for every line in a 100K+ line document on every keystroke, causing severe input lag during search.",
    technicalDetails: "Replaced with line_contains_ignore_case, an allocation-free helper that performs case-insensitive substring checks by comparing char-by-char. The query is lowercased once; each line is scanned without allocation. Same fix applied to Code Explorer and LogViewer.",
    impact: "Search went from multi-second lag to instant (<5ms) on large documents.",
    icon: "search",
  },
  {
    title: "Presenter Cost Model Overflow",
    subtitle: "Wrong cursor moves on 4K displays",
    description: "The digit_count function capped at 3 for any input >= 100, causing incorrect cost estimation for terminals >= 1000 columns wide. This led to suboptimal cursor movement strategies on large displays.",
    technicalDetails: "Extended digit_count to handle 4 and 5 digit numbers (up to u16::MAX = 65535). Without this, the presenter would choose 'move cursor to column' over 'relative move' even when the relative move was cheaper on wide terminals.",
    impact: "Optimal ANSI byte output on 4K and ultrawide displays.",
    icon: "monitor",
  },
  {
    title: "Ratio Constraint Identity Crisis",
    subtitle: "Ratio behaved like flex-grow",
    description: "Constraint::Ratio(n, d) was implemented as a flexible weight (like CSS flex-grow) instead of a fixed fractional allocation. This made it impossible to create fixed proportional layouts like a 1/4 width sidebar.",
    technicalDetails: "Moved Ratio handling from the flexible allocation pass to the fixed allocation pass of the layout solver. It now allocates available_size * n / d, aligning behavior with Percentage and standard grid expectations.",
    impact: "Predictable proportional layouts that match developer intent.",
    icon: "layout",
  },
  {
    title: "TimeTravel Eviction Corruption",
    subtitle: "Delta frames without a base",
    description: "When the TimeTravel recorder reached capacity and evicted the oldest frame, the new oldest frame could be a delta-encoded snapshot with no base frame to reconstruct against.",
    technicalDetails: "Updated record() to perform eviction before computing the new snapshot, and to force a Full snapshot if the history is empty after eviction. This guarantees get(0) always returns a self-contained reconstructable frame.",
    impact: "Time-travel debugging works correctly even at buffer capacity.",
    icon: "clock",
  },
  {
    title: "SGR Delta Cost Miscalculation",
    subtitle: "Reset-to-default cost overestimated 4x",
    description: "The presenter estimated resetting a color to default (transparent) at 19 bytes (full RGB sequence cost), but the actual sequence is only 5 bytes. This caused unnecessary full style resets instead of cheaper delta updates.",
    technicalDetails: "Updated delta_est to check if the new color is transparent (alpha=0) and use 5 bytes for transparent transitions, 19 for opaque. This ensures the SGR delta engine correctly identifies when a delta update is cheaper than a full reset.",
    impact: "Up to 40% reduction in ANSI output bytes for typical workloads.",
    icon: "minimize",
  },
];

// ── Architecture Decision Records ───────────────────────────────────

export interface ADR {
  id: string;
  title: string;
  status: "accepted" | "proposed";
  context: string;
  decision: string;
  consequence: string;
}

export const adrs: ADR[] = [
  {
    id: "ADR-001",
    title: "Inline Mode Strategy",
    status: "accepted",
    context: "Inline mode is where most TUI frameworks fail: logs interleave with UI, cursors drift, and scrollback gets destroyed. Three strategies were evaluated: Scroll-Region Anchoring (DECSTBM), Overlay Redraw, and Hybrid.",
    decision: "Adopt Hybrid strategy: overlay redraw is always available as the correctness baseline, scroll-region is an internal optimization only where proven safe (no multiplexer, sync output detected).",
    consequence: "Correctness guaranteed across all terminals via overlay baseline. Optimized path for modern terminals. No terminal quirks exposed in public API.",
  },
  {
    id: "ADR-002",
    title: "Presenter Emission Strategy",
    status: "accepted",
    context: "The Presenter transforms a Frame into ANSI escape sequences. Getting SGR state tracking wrong causes leaked styles, corrupted hyperlinks, and broken cursor positions.",
    decision: "v1 uses Reset+Apply: every style change emits SGR 0 then re-applies all attributes. Incremental diff emission deferred until terminal model tests provide comprehensive coverage.",
    consequence: "Trivially correct — no dangling attribute bugs possible. Higher byte output accepted for correctness. Clear optimization path for future releases.",
  },
  {
    id: "ADR-003",
    title: "Terminal Backend Selection",
    status: "accepted",
    context: "The backend choice is foundational and extremely hard to change later. Crossterm, termwiz, termion, and custom termios were evaluated.",
    decision: "Crossterm is the v1 terminal backend. It provides cross-platform support (Linux, macOS, Windows), active maintenance, and familiar API. Abstracted behind our own types to preserve migration freedom.",
    consequence: "Cross-platform support out of the box. Crossterm opinions may need workarounds. Can vendor-fork as last resort if critical bugs found.",
  },
  {
    id: "ADR-005",
    title: "One-Writer Rule Enforcement",
    status: "proposed",
    context: "Terminals are a shared mutable resource. Concurrent writers cause undefined cursor position, partial escape sequence corruption, and unpredictable interleaving of UI and logs.",
    decision: "Enforce one-writer rule through ownership + routing: TerminalWriter is the single gate for all output. Supported patterns: LogSink (in-process), PTY Capture (subprocess), Stdio Capture (best-effort, feature-gated).",
    consequence: "Applications must use ftui output APIs. Libraries that write directly to stdout can still break guarantees (documented as unsupported).",
  },
  {
    id: "ADR-006",
    title: "Untrusted Output Policy",
    status: "proposed",
    context: "Agent harness UIs display tool output, LLM streams, and logs. Untrusted output can smuggle ANSI control sequences that manipulate terminal state, deceive users with fake prompts, or persist changes after the app exits.",
    decision: "Sanitize by default: all text through log paths or user-provided content is stripped of ESC, CSI, OSC, DCS, APC sequences. Only TAB, LF, CR preserved. Raw passthrough is explicitly opt-in via Text::raw().",
    consequence: "User content is safe by default. Some legitimate ANSI in logs is stripped unless opted in.",
  },
  {
    id: "ADR-007",
    title: "SDK Modularization",
    status: "accepted",
    context: "FrankenTUI should be usable beyond a single terminal host while keeping the core deterministic and dependency-light. A universal C ABI was considered but rejected.",
    decision: "Adopt an embedded, host-agnostic core for layout, text, and render. Host-specific bindings (WASM, C, Zig, JVM) as first-class crates. No mandatory universal C-ABI hub.",
    consequence: "More crates but lower coupling. Host bindings move independently without destabilizing core. Bindings created only when a host target is real.",
  },
];

// ── Terminal Compatibility Matrix ───────────────────────────────────

export interface TerminalCompat {
  terminal: string;
  trueColor: boolean;
  syncOutput: boolean;
  osc8Links: boolean;
  kittyKeyboard: boolean;
  kittyGraphics: boolean;
  sixel: boolean;
  focusEvents: boolean;
  bracketedPaste: boolean;
}

export const terminalCompatibility: TerminalCompat[] = [
  { terminal: "Kitty", trueColor: true, syncOutput: true, osc8Links: true, kittyKeyboard: true, kittyGraphics: true, sixel: false, focusEvents: true, bracketedPaste: true },
  { terminal: "WezTerm", trueColor: true, syncOutput: true, osc8Links: true, kittyKeyboard: true, kittyGraphics: true, sixel: true, focusEvents: true, bracketedPaste: true },
  { terminal: "Alacritty", trueColor: true, syncOutput: true, osc8Links: true, kittyKeyboard: false, kittyGraphics: false, sixel: false, focusEvents: true, bracketedPaste: true },
  { terminal: "Ghostty", trueColor: true, syncOutput: true, osc8Links: true, kittyKeyboard: true, kittyGraphics: true, sixel: false, focusEvents: true, bracketedPaste: true },
  { terminal: "iTerm2", trueColor: true, syncOutput: false, osc8Links: true, kittyKeyboard: false, kittyGraphics: false, sixel: true, focusEvents: true, bracketedPaste: true },
  { terminal: "GNOME Terminal", trueColor: true, syncOutput: false, osc8Links: true, kittyKeyboard: false, kittyGraphics: false, sixel: false, focusEvents: true, bracketedPaste: true },
  { terminal: "Windows Terminal", trueColor: true, syncOutput: false, osc8Links: false, kittyKeyboard: false, kittyGraphics: false, sixel: false, focusEvents: true, bracketedPaste: true },
];

export interface MuxCompat {
  name: string;
  envVar: string;
  notes: string;
  syncOutput: string;
  osc8: string;
}

export const muxCompatibility: MuxCompat[] = [
  { name: "tmux", envVar: "TMUX", notes: "Passthrough required for OSC and sync output", syncOutput: "Disabled by default", osc8: "tmux 3.3+ with allow-passthrough" },
  { name: "screen", envVar: "STY", notes: "Limited modern feature support", syncOutput: "Unreliable", osc8: "Unreliable" },
  { name: "zellij", envVar: "ZELLIJ", notes: "Better passthrough than tmux/screen", syncOutput: "Conservative", osc8: "Generally works" },
];

// ── Visual Effects Data ─────────────────────────────────────────────

export interface VisualEffect {
  name: string;
  category: string;
  description: string;
  featureFlag: string;
}

export const visualEffects: VisualEffect[] = [
  { name: "Metaballs", category: "Organic", description: "Merging blob simulation rendered as cell backgrounds with smooth falloff", featureFlag: "visual-fx-metaballs" },
  { name: "Plasma", category: "Procedural", description: "Classic demo-scene plasma with configurable palettes (Aurora, Ember, Ocean)", featureFlag: "visual-fx-plasma" },
  { name: "Clifford Attractor", category: "Mathematical", description: "Strange attractor visualization with parametric chaos", featureFlag: "visual-fx" },
  { name: "Gray-Scott Reaction-Diffusion", category: "PDE", description: "Pattern generator producing organic textures via coupled partial differential equations", featureFlag: "visual-fx" },
  { name: "Mandelbrot", category: "Fractal", description: "Complex-plane fractal with smooth coloring and zoom capability", featureFlag: "visual-fx" },
  { name: "Spiral", category: "Geometric", description: "Parametric spiral with configurable tightness and exponential expansion", featureFlag: "visual-fx" },
  { name: "Scrim (Vignette)", category: "Overlay", description: "Darkening overlay with uniform, vignette, or vertical-fade modes for text legibility", featureFlag: "visual-fx" },
  { name: "Stacked FX", category: "Composition", description: "Layer multiple effects with per-layer opacity for rich backgrounds", featureFlag: "visual-fx" },
];

// ── Keybinding Reference ────────────────────────────────────────────

export interface KeyBinding {
  key: string;
  priority: number;
  condition: string;
  action: string;
}

export const keybindingPolicy: KeyBinding[] = [
  { key: "Esc", priority: 1, condition: "Modal open", action: "Dismiss modal" },
  { key: "Ctrl+C", priority: 2, condition: "Modal open", action: "Dismiss modal" },
  { key: "Ctrl+C", priority: 3, condition: "Input has text", action: "Clear input" },
  { key: "Ctrl+C", priority: 4, condition: "Task running", action: "Cancel task" },
  { key: "Ctrl+C", priority: 5, condition: "Idle (no input/task)", action: "Quit (configurable)" },
  { key: "Esc", priority: 6, condition: "View overlay active", action: "Close overlay" },
  { key: "Esc", priority: 7, condition: "Input has text", action: "Clear input" },
  { key: "Esc", priority: 8, condition: "Task running", action: "Cancel task" },
  { key: "Esc Esc", priority: 9, condition: "Always (within 250ms)", action: "Toggle tree view" },
  { key: "Ctrl+D", priority: 10, condition: "Always", action: "Soft quit" },
  { key: "Ctrl+Q", priority: 11, condition: "Always", action: "Hard quit" },
];

// ── State Machine Overview ──────────────────────────────────────────

export interface StateMachine {
  name: string;
  states: string[];
  description: string;
  keyInvariant: string;
}

export const stateMachines: StateMachine[] = [
  {
    name: "Terminal State Machine",
    states: ["Normal", "Raw", "AltScreen"],
    description: "Models the terminal as a state machine consuming bytes and updating a display grid. Tracks cursor, style, grid, link state, cursor visibility, sync output, and scroll region.",
    keyInvariant: "Mode cleanup: on exit, Raw/AltScreen/mouse/paste/focus modes are restored to safe defaults via RAII Drop.",
  },
  {
    name: "Rendering Pipeline",
    states: ["Idle", "Measuring", "Rendering", "Diffing", "Presenting", "Error"],
    description: "The core render loop transitions through layout measurement, buffer rendering, diff computation, and ANSI presentation. Error state restores terminal to safe state.",
    keyInvariant: "In Rendering, only the back buffer is modified. In Presenting, only ANSI output is produced. After Presenting, front buffer equals desired grid.",
  },
  {
    name: "Escape Sequence Detector",
    states: ["Idle", "AwaitingSecondEsc", "Emit(Esc)", "Emit(EscEsc)"],
    description: "Detects single vs double-Esc keypress within a configurable timeout (default 250ms). Enables Esc Esc → toggle overlay without blocking single Esc events.",
    keyInvariant: "Always returns to Idle. Other keys during AwaitingSecondEsc emit the pending Esc first, then process the new key.",
  },
  {
    name: "Resize Coalescer",
    states: ["Stable", "PendingResize", "Reflowing"],
    description: "Coalesces rapid resize events using Bayesian change-point detection. Waits for the resize storm to settle before triggering a full relayout, preventing redundant render cycles.",
    keyInvariant: "Atomic present: a frame corresponds to exactly one (width, height) pair. No mixed-size or partial-size output is ever emitted.",
  },
];

// ── Visual Effects Code Example ─────────────────────────────────────

export const visualFxExample = `use ftui_core::geometry::Rect;
use ftui_extras::visual_fx::{
    Backdrop, PlasmaFx, PlasmaPalette,
    MetaballsFx, MetaballsParams,
    Scrim, ThemeInputs, FxLayer, StackedFx,
};
use ftui_render::frame::Frame;
use ftui_widgets::{paragraph::Paragraph, Widget};

struct FxDemo {
    backdrop: Backdrop,
    frame_num: u64,
}

impl FxDemo {
    pub fn new() -> Self {
        let theme = ThemeInputs::default_dark();

        // Stack multiple effects with per-layer opacity
        let mut stack = StackedFx::new();
        stack.push(FxLayer::new(
            Box::new(PlasmaFx::new(PlasmaPalette::Aurora))
        ));
        stack.push(FxLayer::with_opacity(
            Box::new(MetaballsFx::new(MetaballsParams::default())),
            0.35,
        ));

        let backdrop = Backdrop::new(Box::new(stack), theme)
            .with_effect_opacity(0.25)
            .with_scrim(Scrim::vignette(0.3));

        Self { backdrop, frame_num: 0 }
    }
}

impl Widget for FxDemo {
    fn render(&self, area: Rect, frame: &mut Frame) {
        let text = Paragraph::new("FX render behind any widget")
            .style(Style::white().bold());
        self.backdrop.render_with(area, frame, &text);
    }
}`;

// ── Keybinding Config Example ───────────────────────────────────────

export const keybindingExample = `use ftui_runtime::KeybindingConfig;

let config = KeybindingConfig {
    // What happens when Ctrl+C is pressed with no input/task:
    ctrl_c_idle_action: CtrlCIdleAction::Quit,

    // Double-Esc detection window (ms)
    esc_seq_timeout_ms: 250,

    // Min wait before treating Esc as single (ms)
    esc_debounce_ms: 50,

    // Disable multi-key sequences (strict terminals)
    disable_esc_sequences: false,
};

// Or configure via environment:
// FTUI_CTRL_C_IDLE_ACTION=quit|noop|bell
// FTUI_ESC_SEQ_TIMEOUT_MS=250
// FTUI_ESC_DEBOUNCE_MS=50`;

// ── Rendering Pipeline State Diagram ────────────────────────────────

export const renderPipelineDiagram = `┌────────┐  render request  ┌───────────┐  layout done  ┌───────────┐
│  Idle  │────────────────▶│ Measuring │──────────────▶│ Rendering │
└────────┘                  └───────────┘               └───────────┘
    ▲                                                        │
    │  present complete                              draw complete
    │                                                        │
    │                                                        ▼
┌────────────┐  diff computed  ┌─────────┐            ┌─────────┐
│ Presenting │◀────────────────│ Diffing │◀───────────│ Diffing │
└────────────┘                  └─────────┘            └─────────┘
                                    │
                              I/O error ──▶ Error ──▶ recover ──▶ Idle`;

// ── Escape Sequence State Diagram ───────────────────────────────────

export const escSeqDiagram = `┌──────────┐   Esc   ┌─────────────────────┐  timeout   ┌─────────────┐
│   Idle   │────────▶│ AwaitingSecondEsc   │───────────▶│  Emit(Esc)  │
└──────────┘         └─────────────────────┘            └─────────────┘
     ▲                        │                               │
     │                        │ Esc (within 250ms)            │
     │                        ▼                               │
     │               ┌───────────────────┐                    │
     │               │   Emit(EscEsc)    │                    │
     │               └───────────────────┘                    │
     │                        │                               │
     └────────────────────────┴───────────────────────────────┘`;

// ── Glyph Policy Overrides ──────────────────────────────────────────

export interface GlyphOverride {
  envVar: string;
  values: string;
  description: string;
}

export const glyphOverrides: GlyphOverride[] = [
  { envVar: "FTUI_GLYPH_MODE", values: "unicode | ascii", description: "Force overall glyph mode. ASCII mode forces line drawing/arrows/emoji off." },
  { envVar: "FTUI_GLYPH_EMOJI", values: "1 | 0", description: "Enable/disable emoji (ignored in ASCII mode)." },
  { envVar: "FTUI_NO_EMOJI", values: "1 | 0", description: "Legacy alias — 1 disables emoji." },
  { envVar: "FTUI_GLYPH_LINE_DRAWING", values: "1 | 0", description: "Enable/disable Unicode box drawing glyphs." },
  { envVar: "FTUI_GLYPH_ARROWS", values: "1 | 0", description: "Enable/disable Unicode arrows/symbols." },
  { envVar: "FTUI_GLYPH_DOUBLE_WIDTH", values: "1 | 0", description: "Override double-width glyph support." },
];

// ── Resize Reflow SLA ───────────────────────────────────────────────

export interface PerformanceSLA {
  metric: string;
  target: string;
  hardCap: string;
  notes: string;
}

export const performanceSLAs: PerformanceSLA[] = [
  { metric: "Resize → first stable present", target: "≤ 120ms (p95)", hardCap: "≤ 250ms (p99)", notes: "Drop intermediate sizes if over budget" },
  { metric: "Action resolution latency", target: "< 16ms", hardCap: "< 16ms", notes: "All keybinding actions complete within one frame" },
  { metric: "Conformal prediction alpha", target: "0.05", hardCap: "—", notes: "Coverage: P(y_t ≤ U_t) ≥ 95% within each bucket" },
  { metric: "Dirty-span overhead (dense)", target: "< 2%", hardCap: "< 5%", notes: "Overhead of dirty-span tracking vs full scan" },
  { metric: "Dirty-span improvement (sparse)", target: "> 50%", hardCap: "—", notes: "Scan cost reduction for ≤ 5% edit density" },
];
