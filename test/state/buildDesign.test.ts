import { describe, expect, it } from "vitest";

import { BuildDesignStore } from "../../src/state/buildDesign";
import { makeDesign } from "../sim/fixtures";

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

describe("BuildDesignStore", () => {
  it("restores the last architecture without sharing mutable references", () => {
    const storage = new MemoryStorage();
    const store = new BuildDesignStore(storage);
    const design = makeDesign(3, true);

    store.save(design);
    const restored = store.load();
    restored!.nodes[0].x = 999;

    expect(store.load()).toEqual(design);
  });

  it("clears a saved architecture on reset", () => {
    const store = new BuildDesignStore(new MemoryStorage());
    store.save(makeDesign(3, true));
    store.reset();
    expect(store.load()).toBeUndefined();
  });

  it("ignores malformed saved data", () => {
    const storage = new MemoryStorage();
    storage.setItem("uptime.floor1.design.v1", '{"nodes":[],"connections":[]}');
    expect(new BuildDesignStore(storage).load()).toBeUndefined();
  });
});
