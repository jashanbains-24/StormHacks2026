import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../../config/dimensions";
import { THEME, colorHex } from "../../config/theme";
import type {
  FloorContext,
  FloorInteractable,
  ThemeTokens,
} from "../contracts";
import type { Interactable } from "../../entities/Interactable";
import { Npc } from "../../entities/Npc";
import { Player } from "../../entities/Player";
import type { SimulationState } from "../../sim/types";
import { floorLockReason } from "../../sim/floorAccess";
import { FLOOR_LOCK_MESSAGES } from "../../data/elevator";
import { ElevatorPanel } from "../../ui/ElevatorPanel";
import { preferences } from "../../state/preferences";
import { floorShowsAlert, progression } from "../../state/progression";
import { audio } from "../../systems/AudioSystem";
import { gameEvents } from "../../systems/EventBus";
import { InteractionSystem } from "../../systems/InteractionSystem";
import { getFloorByOrder, getFloors } from "./floorRegistry";

export class FloorScene extends Phaser.Scene {
  private currentFloor = 0;
  private preview: FloorContext["preview"] = {
    enabled: false,
    state: "calm",
  };
  private simulationSnapshot?: SimulationState;
  private player!: Player;
  private interactions!: InteractionSystem;
  private updaters: (() => void)[] = [];
  private interactables: Interactable[] = [];
  private emergencyLights: Phaser.GameObjects.Arc[] = [];
  private emergencyTheme?: ThemeTokens;
  private elevatorPanel?: ElevatorPanel;
  private travelling = false;

  constructor() {
    super("FloorScene");
  }

  init(
    data: {
      floor?: number;
      preview?: FloorContext["preview"];
      simulationSnapshot?: SimulationState;
    } = {},
  ): void {
    this.currentFloor = data.floor ?? 0;
    this.preview = data.preview ?? { enabled: false, state: "calm" };
    this.simulationSnapshot = data.simulationSnapshot;
    this.elevatorPanel = undefined;
    this.travelling = false;
  }

  create(): void {
    const floor = getFloorByOrder(this.currentFloor);
    const theme = this.floorTheme(floor.module.theme);
    this.updaters = [];
    this.interactables = [];
    this.cameras.main.setBackgroundColor(theme.colors.officeFloor);
    this.physics.world.setBounds(40, 82, GAME_WIDTH - 80, GAME_HEIGHT - 122);
    this.add
      .tileSprite(40, 82, GAME_WIDTH - 80, GAME_HEIGHT - 122, "office-floor")
      .setOrigin(0)
      .setTileScale(4)
      .setDepth(-10);
    this.player = new Player(this, 130, GAME_HEIGHT / 2);
    this.createBoundaries(theme);
    this.createHeader(floor.module.title, theme);
    if (!floor.module.view.replacesDefaultEmergencyEffects) {
      this.createEmergencyLights(theme);
    }

    const context = this.createContext(theme);
    this.createElevator(context);
    floor.module.view.createLayout(context);
    floor.module.view.createBuildUI(context);
    floor.module.view.createEffects?.(context);

    this.interactions = new InteractionSystem(this, this.player);
    this.interactions.setInteractables(this.interactables);
    gameEvents.emit("floor:changed", this.currentFloor, floor.module.id);
  }

  update(): void {
    if (this.elevatorPanel || this.travelling) {
      this.player.setVelocity(0, 0);
      return;
    }
    this.player.update();
    this.updaters.forEach((update) => update());
    this.interactions.update();
  }

  private createContext(theme: ThemeTokens): FloorContext {
    const floor = getFloorByOrder(this.currentFloor);
    return {
      scene: this,
      player: this.player,
      floorOrder: this.currentFloor,
      theme,
      preview: this.preview,
      preferences: {
        get muted() {
          return preferences.snapshot.muted;
        },
        reducedMotion: preferences.snapshot.reducedMotion,
      },
      sim: {
        snapshot: this.simulationSnapshot,
      },
      hud: {
        showToast: (message) => gameEvents.emit("ui:toast", message),
        setObjective: (message) => gameEvents.emit("ui:objective", message),
        trackTask: (task, completed = false) =>
          gameEvents.emit("ui:task", this.currentFloor, task, completed),
      },
      dialogue: {
        showSpecialist: () =>
          gameEvents.emit("dialogue:specialist", floor.module.id),
        showSequence: (lines, onDismiss) =>
          gameEvents.emit("dialogue:sequence", lines, onDismiss),
        dismiss: () => gameEvents.emit("dialogue:dismiss", "replaced"),
        showLine: (line, onDismiss) => {
          audio.playClick();
          gameEvents.emit("dialogue:line", line, onDismiss);
        },
        showChoice: (line, onChoose) => {
          audio.playClick();
          gameEvents.emit("dialogue:choice", line, onChoose);
        },
      },
      glossary: {
        open: (id) => gameEvents.emit("glossary:open", id),
      },
      progression: {
        get unlockedFloor() {
          return progression.snapshot.unlockedFloor;
        },
        resultFor: (order) => progression.snapshot.floorResults[order],
        completedThisSession: (order) =>
          progression.wasCompletedThisSession(order),
        canonicalThisSession: (order) =>
          progression.wasCanonicallyCompletedThisSession(order),
        handoffPending: (order) => progression.handoffPending(order),
        confirmHandoff: (order) => {
          progression.confirmHandoff(order);
          gameEvents.emit("progression:updated", progression.snapshot);
        },
        report: (order, quality, debtNotes) => {
          progression.completeFloor(order, quality, debtNotes);
          gameEvents.emit("progression:updated", progression.snapshot);
        },
        flag: (name) => progression.flag(name),
        setFlag: (name, value) => {
          progression.setFlag(name, value);
        },
      },
      audio: {
        playClick: () => audio.playClick(),
        playSuccess: () => audio.playSuccess(),
      },
      events: {
        emit: (name, ...args) => gameEvents.emit(name, ...args),
        on: (name, listener) => {
          const unsubscribe = () => gameEvents.off(name, listener);
          gameEvents.on(name, listener);
          this.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);
          return unsubscribe;
        },
      },
      assets: {
        key: (localName) =>
          localName.startsWith(`${floor.module.id}.`)
            ? localName
            : `${floor.module.id}.${localName}`,
      },
      addInteractable: (interactable: FloorInteractable) => {
        this.interactables.push(interactable);
      },
      addNpc: (x, y, id, options) => new Npc(this, x, y, id, options),
      addUpdater: (update) => this.updaters.push(update),
      openBuild: () => gameEvents.emit("build:open", floor.module.id),
      navigateTo: (order) => this.navigateTo(order),
    };
  }

  private createHeader(title: string, theme: ThemeTokens): void {
    const separator = title.indexOf(":");
    const floorLabel = separator === -1 ? title : title.slice(0, separator);
    const floorTitle =
      separator === -1 ? "" : title.slice(separator + 1).trim();
    const panelWidth = 470;
    const panelHeight = 68;
    const panelX = (GAME_WIDTH - panelWidth) / 2;
    const header = this.add.graphics().setDepth(700);
    header.fillStyle(theme.colors.ink, 0.25);
    header.fillRoundedRect(panelX + 5, 5, panelWidth, panelHeight, 14);
    header.fillStyle(theme.colors.panelDark);
    header.lineStyle(2, theme.colors.officeWall);
    header.fillRoundedRect(panelX, 0, panelWidth, panelHeight, 14);
    header.strokeRoundedRect(panelX, -2, panelWidth, panelHeight, 14);
    this.add
      .text(GAME_WIDTH / 2, 10, floorLabel.toUpperCase(), {
        color: colorHex(theme.colors.successLight),
        fontFamily: theme.fonts.mono,
        fontSize: "13px",
        fontStyle: "bold",
        letterSpacing: 1.5,
      })
      .setOrigin(0.5, 0)
      .setDepth(701);
    this.add
      .text(GAME_WIDTH / 2, 29, floorTitle, {
        color: colorHex(theme.colors.white),
        fontFamily: theme.fonts.family,
        fontSize: "24px",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .setDepth(701);

    if (
      progression.snapshot.floorResults[this.currentFloor]?.quality ===
      "partial"
    ) {
      this.add
        .text(GAME_WIDTH / 2 + panelWidth / 2 + 18, 20, "⚠ TECH DEBT", {
          color: colorHex(theme.colors.warning),
          backgroundColor: colorHex(theme.colors.ink),
          fontFamily: theme.fonts.mono,
          fontSize: "13px",
          fontStyle: "bold",
          padding: { x: 8, y: 6 },
        })
        .setDepth(701);
    }
  }

  private createBoundaries(theme: ThemeTokens): void {
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
        theme.colors.officeWall,
      );
      this.physics.add.existing(wall, true);
      this.physics.add.collider(this.player, wall);
    }
  }

  private createEmergencyLights(theme: ThemeTokens): void {
    this.emergencyTheme = theme;
    this.emergencyLights = [180, 640, 1090].map((x) =>
      this.add.circle(x, 97, 10, theme.colors.success, 0.9).setDepth(30),
    );
    this.refreshEmergencyLights();
    const onProgression = (): void => this.refreshEmergencyLights();
    gameEvents.on("progression:updated", onProgression);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameEvents.off("progression:updated", onProgression);
    });
  }

  private refreshEmergencyLights(): void {
    const theme = this.emergencyTheme;
    if (!theme) return;
    const alerting = floorShowsAlert(this.currentFloor, progression.snapshot);
    const color = alerting ? theme.colors.alert : theme.colors.success;
    this.emergencyLights.forEach((light) => {
      this.tweens.killTweensOf(light);
      light.setFillStyle(color, 0.9).setAlpha(0.9);
      if (alerting && !preferences.snapshot.reducedMotion) {
        this.tweens.add({
          targets: light,
          alpha: { from: 0.25, to: 1 },
          duration: 1000,
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }

  private createElevator(ctx: FloorContext): void {
    const elevatorY = GAME_HEIGHT / 2;
    ctx.scene.add
      .rectangle(
        GAME_WIDTH - 102,
        elevatorY,
        104,
        174,
        ctx.theme.colors.panelDark,
      )
      .setStrokeStyle(6, ctx.theme.colors.ink)
      .setDepth(elevatorY);
    ctx.scene.add
      .text(GAME_WIDTH - 102, elevatorY - 10, "ELEVATOR", {
        color: colorHex(ctx.theme.colors.white),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "16px",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAngle(-90)
      .setDepth(elevatorY + 1);
    ctx.addInteractable({
      id: `${getFloorByOrder(this.currentFloor).module.id}:elevator`,
      label: "Enter elevator / choose a floor",
      x: GAME_WIDTH - 135,
      y: elevatorY,
      range: 105,
      onInteract: () => this.useElevator(),
    });
  }

  private useElevator(): void {
    if (this.elevatorPanel || this.travelling) return;
    this.player.setVelocity(0, 0);
    this.physics.world.pause();
    audio.playClick();
    this.elevatorPanel = new ElevatorPanel(this, {
      currentFloor: this.currentFloor,
      floors: getFloors().map(({ order, module }) => ({
        order,
        title: module.title,
      })),
      progression: () => progression.snapshot,
      onTravel: (order) => this.navigateTo(order),
      onClose: () => {
        this.elevatorPanel = undefined;
        this.physics.world.resume();
      },
    });
  }

  private navigateTo(order: number): void {
    getFloorByOrder(order);
    if (this.travelling || order === this.currentFloor) return;
    const reason = floorLockReason(order, progression.snapshot);
    if (reason) {
      gameEvents.emit("ui:toast", FLOOR_LOCK_MESSAGES[reason]);
      return;
    }
    this.travelling = true;
    this.elevatorPanel?.destroy();
    this.cameras.main.fadeOut(220, 31, 41, 51);
    this.time.delayedCall(230, () =>
      this.scene.restart({
        floor: order,
        preview: this.preview,
        simulationSnapshot: this.simulationSnapshot,
      }),
    );
  }

  private floorTheme(
    overrides: ReturnType<typeof getFloorByOrder>["module"]["theme"],
  ): ThemeTokens {
    return {
      colors: { ...THEME.colors, ...overrides?.colors },
      fonts: THEME.fonts,
      spacing: { ...THEME.spacing, ...overrides?.spacing },
      radius: { ...THEME.radius, ...overrides?.radius },
    };
  }
}
