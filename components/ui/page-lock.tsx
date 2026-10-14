"use client";

import { usePageLock } from "@/components/game/use-page-lock";

/** Site-wide app lock: two-finger swipes, mouse side buttons and browser Back/Forward never leave the current page. */
export function PageLock() {
  usePageLock();
  return null;
}
