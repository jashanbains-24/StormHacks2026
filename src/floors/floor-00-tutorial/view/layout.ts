import type { FloorContext, LayoutHandle } from "../../../core/contracts";
import { createDefaultOfficeLayout } from "../../../core/ui-kit";

export const createLayout = (ctx: FloorContext): LayoutHandle => {
  createDefaultOfficeLayout(ctx);
  return {};
};
