import type { FloorLockReason } from "../sim/floorAccess";

export const ELEVATOR_COPY = {
  title: "SELECT YOUR FLOOR",
  destination: "DESTINATION",
  empty: "Choose a floor below or use the number pad.",
  ready: "Press Enter or GO to travel.",
  current: "You are on this floor.",
  unknown: "That floor is not in this building.",
  controls: "Number keys / numpad • Enter to travel\nEsc or X to exit",
};

export const FLOOR_LOCK_MESSAGES: Record<FloorLockReason, string> = {
  canonical:
    "Solve Floor 1's load-balancer challenge with a stable, redundant architecture to unlock this floor.",
  debrief: "Return to Rhea on Floor 1 for your debrief before continuing.",
  previousFloor: "Complete the previous floor before continuing.",
};
