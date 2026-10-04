import { describe, expect, it, vi } from "vitest";
import type { FloorContext } from "../../src/core/contracts";
import { TaskChecklistStore } from "../../src/state/taskChecklist";
import { F01QuestProgress } from "../../src/floors/floor-01-scalability/view/runtime";
import { trackQuestTasks } from "../../src/floors/floor-01-scalability/view/taskProgress";
import { tasks } from "../../src/floors/floor-01-scalability/definition/tasks";
import { taskUpdatesForStep } from "../../src/floors/floor-02-storage/definition/tasks";

describe("task checklist", () => {
  it("restores a genuine completed handoff with consistent quest guidance", () => {
    const quest = new F01QuestProgress(false, true);
    expect(quest.hasMetRhea).toBe(true);
    expect(quest.hasOpenedConsole).toBe(true);
    expect(quest.needsDebrief).toBe(false);
    expect(quest.handoffReady).toBe(true);
    expect(quest.guidanceTarget).toBe("elevator");
  });

  it("reopens repeatable reviews when another attempt requires one", () => {
    const store = new TaskChecklistStore();
    store.track(1, tasks.debrief, true);
    store.track(1, tasks.debrief);
    expect(store.snapshot[0].completed).toBe(false);
    store.track(1, tasks.debrief, true);
    expect(store.snapshot[0].completed).toBe(true);
  });

  it("reveals storage assignments sequentially and checks off only cleared stages", () => {
    const store = new TaskChecklistStore();
    expect(taskUpdatesForStep("standby")).toEqual([]);
    for (const step of [
      "dana",
      "sam",
      "priya",
      "danaWrap",
      "resolved",
    ] as const) {
      taskUpdatesForStep(step).forEach(({ task, completed }) =>
        store.track(2, task, completed),
      );
      const stage = ["dana", "sam", "priya", "danaWrap", "resolved"].indexOf(
        step,
      );
      expect(store.snapshot).toHaveLength(Math.min(stage + 1, 4));
      expect(store.snapshot.filter((entry) => entry.completed)).toHaveLength(
        stage,
      );
    }
  });

  it("deduplicates stable IDs, preserves achievements on retries, and protects snapshots", () => {
    const store = new TaskChecklistStore();
    const task = { id: "f01.task.solve", label: "Pass the test" };
    expect(store.track(1, task)).toBe(true);
    expect(store.track(1, task)).toBe(false);
    store.track(1, task, true);
    expect(store.track(1, task, false)).toBe(false);
    const snapshot = store.snapshot;
    snapshot[0].completed = false;
    expect(store.snapshot).toEqual([
      { ...task, floorOrder: 1, completed: true },
    ]);
    store.reset();
    expect(store.snapshot).toEqual([]);
  });

  it("checks only discovered travel tasks for the floor actually reached", () => {
    const store = new TaskChecklistStore();
    store.track(0, {
      id: "f00.task.travel",
      label: "Go upstairs",
      targetFloor: 1,
    });
    store.track(1, { id: "f01.task.solve", label: "Solve incident" });
    expect(store.arrive(2)).toBe(false);
    expect(store.arrive(1)).toBe(true);
    expect(store.arrive(1)).toBe(false);
    expect(store.snapshot.map((entry) => entry.completed)).toEqual([
      true,
      false,
    ]);
  });

  it("discovers Floor 1 work at its real milestones and keeps partial attempts unfinished", () => {
    const store = new TaskChecklistStore();
    const ctx = {
      floorOrder: 1,
      hud: {
        trackTask: (
          task: Parameters<TaskChecklistStore["track"]>[1],
          completed?: boolean,
        ) => store.track(1, task, completed),
      },
      progression: { resultFor: vi.fn(), handoffPending: () => false },
    } as unknown as FloorContext;
    const quest = new F01QuestProgress();
    trackQuestTasks(ctx, quest);
    expect(store.snapshot.map((entry) => entry.id)).toEqual([tasks.rhea.id]);
    quest.completeIntroduction();
    quest.finishIntroduction();
    trackQuestTasks(ctx, quest);
    expect(store.snapshot.map((entry) => entry.id)).toEqual([
      tasks.rhea.id,
      tasks.workstation.id,
    ]);
    quest.markConsoleOpened();
    quest.recordResult({
      id: "under-redundant",
      quality: "partial",
      title: "Retry",
      message: "Retry",
      debtNotes: [],
    });
    trackQuestTasks(ctx, quest);
    quest.finishDebrief();
    trackQuestTasks(ctx, quest);
    expect(
      store.snapshot.find((entry) => entry.id === tasks.solve.id)?.completed,
    ).toBe(false);
    expect(
      store.snapshot.find((entry) => entry.id === tasks.debrief.id)?.completed,
    ).toBe(true);
    expect(store.snapshot.some((entry) => entry.id === tasks.upstairs.id)).toBe(
      false,
    );
    vi.mocked(ctx.progression.resultFor).mockReturnValue({
      quality: "canonical",
      debtNotes: [],
    });
    quest.recordResult({
      id: "canonical",
      quality: "canonical",
      title: "Done",
      message: "Done",
      debtNotes: [],
    });
    trackQuestTasks(ctx, quest);
    expect(
      store.snapshot.find((entry) => entry.id === tasks.debrief.id)?.completed,
    ).toBe(false);
    quest.finishDebrief();
    trackQuestTasks(ctx, quest);
    expect(
      store.snapshot.find((entry) => entry.id === tasks.solve.id)?.completed,
    ).toBe(true);
    expect(
      store.snapshot.find((entry) => entry.id === tasks.upstairs.id)?.completed,
    ).toBe(false);
  });
});
