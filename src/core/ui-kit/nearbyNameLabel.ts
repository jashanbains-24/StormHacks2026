import type Phaser from "phaser";
import type { FloorContext } from "../contracts";

/** Match the storage floor's name visibility: strictly within 140 world pixels. */
export const bindNearbyNameLabel = (
  ctx: FloorContext,
  label: Phaser.GameObjects.Text,
  position: { x: number; y: number },
): void => {
  const refresh = (): void => {
    if (!label.active) return;
    const distance = Math.hypot(
      ctx.player.x - position.x,
      ctx.player.y - position.y,
    );
    label.setVisible(distance < 140);
  };
  refresh();
  ctx.addUpdater(refresh);
};
