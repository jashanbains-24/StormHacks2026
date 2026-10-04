import type { FloorTask } from "../../../core/contracts";

export const tasks = {
  rhea: {
    id: "f01.task.rhea",
    label: "Meet Rhea and get your incident briefing",
  },
  workstation: {
    id: "f01.task.workstation",
    label: "Open your assigned workstation",
  },
  solve: {
    id: "f01.task.solve",
    label: "Build a stable, redundant request path and pass the stress test",
  },
  debrief: {
    id: "f01.task.debrief",
    label: "Review your attempt with Rhea",
    repeatable: true,
  },
  upstairs: {
    id: "f01.task.upstairs",
    label: "Take the elevator to Floor 2",
    targetFloor: 2,
  },
} satisfies Record<string, FloorTask>;
