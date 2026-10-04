import Phaser from "phaser";

const SPEED = 235;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasd: Record<
    "up" | "down" | "left" | "right",
    Phaser.Input.Keyboard.Key
  >;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player", 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(2.8);
    this.setCollideWorldBounds(true);
    this.setDepth(y);
    this.body?.setSize(11, 13).setOffset(2, 17);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as typeof this.wasd;
  }

  update(): void {
    const horizontal =
      Number(this.cursors.right.isDown || this.wasd.right.isDown) -
      Number(this.cursors.left.isDown || this.wasd.left.isDown);
    const vertical =
      Number(this.cursors.down.isDown || this.wasd.down.isDown) -
      Number(this.cursors.up.isDown || this.wasd.up.isDown);
    const direction = new Phaser.Math.Vector2(horizontal, vertical).normalize();

    this.setVelocity(direction.x * SPEED, direction.y * SPEED);
    this.setDepth(this.y);
    this.updateAnimation(horizontal, vertical);
  }

  private updateAnimation(horizontal: number, vertical: number): void {
    if (horizontal === 0 && vertical === 0) {
      this.anims.stop();
      this.setFrame(vertical < 0 ? 7 : 0);
      return;
    }

    if (Math.abs(horizontal) > Math.abs(vertical)) {
      this.setFlipX(horizontal < 0);
      this.play("player-right", true);
    } else {
      this.setFlipX(false);
      this.play(vertical < 0 ? "player-up" : "player-down", true);
    }
  }
}
