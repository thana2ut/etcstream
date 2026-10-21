"use client";
import { useEffect, useState } from "react";

let cached = false;
/** Ask the server now (never trusts an earlier "no": the browser may have just switched to a test account). */
export async function checkTester(): Promise<boolean> {
  try {
    const r = await fetch("/api/arena/tester", { credentials: "same-origin", cache: "no-store" });
    cached = r.ok ? (await r.json())?.tester === true : false;
  } catch { /* keep the last answer when offline */ }
  return cached;
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
