import Phaser from "phaser";

interface NpcOptions {
  frame?: number;
  tint?: number;
  flipX?: boolean;
  animated?: boolean;
}

export class Npc extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public readonly npcId: string,
    options: NpcOptions = {},
  ) {
    super(scene, x, y, "specialist", options.frame ?? 0);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setScale(2.5);
    this.setDepth(18);
    this.setFlipX(options.flipX ?? false);
    if (options.tint !== undefined) this.setTint(options.tint);
    if (options.animated ?? true) this.play("specialist-idle");
  }
}
