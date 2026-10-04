import type { FloorContext } from "../../../core/contracts";
import type { RoamingNpcPlan } from "./plan";

type FloorNpcHandle = ReturnType<FloorContext["addNpc"]>;

export class F01QuestProgress {
  private introducedByRhea = false;

  get consoleUnlocked(): boolean {
    return this.introducedByRhea;
  }

  completeIntroduction(): void {
    this.introducedByRhea = true;
  }
}

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
    quest = new F01QuestProgress();
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
