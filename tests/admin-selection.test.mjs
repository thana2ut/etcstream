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
const store = {};
globalThis.window = { localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } } };
const load = createRequire(import.meta.url);
const { missionProgressRepository: repo } = load("../game/persistence/mission-progress-repository.ts");
const { missionChapters } = load("../game/content/mission-catalog.ts");

test("admin hall can open every level and the selection survives the play page reload", () => {
  for (const mission of missionChapters) for (const level of [1, 2, 3, 4, 5]) {
    assert.ok(repo.select("admin-p", mission.slug, level, true), `${mission.slug} ${level} opens`);
    const back = repo.load("admin-p").selected;
    assert.deepEqual([back?.slug, back?.difficulty], [mission.slug, level], `${mission.slug} ${level} survives reload`);
  }
});

test("players keep the unlock order (no admin flag)", () => {
  const slug = missionChapters[0].slug;
  assert.equal(repo.select("player-p", slug, 5), null);
  assert.ok(repo.select("player-p", slug, 1));
  const k = Object.keys(store).find((key) => key.endsWith(":player-p"));
  const record = JSON.parse(store[k]);
  record.selected.difficulty = 5;
  store[k] = JSON.stringify(record);
  assert.equal(repo.load("player-p").selected, null, "a hand-edited locked level is dropped on load");
});
