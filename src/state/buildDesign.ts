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
      ["client", "loadBalancer", "server"].includes(node.type) &&
      typeof node.x === "number" &&
      typeof node.y === "number",
  );
  const validConnections = design.connections.every(
    (connection) =>
      typeof connection?.from === "string" && typeof connection.to === "string",
  );
  const clients = design.nodes.filter((node) => node.type === "client");
  return validNodes && validConnections && clients.length === 1;
};

export class BuildDesignStore {
  constructor(private readonly storage = browserStorage()) {}

  load(): SystemDesign | undefined {
    const serialized = this.storage?.getItem(STORAGE_KEY);
    if (!serialized) return undefined;
    try {
      const design: unknown = JSON.parse(serialized);
      return isSystemDesign(design) ? structuredClone(design) : undefined;
    } catch {
      return undefined;
    }
  }

  save(design: SystemDesign): void {
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(design));
  }

  reset(): void {
    this.storage?.removeItem(STORAGE_KEY);
  }

  clearAfterEvaluatedAttempt(evaluated: boolean): void {
    if (evaluated) this.reset();
  }
}

export const buildDesignStore = new BuildDesignStore();
