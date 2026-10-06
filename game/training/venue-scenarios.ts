import type { ActionDef, CableDef, Connector, DeviceDef, FlowGroup, Point3, PortDef, Scenario, SignalType, VenueScale } from "./scenarios";
import { LAYOUTS, surfaceSlots, type LayoutId } from "./venue-layouts";

const LAYOUT_BY_SCALE: Record<VenueScale, LayoutId> = { xs: "classroom", s: "studio", m: "auditorium", l: "outdoor", xl: "stadium" };
/** What the technician physically carries in each venue (everything else is installed / semi-fixed). */
const PORTABLE: Record<VenueScale, (id: string) => boolean> = {
  xs: (id) => ["sw", "mix", "capture", "rx"].includes(id) || id.startsWith("tx"),
  s: (id) => ["capture", "rx"].includes(id) || id.startsWith("tx") || id.startsWith("convert"),
  m: (id) => ["rx", "mic2"].includes(id) || id.startsWith("tx"),
  l: (id) => ["fiber-tx", "fiber-rx", "encoder", "monitor", "rx"].includes(id) || id.startsWith("tx"),
  xl: (id) => id === "rx" || id.startsWith("tx"),
};

export const LEVEL_TITLES = ["เส้นทางภาพ · Video Path", "เส้นทางเสียง · Audio Path", "สลับภาพและตรวจสัญญาณ", "พอร์ตและการแก้ปัญหา", "ระบบ Production ครบเส้นทาง"];
const SCALES: VenueScale[] = ["xs", "s", "m", "l", "xl"];
const SWITCHERS = ["Mini HDMI Video Switcher", "DeviceWell HDS7105", "Production SDI Video Switcher", "Portable Field Video Switcher", "Broadcast Production Switcher"];
const MIXERS = ["Small 4-channel Audio Mixer", "PMX-402D-USB chassis", "Digital Audio Mixer", "Field Audio Mixer", "Digital Audio Console"];
const PLUGS: Partial<Record<Connector, NonNullable<CableDef["plugs"]>[number]>> = { HDMI: "hdmi", SDI: "sdi", "XLR-F": "xlr-f", "XLR-M": "xlr-m", "3.5mm": "trs35", "6.35mm": "trs635", "USB-A": "usba3", "USB-C": "usbc", FIBER: "fiber", ETHERNET: "ethernet" };
const plug = (c: Connector) => PLUGS[c] ?? "dp";
const signal = (c: Connector): SignalType => c === "HDMI" ? "VIDEO_HDMI" : c === "SDI" ? "VIDEO_SDI" : c === "FIBER" ? "FIBER_VIDEO" : c === "ETHERNET" ? "NETWORK" : c.startsWith("USB") ? "USB_DATA" : c.startsWith("XLR") ? "AUDIO_BALANCED" : "AUDIO_ANALOG";

/** One authored graph per scale, sliced by learning objective. No React-specific rules. */
export function buildVenueScenario(scale: VenueScale, level: 1 | 2 | 3 | 4 | 5, studioTransport: "HDMI" | "SDI" = "HDMI"): Scenario {
  const index = SCALES.indexOf(scale), studio = scale === "s", broadcast = scale === "xl", field = scale === "l";
  const video: Connector = index < 2 ? "HDMI" : "SDI";
  const devices: Record<string, DeviceDef> = {};
  const ports: Record<string, PortDef> = {};
  const requirements: Scenario["requirements"] = [];
  const actions: ActionDef[] = [];
  const cables: CableDef[] = [];
  const canonical: NonNullable<Scenario["canonical"]> = [];
  const movable = new Set<string>();
  function device(id: string, label: string, kind: DeviceDef["kind"] = "box", carry = false) {
    if (devices[id]) return;
    devices[id] = { id, label, model: "GENERIC TRAINING MODEL", status: "GENERIC TRAINING MODEL", generic: true, verified: false, kind, position: [0, 0.78, 0], size: kind === "camera" ? [0.32, 1.5, 0.45] : kind === "mic" ? [0.08, 0.08, 0.25] : kind === "laptop" ? [0.5, 0.04, 0.32] : [0.48, 0.18, 0.3], color: "#263345" };
    if (/Monitor|Wall|TV|Screen|Display|Destination/.test(label)) devices[id].size = [0.52, 0.32, 0.08];
    void carry;
    if (PORTABLE[scale](id)) movable.add(id);
  }
  function port(id: string, direction: "INPUT" | "OUTPUT", connector: Connector) {
    if (ports[id]) {
      if (ports[id].direction !== direction || ports[id].connector !== connector) throw new Error(`Conflicting port definition: ${id}`);
      return;
    }
    const [owner, name] = id.split(":");
    ports[id] = { device: owner, label: `${devices[owner].label} ${name.toUpperCase()}`, direction, connector, signalType: signal(connector), purpose: "scenario route", position: [0, 1, 0], radius: 0.055, ...(movable.has(owner) ? { requiresItem: owner } : {}) };
  }
  function route(id: string, from: string, to: string, connector: Connector, group: FlowGroup, other: Connector = connector) {
    port(from, "OUTPUT", connector); port(to, "INPUT", other);
    requirements.push({ id, label: `${devices[ports[from].device].label} → ${devices[ports[to].device].label}`, group, from: [from], to: [to], verified: false });
    const ends: [Connector, Connector] = [connector === "XLR" ? "XLR-F" : connector, other === "XLR" ? "XLR-M" : other];
    const cableId = `lead-${id}`;
    cables.push({ id: cableId, label: `${connector}${connector === other ? "" : ` → ${other}`} · ${id}`, ends, plugs: [plug(ends[0]), plug(ends[1])], signalType: signal(connector), purpose: id, color: group === "audio" ? "#50b899" : connector === "FIBER" ? "#ed953f" : "#72aadd", start: [[0, 0, 0], [0, 0, 0]] });
    canonical.push({ cableId, from, to });
  }
  function action(id: string, label: string, owner: string, needs: string[], group: FlowGroup, source?: string) {
    actions.push({ id, label, doneLabel: `${label} · พร้อม`, needs, group, position: [0, 1, 0], ...(movable.has(owner) ? { onItem: owner } : {}), source });
    actionOwners[id] = owner;
  }
  const actionOwners: Record<string, string> = {};
  device("sw", SWITCHERS[index], "box", index < 2 || field);
  device("mix", MIXERS[index], "mixer", index < 2 || field);
  if (studio) {
    Object.assign(devices.sw, { status: "CONFIRMED", model: "DeviceWell HDS7105", verified: true });
    Object.assign(devices.mix, { status: "CONFIRMED", model: "PMX-402D-USB chassis", verified: true });
  }
  const videoIds: string[] = [];
  const cameraCount = scale === "xs" ? 1 : broadcast ? 6 : scale === "m" ? 4 : 3;
  if (broadcast) { device("ccu", "Fiber Base Station / CCU rack"); device("router", "SDI Video Router"); }
  for (let i = 1; i <= cameraCount; i++) {
    const id = `cam${i}`;
    device(id, `${broadcast ? "Broadcast" : field ? "Field / ENG" : scale === "m" && i === 4 ? "PTZ" : "Camera"} ${i}`, "camera");
    if (broadcast && i === 5) devices[id].label = "Long-lens Camera 5";
    if (broadcast && i === 6) devices[id].label = "Field Camera 6";
    if (studio) Object.assign(devices[id], { status: "PROVISIONAL", model: "Studio Camera · รุ่น/HDMI/SDI รอยืนยัน" });
    if (broadcast) {
      route(`fiber-${i}`, `${id}:fiber-out`, `ccu:fiber-in${i}`, "FIBER", "video");
      route(`ccu-${i}`, `ccu:sdi-out${i}`, `router:input${i}`, "SDI", "video");
      route(`cam-${i}`, `router:output${i}`, `sw:input${i}`, "SDI", "video");
      videoIds.push(`fiber-${i}`, `ccu-${i}`);
    } else if (studio && studioTransport === "SDI") {
      device(`convert${i}`, `SDI → HDMI Converter ${i}`, "box", true);
      route(`convert-${i}`, `${id}:sdi-out`, `convert${i}:sdi-in`, "SDI", "video");
      route(`cam-${i}`, `convert${i}:hdmi-out`, `sw:input${i}`, "HDMI", "video");
      videoIds.push(`convert-${i}`);
    } else if (field && i === 1) {
      device("fiber-tx", "SDI Fiber TX", "box", true); device("fiber-rx", "SDI Fiber RX", "box", true);
      route("field-tx", `${id}:sdi-out`, "fiber-tx:sdi-in", "SDI", "video");
      route("fiber-link", "fiber-tx:fiber-out", "fiber-rx:fiber-in", "FIBER", "video");
      route(`cam-${i}`, "fiber-rx:sdi-out", `sw:input${i}`, "SDI", "video");
      videoIds.push("field-tx", "fiber-link");
    } else route(`cam-${i}`, `${id}:video-out`, `sw:input${i}`, video, "video");
    videoIds.push(`cam-${i}`);
  }
  if (scale === "xs" || scale === "m") {
    device("slides", "Presentation Laptop", "laptop", true);
    route("slides", "slides:hdmi-out", "sw:presentation-in", "HDMI", "video");
  }
  if (broadcast) {
    device("replay", "Replay Server"); device("graphics", "Graphics Workstation");
    route("replay", "replay:sdi-out", "sw:replay-in", "SDI", "video");
    route("graphics", "graphics:sdi-out", "sw:graphics-in", "SDI", "video");
    device("preview", "Preview Monitor");
    route("preview", "sw:preview-out", "preview:sdi-in", "SDI", "monitor");
    route("replay-record", "sw:record-out", "replay:record-in", "SDI", "monitor");
  }
  device("monitor", broadcast ? "Multiview Wall" : scale === "xs" ? "Classroom Projector / TV" : "Multiview Monitor");
  // XS: the mini switcher has no multiview; its second PROGRAM / HDMI OUT feeds the classroom display.
  route("monitor", scale === "xs" ? "sw:pgm-hdmi-out2" : "sw:multiview-out", "monitor:video-in", video, "monitor");
  if (index >= 2 && !field) {
    device("display", scale === "m" ? "LED Program Screen" : "Venue Display");
    route("display", "sw:aux-out", "display:sdi-in", "SDI", "monitor");
  }
  // Wireless link is explicitly paired in software; never represented as a physical cable.
  const lavCount = studio ? 2 : 1;
  device("rx", "Wireless Receiver", "bodypack", true);
  if (studio) Object.assign(devices.rx, { status: "PROVISIONAL", model: "COMICA CVM-WM100 PLUS family / Saramonic · รอยืนยัน" });
  const lavIds: string[] = [];
  for (let i = 1; i <= lavCount; i++) {
    device(`lav${i}`, "Lavalier " + i, "mic"); device(`tx${i}`, "Wireless TX " + i, "bodypack", true);
    if (studio) Object.assign(devices[`tx${i}`], { status: "PROVISIONAL", model: "COMICA / Saramonic · รอยืนยัน" });
    route(`lav-${i}`, `lav${i}:audio-out`, `tx${i}:mic-in`, "3.5mm", "audio");
    lavIds.push(`lav-${i}`);
  }
  action("wireless-pair", "จับคู่ TX / RX จำลอง", "rx", lavIds, "audio");
  if (scale === "m") {
    // Generic analog stagebox, independent balanced XLR channels: no invented digital protocol.
    device("stagebox", "Analog XLR Stagebox");
    for (const [i, name] of ["Wireless RX", "Podium Microphone", "Handheld Microphone"].entries()) {
      const owner = i === 0 ? "rx" : `mic${i}`;
      if (i) device(owner, name, "mic");
      route(`stage-in${i}`, `${owner}:xlr-out`, `stagebox:input${i}`, "XLR", "audio");
      route(`stage-out${i}`, `stagebox:output${i}`, `mix:input${i}`, "XLR", "audio");
    }
  } else {
    route("rx-mix", "rx:audio-out", "mix:input1", index < 2 ? "3.5mm" : "XLR", "audio", index < 2 ? "6.35mm" : "XLR");
    const extra = broadcast ? ["Commentator Mic 1", "Commentator Mic 2", "Crowd Mic L", "Crowd Mic R", "Field Mic"] : field ? ["Shotgun Microphone", "Ambient Microphone"] : [];
    extra.forEach((name, i) => { device(`mic${i}`, name, "mic"); route(`mic-${i}`, `mic${i}:xlr-out`, `mix:input${i + 2}`, "XLR", "audio"); });
  }
  route("mix-program", "mix:program-out", "sw:audio-in", index < 2 ? "6.35mm" : "XLR", "audio", index < 2 ? "3.5mm" : "XLR");
  const audioIds = requirements.filter(r => r.group === "audio").map(r => r.id);
  action("mix-ready", "ตั้ง Gain / Fader และยกเลิก Mute", "mix", [...audioIds, "wireless-pair"], "audio");
  if (index < 3) {
    device("capture", "Capture Card", "box", true); device("pc", studio ? "HP Notebook / OBS" : "Streaming Computer / OBS", "laptop", true);
    if (studio) Object.assign(devices.pc, { generic: false, status: "PROVISIONAL", model: "HP 15.6-inch ตามภาพอ้างอิง · SKU รอยืนยัน" });
    if (studio) Object.assign(devices.capture, { generic: false, verified: true, status: "VERIFIED", model: "Magewell USB Capture HDMI Gen 2", size: [0.3072, 0.048, 0.1344], color: "#adafac" });
    route("program-capture", "sw:pgm-out", "capture:video-in", video, "capture");
    route("capture-pc", "capture:usb-out", "pc:usb-in", studio ? "USB-A" : "USB-C", "capture", "USB-A");
    action("obs-ready", "OBS จำลอง: เลือก Capture และตรวจภาพ/เสียง", "pc", [...videoIds, ...audioIds, "mix-ready", "program-capture", "capture-pc"], "capture");
  } else {
    device("encoder", "Main Hardware Encoder", "box", true); device("network", field ? "4G / 5G Router" : "Primary Network"); device("live", "Live Destination (simulation)");
    route("program-encode", "sw:pgm-out", "encoder:sdi-in", "SDI", "capture");
    route("network", "encoder:network-out", "network:lan-in", "ETHERNET", "capture");
    route("destination", "network:wan-out", "live:network-in", "ETHERNET", "capture");
    action("network-ready", "ตรวจเครือข่ายจำลอง / คืนการเชื่อมต่อ", "network", ["network", "destination"], "capture");
    action("encoder-ready", "เริ่ม Encoder จำลองและตรวจ Program", "encoder", [...videoIds, ...audioIds, "mix-ready", "program-encode", "network-ready"], "capture");
    if (broadcast) {
      device("backup", "Backup Encoder"); device("backup-net", "Backup Network");
      route("backup-encode", "sw:backup-pgm-out", "backup:sdi-in", "SDI", "capture");
      route("backup-network", "backup:network-out", "backup-net:lan-in", "ETHERNET", "capture");
      route("backup-live", "backup-net:wan-out", "live:backup-in", "ETHERNET", "capture");
      action("backup-ready", "ตรวจเส้นทางสำรองจำลอง", "backup", ["encoder-ready", "backup-encode", "backup-network", "backup-live"], "capture");
    }
  }
  // Several hops can join the same two devices (6 cameras → CCU → router): disambiguate those hints with the port pair.
  const seen = new Map<string, number>();
  for (const r of requirements) seen.set(r.label, (seen.get(r.label) ?? 0) + 1);
  for (const r of requirements) if ((seen.get(r.label) ?? 0) > 1) r.label = `${r.label} (${r.from[0].split(":")[1].toUpperCase()} → ${r.to[0].split(":")[1].toUpperCase()})`;
  const sourceRoutes = requirements.filter(r => r.to.some(p => p.startsWith("sw:") && (p.includes("input") || p.includes("presentation") || p.includes("replay") || p.includes("graphics"))));
  sourceRoutes.forEach(r => action(`select-${r.id}`, `เลือก Program: ${r.id.startsWith("cam-") ? `Camera ${r.id.slice(4)}` : devices[ports[r.from[0]].device].label}`, "sw", [...videoIds.filter(id => id !== r.id), r.id, "monitor"], "video", r.id));

  // Retain only equipment actually involved in this lesson. L4 starts with safe preconnected routes and missing links.
  const selected = requirements.filter(r => level >= 4 || level === 1 && (r.group === "video" && !["slides", "replay", "graphics"].includes(r.id) || r.id === "monitor") || level === 2 && r.group === "audio" || level === 3 && (r.group !== "audio" && r.group !== "capture" || index === 2 && r.group === "capture"));
  const selectedIds = new Set(selected.map(r => r.id));
  const selectedActions = actions.filter(a => level >= 4 || level === 2 && a.group === "audio" || level === 3 && Boolean(a.source));
  for (const a of selectedActions) a.needs = a.needs.filter(id => selectedIds.has(id) || selectedActions.some(q => q.id === id));
  const usedPorts = new Set(selected.flatMap(r => [...r.from, ...r.to]));
  const usedDevices = new Set([...usedPorts].map(p => ports[p].device));
  const chosenDevices = Object.values(devices).filter(d => usedDevices.has(d.id));
  const chosenPorts = Object.fromEntries(Object.entries(ports).filter(([id]) => usedPorts.has(id)));
  const chosenCables = cables.filter(c => selectedIds.has(c.purpose!));
  // Physical placement comes from the venue layout (game/training/venue-layouts.ts): every device has an
  // operating position; portable gear starts in the venue's storage and is carried there (L4 starts already set up).
  const layout = LAYOUTS[LAYOUT_BY_SCALE[scale]];
  const turnBy = (yaw: number, x: number, z: number): [number, number] => [x * Math.cos(yaw) + z * Math.sin(yaw), -x * Math.sin(yaw) + z * Math.cos(yaw)];
  for (const d of chosenDevices) {
    if (d.id === "sw" || d.id === "ccu" || d.id === "router") d.size = [0.62, 0.16, 0.38];
    if (d.kind === "laptop") d.size = [0.48, 0.03, 0.32];
    if (/Monitor|TV|Screen|Display|Destination/.test(d.label)) d.size = [0.6, 0.36, 0.08];
    if (d.label.includes("Wall")) d.size = [3.2, 1.8, 0.12];
    if (["ccu", "router", "network", "live", "backup", "backup-net"].includes(d.id) && scale === "xl" || d.id === "encoder" && scale === "xl") d.size = [0.56, 1.7, 0.56];
    if (d.id === "stagebox" || d.id === "display" && scale !== "xl" && scale !== "xs") d.size = [0.5, 0.55, 0.45];
    if (d.id === "display" && scale === "xl") d.size = [0.5, 0.9, 0.45];
    if (d.id === "live" && scale !== "xl") d.size = [0.4, 0.9, 0.4];
  }
  const fallback = surfaceSlots(layout.equipment, chosenDevices.length, 2, 0.2);
  chosenDevices.forEach((d, i) => {
    const spot = layout.places[d.id];
    d.position = spot ? [...spot.p] : [...fallback[i]];
    d.yaw = spot?.yaw ?? 0;
  });
  const carried = chosenDevices.filter(d => movable.has(d.id));
  const storage = surfaceSlots(layout.equipment, carried.length, carried.length > 4 ? 2 : 1, 0.18);
  const startOf = Object.fromEntries(carried.map((d, i) => [d.id, level === 4 ? [...d.position] as Point3 : storage[i]]));
  // Ports sit on the device face toward the trainee; tall gear exposes them at working height.
  for (const d of chosenDevices) {
    const owned = Object.values(chosenPorts).filter(p => p.device === d.id);
    if (d.kind === "camera") {
      owned.forEach((p, j) => { const [ox, oz] = turnBy(d.yaw ?? 0, (j - (owned.length - 1) / 2) * 0.09, 0.26); p.position = [+(d.position[0] + ox).toFixed(3), 1.35, +(d.position[2] + oz).toFixed(3)]; });
      continue;
    }
    const topY = d.position[1] + d.size[1];
    owned.forEach((p, j) => {
      const perRow = d.size[0] > 1 ? 6 : 4;
      const lx = (j % perRow - (Math.min(owned.length, perRow) - 1) / 2) * Math.min(0.15, Math.max(0.1, d.size[0] / perRow));
      const lz = d.size[2] / 2 + 0.05;
      const y = topY > 1.45 ? Math.min(1.0 + Math.floor(j / perRow) * 0.14, topY - 0.08) : topY + 0.05 + Math.floor(j / perRow) * 0.13;
      const [ox, oz] = turnBy(d.yaw ?? 0, lx, lz);
      p.position = [+(d.position[0] + ox).toFixed(3), +y.toFixed(3), +(d.position[2] + oz).toFixed(3)];
    });
  }
  selectedActions.forEach(a => {
    const owner = devices[actionOwners[a.id]];
    const i = selectedActions.filter(q => actionOwners[q.id] === owner.id).indexOf(a);
    const [ox, oz] = turnBy(owner.yaw ?? 0, -0.23 + (i % 3) * 0.23, 0.05);
    const y = Math.min(owner.position[1] + Math.min(owner.size[1], 1.2) + 0.5 + Math.floor(i / 3) * 0.22, 2.3);
    a.position = [+(owner.position[0] + ox).toFixed(3), +y.toFixed(3), +(owner.position[2] + oz).toFixed(3)];
  });
  if (level === 4) {
    for (const c of ["HDMI", "USB-A", "USB-C", "XLR", "3.5mm", "6.35mm", "SDI"] as Connector[]) {
      const ends: [Connector, Connector] = c === "XLR" ? ["XLR-F", "XLR-M"] : [c, c];
      chosenCables.push({ id: `distractor-${c}`, label: `${c} · สายสำรอง (เลือกให้ตรงสัญญาณ)`, ends, plugs: [plug(ends[0]), plug(ends[1])], signalType: signal(c), purpose: "distractor", color: "#999da5", start: [[0, 0, 0], [0, 0, 0]] });
    }
  }
  // Cables are stored in tidy rows at the venue's cable location (every shelf level of a cable rack).
  {
    const s = layout.cables, [w, dd] = s.size ?? [1.4, 1.4], long = w >= dd, L = long ? w : dd, S = long ? dd : w;
    const heights = [s.center[1], ...(s.levels ?? [])];
    const perLevel = Math.ceil(chosenCables.length / heights.length);
    const perRow = Math.max(1, Math.floor((L - 0.3) / 0.2)), rows = Math.max(1, Math.ceil(perLevel / perRow));
    chosenCables.forEach((c, k) => {
      const shelf = Math.floor(k / perLevel), i = k % perLevel;
      const along = -L / 2 + 0.18 + (i % perRow) * 0.2, across = -S / 2 + 0.15 + (Math.floor(i / perRow) + 0.5) * ((S - 0.3) / rows);
      const y = heights[shelf] + 0.06;
      const at = (dl: number, da: number): Point3 => long ? [+(s.center[0] + along + dl).toFixed(3), y, +(s.center[2] + across + da).toFixed(3)] : [+(s.center[0] + across + da).toFixed(3), y, +(s.center[2] + along + dl).toFixed(3)];
      c.start = [at(0, -0.04), at(0.05, 0.04)];
    });
  }
  const solution = canonical.filter(c => usedPorts.has(c.from) && usedPorts.has(c.to));
  return {
    id: `${scale}-${level}`, venueScale: scale, level, title: LEVEL_TITLES[level - 1], layout: LAYOUT_BY_SCALE[scale],
    devices: chosenDevices, ports: chosenPorts, cables: chosenCables, requirements: selected, actions: selectedActions,
    // Prepared control positions remain movable; F retains the existing central-table placement contract.
    job: layout.job,
    placeables: chosenDevices.filter(d => movable.has(d.id)).map(d => ({ id: d.id, label: d.label, start: startOf[d.id], zone: [...d.position] as Point3, zoneLabel: layout.places[d.id]?.label, device: d })),
    canonical: solution,
    initialConnections: level === 4 ? solution.filter((_, i) => i % 3 !== 0) : [],
    faults: level === 4 ? ["มีสายสัญญาณขาดบางช่วง: ไล่ตรวจ SOURCE → INPUT → OUTPUT → DESTINATION", "Mixer ยัง Mute / ยังไม่ตั้งระดับเสียง", ...(index >= 3 ? ["Encoder / เครือข่ายจำลองยังไม่พร้อม"] : ["Capture / OBS จำลองยังไม่พร้อม"])] : [],
    assumptions: ["อุปกรณ์ GENERIC TRAINING MODEL เป็นแบบฝึก ไม่ใช่รุ่นที่ยืนยันจากมหาวิทยาลัย", "OBS, wireless pairing, encoder และเครือข่ายเป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง", ...(studio ? [`Camera transport: ${studioTransport} ปรับได้ผ่าน buildVenueScenario; ต้องตรวจสายจริง`, "COMICA CVM-WM100 PLUS family กับคำบอก Saramonic ยังไม่ยืนยัน", "PMX ยืนยันเฉพาะ chassis; การใช้สาย 3.5/6.35 เป็นสมมติฐาน"] : []), ...(scale === "m" ? ["Stagebox เป็น analog XLR แบบช่องต่อช่อง ไม่มี proprietary digital protocol"] : []), ...(index >= 3 ? ["ระยะไกลแทนด้วยเส้นทาง Fiber; ไม่จำลอง attenuation / bandwidth / power"] : [])],
  };
}

export const VENUE_SCENARIOS = Object.fromEntries(SCALES.flatMap(scale => ([1, 2, 3, 4, 5] as const).map(level => { const scenario = buildVenueScenario(scale, level); return [scenario.id, scenario]; }))) as Record<`${VenueScale}-${1 | 2 | 3 | 4 | 5}`, Scenario>;
