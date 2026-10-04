import { describe, expect, it } from "vitest";

import {
  content,
  onboardingDialogue,
  outcomeDialogueFor,
} from "../../src/floors/floor-01-scalability/definition/content";
import {
  createAlarmPath,
  fixtureRotationFor,
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
import {
  F01QuestProgress,
  parseBuildResult,
} from "../../src/floors/floor-01-scalability/view/runtime";

describe("Floor 1 intern flow", () => {
  it("keeps the build console locked until Rhea completes onboarding", () => {
    const quest = new F01QuestProgress();

    expect(quest.consoleUnlocked).toBe(false);
    quest.completeIntroduction();
    expect(quest.consoleUnlocked).toBe(true);
  });

  it("guides the intern from Rhea to the workstation", () => {
    const quest = new F01QuestProgress();

    expect(quest.guidanceTarget).toBe("rhea");
    quest.completeIntroduction();
    expect(quest.guidanceTarget).toBeUndefined();
    quest.finishIntroduction();
    expect(quest.guidanceTarget).toBe("workstation");
    quest.markConsoleOpened();
    expect(quest.guidanceTarget).toBeUndefined();
  });

  it("routes evaluated attempts through Rhea before retry or handoff", () => {
    const quest = new F01QuestProgress();
    quest.completeIntroduction();
    quest.finishIntroduction();
    quest.markConsoleOpened();
    quest.recordResult({
      id: "single-server-lb",
      quality: "failed",
      title: "Still overloaded",
      message: "One target remains.",
      debtNotes: [],
    });

    expect(quest.consoleUnlocked).toBe(false);
    expect(quest.guidanceTarget).toBe("rhea");
    quest.finishDebrief();
    expect(quest.consoleUnlocked).toBe(true);
    expect(quest.guidanceTarget).toBeUndefined();

    quest.recordResult({
      id: "canonical",
      quality: "canonical",
      title: "Resilient",
      message: "Traffic stayed green.",
      debtNotes: [],
    });
    quest.finishDebrief();
    expect(quest.guidanceTarget).toBe("elevator");
  });

  it("progressively reveals hints and repeats the most specific one", () => {
    const quest = new F01QuestProgress();

    expect(quest.nextHint(content.specialistHints)?.id).toBe(
      "f01_specialist_hint_1",
    );
    expect(quest.nextHint(content.specialistHints)?.id).toBe(
      "f01_specialist_hint_2",
    );
    expect(quest.nextHint(content.specialistHints)?.id).toBe(
      "f01_specialist_hint_3",
    );
    expect(quest.nextHint(content.specialistHints)?.id).toBe(
      "f01_specialist_hint_3",
    );
  });

  it("provides onboarding and result-specific teaching dialogue", () => {
    const canonical = outcomeDialogueFor("canonical");
    const underRedundant = outcomeDialogueFor("under-redundant");
    expect(onboardingDialogue).toHaveLength(5);
    expect(onboardingDialogue[0]?.text).toContain("Rhea Boot, the SRE lead");
    expect(onboardingDialogue[2]?.text).toContain("two servers");
    expect(onboardingDialogue[2]?.text).toContain("up to five");
    expect(onboardingDialogue[2]?.text).toContain("N+1");
    expect(canonical).toHaveLength(5);
    expect(canonical[2]?.text).toContain("separation of responsibilities");
    expect(canonical[3]?.text).toContain("system-design lesson");
    expect(canonical[3]?.text).toContain("scale, reliability, and cost");
    expect(canonical[canonical.length - 1]?.text).toContain("elevator");
    expect(underRedundant[underRedundant.length - 1]?.text).toContain("N+1");
    expect(outcomeDialogueFor("unknown")).toEqual(
      outcomeDialogueFor("invalid"),
    );
  });

  it("accepts only complete build-result event payloads", () => {
    expect(
      parseBuildResult({
        id: "canonical",
        quality: "canonical",
        title: "Resilient",
        message: "Traffic stayed green.",
        debtNotes: [],
      }),
    ).toMatchObject({ id: "canonical", quality: "canonical" });
    expect(parseBuildResult({ id: "canonical" })).toBeUndefined();
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

  it("places Rhea before the intern workstation in the player's path", () => {
    expect(RHEA_POSITION.x).toBeLessThan(INTERN_WORKSTATION.x);
  });

  it("places the empty intern workstation beside the occupied desk row", () => {
    const occupiedDesks = F01_OFFICE_PROPS.filter(
      (prop) => prop.texture === "desk",
    );
    const internDesk = INTERN_WORKSTATION_PROPS.find(
      (prop) => prop.texture === "desk",
    );

    expect(occupiedDesks).toHaveLength(3);
    expect(internDesk?.y).toBe(occupiedDesks[0]?.y);
    expect(internDesk?.x).toBeGreaterThan(
      occupiedDesks[occupiedDesks.length - 1]?.x ?? 0,
    );
  });

  it("keeps the meeting table shifted down and left", () => {
    const meetingTables = F01_OFFICE_PROPS.filter(
      (prop) => prop.texture === "meeting-table",
    );

    expect(meetingTables.map(({ x, y }) => [x, y])).toEqual([
      [430, 465],
      [560, 465],
    ]);
  });

  it("keeps the library clear of the wall and its alarm beacons", () => {
    const library = F01_OFFICE_PROPS.filter((prop) =>
      ["bookshelf", "double-bookshelf"].includes(prop.texture),
    ).filter((prop) => prop.x < 500);

    expect(library).toHaveLength(3);
    library.forEach((shelf) => expect(shelf.x).toBe(170));
  });

  it("seats exactly three employees facing their computers", () => {
    expect(SEATED_NPCS).toHaveLength(3);
    SEATED_NPCS.forEach((npc) => {
      expect(npc.frame).toBe(7);
      expect(npc.animationKey).toBeNull();
      expect(npc.behavior.kind).toBe("desk");
    });
  });

  it("keeps desk chairs original while other chairs remain rotated", () => {
    const officeDeskChairs = F01_OFFICE_PROPS.filter(
      (prop) =>
        prop.texture === "chair-back" && [245, 405, 565].includes(prop.x),
    );
    const internChair = INTERN_WORKSTATION_PROPS.find((prop) =>
      prop.texture.includes("chair"),
    );
    const facingChairs = F01_OFFICE_PROPS.filter(
      (prop) => prop.texture === "chair-back" && [745, 935].includes(prop.x),
    );
    const otherChairs = F01_OFFICE_PROPS.filter(
      (prop) =>
        prop.texture.includes("chair") &&
        !officeDeskChairs.includes(prop) &&
        !facingChairs.includes(prop),
    );

    expect(officeDeskChairs).toHaveLength(3);
    [...officeDeskChairs, internChair].forEach((chair) =>
      expect(chair?.angle).toBe(0),
    );
    expect(facingChairs.map(({ x, y, angle }) => [x, y, angle])).toEqual([
      [745, 495, 270],
      [935, 495, 90],
    ]);
    otherChairs.forEach((chair) => expect(chair.angle).toBe(180));
  });

  it("places the mug on the intern's desk", () => {
    const mug = F01_OFFICE_PROPS.find((prop) => prop.texture === "coffee");

    expect(mug).toMatchObject({
      x: 765,
      y: 165,
      collider: false,
      depthOffset: 20,
    });
  });

  it("keeps side-desk and upper conference chairs close to their tables", () => {
    const sideDeskChairs = F01_OFFICE_PROPS.filter(
      (prop) => prop.x === 1000 && prop.texture.includes("chair"),
    );
    const upperConferenceChairs = F01_OFFICE_PROPS.filter(
      (prop) =>
        [430, 560].includes(prop.x) && prop.texture === "cushioned-chair-back",
    );

    expect(sideDeskChairs.map(({ y }) => y)).toEqual([193, 330]);
    expect(upperConferenceChairs.map(({ y }) => y)).toEqual([385, 385]);
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
        resolvedThisSession: false,
      }),
    ).toBe("emergency");
    expect(
      resolveEmergencyMode({
        previewEnabled: false,
        previewState: "down",
        resolvedThisSession: true,
      }),
    ).toBe("resolved");
    expect(
      resolveEmergencyMode({
        previewEnabled: true,
        previewState: "calm",
        resolvedThisSession: true,
      }),
    ).toBe("emergency");
    expect(
      resolveEmergencyMode({
        previewEnabled: true,
        previewState: "down",
        resolvedThisSession: true,
      }),
    ).toBe("emergency");
    expect(
      resolveEmergencyMode({
        previewEnabled: true,
        previewState: "fixed",
        resolvedThisSession: false,
      }),
    ).toBe("resolved");
  });

  it("builds a clockwise alarm-light path around every wall", () => {
    const width = 1280;
    const height = 720;
    const path = createAlarmPath(width, height);

    expect(path).toHaveLength(8);
    expect(path.filter(({ y }) => y === 96)).toHaveLength(2);
    expect(path.filter(({ x }) => x === width - 58)).toHaveLength(2);
    expect(path.filter(({ y }) => y === height - 50)).toHaveLength(2);
    expect(path.filter(({ x }) => x === 58)).toHaveLength(2);
    expect(path.filter(({ x }) => x === width - 58).map(({ y }) => y)).toEqual([
      160,
      height - 160,
    ]);
    expect(path.filter(({ x }) => x === 58).map(({ y }) => y)).toEqual([
      height - 160,
      160,
    ]);
    expect(
      path
        .filter(({ y }) => y === 96)
        .every(({ inwardAngle, x }) => inwardAngle === 90 && x < 700),
    ).toBe(true);
    expect(
      path
        .filter(({ x }) => x === width - 58)
        .every(({ inwardAngle }) => inwardAngle === 180),
    ).toBe(true);
    expect(
      path
        .filter(({ x }) => x === 58)
        .every(({ inwardAngle }) => inwardAngle === 0),
    ).toBe(true);
    expect(fixtureRotationFor(90)).toBe(0);
    expect(fixtureRotationFor(180)).toBe(90);
    expect(fixtureRotationFor(270)).toBe(180);
    expect(fixtureRotationFor(0)).toBe(-90);
  });
});
