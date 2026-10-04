import type { FloorDialogueLine } from "../core/contracts";

export class DialogueSystem {
  private specialistHintIndex = 0;
  private specialistHints: FloorDialogueLine[] = [];

  setSpecialistHints(hints: FloorDialogueLine[]): void {
    this.specialistHints = hints;
    this.specialistHintIndex = 0;
  }

  nextSpecialistHint(): FloorDialogueLine | undefined {
    if (this.specialistHints.length === 0) return undefined;
    const line =
      this.specialistHints[
        Math.min(this.specialistHintIndex, this.specialistHints.length - 1)
      ];
    this.specialistHintIndex += 1;
    return line;
  }

  get hintTier(): number {
    return Math.min(this.specialistHintIndex, this.specialistHints.length);
  }
}
