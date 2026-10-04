import Phaser from "phaser";

interface NpcOptions {
  texture?: string;
  frame?: number;
  flipX?: boolean;
  animationKey?: string | null;
  staticBody?: boolean;
}

export class Npc extends Phaser.Physics.Arcade.Sprite {
  private readonly characterTexture: string;
  private previousPosition: Phaser.Math.Vector2;
  private facing: "down" | "up" | "right" = "down";

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public readonly npcId: string,
    options: NpcOptions = {},
  ) {
    super(scene, x, y, options.texture ?? "specialist", options.frame ?? 0);
    this.characterTexture = options.texture ?? "specialist";
    this.previousPosition = new Phaser.Math.Vector2(x, y);
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

  updateMovementAnimation(): void {
    const deltaX = this.x - this.previousPosition.x;
    const deltaY = this.y - this.previousPosition.y;
    this.previousPosition.set(this.x, this.y);

    if (Math.abs(deltaX) < 0.05 && Math.abs(deltaY) < 0.05) {
      this.anims.stop();
      this.setFrame(
        this.facing === "up" ? 7 : this.facing === "right" ? 14 : 0,
      );
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      this.facing = "right";
      this.setFlipX(deltaX < 0);
    } else {
      this.facing = deltaY < 0 ? "up" : "down";
      this.setFlipX(false);
    }
    this.play(`office-${this.characterTexture}-walk-${this.facing}`, true);
  }
}
