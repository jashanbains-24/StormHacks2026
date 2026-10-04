import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import type { FloorDialogueLine, FloorGlossaryEntry } from "../core/contracts";

interface SpeechBubbleActions {
  onClose?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export class SpeechBubble extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    line: FloorDialogueLine,
    glossaryById: Readonly<Record<string, FloorGlossaryEntry>>,
    onGlossary: (entry: FloorGlossaryEntry) => void,
    actions: SpeechBubbleActions = {},
  ) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(1100);

    const y = GAME_HEIGHT - 236;
    const panel = scene.add
      .rectangle(52, y, GAME_WIDTH - 104, 184, THEME.colors.panel, 0.98)
      .setOrigin(0)
      .setStrokeStyle(4, THEME.colors.ink);
    const speaker = scene.add.text(80, y + 18, line.speakerName, {
      color: colorHex(THEME.colors.alertDark),
      fontFamily: THEME.fonts.family,
      fontSize: "19px",
      fontStyle: "bold",
    });
    const body = scene.add.text(80, y + 50, line.text, {
      color: colorHex(THEME.colors.ink),
      fontFamily: THEME.fonts.family,
      fontSize: "19px",
      lineSpacing: 5,
      wordWrap: { width: GAME_WIDTH - 170 },
    });
    const close = scene.add
      .text(GAME_WIDTH - 83, y + 14, "×", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.family,
        fontSize: "28px",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => (actions.onClose ?? (() => this.destroy()))());
    this.add([panel, speaker, body, close]);

    let chipX = 80;
    let chipY = y + 134;
    for (const glossaryId of line.glossaryIds ?? []) {
      const entry = glossaryById[glossaryId];
      if (!entry) continue;
      const chip = scene.add
        .text(chipX, chipY, entry.term, {
          color: colorHex(THEME.colors.white),
          backgroundColor: colorHex(THEME.colors.panelDark),
          fontFamily: THEME.fonts.family,
          fontSize: "14px",
          fontStyle: "bold",
          padding: { x: 9, y: 5 },
        })
        .setInteractive({ useHandCursor: true })
        .on("pointerup", () => onGlossary(entry));
      if (chipX + chip.width > GAME_WIDTH - 100) {
        chipX = 80;
        chipY += 32;
        chip.setPosition(chipX, chipY);
      }
      chipX += chip.width + 9;
      this.add(chip);
    }

    if (actions.actionLabel && actions.onAction) {
      const action = scene.add
        .text(GAME_WIDTH - 92, y + 140, actions.actionLabel, {
          color: colorHex(THEME.colors.white),
          backgroundColor: colorHex(THEME.colors.success),
          fontFamily: THEME.fonts.mono,
          fontSize: "15px",
          fontStyle: "bold",
          padding: { x: 12, y: 7 },
        })
        .setOrigin(1, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerup", actions.onAction);
      this.add(action);
    }
  }
}
