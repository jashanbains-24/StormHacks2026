import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import type { FloorDialogueLine, FloorGlossaryEntry } from "../core/contracts";
import { getFloorById, getFloorByOrder } from "../core/runtime/floorRegistry";
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
  private currentFloor = 0;
  private glossaryById: Record<string, FloorGlossaryEntry> = {};
  private activeDialogue?: {
    lines: FloorDialogueLine[];
    index: number;
    onDismiss?: () => void;
  };

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
    if (progression.wasCanonicallyCompletedThisSession(1)) {
      this.handleProgressionUpdated();
    }

    gameEvents.on("interaction:available", this.showInteraction, this);
    gameEvents.on("interaction:clear", this.hideInteraction, this);
    gameEvents.on("floor:changed", this.handleFloorChanged, this);
    gameEvents.on("dialogue:specialist", this.showSpecialistHint, this);
    gameEvents.on("dialogue:sequence", this.showDialogueSequence, this);
    gameEvents.on("dialogue:dismiss", this.dismissDialogue, this);
    gameEvents.on("ui:toast", this.showToast, this);
    gameEvents.on("ui:objective", this.setObjective, this);
    gameEvents.on("build:open", this.openBuildScene, this);
    gameEvents.on("build:closed", this.handleBuildClosed, this);
    gameEvents.on("progression:updated", this.handleProgressionUpdated, this);
    this.input.keyboard?.on("keydown-ESC", this.dismissDialogue, this);

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
      if (this.scene.isActive()) {
        this.objective.setText(tutorial.tutorial.elevator ?? "");
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
    this.dismissDialogue();
    this.currentFloor = floor;
    const module = getFloorByOrder(floor).module;
    const content = module.definition.content;
    this.dialogue.setSpecialistHints(content.specialistHints);
    this.glossaryById = Object.fromEntries(
      content.glossary.map((entry) => [entry.id, entry]),
    );
    this.objective.setText(
      content.tutorial.build ??
        content.tutorial.elevator ??
        `${module.title} — incident queue empty`,
    );
  }

  private showSpecialistHint(): void {
    const line = this.dialogue.nextSpecialistHint();
    if (!line) return;
    this.showDialogueSequence([line]);
  }

  private showDialogueSequence(
    lines: FloorDialogueLine[],
    onDismiss?: () => void,
  ): void {
    if (lines.length === 0) return;
    audio.playClick();
    this.dismissDialogue();
    this.activeDialogue = { lines, index: 0, onDismiss };
    this.renderDialogueLine();
  }

  private renderDialogueLine(): void {
    const active = this.activeDialogue;
    if (!active) return;
    this.speech?.destroy();
    const line = active.lines[active.index];
    if (!line) {
      this.dismissDialogue();
      return;
    }
    const finalLine = active.index === active.lines.length - 1;
    this.speech = new SpeechBubble(
      this,
      line,
      this.glossaryById,
      (entry) => this.showGlossary(entry),
      {
        onClose: () => this.dismissDialogue(),
        actionLabel: finalLine ? "DONE" : "NEXT →",
        onAction: () => this.advanceDialogue(),
      },
    );
  }

  private advanceDialogue(): void {
    const active = this.activeDialogue;
    if (!active) return;
    if (active.index >= active.lines.length - 1) {
      this.dismissDialogue();
      return;
    }
    active.index += 1;
    this.renderDialogueLine();
  }

  private dismissDialogue(): void {
    this.speech?.destroy();
    this.speech = undefined;
    const onDismiss = this.activeDialogue?.onDismiss;
    this.activeDialogue = undefined;
    onDismiss?.();
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
    this.objective.setText(message);
  }

  private openBuildScene(floorId: string): void {
    if (this.scene.isActive("BuildScene")) return;
    this.dismissDialogue();
    this.objective.setVisible(false);
    this.interactionPrompt.setVisible(false);
    this.scene.pause("FloorScene");
    this.scene.launch("BuildScene", {
      floorOrder: getFloorById(floorId).order,
    });
  }

  private handleBuildClosed(): void {
    this.objective.setVisible(true);
    if (progression.wasCanonicallyCompletedThisSession(this.currentFloor)) {
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
    if (!progression.wasCanonicallyCompletedThisSession(this.currentFloor)) {
      return;
    }
    this.alertTween?.stop();
    this.alertFrame.setAlpha(1).setStrokeStyle(3, THEME.colors.success, 0.8);
    this.objective.setText("Floor 2 unlocked — take the elevator");
  }

  private removeListeners(): void {
    gameEvents.off("interaction:available", this.showInteraction, this);
    gameEvents.off("interaction:clear", this.hideInteraction, this);
    gameEvents.off("floor:changed", this.handleFloorChanged, this);
    gameEvents.off("dialogue:specialist", this.showSpecialistHint, this);
    gameEvents.off("dialogue:sequence", this.showDialogueSequence, this);
    gameEvents.off("dialogue:dismiss", this.dismissDialogue, this);
    gameEvents.off("ui:toast", this.showToast, this);
    gameEvents.off("ui:objective", this.setObjective, this);
    gameEvents.off("build:open", this.openBuildScene, this);
    gameEvents.off("build:closed", this.handleBuildClosed, this);
    gameEvents.off("progression:updated", this.handleProgressionUpdated, this);
    this.input.keyboard?.off("keydown-ESC", this.dismissDialogue, this);
  }
}
