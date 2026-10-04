import type { FloorContext } from "../../../core/contracts";

interface AmbientEffectsHandle {
  destroy(): void;
}

const COLORS = {
  outline: 0x17181c,
  metal: 0x566573,
  metalLight: 0x87949c,
  screen: 0x8db8a6,
  status: 0xa7d46f,
  warning: 0xd58a55,
  danger: 0xb94e48,
} as const;

const statusColor = (ctx: FloorContext): number => {
  switch (ctx.preview.state) {
    case "strained":
      return COLORS.warning;
    case "down":
      return COLORS.danger;
    default:
      return COLORS.status;
  }
};

export const createAmbientEquipmentEffects = (
  ctx: FloorContext,
): AmbientEffectsHandle => {
  const destroyers: Array<() => void> = [];
  const moving = !ctx.preferences.reducedMotion;
  const activeColor = statusColor(ctx);

  for (let screen = 0; screen < 4; screen += 1) {
    for (let lightIndex = 0; lightIndex < 3; lightIndex += 1) {
      const light = ctx.scene.add
        .rectangle(
          405 + screen * 108 + lightIndex * 24,
          186,
          6,
          3,
          lightIndex === 2 ? COLORS.warning : activeColor,
        )
        .setDepth(220);
      destroyers.push(() => light.destroy());

      if (moving) {
        const tween = ctx.scene.tweens.add({
          targets: light,
          alpha: { from: 0.25, to: 1 },
          duration: 380 + ((screen + lightIndex) % 3) * 210,
          delay: screen * 110 + lightIndex * 80,
          yoyo: true,
          repeat: -1,
        });
        destroyers.push(() => tween.destroy());
      }
    }
  }

  const tapeArm = ctx.scene.add
    .rectangle(118, 249, 6, 27, COLORS.metalLight)
    .setDepth(272);
  const tapeHead = ctx.scene.add
    .rectangle(127, 249, 12, 9, COLORS.screen)
    .setDepth(272);
  destroyers.push(
    () => tapeArm.destroy(),
    () => tapeHead.destroy(),
  );

  if (moving) {
    const tapeTween = ctx.scene.tweens.add({
      targets: [tapeArm, tapeHead],
      x: "+=174",
      duration: 3100,
      hold: 800,
      yoyo: true,
      repeat: -1,
      repeatDelay: 1100,
      ease: "Stepped",
      easeParams: [29],
    });
    destroyers.push(() => tapeTween.destroy());
  }

  [162, 282].forEach((x, index) => {
    for (let puff = 0; puff < 3; puff += 1) {
      const air = ctx.scene.add
        .rectangle(x, 426 - puff * 9, 6, 6, COLORS.metalLight, 0.24)
        .setDepth(425);
      destroyers.push(() => air.destroy());

      if (moving) {
        const tween = ctx.scene.tweens.add({
          targets: air,
          y: air.y - 24,
          alpha: { from: 0.32, to: 0 },
          duration: 1350,
          delay: index * 260 + puff * 430,
          repeat: -1,
          repeatDelay: 280,
        });
        destroyers.push(() => tween.destroy());
      }
    }
  });

  const bot = ctx.scene.add.graphics().setPosition(900, 648).setDepth(620);
  bot.fillStyle(COLORS.outline);
  bot.fillRect(-15, -9, 30, 18);
  bot.fillStyle(COLORS.metal);
  bot.fillRect(-12, -6, 24, 12);
  bot.fillStyle(COLORS.screen);
  bot.fillRect(-6, -3, 12, 6);
  bot.fillStyle(COLORS.outline);
  bot.fillRect(-12, 9, 6, 3);
  bot.fillRect(6, 9, 6, 3);
  destroyers.push(() => bot.destroy());

  if (moving) {
    const botTween = ctx.scene.tweens.add({
      targets: bot,
      x: 1088,
      duration: 4200,
      hold: 900,
      yoyo: true,
      repeat: -1,
      repeatDelay: 1200,
      ease: "Stepped",
      easeParams: [103],
    });
    destroyers.push(() => botTween.destroy());
  }

  return {
    destroy: () => {
      destroyers.reverse().forEach((destroy) => destroy());
    },
  };
};
