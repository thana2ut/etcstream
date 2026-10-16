import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { SCENARIOS, load, projectRoot, initialTrainingState, act, dropHeldEnd, placeHeldOnCenterTable, setControl, simContext, setUp, attach, solve as solveStage } from "./helpers/solver.mjs";

const { plugFits } = load("../game/training/hdmi-training.ts");
const venues = Object.values(SCENARIOS).filter(s => s.venueScale);
/** Fully wired + configured stage (signal test passed), the state used by the physical/monitoring checks below. */
const solve = (scenario) => solveStage(scenario.id, { stopAt: "signal" });
test("catalog has exactly 25 venue scenarios", () => assert.equal(venues.length, 25));
test("classroom production gear fits its real teaching desk and starter HDMI stays local", () => {
  const { LAYOUTS, onSurface } = load("../game/training/venue-layouts.ts");
  const layout = LAYOUTS.classroom;
  for (const id of ["sw", "mix", "rx", "pc", "slides", "tx1", "lav1"]) {
    const spot = layout.places[id].p;
    assert.ok(onSurface(layout.work, spot[0], spot[2]), `${id} must rest on the teaching worktop`);
    assert.equal(spot[1], layout.work.center[1]);
  }
  assert.ok(Math.hypot(layout.places.cam1.p[0] - layout.places.sw.p[0], layout.places.cam1.p[2] - layout.places.sw.p[2]) < 6);
  const left = layout.furniture.find((f) => f.id === "xs-student-0-l");
  const right = layout.furniture.find((f) => f.id === "xs-student-0-r");
  assert.ok(right.center[0] - right.size[0] / 2 - (left.center[0] + left.size[0] / 2) >= 1.2);
});

test("inspection bookmarks cover all five canonical scenes and follow equipment in storage", () => {
  const { environmentViews } = load("../game/training/environment-review.ts");
  for (const prefix of ["xs", "s", "m", "l", "xl"]) {
    const scenario = SCENARIOS[`${prefix}-5`];
    const state = initialTrainingState(scenario.id);
    const views = environmentViews(scenario, state.items);
    assert.equal(new Set(views.map((v) => v.id)).size, views.length);
    for (const device of scenario.devices) {
      for (const side of ["front", "back"]) assert.ok(views.some((v) => v.id === `I-${device.id}-${side}`));
    }
    for (const view of views) assert.ok([...view.eye, ...view.target].every(Number.isFinite));
    const stored = scenario.placeables[0];
    const shot = views.find((v) => v.id === `I-${stored.id}-front`);
    assert.equal(shot.target[0], state.items[stored.id].position[0]);
    assert.equal(shot.target[2], state.items[stored.id].position[2]);
  }
});

test("classroom long patched leads descend to the floor and retain their exact socket endpoints", () => {
  const { classroomCableRoute } = load("../game/training/cable-route.ts");
  const scenario = SCENARIOS["xs-5"];
  const patches = scenario.canonical.filter((p) => ["sw:hdmi-in-1", "monitor:hdmi-in-1"].includes(p.to));
  assert.equal(patches.length, 2);
  for (const patch of patches) {
    const a = scenario.ports[patch.from].position, b = scenario.ports[patch.to].position;
    const route = classroomCableRoute(a, b);
    assert.equal(route.length, 10);
    assert.deepEqual(route[0], a);
    assert.deepEqual(route.at(-1), b);
    assert.ok(route.some((p) => p[1] === 0.025));
    assert.ok(route.every((p) => p.every(Number.isFinite) && p[1] >= 0.025));
  }
});

test("classroom laptop faces its teacher seat and the camera frames the teacher", () => {
  const { LAYOUTS } = load("../game/training/venue-layouts.ts");
  const layout = LAYOUTS.classroom, desk = layout.furniture.find((f) => f.id === "xs-teacher");
  const teacher = [0.1, desk.center[2] - 1.05];
  for (const level of [1, 2, 3, 4, 5]) {
    const scenario = SCENARIOS[`xs-${level}`];
    const laptop = scenario.devices.find((d) => d.id === "slides");
    if (!laptop) continue;
    const dx = teacher[0] - laptop.position[0], dz = teacher[1] - laptop.position[2];
    assert.ok((Math.sin(laptop.yaw) * dx + Math.cos(laptop.yaw) * dz) / Math.hypot(dx, dz) > 0.98, "screen front must face the teacher");
    const port = scenario.ports["slides:hdmi-out"];
    assert.ok(port.position[0] > laptop.position[0], "HDMI follows the rotated laptop side");
    const camera = scenario.devices.find((d) => d.id === "cam1");
    if (camera) {
      assert.deepEqual(camera.position, layout.places.cam1.p);
      const cx = teacher[0] - camera.position[0], cz = teacher[1] - camera.position[2];
      assert.ok((-Math.sin(camera.yaw) * cx - Math.cos(camera.yaw) * cz) / Math.hypot(cx, cz) > 0.99);
    }
  }
});

test("classroom stored bodies do not overlap along the cabinet and student chairs have blockers", () => {
  const { LAYOUTS, layoutObstacles } = load("../game/training/venue-layouts.ts");
  const scenario = SCENARIOS["xs-5"];
  for (let i = 0; i < scenario.placeables.length; i++) for (let j = i + 1; j < scenario.placeables.length; j++) {
    const a = scenario.placeables[i], b = scenario.placeables[j];
    assert.ok(Math.abs(a.start[2] - b.start[2]) >= (a.device.size[2] + b.device.size[2]) / 2, `${a.id} overlaps ${b.id}`);
  }
  const obstacles = layoutObstacles(LAYOUTS.classroom);
  const chair = LAYOUTS.classroom.furniture.find((f) => f.kind === "studentDesk");
  assert.ok(obstacles.some((o) => o.half[0] === 0.22 && o.center[2] === chair.center[2] + chair.size[2] / 2 + 0.32));
});

test("classroom screen goes dark when its selected source is unplugged even with another source connected", () => {
  const { venueScreenFeed, venueScreenLive } = load("../game/training/monitor-feed.ts");
  assert.ok(!venueScreenLive(setUp("xs-5"), "monitor"));
  let state = solve(SCENARIOS["xs-5"]);
  state = setControl(state, "sw", "pgm", "HDMI 1");
  assert.ok(venueScreenLive(state, "monitor"));
  assert.match(venueScreenFeed(state, "monitor"), /TEACHER CAM/);
  state = act(state, { kind: "port", portId: "cam1:hdmi-out" });
  assert.ok(!venueScreenLive(state, "monitor"), "Program input gone: the projector shows black although slides are still connected");
});

test("studio monitors reflect partial patching, selected camera, audio and stream readiness", () => {
  const { studioSignalFeed, venueScreenLive } = load("../game/training/monitor-feed.ts");
  let state = setUp("s-5");
  assert.match(studioSignalFeed(state, "program"), /NO PROGRAM/);
  assert.match(studioSignalFeed(state, "recording"), /NOT READY/);
  assert.ok(!venueScreenLive(state, "monitor"));
  state = solve(SCENARIOS["s-5"]);
  assert.match(studioSignalFeed(state, "inputs"), /CAM1: READY\nCAM2: READY\nCAM3: READY/);
  state = setControl(state, "sw", "pgm", "HDMI 3");
  assert.match(studioSignalFeed(state, "program"), /CAM3/);
  assert.match(studioSignalFeed(state, "audio"), /HOST VOICE/);
  assert.match(studioSignalFeed(state, "recording"), /OBS ● CAM3 .* · AUDIO/);
  assert.ok(venueScreenLive(state, "monitor"));
  state = act(state, { kind: "port", portId: "cam3:hdmi-out" });
  assert.match(studioSignalFeed(state, "program"), /NO PROGRAM/);
  assert.match(studioSignalFeed(state, "inputs"), /CAM3: NO INPUT/);
});

test("studio cameras cover the interview set from three distinct angles and stored bodies fit their return desk", () => {
  const { LAYOUTS, STUDIO_MISSION_SETS, onSurface } = load("../game/training/venue-layouts.ts");
  const layout = LAYOUTS.studioMission;
  const scenario = SCENARIOS["s-5"];
  const target = STUDIO_MISSION_SETS.interview;
  const yaws = [];
  for (const id of ["cam1", "cam2", "cam3"]) {
    const d = scenario.devices.find((x) => x.id === id);
    const dx = target[0] - d.position[0], dz = target[2] - d.position[2], distance = Math.hypot(dx, dz);
    assert.ok((-Math.sin(d.yaw) * dx - Math.cos(d.yaw) * dz) / distance > 0.95, `${id} must face the interview set`);
    yaws.push(d.yaw);
  }
  assert.equal(new Set(yaws.map((y) => y.toFixed(2))).size, 3, "non-identical camera angles");
  const items = scenario.placeables;
  for (const item of items) assert.ok(onSurface(layout.equipment, item.start[0], item.start[2]));
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j];
    const apart = Math.abs(a.start[0] - b.start[0]) >= (a.device.size[0] + b.device.size[0]) / 2 || Math.abs(a.start[2] - b.start[2]) >= (a.device.size[2] + b.device.size[2]) / 2;
    assert.ok(apart, `${a.id} overlaps ${b.id}`);
  }
});

test("studio camera marks, active cameras and microphone stands share operating positions", () => {
  const { LAYOUTS } = load("../game/training/venue-layouts.ts");
  const layout = LAYOUTS.studioMission;
  for (const level of [1, 2, 3, 4, 5]) {
    const scenario = SCENARIOS[`s-${level}`];
    for (const id of ["cam1", "cam2", "cam3"]) {
      const device = scenario.devices.find((d) => d.id === id);
      if (!device) continue;
      assert.deepEqual(device.position, layout.places[id].p, `${scenario.id}: ${id} drifts from its mark/stand`);
      assert.equal(device.yaw, layout.places[id].yaw);
    }
  }
  const cameras = ["cam1", "cam2", "cam3"].map((id) => layout.places[id].p);
  for (let i = 0; i < cameras.length; i++) for (let j = i + 1; j < cameras.length; j++) {
    assert.ok(Math.hypot(cameras[i][0] - cameras[j][0], cameras[i][2] - cameras[j][2]) > 1.3, "tripods need separate footprints and operator clearance");
  }
  for (const id of ["micH", "micG"]) assert.equal(layout.places[id].p[1], 1.05, "microphone must sit on its stand, not on the floor");
  const cabinet = layout.furniture.find((f) => f.id === "sm-storage");
  assert.ok(cabinet.center[2] - cabinet.size[2] / 2 >= 4.4, "storage stays behind the interview set");
});

for (const scenario of venues) {
  test(`${scenario.id}: typed graph is consistent, carrying/dropping is repeatable and foreign targets never mutate state`, () => {
    const deviceIds = new Set(scenario.devices.map(d => d.id));
    assert.equal(deviceIds.size, scenario.devices.length);
    for (const p of Object.values(scenario.ports)) assert.ok(deviceIds.has(p.device));
    for (const link of scenario.canonical) {
      const c = scenario.cables.find(c => c.id === link.cableId);
      const from = scenario.ports[link.from], to = scenario.ports[link.to];
      assert.ok(c && from && to, `${scenario.id}: ${link.from} -> ${link.to}`);
      assert.ok(plugFits(c.ends[0], from) && plugFits(c.ends[1], to), `${scenario.id}: ${c.label} does not fit ${link.from} -> ${link.to}`);
      assert.equal(from.direction, "OUTPUT"); assert.equal(to.direction, "INPUT");
    }
    let prepared = initialTrainingState(scenario.id);
    for (const item of scenario.placeables) for (let attempt = 0; attempt < 2; attempt++) {
      prepared = act(prepared, { kind: "item", itemId: item.id });
      assert.equal(prepared.heldItem, item.id);
      prepared = placeHeldOnCenterTable(prepared, item.zone);
      assert.equal(prepared.heldItem, null);
    }
    const free = scenario.cables.find((c) => !Object.values(prepared.cables[c.id]).some((e) => e.portId)) ?? scenario.cables[0];
    if (Object.values(prepared.cables[free.id]).some((e) => e.portId)) { prepared = act(prepared, { kind: "end", cableId: free.id, end: "a" }); prepared = dropHeldEnd(prepared, [0, 0.81, 0]); prepared = act(prepared, { kind: "end", cableId: free.id, end: "b" }); prepared = dropHeldEnd(prepared, [0, 0.81, 0]); }
    for (let attempt = 0; attempt < 2; attempt++) {
      prepared = act(prepared, { kind: "end", cableId: free.id, end: "a" });
      assert.equal(prepared.held.cableId, free.id);
      prepared = dropHeldEnd(prepared, [0, 0.81, 0]);
      assert.equal(prepared.held, null);
    }
    let state = act(prepared, { kind: "end", cableId: free.id, end: "b" });
    const before = structuredClone(state);
    state = act(state, { kind: "port", portId: "foreign-scenario:missing" });
    assert.deepEqual(state.cables, before.cables); assert.deepEqual(state.held, before.held);
    state = act(state, { kind: "end", cableId: "foreign-cable", end: "a" });
    assert.deepEqual(state.cables, before.cables);
  });
}
test("equipment coverage: every non-decoy device takes part in the documented graph", () => {
  for (const s of venues) {
    const used = new Set(s.canonical.flatMap((r) => [r.from, r.to]).map((p) => s.ports[p].device));
    for (const d of s.devices) assert.ok(used.has(d.id) || (s.stage.decoys ?? []).includes(d.id), `${s.id} orphan ${d.id}`);
  }
});
test("cable coverage: every lead is a documented patch or a listed spare/decoy, with a length tag", () => {
  for (const s of venues) for (const c of s.cables) {
    assert.equal(c.ends.length, 2);
    assert.ok(s.canonical.some((r) => r.cableId === c.id) || (s.stage.extraCables ?? []).some((x) => x.id === c.id), `${s.id}: ${c.id}`);
    assert.ok(s.cableMeta[c.id].lengthM > 0, `${s.id}: ${c.id} has no length tag`);
  }
});
test("wrong direction, connector, signal class, occupied and loop never mutate the held cable", () => {
  const s = SCENARIOS["xs-5"];
  const lead = (to) => s.canonical.find((r) => r.to === to).cableId;
  function rejected(from, to, cableId) {
    let state = setUp(s.id);
    if (from) state = attach(state, cableId, "a", from);
    state = act(state, { kind: "end", cableId, end: from ? "b" : "a" });
    const before = structuredClone(state);
    state = act(state, { kind: "port", portId: to });
    assert.deepEqual(state.cables, before.cables, `${from} -> ${to}`);
    assert.deepEqual(state.held, before.held);
    assert.equal(state.notice.tone, "error");
  }
  rejected("cam1:hdmi-out", "sw:hdmi-pgm-out", lead("sw:hdmi-in-1")); // output -> output
  rejected("sw:hdmi-in-1", "monitor:hdmi-in-1", lead("sw:hdmi-in-1")); // input -> input
  rejected(null, "mix:in-1", lead("sw:hdmi-in-1")); // HDMI plug into an XLR socket
  rejected("cam1:hdmi-out", "cam1:hdmi-out", lead("sw:hdmi-in-1")); // same endpoint
  rejected(null, "host:usb-1", lead("sw:hdmi-in-1")); // HDMI plug into a USB host port
});
test("switching changes Program state and can return to an earlier source", () => {
  let state = solve(SCENARIOS["xs-3"]);
  state = setControl(state, "sw", "pgm", "HDMI 1");
  assert.match(simContext(state).view.sw.picture, /TEACHER CAM/);
  state = setControl(state, "sw", "pgm", "HDMI 2");
  assert.match(simContext(state).view.sw.picture, /SLIDES/);
  state = setControl(state, "sw", "pgm", "HDMI 1");
  assert.match(simContext(state).view.monitor.picture, /TEACHER CAM/);
});

test("venue placement: every port, control and cable start sits inside its venue layout", () => {
  const { LAYOUTS, onSurface } = load("../game/training/venue-layouts.ts");
  for (const s of venues) {
    const L = LAYOUTS[s.layout];
    assert.ok(L, `${s.id}: unknown layout ${s.layout}`);
    const inside = (p) => p[0] >= L.bounds.minX && p[0] <= L.bounds.maxX && p[2] >= L.bounds.minZ && p[2] <= L.bounds.maxZ;
    for (const p of Object.values(s.ports)) {
      assert.ok(inside(p.position), `${s.id}: port outside venue ${p.label}`);
      assert.ok(p.position[1] > 0.01 && p.position[1] < 2.6, `${s.id}: port height ${p.label}`);
    }
    for (const a of s.actions) assert.ok(a.position[1] < 2.65, `${s.id}: action too high ${a.id}`);
    // Cables are stored at the venue's dedicated cable location.
    for (const c of s.cables) for (const p of c.start) assert.ok(onSurface(L.cables, p[0], p[2], 0.05), `${s.id}: cable ${c.id} not in cable storage`);
    // Portable equipment starts in storage (L4 starts set up) and has a named operating position.
    for (const item of s.placeables) {
      assert.ok(item.zoneLabel, `${s.id}: ${item.id} has no operating position label`);
      if (s.level !== 4) assert.ok(onSurface(L.equipment, item.start[0], item.start[2], 0.05), `${s.id}: ${item.id} must start in equipment storage`);
    }
  }
});
test("SDI switcher takes HDMI sources only through explicit converters", () => {
  const s = SCENARIOS["l-5"];
  assert.equal(s.ports["lap:hdmi-out"].connector, "HDMI");
  assert.equal(s.ports["convHS:sdi-out"].connector, "SDI");
  assert.ok(!Object.values(s.ports).some((p) => p.device === "sw" && p.connector === "HDMI" && p.direction === "INPUT"));
  assert.ok(s.canonical.some((r) => r.from === "lap:hdmi-out" && r.to === "convHS:hdmi-in"));
});

test("a lead that physically fits but carries the wrong signal family is rejected atomically", () => {
  let state = setUp("m-4");
  state = attach(state, "x-sdi1", "a", "cam2:sdi-out");
  state = act(state, { kind: "end", cableId: "x-sdi1", end: "b" });
  const before = structuredClone(state);
  state = act(state, { kind: "port", portId: "sw:ref-in" });
  assert.equal(state.notice.tone, "error");
  assert.deepEqual(state.cables, before.cables); assert.deepEqual(state.held, before.held);
});

test("local scene font covers Thai labels, technical actions and port names without remote fallback", () => {
  const { SCENE_FONT, sceneText } = load("../game/rendering/scene-font.ts");
  const { LAYOUTS } = load("../game/training/venue-layouts.ts");
  const { parse } = load("../node_modules/three-stdlib/libs/opentype.cjs");
  const data = fs.readFileSync(path.join(projectRoot, "public", SCENE_FONT));
  const font = parse(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
  const labels = ["AV cabinet | portable equipment", "Weather-protected control shelter", "TX -> RX | wireless"];
  for (const scenario of venues) {
    for (const device of scenario.devices) labels.push(device.label, device.model ?? "");
    for (const cable of scenario.cables) labels.push(cable.label);
    for (const port of Object.values(scenario.ports)) labels.push(port.label);
  }
  for (const layout of Object.values(LAYOUTS)) for (const f of layout.furniture) labels.push(f.label ?? "");
  const missing = [...new Set(labels.join(""))].filter((c) => !/\s/u.test(c) && [...sceneText(c)].some((glyph) => !/\s/u.test(glyph) && (!font.charToGlyphIndex(glyph) || font.charToGlyph(glyph).path.commands.length === 0)));
  assert.deepEqual(missing, [], "3D labels must have glyphs in the bundled scene font");
  assert.equal(sceneText("SDI → Mixer · 75Ω"), "SDI -> Mixer | 75 ohm");
});


test("scene font loading is shared and can retry after a failed local request", async () => {
  const { loadSceneFont } = load("../game/rendering/scene-font.ts");
  const previousDocument = globalThis.document, previousFontFace = globalThis.FontFace;
  let attempts = 0, added = 0;
  try {
    globalThis.document = { fonts: { add: () => { added++; } } };
    globalThis.FontFace = class {
      load() { return ++attempts === 1 ? Promise.reject(new Error("local font unavailable")) : Promise.resolve(this); }
    };
    await assert.rejects(loadSceneFont(), /local font unavailable/);
    const first = loadSceneFont(), second = loadSceneFont();
    assert.equal(first, second);
    await first;
    assert.equal(attempts, 2);
    assert.equal(added, 1);
  } finally {
    if (previousDocument === undefined) delete globalThis.document; else globalThis.document = previousDocument;
    if (previousFontFace === undefined) delete globalThis.FontFace; else globalThis.FontFace = previousFontFace;
  }
});


test("large venue sockets stay on generic equipment panels with unit normals", () => {
 for (const scenario of venues.filter(s => ["m", "l", "xl"].includes(s.venueScale))) {
  for(const port of Object.values(scenario.ports)) {
   assert.ok(port.normal, `${scenario.id}: missing physical panel normal`);
   assert.ok(Math.abs(Math.hypot(...port.normal)-1)<1e-6);
   const d=scenario.devices.find(d=>d.id===port.device), dx=port.position[0]-d.position[0], dz=port.position[2]-d.position[2];
   if(d.kind!=="camera" && d.kind!=="mic") assert.ok(Math.hypot(dx,dz)<Math.hypot(d.size[0],d.size[2])/2+0.02, `${scenario.id}: ${d.id} floating socket`);
  }
 }
});

test("auditorium has 126 seats, clear longitudinal aisles and cameras supported by risers", () => {
 const { LAYOUTS }=load("../game/training/venue-layouts.ts");
 const rows=LAYOUTS.auditorium.furniture.filter(f=>f.kind==="chairBlock");
 assert.equal(rows.length*6,126);
 const centres=[...new Set(rows.map(f=>f.center[0]))].sort((a,b)=>a-b);
 assert.ok(centres[1]-centres[0]-rows[0].size[0]>1.5);
 for(const [id,camera] of [["m-5","cam1"],["xl-5","cam1"]]) {
  const scenario=venues.find(s=>s.id===id), d=scenario.devices.find(d=>d.id===camera);
  const f=LAYOUTS[scenario.layout].furniture.find(f=>["riser","cameraPlatform"].includes(f.kind));
  assert.equal(d.position[1],f.size[1], `${id}: tripod penetrates platform`);
 }
});

test("all mission port stations are within normal interaction reach of connected walkable space", () => {
 const { LAYOUTS,layoutObstacles }=load("../game/training/venue-layouts.ts");
 for(const scenario of venues.filter(s=>s.level===5)) {
  const L=LAYOUTS[scenario.layout],b=L.bounds,step=0.25,radius=0.29,obs=layoutObstacles(L);
  const nx=Math.floor((b.maxX-b.minX)/step),nz=Math.floor((b.maxZ-b.minZ)/step);
  const point=(i,j)=>[b.minX+radius+i*step,b.minZ+radius+j*step];
  const free=(i,j)=>{const [x,z]=point(i,j);return i>=0&&j>=0&&i<nx&&j<nz&&x<b.maxX-radius&&z<b.maxZ-radius&&!obs.some(o=>o.half[1]*2>0.1&&Math.abs(x-o.center[0])<o.half[0]+radius&&Math.abs(z-o.center[2])<o.half[2]+radius);};
  const start=[Math.round((L.spawn[0]-b.minX-radius)/step),Math.round((L.spawn[2]-b.minZ-radius)/step)];
  assert.ok(free(...start),`${scenario.id}: spawn blocked`);
  const seen=new Set([start.join(",")]),queue=[start];
  for(let k=0;k<queue.length;k++){const [i,j]=queue[k];for(const p of [[i+1,j],[i-1,j],[i,j+1],[i,j-1]]){const key=p.join(",");if(!seen.has(key)&&free(...p)){seen.add(key);queue.push(p);}}}
  for(const port of Object.values(scenario.ports)) assert.ok(queue.some(([i,j])=>{const [x,z]=point(i,j);return Math.hypot(x-port.position[0],1.64-port.position[1],z-port.position[2])<2.6;}),`${scenario.id}: unreachable station ${port.label}`);
 }
});


test("large venue monitoring loses signal when its physical input is unplugged", () => {
  const { venueScreenLive } = load("../game/training/monitor-feed.ts");
  for (const id of ["m-5", "l-5", "xl-5"]) {
    const scenario = SCENARIOS[id]; let state = solve(scenario);
    const screen = id === "m-5" ? "display" : "monitor";
    assert.ok(venueScreenLive(state, screen), id);
    const target = scenario.canonical.find((r) => r.to.startsWith(`${screen}:`));
    state = act(state, { kind: "port", portId: target.to });
    assert.ok(!venueScreenLive(state, screen), id);
  }
});

test("long venue leads descend to the floor and use the perimeter service lane", () => {
 const { classroomCableRoute }=load("../game/training/cable-route.ts");
 const { LAYOUTS }=load("../game/training/venue-layouts.ts");
 for(const venue of ["auditorium","outdoor","stadium"]) {
  const points=classroomCableRoute([0,1.2,-4],[1,0.8,7],venue);
  assert.equal(points.length,10);
  assert.ok(points.some(p=>p[0]===LAYOUTS[venue].bounds.maxX-0.35&&p[1]===0.025));
  assert.deepEqual(points[0],[0,1.2,-4]);assert.deepEqual(points.at(-1),[1,0.8,7]);
 }
});


test("stadium cameras face the pitch and rack backs leave a service aisle", () => {
 const { LAYOUTS }=load("../game/training/venue-layouts.ts");
 const L=LAYOUTS.stadium;
 for(const d of SCENARIOS["xl-5"].devices.filter(d=>d.kind==="camera")) {
  const target=[0,50],dx=target[0]-d.position[0],dz=target[1]-d.position[2];
  assert.ok(-Math.sin(d.yaw)*dx-Math.cos(d.yaw)*dz>0,`${d.id} points away from pitch`);
 }
 for(const f of L.furniture.filter(f=>f.id.startsWith("xl-rack-"))) assert.ok(f.center[0]-f.size[2]/2-L.bounds.minX>0.9,`${f.id} blocks service access`);
});


test("auditorium presenter faces the laptop and input equipment rests on its support", () => {
  const { LAYOUTS } = load("../game/training/venue-layouts.ts");
  const layout = LAYOUTS.auditorium;
  const laptop = layout.places.slides, chair = layout.places.presenterChair;
  const dx = chair.p[0] - laptop.p[0], dz = chair.p[2] - laptop.p[2];
  assert.ok((Math.sin(laptop.yaw) * dx + Math.cos(laptop.yaw) * dz) / Math.hypot(dx, dz) > 0.99);
  const table = layout.furniture.find((f) => f.id === "m-presenter");
  const stage = layout.furniture.find((f) => f.kind === "stage");
  assert.ok(chair.p[2] - 0.25 > stage.center[2] + stage.size[2] / 2);
  assert.ok(chair.p[2] + 0.25 < table.center[2] - table.size[2] / 2);
  const projector = SCENARIOS["m-1"].devices.find((d) => d.id === "display");
  const support = layout.furniture.find((f) => f.id === "m-display-case");
  assert.equal(projector.position[1], support.size[1]);
  assert.ok(Math.abs(projector.position[2] - support.center[2]) < 0.01);
});


test("outdoor stations share camera positions and keep installed equipment on sheltered worktops", () => {
  const { LAYOUTS } = load("../game/training/venue-layouts.ts");
  const layout = LAYOUTS.outdoor;
  const desk = layout.furniture.find((f) => f.id === "l-tent-desk");
  for (const level of [1, 2, 3, 4, 5]) {
    const scenario = SCENARIOS[`l-${level}`];
    for (const id of ["cam1", "cam2"]) {
      const device = scenario.devices.find((d) => d.id === id);
      if (device) {
        assert.deepEqual(device.position, layout.places[id].p);
        assert.equal(device.yaw, layout.places[id].yaw);
      }
    }
    for (const id of ["mix", "sw", "monitor", "pgm", "net", "net2", "ssd", "convSH"]) {
      const device = scenario.devices.find((d) => d.id === id);
      if (!device) continue;
      assert.equal(device.position[1], desk.size[1]);
      assert.ok(Math.abs(device.position[0] - desk.center[0]) + device.size[0] / 2 <= desk.size[0] / 2, id);
      assert.ok(Math.abs(device.position[2] - desk.center[2]) + device.size[2] / 2 <= desk.size[2] / 2, id);
    }
  }
  assert.ok(layout.places.cam1.p[0] > 0 && layout.places.cam2.p[0] < 0);
  const presenter = layout.furniture.find((f) => f.id === "l-presenter");
  assert.equal(layout.places.lap.p[1], presenter.size[1]);
  const stage = layout.furniture.find((f) => f.kind === "stage");
  assert.ok(presenter.center[2] + presenter.size[2] / 2 < stage.center[2] + stage.size[2] / 2 - 0.6, "presenter table must clear the front wedge monitors");
  assert.ok(layout.places.mic.p[1] > layout.furniture.find((f) => f.kind === "stage").size[1]);
});


test("stadium workstations support equipment and retain useful rack service clearance", () => {
  const { LAYOUTS } = load("../game/training/venue-layouts.ts");
  const layout = LAYOUTS.stadium;
  const tableFor = { sw: "xl-switch", play: "xl-replay", gfx: "xl-graphics", mix: "xl-audio", phones: "xl-audio", pgm: "xl-switch", monitor: "xl-monitor-console" };
  for (const level of [1, 2, 3, 4, 5]) {
    const scenario = SCENARIOS[`xl-${level}`];
    for (const [id, furnitureId] of Object.entries(tableFor)) {
      const device = scenario.devices.find((d) => d.id === id);
      if (!device) continue;
      const table = layout.furniture.find((f) => f.id === furnitureId);
      assert.equal(device.position[1], table.size[1], id);
      assert.ok(Math.abs(device.position[0] - table.center[0]) + device.size[0] / 2 <= table.size[0] / 2, id);
      assert.ok(Math.abs(device.position[2] - table.center[2]) + device.size[2] / 2 <= table.size[2] / 2, id);
    }
  }
  const racks = layout.furniture.filter((f) => f.id.startsWith("xl-rack-"));
  for (const rack of racks) assert.ok(rack.center[0] - rack.size[2] / 2 - layout.bounds.minX > 0.9);
});
