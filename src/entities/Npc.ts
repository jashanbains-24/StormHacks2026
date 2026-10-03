import Phaser from "phaser";

interface NpcOptions {
  texture?: string;
  frame?: number;
  flipX?: boolean;
  animationKey?: string | null;
  staticBody?: boolean;
}

export class Npc extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public readonly npcId: string,
    options: NpcOptions = {},
  ) {
    super(scene, x, y, options.texture ?? "specialist", options.frame ?? 0);
    scene.add.existing(this);
    const staticBody = options.staticBody ?? true;
    scene.physics.add.existing(this, staticBody);
    this.setScale(2.8);
    this.setDepth(18);
    this.setFlipX(options.flipX ?? false);
    if (!staticBody) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
      body.setSize(11, 14).setOffset(2, 16);
      this.setCollideWorldBounds(true);
    }
    if (options.animationKey !== null) {
      this.play(options.animationKey ?? "specialist-idle");
    }
  }
}
