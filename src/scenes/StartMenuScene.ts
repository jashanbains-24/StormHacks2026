import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import { BACKGROUND_MUSIC_KEY } from "./PreloadScene";
import { progression } from "../state/progression";
import { glossaryStore } from "../state/glossary";
import {
  buildDesignStore,
  tutorialBuildDesignStore,
} from "../state/buildDesign";
import { preferences } from "../state/preferences";
import { audio } from "../systems/AudioSystem";

const MENU_COLORS = {
  skyTop: 0x1b263b,
  skyBottom: 0x5b3b52,
  skylineFar: 0x26354a,
  skylineNear: 0x172231,
  window: 0xe8b866,
  road: 0x111923,
  roadMarking: 0xd69e2e,
  logoAccent: 0xf0b35a,
  shopWall: 0x6e4d4d,
  shopTrim: 0xd08a55,
  shopGlass: 0x8ab5bd,
  vehicleColors: [0xc95c54, 0x4d8c9a, 0xd49a42, 0x8a6bbd],
  syntaxBlue: 0x8d8be8,
  syntaxAmber: 0xf0b35a,
  syntaxGreen: 0x72c98a,
  syntaxRed: 0xd85c68,
  syntaxPanel: 0x151a27,
} as const;

export class StartMenuScene extends Phaser.Scene {
  private soundButton!: Phaser.GameObjects.Text;
  private hasStarted = false;

  constructor() {
    super("StartMenuScene");
  }

  create(): void {
    this.hasStarted = false;
    this.cameras.main.setBackgroundColor(MENU_COLORS.skyTop);
    this.drawCity();
    this.createLogo();
    this.createPlayButton();
    this.createContinueButton();
    this.createSoundToggle();
    this.createMenuDetails();
    this.scheduleTraffic();

    this.input.keyboard?.on("keydown-ENTER", this.startGame, this);
    this.input.keyboard?.on("keydown-SPACE", this.startGame, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.removeListeners, this);
  }

  private drawCity(): void {
    const sky = this.add.graphics();
    sky.fillGradientStyle(
      MENU_COLORS.skyTop,
      MENU_COLORS.skyTop,
      MENU_COLORS.skyBottom,
      MENU_COLORS.skyBottom,
      1,
    );
    sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const stars = this.add.graphics();
    for (let index = 0; index < 34; index += 1) {
      const x = (index * 137 + 41) % GAME_WIDTH;
      const y = 54 + ((index * 71) % 190);
      const radius = index % 5 === 0 ? 2 : 1;
      stars.fillStyle(MENU_COLORS.window, index % 3 === 0 ? 0.8 : 0.45);
      stars.fillCircle(x, y, radius);
    }

    this.add.circle(1030, 142, 58, MENU_COLORS.window, 0.92).setDepth(1);

    this.drawSkyline(0.58, MENU_COLORS.skylineFar, 328, 26);
    this.drawSkyline(0.92, MENU_COLORS.skylineNear, 405, 19);
    this.drawShops();

    const foreground = this.add.graphics().setDepth(10);
    foreground.fillStyle(MENU_COLORS.road, 1);
    foreground.fillRect(0, 548, GAME_WIDTH, GAME_HEIGHT - 548);
    foreground.lineStyle(3, MENU_COLORS.roadMarking, 0.65);
    for (let x = -30; x < GAME_WIDTH + 80; x += 110) {
      foreground.strokeLineShape(new Phaser.Geom.Line(x, 642, x + 62, 642));
    }
    foreground.fillStyle(THEME.colors.ink, 0.28);
    foreground.fillRect(0, 548, GAME_WIDTH, 12);
  }

  private drawShops(): void {
    const shops = this.add.graphics().setDepth(12);
    const storefronts = [
      { x: 72, width: 198, accent: 0xc36b58 },
      { x: 292, width: 218, accent: 0xd49a4c },
      { x: 532, width: 186, accent: 0x5f9da3 },
      { x: 740, width: 220, accent: 0xb86f9d },
      { x: 982, width: 230, accent: 0x7e9d68 },
    ];

    shops.fillStyle(0x182231, 0.72);
    shops.fillRect(0, 404, GAME_WIDTH, 144);

    storefronts.forEach(({ x, width, accent }, index) => {
      const top = 431 + (index % 2) * 6;
      shops.fillStyle(MENU_COLORS.shopWall, 1);
      shops.fillRect(x, top, width, 117 - (index % 2) * 5);
      shops.fillStyle(accent, 1);
      shops.fillRect(x, top, width, 9);
      shops.fillStyle(MENU_COLORS.shopTrim, 0.9);
      shops.fillRect(x - 4, top + 9, width + 8, 5);

      const awningWidth = width / 5;
      for (let awningX = x; awningX < x + width; awningX += awningWidth) {
        shops.fillStyle(
          Math.round((awningX - x) / awningWidth) % 2 === 0
            ? accent
            : THEME.colors.paper,
          1,
        );
        shops.fillRect(awningX, top + 14, awningWidth + 1, 14);
      }

      shops.fillStyle(MENU_COLORS.shopGlass, 0.92);
      shops.fillRect(x + 14, top + 42, width * 0.48, 45);
      shops.fillStyle(0x2a3c4c, 1);
      shops.fillRect(x + width * 0.61, top + 42, width * 0.24, 62);
      shops.fillStyle(MENU_COLORS.window, 0.8);
      shops.fillRect(x + width * 0.64, top + 49, width * 0.18, 5);
      shops.fillStyle(0xf7e1a7, 0.72);
      shops.fillRect(x + width * 0.64, top + 62, width * 0.12, 4);
      shops.fillRect(x + width * 0.64, top + 74, width * 0.16, 4);

      if (index % 2 === 0) {
        shops.fillStyle(MENU_COLORS.window, 0.7);
        shops.fillRect(x + 26, top + 96, 9, 9);
        shops.fillRect(x + 42, top + 96, 9, 9);
      }
    });
  }

  private drawSkyline(
    depth: number,
    color: number,
    baseY: number,
    windowStep: number,
  ): void {
    const skyline = this.add.graphics().setDepth(Math.round(depth * 10));
    let x = -24;
    let buildingIndex = 0;

    while (x < GAME_WIDTH) {
      const width = 58 + ((buildingIndex * 31) % 76);
      const height = 74 + ((buildingIndex * 47) % 170);
      const top = baseY - height;
      skyline.fillStyle(color, 1);
      skyline.fillRect(x, top, width, height);

      if (buildingIndex % 3 === 0) {
        skyline.fillStyle(color, 0.9);
        skyline.fillRect(x + width * 0.38, top - 24, width * 0.24, 24);
      }

      skyline.fillStyle(MENU_COLORS.window, depth * 0.42);
      for (
        let windowY = top + 22;
        windowY < baseY - 12;
        windowY += windowStep
      ) {
        for (let windowX = x + 13; windowX < x + width - 9; windowX += 22) {
          if ((buildingIndex + Math.round(windowY)) % 4 !== 0) {
            skyline.fillRect(windowX, windowY, 7, 9);
          }
        }
      }

      x += width + 10;
      buildingIndex += 1;
    }
  }

  private createLogo(): void {
    const logoStyle = {
      fontFamily: THEME.fonts.mono,
      fontSize: "68px",
      fontStyle: "bold",
      letterSpacing: 0,
      stroke: colorHex(THEME.colors.ink),
      strokeThickness: 8,
    };
    const breakText = this.add
      .text(0, 250, "break", {
        ...logoStyle,
        color: colorHex(MENU_COLORS.syntaxBlue),
      })
      .setOrigin(0, 0.5)
      .setDepth(30);
    const pointText = this.add
      .text(0, 250, "point", {
        ...logoStyle,
        color: colorHex(MENU_COLORS.syntaxAmber),
      })
      .setOrigin(0, 0.5)
      .setDepth(30);
    const parenthesesText = this.add
      .text(0, 250, "()", {
        ...logoStyle,
        color: colorHex(THEME.colors.white),
      })
      .setOrigin(0, 0.5)
      .setDepth(30);

    const dotRadius = 11;
    const itemGap = -7;
    const dotY = 268;
    const totalWidth =
      breakText.displayWidth +
      dotRadius * 2 +
      pointText.displayWidth +
      parenthesesText.displayWidth +
      itemGap * 3;
    let cursor = (GAME_WIDTH - totalWidth) / 2;
    breakText.setX(cursor);
    cursor += breakText.displayWidth + itemGap;
    const dotX = cursor + dotRadius;
    cursor += dotRadius * 2 + itemGap;
    pointText.setX(cursor);
    cursor += pointText.displayWidth + itemGap;
    parenthesesText.setX(cursor);

    const breakpoint = this.add.graphics().setDepth(31);
    breakpoint.fillStyle(MENU_COLORS.syntaxGreen, 1);
    breakpoint.fillCircle(dotX, dotY, dotRadius);
    breakpoint.fillStyle(THEME.colors.white, 1);
    breakpoint.fillTriangle(
      dotX - 5,
      dotY - 7,
      dotX - 5,
      dotY + 7,
      dotX + 6,
      dotY,
    );
    this.add
      .circle(dotX, dotY, dotRadius + 4, MENU_COLORS.syntaxGreen, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(32)
      .on("pointerover", () => breakpoint.setAlpha(0.75))
      .on("pointerout", () => breakpoint.setAlpha(1))
      .on("pointerup", this.startGame, this);

    this.add
      .text(GAME_WIDTH / 2, 350, "A SYSTEM DESIGN OFFICE GAME", {
        color: colorHex(THEME.colors.paper),
        fontFamily: THEME.fonts.mono,
        fontSize: "14px",
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setDepth(30);
  }

  private createPlayButton(): void {
    this.add
      .text(
        GAME_WIDTH / 2,
        394,
        "NEW GAME — PRESS ENTER OR CLICK THE PLAY DOT",
        {
          color: colorHex(MENU_COLORS.syntaxGreen),
          fontFamily: THEME.fonts.mono,
          fontSize: "11px",
          letterSpacing: 1,
        },
      )
      .setOrigin(0.5)
      .setDepth(30)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", this.startGame, this);
  }

  private createContinueButton(): void {
    if (!Object.keys(progression.snapshot.floorResults).length) return;
    this.add
      .text(GAME_WIDTH / 2, 423, "CONTINUE SAVED GAME", {
        color: colorHex(THEME.colors.paper),
        backgroundColor: colorHex(MENU_COLORS.syntaxPanel),
        fontFamily: THEME.fonts.mono,
        fontSize: "13px",
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", this.continueGame, this);
  }

  private createSoundToggle(): void {
    this.soundButton = this.add
      .text(GAME_WIDTH - 34, 26, "", {
        color: colorHex(THEME.colors.white),
        backgroundColor: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.mono,
        fontSize: "12px",
        fontStyle: "bold",
        padding: { x: 9, y: 7 },
      })
      .setOrigin(1, 0)
      .setDepth(40)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => {
        const wasMuted = preferences.snapshot.muted;
        preferences.toggleMuted();
        audio.syncMusicMute();
        if (wasMuted) audio.playClick();
        this.refreshSoundLabel();
      });
    this.refreshSoundLabel();
  }

  private createMenuDetails(): void {
    this.add
      .text(30, GAME_HEIGHT - 34, "STORMHACKS 2026", {
        color: colorHex(THEME.colors.successLight),
        fontFamily: THEME.fonts.mono,
        fontSize: "11px",
        fontStyle: "bold",
      })
      .setDepth(30);
    this.add
      .text(GAME_WIDTH - 30, GAME_HEIGHT - 34, "SYSTEM STATUS // ONLINE", {
        color: colorHex(THEME.colors.successLight),
        fontFamily: THEME.fonts.mono,
        fontSize: "11px",
        fontStyle: "bold",
      })
      .setOrigin(1, 0)
      .setDepth(30);
  }

  private scheduleTraffic(): void {
    this.time.delayedCall(2600, () => {
      this.spawnVehicle();
      this.scheduleTraffic();
    });
  }

  private spawnVehicle(): void {
    const colors = MENU_COLORS.vehicleColors;
    const color = colors[Phaser.Math.Between(0, colors.length - 1)];
    const truck = Phaser.Math.Between(0, 3) === 0;
    const movingRight = Phaser.Math.Between(0, 1) === 0;
    const y = movingRight ? 592 : 682;
    const startX = movingRight ? -100 : GAME_WIDTH + 100;
    const endX = movingRight ? GAME_WIDTH + 100 : -100;
    const vehicle = this.createVehicle(color, truck).setPosition(startX, y);
    vehicle.setDepth(20);

    this.tweens.add({
      targets: vehicle,
      x: endX,
      duration: Phaser.Math.Between(7800, 11600),
      ease: "Linear",
      onComplete: () => vehicle.destroy(),
    });
  }

  private createVehicle(
    color: number,
    truck: boolean,
  ): Phaser.GameObjects.Container {
    const vehicle = this.add.container(0, 0);
    const width = truck ? 104 : 74;
    const body = this.add.graphics();
    body.fillStyle(color, 1);
    body.fillRoundedRect(-width / 2, -18, width, 30, 5);
    body.fillStyle(0x233143, 1);
    if (truck) {
      body.fillRect(width / 2 - 29, -13, 23, 25);
    } else {
      body.fillRoundedRect(-width / 2 + 13, -31, width - 26, 20, 7);
    }
    body.fillStyle(0x9dc4ca, 0.9);
    body.fillRect(
      truck ? width / 2 - 23 : -width / 2 + 20,
      -26,
      truck ? 14 : 15,
      10,
    );
    if (!truck) {
      body.fillRect(width / 2 - 33, -26, 15, 10);
    }
    body.fillStyle(0x111923, 1);
    body.fillCircle(-width / 2 + 16, 15, 8);
    body.fillCircle(width / 2 - 16, 15, 8);
    body.fillStyle(0xdfe7df, 0.8);
    body.fillCircle(-width / 2 + 16, 15, 3);
    body.fillCircle(width / 2 - 16, 15, 3);
    vehicle.add(body);
    return vehicle;
  }

  private refreshSoundLabel(): void {
    this.soundButton.setText(
      preferences.snapshot.muted ? "SOUND OFF" : "SOUND ON",
    );
  }

  private startGame(): void {
    if (this.hasStarted) return;
    progression.reset();
    glossaryStore.reset();
    buildDesignStore.reset();
    tutorialBuildDesignStore.reset();
    this.launchGame();
  }

  private continueGame(): void {
    if (this.hasStarted) return;
    this.launchGame();
  }

  private launchGame(): void {
    this.hasStarted = true;
    audio.playStartChime();
    audio.playMusic(BACKGROUND_MUSIC_KEY, {
      loop: true,
      volume: 0.24,
    });
    this.cameras.main.fadeOut(320, 15, 23, 36);
    this.time.delayedCall(340, () => {
      this.scene.launch("UIScene");
      this.scene.start("FloorScene", { floor: 0 });
    });
  }

  private removeListeners(): void {
    this.input.keyboard?.off("keydown-ENTER", this.startGame, this);
    this.input.keyboard?.off("keydown-SPACE", this.startGame, this);
  }
}
