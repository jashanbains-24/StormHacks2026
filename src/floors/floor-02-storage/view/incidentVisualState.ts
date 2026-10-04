import type { FloorContext } from "../../../core/contracts";

export type IncidentVisualState =
  "critical" | "localMismatch" | "warming" | "resolved";

export const INCIDENT_VISUAL_EVENT = "f02:incident_visual";
export const CACHE_MARKERS_EVENT = "f02:cache_markers";
export const DB_FLASH_EVENT = "f02:db_flash";
export const CELEBRATE_EVENT = "f02:celebrate";

const INCIDENT_VISUAL_KEY = "f02.incidentVisual";
const CACHE_MARKERS_KEY = "f02.cacheMarkers";

export const setIncidentVisualState = (
  ctx: FloorContext,
  state: IncidentVisualState,
): void => {
  ctx.scene.data.set(INCIDENT_VISUAL_KEY, state);
  ctx.scene.events.emit(INCIDENT_VISUAL_EVENT, state);
};

export const getIncidentVisualState = (
  ctx: FloorContext,
): IncidentVisualState => ctx.scene.data.get(INCIDENT_VISUAL_KEY) ?? "resolved";

export const setCacheMarkers = (ctx: FloorContext, visible: boolean): void => {
  ctx.scene.data.set(CACHE_MARKERS_KEY, visible);
  ctx.scene.events.emit(CACHE_MARKERS_EVENT, visible);
};

export const getCacheMarkers = (ctx: FloorContext): boolean =>
  ctx.scene.data.get(CACHE_MARKERS_KEY) === true;

export const flashDatabase = (ctx: FloorContext): void => {
  ctx.scene.events.emit(DB_FLASH_EVENT);
};

export const celebrateMonitors = (ctx: FloorContext): void => {
  ctx.scene.events.emit(CELEBRATE_EVENT);
};
