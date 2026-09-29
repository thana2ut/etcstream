"use client";

import type { AcademyAudioCue, AcademyAudioPlayer } from "./cues";

export interface AudioPreferences {
  volume: number;
  muted: boolean;
}

const VOLUME_KEY = "etcstream-audio-volume";
const MUTED_KEY = "etcstream-audio-muted";
const LEGACY_MUTED_KEY = "streamlab_audio_muted";
const DEFAULT_VOLUME = 0.32;
const DEFAULT_PREFERENCES: AudioPreferences = { volume: DEFAULT_VOLUME, muted: false };

class WebAudioSoundEngine implements AcademyAudioPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSamples = new Set<HTMLAudioElement>();
  private preferences: AudioPreferences = DEFAULT_PREFERENCES;
  private listeners = new Set<() => void>();

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const storedVolume = Number(localStorage.getItem(VOLUME_KEY));
        const hasVolume = localStorage.getItem(VOLUME_KEY) !== null;
        const storedMute = localStorage.getItem(MUTED_KEY) ?? localStorage.getItem(LEGACY_MUTED_KEY);
        this.preferences = {
          volume: hasVolume && Number.isFinite(storedVolume) && storedVolume >= 0 && storedVolume <= 1 ? storedVolume : DEFAULT_VOLUME,
          muted: storedMute === "true",
        };
      } catch {
        // Local storage may be unavailable in private browsing.
      }
    }
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public getSnapshot = (): AudioPreferences => this.preferences;

  public getServerSnapshot = (): AudioPreferences => DEFAULT_PREFERENCES;

  private updateGain(): void {
    if (this.masterGain && this.ctx) {
      const level = this.preferences.muted ? 0 : Math.min(0.45, this.preferences.volume * 0.75);
      this.masterGain.gain.setTargetAtTime(level, this.ctx.currentTime, 0.03);
    }
  }

  private publish(): void {
    this.updateGain();
    for (const sample of this.activeSamples) {
      if (this.preferences.muted || this.preferences.volume === 0) {
        sample.pause();
        this.activeSamples.delete(sample);
      } else {
        sample.volume = Math.min(0.72, this.preferences.volume * 1.5);
      }
    }
    this.listeners.forEach((listener) => listener());
  }

  private initCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(
          this.preferences.muted ? 0 : Math.min(0.45, this.preferences.volume * 0.75),
          this.ctx.currentTime
        );
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    if (this.preferences.muted === muted) return;
    this.preferences = { ...this.preferences, muted };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(MUTED_KEY, String(muted));
        localStorage.setItem(LEGACY_MUTED_KEY, String(muted));
      } catch {
        // Ignore storage errors
      }
    }
    this.publish();
  }

  public setVolume(volume: number): void {
    const next = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : DEFAULT_VOLUME));
    if (this.preferences.volume === next) return;
    this.preferences = { ...this.preferences, volume: next };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(VOLUME_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
    }
    this.publish();
  }

  public isMuted(): boolean {
    return this.preferences.muted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.preferences.muted);
    return this.preferences.muted;
  }

  private playSample(path: string): void {
    if (typeof window === "undefined") return;
    const sample = new Audio(path);
    sample.volume = Math.min(0.72, this.preferences.volume * 1.5);
    this.activeSamples.add(sample);
    sample.addEventListener("ended", () => this.activeSamples.delete(sample), { once: true });
    void sample.play().catch(() => this.activeSamples.delete(sample));
  }

  public play(cue: AcademyAudioCue | "button_click" | "button_hover"): void {
    if (this.preferences.muted || this.preferences.volume === 0) return;
    if (cue === "name_inscribed" || cue === "academy_enter") {
      this.playSample("/audio/sfx/dream-chime.mp3");
      return;
    }
    if (cue === "mission_reveal" || cue === "mission_accept" || cue === "seal_open") {
      this.playSample("/audio/sfx/magic-spell.mp3");
      return;
    }
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    switch (cue) {
      case "button_hover": {
        // High, very soft short ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }
      case "button_click": {
        // Soft resonant click with gold overtone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }
      case "connection_success": {
        // High harmonic chime: cable clicked into port
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(783.99, now); // G5
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case "connection_error": {
        // Gentle low double-thud
        [180, 140].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.14, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.1);
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.12);
        });
        break;
      }
      case "mission_complete": {
        // Ceremonial fanfare chord: Grand gold appraisal
        [261.63, 329.63, 392.0, 523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.14 / (idx * 0.5 + 1), now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0 + idx * 0.1);
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(now + idx * 0.07);
          osc.stop(now + 2.5);
        });
        break;
      }
      default:
        break;
    }
  }
}

export const soundEngine = new WebAudioSoundEngine();
