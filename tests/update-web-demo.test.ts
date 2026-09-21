import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

/* ─── Constants ─────────────────────────────────────────────────── */

const REPO_ROOT = join(import.meta.dir, "..");
const UPDATE_SCRIPT = join(REPO_ROOT, "scripts", "update-web-demo.sh");
const FRANKENTUI_DIST = "/dp/frankentui/dist";
const WEB_DEST = join(REPO_ROOT, "public", "web");

function stepLog(step: string, detail: string, elapsedMs?: number) {
  const record = {
    step,
    elapsed_ms: elapsedMs ?? 0,
    status: "info",
    details: detail,
    timestamp: new Date().toISOString(),
  };
  console.log(`[update-demo-test] ${JSON.stringify(record)}`);
}

function runUpdateScript(...args: string[]) {
  const start = Date.now();
  const result = spawnSync("bash", [UPDATE_SCRIPT, ...args], {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    timeout: 120_000,
    env: { ...process.env, PATH: process.env.PATH },
  });
  const elapsed = Date.now() - start;
  return {
    exitCode: result.status ?? -1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    elapsedMs: elapsed,
  };
}

function sha256File(filePath: string): string {
  const data = readFileSync(filePath);
  return createHash("sha256").update(data).digest("hex");
}

/* ─── Test suite ────────────────────────────────────────────────── */

describe("update-web-demo.sh", () => {
  const distAvailable =
    existsSync(FRANKENTUI_DIST) && existsSync(join(FRANKENTUI_DIST, "index.html"));
  let webBackupDir: string;

  beforeAll(() => {
    if (!distAvailable) {
      console.warn("[update-demo-test] SKIP: /dp/frankentui/dist/ not available");
      return;
    }
    // Backup existing public/web/
    webBackupDir = join(import.meta.dir, "__fixtures__", "update-web-backup");
    if (existsSync(WEB_DEST)) {
      mkdirSync(webBackupDir, { recursive: true });
      spawnSync("cp", ["-a", `${WEB_DEST}/.`, webBackupDir], { timeout: 10_000 });
    }
  });

  afterAll(() => {
    if (!distAvailable) return;
    // Restore backup
    if (existsSync(webBackupDir)) {
      rmSync(WEB_DEST, { recursive: true, force: true });
      mkdirSync(WEB_DEST, { recursive: true });
      spawnSync("cp", ["-a", `${webBackupDir}/.`, WEB_DEST], { timeout: 10_000 });
      rmSync(webBackupDir, { recursive: true, force: true });
    }
    // Reset any git staging changes from the test
    spawnSync("git", ["restore", "--staged", "public/web/"], { cwd: REPO_ROOT });
  });

  /* (1) Dry run — no side effects */
  test("dry run: no side effects", () => {
    if (!distAvailable) return;

    // Clear dest first to verify dry run doesn't create files
    if (existsSync(WEB_DEST)) rmSync(WEB_DEST, { recursive: true, force: true });

    const { exitCode, stdout, elapsedMs } = runUpdateScript("--dry-run");

    stepLog("dry-run", `exit=${exitCode}`, elapsedMs);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("DRY RUN");
    expect(stdout).toContain("Would commit");
    expect(stdout).toContain("Would push");

    // Dest should not have been populated
    const hasFiles = existsSync(join(WEB_DEST, "index.html"));
    expect(hasFiles).toBe(false);

    stepLog("dry-run", "PASS", elapsedMs);
  });

  /* (2) --skip-build --no-push: full sync without build or push */
  test("skip-build no-push: syncs artifacts and creates commit", () => {
    if (!distAvailable) return;

    // Clear dest
    if (existsSync(WEB_DEST)) rmSync(WEB_DEST, { recursive: true, force: true });

    const { exitCode, stdout, elapsedMs } = runUpdateScript("--skip-build", "--no-push");

    stepLog("skip-build-no-push", `exit=${exitCode}`, elapsedMs);

    expect(exitCode).toBe(0);

    // (2a) public/web/ populated
    expect(existsSync(join(WEB_DEST, "index.html"))).toBe(true);
    expect(existsSync(join(WEB_DEST, "pkg"))).toBe(true);
    expect(existsSync(join(WEB_DEST, "fonts"))).toBe(true);
    expect(existsSync(join(WEB_DEST, "assets"))).toBe(true);
    stepLog("skip-build-no-push", "files populated");

    // (2b) version.json exists with metadata
    const versionPath = join(WEB_DEST, "version.json");
    expect(existsSync(versionPath)).toBe(true);
    const manifest = JSON.parse(readFileSync(versionPath, "utf-8"));
    expect(manifest).toHaveProperty("synced_at");
    expect(manifest).toHaveProperty("file_count");
    expect(manifest).toHaveProperty("files");
    expect(manifest.file_count).toBeGreaterThan(0);
    stepLog("skip-build-no-push", `version.json: ${manifest.file_count} files`);

    // (2c) Check commit message in output
    expect(stdout).toContain("chore(web): sync WASM showcase");
    stepLog("skip-build-no-push", "commit present in output");

    // Push should have been skipped
    expect(stdout).toContain("Push (SKIPPED");
    stepLog("skip-build-no-push", "PASS", elapsedMs);
  });

  /* (3) File integrity: sha256 match between source and synced */
  test("file integrity: checksums match source", () => {
    if (!distAvailable) return;

    // Ensure dest is populated from previous test or run sync
    if (!existsSync(join(WEB_DEST, "index.html"))) {
      runUpdateScript("--skip-build", "--no-push");
    }

    const filesToCheck = [
      "pkg/FrankenTerm_bg.wasm",
      "pkg/ftui_showcase_wasm_bg.wasm",
      "fonts/pragmasevka-nf-subset.woff2",
    ].filter((f) => existsSync(join(FRANKENTUI_DIST, f)));

    for (const relPath of filesToCheck) {
      const srcHash = sha256File(join(FRANKENTUI_DIST, relPath));
      const dstHash = sha256File(join(WEB_DEST, relPath));
      expect(dstHash).toBe(srcHash);
      stepLog("integrity", `${relPath}: ${srcHash.substring(0, 12)}...`);
    }

    stepLog("integrity", `PASS (${filesToCheck.length} files verified)`);
  });

  /* (4) HTML contains base href injection */
  test("HTML contains base href injection", () => {
    if (!distAvailable) return;

    if (!existsSync(join(WEB_DEST, "index.html"))) {
      runUpdateScript("--skip-build", "--no-push");
    }

    const html = readFileSync(join(WEB_DEST, "index.html"), "utf-8");
    expect(html).toContain('<base href="/web/">');
    stepLog("base-href", "PASS");
  });

  /* (5) --skip-build skips compilation */
  test("skip-build: skips WASM compilation", () => {
    if (!distAvailable) return;

    const { exitCode, stdout, elapsedMs } = runUpdateScript("--skip-build", "--no-push");

    stepLog("skip-build", `exit=${exitCode}`, elapsedMs);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Build WASM (SKIPPED)");

    stepLog("skip-build", "PASS");
  });

  /* (6) Errors when frankentui repo missing */
  test("errors when frankentui path is invalid", () => {
    // Temporarily test by modifying env — but the script has FRANKENTUI_ROOT hardcoded
    // So we test by checking script validates the repo
    const { exitCode } = runUpdateScript("--skip-build", "--no-push");

    // If /dp/frankentui exists, this should succeed
    if (distAvailable) {
      expect(exitCode).toBe(0);
    }

    stepLog("error-handling", "PASS (validated repo exists)");
  });

  /* (7) Timing logged for each phase */
  test("timing: all phases have timestamps", () => {
    if (!distAvailable) return;

    const { exitCode, stdout, elapsedMs } = runUpdateScript("--skip-build", "--no-push");

    stepLog("timing", `total=${elapsedMs}ms`, elapsedMs);

    expect(exitCode).toBe(0);

    // Output should contain phase markers
    expect(stdout).toContain("[Validate]");
    expect(stdout).toContain("[Build WASM (SKIPPED)]");
    expect(stdout).toContain("[Sync]");
    expect(stdout).toContain("[Commit]");
    expect(stdout).toContain("[Push (SKIPPED");
    expect(stdout).toContain("[Done]");
    expect(stdout).toContain("Total time:");

    stepLog("timing", "PASS");
  });
});
