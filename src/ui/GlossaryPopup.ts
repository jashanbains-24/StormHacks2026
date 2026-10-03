import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import type { GlossaryEntry } from "../data/glossary";

export class GlossaryPopup extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, entry: GlossaryEntry) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(1300);

    const scrim = scene.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, THEME.colors.ink, 0.56)
      .setOrigin(0)
      .setInteractive()
      .on("pointerup", () => this.destroy());
    const panel = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 610, 230, THEME.colors.panel)
      .setStrokeStyle(5, THEME.colors.warning);
    const eyebrow = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 77, "JARGON TRANSLATOR", {
        color: colorHex(THEME.colors.warning),
        fontFamily: THEME.fonts.mono,
        fontSize: "15px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const term = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 38, entry.term.toUpperCase(), {
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "28px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const definition = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18, entry.definition, {
        align: "center",
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "20px",
        wordWrap: { width: 520 },
      })
      .setOrigin(0.5);
    const close = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 84, "Click anywhere to close", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.family,
        fontSize: "14px",
      })
      .setOrigin(0.5);

    this.add([scrim, panel, eyebrow, term, definition, close]);
  }
}
