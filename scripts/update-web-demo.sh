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
FRANKENTUI_ROOT="/dp/frankentui"
FRANKENTUI_DIST="$FRANKENTUI_ROOT/dist"

SKIP_BUILD=false
NO_PUSH=false
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    --no-push) NO_PUSH=true ;;
    --dry-run) DRY_RUN=true ;;
    -*) echo "Unknown flag: $arg" >&2; exit 1 ;;
  esac
done

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

echo "FrankenTUI: $FRANKENTUI_ROOT"
echo "Website:    $WEBSITE_ROOT"
elapsed

# ── Step 2: Build WASM ────────────────────────────────────────────
if ! $SKIP_BUILD; then
  step "Build WASM"
  if [[ ! -f "$FRANKENTUI_ROOT/build-wasm.sh" ]]; then
    echo "ERROR: build-wasm.sh not found at $FRANKENTUI_ROOT" >&2
    exit 1
  fi

  if $DRY_RUN; then
    echo "Would run: $FRANKENTUI_ROOT/build-wasm.sh"
  else
    (cd "$FRANKENTUI_ROOT" && bash build-wasm.sh)
  fi
  elapsed
else
  step "Build WASM (SKIPPED)"
  if [[ ! -d "$FRANKENTUI_DIST" ]]; then
    echo "ERROR: dist/ not found — cannot skip build without existing artifacts" >&2
    exit 1
  fi
fi

# ── Step 3: Sync artifacts ────────────────────────────────────────
step "Sync"
SYNC_ARGS=("$FRANKENTUI_DIST")
if $DRY_RUN; then
  SYNC_ARGS+=("--dry-run")
fi
"$SCRIPT_DIR/sync-showcase.sh" "${SYNC_ARGS[@]}"
elapsed

# ── Step 4: Commit ────────────────────────────────────────────────
step "Commit"
FRANKENTUI_SHA=$(git -C "$FRANKENTUI_ROOT" rev-parse --short HEAD 2>/dev/null || echo "unknown")

if $DRY_RUN; then
  echo "Would commit public/web/ with message: chore(web): sync WASM showcase [$FRANKENTUI_SHA]"
else
  git -C "$WEBSITE_ROOT" add public/web/
  # Check if there's anything to commit
  if git -C "$WEBSITE_ROOT" diff --cached --quiet; then
    echo "No changes to commit — artifacts are already up to date."
  else
    git -C "$WEBSITE_ROOT" commit -m "$(cat <<EOF
chore(web): sync WASM showcase [$FRANKENTUI_SHA]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
    echo "Committed."
  fi
fi
elapsed

# ── Step 5: Push / Deploy ─────────────────────────────────────────
if ! $NO_PUSH; then
  step "Push"
  if $DRY_RUN; then
    echo "Would push to origin/main (Vercel auto-deploys)"
  else
    git -C "$WEBSITE_ROOT" push
    echo "Pushed. Vercel will auto-deploy."
  fi
  elapsed
else
  step "Push (SKIPPED — --no-push)"
fi

# ── Done ──────────────────────────────────────────────────────────
step "Done"
echo "Total time: ${SECONDS}s"
