"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameCanvas } from "@/components/game/game-canvas";
import { TrainingHud } from "@/components/game/training-hud";
import { FirstPersonHands } from "@/components/game/first-person-hands";
import { EquipmentInspector, InspectHoldRing } from "@/components/game/equipment-inspector";
import { BagPanel } from "@/components/game/bag-panel";
import { OperatorConsole, ReviewOverlay } from "@/components/game/operator-console";
import { TouchControls } from "@/components/game/touch-controls";
import { useTrainingStore } from "@/game/stores/training-store";
import { SCENARIOS } from "@/game/training/scenarios";
import type { AdminPreviewContext } from "@/game/security/admin-preview-types";
import { useGameAudio } from "@/components/audio/audio-provider";
import { api } from "./client-api";

/** Isolated playable wrapper over the ORIGINAL room/controller/graph/inventory. No academy or rank writes. */
export function AdminPreview({ context, onExit }: { context: AdminPreviewContext; onExit: () => void }) {
  const [ready, setReady] = useState(false), [error, setError] = useState("");
  const [bagOpen, setBagOpen] = useState(false), [paused, setPaused] = useState(false);
  const [fallbackLook, setFallbackLook] = useState(false), [touch, setTouch] = useState(false);
  const [replay, setReplay] = useState(0), [confirmed, setConfirmed] = useState(false);
  const consoleOpen = useTrainingStore((s) => s.consoleOpen);
  const failed = useTrainingStore((s) => s.failed);
  const completed = useTrainingStore((s) => s.completed);
  const bagged = useTrainingStore((s) => s.bagged?.length ?? 0);
  const inspecting = useTrainingStore((s) => s.inspecting);
  const simPaused = useTrainingStore((s) => Boolean(s.sim?.paused));
  const { setPlayPhase } = useGameAudio();
  const pausePanel = useRef<HTMLDivElement>(null);
  const scenario = SCENARIOS[context.scenarioId];
  const escapePointer = useCallback(() => { if (document.pointerLockElement) document.exitPointerLock(); }, []);
  const exitFallback = useCallback(() => setFallbackLook(false), []);
  const enableFallback = useCallback(() => setFallbackLook(true), []);
  useEffect(() => {
    const previous = useTrainingStore.getState();
    // Restore only transient scene state on exit. No load/save or player-progress repository is used.
    return () => { useTrainingStore.setState(previous); if (document.pointerLockElement) document.exitPointerLock(); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let verifying = false;
    const check = async () => {
      if (verifying) return;
      verifying = true;
      try {
        const response = await api<{ valid: boolean }>(`preview-session?id=${encodeURIComponent(context.id)}&scenario=${encodeURIComponent(context.scenarioId)}`, undefined, true, controller.signal);
        if (!response.valid || Date.now() >= context.expires) throw new Error("สิทธิ์เล่นตรวจหมดอายุ กรุณาเปิดด่านจากตำหนักใหม่");
        setConfirmed(true);
      } catch (e) { if ((e as Error).name !== "AbortError") { setConfirmed(false); setError((e as Error).message); escapePointer(); } }
      finally { verifying = false; }
    };
    void check();
    const timer = window.setInterval(() => void check(), 15000);
    const expiry = window.setTimeout(() => { setConfirmed(false); setError("ครบเวลาเล่นตรวจ กรุณาเปิดด่านใหม่จากตำหนัก"); escapePointer(); }, Math.max(0, context.expires - Date.now()));
    const visible = () => { if (document.visibilityState === "visible") void check(); };
    document.addEventListener("visibilitychange", visible);
    return () => { controller.abort(); clearInterval(timer); clearTimeout(expiry); document.removeEventListener("visibilitychange", visible); };
  }, [context.id, context.expires, context.scenarioId, escapePointer]);
  useEffect(() => {
    if (!confirmed) return;
    const installed = new Set((scenario.initialConnections ?? []).map((c) => c.cableId));
    const hidden = scenario.cables.filter((c) => !c.fixedA && !installed.has(c.id) && !context.loadout.leads.includes(c.id)).map((c) => c.id);
    useTrainingStore.getState().reset(context.scenarioId, hidden, context.loadout.leads);
    setReady(true); setBagOpen(false); setPaused(false);
  }, [context.scenarioId, context.loadout, scenario, replay, confirmed]);
  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse), (max-width: 768px)");
    const update = () => setTouch(query.matches); update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const key = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input,textarea,select,[contenteditable=true]") || e.repeat) return;
      if (e.code === "KeyR" && !inspecting && !paused && !consoleOpen) { e.preventDefault(); escapePointer(); setBagOpen((v) => !v); }
      if (e.code === "KeyC" && scenario.stage && !inspecting) { e.preventDefault(); escapePointer(); useTrainingStore.getState().setConsoleOpen(!useTrainingStore.getState().consoleOpen); }
      if (e.key === "Escape" && !inspecting && !bagOpen && !consoleOpen) setPaused(true);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [ready, inspecting, paused, consoleOpen, bagOpen, scenario.stage, escapePointer]);
  useEffect(() => { if (paused || failed || completed) escapePointer(); }, [paused, failed, completed, escapePointer]);
  useEffect(() => {
    if (!paused && !failed) return;
    const previous = document.activeElement as HTMLElement | null;
    pausePanel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => previous?.focus();
  }, [paused, failed]);
  const active = ready && confirmed && !error && !paused && !bagOpen && !consoleOpen && !failed && !simPaused;
  useEffect(() => { setPlayPhase(active ? "gameplay" : "intro"); return () => setPlayPhase("intro"); }, [active, setPlayPhase]);
  if (error) return <section className="admin-preview-status" role="alert"><h2>ปิดการเล่นตรวจ</h2><p>{error}</p><button onClick={onExit}>กลับตำหนักบัญชาการ</button></section>;
  if (!ready || !confirmed) return <section className="admin-preview-status" role="status"><p>กำลังตรวจสิทธิ์และเตรียมสายเฉพาะด่าน…</p><button onClick={onExit}>กลับตำหนักบัญชาการ</button></section>;
  return <section className="fantasy-viewport game-screen play-page admin-playable-preview" aria-label="การเล่นตรวจของผู้ดูแล">
    <div className="game-viewport" style={{ position: "absolute", inset: 0 }}><GameCanvas key={`${context.id}-${replay}`} venue={context.venue} active={active} fallbackLook={fallbackLook} touch={touch} onExitFallback={exitFallback} onPointerLockError={enableFallback} /></div>
    <div className="admin-preview-badge">โหมดผู้ดูแล / ไม่บันทึกผล · {context.title}</div>
    <button className="admin-preview-pause" onClick={() => { escapePointer(); setPaused(true); }}>พัก / กลับตำหนัก</button>
    {!paused && <><FirstPersonHands /><InspectHoldRing /><EquipmentInspector /><TrainingHud title={context.title} objective="ตรวจการจัดวาง ต่อสาย ตั้งค่า และตรวจสัญญาณด้วยตนเอง · ไม่มีคะแนนหรือการปลดล็อก" touch={touch} /><div className="game-center-reticle" aria-hidden="true" /><button className="cl-bag-button" onClick={() => { escapePointer(); setBagOpen(true); }}>🎒 กระเป๋า <b>{bagged}</b></button>{bagOpen && <BagPanel bag={context.loadout.bag} onClose={() => setBagOpen(false)} />}{scenario.stage && <button className="admin-preview-console" onClick={() => { escapePointer(); useTrainingStore.getState().setConsoleOpen(true); }}>คอนโซล (C)</button>}<OperatorConsole /><ReviewOverlay />{touch && active && <TouchControls />}</>}
    {(paused || failed) && <div ref={pausePanel} className="admin-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-preview-pause-title" onKeyDown={(e) => {
      if (e.key !== "Tab") return;
      const controls = pausePanel.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }}><section className="glass-card gold-border-frame"><h2 id="admin-preview-pause-title">{failed ? "ด่านตรวจหยุดจากเงื่อนไขเกมเดิม" : "พักการเล่นตรวจ"}</h2><p>การเล่นตรวจไม่บันทึกผลหรือเปลี่ยนความคืบหน้าผู้เล่น</p>{!failed && <button onClick={() => setPaused(false)}>เล่นตรวจต่อ</button>}<button onClick={() => { escapePointer(); setReady(false); setReplay((n) => n + 1); }}>เริ่มตรวจใหม่พร้อมชุดสายเดิม</button><button onClick={onExit}>กลับตำหนักบัญชาการ</button></section></div>}
    {completed && !paused && <div className="admin-preview-complete" role="status">ระบบประเมินภายในฉากครบตามเงื่อนไข · ไม่มอบคะแนน ความสำเร็จ หรือการปลดล็อก</div>}
  </section>;
}
