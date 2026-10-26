"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, notifyEconomyChanged } from "@/components/arena/client-api";
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
  const finishPending = useRef<Promise<void> | null>(null);
  const finishedReceipt = useRef<StoneReward | null>(null);
  const snapshot = useRef<{ cables: TrainingState["cables"]; mistakes: number } | null>(null);
  const [savingReward, setSavingReward] = useState(false);
  const generation = useRef(0);

  useEffect(() => {
    generation.current++;
    run.current = enabled ? read(stage) : null; confirmedRun.current = false; starting.current = null;
    finishedReceipt.current = null; snapshot.current = null; finishPending.current = null; setSavingReward(false);
    setReward(null); setError(""); startedAt.current = null; setElapsed(null);
    try {
      const pending = JSON.parse(sessionStorage.getItem(`etc-mission-result:${stage}`) ?? "null");
      if (enabled && pending?.run === run.current && pending?.cables && typeof pending.mistakes === "number") snapshot.current = { cables: pending.cables, mistakes: pending.mistakes };
    } catch {}
  }, [enabled, stage]);

  /** Opens (or, after a reload, keeps) this level's server run; the clock starts on the database side. */
  const begin = useCallback(() => {
    startedAt.current ??= Date.now();
    if (!enabled) return Promise.resolve(null);
    if (run.current && confirmedRun.current) return Promise.resolve(run.current);
    if (starting.current) return starting.current;
    const version = generation.current;
    starting.current = api<{ run: string }>("mission/start", { stage, run: run.current }).then((r) => { if (version !== generation.current) return null; run.current = r.run; confirmedRun.current = true; write(stage, r.run); return r.run; })
      .catch((e: Error) => { if (version === generation.current) setError(`ยังไม่ได้เปิดบันทึกรางวัล: ${e.message}`); return null; })
      .finally(() => { if (version === generation.current) starting.current = null; });
    return starting.current;
  }, [enabled, stage]);

  /** Server re-checks the wiring, then credits the stones once for this run (retries return the same receipt). */
  const finish = useCallback((cables: TrainingState["cables"], mistakes: number): Promise<void> => {
    if (finishPending.current) return finishPending.current;
    if (finishedReceipt.current) return Promise.resolve();
    const version = generation.current;
    snapshot.current = { cables, mistakes };
    const settle = async () => {
    const seconds = startedAt.current ? Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)) : null;
    setElapsed(seconds);
    if (!enabled) {
      // Admin preview: show what this run would earn; nothing is credited.
      if (seconds !== null) { const b = computeStones(Number(stage.slice(-1)) || 1, seconds, mistakes); setReward({ reward: b.total, breakdown: b, balance: -1 }); }
      return;
    }
    const id = await begin();
    if (version !== generation.current) return;
    if (!id) { setError((e) => e || "รอบนี้ไม่ได้เชื่อมกับบัญชีผู้ฝึก จึงไม่ได้รับหินวิญญาณ"); return; }
    try { sessionStorage.setItem(`etc-mission-result:${stage}`, JSON.stringify({ run: id, cables, mistakes })); } catch {}
    try {
      const r = await api<StoneReward>("mission/finish", { run: id, stage, cables, mistakes });
      if (!Number.isSafeInteger(r.reward) || r.reward < 0 || !r.breakdown || !Number.isFinite(r.balance)) throw new Error("ข้อมูลใบรับรางวัลยังไม่ครบ กรุณากดบันทึกรางวัลซ้ำ");
      if (version !== generation.current) { notifyEconomyChanged(); return; }
      finishedReceipt.current = r;
      setReward(r); setBalance(r.balance); setError(""); write(stage, null);
      try { sessionStorage.removeItem(`etc-mission-result:${stage}`); } catch {}
      notifyEconomyChanged();
    } catch (e) { if (version === generation.current) setError((e as Error).message); }
    };
    setSavingReward(true);
    const pending = settle().finally(() => { if (version === generation.current) { finishPending.current = null; setSavingReward(false); } });
    finishPending.current = pending;
    return pending;
  }, [enabled, stage, begin]);
  const retryFinish = useCallback(() => snapshot.current ? finish(snapshot.current.cables, snapshot.current.mistakes) : Promise.resolve(), [finish]);

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
      notifyEconomyChanged();
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
  const reset = useCallback(() => { write(stage, null); run.current = null; confirmedRun.current = false; reviveKey.current = null; finishedReceipt.current = null; snapshot.current = null; try { sessionStorage.removeItem(`etc-mission-result:${stage}`); } catch {} startedAt.current = null; setElapsed(null); setReward(null); setError(""); }, [stage]);

  return { begin, finish, retryFinish, savingReward, revive, reset, loadBalance, balance, elapsed, preview: !enabled, reward, error, reviving, canRevive: enabled };
}
