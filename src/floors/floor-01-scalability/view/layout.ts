import type { FloorContext, LayoutHandle } from "../../../core/contracts";
import {
  bindNearbyNameLabel,
  colorHex,
  createOfficeLayout,
} from "../../../core/ui-kit";
import {
  content,
  onboardingDialogue,
  outcomeDialogueFor,
} from "../definition/content";
import { createTiledFloor } from "./floorSurface";
import { createGuidance } from "./guidance";
import {
  F01_OFFICE_PROPS,
  isDialogueOutOfRange,
  RHEA_POSITION,
  ROAMING_NPCS,
  SEATED_NPCS,
} from "./plan";
import { getQuestProgress, getSceneRuntime, parseBuildResult } from "./runtime";
import { trackQuestTasks } from "./taskProgress";

export const createLayout = (ctx: FloorContext): LayoutHandle => {
  createTiledFloor(ctx);
  createOfficeLayout(ctx, F01_OFFICE_PROPS, SEATED_NPCS);
  const runtime = getSceneRuntime(ctx);
  const quest = getQuestProgress(ctx);
  trackQuestTasks(ctx, quest);

  for (const plan of ROAMING_NPCS) {
    const npc = ctx.addNpc(plan.x, plan.y, plan.id, {
      texture: plan.texture,
      staticBody: false,
    });
    ctx.scene.physics.add.collider(ctx.player, npc);
    ctx.addUpdater(() => npc.updateMovementAnimation());
    runtime.roamingNpcs.push({ npc, plan });
  }

  const specialist = ctx.addNpc(RHEA_POSITION.x, RHEA_POSITION.y, "f01-rhea", {
    texture: "specialist",
  });
  ctx.scene.physics.add.collider(ctx.player, specialist);
  const nameLabel = ctx.scene.add
    .text(specialist.x, specialist.y - 54, "Rhea Boot", {
      color: colorHex(ctx.theme.colors.ink),
      fontFamily: ctx.theme.fonts.family,
      fontSize: "15px",
      backgroundColor: colorHex(ctx.theme.colors.panel),
      padding: { x: 7, y: 4 },
    })
    .setOrigin(0.5, 1)
    .setDepth(600);
  bindNearbyNameLabel(ctx, nameLabel, specialist);
  ctx.addInteractable({
    id: "f01:specialist",
    label: "Talk to Rhea",
    x: specialist.x,
    y: specialist.y,
    range: 92,
    onInteract: () => {
      if (runtime.dialogueOpen) return;
      runtime.dialogueOpen = true;
      if (quest.needsDebrief) {
        const result = quest.latestResult;
        if (!result) return;
        ctx.dialogue.showSequence(outcomeDialogueFor(result.id), (reason) => {
          runtime.dialogueOpen = false;
          if (reason !== "acknowledged") return;
          quest.finishDebrief();
          if (result.id === "canonical") {
            ctx.progression.confirmHandoff(ctx.floorOrder);
            ctx.hud.setObjective(
              "Incident resolved: take the elevator to your next assignment",
            );
          } else {
            ctx.hud.setObjective(
              "Apply Rhea's feedback and rerun the stress test",
            );
            ctx.hud.showToast("Workstation unlocked for another attempt.");
          }
          trackQuestTasks(ctx, quest);
        });
        return;
      }

      if (!quest.hasMetRhea) {
        ctx.dialogue.showSequence(onboardingDialogue, (reason) => {
          runtime.dialogueOpen = false;
          if (reason !== "acknowledged") return;
          quest.completeIntroduction();
          quest.finishIntroduction();
          trackQuestTasks(ctx, quest);
          ctx.hud.showToast(
            "Intern access granted. Your workstation is the empty desk at the right end of the top row.",
          );
          ctx.hud.setObjective(
            "Use your assigned workstation—or talk to Rhea again for hints",
          );
        });
        return;
      }

      const hint = quest.nextHint(content.specialistHints);
      if (!hint) {
        runtime.dialogueOpen = false;
        return;
      }
      ctx.dialogue.showSequence([hint], () => {
        runtime.dialogueOpen = false;
        ctx.hud.setObjective("Use Rhea's hint at your assigned workstation");
      });
    },
  });

  ctx.events.on("build:result", (floorOrder, value) => {
    if (floorOrder !== ctx.floorOrder) return;
    const result = parseBuildResult(value);
    if (!result) return;
    runtime.dialogueOpen = false;
    quest.recordResult(result);
    trackQuestTasks(ctx, quest);
    ctx.hud.setObjective(
      "Attempt evaluated: close the console and debrief with Rhea",
    );
  });

  createGuidance(ctx, quest, runtime);
  let objectiveInitialized = false;
  ctx.addUpdater(() => {
    if (!objectiveInitialized) {
      objectiveInitialized = true;
      if (quest.needsDebrief) {
        ctx.hud.setObjective("Debrief with Rhea about your latest attempt");
      } else if (quest.handoffReady) {
        ctx.hud.setObjective(
          "Incident resolved: take the elevator to your next assignment",
        );
      } else if (quest.hasMetRhea) {
        ctx.hud.setObjective(
          "Use your assigned workstation—or talk to Rhea again for hints",
        );
      }
    }

    const distance = Math.hypot(
      ctx.player.x - specialist.x,
      ctx.player.y - specialist.y,
    );
    if (isDialogueOutOfRange(runtime.dialogueOpen, distance)) {
      runtime.dialogueOpen = false;
      ctx.dialogue.dismiss();
    }
  });

  return {};
};
