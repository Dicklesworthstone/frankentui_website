#!/usr/bin/env bash
set -euo pipefail

# update-web-demo.sh — End-to-end: build WASM → sync → commit → deploy
#
# Usage:
#   ./scripts/update-web-demo.sh                 # Full pipeline
#   ./scripts/update-web-demo.sh --skip-build    # Skip WASM build, just sync+commit+push
#   ./scripts/update-web-demo.sh --no-push       # Build+sync+commit but don't push
#   ./scripts/update-web-demo.sh --dry-run       # Preview only

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBSITE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRANKENTUI_ROOT="${FRANKENTUI_ROOT:-/dp/frankentui}"
# build-wasm.sh requires a fresh absolute output directory outside the checkout
# and writes the deployable bundle to <output>/site.
BUILD_ROOT="${BUILD_ROOT:-${TMPDIR:-/tmp}/frankentui-web-build}"

SKIP_BUILD=false
NO_PUSH=false
DRY_RUN=false
SITE_DIR=""

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    --no-push) NO_PUSH=true ;;
    --dry-run) DRY_RUN=true ;;
    --site=*) SITE_DIR="${arg#--site=}" ;;
    -*) echo "Unknown flag: $arg" >&2; exit 1 ;;
  esac
done

if $SKIP_BUILD && [[ -z "$SITE_DIR" ]]; then
  echo "ERROR: --skip-build requires --site=/abs/NEW_OUTPUT_DIR/site" >&2
  exit 1
fi

step() { echo ""; echo "=== [$1] $(date +%H:%M:%S) ===" ; }
elapsed() { echo "  (${SECONDS}s elapsed)"; }
SECONDS=0

if $DRY_RUN; then
  echo "=== DRY RUN — no changes will be made ==="
  echo ""
fi

# ── Step 1: Validate repos ────────────────────────────────────────
step "Validate"

if [[ ! -d "$FRANKENTUI_ROOT" ]]; then
  echo "ERROR: FrankenTUI repo not found at $FRANKENTUI_ROOT" >&2
  exit 1
fi

if [[ ! -d "$WEBSITE_ROOT/.git" ]]; then
  echo "ERROR: Website repo not found at $WEBSITE_ROOT" >&2
  exit 1
fi

# Check website repo is clean
if ! $DRY_RUN; then
  WEBSITE_STATUS=$(git -C "$WEBSITE_ROOT" status --porcelain -- ':!.beads/')
  if [[ -n "$WEBSITE_STATUS" ]]; then
    echo "WARNING: Website repo has uncommitted changes (excluding .beads/):"
    echo "$WEBSITE_STATUS" | head -10
    echo ""
    echo "Continuing anyway — the commit will include these changes."
  fi
fi

# Pushing from anything but main would deploy nothing, or the wrong thing.
if ! $NO_PUSH && ! $DRY_RUN; then
  BRANCH=$(git -C "$WEBSITE_ROOT" rev-parse --abbrev-ref HEAD)
  if [[ "$BRANCH" != main ]]; then
    echo "ERROR: website repo is on '$BRANCH'; deploys push main (use --no-push to only commit)" >&2
    exit 1
  fi
fi

# The commit being built, captured now: build-wasm.sh records none, and HEAD
# can move while it compiles when other agents push to frankentui. An explicit
# FRANKENTUI_GIT_SHA wins, which is how a --skip-build bundle names its source.
if [[ -z "${FRANKENTUI_GIT_SHA:-}" ]]; then
  FRANKENTUI_GIT_SHA=$(git -C "$FRANKENTUI_ROOT" rev-parse HEAD 2>/dev/null || true)
  if $SKIP_BUILD; then
    echo "NOTE: --skip-build records frankentui HEAD as the bundle's source commit;"
    echo "      set FRANKENTUI_GIT_SHA if it was built from another commit."
  fi
fi
FRANKENTUI_SHA="${FRANKENTUI_GIT_SHA:0:8}"
FRANKENTUI_SHA="${FRANKENTUI_SHA:-unknown}"

echo "FrankenTUI: $FRANKENTUI_ROOT ($FRANKENTUI_SHA)"
echo "Website:    $WEBSITE_ROOT"
elapsed

# ── Step 2: Build WASM ────────────────────────────────────────────
if ! $SKIP_BUILD; then
  step "Build WASM"
  if [[ ! -f "$FRANKENTUI_ROOT/build-wasm.sh" ]]; then
    echo "ERROR: build-wasm.sh not found at $FRANKENTUI_ROOT" >&2
    exit 1
  fi

  # A fresh directory per run: build-wasm.sh refuses an existing output path,
  # which is what keeps a rebuild from reusing stale pkg files.
  BUILD_OUT="$BUILD_ROOT/$(date +%Y%m%d-%H%M%S)"
  SITE_DIR="$BUILD_OUT/site"

  if $DRY_RUN; then
    echo "Would run: bash build-wasm.sh $BUILD_OUT"
  else
    mkdir -p "$BUILD_ROOT"
    (cd "$FRANKENTUI_ROOT" && bash build-wasm.sh "$BUILD_OUT")
    echo "Bundle: $SITE_DIR"
  fi
  elapsed
else
  step "Build WASM (SKIPPED)"
  if [[ ! -d "$SITE_DIR" ]]; then
    echo "ERROR: --site=$SITE_DIR not found — cannot skip build without existing artifacts" >&2
    exit 1
  fi
fi

# ── Step 3: Sync artifacts ────────────────────────────────────────
step "Sync"
if $DRY_RUN && ! [[ -d "$SITE_DIR" ]]; then
  echo "Would run: sync-showcase.sh $SITE_DIR"
else
  SYNC_ARGS=("$SITE_DIR")
  if $DRY_RUN; then
    SYNC_ARGS+=("--dry-run")
  fi
  FRANKENTUI_ROOT="$FRANKENTUI_ROOT" FRANKENTUI_GIT_SHA="$FRANKENTUI_GIT_SHA" \
    "$SCRIPT_DIR/sync-showcase.sh" "${SYNC_ARGS[@]}"
fi
elapsed

# ── Step 4: Commit ────────────────────────────────────────────────
step "Commit"

if $DRY_RUN; then
  echo "Would commit public/web/ with message: chore(web): sync WASM showcase [$FRANKENTUI_SHA]"
else
  git -C "$WEBSITE_ROOT" add public/web/
  # Only public/web/ counts, and only public/web/ is committed: the index is
  # shared with other agents, and a bare `git commit` would sweep whatever they
  # have staged into a deploy.
  if git -C "$WEBSITE_ROOT" diff --cached --quiet -- public/web/; then
    echo "No changes to commit — artifacts are already up to date."
  else
    git -C "$WEBSITE_ROOT" commit -m "$(cat <<EOF
chore(web): sync WASM showcase [$FRANKENTUI_SHA]

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)" -- public/web/
    echo "Committed."
  fi
fi
elapsed

# ── Step 5: Push / Deploy ─────────────────────────────────────────
if ! $NO_PUSH; then
  step "Push"
  if $DRY_RUN; then
    echo "Would push to origin/main and origin/master (Vercel auto-deploys)"
  else
    # master exists for legacy URLs and must stay identical to main.
    git -C "$WEBSITE_ROOT" push origin main
    git -C "$WEBSITE_ROOT" push origin main:master
    echo "Pushed main and master. Vercel will auto-deploy."
  fi
  elapsed
else
  step "Push (SKIPPED — --no-push)"
fi

# ── Done ──────────────────────────────────────────────────────────
step "Done"
echo "Total time: ${SECONDS}s"
