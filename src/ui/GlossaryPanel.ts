import Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../config/dimensions";
import { THEME, colorHex } from "../config/theme";
import { GLOSSARY_COPY } from "../data/glossary";
import type { LearnedTerm } from "../state/glossary";

const LEFT = 28;
const TOP = 150;
const WIDTH = 420;
const HEIGHT = 460;
const CONTENT_HEIGHT = HEIGHT - 114;

interface TermBlock {
  node: Phaser.GameObjects.Container;
  height: number;
}

/** A measured, paged list: wrapped definitions never spill into the controls. */
export class GlossaryPanel extends Phaser.GameObjects.Container {
  private readonly content: Phaser.GameObjects.Container;
  private readonly pageLabel: Phaser.GameObjects.Text;
  private readonly previousButton: Phaser.GameObjects.Text;
  private readonly nextButton: Phaser.GameObjects.Text;
  private pages: TermBlock[][] = [[]];
  private page = 0;

  constructor(scene: Phaser.Scene, onClose: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);
    const scrim = scene.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, THEME.colors.ink, 0.18)
      .setOrigin(0)
      .setInteractive()
      .on("pointerup", onClose);
    const frame = scene.add
      .rectangle(LEFT, TOP, WIDTH, HEIGHT, THEME.colors.panel)
      .setOrigin(0)
      .setStrokeStyle(4, THEME.colors.ink)
      .setInteractive();
    const heading = this.text(
      LEFT + 16,
      TOP + 14,
      GLOSSARY_COPY.title,
      18,
    ).setFontStyle("bold");
    const close = this.button(LEFT + WIDTH - 44, TOP + 4, "×", onClose, 24);
    this.content = scene.add.container(LEFT + 16, TOP + 60);
    this.pageLabel = this.text(
      LEFT + 16,
      TOP + HEIGHT - 34,
      "",
      13,
      THEME.colors.muted,
    );
    this.previousButton = this.button(
      LEFT + 204,
      TOP + HEIGHT - 40,
      GLOSSARY_COPY.previous,
      () => this.changePage(-1),
    );
    this.nextButton = this.button(
      LEFT + 318,
      TOP + HEIGHT - 40,
      GLOSSARY_COPY.next,
      () => this.changePage(1),
    );
    this.add([
      scrim,
      frame,
      heading,
      close,
      this.content,
      this.pageLabel,
      this.previousButton,
      this.nextButton,
    ]);
  }

  setEntries(entries: readonly LearnedTerm[]): void {
    this.content.removeAll(true);
    this.pages = [[]];
    let used = 0;
    for (const entry of entries) {
      const block = this.createBlock(entry);
      if (used > 0 && used + block.height > CONTENT_HEIGHT) {
        this.pages.push([]);
        used = 0;
      }
      this.pages[this.pages.length - 1].push(block);
      used += block.height;
    }
    if (entries.length === 0)
      this.content.add(this.text(0, 0, GLOSSARY_COPY.empty, 14));
    this.page = Math.min(this.page, this.pages.length - 1);
    this.renderPage();
  }

  private createBlock(entry: LearnedTerm): TermBlock {
    const node = this.scene.add.container(0, 0).setVisible(false);
    const floor = this.text(
      0,
      0,
      GLOSSARY_COPY.floor(entry.floorOrder),
      10,
      THEME.colors.muted,
    );
    const title = this.text(0, 16, entry.term, 16).setFontStyle("bold");
    const details = [
      entry.definition,
      entry.analogy,
      entry.realWorld ? `Real world: ${entry.realWorld}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");
    const body = this.text(0, title.y + title.height + 6, details, 13);
    // Current floor terms fit at 13px; keep unusually long future copy in bounds.
    const available = CONTENT_HEIGHT - body.y - 18;
    if (body.height > available) body.setScale(available / body.height);
    node.add([floor, title, body]);
    this.content.add(node);
    return { node, height: body.y + body.displayHeight + 18 };
  }

  private renderPage(): void {
    this.pages.flat().forEach(({ node }) => node.setVisible(false));
    let y = 0;
    this.pages[this.page].forEach(({ node, height }) => {
      node.setPosition(0, y).setVisible(true);
      y += height;
    });
    this.pageLabel.setText(`${this.page + 1} / ${this.pages.length}`);
    this.previousButton.setVisible(this.page > 0);
    this.nextButton.setVisible(this.page < this.pages.length - 1);
  }

  private changePage(direction: number): void {
    this.page = Phaser.Math.Clamp(
      this.page + direction,
      0,
      this.pages.length - 1,
    );
    this.renderPage();
  }

  private text(
    x: number,
    y: number,
    text: string,
    size: number,
    color: number = THEME.colors.ink,
  ): Phaser.GameObjects.Text {
    return this.scene.add.text(x, y, text, {
      color: colorHex(color),
      fontFamily: THEME.fonts.family,
      fontSize: `${size}px`,
      lineSpacing: 3,
      wordWrap: { width: WIDTH - 32 },
    });
  }

  private button(
    x: number,
    y: number,
    text: string,
    action: () => void,
    size = 13,
  ): Phaser.GameObjects.Text {
    return this.text(x, y, text, size)
      .setPadding(6)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", action);
  }
}
