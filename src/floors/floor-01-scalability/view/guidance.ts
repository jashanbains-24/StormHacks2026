import type { FloorContext } from "../../../core/contracts";
import { colorHex } from "../../../core/ui-kit";
import { INTERN_WORKSTATION, RHEA_POSITION } from "./plan";
import type { F01QuestProgress, F01SceneRuntime } from "./runtime";

type ArrowDirection = "up" | "down" | "right";

const createArrow = (
  ctx: FloorContext,
  x: number,
  y: number,
  direction: ArrowDirection,
  label: string,
) => {
  const color = ctx.theme.colors.warning;
  const shaft =
    direction === "right"
      ? ctx.scene.add.rectangle(-9, 0, 28, 8, color)
      : ctx.scene.add.rectangle(0, direction === "up" ? 9 : -9, 8, 28, color);
  const tip =
    direction === "up"
      ? ctx.scene.add.triangle(0, -13, -13, 8, 13, 8, 0, -10, color)
      : direction === "down"
        ? ctx.scene.add.triangle(0, 13, -13, -8, 13, -8, 0, 10, color)
        : ctx.scene.add.triangle(14, 0, -8, -13, -8, 13, 10, 0, color);
  const labelText = ctx.scene.add
    .text(
      direction === "right" ? -12 : 0,
      direction === "up" ? 30 : direction === "down" ? -44 : 29,
      label,
      {
        color: colorHex(ctx.theme.colors.white),
        backgroundColor: colorHex(ctx.theme.colors.panelDark),
        fontFamily: ctx.theme.fonts.mono,
        fontSize: "12px",
        fontStyle: "bold",
        padding: { x: 7, y: 4 },
      },
    )
    .setOrigin(direction === "right" ? 1 : 0.5, 0.5);
  const arrow = ctx.scene.add
    .container(x, y, [shaft, tip, labelText])
    .setDepth(697)
    .setVisible(false);
  if (!ctx.preferences.reducedMotion) {
    ctx.scene.tweens.add({
      targets: arrow,
      y: y + (direction === "up" ? 7 : -7),
      duration: 520,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }
  return arrow;
};

export const createGuidance = (
  ctx: FloorContext,
  quest: F01QuestProgress,
  runtime: F01SceneRuntime,
): void => {
  const rheaArrow = createArrow(
    ctx,
    RHEA_POSITION.x,
    RHEA_POSITION.y - 112,
    "down",
    "TALK TO RHEA",
  );
  const workstationArrow = createArrow(
    ctx,
    INTERN_WORKSTATION.x,
    INTERN_WORKSTATION.y + 112,
    "up",
    "YOUR WORKSTATION",
  );
  const elevatorArrow = createArrow(
    ctx,
    ctx.scene.scale.width - 190,
    ctx.scene.scale.height / 2,
    "right",
    "NEXT FLOOR",
  );
  const hintBadge = ctx.scene.add
    .text(RHEA_POSITION.x, RHEA_POSITION.y + 56, "[E] ASK FOR NEXT HINT", {
      color: colorHex(ctx.theme.colors.white),
      backgroundColor: colorHex(ctx.theme.colors.panelDark),
      fontFamily: ctx.theme.fonts.mono,
      fontSize: "11px",
      fontStyle: "bold",
      padding: { x: 7, y: 5 },
    })
    .setOrigin(0.5)
    .setDepth(697)
    .setVisible(false);

  ctx.addUpdater(() => {
    const target = runtime.dialogueOpen ? undefined : quest.guidanceTarget;
    rheaArrow.setVisible(target === "rhea");
    workstationArrow.setVisible(target === "workstation");
    elevatorArrow.setVisible(target === "elevator");
    hintBadge.setVisible(
      !runtime.dialogueOpen &&
        quest.hasMetRhea &&
        !quest.needsDebrief &&
        !quest.handoffReady,
    );
  });
};
