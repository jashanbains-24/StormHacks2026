import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import { MANAGER_ALERT, TUTORIAL_COPY } from "../data/dialogue";
import type { GlossaryEntry } from "../data/glossary";
import { preferences } from "../state/preferences";
import { progression } from "../state/progression";
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

  constructor() {
    super("UIScene");
  }

  create(): void {
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
      .text(24, 77, TUTORIAL_COPY.move, {
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
    if (progression.snapshot.floorResults[1]) {
      this.handleProgressionUpdated();
    }

    gameEvents.on("interaction:available", this.showInteraction, this);
    gameEvents.on("interaction:clear", this.hideInteraction, this);
    gameEvents.on("floor:changed", this.handleFloorChanged, this);
    gameEvents.on("dialogue:specialist", this.showSpecialistHint, this);
    gameEvents.on("ui:toast", this.showToast, this);
    gameEvents.on("build:open", this.openBuildScene, this);
    gameEvents.on("build:closed", this.handleBuildClosed, this);
    gameEvents.on("progression:updated", this.handleProgressionUpdated, this);

    this.notification = new Notification(
      this,
      GAME_WIDTH - 620,
      82,
      MANAGER_ALERT.speakerName,
      MANAGER_ALERT.text,
    );
    this.time.delayedCall(4200, () => {
      if (this.scene.isActive()) this.objective.setText(TUTORIAL_COPY.elevator);
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
    if (floor === 0) this.objective.setText(TUTORIAL_COPY.elevator);
    if (floor === 1) this.objective.setText(TUTORIAL_COPY.build);
    if (floor === 2) {
      this.objective.setText("Floor 2 unlocked — incident queue empty");
    }
  }

  private showSpecialistHint(): void {
    audio.playClick();
    this.speech?.destroy();
    this.speech = new SpeechBubble(
      this,
      this.dialogue.nextSpecialistHint(),
      (entry) => this.showGlossary(entry),
    );
  }

  private showGlossary(entry: GlossaryEntry): void {
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

  private openBuildScene(): void {
    if (this.scene.isActive("BuildScene")) return;
    this.speech?.destroy();
    this.objective.setVisible(false);
    this.interactionPrompt.setVisible(false);
    this.scene.pause("FloorScene");
    this.scene.launch("BuildScene");
  }

  private handleBuildClosed(): void {
    this.objective.setVisible(true);
    if (progression.snapshot.floorResults[1]) {
      this.scene.stop("FloorScene");
      this.scene.launch("FloorScene", { floor: 1 });
      this.scene.bringToTop();
    }
  }

  private createEmergencyFrame(): void {
    this.alertFrame = this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH - 12,
        GAME_HEIGHT - 12,
      )
      .setStrokeStyle(9, THEME.colors.alert, 0.58)
      .setDepth(850);
    this.updateEmergencyMotion();
  }

  private updateEmergencyMotion(): void {
    this.alertTween?.stop();
    this.alertFrame.setAlpha(0.7);
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
        this.updateEmergencyMotion();
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
    this.alertTween?.stop();
    this.alertFrame.setAlpha(1).setStrokeStyle(9, THEME.colors.success, 0.9);
    this.objective.setText("Floor 2 unlocked — take the elevator");
  }

  private removeListeners(): void {
    gameEvents.off("interaction:available", this.showInteraction, this);
    gameEvents.off("interaction:clear", this.hideInteraction, this);
    gameEvents.off("floor:changed", this.handleFloorChanged, this);
    gameEvents.off("dialogue:specialist", this.showSpecialistHint, this);
    gameEvents.off("ui:toast", this.showToast, this);
    gameEvents.off("build:open", this.openBuildScene, this);
    gameEvents.off("build:closed", this.handleBuildClosed, this);
    gameEvents.off("progression:updated", this.handleProgressionUpdated, this);
  }
}
