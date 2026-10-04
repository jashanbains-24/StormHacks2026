import type { FloorContext } from "../../../core/contracts";
import type { EmergencyStaff } from "../../../core/ui-kit";
import { STAFF } from "../definition/staff";

export const createDataCenterStaff = (ctx: FloorContext): EmergencyStaff[] =>
  STAFF.map((plan) => {
    const npc = ctx.addNpc(plan.x, plan.y, plan.id, {
      texture: plan.texture,
      animationKey: null,
      staticBody: false,
    });
    ctx.scene.physics.add.collider(ctx.player, npc);
    ctx.addUpdater(() => npc.updateMovementAnimation());
    return { npc, plan };
  });
