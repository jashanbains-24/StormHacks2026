import { afterEach, describe, expect, it, vi } from "vitest";

const createBrowser = (saved: string | null, reducedMotion = false) => {
  let stored = saved;
  const localStorage = {
    getItem: vi.fn(() => stored),
    setItem: vi.fn((_key: string, value: string) => {
      stored = value;
    }),
  };
  vi.stubGlobal("window", {
    localStorage,
    matchMedia: vi.fn(() => ({ matches: reducedMotion })),
  });
  return localStorage;
};

const loadPreferences = async () => {
  vi.resetModules();
  return (await import("../../src/state/preferences")).preferences;
};

afterEach(() => vi.unstubAllGlobals());

describe("preferences", () => {
  it.each([false, true])(
    "uses system reduced motion (%s) instead of the removed button's override",
    async (systemReducedMotion) => {
      createBrowser(
        JSON.stringify({ muted: true, reducedMotion: !systemReducedMotion }),
        systemReducedMotion,
      );
      const preferences = await loadPreferences();

      expect(preferences.snapshot).toEqual({
        muted: true,
        reducedMotion: systemReducedMotion,
      });
    },
  );

  it("persists sound changes without saving a motion override", async () => {
    const storage = createBrowser('{"muted":true,"reducedMotion":true}');
    const preferences = await loadPreferences();
    preferences.toggleMuted();

    expect(storage.setItem).toHaveBeenCalledWith(
      "uptime.preferences.v1",
      '{"muted":false}',
    );
    expect((await loadPreferences()).snapshot).toEqual({
      muted: false,
      reducedMotion: false,
    });
  });

  it("falls back to system preferences for invalid saved data", async () => {
    createBrowser("invalid json", true);
    expect((await loadPreferences()).snapshot).toEqual({
      muted: false,
      reducedMotion: true,
    });
  });
});
