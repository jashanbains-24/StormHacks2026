import type { FloorContext } from "../../../core/contracts";
import {
  CACHE_MARKERS_EVENT,
  CELEBRATE_EVENT,
  DB_FLASH_EVENT,
  getCacheMarkers,
  getIncidentVisualState,
  INCIDENT_VISUAL_EVENT,
  type IncidentVisualState,
} from "./incidentVisualState";

interface StalePriceEffectsHandle {
  destroy(): void;
}

const COLORS = {
  blue: 0x5f9fba,
  orange: 0xd58a55,
  green: 0x6fa878,
  red: 0xb94e48,
  amber: 0xd69e2e,
  panel: 0x151c25,
  white: 0xf3f0e8,
} as const;

const RACK_COLUMNS = [445, 550, 655, 760] as const;
const RACK_ROWS = [310, 500] as const;

interface RoomStyle {
  db: number;
  dbBlink: number;
  bars: "critical" | "mixed" | "calm";
  racks: "critical" | "mixed" | "calm";
  conveyor: number;
  flowSpeed: number;
  arrowGap: number;
  orange: "dim" | "flash";
  green: "dim" | "glow";
  alarm: number;
  packetCount: number;
  packetMs: number;
  towardDb: boolean;
}

const styleFor = (state: IncidentVisualState): RoomStyle => {
  if (state === "resolved") {
    return {
      db: COLORS.green,
      dbBlink: 1100,
      bars: "calm",
      racks: "calm",
      conveyor: COLORS.green,
      flowSpeed: 0.35,
      arrowGap: 92,
      orange: "dim",
      green: "glow",
      alarm: 0,
      packetCount: 2,
      packetMs: 4800,
      towardDb: false,
    };
  }
  if (state === "warming") {
    return {
      db: COLORS.amber,
      dbBlink: 520,
      bars: "mixed",
      racks: "mixed",
      conveyor: COLORS.amber,
      flowSpeed: 0.7,
      arrowGap: 74,
      orange: "dim",
      green: "glow",
      alarm: 0.006,
      packetCount: 4,
      packetMs: 3000,
      towardDb: false,
    };
  }
  if (state === "localMismatch") {
    return {
      db: COLORS.red,
      dbBlink: 180,
      bars: "critical",
      racks: "critical",
      conveyor: COLORS.red,
      flowSpeed: 2.2,
      arrowGap: 48,
      orange: "flash",
      green: "dim",
      alarm: 0.02,
      packetCount: 8,
      packetMs: 1400,
      towardDb: true,
    };
  }
  return {
    db: COLORS.red,
    dbBlink: 180,
    bars: "critical",
    racks: "critical",
    conveyor: COLORS.orange,
    flowSpeed: 2.1,
    arrowGap: 48,
    orange: "dim",
    green: "dim",
    alarm: 0.016,
    packetCount: 8,
    packetMs: 1500,
    towardDb: true,
  };
};

const barHeight = (kind: RoomStyle["bars"], index: number): number => {
  if (kind === "critical") return 18 + (index % 3) * 4;
  if (kind === "mixed") return 8 + (index % 4) * 4;
  return 6 + (index % 2) * 2;
};

const barColor = (kind: RoomStyle["bars"], index: number): number => {
  if (kind === "calm") return COLORS.green;
  if (kind === "critical") return index % 2 === 0 ? COLORS.red : COLORS.orange;
  return index % 3 === 0 ? COLORS.amber : COLORS.green;
};

const rackColor = (kind: RoomStyle["racks"], index: number): number => {
  if (kind === "critical") return index % 3 === 2 ? COLORS.amber : COLORS.red;
  if (kind === "mixed") return index % 5 === 0 ? COLORS.amber : COLORS.green;
  return index % 8 === 0 ? COLORS.amber : COLORS.green;
};

const createAlarm = (
  isMuted: () => boolean,
): {
  setLevel: (level: number) => void;
  destroy: () => void;
} => {
  let context: AudioContext | undefined;
  let oscillator: OscillatorNode | undefined;
  let gain: GainNode | undefined;

  const stop = (): void => {
    if (!context || !oscillator || !gain) return;
    const now = context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.25);
    oscillator.stop(now + 0.3);
    oscillator = undefined;
    gain = undefined;
  };

  return {
    setLevel: (level: number) => {
      if (level <= 0 || isMuted() || typeof window === "undefined") {
        stop();
        return;
      }
      context ??= new AudioContext();
      void context.resume();
      if (!oscillator || !gain) {
        oscillator = context.createOscillator();
        gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 96;
        gain.gain.value = 0.0001;
        oscillator.connect(gain).connect(context.destination);
        oscillator.start();
      }
      const now = context.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.linearRampToValueAtTime(level, now + 0.35);
    },
    destroy: stop,
  };
};

export const createStalePriceEffects = (
  ctx: FloorContext,
): StalePriceEffectsHandle => {
  const moving = !ctx.preferences.reducedMotion;
  const alarm = createAlarm(() => ctx.preferences.muted);
  const flow = ctx.scene.add.graphics().setDepth(20);
  const dbLights = [0, 1, 2, 3, 4, 5].map((index) =>
    ctx.scene.add
      .rectangle(151 + index * 39, 254, 9, 6, COLORS.red)
      .setDepth(273),
  );
  const rackLights = RACK_ROWS.flatMap((rackY) =>
    RACK_COLUMNS.flatMap((rackX) =>
      [0, 1, 2, 3, 4].map((panel) =>
        ctx.scene.add
          .rectangle(rackX + 13.5, rackY - 31.5 + panel * 15, 3, 3, COLORS.red)
          .setDepth(rackY + 50),
      ),
    ),
  );
  const screenCovers = [0, 1, 2, 3].map((screen) =>
    ctx.scene.add
      .rectangle(399 + screen * 108, 164, 84, 32, COLORS.panel)
      .setDepth(219),
  );
  const bars = [0, 1, 2, 3].flatMap((screen) =>
    [0, 1, 2, 3, 4, 5].map((bar) =>
      ctx.scene.add
        .rectangle(408 + screen * 108 + bar * 12, 178, 6, 8, COLORS.red)
        .setOrigin(0.5, 1)
        .setDepth(220),
    ),
  );
  const cacheNodes = [
    { x: 896, y: 287, kind: "orange" as const },
    { x: 1006, y: 287, kind: "orange" as const },
    { x: 896, y: 492, kind: "green" as const },
    { x: 1006, y: 492, kind: "green" as const },
  ];
  const dimmers = cacheNodes.map((node) =>
    ctx.scene.add
      .rectangle(node.x, node.y, 72, 54, 0x080b10, 0.62)
      .setDepth(node.y + 40),
  );
  const glows = cacheNodes.map((node) =>
    ctx.scene.add
      .rectangle(
        node.x,
        node.y,
        82,
        64,
        node.kind === "orange" ? COLORS.orange : COLORS.green,
        0.12,
      )
      .setStrokeStyle(4, node.kind === "orange" ? COLORS.orange : COLORS.green)
      .setDepth(node.y + 41)
      .setVisible(false),
  );
  const markers = cacheNodes.map((node) =>
    ctx.scene.add
      .text(node.x, node.y - 42, "?", {
        color: "#1f2933",
        backgroundColor: "#fffbeb",
        fontFamily: ctx.theme.fonts.family,
        fontSize: "18px",
        fontStyle: "bold",
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(560)
      .setVisible(false),
  );
  const mismatch = ctx.scene.add
    .text(951, 329, "✖  OUT OF SYNC", {
      color: "#f3f0e8",
      backgroundColor: "#b94e48",
      fontFamily: ctx.theme.fonts.mono,
      fontSize: "12px",
      fontStyle: "bold",
      padding: { x: 7, y: 4 },
    })
    .setOrigin(0.5)
    .setDepth(561)
    .setVisible(false);
  const queryFlash = ctx.scene.add
    .rectangle(216, 222, 260, 104, COLORS.red, 0.28)
    .setStrokeStyle(4, COLORS.red)
    .setDepth(280)
    .setVisible(false);
  const packets = Array.from({ length: 8 }, () =>
    ctx.scene.add.rectangle(420, 228, 8, 4, COLORS.orange).setDepth(241),
  );

  let style = styleFor(getIncidentVisualState(ctx));
  let showMarkers = getCacheMarkers(ctx);
  let phase = 0;
  let alive = true;
  let stateTweens: Array<{ destroy: () => void }> = [];

  const clearTweens = (): void => {
    stateTweens.forEach((tween) => tween.destroy());
    stateTweens = [];
    ctx.scene.tweens.killTweensOf([
      ...dbLights,
      ...glows,
      ...packets,
      queryFlash,
      ...bars,
    ]);
  };

  const drawConveyor = (): void => {
    flow.clear();
    flow.fillStyle(0x111923, 0.72);
    flow.fillRect(350, 387, 505, 30);
    flow.lineStyle(2, style.conveyor, 0.85);
    flow.strokeRect(350, 387, 505, 30);
    const gap = style.arrowGap;
    const offset = moving ? phase % gap : 0;
    for (let x = 820 - offset; x >= 390; x -= gap) {
      flow.fillStyle(style.conveyor, 0.95);
      flow.fillRect(x, 399, 22, 6);
      flow.fillTriangle(x, 393, x - 12, 402, x, 411);
    }
  };

  const paintDevices = (): void => {
    dbLights.forEach((light) => light.setFillStyle(style.db).setAlpha(1));
    rackLights.forEach((light, index) =>
      light.setFillStyle(rackColor(style.racks, index)).setAlpha(1),
    );
    bars.forEach((bar, index) => {
      const height = barHeight(style.bars, index);
      bar
        .setFillStyle(barColor(style.bars, index))
        .setSize(6, height)
        .setAlpha(1);
    });
    cacheNodes.forEach((node, index) => {
      const active =
        (node.kind === "orange" && style.orange === "flash") ||
        (node.kind === "green" && style.green === "glow");
      dimmers[index].setAlpha(active ? 0.08 : 0.66);
      glows[index].setVisible(active).setAlpha(1);
    });
    markers.forEach((marker) => marker.setVisible(showMarkers));
    mismatch.setVisible(style.orange === "flash");
    drawConveyor();
  };

  const restartMotion = (): void => {
    clearTweens();
    packets.forEach((packet, index) => {
      const visible = index < style.packetCount;
      packet.setVisible(visible);
      packet.setFillStyle(style.towardDb ? COLORS.orange : COLORS.green);
      if (!visible) return;
      const from = style.towardDb ? 1040 : 390;
      const to = style.towardDb ? 390 : 1040;
      packet.setPosition(from - index * 40, 228);
      if (!moving) return;
      stateTweens.push(
        ctx.scene.tweens.add({
          targets: packet,
          x: to,
          duration: style.packetMs,
          delay: index * 180,
          repeat: -1,
        }),
      );
    });

    if (!moving) return;

    stateTweens.push(
      ctx.scene.tweens.add({
        targets: dbLights,
        alpha: { from: 0.25, to: 1 },
        duration: style.dbBlink,
        yoyo: true,
        repeat: -1,
      }),
    );

    if (style.orange === "flash") {
      glows.forEach((glow, index) => {
        if (cacheNodes[index].kind !== "orange") return;
        stateTweens.push(
          ctx.scene.tweens.add({
            targets: glow,
            alpha: { from: 0.15, to: 1 },
            duration: index === 0 ? 280 : 460,
            yoyo: true,
            repeat: -1,
          }),
        );
      });
    }

    if (style.green === "glow") {
      glows.forEach((glow, index) => {
        if (cacheNodes[index].kind !== "green") return;
        stateTweens.push(
          ctx.scene.tweens.add({
            targets: glow,
            alpha: { from: 0.35, to: 1 },
            duration: style.dbBlink,
            yoyo: true,
            repeat: -1,
          }),
        );
      });
    }
  };

  const applyVisualState = (state: IncidentVisualState): void => {
    style = styleFor(state);
    paintDevices();
    restartMotion();
    alarm.setLevel(style.alarm);
  };

  const applyMarkers = (visible: boolean): void => {
    showMarkers = visible;
    markers.forEach((marker) => marker.setVisible(visible));
  };

  const flashDatabase = (): void => {
    if (!moving) return;
    queryFlash.setVisible(true).setAlpha(0.85);
    ctx.scene.tweens.add({
      targets: queryFlash,
      alpha: 0,
      duration: 220,
      yoyo: true,
      repeat: 3,
      onComplete: () => queryFlash.setVisible(false),
    });
  };

  const celebrate = (): void => {
    if (!moving) return;
    ctx.scene.tweens.add({
      targets: bars,
      alpha: { from: 0.2, to: 1 },
      duration: 180,
      yoyo: true,
      repeat: 2,
    });
  };

  applyVisualState(getIncidentVisualState(ctx));
  applyMarkers(showMarkers);
  ctx.scene.events.on(INCIDENT_VISUAL_EVENT, applyVisualState);
  ctx.scene.events.on(CACHE_MARKERS_EVENT, applyMarkers);
  ctx.scene.events.on(DB_FLASH_EVENT, flashDatabase);
  ctx.scene.events.on(CELEBRATE_EVENT, celebrate);

  let alarmSilenced = ctx.preferences.muted;
  const tick = (): void => {
    if (!alive) return;
    const muted = ctx.preferences.muted;
    if (muted && !alarmSilenced) {
      alarm.setLevel(0);
      alarmSilenced = true;
    } else if (!muted && alarmSilenced) {
      alarm.setLevel(style.alarm);
      alarmSilenced = false;
    }
    if (!moving) return;
    phase += style.flowSpeed * 2.4;
    drawConveyor();
  };
  ctx.addUpdater(tick);

  const destroy = (): void => {
    alive = false;
    ctx.scene.events.off(INCIDENT_VISUAL_EVENT, applyVisualState);
    ctx.scene.events.off(CACHE_MARKERS_EVENT, applyMarkers);
    ctx.scene.events.off(DB_FLASH_EVENT, flashDatabase);
    ctx.scene.events.off(CELEBRATE_EVENT, celebrate);
    clearTweens();
    alarm.destroy();
    flow.destroy();
    dbLights.forEach((light) => light.destroy());
    rackLights.forEach((light) => light.destroy());
    screenCovers.forEach((cover) => cover.destroy());
    bars.forEach((bar) => bar.destroy());
    dimmers.forEach((dimmer) => dimmer.destroy());
    glows.forEach((glow) => glow.destroy());
    markers.forEach((marker) => marker.destroy());
    mismatch.destroy();
    queryFlash.destroy();
    packets.forEach((packet) => packet.destroy());
  };
  ctx.scene.events.once("shutdown", destroy);

  return { destroy };
};
