import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Load the project's TypeScript source directly without adding a runtime dependency.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  const resolved = request.startsWith("@/") ? path.join(projectRoot, request.slice(2)) : request;
  return resolveFilename.call(this, resolved, parent, ...rest);
};
Module._extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  module._compile(output, filename);
};

const load = createRequire(import.meta.url);

const { SCENARIOS } = load("../game/training/scenarios.ts");
const { initialTrainingState, interactWithTarget: act, dropHeldEnd, placeHeldOnCenterTable, plugFits } = load("../game/training/hdmi-training.ts");
const venues = Object.values(SCENARIOS).filter(s => s.venueScale);
function attach(state, cableId, end, portId) {
  if (state.cables[cableId][end].portId === portId) return state;
  state = act(state, { kind: "end", cableId, end });
  state = act(state, { kind: "port", portId });
  assert.equal(state.cables[cableId][end].portId, portId, `${state.scenarioId}: ${cableId} ${end} ${state.notice?.title}`);
  return state;
}
/** Venue workflow: portable gear starts in storage — carry each item to its operating position first. */
function setUp(id, state = initialTrainingState(id)) {
  for (const item of SCENARIOS[id].placeables) {
    if (state.items[item.id].position.join() === item.zone.join()) continue;
    state = act(state, { kind: "item", itemId: item.id });
    state = placeHeldOnCenterTable(state, item.zone);
  }
  return state;
}
function solve(scenario, state = setUp(scenario.id)) {
  for (const r of scenario.canonical) {
    state = attach(state, r.cableId, "a", r.from);
    state = attach(state, r.cableId, "b", r.to);
  }
  for (const action of scenario.actions) state = act(state, { kind: "action", actionId: action.id });
  return state;
}
test("catalog has exactly 25 venue scenarios", () => assert.equal(venues.length, 25));
for (const scenario of venues) {
  test(`${scenario.id}: canonical solution completes, disconnect invalidates, reconnect restores; rejection is atomic`, () => {
    const deviceIds = new Set(scenario.devices.map(d => d.id));
    assert.equal(deviceIds.size, scenario.devices.length);
    const ids = new Set();
    for (const r of scenario.requirements) {
      assert.ok(!ids.has(r.id)); ids.add(r.id);
      for (const p of [...r.from, ...r.to]) {
        assert.ok(scenario.ports[p]);
        assert.ok(deviceIds.has(scenario.ports[p].device));
      }
    }
    for (const link of scenario.canonical) {
      const c = scenario.cables.find(c => c.id === link.cableId);
      const from = scenario.ports[link.from], to = scenario.ports[link.to];
      assert.ok(c && from && to);
      assert.ok(plugFits(c.ends[0], from) && plugFits(c.ends[1], to));
      assert.equal(from.signalType, to.signalType);
      assert.equal(c.signalType, from.signalType);
      assert.equal(from.direction, "OUTPUT"); assert.equal(to.direction, "INPUT");
    }
    let prepared = initialTrainingState(scenario.id);
    for (const item of scenario.placeables) {
      for (let attempt = 0; attempt < 2; attempt++) {
        prepared = act(prepared, {kind: "item", itemId: item.id});
        assert.equal(prepared.heldItem, item.id);
        prepared = placeHeldOnCenterTable(prepared, item.zone);
        assert.equal(prepared.heldItem, null);
      }
    }
    const firstCable = scenario.canonical[0].cableId;
    for(let attempt = 0; attempt < 2; attempt++) {
      prepared = act(prepared, {kind:"end", cableId:firstCable, end:"a"});
      assert.equal(prepared.held.cableId,firstCable);
      prepared = dropHeldEnd(prepared,[0,0.81,0]);
      assert.equal(prepared.held,null);
    }
    let state = solve(scenario, prepared);
    assert.equal(state.completed, true, scenario.id);
    for (const link of scenario.canonical) {
      state = act(state, { kind: "port", portId: link.to });
      assert.equal(state.completed, false, `removing ${link.to} must invalidate`);
      state = act(state, { kind: "port", portId: link.to });
      state = solve(scenario, state);
      assert.equal(state.completed, true);
    }
    state = initialTrainingState(scenario.id);
    const link = scenario.canonical[0];
    state = act(state, { kind: "end", cableId: link.cableId, end: "b" });
    const before = structuredClone(state);
    state = act(state, { kind: "port", portId: "foreign-scenario:missing" });
    assert.deepEqual(state.cables, before.cables); assert.deepEqual(state.held, before.held);
    state = act(state, { kind: "end", cableId: "foreign-cable", end: "a" });
    assert.deepEqual(state.cables, before.cables);
  });
}
test("equipment and port coverage: every interactive device/port participates", () => {
  for (const s of venues) {
    const used = new Set(s.requirements.flatMap(r => [...r.from, ...r.to]));
    assert.equal(used.size, Object.keys(s.ports).length, s.id);
    for (const d of s.devices) assert.ok([...used].some(p => s.ports[p].device === d.id), `${s.id} orphan ${d.id}`);
    for (const a of s.actions) for (const n of a.needs) assert.ok(s.requirements.some(r => r.id === n) || s.actions.some(r => r.id === n));
  }
});
test("cable coverage: every required lead has legal endpoints and a signal type", () => {
  for (const s of venues) for (const c of s.cables) {
    assert.equal(c.ends.length, 2); assert.ok(c.signalType);
    assert.ok(c.purpose === "distractor" || s.canonical.some(r => r.cableId === c.id));
  }
});
test("wrong direction, connector, signal, route, occupied and loop never mutate held cable", () => {
  const s = SCENARIOS["xs-5"];
  function rejected(from, to, cableId = "lead-cam-1") {
    let state = setUp(s.id);
    if (from) state = attach(state, cableId, "a", from);
    state = act(state, { kind: "end", cableId, end: from ? "b" : "a" });
    const before = structuredClone(state);
    state = act(state, { kind: "port", portId: to });
    assert.deepEqual(state.cables, before.cables, `${from} -> ${to}`);
    assert.deepEqual(state.held, before.held);
    assert.equal(state.notice.tone, "error");
  }
  rejected("cam1:video-out", "sw:pgm-out"); // output -> output
  rejected("sw:input1", "capture:video-in"); // input -> input
  rejected("cam1:video-out", "capture:video-in"); // missing intermediate switcher
  rejected("cam1:video-out", "sw:presentation-in"); // wrong route, compatible connector
  rejected(null, "mix:input1"); // video -> audio
  rejected("cam1:video-out", "cam1:video-out"); // same endpoint
  let state = setUp(s.id);
  state = attach(state, "lead-cam-1", "a", "cam1:video-out");
  state = act(state, { kind: "end", cableId: "lead-monitor", end: "a" });
  const before = structuredClone(state);
  state = act(state, { kind: "port", portId: "cam1:video-out" });
  assert.deepEqual(state.cables, before.cables); assert.deepEqual(state.held, before.held);
  state = dropHeldEnd(state, [0, 0.8, 0]);
  assert.equal(state.held, null);
  // SDI cannot enter HDMI without an explicit converter.
  state = setUp("m-5");
  state = act(state, { kind: "end", cableId: "lead-cam-1", end: "a" });
  const snap = structuredClone(state);
  state = act(state, { kind: "port", portId: "sw:presentation-in" });
  assert.deepEqual(state.cables, snap.cables); assert.deepEqual(state.held, snap.held);
});
test("switching changes Program state and can return to an earlier source", () => {
  let state = solve(SCENARIOS["xs-3"]);
  state = act(state, { kind: "action", actionId: "select-cam-1" });
  assert.equal(state.programSource, "cam-1");
  state = act(state, { kind: "action", actionId: "select-slides" });
  assert.equal(state.programSource, "slides");
});

test("venue placement: every port, control and cable start sits inside its venue layout", () => {
  const { LAYOUTS, onSurface } = load("../game/training/venue-layouts.ts");
  for (const s of venues) {
    const L = LAYOUTS[s.layout];
    assert.ok(L, `${s.id}: unknown layout ${s.layout}`);
    const inside = (p) => p[0] >= L.bounds.minX && p[0] <= L.bounds.maxX && p[2] >= L.bounds.minZ && p[2] <= L.bounds.maxZ;
    for (const p of Object.values(s.ports)) {
      assert.ok(inside(p.position), `${s.id}: port outside venue ${p.label}`);
      assert.ok(p.position[1] > 0.1 && p.position[1] < 2.6, `${s.id}: port height ${p.label}`);
    }
    for (const a of s.actions) assert.ok(a.position[1] < 2.65, `${s.id}: action too high ${a.id}`);
    // Cables are stored at the venue's dedicated cable location.
    for (const c of s.cables) for (const p of c.start) assert.ok(onSurface(L.cables, p[0], p[2], 0.05), `${s.id}: cable ${c.id} not in cable storage`);
    // Portable equipment starts in storage (L4 starts set up) and has a named operating position.
    for (const item of s.placeables) {
      assert.ok(item.zoneLabel, `${s.id}: ${item.id} has no operating position label`);
      if (s.level !== 4) assert.ok(onSurface(L.equipment, item.start[0], item.start[2], 0.05), `${s.id}: ${item.id} must start in equipment storage`);
    }
  }
});
test("studio SDI configuration uses explicit converters without inventing SDI jacks on HDS7105", () => {
  const { buildVenueScenario } = load("../game/training/venue-scenarios.ts");
  const s = buildVenueScenario("s", 5, "SDI");
  assert.equal(s.ports["sw:input1"].connector, "HDMI");
  assert.equal(s.ports["cam1:sdi-out"].connector, "SDI");
  assert.ok(s.devices.some(d => d.id === "convert1"));
});
test("same physical connector with a different signal family is rejected", () => {
  const s = SCENARIOS["xs-1"], p = s.ports["sw:input1"];
  const old = p.signalType;
  try {
    p.signalType = "AUDIO_ANALOG";
    let state = initialTrainingState(s.id);
    state = act(state, {kind:"end", cableId:"lead-cam-1", end:"a"});
    const before = structuredClone(state);
    state = act(state, {kind:"port", portId:"sw:input1"});
    assert.equal(state.notice.tone, "error");
    assert.deepEqual(state.cables,before.cables); assert.deepEqual(state.held,before.held);
  } finally { p.signalType = old; }
});
