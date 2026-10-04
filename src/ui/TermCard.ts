import type Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import type { FloorGlossaryEntry } from "../core/contracts";

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

let active: ActiveCard | undefined;

export const dismissTermCard = (): void => {
  if (!active) return;
  const current = active;
  active = undefined;
  current.closeTimer?.remove(false);
  current.card.scene?.input.off("pointerdown", current.onPointerDown);
  current.esc?.off("down");
  current.esc?.destroy();
  current.card.destroy();
};

export const holdTermCard = (): void => {
  active?.closeTimer?.remove(false);
  if (active) active.closeTimer = undefined;
};

export const releaseTermCard = (): void => {
  if (!active || active.pinned) return;
  const scene = active.card.scene;
  active.closeTimer?.remove(false);
  active.closeTimer = scene.time.delayedCall(220, () => {
    if (active && !active.pinned) dismissTermCard();
  });
};

export const showTermCard = (
  scene: Phaser.Scene,
  entry: FloorGlossaryEntry,
  anchor: TermAnchor,
  pin: boolean,
): void => {
  if (active?.anchor === anchor) {
    active.pinned = active.pinned || pin;
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
    if (!active) return;
    const cardBounds = panel.getBounds();
    const anchorBounds = active.anchor.getBounds();
    const inside =
      cardBounds.contains(pointer.x, pointer.y) ||
      anchorBounds.contains(pointer.x, pointer.y);
    if (!inside) dismissTermCard();
  };
  const esc = scene.input.keyboard?.addKey(27);
  esc?.on("down", dismissTermCard);
  scene.input.on("pointerdown", onPointerDown);
  scene.events.once("shutdown", dismissTermCard);

  active = { card, anchor, pinned: pin, esc, onPointerDown };
};
