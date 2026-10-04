import type Phaser from "phaser";

import { THEME, colorHex } from "../config/theme";
import type { FloorGlossaryEntry } from "../core/contracts";
import { preferences } from "../state/preferences";
import { holdTermCard, releaseTermCard, showTermCard } from "./TermCard";
import { hasOpenedTerm, markTermOpened } from "./termMemory";

export interface TermFocusGroup {
  track(target: Phaser.GameObjects.Text, activate: () => void): void;
  destroy(): void;
}

export const createTermFocusGroup = (scene: Phaser.Scene): TermFocusGroup => {
  const items: { target: Phaser.GameObjects.Text; activate: () => void }[] = [];
  let index = -1;
  let disposed = false;
  const tab = scene.input.keyboard?.addKey(9);
  const enter = scene.input.keyboard?.addKey(13);
  scene.input.keyboard?.addCapture(9);

  const paint = (): void => {
    items.forEach((item, itemIndex) => {
      item.target.setBackgroundColor(
        itemIndex === index
          ? colorHex(THEME.colors.warning)
          : colorHex(THEME.colors.panelDark),
      );
    });
  };

  const onTab = (): void => {
    if (items.length === 0) return;
    index = (index + 1) % items.length;
    paint();
  };
  const onEnter = (): void => {
    if (index >= 0) items[index]?.activate();
  };
  tab?.on("down", onTab);
  enter?.on("down", onEnter);

  return {
    track(target, activate) {
      items.push({ target, activate });
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      tab?.off("down", onTab);
      enter?.off("down", onEnter);
      tab?.destroy();
      enter?.destroy();
      scene.input.keyboard?.removeCapture(9);
    },
  };
};

export interface RichTextStyle {
  color: string;
  fontSize: string;
  underline: number;
}

export const drawRichText = (
  scene: Phaser.Scene,
  parent: Phaser.GameObjects.Container,
  source: string,
  x: number,
  y: number,
  maxWidth: number,
  style: RichTextStyle,
  glossary: Readonly<Record<string, FloorGlossaryEntry>>,
  focus: TermFocusGroup,
): {
  width: number;
  height: number;
  objects: Phaser.GameObjects.GameObject[];
} => {
  const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    color: style.color,
    fontFamily: THEME.fonts.family,
    fontSize: style.fontSize,
    fontStyle: "bold",
  };
  const lineHeight = Number.parseInt(style.fontSize, 10) + 12;
  let cursorX = x;
  let cursorY = y;
  let maxX = x;
  const objects: Phaser.GameObjects.GameObject[] = [];

  const place = (token: string, entry?: FloorGlossaryEntry): void => {
    if (/^\s+$/.test(token)) {
      if (token.includes("\n")) {
        cursorX = x;
        cursorY += lineHeight;
      } else if (cursorX > x) {
        cursorX += 6;
      }
      return;
    }

    const text = scene.add.text(0, 0, token, textStyle);
    parent.add(text);
    objects.push(text);
    const extra = entry ? 22 : 0;
    if (cursorX > x && cursorX + text.width + extra > x + maxWidth) {
      cursorX = x;
      cursorY += lineHeight;
    }
    text.setPosition(cursorX, cursorY);

    if (!entry) {
      cursorX += text.width;
      maxX = Math.max(maxX, cursorX);
      return;
    }

    const underline = scene.add.graphics();
    parent.add(underline);
    objects.push(underline);
    underline.lineStyle(2, style.underline, 0.95);
    const lineY = cursorY + text.height - 2;
    for (let offset = 0; offset < text.width; offset += 6) {
      underline.beginPath();
      underline.moveTo(cursorX + offset, lineY);
      underline.lineTo(cursorX + Math.min(offset + 3, text.width), lineY);
      underline.strokePath();
    }

    const icon = scene.add
      .text(cursorX + text.width + 3, cursorY - 1, "ⓘ", {
        color: colorHex(THEME.colors.white),
        backgroundColor: colorHex(THEME.colors.panelDark),
        fontFamily: THEME.fonts.family,
        fontSize: "13px",
        fontStyle: "bold",
        padding: { x: 3, y: 1 },
      })
      .setInteractive({ useHandCursor: true });
    parent.add(icon);
    objects.push(icon);

    const open = (pin: boolean): void => {
      markTermOpened(entry.id);
      scene.tweens.killTweensOf(icon);
      icon.setAlpha(1).setScale(1);
      showTermCard(scene, entry, icon, pin);
    };
    const activate = (): void => open(true);
    icon.on("pointerover", () => {
      holdTermCard();
      open(false);
    });
    icon.on("pointerout", releaseTermCard);
    icon.on("pointerup", activate);
    text.setInteractive({ useHandCursor: true });
    text.on("pointerover", () => {
      holdTermCard();
      open(false);
    });
    text.on("pointerout", releaseTermCard);
    text.on("pointerup", activate);
    focus.track(icon, activate);

    if (!hasOpenedTerm(entry.id) && !preferences.snapshot.reducedMotion) {
      scene.tweens.add({
        targets: icon,
        scale: { from: 1, to: 1.18 },
        duration: 700,
        yoyo: true,
        repeat: -1,
      });
    }

    cursorX += text.width + icon.width + 8;
    maxX = Math.max(maxX, cursorX);
  };

  const pattern = /\[\[([a-z0-9_.]+)\]\]/gi;
  let last = 0;
  for (const match of source.matchAll(pattern)) {
    const index = match.index ?? 0;
    source
      .slice(last, index)
      .split(/(\s+)/)
      .forEach((part) => {
        if (part) place(part);
      });
    const entry = glossary[match[1]];
    place(entry?.term ?? match[1], entry);
    last = index + match[0].length;
  }
  source
    .slice(last)
    .split(/(\s+)/)
    .forEach((part) => {
      if (part) place(part);
    });

  return {
    width: Math.max(0, maxX - x),
    height: cursorY - y + lineHeight,
    objects,
  };
};
