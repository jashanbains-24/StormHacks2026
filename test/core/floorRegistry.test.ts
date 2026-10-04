import { describe, expect, it } from "vitest";

import {
  getFloorByOrder,
  getFloors,
} from "../../src/core/runtime/floorRegistry";

describe("floor registry", () => {
  it("discovers floors from folders in numeric order", () => {
    expect(getFloors().map(({ order, module }) => [order, module.id])).toEqual([
      [0, "f00"],
      [1, "f01"],
      [2, "f02"],
    ]);
  });

  it("loads complete, namespaced floor modules", () => {
    for (const { order, module } of getFloors()) {
      expect(getFloorByOrder(order).module).toBe(module);
      expect(module.contractVersion).toBe(1);
      expect(module.title).not.toBe("");
      expect(module.category).not.toBe("");
      expect(module.view.createLayout).toBeTypeOf("function");
      expect(module.view.createBuildUI).toBeTypeOf("function");

      const dialogue = [
        ...(module.definition.content.managerAlert
          ? [module.definition.content.managerAlert]
          : []),
        ...module.definition.content.specialistHints,
      ];
      dialogue.forEach((line) =>
        expect(line.id.startsWith(`${module.id}_`)).toBe(true),
      );
      module.definition.content.glossary.forEach((entry) =>
        expect(entry.id.startsWith(`${module.id}.`)).toBe(true),
      );
    }
  });
});
