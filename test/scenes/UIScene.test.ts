import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  floorResults: {} as Record<number, { quality: string }>,
  canonicalThisSession: false,
  speech: vi.fn(),
  objective: vi.fn(),
  pressedE: false,
  checklistOpen: false,
  checklistEntries: [] as { id: string; completed: boolean }[],
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
  class Keyboard extends EventEmitter {
    addKey() {
      return {};
    }
  }
  const game = { events: new EventEmitter() };
  return {
    default: {
      Events: { EventEmitter },
      Input: {
        Keyboard: {
          KeyCodes: { E: 69 },
          JustDown: () => {
            const pressed = state.pressedE;
            state.pressedE = false;
            return pressed;
          },
        },
      },
      Math: {
        Distance: {
          Between: (x1: number, y1: number, x2: number, y2: number) =>
            Math.hypot(x1 - x2, y1 - y2),
        },
      },
      Scenes: { Events: { SHUTDOWN: "shutdown" } },
      Scene: class {
        game = game;
        add = { text: vi.fn((_x, _y, text: string) => new Text(text)) };
        events = new EventEmitter();
        input = { keyboard: new Keyboard() };
        time = { delayedCall: vi.fn() };
        scene = {
          isActive: vi.fn(() => false),
          stop: vi.fn(),
          launch: vi.fn(),
          pause: vi.fn(),
          bringToTop: vi.fn(),
          setVisible: vi.fn(),
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
vi.mock("../../src/ui/TaskChecklist", () => ({
  TaskChecklist: class {
    get isOpen() {
      return state.checklistOpen;
    }
    close() {
      state.checklistOpen = false;
    }
    setVisible() {}
    setObjective(message: string) {
      state.objective(message);
    }
    setEntries(entries: typeof state.checklistEntries) {
      state.checklistEntries = entries;
    }
  },
}));

import { UIScene } from "../../src/scenes/UIScene";
import { gameEvents } from "../../src/systems/EventBus";
import { InteractionSystem } from "../../src/systems/InteractionSystem";
import type { Player } from "../../src/entities/Player";
import { content } from "../../src/floors/floor-01-scalability/definition/content";
import { beginModal } from "../../src/core/ui-kit/modal";

describe("onboarding HUD lifecycle", () => {
  it("restores the completed lobby objective without replaying onboarding", () => {
    state.floorResults[0] = { quality: "canonical" };
    const ui = new UIScene();
    ui.create();
    gameEvents.emit("floor:changed", 0);
    expect(state.objective).toHaveBeenLastCalledWith(
      "Orientation complete — you are ready to tackle Problem 1",
    );
    expect(state.speech).not.toHaveBeenCalled();
  });

  it("reports cancellation when a sequence is closed or the player moves", () => {
    const ui = new UIScene();
    ui.create();
    const onDismiss = vi.fn();
    gameEvents.emit("dialogue:sequence", content.specialistHints, onDismiss);
    ui.input.keyboard!.emit("keydown-ESC");
    expect(onDismiss).toHaveBeenLastCalledWith("replaced");
    gameEvents.emit("dialogue:sequence", content.specialistHints, onDismiss);
    gameEvents.emit("player:moved");
    expect(onDismiss).toHaveBeenLastCalledWith("movement");
    expect(onDismiss).not.toHaveBeenCalledWith("acknowledged");
  });

  beforeEach(() => {
    gameEvents.removeAllListeners();
    new UIScene().game.events.removeAllListeners();
    state.floorResults = {};
    state.canonicalThisSession = false;
    state.pressedE = false;
    state.checklistOpen = false;
    state.checklistEntries = [];
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

  it("routes E to the open dialogue without reopening the nearby NPC", () => {
    const ui = new UIScene();
    ui.create();
    const onDismiss = vi.fn();
    const onInteract = vi.fn(() => {
      gameEvents.emit(
        "dialogue:sequence",
        content.specialistHints.slice(0, 2),
        onDismiss,
      );
    });
    const interactions = new InteractionSystem(ui, { x: 0, y: 0 } as Player);
    interactions.setInteractables([
      { id: "npc", label: "Talk", x: 0, y: 0, onInteract },
    ]);
    for (let press = 0; press < 3; press += 1) {
      state.pressedE = true;
      interactions.update();
    }
    expect(state.speech).toHaveBeenCalledTimes(2);
    expect(state.speech.mock.calls[1][1]).toBe(content.specialistHints[1]);
    expect(onInteract).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("closes on actual movement and cancels a chained follow-up", () => {
    const ui = new UIScene();
    ui.create();
    const player = { x: 0, y: 0 } as Player;
    const interactions = new InteractionSystem(ui, player);
    const onAcknowledged = vi.fn(() => {
      gameEvents.emit("dialogue:line", content.specialistHints[1]);
    });
    gameEvents.emit(
      "dialogue:line",
      content.specialistHints[0],
      onAcknowledged,
    );
    interactions.update();
    player.x = 1;
    interactions.update();
    expect(onAcknowledged).not.toHaveBeenCalled();
    expect(state.speech).toHaveBeenCalledOnce();
    const request = { handled: false };
    gameEvents.emit("interaction:requested", request);
    expect(request.handled).toBe(false);
  });

  it("consumes E on a choice without choosing or reopening the NPC", () => {
    const ui = new UIScene();
    ui.create();
    const onChoose = vi.fn();
    const onInteract = vi.fn();
    const interactions = new InteractionSystem(ui, { x: 0, y: 0 } as Player);
    interactions.setInteractables([
      { id: "npc", label: "Talk", x: 0, y: 0, onInteract },
    ]);
    gameEvents.emit(
      "dialogue:choice",
      {
        ...content.specialistHints[0],
        choices: [{ id: "cache", label: "Shared cache" }],
      },
      onChoose,
    );
    state.pressedE = true;
    interactions.update();
    expect(onChoose).not.toHaveBeenCalled();
    expect(onInteract).not.toHaveBeenCalled();
    const actions = state.speech.mock.lastCall?.[4] as {
      onChoice: (id: string) => void;
    };
    actions.onChoice("cache");
    expect(onChoose).toHaveBeenCalledExactlyOnceWith("cache");
  });

  it("hides HUD rendering and input until all modals close, including shutdown", () => {
    const ui = new UIScene();
    ui.create();
    const firstOwner = new UIScene();
    const secondOwner = new UIScene();
    const closeFirst = beginModal(firstOwner);
    const closeSecond = beginModal(secondOwner);
    expect(ui.scene.setVisible).toHaveBeenLastCalledWith(false);
    expect(ui.input.enabled).toBe(false);
    const request = { handled: false };
    gameEvents.emit("interaction:requested", request);
    expect(request.handled).toBe(true);
    gameEvents.emit("ui:objective", "Updated behind the modal");
    closeFirst();
    expect(ui.scene.setVisible).toHaveBeenLastCalledWith(false);
    secondOwner.events.emit("shutdown");
    expect(ui.scene.setVisible).toHaveBeenLastCalledWith(true);
    expect(ui.input.enabled).toBe(true);
    const visibilityChanges = vi.mocked(ui.scene.setVisible).mock.calls.length;
    closeSecond();
    expect(ui.scene.setVisible).toHaveBeenCalledTimes(visibilityChanges);
    expect(firstOwner.events.listenerCount("shutdown")).toBe(0);
  });

  it("keeps discovered tasks across floors and checks travel only on arrival", () => {
    const ui = new UIScene();
    ui.create();
    gameEvents.emit("ui:task", 0, { id: "f00.task.form", label: "Form" }, true);
    gameEvents.emit("ui:task", 0, {
      id: "f00.task.travel",
      label: "Upstairs",
      targetFloor: 1,
    });
    gameEvents.emit("floor:changed", 1);
    gameEvents.emit("ui:task", 1, { id: "f01.task.rhea", label: "Meet Rhea" });
    expect(
      state.checklistEntries.map(({ id, completed }) => ({ id, completed })),
    ).toEqual([
      { id: "f00.task.form", completed: true },
      { id: "f00.task.travel", completed: true },
      { id: "f01.task.rhea", completed: false },
    ]);
    ui.events.emit("shutdown");
    gameEvents.emit("ui:task", 2, { id: "ignored", label: "Ignored" });
    expect(state.checklistEntries).toHaveLength(3);
  });

  it("consumes world interaction while the checklist is open and closes on Escape or a modal", () => {
    const ui = new UIScene();
    ui.create();
    state.checklistOpen = true;
    const request = { handled: false };
    gameEvents.emit("interaction:requested", request);
    expect(request.handled).toBe(true);
    ui.input.keyboard!.emit("keydown-ESC");
    expect(state.checklistOpen).toBe(false);
    state.checklistOpen = true;
    const release = beginModal(new UIScene());
    expect(state.checklistOpen).toBe(false);
    release();
  });
});
