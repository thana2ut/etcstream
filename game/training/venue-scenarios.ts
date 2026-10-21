import { MODEL_GEOMETRY, portClearance, TRIPOD_TOP } from "./sim/model-geometry";
import { equipmentVisualGeometry } from "../rendering/equipment-visual-profile";
import { selectedGameProduct } from "../content/selected-product-info";
import type { CableDef, Connector, DeviceDef, PlugStyle, Point3, PortDef, Scenario, VenueScale } from "./scenarios";
import { LAYOUTS, scaleSpot, surfaceSlots, type Furniture, type LayoutId, type Spot, type VenueLayout } from "./venue-layouts";
import { MODELS } from "./sim/equipment";
import { MISSION_ROOMS as ROOMS } from "./sim/rooms";
import { STAGES } from "./sim/stages";
import type { CableMeta, DeviceInstance } from "./sim/engine";
import { runBetween } from "./sim/engine";
import type { StageManifest } from "./sim/types";
import { missionDesignIssues } from "./mission-completeness";
import { layoutObstacles } from "./venue-layouts";
import { classroomCableRoute } from "./cable-route";

/**
 * Mission Hall: 5 production rooms × 5 stages = 25 separately playable missions.
 * Each stage is authored as a StageManifest (game/training/sim/stages.ts) on the shared typed signal graph
 * (game/training/sim/engine.ts). This module turns a manifest into the 3D Scenario the first-person game plays:
 * device instances at their stations, every modelled port of every device (not only the "right" ones),
 * a cable kit with type/length tags (never route names), pre-wired/faulted start state and stored portable gear.
 * Free practice (`studio-full`) and `hdmi-basic` are defined in scenarios.ts and are not built here.
 */
const LAYOUT_BY_SCALE: Record<VenueScale, LayoutId> = { xs: "classroom", s: "studioMission", m: "auditorium", l: "outdoor", xl: "stadium" };
export const LEVEL_TITLES = ["ฝึกพร้อมคำแนะนำ", "ฝึกพร้อมคำแนะนำบางส่วน", "สถานการณ์ฝึก", "แก้เหตุขัดข้อง", "ประเมินทักษะปฏิบัติ"];
const SCALES: VenueScale[] = ["xs", "s", "m", "l", "xl"];
const PLUGS: Partial<Record<Connector, PlugStyle>> = { FIBER: "optical", MULTICORE: "multicore", CONTROL: "logical", HDMI: "hdmi", SDI: "sdi", "XLR-F": "xlr-f", "XLR-M": "xlr-m", "3.5mm": "trs35", "6.35mm": "trs635", "USB-A": "usba3", "USB-B": "usbb", "USB-C": "usbc", ETHERNET: "ethernet", speakON: "speakon" };
/** Hybrid camera fiber (FIB-CAMERA-CCU) is SMPTE 304/311; any other optical link stays the generic termination. */
const plugsFor = (ends: [Connector, Connector], purpose?: string): [PlugStyle, PlugStyle] => ends.map((c) => c === "FIBER" ? purpose === "fiber-camera" ? "smpte" : "lc-duplex" : plug(c)) as [PlugStyle, PlugStyle];
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
  const stage: StageManifest = { ...STAGES.find((s) => s.room === scale && s.level === level)! };
  const room = ROOMS[scale];
  const layoutId = LAYOUT_BY_SCALE[scale];
  const layout = LAYOUTS[layoutId];
  // Venue master stock: every unit any of this venue's five levels uses is in the room, in the same place every level.
  // Units this level does not use are `stockOnly` (they never count toward the objective and are outside the save signature).
  const extras = venueStock(scale).filter((id) => !stage.devices.includes(id));
  const roster = [...stage.devices, ...extras];
  const simDevices: Record<string, DeviceInstance> = Object.fromEntries(roster.map((id) => [id, { ...room.instances[id], id }]));
  const movable = new Set(roster.filter((d) => room.portable.includes(d)));

  // Devices: model name + verification status visible in Inspect Mode.
  const devices: DeviceDef[] = roster.map((id) => {
    const inst = room.instances[id];
    const m = MODELS[inst.model];
    const geo = equipmentVisualGeometry(inst.model);
    const tower = scale === "xl" && ["enc", "enc2", "net", "net2", "wan", "wan2", "rec"].includes(id);
    // Modelled hardware: real dimensions × display scale (cameras keep their tripod footprint, stadium towers their rack).
    const legacyGeo=MODEL_GEOMETRY[inst.model];
    const size: Point3 = legacyGeo && !legacyGeo.mount && !tower ? legacyGeo.size.map((v) => +(v * legacyGeo.displayScale).toFixed(4)) as Point3 : [...m.size];
    if (m.role === "display" && inst.model === "generic-projector") size.splice(0, 3, 0.42, 0.16, 0.34);
    if (m.role === "ingest") size.splice(0, 3, 0.4, 0.9, 0.4);
    if (tower) size.splice(0, 3, 0.56, 1.7, 0.56);
    const mount: DeviceDef["mount"] = geo?.mount === "tripod" ? { kind: "tripod", offset: [0, TRIPOD_TOP, 0] }
      : geo && tower ? { kind: "rack", offset: [0, 1.0, +(-0.28 + (geo.size[2] * geo.displayScale) / 2 + 0.01).toFixed(4)] } : undefined;
    return {
      id, modelId: inst.model, ...(mount ? { mount } : {}), equipmentRole: m.role, label: `${inst.label} (${inst.tag})`, model: m.generic ? `อ้างอิงภาพ GAME · ${selectedGameProduct(inst.model)?.name??m.name}` : m.name,
      status: scale === "s" && !["capture", "speaker", "monitor"].includes(id) ? "PROVISIONAL" : m.generic ? "GENERIC TRAINING MODEL" : "DESIGN_REFERENCE", generic: m.generic, verified: false,
      kind: m.kind, position: [0, 0.78, 0], size, color: m.role === "switcher" ? "#1d2633" : m.role === "mixer" ? "#22262c" : "#263345",
      ...(extras.includes(id) ? { stockOnly: true } : {}),
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
  for (const d of devices) {
    d.zoneLabel = spotOf(d.id)?.label ?? layout.zones[0];
    if (d.kind === "camera") {
      d.position[0] = Math.max(layout.bounds.minX + 1.6, Math.min(layout.bounds.maxX - 1.6, d.position[0]));
      d.position[2] = Math.max(layout.bounds.minZ + 1.6, Math.min(layout.bounds.maxZ - 1.6, d.position[2]));
    }
    // Game-scale shells make independent sockets selectable; these are not product dimensions.
    const count = MODELS[simDevices[d.id].model].ports.length;
    if ((d.kind === "box" || d.kind === "mixer") && !MODEL_GEOMETRY[simDevices[d.id].model]) {
      d.size[0] = Math.max(d.size[0], Math.min(6, count) * 0.075 + 0.12);
      d.size[1] = Math.max(d.size[1], Math.ceil(count / 6) * 0.065 + 0.06);
    }
    // At perimeter stations orient rear connectors into the room, not into its boundary wall.
    // This changes only training-shell orientation, never the model's electrical port profile.
    if (d.kind === "box") {
      const nx = -Math.sin(d.yaw ?? 0), nz = -Math.cos(d.yaw ?? 0);
      const probe = [d.position[0] + nx * 1.2, d.position[2] + nz * 1.2];
      if (probe[0] < layout.bounds.minX + 0.3 || probe[0] > layout.bounds.maxX - 0.3 || probe[1] < layout.bounds.minZ + 0.3 || probe[1] > layout.bounds.maxZ - 0.3) d.yaw = (d.yaw ?? 0) + Math.PI;
    }
  }

  // Preserve which existing items can be handled. New visual dimensions must not silently add/remove item IDs in saves.
  const handlingSizes=new Map(devices.map(d=>[d.id,[...d.size]]));
  for(const d of devices) {
    const geo=equipmentVisualGeometry(d.modelId),tower=scale==='xl'&&['enc','enc2','net','net2','wan','wan2','rec'].includes(d.id);
    if(geo&&!geo.mount&&!tower&&d.kind!=='camera'&&d.equipmentRole!=='ingest') d.size=geo.size.map(v=>+(v*geo.displayScale).toFixed(4)) as Point3;
    if(geo&&d.equipmentRole==='ingest'&&!tower) {
      d.size=[Math.max(d.size[0],geo.size[0]*geo.displayScale+.03),d.size[1],Math.max(d.size[2],geo.size[2]*geo.displayScale+.03)];
      d.mount={kind:'rack',offset:[0,d.size[1]/2,0]};
    }
  }

  // Mounted units (Camera Fiber Converter on its camera's battery-plate mount) sit behind and level with the host body.
  for (const d of devices) {
    const host = room.instances[d.id].mountedOn ? devices.find((h) => h.id === room.instances[d.id].mountedOn) : undefined;
    if (!host) continue;
    const yaw = host.yaw ?? 0;
    // Modelled pair: the converter's camera plate sits against the camera's rear face, level with the body base.
    const hg = host.modelId ? MODEL_GEOMETRY[host.modelId] : undefined, ug = d.modelId ? MODEL_GEOMETRY[d.modelId] : undefined;
    const back = hg && ug ? +(hg.size[2] / 2 * hg.displayScale + ug.size[2] / 2 * ug.displayScale).toFixed(4) : 0.34;
    d.yaw = yaw;
    d.position = [host.position[0] + Math.sin(yaw) * back, host.position[1] + (hg?.mount === "tripod" ? TRIPOD_TOP : 1.18), host.position[2] + Math.cos(yaw) * back];
    d.zoneLabel = `ท้ายกล้อง · ${host.label.replace(/ \(.*\)$/, "")}`;
  }

  settleOnFurniture(layout, devices, room);

  // Handleable desk gear: starts installed at its station but can be lifted, carried and set back (same E / F / hold-E
  // pattern as cased gear). Cameras, displays, floor/rack units and anything larger than a desktop box stay fixed.
  // Modelled hardware is judged by its REAL dimensions (the display scale only enlarges it for aiming).
  // Speakers on stands, stage boxes/snake tails, routers and rack-mounted CCUs are installed infrastructure: inspect only.
  const FIXED_ROLES = new Set(["display", "ingest", "router", "speaker", "stagebox", "snake-tail"]);
  const handled = new Set(devices.filter((d) => !movable.has(d.id) && d.kind !== "camera" && !FIXED_ROLES.has(d.equipmentRole ?? "")
    && !["reference-ccu", "bmd-studio-fiber-converter"].includes(room.instances[d.id].model) && !room.instances[d.id].mountedOn && d.position[1] >= 0.5 && Math.max(...(d.modelId && MODEL_GEOMETRY[d.modelId] ? MODEL_GEOMETRY[d.modelId].size : handlingSizes.get(d.id)!)) <= 0.65).map((d) => d.id));
  const liftable = (id: string) => movable.has(id) || handled.has(id);

  // Ports: EVERY modelled port of every device, on its real panel face.
  const ports: Record<string, PortDef> = {};
  for (const d of devices) {
    const m = MODELS[simDevices[d.id].model];
    for (const p of m.ports) ports[`${d.id}:${p.key}`] = { device: d.id, label: `${d.label.replace(/ \(.*\)$/, "")} ${p.name}`, direction: p.dir, connector: p.connector, purpose: p.tip, panel: p.panel, position: [0, 0, 0], radius: 0.03, ...(liftable(d.id) ? { requiresItem: d.id } : {}) };
  }
  placePorts(devices, ports, new Set(stage.devices.filter((id) => MODELS[room.instances[id].model].role === "display")));
  for (const [id, port] of Object.entries(ports)) {
    const model = MODELS[simDevices[port.device].model];
    const signal = model.ports.find((p) => `${port.device}:${p.key}` === id)!.sig;
    port.linkRole = ["ETHERNET", "WAN"].includes(signal) ? "NETWORK_PEER" : signal === "FIBER_VIDEO" ? "OPTICAL_MATCHED" : signal === "USB_POWER" ? "POWER_ONLY" : signal.startsWith("USB") ? model.role === "host" ? "USB_HOST" : model.role === "storage" ? "USB_STORAGE" : "USB_DEVICE" : undefined;
  }

  // Virtual run lengths are authored from this room's actual transforms. They are not real cable specifications.
  const runs = { ...stage.runs };
  for (const [from, to] of stage.solution) {
    const a = ports[from], b = ports[to];
    const key = [from.split(":")[0], to.split(":")[0]].sort().join("|");
    if (a && b && runs[key] === undefined) {
      const waypoints = classroomCableRoute(a.position, b.position, layoutId);
      runs[key] = Math.max(1, Math.ceil(waypoints.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - waypoints[i][0], p[1] - waypoints[i][1], p[2] - waypoints[i][2]), 0)));
    }
  }
  stage.runs = runs;

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
    // An issued lead is qualified for this authored exercise run, never a universal SDI/HDMI distance claim.
    const ratedM = ["SDI", "HDMI", "FIBER"].includes(ends[0]) ? lengthM : undefined;
    const type = TYPE_NAME[ends[0]] ?? ends[0];
    const label = simDevices[from.split(":")[0]].model === "generic-lav-mic" ? "สายไมค์ Lavalier 3.5 mm (ต่อเข้า TX)" : `${type}${ends[0] === ends[1] ? "" : ` → ${TYPE_NAME[ends[1]] ?? ends[1]}`} ${lengthM} ม. · สายจำลองตามเส้นทางฝึก`;
    const id = `lead-${i + 1}`;
    leadFor[`${from}>${to}`] = id;
    // Purpose drives the prep-lobby catalog type (mic vs line vs PA feed vs uplink); it is never shown as a route.
    const so = MODELS[simDevices[from.split(":")[0]].model].ports.find((x) => `${from.split(":")[0]}:${x.key}` === from)!;
    const ti = MODELS[simDevices[to.split(":")[0]].model];
    const srcModel = simDevices[from.split(":")[0]].model;
    const purpose = ti.modelId === "bmd-camera-fiber-converter" && ends[0] === "SDI" ? "camera-mount" : ends[0] === "FIBER" ? ["reference-fiber-camera", "bmd-camera-fiber-converter"].includes(srcModel) ? "fiber-camera" : "optical-field" : srcModel === "generic-lav-mic" ? "lav-1" : srcModel === "generic-wireless-rx" ? "rx-mix" : so.sig === "MIC" ? "mic" : so.sig === "HEADPHONE" ? "phones" : so.sig === "LINE_BAL" ? (ti.role === "speaker" ? "mix-pa" : "mix-bc") : so.sig === "WAN" ? "destination" : "lead";
    cables.push({ id, label, ends, plugs: plugsFor(ends, purpose), color: COLOR[ends[0]] ?? "#72aadd", start: [[0, 0, 0], [0, 0, 0]], purpose, stockRole: "required", signalClass: so.sig });
    cableMeta[id] = { id, label, lengthM, ratedM };
  });
  for (const x of stage.extraCables ?? []) {
    cables.push({ id: x.id, label: x.label, ends: x.ends, plugs: [plug(x.ends[0]), plug(x.ends[1])], color: COLOR[x.ends[0]] ?? "#999da5", start: [[0, 0, 0], [0, 0, 0]], purpose: "distractor", stockRole: x.label.includes("สำรอง") ? "spare" : "distractor" });
    cableMeta[x.id] = { id: x.id, label: x.label, lengthM: x.lengthM, ratedM: x.ratedM };
  }
  storeCables(layoutId, cables);

  // Portable gear starts in its labelled case/storage (L4 broken show: already installed).
  const carried = devices.filter((d) => movable.has(d.id) || d.stockOnly && handled.has(d.id));
  // Allocate the complete venue's liftable stock, even when some units start installed for this exercise.
  // An unused slot stays empty rather than moving every other item between levels.
  const pool = devices.filter((d) => liftable(d.id)), slots = packStorage(layoutId, pool);
  const storage = carried.map((d) => slots[pool.findIndex((p) => p.id === d.id)]);
  const prewiredAll = stage.prewired === "all";
  const startOf: Record<string, Point3> = Object.fromEntries(carried.map((d, i) => [d.id, prewiredAll && !d.stockOnly ? [...d.position] as Point3 : storage[i]]));
  for (const d of devices) if (handled.has(d.id) && !d.stockOnly) startOf[d.id] = [...d.position] as Point3;

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
      initial.push({ cableId: f.repatch.cable ?? leadFor[`${from}>${to}`], from: f.repatch.from ?? from, to: f.repatch.to ?? to });
    }
  }

  // Guided levels list the documented patches as a checklist; scenario levels and above do not reveal routes.
  const guided = stage.guidance === "guided" || stage.guidance === "partial";
  const requirements = guided ? stage.solution.map(([from, to], i) => ({ id: `patch-${i + 1}`, label: `${ports[from].label} → ${ports[to].label}`, group: groupOf(ports[from]), from: [from], to: [to], verified: true })) : [];

  const scenario: Scenario = {
    selectedTopologyId: stage.topologyId ?? `project-${stage.id.toLowerCase()}-v1`,
    appendixReferenceIds: stage.appendixReferenceIds ?? ({ xs: ["R01", "R04", "R10", "R11"], s: ["R04", "R05"], m: ["R02", "R08", "R10", "R12", "R14"], l: ["R06", "R07", "R09", "R11", "R13", "R15"], xl: ["R03", "R06", "R08", "R09", "R10", "R13", "R15", "R16", "R17"] } as const)[scale].slice(),
    referenceStatus: stage.researchStatus ?? "DESIGN_REFERENCE",
    id: `${scale}-${level}`, venueScale: scale, level, title: `${stage.id} · ${stage.title.split(" · ")[0]}`, layout: layoutId,
    devices, ports, cables, requirements, actions: [], job: stage.ticket,
    placeables: devices.filter((d) => liftable(d.id)).map((d) => ({ id: d.id, label: d.label, start: startOf[d.id], zone: [...d.position] as Point3, zoneLabel: spotOf(d.id)?.label ?? d.zoneLabel, device: d, ...(handled.has(d.id) && !d.stockOnly ? { installed: true } : {}), ...(d.stockOnly ? { stockOnly: true } : {}) })),
    canonical: stage.solution.map(([from, to]) => ({ cableId: leadFor[`${from}>${to}`], from, to })),
    initialConnections: initial,
    faults: guided ? (stage.faults ?? []).map((f) => f.label) : [],
    assumptions: [
      "อุปกรณ์ฝึกจำลองมีพอร์ตตามข้อกำหนดห้อง รุ่นสินค้าที่ระบุชื่อมีแหล่งอ้างอิงผู้ผลิตในหน้าดูรายละเอียด",
      "OBS รหัสสตรีม จุดรับ WAN และสภาพอากาศจำลองในเครื่อง ไม่มีการสตรีมจริง ใช้ข้อมูลรับรองจริง หรืองานไฟฟ้าหลัก",
      "รูปแบบฝึกมาตรฐาน: 1080p50 · Rec.709 · 48 kHz เว้นแต่ใบงานระบุเป็นอย่างอื่น",
    ],
    stage, simDevices, cableMeta,
  };
  annotateApproaches(scenario);
  scenario.designIssues = missionDesignIssues(scenario);
  return scenario;
}

/** Union of the device instances used by any of the venue's five levels, in level order (first use wins). */
const STOCK = new Map<VenueScale, string[]>();
export function venueStock(scale: VenueScale): string[] {
  let ids = STOCK.get(scale);
  if (!ids) {
    ids = [];
    for (const s of STAGES.filter((x) => x.room === scale).sort((a, b) => a.level - b.level)) for (const id of s.devices) if (!ids.includes(id)) ids.push(id);
    STOCK.set(scale, ids);
  }
  return ids;
}

function groupOf(p: PortDef): "video" | "audio" | "capture" | "monitor" {
  if (["XLR", "6.35mm", "3.5mm", "COMBO"].includes(p.connector)) return "audio";
  if (["ETHERNET", "USB-C", "USB-A", "USB-B"].includes(p.connector)) return "capture";
  return "video";
}

/** Sockets sit on the device face toward the operator; tall gear exposes them at working height. */
function placePorts(devices: DeviceDef[], ports: Record<string, PortDef>, classroomDisplays?: ReadonlySet<string>) {
  const turnBy = (yaw: number, x: number, z: number): [number, number] => [x * Math.cos(yaw) + z * Math.sin(yaw), -x * Math.sin(yaw) + z * Math.cos(yaw)];
  const keyOf = new Map(Object.entries(ports).map(([k, v]) => [v, k]));
  for (const d of devices) {
    const owned = Object.values(ports).filter((p) => p.device === d.id);
    const display = classroomDisplays?.has(d.id) || d.kind === "box" && /Monitor|Screen|Display|Projector|Ingest/.test(d.label) && !/Converter|Encoder|Router|Interface/.test(d.label);
    const perRow = d.kind === "camera" ? 2 : Math.max(1, Math.min(6, Math.floor(d.size[0] / 0.07)));
    const rows = Math.ceil(owned.length / perRow);
    owned.forEach((p) => {
      const panelPorts = owned.filter((other) => other.panel === p.panel);
      const j = panelPorts.indexOf(p);
      const row = Math.floor(j / perRow), count = Math.min(perRow, panelPorts.length - row * perRow);
      const lx = (j % perRow - (count - 1) / 2) * Math.min(0.09, (d.kind === "camera" ? 0.16 : Math.max(d.size[0], 0.3) * 0.85) / count);
      let y = d.size[1] / 2 + (row - (rows - 1) / 2) * Math.min(0.12, Math.max(d.size[1], 0.2) * 0.7 / rows);
      let z = d.size[2] / 2 + 0.006;
      let normal: Point3 = [0, 0, 1];
      if (p.panel === "rear") { z = -d.size[2] / 2 - 0.006; normal = [0, 0, -1]; }
      if (d.kind === "camera") { y = 1.28 + (row - (rows - 1) / 2) * 0.075; z = 0.193; normal = [0, 0, 1]; }
      else if (display) { y += d.position[1] < 0.3 && d.size[1] < 0.5 ? 1.1 : 0.08; z = -Math.max(d.size[2], 0.05) / 2 - 0.006; normal = [0, 0, -1]; }
      else if (d.kind === "laptop") { y = 0.013; z = 0; normal = [-1, 0, 0]; }
      else if (d.kind === "mic") { y = d.position[1] < 0.3 ? 1.39 : 0.03; z = d.position[1] < 0.3 ? -0.025 : 0.095; normal = [0, 0, d.position[1] < 0.3 ? -1 : 1]; }
      else if (d.position[1] < 0.3 && d.size[1] < 0.4) { y += 0.0; }
      if (p.panel === "side" && d.kind !== "mic") { z = lx; normal = [1, 0, 0]; }
      let x = d.kind === "laptop" ? -d.size[0] / 2 - 0.006 : p.panel === "side" && d.kind !== "mic" ? d.size[0] / 2 + 0.006 : lx;
      // Modelled hardware: the socket sits exactly where it is on the real panel (scaled uniformly with the model).
      const geo = equipmentVisualGeometry(d.modelId);
      const key = keyOf.get(p)!.slice(d.id.length + 1), at = geo?.ports[key];
      if (geo && at) {
        const k = geo.displayScale, o = d.mount?.offset ?? (d.kind==='mic'&&d.position[1]<.3?[0,1.39,0]:[0,0,0]);
        x = o[0] + at.at[0] * k + at.normal[0] * 0.006; y = o[1] + at.at[1] * k + at.normal[1] * 0.006; z = o[2] + at.at[2] * k + at.normal[2] * 0.006; normal = [...at.normal];
      }
      const zz = d.kind === "laptop" && !at ? (j - (owned.length - 1) / 2) * 0.06 : z;
      const [ox, oz] = turnBy(d.yaw ?? 0, x, zz);
      const [nx, nz] = turnBy(d.yaw ?? 0, normal[0], normal[2]);
      p.normal = [nx, normal[1], nz];
      p.position = [+(d.position[0] + ox).toFixed(4), +(d.position[1] + y).toFixed(4), +(d.position[2] + oz).toFixed(4)];
      p.radius = Math.min(0.035, 0.022 + Math.max(d.size[0], 0.2) * 0.005);
      if (geo && at) p.radius = +Math.min(p.radius, portClearance(geo, key) * 0.48).toFixed(4);
    });
  }
}

/**
 * Desk gear whose station sits at a furniture-top height is pulled fully onto that top (a box half off the edge of a desk
 * reads as floating), and gear sharing one top is spread along it so bodies never interpenetrate. Positions only — ids,
 * ports and cables are untouched, so saves stay valid. Rack shelves / cabinets (top ≠ device height) are not touched.
 */
function settleOnFurniture(layout: VenueLayout, devices: DeviceDef[], room: (typeof ROOMS)[VenueScale]) {
  const half = (d: DeviceDef): [number, number] => { const c = Math.abs(Math.cos(d.yaw ?? 0)), s = Math.abs(Math.sin(d.yaw ?? 0)); return [(d.size[0] * c + d.size[2] * s) / 2, (d.size[0] * s + d.size[2] * c) / 2]; };
  const groups = new Map<Furniture, DeviceDef[]>();
  for (const d of devices) {
    if (d.kind === "camera" || d.kind === "mic" || d.kind === "bodypack" || room.instances[d.id].mountedOn || d.position[1] < 0.3) continue;
    const [hx, hz] = half(d);
    const top = layout.furniture.filter((f) => Math.abs(f.size[1] - d.position[1]) < 0.03 && f.size[0] >= hx * 2 + 0.04 && f.size[2] >= hz * 2 + 0.04
      && Math.abs(d.position[0] - f.center[0]) <= f.size[0] / 2 + 0.35 && Math.abs(d.position[2] - f.center[2]) <= f.size[2] / 2 + 0.35)
      .sort((a, b) => Math.hypot(d.position[0] - a.center[0], d.position[2] - a.center[2]) - Math.hypot(d.position[0] - b.center[0], d.position[2] - b.center[2]))[0];
    if (!top) continue;
    groups.set(top, [...(groups.get(top) ?? []), d]);
  }
  for (const [f, list] of groups) {
    const longX = f.size[0] >= f.size[2], ax = longX ? 0 : 2;
    const ext = (d: DeviceDef) => half(d)[longX ? 0 : 1];
    // Spread along the long axis in the authored order (gap 3 cm), then keep the row inside the top.
    const row = [...list].sort((a, b) => a.position[ax] - b.position[ax]);
    for (let i = 1; i < row.length; i++) {
      const prev = row[i - 1], cur = row[i];
      const sameLane = Math.abs(prev.position[ax === 0 ? 2 : 0] - cur.position[ax === 0 ? 2 : 0]) < half(prev)[longX ? 1 : 0] + half(cur)[longX ? 1 : 0];
      const need = prev.position[ax] + ext(prev) + ext(cur) + 0.03;
      if (sameLane && cur.position[ax] < need) cur.position[ax] = +need.toFixed(4);
    }
    const hi = f.center[ax] + f.size[ax] / 2, lo = f.center[ax] - f.size[ax] / 2;
    const over = row.length ? row[row.length - 1].position[ax] + ext(row[row.length - 1]) + 0.02 - hi : 0;
    if (over > 0) for (const d of row) d.position[ax] = +(d.position[ax] - over).toFixed(4);
    // Still too long for one lane: use two lanes across the depth (rear lane / front lane) when both depths fit.
    const across = ax === 0 ? 2 : 0, depth = (d: DeviceDef) => half(d)[longX ? 1 : 0];
    if (row.length > 1 && row[0].position[ax] - ext(row[0]) < lo + 0.02) {
      const rear = row.filter((_, i) => i % 2 === 0), front = row.filter((_, i) => i % 2 === 1);
      const dr = Math.max(...rear.map(depth)), df = Math.max(...front.map(depth));
      if ((dr + df) * 2 + 0.06 <= f.size[across]) {
        for (const d of rear) d.position[across] = +(f.center[across] - f.size[across] / 2 + dr + 0.02).toFixed(4);
        for (const d of front) d.position[across] = +(f.center[across] + f.size[across] / 2 - df - 0.02).toFixed(4);
      }
    }
    for (const d of row) {
      const [hx, hz] = half(d);
      d.position[0] = +Math.min(f.center[0] + f.size[0] / 2 - hx - 0.02, Math.max(f.center[0] - f.size[0] / 2 + hx + 0.02, d.position[0])).toFixed(4);
      d.position[2] = +Math.min(f.center[2] + f.size[2] / 2 - hz - 0.02, Math.max(f.center[2] - f.size[2] / 2 + hz + 0.02, d.position[2])).toFixed(4);
    }
  }
}

/** Candidate service positions are geometric authoring aids, not walk-path verification. */
function annotateApproaches(scenario: Scenario) {
  const layout = LAYOUTS[scenario.layout!];
  const blockers = layoutObstacles(layout);
  const free = (p: Point3) => p[0] > layout.bounds.minX + 0.3 && p[0] < layout.bounds.maxX - 0.3 && p[2] > layout.bounds.minZ + 0.3 && p[2] < layout.bounds.maxZ - 0.3
    && !blockers.some((b) => Math.abs(p[0] - b.center[0]) < b.half[0] + 0.28 && Math.abs(p[2] - b.center[2]) < b.half[2] + 0.28);
  for (const port of Object.values(scenario.ports)) {
    const n = port.normal ?? [0, 0, 1];
    // Face-on first; top-facing sockets (no horizontal normal) and blocked faces fall back to a ring around the socket.
    const h = Math.hypot(n[0], n[2]);
    const dirs: [number, number][] = [...(h > 0.5 ? [[n[0] / h, n[2] / h] as [number, number]] : []), ...Array.from({ length: 8 }, (_, k) => [Math.sin(k * Math.PI / 4), Math.cos(k * Math.PI / 4)] as [number, number])];
    search: for (const [dx, dz] of dirs) for (const [distance, tangent] of [0.8, 1.05, 1.3, 1.55].flatMap((d) => [0, -0.4, 0.4, -0.8, 0.8].map((t) => [d, t]))) {
      const p: Point3 = [port.position[0] + dx * distance - dz * tangent, 0, port.position[2] + dz * distance + dx * tangent];
      if (free(p)) { port.approach = p; break search; }
    }
  }
}

/** Full world-axis footprint, including supplied breakout tails; never changes registry size or saved IDs. */
export function stagingFootprint(device: DeviceDef) {
  const geo = equipmentVisualGeometry(device.modelId);
  const bounds = geo?.stagingBounds;
  const k = geo?.displayScale ?? 1;
  const min = bounds ? bounds.min.map((v) => v * k) : [-device.size[0] / 2, 0, -device.size[2] / 2];
  const max = bounds ? bounds.max.map((v) => v * k) : [device.size[0] / 2, device.size[1], device.size[2] / 2];
  // The lavalier's captive lead reaches its existing training connector; include it in the shelf footprint.
  if(device.modelId==='generic-lav-mic') { min[0]=Math.min(min[0],-.025);max[0]=Math.max(max[0],.035);max[2]=Math.max(max[2],.11); }
  const c = Math.cos(device.yaw ?? 0), s = Math.sin(device.yaw ?? 0);
  const corners = [min[0], max[0]].flatMap((x) => [min[2], max[2]].map((z) => [x * c + z * s, -x * s + z * c]));
  const minX = Math.min(...corners.map(([x]) => x)), maxX = Math.max(...corners.map(([x]) => x));
  const minZ = Math.min(...corners.map(([, z]) => z)), maxZ = Math.max(...corners.map(([, z]) => z));
  return { minX, maxX, minZ, maxZ, width: maxX - minX, depth: maxZ - minZ };
}

/** Shelf packing uses true rotated visual extents, with a real gap between rows and between bodies. */
function packStorage(layoutId: LayoutId, items: DeviceDef[]): Point3[] {
  const s = LAYOUTS[layoutId].equipment, [w, d] = s.size ?? [1.4, 1.4], longX = w >= d, L = longX ? w : d, S = longX ? d : w;
  const footprints = new Map(items.map((it) => [it.id, stagingFootprint(it)]));
  const extent = (x: DeviceDef) => footprints.get(x.id)![longX ? "width" : "depth"];
  const depth = (x: DeviceDef) => footprints.get(x.id)![longX ? "depth" : "width"];
  // Keep the same category order in every level: image -> audio -> control -> monitor/record -> accessories.
  const categoryOrder: Record<string, number> = { camera: 0, source: 0, microphone: 1, mic: 1, "wireless-tx": 1, "wireless-rx": 1, mixer: 1,
    switcher: 2, controller: 2, router: 2, converter: 2, interface: 2, embedder: 2, display: 3, recorder: 3, capture: 3, ingest: 3, computer: 3, host: 3, encoder: 3, network: 3 };
  const category = (x: DeviceDef) => categoryOrder[x.equipmentRole ?? ""] ?? 4;
  const ordered = [...items].sort((a, b) => category(a) - category(b) || a.id.localeCompare(b.id));
  const rows: DeviceDef[][] = [[]];
  const pad = 0.04, gap = 0.035;
  let used = pad;
  for (const it of ordered) {
    if (extent(it) > L - 2 * pad || depth(it) > S - 2 * pad) throw new Error(`${layoutId}: prep table cannot support ${it.id}`);
    if (used + extent(it) > L - pad && rows[rows.length - 1].length) { rows.push([]); used = pad; }
    rows[rows.length - 1].push(it); used += extent(it) + gap;
  }
  const depths = rows.map((row) => Math.max(0, ...row.map(depth)));
  const totalDepth = depths.reduce((sum, value) => sum + value, 0) + gap * (rows.length - 1);
  if (totalDepth > S - 2 * pad) throw new Error(`${layoutId}: prep table needs ${totalDepth.toFixed(2)} m depth, has ${(S - 2 * pad).toFixed(2)}`);
  const out = new Map<string, Point3>();
  let acrossStart = -totalDepth / 2;
  rows.forEach((row, r) => {
    let at = -L / 2 + pad;
    const across = acrossStart + depths[r] / 2; acrossStart += depths[r] + gap;
    for (const it of row) {
      const c = at + extent(it) / 2; at += extent(it) + gap;
      const f = footprints.get(it.id)!, ox = (f.minX + f.maxX) / 2, oz = (f.minZ + f.maxZ) / 2;
      out.set(it.id, [+(s.center[0] + (longX ? c : across) - ox).toFixed(3), s.center[1], +(s.center[2] + (longX ? across : c) - oz).toFixed(3)]);
    }
  });
  return items.map((it) => out.get(it.id)!);
}

/** Cables are stored in tidy rows at the venue's cable location (every shelf level of a cable rack). */
function storeCables(layoutId: LayoutId, cables: CableDef[]) {
  const s = LAYOUTS[layoutId].cables, [w, dd] = s.size ?? [1.4, 1.4], long = w >= dd, L = long ? w : dd, S = long ? dd : w;
  const heights = [s.center[1], ...(s.levels ?? [])];
  const perRow = Math.max(1, Math.floor((L - 0.3) / 0.2));
  // Small kits belong on the open top shelf, centred in the service area. Splitting two
  // leads across all shelves hid the second plug behind an upper shelf in live ST-01 QA.
  const perLevel = cables.length <= perRow ? Math.max(1, cables.length) : Math.ceil(cables.length / heights.length);
  const rows = Math.max(1, Math.ceil(perLevel / perRow));
  cables.forEach((c, k) => {
    const shelf = Math.floor(k / perLevel), i = k % perLevel;
    const rowCount = Math.min(perRow, Math.min(perLevel, cables.length - shelf * perLevel) - Math.floor(i / perRow) * perRow);
    const along = (i % perRow - (rowCount - 1) / 2) * 0.2, across = -S / 2 + 0.15 + (Math.floor(i / perRow) + 0.5) * ((S - 0.3) / rows);
    const y = heights[shelf] + 0.06;
    const pt = (dl: number, da: number): Point3 => long ? [+(s.center[0] + along + dl).toFixed(3), y, +(s.center[2] + across + da).toFixed(3)] : [+(s.center[0] + across + da).toFixed(3), y, +(s.center[2] + along + dl).toFixed(3)];
    c.start = [pt(0, -0.04), pt(0.05, 0.04)];
  });
}

export const VENUE_SCENARIOS = Object.fromEntries(SCALES.flatMap((scale) => ([1, 2, 3, 4, 5] as const).map((level) => { const scenario = buildVenueScenario(scale, level); return [scenario.id, scenario]; }))) as Record<`${VenueScale}-${1 | 2 | 3 | 4 | 5}`, Scenario>;
