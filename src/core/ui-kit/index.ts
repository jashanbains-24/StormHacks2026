import type Phaser from "phaser";

export { beginModal } from "./modal";

export {
  createDefaultOfficeLayout,
  createOfficeLayout,
  type AmbientNpcPlacement,
  type OfficePropPlacement,
} from "./office";
export {
  createTermFocusGroup,
  dismissTermCard,
  drawRichText,
  hasOpenedTerm,
  markTermOpened,
  onTermsChanged,
  openedTermIds,
  type RichTextStyle,
  type TermFocusGroup,
} from "./terms";

export const colorHex = (color: number): string =>
  `#${color.toString(16).padStart(6, "0")}`;

export type UiContainer = Phaser.GameObjects.Container;
export type UiGameObject = Phaser.GameObjects.GameObject;
export type UiRectangle = Phaser.GameObjects.Rectangle;

export { createEmergencyEffects, type EmergencyEffects } from "./emergency";
export {
  createAlarmPath,
  fixtureRotationFor,
  roomLightingFor,
  type EmergencyMode,
} from "./emergencyLighting";
export type { EmergencyStaff } from "./emergencyStaff";
