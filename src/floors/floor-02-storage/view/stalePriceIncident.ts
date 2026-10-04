import type Phaser from "phaser";

import { GAME_HEIGHT, GAME_WIDTH } from "../../../config/dimensions";
import type { FloorContext } from "../../../core/contracts";
import { colorHex } from "../../../core/ui-kit";
import { openedTermIds, onTermsChanged } from "../../../ui/termMemory";
import {
  applyIncidentChoice,
  beaconFor,
  captionForState,
  clearedSpeakers,
  startingState,
  type DialogueKey,
  type IncidentSpeaker,
  type StalePriceState,
} from "../definition/incidentFlow";
import {
  stalePriceDialogue,
  stalePriceStatus,
} from "../definition/stalePriceDialogue";
import { teachingTermById } from "../definition/terms";
import {
  celebrateMonitors,
  flashDatabase,
  setCacheMarkers,
  setIncidentVisualState,
  type IncidentVisualState,
} from "./incidentVisualState";
import { openPriyaPuzzle } from "./priyaTtlPuzzle";
import { openSamPuzzle } from "./samCachePuzzle";

const CACHE_CHOICE_FLAG = "floor2.cacheChoice";

let session: StalePriceState | undefined;

const floor1Solved = (ctx: FloorContext): boolean =>
  ctx.progression.resultFor(1) !== undefined;

const initialState = (ctx: FloorContext): StalePriceState => {
  if (!session) {
    session = startingState(floor1Solved(ctx));
    return { ...session };
  }

  if (!floor1Solved(ctx)) session = { step: "standby" };
  else if (session.step === "standby") session = { step: "dana" };
  return { ...session };
};

const visualFor = (state: StalePriceState): IncidentVisualState => {
  if (
    state.step === "standby" ||
    state.step === "resolved" ||
    state.step === "danaWrap"
  ) {
    return "resolved";
  }
  if (state.step === "priya") return "warming";
  return "critical";
};

export const createStalePriceIncident = (ctx: FloorContext): void => {
  let state = initialState(ctx);
  let puzzleOpen = false;
  let frozen = false;
  const frozenAt = { x: ctx.player.x, y: ctx.player.y };
  const moving = !ctx.preferences.reducedMotion;

  const persistState = (): void => {
    session = { ...state };
    if (state.cacheChoice) {
      ctx.progression.setFlag(CACHE_CHOICE_FLAG, state.cacheChoice);
    }
  };

  const updateObjective = (): void => {
    ctx.hud.setObjective(captionForState(state));
  };

  const team = [
    {
      id: "dana" as const,
      name: "Dana",
      x: 210,
      y: 332,
      texture: "specialist",
    },
    {
      id: "sam" as const,
      name: "Sam",
      x: 824,
      y: 368,
      texture: "ambient-4",
    },
    {
      id: "priya" as const,
      name: "Priya",
      x: 548,
      y: 628,
      texture: "ambient-5",
    },
  ];

  const markers = team.map((member) => {
    const beacon = ctx.scene.add
      .text(member.x, member.y - 72, "!", {
        color: colorHex(ctx.theme.colors.ink),
        backgroundColor: colorHex(ctx.theme.colors.warning),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "16px",
        fontStyle: "bold",
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(member.y + 80)
      .setVisible(false);
    const tag = ctx.scene.add
      .text(member.x, member.y + 46, member.name, {
        color: colorHex(ctx.theme.colors.ink),
        backgroundColor: colorHex(ctx.theme.colors.panel),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "11px",
        fontStyle: "bold",
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5, 0)
      .setDepth(member.y + 35)
      .setVisible(false);
    return { ...member, beacon, tag };
  });

  const refreshGuide = (): void => {
    const active = beaconFor(state.step);
    const done = clearedSpeakers(state.step);
    markers.forEach((member) => {
      ctx.scene.tweens.killTweensOf(member.beacon);
      const isActive = member.id === active;
      const isDone = done.includes(member.id);
      member.beacon.setVisible(isActive || isDone).setY(member.y - 72);
      member.beacon.setText(isActive ? "!" : "✔");
      member.beacon.setBackgroundColor(
        colorHex(
          isActive ? ctx.theme.colors.warning : ctx.theme.colors.success,
        ),
      );
      if (isActive && moving) {
        ctx.scene.tweens.add({
          targets: member.beacon,
          y: member.y - 86,
          duration: 480,
          yoyo: true,
          repeat: -1,
        });
      }
    });
  };

  const door = ctx.scene.add
    .text(GAME_WIDTH - 102, GAME_HEIGHT / 2 + 78, "DOOR OPEN", {
      color: colorHex(ctx.theme.colors.ink),
      backgroundColor: colorHex(ctx.theme.colors.successLight),
      fontFamily: ctx.theme.fonts.mono,
      fontSize: "12px",
      fontStyle: "bold",
      padding: { x: 6, y: 4 },
    })
    .setOrigin(0.5)
    .setDepth(900)
    .setVisible(false);
  const doorGlow = ctx.scene.add
    .circle(
      GAME_WIDTH - 102,
      GAME_HEIGHT / 2,
      18,
      ctx.theme.colors.success,
      0.35,
    )
    .setDepth(240)
    .setVisible(false);

  const applyState = (visual = visualFor(state)): void => {
    persistState();
    setIncidentVisualState(ctx, visual);
    setCacheMarkers(ctx, state.step === "sam");
    updateObjective();
    refreshGuide();
    const open = state.step === "resolved";
    door.setVisible(open);
    doorGlow.setVisible(open);
  };

  const showSequence = (
    keys: readonly DialogueKey[],
    onComplete?: () => void,
  ): void => {
    const [key, ...remaining] = keys;
    if (!key) {
      onComplete?.();
      return;
    }
    ctx.dialogue.showLine(stalePriceDialogue[key], () =>
      showSequence(remaining, onComplete),
    );
  };

  const releasePlayer = (): void => {
    puzzleOpen = false;
    frozen = false;
  };

  const holdPlayer = (): void => {
    puzzleOpen = true;
    frozen = true;
    frozenAt.x = ctx.player.x;
    frozenAt.y = ctx.player.y;
  };

  const talkQuiet = (speakerName: string): void => {
    ctx.dialogue.showLine({
      ...stalePriceDialogue.storageQuiet,
      speakerName,
    });
  };

  const talkToDana = (): void => {
    if (puzzleOpen) return;
    if (state.step === "standby") {
      talkQuiet("Dana // DBA");
      return;
    }
    if (state.step === "dana") {
      flashDatabase(ctx);
      ctx.dialogue.showChoice(stalePriceDialogue.danaPrompt, (choiceId) => {
        const decision = applyIncidentChoice(state, "dana", choiceId);
        state = decision.state;
        applyState(decision.visual);
        showSequence(decision.dialogue);
      });
      return;
    }
    if (state.step === "danaWrap") {
      ctx.dialogue.showLine(stalePriceDialogue.danaWrapUp, () => {
        state = {
          step: "resolved",
          cacheChoice: state.cacheChoice ?? "shared",
        };
        applyState("resolved");
        celebrateMonitors(ctx);
        ctx.audio.playSuccess();
        ctx.progression.report(ctx.floorOrder, "canonical", []);
        ctx.hud.setObjective(stalePriceStatus.resolved);
      });
      return;
    }
    if (state.step === "resolved") {
      ctx.dialogue.showLine(stalePriceDialogue.danaResolved);
      return;
    }
    ctx.dialogue.showLine(
      state.step === "sam"
        ? stalePriceDialogue.danaWaitingForSam
        : stalePriceDialogue.danaWaitingForPriya,
    );
  };

  const talkToSam = (): void => {
    if (puzzleOpen) return;
    if (state.step === "standby") {
      talkQuiet("Sam // Backend");
      return;
    }
    if (state.step === "sam") {
      holdPlayer();
      openSamPuzzle(ctx, {
        onAttempt: (choiceId) => {
          const decision = applyIncidentChoice(state, "sam", choiceId);
          state = decision.state;
          applyState(decision.visual);
          if (decision.visual === "localMismatch") {
            ctx.hud.showToast(stalePriceStatus.loadBalancerWarning);
          }
          return {
            solved: state.step === "priya",
            feedback: decision.dialogue.map(
              (key) => stalePriceDialogue[key].text,
            ),
          };
        },
        onRetry: () => applyState("critical"),
        onSolved: () => {
          releasePlayer();
          ctx.audio.playSuccess();
        },
        onClose: releasePlayer,
      });
      return;
    }
    if (state.step === "dana") {
      ctx.dialogue.showLine(stalePriceDialogue.samBusy);
      return;
    }
    ctx.dialogue.showLine(
      state.step === "resolved"
        ? stalePriceDialogue.samResolved
        : stalePriceDialogue.samSharedCorrect,
    );
  };

  const talkToPriya = (): void => {
    if (puzzleOpen) return;
    if (state.step === "standby") {
      talkQuiet("Priya // Product Ops");
      return;
    }
    if (state.step === "priya") {
      holdPlayer();
      openPriyaPuzzle(ctx, {
        onAttempt: (choiceId) => {
          const decision = applyIncidentChoice(state, "priya", choiceId);
          state = decision.state;
          applyState(decision.visual);
          return {
            solved: state.step === "danaWrap",
            feedback: decision.dialogue.map(
              (key) => stalePriceDialogue[key].text,
            ),
          };
        },
        onSolved: () => {
          releasePlayer();
          ctx.audio.playSuccess();
        },
        onClose: releasePlayer,
      });
      return;
    }
    if (state.step === "resolved" || state.step === "danaWrap") {
      ctx.dialogue.showLine(stalePriceDialogue.priyaResolved);
      return;
    }
    ctx.dialogue.showLine(stalePriceDialogue.priyaBusy);
  };

  const handlers: Record<IncidentSpeaker, () => void> = {
    dana: talkToDana,
    sam: talkToSam,
    priya: talkToPriya,
  };

  markers.forEach((member) => {
    const npc = ctx.addNpc(member.x, member.y, `f02-${member.id}`, {
      texture: member.texture,
      animationKey: null,
    });
    ctx.scene.physics.add.collider(ctx.player, npc);
    ctx.addInteractable({
      id: `f02-${member.id}:talk`,
      label: `Talk to ${member.name}`,
      x: member.x,
      y: member.y,
      range: 120,
      onInteract: handlers[member.id],
    });
  });

  const glossaryButton = ctx.scene.add
    .text(28, GAME_HEIGHT - 78, "Glossary", {
      color: colorHex(ctx.theme.colors.white),
      backgroundColor: colorHex(ctx.theme.colors.ink),
      fontFamily: ctx.theme.fonts.family,
      fontSize: "14px",
      fontStyle: "bold",
      padding: { x: 8, y: 5 },
    })
    .setDepth(880)
    .setInteractive({ useHandCursor: true });

  let glossaryPanel: Phaser.GameObjects.Container | undefined;
  const closeGlossary = (): void => {
    glossaryPanel?.destroy();
    glossaryPanel = undefined;
  };
  const openGlossary = (): void => {
    if (glossaryPanel) {
      closeGlossary();
      return;
    }
    const ids = openedTermIds();
    const blocks =
      ids.length === 0
        ? ["Open an ⓘ while you talk or solve a puzzle."]
        : ids.flatMap((id) => {
            const term = teachingTermById[id];
            if (!term) return [];
            const details = [term.definition, term.analogy];
            if (term.realWorld) details.push(`Real world: ${term.realWorld}`);
            return [`${term.title}\n${details.join("\n")}`];
          });
    const glossaryText = blocks.join("\n\n");
    const height = Math.min(460, 88 + glossaryText.split("\n").length * 18);
    const panel = ctx.scene.add.container(0, 0).setDepth(1750);
    panel.add(
      ctx.scene.add
        .rectangle(28, 150, 420, height, ctx.theme.colors.panel)
        .setOrigin(0)
        .setStrokeStyle(4, ctx.theme.colors.ink),
    );
    panel.add(
      ctx.scene.add.text(44, 164, "Glossary", {
        color: colorHex(ctx.theme.colors.ink),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "18px",
        fontStyle: "bold",
      }),
    );
    panel.add(
      ctx.scene.add.text(44, 196, glossaryText, {
        color: colorHex(ctx.theme.colors.ink),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "13px",
        wordWrap: { width: 380 },
        lineSpacing: 3,
      }),
    );
    const close = ctx.scene.add
      .text(400, 156, "×", {
        color: colorHex(ctx.theme.colors.muted),
        fontFamily: ctx.theme.fonts.family,
        fontSize: "24px",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerup", closeGlossary);
    panel.add(close);
    glossaryPanel = panel;
  };
  glossaryButton.on("pointerup", openGlossary);
  const unsubscribeGlossary = onTermsChanged(() => {
    const count = openedTermIds().length;
    glossaryButton.setText(count > 0 ? `Glossary ${count}` : "Glossary");
  });

  ctx.addUpdater(() => {
    if (frozen) {
      ctx.player.setPosition(frozenAt.x, frozenAt.y);
      ctx.player.setVelocity(0, 0);
    }
    markers.forEach((member) => {
      const distance = Math.hypot(
        ctx.player.x - member.x,
        ctx.player.y - member.y,
      );
      member.tag.setVisible(distance < 140);
    });
  });

  ctx.scene.events.once("shutdown", () => {
    unsubscribeGlossary();
    closeGlossary();
  });

  applyState();
  ctx.scene.time.delayedCall(0, updateObjective);
};
