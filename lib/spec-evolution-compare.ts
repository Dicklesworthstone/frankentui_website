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

  // Use a map for faster lookup if choice is specific, but here we just sort once.
  const sorted = [...files].sort((a, b) => (a.path < b.path ? -1 : 1));
  return sorted.map((f) => `## ${f.path}\n\n${f.content ?? ""}`).join("\n\n---\n\n");
}

export function computeTextStats(text: string): TextStats {
  if (!text) return { lines: 0, bytes: 0, words: 0 };
  const lines = text === "" ? 0 : text.split(/\r?\n/).length;
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
  const a = prevText ? prevText.split(/\r?\n/) : [];
  const b = nextText ? nextText.split(/\r?\n/) : [];

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
  if (!text) return [];
  return text.split(/\r?\n/);
}

function backtrackMyers(trace: Int32Array[], a: string[], b: string[], max: number): DiffOp[] {
  let x = a.length;
  let y = b.length;
  const ops: DiffOp[] = [];

  for (let d = trace.length - 1; d >= 0; d--) {
    const k = x - y;
    const v = trace[d];

    if (d > 0) {
      const vPrev = trace[d - 1];
      const vKMinus1 = vPrev[max + k - 1];
      const vKPlus1 = vPrev[max + k + 1];

      if (k === -d || (k !== d && vKMinus1 < vKPlus1)) {
        const prevX = vKPlus1;
        const prevY = prevX - (k + 1);
        
        while (x > prevX && y > (prevY + 1)) {
          ops.push({ kind: "equal", text: a[x - 1] });
          x--; y--;
        }
        ops.push({ kind: "add", text: b[y - 1] });
        y--;
        x = prevX;
        y = prevY;
      } else {
        const prevX = vKMinus1;
        const prevY = prevX - (k - 1);

        while (x > (prevX + 1) && y > prevY) {
          ops.push({ kind: "equal", text: a[x - 1] });
          x--; y--;
        }
        ops.push({ kind: "del", text: a[x - 1] });
        x--;
        x = prevX;
        y = prevY;
      }
    } else {
      while (x > 0 && y > 0) {
        ops.push({ kind: "equal", text: a[x - 1] });
        x--; y--;
      }
    }
  }

  ops.reverse();
  return ops;
}

/**
 * Myers O((N+M)D) diff on lines.
 * 
 * Safety: Returns a simple "all deleted, all added" diff if it takes longer than 500ms.
 */
export function myersDiffLines(aLines: string[], bLines: string[]): DiffOp[] {
  const N = aLines.length;
  const M = bLines.length;
  if (N === 0) return bLines.map((text) => ({ kind: "add", text }));
  if (M === 0) return aLines.map((text) => ({ kind: "del", text }));

  const max = N + M;
  const trace: Int32Array[] = [];
  const startTime = performance.now();

  function fnv1a(str: string) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  const ah = new Uint32Array(N);
  const bh = new Uint32Array(M);
  for (let i = 0; i < N; i++) ah[i] = fnv1a(aLines[i]);
  for (let j = 0; j < M; j++) bh[j] = fnv1a(bLines[j]);

  let v = new Int32Array(2 * max + 1).fill(-1);
  v[max + 1] = 0;

  for (let d = 0; d <= max; d++) {
    if (d > 0 && d % 50 === 0 && performance.now() - startTime > 500) {
      return [
        ...aLines.map(text => ({ kind: "del" as const, text })),
        ...bLines.map(text => ({ kind: "add" as const, text })),
      ];
    }

    const vNext = new Int32Array(v);
    for (let k = -d; k <= d; k += 2) {
      const vKMinus1 = vNext[max + k - 1];
      const vKPlus1 = vNext[max + k + 1];

      let x = (k === -d || (k !== d && vKMinus1 < vKPlus1)) 
        ? vKPlus1 
        : vKMinus1 + 1;

      let y = x - k;
      while (x < N && y < M && ah[x] === bh[y] && aLines[x] === bLines[y]) {
        x++;
        y++;
      }

      vNext[max + k] = x;
      if (x >= N && y >= M) {
        trace.push(vNext);
        return backtrackMyers(trace, aLines, bLines, max);
      }
    }
    trace.push(vNext);
    v = vNext;
  }

  return backtrackMyers(trace, aLines, bLines, max);
}

export function myersDiffTextLines(aText: string, bText: string): DiffOp[] {
  return myersDiffLines(splitLines(aText), splitLines(bText));
}
