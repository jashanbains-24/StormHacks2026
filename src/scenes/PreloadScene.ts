import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import { OFFICE_CHARACTER_TEXTURES } from "../data/office";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    this.cameras.main.setBackgroundColor(THEME.colors.paper);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 16, "UPTIME", {
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
  }

  create(): void {
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
        key: `office-${texture}-walk`,
        frames: this.anims.generateFrameNumbers(texture, {
          frames: [14, 15, 16],
        }),
        frameRate: 7,
        repeat: -1,
      });
    });

    this.scene.launch("UIScene");
    this.scene.start("FloorScene");
  }
}
