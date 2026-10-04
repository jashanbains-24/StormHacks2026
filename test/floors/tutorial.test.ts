import { describe, expect, it } from "vitest";

import { content } from "../../src/floors/floor-00-tutorial/definition/content";
import { incident } from "../../src/floors/floor-00-tutorial/definition/incident";
import { evaluateTutorialDesign } from "../../src/sim/tutorialEvaluator";

describe("tutorial floor", () => {
  it("introduces the controls and the waiting-area onboarding lesson", () => {
    expect(content.managerAlert?.text).toContain("Stack Never Flow Inc.");
    expect(content.managerAlert?.text).toContain("WASD");
    expect(content.managerAlert?.text).toContain("mouse");
    expect(content.managerAlert?.text).toContain("E");
    expect(content.tutorial.interact).toBe("Go to the front desk.");
    expect(content.tutorial.build).toBe(
      "Have a seat in the waiting area to fill in your information",
    );
    expect(content.specialistHints).toHaveLength(3);
    expect(content.specialistHints[0]?.text).toContain("waiting area");
    expect(content.specialistHints[0]?.text).not.toContain("build console");
    expect(content.specialistHints[1]?.text).toContain("preliminary questions");
    expect(content.completionDialogue?.text).toContain(
      "Head upstairs to continue with onboarding.",
    );
    expect(content.completionDialogue?.text).not.toContain("Problem 1");
  });

  it("offers connector and destination blocks for the practice design", () => {
    expect(incident.availableComponents).toEqual([
      { type: "connector", max: 999 },
      { type: "destination", max: 999 },
    ]);
    expect(incident.buildMode).toBe("tutorial");
  });

  it("passes when every destination is reachable from the source", () => {
    const design = {
      nodes: [
        { id: "source", type: "source" as const, x: 0, y: 0 },
        { id: "connector", type: "connector" as const, x: 1, y: 0 },
        { id: "destination-a", type: "destination" as const, x: 2, y: 0 },
        { id: "destination-b", type: "destination" as const, x: 2, y: 1 },
      ],
      connections: [
        { from: "source", to: "connector" },
        { from: "connector", to: "destination-a" },
        { from: "source", to: "destination-b" },
      ],
    };
    expect(evaluateTutorialDesign(design).quality).toBe("canonical");
  });

  it("fails when one destination is not connected", () => {
    const design = {
      nodes: [
        { id: "source", type: "source" as const, x: 0, y: 0 },
        { id: "destination-a", type: "destination" as const, x: 2, y: 0 },
        { id: "destination-b", type: "destination" as const, x: 2, y: 1 },
      ],
      connections: [{ from: "source", to: "destination-a" }],
    };
    expect(evaluateTutorialDesign(design).quality).toBe("failed");
  });
});
