import type Phaser from "phaser";
import type { FloorContext } from "../contracts";

export class EffectScope {
  private alive = true;
  private readonly cleanups = new Set<() => void>();

  constructor(private readonly ctx: FloorContext) {}

  object<T extends Phaser.GameObjects.GameObject>(object: T): T {
    this.cleanups.add(() => object.destroy());
    return object;
  }

  tween(config: Phaser.Types.Tweens.TweenBuilderConfig): void {
    const tween = this.ctx.scene.tweens.add(config);
    const cleanup = (): void => {
      tween.destroy();
    };
    this.cleanups.add(cleanup);
    tween.once("complete", () => this.cleanups.delete(cleanup));
  }

  timer(config: Phaser.Types.Time.TimerEventConfig): void {
    const timer = this.ctx.scene.time.addEvent(config);
    this.cleanups.add(() => timer.remove(false));
  }

  update(callback: () => void): void {
    this.ctx.addUpdater(() => {
      if (this.alive) callback();
    });
  }

  destroy(): void {
    if (!this.alive) return;
    this.alive = false;
    [...this.cleanups].reverse().forEach((cleanup) => cleanup());
    this.cleanups.clear();
  }
}
