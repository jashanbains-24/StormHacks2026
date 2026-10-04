import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import type { FloorDialogueLine, FloorGlossaryEntry } from "../core/contracts";
import {
  createTermFocusGroup,
  dismissTermCard,
  drawRichText,
} from "../core/ui-kit";
import { preferences } from "../state/preferences";

const termMark = /\[\[[a-z0-9_.]+\]\]/i;

const usesInlineTerms = (line: FloorDialogueLine): boolean =>
  termMark.test(line.text) ||
  (line.choices ?? []).some((choice) => termMark.test(choice.label));

export class SpeechBubble extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    line: FloorDialogueLine,
    glossaryById: Readonly<Record<string, FloorGlossaryEntry>>,
    onGlossary: (entry: FloorGlossaryEntry) => void,
    onChoice?: (choiceId: string) => void,
    onDismiss?: () => void,
  ) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(1100);

    if (!usesInlineTerms(line)) {
      this.buildClassic(line, glossaryById, onGlossary, onChoice, onDismiss);
      return;
    }
    this.buildRich(line, glossaryById, onChoice, onDismiss);
  }

  private buildClassic(
    line: FloorDialogueLine,
    glossaryById: Readonly<Record<string, FloorGlossaryEntry>>,
    onGlossary: (entry: FloorGlossaryEntry) => void,
    onChoice?: (choiceId: string) => void,
    onDismiss?: () => void,
  ): void {
    const hasChoices = (line.choices?.length ?? 0) > 0;
    const panelHeight = hasChoices ? 236 : 184;
    const y = GAME_HEIGHT - panelHeight - 52;
    const panel = this.scene.add
      .rectangle(52, y, GAME_WIDTH - 104, panelHeight, THEME.colors.panel, 0.98)
      .setOrigin(0)
      .setStrokeStyle(4, THEME.colors.ink);
    const speaker = this.scene.add.text(80, y + 18, line.speakerName, {
      color: colorHex(THEME.colors.alertDark),
      fontFamily: THEME.fonts.family,
      fontSize: "19px",
      fontStyle: "bold",
    });
    const body = this.scene.add.text(80, y + 50, line.text, {
      color: colorHex(THEME.colors.ink),
      fontFamily: THEME.fonts.family,
      fontSize: "19px",
      lineSpacing: 5,
      wordWrap: { width: GAME_WIDTH - 170 },
    });
    const close = this.scene.add
      .text(GAME_WIDTH - 83, y + 14, "×", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.family,
        fontSize: "28px",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => {
        this.destroy();
        onDismiss?.();
      });
    this.add([panel, speaker, body, close]);

    if (hasChoices) {
      line.choices?.forEach((choice, index) => {
        const button = this.scene.add
          .text(80, y + 108 + index * 36, `${index + 1}. ${choice.label}`, {
            color: colorHex(THEME.colors.white),
            backgroundColor: colorHex(THEME.colors.panelDark),
            fontFamily: THEME.fonts.family,
            fontSize: "15px",
            fontStyle: "bold",
            padding: { x: 10, y: 6 },
          })
          .setInteractive({ useHandCursor: true })
          .on("pointerup", () => {
            this.destroy();
            onChoice?.(choice.id);
          });
        this.add(button);
      });
      return;
    }

    let chipX = 80;
    let chipY = y + 134;
    for (const glossaryId of line.glossaryIds ?? []) {
      const entry = glossaryById[glossaryId];
      if (!entry) continue;
      const chip = this.scene.add
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
  }

  private buildRich(
    line: FloorDialogueLine,
    glossaryById: Readonly<Record<string, FloorGlossaryEntry>>,
    onChoice?: (choiceId: string) => void,
    onDismiss?: () => void,
  ): void {
    const focus = createTermFocusGroup(this.scene);
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      dismissTermCard();
      focus.destroy();
    });

    const content = this.scene.add.container(0, 0);
    this.add(content);
    const body = drawRichText(
      this.scene,
      content,
      line.text,
      0,
      0,
      GAME_WIDTH - 220,
      {
        color: colorHex(THEME.colors.ink),
        fontSize: "19px",
        underline: THEME.colors.alertDark,
        reducedMotion: preferences.snapshot.reducedMotion,
      },
      glossaryById,
      focus,
    );

    let cursorY = body.height + 8;
    line.choices?.forEach((choice, index) => {
      const row = drawRichText(
        this.scene,
        content,
        `${index + 1}. ${choice.label}`,
        12,
        cursorY + 8,
        GAME_WIDTH - 240,
        {
          color: colorHex(THEME.colors.white),
          fontSize: "15px",
          underline: THEME.colors.successLight,
          reducedMotion: preferences.snapshot.reducedMotion,
        },
        glossaryById,
        focus,
      );
      const background = this.scene.add
        .rectangle(
          0,
          cursorY,
          Math.max(280, row.width + 28),
          row.height + 10,
          THEME.colors.panelDark,
        )
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .on("pointerup", () => {
          this.destroy();
          onChoice?.(choice.id);
        });
      content.addAt(background, 0);
      cursorY += row.height + 16;
    });

    const panelHeight = Math.max(184, cursorY + 78);
    const y = GAME_HEIGHT - panelHeight - 52;
    const panel = this.scene.add
      .rectangle(52, y, GAME_WIDTH - 104, panelHeight, THEME.colors.panel, 0.98)
      .setOrigin(0)
      .setStrokeStyle(4, THEME.colors.ink);
    const speaker = this.scene.add.text(80, y + 16, line.speakerName, {
      color: colorHex(THEME.colors.alertDark),
      fontFamily: THEME.fonts.family,
      fontSize: "19px",
      fontStyle: "bold",
    });
    const close = this.scene.add
      .text(GAME_WIDTH - 83, y + 12, "×", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.family,
        fontSize: "28px",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => {
        this.destroy();
        onDismiss?.();
      });
    content.setPosition(80, y + 52);
    this.add([panel, speaker, close]);
    this.sendToBack(panel);
  }
}
