import type { FloorContext, LayoutHandle } from "../../../core/contracts";
import {
  colorHex,
  createOfficeLayout,
  type OfficePropPlacement,
} from "../../../core/ui-kit";
import { tasks } from "../definition/tasks";

const drawFishTank = (ctx: FloorContext, x: number, y: number): void => {
  const graphics = ctx.scene.add.graphics().setDepth(y + 20);
  const ink = ctx.theme.colors.ink;
  graphics.fillStyle(ink, 0.18).fillRect(x - 86, y + 48, 172, 12);
  graphics.fillStyle(0x5b4037).fillRect(x - 78, y + 35, 156, 25);
  graphics.fillStyle(0x8f674b).fillRect(x - 70, y + 27, 140, 12);
  graphics.fillStyle(ink).fillRect(x - 82, y - 43, 164, 78);
  graphics.fillStyle(0x75b7c9).fillRect(x - 73, y - 34, 146, 60);
  graphics.fillStyle(0xa9e0e2, 0.7).fillRect(x - 62, y - 28, 10, 50);
  graphics.fillStyle(0x4d9eb5, 0.7).fillRect(x - 46, y - 20, 5, 43);
  graphics.fillStyle(0xd9bd83).fillRect(x - 72, y + 18, 144, 8);
  graphics.fillStyle(0x6b513c).fillRect(x - 68, y + 18, 8, 5);
  graphics.fillStyle(0x6b513c).fillRect(x - 28, y + 20, 7, 4);
  graphics.fillStyle(0x6b513c).fillRect(x + 35, y + 19, 8, 5);
  graphics.fillStyle(0x2f5d3b).fillRect(x - 55, y - 2, 7, 20);
  graphics.fillStyle(0x477e48).fillRect(x - 64, y - 12, 14, 8);
  graphics.fillStyle(0x477e48).fillRect(x - 48, y - 20, 12, 8);
  graphics.fillStyle(0x2f5d3b).fillRect(x + 46, y + 2, 7, 16);
  graphics.fillStyle(0xd77c91).fillRect(x + 50, y - 9, 14, 7);
  graphics.fillStyle(0xd77c91).fillRect(x + 39, y - 17, 12, 7);
  graphics.fillStyle(0xe16c42).fillRect(x - 23, y - 7, 17, 8);
  graphics.fillStyle(0xf3b35c).fillRect(x - 7, y - 5, 6, 4);
  graphics.fillStyle(0xc94c52).fillRect(x + 16, y + 7, 15, 7);
  graphics.fillStyle(0xf3b35c).fillRect(x + 29, y + 8, 5, 3);
  graphics.fillStyle(0xe8f5e9).fillRect(x + 21, y - 25, 5, 7);
  graphics.fillStyle(0xe8f5e9).fillRect(x + 27, y - 31, 4, 6);
  graphics.fillStyle(0x34495e).fillRect(x - 62, y + 45, 124, 9);
  graphics.fillStyle(0x9ae6b4).fillRect(x - 50, y + 47, 18, 5);
  graphics.fillStyle(0xd69e2e).fillRect(x - 25, y + 47, 18, 5);
  graphics.fillStyle(0xc73e3a).fillRect(x, y + 47, 18, 5);
  graphics.lineStyle(3, 0x1f2933).strokeRect(x - 82, y - 43, 164, 78);
  graphics.fillStyle(0x34495e).fillRect(x - 88, y - 50, 176, 8);
  graphics.setScale(0.78).setPosition(x * 0.22, y * 0.22);
};

const drawPrinter = (ctx: FloorContext, x: number, y: number): void => {
  const graphics = ctx.scene.add.graphics().setDepth(y + 20);
  const ink = ctx.theme.colors.ink;
  graphics.fillStyle(ink, 0.18).fillRect(x - 67, y + 60, 134, 12);
  graphics.fillStyle(0x6b7280).fillRect(x - 58, y - 47, 116, 106);
  graphics.fillStyle(0x9ca3af).fillRect(x - 49, y - 38, 98, 88);
  graphics.fillStyle(0x34495e).fillRect(x - 42, y - 29, 52, 24);
  graphics.fillStyle(0x9ae6b4).fillRect(x - 35, y - 22, 36, 9);
  graphics.fillStyle(0x253746).fillRect(x + 18, y - 29, 22, 24);
  graphics.fillStyle(0xc73e3a).fillRect(x + 23, y - 24, 6, 6);
  graphics.fillStyle(0xd69e2e).fillRect(x + 32, y - 24, 6, 6);
  graphics.fillStyle(0x2f855a).fillRect(x + 23, y - 14, 15, 5);
  graphics.fillStyle(0x34495e).fillRect(x - 42, y + 3, 84, 29);
  graphics.fillStyle(0xe8e4d7).fillRect(x - 32, y + 10, 64, 16);
  graphics.fillStyle(0xf7f3e8).fillRect(x - 24, y - 59, 48, 20);
  graphics.fillStyle(0x6d7f8f).fillRect(x - 32, y - 68, 64, 12);
  graphics.fillStyle(0x1f2933).fillRect(x - 25, y - 64, 50, 4);
  graphics.fillStyle(0x34495e).fillRect(x - 49, y + 50, 98, 10);
  graphics.fillStyle(0xd8c9aa).fillRect(x - 68, y + 60, 50, 10);
  graphics.fillStyle(0x2f855a).fillRect(x + 37, y + 38, 8, 8);
  graphics.lineStyle(3, ink).strokeRect(x - 58, y - 47, 116, 106);
  graphics.setScale(0.78).setPosition(x * 0.22, y * 0.22);
};

const drawWaitingChairRow = (
  ctx: FloorContext,
  x: number,
  y: number,
  seatCount: number,
  occupiedSeats: number[] = [],
): void => {
  const graphics = ctx.scene.add.graphics().setDepth(y + 8);
  const seatWidth = 52;
  const seatGap = 12;
  const rowWidth = seatWidth * seatCount + seatGap * (seatCount - 1);
  const left = x - rowWidth / 2;
  graphics.fillStyle(ctx.theme.colors.ink, 0.22);
  graphics.fillRect(left - 8, y + 34, rowWidth + 16, 9);
  graphics.fillStyle(0x9ca3af);
  graphics.fillRect(left - 5, y + 25, rowWidth + 10, 7);
  for (let index = 0; index < seatCount; index += 1) {
    const seatX = left + index * (seatWidth + seatGap);
    graphics.fillStyle(0x252f3a);
    graphics.fillRect(seatX, y - 20, seatWidth, 48);
    graphics.fillStyle(occupiedSeats.includes(index) ? 0x874c5e : 0x5b6470);
    graphics.fillRect(seatX + 5, y - 14, seatWidth - 10, 26);
    graphics.fillStyle(0x8f9aa5);
    graphics.fillRect(seatX + 5, y - 17, seatWidth - 10, 4);
    if (index < seatCount - 1) {
      graphics.fillStyle(0xd8dde1);
      graphics.fillRect(seatX + seatWidth + 2, y - 22, 8, 42);
      graphics.fillStyle(0x7d8790);
      graphics.fillRect(seatX + seatWidth + 4, y + 18, 4, 12);
    }
  }
  graphics.fillStyle(0x6d7f8f);
  graphics.fillRect(left + 12, y + 28, 7, 15);
  graphics.fillRect(left + rowWidth - 19, y + 28, 7, 15);
};

export const createLayout = (ctx: FloorContext): LayoutHandle => {
  const formCompleted = Boolean(ctx.progression.resultFor(ctx.floorOrder));
  ctx.hud.trackTask(tasks.maya, formCompleted);
  if (formCompleted) {
    ctx.hud.trackTask(tasks.form, true);
    ctx.hud.trackTask(tasks.upstairs);
  }
  ctx.events.on("tutorial:completed", () => {
    ctx.hud.trackTask(tasks.form, true);
    ctx.hud.trackTask(tasks.upstairs);
  });
  const lobbyProps: OfficePropPlacement[] = [
    { x: 300, y: 190, texture: "desk", scale: 3.5 },
    { x: 300, y: 165, texture: "computer", scale: 2.8, collider: false },
    { x: 300, y: 255, texture: "chair-back", scale: 2.8, depthOffset: -38 },
    { x: 160, y: 240, texture: "large-plant", scale: 3 },
    { x: 1070, y: 180, texture: "large-plant", scale: 3 },
    { x: 930, y: 480, texture: "small-table", scale: 3 },
    { x: 1020, y: 530, texture: "plant", scale: 3 },
    { x: 160, y: 510, texture: "bookshelf", scale: 3.2 },
    { x: 780, y: 112, texture: "clock", scale: 2.8, collider: false },
    { x: 955, y: 112, texture: "large-painting", scale: 2.6, collider: false },
    { x: 1015, y: 112, texture: "small-painting", scale: 2.6, collider: false },
    { x: 1085, y: 565, texture: "bin", scale: 2.6 },
    { x: 1035, y: 210, texture: "cactus", scale: 2.6 },
  ];
  createOfficeLayout(ctx, lobbyProps, []);

  const mentor = ctx.addNpc(300, 235, "f00-maya", {
    texture: "specialist",
  });
  ctx.scene.physics.add.collider(ctx.player, mentor);
  ctx.scene.add
    .text(766, 382, "Maya Mentor // Platform Coach", {
      color: colorHex(ctx.theme.colors.ink),
      fontFamily: ctx.theme.fonts.family,
      fontSize: "15px",
      backgroundColor: colorHex(ctx.theme.colors.panel),
      padding: { x: 7, y: 4 },
    })
    .setPosition(214, 276)
    .setDepth(600);
  ctx.addInteractable({
    id: "f00:mentor",
    label: "Talk to Maya",
    x: mentor.x,
    y: mentor.y,
    onInteract: () => {
      hasMetMaya = true;
      ctx.hud.trackTask(tasks.maya, true);
      ctx.hud.trackTask(tasks.form);
      ctx.dialogue.showSpecialist();
    },
  });

  drawFishTank(ctx, 930, 145);
  drawPrinter(ctx, 430, 190);
  drawWaitingChairRow(ctx, 520, 315, 4, [0, 2]);
  drawWaitingChairRow(ctx, 520, 395, 4, [3]);
  drawWaitingChairRow(ctx, 650, 650, 10);

  const waitingAva = ctx.addNpc(424, 318, "f00-waiting-ava", {
    texture: "ambient-1",
    animationKey: "office-ambient-1-idle-up",
    staticBody: true,
  });
  waitingAva.setDepth(340);
  ctx.scene.physics.add.collider(ctx.player, waitingAva);

  const waitingMilo = ctx.addNpc(552, 318, "f00-waiting-milo", {
    texture: "ambient-3",
    animationKey: "office-ambient-3-idle-up",
    staticBody: true,
  });
  waitingMilo.setDepth(340);
  ctx.scene.physics.add.collider(ctx.player, waitingMilo);

  const waitingSam = ctx.addNpc(616, 398, "f00-waiting-sam", {
    texture: "ambient-4",
    animationKey: "office-ambient-4-idle-up",
    staticBody: true,
  });
  waitingSam.setDepth(420);
  ctx.scene.physics.add.collider(ctx.player, waitingSam);

  const bottomWaitingNoor = ctx.addNpc(490, 653, "f00-waiting-noor", {
    texture: "ambient-5",
    animationKey: "office-ambient-5-idle-up",
    staticBody: true,
  });
  bottomWaitingNoor.setDepth(755);
  ctx.scene.physics.add.collider(ctx.player, bottomWaitingNoor);

  const bottomWaitingFinn = ctx.addNpc(746, 653, "f00-waiting-finn", {
    texture: "ambient-1",
    animationKey: "office-ambient-1-idle-up",
    staticBody: true,
  });
  bottomWaitingFinn.setDepth(755);
  ctx.scene.physics.add.collider(ctx.player, bottomWaitingFinn);

  const bottomWaitingJules = ctx.addNpc(618, 653, "f00-waiting-jules", {
    texture: "ambient-3",
    animationKey: "office-ambient-3-idle-up",
    staticBody: true,
  });
  bottomWaitingJules.setDepth(755);
  ctx.scene.physics.add.collider(ctx.player, bottomWaitingJules);

  const bottomWaitingDrew = ctx.addNpc(874, 653, "f00-waiting-drew", {
    texture: "ambient-4",
    animationKey: "office-ambient-4-idle-up",
    staticBody: true,
  });
  bottomWaitingDrew.setDepth(755);
  ctx.scene.physics.add.collider(ctx.player, bottomWaitingDrew);

  let hasMetMaya = false;
  ctx.addInteractable({
    id: "f00:seat-row-a",
    label: "Take a seat and fill out your information",
    x: 520,
    y: 315,
    range: 120,
    onInteract: () => {
      if (!hasMetMaya) {
        ctx.hud.showToast("Maya is waiting at the front desk.");
        return;
      }
      ctx.openBuild();
    },
  });
  ctx.addInteractable({
    id: "f00:seat-row-b",
    label: "Take a seat and fill out your information",
    x: 520,
    y: 395,
    range: 120,
    onInteract: () => {
      if (!hasMetMaya) {
        ctx.hud.showToast("Maya is waiting at the front desk.");
        return;
      }
      ctx.openBuild();
    },
  });
  ctx.addInteractable({
    id: "f00:seat-row-bottom",
    label: "Take a seat and fill out your information",
    x: 650,
    y: 650,
    range: 180,
    onInteract: () => {
      if (!hasMetMaya) {
        ctx.hud.showToast("Maya is waiting at the front desk.");
        return;
      }
      ctx.openBuild();
    },
  });

  return {};
};
