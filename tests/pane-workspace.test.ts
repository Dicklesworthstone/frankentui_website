import { describe, expect, test } from "bun:test";
import {
  PanePointerRouter,
  restoreWorkspace,
  SAVE_RETRY_MS,
  WorkspaceSaver,
  type WorkspaceStorage,
} from "../lib/pane-workspace";

// A runner double with the pane-workspace surface of ShowcaseRunner: an edit
// bumps the generation, and saving acknowledges one.
function fakeRunner() {
  const r = {
    generation: 0n,
    saved: 0n,
    pointer: undefined as number | undefined,
    layout: "default",
    exportFails: false,
    imported: [] as string[],
    edit(layout: string) {
      r.layout = layout;
      r.generation += 1n;
    },
    paneWorkspaceGeneration: () => r.generation,
    paneWorkspaceDirty: () => r.generation !== r.saved,
    paneActivePointerId: () => r.pointer,
    paneExportWorkspaceSnapshot: () => {
      if (r.exportFails) throw new Error("export failed");
      return JSON.stringify({ layout: r.layout });
    },
    paneMarkWorkspaceSaved: (g: bigint) => {
      if (g > r.generation) return false;
      r.saved = g;
      return true;
    },
    paneImportWorkspaceSnapshot: (json: string) => {
      r.imported.push(json);
      r.layout = JSON.parse(json).layout;
      return true;
    },
  };
  return r;
}

function memoryStorage(): WorkspaceStorage & { data: Map<string, string>; failWrites: boolean } {
  const s = {
    data: new Map<string, string>(),
    failWrites: false,
    getItem: (k: string) => s.data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (s.failWrites) throw new Error("QuotaExceededError");
      s.data.set(k, v);
    },
  };
  return s;
}

const KEY = "test-workspace";

describe("pane workspace persistence (bd-ers)", () => {
  test("a changed layout is saved once, then not again until it changes", () => {
    const runner = fakeRunner();
    const storage = memoryStorage();
    const saver = new WorkspaceSaver(runner, storage, KEY);

    expect(saver.maybeSave(0)).toBe(false); // clean: nothing to save
    runner.edit("split-60-40");
    expect(saver.maybeSave(16)).toBe(true);
    expect(storage.data.get(KEY)).toBe(JSON.stringify({ layout: "split-60-40" }));
    expect(saver.maybeSave(32)).toBe(false); // acknowledged, so clean again
  });

  test("nothing is saved mid-drag; the settled layout is saved after release", () => {
    const runner = fakeRunner();
    const storage = memoryStorage();
    const saver = new WorkspaceSaver(runner, storage, KEY);
    runner.pointer = 1;
    runner.edit("dragging");
    expect(saver.maybeSave(0)).toBe(false);
    expect(storage.data.has(KEY)).toBe(false);
    runner.edit("released-at-70-30");
    runner.pointer = undefined;
    expect(saver.maybeSave(16)).toBe(true);
    expect(storage.data.get(KEY)).toContain("released-at-70-30");
  });

  test("a failed write backs off, then retries after the window", () => {
    const runner = fakeRunner();
    const storage = memoryStorage();
    const saver = new WorkspaceSaver(runner, storage, KEY);
    runner.edit("a");
    storage.failWrites = true;
    expect(saver.maybeSave(1000)).toBe(false);
    expect(runner.paneWorkspaceDirty()).toBe(true); // not acknowledged
    storage.failWrites = false;
    expect(saver.maybeSave(1000 + SAVE_RETRY_MS - 1)).toBe(false); // still waiting
    expect(saver.maybeSave(1000 + SAVE_RETRY_MS)).toBe(true);
  });

  test("a failed export backs off and leaves the workspace dirty", () => {
    const runner = fakeRunner();
    const saver = new WorkspaceSaver(runner, memoryStorage(), KEY);
    runner.edit("a");
    runner.exportFails = true;
    expect(saver.maybeSave(0)).toBe(false);
    expect(runner.paneWorkspaceDirty()).toBe(true);
  });

  test("restore imports the saved snapshot; nothing saved means default layout", () => {
    const storage = memoryStorage();
    const fresh = fakeRunner();
    expect(restoreWorkspace(fresh, storage, KEY)).toBe(false);
    expect(fresh.imported).toEqual([]);

    storage.data.set(KEY, JSON.stringify({ layout: "saved-layout" }));
    const reloaded = fakeRunner();
    expect(restoreWorkspace(reloaded, storage, KEY)).toBe(true);
    expect(reloaded.layout).toBe("saved-layout");
  });

  test("an incompatible snapshot is ignored rather than breaking the widget", () => {
    const storage = memoryStorage();
    storage.data.set(KEY, "{not json");
    const runner = fakeRunner(); // its import throws on bad JSON
    expect(restoreWorkspace(runner, storage, KEY)).toBe(false);
    expect(runner.layout).toBe("default");
  });

  test("no storage, or a bundle without the pane API, is a no-op", () => {
    const runner = fakeRunner();
    runner.edit("a");
    expect(new WorkspaceSaver(runner, null, KEY).maybeSave(0)).toBe(false);
    expect(restoreWorkspace(runner, null, KEY)).toBe(false);
    const old = {}; // a bundle built before the pane workspace existed
    expect(new WorkspaceSaver(old, memoryStorage(), KEY).maybeSave(0)).toBe(false);
    expect(restoreWorkspace(old, memoryStorage(), KEY)).toBe(false);
  });
});

describe("pane pointer routing (bd-ers)", () => {
  function recordingRunner(accepts: boolean, capture = true) {
    const calls: string[] = [];
    return {
      calls,
      panePointerDownAt: (id: number, b: number, x: number, y: number, m: number) => {
        calls.push(`down(${id},${b},${x},${y},${m})`);
        return {
          accepted: accepts,
          capture_command: capture ? { kind: "acquire" as const, pointer_id: id } : null,
        };
      },
      panePointerMoveAt: (id: number, x: number, y: number) => {
        calls.push(`move(${id},${x},${y})`);
        return { accepted: true };
      },
      panePointerUpAt: (id: number, b: number, x: number, y: number) => {
        calls.push(`up(${id},${b},${x},${y})`);
        return { accepted: true };
      },
      panePointerCancel: (id: number) => {
        calls.push(`cancel(${id})`);
        return { accepted: true };
      },
      panePointerCaptureAcquired: (id: number) => {
        calls.push(`captured(${id})`);
        return { accepted: true };
      },
    };
  }

  test("a press the pane layer accepts is followed through move and release", () => {
    const runner = recordingRunner(true);
    const router = new PanePointerRouter(runner);
    expect(router.down(0, 40, 20, 0)).toBe(true);
    expect(router.isActive).toBe(true);
    router.move(35, 20, 0);
    router.up(0, 30, 20, 0);
    expect(router.isActive).toBe(false);
    expect(runner.calls).toEqual([
      "down(1,0,40,20,0)",
      "captured(1)",
      "move(1,35,20)",
      "up(1,0,30,20)",
    ]);
  });

  test("a press the pane layer declines sends nothing more", () => {
    const runner = recordingRunner(false);
    const router = new PanePointerRouter(runner);
    expect(router.down(0, 5, 5, 0)).toBe(false);
    router.move(6, 5, 0);
    router.up(0, 6, 5, 0);
    expect(runner.calls).toEqual(["down(1,0,5,5,0)"]);
  });

  test("a bundle without the pane API is a no-op", () => {
    const router = new PanePointerRouter({});
    expect(router.down(0, 1, 1, 0)).toBe(false);
    router.move(2, 1, 0);
    router.up(0, 2, 1, 0);
    expect(router.isActive).toBe(false);
  });
});
