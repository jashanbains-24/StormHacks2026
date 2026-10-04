import type Phaser from "phaser";

/** Keep the world HUD out of a modal's rendering and pointer input layers. */
export const beginModal = (scene: Phaser.Scene): (() => void) => {
  const token = {};
  let released = false;
  const release = (): void => {
    if (released) return;
    released = true;
    scene.events.off("shutdown", release);
    scene.game.events.emit("ui:modal-closed", token);
  };
  scene.events.once("shutdown", release);
  scene.game.events.emit("ui:modal-opened", token);
  return release;
};
