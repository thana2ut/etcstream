"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, notifyEconomyChanged } from "@/components/arena/client-api";
import { subscribeCompetitionCommands, type CompetitionCommand } from "@/game/training/competition-commands";
import { useTrainingStore } from "@/game/stores/training-store";
import { initialTrainingState, trainingProgress, type TrainingState } from "@/game/training/hdmi-training";
import { freshClassroomLearning } from "@/game/training/classroom-rules";

type Reply = { available: boolean; message?: string; id?: string; seq?: number; state?: TrainingState; status?: string; reward?: number; balance?: number };
const storageKey = "etc-classroom-run-eleven-v2";

export function useClassroomRun(enabled: boolean, bag: Record<string, number> | null) {
  const [ready, setReady] = useState(false), [available, setAvailable] = useState(false);
  const [error, setError] = useState(""), [reward, setReward] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | null>(null), [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [syncBlocked, setSyncBlocked] = useState(false), [pending, setPending] = useState(false);
  const generation = useRef(0);
  const run = useRef<string | null>(null), seq = useRef(0), queue = useRef<CompetitionCommand[]>([]);
  const draining = useRef(false), live = useRef(false), authoritative = useRef(false), blocked = useRef(false);
  const applyState = (reply: Reply) => {
    if (reply.state) useTrainingStore.setState({ ...reply.state, invalidConnectionAttempt: false, wrongStreak: reply.state.classroom?.mistakes ?? 0, failed: reply.state.classroom?.failed ?? false, focusedTarget: null, inspecting: null, inspectHoldStart: null });
    if (typeof reply.balance === "number") setBalance(reply.balance);
    if (typeof reply.reward === "number") { setReward(reply.reward); notifyEconomyChanged(); }
  };
  const drain = useCallback(async () => {
    if (draining.current || !authoritative.current || blocked.current || !run.current) return;
    draining.current = true;
    const version = generation.current, runId = run.current;
    setPending(true);
    try {
      while (queue.current.length && live.current) {
        const reply = await api<Reply>("classroom/command", { run: runId, seq: seq.current + 1, command: queue.current[0] });
        if (!live.current || version !== generation.current) return;
        seq.current++; queue.current.shift();
        if (typeof reply.balance === "number") setBalance(reply.balance);
        if (typeof reply.reward === "number") { setReward(reply.reward); notifyEconomyChanged(); }
        if (reply.status === "completed") { try { sessionStorage.removeItem(storageKey); } catch {} }
      }
      setError("");
    } catch (e) { if (version === generation.current) { blocked.current = true; setSyncBlocked(true); setError((e as Error).message); } }
    finally { if (version === generation.current) { draining.current = false; setPending(false); } }
  }, []);

  useEffect(() => {
    if (!enabled || !bag) return;
    live.current = true;
    const version = ++generation.current;
    if (!useTrainingStore.getState().classroom) useTrainingStore.setState({ classroom: freshClassroomLearning() });
    const unsubscribe = subscribeCompetitionCommands((command) => {
      if (authoritative.current && version === generation.current && ["interact", "drop", "takeCable", "stowHeld", "review"].includes(command.method)) { queue.current.push(command); setPending(true); void drain(); }
    });
    void (async () => {
      let stored: string | null = null;
      try { stored = sessionStorage.getItem(storageKey); } catch {}
      const local = useTrainingStore.getState();
      if (!stored && (trainingProgress(local) > 0 || local.held || local.heldItem || JSON.stringify(local.items) !== JSON.stringify(initialTrainingState("studio-full").items))) {
        setError("รอบที่บันทึกก่อนอัปเดตยังไม่มีหลักฐานรับหิน เริ่มรอบใหม่หากต้องการรับรางวัล"); setReady(true); return;
      }
      const id = stored ?? crypto.randomUUID(); run.current = id;
      try {
        const reply = await api<Reply>("classroom/start", { run: id, bag });
        if (!live.current || version !== generation.current) return;
        authoritative.current = reply.available === true;
        setAvailable(authoritative.current);
        if (authoritative.current) { seq.current = reply.seq ?? 0; applyState(reply); try { sessionStorage.setItem(storageKey, id); } catch {} }
        else setError(reply.message ?? "ระบบหินยังไม่พร้อม");
      } catch (e) { if (live.current && version === generation.current) setError((e as Error).message); }
      finally { if (live.current && version === generation.current) setReady(true); }
    })();
    return () => { live.current = false; generation.current++; unsubscribe(); };
    // One authoritative stream per mounted attempt; the packed bag is immutable during play.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, bag, attempt, drain]);

  const retrySync = useCallback(async () => {
    if (!run.current || !authoritative.current) return;
    blocked.current = false; setSyncBlocked(false); await drain();
  }, [drain]);
  const revive = useCallback(async () => {
    if (!available || busy || blocked.current || queue.current.length || draining.current || !run.current) return false;
    const version = generation.current;
    setBusy(true); setError("");
    try { const reply = await api<Reply>("classroom/revive", { run: run.current, revision: seq.current }); if (!live.current || version !== generation.current) return false; applyState(reply); return true; }
    catch (e) { if (version === generation.current) setError((e as Error).message); return false; }
    finally { if (version === generation.current) setBusy(false); }
  }, [available, busy]);
  const loadBalance = useCallback(async () => {
    try { setBalance((await api<{ balance: number }>("economy")).balance); }
    catch { /* The revive RPC still checks the actual balance atomically. */ }
  }, []);
  const reset = useCallback(() => {
    try { sessionStorage.removeItem(storageKey); } catch {}
    generation.current++; draining.current = false;
    authoritative.current = false; blocked.current = false; run.current = null; seq.current = 0; queue.current = [];
    setReady(false); setSyncBlocked(false); setPending(false); setAvailable(false); setReward(null); setBalance(null); setError(""); setAttempt((n) => n + 1);
  }, []);
  return { ready, available, error, reward, balance, busy: busy || pending, syncBlocked, revive, reset, retrySync, loadBalance };
}
