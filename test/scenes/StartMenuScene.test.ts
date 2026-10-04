import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("phaser", () => ({
  default: {
    Scene: class {
      cameras = { main: { fadeOut: vi.fn() } };
      time = { delayedCall: vi.fn() };
    },
  },
}));
vi.mock("../../src/scenes/PreloadScene", () => ({
  BACKGROUND_MUSIC_KEY: "music",
}));
vi.mock("../../src/systems/AudioSystem", () => ({
  audio: { playStartChime: vi.fn(), playMusic: vi.fn() },
}));
vi.mock("../../src/state/buildDesign", () => ({
  buildDesignStore: { reset: vi.fn() },
  tutorialBuildDesignStore: { reset: vi.fn() },
}));

import { StartMenuScene } from "../../src/scenes/StartMenuScene";
import { progression } from "../../src/state/progression";
import { glossaryStore } from "../../src/state/glossary";
import {
  buildDesignStore,
  tutorialBuildDesignStore,
} from "../../src/state/buildDesign";

describe("new game and saved game", () => {
  beforeEach(() => {
    progression.reset();
    progression.completeFloor(0, "canonical", []);
    progression.completeFloor(1, "canonical", []);
    progression.confirmHandoff(1);
    glossaryStore.reset();
    glossaryStore.markOpened("f01.capacity");
    vi.clearAllMocks();
  });

  it.each(["startGame", "continueGame"] as const)(
    "%s starts exactly once with the intended progress",
    (action) => {
      const menu = new StartMenuScene() as unknown as {
        startGame(): void;
        continueGame(): void;
        time: { delayedCall: ReturnType<typeof vi.fn> };
      };
      const saved = progression.snapshot;
      menu[action]();
      menu[action]();
      expect(menu.time.delayedCall).toHaveBeenCalledOnce();
      if (action === "startGame") {
        expect(progression.snapshot.floorResults).toEqual({});
        expect(buildDesignStore.reset).toHaveBeenCalledOnce();
        expect(tutorialBuildDesignStore.reset).toHaveBeenCalledOnce();
        expect(glossaryStore.openedIds).toEqual([]);
      } else {
        expect(progression.snapshot).toEqual(saved);
        expect(buildDesignStore.reset).not.toHaveBeenCalled();
        expect(tutorialBuildDesignStore.reset).not.toHaveBeenCalled();
        expect(glossaryStore.openedIds).toEqual(["f01.capacity"]);
      }
    },
  );
});
