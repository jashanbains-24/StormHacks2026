import type { FloorContext, LayoutHandle } from "../../../core/contracts";
import { colorHex, createOfficeLayout } from "../../../core/ui-kit";
import {
  F01_OFFICE_PROPS,
  isDialogueOutOfRange,
  RHEA_POSITION,
  ROAMING_NPCS,
  SEATED_NPCS,
} from "./plan";
import { getQuestProgress, getSceneRuntime } from "./runtime";

export const createLayout = (ctx: FloorContext): LayoutHandle => {
  createOfficeLayout(ctx, F01_OFFICE_PROPS, SEATED_NPCS);
  const runtime = getSceneRuntime(ctx);
  const quest = getQuestProgress(ctx);

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
  ctx.scene.add
    .text(specialist.x, specialist.y - 65, "!", {
      color: colorHex(ctx.theme.colors.ink),
      fontFamily: ctx.theme.fonts.mono,
      fontSize: "24px",
      fontStyle: "bold",
      backgroundColor: colorHex(ctx.theme.colors.warning),
      padding: { x: 7, y: 1 },
    })
    .setOrigin(0.5)
    .setDepth(601);
  ctx.scene.add
    .text(specialist.x, specialist.y + 48, "Rhea Boot // SRE LEAD", {
      color: colorHex(ctx.theme.colors.ink),
      fontFamily: ctx.theme.fonts.family,
      fontSize: "15px",
      backgroundColor: colorHex(ctx.theme.colors.panel),
      padding: { x: 7, y: 4 },
    })
    .setDepth(600);
  ctx.addInteractable({
    id: "f01:specialist",
    label: "Talk to Rhea",
    x: specialist.x,
    y: specialist.y,
    range: 92,
    onInteract: () => {
      const firstIntroduction = !quest.consoleUnlocked;
      quest.completeIntroduction();
      runtime.dialogueOpen = true;
      ctx.dialogue.showSpecialist();
      if (firstIntroduction) {
        ctx.hud.showToast(
          "Intern access granted. Your workstation is down and to Rhea's right.",
        );
      }
      ctx.hud.setObjective(
        "Intern task: use your assigned workstation to stabilize traffic",
      );
    },
  });

  ctx.addUpdater(() => {
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
