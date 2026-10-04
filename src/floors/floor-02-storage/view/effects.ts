import type { EffectsHandle, FloorContext } from "../../../core/contracts";
import { createAmbientEquipmentEffects } from "./ambientEffects";
import { createStalePriceEffects } from "./stalePriceEffects";

export const createEffects = (ctx: FloorContext): EffectsHandle => {
  const ambientEffects = createAmbientEquipmentEffects(ctx);
  const stalePriceEffects = createStalePriceEffects(ctx);

  return {
    destroy: () => {
      ambientEffects.destroy();
      stalePriceEffects.destroy();
    },
  };
};
