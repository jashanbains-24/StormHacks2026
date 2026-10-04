import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import type { FloorDialogueLine, FloorGlossaryEntry } from "../core/contracts";
import {
  getFloorById,
  getFloorByOrder,
  getNextFloor,
} from "../core/runtime/floorRegistry";
import { preferences } from "../state/preferences";
import { floorShowsAlert, progression } from "../state/progression";
import { audio } from "../systems/AudioSystem";
import { DialogueSystem } from "../systems/DialogueSystem";
import { gameEvents } from "../systems/EventBus";
import { GlossaryPopup } from "../ui/GlossaryPopup";
import { Notification } from "../ui/Notification";
import { SpeechBubble } from "../ui/SpeechBubble";

export class UIScene extends Phaser.Scene {
  private readonly dialogue = new DialogueSystem();
  private interactionPrompt!: Phaser.GameObjects.Text;
  private objective!: Phaser.GameObjects.Text;
  private speech?: SpeechBubble;
  private notification?: Notification;
  private alertFrame!: Phaser.GameObjects.Rectangle;
  private alertTween?: Phaser.Tweens.Tween;
  private soundToggle!: Phaser.GameObjects.Text;
  private motionToggle!: Phaser.GameObjects.Text;
  private currentFloor = 0;
  private glossaryById: Record<string, FloorGlossaryEntry> = {};

  constructor() {
    super("UIScene");
  }

  create(): void {
    const tutorial = getFloorByOrder(0).module.definition.content;
    this.interactionPrompt = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 17, "", {
        color: colorHex(THEME.colors.white),
        backgroundColor: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "18px",
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5, 1)
      .setDepth(900)
      .setVisible(false);
    this.objective = this.add
      .text(24, 77, tutorial.tutorial.move ?? "", {
        color: colorHex(THEME.colors.ink),
        backgroundColor: colorHex(THEME.colors.panel),
        fontFamily: THEME.fonts.family,
        fontSize: "16px",
        fontStyle: "bold",
        padding: { x: 11, y: 7 },
      })
      .setDepth(900);
    this.createEmergencyFrame();
    this.createAccessibilityControls();
    this.refreshAlertFrame();

    gameEvents.on("interaction:available", this.showInteraction, this);
    gameEvents.on("interaction:clear", this.hideInteraction, this);
    gameEvents.on("floor:changed", this.handleFloorChanged, this);
    gameEvents.on("dialogue:specialist", this.showSpecialistHint, this);
    gameEvents.on("dialogue:line", this.showDialogueLine, this);
    gameEvents.on("dialogue:choice", this.showDialogueChoice, this);
    gameEvents.on("ui:toast", this.showToast, this);
    gameEvents.on("ui:objective", this.setObjective, this);
    gameEvents.on("build:open", this.openBuildScene, this);
    gameEvents.on("build:closed", this.handleBuildClosed, this);
    gameEvents.on("progression:updated", this.handleProgressionUpdated, this);

    if (tutorial.managerAlert) {
      this.notification = new Notification(
        this,
        GAME_WIDTH - 620,
        82,
        tutorial.managerAlert.speakerName,
        tutorial.managerAlert.text,
      );
    }
    this.time.delayedCall(4200, () => {
      if (this.scene.isActive() && this.currentFloor === 0) {
        this.setObjective(tutorial.tutorial.elevator ?? "");
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.removeListeners, this);
  }

  private showInteraction(label: string): void {
    this.interactionPrompt.setText(`[E] ${label}`).setVisible(true);
  }

  private hideInteraction(): void {
    this.interactionPrompt.setVisible(false);
  }

  private handleFloorChanged(floor: number): void {
    this.speech?.destroy();
    this.currentFloor = floor;
    const module = getFloorByOrder(floor).module;
    const content = module.definition.content;
    this.dialogue.setSpecialistHints(content.specialistHints);
    this.glossaryById = Object.fromEntries(
      content.glossary.map((entry) => [entry.id, entry]),
    );
    this.refreshAlertFrame();
    this.setObjective(
      content.tutorial.build ??
        content.tutorial.elevator ??
        `${module.title} — incident queue empty`,
    );
  }

  private showSpecialistHint(): void {
    audio.playClick();
    this.speech?.destroy();
    const line = this.dialogue.nextSpecialistHint();
    if (!line) return;
    this.showDialogueLine(line);
  }

  private showDialogueLine(
    line: FloorDialogueLine,
    onDismiss?: () => void,
  ): void {
    this.speech?.destroy();
    this.speech = new SpeechBubble(
      this,
      line,
      this.glossaryById,
      (entry) => this.showGlossary(entry),
      undefined,
      onDismiss,
    );
  }

  private showDialogueChoice(
    line: FloorDialogueLine,
    onChoose: (choiceId: string) => void,
  ): void {
    this.speech?.destroy();
    this.speech = new SpeechBubble(
      this,
      line,
      this.glossaryById,
      (entry) => this.showGlossary(entry),
      (choiceId) => {
        audio.playClick();
        onChoose(choiceId);
      },
    );
  }

  private showGlossary(entry: FloorGlossaryEntry): void {
    new GlossaryPopup(this, entry);
  }

  private showToast(message: string): void {
    this.notification?.dismiss();
    this.notification = new Notification(
      this,
      GAME_WIDTH - 620,
      82,
      "OFFICE MEMO",
      message,
      THEME.colors.warning,
      3800,
    );
  }

  private setObjective(message: string): void {
    this.objective.setText(message).setVisible(message.length > 0);
  }

  private openBuildScene(floorId: string): void {
    if (this.scene.isActive("BuildScene")) return;
    this.speech?.destroy();
    this.objective.setVisible(false);
    this.interactionPrompt.setVisible(false);
    this.scene.pause("FloorScene");
    this.scene.launch("BuildScene", {
      floorOrder: getFloorById(floorId).order,
    });
  }

  private handleBuildClosed(): void {
    this.objective.setVisible(true);
    if (progression.snapshot.floorResults[1]) {
      this.scene.stop("FloorScene");
      this.scene.launch("FloorScene", { floor: this.currentFloor });
      this.scene.bringToTop();
    }
  }

  private createEmergencyFrame(): void {
    this.alertFrame = this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH - 18,
        GAME_HEIGHT - 18,
      )
      .setStrokeStyle(3, THEME.colors.alert, 0.5)
      .setDepth(850);
  }

  private refreshAlertFrame(): void {
    this.alertTween?.stop();
    if (!floorShowsAlert(this.currentFloor, progression.snapshot)) {
      this.alertFrame.setAlpha(1).setStrokeStyle(3, THEME.colors.success, 0.8);
      return;
    }
    this.alertFrame.setAlpha(0.7).setStrokeStyle(3, THEME.colors.alert, 0.5);
    if (preferences.snapshot.reducedMotion) return;
    this.alertTween = this.tweens.add({
      targets: this.alertFrame,
      alpha: { from: 0.25, to: 0.9 },
      duration: 620,
      yoyo: true,
      repeat: -1,
    });
  }

  private createAccessibilityControls(): void {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      color: colorHex(THEME.colors.white),
      backgroundColor: colorHex(THEME.colors.ink),
      fontFamily: THEME.fonts.mono,
      fontSize: "11px",
      padding: { x: 7, y: 5 },
    };
    this.soundToggle = this.add
      .text(1060, 18, "", style)
      .setDepth(950)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => {
        preferences.toggleMuted();
        audio.playClick();
        this.refreshAccessibilityLabels();
      });
    this.motionToggle = this.add
      .text(1163, 18, "", style)
      .setDepth(950)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => {
        preferences.toggleReducedMotion();
        audio.playClick();
        this.refreshAccessibilityLabels();
        this.refreshAlertFrame();
      });
    this.refreshAccessibilityLabels();
  }

  private refreshAccessibilityLabels(): void {
    const current = preferences.snapshot;
    this.soundToggle.setText(current.muted ? "SOUND OFF" : "SOUND ON");
    this.motionToggle.setText(
      current.reducedMotion ? "MOTION LOW" : "MOTION ON",
    );
  }

  private handleProgressionUpdated(): void {
    this.refreshAlertFrame();
    if (!progression.snapshot.floorResults[this.currentFloor]) return;
    const nextFloor = getNextFloor(this.currentFloor);
    this.setObjective(
      nextFloor
        ? `${nextFloor.module.title} unlocked — take the elevator`
        : "Incident resolved — elevator available",
    );
  }

  private removeListeners(): void {
    gameEvents.off("interaction:available", this.showInteraction, this);
    gameEvents.off("interaction:clear", this.hideInteraction, this);
    gameEvents.off("floor:changed", this.handleFloorChanged, this);
    gameEvents.off("dialogue:specialist", this.showSpecialistHint, this);
    gameEvents.off("dialogue:line", this.showDialogueLine, this);
    gameEvents.off("dialogue:choice", this.showDialogueChoice, this);
    gameEvents.off("ui:toast", this.showToast, this);
    gameEvents.off("ui:objective", this.setObjective, this);
    gameEvents.off("build:open", this.openBuildScene, this);
    gameEvents.off("build:closed", this.handleBuildClosed, this);
    gameEvents.off("progression:updated", this.handleProgressionUpdated, this);
  }
}
