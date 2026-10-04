import type { ProgressionState } from "../state/progression";

export type FloorLockReason =
  "orientation" | "canonical" | "debrief" | "previousFloor";

export const handoffFlagFor = (order: number): string =>
  `floor${order}.handoff`;

export const floorLockReason = (
  order: number,
  state: ProgressionState,
): FloorLockReason | undefined => {
  if (order > 0 && state.floorResults[0]?.quality !== "canonical")
    return "orientation";
  if (order === 2) {
    if (state.floorResults[1]?.quality !== "canonical") return "canonical";
    if (state.flags[handoffFlagFor(1)] === "pending") return "debrief";
  }
  return order > state.unlockedFloor ? "previousFloor" : undefined;
};
