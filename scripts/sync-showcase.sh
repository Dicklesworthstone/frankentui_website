#!/usr/bin/env bash
set -euo pipefail

# sync-showcase.sh — Mirror WASM showcase demo artifacts into public/web/
#
# The source is the `site/` directory produced by frankentui's build-wasm.sh,
# which writes to a fresh output directory:
#
#   bash build-wasm.sh /absolute/NEW_OUTPUT_DIR   # -> NEW_OUTPUT_DIR/site
#
# Usage:
#   ./scripts/sync-showcase.sh /abs/NEW_OUTPUT_DIR/site
#   ./scripts/sync-showcase.sh /abs/NEW_OUTPUT_DIR/site --dry-run
#
# This script never deletes files in public/web/. Artifacts that the build no
# longer emits are reported as stale and left in place for a human to remove.
#
# SYNC_SHOWCASE_DEST overrides the destination. The tests use it so they never
# touch the checked-in bundle: a test run that cleared and restored public/web/
# could, if interrupted, leave fake packages where the deployed ones belong.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEST="${SYNC_SHOWCASE_DEST:-$REPO_ROOT/public/web}"
[[ "$DEST" != */ ]] && DEST="$DEST/"

DRY_RUN=false
SRC=""

# Parse args
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    -*) echo "Unknown flag: $arg" >&2; exit 1 ;;
    *) SRC="$arg" ;;
  esac
done

if [[ -z "$SRC" ]]; then
  echo "ERROR: source site/ directory is required" >&2
  echo "usage: $0 /abs/NEW_OUTPUT_DIR/site [--dry-run]" >&2
  exit 1
fi

# Ensure trailing slash for rsync
[[ "$SRC" != */ ]] && SRC="$SRC/"

# Validate source
if [[ ! -d "$SRC" ]]; then
  echo "ERROR: Source directory not found: $SRC" >&2
  exit 1
fi

EXPECTED_FILES=("index.html" "pkg" "fonts" "assets" "pkg/manifest.json")
for f in "${EXPECTED_FILES[@]}"; do
  if [[ ! -e "${SRC}${f}" ]]; then
    echo "ERROR: Expected file/dir missing in source: ${SRC}${f}" >&2
    exit 1
  fi
done

# Create destination if needed
mkdir -p "$DEST"

# No --delete: removing files is a human decision (see header). og.png and
# version.json are owned by this repo and are never sourced from the build.
RSYNC_ARGS=(-av --exclude='og.png' --exclude='version.json')
if $DRY_RUN; then
  RSYNC_ARGS+=(--dry-run)
  echo "=== DRY RUN ==="
fi

echo "Source: $SRC"
echo "Dest:   $DEST"
echo ""

rsync "${RSYNC_ARGS[@]}" "$SRC" "$DEST"

# Report (never remove) destination files the build no longer produces.
if ! $DRY_RUN; then
  STALE=$(rsync -an --delete --exclude='og.png' --exclude='version.json' \
    --out-format='%n' "$SRC" "$DEST" | grep '^deleting ' || true)
  if [[ -n "$STALE" ]]; then
    echo ""
    echo "NOTE: these files exist in public/web/ but are not produced by the build."
    echo "      They were left in place; remove them by hand if they are obsolete."
    echo "$STALE" | sed 's/^deleting /      /'
  fi
fi

# Post-sync HTML rewrite.
#
# frankentui_showcase_demo.html is written to be served from the root of its own
# bundle, so it uses relative "./pkg/", "./assets/" and "./fonts/" references.
# Here it is served at /web (with no trailing slash), where "./pkg/x" would
# resolve to /pkg/x. Rewrite those prefixes to absolute /web/ paths, and inject
# <base href="/web/"> so any relative reference added upstream later still
# resolves inside the bundle rather than at the site root.
if ! $DRY_RUN; then
  python3 - "${DEST}index.html" <<'PY'
import pathlib, re, sys

path = pathlib.Path(sys.argv[1])
html = path.read_text(encoding="utf-8")
original = html

if "<base href=" not in html:
    html = html.replace("<head>", '<head>\n<base href="/web/">', 1)

for prefix in ("pkg", "assets", "fonts"):
    html = html.replace(f"./{prefix}/", f"/web/{prefix}/")

# The demo resolves nothing through import.meta.url today, but a bundler-style
# `new URL("...", import.meta.url)` would break for an inline module script,
# whose import.meta.url is the document URL and ignores <base href>.
html = html.replace(", import.meta.url)", ", window.location.origin)")

remaining = re.findall(r'["\'`(]\./[^"\'`)]+', html)
if remaining:
    raise SystemExit(f"unrewritten relative references remain: {sorted(set(remaining))}")

path.write_text(html, encoding="utf-8")
print("Rewrote relative paths to absolute /web/ paths" if html != original
      else "index.html already absolute; no rewrite needed")
PY
fi

# Summary and version manifest
if ! $DRY_RUN; then
  # Provenance of the frankentui checkout the bundle was built from. SRC is
  # NEW_OUTPUT_DIR/site, which lives outside the checkout, so the caller passes
  # the source repo explicitly; fall back to the conventional location.
  FRANKENTUI_ROOT="${FRANKENTUI_ROOT:-/dp/frankentui}"
  FRANKENTUI_GIT_SHA=""
  if git -C "$FRANKENTUI_ROOT" rev-parse HEAD &>/dev/null; then
    FRANKENTUI_GIT_SHA=$(git -C "$FRANKENTUI_ROOT" rev-parse HEAD)
  fi

  python3 - "$DEST" "$SRC" "$FRANKENTUI_GIT_SHA" <<'PY'
import datetime, hashlib, json, pathlib, sys

dest, src, git_sha = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
files = sorted(p for p in dest.rglob("*") if p.is_file() and p.name != "version.json")
manifest = json.loads((dest / "pkg/manifest.json").read_text())
# Not `date -Iseconds`: -I is a GNU extension, and shelling out would record an
# empty timestamp rather than failing if it is unsupported.
stamp = datetime.datetime.now().astimezone().isoformat(timespec="seconds")

payload = {
    "synced_at": stamp,
    "source_dir": src,
    "frankentui_git_sha": git_sha,
    "toolchain": manifest["toolchain"],
    "renderer_revision": manifest["renderer"]["revision"],
    "source_inputs_sha256": manifest["source_inputs_sha256"],
    "runner_lock_sha256": manifest["runner_lock_sha256"],
    "file_count": len(files),
    "files": {
        p.relative_to(dest).as_posix(): {
            "size_bytes": p.stat().st_size,
            "sha256": hashlib.sha256(p.read_bytes()).hexdigest(),
        }
        for p in files
    },
}
(dest / "version.json").write_text(json.dumps(payload, indent=2) + "\n")
print(f"Files:    {len(files)}")
print(f"Manifest: {dest / 'version.json'}")
PY

  echo ""
  echo "=== Sync Complete ==="
  echo "Total:     $(du -sh "$DEST" | cut -f1)"
  echo "Timestamp: $(date -Iseconds)"
fi
