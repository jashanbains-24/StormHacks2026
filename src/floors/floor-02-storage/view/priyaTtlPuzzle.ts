import type { FloorContext } from "../../../core/contracts";
import {
  colorHex,
  dismissTermCard,
  type UiGameObject,
} from "../../../core/ui-kit";
import { mountPuzzleShell } from "./puzzleShell";

type TtlChoice = "second" | "minute" | "day";

const CHOICE_ID: Record<TtlChoice, string> = {
  second: "f02_priya_one_second",
  minute: "f02_priya_one_minute",
  day: "f02_priya_one_day",
};

const SNAPS: { id: TtlChoice; label: string; t: number }[] = [
  { id: "second", label: "1 sec", t: 0.12 },
  { id: "minute", label: "1 min", t: 0.5 },
  { id: "day", label: "1 day", t: 0.88 },
];

export interface PriyaPuzzleResult {
  solved: boolean;
  feedback: readonly string[];
}

export const openPriyaPuzzle = (
  ctx: FloorContext,
  handlers: {
    onAttempt: (choiceId: string) => PriyaPuzzleResult;
    onSolved: () => void;
    onClose: () => void;
  },
): void => {
  const moving = !ctx.preferences.reducedMotion;
  const shell = mountPuzzleShell(
    ctx,
    "Priya // Product Ops  —  How long should prices stay cached?",
    handlers.onClose,
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
    "Drag the [[f02.ttl]] handle, then run the sale. The price changed from $49 to $39 an hour ago.",
    panel.x + 24,
    panel.y + 60,
    panel.width - 48,
  );

  const trackX = panel.x + 80;
  const trackY = 250;
  const trackWidth = 760;
  const track = ctx.scene.add.graphics();
  root.add(track);
  track.lineStyle(8, ctx.theme.colors.panelDark, 1);
  track.lineBetween(trackX, trackY, trackX + trackWidth, trackY);
  root.add(
    ctx.scene.add.text(trackX, trackY - 36, "Time →", {
      color: colorHex(ctx.theme.colors.muted),
      fontFamily: ctx.theme.fonts.mono,
      fontSize: "13px",
      fontStyle: "bold",
    }),
  );

  const markerX = trackX + trackWidth * 0.42;
  root.add(
    ctx.scene.add
      .text(markerX, trackY - 18, "▲", {
        color: colorHex(ctx.theme.colors.alert),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "16px",
      })
      .setOrigin(0.5, 1),
  );
  root.add(
    ctx.scene.add
      .text(markerX, trackY - 58, "price changed  $49 → $39", {
        color: colorHex(ctx.theme.colors.alertDark),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "14px",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0),
  );

  SNAPS.forEach((snap) => {
    const x = trackX + trackWidth * snap.t;
    root.add(ctx.scene.add.rectangle(x, trackY, 4, 22, ctx.theme.colors.ink));
    root.add(
      ctx.scene.add
        .text(x, trackY + 18, snap.label, {
          color: colorHex(ctx.theme.colors.ink),
          fontFamily: ctx.theme.fonts.family,
          fontSize: "15px",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0),
    );
  });

  let selected: TtlChoice = "minute";
  const handle = ctx.scene.add.container(trackX + trackWidth * 0.5, trackY);
  handle.add(
    ctx.scene.add
      .circle(0, 0, 16, ctx.theme.colors.warning)
      .setStrokeStyle(3, ctx.theme.colors.ink),
  );
  handle.setSize(32, 32);
  handle.setInteractive(
    { radius: 16 },
    (area: { radius: number }, x: number, y: number) =>
      x * x + y * y <= area.radius * area.radius,
  );
  ctx.scene.input.setDraggable(handle);
  root.add(handle);

  const snapTo = (x: number): void => {
    const nearest = SNAPS.reduce(
      (best, snap) => {
        const snapX = trackX + trackWidth * snap.t;
        return Math.abs(snapX - x) < Math.abs(best.x - x)
          ? { id: snap.id, x: snapX }
          : best;
      },
      { id: SNAPS[0].id, x: trackX + trackWidth * SNAPS[0].t },
    );
    selected = nearest.id;
    handle.setPosition(nearest.x, trackY);
  };

  handle.on("dragstart", () => ctx.audio.playClick());
  handle.on("drag", (_pointer: unknown, dragX: number) => {
    const clamped = Math.min(trackX + trackWidth, Math.max(trackX, dragX));
    handle.setPosition(clamped, trackY);
  });
  handle.on("dragend", () => {
    ctx.audio.playClick();
    snapTo(handle.x);
  });

  const send = ctx.scene.add
    .text(panel.x + 24, 330, "▶  Run the sale", {
      color: colorHex(ctx.theme.colors.white),
      backgroundColor: colorHex(ctx.theme.colors.panelDark),
      fontFamily: ctx.theme.fonts.family,
      fontSize: "16px",
      fontStyle: "bold",
      padding: { x: 12, y: 8 },
    })
    .setInteractive({ useHandCursor: true });
  root.add(send);

  shell.richText("[[f02.db_load]]", panel.x + 40, 390, 280);
  shell.richText(
    "Customers seeing [[f02.stale_data]]",
    panel.x + 520,
    390,
    420,
  );

  const loadTrack = ctx.scene.add
    .rectangle(panel.x + 40, 450, 280, 18, 0xd5ddd8)
    .setOrigin(0, 0.5);
  const loadFill = ctx.scene.add
    .rectangle(panel.x + 40, 450, 240, 18, ctx.theme.colors.alert)
    .setOrigin(0, 0.5);
  const staleTrack = ctx.scene.add
    .rectangle(panel.x + 520, 450, 280, 18, 0xd5ddd8)
    .setOrigin(0, 0.5);
  const staleFill = ctx.scene.add
    .rectangle(panel.x + 520, 450, 8, 18, ctx.theme.colors.success)
    .setOrigin(0, 0.5);
  const loadVerdict = ctx.scene.add.text(panel.x + 40, 468, "", {
    color: colorHex(ctx.theme.colors.ink),
    fontFamily: ctx.theme.fonts.family,
    fontSize: "16px",
    fontStyle: "bold",
  });
  const staleVerdict = ctx.scene.add.text(panel.x + 520, 468, "", {
    color: colorHex(ctx.theme.colors.ink),
    fontFamily: ctx.theme.fonts.family,
    fontSize: "16px",
    fontStyle: "bold",
  });
  root.add([
    loadTrack,
    loadFill,
    staleTrack,
    staleFill,
    loadVerdict,
    staleVerdict,
  ]);

  let feedbackY = 510;
  const feedbackNodes: UiGameObject[] = [];
  let running = false;

  const clearFeedback = (): void => {
    dismissTermCard();
    feedbackNodes.forEach((node) => node.destroy());
    feedbackNodes.length = 0;
    feedbackY = 510;
  };

  send.on("pointerup", () => {
    if (running) return;
    running = true;
    ctx.audio.playClick();
    clearFeedback();
    const choice = selected;
    const result = handlers.onAttempt(CHOICE_ID[choice]);
    const loadTarget = choice === "second" ? 250 : 48;
    const staleTarget = choice === "day" ? 230 : choice === "minute" ? 18 : 8;
    const loadHealthy = choice !== "second";
    const staleHealthy = choice !== "day";
    const duration = moving ? 3000 : 0;
    const meter = { load: 240, stale: 8 };

    const finishMeters = (): void => {
      loadFill.setFillStyle(
        loadHealthy ? ctx.theme.colors.success : ctx.theme.colors.alert,
      );
      staleFill.setFillStyle(
        staleHealthy ? ctx.theme.colors.success : ctx.theme.colors.alert,
      );
      loadFill.setSize(loadTarget, 18);
      staleFill.setSize(staleTarget, 18);
      loadVerdict.setText(loadHealthy ? "✔ low" : "✖ stays high");
      loadVerdict.setColor(
        colorHex(
          loadHealthy ? ctx.theme.colors.success : ctx.theme.colors.alert,
        ),
      );
      staleVerdict.setText(
        staleHealthy ? (choice === "minute" ? "✔ 0–few" : "✔ 0") : "✖ climbing",
      );
      staleVerdict.setColor(
        colorHex(
          staleHealthy ? ctx.theme.colors.success : ctx.theme.colors.alert,
        ),
      );
      result.feedback.forEach((line) => {
        const drawn = shell.richText(line, panel.x + 40, feedbackY, 620);
        feedbackNodes.push(...drawn.objects);
        feedbackY += drawn.height + 6;
      });
      const next = ctx.scene.add
        .text(panel.x + 760, 560, result.solved ? "Continue" : "Try again", {
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
        .setInteractive({ useHandCursor: true });
      root.add(next);
      feedbackNodes.push(next);
      next.on("pointerup", () => {
        if (result.solved) {
          finish(handlers.onSolved);
          return;
        }
        clearFeedback();
        running = false;
        loadFill.setFillStyle(ctx.theme.colors.alert);
        loadFill.setSize(240, 18);
        staleFill.setSize(8, 18);
        staleFill.setFillStyle(ctx.theme.colors.success);
        loadVerdict.setText("");
        staleVerdict.setText("");
      });
    };

    if (!moving) {
      finishMeters();
      return;
    }

    ctx.scene.tweens.add({
      targets: meter,
      load: loadTarget,
      stale: staleTarget,
      duration,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        loadFill.setSize(meter.load, 18);
        staleFill.setSize(meter.stale, 18);
      },
      onComplete: finishMeters,
    });
  });
};
