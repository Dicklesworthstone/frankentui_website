import { test, expect, describe } from "bun:test";
import {
  buildTimelineData,
  positionToCommitIndex,
  commitIndexToPosition,
  playbackIntervalMs,
  type PlaybackSpeed,
} from "../lib/spec-evolution-timeline";

const makeCommit = (idx: number, groups: number, lines: number, reviewed = false, bucketMask = 0) => ({
  idx,
  reviewed,
  bucketMask,
  magnitude: { groups, lines, patchBytes: lines * 10 },
});

/* ------------------------------------------------------------------ */
/*  buildTimelineData                                                  */
/* ------------------------------------------------------------------ */
describe("buildTimelineData", () => {
  test("normalizes values to 0..1 range", () => {
    const commits = [
      makeCommit(0, 1, 10),
      makeCommit(1, 3, 30),
      makeCommit(2, 2, 20),
    ];
    const data = buildTimelineData(commits, "groups", null);
    expect(data.points.length).toBe(3);
    expect(data.points[0].value).toBeCloseTo(1 / 3);
    expect(data.points[1].value).toBeCloseTo(1);
    expect(data.points[2].value).toBeCloseTo(2 / 3);
  });

  test("preserves raw values", () => {
    const commits = [makeCommit(0, 5, 100)];
    const data = buildTimelineData(commits, "groups", null);
    expect(data.points[0].rawValue).toBe(5);
    expect(data.maxRawValue).toBe(5);
    expect(data.minRawValue).toBe(5);
  });

  test("handles empty commits", () => {
    const data = buildTimelineData([], "groups", null);
    expect(data.points).toEqual([]);
    expect(data.maxRawValue).toBe(0);
    expect(data.minRawValue).toBe(0);
  });

  test("handles single commit", () => {
    const data = buildTimelineData([makeCommit(0, 10, 50)], "groups", null);
    expect(data.points.length).toBe(1);
    expect(data.points[0].value).toBeCloseTo(1);
  });

  test("tracks reviewed status", () => {
    const commits = [
      makeCommit(0, 1, 10, false),
      makeCommit(1, 1, 10, true),
    ];
    const data = buildTimelineData(commits, "groups", null);
    expect(data.points[0].reviewed).toBe(false);
    expect(data.points[1].reviewed).toBe(true);
  });

  test("tracks bucket filter matches", () => {
    const commits = [
      makeCommit(0, 1, 10, false, 0b0010), // bucket 1
      makeCommit(1, 1, 10, false, 0b0100), // bucket 2
      makeCommit(2, 1, 10, false, 0b0110), // buckets 1 and 2
    ];
    const data = buildTimelineData(commits, "groups", 1);
    expect(data.points[0].matchesBucketFilter).toBe(true);
    expect(data.points[1].matchesBucketFilter).toBe(false);
    expect(data.points[2].matchesBucketFilter).toBe(true);
  });

  test("null bucket filter matches all", () => {
    const commits = [makeCommit(0, 1, 10, false, 0)];
    const data = buildTimelineData(commits, "groups", null);
    expect(data.points[0].matchesBucketFilter).toBe(true);
  });

  test("supports different metric keys", () => {
    const commits = [makeCommit(0, 5, 100)];
    const groupsData = buildTimelineData(commits, "groups", null);
    const linesData = buildTimelineData(commits, "lines", null);
    expect(groupsData.maxRawValue).toBe(5);
    expect(linesData.maxRawValue).toBe(100);
  });

  test("scale mapping is monotonic", () => {
    const commits = Array.from({ length: 20 }, (_, i) =>
      makeCommit(i, i + 1, (i + 1) * 10)
    );
    const data = buildTimelineData(commits, "groups", null);
    for (let i = 1; i < data.points.length; i++) {
      expect(data.points[i].value).toBeGreaterThan(data.points[i - 1].value);
    }
  });

  test("is deterministic", () => {
    const commits = [makeCommit(0, 3, 30), makeCommit(1, 7, 70)];
    const r1 = buildTimelineData(commits, "groups", null);
    const r2 = buildTimelineData(commits, "groups", null);
    expect(r1).toEqual(r2);
  });
});

/* ------------------------------------------------------------------ */
/*  positionToCommitIndex / commitIndexToPosition                      */
/* ------------------------------------------------------------------ */
describe("positionToCommitIndex", () => {
  test("maps 0 to first commit", () => {
    expect(positionToCommitIndex(0, 10)).toBe(0);
  });

  test("maps 1 to last commit", () => {
    expect(positionToCommitIndex(1, 10)).toBe(9);
  });

  test("maps 0.5 to middle commit", () => {
    expect(positionToCommitIndex(0.5, 11)).toBe(5);
  });

  test("clamps negative values", () => {
    expect(positionToCommitIndex(-0.5, 10)).toBe(0);
  });

  test("clamps values > 1", () => {
    expect(positionToCommitIndex(1.5, 10)).toBe(9);
  });

  test("handles zero commits", () => {
    expect(positionToCommitIndex(0.5, 0)).toBe(0);
  });

  test("handles single commit", () => {
    expect(positionToCommitIndex(0.5, 1)).toBe(0);
  });
});

describe("commitIndexToPosition", () => {
  test("maps first commit to 0", () => {
    expect(commitIndexToPosition(0, 10)).toBe(0);
  });

  test("maps last commit to 1", () => {
    expect(commitIndexToPosition(9, 10)).toBe(1);
  });

  test("maps middle commit to ~0.5", () => {
    expect(commitIndexToPosition(5, 11)).toBeCloseTo(0.5);
  });

  test("is inverse of positionToCommitIndex", () => {
    const total = 20;
    for (let i = 0; i < total; i++) {
      const pos = commitIndexToPosition(i, total);
      const idx = positionToCommitIndex(pos, total);
      expect(idx).toBe(i);
    }
  });

  test("handles single commit", () => {
    expect(commitIndexToPosition(0, 1)).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/*  playbackIntervalMs                                                 */
/* ------------------------------------------------------------------ */
describe("playbackIntervalMs", () => {
  test("returns correct intervals for each speed", () => {
    expect(playbackIntervalMs(0.25)).toBe(2400);
    expect(playbackIntervalMs(0.5)).toBe(1200);
    expect(playbackIntervalMs(1)).toBe(600);
    expect(playbackIntervalMs(2)).toBe(300);
  });

  test("slower speeds have longer intervals", () => {
    const speeds: PlaybackSpeed[] = [0.25, 0.5, 1, 2];
    for (let i = 1; i < speeds.length; i++) {
      expect(playbackIntervalMs(speeds[i])).toBeLessThan(playbackIntervalMs(speeds[i - 1]));
    }
  });
});
