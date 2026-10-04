import { FLOOR_CONTRACT_VERSION, type FloorModule } from "../../core/contracts";
import { assets } from "./assets/manifest";
import { content } from "./definition/content";
import { incident } from "./definition/incident";
import { theme } from "./theme";
import { createBuildUI } from "./view/buildUI";
import { createEffects } from "./view/effects";
import { createLayout } from "./view/layout";

const floor: FloorModule = {
  contractVersion: FLOOR_CONTRACT_VERSION,
  id: "f02",
  title: "Floor 2: Data Storage / Caching",
  category: "Data Storage / Caching",
  definition: { content, incident },
  view: { createLayout, createBuildUI, createEffects },
  assets,
  theme,
};

export default floor;
