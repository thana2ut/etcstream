"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTrainingStore } from "@/game/stores/training-store";
import { deleteRun, formatSavedAt, pickTraining, writeRun, type RunKey } from "@/game/persistence/run-save";

export type SaveStatus = { state: "idle" } | { state: "saving" } | { state: "saved"; at: string } | { state: "error" };

/**
 * Autosaves the live run while `active` (in the playable room): after every meaningful store change
 * (debounced), and immediately on tab hide / page hide or an explicit flush (exit). A finished run's
 * snapshot is removed so it is never resumed or re-awarded.
 */
export function useRunAutosave(key: RunKey | null, active: boolean, lobbyBag: Record<string, number> | null) {
  const [status, setStatus] = useState<SaveStatus>({ state: "idle" });
  const timer = useRef<number | null>(null);
  const pending = useRef(false);
  const suppressed = useRef(false);
  const last = useRef("");
  const keyRef = useRef(key), bagRef = useRef(lobbyBag);
  // Keep the latest key/bag for timers and lifecycle handlers (written after render, never during it).
  useLayoutEffect(() => { keyRef.current = key; bagRef.current = lobbyBag; }, [key, lobbyBag]);

  const write = useCallback((k: RunKey | null, bag: Record<string, number> | null, force = false): boolean => {
    if (timer.current !== null) { window.clearTimeout(timer.current); timer.current = null; }
    pending.current = false;
    if (!k || !bag || suppressed.current) return true;
    const st = useTrainingStore.getState();
    if (st.scenarioId !== k.scenarioId) return true;
    if (st.completed || (k.mode !== "free-practice" && st.failed)) { deleteRun(k); last.current = ""; setStatus({ state: "idle" }); return true; }
    const training = pickTraining(st);
    const body = JSON.stringify([training, st.wrongStreak, st.failed, st.heldTurn, bag]);
    if (!force && body === last.current) return true;
    setStatus({ state: "saving" });
    const res = writeRun(k, { lobbyBag: bag, training, wrongStreak: st.wrongStreak, failed: st.failed, heldTurn: st.heldTurn });
    if (!res.ok) { setStatus({ state: "error" }); return false; }
    last.current = body;
    setStatus({ state: "saved", at: res.savedAt });
    return true;
  }, []);

  /** Write now (exit / retry button). */
  const flush = useCallback((force = false) => write(keyRef.current, bagRef.current, force), [write]);
  /** Drop pending writes and stop saving until the room is entered again (used right before a deliberate restart). */
  const discard = useCallback(() => {
    if (timer.current !== null) { window.clearTimeout(timer.current); timer.current = null; }
    pending.current = false;
    suppressed.current = true;
    setStatus({ state: "idle" });
  }, []);

  useEffect(() => {
    if (!active || !key) return;
    const k = key;
    suppressed.current = false;
    last.current = "";
    write(k, bagRef.current);
    // Only world-state fields count as changes; notices, focus and hover do not trigger writes.
    const unsub = useTrainingStore.subscribe((s, p) => {
      if (s.cables === p.cables && s.items === p.items && s.held === p.held && s.heldItem === p.heldItem && s.bagged === p.bagged
        && s.sim === p.sim && s.actionsDone === p.actionsDone && s.completed === p.completed && s.failed === p.failed && s.heldTurn === p.heldTurn) return;
      pending.current = true;
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => write(k, bagRef.current), 400);
    });
    const onHide = () => { if (document.visibilityState === "hidden") write(k, bagRef.current); };
    const onPageHide = () => write(k, bagRef.current);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      unsub();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
      // Leaving the room (pause, console, route change): commit what is still pending for this run.
      if (pending.current) write(k, bagRef.current);
    };
  }, [active, key?.playerId, key?.mode, key?.scenarioId, write]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, flush, discard };
}

export function SaveStatusPill({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  if (status.state === "idle") return null;
  return <div className={`run-save-pill is-${status.state}`} role="status" aria-live="polite">
    {status.state === "saving" && "กำลังบันทึก…"}
    {status.state === "saved" && <>บันทึกล่าสุดแล้ว · {formatSavedAt(status.at)}</>}
    {status.state === "error" && <>บันทึกไม่สำเร็จ โปรดลองอีกครั้ง <button type="button" onClick={onRetry}>ลองอีกครั้ง</button></>}
  </div>;
}

/** Continue / start-over choice shown before the briefing when this run has an unfinished save. */
export function ResumeRunDialog({ context, savedAt, incompatibleReason, onContinue, onStartOver, onLeave }: {
  context: string; savedAt?: string; incompatibleReason?: string;
  onContinue: () => void; onStartOver: () => void; onLeave: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  return <div className="run-resume-veil">
    <div className="run-resume glass-card gold-border-frame" role="dialog" aria-modal="true" aria-labelledby="run-resume-title">
      {!confirming ? <>
        <h2 id="run-resume-title">{incompatibleReason ? "พบบันทึกการฝึกที่ต้องตรวจสอบ" : "พบการฝึกที่ยังดำเนินอยู่"}</h2>
        <p className="run-resume-context">{context}</p>
        {savedAt && <p className="run-resume-time">บันทึกล่าสุด: {formatSavedAt(savedAt)}</p>}
        {incompatibleReason && <p className="run-resume-warn" role="alert">ไม่สามารถเล่นต่อจากบันทึกนี้ได้: {incompatibleReason} · บันทึกเดิมยังเก็บไว้ จนกว่าเจ้าจะเลือกเริ่มใหม่</p>}
        <div className="run-resume-actions">
          {!incompatibleReason && <button type="button" className="cultivation-btn btn-gold btn-md" onClick={onContinue} autoFocus>เล่นต่อจากครั้งล่าสุด</button>}
          <button type="button" className="cultivation-btn btn-glass btn-md" onClick={() => setConfirming(true)}>เริ่มใหม่</button>
          <button type="button" className="cultivation-back-btn welcome-back-btn" onClick={onLeave}>กลับหน้าสำนัก</button>
        </div>
      </> : <>
        <h2 id="run-resume-title">ยืนยันการเริ่มใหม่</h2>
        <p className="run-resume-context">การจัดอุปกรณ์ สาย และการตั้งค่าที่ยังไม่เสร็จ <strong>ของ{context}เท่านั้น</strong> จะถูกแทนที่ด้วยการเริ่มใหม่ ด่านที่ผ่านแล้ว ความก้าวหน้า ด่านอื่น และห้องฝึกอิสระจะไม่ถูกแตะต้อง</p>
        <div className="run-resume-actions">
          <button type="button" className="cultivation-btn btn-danger btn-md" onClick={onStartOver}>ยืนยัน เริ่มใหม่</button>
          <button type="button" className="cultivation-btn btn-glass btn-md" onClick={() => setConfirming(false)} autoFocus>ยกเลิก</button>
        </div>
      </>}
    </div>
  </div>;
}
