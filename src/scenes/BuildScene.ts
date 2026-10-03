import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import { BUILD_COPY } from "../data/build";
import { evaluateDesign } from "../sim/evaluator";
import { createSimulation, tickSimulation } from "../sim/simulation";
import type {
  ComponentType,
  DesignConnection,
  Evaluation,
  SimulationState,
  SystemDesign,
} from "../sim/types";
import { buildDesignStore } from "../state/buildDesign";
import { preferences } from "../state/preferences";
import { progression } from "../state/progression";
import { audio } from "../systems/AudioSystem";
import { gameEvents } from "../systems/EventBus";
import { BuildNode } from "../ui/BuildNode";
import { Palette } from "../ui/Palette";

type PlaceableType = Exclude<ComponentType, "client">;

const CANVAS_LEFT = 270;
const CANVAS_TOP = 116;
const CANVAS_RIGHT = GAME_WIDTH - 24;
const CANVAS_BOTTOM = GAME_HEIGHT - 74;
const SIMULATION_SPEED = 2.4;

export class BuildScene extends Phaser.Scene {
  private readonly nodes = new Map<string, BuildNode>();
  private connections: DesignConnection[] = [];
  private nextNodeId = 1;
  private wireGraphics!: Phaser.GameObjects.Graphics;
  private activeWireFrom?: string;
  private activePointer?: Phaser.Input.Pointer;
  private simulation?: SimulationState;
  private running = false;
  private statsText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private saveText!: Phaser.GameObjects.Text;
  private runButton!: Phaser.GameObjects.Container;
  private trafficDots: Phaser.GameObjects.Arc[] = [];
  private outcomePanel?: Phaser.GameObjects.Container;
  private crashCount = 0;

  constructor() {
    super("BuildScene");
  }

  create(): void {
    this.input.mouse?.disableContextMenu();
    this.cameras.main.setBackgroundColor(THEME.colors.ink);
    this.createChrome();
    this.wireGraphics = this.add.graphics().setDepth(5);
    new Palette(this, 18, 108, (type, x, y) => this.addComponent(type, x, y));

    this.restoreDesign();
    this.drawConnections();

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.activeWireFrom) return;
      this.activePointer = pointer;
      this.drawConnections();
    });
    this.input.on("pointerup", () => {
      this.time.delayedCall(0, () => {
        this.activeWireFrom = undefined;
        this.activePointer = undefined;
        this.drawConnections();
      });
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.removeAllListeners();
    });
  }

  update(_time: number, deltaMs: number): void {
    if (!this.running || !this.simulation) return;
    this.simulation = tickSimulation(
      this.simulation,
      this.toDesign(),
      (deltaMs / 1000) * SIMULATION_SPEED,
    );
    this.renderSimulation();
    if (this.simulation.outcome !== "running") {
      this.running = false;
      this.showOutcome(evaluateDesign(this.toDesign()));
    }
  }

  private createChrome(): void {
    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, THEME.colors.ink)
      .setOrigin(0);
    this.add
      .rectangle(0, 0, GAME_WIDTH, 88, THEME.colors.panelDark)
      .setOrigin(0);
    this.add.text(24, 18, BUILD_COPY.title, {
      color: colorHex(THEME.colors.white),
      fontFamily: THEME.fonts.mono,
      fontSize: "25px",
      fontStyle: "bold",
    });
    this.add.text(24, 52, BUILD_COPY.subtitle, {
      color: colorHex(THEME.colors.successLight),
      fontFamily: THEME.fonts.family,
      fontSize: "15px",
    });
    this.add
      .text(GAME_WIDTH - 34, 22, "×", {
        color: colorHex(THEME.colors.white),
        fontFamily: THEME.fonts.family,
        fontSize: "34px",
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.closeBuild());

    this.add
      .rectangle(
        CANVAS_LEFT,
        CANVAS_TOP,
        CANVAS_RIGHT - CANVAS_LEFT,
        CANVAS_BOTTOM - CANVAS_TOP,
        THEME.colors.paper,
      )
      .setOrigin(0)
      .setStrokeStyle(3, THEME.colors.officeWall);
    this.add
      .grid(
        CANVAS_LEFT,
        CANVAS_TOP,
        CANVAS_RIGHT - CANVAS_LEFT,
        CANVAS_BOTTOM - CANVAS_TOP,
        32,
        32,
        THEME.colors.paper,
        0,
        THEME.colors.officeWall,
        0.14,
      )
      .setOrigin(0);

    this.statsText = this.add.text(CANVAS_LEFT + 18, 94, "READY", {
      color: colorHex(THEME.colors.successLight),
      fontFamily: THEME.fonts.mono,
      fontSize: "14px",
    });
    this.phaseText = this.add
      .text(CANVAS_RIGHT - 18, 94, BUILD_COPY.remove, {
        color: colorHex(THEME.colors.white),
        fontFamily: THEME.fonts.family,
        fontSize: "13px",
      })
      .setOrigin(1, 0);
    this.saveText = this.add
      .text(CANVAS_LEFT + 78, 94, BUILD_COPY.saved, {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.mono,
        fontSize: "12px",
      })
      .setAlpha(0.75);

    this.runButton = this.createButton(
      GAME_WIDTH - 222,
      GAME_HEIGHT - 45,
      396,
      48,
      BUILD_COPY.run,
      THEME.colors.success,
      () => this.runStressTest(),
    );
    this.createButton(
      390,
      GAME_HEIGHT - 45,
      210,
      48,
      BUILD_COPY.reset,
      THEME.colors.alertDark,
      () => this.resetDesign(),
    );
  }

  private addComponent(type: PlaceableType, x: number, y: number): void {
    if (this.running) return;
    const existing = [...this.nodes.values()].filter(
      (node) => node.componentType === type,
    ).length;
    const limit = type === "loadBalancer" ? 1 : 5;
    if (existing >= limit) {
      this.showConsoleMessage(BUILD_COPY.paletteFull);
      return;
    }
    let id: string;
    do {
      id = `${type}-${this.nextNodeId++}`;
    } while (this.nodes.has(id));
    const node = this.createNode(
      id,
      type,
      Phaser.Math.Clamp(x, CANVAS_LEFT + 90, CANVAS_RIGHT - 90),
      Phaser.Math.Clamp(y, CANVAS_TOP + 60, CANVAS_BOTTOM - 60),
    );
    this.bindNodeInteractions(node);
    this.bindInputPort(node);
    if (node.outputPort) this.bindOutputPort(node);
    this.persistDesign();
  }

  private createNode(
    id: string,
    type: ComponentType,
    x: number,
    y: number,
    fixed = false,
  ): BuildNode {
    const node = new BuildNode(this, id, type, x, y, fixed);
    this.nodes.set(id, node);
    return node;
  }

  private restoreDesign(): void {
    const saved = buildDesignStore.load();
    const design: SystemDesign = saved ?? {
      nodes: [{ id: "client", type: "client", x: 370, y: 350 }],
      connections: [],
    };

    for (const savedNode of design.nodes) {
      const fixed = savedNode.type === "client";
      const node = this.createNode(
        savedNode.id,
        savedNode.type,
        Phaser.Math.Clamp(savedNode.x, CANVAS_LEFT + 90, CANVAS_RIGHT - 90),
        Phaser.Math.Clamp(savedNode.y, CANVAS_TOP + 60, CANVAS_BOTTOM - 60),
        fixed,
      );
      if (!fixed) {
        this.bindNodeInteractions(node);
        this.bindInputPort(node);
      }
      if (node.outputPort) this.bindOutputPort(node);
    }

    this.connections = design.connections.filter(
      (connection) =>
        this.nodes.has(connection.from) && this.nodes.has(connection.to),
    );
  }

  private bindNodeInteractions(node: BuildNode): void {
    node.on(
      "drag",
      (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (this.running) return;
        node.setPosition(
          Phaser.Math.Clamp(dragX, CANVAS_LEFT + 90, CANVAS_RIGHT - 90),
          Phaser.Math.Clamp(dragY, CANVAS_TOP + 60, CANVAS_BOTTOM - 60),
        );
        this.drawConnections();
      },
    );
    node.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() && !this.running) {
        this.removeNode(node.nodeId);
      }
    });
    node.on("dragend", () => this.persistDesign());
  }

  private bindOutputPort(node: BuildNode): void {
    node.outputPort?.on(
      "pointerdown",
      (
        pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        if (this.running) return;
        this.activeWireFrom = node.nodeId;
        this.activePointer = pointer;
        this.drawConnections();
      },
    );
  }

  private bindInputPort(node: BuildNode): void {
    node.inputPort?.on(
      "pointerup",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        if (!this.activeWireFrom || this.running) return;
        this.tryConnect(this.activeWireFrom, node.nodeId);
        this.activeWireFrom = undefined;
        this.activePointer = undefined;
        this.drawConnections();
      },
    );
  }

  private tryConnect(from: string, to: string): void {
    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);
    if (!fromNode || !toNode || from === to) return;
    const valid =
      (fromNode.componentType === "client" &&
        (toNode.componentType === "loadBalancer" ||
          toNode.componentType === "server")) ||
      (fromNode.componentType === "loadBalancer" &&
        toNode.componentType === "server");
    if (!valid) {
      this.showConsoleMessage(BUILD_COPY.invalidConnection);
      return;
    }
    if (
      this.connections.some(
        (connection) => connection.from === from && connection.to === to,
      )
    ) {
      this.showConsoleMessage(BUILD_COPY.duplicateConnection);
      return;
    }
    this.connections.push({ from, to });
    this.persistDesign();
  }

  private removeNode(id: string): void {
    const node = this.nodes.get(id);
    if (!node || node.componentType === "client") return;
    this.connections = this.connections.filter(
      (connection) => connection.from !== id && connection.to !== id,
    );
    node.destroy();
    this.nodes.delete(id);
    this.drawConnections();
    this.persistDesign();
  }

  private drawConnections(): void {
    if (!this.wireGraphics) return;
    this.wireGraphics.clear();
    this.wireGraphics.lineStyle(5, THEME.colors.officeWall, 0.85);
    for (const connection of this.connections) {
      const from = this.nodes.get(connection.from);
      const to = this.nodes.get(connection.to);
      if (!from || !to) continue;
      this.drawWire(from.x + 76, from.y, to.x - 76, to.y);
    }
    if (this.activeWireFrom && this.activePointer) {
      const from = this.nodes.get(this.activeWireFrom);
      if (from) {
        this.wireGraphics.lineStyle(4, THEME.colors.warning, 0.9);
        this.drawWire(
          from.x + 76,
          from.y,
          this.activePointer.x,
          this.activePointer.y,
        );
      }
    }
  }

  private drawWire(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ): void {
    const midpoint = (startX + endX) / 2;
    this.wireGraphics.beginPath();
    this.wireGraphics.moveTo(startX, startY);
    this.wireGraphics.lineTo(midpoint, startY);
    this.wireGraphics.lineTo(midpoint, endY);
    this.wireGraphics.lineTo(endX, endY);
    this.wireGraphics.strokePath();
  }

  private runStressTest(): void {
    if (this.running || this.outcomePanel) return;
    const design = this.toDesign();
    const evaluation = evaluateDesign(design);
    this.resetNodeStatuses();
    if (evaluation.id === "invalid") {
      this.showOutcome(evaluation);
      return;
    }

    this.simulation = createSimulation(design);
    this.running = true;
    this.crashCount = 0;
    this.runButton.setAlpha(0.45);
    this.phaseText.setText("STRESS SCHEDULE ACTIVE");
    this.createTrafficDots();
  }

  private renderSimulation(): void {
    if (!this.simulation) return;
    const state = this.simulation;
    this.statsText.setText(
      `${state.incomingRps.toFixed(0)} RPS  //  ERRORS ${(state.errorRate * 100).toFixed(1)}%`,
    );
    this.phaseText.setText(
      `${state.phaseId.toUpperCase()}  ${(state.phaseProgress * 100).toFixed(0)}%`,
    );
    state.servers.forEach((server) => {
      this.nodes.get(server.id)?.setServerStatus(server.health, server.loadRps);
    });
    const crashedServers = state.servers.filter(
      (server) => server.health === "crashed",
    );
    const currentCrashCount = crashedServers.length;
    if (currentCrashCount > this.crashCount) {
      const newestCrash = crashedServers[crashedServers.length - 1];
      if (newestCrash) this.playCrashEffect(newestCrash.id);
      this.crashCount = currentCrashCount;
    }
    this.nodes
      .get("client")
      ?.outputPort?.setFillStyle(
        state.errorRate > 0.01 ? THEME.colors.alert : THEME.colors.success,
      );

    this.trafficDots.forEach((dot, index) => {
      const connection = this.connections[index];
      if (!connection) return;
      const from = this.nodes.get(connection.from);
      const to = this.nodes.get(connection.to);
      if (!from || !to) return;
      const progress = (state.elapsedSeconds * 0.75 + index * 0.22) % 1;
      dot.setPosition(
        Phaser.Math.Linear(from.x + 76, to.x - 76, progress),
        Phaser.Math.Linear(from.y, to.y, progress),
      );
      dot.setFillStyle(
        state.errorRate > 0.01 ? THEME.colors.alert : THEME.colors.success,
      );
    });
  }

  private showOutcome(evaluation: Evaluation): void {
    this.destroyTrafficDots();
    this.runButton.setAlpha(1);
    if (evaluation.quality === "canonical") {
      audio.playSuccess();
      this.playCelebration();
    } else if (evaluation.quality === "failed") {
      audio.playCrash();
    }
    if (evaluation.quality !== "failed") {
      progression.completeFloor(1, evaluation.quality, evaluation.debtNotes);
      gameEvents.emit("progression:updated", progression.snapshot);
    }

    const panel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    panel.setDepth(200);
    const scrim = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, THEME.colors.ink, 0.65)
      .setInteractive();
    const accent =
      evaluation.quality === "canonical"
        ? THEME.colors.success
        : evaluation.quality === "partial"
          ? THEME.colors.warning
          : THEME.colors.alert;
    const card = this.add
      .rectangle(0, 0, 650, 320, THEME.colors.panel)
      .setStrokeStyle(6, accent);
    const quality = this.add
      .text(0, -112, evaluation.quality.toUpperCase(), {
        color: colorHex(accent),
        fontFamily: THEME.fonts.mono,
        fontSize: "17px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const title = this.add
      .text(0, -72, evaluation.title, {
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "31px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const message = this.add
      .text(0, 5, evaluation.message, {
        align: "center",
        color: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "19px",
        lineSpacing: 5,
        wordWrap: { width: 560 },
      })
      .setOrigin(0.5);
    const button = this.createButton(
      0,
      112,
      310,
      52,
      evaluation.quality === "failed" ? BUILD_COPY.edit : BUILD_COPY.close,
      accent,
      () => {
        if (evaluation.quality === "failed") {
          panel.destroy();
          this.outcomePanel = undefined;
          this.phaseText.setText(BUILD_COPY.remove);
          this.statsText.setText("READY");
          this.resetNodeStatuses();
        } else {
          this.closeBuild();
        }
      },
    );
    panel.add([scrim, card, quality, title, message, button]);
    this.outcomePanel = panel;
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    const background = this.add
      .rectangle(0, 0, width, height, color)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", onClick);
    const text = this.add
      .text(0, 0, label, {
        color: colorHex(THEME.colors.white),
        fontFamily: THEME.fonts.mono,
        fontSize: "16px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    button.add([background, text]);
    return button;
  }

  private createTrafficDots(): void {
    this.destroyTrafficDots();
    this.trafficDots = this.connections.map(() =>
      this.add.circle(0, 0, 7, THEME.colors.success).setDepth(30),
    );
  }

  private destroyTrafficDots(): void {
    this.trafficDots.forEach((dot) => dot.destroy());
    this.trafficDots = [];
  }

  private resetNodeStatuses(): void {
    this.nodes.forEach((node) => node.resetStatus());
  }

  private resetDesign(): void {
    this.running = false;
    this.outcomePanel?.destroy();
    this.outcomePanel = undefined;
    this.destroyTrafficDots();
    this.runButton.setAlpha(1);
    this.activeWireFrom = undefined;
    this.activePointer = undefined;
    this.nodes.forEach((node) => node.destroy());
    this.nodes.clear();
    this.connections = [];
    this.nextNodeId = 1;
    this.simulation = undefined;
    this.crashCount = 0;
    buildDesignStore.reset();

    const client = this.createNode("client", "client", 370, 350, true);
    this.bindOutputPort(client);
    this.resetNodeStatuses();
    this.statsText
      .setColor(colorHex(THEME.colors.successLight))
      .setText("READY");
    this.phaseText.setText(BUILD_COPY.remove);
    this.drawConnections();
    this.persistDesign();
  }

  private persistDesign(): void {
    buildDesignStore.save(this.toDesign());
    if (this.saveText?.active) {
      this.saveText.setAlpha(1);
      this.tweens.killTweensOf(this.saveText);
      this.tweens.add({
        targets: this.saveText,
        alpha: 0.55,
        duration: 700,
      });
    }
  }

  private playCrashEffect(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    audio.playCrash();
    if (!preferences.snapshot.reducedMotion) {
      this.cameras.main.shake(240, 0.009);
    }
    for (let index = 0; index < 9; index += 1) {
      const spark = this.add
        .circle(node.x, node.y, Phaser.Math.Between(3, 7), THEME.colors.alert)
        .setDepth(50);
      this.tweens.add({
        targets: spark,
        x: node.x + Phaser.Math.Between(-70, 70),
        y: node.y + Phaser.Math.Between(-80, 20),
        alpha: 0,
        duration: preferences.snapshot.reducedMotion ? 120 : 520,
        onComplete: () => spark.destroy(),
      });
    }
  }

  private playCelebration(): void {
    if (!preferences.snapshot.reducedMotion) {
      this.cameras.main.flash(500, 47, 133, 90);
    }
    for (let index = 0; index < 36; index += 1) {
      const confetti = this.add
        .rectangle(
          Phaser.Math.Between(CANVAS_LEFT, CANVAS_RIGHT),
          Phaser.Math.Between(90, 180),
          8,
          18,
          index % 2 === 0 ? THEME.colors.success : THEME.colors.warning,
        )
        .setDepth(160)
        .setAngle(Phaser.Math.Between(0, 180));
      this.tweens.add({
        targets: confetti,
        y: GAME_HEIGHT + 40,
        angle: confetti.angle + Phaser.Math.Between(180, 540),
        duration: preferences.snapshot.reducedMotion
          ? 250
          : Phaser.Math.Between(1100, 2200),
        delay: preferences.snapshot.reducedMotion
          ? 0
          : Phaser.Math.Between(0, 450),
        onComplete: () => confetti.destroy(),
      });
    }
  }

  private showConsoleMessage(message: string): void {
    this.statsText.setColor(colorHex(THEME.colors.warning)).setText(message);
    this.time.delayedCall(2200, () => {
      if (!this.running && this.statsText.active) {
        this.statsText
          .setColor(colorHex(THEME.colors.successLight))
          .setText("READY");
      }
    });
  }

  private toDesign(): SystemDesign {
    return {
      nodes: [...this.nodes.values()].map((node) => ({
        id: node.nodeId,
        type: node.componentType,
        x: node.x,
        y: node.y,
      })),
      connections: this.connections.map((connection) => ({ ...connection })),
    };
  }

  private closeBuild(): void {
    this.running = false;
    this.destroyTrafficDots();
    this.scene.stop();
    this.scene.resume("FloorScene");
    gameEvents.emit("build:closed");
  }
}
