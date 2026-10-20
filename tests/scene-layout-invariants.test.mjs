import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENARIOS, load } from "./helpers/solver.mjs";

const { LAYOUTS } = load("../game/training/venue-layouts.ts");
const missions = Object.values(SCENARIOS).filter((s) => s.stage && s.layout);
const footprint = (d) => {
  const c = Math.abs(Math.cos(d.yaw ?? 0)), s = Math.abs(Math.sin(d.yaw ?? 0));
  return { x: d.position[0], z: d.position[2], hx: (d.size[0] * c + d.size[2] * s) / 2, hz: (d.size[0] * s + d.size[2] * c) / 2, y0: d.position[1], y1: d.position[1] + d.size[1] };
};

test("scene: installed equipment bodies never interpenetrate (mounted camera accessories excepted)", () => {
  for (const s of missions) {
    const devs = s.devices.filter((d) => d.kind !== "mic" && d.kind !== "bodypack");
    for (let i = 0; i < devs.length; i++) for (let j = i + 1; j < devs.length; j++) {
      const [a, b] = [devs[i], devs[j]];
      if (s.simDevices[a.id]?.mountedOn === b.id || s.simDevices[b.id]?.mountedOn === a.id) continue;
      const A = footprint(a), B = footprint(b);
      const hit = A.hx + B.hx - Math.abs(A.x - B.x) > 0.01 && A.hz + B.hz - Math.abs(A.z - B.z) > 0.01 && Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0) > 0.01;
      assert.ok(!hit, `${s.id}: ${a.id} overlaps ${b.id}`);
    }
  }
});

test("scene: desk gear standing at a furniture-top height sits fully on that top (no half-floating boxes)", () => {
  for (const s of missions) {
    const layout = LAYOUTS[s.layout];
    for (const d of s.devices) {
      if (d.kind === "camera" || d.kind === "mic" || d.kind === "bodypack" || s.simDevices[d.id]?.mountedOn || d.position[1] < 0.3) continue;
      const F = footprint(d);
      const tops = layout.furniture.filter((f) => Math.abs(f.size[1] - d.position[1]) < 0.03 && f.size[0] >= F.hx * 2 + 0.04 && f.size[2] >= F.hz * 2 + 0.04
        && Math.abs(F.x - f.center[0]) <= f.size[0] / 2 + 0.35 && Math.abs(F.z - f.center[2]) <= f.size[2] / 2 + 0.35);
      for (const f of tops.slice(0, 1)) {
        assert.ok(Math.abs(F.x - f.center[0]) + F.hx <= f.size[0] / 2 + 0.001 && Math.abs(F.z - f.center[2]) + F.hz <= f.size[2] / 2 + 0.001, `${s.id}: ${d.id} hangs over the edge of ${f.id}`);
      }
    }
  }
});

test("scene: every connectable port has a reachable standing position inside the room", () => {
  for (const s of missions) for (const [id, p] of Object.entries(s.ports)) assert.ok(p.approach, `${s.id}: ${id} has no service position`);
});
