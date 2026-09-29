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
const validation = loadTypeScript("game/security/route-validation.ts", { "@/game/content/mission-catalog": catalog });
const nickname = loadTypeScript("game/security/nickname-validation.ts");
const slug = catalog.missionChapters[0].slug;

test("play routes accept only known modes, catalog slugs, and levels 1–5", () => {
  assert.equal(validation.parseGameMode("classroom"), "classroom");
  assert.equal(validation.parseGameMode("mission"), "mission");
  assert.equal(validation.parseGameMode("hack"), null);
  assert.equal(validation.parseMissionSlug(slug)?.slug, slug);
  assert.equal(validation.parseMissionSlug("../../admin"), null);
  assert.equal(validation.parseMissionSlug("unknown-stage"), null);
  assert.equal(validation.parseDifficulty("1"), 1);
  assert.equal(validation.parseDifficulty("5"), 5);
  for (const value of ["0", "6", "-1", "999999", "abc", "1e0", "1.0"]) {
    assert.equal(validation.parseDifficulty(value), null);
  }
  assert.equal(validation.getSafePlayParams(new URLSearchParams(`mode=mission&mission=${slug}&difficulty=1`)).mode, "mission");
  assert.equal(validation.getSafePlayParams(new URLSearchParams("mode=mission&mission=%3Cscript%3E&difficulty=1")).mode, "invalid");
  assert.equal(validation.getSafePlayParams(new URLSearchParams(`mode=mission&mission=${slug}&difficulty=6`)).mode, "invalid");
  assert.equal(validation.getSafePlayParams(new URLSearchParams("mode=mission&mission=unknown-stage&difficulty=1")).mode, "invalid");
  assert.equal(validation.getSafePlayParams(new URLSearchParams("mode=hack")).mode, "invalid");
  assert.equal(validation.getSafePlayParams(new URLSearchParams("mode=classroom&mode=mission")).mode, "invalid");
});

test("nickname validation preserves Thai names and rejects markup or controls", () => {
  assert.equal(nickname.validateNickname("  ต้า 123  "), "ต้า 123");
  assert.equal(nickname.validateNickname("Alex"), "Alex");
  for (const value of [null, "a", "x".repeat(21), "<script>alert(1)</script>", "<img src=x onerror=alert(1)>", "javascript:alert(1)", "a\nb"]) {
    assert.equal(nickname.validateNickname(value), null);
  }
});

test("corrupted progress JSON and malformed levels fall back without unlocking", () => {
  const values = new Map();
  const window = { localStorage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } };
  const { LocalStorageMissionProgressRepository, isDifficultyUnlocked } = loadTypeScript(
    "game/persistence/mission-progress-repository.ts",
    { "@/game/content/mission-catalog": catalog }, { window }
  );
  const repository = new LocalStorageMissionProgressRepository();
  const playerId = "SL-TEST01";
  const key = `etcstream-mission-progress-v1:${playerId}`;
  values.set(key, "{bad json");
  assert.equal(repository.load(playerId).selected, null);
  values.set(key, JSON.stringify({ version: 1, playerId, selected: { slug, difficulty: 999, acceptedAt: new Date().toISOString() }, completed: { [slug]: [2, "1", 99] } }));
  const loaded = repository.load(playerId);
  assert.equal(loaded.selected, null);
  assert.equal(isDifficultyUnlocked(loaded, slug, 2), false);
});

test("bad stored nickname recovers from backup without losing player ID", () => {
  const values = new Map();
  const window = { localStorage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } };
  const crypto = { getRandomValues: (bytes) => bytes.fill(1) };
  const { LocalStoragePlayerRepository } = loadTypeScript("game/persistence/player-repository.ts", { "@/game/security/nickname-validation": nickname }, { window, crypto });
  const repository = new LocalStoragePlayerRepository();
  values.set("streamlab-player-v1", JSON.stringify({ playerId: "SL-TEST01", nickname: "<script>", currentMode: "challenge", currentLevel: "S" }));
  values.set("streamlab_nickname", "ต้า");
  const player = repository.loadPlayer();
  assert.equal(player.playerId, "SL-TEST01");
  assert.equal(player.nickname, "ต้า");
  assert.equal(player.currentMode, "challenge");
  assert.equal(repository.savePlayer({ ...player, nickname: "<script>" }), false);
  values.set("streamlab-player-v1", "{bad json");
  assert.equal(repository.loadPlayer()?.nickname, "ต้า");
});
