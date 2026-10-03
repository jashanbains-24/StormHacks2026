import Phaser from "phaser";

import { THEME, colorHex } from "../config/theme";

export class Notification extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    title: string,
    message: string,
    accent: number = THEME.colors.alert,
    durationMs = 6500,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setDepth(1000);

    const panel = scene.add
      .rectangle(0, 0, 590, 126, THEME.colors.panel, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(4, accent);
    const stripe = scene.add.rectangle(0, 0, 12, 126, accent).setOrigin(0, 0);
    const titleText = scene.add.text(28, 14, title, {
      color: colorHex(accent),
      fontFamily: THEME.fonts.family,
      fontSize: "18px",
      fontStyle: "bold",
    });
    const messageText = scene.add.text(28, 42, message, {
      color: colorHex(THEME.colors.ink),
      fontFamily: THEME.fonts.family,
      fontSize: "17px",
      lineSpacing: 5,
      wordWrap: { width: 530 },
    });
    const close = scene.add
      .text(563, 10, "×", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.family,
        fontSize: "24px",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.dismiss());

    this.add([panel, stripe, titleText, messageText, close]);
    this.setAlpha(0).setY(y - 20);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      y,
      duration: 220,
      ease: "Back.Out",
    });
    if (durationMs > 0) {
      scene.time.delayedCall(durationMs, () => this.dismiss());
    }
  }

  dismiss(): void {
    if (!this.active) return;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 16,
      duration: 160,
      onComplete: () => this.destroy(),
    });
  }
}
