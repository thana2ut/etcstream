"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useTrainingStore } from "@/game/stores/training-store";
import { scenarioOf, simContext, stageScore, STAGE_ORDER } from "@/game/training/hdmi-training";
import { MODELS } from "@/game/training/sim/equipment";
import { MISSION_ROOMS as ROOMS } from "@/game/training/sim/rooms";
import { CONCEPTS } from "@/game/training/sim/library";
import { PREFLIGHT } from "@/game/training/sim/stages";
import { describe, portOf, testRoute, traceTo, validateLevel, type StageResult } from "@/game/training/sim/engine";
import type { EvalContext, TestStage } from "@/game/training/sim/types";
import { playerEquipmentNote, playerEquipmentText, simThai } from "@/game/content/sim-thai";
import { LAYOUTS } from "@/game/training/venue-layouts";

/**
 * Operator Console (C): the production desk for mission stages. Everything shown here is read from the evaluated
 * signal graph — devices, ports, live signals, trace, score. In certification stages it never reveals the answer:
 * no route checklist, no fixes, only symptoms and the learner's own test results.
 */
type Tab = "job" | "devices" | "tests" | "flow" | "show" | "signoff";
const TABS: [Tab, string][] = [["job", "ใบงาน"], ["devices", "อุปกรณ์"], ["tests", "ทดสอบและตรวจเส้นทาง"], ["flow", "แผนผังสัญญาณ"], ["show", "ลำดับการออกอากาศ"], ["signoff", "ตรวจรับงาน"]];

const C = {
  panel: { position: "absolute", inset: "64px max(16px, calc(50vw - 560px)) 16px", zIndex: 60, display: "flex", flexDirection: "column", background: "rgba(6, 13, 26, 0.96)", border: "1px solid #3b5372", borderRadius: 10, color: "#e8eef6", fontFamily: "inherit", boxShadow: "0 18px 60px rgba(0,0,0,.55)" } as CSSProperties,
  head: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid #24364d", flexWrap: "wrap" } as CSSProperties,
  body: { flex: 1, minHeight: 0, lineHeight: 1.65, overflowWrap: "anywhere", overflow: "auto", padding: "12px 16px" } as CSSProperties,
  btn: { background: "#15263d", color: "#e8eef6", borderWidth: 1, borderStyle: "solid", borderColor: "#3b5372", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: "0.95em", minHeight: 44 } as CSSProperties,
  on: { background: "#e7c98f", color: "#10131a", borderColor: "#e7c98f" } as CSSProperties,
  muted: { color: "#93a7bf" } as CSSProperties,
  card: { border: "1px solid #24364d", borderRadius: 8, padding: "10px 12px", marginBottom: 10, background: "rgba(20,34,54,.5)" } as CSSProperties,
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.95em" } as CSSProperties,
};
const ok = (pass: boolean | undefined) => pass === undefined ? <span style={C.muted}>○ ยังไม่ทดสอบ</span> : pass ? <span style={{ color: "#5be39a" }}>✓ ผ่าน</span> : <span style={{ color: "#ff8a7a" }}>✗ ไม่ผ่าน</span>;
function H({ children }: { children: ReactNode }) { return <h4 style={{ margin: "4px 0 8px", color: "#e7c98f", fontSize: "1em" }}>{children}</h4>; }

export function OperatorConsole() {
  const state = useTrainingStore();
  const scenario = scenarioOf(state);
  const stage = scenario.stage;
  const [tab, setTab] = useState<Tab>("job");
  const [scale, setScale] = useState(() => { try { const v = Number(typeof localStorage === "undefined" ? 1 : localStorage.getItem("etc-console-scale")); return v >= 0.85 && v <= 1.5 ? v : 1; } catch { return 1; } });
  const [device, setDevice] = useState<string | null>(null);
  const [traceDest, setTraceDest] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<{ stage: TestStage; results: StageResult[] } | null>(null);
  useEffect(() => { try { localStorage.setItem("etc-console-scale", String(scale)); } catch { /* storage unavailable */ } }, [scale]);
  useEffect(() => {
    if (!state.consoleOpen) return;
    if (document.pointerLockElement) document.exitPointerLock();
    const onKey = (e: KeyboardEvent) => { if (e.code === "Escape") useTrainingStore.getState().setConsoleOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.consoleOpen]);
  const ctx = simContext(state);
  if (!state.consoleOpen || !stage || !ctx || !state.sim) return null;
  const room = ROOMS[stage.room];
  const cert = stage.guidance === "certification";
  const sim = state.sim;
  const devs = scenario.simDevices!;

  const runTestUi = (t: TestStage) => { state.test(t); const after = simContext(useTrainingStore.getState()); if (after) setLastRun({ stage: t, results: testRoute(after, t).results.filter((r) => r.id !== "signoff") }); };

  return <div style={{ ...C.panel, fontSize: `${scale}rem` }} role="dialog" aria-label="แผงควบคุมอุปกรณ์">
    <div style={C.head}>
      <strong style={{ color: "#e7c98f" }}>{stage.id} · {stage.title.split(" · ")[0]}</strong>
      <span style={C.muted}>{room.title} — {room.subtitle} · {simThai(stage.guidance)} · {stage.minutes}</span>
      <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
        <button style={C.btn} onClick={() => setScale((v) => Math.max(0.85, +(v - 0.1).toFixed(2)))} aria-label="ลดขนาดข้อความ">A−</button>
        <button style={C.btn} onClick={() => setScale((v) => Math.min(1.5, +(v + 0.1).toFixed(2)))} aria-label="เพิ่มขนาดข้อความ">A+</button>
        <button style={C.btn} onClick={() => state.setConsoleOpen(false)} aria-label="ปิดแผงควบคุม (Esc)">ปิด ✕</button>
      </span>
      <nav style={{ display: "flex", gap: 6, width: "100%", flexWrap: "wrap" }}>
        {TABS.map(([id, label]) => <button key={id} style={{ ...C.btn, ...(tab === id ? C.on : {}) }} onClick={() => setTab(id)}>{label}</button>)}
        <span style={{ ...C.muted, marginLeft: "auto", alignSelf: "center" }}>ข้อผิดพลาด {sim.errors}/3 · การทดสอบ {STAGE_ORDER.map((t) => (sim.testsPassed[t] ? "✓" : "·")).join("")}{sim.activeFaults.length && !cert && stage.guidance !== "disruption" ? ` · ปัญหา ${sim.activeFaults.length}` : ""}</span>
      </nav>
    </div>
    <div style={C.body}>
      {stage.room === "xl" && stage.level >= 4 && <p style={C.muted} role="status">การสำรองบางส่วน: แยกพอร์ตภาพ ตัวเข้ารหัส และเครือข่ายสองชุด แต่ยังใช้แหล่งผลิตและไฟเลี้ยงร่วมกัน</p>}
      {tab === "job" && <JobTab ctx={ctx} />}
      {tab === "devices" && <DevicesTab ctx={ctx} selected={device} onSelect={setDevice} />}
      {tab === "tests" && <div>
        <H>ทดสอบตามลำดับ</H>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {STAGE_ORDER.map((t, i) => <button key={t} style={C.btn} onClick={() => runTestUi(t)}>{i + 1}. {t === "physical" ? "การติดตั้งและสายสัญญาณ" : t === "signal" ? "สัญญาณ" : t === "rehearsal" ? "ซ้อมควบคุมงาน" : "สตรีมและบันทึก"} · {ok(sim.testsPassed[t])}</button>)}
        </div>
        {lastRun && <div style={C.card}>
          <H>บันทึกผลทดสอบล่าสุด: {simThai(lastRun.stage)}</H>
          <p style={C.muted}>เป็นผล ณ เวลาที่กดทดสอบ หากเปลี่ยนสายหรือการตั้งค่า ให้ดูสถานะปัจจุบันและทดสอบใหม่</p>
          <table style={C.table}><tbody>{lastRun.results.map((r) => <tr key={r.id} style={{ borderTop: "1px solid #24364d" }}>
            <td style={{ padding: 4, width: 90 }}>{ok(r.result.ok)}{r.critical ? " ★" : ""}</td>
            <td style={{ padding: 4 }}>{r.label}{!r.result.ok && <div style={C.muted}>สิ่งที่ยังไม่ผ่าน: {simThai(r.result.reason ?? "")}{!cert && r.result.fix ? <><br />วิธีแก้: {simThai(r.result.fix)}</> : null}</div>}</td>
            <td style={{ padding: 4, ...C.muted }}>{simThai(r.category)}</td></tr>)}</tbody></table>
          <small style={C.muted}>★ เงื่อนไขสำคัญที่ต้องผ่าน</small>
        </div>}
        <H>ตรวจเส้นทางสัญญาณ (อุปกรณ์ → พอร์ต → สาย → อุปกรณ์ → พอร์ต)</H>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {Object.keys(devs).filter((d) => ["display", "speaker", "ingest", "recorder", "storage", "host", "switcher"].includes(MODELS[devs[d].model].role)).map((d) =>
            <button key={d} style={{ ...C.btn, ...(traceDest === d ? C.on : {}) }} onClick={() => { setTraceDest(d); state.trace(d); }}>{simThai(devs[d].label)}</button>)}
        </div>
        {traceDest && <TraceView ctx={ctx} dest={traceDest} cert={cert} />}
      </div>}
      {tab === "flow" && <FlowTab ctx={ctx} />}
      {tab === "show" && <ShowTab ctx={ctx} />}
      {tab === "signoff" && <SignoffTab />}
    </div>
  </div>;
}

function JobTab({ ctx }: { ctx: EvalContext }) {
  const state = useTrainingStore();
  const scenario = scenarioOf(state);
  const stage = scenario.stage!;
  const sim = state.sim!;
  const guided = stage.guidance === "guided" || stage.guidance === "partial";
  const layout = LAYOUTS[scenario.layout ?? "studio"];
  const b = layout.bounds, W = 720, Hh = Math.round(W * (b.maxZ - b.minZ) / (b.maxX - b.minX));
  const px = (x: number) => ((x - b.minX) / (b.maxX - b.minX)) * W, pz = (z: number) => ((z - b.minZ) / (b.maxZ - b.minZ)) * Hh;
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 14 }}>
    <div>
      <div style={C.card}><H>ใบงานจากผู้จัดการเวที</H><p style={{ margin: 0 }}>{stage.ticket}</p></div>
      <div style={C.card}><H>ตำแหน่งและหน้าที่ทีมงาน</H><ul style={{ margin: 0, paddingLeft: 18 }}>{stage.callSheet.map((x) => <li key={x}>{x}</li>)}</ul></div>
      <div style={C.card}><H>คำแนะนำจากผู้สอน</H>{stage.briefing.map((x, i) => <p key={i} style={{ margin: "2px 0" }}>🎙 {x}</p>)}</div>
      <div style={C.card}><H>เกณฑ์ผ่านภารกิจ</H><ul style={{ margin: 0, paddingLeft: 18 }}>{stage.passCriteria.map((x) => <li key={x}>{x}</li>)}</ul></div>
      {guided && scenario.requirements.length > 0 && <div style={C.card}><H>แผนต่อสายพร้อมคำแนะนำ</H><ol style={{ margin: 0, paddingLeft: 18 }}>{scenario.requirements.map((r) => <li key={r.id}>{r.label}</li>)}</ol></div>}
      {stage.guidance === "certification" && <div style={C.card}><H>แผนสัญญาณที่ต้องจัดทำ</H><p style={{ ...C.muted, margin: 0 }}>วางแผนต่อสายและมุมกล้องด้วยตนเองจากใบงานและข้อมูลอุปกรณ์ ด่านประเมินจะไม่แสดงเฉลยการต่อสาย</p></div>}
    </div>
    <div>
      <div style={C.card}><H>รายการตรวจก่อนเริ่มงานและความปลอดภัย</H>
        {stage.weather && <div style={{ marginBottom: 8 }}>
          <div>สภาพอากาศขณะนี้: <b style={{ color: sim.weatherNow === "lightning" ? "#ff8a7a" : "#5be39a" }}>{sim.weatherNow === "lightning" ? "⚡ มีฟ้าผ่าภายใน 10 กม. — ไม่ปลอดภัย" : "☁ เมฆมาก ฝนปรอย ไม่มีฟ้าผ่า — มีที่กำบังเหมาะสม"}</b></div>
          <label>การตัดสินใจ{" "}
            <select value={String(sim.config.site?.decision ?? "(undecided)")} onChange={(e) => state.control("site", "decision", e.target.value)} style={C.btn}>
              {["(undecided)", "GO", "NO-GO (hold)"].map((o) => <option key={o} value={o}>{simThai(o)}</option>)}
            </select></label>{" "}
          <button style={C.btn} onClick={() => state.allClear()}>หยุดรอ 30 นาทีจนยืนยันว่าปลอดภัย</button>
          <div style={{ ...C.muted, fontSize: "0.8em" }}>ข้อกำหนดขึ้นอยู่กับพื้นที่ งานไฟฟ้าหลัก เครื่องกำเนิดไฟฟ้า และโครงแขวนต้องดำเนินการโดยผู้เชี่ยวชาญที่มีคุณสมบัติเหมาะสม</div>
        </div>}
        {stage.preflight.map((k) => <label key={k} style={{ display: "block", margin: "3px 0" }}>
          <input type="checkbox" checked={sim.config.site?.[k] === true} onChange={(e) => state.control("site", k, e.target.checked)} /> {PREFLIGHT[k]}
        </label>)}
        {stage.preflight.length === 0 && !stage.weather && <span style={C.muted}>งานนี้ไม่มีรายการตรวจพื้นที่</span>}
      </div>
      <div style={C.card}><H>ผังพื้นที่มองจากด้านบน</H>
        <div className="room-map-scroll" tabIndex={0} role="region" aria-label="ผังห้อง เลื่อนแนวนอนได้"><svg viewBox={`0 0 ${W} ${Hh}`} width={W} style={{ background: "#0b1626", borderRadius: 6 }} role="img" aria-label="ผังพื้นที่และตำแหน่งติดตั้งอุปกรณ์">
          {layout.furniture.map((f) => <rect key={f.id} x={px(f.center[0] - f.size[0] / 2)} y={pz(f.center[2] - f.size[2] / 2)} width={Math.max(1, (f.size[0] / (b.maxX - b.minX)) * W)} height={Math.max(1, (f.size[2] / (b.maxZ - b.minZ)) * Hh)} fill="#1e2c40" stroke="#2f4560" />)}
          {(() => {
            const occupied = new Set<string>();
            const cols = Math.floor(W / 40), rows = Math.floor(Hh / 40);
            return scenario.devices.map((d, i) => {
              const placed = ctx.placed(d.id), p = state.items[d.id]?.position ?? d.position;
              const x = px(p[0]), y = pz(p[2]);
              const cells = Array.from({ length: cols * rows }, (_, k) => ({ x: 20 + k % cols * 40, y: 20 + Math.floor(k / cols) * 40 }))
                .filter((c) => !occupied.has(`${c.x}:${c.y}`))
                .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
              const label = cells[0] ?? { x, y };
              occupied.add(`${label.x}:${label.y}`);
              return <g key={d.id}><title>{i + 1}. {simThai(d.label)} — {placed ? "ติดตั้งแล้ว" : "ยังไม่ติดตั้ง"}</title>
                <line x1={x} y1={y} x2={label.x} y2={label.y} stroke="#9db4ce" />
                <circle cx={x} cy={y} r={3} fill="#fff" />
                <circle cx={label.x} cy={label.y} r={16} fill={placed ? "#e7c98f" : "#253d58"} stroke="#d9e6f6" strokeDasharray={placed ? undefined : "3 2"} />
                <text x={label.x} y={label.y} dy=".35em" textAnchor="middle" fontSize={15} fontWeight={700} fill={placed ? "#10131a" : "#fff"}>{i + 1}</text></g>;
            });
          })()}
        </svg></div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 6, fontSize: "0.85em", lineHeight: 1.5 }}><span><span style={{ color: "#e7c98f" }}>●</span> ติดตั้งประจำจุดแล้ว</span><span><span style={{ color: "#8aa3c0" }}>○</span> ยังไม่ติดตั้ง</span><span style={C.muted}>หมายเลขตรงกับรายการด้านล่าง เส้นชี้ตำแหน่งจริง</span></div>
      </div>
      <div style={C.card}><H>จุดติดตั้ง</H>{scenario.devices.map((d, i) => <div key={d.id} style={{ fontSize: "0.95em", marginBottom: 8 }}><b>{i + 1}. {simThai(d.label)}</b> <span>{ctx.placed(d.id) ? "(ติดตั้งแล้ว)" : "(ยังไม่ติดตั้ง)"}</span> — <span style={C.muted}>{scenario.placeables.find((p) => p.id === d.id)?.zoneLabel ?? "ตำแหน่งติดตั้งประจำ"}</span></div>)}</div>
    </div>
  </div>;
}

function DevicesTab({ ctx, selected, onSelect }: { ctx: EvalContext; selected: string | null; onSelect: (id: string) => void }) {
  const state = useTrainingStore();
  const scenario = scenarioOf(state);
  const devs = scenario.simDevices!;
  const id = selected && devs[selected] ? selected : Object.keys(devs)[0];
  const inst = devs[id], m = MODELS[inst.model], v = ctx.view[id];
  const cert = scenario.stage!.guidance === "certification";
  const locked = state.sim!.locked;
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 14 }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {Object.keys(devs).map((d) => <button key={d} style={{ ...C.btn, textAlign: "left", ...(d === id ? C.on : {}) }} onClick={() => onSelect(d)}>
        {ctx.view[d]?.powered || !MODELS[devs[d].model].needsPower ? "●" : "○"} {simThai(devs[d].label)}</button>)}
    </div>
    <div>
      <div style={C.card}>
        <H>{simThai(inst.label)} · {playerEquipmentText(m.name)}</H>
        {m.generic && <div style={C.muted}>อุปกรณ์ฝึกจำลอง</div>}
        <div style={{ fontSize: "0.8em" }}>พอร์ต: {m.verifiedPorts.filter((p) => playerEquipmentNote(p) !== null).join(" · ")}</div>
        {m.notes.map((n) => playerEquipmentNote(n)).filter((n): n is string => Boolean(n)).map((n) => <div key={n} style={{ fontSize: "0.8em" }}>ⓘ {n}</div>)}
        <div style={{ marginTop: 6 }}>สถานะ: <b>{simThai(v?.status ?? "—")}</b>{v?.problem && !cert ? <span style={{ color: "#ff8a7a" }}> · {simThai(v.problem.text)}</span> : null}</div>
      </div>
      {m.controls.length > 0 && <div style={C.card}><H>การตั้งค่า</H>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 8 }}>
          {m.controls.map((c) => { const val = ctx.cfg(id, c.key); const isLocked = locked.includes(`${id}.${c.key}`); return <label key={c.key} title={c.tip} style={{ fontSize: "0.85em" }}>
            <div>{c.label}{isLocked ? " 🔒" : ""}</div>
            {c.kind === "toggle" ? <button style={{ ...C.btn, ...(val === true ? C.on : {}) }} disabled={isLocked} onClick={() => state.control(id, c.key, !(val === true))}>{val === true ? "เปิด" : "ปิด"}</button>
              : <select style={{ ...C.btn, width: "100%" }} disabled={isLocked} value={String(val ?? "")} onChange={(e) => state.control(id, c.key, e.target.value)}>{c.options!.map((o) => <option key={o} value={o}>{simThai(o)}</option>)}</select>}
          </label>; })}
        </div></div>}
      <div style={C.card}><H>พอร์ต ({m.ports.length}) — แผงหน้าและหลัง พร้อมชื่อกำกับ</H>
        <table style={C.table}><thead><tr style={C.muted}><th align="left">พอร์ต</th><th align="left">ทิศทาง</th><th align="left">หัวต่อ</th><th align="left">สัญญาณ</th><th align="left">ขณะนี้</th></tr></thead>
          <tbody>{m.ports.map((p) => { const gid = `${id}:${p.key}`; const used = ctx.edges.some((e) => e.from === gid || e.to === gid) || Object.values(state.cables).some((c) => c.a.portId === gid || c.b.portId === gid); const sig = p.dir === "OUTPUT" ? ctx.out[gid] : ctx.inp[gid];
            return <tr key={p.key} title={p.tip} style={{ borderTop: "1px solid #24364d" }}><td style={{ padding: 3 }}><b>{p.name}</b><div style={C.muted}>{p.tip}</div></td><td>{["ETHERNET", "WAN"].includes(p.sig) ? "เครือข่ายสองทาง" : p.sig.startsWith("USB") ? p.sig === "USB_POWER" ? "ไฟเลี้ยงเท่านั้น" : m.role === "host" ? "USB HOST" : "USB DEVICE" : p.dir === "INPUT" ? "◀ ขาเข้า" : "ขาออก ▶"}</td><td>{p.connector}</td><td>{p.sig}{p.channels ? ` ·${p.channels}ch` : ""}{p.formats ? ` · ${p.formats.join("/")}` : ""}</td><td>{used ? "ใช้งานอยู่" : "ว่าง"}{sig ? <div style={{ color: "#5be39a" }}>{simThai(describe(sig))}</div> : null}</td></tr>; })}</tbody></table>
      </div>
    </div>
  </div>;
}

function TraceView({ ctx, dest, cert }: { ctx: EvalContext; dest: string; cert: boolean }) {
  const scenario = scenarioOf(useTrainingStore.getState());
  const { hops, first } = useMemo(() => traceTo(scenario.simDevices!, ctx, dest, scenario.cableMeta ?? {}), [scenario, ctx, dest]);
  return <div style={C.card}>
    {hops.length === 0 && <span style={C.muted}>ยังไม่มีสายเชื่อมต่อเข้าปลายทางนี้</span>}
    <ol style={{ margin: 0, paddingLeft: 18, fontSize: "0.85em" }}>{hops.map((h, i) => <li key={i} style={{ color: h.ok ? "#cfe0f2" : "#ff8a7a" }}>{h.ok ? "✓" : "✗"} {h.port ? <>{h.node}: {h.port}</> : <b>{h.node}</b>} <span style={C.muted}>— {simThai(h.note)}</span></li>)}</ol>
    {first && <p style={{ marginBottom: 0 }}>จุดแรกที่พบปัญหา: <b>{first.node}</b> — {simThai(first.note)}{!cert && first.fix ? <><br />วิธีแก้: {simThai(first.fix)}</> : null}</p>}
    {!first && hops.length > 0 && <p style={{ color: "#5be39a", marginBottom: 0 }}>✓ ไม่พบปัญหาในช่วงเส้นทางที่เลือก · ยังต้องตรวจต้นทางทุกช่องและทดสอบภารกิจทั้งระบบ</p>}
  </div>;
}

/** Learner signal-flow diagram generated from the ACTUAL cables (columns = hops from the sources). */
function FlowTab({ ctx }: { ctx: EvalContext }) {
  const scenario = scenarioOf(useTrainingStore.getState());
  const devs = scenario.simDevices!;
  const nodes = Object.keys(devs);
  const depth: Record<string, number> = Object.fromEntries(nodes.map((n) => [n, 0]));
  for (let i = 0; i < nodes.length; i++) for (const e of ctx.edges) { const a = e.from.split(":")[0], b = e.to.split(":")[0]; depth[b] = Math.max(depth[b], depth[a] + 1); }
  const byDepth: string[][] = [];
  for (const n of nodes) (byDepth[depth[n]] ??= []).push(n);
  // Long columns wrap into sub-columns of at most 6 boxes so the diagram stays readable.
  const cols: string[][] = byDepth.filter(Boolean).flatMap((col) => Array.from({ length: Math.ceil(col.length / 6) }, (_, i) => col.slice(i * 6, i * 6 + 6)));
  const W = 240, Hh = 110, pos: Record<string, [number, number]> = {};
  cols.forEach((col, c) => col.forEach((n, r) => { pos[n] = [20 + c * (W + 40), 20 + r * (Hh + 16)]; }));
  const width = Math.max(900, 40 + cols.length * (W + 40)), height = 40 + Math.max(...cols.map((c) => c.length)) * (Hh + 16);
  return <div>
    <div className="room-map-scroll" tabIndex={0} role="region" aria-label="แผนผังสัญญาณ เลื่อนแนวนอนได้"><svg viewBox={`0 0 ${width} ${height}`} width={width} style={{ background: "#0b1626", borderRadius: 8, minHeight: 200 }} role="img" aria-label="แผนผังสัญญาณจากสายที่ต่ออยู่จริง">
      {ctx.edges.map((e) => { const a = pos[e.from.split(":")[0]], b = pos[e.to.split(":")[0]]; const live = Boolean(ctx.inp[e.to]); return <path key={e.cableId} d={`M${a[0] + W},${a[1] + Hh / 2} C${a[0] + W + 30},${a[1] + Hh / 2} ${b[0] - 30},${b[1] + Hh / 2} ${b[0]},${b[1] + Hh / 2}`} fill="none" stroke={live ? "#5be39a" : "#ff8a7a"} strokeWidth={2} strokeDasharray={live ? undefined : "5 4"} />; })}
      {nodes.map((n) => <g key={n}><title>{simThai(devs[n].label)} — {simThai(ctx.view[n]?.status ?? "")}</title><rect x={pos[n][0]} y={pos[n][1]} width={W} height={Hh} rx={6} fill="#15263d" stroke={ctx.view[n]?.problem ? "#ff8a7a" : "#3b5372"} /><foreignObject x={pos[n][0] + 10} y={pos[n][1] + 8} width={W - 20} height={Hh - 16}><div style={{ fontSize: 15, lineHeight: 1.5, overflowWrap: "anywhere", maxHeight: Hh - 16, overflowY: "auto" }}><strong>{simThai(devs[n].label)}</strong><div style={C.muted}>{simThai(ctx.view[n]?.status ?? "")}</div></div></foreignObject></g>)}
    </svg></div>
    <small style={C.muted}>เส้นเขียวทึบ = มีสัญญาณผ่านสาย · เส้นแดงประ = ต่อสายแล้วแต่สัญญาณไม่ถูกต้อง แผนผังอัปเดตจากสายที่ต่อจริง</small>
    <table style={{ ...C.table, marginTop: 10 }}><tbody>{ctx.edges.map((e) => { const po = portOf(devs, e.from)!, pi = portOf(devs, e.to)!; const sig = ctx.inp[e.to]; return <tr key={e.cableId} style={{ borderTop: "1px solid #24364d" }}>
      <td style={{ padding: 3 }}>{devs[e.from.split(":")[0]].label} · {po.name}</td><td>→ [{scenario.cableMeta?.[e.cableId]?.label ?? e.cableId}] →</td><td>{devs[e.to.split(":")[0]].label} · {pi.name}</td><td style={{ color: sig ? "#5be39a" : "#ff8a7a" }}>{sig ? describe(sig) : "ไม่มีสัญญาณ"}</td></tr>; })}</tbody></table>
  </div>;
}

function ShowTab({ ctx }: { ctx: EvalContext }) {
  const state = useTrainingStore();
  const stage = scenarioOf(state).stage!;
  const sim = state.sim!;
  const sw = scenarioOf(state).simDevices?.sw;
  const options = sw ? (MODELS[sw.model].controls.find((c) => c.key === "pgm")?.options ?? []) : [];
  const pvw = String(ctx.cfg("sw", "pvw") ?? ""), pgm = String(ctx.cfg("sw", "pgm") ?? "");
  const cueLive = sim.testsPassed.signal && sim.cueIndex < stage.cues.length;
  return <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 14 }}>
    <div>
      <div style={C.card}><H>ลำดับการออกอากาศ</H>
        {stage.cues.length === 0 && <span style={C.muted}>งานนี้ไม่มีคิวสลับภาพ ให้ซ้อมด้วยการตรวจเสียงในรายการก่อนเริ่มงาน</span>}
        <ol style={{ margin: 0, paddingLeft: 18 }}>{stage.cues.map((c, i) => <li key={c.id} style={{ fontWeight: i === sim.cueIndex ? 700 : 400, color: i < sim.cueIndex ? "#5be39a" : i === sim.cueIndex ? "#e7c98f" : undefined }}>{i < sim.cueIndex ? "✓ " : i === sim.cueIndex && cueLive ? "▶ เตรียมพร้อม — " : ""}{c.call}</li>)}</ol>
        {!sim.testsPassed.signal && stage.cues.length > 0 && <p style={C.muted}>เริ่มนับคิวหลังผ่านการทดสอบสัญญาณ การซ้อมสลับภาพก่อนหน้านั้นจะไม่นับคะแนน</p>}
        {cueLive && <p style={{ color: "#e7c98f" }}>นับถอยหลัง: 3 … 2 … 1 … {stage.previewBeforeTake ? "ดูภาพเตรียม แล้วสลับออกอากาศ" : "TAKE"} ตามคิว</p>}
      </div>
      {sw && <div style={C.card}><H>เครื่องสลับภาพ</H>
        <div style={{ marginBottom: 6 }}>ภาพเตรียม: {options.map((o) => <button key={o} style={{ ...C.btn, margin: 2, ...(pvw === o ? { background: "#2e7d4f" } : {}) }} onClick={() => state.control("sw", "pvw", o)}>{o}</button>)}</div>
        <div style={{ marginBottom: 6 }}>ภาพออกอากาศ: {options.map((o) => <button key={o} style={{ ...C.btn, margin: 2, ...(pgm === o ? { background: "#b3322a" } : {}) }} onClick={() => state.control("sw", "pgm", o)}>{o}</button>)}</div>
        <button style={{ ...C.btn, ...C.on }} onClick={() => pvw && state.control("sw", "pgm", pvw)} disabled={!MODELS[sw.model].controls.some((c) => c.key === "pvw")}>สลับภาพเตรียมออกอากาศ</button>
        <p style={{ marginBottom: 0 }}>PGM <b>{simThai(ctx.view.sw?.picture ?? "—")}</b> · เสียง {simThai((ctx.view.sw?.audio ?? []).join(" + ") || "ไม่มี")}{ctx.view.sw?.clip ? " · เสียงดังจนแตก" : ""}</p>
      </div>}
    </div>
    <div>
      <div style={C.card}><H>จอและมาตรวัดสัญญาณจำลอง</H>
        {Object.entries(ctx.view).filter(([d]) => ["display", "ingest", "speaker", "recorder", "storage", "host"].includes(MODELS[scenarioOf(state).simDevices![d].model].role)).map(([d, v]) =>
          <div key={d} style={{ fontSize: "0.85em", margin: "3px 0" }}><b>{scenarioOf(state).simDevices![d].label}</b>: {v.picture ? `🖵 ${simThai(v.picture)}` : ""} {v.audio?.length ? `🔊 ${simThai(v.audio.join(" + "))}` : ""} {v.recording ? "● กำลังบันทึก" : ""} {v.live ? "● กำลังถ่ายทอด" : ""} {v.feedback ? "⚠ เสียงหอน" : ""} <span style={C.muted}>({simThai(v.status)})</span></div>)}
      </div>
      <div style={C.card}><H>หลักฐานการทำงาน</H>
        {Object.values(scenarioOf(state).simDevices!).some((d) => d.model === "generic-test-ingest") && <div style={{ marginBottom: 6 }}><button style={C.btn} onClick={() => state.streamCheck(60)}>ทดสอบสตรีม 60 วินาที</button> <button style={C.btn} onClick={() => state.streamCheck(90)}>ทดสอบสตรีม 90 วินาที</button></div>}
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.8em", maxHeight: 180, overflow: "auto" }}>{sim.evidence.map((e, i) => <li key={i}>{simThai(e)}</li>)}</ul>
        <H>บันทึกเหตุการณ์</H>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.75em", maxHeight: 160, overflow: "auto", ...C.muted }}>{sim.log.slice(-40).reverse().map((l, i) => <li key={i}>[{l.kind}] {simThai(l.text)}</li>)}</ul>
      </div>
    </div>
  </div>;
}

function SignoffTab() {
  const state = useTrainingStore();
  const stage = scenarioOf(state).stage!;
  const sim = state.sim!;
  const score = stageScore(state);
  const results = validateLevel(simContext(state)!);
  return <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 14 }}>
    <div>
      {stage.quiz && <div style={C.card}><H>คำถามทบทวนความเข้าใจ</H><p>{stage.quiz.q}</p>
        {stage.quiz.options.map((o, i) => <button key={o} style={{ ...C.btn, display: "block", margin: "4px 0", textAlign: "left", ...(sim.quizOk && i === stage.quiz!.answer ? C.on : {}) }} onClick={() => state.quiz(i)}>{o}</button>)}
        {sim.quizOk && <p style={{ color: "#5be39a" }}>✓ {stage.quiz.why}</p>}
      </div>}
      <div style={C.card}><H>ตรวจรับงานและเก็บงาน</H>
        <p style={C.muted}>การตรวจรับจะทดสอบทุกเงื่อนไขกับสัญญาณจริงอีกครั้ง หยุดบันทึกให้เรียบร้อยก่อนเพื่อปิดไฟล์อย่างสมบูรณ์</p>
        <button style={{ ...C.btn, ...C.on }} onClick={() => state.signOff()} disabled={sim.signedOff}>{sim.signedOff ? "ตรวจรับแล้ว ✓" : "ยืนยันตรวจรับใบงาน"}</button>
        <p>รางวัล: <b>{stage.reward}</b></p>
        <small style={C.muted}>เป็นผลการฝึกในระบบจำลองเท่านั้น ไม่ใช่ใบอนุญาตหรือประกาศนียบัตรวิชาชีพ</small>
      </div>
    </div>
    <div style={C.card}><H>คะแนนปัจจุบัน</H>
      {score && <>
        <p style={{ fontSize: "1.3em", margin: "4px 0" }}><b>{score.score}/100</b> · {simThai(score.grade)} · เงื่อนไขสำคัญ {score.criticalOk ? "✓ ผ่านแล้ว" : "✗ ยังไม่ผ่าน"}</p>
        <table style={C.table}><tbody>{Object.entries(score.byCategory).map(([k, v]) => <tr key={k}><td>{simThai(k)}</td><td>{v}%</td></tr>)}</tbody></table>
        <small style={C.muted}>น้ำหนักคะแนน: เส้นทางสัญญาณ 35 · การตั้งค่า 20 · คุณภาพภาพและเสียง 15 · ความปลอดภัยและพื้นที่ 10 · วินิจฉัยและกู้ระบบ 10 · หลักฐาน 10 ข้อผิดพลาดที่มีผลต่องานหักครั้งละ 1 คะแนน</small>
      </>}
      {stage.guidance !== "certification" && <><H>เป้าหมาย</H><ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.82em" }}>{results.map((r) => <li key={r.id}>{r.result.ok ? "✓" : "○"} {r.label}{r.critical ? " ★" : ""}</li>)}</ul></>}
    </div>
  </div>;
}

/** Mission Paused → Targeted Learning Review → Mini Mastery Check → Resume. */
export function ReviewOverlay() {
  const sim = useTrainingStore((s) => s.sim);
  const review = useTrainingStore((s) => s.review);
  useEffect(() => { if (sim?.paused && document.pointerLockElement) document.exitPointerLock(); }, [sim?.paused]);
  if (!sim?.paused || !sim.reviewConcept) return null;
  const c = CONCEPTS[sim.reviewConcept];
  const last = [...sim.log].reverse().find((l) => l.kind === "reject");
  return <div style={{ position: "absolute", inset: 0, zIndex: 80, display: "grid", placeItems: "center", background: "rgba(3,8,16,.78)" }} role="alertdialog" aria-label="พักภารกิจเพื่อทบทวนจุดที่ยังไม่เข้าใจ">
    <div style={{ ...C.card, maxWidth: 560, background: "#0b1626", color: "#e8eef6", padding: 20 }}>
      <H>พักภารกิจเพื่อทบทวนจุดที่ยังไม่เข้าใจ</H>
      <p style={C.muted}>พบข้อผิดพลาดที่มีผลต่องาน 3 ครั้ง ครั้งล่าสุด: {simThai(last?.text ?? "")}</p>
      <p><b>{c.title}.</b> {c.review}</p>
      <H>คำถามทบทวนความเข้าใจ</H>
      <p>{c.check.q}</p>
      {c.check.options.map((o, i) => <button key={o} style={{ ...C.btn, display: "block", width: "100%", textAlign: "left", margin: "4px 0" }} onClick={() => review(i)}>{o}</button>)}
    </div>
  </div>;
}
