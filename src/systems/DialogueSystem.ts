import { SPECIALIST_HINTS, type DialogueLine } from "../data/dialogue";

export class DialogueSystem {
  private specialistHintIndex = 0;

  nextSpecialistHint(): DialogueLine {
    const line =
      SPECIALIST_HINTS[
        Math.min(this.specialistHintIndex, SPECIALIST_HINTS.length - 1)
      ];
    this.specialistHintIndex += 1;
    return line;
  }

  get hintTier(): number {
    return Math.min(this.specialistHintIndex, SPECIALIST_HINTS.length);
  }
}
