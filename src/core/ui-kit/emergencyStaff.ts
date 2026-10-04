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

const createRaisedArms = (
  ctx: FloorContext,
  { npc }: EmergencyStaff,
  index: number,
  scope: EffectScope,
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
  scope.object(rig);
  scope.update(() => {
    rig.setPosition(npc.x, npc.y).setDepth(npc.y + 2);
  });
  scope.tween({
    targets: leftArm,
    angle: { from: -58, to: -18 },
    duration: 210 + index * 14,
    yoyo: true,
    repeat: -1,
  });
  scope.tween({
    targets: rightArm,
    angle: { from: 58, to: 18 },
    duration: 230 + index * 14,
    yoyo: true,
    repeat: -1,
  });
  scope.tween({
    targets: [leftHand, rightHand],
    y: { from: -29, to: -22 },
    duration: 220,
    yoyo: true,
    repeat: -1,
  });
};

export const startPanicRoute = (
  ctx: FloorContext,
  runtime: EmergencyStaff,
  index: number,
  scope: EffectScope,
): void => {
  const { npc, plan } = runtime;
  if (ctx.preferences.reducedMotion) {
    scope.object(
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
        .setDepth(650),
    );
    return;
  }

  createRaisedArms(ctx, runtime, index, scope);
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

  scope.tween({
    targets: npc,
    angle: { from: -3, to: 3 },
    duration: 240 + index * 18,
    ease: "Sine.easeInOut",
    yoyo: true,
    repeat: -1,
  });
};
