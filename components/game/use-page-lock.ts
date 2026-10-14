"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Keeps the player on the current page like a native app.
 *
 * Back/Forward guard: after EVERY page change a duplicate of the current history entry is pushed, so a browser
 * "back" (two-finger swipe, mouse side button, Alt+←, toolbar) only lands on that duplicate — same URL, so the
 * Next.js router stays on the page — and the duplicate is pushed again. In-app buttons still navigate normally.
 *
 * Gesture guard: horizontal trackpad wheel movement is cancelled before the browser turns it into a swipe
 * (CSS `overscroll-behavior` in globals.css covers Chrome/Edge/Firefox; this also covers Safari).
 */
export function usePageLock(active = true) {
  const pathname = usePathname();

  // Re-pin on every route change (router.push adds a new entry that would otherwise be "back"-able).
  useEffect(() => {
    if (!active) return;
    window.history.pushState(window.history.state, "", window.location.href);
  }, [active, pathname]);

  useEffect(() => {
    if (!active) return;
    const onPop = () => window.history.pushState(window.history.state, "", window.location.href);
    const onWheel = (e: WheelEvent) => { if (e.deltaX !== 0 && Math.abs(e.deltaX) >= Math.abs(e.deltaY) * 0.5) e.preventDefault(); };
    // Mouse side buttons (3 = back, 4 = forward).
    const onMouse = (e: MouseEvent) => { if (e.button === 3 || e.button === 4) e.preventDefault(); };
    // Alt+← / Alt+→ shortcuts.
    const onKey = (e: KeyboardEvent) => { if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) e.preventDefault(); };
    window.addEventListener("popstate", onPop);
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("mouseup", onMouse, true);
    window.addEventListener("mousedown", onMouse, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("mouseup", onMouse, true);
      window.removeEventListener("mousedown", onMouse, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [active]);
}
