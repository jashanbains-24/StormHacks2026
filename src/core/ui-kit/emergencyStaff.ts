import type { FloorContext } from "../contracts";
import type { EffectScope } from "./effectScope";

export interface EmergencyStaff {
  npc: ReturnType<FloorContext["addNpc"]>;
  plan: {
    toX: number;
    toY: number;
    durationMs: number;
    panicBounds?: { x: number; y: number; width: number; height: number };
  };
}

export const startNormalRoute = (
  ctx: FloorContext,
  { npc, plan }: EmergencyStaff,
  scope: EffectScope,
): void => {
  if (ctx.preferences.reducedMotion) return;
  scope.tween({
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

const createPanicMarker = (
  ctx: FloorContext,
  { npc }: EmergencyStaff,
  scope: EffectScope,
): void => {
  const reducedMotion = ctx.preferences.reducedMotion;
  const marker = scope.object(
    ctx.scene.add
      .text(npc.x, npc.y - 58, reducedMotion ? "!" : "!!", {
        color: "#ffffff",
        backgroundColor: "#d64045",
        fontFamily: ctx.theme.fonts.mono,
        fontSize: reducedMotion ? "18px" : "13px",
        fontStyle: "bold",
        padding: { x: 4, y: 1 },
      })
      .setOrigin(0.5)
      .setDepth(npc.y + 2),
  );
  scope.update(() => {
    if (npc.active) marker.setPosition(npc.x, npc.y - 58).setDepth(npc.y + 2);
  });
};

export const startPanicRoute = (
  ctx: FloorContext,
  runtime: EmergencyStaff,
  index: number,
  scope: EffectScope,
): void => {
  const { npc, plan } = runtime;
  createPanicMarker(ctx, runtime, scope);
  if (ctx.preferences.reducedMotion) return;

  let targetX = npc.x;
  let targetY = npc.y;
  let nextTurnAt = 0;
  let speed = 105;
  const chooseDirection = (): void => {
    const bounds = plan.panicBounds ?? {
      x: 620,
      y: 270,
      width: 460,
      height: 290,
    };
    targetX = bounds.x + Math.random() * bounds.width;
    targetY = bounds.y + Math.random() * bounds.height;
    speed = 105 + index * 7 + Math.random() * 14;
    nextTurnAt = ctx.scene.time.now + 900 + Math.random() * 1000;
  };
  scope.update(() => {
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
};
