import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { load, SCENARIOS, projectRoot, initialTrainingState } from "./helpers/solver.mjs";

const { inspectSubject, inspectIdForTarget, inspectCableKey } = load("../game/content/inspect-info.ts");
const { referenceEvidence } = load("../game/content/reference-evidence.ts");
const { stagingFootprint } = load("../game/training/venue-scenarios.ts");
const { LAYOUTS, onSurface } = load("../game/training/venue-layouts.ts");
const { socketSurfaces } = load("../game/rendering/socket-geometry.ts");
const { MODEL_GEOMETRY } = load("../game/training/sim/model-geometry.ts");
const { contentSignature } = load("../game/persistence/run-save.ts");
const records = JSON.parse(fs.readFileSync(path.join(projectRoot, "game/content/local-reference-evidence.json"), "utf8"));
const venues = Object.values(SCENARIOS).filter((s) => s.stage);

test("Phase 07: every active equipment profile, cable and adapter resolves to safe inspect data", () => {
  const profiles = new Set(); let cables = 0, adapters = 0;
  for (const scenario of Object.values(SCENARIOS)) {
    for (const device of scenario.devices) {
      const subject = inspectSubject(scenario, device.id);
      assert.equal(subject.kind, "device");
      for (const field of [subject.info.name, subject.info.model, subject.info.role, subject.info.summary, subject.evidence.classLabel, subject.evidence.note]) assert.ok(typeof field === "string" && field.length);
      assert.ok(subject.evidence.pack, `${scenario.id}/${device.id}: no reference pack`);
      profiles.add(subject.evidence.key);
      if (device.generic) assert.equal(subject.evidence.evidenceClass, "generic");
    }
    for (const cable of scenario.cables) {
      const subject = inspectSubject(scenario, inspectIdForTarget({ kind: "end", cableId: cable.id, end: "a" }));
      assert.equal(subject.kind, "cable"); assert.equal(subject.cable, cable); assert.ok(subject.catalog.name && subject.catalog.ends && subject.evidence.note);
      if (cable.socketB) { adapters++; assert.match(inspectCableKey(cable), /^ADAPTER-/); }
      cables++;
    }
    assert.doesNotThrow(() => inspectSubject(scenario, "not-a-device"));
    assert.doesNotThrow(() => inspectSubject(scenario, "@cable:not-a-cable"));
  }
  for (const id of ["switcher", "monitor"]) profiles.add(inspectSubject(SCENARIOS["studio-full"], id).evidence.key);
  assert.equal(profiles.size, 53); assert.ok(cables > 300 && adapters === 2);
});

test("Phase 07: exactness, owner choices and generic evidence remain independent of image readiness", () => {
  assert.equal(Object.keys(records).length, 81);
  assert.equal(Object.values(records).filter((r) => r.evidenceClass === "exact").length, 20);
  for (const key of ["comica-wm100-plus", "samsung-u8000f"]) {
    assert.equal(referenceEvidence(key).evidenceClass, "owner-selected");
    assert.equal(referenceEvidence(key).readiness, "PARTIAL_REFERENCE");
  }
  assert.equal(referenceEvidence("comica-wm300-owner-claim").evidenceClass, "archive-only");
  assert.equal(inspectSubject(SCENARIOS["studio-full"], "rx").evidence.key, "comica-wm100-plus");
  assert.match(inspectSubject(SCENARIOS["studio-full"], "mixer").info.model, /ยังไม่ยืนยันผู้ผลิต/);
  assert.equal(referenceEvidence("CTRL-REPLAY").evidenceClass, "logical");
});

test("Phase 07: cached physical socket geometry has finite normals/positions and a small material budget", () => {
  const kinds = new Set(["hdmi", "usba", "usbb", "usbc", "rj45", "iec", "xlr3f", "xlr3m", "xlr4", "xlr5", "trs", "jack35", "rca", "dc", "db9", "db25", "sfp", "sd", "mcx", "smpte", "bnc"]);
  for (const kind of kinds) {
    const surfaces = socketSurfaces(kind);
    assert.equal(socketSurfaces(kind), surfaces, `${kind}: geometry must be shared between instances`);
    assert.ok(surfaces.length >= 1 && surfaces.length <= 5, `${kind}: excessive material groups`);
    for (const { geometry } of surfaces) {
      assert.ok(geometry.attributes.position.count > 0);
      for (const name of ["position", "normal"]) assert.ok(Array.from(geometry.attributes[name].array).every(Number.isFinite), `${kind}: invalid ${name}`);
      geometry.computeBoundingBox(); assert.ok(geometry.boundingBox.min.z >= -0.00001);
    }
  }
});

test("Phase 07: all 25 tables fit the rotated full assembly footprint and keep each staged unit's slot stable", () => {
  const slots = new Map();
  for (const scenario of venues) {
    const top = LAYOUTS[scenario.layout].equipment;
    const staged = scenario.placeables.filter((p) => !p.installed && onSurface(top, p.start[0], p.start[2]));
    for (const item of staged) {
      const f = stagingFootprint(item.device);
      assert.ok(item.start[0] + f.minX >= top.center[0] - top.size[0] / 2 - 0.002 && item.start[0] + f.maxX <= top.center[0] + top.size[0] / 2 + 0.002, `${scenario.id}/${item.id}: full assembly exceeds table width`);
      assert.ok(item.start[2] + f.minZ >= top.center[2] - top.size[1] / 2 - 0.002 && item.start[2] + f.maxZ <= top.center[2] + top.size[1] / 2 + 0.002, `${scenario.id}/${item.id}: full assembly exceeds table depth`);
      const key = `${scenario.layout}:${item.id}`, at = item.start.join();
      if (slots.has(key)) assert.equal(at, slots.get(key), `${key}: preparation slot moved between levels`);
      slots.set(key, at);
    }
    // Visual fields, poses and plug styles do not belong to the compatibility signature.
    const visualCopy = { ...scenario, devices: scenario.devices.map((d) => ({ ...d, model: "visual-only metadata" })), cables: scenario.cables.map((c) => ({ ...c, plugs: ["hdmi", "hdmi"], start: [[1, 1, 1], [2, 2, 2]] })) };
    assert.equal(contentSignature(scenario), contentSignature(visualCopy));
    const state = initialTrainingState(scenario.id);
    assert.ok(!state.completed, `${scenario.id}: stock cannot auto-complete a mission`);
  }
  assert.ok(slots.size > 40);
  for (const id of ["aja-3g-ama", "magewell-usb-capture-sdi-gen2"]) assert.ok(MODEL_GEOMETRY[id].stagingBounds, `${id}: attached lead footprint missing`);
});

test("Phase 07: Samsung GLB carries the selected 85-inch SKU and physical dimensions", () => {
  const buf = fs.readFileSync(path.join(projectRoot, "public/models/equipment/samsung-u8000f.glb"));
  const glb = JSON.parse(buf.toString("utf8", 20, 20 + buf.readUInt32LE(12)));
  const body = glb.nodes.find((n) => n.name === "slim U8000F outer chassis");
  assert.equal(body.extras.game_target_sku, "UA85U8000FKXXT");
  assert.deepEqual(body.extras.real_dimensions_m, [1.8899, 1.0835, 0.077]);
  assert.ok(body.extras.reference_status.includes("PARTIAL_REFERENCE"));
});
