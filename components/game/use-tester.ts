"use client";
import { useEffect, useState } from "react";

let cached = false;
let cachedMissionAccess = false;
/** Ask the server now (never trusts an earlier "no": the browser may have just switched to a test account). */
export async function checkTester(): Promise<boolean> {
  try {
    const r = await fetch("/api/arena/tester", { credentials: "same-origin", cache: "no-store" });
    if (r.ok) {
      const access = await r.json();
      cached = access?.tester === true;
      cachedMissionAccess = access?.missionAccess === true;
    } else {
      cached = false;
      cachedMissionAccess = false;
    }
  } catch { /* keep the last answer when offline */ }
  return cached;
}

/** Owner Admin account only: opens all mission rooms and may use the canonical auto-packed test loadout. */
export async function checkMissionAccess(): Promise<boolean> {
  await checkTester();
  return cachedMissionAccess;
}
/**
 * True only for the owner's server-registered test accounts (admin1/admin2/admin3), as answered by
 * /api/arena/tester. Used to open every mission room and pre-pack each level's exact cables.
 * Re-checked on every mount and whenever the tab regains focus, so a fresh claim takes effect without a reload.
 */
export function useTester() {
  const [tester, setTester] = useState(cached);
  useEffect(() => {
    let alive = true;
    const refresh = () => { void checkTester().then((v) => { if (alive) setTester(v); }); };
    refresh();
    window.addEventListener("focus", refresh);
    return () => { alive = false; window.removeEventListener("focus", refresh); };
  }, []);
  return tester;
}

export function useMissionAccess() {
  const [missionAccess, setMissionAccess] = useState(cachedMissionAccess);
  useEffect(() => {
    let alive = true;
    const refresh = () => { void checkMissionAccess().then((v) => { if (alive) setMissionAccess(v); }); };
    refresh();
    window.addEventListener("focus", refresh);
    return () => { alive = false; window.removeEventListener("focus", refresh); };
  }, []);
  return missionAccess;
}
