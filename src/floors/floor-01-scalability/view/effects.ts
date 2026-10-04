import type {
  EffectsHandle,
  FloorContext,
  FloorPreviewState,
} from "../../../core/contracts";
import type { RoamingNpcRuntime } from "./runtime";
import { getSceneRuntime } from "./runtime";

export type F01EmergencyMode = "emergency" | "resolved";

interface EmergencyModeInput {
  previewEnabled: boolean;
  previewState: FloorPreviewState;
  resolvedThisSession: boolean;
}

interface AlarmPoint {
  x: number;
  y: number;
}

export const resolveEmergencyMode = ({
  previewEnabled,
  previewState,
  resolvedThisSession,
}: EmergencyModeInput): F01EmergencyMode => {
  if (previewEnabled) {
    if (previewState === "fixed") return "resolved";
    return "emergency";
  }
  return resolvedThisSession ? "resolved" : "emergency";
};

export const createAlarmPath = (
  width: number,
  height: number,
): AlarmPoint[] => {
  const left = 58;
  const right = width - 58;
  const top = 96;
  const bottom = height - 50;
  return [
    { x: width * 0.32, y: top },
    { x: width * 0.68, y: top },
    { x: right, y: height * 0.36 },
    { x: right, y: height * 0.7 },
    { x: width * 0.68, y: bottom },
    { x: width * 0.32, y: bottom },
    { x: left, y: height * 0.7 },
    { x: left, y: height * 0.36 },
  ];
};

const startNormalRoute = (
  ctx: FloorContext,
  { npc, plan }: RoamingNpcRuntime,
): void => {
  if (ctx.preferences.reducedMotion) return;
  ctx.scene.tweens.add({
    targets: npc,
    x: plan.toX,
    y: plan.toY,
    duration: plan.durationMs,
    ease: "Sine.easeInOut",
    yoyo: true,
    repeat: -1,
    yoyoDelay: 1400,
    repeatDelay: 1400,
  });
};

const createRaisedArms = (
  ctx: FloorContext,
  { npc }: RoamingNpcRuntime,
  index: number,
): void => {
  const skin = 0xf1bd91;
  const rig = ctx.scene.add.container(npc.x, npc.y);
  const leftArm = ctx.scene.add
    .rectangle(-13, -3, 6, 23, skin)
    .setOrigin(0.5, 1)
    .setAngle(-28);
  const rightArm = ctx.scene.add
    .rectangle(13, -3, 6, 23, skin)
    .setOrigin(0.5, 1)
    .setAngle(28);
  const leftHand = ctx.scene.add.circle(-23, -25, 4, skin);
  const rightHand = ctx.scene.add.circle(23, -25, 4, skin);
  const alarm = ctx.scene.add
    .text(0, -57, "!!", {
      color: "#ffffff",
      backgroundColor: "#d64045",
      fontFamily: ctx.theme.fonts.mono,
      fontSize: "13px",
      fontStyle: "bold",
      padding: { x: 4, y: 1 },
    })
    .setOrigin(0.5);
  rig.add([leftArm, rightArm, leftHand, rightHand, alarm]);
  ctx.addUpdater(() => {
    rig.setPosition(npc.x, npc.y).setDepth(npc.y + 2);
  });
  ctx.scene.tweens.add({
    targets: leftArm,
    angle: { from: -58, to: -18 },
    duration: 125 + index * 12,
    yoyo: true,
    repeat: -1,
  });
  ctx.scene.tweens.add({
    targets: rightArm,
    angle: { from: 58, to: 18 },
    duration: 140 + index * 12,
    yoyo: true,
    repeat: -1,
  });
  ctx.scene.tweens.add({
    targets: [leftHand, rightHand],
    y: { from: -29, to: -22 },
    duration: 130,
    yoyo: true,
    repeat: -1,
  });
};

const startPanicRoute = (
  ctx: FloorContext,
  runtime: RoamingNpcRuntime,
  index: number,
): void => {
  const { npc } = runtime;
  if (ctx.preferences.reducedMotion) {
    ctx.scene.add
      .text(npc.x, npc.y - 58, "!", {
        color: "#ffffff",
        backgroundColor: "#d64045",
        fontFamily: ctx.theme.fonts.mono,
        fontSize: "18px",
        fontStyle: "bold",
        padding: { x: 5, y: 1 },
      })
      .setOrigin(0.5)
      .setDepth(650);
    return;
  }

  createRaisedArms(ctx, runtime, index);
  const sprint = (): void => {
    if (!npc.active) return;
    const x = 660 + Math.random() * 390;
    const y = 260 + Math.random() * 310;
    ctx.scene.tweens.add({
      targets: npc,
      x,
      y,
      duration: 560 + Math.random() * 420,
      ease: "Sine.easeInOut",
      delay: index * 80,
      onComplete: sprint,
    });
  };

  ctx.scene.tweens.add({
    targets: npc,
    angle: { from: -7, to: 7 },
    duration: 105 + index * 12,
    ease: "Sine.easeInOut",
    yoyo: true,
    repeat: -1,
  });
  sprint();
};

const createWallAlarms = (ctx: FloorContext, mode: F01EmergencyMode): void => {
  const path = createAlarmPath(ctx.scene.scale.width, ctx.scene.scale.height);
  const alarmColor =
    mode === "emergency" ? ctx.theme.colors.alert : ctx.theme.colors.success;
  path.forEach(({ x, y }, index) => {
    const glow = ctx.scene.add
      .circle(x, y, 34, alarmColor, mode === "emergency" ? 0.24 : 0.11)
      .setDepth(691)
      .setBlendMode("ADD");
    const flare = ctx.scene.add
      .rectangle(x, y, 92, 9, alarmColor, 0.19)
      .setOrigin(0, 0.5)
      .setDepth(690)
      .setBlendMode("ADD")
      .setVisible(mode === "emergency");
    ctx.scene.add
      .rectangle(x, y + 10, 38, 9, ctx.theme.colors.panelDark)
      .setDepth(693);
    ctx.scene.add
      .ellipse(x, y, 30, 26, alarmColor, 0.82)
      .setStrokeStyle(3, ctx.theme.colors.panelDark)
      .setDepth(694);
    ctx.scene.add.circle(x, y - 1, 7, alarmColor, 1).setDepth(695);

    if (mode !== "emergency" || ctx.preferences.reducedMotion) return;
    flare.setAngle(index * 45);
    ctx.scene.tweens.add({
      targets: flare,
      angle: flare.angle + 360,
      duration: 920,
      delay: index * 75,
      repeat: -1,
    });
    ctx.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.12, to: 0.42 },
      scale: { from: 0.8, to: 1.12 },
      duration: 430,
      delay: index * 55,
      yoyo: true,
      repeat: -1,
    });
  });
};

const createEmergencyPulse = (
  ctx: FloorContext,
  mode: F01EmergencyMode,
): void => {
  if (mode !== "emergency" || ctx.preferences.reducedMotion) return;
  const overlay = ctx.scene.add
    .rectangle(
      ctx.scene.scale.width / 2,
      ctx.scene.scale.height / 2,
      ctx.scene.scale.width,
      ctx.scene.scale.height,
      ctx.theme.colors.alert,
      0,
    )
    .setScrollFactor(0)
    .setDepth(695);

  const pulse = (): void => {
    if (!overlay.active) return;
    ctx.scene.tweens.add({
      targets: overlay,
      alpha: { from: 0, to: 0.17 },
      duration: 145,
      hold: 65,
      yoyo: true,
    });
    ctx.scene.cameras.main.shake(180, 0.0022);
  };
  ctx.scene.time.delayedCall(550, pulse);
  ctx.scene.time.addEvent({ delay: 2200, loop: true, callback: pulse });
};

export const createEffects = (ctx: FloorContext): EffectsHandle => {
  const mode = resolveEmergencyMode({
    previewEnabled: ctx.preview.enabled,
    previewState: ctx.preview.state,
    resolvedThisSession: ctx.progression.completedThisSession(ctx.floorOrder),
  });
  const runtime = getSceneRuntime(ctx);

  runtime.roamingNpcs.forEach((npc, index) => {
    if (mode === "emergency") startPanicRoute(ctx, npc, index);
    else startNormalRoute(ctx, npc);
  });
  createWallAlarms(ctx, mode);
  createEmergencyPulse(ctx, mode);

  return {};
};
