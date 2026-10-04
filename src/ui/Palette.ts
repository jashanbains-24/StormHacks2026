import Phaser from "phaser";

import { THEME, colorHex } from "../config/theme";
import { COMPONENTS } from "../data/build";
import type { ComponentType } from "../sim/types";

type PaletteType = Exclude<ComponentType, "client" | "source">;

export class Palette extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onDrop: (type: PaletteType, x: number, y: number) => void,
    tutorial = false,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    const panel = scene.add
      .rectangle(0, 0, 236, 590, THEME.colors.panelDark)
      .setOrigin(0);
    const title = scene.add.text(20, 18, "COMPONENTS", {
      color: colorHex(THEME.colors.white),
      fontFamily: THEME.fonts.mono,
      fontSize: "18px",
      fontStyle: "bold",
    });
    this.add([panel, title]);

    const types = tutorial
      ? (["connector", "destination"] as PaletteType[])
      : (["loadBalancer", "server"] as PaletteType[]);
    (types as PaletteType[]).forEach((type, index) => {
      const originX = 118;
      const originY = 100 + index * 154;
      const item = scene.add.container(originX, originY);
      const box = scene.add
        .rectangle(0, 0, 184, 102, THEME.colors.panel)
        .setStrokeStyle(3, THEME.colors.warning);
      const label = scene.add
        .text(0, -18, COMPONENTS[type].label, {
          align: "center",
          color: colorHex(THEME.colors.ink),
          fontFamily: THEME.fonts.family,
          fontSize: "18px",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      const hint = scene.add
        .text(0, 21, "DRAG TO CANVAS", {
          color: colorHex(THEME.colors.muted),
          fontFamily: THEME.fonts.mono,
          fontSize: "11px",
        })
        .setOrigin(0.5);
      item.add([box, label, hint]);
      item.setSize(184, 102).setInteractive({ useHandCursor: true });
      scene.input.setDraggable(item);
      item.on(
        "drag",
        (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
          item.setPosition(dragX, dragY);
        },
      );
      item.on("dragend", () => {
        const worldX = this.x + item.x;
        const worldY = this.y + item.y;
        if (worldX > 285) onDrop(type, worldX, worldY);
        item.setPosition(originX, originY);
      });
      this.add(item);
    });

    const help = scene.add.text(
      20,
      435,
      tutorial
        ? "PORTS\n\nOUT → IN\n\nConnect SOURCE to every DESTINATION. CONNECTOR blocks are optional."
        : "PORTS\n\nOUT → IN\n\nWire users to a load balancer or server, then wire the balancer to servers.",
      {
        color: colorHex(THEME.colors.white),
        fontFamily: THEME.fonts.family,
        fontSize: "14px",
        lineSpacing: 4,
        wordWrap: { width: 195 },
      },
    );
    this.add(help);
  }
}
