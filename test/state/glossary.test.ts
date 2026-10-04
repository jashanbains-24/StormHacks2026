import { describe, expect, it, vi } from "vitest";

import { GlossaryStore, type LearnedTerm } from "../../src/state/glossary";

const terms: LearnedTerm[] = [
  {
    id: "f01.capacity",
    floorOrder: 1,
    term: "capacity",
    definition: "How much traffic a machine can handle.",
  },
  {
    id: "f02.cache",
    floorOrder: 2,
    term: "Cache",
    definition: "A temporary copy of data.",
  },
];

describe("shared learned glossary", () => {
  it("retains discovery order across floors, deduplicates terms, and excludes unknown entries", () => {
    const store = new GlossaryStore();
    store.register(terms.slice(0, 1));
    store.markOpened("f01.capacity");
    store.markOpened("f02.cache");
    store.markOpened("missing");
    expect(store.snapshot).toEqual([terms[0]]);
    store.register(terms.slice(1));
    store.markOpened("f01.capacity");
    expect(store.snapshot).toEqual(terms);
    const snapshot = store.snapshot;
    snapshot[0].term = "changed";
    expect(store.snapshot[0].term).toBe("capacity");
  });

  it("notifies on discoveries and new-game reset, and releases subscriptions", () => {
    const store = new GlossaryStore();
    store.register(terms);
    const refresh = vi.fn();
    const unsubscribe = store.subscribe(refresh);
    store.markOpened("f01.capacity");
    store.markOpened("f01.capacity");
    expect(refresh).toHaveBeenCalledOnce();
    store.reset();
    expect(store.snapshot).toEqual([]);
    expect(store.hasOpened("f01.capacity")).toBe(false);
    expect(refresh).toHaveBeenCalledTimes(2);
    unsubscribe();
    store.markOpened("f02.cache");
    expect(store.snapshot).toEqual([terms[1]]);
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
