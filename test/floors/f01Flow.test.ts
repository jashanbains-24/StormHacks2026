import { describe, expect, it } from "vitest";

import {
  DIALOGUE_DISMISS_DISTANCE,
  F01_OFFICE_PROPS,
  INTERN_WORKSTATION,
  INTERN_WORKSTATION_PROPS,
  isDialogueOutOfRange,
  RHEA_POSITION,
  SEATED_NPCS,
} from "../../src/floors/floor-01-scalability/view/plan";
import { F01QuestProgress } from "../../src/floors/floor-01-scalability/view/runtime";

describe("Floor 1 intern flow", () => {
  it("keeps the build console locked until Rhea completes onboarding", () => {
    const quest = new F01QuestProgress();

    expect(quest.consoleUnlocked).toBe(false);
    quest.completeIntroduction();
    expect(quest.consoleUnlocked).toBe(true);
  });

  it("dismisses Rhea's dialogue only after the player walks away", () => {
    expect(isDialogueOutOfRange(false, DIALOGUE_DISMISS_DISTANCE + 1)).toBe(
      false,
    );
    expect(isDialogueOutOfRange(true, DIALOGUE_DISMISS_DISTANCE)).toBe(false);
    expect(isDialogueOutOfRange(true, DIALOGUE_DISMISS_DISTANCE + 1)).toBe(
      true,
    );
  });

  it("places Rhea before the intern workstation", () => {
    expect(RHEA_POSITION.x).toBeLessThan(INTERN_WORKSTATION.x);
    expect(RHEA_POSITION.y).toBeLessThan(INTERN_WORKSTATION.y);
  });

  it("seats exactly three employees facing their computers", () => {
    expect(SEATED_NPCS).toHaveLength(3);
    SEATED_NPCS.forEach((npc) => {
      expect(npc.frame).toBe(7);
      expect(npc.animationKey).toBeNull();
      expect(npc.behavior.kind).toBe("desk");
    });
  });

  it("uses explicit footprint hitboxes for collidable furniture", () => {
    [...F01_OFFICE_PROPS, ...INTERN_WORKSTATION_PROPS]
      .filter((prop) => prop.collider !== false)
      .forEach((prop) => expect(prop.collisionBox).toBeDefined());
  });
});
