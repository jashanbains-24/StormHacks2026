import Phaser from "phaser";

import { BootScene } from "../scenes/BootScene";
import { FloorScene } from "../scenes/FloorScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { THEME } from "./theme";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

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
  scene: [BootScene, PreloadScene, FloorScene],
});
