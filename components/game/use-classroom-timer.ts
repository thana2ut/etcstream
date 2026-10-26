"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTrainingStore } from "@/game/stores/training-store";

export function formatClassroomTime(ms: number) {
  const safe = Math.max(0, Math.floor(ms));
  return `${String(Math.floor(safe / 60000)).padStart(2, "0")}:${String(Math.floor(safe / 1000) % 60).padStart(2, "0")}.${String(Math.floor(safe % 1000 / 10)).padStart(2, "0")}`;
}

/** One monotonic clock per attempt. Pausing freezes it without rebuilding its timeline. */
export function useClassroomTimer(enabled: boolean, ready: boolean, paused = false) {
  const [clock, setClock] = useState({ countdown: 3, elapsed: 0 });
  const [attempt, setAttempt] = useState({ revision: 0, seed: 0 });
  const timeline = useRef({ origin: 0, last: 0, countdownMs: 0, elapsed: 0, started: false, paused, finished: false });

  useLayoutEffect(() => {
    const t = timeline.current;
    const now = performance.now();
    if (paused && !t.paused && t.started && !t.finished) {
      t.elapsed += Math.max(0, now - t.last);
      setClock({ countdown: 0, elapsed: t.elapsed });
    }
    t.last = now;
    t.paused = paused;
  }, [paused]);

  useEffect(() => {
    if (!enabled || !ready) return;
    const now = performance.now();
    const t = timeline.current;
    Object.assign(t, { origin: now, last: now, countdownMs: 0, elapsed: attempt.seed, started: false, finished: false });
    const update = () => {
      const current = performance.now();
      const delta = Math.max(0, current - t.last);
      t.last = current;
      if (t.finished) return;
      if (!t.paused) {
        if (t.started) t.elapsed += delta;
        else {
          t.countdownMs += delta;
          if (t.countdownMs >= 3000) {
            t.started = true;
            t.elapsed += t.countdownMs - 3000;
          }
        }
      }
      const countdown = t.started ? 0 : Math.max(0, 3 - Math.floor(t.countdownMs / 1000));
      setClock({ countdown, elapsed: t.elapsed });
    };
    const interval = window.setInterval(update, 50);
    const unsubscribe = useTrainingStore.subscribe((state) => {
      if (state.scenarioId !== "studio-full" || !state.completed || t.finished) return;
      update();
      t.finished = true;
      window.clearInterval(interval);
      if (document.pointerLockElement) document.exitPointerLock();
    });
    return () => { window.clearInterval(interval); unsubscribe(); };
  }, [enabled, ready, attempt]);

  const restore = useCallback((elapsed: number) => {
    const seed = Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
    setClock({ countdown: 3, elapsed: seed });
    setAttempt((current) => ({ revision: current.revision + 1, seed }));
  }, []);
  const reset = useCallback(() => restore(0), [restore]);
  return { ...clock, restore, reset };
}
