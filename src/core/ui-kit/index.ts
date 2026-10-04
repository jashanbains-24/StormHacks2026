export {
  createDefaultOfficeLayout,
  createOfficeLayout,
  type AmbientNpcPlacement,
  type OfficePropPlacement,
} from "./office";

export const colorHex = (color: number): string =>
  `#${color.toString(16).padStart(6, "0")}`;
