import type {
  AmbientNpcPlacement,
  OfficePropPlacement,
} from "../../../core/ui-kit";

export const RHEA_POSITION = { x: 178, y: 350 } as const;
export const INTERN_WORKSTATION = { x: 725, y: 194 } as const;
export const DIALOGUE_DISMISS_DISTANCE = 178;

const deskCollision = {
  width: 132,
  height: 42,
  offsetY: 17,
} as const;

const chairCollision = {
  width: 28,
  height: 22,
  offsetY: 7,
} as const;

export const F01_OFFICE_PROPS: OfficePropPlacement[] = [
  {
    x: 245,
    y: 170,
    texture: "desk",
    scale: 3.2,
    collisionBox: deskCollision,
  },
  { x: 245, y: 149, texture: "computer", scale: 2.7, collider: false },
  {
    x: 245,
    y: 246,
    texture: "chair-back",
    scale: 2.6,
    depthOffset: -38,
    collisionBox: chairCollision,
  },
  {
    x: 405,
    y: 170,
    texture: "desk",
    scale: 3.2,
    collisionBox: deskCollision,
  },
  { x: 405, y: 149, texture: "computer", scale: 2.7, collider: false },
  {
    x: 405,
    y: 246,
    texture: "chair-back",
    scale: 2.6,
    depthOffset: -38,
    collisionBox: chairCollision,
  },
  {
    x: 565,
    y: 170,
    texture: "desk",
    scale: 3.2,
    collisionBox: deskCollision,
  },
  { x: 565, y: 149, texture: "computer", scale: 2.7, collider: false },
  {
    x: 565,
    y: 246,
    texture: "chair-back",
    scale: 2.6,
    depthOffset: -38,
    collisionBox: chairCollision,
  },
  { x: 855, y: 125, texture: "whiteboard", scale: 3, collider: false },
  { x: 955, y: 112, texture: "large-painting", scale: 3, collider: false },
  { x: 1020, y: 112, texture: "small-painting", scale: 3, collider: false },
  { x: 790, y: 112, texture: "clock", scale: 2.8, collider: false },
  {
    x: 825,
    y: 188,
    texture: "bin",
    scale: 2.6,
    collisionBox: { width: 28, height: 28, offsetY: 4 },
  },
  {
    x: 1000,
    y: 238,
    texture: "small-table",
    scale: 3,
    collisionBox: { width: 54, height: 35, offsetY: 8 },
  },
  { x: 980, y: 207, texture: "coffee", scale: 2.8, collider: false },
  {
    x: 1035,
    y: 210,
    texture: "cactus",
    scale: 2.6,
    collisionBox: { width: 28, height: 22, offsetY: 10 },
  },
  {
    x: 1000,
    y: 178,
    texture: "cushioned-chair-back",
    scale: 3,
    collisionBox: chairCollision,
  },
  {
    x: 1000,
    y: 302,
    texture: "cushioned-chair-front",
    scale: 3,
    collisionBox: chairCollision,
  },
  {
    x: 430,
    y: 465,
    texture: "meeting-table",
    scale: 3,
    collisionBox: { width: 122, height: 72, offsetY: 4 },
  },
  {
    x: 560,
    y: 465,
    texture: "meeting-table",
    scale: 3,
    collisionBox: { width: 122, height: 72, offsetY: 4 },
  },
  {
    x: 430,
    y: 365,
    texture: "cushioned-chair-back",
    scale: 3,
    collisionBox: chairCollision,
  },
  {
    x: 560,
    y: 365,
    texture: "cushioned-chair-back",
    scale: 3,
    collisionBox: chairCollision,
  },
  {
    x: 430,
    y: 565,
    texture: "cushioned-chair-front",
    scale: 3,
    collisionBox: chairCollision,
  },
  {
    x: 560,
    y: 565,
    texture: "cushioned-chair-front",
    scale: 3,
    collisionBox: chairCollision,
  },
  {
    x: 88,
    y: 475,
    texture: "double-bookshelf",
    scale: 3.2,
    collisionBox: { width: 68, height: 34, offsetY: 5 },
  },
  {
    x: 88,
    y: 522,
    texture: "double-bookshelf",
    scale: 3.2,
    collisionBox: { width: 68, height: 34, offsetY: 5 },
  },
  {
    x: 88,
    y: 570,
    texture: "bookshelf",
    scale: 3,
    collisionBox: { width: 64, height: 32, offsetY: 5 },
  },
  {
    x: 775,
    y: 570,
    texture: "sofa",
    scale: 3,
    collisionBox: { width: 92, height: 34, offsetY: 8 },
  },
  {
    x: 905,
    y: 570,
    texture: "sofa",
    scale: 3,
    collisionBox: { width: 92, height: 34, offsetY: 8 },
  },
  {
    x: 840,
    y: 495,
    texture: "coffee-table",
    scale: 2.8,
    collisionBox: { width: 82, height: 38, offsetY: 5 },
  },
  {
    x: 760,
    y: 484,
    texture: "chair-back",
    scale: 2.6,
    collisionBox: chairCollision,
  },
  {
    x: 920,
    y: 484,
    texture: "chair-back",
    scale: 2.6,
    collisionBox: chairCollision,
  },
  {
    x: 1050,
    y: 550,
    texture: "bookshelf",
    scale: 3.2,
    collisionBox: { width: 68, height: 34, offsetY: 5 },
  },
  {
    x: 104,
    y: 132,
    texture: "large-plant",
    scale: 2.8,
    collisionBox: { width: 34, height: 28, offsetY: 16 },
  },
  {
    x: 1100,
    y: 135,
    texture: "plant",
    scale: 3,
    collisionBox: { width: 30, height: 24, offsetY: 15 },
  },
  {
    x: 1090,
    y: 610,
    texture: "bin",
    scale: 2.6,
    collisionBox: { width: 28, height: 28, offsetY: 4 },
  },
];

export const INTERN_WORKSTATION_PROPS: OfficePropPlacement[] = [
  {
    x: INTERN_WORKSTATION.x,
    y: INTERN_WORKSTATION.y - 24,
    texture: "desk",
    scale: 3.2,
    collisionBox: deskCollision,
  },
  {
    x: INTERN_WORKSTATION.x,
    y: INTERN_WORKSTATION.y - 46,
    texture: "computer",
    scale: 2.9,
    collider: false,
  },
  {
    x: INTERN_WORKSTATION.x,
    y: INTERN_WORKSTATION.y + 45,
    texture: "chair-back",
    scale: 2.8,
    depthOffset: -38,
    collisionBox: chairCollision,
  },
];

export const SEATED_NPCS: AmbientNpcPlacement[] = [
  {
    id: "f01:traffic-analyst",
    x: 245,
    y: 226,
    texture: "ambient-1",
    frame: 7,
    animationKey: null,
    behavior: { kind: "desk" },
  },
  {
    id: "f01:platform-engineer",
    x: 405,
    y: 226,
    texture: "ambient-3",
    frame: 7,
    animationKey: null,
    behavior: { kind: "desk" },
  },
  {
    id: "f01:incident-commander",
    x: 565,
    y: 226,
    texture: "ambient-4",
    frame: 7,
    animationKey: null,
    behavior: { kind: "desk" },
  },
];

export interface RoamingNpcPlan {
  id: string;
  x: number;
  y: number;
  texture: string;
  toX: number;
  toY: number;
  durationMs: number;
}

export const ROAMING_NPCS: RoamingNpcPlan[] = [
  {
    id: "f01:responder-jules",
    x: 720,
    y: 280,
    texture: "ambient-5",
    toX: 680,
    toY: 450,
    durationMs: 2500,
  },
  {
    id: "f01:facilities-finn",
    x: 1010,
    y: 340,
    texture: "player",
    toX: 1060,
    toY: 520,
    durationMs: 2700,
  },
  {
    id: "f01:designer-drew",
    x: 680,
    y: 555,
    texture: "ambient-3",
    toX: 735,
    toY: 490,
    durationMs: 2200,
  },
];

export const isDialogueOutOfRange = (
  dialogueOpen: boolean,
  distance: number,
): boolean => dialogueOpen && distance > DIALOGUE_DISMISS_DISTANCE;
