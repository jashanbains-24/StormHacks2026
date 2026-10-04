import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import { beginModal } from "../core/ui-kit/modal";
import { ELEVATOR_COPY, FLOOR_LOCK_MESSAGES } from "../data/elevator";
import { floorLockReason } from "../sim/floorAccess";
import type { ProgressionState } from "../state/progression";

interface ElevatorFloor {
  order: number;
  title: string;
}

interface ElevatorOptions {
  currentFloor: number;
  floors: readonly ElevatorFloor[];
  progression: () => ProgressionState;
  onTravel: (order: number) => void;
  onClose: () => void;
}

export class ElevatorPanel extends Phaser.GameObjects.Container {
  private value = "";
  private readonly digits: number;
  private readonly display: Phaser.GameObjects.Text;
  private readonly destination: Phaser.GameObjects.Text;
  private readonly status: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    private readonly options: ElevatorOptions,
  ) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(2200);
    const releaseModal = beginModal(scene);
    const keyboard = scene.input.keyboard;
    keyboard?.on("keydown", this.handleKey);
    const onShutdown = (): void => this.destroy();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      keyboard?.off("keydown", this.handleKey);
      scene.events.off(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
      releaseModal();
      options.onClose();
    });
    this.digits = Math.max(
      ...options.floors.map((floor) => String(floor.order).length),
      1,
    );

    this.createFrame();
    const display = this.createDisplay();
    this.display = display.number;
    this.destination = display.destination;
    this.status = display.status;
    this.createFloorButtons();
    this.createNumberPad();
    this.createControls();
    this.refreshDisplay();
  }

  private createFrame(): void {
    const scene = this.scene;
    this.add(
      scene.add
        .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, THEME.colors.ink)
        .setOrigin(0)
        .setInteractive(),
    );
    this.add(
      scene.add
        .rectangle(
          48,
          24,
          GAME_WIDTH - 96,
          GAME_HEIGHT - 48,
          THEME.colors.panelDark,
        )
        .setOrigin(0)
        .setStrokeStyle(4, THEME.colors.officeWall),
    );
    this.add(
      scene.add
        .text(GAME_WIDTH / 2, 48, "BREAKPOINT // ELEVATOR", {
          color: colorHex(THEME.colors.successLight),
          fontFamily: THEME.fonts.mono,
          fontSize: "15px",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0),
    );
    this.add(
      scene.add
        .text(GAME_WIDTH / 2, 82, ELEVATOR_COPY.title, {
          color: colorHex(THEME.colors.white),
          fontFamily: THEME.fonts.family,
          fontSize: "31px",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0),
    );
    this.add(
      scene.add
        .rectangle(140, 156, 590, 460, THEME.colors.panel)
        .setOrigin(0)
        .setStrokeStyle(4, THEME.colors.officeWall),
    );
    this.add(
      scene.add.text(168, 177, ELEVATOR_COPY.destination, {
        color: colorHex(THEME.colors.muted),
        fontFamily: THEME.fonts.mono,
        fontSize: "15px",
      }),
    );
  }

  private createDisplay() {
    const scene = this.scene;
    const number = scene.add.text(168, 205, "—", {
      color: colorHex(THEME.colors.ink),
      fontFamily: THEME.fonts.mono,
      fontSize: "45px",
      fontStyle: "bold",
    });
    const destination = scene.add.text(168, 271, "", {
      color: colorHex(THEME.colors.ink),
      fontFamily: THEME.fonts.family,
      fontSize: "23px",
      fontStyle: "bold",
      wordWrap: { width: 530 },
    });
    const status = scene.add.text(168, 354, "", {
      color: colorHex(THEME.colors.ink),
      fontFamily: THEME.fonts.family,
      fontSize: "17px",
      lineSpacing: 4,
      wordWrap: { width: 530 },
    });
    this.add([number, destination, status]);
    return { number, destination, status };
  }

  private createControls(): void {
    const scene = this.scene;
    this.add(
      scene.add
        .text(964, 592, ELEVATOR_COPY.controls, {
          align: "center",
          color: colorHex(THEME.colors.white),
          fontFamily: THEME.fonts.family,
          fontSize: "16px",
          lineSpacing: 8,
        })
        .setOrigin(0.5, 0),
    );
    this.add(
      scene.add
        .text(GAME_WIDTH - 78, 32, "×", {
          color: colorHex(THEME.colors.white),
          fontFamily: THEME.fonts.family,
          fontSize: "34px",
          padding: { x: 12, y: 4 },
        })
        .setOrigin(1, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerup", () => this.destroy()),
    );
  }

  private createFloorButtons(): void {
    const state = this.options.progression();
    this.options.floors.forEach((floor, index) => {
      const current = floor.order === this.options.currentFloor;
      const locked = Boolean(floorLockReason(floor.order, state));
      const label = floor.title.split(":")[0];
      this.createButton(
        435,
        456 + index * 52,
        530,
        42,
        `${floor.order}  ${label}     ${current ? "CURRENT" : locked ? "LOCKED" : "AVAILABLE"}`,
        current
          ? THEME.colors.panelDark
          : locked
            ? THEME.colors.alertDark
            : THEME.colors.success,
        () => {
          this.value = String(floor.order);
          this.refreshDisplay();
        },
        16,
      );
    });
  }

  private createNumberPad(): void {
    for (let digit = 1; digit <= 9; digit += 1) {
      const index = digit - 1;
      this.createButton(
        860 + (index % 3) * 104,
        220 + Math.floor(index / 3) * 92,
        84,
        72,
        String(digit),
        THEME.colors.ink,
        () => this.appendDigit(String(digit)),
      );
    }
    this.createButton(860, 496, 84, 72, "←", THEME.colors.ink, () =>
      this.backspace(),
    );
    this.createButton(964, 496, 84, 72, "0", THEME.colors.ink, () =>
      this.appendDigit("0"),
    );
    this.createButton(
      1068,
      496,
      84,
      72,
      "GO ↵",
      THEME.colors.success,
      () => this.travel(),
      18,
    );
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number,
    onClick: () => void,
    fontSize = 27,
  ): void {
    const button = this.scene.add.container(x, y);
    button.add([
      this.scene.add
        .rectangle(0, 0, width, height, color)
        .setStrokeStyle(3, THEME.colors.officeWall)
        .setInteractive({ useHandCursor: true })
        .on("pointerup", onClick),
      this.scene.add
        .text(0, 0, label, {
          color: colorHex(THEME.colors.white),
          fontFamily: THEME.fonts.mono,
          fontSize: `${fontSize}px`,
          fontStyle: "bold",
        })
        .setOrigin(0.5),
    ]);
    this.add(button);
  }

  private readonly handleKey = (event: KeyboardEvent): void => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    const digit =
      /^Numpad(\d)$/.exec(event.code)?.[1] ??
      (/^\d$/.test(event.key) ? event.key : undefined);
    if (digit) this.appendDigit(digit);
    else if (event.key === "Backspace") this.backspace();
    else if (event.key === "Enter") this.travel();
    else if (event.key === "Escape") this.destroy();
    else return;
    event.preventDefault();
  };

  private appendDigit(digit: string): void {
    this.value = this.value.length >= this.digits ? digit : this.value + digit;
    this.refreshDisplay();
  }

  private backspace(): void {
    this.value = this.value.slice(0, -1);
    this.refreshDisplay();
  }

  private refreshDisplay(): void {
    this.display.setText(this.value || "—");
    const floor = this.options.floors.find(
      (candidate) => String(candidate.order) === this.value,
    );
    this.destination.setText(
      floor?.title ??
        (this.value ? ELEVATOR_COPY.unknown : ELEVATOR_COPY.empty),
    );
    const reason =
      floor && floorLockReason(floor.order, this.options.progression());
    this.status.setColor(
      colorHex(
        reason || (this.value && !floor)
          ? THEME.colors.alertDark
          : THEME.colors.ink,
      ),
    );
    this.status.setText(
      floor?.order === this.options.currentFloor
        ? ELEVATOR_COPY.current
        : reason
          ? FLOOR_LOCK_MESSAGES[reason]
          : floor
            ? ELEVATOR_COPY.ready
            : "",
    );
  }

  private travel(): void {
    const floor = this.options.floors.find(
      (candidate) => String(candidate.order) === this.value,
    );
    if (
      !floor ||
      floor.order === this.options.currentFloor ||
      floorLockReason(floor.order, this.options.progression())
    ) {
      this.refreshDisplay();
      return;
    }
    this.options.onTravel(floor.order);
  }
}
