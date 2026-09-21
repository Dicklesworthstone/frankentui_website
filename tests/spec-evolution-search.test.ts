import { describe, expect, test } from "bun:test";
import { CorpusIndex, searchSingleCommit, tokenize } from "../lib/spec-evolution-search";

const makeCommit = (
  idx: number,
  files: { path: string; content: string }[],
  extra?: Partial<{ short: string; date: string; subject: string }>,
) => ({
  idx,
  short: extra?.short ?? `abc${idx}`,
  date: extra?.date ?? "2026-01-01T00:00:00",
  subject: extra?.subject ?? `Commit ${idx}`,
  files,
});

/* ------------------------------------------------------------------ */
/*  tokenize                                                          */
/* ------------------------------------------------------------------ */
describe("tokenize", () => {
  test("splits on whitespace and punctuation", () => {
    const tokens = tokenize("Hello, world! Foo-bar baz.");
    expect(tokens).toContain("hello");
    expect(tokens).toContain("world");
    expect(tokens).toContain("foo");
    expect(tokens).toContain("bar");
    expect(tokens).toContain("baz");
  });

  test("lowercases all tokens", () => {
    const tokens = tokenize("UPPER lower Mixed");
    expect(tokens).toEqual(["upper", "lower", "mixed"]);
  });

  test("deduplicates tokens", () => {
    const tokens = tokenize("hello hello hello");
    expect(tokens).toEqual(["hello"]);
  });

  test("discards single-char tokens", () => {
    const tokens = tokenize("a b cd ef");
    expect(tokens).toEqual(["cd", "ef"]);
  });

  test("handles empty input", () => {
    expect(tokenize("")).toEqual([]);
    expect(tokenize("   ")).toEqual([]);
  });

  test("strips leading/trailing apostrophes", () => {
    const tokens = tokenize("'hello' it's");
    expect(tokens).toContain("hello");
    expect(tokens).toContain("it's");
  });

  test("is deterministic", () => {
    const text = "foo bar baz qux";
    expect(tokenize(text)).toEqual(tokenize(text));
  });
});

/* ------------------------------------------------------------------ */
/*  searchSingleCommit                                                */
/* ------------------------------------------------------------------ */
describe("searchSingleCommit", () => {
  test("finds exact matches in file content", () => {
    const commit = makeCommit(0, [
      { path: "spec.md", content: "FrankenTUI is a TUI framework\nBuilt with Rust" },
    ]);
    const hits = searchSingleCommit(commit, "TUI");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].filePath).toBe("spec.md");
    expect(hits[0].lineNo).toBe(1);
  });

  test("is case-insensitive", () => {
    const commit = makeCommit(0, [{ path: "a.md", content: "Hello World" }]);
    const hits = searchSingleCommit(commit, "hello");
    expect(hits.length).toBe(1);
    expect(hits[0].snippet).toContain("Hello World");
  });

  test("finds multiple matches in same line", () => {
    const commit = makeCommit(0, [{ path: "a.md", content: "foo foo foo" }]);
    const hits = searchSingleCommit(commit, "foo");
    expect(hits.length).toBe(3);
  });

  test("finds matches across multiple files", () => {
    const commit = makeCommit(0, [
      { path: "a.md", content: "hello" },
      { path: "b.md", content: "hello world" },
    ]);
    const hits = searchSingleCommit(commit, "hello");
    expect(hits.length).toBe(2);
    expect(hits.map((h) => h.filePath).sort()).toEqual(["a.md", "b.md"]);
  });

  test("returns empty for no match", () => {
    const commit = makeCommit(0, [{ path: "a.md", content: "nothing here" }]);
    const hits = searchSingleCommit(commit, "xyz");
    expect(hits).toEqual([]);
  });

  test("returns empty for empty query", () => {
    const commit = makeCommit(0, [{ path: "a.md", content: "hello" }]);
    expect(searchSingleCommit(commit, "")).toEqual([]);
  });

  test("respects maxHits limit", () => {
    const commit = makeCommit(0, [{ path: "a.md", content: Array(100).fill("match").join("\n") }]);
    const hits = searchSingleCommit(commit, "match", 5);
    expect(hits.length).toBe(5);
  });

  test("snippet includes context around match", () => {
    const longLine = "A".repeat(80) + "TARGET" + "B".repeat(80);
    const commit = makeCommit(0, [{ path: "a.md", content: longLine }]);
    const hits = searchSingleCommit(commit, "TARGET");
    expect(hits.length).toBe(1);
    expect(hits[0].snippet).toContain("TARGET");
    expect(hits[0].snippet.startsWith("…")).toBe(true);
    expect(hits[0].snippet.endsWith("…")).toBe(true);
  });

  test("populates commit metadata in hits", () => {
    const commit = makeCommit(42, [{ path: "x.md", content: "found it" }], {
      short: "deadbeef",
      date: "2026-02-01T12:00:00",
      subject: "Important commit",
    });
    const hits = searchSingleCommit(commit, "found");
    expect(hits[0].commitIdx).toBe(42);
    expect(hits[0].commitShort).toBe("deadbeef");
    expect(hits[0].commitDate).toBe("2026-02-01T12:00:00");
    expect(hits[0].commitSubject).toBe("Important commit");
  });

  test("is deterministic", () => {
    const commit = makeCommit(0, [{ path: "a.md", content: "foo bar\nbaz foo\nqux" }]);
    const r1 = searchSingleCommit(commit, "foo");
    const r2 = searchSingleCommit(commit, "foo");
    expect(r1).toEqual(r2);
  });
});

/* ------------------------------------------------------------------ */
/*  CorpusIndex                                                       */
/* ------------------------------------------------------------------ */
describe("CorpusIndex", () => {
  test("init sets total and resets indexed", () => {
    const index = new CorpusIndex();
    const commits = [
      makeCommit(0, [{ path: "a.md", content: "hello" }]),
      makeCommit(1, [{ path: "b.md", content: "world" }]),
    ];
    index.init(commits);
    expect(index.total).toBe(2);
    expect(index.indexed).toBe(0);
    expect(index.done).toBe(false);
  });

  test("indexBatch indexes incrementally", () => {
    const index = new CorpusIndex();
    const commits = [
      makeCommit(0, [{ path: "a.md", content: "alpha bravo" }]),
      makeCommit(1, [{ path: "b.md", content: "charlie delta" }]),
      makeCommit(2, [{ path: "c.md", content: "echo foxtrot" }]),
    ];
    index.init(commits);

    const more1 = index.indexBatch(2);
    expect(more1).toBe(true);
    expect(index.indexed).toBe(2);

    const more2 = index.indexBatch(2);
    expect(more2).toBe(false);
    expect(index.indexed).toBe(3);
    expect(index.done).toBe(true);
  });

  test("search finds terms after indexing", () => {
    const index = new CorpusIndex();
    const commits = [
      makeCommit(0, [{ path: "a.md", content: "FrankenTUI uses Ratatui" }]),
      makeCommit(1, [{ path: "b.md", content: "Performance testing" }]),
      makeCommit(2, [{ path: "c.md", content: "FrankenTUI architecture design" }]),
    ];
    index.init(commits);
    index.indexBatch(100); // index all

    const hits = index.search("FrankenTUI");
    expect(hits.length).toBe(2);
    // Results should be newest first
    expect(hits[0].commitIdx).toBe(2);
    expect(hits[1].commitIdx).toBe(0);
  });

  test("search is case-insensitive", () => {
    const index = new CorpusIndex();
    const commits = [makeCommit(0, [{ path: "a.md", content: "Hello World" }])];
    index.init(commits);
    index.indexBatch(100);

    const hits = index.search("hello");
    expect(hits.length).toBe(1);
  });

  test("search with AND semantics (all tokens must match)", () => {
    const index = new CorpusIndex();
    const commits = [
      makeCommit(0, [{ path: "a.md", content: "alpha bravo" }]),
      makeCommit(1, [{ path: "b.md", content: "alpha charlie" }]),
      makeCommit(2, [{ path: "c.md", content: "bravo charlie" }]),
    ];
    index.init(commits);
    index.indexBatch(100);

    const hits = index.search("alpha bravo");
    expect(hits.length).toBe(1);
    expect(hits[0].commitIdx).toBe(0);
  });

  test("search returns empty for unknown terms", () => {
    const index = new CorpusIndex();
    const commits = [makeCommit(0, [{ path: "a.md", content: "hello world" }])];
    index.init(commits);
    index.indexBatch(100);

    expect(index.search("nonexistent")).toEqual([]);
  });

  test("search returns empty for empty query", () => {
    const index = new CorpusIndex();
    const commits = [makeCommit(0, [{ path: "a.md", content: "hello" }])];
    index.init(commits);
    index.indexBatch(100);

    expect(index.search("")).toEqual([]);
    expect(index.search("   ")).toEqual([]);
  });

  test("partial indexing only searches indexed commits", () => {
    const index = new CorpusIndex();
    const commits = [
      makeCommit(0, [{ path: "a.md", content: "target word" }]),
      makeCommit(1, [{ path: "b.md", content: "target word again" }]),
    ];
    index.init(commits);
    index.indexBatch(1); // only index first commit

    const hits = index.search("target");
    expect(hits.length).toBe(1);
    expect(hits[0].commitIdx).toBe(0);
  });

  test("respects maxHits", () => {
    const index = new CorpusIndex();
    const commits = Array.from({ length: 20 }, (_, i) =>
      makeCommit(i, [{ path: "a.md", content: "common term here" }]),
    );
    index.init(commits);
    index.indexBatch(100);

    const hits = index.search("common", 5);
    expect(hits.length).toBe(5);
  });

  test("clear resets the index", () => {
    const index = new CorpusIndex();
    const commits = [makeCommit(0, [{ path: "a.md", content: "hello" }])];
    index.init(commits);
    index.indexBatch(100);
    expect(index.search("hello").length).toBe(1);

    index.clear();
    expect(index.total).toBe(0);
    expect(index.indexed).toBe(0);
    expect(index.search("hello")).toEqual([]);
  });

  test("progress reports correctly", () => {
    const index = new CorpusIndex();
    const commits = [
      makeCommit(0, [{ path: "a.md", content: "hello" }]),
      makeCommit(1, [{ path: "b.md", content: "world" }]),
    ];
    index.init(commits);

    expect(index.progress).toEqual({ indexed: 0, total: 2, done: false });

    index.indexBatch(1);
    expect(index.progress).toEqual({ indexed: 1, total: 2, done: false });

    index.indexBatch(1);
    expect(index.progress).toEqual({ indexed: 2, total: 2, done: true });
  });

  test("is deterministic across calls", () => {
    const index = new CorpusIndex();
    const commits = [
      makeCommit(0, [{ path: "a.md", content: "hello world foo bar" }]),
      makeCommit(1, [{ path: "b.md", content: "hello baz qux" }]),
    ];
    index.init(commits);
    index.indexBatch(100);

    const r1 = index.search("hello");
    const r2 = index.search("hello");
    expect(r1).toEqual(r2);
  });
});
