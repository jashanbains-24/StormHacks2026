import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";
import { THEME, colorHex } from "../config/theme";

export class FloorScene extends Phaser.Scene {
  constructor() {
    super("FloorScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(THEME.colors.officeFloor);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 28, "THE WEBSITE IS DOWN.", {
        color: colorHex(THEME.colors.alertDark),
        fontFamily: THEME.fonts.family,
        fontSize: "44px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 + 30,
        "Office systems are coming online.",
        {
          color: colorHex(THEME.colors.ink),
          fontFamily: THEME.fonts.family,
          fontSize: "22px",
        },
      )
      .setOrigin(0.5);
  }
}
