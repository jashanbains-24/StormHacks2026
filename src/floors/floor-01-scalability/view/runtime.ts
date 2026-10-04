import type { FloorContext, FloorDialogueLine } from "../../../core/contracts";
import type { RoamingNpcPlan } from "./plan";

type FloorNpcHandle = ReturnType<FloorContext["addNpc"]>;

export interface F01BuildResult {
  id: string;
  quality: "canonical" | "partial" | "failed";
  title: string;
  message: string;
  debtNotes: string[];
}

export type F01GuidanceTarget = "rhea" | "workstation" | "elevator";

export class F01QuestProgress {
  private introducedByRhea = false;
  private introductionDismissed = false;
  private consoleOpened = false;
  private awaitingDebrief = false;
  private elevatorHandoff = false;
  private result?: Pick<F01BuildResult, "id" | "quality">;
  private hintIndex = 0;

  constructor(pendingCanonicalDebrief = false) {
    if (!pendingCanonicalDebrief) return;
    this.introducedByRhea = true;
    this.introductionDismissed = true;
    this.consoleOpened = true;
    this.awaitingDebrief = true;
    this.result = { id: "canonical", quality: "canonical" };
  }

  get consoleUnlocked(): boolean {
    return this.introducedByRhea && !this.awaitingDebrief;
  }

  get hasMetRhea(): boolean {
    return this.introducedByRhea;
  }

  get hasOpenedConsole(): boolean {
    return this.consoleOpened;
  }

  get handoffReady(): boolean {
    return this.elevatorHandoff;
  }

  get latestResult(): Pick<F01BuildResult, "id" | "quality"> | undefined {
    return this.result;
  }

  get needsDebrief(): boolean {
    return this.awaitingDebrief;
  }

  get guidanceTarget(): F01GuidanceTarget | undefined {
    if (this.awaitingDebrief || !this.introducedByRhea) return "rhea";
    if (!this.introductionDismissed) return undefined;
    if (!this.consoleOpened) return "workstation";
    if (this.elevatorHandoff) return "elevator";
    return undefined;
  }

  completeIntroduction(): void {
    this.introducedByRhea = true;
  }

  finishIntroduction(): void {
    if (this.introducedByRhea) this.introductionDismissed = true;
  }

  markConsoleOpened(): void {
    this.consoleOpened = true;
  }

  nextHint(hints: FloorDialogueLine[]): FloorDialogueLine | undefined {
    if (hints.length === 0) return undefined;
    const hint = hints[Math.min(this.hintIndex, hints.length - 1)];
    this.hintIndex += 1;
    return hint;
  }

  recordResult(result: F01BuildResult): void {
    this.result = result;
    this.awaitingDebrief = true;
    this.elevatorHandoff = false;
  }

  finishDebrief(): void {
    if (!this.result) return;
    this.awaitingDebrief = false;
    this.elevatorHandoff = this.result.id === "canonical";
  }
}

export const parseBuildResult = (
  value: unknown,
): F01BuildResult | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const result = value as Partial<F01BuildResult>;
  if (
    typeof result.id !== "string" ||
    !["canonical", "partial", "failed"].includes(result.quality ?? "") ||
    typeof result.title !== "string" ||
    typeof result.message !== "string" ||
    !Array.isArray(result.debtNotes) ||
    !result.debtNotes.every((note) => typeof note === "string")
  ) {
    return undefined;
  }
  return {
    id: result.id,
    quality: result.quality as F01BuildResult["quality"],
    title: result.title,
    message: result.message,
    debtNotes: [...result.debtNotes],
  };
};

export interface RoamingNpcRuntime {
  npc: FloorNpcHandle;
  plan: RoamingNpcPlan;
}

export interface F01SceneRuntime {
  dialogueOpen: boolean;
  roamingNpcs: RoamingNpcRuntime[];
}

const questByGame = new WeakMap<object, F01QuestProgress>();
const runtimeByScene = new WeakMap<object, F01SceneRuntime>();

export const getQuestProgress = (ctx: FloorContext): F01QuestProgress => {
  const game = ctx.scene.game;
  let quest = questByGame.get(game);
  if (!quest) {
    quest = new F01QuestProgress(
      ctx.progression.handoffPending(ctx.floorOrder) &&
        ctx.progression.resultFor(ctx.floorOrder)?.quality === "canonical",
    );
    questByGame.set(game, quest);
  }
  return quest;
};

export const getSceneRuntime = (ctx: FloorContext): F01SceneRuntime => {
  let runtime = runtimeByScene.get(ctx.scene);
  if (!runtime) {
    runtime = { dialogueOpen: false, roamingNpcs: [] };
    runtimeByScene.set(ctx.scene, runtime);
  }
  return runtime;
};
