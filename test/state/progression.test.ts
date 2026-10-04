import { describe, expect, it } from "vitest";

import { floorShowsAlert, ProgressionStore } from "../../src/state/progression";

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
  it("unlocks the next floor and persists tech debt", () => {
    const storage = new MemoryStorage();
    const store = new ProgressionStore(storage);
    store.completeFloor(1, "partial", ["No spare capacity."]);

    const restored = new ProgressionStore(storage).snapshot;
    expect(restored.unlockedFloor).toBe(2);
    expect(restored.floorResults[1]).toMatchObject({
      quality: "partial",
      debtNotes: ["No spare capacity."],
    });
  });

  it("does not advance failed attempts", () => {
    const store = new ProgressionStore(new MemoryStorage());
    store.completeFloor(1, "failed", []);
    expect(store.snapshot).toMatchObject({
      unlockedFloor: 1,
      floorResults: {},
    });
  });

  it("keeps the current visit in memory and clears the data floor on reload", () => {
    const storage = new MemoryStorage();
    const store = new ProgressionStore(storage);
    store.completeFloor(1, "canonical", []);
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
