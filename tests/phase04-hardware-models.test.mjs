import { test } from "node:test";
import assert from "node:assert/strict";
import { load, SCENARIOS } from "./helpers/solver.mjs";

const { MODEL_GEOMETRY, TRIPOD_TOP } = load("../game/training/sim/model-geometry.ts");
const { MODELS } = load("../game/training/sim/equipment.ts");

const PHASE04 = [
  "bmd-atem-mini-pro", "bmd-atem-television-studio-hd8-iso", "bmd-atem-2me-constellation-4k", "bmd-videohub-20x20-12g", "bmd-streaming-encoder-hd",
  "bmd-hyperdeck-studio-hd-plus", "bmd-micro-converter-hdmi-sdi-3g", "bmd-micro-converter-sdi-hdmi-3g", "bmd-smartview-duo",
  "bmd-studio-camera-4k-plus-g2", "bmd-studio-camera-4k-pro-g2", "bmd-ursa-broadcast-g2", "bmd-camera-fiber-converter", "bmd-studio-fiber-converter",
];
const PHASE05 = ["aja-3g-ama", "magewell-usb-capture-sdi-gen2", "shure-sm58"];
const KIND_OF = { "USB-A": ["usba"], SDI: ["bnc"], HDMI: ["hdmi"], ETHERNET: ["rj45"], "USB-C": ["usbc"], XLR: ["xlr3f", "xlr3m"], "6.35mm": ["trs"], "3.5mm": ["jack35"], FIBER: ["smpte"] };

test("Phase 04/05: exactly the 14 + 3 verified models are modelled; generic hardware is not", () => {
  assert.deepEqual(Object.keys(MODEL_GEOMETRY).sort(), [...PHASE04, ...PHASE05].sort());
  for (const pending of ["generic-4ch-mixer", "generic-studio-switcher", "generic-sdi-usb-capture"]) assert.equal(MODEL_GEOMETRY[pending], undefined, pending);
});

test("Phase 04: every registry port has exactly one 3D socket of the right connector type, and nothing extra is connectable", () => {
  for (const id of PHASE04) {
    const geo = MODEL_GEOMETRY[id], model = MODELS[id];
    assert.deepEqual(Object.keys(geo.ports).sort(), model.ports.map((p) => p.key).sort(), `${id} port set`);
    for (const p of model.ports) {
      const kind = geo.ports[p.key].kind;
      if (kind) assert.ok((KIND_OF[p.connector] ?? []).includes(kind), `${id}:${p.key} ${p.connector} drawn as ${kind}`);
    }
    // Sockets sit on (or within 25 mm of) the real body's bounding box, and no two sockets share a position.
    const [w, h, d] = geo.size;
    const all = [...Object.values(geo.ports).map((p) => p.at), ...geo.inert.map((p) => p.at)];
    for (const [x, y, z] of all) assert.ok(Math.abs(x) <= w / 2 + 0.025 && y >= -0.001 && y <= h + 0.025 && Math.abs(z) <= d / 2 + 0.025, `${id} socket inside body bounds`);
    const keys = all.map((a) => a.map((v) => v.toFixed(4)).join(","));
    assert.equal(new Set(keys).size, keys.length, `${id} overlapping sockets`);
    assert.ok(geo.displayScale >= 1 && geo.displayScale <= 2.5, `${id} display scale`);
    assert.ok(geo.source.every((u) => u.startsWith("https://images.blackmagicdesign.com/")), `${id} official sources`);
  }
});

test("Phase 04: HyperDeck keeps SDI OUT A/B, LOOP and MONITOR distinct and has one SDI + one HDMI record input (no ISO)", () => {
  const geo = MODEL_GEOMETRY["bmd-hyperdeck-studio-hd-plus"];
  const outs = ["sdi-out", "sdi-out-2", "sdi-loop", "sdi-mon"].map((k) => geo.ports[k].at.join(","));
  assert.equal(new Set(outs).size, 4);
  assert.deepEqual(MODELS["bmd-hyperdeck-studio-hd-plus"].ports.filter((p) => p.dir === "INPUT").map((p) => p.connector).sort(), ["HDMI", "SDI"]);
});

test("Phase 04: Micro Converters are direction-specific and the Plus/Pro G2 cameras keep their own connector sets", () => {
  assert.ok(MODEL_GEOMETRY["bmd-micro-converter-hdmi-sdi-3g"].ports["hdmi-in"] && !MODEL_GEOMETRY["bmd-micro-converter-hdmi-sdi-3g"].ports["hdmi-out"]);
  assert.ok(MODEL_GEOMETRY["bmd-micro-converter-sdi-hdmi-3g"].ports["hdmi-out"] && !MODEL_GEOMETRY["bmd-micro-converter-sdi-hdmi-3g"].ports["hdmi-in"]);
  assert.ok(MODEL_GEOMETRY["bmd-studio-camera-4k-plus-g2"].ports["mic-35"] && !MODEL_GEOMETRY["bmd-studio-camera-4k-pro-g2"].ports["mic-35"]);
  assert.ok(MODEL_GEOMETRY["bmd-studio-camera-4k-pro-g2"].inert.some((p) => p.kind === "xlr3f"), "Pro G2 shows its XLR inputs (not connectable)");
  assert.ok(!MODEL_GEOMETRY["bmd-studio-camera-4k-plus-g2"].inert.some((p) => p.kind === "xlr3f"), "Plus G2 has no XLR inputs");
  const sv = MODEL_GEOMETRY["bmd-smartview-duo"];
  assert.deepEqual(sv.parts.filter((p) => p.t === "screen").map((p) => p.feed), ["in:sdi-in", "in:sdi-in-b"], "two independent screens");
});

test("Phase 04: venue ports sit on the modelled sockets (scale, tripod and rack offsets applied) with non-overlapping hit spheres", () => {
  let checked = 0;
  for (const scenario of Object.values(SCENARIOS)) {
    for (const d of scenario.devices) {
      const geo = d.modelId && MODEL_GEOMETRY[d.modelId];
      if (!geo) continue;
      const k = geo.displayScale, o = d.mount?.offset ?? [0, 0, 0], yaw = d.yaw ?? 0;
      if (!geo.mount && d.mount?.kind !== "rack") assert.ok(d.size.every((v, i) => Math.abs(v - geo.size[i] * k) < 0.001), `${scenario.id}/${d.id} collision size = real × scale`);
      if (geo.mount === "tripod") assert.equal(o[1], TRIPOD_TOP);
      const own = Object.entries(scenario.ports).filter(([, p]) => p.device === d.id);
      for (const [pid, p] of own) {
        const g = geo.ports[pid.slice(d.id.length + 1)];
        const lx = o[0] + g.at[0] * k + g.normal[0] * 0.006, ly = o[1] + g.at[1] * k + g.normal[1] * 0.006, lz = o[2] + g.at[2] * k + g.normal[2] * 0.006;
        const ex = d.position[0] + lx * Math.cos(yaw) + lz * Math.sin(yaw), ez = d.position[2] - lx * Math.sin(yaw) + lz * Math.cos(yaw);
        assert.ok(Math.hypot(p.position[0] - ex, p.position[1] - (d.position[1] + ly), p.position[2] - ez) < 0.002, `${scenario.id}/${pid} on its socket`);
        checked++;
      }
      for (let i = 0; i < own.length; i++) for (let j = i + 1; j < own.length; j++) {
        const [, a] = own[i], [, b] = own[j];
        assert.ok(Math.hypot(a.position[0] - b.position[0], a.position[1] - b.position[1], a.position[2] - b.position[2]) >= (a.radius + b.radius) * 0.99, `${scenario.id} ${own[i][0]} / ${own[j][0]} hit spheres overlap`);
      }
    }
  }
  assert.ok(checked > 300, `checked ${checked} modelled ports`);
});

test("Phase 04.2: every physical button drives a real registry control with a valid value", () => {
  for (const [id, geo] of Object.entries(MODEL_GEOMETRY)) for (const part of geo.parts ?? []) {
    if (part.t !== "key" || !part.press) continue;
    const c = MODELS[id].controls.find((x) => x.key === part.press.key);
    assert.ok(c, `${id}: ${part.press.key} is not a control`);
    const v = part.press.value;
    if (v === "toggle") assert.equal(c.kind, "toggle", `${id}: ${c.key} toggle`);
    else if (v === "cycle") assert.equal(c.kind, "select", `${id}: ${c.key} cycle`);
    else if (typeof v === "boolean") assert.equal(c.kind, "toggle", `${id}: ${c.key} boolean`);
    else assert.ok(c.options.includes(v), `${id}: ${c.key} has no option ${v}`);
  }
});

test("Phase 04.2: pressing an on-device button is the same state change as the Operator Console", async () => {
  const { solve, setControl, simContext } = await import("./helpers/solver.mjs");
  const { interactWithTarget } = load("../game/training/hdmi-training.ts");
  const s = solve("l-5", { stopAt: "signal" });
  const viaButton = interactWithTarget(s, { kind: "control", deviceId: "enc", key: "stream", value: true, label: "ON AIR" });
  const viaConsole = setControl(s, "enc", "stream", true);
  assert.deepEqual(viaButton.sim.config.enc, viaConsole.sim.config.enc);
  assert.equal(simContext(viaButton).view.wan.live, simContext(viaConsole).view.wan.live);
  const m5 = solve("m-5", { stopAt: "signal" });
  const cycled = interactWithTarget(m5, { kind: "control", deviceId: "rec", key: "rec-input", value: "cycle", label: "INPUT" });
  assert.equal(cycled.sim.config.rec["rec-input"], "HDMI", "INPUT cycles SDI → HDMI");
});

test("Phase 05: AJA / Magewell SDI / SM58 sockets match the registry and real connector families", () => {
  for (const id of PHASE05) {
    const geo = MODEL_GEOMETRY[id], model = MODELS[id];
    assert.deepEqual(Object.keys(geo.ports).sort(), model.ports.map((p) => p.key).sort(), `${id} port set`);
    for (const p of model.ports) assert.ok((KIND_OF[p.connector] ?? []).includes(geo.ports[p.key].kind), `${id}:${p.key}`);
    const [w, h, d] = geo.size;
    for (const p of Object.values(geo.ports)) {
      const [x, y, z] = p.at, slack = p.lead ? 0.2 : 0.025;   // attached leads reach ≤ 20 cm from the chassis
      assert.ok(Math.abs(x) <= w / 2 + slack && y >= -0.001 && y <= h + slack && Math.abs(z) <= d / 2 + slack, `${id} socket bounds`);
    }
    assert.ok(geo.displayScale >= 1 && geo.displayScale <= 2.5);
  }
  // Magewell body jack is MCX (inert) — the BNC the player uses is on the bundled ACC00050 pigtail; USB is Type-A female.
  const mw = MODEL_GEOMETRY["magewell-usb-capture-sdi-gen2"];
  assert.equal(mw.inert.find((p) => p.kind === "mcx")?.name, "SDI IN (MCX, body)");
  assert.equal(mw.ports["sdi-in"].lead, true);
  assert.equal(mw.ports.usb.kind, "usba");
  // AJA audio arrives on breakout XLR F inputs A/B, never on a chassis XLR; the chassis carries one DB-25.
  const aja = MODEL_GEOMETRY["aja-3g-ama"];
  assert.ok(aja.ports["audio-l"].lead && aja.ports["audio-r"].lead);
  assert.equal(aja.inert.filter((p) => p.kind === "db25").length, 1);
  assert.equal(MODEL_GEOMETRY["shure-sm58"].ports["xlr-out"].kind, "xlr3m");
});
