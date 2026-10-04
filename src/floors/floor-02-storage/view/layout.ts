import type { FloorContext, LayoutHandle } from "../../../core/contracts";
import { createDataCenterShell, createStorageEquipment } from "./dataCenter";
import { createDataCenterInfrastructure } from "./dataCenterInfrastructure";
import { createDataCenterStaff } from "./dataCenterStaff";
import { createStalePriceIncident } from "./stalePriceIncident";

export const createLayout = (ctx: FloorContext): LayoutHandle => {
  createDataCenterShell(ctx);
  createDataCenterInfrastructure(ctx);
  createStorageEquipment(ctx);
  createDataCenterStaff(ctx);
  createStalePriceIncident(ctx);
  return {};
};
