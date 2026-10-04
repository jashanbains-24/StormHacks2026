import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  floorResults: {} as Record<number, { quality: string }>,
  canonicalThisSession: false,
  speech: vi.fn(),
}));

vi.mock("phaser", async () => {
  const { default: EventEmitter } = await import("eventemitter3");
  class Text extends EventEmitter {
    text: string;
    visible = true;
    constructor(text: string) {
      super();
      this.text = text;
    }
    setText(text: string) {
      this.text = text;
      return this;
    }
    setVisible(visible: boolean) {
      this.visible = visible;
      return this;
    }
    setOrigin() {
      return this;
    }
    setDepth() {
      return this;
    }
    setInteractive() {
      return this;
    }
  }
  return {
    default: {
      Events: { EventEmitter },
      Scenes: { Events: { SHUTDOWN: "shutdown" } },
      Scene: class {
        add = { text: vi.fn((_x, _y, text: string) => new Text(text)) };
        events = new EventEmitter();
        input = { keyboard: new EventEmitter() };
        time = { delayedCall: vi.fn() };
        scene = {
          isActive: vi.fn(() => false),
          stop: vi.fn(),
          launch: vi.fn(),
          pause: vi.fn(),
          bringToTop: vi.fn(),
        };
      },
    },
  };
});
vi.mock("../../src/core/runtime/floorRegistry", async () => {
  const { content } =
    await import("../../src/floors/floor-00-tutorial/definition/content");
  return {
    getFloorByOrder: (order: number) => ({
      order,
      module: { title: `Floor ${order}`, definition: { content } },
    }),
    getFloorById: () => ({ order: 0 }),
    getNextFloor: () => undefined,
  };
});
vi.mock("../../src/state/progression", () => ({
  progression: {
    snapshot: state,
    wasCanonicallyCompletedThisSession: () => state.canonicalThisSession,
  },
}));
vi.mock("../../src/state/preferences", () => ({
  preferences: { snapshot: { muted: true } },
}));
vi.mock("../../src/systems/AudioSystem", () => ({
  audio: { playClick: vi.fn() },
}));
vi.mock("../../src/ui/SpeechBubble", () => ({
  SpeechBubble: class {
    constructor(...args: unknown[]) {
      state.speech(...args);
    }
    destroy() {}
  },
}));
vi.mock("../../src/ui/Notification", () => ({
  Notification: class {
    dismiss() {}
  },
}));
vi.mock("../../src/ui/GlossaryPopup", () => ({ GlossaryPopup: class {} }));

import { UIScene } from "../../src/scenes/UIScene";
import { gameEvents } from "../../src/systems/EventBus";

describe("onboarding HUD lifecycle", () => {
  beforeEach(() => {
    gameEvents.removeAllListeners();
    state.floorResults = {};
    state.canonicalThisSession = false;
    vi.clearAllMocks();
  });

  it("preserves the completed lobby when the form closes", () => {
    const ui = new UIScene();
    ui.create();
    gameEvents.emit("floor:changed", 0);
    gameEvents.emit("dialogue:dismiss");
    state.floorResults[0] = { quality: "canonical" };
    gameEvents.emit("progression:updated");
    gameEvents.emit("tutorial:completed", "Recruit");
    gameEvents.emit("build:closed");

    expect(ui.scene.stop).not.toHaveBeenCalled();
    expect(ui.scene.launch).not.toHaveBeenCalled();
    expect(state.speech).toHaveBeenCalledOnce();
  });

  it("shows the welcome once per game, including return visits", () => {
    const ui = new UIScene();
    ui.create();
    gameEvents.emit("floor:changed", 0);
    gameEvents.emit("floor:changed", 1);
    gameEvents.emit("floor:changed", 0);
    expect(state.speech).toHaveBeenCalledOnce();

    ui.events.emit("shutdown");
    ui.create();
    gameEvents.emit("floor:changed", 0);
    expect(state.speech).toHaveBeenCalledTimes(2);
  });

  it("still refreshes Floor 1 after its canonical resolution", () => {
    const ui = new UIScene();
    ui.create();
    gameEvents.emit("floor:changed", 1);
    state.canonicalThisSession = true;
    gameEvents.emit("build:closed");

    expect(ui.scene.stop).toHaveBeenCalledWith("FloorScene");
    expect(ui.scene.launch).toHaveBeenCalledWith("FloorScene", { floor: 1 });
  });
});
