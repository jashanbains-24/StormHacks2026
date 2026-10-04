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
    { x: right, y: 160 },
    { x: right, y: height - 160 },
    { x: width * 0.68, y: bottom },
    { x: width * 0.32, y: bottom },
    { x: left, y: height - 160 },
    { x: left, y: 160 },
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
    duration: 210 + index * 14,
    yoyo: true,
    repeat: -1,
  });
  ctx.scene.tweens.add({
    targets: rightArm,
    angle: { from: 58, to: 18 },
    duration: 230 + index * 14,
    yoyo: true,
    repeat: -1,
  });
  ctx.scene.tweens.add({
    targets: [leftHand, rightHand],
    y: { from: -29, to: -22 },
    duration: 220,
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
  let targetX = npc.x;
  let targetY = npc.y;
  let nextTurnAt = 0;
  let speed = 105;
  const chooseDirection = (): void => {
    targetX = 620 + Math.random() * 460;
    targetY = 270 + Math.random() * 290;
    speed = 105 + index * 7 + Math.random() * 14;
    nextTurnAt = ctx.scene.time.now + 900 + Math.random() * 1000;
  };
  ctx.addUpdater(() => {
    if (!npc.active) return;
    const distance = Math.hypot(targetX - npc.x, targetY - npc.y);
    if (ctx.scene.time.now >= nextTurnAt || distance < 18) chooseDirection();
    const currentDistance = Math.hypot(targetX - npc.x, targetY - npc.y);
    if (currentDistance === 0) return;
    npc.setVelocity(
      ((targetX - npc.x) / currentDistance) * speed,
      ((targetY - npc.y) / currentDistance) * speed,
    );
  });

  ctx.scene.tweens.add({
    targets: npc,
    angle: { from: -3, to: 3 },
    duration: 240 + index * 18,
    ease: "Sine.easeInOut",
    yoyo: true,
    repeat: -1,
  });
};

const createWallAlarms = (ctx: FloorContext, mode: F01EmergencyMode): void => {
  const path = createAlarmPath(ctx.scene.scale.width, ctx.scene.scale.height);
  const alarmColor =
    mode === "emergency" ? ctx.theme.colors.alert : ctx.theme.colors.success;
  path.forEach(({ x, y }, index) => {
    const glow = ctx.scene.add
      .circle(x, y, 26, alarmColor, mode === "emergency" ? 0.22 : 0.1)
      .setDepth(691)
      .setBlendMode("ADD");
    const flare = ctx.scene.add
      .rectangle(x, y, 56, 7, alarmColor, 0.18)
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
  if (mode !== "emergency") return;
  const baseTint = 0.04;
  const overlay = ctx.scene.add
    .rectangle(
      ctx.scene.scale.width / 2,
      ctx.scene.scale.height / 2,
      ctx.scene.scale.width,
      ctx.scene.scale.height,
      ctx.theme.colors.alert,
      baseTint,
    )
    .setScrollFactor(0)
    .setDepth(695);
  if (ctx.preferences.reducedMotion) return;

  const pulse = (): void => {
    if (!overlay.active) return;
    ctx.scene.tweens.add({
      targets: overlay,
      alpha: { from: baseTint, to: 0.19 },
      duration: 175,
      hold: 90,
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
