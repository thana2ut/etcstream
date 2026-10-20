import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENARIOS, STAGE_IDS, T, load, solve, act } from "./helpers/solver.mjs";

// Supplementary source/runtime checks only. These are NOT Chrome playthroughs.
const { missionDesignIssues } = load("../game/training/mission-completeness.ts");
const { hiddenCablesFor, packedLeadsFor } = load("../game/content/cable-catalog.ts");
const { LAYOUTS } = load("../game/training/venue-layouts.ts");

test("all 25 active missions own complete physical devices, unique cables and compatible endpoints", () => {
  assert.equal(STAGE_IDS.length, 25);
  for (const id of STAGE_IDS) {
    const scenario = SCENARIOS[id];
    assert.deepEqual(missionDesignIssues(scenario), [], id);
    for (const device of scenario.stage.devices) assert.ok(scenario.devices.some((d) => d.id === device), `${id}: missing ${device}`);
  }
});

test("all mission stock remains in the room with an empty bag, without creating extra leads", () => {
  for (const id of STAGE_IDS) {
    const scenario = SCENARIOS[id];
    assert.deepEqual(hiddenCablesFor(scenario, {}), [], id);
    assert.deepEqual(packedLeadsFor(scenario, {}), [], id);
    const state = T.initialTrainingState(id);
    assert.deepEqual(Object.keys(state.cables).sort(), scenario.cables.map((c) => c.id).sort(), id);
    const packed = packedLeadsFor(scenario, { "VID-HDMI-A-A": 999, "unknown-cable": 999 });
    assert.equal(new Set(packed).size, packed.length, id);
    assert.ok(packed.every((lead) => scenario.cables.some((c) => c.id === lead)), id);
  }
});

test("small mission kits are centred on the open top shelf rather than hidden below it", () => {
  for (const id of ["s-1", "xs-1"]) {
    const scenario = SCENARIOS[id];
    const shelf = LAYOUTS[scenario.layout].cables;
    for (const lead of scenario.cables) {
      assert.ok(Math.abs(lead.start[0][1] - shelf.center[1] - 0.06) < 0.001, `${id}: ${lead.id}`);
      assert.ok(Math.hypot(lead.start[0][0] - shelf.center[0], lead.start[0][2] - shelf.center[2]) < 0.5, `${id}: centred stock`);
    }
  }
});

test("critical unplug invalidates current signoff and every live test; repairing alone cannot recertify", () => {
  const approved = solve("s-1");
  assert.equal(approved.completed, true);
  const broken = act(approved, { kind: "port", portId: "cam1:hdmi-out" });
  assert.equal(broken.completed, false);
  assert.equal(Boolean(broken.sim.signedOff), false);
  assert.ok(Object.values(broken.sim.testsPassed).every((passed) => !passed));
  assert.equal(T.simContext(broken).inp["sw:hdmi-in-1"], undefined);
  const repaired = act(broken, { kind: "port", portId: "cam1:hdmi-out" });
  assert.equal(repaired.completed, false);
  assert.ok(T.simContext(repaired).inp["sw:hdmi-in-1"]);
  const refused = T.signOff(repaired);
  assert.equal(refused.completed, false);
  assert.match(refused.notice.detail, /ทดสอบ/);
  assert.equal(Object.keys(repaired.cables).length, Object.keys(approved.cables).length);
});

test("reconciled outdoor control gear and stadium monitor have a physical supporting worktop", () => {
  for (const [scale, layoutId, ids] of [["l", "outdoor", ["mix", "sw", "monitor", "embed", "enc", "net"]], ["xl", "stadium", ["monitor"]]]) {
    for (let level = 1; level <= 5; level++) {
      const scenario = SCENARIOS[`${scale}-${level}`];
      for (const id of ids) {
        const d = scenario.devices.find((device) => device.id === id);
        if (!d) continue;
        const support = LAYOUTS[layoutId].furniture.some((f) => Math.abs(d.position[1] - f.size[1]) < 0.001
          && Math.abs(d.position[0] - f.center[0]) + d.size[0] / 2 <= f.size[0] / 2
          && Math.abs(d.position[2] - f.center[2]) + d.size[2] / 2 <= f.size[2] / 2);
        assert.ok(support, `${scenario.id}: ${id} needs a worktop`);
      }
    }
  }
});
