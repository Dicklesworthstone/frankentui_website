import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// /web fetches every package with a SHA-256 integrity check against
// pkg/manifest.json, so a file that differs from its manifest entry by a
// single byte fails to load and the page shows "Failed to load the browser
// packages ... Error: Failed to fetch". That is how 29c653c broke the site: a
// formatter rewrote the wasm-bindgen glue and left the manifest alone. The
// Playwright suite catches it too, but needs a build, a server and browsers;
// this runs in milliseconds, so there is no reason to push without it.
//
// The files under public/web/pkg/ are generated. Change them only by
// rebuilding with frankentui's build-wasm.sh and running sync-showcase.sh.

const WEB = join(import.meta.dir, "..", "public", "web");
const PKG = join(WEB, "pkg");

const manifest = JSON.parse(readFileSync(join(PKG, "manifest.json"), "utf-8")) as {
  schema: string;
  renderer: { revision: string };
  files: Record<string, string>;
};

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

describe("public/web/pkg matches its manifest", () => {
  test("the manifest uses the schema the page accepts", () => {
    expect(manifest.schema).toBe("ftui-browser-package-v1");
  });

  test("the manifest lists both packages, glue and wasm", () => {
    expect(Object.keys(manifest.files).sort()).toEqual([
      "FrankenTerm.js",
      "FrankenTerm_bg.wasm",
      "ftui_showcase_wasm.js",
      "ftui_showcase_wasm_bg.wasm",
    ]);
  });

  for (const [file, expected] of Object.entries(manifest.files)) {
    test(`${file} has the SHA-256 the manifest records`, () => {
      expect(sha256(join(PKG, file))).toBe(expected);
    });
  }

  test("the page pins the renderer revision the manifest was built from", () => {
    // index.html refuses a manifest whose renderer.revision differs from the
    // one it hard-codes, which fails with the same message as a bad hash.
    const html = readFileSync(join(WEB, "index.html"), "utf-8");
    expect(html).toContain(`manifest.renderer?.revision !== "${manifest.renderer.revision}"`);
  });
});
