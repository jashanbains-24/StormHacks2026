/** Ambient routes stay clear of equipment and the three quest specialists. */
export const STAFF = [
  {
    id: "f02-maintenance-tech",
    texture: "ambient-3",
    x: 248,
    y: 646,
    toX: 350,
    toY: 606,
    durationMs: 2500,
    panicBounds: { x: 130, y: 560, width: 270, height: 85 },
  },
  {
    id: "f02-cache-operator",
    texture: "ambient-1",
    x: 1188,
    y: 620,
    toX: 1000,
    toY: 600,
    durationMs: 2700,
    panicBounds: { x: 930, y: 580, width: 250, height: 65 },
  },
  {
    id: "f02-incident-responder",
    texture: "player",
    x: 740,
    y: 610,
    toX: 680,
    toY: 638,
    durationMs: 2200,
    panicBounds: { x: 640, y: 580, width: 210, height: 65 },
  },
] as const;
