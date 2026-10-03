export interface OfficePropPlacement {
  x: number;
  y: number;
  texture: "desk" | "computer" | "bookshelf" | "plant" | "sofa";
  scale?: number;
  collider?: boolean;
}

export interface AmbientNpcPlacement {
  id: string;
  x: number;
  y: number;
  frame: number;
  tint: number;
  flipX?: boolean;
}

export const OFFICE_PROPS: OfficePropPlacement[] = [
  { x: 275, y: 180, texture: "desk" },
  { x: 275, y: 159, texture: "computer", scale: 2.5, collider: false },
  { x: 445, y: 180, texture: "desk" },
  { x: 445, y: 159, texture: "computer", scale: 2.5, collider: false },
  { x: 615, y: 180, texture: "desk" },
  { x: 615, y: 159, texture: "computer", scale: 2.5, collider: false },
  { x: 760, y: 558, texture: "sofa" },
  { x: 880, y: 558, texture: "sofa" },
  { x: 1010, y: 550, texture: "bookshelf" },
  { x: 104, y: 132, texture: "plant" },
  { x: 1115, y: 132, texture: "plant" },
];

const sharedOfficeNpcs: AmbientNpcPlacement[] = [
  { id: "accounting-ava", x: 420, y: 330, frame: 0, tint: 0xe8b4b8 },
  {
    id: "support-milo",
    x: 600,
    y: 360,
    frame: 14,
    tint: 0xa8d8ea,
    flipX: true,
  },
  { id: "product-sam", x: 725, y: 455, frame: 7, tint: 0xf4d35e },
  {
    id: "legal-noor",
    x: 930,
    y: 345,
    frame: 14,
    tint: 0xb8e0d2,
  },
];

export const AMBIENT_NPCS_BY_FLOOR: Record<number, AmbientNpcPlacement[]> = {
  0: sharedOfficeNpcs,
  1: [
    ...sharedOfficeNpcs,
    {
      id: "support-jules",
      x: 845,
      y: 475,
      frame: 0,
      tint: 0xd4a5ff,
      flipX: true,
    },
  ],
  2: [
    { id: "database-dev", x: 420, y: 470, frame: 7, tint: 0xa8d8ea },
    {
      id: "cache-casey",
      x: 940,
      y: 470,
      frame: 14,
      tint: 0xf4d35e,
      flipX: true,
    },
  ],
};
