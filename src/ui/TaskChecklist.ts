import Phaser from "phaser";

import { GAME_HEIGHT } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import { CHECKLIST_COPY } from "../data/taskChecklist";
import type { ChecklistEntry } from "../state/taskChecklist";

export class TaskChecklist extends Phaser.GameObjects.Container {
  private readonly banner: Phaser.GameObjects.Text;
  private panel?: Phaser.GameObjects.Container;
  private entries: ChecklistEntry[] = [];
  private objective = "";
  private page = 0;
  private rowsPerPage = 7;

  constructor(scene: Phaser.Scene, onOpen: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(980);
    this.banner = scene.add
      .text(24, 77, "", {
        color: colorHex(THEME.colors.ink),
        backgroundColor: colorHex(THEME.colors.panel),
        fontFamily: THEME.fonts.family,
        fontSize: "16px",
        fontStyle: "bold",
        padding: { x: 11, y: 7 },
        wordWrap: { width: 660 },
      })
      .setInteractive({ useHandCursor: true });
    this.banner.on("pointerup", () => {
      if (this.isOpen) this.close();
      else {
        onOpen();
        this.renderPanel();
        this.refreshBanner();
      }
    });
    this.add(this.banner);
    this.refreshBanner();
  }

  get isOpen(): boolean {
    return Boolean(this.panel);
  }

  setObjective(message: string): void {
    this.objective = message;
    this.refreshBanner();
    if (this.isOpen) this.renderPanel();
  }

  setEntries(entries: ChecklistEntry[]): void {
    const added = entries.length > this.entries.length;
    this.entries = entries;
    this.refreshBanner();
    if (added) this.page = Math.max(0, this.pageCount - 1);
    if (this.isOpen) this.renderPanel();
  }

  close(): void {
    this.panel?.destroy();
    this.panel = undefined;
    this.refreshBanner();
  }

  private get pageCount(): number {
    return Math.max(1, Math.ceil(this.entries.length / this.rowsPerPage));
  }

  private refreshBanner(): void {
    const done = this.entries.filter((entry) => entry.completed).length;
    this.banner.setText(
      [
        this.objective,
        `TASKS ${done}/${this.entries.length}  ${this.isOpen ? "▴ CLOSE" : "▾ OPEN"}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  private renderPanel(): void {
    this.panel?.destroy();
    const top = this.banner.y + this.banner.height + 10;
    const height = Math.min(490, GAME_HEIGHT - top - 35);
    this.rowsPerPage = Math.max(1, Math.floor((height - 120) / 52));
    this.page = Math.min(this.page, this.pageCount - 1);
    this.panel = this.scene.add.container(24, top);
    this.add(this.panel);
    this.panel.add(
      this.scene.add
        .rectangle(0, 0, 590, height, THEME.colors.panel)
        .setOrigin(0)
        .setStrokeStyle(4, THEME.colors.ink)
        .setInteractive(),
    );
    this.panel.add(
      this.text(18, 16, CHECKLIST_COPY.title, 21, THEME.colors.alert),
    );
    this.panel.add(
      this.text(18, 48, CHECKLIST_COPY.subtitle, 13, THEME.colors.muted),
    );
    this.button(548, 10, "×", () => this.close(), 27);
    const shown = this.entries.slice(
      this.page * this.rowsPerPage,
      (this.page + 1) * this.rowsPerPage,
    );
    if (shown.length === 0)
      this.panel.add(this.text(18, 90, CHECKLIST_COPY.empty, 16));
    shown.forEach((entry, index) => this.renderEntry(entry, 86 + index * 52));
    this.panel.add(
      this.text(
        18,
        height - 32,
        `${this.page + 1} / ${this.pageCount}`,
        14,
        THEME.colors.muted,
      ),
    );
    if (this.page > 0)
      this.button(360, height - 36, "← PREV", () => this.changePage(-1));
    if (this.page < this.pageCount - 1)
      this.button(470, height - 36, "NEXT →", () => this.changePage(1));
  }

  private renderEntry(entry: ChecklistEntry, y: number): void {
    const color = entry.completed ? THEME.colors.success : THEME.colors.ink;
    this.panel!.add(
      this.text(18, y + 8, entry.completed ? "☑" : "☐", 24, color),
    );
    this.panel!.add(
      this.text(
        56,
        y,
        CHECKLIST_COPY.floor(entry.floorOrder),
        10,
        THEME.colors.muted,
      ),
    );
    this.panel!.add(this.text(56, y + 14, entry.label, 16, color, 514));
  }

  private text(
    x: number,
    y: number,
    label: string,
    size: number,
    color: number = THEME.colors.ink,
    width = 550,
  ): Phaser.GameObjects.Text {
    return this.scene.add.text(x, y, label, {
      color: colorHex(color),
      fontFamily: THEME.fonts.family,
      fontSize: `${size}px`,
      wordWrap: { width },
    });
  }

  private button(
    x: number,
    y: number,
    label: string,
    action: () => void,
    size = 14,
  ): void {
    this.panel!.add(
      this.text(x, y, label, size)
        .setPadding(6)
        .setInteractive({ useHandCursor: true })
        .on("pointerup", action),
    );
  }

  private changePage(direction: number): void {
    this.page += direction;
    this.renderPanel();
  }
}
