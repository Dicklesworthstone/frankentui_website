export type SpecFile = { path: string; content: string };

export type FileChangeSummary = {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
};

export type TextStats = { lines: number; bytes: number; words: number };

export type DiffOpKind = "equal" | "add" | "del";
export type DiffOp = { kind: DiffOpKind; text: string };

const textEncoder = new TextEncoder();

export function indexSpecFiles(files: SpecFile[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const f of files) out.set(f.path, f.content ?? "");
  return out;
}

export function computeFileChangeSummary(aFiles: SpecFile[], bFiles: SpecFile[]): FileChangeSummary {
  const a = indexSpecFiles(aFiles);
  const b = indexSpecFiles(bFiles);

  const paths = new Set<string>();
  a.forEach((_v, k) => paths.add(k));
  b.forEach((_v, k) => paths.add(k));

  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];
  const unchanged: string[] = [];

  for (const p of paths) {
    const inA = a.has(p);
    const inB = b.has(p);
    if (!inA && inB) {
      added.push(p);
      continue;
    }
    if (inA && !inB) {
      removed.push(p);
      continue;
    }
    if (!inA || !inB) continue;
    if (a.get(p) === b.get(p)) unchanged.push(p);
    else modified.push(p);
  }

  added.sort();
  removed.sort();
  modified.sort();
  unchanged.sort();
  return { added, removed, modified, unchanged };
}

export function buildCorpusText(files: SpecFile[], fileChoice: string): string {
  const choice = fileChoice || "__ALL__";
  if (choice !== "__ALL__") {
    const hit = files.find((f) => f.path === choice);
    return hit?.content ?? "";
  }

  // Deterministic ordering: sort by path so comparisons are stable.
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));
  return sorted.map((f) => `## ${f.path}\n\n${f.content ?? ""}`).join("\n\n---\n\n");
}

export function computeTextStats(text: string): TextStats {
  if (!text) return { lines: 0, bytes: 0, words: 0 };
  const lines = text.split(/\n/).length;
  const bytes = textEncoder.encode(text).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  return { lines, bytes, words };
}

export type PerFileContribution = {
  path: string;
  deltaLines: number;
  deltaBytes: number;
};

export function computePerFileContribution(
  aFiles: SpecFile[],
  bFiles: SpecFile[]
): PerFileContribution[] {
  const aMap = indexSpecFiles(aFiles);
  const bMap = indexSpecFiles(bFiles);

  const paths = new Set<string>();
  aMap.forEach((_v, k) => paths.add(k));
  bMap.forEach((_v, k) => paths.add(k));

  const result: PerFileContribution[] = [];
  for (const p of paths) {
    const aContent = aMap.get(p) ?? "";
    const bContent = bMap.get(p) ?? "";
    const aStats = computeTextStats(aContent);
    const bStats = computeTextStats(bContent);
    result.push({
      path: p,
      deltaLines: bStats.lines - aStats.lines,
      deltaBytes: bStats.bytes - aStats.bytes,
    });
  }

  // Sort by absolute delta bytes descending (biggest contributor first)
  result.sort((a, b) => Math.abs(b.deltaBytes) - Math.abs(a.deltaBytes));
  return result;
}

export function computeEditDistanceLines(prevText: string, nextText: string, maxCost: number): number {
  // Levenshtein distance on lines (token = line). Uses hashing for faster comparisons.
  const a = prevText ? prevText.split(/\n/) : [];
  const b = nextText ? nextText.split(/\n/) : [];

  const k = typeof maxCost === "number" ? maxCost : Number.POSITIVE_INFINITY;
  if (Math.abs(a.length - b.length) > k) return k + 1;

  function fnv1a(str: string) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  const ah = new Uint32Array(a.length);
  const bh = new Uint32Array(b.length);
  for (let i = 0; i < a.length; i++) ah[i] = fnv1a(a[i]);
  for (let j = 0; j < b.length; j++) bh[j] = fnv1a(b[j]);

  const m = b.length;
  let prev = new Uint32Array(m + 1);
  let curr = new Uint32Array(m + 1);
  for (let j = 0; j <= m; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let minRow = curr[0];
    const ai = ah[i - 1];
    for (let j = 1; j <= m; j++) {
      const cost = ai === bh[j - 1] ? 0 : 1;
      const del = prev[j] + 1;
      const ins = curr[j - 1] + 1;
      const sub = prev[j - 1] + cost;
      let v = del < ins ? del : ins;
      if (sub < v) v = sub;
      curr[j] = v;
      if (v < minRow) minRow = v;
    }

    if (minRow > k) return k + 1;
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }

  return prev[m];
}

function splitLines(text: string): string[] {
  // Keep empty trailing line if text ends with '\n' for stable diffs.
  if (!text) return [];
  return text.split(/\n/);
}

function backtrackMyers(trace: Map<number, number>[], a: string[], b: string[]): DiffOp[] {
  let x = a.length;
  let y = b.length;
  const ops: DiffOp[] = [];

  for (let d = trace.length - 1; d > 0; d--) {
    const v = trace[d];
    const k = x - y;

    const vKMinus1 = v.get(k - 1) ?? -1;
    const vKPlus1 = v.get(k + 1) ?? -1;

    const prevK =
      k === -d || (k !== d && vKMinus1 < vKPlus1)
        ? k + 1 // insertion
        : k - 1; // deletion

    const prevX = trace[d - 1].get(prevK) ?? 0;
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      ops.push({ kind: "equal", text: a[x - 1] });
      x--;
      y--;
    }

    if (x === prevX) ops.push({ kind: "add", text: b[prevY] });
    else ops.push({ kind: "del", text: a[prevX] });

    x = prevX;
    y = prevY;
  }

  while (x > 0 && y > 0) {
    ops.push({ kind: "equal", text: a[x - 1] });
    x--;
    y--;
  }
  while (x > 0) {
    ops.push({ kind: "del", text: a[x - 1] });
    x--;
  }
  while (y > 0) {
    ops.push({ kind: "add", text: b[y - 1] });
    y--;
  }

  ops.reverse();
  return ops;
}

/**
 * Myers O((N+M)D) diff on lines.
 *
 * Notes:
 * - Designed for compare-mode "corpus diff" views.
 * - If you need hunks, build them on top of the returned edit script.
 */
export function myersDiffLines(aLines: string[], bLines: string[]): DiffOp[] {
  const N = aLines.length;
  const M = bLines.length;
  if (N === 0) return bLines.map((text) => ({ kind: "add", text }));
  if (M === 0) return aLines.map((text) => ({ kind: "del", text }));

  const max = N + M;
  const trace: Map<number, number>[] = [];

  // k -> x (furthest x on diagonal k after d edits)
  let v = new Map<number, number>();
  v.set(1, 0);

  for (let d = 0; d <= max; d++) {
    const vNext = new Map<number, number>();
    for (let k = -d; k <= d; k += 2) {
      const vKMinus1 = v.get(k - 1) ?? -1;
      const vKPlus1 = v.get(k + 1) ?? -1;

      // Choose insertion vs deletion step.
      let x =
        k === -d || (k !== d && vKMinus1 < vKPlus1)
          ? vKPlus1 // insertion
          : vKMinus1 + 1; // deletion
      if (x < 0) x = 0;

      let y = x - k;
      while (x < N && y < M && aLines[x] === bLines[y]) {
        x++;
        y++;
      }

      vNext.set(k, x);
      if (x >= N && y >= M) {
        trace.push(vNext);
        return backtrackMyers(trace, aLines, bLines);
      }
    }
    trace.push(vNext);
    v = vNext;
  }

  return backtrackMyers(trace, aLines, bLines);
}

export function myersDiffTextLines(aText: string, bText: string): DiffOp[] {
  return myersDiffLines(splitLines(aText), splitLines(bText));
}
