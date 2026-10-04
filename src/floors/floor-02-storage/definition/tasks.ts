import type { FloorTask } from "../../../core/contracts";
import type { IncidentStep } from "./incidentFlow";

export const tasks = {
  dana: { id: "f02.task.dana", label: "Help Dana reduce the database load" },
  sam: { id: "f02.task.sam", label: "Help Sam choose a consistent cache" },
  priya: {
    id: "f02.task.priya",
    label: "Help Priya balance freshness and database load",
  },
  wrap: {
    id: "f02.task.wrap",
    label: "Return to Dana to wrap up the incident",
  },
} satisfies Record<string, FloorTask>;

export const taskUpdatesForStep = (
  step: IncidentStep,
): { task: FloorTask; completed: boolean }[] => {
  const stage = ["dana", "sam", "priya", "danaWrap", "resolved"].indexOf(step);
  return [tasks.dana, tasks.sam, tasks.priya, tasks.wrap]
    .slice(0, stage + 1)
    .map((task, index) => ({ task, completed: index < stage }));
};
