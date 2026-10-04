import type { FloorContext } from "../contracts";
import { AMBIENT_NPCS_BY_FLOOR, OFFICE_PROPS } from "../../data/office";

export interface OfficePropPlacement {
  x: number;
  y: number;
  texture: string;
  scale?: number;
  collider?: boolean;
  depthOffset?: number;
}

export type AmbientNpcBehavior =
  | { kind: "desk" }
  | {
      kind: "route";
      toX: number;
      toY: number;
      durationMs: number;
      pauseMs: number;
    };

export interface AmbientNpcPlacement {
  id: string;
  x: number;
  y: number;
  texture: string;
  behavior: AmbientNpcBehavior;
  flipX?: boolean;
}

export const createOfficeLayout = (
  ctx: FloorContext,
  props: OfficePropPlacement[],
  npcs: AmbientNpcPlacement[],
): void => {
  for (const prop of props) {
    const image = ctx.scene.physics.add
      .staticImage(prop.x, prop.y, prop.texture)
      .setScale(prop.scale ?? 3)
      .setDepth(prop.y + (prop.depthOffset ?? 0));
    image.refreshBody();
    if (prop.collider ?? true) {
      ctx.scene.physics.add.collider(ctx.player, image);
    }
  }

  for (const placement of npcs) {
    const moving =
      placement.behavior.kind === "route" && !ctx.preferences.reducedMotion;
    const npc = ctx.addNpc(placement.x, placement.y, placement.id, {
      texture: placement.texture,
      flipX: placement.flipX,
      animationKey:
        !ctx.preferences.reducedMotion && placement.behavior.kind === "desk"
          ? `office-${placement.texture}-type`
          : null,
      staticBody: !moving,
    });
    ctx.scene.physics.add.collider(ctx.player, npc);
    if (moving && placement.behavior.kind === "route") {
      ctx.addUpdater(() => npc.updateMovementAnimation());
      ctx.scene.tweens.add({
        targets: npc,
        x: placement.behavior.toX,
        y: placement.behavior.toY,
        duration: placement.behavior.durationMs,
        yoyo: true,
        repeat: -1,
        yoyoDelay: placement.behavior.pauseMs,
        repeatDelay: placement.behavior.pauseMs,
      });
    }
  }
};

export const createDefaultOfficeLayout = (ctx: FloorContext): void => {
  createOfficeLayout(
    ctx,
    OFFICE_PROPS,
    AMBIENT_NPCS_BY_FLOOR[ctx.floorOrder] ?? [],
  );
};
