// End-to-end check of the xs-1 independent validator without any database:
// a headless solver plays xs-1, every move is recorded as the SAME command the browser emits
// (training-store intents), then the commands are replayed through server/arena/command-replay
// apply() from the server's own start state, exactly as server/online/replay.ts does.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import { load, projectRoot } from "./helpers/solver.mjs";

const originalLoad = Module._load;
Module._load = function (request, parent, ...args) {
  if (request === "server-only") return {};
  return originalLoad.call(this, request, parent, ...args);
};
const { apply, commandCost } = load("../server/arena/command-replay.ts");
const { SCENARIOS } = load("../game/training/scenarios.ts");
const T = load("../game/training/hdmi-training.ts");
const { requiredBag, checkMissionBag } = load("../game/content/mission-bag.ts");
const { hiddenCablesFor, packedLeadsFor } = load("../game/content/cable-catalog.ts");
const { validateLevel } = load("../game/training/sim/engine.ts");

// Recording copy of the solver: identical logic, transitions wrapped to log browser-equivalent commands.
const log = [];
const rec = (method, fn, args) => (state, ...rest) => { log.push({ method, args: args(rest) }); return fn(state, ...rest); };
globalThis.__rec = {
  initialTrainingState: T.initialTrainingState,
  // Real runs start with the chosen cables packed in the bag: the player takes a lead out first (takeCable).
  act: (state, target, mode) => {
    if (target?.kind === "end" && state.bagged?.includes(target.cableId) && !state.held && !state.heldItem) {
      log.push({ method: "takeCable", args: [target.cableId] });
      state = apply(state, "takeCable", [target.cableId]);
      if (target.end === "a") return state;
      log.push({ method: "drop", args: [[0, 0.81, 0], 0, 0] });
      state = T.placeHeldOnCenterTable(state, [0, 0.81, 0], 0);
    }
    log.push({ method: "interact", args: [target, mode ?? "whole"] });
    return T.interactWithTarget(state, target, mode);
  },
  dropHeldEnd: rec("drop", T.placeHeldOnCenterTable, ([position]) => [position, 0, 0]),
  placeHeldOnCenterTable: rec("drop", T.placeHeldOnCenterTable, ([position, turn]) => [position, turn ?? 0, 0]),
  setControl: rec("control", T.setControl, (a) => a.slice(0, 3)),
  runTest: rec("test", T.runTest, (a) => a.slice(0, 1)),
  markTrace: rec("trace", T.markTrace, (a) => a.slice(0, 1)),
  streamTest: rec("streamCheck", T.streamTest, (a) => a.slice(0, 1)),
  requestAllClear: rec("allClear", T.requestAllClear, () => []),
  answerQuiz: rec("quiz", T.answerQuiz, (a) => a.slice(0, 1)),
  answerReview: rec("review", T.answerReview, (a) => a.slice(0, 1)),
  signOff: rec("signOff", T.signOff, () => []),
  simContext: T.simContext,
};
const source = fs.readFileSync(path.join(projectRoot, "tests/helpers/solver.mjs"), "utf8");
const destructure = /export const \{ initialTrainingState, interactWithTarget: act[^}]*\} = T;/;
assert.match(source, destructure, "solver transition import changed; update this test");
const patched = source
  .replace(destructure, "export const { initialTrainingState, act, dropHeldEnd, placeHeldOnCenterTable, setControl, runTest, simContext, signOff, answerQuiz, streamTest, requestAllClear, answerReview, markTrace } = globalThis.__rec;")
  .replace("let state = setUp(id);", "let state = setUp(id, globalThis.__start);");
const tmp = path.join(projectRoot, "tests/helpers/.xs1-recording-solver.tmp.mjs");
fs.writeFileSync(tmp, patched);
let solver;
try { solver = await import(new URL(`file:///${tmp.replace(/\\/g, "/")}`).href); } finally { fs.rmSync(tmp, { force: true }); }

const rules = { connector_ms: 5000, route_ms: 10000, hint_ms: 15000, failed_ms: 10000, version: 1 };
function serverStart(seed) {
  const scenario = SCENARIOS["xs-1"], bag = requiredBag(scenario);
  assert.ok(checkMissionBag(scenario, bag).ok, "required bag must pass the server bag check");
  const state = T.initialTrainingState("xs-1", hiddenCablesFor(scenario, bag), packedLeadsFor(scenario, bag));
  state.sim = T.initSim(scenario, seed);
  return state;
}
function replay(commands, seed) {
  let state = serverStart(seed), penalty = 0;
  for (const c of commands) { const next = apply(state, c.method, JSON.parse(JSON.stringify(c.args))); penalty += commandCost(state, next, c.method, rules).penalty; state = next; }
  const ctx = T.simContext(state);
  return { valid: Boolean(commands.length >= 2 && state.completed && ctx && !SCENARIOS["xs-1"].designIssues?.length && validateLevel(ctx).every((v) => v.result.ok)), penalty };
}

test("xs-1: a genuine browser command log replays to a VALID result on the server", () => {
  const seed = 424242;
  globalThis.__start = serverStart(seed);
  log.length = 0;
  const played = solver.solve("xs-1");
  assert.ok(played.completed, "solver completes xs-1");
  const result = replay(log, seed);
  assert.equal(result.valid, true, `server replay of ${log.length} commands must validate`);
  assert.equal(result.penalty, 0);
});
test("xs-1: truncated or reordered command logs are NOT valid (no forged finish)", () => {
  const seed = 99;
  globalThis.__start = serverStart(seed);
  log.length = 0; solver.solve("xs-1");
  const full = [...log];
  assert.equal(replay(full.slice(0, -1), seed).valid, false, "missing signOff");
  assert.equal(replay(full.filter((c) => c.method !== "test"), seed).valid, false, "skipped tests");
  assert.equal(replay([{ method: "signOff", args: [] }, { method: "signOff", args: [] }], seed).valid, false, "sign-off spam");
});
