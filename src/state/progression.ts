import type { DesignQuality } from "../sim/types";

export interface FloorResult {
  quality: DesignQuality;
  debtNotes: string[];
  completedAt: string;
}

export interface ProgressionState {
  unlockedFloor: number;
  floorResults: Partial<Record<number, FloorResult>>;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_KEY = "uptime.progression.v1";

export const DEFAULT_PROGRESSION: ProgressionState = {
  unlockedFloor: 1,
  floorResults: {},
};

const browserStorage = (): StorageLike | undefined => {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
};

export class ProgressionStore {
  private state: ProgressionState;
  private readonly sessionResults = new Map<number, DesignQuality>();

  constructor(private readonly storage = browserStorage()) {
    this.state = this.load();
  }

  get snapshot(): ProgressionState {
    return structuredClone(this.state);
  }

  wasCompletedThisSession(floorId: number): boolean {
    return this.sessionResults.has(floorId);
  }

  wasCanonicallyCompletedThisSession(floorId: number): boolean {
    return this.sessionResults.get(floorId) === "canonical";
  }

  completeFloor(
    floorId: number,
    quality: DesignQuality,
    debtNotes: string[],
  ): ProgressionState {
    if (quality === "failed") return this.snapshot;

    this.state = {
      unlockedFloor: Math.max(this.state.unlockedFloor, floorId + 1),
      floorResults: {
        ...this.state.floorResults,
        [floorId]: {
          quality,
          debtNotes: [...debtNotes],
          completedAt: new Date().toISOString(),
        },
      },
    };
    this.sessionResults.set(floorId, quality);
    this.persist();
    return this.snapshot;
  }

  reset(): void {
    this.state = structuredClone(DEFAULT_PROGRESSION);
    this.sessionResults.clear();
    this.storage?.removeItem(STORAGE_KEY);
  }

  private load(): ProgressionState {
    const serialized = this.storage?.getItem(STORAGE_KEY);
    if (!serialized) return structuredClone(DEFAULT_PROGRESSION);
    try {
      const parsed = JSON.parse(serialized) as ProgressionState;
      if (
        typeof parsed.unlockedFloor !== "number" ||
        typeof parsed.floorResults !== "object"
      ) {
        return structuredClone(DEFAULT_PROGRESSION);
      }
      return parsed;
    } catch {
      return structuredClone(DEFAULT_PROGRESSION);
    }
  }

  private persist(): void {
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}

export const progression = new ProgressionStore();
