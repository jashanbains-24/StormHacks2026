import { describe, expect, it, vi } from "vitest";
import EventEmitter from "eventemitter3";
import type { FloorContext } from "../../src/core/contracts";
import { createEmergencyEffects } from "../../src/core/ui-kit/emergency";
import type { EmergencyStaff } from "../../src/core/ui-kit/emergencyStaff";
import { emergencyModeFor } from "../../src/floors/floor-02-storage/view/effects";
import { THEME } from "../../src/config/theme";

class DisplayObject {
  active = true;
  children: DisplayObject[] = [];
  x = 100;
  y = 600;
  text = "";
  setDepth() {
    return this;
  }
  setBlendMode() {
    return this;
  }
  setOrigin() {
    return this;
  }
  setScrollFactor() {
    return this;
  }
  setStrokeStyle() {
    return this;
  }
  setAngle = vi.fn(() => this);
  setVelocity = vi.fn(() => this);
  setPosition = vi.fn(() => this);
  add(children: DisplayObject[]) {
    this.children.push(...children);
    return this;
  }
  destroy() {
    this.active = false;
    this.children.forEach((child) => child.destroy());
  }
}

const fixture = (reducedMotion = false) => {
  const objects: DisplayObject[] = [];
  const tweens: (EventEmitter & { destroy: ReturnType<typeof vi.fn> })[] = [];
  const timers: { callback: () => void; remove: ReturnType<typeof vi.fn> }[] =
    [];
  const updaters: (() => void)[] = [];
  const make = () => {
    const obj = new DisplayObject();
    objects.push(obj);
    return obj;
  };
  const events = new EventEmitter();
  const gameEvents = new EventEmitter();
  const camera = { shake: vi.fn(), shakeEffect: { reset: vi.fn() } };
  const ctx = {
    theme: THEME,
    preferences: { reducedMotion },
    preview: { enabled: false, state: "calm" },
    scene: {
      events,
      game: { events: gameEvents },
      scale: { width: 1280, height: 720 },
      cameras: { main: camera },
      add: {
        rectangle: make,
        circle: make,
        ellipse: make,
        container: (_x: number, _y: number, children: DisplayObject[] = []) =>
          make().add(children),
        text: (_x: number, _y: number, text: string) => {
          const obj = make();
          obj.text = text;
          return obj;
        },
      },
      tweens: {
        add: () => {
          const tween = Object.assign(new EventEmitter(), { destroy: vi.fn() });
          tweens.push(tween);
          return tween;
        },
      },
      time: {
        now: 0,
        addEvent: ({ callback }: { callback: () => void }) => {
          const timer = { callback, remove: vi.fn() };
          timers.push(timer);
          return timer;
        },
      },
    },
    addUpdater: (update: () => void) => updaters.push(update),
  } as unknown as FloorContext;
  const npc = new DisplayObject();
  const staff = [
    {
      npc,
      plan: {
        toX: 200,
        toY: 630,
        durationMs: 2500,
        panicBounds: { x: 100, y: 600, width: 200, height: 40 },
      },
    },
  ] as unknown as EmergencyStaff[];
  return {
    ctx,
    npc,
    staff,
    objects,
    tweens,
    timers,
    updaters,
    events,
    gameEvents,
    camera,
  };
};

describe("shared emergency presentation", () => {
  it("follows storage incident states and explicit preview overrides", () => {
    const game = { enabled: false, state: "calm" } as const;
    for (const state of ["critical", "localMismatch", "warming"] as const)
      expect(emergencyModeFor(state, game)).toBe("emergency");
    expect(emergencyModeFor("resolved", game)).toBe("resolved");
    expect(
      emergencyModeFor("critical", { enabled: true, state: "fixed" }),
    ).toBe("resolved");
    expect(emergencyModeFor("resolved", { enabled: true, state: "down" })).toBe(
      "emergency",
    );
  });

  it("stops panic motion, markers, shake timers, and old effects when resolving", () => {
    const f = fixture();
    const effects = createEmergencyEffects(f.ctx, f.staff, "emergency");
    f.updaters.forEach((update) => update());
    expect(f.npc.setVelocity).toHaveBeenCalled();
    const initialObjects = [...f.objects];
    const initialTweens = [...f.tweens];
    const initialTimers = [...f.timers];
    effects.setMode("emergency");
    expect(f.objects).toHaveLength(initialObjects.length);
    expect(f.objects.some((obj) => obj.active && obj.text === "!!")).toBe(true);
    effects.setMode("resolved");
    expect(initialObjects.every((obj) => !obj.active)).toBe(true);
    expect(
      initialTweens.every((tween) => tween.destroy.mock.calls.length === 1),
    ).toBe(true);
    expect(
      initialTimers.every((timer) => timer.remove.mock.calls.length === 1),
    ).toBe(true);
    expect(f.npc.setVelocity).toHaveBeenLastCalledWith(0, 0);
    f.npc.setVelocity.mockClear();
    f.updaters.forEach((update) => update());
    expect(f.npc.setVelocity).not.toHaveBeenCalled();
    expect(f.objects.some((obj) => obj.active && obj.text === "!!")).toBe(
      false,
    );
    expect(f.npc.active).toBe(true);
    f.events.emit("shutdown");
    const count = f.objects.length;
    effects.setMode("emergency");
    effects.destroy();
    expect(f.objects).toHaveLength(count);
    expect(f.objects.every((obj) => !obj.active)).toBe(true);
    expect(f.gameEvents.listenerCount("ui:modal-opened")).toBe(0);
  });

  it("keeps puzzle panels still while multiple modals are open", () => {
    const f = fixture();
    const effects = createEmergencyEffects(f.ctx, f.staff, "emergency");
    const pulse = f.timers[1].callback;
    pulse();
    expect(f.camera.shake).toHaveBeenCalledOnce();
    const first = {},
      second = {};
    f.gameEvents.emit("ui:modal-opened", first);
    f.gameEvents.emit("ui:modal-opened", second);
    pulse();
    f.gameEvents.emit("ui:modal-closed", first);
    pulse();
    expect(f.camera.shake).toHaveBeenCalledOnce();
    f.gameEvents.emit("ui:modal-closed", second);
    pulse();
    expect(f.camera.shake).toHaveBeenCalledTimes(2);
    effects.destroy();
  });

  it("shows static warning markers without flashing, shake, or running for reduced motion", () => {
    const f = fixture(true);
    const effects = createEmergencyEffects(f.ctx, f.staff, "emergency");
    expect(f.timers).toHaveLength(0);
    expect(f.tweens).toHaveLength(0);
    expect(f.objects.some((obj) => obj.active && obj.text === "!")).toBe(true);
    effects.setMode("resolved");
    expect(f.objects.some((obj) => obj.active && obj.text === "!")).toBe(false);
    expect(f.camera.shake).not.toHaveBeenCalled();
    effects.destroy();
  });
});
