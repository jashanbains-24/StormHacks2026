import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  statuses: new Map<string, string>(),
  panelEntries: [] as { id: string }[],
  destroyedPanels: 0,
}));

vi.mock("phaser", async () => {
  const { default: EventEmitter } = await import("eventemitter3");
  class Text extends EventEmitter {
    constructor(public text: string) {
      super();
    }
    setInteractive() {
      return this;
    }
    setText(text: string) {
      this.text = text;
      return this;
    }
  }
  return {
    default: {
      Events: { EventEmitter },
      Scenes: { Events: { SHUTDOWN: "shutdown" } },
      Scene: class {
        sys = { settings: { key: "GlossaryScene" } };
        game = { events: new EventEmitter() };
        events = new EventEmitter();
        input = { keyboard: new EventEmitter() };
        add = { text: vi.fn((_x, _y, text: string) => new Text(text)) };
        scene = {
          manager: {
            getScenes: () => [
              this,
              ...[...state.statuses]
                .filter(([, status]) => status === "active")
                .map(([key]) => ({ sys: { settings: { key } } })),
            ],
          },
          bringToTop: vi.fn(),
          pause: vi.fn((key: string) => state.statuses.set(key, "paused")),
          isPaused: (key: string) => state.statuses.get(key) === "paused",
          resume: vi.fn((key: string) => state.statuses.set(key, "active")),
        };
      },
    },
  };
});
vi.mock("../../src/core/runtime/floorRegistry", () => ({
  getFloors: () =>
    [1, 2].map((order) => ({
      order,
      module: {
        definition: {
          content: {
            glossary: [
              {
                id: `f0${order}.term`,
                term: `Term ${order}`,
                definition: "Definition",
              },
            ],
          },
        },
      },
    })),
}));
vi.mock("../../src/core/ui-kit/terms", () => ({ dismissTermCard: vi.fn() }));
vi.mock("../../src/ui/GlossaryPanel", () => ({
  GlossaryPanel: class {
    setEntries(entries: typeof state.panelEntries) {
      state.panelEntries = entries;
    }
    destroy() {
      state.destroyedPanels++;
    }
  },
}));

import { GlossaryScene } from "../../src/scenes/GlossaryScene";
import { glossaryStore } from "../../src/state/glossary";
import { gameEvents } from "../../src/systems/EventBus";

const fixture = () => {
  const scene = new GlossaryScene();
  scene.create();
  const button = (
    scene as unknown as { button: { text: string; emit(event: string): void } }
  ).button;
  return { scene, button };
};

describe("persistent glossary overlay", () => {
  beforeEach(() => {
    gameEvents.removeAllListeners();
    glossaryStore.reset();
    state.statuses = new Map([
      ["FloorScene", "paused"],
      ["UIScene", "active"],
      ["BuildScene", "active"],
    ]);
    state.panelEntries = [];
    state.destroyedPanels = 0;
    vi.clearAllMocks();
  });

  it("updates learned history and pauses only active scenes until Escape closes it", () => {
    glossaryStore.markOpened("f01.term");
    const { scene, button } = fixture();
    expect(button.text).toBe("Glossary 1");
    button.emit("pointerup");
    expect(scene.scene.pause).toHaveBeenCalledWith("BuildScene");
    expect(scene.scene.pause).toHaveBeenCalledWith("UIScene");
    expect(scene.scene.pause).not.toHaveBeenCalledWith("FloorScene");
    expect(state.panelEntries.map(({ id }) => id)).toEqual(["f01.term"]);
    glossaryStore.markOpened("f02.term");
    expect(button.text).toBe("Glossary 2");
    expect(state.panelEntries.map(({ id }) => id)).toEqual([
      "f01.term",
      "f02.term",
    ]);
    scene.input.keyboard!.emit("keydown-ESC");
    expect(state.destroyedPanels).toBe(1);
    expect(state.statuses.get("BuildScene")).toBe("active");
    expect(state.statuses.get("UIScene")).toBe("active");
    expect(state.statuses.get("FloorScene")).toBe("paused");
    scene.events.emit("shutdown");
  });

  it("stays above new modals and releases paused scenes and listeners on shutdown", () => {
    state.statuses.set("FloorScene", "active");
    const { scene, button } = fixture();
    const raises = vi.mocked(scene.scene.bringToTop).mock.calls.length;
    scene.game.events.emit("ui:modal-opened", {});
    gameEvents.emit("floor:changed", 2);
    expect(scene.scene.bringToTop).toHaveBeenCalledTimes(raises + 2);
    button.emit("pointerup");
    scene.events.emit("shutdown");
    expect(state.statuses.get("FloorScene")).toBe("active");
    expect(scene.game.events.listenerCount("ui:modal-opened")).toBe(0);
    expect(gameEvents.listenerCount("floor:changed")).toBe(0);
    expect(scene.input.keyboard!.listenerCount("keydown-ESC")).toBe(0);
    const text = button.text;
    glossaryStore.markOpened("f01.term");
    expect(button.text).toBe(text);
  });
});
