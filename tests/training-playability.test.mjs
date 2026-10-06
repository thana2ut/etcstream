import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  const resolved = request.startsWith("@/") ? path.join(projectRoot, request.slice(2)) : request;
  return resolveFilename.call(this, resolved, parent, ...rest);
};
Module._extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, resolveJsonModule: true } }).outputText;
  module._compile(output, filename);
};

const load = createRequire(import.meta.url);
const { SCENARIOS } = load("../game/training/scenarios.ts");
const { STUDIO } = load("../game/training/studio-room-layout.ts");
const { useTrainingStore } = load("../game/stores/training-store.ts");

test("every full-studio objective and action points to real scenario data", () => {
  const scenario = SCENARIOS["studio-full"];
  const objectiveIds = new Set(scenario.requirements.map((requirement) => requirement.id));
  const actionIds = new Set(scenario.actions.map((action) => action.id));
  const itemIds = new Set(scenario.placeables.map((item) => item.id));

  for (const requirement of scenario.requirements) {
    assert.ok(requirement.from.length > 0 && requirement.to.length > 0, `${requirement.id} needs endpoints`);
    for (const id of [...requirement.from, ...requirement.to]) assert.ok(scenario.ports[id], `${requirement.id} references missing ${id}`);
    assert.ok(requirement.from.some((id) => scenario.ports[id].direction === "OUTPUT"), `${requirement.id} needs an output`);
    assert.ok(requirement.to.some((id) => scenario.ports[id].direction === "INPUT"), `${requirement.id} needs an input`);
  }
  for (const action of scenario.actions) {
    assert.ok(!action.onItem || itemIds.has(action.onItem), `${action.id} references missing item`);
    for (const need of action.needs) assert.ok(objectiveIds.has(need) || actionIds.has(need), `${action.id} references missing prerequisite ${need}`);
  }
});

test("all carried equipment and cable rows start on reachable side tables", () => {
  const scenario = SCENARIOS["studio-full"];
  const [left, right] = STUDIO.sideTables;
  const [, , tableDepth] = STUDIO.sideTableSize;
  const withinDepth = (point, table) => Math.abs(point[2] - table[2]) <= tableDepth / 2;

  for (const item of scenario.placeables) {
    assert.ok(item.start[0] < -4.1 && withinDepth(item.start, left), `${item.id} must start on the equipment table`);
    assert.ok(Math.hypot(item.zone[0] - STUDIO.table[0], item.zone[2] - STUDIO.table[2]) <= STUDIO.tableRadius, `${item.id} zone must be on centre table`);
  }
  for (const cable of scenario.cables.filter((entry) => !entry.fixedA)) {
    for (const point of cable.start) assert.ok(point[0] > 4.1 && withinDepth(point, right), `${cable.id} must start on the cable table`);
  }
});

test("reset clears a pending equipment turn so retries start cleanly", () => {
  const store = useTrainingStore;
  store.getState().reset("studio-full");
  store.setState({ heldItem: "computer", heldTurn: Math.PI / 2 });
  store.getState().reset("studio-full");
  assert.equal(store.getState().heldTurn, 0);
  assert.equal(store.getState().heldItem, null);
});

test("touch mode exposes movement, look, interact, drop and turn controls", () => {
  const controls = fs.readFileSync(path.join(projectRoot, "components/game/touch-controls.tsx"), "utf8");
  const play = fs.readFileSync(path.join(projectRoot, "app/play/page.tsx"), "utf8");
  for (const action of ["move", "look", "interact", "drop", "turn"]) assert.match(controls, new RegExp(`type: \\\"${action}\\\"`));
  assert.match(play, /touch && !showExitConfirm && <TouchControls/);
  assert.doesNotMatch(play, /active=\{!introOpen && !touch/);
});
