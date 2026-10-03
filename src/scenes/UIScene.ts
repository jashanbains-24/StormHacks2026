import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig";
import { THEME, colorHex } from "../config/theme";
import { MANAGER_ALERT, TUTORIAL_COPY } from "../data/dialogue";
import type { GlossaryEntry } from "../data/glossary";
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

    gameEvents.on("interaction:available", this.showInteraction, this);
    gameEvents.on("interaction:clear", this.hideInteraction, this);
    gameEvents.on("floor:changed", this.handleFloorChanged, this);
    gameEvents.on("dialogue:specialist", this.showSpecialistHint, this);
    gameEvents.on("ui:toast", this.showToast, this);
    gameEvents.on("build:open", this.openBuildScene, this);
    gameEvents.on("build:closed", this.handleBuildClosed, this);

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
  }

  private removeListeners(): void {
    gameEvents.off("interaction:available", this.showInteraction, this);
    gameEvents.off("interaction:clear", this.hideInteraction, this);
    gameEvents.off("floor:changed", this.handleFloorChanged, this);
    gameEvents.off("dialogue:specialist", this.showSpecialistHint, this);
    gameEvents.off("ui:toast", this.showToast, this);
    gameEvents.off("build:open", this.openBuildScene, this);
    gameEvents.off("build:closed", this.handleBuildClosed, this);
  }
}
