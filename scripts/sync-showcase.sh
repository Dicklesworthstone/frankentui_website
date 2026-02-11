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

  # 2. Inject WebGPU fallback page (polished browser compatibility message)
  if ! grep -q 'webgpu-fallback' "${DEST}index.html"; then
    # Add fallback CSS to the style block
    sed -i '/<\/style>/i\
  #webgpu-fallback {\
    display: none; position: fixed; inset: 0; z-index: 100;\
    background: #0a0a0a; color: #e2e8f0;\
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
    padding: 40px; overflow: auto;\
    flex-direction: column; align-items: center; justify-content: center; text-align: center;\
  }\
  #webgpu-fallback.visible { display: flex; }\
  #webgpu-fallback h1 { font-size: 28px; font-weight: 800; color: #22c55e; margin-bottom: 12px; }\
  #webgpu-fallback h2 { font-size: 18px; font-weight: 600; color: #94a3b8; margin-bottom: 24px; }\
  #webgpu-fallback .supported { background: #1a1a2e; border: 1px solid #334155; border-radius: 12px; padding: 24px; max-width: 480px; margin-bottom: 24px; }\
  #webgpu-fallback .supported h3 { color: #22c55e; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }\
  #webgpu-fallback .browser-list { list-style: none; padding: 0; text-align: left; }\
  #webgpu-fallback .browser-list li { padding: 6px 0; color: #cbd5e1; font-size: 14px; }\
  #webgpu-fallback .browser-list li::before { content: "\\2713 "; color: #22c55e; font-weight: bold; }\
  #webgpu-fallback .actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }\
  #webgpu-fallback .actions a {\
    padding: 12px 24px; border-radius: 9999px; font-weight: 700; font-size: 13px;\
    text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.2s;\
  }\
  #webgpu-fallback .btn-primary { background: #22c55e; color: #000; }\
  #webgpu-fallback .btn-primary:hover { background: #16a34a; }\
  #webgpu-fallback .btn-secondary { background: transparent; color: #94a3b8; border: 1px solid #334155; }\
  #webgpu-fallback .btn-secondary:hover { border-color: #22c55e; color: #22c55e; }' "${DEST}index.html"

    # Add fallback HTML before the error-overlay div
    sed -i '/<div id="error-overlay"><\/div>/i\
<div id="webgpu-fallback">\
  <h1>FrankenTUI Live Demo</h1>\
  <h2>This demo requires WebGPU, which is not available in your browser.</h2>\
  <div class="supported">\
    <h3>Supported Browsers</h3>\
    <ul class="browser-list">\
      <li>Google Chrome 113+ (recommended)</li>\
      <li>Microsoft Edge 113+</li>\
      <li>Opera 99+</li>\
      <li>Chrome for Android 113+</li>\
    </ul>\
  </div>\
  <div class="actions">\
    <a href="/" class="btn-primary">Back to FrankenTUI</a>\
    <a href="/showcase" class="btn-secondary">View Screenshots</a>\
  </div>\
</div>' "${DEST}index.html"

    # Add early WebGPU detection script before the main module script
    sed -i '/<script type="module">/i\
<script>\
if (!navigator.gpu) {\
  document.addEventListener("DOMContentLoaded", function() {\
    var fb = document.getElementById("webgpu-fallback");\
    if (fb) fb.classList.add("visible");\
    var st = document.getElementById("status");\
    if (st) st.style.display = "none";\
  });\
}\
</script>' "${DEST}index.html"

    echo "Injected WebGPU fallback page into index.html"
  fi

  # 3. Inject WebGPU guard at top of main module script to prevent WASM loading on unsupported browsers
  if ! grep -q 'WebGPU guard' "${DEST}index.html"; then
    sed -i '/<script type="module">/a\
// ── WebGPU guard — bail out immediately on unsupported browsers ────────\
if (!navigator.gpu) {\
  throw new Error("WebGPU not supported — skipping WASM demo initialization.");\
}' "${DEST}index.html"
    echo "Injected WebGPU guard into module script"
  fi
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
