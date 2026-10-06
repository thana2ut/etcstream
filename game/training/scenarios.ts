import { STUDIO } from "./studio-room-layout";
import * as PMX from "./pmx402d-ports.json";
import { VENUE_SCENARIOS } from "./venue-scenarios";

/**
 * Signal-flow scenarios for Studio Room 01.
 *
 * "studio-full" follows ETCSTREAM_MASTER_STUDIO_SIGNAL_FLOW.md (classroom / ห้องฝึกปราณสัญญาณ):
 *   VIDEO   Camera 1-3 → HDS7105 IN1-IN4
 *   AUDIO   Lavalier → TX (wireless) → RX → Mixer → HDS7105 LINE IN
 *   CAPTURE HDS7105 PGM → Capture Card → Computer → OBS
 *   MONITOR HDS7105 MULTIVIEW → Monitor
 * Items marked `verified: false` (camera outputs, cable types between RX/mixer/switcher,
 * monitor feed) are PROVISIONAL working hypotheses from the doc, not confirmed on site.
 *
 * "hdmi-basic" is the original two-cable vertical slice used by mission mode.
 */

export type Point3 = [number, number, number];
export type Direction = "INPUT" | "OUTPUT";
export type Connector = "HDMI" | "USB-A" | "USB-C" | "3.5mm" | "6.35mm" | "XLR" | "XLR-M" | "XLR-F" | "SDI" | "RCA" | "speakON" | "IEC" | "DisplayPort" | "DC" | "ETHERNET" | "FIBER";
export type SignalType = "VIDEO_HDMI" | "VIDEO_SDI" | "AUDIO_ANALOG" | "AUDIO_BALANCED" | "USB_DATA" | "NETWORK" | "FIBER_VIDEO";
/** Visual style of a plug end (see components/game/cable-plugs.tsx). */
export type PlugStyle = "fiber" | "ethernet" | "hdmi" | "sdi" | "xlr-m" | "xlr-f" | "trs35" | "trrs35" | "ts635" | "trs635" | "speaker635" | "rca" | "usba" | "usba3" | "usbc" | "dp" | "iec" | "dc" | "lav" | "adapter35to635" | "adapter635to35";
export type VenueScale = "xs" | "s" | "m" | "l" | "xl";
export type ScenarioId = "hdmi-basic" | "studio-full" | `${VenueScale}-${1 | 2 | 3 | 4 | 5}`;
export type PlaceableItemId = string;

export interface PortDef {
  signalType?: SignalType;
  purpose?: string;
  label: string;
  device: string;
  direction: Direction;
  connector: Connector;
  position: Point3;
  /** Port only exists once this item sits on the centre table (e.g. the placeable switcher). */
  requiresItem?: PlaceableItemId;
  /** Hit radius; small jacks sit close together on the enlarged switcher. */
  radius?: number;
}

export interface CableDef {
  signalType?: SignalType;
  purpose?: string;
  id: string;
  label: string;
  /** Catalog number from the cable reference sheet (art/reference/cables). */
  catalog?: number;
  ends: [Connector, Connector];
  plugs?: [PlugStyle, PlugStyle];
  color: string;
  start: [Point3, Point3];
  /** Adapter: end "a" is a plug, end "b" is a socket of this connector that other cables plug into. */
  socketB?: Connector;
  /** Short patch lead (drawn shorter/lighter). */
  short?: boolean;
  /** End "a" is permanently attached here (a lavalier's own lead). */
  fixedA?: string;
}

export type FlowGroup = "video" | "audio" | "capture" | "monitor";
export interface Requirement { id: string; label: string; group: FlowGroup; from: string[]; to: string[]; verified: boolean }
export interface ActionDef { id: string; label: string; doneLabel: string; group: FlowGroup; position: Point3; needs: string[]; onItem?: PlaceableItemId; source?: string }
export interface DeviceDef {
  status?: "CONFIRMED" | "PROVISIONAL" | "GENERIC TRAINING MODEL" | "UNKNOWN";
  generic?: boolean;
  id: string; label: string; model: string; verified: boolean;
  kind: "camera" | "box" | "laptop" | "bodypack" | "mic" | "mixer";
  position: Point3; size: Point3; color: string;
  /** Rotation about Y (0 = front/ports toward +Z; cameras: lens toward −Z). */
  yaw?: number;
}
/** Equipment the trainee carries from the equipment table (left) to its spot on the centre table. */
export interface PlaceableDef { id: PlaceableItemId; label: string; start: Point3; zone: Point3; device?: DeviceDef;
  /** Human name of the operating position (venue layouts), shown when the player carries the item. */
  zoneLabel?: string }
export interface Scenario {
  /** Physical venue layout (game/training/venue-layouts.ts); defaults to the studio. */
  layout?: import("./venue-layouts").LayoutId;
  /** The job the trainee is doing in this venue (HUD). */
  job?: string;
  venueScale?: VenueScale;
  level?: number;
  title?: string;
  assumptions?: string[];
  canonical?: { cableId: string; from: string; to: string }[];
  initialConnections?: { cableId: string; from: string; to: string }[];
  faults?: string[];
  id: ScenarioId;
  placeables: PlaceableDef[];
  ports: Record<string, PortDef>;
  cables: CableDef[];
  requirements: Requirement[];
  actions: ActionDef[];
  devices: DeviceDef[];
}

const add = (p: Point3, dx: number, dy: number, dz: number): Point3 => [+(p[0] + dx).toFixed(4), +(p[1] + dy).toFixed(4), +(p[2] + dz).toFixed(4)];

/* ---------------- HDS7105 on the centre-table zone ---------------- */
// Anchor positions (metres, model space) from art/blender/hds7105-manifest.json.
const HDS_ANCHORS: Record<string, Point3> = {
  IN1: [-0.0673, 0.011, -0.0545], IN2: [-0.0495, 0.011, -0.0545], IN3: [-0.0307, 0.011, -0.0545], IN4: [-0.0116, 0.011, -0.0545],
  PGM: [0.0287, 0.011, -0.0545], MULTIVIEW: [0.0086, 0.011, -0.0545], LINE_IN: [0.0721, 0.011, -0.0545],
};
function switcherPort(anchor: keyof typeof HDS_ANCHORS): Point3 {
  const [zx, zy, zz] = STUDIO.placementZones.switcher;
  const s = STUDIO.switcherModel.scale;
  const c = Math.cos(STUDIO.switcherModel.rotationY), n = Math.sin(STUDIO.switcherModel.rotationY);
  const [x, y, z] = HDS_ANCHORS[anchor];
  return [+(zx + (x * c + z * n) * s).toFixed(4), +(zy + y * s).toFixed(4), +(zz + (-x * n + z * c) * s).toFixed(4)];
}

/* ---------------- hdmi-basic (mission mode, unchanged behaviour) ---------------- */
const LEFT = STUDIO.sideTables[0];
const RIGHT = STUDIO.sideTables[1];
const SWITCHER: PlaceableDef = { id: "switcher", label: "Video Switcher DeviceWell HDS7105", start: STUDIO.placeableItems.switcher, zone: STUDIO.placementZones.switcher };
const basic: Scenario = {
  id: "hdmi-basic",
  placeables: [SWITCHER],
  ports: {
    "camera:hdmi-out": { label: "Camera HDMI OUT", device: "camera", direction: "OUTPUT", connector: "HDMI", position: STUDIO.ports["camera:hdmi-out"] },
    "switcher:hdmi-in": { label: "Video Switcher HDMI IN", device: "switcher", direction: "INPUT", connector: "HDMI", position: STUDIO.ports["switcher:hdmi-in"], requiresItem: "switcher", radius: 0.04 },
    "switcher:hdmi-out": { label: "Video Switcher HDMI OUT", device: "switcher", direction: "OUTPUT", connector: "HDMI", position: STUDIO.ports["switcher:hdmi-out"], requiresItem: "switcher", radius: 0.04 },
    "monitor:hdmi-in": { label: "Samsung TV HDMI IN 1", device: "monitor", direction: "INPUT", connector: "HDMI", position: STUDIO.ports["monitor:hdmi-in"], radius: 0.029 },
    "monitor:hdmi-in2": { label: "Samsung TV HDMI IN 2", device: "monitor", direction: "INPUT", connector: "HDMI", position: STUDIO.ports["monitor:hdmi-in2"], radius: 0.029 },
    "monitor:hdmi-in3": { label: "Samsung TV HDMI IN 3", device: "monitor", direction: "INPUT", connector: "HDMI", position: STUDIO.ports["monitor:hdmi-in3"], radius: 0.029 },
  },
  cables: [
    { id: "cable-1", label: "สาย HDMI", ends: ["HDMI", "HDMI"], color: "#e9bd6a", start: [STUDIO.cableEnds[0], STUDIO.cableEnds[1]] },
    { id: "cable-2", label: "สาย HDMI", ends: ["HDMI", "HDMI"], color: "#62dce9", start: [STUDIO.cableEnds[2], STUDIO.cableEnds[3]] },
  ],
  requirements: [
    { id: "camera-switcher", label: "Camera → Switcher", group: "video", from: ["camera:hdmi-out"], to: ["switcher:hdmi-in"], verified: true },
    { id: "switcher-monitor", label: "Switcher → Samsung TV", group: "monitor", from: ["switcher:hdmi-out"], to: ["monitor:hdmi-in", "monitor:hdmi-in2", "monitor:hdmi-in3"], verified: true },
  ],
  actions: [],
  devices: [],
};

/* ---------------- studio-full (classroom) ---------------- */
const T = STUDIO.table[1];            // centre table top height
const CAM_Z = 2.7;
// Single Panasonic HC-X2000 on its tripod, centred behind the table; position = floor under the tripod.
const cams: Point3[] = [[0, 0, CAM_Z]];
/** Video-out anchor from art/blender/hc-x2000-manifest.json (rear panel UNVERIFIED). */
const CAM_VIDEO_OUT: Point3 = [0.048, 1.3, 0.168];
const capture: Point3 = [1.3, T, 0.45];
const laptop: Point3 = [1.85, T, -0.5];
const hpVisualScale = 0.56 / 0.358;
const mixer: Point3 = [-1.2, T, 0.2];
const rx: Point3 = [-1.8, T, -0.5];
const tx1: Point3 = [-1.3, T, -1.5];
const tx2: Point3 = [-0.6, T, -1.85];
const mic: Point3 = [-0.4, T, -1.1];

const studioPorts: Record<string, PortDef> = {};
cams.forEach((c, i) => {
  studioPorts[`cam${i + 1}:video-out`] = { label: "Camera VIDEO OUT (HDMI)", device: `cam${i + 1}`, direction: "OUTPUT", connector: "HDMI", position: add(c, ...CAM_VIDEO_OUT) };
});
(["IN1", "IN2", "IN3", "IN4"] as const).forEach((a, i) => {
  studioPorts[`sw:in${i + 1}`] = { label: `HDS7105 HDMI ${a}`, device: "switcher", direction: "INPUT", connector: "HDMI", position: switcherPort(a), requiresItem: "switcher", radius: 0.04 };
});
Object.assign(studioPorts, {
  "sw:pgm": { label: "HDS7105 PGM OUT", device: "switcher", direction: "OUTPUT", connector: "HDMI", position: switcherPort("PGM"), requiresItem: "switcher", radius: 0.04 },
  "sw:multiview": { label: "HDS7105 MULTIVIEW OUT", device: "switcher", direction: "OUTPUT", connector: "HDMI", position: switcherPort("MULTIVIEW"), requiresItem: "switcher", radius: 0.04 },
  "sw:line-in": { label: "HDS7105 LINE IN (3.5 mm)", device: "switcher", direction: "INPUT", connector: "3.5mm", position: switcherPort("LINE_IN"), requiresItem: "switcher", radius: 0.02 },
  "capture:hdmi-in": { label: "Magewell HDMI IN", device: "capture", direction: "INPUT", connector: "HDMI", position: add(capture, -0.15616, 0.024, 0), requiresItem: "capture", radius: 0.04 },
  "capture:usb-out": { label: "Magewell USB 3.0 Type-A", device: "capture", direction: "OUTPUT", connector: "USB-A", position: add(capture, 0.15616, 0.024, 0), requiresItem: "capture", radius: 0.04 },
  "mic:xlr-out": { label: "Sennheiser XS 1 XLR OUTPUT", device: "mic", direction: "OUTPUT", connector: "XLR", position: add(mic, -0.108, 0.027, 0), requiresItem: "mic", radius: 0.028 },
  "pc:usb-in": { label: "HP Notebook USB-A LEFT", device: "computer", direction: "INPUT", connector: "USB-A", position: add(laptop, -0.1795 * hpVisualScale, 0.011 * hpVisualScale, -0.006 * hpVisualScale), requiresItem: "computer", radius: 0.032 },
  "pc:usb-in-right": { label: "HP Notebook USB-A RIGHT", device: "computer", direction: "INPUT", connector: "USB-A", position: add(laptop, 0.1795 * hpVisualScale, 0.011 * hpVisualScale, -0.013 * hpVisualScale), requiresItem: "computer", radius: 0.032 },
  "monitor:hdmi-in": { label: "Samsung TV HDMI IN 1", device: "monitor", direction: "INPUT", connector: "HDMI", position: STUDIO.ports["monitor:hdmi-in"], radius: 0.029 },
  "monitor:hdmi-in2": { label: "Samsung TV HDMI IN 2", device: "monitor", direction: "INPUT", connector: "HDMI", position: STUDIO.ports["monitor:hdmi-in2"], radius: 0.029 },
  "monitor:hdmi-in3": { label: "Samsung TV HDMI IN 3", device: "monitor", direction: "INPUT", connector: "HDMI", position: STUDIO.ports["monitor:hdmi-in3"], radius: 0.029 },
  // HS5 faces -X; its rear amplifier panel and both line inputs face +X.
  "speaker:xlr-in": { label: "Yamaha HS5 XLR INPUT (Balanced)", device: "speaker", direction: "INPUT", connector: "XLR", position: add(STUDIO.speaker as Point3, 0.232, 0.058, -0.138), radius: 0.045 },
  "speaker:trs-in": { label: "Yamaha HS5 6.35 mm TRS INPUT (Balanced)", device: "speaker", direction: "INPUT", connector: "6.35mm", position: add(STUDIO.speaker as Point3, 0.232, -0.022, -0.138), radius: 0.04 },
  "rx:audio-out": { label: "COMICA RX AUDIO OUTPUT (3.5 mm)", device: "rx", direction: "OUTPUT", connector: "3.5mm", position: add(rx, 0.0391, 0.275, 0), radius: 0.037, requiresItem: "rx" },
  "tx1:mic-in": { label: "COMICA TX 1 MIC INPUT (3.5 mm)", device: "tx1", direction: "INPUT", connector: "3.5mm", position: add(tx1, 0.03565, 0.26, 0), radius: 0.037, requiresItem: "tx1" },
  "tx2:mic-in": { label: "COMICA TX 2 MIC INPUT (3.5 mm)", device: "tx2", direction: "INPUT", connector: "3.5mm", position: add(tx2, 0.03565, 0.26, 0), radius: 0.037, requiresItem: "tx2" },
  // Virtual signal origins: the microphones are attached to their own leads, not to the TX cases.
  "lav1:mic": { label: "Lavalier 1", device: "lav1", direction: "OUTPUT", connector: "3.5mm", position: add(tx1, 0.3, 0.02, 0.1) },
  "lav2:mic": { label: "Lavalier 2", device: "lav2", direction: "OUTPUT", connector: "3.5mm", position: add(tx2, 0.3, 0.02, 0.1) },
} satisfies Record<string, PortDef>);
// YAMAHA PMX-402D-USB: every jack from the model (game/training/pmx402d-ports.json) is pluggable.
// Game ids: CHn_LINE → mixer:chN (receiver route), MAIN_OUT_L/R → mixer:main-l/r (switcher route).
const PMX_ID: Record<string, string> = { MAIN_OUT_L: "mixer:main-l", MAIN_OUT_R: "mixer:main-r", CH1_LINE: "mixer:ch1", CH2_LINE: "mixer:ch2", CH3_LINE: "mixer:ch3", CH4_LINE: "mixer:ch4" };
for (const [key, p] of Object.entries(PMX.ports as Record<string, { label: string; connector: string; direction: string; web: number[] }>)) {
  if (p.direction !== "INPUT" && p.direction !== "OUTPUT") continue; // power switch
  studioPorts[PMX_ID[key] ?? `mixer:${key.toLowerCase().replace(/_/g, "-")}`] = {
    label: p.label, device: "mixer", direction: p.direction, connector: p.connector as Connector,
    position: add(mixer, p.web[0], p.web[1], p.web[2]), radius: 0.022, requiresItem: "mixer",
  };
}

// Cable table (right side table): the full catalog from the reference sheet, one row each, so trainees must choose.
const cableRow = (i: number, len = 0.4): [Point3, Point3] => {
  const z = +(-2.3 + i * 0.22).toFixed(3);
  return [[RIGHT[0] - len, RIGHT[1] + 0.02, z], [RIGHT[0] + len, RIGHT[1] + 0.02, z]];
};
const adapterRow = (i: number): [Point3, Point3] => { const [a] = cableRow(i); return [a, [a[0] + 0.07, a[1], a[2]]]; };
// Equipment table (left side table): every studio device starts here, spaced along the table.
const onLeft = (dx: number, z: number): Point3 => [+(LEFT[0] + dx).toFixed(3), LEFT[1], z];
const START: Record<string, Point3> = {
  mixer: onLeft(0, -0.5), capture: onLeft(0, 0.3), computer: onLeft(0, 1.0),
  rx: onLeft(-0.45, 1.85), tx1: onLeft(-0.15, 1.85), tx2: onLeft(0.15, 1.85), mic: onLeft(0.45, 1.85),
};
type C = Connector; type P = PlugStyle;
const cable = (i: number, catalog: number, id: string, label: string, ends: [C, C], plugs: [P, P], color: string, extra: Partial<CableDef> = {}): CableDef =>
  ({ id, catalog, label, ends, plugs, color, start: extra.socketB ? adapterRow(i) : cableRow(i, extra.short ? 0.18 : 0.4), ...extra });
// Only leads that can complete a required route of this room (checked by scripts/check-usable-cables.mjs);
// Leads needed by the studio routes; the XS 1 uses a female-to-male XLR cable.
const studioCables: CableDef[] = [
  cable(0, 1, "hdmi-1", "สาย HDMI Type-A", ["HDMI", "HDMI"], ["hdmi", "hdmi"], "#1b1b1f"),
  cable(1, 1, "hdmi-2", "สาย HDMI Type-A", ["HDMI", "HDMI"], ["hdmi", "hdmi"], "#1b1b1f"),
  cable(2, 1, "hdmi-3", "สาย HDMI Type-A", ["HDMI", "HDMI"], ["hdmi", "hdmi"], "#1b1b1f"),
  cable(3, 2, "hdmi-patch", "สาย HDMI Patch สั้น", ["HDMI", "HDMI"], ["hdmi", "hdmi"], "#1b1b1f", { short: true }),
  cable(4, 5, "trs35-1", "สาย 3.5 mm TRS", ["3.5mm", "3.5mm"], ["trs35", "trs35"], "#1b1b1f"),
  cable(5, 6, "trrs35-1", "สาย 3.5 mm TRRS", ["3.5mm", "3.5mm"], ["trrs35", "trrs35"], "#1b1b1f"),
  cable(6, 7, "ts635-1", "สาย 6.35 mm TS (โมโน)", ["6.35mm", "6.35mm"], ["ts635", "ts635"], "#1b1b1f"),
  cable(7, 8, "trs635-1", "สาย 6.35 mm TRS (สเตอริโอ)", ["6.35mm", "6.35mm"], ["trs635", "trs635"], "#1b1b1f"),
  cable(8, 10, "adapter-35-635", "หัวแปลง 3.5 mm → 6.35 mm", ["6.35mm", "3.5mm"], ["adapter35to635", "adapter35to635"], "#c9a24a", { socketB: "3.5mm" }),
  cable(9, 11, "adapter-635-35", "หัวแปลง 6.35 mm → 3.5 mm", ["3.5mm", "6.35mm"], ["adapter635to35", "adapter635to35"], "#1b1b1f", { socketB: "6.35mm" }),
  cable(10, 12, "rca-35", "สาย RCA L/R → 3.5 mm", ["RCA", "3.5mm"], ["rca", "trs35"], "#1b1b1f"),
  cable(11, 15, "usb-ac", "สาย USB 3.0 Type-A ↔ Type-A", ["USB-A", "USB-A"], ["usba3", "usba3"], "#1b1b1f"),
  cable(12, 18, "speaker-trs", "สายสัญญาณ Balanced 6.35 mm TRS", ["6.35mm", "6.35mm"], ["trs635", "trs635"], "#1b1b1f"),
  cable(13, 16, "xs1-xlr", "สายไมโครโฟน XLR 3-pin", ["XLR-F", "XLR-M"], ["xlr-f", "xlr-m"], "#1b1b1f"),
  cable(14, 16, "speaker-xlr", "สายสัญญาณ Balanced XLR", ["XLR-F", "XLR-M"], ["xlr-f", "xlr-m"], "#1b1b1f"),
  { id: "lav-1", catalog: 17, label: "สายไมค์หนีบปก 1 (3.5 mm)", ends: ["3.5mm", "3.5mm"], plugs: ["lav", "trs35"], color: "#1b1b1f", start: [add(START.tx1, 0.05, 0.02, 0.1), add(START.tx1, 0.05, 0.02, 0.2)], fixedA: "lav1:mic" },
  { id: "lav-2", catalog: 17, label: "สายไมค์หนีบปก 2 (3.5 mm)", ends: ["3.5mm", "3.5mm"], plugs: ["lav", "trs35"], color: "#1b1b1f", start: [add(START.tx2, 0.05, 0.02, 0.1), add(START.tx2, 0.05, 0.02, 0.2)], fixedA: "lav2:mic" },
];

const SW_IN = ["sw:in1", "sw:in2", "sw:in3", "sw:in4"];
const studioRequirements: Requirement[] = [
  { id: "cam1", label: "Camera → Switcher", group: "video", from: ["cam1:video-out"], to: SW_IN, verified: false },
  { id: "lav1", label: "Lavalier 1 → TX 1", group: "audio", from: ["lav1:mic"], to: ["tx1:mic-in"], verified: true },
  { id: "lav2", label: "Lavalier 2 → TX 2", group: "audio", from: ["lav2:mic"], to: ["tx2:mic-in"], verified: true },
  { id: "rx-mixer", label: "Receiver → Mixer", group: "audio", from: ["rx:audio-out"], to: ["mixer:ch1", "mixer:ch2", "mixer:ch3", "mixer:ch4"], verified: false },
  { id: "xs1-mixer", label: "Sennheiser XS 1 → Audio Mixer", group: "audio", from: ["mic:xlr-out"], to: ["mixer:ch2-mic", "mixer:ch3-mic", "mixer:ch4-mic"], verified: true },
  { id: "mixer-switcher", label: "Mixer → Switcher LINE IN", group: "audio", from: ["mixer:main-l", "mixer:main-r", "mixer:rec-l", "mixer:rec-r"], to: ["sw:line-in"], verified: false },
  { id: "switcher-capture", label: "HDS7105 PGM OUT → Magewell HDMI IN", group: "capture", from: ["sw:pgm"], to: ["capture:hdmi-in"], verified: true },
  { id: "capture-pc", label: "Magewell USB 3.0 → HP Notebook", group: "capture", from: ["capture:usb-out"], to: ["pc:usb-in", "pc:usb-in-right"], verified: true },
  { id: "switcher-monitor", label: "HDS7105 MULTIVIEW หรือ PGM → Samsung TV", group: "monitor", from: ["sw:multiview", "sw:pgm"], to: ["monitor:hdmi-in", "monitor:hdmi-in2", "monitor:hdmi-in3"], verified: true },
  { id: "mixer-speaker", label: "Audio Mixer LINE OUT → Yamaha HS5", group: "monitor", from: ["mixer:main-r", "mixer:xlr-out-l", "mixer:xlr-out-r"], to: ["speaker:trs-in", "speaker:xlr-in"], verified: true },
];
const studioActions: ActionDef[] = [
  { id: "mixer-level", label: "ตั้ง Gain / Fader ของ Mixer", doneLabel: "Mixer ส่งเสียงออกแล้ว", group: "audio", position: add(mixer, PMX.main_fader_web[0], PMX.main_fader_web[1], PMX.main_fader_web[2]), needs: ["lav1", "lav2", "rx-mixer", "xs1-mixer"], onItem: "mixer" },
  { id: "obs-source", label: "เปิด OBS แล้วเลือก Capture Device", doneLabel: "OBS ได้ภาพและเสียงครบ", group: "capture", onItem: "computer", position: add(laptop, 0, 0.3, -0.05), needs: ["cam1", "lav1", "lav2", "rx-mixer", "mixer-level", "mixer-switcher", "switcher-capture", "capture-pc"] },
];
const studioDevices: DeviceDef[] = [
  ...cams.map((c, i): DeviceDef => ({ id: `cam${i + 1}`, label: "Camera", model: "Panasonic HC-X2000", verified: true, kind: "camera", position: c, size: [0.3, 1.5, 0.6], color: "#1c2330" })),
  { id: "capture", label: "Capture Card", model: "Magewell USB Capture HDMI Gen 2", verified: true, kind: "box", position: capture, size: [0.3072, 0.048, 0.1344], color: "#adafac" },
    { id: "computer", label: "Computer (OBS)", model: "HP 15.6-inch (ตามภาพอ้างอิง)", verified: true, kind: "laptop", position: laptop, size: [0.56, 0.03, 0.38], color: "#c5c8cc" },
  { id: "mixer", label: "Audio Mixer", model: "YAMAHA PMX-402D-USB", verified: true, kind: "mixer", position: mixer, size: [PMX.size_web_m[0], PMX.size_web_m[1], PMX.size_web_m[2]], color: "#1f3a6b" },
  { id: "mic", label: "Microphone", model: "Sennheiser XS 1", verified: true, kind: "mic", position: mic, size: [0.212, 0.052, 0.052], color: "#1a1a1a" },
  { id: "rx", label: "Wireless Receiver", model: "COMICA WM100 PLUS RX", verified: true, kind: "bodypack", position: rx, size: [0.17, 0.44, 0.07], color: "#15181d" },
  { id: "tx1", label: "Wireless TX 1", model: "COMICA WM100 PLUS TX 1", verified: true, kind: "bodypack", position: tx1, size: [0.155, 0.43, 0.065], color: "#15181d" },
  { id: "tx2", label: "Wireless TX 2", model: "COMICA WM100 PLUS TX 2", verified: true, kind: "bodypack", position: tx2, size: [0.155, 0.43, 0.065], color: "#15181d" },
  { id: "speaker", label: "Studio Monitor Speaker", model: "Yamaha HS5", verified: true, kind: "box", position: [STUDIO.speaker[0], 0, STUDIO.speaker[2]], size: [0.54, 0.9, 0.43], color: "#191a1c", yaw: -Math.PI / 2 },
];

const studioPlaceables: PlaceableDef[] = [
  SWITCHER,
  ...studioDevices.filter((d) => d.kind !== "camera" && d.id !== "speaker").map((d): PlaceableDef => ({ id: d.id, label: `${d.label}${d.model ? ` (${d.model})` : ""}`, start: START[d.id], zone: d.position, device: d })),
];
const studio: Scenario = { id: "studio-full", placeables: studioPlaceables, ports: studioPorts, cables: studioCables, requirements: studioRequirements, actions: studioActions, devices: studioDevices };

export const SCENARIOS: Record<ScenarioId, Scenario> = { "hdmi-basic": basic, "studio-full": studio, ...VENUE_SCENARIOS };
