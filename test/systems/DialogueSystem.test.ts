import { describe, expect, it, vi } from "vitest";

import { content } from "../../src/floors/floor-01-scalability/definition/content";
import { DialogueSystem } from "../../src/systems/DialogueSystem";

describe("DialogueSystem", () => {
  it("advances through three hints and repeats the specific hint", () => {
    const dialogue = new DialogueSystem();
    dialogue.setSpecialistHints(content.specialistHints);

    expect(dialogue.nextSpecialistHint()?.id).toBe("f01_specialist_hint_1");
    expect(dialogue.nextSpecialistHint()?.id).toBe("f01_specialist_hint_2");
    expect(dialogue.nextSpecialistHint()?.id).toBe("f01_specialist_hint_3");
    expect(dialogue.nextSpecialistHint()?.id).toBe("f01_specialist_hint_3");
    expect(dialogue.hintTier).toBe(3);
  });

  it("advances a sequence and acknowledges its final page exactly once", () => {
    const dialogue = new DialogueSystem();
    const onDismiss = vi.fn();
    dialogue.startSequence(content.specialistHints.slice(0, 2), onDismiss);
    expect(dialogue.actionLabel).toBe("NEXT → [E]");
    dialogue.advance();
    expect(dialogue.currentLine).toBe(content.specialistHints[1]);
    expect(dialogue.actionLabel).toBe("DONE [E]");
    expect(onDismiss).not.toHaveBeenCalled();
    dialogue.advance();
    dialogue.dismiss();
    expect(dialogue.currentLine).toBeUndefined();
    expect(onDismiss).toHaveBeenCalledExactlyOnceWith("acknowledged");
  });

  it("cancels single-line follow-ups on movement, replacement, and shutdown", () => {
    const dialogue = new DialogueSystem();
    const onAcknowledged = vi.fn();
    for (const reason of ["movement", "replaced", "shutdown"] as const) {
      dialogue.startLine(content.specialistHints[0], onAcknowledged);
      dialogue.dismiss(reason);
    }
    expect(onAcknowledged).not.toHaveBeenCalled();
    dialogue.startLine(content.specialistHints[0], onAcknowledged);
    dialogue.advance();
    expect(onAcknowledged).toHaveBeenCalledOnce();
  });

  it("releases sequence state on movement without running callbacks on shutdown", () => {
    const dialogue = new DialogueSystem();
    const onDismiss = vi.fn();
    dialogue.startSequence(content.specialistHints, onDismiss);
    dialogue.dismiss("movement");
    expect(onDismiss).toHaveBeenCalledExactlyOnceWith("movement");
    dialogue.startSequence(content.specialistHints, onDismiss);
    dialogue.dismiss("shutdown");
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("requires an explicit valid choice instead of advancing to an answer", () => {
    const dialogue = new DialogueSystem();
    const onChoose = vi.fn();
    const line = {
      ...content.specialistHints[0],
      choices: [{ id: "cache", label: "Shared cache" }],
    };
    dialogue.startChoice(line, onChoose);
    dialogue.advance();
    dialogue.choose("invalid");
    expect(dialogue.currentLine).toBe(line);
    expect(dialogue.actionLabel).toBeUndefined();
    expect(onChoose).not.toHaveBeenCalled();
    dialogue.choose("cache");
    expect(onChoose).toHaveBeenCalledExactlyOnceWith("cache");
    expect(dialogue.currentLine).toBeUndefined();
  });

  it("preserves the next line started by an acknowledgement callback", () => {
    const dialogue = new DialogueSystem();
    dialogue.startLine(content.specialistHints[0], () => {
      dialogue.startLine(content.specialistHints[1]);
    });
    dialogue.advance();
    expect(dialogue.currentLine).toBe(content.specialistHints[1]);
  });
});
