import type {
  EffectsHandle,
  FloorContext,
  FloorPreviewState,
} from "../../../core/contracts";
import {
  createEmergencyEffects,
  type EmergencyMode,
} from "../../../core/ui-kit";
import { getSceneRuntime } from "./runtime";

export {
  createAlarmPath,
  fixtureRotationFor,
  roomLightingFor,
} from "../../../core/ui-kit";
export type F01EmergencyMode = EmergencyMode;

interface EmergencyModeInput {
  previewEnabled: boolean;
  previewState: FloorPreviewState;
  resolvedThisSession: boolean;
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

export const createEffects = (ctx: FloorContext): EffectsHandle => {
  const mode = resolveEmergencyMode({
    previewEnabled: ctx.preview.enabled,
    previewState: ctx.preview.state,
    resolvedThisSession: ctx.progression.canonicalThisSession(ctx.floorOrder),
  });
  const runtime = getSceneRuntime(ctx);

  return createEmergencyEffects(ctx, runtime.roamingNpcs, mode);
};
