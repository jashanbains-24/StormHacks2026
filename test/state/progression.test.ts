import { describe, expect, it } from "vitest";

import { floorShowsAlert, ProgressionStore } from "../../src/state/progression";
import { floorLockReason } from "../../src/sim/floorAccess";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe("ProgressionStore", () => {
  it("gates each upward destination until its prerequisite is actually complete", () => {
    const store = new ProgressionStore(new MemoryStorage());
    expect(floorLockReason(0, store.snapshot)).toBeUndefined();
    expect(floorLockReason(1, store.snapshot)).toBe("orientation");
    expect(floorLockReason(2, store.snapshot)).toBe("orientation");
    store.completeFloor(0, "canonical", []);
    expect(floorLockReason(1, store.snapshot)).toBeUndefined();
    expect(floorLockReason(2, store.snapshot)).toBe("canonical");
    store.completeFloor(1, "partial", ["Missing redundancy"]);
    expect(floorLockReason(2, store.snapshot)).toBe("canonical");
    store.completeFloor(1, "canonical", []);
    expect(floorLockReason(2, store.snapshot)).toBe("debrief");
    store.confirmHandoff(1);
    expect(floorLockReason(2, store.snapshot)).toBeUndefined();
  });

  it("clears saved results, flags, and session achievements for a new game", () => {
    const storage = new MemoryStorage();
    const store = new ProgressionStore(storage);
    store.completeFloor(0, "canonical", []);
    store.completeFloor(1, "canonical", []);
    store.confirmHandoff(1);
    store.reset();
    expect(store.snapshot).toEqual({
      unlockedFloor: 1,
      floorResults: {},
      flags: {},
    });
    expect(store.wasCompletedThisSession(1)).toBe(false);
    expect(new ProgressionStore(storage).snapshot).toEqual(store.snapshot);
    expect(floorLockReason(2, store.snapshot)).toBe("orientation");
  });

  it("keeps partial attempts locked while preserving their tech debt", () => {
    const storage = new MemoryStorage();
    const store = new ProgressionStore(storage);
    store.completeFloor(1, "partial", ["No spare capacity."]);

    const restored = new ProgressionStore(storage).snapshot;
    expect(restored.unlockedFloor).toBe(1);
    expect(floorLockReason(2, restored)).toBe("canonical");
    expect(restored.floorResults[1]).toMatchObject({
      quality: "partial",
      debtNotes: ["No spare capacity."],
    });
    store.confirmHandoff(1);
    expect(store.snapshot.unlockedFloor).toBe(1);
  });

  it("does not advance failed attempts", () => {
    const store = new ProgressionStore(new MemoryStorage());
    store.completeFloor(1, "failed", []);
    expect(store.snapshot).toMatchObject({
      unlockedFloor: 1,
      floorResults: {},
    });
  });

  it("keeps persisted completion separate from this session's resolution", () => {
    const storage = new MemoryStorage();
    const store = new ProgressionStore(storage);
    store.completeFloor(0, "canonical", []);
    store.completeFloor(1, "canonical", []);

    expect(store.wasCompletedThisSession(1)).toBe(true);
    const restored = new ProgressionStore(storage);
    expect(restored.snapshot.floorResults[1]?.quality).toBe("canonical");
    expect(restored.wasCompletedThisSession(1)).toBe(false);
    expect(restored.handoffPending(1)).toBe(true);
    expect(floorLockReason(2, restored.snapshot)).toBe("debrief");
    restored.confirmHandoff(1);
    const afterDebrief = new ProgressionStore(storage);
    expect(afterDebrief.snapshot.unlockedFloor).toBe(2);
    expect(floorLockReason(2, afterDebrief.snapshot)).toBeUndefined();
  });

  it("distinguishes a tech-debt result from a canonical resolution", () => {
    const store = new ProgressionStore(new MemoryStorage());
    store.completeFloor(1, "partial", ["No spare capacity."]);

    expect(store.wasCompletedThisSession(1)).toBe(true);
    expect(store.wasCanonicallyCompletedThisSession(1)).toBe(false);

    store.completeFloor(0, "canonical", []);
    store.completeFloor(1, "canonical", []);
    expect(store.wasCanonicallyCompletedThisSession(1)).toBe(true);
  });

  it("keeps the current visit in memory and clears the data floor on reload", () => {
    const storage = new MemoryStorage();
    const store = new ProgressionStore(storage);
    store.completeFloor(0, "canonical", []);
    store.completeFloor(1, "canonical", []);
    store.confirmHandoff(1);
    store.setFlag("floor2.cacheChoice", "local");
    store.setFlag("note.ripple", "seen");
    store.completeFloor(2, "canonical", []);

    expect(store.flag("floor2.cacheChoice")).toBe("local");
    expect(store.snapshot.floorResults[2]?.quality).toBe("canonical");

    const restored = new ProgressionStore(storage).snapshot;
    expect(restored.unlockedFloor).toBe(2);
    expect(restored.floorResults[1]?.quality).toBe("canonical");
    expect(restored.floorResults[2]).toBeUndefined();
    expect(restored.flags["floor2.cacheChoice"]).toBeUndefined();
    expect(restored.flags["note.ripple"]).toBe("seen");
  });

  it("migrates old saves by requiring canonical quality for Floor 2", () => {
    for (const quality of ["partial", "canonical"] as const) {
      const storage = new MemoryStorage();
      storage.setItem(
        "uptime.progression.v1",
        JSON.stringify({
          unlockedFloor: 2,
          floorResults: {
            1: { quality, debtNotes: [], completedAt: "2026-10-03" },
          },
          flags: {},
        }),
      );
      const restored = new ProgressionStore(storage).snapshot;
      expect(restored.unlockedFloor).toBe(quality === "canonical" ? 2 : 1);
      expect(floorLockReason(2, restored)).toBe(
        quality === "canonical" ? undefined : "canonical",
      );
    }
  });

  it("keeps a completed canonical unlock when revisiting and trying a partial design", () => {
    const storage = new MemoryStorage();
    const store = new ProgressionStore(storage);
    store.completeFloor(0, "canonical", []);
    store.completeFloor(1, "canonical", []);
    store.confirmHandoff(1);
    store.completeFloor(1, "partial", ["No spare capacity."]);
    expect(store.wasCanonicallyCompletedThisSession(1)).toBe(false);
    const restored = new ProgressionStore(storage).snapshot;
    expect(restored.floorResults[1]?.quality).toBe("canonical");
    expect(floorLockReason(2, restored)).toBeUndefined();
  });

  it("keeps the data floor quiet until Floor 1 is solved", () => {
    const quiet = {
      unlockedFloor: 1,
      floorResults: {},
      flags: {},
    };
    const incident = {
      unlockedFloor: 2,
      floorResults: {
        1: {
          quality: "canonical" as const,
          debtNotes: [],
          completedAt: "2026-10-03T00:00:00.000Z",
        },
      },
      flags: {},
    };

    expect(floorShowsAlert(2, quiet)).toBe(false);
    expect(floorShowsAlert(0, quiet)).toBe(true);
    expect(floorShowsAlert(2, incident)).toBe(true);
    expect(floorShowsAlert(1, incident)).toBe(false);
  });
});
