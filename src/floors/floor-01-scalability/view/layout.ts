import type { FloorContext, LayoutHandle } from "../../../core/contracts";
import { colorHex, createDefaultOfficeLayout } from "../../../core/ui-kit";

export const createLayout = (ctx: FloorContext): LayoutHandle => {
  createDefaultOfficeLayout(ctx);
  const specialist = ctx.addNpc(820, 340, "f01-rhea", {
    texture: "specialist",
  });
  ctx.scene.physics.add.collider(ctx.player, specialist);
  ctx.scene.add
    .text(770, 382, "Rhea Boot // SRE", {
      color: colorHex(ctx.theme.colors.ink),
      fontFamily: ctx.theme.fonts.family,
      fontSize: "15px",
      backgroundColor: colorHex(ctx.theme.colors.panel),
      padding: { x: 7, y: 4 },
    })
    .setDepth(600);
  ctx.addInteractable({
    id: "f01:specialist",
    label: "Talk to Rhea",
    x: specialist.x,
    y: specialist.y,
    onInteract: () => ctx.dialogue.showSpecialist(),
  });
  return {};
};
