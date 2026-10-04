import type Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../../config/dimensions";
import { THEME, colorHex } from "../../config/theme";
import type { FloorGlossaryEntry } from "../contracts";
import { glossaryStore } from "../../state/glossary";

type TermAnchor = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.GetBounds;

interface ActiveCard {
  card: Phaser.GameObjects.Container;
  anchor: TermAnchor;
  pinned: boolean;
  closeTimer?: Phaser.Time.TimerEvent;
  esc?: Phaser.Input.Keyboard.Key;
  onPointerDown: (pointer: Phaser.Input.Pointer) => void;
}

let activeCard: ActiveCard | undefined;
export const hasOpenedTerm = (id: string): boolean =>
  glossaryStore.hasOpened(id);
export const markTermOpened = (id: string): void =>
  glossaryStore.markOpened(id);
export const openedTermIds = (): string[] => glossaryStore.openedIds;
export const onTermsChanged = (listener: () => void): (() => void) =>
  glossaryStore.subscribe(listener);

export const dismissTermCard = (): void => {
  if (!activeCard) return;
  const current = activeCard;
  activeCard = undefined;
  current.closeTimer?.remove(false);
  current.card.scene?.input.off("pointerdown", current.onPointerDown);
  current.esc?.off("down");
  current.esc?.destroy();
  current.card.destroy();
};

const holdTermCard = (): void => {
  activeCard?.closeTimer?.remove(false);
  if (activeCard) activeCard.closeTimer = undefined;
};

const releaseTermCard = (): void => {
  if (!activeCard || activeCard.pinned) return;
  const scene = activeCard.card.scene;
  activeCard.closeTimer?.remove(false);
  activeCard.closeTimer = scene.time.delayedCall(220, () => {
    if (activeCard && !activeCard.pinned) dismissTermCard();
  });
};

const showTermCard = (
  scene: Phaser.Scene,
  entry: FloorGlossaryEntry,
  anchor: TermAnchor,
  pin: boolean,
): void => {
  if (activeCard?.anchor === anchor) {
    activeCard.pinned = activeCard.pinned || pin;
    holdTermCard();
    return;
  }

  dismissTermCard();
  const bounds = anchor.getBounds();
  const width = 336;
  const lines = [
    entry.definition,
    entry.analogy ?? "",
    entry.realWorld ? `Real world: ${entry.realWorld}` : "",
  ].filter((line) => line.length > 0);
  const height = 58 + lines.length * 36;
  let x = bounds.right + 10;
  let y = bounds.top - 8;
  if (x + width > GAME_WIDTH - 16) x = Math.max(16, bounds.left - width - 10);
  if (y + height > GAME_HEIGHT - 16) y = GAME_HEIGHT - height - 16;

  const card = scene.add.container(0, 0).setDepth(2000);
  const panel = scene.add
    .rectangle(x, y, width, height, THEME.colors.panel)
    .setOrigin(0)
    .setStrokeStyle(3, THEME.colors.ink);
  const title = scene.add.text(x + 14, y + 10, entry.term, {
    color: colorHex(THEME.colors.ink),
    fontFamily: THEME.fonts.family,
    fontSize: "16px",
    fontStyle: "bold",
  });
  const body = scene.add.text(x + 14, y + 34, lines.join("\n"), {
    color: colorHex(THEME.colors.ink),
    fontFamily: THEME.fonts.family,
    fontSize: "14px",
    lineSpacing: 4,
    wordWrap: { width: width - 28 },
  });
  card.add([panel, title, body]);
  card.setSize(width, height);
  panel.setInteractive();
  panel.on("pointerover", holdTermCard);
  panel.on("pointerout", releaseTermCard);

  const onPointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!activeCard) return;
    const cardBounds = panel.getBounds();
    const anchorBounds = activeCard.anchor.getBounds();
    const inside =
      cardBounds.contains(pointer.x, pointer.y) ||
      anchorBounds.contains(pointer.x, pointer.y);
    if (!inside) dismissTermCard();
  };
  const esc = scene.input.keyboard?.addKey(27);
  esc?.on("down", dismissTermCard);
  scene.input.on("pointerdown", onPointerDown);
  scene.events.once("shutdown", dismissTermCard);

  activeCard = { card, anchor, pinned: pin, esc, onPointerDown };
};

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
  reducedMotion: boolean;
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

    if (!hasOpenedTerm(entry.id) && !style.reducedMotion) {
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
