import Phaser from "phaser";

export class Npc extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public readonly npcId: string,
  ) {
    super(scene, x, y, "specialist", 0);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setScale(2.5);
    this.setDepth(18);
    this.play("specialist-idle");
  }
}
