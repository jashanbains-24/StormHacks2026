import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  text: [] as string[],
  completeFloor: vi.fn(),
  clearAttempt: vi.fn(),
  closeControl: undefined as undefined | { emit: (event: string) => unknown },
  closeDepth: 0,
}));

vi.mock("phaser", async () => {
  const { default: EventEmitter } = await import("eventemitter3");
  class Visual extends EventEmitter {
    angle = 0;
    constructor(private readonly text = "") {
      super();
      if (text) state.text.push(text);
    }
    setText(text: string) {
      state.text.push(text);
      return this;
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
    setVisible() {
      return this;
    }
    setDepth(depth: number) {
      if (depth === 1000) state.closeControl = this;
      if (this.text === "×") state.closeDepth = depth;
      return this;
    }
    setAngle() {
      return this;
    }
    setColor() {
      return this;
    }
    add() {
      return this;
    }
    destroy() {}
  }
  const game = { events: new EventEmitter() };
  return {
    default: {
      Events: { EventEmitter },
      Scenes: { Events: { SHUTDOWN: "shutdown" } },
      Math: { Between: (min: number) => min },
      Scene: class {
        game = game;
        events = new EventEmitter();
        input = new EventEmitter() as InstanceType<typeof EventEmitter> & {
          keyboard: InstanceType<typeof EventEmitter>;
          mouse: { disableContextMenu: () => void };
        };
        add = {
          text: vi.fn((_x, _y, text: string) => new Visual(text)),
          rectangle: vi.fn(() => new Visual()),
          circle: vi.fn(() => new Visual()),
          container: vi.fn(() => new Visual()),
        };
        cameras = { main: { setBackgroundColor: vi.fn(), flash: vi.fn() } };
        time = { delayedCall: vi.fn() };
        tweens = { add: vi.fn() };
        scene = {
          stop: vi.fn(() => this.events.emit("shutdown")),
          resume: vi.fn(),
        };
        constructor() {
          this.input.keyboard = new EventEmitter();
          this.input.mouse = { disableContextMenu: vi.fn() };
        }
      },
    },
  };
});
vi.mock("../../src/core/runtime/floorRegistry", () => ({
  getFloorByOrder: () => ({
    module: { definition: { incident: { buildMode: "tutorial" } } },
  }),
}));
vi.mock("../../src/state/progression", () => ({
  progression: { completeFloor: state.completeFloor, snapshot: {} },
}));
vi.mock("../../src/state/buildDesign", () => ({
  tutorialBuildDesignStore: { clearAfterEvaluatedAttempt: state.clearAttempt },
  buildDesignStore: {},
}));
vi.mock("../../src/state/preferences", () => ({
  preferences: { snapshot: { reducedMotion: true } },
}));
vi.mock("../../src/systems/AudioSystem", () => ({
  audio: { playSuccess: vi.fn() },
}));
vi.mock("../../src/ui/BuildNode", () => ({ BuildNode: class {} }));
vi.mock("../../src/ui/Palette", () => ({ Palette: class {} }));

import { BuildScene } from "../../src/scenes/BuildScene";
import { gameEvents } from "../../src/systems/EventBus";

function enter(scene: BuildScene, repeat = false): void {
  scene.input.keyboard!.emit("keydown-ENTER", { key: "Enter", repeat });
}

function type(scene: BuildScene, text: string): void {
  for (const key of text) scene.input.keyboard!.emit("keydown", { key });
}

function startQuestions(scene: BuildScene): void {
  scene.init({ floorOrder: 0 });
  scene.create();
  type(scene, "Recruit");
  enter(scene);
  enter(scene);
}

describe("onboarding form keyboard flow", () => {
  beforeEach(() => {
    gameEvents.removeAllListeners();
    state.text = [];
    state.closeControl = undefined;
    state.closeDepth = 0;
    vi.clearAllMocks();
  });

  it("completes all questions once, then Enter closes and resumes the lobby", () => {
    const scene = new BuildScene();
    const onComplete = vi.fn();
    const onClosed = vi.fn();
    gameEvents.on("tutorial:completed", onComplete);
    gameEvents.on("build:closed", onClosed);
    startQuestions(scene);
    for (const answer of ["4", "10", "HTML"]) {
      type(scene, answer);
      enter(scene);
    }
    expect(state.text).toContain("Onboarding Complete");
    expect(state.text).toContain("RETURN TO LOBBY [ENTER]");
    expect(state.completeFloor).toHaveBeenCalledExactlyOnceWith(
      0,
      "canonical",
      [],
    );
    expect(onComplete).toHaveBeenCalledExactlyOnceWith("Recruit");
    expect(scene.scene.stop).not.toHaveBeenCalled();

    scene.input.keyboard!.emit("keydown", { key: "Backspace" });
    enter(scene, true);
    expect(scene.scene.stop).not.toHaveBeenCalled();
    enter(scene);
    expect(scene.scene.stop).toHaveBeenCalledOnce();
    expect(scene.scene.resume).toHaveBeenCalledExactlyOnceWith("FloorScene");
    expect(state.clearAttempt).toHaveBeenCalledExactlyOnceWith(true);
    expect(onClosed).toHaveBeenCalledOnce();
    enter(scene);
    expect(onClosed).toHaveBeenCalledOnce();
    expect(state.text.some((text) => text.includes("question 4"))).toBe(false);
  });

  it("keeps an incorrect final answer open for correction", () => {
    const scene = new BuildScene();
    startQuestions(scene);
    for (const answer of ["4", "10", "css"]) {
      type(scene, answer);
      enter(scene);
    }
    expect(state.completeFloor).not.toHaveBeenCalled();
    expect(scene.scene.stop).not.toHaveBeenCalled();
    expect(state.text).toContain("Not quite — try that one again.");
    for (let count = 0; count < 3; count += 1) {
      scene.input.keyboard!.emit("keydown", { key: "Backspace" });
    }
    type(scene, "html");
    enter(scene);
    expect(state.text).toContain("Onboarding Complete");
  });

  it("resets the form and Enter listener when the scene reopens", () => {
    const scene = new BuildScene();
    startQuestions(scene);
    scene.events.emit("shutdown");
    scene.init({ floorOrder: 0 });
    scene.create();
    type(scene, "New Recruit");
    enter(scene);
    expect(state.text[state.text.length - 1]).toBe("EDIT");
    expect(state.text).toContain('Your name is "New Recruit".');
    enter(scene);
    expect(state.text).toContain(
      "Preliminary question 1 of 3\nHow many of the 7 circles are red?",
    );
    expect(state.completeFloor).not.toHaveBeenCalled();
  });

  it("keeps the tutorial X above its outcome and closes through its hit area", () => {
    const scene = new BuildScene();
    const onClosed = vi.fn();
    gameEvents.on("build:closed", onClosed);
    startQuestions(scene);
    for (const answer of ["4", "10", "html"]) {
      type(scene, answer);
      enter(scene);
    }
    expect(state.closeDepth).toBeGreaterThan(200);
    state.closeControl!.emit("pointerup");
    expect(scene.scene.stop).toHaveBeenCalledOnce();
    expect(scene.scene.resume).toHaveBeenCalledWith("FloorScene");
    expect(onClosed).toHaveBeenCalledOnce();
  });
});
