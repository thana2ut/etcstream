"use client";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useProgress } from "@react-three/drei";
import Link from "next/link";
import { useTrainingStore } from "@/game/stores/training-store";
import { SCENARIOS, type ScenarioId } from "@/game/training/scenarios";
import { initSim } from "@/game/training/hdmi-training";
import { hiddenCablesFor, packedLeadsFor } from "@/game/content/cable-catalog";
import { getDifficultyMeta, getMissionDifficultyLabel, missionChapters } from "@/game/content/mission-catalog";
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
import { DuelVerdict, useDuel } from "./duel";
import { subscribeCompetitionCommands, type CompetitionCommand } from "@/game/training/competition-commands";
import {AttemptStanding} from "./online";
import { useMissionStones } from "@/components/game/mission-stones";

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
function ArenaClock({ start, epoch, phase, frozenAt }: { start: number; epoch: RefObject<number>; phase: "briefing" | "game"; frozenAt?: number | null }) {
  const [tick, setNow] = useState(() => performance.now() + epoch.current);
  useEffect(() => {
    if (frozenAt) return;
    const timer = window.setInterval(() => setNow(performance.now() + epoch.current), 100);
    return () => window.clearInterval(timer);
  }, [epoch, frozenAt]);
  // Every route wired: the clock stops at that instant instead of running until the server answers.
  const now = frozenAt ?? tick;
  return <>{now < start
    ? phase === "briefing" ? `เริ่มใน ${Math.ceil((start - now) / 1000)} วินาที` : `เริ่มใน ${Math.max(1, Math.ceil((start - now) / 1000))}`
    : timeText(Math.max(0, now - start))}</>;
}
export function ArenaPlay({ id, duelId }: { id: string; duelId?: string }) {
  // Live duel: both players prepare cables, enter together and start together; results compare both runs.
  const { duel, send: duelSend } = useDuel(duelId);
  const duelStartTriggered = useRef(false);
  const [attempt, setAttempt] = useState<AttemptView | null>(null), [error, setError] = useState(""), [bag, setBag] = useState<Record<string,number> | null>(null);
  const [briefing, setBriefing] = useState(true), [assetsReady, setAssetsReady] = useState(false), [bagOpen, setBagOpen] = useState(false), [fallback, setFallback] = useState(false), [busy, setBusy] = useState(false), [touch, setTouch] = useState(false);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const [started, setStarted] = useState(false), [pointerLocked, setPointerLocked] = useState(false);
  const actionPending = useRef(false);
  const clockOffset = useRef(0), clockEpoch = useRef(0), seq = useRef(0), queue = useRef(Promise.resolve());
  const stoneStage = useRef("");
  const stones = useMissionStones(Boolean(stoneStage.current), stoneStage.current);
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
      if (SCENARIOS[a.scenario as ScenarioId]?.stage) stoneStage.current = a.scenario;
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
      if (action === "finish") void stones.finish(s.cables, s.wrongStreak);
    } catch (e) { setError((e as Error).message); } finally { actionPending.current = false; setBusy(false); }
  };
  // Stone run opens with the clock; once every route is wired the round is submitted, the clock stops and the summary shows.
  useEffect(() => { if (attempt?.status === "RUNNING" && started) stones.begin(); }, [attempt?.status, started, stones]);
  const autoFinished = useRef(false);
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  useEffect(() => {
    if (!duelId || !duel?.bothStarted || attempt?.status !== "PENDING" || !assetsReady || duelStartTriggered.current) return;
    duelStartTriggered.current = true; void act("ready");
  }); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (complete && !completedAt) setCompletedAt(performance.now() + clockEpoch.current); }, [complete, completedAt]);
  useEffect(() => {
    if (!complete || attempt?.status !== "RUNNING" || !started || autoFinished.current) return;
    autoFinished.current = true; if (document.pointerLockElement) document.exitPointerLock(); void act("finish");
  }); // eslint-disable-line react-hooks/exhaustive-deps
  if (!attempt) return <ArenaShell><ArenaBanner title="ภารกิจจับเวลา" file="card-time-attack" /><section className="arena-panel">{error ? <ArenaEmptyState icon="time-attack" title="ยังเปิดรอบนี้ไม่ได้" href="/arena/time-attack" action="กลับไปเลือกภารกิจ"><span role="alert">{error}</span></ArenaEmptyState> : <p role="status" className="arena-skeleton">กำลังเปิดใบภารกิจ…</p>}</section></ArenaShell>;
  const scenario = SCENARIOS[attempt.scenario as ScenarioId];
  if (!scenario?.stage) return <ArenaShell><ArenaBanner title="ข้อมูลด่านไม่พร้อม" file="card-time-attack" /><section className="arena-panel"><ArenaEmptyState icon="time-attack" title="ยังเปิดใบภารกิจนี้ไม่ได้" href="/arena/time-attack" action="กลับไปเลือกภารกิจ">ข้อมูลด่านของรอบนี้ยังไม่พร้อมใช้งาน</ArenaEmptyState></section></ArenaShell>;
  const venue = ({ xs: "classroom", s: "studio", m: "auditorium", l: "outdoor", xl: "stadium" } as const)[scenario.venueScale!];
  // Same stage data as Mission mode: title, level label and objective come from the mission catalog.
  const missionChapter = missionChapters.find((chapter) => chapter.venueId === venue);
  const venueLabel = missionChapter?.venue;
  const missionLevel = Number(attempt.scenario.split("-")[1]) || 1;
  const missionTitle = missionChapter?.title ?? scenario.stage.title;
  const missionLevelLabel = missionChapter ? getMissionDifficultyLabel(missionChapter, missionLevel) : scenario.stage.id;
  const missionObjective = (missionChapter && getDifficultyMeta(missionChapter, missionLevel)?.objective) || scenario.stage.ticket;
  const abandonDialog = <ArenaConfirmDialog open={confirmAbandon} title="ยุติรอบฝึกนี้หรือไม่?" busy={busy} onCancel={() => setConfirmAbandon(false)} onConfirm={() => void act("abandon")}>รอบนี้จะถูกบันทึกว่ายุติ และไม่นำผลไปจัดอันดับ{error && <span className="arena-dialog-error" role="alert">{error}</span>}</ArenaConfirmDialog>;
  if (!["PENDING","RUNNING"].includes(attempt.status)) return <ArenaShell>
    <ArenaBanner title="ผลรอบฝึกกาลเวลา" file="card-time-attack"><p>{venueLabel} · {scenario.stage.title}</p></ArenaBanner>
    <section className="arena-panel arena-result" data-outcome={attempt.status}>
      <div className="arena-result-seal" aria-hidden="true"><ArenaIcon name={attempt.status === "VERIFIED" ? "trophy" : "time-attack"} /></div>
      <span className={`arena-status${attempt.status === "DNF" ? " is-muted" : ""}`}>{attempt.status === "DNF" ? statusText(attempt.status) : attempt.graphValid ? "ภารกิจสำเร็จ" : "ส่งผลแล้ว"}</span>
      <h2>{attempt.status === "DNF" ? "รอบนี้ยุติแล้ว" : attempt.graphValid ? "ภารกิจสำเร็จ" : "บันทึกผลรอบนี้แล้ว"}</h2>
      {attempt.status === "DNF" && <p>{attempt.start === null ? "ยุติก่อนเริ่มจับเวลา จึงไม่มีเวลาสำหรับรอบนี้" : attempt.reason || "รอบนี้ถูกยุติ"}</p>}
      <dl className="arena-stats">
        <div><dt>เวลาที่ใช้</dt><dd>{attempt.start === null ? "—" : timeText(attempt.elapsedMs)}</dd></div>
        <div><dt>ความผิดพลาด</dt><dd>{useTrainingStore.getState().wrongStreak} ครั้ง</dd></div>
        <div><dt>หินวิญญาณ</dt><dd>{stones.reward ? <>+{stones.reward.reward.toLocaleString("th-TH")}</> : attempt.status === "DNF" ? "—" : stones.error ? "ไม่ได้รับ" : "กำลังบันทึก…"}</dd></div>
      </dl>
      {stones.reward && <p className="arena-muted">หินพื้นฐาน {stones.reward.breakdown.base} · โบนัสเวลา {stones.reward.breakdown.timeBonus >= 0 ? "+" : ""}{stones.reward.breakdown.timeBonus} (×{Number(stones.reward.breakdown.multiplier).toFixed(2)}) · โบนัสเล่นแม่น +{stones.reward.breakdown.cleanBonus} · คงเหลือ {stones.reward.balance.toLocaleString("th-TH")} หิน</p>}
      {stones.error && attempt.status !== "DNF" && <p className="arena-muted" role="status">{stones.error}</p>}
      {duelId && <DuelVerdict duel={duel} />}
      {attempt.status === "VERIFIED" && <RewardReceipt attempt={attempt}/>}
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
        <h2>{missionTitle}</h2><p className="arena-eyebrow">{missionLevelLabel}</p><p>{missionObjective}</p>
        <ol className="arena-connection-steps">{scenario.stage.briefing.map((line, index) => <li key={line}><span>{index + 1}</span><span>{line}</span></li>)}</ol>
      </section>
      <aside className="arena-panel"><h2>เตรียมตัวก่อนเริ่ม</h2>
        <ol className="arena-checklist"><li>อ่านใบงาน แล้วเลือกสายที่ต้องใช้</li><li>รอฉากและฟอนต์โหลดครบก่อนกดพร้อม</li><li>ต่อสายให้ถูกพอร์ตครบทุกเส้นทาง แล้วรอบจะจบและส่งผลให้ระบบตรวจเอง</li></ol>
        <p className="arena-muted">จับเวลาตั้งแต่เริ่มจนต่อสายครบ เวลาเดินต่อเมื่อเปลี่ยนแท็บหรือหลุดการเชื่อมต่อ การโหลดหน้าซ้ำจะจัดห้องใหม่แต่ไม่เริ่มนับเวลาใหม่</p>
        {error && <p role="alert">{error}</p>}
        <div className="arena-actions"><button disabled={busy} onClick={() => setBriefing(false)}>ไปเตรียมสาย →</button><button className="arena-button-danger" disabled={busy} onClick={() => setConfirmAbandon(true)}>ยุติรอบนี้</button></div>
      </aside>
    </div>
    {abandonDialog}
  </ArenaShell>;
  if (!bag) return <CableLobby scenario={scenario} title={missionTitle} levelLabel={missionLevelLabel} objective={missionObjective} backLabel="กลับใบงาน" onBack={() => setBriefing(true)} onConfirm={(packed) => {
    useTrainingStore.getState().reset(attempt.scenario as ScenarioId, hiddenCablesFor(scenario, packed), packedLeadsFor(scenario, packed));
    useTrainingStore.setState({ sim: initSim(scenario, attempt.seed || 1) }); previousErrors.current = 0; setBag(packed); if (duelId) void duelSend("packed");
  }} />;
  const running = attempt.status === "RUNNING" && started;
  return <main className="fantasy-viewport game-screen play-page" style={{ position: "fixed", inset: 0, background: "#081325" }}>
    <div className="game-viewport" style={{ position: "absolute", inset: 0, zIndex: 0 }}><GameCanvas key={scenario.id} venue={venue} active={running && !confirmAbandon && !bagOpen && !simPaused} fallbackLook={fallback} touch={touch} onExitFallback={exitFallback} onPointerLockError={enterFallback} /></div>
    <AssetGate onReady={markAssetsReady} />
    {duelId && attempt.status === "PENDING" && (!duel?.bothPacked || !duel?.bothStarted) && <div className="duel-wait-veil" role="status" aria-live="polite">
      <section className="duel-wait">
        <p className="duel-invite-kicker">✦ ลานประลองสองเซียน ✦</p>
        <h2>{!duel?.bothPacked ? "รอคู่ประลองเตรียมสายให้ครบ" : duel.me.started ? "รอคู่ประลองกดเริ่ม" : "ทั้งสองฝ่ายพร้อมแล้ว"}</h2>
        <ul className="duel-wait-list">{(duel?.players ?? []).map((p) => { const mine = p.side === duel?.side; const { packed, started } = p; return <li key={p.side}><strong>{p.name}{mine ? " (เจ้า)" : ""}</strong><span className={packed ? "is-ok" : ""}>{packed ? "✓ เตรียมสายแล้ว" : "กำลังเตรียมสาย…"}</span>{duel?.bothPacked && <span className={started ? "is-ok" : ""}>{started ? "✓ พร้อมเริ่ม" : "ยังไม่กดเริ่ม"}</span>}</li>; })}</ul>
        {duel?.bothPacked && !duel.me.started && <button type="button" className="duel-accept" disabled={!assetsReady || busy} onClick={() => void duelSend("start")}>{assetsReady ? "พร้อม เริ่มประลอง" : "กำลังโหลดฉาก…"}</button>}
        <small>เวลาจะเริ่มนับพร้อมกันเมื่อทั้งสองฝ่ายกดเริ่ม</small>
      </section>
    </div>}
    {running && !confirmAbandon && <><FirstPersonHands /><div className="game-center-reticle" aria-hidden="true" /></>}
    {running && !touch && !pointerLocked && !fallback && !bagOpen && !confirmAbandon && <p role="status" style={{ position: "absolute", zIndex: 5, left: "50%", top: "48%", transform: "translate(-50%, -50%)", pointerEvents: "none", padding: "0.8rem 1.2rem", border: "1px solid #c8a967", borderRadius: 12, background: "#081325df", color: "#fff1d0", textAlign: "center" }}>คลิกในห้องเพื่อควบคุมเมาส์ แล้วใช้ W A S D เดิน</p>}
    <div className="arena-game-bar"><strong>{scenario.stage.id}</strong><span className="arena-live">{attempt.status === "RUNNING" ? <ArenaClock start={Number(attempt.start)} epoch={clockEpoch} phase="game" frozenAt={completedAt} /> : "รอเริ่ม"}</span><span>⏱ จับเวลา · ต่อครบแล้วเวลาหยุดทันที</span>
      {attempt.status === "PENDING" && (duelId
        ? <button className="arena-game-primary" disabled={!assetsReady || busy || !duel?.bothPacked || Boolean(duel?.me.started)} onClick={() => void duelSend("start")}>{!assetsReady ? "กำลังโหลดฉากและฟอนต์…" : !duel?.bothPacked ? "รอคู่ประลองเตรียมสาย…" : duel.me.started ? "รอคู่ประลองกดเริ่ม…" : "พร้อม เริ่มประลอง"}</button>
        : <button className="arena-game-primary" disabled={!assetsReady || busy} onClick={() => void act("ready")}>{assetsReady ? "พร้อม เริ่มนับถอยหลัง" : "กำลังโหลดฉากและฟอนต์…"}</button>)}
      <button disabled={!running} onClick={() => { if (document.pointerLockElement) document.exitPointerLock(); setBagOpen(true); }}>{touch ? "กระเป๋า" : "กระเป๋า (C)"} <b className="cl-bag-badge">{bagCount}</b></button>
      <button className="arena-game-primary" disabled={!complete || !running || busy || Boolean(syncError)} onClick={() => void act("finish")}>เสร็จสิ้น</button><button className="arena-game-danger" disabled={busy} onClick={() => { if (document.pointerLockElement) document.exitPointerLock(); setConfirmAbandon(true); }}>ยุติรอบ</button>{error && <span role="alert">{error}</span>}{syncError && <span role="alert">{syncError} <button onClick={() => void drain()}>ส่งคำสั่งที่ค้างซ้ำ</button></span>}
    </div><TrainingHud title={missionTitle} difficultyLabel={missionLevelLabel} objective={missionObjective} touch={touch} />{bagOpen && <BagPanel bag={bag} onClose={() => setBagOpen(false)} />}<ReviewOverlay /><EquipmentInspector /><InspectHoldRing />{touch && running && !confirmAbandon && <TouchControls />}<div className="arena-public arena-game-dialog">{abandonDialog}</div></main>;
}
