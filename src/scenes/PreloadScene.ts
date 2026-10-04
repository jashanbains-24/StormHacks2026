import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import { getFloors } from "../core/runtime/floorRegistry";
import { OFFICE_CHARACTER_TEXTURES } from "../data/office";
import {
  getFloorHarnessOptions,
  getFloorHarnessSimulation,
  mountFloorHarnessControls,
} from "../dev/floorHarness";
import { audio } from "../systems/AudioSystem";

export const BACKGROUND_MUSIC_KEY = "breakpoint-background-music";
const BACKGROUND_MUSIC_URL = new URL(
  "../systems/music/Chill Ambience.mp3",
  import.meta.url,
).href;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    this.cameras.main.setBackgroundColor(THEME.colors.paper);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 16, "BREAKPOINT", {
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "42px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 32, "Waking the servers…", {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.family,
        fontSize: "18px",
      })
      .setOrigin(0.5);

    this.load.setPath("assets/office");
    this.load.spritesheet("player", "characters/player.png", {
      frameWidth: 16,
      frameHeight: 32,
    });
    this.load.spritesheet("specialist", "characters/specialist.png", {
      frameWidth: 16,
      frameHeight: 32,
    });
    (["ambient-1", "ambient-3", "ambient-4", "ambient-5"] as const).forEach(
      (texture) => {
        this.load.spritesheet(texture, `characters/${texture}.png`, {
          frameWidth: 16,
          frameHeight: 32,
        });
      },
    );
    this.load.image("office-floor", "floors/floor.png");
    this.load.image("office-wall", "walls/wall.png");
    this.load.image("desk", "furniture/desk.png");
    this.load.image("computer", "furniture/computer.png");
    this.load.image("bookshelf", "furniture/bookshelf.png");
    this.load.image("plant", "furniture/plant.png");
    this.load.image("sofa", "furniture/sofa.png");
    this.load.image("large-plant", "furniture/large-plant.png");
    this.load.image("chair-front", "furniture/chair-front.png");
    this.load.image("chair-back", "furniture/chair-back.png");
    this.load.image("coffee-table", "furniture/coffee-table.png");
    this.load.image("whiteboard", "furniture/whiteboard.png");
    this.load.image("bin", "furniture/bin.png");
    this.load.image("double-bookshelf", "furniture/double-bookshelf.png");
    this.load.image("small-table", "furniture/small-table.png");
    this.load.image(
      "cushioned-chair-front",
      "furniture/cushioned-chair-front.png",
    );
    this.load.image(
      "cushioned-chair-back",
      "furniture/cushioned-chair-back.png",
    );
    this.load.image("clock", "furniture/clock.png");
    this.load.image("coffee", "furniture/coffee.png");
    this.load.image("cactus", "furniture/cactus.png");
    this.load.image("large-painting", "furniture/large-painting.png");
    this.load.image("small-painting", "furniture/small-painting.png");
    this.load.image("meeting-table", "furniture/meeting-table.png");
    this.load.image("cushioned-bench", "furniture/cushioned-bench.png");

    this.load.setPath("");
    this.load.audio(BACKGROUND_MUSIC_KEY, BACKGROUND_MUSIC_URL);
    getFloors().forEach(({ module }) => {
      module.assets.images.forEach((asset) =>
        this.load.image(asset.key, asset.path),
      );
      module.assets.spritesheets.forEach((asset) =>
        this.load.spritesheet(asset.key, asset.path, {
          frameWidth: asset.frameWidth,
          frameHeight: asset.frameHeight,
        }),
      );
      module.assets.audio.forEach((asset) =>
        this.load.audio(asset.key, asset.path),
      );
    });
  }

  create(): void {
    audio.attachSoundManager(this.sound);
    this.anims.create({
      key: "player-down",
      frames: this.anims.generateFrameNumbers("player", { frames: [0, 1, 2] }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "player-up",
      frames: this.anims.generateFrameNumbers("player", { frames: [7, 8, 9] }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "player-right",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [14, 15, 16],
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "specialist-idle",
      frames: this.anims.generateFrameNumbers("specialist", {
        frames: [5, 6],
      }),
      frameRate: 2,
      repeat: -1,
    });
    OFFICE_CHARACTER_TEXTURES.forEach((texture) => {
      this.anims.create({
        key: `office-${texture}-type`,
        frames: this.anims.generateFrameNumbers(texture, { frames: [3, 4] }),
        frameRate: 2,
        repeat: -1,
      });
      this.anims.create({
        key: `office-${texture}-idle-up`,
        frames: this.anims.generateFrameNumbers(texture, { frames: [10, 11] }),
        frameRate: 2,
        repeat: -1,
      });
      this.anims.create({
        key: `office-${texture}-walk-down`,
        frames: this.anims.generateFrameNumbers(texture, {
          frames: [0, 1, 2],
        }),
        frameRate: 7,
        repeat: -1,
      });
      this.anims.create({
        key: `office-${texture}-walk-up`,
        frames: this.anims.generateFrameNumbers(texture, {
          frames: [7, 8, 9],
        }),
        frameRate: 7,
        repeat: -1,
      });
      this.anims.create({
        key: `office-${texture}-walk-right`,
        frames: this.anims.generateFrameNumbers(texture, {
          frames: [14, 15, 16],
        }),
        frameRate: 7,
        repeat: -1,
      });
    });

    const harness = getFloorHarnessOptions();
    mountFloorHarnessControls(harness);
    if (!harness.enabled) {
      this.scene.start("StartMenuScene");
      return;
    }
    this.scene.launch("UIScene");
    this.scene.start("FloorScene", {
      floor: harness.floorOrder,
      preview: {
        enabled: harness.enabled,
        state: harness.healthState,
      },
      simulationSnapshot: harness.enabled
        ? getFloorHarnessSimulation(harness.healthState)
        : undefined,
    });
  }
}
