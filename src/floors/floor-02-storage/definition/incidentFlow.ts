import { stalePriceDialogue, stalePriceStatus } from "./stalePriceDialogue";

export type IncidentStep =
  | "standby"
  | "dana"
  | "sam"
  | "priya"
  | "danaWrap"
  | "resolved";
export type CacheChoice = "local" | "shared";
export type IncidentSpeaker = "dana" | "sam" | "priya";
export type DialogueKey = keyof typeof stalePriceDialogue;

export interface StalePriceState {
  step: IncidentStep;
  cacheChoice?: CacheChoice;
}

export interface IncidentDecision {
  state: StalePriceState;
  dialogue: readonly DialogueKey[];
  visual: "critical" | "localMismatch" | "warming" | "resolved";
}

export const startingState = (floor1Solved: boolean): StalePriceState =>
  floor1Solved ? { step: "dana" } : { step: "standby" };

export const captionForState = (state: StalePriceState): string => {
  if (state.step === "standby") return stalePriceStatus.standby;
  if (state.step === "resolved" || state.step === "danaWrap") {
    return stalePriceStatus.resolved;
  }
  if (state.step === "priya") return stalePriceStatus.partial;
  return stalePriceStatus.incident;
};

export const beaconFor = (step: IncidentStep): IncidentSpeaker | undefined => {
  if (step === "dana" || step === "danaWrap") return "dana";
  if (step === "sam") return "sam";
  if (step === "priya") return "priya";
  return undefined;
};

export const clearedSpeakers = (step: IncidentStep): IncidentSpeaker[] => {
  switch (step) {
    case "standby":
    case "dana":
      return [];
    case "sam":
      return ["dana"];
    case "priya":
      return ["dana", "sam"];
    case "danaWrap":
      return ["sam", "priya"];
    default:
      return ["dana", "sam", "priya"];
  }
};

const visualForStep = (state: StalePriceState): IncidentDecision["visual"] => {
  if (
    state.step === "standby" ||
    state.step === "resolved" ||
    state.step === "danaWrap"
  ) {
    return "resolved";
  }
  if (state.step === "priya") return "warming";
  return "critical";
};

const unchanged = (
  state: StalePriceState,
  dialogue: DialogueKey,
): IncidentDecision => ({
  state,
  dialogue: [dialogue],
  visual: visualForStep(state),
});

export const applyIncidentChoice = (
  state: StalePriceState,
  speaker: IncidentSpeaker,
  choiceId: string,
): IncidentDecision => {
  if (state.step === "standby") return unchanged(state, "storageQuiet");

  if (speaker === "dana" && state.step === "dana") {
    if (choiceId === "f02_dana_add_cache") {
      return {
        state: { ...state, step: "sam" },
        dialogue: ["danaCacheCorrect"],
        visual: "critical",
      };
    }
    return unchanged(
      state,
      choiceId === "f02_dana_bigger_database"
        ? "danaBiggerDatabase"
        : "danaBlockUsers",
    );
  }

  if (speaker === "sam" && state.step === "sam") {
    if (choiceId === "f02_sam_local_cache") {
      return {
        state: { ...state, cacheChoice: "local" },
        dialogue: ["priyaLocalMismatch", "samLocalExplanation"],
        visual: "localMismatch",
      };
    }
    if (choiceId === "f02_sam_shared_cache") {
      return {
        state: { step: "priya", cacheChoice: "shared" },
        dialogue: ["samSharedCorrect"],
        visual: "warming",
      };
    }
    return unchanged(state, "samBrowserFeedback");
  }

  if (speaker === "priya" && state.step === "priya") {
    if (choiceId === "f02_priya_one_minute") {
      return {
        state: { ...state, step: "danaWrap" },
        dialogue: ["priyaMinuteCorrect"],
        visual: "resolved",
      };
    }
    return unchanged(
      state,
      choiceId === "f02_priya_one_second"
        ? "priyaOneSecondFeedback"
        : "priyaOneDayFeedback",
    );
  }

  return unchanged(state, "danaResolved");
};
