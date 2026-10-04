import type { BuildUIHandle, FloorContext } from "../../../core/contracts";
import { colorHex } from "../../../core/ui-kit";

export const createBuildUI = (ctx: FloorContext): BuildUIHandle => {
  ctx.scene.add
    .rectangle(220, 440, 190, 112, ctx.theme.colors.panelDark)
    .setStrokeStyle(4, ctx.theme.colors.warning)
    .setDepth(440);
  ctx.scene.add
    .text(220, 440, "BUILD\nCONSOLE", {
      align: "center",
      color: colorHex(ctx.theme.colors.white),
      fontFamily: ctx.theme.fonts.mono,
      fontSize: "20px",
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setDepth(441);
  ctx.addInteractable({
    id: "f01:build_console",
    label: "Open build console",
    x: 220,
    y: 440,
    range: 110,
    onInteract: () => ctx.openBuild(),
  });
  return {};
};
