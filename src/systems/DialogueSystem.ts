import type {
  DialogueDismissReason,
  FloorDialogueLine,
} from "../core/contracts";
export type { DialogueDismissReason } from "../core/contracts";

interface DialogueSession {
  lines: readonly FloorDialogueLine[];
  index: number;
  onDismiss?: (reason: DialogueDismissReason) => void;
  onChoose?: (choiceId: string) => void;
}

export class DialogueSystem {
  private specialistHintIndex = 0;
  private specialistHints: FloorDialogueLine[] = [];
  private session?: DialogueSession;

  get currentLine(): FloorDialogueLine | undefined {
    return this.session?.lines[this.session.index];
  }

  get canAdvance(): boolean {
    return Boolean(this.currentLine && !this.currentLine.choices?.length);
  }

  get actionLabel(): string | undefined {
    if (!this.canAdvance || !this.session) return undefined;
    return this.session.index < this.session.lines.length - 1
      ? "NEXT → [E]"
      : "DONE [E]";
  }

  startSequence(
    lines: readonly FloorDialogueLine[],
    onDismiss?: (reason: DialogueDismissReason) => void,
  ): void {
    this.dismiss("replaced");
    if (lines.length > 0) this.session = { lines, index: 0, onDismiss };
  }

  startLine(line: FloorDialogueLine, onAcknowledged?: () => void): void {
    this.startSequence([line], (reason) => {
      if (reason === "acknowledged") onAcknowledged?.();
    });
  }

  startChoice(
    line: FloorDialogueLine,
    onChoose: (choiceId: string) => void,
  ): void {
    this.startSequence([line]);
    if (this.session) this.session.onChoose = onChoose;
  }

  advance(): void {
    if (!this.canAdvance || !this.session) return;
    if (this.session.index < this.session.lines.length - 1) {
      this.session.index += 1;
    } else {
      this.dismiss();
    }
  }

  choose(choiceId: string): void {
    if (!this.currentLine?.choices?.some((choice) => choice.id === choiceId))
      return;
    const onChoose = this.session?.onChoose;
    this.session = undefined;
    onChoose?.(choiceId);
  }

  dismiss(reason: DialogueDismissReason = "acknowledged"): void {
    const onDismiss = this.session?.onDismiss;
    this.session = undefined;
    if (reason !== "shutdown") onDismiss?.(reason);
  }

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
