import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import { floorById } from "../data/floors";
import { AMBIENT_NPCS_BY_FLOOR, OFFICE_PROPS } from "../data/office";
import type { Interactable } from "../entities/Interactable";
import { Npc } from "../entities/Npc";
import { Player } from "../entities/Player";
import { preferences } from "../state/preferences";
import { progression } from "../state/progression";
import { gameEvents } from "../systems/EventBus";
import { InteractionSystem } from "../systems/InteractionSystem";

export class FloorScene extends Phaser.Scene {
  private currentFloor = 0;
  private player!: Player;
  private interactions!: InteractionSystem;

  constructor() {
    super("FloorScene");
  }

  init(data: { floor?: number }): void {
    this.currentFloor = data.floor ?? 0;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(THEME.colors.officeFloor);
    this.physics.world.setBounds(40, 82, GAME_WIDTH - 80, GAME_HEIGHT - 122);
    this.add
      .tileSprite(40, 82, GAME_WIDTH - 80, GAME_HEIGHT - 122, "office-floor")
      .setOrigin(0)
      .setTileScale(4)
      .setDepth(-10);
    this.player = new Player(this, 130, GAME_HEIGHT / 2);
    this.createBoundaries();
    this.createHeader();
    this.decorateOffice();
    this.createAmbientNpcs();
    this.createEmergencyLights();

    this.interactions = new InteractionSystem(this, this.player);
    this.interactions.setInteractables(this.createFloorContent());

    gameEvents.emit("floor:changed", this.currentFloor);
  }

  update(): void {
    this.player.update();
    this.interactions.update();
  }

  private createHeader(): void {
    const title =
      this.currentFloor === 0
        ? "Ground Floor: Incident Response"
        : floorById(this.currentFloor).title;
    this.add
      .rectangle(0, 0, GAME_WIDTH, 64, THEME.colors.panelDark)
      .setOrigin(0);
    this.add.text(28, 17, title, {
      color: colorHex(THEME.colors.white),
      fontFamily: THEME.fonts.family,
      fontSize: "24px",
      fontStyle: "bold",
    });
    if (
      this.currentFloor === 1 &&
      progression.snapshot.floorResults[1]?.quality === "partial"
    ) {
      this.add.text(GAME_WIDTH - 250, 20, "⚠ TECH DEBT", {
        color: colorHex(THEME.colors.warning),
        fontFamily: THEME.fonts.family,
        fontSize: "18px",
        fontStyle: "bold",
      });
    }
  }

  private createBoundaries(): void {
    const walls = [
      [GAME_WIDTH / 2, 82, GAME_WIDTH - 80, 24],
      [GAME_WIDTH / 2, GAME_HEIGHT - 40, GAME_WIDTH - 80, 24],
      [40, GAME_HEIGHT / 2, 24, GAME_HEIGHT - 100],
      [GAME_WIDTH - 40, GAME_HEIGHT / 2, 24, GAME_HEIGHT - 100],
    ] as const;

    for (const [x, y, width, height] of walls) {
      const wall = this.add.rectangle(
        x,
        y,
        width,
        height,
        THEME.colors.officeWall,
      );
      this.physics.add.existing(wall, true);
      this.physics.add.collider(this.player, wall);
    }
  }

  private decorateOffice(): void {
    const addProp = (
      x: number,
      y: number,
      texture: string,
      scale = 3,
      collider = true,
    ): Phaser.Physics.Arcade.Image => {
      const image = this.physics.add
        .staticImage(x, y, texture)
        .setScale(scale)
        .setDepth(10);
      image.refreshBody();
      if (collider) {
        this.physics.add.collider(this.player, image);
      }
      return image;
    };

    OFFICE_PROPS.forEach((prop) =>
      addProp(
        prop.x,
        prop.y,
        prop.texture,
        prop.scale ?? 3,
        prop.collider ?? true,
      ),
    );
  }

  private createAmbientNpcs(): void {
    for (const placement of AMBIENT_NPCS_BY_FLOOR[this.currentFloor] ?? []) {
      const shouldPatrol =
        placement.behavior.kind === "patrol" &&
        !preferences.snapshot.reducedMotion;
      const npc = new Npc(this, placement.x, placement.y, placement.id, {
        texture: placement.texture,
        flipX: placement.flipX,
        animationKey: preferences.snapshot.reducedMotion
          ? null
          : `office-${placement.texture}-${
              placement.behavior.kind === "desk" ? "type" : "walk"
            }`,
        staticBody: !shouldPatrol,
      });
      this.physics.add.collider(this.player, npc);
      if (shouldPatrol && placement.behavior.kind === "patrol") {
        this.tweens.add({
          targets: npc,
          x: placement.behavior.toX,
          y: placement.behavior.toY,
          duration: placement.behavior.durationMs,
          yoyo: true,
          repeat: -1,
          onYoyo: () => npc.toggleFlipX(),
          onRepeat: () => npc.toggleFlipX(),
        });
      }
    }
  }

  private createEmergencyLights(): void {
    const resolved = progression.snapshot.floorResults[1] !== undefined;
    const color = resolved ? THEME.colors.success : THEME.colors.alert;
    [180, 640, 1090].forEach((x) => {
      const light = this.add.circle(x, 97, 10, color, 0.9).setDepth(30);
      if (!resolved && !preferences.snapshot.reducedMotion) {
        this.tweens.add({
          targets: light,
          alpha: { from: 0.25, to: 1 },
          duration: 520,
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }

  private createFloorContent(): Interactable[] {
    const interactables: Interactable[] = [];
    const elevatorY = GAME_HEIGHT / 2;
    this.add
      .rectangle(GAME_WIDTH - 102, elevatorY, 104, 174, THEME.colors.panelDark)
      .setStrokeStyle(6, THEME.colors.ink)
      .setDepth(4);
    this.add
      .text(GAME_WIDTH - 102, elevatorY - 10, "ELEVATOR", {
        color: colorHex(THEME.colors.white),
        fontFamily: THEME.fonts.family,
        fontSize: "16px",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAngle(-90)
      .setDepth(5);

    interactables.push({
      id: "elevator",
      label: this.elevatorLabel(),
      x: GAME_WIDTH - 135,
      y: elevatorY,
      range: 105,
      onInteract: () => this.useElevator(),
    });

    if (this.currentFloor === 1) {
      const specialist = new Npc(this, 820, 340, "rhea");
      this.physics.add.collider(this.player, specialist);
      this.add.text(770, 382, "Rhea Boot // SRE", {
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "15px",
        backgroundColor: colorHex(THEME.colors.panel),
        padding: { x: 7, y: 4 },
      });
      interactables.push({
        id: "specialist",
        label: "Talk to Rhea",
        x: specialist.x,
        y: specialist.y,
        onInteract: () => gameEvents.emit("dialogue:specialist"),
      });

      this.add
        .rectangle(220, 440, 190, 112, THEME.colors.panelDark)
        .setStrokeStyle(4, THEME.colors.warning)
        .setDepth(6);
      this.add
        .text(220, 440, "BUILD\nCONSOLE", {
          align: "center",
          color: colorHex(THEME.colors.white),
          fontFamily: THEME.fonts.mono,
          fontSize: "20px",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(7);
      interactables.push({
        id: "build-console",
        label: "Open build console",
        x: 220,
        y: 440,
        range: 110,
        onInteract: () => gameEvents.emit("build:open"),
      });
    }

    if (this.currentFloor === 2) {
      this.add
        .text(
          GAME_WIDTH / 2,
          GAME_HEIGHT / 2,
          "Data Storage / Caching\n\nCOMING SOON\nThe database team is allegedly in a meeting.",
          {
            align: "center",
            color: colorHex(THEME.colors.ink),
            fontFamily: THEME.fonts.family,
            fontSize: "28px",
            fontStyle: "bold",
          },
        )
        .setOrigin(0.5);
    }
    return interactables;
  }

  private elevatorLabel(): string {
    if (this.currentFloor === 0) return "Take elevator to Floor 1";
    if (this.currentFloor === 1) return "Take elevator to Floor 2";
    return "Return to Floor 1";
  }

  private useElevator(): void {
    const destination =
      this.currentFloor === 0 ? 1 : this.currentFloor === 1 ? 2 : 1;
    if (destination === 2 && progression.snapshot.unlockedFloor < destination) {
      gameEvents.emit(
        "ui:toast",
        "Floor 2 is locked. Stabilize Floor 1 first.",
      );
      return;
    }
    this.cameras.main.fadeOut(220, 31, 41, 51);
    this.time.delayedCall(230, () =>
      this.scene.restart({ floor: destination }),
    );
  }
}
