import type { ComponentType } from "../sim/types";

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  shortLabel: string;
  description: string;
}

export const COMPONENTS: Record<ComponentType, ComponentDefinition> = {
  client: {
    type: "client",
    label: "Clients",
    shortLabel: "USERS",
    description: "The fixed source of incoming traffic.",
  },
  loadBalancer: {
    type: "loadBalancer",
    label: "Load Balancer",
    shortLabel: "LB",
    description: "Splits traffic across healthy servers.",
  },
  server: {
    type: "server",
    label: "Server",
    shortLabel: "SERVER",
    description: "Handles up to 40 requests per second.",
  },
};

export const BUILD_COPY = {
  title: "INCIDENT ARCHITECTURE CONSOLE",
  subtitle: "Drag components onto the canvas. Drag an OUT port to an IN port.",
  run: "RUN STRESS TEST",
  reset: "RESET DESIGN",
  clearWires: "CLEAR WIRES",
  saved: "SAVED LOCALLY",
  wiresCleared: "All connections removed.",
  edit: "EDIT DESIGN",
  close: "RETURN TO OFFICE",
  remove: "Right-click a component to remove it",
  invalidConnection: "That connection would make the architecture cry.",
  duplicateConnection: "Those components are already connected.",
  paletteFull: "Component limit reached for this floor.",
} as const;
