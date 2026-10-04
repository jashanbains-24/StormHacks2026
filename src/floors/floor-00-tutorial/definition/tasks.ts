import type { FloorTask } from "../../../core/contracts";

export const tasks = {
  maya: { id: "f00.task.maya", label: "Check in with Maya at the front desk" },
  form: {
    id: "f00.task.form",
    label: "Complete your name and preliminary questions",
  },
  upstairs: {
    id: "f00.task.upstairs",
    label: "Take the elevator to Floor 1",
    targetFloor: 1,
  },
} satisfies Record<string, FloorTask>;
