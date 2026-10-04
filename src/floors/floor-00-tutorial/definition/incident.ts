import type { FloorIncidentDefinition } from "../../../core/contracts";

export const incident: FloorIncidentDefinition = {
  title: "Practice connecting a source to destinations.",
  buildMode: "tutorial",
  availableComponents: [
    { type: "connector", max: 999 },
    { type: "destination", max: 999 },
  ],
};
