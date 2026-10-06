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
  let state = placeHeldOnCenterTable(interact(initialTrainingState(), item("switcher")), [0, 0.81, 0.5]);
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
  let state = placeHeldOnCenterTable(interact(initialTrainingState(), item("switcher")), [0, 0.81, 0.5]);
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
  // The rest of cable-1 stays in hand; set it down before taking another cable.
  assert.deepEqual(state.held, { cableId: "cable-1", end: "b" });
  state = dropHeldEnd(state, [0.4, 0.9, 0.8]);
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
  assert.deepEqual(state.cables["cable-1"].a.loosePosition, [-0.702, 0.81, -0.12]);
  state = interact(state, end("cable-1", "a"));
  assert.deepEqual(state.held, { cableId: "cable-1", end: "a" });
});

test("the HDS7105 switcher can be picked from the side table, placed, and picked again", () => {
  let state = initialTrainingState();
  state = interact(state, item("switcher"));
  assert.equal(state.heldItem, "switcher");
  state = placeHeldOnCenterTable(state, [0, 0.81, -0.4]);
  assert.equal(state.heldItem, null);
  assert.deepEqual(state.items.switcher.position, [0, 0.75, -0.4]); // free placement where the player aims
  // Placed far off-centre and turned: it lands inside the rim and its ports turn with it.
  let turned = placeHeldOnCenterTable(interact(state, item("switcher")), [2.3, 0.81, -0.743], Math.PI / 2);
  assert.deepEqual(turned.items.switcher.position, [1.65, 0.75, -0.743]);
  assert.equal(turned.items.switcher.turn, Math.PI / 2);
  state = interact(state, item("switcher"));
  assert.equal(state.heldItem, "switcher");
});

test("items stay in hand when the player tries to place them away from the center table", () => {
  let state = initialTrainingState();
  state = interact(state, item("switcher"));
  state = placeHeldOnCenterTable(state, [3, 0.08, 2]);
  assert.equal(state.heldItem, "switcher");
  assert.equal(state.notice.tone, "error");
});

test("a carried cable keeps its second end in hand, either end can go first, and F sets it down whole", () => {
  let state = initialTrainingState();
  state = interact(state, end("cable-1", "a"));
  // Aiming at the other end of the held lead switches which plug goes in first.
  state = interact(state, end("cable-1", "b"));
  assert.deepEqual(state.held, { cableId: "cable-1", end: "b" });
  state = interact(state, end("cable-1", "a"));
  state = interact(state, port("camera:hdmi-out"));
  assert.equal(state.cables["cable-1"].a.portId, "camera:hdmi-out");
  assert.deepEqual(state.held, { cableId: "cable-1", end: "b" }, "second end follows the player");
  const before = structuredClone(state.cables);
  assert.deepEqual(interact(state, end("cable-2", "a")).cables, before, "cannot grab a second cable while carrying one");
  // Dropping a lead that is still loose at both ends puts both plugs down together.
  let loose = interact(initialTrainingState(), end("cable-2", "a"));
  loose = dropHeldEnd(loose, [0, 0.9, 0.8]);
  assert.deepEqual(loose.cables["cable-2"].a.loosePosition, [0, 0.9, 0.8]);
  assert.deepEqual(loose.cables["cable-2"].b.loosePosition, [0.1, 0.9, 0.86]);
});

test("1 / 2 + E take only the head / tail of a cable; the other end stays put", () => {
  const start = initialTrainingState();
  let state = interactWithTarget(start, end("cable-1", "b"), "a");
  assert.deepEqual(state.held, { cableId: "cable-1", end: "a", single: true }, "1+E takes the head even when aiming at the tail");
  state = interact(state, port("camera:hdmi-out"));
  assert.equal(state.cables["cable-1"].a.portId, "camera:hdmi-out");
  assert.equal(state.held, null, "a single plug does not drag the other end along");
  assert.deepEqual(state.cables["cable-1"].b.loosePosition, start.cables["cable-1"].b.loosePosition);
  state = interactWithTarget(state, end("cable-1", "a"), "b");
  assert.deepEqual(state.held, { cableId: "cable-1", end: "b", single: true }, "2+E takes the tail");
  state = dropHeldEnd(state, [0, 0.9, 0.8]);
  assert.deepEqual(state.cables["cable-1"].b.loosePosition, [0, 0.9, 0.8]);
  assert.equal(state.cables["cable-1"].a.portId, "camera:hdmi-out", "dropping a single plug leaves the plugged head alone");
});
