import type { RhythmSide } from "./rhythmPatterns";

export type RhythmSoundProfile =
  | "piano"
  | "wood"
  | "water"
  | "bamboo"
  | "chime"
  | "ambient";

const frequencies: Record<RhythmSoundProfile, [number, number]> = {
  piano: [261.63, 392],
  wood: [180, 230],
  water: [293.66, 440],
  bamboo: [220, 329.63],
  chime: [523.25, 659.25],
  ambient: [196, 293.66],
};

export class RhythmAudio {
  private context: AudioContext | null = null;

  private getContext() {
    this.context ??= new AudioContext();
    if (this.context.state === "suspended") void this.context.resume();
    return this.context;
  }

  play(profile: RhythmSoundProfile, side: RhythmSide, quiet = false) {
    const context = this.getContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const index = side === "left" ? 0 : 1;
    oscillator.frequency.value = frequencies[profile][index];
    oscillator.type =
      profile === "wood" || profile === "bamboo"
        ? "triangle"
        : profile === "ambient"
          ? "sine"
          : "sine";
    const now = context.currentTime;
    const duration =
      profile === "chime" || profile === "ambient" ? 0.7 : 0.34;
    const volume = quiet ? 0.025 : 0.055;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  close() {
    if (this.context) void this.context.close();
    this.context = null;
  }
}
