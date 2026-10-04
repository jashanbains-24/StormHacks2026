import type { BuildUIHandle, FloorContext } from "../../../core/contracts";
import { colorHex, createOfficeLayout } from "../../../core/ui-kit";
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
  const status = ctx.scene.add
    .text(INTERN_WORKSTATION.x, INTERN_WORKSTATION.y + 75, "", {
      align: "center",
      color: colorHex(ctx.theme.colors.ink),
      backgroundColor: colorHex(ctx.theme.colors.panel),
      fontFamily: ctx.theme.fonts.mono,
      fontSize: "13px",
      fontStyle: "bold",
      padding: { x: 8, y: 5 },
    })
    .setOrigin(0.5)
    .setDepth(600);

  let previouslyUnlocked: boolean | undefined;
  const refreshStatus = (): void => {
    const unlocked = isUnlocked();
    if (unlocked === previouslyUnlocked) return;
    previouslyUnlocked = unlocked;
    status
      .setText(
        unlocked
          ? "INTERN-01 // BUILD READY"
          : "INTERN-01 // LOCKED — SEE RHEA",
      )
      .setColor(
        colorHex(unlocked ? ctx.theme.colors.success : ctx.theme.colors.alert),
      );
    screenGlow.setFillStyle(
      unlocked ? ctx.theme.colors.success : ctx.theme.colors.warning,
      0.42,
    );
  };
  refreshStatus();
  ctx.addUpdater(refreshStatus);

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
