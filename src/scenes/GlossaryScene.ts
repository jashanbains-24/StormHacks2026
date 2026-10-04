import Phaser from "phaser";

import { GAME_HEIGHT } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import { getFloors } from "../core/runtime/floorRegistry";
import { dismissTermCard } from "../core/ui-kit/terms";
import { GLOSSARY_COPY } from "../data/glossary";
import { glossaryStore } from "../state/glossary";
import { gameEvents } from "../systems/EventBus";
import { GlossaryPanel } from "../ui/GlossaryPanel";

/** Separate from the world HUD so build and puzzle modals retain the glossary. */
export class GlossaryScene extends Phaser.Scene {
  private button!: Phaser.GameObjects.Text;
  private panel?: GlossaryPanel;
  private pausedScenes: string[] = [];
  private unsubscribe?: () => void;

  constructor() {
    super("GlossaryScene");
  }

  create(): void {
    glossaryStore.register(
      getFloors().flatMap(({ order, module }) =>
        module.definition.content.glossary.map((entry) => ({
          ...entry,
          floorOrder: order,
        })),
      ),
    );
    this.button = this.add
      .text(28, GAME_HEIGHT - 78, GLOSSARY_COPY.title, {
        color: colorHex(THEME.colors.white),
        backgroundColor: colorHex(THEME.colors.ink),
        fontFamily: THEME.fonts.family,
        fontSize: "14px",
        fontStyle: "bold",
        padding: { x: 8, y: 5 },
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerup", this.openPanel, this);
    this.unsubscribe = glossaryStore.subscribe(() => this.refresh());
    this.refresh();
    this.input.keyboard?.on("keydown-ESC", this.closePanel, this);
    this.game.events.on("ui:modal-opened", this.raise, this);
    gameEvents.on("floor:changed", this.raise, this);
    this.raise();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private raise(): void {
    this.scene.bringToTop();
  }

  private refresh(): void {
    const entries = glossaryStore.snapshot;
    this.button.setText(
      entries.length
        ? `${GLOSSARY_COPY.title} ${entries.length}`
        : GLOSSARY_COPY.title,
    );
    this.panel?.setEntries(entries);
  }

  private openPanel(): void {
    if (this.panel) return;
    dismissTermCard();
    this.pausedScenes = this.scene.manager
      .getScenes(true)
      .filter((scene) => scene !== this)
      .map((scene) => scene.sys.settings.key);
    this.pausedScenes.forEach((key) => this.scene.pause(key));
    this.panel = new GlossaryPanel(this, () => this.closePanel());
    this.panel.setEntries(glossaryStore.snapshot);
  }

  private closePanel(): void {
    this.panel?.destroy();
    this.panel = undefined;
    this.pausedScenes.forEach((key) => {
      if (this.scene.isPaused(key)) this.scene.resume(key);
    });
    this.pausedScenes = [];
  }

  private cleanup(): void {
    this.closePanel();
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.input.keyboard?.off("keydown-ESC", this.closePanel, this);
    this.game.events.off("ui:modal-opened", this.raise, this);
    gameEvents.off("floor:changed", this.raise, this);
  }
}
