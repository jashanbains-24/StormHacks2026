import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";
import { THEME, colorHex } from "../config/theme";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(THEME.colors.paper);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 16, "UPTIME", {
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "42px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 32, "Waking the servers…", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.family,
        fontSize: "18px",
      })
      .setOrigin(0.5);

    this.time.delayedCall(300, () => this.scene.start("FloorScene"));
  }
}
