import { describe, expect, it, vi } from "vitest";
import type Phaser from "phaser";
import type { FloorContext } from "../../src/core/contracts";
import { bindNearbyNameLabel } from "../../src/core/ui-kit/nearbyNameLabel";

describe("nearby NPC names", () => {
  it("initializes visibility and follows approach, departure, and the 140-pixel boundary", () => {
    const player = { x: 0, y: 0 };
    const npc = { x: 300, y: 0 };
    const label = { active: true, setVisible: vi.fn() };
    let refresh = () => {};
    const ctx = {
      player,
      addUpdater: (update: () => void) => {
        refresh = update;
      },
    } as unknown as FloorContext;
    bindNearbyNameLabel(ctx, label as unknown as Phaser.GameObjects.Text, npc);
    expect(label.setVisible).toHaveBeenLastCalledWith(false);

    player.x = 161;
    refresh();
    expect(label.setVisible).toHaveBeenLastCalledWith(true);
    player.x = 160;
    refresh();
    expect(label.setVisible).toHaveBeenLastCalledWith(false);
    player.x = 300;
    player.y = 139;
    refresh();
    expect(label.setVisible).toHaveBeenLastCalledWith(true);
    player.x = 160;
    player.y = 1;
    refresh();
    expect(label.setVisible).toHaveBeenLastCalledWith(false);
    player.x = 300;
    player.y = 0;
    refresh();
    expect(label.setVisible).toHaveBeenLastCalledWith(true);

    label.active = false;
    label.setVisible.mockClear();
    refresh();
    expect(label.setVisible).not.toHaveBeenCalled();
  });
});
