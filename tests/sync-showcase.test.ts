import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

/* ─── Helpers ───────────────────────────────────────────────────── */

const REPO_ROOT = join(import.meta.dir, "..");
const SYNC_SCRIPT = join(REPO_ROOT, "scripts", "sync-showcase.sh");
/**
 * Where the tests sync to, passed to the script as SYNC_SHOWCASE_DEST. Never
 * public/web/: these tests clear the destination before every case, and doing
 * that to the checked-in bundle meant an interrupted run could deploy fakes.
 */
const TEST_DEST = join(import.meta.dir, "__fixtures__", "web-dest");

/** Temporary fake dist directory for tests. */
const FAKE_DIST = join(import.meta.dir, "__fixtures__", "fake-dist");

function stepLog(test: string, detail: string) {
  console.log(`[sync-test] ${test}: ${detail}`);
}

function runSync(...args: string[]) {
  const result = spawnSync("bash", [SYNC_SCRIPT, ...args], {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    timeout: 30_000,
    env: { ...process.env, PATH: process.env.PATH, SYNC_SHOWCASE_DEST: TEST_DEST },
  });
  return {
    exitCode: result.status ?? -1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    signal: result.signal,
  };
}

/** Create a minimal fake dist/ that passes validation. */
function createFakeDist(dir: string, opts?: { omit?: string[] }) {
  const omit = new Set(opts?.omit ?? []);

  mkdirSync(dir, { recursive: true });

  if (!omit.has("index.html")) {
    writeFileSync(
      join(dir, "index.html"),
      `<html><head></head><body>
<div id="error-overlay"></div>
<div id="status"></div>
<script type="module">console.log("demo");</script>
</body></html>`,
    );
  }

  if (!omit.has("pkg")) {
    const pkg = join(dir, "pkg");
    mkdirSync(pkg, { recursive: true });
    writeFileSync(join(pkg, "FrankenTerm.js"), "// wasm loader");
    writeFileSync(join(pkg, "FrankenTerm_bg.wasm"), "fake-wasm-bytes");
    // build-wasm.sh emits this alongside the packages, and the sync validates
    // it: both the demo page and the React loader key their cache-busting and
    // integrity checks off these digests.
    if (!omit.has("pkg/manifest.json")) {
      writeFileSync(
        join(pkg, "manifest.json"),
        JSON.stringify({
          schema: "ftui-browser-package-v1",
          toolchain: "nightly-0000-00-00",
          renderer: { revision: "0".repeat(40) },
          source_inputs_sha256: "0".repeat(64),
          runner_lock_sha256: "0".repeat(64),
          files: { "FrankenTerm.js": "0".repeat(64) },
        }),
      );
    }
  }

  if (!omit.has("fonts")) {
    const fonts = join(dir, "fonts");
    mkdirSync(fonts, { recursive: true });
    writeFileSync(join(fonts, "test.woff2"), "fake-font-data");
  }

  if (!omit.has("assets")) {
    const assets = join(dir, "assets");
    mkdirSync(assets, { recursive: true });
    writeFileSync(join(assets, "test.txt"), "hello world");
  }
}

function cleanupFakeDist() {
  if (existsSync(FAKE_DIST)) {
    rmSync(FAKE_DIST, { recursive: true, force: true });
  }
}

function cleanupTestDest() {
  if (existsSync(TEST_DEST)) {
    rmSync(TEST_DEST, { recursive: true, force: true });
  }
}

function countFiles(dir: string): number {
  if (!existsSync(dir)) return 0;
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFiles(join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

/* ─── Test suite ────────────────────────────────────────────────── */

describe("sync-showcase.sh", () => {
  afterAll(() => {
    cleanupTestDest();
    cleanupFakeDist();
  });

  beforeEach(() => {
    cleanupFakeDist();
    cleanupTestDest();
  });

  /* (1) Happy path */
  test("happy path: syncs all files from valid dist", () => {
    createFakeDist(FAKE_DIST);
    const { exitCode, stdout } = runSync(FAKE_DIST);

    stepLog("happy-path", `exit=${exitCode}, stdout_len=${stdout.length}`);

    expect(exitCode).toBe(0);
    expect(existsSync(join(TEST_DEST, "index.html"))).toBe(true);
    expect(existsSync(join(TEST_DEST, "pkg", "FrankenTerm.js"))).toBe(true);
    expect(existsSync(join(TEST_DEST, "pkg", "FrankenTerm_bg.wasm"))).toBe(true);
    expect(existsSync(join(TEST_DEST, "fonts", "test.woff2"))).toBe(true);
    expect(existsSync(join(TEST_DEST, "assets", "test.txt"))).toBe(true);

    // version.json should be generated (bd-ty6.8 is implemented)
    expect(existsSync(join(TEST_DEST, "version.json"))).toBe(true);
    const manifest = JSON.parse(readFileSync(join(TEST_DEST, "version.json"), "utf-8"));
    expect(manifest).toHaveProperty("synced_at");
    expect(manifest).toHaveProperty("file_count");
    expect(manifest.file_count).toBeGreaterThan(0);

    stepLog("happy-path", "PASS");
  });

  /* (2) Missing source */
  test("missing source: fails with meaningful error", () => {
    const { exitCode, stderr } = runSync("/nonexistent/path/dist");

    stepLog("missing-source", `exit=${exitCode}, stderr=${stderr.substring(0, 200)}`);

    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("ERROR");
    expect(stderr).toContain("not found");

    stepLog("missing-source", "PASS");
  });

  /* (3) Missing files */
  test("missing expected files: fails validation when pkg/ is missing", () => {
    createFakeDist(FAKE_DIST, { omit: ["pkg"] });
    const { exitCode, stderr } = runSync(FAKE_DIST);

    stepLog("missing-files", `exit=${exitCode}, stderr=${stderr.substring(0, 200)}`);

    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("ERROR");
    expect(stderr).toContain("pkg");

    stepLog("missing-files", "PASS");
  });

  test("missing expected files: fails when pkg/manifest.json is missing", () => {
    createFakeDist(FAKE_DIST, { omit: ["pkg/manifest.json"] });
    const { exitCode, stderr } = runSync(FAKE_DIST);

    stepLog("missing-manifest", `exit=${exitCode}, stderr=${stderr.substring(0, 200)}`);

    // Without the manifest the deployed page cannot verify or cache-bust its
    // packages, so an incomplete bundle must never reach public/web/.
    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("ERROR");
    expect(stderr).toContain("manifest.json");

    stepLog("missing-manifest", "PASS");
  });

  test("missing expected files: fails when index.html is missing", () => {
    createFakeDist(FAKE_DIST, { omit: ["index.html"] });
    const { exitCode, stderr } = runSync(FAKE_DIST);

    stepLog("missing-index", `exit=${exitCode}, stderr=${stderr.substring(0, 200)}`);

    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("ERROR");
    expect(stderr).toContain("index.html");

    stepLog("missing-index", "PASS");
  });

  /* (4) Dry run */
  test("dry run: no files copied", () => {
    createFakeDist(FAKE_DIST);
    const { exitCode, stdout } = runSync(FAKE_DIST, "--dry-run");

    stepLog("dry-run", `exit=${exitCode}, stdout_len=${stdout.length}`);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("DRY RUN");

    // Destination should not have the synced files (may not exist or be empty)
    const fileCount = countFiles(TEST_DEST);
    expect(fileCount).toBe(0);

    stepLog("dry-run", "PASS");
  });

  /* (5) Custom source path */
  test("custom source path: uses explicit path argument", () => {
    const customDist = join(import.meta.dir, "__fixtures__", "custom-dist");
    if (existsSync(customDist)) rmSync(customDist, { recursive: true, force: true });
    createFakeDist(customDist);

    const { exitCode, stdout } = runSync(customDist);

    stepLog("custom-path", `exit=${exitCode}`);

    expect(exitCode).toBe(0);
    expect(stdout).toContain(customDist);
    expect(existsSync(join(TEST_DEST, "index.html"))).toBe(true);

    // Cleanup custom dist
    rmSync(customDist, { recursive: true, force: true });

    stepLog("custom-path", "PASS");
  });

  /* (6) Idempotency */
  test("idempotency: second run produces identical results", () => {
    createFakeDist(FAKE_DIST);

    const run1 = runSync(FAKE_DIST);
    expect(run1.exitCode).toBe(0);

    // Read version.json from first run
    const manifest1 = readFileSync(join(TEST_DEST, "version.json"), "utf-8");

    // Wait a moment so timestamps differ
    Bun.sleepSync(1100);

    const run2 = runSync(FAKE_DIST);
    expect(run2.exitCode).toBe(0);

    // Files should still all be present
    expect(existsSync(join(TEST_DEST, "index.html"))).toBe(true);
    expect(existsSync(join(TEST_DEST, "pkg", "FrankenTerm.js"))).toBe(true);

    // version.json should be regenerated (timestamps will differ)
    const manifest2 = readFileSync(join(TEST_DEST, "version.json"), "utf-8");
    const m1 = JSON.parse(manifest1);
    const m2 = JSON.parse(manifest2);
    expect(m2.file_count).toBe(m1.file_count);

    stepLog("idempotency", "PASS");
  });

  /* (7) Delta sync */
  test("delta sync: only changed files are updated", () => {
    createFakeDist(FAKE_DIST);
    runSync(FAKE_DIST);

    // Record modification time of an unchanged file
    const unchangedFile = join(TEST_DEST, "fonts", "test.woff2");
    const _mtimeBefore = statSync(unchangedFile).mtimeMs;

    // Wait then modify one file
    Bun.sleepSync(1100);
    writeFileSync(join(FAKE_DIST, "pkg", "FrankenTerm.js"), "// updated wasm loader v2");

    const { exitCode } = runSync(FAKE_DIST);
    expect(exitCode).toBe(0);

    // Changed file should have new content
    const updatedContent = readFileSync(join(TEST_DEST, "pkg", "FrankenTerm.js"), "utf-8");
    expect(updatedContent).toContain("v2");

    stepLog("delta-sync", "PASS");
  });

  /* (8) Stale artifacts are reported, never deleted */
  test("stale artifacts: files dropped from source are kept and reported", () => {
    createFakeDist(FAKE_DIST);
    runSync(FAKE_DIST);

    // Verify file exists
    expect(existsSync(join(TEST_DEST, "assets", "test.txt"))).toBe(true);

    // Remove the file from source
    rmSync(join(FAKE_DIST, "assets", "test.txt"));

    const { exitCode, stdout } = runSync(FAKE_DIST);
    expect(exitCode).toBe(0);

    // The sync deliberately does not pass rsync --delete: removing a deployed
    // artifact is a human decision, so it is surfaced instead of performed.
    expect(existsSync(join(TEST_DEST, "assets", "test.txt"))).toBe(true);
    expect(stdout).toContain("not produced by the build");
    expect(stdout).toContain("assets/test.txt");

    stepLog("stale-artifacts", "PASS");
  });

  /* (9) Permissions */
  test("permissions: synced files are readable", () => {
    createFakeDist(FAKE_DIST);
    runSync(FAKE_DIST);

    const checkFiles = [
      join(TEST_DEST, "index.html"),
      join(TEST_DEST, "pkg", "FrankenTerm.js"),
      join(TEST_DEST, "fonts", "test.woff2"),
    ];

    for (const file of checkFiles) {
      expect(existsSync(file)).toBe(true);
      const stat = statSync(file);
      // Owner read bit should be set (mode & 0o400)
      expect(stat.mode & 0o400).toBe(0o400);
      stepLog("permissions", `${file}: mode=${stat.mode.toString(8)}`);
    }

    stepLog("permissions", "PASS");
  });
});
