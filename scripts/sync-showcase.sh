#!/usr/bin/env bash
set -euo pipefail

# sync-showcase.sh — Mirror WASM showcase demo artifacts into public/web/
#
# Usage:
#   ./scripts/sync-showcase.sh                    # Default source: /dp/frankentui/dist/
#   ./scripts/sync-showcase.sh /path/to/dist      # Custom source
#   ./scripts/sync-showcase.sh --dry-run           # Preview without copying
#   ./scripts/sync-showcase.sh /path/to/dist --dry-run

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEFAULT_SRC="/dp/frankentui/dist/"
DEST="$REPO_ROOT/public/web/"

DRY_RUN=false
SRC="$DEFAULT_SRC"

# Parse args
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    -*) echo "Unknown flag: $arg" >&2; exit 1 ;;
    *) SRC="$arg" ;;
  esac
done

# Ensure trailing slash for rsync
[[ "$SRC" != */ ]] && SRC="$SRC/"

# Validate source
if [[ ! -d "$SRC" ]]; then
  echo "ERROR: Source directory not found: $SRC" >&2
  exit 1
fi

EXPECTED_FILES=("index.html" "pkg" "fonts" "assets")
for f in "${EXPECTED_FILES[@]}"; do
  if [[ ! -e "${SRC}${f}" ]]; then
    echo "ERROR: Expected file/dir missing in source: ${SRC}${f}" >&2
    exit 1
  fi
done

# Create destination if needed
mkdir -p "$DEST"

# Build rsync args
RSYNC_ARGS=(-av --delete --exclude='og.png' --exclude='version.json')
if $DRY_RUN; then
  RSYNC_ARGS+=(--dry-run)
  echo "=== DRY RUN ==="
fi

echo "Source: $SRC"
echo "Dest:   $DEST"
echo ""

rsync "${RSYNC_ARGS[@]}" "$SRC" "$DEST"

# Remove wasm-pack's .gitignore that blocks all files from being committed
if ! $DRY_RUN && [[ -f "${DEST}pkg/.gitignore" ]]; then
  rm "${DEST}pkg/.gitignore"
  echo "Removed wasm-pack .gitignore from pkg/ (blocks git tracking)"
fi

# Post-sync HTML injections
if ! $DRY_RUN && [[ -f "${DEST}index.html" ]]; then
  # 1. Inject <base href="/web/"> so relative paths resolve correctly under /web
  if ! grep -q '<base href=' "${DEST}index.html"; then
    sed -i 's|<head>|<head>\n<base href="/web/">|' "${DEST}index.html"
    echo "Injected <base href=\"/web/\"> into index.html"
  fi

  # (WebGPU fallback and guard injection removed — the WASM renderer has a
  #  WebGL/Canvas2D fallback path and works on browsers without WebGPU,
  #  including Safari/iOS.)
fi

# Summary and version manifest
if ! $DRY_RUN; then
  FILE_COUNT=$(find "$DEST" -type f ! -name "version.json" | wc -l)
  TOTAL_SIZE=$(du -sh "$DEST" | cut -f1)

  # Extract ASSET_VERSION from HTML if present
  ASSET_VERSION=""
  if [[ -f "${DEST}index.html" ]]; then
    ASSET_VERSION=$(grep -oP "ASSET_VERSION\s*=\s*['\"]?\K[^'\";\s]+" "${DEST}index.html" 2>/dev/null || echo "")
  fi

  # Get frankentui git SHA if the source is in a git repo
  FRANKENTUI_GIT_SHA=""
  SRC_NO_SLASH="${SRC%/}"
  SRC_PARENT="$(dirname "$SRC_NO_SLASH")"
  if git -C "$SRC_PARENT" rev-parse HEAD &>/dev/null; then
    FRANKENTUI_GIT_SHA=$(git -C "$SRC_PARENT" rev-parse HEAD 2>/dev/null || echo "")
  fi

  # Build file manifest with sizes and sha256
  FILES_JSON="{"
  FIRST=true
  while IFS= read -r -d '' file; do
    REL="${file#"$DEST"}"
    SIZE=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo 0)
    HASH=$(sha256sum "$file" 2>/dev/null | cut -d' ' -f1 || shasum -a 256 "$file" 2>/dev/null | cut -d' ' -f1 || echo "")
    if ! $FIRST; then FILES_JSON+=","; fi
    FILES_JSON+="\"$REL\":{\"size_bytes\":$SIZE,\"sha256\":\"$HASH\"}"
    FIRST=false
  done < <(find "$DEST" -type f ! -name "version.json" -print0 | sort -z)
  FILES_JSON+="}"

  # Write version.json
  cat > "${DEST}version.json" <<MANIFEST
{
  "synced_at": "$(date -Iseconds)",
  "source_dir": "$SRC",
  "asset_version": "$ASSET_VERSION",
  "frankentui_git_sha": "$FRANKENTUI_GIT_SHA",
  "file_count": $FILE_COUNT,
  "files": $FILES_JSON
}
MANIFEST

  echo ""
  echo "=== Sync Complete ==="
  echo "Files:     $FILE_COUNT"
  echo "Total:     $TOTAL_SIZE"
  echo "Manifest:  ${DEST}version.json"
  echo "Timestamp: $(date -Iseconds)"
fi
