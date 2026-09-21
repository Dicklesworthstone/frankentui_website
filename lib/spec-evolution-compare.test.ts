import { expect, test } from "@playwright/test";

import {
  buildCorpusText,
  computeEditDistanceLines,
  computeFileChangeSummary,
  computeTextStats,
  myersDiffTextLines,
  type SpecFile,
} from "./spec-evolution-compare";

test.describe("spec-evolution-compare (unit)", () => {
  test("computeFileChangeSummary: added/removed/modified/unchanged", () => {
    const a: SpecFile[] = [
      { path: "a.md", content: "A" },
      { path: "b.md", content: "B" },
    ];
    const b: SpecFile[] = [
      { path: "b.md", content: "B2" },
      { path: "c.md", content: "C" },
    ];

    expect(computeFileChangeSummary(a, b)).toEqual({
      added: ["c.md"],
      removed: ["a.md"],
      modified: ["b.md"],
      unchanged: [],
    });
  });

  test("buildCorpusText: deterministic ordering for __ALL__", () => {
    const files: SpecFile[] = [
      { path: "b.md", content: "B" },
      { path: "a.md", content: "A" },
    ];

    const out = buildCorpusText(files, "__ALL__");
    expect(out.startsWith("## a.md")).toBe(true);
    expect(out.includes("\n\n---\n\n## b.md")).toBe(true);
  });

  test("computeTextStats: lines + bytes", () => {
    const text = "a\nb\n";
    expect(computeTextStats(text)).toEqual({ lines: 3, bytes: 4 });
    expect(computeTextStats("")).toEqual({ lines: 0, bytes: 0 });
  });

  test("computeEditDistanceLines: basic substitution", () => {
    const prev = "a\nb\nc";
    const next = "a\nb\nx";
    expect(computeEditDistanceLines(prev, next, 50)).toBe(1);
  });

  test("myersDiffTextLines: roundtrips by applying ops", () => {
    const a = "a\nb\nc";
    const b = "a\nb\nx";
    const ops = myersDiffTextLines(a, b);

    const rebuilt = ops
      .filter((op) => op.kind !== "del")
      .map((op) => op.text)
      .join("\n");

    expect(rebuilt).toBe(b);
    expect(ops.some((op) => op.kind === "add")).toBe(true);
    expect(ops.some((op) => op.kind === "del")).toBe(true);
  });
});
