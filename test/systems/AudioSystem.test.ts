import { beforeEach, describe, expect, it, vi } from "vitest";

const preference = vi.hoisted(() => ({ muted: false }));

vi.mock("phaser", () => ({
  default: {
    Math: {
      Clamp: (value: number, min: number, max: number) =>
        Math.min(max, Math.max(min, value)),
    },
  },
}));
vi.mock("../../src/state/preferences", () => ({
  preferences: { snapshot: preference },
}));

import { audio } from "../../src/systems/AudioSystem";

const createSoundManager = () => {
  const music = {
    isPlaying: true,
    play: vi.fn(),
    stop: vi.fn(),
    destroy: vi.fn(),
    setMute: vi.fn(),
  };
  const manager = {
    game: { cache: { audio: { exists: vi.fn(() => true) } } },
    add: vi.fn(() => music),
  };
  audio.attachSoundManager(
    manager as unknown as Parameters<typeof audio.attachSoundManager>[0],
  );
  return { manager, music };
};

describe("background music", () => {
  beforeEach(() => {
    audio.stopMusic();
    preference.muted = false;
  });

  it("starts looping music and reuses an already playing track", () => {
    const { manager, music } = createSoundManager();

    expect(audio.playMusic("bgm", { volume: 0.24 })).toBe(music);
    audio.playMusic("bgm");

    expect(manager.add).toHaveBeenCalledExactlyOnceWith("bgm", {
      loop: true,
      volume: 0.24,
      mute: false,
    });
    expect(music.play).toHaveBeenCalledOnce();
  });

  it("preserves the chosen volume when starting muted and later unmuting", () => {
    preference.muted = true;
    const { manager, music } = createSoundManager();
    audio.playMusic("bgm", { volume: 0.24 });

    expect(manager.add).toHaveBeenCalledWith("bgm", {
      loop: true,
      volume: 0.24,
      mute: true,
    });
    preference.muted = false;
    audio.syncMusicMute();
    expect(music.setMute).toHaveBeenCalledWith(false);

    preference.muted = true;
    audio.syncMusicMute();
    expect(music.setMute).toHaveBeenLastCalledWith(true);
  });

  it("releases the track when stopped and skips missing assets", () => {
    const { manager, music } = createSoundManager();
    audio.playMusic("bgm");
    audio.stopMusic();

    expect(music.stop).toHaveBeenCalledOnce();
    expect(music.destroy).toHaveBeenCalledOnce();
    manager.game.cache.audio.exists.mockReturnValue(false);
    expect(audio.playMusic("missing")).toBeUndefined();
    expect(manager.add).toHaveBeenCalledOnce();
  });
});
