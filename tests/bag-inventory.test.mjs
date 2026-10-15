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
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
};
const load = createRequire(import.meta.url);
const { useTrainingStore: store } = load("../game/stores/training-store.ts");
const { SCENARIOS } = load("../game/training/scenarios.ts");
const { hiddenCablesFor, packedLeadsFor } = load("../game/content/cable-catalog.ts");

test("bag is a real inventory: take, put down, take another, stow", () => {
  const scenario = SCENARIOS["studio-full"];
  const packed = { "VID-HDMI-A-A": 2, "AUD-XLR-MIC": 1 };
  store.getState().reset("studio-full", hiddenCablesFor(scenario, packed), packedLeadsFor(scenario, packed));
  assert.equal(store.getState().bagged.length, 3, "every packed lead starts inside the bag");

  const first = store.getState().bagged.find((id) => id.startsWith("hdmi"));
  assert.ok(store.getState().takeCable(first));
  assert.equal(store.getState().held.cableId, first);
  assert.ok(!store.getState().bagged.includes(first), "a taken lead leaves the bag");

  store.getState().drop([0, 0.8, 0]);
  assert.equal(store.getState().held, null);
  assert.ok(!store.getState().bagged.includes(first), "a lead put down in the room does not return to the bag");

  const second = store.getState().bagged.find((id) => id.startsWith("hdmi"));
  assert.ok(second && second !== first, "the next HDMI comes out of the bag, not the one lying in the room");
  assert.equal(store.getState().takeCable(first), false, "a lead in the room cannot be taken through the bag");
  assert.ok(store.getState().takeCable(second));

  store.getState().stowHeld();
  assert.ok(store.getState().bagged.includes(second), "stowing puts the lead in hand back into the bag");
  assert.equal(store.getState().bagged.length, 2);
});
