// Site configuration
export const siteConfig = {
  name: "FrankenTUI",
  title: "FrankenTUI — Terminal UI Kernel for Rust",
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

// Video data - hosted externally (too large for deploy)
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
      { src: "/videos/frankentui-ghostty-resize.mp4", type: "video/mp4" },
    ],
  },
  {
    title: "Rio CRT Demo",
    description: "Full demo showcase running in Rio terminal with CRT effects",
    poster: "/screenshots/visual_effects_clifford_attractor.webp",
    sources: [
      { src: "/videos/frankentui-rio-crt.webm", type: "video/webm" },
      { src: "/videos/frankentui-rio-crt.mp4", type: "video/mp4" },
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
    title: "The Gap Storm",
    subtitle: "Infinite Loop in WezTerm",
    description: "A critical bug in `wezterm_automata` (wa) where `detect_alt_screen_changes` was stateless, causing repeated Gap events on every poll if an escape sequence remained in the buffer.",
    technicalDetails: "The parser would read a partial sequence, fail to decode it, but not advance the cursor. This caused a hot loop where the same bytes were read, failed, and triggered a 'Gap' event infinitely. Fixed by ensuring state continuity across polls.",
    impact: "Prevented 100% CPU usage in WezTerm environments.",
    icon: "zap",
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
    period: "Day 1 — Hour 0",
    title: "The Vision & The Void",
    items: [
      "Architectural blueprint established: layered kernel approach",
      "Zero-dependency core philosophy defined",
      "Initial bead graph for 100-hour sprint finalized",
    ],
  },
  {
    period: "Day 1 — Hour 5",
    title: "The First Breath",
    items: [
      "Terminal session lifecycle & raw mode initialization",
      "GraphemePool foundation for memory-efficient text",
      "One-writer discipline enforced at the crate level",
    ],
  },
  {
    period: "Day 1 — Hour 10",
    title: "Buffer & Cell",
    items: [
      "Cell type optimization: 16 bytes, SIMD-ready",
      "Virtual buffer grid with row/column addressing",
      "Initial style system: SGR attributes and color profiles",
    ],
  },
  {
    period: "Day 1 — Hour 15",
    title: "The Render Loop",
    items: [
      "BufferDiff algorithm: contiguous run optimization",
      "Presenter orchestration: bracketing frame updates",
      "First successful render of a styled 'Hello World'",
    ],
  },
  {
    period: "Day 2 — Hour 20",
    title: "Layout Engine",
    items: [
      "Flex layout solver implemented with percentage weights",
      "Constraint-based measurement protocol (Flutter-style)",
      "Rect arithmetic and coordinate systems validated",
    ],
  },
  {
    period: "Day 2 — Hour 25",
    title: "The Runtime Layer",
    items: [
      "Elm-architecture Program loop (Model/Update/View)",
      "Command (Cmd) system for async side-effects",
      "Initial subscription system for event streams",
    ],
  },
  {
    period: "Day 2 — Hour 30",
    title: "Widget Foundations",
    items: [
      "Panel, Paragraph, and StatusLine widgets",
      "Box-model: padding, margins, and borders",
      "Cursor management and focus-tracking logic",
    ],
  },
  {
    period: "Day 2 — Hour 35",
    title: "Interactive Components",
    items: [
      "TextInput with horizontal scrolling and selection",
      "Hit-testing and mouse event routing",
      "Button and Toggle primitive implementations",
    ],
  },
  {
    period: "Day 3 — Hour 40",
    title: "Advanced Data Structures",
    items: [
      "Fenwick Tree for O(log n) virtualization",
      "VirtualizedList with millions of items support",
      "Rope-backed TextArea for large file editing",
    ],
  },
  {
    period: "Day 3 — Hour 45",
    title: "Unicode Mastery",
    items: [
      "Unicode BiDi algorithm integration for RTL support",
      "Emoji ZWJ sequence handling and wide-char atomicity",
      "East Asian Width tables and surrogate pair safety",
    ],
  },
  {
    period: "Day 3 — Hour 50",
    title: "High-Performance Text",
    items: [
      "Syntax highlighting engine with syntect integration",
      "Width caching and text measurement memoization",
      "Soft-wrap and hyphenation logic for fluid layout",
    ],
  },
  {
    period: "Day 3 — Hour 55",
    title: "The Intelligence Layer",
    items: [
      "Bayesian Online Change-Point Detection (BOCPD)",
      "Adaptive resize coalescing based on regime detection",
      "Input fairness module using Jain's Index",
    ],
  },
  {
    period: "Day 4 — Hour 60",
    title: "Bayesian Rendering",
    items: [
      "Beta-distribution based strategy selection",
      "Dirty-row tracking and evidence ledgers",
      "Minimal I/O strategy for slow connections",
    ],
  },
  {
    period: "Day 4 — Hour 65",
    title: "Statistical Monitoring",
    items: [
      "E-process monitoring for anytime-valid budget tests",
      "Wealth-based wealth tracking for render loops",
      "Conformal prediction for anomaly detection in I/O",
    ],
  },
  {
    period: "Day 4 — Hour 70",
    title: "Visual Effects Kernel",
    items: [
      "Deterministic math effects: metaballs and plasma",
      "Clifford Attractor and reaction-diffusion PDE",
      "Budget-aware effect degradation for low-end terms",
    ],
  },
  {
    period: "Day 4 — Hour 75",
    title: "Workspace Expansion",
    items: [
      "Split into 12 focused crates for modularity",
      "Internal API hardening and visibility cleanup",
      "Public facade (ftui crate) and prelude design",
    ],
  },
  {
    period: "Day 5 — Hour 80",
    title: "Correctness Blitz",
    items: [
      "Saturating arithmetic conversion for all geometry",
      "Extensive property-testing suite expansion",
      "Headless TerminalModel integration tests",
    ],
  },
  {
    period: "Day 5 — Hour 85",
    title: "The Demo Showcase",
    items: [
      "Comprehensive demo app with 20+ scenarios",
      "JSONL diagnostic logging and time-travel replay",
      "Theme Studio for live UI design and export",
    ],
  },
  {
    period: "Day 5 — Hour 90",
    title: "Documentation & Polish",
    items: [
      "Formal proof sketches for sync and diff completeness",
      "Architecture spec and jargon file finalized",
      "Crates.io metadata and README branding",
    ],
  },
  {
    period: "Day 5 — Hour 95",
    title: "The Final Ascent",
    items: [
      "Final bug sweep and optimization pass",
      "Version 0.1.0 tagged and published to crates.io",
      "Release announcement and open source launch",
    ],
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
    type: "embed",
    tweetUrl: "https://x.com/jeffemanuel/status/example1",
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
    type: "embed",
    tweetUrl: "https://x.com/jeffemanuel/status/example2",
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
    question: "What is the minimum supported Rust version (MSRV)?",
    answer: "FrankenTUI targets the latest stable Rust release. We track stable closely and test on each new release within days. There is no MSRV policy — we use new language features as soon as they stabilize.",
  },
  {
    question: "Does FrankenTUI support no_std?",
    answer: "The core rendering crates (ftui-render, ftui-style, ftui-text, ftui-layout) are designed with minimal allocator dependencies, but the runtime and I/O layers require std. Full no_std support is a future goal for embedded terminal UIs.",
  },
  {
    question: "How does FrankenTUI compare to Ratatui?",
    answer: "Ratatui is a mature, widely-adopted library with a large ecosystem. FrankenTUI takes a different approach: it enforces correctness invariants at the kernel level (one-writer rule, RAII cleanup, deterministic rendering) that Ratatui leaves to the application. FrankenTUI also includes statistical algorithms (Bayesian diff, BOCPD resize) that have no equivalent in Ratatui. Choose Ratatui for ecosystem breadth; choose FrankenTUI for architectural correctness and novel algorithms.",
  },
  {
    question: "Can I use FrankenTUI with tokio/async-std?",
    answer: "Yes. The ftui-runtime crate provides an async-compatible event loop. You can spawn background tasks with Cmd::perform() and receive their results as messages, exactly like Elm's Cmd pattern. The runtime handles the async executor integration so your Model stays synchronous and testable.",
  },
  {
    question: "Does inline mode work inside tmux?",
    answer: "Yes, with caveats. FrankenTUI auto-detects tmux via the TMUX environment variable and wraps escape sequences in DCS passthrough envelopes. Some advanced features (OSC 8 hyperlinks, DEC 2026 sync) require tmux 3.3+ with allow-passthrough enabled. Inline mode scrollback preservation works correctly in all tmux versions.",
  },
  {
    question: "How do I run tests for my FrankenTUI app?",
    answer: "FrankenTUI provides a TerminalModel that simulates a real terminal in memory. Write your test, create a TerminalModel, render your app's view into it, and assert on individual cells. For full integration tests, use PtyCapture to run your app in a real pseudo-terminal. Snapshot tests are also supported for regression detection.",
  },
  {
    question: "What terminals are supported?",
    answer: "FrankenTUI works in any terminal that supports basic ANSI escape sequences: iTerm2, Alacritty, Kitty, WezTerm, Ghostty, Windows Terminal, and GNOME Terminal. Advanced features like true color, hyperlinks, and synchronized output are detected at runtime via TerminalCapabilities and gracefully degrade in older terminals.",
  },
  {
    question: "Is FrankenTUI production-ready?",
    answer: "FrankenTUI is at v0.1.x — the API surface is stabilizing but may have breaking changes before 1.0. The rendering kernel is thoroughly tested with property tests, snapshot tests, and PTY integration tests. It is suitable for personal tools and internal applications. For mission-critical production use, wait for the 1.0 release.",
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
