import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENARIOS, load } from "./helpers/solver.mjs";

const { STAGES } = load("../game/training/sim/stages.ts");
const { LAYOUTS } = load("../game/training/venue-layouts.ts");
const { stagingFootprint } = load("../game/training/venue-scenarios.ts");
const { contentSignature } = load("../game/persistence/run-save.ts");
const venues = Object.values(SCENARIOS).filter((s) => s.venueScale);
const SCALES = ["xs", "s", "m", "l", "xl"];

test("A · each venue room holds the union of its five levels' units, every level, with stable placement", () => {
  for (const scale of SCALES) {
    const union = [...new Set(STAGES.filter((x) => x.room === scale).flatMap((x) => x.devices))].sort();
    const levels = venues.filter((s) => s.venueScale === scale);
    assert.equal(levels.length, 5, scale);
    for (const s of levels) {
      assert.deepEqual(s.devices.map((d) => d.id).sort(), union, `${s.id} roster`);
      assert.equal(new Set(s.devices.map((d) => d.id)).size, s.devices.length, `${s.id} duplicate unit`);
      for (const d of s.devices) assert.equal(Boolean(d.stockOnly), !s.stage.devices.includes(d.id), `${s.id}:${d.id} stock flag`);
      for (const d of s.devices) assert.ok(s.simDevices[d.id]?.model, `${s.id}:${d.id} unknown canonical profile`);
    }
    // Fixed (non-carried) stock keeps the same station in every level of the venue.
    for (const id of union) {
      const spots = levels.map((s) => s.devices.find((d) => d.id === id)).filter((d) => d && !levels[0].placeables.some((p) => p.id === d.id)).map((d) => d.position.join(","));
      assert.ok(new Set(spots).size <= 1, `${scale}:${id} moves between levels`);
    }
  }
});

test("B · carried stock starts on the venue preparation table, inside its top, without overlapping", () => {
  for (const s of venues) {
    const top = LAYOUTS[s.layout].equipment, [w, d] = top.size ?? [1.4, 1.4];
    const stock = s.placeables.filter((p) => p.stockOnly);
    for (const p of stock) {
      assert.ok(Math.abs(p.start[0] - top.center[0]) <= w / 2 + 0.01 && Math.abs(p.start[2] - top.center[2]) <= d / 2 + 0.01, `${s.id}:${p.id} off the prep table`);
      assert.ok(Math.abs(p.start[1] - top.center[1]) < 0.02, `${s.id}:${p.id} floating/sunk on prep table`);
      assert.ok(!p.installed, `${s.id}:${p.id} stock must not count as installed`);
    }
    const onTable = s.placeables.filter((p) => !p.installed && Math.abs(p.start[1] - top.center[1]) < 0.02);
    for (let i = 0; i < onTable.length; i++) for (let j = i + 1; j < onTable.length; j++) {
      const a = onTable[i], b = onTable[j], da = stagingFootprint(a.device), db = stagingFootprint(b.device);
      const apart = a.start[0] + da.maxX <= b.start[0] + db.minX + 0.005 || b.start[0] + db.maxX <= a.start[0] + da.minX + 0.005
        || a.start[2] + da.maxZ <= b.start[2] + db.minZ + 0.005 || b.start[2] + db.maxZ <= a.start[2] + da.minZ + 0.005;
      assert.ok(apart, `${s.id}: ${a.id} overlaps ${b.id} on the prep table`);
    }
  }
});

test("D · stock units never join the objective: not in canonical routes, requirements or pre-wiring", () => {
  for (const s of venues) {
    const stock = new Set(s.devices.filter((d) => d.stockOnly).map((d) => d.id));
    const dev = (p) => s.ports[p].device;
    for (const r of s.canonical) assert.ok(!stock.has(dev(r.from)) && !stock.has(dev(r.to)), `${s.id} canonical uses stock`);
    for (const c of s.initialConnections) assert.ok(!stock.has(dev(c.from)) && !stock.has(dev(c.to)), `${s.id} prewired stock`);
    for (const r of s.requirements) for (const p of [...r.from, ...r.to]) assert.ok(!stock.has(dev(p)), `${s.id} requirement uses stock`);
  }
});

test("E · save signature ignores venue stock, so saves made before staging stay loadable", () => {
  for (const s of venues) {
    const bare = { ...s, devices: s.devices.filter((d) => !d.stockOnly), placeables: s.placeables.filter((p) => !p.stockOnly),
      ports: Object.fromEntries(Object.entries(s.ports).filter(([, p]) => !s.devices.find((d) => d.id === p.device)?.stockOnly)) };
    assert.equal(contentSignature(s), contentSignature(bare), s.id);
  }
});
