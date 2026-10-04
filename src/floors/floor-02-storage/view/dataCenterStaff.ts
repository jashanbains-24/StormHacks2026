import type { FloorContext } from "../../../core/contracts";

const STAFF = [
  {
    id: "f02-maintenance-tech",
    texture: "ambient-3",
    x: 248,
    y: 646,
  },
  {
    id: "f02-cache-operator",
    texture: "ambient-1",
    x: 1188,
    y: 620,
  },
] as const;

export const createDataCenterStaff = (ctx: FloorContext): void => {
  STAFF.forEach((member) => {
    const npc = ctx.addNpc(member.x, member.y, member.id, {
      texture: member.texture,
      animationKey: null,
      staticBody: true,
    });
    ctx.scene.physics.add.collider(ctx.player, npc);
  });
};
