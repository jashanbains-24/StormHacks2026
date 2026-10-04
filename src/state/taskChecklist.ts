import type { FloorTask } from "../core/contracts";

export interface ChecklistEntry extends FloorTask {
  floorOrder: number;
  completed: boolean;
}

/** Discovered tasks for this game; a retry does not erase earlier achievements. */
export class TaskChecklistStore {
  private readonly entries = new Map<string, ChecklistEntry>();

  get snapshot(): ChecklistEntry[] {
    return [...this.entries.values()].map((entry) => ({ ...entry }));
  }

  track(floorOrder: number, task: FloorTask, completed = false): boolean {
    const previous = this.entries.get(task.id);
    const next = {
      ...task,
      floorOrder,
      completed:
        completed || (!task.repeatable && previous?.completed) || false,
    };
    if (
      previous?.label === next.label &&
      previous.floorOrder === next.floorOrder &&
      previous.targetFloor === next.targetFloor &&
      previous.repeatable === next.repeatable &&
      previous.completed === next.completed
    )
      return false;
    this.entries.set(task.id, next);
    return true;
  }

  arrive(floorOrder: number): boolean {
    let changed = false;
    for (const entry of this.entries.values()) {
      if (entry.targetFloor !== floorOrder || entry.completed) continue;
      entry.completed = true;
      changed = true;
    }
    return changed;
  }

  reset(): void {
    this.entries.clear();
  }
}
