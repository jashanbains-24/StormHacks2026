import Phaser from "phaser";

import { THEME, colorHex } from "../config/theme";
import { COMPONENTS } from "../data/build";
import type { ComponentType, ServerHealth } from "../sim/types";

export class BuildNode extends Phaser.GameObjects.Container {
  readonly inputPort?: Phaser.GameObjects.Arc;
  readonly outputPort?: Phaser.GameObjects.Arc;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly statusText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    public readonly nodeId: string,
    public readonly componentType: ComponentType,
    x: number,
    y: number,
    fixed = false,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setDepth(20);

    this.panel = scene.add
      .rectangle(0, 0, 138, 78, THEME.colors.panel)
      .setStrokeStyle(4, this.baseColor());
    const label = scene.add
      .text(0, -10, COMPONENTS[componentType].shortLabel, {
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.mono,
        fontSize: "17px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.statusText = scene.add
      .text(0, 17, componentType === "client" ? "70 RPS" : "IDLE", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.mono,
        fontSize: "11px",
      })
      .setOrigin(0.5);
    this.add([this.panel, label, this.statusText]);

    if (componentType !== "client") {
      this.inputPort = this.createPort(-76, "IN");
      this.add(this.inputPort);
    }
    if (componentType !== "server") {
      this.outputPort = this.createPort(76, "OUT");
      this.add(this.outputPort);
    }

    if (!fixed) {
      this.setSize(138, 78).setInteractive({ useHandCursor: true });
      scene.input.setDraggable(this);
    }
  }

  setServerStatus(health: ServerHealth, loadRps: number): void {
    const color =
      health === "crashed"
        ? THEME.colors.alert
        : health === "strained"
          ? THEME.colors.warning
          : THEME.colors.success;
    this.panel.setStrokeStyle(5, color);
    this.statusText
      .setColor(colorHex(color))
      .setText(health === "crashed" ? "CRASHED" : `${loadRps.toFixed(0)} RPS`);
  }

  resetStatus(): void {
    this.panel.setStrokeStyle(4, this.baseColor());
    this.statusText
      .setColor(colorHex(THEME.colors.muted))
      .setText(this.componentType === "client" ? "TRAFFIC" : "IDLE");
  }

  private createPort(x: number, label: string): Phaser.GameObjects.Arc {
    const port = this.scene.add
      .circle(x, 0, 12, THEME.colors.white)
      .setStrokeStyle(4, THEME.colors.panelDark)
      .setInteractive({ useHandCursor: true });
    const text = this.scene.add
      .text(x, 24, label, {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.mono,
        fontSize: "9px",
      })
      .setOrigin(0.5);
    this.add(text);
    return port;
  }

  private baseColor(): number {
    if (this.componentType === "client") return THEME.colors.officeWall;
    if (this.componentType === "loadBalancer") return THEME.colors.warning;
    return THEME.colors.success;
  }
}
