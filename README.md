# FrankenTUI Website

<p align="center">
  <img src="public/frankentui_alien_artifact.png" alt="FrankenTUI" width="720" />
</p>

<p align="center">
  <strong>The cinematic website for FrankenTUI (the “monster” Rust TUI kernel).</strong><br/>
  Next.js App Router, framer-motion, interactive data viz, and static forensic datasets.
</p>

<p align="center">
  <a href="https://frankentui.com">frankentui.com</a> •
  <a href="https://github.com/Dicklesworthstone/frankentui">FrankenTUI kernel repo</a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.1.6-black" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb" />
  <img alt="Bun" src="https://img.shields.io/badge/Bun-bun%20only-14151a" />
  <img alt="Vercel" src="https://img.shields.io/badge/Deployed%20on-Vercel-black" />
</p>

## TL;DR

**The Problem:** Most “project sites” are either static marketing pages or heavyweight doc sites that can’t carry interactive, data-driven artifacts without turning into a bundle-size disaster.

**The Solution:** This repo is a **Next.js 16** site that stays mostly static, but can still ship **high-impact interactive pages** (spec evolution lab, Beads DAG viewer) powered by **precomputed datasets** in `public/`.

**Why Use This Repo?**

| Feature | What you get |
|---|---|
| App Router + static generation | Fast, CDN-friendly pages with minimal server requirements |
| “Beads” project graph viewer | Client-side `sql.js` queries + force-graph visualization from a shipped SQLite DB |
| Spec Evolution Lab | Forensic UI to scrub commits, diff artifacts, and render markdown snapshots |
| Polished motion system | Framer Motion + careful reduced-motion fallbacks |
| OG/Twitter images | `opengraph-image.tsx` routes for share cards |

## Quick Example

```bash
# Install deps (BUN ONLY)
bun install

# Run dev server (Turbopack)
bun dev

# Production build
bun run build

# Run prod server
bun start
```

## Design Philosophy

- **Static first.** Prefer static pages and shipping artifacts in `public/` over adding backend dependencies.
- **Interactive where it matters.** Spend the JS budget on pages that earn it (graph viewer, spec lab).
- **Deterministic artifacts.** “Forensic” pages read from versioned datasets (JSON / SQLite) instead of live APIs.
- **Performance is a feature.** Avoid accidental megabundles; lazy-load heavy libraries where possible.

## Comparison (Rough)

| Approach | Pros | Cons |
|---|---|---|
| Plain marketing page | Small, simple | No serious interactive artifacts |
| Docusaurus / doc site | Great for docs | Harder to do bespoke, cinematic interactive pages |
| This repo (Next.js App Router) | Best of both: static + interactive artifacts | More custom code and motion to maintain |

## Installation

Requirements:

- `bun` (this project does **not** support npm/yarn/pnpm)

```bash
bun install
```

## Quick Start (Dev)

```bash
bun dev
```

By default Next runs on port `3000`. To change the port:

```bash
PORT=3100 bun dev
```

## Commands

From `package.json`:

- `bun dev` runs the dev server (Turbopack).
- `bun run build` creates a production build.
- `bun start` serves the production build.
- `bun lint` runs ESLint.
- `bun tsc --noEmit` runs TypeScript typechecking.

## Configuration

This repo is intentionally low-config.

Useful environment variables:

- `PORT`: server port (dev or prod), e.g. `PORT=3100`
- `BASE_URL`: used by Playwright tests when they call `page.goto(...)`

Example:

```bash
BASE_URL=http://localhost:3100 bunx playwright test
```

## Architecture

High-level layout:

```text
app/                      Next.js App Router routes + OG image routes
components/               Client UI (motion, visuals, viewers)
lib/                      Pure helpers + data/model code
public/                   Shipped forensic artifacts (JSON, SQLite, media)
tests/                    Playwright E2E + perf guardrails
```

Data flow (interactive pages):

```text
          ┌────────────────────────────────────┐
          │            Next.js Pages            │
          │   app/**/page.tsx (static shell)   │
          └───────────────┬────────────────────┘
                          │
                          ▼
          ┌────────────────────────────────────┐
          │      Client Components (React)      │
          │  components/** (motion + viewers)   │
          └───────────────┬────────────────────┘
                          │
          ┌───────────────┴────────────────────┐
          │                                    │
          ▼                                    ▼
┌───────────────────────┐          ┌──────────────────────────┐
│ Beads Graph (/beads)  │          │ Spec Lab (/how-it-was-*) │
│ 1. Load sql.js + d3   │          │ 1. Load JSON dataset      │
│ 2. Fetch SQLite chunks│          │ 2. Compute diffs           │
│ 3. Query in-browser   │          │ 3. Render snapshot markdown│
│ 4. Render force graph │          │ 4. Lazy-load md renderers  │
└───────────────────────┘          └──────────────────────────┘
```

Key shipped artifacts:

- `public/beads-viewer/beads.sqlite3` (chunked binaries + config) for the DAG viewer
- `public/how-it-was-built/frankentui_spec_evolution_dataset.json` for the Spec Evolution Lab

## Testing

This repo uses **Playwright** (E2E), with some performance assertions.

One-time browser install:

```bash
bunx playwright install
```

Run tests (you must have the site running):

```bash
# terminal 1
PORT=3100 bun dev

# terminal 2
BASE_URL=http://localhost:3100 bunx playwright test
```

## Troubleshooting

### Videos don’t play in Safari

This repo ships WebM sources in `public/videos/`. MP4 fallbacks are intentionally gitignored (`public/videos/*.mp4`).

Options:

1. Add local MP4 files (uncommitted) to `public/videos/`.
2. Host MP4s externally and add additional `<source>` entries in `lib/content.ts`.

### Playwright tests fail to navigate

Set `BASE_URL` to the port you’re running on:

```bash
BASE_URL=http://localhost:3000 bunx playwright test
```

### Bun vs npm

If you see `package-lock.json` or `yarn.lock`, you’re doing it wrong. This repo is **bun-only**.

## Limitations

- No backend: everything is static or client-side, by design.
- Heavily animated UI: reduced-motion is respected, but this is not a “minimal JS” aesthetic project.
- No contribution workflow: see policy below.

## FAQ

**Is this the FrankenTUI kernel repo?**  
No. This is the website. The kernel repo is linked above.

**Where does the graph/spec data come from?**  
From versioned artifacts in `public/` (SQLite + JSON). No live API is required.

**Can I deploy this anywhere besides Vercel?**  
Yes. It’s a standard Next.js app; any platform that supports `next build`/`next start` works.

## About Contributions

> *About Contributions:* Please don't take this the wrong way, but I do not accept outside contributions for any of my projects. I simply don't have the mental bandwidth to review anything, and it's my name on the thing, so I'm responsible for any problems it causes; thus, the risk-reward is highly asymmetric from my perspective. I'd also have to worry about other "stakeholders," which seems unwise for tools I mostly make for myself for free. Feel free to submit issues, and even PRs if you want to illustrate a proposed fix, but know I won't merge them directly. Instead, I'll have Claude or Codex review submissions via `gh` and independently decide whether and how to address them. Bug reports in particular are welcome. Sorry if this offends, but I want to avoid wasted time and hurt feelings. I understand this isn't in sync with the prevailing open-source ethos that seeks community contributions, but it's the only way I can move at this velocity and keep my sanity.

