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
  { x: 245, y: 220, texture: "chair-back", scale: 2.6 },
  { x: 405, y: 170, texture: "desk", scale: 3.2 },
  { x: 405, y: 149, texture: "computer", scale: 2.7, collider: false },
  { x: 405, y: 220, texture: "chair-back", scale: 2.6 },
  { x: 565, y: 170, texture: "desk", scale: 3.2 },
  { x: 565, y: 149, texture: "computer", scale: 2.7, collider: false },
  { x: 565, y: 220, texture: "chair-back", scale: 2.6 },
  { x: 725, y: 170, texture: "desk", scale: 3.2 },
  { x: 725, y: 149, texture: "computer", scale: 2.7, collider: false },
  { x: 725, y: 220, texture: "chair-back", scale: 2.6 },
  { x: 862, y: 125, texture: "whiteboard", scale: 3, collider: false },
  { x: 955, y: 112, texture: "large-painting", scale: 3, collider: false },
  { x: 1015, y: 112, texture: "small-painting", scale: 3, collider: false },
  { x: 780, y: 112, texture: "clock", scale: 2.8, collider: false },
  { x: 828, y: 190, texture: "bin", scale: 2.6 },
  { x: 1000, y: 238, texture: "small-table", scale: 3.2 },
  { x: 1000, y: 205, texture: "coffee", scale: 3, collider: false },
  { x: 1045, y: 218, texture: "cactus", scale: 2.8 },
  { x: 948, y: 260, texture: "cushioned-chair-front", scale: 3 },
  { x: 1052, y: 270, texture: "cushioned-chair-front", scale: 3 },
  { x: 465, y: 430, texture: "meeting-table", scale: 3.8 },
  { x: 405, y: 430, texture: "meeting-table", scale: 3.8 },
  { x: 405, y: 350, texture: "cushioned-chair-back", scale: 3 },
  { x: 465, y: 350, texture: "cushioned-chair-back", scale: 3 },
  { x: 405, y: 510, texture: "cushioned-chair-front", scale: 3 },
  { x: 465, y: 510, texture: "cushioned-chair-front", scale: 3 },
  { x: 555, y: 520, texture: "cushioned-bench", scale: 3 },
  { x: 117, y: 500, texture: "double-bookshelf", scale: 3.4 },
  { x: 117, y: 545, texture: "double-bookshelf", scale: 3.4 },
  { x: 112, y: 590, texture: "bookshelf", scale: 3.1 },
  { x: 765, y: 558, texture: "sofa", scale: 3.2 },
  { x: 882, y: 558, texture: "sofa", scale: 3.2 },
  { x: 823, y: 493, texture: "coffee-table", scale: 3 },
  { x: 720, y: 493, texture: "chair-front", scale: 2.6 },
  { x: 927, y: 493, texture: "chair-front", scale: 2.6 },
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
        toX: 555,
        toY: 350,
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
        toX: 1018,
        toY: 500,
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
        toX: 610,
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
        toX: 1018,
        toY: 500,
        durationMs: 2600,
        pauseMs: 2000,
      },
      flipX: true,
    },
    {
      id: "design-drew",
      x: 555,
      y: 430,
      texture: "ambient-3",
      behavior: {
        kind: "route",
        toX: 650,
        toY: 493,
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
        toX: 927,
        toY: 493,
        durationMs: 2800,
        pauseMs: 1900,
      },
    },
  ],
};
