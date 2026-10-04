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
  private soundToggle!: Phaser.GameObjects.Text;
  private currentFloor = 0;
  private glossaryById: Record<string, FloorGlossaryEntry> = {};
  private activeDialogue?: {
    lines: FloorDialogueLine[];
    index: number;
    onDismiss?: () => void;
  };
  private tutorialRecruitName?: string;

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
    this.createSoundControl();

    gameEvents.on("interaction:available", this.showInteraction, this);
    gameEvents.on("interaction:clear", this.hideInteraction, this);
    gameEvents.on("floor:changed", this.handleFloorChanged, this);
    gameEvents.on("dialogue:specialist", this.showSpecialistHint, this);
    gameEvents.on("dialogue:sequence", this.showDialogueSequence, this);
    gameEvents.on("dialogue:dismiss", this.dismissDialogue, this);
    gameEvents.on("dialogue:line", this.showDialogueLine, this);
    gameEvents.on("dialogue:choice", this.showDialogueChoice, this);
    gameEvents.on("ui:toast", this.showToast, this);
    gameEvents.on("ui:objective", this.setObjective, this);
    gameEvents.on("build:open", this.openBuildScene, this);
    gameEvents.on("build:closed", this.handleBuildClosed, this);
    gameEvents.on("progression:updated", this.handleProgressionUpdated, this);
    gameEvents.on("tutorial:completed", this.handleTutorialCompleted, this);
    this.input.keyboard?.on("keydown-ESC", this.dismissDialogue, this);

    this.time.delayedCall(4200, () => {
      if (
        this.scene.isActive() &&
        this.currentFloor === 0 &&
        !tutorial.tutorial.interact
      ) {
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
    this.dismissDialogue();
    this.currentFloor = floor;
    const module = getFloorByOrder(floor).module;
    const content = module.definition.content;
    this.dialogue.setSpecialistHints(content.specialistHints);
    if (floor === 0 && this.tutorialRecruitName) {
      const completion = content.completionDialogue;
      if (completion) {
        this.dialogue.setSpecialistHints([
          {
            ...completion,
            text: `Well done, ${this.tutorialRecruitName}! Head upstairs to continue with onboarding.`,
          },
        ]);
      }
    }
    this.glossaryById = Object.fromEntries(
      content.glossary.map((entry) => [entry.id, entry]),
    );
    this.setObjective(
      (floor === 0 ? content.tutorial.interact : content.tutorial.build) ??
        content.tutorial.elevator ??
        `${module.title} — incident queue empty`,
    );
    if (floor === 0 && content.managerAlert) {
      this.speech = new SpeechBubble(
        this,
        content.managerAlert,
        this.glossaryById,
        (entry) => this.showGlossary(entry),
      );
    }
  }

  private showSpecialistHint(): void {
    const line = this.dialogue.nextSpecialistHint();
    if (!line) return;
    this.showDialogueSequence([line]);
    if (this.currentFloor !== 0) return;
    const tutorial = getFloorByOrder(0).module.definition.content;
    this.setObjective(
      tutorial.tutorial.build ??
        tutorial.tutorial.elevator ??
        "Orientation complete",
    );
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
      { onDismiss },
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
    this.objective.setText(message).setVisible(message.length > 0);
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
    const shouldReloadFloor =
      this.currentFloor === 1
        ? progression.wasCanonicallyCompletedThisSession(1)
        : Boolean(progression.snapshot.floorResults[this.currentFloor]);
    if (!shouldReloadFloor) return;
    this.scene.stop("FloorScene");
    this.scene.launch("FloorScene", { floor: this.currentFloor });
    this.scene.bringToTop();
  }

  private createSoundControl(): void {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      color: colorHex(THEME.colors.white),
      backgroundColor: colorHex(THEME.colors.ink),
      fontFamily: THEME.fonts.mono,
      fontSize: "11px",
      padding: { x: 7, y: 5 },
    };
    this.soundToggle = this.add
      .text(GAME_WIDTH - 24, 18, "", style)
      .setOrigin(1, 0)
      .setDepth(950)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => {
        preferences.toggleMuted();
        audio.syncMusicMute();
        audio.playClick();
        this.refreshSoundLabel();
      });
    this.refreshSoundLabel();
  }

  private refreshSoundLabel(): void {
    this.soundToggle.setText(
      preferences.snapshot.muted ? "SOUND OFF" : "SOUND ON",
    );
  }

  private handleProgressionUpdated(): void {
    if (this.currentFloor === 0) {
      if (!progression.snapshot.floorResults[0]) return;
      const completion =
        getFloorByOrder(0).module.definition.content.completionDialogue;
      if (completion) {
        this.dialogue.setSpecialistHints([completion]);
      }
      this.setObjective(
        "Orientation complete — you are ready to tackle Problem 1",
      );
      this.notification?.dismiss();
      this.notification = new Notification(
        this,
        GAME_WIDTH - 620,
        82,
        "ORIENTATION COMPLETE",
        "You are ready to tackle Problem 1. Take the elevator when you are ready.",
        THEME.colors.success,
      );
      return;
    }

    if (this.currentFloor === 1) {
      return;
    }

    if (!progression.snapshot.floorResults[this.currentFloor]) return;
    const nextFloor = getNextFloor(this.currentFloor);
    this.setObjective(
      nextFloor
        ? `${nextFloor.module.title} unlocked — take the elevator`
        : "Incident resolved — elevator available",
    );
  }

  private handleTutorialCompleted(name: unknown): void {
    if (this.currentFloor !== 0 || typeof name !== "string") return;
    this.tutorialRecruitName = name;
    const line =
      getFloorByOrder(0).module.definition.content.completionDialogue;
    if (!line) return;
    this.dialogue.setSpecialistHints([
      {
        ...line,
        text: `Well done, ${name}! Head upstairs to continue with onboarding.`,
      },
    ]);
  }

  private removeListeners(): void {
    gameEvents.off("interaction:available", this.showInteraction, this);
    gameEvents.off("interaction:clear", this.hideInteraction, this);
    gameEvents.off("floor:changed", this.handleFloorChanged, this);
    gameEvents.off("dialogue:specialist", this.showSpecialistHint, this);
    gameEvents.off("dialogue:sequence", this.showDialogueSequence, this);
    gameEvents.off("dialogue:dismiss", this.dismissDialogue, this);
    gameEvents.off("dialogue:line", this.showDialogueLine, this);
    gameEvents.off("dialogue:choice", this.showDialogueChoice, this);
    gameEvents.off("ui:toast", this.showToast, this);
    gameEvents.off("ui:objective", this.setObjective, this);
    gameEvents.off("build:open", this.openBuildScene, this);
    gameEvents.off("build:closed", this.handleBuildClosed, this);
    gameEvents.off("progression:updated", this.handleProgressionUpdated, this);
    gameEvents.off("tutorial:completed", this.handleTutorialCompleted, this);
    this.input.keyboard?.off("keydown-ESC", this.dismissDialogue, this);
  }
}
