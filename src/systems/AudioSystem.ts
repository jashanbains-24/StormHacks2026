import { preferences } from "../state/preferences";

class AudioSystem {
  private context?: AudioContext;

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
