"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useTrainingStore } from "@/game/stores/training-store";
import { scenarioOf, simContext, stageScore, STAGE_ORDER } from "@/game/training/hdmi-training";
import { MODELS } from "@/game/training/sim/equipment";
import { ROOMS } from "@/game/training/sim/rooms";
import { CONCEPTS } from "@/game/training/sim/library";
import { PREFLIGHT } from "@/game/training/sim/stages";
import { describe, portOf, testRoute, traceTo, validateLevel, type StageResult } from "@/game/training/sim/engine";
import type { EvalContext, TestStage } from "@/game/training/sim/types";
import { LAYOUTS } from "@/game/training/venue-layouts";

/**
 * Operator Console (C): the production desk for mission stages. Everything shown here is read from the evaluated
 * signal graph — devices, ports, live signals, trace, score. In certification stages it never reveals the answer:
 * no route checklist, no fixes, only symptoms and the learner's own test results.
 */
type Tab = "job" | "devices" | "tests" | "flow" | "show" | "signoff";
const TABS: [Tab, string][] = [["job", "Job"], ["devices", "Devices"], ["tests", "Tests & trace"], ["flow", "Signal flow"], ["show", "Run-of-show"], ["signoff", "Sign-off"]];

const C = {
  panel: { position: "absolute", inset: "64px max(16px, calc(50vw - 560px)) 16px", zIndex: 60, display: "flex", flexDirection: "column", background: "rgba(6, 13, 26, 0.96)", border: "1px solid #3b5372", borderRadius: 10, color: "#e8eef6", fontFamily: "inherit", boxShadow: "0 18px 60px rgba(0,0,0,.55)" } as CSSProperties,
  head: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid #24364d", flexWrap: "wrap" } as CSSProperties,
  body: { flex: 1, overflow: "auto", padding: "12px 16px" } as CSSProperties,
  btn: { background: "#15263d", color: "#e8eef6", borderWidth: 1, borderStyle: "solid", borderColor: "#3b5372", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: "0.85em" } as CSSProperties,
  on: { background: "#e7c98f", color: "#10131a", borderColor: "#e7c98f" } as CSSProperties,
  muted: { color: "#93a7bf" } as CSSProperties,
  card: { border: "1px solid #24364d", borderRadius: 8, padding: "10px 12px", marginBottom: 10, background: "rgba(20,34,54,.5)" } as CSSProperties,
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.82em" } as CSSProperties,
};
const ok = (pass: boolean | undefined) => pass === undefined ? <span style={C.muted}>○ not run</span> : pass ? <span style={{ color: "#5be39a" }}>✓ PASS</span> : <span style={{ color: "#ff8a7a" }}>✗ FAIL</span>;
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

  return <div style={{ ...C.panel, fontSize: `${scale}rem` }} role="dialog" aria-label="Operator console">
    <div style={C.head}>
      <strong style={{ color: "#e7c98f" }}>{stage.id} · {stage.title}</strong>
      <span style={C.muted}>{room.title} — {room.subtitle} · {stage.guidance.toUpperCase()} · {stage.minutes}</span>
      <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
        <button style={C.btn} onClick={() => setScale((v) => Math.max(0.85, +(v - 0.1).toFixed(2)))} aria-label="Smaller text">A−</button>
        <button style={C.btn} onClick={() => setScale((v) => Math.min(1.5, +(v + 0.1).toFixed(2)))} aria-label="Larger text">A+</button>
        <button style={C.btn} onClick={() => state.setConsoleOpen(false)} aria-label="Close console (Esc)">Close ✕</button>
      </span>
      <nav style={{ display: "flex", gap: 6, width: "100%", flexWrap: "wrap" }}>
        {TABS.map(([id, label]) => <button key={id} style={{ ...C.btn, ...(tab === id ? C.on : {}) }} onClick={() => setTab(id)}>{label}</button>)}
        <span style={{ ...C.muted, marginLeft: "auto", alignSelf: "center" }}>Errors {sim.errors}/3 · tests {STAGE_ORDER.map((t) => (sim.testsPassed[t] ? "✓" : "·")).join("")}{sim.activeFaults.length && !cert && stage.guidance !== "disruption" ? ` · faults ${sim.activeFaults.length}` : ""}</span>
      </nav>
    </div>
    <div style={C.body}>
      {tab === "job" && <JobTab ctx={ctx} />}
      {tab === "devices" && <DevicesTab ctx={ctx} selected={device} onSelect={setDevice} />}
      {tab === "tests" && <div>
        <H>Validation — run in order</H>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {STAGE_ORDER.map((t, i) => <button key={t} style={C.btn} onClick={() => runTestUi(t)}>{i + 1}. {t === "physical" ? "Physical layer" : t === "signal" ? "Signal" : t === "rehearsal" ? "Operator rehearsal" : "Stream / record"} test · {ok(sim.testsPassed[t])}</button>)}
        </div>
        {lastRun && <div style={C.card}>
          <H>Last run: {lastRun.stage}</H>
          <table style={C.table}><tbody>{lastRun.results.map((r) => <tr key={r.id} style={{ borderTop: "1px solid #24364d" }}>
            <td style={{ padding: 4, width: 90 }}>{ok(r.result.ok)}{r.critical ? " ★" : ""}</td>
            <td style={{ padding: 4 }}>{r.label}{!r.result.ok && <div style={C.muted}>Failed predicate: {r.result.reason}{!cert && r.result.fix ? <><br />Correction: {r.result.fix}</> : null}</div>}</td>
            <td style={{ padding: 4, ...C.muted }}>{r.category}</td></tr>)}</tbody></table>
          <small style={C.muted}>★ critical gate</small>
        </div>}
        <H>Signal trace (node → port → cable → node → port)</H>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {Object.keys(devs).filter((d) => ["display", "speaker", "ingest", "recorder", "storage", "host", "switcher"].includes(MODELS[devs[d].model].role)).map((d) =>
            <button key={d} style={{ ...C.btn, ...(traceDest === d ? C.on : {}) }} onClick={() => { setTraceDest(d); state.trace(d); }}>{devs[d].label}</button>)}
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
  const b = layout.bounds, W = 300, Hh = Math.round(W * (b.maxZ - b.minZ) / (b.maxX - b.minX));
  const px = (x: number) => ((x - b.minX) / (b.maxX - b.minX)) * W, pz = (z: number) => ((z - b.minZ) / (b.maxZ - b.minZ)) * Hh;
  return <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0, 340px)", gap: 14 }}>
    <div>
      <div style={C.card}><H>Job ticket (stage manager)</H><p style={{ margin: 0 }}>{stage.ticket}</p></div>
      <div style={C.card}><H>Call sheet</H><ul style={{ margin: 0, paddingLeft: 18 }}>{stage.callSheet.map((x) => <li key={x}>{x}</li>)}</ul></div>
      <div style={C.card}><H>Instructor captions</H>{stage.briefing.map((x, i) => <p key={i} style={{ margin: "2px 0" }}>🎙 {x}</p>)}</div>
      <div style={C.card}><H>Pass criteria</H><ul style={{ margin: 0, paddingLeft: 18 }}>{stage.passCriteria.map((x) => <li key={x}>{x}</li>)}</ul></div>
      {guided && scenario.requirements.length > 0 && <div style={C.card}><H>Patch plan (guided)</H><ol style={{ margin: 0, paddingLeft: 18 }}>{scenario.requirements.map((r) => <li key={r.id}>{r.label}</li>)}</ol></div>}
      {stage.guidance === "certification" && <div style={C.card}><H>Required graph (your plan)</H><p style={{ ...C.muted, margin: 0 }}>Draw your own patch and angle plan from the job ticket and the device glossary. No solved connections are shown in a certification.</p></div>}
    </div>
    <div>
      <div style={C.card}><H>Preflight / safety checklist</H>
        {stage.weather && <div style={{ marginBottom: 8 }}>
          <div>Forecast now: <b style={{ color: sim.weatherNow === "lightning" ? "#ff8a7a" : "#5be39a" }}>{sim.weatherNow === "lightning" ? "⚡ Lightning within 10 km — unsafe" : "☁ Overcast, light drizzle, no lightning — shelter rated"}</b></div>
          <label>Decision{" "}
            <select value={String(sim.config.site?.decision ?? "(undecided)")} onChange={(e) => state.control("site", "decision", e.target.value)} style={C.btn}>
              {["(undecided)", "GO", "NO-GO (hold)"].map((o) => <option key={o}>{o}</option>)}
            </select></label>{" "}
          <button style={C.btn} onClick={() => state.allClear()}>Hold 30 min for the all-clear</button>
          <div style={{ ...C.muted, fontSize: "0.8em" }}>Regulations depend on the actual jurisdiction. Mains, generators and rigging are handled only by qualified, supervised professionals.</div>
        </div>}
        {stage.preflight.map((k) => <label key={k} style={{ display: "block", margin: "3px 0" }}>
          <input type="checkbox" checked={sim.config.site?.[k] === true} onChange={(e) => state.control("site", k, e.target.checked)} /> {PREFLIGHT[k]}
        </label>)}
        {stage.preflight.length === 0 && !stage.weather && <span style={C.muted}>No site checklist for this job.</span>}
      </div>
      <div style={C.card}><H>Floor plan (top-down)</H>
        <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" style={{ background: "#0b1626", borderRadius: 6 }} role="img" aria-label="Top-down floor plan with device stations">
          {layout.furniture.map((f) => <rect key={f.id} x={px(f.center[0] - f.size[0] / 2)} y={pz(f.center[2] - f.size[2] / 2)} width={Math.max(1, (f.size[0] / (b.maxX - b.minX)) * W)} height={Math.max(1, (f.size[2] / (b.maxZ - b.minZ)) * Hh)} fill="#1e2c40" stroke="#2f4560" />)}
          {scenario.devices.map((d) => { const placed = ctx.placed(d.id); const it = state.items[d.id]; const p = it ? it.position : d.position; return <g key={d.id}><circle cx={px(p[0])} cy={pz(p[2])} r={3.2} fill={placed ? "#e7c98f" : "#5f7894"} /><text x={px(p[0]) + 4} y={pz(p[2]) - 3} fontSize={6} fill="#c9d6e6">{d.id}</text></g>; })}
        </svg>
        <small style={C.muted}>● gold = installed at its station · grey = still in its case</small>
      </div>
      <div style={C.card}><H>Stations</H>{scenario.devices.map((d) => <div key={d.id} style={{ fontSize: "0.82em" }}><b>{d.label}</b> — <span style={C.muted}>{scenario.placeables.find((p) => p.id === d.id)?.zoneLabel ?? "installed/fixed position"}</span></div>)}</div>
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
  return <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: 14 }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {Object.keys(devs).map((d) => <button key={d} style={{ ...C.btn, textAlign: "left", ...(d === id ? C.on : {}) }} onClick={() => onSelect(d)}>
        {ctx.view[d]?.powered || !MODELS[devs[d].model].needsPower ? "●" : "○"} {devs[d].label}</button>)}
    </div>
    <div>
      <div style={C.card}>
        <H>{inst.label} · {m.name}</H>
        <div style={C.muted}>{m.manufacturer}{m.generic ? " (labelled training stand-in)" : ""} · model id {m.modelId}</div>
        {m.sourceUrl && <div style={{ fontSize: "0.8em" }}>Source: <a href={m.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "#8be4f4" }}>{m.sourceUrl}</a></div>}
        <div style={{ fontSize: "0.8em" }}>Verified ports: {m.verifiedPorts.join(" · ")}</div>
        <div style={{ fontSize: "0.8em", ...C.muted }}>Asset licence: {m.assetLicense}</div>
        {m.notes.map((n) => <div key={n} style={{ fontSize: "0.8em" }}>ⓘ {n}</div>)}
        <div style={{ marginTop: 6 }}>Status: <b>{v?.status ?? "—"}</b>{v?.problem && !cert ? <span style={{ color: "#ff8a7a" }}> · {v.problem.text}</span> : null}</div>
      </div>
      {m.controls.length > 0 && <div style={C.card}><H>Controls</H>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 8 }}>
          {m.controls.map((c) => { const val = ctx.cfg(id, c.key); const isLocked = locked.includes(`${id}.${c.key}`); return <label key={c.key} title={c.tip} style={{ fontSize: "0.85em" }}>
            <div>{c.label}{isLocked ? " 🔒" : ""}</div>
            {c.kind === "toggle" ? <button style={{ ...C.btn, ...(val === true ? C.on : {}) }} disabled={isLocked} onClick={() => state.control(id, c.key, !(val === true))}>{val === true ? "ON" : "OFF"}</button>
              : <select style={{ ...C.btn, width: "100%" }} disabled={isLocked} value={String(val ?? "")} onChange={(e) => state.control(id, c.key, e.target.value)}>{c.options!.map((o) => <option key={o}>{o}</option>)}</select>}
          </label>; })}
        </div></div>}
      <div style={C.card}><H>Ports ({m.ports.length}) — rear/front panel, engraved names</H>
        <table style={C.table}><thead><tr style={C.muted}><th align="left">Port</th><th align="left">Dir</th><th align="left">Connector</th><th align="left">Signal</th><th align="left">Now</th></tr></thead>
          <tbody>{m.ports.map((p) => { const gid = `${id}:${p.key}`; const used = ctx.edges.some((e) => e.from === gid || e.to === gid) || Object.values(state.cables).some((c) => c.a.portId === gid || c.b.portId === gid); const sig = p.dir === "OUTPUT" ? ctx.out[gid] : ctx.inp[gid];
            return <tr key={p.key} title={p.tip} style={{ borderTop: "1px solid #24364d" }}><td style={{ padding: 3 }}><b>{p.name}</b><div style={C.muted}>{p.tip}</div></td><td>{p.dir === "INPUT" ? "◀ IN" : "OUT ▶"}</td><td>{p.connector}</td><td>{p.sig}{p.channels ? ` ·${p.channels}ch` : ""}{p.formats ? ` · ${p.formats.join("/")}` : ""}</td><td>{used ? "used" : "free"}{sig ? <div style={{ color: "#5be39a" }}>{describe(sig)}</div> : null}</td></tr>; })}</tbody></table>
      </div>
    </div>
  </div>;
}

function TraceView({ ctx, dest, cert }: { ctx: EvalContext; dest: string; cert: boolean }) {
  const scenario = scenarioOf(useTrainingStore.getState());
  const { hops, first } = useMemo(() => traceTo(scenario.simDevices!, ctx, dest, scenario.cableMeta ?? {}), [scenario, ctx, dest]);
  return <div style={C.card}>
    {hops.length === 0 && <span style={C.muted}>Nothing is cabled into this destination.</span>}
    <ol style={{ margin: 0, paddingLeft: 18, fontSize: "0.85em" }}>{hops.map((h, i) => <li key={i} style={{ color: h.ok ? "#cfe0f2" : "#ff8a7a" }}>{h.ok ? "✓" : "✗"} {h.port ? <>{h.node}: {h.port}</> : <b>{h.node}</b>} <span style={C.muted}>— {h.note}</span></li>)}</ol>
    {first && <p style={{ marginBottom: 0 }}>First faulty node: <b>{first.node}</b> — {first.note}{!cert && first.fix ? <><br />Fix: {first.fix}</> : null}</p>}
    {!first && hops.length > 0 && <p style={{ color: "#5be39a", marginBottom: 0 }}>✓ No fault found along this path.</p>}
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
  const W = 170, Hh = 44, pos: Record<string, [number, number]> = {};
  cols.forEach((col, c) => col.forEach((n, r) => { pos[n] = [20 + c * (W + 40), 20 + r * (Hh + 16)]; }));
  const width = Math.max(900, 40 + cols.length * (W + 40)), height = 40 + Math.max(...cols.map((c) => c.length)) * (Hh + 16);
  return <div>
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ background: "#0b1626", borderRadius: 8, minHeight: 200 }} role="img" aria-label="Signal flow diagram from the current patch">
      {ctx.edges.map((e) => { const a = pos[e.from.split(":")[0]], b = pos[e.to.split(":")[0]]; const live = Boolean(ctx.inp[e.to]); return <path key={e.cableId} d={`M${a[0] + W},${a[1] + Hh / 2} C${a[0] + W + 30},${a[1] + Hh / 2} ${b[0] - 30},${b[1] + Hh / 2} ${b[0]},${b[1] + Hh / 2}`} fill="none" stroke={live ? "#5be39a" : "#ff8a7a"} strokeWidth={2} strokeDasharray={live ? undefined : "5 4"} />; })}
      {nodes.map((n) => <g key={n}><rect x={pos[n][0]} y={pos[n][1]} width={W} height={Hh} rx={6} fill="#15263d" stroke={ctx.view[n]?.problem ? "#ff8a7a" : "#3b5372"} /><text x={pos[n][0] + 8} y={pos[n][1] + 17} fontSize={11} fill="#e8eef6">{devs[n].label.slice(0, 26)}</text><text x={pos[n][0] + 8} y={pos[n][1] + 33} fontSize={9} fill="#93a7bf">{(ctx.view[n]?.status ?? "").slice(0, 32)}</text></g>)}
    </svg>
    <small style={C.muted}>Solid green = signal present on that cable · dashed red = cable present, no valid signal. Built live from your cables.</small>
    <table style={{ ...C.table, marginTop: 10 }}><tbody>{ctx.edges.map((e) => { const po = portOf(devs, e.from)!, pi = portOf(devs, e.to)!; const sig = ctx.inp[e.to]; return <tr key={e.cableId} style={{ borderTop: "1px solid #24364d" }}>
      <td style={{ padding: 3 }}>{devs[e.from.split(":")[0]].label} · {po.name}</td><td>→ [{scenario.cableMeta?.[e.cableId]?.label ?? e.cableId}] →</td><td>{devs[e.to.split(":")[0]].label} · {pi.name}</td><td style={{ color: sig ? "#5be39a" : "#ff8a7a" }}>{sig ? describe(sig) : "no signal"}</td></tr>; })}</tbody></table>
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
      <div style={C.card}><H>Run-of-show</H>
        {stage.cues.length === 0 && <span style={C.muted}>This job has no switching cues — the rehearsal is the soundcheck in the preflight list.</span>}
        <ol style={{ margin: 0, paddingLeft: 18 }}>{stage.cues.map((c, i) => <li key={c.id} style={{ fontWeight: i === sim.cueIndex ? 700 : 400, color: i < sim.cueIndex ? "#5be39a" : i === sim.cueIndex ? "#e7c98f" : undefined }}>{i < sim.cueIndex ? "✓ " : i === sim.cueIndex && cueLive ? "▶ STANDBY — " : ""}{c.call}</li>)}</ol>
        {!sim.testsPassed.signal && stage.cues.length > 0 && <p style={C.muted}>The countdown starts once the signal test passes. Practice takes before that are not scored.</p>}
        {cueLive && <p style={{ color: "#e7c98f" }}>Countdown: 3 … 2 … 1 … {stage.previewBeforeTake ? "PREVIEW, then TAKE" : "TAKE"} on the call.</p>}
      </div>
      {sw && <div style={C.card}><H>Vision mixer</H>
        <div style={{ marginBottom: 6 }}>PREVIEW: {options.map((o) => <button key={o} style={{ ...C.btn, margin: 2, ...(pvw === o ? { background: "#2e7d4f" } : {}) }} onClick={() => state.control("sw", "pvw", o)}>{o}</button>)}</div>
        <div style={{ marginBottom: 6 }}>PROGRAM: {options.map((o) => <button key={o} style={{ ...C.btn, margin: 2, ...(pgm === o ? { background: "#b3322a" } : {}) }} onClick={() => state.control("sw", "pgm", o)}>{o}</button>)}</div>
        <button style={{ ...C.btn, ...C.on }} onClick={() => pvw && state.control("sw", "pgm", pvw)} disabled={!MODELS[sw.model].controls.some((c) => c.key === "pvw")}>TAKE (Preview → Program)</button>
        <p style={{ marginBottom: 0 }}>PGM <b>{ctx.view.sw?.picture ?? "—"}</b> · audio {(ctx.view.sw?.audio ?? []).join(" + ") || "none"}{ctx.view.sw?.clip ? " · CLIP" : ""}</p>
      </div>}
    </div>
    <div>
      <div style={C.card}><H>Monitors & meters (simulated)</H>
        {Object.entries(ctx.view).filter(([d]) => ["display", "ingest", "speaker", "recorder", "storage", "host"].includes(MODELS[scenarioOf(state).simDevices![d].model].role)).map(([d, v]) =>
          <div key={d} style={{ fontSize: "0.85em", margin: "3px 0" }}><b>{scenarioOf(state).simDevices![d].label}</b>: {v.picture ? `🖵 ${v.picture}` : ""} {v.audio?.length ? `🔊 ${v.audio.join(" + ")}` : ""} {v.recording ? "● REC" : ""} {v.live ? "● LIVE" : ""} {v.feedback ? "⚠ FEEDBACK" : ""} <span style={C.muted}>({v.status})</span></div>)}
      </div>
      <div style={C.card}><H>Evidence log</H>
        {Object.values(scenarioOf(state).simDevices!).some((d) => d.model === "generic-test-ingest") && <div style={{ marginBottom: 6 }}><button style={C.btn} onClick={() => state.streamCheck(60)}>Run 60-s stream test</button> <button style={C.btn} onClick={() => state.streamCheck(90)}>Run 90-s stream test</button></div>}
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.8em", maxHeight: 180, overflow: "auto" }}>{sim.evidence.map((e, i) => <li key={i}>{e}</li>)}</ul>
        <H>Event log</H>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.75em", maxHeight: 160, overflow: "auto", ...C.muted }}>{sim.log.slice(-40).reverse().map((l, i) => <li key={i}>[{l.kind}] {l.text}</li>)}</ul>
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
      {stage.quiz && <div style={C.card}><H>Mini mastery check</H><p>{stage.quiz.q}</p>
        {stage.quiz.options.map((o, i) => <button key={o} style={{ ...C.btn, display: "block", margin: "4px 0", textAlign: "left", ...(sim.quizOk && i === stage.quiz!.answer ? C.on : {}) }} onClick={() => state.quiz(i)}>{o}</button>)}
        {sim.quizOk && <p style={{ color: "#5be39a" }}>✓ {stage.quiz.why}</p>}
      </div>}
      <div style={C.card}><H>Sign-off & post-event wrap</H>
        <p style={C.muted}>Signing off re-validates every objective on the live graph. Stop recordings cleanly first so files close.</p>
        <button style={{ ...C.btn, ...C.on }} onClick={() => state.signOff()} disabled={sim.signedOff}>{sim.signedOff ? "Signed off ✓" : "Sign the job ticket"}</button>
        <p>Reward: <b>{stage.reward}</b></p>
        <small style={C.muted}>Simulation training record only — not a professional licence or certification.</small>
      </div>
    </div>
    <div style={C.card}><H>Score (live)</H>
      {score && <>
        <p style={{ fontSize: "1.3em", margin: "4px 0" }}><b>{score.score}/100</b> · {score.grade} · critical gates {score.criticalOk ? "✓ passed" : "✗ not yet"}</p>
        <table style={C.table}><tbody>{Object.entries(score.byCategory).map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}%</td></tr>)}</tbody></table>
        <small style={C.muted}>Weights: signal path 35 · configuration 20 · audio/video quality 15 · safety/layout 10 · diagnostics/recovery 10 · evidence 10. Each meaningful error −1.</small>
      </>}
      {stage.guidance !== "certification" && <><H>Objectives</H><ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.82em" }}>{results.map((r) => <li key={r.id}>{r.result.ok ? "✓" : "○"} {r.label}{r.critical ? " ★" : ""}</li>)}</ul></>}
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
  return <div style={{ position: "absolute", inset: 0, zIndex: 80, display: "grid", placeItems: "center", background: "rgba(3,8,16,.78)" }} role="alertdialog" aria-label="Mission paused — targeted learning review">
    <div style={{ ...C.card, maxWidth: 560, background: "#0b1626", color: "#e8eef6", padding: 20 }}>
      <H>Mission paused — targeted learning review</H>
      <p style={C.muted}>Three meaningful errors. The last one: {last?.text}</p>
      <p><b>{c.title}.</b> {c.review}</p>
      <H>Mini mastery check</H>
      <p>{c.check.q}</p>
      {c.check.options.map((o, i) => <button key={o} style={{ ...C.btn, display: "block", width: "100%", textAlign: "left", margin: "4px 0" }} onClick={() => review(i)}>{o}</button>)}
    </div>
  </div>;
}
