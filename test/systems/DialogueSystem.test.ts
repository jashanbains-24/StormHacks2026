import { describe, expect, it } from "vitest";

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
});
