/**
 * Timeline mini-map utilities for the Spec Evolution Lab.
 *
 * Computes scale mappings, sparkline data, and playback timing
 * for a compact timeline visualization across all commits.
 */

export type TimelinePoint = {
  idx: number;
  value: number;       // metric value (normalized 0..1)
  rawValue: number;    // original metric value
  reviewed: boolean;
  matchesBucketFilter: boolean;
};

export type TimelineData = {
  points: TimelinePoint[];
  maxRawValue: number;
  minRawValue: number;
};

/**
 * Map commit metric values to a 0..1 normalized scale for sparkline rendering.
 * Values are clamped and the scale is monotonic.
 */
export function buildTimelineData(
  commits: readonly { idx: number; reviewed: boolean; bucketMask: number; magnitude: Record<string, number> }[],
  metricKey: string,
  bucketFilter: number | null
): TimelineData {
  if (commits.length === 0) {
    return { points: [], maxRawValue: 0, minRawValue: 0 };
  }

  const rawValues = commits.map((c) => c.magnitude[metricKey] ?? 0);
  const maxRaw = Math.max(...rawValues);
  const minRaw = Math.min(...rawValues);
  const range = maxRaw - minRaw;

  const points: TimelinePoint[] = commits.map((c, i) => ({
    idx: c.idx,
    value: range > 0 ? (rawValues[i] - minRaw) / range : (maxRaw > 0 ? 1 : 0),
    rawValue: rawValues[i],
    reviewed: c.reviewed,
    matchesBucketFilter: bucketFilter === null || hasBucketBit(c.bucketMask, bucketFilter),
  }));

  return { points, maxRawValue: maxRaw, minRawValue: minRaw };
}

function hasBucketBit(mask: number, bucket: number): boolean {
  return (mask & (1 << bucket)) !== 0;
}

/**
 * Map a click position (0..1 fraction of timeline width) to the nearest commit index.
 */
export function positionToCommitIndex(fraction: number, totalCommits: number): number {
  if (totalCommits <= 0) return 0;
  const clamped = Math.max(0, Math.min(1, fraction));
  return Math.round(clamped * (totalCommits - 1));
}

/**
 * Map a commit index to a position fraction (0..1) along the timeline.
 */
export function commitIndexToPosition(idx: number, totalCommits: number): number {
  if (totalCommits <= 1) return 0;
  return Math.max(0, Math.min(1, idx / (totalCommits - 1)));
}

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2;
export const PLAYBACK_SPEEDS: readonly PlaybackSpeed[] = [0.25, 0.5, 1, 2];

/**
 * Compute the interval (ms) between commits for a given playback speed.
 * Base interval is 600ms at 1x speed.
 */
export function playbackIntervalMs(speed: PlaybackSpeed): number {
  return Math.round(600 / speed);
}
