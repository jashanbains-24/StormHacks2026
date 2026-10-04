import { describe, expect, it } from "vitest";

import {
  createAlarmPath,
  resolveEmergencyMode,
} from "../../src/floors/floor-01-scalability/view/effects";
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

describe("Floor 1 emergency presentation", () => {
  it("uses progression in the game and explicit states in the preview harness", () => {
    expect(
      resolveEmergencyMode({
        previewEnabled: false,
        previewState: "calm",
        completed: false,
      }),
    ).toBe("emergency");
    expect(
      resolveEmergencyMode({
        previewEnabled: false,
        previewState: "down",
        completed: true,
      }),
    ).toBe("resolved");
    expect(
      resolveEmergencyMode({
        previewEnabled: true,
        previewState: "down",
        completed: true,
      }),
    ).toBe("emergency");
    expect(
      resolveEmergencyMode({
        previewEnabled: true,
        previewState: "fixed",
        completed: false,
      }),
    ).toBe("resolved");
  });

  it("builds a clockwise alarm-light path around every wall", () => {
    const width = 1280;
    const height = 720;
    const path = createAlarmPath(width, height);

    expect(path.length).toBeGreaterThan(20);
    expect(path.some(({ y }) => y === 96)).toBe(true);
    expect(path.some(({ x }) => x === width - 58)).toBe(true);
    expect(path.some(({ y }) => y === height - 50)).toBe(true);
    expect(path.some(({ x }) => x === 58)).toBe(true);
  });
});
