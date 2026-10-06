"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { soundEngine, type AudioPreferences } from "@/game/audio/sound-engine";
import { SOUNDTRACKS, soundtrackForRoute, type PlayAudioPhase, type SoundtrackId } from "@/game/audio/soundtrack";

interface AudioControlsContextValue {
  preferences: AudioPreferences;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setPlayPhase: (phase: PlayAudioPhase) => void;
}

const AudioControlsContext = createContext<AudioControlsContextValue | null>(null);
const CROSSFADE_MS = 900;

export function useGameAudio(): AudioControlsContextValue {
  const value = useContext(AudioControlsContext);
  if (!value) throw new Error("AudioProvider is missing");
  return value;
}

const CLICKABLE = "button, a[href], [role='button'], [role='tab'], summary, input[type='checkbox'], input[type='radio'], select";
const CLOSING = "[aria-label='ย้อนกลับ'], [aria-label^='ปิด'], .modal-close-x";
const TAB = "[role='tab'], .tab-pill-btn";
const SELECT = ".mission-difficulty-tile";

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Every clickable control on every page gets the UI click sound.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest?.(CLICKABLE);
      if (!target || target.matches(":disabled, [aria-disabled='true']")) return;
      soundEngine.play(target.matches(CLOSING) ? "ui_close" : target.matches(TAB) ? "ui_tab" : target.matches(SELECT) ? "ui_select" : "button_click");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // A soft chime whenever a new page opens (not on the very first load).
  const firstPath = useRef(true);
  useEffect(() => {
    if (firstPath.current) { firstPath.current = false; return; }
    soundEngine.play("ui_open");
  }, [pathname]);
  const preferences = useSyncExternalStore(soundEngine.subscribe, soundEngine.getSnapshot, soundEngine.getServerSnapshot);
  const [playPhase, setPlayPhase] = useState<PlayAudioPhase>("intro");
  const first = useRef<HTMLAudioElement>(null);
  const second = useRef<HTMLAudioElement>(null);
  const activeIndex = useRef(0);
  const activeTrack = useRef<SoundtrackId | null>(null);
  const pendingTrack = useRef<SoundtrackId | null>(null);
  const desired = useRef(soundtrackForRoute(pathname, playPhase));
  const preferencesRef = useRef(preferences);
  const unlocked = useRef(false);
  const transition = useRef(0);
  const frame = useRef<number | null>(null);
  const fading = useRef(false);

  const stopFade = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    fading.current = false;
  }, []);

  const targetVolume = useCallback(() => {
    const current = preferencesRef.current;
    return current.muted ? 0 : current.volume * desired.current.gain;
  }, []);

  const fadeTo = useCallback((incoming: HTMLAudioElement, outgoing: HTMLAudioElement | null, duration: number) => {
    stopFade();
    fading.current = true;
    const started = performance.now();
    const outgoingStart = outgoing?.volume ?? 0;
    const tick = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - started) / duration));
      incoming.volume = Math.min(1, targetVolume() * progress);
      if (outgoing) outgoing.volume = Math.max(0, outgoingStart * (1 - progress));
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        if (outgoing) outgoing.pause();
        frame.current = null;
        fading.current = false;
      }
    };
    frame.current = requestAnimationFrame(tick);
  }, [stopFade, targetVolume]);

  const startDesired = useCallback(() => {
    const primary = first.current;
    const standby = second.current;
    const current = preferencesRef.current;
    if (!primary || !standby || !unlocked.current || document.hidden || current.muted || current.volume === 0) return;
    const slots: [HTMLAudioElement, HTMLAudioElement] = [primary, standby];

    const wanted = desired.current;
    const active = slots[activeIndex.current];
    if (activeTrack.current === wanted.id) {
      if (active.paused) {
        active.volume = 0;
        void active.play().then(() => fadeTo(active, null, 400)).catch(() => { unlocked.current = false; });
      } else if (!fading.current) {
        active.volume = Math.min(1, targetVolume());
      }
      return;
    }

    if (pendingTrack.current === wanted.id) return;
    if (fading.current) {
      stopFade();
      active.volume = Math.min(1, targetVolume());
    }
    transition.current += 1;
    const request = transition.current;
    const incomingIndex = activeTrack.current === null ? activeIndex.current : 1 - activeIndex.current;
    const incoming = slots[incomingIndex];
    const outgoing = activeTrack.current === null ? null : active;
    pendingTrack.current = wanted.id;
    incoming.pause();
    incoming.src = SOUNDTRACKS[wanted.id];
    incoming.preload = "auto";
    incoming.loop = true;
    incoming.volume = 0;
    incoming.load();

    void incoming.play().then(() => {
      if (request !== transition.current || desired.current.id !== wanted.id) {
        if (!pendingTrack.current) incoming.pause();
        return;
      }
      pendingTrack.current = null;
      activeIndex.current = incomingIndex;
      activeTrack.current = wanted.id;
      fadeTo(incoming, outgoing, outgoing ? CROSSFADE_MS : 400);
    }).catch(() => {
      if (request === transition.current) {
        pendingTrack.current = null;
        unlocked.current = false;
      }
    });
  }, [fadeTo, stopFade, targetVolume]);

  const unlock = useCallback(() => {
    unlocked.current = true;
    startDesired();
  }, [startDesired]);

  useEffect(() => {
    const primary = first.current;
    const standby = second.current;
    if (!primary || !standby) return;
    primary.src = SOUNDTRACKS.landing;
    primary.preload = "metadata";
    primary.loop = true;
    primary.load();

    const onGesture = () => {
      if (!unlocked.current) unlock();
    };
    const onVisibility = () => {
      if (document.hidden) {
        transition.current += 1;
        pendingTrack.current = null;
        stopFade();
        primary.pause();
        standby.pause();
      } else {
        startDesired();
      }
    };
    document.addEventListener("pointerdown", onGesture, { capture: true });
    document.addEventListener("keydown", onGesture, { capture: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("pointerdown", onGesture, { capture: true });
      document.removeEventListener("keydown", onGesture, { capture: true });
      document.removeEventListener("visibilitychange", onVisibility);
      transition.current += 1;
      stopFade();
      primary.pause();
      standby.pause();
    };
  }, [startDesired, stopFade, unlock]);

  useEffect(() => {
    desired.current = soundtrackForRoute(pathname, playPhase);
    startDesired();
  }, [pathname, playPhase, startDesired]);

  useEffect(() => {
    preferencesRef.current = preferences;
    const slots = [first.current, second.current];
    if (preferences.muted || preferences.volume === 0) {
      transition.current += 1;
      pendingTrack.current = null;
      stopFade();
      slots.forEach((slot) => slot?.pause());
    } else {
      startDesired();
    }
  }, [preferences, startDesired, stopFade]);

  const controls = useMemo<AudioControlsContextValue>(() => ({
    preferences,
    setMuted: (muted) => {
      soundEngine.setMuted(muted);
      preferencesRef.current = soundEngine.getSnapshot();
      if (!muted) unlock();
    },
    setVolume: (volume) => {
      soundEngine.setVolume(volume);
      preferencesRef.current = soundEngine.getSnapshot();
      if (volume > 0) unlock();
    },
    setPlayPhase,
  }), [preferences, unlock]);

  return (
    <AudioControlsContext.Provider value={controls}>
      <audio ref={first} data-audio-channel="bgm-a" aria-hidden="true" />
      <audio ref={second} data-audio-channel="bgm-b" aria-hidden="true" />
      {children}
    </AudioControlsContext.Provider>
  );
}
