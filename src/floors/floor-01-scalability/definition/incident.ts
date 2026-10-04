import type { FloorIncidentDefinition } from "../../../core/contracts";

export const incident: FloorIncidentDefinition = {
  title: "A traffic spike is cooking the company's only server.",
  availableComponents: [
    { type: "loadBalancer", max: 1 },
    { type: "server", max: 5 },
  ],
  canonicalServerCount: 3,
};
