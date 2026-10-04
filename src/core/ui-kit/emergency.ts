import type { FloorContext } from "../contracts";
import { EffectScope } from "./effectScope";
import {
  createRoomLighting,
  createWallAlarms,
  type EmergencyMode,
} from "./emergencyLighting";
import {
  startNormalRoute,
  startPanicRoute,
  type EmergencyStaff,
} from "./emergencyStaff";

export interface EmergencyEffects {
  setMode(mode: EmergencyMode): void;
  destroy(): void;
}

/** Shared room effects; floors own the incident state and staff aisle plans. */
export const createEmergencyEffects = (
  ctx: FloorContext,
  staff: readonly EmergencyStaff[],
  initialMode: EmergencyMode,
): EmergencyEffects => {
  let mode: EmergencyMode | undefined;
  let scope: EffectScope | undefined;
  let alive = true;
  const modals = new Set<object>();
  const modalOpened = (token: object): void => {
    modals.add(token);
    ctx.scene.cameras.main.shakeEffect.reset();
  };
  const modalClosed = (token: object): void => {
    modals.delete(token);
  };
  ctx.scene.game.events.on("ui:modal-opened", modalOpened);
  ctx.scene.game.events.on("ui:modal-closed", modalClosed);

  const clearMode = (): void => {
    scope?.destroy();
    staff.forEach(({ npc }) => {
      if (npc.active) npc.setVelocity(0, 0).setAngle(0);
    });
    ctx.scene.cameras.main.shakeEffect.reset();
  };

  const setMode = (next: EmergencyMode): void => {
    if (!alive || mode === next) return;
    if (scope) clearMode();
    mode = next;
    const nextScope = new EffectScope(ctx);
    scope = nextScope;
    createRoomLighting(ctx, next, nextScope, () => modals.size === 0);
    staff.forEach((member, index) => {
      if (next === "emergency") startPanicRoute(ctx, member, index, nextScope);
      else startNormalRoute(ctx, member, nextScope);
    });
    createWallAlarms(ctx, next, nextScope);
  };

  const destroy = (): void => {
    if (!alive) return;
    alive = false;
    ctx.scene.events.off("shutdown", destroy);
    ctx.scene.game.events.off("ui:modal-opened", modalOpened);
    ctx.scene.game.events.off("ui:modal-closed", modalClosed);
    clearMode();
  };
  ctx.scene.events.once("shutdown", destroy);
  setMode(initialMode);
  return { setMode, destroy };
};
