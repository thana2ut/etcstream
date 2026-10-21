import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { load, projectRoot, SCENARIOS, STAGE_IDS } from "./helpers/solver.mjs";

const { requiredBag, venueCandidateStock, checkMissionBag } = load("../game/content/mission-bag.ts");
const { CABLE_CATALOG, PHYSICAL_CABLE_CATALOG, packedLeadsFor } = load("../game/content/cable-catalog.ts");
const { buildAdminLoadout } = load("../game/content/admin-loadout.ts");

test("Phase 08: every mission offers the entire physical catalog without logical Replay", () => {
  assert.equal(STAGE_IDS.length, 25);
  assert.equal(PHYSICAL_CABLE_CATALOG.length, CABLE_CATALOG.length - 1);
  assert.ok(!PHYSICAL_CABLE_CATALOG.some((c) => c.id === "CTRL-REPLAY"));
  assert.ok(PHYSICAL_CABLE_CATALOG.some((c) => c.id === "ADAPTER-35-635"));
  assert.ok(PHYSICAL_CABLE_CATALOG.some((c) => c.id === "ADAPTER-635-35"));
  for (const id of STAGE_IDS) {
    const stock = venueCandidateStock(SCENARIOS[id]);
    assert.deepEqual(Object.keys(stock).sort(), PHYSICAL_CABLE_CATALOG.map((c) => c.id).sort(), id);
    assert.ok(Object.values(stock).every((n) => n >= 32), id);
  }
});

test("Phase 08: exact bags pass; missing, excess and distractor choices fail without mutating bags", () => {
  for (const id of STAGE_IDS) {
    const scenario = SCENARIOS[id];
    const need = requiredBag(scenario);
    const original = JSON.stringify(need);
    assert.deepEqual(checkMissionBag(scenario, need), { ok: true }, id);
    assert.ok(!Object.hasOwn(need, "CTRL-REPLAY"), id);
    const first = Object.keys(need)[0];
    if (first) {
      assert.equal(checkMissionBag(scenario, { ...need, [first]: need[first] - 1 }).ok, false, `${id}: missing`);
      assert.equal(checkMissionBag(scenario, { ...need, [first]: need[first] + 1 }).ok, false, `${id}: excess`);
    } else {
      assert.equal(checkMissionBag(scenario, {}).ok, true, `${id}: repaired prewiring needs no extra bag`);
    }
    const distractor = PHYSICAL_CABLE_CATALOG.find((c) => !Object.hasOwn(need, c.id));
    assert.ok(distractor, id);
    assert.deepEqual(checkMissionBag(scenario, { ...need, [distractor.id]: 1 }), { ok: false, problem: "wrong" }, id);
    assert.equal(JSON.stringify(need), original, `${id}: validation must not consume stock`);
    const admin = buildAdminLoadout(scenario);
    assert.equal(admin.ok, true, id);
    assert.deepEqual(admin.bag, need, id);
    assert.ok(!admin.leads.some((lead) => scenario.cables.find((c) => c.id === lead)?.ends[0] === "CONTROL"), id);
  }
});

test("Phase 08: Free Practice keeps its separate, non-strict preparation path", () => {
  for (const id of ["hdmi-basic", "studio-full"]) {
    assert.ok(!SCENARIOS[id].stage, id);
    assert.ok(packedLeadsFor(SCENARIOS[id], { "VID-HDMI-A-A": 2 }).length > 0, id);
  }
  const lobby = fs.readFileSync(path.join(projectRoot, "components/ui/cable-lobby.tsx"), "utf8");
  assert.match(lobby, /scenario\.stage\) return PHYSICAL_CABLE_CATALOG/);
  assert.match(lobby, /if \(mission\) \{[\s\S]*?checkMissionBag/);
  assert.doesNotMatch(lobby, /requiredBag\(/);
});
