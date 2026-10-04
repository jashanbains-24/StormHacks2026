import type { FloorGlossaryEntry } from "../core/contracts";

export interface LearnedTerm extends FloorGlossaryEntry {
  floorOrder: number;
}

/** Terms opened during this game, independent of the currently displayed floor. */
export class GlossaryStore {
  private readonly catalogue = new Map<string, LearnedTerm>();
  private readonly opened = new Set<string>();
  private readonly listeners = new Set<() => void>();

  register(entries: readonly LearnedTerm[]): void {
    entries.forEach((entry) => this.catalogue.set(entry.id, { ...entry }));
    this.notify();
  }

  hasOpened(id: string): boolean {
    return this.opened.has(id);
  }

  markOpened(id: string): void {
    if (this.opened.has(id)) return;
    this.opened.add(id);
    this.notify();
  }

  get openedIds(): string[] {
    return [...this.opened];
  }

  get snapshot(): LearnedTerm[] {
    return this.openedIds.flatMap((id) => {
      const entry = this.catalogue.get(id);
      return entry ? [{ ...entry }] : [];
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(): void {
    this.opened.clear();
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const glossaryStore = new GlossaryStore();
