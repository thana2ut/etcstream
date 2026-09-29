import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function loadTypeScript(path, modules = {}, globals = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  runInNewContext(outputText, { exports, require: (name) => modules[name], ...globals });
  return exports;
}

const catalog = loadTypeScript("game/content/mission-catalog.ts");

test("five named chapters each have five distinct difficulty levels", () => {
  assert.equal(catalog.missionChapters.length, 5);
  assert.equal(new Set(catalog.missionChapters.map((mission) => mission.slug)).size, 5);
  for (const mission of catalog.missionChapters) {
    assert.deepEqual(Array.from(mission.difficulties, ({ level }) => level), [1, 2, 3, 4, 5]);
    assert.ok(mission.difficulties.every((difficulty) => difficulty.title && difficulty.flavor && difficulty.objective));
  }
});

test("completion unlocks only the next level and persists per player", () => {
  const values = new Map();
  const window = { localStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  } };
  const { LocalStorageMissionProgressRepository, isDifficultyUnlocked } = loadTypeScript(
    "game/persistence/mission-progress-repository.ts",
    { "@/game/content/mission-catalog": catalog },
    { window }
  );
  const repository = new LocalStorageMissionProgressRepository();
  const slug = catalog.missionChapters[0].slug;
  const playerId = "SL-TEST01";

  assert.equal(isDifficultyUnlocked(repository.load(playerId), slug, 1), true);
  assert.equal(isDifficultyUnlocked(repository.load(playerId), slug, 2), false);
  assert.equal(repository.select(playerId, slug, 2), null);
  assert.ok(repository.select(playerId, slug, 1));
  assert.ok(repository.complete(playerId, slug, 1));
  assert.equal(isDifficultyUnlocked(repository.load(playerId), slug, 2), true);
  assert.equal(isDifficultyUnlocked(repository.load(playerId), slug, 3), false);
  assert.ok(repository.select(playerId, slug, 2));
  assert.deepEqual(Array.from(repository.load(playerId).completed[slug]), [1]);
  assert.equal(repository.load("SL-OTHER1").completed[slug], undefined);
});
