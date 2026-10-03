import { describe, expect, it } from "vitest";

import { colorHex, THEME } from "./theme";

describe("theme", () => {
  it("formats Phaser colors for text styles", () => {
    expect(colorHex(THEME.colors.alert)).toBe("#c73e3a");
  });
});
