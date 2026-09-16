#!/usr/bin/env bash
#
# Install Playwright's browsers without using Playwright's extractor.
#
# Why this exists: on some machines `playwright install` downloads the archive
# in full and then hangs partway through unpacking it — an open write handle,
# no bytes landing, ~0% CPU, an idle event loop. It leaves behind a browser
# directory holding two or three files, which looks installed until
# `browserType.launch` reports the executable is missing. The stall point moves
# between runs (two entries one time, thirty-nine the next), and reproduces
# when playwright-core's own bundled `extract()` is called directly on an
# already-downloaded zip, so it is the extractor and not the download, the
# network, the __dirlock, or patience.
#
# Everything else works: curl fetches the same archives in seconds, and macOS's
# `ditto` unpacks one in under a second. So: ask Playwright what it wants and
# where it wants it, then do those two steps ourselves and write the marker
# files a finished install has.
#
# Usage:  bash scripts/install-playwright-browsers.sh [browser ...]
#         (default: chromium)
#
# Safe to re-run: a browser that already has INSTALLATION_COMPLETE is skipped.
# Delete that marker to force a reinstall.

set -euo pipefail

browsers=("$@")
if [ ${#browsers[@]} -eq 0 ]; then
  browsers=(chromium)
fi

if [ "$(uname -s)" != "Darwin" ]; then
  echo "This script uses ditto and is macOS-only." >&2
  echo "On other platforms run: npx playwright install ${browsers[*]}" >&2
  exit 1
fi

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

echo "Asking Playwright what it needs..."
plan="$workdir/plan.txt"
npx --yes playwright install --dry-run "${browsers[@]}" > "$plan"

# Each block is: a title line, "Install location:", "Download url:", and
# sometimes numbered fallbacks. Pair the location with the first url after it.
location=""
installed=0
skipped=0

while IFS= read -r line; do
  case "$line" in
    *"Install location:"*)
      location="${line#*Install location:}"
      location="$(echo "$location" | xargs)"
      ;;
    *"Download url:"*)
      url="${line#*Download url:}"
      url="$(echo "$url" | xargs)"
      [ -n "$location" ] || continue

      name="$(basename "$location")"
      if [ -f "$location/INSTALLATION_COMPLETE" ]; then
        echo "  $name: already installed"
        skipped=$((skipped + 1))
        location=""
        continue
      fi

      echo "  $name: downloading"
      zip="$workdir/$name.zip"
      curl -fsSL -o "$zip" "$url"

      echo "  $name: unpacking $(du -h "$zip" | cut -f1)"
      mkdir -p "$location"
      ditto -x -k "$zip" "$location"
      touch "$location/INSTALLATION_COMPLETE" "$location/DEPENDENCIES_VALIDATED"
      rm -f "$zip"

      installed=$((installed + 1))
      location=""
      ;;
  esac
done < "$plan"

echo
echo "Installed $installed, skipped $skipped."
echo "Verify with: npx playwright install --dry-run ${browsers[*]}"
