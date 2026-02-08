import { test, expect, describe } from "bun:test";
import { LRUCache } from "../lib/lru-cache";

describe("LRUCache", () => {
  test("stores and retrieves values", () => {
    const cache = new LRUCache<number>(5);
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBe(2);
  });

  test("returns undefined for missing keys", () => {
    const cache = new LRUCache<string>(5);
    expect(cache.get("nope")).toBeUndefined();
  });

  test("evicts oldest entry when max size exceeded", () => {
    const cache = new LRUCache<number>(3);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    cache.set("d", 4); // evicts "a"
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe(2);
    expect(cache.get("d")).toBe(4);
    expect(cache.size).toBe(3);
  });

  test("access refreshes entry position (prevents eviction)", () => {
    const cache = new LRUCache<number>(3);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    // Access "a" to refresh it
    cache.get("a");
    cache.set("d", 4); // should evict "b" (oldest non-accessed)
    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe(3);
    expect(cache.get("d")).toBe(4);
  });

  test("overwriting existing key updates value without growing size", () => {
    const cache = new LRUCache<string>(3);
    cache.set("a", "v1");
    cache.set("b", "v2");
    cache.set("a", "v3"); // overwrite
    expect(cache.get("a")).toBe("v3");
    expect(cache.size).toBe(2);
  });

  test("clear empties the cache", () => {
    const cache = new LRUCache<number>(5);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get("a")).toBeUndefined();
  });

  test("has returns correct boolean", () => {
    const cache = new LRUCache<number>(5);
    cache.set("a", 1);
    expect(cache.has("a")).toBe(true);
    expect(cache.has("b")).toBe(false);
  });

  test("handles max size of 1", () => {
    const cache = new LRUCache<number>(1);
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe(2);
    expect(cache.size).toBe(1);
  });

  test("eviction order is correct after mixed operations", () => {
    const cache = new LRUCache<number>(4);
    cache.set("a", 1); // order: a
    cache.set("b", 2); // order: a, b
    cache.set("c", 3); // order: a, b, c
    cache.set("d", 4); // order: a, b, c, d
    cache.get("b");     // order: a, c, d, b
    cache.set("a", 10); // order: c, d, b, a (update refreshes)
    cache.set("e", 5);  // order: d, b, a, e (evicts c)
    expect(cache.get("c")).toBeUndefined();
    expect(cache.get("d")).toBe(4);
    expect(cache.get("b")).toBe(2);
    expect(cache.get("a")).toBe(10);
    expect(cache.get("e")).toBe(5);
  });
});
