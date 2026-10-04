import Phaser from "phaser";

export interface InteractionRequest {
  handled: boolean;
}

export const gameEvents = new Phaser.Events.EventEmitter();
