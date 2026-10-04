import type { SystemDesign } from "../sim/types";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_KEY = "uptime.floor1.design.v1";

const browserStorage = (): StorageLike | undefined =>
  typeof window === "undefined" ? undefined : window.localStorage;

const isSystemDesign = (value: unknown): value is SystemDesign => {
  if (!value || typeof value !== "object") return false;
  const design = value as Partial<SystemDesign>;
  if (!Array.isArray(design.nodes) || !Array.isArray(design.connections)) {
    return false;
  }

  const validNodes = design.nodes.every(
    (node) =>
      typeof node?.id === "string" &&
      [
        "client",
        "loadBalancer",
        "server",
        "source",
        "connector",
        "destination",
      ].includes(node.type) &&
      typeof node.x === "number" &&
      typeof node.y === "number",
  );
  const validConnections = design.connections.every(
    (connection) =>
      typeof connection?.from === "string" && typeof connection.to === "string",
  );
  const roots = design.nodes.filter(
    (node) => node.type === "client" || node.type === "source",
  );
  return validNodes && validConnections && roots.length === 1;
};

export class BuildDesignStore {
  constructor(
    private readonly storage = browserStorage(),
    private readonly storageKey = STORAGE_KEY,
  ) {}

  load(): SystemDesign | undefined {
    const serialized = this.storage?.getItem(this.storageKey);
    if (!serialized) return undefined;
    try {
      const design: unknown = JSON.parse(serialized);
      return isSystemDesign(design) ? structuredClone(design) : undefined;
    } catch {
      return undefined;
    }
  }

  save(design: SystemDesign): void {
    this.storage?.setItem(this.storageKey, JSON.stringify(design));
  }

  reset(): void {
    this.storage?.removeItem(this.storageKey);
  }
}

export const buildDesignStore = new BuildDesignStore();
export const tutorialBuildDesignStore = new BuildDesignStore(
  browserStorage(),
  "uptime.tutorial.design.v1",
);
