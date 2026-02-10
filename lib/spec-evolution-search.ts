/**
 * Full-text search over spec evolution corpus.
 *
 * Supports two scopes:
 * - "thisCommit": search the current commit's snapshot text
 * - "allCommits": search across all commits using a lightweight inverted index
 *
 * The all-commits index is built incrementally via requestIdleCallback to avoid
 * blocking the main thread during large dataset indexing.
 */

export type SearchScope = "thisCommit" | "allCommits";

export type SearchHit = {
  commitIdx: number;
  commitShort: string;
  commitDate: string;
  commitSubject: string;
  filePath: string;
  /** Line number within the file (1-based) */
  lineNo: number;
  /** Snippet of text around the match */
  snippet: string;
  /** Character offset of match start within the snippet */
  matchOffset: number;
  /** Length of the matched text */
  matchLength: number;
};

export type IndexProgress = {
  indexed: number;
  total: number;
  done: boolean;
};

type CommitEntry = {
  idx: number;
  short: string;
  date: string;
  subject: string;
  files: { path: string; content: string }[];
};

/**
 * Search a single commit's files for a query string (case-insensitive).
 * Returns up to `maxHits` results with context snippets.
 */
export function searchSingleCommit(
  commit: CommitEntry,
  query: string,
  maxHits = 50
): SearchHit[] {
  if (!query) return [];
  const q = query.toLowerCase();
  const hits: SearchHit[] = [];

  for (const file of commit.files) {
    const lines = file.content.split("\n");
    for (let i = 0; i < lines.length && hits.length < maxHits; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      let pos = lower.indexOf(q);
      while (pos !== -1 && hits.length < maxHits) {
        const { snippet, snippetMatchOffset } = buildSnippet(line, pos, q.length);
        hits.push({
          commitIdx: commit.idx,
          commitShort: commit.short,
          commitDate: commit.date,
          commitSubject: commit.subject,
          filePath: file.path,
          lineNo: i + 1,
          snippet,
          matchOffset: snippetMatchOffset,
          matchLength: q.length,
        });
        pos = lower.indexOf(q, pos + 1);
      }
    }
  }

  return hits;
}

/**
 * Build a context snippet around a match position.
 * Extracts ~40 chars before and after the match.
 * Returns the snippet and the adjusted offset of the match within it.
 */
function buildSnippet(line: string, matchPos: number, matchLen: number): { snippet: string; snippetMatchOffset: number } {
  const ctxBefore = 40;
  const ctxAfter = 60;
  const start = Math.max(0, matchPos - ctxBefore);
  const end = Math.min(line.length, matchPos + matchLen + ctxAfter);
  
  let snippet = line.slice(start, end);
  let snippetMatchOffset = matchPos - start;

  if (start > 0) {
    snippet = "…" + snippet;
    snippetMatchOffset += 1;
  }
  if (end < line.length) {
    snippet = snippet + "…";
  }
  
  return { snippet, snippetMatchOffset };
}

/**
 * Inverted index entry: maps a token to the set of (commitIdx, fileIdx) pairs
 * where it appears.
 */
type PostingEntry = {
  commitIdx: number;
  fileIdx: number;
};

/**
 * Lightweight inverted index for full-text search across all commits.
 * Tokens are lowercased words (split on whitespace + punctuation).
 */
export class CorpusIndex {
  private postings = new Map<string, PostingEntry[]>();
  private commits: CommitEntry[] = [];
  private _indexed = 0;

  get indexed(): number {
    return this._indexed;
  }

  get total(): number {
    return this.commits.length;
  }

  get done(): boolean {
    return this._indexed >= this.commits.length;
  }

  get progress(): IndexProgress {
    return {
      indexed: this._indexed,
      total: this.commits.length,
      done: this.done,
    };
  }

  /**
   * Initialize with the full commit list. Does NOT start indexing.
   */
  init(commits: CommitEntry[]): void {
    this.postings.clear();
    this.commits = commits;
    this._indexed = 0;
  }

  /**
   * Index the next `batchSize` commits. Returns true if more work remains.
   */
  indexBatch(batchSize: number): boolean {
    const end = Math.min(this._indexed + batchSize, this.commits.length);
    for (let ci = this._indexed; ci < end; ci++) {
      const commit = this.commits[ci];
      for (let fi = 0; fi < commit.files.length; fi++) {
        const tokens = tokenize(commit.files[fi].content);
        for (const token of tokens) {
          let list = this.postings.get(token);
          if (!list) {
            list = [];
            this.postings.set(token, list);
          }
          // Deduplicate: only add if the last entry isn't the same commit+file
          const last = list[list.length - 1];
          if (!last || last.commitIdx !== ci || last.fileIdx !== fi) {
            list.push({ commitIdx: ci, fileIdx: fi });
          }
        }
      }
    }
    this._indexed = end;
    return !this.done;
  }

  /**
   * Search the index for a query string. Returns matching commits with snippets.
   * Only searches commits that have been indexed so far.
   */
  search(query: string, maxHits = 100): SearchHit[] {
    if (!query) return [];
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    // Find commits that contain ALL query tokens (AND semantics)
    const candidateSets = queryTokens.map((t) => {
      const postings = this.postings.get(t);
      if (!postings) return new Set<number>();
      return new Set(postings.map((p) => p.commitIdx));
    });

    // Intersect all sets
    let candidates = candidateSets[0];
    for (let i = 1; i < candidateSets.length; i++) {
      const next = candidateSets[i];
      candidates = new Set([...candidates].filter((c) => next.has(c)));
    }

    if (candidates.size === 0) return [];

    // For each candidate commit, do a full-text search to get exact snippets
    const hits: SearchHit[] = [];
    // Search in reverse order (newest first) for more useful results
    const sortedCandidates = [...candidates].sort((a, b) => b - a);

    for (const ci of sortedCandidates) {
      if (hits.length >= maxHits) break;
      const commit = this.commits[ci];
      if (!commit) continue;
      const commitHits = searchSingleCommit(commit, query, maxHits - hits.length);
      hits.push(...commitHits);
    }

    return hits;
  }

  /**
   * Clear the index and release memory.
   */
  clear(): void {
    this.postings.clear();
    this.commits = [];
    this._indexed = 0;
  }
}

/**
 * Tokenize text into lowercase word tokens.
 * Splits on whitespace and common punctuation, discards very short tokens.
 * Supports Unicode letters.
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  const tokens: string[] = [];
  const seen = new Set<string>();
  // Split on non-word chars but keep apostrophes within words.
  // Using Unicode property escapes for wide language support.
  const words = text.toLowerCase().split(/[^\p{L}\p{N}']+/u);
  for (const w of words) {
    const clean = w.replace(/^'+|'+$/g, "");
    if (clean.length < 2) continue;
    if (!seen.has(clean)) {
      seen.add(clean);
      tokens.push(clean);
    }
  }
  return tokens;
}
