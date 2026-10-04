import type { FloorContext } from "../contracts";
import type { EffectScope } from "./effectScope";

export type EmergencyMode = "emergency" | "resolved";

export interface RoomLightingLevels {
  darkness: number;
  mood: number;
}

export const roomLightingFor = (mode: EmergencyMode): RoomLightingLevels =>
  mode === "emergency"
    ? { darkness: 0.2, mood: 0.065 }
    : { darkness: 0.07, mood: 0.035 };

interface AlarmPoint {
  x: number;
  y: number;
  inwardAngle: number;
}

export const createAlarmPath = (
  width: number,
  height: number,
): AlarmPoint[] => {
  const left = 58;
  const right = width - 58;
  const top = 96;
  const bottom = height - 50;
  return [
    { x: width * 0.27, y: top, inwardAngle: 90 },
    { x: width * 0.5, y: top, inwardAngle: 90 },
    { x: right, y: 160, inwardAngle: 180 },
    { x: right, y: height - 160, inwardAngle: 180 },
    { x: width * 0.68, y: bottom, inwardAngle: 270 },
    { x: width * 0.32, y: bottom, inwardAngle: 270 },
    { x: left, y: height - 160, inwardAngle: 0 },
    { x: left, y: 160, inwardAngle: 0 },
  ];
};

export const fixtureRotationFor = (inwardAngle: number): number =>
  inwardAngle - 90;

export const createWallAlarms = (
  ctx: FloorContext,
  mode: EmergencyMode,
  scope: EffectScope,
): void => {
  const path = createAlarmPath(ctx.scene.scale.width, ctx.scene.scale.height);
  const alarmColor =
    mode === "emergency" ? ctx.theme.colors.alert : ctx.theme.colors.success;
  path.forEach(({ x, y, inwardAngle }, index) => {
    const outerGlow = ctx.scene.add
      .circle(x, y, 46, alarmColor, mode === "emergency" ? 0.08 : 0.035)
      .setDepth(690)
      .setBlendMode("ADD");
    const glow = ctx.scene.add
      .circle(x, y, 26, alarmColor, mode === "emergency" ? 0.22 : 0.1)
      .setDepth(691)
      .setBlendMode("ADD");
    const base = ctx.scene.add.rectangle(
      0,
      -10,
      38,
      9,
      ctx.theme.colors.panelDark,
    );
    const dome = ctx.scene.add
      .ellipse(0, 3, 30, 26, alarmColor, 0.82)
      .setStrokeStyle(3, ctx.theme.colors.panelDark);
    const core = ctx.scene.add.circle(0, 3, 7, alarmColor, 1);
    scope.object(
      ctx.scene.add
        .container(x, y, [base, dome, core])
        .setAngle(fixtureRotationFor(inwardAngle))
        .setDepth(693),
    );

    scope.object(outerGlow);
    scope.object(glow);
    if (ctx.preferences.reducedMotion) return;
    const duration = mode === "emergency" ? 420 : 1500;
    scope.tween({
      targets: outerGlow,
      alpha:
        mode === "emergency"
          ? { from: 0.025, to: 0.18 }
          : { from: 0.02, to: 0.08 },
      scale:
        mode === "emergency"
          ? { from: 0.75, to: 1.18 }
          : { from: 0.9, to: 1.05 },
      duration,
      delay: index * 65,
      yoyo: true,
      repeat: -1,
    });
    scope.tween({
      targets: glow,
      alpha:
        mode === "emergency"
          ? { from: 0.08, to: 0.48 }
          : { from: 0.07, to: 0.16 },
      scale:
        mode === "emergency"
          ? { from: 0.82, to: 1.15 }
          : { from: 0.95, to: 1.04 },
      duration,
      delay: index * 55,
      yoyo: true,
      repeat: -1,
    });
    scope.tween({
      targets: [dome, core],
      alpha:
        mode === "emergency" ? { from: 0.58, to: 1 } : { from: 0.78, to: 1 },
      duration,
      delay: index * 55,
      yoyo: true,
      repeat: -1,
    });
  });
};

export const createRoomLighting = (
  ctx: FloorContext,
  mode: EmergencyMode,
  scope: EffectScope,
  canShake: () => boolean,
): void => {
  const levels = roomLightingFor(mode);
  scope.object(
    ctx.scene.add
      .rectangle(
        ctx.scene.scale.width / 2,
        ctx.scene.scale.height / 2,
        ctx.scene.scale.width,
        ctx.scene.scale.height,
        ctx.theme.colors.ink,
        levels.darkness,
      )
      .setScrollFactor(0)
      .setDepth(685),
  );
  const mood = ctx.scene.add
    .rectangle(
      ctx.scene.scale.width / 2,
      ctx.scene.scale.height / 2,
      ctx.scene.scale.width,
      ctx.scene.scale.height,
      mode === "emergency" ? ctx.theme.colors.alert : ctx.theme.colors.success,
      levels.mood,
    )
    .setScrollFactor(0)
    .setDepth(689);
  scope.object(mood);
  if (ctx.preferences.reducedMotion) return;

  if (mode === "resolved") {
    scope.tween({
      targets: mood,
      alpha: { from: levels.mood * 0.7, to: levels.mood * 1.45 },
      duration: 1800,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
    return;
  }

  const pulse = (): void => {
    if (!mood.active) return;
    scope.tween({
      targets: mood,
      alpha: { from: levels.mood, to: 0.2 },
      duration: 210,
      hold: 110,
      yoyo: true,
    });
    if (canShake()) ctx.scene.cameras.main.shake(180, 0.0022);
  };
  scope.timer({ delay: 550, callback: pulse });
  scope.timer({ delay: 2200, loop: true, callback: pulse });
};
