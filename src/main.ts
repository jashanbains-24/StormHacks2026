import Phaser from "phaser";

import { createGameConfig } from "./config/gameConfig";

document.addEventListener("DOMContentLoaded", () => {
  new Phaser.Game(createGameConfig("game-container"));
});
