import { describe, expect, it } from "vitest";

import { ProgressionStore } from "../../src/state/progression";

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

  it("keeps persisted completion separate from this session's resolution", () => {
    const storage = new MemoryStorage();
    const store = new ProgressionStore(storage);
    store.completeFloor(1, "canonical", []);

    expect(store.wasCompletedThisSession(1)).toBe(true);
    const restored = new ProgressionStore(storage);
    expect(restored.snapshot.floorResults[1]?.quality).toBe("canonical");
    expect(restored.wasCompletedThisSession(1)).toBe(false);
  });
});
