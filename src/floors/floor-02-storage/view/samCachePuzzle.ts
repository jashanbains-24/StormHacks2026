import type Phaser from "phaser";

import type { FloorContext } from "../../../core/contracts";
import { colorHex } from "../../../core/ui-kit";
import { audio } from "../../../systems/AudioSystem";
import { dismissTermCard } from "../../../ui/TermCard";
import { mountPuzzleShell } from "./puzzleShell";

export type CachePlacement = "local" | "shared" | "browser";

const CHOICE_ID: Record<CachePlacement, string> = {
  local: "f02_sam_local_cache",
  shared: "f02_sam_shared_cache",
  browser: "f02_sam_browser_cache",
};

export interface SamPuzzleResult {
  solved: boolean;
  feedback: readonly string[];
}

export const openSamPuzzle = (
  ctx: FloorContext,
  handlers: {
    onAttempt: (choiceId: string) => SamPuzzleResult;
    onRetry: () => void;
    onSolved: () => void;
    onClose: () => void;
  },
): void => {
  const moving = !ctx.preferences.reducedMotion;
  const shell = mountPuzzleShell(
    ctx,
    "Sam // Backend  —  Where does the cache go?",
    () => handlers.onClose(),
  );
  const { root, panel } = shell;
  let closed = false;
  const finish = (notify: () => void): void => {
    if (closed) return;
    closed = true;
    shell.destroy();
    notify();
  };

  shell.richText(
    "Drop a [[f02.cache]] into the slot, then send two refreshes.",
    panel.x + 24,
    panel.y + 62,
    panel.width - 48,
  );

  const box = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill: number,
  ): Phaser.GameObjects.Rectangle => {
    const rect = ctx.scene.add
      .rectangle(x, y, width, height, fill)
      .setStrokeStyle(3, ctx.theme.colors.ink);
    root.add(rect);
    return rect;
  };

  const label = (x: number, y: number, text: string): void => {
    root.add(
      ctx.scene.add
        .text(x, y, text, {
          color: colorHex(ctx.theme.colors.ink),
          fontFamily: ctx.theme.fonts.family,
          fontSize: "14px",
          fontStyle: "bold",
        })
        .setOrigin(0.5),
    );
  };

  box(230, 210, 90, 48, ctx.theme.colors.paper);
  label(230, 210, "Users");
  const balancer = box(390, 210, 130, 52, ctx.theme.colors.paper);
  shell.richText("[[f02.load_balancer]]", 338, 198, 120);
  box(560, 176, 110, 40, ctx.theme.colors.paper);
  shell.richText("[[f02.app_server]] A", 512, 164, 110);
  box(560, 246, 110, 40, ctx.theme.colors.paper);
  shell.richText("[[f02.app_server]] B", 512, 234, 110);
  const slot = box(760, 210, 150, 56, 0xe7eef2);
  label(760, 210, "?  CACHE");
  box(940, 210, 120, 52, ctx.theme.colors.paper);
  shell.richText("[[f02.database]]", 892, 198, 110);

  const arrows = ctx.scene.add.graphics();
  root.add(arrows);
  arrows.lineStyle(3, ctx.theme.colors.ink, 0.8);
  arrows.lineBetween(275, 210, 325, 210);
  arrows.lineBetween(455, 210, 505, 196);
  arrows.lineBetween(455, 210, 505, 246);
  arrows.lineBetween(615, 196, 685, 210);
  arrows.lineBetween(615, 246, 685, 210);
  arrows.lineBetween(835, 210, 880, 210);

  let placed: CachePlacement | undefined;
  const homes: Record<CachePlacement, { x: number; y: number }> = {
    local: { x: 280, y: 360 },
    shared: { x: 530, y: 360 },
    browser: { x: 800, y: 360 },
  };
  const chips: Record<CachePlacement, Phaser.GameObjects.Container> = {
    local: ctx.scene.add.container(homes.local.x, homes.local.y),
    shared: ctx.scene.add.container(homes.shared.x, homes.shared.y),
    browser: ctx.scene.add.container(homes.browser.x, homes.browser.y),
  };

  const chipNames: Record<CachePlacement, string> = {
    local: "Local",
    shared: "Shared",
    browser: "Browser",
  };

  const makeChip = (kind: CachePlacement, fill: number, term: string): void => {
    const chip = chips[kind];
    const body = ctx.scene.add
      .rectangle(0, 0, 132, 40, fill)
      .setStrokeStyle(3, ctx.theme.colors.ink);
    const caption = ctx.scene.add
      .text(0, 0, chipNames[kind], {
        color: colorHex(ctx.theme.colors.white),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "15px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    chip.add([body, caption]);
    chip.setSize(132, 40);
    chip.setInteractive(
      { x: -66, y: -20, width: 132, height: 40 },
      (
        area: { x: number; y: number; width: number; height: number },
        x: number,
        y: number,
      ) =>
        x >= area.x &&
        y >= area.y &&
        x <= area.x + area.width &&
        y <= area.y + area.height,
    );
    ctx.scene.input.setDraggable(chip);
    root.add(chip);
    shell.richText(term, homes[kind].x - 74, homes[kind].y + 28, 180);

    chip.on("dragstart", () => audio.playClick());
    chip.on("drag", (_pointer: unknown, dragX: number, dragY: number) => {
      chip.setPosition(dragX, dragY);
    });
    chip.on("dragend", () => {
      audio.playClick();
      const nearSlot =
        Math.abs(chip.x - slot.x) < 90 && Math.abs(chip.y - slot.y) < 48;
      if (!nearSlot) {
        if (placed === kind) placed = undefined;
        chip.setPosition(homes[kind].x, homes[kind].y);
        return;
      }
      (Object.keys(chips) as CachePlacement[]).forEach((other) => {
        if (other === kind) return;
        chips[other].setPosition(homes[other].x, homes[other].y);
      });
      placed = kind;
      chip.setPosition(slot.x, slot.y);
    });
  };

  makeChip("local", 0xd58a55, "[[f02.local_cache]]");
  makeChip("shared", 0x6fa878, "[[f02.shared_cache]]");
  makeChip("browser", 0x5f9fba, "[[f02.browser_cache]]");

  const send = ctx.scene.add
    .text(panel.x + 24, 418, "▶  Send 2 refreshes", {
      color: colorHex(ctx.theme.colors.white),
      backgroundColor: colorHex(ctx.theme.colors.panelDark),
      fontFamily: ctx.theme.fonts.family,
      fontSize: "16px",
      fontStyle: "bold",
      padding: { x: 12, y: 8 },
    })
    .setInteractive({ useHandCursor: true });
  root.add(send);

  const resultNodes: Phaser.GameObjects.GameObject[] = [];
  const clearResult = (): void => {
    dismissTermCard();
    resultNodes.forEach((node) => node.destroy());
    resultNodes.length = 0;
  };

  const addResult = <T extends Phaser.GameObjects.GameObject>(node: T): T => {
    resultNodes.push(node);
    root.add(node);
    return node;
  };

  const showBrowsers = (
    left: string,
    right: string,
    mismatch: boolean,
  ): void => {
    const drawBrowser = (x: number, price: string, name: string): void => {
      addResult(
        ctx.scene.add
          .rectangle(x, 520, 180, 86, ctx.theme.colors.paper)
          .setStrokeStyle(3, ctx.theme.colors.ink),
      );
      addResult(
        ctx.scene.add
          .text(x, 498, name, {
            color: colorHex(ctx.theme.colors.muted),
            fontFamily: ctx.theme.fonts.mono,
            fontSize: "12px",
          })
          .setOrigin(0.5),
      );
      addResult(
        ctx.scene.add
          .text(x, 528, price, {
            color: colorHex(ctx.theme.colors.ink),
            fontFamily: ctx.theme.fonts.family,
            fontSize: "28px",
            fontStyle: "bold",
          })
          .setOrigin(0.5),
      );
    };
    drawBrowser(360, left, "Browser 1");
    drawBrowser(580, right, "Browser 2");
    if (mismatch) {
      const badge = addResult(
        ctx.scene.add
          .text(760, 500, "✖  MISMATCH", {
            color: colorHex(ctx.theme.colors.white),
            backgroundColor: colorHex(ctx.theme.colors.alert),
            fontFamily: ctx.theme.fonts.mono,
            fontSize: "16px",
            fontStyle: "bold",
            padding: { x: 8, y: 6 },
          })
          .setOrigin(0.5),
      );
      if (moving) {
        ctx.scene.tweens.add({
          targets: badge,
          alpha: { from: 1, to: 0.35 },
          duration: 180,
          yoyo: true,
          repeat: 3,
        });
      }
      balancer.setStrokeStyle(4, ctx.theme.colors.alert);
      addResult(
        ctx.scene.add
          .text(390, 250, "see Floor 1", {
            color: colorHex(ctx.theme.colors.white),
            backgroundColor: colorHex(ctx.theme.colors.alert),
            fontFamily: ctx.theme.fonts.mono,
            fontSize: "12px",
            fontStyle: "bold",
            padding: { x: 6, y: 3 },
          })
          .setOrigin(0.5),
      );
    }
  };

  const showMeter = (healthy: boolean): void => {
    addResult(
      ctx.scene.add.text(860, 470, "DB load", {
        color: colorHex(ctx.theme.colors.ink),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "13px",
        fontStyle: "bold",
      }),
    );
    addResult(
      ctx.scene.add.rectangle(940, 510, 150, 16, 0xd5ddd8).setOrigin(0, 0.5),
    );
    const fill = addResult(
      ctx.scene.add
        .rectangle(
          940,
          510,
          healthy ? 36 : 140,
          16,
          healthy ? 0x2f855a : 0xc73e3a,
        )
        .setOrigin(0, 0.5),
    );
    addResult(
      ctx.scene.add.text(860, 526, healthy ? "✔ low" : "✖ still high", {
        color: colorHex(
          healthy ? ctx.theme.colors.success : ctx.theme.colors.alert,
        ),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "14px",
        fontStyle: "bold",
      }),
    );
    if (!moving) fill.setDisplaySize(healthy ? 36 : 140, 16);
  };

  send.on("pointerup", () => {
    if (!placed || resultNodes.length > 0) return;
    audio.playClick();
    const kind = placed;
    const result = handlers.onAttempt(CHOICE_ID[kind]);
    const reveal = (): void => {
      if (kind === "local") showBrowsers("$39", "$49", true);
      else showBrowsers("$39", "$39", false);
      showMeter(kind === "shared");
      let textY = 575;
      result.feedback.forEach((line) => {
        const drawn = shell.richText(line, panel.x + 24, textY, 640);
        resultNodes.push(...drawn.objects);
        textY += drawn.height + 4;
      });
      const next = addResult(
        ctx.scene.add
          .text(panel.x + 700, 600, result.solved ? "Continue" : "Try again", {
            color: colorHex(ctx.theme.colors.white),
            backgroundColor: colorHex(
              result.solved
                ? ctx.theme.colors.success
                : ctx.theme.colors.panelDark,
            ),
            fontFamily: ctx.theme.fonts.family,
            fontSize: "16px",
            fontStyle: "bold",
            padding: { x: 12, y: 8 },
          })
          .setInteractive({ useHandCursor: true }),
      );
      next.on("pointerup", () => {
        if (result.solved) {
          finish(handlers.onSolved);
          return;
        }
        clearResult();
        balancer.setStrokeStyle(3, ctx.theme.colors.ink);
        handlers.onRetry();
      });
    };
    if (!moving) {
      reveal();
      return;
    }
    ctx.scene.time.delayedCall(700, reveal);
  });
};
