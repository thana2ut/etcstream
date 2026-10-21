"use client";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useProgress } from "@react-three/drei";
import Link from "next/link";
import { useTrainingStore } from "@/game/stores/training-store";
import { SCENARIOS, type ScenarioId } from "@/game/training/scenarios";
import { initSim } from "@/game/training/hdmi-training";
import { hiddenCablesFor, packedLeadsFor } from "@/game/content/cable-catalog";
import { missionChapters } from "@/game/content/mission-catalog";
import { loadSceneFont } from "@/game/rendering/scene-font";
import { GameCanvas } from "@/components/game/game-canvas";
import { TrainingHud } from "@/components/game/training-hud";
import { ReviewOverlay } from "@/components/game/operator-console";
import { EquipmentInspector, InspectHoldRing } from "@/components/game/equipment-inspector";
import { BagPanel } from "@/components/game/bag-panel";
import { CableLobby } from "@/components/ui/cable-lobby";
import { TouchControls } from "@/components/game/touch-controls";
import { FirstPersonHands } from "@/components/game/first-person-hands";
import { ArenaBanner, ArenaConfirmDialog, ArenaEmptyState, ArenaIcon, ArenaShell } from "./shell";
import { api, statusText, timeText, type AttemptView } from "./client-api";
import { RewardReceipt } from "./economy";
import { subscribeCompetitionCommands, type CompetitionCommand } from "@/game/training/competition-commands";
import {AttemptStanding} from "./online";

function AssetGate({ onReady }: { onReady: () => void }) {
  const progress = useProgress();
  useEffect(() => {
    if (progress.active || progress.total === 0 || progress.loaded !== progress.total) return;
    const timer = setTimeout(() => { void loadSceneFont().then(onReady).catch(() => undefined); }, 700);
    return () => clearTimeout(timer);
  }, [progress.active, progress.loaded, progress.total, onReady]);
  return null;
}
/** The fast clock owns its own renders; the 3D room never rerenders for each tick. */
function ArenaClock({ start, epoch, phase }: { start: number; epoch: RefObject<number>; phase: "briefing" | "game" }) {
  const [now, setNow] = useState(() => performance.now() + epoch.current);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(performance.now() + epoch.current), 100);
    return () => window.clearInterval(timer);
  }, [epoch]);
  return <>{now < start
    ? phase === "briefing" ? `เริ่มใน ${Math.ceil((start - now) / 1000)} วินาที` : `เริ่มใน ${Math.max(1, Math.ceil((start - now) / 1000))}`
    : timeText(Math.max(0, now - start))}</>;
}
export function ArenaPlay({ id }: { id: string }) {
  const [attempt, setAttempt] = useState<AttemptView | null>(null), [error, setError] = useState(""), [bag, setBag] = useState<Record<string,number> | null>(null);
  const [briefing, setBriefing] = useState(true), [assetsReady, setAssetsReady] = useState(false), [bagOpen, setBagOpen] = useState(false), [fallback, setFallback] = useState(false), [busy, setBusy] = useState(false), [touch, setTouch] = useState(false);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const [started, setStarted] = useState(false), [pointerLocked, setPointerLocked] = useState(false);
  const actionPending = useRef(false);
  const clockOffset = useRef(0), clockEpoch = useRef(0), seq = useRef(0), queue = useRef(Promise.resolve());
  const complete = useTrainingStore((s) => s.completed), simPaused = useTrainingStore((s) => Boolean(s.sim?.paused));
  const bagCount = useTrainingStore((s) => s.bagged?.length ?? 0);
  const previousErrors = useRef(0);
  const commands = useRef<{ seq: number; command: CompetitionCommand }[]>([]);
  const commandSequence = useRef(0), inFlight = useRef<Promise<void> | null>(null);
  const [syncError, setSyncError] = useState("");
  const drain = useCallback((): Promise<void> => {
    if (inFlight.current) return inFlight.current;
    const task = (async () => {
      try {
        while (commands.current.length) {
          const next = commands.current[0];
          const result = await api<AttemptView>(`attempts/${id}`, { action: "command", ...next });
          commands.current.shift(); setAttempt(result);
        }
        setSyncError("");
      } catch (e) { setSyncError((e as Error).message); }
    })();
    inFlight.current = task;
    void task.finally(() => { inFlight.current = null; });
    return task;
  }, [id]);
  useEffect(() => subscribeCompetitionCommands((command) => {
    if (attempt?.status !== "RUNNING" || attempt.protocol !== "server-command-v1" || Date.now() + clockOffset.current < Number(attempt.start)) return;
    commands.current.push({ seq: ++commandSequence.current, command });
    void drain();
  }), [attempt?.status, attempt?.protocol, attempt?.start, drain]);
  const markAssetsReady = useCallback(() => setAssetsReady(true), []);
  const exitFallback = useCallback(() => setFallback(false), []);
  const enterFallback = useCallback(() => setFallback(true), []);
  useEffect(() => {
    const update = () => setPointerLocked(Boolean(document.pointerLockElement));
    document.addEventListener("pointerlockchange", update);
    return () => document.removeEventListener("pointerlockchange", update);
  }, []);
  useEffect(() => {
    const resync = () => { clockEpoch.current = Date.now() + clockOffset.current - performance.now(); };
    document.addEventListener("visibilitychange", resync);
    window.addEventListener("focus", resync);
    return () => { document.removeEventListener("visibilitychange", resync); window.removeEventListener("focus", resync); };
  }, []);
  useEffect(() => {
    if (attempt?.status !== "RUNNING" || attempt.start === null) return;
    const remaining = Number(attempt.start) - (performance.now() + clockEpoch.current);
    if (remaining <= 0) { setStarted(true); return; }
    setStarted(false);
    const timer = window.setTimeout(() => setStarted(true), remaining);
    return () => window.clearTimeout(timer);
  }, [attempt?.status, attempt?.start]);
  useEffect(() => {
    if (!attempt?.id) return;
    let live = true;
    const beat = () => {
      if (document.hidden) return;
      void api("heartbeat", {}).catch(() => { if (live) setError("ขาดการเชื่อมต่อข้อมูลกลาง เวลาเซิร์ฟเวอร์ยังเดินต่อ กรุณาตรวจเครือข่ายก่อนส่งผล"); });
    };
    const timer = window.setInterval(beat, 30000);
    return () => { live = false; clearInterval(timer); };
  }, [attempt?.id]);
  useEffect(() => {
    const saved = useTrainingStore.getState(); let live = true;
    api<AttemptView>(`attempts/${id}`).then((a) => {
      if (!live) return;
      clockOffset.current = (a.serverNow || Date.now()) - Date.now();
      clockEpoch.current = (a.serverNow || Date.now()) - performance.now();
      seq.current=a.eventSeq || 0;
      commandSequence.current = a.replay?.seq || 0;
      setAttempt(a.replay ? { ...a, protocol: a.replay.protocol, commandSeq: a.replay.seq } : a);
      if (SCENARIOS[a.scenario as ScenarioId]) {
        useTrainingStore.getState().reset(a.scenario as ScenarioId);
        useTrainingStore.setState({ sim: initSim(SCENARIOS[a.scenario as ScenarioId], a.seed || 1) });
      }
      if (a.replay && a.status === "RUNNING") {
        useTrainingStore.setState(a.replay.state);
        setBag(a.replay.bag); setBriefing(false);
      }
      setTouch(window.matchMedia("(pointer: coarse)").matches);
    }).catch((e) => { if (live) setError(e.message); });
    return () => { live = false; if (document.pointerLockElement) document.exitPointerLock(); useTrainingStore.setState(saved, true); };
  }, [id]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirmAbandon || !bag || attempt?.status !== "RUNNING" || Date.now() + clockOffset.current < Number(attempt.start) || e.repeat) return;
      const target = e.target as HTMLElement;
      if (["INPUT","SELECT","TEXTAREA"].includes(target.tagName)) return;
      if (e.code === "KeyC") { if (document.pointerLockElement) document.exitPointerLock(); setBagOpen((v) => !v); }
    }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [bag, attempt?.status, attempt?.start, confirmAbandon]);
  useEffect(() => useTrainingStore.subscribe((state) => {
    const errors = state.sim?.errors || 0;
    const delta = errors - previousErrors.current; previousErrors.current = errors;
    if (attempt?.protocol === "server-command-v1" || delta <= 0 || attempt?.status !== "RUNNING" || Date.now() + clockOffset.current < Number(attempt.start)) return;
    for (let n = 0; n < delta; n++) {
      const eventSeq = ++seq.current;
      const kind = /หัวต่อ|ชนิดสาย|ขั้ว/.test(state.notice?.detail || "") ? "connector" : "route";
      queue.current = queue.current.then(async () => { try { setAttempt(await api<AttemptView>(`attempts/${id}`, { action: "event", seq: eventSeq, kind })); } catch (e) { setError((e as Error).message); } });
    }
  }), [attempt?.status, attempt?.start, attempt?.protocol, id]);
  const act = async (action: string) => {
    if (actionPending.current) return;
    actionPending.current = true;
    setBusy(true); try {
      await queue.current;
      await drain();
      if (commands.current.length) throw new Error("ยังมีคำสั่งที่ส่งไม่ครบ กรุณาเชื่อมต่อและส่งซ้ำก่อนส่งผล");
      const s = useTrainingStore.getState();
      const a = await api<AttemptView>(`attempts/${id}`, { action, ...(action === "ready" ? { bag } : {}), ...(action === "finish" && attempt?.protocol !== "server-command-v1" ? { state: { cables: s.cables, items: s.items, sim: s.sim } } : {}) });
      clockOffset.current = (a.serverNow || Date.now()) - Date.now();
      clockEpoch.current = (a.serverNow || Date.now()) - performance.now();
      setAttempt(a); setError("");
    } catch (e) { setError((e as Error).message); } finally { actionPending.current = false; setBusy(false); }
  };
  if (!attempt) return <ArenaShell><ArenaBanner title="ภารกิจจับเวลา" file="card-time-attack" /><section className="arena-panel">{error ? <ArenaEmptyState icon="time-attack" title="ยังเปิดรอบนี้ไม่ได้" href="/arena/time-attack" action="กลับไปเลือกภารกิจ"><span role="alert">{error}</span></ArenaEmptyState> : <p role="status" className="arena-skeleton">กำลังเปิดใบภารกิจ…</p>}</section></ArenaShell>;
  const scenario = SCENARIOS[attempt.scenario as ScenarioId];
  if (!scenario?.stage) return <ArenaShell><ArenaBanner title="ข้อมูลด่านไม่พร้อม" file="card-time-attack" /><section className="arena-panel"><ArenaEmptyState icon="time-attack" title="ยังเปิดใบภารกิจนี้ไม่ได้" href="/arena/time-attack" action="กลับไปเลือกภารกิจ">ข้อมูลด่านของรอบนี้ยังไม่พร้อมใช้งาน</ArenaEmptyState></section></ArenaShell>;
  const venue = ({ xs: "classroom", s: "studio", m: "auditorium", l: "outdoor", xl: "stadium" } as const)[scenario.venueScale!];
  const venueLabel = missionChapters.find((chapter) => chapter.venueId === venue)?.venue;
  const abandonDialog = <ArenaConfirmDialog open={confirmAbandon} title="ยุติรอบฝึกนี้หรือไม่?" busy={busy} onCancel={() => setConfirmAbandon(false)} onConfirm={() => void act("abandon")}>รอบนี้จะถูกบันทึกว่ายุติ และไม่นำผลไปจัดอันดับ{error && <span className="arena-dialog-error" role="alert">{error}</span>}</ArenaConfirmDialog>;
  if (!["PENDING","RUNNING"].includes(attempt.status)) return <ArenaShell>
    <ArenaBanner title="ผลรอบฝึกกาลเวลา" file="card-time-attack"><p>{venueLabel} · {scenario.stage.title}</p></ArenaBanner>
    <section className="arena-panel arena-result" data-outcome={attempt.status}>
      <div className="arena-result-seal" aria-hidden="true"><ArenaIcon name={attempt.status === "VERIFIED" ? "trophy" : "time-attack"} /></div>
      <span className={`arena-status${attempt.status === "DNF" ? " is-muted" : ""}`}>{statusText(attempt.status)}</span>
      <h2>{attempt.status === "DNF" ? "รอบนี้ยุติแล้ว" : "บันทึกผลรอบนี้แล้ว"}</h2>
      <p>{attempt.start === null ? "ยุติก่อนเริ่มจับเวลา จึงไม่มีเวลาสำหรับรอบนี้" : attempt.reason || "ผลรอบนี้เป็นไปตามสถานะที่ระบบบันทึก"}</p>
      <dl className="arena-stats">
        <div><dt>เวลาจริง</dt><dd>{attempt.start === null ? "—" : timeText(attempt.elapsedMs)}</dd></div>
        <div><dt>บทลงโทษ</dt><dd>{attempt.start === null ? "—" : timeText(attempt.penaltyMs)}</dd></div>
        <div><dt>เวลารวม</dt><dd>{attempt.start === null ? "—" : timeText(attempt.totalMs)}</dd></div>
      </dl>
      <p className="arena-muted">การตรวจการต่อสัญญาณเบื้องต้น: {attempt.graphValid ? "ผ่าน" : "ยังไม่ผ่าน"} · {attempt.status === "VERIFIED" ? "ระบบบันทึกสถานะยืนยันแล้ว" : "ผลนี้ไม่ถูกนำเข้าอันดับอัตโนมัติ"}</p>
      <RewardReceipt attempt={attempt}/>
      <AttemptStanding attempt={attempt}/>
      <div className="arena-actions"><Link className="arena-action" href="/arena/time-attack">เลือกรอบฝึกใหม่</Link><Link className="arena-action arena-button-secondary" href="/arena/profile">ดูประวัติของฉัน</Link><Link className="arena-text-link" href="/arena">กลับหอประลอง →</Link></div>
    </section>
  </ArenaShell>;
  if (briefing) return <ArenaShell>
    <ArenaBanner title="ใบงานก่อนเข้าฝึก" file="card-time-attack"><p>{venueLabel} · {scenario.stage.title}</p></ArenaBanner>
    <div className="arena-split arena-round-brief">
      <section className="arena-panel">
        <div className="arena-round-status"><span className="arena-status">{statusText(attempt.status)}</span><strong>{attempt.status !== "RUNNING" ? "ยังไม่เริ่มจับเวลา" : <ArenaClock start={Number(attempt.start)} epoch={clockEpoch} phase="briefing" />}</strong></div>
        <span className="arena-eyebrow">{scenario.stage.id} · {venueLabel}</span>
        <h2>เป้าหมายของรอบนี้</h2><p>{scenario.stage.ticket}</p>
        <ol className="arena-connection-steps">{scenario.stage.briefing.map((line, index) => <li key={line}><span>{index + 1}</span><span>{line}</span></li>)}</ol>
      </section>
      <aside className="arena-panel"><h2>เตรียมตัวก่อนเริ่ม</h2>
        <ol className="arena-checklist"><li>อ่านใบงาน แล้วเลือกสายที่ต้องใช้</li><li>รอฉากและฟอนต์โหลดครบก่อนกดพร้อม</li><li>ตรวจการต่อและตั้งค่า ก่อนส่งผลให้ระบบตรวจ</li></ol>
        <p className="arena-muted">เส้นทางรับรองคำสั่งรองรับเฉพาะห้องเรียนระดับ 1 และต้องเปิดโดยเจ้าของ ระดับอื่นยังรอตรวจ เวลาเดินต่อเมื่อเปลี่ยนแท็บหรือหลุดการเชื่อมต่อ การโหลดหน้าซ้ำจะจัดห้องใหม่แต่ไม่เริ่มนับเวลาใหม่</p>
        {error && <p role="alert">{error}</p>}
        <div className="arena-actions"><button disabled={busy} onClick={() => setBriefing(false)}>ไปเตรียมสาย →</button><button className="arena-button-danger" disabled={busy} onClick={() => setConfirmAbandon(true)}>ยุติรอบนี้</button></div>
      </aside>
    </div>
    {abandonDialog}
  </ArenaShell>;
  if (!bag) return <CableLobby scenario={scenario} title={scenario.stage.title} levelLabel={scenario.stage.id} objective={scenario.stage.ticket} backLabel="กลับใบงาน" onBack={() => setBriefing(true)} onConfirm={(packed) => {
    useTrainingStore.getState().reset(attempt.scenario as ScenarioId, hiddenCablesFor(scenario, packed), packedLeadsFor(scenario, packed));
    useTrainingStore.setState({ sim: initSim(scenario, attempt.seed || 1) }); previousErrors.current = 0; setBag(packed);
  }} />;
  const running = attempt.status === "RUNNING" && started;
  return <main className="fantasy-viewport game-screen play-page" style={{ position: "fixed", inset: 0, background: "#081325" }}>
    <div className="game-viewport" style={{ position: "absolute", inset: 0, zIndex: 0 }}><GameCanvas key={scenario.id} venue={venue} active={running && !confirmAbandon && !bagOpen && !simPaused} fallbackLook={fallback} touch={touch} onExitFallback={exitFallback} onPointerLockError={enterFallback} /></div>
    <AssetGate onReady={markAssetsReady} />
    {running && !confirmAbandon && <><FirstPersonHands /><div className="game-center-reticle" aria-hidden="true" /></>}
    {running && !touch && !pointerLocked && !fallback && !bagOpen && !confirmAbandon && <p role="status" style={{ position: "absolute", zIndex: 5, left: "50%", top: "48%", transform: "translate(-50%, -50%)", pointerEvents: "none", padding: "0.8rem 1.2rem", border: "1px solid #c8a967", borderRadius: 12, background: "#081325df", color: "#fff1d0", textAlign: "center" }}>คลิกในห้องเพื่อควบคุมเมาส์ แล้วใช้ W A S D เดิน</p>}
    <div className="arena-game-bar"><strong>{scenario.stage.id}</strong><span className="arena-live">{attempt.status === "RUNNING" ? <ArenaClock start={Number(attempt.start)} epoch={clockEpoch} phase="game" /> : "รอเริ่ม"}</span><span>บทลงโทษ {timeText(attempt.penaltyMs)} · {attempt.protocol === "server-command-v1" && attempt.scenario === "xs-1" && attempt.verificationEnabled ? "ตรวจคำสั่งบนเซิร์ฟเวอร์" : "ผลระดับนี้ยังรอตรวจ"}</span>
      {attempt.status === "PENDING" && <button className="arena-game-primary" disabled={!assetsReady || busy} onClick={() => void act("ready")}>{assetsReady ? "พร้อม เริ่มนับถอยหลัง" : "กำลังโหลดฉากและฟอนต์…"}</button>}
      <button disabled={!running} onClick={() => { if (document.pointerLockElement) document.exitPointerLock(); setBagOpen(true); }}>กระเป๋า (R) <b className="cl-bag-badge">{bagCount}</b></button>
      <button className="arena-game-primary" disabled={!complete || !running || busy || Boolean(syncError)} onClick={() => void act("finish")}>ส่งผลเพื่อตรวจ</button><button className="arena-game-danger" disabled={busy} onClick={() => { if (document.pointerLockElement) document.exitPointerLock(); setConfirmAbandon(true); }}>ยุติรอบ</button>{error && <span role="alert">{error}</span>}{syncError && <span role="alert">{syncError} <button onClick={() => void drain()}>ส่งคำสั่งที่ค้างซ้ำ</button></span>}
    </div><TrainingHud title={scenario.stage.title} touch={touch} />{bagOpen && <BagPanel bag={bag} onClose={() => setBagOpen(false)} />}<ReviewOverlay /><EquipmentInspector /><InspectHoldRing />{touch && running && !confirmAbandon && <TouchControls />}<div className="arena-public arena-game-dialog">{abandonDialog}</div></main>;
}
