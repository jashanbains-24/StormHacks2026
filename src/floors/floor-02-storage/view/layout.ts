import type { FloorContext, LayoutHandle } from "../../../core/contracts";
import { colorHex, createDefaultOfficeLayout } from "../../../core/ui-kit";

export const createLayout = (ctx: FloorContext): LayoutHandle => {
  createDefaultOfficeLayout(ctx);
  ctx.scene.add
    .text(
      670,
      360,
      "Data Storage / Caching\n\nCOMING SOON\nThe database team is allegedly in a meeting.",
      {
        align: "center",
        color: colorHex(ctx.theme.colors.ink),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "28px",
        fontStyle: "bold",
      },
    )
    .setOrigin(0.5)
    .setDepth(620);
  return {};
};
