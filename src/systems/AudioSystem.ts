import Phaser from "phaser";

import { preferences } from "../state/preferences";

export interface BackgroundMusicOptions {
  loop?: boolean;
  volume?: number;
}

export interface BackgroundMusicHandle {
  readonly isPlaying: boolean;
  play(): boolean;
  pause(): boolean;
  resume(): boolean;
  stop(): boolean;
  setMute(value: boolean): BackgroundMusicHandle;
  setVolume(value: number): BackgroundMusicHandle;
  destroy(): void;
}

class AudioSystem {
  private context?: AudioContext;
  private soundManager?: Phaser.Sound.BaseSoundManager;
  private music?: BackgroundMusicHandle;
  private musicKey?: string;

  playClick(): void {
    this.tone(420, 0.04, 0.025);
  }

  playCrash(): void {
    this.tone(110, 0.2, 0.055, "sawtooth");
  }

  playSuccess(): void {
    [523, 659, 784].forEach((frequency, index) =>
      this.tone(frequency, 0.16, 0.04, "sine", index * 0.1),
    );
  }

  playStartChime(): void {
    [392, 523, 659].forEach((frequency, index) =>
      this.tone(frequency, 0.13, 0.035, "sine", index * 0.07),
    );
  }

  attachSoundManager(manager: Phaser.Sound.BaseSoundManager): void {
    if (this.soundManager === manager) return;
    this.stopMusic();
    this.soundManager = manager;
  }

  playMusic(
    key: string,
    options: BackgroundMusicOptions = {},
  ): BackgroundMusicHandle | undefined {
    const manager = this.soundManager;
    if (!manager || !manager.game.cache.audio.exists(key)) return undefined;

    if (this.musicKey === key && this.music?.isPlaying) return this.music;
    this.stopMusic();

    const volume = Phaser.Math.Clamp(options.volume ?? 0.35, 0, 1);
    const music = manager.add(key, {
      loop: options.loop ?? true,
      volume: preferences.snapshot.muted ? 0 : volume,
    }) as unknown as BackgroundMusicHandle;
    this.music = music;
    this.musicKey = key;
    music.play();

    return music;
  }

  stopMusic(): void {
    const music = this.music;
    this.music = undefined;
    this.musicKey = undefined;
    if (!music) return;

    music.stop();
    music.destroy();
  }

  pauseMusic(): void {
    this.music?.pause();
  }

  resumeMusic(): void {
    if (!preferences.snapshot.muted) this.music?.resume();
  }

  setMusicVolume(volume: number): void {
    this.music?.setVolume(Phaser.Math.Clamp(volume, 0, 1));
  }

  syncMusicMute(): void {
    this.music?.setMute(preferences.snapshot.muted);
  }

  private tone(
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType = "square",
    delay = 0,
  ): void {
    if (preferences.snapshot.muted || typeof window === "undefined") return;
    this.context ??= new AudioContext();
    void this.context.resume();
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }
}

export const audio = new AudioSystem();
