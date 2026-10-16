import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Load the project's TypeScript source directly (same loader as the other suites).
export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  const resolved = request.startsWith("@/") ? path.join(projectRoot, request.slice(2)) : request;
  return resolveFilename.call(this, resolved, parent, ...rest);
};
Module._extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, resolveJsonModule: true, esModuleInterop: true } }).outputText, filename);
};
export const load = createRequire(path.join(projectRoot, "tests", "x.mjs"));
export const { SCENARIOS } = load("../game/training/scenarios.ts");
export const T = load("../game/training/hdmi-training.ts");
export const { MODELS } = load("../game/training/sim/equipment.ts");
export const { canConnect, traceTo } = load("../game/training/sim/engine.ts");
export const { STAGES } = load("../game/training/sim/stages.ts");
export const { initialTrainingState, interactWithTarget: act, dropHeldEnd, placeHeldOnCenterTable, setControl, runTest, simContext, signOff, answerQuiz, streamTest, requestAllClear, answerReview, markTrace } = T;

export const STAGE_IDS = Object.keys(SCENARIOS).filter((id) => SCENARIOS[id].stage);

/* ───────── headless solver: plays a stage exactly through the public transitions ───────── */
export function setUp(id, state = initialTrainingState(id)) {
  for (const item of SCENARIOS[id].placeables) {
    if (state.items[item.id].position.join() === item.zone.join()) continue;
    state = act(state, { kind: "item", itemId: item.id });
    state = placeHeldOnCenterTable(state, item.zone);
  }
  return state;
}
export function free(state, portId) {
  if (state.held) state = dropHeldEnd(state, [0, 0.81, 0]);
  const occupied = Object.values(state.cables).some((c) => c.a.portId === portId || c.b.portId === portId);
  if (!occupied) return state;
  state = act(state, { kind: "port", portId });
  return dropHeldEnd(state, [0, 0.81, 0]);
}
export function attach(state, cableId, end, portId) {
  if (state.cables[cableId][end].portId === portId) return state;
  if (state.cables[cableId][end].portId) { state = act(state, { kind: "end", cableId, end }); state = dropHeldEnd(state, [0, 0.81, 0]); }
  state = free(state, portId);
  state = act(state, { kind: "end", cableId, end });
  state = act(state, { kind: "port", portId });
  assert.equal(state.cables[cableId][end].portId, portId, `${state.scenarioId}: ${cableId}.${end} → ${portId}: ${state.notice?.title} ${state.notice?.detail}`);
  return state;
}
export function wire(state) {
  const s = SCENARIOS[state.scenarioId];
  // Remove leads that sit on a canonical port but are not the canonical lead (wrong patches, decoys, return mis-patches).
  for (const r of s.canonical) for (const p of [r.from, r.to]) {
    const c = Object.entries(state.cables).find(([id, c]) => id !== r.cableId && (c.a.portId === p || c.b.portId === p));
    if (c) { const end = c[1].a.portId === p ? "a" : "b"; state = act(state, { kind: "end", cableId: c[0], end }); state = dropHeldEnd(state, [0, 0.81, 0]); }
  }
  for (const r of s.canonical) { state = attach(state, r.cableId, "a", r.from); state = attach(state, r.cableId, "b", r.to); }
  return state;
}
const LATE = new Set(["stream", "record"]);
export function configure(state, filter = (c) => !LATE.has(c.key)) {
  const stage = SCENARIOS[state.scenarioId].stage;
  for (const c of stage.solutionConfig.filter(filter)) state = setControl(state, c.device, c.key, c.value);
  return state;
}
export function optionFor(state, expect) {
  const ctx = simContext(state);
  const sw = SCENARIOS[state.scenarioId].simDevices.sw;
  for (const p of MODELS[sw.model].ports.filter((x) => x.dir === "INPUT" && (x.sig === "SDI" || x.sig === "HDMI"))) {
    const sig = ctx.inp[`sw:${p.key}`];
    if (sig?.kind === "video" && sig.content.includes(expect)) { const [kind, , n] = p.key.split("-"); return `${kind.toUpperCase()} ${n}`; }
  }
  return null;
}
export function runCues(state) {
  const stage = SCENARIOS[state.scenarioId].stage;
  for (const cue of stage.cues) {
    const opt = optionFor(state, cue.expect);
    assert.ok(opt, `${stage.id}: no input carries ${cue.expect}`);
    if (stage.previewBeforeTake) state = setControl(state, "sw", "pvw", opt);
    state = setControl(state, "sw", "pgm", opt);
  }
  return state;
}
/** Generic recovery: re-apply the documented config, re-plug canonical leads, take the fallback network if the ISP is locked down. */
export function recover(state) {
  const s = SCENARIOS[state.scenarioId];
  if (state.sim.locked.includes("net.wan-link")) {
    const eth = s.canonical.find((c) => c.from === "sw:eth");
    const wanLead = s.canonical.find((c) => c.from === "net:wan");
    state = setControl(state, "net2", "power", true);
    state = attach(state, eth.cableId, "b", "net2:lan-1");
    state = attach(state, wanLead.cableId, "a", "net2:wan");
    state = setControl(state, "net2", "uplink-test", true);
    return state;
  }
  state = wire(state);
  return configure(state);
}
export function fixFault(state, f) {
  const stage = SCENARIOS[state.scenarioId].stage;
  for (const c of f.config ?? []) {
    const want = stage.solutionConfig.find((x) => x.device === c.device && x.key === c.key) ?? (stage.startConfig ?? []).find((x) => x.device === c.device && x.key === c.key);
    state = setControl(state, c.device, c.key, want ? want.value : true);
  }
  const pairs = [...(f.unplug ?? []), ...(f.repatch ? [f.repatch.pair] : [])];
  for (const [from, to] of pairs) {
    const lead = SCENARIOS[state.scenarioId].canonical.find((c) => c.from === from && c.to === to);
    state = attach(state, lead.cableId, "a", from); state = attach(state, lead.cableId, "b", to);
  }
  return state;
}
export function solve(id, { stopAt, seed } = {}) {
  let state = setUp(id);
  if (seed !== undefined) state = { ...state, sim: { ...state.sim, seed } };
  const stage = SCENARIOS[id].stage;
  if (stage.weather === "lightning") { state = setControl(state, "site", "decision", "NO-GO (hold)"); state = requestAllClear(state); }
  if (state.sim.activeFaults.length) {
    // Live disruption: diagnose first (trace), cover the break if the job has a holding slate, then repair in a sensible order.
    state = markTrace(state, "program");
    if (stage.objectives.some((o) => o.id === "fallback")) { state = setControl(state, "gfx", "template", "Holding slate (back shortly)"); state = setControl(state, "sw", "pgm", "SDI 5"); }
    for (const f of [...stage.faults].sort((a, b) => (a.order ?? 9) - (b.order ?? 9))) state = fixFault(state, f);
    if (stage.objectives.some((o) => o.id === "fallback")) { state = setControl(state, "gfx", "template", "Scoreboard template (licensed)"); state = setControl(state, "sw", "pgm", "SDI 1"); }
  }
  state = wire(state);
  state = configure(state, (c) => !LATE.has(c.key) && c.device !== "site");
  state = configure(state, (c) => c.device === "site");
  for (const t of ["physical", "signal"]) { state = runTest(state, t); assert.ok(state.sim.testsPassed[t], `${id} ${t}: ${state.notice?.detail}`); }
  if (stopAt === "signal") return state;
  state = runCues(state);
  state = runTest(state, "rehearsal");
  assert.ok(state.sim.testsPassed.rehearsal, `${id} rehearsal: ${state.notice?.detail}`);
  if (state.sim.activeFaults.length) { state = markTrace(state, "program"); state = recover(state); }
  state = configure(state, (c) => LATE.has(c.key));
  state = streamTest(state, 60); state = streamTest(state, 90);
  // Stop recordings cleanly (evidence), keep the stream live.
  for (const [device, cfg] of Object.entries(state.sim.config)) if (cfg.record === true) state = setControl(state, device, "record", false);
  if (stage.quiz) state = answerQuiz(state, stage.quiz.answer);
  state = runTest(state, "delivery");
  assert.ok(state.sim.testsPassed.delivery, `${id} delivery: ${state.notice?.detail}`);
  state = signOff(state);
  return state;
}

