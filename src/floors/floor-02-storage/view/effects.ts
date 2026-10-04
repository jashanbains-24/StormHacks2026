import type { EffectsHandle, FloorContext } from "../../../core/contracts";
import {
  createEmergencyEffects,
  type EmergencyMode,
} from "../../../core/ui-kit";
import { createAmbientEquipmentEffects } from "./ambientEffects";
import { createDataCenterStaff } from "./dataCenterStaff";
import { createStalePriceEffects } from "./stalePriceEffects";
import {
  getIncidentVisualState,
  INCIDENT_VISUAL_EVENT,
  type IncidentVisualState,
} from "./incidentVisualState";

export const emergencyModeFor = (
  state: IncidentVisualState,
  preview: FloorContext["preview"],
): EmergencyMode => {
  if (preview.enabled && preview.state !== "calm")
    return preview.state === "fixed" ? "resolved" : "emergency";
  return state === "resolved" ? "resolved" : "emergency";
};

export const createEffects = (ctx: FloorContext): EffectsHandle => {
  const ambientEffects = createAmbientEquipmentEffects(ctx);
  const stalePriceEffects = createStalePriceEffects(ctx);
  const emergencyEffects = createEmergencyEffects(
    ctx,
    createDataCenterStaff(ctx),
    emergencyModeFor(getIncidentVisualState(ctx), ctx.preview),
  );
  const refreshEmergency = (state: IncidentVisualState): void => {
    emergencyEffects.setMode(emergencyModeFor(state, ctx.preview));
  };
  ctx.scene.events.on(INCIDENT_VISUAL_EVENT, refreshEmergency);
  let alive = true;
  const destroy = (): void => {
    if (!alive) return;
    alive = false;
    ctx.scene.events.off("shutdown", destroy);
    ctx.scene.events.off(INCIDENT_VISUAL_EVENT, refreshEmergency);
    ambientEffects.destroy();
    stalePriceEffects.destroy();
    emergencyEffects.destroy();
  };
  ctx.scene.events.once("shutdown", destroy);
  return { destroy };
};
