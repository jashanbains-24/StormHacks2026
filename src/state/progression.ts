import type { DesignQuality } from "../sim/types";

export interface FloorResult {
  quality: DesignQuality;
  debtNotes: string[];
  completedAt: string;
}

export interface ProgressionState {
  unlockedFloor: number;
  floorResults: Partial<Record<number, FloorResult>>;
  flags: Record<string, string>;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_KEY = "uptime.progression.v1";
const DATA_FLOOR_ORDER = 2;

export const floorShowsAlert = (
  floorOrder: number,
  state: ProgressionState,
): boolean => {
  const floor1Solved = state.floorResults[1] !== undefined;
  if (floorOrder === DATA_FLOOR_ORDER) {
    return floor1Solved && state.floorResults[DATA_FLOOR_ORDER] === undefined;
  }
  return !floor1Solved;
};

const withoutDataFloorProgress = (
  state: ProgressionState,
): ProgressionState => {
  const floorResults = { ...state.floorResults };
  delete floorResults[DATA_FLOOR_ORDER];
  const flags = Object.fromEntries(
    Object.entries(state.flags).filter(([key]) => !key.startsWith("floor2.")),
  );
  const floor1Solved = floorResults[1] !== undefined;
  return {
    unlockedFloor: Math.min(state.unlockedFloor, floor1Solved ? 2 : 1),
    floorResults,
    flags,
  };
};

export const DEFAULT_PROGRESSION: ProgressionState = {
  unlockedFloor: 1,
  floorResults: {},
  flags: {},
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
    this.persist();
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
      flags: { ...this.state.flags },
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

  flag(name: string): string | undefined {
    return this.state.flags[name];
  }

  setFlag(name: string, value: string): ProgressionState {
    this.state = {
      ...this.state,
      flags: {
        ...this.state.flags,
        [name]: value,
      },
    };
    this.persist();
    return this.snapshot;
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
      return withoutDataFloorProgress({
        ...parsed,
        flags:
          parsed.flags && typeof parsed.flags === "object" ? parsed.flags : {},
      });
    } catch {
      return structuredClone(DEFAULT_PROGRESSION);
    }
  }

  private persist(): void {
    this.storage?.setItem(
      STORAGE_KEY,
      JSON.stringify(withoutDataFloorProgress(this.state)),
    );
  }
}

export const progression = new ProgressionStore();
