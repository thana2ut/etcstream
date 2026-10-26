"use client";
import { useEffect, useRef } from "react";
import { useTrainingStore } from "@/game/stores/training-store";
import { CLASSROOM_REVIVE_COST } from "@/game/training/classroom-rules";
import { formatClassroomTime } from "./use-classroom-timer";
import { MissionOutcomeModal } from "@/components/ui/mission-result-modal";

export function ClassroomStatus({ elapsed }: { elapsed: number }) {
  const formatted = formatClassroomTime(elapsed);
  return <aside className="classroom-status" aria-label={`เวลาฝึก ${formatted}`}><p role="timer" aria-label={`เวลาที่ใช้ ${formatted}`}><strong>{formatted}</strong></p></aside>;
}

export function ClassroomLearning({ failed, available, busy, balance, error, onRevive, onRestart, onLeave, onRetrySync, missionTitle, elapsed, completed, total }: {
  failed: boolean; available: boolean; busy: boolean; balance: number | null; error: string;
  onRevive: () => void; onRestart: () => void; onLeave: () => void; onRetrySync: () => void;
  missionTitle: string; elapsed: number; completed: number; total: number;
}) {
  const question = useTrainingStore((state) => state.classroom?.question);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!failed && !question) return;
    if (document.pointerLockElement) document.exitPointerLock();
    if (!dialog.current?.open) dialog.current?.showModal();
  }, [failed, question]);
  if (failed) return <MissionOutcomeModal status="failed" missionTitle={missionTitle} venue="ห้องฝึก" level={1}
    completed={completed} total={total} mistakes={3} elapsed={Math.floor(elapsed / 1000)} balance={balance}
    reviveCost={CLASSROOM_REVIVE_COST} returnLabel="กลับสู่สำนัก" retryLabel="เริ่มใหม่ทั้งห้อง"
    failureReason="ผิดพลาดครบ 3/3 ครั้ง สายที่ต่อถูกและอุปกรณ์เดิมยังคงอยู่"
    stonesError={error || undefined} reviveDisabled={!available || balance === null} onRetrySync={onRetrySync}
    reviving={busy} onRevive={onRevive} onRetry={onRestart} onReturn={onLeave} />;
  if (!failed && !question) return null;
  return <dialog ref={dialog} className="classroom-learning-dialog" aria-labelledby="classroom-learning-title" onCancel={(event) => event.preventDefault()}>
    {question && <><p className="classroom-kicker">พักกระบี่ ทบทวนวิชา · ผิดพลาด 2/3</p><h2 id="classroom-learning-title">{question.title}</h2><p className="classroom-lesson">จุดที่ต่อผิด: {question.hint}</p><p>เลือกคำตอบที่ถูกต้องเพื่อฝึกต่อ หากตอบผิดจะนับเพิ่มอีก 1 ครั้ง</p><div className="classroom-choices">{question.options.map((option, index) => <button type="button" key={option} onClick={() => useTrainingStore.getState().review(index)}>{option}</button>)}</div></>}
  </dialog>;
}
