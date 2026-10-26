"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/components/arena/client-api";
import type { TrainingState } from "@/game/training/hdmi-training";

/** Mission Hall (25 levels) only: server-issued run, Spirit Stone reward on clear, and the 100-stone revive. */
export const REVIVE_COST = 100;
export type StoneBreakdown = { base: number; timeBonus: number; cleanBonus: number; multiplier: number; seconds: number; targetSeconds: number; floor: number; total: number; revives: number };
export type StoneReward = { reward: number; breakdown: StoneBreakdown; balance: number };

/** Same table as the server (etc_mission, V30); used only to preview the reward where nothing is credited (admin preview). */
export const STONE_BASE = [120, 180, 260, 360, 500];
export const STONE_TARGET_SECONDS = [180, 240, 300, 360, 420];
export function computeStones(level: number, seconds: number, mistakes: number, revives = 0): StoneBreakdown {
  const i = Math.min(5, Math.max(1, level)) - 1, base = STONE_BASE[i], targetSeconds = STONE_TARGET_SECONDS[i], r = seconds / targetSeconds;
  const multiplier = r <= .6 ? 1.6 : r <= .85 ? 1.35 : r <= 1 ? 1.15 : r <= 1.3 ? 1 : .7;
  const cleanBonus = mistakes === 0 && revives === 0 ? 50 : 0, floor = Math.round(base * .4);
  const total = Math.max(Math.round(base * multiplier) + cleanBonus, floor);
  return { base, timeBonus: Math.round(base * multiplier) - base, cleanBonus, multiplier, seconds, targetSeconds, floor, total, revives };
}

const runKey = (stage: string) => `etc-mission-run:${stage}`;
const read = (stage: string) => { try { return sessionStorage.getItem(runKey(stage)); } catch { return null; } };
const write = (stage: string, run: string | null) => { try { if (run) sessionStorage.setItem(runKey(stage), run); else sessionStorage.removeItem(runKey(stage)); } catch { /* private mode: run lives in memory only */ } };

export function useMissionStones(enabled: boolean, stage: string) {
  const run = useRef<string | null>(null);
  const starting = useRef<Promise<string | null> | null>(null);
  const reviveKey = useRef<string | null>(null);
  const [reward, setReward] = useState<StoneReward | null>(null);
  const [error, setError] = useState("");
  const [reviving, setReviving] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const startedAt = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const revivePending = useRef(false);
  const confirmedRun = useRef(false);

  useEffect(() => { run.current = enabled ? read(stage) : null; confirmedRun.current = false; starting.current = null; setReward(null); setError(""); startedAt.current = null; setElapsed(null); }, [enabled, stage]);

  /** Opens (or, after a reload, keeps) this level's server run; the clock starts on the database side. */
  const begin = useCallback(() => {
    startedAt.current ??= Date.now();
    if (!enabled) return Promise.resolve(null);
    if (run.current && confirmedRun.current) return Promise.resolve(run.current);
    if (starting.current) return starting.current;
    starting.current = api<{ run: string }>("mission/start", { stage, run: run.current }).then((r) => { run.current = r.run; confirmedRun.current = true; write(stage, r.run); return r.run; })
      .catch((e: Error) => { setError(`ยังไม่ได้เปิดบันทึกรางวัล: ${e.message}`); return null; })
      .finally(() => { starting.current = null; });
    return starting.current;
  }, [enabled, stage]);

  /** Server re-checks the wiring, then credits the stones once for this run (retries return the same receipt). */
  const finish = useCallback(async (cables: TrainingState["cables"], mistakes: number) => {
    const seconds = startedAt.current ? Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)) : null;
    setElapsed(seconds);
    if (!enabled) {
      // Admin preview: show what this run would earn; nothing is credited.
      if (seconds !== null) { const b = computeStones(Number(stage.slice(-1)) || 1, seconds, mistakes); setReward({ reward: b.total, breakdown: b, balance: -1 }); }
      return;
    }
    const id = await begin();
    if (!id) { setError((e) => e || "รอบนี้ไม่ได้เชื่อมกับบัญชีผู้ฝึก จึงไม่ได้รับหินวิญญาณ"); return; }
    try {
      const r = await api<StoneReward>("mission/finish", { run: id, stage, cables, mistakes });
      setReward(r); setError(""); write(stage, null); run.current = null;
    } catch (e) { setError((e as Error).message); }
  }, [enabled, stage, begin]);

  /** Pays 100 stones once per failure (same idempotency key on retry); true when the level may continue. */
  const revive = useCallback(async () => {
    if (!enabled || revivePending.current) return false;
    revivePending.current = true;
    setReviving(true); setError("");
    try {
      const id = await begin();
      if (!id) throw new Error("ยังเปิดบันทึกรอบไม่ได้ กรุณาลองเล่นต่ออีกครั้ง สายและอุปกรณ์เดิมยังอยู่");
      const key = `etc-mission-revive:${id}`;
      try { reviveKey.current ??= sessionStorage.getItem(key); } catch {}
      reviveKey.current ??= crypto.randomUUID();
      try { sessionStorage.setItem(key, reviveKey.current); } catch {}
      const r = await api<{ status: string; balance: number; ledgerId: string }>("mission/revive", { run: id, idempotencyKey: reviveKey.current });
      if (r.status !== "committed" || !r.ledgerId || !Number.isFinite(Number(r.balance))) throw new Error("ยังยืนยันรายการหักหินไม่ได้ กรุณาลองอีกครั้งโดยใช้คำขอเดิม");
      setBalance(Number(r.balance));
      try { sessionStorage.removeItem(key); } catch {}
      reviveKey.current = null;
      window.dispatchEvent(new Event("etc-economy-updated"));
      return true;
    } catch (e) { setError((e as Error).message); return false; }
    finally { revivePending.current = false; setReviving(false); }
  }, [enabled, begin]);

  /** Wallet balance for the failure screen (revive is disabled below REVIVE_COST); the server still re-checks on charge. */
  const loadBalance = useCallback(async () => {
    if (!enabled) return;
    try { setBalance((await api<{ balance: number }>("economy")).balance); } catch { setBalance(null); }
  }, [enabled]);

  /** A fresh attempt ("เริ่มใหม่ทั้งด่าน") gets a new run. */
  const reset = useCallback(() => { write(stage, null); run.current = null; confirmedRun.current = false; reviveKey.current = null; startedAt.current = null; setElapsed(null); setReward(null); setError(""); }, [stage]);

  return { begin, finish, revive, reset, loadBalance, balance, elapsed, preview: !enabled, reward, error, reviving, canRevive: enabled };
}
