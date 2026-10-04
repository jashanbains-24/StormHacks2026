import type { FloorContext } from "../../../core/contracts";

const COLORS = {
  outline: 0x17181c,
  shadow: 0x080b10,
  metalDark: 0x303944,
  metal: 0x566573,
  metalLight: 0x87949c,
  panel: 0x151c25,
  screen: 0x8db8a6,
  status: 0xa7d46f,
  warning: 0xd58a55,
  danger: 0xb94e48,
} as const;

const addBlocker = (
  ctx: FloorContext,
  x: number,
  y: number,
  width: number,
  height: number,
): void => {
  const blocker = ctx.scene.add
    .rectangle(x, y, width, height)
    .setVisible(false);
  ctx.scene.physics.add.existing(blocker, true);
  ctx.scene.physics.add.collider(ctx.player, blocker);
};

const drawCableTray = (ctx: FloorContext): void => {
  const tray = ctx.scene.add.graphics().setDepth(238);
  const left = 378;
  const top = 222;
  const width = 672;

  tray.fillStyle(COLORS.shadow);
  tray.fillRect(left + 6, top + 6, width, 12);
  tray.fillStyle(COLORS.outline);
  tray.fillRect(left, top, width, 12);
  tray.fillStyle(COLORS.metal);
  tray.fillRect(left + 3, top + 3, width - 6, 3);
  tray.fillRect(left + 3, top + 9, width - 6, 3);

  for (let x = left + 18; x < left + width; x += 30) {
    tray.fillStyle(COLORS.metalLight);
    tray.fillRect(x, top + 3, 3, 9);
  }

  [445, 550, 655, 760, 896, 1006].forEach((x, index) => {
    tray.fillStyle(index % 2 === 0 ? COLORS.screen : COLORS.warning);
    tray.fillRect(x - 3, top + 12, 3, 30);
    tray.fillRect(x, top + 39, 12, 3);
  });
};

const drawNocMonitorWall = (ctx: FloorContext): void => {
  const monitor = ctx.scene.add.graphics().setDepth(218);
  const x = 378;
  const y = 132;
  const width = 450;
  const height = 75;

  monitor.fillStyle(COLORS.shadow);
  monitor.fillRect(x + 6, y + 6, width, height);
  monitor.fillStyle(COLORS.outline);
  monitor.fillRect(x, y, width, height);
  monitor.fillStyle(COLORS.metal);
  monitor.fillRect(x + 3, y + 3, width - 6, height - 6);

  for (let screen = 0; screen < 4; screen += 1) {
    const screenX = x + 12 + screen * 108;
    monitor.fillStyle(COLORS.panel);
    monitor.fillRect(screenX, y + 12, 96, 48);
    monitor.fillStyle(COLORS.metalDark);
    monitor.fillRect(screenX + 6, y + 18, 84, 3);
    monitor.fillRect(screenX + 6, y + 51, 84, 3);

    for (let bar = 0; bar < 6; bar += 1) {
      monitor.fillStyle(
        (screen + bar) % 4 === 0 ? COLORS.warning : COLORS.screen,
      );
      monitor.fillRect(
        screenX + 9 + bar * 12,
        y + 45 - ((screen + bar) % 4) * 6,
        6,
        6 + ((screen + bar) % 4) * 6,
      );
    }
  }

  monitor.fillStyle(COLORS.status);
  monitor.fillRect(x + width - 15, y + height - 9, 6, 3);
};

const drawUpsBank = (ctx: FloorContext): void => {
  const bank = ctx.scene.add.graphics().setDepth(218);
  const x = 846;
  const y = 132;
  const width = 204;
  const height = 75;

  bank.fillStyle(COLORS.shadow);
  bank.fillRect(x + 6, y + 6, width, height);
  bank.fillStyle(COLORS.outline);
  bank.fillRect(x, y, width, height);
  bank.fillStyle(COLORS.metalDark);
  bank.fillRect(x + 3, y + 3, width - 6, height - 6);

  for (let unit = 0; unit < 5; unit += 1) {
    const unitX = x + 9 + unit * 39;
    bank.fillStyle(COLORS.metal);
    bank.fillRect(unitX, y + 9, 33, 57);
    bank.fillStyle(COLORS.panel);
    bank.fillRect(unitX + 6, y + 15, 21, 27);
    bank.fillStyle(unit === 3 ? COLORS.warning : COLORS.status);
    bank.fillRect(unitX + 15, y + 51, 6, 6);
  }
};

const drawSafetyStation = (ctx: FloorContext): void => {
  const safety = ctx.scene.add.graphics().setDepth(218);
  const x = 1074;
  const y = 132;

  safety.fillStyle(COLORS.shadow);
  safety.fillRect(x + 6, y + 6, 108, 105);
  safety.fillStyle(COLORS.outline);
  safety.fillRect(x, y, 108, 105);
  safety.fillStyle(COLORS.metalDark);
  safety.fillRect(x + 3, y + 3, 102, 99);

  [x + 15, x + 57].forEach((tankX) => {
    safety.fillStyle(COLORS.metalLight);
    safety.fillRect(tankX + 6, y + 15, 24, 6);
    safety.fillRect(tankX + 3, y + 21, 30, 57);
    safety.fillRect(tankX + 6, y + 78, 24, 6);
    safety.fillStyle(COLORS.metal);
    safety.fillRect(tankX + 9, y + 27, 18, 45);
    safety.fillStyle(COLORS.outline);
    safety.fillRect(tankX + 15, y + 9, 6, 6);
  });

  safety.fillStyle(COLORS.danger);
  safety.fillRect(x + 42, y + 87, 24, 12);
  safety.fillStyle(COLORS.outline);
  safety.fillRect(x + 48, y + 90, 12, 6);
};

const drawOpenFloorPanel = (ctx: FloorContext): void => {
  const panel = ctx.scene.add.graphics().setDepth(570);
  const x = 330;
  const y = 570;
  const width = 72;
  const height = 54;

  panel.fillStyle(COLORS.outline);
  panel.fillRect(x, y, width, height);
  panel.fillStyle(COLORS.shadow);
  panel.fillRect(x + 6, y + 6, width - 12, height - 12);

  [COLORS.screen, COLORS.warning, COLORS.danger].forEach((color, index) => {
    panel.fillStyle(color);
    panel.fillRect(x + 12, y + 15 + index * 9, width - 24, 3);
  });

  panel.fillStyle(COLORS.metal);
  panel.fillRect(x + width + 6, y + 6, width, height);
  panel.fillStyle(COLORS.metalLight);
  panel.fillRect(x + width + 9, y + 9, width - 6, 3);

  for (let stripe = 0; stripe < 6; stripe += 1) {
    panel.fillStyle(stripe % 2 === 0 ? COLORS.warning : COLORS.outline);
    panel.fillRect(x + stripe * 12, y - 6, 12, 6);
  }

  addBlocker(ctx, x + width / 2, y + height / 2, width, height);
};

export const createDataCenterInfrastructure = (ctx: FloorContext): void => {
  drawNocMonitorWall(ctx);
  drawUpsBank(ctx);
  drawSafetyStation(ctx);
  drawCableTray(ctx);
  drawOpenFloorPanel(ctx);
};
