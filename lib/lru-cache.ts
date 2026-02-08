/**
 * Simple LRU (Least Recently Used) cache with configurable max size.
 * Used by Spec Evolution Lab for caching parsed markdown HTML,
 * patch files, and snapshot markdown to avoid redundant computation.
 */
export class LRUCache<V> {
  private max: number;
  private map = new Map<string, V>();

  constructor(max: number) {
    this.max = max;
  }

  get(key: string): V | undefined {
    const v = this.map.get(key);
    if (v !== undefined) {
      // Move to end (most recent)
      this.map.delete(key);
      this.map.set(key, v);
    }
    return v;
  }

  set(key: string, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.max) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
  }

  get size(): number {
    return this.map.size;
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  clear(): void {
    this.map.clear();
  }
}
