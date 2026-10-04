import type { BuildUIHandle, FloorContext } from "../../../core/contracts";
import { createOfficeLayout } from "../../../core/ui-kit";
import { INTERN_WORKSTATION, INTERN_WORKSTATION_PROPS } from "./plan";
import { getQuestProgress } from "./runtime";

export const createBuildUI = (ctx: FloorContext): BuildUIHandle => {
  const quest = getQuestProgress(ctx);
  const isUnlocked = (): boolean => quest.consoleUnlocked;

  createOfficeLayout(ctx, INTERN_WORKSTATION_PROPS, []);
  const screenGlow = ctx.scene.add
    .rectangle(
      INTERN_WORKSTATION.x,
      INTERN_WORKSTATION.y - 48,
      42,
      25,
      ctx.theme.colors.warning,
      0.35,
    )
    .setDepth(INTERN_WORKSTATION.y - 49);

  let previouslyUnlocked: boolean | undefined;
  const refreshScreen = (): void => {
    const unlocked = isUnlocked();
    if (unlocked === previouslyUnlocked) return;
    previouslyUnlocked = unlocked;
    screenGlow.setFillStyle(
      unlocked ? ctx.theme.colors.success : ctx.theme.colors.warning,
      0.42,
    );
  };
  refreshScreen();
  ctx.addUpdater(refreshScreen);

  ctx.addInteractable({
    id: "f01:build_console",
    label: "Use your intern workstation",
    x: INTERN_WORKSTATION.x,
    y: INTERN_WORKSTATION.y,
    range: 100,
    onInteract: () => {
      if (!isUnlocked()) {
        ctx.hud.showToast(
          quest.needsDebrief
            ? "Rhea locked this attempt for review. Talk to her before retrying."
            : "Workstation locked. Check in with Rhea before touching production.",
        );
        return;
      }
      quest.markConsoleOpened();
      ctx.openBuild();
    },
  });
  return {};
};
