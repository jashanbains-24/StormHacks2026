export interface Preferences {
  muted: boolean;
  reducedMotion: boolean;
}

const STORAGE_KEY = "uptime.preferences.v1";

const defaults = (): Preferences => ({
  muted: false,
  reducedMotion:
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

class PreferenceStore {
  private value = this.load();

  get snapshot(): Preferences {
    return { ...this.value };
  }

  toggleMuted(): Preferences {
    this.value.muted = !this.value.muted;
    this.persist();
    return this.snapshot;
  }

  toggleReducedMotion(): Preferences {
    this.value.reducedMotion = !this.value.reducedMotion;
    this.persist();
    return this.snapshot;
  }

  private load(): Preferences {
    if (typeof window === "undefined") return defaults();
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaults();
    try {
      return { ...defaults(), ...(JSON.parse(saved) as Partial<Preferences>) };
    } catch {
      return defaults();
    }
  }

  private persist(): void {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.value));
    }
  }
}

export const preferences = new PreferenceStore();
