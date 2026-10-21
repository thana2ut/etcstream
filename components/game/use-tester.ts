"use client";
import { useEffect, useState } from "react";

let cached: boolean | null = null;
/**
 * True only for the owner's server-registered test accounts (admin1/admin2/admin3), as answered by
 * /api/arena/tester. Used to open every mission room and pre-pack each level's exact cables.
 */
export function useTester() {
  const [tester, setTester] = useState(cached ?? false);
  useEffect(() => {
    if (cached !== null) return;
    const controller = new AbortController();
    fetch("/api/arena/tester", { credentials: "same-origin", cache: "no-store", signal: controller.signal })
      .then((r) => (r.ok ? r.json() : { tester: false }))
      .then((v) => { cached = v?.tester === true; setTester(cached); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return tester;
}
