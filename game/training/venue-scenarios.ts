import type { ActionDef, CableDef, Connector, DeviceDef, FlowGroup, Point3, PortDef, Scenario, SignalType, VenueScale } from "./scenarios";
import { LAYOUTS, scaleSpot, surfaceSlots, yawToward, type LayoutId, type Spot } from "./venue-layouts";

/**
 * Mission Hall: 5 venue chapters × 5 practical levels = 25 first-person wiring lessons.
 * Each venue has ONE authored canonical graph (the level-5 full installation for that venue, following the
 * five-venue research: classroom ATEM-Mini-class switcher with USB webcam, studio Mixer → HDS7105 → Magewell,
 * auditorium SDI + stagebox + PA/Broadcast buses, outdoor fiber + embedder + encoder, stadium CCU/router/DA/main+backup).
 * Every route / operator step is tagged with the levels that teach it; level 4 starts from the full graph with
 * deliberate faults (missing links + one wrong patch) that the trainee must physically repair.
 * Free practice (`studio-full`) and `hdmi-basic` are defined in scenarios.ts and are not built here.
 */

/** Mission S uses its own enlarged studio layout — never the free-practice Studio Room 01 layout. */
const LAYOUT_BY_SCALE: Record<VenueScale, LayoutId> = { xs: "classroom", s: "studioMission", m: "auditorium", l: "outdoor", xl: "stadium" };
/** What the technician physically carries in each venue (everything else is installed / semi-fixed). */
const PORTABLE: Record<VenueScale, (id: string) => boolean> = {
  xs: (id) => ["sw", "mix", "rx", "pc"].includes(id) || id.startsWith("tx"),
  s: (id) => ["capture", "rx", "mic"].includes(id) || id.startsWith("tx"),
  m: (id) => ["conv-slides", "conv-display"].includes(id) || id.startsWith("tx") || /rx\d$/.test(id),
  l: (id) => ["fiber-tx", "fiber-rx", "encoder", "embedder", "monitor", "rx"].includes(id) || id.startsWith("tx"),
  xl: (id) => ["rx", "conv-gfx"].includes(id) || id.startsWith("tx"),
};

export const LEVEL_TITLES = ["เส้นทางภาพ · Video Path", "เส้นทางเสียง · Audio Path", "สลับภาพและตรวจสัญญาณ", "พอร์ตและการแก้ปัญหา", "ระบบ Production ครบเส้นทาง"];
const SCALES: VenueScale[] = ["xs", "s", "m", "l", "xl"];
const PLUGS: Partial<Record<Connector, NonNullable<CableDef["plugs"]>[number]>> = { HDMI: "hdmi", SDI: "sdi", "XLR-F": "xlr-f", "XLR-M": "xlr-m", "3.5mm": "trs35", "6.35mm": "trs635", "USB-A": "usba3", "USB-C": "usbc", FIBER: "fiber", ETHERNET: "ethernet" };
const plug = (c: Connector) => PLUGS[c] ?? "dp";
const signal = (c: Connector): SignalType =>
  c === "HDMI" ? "VIDEO_HDMI" : c === "SDI" ? "VIDEO_SDI" : c === "FIBER" ? "FIBER_VIDEO" : c === "ETHERNET" ? "NETWORK" : c.startsWith("USB") ? "USB_DATA"
    : c === "MULTICORE" ? "AUDIO_MULTICORE" : c === "RS422" || c === "GPI" ? "CONTROL" : c === "XLR4" ? "COMMS" : c.startsWith("XLR") ? "AUDIO_BALANCED" : "AUDIO_ANALOG";

/** Mission-only operating positions for gear the venue layouts do not list, authored in each venue's BASE coordinates
 * and scaled with the venue (VENUE_SCALE) when used. */
const at = (x: number, y: number, z: number, yaw = 0, label?: string): Spot => ({ p: [x, y, z], yaw, label });
const camAt = (x: number, z: number, target: [number, number], label: string): Spot => ({ p: [x, 0, z], yaw: yawToward([x, 0, z], [target[0], 0, target[1]]), label });
const EXTRA_PLACES: Record<VenueScale, Record<string, Spot>> = {
  xs: {
    speaker: at(-4.9, 0, -3.7, 0.35, "ลำโพง Active หน้าห้อง (ซ้าย)"),
  },
  s: {}, // the mission studio layout (studioMission) lists every S position itself
  m: {
    cam1: camAt(0, 3.95, [0, -5.5], "กล้อง C หลังกลาง (Wide)"),
    "conv-slides": at(-3.9, 0.76, -3.3, 0, "ข้างโต๊ะ Presentation: HDMI→SDI"),
    "conv-display": at(8.3, 0.55, -3.5, -Math.PI / 2, "ข้างเวทีขวา: SDI→HDMI ไปจอเวที"),
    display: at(0, 0.8, -6.2, 0, "จอ LED/Projector หน้าเวที"),
    recorder: at(2.5, 0.76, 5.4, 0, "FOH: Program Recorder"),
    pa: at(-6.4, 0.8, -5.6, 0.3, "ลำโพง PA ซ้ายเวที (Active)"),
  },
  l: {
    embedder: at(4.55, 0.76, 8.25, 0, "เต็นท์ควบคุม: Audio Embedder"),
    pa: at(-5.5, 1.0, -7.6, 0.3, "ลำโพง PA ข้างเวที (Active)"),
  },
  xl: {
    stagebox: at(5.0, 0, -0.6, Math.PI, "Stagebox ใต้โต๊ะผู้บรรยาย"),
    // CCU 1–6 stacked in the CCU rack bay, fronts facing the rack aisle.
    ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((i) => [`ccu${i}`, at(-12.55, 0.12 + (i - 1) * 0.3, -6.4, Math.PI / 2, `Rack CCU: Base Station ${i}`)])),
    "conv-gfx": at(-5.6, 0.76, -0.95, 0, "แถว 3: HDMI→SDI ของ Graphics"),
    "replay-ctl": at(-6.4, 0.76, -3.05, 0, "แถว 2: Replay Controller"),
    embedder: at(-12.55, 0, -4.6, Math.PI / 2, "Rack: Audio Embedder"),
    da: at(-12.55, 0, -1.2, Math.PI / 2, "Rack: SDI Distribution Amplifier"),
    recorder: at(-12.55, 0, 1.4, Math.PI / 2, "Rack: Program Recorder"),
    "live-backup": at(-11.7, 0, 1.4, Math.PI / 2, "Backup Uplink (จำลอง) ข้าง Rack"),
    "display-conv": at(12.6, 0, 9.6, -Math.PI / 2, "Venue screen processor"),
    pa: at(12.4, 0, 12.8, -Math.PI / 2 - 0.4, "Stadium PA (Active)"),
    intercom: at(-5.4, 0.76, -4.6, 0, "แถว 1: Intercom Main Station"),
    commentary: at(6.2, 0.76, -1.3, 0, "Commentary Unit (Intercom)"),
  },
};

type Lv = (1 | 2 | 3 | 5)[];
interface Tagged { lv: Lv }

/** One authored graph per venue, sliced by learning objective. No React-specific rules. */
export function buildVenueScenario(scale: VenueScale, level: 1 | 2 | 3 | 4 | 5): Scenario {
  const devices: Record<string, DeviceDef> = {};
  const ports: Record<string, PortDef> = {};
  const requirements: (Scenario["requirements"][number] & Tagged)[] = [];
  const actions: (ActionDef & Tagged)[] = [];
  const cables: CableDef[] = [];
  const canonical: NonNullable<Scenario["canonical"]> = [];
  const movable = new Set<string>();
  const actionOwners: Record<string, string> = {};

  function device(id: string, label: string, kind: DeviceDef["kind"] = "box", model = "GENERIC TRAINING MODEL", status: DeviceDef["status"] = "GENERIC TRAINING MODEL") {
    if (devices[id]) return;
    devices[id] = { id, label, model, status, generic: status === "GENERIC TRAINING MODEL", verified: status === "CONFIRMED", kind, position: [0, 0.78, 0],
      size: kind === "camera" ? [0.32, 1.5, 0.45] : kind === "mic" ? [0.08, 0.08, 0.25] : kind === "laptop" ? [0.5, 0.04, 0.32] : [0.48, 0.18, 0.3], color: "#263345" };
    if (PORTABLE[scale](id)) movable.add(id);
  }
  function port(id: string, direction: "INPUT" | "OUTPUT", connector: Connector, name?: string) {
    if (ports[id]) {
      if (ports[id].direction !== direction || ports[id].connector !== connector) throw new Error(`Conflicting port definition: ${id}`);
      return;
    }
    const [owner, raw] = id.split(":");
    ports[id] = { device: owner, label: `${devices[owner].label} ${name ?? raw.toUpperCase()}`, direction, connector, signalType: signal(connector), purpose: "scenario route", position: [0, 1, 0], radius: 0.055, ...(movable.has(owner) ? { requiresItem: owner } : {}) };
  }
  /** One physical lead from an OUTPUT to an INPUT. `names` = readable port names. */
  function route(id: string, from: string, to: string, connector: Connector, group: FlowGroup, lv: Lv, other: Connector = connector, names: [string?, string?] = [], cableLabel?: string) {
    port(from, "OUTPUT", connector, names[0]); port(to, "INPUT", other, names[1]);
    requirements.push({ id, label: `${devices[ports[from].device].label} → ${devices[ports[to].device].label}`, group, from: [from], to: [to], verified: false, lv });
    const ends: [Connector, Connector] = [connector === "XLR" ? "XLR-F" : connector, other === "XLR" ? "XLR-M" : other];
    const cableId = `lead-${id}`;
    cables.push({ id: cableId, label: cableLabel ?? `สาย ${connector}${connector === other ? "" : ` → ${other}`}`, ends, plugs: [plug(ends[0]), plug(ends[1])], signalType: signal(connector), purpose: id,
      color: group === "audio" ? "#50b899" : connector === "FIBER" ? "#ed953f" : connector === "ETHERNET" ? "#38d6c4" : connector.startsWith("USB") ? "#8fb4ff" : "#72aadd", start: [[0, 0, 0], [0, 0, 0]] });
    canonical.push({ cableId, from, to });
  }
  /** Operator step on a device (pair, gain/bus, Program, AUX, crosspoint, OBS, encoder...). */
  function action(id: string, label: string, owner: string, needs: string[], group: FlowGroup, lv: Lv, source?: string, doneLabel?: string) {
    actions.push({ id, label, doneLabel: doneLabel ?? `${label} · พร้อม`, needs, group, position: [0, 1, 0], ...(movable.has(owner) ? { onItem: owner } : {}), source, lv });
    actionOwners[id] = owner;
  }
  const lavPair = (n: number, lv: Lv) => {
    device(`lav${n}`, `Lavalier ${n}`, "mic"); device(`tx${n}`, `Wireless TX ${n}`, "bodypack");
    route(`lav-${n}`, `lav${n}:audio-out`, `tx${n}:mic-in`, "3.5mm", "audio", lv, "3.5mm", ["สายไมค์", "MIC IN"], "สายไมค์ Lavalier (3.5 mm)");
  };

  /* ═══════════ XS · ห้องเรียน — Mini HDMI switcher with HDMI PROGRAM OUT + USB WEBCAM [R01] ═══════════ */
  if (scale === "xs") {
    device("sw", "Mini HDMI Switcher (USB Webcam)", "box", "อ้างอิงความสามารถ ATEM Mini Pro [R01] · Generic Training Model");
    device("cam1", "Classroom HDMI Camera", "camera");
    device("slides", "Teacher Presentation Laptop", "laptop");
    device("monitor", "Classroom TV / Projector");
    device("mix", "Small Audio Mixer (PA + AUX)", "mixer");
    device("rx", "Wireless Receiver", "bodypack");
    device("speaker", "Active Classroom Speaker");
    device("pc", "Streaming Notebook / OBS", "laptop");
    lavPair(1, [2, 5]);
    route("cam-1", "cam1:hdmi-out", "sw:hdmi-in1", "HDMI", "video", [1, 3, 5], "HDMI", ["HDMI OUT", "HDMI IN 1"]);
    route("slides", "slides:hdmi-out", "sw:hdmi-in2", "HDMI", "video", [3, 5], "HDMI", ["HDMI OUT", "HDMI IN 2"]);
    route("monitor", "sw:hdmi-out", "monitor:hdmi-in", "HDMI", "monitor", [1, 3, 5], "HDMI", ["HDMI OUT (PROGRAM)", "HDMI IN"]);
    route("rx-mix", "rx:audio-out", "mix:ch1-in", "XLR", "audio", [2, 5], "XLR", ["AUDIO OUT (Line)", "CH1 MIC/LINE"]);
    route("mix-pa", "mix:main-out", "speaker:line-in", "6.35mm", "audio", [2, 5], "6.35mm", ["MAIN OUT (PA)", "LINE IN"]);
    route("mix-stream", "mix:aux-out", "sw:mic-in1", "6.35mm", "audio", [5], "3.5mm", ["AUX OUT (STREAM)", "MIC IN 1 (3.5 mm)"], "สาย TRS 6.35 → 3.5 mm");
    route("usb-webcam", "sw:usb-webcam", "pc:usb-host", "USB-C", "capture", [5], "USB-A", ["USB-C WEBCAM (Device)", "USB HOST"], "สาย USB-C → USB-A (Data)");
    action("wireless-pair", "จับคู่ TX ↔ RX (RF)", "rx", ["lav-1"], "audio", [2, 5]);
    action("bus-pa", "ตั้ง Gain + ส่งเข้าบัส PA", "mix", ["rx-mix", "wireless-pair", "mix-pa"], "audio", [2, 5]);
    action("bus-stream", "ส่งเสียงเข้าบัส STREAM/AUX", "mix", ["bus-pa", "mix-stream"], "audio", [5]);
    action("sw-out-program", "ตั้ง HDMI OUT = Program (ไม่ใช่ Multiview)", "sw", ["monitor"], "monitor", [1, 3, 5]);
    action("sw-audio", "ตั้ง MIC 1 = Line และเปิดเข้า Program", "sw", ["mix-stream", "bus-stream"], "audio", [5]);
    action("select-cam-1", "เลือก Program: Camera", "sw", ["cam-1", "sw-out-program"], "video", [1, 3, 5], "cam-1");
    action("select-slides", "เลือก Program: Presentation", "sw", ["slides", "sw-out-program"], "video", [3, 5], "slides");
    action("obs-ready", "OBS จำลอง: เลือก Switcher Webcam + เสียงทางเดียว", "pc", ["usb-webcam", "cam-1", "slides", "sw-audio", "sw-out-program"], "capture", [5]);
  }

  /* ═══════════ S · สตูดิโอภารกิจ — Mixer → HDS7105 → Magewell → HP/OBS (instructor route) ═══════════ */
  if (scale === "s") {
    device("sw", "DeviceWell HDS7105", "box", "DeviceWell HDS7105 · พอร์ตเป็นโปรไฟล์ฝึก (revision รอตรวจ)", "PROVISIONAL");
    device("mix", "Audio Mixer", "mixer", "PMX-402D-USB chassis · พอร์ตรอยืนยัน", "PROVISIONAL");
    for (const i of [1, 2, 3]) device(`cam${i}`, `Studio Camera ${i}`, "camera", "Studio Camera · HDMI profile (รุ่น/พอร์ตรอยืนยัน)", "PROVISIONAL");
    device("monitor", "Samsung TV (Multiview)", "box", "Samsung 43\" U8000F · SELECTED TRAINING REFERENCE", "PROVISIONAL");
    device("rx", "Wireless Receiver (2TX/1RX)", "bodypack", "COMICA WM100 PLUS family / Saramonic · รอยืนยัน", "PROVISIONAL");
    device("mic", "Sennheiser XS 1", "mic", "Sennheiser XS 1 (dynamic, XLR)", "PROVISIONAL");
    device("speaker", "Yamaha HS5 Monitor Speaker", "box", "Yamaha HS5 · SELECTED TRAINING REFERENCE", "PROVISIONAL");
    device("capture", "Magewell USB Capture HDMI Gen 2", "box", "Magewell 32060 · SELECTED TRAINING REFERENCE [R05]", "PROVISIONAL");
    device("pc", "HP Notebook / OBS", "laptop", "HP-style notebook · SKU รอยืนยัน", "PROVISIONAL");
    lavPair(1, [2, 5]); lavPair(2, [2, 5]);
    route("cam-1", "cam1:hdmi-out", "sw:in1", "HDMI", "video", [1, 3, 5], "HDMI", ["HDMI OUT", "VIDEO IN 1"]);
    route("cam-2", "cam2:hdmi-out", "sw:in2", "HDMI", "video", [3, 5], "HDMI", ["HDMI OUT", "VIDEO IN 2"]);
    route("cam-3", "cam3:hdmi-out", "sw:in3", "HDMI", "video", [3, 5], "HDMI", ["HDMI OUT", "VIDEO IN 3"]);
    route("monitor", "sw:multiview-out", "monitor:hdmi-in", "HDMI", "monitor", [1, 3, 5], "HDMI", ["MULTIVIEW OUT", "HDMI IN"]);
    route("rx-mix", "rx:audio-out", "mix:ch3-line", "3.5mm", "audio", [2, 5], "6.35mm", ["AUDIO OUT", "CH3/4 LINE"], "สาย 3.5 mm → TRS 6.35");
    route("xs1-mix", "mic:xlr-out", "mix:ch1-mic", "XLR", "audio", [2, 5], "XLR", ["XLR OUT", "CH1 MIC"], "สายไมค์ XLR");
    route("mix-sw", "mix:main-out", "sw:line-in", "6.35mm", "audio", [2, 5], "3.5mm", ["MAIN OUT (Program)", "AUDIO LINE IN"], "สาย TRS 6.35 → 3.5 mm");
    route("mix-hs5", "mix:monitor-out", "speaker:trs-in", "6.35mm", "audio", [2, 5], "6.35mm", ["MONITOR/AUX OUT", "LINE IN (TRS)"]);
    route("program-capture", "sw:pgm-out", "capture:hdmi-in", "HDMI", "capture", [5], "HDMI", ["PGM HDMI OUT", "HDMI IN"]);
    route("capture-pc", "capture:usb-out", "pc:usb-in", "USB-A", "capture", [5], "USB-A", ["USB 3.0 (Device)", "USB HOST"], "สาย USB 3.0 (Data)");
    action("wireless-pair", "จับคู่ TX1 + TX2 ↔ RX (RF)", "rx", ["lav-1", "lav-2"], "audio", [2, 5]);
    action("bus-main", "ตั้ง Gain + ส่ง Lav/XS 1 เข้า MAIN", "mix", ["rx-mix", "xs1-mix", "wireless-pair", "mix-sw"], "audio", [2, 5]);
    action("bus-monitor", "ส่งเสียงเข้าบัส MONITOR (HS5)", "mix", ["bus-main", "mix-hs5"], "audio", [2, 5]);
    action("sw-audio", "เปิด AUDIO LINE IN เข้า Program", "sw", ["mix-sw", "bus-main"], "audio", [2, 5]);
    for (const i of [1, 2, 3]) action(`select-cam-${i}`, `เลือก Program: Camera ${i}`, "sw", [`cam-${i}`, "monitor"], "video", i === 1 ? [1, 3, 5] : [3, 5], `cam-${i}`);
    action("obs-ready", "OBS จำลอง: เลือก Magewell + เสียง HDMI ทางเดียว", "pc", ["program-capture", "capture-pc", "cam-1", "cam-2", "cam-3", "sw-audio"], "capture", [5]);
  }

  /* ═══════════ M · หอประชุม — 3G-SDI switcher [R02], analog stagebox + multicore, PA vs Broadcast ═══════════ */
  if (scale === "m") {
    device("sw", "Production 3G-SDI Switcher", "box", "8-input 3G-SDI class (อ้างอิงความสามารถ ATEM TVS HD8 [R02]) · Generic");
    device("cam1", "Camera C (Rear Centre)", "camera"); device("cam2", "Camera L (Left Aisle)", "camera"); device("cam3", "Camera R (Right Aisle)", "camera");
    device("cam4", "PTZ Camera (SDI)", "camera");
    device("slides", "Presentation Laptop", "laptop"); device("conv-slides", "HDMI → SDI Converter", "box", "Micro Converter HDMI to SDI [R08] · โปรไฟล์ฝึก");
    device("conv-display", "SDI → HDMI Converter", "box", "Micro Converter SDI to HDMI [R08] · โปรไฟล์ฝึก");
    device("display", "LED / Projector (HDMI IN)"); device("monitor", "FOH Multiview Monitor");
    device("recorder", "Program Recorder"); device("pc", "Production PC / OBS", "laptop");
    // Appendix A: podium mic + 2 wireless handhelds + 2 lavs, each wireless channel on its own receiver output.
    device("mic1", "Podium Microphone", "mic");
    for (const n of [1, 2]) { device(`hh${n}`, `Wireless Handheld ${n}`, "mic"); device(`hhrx${n}`, `Handheld RX ${n}`, "bodypack"); device(`lavrx${n}`, `Lav RX ${n}`, "bodypack"); }
    device("stagebox", "Analog Stagebox"); device("mix", "Digital FOH Mixer", "mixer"); device("pa", "Active PA Speaker");
    lavPair(1, [5]); lavPair(2, [5]);
    route("cam-1", "cam1:sdi-out", "sw:sdi-in1", "SDI", "video", [1, 3, 5], "SDI", ["3G-SDI OUT", "SDI IN 1"]);
    route("cam-2", "cam2:sdi-out", "sw:sdi-in2", "SDI", "video", [3, 5], "SDI", ["3G-SDI OUT", "SDI IN 2"]);
    route("cam-3", "cam3:sdi-out", "sw:sdi-in3", "SDI", "video", [3, 5], "SDI", ["3G-SDI OUT", "SDI IN 3"]);
    route("cam-4", "cam4:sdi-out", "sw:sdi-in4", "SDI", "video", [3, 5], "SDI", ["3G-SDI OUT", "SDI IN 4"]);
    route("slides-conv", "slides:hdmi-out", "conv-slides:hdmi-in", "HDMI", "video", [3, 5], "HDMI", ["HDMI OUT", "HDMI IN"]);
    route("slides", "conv-slides:sdi-out", "sw:sdi-in5", "SDI", "video", [3, 5], "SDI", ["SDI OUT", "SDI IN 5"]);
    route("aux-conv", "sw:aux-out", "conv-display:sdi-in", "SDI", "monitor", [1, 3, 5], "SDI", ["AUX SDI OUT", "SDI IN"]);
    route("display", "conv-display:hdmi-out", "display:hdmi-in", "HDMI", "monitor", [1, 3, 5], "HDMI", ["HDMI OUT", "HDMI IN"]);
    route("monitor", "sw:multiview-out", "monitor:hdmi-in", "HDMI", "monitor", [3, 5], "HDMI", ["MULTIVIEW HDMI OUT", "HDMI IN"]);
    route("program-record", "sw:pgm-out", "recorder:sdi-in", "SDI", "capture", [5], "SDI", ["PROGRAM SDI OUT", "SDI IN"]);
    route("usb-webcam", "sw:usb-webcam", "pc:usb-host", "USB-C", "capture", [5], "USB-A", ["USB WEBCAM (Device)", "USB HOST"], "สาย USB-C → USB-A (Data)");
    route("stage-1", "mic1:xlr-out", "stagebox:mic-in1", "XLR", "audio", [2, 5], "XLR", ["XLR OUT", "MIC IN 1"]);
    route("stage-2", "hhrx1:xlr-out", "stagebox:mic-in2", "XLR", "audio", [2, 5], "XLR", ["AUDIO OUT", "MIC IN 2"]);
    route("stage-3", "hhrx2:xlr-out", "stagebox:mic-in3", "XLR", "audio", [5], "XLR", ["AUDIO OUT", "MIC IN 3"]);
    route("stage-4", "lavrx1:xlr-out", "stagebox:mic-in4", "XLR", "audio", [5], "XLR", ["AUDIO OUT", "MIC IN 4"]);
    route("stage-5", "lavrx2:xlr-out", "stagebox:mic-in5", "XLR", "audio", [5], "XLR", ["AUDIO OUT", "MIC IN 5"]);
    route("snake", "stagebox:multicore-out", "mix:multicore-in", "MULTICORE", "audio", [2, 5], "MULTICORE", ["MULTICORE OUT", "MULTICORE IN"], "Analog Multicore (คู่ Stagebox)");
    route("mix-pa", "mix:pa-out", "pa:line-in", "XLR", "audio", [2, 5], "XLR", ["PA BUS OUT", "LINE IN"]);
    route("mix-bc", "mix:bc-out", "sw:audio-in", "XLR", "audio", [2, 5], "XLR", ["BROADCAST BUS OUT", "AUDIO IN (XLR)"]);
    action("pair-hh1", "จับคู่ Handheld 1 ↔ RX 1 (RF)", "hh1", ["stage-2"], "audio", [2, 5]);
    action("pair-hh2", "จับคู่ Handheld 2 ↔ RX 2 (RF)", "hh2", ["stage-3"], "audio", [5]);
    action("pair-lav1", "จับคู่ Lav TX 1 ↔ RX (RF)", "lavrx1", ["lav-1", "stage-4"], "audio", [5]);
    action("pair-lav2", "จับคู่ Lav TX 2 ↔ RX (RF)", "lavrx2", ["lav-2", "stage-5"], "audio", [5]);
    action("bus-pa", "ตั้ง Gain + ส่งไมค์เข้า PA BUS", "mix", ["stage-1", "pair-hh1", "snake", "mix-pa"], "audio", [2, 5]);
    action("bus-bc", "ส่งไมค์เข้า BROADCAST BUS", "mix", ["bus-pa", "mix-bc"], "audio", [2, 5]);
    action("bus-all", "ตั้ง Gain ไมค์ไร้สายทุกช่อง (CH2–5)", "mix", ["pair-hh2", "pair-lav1", "pair-lav2", "bus-bc"], "audio", [5]);
    action("sw-audio", "เปิด AUDIO IN เข้า Program", "sw", ["mix-bc", "bus-bc"], "audio", [2, 5]);
    action("aux-program", "ตั้ง AUX = Program (จอเวทีห้ามเป็น Multiview)", "sw", ["aux-conv", "display"], "monitor", [1, 3, 5]);
    const srcs: [string, string, Lv][] = [["cam-1", "Camera C", [1, 3, 5]], ["cam-2", "Camera L", [3, 5]], ["cam-3", "Camera R", [3, 5]], ["cam-4", "PTZ", [3, 5]], ["slides", "Slides", [3, 5]]];
    for (const [r, name, lv] of srcs) action(`select-${r}`, `เลือก Program: ${name}`, "sw", r === "slides" ? ["slides-conv", "slides", "aux-program"] : [r, "aux-program"], "video", lv, r);
    action("record", "เริ่มบันทึก Program", "recorder", ["program-record", "sw-audio"], "capture", [5]);
    action("obs-ready", "OBS จำลอง: เลือก Switcher Webcam + เสียงทางเดียว", "pc", ["usb-webcam", "sw-audio", "monitor"], "capture", [5]);
  }

  /* ═══════════ L · ภายนอกอาคาร — near SDI, far camera via fiber TX/RX [R09], embedder [R15] → encoder [R06] ═══════════ */
  if (scale === "l") {
    device("sw", "Portable Field 3G-SDI Switcher", "box");
    device("cam1", "Far Camera A (via Fiber)", "camera"); device("cam2", "Near Camera B", "camera"); device("cam3", "Near Camera C", "camera");
    device("fiber-tx", "SDI → Fiber TX", "box", "Generic SDI Fiber TX (คู่กับ RX) [R09]"); device("fiber-rx", "Fiber → SDI RX", "box", "Generic SDI Fiber RX (คู่กับ TX) [R09]");
    device("monitor", "Portable Multiview Monitor (SDI)");
    device("rx", "Wireless Receiver", "bodypack"); device("mic0", "Shotgun Mic (Condenser)", "mic"); device("mic1", "Ambient Mic (Dynamic)", "mic");
    device("mix", "Field Audio Mixer", "mixer"); device("pa", "Active PA Speaker");
    device("embedder", "Analog Audio Embedder", "box", "อ้างอิง AJA 3G-AMA [R15] · โปรไฟล์ฝึก");
    device("encoder", "SDI Hardware Encoder", "box", "อ้างอิงความสามารถ Streaming Encoder [R06] · Generic");
    device("network", "4G / 5G Router"); device("live", "Live Ingest (simulation)");
    lavPair(1, [2, 5]);
    route("field-tx", "cam1:sdi-out", "fiber-tx:sdi-in", "SDI", "video", [1, 3, 5], "SDI", ["3G-SDI OUT", "SDI IN"]);
    route("fiber-link", "fiber-tx:fiber-out", "fiber-rx:fiber-in", "FIBER", "video", [1, 3, 5], "FIBER", ["OPTICAL OUT", "OPTICAL IN"], "สาย Fiber (คู่ TX/RX)");
    route("cam-1", "fiber-rx:sdi-out", "sw:sdi-in1", "SDI", "video", [1, 3, 5], "SDI", ["SDI OUT", "SDI IN 1"]);
    route("cam-2", "cam2:sdi-out", "sw:sdi-in2", "SDI", "video", [1, 3, 5], "SDI", ["3G-SDI OUT", "SDI IN 2"]);
    route("cam-3", "cam3:sdi-out", "sw:sdi-in3", "SDI", "video", [3, 5], "SDI", ["3G-SDI OUT", "SDI IN 3"]);
    route("monitor", "sw:multiview-out", "monitor:sdi-in", "SDI", "monitor", [1, 3, 5], "SDI", ["MULTIVIEW SDI OUT", "SDI IN"]);
    route("rx-mix", "rx:xlr-out", "mix:ch1-in", "XLR", "audio", [2, 5], "XLR", ["AUDIO OUT (Line)", "CH1 MIC/LINE"]);
    route("mic-0", "mic0:xlr-out", "mix:ch2-mic", "XLR", "audio", [2, 5], "XLR", ["XLR OUT", "CH2 MIC (+48V)"]);
    route("mic-1", "mic1:xlr-out", "mix:ch3-mic", "XLR", "audio", [2, 5], "XLR", ["XLR OUT", "CH3 MIC"]);
    route("mix-pa", "mix:pa-out", "pa:line-in", "XLR", "audio", [2, 5], "XLR", ["PA BUS OUT", "LINE IN"]);
    route("mix-embed", "mix:bc-out", "embedder:audio-in", "XLR", "audio", [5], "XLR", ["BROADCAST OUT (balanced)", "ANALOG AUDIO IN"]);
    route("program-embed", "sw:pgm-out", "embedder:sdi-in", "SDI", "capture", [5], "SDI", ["PGM SDI OUT", "SDI IN"]);
    route("program-encode", "embedder:sdi-out", "encoder:sdi-in", "SDI", "capture", [5], "SDI", ["SDI OUT (embedded)", "SDI IN"]);
    route("network", "encoder:network-out", "network:lan-in", "ETHERNET", "capture", [5], "ETHERNET", ["ETHERNET", "LAN"]);
    route("destination", "network:wan-out", "live:network-in", "ETHERNET", "capture", [5], "ETHERNET", ["WAN / UPLINK", "INGEST"]);
    action("fiber-ready", "เปิดไฟเลี้ยง Fiber TX/RX และตรวจคู่", "fiber-rx", ["field-tx", "fiber-link"], "video", [1, 3, 5]);
    action("wireless-pair", "จับคู่ TX ↔ RX (RF)", "rx", ["lav-1"], "audio", [2, 5]);
    action("phantom", "เปิด +48V เฉพาะช่อง Shotgun", "mix", ["mic-0"], "audio", [2, 5]);
    action("bus-pa", "ตั้ง Gain + ส่งพิธีกรเข้า PA BUS", "mix", ["rx-mix", "wireless-pair", "mix-pa"], "audio", [2, 5]);
    action("bus-bc", "ส่งไมค์ทั้ง 3 เข้า BROADCAST BUS", "mix", ["bus-pa", "phantom", "mic-1"], "audio", [2, 5]);
    action("select-cam-1", "เลือก Program: Far Camera (Fiber)", "sw", ["cam-1", "fiber-ready", "monitor"], "video", [1, 3, 5], "cam-1");
    action("select-cam-2", "เลือก Program: Camera B", "sw", ["cam-2", "monitor"], "video", [1, 3, 5], "cam-2");
    action("select-cam-3", "เลือก Program: Camera C", "sw", ["cam-3", "monitor"], "video", [3, 5], "cam-3");
    action("embed", "ตั้ง Embed เสียงเข้า SDI ช่อง 1/2", "embedder", ["program-embed", "mix-embed", "bus-bc"], "capture", [5]);
    action("network-ready", "ตรวจเครือข่าย / Uplink จำลอง", "network", ["network", "destination"], "capture", [5]);
    action("encoder-ready", "ตั้งโปรไฟล์ + เริ่ม Encoder จำลอง", "encoder", ["program-encode", "embed", "network-ready"], "capture", [5]);
    action("ramp", "ตรวจเส้นทางสาย / Cable ramp ปลอดภัย", "sw", [], "capture", [5]);
  }

  /* ═══════════ XL · สนามกีฬา — 6 camera/CCU chains → router [R16] → switcher [R03] → embedder → DA → main/backup/record ═══════════ */
  if (scale === "xl") {
    // Six distinct camera systems: camera n ↔ its own matched CCU / base station n [R09].
    for (let i = 1; i <= 6; i++) device(`ccu${i}`, `CCU / Base Station ${i}`, "box", `Generic CCU (คู่ระบบกล้อง ${i}) [R09]`);
    device("router", "SDI Video Router", "box", "อ้างอิง Videohub 20x20 12G [R16] · โปรไฟล์ฝึก");
    device("sw", "Broadcast Production Switcher", "box", "อ้างอิง ATEM 2 M/E Constellation 4K [R03] · ไม่มี XLR audio");
    const camNames = ["Main High Wide", "Field Left", "Field Right", "Goal / End", "Long-lens", "Mobile Field"];
    camNames.forEach((n, i) => device(`cam${i + 1}`, `Broadcast Camera ${i + 1} · ${n}`, "camera"));
    device("replay", "Replay Server"); device("replay-ctl", "Replay Controller");
    device("graphics", "Graphics Workstation", "laptop"); device("conv-gfx", "HDMI → SDI Converter", "box", "Micro Converter HDMI to SDI [R08] · โปรไฟล์ฝึก");
    device("monitor", "Multiview Wall"); device("display-conv", "Venue Screen Processor (SDI→HDMI)"); device("display", "Stadium Display");
    ["Commentator Mic 1", "Commentator Mic 2", "Crowd Mic L", "Crowd Mic R", "Field Mic"].forEach((n, i) => device(`mic${i}`, n, "mic"));
    device("rx", "Wireless Receiver (Presenter)", "bodypack");
    device("stagebox", "Audio Stagebox (Analog)"); device("mix", "Digital Broadcast Audio Console", "mixer"); device("pa", "Stadium PA (Active)");
    device("embedder", "SDI Audio Embedder", "box", "อ้างอิง AJA 3G-AMA [R15] · โปรไฟล์ฝึก"); device("da", "Active SDI DA 1×4");
    device("encoder", "Main Hardware Encoder"); device("network", "Primary Network"); device("live", "Main Ingest (simulation)");
    device("backup", "Backup Encoder"); device("backup-net", "Backup Network"); device("live-backup", "Backup Ingest (simulation)");
    device("recorder", "Program Recorder"); device("intercom", "Intercom Main Station"); device("commentary", "Commentary Unit");
    lavPair(1, [5]);
    for (let i = 1; i <= 6; i++) {
      const lv: Lv = i <= 2 ? [1, 3, 5] : [3, 5];
      route(`fiber-${i}`, `cam${i}:fiber-out`, `ccu${i}:fiber-in`, "FIBER", "video", lv, "FIBER", ["CAMERA FIBER", "CAMERA FIBER IN"], `Camera Fiber ${i} (ระบบคู่กล้อง ${i})`);
      route(`ccu-${i}`, `ccu${i}:sdi-out`, `router:in${i}`, "SDI", "video", lv, "SDI", ["SDI OUT", `SDI IN ${i}`]);
      route(`cam-${i}`, `router:out${i}`, `sw:in${i}`, "SDI", "video", lv, "SDI", [`SDI OUT ${i}`, `SDI IN ${i}`]);
    }
    route("replay-src", "replay:sdi-out", "router:in7", "SDI", "video", [3, 5], "SDI", ["SDI OUT", "SDI IN 7"]);
    route("replay", "router:out7", "sw:in7", "SDI", "video", [3, 5], "SDI", ["SDI OUT 7", "SDI IN 7"]);
    route("replay-control", "replay-ctl:control-out", "replay:control-in", "RS422", "video", [3, 5], "RS422", ["CONTROL (RS-422)", "CONTROL IN"], "สาย Control RS-422");
    route("gfx-conv", "graphics:hdmi-out", "conv-gfx:hdmi-in", "HDMI", "video", [3, 5], "HDMI", ["HDMI OUT", "HDMI IN"]);
    route("gfx-src", "conv-gfx:sdi-out", "router:in8", "SDI", "video", [3, 5], "SDI", ["SDI OUT", "SDI IN 8"]);
    route("graphics", "router:out8", "sw:in8", "SDI", "video", [3, 5], "SDI", ["SDI OUT 8", "SDI IN 8"]);
    route("monitor", "sw:multiview-out", "monitor:sdi-in", "SDI", "monitor", [1, 3, 5], "SDI", ["MULTIVIEW OUT", "SDI IN"]);
    route("aux-venue", "sw:aux-out", "display-conv:sdi-in", "SDI", "monitor", [5], "SDI", ["AUX 1 OUT", "SDI IN"]);
    route("display", "display-conv:hdmi-out", "display:hdmi-in", "HDMI", "monitor", [5], "HDMI", ["HDMI OUT", "HDMI IN"]);
    for (let i = 0; i < 5; i++) route(`mic-${i}`, `mic${i}:xlr-out`, `stagebox:mic-in${i + 1}`, "XLR", "audio", [2, 5], "XLR", ["XLR OUT", `MIC IN ${i + 1}`]);
    route("rx-stage", "rx:xlr-out", "stagebox:mic-in6", "XLR", "audio", [5], "XLR", ["AUDIO OUT", "MIC IN 6"]);
    route("snake", "stagebox:multicore-out", "mix:multicore-in", "MULTICORE", "audio", [2, 5], "MULTICORE", ["MULTICORE OUT", "MULTICORE IN"], "Analog Multicore (คู่ Stagebox)");
    route("mix-pa", "mix:pa-out", "pa:line-in", "XLR", "audio", [2, 5], "XLR", ["VENUE PA OUT", "LINE IN"]);
    route("mix-embed", "mix:bc-out", "embedder:audio-in", "XLR", "audio", [5], "XLR", ["BROADCAST PROGRAM OUT", "ANALOG AUDIO IN"]);
    route("program-embed", "sw:pgm-out", "embedder:sdi-in", "SDI", "capture", [5], "SDI", ["PROGRAM SDI OUT", "SDI IN"]);
    route("embed-da", "embedder:sdi-out", "da:sdi-in", "SDI", "capture", [5], "SDI", ["SDI OUT (embedded)", "SDI IN"]);
    route("program-encode", "da:out1", "encoder:sdi-in", "SDI", "capture", [5], "SDI", ["DA OUT 1", "SDI IN"]);
    route("backup-encode", "da:out2", "backup:sdi-in", "SDI", "capture", [5], "SDI", ["DA OUT 2", "SDI IN"]);
    route("program-record", "da:out3", "recorder:sdi-in", "SDI", "capture", [5], "SDI", ["DA OUT 3", "SDI IN"]);
    route("network", "encoder:network-out", "network:lan-in", "ETHERNET", "capture", [5], "ETHERNET", ["ETHERNET", "LAN"]);
    route("destination", "network:wan-out", "live:network-in", "ETHERNET", "capture", [5], "ETHERNET", ["WAN", "INGEST"]);
    route("backup-network", "backup:network-out", "backup-net:lan-in", "ETHERNET", "capture", [5], "ETHERNET", ["ETHERNET", "LAN"]);
    route("backup-live", "backup-net:wan-out", "live-backup:network-in", "ETHERNET", "capture", [5], "ETHERNET", ["WAN", "INGEST"]);
    route("intercom", "intercom:party-line1", "commentary:intercom-in", "XLR4", "monitor", [5], "XLR4", ["PARTY LINE 1", "INTERCOM"], "สาย Intercom XLR-4");
    route("tally", "sw:tally-out", "ccu1:tally-in", "GPI", "monitor", [5], "GPI", ["TALLY/GPI OUT", "TALLY IN (บัส Rack 1–6)"], "สาย GPI / Tally");
    for (let i = 1; i <= 6; i++) action(`xp-${i}`, `Router: IN ${i} → OUT ${i}`, "router", [`ccu-${i}`, `cam-${i}`], "video", i <= 2 ? [1, 3, 5] : [3, 5]);
    action("xp-7", "Router: IN 7 → OUT 7 (Replay)", "router", ["replay-src", "replay"], "video", [3, 5]);
    action("xp-8", "Router: IN 8 → OUT 8 (Graphics)", "router", ["gfx-src", "graphics"], "video", [3, 5]);
    for (let i = 1; i <= 6; i++) action(`select-cam-${i}`, `เลือก Program: Camera ${i}`, "sw", [`fiber-${i}`, `xp-${i}`, "monitor"], "video", i <= 2 ? [1, 3, 5] : [3, 5], `cam-${i}`);
    action("select-replay", "เลือก Program: Replay", "sw", ["xp-7", "replay-control", "monitor"], "video", [3, 5], "replay");
    action("select-graphics", "เลือก Program: Graphics", "sw", ["xp-8", "gfx-conv", "monitor"], "video", [3, 5], "graphics");
    action("wireless-pair", "จับคู่ Presenter TX ↔ RX (RF)", "rx", ["lav-1"], "audio", [5]);
    action("bus-bc", "ตั้ง Gain + Broadcast Program mix", "mix", ["mic-0", "mic-1", "mic-2", "mic-3", "mic-4", "snake"], "audio", [2, 5]);
    action("bus-pa", "VENUE PA BUS (ไม่ส่งเสียงผู้บรรยาย)", "mix", ["bus-bc", "mix-pa"], "audio", [2, 5]);
    action("bus-presenter", "ใส่เสียงพิธีกรเข้า Broadcast + PA", "mix", ["rx-stage", "wireless-pair", "bus-pa"], "audio", [5]);
    action("embed", "ตั้ง Embed Broadcast L/R เข้า SDI", "embedder", ["program-embed", "mix-embed", "bus-presenter"], "capture", [5]);
    action("aux-program", "ตั้ง AUX 1 = Venue Feed (Program)", "sw", ["aux-venue", "display"], "monitor", [5]);
    action("record", "ตรวจ Storage + เริ่มบันทึก", "recorder", ["program-record", "embed", "embed-da"], "capture", [5]);
    action("network-ready", "ตรวจ Primary Network / Uplink", "network", ["network", "destination"], "capture", [5]);
    action("encoder-ready", "เริ่ม Main Encoder จำลอง", "encoder", ["program-encode", "embed", "embed-da", "network-ready"], "capture", [5]);
    action("backup-ready", "เริ่ม Backup Encoder (เครือข่ายแยก)", "backup", ["backup-encode", "backup-network", "backup-live", "embed"], "capture", [5]);
    action("intercom-ready", "ตั้งช่อง Party line Intercom", "intercom", ["intercom"], "monitor", [5]);
    action("tally-map", "Map Tally: Switcher IN 1–6 → CCU 1–6", "sw", ["tally", "fiber-1", "fiber-2", "fiber-3", "fiber-4", "fiber-5", "fiber-6"], "monitor", [5]);
  }

  // Several hops can join the same two devices (6 cameras → CCU → router): disambiguate those hints with the port pair.
  const seen = new Map<string, number>();
  for (const r of requirements) seen.set(r.label, (seen.get(r.label) ?? 0) + 1);
  for (const r of requirements) if ((seen.get(r.label) ?? 0) > 1) r.label = `${r.label} (${ports[r.from[0]].label.split(" ").slice(-2).join(" ")} → ${ports[r.to[0]].label.split(" ").slice(-2).join(" ")})`;

  // Keep only what this level teaches. Level 4 = the full venue graph with faults to repair.
  const inLevel = (lv: Lv) => level === 4 ? lv.includes(5) : (lv as number[]).includes(level);
  const selected = requirements.filter((r) => inLevel(r.lv));
  const selectedIds = new Set(selected.map((r) => r.id));
  const selectedActions = actions.filter((a) => inLevel(a.lv));
  for (const a of selectedActions) a.needs = a.needs.filter((id) => selectedIds.has(id) || selectedActions.some((q) => q.id === id));
  const usedPorts = new Set(selected.flatMap((r) => [...r.from, ...r.to]));
  const usedDevices = new Set([...usedPorts].map((p) => ports[p].device));
  for (const a of selectedActions) usedDevices.add(actionOwners[a.id]);
  const chosenDevices = Object.values(devices).filter((d) => usedDevices.has(d.id));
  const chosenPorts = Object.fromEntries(Object.entries(ports).filter(([id]) => usedPorts.has(id)));
  const chosenCables = cables.filter((c) => selectedIds.has(c.purpose!));

  // Physical placement: venue layout operating spots (+ mission-only extras); portable gear starts in the venue's storage.
  const layout = LAYOUTS[LAYOUT_BY_SCALE[scale]];
  const layoutId = LAYOUT_BY_SCALE[scale];
  const places: Record<string, Spot> = { ...layout.places, ...Object.fromEntries(Object.entries(EXTRA_PLACES[scale]).map(([id, sp]) => [id, scaleSpot(layoutId, sp)])) };
  const turnBy = (yaw: number, x: number, z: number): [number, number] => [x * Math.cos(yaw) + z * Math.sin(yaw), -x * Math.sin(yaw) + z * Math.cos(yaw)];
  for (const d of chosenDevices) {
    if (["sw", "router"].includes(d.id)) d.size = [0.62, 0.16, 0.38];
    if (/^ccu\d$/.test(d.id)) d.size = [0.5, 0.18, 0.45];
    if (d.kind === "laptop") d.size = [0.48, 0.03, 0.32];
    if (/Monitor|TV|Screen|Display|Projector|Ingest/.test(d.label)) d.size = [0.6, 0.36, 0.08];
    if (d.label.includes("Wall")) d.size = [3.2, 1.8, 0.12];
    if (d.id === "display" && (scale === "m" || scale === "xl")) d.size = [2.4, 1.3, 0.1];
    if (/Speaker|PA/.test(d.label)) d.size = [0.34, 0.55, 0.3];
    if (scale === "xl" && ["router", "network", "live", "backup", "backup-net", "encoder", "embedder", "da", "recorder", "live-backup"].includes(d.id)) d.size = [0.56, 1.7, 0.56];
    if (d.id === "stagebox") d.size = [0.5, 0.55, 0.45];
    if (d.id === "live" && scale !== "xl") d.size = [0.4, 0.9, 0.4];
  }
  const fallback = surfaceSlots(layout.equipment, chosenDevices.length, 2, 0.2);
  chosenDevices.forEach((d, i) => {
    const spot = places[d.id];
    d.position = spot ? [...spot.p] : [...fallback[i]];
    d.yaw = spot?.yaw ?? 0;
  });
  const carried = chosenDevices.filter((d) => movable.has(d.id));
  const storage = surfaceSlots(layout.equipment, carried.length, carried.length > 4 ? 2 : 1, 0.18);
  const startOf = Object.fromEntries(carried.map((d, i) => [d.id, level === 4 ? [...d.position] as Point3 : storage[i]]));
  // Ports sit on the device face toward the trainee; tall gear exposes them at working height.
  for (const d of chosenDevices) {
    const owned = Object.values(chosenPorts).filter((p) => p.device === d.id);
    if (d.kind === "camera") {
      owned.forEach((p, j) => { const [ox, oz] = turnBy(d.yaw ?? 0, (j - (owned.length - 1) / 2) * 0.09, 0.26); p.position = [+(d.position[0] + ox).toFixed(3), 1.35, +(d.position[2] + oz).toFixed(3)]; });
      continue;
    }
    const topY = d.position[1] + d.size[1];
    const perRow = d.size[0] > 1 ? 6 : owned.length > 12 ? 6 : 4;
    owned.forEach((p, j) => {
      const lx = (j % perRow - (Math.min(owned.length, perRow) - 1) / 2) * Math.min(0.15, Math.max(0.09, d.size[0] / perRow));
      const lz = d.size[2] / 2 + 0.05;
      const y = topY > 1.45 ? Math.min(0.75 + Math.floor(j / perRow) * 0.14, topY - 0.08) : topY + 0.05 + Math.floor(j / perRow) * 0.13;
      const [ox, oz] = turnBy(d.yaw ?? 0, lx, lz);
      p.position = [+(d.position[0] + ox).toFixed(3), +y.toFixed(3), +(d.position[2] + oz).toFixed(3)];
    });
  }
  selectedActions.forEach((a) => {
    const owner = devices[actionOwners[a.id]];
    const mine = selectedActions.filter((q) => actionOwners[q.id] === owner.id);
    const i = mine.indexOf(a);
    const [ox, oz] = turnBy(owner.yaw ?? 0, -0.3 + (i % 4) * 0.2, 0.05);
    const y = Math.min(owner.position[1] + Math.min(owner.size[1], 1.2) + 0.45 + Math.floor(i / 4) * 0.2, 2.6);
    a.position = [+(owner.position[0] + ox).toFixed(3), +y.toFixed(3), +(owner.position[2] + oz).toFixed(3)];
  });
  if (level === 4) {
    // Same-looking spare leads: the trainee must pick the one whose signal matches (HDMI ≠ SDI, USB device ≠ host...).
    for (const c of ["HDMI", "USB-A", "XLR", "3.5mm", "6.35mm", "SDI"] as Connector[]) {
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
      const pt = (dl: number, da: number): Point3 => long ? [+(s.center[0] + along + dl).toFixed(3), y, +(s.center[2] + across + da).toFixed(3)] : [+(s.center[0] + across + da).toFixed(3), y, +(s.center[2] + along + dl).toFixed(3)];
      c.start = [pt(0, -0.04), pt(0.05, 0.04)];
    });
  }
  const solution = canonical.filter((c) => usedPorts.has(c.from) && usedPorts.has(c.to));

  // Level 4: every third lead missing, plus one WRONG patch the trainee must physically move (Program/Multiview or source/output confusion).
  let initialConnections: NonNullable<Scenario["initialConnections"]> = [];
  const faults: string[] = [];
  if (level === 4) {
    initialConnections = solution.filter((_, i) => i % 3 !== 0);
    const wrong = wrongPatch(scale);
    const lead = solution.find((c) => c.cableId === `lead-${wrong.route}`);
    if (lead && ports[wrong.from] && usedPorts.has(wrong.from)) {
      initialConnections = initialConnections.filter((c) => c.cableId !== lead.cableId && c.from !== wrong.from && c.to !== wrong.from);
      initialConnections.push({ cableId: lead.cableId, from: wrong.from, to: lead.to });
      faults.push(wrong.text);
    }
    faults.push("มีสายสัญญาณขาดบางช่วง: ไล่ตรวจ SOURCE → INPUT → OUTPUT → DESTINATION", "การตั้งค่ายังไม่พร้อม: Pair, Gain/Bus, Program และปลายทาง (ต้องทำใหม่หลังซ่อม)");
  }

  return {
    id: `${scale}-${level}`, venueScale: scale, level, title: LEVEL_TITLES[level - 1], layout: LAYOUT_BY_SCALE[scale],
    devices: chosenDevices, ports: chosenPorts, cables: chosenCables, requirements: selected.map(({ lv: _lv, ...r }) => { void _lv; return r; }),
    actions: selectedActions.map(({ lv: _lv, ...a }) => { void _lv; return a; }),
    job: layout.job,
    placeables: chosenDevices.filter((d) => movable.has(d.id)).map((d) => ({ id: d.id, label: d.label, start: startOf[d.id], zone: [...d.position] as Point3, zoneLabel: places[d.id]?.label, device: d })),
    canonical: solution,
    initialConnections,
    faults,
    assumptions: [
      "อุปกรณ์ GENERIC TRAINING MODEL / รุ่นอ้างอิง เป็นโปรไฟล์ฝึก ไม่ใช่รุ่นที่ยืนยันว่ามหาวิทยาลัยมีจริง",
      "OBS, wireless pairing, encoder, uplink และ ingest เป็นสถานะจำลอง ไม่มีการควบคุมโปรแกรมหรือถ่ายทอดสดจริง",
      "รูปแบบสัญญาณฝึก: 1080p50 ทุกอุปกรณ์ในระบบเดียวกัน",
      ...(scale === "s" ? ["กล้องสตูดิโอใช้โปรไฟล์ HDMI (รอตรวจพอร์ตจริง)", "RX 2TX/1RX ผสมเป็นเอาต์พุตเดียว (รอยืนยัน)", "Magewell / Samsung / HS5 เป็นรุ่นที่เลือกสำหรับฝึก"] : []),
      ...(scale === "m" ? ["Stagebox เป็น analog + multicore ที่จับคู่กัน ไม่ใช่ Dante"] : []),
      ...(scale === "l" ? ["ไม่กำหนดระยะสาย SDI ตายตัว ระยะไกลใช้ Fiber TX/RX คู่ที่ตรงกัน"] : []),
      ...(scale === "xl" ? ["Main/Backup เป็น Encoder/Uplink failover — Switcher, Embedder, DA ยังเป็นจุดเสี่ยงร่วม (Partial redundancy)", "Tally ใช้บัส Tally ร่วมของ Rack CCU (โปรไฟล์ฝึก)"] : []),
    ],
  };
}

/** The deliberate wrong patch of each venue's level 4 (the lead's source end sits on the wrong OUTPUT). */
function wrongPatch(scale: VenueScale): { route: string; from: string; text: string } {
  switch (scale) {
    case "xs": return { route: "monitor", from: "slides:hdmi-out", text: "TV ห้องเรียนถูกต่อจาก Laptop โดยตรง ไม่ได้รับ Program จากสวิตเชอร์" };
    case "s": return { route: "monitor", from: "sw:pgm-out", text: "TV ถูกต่อจาก PGM แทน MULTIVIEW — ผู้ควบคุมดูภาพทุกกล้องไม่ได้" };
    case "m": return { route: "aux-conv", from: "sw:pgm-out", text: "จอเวทีถูกต่อจาก PROGRAM SDI OUT ที่ต้องใช้กับ Recorder — ให้ใช้ AUX OUT" };
    case "l": return { route: "program-embed", from: "sw:multiview-out", text: "Embedder ได้รับ Multiview แทน Program — สตรีมจะเป็นภาพตาราง" };
    default: return { route: "program-embed", from: "sw:multiview-out", text: "Embedder ได้รับ Multiview แทน Program — Main/Backup จะส่งภาพตาราง" };
  }
}

export const VENUE_SCENARIOS = Object.fromEntries(SCALES.flatMap((scale) => ([1, 2, 3, 4, 5] as const).map((level) => { const scenario = buildVenueScenario(scale, level); return [scenario.id, scenario]; }))) as Record<`${VenueScale}-${1 | 2 | 3 | 4 | 5}`, Scenario>;
