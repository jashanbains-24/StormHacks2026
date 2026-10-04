import {
  FLOOR_CONTRACT_VERSION,
  type DiscoveredFloor,
  type FloorModule,
} from "../contracts";

type FloorEntryModule = {
  default?: FloorModule;
  floor?: FloorModule;
};

const discoveredEntries = import.meta.glob<FloorEntryModule>(
  "../../floors/floor-*/index.ts",
  { eager: true },
);

const orderFromPath = (path: string): number => {
  const match = path.match(/\/floor-(\d+)-[^/]+\/index\.ts$/);
  if (!match) throw new Error(`Invalid floor folder name: ${path}`);
  return Number(match[1]);
};

const floorFromEntry = (path: string, entry: FloorEntryModule): FloorModule => {
  const floor = entry.default ?? entry.floor;
  if (!floor) {
    throw new Error(`${path} must export a default FloorModule`);
  }
  return floor;
};

const assertPrefix = (
  floor: FloorModule,
  value: string,
  separator: "." | "_" | ":",
  kind: string,
): void => {
  if (!value.startsWith(`${floor.id}${separator}`)) {
    throw new Error(
      `${floor.id} ${kind} "${value}" must start with "${floor.id}${separator}"`,
    );
  }
};

export const validateFloor = (floor: FloorModule, folder: string): void => {
  if (floor.contractVersion !== FLOOR_CONTRACT_VERSION) {
    throw new Error(
      `${folder} uses floor contract ${floor.contractVersion}; expected ${FLOOR_CONTRACT_VERSION}`,
    );
  }
  if (!/^f\d{2}$/.test(floor.id)) {
    throw new Error(`${folder} has invalid id "${floor.id}"`);
  }
  if (!floor.title || !floor.category || !floor.definition || !floor.view) {
    throw new Error(`${floor.id} is missing required contract fields`);
  }
  if (
    typeof floor.view.createLayout !== "function" ||
    typeof floor.view.createBuildUI !== "function"
  ) {
    throw new Error(`${floor.id} must provide layout and build UI factories`);
  }

  const lines = [
    ...(floor.definition.content.managerAlert
      ? [floor.definition.content.managerAlert]
      : []),
    ...floor.definition.content.specialistHints,
    ...(floor.definition.content.completionDialogue
      ? [floor.definition.content.completionDialogue]
      : []),
  ];
  lines.forEach((line) => assertPrefix(floor, line.id, "_", "dialogue id"));
  floor.definition.content.glossary.forEach((entry) =>
    assertPrefix(floor, entry.id, ".", "glossary id"),
  );
  for (const line of lines) {
    for (const glossaryId of line.glossaryIds ?? []) {
      assertPrefix(floor, glossaryId, ".", "glossary reference");
      if (
        !floor.definition.content.glossary.some(
          (entry) => entry.id === glossaryId,
        )
      ) {
        throw new Error(
          `${floor.id} dialogue ${line.id} references missing glossary term ${glossaryId}`,
        );
      }
    }
  }
  for (const asset of [
    ...floor.assets.images,
    ...floor.assets.spritesheets,
    ...floor.assets.audio,
  ]) {
    assertPrefix(floor, asset.key, ".", "asset key");
  }
};

const discoverFloors = (): DiscoveredFloor[] => {
  const floors = Object.entries(discoveredEntries).map(([path, entry]) => {
    const order = orderFromPath(path);
    const floor = floorFromEntry(path, entry);
    const folder = path.slice(0, path.lastIndexOf("/"));
    validateFloor(floor, folder);
    return { order, folder, module: floor };
  });

  const ids = new Set<string>();
  const orders = new Set<number>();
  floors.forEach(({ module, order }) => {
    if (ids.has(module.id)) throw new Error(`Duplicate floor id ${module.id}`);
    if (orders.has(order)) throw new Error(`Duplicate floor order ${order}`);
    ids.add(module.id);
    orders.add(order);
  });
  return floors.sort((left, right) => left.order - right.order);
};

const floors = discoverFloors();

export const getFloors = (): readonly DiscoveredFloor[] => floors;

export const getFloorByOrder = (order: number): DiscoveredFloor => {
  const floor = floors.find((candidate) => candidate.order === order);
  if (!floor) throw new Error(`Unknown floor order ${order}`);
  return floor;
};

export const getFloorById = (id: string): DiscoveredFloor => {
  const floor = floors.find((candidate) => candidate.module.id === id);
  if (!floor) throw new Error(`Unknown floor id ${id}`);
  return floor;
};

export const getNextFloor = (order: number): DiscoveredFloor | undefined => {
  const index = floors.findIndex((candidate) => candidate.order === order);
  return index === -1 ? undefined : floors[index + 1];
};
