import type {
  EffectsHandle,
  FloorContext,
  FloorPreviewState,
} from "../../../core/contracts";
import type { RoamingNpcRuntime } from "./runtime";
import { getSceneRuntime } from "./runtime";

export type F01EmergencyMode = "calm" | "emergency" | "resolved";

interface EmergencyModeInput {
  previewEnabled: boolean;
  previewState: FloorPreviewState;
  completed: boolean;
}

interface AlarmPoint {
  x: number;
  y: number;
}

export const resolveEmergencyMode = ({
  previewEnabled,
  previewState,
  completed,
}: EmergencyModeInput): F01EmergencyMode => {
  if (previewEnabled) {
    if (previewState === "fixed") return "resolved";
    if (previewState === "strained" || previewState === "down") {
      return "emergency";
    }
    return "calm";
  }
  return completed ? "resolved" : "emergency";
};

export const createAlarmPath = (
  width: number,
  height: number,
): AlarmPoint[] => {
  const points: AlarmPoint[] = [];
  const left = 58;
  const right = width - 58;
  const top = 96;
  const bottom = height - 50;

  for (let x = 130; x <= right - 70; x += 105) points.push({ x, y: top });
  for (let y = top + 82; y <= bottom - 50; y += 82) {
    points.push({ x: right, y });
  }
  for (let x = right - 70; x >= left + 70; x -= 105) {
    points.push({ x, y: bottom });
  }
  for (let y = bottom - 50; y >= top + 82; y -= 82) {
    points.push({ x: left, y });
  }
  return points;
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
    mode === "resolved" ? ctx.theme.colors.success : ctx.theme.colors.alert;
  const glows = path.map(({ x, y }) => {
    ctx.scene.add.circle(x, y, 9, ctx.theme.colors.panelDark).setDepth(690);
    ctx.scene.add.circle(x, y, 6, alarmColor, 0.95).setDepth(692);
    return ctx.scene.add
      .circle(x, y, 22, alarmColor, mode === "emergency" ? 0.22 : 0.13)
      .setDepth(691)
      .setBlendMode("ADD");
  });

  if (mode !== "emergency" || ctx.preferences.reducedMotion) return;
  ctx.addUpdater(() => {
    const lead = Math.floor(ctx.scene.time.now / 115) % glows.length;
    glows.forEach((glow, index) => {
      const distance = (index - lead + glows.length) % glows.length;
      glow.setAlpha(distance < 4 ? 0.52 - distance * 0.1 : 0.08);
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

  ctx.scene.time.addEvent({
    delay: 2450,
    loop: true,
    callback: () => {
      if (!overlay.active) return;
      ctx.scene.tweens.add({
        targets: overlay,
        alpha: { from: 0, to: 0.1 },
        duration: 95,
        yoyo: true,
      });
      ctx.scene.cameras.main.shake(110, 0.0011);
    },
  });
};

export const createEffects = (ctx: FloorContext): EffectsHandle => {
  const mode = resolveEmergencyMode({
    previewEnabled: ctx.preview.enabled,
    previewState: ctx.preview.state,
    completed: ctx.progression.resultFor(ctx.floorOrder) !== undefined,
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
