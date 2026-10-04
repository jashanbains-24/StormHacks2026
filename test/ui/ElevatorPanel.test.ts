import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("phaser", async () => {
  const { default: EventEmitter } = await import("eventemitter3");
  class Visual extends EventEmitter {
    active = true;
    list: Visual[] = [];
    text: string;
    scene: unknown;
    constructor(text = "") {
      super();
      this.text = text;
    }
    setOrigin() {
      return this;
    }
    setStrokeStyle() {
      return this;
    }
    setInteractive() {
      return this;
    }
    setDepth() {
      return this;
    }
    setColor() {
      return this;
    }
    setText(text: string) {
      this.text = text;
      return this;
    }
    add(children: Visual | Visual[]) {
      this.list.push(...(Array.isArray(children) ? children : [children]));
      return this;
    }
    destroy() {
      if (!this.active) return;
      this.active = false;
      this.emit("destroy");
    }
  }
  return {
    default: {
      Scenes: { Events: { SHUTDOWN: "shutdown" } },
      GameObjects: {
        Events: { DESTROY: "destroy" },
        Container: class extends Visual {
          constructor(scene: unknown) {
            super();
            this.scene = scene;
          }
        },
      },
      Scene: class {
        events = new EventEmitter();
        game = { events: new EventEmitter() };
        input = { keyboard: new EventEmitter() };
        add = {
          existing: vi.fn(),
          text: vi.fn((_x, _y, text: string) => new Visual(text)),
          rectangle: vi.fn(() => new Visual()),
          container: vi.fn(() => new Visual()),
        };
      },
    },
  };
});

import Phaser from "phaser";
import { ElevatorPanel } from "../../src/ui/ElevatorPanel";
import { ProgressionStore } from "../../src/state/progression";

const floors = [
  { order: 0, title: "Ground Floor: Orientation" },
  { order: 1, title: "Floor 1: Traffic Operations" },
  { order: 2, title: "Floor 2: Data Storage / Caching" },
];

function press(
  scene: Phaser.Scene,
  key: string,
  code = "",
  repeat = false,
): void {
  scene.input.keyboard!.emit("keydown", {
    key,
    code,
    repeat,
    preventDefault: vi.fn(),
  });
}

describe("elevator selection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts number and numpad keys but rejects current, unknown, and locked floors", () => {
    const scene = new Phaser.Scene();
    const store = new ProgressionStore();
    const onTravel = vi.fn();
    const panel = new ElevatorPanel(scene, {
      currentFloor: 0,
      floors,
      progression: () => store.snapshot,
      onTravel,
      onClose: vi.fn(),
    });
    for (const digit of ["0", "9", "2"]) {
      press(scene, digit);
      press(scene, "Enter");
    }
    expect(onTravel).not.toHaveBeenCalled();
    press(scene, "End", "Numpad1");
    press(scene, "Enter");
    expect(onTravel).toHaveBeenCalledExactlyOnceWith(1);
    store.completeFloor(1, "canonical", []);
    press(scene, "2");
    press(scene, "Enter");
    expect(onTravel).toHaveBeenCalledOnce();
    store.confirmHandoff(1);
    press(scene, "Enter");
    expect(onTravel).toHaveBeenLastCalledWith(2);
    panel.destroy();
  });

  it("selects with mouse buttons, edits with Backspace, and cleans up on Escape", () => {
    const scene = new Phaser.Scene();
    const onTravel = vi.fn();
    const onClose = vi.fn();
    const store = new ProgressionStore();
    const panel = new ElevatorPanel(scene, {
      currentFloor: 1,
      floors,
      progression: () => store.snapshot,
      onTravel,
      onClose,
    });
    press(scene, "2");
    press(scene, "Backspace");
    press(scene, "Enter");
    expect(onTravel).not.toHaveBeenCalled();
    // Button backgrounds carry pointer handlers; labels remain presentation-only.
    const buttons = panel.list.filter(
      (object) => object.type === "Container" || "list" in object,
    );
    const button = buttons.find((object) =>
      (object as Phaser.GameObjects.Container).list.some(
        (child) =>
          "text" in child && String(child.text).startsWith("0  Ground Floor"),
      ),
    ) as Phaser.GameObjects.Container;
    button.list[0].emit("pointerup");
    press(scene, "Enter");
    expect(onTravel).toHaveBeenCalledExactlyOnceWith(0);
    press(scene, "Escape");
    panel.destroy();
    expect(onClose).toHaveBeenCalledOnce();
    expect(scene.input.keyboard!.listenerCount("keydown")).toBe(0);
    expect(scene.events.listenerCount("shutdown")).toBe(0);
  });

  it("closes on scene shutdown and ignores held Enter repeats", () => {
    const scene = new Phaser.Scene();
    const onTravel = vi.fn();
    const onClose = vi.fn();
    const onModalClosed = vi.fn();
    scene.game.events.on("ui:modal-closed", onModalClosed);
    new ElevatorPanel(scene, {
      currentFloor: 0,
      floors,
      progression: () => new ProgressionStore().snapshot,
      onTravel,
      onClose,
    });
    press(scene, "1");
    press(scene, "Enter", "", true);
    expect(onTravel).not.toHaveBeenCalled();
    scene.events.emit("shutdown");
    expect(onClose).toHaveBeenCalledOnce();
    expect(onModalClosed).toHaveBeenCalledOnce();
    expect(scene.input.keyboard!.listenerCount("keydown")).toBe(0);
  });
});
