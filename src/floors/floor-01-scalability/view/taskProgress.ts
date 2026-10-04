import type { FloorContext } from "../../../core/contracts";
import { tasks } from "../definition/tasks";
import type { F01QuestProgress } from "./runtime";

export const trackQuestTasks = (
  ctx: FloorContext,
  quest: F01QuestProgress,
): void => {
  const canonical =
    ctx.progression.resultFor(ctx.floorOrder)?.quality === "canonical";
  ctx.hud.trackTask(tasks.rhea, quest.hasMetRhea || canonical);
  if (!quest.hasMetRhea && !canonical) return;
  ctx.hud.trackTask(tasks.workstation, quest.hasOpenedConsole || canonical);
  if (!quest.hasOpenedConsole && !canonical) return;
  ctx.hud.trackTask(tasks.solve, canonical);
  if (quest.latestResult || canonical) {
    ctx.hud.trackTask(
      tasks.debrief,
      quest.latestResult
        ? !quest.needsDebrief
        : canonical && !ctx.progression.handoffPending(ctx.floorOrder),
    );
  }
  if (
    quest.handoffReady ||
    (canonical && !ctx.progression.handoffPending(ctx.floorOrder))
  ) {
    ctx.hud.trackTask(tasks.upstairs);
  }
};
