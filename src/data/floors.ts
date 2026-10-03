import type { ComponentType } from "../sim/types";

export interface FloorDefinition {
  id: number;
  category: string;
  incident: string | null;
  title: string;
  availableComponents: {
    type: ComponentType;
    max: number;
  }[];
}

export const FLOORS: FloorDefinition[] = [
  {
    id: 1,
    category: "Scalability / Load Distribution",
    incident: "A traffic spike is cooking the company's only server.",
    title: "Floor 1: Traffic Operations",
    availableComponents: [
      { type: "loadBalancer", max: 1 },
      { type: "server", max: 5 },
    ],
  },
  {
    id: 2,
    category: "Data Storage / Caching",
    incident: null,
    title: "Floor 2: Data Storage — Coming Soon",
    availableComponents: [],
  },
];

export const floorById = (id: number): FloorDefinition => {
  const floor = FLOORS.find((candidate) => candidate.id === id);
  if (!floor) {
    throw new Error(`Unknown floor ${id}`);
  }
  return floor;
};
