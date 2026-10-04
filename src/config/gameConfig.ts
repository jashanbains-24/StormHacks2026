import Phaser from "phaser";

import { BuildScene } from "../scenes/BuildScene";
import { BootScene } from "../scenes/BootScene";
import { FloorScene } from "../core/runtime/FloorScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { StartMenuScene } from "../scenes/StartMenuScene";
import { UIScene } from "../scenes/UIScene";
import { GlossaryScene } from "../scenes/GlossaryScene";
import { GAME_HEIGHT, GAME_WIDTH } from "./dimensions";
import { THEME } from "./theme";

export const createGameConfig = (
  parent: string,
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: THEME.colors.ink,
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    PreloadScene,
    StartMenuScene,
    FloorScene,
    BuildScene,
    UIScene,
    GlossaryScene,
  ],
});
