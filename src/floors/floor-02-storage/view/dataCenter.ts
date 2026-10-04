import type { FloorContext } from "../../../core/contracts";

const ROOM = {
  left: 52,
  top: 94,
  width: 1176,
  height: 574,
} as const;

const COLORS = {
  floor: 0x0f1724,
  floorAlternate: 0x121d2c,
  seam: 0x26364d,
  vent: 0x42536b,
  outline: 0x17181c,
  shadow: 0x080b10,
  metalDark: 0x303944,
  metal: 0x566573,
  metalLight: 0x87949c,
  panel: 0x151c25,
  screen: 0x8db8a6,
  status: 0xa7d46f,
  warning: 0xd58a55,
  database: 0x5f9fba,
  localCache: 0xd58a55,
  sharedCache: 0x6fa878,
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

const drawRaisedFloor = (ctx: FloorContext): void => {
  const floor = ctx.scene.add.graphics().setDepth(-8);
  floor.fillStyle(COLORS.floor);
  floor.fillRect(ROOM.left, ROOM.top, ROOM.width, ROOM.height);

  const tileSize = 48;
  for (let row = 0; row < Math.ceil(ROOM.height / tileSize); row += 1) {
    for (
      let column = 0;
      column < Math.ceil(ROOM.width / tileSize);
      column += 1
    ) {
      const x = ROOM.left + column * tileSize;
      const y = ROOM.top + row * tileSize;
      if ((row + column) % 2 === 0) {
        floor.fillStyle(COLORS.floorAlternate, 0.55);
        floor.fillRect(x, y, tileSize, tileSize);
      }
      floor.fillStyle(COLORS.vent, 0.46);
      floor.fillRect(x + 15, y + 15, 3, 3);
      floor.fillRect(x + 30, y + 15, 3, 3);
      floor.fillRect(x + 15, y + 30, 3, 3);
      floor.fillRect(x + 30, y + 30, 3, 3);
    }
  }

  floor.lineStyle(1, COLORS.seam, 0.9);
  for (let x = ROOM.left; x <= ROOM.left + ROOM.width; x += tileSize) {
    floor.lineBetween(x, ROOM.top, x, ROOM.top + ROOM.height);
  }
  for (let y = ROOM.top; y <= ROOM.top + ROOM.height; y += tileSize) {
    floor.lineBetween(ROOM.left, y, ROOM.left + ROOM.width, y);
  }
};

const drawServerRack = (
  ctx: FloorContext,
  x: number,
  y: number,
  ledOffset: number,
): void => {
  const width = 60;
  const height = 96;
  const left = x - width / 2;
  const top = y - height / 2;
  const rack = ctx.scene.add.graphics().setDepth(y + height / 2);

  rack.fillStyle(COLORS.shadow, 0.72);
  rack.fillRect(left + 6, top + 6, width, height);
  rack.fillStyle(COLORS.outline);
  rack.fillRect(left, top, width, height);
  rack.fillStyle(COLORS.metal);
  rack.fillRect(left + 3, top + 3, width - 6, height - 6);
  rack.fillStyle(COLORS.metalLight);
  rack.fillRect(left + 3, top + 3, 3, height - 9);
  rack.fillStyle(COLORS.panel);
  rack.fillRect(left + 9, top + 9, width - 18, height - 21);

  for (let panel = 0; panel < 5; panel += 1) {
    const panelY = top + 12 + panel * 15;
    rack.fillStyle(COLORS.metalDark);
    rack.fillRect(left + 12, panelY, 36, 9);
    rack.fillStyle(COLORS.outline);
    rack.fillRect(left + 15, panelY + 3, 21, 3);
    rack.fillStyle(
      (panel + ledOffset) % 4 === 0 ? COLORS.warning : COLORS.status,
    );
    rack.fillRect(left + 42, panelY + 3, 3, 3);
  }

  rack.fillStyle(COLORS.outline);
  rack.fillRect(left + 9, top + height - 12, width - 18, 3);
  rack.fillRect(left + 6, top + height, 12, 3);
  rack.fillRect(left + width - 18, top + height, 12, 3);
  addBlocker(ctx, x, y, width, height);
};

const drawTapeLibrary = (ctx: FloorContext): void => {
  const x = 90;
  const y = 174;
  const width = 252;
  const height = 96;
  const library = ctx.scene.add.graphics().setDepth(y + height);

  library.fillStyle(COLORS.shadow, 0.72);
  library.fillRect(x + 6, y + 6, width, height);
  library.fillStyle(COLORS.database);
  library.fillRect(x, y, width, height);
  library.fillStyle(COLORS.outline);
  library.fillRect(x + 3, y + 3, width - 6, height - 6);
  library.fillStyle(COLORS.metal);
  library.fillRect(x + 6, y + 6, width - 12, height - 12);
  library.fillStyle(COLORS.metalLight);
  library.fillRect(x + 6, y + 6, width - 12, 3);

  for (let bay = 0; bay < 6; bay += 1) {
    const bayX = x + 9 + bay * 39;
    library.fillStyle(COLORS.panel);
    library.fillRect(bayX, y + 12, 33, 69);
    for (let tape = 0; tape < 4; tape += 1) {
      const tapeY = y + 15 + tape * 15;
      library.fillStyle(
        (bay + tape) % 3 === 0 ? COLORS.screen : COLORS.metalLight,
      );
      library.fillRect(bayX + 3, tapeY, 27, 9);
      library.fillStyle(COLORS.outline);
      library.fillRect(bayX + 21, tapeY + 3, 3, 3);
    }
  }

  addBlocker(ctx, x + width / 2, y + height / 2, width, height);
};

const drawCoolingUnit = (ctx: FloorContext, x: number, y: number): void => {
  const width = 72;
  const height = 96;
  const unit = ctx.scene.add.graphics().setDepth(y + height);

  unit.fillStyle(COLORS.shadow, 0.72);
  unit.fillRect(x + 6, y + 6, width, height);
  unit.fillStyle(COLORS.outline);
  unit.fillRect(x, y, width, height);
  unit.fillStyle(COLORS.metal);
  unit.fillRect(x + 3, y + 3, width - 6, height - 6);
  unit.fillStyle(COLORS.metalLight);
  unit.fillRect(x + 3, y + 3, 3, height - 9);
  unit.fillStyle(COLORS.panel);
  unit.fillRect(x + 12, y + 12, width - 24, 57);
  unit.fillStyle(COLORS.screen);
  for (let offset = 0; offset < 5; offset += 1) {
    unit.fillRect(x + 18, y + 18 + offset * 9, width - 36, 3);
  }
  unit.fillStyle(COLORS.status);
  unit.fillRect(x + width - 15, y + height - 15, 6, 6);

  addBlocker(ctx, x + width / 2, y + height / 2, width, height);
};

const drawCacheNode = (
  ctx: FloorContext,
  x: number,
  y: number,
  accent: number,
): void => {
  const width = 72;
  const height = 54;
  const node = ctx.scene.add.graphics().setDepth(y + height);

  node.fillStyle(COLORS.shadow, 0.72);
  node.fillRect(x + 6, y + 6, width, height);
  node.fillStyle(accent);
  node.fillRect(x, y, width, height);
  node.fillStyle(COLORS.outline);
  node.fillRect(x + 3, y + 3, width - 6, height - 6);
  node.fillStyle(COLORS.metal);
  node.fillRect(x + 6, y + 6, width - 12, height - 12);
  node.fillStyle(COLORS.panel);
  node.fillRect(x + 12, y + 9, width - 24, 27);

  for (let column = 0; column < 4; column += 1) {
    node.fillStyle(column === 3 ? COLORS.warning : COLORS.status);
    node.fillRect(x + 18 + column * 9, y + 15, 3, 15);
  }
  node.fillStyle(COLORS.metalLight);
  node.fillRect(x + 15, y + height - 12, width - 30, 3);

  addBlocker(ctx, x + width / 2, y + height / 2, width, height);
};

export const createDataCenterShell = (ctx: FloorContext): void => {
  drawRaisedFloor(ctx);
};

export const createStorageEquipment = (ctx: FloorContext): void => {
  drawTapeLibrary(ctx);
  drawCoolingUnit(ctx, 105, 430);
  drawCoolingUnit(ctx, 225, 430);

  [445, 550, 655, 760].forEach((x, column) => {
    drawServerRack(ctx, x, 310, column);
    drawServerRack(ctx, x, 500, column + 2);
  });

  drawCacheNode(ctx, 860, 260, COLORS.localCache);
  drawCacheNode(ctx, 970, 260, COLORS.localCache);
  drawCacheNode(ctx, 860, 465, COLORS.sharedCache);
  drawCacheNode(ctx, 970, 465, COLORS.sharedCache);
};
