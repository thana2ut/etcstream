"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/components/arena/client-api";
import type { TrainingState } from "@/game/training/hdmi-training";

/** Mission Hall (25 levels) only: server-issued run, Spirit Stone reward on clear, and the 100-stone revive. */
export const REVIVE_COST = 100;
export type StoneBreakdown = { base: number; timeBonus: number; cleanBonus: number; multiplier: number; seconds: number; targetSeconds: number; floor: number; total: number; revives: number };
export type StoneReward = { reward: number; breakdown: StoneBreakdown; balance: number };

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

  useEffect(() => { run.current = enabled ? read(stage) : null; starting.current = null; setReward(null); setError(""); }, [enabled, stage]);

  /** Opens (or, after a reload, keeps) this level's server run; the clock starts on the database side. */
  const begin = useCallback(() => {
    if (!enabled || run.current || starting.current) return;
    starting.current = api<{ run: string }>("mission/start", { stage }).then((r) => { run.current = r.run; write(stage, r.run); return r.run; })
      .catch((e: Error) => { setError(`ยังไม่ได้เปิดบันทึกรางวัล: ${e.message}`); return null; })
      .finally(() => { starting.current = null; });
  }, [enabled, stage]);

  /** Server re-checks the wiring, then credits the stones once for this run (retries return the same receipt). */
  const finish = useCallback(async (cables: TrainingState["cables"], mistakes: number) => {
    if (!enabled) return;
    const id = run.current ?? await starting.current;
    if (!id) { setError((e) => e || "รอบนี้ไม่ได้เชื่อมกับบัญชีผู้ฝึก จึงไม่ได้รับหินวิญญาณ"); return; }
    try {
      const r = await api<StoneReward>("mission/finish", { run: id, stage, cables, mistakes });
      setReward(r); setError(""); write(stage, null); run.current = null;
    } catch (e) { setError((e as Error).message); }
  }, [enabled, stage]);

  /** Pays 100 stones once per failure (same idempotency key on retry); true when the level may continue. */
  const revive = useCallback(async () => {
    if (!enabled || reviving) return false;
    if (!run.current) { setError("รอบนี้ไม่ได้เชื่อมกับบัญชีผู้ฝึก จึงฟื้นด้วยหินวิญญาณไม่ได้"); return false; }
    reviveKey.current ??= crypto.randomUUID();
    setReviving(true); setError("");
    try {
      const r = await api<{ balance: number }>("mission/revive", { run: run.current, idempotencyKey: reviveKey.current });
      setBalance(r.balance);
      reviveKey.current = null;
      return true;
    } catch (e) { setError((e as Error).message); return false; }
    finally { setReviving(false); }
  }, [enabled, reviving]);

  /** Wallet balance for the failure screen (revive is disabled below REVIVE_COST); the server still re-checks on charge. */
  const loadBalance = useCallback(async () => {
    if (!enabled) return;
    try { setBalance((await api<{ balance: number }>("economy")).balance); } catch { setBalance(null); }
  }, [enabled]);

  /** A fresh attempt ("เริ่มใหม่ทั้งด่าน") gets a new run. */
  const reset = useCallback(() => { write(stage, null); run.current = null; reviveKey.current = null; setReward(null); setError(""); }, [stage]);

  return { begin, finish, revive, reset, loadBalance, balance, reward, error, reviving, canRevive: enabled };
}
