import { describe, expect, test } from "bun:test";
import {
  buildCorpusText,
  computeEditDistanceLines,
  computeFileChangeSummary,
  computePerFileContribution,
  computeTextStats,
  indexSpecFiles,
  myersDiffLines,
  myersDiffTextLines,
  type SpecFile,
} from "../lib/spec-evolution-compare";

/* ------------------------------------------------------------------ */
/*  indexSpecFiles                                                     */
/* ------------------------------------------------------------------ */
describe("indexSpecFiles", () => {
  test("builds a Map keyed by path", () => {
    const files: SpecFile[] = [
      { path: "a.md", content: "hello" },
      { path: "b.md", content: "world" },
    ];
    const map = indexSpecFiles(files);
    expect(map.get("a.md")).toBe("hello");
    expect(map.get("b.md")).toBe("world");
    expect(map.size).toBe(2);
  });

  test("handles empty input", () => {
    expect(indexSpecFiles([]).size).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/*  computeFileChangeSummary                                          */
/* ------------------------------------------------------------------ */
describe("computeFileChangeSummary", () => {
  test("detects added files", () => {
    const a: SpecFile[] = [];
    const b: SpecFile[] = [{ path: "new.md", content: "stuff" }];
    const s = computeFileChangeSummary(a, b);
    expect(s.added).toEqual(["new.md"]);
    expect(s.removed).toEqual([]);
    expect(s.modified).toEqual([]);
    expect(s.unchanged).toEqual([]);
  });

  test("detects removed files", () => {
    const a: SpecFile[] = [{ path: "old.md", content: "stuff" }];
    const b: SpecFile[] = [];
    const s = computeFileChangeSummary(a, b);
    expect(s.removed).toEqual(["old.md"]);
    expect(s.added).toEqual([]);
  });

  test("detects modified files", () => {
    const a: SpecFile[] = [{ path: "x.md", content: "v1" }];
    const b: SpecFile[] = [{ path: "x.md", content: "v2" }];
    const s = computeFileChangeSummary(a, b);
    expect(s.modified).toEqual(["x.md"]);
    expect(s.unchanged).toEqual([]);
  });

  test("detects unchanged files", () => {
    const a: SpecFile[] = [{ path: "x.md", content: "same" }];
    const b: SpecFile[] = [{ path: "x.md", content: "same" }];
    const s = computeFileChangeSummary(a, b);
    expect(s.unchanged).toEqual(["x.md"]);
    expect(s.modified).toEqual([]);
  });

  test("handles mixed changes", () => {
    const a: SpecFile[] = [
      { path: "kept.md", content: "same" },
      { path: "changed.md", content: "old" },
      { path: "gone.md", content: "bye" },
    ];
    const b: SpecFile[] = [
      { path: "kept.md", content: "same" },
      { path: "changed.md", content: "new" },
      { path: "fresh.md", content: "hi" },
    ];
    const s = computeFileChangeSummary(a, b);
    expect(s.added).toEqual(["fresh.md"]);
    expect(s.removed).toEqual(["gone.md"]);
    expect(s.modified).toEqual(["changed.md"]);
    expect(s.unchanged).toEqual(["kept.md"]);
  });

  test("results are sorted alphabetically", () => {
    const a: SpecFile[] = [
      { path: "z.md", content: "x" },
      { path: "a.md", content: "x" },
    ];
    const b: SpecFile[] = [
      { path: "z.md", content: "y" },
      { path: "a.md", content: "y" },
    ];
    const s = computeFileChangeSummary(a, b);
    expect(s.modified).toEqual(["a.md", "z.md"]);
  });

  test("is deterministic across repeated calls", () => {
    const a: SpecFile[] = [
      { path: "b.md", content: "1" },
      { path: "a.md", content: "2" },
    ];
    const b: SpecFile[] = [
      { path: "a.md", content: "3" },
      { path: "c.md", content: "4" },
    ];
    const r1 = computeFileChangeSummary(a, b);
    const r2 = computeFileChangeSummary(a, b);
    expect(r1).toEqual(r2);
  });
});

/* ------------------------------------------------------------------ */
/*  buildCorpusText                                                   */
/* ------------------------------------------------------------------ */
describe("buildCorpusText", () => {
  const files: SpecFile[] = [
    { path: "b.md", content: "bravo" },
    { path: "a.md", content: "alpha" },
  ];

  test("returns single file content when fileChoice is specific", () => {
    expect(buildCorpusText(files, "a.md")).toBe("alpha");
    expect(buildCorpusText(files, "b.md")).toBe("bravo");
  });

  test("returns empty string for missing file", () => {
    expect(buildCorpusText(files, "nope.md")).toBe("");
  });

  test("concatenates all files sorted by path when __ALL__", () => {
    const result = buildCorpusText(files, "__ALL__");
    expect(result).toContain("## a.md");
    expect(result).toContain("## b.md");
    // 'a.md' should come before 'b.md' since sorted
    expect(result.indexOf("## a.md")).toBeLessThan(result.indexOf("## b.md"));
  });

  test("treats empty string fileChoice as __ALL__", () => {
    const result = buildCorpusText(files, "");
    expect(result).toContain("## a.md");
  });

  test("is deterministic across calls", () => {
    const r1 = buildCorpusText(files, "__ALL__");
    const r2 = buildCorpusText(files, "__ALL__");
    expect(r1).toBe(r2);
  });
});

/* ------------------------------------------------------------------ */
/*  computeTextStats                                                  */
/* ------------------------------------------------------------------ */
describe("computeTextStats", () => {
  test("counts lines and bytes for simple text", () => {
    const stats = computeTextStats("hello\nworld");
    expect(stats.lines).toBe(2);
    expect(stats.bytes).toBe(11); // "hello\nworld" = 11 bytes UTF-8
  });

  test("handles empty string", () => {
    const stats = computeTextStats("");
    expect(stats).toEqual({ lines: 0, bytes: 0, words: 0 });
  });

  test("handles single line", () => {
    const stats = computeTextStats("abc");
    expect(stats.lines).toBe(1);
    expect(stats.bytes).toBe(3);
  });

  test("handles multi-byte UTF-8 characters", () => {
    const stats = computeTextStats("\u00e9"); // é = 2 bytes in UTF-8
    expect(stats.lines).toBe(1);
    expect(stats.bytes).toBe(2);
  });

  test("counts words via whitespace tokenization", () => {
    const stats = computeTextStats("hello world\nfoo bar baz");
    expect(stats.words).toBe(5);
  });

  test("counts trailing newline as extra line", () => {
    const stats = computeTextStats("a\nb\n");
    expect(stats.lines).toBe(3); // "a", "b", ""
  });
});

/* ------------------------------------------------------------------ */
/*  computeEditDistanceLines                                          */
/* ------------------------------------------------------------------ */
describe("computeEditDistanceLines", () => {
  test("identical text has distance 0", () => {
    expect(computeEditDistanceLines("a\nb\nc", "a\nb\nc", Infinity)).toBe(0);
  });

  test("completely different text has distance = max(len_a, len_b)", () => {
    expect(computeEditDistanceLines("a\nb", "x\ny\nz", Infinity)).toBe(3);
  });

  test("empty vs non-empty", () => {
    expect(computeEditDistanceLines("", "a\nb", Infinity)).toBe(2);
    expect(computeEditDistanceLines("a\nb", "", Infinity)).toBe(2);
  });

  test("single line change", () => {
    expect(computeEditDistanceLines("a\nb\nc", "a\nB\nc", Infinity)).toBe(1);
  });

  test("early-exit when difference exceeds maxCost", () => {
    // "a" vs "x\ny\nz\nw" → distance 4, but maxCost is 2
    const result = computeEditDistanceLines("a", "x\ny\nz\nw", 2);
    expect(result).toBeGreaterThan(2);
  });

  test("is deterministic", () => {
    const a = "line1\nline2\nline3";
    const b = "line1\nmodified\nline3\nline4";
    const r1 = computeEditDistanceLines(a, b, Infinity);
    const r2 = computeEditDistanceLines(a, b, Infinity);
    expect(r1).toBe(r2);
  });
});

/* ------------------------------------------------------------------ */
/*  myersDiffTextLines / myersDiffLines                               */
/* ------------------------------------------------------------------ */
describe("myersDiffTextLines", () => {
  test("identical text produces all equal ops", () => {
    const ops = myersDiffTextLines("a\nb\nc", "a\nb\nc");
    expect(ops.every((op) => op.kind === "equal")).toBe(true);
    expect(ops.length).toBe(3);
  });

  test("empty vs non-empty produces all adds", () => {
    const ops = myersDiffTextLines("", "x\ny");
    expect(ops).toEqual([
      { kind: "add", text: "x" },
      { kind: "add", text: "y" },
    ]);
  });

  test("non-empty vs empty produces all dels", () => {
    const ops = myersDiffTextLines("x\ny", "");
    expect(ops).toEqual([
      { kind: "del", text: "x" },
      { kind: "del", text: "y" },
    ]);
  });

  test("detects single line insertion", () => {
    const ops = myersDiffTextLines("a\nc", "a\nb\nc");
    const adds = ops.filter((o) => o.kind === "add");
    const dels = ops.filter((o) => o.kind === "del");
    expect(adds.length).toBe(1);
    expect(adds[0].text).toBe("b");
    expect(dels.length).toBe(0);
  });

  test("detects single line deletion", () => {
    const ops = myersDiffTextLines("a\nb\nc", "a\nc");
    const dels = ops.filter((o) => o.kind === "del");
    const adds = ops.filter((o) => o.kind === "add");
    expect(dels.length).toBe(1);
    expect(dels[0].text).toBe("b");
    expect(adds.length).toBe(0);
  });

  test("detects substitution as del + add", () => {
    const ops = myersDiffTextLines("a\nb\nc", "a\nB\nc");
    const dels = ops.filter((o) => o.kind === "del");
    const adds = ops.filter((o) => o.kind === "add");
    expect(dels.length).toBe(1);
    expect(dels[0].text).toBe("b");
    expect(adds.length).toBe(1);
    expect(adds[0].text).toBe("B");
  });

  test("is deterministic across calls", () => {
    const a = "alpha\nbeta\ngamma\ndelta";
    const b = "alpha\nBETA\ngamma\nepsilon";
    const r1 = myersDiffTextLines(a, b);
    const r2 = myersDiffTextLines(a, b);
    expect(r1).toEqual(r2);
  });

  test("edit counts are correct for substitution + insertion", () => {
    const aText = "one\ntwo\nthree";
    const bText = "one\nTWO\nthree\nfour";
    const ops = myersDiffTextLines(aText, bText);

    const counts = { equal: 0, add: 0, del: 0 };
    for (const op of ops) counts[op.kind]++;

    // "two" → "TWO" is a substitution (1 del + 1 add), "four" is an addition
    expect(counts.equal).toBe(2); // "one" and "three"
    expect(counts.del).toBe(1); // "two"
    expect(counts.add).toBe(2); // "TWO" and "four"
  });
});

describe("myersDiffLines (array API)", () => {
  test("works with pre-split lines", () => {
    const ops = myersDiffLines(["a", "b"], ["a", "c"]);
    // Equal element preserved, del and add present for substitution
    expect(ops.filter((o) => o.kind === "equal")).toEqual([{ kind: "equal", text: "a" }]);
    expect(ops.filter((o) => o.kind === "del")).toEqual([{ kind: "del", text: "b" }]);
    expect(ops.filter((o) => o.kind === "add")).toEqual([{ kind: "add", text: "c" }]);
  });
});

/* ------------------------------------------------------------------ */
/*  computePerFileContribution                                        */
/* ------------------------------------------------------------------ */
describe("computePerFileContribution", () => {
  test("computes per-file deltas sorted by absolute byte delta", () => {
    const a: SpecFile[] = [
      { path: "small.md", content: "abc" },
      { path: "big.md", content: "hello world this is a long sentence" },
    ];
    const b: SpecFile[] = [
      { path: "small.md", content: "abcd" },
      { path: "big.md", content: "hi" },
    ];
    const result = computePerFileContribution(a, b);
    expect(result.length).toBe(2);
    // "big.md" has a larger absolute delta → should come first
    expect(result[0].path).toBe("big.md");
    expect(result[0].deltaBytes).toBeLessThan(0);
    expect(result[1].path).toBe("small.md");
    expect(result[1].deltaBytes).toBe(1); // "abcd" (4) - "abc" (3) = 1
  });

  test("handles added and removed files", () => {
    const a: SpecFile[] = [{ path: "gone.md", content: "bye" }];
    const b: SpecFile[] = [{ path: "new.md", content: "hello" }];
    const result = computePerFileContribution(a, b);
    expect(result.length).toBe(2);
    const gonePf = result.find((r) => r.path === "gone.md");
    const newPf = result.find((r) => r.path === "new.md");
    expect(gonePf?.deltaBytes).toBeLessThan(0);
    expect(newPf?.deltaBytes).toBeGreaterThan(0);
  });

  test("is deterministic", () => {
    const a: SpecFile[] = [{ path: "x.md", content: "one" }];
    const b: SpecFile[] = [{ path: "x.md", content: "one two" }];
    const r1 = computePerFileContribution(a, b);
    const r2 = computePerFileContribution(a, b);
    expect(r1).toEqual(r2);
  });
});
