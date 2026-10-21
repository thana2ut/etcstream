// Documentation only: reads authored data, never creates runtime state, solves or plays a level.
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  return originalResolve.call(this, request.startsWith("@/") ? path.join(root, request.slice(2)) : request, parent, ...rest);
};
Module._extensions[".ts"] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  module._compile(output, filename);
};
const load = createRequire(import.meta.url);
const { VENUE_SCENARIOS } = load("../game/training/venue-scenarios.ts");
const { MODELS } = load("../game/training/sim/equipment.ts");
const { LAYOUTS } = load("../game/training/venue-layouts.ts");
const { catalogIdFor } = load("../game/content/cable-catalog.ts");
const { classroomCableRoute } = load("../game/training/cable-route.ts");
const cell = (value) => String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ");
const table = (head, rows) => `| ${head.join(" | ")} |\n| ${head.map(() => "---").join(" | ")} |\n${rows.map((row) => `| ${row.map(cell).join(" | ")} |`).join("\n")}\n`;
const scenarios = Object.values(VENUE_SCENARIOS);
const pending = {
  xs: "DESIGN_REFERENCE: reconciled with Appendix A classroom and the handoff. Existing camera/slides, independent PA/AUX and USB webcam topology retained.",
  s: "BLOCKED SPEC: studio camera outputs, HDS7105 revision/ports and capture USB device-end shape require external evidence. Existing training profile retained; no new manufacturer claim.",
  m: "DESIGN_REFERENCE: selected analog six-channel training stagebox/console; full level has podium, two wireless handhelds and two lavs. Existing SDI capture route is the explicitly selected streaming alternative. Exact PTZ controller/protocol and surveyed hardware remain unresolved.",
  l: "DESIGN_REFERENCE: near SDI / matched field optical pair, wireless/shotgun/ambience, independent PA/broadcast, powered audio embedder and SDI encoder/network/ingest implemented in active manifests. Exact optical connector/wavelength/vendor protocol and real breakout geometry remain unresolved.",
  xl: "DESIGN_REFERENCE: six matched camera/base links, eight-source crosspoint router, separate switcher, replay controller, six-channel analog stage transport, PA/broadcast, recorder, venue output and two encoder/network/ingest chains implemented. PARTIAL REDUNDANCY: switcher/production/power remain shared. Tally/intercom hardware and real control-link connector/protocol remain unresolved.",
};
let matrix = `# Mission equipment, port and cable matrix\n\nGenerated from existing authored scenario data by \`node scripts/generate-mission-completeness-docs.mjs\`. This is a manifest export, NOT a test, solver or runtime acceptance result.\n\n**Manifest export only; see MISSION_25_ADMIN_AND_CODE_AUDIT_TH.md for separate browser and automated results.** Reconciled with the original Appendix A and 2026-10-20 technical handoff preserved unmodified in \`docs/references/\`. Generic training profiles implement documented role-level topology, not vendor pinouts or campus inventory. S remains PROVISIONAL. Shapes/coordinates and cable run lengths are virtual design choices.\n\n`;
matrix += table(["Level", "Scenario", "Devices", "Ports", "Required leads", "Spare leads", "Distractors", "Authoring issues", "Reference status"], scenarios.map((s) => [s.stage.id, s.id, s.devices.length, Object.keys(s.ports).length, s.cables.filter((c) => c.stockRole === "required").length, s.cables.filter((c) => c.stockRole === "spare").length, s.cables.filter((c) => c.stockRole === "distractor").length, s.designIssues?.join("; ") || "No structural issue reported (not acceptance)", s.referenceStatus]));
for (const s of scenarios) {
  const stage = s.stage;
  matrix += `\n## ${stage.id} / ${s.id}\n\nTopology: \`${s.selectedTopologyId}\`. Reference pointers: ${s.appendixReferenceIds.join(", ")}.\n\n${pending[s.venueScale]}\n\nWork order: ${stage.ticket}\n\n`;
  matrix += table(["Device", "Model/profile", "Evidence", "Placement", "Fixed/movable", "Control state to demonstrate"], s.devices.map((d) => [d.id, d.model, d.status, `${d.zoneLabel}; (${d.position.join(", ")}) yaw ${d.yaw}`, s.placeables.some((p) => p.id === d.id) ? "Movable" : "Fixed", stage.solutionConfig.filter((c) => c.device === d.id).map((c) => `${c.key}=${c.value}`).join("; ")]));
  matrix += "\n### Required physical graph (one unique cable per edge)\n\n";
  matrix += table(["Cable ID", "Source / real label", "Destination / real label", "End A", "End B", "Signal", "Length m", "Catalog group"], s.canonical.map((e) => {
    const c = s.cables.find((c) => c.id === e.cableId);
    return [c.id, `${e.from} / ${s.ports[e.from].label}`, `${e.to} / ${s.ports[e.to].label}`, ...c.ends, c.signalClass, s.cableMeta[c.id].lengthM, catalogIdFor(c)];
  }));
  matrix += "\n### Additional stock\n\n" + table(["ID", "Label", "Ends", "Role", "Length m"], s.cables.filter((c) => c.stockRole !== "required").map((c) => [c.id, c.label, c.ends.join(" ↔ "), c.stockRole, s.cableMeta[c.id].lengthM]));
  matrix += "\n### All selectable ports (capacity: one physical cable per port)\n\n";
  matrix += table(["Port", "Label", "Direction", "Connector", "Signal", "Panel", "Anchor", "Service position candidate"], Object.entries(s.ports).map(([id, p]) => {
    const definition = MODELS[s.simDevices[p.device].model].ports.find((x) => `${p.device}:${x.key}` === id);
    return [id, p.label, p.direction, p.connector, definition.sig, p.panel, p.position.join(", "), p.approach?.join(", ") ?? "NEEDS HUMAN ACCESS REVIEW"];
  }));
  const wireless = Object.entries(s.simDevices).filter(([, d]) => d.pairWith);
  matrix += `\nWireless (no physical cable): ${wireless.map(([id, d]) => `${d.pairWith} ~RF~ ${id}`).join("; ") || "None authored"}. Network and capture software remain local simulation only.\n\n### Signal and commissioning gates\n\n`;
  matrix += table(["ID", "Layer", "Predicate label", "Critical"], stage.objectives.map((o) => [o.id, o.stage, o.label, Boolean(o.critical)]));
  matrix += `\nPreinstalled leads: ${s.initialConnections.map((e) => `${e.cableId}: ${e.from} → ${e.to}`).join("; ") || "None"}. Faults: ${(stage.faults ?? []).map((f) => f.id).join(", ") || "None"}.\n\nSuccess requires live objectives, deliberate sequential system tests, quiz and sign-off; no minimum cable-count bypass. Saved files/cue history are historical evidence, while current signal predicates remain live.\n`;
}
fs.writeFileSync(path.join(root, "docs/missions/MISSION_25_EQUIPMENT_PORT_CABLE_MATRIX.md"), matrix);
let zones = "# Scene work zones and interaction anchors\n\nGenerated from the mission scenario/layout data; Manifest export only — results in MISSION_25_ADMIN_AND_CODE_AUDIT_TH.md. Coordinates and proportional shells are training design, not measured hardware or campuses. Free-practice studio data is not modified.\n\n";
for (const scale of ["xs", "s", "m", "l", "xl"]) {
  const s = scenarios.find((s) => s.venueScale === scale && s.level === 5);
  const l = LAYOUTS[s.layout];
  zones += `## ${scale.toUpperCase()} / ${s.layout}\n\nSpawn: ${l.spawn.join(", ")}; yaw ${l.spawnYaw}. Bounds: ${JSON.stringify(l.bounds)}.\n\nZones: ${l.zones.join("; ")}. Equipment storage: ${l.equipment.center.join(", ")}; cable storage: ${l.cables.center.join(", ")}.\n\n`;
  zones += table(["Device", "Zone", "Transform", "Port count", "Approach candidates / all ports"], s.devices.map((d) => {
    const ports = Object.values(s.ports).filter((p) => p.device === d.id);
    return [d.id, d.zoneLabel, `${d.position.join(", ")}; yaw ${d.yaw}`, ports.length, `${ports.filter((p) => p.approach).length}/${ports.length}`];
  }));
}
zones += `\n## Contract and limitations\n\n- Keep device ID, port ID, transform and outward normal stable when replacing procedural shells with GLBs. Port sockets/interaction/cable tips read the same anchors. Portable anchors transform with placed/rotated gear.\n- Panel groups use per-panel indices, avoiding overlaps between front input and rear output rows. Generic shells reserve room for independent targets. Camera/laptop/display anchors use existing visual adapters.\n- Service candidates are 0.8–1.55 m outward from anchors, within room bounds, with 0.28 m collider clearance. This checks a point, NOT the complete path, line of sight, body sweep, step height or reach. Missing candidates remain explicit above.\n- Existing furniture, lighting, fantasy art and collision geometry are retained. No global camera teleport, room resizing or collision bypass was added.\n- Walk every mandatory port and storage shelf in later human QA. A candidate must never be treated as proof of physical accessibility.\n`;
fs.writeFileSync(path.join(root, "docs/venues/SCENE_WORK_ZONES_AND_INTERACTION_ANCHORS.md"), zones);
const edgeReferences = (scenario, edge) => {
  const device = edge.from.split(":")[0];
  const model = MODELS[scenario.simDevices[device].model];
  const signal = model.ports.find((p) => `${device}:${p.key}` === edge.from)?.sig;
  if (model.appendixReferenceIds?.length) return model.appendixReferenceIds;
  if (signal === "USB_UVC") return scenario.venueScale === "s" ? ["R04", "R05"] : ["R01", "R04"];
  if (["MIC", "LINE_BAL", "LINE_UNBAL", "HEADPHONE"].includes(signal)) return ["R10", "R11", "R12"];
  if (["WAN", "ETHERNET"].includes(signal)) return ["R06", "R13"];
  if (signal === "MULTICORE") return ["R10", "R14"];
  if (model.role === "converter") return ["R08"];
  return scenario.venueScale === "xs" ? ["R01"] : scenario.venueScale === "s" ? ["R04", "R08"] : scenario.venueScale === "m" ? ["R02", "R08"] : ["R03", "R07", "R09"];
};
const materials = scenarios.map((s) => ({
  scenarioId: s.id, stageId: s.stage.id, topologyId: s.selectedTopologyId, status: s.referenceStatus,
  appendixReferenceIds: s.appendixReferenceIds, unresolvedHardware: s.stage.unresolvedHardware ?? [], runtimeStatus: "Manifest export only — results in MISSION_25_ADMIN_AND_CODE_AUDIT_TH.md",
  equipment: s.devices.map((d) => {
    const placeable = s.placeables.find((p) => p.id === d.id);
    const model = MODELS[s.simDevices[d.id].model];
    return { requiredNodeId: d.id, thaiName: d.label, role: model.role, sourceConfidence: d.status, displayModelKind: "training placeholder", isFixed: !placeable,
      storedAt: placeable?.start ?? d.position, installedAt: d.position, yaw: d.yaw, zone: d.zoneLabel,
      reachableInteractionAnchor: Object.entries(s.ports).filter(([, p]) => p.device === d.id).map(([id, p]) => ({ portId: id, anchor: p.position, approachCandidate: p.approach ?? null })),
      opticalPeer: s.simDevices[d.id].opticalPeer, failureDomain: s.simDevices[d.id].failureDomain,
    };
  }),
  ports: Object.entries(s.ports).map(([id, p]) => {
    const definition = MODELS[s.simDevices[p.device].model].ports.find((x) => `${p.device}:${x.key}` === id);
    return { portId: id, physicalConnector: p.connector, direction: p.direction,
      linkRole: p.linkRole ?? definition.sig,
      signalKind: definition.sig, format: definition.formats, availableCapacity: 1, panel: p.panel, anchor: p.position,
      manufacturerProofOrGenericTrainingProfile: s.devices.find((d) => d.id === p.device)?.status,
      physicalPortConfirmation: ["FIBER", "CONTROL"].includes(p.connector) || s.venueScale === "s" ? "PENDING_PHYSICAL_PORT_CONFIRMATION" : "DESIGN_REFERENCE",
    };
  }),
  edges: s.canonical.map((edge) => {
    const cable = s.cables.find((c) => c.id === edge.cableId);
    return { edgeId: `${s.id}/${edge.cableId}`, ...edge, required: true, cableType: catalogIdFor(cable), cableCount: 1, ends: cable.ends,
      signal: cable.signalClass, lengthM: s.cableMeta[cable.id].lengthM, cableStorageLocation: cable.start,
      routeWaypoints: classroomCableRoute(s.ports[edge.from].position, s.ports[edge.to].position, s.layout), referenceIds: edgeReferences(s, edge),
      downstreamAssertions: s.stage.objectives.filter((o) => o.stage === "signal" || o.stage === "delivery").map((o) => o.id),
    };
  }),
  wirelessLinks: Object.entries(s.simDevices).filter(([, d]) => d.pairWith).map(([receiver, d]) => ({ transmitter: d.pairWith, receiver, type: "RF_PAIRING", cableCount: 0 })),
  logicalActions: s.stage.solutionConfig, initialFaults: s.stage.faults?.map((f) => ({ id: f.id, label: f.label, config: f.config, unplug: f.unplug, repatch: f.repatch })) ?? [],
  completionPredicates: s.stage.objectives.map(({ id, label, stage, critical }) => ({ id, label, stage, critical })),
}));
fs.writeFileSync(path.join(root, "docs/missions/MISSION_25_BILL_OF_MATERIALS.json"), `${JSON.stringify(materials, null, 2)}\n`);
let sources = "# Mission signal-flow source matrix\n\nReconciled against the original Appendix A and 2026-10-20 handoff in `docs/references/`. References establish example capabilities/educational topology, never campus ownership. Original stage definitions are retained as `ORIGINAL_STAGES`; active manifests use the reference reconciliation layer. Manifest export only — results in MISSION_25_ADMIN_AND_CODE_AUDIT_TH.md.\n\n";
for (const s of scenarios) {
  sources += `## ${s.stage.id}\n\n${pending[s.venueScale]}\n\n`;
  sources += table(["Node", "Profile", "Evidence status", "Appendix section"], s.devices.map((d) => [d.id, s.simDevices[d.id].model, d.status, s.venueScale === "xs" ? "Classroom selected system" : s.venueScale === "s" ? "Studio instructor-described route" : s.venueScale === "m" ? "Auditorium canonical video/audio" : s.venueScale === "l" ? "Outdoor canonical transport/audio" : "Stadium canonical field/video/audio"]));
  sources += "\n" + table(["Physical edge", "Cable", "Signal", "References", "Scope"], s.canonical.map((edge) => {
    const cable = s.cables.find((c) => c.id === edge.cableId);
    return [`${edge.from} → ${edge.to}`, cable.ends.join(" ↔ "), cable.signalClass, edgeReferences(s, edge).join(", "), ["FIBER", "CONTROL"].includes(cable.ends[0]) ? "Role-level training only; exact connector/protocol UNKNOWN" : s.referenceStatus];
  }));
}
fs.writeFileSync(path.join(root, "docs/missions/MISSION_SIGNAL_FLOW_SOURCE_MATRIX.md"), sources);
let overview = "# หอจารึกแห่งภารกิจ — 5 สถานที่ × 5 ระดับ\n\nข้อมูลปัจจุบันสร้างจากกราฟที่เกมใช้จริง เทียบ Appendix A และเอกสารส่งมอบวันที่ 20 ตุลาคม 2026 แล้วในระดับแบบระบบฝึก ไม่ใช่การยืนยันอุปกรณ์จริงของสถานที่\n\n**ไฟล์นี้เป็นข้อมูลนิยาม ไม่ใช่ผลทดลองเล่น ดูผลตรวจล่าสุดใน MISSION_25_ADMIN_AND_CODE_AUDIT_TH.md** นิยามเก่าคงอยู่ใน `ORIGINAL_STAGES` และ `ROOMS`; ชุดที่ใช้ใน Mission Hall อ่าน `STAGES` และ `MISSION_ROOMS` ห้องฝึกอิสระไม่ได้ใช้ชั้นปรับนี้\n\n";
overview += table(["ด่าน", "ภารกิจ", "อุปกรณ์", "พอร์ต", "สายบังคับ", "สถานะอ้างอิง"], scenarios.map((s) => [s.stage.id, s.stage.ticket, s.devices.length, Object.keys(s.ports).length, s.canonical.length, s.referenceStatus]));
overview += "\nรายละเอียดรายอุปกรณ์ พอร์ต สายทั้งสองปลาย จำนวน ชั้นจัดเก็บ ตำแหน่งติดตั้ง และเงื่อนไขผ่านทุกด่าน: [ตารางครบ 25 ด่าน](MISSION_25_EQUIPMENT_PORT_CABLE_MATRIX.md), [ข้อมูลสำหรับเครื่อง](MISSION_25_BILL_OF_MATERIALS.json), [โซนและพอร์ต](SCENE_WORK_ZONES_AND_INTERACTION_ANCHORS.md)\n\n";
overview += "อุปกรณ์พกพาต้องนำจากคลังไปวางที่จุดใช้งาน ส่วนกล้อง ฐานรับ เราเตอร์ คอนโซล จอ PA และตู้ส่งที่ติดตั้งประจำต้องต่อและตั้งค่าเอง ไม่ให้ถือทั้งตู้ งานอนาล็อกเลือก Stagebox/Multicore อย่างชัดเจน ไม่อ้างว่า Ethernet เป็น Dante\n\n";
overview += "S ยังรอรุ่นกล้อง/พอร์ต HDS7105/การแยกช่อง RX และหัว USB ฝั่ง Capture จริง ส่วน Optical และ Replay ใช้จุดต่อแบบฝึกที่ระบุความไม่แน่นอน ไม่อ้างชนิดขั้วต่อ ความยาวคลื่น หรือโปรโตคอลผู้ผลิต ข้อมูล Tally/Intercom/PTZ-control จริงยังรอยืนยันจึงไม่เพิ่มพอร์ตสมมติ\n\nXL แยกสายภาพและเกตเวย์สองเส้นทาง แต่แหล่งผลิตและไฟเลี้ยงยังร่วมกัน จึงเป็นการสำรองบางส่วน ห้ามอ้างว่าสำรองสมบูรณ์\n";
fs.writeFileSync(path.join(root, "docs/missions/MISSION_HALL_5_CHAPTERS_25_LEVELS.md"), overview);
fs.writeFileSync(path.join(root, "docs/missions/MISSION_HALL_EQUIPMENT_PLACEMENT_AND_STOCK.md"), `${overview}\n\n## การวางอุปกรณ์และสต็อกตามกราฟ\n\n${zones}`);
let inventory = "# Equipment inventory — selected training profiles\n\nCurrent inventory reconciled against original Appendix A and handoff. Not campus ownership, not verified rear-panel replicas. Manifest export only — results in MISSION_25_ADMIN_AND_CODE_AUDIT_TH.md. Counts/ports and selected optional branches are per-stage in `MISSION_25_EQUIPMENT_PORT_CABLE_MATRIX.md` and `MISSION_25_BILL_OF_MATERIALS.json`.\n\n";
for (const scale of ["xs", "s", "m", "l", "xl"]) {
  const levels = scenarios.filter((s) => s.venueScale === scale);
  const union = new Map();
  for (const s of levels) for (const d of s.devices) if (!union.has(d.id)) union.set(d.id, d);
  inventory += `## ${scale.toUpperCase()}\n\n${pending[scale]}\n\n`;
  inventory += table(["ID", "Thai label", "Model/profile", "Role", "Status", "Active levels"], [...union.values()].map((d) => {
    const sample = levels.find((s) => s.simDevices[d.id]);
    const model = MODELS[sample.simDevices[d.id].model];
    return [d.id, d.label, model.modelId, model.role, d.status, levels.filter((s) => s.simDevices[d.id]).map((s) => s.level).join(", ")];
  }));
}
fs.writeFileSync(path.join(root, "docs/hardware-3d/EQUIPMENT_INVENTORY.md"), inventory);
console.log("Exported 25 authored manifests and five venue zone tables; no gameplay or tests executed.");
