import type { CableDef, Connector, DeviceDef, PlugStyle, Point3, PortDef, Scenario, VenueScale } from "./scenarios";
import { LAYOUTS, scaleSpot, surfaceSlots, type LayoutId, type Spot } from "./venue-layouts";
import { MODELS } from "./sim/equipment";
import { ROOMS } from "./sim/rooms";
import { STAGES } from "./sim/stages";
import type { CableMeta, DeviceInstance } from "./sim/engine";
import { runBetween } from "./sim/engine";
import type { StageManifest } from "./sim/types";

/**
 * Mission Hall: 5 production rooms × 5 stages = 25 separately playable missions.
 * Each stage is authored as a StageManifest (game/training/sim/stages.ts) on the shared typed signal graph
 * (game/training/sim/engine.ts). This module turns a manifest into the 3D Scenario the first-person game plays:
 * device instances at their stations, every modelled port of every device (not only the "right" ones),
 * a cable kit with type/length tags (never route names), pre-wired/faulted start state and stored portable gear.
 * Free practice (`studio-full`) and `hdmi-basic` are defined in scenarios.ts and are not built here.
 */
const LAYOUT_BY_SCALE: Record<VenueScale, LayoutId> = { xs: "classroom", s: "studioMission", m: "auditorium", l: "outdoor", xl: "stadium" };
export const LEVEL_TITLES = ["Guided", "Partially guided", "Scenario", "Live disruption", "Practical certification"];
const SCALES: VenueScale[] = ["xs", "s", "m", "l", "xl"];
const PLUGS: Partial<Record<Connector, PlugStyle>> = { HDMI: "hdmi", SDI: "sdi", "XLR-F": "xlr-f", "XLR-M": "xlr-m", "3.5mm": "trs35", "6.35mm": "trs635", "USB-A": "usba3", "USB-B": "usba", "USB-C": "usbc", ETHERNET: "ethernet", speakON: "speaker635" };
const plug = (c: Connector): PlugStyle => PLUGS[c] ?? "dp";
const TYPE_NAME: Partial<Record<Connector, string>> = { HDMI: "HDMI", SDI: "3G-SDI (BNC)", ETHERNET: "Ethernet Cat6", "USB-C": "USB-C", "USB-A": "USB", "USB-B": "USB", "3.5mm": "3.5 mm stereo", "6.35mm": "TRS 6.35 mm", "XLR-F": "XLR", "XLR-M": "XLR" };
const COLOR: Partial<Record<Connector, string>> = { HDMI: "#1b1b1f", SDI: "#2a62b8", ETHERNET: "#38d6c4", "USB-C": "#8fb4ff", "USB-A": "#8fb4ff", "XLR-F": "#2f2f33", "6.35mm": "#50b899", "3.5mm": "#50b899", speakON: "#b04030" };

/** Plug needed at each end of a lead joining these two ports. */
function endsFor(out: PortDef, inp: PortDef): [Connector, Connector] {
  const a: Connector = out.connector === "XLR" ? "XLR-F" : out.connector;
  let b: Connector = inp.connector === "XLR" ? "XLR-M" : inp.connector;
  if (inp.connector === "COMBO") b = out.connector === "XLR" ? "XLR-M" : "6.35mm";
  return [a, b];
}
function leadLength(run: number, c: Connector): number {
  if (run <= 2) return c === "XLR-F" || c === "6.35mm" ? 5 : c === "SDI" ? 3 : 2;
  return Math.ceil((run + 3) / 5) * 5;
}

export function buildVenueScenario(scale: VenueScale, level: 1 | 2 | 3 | 4 | 5): Scenario {
  const stage: StageManifest = STAGES.find((s) => s.room === scale && s.level === level)!;
  const room = ROOMS[scale];
  const layoutId = LAYOUT_BY_SCALE[scale];
  const layout = LAYOUTS[layoutId];
  const simDevices: Record<string, DeviceInstance> = Object.fromEntries(stage.devices.map((id) => [id, { ...room.instances[id], id }]));
  const movable = new Set(stage.devices.filter((d) => room.portable.includes(d)));

  // Devices: model name + verification status visible in Inspect Mode.
  const devices: DeviceDef[] = stage.devices.map((id) => {
    const inst = room.instances[id];
    const m = MODELS[inst.model];
    const size: Point3 = [...m.size];
    if (m.role === "display" && inst.model === "generic-projector") size.splice(0, 3, 0.42, 0.16, 0.34);
    if (m.role === "ingest") size.splice(0, 3, 0.4, 0.9, 0.4);
    if (scale === "xl" && ["enc", "net", "wan", "rec"].includes(id)) size.splice(0, 3, 0.56, 1.7, 0.56);
    return {
      id, label: `${inst.label} (${inst.tag})`, model: m.generic ? `Generic Training Device · ${m.name}` : m.name,
      status: m.generic ? "GENERIC TRAINING MODEL" : "CONFIRMED", generic: m.generic, verified: !m.generic,
      kind: m.kind, position: [0, 0.78, 0], size, color: m.role === "switcher" ? "#1d2633" : m.role === "mixer" ? "#22262c" : "#263345",
    };
  });

  // Stations: layout station alias or room spot (base coordinates, scaled with the venue).
  const spotOf = (id: string): Spot | undefined => {
    const p = room.places[id];
    if (typeof p === "string") return layout.places[p];
    return p ? scaleSpot(layoutId, p) : undefined;
  };
  const fallback = surfaceSlots(layout.equipment, devices.length, 2, 0.2);
  devices.forEach((d, i) => { const spot = spotOf(d.id); d.position = spot ? [...spot.p] : [...fallback[i]]; d.yaw = spot?.yaw ?? 0; });

  // Ports: EVERY modelled port of every device, on its real panel face.
  const ports: Record<string, PortDef> = {};
  for (const d of devices) {
    const m = MODELS[simDevices[d.id].model];
    for (const p of m.ports) ports[`${d.id}:${p.key}`] = { device: d.id, label: `${d.label.replace(/ \(.*\)$/, "")} ${p.name}`, direction: p.dir, connector: p.connector, purpose: p.tip, position: [0, 0, 0], radius: 0.03, ...(movable.has(d.id) ? { requiresItem: d.id } : {}) };
  }
  placePorts(devices, ports);

  // Cable kit: one lead per documented patch (type + length tag only) plus spares and decoys.
  const cables: CableDef[] = [];
  const cableMeta: Record<string, CableMeta> = {};
  const leadFor: Record<string, string> = {};
  stage.solution.forEach(([from, to], i) => {
    const out = ports[from], inp = ports[to];
    if (!out || !inp) throw new Error(`${stage.id}: unknown port in solution ${from} → ${to}`);
    const ends = endsFor(out, inp);
    const run = runBetween(stage, from.split(":")[0], to.split(":")[0]);
    const lengthM = leadLength(run, ends[0]);
    const ratedM = ends[0] === "SDI" ? 100 : ends[0] === "HDMI" ? 10 : undefined;
    const type = TYPE_NAME[ends[0]] ?? ends[0];
    const label = `${type}${ends[0] === ends[1] ? "" : ` → ${TYPE_NAME[ends[1]] ?? ends[1]}`} ${lengthM} m${ends[0] === "SDI" ? " · tested (sim validated 100 m at 3G)" : ""}`;
    const id = `lead-${i + 1}`;
    leadFor[`${from}>${to}`] = id;
    // Purpose drives the prep-lobby catalog type (mic vs line vs PA feed vs uplink); it is never shown as a route.
    const so = MODELS[simDevices[from.split(":")[0]].model].ports.find((x) => `${from.split(":")[0]}:${x.key}` === from)!;
    const ti = MODELS[simDevices[to.split(":")[0]].model];
    const purpose = so.sig === "MIC" ? "mic" : so.sig === "HEADPHONE" ? "phones" : so.sig === "LINE_BAL" ? (ti.role === "speaker" ? "mix-pa" : "mix-bc") : so.sig === "WAN" ? "destination" : "lead";
    cables.push({ id, label, ends, plugs: [plug(ends[0]), plug(ends[1])], color: COLOR[ends[0]] ?? "#72aadd", start: [[0, 0, 0], [0, 0, 0]], purpose });
    cableMeta[id] = { id, label, lengthM, ratedM };
  });
  for (const x of stage.extraCables ?? []) {
    cables.push({ id: x.id, label: x.label, ends: x.ends, plugs: [plug(x.ends[0]), plug(x.ends[1])], color: COLOR[x.ends[0]] ?? "#999da5", start: [[0, 0, 0], [0, 0, 0]], purpose: "distractor" });
    cableMeta[x.id] = { id: x.id, label: x.label, lengthM: x.lengthM, ratedM: x.ratedM };
  }
  storeCables(layoutId, cables);

  // Portable gear starts in its labelled case/storage (L4 broken show: already installed).
  const carried = devices.filter((d) => movable.has(d.id));
  const storage = packStorage(layoutId, carried);
  const prewiredAll = stage.prewired === "all";
  const startOf = Object.fromEntries(carried.map((d, i) => [d.id, prewiredAll ? [...d.position] as Point3 : storage[i]]));

  // Start state: pre-wired pairs, then L4 faults (unplug / repatch with a wrong lead).
  const pairs: { cableId: string; from: string; to: string }[] = [];
  const used = new Set<string>();
  const pickLead = (from: string, to: string, explicit?: string) => {
    if (explicit) return explicit;
    const exact = leadFor[`${from}>${to}`];
    if (exact && !used.has(exact)) return exact;
    const sameEnd = stage.solution.find(([f, t]) => (f === from || t === to) && !used.has(leadFor[`${f}>${t}`]));
    return sameEnd ? leadFor[`${sameEnd[0]}>${sameEnd[1]}`] : undefined;
  };
  const listed = stage.prewired === "all" || !stage.prewired ? [] : stage.prewired;
  const pre: [string, string, string?][] = prewiredAll ? stage.solution.map(([f, t]) => [f, t]) : listed.map((x) => [x[0], x[1], x[2]]);
  for (const [from, to, cab] of pre) {
    const cableId = pickLead(from, to, cab);
    if (!cableId) throw new Error(`${stage.id}: no lead for prewired ${from} → ${to}`);
    used.add(cableId);
    pairs.push({ cableId, from, to });
  }
  let initial = pairs;
  for (const f of stage.faults ?? []) {
    for (const [from, to] of f.unplug ?? []) initial = initial.filter((c) => !(c.from === from && c.to === to));
    if (f.repatch) {
      const [from, to] = f.repatch.pair;
      initial = initial.filter((c) => !(c.from === from && c.to === to));
      initial.push({ cableId: f.repatch.cable ?? leadFor[`${from}>${to}`], from: f.repatch.from ?? from, to });
    }
  }

  // Guided levels list the documented patches as a checklist; scenario levels and above do not reveal routes.
  const guided = stage.guidance === "guided" || stage.guidance === "partial";
  const requirements = guided ? stage.solution.map(([from, to], i) => ({ id: `patch-${i + 1}`, label: `${ports[from].label} → ${ports[to].label}`, group: groupOf(ports[from]), from: [from], to: [to], verified: true })) : [];

  return {
    id: `${scale}-${level}`, venueScale: scale, level, title: `${stage.id} · ${stage.title}`, layout: layoutId,
    devices, ports, cables, requirements, actions: [], job: stage.ticket,
    placeables: carried.map((d) => ({ id: d.id, label: d.label, start: startOf[d.id], zone: [...d.position] as Point3, zoneLabel: spotOf(d.id)?.label, device: d })),
    canonical: stage.solution.map(([from, to]) => ({ cableId: leadFor[`${from}>${to}`], from, to })),
    initialConnections: initial,
    faults: guided ? (stage.faults ?? []).map((f) => f.label) : [],
    assumptions: [
      "Generic Training Devices only model the ports the room specification defines; named models list their manufacturer source in Inspect Mode.",
      "OBS, stream keys, ingest, WAN and weather are local deterministic simulations — no real streaming, credentials or mains work.",
      "Exercise format: 1080p50 · Rec.709 · 48 kHz unless a stage says otherwise.",
    ],
    stage, simDevices, cableMeta,
  };
}

function groupOf(p: PortDef): "video" | "audio" | "capture" | "monitor" {
  if (["XLR", "6.35mm", "3.5mm", "COMBO"].includes(p.connector)) return "audio";
  if (["ETHERNET", "USB-C", "USB-A", "USB-B"].includes(p.connector)) return "capture";
  return "video";
}

/** Sockets sit on the device face toward the operator; tall gear exposes them at working height. */
function placePorts(devices: DeviceDef[], ports: Record<string, PortDef>) {
  const turnBy = (yaw: number, x: number, z: number): [number, number] => [x * Math.cos(yaw) + z * Math.sin(yaw), -x * Math.sin(yaw) + z * Math.cos(yaw)];
  for (const d of devices) {
    const owned = Object.values(ports).filter((p) => p.device === d.id);
    const display = d.kind === "box" && /Monitor|Screen|Display|Projector|Ingest/.test(d.label) && !/Converter|Encoder|Router|Interface/.test(d.label);
    const perRow = d.kind === "camera" ? 2 : Math.max(1, Math.min(6, Math.floor(d.size[0] / 0.07)));
    const rows = Math.ceil(owned.length / perRow);
    owned.forEach((p, j) => {
      const row = Math.floor(j / perRow), count = Math.min(perRow, owned.length - row * perRow);
      const lx = (j % perRow - (count - 1) / 2) * Math.min(0.09, (d.kind === "camera" ? 0.12 : Math.max(d.size[0], 0.3) * 0.85) / (count + 1));
      let y = d.size[1] / 2 + (row - (rows - 1) / 2) * Math.min(0.12, Math.max(d.size[1], 0.2) * 0.7 / rows);
      let z = d.size[2] / 2 + 0.006;
      let normal: Point3 = [0, 0, 1];
      if (d.kind === "camera") { y = 1.28 + (row - (rows - 1) / 2) * 0.05; z = 0.193; }
      else if (display) { y += d.position[1] < 0.3 && d.size[1] < 0.5 ? 1.1 : 0.08; z = -Math.max(d.size[2], 0.05) / 2 - 0.006; normal = [0, 0, -1]; }
      else if (d.kind === "laptop") { y = 0.013; z = 0; normal = [-1, 0, 0]; }
      else if (d.kind === "mic") { y = d.position[1] < 0.3 ? 1.39 : 0.03; z = d.position[1] < 0.3 ? -0.025 : 0.095; }
      else if (d.position[1] < 0.3 && d.size[1] < 0.4) { y += 0.0; }
      const x = d.kind === "laptop" ? -d.size[0] / 2 - 0.006 - (j % 3) * 0 : lx;
      const zz = d.kind === "laptop" ? (j - (owned.length - 1) / 2) * 0.06 : z;
      const [ox, oz] = turnBy(d.yaw ?? 0, x, zz);
      const [nx, nz] = turnBy(d.yaw ?? 0, normal[0], normal[2]);
      p.normal = [nx, normal[1], nz];
      p.position = [+(d.position[0] + ox).toFixed(4), +(d.position[1] + y).toFixed(4), +(d.position[2] + oz).toFixed(4)];
      p.radius = Math.min(0.035, 0.022 + Math.max(d.size[0], 0.2) * 0.005);
    });
  }
}

/** Pack stored bodies along the storage surface's long axis without overlap (two rows when one is full). */
function packStorage(layoutId: LayoutId, items: DeviceDef[]): Point3[] {
  const s = LAYOUTS[layoutId].equipment, [w, d] = s.size ?? [1.4, 1.4], longX = w >= d, L = longX ? w : d, S = longX ? d : w;
  const extent = (x: DeviceDef) => (longX ? x.size[0] : x.size[2]) + 0.04;
  const rows: DeviceDef[][] = [[]];
  let used = 0.1;
  for (const it of items) {
    if (used + extent(it) > L - 0.1 && rows[rows.length - 1].length) { rows.push([]); used = 0.1; }
    rows[rows.length - 1].push(it); used += extent(it);
  }
  const out = new Map<string, Point3>();
  rows.forEach((row, r) => {
    let at = -L / 2 + 0.1;
    const across = rows.length === 1 ? 0 : -S / 2 + (r + 0.5) * (S / rows.length);
    for (const it of row) {
      const c = at + extent(it) / 2; at += extent(it);
      out.set(it.id, longX ? [+(s.center[0] + c).toFixed(3), s.center[1], +(s.center[2] + across).toFixed(3)] : [+(s.center[0] + across).toFixed(3), s.center[1], +(s.center[2] + c).toFixed(3)]);
    }
  });
  return items.map((it) => out.get(it.id)!);
}

/** Cables are stored in tidy rows at the venue's cable location (every shelf level of a cable rack). */
function storeCables(layoutId: LayoutId, cables: CableDef[]) {
  const s = LAYOUTS[layoutId].cables, [w, dd] = s.size ?? [1.4, 1.4], long = w >= dd, L = long ? w : dd, S = long ? dd : w;
  const heights = [s.center[1], ...(s.levels ?? [])];
  const perLevel = Math.ceil(cables.length / heights.length);
  const perRow = Math.max(1, Math.floor((L - 0.3) / 0.2)), rows = Math.max(1, Math.ceil(perLevel / perRow));
  cables.forEach((c, k) => {
    const shelf = Math.floor(k / perLevel), i = k % perLevel;
    const along = -L / 2 + 0.18 + (i % perRow) * 0.2, across = -S / 2 + 0.15 + (Math.floor(i / perRow) + 0.5) * ((S - 0.3) / rows);
    const y = heights[shelf] + 0.06;
    const pt = (dl: number, da: number): Point3 => long ? [+(s.center[0] + along + dl).toFixed(3), y, +(s.center[2] + across + da).toFixed(3)] : [+(s.center[0] + across + da).toFixed(3), y, +(s.center[2] + along + dl).toFixed(3)];
    c.start = [pt(0, -0.04), pt(0.05, 0.04)];
  });
}

export const VENUE_SCENARIOS = Object.fromEntries(SCALES.flatMap((scale) => ([1, 2, 3, 4, 5] as const).map((level) => { const scenario = buildVenueScenario(scale, level); return [scenario.id, scenario]; }))) as Record<`${VenueScale}-${1 | 2 | 3 | 4 | 5}`, Scenario>;
