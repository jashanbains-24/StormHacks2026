export interface OfficePropPlacement {
  x: number;
  y: number;
  texture:
    | "desk"
    | "computer"
    | "bookshelf"
    | "plant"
    | "large-plant"
    | "sofa"
    | "chair-front"
    | "chair-back"
    | "coffee-table"
    | "whiteboard"
    | "bin"
    | "double-bookshelf"
    | "small-table"
    | "cushioned-chair-front"
    | "cushioned-chair-back"
    | "clock"
    | "coffee"
    | "cactus"
    | "large-painting"
    | "small-painting"
    | "meeting-table"
    | "cushioned-bench";
  scale?: number;
  collider?: boolean;
  depthOffset?: number;
}

export type OfficeCharacterTexture =
  | "player"
  | "specialist"
  | "ambient-1"
  | "ambient-3"
  | "ambient-4"
  | "ambient-5";

export const OFFICE_CHARACTER_TEXTURES: OfficeCharacterTexture[] = [
  "player",
  "specialist",
  "ambient-1",
  "ambient-3",
  "ambient-4",
  "ambient-5",
];

export type AmbientNpcBehavior =
  | { kind: "desk" }
  | {
      kind: "route";
      toX: number;
      toY: number;
      durationMs: number;
      pauseMs: number;
    };

export interface AmbientNpcPlacement {
  id: string;
  x: number;
  y: number;
  texture: OfficeCharacterTexture;
  behavior: AmbientNpcBehavior;
  flipX?: boolean;
}

export const OFFICE_PROPS: OfficePropPlacement[] = [
  { x: 245, y: 170, texture: "desk", scale: 3.2 },
  { x: 245, y: 149, texture: "computer", scale: 2.7, collider: false },
  {
    x: 245,
    y: 246,
    texture: "chair-back",
    scale: 2.6,
    depthOffset: -38,
  },
  { x: 405, y: 170, texture: "desk", scale: 3.2 },
  { x: 405, y: 149, texture: "computer", scale: 2.7, collider: false },
  {
    x: 405,
    y: 246,
    texture: "chair-back",
    scale: 2.6,
    depthOffset: -38,
  },
  { x: 565, y: 170, texture: "desk", scale: 3.2 },
  { x: 565, y: 149, texture: "computer", scale: 2.7, collider: false },
  {
    x: 565,
    y: 246,
    texture: "chair-back",
    scale: 2.6,
    depthOffset: -38,
  },
  { x: 725, y: 170, texture: "desk", scale: 3.2 },
  { x: 725, y: 149, texture: "computer", scale: 2.7, collider: false },
  {
    x: 725,
    y: 246,
    texture: "chair-back",
    scale: 2.6,
    depthOffset: -38,
  },
  { x: 862, y: 125, texture: "whiteboard", scale: 3, collider: false },
  { x: 955, y: 112, texture: "large-painting", scale: 3, collider: false },
  { x: 1015, y: 112, texture: "small-painting", scale: 3, collider: false },
  { x: 780, y: 112, texture: "clock", scale: 2.8, collider: false },
  { x: 828, y: 190, texture: "bin", scale: 2.6 },
  { x: 1000, y: 238, texture: "small-table", scale: 3 },
  { x: 980, y: 207, texture: "coffee", scale: 2.8, collider: false },
  { x: 1035, y: 210, texture: "cactus", scale: 2.6 },
  { x: 1000, y: 178, texture: "cushioned-chair-back", scale: 3 },
  { x: 1000, y: 302, texture: "cushioned-chair-front", scale: 3 },
  { x: 455, y: 430, texture: "meeting-table", scale: 3 },
  { x: 585, y: 430, texture: "meeting-table", scale: 3 },
  { x: 455, y: 330, texture: "cushioned-chair-back", scale: 3 },
  { x: 585, y: 330, texture: "cushioned-chair-back", scale: 3 },
  { x: 455, y: 530, texture: "cushioned-chair-front", scale: 3 },
  { x: 585, y: 530, texture: "cushioned-chair-front", scale: 3 },
  { x: 88, y: 475, texture: "double-bookshelf", scale: 3.2 },
  { x: 88, y: 522, texture: "double-bookshelf", scale: 3.2 },
  { x: 88, y: 570, texture: "bookshelf", scale: 3 },
  { x: 758, y: 570, texture: "sofa", scale: 3 },
  { x: 886, y: 570, texture: "sofa", scale: 3 },
  { x: 822, y: 495, texture: "coffee-table", scale: 2.8 },
  { x: 742, y: 484, texture: "chair-back", scale: 2.6 },
  { x: 902, y: 484, texture: "chair-back", scale: 2.6 },
  { x: 1018, y: 550, texture: "bookshelf", scale: 3.2 },
  { x: 104, y: 132, texture: "large-plant", scale: 2.8 },
  { x: 1090, y: 135, texture: "plant", scale: 3 },
  { x: 1085, y: 565, texture: "bin", scale: 2.6 },
];

export const AMBIENT_NPCS_BY_FLOOR: Record<number, AmbientNpcPlacement[]> = {
  0: [
    {
      id: "accounting-ava",
      x: 245,
      y: 226,
      texture: "ambient-1",
      behavior: { kind: "desk" },
    },
    {
      id: "support-milo",
      x: 405,
      y: 226,
      texture: "ambient-3",
      behavior: { kind: "desk" },
    },
    {
      id: "product-sam",
      x: 565,
      y: 226,
      texture: "ambient-4",
      behavior: { kind: "desk" },
    },
    {
      id: "legal-noor",
      x: 725,
      y: 226,
      texture: "ambient-5",
      behavior: {
        kind: "route",
        toX: 665,
        toY: 430,
        durationMs: 2800,
        pauseMs: 1800,
      },
    },
    {
      id: "facilities-finn",
      x: 1000,
      y: 300,
      texture: "specialist",
      behavior: {
        kind: "route",
        toX: 1080,
        toY: 520,
        durationMs: 2400,
        pauseMs: 2200,
      },
      flipX: true,
    },
  ],
  1: [
    {
      id: "accounting-ava",
      x: 245,
      y: 226,
      texture: "ambient-1",
      behavior: { kind: "desk" },
    },
    {
      id: "support-milo",
      x: 405,
      y: 226,
      texture: "ambient-3",
      behavior: { kind: "desk" },
    },
    {
      id: "product-sam",
      x: 565,
      y: 226,
      texture: "ambient-4",
      behavior: { kind: "desk" },
    },
    {
      id: "support-jules",
      x: 725,
      y: 226,
      texture: "ambient-5",
      behavior: {
        kind: "route",
        toX: 665,
        toY: 430,
        durationMs: 2300,
        pauseMs: 1600,
      },
    },
    {
      id: "facilities-finn",
      x: 1000,
      y: 300,
      texture: "player",
      behavior: {
        kind: "route",
        toX: 1080,
        toY: 520,
        durationMs: 2600,
        pauseMs: 2000,
      },
      flipX: true,
    },
    {
      id: "design-drew",
      x: 650,
      y: 530,
      texture: "ambient-3",
      behavior: {
        kind: "route",
        toX: 700,
        toY: 485,
        durationMs: 2100,
        pauseMs: 2400,
      },
    },
  ],
  2: [
    {
      id: "database-dev",
      x: 405,
      y: 226,
      texture: "ambient-4",
      behavior: { kind: "desk" },
    },
    {
      id: "cache-casey",
      x: 1000,
      y: 300,
      texture: "ambient-1",
      behavior: {
        kind: "route",
        toX: 1080,
        toY: 520,
        durationMs: 2800,
        pauseMs: 1900,
      },
    },
  ],
};
