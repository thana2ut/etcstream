// Isolated ephemeral database only. Never opens the owner's Arena store or imports local scores.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Module from "node:module";
import { DatabaseSync } from "node:sqlite";
import { load } from "./helpers/solver.mjs";
const folder = fs.mkdtempSync(path.join(os.tmpdir(), "etcstream-arena-test-"));
process.env.ARENA_DB_PATH = path.join(folder, "isolated.sqlite");
const database = new DatabaseSync(process.env.ARENA_DB_PATH);
database.exec(fs.readFileSync(new URL("../server/arena/schema.sql", import.meta.url), "utf8"));
for (const m of ["002-online-ranked.sql", "003-authoritative-commands.sql"]) database.exec(fs.readFileSync(new URL(`../server/arena/migrations/${m}`, import.meta.url), "utf8"));
database.close();
const jar = new Map();
const originalLoad = Module._load;
Module._load = function(request, parent, ...args) {
  if (request === "server-only") return {};
  if (request === "next/headers") return { cookies: async () => ({ get: (key) => jar.has(key) ? { value: jar.get(key) } : undefined, set: (key, value) => jar.set(key, value), delete: (key) => jar.delete(key) }) };
  return originalLoad.call(this, request, parent, ...args);
};
const { requiredBag } = load("../game/content/mission-bag.ts"), { SCENARIOS } = load("../game/training/scenarios.ts");
const arena = load("../server/arena/service.ts"), storage = load("../server/arena/db.ts"), auth = load("../server/arena/auth.ts");
after(() => { storage.db().close(); fs.rmSync(folder, { recursive: true, force: true }); });

test("distinct server identities do not merge duplicate nicknames; clear keeps IDs, friend codes and attempts", () => {
  // Duplicate nicknames are now rejected outright (stricter than "never merged").
  const a = arena.createPlayer("FixtureClear"), b = arena.createPlayer("FixtureSame");
  assert.throws(() => arena.createPlayer("FixtureSame"));
  assert.notEqual(a.id, b.id); assert.notEqual(a.friend_code, b.friend_code);
  const attempt = arena.createAttempt(a.id, "xs-1");
  assert.throws(() => arena.moderate("fixture-owner", { id: a.id, action: "clear", confirm: b.friend_code, reason: "isolated wrong-code test" }), /รหัสสหาย/);
  arena.moderate("fixture-owner", { id: a.id, action: "clear", confirm: a.friend_code, reason: "isolated clear-name test" });
  const cleared = storage.one("SELECT * FROM players WHERE id=?", a.id);
  assert.equal(arena.displayName(cleared), arena.anonymous); assert.equal(cleared.friend_code, a.friend_code);
  assert.equal(arena.ownedAttempt(a.id, attempt.id).player, a.id);
  assert.equal(storage.one("SELECT name FROM players WHERE id=?", b.id).name, "FixtureSame");
});
test("blocked peers cannot invite, self invitations fail and recipient alone can accept", () => {
  const a = arena.createPlayer("FixtureFriendA"), b = arena.createPlayer("FixtureFriendB");
  assert.throws(() => arena.friendAction(a.id, { code: a.friend_code, action: "request" }));
  arena.friendAction(a.id, { code: b.friend_code, action: "request" });
  assert.throws(() => arena.friendAction(a.id, { code: b.friend_code, action: "accept" }));
  arena.friendAction(b.id, { code: a.friend_code, action: "accept" });
  assert.equal(arena.friendsFor(a.id)[0].status, "accepted");
  arena.friendAction(b.id, { code: a.friend_code, action: "block" });
  assert.throws(() => arena.friendAction(a.id, { code: b.friend_code, action: "request" }));
  assert.equal(arena.friendsFor(a.id).length, 0);
});
test("forged finish stays unranked, duplicate finish is idempotent and wrong owner cannot access", () => {
  const p = arena.createPlayer("FixtureAttempt");
  const a = arena.createAttempt(p.id, "s-1");
  assert.throws(() => arena.attemptAction(p.id, a.id, { action: "ready" }), "ready without a cable bag is refused");
  arena.attemptAction(p.id, a.id, { action: "ready", bag: requiredBag(SCENARIOS["s-1"]) });
  // Fixture clock setup only: no real gameplay record or owner progress is modified.
  storage.run("UPDATE attempts SET start=? WHERE id=?", Date.now() - 10000, a.id);
  // A client-claimed "completed" state with no server command evidence is refused outright (stricter than UNDER_REVIEW).
  const forged = () => arena.attemptAction(p.id, a.id, { action: "finish", state: { completed: true }, elapsedMs: 1, success: true });
  assert.throws(forged, /หลักฐาน/); assert.throws(forged, /หลักฐาน/);
  assert.notEqual(arena.ownedAttempt(p.id, a.id).status, "VERIFIED");
  assert.deepEqual(arena.leaderboard("s-1", "all"), []);
  assert.throws(() => arena.ownedAttempt("wrong-owner", a.id));
});
test("admin sessions cannot be forged by nickname or player cookie; bootstrap rotation is mandatory", async () => {
  jar.clear(); await assert.rejects(auth.requireSession("admin"), (e) => e.status === 401);
  const p = arena.createPlayer("FixtureSession"); await auth.issueSession(p.id, "player");
  jar.set("etc_admin", jar.get("etc_player")); await assert.rejects(auth.requireSession("admin"), (e) => e.status === 401);
  const id = "fixture-owner", hash = auth.passwordHash("FixtureOnlySecretForTests!");
  storage.run("INSERT INTO admins VALUES(?,?,1,1)", id, hash); await auth.issueSession(id, "admin");
  await assert.rejects(auth.requireSession("admin"), (e) => e.status === 403);
  assert.equal((await auth.requireSession("admin", true)).id, id);
  assert.equal(auth.passwordMatches("FixtureOnlySecretForTests!", hash), true);
  assert.equal(auth.passwordMatches("wrong", hash), false);
});
test("cross-origin mutations fail; audit rows cannot be edited or deleted", () => {
  assert.throws(() => auth.checkOrigin(new Request("http://localhost:3000/api/admin/moderate", { headers: { origin: "https://untrusted.invalid" } })), (e) => e.status === 403);
  storage.audit("fixture-owner", "fixture-action", "fixture-target", "isolated audit test");
  assert.throws(() => storage.run("DELETE FROM audit")); assert.throws(() => storage.run("UPDATE audit SET reason='overwrite'"));
});
test("name privacy, presence expiry and moderation never fabricate online state or erase score history", async () => {
  const p = arena.createPlayer("FixturePrivacy");
  assert.equal(arena.playerView(p).online, false);
  await auth.issueSession(p.id, "player"); storage.run("UPDATE players SET presence=1,public=1 WHERE id=?", p.id);
  let current = storage.one("SELECT * FROM players WHERE id=?", p.id);
  assert.equal(arena.playerView(current).online, true);
  storage.run("UPDATE sessions SET seen=? WHERE principal=?", Date.now() - 100000, p.id);
  assert.equal(arena.playerView(current).online, false);
  const a = arena.createAttempt(p.id, "xl-5");
  arena.moderate("fixture-owner", { id: p.id, confirm: p.friend_code, action: "anonymize", reason: "isolated anonymization test" });
  current = storage.one("SELECT * FROM players WHERE id=?", p.id);
  assert.equal(arena.displayName(current), arena.anonymous); assert.equal(current.deleted, 1);
  assert.equal(arena.ownedAttempt(p.id, a.id).id, a.id);
  assert.equal(storage.one("SELECT COUNT(*) AS n FROM sessions WHERE principal=?", p.id).n, 0);
});

test("every actual admin API read and mutation rejects signed-out access without leaking data", async () => {
  jar.clear();
  const routes = load("../app/api/admin/[...path]/route.ts");
  for (const endpoint of ["players", "competitions", "leaderboards", "settings", "matches", "friends", "audit", "overview", "session"]) {
    const response = await routes.GET(new Request(`http://localhost:3000/api/admin/${endpoint}`), { params: Promise.resolve({ path: [endpoint] }) });
    assert.equal(response.status, 401, endpoint); assert.deepEqual(await response.json(), { error: "กรุณาเข้าสู่ระบบก่อน" });
  }
  const response = await routes.POST(new Request("http://localhost:3000/api/admin/moderate", { method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body: JSON.stringify({ action: "clear", id: "unknown" }) }), { params: Promise.resolve({ path: ["moderate"] }) });
  assert.equal(response.status, 401);
});
test("25 stage mappings freeze their exact scenario version and owner-only rules snapshot", () => {
  const { STAGE_IDS } = load("../tests/helpers/solver.mjs");
  assert.equal(STAGE_IDS.length, 25);
  for (let i = 0; i < STAGE_IDS.length; i++) {
    const p = arena.createPlayer(`FixtureLevel${i}`), a = arena.createAttempt(p.id, STAGE_IDS[i]);
    assert.equal(a.scenarioVersion, arena.scenarioVersion(STAGE_IDS[i]));
    assert.ok(storage.one("SELECT rules,seed FROM attempts WHERE id=?", a.id).rules);
  }
});
test("authorized admin search and versioned rules work; stale nickname preferences cannot resurrect a cleared name", async () => {
  storage.run("UPDATE admins SET rotate=0 WHERE id='fixture-owner'");
  await auth.issueSession("fixture-owner", "admin");
  const adminRoutes = load("../app/api/admin/[...path]/route.ts");
  const search = await adminRoutes.GET(new Request("http://localhost:3000/api/admin/players?q=FixtureSame&offset=0"), { params: Promise.resolve({ path: ["players"] }) });
  assert.equal(search.status, 200); assert.equal((await search.json()).players.length, 1);
  const before = storage.one("SELECT rules FROM attempts ORDER BY created LIMIT 1").rules;
  const update = await adminRoutes.POST(new Request("http://localhost:3000/api/admin/settings", { method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body: JSON.stringify({ time_attack: true, board: true, connector_ms: 5000, route_ms: 10000, hint_ms: 15000, failed_ms: 10000, reason: "isolated version bump" }) }), { params: Promise.resolve({ path: ["settings"] }) });
  assert.equal(update.status, 200); assert.equal(arena.settings().version, 2);
  assert.equal(storage.one("SELECT rules FROM attempts ORDER BY created LIMIT 1").rules, before);
  const cleared = storage.one("SELECT * FROM players WHERE name_locked=1 AND deleted=0 LIMIT 1");
  await auth.issueSession(cleared.id, "player");
  const arenaRoutes = load("../app/api/arena/[...path]/route.ts");
  const response = await arenaRoutes.POST(new Request("http://localhost:3000/api/arena/profile", { method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body: JSON.stringify({ name: "StaleLocalName", public: true, presence: false }) }), { params: Promise.resolve({ path: ["profile"] }) });
  assert.equal(response.status, 200); assert.equal((await response.json()).name, arena.anonymous);
  assert.equal(storage.one("SELECT name FROM players WHERE id=?", cleared.id).name, "");
});
