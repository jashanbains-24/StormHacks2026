import type { FloorContext } from "../../../core/contracts";

export const F01_TILE_STYLE = {
  tileSize: 48,
  patternSize: 96,
  inset: { left: 52, top: 94, right: 52, bottom: 52 },
  colors: {
    grout: 0x59635f,
    highlight: 0x9aa29d,
    speck: 0x68726d,
    tiles: [0x818a85, 0x858e89, 0x7d8681, 0x89918d],
  },
} as const;

const createTileTexture = (ctx: FloorContext, key: string): void => {
  const { tileSize, patternSize, colors } = F01_TILE_STYLE;
  const graphics = ctx.scene.make.graphics({ x: 0, y: 0 }, false);

  colors.tiles.forEach((color, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = column * tileSize;
    const y = row * tileSize;

    graphics.fillStyle(color).fillRect(x, y, tileSize, tileSize);
    graphics
      .fillStyle(colors.highlight, 0.3)
      .fillRect(x + 2, y + 2, tileSize - 4, 1)
      .fillRect(x + 2, y + 2, 1, tileSize - 4);
    graphics
      .fillStyle(colors.grout)
      .fillRect(x + tileSize - 2, y, 2, tileSize)
      .fillRect(x, y + tileSize - 2, tileSize, 2);
    graphics
      .fillStyle(colors.speck, 0.18)
      .fillRect(x + 13 + row * 7, y + 16 + column * 9, 3, 2)
      .fillRect(x + 31 - column * 5, y + 32 - row * 6, 2, 3);
  });

  graphics.generateTexture(key, patternSize, patternSize);
  graphics.destroy();
};

export const createTiledFloor = (ctx: FloorContext): void => {
  const { inset, colors } = F01_TILE_STYLE;
  const textureKey = ctx.assets.key("generated.office_tiles");
  if (!ctx.scene.textures.exists(textureKey)) {
    createTileTexture(ctx, textureKey);
  }

  const width = ctx.scene.scale.width - inset.left - inset.right;
  const height = ctx.scene.scale.height - inset.top - inset.bottom;
  ctx.scene.add
    .tileSprite(inset.left, inset.top, width, height, textureKey)
    .setOrigin(0)
    .setDepth(-9);
  ctx.scene.add
    .rectangle(
      inset.left + width / 2,
      inset.top + height / 2,
      width,
      height,
      0,
      0,
    )
    .setStrokeStyle(3, colors.grout, 0.8)
    .setDepth(-8);
};
