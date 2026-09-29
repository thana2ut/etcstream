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
const { initialTrainingState, interactWithTarget, dropHeldEnd, placeHeldOnCenterTable, trainingProgress } = load("../game/training/hdmi-training.ts");
const end = (cableId, side) => ({ kind: "end", cableId, end: side });
const port = (portId) => ({ kind: "port", portId });
const item = (itemId) => ({ kind: "item", itemId });
const interact = (state, target) => interactWithTarget(state, target);

test("two HDMI cables complete Camera → Video Switcher → Monitor", () => {
  let state = initialTrainingState();
  state = interact(state, end("cable-1", "a"));
  assert.deepEqual(state.held, { cableId: "cable-1", end: "a" });
  state = interact(state, port("camera:hdmi-out"));
  state = interact(state, end("cable-1", "b"));
  state = interact(state, port("switcher:hdmi-in"));
  assert.equal(trainingProgress(state), 1);
  state = interact(state, end("cable-2", "a"));
  state = interact(state, port("switcher:hdmi-out"));
  state = interact(state, end("cable-2", "b"));
  state = interact(state, port("monitor:hdmi-in"));
  assert.equal(trainingProgress(state), 2);
  assert.equal(state.completed, true);
  assert.equal(state.held, null);
});

test("wrong direction and wrong route keep the end in hand", () => {
  let state = initialTrainingState();
  state = interact(state, end("cable-1", "a"));
  state = interact(state, port("camera:hdmi-out"));
  state = interact(state, end("cable-1", "b"));
  const reverse = interact(state, port("switcher:hdmi-out"));
  assert.equal(reverse.cables["cable-1"].b.portId, null);
  assert.deepEqual(reverse.held, state.held);
  const wrongRoute = interact(state, port("monitor:hdmi-in"));
  assert.equal(wrongRoute.cables["cable-1"].b.portId, null);
  assert.deepEqual(wrongRoute.held, state.held);
});

test("occupied port, disconnect, drop and reconnection behave consistently", () => {
  let state = initialTrainingState();
  state = interact(state, end("cable-1", "a"));
  state = interact(state, port("camera:hdmi-out"));
  state = interact(state, end("cable-2", "a"));
  const occupied = interact(state, port("camera:hdmi-out"));
  assert.deepEqual(occupied.held, state.held);
  assert.equal(occupied.cables["cable-2"].a.portId, null);
  state = dropHeldEnd(occupied, [0, 0.9, 0.8]);
  assert.equal(state.held, null);
  assert.deepEqual(state.cables["cable-2"].a.loosePosition, [0, 0.9, 0.8]);
  state = interact(state, port("camera:hdmi-out"));
  assert.deepEqual(state.held, { cableId: "cable-1", end: "a" });
  assert.equal(state.cables["cable-1"].a.portId, null);
});

test("cable can move from the pickup table to a center-table snap zone and be picked again", () => {
  let state = initialTrainingState();
  assert.ok(state.cables["cable-1"].a.loosePosition[0] < -3);
  state = interact(state, end("cable-1", "a"));
  state = placeHeldOnCenterTable(state, [0.4, 0.81, -0.1]);
  assert.equal(state.held, null);
  assert.deepEqual(state.cables["cable-1"].a.loosePosition, [-0.52, 0.81, -0.12]);
  state = interact(state, end("cable-1", "a"));
  assert.deepEqual(state.held, { cableId: "cable-1", end: "a" });
});

test("small equipment can be picked from the side table, placed, and picked again", () => {
  let state = initialTrainingState();
  state = interact(state, item("capture-card"));
  assert.equal(state.heldItem, "capture-card");
  state = placeHeldOnCenterTable(state, [0, 0.81, -0.4]);
  assert.equal(state.heldItem, null);
  assert.deepEqual(state.items["capture-card"].position, [-0.55, 0.84, -0.78]);
  state = interact(state, item("capture-card"));
  assert.equal(state.heldItem, "capture-card");
});

test("items stay in hand when the player tries to place them away from the center table", () => {
  let state = initialTrainingState();
  state = interact(state, item("signal-adapter"));
  state = placeHeldOnCenterTable(state, [3, 0.08, 2]);
  assert.equal(state.heldItem, "signal-adapter");
  assert.equal(state.notice.tone, "error");
});
