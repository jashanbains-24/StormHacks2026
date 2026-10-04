import type { FloorContext } from "../../../core/contracts";
import {
  colorHex,
  createTermFocusGroup,
  dismissTermCard,
  drawRichText,
  type TermFocusGroup,
  type UiContainer,
  type UiGameObject,
} from "../../../core/ui-kit";
import { glossaryById } from "../definition/terms";

export interface PuzzleShell {
  root: UiContainer;
  focus: TermFocusGroup;
  panel: { x: number; y: number; width: number; height: number };
  destroy: () => void;
  richText: (
    source: string,
    x: number,
    y: number,
    maxWidth: number,
    tone?: "ink" | "light",
  ) => {
    width: number;
    height: number;
    objects: UiGameObject[];
  };
}

export const mountPuzzleShell = (
  ctx: FloorContext,
  title: string,
  onClose: () => void,
): PuzzleShell => {
  const panel = { x: 140, y: 64, width: 1000, height: 590 };
  const root = ctx.scene.add.container(0, 0).setDepth(1600);
  const focus = createTermFocusGroup(ctx.scene);
  const scrim = ctx.scene.add
    .rectangle(
      0,
      0,
      ctx.scene.scale.width,
      ctx.scene.scale.height,
      0x0b121b,
      0.4,
    )
    .setOrigin(0)
    .setInteractive();
  const frame = ctx.scene.add
    .rectangle(
      panel.x,
      panel.y,
      panel.width,
      panel.height,
      ctx.theme.colors.panel,
      0.98,
    )
    .setOrigin(0)
    .setStrokeStyle(4, ctx.theme.colors.ink);
  const header = ctx.scene.add
    .rectangle(panel.x, panel.y, panel.width, 48, ctx.theme.colors.panelDark)
    .setOrigin(0);
  const heading = ctx.scene.add.text(panel.x + 18, panel.y + 12, title, {
    color: colorHex(ctx.theme.colors.white),
    fontFamily: ctx.theme.fonts.family,
    fontSize: "20px",
    fontStyle: "bold",
  });
  const close = ctx.scene.add
    .text(panel.x + panel.width - 36, panel.y + 8, "×", {
      color: colorHex(ctx.theme.colors.muted),
      fontFamily: ctx.theme.fonts.family,
      fontSize: "28px",
    })
    .setInteractive({ useHandCursor: true });

  root.add([scrim, frame, header, heading, close]);

  let gone = false;
  const destroy = (): void => {
    if (gone) return;
    gone = true;
    dismissTermCard();
    focus.destroy();
    root.destroy();
    onClose();
  };
  close.on("pointerup", destroy);
  ctx.scene.events.once("shutdown", destroy);

  return {
    root,
    focus,
    panel,
    destroy,
    richText: (source, x, y, maxWidth, tone = "ink") =>
      drawRichText(
        ctx.scene,
        root,
        source,
        x,
        y,
        maxWidth,
        tone === "light"
          ? {
              color: colorHex(ctx.theme.colors.white),
              fontSize: "15px",
              underline: ctx.theme.colors.successLight,
              reducedMotion: ctx.preferences.reducedMotion,
            }
          : {
              color: colorHex(ctx.theme.colors.ink),
              fontSize: "16px",
              underline: ctx.theme.colors.alertDark,
              reducedMotion: ctx.preferences.reducedMotion,
            },
        glossaryById,
        focus,
      ),
  };
};
