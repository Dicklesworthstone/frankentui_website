import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// update-web-demo.sh commits and pushes, so it is tested in a sandbox and never
// in this repository: a bare "origin", a website clone holding copies of the
// real scripts, a stand-in frankentui repo, and a bundle whose manifest hashes
// are real. The previous version of this suite ran against the real public/web/
// and the real git index, and only when /dp/frankentui/dist existed, which
// build-wasm.sh stopped producing - so on every machine it silently passed
// without running a single assertion.

const REPO_ROOT = join(import.meta.dir, "..");
const SANDBOX = mkdtempSync(join(tmpdir(), "update-web-demo-test-"));
const REMOTE = join(SANDBOX, "origin.git");
const SITE_REPO = join(SANDBOX, "website");
const FTUI = join(SANDBOX, "frankentui");
const BUNDLE = join(SANDBOX, "build", "site");

// Isolate from the user's git config: global hooks or signing would make these
// commits depend on the machine.
const GIT_ENV = {
  ...process.env,
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_AUTHOR_NAME: "test",
  GIT_AUTHOR_EMAIL: "test@example.com",
  GIT_COMMITTER_NAME: "test",
  GIT_COMMITTER_EMAIL: "test@example.com",
};
delete (GIT_ENV as Record<string, string | undefined>).FRANKENTUI_GIT_SHA;

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync("git", args, { cwd, encoding: "utf-8", env: GIT_ENV });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
}

function runUpdate(args: string[], env: Record<string, string> = {}) {
  const r = spawnSync("bash", [join(SITE_REPO, "scripts", "update-web-demo.sh"), ...args], {
    cwd: SITE_REPO,
    encoding: "utf-8",
    timeout: 60_000,
    env: { ...GIT_ENV, FRANKENTUI_ROOT: FTUI, ...env },
  });
  return { exitCode: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/** A bundle shaped like build-wasm.sh's site/, with a truthful manifest. */
function writeBundle(dir: string, glue = "export default function init() {}\n") {
  rmSync(dir, { recursive: true, force: true });
  for (const sub of ["pkg", "fonts", "assets"]) mkdirSync(join(dir, sub), { recursive: true });
  writeFileSync(
    join(dir, "index.html"),
    '<html><head></head><body><script type="module" src="./pkg/FrankenTerm.js"></script></body></html>\n',
  );
  const pkg: Record<string, string> = {
    "FrankenTerm.js": glue,
    "FrankenTerm_bg.wasm": "wasm-a",
    "ftui_showcase_wasm.js": glue,
    "ftui_showcase_wasm_bg.wasm": "wasm-b",
  };
  for (const [name, body] of Object.entries(pkg)) writeFileSync(join(dir, "pkg", name), body);
  writeFileSync(
    join(dir, "pkg", "manifest.json"),
    JSON.stringify({
      schema: "ftui-browser-package-v1",
      toolchain: "nightly-0000-00-00",
      renderer: { revision: "0".repeat(40) },
      source_inputs_sha256: "0".repeat(64),
      runner_lock_sha256: "0".repeat(64),
      files: Object.fromEntries(Object.entries(pkg).map(([n, b]) => [n, sha256(b)])),
    }),
  );
  writeFileSync(join(dir, "fonts", "font.woff2"), "font");
  writeFileSync(join(dir, "assets", "a.txt"), "asset");
}

function webFile(...parts: string[]) {
  return join(SITE_REPO, "public", "web", ...parts);
}

function versionSha(): string {
  return JSON.parse(readFileSync(webFile("version.json"), "utf-8")).frankentui_git_sha;
}

let ftuiHead = "";

beforeEach(() => {
  rmSync(REMOTE, { recursive: true, force: true });
  rmSync(SITE_REPO, { recursive: true, force: true });
  rmSync(FTUI, { recursive: true, force: true });

  mkdirSync(FTUI, { recursive: true });
  git(FTUI, "init", "-q", "-b", "main");
  writeFileSync(join(FTUI, "build-wasm.sh"), "exit 1\n");
  git(FTUI, "add", ".");
  git(FTUI, "commit", "-q", "-m", "frankentui");
  ftuiHead = git(FTUI, "rev-parse", "HEAD");

  git(SANDBOX, "init", "-q", "--bare", "-b", "main", REMOTE);
  mkdirSync(join(SITE_REPO, "scripts"), { recursive: true });
  git(SITE_REPO, "init", "-q", "-b", "main");
  for (const s of ["update-web-demo.sh", "sync-showcase.sh"]) {
    copyFileSync(join(REPO_ROOT, "scripts", s), join(SITE_REPO, "scripts", s));
  }
  writeFileSync(join(SITE_REPO, "README.md"), "site\n");
  git(SITE_REPO, "add", ".");
  git(SITE_REPO, "commit", "-q", "-m", "init");
  git(SITE_REPO, "remote", "add", "origin", REMOTE);
  git(SITE_REPO, "push", "-q", "origin", "main", "main:master");

  writeBundle(BUNDLE);
});

afterAll(() => {
  rmSync(SANDBOX, { recursive: true, force: true });
});

describe("update-web-demo.sh", () => {
  test("dry run changes nothing and names both branches", () => {
    const r = runUpdate(["--skip-build", `--site=${BUNDLE}`, "--dry-run"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("Would push to origin/main and origin/master");
    expect(existsSync(webFile("index.html"))).toBe(false);
    expect(git(SITE_REPO, "rev-list", "--count", "HEAD")).toBe("1");
  });

  test("commits only public/web/, leaving other staged work staged", () => {
    // Another agent's staged change, sharing the index.
    writeFileSync(join(SITE_REPO, "other.txt"), "someone else's work\n");
    git(SITE_REPO, "add", "other.txt");

    const r = runUpdate(["--skip-build", `--site=${BUNDLE}`, "--no-push"]);
    expect(r.exitCode).toBe(0);

    const committed = git(SITE_REPO, "show", "--name-only", "--format=", "HEAD").split("\n");
    expect(committed.every((p) => p.startsWith("public/web/"))).toBe(true);
    expect(committed).toContain("public/web/pkg/ftui_showcase_wasm.js");
    expect(git(SITE_REPO, "diff", "--cached", "--name-only")).toBe("other.txt");
    expect(git(SITE_REPO, "log", "-1", "--format=%s")).toBe(
      `chore(web): sync WASM showcase [${ftuiHead.slice(0, 8)}]`,
    );
    expect(r.stdout).toContain("Push (SKIPPED");
  });

  test("records the frankentui commit, and an explicit FRANKENTUI_GIT_SHA wins", () => {
    expect(runUpdate(["--skip-build", `--site=${BUNDLE}`, "--no-push"]).exitCode).toBe(0);
    expect(versionSha()).toBe(ftuiHead);

    writeBundle(BUNDLE, "export default function init() { return 2; }\n");
    const built = "a".repeat(40);
    const r = runUpdate(["--skip-build", `--site=${BUNDLE}`, "--no-push"], {
      FRANKENTUI_GIT_SHA: built,
    });
    expect(r.exitCode).toBe(0);
    expect(versionSha()).toBe(built);
    expect(git(SITE_REPO, "log", "-1", "--format=%s")).toContain("[aaaaaaaa]");
  });

  test("pushes main and keeps master identical to it", () => {
    const r = runUpdate(["--skip-build", `--site=${BUNDLE}`]);
    expect(r.exitCode).toBe(0);
    const head = git(SITE_REPO, "rev-parse", "HEAD");
    expect(git(REMOTE, "rev-parse", "main")).toBe(head);
    expect(git(REMOTE, "rev-parse", "master")).toBe(head);
  });

  test("refuses a bundle whose packages disagree with the manifest", () => {
    // What 29c653c did to production: reformatted glue, stale manifest.
    writeFileSync(join(BUNDLE, "pkg", "FrankenTerm.js"), "export default function init() {\n}\n");
    const r = runUpdate(["--skip-build", `--site=${BUNDLE}`]);
    expect(r.exitCode).not.toBe(0);
    expect(r.stderr).toContain("do not match pkg/manifest.json");
    expect(r.stderr).toContain("FrankenTerm.js");
    expect(existsSync(webFile("index.html"))).toBe(false);
    expect(git(REMOTE, "rev-parse", "main")).toBe(git(SITE_REPO, "rev-parse", "HEAD"));
    expect(git(SITE_REPO, "rev-list", "--count", "HEAD")).toBe("1");
  });

  test("refuses to deploy from a branch other than main", () => {
    git(SITE_REPO, "checkout", "-q", "-b", "feature");
    const r = runUpdate(["--skip-build", `--site=${BUNDLE}`]);
    expect(r.exitCode).not.toBe(0);
    expect(r.stderr).toContain("deploys push main");
    expect(git(SITE_REPO, "rev-list", "--count", "HEAD")).toBe("1");
  });

  test("--skip-build without --site is an error", () => {
    const r = runUpdate(["--skip-build", "--no-push"]);
    expect(r.exitCode).not.toBe(0);
    expect(r.stderr).toContain("--skip-build requires --site=");
  });
});
