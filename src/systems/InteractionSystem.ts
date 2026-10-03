import Phaser from "phaser";

import type { Player } from "../entities/Player";
import type { Interactable } from "../entities/Interactable";
import { gameEvents } from "./EventBus";

export class InteractionSystem {
  private interactables: Interactable[] = [];
  private activeId: string | undefined;
  private readonly key: Phaser.Input.Keyboard.Key;

  constructor(
    scene: Phaser.Scene,
    private readonly player: Player,
  ) {
    this.key = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  setInteractables(interactables: Interactable[]): void {
    this.interactables = interactables;
    this.activeId = undefined;
    gameEvents.emit("interaction:clear");
  }

  update(): void {
    const nearest = this.interactables
      .map((interactable) => ({
        interactable,
        distance: Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          interactable.x,
          interactable.y,
        ),
      }))
      .filter(
        ({ interactable, distance }) => distance <= (interactable.range ?? 86),
      )
      .sort((a, b) => a.distance - b.distance)[0]?.interactable;

    if (nearest?.id !== this.activeId) {
      this.activeId = nearest?.id;
      if (nearest) gameEvents.emit("interaction:available", nearest.label);
      else gameEvents.emit("interaction:clear");
    }

    if (nearest && Phaser.Input.Keyboard.JustDown(this.key)) {
      nearest.onInteract();
    }
  }
}
