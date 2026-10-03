import { describe, expect, it } from "vitest";

import { DialogueSystem } from "./DialogueSystem";

describe("DialogueSystem", () => {
  it("advances through three hints and repeats the specific hint", () => {
    const dialogue = new DialogueSystem();

    expect(dialogue.nextSpecialistHint().id).toBe("f1_specialist_hint_1");
    expect(dialogue.nextSpecialistHint().id).toBe("f1_specialist_hint_2");
    expect(dialogue.nextSpecialistHint().id).toBe("f1_specialist_hint_3");
    expect(dialogue.nextSpecialistHint().id).toBe("f1_specialist_hint_3");
    expect(dialogue.hintTier).toBe(3);
  });
});
